import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { RevealOnView } from "@/components/motion/reveal-on-view"
import { PropertyCard } from "@/components/property-card"
import { PROPERTY_CHANNEL_FILTER_OPTIONS, PROPERTY_TYPE_FILTER_OPTIONS } from "@/constants/property-filters"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { GridLoader } from "@/components/ui/grid-loader"
import { getPropertiesPaged } from "@/services/api"
import type { Property, PropertyChannel, PropertyType } from "@/types/domain"

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const

/** Matches listings filter row height (slightly taller than default CompactFormSelect). */
const LISTINGS_FILTER_SELECT_CLASS = "h-8 text-xs leading-8"

const ALLOWED_TYPES = new Set<PropertyType>(PROPERTY_TYPE_FILTER_OPTIONS.map((o) => o.value))

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.floor(n)
}

function parsePropertyTypeParam(raw: string | null): "all" | PropertyType {
  if (!raw || raw === "all") return "all"
  return ALLOWED_TYPES.has(raw as PropertyType) ? (raw as PropertyType) : "all"
}

function parseChannelParam(raw: string | null): "all" | PropertyChannel {
  if (!raw || raw === "all") return "all"
  if (raw === "direct_buy") return "plot_buy"
  return raw === "plot_buy" || raw === "installment" ? raw : "all"
}

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  const typeFilter = parsePropertyTypeParam(searchParams.get("type"))
  const channelFilter = parseChannelParam(searchParams.get("channel"))

  const page = parsePositiveInt(searchParams.get("page"), 1)
  const rawPageSize = parsePositiveInt(searchParams.get("page_size"), 12)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? rawPageSize
    : 12

  const query = searchParams.get("q") ?? ""
  const [debouncedQuery, setDebouncedQuery] = useState(() => query)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 320)
    return () => window.clearTimeout(t)
  }, [query])

  const updateParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => () => {
      const next = new URLSearchParams(searchParams)
      mutate(next)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPropertiesPaged({
      page,
      pageSize,
      propertyType: typeFilter,
      propertyChannel: channelFilter,
      status: "available",
      search: debouncedQuery.trim() ? debouncedQuery : undefined,
    })
      .then(({ items, pagination }) => {
        if (cancelled) return
        setProperties(items)
        if (pagination?.total_pages) setTotalPages(Math.max(1, pagination.total_pages))
        else setTotalPages(Math.max(1, Math.ceil(items.length / pageSize)))
        if (typeof pagination?.count === "number") setTotalCount(pagination.count)
        else setTotalCount(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, pageSize, typeFilter, channelFilter, debouncedQuery])

  const footerLabel = useMemo(() => {
    if (totalCount != null) {
      return `Showing ${properties.length} of ${totalCount} listings`
    }
    return `Page ${page} of ${totalPages}`
  }, [properties.length, totalCount, page, totalPages])

  const propertyTypeSelectOptions = useMemo(
    () => [{ value: "all", label: "All property types" }, ...PROPERTY_TYPE_FILTER_OPTIONS],
    []
  )

  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <RevealOnView className="mb-8 space-y-5" variant="fade-up">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Properties</p>
            <h1 className="text-3xl font-semibold">Explore all listings</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Filter by type and sale channel. Only available listings are shown.
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-nowrap items-end gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] sm:gap-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex min-w-[min(100%,12rem)] flex-[1_1_14rem] flex-col gap-1">
              <span className="text-xs text-slate-500">Search</span>
              <div className="flex w-full items-center rounded-md border border-white/10 bg-slate-900/80 px-2 py-1">
                <input
                  className="h-8 min-h-8 w-full min-w-0 border-0 bg-transparent px-1.5 py-0 text-xs leading-8 text-white shadow-none outline-none ring-0 placeholder:text-slate-500 focus:ring-0 focus:ring-offset-0"
                  placeholder="Search by title or location"
                  value={query}
                  onChange={(event) => {
                    const next = event.target.value
                    const params = new URLSearchParams(searchParams)
                    if (next.trim()) params.set("q", next)
                    else params.delete("q")
                    params.delete("page")
                    setSearchParams(params, { replace: true })
                  }}
                  autoComplete="off"
                  aria-label="Search listings by title or location"
                />
              </div>
            </div>
            <div className="flex w-41 shrink-0 flex-col gap-1 sm:w-44">
              <span className="text-xs text-slate-500">Property type</span>
              <div className="rounded-md border border-white/10 bg-slate-900/80 px-2 py-1">
                <CompactFormSelect
                  className={LISTINGS_FILTER_SELECT_CLASS}
                  ariaLabel="Property type"
                  value={typeFilter}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams)
                    if (v && v !== "all") params.set("type", v)
                    else params.delete("type")
                    params.delete("page")
                    setSearchParams(params, { replace: true })
                  }}
                  options={propertyTypeSelectOptions}
                />
              </div>
            </div>
            <div className="flex w-41 shrink-0 flex-col gap-1 sm:w-44">
              <span className="text-xs text-slate-500">Sale channel</span>
              <div className="rounded-md border border-white/10 bg-slate-900/80 px-2 py-1">
                <CompactFormSelect
                  className={LISTINGS_FILTER_SELECT_CLASS}
                  ariaLabel="Sale channel"
                  value={channelFilter}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams)
                    const next = parseChannelParam(v)
                    if (next === "all") params.delete("channel")
                    else params.set("channel", next)
                    params.delete("page")
                    setSearchParams(params, { replace: true })
                  }}
                  options={PROPERTY_CHANNEL_FILTER_OPTIONS}
                />
              </div>
            </div>
            <div className="flex w-21 shrink-0 flex-col gap-1 sm:w-24">
              <span className="text-xs text-slate-500">Per page</span>
              <div className="rounded-md border border-white/10 bg-slate-900/80 px-2 py-1">
                <CompactFormSelect
                  className={LISTINGS_FILTER_SELECT_CLASS}
                  ariaLabel="Listings per page"
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    const params = new URLSearchParams(searchParams)
                    params.set("page_size", v)
                    params.delete("page")
                    setSearchParams(params, { replace: true })
                  }}
                  options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: `${n}` }))}
                />
              </div>
            </div>
          </div>
        </RevealOnView>

        {loading ? (
          <GridLoader count={pageSize >= 24 ? 6 : 9} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!loading && properties.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-400">No properties match your filters.</p>
        ) : null}

        {!loading && totalPages > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
            <span>{footerLabel}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded border border-white/20 px-3 py-1.5 disabled:opacity-40"
                onClick={updateParams((p) => {
                  p.set("page", String(Math.max(1, page - 1)))
                })}
              >
                Previous
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                className="rounded border border-white/20 px-3 py-1.5 disabled:opacity-40"
                onClick={updateParams((p) => {
                  p.set("page", String(Math.min(totalPages, page + 1)))
                })}
              >
                Next
              </button>
            </div>
          </div>
        ) : !loading && totalPages <= 1 && totalCount != null && totalCount > 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">{footerLabel}</p>
        ) : null}
      </div>
    </main>
  )
}
