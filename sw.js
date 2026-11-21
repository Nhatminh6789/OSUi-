const VER='osui-v79',
FILES=['./','index.html','style.css?v=66','firebase-config.js?v=56','script.js?v=72','online.js?v=58','multi.js?v=59','modes.js?v=64','touhosu.js?v=61','sentakki.js?v=62','hitokori.js?v=70','pausehold.js?v=1','vorbis.js?v=56','manifest.json',
'assets/logo.png','assets/default-hitcircle.png?v=56','assets/default-approach.png?v=56','assets/default-spin.png?v=56','assets/default-hp.png?v=56','assets/default-mania.osk?v=56','assets/default-comboburst.png?v=1','assets/menu-logo.png','assets/icon-play.png','assets/icon-setting.png',
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
    if(hit){e.waitUntil(net);return hit}
    return (await net)||new Response('Offline',{status:503,statusText:'Offline'});
  })());
});
