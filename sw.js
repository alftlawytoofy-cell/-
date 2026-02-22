const CACHE_NAME = 'alkhairat-portal-v4';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'index.css',
  'manifest.json',
  'icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // CRITICAL FIX: Do NOT cache Google Docs/Sheets requests. 
  // Always go to the network for data.
  if (event.request.url.includes('docs.google.com') || event.request.url.includes('spreadsheets')) {
     return; // Return nothing allows the browser to perform a default network request
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});