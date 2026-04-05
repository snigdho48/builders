import type {
  AdminDashboardData,
  AgentDashboardData,
  AgentUser,
  ApiEnvelope,
  FloorPlanItem,
  InvestorDashboardData,
  InvestorKycStatus,
  InvestorUpsertPayload,
  LandBooking,
  P2PBidIncoming,
  P2PBidSent,
  P2PListing,
  P2PListingWritePayload,
  LandBookingCreatePayload,
  LandSaleMode,
  MeResponse,
  Property,
  PropertyChannel,
  PropertyUpsertPayload,
  RetailInvestor,
  ShareInvestmentOption,
} from "@/types/domain"

function normalizeDevApiBase(url: string): string {
  if (!import.meta.env.DEV) {
    return url
  }
  return url.replace(/^https:\/\/(127\.0\.0\.1|localhost)/i, "http://$1")
}

const API_BASE = normalizeDevApiBase(import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api")

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  token?: string
  isFormData?: boolean
  skipAuthRefresh?: boolean
  retry?: boolean
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "error" in payload && payload.error && typeof payload.error === "object") {
    const err = payload.error as { message?: string; details?: unknown }
    const d = err.details
    if (d !== undefined && d !== null) {
      if (typeof d === "string") return d
      if (Array.isArray(d) && d.length > 0) return String(d[0])
      if (typeof d === "object") {
        const rec = d as Record<string, unknown>
        const nf = rec.non_field_errors
        if (Array.isArray(nf) && nf.length > 0) return String(nf[0])
        for (const v of Object.values(rec)) {
          if (Array.isArray(v) && v.length > 0) return String(v[0])
          if (typeof v === "string") return v
        }
      }
    }
    if (err.message) return String(err.message)
  }
  return `API request failed (${status})`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const {
    method = "GET",
    body,
    token,
    isFormData = false,
    skipAuthRefresh = false,
    retry = false,
  } = options
  const authToken = token ?? localStorage.getItem("accessToken") ?? undefined

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? (isFormData ? (body as BodyInit) : JSON.stringify(body)) : undefined,
  })

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    !retry &&
    !path.startsWith("/auth/login/") &&
    !path.startsWith("/auth/refresh/")
  ) {
    const freshToken = await refreshAccessToken()
    if (freshToken) {
      return request<T>(path, { ...options, token: freshToken, retry: true })
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, response.status))
  }
  if (!payload) {
    throw new Error("Unexpected empty response")
  }
  if (!payload.success) {
    throw new Error(payload.error?.message ?? "Request failed")
  }
  return payload
}

let refreshPromise: Promise<string | null> | null = null

function redirectToAuthOnSessionExpired() {
  if (typeof window === "undefined") return
  const currentPath = window.location.pathname
  if (currentPath.startsWith("/auth")) return
  window.location.assign("/auth?reason=session-expired")
}

function notifyAuthStateChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("auth-state-changed"))
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refresh = localStorage.getItem("refreshToken")
    if (!refresh) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userId")
      localStorage.removeItem("userUsername")
      notifyAuthStateChanged()
      redirectToAuthOnSessionExpired()
      return null
    }
    try {
      const response = await request<{ access: string; refresh?: string }>("/auth/refresh/", {
        method: "POST",
        body: { refresh },
        skipAuthRefresh: true,
      })
      const access = response.data.access
      localStorage.setItem("accessToken", access)
      if (response.data.refresh) {
        localStorage.setItem("refreshToken", response.data.refresh)
      }
      notifyAuthStateChanged()
      return access
    } catch {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userId")
      localStorage.removeItem("userUsername")
      notifyAuthStateChanged()
      redirectToAuthOnSessionExpired()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function asStringList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
}

function asFloorPlans(v: unknown): FloorPlanItem[] {
  if (!Array.isArray(v)) return []
  const out: FloorPlanItem[] = []
  for (const x of v) {
    if (!x || typeof x !== "object") continue
    const o = x as Record<string, unknown>
    const title = String(o.title ?? "")
    const image_url = String(o.image_url ?? "")
    const description = o.description != null ? String(o.description) : undefined
    out.push({
      title: title || "Plan",
      image_url: image_url || "https://placehold.co/800x400/e2e8f0/64748b?text=Plan",
      ...(description ? { description } : {}),
    })
  }
  return out
}

function asShareTiers(v: unknown): ShareInvestmentOption[] {
  if (!Array.isArray(v)) return []
  return v
    .map((x) => {
      if (!x || typeof x !== "object") return null
      const o = x as Record<string, unknown>
      return {
        amount: String(o.amount ?? "0"),
        duration_years: Number(o.duration_years ?? 0),
      }
    })
    .filter((x): x is ShareInvestmentOption => x != null)
}

function normalizePropertyKind(raw: unknown): Property["property_type"] {
  if (raw === "apartment" || raw === "villa" || raw === "commercial" || raw === "land") return raw
  return "land"
}

function normalizeLandSaleMode(raw: unknown): LandSaleMode {
  if (raw === "per_block" || raw === "whole_land" || raw === "fractional_share") return raw
  return "whole_land"
}

function normalizePropertyChannel(raw: unknown, saleType: string): PropertyChannel {
  if (raw === "installment" || raw === "plot_buy") return raw
  return saleType === "installment" ? "installment" : "plot_buy"
}

export function normalizeProperty(raw: Record<string, unknown>): Property {
  const sale_type: Property["sale_type"] = raw.sale_type === "installment" ? "installment" : "land_buy"
  const land_price = String(raw.land_price ?? "0")
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    description: String(raw.description ?? ""),
    description_secondary: String(raw.description_secondary ?? ""),
    property_type: normalizePropertyKind(raw.property_type),
    sale_type,
    property_channel: normalizePropertyChannel(raw.property_channel, sale_type),
    land_sale_mode: normalizeLandSaleMode(raw.land_sale_mode),
    land_price,
    whole_land_price: raw.whole_land_price != null ? String(raw.whole_land_price) : land_price,
    installment_years: raw.installment_years != null ? Number(raw.installment_years) : null,
    total_blocks: Number(raw.total_blocks ?? 0),
    available_blocks: Number(raw.available_blocks ?? 0),
    price_per_block: String(raw.price_per_block ?? "0"),
    share_price: raw.share_price != null ? String(raw.share_price) : null,
    total_shares: raw.total_shares != null ? Number(raw.total_shares) : null,
    available_shares: raw.available_shares != null ? Number(raw.available_shares) : null,
    min_shares_per_order: Number(raw.min_shares_per_order ?? 1),
    location_name: String(raw.location_name ?? ""),
    latitude: raw.latitude != null ? String(raw.latitude) : null,
    longitude: raw.longitude != null ? String(raw.longitude) : null,
    video_url: String(raw.video_url ?? ""),
    top_view_image: String(raw.top_view_image ?? ""),
    gallery_images: asStringList(raw.gallery_images),
    tags: asStringList(raw.tags),
    amenities: asStringList(raw.amenities),
    floor_plans: asFloorPlans(raw.floor_plans),
    build_year: raw.build_year != null ? Number(raw.build_year) : null,
    bedrooms: raw.bedrooms != null ? Number(raw.bedrooms) : null,
    bathrooms: raw.bathrooms != null ? Number(raw.bathrooms) : null,
    flat_label: String(raw.flat_label ?? ""),
    size_sqft: raw.size_sqft != null ? Number(raw.size_sqft) : null,
    land_area_sqft: raw.land_area_sqft != null ? Number(raw.land_area_sqft) : null,
    for_rent: raw.for_rent === true,
    for_sale: raw.for_sale !== false,
    contact_website: String(raw.contact_website ?? ""),
    rating_average: raw.rating_average != null ? String(raw.rating_average) : null,
    review_count: Number(raw.review_count ?? 0),
    review_sample_author: String(raw.review_sample_author ?? ""),
    review_sample_date: raw.review_sample_date != null ? String(raw.review_sample_date) : null,
    review_sample_text: String(raw.review_sample_text ?? ""),
    status: (raw.status as Property["status"]) ?? "available",
    listing_active: raw.listing_active !== false,
    share_investment_options: asShareTiers(raw.share_investment_options),
    representative: raw.representative != null ? Number(raw.representative) : null,
    representative_name: raw.representative_name != null ? String(raw.representative_name) : null,
    representative_email: raw.representative_email != null ? String(raw.representative_email) : null,
    representative_phone: raw.representative_phone != null ? String(raw.representative_phone) : null,
    managed_by: raw.managed_by != null ? Number(raw.managed_by) : null,
    managed_by_name: raw.managed_by_name != null ? String(raw.managed_by_name) : null,
    assigned_agent: raw.assigned_agent != null ? Number(raw.assigned_agent) : null,
    assigned_agent_name: raw.assigned_agent_name != null ? String(raw.assigned_agent_name) : null,
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  }
}

function normalizeLandBooking(raw: Record<string, unknown>): LandBooking {
  return {
    id: Number(raw.id),
    property: Number(raw.property),
    property_title: raw.property_title != null ? String(raw.property_title) : undefined,
    property_sale_type: raw.property_sale_type === "installment" ? "installment" : "land_buy",
    investor: Number(raw.investor),
    investor_username: raw.investor_username != null ? String(raw.investor_username) : undefined,
    plan_type: raw.plan_type as LandBooking["plan_type"],
    full_name: String(raw.full_name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    contact_notes: String(raw.contact_notes ?? ""),
    referral_code_used: String(raw.referral_code_used ?? ""),
    status: raw.status as LandBooking["status"],
    reviewed_by: raw.reviewed_by != null ? Number(raw.reviewed_by) : null,
    reviewed_by_username: raw.reviewed_by_username != null ? String(raw.reviewed_by_username) : undefined,
    reviewed_at: raw.reviewed_at != null ? String(raw.reviewed_at) : null,
    rejection_reason: String(raw.rejection_reason ?? ""),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

export async function login(username: string, password: string) {
  const res = await request<{ access: string; refresh: string; role: string }>("/auth/login/", {
    method: "POST",
    body: { username, password },
    skipAuthRefresh: true,
  })
  return res.data
}

export async function register(payload: {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  ref?: string
}) {
  const res = await request<{ id: number; username: string }>("/auth/register/", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  })
  return res.data
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await request<MeResponse>("/auth/me/", { token })
  return res.data
}

export async function postKycRequest(token: string, body: { message?: string } = {}): Promise<MeResponse> {
  const res = await request<MeResponse>("/auth/me/kyc-request/", { method: "POST", body, token })
  return res.data
}

export async function updateProfile(formData: FormData, token: string): Promise<MeResponse> {
  const res = await request<MeResponse>("/auth/me/", {
    method: "PATCH",
    body: formData,
    token,
    isFormData: true,
  })
  return res.data
}

export async function getDashboard(token: string): Promise<AdminDashboardData | AgentDashboardData | InvestorDashboardData> {
  const res = await request<AdminDashboardData | AgentDashboardData | InvestorDashboardData>("/dashboard/", { token })
  return res.data
}

type PropertyListParams = {
  page?: number
  pageSize?: number
  saleType?: "land_buy" | "installment" | "all"
  status?: string
  search?: string
  /** Substring match on `location_name` (backend `location` query param). */
  location?: string
  minPrice?: number
  maxPrice?: number
  includeInactive?: boolean
  managedByMe?: boolean
}

export async function getPropertiesPaged(params: PropertyListParams = {}): Promise<{ items: Property[]; pagination: ApiEnvelope<unknown>["pagination"] }> {
  const q = new URLSearchParams()
  if (params.page != null) q.set("page", String(params.page))
  if (params.pageSize != null) q.set("page_size", String(params.pageSize))
  if (params.saleType && params.saleType !== "all") q.set("sale_type", params.saleType)
  if (params.status) q.set("status", params.status)
  if (params.search) q.set("search", params.search)
  if (params.location?.trim()) q.set("location", params.location.trim())
  if (params.minPrice != null && Number.isFinite(params.minPrice) && params.minPrice >= 0) {
    q.set("min_price", String(params.minPrice))
  }
  if (params.maxPrice != null && Number.isFinite(params.maxPrice) && params.maxPrice >= 0) {
    q.set("max_price", String(params.maxPrice))
  }
  if (params.includeInactive) q.set("include_inactive", "1")
  if (params.managedByMe) q.set("managed_by_me", "1")
  const res = await request<unknown[]>(`/properties/?${q.toString()}`)
  const rows = Array.isArray(res.data) ? res.data : []
  return { items: rows.map((r) => normalizeProperty(r as Record<string, unknown>)), pagination: res.pagination }
}

export async function getProperties(): Promise<Property[]> {
  const { items } = await getPropertiesPaged({ pageSize: 200 })
  return items
}

export async function getProperty(id: number): Promise<Property> {
  const res = await request<Record<string, unknown>>(`/properties/${id}/`)
  return normalizeProperty(res.data as Record<string, unknown>)
}

export async function createProperty(body: PropertyUpsertPayload, token: string): Promise<Property> {
  const res = await request<Record<string, unknown>>("/properties/", { method: "POST", body, token })
  return normalizeProperty(res.data as Record<string, unknown>)
}

export async function updateProperty(id: number, body: PropertyUpsertPayload, token: string): Promise<Property> {
  const res = await request<Record<string, unknown>>(`/properties/${id}/`, { method: "PATCH", body, token })
  return normalizeProperty(res.data as Record<string, unknown>)
}

export async function deleteProperty(id: number, token: string): Promise<void> {
  await request(`/properties/${id}/`, { method: "DELETE", token })
}

export async function listLandBookings(token: string): Promise<LandBooking[]> {
  const res = await request<unknown[]>("/land-bookings/", { token })
  const rows = Array.isArray(res.data) ? res.data : []
  return rows.map((r) => normalizeLandBooking(r as Record<string, unknown>))
}

export async function getLandBooking(id: number, token: string): Promise<LandBooking> {
  const res = await request<Record<string, unknown>>(`/land-bookings/${id}/`, { token })
  return normalizeLandBooking(res.data as Record<string, unknown>)
}

export async function createLandBooking(body: LandBookingCreatePayload, token: string): Promise<LandBooking> {
  const res = await request<Record<string, unknown>>("/land-bookings/", { method: "POST", body, token })
  return normalizeLandBooking(res.data as Record<string, unknown>)
}

export async function acceptLandBooking(id: number, token: string): Promise<LandBooking> {
  const res = await request<Record<string, unknown>>(`/land-bookings/${id}/accept/`, { method: "POST", body: {}, token })
  return normalizeLandBooking(res.data as Record<string, unknown>)
}

export async function rejectLandBooking(id: number, token: string, rejection_reason?: string): Promise<LandBooking> {
  const res = await request<Record<string, unknown>>(`/land-bookings/${id}/reject/`, {
    method: "POST",
    body: { rejection_reason: rejection_reason ?? "" },
    token,
  })
  return normalizeLandBooking(res.data as Record<string, unknown>)
}

function normalizeRetailInvestor(raw: Record<string, unknown>): RetailInvestor {
  const ks = raw.kyc_status
  const kyc_status: InvestorKycStatus =
    ks === "approved" || ks === "rejected" || ks === "pending" ? ks : "pending"
  return {
    id: Number(raw.id),
    username: String(raw.username ?? ""),
    email: String(raw.email ?? ""),
    first_name: String(raw.first_name ?? ""),
    last_name: String(raw.last_name ?? ""),
    is_active: Boolean(raw.is_active),
    phone: String(raw.phone ?? ""),
    referral_code: String(raw.referral_code ?? ""),
    date_joined: String(raw.date_joined ?? ""),
    kyc_status,
    kyc_notes: String(raw.kyc_notes ?? ""),
    kyc_verified_at: raw.kyc_verified_at != null ? String(raw.kyc_verified_at) : null,
    kyc_verified_by_username: String(raw.kyc_verified_by_username ?? ""),
    kyc_requested_at: raw.kyc_requested_at != null ? String(raw.kyc_requested_at) : null,
    kyc_investor_notes: String(raw.kyc_investor_notes ?? ""),
  }
}

export async function listRetailInvestors(token: string): Promise<RetailInvestor[]> {
  const res = await request<unknown[]>("/investors/", { token })
  const rows = Array.isArray(res.data) ? res.data : []
  return rows.map((r) => normalizeRetailInvestor(r as Record<string, unknown>))
}

export async function createRetailInvestor(body: InvestorUpsertPayload, token: string): Promise<void> {
  await request("/investors/", { method: "POST", body, token })
}

export async function patchRetailInvestorKyc(
  id: number,
  body: { kyc_status: InvestorKycStatus; kyc_notes?: string },
  token: string,
): Promise<RetailInvestor> {
  const res = await request<Record<string, unknown>>(`/investors/${id}/`, { method: "PATCH", body, token })
  return normalizeRetailInvestor(res.data as Record<string, unknown>)
}

export async function listAgents(token: string): Promise<AgentUser[]> {
  const res = await request<unknown[]>("/agents/", { token })
  const rows = Array.isArray(res.data) ? res.data : []
  return rows as AgentUser[]
}

export async function createAgent(
  token: string,
  body: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
    phone?: string
    is_active?: boolean
    referral_commission_percent?: string
  },
): Promise<AgentUser> {
  const res = await request<Record<string, unknown>>("/agents/", { method: "POST", body, token })
  return res.data as unknown as AgentUser
}

export async function updateAgent(
  token: string,
  id: number,
  body: Partial<{
    email: string
    first_name: string
    last_name: string
    phone: string
    password: string
    is_active: boolean
    referral_commission_percent: string
  }>,
): Promise<AgentUser> {
  const res = await request<Record<string, unknown>>(`/agents/${id}/`, { method: "PATCH", body, token })
  return res.data as unknown as AgentUser
}

export async function deleteAgent(token: string, id: number): Promise<void> {
  await request(`/agents/${id}/`, { method: "DELETE", token })
}

function normalizeP2PListing(raw: Record<string, unknown>): P2PListing {
  const gal = raw.gallery_images
  const gallery_images = Array.isArray(gal) ? gal.filter((x): x is string => typeof x === "string") : []
  const st = raw.status
  const status =
    st === "sold" || st === "withdrawn" || st === "active" ? st : "active"
  return {
    id: Number(raw.id),
    seller_id: Number(raw.seller_id),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    description: String(raw.description ?? ""),
    location_name: String(raw.location_name ?? ""),
    asking_price_hint: raw.asking_price_hint != null ? String(raw.asking_price_hint) : null,
    land_area_sqft: raw.land_area_sqft != null ? Number(raw.land_area_sqft) : null,
    hero_image: String(raw.hero_image ?? ""),
    gallery_images,
    status,
    bid_count: raw.bid_count != null ? Number(raw.bid_count) : undefined,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function normalizeP2PBidIncoming(raw: Record<string, unknown>): P2PBidIncoming {
  const st = raw.status
  const status = st === "accepted" || st === "declined" || st === "pending" ? st : "pending"
  return {
    id: Number(raw.id),
    listing_id: Number(raw.listing_id),
    listing_title: String(raw.listing_title ?? ""),
    buyer_id: Number(raw.buyer_id),
    buyer_username: String(raw.buyer_username ?? ""),
    buyer_email: String(raw.buyer_email ?? ""),
    buyer_phone: String(raw.buyer_phone ?? ""),
    buyer_full_name: String(raw.buyer_full_name ?? ""),
    bid_price: String(raw.bid_price ?? "0"),
    message: String(raw.message ?? ""),
    status,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

function normalizeP2PBidSent(raw: Record<string, unknown>): P2PBidSent {
  const st = raw.status
  const status = st === "accepted" || st === "declined" || st === "pending" ? st : "pending"
  return {
    id: Number(raw.id),
    listing_id: Number(raw.listing_id),
    listing_title: String(raw.listing_title ?? ""),
    bid_price: String(raw.bid_price ?? "0"),
    message: String(raw.message ?? ""),
    status,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  }
}

export async function getP2pListingsPaged(params: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<{ items: P2PListing[]; pagination: ApiEnvelope<unknown>["pagination"] }> {
  const q = new URLSearchParams()
  if (params.page != null) q.set("page", String(params.page))
  if (params.pageSize != null) q.set("page_size", String(params.pageSize))
  if (params.search?.trim()) q.set("search", params.search.trim())
  const res = await request<unknown[]>(`/p2p-listings/?${q.toString()}`)
  const rows = Array.isArray(res.data) ? res.data : []
  return { items: rows.map((r) => normalizeP2PListing(r as Record<string, unknown>)), pagination: res.pagination }
}

export async function getP2pListing(id: number): Promise<P2PListing> {
  const res = await request<Record<string, unknown>>(`/p2p-listings/${id}/`)
  return normalizeP2PListing(res.data as Record<string, unknown>)
}

export async function listMyP2pListings(token: string): Promise<P2PListing[]> {
  const res = await request<unknown[]>("/p2p-listings/?mine=1", { token })
  const rows = Array.isArray(res.data) ? res.data : []
  return rows.map((r) => normalizeP2PListing(r as Record<string, unknown>))
}

export async function createP2pListing(body: P2PListingWritePayload, token: string): Promise<P2PListing> {
  const res = await request<Record<string, unknown>>("/p2p-listings/", { method: "POST", body, token })
  return normalizeP2PListing(res.data as Record<string, unknown>)
}

export async function patchP2pListing(id: number, body: Partial<P2PListingWritePayload>, token: string): Promise<P2PListing> {
  const res = await request<Record<string, unknown>>(`/p2p-listings/${id}/`, { method: "PATCH", body, token })
  return normalizeP2PListing(res.data as Record<string, unknown>)
}

export async function withdrawP2pListing(id: number, token: string): Promise<P2PListing> {
  const res = await request<Record<string, unknown>>(`/p2p-listings/${id}/`, { method: "DELETE", token })
  return normalizeP2PListing(res.data as Record<string, unknown>)
}

export async function submitP2pBid(
  listingId: number,
  body: { bid_price: string; message?: string },
  token: string,
): Promise<P2PBidSent> {
  const res = await request<Record<string, unknown>>(`/p2p-listings/${listingId}/submit-bid/`, {
    method: "POST",
    body,
    token,
  })
  return normalizeP2PBidSent(res.data as Record<string, unknown>)
}

export async function listP2pBidsIncoming(token: string): Promise<P2PBidIncoming[]> {
  const res = await request<unknown[]>("/p2p-bids/", { token })
  const rows = Array.isArray(res.data) ? res.data : []
  return rows.map((r) => normalizeP2PBidIncoming(r as Record<string, unknown>))
}

export async function listP2pBidsSent(token: string): Promise<P2PBidSent[]> {
  const res = await request<unknown[]>("/p2p-bids/?scope=sent", { token })
  const rows = Array.isArray(res.data) ? res.data : []
  return rows.map((r) => normalizeP2PBidSent(r as Record<string, unknown>))
}

export async function patchP2pBidStatus(
  bidId: number,
  status: "accepted" | "declined",
  token: string,
): Promise<P2PBidIncoming> {
  const res = await request<Record<string, unknown>>(`/p2p-bids/${bidId}/`, { method: "PATCH", body: { status }, token })
  return normalizeP2PBidIncoming(res.data as Record<string, unknown>)
}
