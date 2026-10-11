import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

let cachedClient: SupabaseClient<Database> | undefined;
let cachedAdminClient: SupabaseClient<Database> | undefined;

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Server-side Supabase configuration is missing.');
    this.name = 'SupabaseConfigurationError';
  }
}

export function getServerSupabaseClient(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const env = (globalThis as RuntimeGlobal).process?.env;
  const supabaseUrl = env?.SUPABASE_URL;
  const publishableKey = env?.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new SupabaseConfigurationError();
  }

  cachedClient = createClient<Database>(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

/**
 * The elevated client is reserved for the protected avatar-enrichment routes.
 * Public search and account endpoints must continue to use the publishable key.
 */
export function getServerSupabaseAdminClient(): SupabaseClient<Database> {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const env = (globalThis as RuntimeGlobal).process?.env;
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new SupabaseConfigurationError();
  }

  cachedAdminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return cachedAdminClient;
}
