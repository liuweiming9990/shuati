const CACHE_NAME = 'shuati-v3';

// 需要预缓存的文件列表
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './tubiao.PNG'
];

// 安装时缓存首页及关键配置
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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
