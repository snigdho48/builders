import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { syncRootFontForScriptLang } from "@/i18n/sync-root-font-for-lang"

export type AppLanguage = "en" | "bn"

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (next: AppLanguage) => void
  toggleLanguage: () => void
  t: (key: string, fallback?: string) => string
}

const LANGUAGE_KEY = "appLanguage"

const messages: Record<AppLanguage, Record<string, string>> = {
  en: {
    "lang.en": "EN",
    "lang.bn": "বাংলা",
    "nav.home": "Home",
    "nav.buyPlots": "Buy plots",
    "nav.buyLandShare": "Land share",
    "nav.allListings": "All listings",
    "nav.p2p": "P2P",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.legal": "Legal",
    "nav.faq": "FAQ",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.signIn": "Sign in",
    "nav.register": "Register",
    "nav.or": "or",
    "nav.welcomeBack": "Welcome back",
    "nav.search": "Search",
    "nav.logout": "Logout",
    "nav.landDashboard": "Land dashboard",
    "listings.title": "Explore land listings",
    "listings.titleBuyPlots": "Buy plots",
    "listings.titleLandShare": "Buy land share",
    "listings.subtitle": "Search and filter whole-parcel land: direct buy or installment plans.",
    "listings.subtitleBuyPlots": "Whole-parcel and per-block plot listings. 1% and 50% plans apply only here when the admin promo is on.",
    "listings.subtitleLandShare": "Fractional / land-share channel — investment-style booking (not the 1% / 50% plot promos).",
    "listings.land": "Land",
    "listings.search": "Search",
    "listings.location": "Location",
    "listings.saleType": "Sale type",
    "listings.perPage": "Per page",
    "listings.searchPlaceholder": "Title or location",
    "listings.locationPlaceholder": "Area / district",
    "listings.clearFilters": "Clear filters",
    "listings.noMatch": "No listings match your filters.",
    "listings.showing": "Showing listings",
    "listings.previous": "Previous",
    "listings.next": "Next",
    "listings.pageOf": "Page {page} / {totalPages}",
  },
  bn: {
    "lang.en": "EN",
    "lang.bn": "বাংলা",
    "nav.home": "হোম",
    "nav.buyPlots": "প্লট কিনুন",
    "nav.buyLandShare": "ল্যান্ড শেয়ার",
    "nav.allListings": "সব লিস্টিং",
    "nav.p2p": "পিটুপি",
    "nav.about": "আমাদের সম্পর্কে",
    "nav.contact": "যোগাযোগ",
    "nav.legal": "আইনি",
    "nav.faq": "প্রশ্নোত্তর",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.profile": "প্রোফাইল",
    "nav.signIn": "লগইন",
    "nav.register": "রেজিস্টার",
    "nav.or": "অথবা",
    "nav.welcomeBack": "আবার স্বাগতম",
    "nav.search": "খুঁজুন",
    "nav.logout": "লগআউট",
    "nav.landDashboard": "ল্যান্ড ড্যাশবোর্ড",
    "listings.title": "জমির লিস্টিং দেখুন",
    "listings.titleBuyPlots": "প্লট কিনুন",
    "listings.titleLandShare": "ল্যান্ড শেয়ার কিনুন",
    "listings.subtitle": "পুরো জমির লিস্টিং খুঁজুন: সরাসরি কিনুন বা কিস্তিতে নিন।",
    "listings.subtitleBuyPlots": "পুরো বা ব্লকভিত্তিক প্লট। ১% ও ৫০% প্ল্যান শুধু এখানে, যখন অ্যাডমিন প্রোমো চালু থাকে।",
    "listings.subtitleLandShare": "ভগ্নাংশ / ল্যান্ড-শেয়ার চ্যানেল — ইনভেস্টমেন্ট বুকিং (১%/৫০% প্লট প্রোমো নয়)।",
    "listings.land": "জমি",
    "listings.search": "সার্চ",
    "listings.location": "লোকেশন",
    "listings.saleType": "বিক্রয় ধরন",
    "listings.perPage": "প্রতি পেজে",
    "listings.searchPlaceholder": "শিরোনাম বা লোকেশন",
    "listings.locationPlaceholder": "এলাকা / জেলা",
    "listings.clearFilters": "ফিল্টার রিসেট",
    "listings.noMatch": "আপনার ফিল্টারে কোনো লিস্টিং পাওয়া যায়নি।",
    "listings.showing": "লিস্টিং দেখানো হচ্ছে",
    "listings.previous": "আগের",
    "listings.next": "পরের",
    "listings.pageOf": "পৃষ্ঠা {page} / {totalPages}",
  },
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en"
  const raw = localStorage.getItem(LANGUAGE_KEY)
  if (raw === "en" || raw === "bn") return raw
  return "en"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<AppLanguage>(() => readInitialLanguage())

  useEffect(() => {
    syncRootFontForScriptLang()
  }, [language])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_KEY) syncRootFontForScriptLang()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setLanguage = (next: AppLanguage) => {
    setLang(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_KEY, next)
    }
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "en" ? "bn" : "en"),
      t: (key: string, fallback?: string) => messages[language][key] ?? fallback ?? key,
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}

