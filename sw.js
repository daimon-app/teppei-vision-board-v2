/* TEPPEI VISION BOARD — Service Worker
   目的：GitHub更新 → PWA次回起動 → 新版へ自動更新。
   index.html は network-first（常に最新を優先、オフライン時のみ最後の版）。
   その他アセットは stale-while-revalidate。更新のたびに手動でPWA削除は不要。
   ※中身を差し替えたら VERSION を上げる（teppei-v25 → v26 ...）。 */
const VERSION = 'teppei-v25';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // 新SWを待機させず即インストール
  e.waitUntil(
    caches.open(VERSION).then((c) =>
      Promise.all(SHELL.map((u) => c.add(u).catch(() => null))) // 1つ失敗でも他は入れる
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()) // 既存クライアントをすぐ新SWの管理下へ
  );
});

function isHTML(req) {
  if (req.mode === 'navigate') return true;
  if (req.destination === 'document') return true;
  const u = req.url;
  return u.endsWith('/') || u.endsWith('/index.html') || u.endsWith('index.html');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let sameOrigin = false;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (_) {}
  if (!sameOrigin) return; // クロスオリジンは素通し

  // index.html / ナビゲーション = network-first（最新優先）
  if (isHTML(req)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy).catch(() => {}));
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true })
            .then((hit) => hit || caches.match('./index.html'))
        )
    );
    return;
  }

  // その他アセット = stale-while-revalidate（表示は速く、裏で最新へ更新）
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy).catch(() => {}));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
