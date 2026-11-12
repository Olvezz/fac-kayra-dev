(()=>{
if(!window.__fxInstalled){ window.__fxInstalled=true;
const st=document.createElement('style');
st.textContent=`
@keyframes __ring{0%{transform:translate(-50%,-50%) scale(.2);opacity:.95}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes __press{0%{filter:brightness(1)}35%{filter:brightness(1.15)}100%{filter:brightness(1)}}
@keyframes __glow{0%{box-shadow:0 0 0 0 rgba(162,31,139,.7)}100%{box-shadow:0 0 0 22px rgba(162,31,139,0)}}
.__ring{position:fixed;width:120px;height:120px;border-radius:50%;pointer-events:none;z-index:2147483646;
 background:radial-gradient(circle,rgba(255,255,255,0) 38%,rgba(162,31,139,.32) 52%,rgba(56,189,248,0) 72%);
 box-shadow:0 0 26px 5px rgba(162,31,139,.45), inset 0 0 18px rgba(56,189,248,.55);animation:__ring .75s cubic-bezier(.16,.84,.3,1) forwards}
.__spark{position:fixed;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:2147483646}
.__press{animation:__press .42s cubic-bezier(.2,.9,.3,1), __glow .7s ease-out}
.__dot{position:fixed;width:10px;height:10px;border-radius:50%;pointer-events:none;z-index:2147483645;background:rgba(162,31,139,.32)}
html{scrollbar-width:none}
`; document.head.appendChild(st);
const cur=document.createElement('div'); cur.id='__cur';
cur.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:30px;height:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4))';
cur.innerHTML='<svg style="display:block;transform-origin:5px 3px" width="30" height="30" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
document.body.appendChild(cur);
const S={cx:innerWidth*.6,cy:innerHeight*.55,last:0};
cur.style.transform=`translate(${S.cx}px,${S.cy}px)`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const anim=(dur,fn)=>new Promise(res=>{const t0=performance.now();const g=n=>{const t=Math.min(1,(n-t0)/dur);fn(ease(t));t<1?requestAnimationFrame(g):res();};requestAnimationFrame(g);});
const trail=(x,y)=>{const n=performance.now();if(n-S.last<24)return;S.last=n;const d=document.createElement('div');d.className='__dot';d.style.left=(x-3)+'px';d.style.top=(y-2)+'px';d.style.transition='all .45s ease-out';document.body.appendChild(d);requestAnimationFrame(()=>{d.style.opacity='0';d.style.transform='scale(.2)';});setTimeout(()=>d.remove(),550);};
const moveTo=async(x,y,dur=900)=>{const sx=S.cx,sy=S.cy;const arc=Math.min(60,Math.hypot(x-sx,y-sy)*.12);await anim(dur,t=>{const px=sx+(x-sx)*t,py=sy+(y-sy)*t-Math.sin(t*Math.PI)*arc;cur.style.transform=`translate(${px}px,${py}px)`;trail(px,py);});S.cx=x;S.cy=y;};
const burst=()=>{const r=document.createElement('div');r.className='__ring';r.style.left=S.cx+'px';r.style.top=S.cy+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),900);
 const cols=['#A21F8B','#38BDF8','#FACC15','#fff','#F472B6'];
 for(let i=0;i<10;i++){const p=document.createElement('div');p.className='__spark';p.style.left=S.cx+'px';p.style.top=S.cy+'px';p.style.background=cols[i%5];p.style.boxShadow='0 0 10px '+cols[i%5];p.style.transition='all .7s cubic-bezier(.1,.8,.3,1)';document.body.appendChild(p);
  const a=i/10*Math.PI*2+(i%3)*.13,d=40+((i*37)%40);requestAnimationFrame(()=>{p.style.transform=`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.2)`;p.style.opacity='0';});setTimeout(()=>p.remove(),800);}};
const clickEl=async(el,dur=900)=>{if(!el)return;const b=el.getBoundingClientRect();await moveTo(b.left+Math.min(b.width/2,60),b.top+b.height/2,dur);
 cur.firstElementChild.animate([{transform:'scale(1)'},{transform:'scale(.75)'},{transform:'scale(1)'}],{duration:260});burst();el.classList.add('__press');await sleep(140);el.click();setTimeout(()=>el.classList.remove('__press'),800);};
window.__fx={sleep,anim,moveTo,clickEl,S};
}
window.confirm=()=>false; window.alert=()=>{};
const {sleep,anim,clickEl,moveTo}=window.__fx;
const byText=(sel,re)=>[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null&&re.test(e.innerText||'')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];
const SOFT=(el,from,to,dur)=>new Promise(res=>{if(Math.abs(to-from)<2){res();return;}dur=to>from?Math.max(1500,dur*1.9):Math.max(1200,dur);const t0=performance.now();const g=n=>{const t=Math.min(1,(n-t0)/dur);const e=-(Math.cos(Math.PI*t)-1)/2;el.scrollTop=from+(to-from)*e;t<1?requestAnimationFrame(g):res();};requestAnimationFrame(g);}).then(()=>new Promise(r=>setTimeout(r,500)));const sc=async(y,dur,box)=>{const el=box||document.scrollingElement;const y0=el.scrollTop;y=Math.min(y,el.scrollHeight-el.clientHeight);await SOFT(el,y0,y,dur);};
const nav=async p=>{await clickEl(document.querySelector(`[data-page="${p}"]`),850);await sleep(1700);};
window.__tour=async()=>{window.__log=[];const T0=performance.now();const L=m=>window.__log.push([m,Math.round(performance.now()-T0)]);
 document.scrollingElement.scrollTop=0;
 L('dash');await sleep(2500);await sc(600,3200);await sleep(900);await sc(1500,3200);await sleep(900);await sc(0,2300);await sleep(400);
 await clickEl(byText('button, div, span',/^\W*Recientes$/),900);await sleep(2200);
 await clickEl(byText('button, div, span',/Próximos eventos$/),700);await sleep(1300);
 L('cot');await nav('cotizaciones');await sleep(2200);
 {const rows=[...document.querySelectorAll('#cotizacionesTbody tr')];const edit=rows[1]?.querySelector('.table-actions button');
 if(edit){await clickEl(edit,1100);await sleep(2600);const mb=document.getElementById('cotModalBox');await sc(700,3200,mb);await sleep(900);await sc(1600,3200,mb);await sleep(900);await sc(0,1200,mb);
  await clickEl(document.querySelector('#cotModal .modal-header button'),800);await sleep(1000);}}
 await clickEl(byText('#page-cotizaciones button, button',/Nueva\s*cotización/),1000);await sleep(2600);await sc(700,3000,document.getElementById('cotModalBox'));await sleep(1000);
 await clickEl(document.querySelector('#cotModal .modal-header button'),800);await sleep(1000);
 L('cli');await nav('clientes');await sleep(1500);await sc(2000,6000);await sleep(700);await sc(0,1800);
 L('cat');await nav('catalogo');await sleep(1500);await sc(1400,5000);await sleep(700);await sc(0,1600);
 L('gas');await nav('gastos');await sleep(3200);
 L('cue');await nav('cuentas');await sleep(2000);
 for(const re of [/Efectivo/,/BHD/,/Banreservas/,/^Todas$/]){await clickEl(byText('button',re),900);await sleep(1600);}
 L('cie');await nav('cierres');await sleep(2000);await sleep(1500);await sc(900,3000);await sleep(800);await sc(0,1500);
 L('gal');await nav('galeria');await sleep(3000);
 L('log');await nav('logs');await sleep(1500);await sc(1500,4200);await sleep(400);await sc(0,1200);
 L('cfg');await nav('config');await sleep(2200);await sc(900,3500);await sleep(800);await sc(0,1500);
 L('fin');await nav('dashboard');await moveTo(innerWidth*.6,innerHeight*.55,1000);await sleep(2500);window.__done=true;L('done');};
let n=0;const t0=performance.now();return new Promise(r=>{const f=()=>{n++;performance.now()-t0<1000?requestAnimationFrame(f):r('fps '+n+' vw '+innerWidth+'x'+innerHeight);};requestAnimationFrame(f);});
})()
