import { Navigate } from "react-router-dom"

export function DashboardRouterPage() {
  const role = localStorage.getItem("userRole")

  if (role === "admin" || role === "superadmin") {
    return <Navigate to="/dashboard/admin" replace />
  }
  if (role === "representative") {
    return <Navigate to="/dashboard/representative" replace />
  }
  if (role === "agent" || role === "advertiser") {
    return <Navigate to="/dashboard/agent" replace />
  }
  return <Navigate to="/dashboard/investor" replace />
}
