import { Navigate, Route, Routes } from "react-router-dom"

import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { PageTransitionLayout } from "@/components/layout/page-transition-layout"
import { AdminDashboardHomePage } from "@/pages/admin-dashboard-home"
import { AdminDashboardLayout } from "@/pages/admin-dashboard-layout"
import { AdminInvestorsPage } from "@/pages/admin-investors-page"
import { AdminPropertiesPage } from "@/pages/admin-properties-page"
import { AdminRepresentativesPage } from "@/pages/admin-representatives-page"
import { AuthPage } from "@/pages/auth-page"
import { AgentDashboardPage } from "@/pages/agent-dashboard-page"
import { ContactPage } from "@/pages/contact-page"
import { DashboardRouterPage } from "@/pages/dashboard-router-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { LandingPage } from "@/pages/landing-page"
import { ListingsPage } from "@/pages/listings-page"
import { PropertyDetailsPage } from "@/pages/property-details-page"
import { ProfilePage } from "@/pages/profile-page"
import { CartPage } from "@/pages/cart-page"
import { RegisterPage } from "@/pages/register-page"
import { RepresentativeAgentsPage } from "@/pages/representative-agents-page"
import { RepresentativeDashboardHomePage } from "@/pages/representative-dashboard-home"
import { RepresentativeDashboardLayout } from "@/pages/representative-dashboard-layout"
import { RepresentativePropertiesPage } from "@/pages/representative-properties-page"
import { ProtectedRoute } from "@/routes/protected-route"

export function AppRoutes() {
  return (
    <div className="flex min-h-svh flex-col bg-slate-950 text-white">
      <Navbar />
      <Routes>
        {/* All routes below share PageTransitionLayout: Framer Motion page enter/exit + scroll-to-top.
            Navbar/footer stay static; only the main column animates. */}
        <Route element={<PageTransitionLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/properties" element={<ListingsPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
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
              <ProtectedRoute allowRoles={["admin", "superadmin"]}>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardHomePage />} />
            <Route path="investors" element={<AdminInvestorsPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="representatives" element={<AdminRepresentativesPage />} />
          </Route>
          <Route
            path="/dashboard/representative"
            element={
              <ProtectedRoute allowRoles={["representative"]}>
                <RepresentativeDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RepresentativeDashboardHomePage />} />
            <Route path="properties" element={<RepresentativePropertiesPage />} />
            <Route path="agents" element={<RepresentativeAgentsPage />} />
          </Route>
          <Route
            path="/dashboard/agent"
            element={
              <ProtectedRoute allowRoles={["agent"]}>
                <AgentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  )
}
