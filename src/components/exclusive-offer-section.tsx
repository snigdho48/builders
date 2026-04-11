import { Link } from "react-router-dom"

import { RevealOnView } from "@/components/motion/reveal-on-view"

export function ExclusiveOfferSection() {
  return (
    <section
      className="exclusive-offer-wrap landing-section"
      aria-labelledby="exclusive-offer-heading"
    >
      <div className="landing-inner">
        <RevealOnView className="w-full" variant="fade-up">
          <div className="exclusive-offer-card">
            <div className="exclusive-offer-visual" aria-hidden>
              <span className="exclusive-offer-exclaim">!</span>
              <span className="exclusive-offer-fifty">50%</span>
            </div>
            <div className="exclusive-offer-copy">
              <p className="exclusive-offer-kicker">Exclusive offer</p>
              <h2 id="exclusive-offer-heading" className="exclusive-offer-title">
                Half off registration on qualifying plans
              </h2>
              <p className="exclusive-offer-detail">
                Limited slots this month: save 50% on registration when you reserve selected plots or
                installment blocks. Speak with our team to confirm eligibility.
              </p>
              <Link to="/contact" className="exclusive-offer-cta">
                Claim this offer
              </Link>
            </div>
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
