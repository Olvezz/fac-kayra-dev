#!/usr/bin/env bash
# Prepara los clips del celular para la composición vertical (video-demo/movil/assets).
# Entrada: video-demo/raw/movil/*.mp4 (grabaciones con adb screenrecord, 1080x2400).
set -e
cd "$(dirname "$0")/.."
R=raw/movil; A=movil/assets/video; mkdir -p "$A"
SC="scale=720:1600:flags=lanczos,fps=30"
ENC="-c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -an -movflags +faststart"

# Recorrido completo, acelerado 1.6x (empieza en 1.58 s, termina en 145 s)
ffmpeg -y -loglevel error -i $R/movil-grabacion.mp4 -vf "trim=start=1.58:end=145,setpts=(PTS-STARTPTS)/1.6,$SC" $ENC $A/movil-recorrido.mp4

# Acceso: cerrar sesión, login con Google, instalar y abrir la app

TMP=raw/tmpcut; rm -rf $TMP; mkdir -p $TMP; seg() { ffmpeg -y -loglevel error -i $R/$1 -vf "trim=start=$2:end=$3,setpts=PTS-STARTPTS,$SC" $ENC $TMP/s$4.mp4; echo "file 's$4.mp4'" >> $TMP/lista.txt; }
seg movil-login.mp4 2.0 9.0 1
seg movil-login.mp4 21.5 31.0 2
seg movil-login.mp4 45.3 48.5 3
seg movil-login.mp4 57.6 61.5 4
seg movil-login.mp4 71.8 77.0 5
seg movil-abrir.mp4 2.4 5.0 6
seg movil-abrir.mp4 17.4 19.5 7
seg movil-abrir.mp4 32.6 40.0 8
ffmpeg -y -loglevel error -f concat -safe 0 -i $TMP/lista.txt -c copy $A/movil-acceso.mp4; rm -rf $TMP
rm -rf "$TMP"
for f in $A/*.mp4; do echo "$f $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
