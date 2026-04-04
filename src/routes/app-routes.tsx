import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { ConditionalFooter } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { PageTransitionLayout } from "@/components/layout/page-transition-layout"
import { AdminDashboardHomePage } from "@/pages/admin-dashboard-home"
import { AdminDashboardLayout } from "@/pages/admin-dashboard-layout"
import { AdminKycPage } from "@/pages/admin-kyc-page"
import { AdminInvestorsPage } from "@/pages/admin-investors-page"
import { AdminPropertiesPage } from "@/pages/admin-properties-page"
import { AdminRepresentativesPage } from "@/pages/admin-representatives-page"
import { AuthPage } from "@/pages/auth-page"
import { AgentDashboardHomePage } from "@/pages/agent-dashboard-home"
import { AgentDashboardLayout } from "@/pages/agent-dashboard-layout"
import { AgentDashboardPropertiesPage } from "@/pages/agent-dashboard-properties-page"
import { ContactPage } from "@/pages/contact-page"
import { DashboardRouterPage } from "@/pages/dashboard-router-page"
import { InvestorDashboardLayout } from "@/pages/investor-dashboard-layout"
import { InvestorDashboardHomePage } from "@/pages/investor-dashboard-home"
import { InvestorInvestmentsPage } from "@/pages/investor-investments-page"
import { InvestorKycPage } from "@/pages/investor-kyc-page"
import { InvestorRedemptionRequestsPage } from "@/pages/investor-redemption-requests-page"
import { InvestorStatementsPage } from "@/pages/investor-statements-page"
import { InstallmentTrackerPage } from "@/pages/installment-tracker-page"
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
import { StaffInvestmentsPage } from "@/pages/staff-investments-page"
import { StaffPaymentRequestsPage } from "@/pages/staff-payment-requests-page"
import { StaffRedemptionRequestsPage } from "@/pages/staff-redemption-requests-page"
import { ProtectedRoute } from "@/routes/protected-route"

function AppShell() {
  const { pathname } = useLocation()
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <div
      className={
        isDashboard
          ? "flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-slate-950 text-white"
          : "flex min-h-svh flex-col bg-slate-950 text-white"
      }
    >
      {!isDashboard ? <Navbar /> : null}
      <Routes>
        {/* PageTransitionLayout: route enter/exit + scroll-to-top. Navbar is hidden under /dashboard (see AppShell). */}
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
                <InvestorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InvestorDashboardHomePage />} />
            <Route path="investments" element={<InvestorInvestmentsPage />} />
            <Route path="payout-requests" element={<InvestorRedemptionRequestsPage />} />
            <Route path="verification" element={<InvestorKycPage />} />
            <Route path="statements" element={<InvestorStatementsPage />} />
            <Route path="installment-tracker" element={<InstallmentTrackerPage audience="investor" />} />
            <Route path="purchases" element={<Navigate to="/dashboard/investor/statements" replace />} />
          </Route>
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
            <Route path="rep-listings" element={<Navigate to="/dashboard/admin/properties" replace />} />
            <Route path="agents" element={<RepresentativeAgentsPage />} />
            <Route path="agent-listings" element={<Navigate to="/dashboard/admin/properties" replace />} />
            <Route path="investments" element={<StaffInvestmentsPage audience="admin" />} />
            <Route path="installment-tracker" element={<InstallmentTrackerPage audience="admin" />} />
            <Route path="installment-payment-requests" element={<StaffPaymentRequestsPage />} />
            <Route path="payout-requests" element={<StaffRedemptionRequestsPage />} />
            <Route path="kyc" element={<AdminKycPage />} />
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
            <Route path="investments" element={<StaffInvestmentsPage audience="representative" />} />
            <Route path="installment-tracker" element={<InstallmentTrackerPage audience="representative" />} />
            <Route path="installment-payment-requests" element={<StaffPaymentRequestsPage />} />
            <Route path="payout-requests" element={<StaffRedemptionRequestsPage />} />
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
            <Route path="investments" element={<StaffInvestmentsPage audience="agent" />} />
            <Route path="installment-tracker" element={<InstallmentTrackerPage audience="agent" />} />
            <Route path="installment-payment-requests" element={<StaffPaymentRequestsPage />} />
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
