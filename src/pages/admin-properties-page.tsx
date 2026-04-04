import { useCallback, useEffect, useMemo, useState } from "react"

import { PropertyEditModal } from "@/components/dashboard/property-edit-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import {
  actionsButtonRowClass,
  stickyActionsTdAdminClass,
  stickyActionsThAdminClass,
} from "@/components/ui/sticky-table-actions"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { deleteProperty, getProperties } from "@/services/api"
import type { Property } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"

const PAGE_SIZE = 12

function moneyCell(v: string | null | undefined): string {
  if (v == null || v === "") return "—"
  const n = Number(v)
  return Number.isFinite(n) ? formatBdtInteger(n) : "—"
}

function channelLabel(ch: Property["property_channel"]): string {
  return ch === "installment" ? "Installment" : "Plot buy"
}

export function AdminPropertiesPage() {
  const [rows, setRows] = useState<Property[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterChannel, setFilterChannel] = useState<string>("all")
  const [filterListing, setFilterListing] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [editPropertyId, setEditPropertyId] = useState<number | null>(null)
  const { showToast } = useToast()

  const reload = useCallback(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    setLoading(true)
    getProperties({ pageSize: 200, token })
      .then((data) => {
        setRows(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        const message = error instanceof Error ? error.message : "Failed to load properties."
        showToast(message, "error")
      })
  }, [showToast])

  useEffect(() => {
    reload()
  }, [reload])

  const filtered = useMemo(() => {
    let list = rows
    if (filterStatus !== "all") {
      list = list.filter((p) => p.status === filterStatus)
    }
    if (filterType !== "all") {
      list = list.filter((p) => p.property_type === filterType)
    }
    if (filterChannel !== "all") {
      list = list.filter((p) => p.property_channel === filterChannel)
    }
    if (filterListing === "active") {
      list = list.filter((p) => p.listing_active)
    }
    if (filterListing === "inactive") {
      list = list.filter((p) => !p.listing_active)
    }
    const q = query.trim().toLowerCase()
    if (!q) {
      return list
    }
    return list.filter((p) =>
      [
        p.title,
        p.slug,
        p.location_name,
        p.status,
        p.property_type,
        p.property_channel,
        p.land_sale_mode,
        p.representative_name,
        p.managed_by_name,
        p.listing_active ? "active" : "inactive",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [rows, query, filterStatus, filterType, filterChannel, filterListing])

  async function removePropertyRow(p: Property) {
    if (!window.confirm(`Permanently delete "${p.title}"? This cannot be undone.`)) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      showToast("Please sign in again.", "error")
      return
    }
    try {
      await deleteProperty(p.id, token)
      showToast("Property deleted.", "success")
      reload()
      setPage(1)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Delete failed.", "error")
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Properties & listings</h2>
          <p className="mt-1 text-sm text-slate-400">
            All platform listings in one place — representative-managed, agent-managed, and catalog fields together.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditPropertyId(null)
            setShowPropertyModal(true)
          }}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
        >
          Add property
        </button>
      </div>
      <div className="dashboard-filters-row mt-4">
        <input
          className="dashboard-filter-input min-w-[260px] flex-1"
          placeholder="Search title, location, type, channel, representative, agent, status…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
          <div className="dashboard-filter-group min-w-[120px]">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by listing status"
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v)
                  setPage(1)
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "available", label: "Available" },
                  { value: "booked", label: "Booked" },
                  { value: "sold", label: "Sold" },
                ]}
              />
            </div>
          </div>
          <div className="dashboard-filter-group min-w-[120px]">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Type</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by type"
                value={filterType}
                onValueChange={(v) => {
                  setFilterType(v)
                  setPage(1)
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
          <div className="dashboard-filter-group min-w-[130px]">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Channel</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by channel"
                value={filterChannel}
                onValueChange={(v) => {
                  setFilterChannel(v)
                  setPage(1)
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "plot_buy", label: "Plot buy" },
                  { value: "installment", label: "Installment" },
                ]}
              />
            </div>
          </div>
          <div className="dashboard-filter-group min-w-[130px]">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Catalog</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by listing on/off"
                value={filterListing}
                onValueChange={(v) => {
                  setFilterListing(v)
                  setPage(1)
                }}
                options={[
                  { value: "all", label: "All listings" },
                  { value: "active", label: "On (active)" },
                  { value: "inactive", label: "Off" },
                ]}
              />
            </div>
          </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <TableLoader
            rows={10}
            cols={14}
            colClasses={Array.from({ length: 14 }, () => "min-w-[72px]")}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="min-w-[1200px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="sticky left-0 z-10 bg-[#0f1f35] px-2 py-2.5">Img</th>
                  <th className="px-2 py-2.5">Title</th>
                  <th className="px-2 py-2.5">Type</th>
                  <th className="px-2 py-2.5">Channel</th>
                  <th className="px-2 py-2.5">Sale mode</th>
                  <th className="px-2 py-2.5">Location</th>
                  <th className="px-2 py-2.5">Status</th>
                  <th className="px-2 py-2.5">Listing</th>
                  <th className="px-2 py-2.5">Blocks</th>
                  <th className="px-2 py-2.5">Price / block</th>
                  <th className="px-2 py-2.5">Shares</th>
                  <th className="px-2 py-2.5">Share price</th>
                  <th className="px-2 py-2.5">Representative</th>
                  <th className="px-2 py-2.5">Managed by</th>
                  <th className="px-2 py-2.5">ROI %</th>
                  <th className={stickyActionsThAdminClass}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {pageRows.map((p) => (
                  <tr key={p.id} className="group border-b border-white/5 hover:bg-white/5">
                    <td className="sticky left-0 z-10 bg-slate-900/95 px-2 py-2 group-hover:bg-white/5">
                      {p.top_view_image ? (
                        <img src={p.top_view_image} alt="" className="h-9 w-12 rounded object-cover" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-2 py-2 font-medium text-white" title={p.title}>
                      {p.title}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 capitalize">{p.property_type}</td>
                    <td className="whitespace-nowrap px-2 py-2">{channelLabel(p.property_channel)}</td>
                    <td className="max-w-[120px] truncate px-2 py-2 capitalize text-slate-400">
                      {p.land_sale_mode.replace(/_/g, " ")}
                    </td>
                    <td className="max-w-[140px] truncate px-2 py-2" title={p.location_name}>
                      {p.location_name}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 capitalize">{p.status}</td>
                    <td className="whitespace-nowrap px-2 py-2">
                      {p.listing_active ? (
                        <span className="text-emerald-400">Active</span>
                      ) : (
                        <span className="text-slate-500">Off</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-300">
                      {p.available_blocks}/{p.total_blocks}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums">{moneyCell(p.price_per_block)}</td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-300">
                      {p.total_shares != null
                        ? `${p.available_shares ?? 0}/${p.total_shares}`
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums">{moneyCell(p.share_price)}</td>
                    <td className="max-w-[100px] truncate px-2 py-2 text-slate-400" title={p.representative_name ?? ""}>
                      {p.representative_name ?? (p.representative != null ? `#${p.representative}` : "—")}
                    </td>
                    <td className="max-w-[100px] truncate px-2 py-2 text-slate-400" title={p.managed_by_name ?? ""}>
                      {p.managed_by_name ?? (p.managed_by != null ? `#${p.managed_by}` : "—")}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-slate-400">
                      {p.expected_profit_percent != null && p.expected_profit_percent !== ""
                        ? `${p.expected_profit_percent}%`
                        : "—"}
                    </td>
                    <td className={stickyActionsTdAdminClass}>
                      <div className={actionsButtonRowClass}>
                        <TableActionIconButton
                          icon={faPenToSquare}
                          label="Edit property"
                          tone="neutral"
                          onClick={() => {
                            setEditPropertyId(p.id)
                            setShowPropertyModal(true)
                          }}
                        />
                        <TableActionIconButton
                          icon={faTrash}
                          label="Delete property"
                          tone="danger"
                          onClick={() => void removePropertyRow(p)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DashboardTablePagination
        className="mt-4 text-sm"
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalItems={filtered.length}
        onPageChange={setPage}
      />

      <PropertyEditModal
        open={showPropertyModal}
        propertyId={editPropertyId}
        variant="admin"
        onClose={() => {
          setShowPropertyModal(false)
          setEditPropertyId(null)
        }}
        onSaved={() => {
          reload()
          setPage(1)
        }}
      />
    </section>
  )
}
