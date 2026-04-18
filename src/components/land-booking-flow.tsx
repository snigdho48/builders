import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { Link, useNavigate } from "react-router-dom"

import { LandPlotSelector, type PlotOption } from "@/components/land-plot-selector"
import { useToast } from "@/components/ui/use-toast"
import {
  createLandBooking,
  createRetailInvestor,
  getBookingPromoSettings,
  getMe,
  listRetailInvestors,
} from "@/services/api"
import { normalizeStoredRole } from "@/routes/protected-route"
import type {
  BookingPromoSettings,
  CatalogListing,
  LandBookingCreatePayload,
  LandBookingKind,
  LandBookingPlanType,
  Property,
  RetailInvestor,
} from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"
import { isLandShareListing, listingDetailPath, propertyUsesInvestmentBooking } from "@/utils/property-display"
import type { PlotBookingApplicationLocationState } from "@/types/plot-booking"

type PlotInstallmentPlan = "one_percent_installment" | "fifty_percent_installment"

type Step = "choose" | "pick_plot" | "form"

type LandBookingFlowProps = {
  listing: CatalogListing
  /** Called after a successful API submit (e.g. navigate away). */
  onSuccess?: () => void
  allowStaffBookingForInvestor?: boolean
  /** When staff starts booking from the dashboard wizard, investor is already chosen — hide duplicate assignment UI. */
  prefilledInvestor?: RetailInvestor | null
}

function renderInstructionText(line: string) {
  const headMatch = line.match(/<head>(.*?)<\/head>/i)
  const explicitHeading = headMatch?.[1]?.trim() ?? ""
  const bodySource = line.replace(/<head>.*?<\/head>/i, "").trim()
  const segments = bodySource
    .split("<br>")
    .map((s) => s.trim())
    .filter(Boolean)

  const [firstSegment] = segments
  const [first, ...rest] = (firstSegment ?? "").split(":")
  const headingMarkers = ["📌", "📊", "⚠️", "📑", "🎯", "📢", "🌟", "🚀", "👉", "💎"]
  const hasHeading = rest.length > 0 && headingMarkers.some((m) => first.includes(m))

  const bulletItems: string[] = []
  const paragraphItems: string[] = []
  for (const seg of segments) {
    if (seg.includes("<bullet>")) {
      const bullets = seg
        .split("<bullet>")
        .map((b) => b.trim())
        .filter(Boolean)
      bulletItems.push(...bullets)
      continue
    }
    paragraphItems.push(seg)
  }

  const badgeHeading = explicitHeading || (hasHeading ? `${first}:` : "")
  const initialParagraph = explicitHeading
    ? paragraphItems
    : hasHeading
      ? [rest.join(":").trim(), ...paragraphItems.slice(1)]
      : paragraphItems

  if (!badgeHeading && bulletItems.length === 0) {
    return (
      <>
        {initialParagraph.map((seg, i) => (
          <p key={`plain-${i}`} className="text-xs text-slate-700">
            {seg}
          </p>
        ))}
      </>
    )
  }

  return (
    <>
      {badgeHeading ? (
        <span className="mr-1 inline-flex rounded-md bg-[#0b1f44]/10 px-1.5 py-0.5 font-semibold text-[#0b1f44]">
          {badgeHeading}
        </span>
      ) : null}
      {initialParagraph.map((seg, i) => (
        <p key={`body-${i}`} className="mt-1 text-xs text-slate-700">
          {seg}
        </p>
      ))}
      {bulletItems.length > 0 ? (
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {bulletItems.map((b, i) => (
            <li key={`bullet-${i}`} className="rounded-md bg-[#0b1f44]/5 px-2 py-1 text-[11px] text-slate-700">
              • {b}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

const PLAN_INSTRUCTIONS: Record<PlotInstallmentPlan, { title: string; points: string[] }> = {
  one_percent_installment: {
    title: "🔷 ১% মাসিক কিস্তি প্ল্যান",
    points: [
      "🌟 ধীরে ধীরে পরিশোধ, নিশ্চিত জমির মালিকানা",
      "<head>আপনি কি কম টাকায় জমি কিনতে চান?</head><br> তাহলে এই প্ল্যানটি আপনার জন্য সবচেয়ে উপযুক্ত।",
      "<head>👉 এখন আর বড় অংকের টাকা একসাথে লাগবে না</head> মাত্র ১% মাসিক কিস্তিতে শুরু করুন আপনার জমির যাত্রা।",
      "<head>📌 প্ল্যানের মূল ধারণা:</head><br> প্রতি মাসে জমির মোট মূল্যের মাত্র ১% পরিশোধ; <br>যখন মোট পরিশোধ ৫০% পূর্ণ হবে, তখন ✅ আপনার নামে জমির রেজিস্ট্রেশন সম্পন্ন করা হবে।",
      "📊 সহজ উদাহরণ: জমির মূল্য ১০,০০,০০০ টাকা হলে মাসিক কিস্তি ১০,০০০ টাকা; ৫০% (৫,০০,০০০ টাকা) পরিশোধ হলে 👉 জমি আপনার নামে রেজিস্ট্রেশন।",
      "<head>💎 এই প্ল্যানটি কেন সেরা?</head> <br>✔ কম টাকায় শুরু করার সুযোগ <br>✔ মাসিক আয় অনুযায়ী সহজ পরিশোধ <br>✔ সঞ্চয়ের মতো ধাপে ধাপে বিনিয়োগ <br>✔ নতুন ক্রেতা ও মধ্যম আয়ের মানুষের জন্য উপযোগী।",
      "⚠️ গুরুত্বপূর্ণ শর্তাবলী: <br>নির্ধারিত সময়ের মধ্যে কিস্তি প্রদান বাধ্যতামূলক; কিস্তি বকেয়া হলে জরিমানা প্রযোজ্য হতে পারে; ৫০% পূর্ণ হওয়ার আগে রেজিস্ট্রেশন করা হবে না; রেজিস্ট্রেশন খরচ ও অন্যান্য চার্জ আলাদা।",
      "📑 ক্রয় প্রক্রিয়া:<br> প্লট নির্বাচন করুন → বুকিং ফি প্রদান করুন → মাসিক ১% কিস্তি শুরু করুন → ৫০% পূর্ণ হলে রেজিস্ট্রেশন সম্পন্ন করুন।",
      "<head>🎯 কার জন্য এই প্ল্যান?</head><br> যারা কম বাজেটে জমি কিনতে চান, যারা ধীরে ধীরে ইনভেস্ট করতে চান, নতুন বিনিয়োগকারী।",
    ],
  },
  fifty_percent_installment: {
    title: "🟢 ৫০% ডাউন পেমেন্ট + ১% কিস্তি প্ল্যান",
    points: [
      "🚀 আজই মালিক হোন, বাকি টাকা দিন সহজ কিস্তিতে",
      "<head>আপনি কি দ্রুত জমির মালিক হতে চান?</head><br> তাহলে এই প্ল্যানটি আপনার জন্য পারফেক্ট।",
      "<head>👉 একবার ৫০% পেমেন্ট করলেই, সাথে সাথে জমি আপনার নামে!</head>",
      "📌 প্ল্যানের মূল ধারণা:<br> প্রথমে জমির মূল্যের ৫০% এককালীন প্রদান;<br>✅  সাথে সাথে জমির রেজিস্ট্রেশন সম্পন্ন করা হবে;<br> বাকি ৫০% প্রতি মাসে ১% করে পরিশোধ।",
      "📊 সহজ উদাহরণ: <br>জমির মূল্য ১০,০০,০০০ টাকা হলে প্রথম পেমেন্ট ৫,০০,০০০ টাকা;<br> 👉 সাথে সাথে রেজিস্ট্রেশন;<br> বাকি ৫,০০,০০০ টাকা মাসে ১০,০০০ টাকা করে পরিশোধ।",
      "<head>💎 এই প্ল্যানটি কেন সেরা?</head><br> ✔ সাথে সাথে জমির মালিকানা<br> ✔ বিনিয়োগে সর্বোচ্চ নিরাপত্তা<br> ✔ জমির ভবিষ্যৎ মূল্য বৃদ্ধির সম্পূর্ণ সুবিধা<br> ✔ ব্যবসায়ী ও সিরিয়াস ক্রেতাদের জন্য আদর্শ।",
      "⚠️ গুরুত্বপূর্ণ শর্তাবলী: <br>৫০% ডাউন পেমেন্ট সম্পূর্ণ দিতে হবে;<br> বাকি কিস্তি নির্ধারিত সময় অনুযায়ী পরিশোধ করতে হবে;<br> কিস্তি বকেয়া হলে আইনগত ব্যবস্থা নেওয়া হতে পারে;<br> রেজিস্ট্রেশন ও অন্যান্য চার্জ প্রযোজ্য।",
      "📑 ক্রয় প্রক্রিয়া: <br>প্লট নির্বাচন করুন → ৫০% ডাউন পেমেন্ট প্রদান করুন → সাথে সাথে রেজিস্ট্রেশন সম্পন্ন করুন → বাকি টাকা মাসিক ১% কিস্তিতে পরিশোধ করুন।",
      "<head>🎯 কার জন্য এই প্ল্যান?</head> <br>যারা দ্রুত মালিক হতে চান, যারা নিরাপদ ইনভেস্টমেন্ট চান, ব্যবসায়ী ও উচ্চ আয়ের ক্রেতা।",
    ],
  },
}

const PLAN_THEME: Record<PlotInstallmentPlan, { wrap: string; title: string; item: string }> = {
  one_percent_installment: {
    wrap: "border-[#0b1f44]/20 bg-gradient-to-br from-[#0b1f44]/5 via-white to-[#f58e43]/10",
    title: "text-[#0b1f44]",
    item: "border-[#0b1f44]/15 bg-white/85",
  },
  fifty_percent_installment: {
    wrap: "border-[#f58e43]/30 bg-gradient-to-br from-[#f58e43]/10 via-white to-[#0b1f44]/5",
    title: "text-[#7a3a12]",
    item: "border-[#f58e43]/20 bg-white/90",
  },
}

function planTypeLabel(pt: LandBookingPlanType): string {
  if (pt === "one_percent_installment") return "1% installment plan"
  if (pt === "fifty_percent_installment") return "50% installment plan"
  return "Investment"
}

function billingPeriodLabel(p: string): string {
  if (p === "yearly") return "per year"
  if (p === "one_time") return "one time"
  return "per month"
}

type StaffInvestorAssignmentProps = {
  prefilledInvestor: RetailInvestor | null
  investorSearch: string
  onInvestorSearchChange: (v: string) => void
  investorMatches: RetailInvestor[]
  selectedInvestor: RetailInvestor | null
  pickInvestor: (inv: RetailInvestor) => void
  creatingInvestor: boolean
  setCreatingInvestor: Dispatch<SetStateAction<boolean>>
  createInvestorEmail: string
  setCreateInvestorEmail: (v: string) => void
  createInvestorPassword: string
  setCreateInvestorPassword: (v: string) => void
  createInvestorFirstName: string
  setCreateInvestorFirstName: (v: string) => void
  createInvestorLastName: string
  setCreateInvestorLastName: (v: string) => void
  createInvestorPhone: string
  setCreateInvestorPhone: (v: string) => void
  createInvestorBusy: boolean
  handleCreateInvestor: () => void | Promise<void>
}

function StaffInvestorAssignment(props: StaffInvestorAssignmentProps) {
  const {
    prefilledInvestor,
    investorSearch,
    onInvestorSearchChange,
    investorMatches,
    selectedInvestor,
    pickInvestor,
    creatingInvestor,
    setCreatingInvestor,
    createInvestorEmail,
    setCreateInvestorEmail,
    createInvestorPassword,
    setCreateInvestorPassword,
    createInvestorFirstName,
    setCreateInvestorFirstName,
    createInvestorLastName,
    setCreateInvestorLastName,
    createInvestorPhone,
    setCreateInvestorPhone,
    createInvestorBusy,
    handleCreateInvestor,
  } = props

  if (prefilledInvestor) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#0b1f44]">Investor (from dashboard)</p>
        <p className="mt-2 text-sm text-[#0b1f44]">
          <span className="font-semibold">{prefilledInvestor.username}</span>
          <span className="text-slate-600"> · #{prefilledInvestor.id}</span>
        </p>
        {prefilledInvestor.email ? (
          <p className="mt-0.5 text-xs text-slate-600">{prefilledInvestor.email}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#0b1f44]">Investor assignment</p>
      <p className="mt-1 text-xs text-slate-600">
        Type investor username to search. If not found, create and auto-assign.
      </p>
      <input
        className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
        value={investorSearch}
        onChange={(e) => {
          onInvestorSearchChange(e.target.value)
        }}
        placeholder="Investor username"
      />
      {investorMatches.length > 0 ? (
        <div className="mt-2 space-y-1">
          {investorMatches.map((inv) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => pickInvestor(inv)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:border-slate-300"
            >
              <span className="font-semibold text-[#0b1f44]">{inv.username}</span>
              <span className="ml-2 text-slate-500">{inv.email}</span>
            </button>
          ))}
        </div>
      ) : null}
      {selectedInvestor ? (
        <p className="mt-2 text-xs text-emerald-700">
          Assigned investor: {selectedInvestor.username} (#{selectedInvestor.id})
        </p>
      ) : null}
      {!selectedInvestor && investorSearch.trim() ? (
        <div className="mt-3">
          <button
            type="button"
            className="text-xs font-semibold text-[#f58e43] hover:underline"
            onClick={() => setCreatingInvestor((v) => !v)}
          >
            {creatingInvestor ? "Cancel create investor" : `Create investor "${investorSearch.trim()}"`}
          </button>
        </div>
      ) : null}
      {creatingInvestor ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:col-span-2"
            value={createInvestorEmail}
            onChange={(e) => setCreateInvestorEmail(e.target.value)}
            placeholder="Investor email"
            type="email"
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:col-span-2"
            value={createInvestorPassword}
            onChange={(e) => setCreateInvestorPassword(e.target.value)}
            placeholder="Temporary password"
            type="text"
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={createInvestorFirstName}
            onChange={(e) => setCreateInvestorFirstName(e.target.value)}
            placeholder="First name (optional)"
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={createInvestorLastName}
            onChange={(e) => setCreateInvestorLastName(e.target.value)}
            placeholder="Last name (optional)"
          />
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm sm:col-span-2"
            value={createInvestorPhone}
            onChange={(e) => setCreateInvestorPhone(e.target.value)}
            placeholder="Phone (optional)"
          />
          <button
            type="button"
            disabled={createInvestorBusy}
            onClick={() => void handleCreateInvestor()}
            className="rounded-lg bg-[#0b1f44] px-3 py-2.5 text-sm font-semibold text-white! disabled:opacity-60 sm:col-span-2"
          >
            {createInvestorBusy ? "Creating…" : "Create & assign investor"}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function LandBookingFlow({
  listing,
  onSuccess,
  allowStaffBookingForInvestor = false,
  prefilledInvestor = null,
}: LandBookingFlowProps) {
  const navigate = useNavigate()
  const plotProperty: Property | null = isLandShareListing(listing) ? null : listing
  const listingIsInvestment = isLandShareListing(listing) || (plotProperty != null && propertyUsesInvestmentBooking(plotProperty))
  const plotOptional = isLandShareListing(listing)
  const paymentTiers = isLandShareListing(listing) ? listing.payment_options : []
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>(() => (listingIsInvestment ? "form" : "choose"))
  const [bookingKind, setBookingKind] = useState<LandBookingKind | null>(() =>
    listingIsInvestment ? "investment" : null,
  )
  const [planType, setPlanType] = useState<LandBookingPlanType | null>(() =>
    listingIsInvestment ? "investment" : null,
  )
  const [promo, setPromo] = useState<BookingPromoSettings | null>(null)
  const [promoReady, setPromoReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [contactNotes, setContactNotes] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [currentRole, setCurrentRole] = useState(() =>
    normalizeStoredRole(localStorage.getItem("userRole")),
  )
  const [investorSearch, setInvestorSearch] = useState("")
  const [investorRows, setInvestorRows] = useState<RetailInvestor[]>([])
  const [selectedInvestor, setSelectedInvestor] = useState<RetailInvestor | null>(null)
  const [creatingInvestor, setCreatingInvestor] = useState(false)
  const [createInvestorEmail, setCreateInvestorEmail] = useState("")
  const [createInvestorPassword, setCreateInvestorPassword] = useState("")
  const [createInvestorFirstName, setCreateInvestorFirstName] = useState("")
  const [createInvestorLastName, setCreateInvestorLastName] = useState("")
  const [createInvestorPhone, setCreateInvestorPhone] = useState("")
  const [createInvestorBusy, setCreateInvestorBusy] = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<PlotOption | null>(null)
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null)

  useEffect(() => {
    if (listingIsInvestment) {
      setPromo(null)
      setPromoReady(true)
      return
    }
    setPromoReady(false)
    void getBookingPromoSettings()
      .then((p) => {
        setPromo(p)
        setPromoReady(true)
      })
      .catch(() => {
        setPromo(null)
        setPromoReady(true)
      })
  }, [listingIsInvestment])

  useEffect(() => {
    setSelectedPlot(null)
    setSelectedTierIndex(null)
    if (listingIsInvestment) {
      setStep("form")
      setBookingKind("investment")
      setPlanType("investment")
    } else {
      setStep("choose")
      setBookingKind(null)
      setPlanType(null)
    }
    const token = localStorage.getItem("accessToken")
    setCurrentRole(normalizeStoredRole(localStorage.getItem("userRole")))
    if (!token) {
      return
    }
    void getMe(token)
      .then((m) => {
        const name = [m.first_name, m.last_name].filter(Boolean).join(" ").trim()
        setFullName(name || m.username)
        setEmail(m.email || "")
        setPhone(m.phone || "")
      })
      .catch(() => {})
  }, [listing.id, listing.listing_kind, listingIsInvestment])

  const isStaffBookingForInvestor =
    allowStaffBookingForInvestor && (currentRole === "admin" || currentRole === "agent")

  useEffect(() => {
    if (!isStaffBookingForInvestor) return
    const token = localStorage.getItem("accessToken")
    if (!token) return
    void listRetailInvestors(token)
      .then(setInvestorRows)
      .catch(() => setInvestorRows([]))
  }, [isStaffBookingForInvestor])

  useEffect(() => {
    if (!isStaffBookingForInvestor || !prefilledInvestor) return
    const inv = prefilledInvestor
    setSelectedInvestor(inv)
    setInvestorSearch(inv.username)
    const name = [inv.first_name, inv.last_name].filter(Boolean).join(" ").trim()
    setFullName(name || inv.username)
    setEmail(inv.email || "")
    setPhone(inv.phone || "")
    setCreatingInvestor(false)
  }, [isStaffBookingForInvestor, prefilledInvestor])

  const investorMatches = investorRows
    .filter((inv) =>
      investorSearch.trim()
        ? inv.username.toLowerCase().includes(investorSearch.trim().toLowerCase())
        : false,
    )
    .slice(0, 8)

  function pickInvestor(inv: RetailInvestor) {
    setSelectedInvestor(inv)
    setInvestorSearch(inv.username)
    const name = [inv.first_name, inv.last_name].filter(Boolean).join(" ").trim()
    setFullName(name || inv.username)
    setEmail(inv.email || "")
    setPhone(inv.phone || "")
    setCreatingInvestor(false)
  }

  async function handleCreateInvestor() {
    const token = localStorage.getItem("accessToken")
    const username = investorSearch.trim()
    if (!token || !username || !createInvestorEmail.trim() || !createInvestorPassword.trim()) {
      showToast("Username, email, and temporary password are required.", "error")
      return
    }
    setCreateInvestorBusy(true)
    try {
      await createRetailInvestor(
        {
          username,
          email: createInvestorEmail.trim(),
          password: createInvestorPassword.trim(),
          first_name: createInvestorFirstName.trim() || undefined,
          last_name: createInvestorLastName.trim() || undefined,
          phone: createInvestorPhone.trim() || undefined,
          is_active: true,
        },
        token,
      )
      const rows = await listRetailInvestors(token)
      setInvestorRows(rows)
      const created =
        rows.find((r) => r.username.toLowerCase() === username.toLowerCase()) ??
        rows.find((r) => r.email.toLowerCase() === createInvestorEmail.trim().toLowerCase()) ??
        null
      if (!created) {
        showToast("Investor created. Search and select to assign.", "success")
      } else {
        pickInvestor(created)
        showToast("Investor created and assigned to this booking.", "success")
      }
      setCreateInvestorEmail("")
      setCreateInvestorPassword("")
      setCreateInvestorFirstName("")
      setCreateInvestorLastName("")
      setCreateInvestorPhone("")
      setCreatingInvestor(false)
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to create investor", "error")
    } finally {
      setCreateInvestorBusy(false)
    }
  }

  /** 1% / 50% plot-buy plans: admin must enable promo and slots must remain (API error → allow attempt). */
  const plotBuyInstallmentPlansOpen =
    promo == null ||
    (promo.plot_buy_installment_promo_enabled && promo.plot_buy_installment_slots_available > 0)

  function selectPlotBuyPlan(pt: PlotInstallmentPlan) {
    if (!plotBuyInstallmentPlansOpen) return
    setBookingKind("plot_buy")
    setPlanType(pt)
    setSelectedPlot(null)
    setStep("pick_plot")
  }

  function continueToPlotApplicationPage() {
    if (!plotProperty || bookingKind !== "plot_buy") return
    if (planType !== "one_percent_installment" && planType !== "fifty_percent_installment") return
    if (!selectedPlot) {
      showToast("Select a plot on the map to continue.", "error")
      return
    }
    if (isStaffBookingForInvestor && !selectedInvestor && !prefilledInvestor) {
      showToast("Select or create an investor before continuing.", "error")
      return
    }
    const state: PlotBookingApplicationLocationState = {
      booking_kind: "plot_buy",
      plan_type: planType,
      plot: selectedPlot,
    }
    const staffInv = selectedInvestor ?? prefilledInvestor
    if (isStaffBookingForInvestor && staffInv) {
      state.investor_id = staffInv.id
    }
    navigate(`/properties/${listing.id}/book/application`, { state })
  }

  async function submit() {
    const token = localStorage.getItem("accessToken")
    if (!token || !planType || !bookingKind) {
      showToast("Please sign in to book.", "error")
      return
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showToast("Name, email, and phone are required.", "error")
      return
    }
    if (isStaffBookingForInvestor && !selectedInvestor && !prefilledInvestor) {
      showToast("Select or create an investor before booking.", "error")
      return
    }
    if (!plotOptional && !selectedPlot) {
      showToast("Please select an available plot from the map.", "error")
      return
    }
    if (listingIsInvestment && paymentTiers.length > 0) {
      if (selectedTierIndex == null || !paymentTiers[selectedTierIndex]) {
        showToast("Please choose one of the payment options for this listing.", "error")
        return
      }
    }
    setBusy(true)
    try {
      const payload: LandBookingCreatePayload = {
        booking_kind: bookingKind,
        plan_type: planType,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        contact_notes: contactNotes.trim(),
        referral_code_used: referralCode.trim(),
      }
      const staffInvestor = selectedInvestor ?? prefilledInvestor ?? null
      if (isStaffBookingForInvestor && staffInvestor) {
        payload.investor = staffInvestor.id
      }
      if (isLandShareListing(listing)) {
        payload.land_share_listing = listing.id
      } else {
        payload.property = listing.id
      }
      if (!plotOptional && selectedPlot) {
        payload.selected_plot_code = selectedPlot.plot_id
        payload.selected_plot_area_sqft = selectedPlot.area_sqft
        payload.selected_plot_price = String(selectedPlot.price)
      } else if (plotOptional) {
        payload.selected_plot_code = ""
      }
      if (listingIsInvestment && paymentTiers.length > 0 && selectedTierIndex != null) {
        const tier = paymentTiers[selectedTierIndex]
        payload.investment_option_amount = tier.amount
        payload.investment_option_billing_period = tier.billing_period
      }
      await createLandBooking(payload, token)
      showToast("Booking submitted. Track status in your dashboard.", "success")
      onSuccess?.()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Booking failed", "error")
    } finally {
      setBusy(false)
    }
  }

  const plotPickPlan =
    planType === "one_percent_installment" || planType === "fifty_percent_installment" ? planType : null

  const staffInvestorPanel =
    isStaffBookingForInvestor ? (
      <StaffInvestorAssignment
        prefilledInvestor={prefilledInvestor}
        investorSearch={investorSearch}
        onInvestorSearchChange={(v) => {
          setInvestorSearch(v)
          setSelectedInvestor(null)
        }}
        investorMatches={investorMatches}
        selectedInvestor={selectedInvestor}
        pickInvestor={pickInvestor}
        creatingInvestor={creatingInvestor}
        setCreatingInvestor={setCreatingInvestor}
        createInvestorEmail={createInvestorEmail}
        setCreateInvestorEmail={setCreateInvestorEmail}
        createInvestorPassword={createInvestorPassword}
        setCreateInvestorPassword={setCreateInvestorPassword}
        createInvestorFirstName={createInvestorFirstName}
        setCreateInvestorFirstName={setCreateInvestorFirstName}
        createInvestorLastName={createInvestorLastName}
        setCreateInvestorLastName={setCreateInvestorLastName}
        createInvestorPhone={createInvestorPhone}
        setCreateInvestorPhone={setCreateInvestorPhone}
        createInvestorBusy={createInvestorBusy}
        handleCreateInvestor={handleCreateInvestor}
      />
    ) : null

  return (
    <>
      {step === "choose" && !promoReady ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">Checking buy-plot plan availability…</p>
        </section>
      ) : null}

      {step === "choose" && promoReady && !plotBuyInstallmentPlansOpen ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-semibold text-[#0b1f44]">1% and 50% plans are not available</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Buy-plot installment promos are controlled by the admin. They may be turned off or all promo slots may be
            in use. Land-share listings use a different booking path — browse those separately, or reach out for
            buy-plot options.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/listings/buy-plots"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1f44] px-5 text-sm font-semibold text-white hover:bg-[#152a55]"
            >
              Buy plots listings
            </Link>
            <Link
              to="/listings/buy-land-share"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Land share listings
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#f58e43] bg-white px-5 text-sm font-semibold text-[#b84a0f] hover:bg-[#fff8f3]"
            >
              Contact us
            </Link>
          </div>
        </section>
      ) : null}

      {step === "choose" && promoReady && plotBuyInstallmentPlansOpen ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-slate-600">Select one plan to continue.</p>
          {promo ? (
            <p className="mt-2 text-xs text-slate-500">
              Buy plots (1% / 50%) promo slots:{" "}
              <strong className="text-[#0b1f44]">
                {promo.plot_buy_installment_slots_available} of {promo.plot_buy_installment_slot_limit} left
              </strong>
            </p>
          ) : null}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <button
              type="button"
              disabled={!plotBuyInstallmentPlansOpen}
              className="group min-h-[320px] rounded-2xl border-2 border-[#0b1f44] bg-white p-8 text-left transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => selectPlotBuyPlan("one_percent_installment")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Plan A</p>
              <h3 className="mt-3 text-3xl font-semibold text-[#0b1f44]">1% Plan</h3>
              <p className="mt-4 max-w-md text-sm text-slate-600">
                Start with 1% and continue using the fixed installment schedule for this full land parcel.
              </p>
              <span className="mt-10 inline-block text-sm font-semibold text-[#0b1f44] group-hover:underline">
                Choose 1% plan
              </span>
            </button>
            <button
              type="button"
              disabled={!plotBuyInstallmentPlansOpen}
              className="group min-h-[320px] rounded-2xl border-2 border-[#f58e43] bg-[#f58e43] p-8 text-left text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#ff9b4f] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => selectPlotBuyPlan("fifty_percent_installment")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-900/70">Plan B</p>
              <h3 className="mt-3 text-3xl font-semibold">50% Plan</h3>
              <p className="mt-4 max-w-md text-sm text-slate-900/80">
                Pay 50% upfront, then complete remaining payments based on the schedule in your agreement.
              </p>
              <span className="mt-10 inline-block text-sm font-semibold group-hover:underline">Choose 50% plan</span>
            </button>
          </div>
        </section>
      ) : null}

      {step === "pick_plot" && promoReady && plotBuyInstallmentPlansOpen && plotProperty && !listingIsInvestment ? (
        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="text-sm font-medium text-[#f58e43] hover:underline"
              onClick={() => {
                setStep("choose")
                setBookingKind(null)
                setPlanType(null)
                setSelectedPlot(null)
              }}
            >
              ← Change plan
            </button>
            <p className="text-xs text-slate-500">
              Selected: <strong className="text-[#0b1f44]">{planType != null ? planTypeLabel(planType) : "—"}</strong>
            </p>
          </div>

          <div className="space-y-5">
            {staffInvestorPanel}

            {plotPickPlan != null ? (
              <div className={`rounded-2xl border p-4 shadow-sm ${PLAN_THEME[plotPickPlan].wrap}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${PLAN_THEME[plotPickPlan].title}`}>
                    {PLAN_INSTRUCTIONS[plotPickPlan].title}
                  </h3>
                </div>
                <ul className="max-h-[min(40vh,22rem)] space-y-2 overflow-y-auto text-xs leading-relaxed text-slate-700">
                  {PLAN_INSTRUCTIONS[plotPickPlan].points.map((line, idx) => (
                    <li
                      key={`${plotPickPlan}-${idx}`}
                      className={`rounded-lg border px-3 py-2 ${PLAN_THEME[plotPickPlan].item}`}
                    >
                      {renderInstructionText(line)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <LandPlotSelector property={plotProperty} value={selectedPlot} onChange={setSelectedPlot} />

            <button
              type="button"
              className="w-full rounded-xl bg-[#0b1f44] py-3 font-semibold text-white! disabled:opacity-50"
              onClick={() => continueToPlotApplicationPage()}
            >
              Continue to application form
            </button>
          </div>
        </section>
      ) : null}

      {step === "form" && listingIsInvestment ? (
        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link to={listingDetailPath(listing)} className="text-sm font-medium text-[#f58e43] hover:underline">
              ← Back to listing
            </Link>
          </div>

          <div className="space-y-3">
            {staffInvestorPanel}

            {listingIsInvestment && paymentTiers.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#0b1f44]">Choose payment option</p>
                <p className="mt-1 text-xs text-slate-600">
                  Pick one of the monthly share amounts configured for this listing.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {paymentTiers.map((t, i) => (
                    <button
                      key={`${t.amount}-${t.billing_period}-${i}`}
                      type="button"
                      onClick={() => setSelectedTierIndex(i)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                        selectedTierIndex === i
                          ? "border-[#0b1f44] bg-white ring-2 ring-[#0b1f44]/15"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-[#f58e43]">{formatBdtInteger(t.amount)}</span>
                      <span className="mt-1 block text-xs text-slate-600">
                        {billingPeriodLabel(t.billing_period)}
                        {t.commitment_months != null ? ` · min ${t.commitment_months} mo` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {plotOptional ? (
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                Land-share booking applies to the parcel as a whole. Plot map selection is not required for this listing
                type.
              </p>
            ) : plotProperty ? (
              <LandPlotSelector property={plotProperty} value={selectedPlot} onChange={setSelectedPlot} />
            ) : null}
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              rows={4}
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              placeholder="Additional contact details or notes (optional)"
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Referral code (optional)"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="w-full rounded-xl bg-[#0b1f44] py-3 font-semibold text-white! disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit booking"}
            </button>
          </div>
        </section>
      ) : null}
    </>
  )
}
