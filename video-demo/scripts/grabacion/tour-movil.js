(()=>{
const {sleep,tap,smooth}=window.__fx;
const byText=(sel,re)=>[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null&&re.test(e.innerText||'')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];
const menu=async p=>{await tap(document.querySelector('.topbar-hamburger'));await sleep(900);await tap(document.querySelector(`[data-page="${p}"]`));await sleep(1600);document.scrollingElement.scrollTop=0;};
const closeM=async()=>{const b=document.querySelector('#cotModal .modal-header button');if(b)await tap(b);await sleep(900);};
window.confirm=()=>false; window.alert=()=>{};
window.__tour=async()=>{window.__log=[];const L=m=>window.__log.push([m,Math.round(performance.now())]);
 document.scrollingElement.scrollTop=0; L('start'); await sleep(2500);
 L('dash'); await smooth(null,900,3500); await sleep(800); await smooth(null,1900,3500); await sleep(800); await smooth(null,0,2500); await sleep(400);
 await tap(byText('button, div, span',/Recientes/)); await sleep(2000); await tap(byText('button, div, span',/Próximos eventos/)); await sleep(1300);
 L('menu'); await tap(document.querySelector('.topbar-hamburger')); await sleep(2200);
 L('cot'); await tap(document.querySelector('[data-page="cotizaciones"]')); await sleep(2200);
 const tw=document.getElementById('cotizacionesTbody')?.closest('.table-wrap'); if(tw){ await smooth(tw,tw.scrollWidth,2500); await sleep(1200);
   const rows=[...document.querySelectorAll('#cotizacionesTbody tr')]; const edit=rows[1]?.querySelector('.table-actions button');
   if(edit){ await tap(edit); await sleep(2300); const box=document.getElementById('cotModalBox');
     await smooth(box,700,3000); await sleep(800); await smooth(box,1500,3000); await sleep(700); await smooth(box,0,1000); await closeM(); }
   await smooth(tw,0,1200); }
 await tap(byText('#page-cotizaciones button',/Nueva/)); await sleep(2300); await smooth(document.getElementById('cotModalBox'),800,3000); await sleep(900); await smooth(document.getElementById('cotModalBox'),0,800); await closeM();
 L('cli'); await menu('clientes'); await smooth(null,2000,6000); await sleep(700); await smooth(null,0,1800);
 L('cat'); await menu('catalogo'); await smooth(null,1500,5000); await sleep(700); await smooth(null,0,1600);
 window.__done=true; await new Promise(r=>{window.__go2=r}); window.__done=false; L('gas'); await menu('gastos'); await sleep(2800);
 L('cue'); await menu('cuentas'); await sleep(1500);
 for(const re of [/Efectivo/,/BHD/,/Banreservas/,/^Todas$/]){ await tap(byText('button',re)); await sleep(1500); }
 L('cie'); await menu('cierres'); await sleep(2500); await smooth(null,1200,3500); await sleep(600); await smooth(null,0,1500);
 L('gal'); await menu('galeria'); await sleep(2600);
 L('log'); await menu('logs'); await smooth(null,1800,4500); await sleep(400); await smooth(null,0,1200);
 L('cfg'); await menu('config'); await smooth(null,1200,4000); await sleep(700); await smooth(null,0,1500);
 L('fin'); await menu('dashboard'); await sleep(3000); window.__done=true; };
return 'tour ok';
})()
