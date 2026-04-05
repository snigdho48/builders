import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/admin", label: "Overview", end: true }],
  },
  {
    id: "people",
    title: "People",
    items: [
      { to: "/dashboard/admin/investors", label: "Investors" },
      { to: "/dashboard/admin/agents", label: "Agents" },
    ],
  },
  {
    id: "catalog",
    title: "Land",
    items: [{ to: "/dashboard/admin/properties", label: "All listings" }],
  },
  {
    id: "bookings",
    title: "Bookings",
    items: [{ to: "/dashboard/admin/bookings", label: "Land booking requests" }],
  },
]

export function AdminDashboardLayout() {
  return <DashboardShell sections={sections} />
}
