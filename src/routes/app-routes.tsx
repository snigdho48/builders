import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { ConditionalFooter } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { PageTransitionLayout } from "@/components/layout/page-transition-layout"
import { AdminAgentsPage } from "@/pages/admin-agents-page"
import { AdminDashboardHomePage } from "@/pages/admin-dashboard-home"
import { AdminDashboardLayout } from "@/pages/admin-dashboard-layout"
import { AdminInvestorsPage } from "@/pages/admin-investors-page"
import { AdminLandShareListingsPage } from "@/pages/admin-land-share-listings-page"
import { AdminPropertiesPage } from "@/pages/admin-properties-page"
import { AgentDashboardHomePage } from "@/pages/agent-dashboard-home"
import { AgentDashboardLayout } from "@/pages/agent-dashboard-layout"
import { AgentDashboardLandSharePage } from "@/pages/agent-dashboard-land-share-page"
import { AgentDashboardPropertiesPage } from "@/pages/agent-dashboard-properties-page"
import { AgentInvestorsPage } from "@/pages/agent-investors-page"
import { AuthPage } from "@/pages/auth-page"
import { AboutPage } from "@/pages/about-page"
import { ContactPage } from "@/pages/contact-page"
import { LegalPage } from "@/pages/legal-page"
import { LegalTermsPage } from "@/pages/legal-terms-page"
import { DashboardRouterPage } from "@/pages/dashboard-router-page"
import { InvestorBookingsPage } from "@/pages/investor-bookings-page"
import { InvestorDashboardHomePage } from "@/pages/investor-dashboard-home"
import { InvestorDashboardLayout } from "@/pages/investor-dashboard-layout"
import { InvestorKycPage } from "@/pages/investor-kyc-page"
import { InvestorP2pHomePage } from "@/pages/investor-p2p-home-page"
import { InvestorP2pShellLayout } from "@/pages/investor-p2p-shell-layout"
import { InvestorP2pListingsPage } from "@/pages/investor-p2p-listings-page"
import { InvestorP2pOffersPage } from "@/pages/investor-p2p-offers-page"
import { LandingPage } from "@/pages/landing-page"
import { ListingsPage } from "@/pages/listings-page"
import { P2pDetailPage } from "@/pages/p2p-detail-page"
import { PlotPlansPage } from "@/pages/plot-plans-page"
import { P2pListPage } from "@/pages/p2p-list-page"
import { ProfilePage } from "@/pages/profile-page"
import { LandShareDetailsPage } from "@/pages/land-share-details-page"
import { LandShareLandBookPage } from "@/pages/land-share-land-book-page"
import { PropertyDetailsPage } from "@/pages/property-details-page"
import { PropertyLandBookPage } from "@/pages/property-land-book-page"
import { RegisterPage } from "@/pages/register-page"
import { StaffLandBookingsPage } from "@/pages/staff-land-bookings-page"
import { StaffInstallmentTrackerPage } from "@/pages/staff-installment-tracker-page"
import { ProtectedRoute } from "@/routes/protected-route"
import { publicUrl } from "@/utils/public-url"

function AppShell() {
  const { pathname } = useLocation()
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <div
      className={
        isDashboard
          ? "flex h-dvh max-h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-white text-slate-900"
          : "flex min-h-svh min-w-0 flex-col overflow-x-hidden bg-white text-slate-900"
      }
    >
      {!isDashboard ? <Navbar /> : null}
      <div className="light-content flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route element={<PageTransitionLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plans" element={<PlotPlansPage />} />
          <Route path="/listings/buy-plots" element={<ListingsPage presetSaleType="land_buy" />} />
          <Route path="/listings/buy-land-share" element={<ListingsPage presetSaleType="installment" />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/properties" element={<ListingsPage />} />
          <Route path="/properties/:id/book" element={<PropertyLandBookPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/land-share-listings/:id/book" element={<LandShareLandBookPage />} />
          <Route path="/land-share-listings/:id" element={<LandShareDetailsPage />} />
          <Route path="/p2p" element={<P2pListPage />} />
          <Route path="/p2p/:id" element={<P2pDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/legal/terms" element={<LegalTermsPage />} />
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
          </Route>
          <Route
            path="/dashboard/investor-p2p"
            element={
              <ProtectedRoute allowRoles={["investor"]}>
                <InvestorP2pShellLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InvestorP2pHomePage />} />
            <Route path="listings" element={<InvestorP2pListingsPage />} />
            <Route path="offers" element={<InvestorP2pOffersPage />} />
          </Route>
          <Route
            path="/dashboard/investor/p2p/listings"
            element={
              <ProtectedRoute allowRoles={["investor"]}>
                <Navigate to="/dashboard/investor-p2p/listings" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/investor/p2p/offers"
            element={
              <ProtectedRoute allowRoles={["investor"]}>
                <Navigate to="/dashboard/investor-p2p/offers" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/investor/p2p"
            element={
              <ProtectedRoute allowRoles={["investor"]}>
                <Navigate to="/dashboard/investor-p2p" replace />
              </ProtectedRoute>
            }
          />
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
            <Route path="land-share" element={<AdminLandShareListingsPage />} />
            <Route path="bookings" element={<StaffLandBookingsPage mode="bookings" />} />
            <Route path="installments" element={<StaffInstallmentTrackerPage />} />
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
            <Route path="land-share" element={<AgentDashboardLandSharePage />} />
            <Route path="bookings" element={<StaffLandBookingsPage mode="bookings" />} />
            <Route path="installments" element={<StaffInstallmentTrackerPage />} />
            <Route path="investors" element={<AgentInvestorsPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
      <span className="whatsapp-float-shell fixed right-3 bottom-3 z-[2147483646] flex h-[60px] w-[60px] items-center justify-center sm:right-5 sm:bottom-5 sm:h-[70px] sm:w-[70px]">
        <a
          href="https://wa.me/8801312345003"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="whatsapp-float relative inline-flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:h-[70px] sm:w-[70px]"
        >
          <img
            src={publicUrl("Whatsapp.gif")}
            alt=""
            width={100}
            height={100}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </a>
      </span>
      {!isDashboard ? <ConditionalFooter /> : null}
    </div>
  )
}

export function AppRoutes() {
  return <AppShell />
}
