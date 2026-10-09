import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { accountsSchema, type Account } from '../src/types/account.ts';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ACCOUNTS_PATH = resolve(PROJECT_ROOT, 'src/data/accounts.json');
const SEED_PATH = resolve(PROJECT_ROOT, 'supabase/seed.sql');
const INSERT_BATCH_SIZE = 250;

function sqlString(value: string | null | undefined): string {
  return value === null || value === undefined
    ? 'null'
    : `'${value.replaceAll("'", "''")}'`;
}

function sqlTextArray(values: string[]): string {
  if (values.length === 0) {
    return "'{}'::text[]";
  }

  return `array[${values.map(sqlString).join(', ')}]::text[]`;
}

function accountValues(account: Account): string {
  return [
    sqlString(account.id),
    sqlString(account.username),
    sqlString(account.displayName),
    sqlString(account.category),
    sqlString(account.avatarUrl),
    sqlString(account.avatarFallback),
    account.verifiedGuess ? 'true' : 'false',
    sqlTextArray(account.tags),
    sqlString(account.addedAt),
    sqlString(account.notes),
  ].join(', ');
}

function buildInsertStatements(accounts: Account[]): string[] {
  const statements: string[] = [];
  for (let start = 0; start < accounts.length; start += INSERT_BATCH_SIZE) {
    const batch = accounts.slice(start, start + INSERT_BATCH_SIZE);
    const values = batch.map((account) => `  (${accountValues(account)})`);
    statements.push(
      [
        'insert into public.accounts (',
        '  id, username, display_name, category, avatar_url, avatar_fallback,',
        '  verified_guess, tags, added_at, notes',
        ') values',
        values.join(',\n'),
        'on conflict (id) do update set',
        '  username = excluded.username,',
        '  display_name = excluded.display_name,',
        '  category = excluded.category,',
        '  avatar_url = excluded.avatar_url,',
        '  avatar_fallback = excluded.avatar_fallback,',
        '  verified_guess = excluded.verified_guess,',
        '  tags = excluded.tags,',
        '  added_at = excluded.added_at,',
        '  notes = excluded.notes;',
      ].join('\n'),
    );
  }
  return statements;
}

async function main(): Promise<void> {
  const source = JSON.parse(await readFile(ACCOUNTS_PATH, 'utf8')) as unknown;
  const accounts = accountsSchema.parse(source);
  const sql = [
    '-- Generated from src/data/accounts.json by npm run db:seed:build.',
    '-- Do not add inferred metadata; update the source dataset and regenerate.',
    `-- Account rows: ${accounts.length}`,
    '',
    ...buildInsertStatements(accounts),
    '',
  ].join('\n');

  await mkdir(dirname(SEED_PATH), { recursive: true });
  const temporaryPath = `${SEED_PATH}.${process.pid}.tmp`;
  try {
    await writeFile(temporaryPath, sql, 'utf8');
    await rename(temporaryPath, SEED_PATH);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }

  console.log(`Generated Supabase seed SQL for ${accounts.length} accounts.`);
}

main().catch(() => {
  console.error('Could not generate the Supabase account seed.');
  process.exitCode = 1;
});
