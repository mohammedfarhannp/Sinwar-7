import { accounts } from '../src/data/accounts';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function GET(request: Request): Response {
  const origin = new URL(request.url).origin;
  const publicPaths = ['/', '/story', '/about'];
  const pageUrls = publicPaths.map((path) => `${origin}${path}`);
  const profileUrls = accounts.map(
    (account) => `${origin}/profile/${encodeURIComponent(account.username)}`,
  );
  const urlEntries = [...pageUrls, ...profileUrls]
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
