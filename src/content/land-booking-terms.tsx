import type { LandBookingPlanType } from "@/types/domain"

type Section = { title: string; paragraphs: string[] }

const COMMON_SECTIONS: Section[] = [
  {
    title: "1. Parties",
    paragraphs: [
      "These terms are between EUROSTAR LIVING SOLUTIONS (“Company”, “we”, “us”) and you (“Buyer”, “you”) for the land you are booking.",
    ],
  },
  {
    title: "2. Subject",
    paragraphs: [
      "The booking relates to the full land parcel shown in the listing and any schedule of dimensions or plot references we provide. Installment terms apply to the entire parcel unless a signed agreement states otherwise.",
    ],
  },
  {
    title: "3. Information and inspections",
    paragraphs: [
      "You confirm you have made your own enquiries about location, access, boundaries, zoning, environmental and coastal or reclamation matters, utilities, taxes, and suitability for your intended use. Marketing materials are indicative; the signed sale or allotment agreement and title documents (when issued) prevail.",
    ],
  },
  {
    title: "4. Booking and acceptance",
    paragraphs: [
      "A booking is not a final sale until you sign our formal sale or allotment agreement, pay required amounts under your plan, and complete any KYC or compliance steps. We may refuse or cancel a booking if information is incomplete, inaccurate, or if required approvals cannot be obtained.",
    ],
  },
  {
    title: "5. Price and charges",
    paragraphs: [
      "Total price, currency, taxes, registration, stamp duty, and any documentation or service fees are as stated on your pro forma invoice and in the sale agreement. Government charges may change until payment or registration; you agree to pay lawful increases.",
    ],
  },
  {
    title: "6. Default",
    paragraphs: [
      "If you fail to pay on time, we may charge late interest and/or fees as set out in the sale agreement, suspend documentation work, and after notice and any cure period required by law, rescind the agreement and apply forfeiture or other remedies permitted by law.",
    ],
  },
  {
    title: "7. Transfer and title",
    paragraphs: [
      "Ownership transfer and possession follow the sale agreement (e.g. completion of payment and registration). Until registration in your favour (or as otherwise agreed in writing), you do not own the land.",
    ],
  },
  {
    title: "8. Reclamation / coastal land",
    paragraphs: [
      "Where the property involves reclaimed or coastal land, you accept any special conditions: regulatory setbacks, stability or settlement requirements, flood or erosion risk, and changes in law or coastal boundaries. We do not warrant future government action or natural events.",
    ],
  },
  {
    title: "9. Force majeure",
    paragraphs: [
      "Delays due to events outside our reasonable control (including government orders, natural disasters, strikes, or utility failures) may extend timelines without liability, subject to applicable law.",
    ],
  },
  {
    title: "10. Privacy",
    paragraphs: [
      "We use the personal data you provide to process the sale, meet legal obligations, and manage our relationship, as described in our privacy notice.",
    ],
  },
  {
    title: "11. Governing law and disputes",
    paragraphs: [
      "These booking terms are governed by the laws applicable at the place of contract. Disputes are resolved as specified in the signed sale agreement (courts or arbitration).",
    ],
  },
  {
    title: "12. Entire agreement",
    paragraphs: [
      "The signed sale or allotment agreement and its annexures replace inconsistent prior statements. If these terms conflict with that agreement, the signed agreement controls.",
    ],
  },
]

const ONE_PERCENT_SECTIONS: Section[] = [
  {
    title: "Plan A — 1% installment plan",
    paragraphs: [
      "Under the 1% installment plan, you pay an initial amount equal to 1% of the agreed purchase price (or as stated at checkout) to reserve the land, unless the sale agreement defines the structure differently.",
      "The balance, installment amounts, and due dates are set out in the payment schedule attached to your sale agreement. Installments are fixed for the full land parcel and are not partial purchases of a fraction of the parcel unless expressly agreed.",
      "The low initial payment is offered on the basis that you will complete all installments and documentation. Early withdrawal or cancellation may result in forfeiture of amounts paid, as specified in the sale agreement.",
      "We may require additional security, guarantors, or stricter KYC for this plan.",
    ],
  },
]

const INVESTMENT_SECTIONS: Section[] = [
  {
    title: "Investment booking",
    paragraphs: [
      "This path is for investment-oriented enquiries. Payment terms, documentation, and timelines are agreed with our team separately from the limited 1% and 50% buy-property promo.",
      "Nothing in this screen substitutes for a signed investment or subscription agreement.",
    ],
  },
]

const FIFTY_PERCENT_SECTIONS: Section[] = [
  {
    title: "Plan B — 50% installment plan",
    paragraphs: [
      "Under the 50% installment plan, you pay 50% of the agreed purchase price (or the first tranche stated at checkout) by the date(s) in your payment schedule, with the remainder in installments or on completion as specified in the sale agreement.",
      "We may tie execution of certain documents, possession, or registration steps to receipt of the 50% threshold or other milestones set out in the sale agreement.",
      "Until the full price and agreed charges are paid, we may retain contractual rights consistent with the sale agreement and applicable law.",
      "Failure to pay the remaining balance on time may trigger accelerated payment, interest, and/or termination or forfeiture as stated in the sale agreement.",
    ],
  },
]

function SectionBlock({ section }: { section: Section }) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <h4 className="text-xs font-semibold text-[#0b1f44]">{section.title}</h4>
      <div className="mt-1 space-y-2 text-xs leading-relaxed text-slate-600">
        {section.paragraphs.map((p, i) => (
          <p key={`${section.title}-${i}`}>{p}</p>
        ))}
      </div>
    </div>
  )
}

type LandBookingTermsPanelProps = {
  planType: LandBookingPlanType
}

export function LandBookingTermsPanel({ planType }: LandBookingTermsPanelProps) {
  const planSections =
    planType === "one_percent_installment"
      ? ONE_PERCENT_SECTIONS
      : planType === "fifty_percent_installment"
        ? FIFTY_PERCENT_SECTIONS
        : INVESTMENT_SECTIONS

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80">
      <div className="border-b border-slate-200 bg-white px-3 py-2">
        <p className="text-xs font-semibold text-[#0b1f44]">Terms and conditions</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          EUROSTAR Group — land booking. Review before you submit; the signed agreement prevails where
          stated.
        </p>
      </div>
      <div className="max-h-52 overflow-y-auto px-3 py-3 space-y-3">
        {COMMON_SECTIONS.map((s) => (
          <SectionBlock key={s.title} section={s} />
        ))}
        {planSections.map((s) => (
          <SectionBlock key={s.title} section={s} />
        ))}
      </div>
    </div>
  )
}
