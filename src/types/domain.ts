export type PropertyStatus = "available" | "sold" | "booked"
export type SaleType = "land_buy" | "installment"
export type UserRole = "admin" | "investor" | "agent"

export type PropertyKind = "apartment" | "villa" | "commercial" | "land"
export type PropertyChannel = "plot_buy" | "installment"
export type LandSaleMode = "per_block" | "whole_land" | "fractional_share"

export type FloorPlanItem = {
  title: string
  image_url: string
  description?: string
}

export type ShareInvestmentOption = {
  amount: string
  duration_years: number
}

/** API shape matches legacy builders detail page + land booking platform. */
export type Property = {
  id: number
  title: string
  slug: string
  description: string
  description_secondary: string
  property_type: PropertyKind
  sale_type: SaleType
  property_channel: PropertyChannel
  land_sale_mode: LandSaleMode
  land_price: string
  whole_land_price: string | null
  installment_years: number | null
  total_blocks: number
  available_blocks: number
  price_per_block: string
  share_price: string | null
  total_shares: number | null
  available_shares: number | null
  min_shares_per_order: number
  location_name: string
  latitude: string | null
  longitude: string | null
  video_url: string
  top_view_image: string
  gallery_images: string[]
  tags: string[]
  amenities: string[]
  floor_plans: FloorPlanItem[]
  build_year: number | null
  bedrooms: number | null
  bathrooms: number | null
  flat_label: string
  size_sqft: number | null
  land_area_sqft: number | null
  for_rent: boolean
  for_sale: boolean
  contact_website: string
  rating_average: string | null
  review_count: number
  review_sample_author: string
  review_sample_date: string | null
  review_sample_text: string
  status: PropertyStatus
  listing_active: boolean
  share_investment_options: ShareInvestmentOption[]
  representative: number | null
  representative_name: string | null
  representative_email: string | null
  representative_phone: string | null
  managed_by: number | null
  managed_by_name: string | null
  assigned_agent: number | null
  assigned_agent_name: string | null
  created_at?: string
  updated_at?: string
}

export type LandBookingPlanType = "one_percent_installment" | "fifty_percent_installment"
export type LandBookingStatus = "pending" | "accepted" | "rejected"

export type LandBooking = {
  id: number
  property: number
  property_title?: string
  property_sale_type?: SaleType
  investor: number
  investor_username?: string
  plan_type: LandBookingPlanType
  full_name: string
  email: string
  phone: string
  contact_notes: string
  referral_code_used: string
  selected_plot_code?: string
  selected_plot_area_sqft?: number | null
  selected_plot_price?: string | null
  status: LandBookingStatus
  reviewed_by: number | null
  reviewed_by_username?: string | null
  reviewed_at: string | null
  rejection_reason: string
  created_at: string
  updated_at: string
}

export type InstallmentLedgerStatus = "unpaid" | "paid" | "overdue" | "partial"
export type InstallmentNotification = "paid" | "overdue" | "due_soon" | "upcoming"

export type InstallmentLedgerRow = {
  id: number
  booking_id: number
  property_title: string
  plan_type: LandBookingPlanType
  installment_no: number
  due_date: string
  amount_due: string
  amount_paid: string
  status: InstallmentLedgerStatus
  paid_at: string | null
  notification: InstallmentNotification
  reminder_sent_at: string | null
  reminder_note: string
  payment_reference: string
  created_at: string
  updated_at: string
}

export type InvestorKycStatus = "pending" | "approved" | "rejected"

export type MeResponse = {
  id: number
  username: string
  email: string
  phone: string
  role: UserRole | string
  referral_code: string
  referral_link: string
  referral_commission_percent: string
  first_name: string
  last_name: string
  profile_photo: string
  kyc_status: InvestorKycStatus
  kyc_verified_at: string
  /** ISO datetime when the investor last submitted an in-app KYC request. */
  kyc_requested_at: string
  /** Optional message the investor sent with their KYC request. */
  kyc_investor_notes: string
}

export type ApiEnvelope<T> = {
  success: boolean
  data: T
  error?: { message?: string; details?: unknown }
  message?: string
  pagination?: {
    page: number
    page_size: number
    count: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export type AdminDashboardData = {
  total_users: number
  total_properties: number
  total_bookings: number
  pending_bookings: number
}

export type AgentDashboardData = {
  managed_properties: number
  pending_bookings: number
}

export type InvestorDashboardData = {
  my_pending_bookings: number
  my_accepted_bookings: number
  my_rejected_bookings: number
  kyc_status: InvestorKycStatus
  kyc_requested_at: string
}

export type PropertyUpsertPayload = Partial<{
  title: string
  slug: string
  description: string
  description_secondary: string
  property_type: PropertyKind
  sale_type: SaleType
  land_price: string
  installment_years: number | null
  location_name: string
  latitude: string | null
  longitude: string | null
  video_url: string
  top_view_image: string
  gallery_images: string[]
  tags: string[]
  amenities: string[]
  floor_plans: FloorPlanItem[]
  build_year: number | null
  bedrooms: number | null
  bathrooms: number | null
  flat_label: string
  land_area_sqft: number | null
  for_rent: boolean
  for_sale: boolean
  contact_website: string
  status: PropertyStatus
  listing_active: boolean
  assigned_agent: number | null
}>

export type LandBookingCreatePayload = {
  property: number
  plan_type: LandBookingPlanType
  full_name: string
  email: string
  phone: string
  contact_notes?: string
  referral_code_used?: string
  selected_plot_code?: string
  selected_plot_area_sqft?: number
  selected_plot_price?: string
}

export type PlotStatus = "available" | "booked" | "sold"

export type LandPlot = {
  id: number
  property_id: number
  plot_id: string
  area_sqft: number
  price: string
  status: PlotStatus
  coordinates: [number, number][]
  created_at: string
  updated_at: string
}

export type RetailInvestor = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  phone: string
  referral_code: string
  date_joined: string
  kyc_status: InvestorKycStatus
  kyc_notes: string
  kyc_verified_at: string | null
  kyc_verified_by_username: string
  kyc_requested_at: string | null
  kyc_investor_notes: string
}

export type AgentUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  phone: string
  role: string
  referral_commission_percent: string
  property_count: number
  date_joined: string
}

export type InvestorUpsertPayload = {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  is_active?: boolean
}

export type AgentUpsertPayload = {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  is_active?: boolean
  referral_commission_percent?: string
}

export type P2PListingStatus = "active" | "sold" | "withdrawn"

export type P2PBidStatus = "pending" | "accepted" | "declined"

export type P2PListing = {
  id: number
  seller_id: number
  title: string
  slug: string
  description: string
  location_name: string
  asking_price_hint: string | null
  land_area_sqft: number | null
  latitude: string | null
  longitude: string | null
  contact_email: string
  contact_phone: string
  features: string[]
  hero_image: string
  gallery_images: string[]
  status: P2PListingStatus
  bid_count?: number
  created_at: string
  updated_at: string
}

export type P2PListingWritePayload = {
  title: string
  description: string
  location_name: string
  asking_price_hint?: string | null
  land_area_sqft?: number | null
  latitude?: string | null
  longitude?: string | null
  contact_email?: string
  contact_phone?: string
  features?: string[]
  hero_image?: string
  gallery_images?: string[]
  status?: P2PListingStatus
}

export type P2PBidIncoming = {
  id: number
  listing_id: number
  listing_title: string
  buyer_id: number
  buyer_username: string
  buyer_email: string
  buyer_phone: string
  buyer_full_name: string
  bid_price: string
  message: string
  status: P2PBidStatus
  created_at: string
  updated_at: string
}

export type P2PBidSent = {
  id: number
  listing_id: number
  listing_title: string
  bid_price: string
  message: string
  status: P2PBidStatus
  created_at: string
  updated_at: string
}
