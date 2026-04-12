/** Public folder URLs with Vite `base` (e.g. `/demo/`). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const normalizedBase = base.endsWith("/") ? base : `${base}/`
  const p = path.replace(/^\/+/, "")
  if (!p) return normalizedBase
  const encoded = p.split("/").filter(Boolean).map(encodeURIComponent).join("/")
  return `${normalizedBase}${encoded}`
}

/**
 * Sets CSS variables for `index.css` rules that reference `public/` files
 * (plain CSS cannot use `import.meta.env.BASE_URL`).
 */
export function setPublicAssetCssVars(): void {
  if (typeof document === "undefined") return
  const lightWash =
    "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(246,247,251,0.2) 42%, transparent 68%)"
  const grad =
    "linear-gradient(to bottom, rgba(0, 0, 0, 0.38) 0%, rgba(0, 0, 0, 0.52) 55%, rgba(0, 0, 0, 0.58) 100%)"
  const landscape = `url("${publicUrl("beautiful-landscape-with-small-village copy.webp")}")`
  document.documentElement.style.setProperty(
    "--home-hero-bg",
    `${lightWash}, ${grad}, ${landscape} center / cover no-repeat`,
  )
  document.documentElement.style.setProperty(
    "--polygon-mask-url",
    `url("${publicUrl("polygon-image.png")}")`,
  )
}
