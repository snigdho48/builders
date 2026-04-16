import { useCallback, useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { listP2pBidsIncoming, patchP2pBidStatus } from "@/services/api"
import type { P2PBidIncoming } from "@/types/domain"

export function InvestorP2pOffersPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<P2PBidIncoming[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listP2pBidsIncoming(token)
      setRows(list)
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load offers", "error")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  async function setStatus(id: number, status: "accepted" | "declined") {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(id)
    try {
      await patchP2pBidStatus(id, status, token)
      showToast(status === "accepted" ? "Marked as accepted." : "Offer declined.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Update failed", "error")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Offers on my P2P listings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Bids from other investors. Contact them using the details below to complete your sale outside this form if you
          agree.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No bids yet on your listings.</p>
        ) : (
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Listing</th>
                <th className="px-3 py-2">Bidder</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Offer</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-2 text-slate-900">{r.listing_title}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <div className="font-medium">{r.buyer_full_name}</div>
                    <div className="text-xs text-slate-500">@{r.buyer_username}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    <div>{r.buyer_email || "—"}</div>
                    <div>{r.buyer_phone || "—"}</div>
                  </td>
                  <td className="px-3 py-2 font-semibold text-[#f58e43]">{r.bid_price}</td>
                  <td className="max-w-[220px] px-3 py-2 text-xs text-slate-500 wrap-break-word">{r.message || "—"}</td>
                  <td className="px-3 py-2 capitalize text-slate-300">{r.status}</td>
                  <td className="px-3 py-2 text-right">
                    {r.status === "pending" ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          className="text-xs font-semibold text-emerald-400 hover:underline disabled:opacity-50"
                          onClick={() => void setStatus(r.id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          className="text-xs font-semibold text-rose-400 hover:underline disabled:opacity-50"
                          onClick={() => void setStatus(r.id, "declined")}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
