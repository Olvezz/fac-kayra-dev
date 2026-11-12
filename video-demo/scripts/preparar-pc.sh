#!/usr/bin/env bash
# Prepara los clips de la PC para la composición horizontal (video-demo/pc/assets).
# Entrada: video-demo/raw/pc/*.mp4 (capturas de pantalla 2560x1440 con ffmpeg ddagrab).
set -e
cd "$(dirname "$0")/.."
R=raw/pc; A=pc/assets/video; mkdir -p "$A"
SC="scale=1920:1080:flags=lanczos,fps=30"
ENC="-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -an -movflags +faststart"
TMP=raw/tmpcut; rm -rf $TMP; mkdir -p $TMP
seg() { ffmpeg -y -loglevel error -ss $2 -to $3 -i $R/$1 -vf "setpts=(PTS-STARTPTS)/$5,$SC" $ENC $TMP/$4.mp4; echo "file '$4.mp4'" >> $TMP/$6.txt; }

# Acceso: cerrar sesión -> login con Google
seg pc-login.mp4 1.0 8.5 a1 1 login
seg pc-login.mp4 12.0 20.5 a2 1 login
ffmpeg -y -loglevel error -f concat -safe 0 -i $TMP/login.txt -c copy $A/pc-login.mp4

# Instalar la app en el escritorio (Brave)
seg pc-instalar.mp4 1.5 13.0 b1 1 inst
seg pc-instalar2.mp4 0.8 6.5 b2 1 inst
seg pc-instalar3.mp4 0.8 3.0 b3 1 inst
seg pc-instalar3.mp4 7.0 10.0 b4 1 inst
ffmpeg -y -loglevel error -f concat -safe 0 -i $TMP/inst.txt -c copy $A/pc-instalar.mp4

# Recorrido por todos los apartados (1.6x) y flujo de trabajo en la beta (1.5x)
ffmpeg -y -loglevel error -ss 2.93 -to 146 -i $R/pc-grabacion.mp4 -vf "setpts=PTS/1.6,$SC" $ENC $A/pc-recorrido.mp4
ffmpeg -y -loglevel error -ss 3.0 -to 120 -i $R/pc-beta.mp4 -vf "setpts=PTS/1.5,$SC" $ENC $A/pc-flujo.mp4
rm -rf "$TMP"
for f in $A/*.mp4; do echo "$f $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
