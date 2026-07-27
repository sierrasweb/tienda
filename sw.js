const CACHE_NAME = 'buen-trigo-v3'; // <-- ¡Subimos a v3 para forzar el cambio!
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Instalar y guardar los archivos iniciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activar y borrar las cachés viejas (¡Esto faltaba!)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si la caché no es la versión actual, la borramos
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Buscar en internet primero, si falla usar caché (Network First)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si hay internet y responde bien, actualizamos la caché con la versión nueva
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Si falla (ej. no hay internet), usamos lo que esté en la caché
        return caches.match(event.request);
      })
  );
});
