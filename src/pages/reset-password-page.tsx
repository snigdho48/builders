import { useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { confirmPasswordReset } from "@/services/api"

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const uid = searchParams.get("uid") ?? ""
  const token = searchParams.get("token") ?? ""

  const linkOk = useMemo(() => uid.length > 0 && token.length > 0, [uid, token])

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [working, setWorking] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!linkOk) {
      showToast("Invalid reset link. Request a new one from Forgot password.", "error")
      return
    }
    if (password.length < 8) {
      showToast("Use at least 8 characters.", "error")
      return
    }
    if (password !== confirm) {
      showToast("Passwords do not match.", "error")
      return
    }
    setWorking(true)
    setMessage("Updating password…")
    try {
      await confirmPasswordReset({ uid, token, new_password: password })
      setMessage("Password updated. Redirecting to sign in…")
      showToast("Password updated", "success")
      window.setTimeout(() => navigate("/auth", { replace: true }), 1200)
    } catch (err) {
      const m = err instanceof Error ? err.message : "Could not reset password"
      setMessage(m)
      showToast(m, "error")
    } finally {
      setWorking(false)
    }
  }

  return (
    <main className="bg-white py-16 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(4rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <div className="mx-auto min-w-0 max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Authentication</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Set new password</h1>
        {!linkOk ? (
          <p className="mt-4 text-sm text-amber-200">
            This link is missing required parameters. Open the reset link from your email, or{" "}
            <Link to="/auth/forgot-password" className="font-semibold text-emerald-300 underline">
              request a new reset
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <input
              className="template-input"
              type="password"
              autoComplete="new-password"
              placeholder="New password (min 8 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              className="template-input"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
            <button
              type="submit"
              disabled={working}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {working ? "Saving…" : "Save password"}
            </button>
          </form>
        )}
        <p className="mt-4 text-sm">
          <Link to="/auth" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Back to sign in
          </Link>
        </p>
        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </div>
    </main>
  )
}
