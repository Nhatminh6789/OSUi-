const MPL=(()=>{
const MAXP=8,CD=8000,PUSH=700,STALE=90000,
MODL=[['EZ','Easy'],['HT','Half Time'],['HR','Hard Rock'],['HD','Hidden'],['DT','Double Time'],['FL','Flashlight'],['NF','No Fail'],['SD','Sudden Death'],['PF','Perfect'],['SO','Spun Out']],ALLOW=MODL.map(x=>x[0]),
CONF={EZ:['HR'],HR:['EZ'],HT:['DT'],DT:['HT'],NF:['SD','PF'],SD:['NF','PF'],PF:['NF','SD']},
WINL=[['score','Score'],['acc','Accuracy'],['combo','Combo']];
const okMods=a=>{const r=[];for(const k of a||[])if(ALLOW.includes(k)&&!r.includes(k)&&!r.some(x=>(CONF[k]||[]).includes(x)))r.push(k);return r};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=h=>typeof TR==='function'?TR(h):h,Q=s=>document.querySelector(s);

function md5(u8){const K=new Int32Array(64),S=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];for(let i=0;i<64;i++)K[i]=Math.floor(Math.abs(Math.sin(i+1))*4294967296)|0;
const n=u8.length,b=new Uint8Array((((n+8)>>>6)+1)*64);b.set(u8);b[n]=128;const dv=new DataView(b.buffer);dv.setUint32(b.length-8,(n<<3)>>>0,true);dv.setUint32(b.length-4,Math.floor(n/536870912),true);
let a0=0x67452301,b0=0xefcdab89|0,c0=0x98badcfe|0,d0=0x10325476;
for(let o=0;o<b.length;o+=64){const M=new Int32Array(16);for(let i=0;i<16;i++)M[i]=dv.getInt32(o+i*4,true);let A=a0,B=b0,C=c0,D=d0;
for(let i=0;i<64;i++){let F,g;if(i<16){F=(B&C)|(~B&D);g=i}else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)&15}else if(i<48){F=B^C^D;g=(3*i+5)&15}else{F=C^(B|~D);g=(7*i)&15}
F=(F+A+K[i]+M[g])|0;A=D;D=C;C=B;const s=S[(i>>4)*4+(i&3)];B=(B+((F<<s)|(F>>>(32-s))))|0}
a0=(a0+A)|0;b0=(b0+B)|0;c0=(c0+C)|0;d0=(d0+D)|0}
const r=new DataView(new ArrayBuffer(16));r.setInt32(0,a0,true);r.setInt32(4,b0,true);r.setInt32(8,c0,true);r.setInt32(12,d0,true);return[...new Uint8Array(r.buffer)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function sha(t){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}

const MH=(()=>{try{return JSON.parse(localStorage.getItem('osui_mh')||'{}')}catch(e){return{}}})();
async function hashOf(m,v){const k=m.id+'|'+v.file;if(MH[k])return MH[k];const F=await unzip(await bufOf(m)),h=md5(new Uint8Array(await F[v.file]()));MH[k]=h;try{localStorage.setItem('osui_mh',JSON.stringify(MH))}catch(e){}return h}
async function findLocal(info){if(!info)return null;for(const m of await dbAll()){if(m.title!==info.title||m.artist!==info.artist)continue;for(let i=0;i<m.vers.length;i++){if(m.vers[i].ver!==info.ver)continue;try{if(await hashOf(m,m.vers[i])===info.hash)return{m,i}}catch(e){}}}return null}

// ---------- Firestore backend ----------
const FSB=(()=>{let X=null;const lib=async()=>X||(X=await ON.fb()),fix=o=>{const r={};for(const k in o){const v=o[k];r[k]=v&&typeof v.toMillis==='function'?v.toMillis():v}return r},
cv=o=>{const r={};for(const k in o)r[k]=o[k]==='$ts'?X.fs.serverTimestamp():o[k];return r},
live=(mk,cb)=>{let un=()=>{},dead=0;lib().then(()=>{if(!dead)un=mk(X.fs)}).catch(e=>cb(null,e));return()=>{dead=1;un()}};
return{
rooms:cb=>live(fs=>fs.onSnapshot(fs.query(fs.collection(X.D,'rooms'),fs.orderBy('created','desc'),fs.limit(40)),s=>cb(s.docs.map(d=>({id:d.id,...fix(d.data())}))),e=>cb(null,e)),cb),
room:(rid,cb)=>live(fs=>fs.onSnapshot(fs.doc(X.D,'rooms',rid),s=>cb(s.exists()?fix(s.data()):null),()=>{}),()=>{}),
players:(rid,cb)=>live(fs=>fs.onSnapshot(fs.collection(X.D,'rooms',rid,'players'),s=>cb(s.docs.map(d=>({uid:d.id,...fix(d.data())})))),()=>{}),
queue:(rid,cb)=>live(fs=>fs.onSnapshot(fs.collection(X.D,'rooms',rid,'queue'),s=>cb(s.docs.map(d=>({id:d.id,...fix(d.data())})))),()=>{}),
chat:(rid,cb)=>live(fs=>fs.onSnapshot(fs.query(fs.collection(X.D,'rooms',rid,'chat'),fs.orderBy('t','desc'),fs.limit(60)),s=>cb(s.docs.map(d=>({id:d.id,...fix(d.data())})).reverse())),()=>{}),
async create(room,pw,me,hf){await lib();const fs=X.fs,ref=fs.doc(fs.collection(X.D,'rooms')),rid=ref.id,ph=pw?await hf(rid+':'+pw):null;
await fs.setDoc(ref,cv({...room,created:'$ts',upd:'$ts'}));if(ph)await fs.setDoc(fs.doc(X.D,'rooms',rid,'secret','pw'),{h:ph});
await fs.setDoc(fs.doc(X.D,'rooms',rid,'players',me.uid),cv({name:me.name,ready:true,has:true,score:0,hp:1,combo:0,prog:0,acc:1,fl:0,team:'',mods:[],upd:'$ts',fin:null,joined:'$ts',...(ph?{ph}:{})}));return rid},
async join(rid,me,ph,hf,pw){await lib();const fs=X.fs;await fs.setDoc(fs.doc(X.D,'rooms',rid,'players',me.uid),cv({name:me.name,ready:false,has:false,score:0,hp:1,combo:0,prog:0,acc:1,fl:0,team:'',mods:[],upd:'$ts',fin:null,joined:'$ts',...(ph?{ph}:{})}))},
async upRoom(rid,p){await lib();return X.fs.updateDoc(X.fs.doc(X.D,'rooms',rid),cv({...p,upd:'$ts'}))},
async upMe(rid,uid,p){await lib();return X.fs.updateDoc(X.fs.doc(X.D,'rooms',rid,'players',uid),cv(p))},
async qadd(rid,it){await lib();const fs=X.fs;return fs.addDoc(fs.collection(X.D,'rooms',rid,'queue'),cv({...it,t:'$ts'}))},
async qdel(rid,id){await lib();const fs=X.fs;return fs.deleteDoc(fs.doc(X.D,'rooms',rid,'queue',id))},
async say(rid,me,text){await lib();return X.fs.addDoc(X.fs.collection(X.D,'rooms',rid,'chat'),cv({uid:me.uid,name:me.name,text,t:'$ts'}))},
async leave(rid,uid){await lib();return X.fs.deleteDoc(X.fs.doc(X.D,'rooms',rid,'players',uid))},
async close(rid,uids,qids){await lib();const fs=X.fs;for(const q of qids||[]){try{await fs.deleteDoc(fs.doc(X.D,'rooms',rid,'queue',q))}catch(e){}}for(const u of uids){try{await fs.deleteDoc(fs.doc(X.D,'rooms',rid,'players',u))}catch(e){}}try{await fs.deleteDoc(fs.doc(X.D,'rooms',rid,'secret','pw'))}catch(e){}return fs.deleteDoc(fs.doc(X.D,'rooms',rid))}}})();
const B=()=>window.__MPB||FSB;

// ---------- trạng thái ----------
let ME=null,RID=null,R=null,QUE=[],PLY={},CHAT=[],LOC=null,OFFS=null,ACT=false,ended=false,started=null,startLocal=0,bak=null,view='',RL=[],unsubs=[],err='',lastPush='',lastPushT=0,lastSay=0,pickList=null,pwFor=null,timers=[];
const isHost=()=>!!(R&&ME&&R.hostUid===ME.uid),offs=()=>OFFS==null?0:OFFS,mx=()=>{let e=Q('#mpx');if(!e){e=document.createElement('div');e.id='mpx';document.body.appendChild(e);e.onclick=click;e.onkeydown=e2=>{if(e2.key==='Enter'&&e2.target.id==='mxmsg')send();if(e2.key==='Enter'&&e2.target.id==='pwi')Q('[data-a="pwgo"]').click()}}return e};
const setH=(el,h)=>{if(el)el.innerHTML=tr(h)};
const isF=p=>!!(p.fin?p.fin.fail:p.fl),win=()=>(R&&R.win)||'score',val=(p,w)=>{const f=p.fin;return w==='acc'?(f?f.acc:p.acc||0):w==='combo'?(f?f.max:p.combo||0):(f?f.score:p.score||0)},
rankL=(l,w)=>l.slice().sort((a,b)=>(isF(a)-isF(b))||(val(b,w)-val(a,w))||((a.joined||0)-(b.joined||0))),
fmtV=(v,w)=>w==='acc'?(v*100).toFixed(2)+'%':w==='combo'?v+'x':String(v).padStart(7,'0'),
myMods=p=>{const b=okMods(R&&R.mods);if(!R||!R.free||!p)return b;const r=b.slice();for(const k of okMods(p.mods))if(!r.includes(k)&&!r.some(x=>(CONF[k]||[]).includes(x)))r.push(k);return r},
teamOf=p=>p.team==='B'?'B':'A';
const accOf=p=>{const n=p.n,t=n.reduce((a,b)=>a+b,0);return!t?1:p.mn?p.ws/(305*t):(300*n[0]+100*n[1]+50*n[2])/(300*t)};
const mm=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');

function open(){stopSubs();ME=ON.user();const x=mx();x.style.display='flex';
if(!ON.ready()){view='msg';return draw('<div class="mxm">Multi cần Firebase (chưa cấu hình trong firebase-config.js).</div>')}
if(!ME||!ME.verified||!ME.name){view='msg';return draw('<div class="mxm">Multi cần tài khoản đã đăng nhập và xác minh email.<br><button class="mxbt" data-a="login">Đăng nhập</button> <button class="mxbt s" data-a="close">Quay lại</button></div>')}
view='list';err='';RL=[];draw();unsubs.push(B().rooms((l,e)=>{if(e){err='Không tải được danh sách phòng';}else{RL=(l||[]).filter(r=>r&&r.name&&Date.now()-(r.upd||r.created||Date.now())<10*60e3)}if(view==='list')drawList()}))}
function draw(h){const x=mx();if(h!==undefined)return setH(x,'<div class="mxw">'+h+'</div>');if(view==='list')return setH(x,'<div class="mxw"><div class="mxh"><button class="mxbt s" data-a="close">‹ Back</button><b class="mxt">Multi <i class="mxp">alpha</i></b><button class="mxbt" data-a="new">+ Tạo phòng</button></div><div id="mxrl" class="mxrl"></div></div>'),drawList()}
function drawList(){const el=Q('#mxrl');if(!el)return;const rows=RL.map(r=>{const full=(r.n||1)>=(r.max||MAXP),busy=r.state!=='lobby',mp=r.map?E(r.map.title)+' ['+E(r.map.ver)+']':'Chưa chọn bài';
return'<div class="mxr1'+(full||busy?' off':'')+'" data-a="join" data-id="'+E(r.id)+'"><div class="a"><b>'+E(r.name)+'</b>'+'<i class="mxp'+(r.priv?'':' pub')+'">'+(r.priv?'Private':'Public')+'</i>'+'<small>Host: '+E(r.hostName)+' · '+mp+'</small></div><div class="b"><span>'+(r.n||1)+'/'+(r.max||MAXP)+'</span><small>'+(busy?'Đang chơi':full?'Đầy':r.mode===1?'Mania':'osu!')+'</small></div></div>'}).join('');
setH(el,(err?'<div class="mxe">'+E(err)+'</div>':'')+(pwFor?'<div class="mxpw"><b>Phòng Private: '+E(pwFor.name)+'</b><input id="pwi" type="password" placeholder="Mật khẩu phòng" autocomplete="off"><button class="mxbt" data-a="pwgo">Vào</button><button class="mxbt s" data-a="pwx">Hủy</button></div>':'')+(rows||'<div class="mxm">Chưa có phòng nào. Hãy tạo phòng mới!</div>'));if(pwFor){const i=Q('#pwi');if(i)i.focus()}}

function showCreate(){view='new';draw('<div class="mxh"><button class="mxbt s" data-a="list">‹ Back</button><b class="mxt">Tạo phòng</b></div><div class="mxf2"><label>Tên phòng<input id="cn" maxlength="30" value="Phòng của '+E(ME.name)+'"></label><label>Mật khẩu (để trống = phòng công khai)<input id="cp" type="password" maxlength="30" autocomplete="off"></label><label>Chế độ đấu<select id="cv"><option value="0">Head-to-Head</option><option value="1">Team Versus</option></select></label><label>Điều kiện thắng<select id="cw"><option value="score">Score</option><option value="acc">Accuracy</option><option value="combo">Combo</option></select></label><label>Hàng đợi bài<select id="cq"><option value="host">Host Only</option><option value="all">All Players</option></select></label><button class="mxbt" data-a="mk">Tạo phòng</button><div class="mxe" id="mxer"></div></div>')}
async function mk(){const n=(Q('#cn').value||'').trim().slice(0,30),pw=Q('#cp').value;if(!n)return;try{const room={name:n,hostUid:ME.uid,hostName:ME.name,priv:!!pw,state:'lobby',mode:0,mods:[],free:false,vs:+Q('#cv').value?1:0,win:Q('#cw').value,qm:Q('#cq').value==='all'?'all':'host',lastBy:'',map:null,n:1,max:MAXP,cdAt:null,cdMs:CD};const rid=await B().create(room,pw,ME,sha);enter(rid)}catch(e){const el=Q('#mxer');if(el)el.textContent='Không tạo được phòng: '+(e.message||e)}}
async function joinRoom(r,pw){err='';try{const ph=r.priv?await sha(r.id+':'+(pw||'')):null;await B().join(r.id,ME,ph);pwFor=null;enter(r.id)}catch(e){err=r.priv?'Sai mật khẩu, phòng đầy hoặc đã bắt đầu':'Không vào được phòng';view='list';drawList()}}
function stopSubs(){unsubs.forEach(f=>{try{f()}catch(e){}});unsubs=[]}
function enter(rid){stopSubs();RID=rid;R=null;QUE=[];PLY={};CHAT=[];LOC=null;OFFS=null;started=null;ended=false;view='room';buildRoom();
unsubs.push(B().room(rid,onRoom),B().players(rid,onPlayers),B().chat(rid,onChat),B().queue(rid,l=>{QUE=(l||[]).sort((a,b)=>(a.t||0)-(b.t||0));updQueue();hostWatch()}));
timers.push(setInterval(tick,15000))}
function buildRoom(){setH(mx(),'<div class="mxw"><div class="mxh"><button class="mxbt s" data-a="leave">‹ Rời phòng</button><b class="mxt" id="mxrn"></b><span class="mxs" id="mxst"></span></div><div class="mxg"><div class="mxl"><div class="mxc" id="mxmap"></div><div class="mxc" id="mxset"></div><div class="mxc" id="mxq"></div><div class="mxc"><div class="mxk">Người chơi</div><div id="mxpl"></div></div></div><div class="mxr"><div class="mxlog" id="mxlog"></div><div class="mxin"><input id="mxmsg" maxlength="200" placeholder="Nhắn tin…" autocomplete="off"><button class="mxbt" data-a="send">Gửi</button></div></div></div><div class="mxf" id="mxft"></div></div>')}
function sameMap(a,b){return(!a&&!b)||(a&&b&&a.hash===b.hash)}
function onRoom(r){if(!r){if(RID){const was=RID;leaveLocal();err='Phòng đã đóng';open();}return}
const prev=R;R=r;if(!prev||!sameMap(prev.map,r.map)){checkHas()}else if(prev&&(prev.mode!==r.mode||JSON.stringify(prev.mods)!==JSON.stringify(r.mods)||prev.vs!==r.vs||prev.free!==r.free))resetReady();
if(r.state==='countdown'&&r.cdAt&&started!==r.cdAt)beginMatch(r);
if(r.state==='lobby'&&started!==null&&!ACT)started=null;
hostWatch();updRoom()}
function onPlayers(l){PLY={};l.forEach(p=>PLY[p.uid]=p);const me=ME&&PLY[ME.uid];if(me&&me.upd){const o=me.upd-Date.now();if(OFFS==null||o>OFFS)OFFS=o}
if(RID&&ME&&!PLY[ME.uid]&&R&&!ACT&&view==='room'&&Object.keys(PLY).length&&!isHost()&&joinedSeen){err='Bạn đã bị mời ra khỏi phòng';leaveLocal();open();return}
if(me)joinedSeen=true;if(me&&R&&R.vs&&!me.team&&RID){const c={A:0,B:0};l.forEach(p=>{if(p.team)c[p.team]++});B().upMe(RID,ME.uid,{team:c.A<=c.B?'A':'B'}).catch(()=>{})}hostWatch();updPlayers();if(view==='res')drawRes()}
let joinedSeen=false;
function onChat(l){CHAT=l;updChat()}
function hostWatch(){if(!isHost()||!R)return;const n=Object.keys(PLY).length;if(n&&R.n!==n)B().upRoom(RID,{n}).catch(()=>{});
if(R.state==='playing'){const ps=Object.values(PLY).filter(p=>p.has&&!(p.upd&&Date.now()+offs()-p.upd>STALE&&!p.fin));if(ps.length&&ps.every(p=>p.fin)&&R.state!=='lobby'){const nx=nextQ();B().upRoom(RID,nx?{state:'lobby',map:nx.map,lastBy:nx.by}:{state:'lobby'}).catch(()=>{});if(nx)B().qdel(RID,nx.id).catch(()=>{})}}
else if(R.state==='lobby'&&!R.map&&QUE.length){const nx=nextQ();if(nx&&!hostWatch.busy){hostWatch.busy=1;B().upRoom(RID,{map:nx.map,lastBy:nx.by}).then(()=>B().qdel(RID,nx.id)).catch(()=>{}).finally(()=>hostWatch.busy=0)}}}
function nextQ(){if(!QUE.length)return null;const ord=Object.values(PLY).sort((a,b)=>(a.joined||0)-(b.joined||0)).map(p=>p.uid),last=ord.indexOf(R.lastBy||'');let pick=null;for(let i=1;i<=ord.length&&!pick;i++){const u=ord[(last+i+ord.length)%ord.length];pick=QUE.find(q=>q.by===u)}pick=pick||QUE[0];const{id,by,byName,t,...map}=pick;return{id,by,map}}
function tick(){if(!RID||!ME)return;if(isHost()&&R)B().upRoom(RID,{}).catch(()=>{});if(!ACT)B().upMe(RID,ME.uid,{upd:'$ts'}).catch(()=>{});
if(isHost()&&R&&R.state==='lobby')for(const p of Object.values(PLY))if(p.uid!==ME.uid&&p.upd&&Date.now()+offs()-p.upd>STALE)B().leave(RID,p.uid).catch(()=>{})}
async function checkHas(){const m=R&&R.map;LOC=m?await findLocal(m):null;if(RID&&ME)B().upMe(RID,ME.uid,{has:isHost()?!!(LOC||!m):!!LOC,ready:isHost()}).catch(()=>{});updRoom()}
function resetReady(){if(RID&&ME&&!isHost())B().upMe(RID,ME.uid,{ready:false}).catch(()=>{})}

// ---------- giao diện phòng ----------
function updRoom(){if(view!=='room'||!R)return;const rn=Q('#mxrn');if(rn)setH(rn,E(R.name)+' <i class="mxp'+(R.priv?'':' pub')+'">'+(R.priv?'Private':'Public')+'</i>');
const h=isHost(),m=R.map,have=!!LOC;
setH(Q('#mxmap'),'<div class="mxk">Beatmap</div>'+(m?'<div class="mxmp"><b>'+E(m.title)+'</b><small>'+E(m.artist)+' · ['+E(m.ver)+'] · ★'+(m.sr||0).toFixed(2)+' · '+mm(m.len||0)+'</small></div>'+(have?'':'<div class="mxe">Bạn chưa có beatmap này (cùng mã băm MD5). Hãy thêm file .osz đúng bản.<br><label class="mxbt s mxfl">+ .osz<input id="mxf" type="file" multiple accept=".osz" hidden></label></div>'):'<div class="mxm">Host chưa chọn bài</div>')+'');
const fi=Q('#mxf');if(fi)fi.onchange=async e=>{for(const f of e.target.files){try{await importOsz(await f.arrayBuffer())}catch(x){}}try{LIBC=null;LIBP=null}catch(x){}checkHas()};
const md=R.mode===1?1:0,mods=R.mods||[];
const btn=(on,a,v,t)=>'<button class="mxc2'+(on?' on':'')+'"'+(h?' data-a="'+a+'" data-v="'+v+'"':' disabled')+'>'+t+'</button>',me0=ME&&PLY[ME.uid],myTeam=me0?teamOf(me0):'A';
setH(Q('#mxset'),'<div class="mxk">Thiết lập trận</div><div class="mxch">'+btn(!R.vs,'vs',0,'Head-to-Head')+btn(!!R.vs,'vs',1,'Team Versus')+'</div><div class="mxch">'+WINL.map(w=>btn(win()===w[0],'win',w[0],'Thắng: '+w[1])).join('')+'</div><div class="mxch">'+btn(R.qm!=='all','qm','host','Queue: Host Only')+btn(R.qm==='all','qm','all','Queue: All Players')+'</div>'+(R.vs&&R.state==='lobby'?'<div class="mxch"><button class="mxc2 on" data-a="team">Đội của bạn: '+myTeam+' (đổi)</button></div>':'')+'<div class="mxk">Chế độ & Mod</div><div class="mxch">'+['osu!','mania 4K'].map((n,i)=>'<button class="mxc2'+(md===i?' on':'')+'"'+(h?' data-a="mode" data-v="'+i+'"':' disabled')+'>'+n+'</button>').join('')+'</div><div class="mxch">'+MODL.map(q=>'<button class="mxc2'+(mods.includes(q[0])?' on':'')+'"'+(h?' data-a="mod" data-v="'+q[0]+'"':' disabled')+' title="'+q[1]+'">'+q[0]+'</button>').join('')+'</div><div class="mxch">'+btn(!!R.free,'free',R.free?0:1,'Free Mods: '+(R.free?'Bật':'Tắt'))+'</div>'+(R.free?'<div class="mxk">Mod của bạn</div><div class="mxch">'+MODL.map(q=>{const pm=me0?okMods(me0.mods):[],blk=mods.some(x=>(CONF[q[0]]||[]).includes(x));return'<button class="mxc2'+(pm.includes(q[0])?' on':'')+'"'+(blk||mods.includes(q[0])?' disabled':' data-a="pmod" data-v="'+q[0]+'"')+'>'+q[0]+'</button>'}).join('')+'</div>':'')+'<small>Cấm: Auto, Relax, Autopilot, Cinema. Mod xung đột tự tắt.</small>');updQueue();
const st=R.state;setH(Q('#mxst'),st==='lobby'?'':st==='countdown'?'Sắp bắt đầu…':'Đang chơi');updPlayers()}
function updQueue(){const el=Q('#mxq');if(!el||!R)return;const h=isHost(),can=h||R.qm==='all',me=ME&&ME.uid;
setH(el,'<div class="mxk">Hàng đợi ('+(R.qm==='all'?'All Players':'Host Only')+')</div>'+(QUE.map((q,i)=>'<div class="mxpr"><span>'+(i+1)+'. '+E(q.title)+' ['+E(q.ver)+'] <small>· '+E(q.byName)+'</small></span>'+(h?'<button class="mxc2" data-a="qnow" data-id="'+E(q.id)+'">Phát</button>':'')+(h||q.by===me?'<button class="mxc2" data-a="qdel" data-id="'+E(q.id)+'">✕</button>':'')+'</div>').join('')||'<div class="mxm">Trống</div>')+(can?'<button class="mxbt" data-a="pick">+ Thêm bài</button>':''))}
function updPlayers(){if(view!=='room'||!R)return;const l=Object.values(PLY).sort((a,b)=>(a.joined||0)-(b.joined||0));
setH(Q('#mxpl'),l.map(p=>{const host=p.uid===R.hostUid,s=!p.has?'<i class="mxx">Thiếu map</i>':host?'<i class="mxo">Host</i>':p.ready?'<i class="mxo">Sẵn sàng</i>':'<i class="mxn">Chưa sẵn sàng</i>';return'<div class="mxpr'+(p.uid===(ME&&ME.uid)?' me':'')+'"><span>'+(host?'♛ ':'')+(R.vs?'['+teamOf(p)+'] ':'')+E(p.name)+'</span>'+s+'</div>'}).join('')||'<div class="mxm">…</div>');
const me=ME&&PLY[ME.uid],lob=R.state==='lobby',h=isHost();let f='';
if(h){const others=l.filter(p=>p.uid!==ME.uid),ok=lob&&R.map&&LOC&&others.every(p=>p.ready&&p.has);f='<button class="mxbt big"'+(ok?'':' disabled')+' data-a="start">Bắt đầu</button><small>'+(!R.map?'Hãy chọn bài trước':!LOC?'Bạn chưa có beatmap này':!others.every(p=>p.has)?'Có người thiếu beatmap':!others.every(p=>p.ready)?'Chờ mọi người sẵn sàng':!lob?'Trận đang diễn ra':'')+'</small>'}
else f='<button class="mxbt big'+(me&&me.ready?' on':'')+'"'+(lob&&LOC&&R.map?'':' disabled')+' data-a="ready">'+(me&&me.ready?'Hủy sẵn sàng':'Sẵn sàng')+'</button>';
setH(Q('#mxft'),f)}
function updChat(){const el=Q('#mxlog');if(!el)return;const bot=el.scrollTop+el.clientHeight>=el.scrollHeight-30;setH(el,CHAT.map(c=>'<div class="mxcm"><b>'+E(c.name)+':</b> '+E(c.text)+'</div>').join('')||'<div class="mxm">Chưa có tin nhắn</div>');if(bot)el.scrollTop=el.scrollHeight}
function send(){const i=Q('#mxmsg');if(!i||!RID)return;const t=i.value.trim().slice(0,200);if(!t||Date.now()-lastSay<400)return;lastSay=Date.now();i.value='';B().say(RID,ME,t).catch(()=>{})}

// ---------- chọn bài (host) ----------
async function openPick(){view='pick';pickList=null;draw('<div class="mxh"><button class="mxbt s" data-a="room">‹ Back</button><b class="mxt">Chọn bài</b></div><div id="mxpk" class="mxrl"><div class="mxm">Đang tải…</div></div>');pickList=await dbAll();if(view!=='pick')return;
setH(Q('#mxpk'),pickList.map(m=>'<div class="mxr1 sm"><div class="a"><b>'+E(m.title)+'</b><small>'+E(m.artist)+'</small></div><div class="mxd">'+m.vers.map((v,i)=>'<button class="mxc2" data-a="song" data-m="'+E(m.id)+'" data-v="'+i+'">'+E(v.ver)+' ★'+(v.sr||0).toFixed(1)+'</button>').join('')+'</div></div>').join('')||'<div class="mxm">Chưa có beatmap nào. Hãy thêm file .osz ở màn Solo.</div>')}
async function song(mid,i){const m=(pickList||[]).find(x=>x.id===mid);if(!m)return;const v=m.vers[i];view='room';buildRoom();updRoom();updChat();updQueue();try{const h=await hashOf(m,v),mp={hash:h,title:m.title,artist:m.artist,ver:v.ver,sr:Math.round((v.sr||0)*100)/100,len:v.len||0,mode:v.mode||0};
if(isHost()&&!R.map&&R.state==='lobby')await B().upRoom(RID,{map:mp});else if(isHost()||R.qm==='all')await B().qadd(RID,{...mp,by:ME.uid,byName:ME.name})}catch(e){}}
function toggleMod(k){if(!ALLOW.includes(k))return;let a=okMods(R.mods);if(a.includes(k))a=a.filter(x=>x!==k);else{a=a.filter(x=>!(CONF[k]||[]).includes(x));a.push(k)}B().upRoom(RID,{mods:a}).catch(()=>{})}

// ---------- trận đấu ----------
function pmod(k){const me=PLY[ME.uid];if(!me||!ALLOW.includes(k)||R.state!=='lobby')return;let a=okMods(me.mods);if(a.includes(k))a=a.filter(x=>x!==k);else{a=a.filter(x=>!(CONF[k]||[]).includes(x));a.push(k)}B().upMe(RID,ME.uid,{mods:a}).catch(()=>{})}
function start(){if(!isHost()||!R||!R.map||R.state!=='lobby')return;B().upRoom(RID,{state:'countdown',cdAt:'$ts',cdMs:CD}).catch(()=>{})}
async function beginMatch(r){started=r.cdAt;if(!LOC)return;ACT=true;ended=false;startLocal=r.cdAt+(r.cdMs||CD)-offs();bak={mods:[...MODS],mania:MANIA};MODS.clear();myMods(PLY[ME.uid]).forEach(m=>MODS.add(m));MANIA=r.mode===1;
B().upMe(RID,ME.uid,{ready:false,fin:null,fl:0,score:0,hp:1,combo:0,acc:1,prog:0,upd:'$ts'}).catch(()=>{});mx().style.display='none';hudOn();lastPush='';
if(isHost())setTimeout(()=>{if(R&&R.state==='countdown')B().upRoom(RID,{state:'playing'}).catch(()=>{})},(r.cdMs||CD)+300);
try{await playMap(LOC.m,LOC.i)}catch(e){}}
function seekMs(){return(Date.now()-startLocal)*((P&&P.sp)||1)}
function restore(){if(bak){MODS.clear();bak.mods.forEach(m=>MODS.add(m));MANIA=bak.mania;bak=null}}
function hudOn(){hudOff();const h=document.createElement('div');h.id='mph';h.innerHTML='<div id="mpc"></div><div id="mpr"></div>';document.body.appendChild(h);timers.push(h.__t=setInterval(hudTick,250));hudTick()}
function hudOff(){const h=Q('#mph');if(h){clearInterval(h.__t);h.remove()}const q=Q('#mpq');if(q)q.remove()}
function hudTick(){const c=Q('#mpc'),r=Q('#mpr');if(!c||!r)return;const rem=startLocal-Date.now();c.textContent=rem>0?String(Math.ceil(rem/1000)):'';c.style.display=rem>0?'flex':'none';
const me=ME&&ME.uid,w=win(),rows=rankL(Object.values(PLY).map(p=>{const q={...p};if(p.uid===me&&P&&!P.over&&!p.fin){q.score=P.score;q.combo=P.combo;q.acc=accOf(P);q.fl=(P.mpF||P.sdf)?1:0}return q}),w).map(p=>({n:(R&&R.vs?'['+teamOf(p)+'] ':'')+p.name,s:fmtV(val(p,w),w),f:isF(p),me:p.uid===me,off:!p.fin&&p.upd&&Date.now()+offs()-p.upd>STALE}));
r.innerHTML=rows.map((x,i)=>'<div class="mrw'+(x.me?' me':'')+(x.off||x.f?' off':'')+'"><b>'+(i+1)+'</b><span>'+E(x.n)+(x.f?' ✖':'')+'</span><em>'+x.s+'</em></div>').join('')}
function push(){if(!ACT||ended||!RID||!P||P.over)return;const t=Math.max(0,T()),sl=songLen(),o={score:Math.round(P.score),combo:P.combo|0,acc:Math.round(accOf(P)*1e4)/1e4,prog:sl?Math.round(Math.min(1,t/sl)*1e3)/1e3:0,fl:(P.mpF||P.sdf)?1:0},k=JSON.stringify(o);
if(k===lastPush&&Date.now()-lastPushT<5000)return;lastPush=k;lastPushT=Date.now();o.upd='$ts';B().upMe(RID,ME.uid,o).catch(()=>{})}
timers.push(setInterval(push,PUSH));
function fin(res){if(!ACT||ended)return;ended=true;const o={score:Math.round(res.score||0),max:res.max|0,acc:Math.round((res.acc||0)*1e4)/1e4,rk:String(res.rk||'').slice(0,2),fail:!!res.fail,left:!!res.left};
B().upMe(RID,ME.uid,{fin:o,fl:o.fail?1:0,score:o.score,combo:o.max,prog:1,acc:o.acc,upd:'$ts'}).catch(()=>{});hudOff();view='res';mx().style.display='flex';drawRes()}
function drawRes(){const w=win(),all=Object.values(PLY),done=all.filter(p=>p.fin),left=all.length-done.length,l=rankL(all,w).sort((a,b)=>(!!b.fin-!!a.fin)||0);
const ord=[...rankL(all.filter(p=>p.fin),w),...rankL(all.filter(p=>!p.fin),w)];let tm='';
if(R&&R.vs){const t={A:[],B:[]};done.forEach(p=>{if(!isF(p))t[teamOf(p)].push(val(p,w))});const tv=k=>w==='acc'?(t[k].length?t[k].reduce((a,b)=>a+b,0)/t[k].length:0):t[k].reduce((a,b)=>a+b,0),a=tv('A'),b=tv('B');
tm='<div class="mxr1 res"><div class="a"><b>Team A: '+fmtV(a,w)+' · Team B: '+fmtV(b,w)+'</b><small>'+(left?'Tạm tính':a===b?'Hòa':(a>b?'Team A':'Team B')+' thắng')+' (chỉ tính người Pass)</small></div></div>'}
draw('<div class="mxh"><b class="mxt">Kết quả trận đấu</b><span class="mxs">'+(left?'Còn '+left+' người đang chơi…':'Hoàn tất')+'</span></div><div class="mxrl">'+tm+ord.map((p,i)=>{const f=p.fin;return'<div class="mxr1 res'+(ME&&p.uid===ME.uid?' me':'')+'"><div class="a"><b>#'+(i+1)+' '+(R&&R.vs?'['+teamOf(p)+'] ':'')+E(p.name)+'</b><small>'+(f?(f.left?'Đã rời trận':isF(p)?'Failed':'Pass · Hạng '+E(f.rk))+' · '+(f.acc*100).toFixed(2)+'% · '+f.max+'x':'Đang chơi…'+(isF(p)?' (Failed)':''))+'</small></div><div class="b"><span>'+String(f?f.score:p.score||0).padStart(8,'0')+'</span></div></div>'}).join('')+'</div><div class="mxf"><button class="mxbt big" data-a="back">Về phòng</button></div>')}
function back(){ACT=false;restore();hudOff();if(RID&&R){view='room';mx().style.display='flex';buildRoom();updRoom();updPlayers();updChat();if(R.state!=='lobby'&&R.state!=='countdown'){}}else{leaveLocal();open()}}
function quit(){if(Q('#mpq'))return;const q=document.createElement('div');q.id='mpq';q.innerHTML=tr('<div class="mxw"><b>Rời trận đấu?</b><small>Điểm hiện tại sẽ được ghi nhận và bạn bị tính là đã rời.</small><div><button class="mxbt s" data-a="qk">Tiếp tục</button><button class="mxbt" data-a="ql">Rời trận</button></div></div>');q.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==='qk')q.remove();if(a==='ql'){q.remove();const p=P;if(p){fin({score:p.score,max:p.max,acc:accOf(p),rk:'F',fail:true,left:true});endPlay()}}};document.body.appendChild(q)}

// ---------- rời phòng ----------
function leaveLocal(){stopSubs();timers.forEach(t=>clearInterval(t));timers=[setInterval(push,PUSH)];ACT=false;restore();hudOff();RID=null;R=null;QUE=[];PLY={};CHAT=[];LOC=null;started=null;joinedSeen=false}
async function leave(){const rid=RID,host=isHost(),uids=Object.keys(PLY);try{if(host)await B().close(rid,uids,QUE.map(q=>q.id));else await B().leave(rid,ME.uid)}catch(e){}leaveLocal();err='';open()}
function closeAll(){stopSubs();const x=Q('#mpx');if(x)x.style.display='none';if(typeof menu==='function'&&!document.getElementById('mb'))menu()}

function click(e){const t=e.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a;
if(a==='close')closeAll();else if(a==='login')ON.panel(()=>open());else if(a==='new')showCreate();else if(a==='list'){view='list';draw();}else if(a==='mk')mk();
else if(a==='join'){const r=RL.find(x=>x.id===t.dataset.id);if(!r||r.state!=='lobby'||(r.n||1)>=(r.max||MAXP))return;if(r.priv){pwFor=r;err='';drawList()}else joinRoom(r)}
else if(a==='pwgo'){const i=Q('#pwi');if(pwFor)joinRoom(pwFor,i?i.value:'')}else if(a==='pwx'){pwFor=null;drawList()}
else if(a==='leave')leave();else if(a==='send')send();else if(a==='pick')openPick();else if(a==='room'){view='room';buildRoom();updRoom();updChat()}
else if(a==='song')song(t.dataset.m,+t.dataset.v);else if(a==='mode'){if(isHost())B().upRoom(RID,{mode:+t.dataset.v}).catch(()=>{})}else if(a==='mod'){if(isHost())toggleMod(t.dataset.v)}
else if(a==='vs'){if(isHost())B().upRoom(RID,{vs:+t.dataset.v}).catch(()=>{})}else if(a==='win'){if(isHost())B().upRoom(RID,{win:t.dataset.v}).catch(()=>{})}else if(a==='qm'){if(isHost())B().upRoom(RID,{qm:t.dataset.v}).catch(()=>{})}else if(a==='free'){if(isHost())B().upRoom(RID,{free:!!+t.dataset.v}).catch(()=>{})}
else if(a==='pmod')pmod(t.dataset.v);else if(a==='team'){const me=PLY[ME.uid];if(me&&R.state==='lobby')B().upMe(RID,ME.uid,{team:teamOf(me)==='A'?'B':'A'}).catch(()=>{})}
else if(a==='qdel')B().qdel(RID,t.dataset.id).catch(()=>{});else if(a==='qnow'){const q=QUE.find(x=>x.id===t.dataset.id);if(isHost()&&q&&R.state==='lobby'){const{id,by,byName,t:_t,...mp}=q;B().upRoom(RID,{map:mp,lastBy:by}).then(()=>B().qdel(RID,id)).catch(()=>{})}}
else if(a==='ready'){const me=PLY[ME.uid];if(me&&LOC)B().upMe(RID,ME.uid,{ready:!me.ready}).catch(()=>{})}else if(a==='start')start();else if(a==='back')back()}

return{open,get active(){return ACT},seekMs,quit,fin,back,_md5:md5,_s:()=>({R,PLY,LOC,view,RID})}})();
window.MPL=MPL;
