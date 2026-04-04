import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/admin", label: "Overview", end: true }],
  },
  {
    id: "people",
    title: "People & roles",
    items: [
      { to: "/dashboard/admin/investors", label: "Investors" },
      { to: "/dashboard/admin/representatives", label: "Representatives" },
      { to: "/dashboard/admin/agents", label: "Agents" },
    ],
  },
  {
    id: "catalog",
    title: "Properties & listings",
    items: [{ to: "/dashboard/admin/properties", label: "All properties" }],
  },
  {
    id: "operations",
    title: "Operations",
    items: [
      { to: "/dashboard/admin/investments", label: "Investments" },
      { to: "/dashboard/admin/payout-requests", label: "Payout requests" },
      { to: "/dashboard/admin/kyc", label: "KYC & verification" },
    ],
  },
  {
    id: "installment",
    title: "Installment",
    items: [
      { to: "/dashboard/admin/installment-tracker", label: "Installment tracker" },
      { to: "/dashboard/admin/installment-payment-requests", label: "Installment payment requests" },
    ],
  },
]

export function AdminDashboardLayout() {
  return <DashboardShell sections={sections} />
}
