import { useEffect, useRef, useState, type ReactNode } from "react"

type Variant = "fade-up" | "fade" | "scale"

type RevealOnViewProps = {
  children: ReactNode
  className?: string
  variant?: Variant
  /** Extra delay before animation starts (ms) */
  delayMs?: number
  /** Intersection root margin (e.g. earlier trigger) */
  rootMargin?: string
}

export function RevealOnView({
  children,
  className = "",
  variant = "fade-up",
  delayMs = 0,
  rootMargin = "0px 0px -6% 0px",
}: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { root: null, rootMargin, threshold: 0.06 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  const variantClass =
    variant === "fade-up"
      ? "reveal-vp reveal-vp-up"
      : variant === "scale"
        ? "reveal-vp reveal-vp-scale"
        : "reveal-vp reveal-vp-fade"

  return (
    <div
      ref={ref}
      className={`${variantClass}${visible ? " reveal-vp-visible" : ""} ${className}`.trim()}
      style={delayMs > 0 ? { transitionDelay: visible ? `${delayMs}ms` : undefined } : undefined}
    >
      {children}
    </div>
  )
}

type RevealStaggerProps = {
  children: ReactNode
  className?: string
  rootMargin?: string
}

/**
 * When the container enters the viewport, direct children animate in sequence (staggered).
 */
export function RevealStagger({ children, className = "", rootMargin = "0px 0px -8% 0px" }: RevealStaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { root: null, rootMargin, threshold: 0.04 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div
      ref={ref}
      className={`reveal-stagger${visible ? " reveal-stagger-visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
