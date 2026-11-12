(()=>{
// En la BETA (colecciones beta_*): crear cotización, abono, gasto y cierre. Requiere window.__fx (pc-tour.js).
window.confirm=()=>true; window.alert=()=>{};
[...document.body.querySelectorAll('div')].filter(e=>e.children.length===0&&/BETA · DATOS/.test(e.textContent)).forEach(e=>e.style.display='none');
const {sleep,anim,clickEl,moveTo}=window.__fx;
const $=s=>document.querySelector(s);
const byText=(sel,re)=>[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null&&re.test(e.innerText||'')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];
const typeIn=async(el,txt,cps=14)=>{if(!el)return;await clickEl(el,800);el.focus();el.value='';for(const ch of txt){el.value+=ch;el.dispatchEvent(new Event('input',{bubbles:true}));await sleep(1000/cps);}el.dispatchEvent(new Event('change',{bubbles:true}));await sleep(250);};
const pick=async(el,val)=>{if(!el)return;await clickEl(el,750);await sleep(250);el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.style.transition='box-shadow .3s';el.style.boxShadow='0 0 0 4px rgba(162,31,139,.25)';setTimeout(()=>el.style.boxShadow='',700);await sleep(500);};
const SOFT=(el,from,to,dur)=>new Promise(res=>{if(Math.abs(to-from)<2){res();return;}dur=to>from?Math.max(1500,dur*1.9):Math.max(1200,dur);const t0=performance.now();const g=n=>{const t=Math.min(1,(n-t0)/dur);const e=-(Math.cos(Math.PI*t)-1)/2;el.scrollTop=from+(to-from)*e;t<1?requestAnimationFrame(g):res();};requestAnimationFrame(g);}).then(()=>new Promise(r=>setTimeout(r,500)));const sc=async(y,dur,box)=>{const el=box||document.scrollingElement;const y0=el.scrollTop;y=Math.min(y,el.scrollHeight-el.clientHeight);await SOFT(el,y0,y,dur);};
const into=async(el,box,off=180)=>{if(!el)return;const bx=box.getBoundingClientRect(),r=el.getBoundingClientRect();await sc(box.scrollTop+(r.top-bx.top)-off,700,box);};
const nav=async p=>{await clickEl(document.querySelector(`[data-page="${p}"]`),850);await sleep(1700);};
window.__beta=async()=>{window.__log=[];const T0=performance.now();const L=m=>window.__log.push([m,Math.round(performance.now()-T0)]);
 document.scrollingElement.scrollTop=0; await sleep(1500);
 L('crear'); await nav('cotizaciones'); await sleep(800);
 await clickEl(byText('#page-cotizaciones button',/Nueva/),1000); await sleep(1500);
 const box=$('#cotModalBox');
 await typeIn($('#comboCliente .combo-input'),'Lorena',9); await sleep(900);
 {const opt=[...document.querySelectorAll('#comboCliente .combo-list > *')].find(e=>e.offsetParent!==null); if(opt){await clickEl(opt,700); opt.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true}));} await sleep(800);}
 await pick($('#cotFechaEvento'),'2026-11-29');
 await pick($('#cotHoraEvento'),'4:00 PM');
 await typeIn($('#cotTematica'),'Princesas Disney');
 await typeIn($('#cotFestejado'),'Sofía — 5 años');
 await into(byText('#cotModalBox button',/Agregar servicio/),box,260);
 L('svc'); await clickEl(byText('#cotModalBox button',/Agregar servicio/),900); await sleep(1200);
 await typeIn($('#svcBuscar'),'Decoraci',10); await sleep(700);
 {let o=[...document.querySelectorAll('#svcPickLista .svc-pick')].filter(e=>!/servicio libre/.test(e.innerText)); if(o[1]){await clickEl(o[1],800);await sleep(900);} }
 {const i=$('#svcBuscar'); if(i){ await typeIn(i,'Animaci',10); await sleep(700); let o=[...document.querySelectorAll('#svcPickLista .svc-pick')].filter(e=>!/servicio libre/.test(e.innerText)); if(o[0]){await clickEl(o[0],800);await sleep(900);} }}
 {const c=byText('#modalFooter button',/Cancelar|Listo|Cerrar/); if($('#modalOverlay').classList.contains('open')&&c){await clickEl(c,700);} await sleep(900);}
 await into($('#totTotal'),box,420); await sleep(1500);
 L('estado'); await into($('#cotEstado'),box,200);
 await pick($('#cotEstado'),'Reservado');
 await pick($('#cotCuentaCobro'),'BHD');
 L('abono'); await clickEl(byText('#cotModalBox button',/Agregar abono/),900); await sleep(1100);
 await typeIn($('#fAbonoMonto'),'5000',8);
 await pick($('#fAbonoCuenta'),'BHD');
 await clickEl(byText('#modalFooter button',/Guardar/),800); await sleep(1500);
 await into($('#cotSaldo'),box,300); await sleep(1800);
 L('guardar'); await clickEl($('#cotSaveBtn'),1000); await sleep(3200);
 L('gasto'); await nav('gastos'); await sleep(600);
 await clickEl(byText('#page-gastos button',/Registrar/),1000); await sleep(1500);
 await typeIn($('#fGastoDesc'),'Globos y helio');
 await typeIn($('#fGastoMonto'),'3500',8);
 await pick($('#fGastoCat'),'Decoración');
 await pick($('#fGastoCuenta'),'Efectivo');
 await typeIn($('#comboGastoCot .combo-input'),'Princesas',9); await sleep(900);
 {const opt=[...document.querySelectorAll('#comboGastoCot .combo-list > *')].find(e=>e.offsetParent!==null); if(opt){await clickEl(opt,700); opt.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true}));} await sleep(700);}
 await clickEl(byText('#modalFooter button',/Guardar/),900); await sleep(3000);
 L('pagos'); await nav('cuentas'); await sleep(3500); await sc(500,2500); await sleep(1200); await sc(0,1200);
 L('cierre'); await nav('cierres'); await sleep(1200); await clickEl(byText('#page-cierres button',/Calcular/),1000); await sleep(4000); await sc(600,2500); await sleep(1500); await sc(0,1200);
 L('dash'); await nav('dashboard'); await sleep(2500); await sc(700,3000); await sleep(1500); await sc(0,1500); await moveTo(innerWidth*.6,innerHeight*.55,900); await sleep(1500);
 L('fin'); window.__betaDone=true; };
return 'beta lista';
})()

