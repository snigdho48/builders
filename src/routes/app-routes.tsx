import { Navigate, Route, Routes } from "react-router-dom"

import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { AuthPage } from "@/pages/auth-page"
import { AdminDashboardPage } from "@/pages/admin-dashboard-page"
import { AdvertiserDashboardPage } from "@/pages/advertiser-dashboard-page"
import { ContactPage } from "@/pages/contact-page"
import { DashboardRouterPage } from "@/pages/dashboard-router-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { LandingPage } from "@/pages/landing-page"
import { ListingsPage } from "@/pages/listings-page"
import { PropertyDetailsPage } from "@/pages/property-details-page"
import { ProfilePage } from "@/pages/profile-page"
import { RegisterPage } from "@/pages/register-page"
import { RepresentativeDashboardPage } from "@/pages/representative-dashboard-page"
import { ProtectedRoute } from "@/routes/protected-route"

export function AppRoutes() {
  return (
    <div className="min-h-svh bg-slate-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/properties" element={<ListingsPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/investor"
          element={
            <ProtectedRoute allowRoles={["investor"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/representative"
          element={
            <ProtectedRoute allowRoles={["representative"]}>
              <RepresentativeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/advertiser"
          element={
            <ProtectedRoute allowRoles={["advertiser"]}>
              <AdvertiserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}
