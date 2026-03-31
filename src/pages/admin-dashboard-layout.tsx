import { NavLink, Outlet } from "react-router-dom"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
    isActive ? "bg-emerald-500 text-slate-950" : "text-slate-200 hover:bg-white/10",
  ].join(" ")

export function AdminDashboardLayout() {
  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Admin Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Platform Control Center</h1>
        <nav className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <NavLink to="/dashboard/admin" end className={linkClass}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/admin/investors" className={linkClass}>
            Investors
          </NavLink>
          <NavLink to="/dashboard/admin/properties" className={linkClass}>
            Properties
          </NavLink>
          <NavLink to="/dashboard/admin/representatives" className={linkClass}>
            Representatives
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
