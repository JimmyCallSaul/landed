/* Landed service worker: keeps a copy of the app on the phone so it opens without a connection.
   Only same-origin files are handled. Weather, exchange rates, webcams and the live room are never cached here. */
const CACHE="landed-1674cd5018";
const CORE=["./","index.html","manifest.webmanifest","config.js","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png","icons/favicon-32.png"];

const OWN=new Set(CORE.map(u=>new URL(u,self.registration.scope).href));

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("landed-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

/* Pages: try the network first, but after 3 s fall back to the saved copy (weak signal abroad). */
function page(req){
  return new Promise(resolve=>{
    let done=false;
    const fallback=()=>caches.match("index.html").then(h=>h||caches.match("./"));
    const t=setTimeout(()=>fallback().then(h=>{if(h&&!done){done=true;resolve(h)}}),3000);
    fetch(req).then(r=>{
      clearTimeout(t);
      if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp))}
      if(!done){done=true;resolve(r)}
    }).catch(()=>{
      clearTimeout(t);
      fallback().then(h=>{if(!done){done=true;resolve(h||Response.error())}});
    });
  });
}
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  if(req.mode==="navigate"){e.respondWith(page(req));return}
  /* Only the app's own files are handled here (icons, config). Everything else goes straight to the network. */
  if(!OWN.has(url.href.split("?")[0]))return;
  /* Saved copy at once, refreshed in the background. */
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
