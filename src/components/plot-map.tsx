import { useCallback, useEffect, useRef, useState } from "react"
import { importLibrary, setOptions } from "@googlemaps/js-api-loader"
import L from "leaflet"

export type PlotMapLayer = {
  id: string
  /** Single ring [lng, lat][] */
  path: [number, number][]
  strokeColor: string
  fillColor: string
  fillOpacity: number
  strokeWeight?: number
  hoverFillOpacity?: number
  onClick?: () => void
  popupHtml?: string
  /** Label drawn at polygon centroid (hidden until zoom ≥ 17) */
  centerLabel?: string
}

export type PlotMapProps = {
  center: [number, number]
  zoom?: number
  layers: PlotMapLayer[]
  fitToLayers?: boolean
  /** Pixel padding when fitting bounds */
  fitPadding?: number
  className?: string
  /** When this value changes (e.g. modal id), the map invalidates size after layout (modals). */
  invalidateOn?: string | number
}

let googleLoadPromise: Promise<void> | null = null

function ensureGoogleMaps(): Promise<void> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  if (!apiKey) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"))
  }
  if (!googleLoadPromise) {
    setOptions({ key: apiKey, v: "weekly" })
    googleLoadPromise = importLibrary("maps").then(() => undefined)
  }
  return googleLoadPromise
}

function ringCentroid(ring: [number, number][]): google.maps.LatLngLiteral {
  if (!ring.length) return { lat: 0, lng: 0 }
  let lat = 0
  let lng = 0
  for (const [lngI, latI] of ring) {
    lat += latI
    lng += lngI
  }
  const n = ring.length
  return { lat: lat / n, lng: lng / n }
}

function clearGoogleOverlays(
  polygons: google.maps.Polygon[],
  markers: google.maps.Marker[],
  zoomListener: google.maps.MapsEventListener | null,
  infoWindow: google.maps.InfoWindow | null,
) {
  if (typeof google !== "undefined" && google.maps) {
    zoomListener?.remove()
    polygons.forEach((p) => {
      google.maps.event.clearInstanceListeners(p)
      p.setMap(null)
    })
    markers.forEach((m) => m.setMap(null))
    infoWindow?.close()
  }
}

type PlotMapGoogleProps = PlotMapProps & {
  onLoadFailed: () => void
}

function PlotMapGoogle({
  center,
  zoom = 16,
  layers,
  fitToLayers = true,
  fitPadding = 40,
  className,
  invalidateOn,
  onLoadFailed,
}: PlotMapGoogleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const polygonsRef = useRef<google.maps.Polygon[]>([])
  const markersRef = useRef<google.maps.Marker[]>([])
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  useEffect(() => {
    return () => {
      clearGoogleOverlays(
        polygonsRef.current,
        markersRef.current,
        zoomListenerRef.current,
        infoWindowRef.current,
      )
      polygonsRef.current = []
      markersRef.current = []
      zoomListenerRef.current = null
      mapRef.current = null
      infoWindowRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    function drawLayers(map: google.maps.Map) {
      clearGoogleOverlays(
        polygonsRef.current,
        markersRef.current,
        zoomListenerRef.current,
        infoWindowRef.current,
      )
      polygonsRef.current = []
      markersRef.current = []
      zoomListenerRef.current = null

      const bounds = new google.maps.LatLngBounds()
      const infoWindow = infoWindowRef.current

      layers.forEach((layer) => {
        const path = layer.path.map(([lng, lat]) => ({ lat, lng }))
        path.forEach((p) => bounds.extend(p))

        const baseFill = layer.fillOpacity
        const hoverFill = layer.hoverFillOpacity ?? Math.min(0.95, baseFill + 0.15)

        const polygon = new google.maps.Polygon({
          paths: path,
          strokeColor: layer.strokeColor,
          fillColor: layer.fillColor,
          fillOpacity: baseFill,
          strokeWeight: layer.strokeWeight ?? 2,
          map,
        })

        polygon.addListener("click", () => {
          if (layer.popupHtml && infoWindow) {
            infoWindow.setContent(layer.popupHtml)
            infoWindow.setPosition(ringCentroid(layer.path))
            infoWindow.open(map)
          }
          layer.onClick?.()
        })

        polygon.addListener("mouseover", () => {
          polygon.setOptions({ fillOpacity: hoverFill })
        })
        polygon.addListener("mouseout", () => {
          polygon.setOptions({ fillOpacity: baseFill })
        })

        polygonsRef.current.push(polygon)

        if (layer.centerLabel) {
          const cen = ringCentroid(layer.path)
          const marker = new google.maps.Marker({
            position: cen,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 0,
            },
            label: {
              text: layer.centerLabel,
              color: "#0f172a",
              fontSize: "11px",
              fontWeight: "600",
            },
            zIndex: 50,
          })
          markersRef.current.push(marker)
        }
      })

      const syncLabels = () => {
        const z = map.getZoom() ?? zoom
        const show = z >= 17
        markersRef.current.forEach((m) => m.setVisible(show))
      }
      syncLabels()
      zoomListenerRef.current = map.addListener("zoom_changed", syncLabels)

      if (fitToLayers && layers.length > 0 && !bounds.isEmpty()) {
        map.fitBounds(bounds, fitPadding)
      } else {
        map.setCenter({ lat: center[0], lng: center[1] })
        map.setZoom(zoom)
      }
    }

    void ensureGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(containerRef.current, {
            center: { lat: center[0], lng: center[1] },
            zoom,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          })
          infoWindowRef.current = new google.maps.InfoWindow()
        }
        drawLayers(mapRef.current!)
      })
      .catch(() => {
        if (cancelled) return
        onLoadFailed()
      })

    return () => {
      cancelled = true
    }
  }, [layers, center[0], center[1], zoom, fitToLayers, fitPadding, onLoadFailed])

  useEffect(() => {
    const map = mapRef.current
    if (!map || invalidateOn === undefined) return
    const id = window.setTimeout(() => {
      google.maps.event.trigger(map, "resize")
      const bounds = new google.maps.LatLngBounds()
      layers.forEach((layer) => {
        layer.path.forEach(([lng, lat]) => bounds.extend({ lat, lng }))
      })
      if (fitToLayers && layers.length > 0 && !bounds.isEmpty()) {
        map.fitBounds(bounds, fitPadding)
      }
    }, 120)
    return () => window.clearTimeout(id)
  }, [invalidateOn, layers, fitToLayers, fitPadding])

  return <div ref={containerRef} className={className} />
}

function PlotMapLeaflet({
  center,
  zoom = 16,
  layers,
  fitToLayers = true,
  fitPadding = 40,
  className,
  invalidateOn,
}: PlotMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const groupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)
    mapRef.current = map
    groupRef.current = L.layerGroup().addTo(map)
    return () => {
      map.remove()
      mapRef.current = null
      groupRef.current = null
    }
  }, [center[0], center[1], zoom])

  useEffect(() => {
    const map = mapRef.current
    const group = groupRef.current
    if (!map || !group) return

    group.clearLayers()
    const bounds = L.latLngBounds([])
    const interactive: L.Polygon[] = []

    layers.forEach((layer) => {
      const latlngs = layer.path.map(([lng, lat]) => [lat, lng] as [number, number])
      const baseFill = layer.fillOpacity
      const hoverFill = layer.hoverFillOpacity ?? Math.min(0.95, baseFill + 0.15)

      const polygon = L.polygon(latlngs, {
        color: layer.strokeColor,
        fillColor: layer.fillColor,
        fillOpacity: baseFill,
        weight: layer.strokeWeight ?? 2,
      }).addTo(group)

      if (layer.popupHtml) {
        polygon.bindPopup(layer.popupHtml)
      }

      polygon.on("click", () => {
        layer.onClick?.()
      })

      polygon.on("mouseover", () => {
        polygon.setStyle({ fillOpacity: hoverFill })
      })
      polygon.on("mouseout", () => {
        polygon.setStyle({ fillOpacity: baseFill })
      })

      if (layer.centerLabel) {
        polygon.bindTooltip(layer.centerLabel, {
          permanent: map.getZoom() >= 17,
          direction: "center",
          opacity: 0.85,
        })
      }

      latlngs.forEach((ll) => bounds.extend(ll))
      interactive.push(polygon)
    })

    const onZoom = () => {
      const z = map.getZoom()
      interactive.forEach((polygon) => {
        const t = polygon.getTooltip()
        if (!t) return
        if (z >= 17) polygon.openTooltip()
        else polygon.closeTooltip()
      })
    }
    map.on("zoomend", onZoom)
    onZoom()

    if (fitToLayers && layers.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [fitPadding, fitPadding], maxZoom: 19 })
    } else {
      map.setView(center, zoom)
    }

    return () => {
      map.off("zoomend", onZoom)
    }
  }, [layers, center, zoom, fitToLayers, fitPadding])

  useEffect(() => {
    const map = mapRef.current
    if (!map || invalidateOn === undefined) return
    const id = window.setTimeout(() => {
      map.invalidateSize()
      const bounds = L.latLngBounds([])
      layers.forEach((layer) => {
        layer.path.forEach(([lng, lat]) => bounds.extend([lat, lng]))
      })
      if (fitToLayers && layers.length > 0 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [fitPadding, fitPadding], maxZoom: 19 })
      }
    }, 120)
    return () => window.clearTimeout(id)
  }, [invalidateOn, layers, fitToLayers, fitPadding])

  return <div ref={containerRef} className={className} />
}

/**
 * Interactive plot map: uses Google Maps when `VITE_GOOGLE_MAPS_API_KEY` is set and loads successfully;
 * otherwise falls back to Leaflet + OpenStreetMap (same behavior as before the Google migration).
 */
export function PlotMap(props: PlotMapProps) {
  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  const [useLeaflet, setUseLeaflet] = useState(!googleKey)

  const onGoogleLoadFailed = useCallback(() => {
    setUseLeaflet(true)
  }, [])

  if (useLeaflet) {
    return <PlotMapLeaflet {...props} />
  }

  return <PlotMapGoogle {...props} onLoadFailed={onGoogleLoadFailed} />
}
