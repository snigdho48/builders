/** Terms, refund, and disclaimer from `public/Eurostar Website.docx` (verbatim structure). */
export type EurostarTermsSection = { title: string; body: string }

export const eurostarTermsIntro =
  "These Terms & Conditions govern the use of the website and services of Eurostar Group. By accessing or using our website, services, or platforms, you agree to comply with and be bound by these terms."

export const eurostarTermsSections: EurostarTermsSection[] = [
  {
    title: "Acceptance of Terms",
    body: "By using this website, you confirm that you have read, understood, and agreed to these Terms & Conditions. If you do not agree, you should discontinue use of the website immediately.",
  },
  {
    title: "Services Overview",
    body: `Eurostar Group provides real estate and property-related services including:

• Plot sales and land development projects
• Fractional land ownership investment models
• Property legal and advisory services
• NRB (Non-Resident Bangladeshi) support services

All services are subject to availability, legal compliance, and internal company policies.`,
  },
  {
    title: "Eligibility",
    body: "Users must be legally eligible to enter into contracts under applicable laws. By using our services, you confirm that all information provided by you is accurate, complete, and lawful.",
  },
  {
    title: "Property Information Disclaimer",
    body: "All property details, pricing, layouts, and investment projections are provided for informational purposes only and may be subject to change without prior notice. Final terms will be confirmed through official agreements.",
  },
  {
    title: "Payments & Transactions",
    body: "All payments must be made through approved banking channels or authorized payment systems. The company does not accept unauthorized cash transactions. Payment terms will be governed by individual project agreements.",
  },
  {
    title: "Booking & Allocation",
    body: "Booking of plots or fractional units is subject to availability and approval. The company reserves the right to accept or reject any application without assigning any reason.",
  },
  {
    title: "Legal Documentation",
    body: "Ownership, registration, and transfer of property will be completed only after fulfillment of all payment obligations and legal requirements as per applicable laws and project agreements.",
  },
  {
    title: "Fractional Ownership Terms",
    body: `For fractional land ownership:

• Ownership is structured through SPV (Special Purpose Vehicle) models
• Investors receive documented share allocation
• Investment does not guarantee fixed returns unless explicitly stated in agreements
• Secondary transfer (P2P) may be subject to internal platform rules`,
  },
  {
    title: "NRB & Remote Transactions",
    body: "NRB and overseas clients may complete transactions remotely through Power of Attorney (POA) and authorized legal representatives, subject to compliance with applicable laws and verification procedures.",
  },
  {
    title: "Refund & Cancellation Policy",
    body: "Cancellation and refund terms vary by project and agreement. Any applicable deductions, timelines, or service charges will be clearly defined in the respective project contract.",
  },
  {
    title: "Liability Limitation",
    body: "Eurostar Group is not liable for delays caused by government authorities, natural events, regulatory changes, or circumstances beyond reasonable control.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this website including text, graphics, logos, and materials are the property of Eurostar Group and may not be copied, reproduced, or distributed without prior written consent.",
  },
  {
    title: "User Responsibilities",
    body: "Users agree not to misuse the website, provide false information, or engage in any activity that may harm the company's operations, reputation, or other users.",
  },
  {
    title: "Changes to Terms",
    body: "Eurostar Group reserves the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of the website constitutes acceptance of the updated terms.",
  },
  {
    title: "Governing Law",
    body: "These Terms & Conditions shall be governed and interpreted in accordance with the laws of Bangladesh.",
  },
  {
    title: "Contact Information",
    body: "For any queries regarding these Terms & Conditions, users may contact the official support channels of Eurostar Group.",
  },
]

export const eurostarRefundCancellationPolicy =
  "Cancellation and refund terms vary by project and agreement. Any applicable deductions, timelines, or service charges will be clearly defined in the respective project contract. For legal service fees specifically, refunds or cancellations follow the scope agreed in your engagement letter and applicable company policy."

export const eurostarInvestmentDisclaimer: string[] = [
  "All property details, pricing, layouts, and investment projections on this website are provided for informational purposes only and may change without prior notice. Final terms are confirmed through official agreements.",
  "Fractional land ownership is a real asset-backed model; it does not guarantee fixed returns unless explicitly stated in writing. Secondary transfers (including P2P) may be subject to internal platform rules, lock-in periods, and verification.",
  "Land and property investments carry market, regulatory, and liquidity risks. Past performance or location trends do not guarantee future results. You should obtain independent legal and financial advice before committing funds.",
]
