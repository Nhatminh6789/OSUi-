/* Ví dụ plugin chế độ độc lập (không cần .dll): "Orbs" - hứng cầu rơi theo nhịp map.
   Thêm trong Cài đặt → Thêm chế độ → chọn file này. Chế độ tự có d-pad/joystick/tay cầm, Skip, Pause, chơi ngang. */
OM.register({id:'orbs',name:'Orbs',standalone:true,
 settings:[{k:'size',label:'Cỡ cầu',t:'seg',o:[['Nhỏ',8],['Vừa',12],['To',18]],def:12}],
 support:M=>M.mode?'Orbs chỉ chơi map osu!standard':'',
 async build(){return{}},
 icon(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#5ab4ff';x.beginPath();x.arc(32,32,24,0,7);x.fill();x.fillStyle='#fff8';x.beginPath();x.arc(24,24,8,0,7);x.fill();return c.toDataURL()},
 async start(ctx){
  const{M,buf,cfg}=ctx,W0=384,H0=480,ho=(M.ho||[]).slice().sort((a,b)=>a.time-b.time),first=ho.length?ho[0].time:0,lead=Math.max(0,1800-first);
  let t0=ac.currentTime+.2+lead/1000,src=null,paused=false,over=false,raf=0,ni=0,score=0,miss=0;const orbs=[],pl={x:W0/2,y:H0-40};
  const play=(ms,at)=>{if(src)try{src.stop()}catch(e){}src=null;if(buf){src=ac.createBufferSource();src.buffer=buf;src.connect(aout('u'));if(at!=null)src.start(at);else src.start(0,Math.max(0,ms)/1000)}};
  const S=OM.session({fw:W0,fh:H0,buttons:[],
   onPause(){paused=true;ac.suspend()},onResume(){paused=false;ac.resume();raf=requestAnimationFrame(loop)},
   onRestart(){over=true;cancelAnimationFrame(raf);if(src)try{src.stop()}catch(e){}ac.resume();ctx.restart()},
   onQuit(){over=true;cancelAnimationFrame(raf);if(src)try{src.stop()}catch(e){}ac.resume();ctx.quit()},
   onSkip(ms){t0=ac.currentTime-ms/1000;play(ms)}});
  hide();play(0,t0);
  function loop(){if(over||paused)return;const now=(ac.currentTime-t0)*1000,I=S.read(),dt=1/60;
   pl.x=Math.max(10,Math.min(W0-10,pl.x+I.x*(I.f?150:300)*dt));
   while(ni<ho.length&&ho[ni].time-900<=now){orbs.push({x:20+ho[ni].x/512*(W0-40),y:0,t:ho[ni].time});ni++}
   S.setSkip(ni<ho.length&&ho[ni].time-now>3500?ho[ni].time-2000:null);
   for(let i=orbs.length-1;i>=0;i--){const o=orbs[i];o.y=(1-(o.t-now)/900)*(pl.y);if(Math.abs(o.x-pl.x)<cfg.size+14&&Math.abs(o.y-pl.y)<18){score+=100;orbs.splice(i,1)}else if(o.y>H0){miss++;orbs.splice(i,1)}}
   if(ni>=ho.length&&!orbs.length&&now>(ho.length?ho[ho.length-1].time:0)+1500){over=true;S.close();if(src)try{src.stop()}catch(e){}return show('<div style="color:#fff;font:bold 28px sans-serif">Orbs · '+score+' điểm · bỏ lỡ '+miss+'<br><br><button id="ob">Back</button></div>'),document.getElementById('ob').onclick=ctx.quit}
   const L=S.lay;g.clearRect(0,0,W,H);g.fillStyle='#0b0b16';g.fillRect(0,0,W,H);g.fillStyle='#000a';g.fillRect(L.fx,L.fy,L.fw,L.fh);
   g.save();g.beginPath();g.rect(L.fx,L.fy,L.fw,L.fh);g.clip();g.translate(L.fx,L.fy);g.scale(L.sc,L.sc);
   g.fillStyle='#5ab4ff';for(const o of orbs){g.beginPath();g.arc(o.x,o.y,cfg.size,0,7);g.fill()}g.fillStyle='#ff66aa';g.fillRect(pl.x-14,pl.y-6,28,12);g.restore();
   g.fillStyle='#fff';g.font='bold 20px sans-serif';g.textAlign='left';g.fillText('Điểm '+score,Math.max(L.act.x0,L.fx+L.fw+16),L.fy+30);
   raf=requestAnimationFrame(loop)}
  raf=requestAnimationFrame(loop)}});
