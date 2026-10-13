# Sinwar-7

A static-first directory for searching a curated list of public Instagram accounts. Search and account details use same-origin Vercel API routes backed by Supabase; if an API request is unavailable, the app falls back to its validated static dataset. The personal blocked-account checklist stays in the user's browser storage.

## Local development

Use Node.js 24 (the project requires Node.js 22.12 or newer) and npm.

```powershell
npm ci
npm run dev
```

Vite's development server does not run the Vercel API functions. The app therefore uses its local search fallback during `npm run dev`. To exercise the API locally, use the Vercel CLI with `.env.local` configured as described in [SECURITY.md](SECURITY.md#environment-setup).

Useful quality commands:

```powershell
npm run lint
npm run typecheck
npm run test
npm run format:check
npm run build
```

`npm run build` rebuilds and validates the source account list, regenerates the Supabase seed, typechecks, then creates the production Vite output.

## Production launch on Vercel

1. Import this Git repository into Vercel and keep Git integration enabled. Pull requests receive Preview deployments; pushes to the configured Production Branch deploy production. The repository's current production branch is `master`.
2. Use Vite as the framework preset and the default `npm run build` command. Vercel serves the generated `dist` directory.
3. In the Vercel project's Environment Variables settings, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for Production and Preview. The search and account APIs use the publishable key with the database's `anon` grants and RLS policies. Keep the avatar pipeline's service-role key on the local computer only; never add it to Vercel or a `VITE_` variable. See [the avatar pipeline guide](docs/avatar-pipeline.md).
4. Optional Vite flags default to false when unset: `VITE_ENABLE_DONATE` and `VITE_ENABLE_STORES_APPS`. Enable a section only after its destinations and content have been reviewed.
5. Add the production domain in Vercel, set the intended Production Branch to `master`, and redeploy after environment or domain changes. The app derives canonical metadata, sitemap entries, and robots directives from the active request host.
6. Review the Preview deployment before merging to `master`. After the Production deployment, run the smoke checks below and record the final domain and deployment date with the project maintainer.

In GitHub repository settings, add a branch rule for `master` that requires the `Quality checks` status before merging. This makes the CI workflow a merge gate; committing the workflow alone does not turn on branch protection.

Vercel's Git integration handles Preview and Production deployments. GitHub Actions provides the separate quality gate; it has no deployment credentials and does not deploy the app.

## Post-deploy smoke checks

- Open `/`, `/search`, `/about`, and `/story`; confirm that the pages render and navigation works.
- Search for a known account and open its profile. Check that `/api/search` and `/api/account/<username>` return valid data, and that `https://<production-domain>/robots.txt` and `/sitemap.xml` return the expected host and account URLs.
- Open `/blocked` and verify its indexing restrictions and that its saved checklist remains browser-local.
- In browser developer tools, confirm the production service worker is registered and its app shell can load after a reload with the network disabled. Restore network access to verify API-backed search recovers.
- Confirm the loaded document and built client assets contain no Supabase elevated keys. Confirm the Vercel Production and Preview variables contain only the URL and publishable key required by this API.

See [SECURITY.md](SECURITY.md) for database grants, API protections, and environment handling. CI runs lint, typecheck, unit tests, formatting, and the full data-validated production build on pushes and pull requests targeting `master`.

## Avatar enrichment

Avatar images are enriched by an explicitly started local Node.js script. After applying the migration, add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to ignored `.env.local` for a preview. Add `SUPABASE_SERVICE_ROLE_KEY` locally before making changes:

```powershell
npm run avatars:dry-run
npm run avatars:batch
```

The runner stores a local, ignored daily quota ledger, defaults to 3 profiles per batch and 12 upstream requests per UTC day, waits a fixed 3 seconds between requests, and stops on HTTP 429. `npm run avatars:day` continues in batches up to the daily cap. See [the avatar pipeline guide](docs/avatar-pipeline.md) for options and setup.
