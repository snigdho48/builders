import { InvestorKycPanel } from "@/components/investor-kyc-panel"

/** Dedicated investor dashboard screen for KYC (sidebar section: KYC). */
export function InvestorKycPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">KYC & verification</h1>
        <p className="mt-1 text-sm text-slate-600">
          Request identity verification or check your status. Staff approve or reject in their tools.
        </p>
      </div>
      <InvestorKycPanel />
    </div>
  )
}
