

(()=>{const ok=e=>{const t=e.target;return t&&t.closest&&t.closest('input[type=text],input[type=search],input[type=email],input[type=password],input[type=url],input[type=number],input:not([type]),textarea,[contenteditable]')};
 document.addEventListener('selectstart',e=>{if(!ok(e))e.preventDefault()});document.addEventListener('contextmenu',e=>{if(!ok(e))e.preventDefault()});
 document.addEventListener('dblclick',e=>{if(!ok(e))e.preventDefault()});

 document.addEventListener('touchstart',e=>{const t=e.target;if(t&&(t.id==='c'||t.id==='x'||(t.closest&&t.closest('.omroot'))))e.preventDefault()},{passive:false,capture:true});
 document.addEventListener('touchmove',e=>{const t=e.target;if(t&&(t.id==='c'||(t.closest&&t.closest('.omroot'))))e.preventDefault()},{passive:false,capture:true});
 let lt=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lt<350&&!ok(e))e.preventDefault();lt=n},{passive:false});
 ['gesturestart','gesturechange','gestureend'].forEach(n=>document.addEventListener(n,e=>e.preventDefault()))})();
(()=>{
const LS='osui_om',K={on:'',ctl:'dpad',size:100,op:85,left:0,files:[],cfg:{}};
try{Object.assign(K,JSON.parse(localStorage.getItem(LS)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(K))}catch(e){}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const latin=b=>{let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return s};
const OM=window.OM={adapters:{},assets:{},msg:'',K};
OM.register=a=>{OM.adapters[a.id]=a;return a};
const CTL=[['dpad','D-pad'],['float','D-pad thả nổi'],['stick','Joystick']];

const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('osui_modes',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const dbp=async(m,fn)=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('f',m),q=fn(t.objectStore('f'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})};
const dPut=(k,v)=>dbp('readwrite',s=>s.put(v,k)),dGet=k=>dbp('readonly',s=>s.get(k)),dDel=k=>dbp('readwrite',s=>s.delete(k));

const CORE=/^(Scoring|Objects|UI|Mods|Judgements|Replays|Difficulty|Beatmaps|Configuration|Edit|Osu|Mania|Taiko|Catch|Scoring|Timing|Types|Skinning|Online|Filter)$/;
function parseDll(b){
 if(!(b[0]===77&&b[1]===90))throw Error('Không phải file .dll hợp lệ');
 const s=latin(b),cnt={};let m;const re=/osu\.Game\.Rulesets\.([A-Za-z][A-Za-z0-9_]*)(\.[A-Za-z]|\b)/g;
 while((m=re.exec(s)))if(!CORE.test(m[1]))cnt[m[1]]=(cnt[m[1]]||0)+(m[2]?1:.2);
 const names=Object.keys(cnt).sort((a,c)=>cnt[c]-cnt[a]);
 const len=i=>b[i-4]|b[i-3]<<8|b[i-2]<<16|b[i-1]<<24,pngs=[],audio=[];
 const scan=(sig,fn)=>{let i=0;while((i=s.indexOf(sig,i))>=0){if(i>=4)fn(i,len(i));i+=sig.length}};
 scan('\x89PNG\r\n\x1a\n',(i,L)=>{if(L>0&&L<4e6&&i+L<=b.length)pngs.push(b.slice(i,i+L))});
 scan('ID3',(i,L)=>{if(L>200&&L<8e6&&i+L<=b.length)audio.push({type:'mp3',bytes:b.slice(i,i+L)})});
 scan('OggS',(i,L)=>{if(L>200&&L<8e6&&i+L<=b.length)audio.push({type:'ogg',bytes:b.slice(i,i+L)})});
 scan('RIFF',(i,L)=>{if(L>200&&L<8e6&&i+L<=b.length&&s.substr(i+8,4)==='WAVE')audio.push({type:'wav',bytes:b.slice(i,i+L)})});
 return{names,name:names[0]||'',pngs,audio,bytes:b}}
OM._parse=parseDll;
const findAd=info=>{for(const id in OM.adapters){const a=OM.adapters[id];if(a.auto)continue;try{if(a.match?a.match(info):info.names.some(n=>n.toLowerCase()===(a.asm||a.id).split('.').pop().toLowerCase()))return a}catch(e){}}return null};

function runPlugin(code){const before=new Set(Object.keys(OM.adapters));new Function('OM',code)(OM);return Object.keys(OM.adapters).filter(k=>!before.has(k))}
async function mkMode(a,info){const A=await a.build(info);OM.assets[a.id]=A;let icon='';try{icon=(a.icon&&a.icon(A))||''}catch(e){}return{id:a.id,name:a.name,icon}}

const slug=t=>String(t||'mode').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'mode';
const AC=['#ff5a8a','#5ab4ff','#ffd84d','#7dff9a'];
function autoAdapter(info,fname){
 const nm=info.name||String(fname||'Mode').replace(/\.dll$/i,'').replace(/^osu\.Game\.Rulesets\./i,''),id='auto-'+slug(nm);
 if(OM.adapters[id])return OM.adapters[id];
 const FW=384,FH=480;
 return OM.register({id,name:nm,auto:true,
  settings:[{k:'fall',label:'Tốc độ rơi',t:'seg',o:[['Chậm',1500],['Vừa',1050],['Nhanh',750]],def:1050},
   {k:'size',label:'Cỡ nhân vật',t:'seg',o:[['Nhỏ',.75],['Vừa',1],['To',1.4]],def:1},
   {k:'dim',label:'Playfield dim',t:'range',min:0,max:100,step:5,u:'%',def:60}],
  support:M=>M.mode?nm+' chỉ chơi map osu!standard':'',
  async build(info){
   const raw=await Promise.all(info.pngs.map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null))),im=raw.filter(Boolean),
    ok=im.filter(b=>b.width>=12&&b.height>=12&&b.width<=300&&b.height<=300),sq=ok.filter(b=>{const r=b.width/b.height;return r>.5&&r<2});
   const player=(sq[0]||ok[0]||im[0])||null,objs=ok.filter(b=>b!==player).slice(0,12),icon=player||im[0]||null;
   const A={ok:true,player,objs,icon,sfxRaw:(info.audio[0]||{}).bytes||null,sfx:null};return A},
  icon(A){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
   if(A.icon){const r=Math.min(128/A.icon.width,128/A.icon.height);x.drawImage(A.icon,(128-A.icon.width*r)/2,(128-A.icon.height*r)/2,A.icon.width*r,A.icon.height*r)}
   else{x.fillStyle='#5ab4ff';x.beginPath();x.arc(64,64,48,0,7);x.fill();x.fillStyle='#fff8';x.beginPath();x.arc(48,48,16,0,7);x.fill()}return c.toDataURL()},
  async start(ctx){
   const{M,buf,cfg,A}=ctx;
   if(!A.sfx&&A.sfxRaw&&window.ac){try{const b=A.sfxRaw;A.sfx=await new Promise((r,j)=>{const q=ac.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),r,j);if(q&&q.catch)q.catch(j)})}catch(e){}}
   const md=(typeof mods==='function')?mods():new Set,rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,NF=md.has('NF'),SD=md.has('SD')||md.has('PF'),EZ=md.has('EZ'),HR=md.has('HR'),AUTO=md.has('AT')||md.has('CN');
   const fall=cfg.fall*(EZ?1.2:HR?.85:1),ho=(M.ho||[]).filter(o=>o.kind!=='p').sort((a,b)=>a.time-b.time),first=ho.length?ho[0].time:0,lead=Math.max(0,1800-first),
    PY=FH-56,pw=(A.player?Math.min(46,A.player.width):30)*cfg.size,ph=A.player?pw*A.player.height/A.player.width:pw,OR=12;
   const R={n:[0,0,0,0],score:0,combo:0,max:0,hp:1,ni:0,orbs:[],pl:{x:FW/2,y:PY},over:false,paused:false,last:null,now:-lead,fps:60,raf:0,src:null,fx:[]};
   const lastT=ho.length?ho[ho.length-1].time:0,t0init=ac.currentTime+.2+lead/1000;let t0=t0init;
   const play=(ms,at)=>{if(R.src){try{R.src.stop()}catch(e){}R.src=null}if(buf){const s=ac.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.connect(aout('u'));if(at!=null)s.start(at);else s.start(0,Math.max(0,ms)/1000);R.src=s}};
   const kill=()=>{R.over=true;cancelAnimationFrame(R.raf);if(R.src)try{R.src.stop()}catch(e){}R.src=null;try{ac.resume()}catch(e){}try{g.clearRect(0,0,W,H)}catch(e){}};
   const S=OM.session({fw:FW,fh:FH,buttons:[],
    onPause(){R.paused=true;try{ac.suspend()}catch(e){}},
    onResume(){R.paused=false;try{ac.resume()}catch(e){}R.last=null;R.raf=requestAnimationFrame(loop)},
    onRestart(){kill();ctx.restart()},onQuit(){kill();ctx.quit()},
    onSkip(ms){t0=ac.currentTime-ms/1000/rate;play(ms);R.last=null;let k=0;while(k<ho.length&&ho[k].time<ms+fall)k++;R.ni=Math.max(R.ni,k);R.orbs=[]},
    onLayout(){if(R.paused&&!R.over)draw(R.now)}});
   hide();try{setAuto(false)}catch(e){}play(0,t0);try{ac.resume()}catch(e){}
   const sfx=()=>{if(A.sfx){try{const s=ac.createBufferSource();s.buffer=A.sfx;s.connect(aout('f'));s.start()}catch(e){}}};
   const judge=v=>{const n=R.n;if(v===300){n[0]++;R.combo++;R.score+=Math.round(300*(1+Math.min(R.combo,100)/25));R.hp=Math.min(1,R.hp+.03)}
    else if(v===100){n[1]++;R.combo++;R.score+=100;R.hp=Math.min(1,R.hp+.015)}else if(v===50){n[2]++;R.combo++;R.score+=50}
    else{n[3]++;R.combo=0;R.hp-=EZ?.05:.09;if(SD)R.hp=0}R.max=Math.max(R.max,R.combo);
    if(R.hp<=0){if(NF)R.hp=.05;else return false}return true};
   function loop(){if(R.over||R.paused)return;const now=(ac.currentTime-t0)*1000*rate,dt=R.last==null?0:Math.min(.05,Math.max(0,(now-R.last)/1000));R.last=now;R.now=now;if(dt>0)R.fps=R.fps*.92+(1/dt)*.08;
    const I=S.read(),pl=R.pl;if(AUTO){const o0=R.orbs[0];if(o0){const k=1-Math.exp(-dt*18);pl.x+=(Math.max(pw/2,Math.min(FW-pw/2,o0.x))-pl.x)*k}pl.y+=(PY-pl.y)*.3}else{pl.x=Math.max(pw/2,Math.min(FW-pw/2,pl.x+I.x*(I.f?170:340)*dt));pl.y=Math.max(FH*.45,Math.min(PY,pl.y+I.y*(I.f?170:340)*dt))}
    while(R.ni<ho.length&&ho[R.ni].time-fall<=now){const o=ho[R.ni];R.orbs.push({x:24+Math.max(0,Math.min(512,o.x))/512*(FW-48),t:o.time,c:R.ni%4,im:R.ni});R.ni++}
    S.setSkip(R.ni===0&&ho.length&&ho[0].time-now>3500?ho[0].time-2000:null);
    for(let i=R.orbs.length-1;i>=0;i--){const o=R.orbs[i];if(now>=o.t){R.orbs.splice(i,1);if(AUTO){pl.x=Math.max(pw/2,Math.min(FW-pw/2,o.x));pl.y=PY}const dx=Math.abs(o.x-pl.x),dy=Math.abs(PY-pl.y),lim=pw*.5+OR;
      let v=0;if(dx<lim&&dy<ph*.6+OR+20)v=dx<pw*.2?300:dx<pw*.38?100:50;if(v){sfx();R.fx.push({x:o.x,y:PY,t:now,c:AC[o.c]})}if(judge(v)===false)return finish(true)}}
    if(R.ni>=ho.length&&!R.orbs.length&&now>lastT+1500)return finish(false);
    draw(now);R.raf=requestAnimationFrame(loop)}
   function draw(now){const L=S.lay,{fx,fy,fw,fh,sc}=L,pl=R.pl;g.save();g.clearRect(0,0,W,H);
    if(ctx.bg){const r=Math.max(W/ctx.bg.width,H/ctx.bg.height);g.drawImage(ctx.bg,(W-ctx.bg.width*r)/2,(H-ctx.bg.height*r)/2,ctx.bg.width*r,ctx.bg.height*r);g.fillStyle='rgba(0,0,0,'+(.45+.5*cfg.dim/100)+')';g.fillRect(0,0,W,H)}else{g.fillStyle='#0b0b16';g.fillRect(0,0,W,H)}
    g.fillStyle='rgba(0,0,0,'+(.25+.6*cfg.dim/100)+')';g.fillRect(fx,fy,fw,fh);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;g.strokeRect(fx,fy,fw,fh);
    g.save();g.beginPath();g.rect(fx,fy,fw,fh);g.clip();g.translate(fx,fy);g.scale(sc,sc);
    for(const o of R.orbs){const y=-20+(1-(o.t-now)/fall)*(PY+20);if(A.objs.length){const im=A.objs[o.im%A.objs.length],r=OR*2/Math.max(im.width,im.height)*1.6;g.drawImage(im,o.x-im.width*r/2,y-im.height*r/2,im.width*r,im.height*r)}
     else{g.fillStyle=AC[o.c];g.beginPath();g.arc(o.x,y,OR,0,6.2832);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke()}}
    R.fx=R.fx.filter(f=>now-f.t<300);for(const f of R.fx){const k=(now-f.t)/300;g.globalAlpha=1-k;g.strokeStyle=f.c;g.lineWidth=3;g.beginPath();g.arc(f.x,f.y,10+k*26,0,6.2832);g.stroke()}g.globalAlpha=1;
    if(A.player)g.drawImage(A.player,pl.x-pw/2,pl.y-ph/2,pw,ph);else{g.fillStyle='#ff66aa';g.fillRect(pl.x-pw/2,pl.y-8,pw,16)}
    g.restore();
    const tot=Math.max(1,buf?buf.duration*1000:lastT+1500);
    const n=R.n,t=n[0]+n[1]+n[2]+n[3],acc=t?(300*n[0]+100*n[1]+50*n[2])/(300*t):1,hud=L.hud;g.textBaseline='alphabetic';g.fillStyle='#fff';
        OM.hud({score:R.score,combo:R.combo,acc,hp:R.hp},L,now,tot);
    OM.fps(R.fps)
    g.restore()}
   function finish(fail){if(R.over)return;kill();S.close();const n=R.n,t=n[0]+n[1]+n[2]+n[3],acc=t?(300*n[0]+100*n[1]+50*n[2])/(300*t):1;
    OM.results({mode:nm,M,score:R.score,cells:[['300',n[0],'#6cf'],['100',n[1],'#8f6'],['50',n[2],'#fc4'],['miss',n[3],'#f55']],max:R.max,acc,fail,retry:()=>ctx.restart(),back:()=>ctx.quit()})}
   R.raf=requestAnimationFrame(loop)}})}
const resolve=(info,fname)=>findAd(info)||autoAdapter(info,fname);
OM.autoAdapter=autoAdapter;

OM.rank=(acc,fail)=>fail?'F':acc>=1?'SS':acc>=.95?'S':acc>=.9?'A':acc>=.8?'B':acc>=.7?'C':'D';
OM.modText=()=>{try{return[...mods()].filter(Boolean).join(' ')}catch(e){return''}};
OM.results=function(o){
 const jc={SS:'#ffd84d',S:'#ffd84d',A:'#7ddc4a',B:'#4aa8ff',C:'#c77dff',D:'#ff5a5a',F:'#ff5a5a'},M0=o.M||{},rk=OM.rank(o.acc,o.fail),
  cell=c=>'<div class="rc"><span style="color:'+c[2]+'">'+c[0]+'</span><b>'+c[1]+'x</b></div>',
  miss=o.miss!=null?o.miss:(o.cells.find(c=>/miss/i.test(c[0]))||[0,0])[1],pf=o.fail?'Thất bại':miss===0?(o.acc>=1?'Hoàn hảo':'Full Combo'):'Hoàn thành',
  mt=(o.mods!=null?o.mods:OM.modText()).split(' ').filter(Boolean).map(m=>'<i class="rm">'+m+'</i>').join(''),
  ex=(o.extra||[]).map(e=>'<div><small>'+e[0]+'</small><b>'+e[1]+'</b></div>').join('');
 show('<div class="rk"><div class="rkh"><div class="a"><b class="tn">'+esc((M0.title||'')+(M0.artist?' - '+M0.artist:'')+(M0.ver?' ['+M0.ver+']':''))+'</b><small>'+esc(o.mode||'')+' · Chơi lúc '+new Date().toLocaleString()+'</small></div><div class="rkt">Xếp hạng</div></div>'+
 '<div class="rkb"><div class="rkl"><div class="rks"><span>Điểm</span><b>'+String(o.score).padStart(8,'0')+'</b></div><div class="rkp"><div class="rg">'+o.cells.map(cell).join('')+'</div><div class="rq"><div><small>Combo</small><b>'+o.max+'x</b></div><div><small>Độ chính xác</small><b>'+(o.acc*100).toFixed(2)+'%</b></div>'+ex+'</div></div></div>'+
 '<div class="rkR">'+(typeof rkBig==='function'?rkBig(rk,jc[rk]):'<div class="rkk" style="color:'+(jc[rk]||'#fff')+'">'+rk+'</div>')+(mt?'<div class="rms">'+mt+'</div>':'')+'<button class="rbt" id="omRt">Chơi lại</button></div></div>'+
 '<div class="rkf"><button class="rbk" id="omBk">'+(typeof ico==='function'?ico('back'):'')+' Back</button><div class="rpf">'+pf+'</div></div></div>','rk');
 const r=document.getElementById('omRt'),b=document.getElementById('omBk');if(r)r.onclick=()=>o.retry&&o.retry();if(b)b.onclick=()=>o.back&&o.back();
 if(!o.fail&&rk!=='D'){try{sndPlay('applause',100)}catch(e){}}
 return rk};

const fileEntry=n=>K.files.find(f=>f.n===n);
OM.install=async file=>{OM.msg='';try{const n=file.name,js=/\.js$/i.test(n);let ent={n,kind:js?'js':'dll',modes:[]};
  if(js){const code=await file.text(),ids=runPlugin(code);await dPut(n,code);
   for(const id of ids){const a=OM.adapters[id];if(a.standalone)ent.modes.push(await mkMode(a,{names:[],pngs:[],audio:[],bytes:null}))}
   OM.msg=ids.length?'Đã thêm plugin: '+ids.join(', '):'Plugin không đăng ký chế độ nào (OM.register)';
   await matchPending()}
  else{const b=new Uint8Array(await file.arrayBuffer()),info=parseDll(b),a=resolve(info,n);await dPut(n,b);ent.auto=!!a.auto;ent.modes.push(await mkMode(a,info));OM.msg=a.auto?'Đã tự dựng chế độ "'+a.name+'" từ file .dll (luật chơi chung, dùng ảnh/âm thanh trong .dll)':''}
  K.files=K.files.filter(f=>f.n!==n);K.files.push(ent);save()}
 catch(e){OM.msg=e.message||'Lỗi'}refresh()};
async function matchPending(){for(const f of K.files){if(f.kind!=='dll'||!f.auto)continue;try{const b=await dGet(f.n),info=parseDll(b),a=findAd(info);if(a){for(const m of f.modes||[])if(OM.adapters[m.id]&&OM.adapters[m.id].auto){if(K.on===m.id)K.on=a.id;delete OM.adapters[m.id]}f.modes=[await mkMode(a,info)];f.auto=false;delete f.err}}catch(e){}}}
OM.remove=async n=>{const f=fileEntry(n);if(!f)return;if(f.modes.some(m=>m.id===K.on))K.on='';K.files=K.files.filter(x=>x!==f);try{await dDel(n)}catch(e){}save();refresh()};

const SEED=[['sentakki','osu.Game.Rulesets.Sentakki.dll'],['hitokori','osu.Game.Rulesets.Hitokori.dll']];
async function boot(){
 try{const L=JSON.parse(localStorage.getItem('osui_th')||'null');if(L&&L.dll&&!K.files.length){const bin=atob(L.dll),b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);
   const info=parseDll(b),a=resolve(info,'Touhosu');if(a){await dPut('osu.Game.Rulesets.Touhosu.dll',b);K.files.push({n:'osu.Game.Rulesets.Touhosu.dll',kind:'dll',modes:[await mkMode(a,info)]});K.cfg[a.id]={cnt:L.cnt||1,dim:L.dim==null?60:L.dim};if(L.on)K.on=a.id}
   delete L.dll;localStorage.setItem('osui_th',JSON.stringify(L));save()}}catch(e){}

 K.seeded=K.seeded||{};
 for(const[sid,fn]of SEED){if(K.seeded[sid]||fileEntry(fn))continue;
  try{const r=await fetch('assets/modes/'+fn);if(!r.ok)continue;const b=new Uint8Array(await r.arrayBuffer());if(b[0]!==77||b[1]!==90)continue;
   const info=parseDll(b),a=resolve(info,fn);await dPut(fn,b);K.files.push({n:fn,kind:'dll',auto:!!a.auto,modes:[await mkMode(a,info)]});K.seeded[sid]=1;save()}catch(e){}}
 for(const f of [...K.files.filter(x=>x.kind==='js'),...K.files.filter(x=>x.kind!=='js')]){try{if(f.kind==='dll'){const b=await dGet(f.n);if(!b)continue;const info=parseDll(b),a=resolve(info,f.n);f.modes=[await mkMode(a,info)];f.auto=!!a.auto;delete f.err}
   else{const ids=runPlugin(await dGet(f.n));f.modes=[];for(const id of ids)if(OM.adapters[id].standalone)f.modes.push(await mkMode(OM.adapters[id],{names:[],pngs:[],audio:[],bytes:null}))}}catch(e){f.err=e.message}}
 save();refresh()}
OM.ready=new Promise(r=>{const go=()=>boot().catch(()=>{}).then(r);document.readyState==='complete'?setTimeout(go,0):addEventListener('load',go)});

OM.list=()=>{const o=[];for(const f of K.files)for(const m of f.modes||[])if(OM.adapters[m.id]&&!o.find(x=>x.id===m.id))o.push(m);return o};
OM.cur=()=>K.on&&OM.list().some(m=>m.id===K.on)?K.on:'';
OM.set=id=>{K.on=id||'';save();if(id&&typeof setMania==='function')setMania(false)};
OM.cfg=id=>{const a=OM.adapters[id],c=K.cfg[id]||(K.cfg[id]={});for(const s of(a&&a.settings)||[])if(c[s.k]==null)c[s.k]=s.def;return c};

const touchDev=()=>(typeof isPC==='function'?!isPC():true)||matchMedia('(pointer:coarse)').matches;
OM.needRotate=()=>touchDev()&&innerHeight>innerWidth;
OM.lock=()=>{try{const o=screen.orientation;if(o&&o.lock)o.lock('landscape').catch(()=>{})}catch(e){}};
OM.rotate=(ok,back)=>{

 let d=0;const off=()=>{if(d)return;d=1;removeEventListener('resize',chk);removeEventListener('orientationchange',chk2)},chk=()=>{if(!d&&!OM.needRotate()){off();ok()}},chk2=()=>setTimeout(chk,400);
 show('<div class="rot"><div class="rph"><i></i></div><div class="rtt">Hãy xoay màn hình ngang</div><small>Nếu máy không tự xoay, hãy tắt khóa xoay màn hình.</small><button class="s" id="rbk">'+ico('back')+' Back</button></div>');
 addEventListener('resize',chk);addEventListener('orientationchange',chk2);document.getElementById('rbk').onclick=()=>{off();back()};OM.lock();return off};

OM.hbAdd=(R,d)=>{if(!R||typeof d!=='number'||isNaN(d))return;const a=R.hbq||(R.hbq=[]);a.push({t:performance.now(),d});if(a.length>48)a.shift()};

OM.hbDraw=(R,Z)=>{if(typeof SET==='undefined'||!SET.hb||!R||!Z||!Z.length)return;const hb=R.hbq||[],por=H>W,Rg=Z[0][0],w=por?Math.min(W*.46,200):Math.min(W*.34,300),h=por?6:8,cx=por?14+w/2:W/2,cy=por?58:40,pn=performance.now();
 g.save();g.setLineDash([]);g.textAlign='left';
 for(const[z,c]of Z){const zw=Math.min(1,z/Rg)*w;g.globalAlpha=.55;g.fillStyle=c;g.fillRect(cx-zw/2,cy-h/2,zw,h)}
 g.globalAlpha=.9;g.fillStyle='#fff';g.fillRect(cx-1,cy-h*1.3,2,h*2.6);
 for(const t of hb){const age=pn-t.t;if(age>5000)continue;const a=Math.abs(t.d);let c=Z[0][1];for(let i=Z.length-1;i>=0;i--)if(a<=Z[i][0]){c=Z[i][1];break}const x=cx+Math.max(-1,Math.min(1,t.d/Rg))*w/2;g.globalAlpha=Math.max(.15,1-age/5000);g.fillStyle=c;g.fillRect(x-1,cy-h*1.1,2,h*2.2)}
 const rc=hb.slice(-15);if(rc.length){const avg=rc.reduce((s,t)=>s+t.d,0)/rc.length;R.hbA=R.hbA==null?avg:R.hbA+(avg-R.hbA)*.2;const x=cx+Math.max(-1,Math.min(1,R.hbA/Rg))*w/2;g.globalAlpha=1;g.fillStyle='#fff';g.beginPath();g.moveTo(x,cy-h*1.4);g.lineTo(x-4,cy-h*1.4-7);g.lineTo(x+4,cy-h*1.4-7);g.closePath();g.fill();g.font='11px sans-serif';g.textAlign='center';g.textBaseline='top';g.globalAlpha=.8;g.fillText((R.hbA>0?'+':'')+Math.round(R.hbA)+'ms',cx,cy+h*1.4)}
 g.globalAlpha=.45;g.fillStyle='#fff';g.font='bold 11px sans-serif';g.textBaseline='middle';g.textAlign='right';g.fillText('‹',cx-w/2-4,cy);g.textAlign='left';g.fillText('›',cx+w/2+4,cy);g.restore()};

OM.fps=fps=>{if(typeof SET==='undefined'||!SET.fps)return;const f=Math.round(fps),ft=1000/Math.max(1,fps);g.save();g.globalAlpha=.85;g.font='12px monospace';g.textAlign='right';g.textBaseline='alphabetic';g.fillStyle=f>=55?'#8f8':f>=30?'#fd5':'#f66';g.fillText(f+' FPS · '+ft.toFixed(1)+'ms'+(typeof alat==='function'?' · nhạc '+alat()+'ms':''),W-10,H-8);g.restore()};

const insets=()=>{const e=document.createElement('div');e.style.cssText='position:fixed;left:0;top:0;visibility:hidden;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(e);const c=getComputedStyle(e),r={t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0};e.remove();return r};
const KMV={ArrowLeft:1,ArrowRight:1,ArrowUp:1,ArrowDown:1,KeyW:1,KeyA:1,KeyS:1,KeyD:1,ShiftLeft:1,ShiftRight:1,KeyZ:1,KeyX:1,Space:1,Enter:1};

OM.hud=function(s,L,now,tot){

 const top=typeof ST!=='undefined'?ST:0,sx=W-60;
 g.save();g.fillStyle='#fff';g.textBaseline='alphabetic';
 drawHP(14,14+top,W*.25,s.hp);
 g.textAlign='right';g.font='bold 24px sans-serif';hudTxt(String(s.score).padStart(8,'0'),'score',sx,top+34,26,'right');
 const acT=(Math.max(0,Math.min(1,s.acc))*100).toFixed(2)+'%';g.font='14px sans-serif';hudTxt(acT,'score',sx,top+54,16,'right');
 const T=Math.max(1,tot||1),k=Math.max(0,Math.min(1,now/T)),r=11,cx=sx-hudW(acT,'score',16)-14-r,cy=top+50;
 g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(cx,cy,r,0,6.2832);g.strokeStyle='rgba(255,255,255,.22)';g.stroke();
 if(k>0){g.beginPath();g.arc(cx,cy,r,-1.5708,-1.5708+6.2832*k);g.strokeStyle='#ff66aa';g.stroke()}
 g.fillStyle='rgba(255,255,255,.75)';g.textAlign='right';g.font='12px sans-serif';hudTxt(fmtT(Math.max(0,now))+' / '+fmtT(T),'score',cx-r-8,cy+4,13,'right');
 const md=typeof mods==='function'?mods():null;if(md){const mt=MD.filter(m=>md.has(m[0])).map(m=>m[0]).join(' ');if(mt){g.fillStyle='#fff';g.font='14px sans-serif';g.textAlign='right';g.fillText(mt,sx,top+72)}}
 g.fillStyle='#fff';g.textAlign='left';g.font='bold 34px sans-serif';hudTxt((s.combo||0)+'x','combo',14,H-16,36,'left');
 g.restore()};
OM.session=function(o){
 const S={keys:new Set,b:{},tx:0,ty:0,sk:null,paused:false,closed:false,gp:'',gpPrev:{}};
 const touch=touchDev(),root=document.createElement('div');
 root.className='omroot';root.style.cssText='position:fixed;inset:0;z-index:30;pointer-events:none;touch-action:none;-webkit-user-select:none;user-select:none';document.body.appendChild(root);
 const op=K.op/100;

 if(o.onPtr){const tz=document.createElement('div');tz.style.cssText='position:absolute;inset:0;pointer-events:auto;touch-action:none';root.appendChild(tz);
  const fp=e=>{const L=S.lay||{fx:0,fy:0,sc:1};return[(e.clientX-L.fx)/L.sc,(e.clientY-L.fy)/L.sc]};
  tz.addEventListener('pointerdown',e=>{e.preventDefault();try{tz.setPointerCapture(e.pointerId)}catch(x){}if(S.paused||S.closed)return;const p=fp(e);o.onPtr('d',p[0],p[1],e.pointerId)});
  tz.addEventListener('pointermove',e=>{if(S.paused||S.closed)return;if(e.buttons||e.pointerType==='touch'||e.pointerType==='pen'){e.preventDefault();const p=fp(e);o.onPtr('m',p[0],p[1],e.pointerId)}});
  ['pointerup','pointercancel'].forEach(n=>tz.addEventListener(n,e=>{const p=fp(e);o.onPtr('u',p[0],p[1],e.pointerId)}))}
 S.layout=()=>{const I=S.ins||(S.ins=insets()),land=innerWidth>=innerHeight*1.1,top=Math.max(I.t,typeof ST!=='undefined'?ST:0),m=6,fh0=innerHeight-top-m*2,
  sc0=land?Math.min(fh0/o.fh,innerWidth*.5/o.fw):Math.min(fh0/o.fh,(innerWidth-12)/o.fw),sc=sc0*(o.zoom||1),fw=o.fw*sc,fh=o.fh*sc,fx=(innerWidth-fw)/2,fy=top+(innerHeight-top-fh)/2;
  const L={x0:I.l+8,x1:fx-10},R={x0:fx+fw+10,x1:innerWidth-I.r-8},pr=K.left?R:L,ar=K.left?L:R;
  return S.lay={land,sc,fx,fy,fw,fh,top,I,L,R,pad:pr,act:ar,hud:{x:ar.x0,w:Math.max(0,ar.x1-ar.x0)}}};

 let ps=0,cx=0,cy=0,pv,zone,btns={},pauseB,pid=null,ox=0,oy=0;const type=K.ctl;
 const circ=(k,lab,col,hold)=>{const e=document.createElement('div');e.dataset.k=k;e.style.cssText='position:absolute;pointer-events:auto;border-radius:50%;background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#333;font:bold 13px sans-serif;touch-action:none;box-sizing:border-box;opacity:'+op;e.style.border='5px solid '+col;e.innerHTML=lab;root.appendChild(e);
  e.addEventListener('pointerdown',ev=>{ev.preventDefault();try{e.setPointerCapture(ev.pointerId)}catch(x){}if(hold)S.b[k]=1;else S.act(k);e.style.filter='brightness(.8)'});
  if(hold)['pointerup','pointercancel','lostpointercapture'].forEach(n=>e.addEventListener(n,()=>{S.b[k]=0;e.style.filter=''}));else['pointerup','pointercancel'].forEach(n=>e.addEventListener(n,()=>{e.style.filter=''}));return e};
 S.act=k=>{if(k==='skip')S.trySkip()};
 S.trySkip=()=>{if(S.sk!=null&&!S.paused&&!S.closed){const t=S.sk;S.sk=null;if(S.skipEl)S.skipEl.style.display='none';o.onSkip&&o.onSkip(t)}};
 const defs=(o.buttons||[{k:'f',label:'FOCUS',color:'#888'}]);
 if(touch){
  zone=document.createElement('div');zone.style.cssText='position:absolute;pointer-events:auto;touch-action:none';root.appendChild(zone);
  pv=document.createElement('div');pv.style.cssText='position:absolute;pointer-events:none;opacity:'+op;root.appendChild(pv);
  zone.addEventListener('pointerdown',e=>{if(pid!=null)return;e.preventDefault();pid=e.pointerId;try{zone.setPointerCapture(pid)}catch(x){}if(type==='float'){ox=e.clientX;oy=e.clientY;place(ox,oy)}else{ox=cx;oy=cy}upd(e)});
  zone.addEventListener('pointermove',e=>{if(e.pointerId===pid){e.preventDefault();upd(e)}});
  const rel=e=>{if(e.pointerId!==pid)return;pid=null;S.tx=S.ty=0;paint(0,0);if(type==='float')place(cx,cy)};['pointerup','pointercancel','lostpointercapture'].forEach(n=>zone.addEventListener(n,rel));
  S.reset=()=>{pid=null;S.tx=S.ty=0;paint(0,0);if(type==='float')place(cx,cy)};
  function place(x,y){pv.style.left=(x-ps/2)+'px';pv.style.top=(y-ps/2)+'px'}
  function upd(e){const vx=e.clientX-ox,vy=e.clientY-oy,r=Math.hypot(vx,vy),R=ps/2;let x=0,y=0;
   if(type==='stick'){const dz=R*.12;if(r>dz){const m=Math.min(1,(r-dz)/(R*.8-dz));x=vx/r*m;y=vy/r*m}}
   else{const dz=type==='float'?12:R*.16;if(r>dz){const c=vx/r,s=vy/r;x=Math.abs(c)>.3827?Math.sign(c):0;y=Math.abs(s)>.3827?Math.sign(s):0}}
   S.tx=x;S.ty=y;paint(x,y)}
  function paint(x,y){if(type==='stick'){const k=pv.lastChild;if(k)k.style.transform='translate('+x*ps*.3+'px,'+y*ps*.3+'px)';return}
   const on=(a,b)=>a?'#ff66aa':'#6a6a6a';const c=pv.children;if(c.length===4){c[0].style.background=on(y<0);c[1].style.background=on(x<0);c[2].style.background=on(x>0);c[3].style.background=on(y>0)}}
  S.buildPad=()=>{pv.innerHTML='';if(type==='stick'){pv.style.cssText+=';border-radius:50%;background:rgba(255,255,255,.18);border:3px solid rgba(255,255,255,.45);box-sizing:border-box';pv.innerHTML='<div style="position:absolute;left:30%;top:30%;width:40%;height:40%;border-radius:50%;background:#ddd;border:3px solid #888;box-sizing:border-box"></div>'}
   else{pv.style.background='none';pv.style.border='0';const u=ps*.31,g=ps*.035,sq=(l,t)=>'<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+u+'px;height:'+u+'px;border-radius:'+u*.22+'px;background:#6a6a6a"></div>';
    pv.innerHTML=sq(u+g,0)+sq(0,u+g)+sq(2*(u+g),u+g)+sq(u+g,2*(u+g))}}
  for(const d of defs)btns[d.k]=circ(d.k,d.label,d.color||'#888',1);
  S.layDom=()=>{const l=S.layout(),a=l.act,p=l.pad,pw=p.x1-p.x0,aw=a.x1-a.x0,H=innerHeight;ps=clamp(Math.min(pw-6,H*.5)*K.size/100,90,260);
   cx=clamp(p.x0+pw/2,p.x0+ps/2,Math.max(p.x0+ps/2,p.x1-ps/2));cy=H-l.I.b-14-ps/2;
   zone.style.left=p.x0+'px';zone.style.width=Math.max(40,pw)+'px';zone.style.top=H*.2+'px';zone.style.height=H*.8+'px';
   pv.style.width=pv.style.height=ps+'px';S.buildPad();place(cx,cy);if(o.pad===false){zone.style.display='none';pv.style.display='none'}
   const b=clamp(Math.min(aw*.4,H*.27)*K.size/100,54,124),pos=(i)=>i===0?[.68,.80,1]:i===1?[.36,.58,.8]:[.7,.46-.2*(i-2),.8];
   defs.forEach((d,i)=>{const e=btns[d.k],q=pos(i),s=b*q[2];e.style.width=e.style.height=s+'px';e.style.left=(a.x0+aw*q[0]-s/2)+'px';e.style.top=(H*q[1]-s/2-(i===0?l.I.b*.3:0))+'px'});
   };
 }

 const xb=document.getElementById('x'),xOld={d:xb.style.display,z:xb.style.zIndex,c:xb.onclick};xb.style.display='block';xb.style.zIndex='31';xb.onclick=e=>{S.pause()};
 const skb=document.getElementById('sk'),skOld={z:skb.style.zIndex,c:skb.onclick};skb.style.display='none';skb.style.zIndex='31';skb.onclick=()=>S.trySkip();S.skipEl=skb;
 S.layAll=()=>{S.layout();if(S.layDom)S.layDom();if(o.onLayout)o.onLayout()};S.layAll();
 S.kd=e=>{if(e.code==='Escape'){S.pause();return}if(o.keys&&o.onKey&&o.keys.indexOf(e.code)>=0){e.preventDefault();if(!e.repeat&&!S.paused&&!S.closed)o.onKey(e.code,1);return}if(KMV[e.code]){e.preventDefault();S.keys.add(e.code);if((e.code==='Space'||e.code==='Enter')&&!e.repeat)S.trySkip()}};
 S.ku=e=>{S.keys.delete(e.code);if(o.keys&&o.onKey&&o.keys.indexOf(e.code)>=0&&!S.closed)o.onKey(e.code,0)};S.vis=()=>{if(document.hidden)S.pause()};S.rz=()=>{if(S.closed)return;S.ins=null;if(OM.needRotate()){S.pause();if(!S.rot)S.askRot()}else S.layAll()};
 addEventListener('keydown',S.kd);addEventListener('keyup',S.ku);document.addEventListener('visibilitychange',S.vis);addEventListener('resize',S.rz);addEventListener('orientationchange',()=>setTimeout(S.rz,350));
 S.read=()=>{const k=S.keys;let x=S.tx+((k.has('ArrowRight')||k.has('KeyD'))?1:0)-((k.has('ArrowLeft')||k.has('KeyA'))?1:0),y=S.ty+((k.has('ArrowDown')||k.has('KeyS'))?1:0)-((k.has('ArrowUp')||k.has('KeyW'))?1:0),f=!!S.b.f||k.has('ShiftLeft')||k.has('ShiftRight')||k.has('KeyZ')||k.has('KeyX');const b=Object.assign({},S.b);
  try{const gs=navigator.getGamepads?navigator.getGamepads():[];S.gp='';for(const p of gs){if(!p||!p.connected)continue;S.gp=p.id;const ax=p.axes[0]||0,ay=p.axes[1]||0,m=Math.hypot(ax,ay);if(m>.18){const s=Math.min(1,(m-.18)/.7)/m;x+=ax*s;y+=ay*s}
   const B=p.buttons,bp=i=>!!(B[i]&&B[i].pressed);x+=(bp(15)?1:0)-(bp(14)?1:0);y+=(bp(13)?1:0)-(bp(12)?1:0);if(bp(0)||bp(2)||bp(4)||bp(5)||bp(6)||bp(7))f=true;
   const e=(i,fn)=>{const v=bp(i);if(v&&!S.gpPrev[i])fn();S.gpPrev[i]=v};e(3,S.trySkip);e(8,S.trySkip);e(1,S.trySkip);e(9,S.pause)}}catch(e){}
  const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}return{x,y,f,b}};

 S.setSkip=t=>{S.sk=t;if(S.skipEl){const d=t!=null?'block':'none';if(S.skipEl.style.display!==d)S.skipEl.style.display=d}};

 const sfx=n=>{try{if(typeof uiS==='function')uiS(n)}catch(e){}},q=id=>document.getElementById(id);
 S.askRot=()=>{S.rot=1;root.style.display='none';OM.rotate(()=>{S.rot=0;S.menu()},()=>{S.rot=0;S.close();o.onQuit&&o.onQuit()})};
 S.menu=()=>{if(S.closed)return;S.ov=1;root.style.display='none';
  show('<button id="r1">Tiếp tục</button><button class="s" id="r2">Chơi lại</button><button class="s" id="r3">Thoát</button>');
  q('r1').onclick=()=>{if(OM.needRotate()){if(!S.rot)S.askRot();return}hide();S.ov=null;root.style.display='';sfx('pause-continue-click');const run=()=>{if(S.closed)return;S.paused=false;o.onResume&&o.onResume()};if(window.OSUI_CD)OSUI_CD(run,()=>{if(!S.closed){S.paused=false;S.pause()}});else run()};
  q('r2').onclick=()=>{sfx('pause-retry-click');S.close();o.onRestart&&o.onRestart()};
  q('r3').onclick=()=>{sfx('pause-back-click');S.close();o.onQuit&&o.onQuit()}};
 S.pause=()=>{if(S.paused||S.closed)return;S.paused=true;if(S.skipEl)S.skipEl.style.display='none';o.onPause&&o.onPause();S.tx=S.ty=0;S.b={};if(S.reset)S.reset();S.menu()};
 S.close=()=>{if(S.closed)return;S.closed=true;removeEventListener('keydown',S.kd);removeEventListener('keyup',S.ku);document.removeEventListener('visibilitychange',S.vis);removeEventListener('resize',S.rz);
  skb.style.display='none';skb.style.zIndex=skOld.z;skb.onclick=skOld.c;xb.style.display='none';xb.style.zIndex=xOld.z;xb.onclick=typeof pause==='function'?pause:xOld.c;root.remove()};
 return S};

const bt=(a,l,on)=>'<button class="mb" '+a+' style="width:auto;min-height:0;padding:6px 12px;'+(on?'background:#ff66aa;color:#fff':'')+'">'+l+'</button>';
const row=(l,r)=>'<div class="sr"><span>'+l+'</span><span>'+r+'</span></div>';
const slide=(l,a,v,mn,mx,st,u)=>'<div class="sr"><span>'+l+'</span><b data-omv="'+a+'">'+v+u+'</b></div><div class="sr"><input type="range" data-omr="'+a+'" data-u="'+u+'" min="'+mn+'" max="'+mx+'" step="'+st+'" value="'+v+'" style="flex:1"></div>';
const inner=()=>{let h=OM.msg?'<div class="sr"><small style="color:#f88">'+OM.msg+'</small></div>':'';
 const fs=K.files;if(!fs.length)h+='<div class="sr"><small style="opacity:.6">Chưa có chế độ nào. Chọn file .dll (ruleset osu!lazer): game tự dựng chế độ, không cần file .js. Có thể thêm .js nếu muốn luật chơi riêng. Có sẵn adapter cho: '+Object.keys(OM.adapters).map(k=>OM.adapters[k].name).join(', ')+'.</small></div>';
 for(const f of fs){const ms=(f.modes||[]).map(m=>m.name).join(', ');h+='<div class="sr"><span><b>'+(ms||f.n)+'</b><br><small style="opacity:.6">'+f.n+(f.auto?' · tự dựng từ .dll':'')+(f.err?' · <span style="color:#f88">'+f.err+'</span>':'')+'</small></span><button class="mb" data-omx="'+encodeURIComponent(f.n)+'" style="width:auto;min-height:0;padding:6px 12px">Gỡ</button></div>'}
 if(OM.list().length){
  h+='<div class="sr"><b>Điều khiển chung (mọi chế độ thêm vào)</b></div>'+row('Kiểu',CTL.map(c=>bt('data-omg="ctl|'+c[0]+'"',c[1],K.ctl===c[0])).join(''))
   +slide('Cỡ điều khiển','size',K.size,70,140,5,'%')+slide('Độ đậm nút','op',K.op,30,100,5,'%')+row('Tay trái (đổi bên d-pad/nút)',bt('data-omg="left|0"','Tắt',!K.left)+bt('data-omg="left|1"','Bật',!!K.left))
   +'<div class="sr"><small style="opacity:.6">Tay cầm Bluetooth/USB tự nhận khi bấm một nút: cần/D-pad = di chuyển, A/X/LB/RB/LT/RT = Focus, Y/B/Select = Skip, Start = Pause. Bàn phím: mũi tên/WASD, Shift/Z/X, Space/Enter = Skip, Esc = Pause.</small></div>';
  for(const m of OM.list()){const a=OM.adapters[m.id],c=OM.cfg(m.id);if(!a.settings||!a.settings.length)continue;h+='<div class="sr"><b>'+m.name+'</b></div>';
   for(const s of a.settings){if(s.t==='range')h+=slide(s.label,'m|'+m.id+'|'+s.k,c[s.k],s.min,s.max,s.step||1,s.u||'');else h+=row(s.label,s.o.map((o,i)=>bt('data-oms="'+m.id+'|'+s.k+'|'+i+'"',o[0],c[s.k]===o[1])).join(''))}}}
 return h};
function refresh(){const e=document.getElementById('thx');if(e)e.innerHTML=inner()}
OM.html=()=>'<div class="sr"><span>Chọn file .dll / .js</span><label class="mb" style="width:auto;min-height:0;padding:8px 14px;cursor:pointer">+ Thêm file<input type="file" id="thf" accept=".dll,.js,application/octet-stream,text/javascript" style="display:none"></label></div><div id="thx">'+inner()+'</div>';
document.addEventListener('change',e=>{const t=e.target;if(t.id==='thf'&&t.files[0]){OM.install(t.files[0]);t.value=''}});
document.addEventListener('input',e=>{const t=e.target,a=t.dataset&&t.dataset.omr;if(!a)return;const v=+t.value;if(a.startsWith('m|')){const[,id,k]=a.split('|');OM.cfg(id)[k]=v}else K[a]=v;save();const l=document.querySelector('[data-omv="'+a+'"]');if(l)l.textContent=v+(t.dataset.u||'')});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-omx],[data-omg],[data-oms]');if(!t)return;
 if(t.dataset.omx)OM.remove(decodeURIComponent(t.dataset.omx));
 else if(t.dataset.omg){const[k,v]=t.dataset.omg.split('|');K[k]=k==='ctl'?v:+v;save();refresh()}
 else{const[id,k,i]=t.dataset.oms.split('|'),s=OM.adapters[id].settings.find(x=>x.k===k);OM.cfg(id)[k]=s.o[+i][1];save();refresh()}});

const TH=window.TH={get on(){return!!OM.cur()},A:null,msg:''};
TH.installed=()=>OM.list().length>0;
TH.cur=OM.cur;TH.set=OM.set;window.thSet=v=>OM.set(v?(OM.list()[0]||{}).id:'');
TH.icon=()=>{const m=OM.list().find(x=>x.id===OM.cur());return m&&m.icon||'assets/icon-play.png'};
TH.btns=()=>OM.list().map(m=>'<button data-om="'+m.id+'" class="'+(OM.cur()===m.id?'on':'')+'" aria-label="'+m.name+'"><img src="'+(m.icon||'assets/icon-play.png')+'" alt=""></button>').join('');
TH.support=M=>{const a=OM.adapters[OM.cur()];return a&&a.support?a.support(M):''};
TH.html=OM.html;
TH.start=async function(M,F,buf,bg,note){const id=OM.cur(),a=OM.adapters[id];
 if(!a){select(CURID,'Chưa thêm chế độ');return}
 await OM.ready;const A=OM.assets[id];if(!A){select(CURID,'Không nạp được tài nguyên của chế độ '+a.name);return}
 const args=[M,F,buf,bg,note];
 const ctx={M,F,buf,bg,note,A,cfg:OM.cfg(id),OM,restart:()=>TH.start(...args),quit:()=>{RP=null;REPMODS=null;select(CURID)}};
 if(OM.needRotate()){OM.lock();return OM.rotate(()=>TH.start(...args),ctx.quit)}
 OM.lock();try{await a.start(ctx)}catch(e){console.error(e);select(CURID,'Lỗi chế độ '+a.name+': '+(e.message||e))}};
TH.ready=OM.ready;
})();
