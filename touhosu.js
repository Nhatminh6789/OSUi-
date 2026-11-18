/* Adapter chế độ Touhosu cho hệ thống plugin (modes.js).
   File osu.Game.Rulesets.Touhosu.dll là assembly .NET của osu!lazer nên trình duyệt không chạy được:
   game chỉ đọc ảnh/âm thanh nhúng trong file (nhân vật, đạn, tim HP, tiếng graze); luật chơi (né đạn) viết lại bằng JS ở đây.
   Chơi màn hình NGANG: sân ở giữa, d-pad/joystick bên trái, HUD + nút Focus/Skip bên phải (đổi bên được trong Cài đặt). */
(()=>{
const OM=window.OM;if(!OM)return;
const COL=['#ff5a8a','#5ab4ff','#ffd84d','#7dff9a'],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),FW=384,FH=480;
const tints={};
function tint(im,c){const k=c+'|'+(im.__i||(im.__i=Math.random()));let t=tints[k];if(t)return t;t=document.createElement('canvas');t.width=im.width;t.height=im.height;const x=t.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=c;x.fillRect(0,0,t.width,t.height);return tints[k]=t}
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
let RUN=null;

OM.register({id:'touhosu',name:'Touhosu',asm:'osu.Game.Rulesets.Touhosu',
 settings:[
  {k:'cnt',label:'Projectile Count',t:'seg',o:[['Ít',.67],['Vừa',1],['Nhiều',1.67]],def:1},
  {k:'dim',label:'Playfield dim',t:'range',min:0,max:100,step:5,u:'%',def:60},
  {k:'hit',label:'Luôn hiện hitbox',t:'seg',o:[['Tắt',0],['Bật',1]],def:0}],
 support:M=>M.mode?'Touhosu chỉ chơi map osu!standard':'',
 async build(info){const im=await Promise.all(info.pngs.map(x=>createImageBitmap(new Blob([x],{type:'image/png'})).catch(()=>null)));
  if(im.length!==32||im.some(x=>!x))throw Error('File Touhosu không đúng phiên bản (cần 32 ảnh, tìm thấy '+im.length+')');
  const A={ok:true,hp:im.slice(0,5),card:im[6],focus:im[7],idle:im.slice(8,16),left:im.slice(16,21),right:im.slice(21,26),logo:im[5],
   pj:{grain:{ov:im[26],tx:im[27],r:5},knife:{ov:im[28],tx:im[29],r:5},sphere:{ov:im[30],tx:im[31],r:7}},grazeRaw:(info.audio.find(a=>a.type==='mp3')||{}).bytes||null,graze:null};return A},
 icon(A){const c=document.createElement('canvas');c.width=c.height=128;c.getContext('2d').drawImage(A.logo,0,0,128,128);return c.toDataURL()},
 async start(ctx){return start(ctx)}});

async function start(ctx){
 const{M,F,buf,bg,note,A,cfg,OM}=ctx;stop(true);hide();try{setAuto(false)}catch(e){}
 if(!A.graze&&A.grazeRaw&&window.ac){try{const b=A.grazeRaw;A.graze=await new Promise((r,j)=>{const q=ac.decodeAudioData(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),r,j);if(q&&q.catch)q.catch(j)})}catch(e){}}
 const md=mods(),d=M.d,rate=md.has('DT')||md.has('NC')?1.5:md.has('HT')?.75:1,EZ=md.has('EZ'),NF=md.has('NF'),HD=md.has('HD'),SD=md.has('SD')||md.has('PF');
 const AR=d.ApproachRate!=null?d.ApproachRate:d.AR!=null?d.AR:7,spd=clamp(170+AR*14,200,330)*(EZ?.85:1),br=EZ?.7:1,cm=cfg.cnt;
 /* map osu!standard -> điểm bắn đạn */
 const ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),E=[],objs=[];let col=0;
 for(const o of ho){const id=objs.length;objs.push({hit:0,alive:0,done:0});if(o.nc)col=(col+1)%4;
  const ex=30+clamp(o.x,0,512)/512*(FW-60),ey=24+clamp(o.y,0,384)/384*(FH*.3);
  if(o.kind==='p'){const end=o.end||o.time+1000;let k=0;for(let t=o.time;t<end;t+=Math.max(260,Math.min(520,(end-o.time)/6)),k++)E.push({t,k:'ring',x:FW/2,y:FH*.22,n:Math.round(12*cm)+k%2*2,ph:k*.4,c:col,id})}
  else if(o.kind==='s'){let end=o.time+600;try{const tp=tpAt2(M,o.time);end=o.time+o.len/(d.SliderMultiplier*100*tp.m)*tp.bl*(o.slides||1)}catch(e){}end=Math.max(end,o.time+300);
   const st=Math.max(70,110/cm);for(let t=o.time;t<=end;t+=st)E.push({t,k:'line',x:ex+Math.sin((t-o.time)/350)*36,y:ey,c:col,id})}
  else E.push({t:o.time,k:'fan',x:ex,y:ey,n:Math.max(1,Math.round(3*cm)),c:col,id})}
 E.sort((a,b)=>a.t-b.t);for(const e of E)objs[e.id].alive++;
 const lastT=E.length?E[E.length-1].t:0,first=E.length?E[0].t:0,lead=Math.max(0,1800-first);
 const R={M,buf,bg,note,E,ei:0,B:[],objs,pl:{x:FW/2,y:FH*.85,face:0,focus:0},hp:1,lives:EZ?3:0,inv:0,score:0,combo:0,max:0,n:[0,0,0,0],gz:0,spd,br,lastT,lead,rate,NF,HD,SD,EZ,cfg,over:false,paused:false,flash:[],t0:0,now:-lead,last:null,fps:60,args:[ctx],ctx};
 RUN=R;
 const S=R.S=OM.session({fw:FW,fh:FH,buttons:[{k:'f',label:'FOCUS',color:'#888'}],
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
 if(R.buf){const s=ac.createBufferSource();s.buffer=R.buf;s.playbackRate.value=R.rate;s.connect(aout('u'));s.start(0,Math.max(0,ms)/1000);R.src=s}R.last=null}
function stop(silent){const R=RUN;if(!R)return;R.over=true;cancelAnimationFrame(R.raf);if(R.src)try{R.src.stop()}catch(e){}if(R.S)R.S.close();
 try{ac.resume()}catch(e){}try{g.clearRect(0,0,W,H)}catch(e){}RUN=null}

function spawn(R,e){const A=R.ctx.A,pl=R.pl,ob=R.objs[e.id],c=COL[e.c%4],add=(type,x,y,ang,sp)=>{R.B.push({type,x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,c,id:e.id,gz:0});ob.alive++};
 const aim=Math.atan2(pl.y-e.y,pl.x-e.x);R.flash.push({x:e.x,y:e.y,t:R.now,c});
 if(e.k==='fan'){const n=e.n;for(let i=0;i<n;i++)add('sphere',e.x,e.y,aim+(n>1?(i/(n-1)-.5)*.5:0),R.spd)}
 else if(e.k==='line')add('knife',e.x,e.y,aim*.35+Math.PI/2*.65,R.spd*1.1);
 else if(e.k==='ring'){for(let i=0;i<e.n;i++)add('grain',e.x,e.y,e.ph+i/e.n*6.2832,R.spd*.55)}
 ob.alive--}
function judge(R,id){const ob=R.objs[id];if(ob.done||ob.alive>0)return;ob.done=1;const h=ob.hit;
 if(h===0){R.n[0]++;R.combo++;R.score+=Math.round(300*(1+Math.min(R.combo,100)/25))}else if(h===1){R.n[1]++;R.combo++;R.score+=100}else{R.n[3]++;R.combo=0}R.max=Math.max(R.max,R.combo)}

function loop(ts){const R=RUN;if(!R||R.over||R.paused)return;const A=R.ctx.A,S=R.S,pl=R.pl;
 const now=(ac.currentTime-R.t0)*1000*R.rate;let dt=R.last==null?0:clamp((now-R.last)/1000,0,.05);R.last=now;R.now=now;if(dt>0)R.fps=R.fps*.92+(1/dt)*.08;
 const I=S.read();
 while(R.ei<R.E.length&&R.E[R.ei].t<=now)spawn(R,R.E[R.ei++]);
 /* người chơi: d-pad/phím = 8 hướng, joystick/tay cầm = analog */
 const sp=I.f?150:330;pl.x=clamp(pl.x+I.x*sp*dt,10,FW-10);pl.y=clamp(pl.y+I.y*sp*dt,14,FH-14);pl.face=I.x>.25?1:I.x<-.25?-1:0;pl.focus=I.f;
 /* nút Skip: đoạn đầu bài hoặc khoảng nghỉ dài không có đạn */
 let sk=null;if(R.ei<R.E.length){const nx=R.E[R.ei].t;if(nx-now>(R.ei===0?3500:6000)&&(R.ei===0||!R.B.length))sk=nx-2000}S.setSkip(sk);
 const hr=3,gr=17,B=R.B;R.inv=Math.max(0,R.inv-dt);
 for(let i=B.length-1;i>=0;i--){const b=B[i];b.x+=b.vx*dt;b.y+=b.vy*dt;const r=A.pj[b.type].r*R.br,ddx=b.x-pl.x,ddy=b.y-pl.y,dd=Math.hypot(ddx,ddy);
  if(b.x<-30||b.x>FW+30||b.y<-30||b.y>FH+30){B.splice(i,1);R.objs[b.id].alive--;judge(R,b.id);continue}
  if(dd<r+hr&&R.inv<=0){R.hp-=R.EZ?.12:.2;R.inv=1.4;R.combo=0;R.objs[b.id].hit++;B.splice(i,1);R.objs[b.id].alive--;judge(R,b.id);
   if(R.SD)R.hp=0;if(R.hp<=0){if(R.lives>0){R.lives--;R.hp=1}else if(!R.NF)return finish(R,true);else R.hp=.05}continue}
  if(!b.gz&&dd<r+gr&&dd>r+hr){b.gz=1;R.gz++;R.score+=25;if(A.graze){try{const s=ac.createBufferSource();s.buffer=A.graze;s.connect(aout('f'));s.start()}catch(e){}}}}
 if(R.hp>0&&R.hp<1)R.hp=Math.min(1,R.hp+dt*.012);
 if(R.ei>=R.E.length&&!R.B.length&&now>R.lastT+1500)return finish(R,false);
 if(R.src&&R.buf&&now>R.buf.duration*1000+1000&&R.ei>=R.E.length&&!R.B.length)return finish(R,false);
 draw(R,now);R.raf=requestAnimationFrame(loop)}

function panel(g,x,y,w,h,lab,val){g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,w,h,5);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;g.stroke();g.fillStyle='#222';g.textBaseline='middle';g.textAlign='left';g.font='bold '+Math.round(h*.36)+'px sans-serif';g.fillText(lab,x+12,y+h/2+1);g.textAlign='right';g.font='bold '+Math.round(h*.46)+'px sans-serif';g.fillText(val,x+w-12,y+h/2+1)}
function draw(R,now){const A=R.ctx.A,pl=R.pl,cfg=R.cfg,L=R.S.lay;g.save();g.clearRect(0,0,W,H);const{fx,fy,fw,fh,sc}=L;
 if(R.bg){const r=Math.max(W/R.bg.width,H/R.bg.height);g.drawImage(R.bg,(W-R.bg.width*r)/2,(H-R.bg.height*r)/2,R.bg.width*r,R.bg.height*r);g.fillStyle='rgba(0,0,0,'+(.45+.5*cfg.dim/100)+')';g.fillRect(0,0,W,H)}else{g.fillStyle='#0b0b16';g.fillRect(0,0,W,H)}
 g.fillStyle='rgba(0,0,0,'+(.25+.6*cfg.dim/100)+')';g.fillRect(fx,fy,fw,fh);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;g.strokeRect(fx,fy,fw,fh);
 g.save();g.beginPath();g.rect(fx,fy,fw,fh);g.clip();g.translate(fx,fy);g.scale(sc,sc);
 for(const f of R.flash){const k=(now-f.t)/300;if(k>1||k<0)continue;g.globalAlpha=1-k;g.strokeStyle=f.c;g.lineWidth=3;g.beginPath();g.arc(f.x,f.y,6+k*22,0,6.2832);g.stroke()}
 R.flash=R.flash.filter(f=>now-f.t<300);g.globalAlpha=1;
 for(const b of R.B){const p=A.pj[b.type];let a=1;if(R.HD)a=clamp((Math.hypot(b.x-pl.x,b.y-pl.y)-60)/90,0,1);if(a<=.02)continue;g.globalAlpha=a;
  g.save();g.translate(b.x,b.y);if(b.type==='knife')g.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);g.scale(R.br,R.br);g.drawImage(tint(p.tx,b.c),-p.tx.width/2,-p.tx.height/2);g.drawImage(p.ov,-p.ov.width/2,-p.ov.height/2);g.restore()}
 g.globalAlpha=1;
 const fr=Math.floor(Math.max(0,now)/90),spr=pl.face<0?A.left[fr%5]:pl.face>0?A.right[fr%5]:A.idle[fr%8];
 if(R.inv>0&&Math.floor(R.inv*12)%2)g.globalAlpha=.4;
 if(pl.focus&&A.focus){g.save();g.translate(pl.x,pl.y);g.rotate(Math.max(0,now)/600);g.globalAlpha=.9;g.drawImage(A.focus,-32,-32,64,64);g.restore();g.globalAlpha=1}
 g.drawImage(spr,pl.x-spr.width*.65,pl.y-spr.height*.65,spr.width*1.3,spr.height*1.3);g.globalAlpha=1;
 if(pl.focus||cfg.hit){g.fillStyle='#fff';g.strokeStyle='#f33';g.lineWidth=1.5;g.beginPath();g.arc(pl.x,pl.y,3.5,0,6.2832);g.fill();g.stroke()}
 g.restore();
 /* thanh tiến độ bài */
 const tot=Math.max(1,R.buf?R.buf.duration*1000:R.lastT+1500);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(fx,fy-4,fw,3);g.fillStyle='#ff66aa';g.fillRect(fx,fy-4,fw*clamp(now/tot,0,1),3);
 /* HUD bên phía nút bấm */
 const hud=L.hud,acc=R.n[0]+R.n[1]+R.n[3]?(300*R.n[0]+100*R.n[1])/(300*(R.n[0]+R.n[1]+R.n[3])):1,hp=R.hp;
 if(L.land&&hud.w>90){const pw=Math.min(hud.w,260),ph=Math.round(clamp(H*.085,28,40)),gap=Math.round(ph*.22),x=hud.x+(hud.w-pw)/2;let y=fy+4;
  panel(g,x,y,pw,ph,'SCORE',String(R.score).padStart(8,'0'));y+=ph+gap;
  panel(g,x,y,pw,ph,'COMBO',R.combo+'x');y+=ph+gap;
  panel(g,x,y,pw,ph,'ACC',(acc*100).toFixed(2)+'%');y+=ph+gap;
  panel(g,x,y,pw,ph,'GRAZE',R.gz+(R.lives?' · +'+R.lives:''));y+=ph+gap;
  const hi=A.hp[hp>.875?4:hp>.625?3:hp>.375?2:hp>.125?1:0],hs=ph*.9;g.fillStyle='rgba(255,255,255,.94)';rr(g,x,y,pw,ph,5);g.fill();g.drawImage(hi,x+4,y+ph/2-hs/2,hs,hs);
  g.fillStyle='#ddd';rr(g,x+hs+10,y+ph/2-5,pw-hs-22,10,5);g.fill();g.fillStyle='#ff5a8a';rr(g,x+hs+10,y+ph/2-5,Math.max(0,(pw-hs-22)*clamp(hp,0,1)),10,5);g.fill();y+=ph+gap;
  if(R.note){g.font='12px sans-serif';g.fillStyle='#fc4';g.textAlign='left';g.textBaseline='alphabetic';g.fillText(R.note.slice(0,40),x,y+10)}
 }else{ /* màn hình dọc (PC): HUD gọn trong sân */
  g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='bold 18px sans-serif';g.fillText(String(R.score).padStart(8,'0')+'  '+R.combo+'x  '+(acc*100).toFixed(1)+'%',fx+8,fy+22)}
 if(R.S.sk!=null&&!R.S.ov&&!('ontouchstart' in window)){g.textAlign='center';g.textBaseline='alphabetic';g.font='bold 15px sans-serif';g.fillStyle='#7dff9a';g.fillText('Space / Enter: Skip »',fx+fw/2,fy+fh-14)}
 if(typeof SET!=='undefined'&&SET.fps){g.textAlign='left';g.textBaseline='middle';g.font='bold 14px monospace';const t='FPS '+Math.round(R.fps),tx=L.pad.x0+54,ty=L.top+30;g.fillStyle='rgba(0,0,0,.6)';rr(g,tx-6,ty-11,g.measureText(t).width+12,22,4);g.fill();g.fillStyle='#6f6';g.fillText(t,tx,ty)}
 if(R.S.gp){g.textAlign='right';g.textBaseline='alphabetic';g.font='11px sans-serif';g.fillStyle='rgba(255,255,255,.6)';g.fillText('🎮 '+R.S.gp.slice(0,28),L.fx+fw,fy+fh+Math.min(12,H-fy-fh))}
 g.restore()}

function finish(R,fail){if(R.over)return;const M=R.M,n=R.n,tot=n[0]+n[1]+n[3],acc=tot?(300*n[0]+100*n[1])/(300*tot):1,mx=R.max,gz=R.gz,sc=R.score,ctx=R.ctx;
 stop();const rk=fail?'F':acc>=1?'SS':acc>=.95?'S':acc>=.9?'A':acc>=.8?'B':acc>=.7?'C':'D',jc={SS:'#ffd84d',S:'#ffd84d',A:'#7ddc4a',B:'#4aa8ff',C:'#c77dff',D:'#ff5a5a',F:'#ff5a5a'};
 const c=(l,v,k)=>`<div style="text-align:center"><div style="color:${k};font:bold 15px sans-serif">${l}</div><b style="font-size:22px">${v}x</b></div>`;
 show(`<div style="color:#fff;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 40px;padding:16px;font-family:sans-serif"><div style="text-align:center"><div style="opacity:.7">Touhosu</div><div style="font:bold 20px sans-serif">${esc(M.title||'')} [${esc(M.ver||'')}]</div><div style="font:bold 80px sans-serif;color:${jc[rk]};line-height:1.1">${rk}</div></div><div style="display:flex;flex-direction:column;align-items:center;gap:10px"><div style="font:bold 34px sans-serif">${String(sc).padStart(8,'0')}</div><div style="display:flex;gap:22px">${c('Sạch',n[0],'#6cf')+c('1 trúng',n[1],'#8f6')+c('Trúng nhiều',n[3],'#f55')}</div><div style="opacity:.85">${(acc*100).toFixed(2)}% · Combo tối đa ${mx}x · Graze ${gz}${fail?' · Thất bại':''}</div><div style="display:flex;gap:12px;margin-top:6px"><button id="thR" style="background:#444;color:#fff;border:0;border-radius:24px;padding:12px 28px;font:bold 17px sans-serif">Chơi lại</button><button id="thB" style="background:#ff66aa;color:#fff;border:0;border-radius:24px;padding:12px 28px;font:bold 17px sans-serif">Back</button></div></div></div>`);
 document.getElementById('thR').onclick=()=>ctx.restart();document.getElementById('thB').onclick=()=>ctx.quit();
 if(!fail&&rk!=='D'){try{sndPlay('applause',100)}catch(e){}}}
})();
