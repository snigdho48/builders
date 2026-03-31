import { fallbackDashboard, fallbackProperties } from "@/data/fallback"
import type {
  AdminDashboardData,
  AgentDashboardData,
  AgentUpsertPayload,
  AgentUser,
  ApiEnvelope,
  CreateInvestmentPayload,
  DashboardData,
  FloorPlanItem,
  Investment,
  LandSaleMode,
  MeResponse,
  Property,
  PropertyChannel,
  PropertyUpsertPayload,
  RepresentativeUpsertPayload,
  RepresentativeDashboardData,
  RepresentativeUser,
  RetailInvestor,
} from "@/types/domain"

function normalizeDevApiBase(url: string): string {
  if (!import.meta.env.DEV) {
    return url
  }
  return url.replace(/^https:\/\/(127\.0\.0\.1|localhost)/i, "http://$1")
}

const API_BASE = normalizeDevApiBase(
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api"
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
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error
  ) {
    return String((payload.error as { message: string }).message)
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
  if (rawChannel === "installment" || rawChannel === "direct_buy") {
    property_channel = rawChannel
  } else if (rawChannel == null || rawChannel === "") {
    property_channel = mode === "fractional_share" ? "installment" : "direct_buy"
  } else {
    property_channel = "direct_buy"
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
    representative: raw.representative != null ? Number(raw.representative) : null,
    representative_name: raw.representative_name != null ? String(raw.representative_name) : null,
    representative_email: raw.representative_email != null ? String(raw.representative_email) : null,
    representative_phone: raw.representative_phone != null ? String(raw.representative_phone) : null,
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

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const response = await request<Record<string, unknown>>(`/properties/${id}/`)
    return normalizeProperty(response.data as Record<string, unknown>)
  } catch {
    const fallback = fallbackProperties.find((property) => property.id === Number(id))
    return fallback ?? null
  }
}

export async function fetchPropertyFresh(id: string): Promise<Property | null> {
  try {
    const response = await request<Record<string, unknown>>(`/properties/${id}/`)
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

export async function getMe(token: string): Promise<MeResponse> {
  const response = await request<MeResponse>("/auth/me/", { token })
  return response.data
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
  return response.data
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
  const response = await request<Record<string, unknown>[]>("/properties/?managed_by_me=1&page_size=100", {
    token,
  })
  return response.data.map((row) => normalizeProperty(row))
}

export async function getRepresentatives(token: string): Promise<RepresentativeUser[]> {
  const response = await request<RepresentativeUser[]>("/representatives/?page_size=100", { token })
  return response.data
}

export async function getRetailInvestors(token: string): Promise<RetailInvestor[]> {
  const response = await request<RetailInvestor[]>("/investors/?page_size=200", { token })
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
