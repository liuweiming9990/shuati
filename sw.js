// 缓存优先策略，但对 API 请求走网络
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 如果是 SiliconFlow API 请求，直接 fetch 不缓存
  if (url.hostname === 'api.siliconflow.cn') {
    event.respondWith(fetch(event.request));
    return;
  }

  // 其他请求：缓存优先
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
