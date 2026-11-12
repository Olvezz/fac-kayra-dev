(()=>{
if(!window.__fxInstalled){ window.__fxInstalled=true;
const st=document.createElement('style');
st.textContent=`
@keyframes __ring{0%{transform:translate(-50%,-50%) scale(.25);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes __press{0%{filter:brightness(1)}35%{filter:brightness(1.15)}100%{filter:brightness(1)}}
@keyframes __glow{0%{box-shadow:0 0 0 0 rgba(162,31,139,.7)}100%{box-shadow:0 0 0 18px rgba(162,31,139,0)}}
.__ring{position:fixed;width:96px;height:96px;border-radius:50%;pointer-events:none;z-index:2147483646;
 background:radial-gradient(circle,rgba(255,255,255,0) 36%,rgba(162,31,139,.35) 52%,rgba(56,189,248,0) 72%);
 box-shadow:0 0 22px 4px rgba(162,31,139,.5), inset 0 0 16px rgba(56,189,248,.55);animation:__ring .7s cubic-bezier(.16,.84,.3,1) forwards}
.__spark{position:fixed;width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:2147483646}
.__press{animation:__press .4s cubic-bezier(.2,.9,.3,1), __glow .7s ease-out}
#__finger{position:fixed;left:0;top:0;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;pointer-events:none;z-index:2147483647;
 background:radial-gradient(circle,rgba(255,255,255,.95) 0 30%,rgba(255,255,255,.55) 60%,rgba(255,255,255,.15));
 box-shadow:0 0 0 2px rgba(162,31,139,.55),0 6px 16px rgba(0,0,0,.35);opacity:0;transition:opacity .18s, transform 0s}
`; document.head.appendChild(st);
const f=document.createElement('div'); f.id='__finger'; document.body.appendChild(f);
const S={cx:216,cy:600};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const anim=(dur,fn)=>new Promise(res=>{const t0=performance.now();const g=n=>{const t=Math.min(1,(n-t0)/dur);fn(ease(t));t<1?requestAnimationFrame(g):res();};requestAnimationFrame(g);});
const place=(x,y,s=1)=>{f.style.transform=`translate(${x}px,${y}px) scale(${s})`;};
const burst=(x,y)=>{const r=document.createElement('div');r.className='__ring';r.style.left=x+'px';r.style.top=y+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),850);
 const cols=['#A21F8B','#38BDF8','#FACC15','#fff','#F472B6'];
 for(let i=0;i<9;i++){const p=document.createElement('div');p.className='__spark';p.style.left=x+'px';p.style.top=y+'px';p.style.background=cols[i%5];p.style.boxShadow='0 0 8px '+cols[i%5];p.style.transition='all .65s cubic-bezier(.1,.8,.3,1)';document.body.appendChild(p);
  const a=i/9*Math.PI*2+Math.random()*.4,d=30+Math.random()*30;requestAnimationFrame(()=>{p.style.transform=`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.2)`;p.style.opacity='0';});setTimeout(()=>p.remove(),750);}};
const tap=async(el)=>{if(!el)return false;el.scrollIntoView({block:'nearest'});await sleep(60);const b=el.getBoundingClientRect();const x=b.left+Math.min(b.width/2,90),y=b.top+b.height/2;
 place(x,y+30,1.25);f.style.opacity='1';await anim(260,t=>place(x,y+30-30*t,1.25-.35*t));burst(x,y);el.classList.add('__press');await sleep(120);el.click();
 await anim(200,t=>place(x,y,.9+.2*t));f.style.opacity='0';setTimeout(()=>el.classList.remove('__press'),800);await sleep(200);return true;};
// arrastre visual del dedo mientras hace scroll
const swipe=async(box,toY,dur)=>{const el=box||document.scrollingElement;const y0=el.scrollTop;const x=300;const yA=620,yB=300;place(x,yA);f.style.opacity='1';
 await anim(dur,t=>{el.scrollTop=y0+(toY-y0)*t;const k=(toY>y0)?t:t;place(x,yA+(yB-yA)*((k*4)%1));});f.style.opacity='0';};
const SOFT=(el,from,to,dur)=>new Promise(res=>{if(Math.abs(to-from)<2){res();return;}dur=to>from?Math.max(1500,dur*1.9):Math.max(1200,dur);const t0=performance.now();const g=n=>{const t=Math.min(1,(n-t0)/dur);const e=-(Math.cos(Math.PI*t)-1)/2;el.scrollTop=from+(to-from)*e;t<1?requestAnimationFrame(g):res();};requestAnimationFrame(g);}).then(()=>new Promise(r=>setTimeout(r,500)));const smooth=async(box,toY,dur)=>{const el=box||document.scrollingElement;const y0=el.scrollTop;toY=Math.min(toY,el.scrollHeight-el.clientHeight);await SOFT(el,y0,toY,dur);};
window.__fx={sleep,anim,tap,swipe,smooth,burst};
}
return 'fx-movil ok';
})()
