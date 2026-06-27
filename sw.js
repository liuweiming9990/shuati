// 网络优先策略，自动更新
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      const cloned = response.clone();
      caches.open('shuati-dynamic').then(cache => cache.put(event.request, cloned));
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 安装时跳过等待
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 激活时立即接管所有页面
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// 接收来自页面的“检查更新”消息
self.addEventListener('message', event => {
  if (event.data === 'check-update') {
    self.skipWaiting();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage('reload'));
    });
  }
});
