# Sinwar-7 Project Report

Last updated: 2026-10-11

## Project objective

Build a static-first, accessible web application for searching a curated list of public Instagram accounts and keeping a private, local block checklist. The tone stays neutral and educational. The frontend is planned for Vercel. Supabase is the chosen backend for the later backend phase, with SQL migrations stored in the repository.

## Project-wide working method

- Keep this file as the project memory point. Update it for each approved project prompt with the plan, actions, files changed, checks, completion status, and next step.
- Work one phase at a time and stop at each phase boundary for review.
- Do not process or rewrite the current account list until its data phase.
- Keep runtime image behavior static-first. Any later image enrichment must use a provider-supported API and caching, respect documented limits and terms, and avoid random timing intended to evade bot detection. Use generated initials when an image is unavailable.

## Current source and decisions

- User clarified on 2026-10-09 that the current workspace file `Accounts to Block.txt` is the latest list and any previously uploaded list is stale. Preserve the workspace list verbatim until the data phase; Phase 0 did not process it.
- Supabase is selected. The backend phase will include SQL migration files for the schema, indexes, row-level security, and policies, plus server-side API access.
- User is open to low-frequency image enrichment through an API. Any implementation will cache images and respect provider limits and terms; it will not randomize requests to evade bot detection. No image requests are made during Phase 0.
- The initial scaffold uses exact package versions in `package.json`. Add feature-specific packages in the phase that first uses them.

### Supabase configuration for the later backend phase

- Project URL supplied by the user: `https://ncdkujrjcrdarjijeteg.supabase.co`.
- Publishable key supplied by the user: `sb_publishable_k7XPQYmn-paxXn2v58DJoA_4EGJK9Fb`.
- The supplied variable names use `NEXT_PUBLIC_`. The current app does not connect to Supabase from the browser: Vercel API functions read `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from server runtime settings so that the read-only routes use the database's `anon` grants and RLS policies. A future browser client would use Vite's `VITE_` prefix for its publishable key.
- This is a publishable key, not a service-role key. Never put a service-role key in client code or this report.
- `@supabase/supabase-js` and `@supabase/ssr` were installed in Phase 4 as requested. The server routes use `@supabase/supabase-js`; no browser session/auth flow exists yet, so `@supabase/ssr` is not imported by the app.

## Phase plan

| Phase | Scope                                                                | Status   |
| ----- | -------------------------------------------------------------------- | -------- |
| 0     | Vite/React/TypeScript scaffold, theme, app shell, route placeholders | Complete |
| 1     | Responsive shell polish and navigation behavior                      | Complete |
| 2     | Static search, profile cards, personal blocked list                  | Complete |
| 3     | Account data pipeline, validation, cleaning report                   | Complete |
| 4     | Supabase schema/SQL migrations and secure server-side search         | Complete |
| 5     | Educational story and timeline                                       | Complete |
| 6     | Feature-gated Donate and Stores & Apps sections                      | Complete |
| 7     | Performance, SEO, and PWA                                            | Complete |
| 8     | Tests, CI/CD, launch documentation                                   | Complete |

## Phase 0 plan

1. Create the Vite + React 18 + TypeScript scaffold with Tailwind, React Router, ESLint, Prettier, and a test command.
2. Set up the requested `src/` structure and placeholder routes.
3. Implement the CSS token palette, mirrored Tailwind colors, system theme detection, localStorage persistence, and a pre-render theme script.
4. Build the header, responsive navigation panel/drawer, route outlet, and footer with the quiet disclaimer.
5. Run lint, typecheck, tests, and production build; record outcomes below.
6. Stop at the Phase 0 boundary for review.

## Phase 0 execution log

- 2026-10-09: User approved Phase 0. Added the pinned Vite/React/TypeScript/Tailwind toolchain and generated `package-lock.json`.
- Added the theme token system, system preference detection, persistent `sinwar7:theme` selection, and pre-render script to avoid a theme flash.
- Added placeholder routes, home/search entry, desktop sidebar, keyboard-operable mobile drawer, reduced-motion handling, and disclaimer footer.
- Added a low-opacity SVG Palestinian motif to the hero and footer.
- Added one unit test covering saved-theme precedence and system preference fallback.
- Checks passed: `npm ls --depth=0`, `npm run lint`, `npm run typecheck`, `npm run test` (1 file, 2 tests), `npm run build`, and `npm run format:check`.
- Production build output: main JavaScript bundle is 56.81 KB gzipped; CSS is 4.22 KB gzipped.
- The current list `Accounts to Block.txt` was preserved unchanged. No runtime or build-time image requests were made.

### Files added or changed in Phase 0

- Root: `.gitignore`, `.prettierrc.json`, `Project_Report.md`, `eslint.config.js`, `index.html`, `package.json`, `package-lock.json`, `postcss.config.cjs`, `tailwind.config.ts`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`.
- App entry and routing: `src/main.tsx`, `src/App.tsx`.
- Components: `src/components/AppShell.tsx`, `NavigationPanel.tsx`, `SiteFooter.tsx`, `SiteHeader.tsx`, `ThemeToggle.tsx`.
- Theme: `src/hooks/useTheme.tsx`, `src/lib/theme.ts`, `src/lib/theme.test.ts`, `src/styles/theme.css`.
- Pages: `src/pages/AboutPage.tsx`, `BlockedPage.tsx`, `HomePage.tsx`, `NotFoundPage.tsx`, `PlaceholderPage.tsx`, `ProfilePage.tsx`.
- Asset: `src/assets/palestinian-motif.svg`.

## Phase 1 plan

1. Make navigation available at all viewports below 1024px and keep the desktop panel at 1024px and wider.
2. Verify active route states, mobile drawer focus containment/restoration, Escape handling, and background scroll behavior.
3. Add reusable skeleton and empty-state components and a route-level error boundary.
4. Review the shell at 320, 375, 768, 1024, 1440, 1920, and ultrawide widths.
5. Run lint, typecheck, tests, formatting, and production build; record results below.
6. Stop for review before Phase 2.

## Phase 1 execution log

- 2026-10-09: User explicitly authorized continuing after Phase 0. The supplied Supabase project URL and publishable key remain recorded above for Phase 4; no backend code was added in Phase 1.
- Made the navigation drawer available below 1024px and kept the desktop sidebar at 1024px and wider. Profile routes now show Search as the current navigation item, including its `aria-current` state.
- Improved the mobile drawer with a modal dialog label, hidden background content, body scroll lock, focus containment, Escape dismissal, and focus restoration to the menu button.
- Added reusable empty-state and profile-loading skeleton components, route-level error fallback, and reduced-motion-aware shimmer styling.
- Removed the fixed 320px minimum document width after viewport review found it caused horizontal overflow when a classic vertical scrollbar reduced the layout width. The layout now fits the available width.
- Verified responsive layouts at 320, 375, 768, 1023, 1024, 1440, 1920, and 2560px. No horizontal overflow was measured. The mobile drawer was checked for initial focus, Tab/Shift+Tab containment, background scroll lock, Escape dismissal, and focus restoration. Search was checked as current on a profile route in desktop and tablet navigation.
- Checks passed: `npm run lint`, `npm run typecheck`, `npm run test` (1 file, 2 tests), `npm run build`, and `npm run format:check`.
- The temporary development preview emitted React Router v7 future-flag advisories; there were no app runtime errors. The temporary preview server was stopped after review.

### Files added or changed in Phase 1

- Components added: `src/components/EmptyState.tsx`, `src/components/ProfileSkeletonGrid.tsx`, `src/components/RouteErrorBoundary.tsx`.
- Components changed: `src/components/AppShell.tsx`, `src/components/NavigationPanel.tsx`, `src/components/SiteHeader.tsx`.
- Page changed: `src/pages/PlaceholderPage.tsx`.
- Styles changed: `src/styles/theme.css`.
- Project memory updated: `Project_Report.md`.

## Phase 2 plan

1. Add an explicitly labeled, synthetic 20-account dataset at the final import path without reading or changing `Accounts to Block.txt`.
2. Add Zod schemas for account records and versioned local blocked-list storage, plus Fuse.js search with exact/prefix username priority and weighted fuzzy matching.
3. Build a reusable profile card and avatar fallback that uses local bundled images only when available, otherwise generated initials; make copy and block actions accessible.
4. Implement debounced search, Cmd/Ctrl+K focus, Escape-to-clear, category filters, result announcements, and profile detail routes.
5. Implement the versioned `sinwar7:blocked` localStorage hook and blocked-list management page with progress count.
6. Run the phase quality gate and responsive review, record files/checks/results, then stop for review before Phase 3.

## Phase 2 execution log

- 2026-10-09: User approved continuing the project. Completed Phase 2 and stopped at its review boundary. `Accounts to Block.txt` was not opened, parsed, or modified; its processing remains Phase 3 work. No external image/API requests were made.
- Installed `fuse.js`, `zod`, and `motion`. Added 20 clearly labeled synthetic demo profiles; no real-account claims are made by the preview dataset.
- Implemented validated account records, username-first exact/prefix/fuzzy search, weighted display-name/tag search, 200 ms debounce, 2-character minimum, category filters, URL query state, and Ctrl/Cmd+K focus / Escape-to-clear behavior.
- Implemented profile detail pages, locally generated initials in place of remote avatars, copy controls, and add/remove block-list controls. Blocked usernames are normalized and persisted as versioned state in `sinwar7:blocked`; malformed/unavailable storage falls back safely, and the page reports storage write failures.
- Added blocked-list management and progress counts, synthetic-data notices, and responsive styling. The app remains static-first in this phase.
- Browser review: exact username search ranked first; fuzzy search returned the expected matching profiles; category filter returned the three athlete demos; a one-character query displayed the two-character minimum; Escape cleared the query and removed `q` from the URL; Ctrl/Cmd+K focused search; profile block add/remove and persistence across reload were verified. Search, profile, and blocked-list screens were reviewed at a 320 px viewport. Home had no horizontal overflow in the measured 320 px review.
- Quality gate passed: `npm run lint`, `npm run typecheck`, `npm run test` (1 file, 2 tests), `npm run format:check`, and `npm run build`.
- Production bundle: JavaScript 424.61 KB raw / 133.63 KB gzip; CSS 22.01 KB raw / 5.65 KB gzip; HTML 1.43 KB raw / 0.59 KB gzip.
- Browser preview logged the two known React Router v7 future-flag advisories; no app runtime errors were observed.
- Dependency audit limitation: installation reported 10 advisories (2 moderate, 8 high). `npm audit --json` could not reach `registry.npmjs.org` (`ENOTFOUND`), so exact package details and production impact could not be confirmed. No automatic dependency upgrades were applied.

### Files added or changed in Phase 2

- Root: `package.json`, `package-lock.json`, `Project_Report.md`.
- App and pages changed: `src/App.tsx`, `src/components/AppShell.tsx`, `src/pages/HomePage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/BlockedPage.tsx`, `src/styles/theme.css`.
- Components added: `src/components/AccountAvatar.tsx`, `AccountCardGrid.tsx`, `DatasetNotice.tsx`, `ProfileCard.tsx`, `SearchBar.tsx`.
- Search and settings added: `src/config/search.ts`, `src/lib/searchAccounts.ts`, `src/hooks/useDebouncedValue.ts`.
- Account and local storage added: `src/data/accounts.json`, `src/data/accounts.ts`, `src/types/account.ts`, `src/lib/blockedStorage.ts`, `src/hooks/useBlockedAccounts.ts`.
- Page added: `src/pages/SearchPage.tsx`.

### Supabase key safety note

- The user asked whether the project URL and `sb_publishable_...` key can be public in a GitHub repository. Supabase documents publishable keys as intended for public client code; security depends on enabling RLS for exposed tables, granting only required operations, and writing least-privilege policies. Secret/service-role keys bypass RLS and must remain server-side. No backend integration was added in Phase 2. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) and [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Phase 3 plan

1. Inspect the current root `Accounts to Block.txt` format and determine a deterministic parser without changing source content.
2. Move the latest source verbatim to `data/raw/accounts_to_block.txt` as specified in the approved project brief; retain a checksum in the report to verify its bytes were preserved.
3. Add a `tsx` data-build script that trims handles, strips `@`, deduplicates case-insensitively, preserves original username casing where present, and flags invalid entries and known typo candidates for manual review; add unit coverage for these cleaning rules.
4. Validate normalized records with Zod and emit `src/data/accounts.json` plus `data/reports/cleaning-report.json`, including every skipped or flagged source row and reason.
5. Add `data:build` and `data:validate` scripts, including a >10% dataset-drop guard against the last successful build; keep image enrichment disabled so Phases 1–3 remain offline and static-first. Bound rendered search results so the full dataset does not create thousands of profile-card DOM nodes at once.
6. Run lint, typecheck, tests, formatting, build, and data validation; record files/results in this report, then stop for review before Phase 4.

## Phase 3 execution log

- 2026-10-09: User authorized the next phase. Phase 3 is in progress. Plan recorded before processing the source list.
- Moved the root list to `data/raw/accounts_to_block.txt` byte-for-byte. The SHA-256 is `b4c81d56abfe1e363c6497170a94f170ba793959ba91a7884ff92061b56d3b83` before and after the move.
- Source inspection found 4,074 rows: 4,073 valid unique usernames, no duplicates, one invalid handle (`lizgillz?`) skipped with a report entry, and one known possible-typo handle (`bradleycooperroffical`) retained with a manual-review warning. Two source entries use mixed case; their original casing is preserved while IDs are lowercase.
- Source rows contain usernames only. Imported display names remain null; category is `other`; tags are empty; no verification, identity, category, or avatar data is inferred. Avatar enrichment and runtime image requests are disabled.
- Added cleaning, build, and validation scripts, a successful-count baseline, and unit tests. Installing the requested `tsx` runner failed because npm registry DNS resolution returned `ENOTFOUND`; scripts use Node's built-in TypeScript stripping, supported by the repository's Node >=22.12 engine, and keep the requested `.ts` entry points.
- Added 48-at-a-time rendering to search results so the full directory does not mount thousands of profile cards at once.

### Phase 3 results and verification

- `npm run data:build` generates the full dataset and cleaning report. `npm run data:validate` checks every generated record with Zod, confirms source/report hashes and counts, verifies unique IDs and report issue totals, enforces the 10% drop guard, and records the last successful account count. `npm run build` runs both data commands through `prebuild`.
- The validated output contains 4,073 accounts. The source has 4,074 rows. The malformed row `lizgillz?` is excluded and explicitly reported; `bradleycooperroffical` remains unchanged in the dataset with a manual-review note. No duplicates were found.
- A small unit suite covers username normalization, casing preservation, duplicate and invalid-row handling, typo flags, terminal newlines, count-drop limits, and search ranking. Quality gate passed: `npm run lint`, `npm run typecheck`, `npm run test` (3 files, 7 tests), `npm run format:check`, and `npm run build`.
- Direct Fuse.js timing over the 4,073-record dataset, using 96 exact-username queries after warm-up on the development machine, measured 10.19 ms median and 26.69 ms maximum. This is a local benchmark, not a measurement on a mid-range phone.
- Production build output: JavaScript 1,144.52 KB raw / 186.05 KB gzip; CSS 22.21 KB raw / 5.68 KB gzip; HTML 1.43 KB raw / 0.59 KB gzip. The JavaScript bundle stays below the 200 KB gzip target. Vite reports a raw minified chunk size warning (>500 KB); code splitting remains planned for Phase 7.
- Full-dataset browser review could not be completed: the sandbox denied local loopback socket access and the in-app browser timed out connecting to the temporary preview. The preview server was stopped. Build, schema/data validation, unit tests, and the Fuse benchmark succeeded.
- `tsx` could not be installed because the npm registry DNS lookup returned `ENOTFOUND`. The scripts remain TypeScript entry points and run with Node's built-in `--experimental-strip-types`; this is compatible with the repository's Node >=22.12 engine. No new dependency or lockfile change was made.

### Files added or changed in Phase 3

- Root and source data: `package.json`, moved `Accounts to Block.txt` to `data/raw/accounts_to_block.txt`, `src/data/accounts.json`, `src/data/accounts.ts`, `Project_Report.md`.
- Pipeline and reports: `scripts/build-accounts.ts`, `scripts/validate-accounts.ts`, `data/reports/cleaning-report.json`, `data/reports/account-count-baseline.json`.
- Cleaning and tests: `src/lib/accountCleaning.ts`, `src/lib/accountCleaning.test.ts`, `src/lib/searchAccounts.test.ts`.
- UI changes for the full directory: `src/components/DatasetNotice.tsx`, `src/components/SearchBar.tsx`, `src/config/search.ts`, `src/pages/HomePage.tsx`, `src/pages/SearchPage.tsx`, `src/pages/BlockedPage.tsx`, `src/styles/theme.css`.

## Current completion and next step

Phases 0 through 8 are complete (9 of 9 planned phases). Phase 5 delivered the sourced historical timeline at `/story`, filterable by period, plus the methodology note on `/about`. Phase 6 added independently gated Donate and Stores & Apps sections. Phase 7 added lazy route loading, SEO metadata and crawl endpoints, and an offline-capable app shell. Phase 8 added API/configuration tests, GitHub Actions CI, and Vercel launch documentation. Stop here for user review. Vercel environment/domain configuration, GitHub branch protection, and a live deployment smoke check remain external launch steps.

## Phase 4 plan

1. Review the existing account shape, local Fuse search, routing, TypeScript and Vercel deployment setup; preserve the static dataset as a validated fallback.
2. Add Supabase SQL migration and seed files for the 4,073 validated accounts, with indexes, RLS enabled, and only the required read grants/policies. No client-side database access or public write policy.
3. Add same-origin Vercel serverless routes for search and account lookup. Validate input with Zod, bound pagination, apply a best-effort 60 requests/minute per-IP limit, use server-only Supabase credentials, and avoid logging/echoing request input.
4. Change client search/profile loading to try the API first and fall back to the bundled dataset on network/API failures. Fallback telemetry, if implemented, contains no query, IP, or user identifier.
5. Add safe environment examples, deployment/security guidance, and required response headers; never commit a Supabase secret.
6. Run data validation plus lint, typecheck, tests, formatting, and production build. Update this report with actual results and the Phase 4 file list, then create one Phase 4 commit using the requested two `-m` arguments. Stop before Phase 5.

### Phase 4 execution log

- 2026-10-09: User authorized continuing to Phase 4 and requested an individual phase commit with a short subject plus a second `-m` description. The working tree and index were clean at the start; prior commits were already on `master` and matched `origin/master`.
- Reviewed current Vercel Node.js Function docs and Supabase server-side secret-key, API security, and RLS guidance. Installed the requested `@supabase/supabase-js` and `@supabase/ssr` packages. The first sandboxed npm install could not resolve the registry; retrying the user-authorized install with network access succeeded. npm reported 10 dependency advisories (2 moderate, 8 high); no automatic upgrades were applied.
- Added `public.accounts` schema, validation constraints and indexes, RLS with read-only anon/authenticated grants, a `SECURITY INVOKER` search RPC, and deterministic seed generation for all 4,073 validated accounts. The generated `supabase/seed.sql` is 423,196 bytes and uses idempotent upserts. `npm run build` regenerates the seed after rebuilding and validating the source dataset.
- Added same-origin Vercel routes `GET /api/search` and `GET /api/account/:username`. Zod validates request parameters and API payloads, pagination is bounded, routes return generic errors, search is uncached, account detail responses are CDN-cached for one day, and each route applies a best-effort 60 requests/minute in-memory IP limit. That limit is per warm function instance, not a distributed quota.
- Search and profile detail views now use the API first and fall back to the bundled JSON/Fuse search on request or response errors. The client emits one generic `account_api_fallback` console event per page context without a query, username, IP, or user identifier.
- Added `.env.example`, `SECURITY.md`, Vercel security headers, and moved the pre-render theme setup to an external script so the CSP can disallow inline scripts. The known Supabase URL is included in the example; a secret key is not available in this workspace and must be set in Vercel as `SUPABASE_SECRET_KEY` (legacy `SUPABASE_SERVICE_ROLE_KEY` is supported). No secret was committed.
- Verification passed: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run db:seed:build` (4,073 schema-validated rows), and `npx vite build`. The client bundle is 1,153.54 KB raw / 188.39 KB gzip; CSS is 22.21 KB raw / 5.68 KB gzip; HTML is 0.64 KB raw / 0.37 KB gzip. Vite retains the existing raw JavaScript chunk-size warning (>500 KB); the gzip bundle remains below 200 KB.
- The unit test suite was not run. The migration was reviewed but not applied to the remote Supabase project; neither a Supabase CLI nor `psql` is installed, and no server secret is available. The frontend production build was run directly with Vite rather than `npm run build`, to avoid rewriting the Phase 3 generated audit timestamps during this phase.

### Files added or changed in Phase 4

- Root/deployment/security: `.env.example`, `SECURITY.md`, `Project_Report.md`, `eslint.config.js`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vercel.json`.
- Vercel API and server client: `api/search.ts`, `api/account/[username].ts`, `server/database.types.ts`, `server/http.ts`, `server/supabase.ts`.
- Supabase schema/data: `supabase/config.toml`, `supabase/migrations/20261009183000_create_accounts.sql`, generated `supabase/seed.sql`, `scripts/build-supabase-seed.ts`.
- Client integration: `public/theme-init.js`, `src/lib/accountApi.ts`, `src/hooks/useAccountSearch.ts`, `src/hooks/useAccountDetails.ts`, `src/pages/SearchPage.tsx`, `src/pages/ProfilePage.tsx`.

### Phase 4 commit

- Commit message: `feat: add Supabase-backed directory API`
- Commit description: `Add server-side search and account routes, read-only RLS schema and seed data, API-first client fallback, and security/deployment guidance.`
- Commit hash is included in the Phase 4 completion response.

## Phase 5 plan

1. Replace the `/story` placeholder with an accessible, responsive, data-driven historical timeline, with event content in `src/data/timeline.json` and a validated TypeScript data interface.
2. Use concise, dated descriptions supported by primary United Nations and International Court of Justice sources where possible. Attribute legal findings to the issuing court and keep event summaries neutral; include source disclosures on each event.
3. Add era filter chips and a desktop alternating / mobile single-column layout. Reveal events on scroll with a fade only when the user has not requested reduced motion.
4. Replace the `/about` methodology placeholder with a short note on source selection, dates, attribution, and updates.
5. Run lint, typecheck, format check, and production build; do not run the unit test suite unless the user asks. Record exact changed files, check results, and per-file commits below.
6. Commit each changed file in its own commit with a file-specific Conventional Commit subject and a second `-m` description. This policy starts in Phase 5; Phase 4 remains as committed because it is already at `origin/master` and rewriting it would require a force-push.
7. Stop at the Phase 5 boundary for user review; Phase 6 remains unstarted.

### Phase 5 execution log

- 2026-10-10: User authorized continuing to Phase 5 and clarified that every changed file must receive its own commit, with a file-specific subject and description. This plan was recorded before editing application code.
- Added 20 editable timeline entries in `src/data/timeline.json`, covering 1917 through the UN's 24 September 2026 report. Entries include dates, period labels, concise summaries, contextual detail, and one or more direct source links. Legal findings are attributed to the ICJ; contested historical interpretation is identified as such; no casualty totals are included.
- Added Zod validation for entry fields, date formats, unique IDs, and source URLs. The timeline page now offers period filter buttons, an announced result count, native source disclosures, desktop alternating cards, a mobile single-column layout, and scroll-triggered fade-in when reduced motion is not preferred.
- Replaced the `/story` placeholder route and added a short `/about` methodology note describing linked public records, attribution, corrections, and differing historical interpretations.
- Verification passed: `npm run lint`, `npm run typecheck`, `npm run format:check`, `git diff --check`, and `npx vite build`. Production output: JavaScript 1,169.76 KB raw / 193.51 KB gzip; CSS 24.96 KB raw / 6.25 KB gzip; HTML 0.64 KB raw / 0.37 KB gzip. Vite still reports the existing raw JavaScript chunk-size warning (>500 KB); gzip remains below 200 KB. The unit test suite was not run, and no test files were added.

### Files added or changed in Phase 5

- Project memory: `Project_Report.md`.
- Routing and methodology: `src/App.tsx`, `src/pages/AboutPage.tsx`.
- Timeline content and validation: `src/data/timeline.json`, `src/data/timeline.ts`.
- Timeline view and styling: `src/pages/StoryPage.tsx`, `src/styles/theme.css`.

### Phase 5 per-file commits

- `8b780c1` — `feat(story): route to the timeline` — `src/App.tsx`.
- `86a6c07` — `docs(about): explain timeline methodology` — `src/pages/AboutPage.tsx`.
- `3ae913b` — `feat(story): add sourced history entries` — `src/data/timeline.json`.
- `d64df73` — `feat(story): validate timeline data` — `src/data/timeline.ts`.
- `934087e` — `feat(story): build the history timeline` — `src/pages/StoryPage.tsx`.
- `5d9e940` — `style(story): add responsive timeline layout` — `src/styles/theme.css`.
- `Project_Report.md` is committed separately with the same one-file, file-specific commit convention. Phase 4's single commit was left intact because it already matches `origin/master`; the per-file convention begins with Phase 5.

## Phase 6 plan

1. Add independent Vite build-time flags for Donate and Stores & Apps, disabled by default.
2. Replace the disabled navigation placeholders with links only when each section is enabled, and register routes under the same flags so disabled sections are not directly reachable.
3. Add responsive, accessible landing pages for both sections with honest empty states until reviewed destinations are supplied; do not invent charities, apps, or store listings.
4. Document the public build-time flags in `.env.example` and keep them separate from server-only Supabase credentials.
5. Run lint, typecheck, formatting, and production builds with both flags disabled and enabled. Do not run the unit test suite unless requested. Record outcomes and exact changed files, then stop for review before Phase 7.
6. Commit each changed file separately with a file-specific Conventional Commit subject and a second `-m` description, following the Phase 5 convention.

### Phase 6 execution log

- 2026-10-10: User authorized continuing to Phase 6. The plan was recorded before implementation.
- Added independent build-time flags `VITE_ENABLE_DONATE` and `VITE_ENABLE_STORES_APPS`; both default to disabled unless their value is `true` (case-insensitive). Navigation links and client routes use the same flags, so disabled sections are not directly reachable.
- Added accessible, responsive section pages with concise review guidance and empty states. No charities, apps, or store destinations were supplied, so none were invented or linked. Both pages are ready for reviewed static content and remain disabled by default.
- Documented the flags in `.env.example`, separately from server-only Supabase credentials.
- Checks passed: `npm run lint`, `npm run typecheck`, `npm run format:check`, `git diff --check`, and production builds with both flags disabled and enabled. The enabled build output was JavaScript 1,171.29 KB raw / 193.94 KB gzip, CSS 24.96 KB raw / 6.25 KB gzip, and HTML 0.64 KB raw / 0.37 KB gzip. The existing Vite warning for the raw JavaScript chunk exceeding 500 KB remains; the gzip bundle stays below 200 KB. The unit test suite was not run, as requested by the project plan.

### Files added or changed in Phase 6

- Feature configuration and public build settings: `.env.example`, `src/config/features.ts`.
- Route and navigation gating: `src/App.tsx`, `src/components/NavigationPanel.tsx`.
- Gated pages: `src/pages/DonatePage.tsx`, `src/pages/StoresAppsPage.tsx`.
- Project memory: `Project_Report.md`.

### Phase 6 per-file commits

- `7b6a77b` — `chore(config): add optional section flags` — `.env.example`.
- `e98f223` — `feat(features): add independent section flags` — `src/config/features.ts`.
- `c9d88c6` — `feat(routes): gate optional section pages` — `src/App.tsx`.
- `d3cba76` — `feat(navigation): expose gated sections` — `src/components/NavigationPanel.tsx`.
- `34aa797` — `feat(donate): add gated landing page` — `src/pages/DonatePage.tsx`.
- `ddc5d72` — `feat(stores): add gated landing page` — `src/pages/StoresAppsPage.tsx`.
- The report is committed separately using the same one-file convention.

## Phase 7 plan

1. Split route pages into lazy-loaded chunks with an accessible route loading state, reducing the JavaScript needed before a user can start using the app.
2. Add route-aware page titles, descriptions, canonical/Open Graph metadata, and crawl controls. Exclude the private local checklist and API paths from indexing; generate robots and sitemap responses for the active deployment origin.
3. Add a web app manifest, app icon, and production-only service worker. Cache the app shell and versioned static assets for offline use, fall back to the shell for offline route navigation, and leave API requests uncached.
4. Keep the build dependency-free and preserve local checklist privacy and feature gates.
5. Run lint, typecheck, formatting, diff checks, and production builds with optional section flags off and on. Record bundle sizes, limitations, files, and commits; do not run the unit test suite unless requested.
6. Commit every changed file separately with a file-specific Conventional Commit subject and second `-m` description. Stop for review before Phase 8.

### Phase 7 execution log

- 2026-10-10: User authorized continuing to Phase 7. The plan was recorded before implementation.
- Lazy-loaded every route page, added an accessible route loading fallback, and scoped Motion's reduced-motion provider to the pages that use animation. The initial JavaScript entry is 179.69 KB raw / 58.66 KB gzip. The 4,073-account directory is emitted as a separate 968.65 KB raw / 51.96 KB gzip JSON asset instead of being parsed as a large JavaScript module on startup. Home and local search/profile fallback load that asset on demand; the build pipeline remains responsible for full Zod validation.
- Added route-aware title, description, canonical, robots, Open Graph, and Twitter metadata. `/search` is `noindex, follow`; `/blocked` is `noindex, nofollow` and disallowed in robots. Added request-origin `robots.txt` and `sitemap.xml` routes; the sitemap includes three public content pages and all 4,073 profile URLs.
- Added the web app manifest and SVG icon. A production-only service worker precaches the Vite build manifest's static assets, uses the cached shell when offline navigation fails, and does not cache `/api/` responses. The private checklist remains in browser local storage and is not copied into the service worker cache.
- Checks passed: `npm run lint`, `npm run typecheck`, `npm run format:check`, `git diff --check`, `node --check public/sw.js`, JSON parsing for the manifest and Vercel config, and build-manifest file checks (21 manifest entries, 22 unique referenced files, none missing). `npx vite build` succeeded with both optional sections disabled and enabled. Enabled build output: CSS 24.96 KB raw / 6.25 KB gzip; HTML 1.13 KB raw / 0.48 KB gzip. No Vite chunk-size warning remains.
- The unit test suite and browser-level install/offline interaction were not run. Route metadata is client-side because this remains a Vite SPA; crawlers that do not execute JavaScript will see the shared base metadata in `index.html`. Canonical and sitemap origins follow the active request host because no production hostname was supplied.

### Files added or changed in Phase 7

- API crawl endpoints and Vercel routing: `api/robots.ts`, `api/sitemap.ts`, `vercel.json`.
- Build, HTML metadata, and PWA assets: `eslint.config.js`, `index.html`, `vite.config.ts`, `public/icon.svg`, `public/manifest.webmanifest`, `public/sw.js`, `src/main.tsx`.
- Route loading, metadata, and motion scope: `src/App.tsx`, `src/components/AppShell.tsx`, `src/components/AccountCardGrid.tsx`, `src/components/PageMetadata.tsx`, `src/components/RouteLoadingFallback.tsx`, `src/pages/StoryPage.tsx`.
- Static directory loading and local search fallback: `src/config/dataset.ts`, `src/data/accountDirectory.ts`, `src/data/accounts.ts`, `src/hooks/useAccountDetails.ts`, `src/hooks/useAccountSearch.ts`, `src/lib/accountApi.ts`, `src/lib/accountApiFallback.ts`, `src/lib/searchAccounts.ts`, `src/lib/searchAccountsCore.ts`, `src/lib/searchLocalDirectory.ts`, `src/lib/searchQuery.ts`.
- Page integrations: `src/components/DatasetNotice.tsx`, `src/pages/BlockedPage.tsx`, `src/pages/HomePage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/SearchPage.tsx`.
- Project memory: `Project_Report.md`.

### Phase 7 per-file commits

- `49ebed2` — `feat(seo): serve crawl directives` — `api/robots.ts`.
- `d6f78ff` — `feat(seo): publish directory sitemap` — `api/sitemap.ts`.
- `4dfb91f` — `chore(lint): declare worker globals` — `eslint.config.js`.
- `29fba89` — `feat(seo): add base metadata and app links` — `index.html`.
- `a8ef718` — `feat(pwa): add app icon` — `public/icon.svg`.
- `5ed44e2` — `feat(pwa): add web app manifest` — `public/manifest.webmanifest`.
- `31ae9a0` — `feat(pwa): cache the app shell offline` — `public/sw.js`.
- `ad6dbf0` — `perf(routes): lazy load route pages` — `src/App.tsx`.
- `38c9f52` — `perf(motion): scope reduced motion` — `src/components/AccountCardGrid.tsx`.
- `3d2d64c` — `feat(app-shell): support lazy routes` — `src/components/AppShell.tsx`.
- `652a00e` — `refactor(dataset): isolate preview notice` — `src/components/DatasetNotice.tsx`.
- `ddbc94c` — `feat(seo): add route metadata` — `src/components/PageMetadata.tsx`.
- `aea7106` — `feat(routes): add accessible loading state` — `src/components/RouteLoadingFallback.tsx`.
- `0e5313c` — `refactor(dataset): move preview flag` — `src/config/dataset.ts`.
- `d4bb82a` — `perf(data): load directory as JSON asset` — `src/data/accountDirectory.ts`.
- `e26d8ca` — `perf(data): remove duplicate runtime validation` — `src/data/accounts.ts`.
- `ac50d65` — `perf(profile): defer local data fallback` — `src/hooks/useAccountDetails.ts`.
- `3a4741c` — `perf(search): defer local fallback` — `src/hooks/useAccountSearch.ts`.
- `4f39f8e` — `refactor(api): isolate fallback telemetry` — `src/lib/accountApi.ts`.
- `0c5a62a` — `refactor(api): centralize fallback telemetry` — `src/lib/accountApiFallback.ts`.
- `4c2a8a5` — `refactor(search): delegate to shared ranking` — `src/lib/searchAccounts.ts`.
- `d66f94d` — `refactor(search): extract shared ranking` — `src/lib/searchAccountsCore.ts`.
- `4f61064` — `perf(search): load local directory on demand` — `src/lib/searchLocalDirectory.ts`.
- `fe9a23e` — `refactor(search): isolate query normalization` — `src/lib/searchQuery.ts`.
- `8a162fe` — `feat(pwa): register production worker` — `src/main.tsx`.
- `2e213d9` — `perf(blocked): load directory asynchronously` — `src/pages/BlockedPage.tsx`.
- `a826971` — `perf(home): fetch static directory asset` — `src/pages/HomePage.tsx`.
- `a9f0c3f` — `feat(profile): report fallback load errors` — `src/pages/ProfilePage.tsx`.
- `17556a0` — `feat(search): report fallback load errors` — `src/pages/SearchPage.tsx`.
- `595cebd` — `perf(story): defer motion runtime` — `src/pages/StoryPage.tsx`.
- `7956450` — `feat(seo): route robots and sitemap` — `vercel.json`.
- `b070973` — `build(vite): emit asset manifest` — `vite.config.ts`.
- The report is committed separately using the same one-file convention.

## Supabase cloud setup status

- 2026-10-10: User installed the Supabase CLI as a project development dependency (`supabase@2.120.0`). `npx supabase --version` succeeds with `SUPABASE_TELEMETRY_DISABLED=1` in this sandbox. The CLI-generated `supabase/.temp/` cache is ignored by Git.
- The local CLI session is linked to project ref `ncdkujrjcrdarjijeteg`; its link metadata is in the Git-ignored `supabase/.temp/` cache. Authentication tokens and database passwords are not recorded in this report or repository.
- 2026-10-10: After user approval, `npx supabase db push --linked --include-seed --yes` applied `20261009183000_create_accounts.sql` and loaded `supabase/seed.sql`. Read-only verification confirmed migration `20261009183000` is applied and `public.accounts` contains 4,073 rows. The hosted schema and account data are set up. Vercel environment settings and a deployment check remain pending. Keep the database password local and never run `db reset --linked` against a production project.
- Files changed by CLI installation/setup: `.gitignore`, `package.json`, `package-lock.json`, and this report. Commit each file separately per the user's commit convention.
- File-specific commits: `8f18b6f` (`package.json`), `73872ea` (`package-lock.json`), and `8a1c0ef` (`.gitignore`). This report receives its own separate commit.

## Phase 8 plan

1. Review the deployed schema grants and policies. Since the API only reads rows and invokes the read-only search RPC, use the publishable key for its server-side Supabase client so normal RLS applies; remove the unnecessary secret-key requirement.
2. Add focused Vitest coverage for search/account API validation, response mapping and headers, generic upstream/configuration errors, and rate limiting. Keep Supabase mocked so tests need no hosted credentials or network access.
3. Add GitHub Actions CI for pushes and pull requests to `master`, using the supported Node runtime, `npm ci`, lint, typecheck, unit tests, formatting, and the full data-validated production build. Grant the workflow read-only repository permissions and do not add deployment secrets or deploy from CI.
4. Add a launch guide covering Vercel Git integration, the production branch and domain, server environment variables, feature flags, security boundaries, and post-deploy smoke checks. Update `.env.example` and `SECURITY.md` to match the least-privilege publishable-key configuration.
5. Run and record the full quality gate, verify generated-data files are not inadvertently changed, list all Phase 8 files and per-file Conventional Commits, update this report, and stop for review. Do not configure external Vercel settings or deploy from this workspace.
6. Commit each changed file separately with a file-specific Conventional Commit subject and a second `-m` description, then commit the report separately.

### Phase 8 execution log

- 2026-10-11: User authorized continuing to Phase 8. The worktree was clean; the Phase 8 plan was recorded before implementation.
- The migration grants `anon` and `authenticated` select access guarded by an RLS read policy and execute access to the `SECURITY INVOKER` search RPC. Current Supabase guidance distinguishes publishable keys, which use these RLS permissions, from secret keys that bypass RLS. The existing Vercel environment is not configured, so this is the right point to remove the secret-key dependency before launch.
- Added mocked API/configuration tests, read-only GitHub Actions CI, and a Vercel launch guide. `npm run test` passed 7 files and 19 tests; lint, typecheck, formatting, diff checks, and the full data-validated production build also passed on Node 24.18.0. The build validated 4,073 accounts from 4,074 source rows and preserved source SHA-256 `b4c81d56abfe1e363c6497170a94f170ba793959ba91a7884ff92061b56d3b83`. It generated only new timestamps in two tracked reports; those timestamp-only changes were reverted. No deployment or Vercel settings were changed.
- CI runs on pushes and pull requests targeting `master`, uses Node 24 with read-only repository permissions, and runs install, lint, typecheck, tests, formatting, and the complete build. Vercel Git integration is documented for Preview and Production deployments; GitHub Actions has no deployment credentials.

### Files added or changed in Phase 8

- API and Supabase coverage/configuration: `api/account/[username].test.ts`, `api/search.test.ts`, `server/http.test.ts`, `server/supabase.test.ts`, `server/supabase.ts`, `vitest.config.ts`.
- CI and launch/security documentation: `.github/workflows/ci.yml`, `README.md`, `SECURITY.md`, `.env.example`.
- Project memory: `Project_Report.md`.

### Phase 8 per-file commits

- `b1f3c94` — `chore(env): use RLS-scoped Supabase key` — `.env.example`.
- `9b2a646` — `docs(security): document least-privilege API access` — `SECURITY.md`.
- `50fad03` — `docs(launch): add Vercel launch guide` — `README.md`.
- `d75a590` — `ci(github): add quality workflow` — `.github/workflows/ci.yml`.
- `10c48ae` — `security(supabase): use publishable key for API client` — `server/supabase.ts`.
- `8a81fb0` — `test(vitest): include API suites in thread pool` — `vitest.config.ts`.
- `72e9c49` — `test(api): cover response headers and rate limits` — `server/http.test.ts`.
- `6b017a6` — `test(supabase): verify RLS-scoped client config` — `server/supabase.test.ts`.
- `6893fc4` — `test(api): cover search route behavior` — `api/search.test.ts`.
- `b9c397e` — `test(api): cover account lookup route` — `api/account/[username].test.ts`.
- The project report is committed separately using the same one-file convention.

## Change 1 — Avatar enrichment

### Plan

1. Keep Supabase Storage as the cached-image source and `accounts.avatar_url` as the URL source of truth. Preserve the existing client fallback chain and image-loading behavior.
2. Replace the proposed Vercel Cron and protected admin endpoints with an explicitly run local program, following the user's request after reviewing the Hobby cron limit.
3. Use fixed request pacing and a local daily quota ledger. Do not disguise automation or imitate browser interaction to evade Instagram or provider safeguards.
4. Document local setup, secret handling, provider limits, and commands. Remove unused cron/admin routes and environment settings.
5. Run lint, typecheck, tests, formatting, and the production build; report limitations and stop for review. Do not begin Change 2 or Change 3.

### Execution log

- 2026-10-12: Implemented Change 1 as a local Node.js runner because the project already uses Node, Supabase JS, and Sharp. `npm run avatars:dry-run` uses the publishable key and performs read-only selection; actual runs require the service-role key locally. The runner processes sequentially, defaults to batches of 3, a fixed 3-second pause, and 12 upstream requests per UTC day (configurable up to 25). It records the quota before each request, serializes local runs, and stops after HTTP 429. It offers exact-username retries and an all-batches-for-today mode.
- Removed the Vercel cron and HTTP admin routes, their auth/route tests, and cron/admin secret settings. Vercel retains only the app's existing rewrites and security headers. The existing avatar migration, Storage configuration, database URL handling, image cache, client fallbacks, and footer attribution remain in place.
- Updated the avatar guide, README, security notes, sample environment, and ignored local quota files. Added only a script-specific Node globals rule to ESLint.
- Verification passed: `npm run lint`, `npm run typecheck`, `npm run test` (8 files, 25 tests), `npm run format:check`, `npm run build`, `node --check scripts/enrich-avatars.mjs`, `npm run avatars:help`, and `git diff --check`. The production build validated 4,073 accounts and produced the directory JSON asset at 968.65 KB raw / 51.96 KB gzip; app entry JavaScript was 179.82 KB raw / 58.70 KB gzip. Build-generated timestamp-only changes to the cleaning and count reports were reverted.
- No dry run or live request was sent to Unavatar or Supabase: `.env.local` is absent, and the avatar migration has not been applied to the hosted project. Run the read-only preview first after configuring local credentials; apply the migration before any real batch.
- No commits were created in this environment. Git metadata is read-only here; an earlier attempt to update `.git/index.lock` was denied.

### Verification output and remaining setup

The local help command ran without a configured `.env.local` and made no Supabase or provider requests:

```text
Usage:
  npm run avatars:dry-run
  npm run avatars:batch [-- --batch-size 3]
  npm run avatars:day [-- --batch-size 3]
```

Before a real batch, apply the avatar migration and add the local Supabase URL and keys. There are no open implementation decisions for Change 1. Review it before proceeding; Change 3 still requires the user's choice of Option A, B, or C.

### Files added, changed, or removed

- Local runner/config: `scripts/enrich-avatars.mjs`, `package.json`, `.gitignore`, `eslint.config.js`, `.env.example`, `vercel.json`.
- Pipeline and coverage: `server/avatarPipeline.ts`, `server/avatarPipeline.test.ts`, `server/supabase.ts`; removed `server/avatarAuth.ts`, `server/avatarAuth.test.ts`, `server/avatarRoute.ts`, `server/avatarRoute.test.ts`, `api/admin/enrich-avatars.ts`, and `api/cron/enrich-avatars.ts`.
- Documentation: `README.md`, `SECURITY.md`, `docs/avatar-pipeline.md`, and this report.

### Review boundary

Change 1 is ready for review. Change 2 (the logo) and Change 3 (categories) remain unstarted. Before Change 3, ask the user to choose Option A, B, or C from the original specification.
