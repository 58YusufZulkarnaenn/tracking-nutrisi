var CACHE = 'tracker-makan-v1';
var ASSETS = ['/', '/index.html'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; })
      .map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  e.respondWith(caches.match(e.request).then(function(r){
    return r || fetch(e.request).then(function(res){
      if(e.request.method==='GET' && res.status===200){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){ return caches.match('/index.html'); });
  }));
});
