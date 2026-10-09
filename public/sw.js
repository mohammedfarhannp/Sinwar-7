const CACHE_NAME = 'sinwar7-static-v1';
const PRECACHE_URLS = ['/manifest.webmanifest', '/icon.svg', '/theme-init.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shellResponse = await fetch('/', { cache: 'reload' });
      if (!shellResponse.ok) {
        throw new Error('Could not load the application shell.');
      }

      const manifestResponse = await fetch('/build-manifest.json', {
        cache: 'reload',
      });
      if (!manifestResponse.ok) {
        throw new Error('Could not load the application asset manifest.');
      }
      const manifest = await manifestResponse.json();
      const manifestAssets = Object.values(manifest)
        .flatMap((entry) => [
          entry.file,
          ...(entry.css || []),
          ...(entry.assets || []),
        ])
        .filter((path) => typeof path === 'string');
      const assetUrls = [...new Set([...PRECACHE_URLS, ...manifestAssets])].map(
        (path) => new URL(path, self.location.origin).toString(),
      );

      const cache = await caches.open(CACHE_NAME);
      await cache.put('/', shellResponse.clone());
      await cache.put('/index.html', shellResponse.clone());
      await cache.addAll(assetUrls);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('sinwar7-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const shell = await caches.match('/');
        return shell || Response.error();
      }),
    );
    return;
  }

  const isCachedStaticAsset =
    url.pathname.startsWith('/assets/') || PRECACHE_URLS.includes(url.pathname);
  if (!isCachedStaticAsset) {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
