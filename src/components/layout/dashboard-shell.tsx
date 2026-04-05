import { useCallback, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faChevronDown, faCircleUser, faXmark } from "@fortawesome/free-solid-svg-icons"
import { motion, useReducedMotion } from "framer-motion"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { normalizeStoredRole } from "@/routes/protected-route"
import { getMe } from "@/services/api"
import type { UserRole } from "@/types/domain"

const smoothOut: [number, number, number, number] = [0.16, 1, 0.3, 1]
const smoothIn: [number, number, number, number] = [0.4, 0, 0.2, 1]

const SIDEBAR_W = 260
const TOPBAR_H = 56

const topBelowHeader = `calc(${TOPBAR_H}px + env(safe-area-inset-top, 0px))`

export type DashboardNavLink = { to: string; label: string; end?: boolean }

/** Grouped sidebar block: heading + subsection links */
export type DashboardNavSection = {
  id: string
  title: string
  items: DashboardNavLink[]
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg py-2 pl-3 pr-2 text-[13px] font-semibold transition-colors",
    isActive ? "bg-emerald-500 text-slate-950" : "text-slate-200 hover:bg-white/10",
  ].join(" ")

function linkMatchesPath(pathname: string, item: DashboardNavLink): boolean {
  if (item.end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function sectionContainsActive(pathname: string, items: DashboardNavLink[]): boolean {
  return items.some((item) => linkMatchesPath(pathname, item))
}

function formatRoleLabel(role: string | null): string {
  if (!role) return "User"
  const map: Record<string, string> = {
    admin: "Admin",
    agent: "Agent",
    investor: "Investor",
  }
  return map[role] ?? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

type DashboardShellProps = {
  sections: DashboardNavSection[]
}

function useMediaMinMd() {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  )
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const fn = () => setWide(mq.matches)
    fn()
    mq.addEventListener("change", fn)
    return () => mq.removeEventListener("change", fn)
  }, [])
  return wide
}

function readStoredIdentity(): { username: string; role: UserRole | null } {
  return {
    username: localStorage.getItem("userUsername")?.trim() || "",
    role: (localStorage.getItem("userRole") as UserRole | null) ?? null,
  }
}

export function DashboardShell({ sections }: DashboardShellProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const isWide = useMediaMinMd()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.id, true]))
  )
  const [displayUsername, setDisplayUsername] = useState(() => readStoredIdentity().username)
  const [displayRole, setDisplayRole] = useState<UserRole | null>(() => readStoredIdentity().role)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const syncIdentity = useCallback(() => {
    const { username, role } = readStoredIdentity()
    setDisplayUsername(username)
    setDisplayRole(role)
  }, [])

  useEffect(() => {
    window.addEventListener("auth-state-changed", syncIdentity as EventListener)
    return () => window.removeEventListener("auth-state-changed", syncIdentity as EventListener)
  }, [syncIdentity])

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    getMe(token)
      .then((me) => {
        setDisplayUsername(me.username)
        const r = normalizeStoredRole(String(me.role)) ?? (me.role as UserRole)
        setDisplayRole(r)
        localStorage.setItem("userUsername", me.username)
        localStorage.setItem("userRole", r)
      })
      .catch(() => {
        syncIdentity()
      })
  }, [syncIdentity])

  useEffect(() => {
    setOpenSections((prev) => {
      let changed = false
      const next = { ...prev }
      for (const s of sections) {
        if (sectionContainsActive(pathname, s.items) && next[s.id] !== true) {
          next[s.id] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [pathname, sections])

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
  }, [])

  useEffect(() => () => clearExitTimer(), [clearExitTimer])

  const goHome = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setMobileNavOpen(false)
    const ms = prefersReducedMotion ? 0 : 420
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null
      navigate("/")
    }, ms)
  }, [exiting, navigate, prefersReducedMotion])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userUsername")
    window.dispatchEvent(new Event("auth-state-changed"))
    window.location.href = "/auth"
  }, [])

  const topInitial = prefersReducedMotion ? { y: 0, opacity: 1 } : { y: -TOPBAR_H, opacity: 0.9 }
  const topTarget =
    exiting && !prefersReducedMotion
      ? { y: -TOPBAR_H, opacity: 0 }
      : { y: 0, opacity: 1 }

  const sidebarX = (() => {
    if (exiting && !prefersReducedMotion) return -SIDEBAR_W
    if (prefersReducedMotion) {
      if (exiting) return -SIDEBAR_W
      return isWide ? 0 : mobileNavOpen ? 0 : -SIDEBAR_W
    }
    if (isWide) return 0
    return mobileNavOpen ? 0 : -SIDEBAR_W
  })()

  const sidebarOpacity =
    exiting && !prefersReducedMotion ? 0 : prefersReducedMotion && exiting ? 0 : 1

  const transitionIn = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.48, ease: smoothOut }

  const transitionOut = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: smoothIn }

  const profileName = displayUsername || "Account"
  const profileRole = formatRoleLabel(displayRole)

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-slate-950 text-white">
      <motion.header
        className="z-40 flex min-h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#0a2245]/96 pt-[env(safe-area-inset-top,0px)] backdrop-blur pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] sm:gap-3 sm:pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pr-[max(1rem,env(safe-area-inset-right,0px))]"
        initial={topInitial}
        animate={topTarget}
        transition={exiting ? transitionOut : transitionIn}
      >
        <button
          type="button"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileNavOpen}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 text-white md:hidden"
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          <FontAwesomeIcon icon={mobileNavOpen ? faXmark : faBars} className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Back to home"
          onClick={goHome}
          className="flex min-w-0 max-w-[min(100%,220px)] flex-1 items-center gap-2 rounded-xl border border-transparent py-1 text-left transition-colors hover:border-white/10 hover:bg-white/5 sm:max-w-none sm:flex-none md:gap-2.5"
        >
          <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[#f58e43] bg-[#071a36] sm:h-10 sm:w-10" aria-hidden>
            <img src="/navlogo.jpg" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0 leading-tight">
            <span
              className="block truncate text-base font-normal uppercase tracking-[0.06em] text-white sm:text-[1.05rem]"
              style={{ fontFamily: '"Libre Franklin", system-ui, sans-serif' }}
            >
              EUROSTAR
            </span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-[0.65rem]">
              Back to home
            </span>
          </span>
        </button>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <NavLink
            to="/listings"
            className="inline-flex shrink-0 rounded-full px-2 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10 sm:px-3 sm:text-sm"
          >
            Listings
          </NavLink>

          <NavLink
            to="/profile"
            className="flex max-w-[min(100%,120px)] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-1 pl-1.5 pr-2 transition-colors hover:border-white/25 hover:bg-white/10 min-[400px]:max-w-[150px] sm:max-w-[220px] sm:gap-2 sm:pl-2 sm:pr-3"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f58e43]/20 text-[#f58e43]">
              <FontAwesomeIcon icon={faCircleUser} className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight text-left">
              <span className="truncate text-xs font-semibold text-white sm:text-sm">{profileName}</span>
              <span className="hidden min-[400px]:block truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {profileRole}
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-full bg-[#f58e43] px-2.5 py-2 text-xs font-semibold text-slate-950 hover:bg-[#ff9b4f] sm:px-4 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </motion.header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {mobileNavOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-x-0 bottom-0 z-30 bg-black/50 md:hidden"
            style={{ top: topBelowHeader }}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <motion.aside
          className="fixed bottom-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/10 bg-[#071a36] pl-[env(safe-area-inset-left,0px)] shadow-[8px_0_32px_rgba(0,0,0,0.35)] md:relative md:z-0 md:h-full md:min-h-0 md:pl-0 md:shadow-none"
          style={{ top: isWide ? undefined : topBelowHeader }}
          initial={prefersReducedMotion ? false : { x: -SIDEBAR_W, opacity: 0.96 }}
          animate={{ x: sidebarX, opacity: sidebarOpacity }}
          transition={exiting ? transitionOut : transitionIn}
        >
          <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6 pt-4">
            <nav className="flex flex-col gap-3" aria-label="Dashboard">
              {sections.map((section) => {
                const isOpen = openSections[section.id] !== false
                const panelId = `dash-nav-${section.id}`
                return (
                  <div key={section.id} className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      id={`${panelId}-trigger`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-400"
                      onClick={() =>
                        setOpenSections((p) => ({
                          ...p,
                          [section.id]: !isOpen,
                        }))
                      }
                    >
                      <span>{section.title}</span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`h-3 w-3 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {isOpen ? (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={`${panelId}-trigger`}
                        className="ml-1 flex flex-col gap-0.5 border-l border-white/10 pl-2"
                      >
                        {section.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setMobileNavOpen(false)}
                            className={linkClass}
                          >
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </nav>
          </div>
        </motion.aside>

        <main className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto px-3 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 md:py-10 md:pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
