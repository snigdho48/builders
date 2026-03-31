import { createContext, useContext } from "react"

import type { CartLine, Property } from "@/types/domain"

type AddOptions = {
  blocks?: number
  shares?: number
  investment_type?: "direct" | "installment"
  duration_years?: number
}

export type CartContextValue = {
  items: CartLine[]
  /** Distinct properties in the cart */
  itemCount: number
  /** Sum of blocks across all lines (navbar badge) */
  totalBlockCount: number
  addItem: (property: Property, options?: AddOptions) => void
  updateLine: (
    propertyId: number,
    patch: Partial<Pick<CartLine, "blocks_owned" | "shares_owned">>
  ) => void
  removeItem: (propertyId: number) => void
  clear: () => void
  lineSubtotal: (line: CartLine) => number
  cartSubtotal: number
  /** Re-fetch each line from the API when logged in; drops unavailable rows and caps blocks. Returns the cart used after sync. */
  syncWithServer: () => Promise<CartLine[]>
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider")
  }
  return ctx
}
