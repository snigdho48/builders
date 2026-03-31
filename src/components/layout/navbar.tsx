import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faInstagram, faPinterestP, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { faBars, faCartShopping, faHouse, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { Link, NavLink } from "react-router-dom"

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "Listings" },
  { to: "/contact", label: "Contact" },
]

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("accessToken"))
  )

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("accessToken")))
    }

    window.addEventListener("storage", syncAuthState)
    window.addEventListener("focus", syncAuthState)
    window.addEventListener("auth-state-changed", syncAuthState as EventListener)

    return () => {
      window.removeEventListener("storage", syncAuthState)
      window.removeEventListener("focus", syncAuthState)
      window.removeEventListener("auth-state-changed", syncAuthState as EventListener)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userRole")
    window.dispatchEvent(new Event("auth-state-changed"))
    window.location.href = "/auth"
  }

  const links = isLoggedIn
    ? [...publicLinks, { to: "/dashboard", label: "Dashboard" }, { to: "/profile", label: "Profile" }]
    : publicLinks

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a2245]/96 backdrop-blur">
      <div className="border-b border-white/10">
        <div className="flex w-full items-center justify-between px-3 py-2 text-xs text-slate-200 sm:px-4">
          <span />
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link to="/auth" className="font-semibold text-white">
                  Sign in
                </Link>
                <span className="text-slate-300">or</span>
                <Link to="/register" className="font-semibold text-white">
                  Register
                </Link>
              </>
            ) : (
              <span className="font-semibold text-emerald-300">Welcome back</span>
            )}
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faFacebookF} />
            </span>
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faXTwitter} />
            </span>
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faInstagram} />
            </span>
            <span className="text-slate-400">
              <FontAwesomeIcon icon={faPinterestP} />
            </span>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between px-3 py-3.5 sm:px-4">
        <Link to="/" className="flex items-center gap-3 text-white">
          <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-[#f58e43] text-lg text-[#f58e43]">
            <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-[2.6rem] font-bold tracking-[0.01em]">HOMIRX</span>
            <span className="block text-[0.82rem] font-semibold uppercase tracking-[0.03em] text-slate-200/95">
              Living Solutions
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] font-semibold text-slate-300 lg:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "text-[#f58e43]" : "transition hover:text-white"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-300">
          <button
            aria-label="menu"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <button
            aria-label="cart"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white"
          >
            <FontAwesomeIcon icon={faCartShopping} />
          </button>
          <button
            aria-label="search"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <Link
            to="/listings"
            className="inline-flex h-12 items-center rounded-full border border-lime-300/60 px-7 font-semibold text-lime-300"
          >
            Add Properties
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#f58e43] px-5 py-2.5 font-medium text-slate-950 transition hover:bg-[#ff9b4f]"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
