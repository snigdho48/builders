const STORAGE_PREFIX = "investor_property_bookmarks_v1_"

function bookmarkStorageKey(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  if (localStorage.getItem("userRole") !== "investor") {
    return null
  }
  const uid = localStorage.getItem("userId")
  return `${STORAGE_PREFIX}${uid ?? "local"}`
}

function readIdsRaw(): number[] {
  const key = bookmarkStorageKey()
  if (!key) {
    return []
  }
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((x): x is number => typeof x === "number" && Number.isFinite(x))
  } catch {
    return []
  }
}

export function isPropertyBookmarked(propertyId: number): boolean {
  return readIdsRaw().includes(propertyId)
}

/** Returns true if the property is bookmarked after this call. */
export function togglePropertyBookmark(propertyId: number): boolean {
  const key = bookmarkStorageKey()
  if (!key) {
    return false
  }
  const set = new Set(readIdsRaw())
  if (set.has(propertyId)) {
    set.delete(propertyId)
  } else {
    set.add(propertyId)
  }
  const next = [...set].sort((a, b) => a - b)
  localStorage.setItem(key, JSON.stringify(next))
  window.dispatchEvent(new Event("bookmarks-changed"))
  return set.has(propertyId)
}
