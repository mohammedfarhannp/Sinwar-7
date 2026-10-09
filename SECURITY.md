# Security and deployment notes

## Data access

- The browser calls only the same-origin `/api/search` and `/api/account/:username` routes. It does not create a Supabase client or query Supabase directly.
- Vercel Functions use `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. A legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted. Set one server key in Vercel project environment settings for Production and Preview as needed.
- Secret/service-role values bypass row-level security. Keep them in server environment settings only. Never add a `VITE_` or `NEXT_PUBLIC_` prefix, commit a real `.env` file, put the key in client code, or share it in screenshots/logs. If exposed, rotate it in the Supabase dashboard.
- The Supabase publishable key is intentionally not used by the current server-only integration. `@supabase/ssr` is installed as requested but this phase has no browser session or authentication flow that needs cookie-aware SSR.
- `public.accounts` has RLS enabled. `anon` and `authenticated` may select rows but have no insert, update, or delete grants or policies. The search RPC is `SECURITY INVOKER`, validates its arguments, and has execute permission only for the intended API roles. API routes only issue reads.
- Account data is public directory content by design. Do not place private user data in this table.

## Environment setup

1. Copy `.env.example` to `.env.local` for local function development, then set the project's Supabase URL and a server secret key. `.env*` files are ignored by Git except `.env.example`.
2. Set the same server variables in the Vercel project's Environment Variables page. They are read only by server functions and are not exposed as Vite build variables.
3. Apply `supabase/migrations/20261009183000_create_accounts.sql` before deploying the API. Load `supabase/seed.sql` to seed accounts. The seed file is generated from the validated JSON source by `npm run db:seed:build`; `npm run build` regenerates it after rebuilding and validating the source list.
4. `npm run dev` starts Vite only, so calls to `/api/*` fall back to the local Fuse search during ordinary frontend development. To run the Vercel Functions locally, install/use the Vercel CLI and run `vercel dev` with the server environment variables available.

## API protections and limits

- Search and account path/query values are validated with Zod. Errors use generic messages and do not include submitted usernames, query strings, IP addresses, Supabase errors, or secrets.
- Both routes enforce a best-effort limit of 60 requests per minute for each observed client IP. The in-memory counter is local to a warm serverless function instance; it is not a distributed quota and can reset or differ across Vercel instances. For a strict account-wide limit, move the counter to a shared service before relying on it for abuse prevention.
- API responses include `nosniff` and no-referrer headers. Search is not cached. Successful account details use `s-maxage=86400` and stale-while-revalidate for CDN caching. Vercel also applies the response security headers configured in `vercel.json`.
- If an API call fails, the frontend falls back to the bundled directory and Fuse search. It emits a once-per-page-context `account_api_fallback` event with no query, username, IP, or user identifier.

## Reporting a security issue

Do not publish credentials or exploit details in a public issue. Contact the project maintainer privately with a concise description and reproduction steps.
