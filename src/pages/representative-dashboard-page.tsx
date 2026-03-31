import { useEffect, useMemo, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import {
  createAgent,
  createProperty,
  deleteAgent,
  deleteProperty,
  getAgents,
  getDashboardByRole,
  getManagedProperties,
  updateAgent,
  updateProperty,
} from "@/services/api"
import type {
  AgentUpsertPayload,
  AgentUser,
  Property,
  PropertyUpsertPayload,
  RepresentativeDashboardData,
} from "@/types/domain"

export function RepresentativeDashboardPage() {
  const PAGE_SIZE = 5
  const [data, setData] = useState<RepresentativeDashboardData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [activeTab, setActiveTab] = useState<"properties" | "agents">("properties")
  const [propertyPage, setPropertyPage] = useState(1)
  const [agentPage, setAgentPage] = useState(1)
  const [propertyQuery, setPropertyQuery] = useState("")
  const [agentQuery, setAgentQuery] = useState("")
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null)
  const [editingAgentId, setEditingAgentId] = useState<number | null>(null)
  const [propertyForm, setPropertyForm] = useState<PropertyUpsertPayload>({
    title: "",
    slug: "",
    description: "",
    description_secondary: "",
    property_type: "apartment",
    property_channel: "direct_buy",
    land_sale_mode: "per_block",
    total_blocks: 100,
    available_blocks: 100,
    price_per_block: "100.00",
    whole_land_price: null,
    share_price: null,
    total_shares: null,
    available_shares: null,
    min_shares_per_order: 1,
    location_name: "",
    latitude: null,
    longitude: null,
    video_url: "",
    top_view_image: "",
    gallery_images: [],
    amenities: [],
    tags: [],
    floor_plans: [],
    build_year: null,
    bedrooms: null,
    bathrooms: null,
    size_sqft: null,
    for_rent: false,
    for_sale: true,
    contact_website: "",
    rating_average: null,
    review_count: 0,
    review_sample_author: "",
    review_sample_date: null,
    review_sample_text: "",
    status: "available",
  })
  const [agentForm, setAgentForm] = useState<AgentUpsertPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    is_active: true,
    referral_commission_percent: "5.00",
  })
  const { showToast } = useToast()

  async function loadData(token: string) {
    const [dashboardPayload, propertiesPayload, agentsPayload] = await Promise.all([
      getDashboardByRole(token),
      getManagedProperties(token),
      getAgents(token),
    ])
    setData(dashboardPayload as RepresentativeDashboardData)
    setProperties(propertiesPayload)
    setAgents(agentsPayload)
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
      description_secondary: "",
      property_type: "apartment",
      property_channel: "direct_buy",
      land_sale_mode: "per_block",
      total_blocks: 100,
      available_blocks: 100,
      price_per_block: "100.00",
      whole_land_price: null,
      share_price: null,
      total_shares: null,
      available_shares: null,
      min_shares_per_order: 1,
      location_name: "",
      latitude: null,
      longitude: null,
      video_url: "",
      top_view_image: "",
      gallery_images: [],
      amenities: [],
      tags: [],
      floor_plans: [],
      build_year: null,
      bedrooms: null,
      bathrooms: null,
      size_sqft: null,
      for_rent: false,
      for_sale: true,
      contact_website: "",
      rating_average: null,
      review_count: 0,
      review_sample_author: "",
      review_sample_date: null,
      review_sample_text: "",
      status: "available",
    })
  }

  const resetAgentForm = () => {
    setEditingAgentId(null)
    setShowAgentForm(false)
    setAgentForm({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      is_active: true,
      referral_commission_percent: "5.00",
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
      description_secondary: item.description_secondary,
      property_type: item.property_type,
      property_channel: item.property_channel,
      land_sale_mode: item.land_sale_mode,
      total_blocks: item.total_blocks,
      available_blocks: item.available_blocks,
      price_per_block: item.price_per_block,
      whole_land_price: item.whole_land_price,
      share_price: item.share_price,
      total_shares: item.total_shares,
      available_shares: item.available_shares,
      min_shares_per_order: item.min_shares_per_order,
      location_name: item.location_name,
      latitude: item.latitude,
      longitude: item.longitude,
      video_url: item.video_url,
      top_view_image: item.top_view_image,
      gallery_images: item.gallery_images ?? [],
      amenities: item.amenities ?? [],
      tags: item.tags ?? [],
      floor_plans: item.floor_plans ?? [],
      build_year: item.build_year,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      size_sqft: item.size_sqft,
      for_rent: item.for_rent,
      for_sale: item.for_sale,
      contact_website: item.contact_website,
      rating_average: item.rating_average,
      review_count: item.review_count,
      review_sample_author: item.review_sample_author,
      review_sample_date: item.review_sample_date,
      review_sample_text: item.review_sample_text,
      status: item.status,
    })
  }

  async function saveAgent() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      if (editingAgentId) {
        const payload = { ...agentForm }
        if (!payload.password) {
          delete payload.password
        }
        await updateAgent(editingAgentId, payload, token)
        showToast("Agent updated.", "success")
      } else {
        if (!agentForm.password) {
          showToast("Password is required for new agent.", "error")
          return
        }
        await createAgent(agentForm, token)
        showToast("Agent created.", "success")
      }
      await loadData(token)
      resetAgentForm()
      setAgentPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent save failed."
      showToast(message, "error")
    }
  }

  async function removeAgent(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteAgent(id, token)
      showToast("Agent deleted.", "success")
      await loadData(token)
      setAgentPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent delete failed."
      showToast(message, "error")
    }
  }

  function editAgent(item: AgentUser) {
    setEditingAgentId(item.id)
    setShowAgentForm(true)
    setAgentForm({
      username: item.username,
      email: item.email,
      first_name: item.first_name,
      last_name: item.last_name,
      phone: item.phone,
      password: "",
      is_active: item.is_active,
      referral_commission_percent: item.referral_commission_percent,
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

  const filteredAgents = useMemo(() => {
    const query = agentQuery.trim().toLowerCase()
    if (!query) {
      return agents
    }
    return agents.filter((item) =>
      [item.username, item.email, item.first_name, item.last_name, item.phone].join(" ").toLowerCase().includes(query)
    )
  }, [agents, agentQuery])

  const agentTotalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE))
  const paginatedAgents = useMemo(() => {
    const start = (agentPage - 1) * PAGE_SIZE
    return filteredAgents.slice(start, start + PAGE_SIZE)
  }, [filteredAgents, agentPage, PAGE_SIZE])

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
                onClick={() => setActiveTab("agents")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  activeTab === "agents" ? "bg-emerald-500 text-slate-950" : "text-slate-200"
                }`}
              >
                Agent Management
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
                  resetAgentForm()
                  setShowAgentForm(true)
                }}
                className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
              >
                Create Agent
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
                      <th className="px-3 py-2">Channel</th>
                      <th className="px-3 py-2">Sale mode</th>
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
                        <td className="px-3 py-3 text-xs capitalize text-slate-300">
                          {item.property_channel.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-3 text-xs capitalize text-slate-300">
                          {item.land_sale_mode.replace(/_/g, " ")}
                        </td>
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
                    <select
                      className="template-input"
                      value={propertyForm.property_channel ?? "direct_buy"}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          property_channel: event.target.value as Property["property_channel"],
                        }))
                      }
                      aria-label="Listing channel (direct buy vs installment)"
                    >
                      <option value="direct_buy">Direct buy (homepage lane)</option>
                      <option value="installment">Installment (homepage lane)</option>
                    </select>
                    <select
                      className="template-input"
                      value={propertyForm.land_sale_mode ?? "per_block"}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          land_sale_mode: event.target.value as Property["land_sale_mode"],
                        }))
                      }
                    >
                      <option value="per_block">Per block</option>
                      <option value="whole_land">Whole land</option>
                      <option value="fractional_share">Fractional shares</option>
                    </select>
                    <input
                      className="template-input"
                      placeholder="Whole land price (optional)"
                      value={propertyForm.whole_land_price ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          whole_land_price: event.target.value.trim() ? event.target.value : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Share price"
                      value={propertyForm.share_price ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          share_price: event.target.value.trim() ? event.target.value : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Total shares"
                      type="number"
                      value={propertyForm.total_shares ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          total_shares: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Available shares"
                      type="number"
                      value={propertyForm.available_shares ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          available_shares: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Min shares per order"
                      type="number"
                      value={propertyForm.min_shares_per_order ?? 1}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          min_shares_per_order: Number(event.target.value) || 1,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Build year"
                      type="number"
                      value={propertyForm.build_year ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          build_year: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Bedrooms"
                      type="number"
                      value={propertyForm.bedrooms ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          bedrooms: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Bathrooms"
                      type="number"
                      value={propertyForm.bathrooms ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          bathrooms: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Size sqft"
                      type="number"
                      value={propertyForm.size_sqft ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          size_sqft: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Contact website URL"
                      value={propertyForm.contact_website ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, contact_website: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Rating average (e.g. 4.5)"
                      value={propertyForm.rating_average ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          rating_average: event.target.value.trim() ? event.target.value : null,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Review count"
                      type="number"
                      value={propertyForm.review_count ?? 0}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          review_count: Number(event.target.value) || 0,
                        }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Sample review author"
                      value={propertyForm.review_sample_author ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, review_sample_author: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Sample review date (YYYY-MM-DD)"
                      value={propertyForm.review_sample_date ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          review_sample_date: event.target.value.trim() ? event.target.value : null,
                        }))
                      }
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-1">
                      <input
                        type="checkbox"
                        checked={propertyForm.for_rent ?? false}
                        onChange={(event) =>
                          setPropertyForm((current) => ({ ...current, for_rent: event.target.checked }))
                        }
                      />
                      For rent
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-1">
                      <input
                        type="checkbox"
                        checked={propertyForm.for_sale !== false}
                        onChange={(event) =>
                          setPropertyForm((current) => ({ ...current, for_sale: event.target.checked }))
                        }
                      />
                      For sale
                    </label>
                    <textarea
                      className="template-input sm:col-span-2 lg:col-span-3"
                      placeholder="Description"
                      value={propertyForm.description}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, description: event.target.value }))
                      }
                    />
                    <textarea
                      className="template-input sm:col-span-2 lg:col-span-3"
                      placeholder="Secondary description"
                      value={propertyForm.description_secondary ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, description_secondary: event.target.value }))
                      }
                    />
                    <textarea
                      key={`gal-${editingPropertyId ?? "n"}`}
                      className="template-input font-mono text-xs sm:col-span-2 lg:col-span-3"
                      placeholder='Gallery image URLs JSON array e.g. ["https://..."]'
                      defaultValue={JSON.stringify(propertyForm.gallery_images ?? [])}
                      onBlur={(event) => {
                        try {
                          const parsed = JSON.parse(event.target.value) as unknown
                          if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
                            setPropertyForm((current) => ({ ...current, gallery_images: parsed }))
                          } else {
                            showToast("Gallery JSON must be an array of strings.", "error")
                          }
                        } catch {
                          showToast("Invalid gallery JSON.", "error")
                        }
                      }}
                    />
                    <textarea
                      key={`am-${editingPropertyId ?? "n"}`}
                      className="template-input font-mono text-xs sm:col-span-2 lg:col-span-3"
                      placeholder='Amenities JSON e.g. ["Pool","Gym"]'
                      defaultValue={JSON.stringify(propertyForm.amenities ?? [])}
                      onBlur={(event) => {
                        try {
                          const parsed = JSON.parse(event.target.value) as unknown
                          if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
                            setPropertyForm((current) => ({ ...current, amenities: parsed }))
                          } else {
                            showToast("Amenities JSON must be an array of strings.", "error")
                          }
                        } catch {
                          showToast("Invalid amenities JSON.", "error")
                        }
                      }}
                    />
                    <textarea
                      key={`tg-${editingPropertyId ?? "n"}`}
                      className="template-input font-mono text-xs sm:col-span-2 lg:col-span-3"
                      placeholder='Tags JSON e.g. ["Luxury"]'
                      defaultValue={JSON.stringify(propertyForm.tags ?? [])}
                      onBlur={(event) => {
                        try {
                          const parsed = JSON.parse(event.target.value) as unknown
                          if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
                            setPropertyForm((current) => ({ ...current, tags: parsed }))
                          } else {
                            showToast("Tags JSON must be an array of strings.", "error")
                          }
                        } catch {
                          showToast("Invalid tags JSON.", "error")
                        }
                      }}
                    />
                    <textarea
                      key={`fp-${editingPropertyId ?? "n"}`}
                      className="template-input font-mono text-xs sm:col-span-2 lg:col-span-3"
                      placeholder='Floor plans JSON [{"title":"1st","image_url":"https://...","description":"..."}]'
                      defaultValue={JSON.stringify(propertyForm.floor_plans ?? [])}
                      onBlur={(event) => {
                        try {
                          const parsed = JSON.parse(event.target.value) as unknown
                          if (Array.isArray(parsed)) {
                            setPropertyForm((current) => ({
                              ...current,
                              floor_plans: parsed as Property["floor_plans"],
                            }))
                          } else {
                            showToast("Floor plans must be a JSON array.", "error")
                          }
                        } catch {
                          showToast("Invalid floor plans JSON.", "error")
                        }
                      }}
                    />
                    <textarea
                      className="template-input sm:col-span-2 lg:col-span-3"
                      placeholder="Sample review text"
                      value={propertyForm.review_sample_text ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, review_sample_text: event.target.value }))
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
                  value={agentQuery}
                  onChange={(event) => {
                    setAgentQuery(event.target.value)
                    setAgentPage(1)
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
                      <th className="px-3 py-2">Ref %</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAgents.map((item) => (
                      <tr key={item.id} className="border-b border-white/10">
                        <td className="px-3 py-3">{item.username}</td>
                        <td className="px-3 py-3">
                          {[item.first_name, item.last_name].filter(Boolean).join(" ") || "-"}
                        </td>
                        <td className="px-3 py-3">{item.email}</td>
                        <td className="px-3 py-3">{item.phone || "-"}</td>
                        <td className="px-3 py-3">{item.referral_commission_percent ?? "-"}</td>
                        <td className="px-3 py-3">{item.is_active ? "Active" : "Inactive"}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editAgent(item)}
                              className="rounded border border-white/20 px-2 py-1 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeAgent(item.id)}
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
                  Showing {paginatedAgents.length} of {filteredAgents.length} agents
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={agentPage <= 1}
                    onClick={() => setAgentPage((current) => Math.max(1, current - 1))}
                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Page {agentPage} / {agentTotalPages}
                  </span>
                  <button
                    disabled={agentPage >= agentTotalPages}
                    onClick={() => setAgentPage((current) => Math.min(agentTotalPages, current + 1))}
                    className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {showAgentForm ? (
                <div className="mt-6 rounded-2xl border border-white/15 bg-slate-950/50 p-5">
                  <h3 className="text-lg font-semibold">
                    {editingAgentId ? "Update Agent" : "Create Agent"}
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <input
                      className="template-input"
                      placeholder="Username"
                      value={agentForm.username}
                      onChange={(event) =>
                        setAgentForm((current) => ({ ...current, username: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Email"
                      value={agentForm.email}
                      onChange={(event) =>
                        setAgentForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder={editingAgentId ? "Password (optional)" : "Password"}
                      type="password"
                      value={agentForm.password}
                      onChange={(event) =>
                        setAgentForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="First Name"
                      value={agentForm.first_name}
                      onChange={(event) =>
                        setAgentForm((current) => ({ ...current, first_name: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Last Name"
                      value={agentForm.last_name}
                      onChange={(event) =>
                        setAgentForm((current) => ({ ...current, last_name: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Phone"
                      value={agentForm.phone}
                      onChange={(event) =>
                        setAgentForm((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                    <input
                      className="template-input"
                      placeholder="Referral commission %"
                      value={agentForm.referral_commission_percent ?? "5.00"}
                      onChange={(event) =>
                        setAgentForm((current) => ({
                          ...current,
                          referral_commission_percent: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={saveAgent}
                      className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
                    >
                      {editingAgentId ? "Update Agent" : "Create Agent"}
                    </button>
                    <button onClick={resetAgentForm} className="rounded-xl border border-white/20 px-4 py-2">
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
