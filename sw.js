const CACHE_NAME = 'shuati-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./', './index.html']);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'check-update') {
    self.skipWaiting();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage('update-ready'));
    });
  }
});
