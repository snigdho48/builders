import { useEffect, useMemo } from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion"
import { useLocation, useOutlet } from "react-router-dom"

/** Premium ease-out — calm deceleration into rest */
const smoothOut: [number, number, number, number] = [0.16, 1, 0.3, 1]
/** Slightly quicker ease-in for exits so handoff to the next page feels tight */
const smoothIn: [number, number, number, number] = [0.4, 0, 0.2, 1]

/**
 * Route transitions (Framer Motion). Navbar/footer stay fixed in the shell;
 * this wrapper is normal document flow — no absolute inner scroll trap — so
 * long pages (e.g. Contact) scroll with the window and the footer stays below content.
 */
export function PageTransitionLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const transitionKey = location.pathname + location.search
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
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          className="flex w-full flex-1 flex-col will-change-[transform,opacity]"
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
