import type { AccountCategory } from '../src/types/account';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AccountRow = {
  id: string;
  username: string;
  display_name: string | null;
  category: AccountCategory;
  avatar_url: string | null;
  avatar_status: 'pending' | 'fetched' | 'failed' | 'skipped';
  avatar_attempts: number;
  avatar_last_attempt_at: string | null;
  avatar_error: string | null;
  avatar_fallback: string;
  verified_guess: boolean;
  tags: string[];
  added_at: string;
  notes: string | null;
};

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: AccountRow;
        Insert: Omit<AccountRow, 'notes'> & { notes?: string | null };
        Update: Partial<AccountRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_accounts: {
        Args: {
          search_query: string;
          category_filter: string | null;
          result_limit: number;
          result_offset: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
