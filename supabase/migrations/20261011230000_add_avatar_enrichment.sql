alter table public.accounts
  add column if not exists avatar_url text,
  add column if not exists avatar_status text not null default 'pending',
  add column if not exists avatar_attempts integer not null default 0,
  add column if not exists avatar_last_attempt_at timestamptz,
  add column if not exists avatar_error text;

update public.accounts
set avatar_status = 'fetched'
where avatar_url is not null and avatar_status = 'pending';

alter table public.accounts
  alter column avatar_status set default 'pending',
  alter column avatar_status set not null,
  alter column avatar_attempts set default 0,
  alter column avatar_attempts set not null;

alter table public.accounts
  drop constraint if exists accounts_avatar_url_local,
  drop constraint if exists accounts_avatar_status_valid,
  drop constraint if exists accounts_avatar_attempts_nonnegative,
  add constraint accounts_avatar_url_local check (
    avatar_url is null
    or avatar_url ~ '^/avatars/[A-Za-z0-9._/-]+[.]webp$'
    or avatar_url ~ '^https://[A-Za-z0-9-]+[.]supabase[.]co/storage/v1/object/public/avatars/[A-Za-z0-9._-]+[.]webp$'
  ),
  add constraint accounts_avatar_status_valid check (
    avatar_status in ('pending', 'fetched', 'failed', 'skipped')
  ),
  add constraint accounts_avatar_attempts_nonnegative check (
    avatar_attempts >= 0
  );

create index if not exists accounts_avatar_pending_idx
  on public.accounts (avatar_attempts, avatar_last_attempt_at)
  where avatar_status in ('pending', 'failed');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/webp']::text[])
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/webp']::text[];

-- Public buckets allow file reads by URL. Restrictive policies prevent any
-- anon/authenticated write policy on storage.objects from opening this bucket.
drop policy if exists avatars_no_public_insert on storage.objects;
create policy avatars_no_public_insert
  on storage.objects as restrictive
  for insert to anon, authenticated
  with check (bucket_id <> 'avatars');

drop policy if exists avatars_no_public_update on storage.objects;
create policy avatars_no_public_update
  on storage.objects as restrictive
  for update to anon, authenticated
  using (bucket_id <> 'avatars')
  with check (bucket_id <> 'avatars');

drop policy if exists avatars_no_public_delete on storage.objects;
create policy avatars_no_public_delete
  on storage.objects as restrictive
  for delete to anon, authenticated
  using (bucket_id <> 'avatars');
