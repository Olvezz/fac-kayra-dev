#!/usr/bin/env bash
# Prepara todos los clips de los videos a partir de las grabaciones de video-demo/raw (hechas desde la app instalada).
#   raw/pc/app-recorrido.mp4  recorrido en la app de la PC (2560x1392)
#   raw/pc/app-beta.mp4       caso práctico en la app beta de la PC
#   raw/pc/pasos-pc.mp4       paso a paso desde cero en Brave
#   raw/movil/app-recorrido.mp4, pasos-cel.mp4, pasos-abrir.mp4  (1080x2400)
set -e
cd "$(dirname "$0")/.."
PCV="-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -an -movflags +faststart"
CEL="-c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -an -movflags +faststart"
SPC="scale=1920:1044:flags=lanczos,fps=30"
SCE="scale=720:1600:flags=lanczos,fps=30"
mkdir -p pc/assets/video movil/assets/video pasos/assets/video guia/assets/video
TMP=raw/tmpcut; rm -rf $TMP; mkdir -p $TMP

# ---- Demo PC: recorrido (1.35x) y caso práctico en la beta (1.3x)
ffmpeg -y -loglevel error -ss 2.5 -to 165 -i raw/pc/app-recorrido2.mp4 -vf "setpts=PTS/1.35,$SPC" $PCV pc/assets/video/pc-recorrido.mp4
ffmpeg -y -loglevel error -ss 3.0 -to 126 -i raw/pc/app-beta2.mp4 -vf "setpts=PTS/1.3,$SPC" $PCV pc/assets/video/pc-flujo.mp4

# ---- Demo celular: recorrido en dos tomas (screenrecord corta a los 180 s), unidas y a 1.35x
ffmpeg -y -loglevel error -i raw/movil/app-recorrido2-1.mp4 -i raw/movil/app-recorrido2-2.mp4 -filter_complex "[0:v]trim=start=1.5:end=109.5,setpts=PTS-STARTPTS,fps=30[a];[1:v]trim=start=1.0:end=85.5,setpts=PTS-STARTPTS,fps=30[b];[a][b]concat=n=2:v=1[c];[c]setpts=PTS/1.35,fps=30,scale=720:1600:flags=lanczos,setpts=PTS-STARTPTS[o]" -map "[o]" $CEL movil/assets/video/movil-recorrido.mp4
cp movil/assets/video/movil-recorrido.mp4 pc/assets/video/pc-flujo.mp4 guia/assets/video/

# ---- Paso a paso PC (velocidad real). Las otras cuentas de Google se desenfocan.
BLUR="split[a][b];[b]crop=480:310:1690:1070,boxblur=18:3[bl];[a][bl]overlay=1690:1070:enable='between(t,47,54)+between(t,93,97.5)',$SPC"
seg() { ffmpeg -y -loglevel error -ss $2 -to $3 -i $1 -vf "$4" $5 $TMP/$6.mp4; echo "file '$6.mp4'" >> $TMP/$7.txt; }
ffmpeg -y -loglevel error -ss 25.5 -to 36 -i raw/pc/pasos-pc.mp4 -vf "$SPC" $PCV pasos/assets/video/pc-1-entrar.mp4
# login: para que el desenfoque use el tiempo original, se recorta después de filtrar
ffmpeg -y -loglevel error -i raw/pc/pasos-pc.mp4 -vf "$BLUR" -ss 44.5 -to 53 $PCV $TMP/l1.mp4
ffmpeg -y -loglevel error -i raw/pc/pasos-pc.mp4 -vf "$BLUR" -ss 94 -to 104 $PCV $TMP/l2.mp4
printf "file 'l1.mp4'\nfile 'l2.mp4'\n" > $TMP/login.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $TMP/login.txt -c copy pasos/assets/video/pc-2-login.mp4
seg raw/pc/pasos-pc.mp4 113 119.5 "$SPC" "$PCV" i1 inst
seg raw/pc/pasos-pc.mp4 125.5 131 "$SPC" "$PCV" i2 inst
seg raw/pc/pasos-pc.mp4 137 144 "$SPC" "$PCV" i3 inst
ffmpeg -y -loglevel error -f concat -safe 0 -i $TMP/inst.txt -c copy pasos/assets/video/pc-3-instalar.mp4
ffmpeg -y -loglevel error -ss 151.5 -to 162 -i raw/pc/pasos-pc.mp4 -vf "$SPC" $PCV pasos/assets/video/pc-4-abrir.mp4

# ---- Paso a paso celular (velocidad real)
ffmpeg -y -loglevel error -ss 1.8 -to 13.5 -i raw/movil/pasos-cel.mp4 -vf "$SCE" $CEL pasos/assets/video/cel-1-entrar.mp4
ffmpeg -y -loglevel error -ss 13.5 -to 27.6 -i raw/movil/pasos-cel.mp4 -vf "$SCE" $CEL pasos/assets/video/cel-2-login.mp4
ffmpeg -y -loglevel error -ss 27.6 -to 41 -i raw/movil/pasos-cel.mp4 -vf "$SCE" $CEL pasos/assets/video/cel-3-instalar.mp4
ffmpeg -y -loglevel error -ss 1.5 -to 13 -i raw/movil/pasos-abrir.mp4 -vf "$SCE" $CEL pasos/assets/video/cel-4-abrir.mp4

rm -rf $TMP
for f in pc/assets/video/*.mp4 movil/assets/video/*.mp4 pasos/assets/video/*.mp4; do echo "$f $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
