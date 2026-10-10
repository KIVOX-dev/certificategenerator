// Minimal offline support: static assets are cached; pages fall back to /offline.html when the network is down.
// API calls (/api) are never cached, so certificate data is always fresh.
const VERSION = 'v1';
const STATIC = `static-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.add('/offline.html')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }
  // Hashed build assets and icons never change for a given URL: cache-first.
  if (url.pathname.startsWith('/_next/static/') || /^\/(icon|apple-icon)/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
