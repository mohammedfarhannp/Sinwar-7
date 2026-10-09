# Sinwar-7 Project Report

Last updated: 2026-10-10

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
- The supplied names use `NEXT_PUBLIC_`; this project uses Vite, so the integration will read `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the environment.
- This is a publishable key, not a service-role key. Never put a service-role key in client code or this report.
- `@supabase/supabase-js` and `@supabase/ssr` were installed in Phase 4 as requested. The server routes use `@supabase/supabase-js`; no browser session/auth flow exists yet, so `@supabase/ssr` is not imported by the app.

## Phase plan

| Phase | Scope                                                                | Status      |
| ----- | -------------------------------------------------------------------- | ----------- |
| 0     | Vite/React/TypeScript scaffold, theme, app shell, route placeholders | Complete    |
| 1     | Responsive shell polish and navigation behavior                      | Complete    |
| 2     | Static search, profile cards, personal blocked list                  | Complete    |
| 3     | Account data pipeline, validation, cleaning report                   | Complete    |
| 4     | Supabase schema/SQL migrations and secure server-side search         | Complete    |
| 5     | Educational story and timeline                                       | Not started |
| 6     | Feature-gated Donate and Stores & Apps sections                      | Not started |
| 7     | Performance, SEO, and PWA                                            | Not started |
| 8     | Tests, CI/CD, launch documentation                                   | Not started |

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

Phases 0, 1, 2, 3, 4, and 5 are complete (6 of 9 phases). Phase 5 delivered the sourced historical timeline at `/story`, filterable by period, plus the methodology note on `/about`. Stop here for user review before starting Phase 6.

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

## Supabase cloud setup status

- 2026-10-10: User installed the Supabase CLI as a project development dependency (`supabase@2.120.0`). `npx supabase --version` succeeds with `SUPABASE_TELEMETRY_DISABLED=1` in this sandbox. The CLI-generated `supabase/.temp/` cache is ignored by Git.
- The local CLI session is linked to project ref `ncdkujrjcrdarjijeteg`; its link metadata is in the Git-ignored `supabase/.temp/` cache. Authentication tokens and database passwords are not recorded in this report or repository.
- 2026-10-10: After user approval, `npx supabase db push --linked --include-seed --yes` applied `20261009183000_create_accounts.sql` and loaded `supabase/seed.sql`. Read-only verification confirmed migration `20261009183000` is applied and `public.accounts` contains 4,073 rows. The hosted schema and account data are set up. Vercel environment settings and a deployment check remain pending. Keep the database password local and never run `db reset --linked` against a production project.
- The current server code expects `SUPABASE_SECRET_KEY`, which bypasses RLS. Before production configuration, review switching the read-only API client to the existing publishable key: the migration grants `anon` and `authenticated` read access under RLS and execute access to the read-only search RPC.
- Files changed by CLI installation/setup: `.gitignore`, `package.json`, `package-lock.json`, and this report. Commit each file separately per the user's commit convention.
- File-specific commits: `8f18b6f` (`package.json`), `73872ea` (`package-lock.json`), and `8a1c0ef` (`.gitignore`). This report receives its own separate commit.
