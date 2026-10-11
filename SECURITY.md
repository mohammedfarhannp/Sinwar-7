# Security and deployment notes

## Data access

- The browser calls only the same-origin `/api/search` and `/api/account/:username` routes. It does not create a Supabase client or query Supabase directly.
- Search and account Vercel Functions use `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. The database's `anon` grants and RLS policies apply to those public reads.
- Only the protected avatar-enrichment routes use `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. The key is read only by `getServerSupabaseAdminClient()` and must remain in Vercel server environment settings; it must never be sent to the browser, included in build variables, or given a `VITE_` prefix. Rotate it in Supabase if exposed.
- `CRON_SECRET` protects the scheduled `GET /api/cron/enrich-avatars` route through Vercel's `Authorization: Bearer ...` header. `ADMIN_SECRET` protects `POST /api/admin/enrich-avatars` through `x-admin-secret`. Both are server-only and must not use a `VITE_` prefix. Use long random values and keep them out of logs, URLs, and source control.
- `ENRICH_BATCH_SIZE`, `ENRICH_DELAY_MS_MIN`, and `ENRICH_DELAY_MS_MAX` tune server-side worker behavior. The batch size defaults to 3 and is capped at 10.
- Publishable keys are designed for public components and do not bypass RLS. Never substitute a secret/service-role key for the publishable key in read-only API routes. Never commit a real `.env` file or include any secret in client code or build variables.
- `@supabase/ssr` is installed as requested but the app has no browser session or authentication flow that needs cookie-aware SSR.
- `public.accounts` has RLS enabled. `anon` and `authenticated` may select rows but have no insert, update, or delete grants or policies. The search RPC is `SECURITY INVOKER`, validates its arguments, and has execute permission only for the intended API roles. API routes only issue reads.
- Account data is public directory content by design. Do not place private user data in this table.

## Environment setup

1. Copy `.env.example` to `.env.local` for local function development. Set the Supabase URL and publishable key for reads. Set `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, and `ADMIN_SECRET` only in trusted server environments when enabling avatar enrichment. `.env*` files are ignored by Git except `.env.example`.
2. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in Vercel Production and Preview. To enable enrichment, also set the three server-only secrets and optional batch/delay settings. None of these secrets may be `VITE_`-prefixed.
3. Apply `supabase/migrations/20261009183000_create_accounts.sql` and then `supabase/migrations/20261011230000_add_avatar_enrichment.sql` before enabling the worker. Load `supabase/seed.sql` to seed accounts. The seed file is generated from the validated JSON source by `npm run db:seed:build`; `npm run build` regenerates it after rebuilding and validating the source list.
4. `npm run dev` starts Vite only, so calls to `/api/*` fall back to the local Fuse search during ordinary frontend development. To run the Vercel Functions locally, install/use the Vercel CLI and run `vercel dev` with the server environment variables available.
5. See [docs/avatar-pipeline.md](docs/avatar-pipeline.md) for batch verification and provider limits.

## API protections and limits

- Search and account path/query values are validated with Zod. Errors use generic messages and do not include submitted usernames, query strings, IP addresses, Supabase errors, or secrets.
- Both routes enforce a best-effort limit of 60 requests per minute for each observed client IP. The in-memory counter is local to a warm serverless function instance; it is not a distributed quota and can reset or differ across Vercel instances. For a strict account-wide limit, move the counter to a shared service before relying on it for abuse prevention.
- API responses include `nosniff` and no-referrer headers. Search is not cached. Successful account details use `s-maxage=86400` and stale-while-revalidate for CDN caching. Vercel also applies the response security headers configured in `vercel.json`.
- If an API call fails, the frontend falls back to the bundled directory and Fuse search. It emits a once-per-page-context `account_api_fallback` event with no query, username, IP, or user identifier.

## Reporting a security issue

Do not publish credentials or exploit details in a public issue. Contact the project maintainer privately with a concise description and reproduction steps.
