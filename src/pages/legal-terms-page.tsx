import { LegalPageContent } from "@/components/legal-page-content"

/** Website terms & notices (previous `/legal` copy). */
export function LegalTermsPage() {
  return (
    <main className="bg-white py-12 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(3rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <div className="landing-inner">
        <LegalPageContent headingLevel="h1" />
      </div>
    </main>
  )
}
