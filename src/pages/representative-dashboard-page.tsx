import { useEffect, useMemo, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import {
  createAdvertiser,
  createProperty,
  deleteAdvertiser,
  deleteProperty,
  getAdvertisers,
  getDashboardByRole,
  getManagedProperties,
  updateAdvertiser,
  updateProperty,
} from "@/services/api"
import type {
  AdvertiserUpsertPayload,
  AdvertiserUser,
  Property,
  PropertyUpsertPayload,
  RepresentativeDashboardData,
} from "@/types/domain"

export function RepresentativeDashboardPage() {
  const PAGE_SIZE = 5
  const [data, setData] = useState<RepresentativeDashboardData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [advertisers, setAdvertisers] = useState<AdvertiserUser[]>([])
  const [activeTab, setActiveTab] = useState<"properties" | "advertisers">("properties")
  const [propertyPage, setPropertyPage] = useState(1)
  const [advertiserPage, setAdvertiserPage] = useState(1)
  const [propertyQuery, setPropertyQuery] = useState("")
  const [advertiserQuery, setAdvertiserQuery] = useState("")
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [showAdvertiserForm, setShowAdvertiserForm] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null)
  const [editingAdvertiserId, setEditingAdvertiserId] = useState<number | null>(null)
  const [propertyForm, setPropertyForm] = useState<PropertyUpsertPayload>({
    title: "",
    slug: "",
    description: "",
    property_type: "apartment",
    total_blocks: 100,
    available_blocks: 100,
    price_per_block: "100.00",
    location_name: "",
    latitude: null,
    longitude: null,
    video_url: "",
    top_view_image: "",
    status: "available",
  })
  const [advertiserForm, setAdvertiserForm] = useState<AdvertiserUpsertPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    is_active: true,
  })
  const { showToast } = useToast()

  async function loadData(token: string) {
    const [dashboardPayload, propertiesPayload, advertisersPayload] = await Promise.all([
      getDashboardByRole(token),
      getManagedProperties(token),
      getAdvertisers(token),
    ])
    setData(dashboardPayload as RepresentativeDashboardData)
    setProperties(propertiesPayload)
    setAdvertisers(advertisersPayload)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      loadData(token).catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load representative dashboard."
        showToast(message, "error")
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [showToast])

  const resetPropertyForm = () => {
    setEditingPropertyId(null)
    setShowPropertyForm(false)
    setPropertyForm({
      title: "",
      slug: "",
      description: "",
      property_type: "apartment",
      total_blocks: 100,
      available_blocks: 100,
      price_per_block: "100.00",
      location_name: "",
      latitude: null,
      longitude: null,
      video_url: "",
      top_view_image: "",
      status: "available",
    })
  }

  const resetAdvertiserForm = () => {
    setEditingAdvertiserId(null)
    setShowAdvertiserForm(false)
    setAdvertiserForm({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      is_active: true,
    })
  }

  async function saveProperty() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      if (editingPropertyId) {
        await updateProperty(editingPropertyId, propertyForm, token)
        showToast("Property updated.", "success")
      } else {
        await createProperty(propertyForm, token)
        showToast("Property created.", "success")
      }
      await loadData(token)
      resetPropertyForm()
      setPropertyPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Property save failed."
      showToast(message, "error")
    }
  }

  async function removeProperty(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteProperty(id, token)
      showToast("Property deleted.", "success")
      await loadData(token)
      setPropertyPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Property delete failed."
      showToast(message, "error")
    }
  }

  function editProperty(item: Property) {
    setEditingPropertyId(item.id)
    setShowPropertyForm(true)
    setPropertyForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      property_type: item.property_type,
      total_blocks: item.total_blocks,
      available_blocks: item.available_blocks,
      price_per_block: item.price_per_block,
      location_name: item.location_name,
      latitude: item.latitude,
      longitude: item.longitude,
      video_url: item.video_url,
      top_view_image: item.top_view_image,
      status: item.status,
    })
  }

  async function saveAdvertiser() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      if (editingAdvertiserId) {
        const payload = { ...advertiserForm }
        if (!payload.password) {
          delete payload.password
        }
        await updateAdvertiser(editingAdvertiserId, payload, token)
        showToast("Advertiser updated.", "success")
      } else {
        if (!advertiserForm.password) {
          showToast("Password is required for new advertiser.", "error")
          return
        }
        await createAdvertiser(advertiserForm, token)
        showToast("Advertiser created.", "success")
      }
      await loadData(token)
      resetAdvertiserForm()
      setAdvertiserPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Advertiser save failed."
      showToast(message, "error")
    }
  }

  async function removeAdvertiser(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteAdvertiser(id, token)
      showToast("Advertiser deleted.", "success")
      await loadData(token)
      setAdvertiserPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Advertiser delete failed."
      showToast(message, "error")
    }
  }

  function editAdvertiser(item: AdvertiserUser) {
    setEditingAdvertiserId(item.id)
    setShowAdvertiserForm(true)
    setAdvertiserForm({
      username: item.username,
      email: item.email,
      first_name: item.first_name,
      last_name: item.last_name,
      phone: item.phone,
      password: "",
      is_active: item.is_active,
    })
  }

  const filteredProperties = useMemo(() => {
    const query = propertyQuery.trim().toLowerCase()
    if (!query) {
      return properties
    }
    return properties.filter((item) =>
      [item.title, item.location_name, item.slug, item.status, item.property_type]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [properties, propertyQuery])

  const propertyTotalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE))
  const paginatedProperties = useMemo(() => {
    const start = (propertyPage - 1) * PAGE_SIZE
    return filteredProperties.slice(start, start + PAGE_SIZE)
  }, [filteredProperties, propertyPage, PAGE_SIZE])

  const filteredAdvertisers = useMemo(() => {
    const query = advertiserQuery.trim().toLowerCase()
    if (!query) {
      return advertisers
    }
    return advertisers.filter((item) =>
      [item.username, item.email, item.first_name, item.last_name, item.phone].join(" ").toLowerCase().includes(query)
    )
  }, [advertisers, advertiserQuery])

  const advertiserTotalPages = Math.max(1, Math.ceil(filteredAdvertisers.length / PAGE_SIZE))
  const paginatedAdvertisers = useMemo(() => {
    const start = (advertiserPage - 1) * PAGE_SIZE
    return filteredAdvertisers.slice(start, start + PAGE_SIZE)
  }, [filteredAdvertisers, advertiserPage, PAGE_SIZE])

  if (!data) {
    return (
      <main className="bg-slate-950 px-4 py-20 text-slate-300 sm:px-6">
        Loading representative dashboard...
      </main>
    )
  }

  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Representative Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Client & Referral Performance</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="metric-card"><p>Referred Users</p><strong>{data.total_referred_users}</strong></article>
          <article className="metric-card"><p>Referred Investments</p><strong>{data.referred_investments}</strong></article>
          <article className="metric-card"><p>Referred Amount</p><strong>${data.referred_investment_amount}</strong></article>
          <article className="metric-card"><p>Commission Earned</p><strong>${data.earned_commission}</strong></article>
          <article className="metric-card"><p>Managed Properties</p><strong>{data.managed_properties}</strong></article>
          <article className="metric-card"><p>Direct Buy Requests</p><strong>{data.direct_buy_requests}</strong></article>
          <article className="metric-card"><p>Installment Requests</p><strong>{data.installment_requests}</strong></article>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-white/20 bg-slate-950/60 p-1">
              <button
                onClick={() => setActiveTab("properties")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  activeTab === "properties" ? "bg-emerald-500 text-slate-950" : "text-slate-200"
                }`}
              >
                Property Management
              </button>
              <button
                onClick={() => setActiveTab("advertisers")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  activeTab === "advertisers" ? "bg-emerald-500 text-slate-950" : "text-slate-200"
                }`}
              >
                Advertiser Management
              </button>
            </div>
            {activeTab === "properties" ? (
              <button
                onClick={() => {
                  resetPropertyForm()
                  setShowPropertyForm(true)
                }}
                className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
              >
                Create Property
              </button>
            ) : (
              <button
                onClick={() => {
                  resetAdvertiserForm()
                  setShowAdvertiserForm(true)
                }}
                className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
              >
                Create Advertiser
              </button>
            )}
          </div>

          {activeTab === "properties" ? (
            <>
              <div className="mb-4">
                <input
                  className="template-input w-full sm:w-96"
                  placeholder="Search by title, slug, location, type, status..."
                  value={propertyQuery}
                  onChange={(event) => {
                    setPropertyQuery(event.target.value)
                    setPropertyPage(1)
                  }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-300">
                      <th className="px-3 py-2">Image</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Location</th>
                      <th className="px-3 py-2">Coordinates</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Price / Block</th>
                      <th className="px-3 py-2">Blocks</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProperties.map((item) => (
                      <tr key={item.id} className="border-b border-white/10">
                        <td className="px-3 py-3">
                          {item.top_view_image ? (
                            <img
                              src={item.top_view_image}
                              alt={item.title}
                              className="h-12 w-16 rounded object-cover"
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-3">{item.title}</td>
                        <td className="px-3 py-3 capitalize">{item.property_type}</td>
                        <td className="px-3 py-3">{item.location_name}</td>
                        <td className="px-3 py-3 text-xs text-slate-300">
                          {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-"}
                        </td>
                        <td className="px-3 py-3 capitalize">{item.status}</td>
                        <td className="px-3 py-3">${item.price_per_block}</td>
                        <td className="px-3 py-3">
                          {item.available_blocks}/{item.total_blocks}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProperty(item)}
                              className="rounded border border-white/20 px-2 py-1 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeProperty(item.id)}
                              className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <p>
                  Showing {paginatedProperties.length} of {filteredProperties.length} properties
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={propertyPage <= 1}
                    onClick={() => setPropertyPage((current) => Math.max(1, current - 1))}
                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Page {propertyPage} / {propertyTotalPages}
                  </span>
                  <button
                    disabled={propertyPage >= propertyTotalPages}
                    onClick={() => setPropertyPage((current) => Math.min(propertyTotalPages, current + 1))}
                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {showPropertyForm ? (
                <div className="mt-6 rounded-2xl border border-white/15 bg-slate-950/50 p-5">
                  <h3 className="text-lg font-semibold">
                    {editingPropertyId ? "Update Property" : "Create Property"}
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <input
                      className="template-input"
                      placeholder="Title"
                      value={propertyForm.title}
                      onChange={(event) => setPropertyForm((current) => ({ ...current, title: event.target.value }))}
                    />
                    <input
                      className="template-input"
                      placeholder="Slug"
                      value={propertyForm.slug}
                      onChange={(event) => setPropertyForm((current) => ({ ...current, slug: event.target.value }))}
                    />
                    <input
                      className="template-input"
                      placeholder="Location"
                      value={propertyForm.location_name}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, location_name: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Price per block"
                      value={propertyForm.price_per_block}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, price_per_block: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Total blocks"
                      type="number"
                      value={propertyForm.total_blocks}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, total_blocks: Number(event.target.value) }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Available blocks"
                      type="number"
                      value={propertyForm.available_blocks}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, available_blocks: Number(event.target.value) }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Latitude (e.g. 23.810300)"
                      value={propertyForm.latitude ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          latitude: event.target.value.trim() ? event.target.value : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Longitude (e.g. 90.412500)"
                      value={propertyForm.longitude ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          longitude: event.target.value.trim() ? event.target.value : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Top view image URL"
                      value={propertyForm.top_view_image ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, top_view_image: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Video URL"
                      value={propertyForm.video_url ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, video_url: event.target.value }))
                      }
                    />
                    <select
                      className="template-input"
                      value={propertyForm.property_type}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          property_type: event.target.value as Property["property_type"],
                        }))
                      }
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </select>
                    <select
                      className="template-input"
                      value={propertyForm.status ?? "available"}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          status: event.target.value as Property["status"],
                        }))
                      }
                    >
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="sold">Sold</option>
                    </select>
                    <textarea
                      className="template-input sm:col-span-2 lg:col-span-3"
                      placeholder="Description"
                      value={propertyForm.description}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, description: event.target.value }))
                      }
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={saveProperty}
                      className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
                    >
                      {editingPropertyId ? "Update Property" : "Create Property"}
                    </button>
                    <button onClick={resetPropertyForm} className="rounded-xl border border-white/20 px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="mb-4">
                <input
                  className="template-input w-full sm:w-96"
                  placeholder="Search by username, email, phone..."
                  value={advertiserQuery}
                  onChange={(event) => {
                    setAdvertiserQuery(event.target.value)
                    setAdvertiserPage(1)
                  }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-300">
                      <th className="px-3 py-2">Username</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdvertisers.map((item) => (
                      <tr key={item.id} className="border-b border-white/10">
                        <td className="px-3 py-3">{item.username}</td>
                        <td className="px-3 py-3">
                          {[item.first_name, item.last_name].filter(Boolean).join(" ") || "-"}
                        </td>
                        <td className="px-3 py-3">{item.email}</td>
                        <td className="px-3 py-3">{item.phone || "-"}</td>
                        <td className="px-3 py-3">{item.is_active ? "Active" : "Inactive"}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editAdvertiser(item)}
                              className="rounded border border-white/20 px-2 py-1 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeAdvertiser(item.id)}
                              className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <p>
                  Showing {paginatedAdvertisers.length} of {filteredAdvertisers.length} advertisers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={advertiserPage <= 1}
                    onClick={() => setAdvertiserPage((current) => Math.max(1, current - 1))}
                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Page {advertiserPage} / {advertiserTotalPages}
                  </span>
                  <button
                    disabled={advertiserPage >= advertiserTotalPages}
                    onClick={() => setAdvertiserPage((current) => Math.min(advertiserTotalPages, current + 1))}
                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {showAdvertiserForm ? (
                <div className="mt-6 rounded-2xl border border-white/15 bg-slate-950/50 p-5">
                  <h3 className="text-lg font-semibold">
                    {editingAdvertiserId ? "Update Advertiser" : "Create Advertiser"}
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <input
                      className="template-input"
                      placeholder="Username"
                      value={advertiserForm.username}
                      onChange={(event) =>
                        setAdvertiserForm((current) => ({ ...current, username: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Email"
                      value={advertiserForm.email}
                      onChange={(event) =>
                        setAdvertiserForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder={editingAdvertiserId ? "Password (optional)" : "Password"}
                      type="password"
                      value={advertiserForm.password}
                      onChange={(event) =>
                        setAdvertiserForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="First Name"
                      value={advertiserForm.first_name}
                      onChange={(event) =>
                        setAdvertiserForm((current) => ({ ...current, first_name: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Last Name"
                      value={advertiserForm.last_name}
                      onChange={(event) =>
                        setAdvertiserForm((current) => ({ ...current, last_name: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Phone"
                      value={advertiserForm.phone}
                      onChange={(event) =>
                        setAdvertiserForm((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={saveAdvertiser}
                      className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
                    >
                      {editingAdvertiserId ? "Update Advertiser" : "Create Advertiser"}
                    </button>
                    <button onClick={resetAdvertiserForm} className="rounded-xl border border-white/20 px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
