export type PropertyStatus = "available" | "sold" | "booked"
export type PropertyType = "apartment" | "villa" | "commercial" | "land"
export type InvestmentType = "plot_buy" | "installment"
export type UserRole = "admin" | "superadmin" | "investor" | "representative" | "agent"
export type LandSaleMode = "per_block" | "whole_land" | "fractional_share"
export type PropertyChannel = "plot_buy" | "installment"

export type ShareInvestmentOption = {
  amount: string
  duration_years: number
}

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
  investment_type: "plot_buy" | "installment"
  duration_years: number
  /** Set for installment fractional lines that use rep-defined tiers */
  share_tier?: ShareInvestmentOption | null
  /** Snapshot for cart tier picker / sync */
  share_investment_options?: ShareInvestmentOption[]
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
  listing_active: boolean
  expected_profit_percent: string | null
  investment_window_start: string | null
  investment_window_end: string | null
  share_investment_options: ShareInvestmentOption[]
  representative: number | null
  representative_name: string | null
  representative_email: string | null
  representative_phone: string | null
  managed_by: number | null
  managed_by_name: string | null
}

export type InstallmentRecord = {
  id: number
  investment: number
  amount: string
  due_date: string
  status: string
  paid_at: string | null
}

export type PaymentRecord = {
  id: number
  user: number
  investment: number | null
  amount: string
  method: string
  status: string
  transaction_id: string
  created_at: string
}

export type PaymentRequestRecord = {
  id: number
  user: number
  user_username?: string
  user_email?: string
  investment: number | null
  investment_property_title?: string
  amount: string
  method: string
  note: string
  status: "pending" | "approved" | "rejected"
  reviewed_by: number | null
  reviewer_name?: string | null
  review_note: string
  linked_payment: number | null
  created_at?: string
  updated_at?: string
}

export type Investment = {
  id: number
  user?: number
  property: number
  property_title: string
  /** Staff views: investor account */
  investor_username?: string
  investor_email?: string
  /** ISO datetime; used for “expired window” lifecycle */
  property_investment_window_end?: string | null
  type: InvestmentType
  duration_years: number
  roi_percent: string
  total_amount: string
  blocks_owned: number
  shares_owned: number
  start_date: string
  end_date: string | null
  referral_code_used?: string
  created_at?: string
  installments?: InstallmentRecord[]
  payments?: PaymentRecord[]
  /** Maturity payout: term ended, all installments paid on time, no payout yet */
  redemption_eligible?: boolean
  redemption_eligibility_message?: string
}

export type UserNotification = {
  id: number
  kind: string
  title: string
  body: string
  read_at: string | null
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type RedemptionRequest = {
  id: number
  investment: number
  investment_property_title?: string
  investor?: number
  investor_username?: string
  status: "pending" | "approved" | "rejected" | "paid"
  principal_amount: string
  profit_amount: string
  total_payout: string
  profit_percent_used: string
  notes?: string
  rejection_reason?: string
  reviewed_by?: number | null
  created_at?: string
  updated_at?: string
}

/** Query params for `GET /investments/` (list + order_history). */
export type InvestmentListFilters = {
  search?: string
  investmentType?: InvestmentType | "all"
  /** Positions: running (open), due (installment due/overdue), expired (listing window ended), complete (closed). */
  lifecycle?: "all" | "running" | "due" | "expired" | "complete"
  pageSize?: number
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

export type CheckoutRequestStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled"

export type InvestmentCheckoutRequest = {
  id: number
  investor: number
  investor_username?: string
  investor_email?: string
  property: number
  property_title?: string
  property_listing_active?: boolean
  property_channel?: PropertyChannel
  property_investment_window_start?: string | null
  property_investment_window_end?: string | null
  status: CheckoutRequestStatus
  agent_approved: boolean
  representative_approved: boolean
  rejected_reason: string
  investment_type: InvestmentType
  duration_years: number
  blocks_owned: number
  shares_owned: number
  referral_code_used?: string
  created_at?: string
  updated_at?: string
}

/** Query params for `GET /investment-checkout-requests/` */
export type InvestmentCheckoutListFilters = {
  search?: string
  status?: CheckoutRequestStatus | "all"
  investmentType?: InvestmentType | "all"
  /** Property investment window vs now: running | expired | upcoming | no_window */
  window?: "all" | "running" | "expired" | "upcoming" | "no_window"
  listingActive?: "all" | "true" | "false"
  propertyChannel?: PropertyChannel | "all"
  pageSize?: number
}

export type CreateInvestmentCheckoutPayload = {
  property: number
  investment_type: InvestmentType
  duration_years: number
  blocks_owned?: number
  shares_owned?: number
  referral_code_used?: string
}

export type KycFieldChoice = { value: string; label: string }

export type KycFieldDefinition = {
  id: number
  field_key: string
  label: string
  input_type: string
  validation_type: string
  validation_config: Record<string, unknown>
  required: boolean
  /** When false, hidden from investors and skipped in validation. */
  enabled: boolean
  sort_order: number
  choices: KycFieldChoice[]
}

export type KycTemplate = {
  id: number
  name: string
  slug: string
  description: string
  is_active: boolean
  required_for_checkout: boolean
  fields: KycFieldDefinition[]
  created_at?: string
  updated_at?: string
}

export type UserKycSubmission = {
  id: number
  user: number
  user_username?: string
  user_email?: string
  template: number
  template_name?: string
  status: "draft" | "pending_review" | "approved" | "rejected"
  responses: Record<string, unknown>
  reviewed_by: number | null
  reviewer_name?: string | null
  review_note: string
  created_at?: string
  updated_at?: string
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
  /** False until all active required KYC templates have an approved submission */
  kyc_checkout_ready: boolean
  /** Templates still needed for checkout (from server) */
  kyc_missing_templates: { id: number; name: string; slug: string }[]
}

export type RepresentativeDashboardData = {
  total_referred_users: number
  referred_investments: number
  referred_investment_amount: string
  earned_commission: string
  managed_properties: number
  plot_buy_requests: number
  installment_requests: number
}

export type AgentDashboardData = {
  managed_by_name: string
  managed_properties: number
  plot_buy_requests: number
  installment_requests: number
}

export type AdminDashboardData = {
  total_users: number
  total_properties: number
  total_investments: number
  total_payments: number
  pending_payments: number
  total_referral_commission: string
  /** Platform-wide referral / rep-listing stats */
  rep_metrics: RepresentativeDashboardData
  /** Platform-wide agent-assignment stats */
  agent_metrics: AgentDashboardData
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
  listing_active?: boolean
  expected_profit_percent?: string | null
  investment_window_start?: string | null
  investment_window_end?: string | null
  share_investment_options?: ShareInvestmentOption[]
  representative?: number | null
  managed_by?: number | null
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

export type InvestorUpsertPayload = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
  is_active?: boolean
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
  /** Listings where this user is the assigned representative */
  property_count?: number
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
  /** Properties assigned to this agent (managed_by) */
  property_count?: number
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
