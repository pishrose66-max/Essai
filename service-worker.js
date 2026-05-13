// TOVA Immigration – Service Worker
const CACHE_NAME = 'tova-immigration-v1';
const ASSETS = [
  './TOVA_Immigration.html',
  './manifest.json'
];

// Installation : mise en cache des fichiers essentiels
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interception des requêtes : réseau d'abord, cache en secours
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la réponse est valide, on la met en cache et on la retourne
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Hors-ligne : on retourne la version en cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback sur la page principale si rien n'est trouvé
          return caches.match('./TOVA_Immigration.html');
        });
      })
  );
});
