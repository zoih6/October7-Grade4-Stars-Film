#!/bin/bash
# تجميع: bash render/assemble.sh hall 20 draft
# يمزج التعليق + مؤثرات CUES بمزامنة المشهد ويوحّد إلى -14 LUFS
set -e
SC=${1:-hall}; DUR=${2:-20}; TAG=${3:-draft}
cd "$(dirname "$0")/.."
mkdir -p out
python3 render/make_audio.py "$DUR" "render/cues_${SC}.json" "out/audio_${TAG}.m4a"
FRD="render/frames_${SC}"
ffmpeg -y -v error -framerate 24 -i "${FRD}/f%05d.jpg" -i "out/audio_${TAG}.m4a" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  "out/${TAG}_${SC}_${DUR}s.mp4"
echo "ASSEMBLED: out/${TAG}_${SC}_${DUR}s.mp4"
ls -la "out/${TAG}_${SC}_${DUR}s.mp4"
