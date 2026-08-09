const CACHE='scentos-v1';
self.addEventListener('install',(e)=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/'])));self.skipWaiting();}});
self.addEventListener('activate',(e)=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();}});
self.addEventListener('fetch',(e)=>{{
  const{{request}}=e;if(request.method!=='GET')return;
  const isAsset=/\.(png|jpg|svg|webp|ico|woff2?)$/.test(new URL(request.url).pathname);
  if(isAsset){{e.respondWith(caches.match(request).then(c=>c||fetch(request).then(r=>{{caches.open(CACHE).then(c2=>c2.put(request,r.clone()));return r;}})));return;}}
  e.respondWith(fetch(request).then(r=>{{caches.open(CACHE).then(c=>c.put(request,r.clone()));return r;}}).catch(()=>caches.match(request)));
}});
