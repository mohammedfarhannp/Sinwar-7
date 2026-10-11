# Avatar enrichment pipeline

## Architecture and access

- Supabase Storage bucket `avatars` is the durable image source. It is public-read; restrictive Storage policies prevent `anon` and `authenticated` roles from inserting, updating, or deleting avatar objects. The protected worker writes with `SUPABASE_SERVICE_ROLE_KEY`.
- `public.accounts.avatar_url` stores the public WebP URL returned by Supabase Storage. The API schema accepts only the existing local avatar path or an HTTPS Supabase public-storage URL for this bucket.
- The client tries the stored URL, then `https://unavatar.io/instagram/{username}?fallback=false`, then its existing initials fallback. Image errors advance to the next fallback without blocking page rendering.
- Vercel Cron calls `GET /api/cron/enrich-avatars` every six hours (`0 */6 * * *`). Vercel cron invocations are GET requests and send `Authorization: Bearer $CRON_SECRET` when configured.
- Manual jobs use `POST /api/admin/enrich-avatars`, authenticated with the `x-admin-secret` header. Both guards compare secrets with `crypto.timingSafeEqual` and reject missing configuration or headers.
- The default batch is 3, configurable with `ENRICH_BATCH_SIZE`; both configured and requested batches are capped at 10. Profiles are processed sequentially with a randomized delay from `ENRICH_DELAY_MS_MIN` to `ENRICH_DELAY_MS_MAX` (defaults 2–3 seconds). An atomic attempt update and ten-minute lease prevent concurrent invocations from fetching the same row and allow recovery after a crashed invocation.
- Rows with `avatar_attempts >= 5` are not selected. Failed rows may retry after their lease expires. A row with an existing avatar URL is marked fetched by the migration.

## Provider limits and attribution

Unavatar's anonymous tier currently documents a limit of 25 requests per IP address per day and requires a visible, crawlable attribution link for free usage. The footer includes that credit. Four default cron batches make up to 12 upstream requests per day, below that published limit for a stable worker IP; manual runs and other traffic can use the remaining quota. A 429 response is recorded as a failure and stops the current batch. The UI falls through to initials when the provider rejects a request.

The 4,073-account directory will therefore take months to enrich at the default pace. Do not increase batch size or run repeated manual jobs without checking the provider's current quota and the project's storage usage.

## Setup

1. Apply `supabase/migrations/20261011230000_add_avatar_enrichment.sql` after the accounts migration.
2. Add these server-only Vercel Production and Preview environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, and `ADMIN_SECRET`. The last three are secrets and must never use a `VITE_` prefix. Set the optional batch and delay variables only when needed.
3. Redeploy after setting the variables. The `crons` entry in `vercel.json` is applied on deployment. Vercel Hobby plans only support one scheduled execution per day; the six-hour schedule requires a plan that permits more frequent cron jobs.

For local API exercise, provide the same settings in `.env.local` and run `vercel dev`. Ordinary `npm run dev` starts only Vite and does not run the API functions.

## Trigger and verify

Admin dry run selects up to the next three eligible usernames without changing account rows or uploading images:

```sh
curl -X POST "$SINWAR_BASE_URL/api/admin/enrich-avatars?dryRun=1" \
  -H "x-admin-secret: $ADMIN_SECRET"
```

To process a real default batch:

```sh
curl -X POST "$SINWAR_BASE_URL/api/admin/enrich-avatars" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"batchSize":3}'
```

The request may include `{"usernames":["handle1"]}` to retry a specific eligible profile. Fetched, exhausted, missing, or currently leased names are reported as skipped. The response includes `processed`, `fetched`, `failed`, `skipped`, and `remaining`; dry runs also include `preview`. Logs contain one JSON `avatar_fetch` line per selected profile, with only username, status, and duration.

After applying the migration and configuring Vercel, verify in this order:

1. A missing or wrong admin secret returns 401.
2. The admin dry run returns a preview and does not change `avatar_attempts`, `avatar_status`, Storage objects, or `avatar_url`.
3. A real batch fetches at most three images, writes WebP files in the `avatars` bucket, and updates the matching `accounts.avatar_url` values.
4. A second batch selects other eligible rows. A row with `avatar_attempts = 5` is never selected.
5. Open an enriched profile with a hard refresh to see the stored image. If an image is unavailable, the client still shows Unavatar or initials.

Do not put the service-role key in browser code, request URLs, CI build variables, screenshots, or logs. Keep it separate from the publishable key used by search and account reads.
