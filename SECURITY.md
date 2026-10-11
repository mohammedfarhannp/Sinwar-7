# Security and deployment notes

## Data access

- The browser calls only the same-origin `/api/search` and `/api/account/:username` routes. It does not create a Supabase client or query Supabase directly.
- Vercel Functions use `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. The API only performs public reads; the database's `anon` grants and RLS policies apply to this key. Set both variables in the Vercel project's Production and Preview environments.
- Publishable keys are designed for public components and do not bypass RLS. Keep the key in Vercel/local environment configuration for this server-only integration, and never substitute a secret/service-role key: elevated keys bypass the policies that limit this API to reads. Never commit a real `.env` file or include an elevated key in client code or build variables. If an elevated key is exposed, rotate it in the Supabase dashboard.
- `@supabase/ssr` is installed as requested but the app has no browser session or authentication flow that needs cookie-aware SSR.
- `public.accounts` has RLS enabled. `anon` and `authenticated` may select rows but have no insert, update, or delete grants or policies. The search RPC is `SECURITY INVOKER`, validates its arguments, and has execute permission only for the intended API roles. API routes only issue reads.
- Account data is public directory content by design. Do not place private user data in this table.

## Environment setup

1. Copy `.env.example` to `.env.local` for local function development, then set the project's Supabase URL and publishable key. `.env*` files are ignored by Git except `.env.example`.
2. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the Vercel project's Production and Preview environment settings. Keep secrets such as database passwords out of these values and out of Vite `VITE_` variables.
3. Apply `supabase/migrations/20261009183000_create_accounts.sql` before deploying the API. Load `supabase/seed.sql` to seed accounts. The seed file is generated from the validated JSON source by `npm run db:seed:build`; `npm run build` regenerates it after rebuilding and validating the source list.
4. `npm run dev` starts Vite only, so calls to `/api/*` fall back to the local Fuse search during ordinary frontend development. To run the Vercel Functions locally, install/use the Vercel CLI and run `vercel dev` with the server environment variables available.

## API protections and limits

- Search and account path/query values are validated with Zod. Errors use generic messages and do not include submitted usernames, query strings, IP addresses, Supabase errors, or secrets.
- Both routes enforce a best-effort limit of 60 requests per minute for each observed client IP. The in-memory counter is local to a warm serverless function instance; it is not a distributed quota and can reset or differ across Vercel instances. For a strict account-wide limit, move the counter to a shared service before relying on it for abuse prevention.
- API responses include `nosniff` and no-referrer headers. Search is not cached. Successful account details use `s-maxage=86400` and stale-while-revalidate for CDN caching. Vercel also applies the response security headers configured in `vercel.json`.
- If an API call fails, the frontend falls back to the bundled directory and Fuse search. It emits a once-per-page-context `account_api_fallback` event with no query, username, IP, or user identifier.

## Reporting a security issue

Do not publish credentials or exploit details in a public issue. Contact the project maintainer privately with a concise description and reproduction steps.
