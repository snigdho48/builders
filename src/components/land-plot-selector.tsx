import { useEffect, useMemo, useState } from "react"

import { PlotMap, type PlotMapLayer } from "@/components/plot-map"
import { listPlotsByProperty } from "@/services/api"
import type { LandPlot, Property } from "@/types/domain"

export type PlotOption = LandPlot

type LandPlotSelectorProps = {
  property: Property
  value: PlotOption | null
  onChange: (plot: PlotOption) => void
}

export function LandPlotSelector({ property, value, onChange }: LandPlotSelectorProps) {
  const [plots, setPlots] = useState<PlotOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCode, setSearchCode] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const center = useMemo<[number, number]>(
    () => [Number(property.latitude ?? "") || 23.8103, Number(property.longitude ?? "") || 90.4125],
    [property.latitude, property.longitude],
  )
  const visiblePlots = useMemo(
    () =>
      plots.filter((p) => {
        if (availableOnly && p.status !== "available") return false
        if (!searchCode.trim()) return true
        return p.plot_id.toLowerCase().includes(searchCode.trim().toLowerCase())
      }),
    [availableOnly, plots, searchCode],
  )
  const selected = value ? plots.find((p) => p.id === value.id) ?? value : null

  const plotLayers = useMemo<PlotMapLayer[]>(() => {
    return visiblePlots.map((plot) => {
      const isSelected = value?.id === plot.id
      const base = plot.status === "available" ? "#22c55e" : plot.status === "booked" ? "#f59e0b" : "#ef4444"
      return {
        id: String(plot.id),
        path: plot.coordinates,
        strokeColor: isSelected ? "#0b1f44" : base,
        fillColor: base,
        fillOpacity: isSelected ? 0.8 : 0.55,
        strokeWeight: isSelected ? 3 : 2,
        hoverFillOpacity: 0.85,
        onClick: plot.status === "available" ? () => onChange(plot) : undefined,
        popupHtml: `<div style="font-size:12px;line-height:1.45">
          <strong>Plot ${plot.plot_id}</strong><br/>
          Area: ${plot.area_sqft} sqft<br/>
          Price: ৳${Number(plot.price).toLocaleString()}<br/>
          Status: ${plot.status}<br/>
          ${
            plot.status === "available"
              ? '<span style="display:inline-block;margin-top:4px;background:#0b1f44;color:white;padding:2px 8px;border-radius:8px">Select / Book now</span>'
              : ""
          }
        </div>`,
        centerLabel: plot.plot_id,
      }
    })
  }, [visiblePlots, value?.id, onChange])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void listPlotsByProperty({ propertyId: property.id })
      .then((rows) => {
        if (cancelled) return
        setPlots(rows)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setPlots([])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [property.id])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            Available
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
            Booked
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
            Sold
          </span>
        </div>
        <label className="inline-flex items-center gap-1 text-xs text-slate-600">
          <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
          Show available only
        </label>
      </div>
      <input
        className="mb-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
        placeholder="Search plot code (e.g. P-05)"
        value={searchCode}
        onChange={(e) => setSearchCode(e.target.value)}
      />

      <PlotMap
        center={center}
        zoom={17}
        layers={plotLayers}
        fitToLayers={plotLayers.length > 0}
        invalidateOn={property.id}
        className="h-[360px] w-full overflow-hidden rounded-lg border border-slate-200"
      />
      {loading ? <p className="mt-2 text-xs text-slate-500">Loading plots...</p> : null}
      {!loading && plots.length === 0 ? (
        <p className="mt-2 text-xs text-rose-600">No predefined plots found for this property.</p>
      ) : null}

      {selected ? (
        <p className="mt-2 rounded-md bg-[#0b1f44]/5 px-2 py-1.5 text-xs text-slate-700">
          Selected: <strong>{selected.plot_id}</strong> • {selected.area_sqft} sqft • ৳{Number(selected.price).toLocaleString()}
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Select an available plot from the map to continue booking.</p>
      )}
    </div>
  )
}
