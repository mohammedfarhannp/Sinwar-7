create table if not exists public.accounts (
  id text primary key,
  username text not null unique,
  display_name text,
  category text not null default 'other',
  avatar_url text,
  avatar_fallback text not null default '',
  verified_guess boolean not null default false,
  tags text[] not null default '{}'::text[],
  added_at date not null,
  notes text,
  constraint accounts_username_format check (username ~ '^[A-Za-z0-9._]+$'),
  constraint accounts_id_matches_username check (id = lower(username)),
  constraint accounts_category_valid check (
    category in (
      'entertainer',
      'athlete',
      'politician',
      'brand',
      'media',
      'organization',
      'other'
    )
  ),
  constraint accounts_avatar_url_local check (
    avatar_url is null or avatar_url ~ '^/avatars/[A-Za-z0-9._/-]+[.]webp$'
  )
);

create index if not exists accounts_username_lower_idx
  on public.accounts (lower(username));

create index if not exists accounts_category_idx
  on public.accounts (category);

alter table public.accounts enable row level security;

revoke all on table public.accounts from public, anon, authenticated;
grant select on table public.accounts to anon, authenticated;
grant all on table public.accounts to service_role;

drop policy if exists "Accounts are publicly readable" on public.accounts;
create policy "Accounts are publicly readable"
  on public.accounts
  for select
  to anon, authenticated
  using (true);

create or replace function public.search_accounts(
  search_query text,
  category_filter text,
  result_limit integer,
  result_offset integer
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  normalized_search text := lower(btrim(coalesce(search_query, '')));
  total_matches bigint;
  page_results jsonb;
begin
  if normalized_search <> '' and normalized_search !~ '^[a-z0-9._]{2,30}$' then
    raise exception 'Invalid search query';
  end if;

  if category_filter is not null and category_filter not in (
    'entertainer', 'athlete', 'politician', 'brand', 'media', 'organization', 'other'
  ) then
    raise exception 'Invalid category';
  end if;

  if result_limit is null or result_limit < 1 or result_limit > 100
    or result_offset is null or result_offset < 0 or result_offset > 100000 then
    raise exception 'Invalid pagination';
  end if;

  select count(*)
  into total_matches
  from public.accounts as account
  where (
    normalized_search = ''
    or strpos(lower(account.username), normalized_search) > 0
  )
    and (category_filter is null or account.category = category_filter);

  select coalesce(
    jsonb_agg(page.account_json order by page.match_rank, page.username_lower),
    '[]'::jsonb
  )
  into page_results
  from (
    select
      jsonb_build_object(
        'id', account.id,
        'username', account.username,
        'displayName', account.display_name,
        'category', account.category,
        'avatarUrl', account.avatar_url,
        'avatarFallback', account.avatar_fallback,
        'verifiedGuess', account.verified_guess,
        'tags', account.tags,
        'addedAt', to_char(account.added_at, 'YYYY-MM-DD')
      ) || case
        when account.notes is null then '{}'::jsonb
        else jsonb_build_object('notes', account.notes)
      end as account_json,
      case
        when normalized_search <> '' and lower(account.username) = normalized_search then 0
        when normalized_search <> ''
          and left(lower(account.username), length(normalized_search)) = normalized_search then 1
        else 2
      end as match_rank,
      lower(account.username) as username_lower
    from public.accounts as account
    where (
      normalized_search = ''
      or strpos(lower(account.username), normalized_search) > 0
    )
      and (category_filter is null or account.category = category_filter)
    order by match_rank, username_lower
    limit result_limit
    offset result_offset
  ) as page;

  return jsonb_build_object('results', page_results, 'total', total_matches);
end;
$$;

revoke all on function public.search_accounts(text, text, integer, integer) from public;
grant execute on function public.search_accounts(text, text, integer, integer)
  to anon, authenticated, service_role;
