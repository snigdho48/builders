/* eslint-disable react-hooks/preserve-manual-memoization */
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion"
import { Link, useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faLinkedinIn, faTelegram, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import {
  faArrowUpRightFromSquare,
  faBookmark,
  faCheck,
  faEnvelope,
  faFileLines,
  faFlag,
  faLink,
  faLocationDot,
  faPhone,
  faRulerCombined,
  faShareNodes,
  faTag,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"

import { useToast } from "@/components/ui/use-toast"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getBookingPromoSettings, getProperties, getProperty } from "@/services/api"
import type { BookingPromoSettings, Property } from "@/types/domain"
import { isPropertyBookmarked, togglePropertyBookmark } from "@/utils/property-bookmarks"
import { formatBdtInteger } from "@/utils/currency"
import {
  propertyPrimaryPriceLine,
  propertySaleChannelBadgeClass,
  propertySaleChannelLabel,
  propertyUsesInvestmentBooking,
} from "@/utils/property-display"
import { sanitizePropertyHtml } from "@/utils/html-sanitize"

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

function areaBadgeLabel(property: Property): string {
  const sqft = property.size_sqft ?? property.land_area_sqft
  return sqft != null ? `${sqft.toLocaleString()} Sqft` : "Area N/A"
}

function minimumInvestLabel(property: Property): string {
  const p = formatBdtInteger(property.land_price)
  if (property.sale_type === "installment" && property.installment_years) {
    return `From ${p} (${property.installment_years} yr installment)`
  }
  return `From ${p}`
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
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [related, setRelated] = useState<Property[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem("userRole"))
  const [sessionActive, setSessionActive] = useState(() => Boolean(localStorage.getItem("accessToken")))
  const [shareOpen, setShareOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [plotBuyPromo, setPlotBuyPromo] = useState<BookingPromoSettings | null>(null)
  const shareWrapRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()
  const reduceMotion = useReducedMotion()
  const isInvestor = normalizeStoredRole(userRole) === "investor"

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

  const pageVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const columnStaggerVariants = {
    hidden: {},
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.055, delayChildren: 0.04 },
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
    getProperty(Number(id))
      .then(setProperty)
      .catch(() => setProperty(null))
    getProperties().then((items) => setRelated(items.filter((item) => String(item.id) !== id)))
  }, [id])

  useEffect(() => {
    void getBookingPromoSettings()
      .then(setPlotBuyPromo)
      .catch(() => setPlotBuyPromo(null))
  }, [])

  const plotBuyInstallmentPromoLive = Boolean(
    plotBuyPromo?.plot_buy_installment_promo_enabled && plotBuyPromo.plot_buy_installment_slots_available > 0,
  )
  const plotBuyPromoKnownOff = plotBuyPromo != null && !plotBuyInstallmentPromoLive

  useEffect(() => {
    setActiveImage(0)
  }, [id])

  useEffect(() => {
    const syncRole = () => {
      setUserRole(localStorage.getItem("userRole"))
      setSessionActive(Boolean(localStorage.getItem("accessToken")))
    }
    window.addEventListener("auth-state-changed", syncRole)
    return () => window.removeEventListener("auth-state-changed", syncRole)
  }, [])

  useEffect(() => {
    if (!property || !isInvestor) {
      setBookmarked(false)
      return
    }
    const sync = () => setBookmarked(isPropertyBookmarked(property.id))
    sync()
    window.addEventListener("bookmarks-changed", sync)
    return () => window.removeEventListener("bookmarks-changed", sync)
  }, [property, isInvestor])

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
    if (property.total_blocks > 0) {
      return Math.round((property.available_blocks / property.total_blocks) * 100)
    }
    if (property.listing_active && property.status === "available") {
      return 100
    }
    return 0
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

  const plotDocuments = useMemo(() => {
    if (!property) {
      return [] as Array<{ name: string; href?: string; description?: string }>
    }
    const docs: Array<{ name: string; href?: string; description?: string }> = []
    if (property.contact_website) {
      docs.push({
        name: "Official listing brief",
        href: property.contact_website,
        description: "Project-level listing details from the publisher.",
      })
    }
    if (property.floor_plans.length) {
      property.floor_plans.forEach((plan, idx) => {
        if (plan.image_url) {
          docs.push({
            name: plan.title || `Plot document ${idx + 1}`,
            href: plan.image_url,
            description: plan.description || "Submitted document or map attachment.",
          })
        }
      })
    }
    if (!docs.length) {
      docs.push({
        name: "Title deed verification packet",
        description: "Available on request through our legal support desk.",
      })
      docs.push({
        name: "Registration readiness checklist",
        description: "Available on request through our legal support desk.",
      })
    }
    return docs
  }, [property])

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

  function openBook() {
    if (!property || property.status !== "available" || !property.listing_active) {
      showToast("This listing is not available for booking.", "error")
      return
    }
    navigate(`/properties/${property.id}/book`)
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
              : property.total_blocks > 0
                ? `${property.total_blocks * 8} sqft (est.)`
                : "—"

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
                        className="h-[240px] w-full rounded-2xl object-cover sm:h-[340px] lg:h-[480px]"
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

                    <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-5 lg:hidden">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Price</p>
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {ratingLabel ? (
                            <span className="inline-flex items-center rounded-full bg-[#0b1f44] px-3 py-1 text-sm font-semibold text-white!">
                              {ratingLabel}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3eb] px-3 py-1 text-sm font-semibold text-[#c55f1a]">
                            <FontAwesomeIcon icon={faTag} className="text-[0.75rem]" />
                            {propertyPrimaryPriceLine(property)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                            <FontAwesomeIcon icon={faRulerCombined} className="text-[0.75rem]" />
                            {areaBadgeLabel(property)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                            <FontAwesomeIcon icon={faLocationDot} className="text-[0.75rem]" />
                            <span className="max-w-[28ch] truncate">{property.location_name}</span>
                          </span>
                        </div>
                      </div>
                    </motion.section>

                    <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
                      <h3 className="mb-3 text-2xl font-semibold text-[#0b1f44]">Description</h3>
                      {property.description?.trim() ? (
                        <div
                          className="property-rich-text max-w-none leading-8 text-slate-600 [&_a]:wrap-break-word [&_a]:text-[#f58e43] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0b1f44] [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0b1f44] [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
                          dangerouslySetInnerHTML={{ __html: sanitizePropertyHtml(property.description) }}
                        />
                      ) : (
                        <p className="text-slate-500">No description yet.</p>
                      )}
                      {property.description_secondary?.trim() ? (
                        <div
                          className="property-rich-text mt-6 max-w-none border-t border-slate-100 pt-6 leading-8 text-slate-600 [&_a]:wrap-break-word [&_a]:text-[#f58e43] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0b1f44] [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0b1f44] [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
                          dangerouslySetInnerHTML={{ __html: sanitizePropertyHtml(property.description_secondary) }}
                        />
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
                          <dd className="max-w-full text-right font-semibold text-[#0b1f44] sm:max-w-[70%]">
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
                        className="h-[220px] w-full rounded-2xl sm:h-[300px] lg:h-[340px]"
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
                        className="h-[220px] w-full rounded-2xl border border-slate-200 sm:h-[280px] lg:h-[320px]"
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

                    <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
                      <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Plot documents</h4>
                      <ul className="space-y-3">
                        {plotDocuments.map((doc, idx) => (
                          <li key={`${doc.name}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  <FontAwesomeIcon icon={faFileLines} className="mr-2 text-[#f58e43]" />
                                  {doc.name}
                                </p>
                                {doc.description ? <p className="mt-1 text-sm text-slate-600">{doc.description}</p> : null}
                              </div>
                              {doc.href ? (
                                <a
                                  href={doc.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  View
                                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                                </a>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </motion.section>

                    {/* {floorPlans.length ? (
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
                    ) : null} */}

                    {/* <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
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
                    </motion.section> */}

                    <motion.section variants={sectionVariants} className="rounded-3xl border border-slate-200 bg-white p-8">
                      <h3 className="text-2xl font-semibold text-[#0b1f44]">Review</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Ratings reflect feedback from investors.{" "}
                        {sessionActive ? (
                          <span className="text-slate-600">
                            Post-your-review flow is not wired yet; use Contact for feedback.
                          </span>
                        ) : (
                          <Link to="/auth" className="font-semibold text-[#f58e43] hover:underline">
                            Log in to write your review
                          </Link>
                        )}
                      </p>
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        {ratingLabel ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#0b1f44] px-3 py-1 text-sm font-semibold text-white!">
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
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-500">
                                  {item.rating_average ?? "—"} ({item.review_count})
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${propertySaleChannelBadgeClass(item)}`}
                                  >
                                    {propertySaleChannelLabel(item)}
                                  </span>
                                  <button type="button" className="text-sm text-slate-500">
                                    <FontAwesomeIcon icon={faHeartRegular} />
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-lg font-semibold text-[#0b1f44]">{item.title}</h4>
                              <p className="text-sm text-slate-500">{item.location_name}</p>
                              <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
                              <div className="flex items-center gap-4 border-t border-slate-100 pt-2 text-xs text-slate-500">
                                <span>{item.size_sqft != null ? `${item.size_sqft} sqft` : "—"}</span>
                                <span>Bed {item.bedrooms ?? "—"}</span>
                                <span>Bath {item.bathrooms ?? "—"}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="font-semibold text-[#f58e43]">{propertyPrimaryPriceLine(item)}</span>
                                <Link
                                  to={`/properties/${item.id}`}
                                  className="shrink-0 rounded-full border border-[#f58e43] px-3 py-1 font-medium text-[#f58e43]"
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

                  <motion.aside className="flex flex-col gap-7" variants={columnStaggerVariants}>
                    <motion.section
                      variants={sectionVariants}
                      className="hidden rounded-3xl border border-slate-200 bg-white p-6 lg:block lg:order-2"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Price</p>
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {ratingLabel ? (
                            <span className="inline-flex items-center rounded-full bg-[#0b1f44] px-3 py-1 text-sm font-semibold text-white!">
                              {ratingLabel}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3eb] px-3 py-1 text-sm font-semibold text-[#c55f1a]">
                            <FontAwesomeIcon icon={faTag} className="text-[0.75rem]" />
                            {propertyPrimaryPriceLine(property)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                            <FontAwesomeIcon icon={faRulerCombined} className="text-[0.75rem]" />
                            {areaBadgeLabel(property)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                            <FontAwesomeIcon icon={faLocationDot} className="text-[0.75rem]" />
                            <span className="max-w-[30ch] truncate">{property.location_name}</span>
                          </span>
                        </div>
                      </div>
                    </motion.section>

                    <motion.section
                      variants={sectionVariants}
                      className="rounded-3xl border border-slate-200 bg-white p-6 lg:order-3"
                    >
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
                          <p className="text-sm text-slate-500">Property representative (assigned agent)</p>
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

                    <motion.section
                      variants={sectionVariants}
                      className="rounded-3xl border border-slate-200 bg-white p-6 lg:order-4"
                    >
                      <h3 className="text-xl font-semibold text-[#0b1f44]">Request a query</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Send any question about this property, availability, or investing—we will get back to you.
                      </p>
                      <div className="mt-4 space-y-3">
                        <input className="detail-input" placeholder="Your name" readOnly />
                        <input className="detail-input" type="email" placeholder="Your email" readOnly />
                        <textarea
                          className="detail-input min-h-28 resize-none"
                          placeholder="Your question or request..."
                          readOnly
                        />
                        <Link
                          to={`/contact?ref=${encodeURIComponent(property.title)}`}
                          className="flex w-full items-center justify-center rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]"
                        >
                          Send query via contact
                        </Link>
                      </div>
                    </motion.section>

                    <motion.section
                      variants={sectionVariants}
                      className="rounded-3xl border border-slate-200 bg-white p-6 lg:order-5"
                    >
                      <h3 className="mb-2 text-lg font-semibold text-[#0b1f44]">Book this land</h3>
                      <div className="mb-2 h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-[#f58e43]" style={{ width: `${availabilityPercent}%` }} />
                      </div>
                      <p className="text-sm text-slate-500">
                        {property.total_blocks > 0
                          ? `${availabilityPercent}% blocks available`
                          : property.status === "available" && property.listing_active
                            ? "Land parcel available for booking"
                            : "Not available for booking"}
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        {propertyUsesInvestmentBooking(property)
                          ? "Continue on the next screen to submit your details. Staff will accept or reject your request."
                          : plotBuyPromoKnownOff
                            ? "The 1% and 50% buy-plot promos are not active right now (admin setting or full slots). Open booking to see next steps, or contact us from this listing."
                            : "On the next screen, pick the 1% or 50% plan when the promo is on (limited slots). Staff will accept or reject your request."}
                      </p>
                      <button
                        type="button"
                        onClick={openBook}
                        className="mt-4 w-full rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]"
                      >
                        Book now
                      </button>
                      {!sessionActive ? (
                        <p className="mt-2 text-center text-xs text-slate-500">
                          <Link
                            to={`/auth?next=${encodeURIComponent(`/properties/${property.id}/book`)}`}
                            className="font-semibold text-[#f58e43] hover:underline"
                          >
                            Sign in
                          </Link>{" "}
                          as an investor to book.
                        </p>
                      ) : null}
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
