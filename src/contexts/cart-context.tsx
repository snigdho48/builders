import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { CartContext } from "@/contexts/use-cart"
import { fetchPropertyFresh } from "@/services/api"
import type { CartLine, Property } from "@/types/domain"

const STORAGE_KEY = "homirx-property-cart"

type AddOptions = {
  blocks?: number
  shares?: number
  investment_type?: "direct" | "installment"
  duration_years?: number
}

function loadStored(): CartLine[] {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as CartLine[]
  } catch {
    return []
  }
}

function persist(items: CartLine[]) {
  if (typeof window === "undefined") {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function toLine(property: Property, options?: AddOptions): CartLine {
  const mode = property.land_sale_mode
  const minShares = Math.max(1, property.min_shares_per_order || 1)

  if (mode === "fractional_share") {
    const shares = Math.max(minShares, options?.shares ?? minShares)
    const cap = property.available_shares ?? 0
    const capped = cap > 0 ? Math.min(shares, cap) : shares
    return {
      propertyId: property.id,
      title: property.title,
      slug: property.slug,
      land_sale_mode: mode,
      top_view_image: property.top_view_image,
      location_name: property.location_name,
      price_per_block: property.price_per_block,
      whole_land_price: property.whole_land_price,
      share_price: property.share_price,
      available_blocks: property.available_blocks,
      available_shares: property.available_shares,
      min_shares_per_order: minShares,
      blocks_owned: 0,
      shares_owned: cap > 0 ? capped : 0,
      investment_type: options?.investment_type ?? "direct",
      duration_years: options?.duration_years ?? 0,
    }
  }

  if (mode === "whole_land") {
    return {
      propertyId: property.id,
      title: property.title,
      slug: property.slug,
      land_sale_mode: mode,
      top_view_image: property.top_view_image,
      location_name: property.location_name,
      price_per_block: property.price_per_block,
      whole_land_price: property.whole_land_price,
      share_price: property.share_price,
      available_blocks: property.available_blocks,
      available_shares: property.available_shares,
      min_shares_per_order: minShares,
      blocks_owned: 1,
      shares_owned: 0,
      investment_type: options?.investment_type ?? "direct",
      duration_years: options?.duration_years ?? 0,
    }
  }

  const blocks = Math.max(1, options?.blocks ?? 1)
  const capped = Math.min(blocks, Math.max(0, property.available_blocks))
  return {
    propertyId: property.id,
    title: property.title,
    slug: property.slug,
    land_sale_mode: "per_block",
    top_view_image: property.top_view_image,
    location_name: property.location_name,
    price_per_block: property.price_per_block,
    whole_land_price: property.whole_land_price,
    share_price: property.share_price,
    available_blocks: property.available_blocks,
    available_shares: property.available_shares,
    min_shares_per_order: minShares,
    blocks_owned: property.available_blocks > 0 ? capped : 0,
    shares_owned: 0,
    investment_type: options?.investment_type ?? "direct",
    duration_years: options?.duration_years ?? 0,
  }
}

function canAddProperty(property: Property): boolean {
  if (property.status === "sold") {
    return false
  }
  if (property.land_sale_mode === "fractional_share") {
    return (property.available_shares ?? 0) >= Math.max(1, property.min_shares_per_order || 1)
  }
  return property.available_blocks >= 1
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(loadStored)

  const commit = useCallback((next: CartLine[]) => {
    setItems(next)
    persist(next)
  }, [])

  const addItem = useCallback((property: Property, options?: AddOptions) => {
    if (!canAddProperty(property)) {
      return
    }
    const incoming = toLine(property, options)
    setItems((current) => {
      const idx = current.findIndex((l) => l.propertyId === property.id)
      let next: CartLine[]
      if (idx === -1) {
        next = [...current, incoming]
      } else {
        const existing = current[idx]
        let nextLine: CartLine = { ...existing, ...incoming }
        if (property.land_sale_mode === "fractional_share") {
          const cap = property.available_shares ?? 0
          const merged = Math.min(cap, existing.shares_owned + incoming.shares_owned)
          nextLine = { ...nextLine, shares_owned: merged }
        } else if (property.land_sale_mode === "per_block") {
          const mergedBlocks = Math.min(
            property.available_blocks,
            existing.blocks_owned + incoming.blocks_owned
          )
          nextLine = { ...nextLine, blocks_owned: mergedBlocks }
        }
        next = [...current]
        next[idx] = nextLine
      }
      persist(next)
      return next
    })
  }, [])

  const updateLine = useCallback(
    (propertyId: number, patch: Partial<Pick<CartLine, "blocks_owned" | "shares_owned">>) => {
      setItems((current) => {
        const next = current.map((line) => {
          if (line.propertyId !== propertyId) {
            return line
          }
          if (line.land_sale_mode === "fractional_share") {
            let shares = patch.shares_owned ?? line.shares_owned
            const minS = Math.max(1, line.min_shares_per_order)
            const cap = line.available_shares ?? 0
            shares = Math.max(minS, cap > 0 ? Math.min(cap, shares) : shares)
            return { ...line, shares_owned: shares }
          }
          let blocks = patch.blocks_owned ?? line.blocks_owned
          blocks = Math.max(1, Math.min(line.available_blocks, blocks))
          return { ...line, blocks_owned: blocks }
        })
        persist(next)
        return next
      })
    },
    []
  )

  const removeItem = useCallback((propertyId: number) => {
    setItems((current) => {
      const next = current.filter((l) => l.propertyId !== propertyId)
      persist(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    commit([])
  }, [commit])

  const syncWithServer = useCallback(async (): Promise<CartLine[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    if (!token) {
      return loadStored()
    }
    const current = loadStored()
    if (current.length === 0) {
      return []
    }
    const next: CartLine[] = []
    for (const line of current) {
      const prop = await fetchPropertyFresh(String(line.propertyId))
      if (!prop || !canAddProperty(prop)) {
        continue
      }
      if (line.land_sale_mode === "fractional_share") {
        const minS = Math.max(1, prop.min_shares_per_order || 1)
        const cap = prop.available_shares ?? 0
        const shares = Math.max(minS, Math.min(cap, line.shares_owned))
        next.push({
          ...line,
          title: prop.title,
          slug: prop.slug,
          top_view_image: prop.top_view_image,
          location_name: prop.location_name,
          price_per_block: prop.price_per_block,
          whole_land_price: prop.whole_land_price,
          share_price: prop.share_price,
          available_blocks: prop.available_blocks,
          available_shares: prop.available_shares,
          min_shares_per_order: minS,
          shares_owned: shares,
        })
      } else if (line.land_sale_mode === "whole_land") {
        if (prop.available_blocks < 1) {
          continue
        }
        next.push({
          ...line,
          title: prop.title,
          slug: prop.slug,
          top_view_image: prop.top_view_image,
          location_name: prop.location_name,
          price_per_block: prop.price_per_block,
          whole_land_price: prop.whole_land_price,
          share_price: prop.share_price,
          available_blocks: prop.available_blocks,
          available_shares: prop.available_shares,
          blocks_owned: 1,
        })
      } else {
        const blocks = Math.min(Math.max(1, line.blocks_owned), prop.available_blocks)
        next.push({
          ...line,
          title: prop.title,
          slug: prop.slug,
          top_view_image: prop.top_view_image,
          location_name: prop.location_name,
          price_per_block: prop.price_per_block,
          whole_land_price: prop.whole_land_price,
          share_price: prop.share_price,
          available_blocks: prop.available_blocks,
          available_shares: prop.available_shares,
          blocks_owned: blocks,
        })
      }
    }
    commit(next)
    return next
  }, [commit])

  useEffect(() => {
    const run = () => {
      if (localStorage.getItem("accessToken")) {
        void syncWithServer()
      }
    }
    window.addEventListener("auth-state-changed", run)
    run()
    return () => window.removeEventListener("auth-state-changed", run)
  }, [syncWithServer])

  const lineSubtotal = useCallback((line: CartLine) => {
    if (line.land_sale_mode === "whole_land") {
      if (line.whole_land_price) {
        return Number.parseFloat(line.whole_land_price) || 0
      }
      const unit = Number.parseFloat(line.price_per_block) || 0
      return unit * Math.max(0, line.available_blocks)
    }
    if (line.land_sale_mode === "fractional_share") {
      const sp = Number.parseFloat(line.share_price || "0") || 0
      return sp * line.shares_owned
    }
    const unit = Number.parseFloat(line.price_per_block) || 0
    return unit * line.blocks_owned
  }, [])

  const cartSubtotal = useMemo(
    () => items.reduce((sum, line) => sum + lineSubtotal(line), 0),
    [items, lineSubtotal]
  )

  const itemCount = items.length
  const totalBlockCount = items.reduce((sum, line) => sum + line.blocks_owned, 0)

  const value = useMemo(
    () => ({
      items,
      itemCount,
      totalBlockCount,
      addItem,
      updateLine,
      removeItem,
      clear,
      lineSubtotal,
      cartSubtotal,
      syncWithServer,
    }),
    [
      items,
      itemCount,
      totalBlockCount,
      addItem,
      updateLine,
      removeItem,
      clear,
      lineSubtotal,
      cartSubtotal,
      syncWithServer,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
