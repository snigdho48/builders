import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getMe, postKycRequest } from "@/services/api"
import type { InvestorKycStatus, MeResponse } from "@/types/domain"

function statusLabel(s: InvestorKycStatus | string | undefined): string {
  if (s === "approved") return "Verified"
  if (s === "rejected") return "Rejected"
  return "Pending review"
}

/**
 * KYC status + request form for the investor dashboard (dark shell).
 * Loads its own `/auth/me/` data so it still appears if dashboard metrics fail.
 */
export function InvestorKycPanel() {
  const { showToast } = useToast()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setLoading(false)
      return
    }
    getMe(token)
      .then((d) => {
        setMe(d)
        setMessage(d.kyc_investor_notes ?? "")
      })
      .catch(() => {
        setMe(null)
        showToast("Could not load account details.", "error")
      })
      .finally(() => setLoading(false))
  }, [showToast])

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
        Loading identity verification…
      </div>
    )
  }

  if (!me || normalizeStoredRole(me.role) !== "investor") {
    return null
  }

  const kyc = (me.kyc_status ?? "pending") as InvestorKycStatus
  const requestedAt = me.kyc_requested_at ?? ""

  const banner =
    kyc === "approved" ? (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        <strong className="font-semibold">KYC verified.</strong>{" "}
        <span className="text-emerald-200/90">Your account has been verified by our team.</span>
        {me.kyc_verified_at ? (
          <span className="mt-2 block text-xs text-emerald-200/70">Verified on {me.kyc_verified_at.slice(0, 10)}</span>
        ) : null}
      </div>
    ) : kyc === "rejected" ? (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
        <strong className="font-semibold">KYC needs attention.</strong>{" "}
        <span className="text-rose-200/90">
          Contact support if needed, or send a new verification request using the form below.
        </span>
      </div>
    ) : (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <strong className="font-semibold text-white">KYC: {statusLabel(kyc)}.</strong>{" "}
        Submit a request below (optional note). Staff complete verification — you can still browse and book land.
        {requestedAt ? (
          <span className="mt-2 block text-xs text-slate-400">Last request: {requestedAt.slice(0, 10)}</span>
        ) : null}
      </div>
    )

  async function submitRequest() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      showToast("Please sign in again.", "error")
      return
    }
    setBusy(true)
    try {
      const updated = await postKycRequest(token, { message: message.trim() })
      setMe(updated)
      setMessage(updated.kyc_investor_notes ?? "")
      showToast("KYC request sent.", "success")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Request failed", "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5" aria-labelledby="inv-kyc-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="inv-kyc-heading" className="text-lg font-semibold text-white">
            Identity verification (KYC)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Status: <span className="font-semibold text-slate-200">{statusLabel(kyc)}</span>
          </p>
        </div>
        <Link
          to="/profile"
          className="shrink-0 text-xs font-semibold text-[#f58e43] hover:underline"
        >
          Full profile & settings →
        </Link>
      </div>
      {banner}
      {kyc !== "approved" ? (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <label className="text-xs font-medium text-slate-400" htmlFor="dash-kyc-msg">
            Message for our team (optional)
          </label>
          <textarea
            id="dash-kyc-msg"
            className="min-h-[88px] w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#f58e43]/50 focus:outline-none focus:ring-1 focus:ring-[#f58e43]/40"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Ready to verify by call, or ID sent to your inbox…"
            maxLength={2000}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitRequest()}
            className="w-full rounded-xl bg-[#f58e43] py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#ff9b4f] disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {busy ? "Sending…" : "Request KYC verification"}
          </button>
        </div>
      ) : null}
    </section>
  )
}
