// ---------- Online: tài khoản + bảng xếp hạng + PP (Firebase Auth + Firestore) ----------
// Không có Firebase config -> game chạy offline như cũ, mọi hàm ở đây đều "tắt" an toàn.
const ON=(()=>{
const CFG=window.OSUI_FIREBASE||{},CDN='https://www.gstatic.com/firebasejs/10.14.1/';
const ready=()=>!!(CFG.apiKey&&CFG.projectId&&!/^YOUR_/.test(CFG.apiKey));
let LIB=null,A=null,D=null,CU=null,PROF=null,STARTED=false;const subs=new Set();
const NAME_RE=/^[A-Za-z0-9_.\-]{3,16}$/;
const notify=()=>subs.forEach(f=>{try{f()}catch(e){}});
function lib(){if(LIB)return LIB;LIB=(async()=>{const[a,au,fs]=await Promise.all([import(CDN+'firebase-app.js'),import(CDN+'firebase-auth.js'),import(CDN+'firebase-firestore.js')]);const app=a.initializeApp(CFG);A=au.getAuth(app);D=fs.getFirestore(app);try{A.languageCode='vi'}catch(e){}return{au,fs}})();LIB.catch(()=>{LIB=null});return LIB}
const EM={'auth/email-already-in-use':'Email này đã được đăng ký','auth/invalid-email':'Email không hợp lệ','auth/weak-password':'Mật khẩu quá yếu (tối thiểu 6 ký tự)','auth/wrong-password':'Sai email hoặc mật khẩu','auth/invalid-credential':'Sai email hoặc mật khẩu','auth/user-not-found':'Sai email hoặc mật khẩu','auth/too-many-requests':'Thử quá nhiều lần, hãy đợi một lúc rồi thử lại','auth/network-request-failed':'Không có mạng','auth/user-disabled':'Tài khoản đã bị khóa'};
const emsg=e=>EM[e&&e.code]||(e&&e.message)||'Có lỗi xảy ra';
async function loadProf(){PROF=null;if(!CU)return;try{const{fs}=await lib();const s=await fs.getDoc(fs.doc(D,'users',CU.uid));PROF=s.exists()?s.data():null}catch(e){}}
async function init(){if(!ready()||STARTED)return;STARTED=true;try{const{au}=await lib();au.onAuthStateChanged(A,async u=>{CU=u;await loadProf();notify();if(CU&&CU.emailVerified)flush()})}catch(e){STARTED=false}}
const user=()=>CU?{uid:CU.uid,email:CU.email,verified:CU.emailVerified,name:(PROF&&PROF.name)||'',ppStd:(PROF&&PROF.pp_std)||0,ppMania:(PROF&&PROF.pp_mania)||0,plays:(PROF&&PROF.plays)||0}:null;
async function register(email,name,pass){const{au,fs}=await lib();email=String(email||'').trim();name=String(name||'').trim();
 if(CFG.onlyGmail&&!/@gmail\.com$/i.test(email))throw new Error('Chỉ nhận địa chỉ @gmail.com');
 if(!NAME_RE.test(name))throw new Error('Tên 3–16 ký tự: chữ, số, _ . -');
 if(String(pass||'').length<6)throw new Error('Mật khẩu tối thiểu 6 ký tự');
 const key=name.toLowerCase();
 try{if((await fs.getDoc(fs.doc(D,'usernames',key))).exists())throw new Error('Tên này đã có người dùng')}catch(e){if(!e.code)throw e}
 let cr;try{cr=await au.createUserWithEmailAndPassword(A,email,pass)}catch(e){throw new Error(emsg(e))}
 try{const b=fs.writeBatch(D);b.set(fs.doc(D,'usernames',key),{uid:cr.user.uid});b.set(fs.doc(D,'users',cr.user.uid),{name,nameLower:key,pp_std:0,pp_mania:0,plays:0,created:Date.now()});await b.commit()}
 catch(e){try{await au.deleteUser(cr.user)}catch(_){}throw new Error('Không tạo được hồ sơ (tên có thể vừa bị người khác lấy)')}
 try{await au.sendEmailVerification(cr.user)}catch(e){}
 CU=cr.user;await loadProf();notify()}
async function login(email,pass){const{au}=await lib();try{await au.signInWithEmailAndPassword(A,String(email||'').trim(),pass)}catch(e){throw new Error(emsg(e))}}
async function logout(){const{au}=await lib();await au.signOut(A)}
async function resend(){const{au}=await lib();if(!CU)return;try{await au.sendEmailVerification(CU)}catch(e){throw new Error(emsg(e))}}
async function recheck(){const{au}=await lib();if(!CU)return false;await CU.reload();await CU.getIdToken(true);CU=A.currentUser;await loadProf();notify();if(CU&&CU.emailVerified)flush();return !!(CU&&CU.emailVerified)}
async function reset(email){const{au}=await lib();try{await au.sendPasswordResetEmail(A,String(email||'').trim())}catch(e){throw new Error(emsg(e))}}
// ---- hash map (SHA-256 của file .osu) ----
async function hash(u8){try{const d=await crypto.subtle.digest('SHA-256',u8);return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32)}catch(e){let a=2166136261,b=5381;for(const x of u8){a^=x;a=Math.imul(a,16777619);b=((b<<5)+b+x)|0}return(a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0')+u8.length.toString(16).padStart(16,'0')}}
// ---- PP (công thức riêng của Osui!, không phải PP chính thức của osu!) ----
const BAD=['RX','AP','AT','CN','TP'],MP={DT:1.1,NC:1.1,HR:1.05,HD:1.03,FL:1.1,EZ:.9,NF:.9,HT:.6,SO:.9};
const modsOf=p=>p.mo.filter(k=>!p.mn||MD.find(m=>m[0]===k)[3]);
const eligible=p=>!!p&&!p.rp&&!p.auto&&modsOf(p).every(k=>BAD.indexOf(k)<0);
function calcPP(p,acc){const mn=!!p.mn,n=p.n,miss=mn?n[0]:n[3],objs=Math.max(1,n.reduce((a,b)=>a+b,0)),sr=calcSR(p.M),len=.9+.2*Math.min(1,objs/1500);
 const base=mn?8.5*Math.pow(sr,2.2):9*Math.pow(sr,2.3),af=Math.pow(acc,mn?14:12),cf=miss===0?1:Math.pow(Math.max(0,Math.min(1,p.max/objs)),.8),mp=Math.pow(.97,miss);
 let m=1;for(const k of modsOf(p))m*=MP[k]||1;
 return Math.max(0,Math.round(base*len*af*cf*mp*m*100)/100)}
// ---- gửi điểm ----
const PEND='osui_pend';
const pend=()=>{try{return JSON.parse(localStorage.getItem(PEND)||'[]')}catch(e){return[]}},setPend=a=>{try{localStorage.setItem(PEND,JSON.stringify(a.slice(-20)))}catch(e){}};
async function push(r){const{fs}=await lib(),u=CU;if(!u)return{ok:false,why:'login'};if(!u.emailVerified)return{ok:false,why:'verify'};if(!PROF)await loadProf();if(!PROF)return{ok:false,why:'noprof'};
 const key=u.uid+'_'+r.hash+'_'+r.mode,ref=fs.doc(D,'scores',key),old=await fs.getDoc(ref);
 const doc={uid:u.uid,name:PROF.name,map:r.hash,mode:r.mode,title:r.title,artist:r.artist,ver:r.ver,sr:r.sr,score:r.score,acc:r.acc,combo:r.combo,rk:r.rk,mods:r.mods,pp:r.pp,n:r.n,cv:r.cv,date:r.date};
 await fs.addDoc(fs.collection(D,'plays'),doc);
 const best=!old.exists()||old.data().score<r.score;let total=null;
 if(best){await fs.setDoc(ref,doc);const q=fs.query(fs.collection(D,'scores'),fs.where('uid','==',u.uid),fs.where('mode','==',r.mode),fs.orderBy('pp','desc'),fs.limit(100)),s=await fs.getDocs(q);let t=0,i=0;s.forEach(d=>{t+=(d.data().pp||0)*Math.pow(.95,i++)});total=Math.round(t*100)/100;
  await fs.updateDoc(fs.doc(D,'users',u.uid),{[r.mode?'pp_mania':'pp_std']:total,plays:fs.increment(1)});PROF[r.mode?'pp_mania':'pp_std']=total}
 else await fs.updateDoc(fs.doc(D,'users',u.uid),{plays:fs.increment(1)});
 PROF.plays=(PROF.plays||0)+1;notify();return{ok:true,best,total}}
let FL=false;async function flush(){if(FL)return;FL=true;try{let a=pend();const keep=[];for(const r of a){if(r.uid!==(CU&&CU.uid))continue;try{await push(r)}catch(e){keep.push(r)}}setPend(keep)}finally{FL=false}}
function afterPlay(p,acc,rk,pp){const st=document.getElementById('rps');const say=t=>{const e=document.getElementById('rps');if(e)e.textContent=t};
 if(!ready()||!eligible(p)||!CURHASH)return;const r={hash:CURHASH,mode:p.mn?1:0,title:(p.M.title||'').slice(0,120),artist:(p.M.artist||'').slice(0,120),ver:(p.M.ver||'').slice(0,120),sr:calcSR(p.M),score:p.score,acc,combo:p.max,rk,mods:modsOf(p),pp,n:p.n.slice(),cv:p.M.cv?1:0,date:Date.now()};
 const u=user();if(!u)return say('Đăng nhập (biểu tượng người ở góc trên) để lưu điểm lên bảng xếp hạng');if(!u.verified)return say('Hãy xác minh email để điểm được tính lên bảng xếp hạng');
 r.uid=u.uid;say('Đang gửi điểm…');
 push(r).then(x=>{if(!x.ok)return say('Chưa gửi được điểm');say(x.best?'Kỷ lục mới! Tổng PP '+x.total.toFixed(2):'Đã lưu lịch sử chơi')}).catch(e=>{const a=pend();a.push(r);setPend(a);say('Chưa gửi được điểm (sẽ thử lại sau)')})}
async function board(h,mode){if(!ready())throw new Error('off');const{fs}=await lib();const q=fs.query(fs.collection(D,'scores'),fs.where('map','==',h),fs.where('mode','==',mode),fs.orderBy('score','desc'),fs.limit(50)),s=await fs.getDocs(q),a=[];s.forEach(d=>a.push(d.data()));return a}
// ---- bảng tài khoản trong game ----
const PERSON='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
function panel(done){if(document.getElementById('mp'))return;const o=document.createElement('div');o.id='mp';o.className='half';let tab='in',busy=false,msg='',good=false;const F={e:'',n:''};
 const set=(t,g)=>{msg=t;good=!!g;draw()},run=async(f,okMsg)=>{if(busy)return;busy=true;set('…');try{await f();set(okMsg||'',true)}catch(e){set(e.message||'Có lỗi',false)}busy=false;draw()};
 function draw(){const u=user(),b='style="width:auto;min-height:0;padding:8px 14px"';let h='<div class="mpi"><div class="mph">'+PERSON+' Tài khoản</div><div class="sl">';
  if(!ready())h+='<div class="sr"><small>Tính năng online chưa được bật (chưa cấu hình Firebase).</small></div>';
  else if(!u)h+='<div class="sr" style="gap:6px"><button class="mb'+(tab==='in'?' on':'')+'" data-t="in" style="flex:1">Đăng nhập</button><button class="mb'+(tab==='up'?' on':'')+'" data-t="up" style="flex:1">Đăng ký</button></div><div class="fr"><input class="fi" id="acE" type="email" autocomplete="email" autocapitalize="off" placeholder="Email'+(CFG.onlyGmail?' (@gmail.com)':'')+'" value="'+esc(F.e)+'">'+(tab==='up'?'<input class="fi" id="acN" type="text" autocomplete="username" autocapitalize="off" maxlength="16" placeholder="Tên người chơi (3–16 ký tự)" value="'+esc(F.n)+'">':'')+'<input class="fi" id="acP" type="password" autocomplete="'+(tab==='up'?'new-password':'current-password')+'" placeholder="Mật khẩu">'+(tab==='up'?'<input class="fi" id="acQ" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu">':'')+'</div><div class="sr"><button class="mb on" id="acGo" style="flex:1">'+(tab==='in'?'Đăng nhập':'Tạo tài khoản')+'</button></div>'+(tab==='in'?'<div class="sr"><span></span><button class="mb" id="acRs" '+b+'>Quên mật khẩu</button></div>':'<div class="sr"><small>Sau khi đăng ký, một email xác minh sẽ được gửi tới hộp thư của bạn.</small></div>');
  else if(!u.verified)h+='<div class="sr"><span>'+esc(u.name||u.email)+'</span></div><div class="sr"><small class="er">Email chưa được xác minh. Mở hộp thư (Gmail) của <b>'+esc(u.email)+'</b>, bấm vào liên kết xác minh (kiểm tra cả thư rác), rồi bấm nút bên dưới.</small></div><div class="sr"><button class="mb on" id="acOk" style="flex:1">Tôi đã xác minh</button></div><div class="sr"><button class="mb" id="acRe" '+b+'>Gửi lại email</button><button class="mb" id="acOut" '+b+'>Đăng xuất</button></div>';
  else h+='<div class="sr"><span>Người chơi</span><b>'+esc(u.name)+'</b></div><div class="sr"><span>PP osu!</span><b>'+u.ppStd.toFixed(2)+'</b></div><div class="sr"><span>PP mania 4K</span><b>'+u.ppMania.toFixed(2)+'</b></div><div class="sr"><span>Số lần chơi</span><b>'+u.plays+'</b></div>'+(CFG.webUrl?'<div class="sr"><span>Hồ sơ &amp; bảng xếp hạng</span><a class="mb" '+b+' href="'+esc(CFG.webUrl)+'rank.html#me" target="_blank" rel="noopener">Mở trên web</a></div>':'')+'<div class="sr"><span>'+esc(u.email)+'</span><button class="mb" id="acOut" '+b+'>Đăng xuất</button></div>';
  if(msg)h+='<div class="sr"><small class="'+(good?'ok':'er')+'">'+esc(msg)+'</small></div>';
  o.innerHTML=h+'</div><button id="mx">'+ico('back')+' Back</button></div>';
  const q=s=>o.querySelector(s),on=(s,f)=>{const e=q(s);if(e)e.onclick=f};
  o.querySelectorAll('[data-t]').forEach(e=>e.onclick=()=>{tab=e.dataset.t;msg='';draw()});
  ['acE','acN'].forEach(i=>{const e=q('#'+i);if(e)e.oninput=()=>{F[i==='acE'?'e':'n']=e.value}});
  on('#acGo',()=>{const e=q('#acE').value,p=q('#acP').value;if(tab==='in')return run(()=>login(e,p));const n=q('#acN').value;if(p!==q('#acQ').value)return set('Mật khẩu nhập lại không khớp');run(()=>register(e,n,p),'Đã gửi email xác minh. Hãy mở Gmail và bấm vào liên kết.')});
  on('#acRs',()=>{const e=q('#acE').value;if(!e)return set('Nhập email trước');run(()=>reset(e),'Đã gửi email đặt lại mật khẩu')});
  on('#acOk',()=>run(async()=>{if(!await recheck())throw new Error('Chưa thấy xác minh. Hãy bấm liên kết trong email rồi thử lại.')},'Đã xác minh!'));
  on('#acRe',()=>run(resend,'Đã gửi lại email xác minh'));on('#acOut',()=>run(logout));
  on('#mx',()=>{subs.delete(draw);o.remove();done&&done()})}
 subs.add(draw);draw();ui.appendChild(o)}
return{panelIcon:PERSON,ready,init,user,register,login,logout,resend,recheck,reset,hash,eligible,calcPP,afterPlay,board,panel,sub:f=>subs.add(f),unsub:f=>subs.delete(f),cfg:CFG}})();
try{ON.init()}catch(e){}
