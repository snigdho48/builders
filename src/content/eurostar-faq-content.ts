/** English + Bengali FAQ from `public/Eurostar Website.docx`. BN strings live in `eurostar-faq-bn-content.ts`. */
import {
  eurostarFaqLandShareBn,
  eurostarFaqNrbLegalBn,
  eurostarFaqPlotBuyBn,
} from "@/content/eurostar-faq-bn-content"

export type EurostarFaqItem = {
  question: string
  answer: string
  questionBn: string
  answerBn: string
}

function pairFaq(
  en: { question: string; answer: string }[],
  bn: { question: string; answer: string }[],
): EurostarFaqItem[] {
  return en.map((row, i) => ({
    ...row,
    questionBn: bn[i]?.question ?? row.question,
    answerBn: bn[i]?.answer ?? row.answer,
  }))
}

const eurostarFaqPlotBuyEn: { question: string; answer: string }[] = [
  {
    question: "How can I buy a plot from Eurostar Group?",
    answer:
      "You can book a plot by selecting your preferred project and submitting an application through our website, authorized agents or sales team. After booking, you can proceed with your chosen payment plan and complete the ownership process step by step.",
  },
  {
    question: "What payment options are available?",
    answer:
      "Eurostar offers flexible payment options to make land ownership easier:\n• 1% Entry Plan: Start with a small initial payment and pay the rest through installments\n• 50% Registration Plan: Pay 50% and receive registration of your plot, with the remaining amount payable over time",
  },
  {
    question: "What is the 1% payment plan?",
    answer:
      "The 1% plan allows you to begin your land ownership journey with a very low upfront cost. After the initial payment, the remaining balance is paid through structured monthly installments, making it ideal for first-time buyers and small investors.",
  },
  {
    question: "What is the 50% registration plan?",
    answer:
      "Under this plan, you receive registration of your plot after paying 50% of the total price. The remaining balance can be paid through installments, giving you early ownership security.",
  },
  {
    question: "When will I get ownership of my plot?",
    answer:
      "Ownership is confirmed after completing the required payment conditions.\n• Under the 50% plan, registration is processed after 50% payment.\n• Under the 1% plan, registration is processed after 70% of the total payment is completed.\n• For other plans, ownership is completed as per the agreed terms and payment milestones.",
  },
  {
    question: "Can I buy a plot while living abroad?",
    answer:
      "Yes, Non-Resident Bangladeshis (NRBs) can easily purchase plots from anywhere in the world through our structured process, local office in GCC or remote support system.",
  },
  {
    question: "Are the plots legally verified?",
    answer:
      "Yes, our projects are carefully selected and go through proper verification processes to ensure clear ownership and transparency before being offered to customers.",
  },
  {
    question: "Can I pay in installments?",
    answer:
      "Yes, flexible installment options are available depending on the payment plan you choose, allowing you to manage payments comfortably over time.",
  },
  {
    question: "What happens if I delay my payment?",
    answer:
      "In case of delayed payments, applicable policies such as late fees or rescheduling may apply. It is always recommended to follow the payment schedule to avoid complications.",
  },
  {
    question: "Can I transfer or change ownership of my plot?",
    answer:
      "Yes, ownership transfer or name change is possible as per company policy and applicable fees, subject to completion of required payments.",
  },
  {
    question: "Can I change my plot after booking?",
    answer:
      "Plot change or reallocation may be possible depending on availability and company approval. Any changes will be based on the current price and policy.",
  },
  {
    question: "Is there any hidden cost?",
    answer:
      "All costs are communicated clearly at the time of booking. There are no hidden charges beyond the declared price and applicable development or registration costs.",
  },
  {
    question: "How do I get more information or start the process?",
    answer:
      "You can contact our sales team, visit our website or connect with us via WhatsApp to receive project details and start your booking process.",
  },
]

const eurostarFaqLandShareEn: { question: string; answer: string }[] = [
  {
    question: "What is fractional land ownership?",
    answer:
      "Fractional land ownership allows multiple investors to co-own a real piece of land by purchasing shares instead of buying a full plot. Each investor owns a defined portion of the land through a structured and secure system.",
  },
  {
    question: "How does Eurostar fractional ownership work?",
    answer:
      "Eurostar Group structures each project under a Special Purpose Vehicle (SPV). Investors purchase shares of that project, and the land is held under the company structure, ensuring organized and transparent ownership.",
  },
  {
    question: "Do I really own the land?",
    answer:
      "Yes, you own a legally structured share of the land asset through the SPV model. Your ownership is linked to your allocated shares in the project.",
  },
  {
    question: "How is my ownership secured?",
    answer:
      "Your ownership is secured through a legally recognized system:\n• The land is held under a Special Purpose Vehicle (SPV) structure\n• Shares are officially allocated in your name\n• Ownership is registered with RJSC Bangladesh (Registrar of Joint Stock Companies)",
  },
  {
    question: "Will I receive ownership proof after purchase?",
    answer:
      "Yes, once you purchase shares, you will immediately receive registered share allotment in your name, confirming your ownership in the project.",
  },
  {
    question: "What is the minimum investment?",
    answer:
      "The model is designed to be accessible, allowing you to start with a small investment amount and gradually increase your ownership over time.",
  },
  {
    question: "Can I increase my investment later?",
    answer:
      "Yes, you can buy additional shares in the same project or other projects, helping you grow your land ownership portfolio step by step.",
  },
  {
    question: "Can I sell my shares?",
    answer:
      "Yes, Eurostar provides a P2P (peer-to-peer) listing system, where you can sell your shares to other verified investors or purchase additional shares.\nAll fractional shares are subject to a 2-year lock-in period. After this period, you can either sell through the P2P platform or Eurostar may offer a buyback option.",
  },
  {
    question: "How do I earn from fractional ownership?",
    answer:
      "Your return comes from land value appreciation. As the project develops and market demand increases, the value of your ownership share also grows.",
  },
  {
    question: "Is this a fixed return investment?",
    answer:
      "No, this is not a fixed return product. It is a real asset-backed ownership model where value depends on land appreciation over time.",
  },
  {
    question: "Can NRBs invest in fractional land?",
    answer:
      "Yes, Non-Resident Bangladeshis (NRBs) can invest from anywhere in the world through a structured and remote-friendly process.",
  },
  {
    question: "Who manages the land?",
    answer:
      "The land is managed under the SPV structure by Eurostar, ensuring proper administration, documentation, and project coordination.",
  },
  {
    question: "Is the land legally verified?",
    answer:
      "Yes, all projects are carefully selected and go through proper verification processes to ensure clear ownership and transparency. We have a panel of experienced lawyers and attorneys from reputed backgrounds who handle legal verification and documentation.",
  },
  {
    question: "How do I get started?",
    answer:
      "You can contact our team, explore available projects, and choose your preferred investment. We will guide you through onboarding, payment, and share allocation.",
  },
]

const eurostarFaqNrbLegalEn: { question: string; answer: string }[] = [
  {
    question: "What legal services do you provide for NRBs?",
    answer:
      "Eurostar Group offers complete legal support for Non-Resident Bangladeshis (NRBs), including land verification, title search, due diligence, registration, mutation, Power of Attorney (POA), succession (inheritance), and property dispute advisory.",
  },
  {
    question: "Can I manage my property in Bangladesh without visiting?",
    answer:
      "Yes, NRBs can fully manage property transactions remotely through our structured process. We provide end-to-end support, allowing you to complete legal procedures without being physically present in Bangladesh.",
  },
  {
    question: "How does Power of Attorney (POA) work for NRBs?",
    answer:
      "We assist in preparing legally valid POA documents so that your authorized representative in Bangladesh can handle property transactions on your behalf securely and legally.",
  },
  {
    question: "How do you verify land for NRBs?",
    answer:
      "Our legal team conducts thorough verification including title search, ownership history, and document validation to ensure the land is genuine, dispute-free, and legally safe.",
  },
  {
    question: "Can you help with property registration from abroad?",
    answer:
      "Yes, we provide full support for property registration through POA and coordinated legal processes, ensuring smooth and compliant registration without requiring your physical presence.",
  },
  {
    question: "What is mutation and do you handle it?",
    answer:
      "Mutation is the process of updating land records in your name after purchase. We handle the complete mutation process for NRBs to ensure legal ownership is properly recorded.",
  },
  {
    question: "Do you support inheritance (succession) cases for NRBs?",
    answer:
      "Yes, we provide full legal assistance for inheritance matters, including identifying legal heirs, preparing documents, and transferring ownership as per applicable laws.",
  },
  {
    question: "Can you help resolve property disputes remotely?",
    answer:
      "Yes, we offer legal advisory and coordination support for resolving property disputes, allowing NRBs to manage issues in Bangladesh without being physically present.",
  },
  {
    question: "How do you ensure trust and legal safety for NRBs?",
    answer:
      "We work with experienced legal professionals and follow structured verification processes. All documentation is handled transparently to ensure your property is legally secure.",
  },
  {
    question: "How will I receive updates on my case?",
    answer:
      "We provide regular updates through digital communication channels such as WhatsApp, email, and calls, ensuring you stay informed at every stage.",
  },
  {
    question: "How do I get started?",
    answer:
      "You can contact us via website, WhatsApp, or our international support channels. Our team will assess your requirements and guide you step by step.",
  },
]

export const eurostarFaqPlotBuy = pairFaq(eurostarFaqPlotBuyEn, eurostarFaqPlotBuyBn)
export const eurostarFaqLandShare = pairFaq(eurostarFaqLandShareEn, eurostarFaqLandShareBn)
export const eurostarFaqNrbLegal = pairFaq(eurostarFaqNrbLegalEn, eurostarFaqNrbLegalBn)
