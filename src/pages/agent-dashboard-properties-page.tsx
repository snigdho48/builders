import { useCallback, useEffect, useState } from "react"

import { PropertyEditModal } from "@/components/dashboard/property-edit-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { stickyActionsTdClass, stickyActionsThClass } from "@/components/ui/sticky-table-actions"
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { getManagedPropertiesPaged } from "@/services/api"
import type { Property } from "@/types/domain"

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

function labelOrDash(value: string | null | undefined) {
  const v = value?.trim()
  return v ? v : "—"
}

function isInstallmentListing(property: Property): boolean {
  return property.property_channel === "installment" || property.land_sale_mode === "fractional_share"
}

function inventoryLabel(property: Property): string {
  if (isInstallmentListing(property)) {
    const total = property.total_shares ?? 0
    const left = property.available_shares ?? 0
    if (total > 0) return `${left}/${total} shares`
    return `${left} shares`
  }
  return "1/1"
}

export function AgentDashboardPropertiesPage() {
  const [pageSize, setPageSize] = useState(10)
  const [items, setItems] = useState<Property[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterChannel, setFilterChannel] = useState<string>("all")
  const { showToast } = useToast()

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const { items: next, pagination } = await getManagedPropertiesPaged(token, {
        page,
        pageSize,
        status: filterStatus,
        propertyType: filterType,
        propertyChannel: filterChannel,
        search: debouncedSearch || undefined,
      })
      const sorted = [...next].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      setItems(sorted)
      if (pagination?.total_pages) setTotalPages(pagination.total_pages)
      else setTotalPages(Math.max(1, Math.ceil(next.length / pageSize)))
      if (typeof pagination?.count === "number") setTotalCount(pagination.count)
      else setTotalCount(null)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearch, filterStatus, filterType, filterChannel])

  useEffect(() => {
    load().catch((error) => {
      setLoading(false)
      const message = error instanceof Error ? error.message : "Failed to load properties."
      showToast(message, "error")
    })
  }, [load, showToast])

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Assigned properties</h2>
          <p className="mt-1 text-sm text-slate-400">
            Search and filters apply to your assigned listings. Use Edit in the right column.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <div className="flex min-w-[140px] items-center gap-2">
            <span className="shrink-0 text-slate-500">Rows</span>
            <div className="rounded-md border border-white/10 bg-[#152a45]/95 px-2 py-0.5">
              <CompactFormSelect
                ariaLabel="Rows per page"
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPage(1)
                }}
                options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: `${n} / page` }))}
              />
            </div>
          </div>
          <span>Total: {totalCount ?? items.length}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <input
          className="dashboard-filter-input w-full max-w-md"
          placeholder="Search title or location…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
        />
        <div className="dashboard-filters-row">
          <div className="dashboard-filter-group min-w-[120px]">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
            <div className="dashboard-filter-select-shell">
              <CompactFormSelect
                ariaLabel="Filter by status"
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v)
                  setPage(1)
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
                  { value: "all", label: "All channels" },
                  { value: "plot_buy", label: "Plot buy" },
                  { value: "installment", label: "Installment" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <TableLoader rows={8} cols={7} colClasses={["w-[28%]", "w-[10%]", "w-[10%]", "w-[12%]", "w-[14%]", "w-[12%]", "w-[14%]"]} />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-300">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2 text-right">Inventory</th>
                <th className={stickyActionsThClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-slate-300" colSpan={7}>
                    No properties match your filters.
                  </td>
                </tr>
              ) : (
                items.map((property) => (
                  <tr key={property.id} className="group border-b border-white/10 text-slate-100">
                    <td className="px-3 py-3 font-medium">{property.title}</td>
                    <td className="px-3 py-3 capitalize text-slate-300">{property.property_type}</td>
                    <td className="px-3 py-3 capitalize text-slate-300">{property.status}</td>
                    <td className="px-3 py-3 capitalize text-slate-300">
                      {property.property_channel?.replace("_", " ") ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-slate-300">{labelOrDash(property.location_name)}</td>
                    <td className="px-3 py-3 text-right text-slate-300">{inventoryLabel(property)}</td>
                    <td className={stickyActionsTdClass}>
                      <TableActionIconButton
                        icon={faPenToSquare}
                        label="Edit property"
                        tone="neutral"
                        onClick={() => setSelectedId(property.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <DashboardTablePagination
        className="mt-4 text-sm"
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalCount ?? items.length}
        onPageChange={setPage}
      />

      <PropertyEditModal
        open={selectedId != null}
        propertyId={selectedId}
        variant="agent"
        onClose={() => setSelectedId(null)}
        onSaved={() => void load()}
      />
    </section>
  )
}
