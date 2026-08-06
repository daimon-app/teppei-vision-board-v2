/* TEPPEI VISION BOARD — Service Worker
   初回アクセスで本体＋音声をキャッシュし、以降はオフライン再生できる。
   音声を差し替えた／中身を更新したら CACHE の版番号を上げる。 */
const CACHE = 'tvb-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './audio/main.m4a',
  './audio/bird.mp3'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(
      ASSETS.map((u) => c.add(u).catch(() => null)) // 1つ失敗しても他は入れる
    ))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // 同一オリジンの成功レスポンスは動的にキャッシュ
        try {
          if (res && res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
        } catch (err) {}
        return res;
      }).catch(() => hit); // オフラインでヒットなし → undefined（画面は静音で継続）
    })
  );
});
