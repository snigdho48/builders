import { NavLink, Outlet } from "react-router-dom"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-emerald-500 text-slate-950" : "text-slate-200 hover:bg-white/10",
  ].join(" ")

export function RepresentativeDashboardLayout() {
  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Representative Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Client &amp; referral performance</h1>
        <nav className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <NavLink to="/dashboard/representative" end className={linkClass}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/representative/properties" className={linkClass}>
            Properties
          </NavLink>
          <NavLink to="/dashboard/representative/agents" className={linkClass}>
            Agents
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
