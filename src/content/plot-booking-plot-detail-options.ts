/** Select options aligned with Booking Form Draft (plot detail / joint sections). */

export const PLOT_CATEGORY_OPTIONS = [
  { value: "", label: "Not specified (optional)" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "lake_view", label: "Lake View" },
  { value: "irregular", label: "Irregular" },
] as const

export const PLOT_POSITION_OPTIONS = [
  { value: "", label: "Not specified (optional)" },
  { value: "regular", label: "Regular" },
  { value: "middle", label: "Middle" },
  { value: "corner", label: "Corner" },
] as const

export const PLOT_FACING_OPTIONS = [
  { value: "", label: "Not specified (optional)" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north_east", label: "North + East" },
  { value: "east_south", label: "East + South" },
  { value: "south_west", label: "South + West" },
  { value: "west_north", label: "West + North" },
] as const
