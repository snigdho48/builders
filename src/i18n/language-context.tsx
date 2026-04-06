import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

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
    "nav.listings": "Listings",
    "nav.p2p": "P2P",
    "nav.contact": "Contact",
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
    "listings.subtitle": "Search and filter whole-parcel land: direct buy or installment plans.",
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
    "nav.listings": "লিস্টিং",
    "nav.p2p": "পিটুপি",
    "nav.contact": "যোগাযোগ",
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
    "listings.subtitle": "পুরো জমির লিস্টিং খুঁজুন: সরাসরি কিনুন বা কিস্তিতে নিন।",
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
  return "bn"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<AppLanguage>(() => readInitialLanguage())

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

