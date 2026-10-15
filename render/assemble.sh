#!/bin/bash
# تجميع: bash render/assemble.sh opening 20 draft
set -e
SC=${1:-opening}; DUR=${2:-20}; TAG=${3:-draft}
cd "$(dirname "$0")/.."
mkdir -p out
# الصوت: أول DUR ثانية من التعليق، موحّد إلى -14 LUFS
FADE_ST=$(awk -v d="$DUR" 'BEGIN{printf "%.2f", d-0.45}')
ffmpeg -y -v error -i assets/audio/vo.mp3 -t "$DUR" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.25,afade=t=out:st=${FADE_ST}:d=0.45" \
  -c:a aac -b:a 160k "out/audio_${TAG}.m4a"
ffmpeg -y -v error -framerate 12 -i "render/frames_${SC}/f%05d.jpg" -i "out/audio_${TAG}.m4a" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 160k -shortest -movflags +faststart \
  "out/${TAG}_${SC}_${DUR}s.mp4"
echo "ASSEMBLED: out/${TAG}_${SC}_${DUR}s.mp4"
ls -la "out/${TAG}_${SC}_${DUR}s.mp4"
