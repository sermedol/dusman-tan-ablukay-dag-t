# GitHub Pages Preview

A read-only, static preview of the **public** Next.js app (`apps/public`), deployed
to GitHub Pages on every push to `düşmanıtanı` that touches `apps/public` or
`packages/ui`, and on demand via `workflow_dispatch`.

This is **not** the production application. It has no PostgreSQL, no Redis, no
Meilisearch, no API server, and no admin panel — GitHub Pages only serves static
files. Its only purpose is letting anyone open the repository and immediately see
the current UI, navigation, layout, and responsiveness without standing up any
infrastructure.

## What it is

- Workflow: `.github/workflows/pages-preview.yml`
- Build mode: `next build` with `output: 'export'` (configured conditionally in
  `apps/public/next.config.js` via `GITHUB_PAGES=true`)
- Data: `NEXT_PUBLIC_PREVIEW_MODE=true` makes every page read from a small,
  clearly-labeled fictitious dataset (`apps/public/src/lib/demo-data.ts` —
  "Demo Holding A", "Demo Şirket B", etc.) instead of calling a live API. A
  dark "Önizleme" banner is shown on every page in this mode
  (`apps/public/src/components/PreviewBanner.tsx`), and `<meta name="robots"
  content="noindex">` is set so search engines don't index the preview as if
  it were the production site.
- Excluded entirely: `apps/admin` (credentials, private research data), the
  API, and any real/unverified records.

## Required one-time manual step

GitHub does not allow enabling Pages via `git push` or through the tools
available in this environment — it requires a repository admin action in the
web UI. This is the **only** manual step; everything else (build, export,
deploy) is automatic.

1. Go to the repository's **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions** (not
   "Deploy from a branch").
3. Save. The next push to `düşmanıtanı` touching `apps/public` (or a manual
   run of the "Pages Preview" workflow from the **Actions** tab) will deploy.

Once that's done, the preview will be available at:

```
https://sermedol.github.io/dusman-tan-ablukay-dag-t/
```

This URL is **not yet confirmed live** as of this writing — it depends on the
manual step above having been completed by a repository admin. Do not treat it
as working until you've verified it loads.

## Local verification

You can build and inspect the exact static export the workflow produces,
without needing GitHub Actions:

```bash
cd apps/public
GITHUB_PAGES=true NEXT_PUBLIC_PREVIEW_MODE=true \
  NEXT_PUBLIC_BASE_PATH=/dusman-tan-ablukay-dag-t \
  NEXT_PUBLIC_API_URL=unused-in-preview-mode \
  pnpm build
npx serve out
```

## Known limitations

- Dynamic detail routes (`/entity/[id]`, `/struggles/[id]`) are statically
  prebuilt only for the handful of demo IDs in `demo-data.ts`
  (`generateStaticParams` in each route's `page.tsx`). Visiting any other ID
  on the static preview 404s — this is expected for a static export and is
  not a bug specific to the preview.
- The map (`/harita`) and graph (`/ag`) pages render with MapLibre GL / Sigma.js
  against the same small demo dataset; they demonstrate layout and interaction
  patterns, not real geographic or relationship data.
- Search (`/search`) does simple client-side substring matching against the
  demo dataset — it does not exercise the real Meilisearch integration.
