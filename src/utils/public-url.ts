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
  const grad = "linear-gradient(rgba(10, 31, 62, 0.34), rgba(10, 31, 62, 0.55))"
  const landscape = `url("${publicUrl("beautiful-landscape-with-small-village.webp")}")`
  document.documentElement.style.setProperty(
    "--home-hero-bg",
    `${grad}, ${landscape} center / cover no-repeat`,
  )
  document.documentElement.style.setProperty(
    "--polygon-mask-url",
    `url("${publicUrl("polygon-image.png")}")`,
  )
}
