import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import type { UserRole } from "@/types/domain"

type ProtectedRouteProps = {
  children: ReactNode
  allowRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("accessToken")
  const role = localStorage.getItem("userRole") as UserRole | null

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  if (allowRoles && (!role || !allowRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
