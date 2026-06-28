const CACHE_NAME = 'shuati-v2';

// 安装时缓存首页
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./', './index.html']);
    })
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 缓存优先策略（秒开）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // 先用缓存，同时后台更新
      const fetchPromise = fetch(event.request).then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

// 手动更新支持
self.addEventListener('message', event => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage('reload'));
    });
  }
});
