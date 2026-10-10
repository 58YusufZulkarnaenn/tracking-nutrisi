var CACHE = 'tracker-v2';
var ASSETS = [
  '/',
  '/index.html',
  '/makanan.html',
  '/gym.html',
  '/assistant.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// ===== INSTALL =====
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // pakai .catch per URL biar kalau ada file yang belum ada (gym.html belum dibikin)
      // nggak bikin install gagal total
      return Promise.all(ASSETS.map(function(url){
        return c.add(url).catch(function(){ return null; });
      }));
    })
  );
  self.skipWaiting();
});

// ===== ACTIVATE =====
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// ===== FETCH =====
self.addEventListener('fetch', function(e){
  var req = e.request;

  // 1. Skip non-GET
  if(req.method !== 'GET') return;

  // 2. Skip cross-origin
  var url;
  try { url = new URL(req.url); } catch(err) { return; }
  if(url.origin !== self.location.origin) return;

  // 3. Skip API — biar data selalu fresh dari Cloudflare KV
  if(url.pathname.indexOf('/api/') === 0) return;

  // 4. HTML / navigasi → NETWORK-FIRST (selalu ambil versi terbaru)
  var accept = req.headers.get('accept') || '';
  var isHTML = req.mode === 'navigate' || accept.indexOf('text/html') !== -1;

  if(isHTML){
    e.respondWith(
      fetch(req).then(function(res){
        if(res && res.status === 200){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){
        // offline fallback
        return caches.match(req).then(function(r){
          return r || caches.match('/');
        });
      })
    );
    return;
  }

  // 5. Asset statis (CSS/JS/gambar) → CACHE-FIRST
  e.respondWith(
    caches.match(req).then(function(r){
      if(r) return r;
      return fetch(req).then(function(res){
        if(res && res.status === 200){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
