#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# معالجة بورتريهات الطلاب: قصّ الخلفية + Rim Light ذهبي + تحسين سينمائي خفيف
import os, sys
os.environ.setdefault("U2NET_HOME", "/var/tmp/work-safe/u2net")
sys.path.insert(0, "/var/tmp/work-safe/pylibs")
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
from rembg import remove, new_session
SESSION = new_session('u2net')

SRC = "/var/tmp/work-safe/film/assets/photos"
OUT = "/var/tmp/work-safe/film/assets/plates"
os.makedirs(OUT, exist_ok=True)

MAP = {
  "mutaz":    "01_Moataz_Ahmed_Hamoud_Qayed_1st_Place.webp",
  "moyed":    "02_Moayed_Jameel_Mohammed_Ahmed_1st_Place_Tied.webp",
  "saad":     "03_Saad_Muadh_Ahmed_Qasim_2nd_Place.webp",
  "anhar":    "04_Anhar_Amin_Mohammed_Ahmed_2nd_Place_Tied.webp",
  "shomookh": "05_Shomookh_Mohammed_Abdulsalam_5th_Place.webp",
  "anas":     "06_Anas_Abduh_Saeed_Noman_4th_Place.webp",
  "shouq":    "07_Shouq_Hashem_Saeed_Hazza_3rd_Place.webp",
  "samar":    "08_Samar_Mohammed_Abdullah_Farhan_6th_Place.webp",
  "waleed":   "09_Waleed_Sadeq_Hamoud_Farhan_6th_Place_Tied.webp",
  "rashed":   "10_Rashed_Majed_Qasim_Morshed_7th_Place.webp",
  "asaad_f":  "11_Asaad_Fouad_Taher_Yahya_9th_Place.webp",
  "asaad_a":  "12_Asaad_Alaa_Noman_Qaid_8th_Place.webp",
  "taher":    "12_Taher_Bilal_Taher_Mohammed_10th_Place.webp",
}

def directional_rim(alpha, dx=-8, dy=-11, blur=6):
    a = alpha.astype(np.float32)/255.0
    sa = np.roll(np.roll(a, dy, axis=0), dx, axis=1)
    rim = np.clip(a - sa, 0, 1)
    rim = np.array(Image.fromarray((rim*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)/255.0
    return np.clip(rim * a, 0, 1)

def process(key, fname):
    img = Image.open(os.path.join(SRC, fname)).convert("RGB")
    cut = remove(img, session=SESSION)
    a = np.array(cut.split()[-1])
    ys, xs = np.where(a > 8)
    if len(ys)==0: print(key, "EMPTY", flush=True); return
    y0,y1,x0,x1 = ys.min(),ys.max(),xs.min(),xs.max()
    pad=26
    cut = cut.crop((max(0,x0-pad),max(0,y0-pad),min(a.shape[1],x1+pad),min(a.shape[0],y1+pad)))
    al = cut.split()[-1].filter(ImageFilter.GaussianBlur(1.1))
    cut.putalpha(al)
    rgb = cut.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(1.06)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.05)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.03)
    cut = Image.merge("RGBA", (*rgb.split(), al))
    arr = np.array(cut).astype(np.float32)
    rim = directional_rim(arr[:,:,3])
    gold = np.array([255,225,160], dtype=np.float32)
    for c in range(3):
        arr[:,:,c] = np.clip(arr[:,:,c] + gold[c]*rim*0.9, 0, 255)
    glow = np.array(Image.fromarray((rim*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))).astype(np.float32)/255.0
    for c in range(3):
        arr[:,:,c] = np.clip(arr[:,:,c] + gold[c]*glow*0.35, 0, 255)
    out = Image.fromarray(arr.astype(np.uint8), "RGBA")
    w,h = out.size; nw=620; nh=int(h*nw/w)
    out.resize((nw,nh), Image.LANCZOS).save(os.path.join(OUT, key+".png"))
    print(key, "OK", (nw,nh), flush=True)

for k,f in MAP.items():
    process(k,f)
print("ALL-DONE", flush=True)
