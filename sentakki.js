/* Adapter Sentakki (viết lại theo luật gốc của ruleset osu.Game.Rulesets.Sentakki).
   Sân 600x600, 8 làn (làn n = 22.5° + n*45° theo chiều kim đồng hồ từ trên), vòng chạm bán kính 296.5, nốt xuất phát ở bán kính 66.
   Cửa sổ chấm (đơn vị 1000/60 ms): Tap P1 G3 Gd6 M9 · nhả Hold P3 G6 Gd9 M12 · thân Slide P14 G14 Gd26 M36 · TouchHold theo % thời gian giữ.
   Tên kết quả theo bản gốc: Critical / Perfect / Great / Good / Miss. HR = cửa sổ "Maji" + theo dõi slide nghiêm ngặt.
   Chuyển map (mặc định của bản gốc, không bật Twin/Fan): Circle -> Tap (Break nếu hitsound finish) · Slider -> Slide (đường chọn ngẫu nhiên từ các hình Straight/Circle/V/U/Cup/Thunder
   có độ dài phù hợp thời lượng; slider "lười" hoặc quá ngắn -> Hold) · Spinner -> TouchHold ở tâm. Không có nốt Touch từ map osu!standard.
   Slide: sao SlideTap rồi thân slide có các checkpoint (floor(độ dài/130)/đoạn), mỗi checkpoint là vòng tròn bán kính 100: CHẠM/ĐƯA ngón qua theo thứ tự.
   Điều khiển: chạm vào vòng ngoài (r>=200) = làn theo góc · bàn phím A S D F | J K L ; = 8 làn · Space hoặc chạm giữa = TouchHold. */
(()=>{
const OM=window.OM;if(!OM)return;
const FW=600,FH=600,CX=300,CY=300,IR=296.5,NS=66,D2R=Math.PI/180,TU=1000/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const KEYLANE={KeyA:7,KeyS:6,KeyD:5,KeyF:4,KeyJ:0,KeyK:1,KeyL:2,Semicolon:3},KEYS=Object.keys(KEYLANE).concat(['Space']);
const rot=l=>22.5+l*45,P=(r,a)=>({x:r*Math.sin(a*D2R),y:-r*Math.cos(a*D2R)}),lanePos=l=>P(IR,rot(l)),mod=(a,b)=>((a%b)+b)%b;
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
function rng(s){s=s>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
let RUN=null;

OM.register({id:'sentakki',name:'Sentakki',asm:'osu.Game.Rulesets.Sentakki',
 settings:[
  {k:'speed',label:'Tốc độ nốt (Animation speed, gốc 2.0)',t:'range',min:1,max:10,step:.5,u:'',def:2},
  {k:'dim',label:'Playfield dim',t:'range',min:0,max:100,step:5,u:'%',def:60}],
 support:M=>M.mode?'Sentakki chỉ chơi map osu!standard':'',
 async build(info){const im=await Promise.all((info.pngs||[]).map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null)));
  const wav=(info.audio||[]).find(a=>a.type==='wav');return{ok:true,icon:im.find(Boolean)||null,slideRaw:wav?wav.bytes:null,slide:null}},
 icon(A){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#1b1540';x.beginPath();x.arc(64,64,62,0,7);x.fill();
  if(A.icon)x.drawImage(A.icon,14,14,100,100);else{x.strokeStyle='#fff';x.lineWidth=10;x.beginPath();x.arc(64,64,46,0,7);x.stroke()}return c.toDataURL()},
 async start(ctx){return start(ctx)}});

/* ================= SlidePaths (theo SlidePaths.cs) ================= */
const lerp=(a,b,f)=>({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}),add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
function arc3(p0,p1,p2){ /* cung tròn đi qua 3 điểm, theo thứ tự p0->p1->p2 */
 const ax=p0.x,ay=p0.y,bx=p1.x,by=p1.y,cx=p2.x,cy=p2.y,d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
 if(Math.abs(d)<1e-6)return[p0,p2];
 const ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d,uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d,r=Math.hypot(ax-ux,ay-uy);
 const a0=Math.atan2(ay-uy,ax-ux),a1=Math.atan2(by-uy,bx-ux),a2=Math.atan2(cy-uy,cx-ux),TP=Math.PI*2;
 const dir=((bx-ax)*(cy-by)-(by-ay)*(cx-bx))>0?1:-1;let sw=dir>0?mod(a2-a0,TP):-mod(a0-a2,TP);
 /* đảm bảo đi qua p1 */
 const s1=dir>0?mod(a1-a0,TP):mod(a0-a1,TP);if(s1>Math.abs(sw))sw=dir*(TP-Math.abs(sw))*-1;
 const n=Math.max(8,Math.ceil(Math.abs(sw)*r/6)),out=[];for(let i=0;i<=n;i++){const a=a0+sw*i/n;out.push({x:ux+Math.cos(a)*r,y:uy+Math.sin(a)*r})}return out}
function isect(a1,a2,b1,b2){const tmp=(b2.x-b1.x)*(a2.y-a1.y)-(b2.y-b1.y)*(a2.x-a1.x),mu=((a1.x-b1.x)*(a2.y-a1.y)-(a1.y-b1.y)*(a2.x-a1.x))/tmp;return{x:b1.x+(b2.x-b1.x)*mu,y:b1.y+(b2.y-b1.y)*mu}}
/* trả về danh sách điểm đã lấy mẫu của 1 segment (bắt đầu ở lane start) */
function segPts(sh,end,mir,s){
 const lp=l=>lanePos(l);end=mod(end,8);const L=(...p)=>p;
 switch(sh){
 case'straight':return[lp(s),lp(end+s)];
 case'v':return[lp(s),{x:0,y:0},lp(end+s)];
 case'thunder':{const l1=(mir?3:5)+s,l2=(mir?2:6)+s,l3=(mir?6:2)+s,l4=(mir?7:1)+s,n0=lp(s),n1=isect(lp(s),lp(l1),lp(l2),lp(l3)),n2=isect(lp(l2),lp(l3),lp(l4),lp(4+s)),n3=lp(4+s);return[n0,n1,n2,n3]}
 case'circle':{const ccw=mir,full=end===0,sa=rot(s),ea=rot(end+s);let ca;if(full)ca=rot(s+4);else{ca=(sa+ea)/2;if(ccw)ca+=180}
  const tw=.1*(ccw?-1:1);return arc3(P(IR,sa+tw),P(IR,ca),P(IR,ea))}
 case'u':{const n0=lp(s),n1=lerp(n0,lp((mir?3:5)+s),.51),ad=(rot(end+s)+rot(s))/2+(Math.abs(end)>(mir?3:4)?0:180),n2=P(115,ad),n4=lp(end+s),n3=lerp(n4,lp(end+(mir?-3:3)+s),.51);
  return[n0].concat(arc3(n1,n2,n3),[n4])}
 case'cup':{const r=135,x=mir?mod(-end,8):end;let o=90,a1=300,a2=269,a3=230,le=[60,90,180,240,300,330,360,390][x];const off=s*45;
  if(mir){o=-o+45;a1=-a1+45;a2=-a2+45;a3=-a3+45;le=-le+45}
  const lo=P(r,o+off),n0=lp(s),n1=add(lo,P(r,a1+off)),n2=add(lo,P(r,a2+off)),n3=add(lo,P(r,a3+off)),n4=add(lo,P(r,(a3+le)/2+(x>=3?180:0)+off)),n5=add(lo,P(r,le+off)),n6=lp(end+s);
  return[n0].concat(arc3(n1,n2,n3),arc3(n3,n4,n5).slice(1),[n6])}}
 return[lp(s),lp(end+s)]}
function mkPoly(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));return{pts,cum,len:cum[cum.length-1]}}
function polyAt(pl,f){const d=clamp(f,0,1)*pl.len;let i=0;while(i<pl.pts.length-2&&pl.cum[i+1]<d)i++;const s=pl.cum[i+1]-pl.cum[i]||1;return lerp(pl.pts[i],pl.pts[i+1],clamp((d-pl.cum[i])/s,0,1))}
const SHAPES=['straight','circle','v','u','cup','thunder'];
const VALID=[];for(const sh of SHAPES)for(let j=0;j<8;j++){if(sh==='straight'&&(j<=1||j>=7))continue;if(sh==='circle'&&(j===7||j===1))continue;
 for(let k=0;k<2;k++){const mir=k===1;let ok=true;
  if(sh==='straight')ok=j!==0&&!mir;else if(sh==='circle')ok=true;else if(sh==='v')ok=!mir&&j!==0;else if(sh==='thunder')ok=j===4;
  if(!ok)continue;VALID.push({sh,end:j,mir,min:mkPoly(segPts(sh,j,mir,0)).len/5})}}
/* SlideBody: gộp các segment, tạo checkpoint */
function mkBody(segs,dur,wait){const paths=[];let cur=0,total=0;for(const s of segs){const pl=mkPoly(segPts(s.sh,s.end,s.mir,mod(cur,8)));paths.push(pl);total+=pl.len;cur+=s.end}
 const starts=[];let acc=0;for(const p of paths){starts.push(acc/total);acc+=p.len}
 const at=pr=>{pr=clamp(pr,0,1);let i=0;while(i+1<segs.length&&starts[i+1]<=pr)i++;const e=i+1<segs.length?starts[i+1]:1;return polyAt(paths[i],(pr-starts[i])/(e-starts[i]))};
 const wd=clamp(wait,0,dur),mv=dur-wd,cps=[];let progress=0;
 for(let i=0;i<segs.length;i++){const ratio=paths[i].len/total,n=Math.floor(paths[i].len/130);for(let j=0;j<n;j++){progress+=(1/n)*ratio;cps.push({pr:progress,pos:at(progress),tm:wd+progress*mv,hit:false,pc:0})}}
 return{segs,paths,starts,total,at,wd,mv,cps,end:cps.length?0:0,rel:cur}}

/* ================= chuyển map osu!standard -> nốt Sentakki ================= */
function convert(M,seed){
 const d=M.d,ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),N=[],rnd=rng(seed);
 const cr=54.4-4.48*(d.CS!=null?d.CS:4),bl=t=>{try{return tpAt2(M,t).bl||500}catch(e){return 500}};
 const info=o=>{ /* thời lượng, đường đi, vị trí cuối */
  if(o.kind==='c')return{dur:0,end:{x:o.x,y:o.y}};
  if(o.kind==='p'){const e=o.end||o.time+500;return{dur:Math.max(1,e-o.time),end:{x:o.x,y:o.y}}}
  let tp={bl:500,m:1};try{tp=tpAt2(M,o.time)}catch(e){}
  const slides=o.slides||1,span=o.len/(d.SliderMultiplier*100*tp.m)*tp.bl;let path=null;try{if(o.pts)path=o.path||buildPath(o)}catch(e){}
  if(path)o.path=path;const last=path?(slides%2?path[path.length-1]:path[0]):{x:o.x,y:o.y};
  return{dur:span*slides,span,slides,path,end:{x:last.x,y:last.y},tp}};
 const I=ho.map(info),ang=(a,b)=>mod(Math.atan2(b.y-a.y,b.x-a.x)/D2R+90,360),delta=(a,b)=>{let x=(b-a)%360;if(x<-180)x+=360;else if(x>180)x-=360;return x};
 const closest=a=>{a=mod(a,360);let m=1e9,c=-1;for(let i=0;i<8;i++){const dl=Math.abs(delta(rot(i),a));if(dl<m){m=dl;c=i}}return c};
 const CEN={x:256,y:192},pos=o=>({x:o.x,y:o.y}),close=(a,b)=>b.time-(a.time+(a._d||0))<=bl(b.time),overl=(a,b)=>(b.x-a.x)**2+(b.y-a.y)**2<=(cr*2)**2;
 ho.forEach((o,i)=>{o._d=I[i].dur});
 let lane=ho.length?closest(ang(CEN,pos(ho[0]))):0,dir=0;
 const mid=(cur,prev,nxt,ci,pi)=>{let pts=[I[ci].end],c=1;if(prev){pts.push(I[pi].end);c++}pts.push(pos(nxt));c++;if(cur.x!==I[ci].end.x||cur.y!==I[ci].end.y){pts.push(pos(cur));c++}
  if(c>2){let sx=0,sy=0;for(const p of pts){sx+=p.x;sy+=p.y}return{x:sx/c,y:sy/c}}return CEN};
 const sdir=(ci,pi,ni)=>{const cur=ho[ci],prev=pi>=0?ho[pi]:null,nxt=ho[ni];const m=mid(cur,prev,nxt,ci,pi),ca=ang(m,I[ci].end),na=ang(m,pos(nxt)),ad=delta(ca,na),aa=Math.abs(ad);
  if(Math.abs(aa)<=5)return dir;if(Math.abs(aa-180)<=5)return 0;return ad>0?1:-1};
 const lazy=(o,inf)=>{if(o.kind!=='s'||!inf.path)return false;const lim=(cr*2.4)**2;return inf.path.every(p=>(p.x-o.x)**2+(p.y-o.y)**2<lim)};
 for(let i=0;i<ho.length;i++){const o=ho[i],inf=I[i],t=o.time,brk=!!(o.hs&4);let res;
  if(o.kind==='c')res={type:'tap',t,lane:mod(lane,8),brk};
  else if(o.kind==='p')res={type:'th',t,e:t+inf.dur,brk};
  else{let sl=null;
   if(!lazy(o,inf)){let beat=bl(t),w=1,ok=true;while(w*beat>=inf.dur-50){w/=2;if(w<.5){ok=false;break}}
    if(ok){const wms=w*beat,vel=Math.max(.01,(d.SliderMultiplier||1)*inf.tp.m),vf=1+1/vel;let adj=inf.dur-wms,parts=[],last=null;
     for(;;){const cand=VALID.filter(p=>p.min*vf<adj);for(let k=cand.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[cand[k],cand[j]]=[cand[j],cand[k]]}
      let c=0;while(c<cand.length&&cand[c].sh==='circle'&&!(!last||last.sh!=='circle'||cand[c].mir!==last.mir||last.end===0))c++;
      if(c>=cand.length)break;const ch=cand[c];adj-=ch.min*vf;parts.push(last=ch)}
     if(parts.length)sl={type:'slide',t,e:t+inf.dur,lane:mod(lane,8),brk,body:mkBody(parts,inf.dur,wms)}}}
   res=sl||{type:'hold',t,e:t+inf.dur,lane:mod(lane,8),brk}}
  N.push(res);
  /* cập nhật làn kế tiếp (updateCurrentLane) */
  const nx=ho[i+1];if(!nx)continue;
  if(!close(o,nx)){lane=closest(ang(CEN,pos(nx)));dir=0;continue}
  const pv=i>0?ho[i-1]:null;
  const isJump=(I[i].end.x-nx.x)**2+(I[i].end.y-nx.y)**2>=128*128;
  if(isJump){dir=0;const m=mid(o,pv,nx,i,i-1),a1=closest(ang(m,I[i].end)),a2=closest(ang(m,pos(nx)));lane=mod(lane+a2-a1,8);continue}
  const ovEnd=overl(I[i].end,pos(nx));
  if(!pv||!close(pv,o)){dir=i+2<ho.length?sdir(i+1,pv?i-1:-1,i+2):sdir(i,-1,i+1)}else dir=sdir(i,i-1,i+1);
  if(res.type==='slide'){if(overl(pos(o),pos(nx)))continue;lane+=res.body.rel}else lane+=dir;
  if(!ovEnd)lane+=dir===0?1:dir;lane=mod(lane,8)}
 return N}

async function start(ctx){
 const{M,buf,bg,note,A,cfg,OM}=ctx;stop();hide();try{setAuto(false)}catch(e){}
 if(!A.slide&&A.slideRaw&&window.ac){try{const b=A.slideRaw;A.slide=await new Promise((r,j)=>{const q=ac.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),r,j);if(q&&q.catch)q.catch(j)})}catch(e){}}
 const md=mods(),rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,HR=md.has('HR'),NF=md.has('NF'),HD=md.has('HD'),SD=md.has('SD')||md.has('PF'),AUTO=md.has('AT')||md.has('CN');
 const d=M.d,seed=(Math.round((d.HP||5)+(d.CS||4))*20+Math.floor((d.OD!=null?d.OD:5)*41.2)+Math.round(d.ApproachRate!=null?d.ApproachRate:d.AR!=null?d.AR:7))|0;
 const N=convert(M,seed),spd=cfg.speed||2,entry=2*2400/(spd+1);
 /* cửa sổ (ms) */
 const w=HR?{tap:[1,2,3,6],rel:[2,4,6,8],sl:[14,14,26,26]}:{tap:[1,3,6,9],rel:[3,6,9,12],sl:[14,14,26,36]};
 const W={tap:w.tap.map(x=>x*TU),rel:w.rel.map(x=>x*TU),sl:w.sl.map(x=>x*TU)};
 let tw=0;for(const n of N){const b=n.brk?5:1;n.w=n.type==='tap'?b:n.type==='hold'?b+b:n.type==='slide'?1+(n.brk?5:3):1;tw+=n.w}
 const lastT=N.length?Math.max(...N.map(n=>n.e||n.t)):0,first=N.length?N[0].t:0,lead=Math.max(0,1800-first+entry*.2);
 const R={M,buf,bg,note,N,ni:0,act:[],ptr:{},kd:{},LC:new Array(8).fill(0),n:[0,0,0,0,0],score:0,combo:0,max:0,sumc:0,wsum:0,wacc:0,wj:0,tw:Math.max(1,tw),cnt:0,tot:0,hp:0,hpmax:0,fx:[],now:-lead,last:null,fps:60,over:false,paused:false,ctx,rate,entry,W,HR,NF,SD,HD,auto:AUTO,cfg,raf:0,src:null,t0:0,lastT};
 for(const n of N)R.tot+=n.type==='tap'?1:n.type==='hold'||n.type==='slide'?2:1;
 RUN=R;
 const S=R.S=OM.session({fw:FW,fh:FH,buttons:[],pad:false,keys:KEYS,
  onKey(c,dn){if(dn)keyDown(R,c);else keyUp(R,c)},
  onPtr(t,x,y,id){ptr(R,t,x,y,id)},
  onPause(){R.paused=true;releaseAll(R);try{ac.suspend()}catch(e){}},
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

/* ================= chấm điểm ================= */
/* kết quả: 0 Critical(Perfect gốc) 1 Perfect(Great gốc) 2 Great(Good gốc) 3 Good(Meh gốc) 4 Miss */
const NAMES=['Critical','Perfect','Great','Good','Miss'],BASE=[305,300,200,100,0],HPV=[1,1,2/3,1/3,0],COLS=['#ffd84d','#ff9a5c','#7dff9a','#6cf','#f55'];
const resWin=(win,off)=>{const a=Math.abs(off);return a<=win[0]?0:a<=win[1]?1:a<=win[2]?2:a<=win[3]?3:-1};
function judge(R,v,w,x,y){R.n[v]++;R.cnt++;
 if(v===4){R.combo=0;if(R.SD)R.fail=true}else{R.combo++}
 R.max=Math.max(R.max,R.combo);R.sumc+=R.combo;R.wsum+=w;R.wacc+=w*BASE[v]/305;R.hp+=w*HPV[v];R.hpmax+=w;
 const nt=Math.max(1,R.tot);R.score=Math.round(150000*R.sumc/(nt*(nt+1)/2)+850000*Math.pow(R.wacc/R.wsum,2+2*R.wacc/R.wsum)*(R.wsum/R.tw));
 R.fx.push({x,y,t:R.now,v})}
const lpos=(l,p)=>P(NS+(IR-NS)*p,rot(l));

function pressLane(R,lane){const now=R.now;let b=null;
 for(const n of R.act){if(n.lane!==lane)continue;let t;
  if(n.type==='tap'&&n.j==null)t=n;else if(n.type==='hold'&&n.hj==null)t=n;else if(n.type==='slide'&&n.hj==null)t=n;else continue;
  const off=now-n.t;if(off<-R.W.tap[3]||off>R.W.tap[3])continue;if(!b||n.t<b.t)b=n}
 if(!b)return;const off=now-b.t,v=resWin(R.W.tap,off),p=lpos(b.lane,1);
 if(b.type==='tap'){b.j=v;judge(R,v,b.brk?5:1,p.x+CX,p.y+CY)}
 else{b.hj=v;judge(R,v,b.brk?5:1,p.x+CX,p.y+CY);if(b.type==='hold'&&v<4){b.holding=1;b.press=now}}}
function releaseLane(R,lane){const now=R.now;for(const n of R.act){if(n.type!=='hold'||n.lane!==lane||!n.holding)continue;n.holding=0;const off=now-n.e,v=resWin(R.W.rel,off),p=lpos(n.lane,1);
  if(off<0&&v<0)n.tj=4;else n.tj=v<0?3:v;judge(R,n.tj,n.brk?5:1,p.x+CX,p.y+CY)}}
const laneUp=(R,l)=>{if(--R.LC[l]<=0){R.LC[l]=0;releaseLane(R,l)}},laneDown=(R,l)=>{R.LC[l]++;pressLane(R,l)};
function ptrLane(x,y){const r=Math.hypot(x-CX,y-CY);return r>=200?Math.floor(mod(Math.atan2(x-CX,CY-y)/D2R,360)/45)%8:-1}
function ptr(R,t,x,y,id){if(R.over||R.paused||R.auto)return;let p=R.ptr[id];
 if(t==='d'){const l=ptrLane(x,y);R.ptr[id]={x,y,lane:l};if(l>=0)laneDown(R,l)}
 else if(t==='m'&&p){p.x=x;p.y=y;const l=ptrLane(x,y);if(l!==p.lane){const o=p.lane;p.lane=l;if(l>=0)laneDown(R,l);if(o>=0)laneUp(R,o)}}
 else if(t==='u'&&p){delete R.ptr[id];if(p.lane>=0)laneUp(R,p.lane)}}
function keyDown(R,c){if(R.over||R.paused||R.auto||R.kd[c])return;R.kd[c]=1;if(c!=='Space')laneDown(R,KEYLANE[c])}
function keyUp(R,c){if(!R.kd[c])return;delete R.kd[c];if(c!=='Space')laneUp(R,KEYLANE[c])}
function releaseAll(R){for(const k in R.ptr){const p=R.ptr[k];delete R.ptr[k];if(p.lane>=0)laneUp(R,p.lane)}for(const k in R.kd)keyUp(R,k)}
const centerDown=R=>{if(R.auto)return true;if(R.kd.Space)return true;for(const k in R.ptr){const p=R.ptr[k];if(Math.hypot(p.x-CX,p.y-CY)<110)return true}return false};

function loop(){const R=RUN;if(!R||R.over||R.paused)return;const S=R.S,A=R.ctx.A,now=(ac.currentTime-R.t0)*1000*R.rate,W=R.W;
 const dt=R.last==null?0:clamp(now-R.last,0,100);R.last=now;R.now=now;if(dt>0)R.fps=R.fps*.92+(1000/(dt/R.rate))*.08;
 S.read();
 while(R.ni<R.N.length&&R.N[R.ni].t-R.entry<=now)R.act.push(R.N[R.ni++]);
 const cd=centerDown(R);
 for(let i=R.act.length-1;i>=0;i--){const n=R.act[i];
  if(n.type==='tap'){if(R.auto&&n.j==null&&now>=n.t){const p=lpos(n.lane,1);n.j=0;judge(R,0,n.brk?5:1,p.x+CX,p.y+CY)}
   if(n.j==null&&now>n.t+W.tap[3]){n.j=4;const p=lpos(n.lane,1);judge(R,4,n.brk?5:1,p.x+CX,p.y+CY)}if(n.j!=null&&now>n.t+300)R.act.splice(i,1)}
  else if(n.type==='hold'){const p=lpos(n.lane,1),b=n.brk?5:1;
   if(R.auto){if(n.hj==null&&now>=n.t){n.hj=0;n.holding=1;n.press=n.t;judge(R,0,b,p.x+CX,p.y+CY)}if(n.tj==null&&n.hj!=null&&now>=n.e){n.holding=0;n.tj=0;judge(R,0,b,p.x+CX,p.y+CY)}}
   if(n.hj==null&&now>n.t+W.tap[3]){n.hj=4;judge(R,4,b,p.x+CX,p.y+CY)}
   if(n.tj==null){
    if(n.holding&&now>=n.e){n.holding=0;const nh=Math.max(0,n.press-n.t),steps=clamp(Math.floor(nh/300),0,3);n.tj=Math.min(3,1+steps);judge(R,n.tj,b,p.x+CX,p.y+CY)}
    else if(!n.holding&&now>=n.e){n.tj=4;judge(R,4,b,p.x+CX,p.y+CY)}}
   if(n.tj!=null&&n.hj!=null&&now>n.e+300)R.act.splice(i,1)}
  else if(n.type==='slide'){const body=n.body,p=lpos(n.lane,1);
   if(R.auto&&n.hj==null&&now>=n.t){n.hj=0;judge(R,0,n.brk?5:1,p.x+CX,p.y+CY)}
   if(n.hj==null&&now>n.t+W.tap[3]){n.hj=4;judge(R,4,n.brk?5:1,p.x+CX,p.y+CY)}
   const hittable=n.hj!=null,cps=body.cps,strict=R.HR||cps.length<=3,lb=strict?1:2,ra=n.lane*45*D2R,co=Math.cos(ra),si=Math.sin(ra);
   for(let k=0;k<cps.length;k++){const c=cps[k],px=CX+c.pos.x*co-c.pos.y*si,py=CY+c.pos.x*si+c.pos.y*co;c.ax=px;c.ay=py;let cnt=0;
    for(const id in R.ptr){const q=R.ptr[id];if(Math.hypot(q.x-px,q.y-py)<=100)cnt++}
    if(cnt>c.pc&&hittable&&!c.hit&&(k<lb||cps[k-lb].hit)){c.hit=true;if(k>0)cps[k-1].hit=true}c.pc=cnt}
   if(R.auto&&hittable)for(const c of cps)if(!c.hit&&(now>=n.e||now>=n.t+body.wd+c.pr*body.mv))c.hit=true;
   if(n.bj==null&&hittable){const done=cps.every(c=>c.hit),off=now-n.e;
    if(done){let v=resWin(W.sl,off);if(v<0)v=3;const sp=clamp((now-(n.t+body.wd))/Math.max(1,body.mv),0,1);if(off<0&&body.total*(1-sp)<=100)v=0;
     n.bj=v;const e=cps.length?cps[cps.length-1]:null;judge(R,v,n.brk?5:3,e?e.ax:CX,e?e.ay:CY);if(v<4&&A.slide){try{const s=ac.createBufferSource();s.buffer=A.slide;s.connect(aout('f'));s.start()}catch(e){}}}
    else if(off>W.sl[3]){const miss=cps.filter(c=>!c.hit).length;n.bj=miss<=2&&cps.length>2?3:4;const e=cps[cps.length-1];judge(R,n.bj,n.brk?5:3,e?e.ax:CX,e?e.ay:CY)}}
   if(n.hj!=null&&n.bj!=null&&now>n.e+300)R.act.splice(i,1)}
  else if(n.type==='th'){if(now>=n.t&&now<=n.e&&cd)n.held=(n.held||0)+dt;
   if(now>=n.e&&n.j==null){const f=(n.held||0)/Math.max(1,n.e-n.t),v=f>=.9?0:f>=.75?1:f>=.5?2:f>=.25?3:4;n.j=v;judge(R,v,n.brk?5:1,CX,CY)}
   if(n.j!=null&&now>n.e+300)R.act.splice(i,1)}}
 if(R.fail&&!R.NF)return finish(R,true);
 let sk=null;if(R.ni<R.N.length){const nx=R.N[R.ni].t-R.entry;if(nx-now>(R.ni===0?3500:6000)&&!R.act.length)sk=nx-1000}S.setSkip(sk);
 if(R.ni>=R.N.length&&!R.act.length&&now>R.lastT+1200)return finish(R,false);
 if(R.src&&R.buf&&now>R.buf.duration*1000+1000&&R.ni>=R.N.length&&!R.act.length)return finish(R,false);
 draw(R,now);R.raf=requestAnimationFrame(loop)}

/* ================= vẽ ================= */
function star(g,x,y,r,c){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath();g.fillStyle=c;g.fill();g.strokeStyle='#fff';g.lineWidth=4;g.stroke()}
function panel(g,x,y,w,h,lab,val){g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,w,h,5);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;g.stroke();g.fillStyle='#222';g.textBaseline='middle';g.textAlign='left';g.font='bold '+Math.round(h*.36)+'px sans-serif';g.fillText(lab,x+12,y+h/2+1);g.textAlign='right';g.font='bold '+Math.round(h*.46)+'px sans-serif';g.fillText(val,x+w-12,y+h/2+1)}
function draw(R,now){const cfg=R.cfg,L=R.S.lay,{fx,fy,fw,fh,sc}=L,E=R.entry;g.save();g.clearRect(0,0,W,H);
 if(R.bg){const r=Math.max(W/R.bg.width,H/R.bg.height);g.drawImage(R.bg,(W-R.bg.width*r)/2,(H-R.bg.height*r)/2,R.bg.width*r,R.bg.height*r);g.fillStyle='rgba(0,0,0,'+(.45+.5*cfg.dim/100)+')';g.fillRect(0,0,W,H)}else{g.fillStyle='#0b0b16';g.fillRect(0,0,W,H)}
 g.save();g.beginPath();g.rect(fx,fy,fw,fh);g.clip();g.translate(fx,fy);g.scale(sc,sc);
 g.fillStyle='rgba(0,0,0,'+(.2+.5*cfg.dim/100)+')';g.fillRect(0,0,FW,FH);
 g.translate(CX,CY);
 g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(0,0,IR,0,6.2832);g.stroke();
 g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.18)';for(let l=0;l<8;l++){const a=P(NS,l*45),b=P(IR+14,l*45);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 g.beginPath();g.arc(0,0,NS,0,6.2832);g.stroke();
 for(let l=0;l<8;l++){if(R.LC[l]>0){g.fillStyle='rgba(255,102,170,.16)';g.beginPath();g.moveTo(0,0);g.arc(0,0,IR+14,(l*45-90)*D2R,(l*45+45-90)*D2R);g.closePath();g.fill()}const p=lanePos(l);g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(p.x,p.y,6,0,6.2832);g.fill()}
 const pr=t=>1-(t-now)/E;
 for(const n of R.act){const p=clamp(pr(n.t),0,1.05);let a=1;if(R.HD)a=clamp(1-(p-.35)/.25,0,1);if(a<=.02)continue;g.globalAlpha=a;
  const col=n.brk?'#ff5a1f':'#ff0064';
  if(n.type==='tap'){if(n.j!=null)continue;const q=lpos(n.lane,p),r=14+22*clamp(p,0,1);g.fillStyle=col;g.strokeStyle='#fff';g.lineWidth=5;g.beginPath();g.arc(q.x,q.y,r,0,6.2832);g.fill();g.stroke()}
  else if(n.type==='hold'){const pe=clamp(pr(n.e),0,1.05),ps=n.hj==null||n.holding?p:clamp(p,0,1),a0=lpos(n.lane,Math.min(ps,1)),a1=lpos(n.lane,pe),r=14+22*clamp(p,0,1);
   g.strokeStyle=n.holding?'#ffe0a0':col;g.lineWidth=r*1.5;g.lineCap='round';g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.stroke();g.lineCap='butt';
   g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.arc(a0.x,a0.y,r,0,6.2832);g.stroke()}
  else if(n.type==='slide'){const body=n.body,ra=n.lane*45;g.save();g.rotate(ra*D2R);
   /* đường chevron */
   const pl=body.paths,wdt=(now>=n.t+body.wd)?clamp((now-n.t-body.wd)/Math.max(1,body.mv),0,1):0,prog=n.hj==null?0:Math.max(0,...body.cps.filter(c=>c.hit).map(c=>c.pr),0);
   const total=body.total,cnt=Math.max(4,Math.floor(total/38));g.lineWidth=5;g.lineCap='round';
   for(let i=1;i<cnt;i++){const f=i/cnt,q=body.at(f),q2=body.at(Math.min(1,f+.01)),ang=Math.atan2(q2.y-q.y,q2.x-q.x),c=Math.cos(ang),s=Math.sin(ang);
    g.strokeStyle=f<=prog?'rgba(255,255,255,.15)':(n.hj!=null?'#7ad0ff':'#4a90c0');g.globalAlpha=a*clamp(p+.25,.2,1);
    g.beginPath();g.moveTo(q.x-c*7-s*11,q.y-s*7+c*11);g.lineTo(q.x+c*7,q.y+s*7);g.lineTo(q.x-c*7+s*11,q.y-s*7-c*11);g.stroke()}
   g.lineCap='butt';g.globalAlpha=a;
   if(n.hj!=null&&now>=n.t+body.wd){const sp=body.at(wdt);star(g,sp.x,sp.y,24,'#7ad0ff')}
   g.restore();
   if(n.hj==null){const q=lpos(n.lane,p);star(g,q.x,q.y,16+16*clamp(p,0,1),n.brk?'#ff5a1f':'#ff0064')}
   else if(now<n.t+body.wd){const q=lpos(n.lane,1);g.globalAlpha=a*.7;star(g,q.x,q.y,26,'#7ad0ff')}}
  else if(n.type==='th'){const on=now>=n.t,f=on?clamp((now-n.t)/(n.e-n.t),0,1):0,k=on?0:clamp((n.t-now)/E,0,1);
   g.strokeStyle='#7ad0ff';g.lineWidth=7;g.beginPath();g.arc(0,0,70+100*k,0,6.2832);g.stroke();
   g.fillStyle=on&&centerDown(R)?'rgba(122,208,255,.5)':'rgba(122,208,255,.2)';g.beginPath();g.arc(0,0,70,0,6.2832);g.fill();
   g.strokeStyle='#fff';g.lineWidth=8;g.beginPath();g.arc(0,0,70,-Math.PI/2,-Math.PI/2+f*6.2832);g.stroke()}
  g.globalAlpha=1}
 R.fx=R.fx.filter(f=>now-f.t<500);for(const f of R.fx){const k=(now-f.t)/500;g.globalAlpha=1-k;const x=(f.x-CX)*.8,y=(f.y-CY)*.8;
  g.strokeStyle=COLS[f.v];g.lineWidth=4;g.beginPath();g.arc(f.x-CX,f.y-CY,16+k*34,0,6.2832);g.stroke();
  g.fillStyle=COLS[f.v];g.font='bold 22px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(NAMES[f.v].toUpperCase(),x,y-k*14)}
 g.globalAlpha=1;g.restore();
 const tot=Math.max(1,R.buf?R.buf.duration*1000:1),acc=R.wsum?R.wacc/R.wsum:1;
 g.fillStyle='rgba(255,255,255,.18)';g.fillRect(fx,fy-4,fw,3);g.fillStyle='#ff66aa';g.fillRect(fx,fy-4,fw*clamp(now/tot,0,1),3);

 const hp=R.hpmax?R.hp/R.hpmax:1;
 OM.hud({score:R.score,combo:R.combo,acc,hp:hp},L,now,tot);
 if(R.auto){g.textAlign='center';g.textBaseline='alphabetic';g.font='bold 14px sans-serif';g.fillStyle='rgba(255,230,120,.95)';g.fillText('AUTO',fx+fw/2,fy+20)}
 if(R.S.sk!=null&&!R.S.ov&&!('ontouchstart' in window)){g.textAlign='center';g.textBaseline='alphabetic';g.font='bold 15px sans-serif';g.fillStyle='#7dff9a';g.fillText('Enter: Skip »',fx+fw/2,fy+fh-14)}
 if(typeof SET!=='undefined'&&SET.fps){g.textAlign='left';g.textBaseline='middle';g.font='bold 14px monospace';g.fillStyle='#6f6';g.fillText('FPS '+Math.round(R.fps),L.pad.x0+4,L.top+68)}
 g.restore()}

function finish(R,fail){if(R.over)return;const M=R.M,n=R.n,acc=R.wsum?R.wacc/R.wsum:1,ctx=R.ctx;stop();
 OM.results({mode:'Sentakki',M,score:R.score,cells:[['Critical',n[0],'#ffd84d'],['Perfect',n[1],'#ff9a5c'],['Great',n[2],'#7dff9a'],['Good',n[3],'#6cf'],['Miss',n[4],'#f55']],miss:n[4],max:R.max,acc,fail,retry:()=>ctx.restart(),back:()=>ctx.quit()})}
})();
