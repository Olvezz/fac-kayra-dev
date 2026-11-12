#!/usr/bin/env bash
# Uso: rec-pc.sh <regexUrl> <exprInicio> <salida.mp4> <segundos>
# Graba la ventana maximizada (2560x1392) y, 2 s después de empezar a grabar, lanza el recorrido.
R="$(cygpath -m "$(cd "$(dirname "$0")" && pwd)")"
RE="$1"; GO="$2"; OUT="$3"; SECS="$4"
ffmpeg -hide_banner -loglevel error -f lavfi -i "ddagrab=output_idx=0:framerate=30:draw_mouse=0:video_size=2560x1392:offset_x=0:offset_y=0" \
  -t "$SECS" -vf "hwdownload,format=bgra" -c:v libx264 -preset ultrafast -crf 17 -pix_fmt yuv420p "$OUT" -y &
FF=$!
sleep 2
node "$R/run.mjs" 9333 "$RE" -e "$GO"
wait $FF
node "$R/run.mjs" 9333 "$RE" -e "JSON.stringify({d:!!window.__done,log:window.__log})"
