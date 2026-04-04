import DOMPurify from "dompurify"

const SANITIZE_OPTS = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "h2", "h3", "blockquote"],
  ALLOWED_ATTR: ["href", "target", "rel"],
}

let linkHookInstalled = false

function ensureExternalLinkSafety() {
  if (linkHookInstalled) return
  linkHookInstalled = true
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (!(node instanceof Element) || node.tagName !== "A") return
    const href = node.getAttribute("href")
    if (href && /^https?:\/\//i.test(href)) {
      node.setAttribute("target", "_blank")
      node.setAttribute("rel", "noopener noreferrer")
    }
  })
}

/** Safe HTML for property descriptions shown on the public site. */
export function sanitizePropertyHtml(html: string): string {
  ensureExternalLinkSafety()
  return DOMPurify.sanitize(html || "", SANITIZE_OPTS)
}

/** One-line / card preview without tags. */
export function plainTextFromHtml(html: string): string {
  if (!html?.trim()) return ""
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }
  const d = document.createElement("div")
  d.innerHTML = html
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim()
}
