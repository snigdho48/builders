import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "@/utils/public-url-init"
import "./index.css"
import "leaflet/dist/leaflet.css"
import App from "./App.tsx"
import { LanguageProvider } from "@/i18n/language-context.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ToastProvider } from "@/components/ui/toast-provider.tsx"

const routerBasename =
  import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
)
