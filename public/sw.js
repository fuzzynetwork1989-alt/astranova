const CACHE_NAME = 'astranova-cache-v1';
const urlsToCache = [
  '/',
  '/api/v1/status',
  '/api/v1/search',
  '/api/v1/chat'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.delete(CACHE_NAME).then(() => {
      return caches.open(CACHE_NAME);
    })
  );
});
