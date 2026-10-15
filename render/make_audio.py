#!/usr/bin/env python3
"""يمزج التعليق + مؤثرات صوتية مجدولة ويوحّد الجهارة إلى -14 LUFS.
تشغيل: python3 render/make_audio.py DUR cues.json out.m4a"""
import sys, os, json, subprocess, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUR = float(sys.argv[1])
CUES_PATH = sys.argv[2]
OUT = sys.argv[3]

SFX = {
  #        (ملف,           كم قبل الذروة نبدأ (قص), طول الكليب)
  'boom':   ('boom.mp3',   0.10, 1.50),
  'riser':  ('riser.mp3',  1.45, 2.10),
  'whoosh': ('whoosh.mp3', 0.12, 1.30),
  'chime':  ('chime.mp3',  0.02, 1.40),
  'shimmer':('shimmer.mp3',0.10, 1.90),
  'tick':   ('tick.mp3',   0.05, 0.38),
  'paper':  ('paper.mp3',  0.10, 1.10),
}

def peak_time(path):
    """أول نافذة 0.25 ث يتجاوز فيها الذروة -14dB ⇒ لحظة الضربة."""
    cmd = ['ffmpeg','-hide_banner','-i',path,
           '-af','asetnsamples=12000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-',
           '-f','null','-']
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout
    except Exception:
        return 0.0
    peaks = [float(m) for m in
             __import__('re').findall(r'Peak_level=\s*(-?[0-9.]+)', out)]
    for i, p in enumerate(peaks):
        if p > -14.0:
            return i*0.25
    return 0.0

def main():
    with open(CUES_PATH) as f:
        cues = json.load(f)
    cues = [c for c in cues if c[0] < DUR + 0.5]
    files = []
    for _, name, _ in cues:
        if name not in files and name in SFX:
            files.append(name)
    idx = {n: 1+i for i, n in enumerate(files)}
    peaks = {}
    for n in files:
        p = peak_time(os.path.join(ROOT, 'assets/sfx', SFX[n][0]))
        peaks[n] = p
        print(f'peak[{n}] = {p:.2f}s')

    parts = []
    parts.append(f'[0:a]atrim=0:{DUR},aresample=48000,volume=1.0[vo]')
    mixins = ['[vo]']
    n_c = 0
    for ci, (t, name, gain) in enumerate(cues):
        if name not in idx: continue
        fn, pre, ln = SFX[name]
        start = max(0.0, peaks.get(name, 0.0) - pre)
        length = ln
        i = idx[name]
        ms = int(round(t*1000))
        parts.append(
          f'[{i}:a]atrim={start:.3f}:{start+length:.3f},aresample=48000,'
          f'afade=t=in:st=0:d=0.015,afade=t=out:st={max(0.05,length-0.15):.3f}:d=0.15,'
          f'volume={gain},adelay={ms}|{ms}[c{ci}]')
        mixins.append(f'[c{ci}]'); n_c += 1
    weights = ' '.join(['1']*len(mixins))
    parts.append(''.join(mixins) + f'amix=inputs={len(mixins)}:normalize=0[mix]')
    parts.append(f'[mix]loudnorm=I=-14:TP=-1.5:LRA=11,'
                 f'afade=t=in:st=0:d=0.2,afade=t=out:st={DUR-0.35:.2f}:d=0.35,'
                 f'aformat=sample_rates=48000:channel_layouts=stereo[aout]')
    graph = ';'.join(parts)
    gpath = os.path.join(ROOT, 'out', 'graph.txt')
    with open(gpath, 'w') as f:
        f.write(graph)
    cmd = ['ffmpeg','-y','-v','error','-i', os.path.join(ROOT,'assets/audio/vo.mp3')]
    for n in files:
        cmd += ['-i', os.path.join(ROOT,'assets/sfx', SFX[n][0])]
    cmd += ['-filter_complex_script', gpath, '-map','[aout]',
            '-c:a','aac','-b:a','192k','-ar','48000', OUT]
    subprocess.run(cmd, check=True)
    print(f'AUDIO-OK {OUT} cues_mixed={n_c} (تعليق + {len(files)} مؤثرات)')

if __name__ == '__main__':
    main()
