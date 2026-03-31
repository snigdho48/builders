import { useEffect, useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faInstagram, faPinterestP, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { faBars, faCartShopping, faHouse, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons"
import { Link, NavLink, useLocation } from "react-router-dom"

import { useCart } from "@/contexts/use-cart"
import type { UserRole } from "@/types/domain"

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "Listings" },
  { to: "/contact", label: "Contact" },
]

const PROPERTY_MANAGER_ROLES: UserRole[] = ["admin", "superadmin", "representative"]

function readUserRole(): UserRole | null {
  const raw = localStorage.getItem("userRole")
  return raw ? (raw as UserRole) : null
}

function addPropertiesPath(role: UserRole | null): string {
  if (role === "representative") {
    return "/dashboard/representative"
  }
  if (role === "admin" || role === "superadmin") {
    return "/dashboard/admin"
  }
  return "/dashboard"
}

export function Navbar() {
  const location = useLocation()
  const { totalBlockCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("accessToken"))
  )
  const [userRole, setUserRole] = useState<UserRole | null>(() => readUserRole())

  const syncAuthState = () => {
    setIsLoggedIn(Boolean(localStorage.getItem("accessToken")))
    setUserRole(readUserRole())
  }

  useEffect(() => {
    window.addEventListener("storage", syncAuthState)
    window.addEventListener("focus", syncAuthState)
    window.addEventListener("auth-state-changed", syncAuthState as EventListener)

    return () => {
      window.removeEventListener("storage", syncAuthState)
      window.removeEventListener("focus", syncAuthState)
      window.removeEventListener("auth-state-changed", syncAuthState as EventListener)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  const canShowAddProperties = useMemo(() => {
    if (!isLoggedIn || !userRole) {
      return false
    }
    return PROPERTY_MANAGER_ROLES.includes(userRole)
  }, [isLoggedIn, userRole])

  const addPropertiesHref = addPropertiesPath(userRole)

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
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
      <div className="relative">
        <div className="flex w-full items-center justify-between px-3 py-3.5 sm:px-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-white transition-[filter] duration-300 hover:brightness-110 motion-reduce:transition-none"
          >
            <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-[#f58e43] text-lg text-[#f58e43] transition-[transform,box-shadow] duration-300 ease-out hover:scale-105 hover:shadow-[0_0_24px_rgb(245_142_67/35%)] motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none">
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[2.6rem] font-bold tracking-[0.01em]">HOMIRX</span>
              <span className="block text-[0.82rem] font-semibold uppercase tracking-[0.03em] text-slate-200/95">
                Living Solutions
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-slate-300 lg:flex" aria-label="Main">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "relative py-1 transition-colors duration-200 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[#f58e43] after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none",
                    isActive
                      ? "text-[#f58e43] after:scale-x-100"
                      : "text-slate-300 hover:text-white hover:after:scale-x-75",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-300">
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition-[transform,border-color,background-color] duration-200 hover:scale-105 hover:border-white/60 hover:bg-white/10 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 lg:hidden"
            >
              <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="h-5 w-5" />
            </button>
            <Link
              to="/cart"
              aria-label="cart"
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition-[transform,border-color,background-color] duration-200 hover:scale-105 hover:border-[#f58e43]/50 hover:bg-[#f58e43]/10 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <FontAwesomeIcon icon={faCartShopping} />
              {totalBlockCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f58e43] px-1 text-[0.65rem] font-bold text-slate-950">
                  {totalBlockCount > 99 ? "99+" : totalBlockCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              aria-label="search"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition-[transform,border-color,background-color] duration-200 hover:scale-105 hover:border-white/60 hover:bg-white/10 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
            {canShowAddProperties ? (
              <Link
                to={addPropertiesHref}
                className="hidden h-12 items-center rounded-full border border-lime-300/60 px-7 font-semibold text-lime-300 transition-[transform,box-shadow,background-color,border-color] duration-300 hover:border-lime-200/80 hover:bg-lime-300/10 hover:shadow-[0_0_28px_rgb(190_242_100/22%)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:shadow-none lg:inline-flex"
              >
                Add Properties
              </Link>
            ) : null}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-alive hidden rounded-full bg-[#f58e43] px-5 py-2.5 font-medium text-slate-950 hover:bg-[#ff9b4f] sm:inline-block"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>

        {mobileOpen ? (
          <nav
            id="mobile-nav-menu"
            className="absolute left-0 right-0 top-full border-t border-white/15 bg-[#071a36]/98 px-3 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-md lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1">
              {links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                      isActive ? "bg-white/10 text-[#f58e43]" : "text-slate-200 hover:bg-white/5 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-white"
              >
                Cart{totalBlockCount > 0 ? ` (${totalBlockCount})` : ""}
              </Link>
              {canShowAddProperties ? (
                <Link
                  to={addPropertiesHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-lime-300/40 px-3 py-3 text-sm font-semibold text-lime-300 hover:bg-lime-300/10"
                >
                  Add Properties
                </Link>
              ) : null}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                  className="mt-1 rounded-xl bg-[#f58e43] px-3 py-3 text-left text-sm font-semibold text-slate-950"
                >
                  Logout
                </button>
              ) : (
                <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
