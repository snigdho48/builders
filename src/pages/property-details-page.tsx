import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faLinkedinIn, faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons"
import {
  faArrowUpRightFromSquare,
  faBookmark,
  faCheck,
  faEnvelope,
  faFlag,
  faLocationDot,
  faPhone,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons"
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"

import { useToast } from "@/components/ui/use-toast"
import { createInvestment, getProperties, getPropertyById } from "@/services/api"
import type { Property } from "@/types/domain"

export function PropertyDetailsPage() {
  const { id = "" } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [related, setRelated] = useState<Property[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [activeFloor, setActiveFloor] = useState<"first" | "second" | "third">("first")
  const [blocksOwned, setBlocksOwned] = useState(1)
  const [investmentType, setInvestmentType] = useState<"direct" | "installment">("direct")
  const [durationYears, setDurationYears] = useState(3)
  const [referralCode, setReferralCode] = useState("")
  const [message, setMessage] = useState("")
  const { showToast } = useToast()

  useEffect(() => {
    getPropertyById(id).then(setProperty)
    getProperties().then((items) => setRelated(items.filter((item) => String(item.id) !== id)))
  }, [id])

  const availabilityPercent = useMemo(() => {
    if (!property || property.total_blocks === 0) {
      return 0
    }
    return Math.round((property.available_blocks / property.total_blocks) * 100)
  }, [property])

  const galleryImages = useMemo(
    () => [
      property?.top_view_image ?? "",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1400&q=80",
    ].filter(Boolean),
    [property?.top_view_image]
  )

  const floorPlanCopy = useMemo(
    () => ({
      first: {
        title: "First Floor",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        text: "Consectetur adipiscing elit pellentesque sed elit tempus, consectetur augue vel venenatis neque potenti convallis nulla fringilla tellus dapibus lobortis at molestie tellus quisque molestie.",
      },
      second: {
        title: "Second Floor",
        image:
          "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
        text: "Bel elit nec ultrices id lectus sagittis bibendum. Mauris ante nunc eleifend sed consectetur non ultricies molestie tellus dapibus maximus. Quisque interdum accumsan velit ac pellentesque.",
      },
      third: {
        title: "Third Floor",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        text: "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Etiam ultricies nisi vel augue.",
      },
    }),
    []
  )

  const mapDirectionsUrl = useMemo(() => {
    if (!property) {
      return "https://www.google.com/maps"
    }
    if (property.latitude && property.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location_name)}`
  }, [property])

  const googleMapEmbedUrl = (() => {
    if (!property?.latitude || !property?.longitude) {
      return `https://www.google.com/maps?q=${encodeURIComponent("18 Broklyn Street, New York")}&z=13&output=embed`
    }

    const lat = Number(property.latitude)
    const lng = Number(property.longitude)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return `https://www.google.com/maps?q=${encodeURIComponent(property.location_name)}&z=13&output=embed`
    }

    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=14&output=embed`
  })()

  const previewVideoUrl = (() => {
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
  })()

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
      await createInvestment(
        {
          property: property.id,
          type: investmentType,
          duration_years: investmentType === "installment" ? durationYears : 0,
          blocks_owned: blocksOwned,
          referral_code_used: referralCode || undefined,
        },
        token
      )
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

  if (!property) {
    return (
      <main className="bg-[#f4f6fb] px-4 py-20 text-slate-600 sm:px-6">
        <div className="mx-auto max-w-7xl">Loading property details...</div>
      </main>
    )
  }

  return (
    <main className="bg-[#f6f7fb] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
          <h2 className="text-[2rem] font-semibold text-[#0b1f44]">{property.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-[#f58e43]">
              Home
            </Link>
            <span>/</span>
            <span>{property.title}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <span className="text-[#f58e43]">
                <FontAwesomeIcon icon={faLocationDot} />
              </span>
              18 Broklyn Street, New York
            </span>
            <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-slate-700">
              <FontAwesomeIcon icon={faBookmark} className="text-xs" />
              Bookmark
            </button>
            <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-slate-700">
              <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
              Share
            </button>
            <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-slate-700">
              <FontAwesomeIcon icon={faFlag} className="text-xs" />
              Report
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-11 sm:px-6">
        <div className="grid gap-9 lg:grid-cols-[1.5fr_0.85fr]">
          <div className="space-y-9">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,32,68,0.08)]">
              <img
                src={galleryImages[activeImage]}
                alt={property.title}
                className="h-[480px] w-full rounded-2xl object-cover"
              />
              <div className="mt-4 grid grid-cols-7 gap-2">
                {galleryImages.slice(0, 7).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-lg border ${
                      activeImage === index ? "border-[#f58e43]" : "border-slate-200"
                    }`}
                  >
                    <img src={image} alt={`listing-${index + 1}`} className="h-14 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-[#0b1f44] px-3 py-1 text-sm font-semibold text-white">
                4.0 (1 Review)
              </span>
              <span className="rounded-full bg-[#ecf5ff] px-3 py-1 text-sm text-[#0b1f44]">For Rent</span>
              <span className="rounded-full bg-[#ecf5ff] px-3 py-1 text-sm text-[#0b1f44]">For Sale</span>
              <span className="rounded-full bg-[#fff3eb] px-3 py-1 text-sm text-[#f58e43]">
                {property.location_name}
              </span>
            </div>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="mb-3 text-2xl font-semibold text-[#0b1f44]">Description</h3>
              <p className="leading-8 text-slate-600">{property.description}</p>
              <p className="mt-4 leading-8 text-slate-600">
                Nullam quis ante tiam sit amet orci eget eros faucibus tincidunt. Donec quam felis,
                ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Overview</h4>
              <dl className="grid gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Number ID</dt>
                  <dd className="font-medium text-slate-900">#{property.id.toString().padStart(4, "0")}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-medium capitalize text-slate-900">{property.property_type}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Build Year</dt>
                  <dd className="font-medium text-slate-900">2020</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Bed</dt>
                  <dd className="font-medium text-slate-900">5</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Bath</dt>
                  <dd className="font-medium text-slate-900">2</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Size</dt>
                  <dd className="font-medium text-slate-900">{property.total_blocks * 8} sqft</dd>
                </div>
              </dl>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Preview Video</h4>
              <iframe
                className="h-[340px] w-full rounded-2xl"
                src={previewVideoUrl}
                title="property-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Features & Amenities</h4>
              <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                {[
                  "Air Conditioning",
                  "Washer and dryer",
                  "Swimming Pool",
                  "Basketball",
                  "24x7 Security",
                  "Central Air",
                  "Media Room",
                  "Indoor Game",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#f58e43]">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Location</h4>
              <iframe
                title="Google Maps Location"
                src={googleMapEmbedUrl}
                className="h-[320px] w-full rounded-2xl border border-slate-200"
                loading="lazy"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                  18 Broklyn Street, New York
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
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Floor Plan</h4>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setActiveFloor("first")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    activeFloor === "first" ? "bg-[#0b1f44] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  First Floor
                </button>
                <button
                  onClick={() => setActiveFloor("second")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    activeFloor === "second" ? "bg-[#0b1f44] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Second Floor
                </button>
                <button
                  onClick={() => setActiveFloor("third")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    activeFloor === "third" ? "bg-[#0b1f44] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Third Floor
                </button>
              </div>
              <img
                src={floorPlanCopy[activeFloor].image}
                alt={floorPlanCopy[activeFloor].title}
                className="h-[260px] w-full rounded-2xl object-cover"
              />
              <p className="mt-4 text-sm leading-7 text-slate-600">{floorPlanCopy[activeFloor].text}</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-4 text-xl font-semibold text-[#0b1f44]">Tag</h4>
              <div className="flex flex-wrap gap-2">
                {["Colorful", "Diamond", "House", "Housing Market", "Luxury", "Rental Property"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="text-2xl font-semibold text-[#0b1f44]">Review</h3>
              <p className="mt-2 text-sm font-medium text-[#0b1f44]">Login to Write Your Review</p>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#0b1f44] px-3 py-1 text-sm text-white">4.0</span>
                  <p className="text-sm text-slate-500">1 review</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {property.representative_name || "Assigned Representative"}
                </p>
                <p className="text-xs text-slate-500">8 November, 2024</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Decent place with great service staff but the hotel lacks charm and also they do not have
                  proper security.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="mb-5 text-2xl font-semibold text-[#0b1f44]">Related Listings</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.slice(0, 4).map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_26px_rgba(9,23,49,0.08)]"
                  >
                    <img src={item.top_view_image} alt={item.title} className="h-44 w-full object-cover" />
                    <div className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">4.0 (1)</span>
                        <button className="text-sm text-slate-500">
                          <FontAwesomeIcon icon={faHeartRegular} />
                        </button>
                      </div>
                      <h4 className="text-lg font-semibold text-[#0b1f44]">{item.title}</h4>
                      <p className="text-sm text-slate-500">18 Broklyn Street, New York</p>
                      <p className="text-sm text-slate-500">
                        It is a long established fact that a reader will be distracted the readable content.
                      </p>
                      <div className="flex items-center gap-4 border-t border-slate-100 pt-2 text-xs text-slate-500">
                        <span>1860 sqft</span>
                        <span>Bed 5</span>
                        <span>Bath 2</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#f58e43]">${item.price_per_block}</span>
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
            </article>
          </div>

          <aside className="space-y-7">
            <article className="rounded-3xl border border-[#f58e43]/30 bg-[#fff7f1] p-6">
              <h4 className="mb-3 text-xl font-semibold text-[#0b1f44]">Assigned Representative</h4>
              {property.representative_name ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-[#0b1f44]">{property.representative_name}</p>
                  <p className="text-sm text-slate-600">This property is managed by the representative above.</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-slate-700">
                      <FontAwesomeIcon icon={faPhone} className="text-[#f58e43]" />
                      <span>{property.representative_phone || "Phone not available"}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <FontAwesomeIcon icon={faEnvelope} className="text-[#f58e43]" />
                      <span>{property.representative_email || "Email not available"}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Representative is not assigned yet for this property.
                </p>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <h4 className="mb-4 text-xl font-semibold text-[#0b1f44]">Author Info</h4>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                  alt="author"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">
                    {property.representative_name || "Assigned Representative"}
                  </p>
                  <p className="text-sm text-slate-500">Property representative</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-[0.92rem] text-slate-600">
                <p>{property.location_name}</p>
                <p>{property.representative_phone || "Phone unavailable"}</p>
                <p>{property.representative_email || "Email unavailable"}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600">
                  <FontAwesomeIcon icon={faFacebookF} />
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600">
                  <FontAwesomeIcon icon={faXTwitter} />
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600">
                  <FontAwesomeIcon icon={faYoutube} />
                </span>
              </div>
              <button className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
                View Profile
              </button>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <h4 className="mb-4 text-xl font-semibold text-[#0b1f44]">Property Contact</h4>
              <dl className="space-y-3 text-[0.92rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Address</dt>
                  <dd className="text-right text-slate-800">{property.location_name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="text-right text-slate-800">
                    {property.representative_phone || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-right text-slate-800">
                    {property.representative_email || "Not provided"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Website</dt>
                  <dd className="text-right text-slate-800">https://example.com</dd>
                </div>
              </dl>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-xl font-semibold text-[#0b1f44]">Contact Listing Owner</h3>
              <div className="space-y-3">
                <input className="detail-input" placeholder="Name" />
                <input className="detail-input" placeholder="Email" />
                <textarea className="detail-input min-h-28 resize-none" placeholder="Message..." />
                <button className="w-full rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]">
                  Submit now
                </button>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-[#0b1f44]">Invest in this Property</h3>
              <div className="mb-2 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-[#f58e43]"
                  style={{ width: `${availabilityPercent}%` }}
                />
              </div>
              <p className="text-sm text-slate-500">{availabilityPercent}% blocks available</p>
              <div className="mt-4 grid gap-2">
                <select
                  className="detail-input"
                  value={investmentType}
                  onChange={(event) => setInvestmentType(event.target.value as "direct" | "installment")}
                >
                  <option value="direct">Direct Buy</option>
                  <option value="installment">Installment Basis</option>
                </select>
                <input
                  className="detail-input"
                  type="number"
                  min={1}
                  max={property.available_blocks}
                  value={blocksOwned}
                  onChange={(event) => setBlocksOwned(Number(event.target.value))}
                  placeholder="Blocks to buy"
                />
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
                  onClick={handleInvestNow}
                  className="w-full rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]"
                >
                  Invest Now
                </button>
                {message ? <p className="text-xs text-slate-500">{message}</p> : null}
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  )
}
