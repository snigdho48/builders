import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/investor", label: "Overview", end: true }],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    items: [
      { to: "/dashboard/investor/investments", label: "Investments" },
      { to: "/dashboard/investor/payout-requests", label: "Payout requests" },
    ],
  },
  {
    id: "installment",
    title: "Installment",
    items: [
      { to: "/dashboard/investor/installment-tracker", label: "Installment tracker" },
      { to: "/dashboard/investor/statements", label: "Installment payments" },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [{ to: "/dashboard/investor/verification", label: "Verification (KYC)" }],
  },
]

export function InvestorDashboardLayout() {
  return <DashboardShell sections={sections} />
}
