import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { RepresentativePropertyFormFields } from "@/components/dashboard/representative-property-form-fields"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import {
  actionsButtonRowClass,
  stickyActionsTdClass,
  stickyActionsThClass,
} from "@/components/ui/sticky-table-actions"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { createProperty, deleteProperty, getAgents, getManagedProperties, updateProperty } from "@/services/api"
import { propertyToUpsertPayload } from "@/utils/property-to-upsert-payload"
import { formatPropertyMoney } from "@/utils/property-display"
import type { AgentUser, Property, PropertyUpsertPayload } from "@/types/domain"

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export function RepresentativePropertiesPage() {
  const [pageSize, setPageSize] = useState(10)
  const [properties, setProperties] = useState<Property[]>([])
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [propertyPage, setPropertyPage] = useState(1)
  const [propertyQuery, setPropertyQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterChannel, setFilterChannel] = useState<string>("all")
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
    total_blocks: 0,
    available_blocks: 0,
    price_per_block: "",
    whole_land_price: null,
    share_price: null,
    total_shares: null,
    available_shares: null,
    min_shares_per_order: undefined,
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
    review_count: undefined,
    review_sample_author: "",
    review_sample_date: null,
    review_sample_text: "",
    status: "available",
    listing_active: true,
    expected_profit_percent: null,
    investment_window_start: null,
    investment_window_end: null,
    share_investment_options: [],
    managed_by: null,
  })
  const { showToast } = useToast()

  async function loadProperties(token: string) {
    setLoading(true)
    const propertiesPayload = await getManagedProperties(token)
    setProperties(propertiesPayload)
    setLoading(false)
  }

  async function loadAgents(token: string) {
    const list = await getAgents(token)
    setAgents(list)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      setLoading(true)
      Promise.all([loadProperties(token), loadAgents(token)]).catch((error) => {
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
      total_blocks: 0,
      available_blocks: 0,
      price_per_block: "",
      whole_land_price: null,
      share_price: null,
      total_shares: null,
      available_shares: null,
      min_shares_per_order: undefined,
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
      review_count: undefined,
      review_sample_author: "",
      review_sample_date: null,
      review_sample_text: "",
      status: "available",
      listing_active: true,
      expected_profit_percent: null,
      investment_window_start: null,
      investment_window_end: null,
      share_investment_options: [],
      managed_by: null,
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

  async function removeProperty(item: Property) {
    if (
      !window.confirm(
        `Delete "${item.title}"? This permanently removes the listing. This cannot be undone.`
      )
    ) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteProperty(item.id, token)
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
    setPropertyForm(propertyToUpsertPayload(item))
  }

  const filteredProperties = useMemo(() => {
    let list = properties
    if (filterStatus !== "all") {
      list = list.filter((item) => item.status === filterStatus)
    }
    if (filterType !== "all") {
      list = list.filter((item) => item.property_type === filterType)
    }
    if (filterChannel !== "all") {
      list = list.filter((item) => item.property_channel === filterChannel)
    }
    const query = propertyQuery.trim().toLowerCase()
    if (!query) {
      return list
    }
    return list.filter((item) =>
      [item.title, item.location_name, item.slug, item.status, item.property_type, item.property_channel]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [properties, propertyQuery, filterStatus, filterType, filterChannel])

  const propertyTotalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize))
  const paginatedProperties = useMemo(() => {
    const start = (propertyPage - 1) * pageSize
    return filteredProperties.slice(start, start + pageSize)
  }, [filteredProperties, propertyPage, pageSize])

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

      <div className="mb-4 flex flex-col gap-3">
        <div className="dashboard-filters-row items-center">
          <input
            className="dashboard-filter-input min-w-[220px] flex-1"
            placeholder="Search title, slug, location, type, status…"
            value={propertyQuery}
            onChange={(event) => {
              setPropertyQuery(event.target.value)
              setPropertyPage(1)
            }}
          />
          <div className="flex min-w-[140px] items-center gap-2">
            <span className="shrink-0 text-sm text-slate-500">Rows</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Rows per page"
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPropertyPage(1)
                }}
                options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: `${n} / page` }))}
              />
            </div>
          </div>
        </div>
        <div className="dashboard-filters-row">
          <div className="flex min-w-[130px] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by status"
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v)
                  setPropertyPage(1)
                }}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "available", label: "Available" },
                  { value: "booked", label: "Booked" },
                  { value: "sold", label: "Sold" },
                ]}
              />
            </div>
          </div>
          <div className="flex min-w-[130px] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Type</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by property type"
                value={filterType}
                onValueChange={(v) => {
                  setFilterType(v)
                  setPropertyPage(1)
                }}
                options={[
                  { value: "all", label: "All types" },
                  { value: "apartment", label: "Apartment" },
                  { value: "villa", label: "Villa" },
                  { value: "commercial", label: "Commercial" },
                  { value: "land", label: "Land" },
                ]}
              />
            </div>
          </div>
          <div className="flex min-w-[140px] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Channel</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by channel"
                value={filterChannel}
                onValueChange={(v) => {
                  setFilterChannel(v)
                  setPropertyPage(1)
                }}
                options={[
                  { value: "all", label: "All channels" },
                  { value: "plot_buy", label: "Plot buy" },
                  { value: "installment", label: "Installment" },
                ]}
              />
            </div>
          </div>
        </div>
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
                      <tr
                        key={item.id}
                        className="group border-b border-white/10 transition-colors hover:bg-white/[0.06]"
                      >
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
                              onClick={() => void removeProperty(item)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
        )}
              </div>
              <DashboardTablePagination
                className="mt-4 text-sm"
                page={propertyPage}
                totalPages={propertyTotalPages}
                pageSize={pageSize}
                totalItems={filteredProperties.length}
                onPageChange={setPropertyPage}
              />

      <DashboardModal
        open={showPropertyForm}
        wide
        title={editingPropertyId ? "Update property" : "Create property"}
        onClose={resetPropertyForm}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={resetPropertyForm} className="dashboard-modal-btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={() => void saveProperty()} className="dashboard-modal-btn-primary">
              {editingPropertyId ? "Save changes" : "Create property"}
            </button>
          </div>
        }
      >
        <RepresentativePropertyFormFields
          propertyForm={propertyForm}
          setPropertyForm={setPropertyForm}
          editingPropertyId={editingPropertyId}
          showToast={showToast}
          agents={agents}
        />
      </DashboardModal>
    </section>
  )
}
