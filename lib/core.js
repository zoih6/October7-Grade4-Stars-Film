/* نواة «نجوم أكتوبر» — دالة خالصة من الزمن: كل شيء يُحسب من t فقط */
'use strict';
window.Core = (function(){
  const TAU = Math.PI*2;

  /* ---------- أدوات رقم ---------- */
  function clamp01(t){ return t<0?0:t>1?1:t; }
  function clamp(t,a,b){ return t<a?a:t>b?b:t; }
  function lerp(a,b,p){ return a+(b-a)*p; }
  function mulberry32(seed){ let a = seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

  /* ---------- التخفيفات ---------- */
  const E = {
    linear: t=>t,
    inCubic: t=>t*t*t,
    outCubic: t=>1-Math.pow(1-t,3),
    inOutCubic: t=> t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2,
    outQuart: t=>1-Math.pow(1-t,4),
    outExpo: t=> t>=1?1:1-Math.pow(2,-10*t),
    outSine: t=>Math.sin(t*Math.PI/2),
    inOutSine: t=>-(Math.cos(Math.PI*t)-1)/2,
    outBack: t=>{ const s=1.9; const u=t-1; return 1+(s+1)*u*u*u+s*u*u; },
    outBackBig: t=>{ const s=2.6; const u=t-1; return 1+(s+1)*u*u*u+s*u*u; },
    outElastic: t=>{ if(t<=0||t>=1) return t; const c=(2*Math.PI)/4.4; return Math.pow(2,-8*t)*Math.sin((t*8-0.75)*c)+1; }
  };
  /* تقدّم مقطع: p في [0,1] بين t0 و t0+dur بعد التخفيف */
  function seg(t, t0, dur, ease){ return (ease||E.linear)(clamp01((t-t0)/dur)); }
  /* نبضة: 0→1→0 */
  function pulse(t, t0, dur, ease){ const p = seg(t,t0,dur,ease||E.inOutSine); return Math.sin(p*Math.PI); }

  /* ---------- مسار حركة (كاميرا) سلسلة مقاطع متسلسلة ---------- */
  function makeTrack(base){
    const segs = [];
    return {
      add(t0, dur, to, ease){ segs.push({t0, dur, to: Object.assign({}, to), ease: ease||E.inOutCubic}); return this; },
      at(t){
        let v = Object.assign({}, base);
        for (const s of segs){
          if (t < s.t0) break;
          if (t >= s.t0 + s.dur){ for (const k of Object.keys(s.to)) v[k] = s.to[k]; continue; }
          const p = s.ease(clamp01((t - s.t0)/s.dur));
          for (const k of Object.keys(s.to)) v[k] = lerp(v[k], s.to[k], p);
          break;
        }
        /* ضمان عدم وجود NaN */
        for (const k of Object.keys(v)) if (typeof v[k] !== 'number' || v[k] !== v[k]) v[k] = base[k] || 0;
        return v;
      }
    };
  }
  /* تطبيق الكاميرا على السياق بعامل اختلاف طبقة par */
  function applyCam(ctx, cam, par){
    ctx.translate(540, 960);
    const z = 1 + (cam.z-1)*par;
    ctx.scale(z, z);
    ctx.translate(-540 - cam.x*par, -960 - cam.y*par);
  }

  /* ---------- رسم مساعد ---------- */
  function cover(ctx, img, x, y, w, h, bias){
    const b = bias||1; const iw=img.width, ih=img.height;
    const s = Math.max(w/iw, h/ih) * b;
    const dw = iw*s, dh = ih*s;
    ctx.drawImage(img, x+(w-dw)/2, y+(h-dh)/2, dw, dh);
  }
  function circle(ctx, x, y, r){ ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function ring(ctx, x, y, r, wdt){ ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = wdt; ctx.stroke(); }
  function star(ctx, x, y, R, rot, inner){
    const ir = R*(inner||0.42); ctx.beginPath();
    for (let i=0;i<5;i++){
      const a1 = (rot||0) + i*(TAU/5) - Math.PI/2, a2 = a1 + TAU/10;
      ctx.lineTo(x+Math.cos(a1)*R, y+Math.sin(a1)*R);
      ctx.lineTo(x+Math.cos(a2)*ir, y+Math.sin(a2)*ir);
    }
    ctx.closePath(); ctx.fill();
  }
  function rr(ctx, x, y, w, h, r){ /* مستطيل مستدير */
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function goldGrad(ctx, x, y, r){ /* تدرج ذهبي إشعاعي قياسي */
    const g = ctx.createRadialGradient(x, y, r*0.05, x, y, r);
    g.addColorStop(0, '#FFF7DC'); g.addColorStop(0.25, '#F9DC8A'); g.addColorStop(0.6, '#F0B93A'); g.addColorStop(1, '#B57608');
    return g;
  }
  function textGrad(ctx, y, h){ /* تدرج نص ذهبي عمودي */
    const g = ctx.createLinearGradient(0, y - h, 0, y + h*0.15);
    g.addColorStop(0, '#FFF9E3'); g.addColorStop(0.45, '#F9DC8A'); g.addColorStop(1, '#E0A51E');
    return g;
  }
  function vignette(ctx, strength){
    const s = (strength===undefined)?0.55:strength;
    const g = ctx.createRadialGradient(540, 960, 480, 540, 960, 1180);
    g.addColorStop(0, 'rgba(3,6,18,0)'); g.addColorStop(1, 'rgba(3,6,18,'+s+')');
    ctx.fillStyle = g; ctx.fillRect(0,0,1080,1920);
  }

  /* ---------- كلمات نابضة (RTL): الكلمة الأولى يمين ---------- */
  function drawWordsSpring(ctx, words, cx, y, t, tIn, opt){
    opt = opt||{};
    const size = opt.size||80, weight = opt.weight||800, gap = opt.gap!==undefined?opt.gap:size*0.32;
    const stagger = opt.stagger||0.12, dur = opt.dur||0.62;
    ctx.font = weight + ' ' + size + 'px Changa';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let widths = words.map(w => ctx.measureText(w).width);
    let total = widths.reduce((a,b)=>a+b,0) + gap*(words.length-1);
    /* ملاءمة تلقائية: لا يتجاوز السطر maxW */
    let fit = 1;
    if (opt.maxW && total > opt.maxW){ fit = opt.maxW / total; widths = widths.map(w => w*fit); total = opt.maxW; }
    const gapF = gap*fit;
    let cursor = cx + total/2;
    for (let i=0;i<words.length;i++){
      const tin = tIn + (opt.rtlStagger===false? i : i)*stagger;
      const p = seg(t, tin, dur, opt.back===false? E.outCubic : (opt.big?E.outBackBig:E.outBack));
      if (p<=0){ cursor -= (widths[i]+gapF); continue; }
      const wx = cursor - widths[i]/2;
      const yoff = (opt.yoff||90)*(1-p);
      const sc = (0.5 + 0.5*p) * fit;
      const rot = (opt.rot||0)*(1-p);
      ctx.save();
      ctx.translate(wx, y + yoff + (opt.bob? Math.sin(t*2.1+i)*opt.bob*p : 0));
      ctx.rotate(rot*Math.PI/180);
      ctx.scale(sc, sc);
      ctx.globalAlpha = (opt.alpha!==undefined?opt.alpha:1) * clamp01(p*1.6);
      if (opt.glow){ ctx.shadowColor = opt.glow; ctx.shadowBlur = 26*p; }
      ctx.fillStyle = opt.fill || textGrad(ctx, y, size);
      ctx.fillText(words[i], 0, 0);
      ctx.restore();
      cursor -= (widths[i]+gapF);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    return total;
  }

  /* ---------- حقول نجوم محددة البذرة ---------- */
  function makeStars(seed, n, x0,x1,y0,y1, rMin, rMax){
    const rnd = mulberry32(seed); const arr = [];
    for (let i=0;i<n;i++) arr.push({ x:lerp(x0,x1,rnd()), y:lerp(y0,y1,rnd()), r:lerp(rMin,rMax,Math.pow(rnd(),2.1)), ph:rnd()*TAU, sp:lerp(0.6,1.8,rnd()), big: rnd()>0.93 });
    return arr;
  }
  function drawStars(ctx, arr, t, alphaMul, tint){
    for (const s of arr){
      const tw = 0.45 + 0.55*Math.sin(t*s.sp + s.ph);
      const a = clamp01(tw) * (alphaMul===undefined?1:alphaMul);
      if (a<=0.01) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = tint || (s.big? '#FFE9B0' : '#FFF7E6');
      circle(ctx, s.x, s.y, s.r);
      if (s.big && a>0.5){ /* شعاع رفيع للنجوم الكبيرة */
        ctx.globalAlpha = a*0.5; ctx.strokeStyle='#FFEFC0'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(s.x-s.r*4,s.y); ctx.lineTo(s.x+s.r*4,s.y);
        ctx.moveTo(s.x,s.y-s.r*4); ctx.lineTo(s.x,s.y+s.r*4); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- انفجار جسيمات محدد البذرة (حدث عند t0) ---------- */
  function makeBurst(seed, x, y, t0, n, opt){
    opt = opt||{};
    const rnd = mulberry32(seed); const P = [];
    const cols = opt.cols || ['#FFF6D8','#F9DC8A','#F0B93A','#FFFFFF'];
    for (let i=0;i<n;i++){
      const a = rnd()*TAU;
      const sp = lerp(opt.spMin!==undefined?opt.spMin:150, opt.spMax!==undefined?opt.spMax:640, Math.pow(rnd(),0.72));
      P.push({ a, sp, s0: t0 + rnd()*0.07, life: lerp(0.9, 2.0, rnd()), size: lerp(1.6, (opt.size||5.2), rnd()), g: opt.g!==undefined?opt.g:240, col: cols[(rnd()*cols.length)|0], star: rnd()>0.86 });
    }
    return function(ctx, t){
      for (const p of P){
        const dt = t - p.s0;
        if (dt<=0 || dt>p.life) continue;
        const k = Math.pow(dt, 0.82) * Math.exp(-0.5*dt*(opt.brake||0.55));
        const px = x + Math.cos(p.a)*p.sp*k;
        const py = y + Math.sin(p.a)*p.sp*k + p.g*dt*dt*0.5;
        const a = Math.pow(1 - dt/p.life, 1.35);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.col;
        if (p.star) star(ctx, px, py, p.size*1.5, p.a, 0.45); else circle(ctx, px, py, Math.max(0.4, p.size*(1-dt/p.life*0.55)));
      }
      ctx.globalAlpha = 1;
    };
  }

  /* ---------- غبار عائم مستمر ---------- */
  function makeDust(seed, n, x0,x1,y0,y1){
    const rnd = mulberry32(seed); const arr = [];
    for (let i=0;i<n;i++) arr.push({ x:lerp(x0,x1,rnd()), y:lerp(y0,y1,rnd()), r:lerp(0.7,2.6,rnd()), ph:rnd()*TAU, vy:lerp(6,22,rnd()), amp:lerp(8,30,rnd()) });
    return function(ctx, t, alpha){
      ctx.fillStyle = '#F9DC8A';
      for (const d of arr){
        const yy = y1 - ((d.y - y0 + t*d.vy) % (y1-y0+80));
        const xx = d.x + Math.sin(t*0.5 + d.ph)*d.amp;
        const a = (0.12 + 0.13*Math.sin(t*0.9+d.ph)) * (alpha===undefined?1:alpha);
        if (a<=0.01) continue;
        ctx.globalAlpha = a; circle(ctx, xx, yy, d.r);
      }
      ctx.globalAlpha = 1;
    };
  }

  /* ---------- شرائح وميض حركة سريعة ---------- */
  function speedStreaks(ctx, t, t0, dur, seed, n, cols){
    const a = Math.sin(Math.PI * clamp01((t-t0)/dur));
    if (a<=0.001) return;
    const rnd = mulberry32(seed);
    ctx.save(); ctx.globalCompositeOperation='screen';
    for (let i=0;i<n;i++){
      const y = 80 + rnd()*1760, w = 120 + rnd()*420, x = rnd()*1080 - 160 + 220*Math.sin(t*7+i);
      const al = a * (0.10 + rnd()*0.16);
      const g = ctx.createLinearGradient(x, 0, x+w, 0);
      g.addColorStop(0,'rgba(249,220,138,0)'); g.addColorStop(0.5,'rgba(249,220,138,'+al+')'); g.addColorStop(1,'rgba(249,220,138,0)');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, 2 + rnd()*3);
    }
    ctx.restore();
  }

  return { TAU, clamp, clamp01, lerp, mulberry32, E, seg, pulse, makeTrack, applyCam,
           cover, circle, ring, star, rr, goldGrad, textGrad, vignette,
           drawWordsSpring, makeStars, drawStars, makeBurst, makeDust, speedStreaks };
})();
