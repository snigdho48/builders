/**
 * Marketing and About copy from `public/Eurostar Website.docx` (EN + BN where provided).
 * Replace `siteContact` fields with your published office lines when ready.
 */

import type { AppLanguage } from "@/i18n/language-context"

export const siteContact = {
  mapQuery: "Dhaka, Bangladesh",
  addressTitle: "Office",
  addressLines: ["Eurostar Group, Dhaka Office", "Dhaka, Bangladesh"],
  email: "contact@eurostargroup.bd",
  emailHref: "mailto:contact@eurostargroup.bd",
  phoneDisplay: "+880 1312-345003",
  phoneHref: "tel:+8801312345003",
  hoursLines: ["Saturday–Thursday: 10:00 AM – 6:00 PM", "Friday: Closed"],
} as const

const aboutEyebrowI18n = {
  en: "About us",
  bn: "আমাদের সম্পর্কে",
} as const

const aboutHeroI18n = {
  en: {
    title: "Integrated land, investment, and property legal services.",
    subtitle:
      "Eurostar Group is a Bangladesh-focused integrated, new-generation real estate and property legal services company committed to transforming how people buy, invest in and own land. With over 25 years of successful experience and strong market access, the company develops carefully planned land projects for families, first-time buyers, investors and Non-Resident Bangladeshis (NRBs).",
  },
  bn: {
    title: "ইন্টিগ্রেটেড ল্যান্ড, বিনিয়োগ ও প্রপার্টি লিগ্যাল সার্ভিস।",
    subtitle:
      "Eurostar Group একটি বাংলাদেশ-কেন্দ্রিক ইন্টিগ্রেটেড ও নেক্সট-জেনারেশন রিয়েল এস্টেট এবং প্রপার্টি লিগ্যাল সার্ভিস প্রতিষ্ঠান, যার লক্ষ্য মানুষের জমি কেনা, বিনিয়োগ এবং মালিকানা অর্জনের প্রক্রিয়াকে আরও সহজ, স্বচ্ছ এবং আধুনিক করা। ২৫ বছরেরও বেশি সফল অভিজ্ঞতা ও শক্তিশালী মার্কেট অ্যাকসেসের মাধ্যমে কোম্পানিটি পরিবার, প্রথম ক্রেতা, বিনিয়োগকারী এবং প্রবাসী বাংলাদেশি (NRB)-দের জন্য পরিকল্পিত ল্যান্ড প্রজেক্ট ডেভেলপ করে।",
  },
} as const

const aboutHeroPillsI18n = {
  en: [
    "Plot Sales — planned communities & co-ownership in high-growth locations",
    "Fractional Land Ownership — accessible, flexible land investment",
    "Property Legal Services — verification, documentation & registration",
  ],
  bn: [
    "প্লট সেলস — উচ্চ সম্ভাবনাময় লোকেশনে আবাসিক ল্যান্ড কমিউনিটি",
    "ফ্র্যাকশনাল ল্যান্ড ওনারশিপ — সহজ ও ফ্লেক্সিবল বিনিয়োগ",
    "প্রপার্টি লিগ্যাল সার্ভিসেস — ভেরিফিকেশন, ডকুমেন্টেশন ও রেজিস্ট্রেশন",
  ],
} as const

const aboutStoryI18n = {
  en: {
    heading: "About us",
    paragraphs: [
      "Eurostar Group is a Bangladesh-focused integrated, new-generation real estate and property legal services company committed to transforming how people buy, invest in and own land. With over 25 years of successful experience and strong market access, the company develops carefully planned land projects for families, first-time buyers, investors and Non-Resident Bangladeshis (NRBs).",
      "Eurostar operates through three core solutions that create a complete land ownership ecosystem. Through Plot Sales, the company develops and co-owns large-scale residential land communities in high-growth locations with strong future connectivity and infrastructure potential. Through Fractional Land Ownership, investors can participate in land investment by purchasing shares of land assets, making property investment more accessible and flexible. Alongside these, Eurostar provides comprehensive Property Legal Services to ensure proper verification, documentation and registration support.",
      "A key focus of Eurostar Group is providing dedicated legal and ownership support for NRBs and expatriates. Beyond purchasing plots or fractional land, Eurostar offers a wide range of independent legal services for overseas Bangladeshis and global clients — including land verification, title search, due diligence, registration support, power of attorney services, mutation and documentation assistance. This enables NRBs to manage property matters in Bangladesh safely and remotely with complete peace of mind.",
      "Every project is selected based on future growth potential, connectivity and long-term value. The company’s commitment continues beyond the sale — through development, handover, registration and ongoing customer support — serving clients in Bangladesh and across the GCC, Europe, the USA, the Far East and Australia.",
    ],
    spotlightQuote: {
      text: "Eurostar Group is not just selling land — it is helping people secure their future.",
      attribution: "Eurostar Group",
    },
  },
  bn: {
    heading: "আমাদের সম্পর্কে",
    paragraphs: [
      "Eurostar Group একটি বাংলাদেশ-কেন্দ্রিক ইন্টিগ্রেটেড ও নেক্সট-জেনারেশন রিয়েল এস্টেট এবং প্রপার্টি লিগ্যাল সার্ভিস প্রতিষ্ঠান, যার লক্ষ্য মানুষের জমি কেনা, বিনিয়োগ এবং মালিকানা অর্জনের প্রক্রিয়াকে আরও সহজ, স্বচ্ছ এবং আধুনিক করা। ২৫ বছরেরও বেশি সফল অভিজ্ঞতা ও শক্তিশালী মার্কেট অ্যাকসেসের মাধ্যমে কোম্পানিটি পরিবার, প্রথম ক্রেতা, বিনিয়োগকারী এবং প্রবাসী বাংলাদেশি (NRB)-দের জন্য পরিকল্পিত ল্যান্ড প্রজেক্ট ডেভেলপ করে।",
      "Eurostar Group তিনটি মূল সলিউশনের মাধ্যমে একটি সম্পূর্ণ ল্যান্ড ওনারশিপ ইকোসিস্টেম তৈরি করেছে। প্লট সেলস (Plot Sales) এর মাধ্যমে কোম্পানি উচ্চ সম্ভাবনাময় ও দ্রুত উন্নয়নশীল লোকেশনে বড় আকারের আবাসিক ল্যান্ড কমিউনিটি ডেভেলপ ও কো-ওনারশিপ মডেলে পরিচালনা করে, যেখানে ভবিষ্যৎ কানেক্টিভিটি ও অবকাঠামোগত উন্নয়নকে গুরুত্ব দেওয়া হয়। ফ্র্যাকশনাল ল্যান্ড ওনারশিপ (Fractional Land Ownership) এর মাধ্যমে বিনিয়োগকারীরা জমির শেয়ার/ফ্র্যাকশন কিনে তুলনামূলক কম বিনিয়োগে রিয়েল এস্টেট মার্কেটে অংশগ্রহণ করতে পারেন। পাশাপাশি প্রপার্টি লিগ্যাল সার্ভিসেস এর মাধ্যমে সম্পূর্ণ ভেরিফিকেশন, ডকুমেন্টেশন ও রেজিস্ট্রেশন সাপোর্ট প্রদান করা হয়, যাতে গ্রাহকরা নিরাপদ ও নিশ্চিতভাবে মালিকানা গ্রহণ করতে পারেন।",
      "Eurostar Group-এর একটি গুরুত্বপূর্ণ ফোকাস হলো প্রবাসী বাংলাদেশি (NRB) এবং বিদেশে বসবাসরত গ্রাহকদের জন্য বিশেষ লিগ্যাল ও ওনারশিপ সাপোর্ট প্রদান। শুধু প্লট বা ফ্র্যাকশনাল ল্যান্ড কেনার বাইরে, কোম্পানিটি আন্তর্জাতিক ক্লায়েন্টদের জন্য স্বতন্ত্র লিগ্যাল সার্ভিস প্রদান করে — যেমন জমি যাচাই (verification), টাইটেল সার্চ, ডিউ ডিলিজেন্স, রেজিস্ট্রেশন সহায়তা, পাওয়ার অব অ্যাটর্নি (POA) সেবা, মিউটেশন এবং অন্যান্য ডকুমেন্টেশন সাপোর্ট। এর মাধ্যমে প্রবাসীরা বাংলাদেশে বসে নিরাপদে ও ঝামেলাহীনভাবে সম্পত্তি ব্যবস্থাপনা করতে পারেন।",
      "প্রতিটি প্রকল্প ভবিষ্যৎ উন্নয়ন সম্ভাবনা, যোগাযোগ ব্যবস্থা এবং দীর্ঘমেয়াদি মূল্য বৃদ্ধির ভিত্তিতে নির্বাচন করা হয়। কোম্পানির সেবা বিক্রির পরেই শেষ হয় না — বরং ডেভেলপমেন্ট, হস্তান্তর, রেজিস্ট্রেশন এবং পরবর্তী গ্রাহক সাপোর্ট পর্যন্ত অব্যাহত থাকে। বর্তমানে Eurostar Group বাংলাদেশসহ GCC, ইউরোপ, যুক্তরাষ্ট্র, ফার ইস্ট এবং অস্ট্রেলিয়া বাজারেও সেবা প্রদান করছে।",
    ],
    spotlightQuote: {
      text: "Eurostar Group শুধু জমি বিক্রি করে না — এটি মানুষের ভবিষ্যৎ সুরক্ষিত করতে সহায়তা করে।",
      attribution: "Eurostar Group",
    },
  },
} as const

const aboutStatsI18n = [
  {
    value: "25+ yrs",
    label: {
      en: "Multi-sector experience shaping stable, structured land solutions",
      bn: "বহু খাতের অভিজ্ঞতায় স্থিতিশীল ও কাঠামোবদ্ধ ল্যান্ড সলিউশন",
    },
    toneClass: "bg-[#0b1f44] text-white",
  },
  {
    value: "3 pillars",
    label: {
      en: "Plot sales, fractional ownership, and full-spectrum legal support",
      bn: "প্লট সেলস, ফ্র্যাকশনাল ওনারশিপ ও সম্পূর্ণ লিগ্যাল সাপোর্ট",
    },
    toneClass: "bg-[#152a55] text-white",
  },
  {
    value: "NRB-first",
    label: {
      en: "Remote-friendly legal execution and documentation where you live",
      bn: "প্রবাস থেকেই নিরাপদ ডকুমেন্টেশন ও লিগ্যাল কার্যক্রম",
    },
    toneClass: "bg-[#f58e43] text-[#0b1f44]",
  },
  {
    value: "P2P lane",
    label: {
      en: "Secondary liquidity for verified fractional holdings when rules allow",
      bn: "নিয়ম অনুযায়ী ভেরিফাইড ফ্র্যাকশনাল হোল্ডিংসের সেকেন্ডারি লিকুইডিটি",
    },
    toneClass: "bg-slate-100 text-[#0b1f44] ring-1 ring-slate-200/90",
  },
] as const

/** Default EN exports for `about-mahfuz-from-profile` re-exports */
export const aboutEyebrowEurostar = aboutEyebrowI18n.en
export const aboutHeroEurostar = aboutHeroI18n.en
export const aboutHeroPillsEurostar = aboutHeroPillsI18n.en
export const aboutStoryEurostar = aboutStoryI18n.en
export const aboutStatsEurostar = aboutStatsI18n.map((s) => ({
  value: s.value,
  label: s.label.en,
  toneClass: s.toneClass,
}))

export function getEurostarAboutPageCopy(language: AppLanguage) {
  const lang = language === "bn" ? "bn" : "en"
  return {
    eyebrow: aboutEyebrowI18n[lang],
    hero: aboutHeroI18n[lang],
    pills: [...aboutHeroPillsI18n[lang]],
    story: aboutStoryI18n[lang],
    stats: aboutStatsI18n.map((s) => ({
      value: s.value,
      label: s.label[lang],
      toneClass: s.toneClass,
    })),
  }
}

/** “Why choose Eurostar Group – Key Differentiators” (EN only in source doc). */
export const eurostarWhyChooseItems = [
  {
    title: "25+ Years of Multi-Sector Experience",
    description:
      "Eurostar Group brings over two decades of experience across retail, trading, technology, and real estate. This diversified background allows us to build stable, scalable, and well-structured land investment solutions.",
  },
  {
    title: "Integrated Land Ownership Ecosystem",
    description: "We are not just a land developer—we are a complete ecosystem offering:",
    subPoints: [
      "Plot Sales (structured land ownership)",
      "Fractional Land Ownership (accessible investment model)",
      "Property Legal Services (end-to-end legal support)",
    ],
  },
  {
    title: "Real Asset-Backed & Structured Ownership",
    description:
      "Every project is backed by real, verified land assets and structured through proper legal frameworks to ensure transparency, clarity, and long-term security for investors.",
  },
  {
    title: "SPV-Based Investment Model",
    description: "Our fractional ownership system is built on a Special Purpose Vehicle (SPV) structure, ensuring:",
    subPoints: [
      "Clear legal ownership framework",
      "Transparent share allocation",
      "Secure investor protection and documentation",
    ],
  },
  {
    title: "Designed for NRBs & Global Investors",
    description:
      "Eurostar Group is built with a strong focus on Non-Resident Bangladeshis (NRBs) and global investors, enabling remote participation, secure documentation, and full legal support from abroad.",
  },
  {
    title: "Flexible & Inclusive Investment Options",
    description: "We make land ownership accessible through:",
    subPoints: ["Low entry investment options", "Scalable ownership growth", "Multiple investment models (full plot & fractional)"],
  },
  {
    title: "Transparency-Driven Operations",
    description: "We follow a strict transparency-first approach with:",
    subPoints: [
      "Clear legal documentation",
      "Structured processes",
      "Defined ownership pathways",
      "No hidden charges or unclear terms",
    ],
  },
  {
    title: "Built-in Secondary Market (P2P System)",
    description: "Our ecosystem supports a P2P property marketplace, allowing investors to:",
    subPoints: ["Buy additional shares", "Sell fractional holdings", "Increase liquidity within land investments"],
  },
  {
    title: "Full-Spectrum Legal Support",
    description: "We provide comprehensive legal services including:",
    subPoints: [
      "Land verification & due diligence",
      "Registration & mutation support",
      "Power of Attorney (POA) services",
      "Succession & inheritance handling",
      "Property dispute advisory",
    ],
  },
  {
    title: "Long-Term Vision & Trust Building",
    description:
      "At the core of Eurostar Group is a commitment to building long-term trust, sustainable land value and generational asset creation—not short-term transactions.",
  },
] as const

export const eurostarLegalServicesOverview = {
  title: "Eurostar Group Legal Service",
  lead:
    "Eurostar Group Legal Service is a comprehensive, end-to-end property legal support system designed to ensure safe, transparent, and hassle-free land ownership for buyers, investors, and Non-Resident Bangladeshis (NRBs).",
  lead2:
    "This service is specially designed for NRBs and expatriate Bangladeshis, enabling them to manage property matters in Bangladesh remotely with complete legal clarity, security, and trust.",
  lead3:
    "Eurostar provides full legal support across the entire property lifecycle—from initial verification to final ownership transfer—ensuring that every transaction is properly documented, legally compliant, and risk-free.",
  bullets: [
    "Succession (Inheritance) Services",
    "Land verification and title search",
    "Due diligence and ownership authentication",
    "Mutation (Khatian/record update) support",
    "Registration assistance and documentation",
    "Power of Attorney (POA) preparation and guidance",
    "Sale deed and ownership transfer support",
    "Property documentation preparation and review",
    "Independent legal advisory for property disputes",
    "NRB & Expatriate Legal Support",
    "Any legal advisory on civil affairs",
  ],
  closing:
    "Every case is handled through a structured legal process to ensure compliance with applicable property laws and regulatory standards. The focus is on transparency, documentation accuracy, and protection of client interests at every stage.",
  closing2:
    "This service is not just about paperwork—it is about building trust, ensuring legal safety, and delivering a fully secure and structured property ownership experience for clients in Bangladesh and abroad.",
}

export const eurostarLegalServicesOverviewBn = {
  title: "লিগ্যাল সার্ভিস – সার্ভিস ওভারভিউ",
  lead:
    "Eurostar Group লিগ্যাল সার্ভিস একটি পূর্ণাঙ্গ, এন্ড-টু-এন্ড প্রপার্টি লিগ্যাল সাপোর্ট সিস্টেম, যা প্রবাসী বাংলাদেশিদের (NRBs) জমি সংক্রান্ত বিষয় নিশ্চিত করার জন্য ডিজাইন করা হয়েছে যাতে তারা বাংলাদেশে না থেকেও সম্পূর্ণ আইনগত স্বচ্ছতা, নিরাপত্তা এবং বিশ্বাসের সাথে বিষয়গুলো পরিচালনা করতে পারেন।",
  lead2: "Eurostar সম্পূর্ণ প্রপার্টি লাইফসাইকেল জুড়ে লিগ্যাল সাপোর্ট প্রদান করে।",
  bullets: [
    "উত্তরাধিকার (Succession) সেবা",
    "জমি যাচাই ও টাইটেল সার্চ",
    "ডিউ ডিলিজেন্স ও মালিকানা যাচাইকরণ",
    "মিউটেশন (খতিয়ান/রেকর্ড আপডেট) সহায়তা",
    "রেজিস্ট্রেশন সহায়তা ও ডকুমেন্টেশন",
    "পাওয়ার অব অ্যাটর্নি (POA) প্রস্তুত ও নির্দেশনা",
    "সেল ডিড ও মালিকানা হস্তান্তর সহায়তা",
    "সম্পত্তি ডকুমেন্ট প্রস্তুত ও রিভিউ",
    "সম্পত্তি বিরোধ সংক্রান্ত স্বাধীন লিগ্যাল অ্যাডভাইজরি",
  ],
  closing:
    "প্রতিটি কেস একটি কাঠামোবদ্ধ আইনগত প্রক্রিয়ার মাধ্যমে পরিচালিত হয়, যাতে সংশ্লিষ্ট সম্পত্তি আইনের সাথে পূর্ণ সামঞ্জস্য, স্বচ্ছতা, ডকুমেন্টেশন নির্ভুলতা এবং গ্রাহকের স্বার্থ সুরক্ষিত থাকে।",
  closing2:
    "এই সার্ভিস শুধু কাগজপত্রের কাজ নয়—এটি বিশ্বাস তৈরি করা, আইনগত নিরাপত্তা নিশ্চিত করা এবং বিদেশে থাকা ক্লায়েন্টদের জন্য একটি সম্পূর্ণ নিরাপদ অভিজ্ঞতা প্রদান করা।",
}

export const aboutMissionVisionValues = {
  en: [
    {
      title: "Mission",
      body: "To make land ownership safe, transparent, and accessible through structured plot sales, fractional investment, and trusted legal support.",
    },
    {
      title: "Vision",
      body: "To build Bangladesh’s most reliable integrated land ownership ecosystem for residents, NRBs, and global investors.",
    },
    {
      title: "Values",
      body: "Transparency, legal compliance, customer trust, documentation accuracy, and long-term value creation.",
    },
  ],
  bn: [
    {
      title: "মিশন",
      body: "কাঠামোবদ্ধ প্লট সেলস, ফ্র্যাকশনাল বিনিয়োগ এবং নির্ভরযোগ্য লিগ্যাল সাপোর্টের মাধ্যমে জমির মালিকানা সহজ, নিরাপদ ও স্বচ্ছ করা।",
    },
    {
      title: "ভিশন",
      body: "বাংলাদেশ এবং প্রবাসী বিনিয়োগকারীদের জন্য সবচেয়ে নির্ভরযোগ্য ইন্টিগ্রেটেড ল্যান্ড ওনারশিপ ইকোসিস্টেম গড়ে তোলা।",
    },
    {
      title: "ভ্যালুস",
      body: "স্বচ্ছতা, আইনগত সামঞ্জস্য, গ্রাহক আস্থা, নির্ভুল ডকুমেন্টেশন এবং দীর্ঘমেয়াদি সম্পদমূল্য সৃষ্টি।",
    },
  ],
} as const

export const eurostarLegalTeam = {
  en: {
    title: "Meet our legal team",
    members: [
      {
        name: "Mahfuz Bin Yousuf",
        designation: "Advocate, Supreme Court of Bangladesh",
        bio: "Partner-level counsel focused on land litigation, due diligence, title review, and documentation workflows for secure transactions.",
      },
      {
        name: "Mohammad Mehdi Hasan",
        designation: "Barrister-at-Law; Advocate, Appellate Division",
        bio: "Founding partner with experience in corporate, commercial, banking, and property matters including high-value legal structuring.",
      },
      {
        name: "Mohammad Mazharul Islam",
        designation: "Barrister-at-Law; Advocate, Supreme Court of Bangladesh",
        bio: "Supports litigation, banking documentation, land records, and court process coordination across district and High Court matters.",
      },
    ],
  },
  bn: {
    title: "আমাদের লিগ্যাল টিম",
    members: [
      {
        name: "মাহফুজ বিন ইউসুফ",
        designation: "অ্যাডভোকেট, সুপ্রিম কোর্ট অব বাংলাদেশ",
        bio: "জমি সংক্রান্ত লিটিগেশন, ডিউ ডিলিজেন্স, টাইটেল রিভিউ ও ডকুমেন্টেশন-ভিত্তিক নিরাপদ ট্রানজ্যাকশন সাপোর্টে কাজ করেন।",
      },
      {
        name: "মোহাম্মদ মেহেদী হাসান",
        designation: "ব্যারিস্টার-অ্যাট-ল; অ্যাডভোকেট, আপিলেট ডিভিশন",
        bio: "কর্পোরেট, কমার্শিয়াল, ব্যাংকিং ও প্রপার্টি ম্যাটারে স্ট্রাকচার্ড লিগ্যাল সাপোর্ট ও কৌশলগত পরামর্শ প্রদান করেন।",
      },
      {
        name: "মোহাম্মদ মাযহারুল ইসলাম",
        designation: "ব্যারিস্টার-অ্যাট-ল; অ্যাডভোকেট, সুপ্রিম কোর্ট অব বাংলাদেশ",
        bio: "ব্যাংকিং ডকুমেন্টেশন, ল্যান্ড রেকর্ডস এবং কোর্ট-কেন্দ্রিক লিগ্যাল প্রসেস সমন্বয়ে বিশেষভাবে কাজ করেন।",
      },
    ],
  },
} as const
