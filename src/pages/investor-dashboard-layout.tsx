import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/investor", label: "Overview", end: true }],
  },
  {
    id: "bookings",
    title: "Bookings",
    items: [{ to: "/dashboard/investor/bookings", label: "My land bookings" }],
  },
  {
    id: "p2p",
    title: "P2P market",
    items: [
      { to: "/dashboard/investor/p2p/listings", label: "My P2P listings" },
      { to: "/dashboard/investor/p2p/offers", label: "Offers on my listings" },
    ],
  },
  {
    id: "kyc",
    title: "KYC",
    items: [{ to: "/dashboard/investor/kyc", label: "Verification & requests", end: true }],
  },
  {
    id: "account",
    title: "Account",
    items: [{ to: "/profile", label: "Profile & settings" }],
  },
]

export function InvestorDashboardLayout() {
  return <DashboardShell sections={sections} />
}
