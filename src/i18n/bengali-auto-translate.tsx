import { useEffect } from "react"

import { useLanguage } from "@/i18n/language-context"

const phraseMap: Record<string, string> = {
  "Sign in": "লগইন",
  "Register": "রেজিস্টার",
  "Logout": "লগআউট",
  "Dashboard": "ড্যাশবোর্ড",
  "Profile": "প্রোফাইল",
  "Land dashboard": "ল্যান্ড ড্যাশবোর্ড",
  "Search listings by title or location": "শিরোনাম বা লোকেশন দিয়ে লিস্টিং খুঁজুন",
  "Search by title or location": "শিরোনাম বা লোকেশন দিয়ে খুঁজুন",
  "Open search": "সার্চ খুলুন",
  "Close search": "সার্চ বন্ধ করুন",
  "Open menu": "মেনু খুলুন",
  "Close menu": "মেনু বন্ধ করুন",
  "Back to home": "হোমে ফিরে যান",
  "Loading": "লোড হচ্ছে",
  "No data": "কোনো ডেটা নেই",
  "No listings": "কোনো লিস্টিং নেই",
  "No bookings": "কোনো বুকিং নেই",
  "No booking requests": "কোনো বুকিং রিকোয়েস্ট নেই",
  "No installment schedules available yet.": "এখনও কোনো কিস্তির সময়সূচি নেই।",
  "Installment tracker": "কিস্তি ট্র্যাকার",
  "Land booking requests": "জমি বুকিং অনুরোধ",
  "Place a bid": "বিড দিন",
  "Submit bid": "বিড সাবমিট করুন",
  "Sending…": "পাঠানো হচ্ছে…",
  "Save": "সংরক্ষণ করুন",
  "Saving…": "সংরক্ষণ হচ্ছে…",
  "Cancel": "বাতিল",
  "Edit": "সম্পাদনা",
  "Withdraw": "প্রত্যাহার",
  "Actions": "অ্যাকশন",
  "Status": "স্ট্যাটাস",
  "Notification": "নোটিফিকেশন",
  "Location": "লোকেশন",
  "Plan": "প্ল্যান",
  "Booked": "বুকড",
  "Investor": "বিনিয়োগকারী",
  "Land": "জমি",
  "Amount": "পরিমাণ",
  "Paid": "পরিশোধিত",
  "Due": "বকেয়া",
  "Previous": "আগের",
  "Next": "পরের",
  "Details": "বিস্তারিত",
  "Overview": "সংক্ষিপ্ত বিবরণ",
  "Description": "বিবরণ",
  "Features": "ফিচারসমূহ",
  "Seller contact": "বিক্রেতার যোগাযোগ",
  "Guide price": "নির্দেশক মূল্য",
  "Mark complete": "সম্পন্ন হিসেবে চিহ্নিত করুন",
}

const wordMap: Record<string, string> = {
  Home: "হোম",
  Listings: "লিস্টিং",
  Contact: "যোগাযোগ",
  Search: "সার্চ",
  Clear: "রিসেট",
  filters: "ফিল্টার",
  Filter: "ফিল্টার",
  page: "পৃষ্ঠা",
  Page: "পৃষ্ঠা",
  bookings: "বুকিংসমূহ",
  Booking: "বুকিং",
  booking: "বুকিং",
  pending: "পেন্ডিং",
  accepted: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
  paid: "পরিশোধিত",
  unpaid: "অপরিশোধিত",
  overdue: "ওভারডিউ",
  partial: "আংশিক",
  upcoming: "আসন্ন",
  "due soon": "শীঘ্রই পরিশোধযোগ্য",
}

const hasBangla = /[\u0980-\u09FF]/

function translateLoose(input: string): string {
  if (!input.trim()) return input
  if (hasBangla.test(input)) return input

  let out = input
  const phrases = Object.entries(phraseMap).sort((a, b) => b[0].length - a[0].length)
  for (const [en, bn] of phrases) {
    const re = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
    out = out.replace(re, bn)
  }

  for (const [en, bn] of Object.entries(wordMap)) {
    const re = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")
    out = out.replace(re, bn)
  }

  return out
}

function shouldSkipNode(node: Node): boolean {
  const p = node.parentElement
  if (!p) return true
  if (p.closest("[data-no-translate='true']")) return true
  const tag = p.tagName.toLowerCase()
  return tag === "script" || tag === "style" || tag === "code" || tag === "pre" || tag === "textarea"
}

export function BengaliAutoTranslate() {
  const { language } = useLanguage()

  useEffect(() => {
    if (language !== "bn") return

    const apply = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let n = walker.nextNode()
      while (n) {
        if (!shouldSkipNode(n)) {
          const txt = n.nodeValue ?? ""
          const next = translateLoose(txt)
          if (next !== txt) n.nodeValue = next
        }
        n = walker.nextNode()
      }

      const attrs = ["placeholder", "title", "aria-label", "alt"] as const
      const all = document.querySelectorAll<HTMLElement>("*")
      all.forEach((el) => {
        if (el.closest("[data-no-translate='true']")) return
        attrs.forEach((attr) => {
          const v = el.getAttribute(attr)
          if (!v) return
          const next = translateLoose(v)
          if (next !== v) el.setAttribute(attr, next)
        })
      })
    }

    apply()
    const obs = new MutationObserver(() => apply())
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true })
    return () => obs.disconnect()
  }, [language])

  return null
}

