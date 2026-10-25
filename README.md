# MOLiR · Moments of Life in Review

Two-page static site, themed for KidSTART Singapore.

- `index.html`: infographic introduction to MOLiR (flourishing, mindset shift, the 5 steps, life chapters, the 4 moves, energy scale, prompts, example)
- `app.html`: builder. Add moments by life chapter and energy level, with remarks per moment; auto insights; reflection notes; Print / Save as PDF (A4 landscape), PNG chart export, save/open `.json`

No build step and no backend. Data stays in the browser (localStorage).

## Logo
Put the KidSTART logo at `assets/kidstart-logo.png`. If that file is missing, the page loads the logo from kidstart.sg, and falls back to a text wordmark.

## Deploy
Push to GitHub, then import the repo in Vercel (Framework preset: Other, no build command).

Framework content: Singapore Polytechnic User Experience Centre, *Design Your Futures* workshop (20 Oct 2026).
