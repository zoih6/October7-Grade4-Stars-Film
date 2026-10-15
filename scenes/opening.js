/* مشهد الافتتاحية «نجوم أكتوبر» 0:00 → 0:20
   كل البكسلات دالة خالصة من الزمن — window.seek(t) */
'use strict';
window.Scenes = window.Scenes || {};
window.Scenes.opening = (function(){
  const C = window.Core, D = window.DATA;
  const TAU = C.TAU, E = C.E;

  /* ---------- المسار الزمني ---------- */
  const TL = {
    sparkIn: 0.12, flyA: 0.15, flyB: 1.02, explode: 1.05,
    skyIn: 1.15, skyFull: 2.4,
    line1: 2.55, flare1: 4.35, line1Out: 4.95, line1Gone: 5.35,
    discIn: 5.45, revA: 5.55, revB: 6.45, logoFlash: 6.55,
    schLine: 6.4, subLine: 6.9,
    passA: 7.6, passB: 8.55, flashMid: 8.62,
    stars2In: 8.7, bigLine: 8.98, bigOut: 10.9, bigGone: 11.2,
    capIn: 11.1, capOut: 13.3,
    constelA: 13.4, linesA: 13.75, blessCap: 14.6,
    camUp: 15.3, preIn: 15.6, preOut: 17.7,
    targetA: 15.7, ignite: 17.8, medalIn: 17.9,
    nameIn: 18.18, sub2In: 18.75, endFadeA: 19.5
  };

  /* ---------- الكاميرا ---------- */
  const cam = C.makeTrack({ x:0, y:0, z:1 });
  cam.add(TL.explode, 0.6, { z:1.06 }, E.outCubic)
     .add(2.5, 2.9, { z:1.10 }, E.inOutSine)
     .add(6.9, 0.55, { z:1.0 }, E.inOutCubic)
     .add(TL.passA, TL.passB - TL.passA, { z:2.9, y:-192 }, E.inCubic)
     .add(TL.flashMid, 0.01, { x:0, y:0, z:1.02 }, E.linear)
     .add(9.1, 2.0, { z:1.06 }, E.outCubic)
     .add(TL.camUp, 0.75, { y:250, z:1.04 }, E.inOutCubic)
     .add(TL.ignite, 0.32, { x:-57, y:169, z:1.17 }, E.outCubic)
     .add(18.6, 1.0, { z:1.13 }, E.inOutSine);

  /* ---------- حقول النجوم ---------- */
  const farStars  = C.makeStars(101, 130, 40, 1040, 40, 1500, 0.6, 1.7);
  const nearStars = C.makeStars(202, 64, 30, 1050, 60, 1420, 1.2, 3.0);
  const goldStars = C.makeStars(303, 46, 60, 1020, 90, 1700, 3.2, 8.0);
  const dust      = C.makeDust(404, 70, 0, 1080, 0, 1920);

  /* ---------- الانفجارات ---------- */
  const bExplode = C.makeBurst(505, 540, 775, TL.explode, 150, { size:5.4, spMax:760, brake:0.4 });
  const bLogo    = C.makeBurst(606, 540, 770, TL.logoFlash, 70, { size:3.6, spMax:460 });
  const bIgnite  = C.makeBurst(707, D.constellation[0][0], D.constellation[0][1], TL.ignite, 140, { size:6, spMax:700, brake:0.45 });
  const bName    = C.makeBurst(808, 540, 1150, TL.nameIn+0.05, 60, { size:3.2, spMax:380 });

  /* ---------- مسار المذنب ---------- */
  function cometPos(u){
    const e = E.outCubic(u);
    return { x: 540 + 74*Math.sin(u*Math.PI*2.6)*(1-u)*Math.sin(u*3.0), y: C.lerp(1870, 780, e) };
  }

  /* ---------- لوحة نصية (تعليق صغير واضح) ---------- */
  function plate(ctx, lines, cx, y, t, tIn, tOut, opt){
    opt = opt||{};
    const size = opt.size||52;
    const p = C.seg(t, tIn, 0.55, E.outBack);
    const po = tOut? C.seg(t, tOut, 0.4, E.inOutSine) : 1;
    const a = C.clamp01(p*1.5) * (1-po);
    if (a<=0.01) return 0;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = (opt.weight||600)+' '+size+'px Changa';
    let mw = 0;
    lines.forEach((ln,i)=>{ mw = Math.max(mw, ctx.measureText(ln).width); });
    const hh = lines.length * size*1.5 + 22;
    const sc = 0.85 + 0.15*p;
    ctx.translate(cx, y); ctx.scale(sc, sc + (1-p)*0.06);
    ctx.fillStyle = 'rgba(6,11,31,0.62)';
    C.rr(ctx, -mw/2-34, -hh/2, mw+68, hh, 26); ctx.fill();
    ctx.strokeStyle = 'rgba(240,185,58,0.55)'; ctx.lineWidth = 2.5; C.rr(ctx, -mw/2-34, -hh/2, mw+68, hh, 26); ctx.stroke();
    ctx.fillStyle = opt.color || '#FFF6E0'; ctx.textAlign='center'; ctx.textBaseline='middle';
    lines.forEach((ln,i)=>{ ctx.fillText(ln, 0, -(lines.length-1)*size*0.75 + i*size*1.5 ); });
    ctx.restore(); return a;
  }

  /* ---------- مشهد ---------- */
  function scene(ctx, t, IMGS){
    const W=1080, H=1920;
    ctx.fillStyle = '#04060F'; ctx.fillRect(0,0,W,H);
    const cm = cam.at(t);
    const float = t>8.8 ? { x: 6*Math.sin(t*0.9), y: 4*Math.sin(t*1.27) } : { x:0, y:0 };
    const cmx = cm.x + float.x, cmy = cm.y + float.y;
    const passGlow = C.pulse(t, TL.passA-0.06, TL.passB-TL.passA+0.3);

    /* ===== الطبقة البعيدة: السماء (paral 0.20) ===== */
    const skyA = C.seg(t, TL.skyIn, TL.skyFull - TL.skyIn);
    if (skyA>0){
      ctx.save();
      ctx.translate(540,960); ctx.scale(1+(cm.z-1)*0.20, 1+(cm.z-1)*0.20); ctx.translate(-540 - cmx*0.20, -960 - cmy*0.20);
      ctx.globalAlpha = skyA;
      if (IMGS.sky) C.cover(ctx, IMGS.sky, -80, -80, W+160, H+160, 1.06);
      else { const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#060B1F'); g.addColorStop(0.6,'#0D1B45'); g.addColorStop(1,'#16255C'); ctx.fillStyle=g; ctx.fillRect(-80,-80,W+160,H+160); }
      /* توهج أفق سفلي */
      const hg = ctx.createRadialGradient(540, 1760, 60, 540, 1760, 900);
      hg.addColorStop(0,'rgba(240,185,58,'+(0.34*skyA)+')'); hg.addColorStop(1,'rgba(240,185,58,0)');
      ctx.fillStyle = hg; ctx.fillRect(-80,-80,W+160,H+160);
      ctx.restore();
      /* نجوم بعيدة */
      ctx.save();
      ctx.translate(540,960); ctx.scale(1+(cm.z-1)*0.45,1+(cm.z-1)*0.45); ctx.translate(-540-cmx*0.45,-960-cmy*0.45);
      C.drawStars(ctx, farStars, t, 0.9*skyA);
      ctx.restore();
    }

    /* ===== ومضات عالمية (قبل المحتوى الأوسط كي لا تحرق النص) ===== */
    const exFlash = Math.pow(Math.max(0, 1-(t-TL.explode)/0.5), 2) * C.clamp01((t-TL.explode)*30);
    const igFlash = Math.pow(Math.max(0, 1-(t-TL.ignite)/0.42), 2) * C.clamp01((t-TL.ignite)*30);
    const passFlash = C.pulse(t, TL.passB-0.1, 0.42) * 0.85;
    const flash = Math.min(1, exFlash*0.75 + igFlash*0.9 + passFlash);

    /* ===== الطبقة الوسطى (par 1) ===== */
    ctx.save();
    C.applyCam(ctx, { x:cmx, y:cmy, z:cm.z }, 1);
    /* اهتزاز الاشتعال */
    if (t>TL.ignite && t<TL.ignite+0.6){ const k=Math.exp(-(t-TL.ignite)*6); ctx.translate(Math.sin(t*47)*10*k, Math.cos(t*53)*8*k); }

    /* نجوم قريبة تتوهج */
    if (skyA>0) C.drawStars(ctx, nearStars, t, 0.85*skyA);

    /* نجوم ذهبية مضلعة (عالم ما بعد العبور) */
    if (t>TL.stars2In){
      const a2 = C.seg(t, TL.stars2In, 0.8);
      for (const s of goldStars){
        const tw = 0.5+0.5*Math.sin(t*s.sp+s.ph);
        ctx.globalAlpha = a2*(0.25+0.6*tw);
        ctx.fillStyle = '#F9DC8A';
        C.star(ctx, s.x, s.y + 10*Math.sin(t*0.6+s.ph), s.r*1.6, s.ph + t*0.12, 0.45);
        if (s.r>5.5){ ctx.globalAlpha=a2*0.16*tw+0.05; ctx.fillStyle='#F0B93A'; C.circle(ctx, s.x, s.y, s.r*4.4); }
      }
      ctx.globalAlpha = 1;
    }

    /* المذنب الصاعد */
    if (t>=TL.flyA && t<TL.explode+0.12){
      const u = C.clamp01((t-TL.flyA)/(TL.flyB-TL.flyA));
      for (let k=26;k>=0;k--){
        const uu = u - k*0.011; if (uu<0) continue;
        const pt = cometPos(uu);
        const fall = 1 - k/27;
        ctx.globalAlpha = fall*0.75;
        ctx.fillStyle = k<3? '#FFF9E3' : '#F0B93A';
        C.circle(ctx, pt.x, pt.y, (1-k/40)*7*fall + 0.6);
      }
      const hp = cometPos(u);
      ctx.globalAlpha = 1;
      ctx.shadowColor='#FFE9A8'; ctx.shadowBlur=34;
      ctx.fillStyle = '#FFFDF2'; C.circle(ctx, hp.x, hp.y, 9);
      ctx.strokeStyle='rgba(255,233,168,0.8)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(hp.x-26,hp.y); ctx.lineTo(hp.x+26,hp.y); ctx.moveTo(hp.x,hp.y-26); ctx.lineTo(hp.x,hp.y+26); ctx.stroke();
      ctx.shadowBlur=0;
    }

    /* حلقات موجية للانفجار */
    [ [TL.explode,0.75,620,12], [TL.explode+0.12,0.6,420,7] ].forEach(rg=>{
      const q = C.seg(t, rg[0], rg[1], E.outCubic);
      if (q>0&&q<1){ ctx.globalAlpha=(1-q)*0.85; ctx.strokeStyle='#F9DC8A'; C.circle; C.ring(ctx, 540, 775, rg[2]*q+8, rg[3]*(1-q)+1.5); }
    });
    ctx.globalAlpha=1;

    /* حلقات الاشتعال عند العقدة */
    const n0 = D.constellation[0]; if(!window.__cam) window.__cam = cam;
    const rip = C.seg(t, TL.ignite, 0.7, E.outCubic);
    if (rip>0&&rip<1){ ctx.globalAlpha=(1-rip); ctx.strokeStyle='#FFF3C4'; C.ring(ctx, n0[0], n0[1], 300*rip+10, 8*(1-rip)+2); }
    ctx.globalAlpha=1;

    /* السطر الأول */
    if (t>TL.line1-0.1 && t<TL.line1Gone){
      const outP = C.seg(t, TL.line1Out, TL.line1Gone-TL.line1Out, E.inOutSine);
      ctx.save(); ctx.globalAlpha = 1-outP; ctx.translate(0, -120*outP);
      C.drawWordsSpring(ctx, ['في','رحاب','العلم','تزهر','الأحلام'], 540, 865, t, TL.line1,
        { size:92, stagger:0.15, glow:'rgba(240,185,58,0.8)', bob:2.5, yoff:110, maxW:980 });
      /* خط ذهبي تحتي يرسم نفسه */
      const lp = C.seg(t, TL.line1+0.85, 0.7, E.outCubic);
      if (lp>0){ ctx.globalAlpha=(1-outP)*lp*0.9; ctx.strokeStyle='#F0B93A'; ctx.lineWidth=5; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(300, 945); ctx.lineTo(300+480*lp, 945); ctx.stroke(); }
      /* مسحة لمعان عابرة */
      const fl = C.pulse(t, TL.flare1, 0.9);
      if (fl>0){ ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=fl*0.6;
        const fx = 60 + 960*C.seg(t, TL.flare1, 0.9);
        const fg2 = ctx.createLinearGradient(fx-160,0,fx+160,0);
        fg2.addColorStop(0,'rgba(255,246,220,0)'); fg2.addColorStop(0.5,'rgba(255,246,220,0.9)'); fg2.addColorStop(1,'rgba(255,246,220,0)');
        ctx.fillStyle=fg2; ctx.fillRect(fx-160, 760, 320, 230); ctx.restore(); }
      ctx.restore();
    }

    /* ===== شعار المدرسة: قرص ذهبي + كشف دائري + غبار متقارب ===== */
    if (t>TL.discIn-0.05 && t<TL.passA+0.95){
      const discP = C.seg(t, TL.discIn, 0.6, E.outBackBig);
      const passFade = C.clamp01(1 - Math.max(0, (cm.z-1.75)/2));
      const la = C.clamp01(discP*1.4)*passFade;
      if (la>0.01){
        ctx.save(); ctx.globalAlpha = la;
        const R = 300*(0.55+0.45*discP);
        /* قرص */
        const dg = ctx.createRadialGradient(540,770,R*0.08, 540,770,R);
        dg.addColorStop(0,'rgba(255,247,220,0.98)'); dg.addColorStop(0.55,'rgba(249,220,138,0.95)'); dg.addColorStop(0.85,'rgba(240,185,58,0.55)'); dg.addColorStop(1,'rgba(240,185,58,0)');
        ctx.fillStyle = dg; C.circle(ctx, 540, 770, R);
        ctx.strokeStyle='rgba(240,185,58,0.9)'; ctx.lineWidth=5; C.ring(ctx, 540,770, R*0.86, 5);
        /* كشف الشعار بقناع دائري */
        const rv = C.seg(t, TL.revA, TL.revB-TL.revA, E.outCubic);
        if (rv>0 && IMGS.logo){
          ctx.save(); ctx.beginPath(); ctx.arc(540,770, R*0.86*E.outCubic(rv)+2, 0, TAU); ctx.clip();
          const lw = R*1.28*(1+0.06*(1-rv));
          ctx.drawImage(IMGS.logo, 540-lw/2, 770-lw/2, lw, lw);
          ctx.restore();
        }
        /* غبار متقارب حلزوني */
        const rnd = C.mulberry32(909);
        for (let i=0;i<34;i++){
          const u = C.clamp01((t-TL.revA-0.1)/ (TL.revB-TL.revA) - rnd()*0.14);
          if (u<=0||u>=1) continue;
          const a0 = rnd()*TAU, rr2 = 640*Math.pow(1-u,1.35)+20;
          const px = 540 + Math.cos(a0+u*2.6)*rr2, py = 770 + Math.sin(a0+u*2.6)*rr2*0.9;
          ctx.globalAlpha = la*(1-u)*0.85; ctx.fillStyle='#F9DC8A'; C.circle(ctx, px, py, 2.4*(1-u)+0.5);
        }
        /* فلاش اكتمال */
        const lf = C.pulse(t, TL.logoFlash, 0.5);
        if (lf>0){ ctx.globalAlpha=lf; ctx.strokeStyle='#FFF7DC'; C.ring(ctx, 540,770, R*0.9+lf*40, 6); }
        ctx.restore();

        /* السطران المدرسيان */
        const sl = C.seg(t, TL.schLine, 0.55, E.outBack)*passFade;
        if (sl>0.01){ ctx.save(); ctx.globalAlpha=sl;
          C.drawWordsSpring(ctx, ['من','مدرسة','سبعة','أكتوبر'], 540, 1210, t, TL.schLine, { size:86, stagger:0.1, glow:'rgba(240,185,58,0.7)', yoff:70, maxW:820 });
          ctx.restore(); }
        plate(ctx, ['نلتقي اليوم لنحتفي'], 540, 1392, t, TL.subLine, TL.passA+0.3, { size:50 });
      }
    }

    /* ===== السطر الكبير بعد العبور ===== */
    if (t>TL.bigLine-0.1 && t<TL.bigGone){
      const outP = C.seg(t, TL.bigOut, TL.bigGone-TL.bigOut, E.inOutSine);
      ctx.save(); ctx.globalAlpha = 1-outP; ctx.translate(0, -140*outP);
      C.drawWordsSpring(ctx, ['نحتفي','بنجوم','الصف','الرابع'], 540, 850, t, TL.bigLine,
        { size:128, stagger:0.13, big:true, rot:-8, glow:'rgba(240,185,58,0.9)', bob:3, yoff:150, maxW:960 });
      ctx.restore();
    }

    /* لوحة المثابرة */
    plate(ctx, ['جعلوا من المثابرة طريقًا للتفوق','ومن الطموح بدايةً لمستقبلٍ مشرق'], 540, 1275, t, TL.capIn, TL.capOut, { size:54 });

    /* ===== الكوكبة: عقد تنبثق وخطوط تمتد ===== */
    if (t>TL.constelA){
      const N = D.constellation;
      for (let i=0;i<N.length;i++){
        const tin = TL.constelA + i*0.075;
        const p = C.seg(t, tin, 0.5, E.outBackBig);
        if (p<=0) continue;
        const nx = N[i][0], ny = N[i][1];
        const born = C.pulse(t, tin+0.12, 0.55);
        const ign = (i===0)? C.seg(t, TL.ignite, 0.3) : 0;
        ctx.globalAlpha = 0.9*p;
        ctx.fillStyle = i===0&&ign>0 ? '#FFF9E3' : '#F9DC8A';
        C.star(ctx, nx, ny, (9+2.5*Math.sin(t*2+i*1.7))*p*(1+0.6*ign), t*0.4+i, 0.45);
        if (born>0){ ctx.globalAlpha=born*0.7; ctx.strokeStyle='#F9DC8A'; C.ring(ctx, nx, ny, 34*born+8, 2.5); }
      }
      /* الخطوط الواصلة */
      ctx.shadowColor='rgba(240,185,58,0.8)'; ctx.shadowBlur=10;
      ctx.strokeStyle='rgba(249,220,138,0.85)'; ctx.lineWidth=3; ctx.lineCap='round';
      for (let i=1;i<N.length;i++){
        const lp = C.seg(t, TL.linesA + i*0.085, 0.5, E.outCubic);
        if (lp<=0) continue;
        ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(N[i-1][0], N[i-1][1]);
        ctx.lineTo(C.lerp(N[i-1][0],N[i][0],lp), C.lerp(N[i-1][1],N[i][1],lp)); ctx.stroke();
      }
      ctx.shadowBlur=0; ctx.globalAlpha=1;

      /* لوحة التبريك */
      plate(ctx, ['نبارك لأوائل الصف الرابع'], 540, 1455, t, TL.blessCap, TL.camUp+0.35, { size:58, weight:700 });

      /* سطر «نبدأ بنجوم الترتيب الأول» */
      if (t>TL.preIn-0.05){
        const po = C.seg(t, TL.preOut, 0.3, E.inOutSine);
        ctx.save(); ctx.globalAlpha = 1-po;
        C.drawWordsSpring(ctx, ['ونبدأ','بنجوم','الترتيب','الأول'], 540, 1005, t, TL.preIn, { size:70, weight:700, stagger:0.1, glow:'rgba(240,185,58,0.8)', maxW:780 });
        ctx.restore();
      }

      /* حلقة الاستهداف (ترقّب) */
      if (t>TL.targetA && t<TL.ignite+0.05){
        for (let k=0;k<3;k++){
          const u = ((t-TL.targetA)*0.9 + k*0.33) % 1;
          ctx.globalAlpha = (1-u)*0.7; ctx.strokeStyle='#F9DC8A';
          C.ring(ctx, n0[0], n0[1], 26 + 60*u, 3.2*(1-u)+1);
        }
        /* علامات دائرية دوارة */
        ctx.globalAlpha = 0.85; ctx.strokeStyle='#FFF3C4'; ctx.lineWidth=4;
        for (let m=0;m<4;m++){
          const aa = t*1.8 + m*TAU/4;
          const rr3 = 84 + 6*Math.sin(t*3);
          ctx.beginPath(); ctx.arc(n0[0], n0[1], rr3, aa, aa+TAU*0.09); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      /* ===== الميدالية بعد الاشتعال ===== */
      const md = C.seg(t, TL.medalIn, 0.65, E.outBackBig);
      if (md>0){
        const mx = n0[0], my = n0[1];
        ctx.save(); ctx.translate(mx, my); ctx.scale(md, md*(1+0.08*(1-md)));
        /* شريطا الوسام */
        ctx.fillStyle='#C5283D';
        ctx.beginPath(); ctx.moveTo(-34, 60); ctx.lineTo(-58, 132); ctx.lineTo(-22, 118); ctx.lineTo(-12, 156); ctx.lineTo(4, 96); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#E63950';
        ctx.beginPath(); ctx.moveTo(34, 60); ctx.lineTo(58, 132); ctx.lineTo(22, 118); ctx.lineTo(12, 156); ctx.lineTo(-4, 96); ctx.closePath(); ctx.fill();
        /* القرص الذهبي */
        ctx.shadowColor='rgba(240,185,58,0.95)'; ctx.shadowBlur=40;
        ctx.fillStyle = C.goldGrad(ctx, 0, 0, 96); C.circle(ctx, 0, 0, 96);
        ctx.shadowBlur=0;
        ctx.fillStyle='#FFE9B0'; C.circle(ctx, 0, 0, 78);
        ctx.fillStyle = C.goldGrad(ctx, 0, -8, 74); C.circle(ctx, 0, 0, 74);
        /* لمعان متحرك */
        const sh = ((t-TL.medalIn)*0.7) % 1.4;
        if (sh<1){ ctx.save(); ctx.beginPath(); ctx.arc(0,0,74,0,TAU); ctx.clip();
          const bx = -160 + 320*sh;
          const bg = ctx.createLinearGradient(bx-40,0,bx+40,0);
          bg.addColorStop(0,'rgba(255,255,255,0)'); bg.addColorStop(0.5,'rgba(255,255,255,0.75)'); bg.addColorStop(1,'rgba(255,255,255,0)');
          ctx.fillStyle=bg; ctx.fillRect(bx-40,-80,80,160); ctx.restore(); }
        /* نجمة + رتبة */
        ctx.fillStyle='#8A5608';
        C.star(ctx, 0, -16, 34, 0, 0.45);
        ctx.font='700 34px Changa'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='#6B3E05'; ctx.fillText('الأول', 0, 38);
        ctx.restore();

        /* نجوم صغيرة حول الميدالية */
        const rnd2 = C.mulberry32(111);
        for (let i=0;i<8;i++){
          const aa = rnd2()*TAU, rr4 = 130 + rnd2()*70;
          const tw = 0.4+0.6*Math.sin(t*3.1+i*2.3);
          ctx.globalAlpha = md*tw*0.8; ctx.fillStyle='#FFF3C4';
          C.star(ctx, mx+Math.cos(aa)*rr4, my+Math.sin(aa)*rr4, 5.5*tw+2, t*0.8+i, 0.5);
        }
        ctx.globalAlpha=1;
      }

      /* ===== اسم الطالب الأول ===== */
      if (t>TL.nameIn-0.05){
        C.drawWordsSpring(ctx, D.students[0].ar.split(' '), 512, 1185, t, TL.nameIn,
          { size:104, stagger:0.09, big:true, glow:'rgba(240,185,58,0.95)', bob:3.5, yoff:130, maxW:760 });
        plate(ctx, ['نجم الترتيب الأول'], 512, 1405, t, TL.sub2In, null, { size:56, weight:700, color:'#F9DC8A' });
      }
    }

    ctx.restore(); /* نهاية الطبقة الوسطى */

    /* ===== انفجارات الجسيمات (فوق كل شيء) ===== */
    if (t>TL.explode) bExplode(ctx, t);
    if (t>TL.logoFlash) bLogo(ctx, t);
    if (t>TL.ignite) bIgnite(ctx, t);
    if (t>TL.nameIn) bName(ctx, t);

    /* غبار أمامي */
    if (skyA>0){ ctx.save(); ctx.translate(-cmx*0.35, -cmy*0.35); dust(ctx, t, 0.9*skyA); ctx.restore(); }

    /* أغطية وميض ذهبية بولستر المولَّد (screen) */
    if (IMGS.burst){
      if (exFlash>0.01){ ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=Math.min(0.95,exFlash*1.5);
        const s = 1+ (1-Math.pow(Math.max(0,1-(t-TL.explode)/0.9),1))*0.9; ctx.translate(540,775); ctx.scale(s,s); ctx.translate(-540,-860);
        C.cover(ctx, IMGS.burst, 0, 0, 1080, 1720, 1.0); ctx.restore(); }
      if (igFlash>0.01){ ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=Math.min(0.9,igFlash*1.4);
        const n0s = { x: 540 + cm.z*(n0[0]-540-cmx), y: 960 + cm.z*(n0[1]-960-cmy) };
        const s2 = 0.9 + 0.5*C.seg(t, TL.ignite, 0.6); ctx.translate(n0s.x, n0s.y); ctx.scale(s2,s2); ctx.translate(-540,-800);
        C.cover(ctx, IMGS.burst, 0, 0, 1080, 1600, 1.0); ctx.restore(); }
    }

    /* شرائح السرعة */
    C.speedStreaks(ctx, t, TL.passA, TL.passB-TL.passA+0.15, 313, 15);
    C.speedStreaks(ctx, t, TL.explode, 0.5, 717, 9);
    if (flash>0.01){ ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha = Math.min(0.9, flash); ctx.fillStyle='#FFF3C4'; ctx.fillRect(0,0,W,H); ctx.restore(); }

    /* فينييت + إغماء نهاية المسودة */
    C.vignette(ctx, 0.5 + 0.3*C.seg(t, TL.endFadeA, 0.5));
  }
  return scene;
})();
