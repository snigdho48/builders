import { useEffect, useMemo, useRef, useState } from "react"
import L, { type Layer } from "leaflet"

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
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void listPlotsByProperty({ propertyId: property.id }).then((rows) => {
      if (cancelled) return
      setPlots(rows)
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setPlots([])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [property.id])

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return
    const map = L.map(mapDivRef.current).setView(center, 17)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)
    mapRef.current = map
    layerGroupRef.current = L.layerGroup().addTo(map)
    return () => {
      map.remove()
      mapRef.current = null
      layerGroupRef.current = null
    }
  }, [center])

  useEffect(() => {
    const map = mapRef.current
    const group = layerGroupRef.current
    if (!map || !group) return
    group.clearLayers()

    const bounds = L.latLngBounds([])
    const interactiveLayers: Layer[] = []

    visiblePlots.forEach((plot) => {
      const latlngs = plot.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
      const isSelected = value?.id === plot.id
      const base = plot.status === "available" ? "#22c55e" : plot.status === "booked" ? "#f59e0b" : "#ef4444"
      const polygon = L.polygon(latlngs, {
        color: isSelected ? "#0b1f44" : base,
        weight: isSelected ? 3 : 2,
        fillColor: base,
        fillOpacity: isSelected ? 0.8 : 0.55,
      }).addTo(group)

      polygon.bindTooltip(plot.plot_id, { permanent: map.getZoom() >= 17, direction: "center", opacity: 0.85 })
      polygon.bindPopup(
        `<div style="font-size:12px;line-height:1.45">
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
      )

      polygon.on("mouseover", () => polygon.setStyle({ fillOpacity: 0.85 }))
      polygon.on("mouseout", () => polygon.setStyle({ fillOpacity: isSelected ? 0.8 : 0.55 }))
      polygon.on("click", () => {
        if (plot.status === "available") onChange(plot)
      })

      bounds.extend(L.latLngBounds(latlngs))
      interactiveLayers.push(polygon)
    })

    if (interactiveLayers.length > 0) map.fitBounds(bounds.pad(0.2))

    const onZoom = () => {
      interactiveLayers.forEach((layer) => {
        const polygon = layer as L.Polygon
        const tooltip = polygon.getTooltip()
        if (tooltip) {
          if (map.getZoom() >= 17) polygon.openTooltip()
          else polygon.closeTooltip()
        }
      })
    }
    map.on("zoomend", onZoom)
    return () => {
      map.off("zoomend", onZoom)
    }
  }, [center, onChange, value?.id, visiblePlots])

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

      <div ref={mapDivRef} className="h-[360px] w-full overflow-hidden rounded-lg border border-slate-200" />
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

