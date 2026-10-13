# Avatar enrichment

## Data flow

- Supabase Storage bucket `avatars` is the durable image source. It is public-read; restrictive Storage policies prevent `anon` and `authenticated` roles from inserting, updating, or deleting avatar objects.
- `public.accounts.avatar_url` stores the public WebP URL returned by Supabase Storage. The client accepts only the existing local avatar path or an HTTPS Supabase public-storage URL for this bucket.
- The local Node.js runner uses `SUPABASE_SERVICE_ROLE_KEY` to claim eligible rows, request an avatar from Unavatar, resize and encode the image, upload it to Storage, and update `avatar_url`. The key bypasses RLS and must remain in local `.env.local` only.
- The client tries the stored URL, then `https://unavatar.io/instagram/{username}?fallback=false`, then generated initials. Images are lazy-loaded, async-decoded, and sent without a referrer.
- The runner processes profiles sequentially. An atomic attempt update and ten-minute lease prevent concurrent workers from fetching the same row and allow recovery after a stopped process. Rows with `avatar_attempts >= 5` are not selected.

## Provider limits and request behavior

Unavatar's anonymous tier documents 25 requests per IP address per day and requires a visible, crawlable attribution link for free usage. The site footer includes that credit. The local runner defaults to a separate cap of 12 requests per UTC day, 3 profiles per batch, and a fixed 3-second pause between requests. It writes each attempted request to an ignored local ledger before contacting the provider, serializes concurrent runs with a local lock, and stops the current run immediately after HTTP 429. It does not disguise automation or imitate browser interaction.

The local ledger only counts this runner on this computer. Other Unavatar use from the same public IP can consume the provider's shared quota. Avoid raising the cap without checking the provider's current limits. The 4,073-account directory takes months to enrich at the default cap.

## Local setup

1. Apply `supabase/migrations/20261011230000_add_avatar_enrichment.sql` after the accounts migration. The migration creates the public-read bucket and blocks public writes.
2. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for the read-only dry run. Add `SUPABASE_SERVICE_ROLE_KEY` before making changes; it is required only for a real run. Never copy the service-role key into Vercel, browser variables, source files, shell history, or logs. `.env.local` is Git-ignored.
3. Install dependencies with `npm ci`, then preview the next batch:

   ```powershell
   npm run avatars:dry-run
   ```

   Dry run reads eligible usernames but does not update rows, contact Unavatar, upload images, or write the quota ledger.

4. Run one batch with `npm run avatars:batch`. Continue in batches up to the local daily cap with `npm run avatars:day`.

The default batch size is 3 and may be set from 1 to 10 using `--batch-size` or `ENRICH_BATCH_SIZE`. To set a local daily limit, set `ENRICH_DAILY_REQUEST_LIMIT` from 1 to 25; the default is 12. The fixed delay may be adjusted from 1 to 10 seconds using `ENRICH_DELAY_MS`; the default is 3 seconds.

Examples:

```powershell
npm run avatars:batch -- --batch-size 2
npm run avatars:batch -- --usernames fiveforfightingmusic,fentybeauty
```

The number of exact usernames must fit both the selected batch size and remaining local daily quota. Requests are counted before they start, so an interrupted attempt still uses one slot for that UTC day. State is stored in `.avatar-enrichment-state.json`, which is ignored by Git. If a process is force-terminated and leaves `.avatar-enrichment-state.json.lock`, confirm that no runner is active and remove that lock file before running again.

## Verify results

1. Preview a batch and confirm its usernames are the intended eligible rows.
2. Run one batch; its JSON summary reports processed, fetched, failed, skipped, remaining, and whether the provider rate-limited the request.
3. Check that fetched images are WebP objects in the `avatars` bucket and that matching `accounts.avatar_url` values contain their public URLs.
4. Open an enriched profile with a hard refresh. If a cached or provider image is unavailable, the client falls through to initials.

The seed builder can regenerate `supabase/seed.sql` with `npm run db:seed:build`. Applying or reseeding the hosted Supabase project is a separate operation; this script does not apply migrations.
