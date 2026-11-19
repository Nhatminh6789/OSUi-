const VER='osui-v50',
FILES=['./','index.html','style.css?v=50','firebase-config.js?v=50','script.js?v=50','online.js?v=50','multi.js?v=50','modes.js?v=50','touhosu.js?v=50','sentakki.js?v=50','hitokori.js?v=50','vorbis.js?v=50','manifest.json',
'assets/logo.png','assets/default-hitcircle.png?v=50','assets/default-approach.png?v=50','assets/default-spin.png?v=50','assets/default-hp.png?v=50','assets/default-mania.osk?v=50','assets/menu-logo.png','assets/icon-play.png','assets/icon-setting.png',
'assets/apple-touch-icon.png','assets/icon-osu.png','assets/icon-mania.png','assets/mode-osu.mp3','assets/mode-mania.mp3','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VER).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(VER);
    const hit=await c.match(r,{ignoreSearch:r.mode==='navigate'})||(r.mode==='navigate'?await c.match('index.html')||await c.match('./'):null);
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}   // có cache -> dùng ngay (offline vẫn chạy), đồng thời cập nhật ngầm
    return (await net)||new Response('Offline',{status:503,statusText:'Offline'});
  })());
});
