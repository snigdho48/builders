import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { requestPasswordReset } from "@/services/api"

export function ForgotPasswordPage() {
  const { showToast } = useToast()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) {
      showToast("Enter your email address.", "error")
      return
    }
    setSending(true)
    setMessage("Sending…")
    try {
      await requestPasswordReset(email.trim())
      setMessage("If an account exists for that email, you will receive reset instructions shortly.")
      showToast("Request received", "success")
    } catch (err) {
      const m = err instanceof Error ? err.message : "Request failed"
      setMessage(m)
      showToast(m, "error")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="bg-white py-16 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(4rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <div className="mx-auto min-w-0 max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Authentication</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter the email associated with your account. We will send you a link to reset your password.
        </p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input
            className="template-input"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send reset link"}
          </button>
        </form>
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
