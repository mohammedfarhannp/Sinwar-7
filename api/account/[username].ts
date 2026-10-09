import { z } from 'zod';
import { accountSchema } from '../../src/types/account';
import type { AccountRow } from '../../server/database.types';
import { checkApiRateLimit, jsonResponse } from '../../server/http';
import {
  getServerSupabaseClient,
  SupabaseConfigurationError,
} from '../../server/supabase';

const usernameSchema = z.string().regex(/^[a-zA-Z0-9._]{1,30}$/);

function getUsername(request: Request): string | null {
  const encodedUsername = new URL(request.url).pathname.split('/').at(-1) ?? '';
  try {
    const parsed = usernameSchema.safeParse(
      decodeURIComponent(encodedUsername),
    );
    return parsed.success ? parsed.data.toLowerCase() : null;
  } catch {
    return null;
  }
}

function mapAccountRow(row: AccountRow) {
  return accountSchema.parse({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    category: row.category,
    avatarUrl: row.avatar_url,
    avatarFallback: row.avatar_fallback,
    verifiedGuess: row.verified_guess,
    tags: row.tags,
    addedAt: row.added_at,
    ...(row.notes ? { notes: row.notes } : {}),
  });
}

export async function GET(request: Request): Promise<Response> {
  const limited = checkApiRateLimit(request);
  if (limited) {
    return limited;
  }

  const username = getUsername(request);
  if (!username) {
    return jsonResponse({ error: 'Invalid account username.' }, 400);
  }

  try {
    const { data, error } = await getServerSupabaseClient()
      .from('accounts')
      .select('*')
      .eq('id', username)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: 'Account details are unavailable.' }, 502);
    }

    if (!data) {
      return jsonResponse({ account: null }, 200, 'no-store');
    }

    const account = mapAccountRow(data);
    return jsonResponse(
      { account },
      200,
      'public, s-maxage=86400, stale-while-revalidate=3600',
    );
  } catch (error: unknown) {
    if (error instanceof SupabaseConfigurationError) {
      return jsonResponse({ error: 'Account details are unavailable.' }, 503);
    }

    return jsonResponse({ error: 'Account details are unavailable.' }, 502);
  }
}
