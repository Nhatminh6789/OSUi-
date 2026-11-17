/* Touhosu mode (plugin). Chỉ hoạt động khi người dùng thêm file osu.Game.Rulesets.Touhosu.dll trong Cài đặt.
   File .dll là assembly .NET của osu!lazer nên trình duyệt không chạy được; game đọc ảnh/âm thanh nhúng trong file
   rồi chạy luật Touhosu (né đạn) viết lại bằng JavaScript. */
(()=>{
const LS='osui_th',K={cnt:1,dim:60};try{Object.assign(K,JSON.parse(localStorage.getItem(LS)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(K))}catch(e){}};
const TH=window.TH={on:false,A:null,msg:''};
const CNT=[['Ít',.67],['Vừa',1],['Nhiều',1.67]],COL=['#ff5a8a','#5ab4ff','#ffd84d','#7dff9a'];
const latin=b=>{let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return s};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
TH.installed=()=>!!K.dll&&!!TH.A;
TH.icon=()=>TH.A&&TH.A.logoUrl||'assets/icon-play.png';
TH.set=v=>{TH.on=!!v&&TH.installed();K.on=TH.on?1:0;save();if(TH.on&&typeof setMania==='function')setMania(false)};
window.thSet=TH.set;

/* ---------- đọc tài nguyên nhúng trong .dll ---------- */
function parse(b){const s=latin(b),pngs=[],sig='\x89PNG\r\n\x1a\n';let i=0;
 while((i=s.indexOf(sig,i))>=0){const L=b[i-4]|b[i-3]<<8|b[i-2]<<16|b[i-1]<<24;if(L>0&&L<2e6)pngs.push(b.slice(i,i+L));i+=8}
 let mp3=null;const k=s.indexOf('ID3');if(k>3){const L=b[k-4]|b[k-3]<<8|b[k-2]<<16|b[k-1]<<24;if(L>0&&L<2e6)mp3=b.slice(k,k+L)}
 return{pngs,mp3,ok:b[0]===77&&b[1]===90&&s.indexOf('osu.Game.Rulesets.Touhosu')>=0}}
async function build(b){const p=parse(b);if(!p.ok)throw Error('Không phải file chế độ được hỗ trợ (hiện chỉ hỗ trợ Touhosu)');
 const im=await Promise.all(p.pngs.map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null)));
 const A={ok:im.length===32};if(!A.ok)throw Error('File Touhosu không đúng phiên bản (cần 32 ảnh, tìm thấy '+im.length+')');
 A.hp=im.slice(0,5);A.card=im[6];A.focus=im[7];A.idle=im.slice(8,16);A.left=im.slice(16,21);A.right=im.slice(21,26);
 A.pj={grain:{ov:im[26],tx:im[27],r:5},knife:{ov:im[28],tx:im[29],r:5},sphere:{ov:im[30],tx:im[31],r:7}};
 try{const lc=document.createElement('canvas');lc.width=lc.height=128;lc.getContext('2d').drawImage(im[5],0,0,128,128);A.logoUrl=lc.toDataURL()}catch(e){}
 if(p.mp3&&window.ac){try{A.graze=await new Promise((r,j)=>{const q=ac.decodeAudioData(p.mp3.buffer.slice(p.mp3.byteOffset,p.mp3.byteOffset+p.mp3.byteLength),r,j);if(q&&q.catch)q.catch(j)})}catch(e){}}
 return A}
async function load(){if(!K.dll)return;try{const bin=atob(K.dll),b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);TH.A=await build(b);TH.on=!!K.on;if(TH.on&&typeof setMania==='function')setMania(false)}catch(e){TH.A=null;TH.msg=e.message}}
async function install(file){TH.msg='';try{const b=new Uint8Array(await file.arrayBuffer()),A=await build(b);TH.A=A;K.dll=btoa(latin(b));K.on=0;TH.on=false;save()}catch(e){TH.msg=e.message||'Lỗi'}refresh()}
TH.ready=load();

/* ---------- Cài đặt (chỉ hiện mục Touhosu khi đã thêm) ---------- */
const inner=()=>{let h=TH.msg?'<div class="sr"><small style="color:#f88">'+TH.msg+'</small></div>':'';
 if(!TH.installed())return h+'<div class="sr"><small style="opacity:.6">Chưa có chế độ nào. Chọn file .dll của chế độ (hiện hỗ trợ: Touhosu).</small></div>';
 return h+'<div class="sr"><b>Touhosu</b><small style="opacity:.6">đã thêm</small></div><div class="sr"><span>Projectile Count</span><span>'+CNT.map((c,i)=>'<button class="mb" data-thc="'+i+'" style="width:auto;min-height:0;padding:6px 12px;'+(K.cnt===c[1]?'background:#ff66aa;color:#fff':'')+'">'+c[0]+'</button>').join('')+'</span></div>'
 +'<div class="sr"><span>Playfield dim</span><b id="thdv">'+K.dim+'%</b></div><div class="sr"><input id="thd" type="range" min="0" max="100" step="5" value="'+K.dim+'" style="flex:1"></div>'
 +'<div class="sr"><span>Gỡ chế độ Touhosu</span><button class="mb" data-thx="1" style="width:auto;min-height:0;padding:6px 12px">Gỡ</button></div>'};
function refresh(){const e=document.getElementById('thx');if(e)e.innerHTML=inner()}
TH.html=()=>'<div class="sr"><span>Thêm chế độ</span><label class="mb" style="width:auto;min-height:0;padding:8px 14px;cursor:pointer">+ Thêm file<input type="file" id="thf" accept=".dll,application/octet-stream" style="display:none"></label></div><div id="thx">'+inner()+'</div>';
document.addEventListener('change',e=>{const t=e.target;if(t.id==='thf'&&t.files[0]){install(t.files[0]);t.value=''}});
document.addEventListener('input',e=>{if(e.target.id==='thd'){K.dim=+e.target.value;save();const v=document.getElementById('thdv');if(v)v.textContent=K.dim+'%'}});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-thc],[data-thx]');if(!t)return;
 if(t.dataset.thc!=null){K.cnt=CNT[+t.dataset.thc][1];save();refresh()}else if(t.dataset.thx){delete K.dll;K.on=0;TH.A=null;TH.on=false;TH.msg='';save();refresh()}});

/* ---------- chơi ---------- */
const tints={};
function tint(im,c){const k=c+im.width+'x'+im.height+(im.__i||(im.__i=Math.random()));let t=tints[k];if(t)return t;t=document.createElement('canvas');t.width=im.width;t.height=im.height;const x=t.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=c;x.fillRect(0,0,t.width,t.height);return tints[k]=t}
const FW=384,FH=480;
let RUN=null;
TH.start=function(M,F,buf,bg,note){
 if(!TH.installed()){select(CURID,'Chưa thêm chế độ Touhosu');return}
 if(!oriOK()){oriLock();return rotPrompt(()=>TH.start(M,F,buf,bg,note),()=>{RP=null;REPMODS=null;select(CURID)})}
 stop(true);hide();try{setAuto(false)}catch(e){}
 const A=TH.A,md=mods(),d=M.d,rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,EZ=md.has('EZ'),NF=md.has('NF'),HD=md.has('HD'),SD=md.has('SD')||md.has('PF');
 const AR=d.ApproachRate!=null?d.ApproachRate:d.AR!=null?d.AR:7,spd=clamp(170+AR*14,200,330)*(EZ?.85:1),br=EZ?.7:1,cm=K.cnt;
 /* chuyển map osu!standard -> các điểm bắn đạn */
 const ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),E=[],objs=[];let col=0;
 for(const o of ho){const id=objs.length,ob={hit:0,alive:0,done:0,emit:1,t:o.time};objs.push(ob);if(o.nc)col=(col+1)%4;
  const ex=30+clamp(o.x,0,512)/512*(FW-60),ey=24+clamp(o.y,0,384)/384*(FH*.3);
  if(o.kind==='p'){const end=o.end||o.time+1000;let k=0;for(let t=o.time;t<end;t+=Math.max(260,Math.min(520,(end-o.time)/6)),k++)E.push({t,k:'ring',x:FW/2,y:FH*.22,n:Math.round(12*cm)+k%2*2,ph:k*.4,c:col,id})}
  else if(o.kind==='s'){let end=o.time+600;try{const tp=tpAt2(M,o.time);end=o.time+o.len/(d.SliderMultiplier*100*tp.m)*tp.bl*(o.slides||1)}catch(e){}end=Math.max(end,o.time+300);
   const st=Math.max(70,110/cm);for(let t=o.time;t<=end;t+=st)E.push({t,k:'line',x:ex+Math.sin((t-o.time)/350)*36,y:ey,c:col,id});}
  else E.push({t:o.time,k:'fan',x:ex,y:ey,n:Math.max(1,Math.round(3*cm)),c:col,id});}
 E.sort((a,b)=>a.t-b.t);for(const e of E)objs[e.id].alive++;
 const lastT=E.length?E[E.length-1].t:0,first=E.length?E[0].t:0,lead=Math.max(0,1800-first);
 const R={M,F,buf,bg,note,E,ei:0,B:[],objs,pl:{x:FW/2,y:FH*.85,vx:0,face:0},hp:1,lives:EZ?3:0,inv:0,score:0,combo:0,max:0,n:[0,0,0,0],gz:0,spd,br,lastT,lead,rate,NF,HD,SD,keys:new Set,td:{l:0,r:0,u:0,d:0,f:0},over:false,paused:false,flash:[],t0:0,now:-lead,last:null};
 RUN=R;
 /* điều khiển */
 const ctl=document.createElement('div');ctl.id='thc';ctl.style.cssText='position:fixed;inset:0;z-index:30;pointer-events:none;touch-action:none;-webkit-user-select:none;user-select:none';
 const touch=!isPC()||matchMedia('(pointer:coarse)').matches,sa='env(safe-area-inset-';
 const btn=(css,lab,key)=>`<div data-k="${key}" style="position:absolute;${css};pointer-events:auto;background:#6a6a6acc;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font:bold 22px sans-serif;touch-action:none">${lab}</div>`;
 const u=Math.round(clamp(Math.min(innerWidth,innerHeight)*.16,46,70));
 ctl.innerHTML=(touch?`<div style="position:absolute;left:calc(${sa}left,0px) + 24px);bottom:calc(${sa}bottom,0px) + 24px);width:${u*3+12}px;height:${u*3+12}px">`.replace('left:calc(','left:calc(')+
  btn(`left:${u+6}px;top:0;width:${u}px;height:${u}px`,'','u')+btn(`left:0;top:${u+6}px;width:${u}px;height:${u}px`,'','l')+btn(`left:${2*u+12}px;top:${u+6}px;width:${u}px;height:${u}px`,'','r')+btn(`left:${u+6}px;top:${2*u+12}px;width:${u}px;height:${u}px`,'','d')+'</div>'
  +`<div data-k="f" style="position:absolute;right:calc(${sa}right,0px) + 30px);bottom:calc(${sa}bottom,0px) + 34px);width:${u*1.5}px;height:${u*1.5}px;border-radius:50%;background:#ddd;border:5px solid #888;pointer-events:auto;display:flex;align-items:center;justify-content:center;color:#444;font:bold 13px sans-serif;touch-action:none">FOCUS</div>`:'')
  +`<div data-k="p" style="position:absolute;left:calc(${sa}left,0px) + 14px);top:calc(${sa}top,0px) + 12px);width:44px;height:44px;border-radius:50%;background:#fffd;border:3px solid #333;pointer-events:auto;display:flex;align-items:center;justify-content:center;font:bold 18px sans-serif;color:#222">II</div>`;
 document.body.appendChild(ctl);R.ctl=ctl;
 const setK=(k,v)=>{if(k==='p'){if(v)pause();return}R.td[k]=v?1:0};
 ctl.querySelectorAll('[data-k]').forEach(el=>{const k=el.dataset.k;el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(x){}setK(k,1)});['pointerup','pointercancel','lostpointercapture'].forEach(n=>el.addEventListener(n,()=>setK(k,0)))});
 R.kd=e=>{if(e.code==='Escape'){pause();return}if(e.code.startsWith('Arrow')||/^Key[WASD]$/.test(e.code)||e.code.startsWith('Shift')||e.code==='KeyX'||e.code==='KeyZ'){e.preventDefault();R.keys.add(e.code)}};
 R.ku=e=>R.keys.delete(e.code);R.vis=()=>{if(document.hidden)pause()};
 addEventListener('keydown',R.kd);addEventListener('keyup',R.ku);document.addEventListener('visibilitychange',R.vis);
 /* âm nhạc */
 const T0=ac.currentTime+.2+lead/1000;R.t0=T0;
 if(buf){const s=ac.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.connect(aout('u'));s.start(T0);R.src=s}
 try{ac.resume()}catch(e){}
 R.raf=requestAnimationFrame(loop)};

function stop(silent){const R=RUN;if(!R)return;R.over=true;cancelAnimationFrame(R.raf);if(R.src)try{R.src.stop()}catch(e){}
 removeEventListener('keydown',R.kd);removeEventListener('keyup',R.ku);document.removeEventListener('visibilitychange',R.vis);if(R.ctl)R.ctl.remove();if(R.ov)R.ov.remove();
 try{ac.resume()}catch(e){}try{g.clearRect(0,0,W,H)}catch(e){}RUN=null}
function pause(){const R=RUN;if(!R||R.over||R.paused)return;R.paused=true;ac.suspend();
 const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:40;background:#000a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#fff;font:bold 20px sans-serif';
 const b=(t,c)=>`<button data-a="${c}" style="background:#ff66aa;color:#fff;border:0;border-radius:24px;padding:12px 34px;font:bold 18px sans-serif;min-width:200px">${t}</button>`;
 o.innerHTML='Tạm dừng'+b('Tiếp tục','c')+b('Chơi lại','r')+b('Thoát','q');document.body.appendChild(o);R.ov=o;
 o.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const a0=R;if(a==='c'){o.remove();R.ov=null;R.paused=false;ac.resume();R.last=null;R.raf=requestAnimationFrame(loop)}
  else{const args=[R.M,R.F,R.buf,R.bg,R.note];stop();ac.resume();if(a==='r')TH.start(...args);else{RP=null;REPMODS=null;select(CURID)}}}}

function dirs(R){const k=R.keys,t=R.td;return{l:k.has('ArrowLeft')||k.has('KeyA')||t.l,r:k.has('ArrowRight')||k.has('KeyD')||t.r,u:k.has('ArrowUp')||k.has('KeyW')||t.u,d:k.has('ArrowDown')||k.has('KeyS')||t.d,f:k.has('ShiftLeft')||k.has('ShiftRight')||k.has('KeyX')||t.f}}
function spawn(R,e){const A=TH.A,pl=R.pl,ob=R.objs[e.id],c=COL[e.c%4],add=(type,x,y,ang,sp,sc)=>{R.B.push({type,x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,c,id:e.id,gz:0,ang});ob.alive++};
 const aim=Math.atan2(pl.y-e.y,pl.x-e.x);R.flash.push({x:e.x,y:e.y,t:R.now,c});
 if(e.k==='fan'){const n=e.n,sp=R.spd;for(let i=0;i<n;i++)add('sphere',e.x,e.y,aim+(n>1?(i/(n-1)-.5)*.5:0),sp)}
 else if(e.k==='line'){add('knife',e.x,e.y,aim*.35+Math.PI/2*.65,R.spd*1.1)}
 else if(e.k==='ring'){for(let i=0;i<e.n;i++)add('grain',e.x,e.y,e.ph+i/e.n*6.2832,R.spd*.55)}
 ob.alive--;ob.emit=0}
function judge(R,id){const ob=R.objs[id];if(ob.done||ob.alive>0)return;ob.done=1;const h=ob.hit;
 if(h===0){R.n[0]++;R.combo++;R.score+=Math.round(300*(1+Math.min(R.combo,100)/25))}else if(h===1){R.n[1]++;R.combo++;R.score+=100}else{R.n[3]++;R.combo=0}R.max=Math.max(R.max,R.combo)}
function loop(ts){const R=RUN;if(!R||R.over||R.paused)return;
 const now=(ac.currentTime-R.t0)*1000*R.rate;let dt=R.last==null?0:clamp((now-R.last)/1000,0,.05);R.last=now;R.now=now;const pl=R.pl,A=TH.A,D=dirs(R);
 while(R.ei<R.E.length&&R.E[R.ei].t<=now)spawn(R,R.E[R.ei++]);
 /* người chơi */
 const sp=D.f?150:330,dx=(D.r?1:0)-(D.l?1:0),dy=(D.d?1:0)-(D.u?1:0),m=dx&&dy?.7071:1,rs=R.rate>1?1:1;
 pl.x=clamp(pl.x+dx*sp*m*dt,10,FW-10);pl.y=clamp(pl.y+dy*sp*m*dt,14,FH-14);pl.face=dx;pl.focus=D.f;
 /* đạn */
 const hr=3,gr=17,B=R.B;R.inv=Math.max(0,R.inv-dt);
 for(let i=B.length-1;i>=0;i--){const b=B[i];b.x+=b.vx*dt;b.y+=b.vy*dt;const r=A.pj[b.type].r*R.br,ddx=b.x-pl.x,ddy=b.y-pl.y,dd=Math.hypot(ddx,ddy);
  if(b.x<-30||b.x>FW+30||b.y<-30||b.y>FH+30){B.splice(i,1);const ob=R.objs[b.id];ob.alive--;judge(R,b.id);continue}
  if(dd<r+hr&&R.inv<=0){R.hp-=EZ()?.12:.2;R.inv=1.4;R.combo=0;R.objs[b.id].hit++;B.splice(i,1);R.objs[b.id].alive--;judge(R,b.id);
   if(R.SD){R.hp=0}if(R.hp<=0){if(R.lives>0){R.lives--;R.hp=1}else if(!R.NF){return finish(R,true)}else R.hp=.05}continue}
  if(!b.gz&&dd<r+gr&&dd>r+hr){b.gz=1;R.gz++;R.score+=25;if(A.graze){try{const s=ac.createBufferSource();s.buffer=A.graze;s.connect(aout('f'));s.start()}catch(e){}}}}
 function EZ(){return R.br<1}
 if(R.hp>0&&R.hp<1)R.hp=Math.min(1,R.hp+dt*.012);
 if(R.ei>=R.E.length&&!R.B.length&&now>R.lastT+1500)return finish(R,false);
 if(R.src&&R.buf&&now>R.buf.duration*1000*1+1000&&R.ei>=R.E.length&&!R.B.length)return finish(R,false);
 draw(R,now);R.raf=requestAnimationFrame(loop)}
function draw(R,now){const A=TH.A,pl=R.pl;g.save();g.clearRect(0,0,W,H);
 const top=(typeof ST!=='undefined'?ST:0),sc=Math.min((H-top-16)/FH,W*.52/FW),fx=(W-FW*sc)/2,fy=top+(H-top-FH*sc)/2;
 if(R.bg){g.globalAlpha=1;const r=Math.max(W/R.bg.width,H/R.bg.height);g.drawImage(R.bg,(W-R.bg.width*r)/2,(H-R.bg.height*r)/2,R.bg.width*r,R.bg.height*r);g.fillStyle='rgba(0,0,0,'+(.45+.5*K.dim/100)+')';g.fillRect(0,0,W,H)}else{g.fillStyle='#0b0b16';g.fillRect(0,0,W,H)}
 g.fillStyle='rgba(0,0,0,'+(.25+.6*K.dim/100)+')';g.fillRect(fx,fy,FW*sc,FH*sc);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.strokeRect(fx,fy,FW*sc,FH*sc);
 g.save();g.beginPath();g.rect(fx,fy,FW*sc,FH*sc);g.clip();g.translate(fx,fy);g.scale(sc,sc);
 for(const f of R.flash){const k=(now-f.t)/300;if(k>1||k<0)continue;g.globalAlpha=1-k;g.strokeStyle=f.c;g.lineWidth=3;g.beginPath();g.arc(f.x,f.y,6+k*22,0,6.2832);g.stroke()}
 R.flash=R.flash.filter(f=>now-f.t<300);g.globalAlpha=1;
 for(const b of R.B){const p=A.pj[b.type];let a=1;if(R.HD)a=clamp((Math.hypot(b.x-pl.x,b.y-pl.y)-60)/90,0,1);if(a<=.02)continue;g.globalAlpha=a;const s=R.br;
  g.save();g.translate(b.x,b.y);if(b.type==='knife')g.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);g.scale(s,s);
  g.drawImage(tint(p.tx,b.c),-p.tx.width/2,-p.tx.height/2);g.drawImage(p.ov,-p.ov.width/2,-p.ov.height/2);g.restore()}
 g.globalAlpha=1;
 /* nhân vật */
 const fr=Math.floor(Math.max(0,now)/90),spr=pl.face<0?A.left[fr%5]:pl.face>0?A.right[fr%5]:A.idle[fr%8];
 if(R.inv>0&&Math.floor(R.inv*12)%2)g.globalAlpha=.4;
 if(pl.focus&&A.focus){g.save();g.translate(pl.x,pl.y);g.rotate(Math.max(0,now)/600);g.globalAlpha=.9;g.drawImage(A.focus,-32,-32,64,64);g.restore();g.globalAlpha=1}
 g.drawImage(spr,pl.x-spr.width*.65,pl.y-spr.height*.65,spr.width*1.3,spr.height*1.3);g.globalAlpha=1;
 if(pl.focus){g.fillStyle='#fff';g.strokeStyle='#f33';g.lineWidth=1.5;g.beginPath();g.arc(pl.x,pl.y,3.5,0,6.2832);g.fill();g.stroke()}
 g.restore();
 /* HUD */
 const hx=fx+FW*sc+16,acc=R.n[0]+R.n[1]+R.n[3]?(300*R.n[0]+100*R.n[1])/(300*(R.n[0]+R.n[1]+R.n[3])):1,hp=R.hp;
 g.textBaseline='alphabetic';g.textAlign='left';g.fillStyle='#fff';g.font='bold 26px sans-serif';g.fillText(String(R.score).padStart(8,'0'),hx,fy+34);g.font='15px sans-serif';g.fillText((acc*100).toFixed(2)+'%  ·  '+R.combo+'x',hx,fy+58);g.fillText('Graze '+R.gz+(R.lives?'  ·  Mạng +'+R.lives:''),hx,fy+80);
 const hi=A.hp[hp>.875?4:hp>.625?3:hp>.375?2:hp>.125?1:0];g.drawImage(hi,hx,fy+96,56,56);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(hx+64,fy+118,Math.min(150,W-hx-20),10);g.fillStyle='#ff5a8a';g.fillRect(hx+64,fy+118,Math.min(150,W-hx-20)*clamp(hp,0,1),10);
 if(R.note){g.font='13px sans-serif';g.fillStyle='#fc4';g.fillText(R.note,hx,fy+176)}
 g.restore()}

function finish(R,fail){if(R.over)return;const M=R.M,n=R.n,tot=n[0]+n[1]+n[3],acc=tot?(300*n[0]+100*n[1])/(300*tot):1,mx=R.max,gz=R.gz,sc=R.score,args=[R.M,R.F,R.buf,R.bg,R.note];
 stop();const rk=fail?'F':acc>=1?'SS':acc>=.95?'S':acc>=.9?'A':acc>=.8?'B':acc>=.7?'C':'D',jc={SS:'#ffd84d',S:'#ffd84d',A:'#7ddc4a',B:'#4aa8ff',C:'#c77dff',D:'#ff5a5a',F:'#ff5a5a'};
 const c=(l,v,k)=>`<div style="text-align:center"><div style="color:${k};font:bold 15px sans-serif">${l}</div><b style="font-size:22px">${v}x</b></div>`;
 show(`<div style="color:#fff;display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;font-family:sans-serif"><div style="opacity:.7">Touhosu</div><div style="font:bold 20px sans-serif">${esc(M.title||'')} [${esc(M.ver||'')}]</div><div style="font:bold 72px sans-serif;color:${jc[rk]}">${rk}</div><div style="font:bold 34px sans-serif">${String(sc).padStart(8,'0')}</div><div style="display:flex;gap:22px">${c('Sạch',n[0],'#6cf')+c('1 trúng',n[1],'#8f6')+c('Trúng nhiều',n[3],'#f55')}</div><div style="opacity:.85">${(acc*100).toFixed(2)}% · Combo tối đa ${mx}x · Graze ${gz}${fail?' · Thất bại':''}</div><div style="display:flex;gap:12px;margin-top:8px"><button id="thR" style="background:#444;color:#fff;border:0;border-radius:24px;padding:12px 28px;font:bold 17px sans-serif">Chơi lại</button><button id="thB" style="background:#ff66aa;color:#fff;border:0;border-radius:24px;padding:12px 28px;font:bold 17px sans-serif">Back</button></div></div>`);
 document.getElementById('thR').onclick=()=>TH.start(...args);document.getElementById('thB').onclick=()=>{RP=null;REPMODS=null;select(CURID)};
 if(!fail&&rk!=='D'){try{sndPlay('applause',100)}catch(e){}}}
})();
