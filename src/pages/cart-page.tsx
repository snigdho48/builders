import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"

import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/use-cart"
import { createInvestment } from "@/services/api"

export function CartPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, updateLine, removeItem, clear, lineSubtotal, cartSubtotal, syncWithServer } = useCart()
  const [referralCode, setReferralCode] = useState("")
  const [checkoutBusy, setCheckoutBusy] = useState(false)

  async function handleCheckoutAll() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      navigate(`/auth?next=${encodeURIComponent("/cart")}`)
      return
    }
    setCheckoutBusy(true)
    try {
      const fresh = await syncWithServer()
      if (fresh.length === 0) {
        showToast("Nothing left in cart after refresh — items may have sold out.", "error")
        return
      }
      const outcomes = await Promise.allSettled(
        fresh.map((line) => {
          const referral_code_used = referralCode.trim() || undefined
          const common = {
            property: line.propertyId,
            type: line.investment_type,
            duration_years: line.duration_years,
            referral_code_used,
          }
          if (line.land_sale_mode === "fractional_share") {
            return createInvestment(
              { ...common, blocks_owned: 0, shares_owned: line.shares_owned },
              token
            )
          }
          if (line.land_sale_mode === "whole_land") {
            return createInvestment({ ...common, blocks_owned: 1 }, token)
          }
          return createInvestment({ ...common, blocks_owned: line.blocks_owned }, token)
        })
      )
      const succeeded: number[] = []
      const failed: string[] = []
      outcomes.forEach((outcome, i) => {
        const line = fresh[i]
        if (outcome.status === "fulfilled") {
          succeeded.push(line.propertyId)
        } else {
          const msg =
            outcome.reason instanceof Error ? outcome.reason.message : "Investment failed"
          failed.push(`${line.title}: ${msg}`)
        }
      })
      succeeded.forEach((id) => removeItem(id))
      if (succeeded.length > 0) {
        showToast(
          succeeded.length === fresh.length
            ? "Checkout complete — see your dashboard."
            : `Placed ${succeeded.length} of ${fresh.length}. Fix remaining items or remove them.`,
          "success"
        )
      }
      if (failed.length > 0) {
        showToast(
          succeeded.length === 0 ? (failed[0] ?? "Checkout failed.") : failed.slice(0, 2).join(" · "),
          "error"
        )
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout failed."
      showToast(msg, "error")
    } finally {
      setCheckoutBusy(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="bg-[#f6f7fb] px-4 py-16 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[#0b1f44]">Your cart is empty</h1>
          <p className="mt-2 text-slate-600">Browse listings and add properties you want to invest in.</p>
          <Link
            to="/listings"
            className="mt-6 inline-flex rounded-full bg-[#f58e43] px-6 py-3 font-semibold text-slate-950 hover:bg-[#ff9b4f]"
          >
            Browse properties
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f6f7fb] px-4 py-12 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#f58e43]">Cart</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#0b1f44]">Selected properties</h1>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            Clear cart
          </button>
        </div>

        <ul className="space-y-4">
          {items.map((line) => (
            <li
              key={line.propertyId}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <img
                src={line.top_view_image || "https://placehold.co/120x80"}
                alt=""
                className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/properties/${line.propertyId}`}
                  className="text-lg font-semibold text-[#0b1f44] hover:text-[#f58e43]"
                >
                  {line.title}
                </Link>
                <p className="text-sm text-slate-500">{line.location_name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Plan: {line.investment_type === "installment" ? "Installment" : "Direct buy"}
                  {line.investment_type === "installment" && line.duration_years
                    ? ` · ${line.duration_years} yr`
                    : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {line.land_sale_mode === "fractional_share" ? (
                    <>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        Shares
                        <input
                          type="number"
                          min={line.min_shares_per_order}
                          max={line.available_shares ?? undefined}
                          value={line.shares_owned}
                          onChange={(e) =>
                            updateLine(line.propertyId, { shares_owned: Number(e.target.value) })
                          }
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-slate-900"
                        />
                      </label>
                      <span className="text-sm text-slate-500">
                        ${line.share_price ?? "0"} / share · {line.available_shares ?? 0} available
                      </span>
                    </>
                  ) : line.land_sale_mode === "whole_land" ? (
                    <span className="text-sm text-slate-500">Whole land (single checkout)</span>
                  ) : (
                    <>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        Blocks
                        <input
                          type="number"
                          min={1}
                          max={line.available_blocks}
                          value={line.blocks_owned}
                          onChange={(e) =>
                            updateLine(line.propertyId, { blocks_owned: Number(e.target.value) })
                          }
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-slate-900"
                        />
                      </label>
                      <span className="text-sm text-slate-500">
                        ${line.price_per_block} / block · {line.available_blocks} available
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <p className="text-lg font-semibold text-[#f58e43]">
                  ${lineSubtotal(line).toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/properties/${line.propertyId}`}
                    className="rounded-full border border-[#f58e43] px-4 py-2 text-sm font-medium text-[#f58e43] hover:bg-[#fff7f1]"
                  >
                    Invest on page
                  </Link>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => removeItem(line.propertyId)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium text-slate-700">Estimated total</span>
            <span className="text-2xl font-semibold text-[#0b1f44]">${cartSubtotal.toFixed(2)}</span>
          </div>
          <label className="mt-4 block text-sm text-slate-600">
            Referral code (optional, applies to all items)
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
              placeholder="Code"
              autoComplete="off"
            />
          </label>
          <p className="mt-3 text-sm text-slate-500">
            Checkout creates one investment per property with your block counts and plan choices. Sign in if prompted.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={checkoutBusy}
              onClick={() => void handleCheckoutAll()}
              className="inline-flex rounded-full bg-[#f58e43] px-6 py-3 font-semibold text-slate-950 hover:bg-[#ff9b4f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutBusy ? "Processing…" : "Checkout all"}
            </button>
            <Link
              to="/listings"
              className="inline-flex items-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-[#0b1f44] hover:border-[#f58e43]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
