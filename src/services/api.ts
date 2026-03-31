import { fallbackDashboard, fallbackProperties } from "@/data/fallback"
import type {
  AdminDashboardData,
  AdvertiserDashboardData,
  AdvertiserUpsertPayload,
  AdvertiserUser,
  ApiEnvelope,
  CreateInvestmentPayload,
  DashboardData,
  Investment,
  MeResponse,
  Property,
  PropertyUpsertPayload,
  RepresentativeUpsertPayload,
  RepresentativeDashboardData,
  RepresentativeUser,
} from "@/types/domain"

function normalizeDevApiBase(url: string): string {
  if (!import.meta.env.DEV) {
    return url
  }

  // Django runserver is HTTP-only in local dev.
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

export async function getProperties(): Promise<Property[]> {
  try {
    const response = await request<Property[]>("/properties/?page_size=10")
    return response.data
  } catch {
    return fallbackProperties
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const response = await request<Property>(`/properties/${id}/`)
    return response.data
  } catch {
    const fallback = fallbackProperties.find((property) => property.id === Number(id))
    return fallback ?? null
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
): Promise<DashboardData | AdminDashboardData | RepresentativeDashboardData | AdvertiserDashboardData> {
  const response = await request<
    DashboardData | AdminDashboardData | RepresentativeDashboardData | AdvertiserDashboardData
  >(
    "/dashboard/",
    { token }
  )
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
  const response = await request<Property>("/properties/", {
    method: "POST",
    body: payload,
    token,
  })
  return response.data
}

export async function updateProperty(
  id: number | string,
  payload: Partial<PropertyUpsertPayload>,
  token: string
): Promise<Property> {
  const response = await request<Property>(`/properties/${id}/`, {
    method: "PATCH",
    body: payload,
    token,
  })
  return response.data
}

export async function deleteProperty(id: number | string, token: string): Promise<void> {
  await request<null>(`/properties/${id}/`, {
    method: "DELETE",
    token,
  })
}

export async function getManagedProperties(token: string): Promise<Property[]> {
  const response = await request<Property[]>("/properties/?managed_by_me=1&page_size=100", { token })
  return response.data
}

export async function getRepresentatives(token: string): Promise<RepresentativeUser[]> {
  const response = await request<RepresentativeUser[]>("/representatives/?page_size=100", { token })
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

export async function getAdvertisers(token: string): Promise<AdvertiserUser[]> {
  const response = await request<AdvertiserUser[]>("/advertisers/?page_size=100", { token })
  return response.data
}

export async function createAdvertiser(
  payload: AdvertiserUpsertPayload,
  token: string
): Promise<AdvertiserUser> {
  const response = await request<AdvertiserUser>("/advertisers/", {
    method: "POST",
    body: payload,
    token,
  })
  return response.data
}

export async function updateAdvertiser(
  id: number | string,
  payload: Partial<AdvertiserUpsertPayload>,
  token: string
): Promise<AdvertiserUser> {
  const response = await request<AdvertiserUser>(`/advertisers/${id}/`, {
    method: "PATCH",
    body: payload,
    token,
  })
  return response.data
}

export async function deleteAdvertiser(id: number | string, token: string): Promise<void> {
  await request<null>(`/advertisers/${id}/`, {
    method: "DELETE",
    token,
  })
}
