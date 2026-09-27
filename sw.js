const CACHE_NAME = 'territory-rate-v0.6';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon_rugby-territory-rate.png'
];

// インストール時に直ちにアクティブ化（skipWaiting）
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// 古いキャッシュの確実な削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ネットワークファースト戦略（常に最新を取りに行く）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 取得成功したらキャッシュも最新に更新
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // オフライン時のみキャッシュを返す
        return caches.match(event.request);
      })
  );
});
