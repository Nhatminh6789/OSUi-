/* ADOFAI -> Hitokori importer.
   Nhận zip chứa file .adofai (+ nhạc), mỗi thư mục thành 1 bộ map riêng của Hitokori (HitokoriOnly).
   Quy tắc đã đối chiếu: midspin (999) = gạch đặt tại vị trí gạch trước, tốn 0 thời gian, đảo hướng vào (+180°). */
(function(){
'use strict';
const PATH={R:0,p:15,J:30,E:45,T:60,o:75,U:90,q:105,G:120,Q:135,H:150,W:165,L:180,x:195,N:210,Z:225,F:240,V:255,D:270,Y:285,B:300,C:315,M:330,A:345,'!':999};
const mod=(a,m)=>((a%m)+m)%m;

/* JSON của ADOFAI có BOM + dấu phẩy thừa */
function jparse(t){t=t.replace(/^\uFEFF/,'');let o='',s=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(s){o+=c;if(c==='\\')o+=t[++i];else if(c==='"')s=false;continue}
  if(c==='"'){s=true;o+=c;continue}
  if(c===','){let j=i+1;while(j<t.length&&/\s/.test(t[j]))j++;if(t[j]==='}'||t[j]===']')continue}
  o+=c}
 return JSON.parse(o)}

/* mô phỏng level -> danh sách floor (toạ độ canvas: y xuống, góc đảo dấu) */
function simulate(d){
 let ad=d.angleData;
 if(!ad&&typeof d.pathData==='string')ad=[...d.pathData].map(c=>c in PATH?PATH[c]:0);
 if(!ad||!ad.length)throw Error('Level không có angleData');
 const s=d.settings||{},n=ad.length,base=+s.bpm||100,ev={};
 for(const a of d.actions||[])(ev[a.floor]=ev[a.floor]||[]).push(a);
 let spd=base,cw=true,t=0,inang=180,x=0,y=0;const F=[];
 let pendSpd=0,pendTw=false;
 for(let f=0;f<=n;f++){
  const fl={f,t,x,y:-y,mid:f>0&&ad[f-1]===999,hin:f?F[f-1].houtM:0,spd:0,tw:false,pause:0,dur:0,ao:0};
  fl.hinM=fl.hin;
  if(f===n){fl.houtM=fl.hin;F.push(fl);break}
  const prev=spd;let pb=0,tw=false;
  for(const a of ev[f]||[]){
   if(a.eventType==='Twirl'){cw=!cw;tw=true}
   else if(a.eventType==='SetSpeed')spd=a.speedType==='Bpm'?+a.beatsPerMinute:spd*(+a.bpmMultiplier||1);
   else if(a.eventType==='Pause')pb+=+a.duration||0}
  const r=spd/prev;
  fl.spdRaw=Math.abs(r-1)>.01?(r>1?1:-1):0;fl.twRaw=tw;
  const mid=ad[f]===999,out=mid?inang:ad[f];
  let delta=0;if(!mid){delta=cw?mod(inang-out,360):mod(out-inang,360);if(delta===0)delta=360}
  fl.houtM=out;fl.ao=cw?delta:-delta;
  fl.pause=pb*60000/spd;fl.dur=delta/180*60000/spd+fl.pause;
  F.push(fl);
  t+=fl.dur;x+=Math.cos(out*Math.PI/180);y+=Math.sin(out*Math.PI/180);inang=mod(out+180,360)}
 /* chuyển icon của gạch midspin sang gạch thật kế tiếp */
 for(let i=0;i<F.length;i++){const k=F[i];
  if(k.mid){const nx=F.slice(i+1).find(z=>!z.mid);if(nx){if(!nx.spdRaw)nx.spdRaw=k.spdRaw;nx.twRaw=nx.twRaw||k.twRaw}k.spdRaw=0;k.twRaw=false}
  k.spd=k.spdRaw;k.tw=k.twRaw}
 return{F,s}}

const r4=v=>Math.round(v*1e4)/1e4;
const clean=v=>String(v==null?'':v).replace(/<\/?[^>]*>/g,'').replace(/[\r\n]+/g,' ').trim();
function toOsu(d,o){
 const{F,s}=simulate(d),bpm=+s.bpm||100,bl=60000/bpm;
 let c=+s.offset||0;if(String(s.separateCountdownTime).toLowerCase()==='disabled')c+=(+s.countdownTicks||0)*bl;
 const real=F.filter((k,i)=>i>0&&!k.mid);
 let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;for(const k of F){mnx=Math.min(mnx,k.x);mxx=Math.max(mxx,k.x);mny=Math.min(mny,k.y);mxy=Math.max(mxy,k.y)}
 const sc=Math.min(440/Math.max(1,mxx-mnx),320/Math.max(1,mxy-mny),40),cx=(mnx+mxx)/2,cy=(mny+mxy)/2;
 const L=['osu file format v14','','[General]','AudioFilename: '+(o.audio||''),'AudioLeadIn: 0','PreviewTime: '+Math.round((+s.previewSongStart||0)*1000),'Countdown: 0','SampleSet: Normal','StackLeniency: 0.7','Mode: 0','HitokoriOnly: 1','',
 '[Metadata]','Title:'+(clean(s.song)||o.ver),'TitleUnicode:'+(clean(s.song)||o.ver),'Artist:'+(clean(s.artist)||'Unknown'),'ArtistUnicode:'+(clean(s.artist)||'Unknown'),'Creator:'+(clean(s.author)||'ADOFAI'),'Version:'+o.ver,'Source:A Dance of Fire and Ice','Tags:hitokori-only adofai','BeatmapID:0','BeatmapSetID:-1','',
 '[Difficulty]','HPDrainRate:5','CircleSize:4','OverallDifficulty:5','ApproachRate:8','SliderMultiplier:1.4','SliderTickRate:1','',
 '[Events]',o.bg?'0,0,"'+o.bg+'",0,0':'//no bg','',
 '[TimingPoints]','0,'+bl+',4,1,0,100,1,0','','[Hitokori]'];
 /* mỗi dòng F = 1 floor: t,x,y,hinDeg,houtDeg,aoDeg,pauseMs,spd,twirl,mid  (canvas: góc đảo dấu) */
 for(const k of F){const hi=F.indexOf(k);
  L.push(['F',Math.round(k.t+c),r4(k.x),r4(k.y),r4(-k.hin),r4(-k.houtM),r4(k.ao),Math.round(k.pause),k.spd,k.tw?1:0,k.mid?1:0].join(','))}
 L.push('','[HitObjects]');let lt=-1;
 for(const k of real){const tt=Math.max(lt+1,Math.round(k.t+c));lt=tt;
  L.push(Math.round(256+(k.x-cx)*sc)+','+Math.round(192+(k.y-cy)*sc)+','+tt+',1,0,0:0:0:0:')}
 return L.join('\r\n')+'\r\n'}

/* zip kiểu store */
const CT=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[i]=c>>>0}return t})();
const crc=u=>{let c=~0;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^(c>>>8);return(~c)>>>0};
function zip(ents){const te=new TextEncoder(),parts=[],cd=[];let off=0;
 for(const e of ents){const nm=te.encode(e.name),d=e.data,cr=crc(d);
  const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint32(14,cr,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(h.buffer),nm,d);
  const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint32(16,cr,true);c.setUint32(20,d.length,true);c.setUint32(24,d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
  cd.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+d.length}
 const cs=cd.reduce((a,b)=>a+b.length,0),end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,ents.length,true);end.setUint16(10,ents.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
 const all=[...parts,...cd,new Uint8Array(end.buffer)],out=new Uint8Array(all.reduce((a,b)=>a+b.length,0));let p=0;for(const a of all){out.set(a,p);p+=a.length}return out.buffer}

const dirOf=n=>n.includes('/')?n.slice(0,n.lastIndexOf('/')):'',baseOf=n=>n.split('/').pop();
function find(F,dir,name){if(!name)return null;const ks=Object.keys(F),nb=baseOf(name.replace(/\\/g,'/')).toLowerCase();
 return ks.find(k=>dirOf(k)===dir&&baseOf(k).toLowerCase()===nb)||ks.find(k=>baseOf(k).toLowerCase()===nb)||null}

const isPack=F=>{const ks=Object.keys(F);return ks.some(n=>/\.adofai$/i.test(n))&&!ks.some(n=>/\.osu$/i.test(n))};

async function importPack(F,importOsz){
 const names=Object.keys(F).filter(n=>/\.adofai$/i.test(n)&&!/(^|\/)backup[^/]*\.adofai$/i.test(n)),groups={};
 for(const n of names)(groups[dirOf(n)]=groups[dirOf(n)]||[]).push(n);
 let id=null,ok=0,errs=[];
 for(const dir of Object.keys(groups)){
  const ents=[],have=new Set();let used=0;
  for(const n of groups[dir]){try{
   const d=jparse(new TextDecoder().decode(await F[n]())),s=d.settings||{};
   let ak=find(F,dir,s.songFilename);
   if(!ak){const a=Object.keys(F).filter(k=>dirOf(k)===dir&&/\.(mp3|ogg|wav|m4a|flac|opus)$/i.test(k));if(a.length===1)ak=a[0]}
   let bk=s.bgImage?find(F,dir,s.bgImage):null;
   const ver=baseOf(n).replace(/\.adofai$/i,'');
   const osu=toOsu(d,{audio:ak?baseOf(ak):'',bg:bk?baseOf(bk):'',ver});
   ents.push({name:ver.replace(/[\\/:*?"<>|]/g,'_')+'.osu',data:new TextEncoder().encode(osu)});
   for(const k of[ak,bk])if(k&&!have.has(k)){have.add(k);ents.push({name:baseOf(k),data:new Uint8Array(await F[k]())})}
   used++}catch(e){errs.push(baseOf(n)+': '+e.message)}}
  if(used){try{id=await importOsz(zip(ents));ok++}catch(e){errs.push(dir+': '+e.message)}}}
 if(!ok)throw Error('Không đọc được level ADOFAI nào'+(errs.length?' ('+errs[0]+')':''));
 return id}

window.ADOFAI={isPack,importPack,jparse,simulate,toOsu,zip};
})();
