import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import type { UserRole } from "@/types/domain"

type ProtectedRouteProps = {
  children: ReactNode
  allowRoles?: UserRole[]
}

/** Map legacy stored roles (e.g. after DB migration) to the three app roles. */
export function normalizeStoredRole(raw: string | null): UserRole | null {
  if (!raw) return null
  if (raw === "superadmin") return "admin"
  if (raw === "representative" || raw === "advertiser") return "agent"
  if (raw === "admin" || raw === "agent" || raw === "investor") return raw
  return null
}

export function ProtectedRoute({ children, allowRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("accessToken")
  const role = normalizeStoredRole(localStorage.getItem("userRole"))

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  if (allowRoles && (!role || !allowRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
