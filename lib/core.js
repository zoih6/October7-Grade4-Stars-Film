/* نواة «نجوم أكتوبر» v2 — كل شيء دالة خالصة من الزمن t */
'use strict';
window.Core = (function(){
  const TAU = Math.PI*2;

  /* ---------- أدوات رقم ---------- */
  function clamp01(t){ return t<0?0:t>1?1:t; }
  function clamp(t,a,b){ return t<a?a:t>b?b:t; }
  function lerp(a,b,p){ return a+(b-a)*p; }
  function mulberry32(seed){ let a = seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

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
    outBackBig: t=>{ const s=2.7; const u=t-1; return 1+(s+1)*u*u*u+s*u*u; },
    outElastic: t=>{ if(t<=0||t>=1) return t; const c=(2*Math.PI)/4.4; return Math.pow(2,-8*t)*Math.sin((t*8-0.75)*c)+1; }
  };
  function seg(t, t0, dur, ease){ return (ease||E.linear)(clamp01((t-t0)/dur)); }
  function pulse(t, t0, dur, ease){ const p = seg(t,t0,dur,ease||E.inOutSine); return Math.sin(p*Math.PI); }

  /* ---------- مسار حركة (كاميرا بديل بنك r) ---------- */
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
        for (const k of Object.keys(v)) if (typeof v[k] !== 'number' || v[k] !== v[k]) v[k] = (typeof base[k]==='number'?base[k]:0);
        return v;
      }
    };
  }
  function applyCam(ctx, cam, par){
    ctx.translate(540, 960);
    const z = 1 + (cam.z-1)*par;
    ctx.scale(z, z);
    if (cam.r) ctx.rotate(cam.r*Math.PI/180*par);
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
  function starPath(ctx, R, inner){ const ir = R*(inner||0.42); ctx.beginPath();
    for (let i=0;i<5;i++){ const a1 = i*(TAU/5) - Math.PI/2, a2 = a1 + TAU/10;
      ctx.lineTo(Math.cos(a1)*R, Math.sin(a1)*R); ctx.lineTo(Math.cos(a2)*ir, Math.sin(a2)*ir); }
    ctx.closePath(); }
  function star(ctx, x, y, R, rot, inner){ ctx.save(); ctx.translate(x,y); ctx.rotate(rot||0); starPath(ctx,R,inner); ctx.fill(); ctx.restore(); }
  function starOutline(ctx, x, y, R, rot, wdt){ ctx.save(); ctx.translate(x,y); ctx.rotate(rot||0); starPath(ctx, R, 0.42); ctx.lineWidth=wdt||2; ctx.stroke(); ctx.restore(); }
  function rr(ctx, x, y, w, h, r){ ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function goldGrad(ctx, x, y, r){
    const g = ctx.createRadialGradient(x, y, r*0.05, x, y, r);
    g.addColorStop(0, '#FFF7DC'); g.addColorStop(0.25, '#F9DC8A'); g.addColorStop(0.6, '#F0B93A'); g.addColorStop(1, '#B57608');
    return g;
  }
  function textGrad(ctx, y, h){
    const g = ctx.createLinearGradient(0, y - h, 0, y + h*0.15);
    g.addColorStop(0, '#FFF9E3'); g.addColorStop(0.45, '#F9DC8A'); g.addColorStop(1, '#E0A51E');
    return g;
  }
  function vignette(ctx, strength){
    const s = (strength===undefined)?0.5:strength;
    const g = ctx.createRadialGradient(540, 960, 480, 540, 960, 1180);
    g.addColorStop(0, 'rgba(3,6,18,0)'); g.addColorStop(1, 'rgba(3,6,18,'+s+')');
    ctx.fillStyle = g; ctx.fillRect(0,0,1080,1920);
  }

  /* ---------- قياس سطر كلمات مع maxW ---------- */
  function measureWords(ctx, words, gap){
    const widths = words.map(w => ctx.measureText(w).width);
    const total = widths.reduce((a,b)=>a+b,0) + gap*(words.length-1);
    return { widths, total };
  }

  /* ---------- كلمات نابضة (خلفية v1، محتفظ بها) ---------- */
  function drawWordsSpring(ctx, words, cx, y, t, tIn, opt){
    opt = opt||{};
    const size = opt.size||80, weight = opt.weight||800, family = opt.family||'Changa';
    const gap = opt.gap!==undefined?opt.gap:size*0.32;
    const stagger = opt.stagger||0.12, dur = opt.dur||0.62;
    ctx.font = weight + ' ' + size + 'px ' + family;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let m = measureWords(ctx, words, gap);
    let fit = 1;
    if (opt.maxW && m.total > opt.maxW){ fit = opt.maxW / m.total; }
    const gapF = gap*fit;
    let cursor = cx + m.total*fit/2;
    for (let i=0;i<words.length;i++){
      const tin = tIn + i*stagger;
      const p = seg(t, tin, dur, opt.back===false? E.outCubic : (opt.big?E.outBackBig:E.outBack));
      const w = m.widths[i]*fit;
      if (p<=0){ cursor -= (w+gapF); continue; }
      const wx = cursor - w/2;
      const yoff = (opt.yoff||90)*(1-p);
      const sc = (0.5 + 0.5*p) * fit;
      const rot = (opt.rot||0)*(1-p);
      const ww = words[i];
      ctx.save();
      ctx.translate(wx, y + yoff + (opt.bob? Math.sin(t*2.1+i)*opt.bob*p : 0));
      ctx.rotate(rot*Math.PI/180);
      ctx.scale(sc, sc);
      ctx.globalAlpha = (opt.alpha!==undefined?opt.alpha:1) * clamp01(p*1.6);
      if (opt.glow){ ctx.shadowColor = opt.glow; ctx.shadowBlur = 26*p; }
      ctx.fillStyle = opt.fill || textGrad(ctx, y, size);
      ctx.fillText(ww, 0, 0);
      ctx.restore();
      cursor -= (w+gapF);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  /* ---------- كلمات بدخول اتجاهي + أصداء حركية ---------- */
  const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
  function drawWordsEcho(ctx, words, cx, y, t, tIn, opt){
    opt = opt||{};
    const size = opt.size||80, weight = opt.weight||800, family = opt.family||'Changa';
    const gap = opt.gap!==undefined?opt.gap:size*0.3;
    const stagger = opt.stagger||0.13, dur = opt.dur||0.55;
    const dist = opt.dist||130;
    ctx.font = weight + ' ' + size + 'px ' + family;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const m = measureWords(ctx, words, gap);
    let fit = 1;
    if (opt.maxW && m.total > opt.maxW){ fit = opt.maxW/m.total; }
    const gapF = gap*fit;
    let cursor = cx + m.total*fit/2;
    for (let i=0;i<words.length;i++){
      const tin = tIn + i*stagger;
      const p = seg(t, tin, dur, opt.back===false? E.outCubic : (opt.big?E.outBackBig:E.outBack));
      const w = m.widths[i]*fit;
      if (p<=0){ cursor -= (w+gapF); continue; }
      const wx = cursor - w/2;
      let dv = DIRS[opt.dir||'down'];
      if (opt.dir==='alt') dv = DIRS[i%2===0? 'right':'left'];
      const q = 1-p;
      /* الأصداء خلف الكلمة أثناء الحركة */
      if (q>0.02){
        for (const g of [2.1, 3.4]){
          ctx.save();
          ctx.translate(wx + dv[0]*dist*q*g, y + dv[1]*dist*q*g*0.55);
          const scg = (0.5+0.5*p)*fit;
          ctx.scale(scg,scg);
          ctx.globalAlpha = 0.16*(g<3? 1 : 0.55) * q * (opt.alpha!==undefined?opt.alpha:1);
          if (opt.glow){ ctx.shadowColor=opt.glow; ctx.shadowBlur=18; }
          ctx.fillStyle = opt.fill || textGrad(ctx, y, size);
          ctx.fillText(words[i], 0, 0);
          ctx.restore();
        }
      }
      const wy = y + (opt.bob? Math.sin(t*2.1+i*1.3)*opt.bob*p : 0);
      ctx.save();
      ctx.translate(wx + dv[0]*dist*q, wy + dv[1]*dist*q*0.55);
      ctx.rotate(((opt.rot||0)*q)*Math.PI/180);
      const sc = (0.5 + 0.5*p)*fit;
      ctx.scale(sc, sc);
      ctx.globalAlpha = clamp01(p*1.5)*(opt.alpha!==undefined?opt.alpha:1);
      if (opt.glow){ ctx.shadowColor=opt.glow; ctx.shadowBlur=24*p; }
      ctx.fillStyle = opt.fill || textGrad(ctx, y, size);
      ctx.fillText(words[i], 0, 0);
      ctx.restore();
      cursor -= (w+gapF);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  /* ---------- سطر كوفي متباعد الكلمات ---------- */
  function kufiLine(ctx, text, cx, y, t, tIn, opt){
    opt = opt||{};
    const size = opt.size||36, weight = opt.weight||600;
    const track = opt.tracking!==undefined? opt.tracking : size*0.55;
    const words = text.split(' ');
    ctx.font = weight + ' ' + size + 'px Kufi';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const m = measureWords(ctx, words, track);
    let fit = 1;
    if (opt.maxW && m.total > opt.maxW) fit = opt.maxW/m.total;
    const p = seg(t, tIn, opt.dur||0.6, opt.back===false?E.outCubic:E.outBack);
    if (p<=0) return;
    const a = clamp01(p*1.5)*(opt.alpha!==undefined?opt.alpha:1);
    if (a<=0.01) return;
    let cursor = cx + m.total*fit/2;
    ctx.save(); ctx.globalAlpha = a;
    if (opt.glow){ ctx.shadowColor=opt.glow; ctx.shadowBlur=14*p; }
    ctx.fillStyle = opt.fill || '#FFF6E0';
    for (let i=0;i<words.length;i++){
      const w = m.widths[i]*fit;
      const wx = cursor - w/2;
      ctx.globalAlpha = a * clamp01((p - i*0.08)/0.6);
      ctx.fillText(words[i], wx, y + (1-p)*40 + (opt.bob?Math.sin(t*2+i)*opt.bob:0));
      cursor -= (w + track*fit);
    }
    ctx.restore();
  }

  /* ---------- الشريط الذهبي (مسار كاتمول) ---------- */
  function catmull(pts, div){
    const out = [];
    for (let i=0;i<pts.length-1;i++){
      const p0 = pts[Math.max(0,i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1,i+2)];
      for (let j=0;j<div;j++){
        const u = j/div, u2=u*u, u3=u2*u;
        out.push([
          0.5*((2*p1[0]) + (-p0[0]+p2[0])*u + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
          0.5*((2*p1[1]) + (-p0[1]+p2[1])*u + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)
        ]);
      }
    }
    out.push(pts[pts.length-1].slice());
    return out;
  }
  function makeRibbon(controlPts){
    const pts = catmull(controlPts, 22);
    return { pts, n: pts.length };
  }
  /* يرسم الشريط: رأس يتقدم u=seg(t,t0,dur) وذيل متدرج خلفه */
  function drawRibbon(ctx, R, t, t0, dur, opt){
    opt = opt||{};
    const u = seg(t, t0, dur, opt.ease||E.inOutCubic);
    if (u<=0) return null;
    const head = Math.floor(u*(R.n-1));
    const trail = Math.floor((opt.trail||0.30)*(R.n-1));
    const start = Math.max(0, head - trail);
    ctx.save();
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.shadowColor = opt.glowColor || 'rgba(240,185,58,0.9)';
    ctx.shadowBlur = opt.glow||16;
    const fadeIn = opt.persist && t>t0+dur ? 1 : 1;
    for (let i=start;i<head;i++){
      const k = (i-start+1)/(head-start+1);
      ctx.strokeStyle = `rgba(249,220,138,${(0.15+0.85*k)*(opt.alpha!==undefined?opt.alpha:1)})`;
      ctx.lineWidth = (opt.w||7) * (0.25 + 0.75*k);
      ctx.beginPath(); ctx.moveTo(R.pts[i][0], R.pts[i][1]); ctx.lineTo(R.pts[i+1][0], R.pts[i+1][1]); ctx.stroke();
    }
    ctx.restore();
    const hp = R.pts[head];
    /* توهج رأس */
    ctx.save();
    const hg = ctx.createRadialGradient(hp[0],hp[1],1, hp[0],hp[1], 46);
    hg.addColorStop(0,'rgba(255,250,230,0.95)'); hg.addColorStop(0.35,'rgba(249,220,138,0.55)'); hg.addColorStop(1,'rgba(249,220,138,0)');
    ctx.fillStyle = hg; circle(ctx, hp[0], hp[1], 46);
    ctx.restore();
    if (opt.headRef){ opt.headRef.x = hp[0]; opt.headRef.y = hp[1]; }
    return hp;
  }

  /* ---------- إطار مذهّب مرسوم الأضلاع ---------- */
  function foilFrame(ctx, x, y, w, h, t, tIn, opt){
    opt = opt||{};
    const r = opt.r||26;
    const per = [ [x+w-r, y, x+w, y, 'T'], [x+w, y+r, x+w, y+h, 'R'], [x+r, y+h, x, y+h, 'B'], [x, y+h-r, x, y, 'L'] ];
    /* زجاج خلفي */
    const glassA = seg(t, tIn, 0.5);
    if (glassA>0){
      ctx.save(); ctx.globalAlpha = 0.34*glassA;
      const g = ctx.createLinearGradient(x,y,x,y+h);
      g.addColorStop(0,'rgba(13,27,69,0.6)'); g.addColorStop(1,'rgba(6,11,31,0.5)');
      C_fillRounded(ctx,x,y,w,h,r,g);
      ctx.restore();
    }
    /* أضلاع بترتيب */
    ctx.save();
    ctx.lineCap='round';
    ctx.shadowColor='rgba(240,185,58,0.75)'; ctx.shadowBlur=10;
    for (let s=0;s<4;s++){
      const p = seg(t, tIn + s*0.09, 0.34, E.outCubic);
      if (p<=0) continue;
      const [x1,y1,x2,y2] = [per[s][0]-0, per[s][1]-0, per[s][2]-0, per[s][3]-0];
      const yy1 = s===0? y : y1, yy2 = s===0? y : y2;
      const xx1 = s===0? x+r : x1, xx2 = s===0? x1 : x2;
      if (s===0){ lineGradH(ctx, x+r, y, x+r+(w-2*r)*p, y, opt.w||3); }
      else if (s===1){ lineGradV(ctx, x+w, y+r, x+w, y+r+(h-2*r)*p, opt.w||3); }
      else if (s===2){ lineGradH(ctx, x+w-r, y+h, x+w-r-(w-2*r)*p, y+h, opt.w||3, true); }
      else { lineGradV(ctx, x, y+h-r, x, y+h-r-(h-2*r)*p, opt.w||3, true); }
      /* زوايا */
      if (p>=1){
        const cp = seg(t, tIn+s*0.09+0.34, 0.3, E.outBackBig);
        if (cp>0){ const cc = cornerPos(s, x,y,w,h,r);
          ctx.fillStyle='rgba(249,220,138,0.95)';
          ctx.globalAlpha=cp;
          star(ctx, cc[0], cc[1], 8*cp, t*0.5, 0.45);
          ctx.globalAlpha=1;
        }
      }
    }
    /* أقواس الزوايا */
    const ap = seg(t, tIn+0.3, 0.5);
    if (ap>0){ ctx.globalAlpha=ap; drawCornerArcs(ctx,x,y,w,h,r,opt.w||3); ctx.globalAlpha=1; }
    /* إطار داخلي رفيع */
    const ip = seg(t, tIn+0.45, 0.5);
    if (ip>0){ ctx.globalAlpha=0.5*ip; ctx.strokeStyle='rgba(249,220,138,0.85)'; ctx.lineWidth=1.2; rr(ctx, x+11, y+11, w-22, h-22, r-8); ctx.stroke(); ctx.globalAlpha=1; }
    ctx.restore();
    /* لمعة عابرة */
    if (t>tIn+1 && opt.sheen!==false){
      const sh = ((t - tIn - 1) % 2.6)/2.6;
      if (sh<0.55){
        const sx = x - 200 + (w+400)*(sh/0.55);
        ctx.save(); rr(ctx,x,y,w,h,r); ctx.clip();
        const g = ctx.createLinearGradient(sx-90,0,sx+90,0);
        g.addColorStop(0,'rgba(255,246,220,0)'); g.addColorStop(0.5,'rgba(255,246,220,0.10)'); g.addColorStop(1,'rgba(255,246,220,0)');
        ctx.fillStyle=g; ctx.fillRect(sx-90,y,180,h); ctx.restore();
      }
    }
  }
  function C_fillRounded(ctx,x,y,w,h,r,fill){ rr(ctx,x,y,w,h,r); ctx.fillStyle=fill; ctx.fill(); }
  function lineGradH(ctx, x1,y1,x2,y2,w,rev){ const g=ctx.createLinearGradient(x1,0,x2,0);
    g.addColorStop(rev?1:0,'rgba(249,220,138,0.15)'); g.addColorStop(rev?0:1,'rgba(240,185,58,1)');
    ctx.strokeStyle=g; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
  function lineGradV(ctx, x1,y1,x2,y2,w,rev){ const g=ctx.createLinearGradient(0,y1,0,y2);
    g.addColorStop(rev?1:0,'rgba(249,220,138,0.15)'); g.addColorStop(rev?0:1,'rgba(240,185,58,1)');
    ctx.strokeStyle=g; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
  function cornerPos(s,x,y,w,h,r){ return [[x+r,y+r],[x+w-r,y+r],[x+w-r,y+h-r],[x+r,y+h-r]][s]; }
  function drawCornerArcs(ctx,x,y,w,h,r,wdt){ ctx.strokeStyle='rgba(240,185,58,1)'; ctx.lineWidth=wdt;
    ctx.beginPath(); ctx.arc(x+r,y+r,r,Math.PI,Math.PI*1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+w-r,y+r,r,Math.PI*1.5,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+w-r,y+h-r,r,0,Math.PI*0.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+r,y+h-r,r,Math.PI*0.5,Math.PI); ctx.stroke(); }

  /* ---------- حقول نجوم وغبار وانفجارات ---------- */
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
      if (s.big && a>0.5){ ctx.globalAlpha = a*0.5; ctx.strokeStyle='#FFEFC0'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(s.x-s.r*4,s.y); ctx.lineTo(s.x+s.r*4,s.y);
        ctx.moveTo(s.x,s.y-s.r*4); ctx.lineTo(s.x,s.y+s.r*4); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  function makeBurst(seed, x, y, t0, n, opt){
    opt = opt||{};
    const rnd = mulberry32(seed); const P = [];
    const cols = opt.cols || ['#FFF6D8','#F9DC8A','#F0B93A','#FFFFFF'];
    for (let i=0;i<n;i++){
      const a = rnd()*TAU;
      const sp = lerp(opt.spMin!==undefined?opt.spMin:150, opt.spMax!==undefined?opt.spMax:640, Math.pow(rnd(),0.72));
      P.push({ a, sp, s0: t0 + rnd()*0.07, life: lerp(0.9, 2.0, rnd()), size: lerp(1.6, (opt.size||5.2), rnd()), g: opt.g!==undefined?opt.g:240, col: cols[(rnd()*cols.length)|0], starF: rnd()>0.86 });
    }
    const inward = opt.mode==='in';
    return function(ctx, t){
      for (const p of P){
        const dt = t - p.s0;
        if (dt<=0 || dt>p.life) continue;
        let px, py, a;
        if (inward){
          const k = 1 - E.inCubic(clamp01(dt/p.life));
          px = x + Math.cos(p.a)*p.sp*k;
          py = y + Math.sin(p.a)*p.sp*k;
          a = Math.sin(Math.PI*clamp01(dt/p.life));
        } else {
          const k = Math.pow(dt, 0.82) * Math.exp(-0.5*dt*(opt.brake||0.55));
          px = x + Math.cos(p.a)*p.sp*k;
          py = y + Math.sin(p.a)*p.sp*k + p.g*dt*dt*0.5;
          a = Math.pow(1 - dt/p.life, 1.35);
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = p.col;
        if (p.starF) star(ctx, px, py, p.size*1.5, p.a, 0.45); else circle(ctx, px, py, Math.max(0.4, p.size*(1-dt/p.life*0.55)));
      }
      ctx.globalAlpha = 1;
    };
  }
  function makeDust(seed, n, x0,x1,y0,y1){
    const rnd = mulberry32(seed); const arr = [];
    for (let i=0;i<n;i++) arr.push({ x:lerp(x0,x1,rnd()), y:lerp(y0,y1,rnd()), r:lerp(0.7,2.6,rnd()), ph:rnd()*TAU, vy:lerp(6,22,rnd()), amp:lerp(8,30,rnd()) });
    return function(ctx, t, alpha){
      ctx.fillStyle = '#F9DC8A';
      for (const d of arr){
        const yy = y1 - ((d.y - y0 + t*d.vy) % (y1-y0+80));
        const xx = d.x + Math.sin(t*0.5 + d.ph)*d.amp;
        const a = (0.10 + 0.13*Math.sin(t*0.9+d.ph)) * (alpha===undefined?1:alpha);
        if (a<=0.01) continue;
        ctx.globalAlpha = a; circle(ctx, xx, yy, d.r);
      }
      ctx.globalAlpha = 1;
    };
  }
  function speedStreaks(ctx, t, t0, dur, seed, n){
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
           cover, circle, ring, star, starOutline, starPath, rr, goldGrad, textGrad, vignette,
           measureWords, drawWordsSpring, drawWordsEcho, kufiLine,
           makeRibbon, drawRibbon, foilFrame,
           makeStars, drawStars, makeBurst, makeDust, speedStreaks };
})();
