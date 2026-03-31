export type PropertyStatus = "available" | "sold" | "booked"
export type PropertyType = "apartment" | "villa" | "commercial" | "land"
export type InvestmentType = "direct" | "installment" | "fractional"
export type UserRole = "admin" | "investor" | "representative" | "advertiser"

export type Property = {
  id: number
  title: string
  slug: string
  description: string
  property_type: PropertyType
  total_blocks: number
  available_blocks: number
  price_per_block: string
  location_name: string
  latitude: string | null
  longitude: string | null
  video_url: string
  top_view_image: string
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
  blocks_owned: number
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

export type AdvertiserDashboardData = {
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
  property_type: PropertyType
  total_blocks: number
  available_blocks: number
  price_per_block: string
  location_name: string
  latitude?: string | null
  longitude?: string | null
  video_url?: string
  top_view_image?: string
  status?: PropertyStatus
  representative?: number | null
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
}

export type AdvertiserUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  phone: string
  role: "advertiser"
  managed_by: number | null
  date_joined: string
}

export type AdvertiserUpsertPayload = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
  is_active?: boolean
  managed_by?: number | null
}
