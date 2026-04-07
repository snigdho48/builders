import { useEffect, useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faInstagram, faPinterestP, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { faBars, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"

import { useLanguage } from "@/i18n/language-context"
import { normalizeStoredRole } from "@/routes/protected-route"
import type { UserRole } from "@/types/domain"

const publicLinks = [
  { to: "/", key: "nav.home", fallback: "Home" },
  { to: "/listings", key: "nav.listings", fallback: "Listings" },
  { to: "/p2p", key: "nav.p2p", fallback: "P2P" },
  { to: "/about", key: "nav.about", fallback: "About" },
  { to: "/contact", key: "nav.contact", fallback: "Contact" },
]

function readUserRole(): UserRole | null {
  return normalizeStoredRole(localStorage.getItem("userRole"))
}

function addPropertiesPath(role: UserRole | null): string {
  if (role === "admin") {
    return "/dashboard/admin/properties"
  }
  if (role === "agent") {
    return "/dashboard/agent/properties"
  }
  return "/dashboard"
}

export function Navbar() {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
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
    const t = window.setTimeout(() => {
      setMobileOpen(false)
      setSearchOpen(false)
    }, 0)
    return () => window.clearTimeout(t)
  }, [location.pathname, location.search])

  const canShowAddProperties = useMemo(() => {
    if (!isLoggedIn || !userRole) {
      return false
    }
    return userRole === "admin" || userRole === "agent"
  }, [isLoggedIn, userRole])

  const addPropertiesHref = addPropertiesPath(userRole)

  const submitNavSearch = () => {
    const q = searchText.trim()
    navigate(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings")
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userUsername")
    window.dispatchEvent(new Event("auth-state-changed"))
    window.location.href = "/auth"
  }

  const links = isLoggedIn
    ? [
        ...publicLinks,
        { to: "/dashboard", key: "nav.dashboard", fallback: "Dashboard" },
        { to: "/profile", key: "nav.profile", fallback: "Profile" },
      ]
    : publicLinks

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a2245]/96 pt-[env(safe-area-inset-top,0px)] backdrop-blur">
      <div className="border-b border-white/5">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 py-2 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] text-xs text-slate-200 sm:gap-x-4 sm:pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pr-[max(1rem,env(safe-area-inset-right,0px))]">
            {!isLoggedIn ? (
              <>
                <Link to="/auth" className="font-semibold text-white">
                  {t("nav.signIn", "Sign in")}
                </Link>
                <span className="text-slate-300">{t("nav.or", "or")}</span>
                <Link to="/register" className="font-semibold text-white">
                  {t("nav.register", "Register")}
                </Link>
              </>
            ) : (
              <span className="font-semibold text-emerald-300">{t("nav.welcomeBack", "Welcome back")}</span>
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
      <div className="relative">
        <div className="flex w-full min-w-0 items-center justify-between gap-2 py-3.5 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:gap-3 sm:pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pr-[max(1rem,env(safe-area-inset-right,0px))]">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 text-white transition-[filter] duration-300 hover:brightness-110 motion-reduce:transition-none sm:gap-3"
          >
            <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#f58e43] bg-[#071a36] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,box-shadow] duration-300 ease-out hover:scale-105 hover:shadow-[0_0_24px_rgb(245_142_67/35%)] motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none sm:h-[52px] sm:w-[52px]">
              <img
                src="/navlogo.jpg"
                alt="Eurostar"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span
                className="block text-[clamp(1.2rem,5.2vw+0.35rem,2.35rem)] font-normal uppercase tracking-[0.06em]"
                style={{ fontFamily: "\"Libre Franklin\", system-ui, sans-serif" }}
              >
                EUROSTAR
              </span>
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.03em] text-slate-200/95 sm:text-[0.82rem]">
              Group
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
                {t(item.key, item.fallback)}
              </NavLink>
            ))}
          </nav>
          <div className="relative flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-slate-300 sm:gap-2.5">
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
            <button
              type="button"
              aria-label={searchOpen ? "Search listings" : "Open search"}
              aria-expanded={searchOpen}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition-[transform,border-color,background-color] duration-200 hover:scale-105 hover:border-white/60 hover:bg-white/10 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
              onClick={() => {
                if (searchOpen) {
                  submitNavSearch()
                } else {
                  if (location.pathname === "/listings") {
                    const q = new URLSearchParams(location.search).get("q") ?? ""
                    setSearchText(q)
                  }
                  setSearchOpen(true)
                }
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
            {canShowAddProperties ? (
              <Link
                to={addPropertiesHref}
                className="hidden h-12 items-center rounded-full border border-lime-300/60 px-7 font-semibold text-lime-300 transition-[transform,box-shadow,background-color,border-color] duration-300 hover:border-lime-200/80 hover:bg-lime-300/10 hover:shadow-[0_0_28px_rgb(190_242_100/22%)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:shadow-none lg:inline-flex"
              >
                {t("nav.landDashboard", "Land dashboard")}
              </Link>
            ) : null}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-alive hidden rounded-full bg-[#f58e43] px-5 py-2.5 font-medium text-slate-950 hover:bg-[#ff9b4f] sm:inline-block"
              >
                {t("nav.logout", "Logout")}
              </button>
            ) : null}
          </div>
        </div>

        {searchOpen ? (
          <div
            className="border-t border-white/10 bg-[#071a36]/95 backdrop-blur-md"
            role="search"
            aria-label="Site search"
          >
            <div className="flex w-full min-w-0 items-stretch gap-2 px-[max(0.75rem,env(safe-area-inset-left,0px))] py-3 pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:gap-3 sm:px-4 sm:pr-4">
              <label htmlFor="nav-site-search" className="sr-only">
                Search listings by title or location
              </label>
              <input
                id="nav-site-search"
                className="template-input h-12 min-h-12 min-w-0 flex-1 rounded-xl border-white/15 py-0 pl-4 pr-4 text-sm text-white placeholder:text-slate-400"
                placeholder="Search by title or location"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNavSearch()
                  if (e.key === "Escape") setSearchOpen(false)
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={submitNavSearch}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[#f58e43] px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#ff9b4f] sm:px-7"
              >
                {t("nav.search", "Search")}
              </button>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-[border-color,background-color] duration-200 hover:border-white/60 hover:bg-white/10"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}

        {mobileOpen ? (
          <nav
            id="mobile-nav-menu"
            className="absolute left-0 right-0 top-full border-t border-white/15 bg-[#071a36]/98 px-[max(0.75rem,env(safe-area-inset-left,0px))] py-4 pr-[max(0.75rem,env(safe-area-inset-right,0px))] shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-md lg:hidden"
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
                  {t(item.key, item.fallback)}
                </NavLink>
              ))}
              {canShowAddProperties ? (
                <Link
                  to={addPropertiesHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-lime-300/40 px-3 py-3 text-sm font-semibold text-lime-300 hover:bg-lime-300/10"
                >
                  {t("nav.landDashboard", "Land dashboard")}
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
                  {t("nav.logout", "Logout")}
                </button>
              ) : (
                <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    {t("nav.signIn", "Sign in")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    {t("nav.register", "Register")}
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
