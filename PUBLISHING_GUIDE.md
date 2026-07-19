# Publishing Guide — GitHub Pages

This replaces the old GitLab/Cloudflare instructions. The site now deploys to **GitHub Pages** from this repository.

## 1. Make the repo public
GitHub Pages on a free personal account cannot serve a private repo. In the repo **Settings → General → Visibility**, set the repository to **Public**.

## 2. Enable Pages
1. **Settings → Pages**.
2. Source: `Deploy from a branch`.
3. Branch: `main`, folder: `/ (root)`.
4. Save. The site builds within ~1–2 minutes.

## 3. AdSense
- Publisher ID `ca-pub-8247564773527384` is already in every page (`<meta name="google-adsense-account">` + the ad `<script>`).
- A privacy policy (`privacy.html`) is linked site-wide — required for AdSense approval.
- Wait for AdSense review; real ads appear once the site is approved.

## 4. Local preview
Serve the folder with any static server, e.g.:
```bash
python3 -m http.server 8000
# open http://localhost:8000/
```
Because links are relative, preview works from the repo root.

## 5. Updating
Edit files, `git add -A`, `git commit`, `git push`. Pages redeploys automatically.
