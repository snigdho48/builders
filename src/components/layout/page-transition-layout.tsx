import { useEffect, useMemo } from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion"
import { useLocation, useOutlet } from "react-router-dom"

/** Premium ease-out — calm deceleration into rest */
const smoothOut: [number, number, number, number] = [0.16, 1, 0.3, 1]
/** Slightly quicker ease-in for exits so handoff to the next page feels tight */
const smoothIn: [number, number, number, number] = [0.4, 0, 0.2, 1]

/**
 * Route transitions (Framer Motion). Non-dashboard: natural document height so the window scrolls.
 * Under /dashboard: parent uses h-dvh + overflow-hidden; this layer clips so only DashboardShell’s
 * <main> scrolls (top bar + sidebar stay fixed in the shell).
 */
export function PageTransitionLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  // Pathname only — query/hash changes (e.g. live search on /listings?q=…) must not remount
  // the outlet or every keystroke would unmount the page and drop input focus.
  const transitionKey = location.pathname
  const isDashboard = transitionKey.startsWith("/dashboard")
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Instant scroll: avoids overlapping with the Framer route transition (double motion).
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [transitionKey])

  const pageVariants: Variants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0, transition: { duration: 0 } },
        exit: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
    }
    return {
      initial: { opacity: 0, y: 14 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          opacity: { duration: 0.48, ease: smoothOut },
          y: {
            type: "spring",
            stiffness: 280,
            damping: 34,
            mass: 0.85,
          },
        },
      },
      exit: {
        opacity: 0,
        y: -10,
        transition: {
          opacity: { duration: 0.3, ease: smoothIn },
          y: { duration: 0.34, ease: smoothIn },
        },
      },
    }
  }, [prefersReducedMotion])

  return (
    <div
      className={
        isDashboard
          ? "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden"
          : "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden"
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          className={
            isDashboard
              ? "flex min-h-0 w-full flex-1 flex-col overflow-hidden will-change-[transform,opacity]"
              : "flex w-full flex-1 flex-col will-change-[transform,opacity]"
          }
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
