import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { register } from "@/services/api"

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refFromUrl = searchParams.get("ref")?.trim() ?? ""
  const { showToast } = useToast()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("Creating your investor account...")

    try {
      await register({
        username,
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
        ref: refFromUrl || undefined,
      })
      showToast("Registration successful. Please login.", "success")
      setMessage("Registration successful. Redirecting to sign in...")
      window.setTimeout(() => {
        navigate("/auth")
      }, 600)
    } catch (error) {
      const err = error instanceof Error ? error.message : "Registration failed"
      setMessage(err)
      showToast(err, "error")
    }
  }

  return (
    <main className="bg-slate-950 px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Authentication</p>
        <h1 className="mt-2 text-3xl font-semibold">Register (Investor)</h1>
        <p className="mt-2 text-sm text-slate-300">
          Self registration is enabled for investor role only.
          {refFromUrl ? (
            <span className="mt-1 block text-emerald-200/90">Referral code from link will be applied.</span>
          ) : null}
        </p>
        <form onSubmit={handleRegister} className="mt-6 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="template-input"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              className="template-input"
              placeholder="Last name (optional)"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <input
            className="template-input"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <input
            className="template-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="template-input"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <input
            className="template-input"
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/auth" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </p>
        {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
      </div>
    </main>
  )
}
