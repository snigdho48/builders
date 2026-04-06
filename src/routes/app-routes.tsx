import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { ConditionalFooter } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { PageTransitionLayout } from "@/components/layout/page-transition-layout"
import { AdminAgentsPage } from "@/pages/admin-agents-page"
import { AdminDashboardHomePage } from "@/pages/admin-dashboard-home"
import { AdminDashboardLayout } from "@/pages/admin-dashboard-layout"
import { AdminInvestorsPage } from "@/pages/admin-investors-page"
import { AdminPropertiesPage } from "@/pages/admin-properties-page"
import { AgentDashboardHomePage } from "@/pages/agent-dashboard-home"
import { AgentDashboardLayout } from "@/pages/agent-dashboard-layout"
import { AgentDashboardPropertiesPage } from "@/pages/agent-dashboard-properties-page"
import { AgentInvestorsPage } from "@/pages/agent-investors-page"
import { AuthPage } from "@/pages/auth-page"
import { ContactPage } from "@/pages/contact-page"
import { DashboardRouterPage } from "@/pages/dashboard-router-page"
import { InvestorBookingsPage } from "@/pages/investor-bookings-page"
import { InvestorDashboardHomePage } from "@/pages/investor-dashboard-home"
import { InvestorDashboardLayout } from "@/pages/investor-dashboard-layout"
import { InvestorKycPage } from "@/pages/investor-kyc-page"
import { InvestorP2pListingsPage } from "@/pages/investor-p2p-listings-page"
import { InvestorP2pOffersPage } from "@/pages/investor-p2p-offers-page"
import { LandingPage } from "@/pages/landing-page"
import { ListingsPage } from "@/pages/listings-page"
import { P2pDetailPage } from "@/pages/p2p-detail-page"
import { P2pListPage } from "@/pages/p2p-list-page"
import { ProfilePage } from "@/pages/profile-page"
import { PropertyDetailsPage } from "@/pages/property-details-page"
import { PropertyLandBookPage } from "@/pages/property-land-book-page"
import { RegisterPage } from "@/pages/register-page"
import { StaffLandBookingsPage } from "@/pages/staff-land-bookings-page"
import { ProtectedRoute } from "@/routes/protected-route"

function AppShell() {
  const { pathname } = useLocation()
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <div
      className={
        isDashboard
          ? "flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-white text-slate-900"
          : "flex min-h-svh min-w-0 flex-col bg-white text-slate-900"
      }
    >
      {!isDashboard ? <Navbar /> : null}
      <Routes>
        <Route element={<PageTransitionLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/properties" element={<ListingsPage />} />
          <Route path="/properties/:id/book" element={<PropertyLandBookPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/p2p" element={<P2pListPage />} />
          <Route path="/p2p/:id" element={<P2pDetailPage />} />
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
                <InvestorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InvestorDashboardHomePage />} />
            <Route path="bookings" element={<InvestorBookingsPage />} />
            <Route path="kyc" element={<InvestorKycPage />} />
            <Route path="p2p/listings" element={<InvestorP2pListingsPage />} />
            <Route path="p2p/offers" element={<InvestorP2pOffersPage />} />
          </Route>
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowRoles={["admin"]}>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardHomePage />} />
            <Route path="investors" element={<AdminInvestorsPage />} />
            <Route path="agents" element={<AdminAgentsPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="bookings" element={<StaffLandBookingsPage />} />
          </Route>
          <Route
            path="/dashboard/agent"
            element={
              <ProtectedRoute allowRoles={["agent"]}>
                <AgentDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentDashboardHomePage />} />
            <Route path="properties" element={<AgentDashboardPropertiesPage />} />
            <Route path="bookings" element={<StaffLandBookingsPage />} />
            <Route path="investors" element={<AgentInvestorsPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {!isDashboard ? <ConditionalFooter /> : null}
    </div>
  )
}

export function AppRoutes() {
  return <AppShell />
}
