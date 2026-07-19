# Deployment — GitHub Pages (root, multi-page)

This site is a static, multi-page site published with **GitHub Pages** from this repo.

## Layout
```
index.html              # portal hub (categorized tool cards)
privacy.html            # privacy policy (required by AdSense)
robots.txt
sitemap.xml
assets/
  site.css              # shared design system
  site.js               # shared script (footer year + ad push)
tools/
  <slug>.html           # one self-contained page per tool
```

## Publish
1. The repo must be **Public** (GitHub Pages on free/personal accounts requires a public repo).
2. In **Settings → Pages**, set Source = `Deploy from a branch`, Branch = `main`, Folder = `/ (root)`.
3. Push to `main`; GitHub Pages builds automatically (no build step — plain static files).
4. Live URL: `https://housetail.github.io/`

## Important rules
- **Relative paths only** (`./assets/...`, `./tools/...`). The site is published at the GitHub Pages user-site root (`https://housetail.github.io/`), so absolute `/` paths also resolve, but relative paths keep the repo portable.
- AdSense publisher is `ca-pub-8247564773527384`; the single ad slot used is `8137669998`.
- Each tool page is self-contained (its own calc `<script>`); shared CSS/JS live in `assets/`.

## Verify after deploy
- `https://housetail.github.io/` returns 200.
- A sample tool page loads and computes correctly.
- AdSense snippet present on every page with the correct `data-ad-client`.
