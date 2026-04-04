import { fallbackDashboard, fallbackProperties } from "@/data/fallback"
import type {
  AdminDashboardData,
  AgentDashboardData,
  AgentUpsertPayload,
  AgentUser,
  ApiEnvelope,
  CreateInvestmentCheckoutPayload,
  CreateInvestmentPayload,
  DashboardData,
  FloorPlanItem,
  Investment,
  InvestmentCheckoutListFilters,
  InvestmentCheckoutRequest,
  InvestmentListFilters,
  InvestmentType,
  KycFieldChoice,
  KycFieldDefinition,
  KycTemplate,
  LandSaleMode,
  PaymentRecord,
  PaymentRequestRecord,
  MeResponse,
  Property,
  PropertyChannel,
  PropertyUpsertPayload,
  ShareInvestmentOption,
  RepresentativeUpsertPayload,
  RepresentativeDashboardData,
  RepresentativeUser,
  RetailInvestor,
  RedemptionRequest,
  InvestorUpsertPayload,
  UserKycSubmission,
  UserNotification,
} from "@/types/domain"

function normalizeDevApiBase(url: string): string {
  if (!import.meta.env.DEV) {
    return url
  }
  return url.replace(/^https:\/\/(127\.0\.0\.1|localhost)/i, "http://$1")
}

const API_BASE = normalizeDevApiBase(
  "http://127.0.0.1:8000/api"
)

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
        if (typeof nf === "string") return nf
        const detail = rec.detail
        if (typeof detail === "string") return detail
        if (Array.isArray(detail) && detail.length > 0) return String(detail[0])
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
  if (typeof window === "undefined") {
    return
  }
  const currentPath = window.location.pathname
  if (currentPath.startsWith("/auth")) {
    return
  }
  window.location.assign("/auth?reason=session-expired")
}

function notifyAuthStateChanged() {
  if (typeof window === "undefined") {
    return
  }
  window.dispatchEvent(new Event("auth-state-changed"))
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

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

function asShareInvestmentOptions(v: unknown): ShareInvestmentOption[] {
  if (!Array.isArray(v)) {
    return []
  }
  const out: ShareInvestmentOption[] = []
  for (const row of v) {
    if (!row || typeof row !== "object") {
      continue
    }
    const o = row as Record<string, unknown>
    const amount = o.amount != null ? String(o.amount) : ""
    const duration_years = o.duration_years != null ? Number(o.duration_years) : 0
    if (!amount || duration_years <= 0) {
      continue
    }
    out.push({ amount, duration_years })
  }
  return out
}

function asFloorPlans(v: unknown): FloorPlanItem[] {
  if (!Array.isArray(v)) {
    return []
  }
  const out: FloorPlanItem[] = []
  for (const row of v) {
    if (!row || typeof row !== "object") {
      continue
    }
    const o = row as Record<string, unknown>
    const title = typeof o.title === "string" ? o.title : ""
    const image_url = typeof o.image_url === "string" ? o.image_url : ""
    if (!title && !image_url) {
      continue
    }
    const description = typeof o.description === "string" ? o.description : undefined
    const item: FloorPlanItem = { title, image_url }
    if (description !== undefined) {
      item.description = description
    }
    out.push(item)
  }
  return out
}

export function normalizeProperty(raw: Record<string, unknown>): Property {
  const mode = (raw.land_sale_mode as LandSaleMode) || "per_block"
  const rawChannel = raw.property_channel
  let property_channel: PropertyChannel
  if (rawChannel === "installment" || rawChannel === "plot_buy") {
    property_channel = rawChannel
  } else if (rawChannel === "direct_buy") {
    property_channel = "plot_buy"
  } else if (rawChannel == null || rawChannel === "") {
    property_channel = mode === "fractional_share" ? "installment" : "plot_buy"
  } else {
    property_channel = "plot_buy"
  }
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    description: String(raw.description ?? ""),
    description_secondary: String(raw.description_secondary ?? ""),
    property_type: (raw.property_type as Property["property_type"]) ?? "land",
    property_channel,
    land_sale_mode: mode,
    total_blocks: Number(raw.total_blocks ?? 0),
    available_blocks: Number(raw.available_blocks ?? 0),
    price_per_block: String(raw.price_per_block ?? "0"),
    whole_land_price: raw.whole_land_price != null ? String(raw.whole_land_price) : null,
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
    amenities: asStringList(raw.amenities),
    tags: asStringList(raw.tags),
    floor_plans: asFloorPlans(raw.floor_plans),
    build_year: raw.build_year != null ? Number(raw.build_year) : null,
    bedrooms: raw.bedrooms != null ? Number(raw.bedrooms) : null,
    bathrooms: raw.bathrooms != null ? Number(raw.bathrooms) : null,
    flat_label: String(raw.flat_label ?? ""),
    size_sqft: raw.size_sqft != null ? Number(raw.size_sqft) : null,
    for_rent: Boolean(raw.for_rent),
    for_sale: raw.for_sale !== false,
    contact_website: String(raw.contact_website ?? ""),
    rating_average: raw.rating_average != null ? String(raw.rating_average) : null,
    review_count: Number(raw.review_count ?? 0),
    review_sample_author: String(raw.review_sample_author ?? ""),
    review_sample_date: raw.review_sample_date != null ? String(raw.review_sample_date) : null,
    review_sample_text: String(raw.review_sample_text ?? ""),
    status: (raw.status as Property["status"]) ?? "available",
    listing_active: raw.listing_active !== false,
    expected_profit_percent: raw.expected_profit_percent != null ? String(raw.expected_profit_percent) : null,
    investment_window_start: raw.investment_window_start != null ? String(raw.investment_window_start) : null,
    investment_window_end: raw.investment_window_end != null ? String(raw.investment_window_end) : null,
    share_investment_options: asShareInvestmentOptions(raw.share_investment_options),
    representative: raw.representative != null ? Number(raw.representative) : null,
    representative_name: raw.representative_name != null ? String(raw.representative_name) : null,
    representative_email: raw.representative_email != null ? String(raw.representative_email) : null,
    representative_phone: raw.representative_phone != null ? String(raw.representative_phone) : null,
    managed_by: raw.managed_by != null ? Number(raw.managed_by) : null,
    managed_by_name: raw.managed_by_name != null ? String(raw.managed_by_name) : null,
  }
}

export async function getProperties(options?: { pageSize?: number; token?: string }): Promise<Property[]> {
  const pageSize = Math.min(200, Math.max(10, options?.pageSize ?? 100))
  try {
    const response = await request<Record<string, unknown>[]>(`/properties/?page_size=${pageSize}`, {
      token: options?.token,
    })
    return response.data.map((row) => normalizeProperty(row))
  } catch {
    return fallbackProperties
  }
}

export async function getPropertiesPaged(options?: {
  page?: number
  pageSize?: number
  propertyType?: string
  propertyChannel?: string
  landSaleMode?: string
  /** Listing lifecycle, e.g. `available` for public catalog */
  status?: string
  search?: string
  token?: string
}): Promise<{ items: Property[]; pagination: ApiEnvelope<unknown>["pagination"] | null }> {
  const page = Math.max(1, options?.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 12))
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("page_size", String(pageSize))
  const pt = options?.propertyType?.trim()
  if (pt && pt !== "all") {
    params.set("property_type", pt)
  }
  const ch = options?.propertyChannel?.trim()
  if (ch && ch !== "all") {
    params.set("property_channel", ch)
  }
  const lsm = options?.landSaleMode?.trim()
  if (lsm && lsm !== "all") {
    params.set("land_sale_mode", lsm)
  }
  const st = options?.status?.trim()
  if (st) {
    params.set("status", st)
  }
  const q = options?.search?.trim()
  if (q) {
    params.set("search", q)
  }
  try {
    const response = await request<Record<string, unknown>[]>(`/properties/?${params.toString()}`, {
      token: options?.token,
    })
    return { items: response.data.map((row) => normalizeProperty(row)), pagination: response.pagination ?? null }
  } catch {
    return { items: fallbackProperties, pagination: null }
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const response = await request<Record<string, unknown>>(`/properties/${id}/`)
    return normalizeProperty(response.data as Record<string, unknown>)
  } catch {
    const fallback = fallbackProperties.find((property) => property.id === Number(id))
    return fallback ?? null
  }
}

export async function fetchPropertyFresh(id: string, token?: string | null): Promise<Property | null> {
  try {
    const response = await request<Record<string, unknown>>(`/properties/${id}/`, {
      token: token ?? localStorage.getItem("accessToken") ?? undefined,
    })
    return normalizeProperty(response.data as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function getDashboard(token?: string): Promise<DashboardData> {
  if (!token) {
    return fallbackDashboard
  }
  try {
    const response = await request<DashboardData>("/dashboard/", { token })
    return response.data
  } catch {
    return fallbackDashboard
  }
}

export async function getDashboardByRole(
  token: string
): Promise<DashboardData | AdminDashboardData | RepresentativeDashboardData | AgentDashboardData> {
  const response = await request<
    DashboardData | AdminDashboardData | RepresentativeDashboardData | AgentDashboardData
  >("/dashboard/", { token })
  return response.data
}

export async function listInvestments(
  token: string,
  pageSizeOrOptions: number | InvestmentListFilters = 200
): Promise<Investment[]> {
  const opts: InvestmentListFilters =
    typeof pageSizeOrOptions === "number"
      ? { pageSize: pageSizeOrOptions }
      : pageSizeOrOptions
  const pageSize = opts.pageSize ?? 200
  const params = new URLSearchParams()
  params.set("page_size", String(pageSize))
  const q = opts.search?.trim()
  if (q) {
    params.set("search", q)
  }
  if (opts.investmentType && opts.investmentType !== "all") {
    params.set("investment_type", opts.investmentType)
  }
  if (opts.lifecycle && opts.lifecycle !== "all") {
    params.set("lifecycle", opts.lifecycle)
  }
  const qs = params.toString()
  const response = await request<Investment[]>(`/investments/?${qs}`, { token })
  return response.data.map((inv) => normalizeInvestmentRecord(inv))
}

export async function listPayments(token: string, pageSize = 200): Promise<PaymentRecord[]> {
  const response = await request<PaymentRecord[]>(`/payments/?page_size=${pageSize}`, { token })
  return response.data
}

export async function listPaymentRequests(token: string, pageSize = 200): Promise<PaymentRequestRecord[]> {
  const response = await request<PaymentRequestRecord[]>(`/payment-requests/?page_size=${pageSize}`, { token })
  return response.data
}

export async function createPaymentRequest(
  body: { investment?: number | null; amount: string; method: string; note?: string },
  token: string
): Promise<PaymentRequestRecord> {
  const response = await request<PaymentRequestRecord>("/payment-requests/", {
    method: "POST",
    body,
    token,
  })
  return response.data
}

export async function approvePaymentRequest(
  id: number,
  token: string,
  review_note?: string
): Promise<PaymentRequestRecord> {
  const response = await request<PaymentRequestRecord>(`/payment-requests/${id}/approve/`, {
    method: "POST",
    body: { review_note: review_note ?? "" },
    token,
  })
  return response.data
}

export async function rejectPaymentRequest(
  id: number,
  token: string,
  review_note?: string
): Promise<PaymentRequestRecord> {
  const response = await request<PaymentRequestRecord>(`/payment-requests/${id}/reject/`, {
    method: "POST",
    body: { review_note: review_note ?? "" },
    token,
  })
  return response.data
}

function normalizeMe(raw: MeResponse): MeResponse {
  return {
    ...raw,
    kyc_checkout_ready: raw.kyc_checkout_ready ?? true,
    kyc_missing_templates: raw.kyc_missing_templates ?? [],
  }
}

export async function getMe(token: string): Promise<MeResponse> {
  const response = await request<MeResponse>("/auth/me/", { token })
  return normalizeMe(response.data)
}

function normalizeKycField(raw: Record<string, unknown>): KycFieldDefinition {
  const choices = Array.isArray(raw.choices) ? raw.choices : []
  return {
    id: Number(raw.id),
    field_key: String(raw.field_key ?? ""),
    label: String(raw.label ?? ""),
    input_type: String(raw.input_type ?? "text"),
    validation_type: String(raw.validation_type ?? "none"),
    validation_config: (raw.validation_config as Record<string, unknown>) ?? {},
    required: Boolean(raw.required),
    enabled: raw.enabled !== false,
    sort_order: Number(raw.sort_order ?? 0),
    choices: choices
      .filter((c): c is Record<string, unknown> => c !== null && typeof c === "object")
      .map((c) => ({ value: String(c.value ?? ""), label: String(c.label ?? c.value ?? "") })),
  }
}

function normalizeKycTemplate(raw: Record<string, unknown>): KycTemplate {
  const fieldsRaw = Array.isArray(raw.fields) ? raw.fields : []
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    description: String(raw.description ?? ""),
    is_active: Boolean(raw.is_active),
    required_for_checkout: Boolean(raw.required_for_checkout),
    fields: fieldsRaw.map((f) => normalizeKycField(f as Record<string, unknown>)),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  }
}

function normalizeKycSubmission(raw: Record<string, unknown>): UserKycSubmission {
  return {
    id: Number(raw.id),
    user: Number(raw.user),
    user_username: raw.user_username != null ? String(raw.user_username) : undefined,
    user_email: raw.user_email != null ? String(raw.user_email) : undefined,
    template: Number(raw.template),
    template_name: raw.template_name != null ? String(raw.template_name) : undefined,
    status: raw.status as UserKycSubmission["status"],
    responses: (raw.responses as Record<string, unknown>) ?? {},
    reviewed_by: raw.reviewed_by != null ? Number(raw.reviewed_by) : null,
    reviewer_name: raw.reviewer_name != null ? String(raw.reviewer_name) : undefined,
    review_note: String(raw.review_note ?? ""),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  }
}

export async function listKycTemplates(token: string, pageSize = 100): Promise<KycTemplate[]> {
  const response = await request<Record<string, unknown>[]>(`/kyc-templates/?page_size=${pageSize}`, { token })
  return response.data.map((row) => normalizeKycTemplate(row as Record<string, unknown>))
}

export async function getKycTemplate(id: number, token: string): Promise<KycTemplate> {
  const response = await request<Record<string, unknown>>(`/kyc-templates/${id}/`, { token })
  return normalizeKycTemplate(response.data as Record<string, unknown>)
}

/** Payload for creating or fully updating a KYC template (nested fields replace definitions on update). */
export type KycFieldDefinitionWrite = {
  field_key: string
  label: string
  input_type: string
  validation_type: string
  validation_config: Record<string, unknown>
  required: boolean
  enabled: boolean
  sort_order: number
  choices: KycFieldChoice[]
}

export type KycTemplateWriteBody = {
  name?: string
  slug?: string
  description?: string
  is_active?: boolean
  required_for_checkout?: boolean
  fields?: KycFieldDefinitionWrite[]
}

export async function createKycTemplate(body: KycTemplateWriteBody & { name: string; slug: string }, token: string): Promise<KycTemplate> {
  const response = await request<Record<string, unknown>>("/kyc-templates/", {
    method: "POST",
    body,
    token,
  })
  return normalizeKycTemplate(response.data as Record<string, unknown>)
}

export async function patchKycTemplate(id: number, body: KycTemplateWriteBody, token: string): Promise<KycTemplate> {
  const response = await request<Record<string, unknown>>(`/kyc-templates/${id}/`, {
    method: "PATCH",
    body,
    token,
  })
  return normalizeKycTemplate(response.data as Record<string, unknown>)
}

export async function deleteKycTemplate(id: number, token: string): Promise<void> {
  await request<null>(`/kyc-templates/${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function listKycSubmissions(token: string, pageSize = 200): Promise<UserKycSubmission[]> {
  const response = await request<Record<string, unknown>[]>(`/kyc-submissions/?page_size=${pageSize}`, { token })
  return response.data.map((row) => normalizeKycSubmission(row as Record<string, unknown>))
}

export async function createKycSubmission(
  body: { template: number; responses: Record<string, unknown> },
  token: string
): Promise<UserKycSubmission> {
  const response = await request<Record<string, unknown>>("/kyc-submissions/", {
    method: "POST",
    body,
    token,
  })
  return normalizeKycSubmission(response.data as Record<string, unknown>)
}

export async function updateKycSubmissionResponses(
  id: number,
  responses: Record<string, unknown>,
  token: string
): Promise<UserKycSubmission> {
  const response = await request<Record<string, unknown>>(`/kyc-submissions/${id}/`, {
    method: "PATCH",
    body: { responses },
    token,
  })
  return normalizeKycSubmission(response.data as Record<string, unknown>)
}

export async function reviewKycSubmission(
  id: number,
  body: { status: "approved" | "rejected"; review_note?: string },
  token: string
): Promise<UserKycSubmission> {
  const response = await request<Record<string, unknown>>(`/kyc-submissions/${id}/review/`, {
    method: "POST",
    body,
    token,
  })
  return normalizeKycSubmission(response.data as Record<string, unknown>)
}

export async function deleteKycSubmission(id: number, token: string): Promise<void> {
  await request<null>(`/kyc-submissions/${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function createInvestment(
  payload: CreateInvestmentPayload,
  token: string
): Promise<Investment> {
  const response = await request<Investment>("/investments/", {
    method: "POST",
    body: payload,
    token,
  })
  return normalizeInvestmentRecord(response.data)
}

function normalizeInvestmentType(raw: unknown): InvestmentType {
  // Legacy backend value "fractional" is installment-style.
  if (raw === "installment" || raw === "fractional") {
    return "installment"
  }
  if (raw === "plot_buy") {
    return "plot_buy"
  }
  if (raw === "direct") {
    return "plot_buy"
  }
  return "plot_buy"
}

function normalizeInvestmentRecord(inv: Investment): Investment {
  return {
    ...inv,
    type: normalizeInvestmentType(inv.type),
  }
}

function normalizeCheckoutRequest(raw: Record<string, unknown>): InvestmentCheckoutRequest {
  return {
    id: Number(raw.id),
    investor: Number(raw.investor),
    investor_username: raw.investor_username != null ? String(raw.investor_username) : undefined,
    investor_email: raw.investor_email != null ? String(raw.investor_email) : undefined,
    property: Number(raw.property),
    property_title: raw.property_title != null ? String(raw.property_title) : undefined,
    status: (raw.status as InvestmentCheckoutRequest["status"]) ?? "pending",
    agent_approved: Boolean(raw.agent_approved),
    representative_approved: Boolean(raw.representative_approved),
    rejected_reason: String(raw.rejected_reason ?? ""),
    investment_type: normalizeInvestmentType(raw.investment_type),
    duration_years: Number(raw.duration_years ?? 0),
    blocks_owned: Number(raw.blocks_owned ?? 0),
    shares_owned: Number(raw.shares_owned ?? 0),
    referral_code_used: raw.referral_code_used != null ? String(raw.referral_code_used) : undefined,
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
    property_listing_active:
      raw.property_listing_active !== undefined && raw.property_listing_active !== null
        ? Boolean(raw.property_listing_active)
        : undefined,
    property_channel:
      raw.property_channel === "installment" || raw.property_channel === "plot_buy"
        ? raw.property_channel
        : raw.property_channel === "direct_buy"
          ? "plot_buy"
          : undefined,
    property_investment_window_start:
      raw.property_investment_window_start != null
        ? String(raw.property_investment_window_start)
        : null,
    property_investment_window_end:
      raw.property_investment_window_end != null ? String(raw.property_investment_window_end) : null,
  }
}

export async function listInvestmentCheckoutRequests(
  token: string,
  options?: InvestmentCheckoutListFilters
): Promise<InvestmentCheckoutRequest[]> {
  const pageSize = options?.pageSize ?? 100
  const params = new URLSearchParams()
  params.set("page_size", String(pageSize))
  const q = options?.search?.trim()
  if (q) {
    params.set("search", q)
  }
  if (options?.status && options.status !== "all") {
    params.set("status", options.status)
  }
  if (options?.investmentType && options.investmentType !== "all") {
    params.set("investment_type", options.investmentType)
  }
  if (options?.window && options.window !== "all") {
    params.set("window", options.window)
  }
  if (options?.listingActive && options.listingActive !== "all") {
    params.set("listing_active", options.listingActive)
  }
  if (options?.propertyChannel && options.propertyChannel !== "all") {
    params.set("property_channel", options.propertyChannel)
  }
  const response = await request<Record<string, unknown>[]>(
    `/investment-checkout-requests/?${params.toString()}`,
    { token }
  )
  return response.data.map((row) => normalizeCheckoutRequest(row))
}

export async function createInvestmentCheckoutRequest(
  payload: CreateInvestmentCheckoutPayload,
  token: string
): Promise<InvestmentCheckoutRequest> {
  const response = await request<Record<string, unknown>>("/investment-checkout-requests/", {
    method: "POST",
    body: payload,
    token,
  })
  return normalizeCheckoutRequest(response.data as Record<string, unknown>)
}

export async function approveInvestmentCheckoutRequest(id: number, token: string): Promise<InvestmentCheckoutRequest> {
  const response = await request<Record<string, unknown>>(
    `/investment-checkout-requests/${id}/approve/`,
    { method: "POST", body: {}, token }
  )
  return normalizeCheckoutRequest(response.data as Record<string, unknown>)
}

export async function rejectInvestmentCheckoutRequest(
  id: number,
  token: string,
  rejectedReason?: string
): Promise<InvestmentCheckoutRequest> {
  const response = await request<Record<string, unknown>>(`/investment-checkout-requests/${id}/reject/`, {
    method: "POST",
    body: rejectedReason ? { rejected_reason: rejectedReason } : {},
    token,
  })
  return normalizeCheckoutRequest(response.data as Record<string, unknown>)
}

export async function cancelInvestmentCheckoutRequest(id: number, token: string): Promise<InvestmentCheckoutRequest> {
  const response = await request<Record<string, unknown>>(`/investment-checkout-requests/${id}/cancel/`, {
    method: "POST",
    body: {},
    token,
  })
  return normalizeCheckoutRequest(response.data as Record<string, unknown>)
}

export async function completeInvestmentCheckoutRequest(
  id: number,
  token: string
): Promise<InvestmentCheckoutRequest> {
  const response = await request<Record<string, unknown>>(`/investment-checkout-requests/${id}/complete/`, {
    method: "POST",
    body: {},
    token,
  })
  return normalizeCheckoutRequest(response.data as Record<string, unknown>)
}

export async function updateProfile(payload: FormData, token: string): Promise<MeResponse> {
  const response = await request<MeResponse>("/auth/me/", {
    method: "PATCH",
    body: payload,
    token,
    isFormData: true,
  })
  return response.data
}

export async function login(username: string, password: string) {
  const response = await request<{ access: string; refresh: string; role: string }>(
    "/auth/login/",
    {
      method: "POST",
      body: { username, password },
    }
  )
  return response.data
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
  const response = await request<{
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }>("/auth/register/", {
    method: "POST",
    body: payload,
    skipAuthRefresh: true,
  })
  return response.data
}

export async function createProperty(payload: PropertyUpsertPayload, token: string): Promise<Property> {
  const response = await request<Record<string, unknown>>("/properties/", {
    method: "POST",
    body: payload,
    token,
  })
  return normalizeProperty(response.data)
}

export async function updateProperty(
  id: number | string,
  payload: Partial<PropertyUpsertPayload>,
  token: string
): Promise<Property> {
  const response = await request<Record<string, unknown>>(`/properties/${id}/`, {
    method: "PATCH",
    body: payload,
    token,
  })
  return normalizeProperty(response.data)
}

export async function deleteProperty(id: number | string, token: string): Promise<void> {
  await request<null>(`/properties/${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function getManagedProperties(token: string): Promise<Property[]> {
  const response = await request<Record<string, unknown>[]>(
    "/properties/?managed_by_me=1&include_inactive=1&page_size=100",
    {
      token,
    }
  )
  return response.data.map((row) => normalizeProperty(row))
}

export async function getManagedPropertiesPaged(
  token: string,
  options?: {
    page?: number
    pageSize?: number
    propertyType?: string
    propertyChannel?: string
    status?: string
    search?: string
  }
): Promise<{ items: Property[]; pagination: ApiEnvelope<unknown>["pagination"] | null }> {
  const page = Math.max(1, options?.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 10))
  const params = new URLSearchParams()
  params.set("managed_by_me", "1")
  params.set("include_inactive", "1")
  params.set("page", String(page))
  params.set("page_size", String(pageSize))
  const pt = options?.propertyType?.trim()
  if (pt && pt !== "all") {
    params.set("property_type", pt)
  }
  const ch = options?.propertyChannel?.trim()
  if (ch && ch !== "all") {
    params.set("property_channel", ch)
  }
  const st = options?.status?.trim()
  if (st && st !== "all") {
    params.set("status", st)
  }
  const q = options?.search?.trim()
  if (q) {
    params.set("search", q)
  }
  const response = await request<Record<string, unknown>[]>(`/properties/?${params.toString()}`, { token })
  return { items: response.data.map((row) => normalizeProperty(row)), pagination: response.pagination ?? null }
}

export async function getRepresentatives(token: string): Promise<RepresentativeUser[]> {
  const response = await request<RepresentativeUser[]>("/representatives/?page_size=100", { token })
  return response.data
}

export async function getRetailInvestors(token: string): Promise<RetailInvestor[]> {
  const response = await request<RetailInvestor[]>("/investors/?page_size=200", { token })
  return response.data
}

export async function createRetailInvestor(payload: InvestorUpsertPayload, token: string): Promise<RetailInvestor> {
  const response = await request<RetailInvestor>("/investors/", {
    method: "POST",
    body: payload,
    token,
  })
  return response.data
}

export async function createRepresentative(
  payload: RepresentativeUpsertPayload,
  token: string
): Promise<RepresentativeUser> {
  const response = await request<RepresentativeUser>("/representatives/", {
    method: "POST",
    body: payload,
    token,
  })
  return response.data
}

export async function updateRepresentative(
  id: number | string,
  payload: Partial<RepresentativeUpsertPayload>,
  token: string
): Promise<RepresentativeUser> {
  const response = await request<RepresentativeUser>(`/representatives/${id}/`, {
    method: "PATCH",
    body: payload,
    token,
  })
  return response.data
}

export async function deleteRepresentative(id: number | string, token: string): Promise<void> {
  await request<null>(`/representatives/${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function getAgents(token: string): Promise<AgentUser[]> {
  const response = await request<AgentUser[]>("/agents/?page_size=100", { token })
  return response.data
}

export async function createAgent(payload: AgentUpsertPayload, token: string): Promise<AgentUser> {
  const response = await request<AgentUser>("/agents/", {
    method: "POST",
    body: payload,
    token,
  })
  return response.data
}

export async function updateAgent(
  id: number | string,
  payload: Partial<AgentUpsertPayload>,
  token: string
): Promise<AgentUser> {
  const response = await request<AgentUser>(`/agents/${id}/`, {
    method: "PATCH",
    body: payload,
    token,
  })
  return response.data
}

export async function deleteAgent(id: number | string, token: string): Promise<void> {
  await request<null>(`/agents/${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function fetchNotificationUnreadCount(token: string): Promise<number> {
  const response = await request<{ count: number }>("/notifications/unread-count/", { token })
  return Number(response.data?.count ?? 0)
}

export async function listNotifications(
  token: string,
  options?: { unreadOnly?: boolean; pageSize?: number }
): Promise<UserNotification[]> {
  const pageSize = options?.pageSize ?? 40
  const params = new URLSearchParams({ page_size: String(pageSize) })
  if (options?.unreadOnly) {
    params.set("unread_only", "1")
  }
  const response = await request<UserNotification[]>(`/notifications/?${params.toString()}`, { token })
  return response.data
}

export async function markNotificationRead(id: number, token: string): Promise<void> {
  await request<unknown>(`/notifications/${id}/mark-read/`, { method: "POST", token })
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await request<unknown>("/notifications/mark-all-read/", { method: "POST", token })
}

export async function createRedemptionRequest(investmentId: number, token: string): Promise<RedemptionRequest> {
  const response = await request<RedemptionRequest>("/redemption-requests/", {
    method: "POST",
    body: { investment: investmentId },
    token,
  })
  return response.data
}

export async function listRedemptionRequests(token: string, pageSize = 100): Promise<RedemptionRequest[]> {
  const response = await request<RedemptionRequest[]>(`/redemption-requests/?page_size=${pageSize}`, {
    token,
  })
  return response.data
}

export async function approveRedemptionRequest(id: number, token: string): Promise<RedemptionRequest> {
  const response = await request<RedemptionRequest>(`/redemption-requests/${id}/approve/`, {
    method: "POST",
    token,
  })
  return response.data
}

export async function rejectRedemptionRequest(
  id: number,
  token: string,
  reason?: string
): Promise<RedemptionRequest> {
  const response = await request<RedemptionRequest>(`/redemption-requests/${id}/reject/`, {
    method: "POST",
    body: { reason: reason ?? "" },
    token,
  })
  return response.data
}

export async function markRedemptionPaid(id: number, token: string): Promise<RedemptionRequest> {
  const response = await request<RedemptionRequest>(`/redemption-requests/${id}/mark-paid/`, {
    method: "POST",
    token,
  })
  return response.data
}
