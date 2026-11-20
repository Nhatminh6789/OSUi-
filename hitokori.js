/* Adapter Hitokori (viết lại theo luật gốc của ruleset osu.Game.Rulesets.Hitokori).
   Chỉ dùng 4 ảnh "Bot" nhúng trong .dll; toàn bộ luật được dựng lại bằng JS theo mã nguồn gốc:
   - Chuyển map: chỉ dùng THỜI GIAN (bỏ vị trí). Circle = TapTile; slider/spinner mặc định NoHolds = 2 TapTile (đầu, cuối) (bật "Hold Tiles" để có HoldTile thật).
   - Hình học (đã thiết kế lại): giữ nguyên thời gian, nhưng vị trí ô dựng trên lưới lục giác đều (mọi ô cách nhau 1 đơn vị, cùng kích thước).
     Chỉ có 3 loại gạch: thẳng, lục giác (rẽ 60°), tam giác (rẽ 120°); tỉ lệ ~50/32/18, đường đi tự tránh va chạm để không dồn thành đống.
   - Chuyển động quả cầu: sau khi ô p được chấm (trúng hay trượt) quả cầu quay tuyến tính tới ô kế tiếp; khoảng nghỉ >1000ms thì thu bán kính về 0.
   - Cửa sổ thời gian theo OD: Perfect 70/50/40, Good 200/150/100 (OD 0/5/10). Mỗi ô có 2 lần bấm: bấm trượt lần 1 chỉ rung, lần 2 = Miss.
   - Auto (mod AT/CN): tự bấm Perfect đúng giờ từng ô. Đường đi hiển thị sẵn như Ice/Fire: thân đường + đường gạch giữa, đoạn bị đoạn gần hơn (theo thời gian chơi) đè lên thì vẽ mờ.
   - Kết quả: Perfect(350), Late(300, trễ), Early(100, sớm), Miss. HR = tốc độ x1.5 + đảo chiều quay. */
(()=>{
const OM=window.OM;if(!OM)return;
const FW=480,FH=400,SP=70,AHEAD=14,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),PI=Math.PI,MAXA=1.75*PI;
const KEYS=['KeyZ','KeyX','KeyJ','KeyK','Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
const TW=.235; /* nửa bề rộng gạch (đơn vị ô): quả cầu bán kính 13px gần vừa lọt trong gạch, gạch dài 1 x rộng ~0.47 = hình chữ nhật */
const FIRE='#ff4d3d',ICE='#4da8ff',ACC='#ff7be0';
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const psd=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=t<0?0:t>1?1:t;return Math.hypot(ax+dx*t-px,ay+dy*t-py)};
const crs=(ax,ay,bx,by,cx,cy)=>(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
const segX=(a,b,c,d)=>crs(c.x,c.y,d.x,d.y,a.x,a.y)*crs(c.x,c.y,d.x,d.y,b.x,b.y)<0&&crs(a.x,a.y,b.x,b.y,c.x,c.y)*crs(a.x,a.y,b.x,b.y,d.x,d.y)<0;
const segD=(a,b,c,d)=>segX(a,b,c,d)?0:Math.min(psd(a.x,a.y,c.x,c.y,d.x,d.y),psd(b.x,b.y,c.x,c.y,d.x,d.y),psd(c.x,c.y,a.x,a.y,b.x,b.y),psd(d.x,d.y,a.x,a.y,b.x,b.y));
const dr=(v,mn,md,mx)=>v>5?md+(mx-md)*(v-5)/5:v<5?md-(md-mn)*(5-v)/5:md;
let RUN=null;

OM.register({id:'hitokori',name:'Hitokori',asm:'osu.Game.Rulesets.Hitokori',
 settings:[
  {k:'zoom',label:'Khoảng cách camera',t:'seg',o:[['Gần',1.25],['Vừa',1],['Xa',.8]],def:1},
  {k:'dim',label:'Playfield dim',t:'range',min:0,max:100,step:5,u:'%',def:55},
  {k:'pz',label:'Thu phóng play zone',t:'range',min:50,max:130,step:5,u:'%',def:100},
  {k:'holds',label:'Hold Tiles (mặc định gốc: Tắt = NoHolds)',t:'seg',o:[['Tắt',0],['Bật',1]],def:0},
  {k:'bot',label:'Hiện Bot (phản ứng theo phím bấm)',t:'seg',o:[['Tắt',0],['Bật',1]],def:1}],
 support:M=>M.mode?'Hitokori chỉ chơi map osu!standard':'',
 async build(info){const im=await Promise.all((info.pngs||[]).map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null)));
  const big=im.filter(b=>b&&b.width>=500);return{ok:true,bot:big.length>=4?{hold:big[0],left:big[1],neutral:big[2],right:big[3]}:null}},
 icon(A){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#1b1540';x.beginPath();x.arc(64,64,62,0,7);x.fill();
  if(A.bot){const b=A.bot.neutral,r=84/b.width;x.drawImage(b,64-b.width*r/2,64-b.height*r/2,b.width*r,b.height*r)}
  else{x.fillStyle=FIRE;x.beginPath();x.arc(40,64,16,0,7);x.fill();x.fillStyle=ICE;x.beginPath();x.arc(88,64,16,0,7);x.fill()}return c.toDataURL()},
 async start(ctx){return start(ctx)}});

/* ---------- đường đi kiểu ADOFAI: góc quét lấy từ thời gian ----------
   Góc quét của quả cầu quanh ô i = (số phách tới ô i+1) × 180°. 1 phách = 180° (gạch thẳng), 1/2 = 90° / 3/2 = 270° (góc vuông),
   1/4, 3/4, 5/4, 7/4 = 45°/135°/225°/315° (góc chéo), 1/3, 2/3, 4/3, 5/3 = 60°/120°/240°/300° (tam giác/lục giác), 2 phách = 360° (quay đầu).
   Khoảng cách giữa hai ô LUÔN bằng 1 (vòng quay cùng một cỡ từ đầu đến cuối). Hướng rẽ trái/phải do thuật toán chọn để đường đi
   trải đều, không đè lên gạch cũ và không dồn thành đống; seed theo map nên lần nào chơi cũng giống nhau. */
const CURL=PI*.8,CW=4,LB=[1/4,1/3,1/2,2/3,3/4,1,5/4,4/3,3/2,5/3,7/4,2],CD=.95,WIN=140;
const mulberry=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const wrapA=x=>((x+PI)%(2*PI)+2*PI)%(2*PI)-PI;
/* ---------- 3 loại ô đặc biệt, sinh tự động từ các nốt osu! gốc ----------
   Tăng tốc (U): hai nốt xa nhau mà thời gian ngắn (jump / nhạc dồn dập) -> từ ô này quả cầu quay nhanh hơn (x4/3) để kịp tới nốt kế.
   Giảm tốc (D): nốt nằm sát nhau hoặc nhạc chậm lại -> quả cầu quay chậm lại (x3/4), không bị trượt lố.
   Đổi chiều (R): đường nối các nốt bẻ góc gắt (đang đi sang trái bỗng vòng ngược sang phải) -> ô đổi chiều quay đặt đúng điểm ngoặt. */
const MUL=[3/4,1,4/3];
function markSpecials(T){
 const n=T.length;for(const k of T){k.spd=null;k.rvw=false;k.lv=0}
 if(n<5)return;
 const gap=[],vs=[];
 for(let i=1;i<n-1;i++){const a=T[i],b=T[i+1],d=Math.hypot(b.ox-a.ox,b.oy-a.oy),dt=Math.max(1,b.t-a.t);gap[i]={d,dt,v:d/dt};vs.push(d/dt)}
 const q=p=>{const a=vs.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(p*a.length))]};
 const hi=Math.max(q(.75),.4),lo=Math.min(q(.25),.2);
 /* đổi chiều: góc ngoặt >= ~115° giữa hai đoạn nối (mỗi đoạn dài >= 40px), cách nhau >= 4 ô */
 let lastR=-9;
 for(let i=2;i<n-1;i++){const a=T[i-1],b=T[i],c=T[i+1],x1=b.ox-a.ox,y1=b.oy-a.oy,x2=c.ox-b.ox,y2=c.oy-b.oy,l1=Math.hypot(x1,y1),l2=Math.hypot(x2,y2);
  if(l1>=40&&l2>=40&&(x1*x2+y1*y2)/(l1*l2)<=-.42&&i-lastR>=4){T[i].rvw=true;lastR=i}}
 /* tăng/giảm tốc: nhìn trước 2 đoạn; phải giữ ổn định 2 ô liền và cách lần đổi trước >= 8 ô để không nhấp nháy */
 const tg=[];
 for(let i=1;i<n-1;i++){const g1=gap[i],g2=gap[i+1]||g1,d=(g1.d+g2.d)/2,v=(g1.v+g2.v)/2,dt=(g1.dt+g2.dt)/2;
  const up=v>=hi&&d>=90,dn=!up&&(d<=40||v<=lo||dt>=1.6*T[i].bl);tg[i]=up?1:dn?-1:0}
 let lv=0,lastC=-99;
 for(let i=1;i<n-1;i++){
  if(tg[i]!==lv&&(tg[i+1]===undefined||tg[i+1]===tg[i])&&i-lastC>=8&&!T[i].rvw){T[i].spd=tg[i]>lv?'U':'D';lv=tg[i];lastC=i}
  T[i].lv=lv}
 T[n-1].lv=lv}
function quant(b,m){if(b>2.5)return 1;if(b>1.9&&m!==1)return 1.5;let best=LB[0],d=9;for(const v of LB){const e=Math.abs(v-b);if(e<d){d=e;best=v}}return best}
/* chọn "1 phách" của map: mặc định đúng BPM, nhưng nếu nhịp thường gặp nhất của map là 1/2 hoặc 2 phách thì lấy nó làm phách chuẩn
   để gạch thẳng (nhịp đều) chiếm nhiều nhất và các loại gạch còn lại cân bằng quanh nó */
function assignAngles(T){
 const n=T.length,g=[];for(let i=1;i<n-1;i++){T[i].eb=T[i].beats*MUL[(T[i].lv||0)+1]/(T[i].slow||1);g.push(T[i].eb)}
 const cnt=c=>{let k=0;for(const b of g)if(Math.abs(b/c-1)<.1)k++;return k};
 let m=1,best=cnt(1);for(const c of(g.length&&T[1].slow>1?[2]:[.5,.25,2])){ /* khi đã giới hạn tốc độ quay thì không chọn phách chuẩn nhỏ hơn (sẽ làm quay nhanh lại) */const k=cnt(c);if(k>best*1.15){best=k;m=c}}
 for(let i=0;i<n;i++){const k=T[i];k.bq=i>0&&i<n-1?quant(k.eb/m,m):1}
 return m}
function layout(T){
 const n=T.length;let seed=(n*2654435761)>>>0;for(let i=0;i<n;i++)seed=Math.imul(seed^(T[i].t|0),16777619)>>>0;
 const rnd=mulberry(seed);
 T[0].x=0;T[0].y=0;let phi=0,lastS=1,lastU=-9,x=0,y=0,curl=0;
 const fin=(k,hin,hout,th,ao)=>{k.hin=hin;k.hout=hout;k.th=th;k.ao=ao;k.out=hout};
 if(n>1){fin(T[0],0,0,PI,PI);T[1].x=1;T[1].y=0}else fin(T[0],0,0,PI,PI);
 for(let i=1;i<n-1;i++){
  x=T[i].x;y=T[i].y;const want=T[i].rvw?-lastS:lastS;
  const ev=bv=>{const out=[];
   for(const s of[1,-1]){const ph=wrapA(phi+s*bv*PI-PI),nx=x+Math.cos(ph),ny=y+Math.sin(ph);
    let ok=true,crowd=0,mind=9;
    for(let j=Math.max(0,i-WIN);j<i;j++){if(j===i-1)continue;const d=Math.hypot(nx-T[j].x,ny-T[j].y);if(d<mind)mind=d;if(d<CD)ok=false;if(d<1.8)crowd+=(1.8-d)*(1.8-d)}
    const dr=Math.abs(ph)/PI,ch=wrapA(s*bv*PI-PI),cu=Math.max(0,Math.abs(curl+ch)-CURL)/(PI/3); /* phạt khi đường cuộn tròn quá nửa vòng cùng một phía */
    out.push({s,bv,ph,nx,ny,ok,mind,sc:crowd+2*dr*dr+CW*cu+rnd()*.15+(s===want?0:1.4),ch})}
   return out};
  const bestOK=l=>{let b=null;for(const o of l)if(o.ok&&(!b||o.sc<b.sc))b=o;return b};
  const bq=T[i].bq;let pick=null;const uOK=i-lastU>3;
  /* chọn phương án rẻ nhất trong mọi (góc, chiều quay): lệch góc so với nhịp tốn ít, đảo chiều quay (khi không phải ô đổi chiều) tốn nhiều,
     nên nếu phải né va chạm thì ưu tiên chỉnh nhẹ góc hơn là chen thêm ô đổi chiều */
  for(const v of LB){if(v===2&&!uOK)continue;for(const o of ev(v)){if(!o.ok)continue;o.cost=8*Math.abs(v-bq)+o.sc;if(!pick||o.cost<pick.cost)pick=o}}
  if(!pick){let bm=-1;for(const v of LB){if(v===2&&!uOK)continue;for(const o of ev(v))if(o.mind>bm){bm=o.mind;pick=o}}}
  curl=Math.abs(pick.ch)<1e-9?curl:curl+pick.ch;if(pick.s!==lastS)curl*=.3;T[i].rev=pick.s!==lastS;fin(T[i],phi,pick.ph,pick.bv*PI,pick.s*pick.bv*PI);
  T[i+1].x=pick.nx;T[i+1].y=pick.ny;phi=pick.ph;lastS=pick.s;if(pick.bv===2)lastU=i}
 if(n>1)fin(T[n-1],phi,phi,PI,lastS*PI);
 for(const k of T){if(k.rev==null)k.rev=false;k.rvi=k.rev&&k.rvw; /* chỉ ô đổi chiều theo luật osu! mới có biểu tượng */
  const ap=k.hin+PI,an=k.hout,psi=Math.abs(wrapA(an-ap)),d=Math.round(psi*180/PI);
  k.kind=d===180?'S':d===0?'U':d===90?'R':d===120?'H':d===60?'T':'D'}
 return T}

/* ---------- chuyển map -> chuỗi TilePoint ---------- */
function convert(M,opt){
 const d=M.d,ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),T=[];
 const bl=t=>{try{return tpAt2(M,t).bl||500}catch(e){return 500}};
 const speed=opt.hr?1.5:1;let lastEnd=-1e9;
 /* khoảng cách tối thiểu giữa 2 ô: Vừa = bỏ nhịp dày hơn 1/2 phách (>=150ms); Thưa = chỉ giữ nhịp >= ~1 phách (>=250ms); Gốc = giữ hết */
 const gap=t=>opt.dens===2?Math.max(250,bl(t)*.9):opt.dens===1?Math.max(150,bl(t)*.45):0;
 const add=(t,type,fh,x,y)=>{const l=T[T.length-1];if(l&&t<=l.t+gap(t))return false;T.push({t,type,fh:!!fh,ox:x,oy:y});return true};
 for(const o of ho){if(o.time<lastEnd)continue; /* RemoveUnhitable */
  if(o.kind==='c'){add(o.time,'t',false,o.x,o.y);lastEnd=o.time}
  else{let end=o.end||o.time+500;if(o.kind==='s'){let tp={bl:500,m:1};try{tp=tpAt2(M,o.time)}catch(e){}try{end=o.time+o.len/(d.SliderMultiplier*100*tp.m)*tp.bl*(o.slides||1)}catch(e){}}
   if(end<=o.time)end=o.time+1;
   const sx=o.kind==='p'?256:o.x,sy=o.kind==='p'?192:o.y,ee=o.kind==='s'&&o.pts&&(o.slides||1)%2===1?o.pts[o.pts.length-1]:{x:sx,y:sy};
   if(opt.holds&&end-o.time>=Math.max(gap(o.time),1)){if(add(o.time,'hs',false,sx,sy)){add(end,'he',false,ee.x,ee.y)}}
   else{if(add(o.time,'t',true,sx,sy))add(end,'t',true,ee.x,ee.y)}
   lastEnd=end}}
 const t0=T.length?T[0].t-1000:0,S={t:t0,type:'start',fh:false,ox:T.length?T[0].ox:256,oy:T.length?T[0].oy:192};T.unshift(S);
 /* hình học: thời gian giữ nguyên; góc quét từng ô lấy theo số phách tới ô sau, khoảng cách giữa các ô luôn bằng 1 */
 const n=T.length;
 for(let i=0;i<n;i++){const k=T[i],nx=T[i+1];k.i=i;k.bl=bl(k.t);k.sp=speed;k.dist=1;k.slow=opt.cap>0?Math.max(1,opt.cap/k.bl):1; /* 1 'đơn vị góc' (180°) kéo dài tối thiểu cap ms => giới hạn tốc độ quay */
  k.parent=i?T[i-1]:null;
  if(nx){k.dur=nx.t-k.t;k.beats=k.dur/k.bl}else{k.beats=2;k.dur=2*k.bl}}
 markSpecials(T);assignAngles(T);layout(T);
 for(let i=1;i<n;i++){const a=T[i-1].bl,b=T[i].bl;T[i].ch=Math.round((a/b-1)*100)} /* tăng % tốc độ so với ô trước */
 return T}

async function start(ctx){
 const{M,buf,bg,note,A,cfg,OM}=ctx;stop();hide();try{setAuto(false)}catch(e){}
 const md=mods(),rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,EZ=md.has('EZ'),HR=md.has('HR'),NF=md.has('NF'),HD=md.has('HD'),SD=md.has('SD')||md.has('PF'),AUTO=md.has('AT')||md.has('CN');
 const OD0=M.d.OD!=null?M.d.OD:5,od=EZ?OD0*.5:OD0,Wp=dr(od,70,50,40),Wg=dr(od,200,150,100);
 const T=convert(M,{hr:HR,holds:!!cfg.holds,dens:0,cap:500} /* cố định: mật độ ô = Gốc, tốc độ quay = Vừa (500ms/180°) */),lead=Math.max(0,1800-T[0].t),N=T.length-1;
 const R={M,buf,bg,note,T,cur:1,hold:-1,inp:new Set,bt:0,bside:0,cam:{x:0,y:0},n:[0,0,0,0],score:0,combo:0,max:0,sumc:0,accs:0,N,hp:1,fx:[],shake:[],now:-lead,last:null,fps:60,over:false,paused:false,ctx,rate,Wp,Wg,NF,SD,HD,EZ,cfg,auto:AUTO,raf:0,src:null,t0:0,gp:false,flip:0,seg:null};
 /* tile 0 được "chấm" tự động tại HitTime của nó */
 const k0=T[0];R.seg=mkSeg(R,k0,k0.t,{x:0,y:0},true);
 RUN=R;
 const S=R.S=OM.session({zoom:(cfg.pz||100)/100,fw:FW,fh:FH,buttons:[],pad:false,keys:KEYS,
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
 const last=!nx,long=false; /* vòng quay luôn cùng một cỡ: không co về 0 khi nghỉ dài, không nở ra khi vào lại */
 const r0=1,r1=1;
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

function down(R,id){if(R.over||R.paused||R.auto)return;R.inp.add(id);R.bt=R.now;R.bside^=1;advance(R);
 const k=R.T[R.cur];if(!k)return; /* nhấn luôn bị "tiêu thụ" bởi ô chưa chấm sớm nhất */
 const off=R.now-k.t;if(off<-500)return;
 const v=res(R,off);
 if(v){judge(R,k.i,v);if(k.type==='hs')R.hold=k.i+1}
 else{k.att=(k.att||0)+1;R.shake.push({i:k.i,t:R.now});if(k.att>=2){judge(R,k.i,'M');if(k.type==='hs'){R.T[k.i+1].forced=true}}}
 advance(R)}
function up(R,id){if(R.over||R.paused||R.auto)return;R.inp.delete(id);if(R.inp.size||R.hold<0)return;
 const e=R.T[R.hold];R.hold=-1;if(!e||e.v)return;const off=R.now-e.t,v=res(R,off);
 if(v)judge(R,e.i,v);else{e.att=(e.att||0)+1;if(e.att>=2||off<-R.Wg)e.forced=true;else e.forced=true}}

function loop(){const R=RUN;if(!R||R.over||R.paused)return;const S=R.S,T=R.T,now=(ac.currentTime-R.t0)*1000*R.rate;
 const dt=R.last==null?0:clamp(now-R.last,0,100);R.last=now;R.now=now;if(dt>0)R.fps=R.fps*.92+(1000/(dt/R.rate))*.08;
 const I=S.read();if(I.f&&!R.gp){R.gp=true;down(R,'gp')}else if(!I.f&&R.gp){R.gp=false;up(R,'gp')}
 /* Auto: tự bấm Perfect đúng HitTime (hold-start giữ, hold-end thả) */
 if(R.auto){advance(R);for(let i=R.cur;i<T.length;i++){const k=T[i];if(k.v)continue;if(k.t>now)break;const sv=R.now;R.now=k.t;judge(R,i,'P');R.now=sv;
   if(k.type==='hs')R.hold=i+1;else if(k.type==='he')R.hold=-1;if(k.type!=='he'){R.bt=k.t;R.bside^=1}}advance(R)}
 /* ô tile 0: chấm tự động */
 /* tự trượt: offset > min(missWindow, Duration/2); hold-end bị ép Miss tại giờ kết thúc nếu ReleaseMissed */
 for(let i=R.cur;i<T.length;i++){const k=T[i];if(k.v)continue;
  if(k.type==='he'&&k.forced&&now>=k.t){judge(R,i,'M');if(R.hold===i)R.hold=-1;continue}
  if(k.type==='he'&&T[i-1].v==='M'&&now>=k.t){judge(R,i,'M');continue}
  if(now-k.t>Math.min(R.Wg,k.dur/2)){judge(R,i,'M');if(k.type==='hs'){T[i+1].forced=true}if(R.hold===i)R.hold=-1;continue}
  if(k.type!=='he'&&now<k.t-R.Wg)break}
 advance(R);
 if(R.fail&&!R.NF)return finish(R,true);
 let sk=null;if(R.cur===1&&T.length>1){const nx=T[1].t;if(nx-now>3500)sk=nx-2000} /* chỉ skip đoạn mở đầu */S.setSkip(sk);
 const last=T[T.length-1].t;
 if(R.cur>=T.length&&now>last+1200)return finish(R,false);
 if(R.src&&R.buf&&now>R.buf.duration*1000+1000&&R.cur>=T.length)return finish(R,false);
 draw(R,now);R.raf=requestAnimationFrame(loop)}

/* ---------- vẽ ---------- */
function panel(g,x,y,w,h,lab,val){g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,w,h,5);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;g.stroke();g.fillStyle='#222';g.textBaseline='middle';g.textAlign='left';g.font='bold '+Math.round(h*.36)+'px sans-serif';g.fillText(lab,x+12,y+h/2+1);g.textAlign='right';g.font='bold '+Math.round(h*.46)+'px sans-serif';g.fillText(val,x+w-12,y+h/2+1)}
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
 for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
 for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
 lo.pop();up.pop();return lo.concat(up)}
function tileShape(k){
 /* Dải đường liền kiểu ADOFAI/Yoso: mọi ô cùng bề rộng (nửa rộng W = 0.5 = nửa khoảng cách giữa hai ô). Gạch ô i chiếm đúng từ TRUNG ĐIỂM đoạn nối ô trước
    tới TRUNG ĐIỂM đoạn nối ô sau, nên hai gạch kề nhau dùng chung đúng một cạnh (không khe hở). Chỗ rẽ: góc >= 90° là khớp góc vuông/chéo (miter),
    góc nhọn hơn thì vát cạnh ngoài. 180° = hình vuông, 360° = đầu cụt tròn. */
 const W=TW*SP,H=.5*SP,x=k.x*SP,y=k.y*SP,ap=k.hin+PI,an=k.hout,d=wrapA(an-ap),psi=Math.abs(d);
 const dp=[Math.cos(ap),Math.sin(ap)],dn=[Math.cos(an),Math.sin(an)],Mp=[x+dp[0]*H,y+dp[1]*H],Mn=[x+dn[0]*H,y+dn[1]*H];
 if(psi<.01){const nx=-dp[1],ny=dp[0],pts=[[Mp[0]+nx*W,Mp[1]+ny*W],[Mp[0]-nx*W,Mp[1]-ny*W]];
  for(let t=0;t<=12;t++){const a=ap-PI/2-t/12*PI;pts.push([x+Math.cos(a)*W,y+Math.sin(a)*W])}return pts}
 if(psi>PI-.01){const nx=-dp[1],ny=dp[0];return[[Mp[0]+nx*W,Mp[1]+ny*W],[Mp[0]-nx*W,Mp[1]-ny*W],[Mn[0]-nx*W,Mn[1]-ny*W],[Mn[0]+nx*W,Mn[1]+ny*W]]}
 const bx=dp[0]+dn[0],by=dp[1]+dn[1],bl=Math.hypot(bx,by),b=[bx/bl,by/bl];
 const inner=v=>{let nx=-v[1],ny=v[0];if(nx*b[0]+ny*b[1]<0){nx=-nx;ny=-ny}return[nx,ny]},np=inner(dp),nn=inner(dn);
 const pI=[Mp[0]+np[0]*W,Mp[1]+np[1]*W],pO=[Mp[0]-np[0]*W,Mp[1]-np[1]*W],nI=[Mn[0]+nn[0]*W,Mn[1]+nn[1]*W],nO=[Mn[0]-nn[0]*W,Mn[1]-nn[1]*W];
 if(psi>=PI/2-.01){const m=W/Math.sin(psi/2);return[pO,[x-b[0]*m,y-b[1]*m],nO,nI,[x+b[0]*m,y+b[1]*m],pI]}
 /* khúc cua gắt (< 90°): chữ U/V — hai cánh song song nối bằng đầu bo tròn quanh tâm ô, góc trong nhọn */
 {const a1=Math.atan2(-np[1],-np[0]),da=wrapA(Math.atan2(-nn[1],-nn[0])-a1),arc=[];for(let t=0;t<=10;t++){const a=a1+da*t/10;arc.push([x+Math.cos(a)*W,y+Math.sin(a)*W])}
  const m=W/Math.sin(psi/2),inOK=m*Math.cos(psi/2)<H*.98;
  if(inOK)return[pO].concat(arc,[nO,nI,[x+b[0]*m,y+b[1]*m],pI]);
  return hull([pO,pI,nO,nI].concat(arc))}}
function rabbit(c){ /* thỏ: tăng tốc (cam) */
 g.fillStyle=c;g.strokeStyle=c;g.lineCap='round';g.lineJoin='round';
 g.beginPath();g.ellipse(-3,3,11,7.5,0,0,6.2832);g.fill();           /* thân */
 g.beginPath();g.arc(-13.5,2.5,3.6,0,6.2832);g.fill();                /* đuôi bông */
 g.beginPath();g.arc(8,-2,6,0,6.2832);g.fill();                       /* đầu */
 g.lineWidth=3.6;g.beginPath();g.moveTo(7,-6);g.quadraticCurveTo(3,-13,5,-18);g.stroke();   /* tai sau */
 g.beginPath();g.moveTo(10,-6);g.quadraticCurveTo(10,-14,14,-18);g.stroke();                /* tai trước */
 g.lineWidth=3;g.beginPath();g.moveTo(3,8);g.lineTo(9,9);g.moveTo(-9,9.5);g.lineTo(-3,9.5);g.stroke(); /* chân */
 g.fillStyle='#fff';g.beginPath();g.arc(10,-3.5,1.6,0,6.2832);g.fill();g.fillStyle='#3b1d00';g.beginPath();g.arc(10.5,-3.5,.8,0,6.2832);g.fill()}
function turtle(c){ /* rùa: giảm tốc (xanh) */
 g.fillStyle=c;g.strokeStyle=c;g.lineCap='round';g.lineJoin='round';
 g.beginPath();g.arc(-2,3,11,Math.PI,0);g.closePath();g.fill();       /* mai */
 g.beginPath();g.arc(12.5,0,4.2,0,6.2832);g.fill();                   /* đầu */
 g.lineWidth=3.4;g.beginPath();g.moveTo(-6,3);g.lineTo(-7,9);g.moveTo(3,3);g.lineTo(4,9);g.stroke(); /* chân */
 g.lineWidth=2.4;g.beginPath();g.moveTo(-13,3);g.lineTo(-17,5);g.stroke();                            /* đuôi */
 g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.6;
 g.beginPath();g.moveTo(-2,-8);g.lineTo(-2,3);g.moveTo(-9,-3);g.lineTo(-2,0);g.moveTo(5,-3);g.lineTo(-2,0);g.stroke();
 g.fillStyle='#fff';g.beginPath();g.arc(13.8,-1,1.3,0,6.2832);g.fill()}
function vortex(c,dir){ /* xoáy: đổi chiều quay; mũi tên chỉ chiều quay MỚI (dir>0 = cùng chiều kim đồng hồ) */
 g.strokeStyle=c;g.fillStyle=c;g.lineCap='round';g.lineJoin='round';g.lineWidth=3.4;
 const N=40,TH=3.3*PI,pt=u=>{const th=u*TH,r=2.5+u*14,a=(dir>=0?1:-1)*th;return[Math.cos(a)*r,Math.sin(a)*r]};
 g.beginPath();for(let i=0;i<=N;i++){const q=pt(i/N);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}g.stroke();
 const e=pt(1),b=pt(.93);let tx=e[0]-b[0],ty=e[1]-b[1];const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const nx=-ty,ny=tx;
 g.beginPath();g.moveTo(e[0]+tx*8,e[1]+ty*8);g.lineTo(e[0]+nx*6.5,e[1]+ny*6.5);g.lineTo(e[0]-nx*6.5,e[1]-ny*6.5);g.closePath();g.fill()}
function icons(k,x,y){
 /* tăng tốc: thỏ cam | giảm tốc: rùa xanh | đổi chiều: xoáy tím + mũi tên theo chiều quay mới */
 const both=k.rvi&&k.spd,sc=(SP/70)*(both?.5:.72),off=both?15*(SP/70):0;
 const one=(kind,ox)=>{g.save();g.translate(x+ox,y);g.scale(sc,sc);
  if(kind==='R')vortex('#8a3ffc',k.ao>=0?1:-1);else if(kind==='U')rabbit('#ff7a00');else turtle('#1e78ff');
  g.restore()};
 if(k.rvi)one('R',both?-off:0);if(k.spd)one(k.spd,both?off:0)}
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
 /* đường đi kiểu ADOFAI: mỗi ô là một viên gạch cùng kích thước, hình theo góc quét (thẳng / góc vuông / khớp chéo / tam giác / lục giác / quay đầu). Chỉ vẽ AHEAD viên sắp tới (nhạt dần theo xa), gạch đã qua tan biến nhanh,
    gạch bị gạch gần thời điểm chơi hơn đè lên thì không vẽ => không còn đống gạch chồng chất. */
 const j0=Math.max(0,R.cur-3),j1=Math.min(T.length-1,R.cur+AHEAD),hwx=FW/2/z/SP+1.3,hhy=FH/2/z/SP+1.3,cxw=R.cam.x,cyw=R.cam.y;
 const prio=i=>i>=R.cur?i-R.cur:1000+R.cur-i,tl=[];
 for(let i=j0;i<=j1;i++){const k=T[i];if(k.x<cxw-hwx||k.x>cxw+hwx||k.y<cyw-hhy||k.y>cyw+hhy)continue;tl.push({i,k,p:prio(i),f:false})}
 for(const t1 of tl){for(const t2 of tl){if(t2.p<t1.p&&t2.i>=1&&Math.abs(t2.i-t1.i)>2&&psd(t1.k.x,t1.k.y,T[t2.i-1].x,T[t2.i-1].y,t2.k.x,t2.k.y)<.26){t1.f=true;break}}}
 tl.sort((u,v)=>v.p-u.p);
 g.lineJoin='round';
 for(const t of tl){const k=t.k;if(t.f)continue;const pts=tileShape(k);
  /* độ mờ chỉ phụ thuộc thứ tự chơi: gạch sắp tới nhạt dần theo xa, gạch đã qua tan biến trong ~0.8s */
  let al=t.i>=R.cur?1-.62*clamp((t.p-2)/(AHEAD-2),0,1):clamp(1-(now-(k.jt!=null?k.jt:k.t))/800,0,1)*.7;
  if(R.HD&&!k.v)al=Math.min(al,clamp((k.t-now)/700,0,1));if(al<=.03)continue;
  const near=t.i>=R.cur&&t.p<3,fill=k.rvi?'rgba(228,208,255,.97)':k.spd==='U'?'rgba(255,214,168,.97)':k.spd==='D'?'rgba(176,216,255,.97)':'rgba(238,244,255,.95)',stk='rgba(110,150,225,.95)'; /* gạch thường cùng một màu/mẫu; ô đặc biệt có màu riêng */
  let sh=0;for(const s of R.shake)if(s.i===k.i&&now-s.t<250)sh=Math.sin((now-s.t)*.12)*4*(1-(now-s.t)/250);
  g.save();if(sh)g.translate(sh,0);g.globalAlpha=al;
  if(near){g.shadowColor='rgba(190,220,255,.95)';g.shadowBlur=16}
  g.beginPath();for(let j=0;j<pts.length;j++){if(j)g.lineTo(pts[j][0],pts[j][1]);else g.moveTo(pts[j][0],pts[j][1])}g.closePath();
  g.fillStyle=fill;g.fill();g.shadowBlur=0;g.strokeStyle=stk;g.lineWidth=2;g.stroke();
  if(k.type==='hs'||k.type==='he'){g.strokeStyle='#ffb04d';g.lineWidth=3;g.stroke()}
  if(t.i===R.cur&&!k.v){g.strokeStyle=ACC;g.lineWidth=3;g.stroke()}
  g.restore()}
 g.globalAlpha=1;
 /* vòng đứt quanh tâm */
 g.save();g.globalAlpha=.15;g.setLineDash([6,8]);g.lineDashOffset=-now/40;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(pv.x*SP,pv.y*SP,Math.max(4,o.r*SP),0,6.2832);g.stroke();g.restore();
 /* điểm đánh dấu trên gạch + nhãn đổi tốc độ */
 for(const t of tl){if(t.f)continue;const k=t.k;let a=1;if(R.HD&&!k.v)a=clamp((k.t-now)/700,0,1);if(t.i<R.cur)a*=.4;if(a<=.02)continue;g.globalAlpha=a;const x=k.x*SP,y=k.y*SP;
  if(!k.v&&k.type!=='start'){if(k.rvi||k.spd)icons(k,x,y);else{g.fillStyle=ACC;g.beginPath();g.arc(x,y,4.5,0,6.2832);g.fill()}}
  if(k.i>0&&!k.v&&k.ch&&Math.abs(k.ch)>=1&&k.t-now<4000){g.fillStyle=k.ch>0?'#ff9a3c':'#1e90ff';g.font='bold 13px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((k.ch>0?'+':'')+k.ch+'%',x,y-26)}
  g.globalAlpha=1}
 R.shake=R.shake.filter(s=>now-s.t<250);
 /* điểm */
 R.fx=R.fx.filter(f=>now-f.t<600);for(const f of R.fx){const k=T[f.i];if(!k)continue;const q=(now-f.t)/600;g.globalAlpha=1-q;
  g.fillStyle=f.v==='P'?'#ffd84d':f.v==='G'?'#7dff9a':f.v==='O'?'#6cf':'#f55';g.font='bold 18px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(NAME[f.v],k.x*SP,k.y*SP-34-q*18);g.globalAlpha=1}
 /* hai quả cầu: màu đổi vai mỗi lần swap */
 const sw=R.swaps||0;let ns=0;for(let i=0;i<=R.seg.idx;i++){}
 let cnt2=0;for(let i=1;i<=R.seg.idx;i++){const nk=T[i];if(nk&&nk.parent===T[i-1]&&T[i-1].v)cnt2++}
 const pc=cnt2%2?ICE:FIRE,mc=cnt2%2?FIRE:ICE,orb=(x,y,c)=>{g.fillStyle=c;g.shadowColor=c;g.shadowBlur=14;g.beginPath();g.arc(x*SP,y*SP,13,0,6.2832);g.fill();g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=2.5;g.stroke()};
 orb(pv.x,pv.y,pc);orb(o.x,o.y,mc);
 g.restore();
 const tot=Math.max(1,R.buf?R.buf.duration*1000:1),n=R.n,jn=n[0]+n[1]+n[2]+n[3],acc=jn?R.accs/jn:1;
 if(cfg.bot&&A.bot){const b=R.hold>=0?A.bot.hold:now-R.bt<130&&R.bt>0?(R.bside?A.bot.left:A.bot.right):A.bot.neutral,bw=Math.min(90,fw*.2),bh=bw*b.height/b.width;g.globalAlpha=.9;g.drawImage(b,fx+fw-bw-8,fy+fh-bh-6,bw,bh);g.globalAlpha=1}
 

 OM.hud({score:R.score,combo:R.combo,acc,hp:R.hp},L,now,tot);
 if(R.S.sk!=null&&!R.S.ov&&!('ontouchstart' in window)){g.textAlign='center';g.textBaseline='alphabetic';g.font='bold 15px sans-serif';g.fillStyle='#7dff9a';g.fillText('Enter: Skip »',fx+fw/2,fy+fh-14)}
 OM.fps(R.fps)
 g.restore()}

function finish(R,fail){if(R.over)return;const M=R.M,n=R.n,jn=n[0]+n[1]+n[2]+n[3],acc=jn?R.accs/jn:1,ctx=R.ctx;stop();
 OM.results({mode:'Hitokori',M,score:R.score,cells:[['Perfect',n[0],'#6cf'],['Late',n[1],'#8f6'],['Early',n[2],'#fc4'],['Miss',n[3],'#f55']],miss:n[3],max:R.max,acc,fail,retry:()=>ctx.restart(),back:()=>ctx.quit()})}
})();
