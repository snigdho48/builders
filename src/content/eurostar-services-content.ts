/**
 * Service pages content mapped from `public/Eurostar Website.docx`.
 */
import type { AppLanguage } from "@/i18n/language-context"

type I18nText = { en: string; bn: string }
type HowStep = { title: I18nText; body: I18nText; bullets?: I18nText[] }
type LegalDetailSection = { title: I18nText; body: I18nText }

const serviceIntro = {
  eyebrow: { en: "Service overview", bn: "সার্ভিস ওভারভিউ" },
  title: { en: "Plot sales and fractional ownership", bn: "প্লট সেলস ও ফ্র্যাকশনাল ওনারশিপ" },
  subtitle: {
    en: "Structured ownership models with legal clarity for families, investors, and NRBs.",
    bn: "পরিবার, বিনিয়োগকারী ও NRB-দের জন্য কাঠামোবদ্ধ মালিকানা মডেল এবং আইনগত স্বচ্ছতা।",
  },
}

const plotSalesOverviewI18n = {
  title: { en: "Plot Sales — Service Overview", bn: "প্লট সেলস — সার্ভিস ওভারভিউ" },
  paragraphs: {
    en: [
      "Eurostar Group Plot Sales Service is a structured and secure land ownership solution designed to make land buying simple, transparent, and accessible for families, investors, and Non-Resident Bangladeshis (NRBs).",
      "Through this service, Eurostar Group develops and offers planned residential land projects in high-growth locations with strong future connectivity, infrastructure development and long-term value appreciation potential. Every project is carefully selected, legally verified, and prepared through a structured documentation and planning process to ensure safety and transparency.",
      "Customers can choose from different ownership options, including full plot ownership, shared/co-ownership models, and flexible payment structures designed to suit different financial capacities.",
    ],
    bn: [
      "Eurostar Group এর Plot Sales Service একটি কাঠামোবদ্ধ, স্বচ্ছ এবং নিরাপদ জমি মালিকানা সলিউশন, যার লক্ষ্য হলো পরিবার, বিনিয়োগকারী এবং প্রবাসী বাংলাদেশিদের (NRB) জন্য জমি কেনার প্রক্রিয়াকে সহজ ও গ্রহণযোগ্য করা।",
      "এই সার্ভিসের মাধ্যমে ইউরোস্টার গ্রুপ পরিকল্পিত আবাসিক প্লট প্রজেক্ট ডেভেলপ করে, যা উচ্চ সম্ভাবনাময় লোকেশনে অবস্থিত এবং ভবিষ্যৎ কানেক্টিভিটি, অবকাঠামো উন্নয়ন ও দীর্ঘমেয়াদি মূল্য বৃদ্ধির সুযোগকে গুরুত্ব দেয়। প্রতিটি প্লট আইনগত যাচাই, সঠিক পরিকল্পনা এবং স্বচ্ছ ডকুমেন্টেশন প্রক্রিয়ার মাধ্যমে প্রস্তুত করা হয়, যাতে গ্রাহকরা নিরাপদভাবে মালিকানা গ্রহণ করতে পারেন।",
      "গ্রাহকরা তাদের প্রয়োজন অনুযায়ী বিভিন্ন মালিকানা অপশন থেকে নির্বাচন করতে পারেন—যেমন পূর্ণ প্লট মালিকানা, শেয়ার/কো-ওনারশিপ মডেল এবং ফ্লেক্সিবল পেমেন্ট প্ল্যান।",
    ],
  },
}

const paymentPlans = {
  heading: { en: "Payment & Registration Plans", bn: "পেমেন্ট ও রেজিস্ট্রেশন প্ল্যান" },
  plans: [
    {
      title: { en: "1% Payment Plan", bn: "১% পেমেন্ট প্ল্যান" },
      body: {
        en: "Customers can start the booking process by paying only 1% of the total property value. After this initial entry, payments continue through a structured installment plan as per the agreed schedule and company policy, with ownership and final registration completed based on fulfillment of the defined terms.",
        bn: "গ্রাহক মোট মূল্যের মাত্র ১% প্রাথমিক পেমেন্ট দিয়ে বুকিং শুরু করতে পারেন। এরপর নির্ধারিত কিস্তি কাঠামো অনুযায়ী ধাপে ধাপে পেমেন্ট সম্পন্ন করা হয় এবং চূড়ান্ত রেজিস্ট্রেশন কোম্পানির নির্ধারিত শর্ত ও নীতিমালা অনুযায়ী সম্পন্ন হয়।",
      },
    },
    {
      title: { en: "50% Registration Plan", bn: "৫০% রেজিস্ট্রেশন প্ল্যান" },
      body: {
        en: "Upon payment of 50% of the total property value, the customer receives immediate plot registration, securing legal ownership. The remaining 50% can be paid through structured installments as per the agreed payment schedule.",
        bn: "গ্রাহক মোট মূল্যের ৫০% পরিশোধ সম্পন্ন করার পর তাৎক্ষণিক রেজিস্ট্রেশন (Immediate Registration) প্রদান করা হয়। বাকি ৫০% নির্ধারিত কিস্তি পরিকল্পনা অনুযায়ী পরিশোধ করা যায়।",
      },
    },
  ],
  closing: {
    en: "Eurostar Plot Sales provides end-to-end support from booking to ownership, including documentation assistance, payment structuring, legal guidance and final registration support. The goal is to ensure a reliable, transparent, and legally secure land ownership experience for every customer. This service is not just about selling land—it is about building a structured pathway to secure long-term real estate ownership and future financial stability.",
    bn: "Eurostar Plot Sales সার্ভিস শুরু থেকে শেষ পর্যন্ত সম্পূর্ণ সহায়তা প্রদান করে—বুকিং, ডকুমেন্টেশন, পেমেন্ট স্ট্রাকচার, লিগ্যাল গাইডেন্স এবং চূড়ান্ত রেজিস্ট্রেশন পর্যন্ত। এর মূল লক্ষ্য হলো গ্রাহকের জন্য একটি স্বচ্ছ, নির্ভরযোগ্য এবং আইনগতভাবে সুরক্ষিত জমি মালিকানা অভিজ্ঞতা নিশ্চিত করা। এই সার্ভিস শুধু জমি বিক্রি নয়—বরং একটি কাঠামোবদ্ধ ভবিষ্যৎ সম্পদ তৈরির পথ।",
  },
}

const fractionalOverview = {
  title: { en: "Fractional Property Ownership — Service Overview", bn: "Fractional Property Ownership — সার্ভিস ওভারভিউ" },
  paragraphs: {
    en: [
      "Eurostar Group Fractional Property Ownership Service is designed for young buyers, small investors, first-time earners and NRBs who dream of owning land but want a more affordable and flexible way to start.",
      "Instead of buying a full plot or property, customers can invest a small amount of capital and own a fraction (share) of real, asset-backed land projects. This allows more people to enter the real estate market without the burden of large upfront investment, while still staying connected to real property ownership.",
      "Each project is structured through a Special Purpose Vehicle (SPV) model, where land assets are legally held and managed under a dedicated company structure. Investor ownership is recorded through proper share allocation in their name, ensuring clear legal recognition of their participation in the asset.",
      "The structure is designed with legal safeguards under relevant Bangladeshi regulatory frameworks (RJC Bangladesh compliance principles and applicable property laws), ensuring transparency, documentation clarity and investor protection.",
      "Eurostar provides full support throughout the journey—from onboarding and documentation to legal verification, SPV share allocation and ownership record management. Additionally, we offer a P2P property listing system, allowing investors to list their fractional holdings for sale and enabling them to purchase additional property shares from other verified investors, creating a flexible and active secondary ownership market within the ecosystem.",
      "This is not just an investment—it is a secure and structured pathway for young and small-capital consumers to own a real piece of land, step by step.",
    ],
    bn: [
      "Eurostar Group এর Fractional Property Ownership Service এমনভাবে ডিজাইন করা হয়েছে, যাতে তরুণ ক্রেতা, ছোট বিনিয়োগকারী এবং প্রবাসী বাংলাদেশিরা (NRB) সহজ, সাশ্রয়ী এবং ফ্লেক্সিবল উপায়ে জমির মালিকানা শুরু করতে পারেন।",
      "পূর্ণ প্লট বা সম্পত্তি কেনার পরিবর্তে, গ্রাহকরা কম মূলধন দিয়ে বাস্তব জমি-ভিত্তিক সম্পদের একটি অংশ (fraction/share) কিনে মালিক হতে পারেন। এতে বড় অঙ্কের প্রাথমিক বিনিয়োগ ছাড়াই রিয়েল এস্টেট মার্কেটে প্রবেশ করা সম্ভব হয়, তবে মালিকানা বাস্তব সম্পদের সাথেই যুক্ত থাকে।",
      "প্রতিটি প্রকল্প Special Purpose Vehicle (SPV) কাঠামোর মাধ্যমে পরিচালিত হয়, যেখানে জমির সম্পদ একটি আলাদা কোম্পানি কাঠামোর অধীনে আইনগতভাবে ধারণ ও ব্যবস্থাপনা করা হয়। বিনিয়োগকারীর মালিকানা তাদের নামে শেয়ার বরাদ্দের মাধ্যমে রেকর্ড করা হয়, যা সম্পদের উপর তাদের অংশগ্রহণকে স্পষ্টভাবে আইনগত স্বীকৃতি দেয়।",
      "এই কাঠামোটি বাংলাদেশের প্রযোজ্য আইন ও নিয়ন্ত্রক (RJC Bangladesh কমপ্লায়েন্স নীতিমালা এবং সংশ্লিষ্ট সম্পত্তি আইন) অনুযায়ী ডিজাইন করা হয়েছে, যাতে স্বচ্ছতা, ডকুমেন্টেশন নিরাপত্তা এবং বিনিয়োগকারীর সুরক্ষা নিশ্চিত হয়।",
      "Eurostar সম্পূর্ণ সহায়তা প্রদান করে—অনবোর্ডিং, ডকুমেন্টেশন, লিগ্যাল ভেরিফিকেশন, SPV শেয়ার বরাদ্দ এবং মালিকানা রেকর্ড ব্যবস্থাপনা পর্যন্ত। এছাড়াও, আমরা একটি P2P প্রপার্টি লিস্টিং সিস্টেম প্রদান করি, যেখানে বিনিয়োগকারীরা তাদের ফ্র্যাকশনাল শেয়ার বিক্রি করতে পারেন এবং একই সঙ্গে অন্য ভেরিফাইড বিনিয়োগকারীদের কাছ থেকে অতিরিক্ত শেয়ার কিনতে পারেন।",
      "এটি শুধু একটি বিনিয়োগ নয়—বরং এটি তরুণ এবং ছোট মূলধনের বিনিয়োগকারীদের জন্য ধাপে ধাপে বাস্তব জমির মালিক হওয়ার একটি নিরাপদ ও কাঠামোবদ্ধ পথ।",
    ],
  },
}

const fractionalHowItWorks = {
  title: { en: "Eurostar Fractional Land Ownership — How It Works", bn: "Eurostar Fractional Land Ownership — কীভাবে কাজ করে" },
  intro: {
    en: "Eurostar Group Fractional Land Ownership is a simple, structured way to invest in real land assets without needing to buy an entire plot.",
    bn: "Eurostar Group Fractional Land Ownership হলো একটি আধুনিক ও কাঠামোবদ্ধ রিয়েল এস্টেট বিনিয়োগ ব্যবস্থা, যেখানে একটি সম্পূর্ণ জমি না কিনে বাস্তব জমির একটি অংশ (fraction/share) কিনে মালিক হওয়া যায়।",
  },
  steps: [
    {
      title: { en: "1. We identify & select the property", bn: "১. আমরা প্রপার্টি নির্বাচন করি" },
      body: { en: "Eurostar finds and curates high-potential land projects in strategic growth locations.", bn: "Eurostar Group প্রথমে উচ্চ সম্ভাবনাময় জমির প্রকল্প নির্বাচন ও যাচাই করে।" },
      bullets: [
        { en: "Legal verification", bn: "আইনগত যাচাই (Legal Verification)" },
        { en: "Location advantage", bn: "অবস্থান ও কানেক্টিভিটি" },
        { en: "Future development potential", bn: "ভবিষ্যৎ উন্নয়ন সম্ভাবনা" },
        { en: "Long-term value growth prospects", bn: "দীর্ঘমেয়াদী মূল্য বৃদ্ধির সম্ভাবনা" },
      ],
    },
    {
      title: { en: "2. You invest along with other investors", bn: "২. আপনি অন্যদের সাথে মিলিয়ে বিনিয়োগ করেন" },
      body: {
        en: "You can invest a small or flexible amount and buy fractional shares of the land project alongside other investors.",
        bn: "আপনি ছোট বা ফ্লেক্সিবল মূলধন দিয়ে জমির ফ্র্যাকশনাল শেয়ার কিনতে পারেন। এতে বড় অঙ্কের টাকা ছাড়াই সহজে জমিতে বিনিয়োগ শুরু করা যায়।",
      },
    },
    {
      title: { en: "3. SPV structure is created", bn: "৩. SPV কাঠামো তৈরি করা হয়" },
      body: {
        en: "We establish a Special Purpose Vehicle (SPV) for the project. Your ownership shares are legally allocated and recorded under your name within the SPV structure.",
        bn: "প্রতিটি প্রকল্পের জন্য একটি Special Purpose Vehicle (SPV) তৈরি করা হয়। এই কাঠামোর মাধ্যমে আপনার মালিকানা শেয়ার আইনগতভাবে আপনার নামে বরাদ্দ ও রেকর্ড করা হয়।",
      },
    },
    {
      title: { en: "4. Property is legally transferred to SPV", bn: "৪. সম্পত্তি SPV-এর নামে ট্রান্সফার করা হয়" },
      body: { en: "The selected land is officially transferred from the seller to the SPV entity.", bn: "নির্বাচিত জমিটি বিক্রেতার কাছ থেকে আইনগতভাবে SPV-এর নামে হস্তান্তর করা হয়।" },
      bullets: [
        { en: "Clear legal ownership structure", bn: "পরিষ্কার মালিকানা কাঠামো" },
        { en: "Proper documentation", bn: "সঠিক ডকুমেন্টেশন" },
        { en: "Secure asset holding", bn: "নিরাপদ সম্পদ ধারণ ব্যবস্থা" },
      ],
    },
    {
      title: { en: "5. Ownership certificates issued", bn: "৫. মালিকানা সার্টিফিকেট প্রদান করা হয়" },
      body: {
        en: "Once your shares are allocated, you receive official ownership documentation/certificates confirming your stake in the project.",
        bn: "শেয়ার বরাদ্দ সম্পন্ন হলে আপনি একটি অফিশিয়াল মালিকানা ডকুমেন্ট/সার্টিফিকেট পান, যা আপনার অংশীদারিত্ব নিশ্চিত করে।",
      },
    },
    {
      title: { en: "6. Grow, hold, or exit flexibly", bn: "৬. বিক্রি করার সুযোগ" },
      body: {
        en: "Increase your investment over time, hold for long-term value growth, or sell your fractional shares through the internal P2P marketplace.",
        bn: "আপনি চাইলে ধাপে ধাপে আরও বিনিয়োগ বাড়াতে পারেন, দীর্ঘমেয়াদে জমির মূল্য বৃদ্ধির সুবিধা নিতে পারেন, অথবা অভ্যন্তরীণ P2P মার্কেটপ্লেসের মাধ্যমে আপনার শেয়ার বিক্রি করতে পারেন।",
      },
    },
  ] as HowStep[],
  closing: {
    en: "Fractional ownership by Eurostar Group transforms traditional land buying into a modern, accessible, and structured investment system, allowing more people to participate in real estate ownership with confidence and flexibility.",
    bn: "Eurostar Group এর Fractional Ownership মডেল প্রচলিত জমি কেনার প্রক্রিয়াকে একটি আধুনিক, সহজ এবং স্বচ্ছ বিনিয়োগ ব্যবস্থায় রূপান্তর করে, যাতে আরও বেশি মানুষ সহজে রিয়েল এস্টেট মালিকানা শুরু করতে পারেন।",
  },
}

const landShareBenefits = {
  title: { en: "Benefits of buying a land share", bn: "জমির শেয়ার কেনার সুবিধা" },
  paragraphs: {
    en: [
      "With Eurostar Group, land share ownership is a smart and simple way to enter real estate without buying a full plot.",
      "You can start with a small investment and own a real, legally structured portion of land. Your share is backed by actual land assets and managed through a secure SPV system, ensuring transparency and legal protection.",
      "This model is ideal for young investors, small capital earners, and NRBs who want to invest in Bangladesh real estate from anywhere in the world.",
      "As the land value grows, your ownership value also increases. You can also scale your investment or exit through our internal P2P system for added flexibility.",
      "In short, it’s an easy, flexible, and secure way to start building real estate wealth with low entry cost and long-term growth potential.",
    ],
    bn: [
      "Eurostar Group এর মাধ্যমে জমির শেয়ার কেনা হলো রিয়েল এস্টেটে প্রবেশের একটি আধুনিক, সহজ এবং স্মার্ট উপায়—যেখানে পুরো প্লট না কিনেও আপনি বাস্তব জমির অংশীদার হতে পারেন।",
      "আপনি ছোট মূলধন দিয়ে শুরু করতে পারেন এবং একটি আইনগতভাবে SPV সিস্টেমের মাধ্যমে নিরাপদভাবে জমির মালিকানার অংশ পেতে পারেন। এতে আপনার বিনিয়োগ স্বচ্ছ, সুরক্ষিত এবং বাস্তব ভিত্তিক থাকে।",
      "এই মডেলটি বিশেষভাবে উপযোগী তরুণ বিনিয়োগকারী, ছোট সঞ্চয়কারী এবং প্রবাসী বাংলাদেশিদের (NRB) জন্য, যারা যেকোনো স্থান থেকে বাংলাদেশে সম্পত্তিতে বিনিয়োগ করতে চান।",
      "সময়ের সাথে জমির মূল্য বৃদ্ধি পেলে আপনার শেয়ারের মূল্যও বাড়ে। পাশাপাশি আপনি চাইলে ধীরে ধীরে বিনিয়োগ বাড়াতে বা P2P সিস্টেমের মাধ্যমে শেয়ার বিক্রি করতেও পারেন।",
      "সংক্ষেপে, এটি কম খরচে, সহজে এবং নিরাপদভাবে দীর্ঘমেয়াদী সম্পদ গড়ার একটি আধুনিক রিয়েল এস্টেট বিনিয়োগ পদ্ধতি।",
    ],
  },
}

const legalDetailed = {
  title: { en: "Legal services — detailed description", bn: "লিগ্যাল সার্ভিস — বিস্তারিত বিবরণ" },
  intro: {
    en: "Eurostar Group offers a fully integrated and structured legal service framework designed to support safe, transparent and legally compliant property ownership, investment and transfer and beyond. We particularly focus on serving Non-Resident Bangladeshis (NRBs), expatriates, investors and land owners, ensuring they can confidently manage property matters in Bangladesh with complete legal clarity and remote support.",
    bn: "Eurostar Group একটি পূর্ণাঙ্গ ও কাঠামোবদ্ধ প্রপার্টি লিগ্যাল সার্ভিস প্রদান করে, যার লক্ষ্য হলো জমি ক্রয়, বিনিয়োগ মালিকানা ও ক্লায়েন্টকে সুরক্ষা প্রদান করে—প্রাথমিক যাচাই থেকে শুরু করে চূড়ান্ত রেজিস্ট্রেশন এবং মালিকানা নিশ্চিতকরণ পর্যন্ত। আমরা বিশেষভাবে প্রবাসী বাংলাদেশি (NRB), বিদেশে অবস্থানরত প্রবাসী, বিনিয়োগকারী জন্য এই সেবা ডিজাইন করেছি, যাতে তারা বাংলাদেশে উপস্থিত না থেকেও সম্পূর্ণ আইনগত সহায়তায় সম্পত্তি পরিচালনা করতে পারেন।",
  },
  sections: [
    {
      title: { en: "Succession (Inheritance) Services", bn: "উত্তরাধিকার (Succession) সেবা" },
      body: {
        en: "Our succession services are designed to handle complex inheritance cases with legal accuracy and sensitivity. We assist in identifying rightful heirs, preparing inheritance documents, verifying ownership lineage, and facilitating lawful transfer of property from deceased owners to legal successors.",
        bn: "উত্তরাধিকার সংক্রান্ত জটিল সম্পত্তি বিষয়গুলো আমরা আইনগতভাবে সঠিক ও সংবেদনশীলভাবে পরিচালনা করি। এর মধ্যে অন্তর্ভুক্ত রয়েছে—সঠিক উত্তরাধিকারী নির্ধারণ, আইনগত ডকুমেন্ট প্রস্তুত, মালিকানা ইতিহাস যাচাই এবং মৃত মালিকের সম্পত্তি আইনগতভাবে বৈধ উত্তরাধিকারীদের নামে হস্তান্তর।",
      },
    },
    {
      title: { en: "Land Verification & Title Search", bn: "জমি যাচাই ও টাইটেল সার্চ" },
      body: {
        en: "We conduct deep-level land verification to confirm the authenticity of ownership and legal status of a property, including records review, ownership history, deed validation, and checks for disputes, liens, or encumbrances.",
        bn: "আমরা সম্পূর্ণভাবে জমির মালিকানা ও আইনগত অবস্থা যাচাই করি। এতে সরকারি রেকর্ড, পূর্ববর্তী মালিকানা ইতিহাস, দলিল যাচাই এবং কোনো ধরনের বিরোধ, বন্ধক বা জটিলতা আছে কিনা তা পরীক্ষা করা হয়।",
      },
    },
    {
      title: { en: "Due Diligence & Ownership Authentication", bn: "ডিউ-ডিলিজেন্স ও মালিকানা যাচাইকরণ" },
      body: {
        en: "Our due diligence process provides a complete legal assessment of the property by verifying seller credibility, documents, mutation records, and legal references for accurate ownership authentication.",
        bn: "আমাদের ডিউ ডিলিজেন্স প্রক্রিয়ায় সম্পত্তির সম্পূর্ণ আইনগত বিশ্লেষণ করা হয়। বিক্রেতার পরিচয়, দলিলের সত্যতা, মিউটেশন রেকর্ড এবং অন্যান্য আইনগত তথ্য যাচাই করে নিশ্চিত করা হয় যে সম্পত্তিটি নিরাপদ এবং বৈধ।",
      },
    },
    {
      title: { en: "Mutation (Khatian / Record Update) Support", bn: "মিউটেশন (খতিয়ান/রেকর্ড আপডেট) সহায়তা" },
      body: {
        en: "We provide end-to-end assistance in updating land records with authorities so the buyer’s name is officially recorded in Khatian and related revenue records.",
        bn: "জমি ক্রয়ের পর সরকারি রেকর্ডে নতুন মালিকের নাম অন্তর্ভুক্ত করার জন্য আমরা পূর্ণ সহায়তা প্রদান করি। আমাদের টিম আবেদন, ডকুমেন্টেশন এবং সংশ্লিষ্ট অফিসে ফলো-আপ সম্পূর্ণভাবে পরিচালনা করে।",
      },
    },
    {
      title: { en: "Registration Assistance & Documentation", bn: "রেজিস্ট্রেশন সহায়তা ও ডকুমেন্টেশন" },
      body: {
        en: "Eurostar supports clients through the entire registration process, including stamp duty coordination, deed preparation, submissions, and official filing in compliance with government requirements.",
        bn: "আমরা সম্পূর্ণ রেজিস্ট্রেশন প্রক্রিয়ায় সহায়তা করি—দলিল প্রস্তুতি, স্ট্যাম্প ডিউটি, সাবমিশন এবং সরকারি রেকর্ডে রেজিস্ট্রেশন সম্পন্ন করা পর্যন্ত।",
      },
    },
    {
      title: { en: "Power of Attorney (POA) Services", bn: "পাওয়ার অব অ্যাটর্নি (POA) সেবা" },
      body: {
        en: "For NRBs and overseas clients, we provide legally valid POA services including drafting, legal verification, notarization guidance, and enforceability checks.",
        bn: "প্রবাসী বাংলাদেশি ও বিদেশে অবস্থানরত ক্লায়েন্টদের জন্য আমরা আইনগতভাবে বৈধ POA প্রস্তুত করি, যার মাধ্যমে তারা বাংলাদেশে অবস্থানরত নির্ভরযোগ্য প্রতিনিধির মাধ্যমে সম্পত্তি পরিচালনা করতে পারেন।",
      },
    },
    {
      title: { en: "Sale Deed & Ownership Transfer Support", bn: "সেল ডিড ও মালিকানা হস্তান্তর সহায়তা" },
      body: {
        en: "We manage sale deed preparation and ownership transfer by drafting valid agreements, verifying transaction validity, and coordinating buyer-seller execution.",
        bn: "আমরা সেল ডিড প্রস্তুতি এবং সম্পূর্ণ মালিকানা হস্তান্তর প্রক্রিয়া পরিচালনা করি। এতে ক্রেতা ও বিক্রেতার মধ্যে আইনগতভাবে বৈধ চুক্তি তৈরি, দলিল যাচাই এবং মালিকানা স্থানান্তর নিশ্চিত করা হয়।",
      },
    },
    {
      title: { en: "Property Documentation Preparation & Review", bn: "প্রপার্টি ডকুমেন্টেশন প্রস্তুত ও রিভিউ" },
      body: {
        en: "Our legal experts prepare and review agreements, deeds, verification papers, and supporting legal files for accuracy, compliance, and risk prevention.",
        bn: "সব ধরনের সম্পত্তি সংক্রান্ত ডকুমেন্ট আমরা প্রস্তুত ও যাচাই করি। এতে ভুল, অসামঞ্জস্য বা ভবিষ্যৎ আইনি ঝুঁকি এড়ানো যায় এবং সম্পূর্ণ নিরাপদ লেনদেন নিশ্চিত হয়।",
      },
    },
    {
      title: { en: "Independent Legal Advisory (Property Disputes)", bn: "সম্পত্তি বিরোধ সংক্রান্ত স্বাধীন লিগ্যাল অ্যাডভাইজরি" },
      body: {
        en: "We provide expert advisory for property disputes, including boundary issues, ownership conflicts, documentation disputes, legal claim analysis, and resolution pathways.",
        bn: "আমরা সম্পত্তি সংক্রান্ত বিরোধের ক্ষেত্রে আইনগত পরামর্শ ও সমন্বয় প্রদান করি, যাতে আপনি বিদেশে থেকেও বিষয়গুলো পরিচালনা করতে পারেন।",
      },
    },
    {
      title: { en: "NRB & Expatriate Legal Support", bn: "NRB ও প্রবাসী লিগ্যাল সাপোর্ট" },
      body: {
        en: "A key strength of Eurostar Group is dedicated legal support for NRBs and expatriates, enabling full remote coordination and legal execution without physical presence in Bangladesh.",
        bn: "Eurostar Group-এর একটি গুরুত্বপূর্ণ অংশ হলো প্রবাসী বাংলাদেশিদের জন্য রিমোট লিগ্যাল সাপোর্ট। তারা বাংলাদেশে না থেকেও সম্পূর্ণ সম্পত্তি লেনদেন, ডকুমেন্টেশন ও আইনগত প্রক্রিয়া সম্পন্ন করতে পারেন।",
      },
    },
  ] as LegalDetailSection[],
}

export function getEurostarServicesPageCopy(language: AppLanguage) {
  const lang = language === "bn" ? "bn" : "en"
  return {
    intro: { eyebrow: serviceIntro.eyebrow[lang], title: serviceIntro.title[lang], subtitle: serviceIntro.subtitle[lang] },
    plotSalesOverview: { title: plotSalesOverviewI18n.title[lang], paragraphs: plotSalesOverviewI18n.paragraphs[lang] },
    paymentPlans: {
      heading: paymentPlans.heading[lang],
      plans: paymentPlans.plans.map((p) => ({ title: p.title[lang], body: p.body[lang] })),
      closing: paymentPlans.closing[lang],
    },
    fractionalOverview: { title: fractionalOverview.title[lang], paragraphs: fractionalOverview.paragraphs[lang] },
    fractionalHowItWorks: {
      title: fractionalHowItWorks.title[lang],
      intro: fractionalHowItWorks.intro[lang],
      steps: fractionalHowItWorks.steps.map((s) => ({
        title: s.title[lang],
        body: s.body[lang],
        bullets: s.bullets?.map((b) => b[lang]) ?? [],
      })),
      closing: fractionalHowItWorks.closing[lang],
    },
    landShareBenefits: { title: landShareBenefits.title[lang], paragraphs: landShareBenefits.paragraphs[lang] },
  }
}

export function getEurostarLegalDetailedCopy(language: AppLanguage) {
  const lang = language === "bn" ? "bn" : "en"
  return {
    title: legalDetailed.title[lang],
    intro: legalDetailed.intro[lang],
    sections: legalDetailed.sections.map((s) => ({ title: s.title[lang], body: s.body[lang] })),
  }
}
