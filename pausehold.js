/* Nút tạm dừng kiểu lazer: con trỏ lại gần viền giữa bên phải -> nút mũi tên hiện dần.
   Giữ (bấm giữ / chạm giữ) 1.8s cho đến khi viền tròn đầy -> tạm dừng.
   Bấm "Tiếp tục" -> đếm ngược 3-2-1 rồi mới chơi tiếp. Dùng cho mọi chế độ. */
(function(){
const el=document.getElementById('x'),ui=document.getElementById('ui');if(!el||!ui)return;
const HOLD=1800,NEAR=170,FAR=60,ring=el.querySelector('.pr'),C=2*Math.PI*26;
ring.style.strokeDasharray=C.toFixed(2);ring.style.strokeDashoffset=C.toFixed(2);
const coarse=()=>{try{return matchMedia('(pointer:coarse)').matches}catch(e){return false}};
let vx=-1e4,vy=-1e4,prog=0,holding=false,hid=null,fired=false,t0=0,last=0,raf=0,op=0;

const playing=()=>el.style.display!=='none'&&el.style.display!==''&&ui.className==='h'&&!window.OSUI_CDON;
const rect=()=>el.getBoundingClientRect();
const inside=(x,y,pad)=>{const r=rect();return x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad};
const locked=()=>!!document.pointerLockElement;
const pos=e=>{if(locked()){vx=Math.max(0,Math.min(innerWidth,(vx<-9e3?innerWidth/2:vx)+(e.movementX||0)));vy=Math.max(0,Math.min(innerHeight,(vy<-9e3?innerHeight/2:vy)+(e.movementY||0)))}else{vx=e.clientX;vy=e.clientY}};

function want(){ // độ hiện mong muốn 0..1
  if(!playing())return 0;
  if(holding)return 1;
  const r=rect(),cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2,d=Math.hypot(vx-cx,(vy-cy)*.8);
  let o=d>=NEAR?0:d<=FAR?1:(NEAR-d)/(NEAR-FAR);
  if(coarse())o=Math.max(o,.28);
  return o}
function apply(){
  const w=want();op+=(w-op)*(w>op?.35:.18);if(Math.abs(w-op)<.01)op=w;
  el.style.opacity=op.toFixed(3);
  const act=playing()&&(op>.15||holding);el.style.pointerEvents=act?'auto':'none';
  el.style.transform='scale('+(1+prog*.12).toFixed(3)+')';
  ring.style.strokeDashoffset=(C*(1-prog)).toFixed(2)}
function tick(now){
  raf=0;const dt=last?Math.min(100,now-last):16;last=now;
  if(!playing()){if(holding){holding=false;hid=null}prog=0}
  else if(holding){prog=Math.min(1,prog+dt/HOLD);
    if(prog>=1&&!fired){fired=true;holding=false;hid=null;prog=0;trigger()}}
  else if(prog>0)prog=Math.max(0,prog-dt/HOLD*3);
  apply();
  if(holding||prog>0||Math.abs(want()-op)>.01||playing())raf=requestAnimationFrame(tick);else last=0}
const kick=()=>{if(!raf)raf=requestAnimationFrame(tick)};
function trigger(){const f=el.onclick;try{if(f)f.call(el,new Event('click'))}catch(e){console.error(e)}}
function start(e){if(!playing()||holding)return false;holding=true;fired=false;hid=e.pointerId;last=0;kick();return true}
function stop(){if(!holding&&prog===0)return;holding=false;hid=null;kick()}

addEventListener('pointermove',e=>{pos(e);if(holding&&e.pointerId===hid&&!inside(vx,vy,14))stop();kick()},true);
addEventListener('pointerdown',e=>{pos(e);
  if(!playing())return;
  const on=e.target===el||el.contains(e.target)||(locked()&&inside(vx,vy,0));
  if(on&&op>.15){if(start(e)){if(locked()){e.stopPropagation()}try{if(e.target===el)el.setPointerCapture(e.pointerId)}catch(x){}}}
  kick()},true);
addEventListener('mousedown',e=>{if(locked()&&holding)e.stopPropagation()},true);
const up=e=>{if(holding&&e.pointerId===hid){fired=false;stop()}else if(!holding)fired=false};
addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
addEventListener('blur',stop);document.addEventListener('visibilitychange',stop);
// chặn click thường (chỉ chấp nhận giữ đủ 1.8s)
addEventListener('click',e=>{if(e.target===el||el.contains(e.target)){e.stopPropagation();e.preventDefault()}},true);
el.addEventListener('contextmenu',e=>e.preventDefault());
// theo dõi trạng thái chơi (display/ui) để tự hiện/ẩn
new MutationObserver(kick).observe(el,{attributes:true,attributeFilter:['style']});
new MutationObserver(kick).observe(ui,{attributes:true,attributeFilter:['class']});
kick();

/* Đếm ngược 3-2-1 khi tiếp tục. done(): chơi tiếp; cancel(): bị gián đoạn (ẩn tab) -> quay lại menu tạm dừng. */
window.OSUI_CD=function(done,cancel){
  if(window.OSUI_CDON)return;window.OSUI_CDON=1;
  const d=document.createElement('div');d.id='cd';document.body.appendChild(d);
  let n=3,tm=0,fin=false;
  const end=ok=>{if(fin)return;fin=true;clearTimeout(tm);document.removeEventListener('visibilitychange',vis);try{d.remove()}catch(e){}window.OSUI_CDON=0;kick();try{(ok?done:cancel)&&(ok?done:cancel)()}catch(e){console.error(e)}};
  const vis=()=>{if(document.hidden)end(false)};document.addEventListener('visibilitychange',vis);
  const step=()=>{if(n<=0){end(true);return}d.textContent=n;d.classList.remove('go');void d.offsetWidth;d.classList.add('go');n--;tm=setTimeout(step,1000)};
  step()};
})();
