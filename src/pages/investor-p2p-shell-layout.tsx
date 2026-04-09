import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "p2p",
    title: "P2P market",
    items: [
      { to: "/dashboard/investor-p2p", label: "Overview", end: true },
      { to: "/dashboard/investor-p2p/listings", label: "My listings" },
      { to: "/dashboard/investor-p2p/offers", label: "Offers on my listings" },
    ],
  },
  {
    id: "marketplace",
    title: "Public marketplace",
    items: [{ to: "/p2p", label: "Browse all P2P listings" }],
  },
  {
    id: "investor",
    title: "Land & bookings",
    items: [{ to: "/dashboard/investor", label: "Investor dashboard", end: true }],
  },
  {
    id: "account",
    title: "Account",
    items: [{ to: "/profile", label: "Profile & settings" }],
  },
]

/** Standalone investor P2P workspace — separate route and shell from `/dashboard/investor`. */
export function InvestorP2pShellLayout() {
  return (
    <DashboardShell sections={sections} workspaceLabel="P2P market dashboard" />
  )
}
