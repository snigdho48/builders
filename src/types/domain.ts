export type PropertyStatus = "available" | "sold" | "booked"
export type PropertyType = "apartment" | "villa" | "commercial" | "land"
export type InvestmentType = "direct" | "installment" | "fractional"
export type UserRole = "admin" | "superadmin" | "investor" | "representative" | "agent"
export type LandSaleMode = "per_block" | "whole_land" | "fractional_share"
export type PropertyChannel = "direct_buy" | "installment"

export type FloorPlanItem = {
  title: string
  image_url: string
  description?: string
}

export type CartLine = {
  propertyId: number
  title: string
  slug: string
  land_sale_mode: LandSaleMode
  top_view_image: string
  location_name: string
  price_per_block: string
  whole_land_price: string | null
  share_price: string | null
  available_blocks: number
  available_shares: number | null
  min_shares_per_order: number
  blocks_owned: number
  shares_owned: number
  investment_type: "direct" | "installment"
  duration_years: number
}

export type Property = {
  id: number
  title: string
  slug: string
  description: string
  description_secondary: string
  property_type: PropertyType
  property_channel: PropertyChannel
  land_sale_mode: LandSaleMode
  total_blocks: number
  available_blocks: number
  price_per_block: string
  whole_land_price: string | null
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
  amenities: string[]
  tags: string[]
  floor_plans: FloorPlanItem[]
  build_year: number | null
  bedrooms: number | null
  bathrooms: number | null
  flat_label: string
  size_sqft: number | null
  for_rent: boolean
  for_sale: boolean
  contact_website: string
  rating_average: string | null
  review_count: number
  review_sample_author: string
  review_sample_date: string | null
  review_sample_text: string
  status: PropertyStatus
  representative: number | null
  representative_name: string | null
  representative_email: string | null
  representative_phone: string | null
}

export type Investment = {
  id: number
  property: number
  property_title: string
  type: InvestmentType
  duration_years: number
  roi_percent: string
  total_amount: string
  blocks_owned: number
  shares_owned: number
  start_date: string
  end_date: string | null
}

export type DashboardData = {
  total_investment: string
  active_investments: number
  total_roi: string
  paid_installments: number
  remaining_installments: number
  referral_earnings: string
  recent_investments: Investment[]
}

export type CreateInvestmentPayload = {
  property: number
  type: InvestmentType
  duration_years: number
  blocks_owned?: number
  shares_owned?: number
  referral_code_used?: string
}

export type MeResponse = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: UserRole
  referral_code: string
  referral_link: string
  referral_commission_percent: string
  profile_photo: string
}

export type AdminDashboardData = {
  total_users: number
  total_properties: number
  total_investments: number
  total_payments: number
  pending_payments: number
  total_referral_commission: string
}

export type RepresentativeDashboardData = {
  total_referred_users: number
  referred_investments: number
  referred_investment_amount: string
  earned_commission: string
  managed_properties: number
  direct_buy_requests: number
  installment_requests: number
}

export type AgentDashboardData = {
  managed_by_name: string
  managed_properties: number
  direct_buy_requests: number
  installment_requests: number
}

export type ApiErrorShape = {
  code: number
  message: string
  details?: unknown
}

export type ApiEnvelope<T> = {
  success: boolean
  error: ApiErrorShape | null
  data: T
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

export type PropertyUpsertPayload = {
  title: string
  slug: string
  description: string
  description_secondary?: string
  property_type: PropertyType
  property_channel?: PropertyChannel
  land_sale_mode?: LandSaleMode
  total_blocks: number
  available_blocks: number
  price_per_block: string
  whole_land_price?: string | null
  share_price?: string | null
  total_shares?: number | null
  available_shares?: number | null
  min_shares_per_order?: number
  location_name: string
  latitude?: string | null
  longitude?: string | null
  video_url?: string
  top_view_image?: string
  gallery_images?: string[]
  amenities?: string[]
  tags?: string[]
  floor_plans?: FloorPlanItem[]
  build_year?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  flat_label?: string
  size_sqft?: number | null
  for_rent?: boolean
  for_sale?: boolean
  contact_website?: string
  rating_average?: string | null
  review_count?: number
  review_sample_author?: string
  review_sample_date?: string | null
  review_sample_text?: string
  status?: PropertyStatus
  representative?: number | null
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
}

export type RepresentativeUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  phone: string
  role: "representative"
  referral_commission_percent: string
  date_joined: string
}

export type RepresentativeUpsertPayload = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
  is_active?: boolean
  referral_commission_percent?: string
}

export type AgentUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  phone: string
  role: "agent"
  referral_commission_percent: string
  managed_by: number | null
  date_joined: string
}

export type AgentUpsertPayload = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
  is_active?: boolean
  referral_commission_percent?: string
  managed_by?: number | null
}
