import { Navigate } from "react-router-dom"

export function DashboardRouterPage() {
  const role = localStorage.getItem("userRole")

  if (role === "admin") {
    return <Navigate to="/dashboard/admin" replace />
  }
  if (role === "representative") {
    return <Navigate to="/dashboard/representative" replace />
  }
  if (role === "advertiser") {
    return <Navigate to="/dashboard/advertiser" replace />
  }
  return <Navigate to="/dashboard/investor" replace />
}
