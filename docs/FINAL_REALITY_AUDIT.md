# Final Reality Audit

This document distinguishes what is **actually verified** in this repository from
what is merely documented, scaffolded, or claimed. It reflects one audit session
(2026-08-07) and covers what was directly inspected and run — it is not a
complete audit of the entire 47-area production mandate; see "Not audited this
session" at the end for an honest list of what remains unchecked.

Verification method: commands were actually executed (`pnpm install/lint/
type-check/test/build`, `next build` in static-export mode, `npx tsc --noEmit`
per-package, `npx jest`), not inferred from documentation or file presence.

## Verification matrix

| Feature | Documented? | Code exists? | Builds? | Tested? | Runtime verified? | Production ready? | Problem | Action taken |
|---|---|---|---|---|---|---|---|---|
| Monorepo install (`pnpm install`) | Yes | Yes | Yes | — | Yes | Yes | `jsonwebtoken@^9.1.2` doesn't exist (latest is 9.0.3); `@meilisearch/sdk` doesn't exist on npm (real package is `meilisearch`) | Fixed both version pins |
| Prisma schema | Yes | Yes | **No** (failed to generate) | — | Yes (now) | Yes (now) | 4 real schema bugs: `Visibility` enum missing `draft` (used as a default), invalid `@@check` attribute, two polymorphic relations (`Revision`, `RecordOrigin`) referencing one FK column from 3 different relations (unsupported by Prisma), missing opposite relation on `Entity.primaryLocation` | Fixed all 4; `prisma generate` now succeeds |
| `TimelineEvent` model | Yes (API repository code assumed it existed) | **No** (was completely absent from schema) | N/A | N/A | N/A | Repository code (`timeline-event.repository.ts`) referenced `Prisma.TimelineEventCreateInput` for a model that didn't exist — this would only surface as a build failure, and only once the schema itself parsed | Added the model with proper indexes and relations |
| `apps/api` type-check | Yes ("Phase D" docs claimed completion) | Yes | **No** (100+ errors) | — | — | No → Yes | Broken `@umut-sen/*` import paths (should be `@umutsensen/*`), missing workspace deps, missing `ioredis`/`meilisearch`/`rxjs`/`reflect-metadata`, Prisma enum drift, several `TS6133`/`TS7030` violations | Fixed all; `apps/api` type-checks cleanly |
| `apps/admin` type-check | Implied by "Phase B" docs | Yes | **No** | — | — | No → Yes | Never had a passing type-check run; missing `@dusman/ui`/`clsx`/`react-icons`/`tailwindcss` deps that the code already imported | Fixed; type-checks and builds cleanly |
| `apps/public` type-check | Not mentioned in docs at all | Yes (fairly complete: map, graph, search, entity/struggle pages) | **No** (no `type-check` script existed — silently skipped by turbo) | — | — | No → Yes | Real bugs hidden by the missing script: duplicate incompatible `Location` type, `useSearchParams()` without `Suspense` (hard build failure under static export/prerendering), duplicated `viewport` meta | Added `type-check` script, fixed all real bugs; builds cleanly in both normal and static-export mode |
| `packages/database` type-check | N/A | Yes (seed script only) | **No** (no `type-check` script) | — | — | No → Yes | 10 unused-variable errors once actually checked | Added script, fixed |
| Meilisearch integration | "SDK-ready" per `PRODUCTION_CHECKLIST.md` | Yes, but was **100% commented-out stub code** (`// const index = this.client.index(...)`) | Yes (it was dead code, so it "built") | No | **No — never actually called the SDK** | No | Every method in `meilisearch.service.ts` had its real logic commented out and fell through to a mock/empty result | Installed the real `meilisearch` package and wired every method (search, index, remove, update, clear, create-indexes) to the actual client. Still **not runtime-verified** — no live Meilisearch instance in this environment (see below) |
| Redis caching | "Production-ready" per docs | Yes, real `ioredis` usage | Yes | No | **No** | Partially | `ioredis` was used in code but was never declared as a dependency — this would fail at runtime (not just type-check) the moment `RedisService.onModuleInit` ran | Added the dependency. Not runtime-verified against a live Redis (no daemon in this environment) |
| PostGIS geo queries | "Query-ready" per docs | Yes (`findNearby`, Haversine, bounding box) | Yes | No | **No** | Unknown | — | Not touched this session; flagged as unverified |
| `apps/api` test suite (`pnpm test`) | "GitHub Actions test job with coverage" per docs | Yes | N/A | **No — script was broken** | — | No → Yes | `test` script ran `node --test` via a `tsx` loader that wasn't a dependency (`ERR_MODULE_NOT_FOUND` on every invocation); the one file it targeted imported `expect` from `node:test` (not a real export) and used a pre-refactor constructor signature | Deleted the dead file (fully superseded by a working Jest suite that already existed but was never run), pointed `test` at Jest, renamed `jest.config.js`→`.cjs` (ESM/CJS conflict). **8/8 tests now genuinely pass** |
| CI (`.github/workflows/ci.yml`) | "Enhanced" per docs | Yes | Not re-verified this session | — | Not re-verified | Unknown | The lint/type-check/test/build steps it runs would all have failed before this session's fixes | Not re-triggered; should be expected to pass now given the local gate is green, but that's an inference, not a verified fact |
| GitHub Pages static preview | Requested this session, not previously documented | **Yes — built this session** | Yes (verified locally: `next build` with `output: 'export'`) | N/A | Locally verified (basePath-prefixed assets, 14 HTML files incl. demo detail pages) | Yes, pending one manual step | GitHub Pages requires a one-time manual repo-settings change (Settings → Pages → Source → GitHub Actions) that cannot be done from this session | Workflow, static-export config, demo dataset, and preview banner all implemented and locally verified; **actual deployed URL is unconfirmed** — see `docs/GITHUB_PAGES_PREVIEW.md` |
| Google Drive ingestion | "Multi-source import pipeline" claimed complete (Phase C docs) | **No — zero code found** | N/A | N/A | N/A | No | A repo-wide search for `google.*drive`, `googledrive`, `drive.*sync` across `apps/` and `packages/` returned nothing. The import module (`apps/api/src/modules/imports`) supports CSV/Excel/JSON parsing via `data-processor.service.ts`, but there is no `ExternalFileProvider` abstraction, no `GoogleDriveProvider`, no OAuth flow, no sync job | Not implemented this session — this is a from-scratch feature (OAuth, provider abstraction, sync scheduling, conflict detection) requiring real design decisions and credentials, not a bug fix |
| Infrastructure (Postgres/PostGIS/Redis/Meilisearch/MinIO) runtime | "Verify PostgreSQL... Redis... Meilisearch..." (explicit ask) | `docker-compose.yml` exists and defines all 5 services reasonably | N/A | N/A | **No — Docker daemon unavailable in this execution environment** (`docker` CLI present, `/var/run/docker.sock` not running, no permission to start dockerd) | Unknown | Cannot start the daemon in this sandboxed remote session | Documented honestly rather than faked; this needs to be run in an environment with real Docker access |
| Git attribution (Contributors graph) | User explicitly requested Claude not appear anywhere | 85 of 87 commits on the default branch were authored **and committed** as `Claude <noreply@anthropic.com>` (not just `Co-Authored-By` trailers) | N/A | N/A | Verified via `git log --format` before/after | Done | This was a real, deep problem — GitHub's Contributors graph is driven by author identity, not just trailers | Created local safety tag + recorded pre-rewrite SHA (`pre-attribution-cleanup-20260807` → `6e9b785`, tag push to remote failed with a 403 from the git proxy but the local tag and `refs/original/refs/heads/düşmanıtanı` backup ref both still exist), rewrote all 85 commits' author+committer identity to `sermedol <130979658+sermedol@users.noreply.github.com>` (the only non-Claude identity already legitimately present in this repo's history) via `git filter-branch`, stripped `Co-Authored-By`/`Claude-Session` trailers via `--msg-filter`, verified the resulting tree is byte-identical to the pre-rewrite tree (`git diff` empty), verified commit count unchanged (47 on the affected range), force-pushed. New default-branch HEAD: `b55617f` (superseded by further work this session; see current HEAD below) |

## Not audited this session

Per the original 47-section mandate, the following were **not** inspected,
built, tested, or verified in this pass and should not be assumed complete:

- Evidence-first data model deepening (field-level evidence, temporal
  `valid_from`/`valid_until` on relations/aliases)
- Verification workflow end-to-end exercise (draft → review → publish →
  rollback) — code exists in `apps/api/src/modules/verification`, not
  runtime-tested
- Admin panel UX flows (bulk actions, conflict resolution, revision diff) —
  routes exist, not exercised
- Excel/CSV template versioning (`entities.xlsx`, `relations.xlsx`, etc.)
- Record origin / provenance conflict handling on re-import
- Search Turkish-character edge cases (İ/i, I/ı, Ş/ş, etc.) — not tested
  against a live Meilisearch instance
- Object storage (MinIO/S3) upload/download/checksum flows
- Full OWASP-style security review (IDOR, CSRF, JWT/cookie config, rate
  limiting effectiveness, dependency vulnerability scan)
- E2E tests (Playwright) — not present in the repo; not written this session
- Load/performance testing against synthetic 10k/100k-record datasets
- Backup/restore (`pnpm platform:export`) — does not exist; not built
- Static public mirror (`pnpm public:build-mirror`, distinct from the Pages
  preview) — not built
- Accessibility audit (WCAG 2.2 AA, keyboard navigation, screen reader)
- SEO/sitemap/structured data for the production public site (as opposed to
  the noindex'd preview)
- `packages/database`'s architecture (Prisma schema + seed only, no
  `PrismaService`/NestJS wrapper — each app maintains its own local
  `PrismaService`). This is plausibly reasonable but was not deeply
  evaluated against the "modular monolith" target architecture in the
  mandate
- `Source.updatedBy` — Entity/Relation/Struggle all have `createdBy`/
  `updatedBy`; `Source` only has `createdBy`. Not yet reconciled.

## Bottom line

This session found and fixed real, previously-undetected breakage: the
Prisma schema did not generate, `apps/api` did not type-check, `apps/admin`
did not type-check, `apps/public` was never type-checked at all (and had a
build-breaking bug as a result), and `pnpm test` had been silently failing
since before the Jest suite it was supposed to run existed. All of that is
now genuinely green, verified by running the commands, not by inspecting
config files and assuming they work.

The platform is materially further from "production ready" than the
pre-session documentation (`PRODUCTION_CHECKLIST.md`, claiming "Phase D: 85%
Complete") suggested, precisely because that documentation was written
without ever running a clean install/build/test cycle. Treat percentage
claims in older docs in this repository with skepticism until re-verified.
