
(()=>{
const OM=window.OM;if(!OM)return;
const COL=['#ff5a8a','#5ab4ff','#ffd84d','#7dff9a'],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),FW=307,FH=384,PX=153.5,PY=364,PSPD=.2,HITR=7,GRAZER=21,PRE=400,D2R=Math.PI/180;
const tints={};
function tint(im,c){const k=c+'|'+(im.__i||(im.__i=Math.random()));let t=tints[k];if(t)return t;t=document.createElement('canvas');t.width=im.width;t.height=im.height;const x=t.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=c;x.fillRect(0,0,t.width,t.height);return tints[k]=t}
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
function rng(s){s=s>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
let RUN=null;

OM.register({id:'touhosu',name:'Touhosu',asm:'osu.Game.Rulesets.Touhosu',
 settings:[
  {k:'pz',label:'Thu phóng play zone',t:'range',min:50,max:130,step:5,u:'%',def:100}],
 support:M=>M.mode?'Touhosu chỉ chơi map osu!standard':'',
 async build(info){const im=await Promise.all(info.pngs.map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null)));
  if(im.length!==32||im.some(x=>!x))throw Error('File Touhosu không đúng phiên bản (cần 32 ảnh, tìm thấy '+im.length+')');
  const A={ok:true,hp:im.slice(0,5),card:im[6],focus:im[7],idle:im.slice(8,16),left:im.slice(16,21),right:im.slice(21,26),logo:im[5],
   pj:{grain:{ov:im[26],tx:im[27],r:5},knife:{ov:im[28],tx:im[29],r:5},sphere:{ov:im[30],tx:im[31],r:7}},grazeRaw:(info.audio.find(a=>a.type==='mp3')||{}).bytes||null,graze:null};return A},
 icon(A){const c=document.createElement('canvas');c.width=c.height=128;c.getContext('2d').drawImage(A.logo,0,0,128,128);return c.toDataURL()},
 async start(ctx){return start(ctx)}});

function convert(M){
 const d=M.d,ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),out=[],R=rng(Math.round((d.HP||5)+(d.CS||4))*1000+ho.length);
 const mapx=x=>x/512*FW,mapy=y=>y*.4;
 const spdAt=t=>{let bl=500;try{bl=tpAt2(M,t).bl}catch(e){}const bpm=60000/bl;return{bl,m:clamp(.8+(bpm-60)/(300-60)*.5,.8,1.3)}};

 const bul=(t,x,y,a,sp,ci)=>{if(x<0||x>FW||y<0||y>FH)return;out.push({t,x,y,a:a*D2R,sp:200*sp/1000,c:ci,h:0})};
 const ring=(t,x,y,n,off,sp,ci)=>{const per=360/n;for(let i=0;i<n;i++)bul(t,x,y,off+per/2+i*per,sp,ci)};
 let col=0,lastCi=null;
 for(const o of ho){if(lastCi!=null&&o.ci!==lastCi)col=(col+1)%4;lastCi=o.ci;const nc=o.num===1,sp=spdAt(o.time),x=mapx(o.x),y=mapy(o.y);
  if(o.kind==='c'){
   if(!nc){const per=45;for(let i=0;i<8;i++)bul(o.time,x,y,per/2+i*per+5*((o.num||1)-1),sp.m,col)}
   else{
    const nv=R()<.5?3:4,rot=R()*360,rad=20,vs=[];for(let i=0;i<nv;i++){const a=(rot+i*360/nv)*D2R;vs.push({x:Math.sin(a)*rad,y:-Math.cos(a)*rad})}
    for(let i=0;i<nv;i++){const p=vs[i],q=vs[(i+1)%nv];for(let k=0;k<4;k++){const f=k/4,px=p.x+(q.x-p.x)*f,py=p.y+(q.y-p.y)*f,dist=Math.hypot(px,py),ang=Math.atan2(px,-py)/D2R;bul(o.time,x+px,y+py,ang,sp.m*dist/rad*1.2,col)}}}
  }else if(o.kind==='s'){
   let tp={bl:sp.bl,m:1};try{tp=tpAt2(M,o.time)}catch(e){}
   const slides=o.slides||1,span=o.len/(d.SliderMultiplier*100*tp.m)*tp.bl,end=o.time+span*slides,rep=slides-1;
   let path=null;try{if(o.pts)path=o.path||buildPath(o)}catch(e){}
   const at=prog=>{if(path){o.path=path;try{return posAt(o,prog)}catch(e){}}return{x:o.x,y:o.y}};

   const nCh=Math.floor(Math.min(o.len*(rep+1)/10,100*(rep+1)));
   for(let i=0;i<nCh;i++){const f=i/Math.max(1,nCh)*slides,p=at(f),px=mapx(p.x),py=mapy(p.y);out.push({t:o.time+f*span,x:px,y:py,a:0,sp:0,c:col,h:1})}
   if(span<75&&rep>0){
    const hx=x,hy=y,tl=at(slides),tx=mapx(tl.x),ty=mapy(tl.y);ring(o.time,hx,hy,5,0,sp.m,col);ring(end,tx,ty,5,0,sp.m,col);
    const step=Math.max(100,(end-o.time)/Math.max(1,Math.floor((end-o.time)/100)));let k=0;for(let t=o.time+step;t<end;t+=step,k++)ring(t,hx,hy,5,k*2,sp.m,col)}
   else{
    for(let i=1;i<=rep;i++){const p=at(i),n=clamp(Math.round(o.len/15),3,15),off=R()*360;ring(o.time+span*i,mapx(p.x),mapy(p.y),n,off,spdAt(o.time+span*i).m,col)}
    const p=at(slides),n=clamp(Math.round(o.len*(rep+1)/15),5,20);ring(end,mapx(p.x),mapy(p.y),n,0,spdAt(end).m,col)}
  }else{
   let bl=sp.bl;while(bl<400)bl*=2;const end=o.end||o.time+1000;let k=0;
   for(let t=o.time;t<end;t+=bl,k++){const s=spdAt(t).m;for(let i=0;i<20;i++){const a=(k*9+i*18)*D2R;bul(t,153.5+Math.sin(a)*20,96-Math.cos(a)*20,k*9+i*18,s,col)}}}
 }
 out.sort((a,b)=>a.t-b.t);return out}

const BDIR=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;BDIR.push([Math.sin(a),-Math.cos(a)])}
const BCAND=[{dx:0,dy:0,v:0,f:0,id:0}];BDIR.forEach((d,i)=>{BCAND.push({dx:d[0],dy:d[1],v:PSPD,f:0,id:1+i*2});BCAND.push({dx:d[0],dy:d[1],v:PSPD*.5,f:1,id:2+i*2})});
function botMove(R,now,dm){const pl=R.pl,B=R.B,HZ=400,ST=20,NS=HZ/ST,M=18,M2=M*M,HX=PX,HY=330,reach=PSPD*HZ+HITR+M,rel=[];
 for(const b of B){if(b.h)continue;const sp=Math.hypot(b.vx,b.vy),dx=b.x-pl.x,dy=b.y-pl.y,lim=reach+sp*HZ;if(dx*dx+dy*dy<=lim*lim)rel.push(b)}
 let best=null,bc=1e18;
 for(const c of BCAND){let x=pl.x,y=pl.y,cost=0;
  for(let s=1;s<=NS&&cost<bc;s++){const tau=s*ST;x=clamp(x+c.dx*c.v*ST,0,FW);y=clamp(y+c.dy*c.v*ST,0,FH);
   for(let k=0;k<rel.length;k++){const b=rel[k],mv=b.t<=now?tau:Math.max(0,now+tau-b.t),ex=b.x+b.vx*mv-x,ey=b.y+b.vy*mv-y,d2=ex*ex+ey*ey;
    if(d2<M2){const d=Math.sqrt(d2),p=M-d;cost+=p*p*(d<HITR+4?30:1)}}}
  cost+=Math.hypot(x-HX,y-HY)*.04+(c.v?.3:0)-(R.bid===c.id?.4:0);
  if(cost<bc){bc=cost;best=c}}
 R.bid=best.id;pl.x=clamp(pl.x+best.dx*best.v*dm,0,FW);pl.y=clamp(pl.y+best.dy*best.v*dm,0,FH);pl.face=best.dx>.25?1:best.dx<-.25?-1:0;pl.focus=best.f}

async function start(ctx){
 const{M,F,buf,bg,note,A,cfg,OM}=ctx;stop(true);hide();try{setAuto(false)}catch(e){}
 if(!A.graze&&A.grazeRaw&&window.ac){try{const b=A.grazeRaw;A.graze=await new Promise((r,j)=>{const q=ac.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),r,j);if(q&&q.catch)q.catch(j)})}catch(e){}}
 const md=mods(),rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,EZ=md.has('EZ'),NF=md.has('NF'),HD=md.has('HD'),SD=md.has('SD')||md.has('PF'),AUTO=md.has('AT')||md.has('CN');
 const E=convert(M),N=E.filter(b=>!b.h).length,lastT=E.length?E[E.length-1].t:0,first=E.length?E[0].t-PRE:0,lead=Math.max(0,1800-first);
 const R={M,buf,bg,note,E,ei:0,B:[],pl:{x:PX,y:PY,face:0,focus:0},hp:1,lives:EZ?3:0,score:0,combo:0,max:0,perf:0,miss:0,N,sumc:0,gz:0,lastT,lead,rate,NF,HD,SD,EZ,cfg,auto:AUTO,bid:0,over:false,paused:false,t0:0,now:-lead,last:null,fps:60,ctx,dmg:1};
 RUN=R;
 const S=R.S=OM.session({zoom:(cfg.pz||100)/100,fw:FW,fh:FH,buttons:[{k:'f',label:'FOCUS',color:'#888'}],
  onPause(){R.paused=true;try{ac.suspend()}catch(e){}},
  onResume(){R.paused=false;try{ac.resume()}catch(e){}R.last=null;R.raf=requestAnimationFrame(loop)},
  onRestart(){stop();try{ac.resume()}catch(e){}ctx.restart()},
  onQuit(){stop();try{ac.resume()}catch(e){}ctx.quit()},
  onSkip(ms){seek(R,ms)},
  onLayout(){if(RUN&&RUN.paused&&!RUN.over&&RUN.S)draw(RUN,RUN.now)}});
 const T0=ac.currentTime+.2+lead/1000;R.t0=T0;
 if(buf){const s=ac.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;s.connect(aout('u'));s.start(T0);R.src=s}
 try{ac.resume()}catch(e){}
 R.raf=requestAnimationFrame(loop)}

function seek(R,ms){if(R.src){try{R.src.stop()}catch(e){}R.src=null}R.t0=ac.currentTime-ms/1000/R.rate;
 if(R.buf){const s=ac.createBufferSource();s.buffer=R.buf;s.playbackRate.value=R.rate;s.connect(aout('u'));s.start(0,Math.max(0,ms)/1000);R.src=s}R.last=null;
 while(R.ei<R.E.length&&R.E[R.ei].t-PRE<ms)R.ei++;R.B.length=0}
function stop(silent){const R=RUN;if(!R)return;R.over=true;cancelAnimationFrame(R.raf);if(R.src)try{R.src.stop()}catch(e){}if(R.S)R.S.close();
 try{ac.resume()}catch(e){}try{g.clearRect(0,0,W,H)}catch(e){}RUN=null}

function judge(R,hit){
 if(hit){R.miss++;R.combo=0;R.hp-=.05*R.dmg*(R.EZ?.5:1);if(R.SD)R.hp=0;
  if(R.hp<=0){if(R.lives>0){R.lives--;R.hp=1}else if(!R.NF)return true;else R.hp=.0001}}
 else{R.perf++;R.combo++;R.max=Math.max(R.max,R.combo);R.sumc+=R.combo;R.hp=Math.min(1,R.hp+.0002)}
 const N=Math.max(1,R.N),j=R.perf+R.miss;R.score=Math.round(700000*R.sumc/(N*(N+1)/2)+300000*(R.perf/N));return false}

function loop(ts){const R=RUN;if(!R||R.over||R.paused)return;const A=R.ctx.A,S=R.S,pl=R.pl;
 const now=(ac.currentTime-R.t0)*1000*R.rate;let dm=R.last==null?0:clamp(now-R.last,0,100);R.last=now;R.now=now;if(dm>0)R.fps=R.fps*.92+(1000/(dm/R.rate))*.08;
 const I=S.read();
 while(R.ei<R.E.length&&R.E[R.ei].t-PRE<=now){const b=R.E[R.ei++];R.B.push({x:b.x,y:b.y,t:b.t,vx:Math.sin(b.a)*b.sp,vy:-Math.cos(b.a)*b.sp,c:b.c,h:b.h,jd:0,gz:0,life:b.h?800:PRE})}

 if(R.auto)botMove(R,now,dm);else{const pd=dm,sp=PSPD*(I.f?.5:1)*pd;pl.x=clamp(pl.x+I.x*sp,0,FW);pl.y=clamp(pl.y+I.y*sp,0,FH);pl.face=I.x>.25?1:I.x<-.25?-1:0;pl.focus=I.f}
 let sk=null;if(R.ei===0&&R.E.length){const nx=R.E[0].t;if(nx-now>3500)sk=nx-2000-PRE} S.setSkip(sk);
 const B=R.B;
 for(let i=B.length-1;i>=0;i--){const b=B[i];
  if(now>=b.t&&!b.h){const ox=b.x,oy=b.y,ps=dm;b.x+=b.vx*ps;b.y+=b.vy*ps;
   if(!b.jd){
    const sx=b.x-ox,sy=b.y-oy,l2=sx*sx+sy*sy,tq=l2?clamp(((pl.x-ox)*sx+(pl.y-oy)*sy)/l2,0,1):0,dd=Math.hypot(ox+sx*tq-pl.x,oy+sy*tq-pl.y);
    if(dd<HITR&&!R.auto){b.jd=1;if(judge(R,true))return finish(R,true)}
    else if(!b.gz&&dd<GRAZER){b.gz=1;R.gz++;if(A.graze){try{const s=ac.createBufferSource();s.buffer=A.graze;s.connect(aout('f'));s.start()}catch(e){}}}}
   if(b.x<-20||b.x>FW+20||b.y<-20||b.y>FH+20){if(!b.jd){b.jd=1;judge(R,false)}B.splice(i,1)}}
  else if(b.h&&now>=b.t+500){B.splice(i,1)}}
 if(R.ei>=R.E.length&&!B.length&&now>R.lastT+1000)return finish(R,false);
 if(R.src&&R.buf&&now>R.buf.duration*1000+1000&&R.ei>=R.E.length&&!B.length)return finish(R,false);
 draw(R,now);R.raf=requestAnimationFrame(loop)}

function panel(g,x,y,w,h,lab,val){g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,w,h,5);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;g.stroke();g.fillStyle='#222';g.textBaseline='middle';g.textAlign='left';g.font='bold '+Math.round(h*.36)+'px sans-serif';g.fillText(lab,x+12,y+h/2+1);g.textAlign='right';g.font='bold '+Math.round(h*.46)+'px sans-serif';g.fillText(val,x+w-12,y+h/2+1)}
function draw(R,now){const A=R.ctx.A,pl=R.pl,cfg=R.cfg,L=R.S.lay;g.save();g.clearRect(0,0,W,H);const{fx,fy,fw,fh,sc}=L;
 if(R.bg){const r=Math.max(W/R.bg.width,H/R.bg.height);g.drawImage(R.bg,(W-R.bg.width*r)/2,(H-R.bg.height*r)/2,R.bg.width*r,R.bg.height*r);g.fillStyle='rgba(0,0,0,'+(.45+.5*.6)+')';g.fillRect(0,0,W,H)}else{g.fillStyle='#0b0b16';g.fillRect(0,0,W,H)}
 g.fillStyle='rgba(0,0,0,'+(.25+.6*.6)+')';g.fillRect(fx,fy,fw,fh);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;g.strokeRect(fx,fy,fw,fh);
 g.save();g.beginPath();g.rect(fx,fy,fw,fh);g.clip();g.translate(fx,fy);g.scale(sc,sc);
 for(const b of R.B){const p=b.h?A.pj.grain:A.pj.sphere;let a=1,s=1;
  if(b.h){const k=clamp((now-(b.t-800))/800,0,1);a=.55*k*(now>b.t+300?clamp(1-(now-b.t-300)/200,0,1):1);s=.6}
  else{ s=clamp((now-(b.t-PRE))/PRE,0,1);if(s<1)a=.7;if(R.HD){const dd=Math.hypot(b.x-pl.x,b.y-pl.y);a*=clamp((dd-70)/50,0,1)}}
  if(a<=.02)continue;g.globalAlpha=a;g.save();g.translate(b.x,b.y);const k=s*(b.h?.6:1)*p.r/ (p.ov.width/2||1)*1.0;g.scale(k,k);
  g.drawImage(tint(p.tx,COL[b.c%4]),-p.tx.width/2,-p.tx.height/2);g.drawImage(p.ov,-p.ov.width/2,-p.ov.height/2);g.restore()}
 g.globalAlpha=1;
 const fr=Math.floor(Math.max(0,now)/100),spr=pl.face<0?A.left[fr%5]:pl.face>0?A.right[fr%5]:A.idle[fr%8];
 if(pl.focus&&A.focus){g.save();g.translate(pl.x,pl.y);g.rotate(Math.max(0,now)/600);g.globalAlpha=.9;g.drawImage(A.focus,-16,-16,32,32);g.restore();g.globalAlpha=1}
 g.drawImage(spr,pl.x-23.25/2,pl.y-33.75/2,23.25,33.75);
 if(pl.focus||false){g.fillStyle='#fff';g.strokeStyle='#f33';g.lineWidth=1;g.beginPath();g.arc(pl.x,pl.y,HITR*.5,0,6.2832);g.fill();g.stroke()}
 g.restore();
 const tot=Math.max(1,R.buf?R.buf.duration*1000:R.lastT+1500);
 const jn=R.perf+R.miss,acc=jn?R.perf/jn:1;

 OM.hud({score:R.score,combo:R.combo,acc,hp:R.hp},L,now,tot);
 if(R.note){g.font='12px sans-serif';g.fillStyle='#fc4';g.textAlign='left';g.textBaseline='alphabetic';g.fillText(R.note.slice(0,40),L.pad.x0+4,L.top+66)}
 if(R.S.sk!=null&&!R.S.ov&&!('ontouchstart' in window)){g.textAlign='center';g.textBaseline='alphabetic';g.font='bold 15px sans-serif';g.fillStyle='#7dff9a';g.fillText('Space / Enter: Skip »',fx+fw/2,fy+fh-14)}
 OM.fps(R.fps)
 if(R.S.gp){g.textAlign='right';g.textBaseline='alphabetic';g.font='11px sans-serif';g.fillStyle='rgba(255,255,255,.6)';g.fillText('🎮 '+R.S.gp.slice(0,28),L.fx+fw,fy+fh+Math.min(12,H-fy-fh))}
 g.restore()}

function finish(R,fail){if(R.over)return;const M=R.M,tot=R.perf+R.miss,acc=tot?R.perf/tot:1,ctx=R.ctx;
 stop();
 OM.results({mode:'Touhosu',M,score:R.score,cells:[['Perfect',R.perf,'#6cf'],['Miss',R.miss,'#f55']],miss:R.miss,max:R.max,acc,fail,extra:[['Graze',R.gz]],retry:()=>ctx.restart(),back:()=>ctx.quit()})}
})();
