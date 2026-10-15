#!/bin/bash
# تجميع بنبض 12fps + ضبابية حركة حقيقية (tmix) — الاستخدام: bash render/assemble12.sh SCENE DUR TAG
set -e
SC=${1:-p1}; DUR=${2:-23}; TAG=${3:-part1}
cd "$(dirname "$0")/.."
mkdir -p out
python3 render/make_audio.py "$DUR" "render/cues_${SC}.json" "out/audio_${TAG}.m4a"
FRD="render/frames_${SC}"
ffmpeg -y -v error -framerate 24 -i "${FRD}/f%05d.jpg" \
  -i "out/audio_${TAG}.m4a" \
  -vf "tmix=frames=2:weights='1 1',fps=12,noise=alls=3:allf=t" \
  -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  "out/${TAG}_${SC}.mp4"
echo "ASSEMBLED: out/${TAG}_${SC}.mp4"
ls -la "out/${TAG}_${SC}.mp4"
