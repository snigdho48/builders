const GOOGTRANS = "googtrans"
const APP_LANGUAGE_KEY = "appLanguage"

/** Matches @theme `--font-sans` in `index.css` when Bengali is active. */
const FONT_SANS_BN = '"Manrope", "Tiro Bangla", ui-sans-serif, system-ui, sans-serif'

/** Latin-only stack when UI is English (smaller payload, clear switch vs BN). */
const FONT_SANS_EN = '"Manrope", ui-sans-serif, system-ui, sans-serif'

export function readIsBengaliTypographyActive(): boolean {
  if (typeof window === "undefined") return false
  try {
    const app = localStorage.getItem(APP_LANGUAGE_KEY)
    if (app === "bn") return true
  } catch {
    /* private mode */
  }
  const part = document.cookie.split("; ").find((p) => p.startsWith(`${GOOGTRANS}=`))
  const raw = part?.split("=")[1]
  if (!raw) return false
  try {
    return decodeURIComponent(raw).includes("/bn")
  } catch {
    return false
  }
}

/** Keep `html` lang + `--font-sans` aligned with app language and Google Translate cookie. */
export function syncRootFontForScriptLang(): void {
  const root = document.documentElement
  const bn = readIsBengaliTypographyActive()
  root.lang = bn ? "bn" : "en"
  root.style.setProperty("--font-sans", bn ? FONT_SANS_BN : FONT_SANS_EN)
}
