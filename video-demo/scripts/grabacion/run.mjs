// Uso: node run.mjs <puerto> <regexUrl> <archivo.js | -e "expr">
// Evalúa JS en la página cuya URL coincide. Si hay varias, prefiere la que corre como app instalada
// (display-mode: standalone). Con APP=0 en el entorno prefiere la que NO es app (pestaña normal).
import fs from 'node:fs';
const [port, re, a, b] = process.argv.slice(2);
const expr = a === '-e' ? b : fs.readFileSync(a, 'utf8');
const wantApp = process.env.APP !== '0';
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const pages = list.filter(p => p.type === 'page' && new RegExp(re).test(p.url));
if (!pages.length) { console.error('sin pagina', list.map(p => p.type + ' ' + p.url.slice(0, 80)).join(' | ')); process.exit(1); }
const open = async p => {
  const ws = new WebSocket(p.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = new Map();
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const ev = (expression) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true, userGesture: true } })); });
  return { ws, ev };
};
let chosen = null;
for (const p of pages) {
  const c = await open(p);
  const r = await Promise.race([c.ev("matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: minimal-ui)').matches"), new Promise(ok => setTimeout(() => ok({ result: { result: { value: 'timeout' } } }), 2500))]);
  if (r.result?.result?.value === 'timeout') { c.ws.close(); continue; }
  const isApp = !!r.result?.result?.value;
  if (isApp === wantApp) { chosen = c; break; }
  c.ws.close();
}
if (!chosen) chosen = await open(pages[0]);
const res = await chosen.ev(expr);
console.log(JSON.stringify(res.result?.result?.value ?? res.result?.exceptionDetails?.exception?.description ?? res));
chosen.ws.close(); process.exit(0);
