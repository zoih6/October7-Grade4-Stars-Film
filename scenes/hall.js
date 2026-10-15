/* «قاعة النجوم» — الفصل الافتتاحي 0:00 → 0:20
   عالَم مصمم: شريط ذهبي يقود الكاميرا بين محطات مؤطرة،
   مزامن مع جدول التعليق الرسمي، ومؤثرات صوتية لكل حدث. */
'use strict';
window.Scenes = window.Scenes || {};
window.Scenes.hall = (function(){
  const C = window.Core, D = window.DATA;
  const TAU = C.TAU, E = C.E;
  const INK = '#14264F';

  /* ================= الجدول الزمني (من جدول المستخدم) ================= */
  const T = {
    meteor: 0.10, slam: 0.62, worldIn: 0.75,
    frameIn: 0.95, poem: 1.20, orn: 2.70, tail: 2.95, poemDim: 4.45,
    rib1: 4.90,
    crest: 5.50, crestRevA: 5.60, crestRevB: 6.50, schTag: 5.98, laurel: 6.15,
    kicker: 6.90, hero1: 7.30, hero2: 7.75, hero3: 8.35, rosette: 8.55, burstStars: 9.00, heroOut: 9.55,
    pat1: 9.95, patOrn: 10.40, pat2: 10.85, recess: 11.95,
    rib2: 12.35, wall: 12.85, slotStep: 0.085,
    sash: 14.40, sashTxt: 15.00, sashTail: 15.80, sashOut: 16.70,
    rib3: 17.40, hb: [17.60, 18.15, 18.60], kicker2: 18.00,
    preFlash: 19.55, cut: 19.93
  };

  /* ================= الكاميرا ================= */
  const cam = C.makeTrack({ x:0, y:0, z:1, r:0 });
  cam.add(T.slam, 0.5, { z:0.965 }, E.outCubic)
     .add(1.30, 1.2, { z:1.02 }, E.inOutSine)
     .add(2.00, 2.6, { z:1.10, y:-15 }, E.inOutSine)
     .add(4.70, 0.5, { z:1.03, y:0 }, E.inOutCubic)
     .add(5.05, 1.05, { y:285, r:2.2 }, E.inOutCubic)
     .add(6.15, 0.40, { r:0 }, E.outCubic)
     .add(6.70, 2.4, { z:1.07 }, E.inOutSine)
     .add(T.hero1, 0.24, { z:1.095 }, E.outCubic)
     .add(T.hero2, 0.24, { z:1.12 }, E.outCubic)
     .add(T.hero3, 0.32, { z:1.085 }, E.inOutCubic)
     .add(9.70, 2.1, { y:305, z:1.04, r:-1.1 }, E.inOutSine)
     .add(T.recess, 0.75, { z:0.99, r:0, y:240 }, E.inOutCubic)
     .add(12.45, 1.20, { x:330, y:40, z:1.14, r:-2.4 }, E.inOutCubic)
     .add(13.70, 0.45, { r:0 }, E.outCubic)
     .add(13.80, 0.50, { x:0, y:0, z:1.10 }, E.inOutCubic)
     .add(14.50, 1.60, { z:1.12 }, E.inOutSine)
     .add(T.rib3, 0.90, { x:334, y:-118, z:1.16 }, E.inOutCubic)
     .add(18.60, 0.50, { z:1.18 })
     .add(19.50, 0.45, { z:1.21 }, E.inCubic);

  /* ================= حقول مداومة ================= */
  const farStars  = C.makeStars(11, 140, 40, 1040, 30, 1500, 0.6, 1.7);
  const nearStars = C.makeStars(22, 66, 30, 1050, 50, 1420, 1.2, 3.1);
  const goldStars = C.makeStars(33, 40, 60, 1020, 80, 1700, 3.0, 7.6);
  const dust      = C.makeDust(44, 70, 0, 1080, 0, 1920);

  /* ================= جسيمات الأحداث ================= */
  const bSlam   = C.makeBurst(55, 600, 1520, T.slam, 150, { size:5.4, spMax:820, brake:0.38 });
  const bCrest  = C.makeBurst(66, 540, 1295, 6.55, 70, { size:3.6, spMax:460 });
  const bRose   = C.makeBurst(77, 252, 730, T.rosette, 60, { size:3.4, spMax:420 });
  const bStars  = C.makeBurst(88, 540, 846, T.burstStars, 90, { size:4.5, spMax:520, brake:0.5 });
  const bIn     = C.makeBurst(99, 943, 445, 19.50, 80, { size:4, spMin:120, spMax:300, mode:'in' });

  /* ================= الشريط الذهبي ================= */
  const rib1Path = C.makeRibbon([[1170,420],[1010,470],[830,620],[700,780],[770,1010],[700,1205],[575,1235]]);
  const rib2Path = C.makeRibbon([[560,975],[1150,860],[1130,560],[930,445],[943,452]]);
  /* مسار دائري حول لوح البطاقة الأول (لفة ونصف ثم غوص للقلب) */
  const circPts = [];
  for (let i=0;i<=14;i++){
    const a = -Math.PI/2 - (i/14)*Math.PI*3.1; /* لفة 1.55 عكس عقارب */
    const rr = 105 - (i/14)*40;
    circPts.push([943 + Math.cos(a)*rr, 445 + Math.sin(a)*rr]);
  }
  circPts.push([943,445]);
  const rib3Path = C.makeRibbon(circPts);

  /* ================= لوحات الشرف ================= */
  const SLOTS = [];
  (function(){
    const Ax = [943,801,659,517,375,233,91], Bx = [872,730,588,446,304,162];
    Ax.forEach((x,i)=> SLOTS.push({ x, y:445, i }));
    Bx.forEach((x,i)=> SLOTS.push({ x, y:690, i: i+7 }));
  })();
  function drawSlot(ctx, x, y, w, h, wake, sel, t, i){
    if (wake<=0) return;
    const p = C.E.outBackBig(C.clamp01(wake));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.4+0.6*p, (0.4+0.6*p)*(1+0.1*(1-p)));
    ctx.globalAlpha = Math.min(1, wake*1.4);
    /* زجاج */
    const g = ctx.createLinearGradient(0,-h/2,0,h/2);
    g.addColorStop(0,'rgba(19,32,80,0.88)'); g.addColorStop(1,'rgba(8,14,38,0.82)');
    C.rr(ctx, -w/2, -h/2, w, h, 16); ctx.fillStyle = g; ctx.fill();
    /* إطار */
    ctx.strokeStyle = 'rgba(240,185,58,'+(0.28+0.5*C.clamp01(wake))+')';
    ctx.lineWidth = 2.2; C.rr(ctx, -w/2, -h/2, w, h, 16); ctx.stroke();
    ctx.strokeStyle = 'rgba(249,220,138,'+(0.18+0.3*C.clamp01(wake))+')';
    ctx.lineWidth = 1; C.rr(ctx, -w/2+7, -h/2+7, w-14, h-14, 11); ctx.stroke();
    /* نجمة مفرغة */
    ctx.globalAlpha = (0.5+0.3*Math.sin(t*2+i*1.7)) * Math.min(1,wake);
    ctx.strokeStyle = '#F9DC8A';
    C.starOutline(ctx, 0, -6, 30, t*0.15+i, 2);
    /* قاعدة اسم فارغة */
    ctx.globalAlpha = 0.30*Math.min(1,wake);
    ctx.fillStyle = '#F0B93A';
    C.rr(ctx, -w/2+16, h/2-26, w-32, 8, 4); ctx.fill();
    /* حلقة التحديد */
    if (sel>0){
      ctx.globalAlpha = sel*(0.55+0.4*Math.sin(t*5));
      ctx.strokeStyle = '#FFE9A8'; ctx.lineWidth = 4;
      C.rr(ctx, -w/2-9, -h/2-9, w+18, h+18, 22); ctx.stroke();
    }
    ctx.restore();
  }

  /* ================= المشهد ================= */
  function scene(ctx, t, IMGS){
    const W=1080, H=1920;
    ctx.fillStyle = '#04060F'; ctx.fillRect(0,0,W,H);
    const cm = cam.at(t);
    const float = t>2.2 ? { x: 5*Math.sin(t*0.9), y: 3.5*Math.sin(t*1.21) } : { x:0, y:0 };
    const cmx = cm.x + float.x, cmy = cm.y + float.y;

    /* ---------- السماء (دخول من نقطة الارتطام) ---------- */
    const skyA = C.seg(t, T.worldIn, 1.25);
    if (skyA>0){
      ctx.save();
      ctx.translate(540,960); ctx.scale(1+(cm.z-1)*0.22, 1+(cm.z-1)*0.22); ctx.translate(-540-cmx*0.22, -960-cmy*0.22);
      if (IMGS.sky){ ctx.globalAlpha = skyA; C.cover(ctx, IMGS.sky, -80, -80, W+160, H+160, 1.06); }
      else { const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#060B1F'); g.addColorStop(0.6,'#0D1B45'); g.addColorStop(1,'#16255C'); ctx.fillStyle=g; ctx.globalAlpha=skyA; ctx.fillRect(-80,-80,W+160,H+160); }
      /* شق الضوء: توهج ينتشر من نقطة الارتطام */
      const crackR = 200 + 1400*C.seg(t, T.slam, 1.5, E.outCubic);
      const cg = ctx.createRadialGradient(600,1520, 20, 600,1520, crackR);
      const cGlow = 0.5*Math.pow(Math.max(0,1-(t-T.slam)/3.5),1.2)+0.08;
      cg.addColorStop(0,'rgba(255,236,180,'+(0.55*cGlow)+')'); cg.addColorStop(0.4,'rgba(240,185,58,'+(0.25*cGlow)+')'); cg.addColorStop(1,'rgba(240,185,58,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = cg; C.circle(ctx, 600,1520, crackR);
      ctx.restore();
      ctx.save();
      ctx.translate(540,960); ctx.scale(1+(cm.z-1)*0.45,1+(cm.z-1)*0.45); ctx.translate(-540-cmx*0.45,-960-cmy*0.45);
      C.drawStars(ctx, farStars, t, 0.9*skyA);
      ctx.restore();
    }

    /* ---------- الشقوق المضيئة ---------- */
    if (t>T.slam && t<6.2){
      const rnd = C.mulberry32(505);
      const base = 0.65*Math.pow(Math.max(0,1-(t-T.slam)/5.2),1.6);
      for (let i=0;i<7;i++){
        const aa = Math.PI + (i/6)*Math.PI + (rnd()-0.5)*0.4;
        const len = 90 + rnd()*220;
        const fl = base*(0.7+0.3*Math.sin(t*13+i*2.6));
        if (fl<=0.01) continue;
        ctx.strokeStyle = 'rgba(249,220,138,'+fl+')';
        ctx.lineWidth = 1.5 + rnd()*2;
        ctx.shadowColor = 'rgba(240,185,58,0.8)'; ctx.shadowBlur = 8;
        ctx.beginPath();
        let px = 600, py = 1520;
        ctx.moveTo(px, py);
        const segs = 4;
        for (let s=1;s<=segs;s++){
          px += Math.cos(aa)*len/segs + (rnd()-0.5)*18;
          py += Math.sin(aa)*len/segs*0.35 + (rnd()-0.5)*14;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    /* ---------- النيزك ---------- */
    if (t>=T.meteor && t<T.slam+0.15){
      const u = C.clamp01((t-T.meteor)/(T.slam-T.meteor));
      const e = E.inCubic(u);
      const hx = C.lerp(-120, 600, e), hy = C.lerp(260, 1520, e*e*0.3+e*0.7);
      for (let k=24;k>=0;k--){
        const ku = u - k*0.014; if (ku<0) continue;
        const ke = E.inCubic(ku);
        const kx = C.lerp(-120, 600, ke), ky = C.lerp(260, 1520, ke*ke*0.3+ke*0.7);
        ctx.globalAlpha = (1-k/25)*0.8;
        ctx.fillStyle = k<3? '#FFF9E3':'#F0B93A';
        C.circle(ctx, kx, ky, (1-k/30)*7*(1-k/25)+0.5);
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor='#FFE9A8'; ctx.shadowBlur=30;
      ctx.fillStyle='#FFFDF2'; C.circle(ctx, hx, hy, 10);
      ctx.shadowBlur=0;
    }

    /* حلقات صدمة الارتطام */
    [[T.slam,0.8,560,11],[T.slam+0.1,0.65,380,6]].forEach(rg=>{
      const q = C.seg(t, rg[0], rg[1], E.outCubic);
      if (q>0&&q<1){ ctx.globalAlpha=(1-q)*0.8; ctx.strokeStyle='#F9DC8A'; C.ring(ctx, 600,1520, rg[2]*q+8, rg[3]*(1-q)+1.5); }
    });
    ctx.globalAlpha=1;

    /* ================= الطبقة الوسطى (العالم) ================= */
    ctx.save();
    C.applyCam(ctx, { x:cmx, y:cmy, z:cm.z, r:cm.r }, 1);
    if (t>T.slam && t<T.slam+0.5){ const k=Math.exp(-(t-T.slam)*7); ctx.translate(Math.sin(t*43)*8*k, Math.cos(t*51)*6*k); }

    if (skyA>0){
      C.drawStars(ctx, nearStars, t, 0.85*skyA);
      for (const s of goldStars){
        const tw = 0.5+0.5*Math.sin(t*s.sp+s.ph);
        ctx.globalAlpha = skyA*(0.2+0.55*tw);
        ctx.fillStyle = '#F9DC8A';
        C.star(ctx, s.x, s.y + 9*Math.sin(t*0.6+s.ph), s.r*1.6, s.ph + t*0.11, 0.45);
        if (s.r>5.2){ ctx.globalAlpha=skyA*(0.10+0.1*tw); C.circle(ctx, s.x, s.y, s.r*4.2); }
      }
      ctx.globalAlpha = 1;
    }

    /* ---------- محطة القصيدة ---------- */
    const poemA = 1 - 0.45*C.seg(t, T.poemDim, 0.6);
    if (t>T.frameIn-0.05 && t<T.rib1+0.4){
      ctx.save(); ctx.globalAlpha = poemA;
      C.foilFrame(ctx, 140, 575, 800, 430, t, T.frameIn, { r:24, w:3 });
      C.drawWordsEcho(ctx, ['في','رحاب','العلم','تزهر','الأحلام'], 540, 738, t, T.poem,
        { size:76, family:'Rakkas', weight:400, stagger:0.15, dir:'down', dist:120, glow:'rgba(240,185,58,0.85)', bob:2.2, maxW:690 });
      /* فاصل زخرفي */
      const op = C.seg(t, T.orn, 0.5, E.outCubic);
      if (op>0){
        ctx.globalAlpha = poemA*op;
        ctx.strokeStyle='#F0B93A'; ctx.lineWidth=2.5; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(300,805); ctx.lineTo(300+130*op,805); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(780,805); ctx.lineTo(780-130*op,805); ctx.stroke();
        ctx.save(); ctx.translate(540,805); ctx.rotate(Math.PI/4); ctx.fillStyle='#F0B93A';
        ctx.fillRect(-7*op,-7*op,14*op,14*op); ctx.restore();
      }
      C.kufiLine(ctx, 'وبالاجتهاد تصنع الإنجازات وتكتب أجمل حكايات النجاح', 540, 872, t, T.tail,
        { size:34, weight:600, tracking:9, maxW:690, fill:'#FFF6E0', alpha:poemA });
      ctx.restore();
    }

    /* ---------- الرحلة الأولى ---------- */
    const r1h = {};
    C.drawRibbon(ctx, rib1Path, t, T.rib1, 1.0, { headRef: r1h, w:7 });

    /* ---------- محطة الشعار (الضريح الذهبي) ---------- */
    if (t>T.crest-0.05){
      const discP = C.seg(t, T.crest, 0.6, E.outBackBig);
      const la = C.clamp01(discP*1.4) * (1 - 0.55*C.seg(t, T.recess, 0.7));
      if (la>0.01){
        ctx.save();
        const CY = 1295;
        /* هالة */
        ctx.globalAlpha = 0.5*la;
        const hgl = ctx.createRadialGradient(540,CY,50, 540,CY, 360);
        hgl.addColorStop(0,'rgba(240,185,58,0.42)'); hgl.addColorStop(1,'rgba(240,185,58,0)');
        ctx.fillStyle = hgl; C.circle(ctx, 540, CY, 360*(0.7+0.3*discP));
        /* قرص */
        ctx.globalAlpha = la;
        const R = 252*(0.55+0.45*discP);
        const dg = ctx.createRadialGradient(540,CY,R*0.08, 540,CY,R);
        dg.addColorStop(0,'rgba(255,247,220,0.98)'); dg.addColorStop(0.55,'rgba(249,220,138,0.95)'); dg.addColorStop(0.85,'rgba(240,185,58,0.55)'); dg.addColorStop(1,'rgba(240,185,58,0)');
        ctx.fillStyle = dg; C.circle(ctx, 540, CY, R);
        ctx.strokeStyle='rgba(240,185,58,0.9)'; ctx.lineWidth=5; C.ring(ctx, 540,CY, R*0.86, 5);
        /* غبار حلزوني متقارب */
        const rnd = C.mulberry32(909);
        for (let i=0;i<30;i++){
          const u = C.clamp01((t-T.crestRevA-0.1)/(T.crestRevB-T.crestRevA) - rnd()*0.14);
          if (u<=0||u>=1.05) continue;
          const a0 = rnd()*TAU, rr2 = 620*Math.pow(1-u,1.35)+20;
          ctx.globalAlpha = la*(1-u)*0.8; ctx.fillStyle='#F9DC8A';
          C.circle(ctx, 540+Math.cos(a0+u*2.6)*rr2, CY+Math.sin(a0+u*2.6)*rr2*0.9, 2.2*(1-u)+0.5);
        }
        /* الشعار بقناع دائري */
        ctx.globalAlpha = la;
        const rv = C.seg(t, T.crestRevA, T.crestRevB-T.crestRevA, E.outCubic);
        if (rv>0 && IMGS.logo){
          ctx.save(); ctx.beginPath(); ctx.arc(540,CY, R*0.86*E.outCubic(rv)+2, 0, TAU); ctx.clip();
          const lw = R*1.28*(1+0.06*(1-rv));
          ctx.drawImage(IMGS.logo, 540-lw/2, CY-lw/2, lw, lw);
          ctx.restore();
        }
        /* إكليل الغار (أصل مولّد، مزج ضوئي) */
        if (IMGS.laurel){
          const lp = C.seg(t, T.laurel, 0.8, E.outBackBig);
          if (lp>0){
            ctx.save(); ctx.globalCompositeOperation='screen';
            ctx.globalAlpha = 0.85*C.clamp01(lp*1.3);
            ctx.translate(540, CY+40);
            const scl = 1.02*(0.6+0.4*lp);
            ctx.scale(scl, scl*(1+0.08*(1-lp)));
            ctx.drawImage(IMGS.laurel, -280, -30, 560, 306);
            ctx.restore();
          }
        }
        ctx.restore();
        /* لوحة اسم المدرسة */
        const tp = C.seg(t, T.schTag, 0.55, E.outBack);
        if (tp>0){
          ctx.save(); ctx.globalAlpha = tp * (1 - 0.55*C.seg(t, T.recess, 0.7));
          ctx.font = '700 40px Kufi';
          const twd = ctx.measureText('مدرسة سبعة أكتوبر').width + 70;
          const bw = 2*twd;
          const g2 = ctx.createLinearGradient(540-bw,0,540+bw,0);
          g2.addColorStop(0,'rgba(13,27,69,0)'); g2.addColorStop(0.22,'rgba(13,27,69,0.85)'); g2.addColorStop(0.78,'rgba(13,27,69,0.85)'); g2.addColorStop(1,'rgba(13,27,69,0)');
          ctx.fillStyle = g2; ctx.fillRect(540-bw, 1595, bw*2, 64);
          ctx.strokeStyle='rgba(240,185,58,0.8)'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.moveTo(540-bw*0.62,1593); ctx.lineTo(540+bw*0.62,1593); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(540-bw*0.62,1661); ctx.lineTo(540+bw*0.62,1661); ctx.stroke();
          C.kufiLine(ctx, 'مدرسة سبعة أكتوبر', 540, 1629, t, T.schTag+0.05, { size:40, weight:700, tracking:14, fill:'#F9DC8A', glow:'rgba(240,185,58,0.6)' });
          ctx.restore();
        }
      }
    }

    /* ---------- البطولات (فوق الضريح) ---------- */
    const heroA = 1 - C.seg(t, T.heroOut, 0.55);
    const heroY = -150*C.seg(t, T.heroOut, 0.55, E.inCubic);
    if (t>T.kicker-0.05 && heroA>0.01){
      ctx.save(); ctx.globalAlpha = heroA; ctx.translate(0, heroY);
      /* كيكر بمعينتي جانب */
      const kp = C.seg(t, T.kicker, 0.5, E.outBack);
      if (kp>0){
        ctx.globalAlpha = heroA*kp;
        C.kufiLine(ctx, 'نلتقي اليوم', 540, 606, t, T.kicker, { size:38, weight:600, tracking:12, fill:'#FFF6E0' });
        [-170, 170].forEach(dx=>{
          ctx.save(); ctx.translate(540+dx, 606); ctx.rotate(Math.PI/4);
          ctx.fillStyle='#F0B93A'; ctx.fillRect(-5,-5,10,10); ctx.restore();
        });
      }
      C.drawWordsEcho(ctx, ['نحتفي'], 540, 716, t, T.hero1, { size:150, dir:'left', dist:230, glow:'rgba(240,185,58,0.95)', back:true, maxW:820 });
      C.drawWordsEcho(ctx, ['بنجوم'], 540, 846, t, T.hero2, { size:164, dir:'right', dist:230, glow:'rgba(240,185,58,0.95)', maxW:820 });
      C.drawWordsEcho(ctx, ['الصف','الرابع'], 540, 976, t, T.hero3, { size:118, dir:'left', dist:200, glow:'rgba(240,185,58,0.9)', maxW:760 });
      ctx.restore();
    }
    /* الوسام المولّد */
    if (IMGS.rosette && t>T.rosette-0.05){
      const rp = C.seg(t, T.rosette, 0.75, E.outBackBig);
      const ra = (1 - C.seg(t, T.heroOut, 0.55)) * C.clamp01(rp*1.3);
      if (ra>0.01){
        ctx.save(); ctx.globalCompositeOperation='screen';
        ctx.globalAlpha = ra;
        ctx.translate(252, 730 + heroY);
        ctx.rotate((1-rp)*2.1 + 0.04*Math.sin(t*1.6));
        const sc = 0.44*(0.35+0.65*rp);
        ctx.scale(sc, sc);
        ctx.drawImage(IMGS.rosette, -250, -250, 500, 500);
        ctx.restore();
      }
    }

    /* ---------- لوحة المثابرة ---------- */
    const patIn = C.seg(t, T.pat1-0.15, 0.4, E.outBack);
    if (patIn>0){
      ctx.save();
      ctx.globalAlpha = patIn * (1 - C.seg(t, T.recess, 0.7));
      C.foilFrame(ctx, 170, 810, 740, 290, t, T.pat1-0.15, { r:22, w:2.5, sheen: t<11 });
      C.kufiLine(ctx, 'جعلوا من المثابرة طريقًا للتفوق', 540, 905, t, T.pat1, { size:44, weight:600, tracking:11, maxW:660, fill:'#FFF6E0' });
      const op2 = C.seg(t, T.patOrn, 0.4);
      if (op2>0){ ctx.globalAlpha = patIn*op2; ctx.strokeStyle='#F0B93A'; ctx.lineWidth=2; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(390,955); ctx.lineTo(390+80*op2,955); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(690,955); ctx.lineTo(690-80*op2,955); ctx.stroke();
        ctx.save(); ctx.translate(540,955); ctx.rotate(Math.PI/4); ctx.fillStyle='#F0B93A'; ctx.fillRect(-6,-6,12,12); ctx.restore(); }
      C.kufiLine(ctx, 'ومن الطموح بدايةً لمستقبلٍ مشرق', 540, 1035, t, T.pat2, { size:44, weight:600, tracking:11, maxW:660, fill:'#F9DC8A', alpha:patIn });
      ctx.restore();
    }

    /* ---------- الرحلة الثانية ---------- */
    const r2h = {};
    C.drawRibbon(ctx, rib2Path, t, T.rib2, 1.05, { headRef: r2h, w:8 });

    /* ---------- جدار الشرف ---------- */
    if (t>T.wall-0.1){
      const dimOthers = 0.45*C.seg(t, T.hb[0]-0.2, 0.5) ;
      for (const sl of SLOTS){
        const tin = T.wall + sl.i*T.slotStep;
        const wake = C.seg(t, tin, 0.55, E.outBackBig);
        const sel = (sl.i===0) ? C.seg(t, T.rib3, 0.4) : 0;
        drawSlot(ctx, sl.x, sl.y, 118, 150, wake, sel, t, sl.i);
        if (dimOthers>0 && sl.i!==0){
          ctx.save(); ctx.globalAlpha = dimOthers*0.5;
          ctx.fillStyle = '#04060F';
          C.rr(ctx, sl.x-64, sl.y-80, 128, 160, 18); ctx.fill();
          ctx.restore();
        }
      }
    }

    /* ---------- الوشاح المبارك ---------- */
    if (t>T.sash-0.05){
      const sp = C.seg(t, T.sash, 0.7, E.outCubic);
      const so = C.seg(t, T.sashOut, 0.5, E.inOutSine);
      const a = C.clamp01(sp*1.4) * (1-so);
      if (a>0.01){
        ctx.save();
        ctx.translate(560 + 30*Math.sin(t*0.8), 560 - 40*so);
        ctx.rotate(-7*Math.PI/180);
        ctx.globalAlpha = a;
        const uw = 940*(0.02+0.98*sp), sh = 150;
        /* ظل */
        ctx.fillStyle='rgba(3,6,18,0.35)'; C.rr(ctx, -uw/2+10, -sh/2+16, uw, sh, 12); ctx.fill();
        /* الشريط */
        const sg = ctx.createLinearGradient(0,-sh/2,0,sh/2);
        sg.addColorStop(0,'#FFE9A8'); sg.addColorStop(0.5,'#F5C542'); sg.addColorStop(1,'#D99A12');
        ctx.fillStyle = sg; C.rr(ctx, -uw/2, -sh/2, uw, sh, 12); ctx.fill();
        ctx.strokeStyle='rgba(142,86,8,0.7)'; ctx.lineWidth=3; C.rr(ctx, -uw/2, -sh/2, uw, sh, 12); ctx.stroke();
        ctx.strokeStyle='rgba(255,250,230,0.7)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(-uw/2+14, -sh/2+12); ctx.lineTo(uw/2-14, -sh/2+12); ctx.stroke();
        /* لمعة عابرة */
        const shx = -500 + 1100*(((t-T.sash)*0.5)%1.6);
        ctx.save(); C.rr(ctx, -uw/2, -sh/2, uw, sh, 12); ctx.clip();
        const lg = ctx.createLinearGradient(shx-70,0,shx+70,0);
        lg.addColorStop(0,'rgba(255,255,255,0)'); lg.addColorStop(0.5,'rgba(255,255,255,0.5)'); lg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle = lg; ctx.fillRect(shx-70, -sh/2, 140, sh);
        ctx.restore();
        /* النص */
        C.drawWordsSpring(ctx, ['نبارك','لأوائل','الصف','الرابع'], 0, 8, t, T.sashTxt,
          { size:66, stagger:0.1, maxW:uw-120, fill:INK, glow:'rgba(255,250,230,0.35)', bob:1.6, yoff:46 });
        ctx.restore();
        /* الذيل الصغير */
        C.kufiLine(ctx, 'هذا الإنجاز الجميل', 560, 690, t, T.sashTail, T.sashOut, { size:38, weight:600, tracking:10, fill:'#FFF6E0' });
      }
    }

    /* ---------- اللفة حول اللوح الأول + نبض الترقب ---------- */
    const r3h = {};
    C.drawRibbon(ctx, rib3Path, t, T.rib3, 1.1, { headRef: r3h, w:6 });
    if (t>T.rib3){
      const s1 = SLOTS[0];
      /* نبضات القلب */
      for (const hbt of T.hb){
        const hp2 = C.seg(t, hbt, 0.5, E.outCubic);
        if (hp2>0&&hp2<1){
          ctx.globalAlpha = (1-hp2)*0.85;
          ctx.strokeStyle = '#FFE9A8';
          C.ring(ctx, s1.x, s1.y, 40+120*hp2, 5*(1-hp2)+1);
          ctx.globalAlpha = 1;
        }
      }
      /* كيكر */
      C.kufiLine(ctx, 'نبدأ بنجوم الترتيب الأول', 815, 310, t, T.kicker2, null, { size:40, weight:700, tracking:12, fill:'#F9DC8A', glow:'rgba(240,185,58,0.7)' });
      /* توهج احتوائي قبل الاشتعال */
      const pf = C.seg(t, T.preFlash, 0.45, E.inCubic);
      if (pf>0){
        ctx.save(); ctx.globalCompositeOperation='screen';
        ctx.globalAlpha = pf;
        const pg = ctx.createRadialGradient(s1.x,s1.y,2, s1.x,s1.y, 190);
        pg.addColorStop(0,'rgba(255,255,255,0.95)'); pg.addColorStop(0.4,'rgba(255,233,168,0.6)'); pg.addColorStop(1,'rgba(240,185,58,0)');
        ctx.fillStyle = pg; C.circle(ctx, s1.x, s1.y, 190);
        /* أشعة دوارة */
        ctx.translate(s1.x, s1.y); ctx.rotate(t*2.2);
        ctx.fillStyle = 'rgba(255,240,200,0.5)';
        for (let i=0;i<6;i++){ ctx.rotate(TAU/6); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-7,-150); ctx.lineTo(7,-150); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        bIn(ctx, t);
      }
    }

    ctx.restore(); /* نهاية العالم */

    /* ---------- جسيمات فوقية ---------- */
    if (t>T.slam) bSlam(ctx, t);
    if (t>6.55) bCrest(ctx, t);
    if (t>T.rosette) bRose(ctx, t);
    if (t>T.burstStars) bStars(ctx, t);

    /* غبار أمامي */
    if (skyA>0){ ctx.save(); ctx.translate(-cmx*0.3, -cmy*0.3); dust(ctx, t, 0.85*skyA); ctx.restore(); }

    /* ومضة الانفجار الافتتاحية (بوستر مولّد) */
    const exFlash = Math.pow(Math.max(0, 1-(t-T.slam)/0.55), 2) * C.clamp01((t-T.slam)*30);
    if (IMGS.burst && exFlash>0.01){
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=Math.min(0.95, exFlash*1.4);
      const s = 1 + C.seg(t, T.slam, 0.8)*0.7;
      ctx.translate(600,1360); ctx.scale(s,s); ctx.translate(-540,-860);
      C.cover(ctx, IMGS.burst, 0, 0, 1080, 1720, 1.0);
      ctx.restore();
    }

    /* شرائح السرعة في الرحلات */
    C.speedStreaks(ctx, t, 5.05, 1.05, 313, 14);
    C.speedStreaks(ctx, t, 12.45, 1.2, 717, 14);
    C.speedStreaks(ctx, t, T.rib3, 1.0, 919, 8);

    /* ================= أثاث الإنتاج الدائم ================= */
    const furA = 0.62*C.seg(t, 1.2, 1.0) * (1 - C.seg(t, T.preFlash, 0.5));
    if (furA>0.01){
      ctx.save(); ctx.globalAlpha = furA;
      ctx.strokeStyle='rgba(240,185,58,0.9)'; ctx.lineWidth=1.4; ctx.strokeRect(26,26,1028,1868);
      ctx.strokeStyle='rgba(240,185,58,0.5)'; ctx.lineWidth=0.8; ctx.strokeRect(34,34,1012,1852);
      /* نجوم زوايا */
      ctx.fillStyle='#F0B93A';
      [[26,26],[1054,26],[26,1894],[1054,1894]].forEach((cc2,i)=>{
        const tw2 = 0.6+0.4*Math.sin(t*2.4+i*1.5);
        ctx.globalAlpha = furA*tw2;
        C.star(ctx, cc2[0], cc2[1], 9, t*0.4, 0.45);
      });
      ctx.globalAlpha = furA;
      if (t>6.6){
        ctx.font = '600 24px Kufi'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(249,220,138,0.85)';
        ctx.fillText('مدرسة سبعة أكتوبر', 540, 62);
        ctx.font = '600 21px Kufi';
        ctx.fillStyle='rgba(255,246,224,0.55)';
        ctx.textAlign='right'; ctx.fillText('فيلم تكريم أوائل الصف الرابع', 1036, 1860);
        ctx.textAlign='left'; ctx.fillText('١٤٤٧هـ', 46, 1860);
      }
      ctx.restore();
    }

    /* ---------- الفلاشات ---------- */
    const cut = C.seg(t, T.cut, 0.14, E.outCubic) ;
    const flash = Math.min(1, exFlash*0.5 + (t>T.cut && t<T.cut+0.3 ? (t<T.cut+0.14? cut : 1-C.seg(t,T.cut+0.14,0.16))*0.95 : 0));
    if (flash>0.01){ ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=Math.min(0.95,flash); ctx.fillStyle='#FFF3C4'; ctx.fillRect(0,0,W,H); ctx.restore(); }

    /* فينييت */
    C.vignette(ctx, 0.42 + 0.25*C.seg(t, 19.2, 0.8));
  }
  return scene;
})();

/* ================= مؤثرات صوتية الفصل ================= */
window.CUES = [
  [0.05,'riser',0.55],[0.12,'whoosh',0.60],[0.62,'boom',0.90],[1.00,'shimmer',0.40],
  [1.20,'tick',0.45],[1.35,'tick',0.45],[1.50,'tick',0.45],[1.65,'tick',0.45],[1.80,'tick',0.45],
  [2.70,'chime',0.45],[2.95,'whoosh',0.35],
  [4.90,'whoosh',0.55],[5.20,'whoosh',0.95],[5.55,'chime',0.85],[5.95,'tick',0.50],[6.20,'shimmer',0.60],[6.55,'chime',0.40],
  [6.90,'tick',0.40],[7.30,'boom',0.70],[7.75,'boom',0.70],[8.35,'boom',0.75],[8.55,'chime',0.80],[9.00,'shimmer',0.45],[9.65,'whoosh',0.50],
  [9.95,'paper',0.35],[10.85,'paper',0.35],[11.95,'whoosh',0.45],[12.45,'whoosh',0.90],
  [12.85,'tick',0.35],[13.02,'tick',0.35],[13.19,'tick',0.35],[13.36,'tick',0.35],[13.53,'tick',0.35],[13.70,'tick',0.35],[13.87,'tick',0.35],
  [13.95,'shimmer',0.55],[14.40,'paper',0.50],[15.00,'chime',0.70],[15.80,'tick',0.45],
  [16.70,'whoosh',0.50],[17.40,'whoosh',0.80],
  [17.60,'tick',0.65],[18.00,'chime',0.50],[18.15,'tick',0.70],[18.60,'tick',0.75],
  [19.20,'riser',0.80],[19.50,'shimmer',0.50],[19.93,'boom',0.90]
];
