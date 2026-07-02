const CACHE_NAME = 'shuati-v3';
const urlsToCache = ['./', './index.html', './manifest.json', './tubiao.PNG'];

// 安装时缓存首页及关键配置
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 激活时清理旧缓存并立即接管所有页面
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 缓存优先策略，但排除 API 请求
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // 对于外部 API，直接走网络，不缓存
  if (url.hostname.includes('api.siliconflow.cn') || url.hostname.includes('api.jsonbin.io')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // 其他请求：缓存优先，同时后台更新
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
