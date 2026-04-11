import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router-dom"

import { RevealOnView } from "@/components/motion/reveal-on-view"
import { PropertyCard } from "@/components/property-card"
import { SALE_TYPE_FILTER_OPTIONS } from "@/constants/property-filters"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { GridLoader } from "@/components/ui/grid-loader"
import { useLanguage } from "@/i18n/language-context"
import { getPropertiesPaged } from "@/services/api"
import type { Property, SaleType } from "@/types/domain"

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const

const FILTER_LABEL = "text-[11px] font-medium uppercase tracking-wide text-slate-500"
const FILTER_SHELL =
  "flex h-10 w-full min-w-0 items-center rounded-lg border border-white/10 bg-slate-950/50 px-3 shadow-sm"
const FILTER_INPUT =
  "h-full w-full min-w-0 border-0 bg-transparent py-0 text-sm text-white outline-none placeholder:text-slate-500"
const SELECT_CLASS = "h-10 w-full text-sm leading-10"

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className={FILTER_LABEL}>{label}</span>
      {children}
    </div>
  )
}

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.floor(n)
}

function parseSaleTypeParam(raw: string | null): "all" | SaleType {
  if (!raw || raw === "all") return "all"
  return raw === "land_buy" || raw === "installment" ? raw : "all"
}

export function ListingsPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  const saleFilter = parseSaleTypeParam(searchParams.get("sale") ?? searchParams.get("channel"))
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const rawPageSize = parsePositiveInt(searchParams.get("page_size"), 12)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? rawPageSize
    : 12

  const query = searchParams.get("q") ?? ""
  const locationFilter = searchParams.get("location") ?? ""

  const [debouncedQuery, setDebouncedQuery] = useState(() => query)
  const [debouncedLocation, setDebouncedLocation] = useState(() => locationFilter)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 320)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedLocation(locationFilter), 320)
    return () => window.clearTimeout(t)
  }, [locationFilter])

  const updateParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => () => {
      const next = new URLSearchParams(searchParams)
      mutate(next)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const hasActiveFilters = useMemo(() => {
    return query.trim() !== "" || locationFilter.trim() !== "" || saleFilter !== "all"
  }, [query, locationFilter, saleFilter])

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams()
    next.set("page_size", String(pageSize))
    setSearchParams(next, { replace: true })
  }, [pageSize, setSearchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPropertiesPaged({
      page,
      pageSize,
      saleType: saleFilter,
      status: "available",
      search: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
      location: debouncedLocation.trim() ? debouncedLocation.trim() : undefined,
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
  }, [page, pageSize, saleFilter, debouncedQuery, debouncedLocation])

  const footerLabel = useMemo(() => {
    if (totalCount != null) {
      return t("listings.showing", `Showing ${properties.length} of ${totalCount} listings`)
    }
    return t("listings.pageOf", "Page {page} / {totalPages}")
      .replace("{page}", String(page))
      .replace("{totalPages}", String(totalPages))
  }, [properties.length, t, totalCount, page, totalPages])

  function patchSearchParams(mutate: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams)
    mutate(params)
    setSearchParams(params, { replace: true })
  }

  return (
    <main className="bg-white py-12 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(3.5rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl min-w-0">
        <RevealOnView className="mb-8 space-y-6" variant="fade-up">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Land</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{t("listings.title", "Explore land listings")}</h1>
            <p className="mt-2 text-sm text-slate-400">{t("listings.subtitle", "Search and filter whole-parcel land: direct buy or installment plans.")}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-4 shadow-lg sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <FilterField label={t("listings.search", "Search")}>
                <div className={FILTER_SHELL}>
                  <input
                    className={FILTER_INPUT}
                    placeholder={t("listings.searchPlaceholder", "Title or location")}
                    value={query}
                    onChange={(e) => {
                      patchSearchParams((p) => {
                        const v = e.target.value
                        if (v.trim()) p.set("q", v)
                        else p.delete("q")
                        p.delete("page")
                      })
                    }}
                    autoComplete="off"
                    aria-label="Search listings"
                  />
                </div>
              </FilterField>

              <FilterField label={t("listings.location", "Location")}>
                <div className={FILTER_SHELL}>
                  <input
                    className={FILTER_INPUT}
                    placeholder={t("listings.locationPlaceholder", "Area / district")}
                    value={locationFilter}
                    onChange={(e) => {
                      patchSearchParams((p) => {
                        const v = e.target.value
                        if (v.trim()) p.set("location", v)
                        else p.delete("location")
                        p.delete("page")
                      })
                    }}
                    autoComplete="off"
                    aria-label="Filter by location"
                  />
                </div>
              </FilterField>

              <FilterField label={t("listings.saleType", "Sale type")}>
                <div className={FILTER_SHELL}>
                  <CompactFormSelect
                    className={SELECT_CLASS}
                    ariaLabel="Sale type"
                    value={saleFilter}
                    onValueChange={(v) => {
                      patchSearchParams((p) => {
                        const next = parseSaleTypeParam(v)
                        if (next === "all") p.delete("sale")
                        else p.set("sale", next)
                        p.delete("page")
                      })
                    }}
                    options={SALE_TYPE_FILTER_OPTIONS}
                  />
                </div>
              </FilterField>

              <FilterField label={t("listings.perPage", "Per page")}>
                <div className={FILTER_SHELL}>
                  <CompactFormSelect
                    className={SELECT_CLASS}
                    ariaLabel="Results per page"
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      patchSearchParams((p) => {
                        p.set("page_size", v)
                        p.delete("page")
                      })
                    }}
                    options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: `${n}` }))}
                  />
                </div>
              </FilterField>
            </div>

            {hasActiveFilters ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  {t("listings.clearFilters", "Clear filters")}
                </button>
                <span className="text-xs text-slate-500">Search matches title or location; location also filters the area field.</span>
              </div>
            ) : null}
          </div>
        </RevealOnView>

        {loading ? (
          <GridLoader count={pageSize >= 24 ? 6 : 9} />
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="min-w-0">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}

        {!loading && properties.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400">{t("listings.noMatch", "No listings match your filters.")}</p>
        ) : null}

        {!loading && totalPages > 1 ? (
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span className="text-center sm:text-left">{footerLabel}</span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded-lg border border-white/20 px-4 py-2 font-medium disabled:opacity-40"
                onClick={updateParams((p) => p.set("page", String(Math.max(1, page - 1))))}
              >
                {t("listings.previous", "Previous")}
              </button>
              <span className="min-w-28 text-center tabular-nums">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                className="rounded-lg border border-white/20 px-4 py-2 font-medium disabled:opacity-40"
                onClick={updateParams((p) => p.set("page", String(Math.min(totalPages, page + 1))))}
              >
                {t("listings.next", "Next")}
              </button>
            </div>
          </div>
        ) : !loading && totalPages <= 1 && totalCount != null && totalCount > 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">{footerLabel}</p>
        ) : null}
      </div>
    </main>
  )
}
