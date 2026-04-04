import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import {
  actionsButtonRowClass,
  stickyActionsTdClass,
  stickyActionsThClass,
} from "@/components/ui/sticky-table-actions"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { createProperty, deleteProperty, getManagedProperties, updateProperty } from "@/services/api"
import type { Property, PropertyUpsertPayload } from "@/types/domain"
import { listFromMultiline } from "@/utils/multiline-list"
import { landSaleModeAfterChannelChange } from "@/utils/property-channel-land-mode"
import { formatPropertyMoney } from "@/utils/property-display"

export function RepresentativePropertiesPage() {
  const PAGE_SIZE = 10
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyPage, setPropertyPage] = useState(1)
  const [propertyQuery, setPropertyQuery] = useState("")
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [propertyForm, setPropertyForm] = useState<PropertyUpsertPayload>({
    title: "",
    slug: "",
    description: "",
    description_secondary: "",
    property_type: "apartment",
    property_channel: "plot_buy",
    land_sale_mode: "whole_land",
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
    flat_label: "",
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
  const { showToast } = useToast()

  async function loadProperties(token: string) {
    setLoading(true)
    const propertiesPayload = await getManagedProperties(token)
    setProperties(propertiesPayload)
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      loadProperties(token).catch((error) => {
        setLoading(false)
        const message = error instanceof Error ? error.message : "Failed to load properties."
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
      property_channel: "plot_buy",
      land_sale_mode: "whole_land",
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
      flat_label: "",
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
      await loadProperties(token)
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
      await loadProperties(token)
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
      flat_label: item.flat_label ?? "",
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

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Managed properties</h2>
          <p className="mt-1 text-sm text-slate-400">Create and edit listings assigned to you.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetPropertyForm()
            setShowPropertyForm(true)
          }}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
        >
          Create property
        </button>
      </div>

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
                {loading ? (
                  <TableLoader
                    rows={10}
                    cols={11}
                    colClasses={[
                      "w-[10%]",
                      "w-[22%]",
                      "w-[8%]",
                      "w-[12%]",
                      "w-[10%]",
                      "w-[8%]",
                      "w-[8%]",
                      "w-[8%]",
                      "w-[8%]",
                      "w-[6%]",
                      "w-14 shrink-0",
                    ]}
                  />
                ) : (
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
                      <th className={stickyActionsThClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProperties.map((item) => (
                      <tr key={item.id} className="group border-b border-white/10">
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
                        <td className="px-3 py-3">{formatPropertyMoney(item.price_per_block)}</td>
                        <td className="px-3 py-3">
                          {item.available_blocks}/{item.total_blocks}
                        </td>
                        <td className={stickyActionsTdClass}>
                          <div className={actionsButtonRowClass}>
                            <TableActionIconButton
                              icon={faPenToSquare}
                              label="Edit property"
                              tone="neutral"
                              onClick={() => editProperty(item)}
                            />
                            <TableActionIconButton
                              icon={faTrash}
                              label="Delete property"
                              tone="danger"
                              onClick={() => removeProperty(item.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
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

      <DashboardModal
        open={showPropertyForm}
        wide
        title={editingPropertyId ? "Update property" : "Create property"}
        onClose={resetPropertyForm}
        footer={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void saveProperty()}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
            >
              {editingPropertyId ? "Save changes" : "Create property"}
            </button>
            <button type="button" onClick={resetPropertyForm} className="rounded-xl border border-white/20 px-4 py-2">
              Cancel
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      value={propertyForm.property_channel ?? "plot_buy"}
                      onChange={(event) => {
                        const channel = event.target.value as Property["property_channel"]
                        setPropertyForm((current) => ({
                          ...current,
                          property_channel: channel,
                          land_sale_mode: landSaleModeAfterChannelChange(channel, {
                            channel: current.property_channel ?? "plot_buy",
                            land_sale_mode: current.land_sale_mode,
                          }),
                        }))
                      }}
                      aria-label="Listing channel (plot buy vs installment)"
                    >
                      <option value="plot_buy">Plot buy — whole plot</option>
                      <option value="installment">Installment — block or shares</option>
                    </select>
                    {propertyForm.property_channel === "installment" ? (
                      <select
                        className="template-input"
                        value={propertyForm.land_sale_mode === "fractional_share" ? "fractional_share" : "per_block"}
                        onChange={(event) =>
                          setPropertyForm((current) => ({
                            ...current,
                            land_sale_mode: event.target.value as Property["land_sale_mode"],
                          }))
                        }
                        aria-label="Installment unit type"
                      >
                        <option value="per_block">By block</option>
                        <option value="fractional_share">Fractional shares</option>
                      </select>
                    ) : (
                      <input
                        className="template-input"
                        readOnly
                        value="Whole plot (plot buy)"
                        aria-label="Sale mode"
                      />
                    )}
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
                      placeholder="Rooms (bedrooms)"
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
                      placeholder="Flat / unit (e.g. 12B, Penthouse)"
                      value={propertyForm.flat_label ?? ""}
                      onChange={(event) =>
                        setPropertyForm((current) => ({ ...current, flat_label: event.target.value }))
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
                    <p className="text-xs text-slate-400 sm:col-span-2 lg:col-span-3">
                      Gallery: extra photos for the listing carousel (main hero image is “Top view image URL”
                      above). One URL per line.
                    </p>
                    <textarea
                      className="template-input min-h-22 font-mono text-xs sm:col-span-2 lg:col-span-3"
                      placeholder="https://example.com/photo-2.jpg&#10;https://example.com/photo-3.jpg"
                      value={(propertyForm.gallery_images ?? []).join("\n")}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          gallery_images: listFromMultiline(event.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-slate-400 sm:col-span-2 lg:col-span-3">
                      Features &amp; amenities (one per line). Shown under “Features &amp; Amenities” on the
                      public page.
                    </p>
                    <textarea
                      className="template-input min-h-22 sm:col-span-2 lg:col-span-3"
                      placeholder={"Pool\nGated parking\nSea view"}
                      value={(propertyForm.amenities ?? []).join("\n")}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          amenities: listFromMultiline(event.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-slate-400 sm:col-span-2 lg:col-span-3">
                      Tags (one per line). Shown in the listing “Tag” section.
                    </p>
                    <textarea
                      className="template-input min-h-16 sm:col-span-2 lg:col-span-3"
                      placeholder={"Waterfront\nLuxury"}
                      value={(propertyForm.tags ?? []).join("\n")}
                      onChange={(event) =>
                        setPropertyForm((current) => ({
                          ...current,
                          tags: listFromMultiline(event.target.value),
                        }))
                      }
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
      </DashboardModal>
    </section>
  )
}
