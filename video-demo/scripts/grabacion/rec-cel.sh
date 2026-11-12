#!/usr/bin/env bash
# Graba el recorrido del celular en dos partes (screenrecord tiene límite de 180 s).
# Parte 1: dashboard → catálogo (el recorrido se pausa solo). Parte 2: gastos → configuración.
export MSYS_NO_PATHCONV=1
R="$(cygpath -m "$(cd "$(dirname "$0")" && pwd)")"
OUT="$1"
ev(){ node "$R/run.mjs" 9222 'fac-kayra-dev/app' -e "$1"; }
waitdone(){ for i in $(seq 1 200); do [ "$(ev 'String(!!window.__done)')" = '"true"' ] && return; sleep 1; done; }
part(){ # $1 = archivo en el cel, $2 = expresión para arrancar
  adb shell rm -f /sdcard/$1
  adb shell screenrecord --bit-rate 16000000 --time-limit 178 /sdcard/$1 &
  local P=$!
  sleep 2; ev "$2" >/dev/null; sleep 3; waitdone; sleep 1.5
  adb shell pkill -INT screenrecord; wait $P; sleep 1
}
part p1.mp4 "window.__done=false; window.__tour(); 'go'"
part p2.mp4 "window.__go2(); 'go2'"
adb pull /sdcard/p1.mp4 "$OUT-1.mp4"; adb pull /sdcard/p2.mp4 "$OUT-2.mp4"
ev "JSON.stringify(window.__log)"
