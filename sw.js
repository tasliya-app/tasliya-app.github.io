// Tasliya service worker: installable. Gift/effect files are fetched fresh whenever online, so updates reach users at once;
// the last good copy is kept for offline use. The page itself is always fetched fresh (network first).
const AC='tasliya-assets-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const ks=await caches.keys(); await Promise.all(ks.filter(k=>k!==AC).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method==='GET'&&u.origin===location.origin&&/\/(gifts|fx)\.js$/.test(u.pathname)){
    e.respondWith((async()=>{
      const c=await caches.open(AC);
      try{ const x=await fetch(r); if(x&&x.ok){ c.put(r,x.clone()); return x; } }catch(err){}
      const m=await c.match(r); return m||Response.error();
    })());
    return;
  }
  if(r.mode!=='navigate') return;   // let the browser handle everything else (Firebase, scripts, images)
  e.respondWith(fetch(r).catch(()=>new Response('لا يوجد اتصال بالإنترنت',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
