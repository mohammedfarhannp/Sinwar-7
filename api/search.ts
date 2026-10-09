import { z } from 'zod';
import { accountsSchema, ACCOUNT_CATEGORIES } from '../src/types/account';
import { checkApiRateLimit, jsonResponse } from '../server/http';
import {
  getServerSupabaseClient,
  SupabaseConfigurationError,
} from '../server/supabase';

const querySchema = z.object({
  q: z
    .string()
    .refine(
      (value) => value === '' || /^[a-zA-Z0-9._]{2,30}$/.test(value),
      'Search must be an Instagram username or username fragment.',
    ),
  category: z.enum([...ACCOUNT_CATEGORIES, 'all']),
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0).max(100_000),
});

const resultSchema = z.object({
  results: accountsSchema,
  total: z.number().int().nonnegative(),
});

const ALLOWED_QUERY_KEYS = new Set(['q', 'category', 'limit', 'offset']);

function parseSearchParameters(url: URL) {
  const raw: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (!ALLOWED_QUERY_KEYS.has(key) || key in raw) {
      return null;
    }
    raw[key] = value;
  }

  const q = (raw.q ?? '').trim().replace(/^@/, '').toLowerCase();
  const limit = raw.limit === undefined ? 48 : Number(raw.limit);
  const offset = raw.offset === undefined ? 0 : Number(raw.offset);
  const parsed = querySchema.safeParse({
    q,
    category: raw.category ?? 'all',
    limit,
    offset,
  });

  return parsed.success ? parsed.data : null;
}

export async function GET(request: Request): Promise<Response> {
  const limited = checkApiRateLimit(request);
  if (limited) {
    return limited;
  }

  const parameters = parseSearchParameters(new URL(request.url));
  if (!parameters) {
    return jsonResponse({ error: 'Invalid search parameters.' }, 400);
  }

  try {
    const { data, error } = await getServerSupabaseClient().rpc(
      'search_accounts',
      {
        search_query: parameters.q,
        category_filter:
          parameters.category === 'all' ? null : parameters.category,
        result_limit: parameters.limit,
        result_offset: parameters.offset,
      },
    );

    if (error) {
      return jsonResponse({ error: 'Search is temporarily unavailable.' }, 502);
    }

    const parsedResponse = resultSchema.safeParse(data);
    if (!parsedResponse.success) {
      return jsonResponse({ error: 'Search is temporarily unavailable.' }, 502);
    }

    return jsonResponse(parsedResponse.data, 200, 'no-store');
  } catch (error: unknown) {
    if (error instanceof SupabaseConfigurationError) {
      return jsonResponse({ error: 'Search is temporarily unavailable.' }, 503);
    }

    return jsonResponse({ error: 'Search is temporarily unavailable.' }, 502);
  }
}
