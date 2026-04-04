import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { getMe, login } from "@/services/api"

function safeInternalNext(raw: string | null): string | null {
  if (!raw) {
    return null
  }
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return null
  }
  if (raw.includes("://")) {
    return null
  }
  return raw
}

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("reason") === "session-expired") {
      const timeoutId = window.setTimeout(() => {
        showToast("Session expired. Please login again.", "error")
        navigate("/auth", { replace: true })
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [location.search, navigate, showToast])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("Signing in...")

    try {
      const data = await login(username, password)
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      if (data.role) {
        localStorage.setItem("userRole", data.role)
      }
      const me = await getMe(data.access)
      localStorage.setItem("userRole", me.role)
      localStorage.setItem("userId", String(me.id))
      localStorage.setItem("userUsername", me.username)
      window.dispatchEvent(new Event("auth-state-changed"))
      setMessage("Login successful. Redirecting...")
      showToast("Login successful", "success")
      const next = safeInternalNext(new URLSearchParams(location.search).get("next"))
      navigate(next ?? "/dashboard", { replace: true })
    } catch (error) {
      const err = error instanceof Error ? error.message : "Login failed"
      setMessage(err)
      showToast(err, "error")
    }
  }

  return (
    <main className="bg-slate-950 px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Authentication</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <form onSubmit={handleLogin} className="mt-6 grid gap-3">
          <input
            className="template-input"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            className="template-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          New investor?{" "}
          <Link to="/register" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Create account
          </Link>
        </p>
        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </div>
    </main>
  )
}
