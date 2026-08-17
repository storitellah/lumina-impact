# Deploying LUMINA Impact on Cloudflare

The **frontend** runs natively on Cloudflare. The **Python backend** (Playwright,
Redis, Postgres) does **not** run on Cloudflare Workers — see [Backend](#backend) below.

The frontend deploys to **Cloudflare Workers** via the **OpenNext** adapter
(`@opennextjs/cloudflare`) — Cloudflare's actively-maintained path for the
Next.js App Router. Validated end-to-end: `next build` → `opennextjs-cloudflare build`
→ `.open-next/worker.js`.

> **Version note:** the Cloudflare Next.js adapters (both OpenNext v1 and
> `next-on-pages` ≥ 1.13.16) require **Next.js 15+**. The frontend is on Next 15.5 /
> React 19 for exactly this reason. Next 14 + `next-on-pages` fails to bundle
> (`Could not resolve "async_hooks"`), so don't downgrade.

---

## Prerequisites

- A Cloudflare account + **Account ID** (Workers & Pages → right sidebar).
- An **API token** with the *Edit Cloudflare Workers* template
  (My Profile → API Tokens → Create Token).
- Node 20+.

---

## Option 1 — Cloudflare-managed builds (Git integration) · recommended

Cloudflare builds and deploys on every push; no CI secrets to manage.

1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** →
   select `storitellah/lumina-impact`.
2. Build settings:
   - **Root directory:** `frontend`
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx wrangler deploy`
   - (Wrangler settings are read from `frontend/wrangler.toml`.)
3. **Environment variables** (Settings → Variables) — set for *Production* and *Preview*:
   - `NEXT_PUBLIC_API_BASE` — your backend URL, or **leave empty** to serve the
     built-in verified mock dataset (fully interactive, no backend needed).
   - `NEXT_PUBLIC_DISPATCH_EMAIL` — `hello@storitellah.com`
   - `NODE_VERSION` — `20`

   > `NEXT_PUBLIC_*` values are inlined at **build** time, so they must exist in
   > the build environment — not just in `wrangler.toml`.
4. Save & Deploy. Every push to the production branch ships; PRs get preview URLs.

## Option 2 — Deploy from your machine (Wrangler CLI)

```bash
cd frontend
npm ci
npx wrangler login                 # one-time
npm run cf:preview                 # build + run locally in the workerd runtime
npm run cf:deploy                  # build + publish to Cloudflare Workers
```

## Option 3 — GitHub Actions

`.github/workflows/deploy-cloudflare.yml` builds and deploys on push to `main`.
Add two repository **secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | token with *Edit Cloudflare Workers* |
| `CLOUDFLARE_ACCOUNT_ID` | your account id |

Optionally add repo **variables** `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_DISPATCH_EMAIL`
(they feed the build step).

---

## Local scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Next.js dev server (Node) |
| `npm run build` | Standard Next.js production build |
| `npm run cf:build` | OpenNext → `.open-next/worker.js` |
| `npm run cf:preview` | Build + serve in the Cloudflare `workerd` runtime |
| `npm run cf:deploy` | Build + `wrangler deploy` to Workers |

Copy `frontend/.dev.vars.example` → `frontend/.dev.vars` for local runtime vars.

## Custom domain

Workers & Pages → your Worker → **Settings → Domains & Routes → Add custom domain**
(e.g. `radar.storitellah.com`). Cloudflare provisions TLS automatically.

## Optional: R2 incremental cache (production ISR)

```bash
npx wrangler r2 bucket create lumina-impact-cache
```
Uncomment the `[[r2_buckets]]` block in `wrangler.toml` and switch on the R2
cache in `open-next.config.ts` (snippet included in that file).

---

## Backend

The FastAPI service uses **Playwright/headless Chromium** (UNGM crawler),
**pdfplumber/python-docx**, **SQLAlchemy + Postgres**, and **Redis/RQ workers** —
none of which run on Cloudflare Workers. Two options:

1. **Keep Python, host elsewhere (recommended).** Run `backend/` on a container
   host (Render / Railway / Fly): a web process (`uvicorn app.main:app`), a worker
   process (`rq worker ...`), managed Postgres and Redis. Then point the
   frontend's `NEXT_PUBLIC_API_BASE` at it. Cloudflare still fronts DNS/CDN/WAF.
   The crawler needs `playwright install --with-deps chromium` in its build.

2. **Rewrite Cloudflare-native.** Rebuild the API as TS Workers with **D1** or
   **Hyperdrive→Postgres**, **Queues + Cron Triggers** in place of Redis/RQ, and
   **Browser Rendering** for scraping. This replaces the Python crawlers/extraction
   with TypeScript — a substantial rewrite, not a config change.

Until a backend is wired up, the frontend runs fully on its built-in mock dataset.
