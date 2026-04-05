import { AdminInvestorsPage } from "@/pages/admin-investors-page"

/** Agents can list investors and set KYC; creating investor accounts remains admin-only. */
export function AgentInvestorsPage() {
  return <AdminInvestorsPage allowCreateInvestor={false} />
}
