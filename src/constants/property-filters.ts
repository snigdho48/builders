import type { SaleType } from "@/types/domain"

export const SALE_TYPE_FILTER_OPTIONS: { value: SaleType | "all"; label: string }[] = [
  { value: "all", label: "All sale types" },
  { value: "land_buy", label: "Land buy" },
  { value: "installment", label: "Installment" },
]
