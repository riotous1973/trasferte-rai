const CACHE_NAME = 'rai-trasferte-v2';

const APP_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './css/print-modulo.css',
  './js/data-defaults.js',
  './js/calc-engine.js',
  './js/storage.js',
  './js/ui-editor.js',
  './js/ui-nota-spese.js',
  './js/ui-modulo-print.js',
  './js/ui-massimali.js',
  './js/ui-archive.js',
  './js/app.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first with cache fallback so updates arrive automatically when online
  // while continuing to work completely offline on Samsung/mobile.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
