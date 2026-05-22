/* Service Worker — Postos JP  v20260522142856 */
var CACHE = 'postos-jp-20260522142856';
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
      caches.match(e.request).then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se não encontrar o URL específico (ex: com query params ou hash), tenta os padrões
        var urlStr = e.request.url;
        if (urlStr.indexOf('index.html') >= 0) {
          return caches.match('index.html').then(function(r) {
            return r || caches.match('./');
          });
        }
        return caches.match('./').then(function(r) {
          return r || fetch(e.request);
        });
      })
    );
  }
});
