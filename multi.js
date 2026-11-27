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
/* Nhập .osz (cả bộ, mọi độ khó) vào thư viện Solo; xoá cache hash cũ của bộ bị ghi đè để nhận đúng bản mới */
async function imp(buf){const id=await importOsz(buf);try{for(const k of Object.keys(MH))if(k.indexOf(id+'|')===0)delete MH[k];localStorage.setItem('osui_mh',JSON.stringify(MH))}catch(e){}try{LIBC=null;LIBP=null}catch(e){}return id}
async function findLocal(info){if(!info)return null;for(const m of await dbAll()){if(m.title!==info.title||m.artist!==info.artist)continue;for(let i=0;i<m.vers.length;i++){if(m.vers[i].ver!==info.ver)continue;try{if(await hashOf(m,m.vers[i])===info.hash)return{m,i}}catch(e){}}}return null}

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
async setPw(rid,pw,hf){await lib();const fs=X.fs,ref=fs.doc(X.D,'rooms',rid,'secret','pw');try{await fs.deleteDoc(ref)}catch(e){}if(pw)await fs.setDoc(ref,{h:await hf(rid+':'+pw)})},
async leave(rid,uid){await lib();return X.fs.deleteDoc(X.fs.doc(X.D,'rooms',rid,'players',uid))},
async close(rid,uids,qids){await lib();const fs=X.fs;for(const q of qids||[]){try{await fs.deleteDoc(fs.doc(X.D,'rooms',rid,'queue',q))}catch(e){}}for(const u of uids){try{await fs.deleteDoc(fs.doc(X.D,'rooms',rid,'players',u))}catch(e){}}try{await fs.deleteDoc(fs.doc(X.D,'rooms',rid,'secret','pw'))}catch(e){}return fs.deleteDoc(fs.doc(X.D,'rooms',rid))}}})();
const B=()=>window.__MPB||FSB;

let ME=null,RID=null,R=null,QUE=[],PLY={},CHAT=[],LOC=null,OFFS=null,ACT=false,ended=false,started=null,startLocal=0,bak=null,view='',RL=[],unsubs=[],err='',lastPush='',lastPushT=0,lastSay=0,pickList=null,pwFor=null,timers=[];
const isHost=()=>!!(R&&ME&&R.hostUid===ME.uid),offs=()=>OFFS==null?0:OFFS,mx=()=>{let e=Q('#mpx');if(!e){e=document.createElement('div');e.id='mpx';try{e.style.zoom=SET.ui||1}catch(x){}document.body.appendChild(e);e.onclick=click;e.oninput=e.onchange=inp;e.onkeydown=e2=>{if(e2.key==='Enter'&&e2.target.id==='mxmsg')send();if(e2.key==='Enter'&&e2.target.id==='pwi')Q('[data-a="pwgo"]').click()}}return e};
const inp=e=>{const t=e.target;if(t.id==='lzq'){qry=t.value;drawList()}else if(t.id==='lzty'){fTy=t.value;drawList()}else if(t.id==='lzst'){fSt=t.value;drawList()}},setH=(el,h)=>{if(el)el.innerHTML=tr(h)};
const isF=p=>!!(p.fin?p.fin.fail:p.fl),win=()=>(R&&R.win)||'score',val=(p,w)=>{const f=p.fin;return w==='acc'?(f?f.acc:p.acc||0):w==='combo'?(f?f.max:p.combo||0):(f?f.score:p.score||0)},
rankL=(l,w)=>l.slice().sort((a,b)=>(isF(a)-isF(b))||(val(b,w)-val(a,w))||((a.joined||0)-(b.joined||0))),
fmtV=(v,w)=>w==='acc'?(v*100).toFixed(2)+'%':w==='combo'?v+'x':String(v).padStart(7,'0'),
myMods=p=>{const b=okMods(R&&R.mods);if(!R||!R.free||!p)return b;const r=b.slice();for(const k of okMods(p.mods))if(!r.includes(k)&&!r.some(x=>(CONF[k]||[]).includes(x)))r.push(k);return r},
teamOf=p=>p.team==='B'?'B':'A';
const accOf=p=>{const n=p.n,t=n.reduce((a,b)=>a+b,0);return!t?1:p.mn?p.ws/(305*t):(300*n[0]+100*n[1]+50*n[2])/(300*t)};
const mm=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');

const hue=s=>{let h=0;for(const c of String(s||''))h=(h*31+c.charCodeAt(0))>>>0;return h%360};
const AV=(n,c)=>'<i class="lzav'+(c||'')+'" style="background:hsl('+hue(n)+' 48% 40%)">'+E(String(n||'?').trim().charAt(0).toUpperCase())+'</i>';
const stCol=s=>s<2?'#66ccff':s<2.7?'#88dd44':s<4?'#ffcc22':s<5.3?'#ff6699':s<6.5?'#9955ff':'#2b2b2b';
const STAR=s=>'<span class="lzst" style="background:'+stCol(s||0)+';color:'+((s||0)>=6.5?'#ffd23f':'#1d1d1d')+'">★ '+(s||0).toFixed(2)+'</span>';
const STARR=(a,b)=>a===b?STAR(a):'<span class="lzsr2">'+STAR(a)+STAR(b)+'</span>';
const IC_P='<svg class="lzic" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z"/></svg>';
const IC_H='<svg viewBox="0 0 48 48"><path d="M5 12v24l17-12z" fill="#4db6f5"/><path d="M43 12v24L26 24z" fill="#4db6f5"/></svg>';
const IC_T='<svg viewBox="0 0 48 48"><path d="M5 12v24l17-12z" fill="#4db6f5"/><path d="M43 12v24L26 24z" fill="#ff6aa8"/></svg>';
const AUTOS=[[0,'Tắt'],[30,'30 giây'],[60,'1 phút'],[120,'2 phút'],[300,'5 phút']],aLbl=s=>(AUTOS.find(x=>x[0]===s)||[0,s+'s'])[1];
const crumb=(a,b)=>'<div class="lzbc">'+a+' · <b>'+b+'</b></div>';
const backBtn=(act,txt)=>'<button class="lzback" data-a="'+act+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M13.5 7.5L9 12l4.5 4.5"/></svg><span>'+(txt||'Quay lại')+'</span></button>';
const opts=(l,cur)=>l.map(x=>'<option value="'+x[0]+'"'+(String(x[0])===String(cur)?' selected':'')+'>'+x[1]+'</option>').join('');
const tgl=(k,on,dis)=>'<button class="lztg'+(on?' on':'')+'"'+(dis?' disabled':' data-a="tgl" data-v="'+k+'"')+'><i></i></button>';
let qry='',fTy='any',fSt='open',draft=null,pickFor='room',HIST=[],tab='queue',autoAt=null,autoMap=null;
const avs=(n,host)=>{const a=[];for(let i=0;i<Math.min(n,5);i++)a.push(AV(i===0?host:host+i));return'<span class="lzavs">'+a.join('')+(n>5?'<i class="lzav more">+'+(n-5)+'</i>':'')+'</span>'};

function open(){stopSubs();ME=ON.user();const x=mx();x.style.display='flex';
if(!ON.ready()){view='msg';return draw('<div class="mxm">Multi cần Firebase (chưa cấu hình trong firebase-config.js).</div>')}
if(!ME||!ME.verified||!ME.name){view='msg';return draw('<div class="mxm">Multi cần tài khoản đã đăng nhập và xác minh email.<br><button class="lzb pur" data-a="login">Đăng nhập</button> <button class="lzb" data-a="close">Quay lại</button></div>')}
view='list';err='';RL=[];draw();unsubs.push(B().rooms((l,e)=>{if(e){err='Không tải được danh sách phòng';}else{RL=(l||[]).filter(r=>r&&r.name&&Date.now()-(r.upd||r.created||Date.now())<10*60e3)}if(view==='list')drawList()}))}

function draw(h){const x=mx();if(h!==undefined)return setH(x,'<div class="mxw lz">'+h+'</div>');
if(view==='list')return setH(x,'<div class="mxw lz">'+crumb('Multiplayer','Lounge')+'<div class="lzbar"><button class="lzb pur" data-a="new">Tạo phòng</button><div class="lzsrch"><input id="lzq" placeholder="Gõ để tìm kiếm" value="'+E(qry)+'" autocomplete="off"></div></div><div class="lzflt"><select id="lzty">'+opts([['any','Mọi loại'],['h2h','Head-to-Head'],['team','Team Versus']],fTy)+'</select><select id="lzst">'+opts([['open','Đang mở'],['play','Đang chơi'],['all','Tất cả']],fSt)+'</select></div><div id="mxrl" class="mxrl"></div></div>'+backBtn('close')),drawList()}

function roomCard(r){const full=(r.n||1)>=(r.max||MAXP),busy=r.state!=='lobby',m=r.map,n=r.n||1;
return'<div class="lzrm'+(full||busy?' off':'')+'" data-a="join" data-id="'+E(r.id)+'" style="--h:'+hue(r.id)+'"><div class="lzrl"><div class="lzpills"><i class="lzp '+(r.priv?'pk':'gr')+'">'+(r.priv?'Private':'Open')+'</i><i class="lzp ye">'+(r.vs?'Team Versus':'Head-to-Head')+'</i>'+(busy?'<i class="lzp or">Đang chơi</i>':full?'<i class="lzp or">Đầy</i>':'')+'</div><div class="lzrn">'+E(r.name)+'</div><div class="lzrs '+(busy?'pl':'rd')+'">'+(busy?'Đang diễn ra':'Sẵn sàng chơi')+(m?' · '+E(m.title)+' ['+E(m.ver)+']':'')+'</div><div class="lzpills"><i class="lzp dk">'+(m?1:0)+' Beatmap</i>'+(m?STAR(m.sr):'')+'<i class="lzp dk">'+(r.mode===1?'Mania':'osu!')+'</i></div></div><div class="lzrr"><div class="lzhost">'+AV(r.hostName)+'<span>hosted by <b>'+E(r.hostName)+'</b></span></div><div class="lzcnt">'+IC_P+'<b>'+n+'/'+(r.max||MAXP)+'</b>'+avs(n,r.hostName)+'</div></div></div>'}

function drawList(){const el=Q('#mxrl');if(!el)return;const q=qry.trim().toLowerCase();
const rows=RL.filter(r=>{const full=(r.n||1)>=(r.max||MAXP),busy=r.state!=='lobby';
if(fTy==='h2h'&&r.vs)return false;if(fTy==='team'&&!r.vs)return false;
if(fSt==='open'&&(busy||full))return false;if(fSt==='play'&&!busy)return false;
if(q&&!((r.name||'')+' '+(r.hostName||'')+' '+(r.map?r.map.title+' '+r.map.artist:'')).toLowerCase().includes(q))return false;return true}).map(roomCard).join('');
setH(el,(err?'<div class="mxe">'+E(err)+'</div>':'')+(pwFor?'<div class="mxpw"><b>Phòng Private: '+E(pwFor.name)+'</b><input id="pwi" type="password" placeholder="Mật khẩu phòng" autocomplete="off"><button class="lzb pur" data-a="pwgo">Vào</button><button class="lzb" data-a="pwx">Hủy</button></div>':'')+(rows||'<div class="mxm">'+(RL.length?'Không có phòng nào khớp bộ lọc.':'Chưa có phòng nào. Hãy tạo phòng mới!')+'</div>'));
if(pwFor){const i=Q('#pwi');if(i)i.focus()}}

function showCreate(edit){view=edit?'edit':'new';
if(!draft||!!draft.edit!==!!edit)draft=edit?{edit:1,name:R.name,vs:R.vs?1:0,qm:R.qm||'host',win:win(),auto:R.auto||0,limited:(R.max||MAXP)<MAXP,max:R.max||MAXP,pw:'',skip:!!R.skip,map:null}:{edit:0,name:'Phòng của '+ME.name,vs:0,qm:'host',win:'score',auto:0,limited:false,max:MAXP,pw:'',skip:false,map:null};
drawForm()}
function readForm(){if(!draft)return;const g=id=>Q('#'+id);if(g('cn'))draft.name=g('cn').value;if(g('cw'))draft.win=g('cw').value;if(g('cq'))draft.qm=g('cq').value;if(g('ca'))draft.auto=+g('ca').value;if(g('cp'))draft.pw=g('cp').value}
function drawForm(){const d=draft,ed=!!d.edit,m=d.map;
draw(crumb('Multiplayer',ed?'Edit room':'Room')+'<div class="lzpn"><div class="lzfg"><div class="lzcol"><label class="lzl">TÊN PHÒNG<input id="cn" maxlength="30" value="'+E(d.name)+'"></label>'+
'<div class="lzl">LOẠI TRẬN<div class="lzgt"><button class="'+(!d.vs?'on':'')+'" data-a="gt" data-v="0" title="Head-to-Head">'+IC_H+'</button><button class="'+(d.vs?'on':'')+'" data-a="gt" data-v="1" title="Team Versus">'+IC_T+'</button></div><small class="lzy">'+(d.vs?'Team Versus':'Head-to-Head')+'</small></div>'+
'<label class="lzl">ĐIỀU KIỆN THẮNG<select id="cw">'+opts([['score','Score'],['acc','Accuracy'],['combo','Combo']],d.win)+'</select></label>'+
'<label class="lzl">QUEUE MODE<select id="cq">'+opts([['host','Host Only'],['all','All Players']],d.qm)+'</select></label>'+
'<label class="lzl">AUTO START<select id="ca">'+opts(AUTOS,d.auto)+'</select></label></div>'+
'<div class="lzcol"><div class="lzl">SỐ NGƯỜI CHƠI<div class="lzbox"><div class="lzrow"><span>Giới hạn slot</span>'+tgl('limited',d.limited)+'</div>'+(d.limited?'<div class="lzrow"><span>Tối đa</span><span class="lzstp"><button data-a="mxn" data-v="-1">−</button><b>'+d.max+'</b><button data-a="mxn" data-v="1">+</button></span></div>':'')+'</div></div>'+
'<label class="lzl">MẬT KHẨU (TÙY CHỌN)<input id="cp" type="password" maxlength="30" autocomplete="new-password" value="'+E(d.pw)+'" placeholder="'+(ed&&R.priv?'Để trống = giữ nguyên':'')+'"></label>'+(ed&&R.priv?'<button class="lzb sm" data-a="rmpw">Xóa mật khẩu</button>':'')+
'<div class="lzl">KHÁC<div class="lzbox"><div class="lzrow"><span>Tự động bỏ qua đoạn intro <small>(chưa hỗ trợ)</small></span>'+tgl('skip',d.skip,1)+'</div></div></div></div></div>'+
(ed?'':'<div class="lzmap"><div class="lzmc">'+(m?'<i class="lzdot" style="border-color:'+stCol(m.sr)+'"></i><div class="lzin"><b>'+E(m.artist)+' - '+E(m.title)+'</b><small>['+E(m.ver)+'] · '+mm(m.len||0)+'</small></div>'+STAR(m.sr):'<div class="lzin"><small>Chưa chọn beatmap (có thể thêm sau trong phòng)</small></div>')+'</div><button class="lzb pk wide" data-a="pick2">Chọn beatmap</button></div>')+
'<div class="mxe" id="mxer"></div><div class="lzcr"><button class="lzb yl big" data-a="'+(ed?'save':'mk')+'">'+(ed?'Lưu':'Tạo')+'</button></div></div>'+backBtn(ed?'room':'list'))}
async function mk(){readForm();const d=draft,n=(d.name||'').trim().slice(0,30);if(!n)return;const er=Q('#mxer');
try{const mp=d.map,room={name:n,hostUid:ME.uid,hostName:ME.name,priv:!!d.pw,state:'lobby',mode:mp&&mp.mode===1?1:0,mods:[],free:false,vs:d.vs?1:0,win:d.win,qm:d.qm==='all'?'all':'host',lastBy:'',map:mp||null,n:1,max:d.limited?d.max:MAXP,cdAt:null,cdMs:CD,auto:d.auto|0,skip:!!d.skip};const rid=await B().create(room,d.pw,ME,sha);draft=null;enter(rid)}catch(e){if(er)er.textContent='Không tạo được phòng: '+(e.message||e)}}
async function save(){readForm();const d=draft,n=(d.name||'').trim().slice(0,30);if(!n||!R)return;const er=Q('#mxer');
try{const cnt=Object.keys(PLY).length,max=d.limited?Math.max(d.max,cnt,2):MAXP;
await B().upRoom(RID,{name:n,vs:d.vs?1:0,win:d.win,qm:d.qm==='all'?'all':'host',auto:d.auto|0,skip:!!d.skip,max});
if(d.pw){await B().setPw(RID,d.pw,sha);await B().upRoom(RID,{priv:true})}
draft=null;autoAt=null;view='room';buildRoom();updRoom();updChat()}catch(e){if(er)er.textContent='Không lưu được: '+(e.message||e)}}
async function rmPw(){try{await B().setPw(RID,null,sha);await B().upRoom(RID,{priv:false});if(draft)draft.pw='';readForm();drawForm()}catch(e){const er=Q('#mxer');if(er)er.textContent='Không xóa được mật khẩu'}}
async function joinRoom(r,pw){err='';try{const ph=r.priv?await sha(r.id+':'+(pw||'')):null;await B().join(r.id,ME,ph);pwFor=null;enter(r.id)}catch(e){err=r.priv?'Sai mật khẩu, phòng đầy hoặc đã bắt đầu':'Không vào được phòng';view='list';drawList()}}
function stopSubs(){unsubs.forEach(f=>{try{f()}catch(e){}});unsubs=[]}
function enter(rid){stopSubs();RID=rid;R=null;QUE=[];PLY={};CHAT=[];LOC=null;OFFS=null;started=null;ended=false;view='room';buildRoom();
unsubs.push(B().room(rid,onRoom),B().players(rid,onPlayers),B().chat(rid,onChat),B().queue(rid,l=>{QUE=(l||[]).sort((a,b)=>(a.t||0)-(b.t||0));updQueue();scanQ();hostWatch()}));
timers.push(setInterval(tick,15000),setInterval(autoTick,1000));HIST=[];autoAt=null;draft=null;tab='queue'}
function buildRoom(){setH(mx(),'<div class="mxw lz rm">'+crumb('Multiplayer','Room')+'<div class="lzhd" id="lzhd"></div><div class="lzcols"><div class="lzc" id="mxpl"></div><div class="lzc" id="mxbm"></div><div class="lzc lzchat"><div class="lzk">Chat</div><div class="mxlog" id="mxlog"></div><input id="mxmsg" maxlength="200" placeholder="Gõ tin nhắn…" autocomplete="off"></div></div></div><div class="lzft" id="mxft"></div>'+backBtn('leave','Rời phòng'))}

function sameMap(a,b){return(!a&&!b)||(a&&b&&a.hash===b.hash)}
function onRoom(r){if(!r){if(RID){const was=RID;leaveLocal();err='Phòng đã đóng';open();}return}
const prev=R;R=r;if(!prev||!sameMap(prev.map,r.map)){checkHas().then(()=>{if(!LOC&&R&&R.map&&!DL.busy)autoFetch()})}else if(prev&&(prev.mode!==r.mode||JSON.stringify(prev.mods)!==JSON.stringify(r.mods)||prev.vs!==r.vs||prev.free!==r.free))resetReady();
if(r.state==='countdown'&&r.cdAt&&started!==r.cdAt)beginMatch(r);
if(r.state==='lobby'&&started!==null&&!ACT)started=null;
hostWatch();updRoom()}
function onPlayers(l){PLY={};l.forEach(p=>PLY[p.uid]=p);try{serve(l);recvWatch(l)}catch(e){}const me=ME&&PLY[ME.uid];if(me&&me.upd){const o=me.upd-Date.now();if(OFFS==null||o>OFFS)OFFS=o}
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

/* ===== Tự tải beatmap cho người chưa có =====
   1) Map chính thức (có BeatmapSetID): thử các mirror.
   2) Còn lại / mirror lỗi: nhận trực tiếp từ người chơi khác trong phòng qua WebRTC (Firestore làm kênh báo hiệu). */
const DL={busy:false,h:null,msg:'',n:'',onOffer:null,seen:false,cancel:null},SESS={};
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};
const MIRR=sid=>['https://api.nerinyan.moe/d/'+sid+'?noVideo=true','https://catboy.best/d/'+sid+'n','https://osu.direct/api/d/'+sid,'https://api.nerinyan.moe/d/'+sid,'https://catboy.best/d/'+sid];
const fmtB=b=>b>1048576?(b/1048576).toFixed(1)+' MB':Math.round(b/1024)+' KB';
let dlT=0;const dlMsg=m=>{DL.msg=m;const n=Date.now();if(n-dlT<120)return;dlT=n;document.querySelectorAll('[data-dlh]').forEach(e=>{if(e.dataset.dlh===DL.h)e.textContent=m})};
const want=h=>!!(RID&&R&&((R.map&&R.map.hash===h)||QUE.some(q=>q.hash===h)));
/* QL: hash -> {m,i} (có trong thư viện) | null (chưa có); LOC vẫn là bài đang chọn */
const QL={},FAIL={},DLD={};let lastHv='';
const localOf=h=>R&&R.map&&R.map.hash===h?LOC:(QL[h]||null);
async function scanQ(){if(!RID||!ME)return;for(const q of QUE){if(q.hash&&QL[q.hash]===undefined){try{QL[q.hash]=await findLocal(q)}catch(e){QL[q.hash]=null}}}
 const hv=Object.keys(QL).filter(k=>QL[k]).sort(),js=JSON.stringify(hv);if(js!==lastHv&&RID){lastHv=js;B().upMe(RID,ME.uid,{hv}).catch(()=>{})}updQueue()}
const resetQL=()=>{for(const k of Object.keys(QL))if(!QL[k])delete QL[k]};
const gather=pc=>new Promise(r=>{if(pc.iceGatheringState==='complete')return r();const f=()=>{if(pc.iceGatheringState==='complete'){pc.removeEventListener('icegatheringstatechange',f);r()}};pc.addEventListener('icegatheringstatechange',f);setTimeout(r,4000)});
const isZip=u=>u&&u.length>3&&u[0]===0x50&&u[1]===0x4b;
async function dlUrl(u){const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),60000);
 try{const r=await fetch(u,{signal:ctl.signal});if(!r.ok)throw Error('HTTP '+r.status);const len=+r.headers.get('content-length')||0,rd=r.body.getReader(),parts=[];let got=0;
  for(;;){const{done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;dlMsg('Đang tải beatmap từ mirror… '+(len?Math.round(got/len*100)+'%':fmtB(got)));if(got>200e6)throw Error('File quá lớn')}
  const out=new Uint8Array(got);let p=0;for(const a of parts){out.set(a,p);p+=a.length}if(!isZip(out))throw Error('Không phải file osz');return out.buffer}finally{clearTimeout(to)}}

/* Người nhận */
function p2pGet(h,t){return new Promise(async(res,rej)=>{
 const n=Math.random().toString(36).slice(2,10);DL.n=n;DL.seen=false;DL.snd=null;let pc=null,done=false,to=0,parts=[],size=0,rcv=0;
 const clean=()=>{clearTimeout(to);DL.onOffer=null;DL.cancel=null;try{pc&&pc.close()}catch(e){}const u={want:null};if(DL.snd)u['rtc.'+DL.snd]=null;B().upMe(RID,ME.uid,u).catch(()=>{})};
 const fail=e=>{if(done)return;done=true;clean();rej(e instanceof Error?e:Error(String(e)))};
 const bump=()=>{clearTimeout(to);to=setTimeout(()=>fail('hết thời gian chờ'),20000)};
 DL.cancel=()=>fail('đã hủy');
 DL.onOffer=async s=>{try{bump();DL.snd=s.uid;pc=new RTCPeerConnection(ICE);
   pc.ondatachannel=ev=>{const ch=ev.channel;ch.binaryType='arraybuffer';
    ch.onmessage=async m=>{if(done)return;bump();
     if(typeof m.data==='string'){size=JSON.parse(m.data).size||0;dlMsg('Đang tải từ '+(s.name||'người chơi')+'… 0%');return}
     parts.push(m.data);rcv+=m.data.byteLength;dlMsg('Đang tải từ '+(s.name||'người chơi')+'… '+(size?Math.round(rcv/size*100)+'%':fmtB(rcv)));
     if(size&&rcv>=size){done=true;clearTimeout(to);const all=new Uint8Array(size);let p=0;for(const b of parts){all.set(new Uint8Array(b),p);p+=b.byteLength}
      try{if(!isZip(all))throw Error('Dữ liệu nhận được bị lỗi');await imp(all.buffer);clean();res()}catch(e){clean();rej(e)}}};
    ch.onclose=()=>{if(!done)fail('người gửi ngắt kết nối')}};
   pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')fail('không kết nối được (NAT)')};
   await pc.setRemoteDescription({type:'offer',sdp:s.rtc[ME.uid].offer});const ans=await pc.createAnswer();await pc.setLocalDescription(ans);await gather(pc);
   await B().upMe(RID,ME.uid,{['rtc.'+s.uid]:{n,answer:pc.localDescription.sdp}})}catch(e){fail(e)}};
 try{bump();dlMsg('Đang tìm người chơi có beatmap…');await B().upMe(RID,ME.uid,{want:{h,n,t}})}catch(e){fail(e)}})}

/* Người gửi (người có map, ưu tiên host; thử lại thì xoay sang người khác) */
function serve(l){if(!RID||!ME||!R)return;
 for(const p of l){if(p.uid===ME.uid||!p.want||!localOf(p.want.h))continue;const hh=p.want.h,cur=R.map&&R.map.hash===hh;
  const c=l.filter(x=>x.uid!==p.uid&&(cur?x.has:(x.hv&&x.hv.includes(hh)))).map(x=>x.uid).sort();if(R.hostUid&&c.includes(R.hostUid)){c.splice(c.indexOf(R.hostUid),1);c.unshift(R.hostUid)}
  if(!c.length||c[(p.want.t||0)%c.length]!==ME.uid)continue;
  const k=p.uid+p.want.n;if(SESS[k])continue;SESS[k]={};startSend(p,k,localOf(hh))}
 for(const p of l){const r=p.rtc&&p.rtc[ME.uid],S=r&&SESS[p.uid+r.n];if(S&&S.pc&&!S.ans&&r.answer){S.ans=1;S.pc.setRemoteDescription({type:'answer',sdp:r.answer}).catch(()=>{})}}}
async function startSend(p,k,loc){let pc=null;const S=SESS[k];
 const end=()=>{try{pc&&pc.close()}catch(e){}if(RID&&ME)B().upMe(RID,ME.uid,{['rtc.'+p.uid]:null}).catch(()=>{});setTimeout(()=>delete SESS[k],5000)};
 try{const buf=await bufOf(loc.m);pc=new RTCPeerConnection(ICE);S.pc=pc;const ch=pc.createDataChannel('osz',{ordered:true});ch.binaryType='arraybuffer';ch.bufferedAmountLowThreshold=262144;
  ch.onopen=async()=>{try{ch.send(JSON.stringify({size:buf.byteLength}));const u=new Uint8Array(buf),C=16384;
    for(let o=0;o<u.length;o+=C){while(ch.bufferedAmount>1048576)await new Promise(r=>{ch.onbufferedamountlow=()=>{ch.onbufferedamountlow=null;r()}});ch.send(u.subarray(o,o+C))}
    while(ch.bufferedAmount>0)await new Promise(r=>setTimeout(r,100));setTimeout(end,15000)}catch(e){end()}};
  ch.onclose=()=>setTimeout(end,500);
  const off=await pc.createOffer();await pc.setLocalDescription(off);await gather(pc);
  await B().upMe(RID,ME.uid,{['rtc.'+p.uid]:{n:p.want.n,offer:pc.localDescription.sdp}});setTimeout(()=>{if(!S.ans)end()},30000)}catch(e){end()}}
function recvWatch(l){if(!DL.onOffer||DL.seen)return;for(const s of l){const r=s.uid!==ME.uid&&s.rtc&&s.rtc[ME.uid];if(r&&r.n===DL.n&&r.offer){DL.seen=true;DL.onOffer(s);return}}}

async function autoFetch(info){info=info||(R&&R.map);if(!info||!info.hash||!RID||!ME||DL.busy||localOf(info.hash))return false;const h=info.hash,isCur=()=>!!(R&&R.map&&R.map.hash===h);DL.busy=true;DL.h=h;dlMsg('Đang chuẩn bị tải beatmap…');updRoom();
 const got=async()=>{try{LIBC=null;LIBP=null}catch(x){}const r=await findLocal(info);if(isCur())LOC=r;QL[h]=r;return r};
 let ok=false;
 try{
  if(info.sid>0){for(const u of MIRR(info.sid)){if(!want(h)||ok)break;try{dlMsg('Đang tải beatmap từ mirror…');await imp(await dlUrl(u));ok=!!await got()}catch(e){}}}
  for(let t=0;t<3&&!ok&&want(h);t++){try{await p2pGet(h,t);ok=!!await got()}catch(e){dlMsg('Tải từ người chơi thất bại ('+(e.message||e)+')'+(t<2?', thử lại…':''))}}
 }finally{DL.busy=false}
 if(RID&&ME&&want(h)){if(isCur())B().upMe(RID,ME.uid,{has:isHost()?!!(LOC||!R.map):!!LOC,ready:isHost()}).catch(()=>{});
  DL.msg=ok?'':'Không tải tự động được (mirror/người chơi khác không phản hồi). Hãy thêm file .osz/.zip đúng bản.';if(ok){DLD[h]=1;delete FAIL[h]}else FAIL[h]=DL.msg}
 resetQL();scanQ();updRoom();return ok}
async function dlAll(){if(DL.busy||dlAll.run)return;dlAll.run=1;try{for(const q of QUE.slice()){if(!RID)break;if(q.hash&&QL[q.hash]===null&&!localOf(q.hash)){await autoFetch(q);updQueue()}}}finally{dlAll.run=0;updQueue()}}
async function checkHas(){const m=R&&R.map;LOC=m?await findLocal(m):null;if(RID&&ME)B().upMe(RID,ME.uid,{has:isHost()?!!(LOC||!m):!!LOC,ready:isHost()}).catch(()=>{});updRoom()}
function resetReady(){if(RID&&ME&&!isHost())B().upMe(RID,ME.uid,{ready:false}).catch(()=>{})}

function updRoom(){if(view==='item'&&R)return drawItem();if(view!=='room'||!R)return;
const h=isHost(),m=R.map,st=R.state,cnt=(m?1:0)+QUE.length,srs=[m?m.sr:null,...QUE.map(q=>q.sr)].filter(x=>x!=null),n=Object.keys(PLY).length||R.n||1;
setH(Q('#lzhd'),'<div class="lzhl"><div class="lzpills"><i class="lzp '+(R.priv?'pk':'gr')+'">'+(R.priv?'Private':'Open')+'</i>'+(st!=='lobby'?'<i class="lzp or">'+(st==='countdown'?'Sắp bắt đầu':'Đang chơi')+'</i>':'')+'</div><div class="lzrn">'+E(R.name)+'</div><div class="lzcur">'+(m?'Đang chọn: '+E(m.title)+' ['+E(m.ver)+']':'Chưa chọn beatmap')+'</div><div class="lzpills"><i class="lzp dk">'+(R.vs?'Team Versus':'Head-to-Head')+'</i><i class="lzp dk">'+(R.qm==='all'?'All Players':'Host Only')+'</i><i class="lzp dk">'+cnt+' Beatmap</i>'+(srs.length?STARR(Math.min(...srs),Math.max(...srs)):'')+'</div></div><div class="lzhr"><div class="lzhost">'+AV(R.hostName)+'<span>hosted by <b>'+E(R.hostName)+'</b></span></div><div class="lzcnt">'+IC_P+'<b>'+n+'</b>'+avs(n,R.hostName)+'</div>'+(h?'<button class="lzb pur" data-a="edit">Sửa</button>':'')+'</div>');
updQueue();updPlayers()}

const qdlBtn=q=>{if(!q.hash)return'';if(QL[q.hash])return DLD[q.hash]?'<span class="lzedt" title="Đã lưu vào Solo" style="width:auto;padding:0 8px;font-size:11px;background:#2e6b3f;line-height:28px">✓ Đã tải</span>':'';if(QL[q.hash]===undefined)return'<span class="lzedt" style="opacity:.5">…</span>';
 if(DL.busy&&DL.h===q.hash)return'<span class="lzedt mxdlq" data-dlh="'+E(q.hash)+'" style="width:auto;padding:0 8px;font-size:11px">'+E(DL.msg||'Đang tải…')+'</span>';
 return'<button class="lzedt" data-a="qdl" data-h="'+E(q.hash)+'" title="'+E(FAIL[q.hash]||'Tải cả bộ beatmap (mọi độ khó) và lưu vào Solo')+'"'+(DL.busy?' disabled':'')+' style="width:auto;padding:0 8px">⬇ '+(FAIL[q.hash]?'Tải lại':'Tải')+'</button>'};
function updQueue(){const el=Q('#mxbm');if(!el||!R)return;const h=isHost(),can=h||R.qm==='all',me=ME&&ME.uid,m=R.map,have=!!LOC,mods=R.mods||[],cnt=(m?1:0)+QUE.length,miss=QUE.filter(q=>q.hash&&QL[q.hash]===null).length;
let body='';
if(tab==='history'){body=HIST.map(x=>'<div class="lzit"><i class="lzdot" style="border-color:'+stCol(x.sr)+'"></i><div class="lzin"><b>'+E(x.artist)+' - '+E(x.title)+'</b><small>['+E(x.ver)+']</small></div>'+STAR(x.sr)+'</div>').join('')||'<div class="mxm">Chưa có bài nào được chơi</div>'}
else{
body=(m?'<div class="lzit cur"><i class="lzdot" style="border-color:'+stCol(m.sr)+'"></i><div class="lzin"><b>'+E(m.artist)+' - '+E(m.title)+'</b><small>['+E(m.ver)+'] · '+(R.mode===1?'mania 4K':'osu!')+' · '+mm(m.len||0)+(mods.length?' · '+mods.map(E).join(' '):'')+(R.free?' · Free mods':'')+'</small></div>'+STAR(m.sr)+(h?'<button class="lzedt" data-a="item" title="Sửa chế độ / mod">✎</button>':'')+'</div>'+(have?'':'<div class="mxe"><span id="mxdl" data-dlh="'+E(m.hash)+'">'+E(DL.msg||'Bạn chưa có beatmap này (cùng mã băm MD5).')+'</span><br>'+(DL.busy?'':'<button class="lzb sm" data-a="dlretry">Tải lại tự động</button> ')+'<label class="lzb sm mxfl">+ .osz / .zip<input id="mxf" type="file" multiple accept=".osz,.zip" hidden></label></div>'):'<div class="mxm">Host chưa chọn bài</div>')+
QUE.map(q=>'<div class="lzit"><i class="lzdot" style="border-color:'+stCol(q.sr)+'"></i><div class="lzin"><b>'+E(q.artist)+' - '+E(q.title)+'</b><small>['+E(q.ver)+'] · thêm bởi '+E(q.byName)+(q.hash&&QL[q.hash]===null?' · <span style="color:#ff8a8a">chưa có</span>':'')+'</small></div>'+STAR(q.sr)+qdlBtn(q)+(h?'<button class="lzedt" data-a="qnow" data-id="'+E(q.id)+'" title="Phát ngay">▶</button>':'')+(h||q.by===me?'<button class="lzedt" data-a="qdel" data-id="'+E(q.id)+'" title="Xóa">✕</button>':'')+'</div>').join('')}
setH(el,'<div class="lzk">Beatmap</div>'+(can?'<button class="lzb pur wide" data-a="pick">Thêm bài</button>':'')+(miss?'<button class="lzb sm wide" data-a="dlall"'+(DL.busy?' disabled':'')+'>⬇ Tải tất cả ('+miss+' bài chưa có)</button>':'')+'<div class="lztabs"><button class="lztab'+(tab==='queue'?' on':'')+'" data-a="tab" data-v="queue">Queue ('+cnt+')</button><button class="lztab'+(tab==='history'?' on':'')+'" data-a="tab" data-v="history">History</button></div><div class="lzlist">'+body+'</div>');
const fi=Q('#mxf');if(fi)fi.onchange=async e=>{for(const f of e.target.files){try{await imp(await f.arrayBuffer())}catch(x){}}try{LIBC=null;LIBP=null}catch(x){}resetQL();checkHas();scanQ()}}

function updPlayers(){if(view!=='room'||!R)return;const l=Object.values(PLY).sort((a,b)=>(a.joined||0)-(b.joined||0)),me=ME&&PLY[ME.uid],lob=R.state==='lobby',h=isHost();
let pl='<div class="lzk">Participants <b>'+l.length+'</b></div>'+(l.map(p=>{const host=p.uid===R.hostUid,s=!p.has?'<i class="lzs bad">Thiếu map</i>':host?'<i class="lzs ok">Host</i>':p.ready?'<i class="lzs ok">Sẵn sàng</i>':'<i class="lzs">Chưa sẵn sàng</i>';
return'<div class="lzpr'+(p.uid===(ME&&ME.uid)?' me':'')+(p.has&&(p.ready||host)?' rdy':'')+'"><span class="lzcr0">'+(host?'♛':'')+'</span>'+AV(p.name)+'<span class="lzpn2">'+(R.vs?'<em class="lzt'+teamOf(p)+'">'+teamOf(p)+'</em>':'')+E(p.name)+'</span>'+s+'</div>'}).join('')||'<div class="mxm">…</div>');
if(R.vs&&lob&&me)pl+='<button class="lzb sm" data-a="team">Đội của bạn: '+teamOf(me)+' (đổi)</button>';
if(R.free&&me){const pm=okMods(me.mods),mods=R.mods||[];pl+='<div class="lzk">Mod của bạn</div><div class="mxch">'+MODL.map(q=>{const blk=mods.some(x=>(CONF[q[0]]||[]).includes(x));return'<button class="mxc2'+(pm.includes(q[0])?' on':'')+'"'+(blk||mods.includes(q[0])||!lob?' disabled':' data-a="pmod" data-v="'+q[0]+'"')+' title="'+q[1]+'">'+q[0]+'</button>'}).join('')+'</div>'}
setH(Q('#mxpl'),pl);
const spOk=R.state==='playing'||R.state==='countdown',sp='<button class="lzspec" data-a="spec"'+(spOk?'':' disabled')+'>Quan sát</button>',clk='<span class="lzclk" id="lzclk" title="Auto start">⏱'+(R.auto?' '+aLbl(R.auto):'')+'</span>';let f='';
if(h){const others=l.filter(p=>p.uid!==ME.uid),ok=lob&&R.map&&LOC&&others.every(p=>p.ready&&p.has),hint=!R.map?'Hãy chọn bài trước':!LOC?(DL.busy?'Đang tải beatmap…':'Bạn chưa có beatmap này'):!others.every(p=>p.has)?'Có người thiếu beatmap':!others.every(p=>p.ready)?'Chờ mọi người sẵn sàng':!lob?'Trận đang diễn ra':'';
f=sp+'<button class="lzgo"'+(ok?'':' disabled')+' data-a="start">Bắt đầu'+(hint?'<small>'+hint+'</small>':'')+'</button>'+clk}
else f=sp+'<button class="lzgo'+(me&&me.ready?' on':'')+'"'+(lob&&LOC&&R.map?'':' disabled')+' data-a="ready">'+(me&&me.ready?'Hủy sẵn sàng':'Sẵn sàng')+'</button>'+clk;
setH(Q('#mxft'),f)}

function updChat(){const el=Q('#mxlog');if(!el)return;const bot=el.scrollTop+el.clientHeight>=el.scrollHeight-30;setH(el,CHAT.map(c=>'<div class="mxcm"><b>'+E(c.name)+':</b> '+E(c.text)+'</div>').join('')||'<div class="mxm">Chưa có tin nhắn</div>');if(bot)el.scrollTop=el.scrollHeight}
function send(){const i=Q('#mxmsg');if(!i||!RID)return;const t=i.value.trim().slice(0,200);if(!t||Date.now()-lastSay<400)return;lastSay=Date.now();i.value='';B().say(RID,ME,t).catch(()=>{})}

function drawItem(){const mods=R.mods||[],md=R.mode===1?1:0;
draw(crumb('Multiplayer','Item')+'<div class="lzpn"><div class="lzl">CHẾ ĐỘ</div><div class="mxch">'+['osu!','mania 4K'].map((n,i)=>'<button class="mxc2'+(md===i?' on':'')+'" data-a="mode" data-v="'+i+'">'+n+'</button>').join('')+'</div><div class="lzl">MOD BẮT BUỘC</div><div class="mxch">'+MODL.map(q=>'<button class="mxc2'+(mods.includes(q[0])?' on':'')+'" data-a="mod" data-v="'+q[0]+'" title="'+q[1]+'">'+q[0]+'</button>').join('')+'</div><div class="lzl">FREE MODS</div><div class="lzrow"><span>Cho phép mỗi người chọn mod riêng</span>'+tgl('free',!!R.free)+'</div><small>Cấm: Auto, Relax, Autopilot, Cinema. Mod xung đột tự tắt.</small></div>'+backBtn('room'))}

async function openPick(mode){pickFor=mode||'room';view='pick';pickList=null;draw(crumb('Multiplayer','Chọn beatmap')+'<div id="mxpk" class="mxrl"><div class="mxm">Đang tải…</div></div>'+backBtn(pickFor==='create'?'form':'room'));pickList=await dbAll();if(view!=='pick')return;
setH(Q('#mxpk'),pickList.map(m=>'<div class="lzit pk"><div class="lzin"><b>'+E(m.title)+'</b><small>'+E(m.artist)+'</small></div><div class="mxd">'+m.vers.map((v,i)=>'<button class="mxc2" data-a="song" data-m="'+E(m.id)+'" data-v="'+i+'">'+E(v.ver)+' ★'+(v.sr||0).toFixed(1)+'</button>').join('')+'</div></div>').join('')||'<div class="mxm">Chưa có beatmap nào. Hãy thêm file .osz ở màn Solo.</div>')}
async function song(mid,i){const m=(pickList||[]).find(x=>x.id===mid);if(!m)return;const v=m.vers[i];
if(pickFor!=='create'){view='room';buildRoom();updRoom();updChat();updQueue()}
try{const h=await hashOf(m,v),mp={hash:h,sid:m.sid||0,title:m.title,artist:m.artist,ver:v.ver,sr:Math.round((v.sr||0)*100)/100,len:v.len||0,mode:v.mode||0};
if(pickFor==='create'){if(draft)draft.map=mp;view=draft&&draft.edit?'edit':'new';drawForm();return}
if(isHost()&&!R.map&&R.state==='lobby')await B().upRoom(RID,{map:mp});else if(isHost()||R.qm==='all')await B().qadd(RID,{...mp,by:ME.uid,byName:ME.name})}catch(e){}}
function autoTick(){const c=Q('#lzclk');if(!R||!RID||!isHost()||R.state!=='lobby'||!R.map||!R.auto||!LOC){autoAt=null;if(c)c.textContent='⏱'+(R&&R.auto?' '+aLbl(R.auto):'');return}
if(autoMap!==R.map.hash){autoMap=R.map.hash;autoAt=null}if(!autoAt)autoAt=Date.now()+R.auto*1000;const rem=Math.ceil((autoAt-Date.now())/1000);if(c)c.textContent='⏱ '+Math.max(0,rem)+'s';
if(rem<=0){autoAt=null;if(Object.values(PLY).filter(p=>p.uid!==ME.uid).every(p=>p.ready&&p.has))start()}}
function toggleMod(k){if(!ALLOW.includes(k))return;let a=okMods(R.mods);if(a.includes(k))a=a.filter(x=>x!==k);else{a=a.filter(x=>!(CONF[k]||[]).includes(x));a.push(k)}B().upRoom(RID,{mods:a}).catch(()=>{})}

function pmod(k){const me=PLY[ME.uid];if(!me||!ALLOW.includes(k)||R.state!=='lobby')return;let a=okMods(me.mods);if(a.includes(k))a=a.filter(x=>x!==k);else{a=a.filter(x=>!(CONF[k]||[]).includes(x));a.push(k)}B().upMe(RID,ME.uid,{mods:a}).catch(()=>{})}
function start(){if(!isHost()||!R||!R.map||R.state!=='lobby')return;B().upRoom(RID,{state:'countdown',cdAt:'$ts',cdMs:CD}).catch(()=>{})}
async function beginMatch(r){started=r.cdAt;if(r.map&&!(HIST[0]&&HIST[0].t===r.cdAt))HIST.unshift({...r.map,t:r.cdAt});if(!LOC)return;ACT=true;ended=false;startLocal=r.cdAt+(r.cdMs||CD)-offs();bak={mods:[...MODS],mania:MANIA};MODS.clear();myMods(PLY[ME.uid]).forEach(m=>MODS.add(m));MANIA=r.mode===1;
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
function back(){try{sndLongStop()}catch(e){}ACT=false;restore();hudOff();if(RID&&R){view='room';mx().style.display='flex';buildRoom();updRoom();updPlayers();updChat();if(R.state!=='lobby'&&R.state!=='countdown'){}}else{leaveLocal();open()}}
function quit(){if(Q('#mpq'))return;const q=document.createElement('div');q.id='mpq';q.innerHTML=tr('<div class="mxw"><b>Rời trận đấu?</b><small>Điểm hiện tại sẽ được ghi nhận và bạn bị tính là đã rời.</small><div><button class="mxbt s" data-a="qk">Tiếp tục</button><button class="mxbt" data-a="ql">Rời trận</button></div></div>');q.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==='qk')q.remove();if(a==='ql'){q.remove();const p=P;if(p){fin({score:p.score,max:p.max,acc:accOf(p),rk:'F',fail:true,left:true});endPlay()}}};document.body.appendChild(q)}

function leaveLocal(){try{DL.cancel&&DL.cancel()}catch(e){}DL.busy=false;DL.msg='';for(const k of Object.keys(QL))delete QL[k];for(const k of Object.keys(FAIL))delete FAIL[k];for(const k of Object.keys(DLD))delete DLD[k];lastHv='';stopSubs();timers.forEach(t=>clearInterval(t));timers=[setInterval(push,PUSH)];ACT=false;restore();hudOff();RID=null;R=null;QUE=[];PLY={};CHAT=[];LOC=null;started=null;joinedSeen=false}
async function leave(){const rid=RID,host=isHost(),uids=Object.keys(PLY);try{if(host)await B().close(rid,uids,QUE.map(q=>q.id));else await B().leave(rid,ME.uid)}catch(e){}leaveLocal();err='';open()}
function closeAll(){stopSubs();const x=Q('#mpx');if(x)x.style.display='none';if(typeof menu==='function'&&!document.getElementById('mb'))menu()}

function click(e){const t=e.target.closest('[data-a]');if(!t||t.disabled)return;const a=t.dataset.a,v=t.dataset.v,hostUp=p=>{if(isHost())B().upRoom(RID,p).catch(()=>{})};
const toRoom=()=>{draft=null;view='room';buildRoom();updRoom();updChat()};
if(a==='qdl'){const q=QUE.find(x=>x.hash===t.dataset.h);if(q){DL.msg='';delete FAIL[q.hash];autoFetch(q).then(()=>updQueue())}}else if(a==='dlall')dlAll();else if(a==='dlretry'){DL.msg='';autoFetch()}else if(a==='close')closeAll();else if(a==='login')ON.panel(()=>open());else if(a==='new'){draft=null;showCreate(false)}else if(a==='edit'){if(isHost()){draft=null;showCreate(true)}}
else if(a==='list'){draft=null;view='list';draw()}else if(a==='mk')mk();else if(a==='save')save();else if(a==='rmpw')rmPw();
else if(a==='gt'){readForm();draft.vs=+v?1:0;drawForm()}else if(a==='tgl'){if(view==='item'){hostUp({free:!R.free})}else{readForm();draft[v]=!draft[v];drawForm()}}
else if(a==='mxn'){readForm();draft.max=Math.max(2,Math.min(MAXP,draft.max+(+v)));drawForm()}
else if(a==='pick2'){readForm();openPick('create')}else if(a==='form'){view=draft&&draft.edit?'edit':'new';drawForm()}
else if(a==='item'){if(isHost()){view='item';drawItem()}}else if(a==='tab'){tab=v;updQueue()}
else if(a==='spec'){if(R&&R.state!=='lobby'){view='res';drawRes()}}
else if(a==='join'){const r=RL.find(x=>x.id===t.dataset.id);if(!r||r.state!=='lobby'||(r.n||1)>=(r.max||MAXP))return;if(r.priv){pwFor=r;err='';drawList()}else joinRoom(r)}
else if(a==='pwgo'){const i=Q('#pwi');if(pwFor)joinRoom(pwFor,i?i.value:'')}else if(a==='pwx'){pwFor=null;drawList()}
else if(a==='leave')leave();else if(a==='send')send();else if(a==='pick')openPick('room');else if(a==='room')toRoom();
else if(a==='song')song(t.dataset.m,+v);else if(a==='mode')hostUp({mode:+v});else if(a==='mod'){if(isHost())toggleMod(v)}
else if(a==='pmod')pmod(v);else if(a==='team'){const me=PLY[ME.uid];if(me&&R.state==='lobby')B().upMe(RID,ME.uid,{team:teamOf(me)==='A'?'B':'A'}).catch(()=>{})}
else if(a==='qdel')B().qdel(RID,t.dataset.id).catch(()=>{});else if(a==='qnow'){const q=QUE.find(x=>x.id===t.dataset.id);if(isHost()&&q&&R.state==='lobby'){const{id,by,byName,t:_t,...mp}=q;B().upRoom(RID,{map:mp,lastBy:by}).then(()=>B().qdel(RID,id)).catch(()=>{})}}
else if(a==='ready'){const me=PLY[ME.uid];if(me&&LOC)B().upMe(RID,ME.uid,{ready:!me.ready}).catch(()=>{})}else if(a==='start')start();else if(a==='back')back()}

return{open,get active(){return ACT},seekMs,quit,fin,back,_md5:md5,_s:()=>({R,PLY,LOC,view,RID})}})();
window.MPL=MPL;
