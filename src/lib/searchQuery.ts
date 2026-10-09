export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/^@/, '').trim().toLowerCase();
}
