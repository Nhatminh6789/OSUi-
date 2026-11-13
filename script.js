let LANG='vi';try{LANG=localStorage.getItem('osw_lang')==='en'?'en':'vi'}catch(e){}
const VI2EN={"Chạm để bắt đầu": "Tap to start", "Chạm: Trực tiếp": "Touch: Direct", "Chạm: Hit zone": "Touch: Hit zone", "Không có map hợp lệ": "No valid map", "Map osu!mania: hãy chuyển sang mode mania 4K": "osu!mania map: switch to mania 4K mode", "Nhạc này không hỗ trợ 4K": "This map does not support 4K", "Mode này chưa được hỗ trợ": "This mode is not supported yet", "Xóa map": "Delete map", "nốt": "notes", "Bảng xếp hạng": "Leaderboard", "Chưa có kỷ lục": "No records yet", "Không hỗ trợ": "Unsupported", "mode này": "this mode", "Chơi lại": "Retry", "Chơi": "Play", "Chạm lần nữa để xóa": "Tap again to delete", "Không có dữ liệu replay": "No replay data", "Lỗi: ": "Error: ", "Không phải file zip": "Not a zip file", "Không giải mã được nhạc (Safari không đọc .ogg) - chơi không nhạc": "Could not decode audio (Safari cannot read .ogg) - playing without music", "Đang tải storyboard / video…": "Loading storyboard / video…", "Tiếp tục": "Resume", "Cài đặt": "Settings", "Thoát": "Quit", "Thất bại": "Failed", "Xem lại": "Watch replay", "Quay lại": "Back", "Chọn map khác": "Choose another map", "Giảm độ khó": "Difficulty reduction", "Tăng độ khó": "Difficulty increase", "Đặc biệt": "Special", "Mod mang lại nhiều cách chơi khác nhau. Một số mod ảnh hưởng đến điểm số khi chơi xếp hạng, số khác chỉ để giải trí.": "Mods offer different ways to play. Some mods affect your score in ranked play, others are just for fun.", "Hệ số điểm: ": "Score multiplier: ", "1. Đặt lại tất cả Mod": "1. Reset all mods", "2. Đóng": "2. Close", "Không convert được map này": "Cannot convert this map", "nhạc": "audio", "Ngôn ngữ": "Language", "Xếp hạng": "Ranking", "Điểm": "Score", "Độ chính xác": "Accuracy", "Hoàn hảo": "Perfect", "Hoàn thành": "Cleared", "Chơi lúc ": "Played on ", "Bật": "On", "Tắt": "Off", "Hiện FPS": "Show FPS", "Con trỏ": "Cursor", "Cỡ": "Size", "Nhỏ": "Small", "Vừa": "Medium", "Lớn": "Large", "Độ trễ nhạc": "Audio latency", "Độ sáng nền": "Background brightness", "Video nền": "Background video", "⚠ Lưu ý: game có thể bị chậm đi, gây ảnh hưởng nặng đến hiệu năng. Bật storyboard/video xong nhớ tăng độ sáng nền để nhìn rõ hơn.": "⚠ Note: the game may slow down and performance may be heavily affected. After enabling storyboard/video, remember to raise the background brightness to see better.", "Mặc định": "Default", "Đã thêm skin: ": "Skin added: ", "Không thấy hình skin trong file (.osk/.osz phải chứa ảnh skin như hitcircle, mania-note...)": "No skin images found in file (.osk/.osz must contain skin images such as hitcircle, mania-note...)", "Không tìm thấy hình skin": "No skin images found", "Không tìm thấy file video": "Video file not found", "Trình duyệt không hỗ trợ video .": "Browser does not support video .", "Không phát được video (codec không được hỗ trợ)": "Cannot play video (unsupported codec)", "Lỗi storyboard: ": "Storyboard error: ", "Lỗi video: ": "Video error: ", "Map này không có video": "This map has no video", "Chỉnh vị trí": "Adjust", "Mặc định": "Default", "Map này không có storyboard": "This map has no storyboard"},TRK=Object.keys(VI2EN).sort((a,b)=>b.length-a.length),_trc=new Map();
function TR(s){if(LANG!=='en'||!/[^\x00-\x7f]/.test(s))return s;let r=_trc.get(s);if(r!==undefined)return r;r=s;for(const k of TRK)if(r.includes(k))r=r.split(k).join(VI2EN[k]);if(_trc.size>800)_trc.clear();_trc.set(s,r);return r}
function trWalk(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.__o===undefined||n.data!==n.__t)n.__o=n.data;const p=n.parentElement;const t=p&&p.closest&&p.closest('.ti,.ar,.vn,.rw,.dn,.tn')?n.__o:TR(n.__o);if(t!==n.data)n.data=t;n.__t=t}}
function setLang(l){LANG=l==='en'?'en':'vi';try{localStorage.setItem('osw_lang',LANG)}catch(e){}document.documentElement.lang=LANG;trWalk(document.body)}
{const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,set(v){d.set.call(this,v);trWalk(this)},configurable:true});
const e=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');Object.defineProperty(Node.prototype,'textContent',{get:e.get,set(v){e.set.call(this,v);if(this.nodeType===1)trWalk(this)},configurable:true});
const f=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,...a){return f.call(this,typeof t==='string'?TR(t):t,...a)}}
const LG='assets/menu-logo.png';const $=id=>document.getElementById(id),cv=$('c'),g=cv.getContext('2d'),ui=$('ui');
let W,H,S,OX,OY,DPR,ac,P=null,DIRECT=false,AUTOM=false;
let BZ=0;function bzCalc(){let i=0;try{const e=document.createElement('div');e.style.cssText='position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);visibility:hidden';document.body.appendChild(e);i=e.offsetHeight;e.remove()}catch(x){}return Math.max(i,16)+26}
function rs(){DPR=devicePixelRatio||1;BZ=bzCalc();W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(DPR,0,0,DPR,0,0);const z=zr('pz');S=z.w/512;OX=z.x;OY=z.y}
addEventListener('resize',rs);rs();
const show=(h,c)=>{ui.innerHTML=h;ui.className=c||'';ui.style.backgroundImage=''},hide=()=>ui.className='h';
// ---------- màn hình chạm để bắt đầu -> menu chính (logo) -> chọn bài ----------
let CURID=null,LAST=null,SV={},MANIA=false,MODS=new Set;try{MANIA=localStorage.getItem('osui_mania')==='1';JSON.parse(localStorage.getItem('osui_mods')||'[]').forEach(k=>MODS.add(k))}catch(e){}let SET={fps:1,cur:1,cr:6,sb:0,vid:0,bgb:25};try{Object.assign(SET,JSON.parse(localStorage.getItem('osui_set')||'{}'))}catch(e){}
const modeTxt=()=>DIRECT?'Chạm: Trực tiếp':'Chạm: Hit zone';function setMode(v){DIRECT=v;try{localStorage.setItem('osw_direct',v?'1':'0')}catch(e){}rs()}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
{const ic=document.createElement('link');ic.rel='icon';ic.href=LG;document.head.appendChild(ic)}
show('<img class="lg" src="'+LG+'" alt="osui!"><div style="font-size:22px;margin-top:20px">Chạm để bắt đầu</div>');
ui.addEventListener('pointerdown',function f(){ui.removeEventListener('pointerdown',f);ac=new (window.AudioContext||window.webkitAudioContext)();ac.resume();try{navigator.storage.persist()}catch(e){}loadSkin();menu()},{once:true});
function menu(){prevStop();show('<div id="mb"><div class="bg2"></div><div class="mz" id="bs">setting</div><div class="mz" id="bp">play</div><svg viewBox="-66 -66 132 132" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"><path d="M-46 -38.6A60 60 0 0 0 -46 38.6"/><path d="M46 -38.6A60 60 0 0 1 46 38.6"/></svg><img id="logo" src="'+LG+'" alt="osui!"></div>','m');$('logo').onclick=()=>select();$('bs').onclick=()=>settingsPanel(()=>{});$('bp').onclick=()=>select();
dbAll().then(L=>{const t=L.filter(x=>x.thumb).sort((a,b)=>b.added-a.added)[0];if(t&&ui.className==='m')ui.style.backgroundImage='linear-gradient(rgba(20,8,36,.72),rgba(7,5,15,.9)),url('+t.thumb+')'})}
let MEM=[];const idb=()=>new Promise((res,rej)=>{if(!window.indexedDB)return rej();const q=indexedDB.open('osuweb',2);q.onupgradeneeded=()=>{const d=q.result;for(const n of['maps','skins','reps','repd'])if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
async function dbAll(){try{const d=await idb();return await new Promise((res,rej)=>{const r=d.transaction('maps').objectStore('maps').getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return MEM}}
async function dbPut(m){MEM=MEM.filter(x=>x.id!==m.id).concat(m);try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('maps','readwrite');t.objectStore('maps').put(m);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(e){}}
async function dbDel(id){MEM=MEM.filter(x=>x.id!==id);try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('maps','readwrite');t.objectStore('maps').delete(id);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(e){}}
async function importOsz(buf){const F=await unzip(buf),vers=[];let title='',artist='',bgn='';
for(const n of Object.keys(F).filter(n=>/\.osu$/i.test(n))){const m=parseOsu(new TextDecoder().decode(await F[n]()));if(!m.ho.length)continue;title=m.title||title;artist=m.artist||artist;bgn=bgn||m.bg;const l=m.ho[m.ho.length-1],f=m.tp.find(x=>x.un);vers.push({file:n,ver:m.ver,cs:m.d.CS,od:m.d.OD,ar:m.d.ApproachRate,hp:m.d.HP,n:m.ho.length,nc:m.ho.filter(o=>o.kind==='c'||o.kind==='n').length,ns:m.ho.filter(o=>o.kind==='s'||o.kind==='h').length,sr:calcSR(m),dv:2,mode:m.mode,k:m.d.CS,np:m.ho.filter(o=>o.kind==='p').length,len:(l.end||l.time)-m.ho[0].time,bpm:f?Math.round(60000/f.bl):0})}
if(!vers.length)throw Error('Không có map hợp lệ');vers.sort((a,b)=>a.mode-b.mode||a.sr-b.sr);
const old=(await dbAll()).find(x=>x.title===title&&x.artist===artist),id=old?old.id:String(Date.now());let thumb='';try{const k=Object.keys(F).find(k=>k.toLowerCase()===(bgn||'').toLowerCase());if(k){const bm=await createImageBitmap(imgBlob(await F[k]())),c=document.createElement('canvas'),q=Math.min(1,640/bm.width);c.width=bm.width*q;c.height=bm.height*q;c.getContext('2d').drawImage(bm,0,0,c.width,c.height);thumb=c.toDataURL('image/jpeg',.6)}}catch(e){}
await dbPut({id,title,artist,vers,buf,thumb,added:Date.now()});return id}
let CURSEL=null,FILLING=0;
const sc=s=>s<2?'#6cf':s<2.7?'#7f9':s<4?'#fd5':s<5.3?'#f85':s<6.5?'#f58':'#b6f',sf=s=>s==null?'★ …':'★ '+(+s).toFixed(2),f1=x=>+(+x).toFixed(1),sup=v=>v.mode==null?true:MANIA?(v.mode===0||v.mode===3&&v.k===4):v.mode===0;
const support=M=>M.mode===3?(!MANIA?'Map osu!mania: hãy chuyển sang mode mania 4K':M.d.CS!==4?'Nhạc này không hỗ trợ 4K':''):MANIA?(M.mode?'Nhạc này không hỗ trợ 4K':''):M.mode?'Mode này chưa được hỗ trợ':'';
async function fillSR(L){if(FILLING)return;const todo=L.filter(m=>m.vers.some(v=>v.sr==null||v.dv!==2));if(!todo.length)return;FILLING=1;
for(const m of todo){try{const F=await unzip(m.buf);for(const v of m.vers){if(v.sr!=null&&v.dv===2)continue;try{const p=parseOsu(new TextDecoder().decode(await F[v.file]()));v.sr=calcSR(p);v.mode=p.mode;v.k=p.d.CS;v.cs=p.d.CS;v.od=p.d.OD;v.ar=p.d.ApproachRate;v.hp=p.d.HP;v.dv=2}catch(e){v.sr=0;v.mode=0}}m.vers.sort((a,b)=>a.mode-b.mode||a.sr-b.sr);delete SV[m.id];await dbPut(m)}catch(e){m.vers.forEach(v=>{if(v.sr==null)v.sr=0})}}
FILLING=0;if(ui.className==='s'&&!$('mp'))select(CURSEL)}
async function select(sel,msg){const L=(await dbAll()).sort((a,b)=>b.added-a.added);if(!L.find(x=>x.id===sel))sel=L.length?L[0].id:null;CURSEL=sel;
const cur=L.find(x=>x.id===sel),vi=cur?Math.min(SV[sel]||0,cur.vers.length-1):0,v=cur&&cur.vers[vi],si=L.findIndex(x=>x.id===sel),mm=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
const bar=(n,x)=>'<span>'+n+'</span><i><b style="width:'+Math.min(100,x*10)+'%"></b></i><span>'+f1(x)+'</span>',ed=v&&effD({CS:v.cs,ApproachRate:v.ar,OD:v.od,HP:v.hp},MODS,MANIA);const RC=v?(await sAll('reps')).filter(r=>r.mid===sel&&r.vf===v.file&&r.mn===(MANIA?1:0)).sort((a,b)=>b.score-a.score).slice(0,10):[];
show('<div id="ss">'+(msg?'<div id="tt">'+esc(msg)+'</div>':'')+(cur?'<button id="del">🗑 Xóa map</button><div id="info"><div class="ti">'+esc(cur.title)+'</div><div class="ar">'+esc(cur.artist)+'</div><div class="vn">'+esc(v.ver)+'<span class="sb" style="background:'+sc(v.sr)+'">'+sf(v.sr)+'</span></div><div class="mt">'+(v.bpm?v.bpm+' BPM · ':'')+mm(v.len)+' · '+v.nc+' nốt · '+(v.mode===3?v.ns+' hold · '+v.k+'K':v.ns+' slider · '+v.np+' spinner')+(MANIA&&v.mode===0?' · convert 4K':'')+'</div><div class="st">'+(MANIA?bar('OD',ed.OD)+bar('HP',ed.HP):bar('CS',ed.CS)+bar('AR',ed.ApproachRate)+bar('OD',ed.OD)+bar('HP',ed.HP))+'</div><div class="lb"><div class="lh">🏆 Bảng xếp hạng</div>'+(RC.length?RC.map(r=>'<div class="lr" data-r="'+r.id+'"><b style="color:'+(r.rk==='SS'||r.rk==='S'?'#fd5':'#fff')+'">'+r.rk+'</b><span>'+r.score.toLocaleString()+'</span><small>'+(r.acc*100).toFixed(2)+'%'+(r.mods.length?' · '+r.mods.join(' '):'')+'</small><i>▶</i></div>').join(''):'<small>Chưa có kỷ lục</small>')+'</div></div>':'')+
'<div id="car">'+L.map((m,i)=>{const on=m.id===sel,ss=m.vers.map(x=>x.sr).filter(x=>x>0),mn=Math.min(...ss),mx=Math.max(...ss),rg=ss.length?'★ '+mn.toFixed(1)+(mx-mn>.05?' – '+mx.toFixed(1):''):m.vers.length+' ◆',d=Math.min(Math.abs(i-si),6);
return '<div class="g"><div class="it'+(on?' on':'')+'" data-id="'+m.id+'" style="'+(on?'':'margin-left:'+(10+d*6)+'px;')+'background-image:linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.3))'+(m.thumb?',url('+m.thumb+')':'')+'"><div class="rw"><b>'+esc(m.title)+'</b><small>'+esc(m.artist)+'</small></div><span class="nd">'+rg+'</span></div>'+(on?m.vers.map((x,j)=>{const u=sup(x);return '<div class="dr'+(j===vi?' on':'')+(u?'':' nx')+'" style="animation-delay:'+(j*.04)+'s" data-id="'+m.id+'" data-v="'+j+'"><span class="dn">'+(x.mode===3?'['+x.k+'K] ':MANIA&&x.mode===0?'[4K⟳] ':'')+esc(x.ver)+'</span><span><b style="color:'+sc(x.sr)+'">'+sf(x.sr)+'</b> <small>'+(u?'AR'+f1(x.ar)+' OD'+f1(x.od)+' CS'+f1(x.cs):'Không hỗ trợ '+(MANIA?'4K':'mode này'))+'</small></span></div>'}).join(''):'')+'</div>'}).join('')+'</div>'+
'<div id="ft"><button id="bk">◀ Back</button><label class="b s" style="background:#333">+ .osz<input id="f" type="file" multiple style="display:none"></label><button class="s" id="mo">Mods'+(MODS.size?' ('+MODS.size+')':'')+'</button><button class="s" id="mm">'+(MANIA?'Mode: mania 4K':'Mode: osu!')+'</button>'+'<button class="s" id="md">⚙</button>'+'<span class="sp"></span>'+(cur?'<button id="pl">▶ Chơi</button>':'')+'</div></div>','s');
if(cur&&cur.thumb)$('ss').style.backgroundImage='linear-gradient(rgba(10,6,24,.72),rgba(10,6,24,.92)),url('+cur.thumb+')';
try{$('car').scrollTop=0;ui.querySelector('.it.on').scrollIntoView({block:'center'})}catch(e){}
$('bk').onclick=menu;$('md').onclick=()=>settingsPanel(()=>{});
$('mo').onclick=()=>modsPanel(()=>select(sel));$('mm').onclick=()=>{setMania(!MANIA);select(sel)};
$('f').onchange=async e=>{let id=sel,err='';show('…');for(const f of e.target.files){try{id=await importOsz(await f.arrayBuffer())}catch(x){err=f.name+': '+x.message}}select(id,err)};
if(cur){$('pl').onclick=()=>playMap(cur,vi);let t=0;$('del').onclick=()=>{if(t){clearTimeout(t);return dbDel(cur.id).then(async()=>{for(const r of await sAll('reps'))if(r.mid===cur.id){sDel('reps',r.id);sDel('repd',r.id)}select()})}$('del').textContent='Chạm lần nữa để xóa';$('del').style.background='#a33';t=setTimeout(()=>{t=0;$('del').textContent='🗑 Xóa map';$('del').style.background=''},3000)}}
ui.querySelectorAll('.it').forEach(el=>el.onclick=()=>{if(el.dataset.id!==sel)select(el.dataset.id)});
ui.querySelectorAll('.dr').forEach(el=>el.onclick=()=>{const i=+el.dataset.v;if(i===vi)return playMap(cur,i);SV[sel]=i;select(sel)});
(cur?prevPlay(cur,v):prevStop());
ui.querySelectorAll('.lr').forEach(el=>el.onclick=async()=>{const r=RC.find(x=>x.id===el.dataset.r),d=await sGet('repd',r.id),k=cur.vers.findIndex(x=>x.file===r.vf);if(!d||k<0)return select(sel,'Không có dữ liệu replay');playMap(cur,k,{mods:r.mods,cv:r.cv,f:d.f,t:d.t,e:d.e})});
fillSR(L)}
async function playMap(m,i,rep){prevStop();show('…');CURID=m.id;CURFILE=m.vers[i].file;RP=rep||null;REPMODS=rep?rep.mods:null;try{const F=await unzip(m.buf),M=parseOsu(new TextDecoder().decode(await F[m.vers[i].file]())),w=rep?'':support(M);if(w){RP=null;REPMODS=null;return select(m.id,w)}await start((rep?rep.cv:MANIA&&M.mode===0)?toMania(M):M,F)}catch(e){RP=null;REPMODS=null;select(m.id,'Lỗi: '+e.message)}}
// ---------- đọc zip (không cần thư viện) ----------
async function unzip(buf){const v=new DataView(buf),u=new Uint8Array(buf),td=new TextDecoder(),F={};let e=buf.byteLength-22;while(e>=0&&v.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw Error('Không phải file zip');
const n=v.getUint16(e+10,true);let p=v.getUint32(e+16,true);
for(let i=0;i<n;i++){const m=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true),name=td.decode(u.subarray(p+46,p+46+nl));p+=46+nl+xl+cl;
F[name]=async()=>{const s=lo+30+v.getUint16(lo+26,true)+v.getUint16(lo+28,true),d=u.slice(s,s+cs);if(m===0)return d.buffer;return new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()}}return F}
// ---------- parse .osu ----------
function parseOsu(t){const M={d:{HP:5,CS:5,OD:5,SliderMultiplier:1.4,SliderTickRate:1},tp:[],ho:[],col:[],bg:null,audio:'',ver:'',title:'',artist:'',mode:0,evl:[],vrl:[],video:null,brk:[]};let sec='',ci=-1,num=0;
for(let l of t.split(/\r?\n/)){const raw=l;l=l.trim();if(!l||l.startsWith('//'))continue;if(l[0]==='['){sec=l;continue}if(sec==='[Events]')M.evl.push(raw);else if(sec==='[Variables]')M.vrl.push(raw);
const k=l.split(':')[0].trim(),v=l.slice(l.indexOf(':')+1).trim();
if(sec==='[General]'&&k==='AudioFilename')M.audio=v;else if(sec==='[General]'&&k==='Mode')M.mode=+v;
else if(sec==='[Metadata]'){if(k==='Artist')M.artist=v;if(k==='Version')M.ver=v;if(k==='Title')M.title=v}
else if(sec==='[Difficulty]'){const x=+v;M.d[k]=x;if(k==='HPDrainRate')M.d.HP=x;else if(k==='CircleSize')M.d.CS=x;else if(k==='OverallDifficulty'){M.d.OD=x;M.d.hasOD=1}else if(k==='ApproachRate')M.d.hasAR=1}
else if(sec==='[Colours]'&&/^Combo/.test(k))M.col.push('rgb('+v+')');
else if(sec==='[Events]'){const q=l.match(/^0\s*,\s*0\s*,\s*"([^"]+)"/);if(q&&!M.bg)M.bg=q[1];const vq=l.match(/^(?:Video|1)\s*,\s*(-?\d+)\s*,\s*"([^"]+)"/i);if(vq&&!M.video)M.video={t:+vq[1],name:vq[2]};const bq=l.match(/^(?:2|Break)\s*,\s*(\d+)\s*,\s*(\d+)/i);if(bq)M.brk.push([+bq[1],+bq[2]])}
else if(sec==='[TimingPoints]'){const a=l.split(',');M.tp.push({t:+a[0],bl:+a[1],un:a.length<7?true:a[6]==='1'})}
else if(sec==='[HitObjects]'){const a=l.split(','),ty=+a[3],o={x:+a[0],y:+a[1],time:+a[2]};
if(M.mode===3){o.col=Math.max(0,Math.min(3,Math.floor(o.x*4/512)));if(ty&128){o.kind='h';o.end=parseInt(a[5])}else if(ty&1)o.kind='n';else continue;M.ho.push(o);continue}if(ty&1)o.kind='c';else if(ty&2)o.kind='s';else if(ty&8)o.kind='p';else continue;
if(ty&4||ci<0||o.kind==='p'){ci=ci+1+((ty>>4)&7);num=1}else num++;o.ci=ci;o.num=num;
if(o.kind==='s'){const cp=a[5].split('|');o.ct=cp[0];o.pts=[{x:o.x,y:o.y}].concat(cp.slice(1).map(s=>{const z=s.split(':');return{x:+z[0],y:+z[1]}}));o.slides=+a[6];o.len=+a[7]}
if(o.kind==='p')o.end=+a[5];M.ho.push(o)}}
M.tp.sort((a,b)=>a.t-b.t);if(!M.col.length){M.defCol=1;M.col=['#ff66aa','#66ccff','#aaff66','#ffcc44']}if(!M.d.hasAR)M.d.ApproachRate=M.d.OD;
M.ho.sort((a,b)=>a.time-b.time);return M}
// ---------- đường cong slider ----------
function bez(p){const o=[],n=Math.max(12,p.length*14);for(let i=0;i<=n;i++){const t=i/n;let q=p.map(a=>({x:a.x,y:a.y}));for(let k=q.length-1;k>0;k--)for(let j=0;j<k;j++)q[j]={x:q[j].x+(q[j+1].x-q[j].x)*t,y:q[j].y+(q[j+1].y-q[j].y)*t};o.push(q[0])}return o}
function circ(a,b,c){const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<1e-6)return null;const A=a.x*a.x+a.y*a.y,B=b.x*b.x+b.y*b.y,C=c.x*c.x+c.y*c.y,ux=(A*(b.y-c.y)+B*(c.y-a.y)+C*(a.y-b.y))/d,uy=(A*(c.x-b.x)+B*(a.x-c.x)+C*(b.x-a.x))/d,r=Math.hypot(a.x-ux,a.y-uy);let t0=Math.atan2(a.y-uy,a.x-ux),t1=Math.atan2(c.y-uy,c.x-ux);const dir=((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))>0?1:-1;if(dir>0)while(t1<t0)t1+=6.2832;else while(t1>t0)t1-=6.2832;
const n=Math.ceil(Math.abs(t1-t0)*r/4)+2,o=[];for(let i=0;i<=n;i++){const t=t0+(t1-t0)*i/n;o.push({x:ux+Math.cos(t)*r,y:uy+Math.sin(t)*r})}return o}
function buildPath(o){const p=o.pts;let poly;
if(o.ct==='L'){poly=p}else if(o.ct==='P'&&p.length===3&&(poly=circ(p[0],p[1],p[2]))){}else{poly=[];let seg=[p[0]];for(let i=1;i<p.length;i++){seg.push(p[i]);if(i<p.length-1&&p[i].x===p[i+1].x&&p[i].y===p[i+1].y||i===p.length-1){poly=poly.concat(seg.length>1?bez(seg):seg);seg=[]}}}
const cum=[0];for(let i=1;i<poly.length;i++)cum.push(cum[i-1]+Math.hypot(poly[i].x-poly[i-1].x,poly[i].y-poly[i-1].y));
if(cum[cum.length-1]<o.len-.01){const a=poly[poly.length-2]||poly[0],b=poly[poly.length-1],d=Math.hypot(b.x-a.x,b.y-a.y)||1,ex=o.len-cum[cum.length-1];poly=poly.concat([{x:b.x+(b.x-a.x)/d*ex,y:b.y+(b.y-a.y)/d*ex}]);cum.push(o.len)}
const n=Math.max(2,Math.ceil(o.len/3)),out=[];let j=0;for(let k=0;k<=n;k++){const d=o.len*k/n;while(j<cum.length-2&&cum[j+1]<d)j++;const s=cum[j+1]-cum[j]||1,t=Math.min(1,Math.max(0,(d-cum[j])/s));out.push({x:poly[j].x+(poly[j+1].x-poly[j].x)*t,y:poly[j].y+(poly[j+1].y-poly[j].y)*t})}return out}
function posAt(o,prog){let s=Math.min(o.slides,Math.max(0,prog)),i=Math.floor(s),f=s-i;if(i>=o.slides){i=o.slides-1;f=1}if(i%2)f=1-f;const k=f*(o.path.length-1),a=Math.floor(k),b=Math.min(o.path.length-1,a+1),t=k-a;return{x:o.path[a].x+(o.path[b].x-o.path[a].x)*t,y:o.path[a].y+(o.path[b].y-o.path[a].y)*t}}
function tpAt2(M,t){let bl=null,m=1;for(const x of M.tp){if(x.t>t)break;if(x.un){bl=x.bl;m=1}else m=Math.min(10,Math.max(.1,-100/x.bl))}if(bl==null){const f=M.tp.find(x=>x.un);bl=f?f.bl:500}return{bl,m}}
// ---------- nạp map ----------
const nm=s=>s.toLowerCase();
async function start(M,F,R){const find=n=>Object.keys(F).find(k=>nm(k)===nm(n));let buf=null,bg=null,note='';if(R){buf=R.buf;bg=R.bg}else{show('…');
try{const k=find(M.audio);const ab=await F[k]();buf=await new Promise((r,j)=>{const p=ac.decodeAudioData(ab,r,j);if(p&&p.catch)p.catch(j)})}catch(e){buf=null;note='Không giải mã được nhạc (Safari không đọc .ogg) - chơi không nhạc'}
try{if(M.bg){const k=find(M.bg);if(k)bg=await createImageBitmap(imgBlob(await F[k]()))}}catch(e){}}
if(R&&R.ex&&R.exk===exKey())EX=R.ex;else{const old=LAST&&LAST.ex;if(old)freeEx(old);if(SET.sb||SET.vid)show('<div style="font-size:18px">Đang tải storyboard / video…</div>');EX=await loadExtras(M,F);if(EX.note)note=(note?note+' · ':'')+EX.note}
if(M.mode===3)return startM(M,F,buf,bg,note);const mo=mods();setAuto(mo.has('AT')||mo.has('CN'));const d=effD(M.d,mo),r=(54.4-4.48*d.CS)*1.3,pre=d.ApproachRate<5?1800-120*d.ApproachRate:1200-150*(d.ApproachRate-5);
P={M,d,objs:prep(M,mo),r,pre,w300:80-6*d.OD,w100:140-8*d.OD,w50:200-10*d.OD,buf,bg,score:0,combo:0,max:0,hp:1,n:[0,0,0,0],pop:[],trail:[],ni:0,rot:0,over:false,cx:256*S+OX,cy:192*S+OY};setupMods(mo);P.col=M.defCol&&SK&&SK.cols&&SK.cols.length?SK.cols:M.col;
for(const o of P.objs){if(o.kind==='s'){const t=tpAt2(M,o.time),px=d.SliderMultiplier*100*t.m;o.path=buildPath(o);o.span=o.len/px*t.bl;o.end=o.time+o.span*o.slides;o.ev=[];const tick=t.bl/d.SliderTickRate;
for(let s=0;s<o.slides;s++){const base=o.time+s*o.span;for(let k=1;k*tick<o.span-10;k++)o.ev.push({t:base+(s%2?o.span-k*tick:k*tick),ty:'t'});if(s<o.slides-1)o.ev.push({t:base+o.span,ty:'r'})}
o.ev.sort((a,b)=>a.t-b.t);o.ev.push({t:Math.max(o.time+o.span*o.slides/2,o.end-36),ty:'e'});o.tot=o.ev.length+1;o.hit=0;o.hd=false}
if(o.kind==='p'){o.req=Math.max(1,Math.floor((o.end-o.time)/1000*HPR(d.OD,3,5,7.5)));o.rot=0;o.la=null;o.pts=0;o.bn=0}}
hpPlan(0);hide();$('x').style.display='block';g.clearRect(0,0,W,H);
LAST={M,F,buf,bg,ex:EX,exk:exKey()};seek(-2000);
if(note){P.note=note;setTimeout(()=>P&&(P.note=''),7000)}requestAnimationFrame(loop)}
const T=()=>(ac.currentTime-P.t0)*1000*P.sp;
// ---------- điều khiển: hit zone + play zone (aim) ----------
const LN=()=>{const w=Math.min(W*.96,H*1.15);return{x:(W-w)/2,w}},colAt=x=>{const l=LN();return Math.max(0,Math.min(3,Math.floor((x-l.x)/(l.w/4))))},mt=new Map(),co={capture:true,passive:false};
function mT(e,f){if(!(P&&P.mn))return;e.preventDefault();e.stopImmediatePropagation();for(const t of e.changedTouches)f(t)}
cv.addEventListener('touchstart',e=>mT(e,t=>{const c=colAt(t.clientX);mt.set(t.identifier,c);press(c)}),co);
cv.addEventListener('touchmove',e=>mT(e,t=>{const o=mt.get(t.identifier),c=colAt(t.clientX);if(o!==undefined&&o!==c){rel(o);mt.set(t.identifier,c);press(c)}}),co);
const mE=e=>mT(e,t=>{const o=mt.get(t.identifier);if(o!==undefined)rel(o);mt.delete(t.identifier)});cv.addEventListener('touchend',mE,co);cv.addEventListener('touchcancel',mE,co);
const MK=['KeyD','KeyF','KeyJ','KeyK'];addEventListener('keydown',e=>{const c=MK.indexOf(e.code);if(P&&P.mn&&c>=0&&!e.repeat)press(c)});addEventListener('keyup',e=>{const c=MK.indexOf(e.code);if(P&&P.mn&&c>=0)rel(c)});
const touches=new Map();let kheld=new Set(),mheld=0,flash=[];const HR=()=>DIRECT||AUTOM?null:zr('hz'),inR=(r,x,y)=>r&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
function setCur(x,y){if(P&&!P.rp){P.cx=x;P.cy=Math.min(y,H-BZ+10)}}
function cv_(e,f){e.preventDefault();for(const t of e.changedTouches)f(t)}
cv.addEventListener('touchstart',e=>cv_(e,t=>{if(inR(HR(),t.clientX,t.clientY)){touches.set(t.identifier,'h');flash.push({y:t.clientY,t:performance.now()});tap()}else{touches.set(t.identifier,'a');setCur(t.clientX,t.clientY);tap()}}),{passive:false});
cv.addEventListener('touchmove',e=>cv_(e,t=>{if(touches.get(t.identifier)==='a')setCur(t.clientX,t.clientY)}),{passive:false});
const te=e=>cv_(e,t=>touches.delete(t.identifier));cv.addEventListener('touchend',te,{passive:false});cv.addEventListener('touchcancel',te,{passive:false});
cv.addEventListener('mousemove',e=>setCur(e.clientX,e.clientY));cv.addEventListener('mousedown',e=>{mheld++;setCur(e.clientX,e.clientY);tap()});addEventListener('mouseup',()=>mheld=Math.max(0,mheld-1));
addEventListener('keydown',e=>{if(e.repeat||!/^(KeyZ|KeyX)$/.test(e.code))return;kheld.add(e.code);tap()});addEventListener('keyup',e=>kheld.delete(e.code));
const isHeld=()=>P&&P.rp?!!P.rh:touches.size+kheld.size+mheld>0;
// ---------- tua / skip / tạm dừng ----------
function seek(ms){if(P.src){try{P.src.stop()}catch(e){}P.src=null}P.t0=ac.currentTime-ms/1000/P.sp;if(P.buf){const s=ac.createBufferSource();s.buffer=P.buf;s.playbackRate.value=P.sp;s.connect(ac.destination);if(ms>=0)s.start(0,ms/1000);else s.start(ac.currentTime-ms/1000/P.sp);P.src=s}}
function skipT(now){const o=P.objs;let pe=-1e9;for(let i=0;i<o.length;i++){if(o[i].time>now){return(o[i].time-now>3500&&(!i||(o[i].time-pe>5000&&now>=pe)))?o[i].time-2000:null}pe=o[i].end||o[i].time}return null}
$('sk').onclick=()=>{if(P&&!P.paused&&!P.over&&P.sk!=null)seek(P.sk)};
function endPlay(){setAuto(false);vidStop();if(P){if(P.src)try{P.src.stop()}catch(e){}P.over=true;P=null}$('x').style.display='none';$('sk').style.display='none'}
function replay(){Promise.resolve(ac.resume()).then(()=>start(LAST.M,LAST.F,LAST))}
function pause(){if(!P||P.over||P.paused)return;P.paused=true;vidStop();ac.suspend();touches.clear();mt.clear();if(P.mn)P.held=[0,0,0,0];kheld.clear();mheld=0;$('sk').style.display='none';
show('<button id="r1">Tiếp tục</button><button class="s" id="r2">Chơi lại</button><button class="s" id="r4">⚙ Cài đặt</button><button class="s" id="r3">Thoát</button>');$('r4').onclick=()=>settingsPanel(()=>{});
$('r1').onclick=()=>{hide();P.paused=false;ac.resume();requestAnimationFrame(loop)};
$('r2').onclick=()=>{endPlay();replay()};$('r3').onclick=()=>{RP=null;REPMODS=null;endPlay();ac.resume();select(CURID)}}
$('x').onclick=pause;document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
function click(){if(!ac)return;const o=ac.createOscillator(),n=ac.createGain();o.frequency.value=950;n.gain.setValueAtTime(.12,ac.currentTime);n.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.05);o.connect(n);n.connect(ac.destination);o.start();o.stop(ac.currentTime+.06)}
// ---------- luật chơi ----------
function judge(v,x,y){P.n[v===300?0:v===100?1:v===50?2:3]++;if(v){P.score+=Math.round((v+Math.round(v*Math.max(P.combo-1,0)/25))*P.mult);P.combo++;hpAdd(v===300?P.hu:v===100?P.hu*.5:P.hu*.15)}else{P.combo=0;hpAdd(-P.hm)}P.max=Math.max(P.max,P.combo);if(v===0&&P.sd||v<300&&P.pf)P.sdf=1;P.pop.push({x,y,v,t:T()})}
function ev(hit){if(hit){P.score+=Math.round(10*P.mult);P.combo++;hpAdd(P.hu*.25)}else{P.combo=0;hpAdd(-P.hm*.25)}P.max=Math.max(P.max,P.combo)}
function tap(rt,rx,ry){if(!P||P.over||P.mn||(P.rp&&rt===undefined))return;click();const now=rt!==undefined?rt:T(),px=rx!==undefined?rx:(P.cx-OX)/S,py=ry!==undefined?ry:(P.cy-OY)/S;if(P.rec)P.rec.t.push([Math.round(now),Math.round(px*4)/4,Math.round(py*4)/4]);
while(P.ni<P.objs.length&&(P.objs[P.ni].done||P.objs[P.ni].kind==='p'&&0))P.ni++;
for(let i=P.ni;i<P.objs.length;i++){const o=P.objs[i];if(o.kind==='p')continue;if(o.done||o.hd)continue;if(o.time-now>P.w50)return;
if(Math.hypot(px-o.x,py-o.y)>P.r)return;const e=Math.abs(now-o.time),v=e<=P.w300?300:e<=P.w100?100:50;
if(o.kind==='c'){o.done=true;o.hitT=now;judge(v,o.x,o.y)}else{o.hd=true;o.hit++;ev(true)}return}}
function update(now){if(P.rp)repStep(now);const dt=Math.max(0,Math.min(100,now-(P.lt==null?now:P.lt)));P.lt=now;hpDrain(now);if(P.rx||P.ap)autoStep(now);const px=(P.cx-OX)/S,py=(P.cy-OY)/S,h=P.rx||isHeld();if(P.rec)P.rec.f.push(Math.round(now),Math.round(px*4)/4,Math.round(py*4)/4,h?1:0);
for(const o of P.objs){if(o.done)continue;
if(o.kind==='c'){if(now>o.time+P.w50){o.done=true;judge(0,o.x,o.y)}}
else if(o.kind==='s'){if(!o.hd&&now>o.time+P.w50){o.hd=true;ev(false)}
if(now>=o.time){o.evi=o.evi||0;const b=posAt(o,(now-o.time)/o.span);o.trk=h&&Math.hypot(px-b.x,py-b.y)<=P.r*2.4;
while(o.evi<o.ev.length&&o.ev[o.evi].t<=now){const e=o.ev[o.evi++],p=posAt(o,(e.t-o.time)/o.span),ok=h&&Math.hypot(px-p.x,py-p.y)<=P.r*2.4;if(ok)o.hit++;ev(ok);if(ok&&e.ty!=='e')click()}
if(now>=o.end&&o.evi>=o.ev.length){o.done=true;const f=o.hit/o.tot,e=posAt(o,o.slides);judge(f>=.999?300:f>=.5?100:f>0?50:0,e.x,e.y)}}}
else if(o.kind==='p'&&now>=o.time){if(now<o.end)spinStep(o,now,dt,h,px,py);else{o.done=true;const f=o.rot/o.req;judge(f>=1?300:f>=.9?100:f>=.25?50:0,256,192);P.score+=Math.round((o.pts||0)*P.mult)}}}
const last=P.objs[P.objs.length-1];if(now>(last.end||last.time)+1500||P.sdf||P.hp<=0&&!P.nf)finish(!!(P.sdf||P.hp<=0))}
function finish(fail){if(P.over)return;P.over=true;vidStop();if(P.src)try{P.src.stop()}catch(e){}$('x').style.display='none';setAuto(false);const n=P.n,mn=P.mn,tot=n.reduce((a,b)=>a+b,0),acc=!tot?1:mn?P.ws/(305*tot):(300*n[0]+100*n[1]+50*n[2])/(300*tot),rk=fail?'F':acc>=1?'SS':acc>=.95?'S':acc>=.9?'A':acc>=.8?'B':acc>=.7?'C':'D',ln=mn?'MAX: '+n[5]+' · 300: '+n[4]+' · 200: '+n[3]+' · 100: '+n[2]+' · 50: '+n[1]+' · miss: '+n[0]:'300: '+n[0]+' · 100: '+n[1]+' · 50: '+n[2]+' · miss: '+n[3];
{const jc={SS:'#ffd84d',S:'#ffd84d',A:'#7ddc4a',B:'#4aa8ff',C:'#c77dff',D:'#ff5a5a',F:'#ff5a5a'},cell=(l,v,c)=>'<div class="rc"><span style="color:'+c+'">'+l+'</span><b>'+v+'x</b></div>',
cells=mn?cell('MAX',n[5],'#9ef')+cell('300',n[4],'#fd5')+cell('200',n[3],'#8f6')+cell('100',n[2],'#6cf')+cell('50',n[1],'#c9f')+cell('miss',n[0],'#f55'):cell('300',n[0],'#6cf')+cell('100',n[1],'#8f6')+cell('50',n[2],'#fc4')+cell('miss',n[3],'#f55'),
ms=mn?n[0]:n[3],pf=fail?'Thất bại':ms===0?(acc>=1?'Hoàn hảo':'Full Combo'):'Hoàn thành',
mods=(P.modTxt||'').split(' ').filter(Boolean).map(m=>'<i class="rm">'+m+'</i>').join(''),M0=P.M||{},
back=P.rp?"RP=null;REPMODS=null;select(CURID)":"select(CURID)";
show('<div class="rk"><div class="rkh"><div class="a"><b class="tn">'+esc((M0.title||'')+(M0.artist?' - '+M0.artist:'')+(M0.ver?' ['+M0.ver+']':''))+'</b><small>Chơi lúc '+new Date().toLocaleString()+'</small></div><div class="rkt">Xếp hạng</div></div>'+
'<div class="rkb"><div class="rkl"><div class="rks"><span>Điểm</span><b>'+String(P.score).padStart(8,'0')+'</b></div><div class="rkp"><div class="rg">'+cells+'</div><div class="rq"><div><small>Combo</small><b>'+P.max+'x</b></div><div><small>Độ chính xác</small><b>'+(acc*100).toFixed(2)+'%</b></div></div></div></div>'+
'<div class="rkR"><div class="rkk" style="color:'+(jc[rk]||'#fff')+'">'+rk+'</div>'+(mods?'<div class="rms">'+mods+'</div>':'')+'<button class="rbt" onclick="replay()">'+(P.rp?'Xem lại':'Chơi lại')+'</button></div></div>'+
'<div class="rkf"><button class="rbk" onclick="'+back+'">◀ Back</button><div class="rpf">'+pf+'</div></div></div>','rk')}$('sk').style.display='none';if(!P.rp&&!fail&&!P.auto)saveRec(P,acc,rk);P=null}
// ---------- vẽ ----------
const X=v=>OX+v*S,Y=v=>OY+v*S;
function drawCircle(o,now,a,head){if(SK&&SK.hitcircle)return drawCircleSk(o,now,a);const r=P.r*S,col=P.col[o.ci%P.col.length];g.globalAlpha=a;g.beginPath();g.arc(X(o.x),Y(o.y),r,0,6.2832);g.fillStyle=col;g.fill();g.lineWidth=r*.12;g.strokeStyle='#fff';g.stroke();g.fillStyle='#fff';g.font='bold '+r*.9+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(o.num,X(o.x),Y(o.y)+1);
const p=Math.min(1,Math.max(0,(now-(o.time-P.pre))/P.pre));if(p<1&&!P.hd){g.beginPath();g.arc(X(o.x),Y(o.y),r*(1+3*(1-p)),0,6.2832);g.lineWidth=Math.max(2,r*.07);g.strokeStyle=col;g.stroke()}g.globalAlpha=1}
function draw(now){g.clearRect(0,0,W,H);drawBack(now);
const r=P.r*S;g.lineCap=g.lineJoin='round';
const vis=[];for(const o of P.objs){const st=o.time-P.pre;if(now<st)break;if(o.done)continue;vis.push(o)}
for(let i=vis.length-1;i>=0;i--){const o=vis[i],a=hdA(o,now);
if(o.kind==='c')drawCircle(o,now,a);
else if(o.kind==='s'){g.globalAlpha=a;g.beginPath();o.path.forEach((p,k)=>k?g.lineTo(X(p.x),Y(p.y)):g.moveTo(X(p.x),Y(p.y)));g.strokeStyle='#fff';g.lineWidth=r*2;g.stroke();g.strokeStyle='rgba(20,18,40,.85)';g.lineWidth=r*1.76;g.stroke();g.globalAlpha=1;
const e=o.path[o.path.length-1];if(o.slides>1){g.fillStyle='#fff';g.font='bold '+r+'px sans-serif';g.textAlign='center';g.fillText('↺',X(e.x),Y(e.y))}
if(!o.hd)drawCircle(o,now,a);
if(now>=o.time){const b=posAt(o,(now-o.time)/o.span),col=P.col[o.ci%P.col.length];g.beginPath();g.arc(X(b.x),Y(b.y),r*(o.trk?2.4:1.4),0,6.2832);g.lineWidth=3;g.strokeStyle='#fff';g.globalAlpha=o.trk?.9:.4;g.stroke();g.globalAlpha=1;if(SK&&SK.sliderb0)g.drawImage(SK.sliderb0,X(b.x)-r*.9,Y(b.y)-r*.9,r*1.8,r*1.8);else{g.beginPath();g.arc(X(b.x),Y(b.y),r*.9,0,6.2832);g.fillStyle=col;g.fill()}}}
else if(o.kind==='p')drawSpin(o,now,a)}
for(const b of P.bp){const k=(now-b.t)/900;if(k<0||k>1)continue;g.globalAlpha=1-k;g.fillStyle='#ffd84d';g.font='bold 28px sans-serif';g.textAlign='center';g.textBaseline='alphabetic';g.fillText('+'+b.v,X(256)+b.dx,Y(192)+b.dy-30-k*90)}g.globalAlpha=1;P.bp=P.bp.filter(b=>now-b.t<900);
sbOver(now);if(P.cin){P.pop=[];return}for(const p of P.pop){const k=(now-p.t)/600;if(k>1||k<0)continue;g.globalAlpha=1-k;g.fillStyle=p.v===300?'#6cf':p.v===100?'#8f6':p.v===50?'#fc4':'#f44';g.font='bold '+r*.8+'px sans-serif';g.textAlign='center';{const hi=SK&&SK['hit'+p.v];if(hi){const w=r*2,h=w*hi.height/hi.width;g.drawImage(hi,X(p.x)-w/2,Y(p.y)-h/2-k*20,w,h)}else g.fillText(p.v||'✕',X(p.x),Y(p.y)-k*20)}}g.globalAlpha=1;P.pop=P.pop.filter(p=>now-p.t<600);
if(P.fl){const R=(P.combo>=200?130:P.combo>=100?160:190)*S,q=g.createRadialGradient(P.cx,P.cy,R*.8,P.cx,P.cy,R*1.1);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.97)');g.fillStyle=q;g.fillRect(0,0,W,H)}
const hz=HR(),hh=isHeld();if(hz){g.fillStyle=hh?'rgba(255,102,170,.14)':'rgba(255,255,255,.05)';g.fillRect(hz.x,hz.y,hz.w,hz.h);g.strokeStyle='rgba(255,102,170,.8)';g.lineWidth=2;g.strokeRect(hz.x,hz.y,hz.w,hz.h);
g.fillStyle='rgba(255,255,255,.4)';g.font='bold 15px sans-serif';g.textAlign='center';g.fillText('HIT ZONE',hz.x+hz.w/2,hz.y+hz.h/2+5);
const pn=performance.now();flash=flash.filter(f=>pn-f.t<250);for(const f of flash){g.fillStyle='rgba(255,102,170,'+.4*(1-(pn-f.t)/250)+')';g.fillRect(hz.x,Math.max(hz.y,f.y-70),hz.w,Math.min(140,hz.y+hz.h-Math.max(hz.y,f.y-70)))}}
// HUD
g.fillStyle='#fff';g.textAlign='right';g.textBaseline='alphabetic';g.font='bold 24px sans-serif';g.fillText(String(P.score).padStart(8,'0'),W-60,34);const n=P.n,t=n[0]+n[1]+n[2]+n[3];g.font='14px sans-serif';g.fillText(((t?(300*n[0]+100*n[1]+50*n[2])/(300*t):1)*100).toFixed(2)+'%',W-60,54);drawTimeRing(now,W-60-g.measureText(((t?(300*n[0]+100*n[1]+50*n[2])/(300*t):1)*100).toFixed(2)+'%').width-14,54);g.textAlign='right';g.font='14px sans-serif';if(P.modTxt)g.fillText(P.modTxt,W-60,72);
g.textAlign='left';g.font='bold 34px sans-serif';g.fillText(P.combo+'x',hz+14,H-16);g.fillStyle='#333';g.fillRect(hz+14,14,W*.25,8);g.fillStyle=P.hp>.3?'#6f8':'#f55';g.fillRect(hz+14,14,W*.25*Math.max(0,P.hp),8);
if(P.note){g.fillStyle='#fc4';g.font='14px sans-serif';g.fillText(P.note,hz+14,50)}
// con trỏ osu!droid
if(!SET.cur)return;const cr=SET.cr;if(SK&&SK.cursor){const s=cr*5;g.drawImage(SK.cursor,P.cx-s/2,P.cy-s/2,s,s);return}g.beginPath();g.arc(P.cx,P.cy,cr,0,6.2832);g.fillStyle=isHeld()?'#ff66aa':'#fff';g.fill();g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.75)';g.stroke()}
function loop(){if(!P||P.over||P.paused){LF=0;return}const pf=performance.now();if(LF)FT=FT*.9+(pf-LF)*.1;LF=pf;const now=T();(P.mn?updM:update)(now);if(P&&!P.over){P.sk=skipT(now);const d=P.sk!=null?'block':'none';if($('sk').style.display!==d)$('sk').style.display=d;(P.mn?drawM:draw)(now);drawInfo();requestAnimationFrame(loop)}}

// ---------- osui!: mods, sao, mania 4K ----------
const MD=[['EZ','Easy',.5,1],['NF','No Fail',.5,1],['HT','Half Time',.3,1],['HR','Hard Rock',1.06,1],['SD','Sudden Death',1,1],['PF','Perfect',1,1],['DT','Double Time',1.12,1],['NC','Nightcore',1.12,1],['HD','Hidden',1.06,1],['FL','Flashlight',1.12,0],['RX','Relax',.1,0],['AP','Auto Pilot',.1,0],['SO','Spun Out',.9,0],['AT','Auto',1,1],['CN','Cinema',1,1],['TP','Target Practice',1,0]];
const CF={EZ:'HR',HR:'EZ',HT:'DT NC',DT:'HT NC',NC:'HT DT',SD:'PF NF',PF:'SD NF',NF:'SD PF AT CN',RX:'AP AT CN',AP:'RX AT CN',SO:'AT CN',AT:'RX AP SO CN NF SD PF',CN:'RX AP SO AT NF SD PF',FL:'',HD:'',TP:''};
const mods=()=>new Set(REPMODS||MODS),setAuto=v=>{AUTOM=v;rs()},setMania=v=>{MANIA=v;try{localStorage.setItem('osui_mania',v?'1':'0')}catch(e){}};
const mult=(mo,mn)=>[...mo].filter(k=>!mn||MD.find(m=>m[0]===k)[3]).reduce((a,k)=>a*MD.find(m=>m[0]===k)[2],1);
function toggleMod(k){if(MODS.has(k))MODS.delete(k);else{CF[k].split(' ').forEach(x=>x&&MODS.delete(x));MODS.add(k)}try{localStorage.setItem('osui_mods',JSON.stringify([...MODS]))}catch(e){}}
const MG=[['Giảm độ khó','#7ddc4a',['EZ','NF','HT']],['Tăng độ khó','#ff6a3d',['HR','SD','PF','DT','NC','HD','FL']],['Đặc biệt','#ffffff',['RX','AP','SO','AT','CN','TP']]];
function modsPanel(done){const o=document.createElement('div');o.id='mp';
const dr=()=>{const by={};MD.forEach(m=>by[m[0]]=m);
o.innerHTML='<div class="mpi md"><div class="mdt">Mod mang lại nhiều cách chơi khác nhau. Một số mod ảnh hưởng đến điểm số khi chơi xếp hạng, số khác chỉ để giải trí.</div><div class="mph">Hệ số điểm: <span>×'+mult(MODS,MANIA).toFixed(2)+'</span></div>'+
MG.map(r=>'<div class="mr"><div class="ml" style="color:'+r[1]+'">'+r[0]+'</div><div class="mrb">'+r[2].map(k=>{const m=by[k];return'<button class="mb'+(MODS.has(k)?' on':'')+(MANIA&&!m[3]?' na':'')+'" data-k="'+k+'"><b>'+k+'</b><small>'+m[1]+'</small></button>'}).join('')+'</div></div>').join('')+
'<button class="mrs" id="mrs">1. Đặt lại tất cả Mod</button><button class="mcl" id="mx">2. Đóng</button></div>';
o.querySelectorAll('.mb').forEach(b=>b.onclick=()=>{toggleMod(b.dataset.k);dr()});
o.querySelector('#mrs').onclick=()=>{MODS.clear();try{localStorage.setItem('osui_mods','[]')}catch(e){}dr()};
o.querySelector('#mx').onclick=()=>{o.remove();done()}};dr();ui.appendChild(o)}
function effD(d,mo,mn){const e=Object.assign({},d);if(mo.has('EZ'))for(const k of['CS','ApproachRate','OD','HP'])e[k]=d[k]*.5;if(mo.has('HR')){if(!mn)e.CS=Math.min(10,d.CS*1.3);for(const k of['ApproachRate','OD','HP'])e[k]=Math.min(10,d[k]*1.4)}return e}
function prep(M,mo){const hr=mo.has('HR'),tp=mo.has('TP');return M.ho.map(o=>{o=Object.assign({},o);if(tp){if(o.kind==='p'){o.x=256;o.y=192;delete o.end}o.kind='c';delete o.pts}if(hr){o.y=384-o.y;if(o.pts)o.pts=o.pts.map(p=>({x:p.x,y:384-p.y}))}return o})}
function setupMods(mo,mn){P.mo=[...mo];P.rp=!!RP;if(RP){P.rf=RP.f||[];P.rt=RP.t||[];P.re=RP.e||[];P.fi=P.ti=P.ei=0}else P.rec={f:[],t:[],e:[]};const h=k=>mo.has(k)&&(!mn||MD.find(m=>m[0]===k)[3]);P.sp=h('DT')||h('NC')?1.5:h('HT')?.75:1;P.nf=h('NF');P.sd=h('SD')||h('PF');P.pf=h('PF');P.hd=h('HD');P.fl=h('FL');P.at=h('AT');P.cin=h('CN');P.rx=h('RX')||P.at||P.cin;P.ap=h('AP')||P.at||P.cin;P.so=h('SO')||P.at||P.cin;P.auto=P.at||P.cin;P.ai=0;P.ri=0;P.mult=mult(mo,mn);P.modTxt=MD.filter(m=>h(m[0])).map(m=>m[0]).join(' ')}
const hdA=(o,now)=>{let a=Math.min(1,(now-(o.time-P.pre))/400);if(P.hd&&o.kind!=='p')a=Math.min(a,Math.max(0,((o.kind==='s'?o.end:o.time)-now)/(P.pre*.6)));return a};
const endPos=o=>o.kind==='s'?posAt(o,o.slides):o.kind==='p'?{x:256,y:192}:{x:o.x,y:o.y};
function autoPos(now){const A=P.objs;while(P.ai<A.length&&(A[P.ai].end||A[P.ai].time)<now)P.ai++;const o=A[P.ai];if(!o)return A.length?endPos(A[A.length-1]):{x:256,y:192};
if(now>=o.time){if(o.kind==='s')return posAt(o,(now-o.time)/o.span);if(o.kind==='p'){const a=now*.03;return{x:256+Math.cos(a)*50,y:192+Math.sin(a)*50}}return{x:o.x,y:o.y}}
const pv=A[P.ai-1],f=pv?endPos(pv):{x:256,y:192},t0=pv?(pv.end||pv.time):o.time-800,k=Math.max(0,Math.min(1,(now-t0)/Math.max(1,o.time-t0))),e=k*k*(3-2*k),s=o.kind==='p'?{x:256,y:192}:{x:o.x,y:o.y};return{x:f.x+(s.x-f.x)*e,y:f.y+(s.y-f.y)*e}}
function autoStep(now){if(P.ap){const q=autoPos(now);P.cx=X(q.x);P.cy=Y(q.y)}
if(P.rx){while(P.ri<P.objs.length&&(P.objs[P.ri].done||P.objs[P.ri].hd||P.objs[P.ri].kind==='p'))P.ri++;const o=P.objs[P.ri];if(o&&now>=o.time&&Math.hypot((P.cx-OX)/S-o.x,(P.cy-OY)/S-o.y)<=P.r)tap()}}
function calcSR(m){const h=m.ho;if(h.length<2)return 0;const s={};
if(m.mode===3){for(const o of h){const k=Math.floor(o.time/1000);s[k]=(s[k]||0)+(o.kind==='h'?1.3:1)}const v=Object.values(s).sort((a,b)=>b-a),n=Math.max(1,Math.ceil(v.length*.15)),t=v.slice(0,n).reduce((a,b)=>a+b,0)/n;return +Math.max(.1,1.1*Math.pow(t,.6)*(1+(m.d.OD-5)*.02)).toFixed(2)}
const r=54.4-4.48*m.d.CS;let p=h[0];for(let i=1;i<h.length;i++){const o=h[i],dl=Math.max(o.time-p.time,40),ds=Math.min(3,Math.hypot(o.x-p.x,o.y-p.y)/(2*r)),v=1000/dl*(.6+ds),k=Math.floor(o.time/500);if(!(s[k]>v))s[k]=v;p=o}
const a=Object.values(s).sort((x,y)=>y-x),n=Math.max(1,Math.ceil(a.length*.15)),t=a.slice(0,n).reduce((x,y)=>x+y,0)/n;return +Math.max(.1,.75*Math.pow(t,.62)*(1+(m.d.CS-4)*.03+(m.d.OD-5)*.02)).toFixed(2)}
// ---------- osu!mania 4K ----------
const TT=560,TN=['MISS','50','100','200','300','MAX'],TC=['#f44','#fc4','#8f6','#6cf','#fff','#ff9cc8'];
function startM(M,F,buf,bg,note){const mo=mods(),d=effD(M.d,mo,1);setAuto(false);const cols=[[],[],[],[]],objs=M.ho.map(o=>Object.assign({},o));objs.forEach(o=>cols[o.col].push(o));const od=d.OD;
P={M,d,mn:1,objs,cols,ptr:[0,0,0,0],held:[0,0,0,0],lit:[0,0,0,0],buf,bg,score:0,combo:0,max:0,hp:1,n:[0,0,0,0,0,0],ws:0,N:objs.length,pop:[],over:false,last:Math.max(...objs.map(o=>o.end||o.time)),W:[16,64-3*od,97-3*od,127-3*od,151-3*od,188-3*od]};
setupMods(mo,1);hpPlan(1);hide();$('x').style.display='block';g.clearRect(0,0,W,H);LAST={M,F:F||(LAST&&LAST.F),buf,bg,ex:EX,exk:exKey()};seek(-2000);if(note){P.note=note;setTimeout(()=>P&&(P.note=''),7000)}requestAnimationFrame(loop)}
function jm(t){P.n[t]++;P.ws+=[0,50,100,200,300,305][t];if(t)P.combo++;else P.combo=0;P.max=Math.max(P.max,P.combo);hpAdd(P.G[t]);P.score=Math.round(1e6*P.ws/(305*P.N)*P.mult);if(t===0&&P.sd||t<4&&P.pf)P.sdf=1;P.pop=P.pop.slice(-2).concat({t:T(),k:t})}
function pressAt(c,t){const o=P.cols[c][P.ptr[c]];if(!o||o.on)return;const w=P.W,dt=t-o.time;if(dt<-w[5])return;const a=Math.abs(dt),k=a<=w[0]?5:a<=w[1]?4:a<=w[2]?3:a<=w[3]?2:a<=w[4]?1:0;if(o.kind==='h'){o.on=1;o.ht=k;return}P.ptr[c]++;o.done=1;jm(k)}
function relAt(c,t){const o=P.cols[c][P.ptr[c]];if(!o||!o.on)return;const w=P.W,a=Math.abs(t-o.end),s=1.5,k=a<=w[0]*s?5:a<=w[1]*s?4:a<=w[2]*s?3:a<=w[3]*s?2:a<=w[4]*s?1:0;o.on=0;o.done=1;P.ptr[c]++;jm(Math.min(o.ht,k))}
function press(c){if(!P||!P.mn||P.over||P.paused||P.rp)return;const t=T();if(P.rec)P.rec.e.push([Math.round(t),c,1]);P.held[c]=1;P.lit[c]=performance.now();click();pressAt(c,t)}
function rel(c){if(!P||!P.mn||P.rp)return;const t=T();if(P.rec&&P.held[c])P.rec.e.push([Math.round(t),c,0]);P.held[c]=0;if(!P.over&&!P.paused)relAt(c,t)}
function updM(now){if(P.rp)repM(now);hpDrain(now);const w=P.W;for(let c=0;c<4;c++){const o=P.cols[c][P.ptr[c]];if(!o)continue;
if(P.auto){if(!o.on&&now>=o.time){pressAt(c,o.time);P.lit[c]=performance.now()}if(o.on&&now>=o.end)relAt(c,o.end)}
else if(o.on){if(!P.held[c])relAt(c,now);else if(now>=o.end+w[3])relAt(c,o.end)}
else if(now-o.time>w[5]){o.done=1;P.ptr[c]++;jm(0)}}
if(P.sdf||P.hp<=0&&!P.nf)finish(true);else if(now>P.last+1500)finish(false)}
function drawBody(im,x,yt,w,yb,bs){if(yb<=yt)return;const th=Math.max(1,im.height*w/im.width);if(bs<0)bs=(im.height>=im.width*.3&&yb-yt>th*1.2)?1:0;if(!bs){g.drawImage(im,x,yt,w,yb-yt);return}const y0=Math.max(yt,0),y1=Math.min(yb,H);if(y1<=y0)return;let pt=im.__p;if(!pt){try{pt=im.__p=g.createPattern(im,'repeat-y')}catch(e){}}if(!pt||!pt.setTransform){g.drawImage(im,x,yt,w,yb-yt);return}pt.setTransform(new DOMMatrix([w/im.width,0,0,th/im.height,x,bs===2?yt:yb-th]));g.save();g.fillStyle=pt;g.fillRect(x,y0,w,y1-y0);g.restore()}
function songLen(){if(!P.sl){const o=P.objs[P.objs.length-1];P.sl=P.buf&&P.buf.duration?P.buf.duration*1000:(o?(o.end||o.time)+1000:1)}return P.sl}
const fmtT=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
function drawTimeRing(now,ax,ay){const L=songLen(),k=Math.max(0,Math.min(1,now/L)),r=11,cx=ax-r,cy=ay-4;g.save();g.lineWidth=3;g.lineCap='round';g.beginPath();g.arc(cx,cy,r,0,6.2832);g.strokeStyle='rgba(255,255,255,.22)';g.stroke();if(k>0){g.beginPath();g.arc(cx,cy,r,-1.5708,-1.5708+6.2832*k);g.strokeStyle='#ff66aa';g.stroke()}g.fillStyle='rgba(255,255,255,.75)';g.font='12px sans-serif';g.textAlign='right';g.textBaseline='alphabetic';g.fillText(fmtT(Math.max(0,now))+' / '+fmtT(L),cx-r-8,cy+4);g.restore()}
function drawM(now){g.clearRect(0,0,W,H);drawBack(now);
const l=LN(),cw=l.w/4,mn=SK&&SK.mn,hy=H*(mn&&mn.hp?mn.hp:.82),pn=performance.now(),nh=Math.max(18,cw*.3),yf=t=>hy-(t-now)/TT*hy,asp=(im,w)=>w*im.height/im.width;
g.fillStyle='rgba(0,0,0,.6)';g.fillRect(l.x,0,l.w,H);
if(mn){const sc=H/480;if(mn.stl){const w=mn.stl.width*sc*(mn.stl.k2||1);g.drawImage(mn.stl,l.x-w,0,w,H)}if(mn.str){const w=mn.str.width*sc*(mn.str.k2||1);g.drawImage(mn.str,l.x+l.w,0,w,H)}}
for(let c=0;c<4;c++){const x=l.x+c*cw,hd=P.held[c],fd=hd?1:Math.max(0,1-(pn-P.lit[c])/150),dn=hd||pn-P.lit[c]<120;
if(fd>0){if(mn&&mn.light){g.globalAlpha=fd*.9;const lh=hy*.55;g.drawImage(mn.light,x,hy-lh,cw,lh)}else{g.globalAlpha=fd;g.fillStyle='rgba(255,102,170,.28)';g.fillRect(x,hy-170,cw,170)}g.globalAlpha=1}
g.fillStyle='rgba(255,255,255,.15)';g.fillRect(x-1,0,2,H);
const ki=mn&&(dn&&mn.keyD[c]?mn.keyD[c]:mn.key[c]);
if(ki){const kh=asp(ki,cw);g.drawImage(ki,x,H-kh,cw,kh)}else{g.fillStyle=dn?'rgba(255,102,170,.7)':'rgba(255,255,255,.08)';g.fillRect(x+4,hy+6,cw-8,H-hy-10);g.fillStyle='rgba(255,255,255,.5)';g.font='bold 18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('DFJK'[c],x+cw/2,hy+(H-hy)/2)}}
g.fillStyle='rgba(255,255,255,.15)';g.fillRect(l.x+l.w-1,0,2,H);
if(mn&&mn.hint){const h=mn.hint.height*(H/480)*(mn.hint.k2||1);g.drawImage(mn.hint,l.x,hy-h*(mn.hintA==null?.5:mn.hintA),l.w,h)}else{g.fillStyle='#ff66aa';g.fillRect(l.x,hy-2,l.w,4)}
for(let c=0;c<4;c++){const pd=mn?1:4,x=l.x+c*cw+pd,w=cw-2*pd,col=c%3?'#ff9cc8':'#fff',ni=mn&&mn.note[c],hi=mn&&mn.noteH[c];
for(let i=P.ptr[c];i<P.cols[c].length;i++){const o=P.cols[c][i],y=yf(o.time);if(y<-nh)break;let a=1;if(P.hd)a=y<hy*.4?1:Math.max(0,1-(y-hy*.4)/(hy*.25));g.fillStyle=col;
if(o.kind==='h'){const yt=yf(o.end),yb=o.on?hy:y,bi=mn&&mn.noteL[c];
if(bi){g.globalAlpha=a;drawBody(bi,x,yt,w,yb,mn.bs)}else if(mn&&mn.bodyCol[c]){const k=mn.bodyCol[c];g.globalAlpha=a*.6;g.fillStyle='rgb('+k[0]+','+k[1]+','+k[2]+')';g.fillRect(x+w*.08,yt,w*.84,yb-yt)}else{g.globalAlpha=a*.5;g.fillRect(x+w*.18,yt,w*.64,yb-yt)}
g.globalAlpha=a;const ti=mn&&mn.noteT[c],tf=ti||hi||ni;
if(tf){const th=asp(tf,w);g.save();g.translate(x+w/2,yt);if(!ti)g.scale(1,-1);g.drawImage(tf,-w/2,-th/2,w,th);g.restore()}else g.fillRect(x,yt-nh*.2,w,nh*.4);
if(hi){const hh=asp(hi,w);g.drawImage(hi,x,yb-hh/2,w,hh)}else g.fillRect(x,yb-nh/2,w,nh)}
else{g.globalAlpha=a;if(ni){const hh=asp(ni,w);g.drawImage(ni,x,y-hh/2,w,hh)}else g.fillRect(x,y-nh/2,w,nh)}}}g.globalAlpha=1;
sbOver(now);if(P.cin)return;
const t=P.n.reduce((a,b)=>a+b,0),acc=t?P.ws/(305*t):1;g.textBaseline='alphabetic';g.fillStyle='#fff';g.textAlign='right';g.font='bold 24px sans-serif';g.fillText(String(P.score).padStart(7,'0'),W-60,34);g.font='14px sans-serif';g.fillText((acc*100).toFixed(2)+'%',W-60,54);drawTimeRing(now,W-60-g.measureText((acc*100).toFixed(2)+'%').width-14,54);g.textAlign='right';g.font='14px sans-serif';if(P.modTxt)g.fillText(P.modTxt,W-60,72);
g.textAlign='center';if(P.combo>1){g.globalAlpha=.5;g.font='bold 40px sans-serif';g.fillText(P.combo+'x',l.x+l.w/2,H*.3);g.globalAlpha=1}
const lp=P.pop[P.pop.length-1];if(lp&&now-lp.t<500){g.globalAlpha=1-(now-lp.t)/500;const ji=mn&&mn.hit[lp.k];if(ji){const w=Math.min(l.w*.8,ji.width*(H/480)*(ji.k2||1)),h=asp(ji,w);g.drawImage(ji,l.x+l.w/2-w/2,H*.5-h/2,w,h)}else{g.fillStyle=TC[lp.k];g.font='bold 26px sans-serif';g.fillText(TN[lp.k],l.x+l.w/2,H*.5)}g.globalAlpha=1}
g.fillStyle='#333';g.fillRect(14,14,W*.25,8);g.fillStyle=P.hp>.3?'#6f8':'#f55';g.fillRect(14,14,W*.25*Math.max(0,P.hp),8);if(P.note){g.fillStyle='#fc4';g.font='14px sans-serif';g.textAlign='left';g.textBaseline='alphabetic';g.fillText(P.note,14,50)}}

// ---------- chuyển đổi map osu! -> mania 4K ----------
function toMania(M){const d=M.d,busy=[-1e9,-1e9,-1e9,-1e9],ho=[];for(const o of M.ho){let end=o.time;if(o.kind==='s'){const t=tpAt2(M,o.time);end=o.time+o.len/(d.SliderMultiplier*100*t.m)*t.bl*o.slides}else if(o.kind==='p')continue;const c0=Math.max(0,Math.min(3,Math.floor(o.x*4/512)));let c=-1;for(const dc of[0,1,-1,2,-2,3,-3]){const k=c0+dc;if(k>=0&&k<4&&busy[k]<o.time-20){c=k;break}}if(c<0)continue;const hold=o.kind==='s'&&end-o.time>=180;busy[c]=hold?end+10:o.time;ho.push(hold?{kind:'h',time:o.time,end,col:c}:{kind:'n',time:o.time,col:c})}if(!ho.length)throw Error('Không convert được map này');return Object.assign({},M,{mode:3,cv:1,ho,d:Object.assign({},M.d,{CS:4})})}
// ---------- cài đặt: FPS / độ trễ / con trỏ ----------
let LF=0,FT=16.7;
const alat=()=>ac?Math.round(((ac.baseLatency||0)+(ac.outputLatency||0))*1000):0;
function drawInfo(){if(!P||P.over)return;if(P.rp){g.save();g.fillStyle='#ff9cc8';g.font='bold 14px sans-serif';g.textAlign='center';g.textBaseline='alphabetic';g.fillText('▶ REPLAY'+(P.modTxt?' · '+P.modTxt:''),W/2,22);g.restore()}if(!SET.fps)return;const f=Math.round(1000/FT);g.save();g.globalAlpha=.85;g.font='12px monospace';g.textAlign='right';g.textBaseline='alphabetic';g.fillStyle=f>=55?'#8f8':f>=30?'#fd5':'#f66';g.fillText(f+' FPS · '+FT.toFixed(1)+'ms · nhạc '+alat()+'ms',W-10,H-8);g.restore()}
function settingsPanel(done){const o=document.createElement('div');o.id='mp';let run=1,last=performance.now(),ft=16.7,SKL=[],msg='';const sv=()=>{try{localStorage.setItem('osui_set',JSON.stringify(SET))}catch(e){}};
const tg=a=>'<button class="mb'+(SET[a]?' on':'')+'" data-a="'+a+'">'+(SET[a]?'Bật':'Tắt')+'</button>',refresh=()=>sAll('skins').then(l=>{SKL=l;dr()});
const gb=()=>SET.bgb==null?25:SET.bgb,pv=()=>{const e=o.querySelector('#bgp');if(e){const a=1-gb()/100;e.style.background='linear-gradient(rgba(0,0,0,'+a+'),rgba(0,0,0,'+a+')),linear-gradient(90deg,#ff9cc8,#6cf,#fd5)'}};
const dr=()=>{o.innerHTML='<div class="mpi"><div class="mph">⚙ Cài đặt</div><div class="sl"><div class="sr"><span>Ngôn ngữ</span><span><button class="mb'+(LANG==='vi'?' on':'')+'" data-l="vi">Tiếng Việt</button><button class="mb'+(LANG==='en'?' on':'')+'" data-l="en">English</button></span></div><div class="sr"><span>Hiện FPS</span>'+tg('fps')+'</div><div class="sr"><span>Con trỏ</span>'+tg('cur')+'</div><div class="sr"><span>Cỡ</span><span>'+[[4,'Nhỏ'],[6,'Vừa'],[9,'Lớn']].map(([r,n])=>'<button class="mb'+(SET.cr===r?' on':'')+'" data-r="'+r+'">'+n+'</button>').join('')+'</span></div><div class="sr"><span>FPS</span><b id="fp"></b></div><div class="sr"><span>Độ trễ nhạc</span><b id="al"></b></div>'+
'<div class="sr"><span>Play zone / Hit zone</span><button class="mb" data-z="1" style="width:auto;min-height:0;padding:8px 14px">Chỉnh vị trí</button></div>'+
'<div class="sr"><span>Độ sáng nền</span><b id="bv">'+gb()+'%</b></div><div class="sr"><input id="bgb" type="range" min="0" max="100" step="1" value="'+gb()+'" style="flex:1"></div><div id="bgp"></div>'+
'<div class="sr"><span>Storyboard</span>'+tg('sb')+'</div><div class="sr"><span>Video nền</span>'+tg('vid')+'</div><div class="sr"><small class="wn">⚠ Lưu ý: game có thể bị chậm đi, gây ảnh hưởng nặng đến hiệu năng. Bật storyboard/video xong nhớ tăng độ sáng nền để nhìn rõ hơn.</small></div>'+
'<div class="sr"><span>Skin</span><label class="mb" style="padding:6px 12px">+ .osk<input id="sf" type="file" multiple style="display:none"></label></div><div class="sr"><button class="mb'+(!SET.skin?' on':'')+'" data-s="" style="flex:1">Mặc định</button></div>'+SKL.map(s=>'<div class="sr"><button class="mb'+(SET.skin===s.id?' on':'')+'" data-s="'+s.id+'" style="flex:1">'+esc(s.name)+'</button><button class="mb" data-x="'+s.id+'">🗑</button></div>').join('')+(msg?'<div class="sr"><small>'+esc(msg)+'</small></div>':'')+
'</div><button id="mx">Xong</button></div>';
o.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{setLang(b.dataset.l);dr()});o.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{SET[b.dataset.a]=SET[b.dataset.a]?0:1;sv();dr()});o.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{SET.cr=+b.dataset.r;sv();dr()});
o.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>zoneEditor());
o.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{SET.skin=b.dataset.s;sv();loadSkin().then(dr)});
o.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{const id=b.dataset.x;sDel('skins',id).then(()=>{if(SET.skin===id){SET.skin='';sv();return loadSkin()}}).then(refresh)});
o.querySelector('#sf').onchange=async e=>{for(const f of e.target.files){try{const s=await importSkin(await f.arrayBuffer(),f.name);SET.skin=s.id;sv();await loadSkin();msg='Đã thêm skin: '+s.name}catch(x){msg=f.name+': '+x.message}}refresh()};
o.querySelector('#bgb').oninput=e=>{SET.bgb=+e.target.value;sv();o.querySelector('#bv').textContent=SET.bgb+'%';pv()};pv();
o.querySelector('#mx').onclick=()=>{run=0;o.remove();done()}};
const tick=()=>{if(!run)return;const n=performance.now();ft=ft*.9+(n-last)*.1;last=n;const a=o.querySelector('#fp'),b=o.querySelector('#al');if(a)a.textContent=Math.round(1000/ft)+' · '+ft.toFixed(1)+' ms';if(b)b.textContent=alat()+' ms';requestAnimationFrame(tick)};
refresh();dr();ui.appendChild(o);tick()}

// ---------- kho dữ liệu chung: skins / reps / repd ----------
const MEMS={};
async function sAll(st){try{const d=await idb();return await new Promise((res,rej)=>{const r=d.transaction(st).objectStore(st).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return MEMS[st]||[]}}
async function sGet(st,id){try{const d=await idb();return await new Promise((res,rej)=>{const r=d.transaction(st).objectStore(st).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return(MEMS[st]||[]).find(x=>x.id===id)}}
async function sPut(st,o){MEMS[st]=(MEMS[st]||[]).filter(x=>x.id!==o.id).concat(o);try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction(st,'readwrite');t.objectStore(st).put(o);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(e){}}
async function sDel(st,id){MEMS[st]=(MEMS[st]||[]).filter(x=>x.id!==id);try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction(st,'readwrite');t.objectStore(st).delete(id);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(e){}}
// ---------- skin (.osk / .osz) ----------
let SK=null,RP=null,REPMODS=null,CURFILE='';const tintC={};
const SKN=['hitcircle','hitcircleoverlay','approachcircle','cursor','sliderb0','hit0','hit50','hit100','hit300','mania-note1','mania-note2'].concat([...Array(10).keys()].map(i=>'default-'+i));
function tint(img,col,key){const k=key+col;if(tintC[k])return tintC[k];const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='multiply';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(img,0,0);return tintC[k]=c}
function drawCircleSk(o,now,a){const r=P.r*S,col=P.col[o.ci%P.col.length],X0=X(o.x),Y0=Y(o.y);g.globalAlpha=a;g.drawImage(tint(SK.hitcircle,col,'hc'),X0-r,Y0-r,2*r,2*r);if(SK.hitcircleoverlay)g.drawImage(SK.hitcircleoverlay,X0-r,Y0-r,2*r,2*r);
const ims=[...String(o.num)].map(c=>SK['default-'+c]);if(ims.every(Boolean)){const h=r*.75,ws=ims.map(i=>i.width*h/i.height),tw=ws.reduce((x,y)=>x+y,0);let x=X0-tw/2;ims.forEach((im,i)=>{g.drawImage(im,x,Y0-h/2,ws[i],h);x+=ws[i]})}else{g.fillStyle='#fff';g.font='bold '+r*.9+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(o.num,X0,Y0+1)}
const p=Math.min(1,Math.max(0,(now-(o.time-P.pre))/P.pre));if(p<1&&!P.hd){const R=r*(1+3*(1-p));if(SK.approachcircle)g.drawImage(tint(SK.approachcircle,col,'ap'),X0-R,Y0-R,2*R,2*R);else{g.beginPath();g.arc(X0,Y0,R,0,6.2832);g.lineWidth=Math.max(2,r*.07);g.strokeStyle=col;g.stroke()}}g.globalAlpha=1}
// ---------- kỷ lục & replay ----------
async function saveRec(p,acc,rk){const id='r'+Date.now(),r={id,mid:CURID,vf:CURFILE,mn:p.mn?1:0,cv:p.M.cv?1:0,score:p.score,acc,rk,combo:p.max,n:p.n,mods:p.mo.filter(k=>!p.mn||MD.find(m=>m[0]===k)[3]),date:Date.now()};
await sPut('reps',r);await sPut('repd',{id,f:p.rec.f,t:p.rec.t,e:p.rec.e});
const all=(await sAll('reps')).filter(x=>x.mid===r.mid&&x.vf===r.vf&&x.mn===r.mn).sort((a,b)=>b.score-a.score);for(const x of all.slice(20)){sDel('reps',x.id);sDel('repd',x.id)}}
function repStep(now){const f=P.rf;if(f.length){while(P.fi+4<f.length&&f[P.fi+4]<=now)P.fi+=4;const i=P.fi,j=Math.min(i+4,f.length-4),a=f[i],b=f[j],k=b>a?Math.max(0,Math.min(1,(now-a)/(b-a))):0;P.cx=X(f[i+1]+(f[j+1]-f[i+1])*k);P.cy=Y(f[i+2]+(f[j+2]-f[i+2])*k);P.rh=f[i+3]===1}
while(P.ti<P.rt.length&&P.rt[P.ti][0]<=now){const e=P.rt[P.ti++];tap(e[0],e[1],e[2])}}
function repM(now){const e=P.re;while(P.ei<e.length&&e[P.ei][0]<=now){const[t,c,d]=e[P.ei++];if(d){P.held[c]=1;P.lit[c]=performance.now();pressAt(c,t)}else{P.held[c]=0;relAt(c,t)}}}

// ---------- storyboard + video (bật trong Cài đặt) ----------
let EX=null;
const exKey=()=>''+(SET.sb?1:0)+(SET.vid?1:0),nk=s=>String(s).replace(/\\/g,'/').toLowerCase();
function freeEx(x){try{if(x.vid){x.vid.el.pause();x.vid.el.removeAttribute('src');x.vid.el.load();x.vid.el.remove();URL.revokeObjectURL(x.vid.url)}if(x.sb)for(const b of x.sb.ic.values())if(b&&b.close)try{b.close()}catch(e){}}catch(e){}}
function vidStop(){try{EX&&EX.vid&&EX.vid.el.pause()}catch(e){}}
const EASE=(()=>{const lin=t=>t,out=f=>t=>1-f(1-t),io=f=>t=>t<.5?f(2*t)/2:1-f(2-2*t)/2,
qi=t=>t*t,ci=t=>t*t*t,ti=t=>t*t*t*t,fi=t=>t*t*t*t*t,si=t=>1-Math.cos(t*Math.PI/2),ei=t=>t===0?0:Math.pow(2,10*(t-1)),ri=t=>1-Math.sqrt(1-t*t),
EC=2*Math.PI/.3,E2=.3/4,eo=(t,k)=>t===0||t===1?t:Math.pow(2,-10*t)*Math.sin((k*t-E2)*EC)+1,
bo=t=>{const c=1/2.75;if(t<c)return 7.5625*t*t;if(t<2*c){t-=1.5*c;return 7.5625*t*t+.75}if(t<2.5*c){t-=2.25*c;return 7.5625*t*t+.9375}t-=2.625*c;return 7.5625*t*t+.984375},B=1.70158,B2=B*1.525;
return[lin,out(qi),qi,qi,out(qi),io(qi),ci,out(ci),io(ci),ti,out(ti),io(ti),fi,out(fi),io(fi),si,out(si),io(si),ei,out(ei),io(ei),ri,out(ri),io(ri),
t=>t===0||t===1?t:-Math.pow(2,10*(t-1))*Math.sin((t-1-E2)*EC),t=>eo(t,1),t=>eo(t,.5),t=>eo(t,.25),
t=>{if(t===0||t===1)return t;t*=2;if(t<1){t-=1;return-.5*Math.pow(2,10*t)*Math.sin((t-E2*1.5)*EC/1.5)}t-=1;return .5*Math.pow(2,-10*t)*Math.sin((t-E2*1.5)*EC/1.5)+1},
t=>t*t*((B+1)*t-B),t=>{t-=1;return t*t*((B+1)*t+B)+1},t=>{t*=2;if(t<1)return .5*t*t*((B2+1)*t-B2);t-=2;return .5*(t*t*((B2+1)*t+B2)+2)},
t=>1-bo(1-t),bo,t=>t<.5?.5*(1-bo(1-t*2)):.5*bo(t*2-1)+.5]})();
const LY={background:0,fail:1,pass:2,foreground:3,overlay:4},OR={topleft:[0,0],centre:[.5,.5],centreleft:[0,.5],topright:[1,0],bottomcentre:[.5,1],topcentre:[.5,0],custom:[.5,.5],centreright:[1,.5],bottomleft:[0,1],bottomright:[1,1]},ORN=['topleft','centre','centreleft','topright','bottomcentre','topcentre','custom','centreright','bottomleft','bottomright'],CT={F:0,M:1,MX:2,MY:3,S:4,V:5,R:6,C:7};
function sbCmd(a){const c=a[0],t0=+a[2],t1=a[3]===''||a[3]==null?t0:+a[3];if(isNaN(t0)||isNaN(t1))return null;
if(c==='P')return{p:(a[4]||'').trim(),t0,t1};const k=CT[c];if(k==null)return null;const ea=Math.max(0,Math.min(34,+a[1]|0)),v=a.slice(4).map(x=>x===undefined||x===''?NaN:+x);let s,e;
if(c==='M'||c==='V'){s=[v[0],v[1]];e=[isNaN(v[2])?v[0]:v[2],isNaN(v[3])?v[1]:v[3]]}
else if(c==='C'){s=[v[0],v[1],v[2]];e=[isNaN(v[3])?v[0]:v[3],isNaN(v[4])?v[1]:v[4],isNaN(v[5])?v[2]:v[5]]}
else{s=[v[0]];e=[isNaN(v[1])?v[0]:v[1]]}
if(s.some(isNaN)||e.some(isNaN))return null;return{k,t0,t1,ea,s,e}}
function parseSB(lines,vars,endT){const sp=[];let cur=null,grp=null,ord=0;const vk=Object.keys(vars).sort((a,b)=>b.length-a.length);
for(const raw of lines){if(!raw)continue;let d=0;while(raw[d]===' '||raw[d]==='_')d++;let l=raw.slice(d).trim();if(!l||l.startsWith('//'))continue;
if(vk.length&&l.indexOf('$')>=0)for(const k of vk)l=l.split(k).join(vars[k]);const a=l.split(',');
if(!d){cur=null;grp=null;const ty=a[0];if(ty==='Sprite'||ty==='4'||ty==='Animation'||ty==='6'){const an=ty==='Animation'||ty==='6',lay=isNaN(+a[1])?LY[String(a[1]).trim().toLowerCase()]:+a[1],og=isNaN(+a[2])?OR[String(a[2]).trim().toLowerCase()]:OR[ORN[+a[2]]];
if(lay==null||!og||a.length<6)continue;cur={lay:Math.min(4,lay),og,path:a[3].replace(/"/g,'').trim(),x:+a[4],y:+a[5],an,fc:an?Math.max(1,+a[6]|0):1,fd:an?(+a[7]||1):0,lo:!an||String(a[8]||'').trim()!=='LoopOnce',top:[],loops:[],ord:ord++};sp.push(cur)}continue}
if(!cur)continue;const c=a[0];
if(d===1){if(c==='L'){grp={t0:+a[1]||0,n:Math.max(1,+a[2]|0),cs:[]};cur.loops.push(grp);continue}if(c==='T'){grp={trig:1};continue}grp=null;const q=sbCmd(a);if(q)cur.top.push(q);continue}
if(grp&&!grp.trig){const q=sbCmd(a);if(q)grp.cs.push(q)}}
const out=[];
for(const s of sp){const all=s.top.slice();let cnt=all.length;
for(const L of s.loops){const cs=L.cs;if(!cs.length)continue;let m0=1e12,m1=-1e12;for(const q of cs){m0=Math.min(m0,q.t0);m1=Math.max(m1,q.t1)}const du=m1-m0;let it=L.n;it=du>0?Math.min(it,Math.max(1,Math.ceil((endT-L.t0)/du)+1)):1;
for(let i=0;i<it&&cnt<30000;i++){const off=L.t0+du*i;for(const q of cs){all.push(Object.assign({},q,{t0:q.t0+off,t1:q.t1+off}));cnt++}}}
if(!all.length)continue;s.cm=[[],[],[],[],[],[],[],[]];s.fl={H:[],V:[],A:[]};let t0=1e12,t1=-1e12;
for(const q of all){if(q.p!==undefined){if(s.fl[q.p])s.fl[q.p].push(q)}else s.cm[q.k].push(q);t0=Math.min(t0,q.t0);t1=Math.max(t1,q.t1)}
for(const L of s.cm)L.sort((x,y)=>x.t0-y.t0);s.t0=t0;s.t1=Math.max(t1,t0+1);s.ci=[0,0,0,0,0,0,0,0];delete s.top;delete s.loops;out.push(s)}
return out}
async function buildSB(M,F,fm){const rk=p=>{p=nk(p);if(fm[p])return fm[p];const b=p.replace(/\.[^./]+$/,'');for(const e of['.png','.jpg','.jpeg'])if(fm[b+e])return fm[b+e];return''};
const lo=M.ho[M.ho.length-1],endT=lo?(lo.end||lo.time)+10000:600000;let sp=[];
const vv=ls=>{const v={};for(const r of ls){const t=r.trim();if(t[0]==='$'){const i=t.indexOf('=');if(i>0)v[t.slice(0,i).trim()]=t.slice(i+1).trim()}}return v};
for(const n of Object.keys(F).filter(n=>/\.osb$/i.test(n))){const t=new TextDecoder().decode(await F[n]()),ev=[],vl=[];let sec='';for(const raw of t.split(/\r?\n/)){const tl=raw.trim();if(tl[0]==='['&&tl.endsWith(']')){sec=tl;continue}if(sec==='[Events]')ev.push(raw);else if(sec==='[Variables]')vl.push(raw)}
sp=sp.concat(parseSB(ev,vv(vl),endT))}
const own=parseSB(M.evl||[],vv(M.vrl||[]),endT);for(const s of own)s.ord+=1e6;sp=sp.concat(own);
for(const s of sp){if(s.an){const m=s.path.match(/^(.*?)(\.[^./\\]+)?$/);s.keys=[];for(let i=0;i<s.fc;i++)s.keys.push(rk(m[1]+i+(m[2]||'')))}else s.keys=[rk(s.path)]}
sp=sp.filter(s=>s.keys.some(Boolean));if(!sp.length)return null;sp.sort((a,b)=>a.t0-b.t0||a.ord-b.ord);
const sb={sp,F,ic:new Map(),tc:new Map(),ni:0,pl:0,act:[],lt:-1e9},first=new Set();
for(const s of sp){if(s.t0>4000)break;for(const k of s.keys)if(k)first.add(k)}
await Promise.all([...first].slice(0,120).map(k=>sbLoad(sb,k)));return sb}
function sbLoad(sb,k){if(sb.ic.has(k))return;sb.ic.set(k,0);return sb.F[k]().then(ab=>createImageBitmap(imgBlob(ab))).then(bm=>{const ow=bm.width,oh=bm.height,m=Math.max(ow,oh);
if(m>1100){const q=1100/m,c=document.createElement('canvas');c.width=Math.max(1,Math.round(ow*q));c.height=Math.max(1,Math.round(oh*q));c.getContext('2d').drawImage(bm,0,0,c.width,c.height);bm.close();c.ow=ow;c.oh=oh;sb.ic.set(k,c)}else{bm.ow=ow;bm.oh=oh;sb.ic.set(k,bm)}}).catch(()=>sb.ic.set(k,-1))}
function sbStep(sb,now){if(now<sb.lt-1){sb.ni=0;sb.pl=0;sb.act=[];for(const s of sb.sp)s.ci.fill(0)}sb.lt=now;let add=0;
while(sb.ni<sb.sp.length&&sb.sp[sb.ni].t0<=now){sb.act.push(sb.sp[sb.ni++]);add=1}
while(sb.pl<sb.sp.length&&sb.sp[sb.pl].t0<=now+3000){const s=sb.sp[sb.pl++];if(s.t1>=now)for(const k of s.keys)if(k&&!sb.ic.has(k))sbLoad(sb,k)}
let j=0;for(let i=0;i<sb.act.length;i++){const s=sb.act[i];if(s.t1>=now)sb.act[j++]=s}sb.act.length=j;if(add)sb.act.sort((a,b)=>a.lay-b.lay||a.ord-b.ord)}
function sbn(s,k,t,j){const L=s.cm[k];let i=s.ci[k];if(i>=L.length||L[i].t0>t)i=0;while(i+1<L.length&&L[i+1].t0<=t)i++;s.ci[k]=i;const c=L[i];if(t<c.t0)return c.s[j];if(t>=c.t1)return c.e[j];const a=c.s[j];return a+(c.e[j]-a)*EASE[c.ea]((t-c.t0)/(c.t1-c.t0))}
const sbf=(l,t)=>{for(const q of l)if(t>=q.t0&&(t<=q.t1||q.t1<=q.t0))return true;return false},sbq=v=>Math.max(0,Math.min(255,Math.round(v/16)*16));
function sbTint(sb,im,key,r,gg,b){r=sbq(r);gg=sbq(gg);b=sbq(b);const k=key+'|'+r+','+gg+','+b;let c=sb.tc.get(k);if(c)return c;if(sb.tc.size>300)sb.tc.clear();c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.ow=im.ow||im.width;c.oh=im.oh||im.height;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='multiply';x.fillStyle='rgb('+r+','+gg+','+b+')';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(im,0,0);sb.tc.set(k,c);return c}
function sbPaint(sb,now,ov){const sc=H/480,x0=(W-640*sc)/2,bad=P&&P.hp<.5,k=sc*DPR;
for(const s of sb.act){const ly=s.lay;if(ov?ly!==4:(ly===4||(ly===1&&!bad)||(ly===2&&bad)))continue;
const al=s.cm[0].length?sbn(s,0,now,0):1;if(al<=.004)continue;
let fr=0;if(s.an){fr=Math.floor((now-s.t0)/s.fd);if(!(fr>0))fr=0;const n=s.keys.length;fr=s.lo?fr%n:Math.min(n-1,fr)}
const key=s.keys[fr];if(!key)continue;const im=sb.ic.get(key);if(!im||typeof im!=='object')continue;
let x=s.x,y=s.y;if(s.cm[1].length){x=sbn(s,1,now,0);y=sbn(s,1,now,1)}if(s.cm[2].length)x=sbn(s,2,now,0);if(s.cm[3].length)y=sbn(s,3,now,0);
let sx=1,sy=1;if(s.cm[5].length){sx=sbn(s,5,now,0);sy=sbn(s,5,now,1)}else if(s.cm[4].length)sx=sy=sbn(s,4,now,0);
if(!sx||!sy)continue;const rot=s.cm[6].length?sbn(s,6,now,0):0;if(sbf(s.fl.H,now))sx=-sx;if(sbf(s.fl.V,now))sy=-sy;
const iw=im.ow||im.width,ih=im.oh||im.height,tx=x0+x*sc,ty=y*sc,hd=Math.hypot(iw*sx,ih*sy)*sc;if(tx+hd<0||tx-hd>W||ty+hd<0||ty-hd>H)continue;
let src=im;if(s.cm[7].length){const r=sbn(s,7,now,0),gg=sbn(s,7,now,1),b=sbn(s,7,now,2);if(r<250||gg<250||b<250)src=sbTint(sb,im,key,r,gg,b)}
const cs=Math.cos(rot),sn=Math.sin(rot);g.setTransform(cs*sx*k,sn*sx*k,-sn*sy*k,cs*sy*k,tx*DPR,ty*DPR);g.globalAlpha=Math.min(1,al);g.globalCompositeOperation=sbf(s.fl.A,now)?'lighter':'source-over';g.drawImage(src,-s.og[0]*iw,-s.og[1]*ih,iw,ih)}
g.setTransform(DPR,0,0,DPR,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function sbDraw(now){const sb=EX.sb;sbStep(sb,now);sbPaint(sb,now,0)}
function sbOver(now){if(EX&&EX.sb&&SET.sb)sbPaint(EX.sb,now,1)}
async function loadVideo(M,F,fm){const k=fm[nk(M.video.name)]||fm[nk(M.video.name.split(/[\\/]/).pop())]||Object.keys(fm).find(q=>q.split('/').pop()===nk(M.video.name).split('/').pop());if(!k)return{note:'Không tìm thấy file video'};const fk=fm[k]||k,ext=fk.split('.').pop().toLowerCase(),mt={mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',ogv:'video/ogg',mov:'video/quicktime'}[ext],el=document.createElement('video');
if(!mt||!el.canPlayType(mt))return{note:'Trình duyệt không hỗ trợ video .'+ext};
const url=URL.createObjectURL(new Blob([await F[fk]()],{type:mt}));el.muted=true;el.defaultMuted=true;el.playsInline=true;el.setAttribute('playsinline','');el.setAttribute('webkit-playsinline','');el.preload='auto';el.style.cssText='position:fixed;left:0;top:0;width:2px;height:2px;opacity:.02;pointer-events:none;z-index:-1';document.body.appendChild(el);el.src=url;try{el.load()}catch(e){}
const ok=await new Promise(res=>{let d=0;const f=v=>{if(!d){d=1;res(v)}};el.onloadedmetadata=()=>{if(el.readyState>=1)f(1)};el.onloadeddata=()=>f(1);el.oncanplay=()=>f(1);el.onerror=()=>f(0);setTimeout(()=>f(el.readyState>=1?1:0),8000)});
if(!ok){el.remove();URL.revokeObjectURL(url);return{note:'Không phát được video (codec không được hỗ trợ)'}}
try{await el.play();el.pause();el.currentTime=0}catch(e){}
return{vid:{el,url,t:M.video.t}}}
async function loadExtras(M,F){const ex={note:''};if(!SET.sb&&!SET.vid)return ex;const fm={};for(const k of Object.keys(F))fm[nk(k)]=k;
if(SET.sb){try{ex.sb=await buildSB(M,F,fm)}catch(e){ex.note='Lỗi storyboard: '+e.message}}
if(SET.vid&&M.video){try{const r=await loadVideo(M,F,fm);if(r.vid)ex.vid=r.vid;else ex.note=(ex.note?ex.note+' · ':'')+r.note}catch(e){ex.note=(ex.note?ex.note+' · ':'')+'Lỗi video: '+e.message}}else if(SET.vid&&!SET.sb)ex.note='Map này không có video';
if(SET.sb&&!ex.sb&&!ex.note)ex.note='Map này không có storyboard';
return ex}
function vidDraw(now){const V=EX.vid,v=V.el,tv=(now-V.t)/1000;if(tv<0){if(!v.paused)v.pause();return}const du=v.duration;if(du&&tv>=du){if(!v.paused)v.pause();return}
if(v.playbackRate!==P.sp)v.playbackRate=P.sp;if(!v.seeking&&Math.abs(v.currentTime-tv)>.3){try{v.currentTime=tv}catch(e){}}
if(v.paused&&!P.paused)v.play().catch(()=>{});
if(v.readyState>=2&&v.videoWidth){const k=Math.max(W/v.videoWidth,H/v.videoHeight),w=v.videoWidth*k,h=v.videoHeight*k;g.drawImage(v,(W-w)/2,(H-h)/2,w,h)}}
// nền: ảnh map -> video -> storyboard -> phủ đen theo độ sáng
function drawBack(now){const br=Math.max(0,Math.min(100,SET.bgb==null?25:SET.bgb))/100;
if(P.bg){const k=Math.max(W/P.bg.width,H/P.bg.height);g.drawImage(P.bg,(W-P.bg.width*k)/2,(H-P.bg.height*k)/2,P.bg.width*k,P.bg.height*k)}
if(EX){if(EX.vid&&SET.vid)vidDraw(now);if(EX.sb&&SET.sb)sbDraw(now)}
if(br<1){g.fillStyle='rgba(0,0,0,'+(1-br)+')';g.fillRect(0,0,W,H)}}
// ---------- skin: skin.ini + mania ----------
const SKM=['mania-note1','mania-note2','mania-notes','mania-note1h','mania-note2h','mania-notesh','mania-note1l','mania-note2l','mania-notesl','mania-note1t','mania-note2t','mania-notest','mania-key1','mania-key1d','mania-key2','mania-key2d','mania-keys','mania-keysd','mania-stage-hint','mania-stage-left','mania-stage-right','mania-stage-light','mania-hit0','mania-hit50','mania-hit100','mania-hit200','mania-hit300','mania-hit300g'];
const bnm=v=>v?String(v).split(/[\\/]/).pop().toLowerCase().replace(/\.(png|jpg|jpeg)$/,''):'';
function parseIni(t){const o={m:{}};let sec='',ms=[],cur=null;for(let l of t.split(/\r?\n/)){l=l.trim();if(!l||l.startsWith('//'))continue;if(l[0]==='['){sec=l.toLowerCase();cur=null;if(sec==='[mania]'){cur={};ms.push(cur)}continue}if(sec!=='[mania]'||!cur)continue;const i=l.indexOf(':');if(i<0)continue;cur[l.slice(0,i).trim().toLowerCase()]=l.slice(i+1).split('//')[0].trim()}o.m=ms.find(x=>+x.keys===4)||{};return o}
async function importSkin(buf,fn){const F=await unzip(buf),want=new Set(SKN.concat(SKM)),imgs={},x2={},pick={};let ini='';
for(const n of Object.keys(F))if(n.split('/').pop().toLowerCase()==='skin.ini'){ini=new TextDecoder().decode(await F[n]()).replace(/^\uFEFF/,'');break}
const I=parseIni(ini);for(const k in I.m)if(/^(noteimage|keyimage|stage|hit(0|50|100|200|300|300g)$)/.test(k)){const b=bnm(I.m[k]);if(b)want.add(b)}
for(const n of Object.keys(F)){const b=n.split('/').pop().toLowerCase(),m=b.match(/^(.+?)(@2x)?\.(png|jpg|jpeg)$/);if(!m)continue;const s=m[1],id=want.has(s)?s:(/-0$/.test(s)&&want.has(s.slice(0,-2))?s.slice(0,-2):null);if(!id)continue;const p=(id===s?2:0)+(m[2]?1:0);if(pick[id]&&pick[id].p>=p)continue;pick[id]={p,n,x:!!m[2],ty:m[3]}}
for(const id in pick){const q=pick[id];imgs[id]=new Blob([await F[q.n]()],{type:q.ty==='png'?'image/png':'image/jpeg'});if(q.x)x2[id]=1}
if(!Object.keys(imgs).length){for(const n of Object.keys(F))if(/\.(osk|zip|osz)$/i.test(n)){try{return await importSkin(await F[n](),n.split('/').pop())}catch(e){}}throw Error('Không thấy hình skin trong file (.osk/.osz phải chứa ảnh skin như hitcircle, mania-note...)')}
const cols=[];ini.split(/\r?\n/).forEach(l=>{const q=l.match(/^\s*Combo(\d)\s*:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);if(q)cols[+q[1]-1]='rgb('+q[2]+','+q[3]+','+q[4]+')'});
const nm=ini.match(/^\s*Name\s*:\s*(.+)$/mi),s={id:'sk'+Date.now(),name:(nm?nm[1].trim():fn.replace(/\.[^.]+$/,'')),imgs,x2,ini:I.m,cols:cols.filter(Boolean),added:Date.now()};await sPut('skins',s);return s}
function avgCol(im){try{const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.drawImage(im,0,0,1,1);const d=x.getImageData(0,0,1,1).data;return[d[0],d[1],d[2]]}catch(e){return null}}
function buildMn(o){const I=o.ini||{},pk=(k,...d)=>{const c=bnm(I[k]);if(c&&o[c])return o[c];for(const x of d)if(o[x])return o[x];return null},cs=[0,1,2,3],dn=c=>c===0||c===3?'1':'2',note=cs.map(c=>pk('noteimage'+c,'mania-note'+dn(c)));
const _bd=cs.map(c=>{const h=pk('noteimage'+c+'h','mania-note'+dn(c)+'h')||note[c];return h?avgCol(h):null});
return{bodyCol:_bd,note,noteH:cs.map(c=>pk('noteimage'+c+'h','mania-note'+dn(c)+'h')||note[c]),noteL:cs.map(c=>pk('noteimage'+c+'l','mania-note'+dn(c)+'l')),noteT:cs.map(c=>pk('noteimage'+c+'t','mania-note'+dn(c)+'t')),
key:cs.map(c=>pk('keyimage'+c,'mania-key'+dn(c))),keyD:cs.map(c=>pk('keyimage'+c+'d','mania-key'+dn(c)+'d')),hint:pk('stagehint','mania-stage-hint'),stl:pk('stageleft','mania-stage-left'),str:pk('stageright','mania-stage-right'),light:pk('stagelight','mania-stage-light'),
hit:['0','50','100','200','300','300g'].map(h=>pk('hit'+h,'mania-hit'+h)),bs:[0,1,2].includes(+I.notebodystyle)?+I.notebodystyle:-1,hintA:hintAnchor(pk('stagehint','mania-stage-hint')),hp:+I.hitposition>0?Math.max(.6,Math.min(.92,+I.hitposition/480)):0}}
async function loadSkin(){SK=null;for(const k in tintC)delete tintC[k];if(!SET.skin)return;const s=await sGet('skins',SET.skin);if(!s)return;const o={cols:s.cols||[],ini:s.ini||{},x2:s.x2||{}};for(const k in s.imgs){try{const b=await createImageBitmap(s.imgs[k]);b.k2=o.x2[k]?.5:1;o[k]=b}catch(e){}}o.mn=buildMn(o);SK=o}

// ---------- bổ sung: HP/độ khó, spinner, skin, ảnh ----------
const HPR=(x,a,b,c)=>x>5?b+(c-b)*(x-5)/5:x<5?b-(b-a)*(5-x)/5:b;
function hpAdd(x){P.hp=Math.min(1,P.hp+x)}
function hpPlan(mn){const HP=P.d.HP,R=HPR(HP,.9,1,1.4),u=.012;P.hu=u;P.hm=(mn?.075:.06)*R;P.G=mn?[-.075*R,-.02*R,0,.006,.012,.014]:null;P.brk=(P.M.brk||[]).slice();P.bp=[];P.lu=null;P.lt=null;
const ev=P.objs.map(o=>o.end||o.time).sort((a,b)=>a-b);if(!ev.length){P.hr=0;P.h0=0;P.h1=0;return}
const h0=Math.min(...P.objs.map(o=>o.time)),g1=mn?.014:u,low=HPR(HP,.975,.8,.3),dm=(a,b)=>{let d=b-a;for(const k of P.brk){const s=Math.max(a,k[0]),e=Math.min(b,k[1]);if(e>s)d-=e-s}return d};
const sim=r=>{let h=1,pt=h0,mi=1;for(const t of ev){h-=r*dm(pt,t);pt=t;if(h<mi)mi=h;h=Math.min(1,h+g1)}return mi};
let lo=0,hi=3e-4;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(sim(m)>=low)lo=m;else hi=m}P.hr=lo;P.h0=h0;P.h1=ev[ev.length-1]}
function hpDrain(now){const lu=P.lu;P.lu=now;if(lu==null||P.over)return;const dt=now-lu;if(dt<=0||dt>250||now<P.h0||now>P.h1)return;for(const b of P.brk)if(now>=b[0]&&now<=b[1])return;P.hp-=P.hr*dt}
function spinStep(o,now,dt,h,px,py){const pr=o.rot;
if(P.so){const inc=dt/1000*7.5;o.rot+=inc;o.ang=(o.ang||0)+inc*6.2832}
else if(h){const dx=px-256,dy=py-192;if(dx*dx+dy*dy>36){const a=Math.atan2(dy,dx);if(o.la!=null){let d=a-o.la;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;if(Math.abs(d)<2.8){const inc=Math.min(Math.abs(d)/6.2832,dt/1000*8);o.rot+=inc;o.ang=(o.ang||0)+Math.sign(d)*inc*6.2832}}o.la=a}else o.la=null}else o.la=null;
for(let n=Math.floor(pr)+1;n<=Math.floor(o.rot);n++){if(n<=o.req){o.pts+=100}else{o.pts+=1000;o.bn++;P.bp.push({t:now,v:1000,dx:(Math.random()-.5)*140,dy:Math.random()*40})}hpAdd(.003);if(n>o.req||n%2===0)click()}}
function drawSpin(o,now,a){const cx=X(256),cy=Y(192),R=Math.min(W,H)*.38,pr=Math.min(1,o.rot/o.req),full=pr>=1;g.save();g.globalAlpha=Math.min(1,a);g.lineWidth=4;g.strokeStyle=full?'#ffd84d':'#fff';g.beginPath();g.arc(cx,cy,R,0,6.2832);g.stroke();
g.fillStyle=full?'rgba(255,216,77,.3)':'rgba(255,102,170,.35)';g.beginPath();g.arc(cx,cy,R*pr,0,6.2832);g.fill();
const an=o.ang||0;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(an)*R,cy+Math.sin(an)*R);g.stroke();
const bw=Math.min(W*.6,R*1.6),bx=cx-bw/2,by=cy+R+18;g.fillStyle='rgba(255,255,255,.2)';g.fillRect(bx,by,bw,8);g.fillStyle=full?'#ffd84d':'#6f8';g.fillRect(bx,by,bw*pr,8);
g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='bold 18px sans-serif';g.fillText(Math.min(Math.floor(o.rot),o.req)+' / '+o.req+(o.bn?'  ·  BONUS x'+o.bn:''),cx,by+30);
if(o.pts){g.fillStyle='#ffd84d';g.font='bold 16px sans-serif';g.fillText(String(o.pts),cx,by+52)}
if(now>=o.time&&o.rot<.2){g.fillStyle='rgba(255,255,255,.85)';g.font='bold 30px sans-serif';g.fillText('SPIN!',cx,cy-R-14)}g.restore()}
function hintAnchor(im){if(!im)return null;try{const w=Math.min(96,im.width),h=Math.max(1,Math.min(512,Math.round(im.height*w/im.width))),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0,w,h);const d=x.getImageData(0,0,w,h).data,rs=new Float64Array(h);let tot=0,cen=0,pk=0,pi=0;
for(let y=0;y<h;y++){let r=0;for(let i=0;i<w;i++){const o=(y*w+i)*4,lum=(d[o]+d[o+1]+d[o+2])/765;r+=d[o+3]/255*(.2+lum)}rs[y]=r;tot+=r;cen+=r*y;if(r>pk){pk=r;pi=y}}
if(!tot)return .5;let nz=0;for(let y=0;y<h;y++)if(rs[y]>pk*.02)nz++;const mean=tot/Math.max(1,nz);
return pk>mean*2.2?(pi+.5)/h:(cen/tot+.5)/h}catch(e){return null}}
function imgBlob(ab){const u=new Uint8Array(ab,0,Math.min(12,ab.byteLength));let t='';if(u[0]===0x89&&u[1]===0x50)t='image/png';else if(u[0]===0xFF&&u[1]===0xD8)t='image/jpeg';else if(u[0]===0x47&&u[1]===0x49)t='image/gif';else if(u[0]===0x52&&u[1]===0x49&&u[8]===0x57)t='image/webp';else if(u[0]===0x42&&u[1]===0x4D)t='image/bmp';return new Blob([ab],t?{type:t}:{})}

// ---------- vùng chơi: play zone + hit zone (kéo để di chuyển, kéo góc để đổi cỡ) ----------
function zDef(){const HA=H-BZ,hw=W*.22,aw=DIRECT||AUTOM?W:W-hw,S0=Math.min(aw*.96/512,HA*.95/384),w=512*S0,h=384*S0;
return{hz:{x:0,y:0,w:hw,h:H},pz:{x:(DIRECT||AUTOM?0:hw)+(aw-w)/2,y:(HA-h)/2+4,w,h}}}
function zr(k){let c;try{c=SET.zn&&SET.zn[k]}catch(e){}if(c&&c.length===4&&W&&H){let r={x:c[0]*W,y:c[1]*H,w:c[2]*W,h:c[3]*H};if(k==='pz'){r.h=r.w*.75;r.y=Math.min(r.y,H-BZ-r.h);if(r.y<0)r.y=0}return r}return zDef()[k]}
function zoneEditor(){const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.78);touch-action:none;user-select:none;-webkit-user-select:none;font-family:sans-serif';
const R={hz:{...zr('hz')},pz:{...zr('pz')}},clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),maxY={hz:H,pz:H-BZ},bx={};
const keys=DIRECT||AUTOM?['pz']:['hz','pz'];
const place=()=>{for(const k of keys){const r=R[k],b=bx[k];b.style.left=r.x+'px';b.style.top=r.y+'px';b.style.width=r.w+'px';b.style.height=r.h+'px'}
const c=bx.pz.querySelector('i'),cs=(54.4-4.48*4)*1.3*2*(R.pz.w/512);c.style.width=c.style.height=cs+'px'};
for(const k of keys){const col=k==='hz'?'#ff66aa':'#66ccff',b=document.createElement('div');b.style.cssText='position:absolute;box-sizing:border-box;border:2px solid '+col+';background:'+col+'30;display:flex;align-items:center;justify-content:center;color:#fff;font:bold 15px sans-serif;text-align:center;touch-action:none';
b.appendChild(document.createTextNode(k==='hz'?'HIT ZONE':'PLAY ZONE'));
if(k==='pz'){const c=document.createElement('i');c.style.cssText='position:absolute;border:3px solid #fff;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:.6;box-sizing:border-box';b.appendChild(c)}
const hd=document.createElement('div');hd.style.cssText='position:absolute;right:0;bottom:0;width:48px;height:48px;background:'+col+';border-radius:14px 0 0 0;touch-action:none;opacity:.9';b.appendChild(hd);
let m=null;b.onpointerdown=e=>{if(e.target===hd)return;m={t:0,sx:e.clientX,sy:e.clientY,r:{...R[k]}};b.setPointerCapture(e.pointerId);e.preventDefault()};
hd.onpointerdown=e=>{m={t:1,sx:e.clientX,sy:e.clientY,r:{...R[k]}};hd.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation()};
const mv=e=>{if(!m)return;const dx=e.clientX-m.sx,dy=e.clientY-m.sy,r=R[k];
if(!m.t){r.x=clamp(m.r.x+dx,0,W-r.w);r.y=clamp(m.r.y+dy,0,maxY[k]-r.h)}
else if(k==='pz'){const w=clamp(Math.max(m.r.w+dx,(m.r.h+dy)/.75),140,Math.min(W-r.x,(maxY.pz-r.y)/.75));r.w=w;r.h=w*.75}
else{r.w=clamp(m.r.w+dx,70,W-r.x);r.h=clamp(m.r.h+dy,70,H-r.y)}place()};
const up=()=>{m=null};b.onpointermove=mv;hd.onpointermove=mv;b.onpointerup=hd.onpointerup=up;b.onpointercancel=hd.onpointercancel=up;bx[k]=b;o.appendChild(b)}
const bar=document.createElement('div');bar.style.cssText='position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);display:flex;gap:8px;align-items:center;z-index:2;flex-wrap:wrap;justify-content:center;width:max-content;max-width:96vw';
const btn=(t,f)=>{const e=document.createElement('button');e.textContent=t;e.style.cssText='background:#2a2142;color:#fff;border:2px solid #fff3;border-radius:12px;padding:9px 14px;font-size:15px;min-width:44px';e.onpointerdown=x=>x.stopPropagation();e.onclick=f;bar.appendChild(e);return e};
const zoom=f=>{const r=R.pz,cx=r.x+r.w/2,cy=r.y+r.h/2,w=clamp(r.w*f,140,W),h=w*.75;r.w=w;r.h=h;r.x=clamp(cx-w/2,0,W-w);r.y=clamp(cy-h/2,0,maxY.pz-h);place()};
btn('Play −',()=>zoom(.93));btn('Play +',()=>zoom(1.07));
btn('Mặc định',()=>{const d=zDef();R.hz={...d.hz};R.pz={...d.pz};delete SET.zn;place()});
btn('Xong',()=>{SET.zn={hz:[R.hz.x/W,R.hz.y/H,R.hz.w/W,R.hz.h/H],pz:[R.pz.x/W,R.pz.y/H,R.pz.w/W,R.pz.h/H]};try{localStorage.setItem('osui_set',JSON.stringify(SET))}catch(e){}rs();o.remove()});
const tip=document.createElement('div');tip.style.cssText='position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);transform:translateX(-50%);color:#fffc;font-size:13px;text-align:center;width:92vw;pointer-events:none';tip.textContent='Kéo vùng để di chuyển · kéo góc vuông dưới-phải để phóng to / thu nhỏ · vòng tròn trắng là cỡ nốt thật';
o.appendChild(bar);o.appendChild(tip);document.body.appendChild(o);place()}

rs();

// ---------- nghe thử nhạc khi chọn beatmap ----------
const PV={tok:0,aid:null,src:null,gain:null},PVH=new Map(),PVC=new Map();
function prevKill(){const sr=PV.src,gn=PV.gain;PV.src=null;PV.aid=null;if(!sr||!ac)return;try{const t=ac.currentTime;gn.gain.cancelScheduledValues(t);gn.gain.setValueAtTime(gn.gain.value,t);gn.gain.linearRampToValueAtTime(0,t+.2);sr.stop(t+.22)}catch(e){}}
function prevStop(){PV.tok++;prevKill()}
async function prevPlay(m,v){if(!ac||!m||!v)return;const tok=++PV.tok,hk=m.id+'|'+v.file;
await new Promise(r=>setTimeout(r,350));if(tok!==PV.tok)return;
try{let ent=PVH.get(hk);if(!ent){const F=await unzip(m.buf),h=new TextDecoder().decode(await F[v.file]()),a=(h.match(/AudioFilename:\s*(.+)/)||[])[1],pt=+((h.match(/PreviewTime:\s*(-?\d+)/)||[])[1]||-1),k=a&&Object.keys(F).find(q=>q.toLowerCase()===a.trim().toLowerCase());ent={k,pt};PVH.set(hk,ent)}
if(tok!==PV.tok||!ent.k)return;const aid=m.id+'|'+ent.k;if(PV.aid===aid&&PV.src)return;
let b=PVC.get(aid);if(!b){const F=await unzip(m.buf),ab=await F[ent.k]();if(tok!==PV.tok)return;b=await new Promise((r,j)=>{const p=ac.decodeAudioData(ab,r,j);if(p&&p.catch)p.catch(j)});PVC.set(aid,b);if(PVC.size>3)PVC.delete(PVC.keys().next().value)}
if(tok!==PV.tok)return;prevKill();if(ac.state!=='running')ac.resume();
let off=ent.pt>0?ent.pt/1000:b.duration*.4;if(off>=b.duration-2)off=0;
const sr=ac.createBufferSource(),gn=ac.createGain();sr.buffer=b;sr.loop=true;sr.loopStart=off;sr.loopEnd=b.duration;gn.gain.setValueAtTime(0,ac.currentTime);gn.gain.linearRampToValueAtTime(.7,ac.currentTime+.8);sr.connect(gn);gn.connect(ac.destination);sr.start(0,off);PV.src=sr;PV.gain=gn;PV.aid=aid}catch(e){}}
