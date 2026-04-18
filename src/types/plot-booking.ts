import type { LandBookingKind, LandBookingPlanType } from "@/types/domain"
import type { PlotOption } from "@/components/land-plot-selector"

/** Pass via `navigate(..., { state })` after plot selection. */
export type PlotBookingApplicationLocationState = {
  booking_kind: Extract<LandBookingKind, "plot_buy">
  plan_type: Extract<LandBookingPlanType, "one_percent_installment" | "fifty_percent_installment">
  plot: PlotOption
  /** When admin/agent creates booking from dashboard wizard. */
  investor_id?: number
}

export function isPlotBookingApplicationState(
  x: unknown,
): x is PlotBookingApplicationLocationState {
  if (!x || typeof x !== "object") return false
  const o = x as Record<string, unknown>
  return (
    o.booking_kind === "plot_buy" &&
    (o.plan_type === "one_percent_installment" || o.plan_type === "fifty_percent_installment") &&
    o.plot != null &&
    typeof o.plot === "object"
  )
}
