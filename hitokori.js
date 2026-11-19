/* Adapter Hitokori (viết lại theo luật gốc của ruleset osu.Game.Rulesets.Hitokori).
   Chỉ dùng 4 ảnh "Bot" nhúng trong .dll; toàn bộ luật được dựng lại bằng JS theo mã nguồn gốc:
   - Chuyển map: chỉ dùng THỜI GIAN (bỏ vị trí). Circle = TapTile; slider/spinner mặc định NoHolds = 2 TapTile (đầu, cuối) (bật "Hold Tiles" để có HoldTile thật).
   - Hình học TilePoint: Duration=Next.HitTime-HitTime, arclength=Beats*Speed*(2π/3), AngleOffset=±min(arclength/Distance,1.75π),
     Distance = min(NextRequestedDistance của ô trước, 2); OutAngle/vị trí theo Parent. Pattern Stairs đảo chiều quay khi |AngleOffset|<π/3 (với Tap không sinh từ hold).
   - Chuyển động quả cầu: sau khi ô p được chấm (trúng hay trượt) quả cầu quay tuyến tính tới ô kế tiếp; khoảng nghỉ >1000ms thì thu bán kính về 0.
   - Cửa sổ thời gian theo OD: Perfect 70/50/40, Good 200/150/100 (OD 0/5/10). Mỗi ô có 2 lần bấm: bấm trượt lần 1 chỉ rung, lần 2 = Miss.
   - Kết quả: Perfect(350), Late(300, trễ), Early(100, sớm), Miss. HR = tốc độ x1.5 + đảo chiều quay. */
(()=>{
const OM=window.OM;if(!OM)return;
const FW=480,FH=400,SP=100,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),PI=Math.PI,MAXA=1.75*PI;
const KEYS=['KeyZ','KeyX','KeyJ','KeyK','Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
const FIRE='#ff4d3d',ICE='#4da8ff',ACC='#ff7be0';
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const dr=(v,mn,md,mx)=>v>5?md+(mx-md)*(v-5)/5:v<5?md-(md-mn)*(5-v)/5:md;
let RUN=null;

OM.register({id:'hitokori',name:'Hitokori',asm:'osu.Game.Rulesets.Hitokori',
 settings:[
  {k:'zoom',label:'Khoảng cách camera',t:'seg',o:[['Gần',1.25],['Vừa',1],['Xa',.8]],def:1},
  {k:'dim',label:'Playfield dim',t:'range',min:0,max:100,step:5,u:'%',def:55},
  {k:'holds',label:'Hold Tiles (mặc định gốc: Tắt = NoHolds)',t:'seg',o:[['Tắt',0],['Bật',1]],def:0},
  {k:'bot',label:'Hiện Bot (phản ứng theo phím bấm)',t:'seg',o:[['Tắt',0],['Bật',1]],def:1}],
 support:M=>M.mode?'Hitokori chỉ chơi map osu!standard':'',
 async build(info){const im=await Promise.all((info.pngs||[]).map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null)));
  const big=im.filter(b=>b&&b.width>=500);return{ok:true,bot:big.length>=4?{hold:big[0],left:big[1],neutral:big[2],right:big[3]}:null}},
 icon(A){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#1b1540';x.beginPath();x.arc(64,64,62,0,7);x.fill();
  if(A.bot){const b=A.bot.neutral,r=84/b.width;x.drawImage(b,64-b.width*r/2,64-b.height*r/2,b.width*r,b.height*r)}
  else{x.fillStyle=FIRE;x.beginPath();x.arc(40,64,16,0,7);x.fill();x.fillStyle=ICE;x.beginPath();x.arc(88,64,16,0,7);x.fill()}return c.toDataURL()},
 async start(ctx){return start(ctx)}});

/* ---------- chuyển map -> chuỗi TilePoint ---------- */
function convert(M,opt){
 const d=M.d,ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),T=[];
 const bl=t=>{try{return tpAt2(M,t).bl||500}catch(e){return 500}};
 const speed=opt.hr?1.5:1;let lastEnd=-1e9;
 const add=(t,type,fh)=>{const l=T[T.length-1];if(l&&t<=l.t)return false;T.push({t,type,fh:!!fh});return true};
 for(const o of ho){if(o.time<lastEnd)continue; /* RemoveUnhitable */
  if(o.kind==='c'){add(o.time,'t');lastEnd=o.time}
  else{let end=o.end||o.time+500;if(o.kind==='s'){let tp={bl:500,m:1};try{tp=tpAt2(M,o.time)}catch(e){}try{end=o.time+o.len/(d.SliderMultiplier*100*tp.m)*tp.bl*(o.slides||1)}catch(e){}}
   if(end<=o.time)end=o.time+1;
   if(opt.holds){if(add(o.time,'hs')){add(end,'he')}}
   else{if(add(o.time,'t',true))add(end,'t',true)}
   lastEnd=end}}
 const t0=T.length?T[0].t-1000:0,S={t:t0,type:'start',fh:false};T.unshift(S);
 /* hình học */
 const n=T.length;
 for(let i=0;i<n;i++){const k=T[i];k.i=i;k.bl=bl(k.t);k.sp=speed;k.cw=true}
 for(let i=0;i<n;i++){const k=T[i],nx=T[i+1],pv=T[i-1];
  if(i===0){k.dist=1;k.x=0;k.y=0;k.out=0;k.inA=0;k.parent=null}
  else{
   k.parent=k.type==='he'?pv.parent:pv;
   const nrd=pv.arc/pv.dist>MAXA?(2*PI/3)/MAXA*pv.beats*pv.sp:1;k.dist=Math.min(i===1?1:nrd,2)}
  /* Duration, Beats, arc */
  if(nx){k.dur=nx.t-k.t;k.beats=k.dur/k.bl;k.arc=k.beats*k.sp*(2*PI/3)}
  else{k.beats=MAXA*k.dist/(k.sp*2*PI/3);k.dur=k.beats*k.bl;k.arc=k.beats*k.sp*(2*PI/3)}
  const mag=clamp(k.arc/k.dist,0,MAXA);
  if(i>0){if(k.type==='t'&&!k.fh&&mag<PI/3)k.cw=!pv.cw}
  if(opt.hr&&i>0)k.cw=!k.cw;
  k.ao=(k.cw?1:-1)*mag;
  if(i>0){k.inA=pv.out;const u=a=>[Math.cos(a),Math.sin(a)];
   if(k.parent===pv){const v=u(k.inA);k.x=pv.x+v[0]*k.dist;k.y=pv.y+v[1]*k.dist;k.out=k.inA+k.ao-PI}
   else{const v=u(k.inA+PI);k.x=k.parent.x+v[0]*k.dist;k.y=k.parent.y+v[1]*k.dist;k.out=k.inA+k.ao}}
  else k.out=0}
 for(let i=1;i<n;i++){const a=T[i-1].bl,b=T[i].bl;T[i].ch=Math.round((a/b-1)*100)} /* tăng % tốc độ so với ô trước */
 return T}

async function start(ctx){
 const{M,buf,bg,note,A,cfg,OM}=ctx;stop();hide();try{setAuto(false)}catch(e){}
 const md=mods(),rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,EZ=md.has('EZ'),HR=md.has('HR'),NF=md.has('NF'),HD=md.has('HD'),SD=md.has('SD')||md.has('PF');
 const OD0=M.d.OD!=null?M.d.OD:5,od=EZ?OD0*.5:OD0,Wp=dr(od,70,50,40),Wg=dr(od,200,150,100);
 const T=convert(M,{hr:HR,holds:!!cfg.holds}),lead=Math.max(0,1800-T[0].t),N=T.length-1;
 const R={M,buf,bg,note,T,cur:1,hold:-1,inp:new Set,bt:0,bside:0,cam:{x:0,y:0},n:[0,0,0,0],score:0,combo:0,max:0,sumc:0,accs:0,N,hp:1,fx:[],shake:[],now:-lead,last:null,fps:60,over:false,paused:false,ctx,rate,Wp,Wg,NF,SD,HD,EZ,cfg,raf:0,src:null,t0:0,gp:false,flip:0,seg:null};
 /* tile 0 được "chấm" tự động tại HitTime của nó */
 const k0=T[0];R.seg=mkSeg(R,k0,k0.t,{x:0,y:0},true);
 RUN=R;
 const S=R.S=OM.session({fw:FW,fh:FH,buttons:[],pad:false,keys:KEYS,
  onKey(c,dn){dn?down(R,'k'+c):up(R,'k'+c)},
  onPtr(t,x,y,id){if(t==='d')down(R,'p'+id);else if(t==='u')up(R,'p'+id)},
  onPause(){R.paused=true;R.inp.clear();try{ac.suspend()}catch(e){}},
  onResume(){R.paused=false;try{ac.resume()}catch(e){}R.last=null;R.raf=requestAnimationFrame(loop)},
  onRestart(){stop();try{ac.resume()}catch(e){}ctx.restart()},
  onQuit(){stop();try{ac.resume()}catch(e){}ctx.quit()},
  onSkip(ms){seek(R,ms)},
  onLayout(){if(RUN&&RUN.paused&&!RUN.over)draw(RUN,RUN.now)}});
 R.t0=ac.currentTime+.2+lead/1000;
 if(buf){const s=ac.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.connect(aout('u'));s.start(R.t0);R.src=s}
 try{ac.resume()}catch(e){}
 R.raf=requestAnimationFrame(loop)}

function seek(R,ms){if(R.src){try{R.src.stop()}catch(e){}R.src=null}R.t0=ac.currentTime-ms/1000/R.rate;
 if(R.buf){const s=ac.createBufferSource();s.buffer=R.buf;s.playbackRate.value=R.rate;s.connect(aout('u'));s.start(0,Math.max(0,ms)/1000);R.src=s}R.last=null}
function stop(){const R=RUN;if(!R)return;R.over=true;cancelAnimationFrame(R.raf);if(R.src)try{R.src.stop()}catch(e){}if(R.S)R.S.close();
 try{ac.resume()}catch(e){}try{g.clearRect(0,0,W,H)}catch(e){}RUN=null}

/* ---------- chuyển động quả cầu ---------- */
function orbAt(R,now){const s=R.seg,f=s.te>s.j?clamp((now-s.j)/(s.te-s.j),0,1):1,a=s.a0+s.sw*f;let r;
 if(s.long){r=now<s.j+500?s.r0*(1-clamp((now-s.j)/500,0,1)):0;if(!s.last&&now>s.te-1000)r=s.r1*clamp(1-(s.te-now)/1000,0,1)}
 else r=s.r0+(s.r1-s.r0)*f;
 return{x:s.pv.x+Math.cos(a)*r,y:s.pv.y+Math.sin(a)*r,r,a}}
/* tạo đoạn chuyển động sau khi ô p được chấm tại thời điểm j */
function mkSeg(R,p,j,cur,first){const T=R.T,nx=T[p.i+1],old=R.seg;let pv,a0,swap;
 if(first){pv={x:p.x,y:p.y};a0=p.out-p.ao;swap=true}
 else{swap=!nx||nx.parent===p;
  if(swap){pv={x:p.x,y:p.y};a0=Math.atan2(old.pv.y-p.y,old.pv.x-p.x)}
  else{pv=old.pv;a0=Math.atan2(p.y-pv.y,p.x-pv.x)}}
 const o=old&&!first?orbAt(R,j):null;
 const last=!nx,long=p.dur>1000||last;
 const r0=o?o.r:p.dist,r1=nx?nx.dist:0;
 return{pv,a0,sw:p.ao,j,te:p.t+p.dur,r0,r1,long,last,swap,idx:p.i}}

/* ---------- chấm điểm ---------- */
const BASE={P:350,G:300,O:100,M:0},NAME={P:'Perfect',G:'Late',O:'Early',M:'Miss'};
function judge(R,i,v){const k=R.T[i];if(k.v)return false;k.v=v;const c=R.n;
 if(v==='P')c[0]++;else if(v==='G')c[1]++;else if(v==='O')c[2]++;else c[3]++;
 if(v==='M'){R.combo=0;R.hp-=.1;if(R.SD)R.hp=0}else{R.combo++;R.hp=Math.min(1,R.hp+(v==='P'?.105:v==='G'?.1:.03))}
 R.max=Math.max(R.max,R.combo);R.sumc+=R.combo;R.accs+=BASE[v]/350;
 const N=Math.max(1,R.N);R.score=Math.round(700000*R.sumc/(N*(N+1)/2)+300000*R.accs/N);
 k.jt=R.now;R.fx.push({i,t:R.now,v});
 R.seg=mkSeg(R,k,R.now);
 if(R.hp<=0){if(R.NF)R.hp=.0001;else R.fail=true}return true}
const res=(R,off)=>{const a=Math.abs(off);return a<=R.Wp?'P':a<=R.Wg?(off>0?'G':'O'):null};
function advance(R){while(R.cur<R.T.length&&(R.T[R.cur].v||R.T[R.cur].type==='he'))R.cur++}

function down(R,id){if(R.over||R.paused)return;R.inp.add(id);R.bt=R.now;R.bside^=1;advance(R);
 const k=R.T[R.cur];if(!k)return; /* nhấn luôn bị "tiêu thụ" bởi ô chưa chấm sớm nhất */
 const off=R.now-k.t;if(off<-500)return;
 const v=res(R,off);
 if(v){judge(R,k.i,v);if(k.type==='hs')R.hold=k.i+1}
 else{k.att=(k.att||0)+1;R.shake.push({i:k.i,t:R.now});if(k.att>=2){judge(R,k.i,'M');if(k.type==='hs'){R.T[k.i+1].forced=true}}}
 advance(R)}
function up(R,id){if(R.over||R.paused)return;R.inp.delete(id);if(R.inp.size||R.hold<0)return;
 const e=R.T[R.hold];R.hold=-1;if(!e||e.v)return;const off=R.now-e.t,v=res(R,off);
 if(v)judge(R,e.i,v);else{e.att=(e.att||0)+1;if(e.att>=2||off<-R.Wg)e.forced=true;else e.forced=true}}

function loop(){const R=RUN;if(!R||R.over||R.paused)return;const S=R.S,T=R.T,now=(ac.currentTime-R.t0)*1000*R.rate;
 const dt=R.last==null?0:clamp(now-R.last,0,100);R.last=now;R.now=now;if(dt>0)R.fps=R.fps*.92+(1000/(dt/R.rate))*.08;
 const I=S.read();if(I.f&&!R.gp){R.gp=true;down(R,'gp')}else if(!I.f&&R.gp){R.gp=false;up(R,'gp')}
 /* ô tile 0: chấm tự động */
 /* tự trượt: offset > min(missWindow, Duration/2); hold-end bị ép Miss tại giờ kết thúc nếu ReleaseMissed */
 for(let i=R.cur;i<T.length;i++){const k=T[i];if(k.v)continue;
  if(k.type==='he'&&k.forced&&now>=k.t){judge(R,i,'M');if(R.hold===i)R.hold=-1;continue}
  if(k.type==='he'&&T[i-1].v==='M'&&now>=k.t){judge(R,i,'M');continue}
  if(now-k.t>Math.min(R.Wg,k.dur/2)){judge(R,i,'M');if(k.type==='hs'){T[i+1].forced=true}if(R.hold===i)R.hold=-1;continue}
  if(k.type!=='he'&&now<k.t-R.Wg)break}
 advance(R);
 if(R.fail&&!R.NF)return finish(R,true);
 let sk=null;if(R.cur<T.length){const nx=T[R.cur].t;if(nx-now>(R.cur===1?3500:6000))sk=nx-2000}S.setSkip(sk);
 const last=T[T.length-1].t;
 if(R.cur>=T.length&&now>last+1200)return finish(R,false);
 if(R.src&&R.buf&&now>R.buf.duration*1000+1000&&R.cur>=T.length)return finish(R,false);
 draw(R,now);R.raf=requestAnimationFrame(loop)}

/* ---------- vẽ ---------- */
function panel(g,x,y,w,h,lab,val){g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,w,h,5);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;g.stroke();g.fillStyle='#222';g.textBaseline='middle';g.textAlign='left';g.font='bold '+Math.round(h*.36)+'px sans-serif';g.fillText(lab,x+12,y+h/2+1);g.textAlign='right';g.font='bold '+Math.round(h*.46)+'px sans-serif';g.fillText(val,x+w-12,y+h/2+1)}
function draw(R,now){const cfg=R.cfg,L=R.S.lay,{fx,fy,fw,fh,sc}=L,T=R.T,A=R.ctx.A;g.save();g.clearRect(0,0,W,H);
 if(R.bg){const r=Math.max(W/R.bg.width,H/R.bg.height);g.drawImage(R.bg,(W-R.bg.width*r)/2,(H-R.bg.height*r)/2,R.bg.width*r,R.bg.height*r);g.fillStyle='rgba(0,0,0,'+(.45+.5*cfg.dim/100)+')';g.fillRect(0,0,W,H)}else{g.fillStyle='#0b0b16';g.fillRect(0,0,W,H)}
 g.save();g.beginPath();g.rect(fx,fy,fw,fh);g.clip();g.translate(fx,fy);g.scale(sc,sc);
 g.fillStyle='rgba(0,0,0,'+(.15+.45*cfg.dim/100)+')';g.fillRect(0,0,FW,FH);
 const o=orbAt(R,now),pv=R.seg.pv;
 /* camera: trung bình các ô còn sống + hai quả cầu, làm mượt ~300ms */
 let sx=pv.x+o.x,sy=pv.y+o.y,cnt=2;const alive=[];
 for(let i=Math.max(0,R.cur-3);i<T.length;i++){const k=T[i];if(k.t-now>1000)break;if(k.v&&now-k.jt>1000)continue;alive.push(k);sx+=k.x;sy+=k.y;cnt++}
 for(let i=Math.max(0,R.cur-6);i<R.cur;i++){const k=T[i];if(k&&k.v&&now-k.jt<=1000&&!alive.includes(k)){alive.push(k);sx+=k.x;sy+=k.y;cnt++}}
 const dtc=R.camT==null?100:clamp(now-R.camT,0,100);R.camT=now;const kf=1-Math.exp(-dtc/300);
 R.cam.x+=(sx/cnt-R.cam.x)*kf;R.cam.y+=(sy/cnt-R.cam.y)*kf;
 const z=cfg.zoom*SP*.8/SP;g.translate(FW/2,FH*.5);g.scale(z,z);g.translate(-R.cam.x*SP,-R.cam.y*SP);
 /* đường nối giữa các ô sống */
 g.lineCap='round';for(const k of alive){const p=T[k.i-1];if(!p||!alive.includes(p))continue;g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=3;g.beginPath();g.moveTo(p.x*SP,p.y*SP);g.lineTo(k.x*SP,k.y*SP);g.stroke()}
 g.lineCap='butt';
 /* vòng đứt quanh tâm */
 g.save();g.globalAlpha=.15;g.setLineDash([6,8]);g.lineDashOffset=-now/40;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(pv.x*SP,pv.y*SP,Math.max(4,o.r*SP),0,6.2832);g.stroke();g.restore();
 /* ô */
 for(const k of alive){let a=1;if(R.HD&&!k.v)a=clamp((k.t-now)/700,0,1);if(a<=.02)continue;g.globalAlpha=a;
  let sh=0;for(const s of R.shake)if(s.i===k.i&&now-s.t<250)sh=Math.sin((now-s.t)*.12)*4*(1-(now-s.t)/250);
  const x=k.x*SP+sh,y=k.y*SP,c=k.v?(k.v==='M'?'#ff5a5a':'rgba(160,255,190,.9)'):k.type==='start'?'#9aa':ACC,s=15;
  g.fillStyle=c;rr(g,x-s,y-s,s*2,s*2,6);g.fill();g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=2;g.stroke();
  if(k.type==='hs'||k.type==='he'){g.strokeStyle='#ffb04d';g.lineWidth=3;rr(g,x-s-4,y-s-4,s*2+8,s*2+8,9);g.stroke()}
  if(k.i>0&&!k.v&&k.ch&&Math.abs(k.ch)>=1){g.fillStyle=k.ch>0?'#ff9a3c':'#1e90ff';g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((k.ch>0?'+':'')+k.ch+'%',x,y-s-12)}
  g.globalAlpha=1}
 R.shake=R.shake.filter(s=>now-s.t<250);
 /* điểm */
 R.fx=R.fx.filter(f=>now-f.t<600);for(const f of R.fx){const k=T[f.i];if(!k)continue;const q=(now-f.t)/600;g.globalAlpha=1-q;
  g.fillStyle=f.v==='P'?'#ffd84d':f.v==='G'?'#7dff9a':f.v==='O'?'#6cf':'#f55';g.font='bold 18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(NAME[f.v],k.x*SP,k.y*SP-34-q*18);g.globalAlpha=1}
 /* hai quả cầu: màu đổi vai mỗi lần swap */
 const sw=R.swaps||0;let ns=0;for(let i=0;i<=R.seg.idx;i++){}
 let cnt2=0;for(let i=1;i<=R.seg.idx;i++){const nk=T[i];if(nk&&nk.parent===T[i-1]&&T[i-1].v)cnt2++}
 const pc=cnt2%2?ICE:FIRE,mc=cnt2%2?FIRE:ICE,orb=(x,y,c)=>{g.fillStyle=c;g.shadowColor=c;g.shadowBlur=14;g.beginPath();g.arc(x*SP,y*SP,15,0,6.2832);g.fill();g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=2.5;g.stroke()};
 orb(pv.x,pv.y,pc);orb(o.x,o.y,mc);
 g.restore();
 const tot=Math.max(1,R.buf?R.buf.duration*1000:1),n=R.n,jn=n[0]+n[1]+n[2]+n[3],acc=jn?R.accs/jn:1;
 if(cfg.bot&&A.bot){const b=R.hold>=0?A.bot.hold:now-R.bt<130&&R.bt>0?(R.bside?A.bot.left:A.bot.right):A.bot.neutral,bw=Math.min(90,fw*.2),bh=bw*b.height/b.width;g.globalAlpha=.9;g.drawImage(b,fx+fw-bw-8,fy+fh-bh-6,bw,bh);g.globalAlpha=1}
 g.fillStyle='rgba(255,255,255,.18)';g.fillRect(fx,fy-4,fw,3);g.fillStyle='#ff66aa';g.fillRect(fx,fy-4,fw*clamp(now/tot,0,1),3);
 const hud=L.hud;
 if(L.land&&hud.w>90){const pw=Math.min(hud.w,260),ph=Math.round(clamp(H*.085,28,40)),gap=Math.round(ph*.22),x=hud.x+(hud.w-pw)/2;let y=fy+4;
  panel(g,x,y,pw,ph,'SCORE',String(R.score).padStart(7,'0'));y+=ph+gap;panel(g,x,y,pw,ph,'COMBO',R.combo+'x');y+=ph+gap;panel(g,x,y,pw,ph,'ACC',(acc*100).toFixed(2)+'%');y+=ph+gap;
  g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,pw,ph,5);g.fill();g.fillStyle='#ddd';rr(g,x+10,y+ph/2-5,pw-20,10,5);g.fill();g.fillStyle='#ff5a8a';rr(g,x+10,y+ph/2-5,Math.max(0,(pw-20)*clamp(R.hp,0,1)),10,5);g.fill()}
 else{g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='bold 18px sans-serif';g.fillText(String(R.score).padStart(7,'0')+'  '+R.combo+'x  '+(acc*100).toFixed(1)+'%',fx+8,fy+22)}
 if(R.S.sk!=null&&!R.S.ov&&!('ontouchstart' in window)){g.textAlign='center';g.textBaseline='alphabetic';g.font='bold 15px sans-serif';g.fillStyle='#7dff9a';g.fillText('Enter: Skip »',fx+fw/2,fy+fh-14)}
 if(typeof SET!=='undefined'&&SET.fps){g.textAlign='left';g.textBaseline='middle';g.font='bold 14px monospace';g.fillStyle='#6f6';g.fillText('FPS '+Math.round(R.fps),L.pad.x0+54,L.top+30)}
 g.restore()}

function finish(R,fail){if(R.over)return;const M=R.M,n=R.n,jn=n[0]+n[1]+n[2]+n[3],acc=jn?R.accs/jn:1,ctx=R.ctx;stop();
 OM.results({mode:'Hitokori',M,score:R.score,cells:[['Perfect',n[0],'#6cf'],['Late',n[1],'#8f6'],['Early',n[2],'#fc4'],['Miss',n[3],'#f55']],miss:n[3],max:R.max,acc,fail,retry:()=>ctx.restart(),back:()=>ctx.quit()})}
})();
