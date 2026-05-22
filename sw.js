/* Service Worker — Postos JP  v20260522160506 */
var CACHE = 'postos-jp-20260522160506';
var RESOURCES = ['./', 'index.html'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return Promise.all(
        RESOURCES.map(function(url) {
          return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now(), {cache: 'reload'})
            .then(function(r) {
              if (!r.ok) throw new Error('Falha ao descarregar ' + url);
              return c.put(url, r);
            });
        })
      );
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request, {ignoreSearch: true}).then(function(cachedResponse) {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'showNotification') {
    e.waitUntil(
      self.registration.showNotification(e.data.title, {
        body: e.data.body,
        icon: './favicon.ico',
        badge: './favicon.ico',
        tag: 'alteracao-postos',
        renotify: true
      })
    );
  }
});
