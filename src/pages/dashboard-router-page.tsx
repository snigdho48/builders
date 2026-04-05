import { Navigate } from "react-router-dom"

import { normalizeStoredRole } from "@/routes/protected-route"

export function DashboardRouterPage() {
  const role = normalizeStoredRole(localStorage.getItem("userRole"))

  if (role === "admin") {
    return <Navigate to="/dashboard/admin" replace />
  }
  if (role === "agent") {
    return <Navigate to="/dashboard/agent" replace />
  }
  return <Navigate to="/dashboard/investor" replace />
}
