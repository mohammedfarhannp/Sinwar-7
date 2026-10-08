# Sinwar-7 Project Report

Last updated: 2026-10-09

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

## Phase plan

| Phase | Scope                                                                | Status      |
| ----- | -------------------------------------------------------------------- | ----------- |
| 0     | Vite/React/TypeScript scaffold, theme, app shell, route placeholders | Complete    |
| 1     | Responsive shell polish and navigation behavior                      | Not started |
| 2     | Static search, profile cards, personal blocked list                  | Not started |
| 3     | Account data pipeline, validation, cleaning report                   | Not started |
| 4     | Supabase schema/SQL migrations and secure server-side search         | Not started |
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

## Current completion and next step

Phase 0 is complete and ready for review. Stop here. Phase 1 has not started and requires the next approval.
