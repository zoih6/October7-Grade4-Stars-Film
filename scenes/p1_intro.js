/* p1_intro.js — الجزء الأول: الافتتاحية الملحمية (0–23ث) — شعار من الغبار، قصيدة تتكشّف، قاعة المكتبة، الرقم ١ بالتاج، بطاقتا معتز ومؤيد */
(function(){
  const W=1080, H=1920;
  const TAU=Math.PI*2;
  window.Scenes=window.Scenes||{};

  /* جدول المؤثرات الصوتية (يقرأه render.js → make_audio.py) */
  window.CUES=[
    [0.5,'shimmer',.5],[1.8,'shimmer',.42],
    [5.0,'whoosh',.72],
    [6.7,'boom',.8],[7.7,'boom',.85],
    [9.0,'whoosh',.72],
    [11.0,'boom',.92],[11.7,'chime',.55],
    [12.05,'riser',.5],
    [15.2,'tick',.45],[15.75,'tick',.45],[16.3,'tick',.45],[16.85,'tick',.45],
    [17.45,'boom',1.0],[17.5,'whoosh',.85],
    [18.0,'shimmer',.55],[19.3,'chime',.75],[19.55,'shimmer',.4],
    [20.5,'whoosh',.75],[21.5,'chime',.55],[21.85,'chime',.5]
  ];

  /* ---------- أدوات داخلية ---------- */
  let R=null;
  function sparksOrbit(ctx,cx,cy,rx,ry,t,n,seed,opt){
    opt=opt||{};
    const rr=Core.mulberry32(seed);
    ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
    for(let i=0;i<n;i++){
      const ph=rr()*TAU, sp=(opt.speed||.55)*(0.7+rr()*.6), sz=(opt.size||3)*(0.5+rr());
      const a=ph+t*sp+(opt.phase||0);
      const wob=Math.sin(t*1.7+i)*((opt.wobble||10));
      const x=cx+Math.cos(a)*(rx+wob), y=cy+Math.sin(a)*(ry+wob*.35);
      const alpha=(opt.alpha||.8)*(0.4+0.6*Math.abs(Math.sin(t*2+ph)));
      /* ذيل قصير على المسار */
      const da=.12;
      const x2=cx+Math.cos(a-da)*(rx+wob), y2=cy+Math.sin(a-da)*(ry+wob*.35);
      ctx.strokeStyle=`rgba(255,225,150,${alpha*.55})`; ctx.lineWidth=sz;
      ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x,y); ctx.stroke();
      ctx.fillStyle=`rgba(255,246,215,${alpha})`;
      ctx.beginPath(); ctx.arc(x,y,sz*.8,0,TAU); ctx.fill();
    }
    ctx.restore();
  }
  function puff(ctx,x,y,prog,seed,n,opt){
    opt=opt||{};
    const p=Core.clamp01(prog); if(p<=0.001||p>=1) return;
    const e=Core.E.outCubic(p);
    const rr=Core.mulberry32(seed);
    ctx.save(); ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){
      const ang=rr()*TAU, v=(opt.speed||320)*(0.45+rr()*.8);
      const px=x+Math.cos(ang)*v*e, py=y+Math.sin(ang)*v*e*.72 - e*40;
      const r=(opt.r||4)*(1-e*.7)*(0.6+rr()*.7);
      ctx.fillStyle=`rgba(255,${210+(rr()*30|0)},150,${(opt.alpha||.7)*(1-e)})`;
      ctx.beginPath(); ctx.arc(px,py,Math.max(.5,r),0,TAU); ctx.fill();
    }
    ctx.restore();
  }
  function topCone(ctx,alpha){
    ctx.save(); ctx.globalCompositeOperation='screen';
    const g=ctx.createRadialGradient(540,-120,60,540,-120,1150);
    g.addColorStop(0,`rgba(255,232,170,${alpha})`); g.addColorStop(.45,`rgba(255,215,140,${alpha*.3})`); g.addColorStop(1,'rgba(255,210,130,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.restore();
  }
  function flash(ctx,a){ if(a<=0)return; ctx.save(); ctx.fillStyle=`rgba(255,252,240,${a})`; ctx.fillRect(0,0,W,H); ctx.restore(); }
  function shake(t,t0,dur,amp){ const p=Core.clamp01((t-t0)/dur); if(p<=0||p>=1) return [0,0];
    const d=1-p; return [Math.sin(t*61)*amp*d, Math.cos(t*47)*amp*d*.8]; }

  /* خلفية تحميل آمنة */
  function BG(ctx,img,W,H,o){ if(img&&img.naturalWidth) Cinema.bgCamera(ctx,img,W,H,o); else { ctx.fillStyle='#0A1931'; ctx.fillRect(0,0,W,H); } }

  /* بطاقة طالب (الخلفية مرسومة خارجها) */
  function studentCard(ctx,t,IMG,o){
    // o: {key,name,sub,medal,tIn,crown,plateY}
    const tIn=o.tIn;
    /* الإطار */
    Cinema.cardFrame(ctx,W,H,{margin:58,appear:Core.clamp01((t-tIn-.15)/.55),spin:t*.3});
    /* البورتريه: صعود من الأسفل — قصّ علوي (صدر فأعلى) */
    const im=IMG[o.key];
    if(im&&im.naturalWidth){
      const p=Core.E.outBack(Core.clamp01((t-tIn-.3)/1.0));
      const cropT=o.cropTop!=null?o.cropTop:0.60;
      const sw=im.naturalWidth, sh=im.naturalHeight*cropT;
      const pw=o.pw||780, ph=pw*(sh/sw);
      const baseY=o.portraitY!=null?o.portraitY:1990;
      const yoff=(1-p)*430;
      ctx.save();
      ctx.globalAlpha=Core.clamp01(p*1.5);
      /* توهج أرضي دافئ */
      ctx.save(); ctx.globalCompositeOperation='lighter';
      const fg=ctx.createRadialGradient(540,1990-90,20,540,1990-90,600);
      fg.addColorStop(0,'rgba(255,220,150,.28)'); fg.addColorStop(1,'rgba(255,220,150,0)');
      ctx.fillStyle=fg; ctx.fillRect(0,1990-560,W,640); ctx.restore();
      ctx.drawImage(im, 0,0,sw,sh, 540-pw/2, baseY-ph+yoff, pw, ph);
      ctx.restore();
    }
    /* لوحة الاسم + ميدالية */
    const ap=Core.E.outCubic(Core.clamp01((t-tIn-.85)/.6));
    const py=o.plateY||1656;
    if(ap>0){
      Cinema.namePlate(ctx,540,py,{name:o.name,sub:o.sub,size:o.size||60,subSize:34,width:o.plateW||880,height:200,appear:ap,spin:t*.4,sweep:(t>tIn+1.3&&t<tIn+2.1)?(t-(tIn+1.3))/.8:null,maxTextW:700});
      const mp=Core.E.outBack(Core.clamp01((t-tIn-1.15)/.5));
      if(mp>0){
        ctx.save(); ctx.translate(540+(o.plateW||880)/2-30, py-96);
        ctx.scale(mp,mp); ctx.translate(-0,-0);
        Cinema.rankMedal(ctx,0,0,{n:o.medal,r:92,appear:1,laurel:IMG.laurel,crown:o.crown?IMG.crown:null,spin:t*.35});
        ctx.restore();
        /* شرارة ظهور الميدالية */
        const mp2=Core.clamp01((t-tIn-1.15)/.5);
        if(mp2<1) puff(ctx,540+(o.plateW||880)/2-30,py-96,mp2,911,26,{speed:380,r:4,alpha:.65});
      }
    }
  }

  /* ---------- المشهد الرئيسي ---------- */
  window.Scenes.p1=function(ctx,t,IMG){
    const E=Core.E, C1=Core.clamp01, seg=Core.seg;
    ctx.fillStyle='#04060F'; ctx.fillRect(0,0,W,H);

    /* ================= SEG0: الفراغ والشعار (0–5.0) ================= */
    if(t<5.45){
      const eA=E.outCubic(C1((t-0.2)/1.6)); // ظهور الشعار
      /* الشعار يتجمّع: يكبر من 1.28 إلى 1 مع توهج */
      if(IMG.emblem){
        const s=1.30-0.30*eA;
        ctx.save();
        ctx.translate(W/2,H/2); ctx.scale(s,s); ctx.translate(-W/2,-H/2);
        ctx.globalAlpha=Math.min(1,eA*1.2)*0.98;
        Core.cover(ctx,IMG.emblem,0,0,W,H);
        ctx.restore();
      } else { ctx.fillStyle='#0A1931'; ctx.fillRect(0,0,W,H); }
      /* دوامة غبار تتقارب نحو المركز */
      if(t<1.9){
        const pr=C1(t/1.9);
        const rr=Core.mulberry32(77);
        ctx.save(); ctx.globalCompositeOperation='lighter';
        for(let i=0;i<70;i++){
          const ph=rr()*TAU, rad=(1-pr*.85)*(900+rr()*500), sp=.9+rr();
          const a=ph+t*sp;
          const x=540+Math.cos(a)*rad, y=960+Math.sin(a)*rad*.9;
          const al=.5*(1-pr)*(.4+.6*Math.sin(t*3+i)**2);
          ctx.fillStyle=`rgba(255,220,150,${Math.max(0,al)})`;
          ctx.beginPath(); ctx.arc(x,y,2.4*(0.5+rr()),0,TAU); ctx.fill();
        }
        ctx.restore();
      }
      topCone(ctx,.5*eA);
      Cinema.godRays(ctx,W,H,t,{n:3,a:.10,alpha:eA});
      Cinema.goldDust(ctx,W,H,41,90,t,{fall:10,maxA:.5,r:2.6});
      /* القصيدة تتكشّف حرفًا حرفًا بتتبع ضوئي */
      if(t>1.8){
        /* تعتيم خفيف خلف النص */
        ctx.save();
        const dg=ctx.createRadialGradient(540,1300,80,540,1300,620);
        dg.addColorStop(0,'rgba(5,9,22,.38)'); dg.addColorStop(1,'rgba(5,9,22,0)');
        ctx.fillStyle=dg; ctx.fillRect(0,760,W,1080);
        ctx.restore();
        const prog=C1((t-1.8)/2.7);
        Cinema.traceText(ctx,'في رحابِ العلمِ تُزهِرُ الأحلام',540,1255,{size:88,prog,family:'Rakkas',weight:400,color:'#f9ecc2'});
        /* خط زخرفي تحت القصيدة ينمو */
        const lw=E.outCubic(C1((t-4.2)/.7));
        ctx.save(); ctx.globalAlpha=lw*.9;
        const lg=ctx.createLinearGradient(540-320*lw,0,540+320*lw,0);
        lg.addColorStop(0,'rgba(201,168,106,0)'); lg.addColorStop(.5,'rgba(255,233,168,.95)'); lg.addColorStop(1,'rgba(201,168,106,0)');
        ctx.fillStyle=lg; ctx.fillRect(540-320*lw,1333,640*lw,3);
        ctx.restore();
      }
      /* سطر المدرسة */
      if(t>4.25){
        const a=E.outCubic(C1((t-4.25)/.7));
        ctx.save(); ctx.globalAlpha=a;
        ctx.font='500 40px Kufi, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(246,227,176,.95)'; ctx.shadowColor='rgba(255,220,140,.35)'; ctx.shadowBlur=14;
        ctx.fillText('مدرسةُ سبعةِ أكتوبر — معًا نصنعُ المستقبل',540,1420);
        ctx.restore();
      }
    }

    /* ================= Whip 1 — إلى المكتبة (5.0–5.45) ================= */
    if(t>=5.0&&t<5.45){
      const {pan,blur}=Cinema.whipPan((t-5.0)/.45);
      /* القديم (شعار) يغادر يسارًا والجديد (مكتبة) يدخل من اليمين */
      if(IMG.library){
        const nx=W*1.15*(1-pan);
        Cinema.whipDraw(ctx,IMG.library,W,H,nx,blur,1.12);
      }
    }

    /* ================= SEG1: قاعة المكتبة (5.45–9.45) ================= */
    if(t>=5.45&&t<9.45){
      BG(ctx,IMG.library,W,H,{zoom:1.10+0.04*C1((t-5.45)/4),oy:-10*C1((t-5.45)/4)});
      Cinema.godRays(ctx,W,H,t,{n:5,a:.17,botW:.18});
      Cinema.goldDust(ctx,W,H,43,110,t,{fall:14,maxA:.55});
      /* العنوان الصغير يتكشّف */
      if(t>5.7){
        Cinema.traceText(ctx,'مِن مدرسةِ سبعةِ أكتوبر',540,430,{size:52,family:'Cairo',weight:600,prog:C1((t-5.7)/1.4),color:'#efe0b4'});
      }
      /* العنوانان الذهبيان العملاقان — هبوط مدوٍّ */
      const slams=[[6.7,'نجومُ',640,150],[7.7,'الصفِّ الرابع',900,150]];
      for(let i=0;i<slams.length;i++){
        const [tin,txt,yy,sz]=slams[i];
        const p=E.outBack(C1((t-tin)/.55));
        if(p<=0) continue;
        const yoff=(1-p)*-380;
        const scl=1.35-0.35*p;
        ctx.save();
        ctx.translate(540,yy+yoff); ctx.scale(scl,scl); ctx.translate(-540,-yy);
        ctx.globalAlpha=C1((t-tin)/.3);
        const sweep = (t>8.35&&t<9.15)?(t-8.35)/.8:null;
        Cinema.text3D(ctx,txt,540,yy,{size:sz,family:'Cairo',weight:1000,glow:.35,depth:sz*.085,maxW:1000,sweep});
        ctx.restore();
      }
      /* غبار الهبوط + اهتزاز الكاميرا */
      const [sx,sy]=shake(t,6.7,.5,7).map((v,i)=>v+shake(t,7.7,.5,8)[i]);
      if(Math.abs(sx)>0||Math.abs(sy)>0){ ctx.save(); ctx.translate(0,0); ctx.restore(); }
      if(t>6.7&&t<7.25) puff(ctx,540,640,(t-6.7)/.55,301,40,{speed:430,r:4.4,alpha:.6});
      if(t>7.7&&t<8.25) puff(ctx,540,900,(t-7.7)/.55,302,46,{speed:470,r:4.6,alpha:.6});
      /* اهتزاز الشاشة الفعلي: إعادة رسم الخلفية مزاحة حول الإطار */
      Core.vignette(ctx,.42);
    }

    /* ================= Whip 2 — إلى المنصة (9.0–9.45) ================= */
    if(t>=9.0&&t<9.45){
      const {pan,blur}=Cinema.whipPan((t-9.0)/.45);
      if(IMG.library) Cinema.whipDraw(ctx,IMG.library,W,H,-W*1.15*pan,blur,1.14);
      if(IMG.pedestal) Cinema.whipDraw(ctx,IMG.pedestal,W,H,W*1.15*(1-pan),blur,1.10);
    }

    /* ================= SEG2/3: المنصة والرقم ١ (9.45–17.45) ================= */
    if(t>=9.45&&t<17.5){
      const zoom=1.04+0.09*C1((t-9.45)/8);
      BG(ctx,IMG.pedestal,W,H,{zoom,oy:20*C1((t-9.45)/8)-24});
      Cinema.godRays(ctx,W,H,t,{n:4,a:.15,alpha:.9});
      Cinema.goldDust(ctx,W,H,45,120,t,{fall:12,maxA:.55});
      /* الرقم العملاق ١: ينزل من الأعلى ويحطّ على المنصة */
      const tDrop=9.9, land=11.0;
      const p=E.outBack(C1((t-tDrop)/1.1));
      const oneY=Core.lerp(-950,735,p);
      const spin = t>13.2 ? (t-13.2)*1.9 : 0;        // دوران Y متسارع في العد التنازلي
      const pulseG = t>12.0 ? .32+.14*Math.sin(t*4.2) : .20;
      ctx.save();
      const amp = t>land&&t<land+.5 ? 9*(1-(t-land)/.5) : (t>16.3? (t-16.3)*8:0);
      ctx.translate(Math.sin(t*57)*amp, Math.cos(t*49)*amp*.75);
      Cinema.text3D(ctx,'1',540,Core.lerp(-950,735,p),{size:660,family:'Cairo',weight:1000,depth:58,glow:pulseG,face:[[0,'#fffbe8'],[.25,'#ffe9a8'],[.55,'#ecc466'],[.8,'#c9a86a'],[1,'#8a6b32']],rotY:spin});
      ctx.restore();
      /* حلقة نارية مدارية حول الرقم */
      if(t>11.05){
        const ra=E.outBack(C1((t-11.05)/.7));
        sparksOrbit(ctx,540,735,(330+40*Math.sin(t*.8))*ra,120*ra,t,54,7,{speed:1.15,size:4,alpha:.85,wobble:16});
      }
      /* انفجار الغبار لحظة الهبوط */
      if(t>land&&t<land+.7) puff(ctx,540,1180,(t-land)/.7,505,60,{speed:560,r:5,alpha:.65});
      /* التاج يحط على الرقم */
      if(IMG.crown&&t>11.25){
        const pc=E.outBack(C1((t-11.25)/.85));
        const cw=430,ch=cw*(IMG.crown.naturalHeight/IMG.crown.naturalWidth);
        ctx.save(); ctx.globalCompositeOperation='screen';
        ctx.globalAlpha=Core.clamp01(pc*1.4);
        ctx.drawImage(IMG.crown, 540-cw/2, Core.lerp(-300,318,pc)-ch*.5, cw, ch);
        ctx.restore();
        if(t>11.25&&t<12.1) puff(ctx,540,330,(t-11.25)/.85,606,30,{speed:300,r:3.6,alpha:.6});
      }
      /* لوحة «ومن بينها نلتقي» */
      if(t>11.6&&t<15.0){
        const a=E.outCubic(C1((t-11.6)/.5));
        ctx.save(); ctx.globalAlpha=a*C1((14.9-t)/.4+.2);
        ctx.font='600 58px Kufi, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='#f6e3b0'; ctx.shadowColor='rgba(255,222,150,.5)'; ctx.shadowBlur=20;
        ctx.fillText('ومِن بينها نلتقي…',540,1395);
        ctx.restore();
      }
      /* SEG3: العدّ — «ومن يعلو على القمم» + شحن الطاقة */
      if(t>15.0){
        Cinema.traceText(ctx,'ومَن يعلو على القِمَم',540,330,{size:64,family:'Kufi',weight:700,prog:C1((t-15.1)/1.35),color:'#ffedb8'});
        /* عاصفة جسيمات تصاعدية تتقارب للرقم */
        const chg=C1((t-15.0)/2.4);
        const rr=Core.mulberry32(88);
        ctx.save(); ctx.globalCompositeOperation='lighter';
        for(let i=0;i<90;i++){
          const ph=rr()*TAU, r0=(680+rr()*420)*(1-chg*.78), sp=2+rr()*2.4;
          const yy=735-((t*(160+rr()*120))%860);
          const x=540+Math.cos(ph+t*sp)*r0;
          ctx.fillStyle=`rgba(255,225,155,${(.14+.4*chg)*(0.5+0.5*Math.sin(t*3+i))})`;
          ctx.beginPath(); ctx.arc(x,yy,2.6*(0.5+rr()),0,TAU); ctx.fill();
        }
        ctx.restore();
        /* ومضة الشحن */
        if(t>16.9) flash(ctx,(t-16.9)/.55*.85);
      }
    }

    /* ================= SEG4: بطاقة معتز (17.45–20.9) ================= */
    if(t>=17.45&&t<20.9){
      const cz=1.02+0.06*C1((t-17.45)/3.4);
      BG(ctx,IMG.skyhero,W,H,{zoom:cz,oy:-16});
      Cinema.godRays(ctx,W,H,t,{n:3,a:.13});
      Cinema.goldDust(ctx,W,H,47,100,t,{fall:16,maxA:.5});
      studentCard(ctx,t,IMG,{key:'mutaz',name:'معتز أحمد حمود قائد',sub:'الترتيبُ الأول',medal:1,tIn:17.45,crown:true,plateY:1650,portraitY:2010,plateW:940,pw:860});
    }

    /* ================= Whip 3 — إلى مؤيد (20.5–20.9) ================= */
    if(t>=20.5&&t<20.9){
      const {pan,blur}=Cinema.whipPan((t-20.5)/.4);
      if(IMG.moon) Cinema.whipDraw(ctx,IMG.moon,W,H,W*1.15*(1-pan),blur,1.08);
    }

    /* ================= SEG5: بطاقة مؤيد (20.9–23) ================= */
    if(t>=20.9){
      BG(ctx,IMG.moon,W,H,{zoom:1.02+0.05*C1((t-20.9)/2.1),oy:-30});
      Cinema.goldDust(ctx,W,H,49,110,t,{fall:6,maxA:.45,r:2.2});
      studentCard(ctx,t,IMG,{key:'moyed',name:'مؤيد جميل محمد أحمد',sub:'الأولُ مكرَّر',medal:1,tIn:20.9,crown:false,plateY:1650,portraitY:2010,plateW:940,pw:840});
      /* تلاشي نهاية الجزء */
      if(t>22.5){
        ctx.save(); ctx.fillStyle=`rgba(4,6,15,${C1((t-22.5)/.5)})`; ctx.fillRect(0,0,W,H); ctx.restore();
      }
    }

    /* ================= ومضة الانتقال (17.45) — فوق كل الطبقات ================= */
    if(t>=17.45&&t<17.75){
      flash(ctx,1-(t-17.45)/.3);
    }
  };
})();
