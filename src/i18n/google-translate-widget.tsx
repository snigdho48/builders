import { useEffect, useRef, useState } from "react"

import "@/i18n/google-translate-widget.css"
import { syncRootFontForScriptLang } from "@/i18n/sync-root-font-for-lang"

const WIDGET_CONTAINER_ID = "google_translate_element"
const GOOGTRANS_COOKIE = "googtrans"

type TranslateElementInstance = Record<string, unknown>

type EurostarTranslateWindow = Window & {
  __eurostarTranslateElement?: TranslateElementInstance
}

function clearGoogtransCookieEverywhere() {
  const host = window.location.hostname
  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT"
  const variants = [
    `${GOOGTRANS_COOKIE}=;path=/;max-age=0`,
    `${GOOGTRANS_COOKIE}=;path=/;${expires}`,
  ]
  if (host) {
    variants.push(`${GOOGTRANS_COOKIE}=;path=/;domain=${host};max-age=0`)
    variants.push(`${GOOGTRANS_COOKIE}=;path=/;domain=.${host};max-age=0`)
    variants.push(`${GOOGTRANS_COOKIE}=;path=/;domain=${host};${expires}`)
    variants.push(`${GOOGTRANS_COOKIE}=;path=/;domain=.${host};${expires}`)
  }
  for (const c of variants) {
    document.cookie = c
  }
}

/** Google nests a `.restore()` helper on the TranslateElement instance (see SO #16281414 / #73539988). */
function tryInvokeGoogleTranslateRestore(): boolean {
  const root = (window as EurostarTranslateWindow).__eurostarTranslateElement
  if (!root || typeof root !== "object") return false
  for (const key of Object.keys(root)) {
    const val = root[key]
    if (val && typeof val === "object" && typeof (val as { restore?: () => void }).restore === "function") {
      try {
        ;(val as { restore: () => void }).restore()
        return true
      } catch {
        /* try next key */
      }
    }
  }
  return false
}

/** Same-origin banner iframe exposes a "Show original" restore control. */
function tryClickGoogTeBannerRestore(): boolean {
  const iframe = document.querySelector("iframe.goog-te-banner-frame") as HTMLIFrameElement | null
  if (!iframe) return false
  let doc: Document | null = null
  try {
    doc = iframe.contentDocument ?? iframe.contentWindow?.document ?? null
  } catch {
    return false
  }
  if (!doc) return false
  for (const btn of doc.getElementsByTagName("button")) {
    if (btn.id?.includes("restore")) {
      btn.click()
      return true
    }
  }
  return false
}

type GoogleTranslateWidgetProps = {
  className?: string
}

function scheduleRootFontSync() {
  syncRootFontForScriptLang()
  queueMicrotask(() => syncRootFontForScriptLang())
  window.setTimeout(() => syncRootFontForScriptLang(), 400)
  window.setTimeout(() => syncRootFontForScriptLang(), 1200)
}

export function GoogleTranslateWidget({ className = "" }: GoogleTranslateWidgetProps) {
  const [language, setLanguage] = useState<"en" | "bn">("en")
  const languagePollRef = useRef<ReturnType<typeof window.setInterval> | null>(null)

  const readCurrentLanguage = (): "en" | "bn" => {
    if (typeof document === "undefined") return "en"
    const raw = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${GOOGTRANS_COOKIE}=`))
      ?.split("=")[1]
    if (!raw) return "en"
    const decoded = decodeURIComponent(raw)
    if (decoded.endsWith("/bn")) return "bn"
    return "en"
  }

  /** Apply language via Google's hidden `<select class="goog-te-combo">` (no full page reload). */
  function applyGoogTeCombo(next: "en" | "bn"): boolean {
    const host = document.getElementById(WIDGET_CONTAINER_ID)
    const combo =
      host?.querySelector<HTMLSelectElement>("select.goog-te-combo") ??
      document.querySelector<HTMLSelectElement>("select.goog-te-combo")
    if (!combo || combo.options.length === 0) {
      return false
    }

    const values = new Set(Array.from(combo.options).map((o) => o.value))

    if (next === "bn") {
      if (values.has("bn")) {
        combo.value = "bn"
      } else {
        const bnOpt = Array.from(combo.options).find((o) => o.value === "bn" || o.value.startsWith("bn"))
        if (bnOpt) {
          combo.value = bnOpt.value
        } else {
          const last = combo.options[combo.options.length - 1]
          if (last?.value) combo.value = last.value
          else combo.selectedIndex = Math.max(0, combo.options.length - 1)
        }
      }
    } else {
      clearGoogtransCookieEverywhere()
      combo.selectedIndex = 0
      const first = combo.options[0]
      if (first && values.has(first.value)) {
        combo.value = first.value
      } else if (values.has("")) {
        combo.value = ""
      } else if (values.has("en")) {
        combo.value = "en"
      }
    }

    const fire = (type: "input" | "change") => {
      combo.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }))
    }
    fire("input")
    fire("change")
    if (typeof combo.onchange === "function") {
      try {
        combo.onchange(new Event("change", { bubbles: true }))
      } catch {
        /* ignore */
      }
    }
    if (next === "en") {
      clearGoogtransCookieEverywhere()
    }
    return true
  }

  const setGoogleLanguage = (next: "en" | "bn") => {
    setLanguage(next)

    if (next === "bn") {
      document.cookie = `${GOOGTRANS_COOKIE}=${encodeURIComponent("/en/bn")};path=/;max-age=31536000`
    } else {
      clearGoogtransCookieEverywhere()
      if (tryInvokeGoogleTranslateRestore()) {
        window.requestAnimationFrame(() => clearGoogtransCookieEverywhere())
        scheduleRootFontSync()
        return
      }
      if (tryClickGoogTeBannerRestore()) {
        window.requestAnimationFrame(() => clearGoogtransCookieEverywhere())
        scheduleRootFontSync()
        return
      }
    }

    if (applyGoogTeCombo(next)) {
      scheduleRootFontSync()
      return
    }

    if (languagePollRef.current) {
      window.clearInterval(languagePollRef.current)
      languagePollRef.current = null
    }

    scheduleRootFontSync()

    let attempts = 0
    const maxAttempts = 60
    languagePollRef.current = window.setInterval(() => {
      attempts += 1
      if (applyGoogTeCombo(next) || attempts >= maxAttempts) {
        if (languagePollRef.current) {
          window.clearInterval(languagePollRef.current)
          languagePollRef.current = null
        }
        scheduleRootFontSync()
      }
    }, 100)
  }

  useEffect(() => {
    setLanguage(readCurrentLanguage())
    return () => {
      if (languagePollRef.current) {
        window.clearInterval(languagePollRef.current)
        languagePollRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    scheduleRootFontSync()
  }, [language])

  /** Google injects a top banner iframe and sets inline `body`/`html` offsets — hide bar and reset layout. */
  useEffect(() => {
    const stripGoogleTranslateChrome = () => {
      const html = document.documentElement
      const body = document.body
      html.style.removeProperty("margin-top")
      body.style.removeProperty("margin-top")
      body.style.setProperty("top", "0", "important")
      body.style.setProperty("position", "relative", "important")

      document.querySelectorAll("iframe.goog-te-banner-frame").forEach((node) => {
        const el = node as HTMLElement
        el.setAttribute("hidden", "")
        el.style.setProperty("display", "none", "important")
        el.style.setProperty("height", "0", "important")
        el.style.setProperty("width", "0", "important")
        el.style.setProperty("visibility", "hidden", "important")
        el.style.setProperty("pointer-events", "none", "important")
      })
    }

    stripGoogleTranslateChrome()
    const observer = new MutationObserver(() => {
      stripGoogleTranslateChrome()
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    })
    let ticks = 0
    const intervalId = window.setInterval(() => {
      stripGoogleTranslateChrome()
      ticks += 1
      if (ticks >= 25) {
        window.clearInterval(intervalId)
      }
    }, 200)
    return () => {
      observer.disconnect()
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <section
      className={`google-translate-widget skiptranslate ${className}`.trim()}
      data-no-translate="true"
      aria-label="Language switcher"
    >
      <div className="google-translate-widget__buttons" role="group" aria-label="Language switcher">
        <button
          type="button"
          onClick={() => setGoogleLanguage("en")}
          className={`google-translate-widget__button ${language === "en" ? "is-active" : ""}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setGoogleLanguage("bn")}
          className={`google-translate-widget__button ${language === "bn" ? "is-active" : ""}`}
        >
          BN
        </button>
      </div>
    </section>
  )
}

