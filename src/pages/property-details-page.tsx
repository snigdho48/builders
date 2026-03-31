import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion"
import { Link, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faLinkedinIn, faTelegram, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import {
  faArrowUpRightFromSquare,
  faBookmark,
  faCheck,
  faEnvelope,
  faFlag,
  faLink,
  faLocationDot,
  faPhone,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"

import { useCart } from "@/contexts/use-cart"
import { useToast } from "@/components/ui/use-toast"
import { createInvestment, getProperties, getPropertyById } from "@/services/api"
import type { Property } from "@/types/domain"
import { isPropertyBookmarked, togglePropertyBookmark } from "@/utils/property-bookmarks"

function formatRatingBadge(average: string | null | undefined, count: number): string | null {
  const n = count ?? 0
  if (average != null && average !== "" && Number.parseFloat(String(average)) > 0) {
    return `${average} (${n} Review${n === 1 ? "" : "s"})`
  }
  if (n > 0) {
    return `${n} Review${n === 1 ? "" : "s"}`
  }
  return null
}

function offeringBadgeLabel(property: Property): string {
  if (property.land_sale_mode === "fractional_share") {
    const price = property.share_price ? Number(property.share_price) : NaN
    const priceStr = Number.isFinite(price)
      ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}/share`
      : ""
    if (property.property_type === "land" && property.size_sqft != null) {
      const land = `${property.size_sqft.toLocaleString()} sqft`
      return priceStr ? `${land} · ${priceStr}` : `${land} · Fractional share`
    }
    return priceStr || "Fractional share"
  }
  if (property.land_sale_mode === "whole_land") {
    const price = property.whole_land_price ? Number(property.whole_land_price) : NaN
    const priceStr = Number.isFinite(price) ? `$${price.toLocaleString()}` : ""
    if (property.property_type === "land" && property.size_sqft != null) {
      const land = `${property.size_sqft.toLocaleString()} sqft`
      return priceStr ? `${land} · ${priceStr}` : `${land} · Whole parcel`
    }
    return priceStr || "Whole parcel"
  }
  const blockPrice = Number(property.price_per_block)
  const priceStr = Number.isFinite(blockPrice)
    ? `$${blockPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}/block`
    : ""
  if (property.property_type === "land") {
    if (property.size_sqft != null) {
      return priceStr ? `${property.size_sqft.toLocaleString()} sqft · ${priceStr}` : `${property.size_sqft.toLocaleString()} sqft`
    }
    if (property.total_blocks > 0) {
      return priceStr ? `${property.total_blocks} blocks · ${priceStr}` : `${property.total_blocks} blocks`
    }
  }
  return priceStr ? `From ${priceStr}` : property.land_sale_mode.replace(/_/g, " ")
}

function minimumInvestLabel(property: Property): string {
  if (property.land_sale_mode === "fractional_share") {
    const minShares = property.min_shares_per_order || 1
    const unit = Number(property.share_price)
    if (Number.isFinite(unit)) {
      const total = unit * minShares
      return `From $${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${minShares} share${minShares === 1 ? "" : "s"})`
    }
  }
  if (property.land_sale_mode === "whole_land") {
    const w = Number(property.whole_land_price)
    if (Number.isFinite(w)) {
      return `From $${w.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
  }
  const pb = Number(property.price_per_block)
  if (Number.isFinite(pb)) {
    return `From $${pb.toLocaleString(undefined, { maximumFractionDigits: 0 })} per block`
  }
  return "—"
}

function videoWatchUrl(videoUrl: string | undefined): string | null {
  const raw = videoUrl?.trim()
  if (!raw) {
    return null
  }
  if (raw.includes("youtube.com/watch?v=")) {
    return raw.split("&")[0] || raw
  }
  if (raw.includes("youtu.be/")) {
    const id = raw.split("youtu.be/")[1]?.split("?")[0]
    return id ? `https://www.youtube.com/watch?v=${id}` : raw
  }
  if (raw.includes("youtube.com/embed/")) {
    const id = raw.split("embed/")[1]?.split("?")[0]
    return id ? `https://www.youtube.com/watch?v=${id}` : raw
  }
  return raw
}

export function PropertyDetailsPage() {
  const { id = "" } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [related, setRelated] = useState<Property[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [activeFloorIdx, setActiveFloorIdx] = useState(0)
  const [blocksOwned, setBlocksOwned] = useState(1)
  const [sharesOwned, setSharesOwned] = useState(1)
  const [investmentType, setInvestmentType] = useState<"direct" | "installment">("direct")
  const [durationYears, setDurationYears] = useState(3)
  const [referralCode, setReferralCode] = useState("")
  const [message, setMessage] = useState("")
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem("userRole"))
  const [shareOpen, setShareOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const shareWrapRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()
  const { addItem } = useCart()
  const reduceMotion = useReducedMotion()
  const isInvestor = userRole === "investor"

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

  const pageVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const columnStaggerVariants = {
    hidden: {},
    show: {
      transition: reduceMotion
        ? {}
        : { staggerChildren: 0.055, delayChildren: 0.04 },
    },
  } as const

  const sectionVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.4, ease: easeOut },
    },
  }

  useEffect(() => {
    getPropertyById(id).then((p) => {
      setProperty(p)
      if (p?.land_sale_mode === "fractional_share") {
        setSharesOwned(Math.max(1, p.min_shares_per_order || 1))
      }
    })
    getProperties().then((items) => setRelated(items.filter((item) => String(item.id) !== id)))
  }, [id])

  useEffect(() => {
    setActiveImage(0)
  }, [id])

  useEffect(() => {
    const syncRole = () => setUserRole(localStorage.getItem("userRole"))
    window.addEventListener("auth-state-changed", syncRole)
    return () => window.removeEventListener("auth-state-changed", syncRole)
  }, [])

  useEffect(() => {
    if (!property || userRole !== "investor") {
      setBookmarked(false)
      return
    }
    const sync = () => setBookmarked(isPropertyBookmarked(property.id))
    sync()
    window.addEventListener("bookmarks-changed", sync)
    return () => window.removeEventListener("bookmarks-changed", sync)
  }, [property, userRole])

  useEffect(() => {
    if (!shareOpen) {
      return
    }
    const close = (e: MouseEvent) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(e.target as Node)) {
        setShareOpen(false)
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [shareOpen])

  const availabilityPercent = useMemo(() => {
    if (!property) {
      return 0
    }
    if (property.land_sale_mode === "fractional_share") {
      const total = property.total_shares ?? 0
      if (total === 0) {
        return 0
      }
      return Math.round(((property.available_shares ?? 0) / total) * 100)
    }
    if (property.total_blocks === 0) {
      return 0
    }
    return Math.round((property.available_blocks / property.total_blocks) * 100)
  }, [property])

  const galleryImages = useMemo(() => {
    if (!property) {
      return [] as string[]
    }
    const main = property.top_view_image ? [property.top_view_image] : []
    const extra = (property.gallery_images ?? []).filter(Boolean)
    const merged = [...main, ...extra]
    return merged.length ? merged : []
  }, [property])

  useEffect(() => {
    const n = galleryImages.length
    if (n === 0) {
      return
    }
    setActiveImage((i) => Math.min(i, Math.max(0, n - 1)))
  }, [galleryImages.length])

  const mapDirectionsUrl = useMemo(() => {
    if (!property) {
      return "https://www.google.com/maps"
    }
    if (property.latitude && property.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location_name)}`
  }, [property])

  const googleMapEmbedUrl = useMemo(() => {
    if (!property?.latitude || !property?.longitude) {
      return `https://www.google.com/maps?q=${encodeURIComponent(property?.location_name ?? "")}&z=13&output=embed`
    }
    const lat = Number(property.latitude)
    const lng = Number(property.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return `https://www.google.com/maps?q=${encodeURIComponent(property.location_name)}&z=13&output=embed`
    }
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=14&output=embed`
  }, [property])

  const previewVideoUrl = useMemo(() => {
    const fallback = "https://www.youtube.com/embed/QmfVLaBan5I"
    if (!property?.video_url) {
      return fallback
    }
    const raw = property.video_url.trim()
    if (raw.includes("youtube.com/watch?v=")) {
      const videoId = raw.split("v=")[1]?.split("&")[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : fallback
    }
    if (raw.includes("youtu.be/")) {
      const videoId = raw.split("youtu.be/")[1]?.split("?")[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : fallback
    }
    return raw
  }, [property?.video_url])

  const floorPlans = property?.floor_plans ?? []
  const activeFloor = floorPlans[activeFloorIdx]

  function handleAddToCart() {
    if (!property) {
      return
    }
    if (property.land_sale_mode === "fractional_share") {
      if (property.status === "sold" || (property.available_shares ?? 0) < 1) {
        showToast("This property cannot be added to cart.", "error")
        return
      }
      addItem(property, {
        shares: sharesOwned,
        investment_type: investmentType,
        duration_years: investmentType === "installment" ? durationYears : 0,
      })
    } else if (property.land_sale_mode === "whole_land") {
      if (property.status === "sold" || property.available_blocks < 1) {
        showToast("This property cannot be added to cart.", "error")
        return
      }
      addItem(property, {
        investment_type: investmentType,
        duration_years: investmentType === "installment" ? durationYears : 0,
      })
    } else {
      if (property.status === "sold" || property.available_blocks < 1) {
        showToast("This property cannot be added to cart.", "error")
        return
      }
      addItem(property, {
        blocks: blocksOwned,
        investment_type: investmentType,
        duration_years: investmentType === "installment" ? durationYears : 0,
      })
    }
    showToast("Added to cart", "success")
  }

  async function handleInvestNow() {
    if (!property) {
      return
    }

    const token = localStorage.getItem("accessToken")
    if (!token) {
      setMessage("Please login first to invest.")
      showToast("Please login first to invest.", "error")
      return
    }

    setMessage("Creating investment...")

    try {
      const referral_code_used = referralCode || undefined
      const common = {
        property: property.id,
        type: investmentType,
        duration_years: investmentType === "installment" ? durationYears : 0,
        referral_code_used,
      }
      if (property.land_sale_mode === "fractional_share") {
        await createInvestment(
          { ...common, blocks_owned: 0, shares_owned: sharesOwned },
          token
        )
      } else if (property.land_sale_mode === "whole_land") {
        await createInvestment({ ...common, blocks_owned: 1 }, token)
      } else {
        await createInvestment({ ...common, blocks_owned: blocksOwned }, token)
      }
      setMessage("Investment created successfully. Check dashboard for updates.")
      showToast("Investment created successfully.", "success")
      const freshProperty = await getPropertyById(String(property.id))
      if (freshProperty) {
        setProperty(freshProperty)
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to create investment."
      setMessage(err)
      showToast(err, "error")
    }
  }

  async function copyListingLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast("Link copied to clipboard", "success")
    } catch {
      showToast("Unable to copy link", "error")
    }
  }

  function openShareWindow(url: string) {
    void copyListingLink()
    window.open(url, "_blank", "noopener,noreferrer")
  }

  function buildShareUrls(title: string) {
    const pageUrl = window.location.href
    const u = encodeURIComponent(pageUrl)
    const t = encodeURIComponent(title)
    const combined = encodeURIComponent(`${title} ${pageUrl}`)
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      whatsapp: `https://wa.me/?text=${combined}`,
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    }
  }

  function handleBookmarkToggle() {
    if (!property || !isInvestor) {
      return
    }
    const next = togglePropertyBookmark(property.id)
    setBookmarked(next)
    showToast(next ? "Saved to your bookmarks" : "Removed from bookmarks", "success")
  }

  return (
    <AnimatePresence mode="wait">
      {!property ? (
        <motion.main
          key="loading"
          className="bg-[#f4f6fb] px-4 py-20 text-slate-600 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <div className="mx-auto max-w-7xl">Loading property details...</div>
        </motion.main>
      ) : (
        (() => {
          const displayGallery = galleryImages.length ? galleryImages : [""]
          const ratingLabel = formatRatingBadge(property.rating_average, property.review_count)
          let watchUrl = videoWatchUrl(property.video_url)
          if (!watchUrl && previewVideoUrl.includes("/embed/")) {
            const vid = previewVideoUrl.split("/embed/")[1]?.split(/[?&]/)[0]
            if (vid) {
              watchUrl = `https://www.youtube.com/watch?v=${vid}`
            }
          }

          const sizeLabel =
            property.size_sqft != null
              ? `${property.size_sqft} sqft`
              : `${property.total_blocks * 8} sqft (est.)`

          return (
            <motion.main
              key={`loaded-${id}`}
              className="bg-[#f6f7fb] text-slate-900"
              variants={pageVariants}
              initial="hidden"
              animate="show"
            >
      <motion.section variants={sectionVariants} className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
          <h1 className="text-[2rem] font-semibold leading-tight text-[#0b1f44]">{property.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-[#f58e43]">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700">{property.title}</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 text-base font-medium text-slate-800">
            <FontAwesomeIcon icon={faLocationDot} className="text-[#f58e43]" aria-hidden />
            {property.location_name}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isInvestor ? (
              <button
                type="button"
                onClick={handleBookmarkToggle}
                aria-pressed={bookmarked}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  bookmarked
                    ? "border-[#f58e43] bg-[#fff7f1] text-[#c55f1a]"
                    : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50",
                ].join(" ")}
              >
                <FontAwesomeIcon icon={bookmarked ? faBookmark : faBookmarkRegular} className="text-sm" />
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            ) : null}
            <div className="relative" ref={shareWrapRef}>
              <button
                type="button"
                aria-expanded={shareOpen}
                aria-haspopup="true"
                onClick={() => setShareOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                <FontAwesomeIcon icon={faShareNodes} className="text-sm" />
                Share
              </button>
              {shareOpen ? (
                <div
                  className="absolute left-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl sm:left-auto sm:right-0"
                  role="menu"
                >
                  {(() => {
                    const urls = buildShareUrls(property.title)
                    const rows: { label: string; icon: typeof faFacebookF; url: string }[] = [
                      { label: "Facebook", icon: faFacebookF, url: urls.facebook },
                      { label: "WhatsApp", icon: faWhatsapp, url: urls.whatsapp },
                      { label: "X (Twitter)", icon: faXTwitter, url: urls.twitter },
                      { label: "LinkedIn", icon: faLinkedinIn, url: urls.linkedin },
                      { label: "Telegram", icon: faTelegram, url: urls.telegram },
                    ]
                    return rows.map((row) => (
                      <button
                        key={row.label}
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                        onClick={() => {
                          openShareWindow(row.url)
                          setShareOpen(false)
                        }}
                      >
                        <FontAwesomeIcon icon={row.icon} className="w-4 text-slate-600" />
                        {row.label}
                      </button>
                    ))
                  })()}
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      void copyListingLink()
                      setShareOpen(false)
                    }}
                  >
                    <FontAwesomeIcon icon={faLink} className="w-4 text-slate-600" />
                    Copy link
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faFlag} className="text-sm" />
              Report
            </button>
          </div>
        </div>
      </motion.section>

      <section className="mx-auto max-w-[1240px] px-4 py-11 sm:px-6">
        <div className="grid gap-9 lg:grid-cols-[1.5fr_0.85fr]">
          <motion.div className="space-y-9" variants={columnStaggerVariants}>
            <motion.section
              variants={sectionVariants}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,32,68,0.08)]"
            >
              <img
                src={displayGallery[activeImage] || "https://placehold.co/1200x480/e2e8f0/64748b?text=Photo"}
                alt={property.title}
                className="h-[480px] w-full rounded-2xl object-cover"
              />
              {galleryImages.length > 1 ? (
                <div className="mt-4 -mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                  <div className="flex w-max min-w-full flex-nowrap gap-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-current={activeImage === index ? "true" : undefined}
                        className={[
                          "h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-shadow",
                          activeImage === index
                            ? "border-[#f58e43] shadow-[0_0_0_2px_rgba(245,142,67,0.25)]"
                            : "border-slate-200 hover:border-slate-300",
                        ].join(" ")}
                      >
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.section>

            <motion.section variants={sectionVariants} className="flex flex-wrap items-center gap-3">
              {ratingLabel ? (
                <span className="inline-flex rounded-full bg-[#0b1f44] px-3 py-1 text-sm font-semibold text-white">
                  {ratingLabel}
                </span>
              ) : null}
              {property.for_rent ? (
                <span className="rounded-full bg-[#ecf5ff] px-3 py-1 text-sm text-[#0b1f44]">For Rent</span>
              ) : null}
              {property.for_sale ? (
                <span className="rounded-full bg-[#ecf5ff] px-3 py-1 text-sm text-[#0b1f44]">For Sale</span>
              ) : null}
              <span
                className="rounded-full bg-[#fff3eb] px-3 py-1 text-sm font-medium capitalize text-[#c55f1a]"
                title="Offering detail (land size and/or price depends on listing type)"
              >
                {offeringBadgeLabel(property)}
              </span>
              <span className="rounded-full bg-[#fff3eb] px-3 py-1 text-sm font-medium text-[#c55f1a]">
                {property.location_name}
              </span>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="mb-3 text-2xl font-semibold text-[#0b1f44]">Description</h3>
              <p className="leading-8 text-slate-600">{property.description}</p>
              {property.description_secondary ? (
                <p className="mt-4 leading-8 text-slate-600">{property.description_secondary}</p>
              ) : null}
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Overview</h4>
              <dl className="grid gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Property ID</dt>
                  <dd className="font-medium text-slate-900">#{property.id.toString().padStart(4, "0")}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Property Type</dt>
                  <dd className="font-medium capitalize text-slate-900">{property.property_type}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Build Year</dt>
                  <dd className="font-medium text-slate-900">{property.build_year ?? "—"}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Rooms</dt>
                  <dd className="font-medium text-slate-900">{property.bedrooms ?? "—"}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Flat</dt>
                  <dd className="font-medium text-slate-900">
                    {property.flat_label?.trim() ? property.flat_label : "—"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Size</dt>
                  <dd className="font-medium text-slate-900">{sizeLabel}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Bath</dt>
                  <dd className="font-medium text-slate-900">{property.bathrooms ?? "—"}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5 sm:col-span-2">
                  <dt className="text-slate-500">Money to invest</dt>
                  <dd className="max-w-[70%] text-right font-semibold text-[#0b1f44]">
                    {minimumInvestLabel(property)}
                  </dd>
                </div>
              </dl>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h4 className="text-xl font-semibold text-[#0b1f44]">Preview Video</h4>
                {watchUrl ? (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#f58e43] hover:underline"
                  >
                    Open video
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                  </a>
                ) : null}
              </div>
              <iframe
                className="h-[340px] w-full rounded-2xl"
                src={previewVideoUrl}
                title="property-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Features & Amenities</h4>
              {property.amenities.length ? (
                <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  {property.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#f58e43]">
                        <FontAwesomeIcon icon={faCheck} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No amenities listed yet.</p>
              )}
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Location</h4>
              <iframe
                title="Google Maps Location"
                src={googleMapEmbedUrl}
                className="h-[320px] w-full rounded-2xl border border-slate-200"
                loading="lazy"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                  {property.location_name}
                  {property.latitude && property.longitude
                    ? ` (${property.latitude}, ${property.longitude})`
                    : ""}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={mapDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[#f58e43]"
                  >
                    Get Directions
                  </a>
                  <a
                    href={mapDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Open in Google Maps
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </a>
                </div>
              </div>
            </motion.section>

            {floorPlans.length ? (
              <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
                <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Floor Plan</h4>
                <div className="mb-4 flex flex-wrap gap-2">
                  {floorPlans.map((fp, idx) => (
                    <button
                      key={`${fp.title}-${idx}`}
                      type="button"
                      onClick={() => setActiveFloorIdx(idx)}
                      className={`rounded-full px-4 py-2 text-sm ${
                        activeFloorIdx === idx ? "bg-[#0b1f44] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {fp.title || `Plan ${idx + 1}`}
                    </button>
                  ))}
                </div>
                {activeFloor?.image_url ? (
                  <img
                    src={activeFloor.image_url}
                    alt={activeFloor.title}
                    className="h-[260px] w-full rounded-2xl object-cover"
                  />
                ) : null}
                {activeFloor?.description ? (
                  <p className="mt-4 text-sm leading-7 text-slate-600">{activeFloor.description}</p>
                ) : null}
              </motion.section>
            ) : null}

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-4 text-xl font-semibold text-[#0b1f44]">Tag</h4>
              {property.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No tags.</p>
              )}
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="text-2xl font-semibold text-[#0b1f44]">Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                Ratings reflect feedback from investors.{" "}
                <Link to="/auth" className="font-semibold text-[#f58e43] hover:underline">
                  Log in to write your review
                </Link>
              </p>
              <div className="mt-6 border-t border-slate-100 pt-5">
                {ratingLabel ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#0b1f44] px-3 py-1 text-sm font-semibold text-white">
                      {ratingLabel}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No ratings yet.</p>
                )}
                {property.review_sample_author ? (
                  <p className="mt-4 text-sm font-semibold text-slate-900">{property.review_sample_author}</p>
                ) : null}
                {property.review_sample_date ? (
                  <p className="text-xs text-slate-500">{property.review_sample_date}</p>
                ) : null}
                {property.review_sample_text ? (
                  <p className="mt-2 text-sm leading-7 text-slate-600">{property.review_sample_text}</p>
                ) : null}
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="mb-5 text-2xl font-semibold text-[#0b1f44]">Related Listings</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.slice(0, 4).map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_26px_rgba(9,23,49,0.08)]"
                  >
                    <img
                      src={item.top_view_image || "https://placehold.co/400x180"}
                      alt={item.title}
                      className="h-44 w-full object-cover"
                    />
                    <div className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          {item.rating_average ?? "—"} ({item.review_count})
                        </span>
                        <button type="button" className="text-sm text-slate-500">
                          <FontAwesomeIcon icon={faHeartRegular} />
                        </button>
                      </div>
                      <h4 className="text-lg font-semibold text-[#0b1f44]">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.location_name}</p>
                      <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
                      <div className="flex items-center gap-4 border-t border-slate-100 pt-2 text-xs text-slate-500">
                        <span>{item.size_sqft != null ? `${item.size_sqft} sqft` : "—"}</span>
                        <span>Bed {item.bedrooms ?? "—"}</span>
                        <span>Bath {item.bathrooms ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#f58e43]">
                          {item.land_sale_mode === "fractional_share"
                            ? `$${item.share_price ?? "0"}/share`
                            : item.land_sale_mode === "whole_land"
                              ? `Whole from $${item.whole_land_price ?? item.price_per_block}`
                              : `$${item.price_per_block}/block`}
                        </span>
                        <Link
                          to={`/properties/${item.id}`}
                          className="rounded-full border border-[#f58e43] px-3 py-1 font-medium text-[#f58e43]"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          </motion.div>

          <motion.aside className="space-y-7" variants={columnStaggerVariants}>
            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Representative</p>
              <div className="mt-4 flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                  alt={property.representative_name ? `Photo of ${property.representative_name}` : "Representative"}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-[#0b1f44]">
                    {property.representative_name || "Not assigned"}
                  </p>
                  <p className="text-sm text-slate-500">Property representative</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <p className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 shrink-0 text-[#f58e43]" />
                  <span>{property.location_name}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faPhone} className="shrink-0 text-[#f58e43]" />
                  <span>{property.representative_phone || "Phone not available"}</span>
                </p>
                <p className="flex items-center gap-2.5 break-all">
                  <FontAwesomeIcon icon={faEnvelope} className="shrink-0 text-[#f58e43]" />
                  <span>{property.representative_email || "Email not available"}</span>
                </p>
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-[#0b1f44]">Request a query</h3>
              <p className="mt-2 text-sm text-slate-600">
                Send any question about this property, availability, or investing—we will get back to you.
              </p>
              <div className="mt-4 space-y-3">
                <input className="detail-input" placeholder="Your name" />
                <input className="detail-input" type="email" placeholder="Your email" />
                <textarea
                  className="detail-input min-h-28 resize-none"
                  placeholder="Your question or request..."
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]"
                >
                  Send query
                </button>
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-[#0b1f44]">Invest in this Property</h3>
              <div className="mb-2 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-[#f58e43]" style={{ width: `${availabilityPercent}%` }} />
              </div>
              <p className="text-sm text-slate-500">
                {property.land_sale_mode === "fractional_share"
                  ? `${availabilityPercent}% shares available`
                  : `${availabilityPercent}% blocks available`}
              </p>
              <div className="mt-4 grid gap-2">
                <select
                  className="detail-input"
                  value={investmentType}
                  onChange={(event) => setInvestmentType(event.target.value as "direct" | "installment")}
                >
                  <option value="direct">Direct Buy</option>
                  <option value="installment">Installment Basis</option>
                </select>
                {property.land_sale_mode === "fractional_share" ? (
                  <input
                    className="detail-input"
                    type="number"
                    min={property.min_shares_per_order}
                    max={property.available_shares ?? undefined}
                    value={sharesOwned}
                    onChange={(event) => setSharesOwned(Number(event.target.value))}
                    placeholder="Shares to buy"
                  />
                ) : property.land_sale_mode === "whole_land" ? (
                  <p className="text-sm text-slate-600">Purchases the entire remaining listing in one transaction.</p>
                ) : (
                  <input
                    className="detail-input"
                    type="number"
                    min={1}
                    max={property.available_blocks}
                    value={blocksOwned}
                    onChange={(event) => setBlocksOwned(Number(event.target.value))}
                    placeholder="Blocks to buy"
                  />
                )}
                {investmentType === "installment" ? (
                  <select
                    className="detail-input"
                    value={durationYears}
                    onChange={(event) => setDurationYears(Number(event.target.value))}
                  >
                    <option value={3}>3 years</option>
                    <option value={5}>5 years</option>
                  </select>
                ) : null}
                <input
                  className="detail-input"
                  value={referralCode}
                  onChange={(event) => setReferralCode(event.target.value)}
                  placeholder="Referral code (optional)"
                />
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full rounded-xl border-2 border-[#0b1f44] bg-white px-4 py-3 font-semibold text-[#0b1f44] transition hover:bg-slate-50"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => void handleInvestNow()}
                  className="w-full rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]"
                >
                  Invest Now
                </button>
                {message ? <p className="text-xs text-slate-500">{message}</p> : null}
              </div>
            </motion.section>
          </motion.aside>
        </div>
      </section>
    </motion.main>
          )
        })()
      )}
    </AnimatePresence>
  )
}
