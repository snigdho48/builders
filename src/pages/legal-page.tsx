import { LegalPageContent } from "@/components/legal-page-content"

export function LegalPage() {
  return (
    <main className="bg-white py-16 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(5rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <LegalPageContent headingLevel="h1" />
    </main>
  )
}
