import { setPublicAssetCssVars } from "@/utils/public-url"

/** Run before `index.css` so `--home-hero-bg` / `--polygon-mask-url` exist on first paint. */
setPublicAssetCssVars()
