import { type FormEvent, useState } from "react"

import { RevealOnView } from "@/components/motion/reveal-on-view"

const APP_DEEP_LINK = "https://sy.sqweb.in/zbhohupp"
const GOOGLE_PLAY_IMG = "https://www.squareyards.com/assets/images/app-download/google-play.svg"
const APP_STORE_IMG = "https://www.squareyards.com/assets/images/app-download/app-store.svg"
const QR_IMG = "https://www.squareyards.com/assets/images/app-download/qr-code-v-two.svg"
const DESKTOP_SCREEN_IMG =
  "https://www.squareyards.com/assets/images/app-download/desktop-app-screen-v-two.png"

export function AppDownloadSection() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
    window.open(APP_DEEP_LINK, "_blank", "noopener,noreferrer")
  }

  return (
    <section className="white-box app-download landing-section" aria-labelledby="app-download-heading">
      <div className="landing-inner">
        <RevealOnView className="w-full" variant="fade-up">
          <div className="app-download-box">
            <div className="app-download-body">
              <h2 id="app-download-heading" className="app-download-title">
                Real Estate in your pocket
              </h2>
              <p className="app-download-lead">
                With our app, spend less time searching and more time at your dream home.
                <strong> Download now!</strong>
              </p>

              <form
                className="app-download-input-box"
                autoComplete="off"
                id="dekstopAppDownloadForm"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="countryCode" value="91" readOnly />
                <input type="hidden" name="appLink" value={APP_DEEP_LINK} readOnly />
                <span className="app-download-mobile-input">
                  <input
                    autoComplete="tel"
                    type="tel"
                    name="mobileNumber"
                    placeholder="Enter Mobile number"
                    className="app-download-field"
                    maxLength={15}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    aria-label="Mobile number"
                  />
                </span>
                <button type="submit" className="app-download-send-btn">
                  Send Link
                </button>
              </form>

              {sent ? (
                <p className="app-download-feedback" role="status">
                  Store opened in a new tab. You can also scan the QR code below.
                </p>
              ) : null}

              <ul className="app-download-list">
                <li>
                  <a href={APP_DEEP_LINK} target="_blank" rel="noopener noreferrer">
                    <img
                      className="app-download-badge-img"
                      loading="lazy"
                      decoding="async"
                      src={GOOGLE_PLAY_IMG}
                      width={163}
                      height={48}
                      alt="Google Play"
                    />
                  </a>
                </li>
                <li>
                  <a href={APP_DEEP_LINK} target="_blank" rel="noopener noreferrer">
                    <img
                      className="app-download-badge-img"
                      loading="lazy"
                      decoding="async"
                      src={APP_STORE_IMG}
                      width={148}
                      height={48}
                      alt="App Store"
                    />
                  </a>
                </li>
                <li className="app-download-qr-item">
                  <img
                    className="app-download-qr-img"
                    loading="lazy"
                    decoding="async"
                    src={QR_IMG}
                    width={240}
                    height={118}
                    alt="App Scanner"
                  />
                  <p className="app-download-qr-caption">
                    Open camera &amp; scan the QR code to Download the App
                  </p>
                </li>
              </ul>
            </div>

            <figure className="app-download-figure">
              <img
                className="app-download-screen-img"
                loading="lazy"
                decoding="async"
                src={DESKTOP_SCREEN_IMG}
                width={558}
                height={364}
                alt="Squareyards app screen"
              />
            </figure>
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
