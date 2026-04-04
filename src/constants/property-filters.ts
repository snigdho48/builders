import type { PropertyChannel, PropertyType } from "@/types/domain"

/**
 * Mirrors Django `Property.PropertyType` — keep in sync with `backend/apps/model/properties.py`.
 */
export const PROPERTY_TYPE_FILTER_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
]

/**
 * Mirrors Django `Property.PropertyChannel`.
 */
export const PROPERTY_CHANNEL_FILTER_OPTIONS: { value: PropertyChannel | "all"; label: string }[] = [
  { value: "all", label: "All channels" },
  { value: "plot_buy", label: "Plot buy" },
  { value: "installment", label: "Installment" },
]
