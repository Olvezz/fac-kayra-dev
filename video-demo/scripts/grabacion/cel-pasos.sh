#!/usr/bin/env bash
# Paso a paso en el celular, desde cero: Chrome en pestaña limpia -> sitio -> login con Google -> instalar -> abrir la app.
# Graba con screenrecord y anota en pasos-cel.log el momento (s) y lugar (px) de cada toque, para los efectos del video.
export MSYS_NO_PATHCONV=1
R="$(cygpath -m "$(cd "$(dirname "$0")" && pwd)")"
OUT="$1"; LOG="$R/pasos-cel.log"; : > "$LOG"
adb shell rm -f /sdcard/pasos.mp4
adb shell screenrecord --bit-rate 16000000 --time-limit 120 /sdcard/pasos.mp4 &
REC=$!
T0=$(date +%s.%N)
t(){ echo "$(awk "BEGIN{printf \"%.2f\", $(date +%s.%N)-$T0}") $*" >> "$LOG"; }
tap(){ t "tap $1 $2 $3"; adb shell input tap $1 $2; }
sleep 2.5
t "paso entrar"
tap 420 177 barra
sleep 1.2
for c in olvezz. github. io/ fac- kayra- dev; do adb shell input text "$c"; sleep 0.25; done
sleep 0.8
adb shell input keyevent 112; sleep 0.4
t "enter"; adb shell input keyevent 66
sleep 5
t "paso login"
node "$R/run.mjs" 9222 'fac-kayra-dev' "$R/fx-movil.js" >/dev/null
node "$R/run.mjs" 9222 'fac-kayra-dev' -e "(async()=>{const {tap,sleep}=window.__fx;await sleep(300);const b=[...document.querySelectorAll('button')].find(e=>/Continuar con Google/.test(e.innerText));await tap(b);return !!b})()"
t "google"
sleep 10
t "paso instalar"
tap 1020 177 menu
sleep 1.8
tap 504 1991 instalar_menu
sleep 2.2
tap 290 2020 instalar_hoja
sleep 2.2
tap 903 1458 instalar_dialogo
sleep 6
t "paso abrir"
PKG=$(adb shell pm list packages | grep webapk | head -1 | cut -d: -f2 | tr -d '\r')
echo "PKG $PKG" >> "$LOG"
adb shell am start -n "$(adb shell cmd package resolve-activity --brief "$PKG" | tail -1 | tr -d '\r')" >/dev/null
sleep 9
t "fin"
adb shell pkill -INT screenrecord
wait $REC
sleep 1
adb pull /sdcard/pasos.mp4 "$OUT"
cat "$LOG"
