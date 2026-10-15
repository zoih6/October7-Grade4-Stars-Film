/* ═══ p1v2 — الجزء الأول (0–23ث) مبني على core3/kt/kit: شرارة → شعار → مكتبة → منصة «1» → بطاقتين ═══
   العمود الفقري: نقطة ذهبية واحدة تتحوّل وتقود كل انتقال · نوابض بيتية فقط · دخول/خروج معياري */
'use strict';
(function(){
  const C3=window.Core3, KT=window.KT, O7=window.O7, PAL=O7.PAL;
  const clamp=C3.clamp, lerp=C3.lerp, E=C3.E, CURVE=C3.CURVE, kf=C3.kf, tw=C3.tw, sp=C3.sp, kash=KT.kash;
  const SHOTS=C3.SHOTS, INITS=C3.INITS;
  const W=1080, H=1920, CX=540;

  // كلمات الفيلم (تُرسم مرة واحدة)
  const Wd={};
  // الإشارات الصوتية — مشتقة من النوابض نفسها (ارصد: ذروة نوابض card≈+0.13/land≈+0.45 · snap≈+0.09/+0.28 · pop≈+0.11/+0.40)
  window.CUES=[
    [0.90,'shimmer',.45],[1.35,'shimmer',.4],[2.55,'shimmer',.38],
    [4.98,'whoosh',.75],
    [6.85,'boom',.85],[7.75,'boom',.8],
    [9.02,'whoosh',.6],[9.35,'boom',.5],
    [10.62,'boom',.95],[11.34,'chime',.55],[11.85,'riser',.5],
    [15.22,'tick',.45],[15.77,'tick',.45],[16.32,'tick',.45],[16.87,'tick',.45],
    [17.45,'boom',1.0],[17.48,'whoosh',.8],
    [18.02,'shimmer',.5],[18.85,'chime',.6],[19.32,'chime',.65],
    [20.50,'whoosh',.75],[21.55,'chime',.55],[22.05,'chime',.5]
  ];

  INITS.push(async()=>{
    Wd.kick=KT.word('مِن مدرسةِ سبعةِ أكتوبر',{size:54,font:'Cairo',weight:600,style:'glow',color:'#EFE0B4'});
    Wd.nuj=KT.word('نجومُ',{size:150,font:'Cairo',weight:1000,style:'gold3d',glow:.4});
    Wd.saf=KT.word('الصفِّ الرابع',{size:128,font:'Cairo',weight:1000,style:'gold3d',glow:.4});
    Wd.p1=KT.word('في رحابِ العلمِ',{size:96,font:'Rakkas',weight:400,style:'glow',color:'#F9ECC2'});
    Wd.p2=KT.word('تُزهِرُ الأحلام',{size:96,font:'Rakkas',weight:400,style:'glow',color:'#F9ECC2'});
    Wd.scl=KT.word('معًا نصنعُ المستقبل',{size:42,font:'Kufi',weight:600,style:'glow',color:'rgba(246,227,176,.95)',glowColor:'rgba(255,220,140,.35)'});
    Wd.nal=KT.word('ومِن بينها نلتقي…',{size:58,font:'Kufi',weight:600,style:'glow',color:'#F6E3B0'});
    Wd.qim=KT.word('ومَن يعلو على القِمَم',{size:64,font:'Kufi',weight:700,style:'glow',color:'#FFEDB8'});
    Wd.one=KT.word('1',{size:660,font:'Cairo',weight:1000,style:'gold3d',glow:.35,depth:56});
    // بطاقتا الجزء الأول
    Wd.pm=O7.plaque('معتز أحمد حمود قائد','الترتيبُ الأول',{size:62,subSize:34,minW:880});
    Wd.mm=O7.medalimg(1,{crown:true,r:96});
    Wd.pj=O7.plaque('مؤيد جميل محمد أحمد','الأولُ مكرَّر',{size:62,subSize:34,minW:880});
    Wd.mj=O7.medalimg(1,{crown:false,r:96});
  });

  const A=()=>C3.A;

  /* ── S0 · 0–5.0 : الشرارة تتحوّل شعارًا؛ القصيدة تُكتب ── */
  SHOTS.push({a:0,b:5.0,tin:'cut',draw:(t)=>{
    const g=window.__g; O7.stage(g);
    // الشرارة → مذنّب → قرص ذهبي → قزحية الشعار
    KT.dot(g,t,0.9,CX,980,{r:13,t1:1.55});
    KT.comet(g,t,1.0,CX,980,300,120,{dur:.5,arc:Math.PI*1.1,r:8});
    const kg=tw(t,1.35,1.8,CURVE.premium);      // نمو القرص
    const kp=tw(t,1.52,2.05,CURVE.premium);      // القزحية: الصورة تتبع
    const rD=lerp(0,640,kg), rI=lerp(0,720,kp);
    if(kg>0&&rI<719){
      g.save(); g.fillStyle=PAL.gold; g.beginPath(); g.arc(CX,980,rD,0,C3.TAU); g.fill(); g.restore();
    }
    if(kp>0){
      g.save(); g.beginPath(); g.arc(CX,980,Math.max(0,rI),0,C3.TAU); g.clip();
      if(A().emblem) C3.cover(g,A().emblem,0,0,W,H,{s:lerp(1.24,1.0,tw(t,1.52,4.6)),fx:.5,fy:.5});
      g.restore();
    }
    O7.rays(g,t,{n:4,int:.13});
    O7.dust(g,t,{n:80,fall:10,maxA:.5});
    // القصيدة ككلمات تُكتب مع رأس ضوء
    // (mask-rtl: ظهور سطرًا سطرًا بكشف ناعم + بريق على حدّ الكشف)
    const drp=C3.breathe(3,t,.7);
    KT.show(g,Wd.p1,t,{x:CX+drp[0]*0,y:620,t0:2.35,in:'wipe',durIn:1.05,sc:1,seed:3});
    KT.show(g,Wd.p2,t,{x:CX,y:790,t0:3.15,in:'wipe',durIn:1.05,seed:5});
    // خط ذهبي ينمو تحتها
    const kl=tw(t,4.1,4.65,CURVE.signature);
    if(kl>0){ g.save(); g.globalAlpha=kl*.9;
      const gr=g.createLinearGradient(CX-330*kl,0,CX+330*kl,0);
      gr.addColorStop(0,'rgba(201,168,106,0)'); gr.addColorStop(.5,'rgba(255,233,168,.95)'); gr.addColorStop(1,'rgba(201,168,106,0)');
      g.fillStyle=gr; g.fillRect(CX-330*kl,870,660*kl,3); g.restore(); }
    KT.show(g,Wd.scl,t,{x:CX,y:960,t0:4.35,in:'rise',dist:34,spring:'card'});
  }});

  /* ── S1 · 5.0–9.0 : المكتبة — العنوانان يهبطان بنبض الأبطال ── */
  SHOTS.push({a:5.0,b:9.0,tin:'whip',whipDir:-1,draw:(t)=>{
    const g=window.__g;
    if(A().library) C3.plate(g,W,H,A().library,t,{s:[[5.0,1.20],[8.9,1.06]],fx:[[5,.5],[9,.5]],fy:[[5,.44],[9,.52]]});
    O7.rays(g,t,{n:5,int:.16,ang:.5});
    O7.dust(g,t,{n:110,fall:14,maxA:.55,seed:43});
    // اهتزاز الهبوط
    const sh1=C3.shake(t,6.7,7), sh2=C3.shake(t,7.7,8);
    g.save(); g.translate(sh1+sh2, C3.shake(t,6.7,5,53)+C3.shake(t,7.7,6,49));
    KT.show(g,Wd.kick,t,{x:CX,y:430,t0:5.75,in:'wipe',durIn:1.3});
    KT.show(g,Wd.nuj,t,{x:CX,y:680,t0:6.6,in:'pop',spring:'pop',t1:8.62,out:'lift',outDur:.3});
    KT.show(g,Wd.saf,t,{x:CX,y:935,t0:7.55,in:'mask',spring:'snap',t1:8.68,out:'lift',outDur:.28});
    g.restore();
    // مذنّب كنس ضوئي يعبر العنوانين
    KT.comet(g,t,8.2,CX,805,560,140,{dur:.75,arc:Math.PI,r:6,a0:0});
  }});

  /* ── S2 · 9.0–15.0 : المنصة — «1» يهبط بطلًا، التاج يتبع، مدار الشرارة ── */
  SHOTS.push({a:9.0,b:15.0,tin:'band',accent:'#C9A86A',focus:[540,760],draw:(t)=>{
    const g=window.__g;
    if(A().pedestal) C3.plate(g,W,H,A().pedestal,t,{s:[[9,1.05],[14.9,1.13]],fx:[[9,.5],[15,.5]],fy:[[9,.5],[15,.56]]});
    O7.rays(g,t,{n:4,int:.14,ang:.4});
    O7.dust(g,t,{n:120,fall:12,maxA:.5,seed:45});
    const shC=C3.shake(t,10.62,9), shC2=C3.shake(t,10.62,6,51);
    g.save(); g.translate(shC,shC2);
    // «1» بطل من خارج الإطار العلوي
    const kp=sp(t,9.9,'pop');
    if(kp>0){
      const y=lerp(-950,718,clamp(kp)), pul=t>13.2?1+.045*Math.sin(t*4.4):1;
      KT.show(g,Wd.one,t,{x:CX,y:y,t0:0,in:'rise',dist:0,spring:'card',sc:pul,fade:C3.clamp((t-9.9)/.3)});
    }
    // انفجار الهبوط
    if(t>10.6&&t<11.3){
      const kk=(t-10.6)/.7, rr=C3.rng(505);
      g.save(); g.globalCompositeOperation='lighter';
      for(let i=0;i<54;i++){ const an=rr()*C3.TAU,v=520*(.45+rr()*.8),ee=E.cubicOut(kk);
        g.fillStyle=`rgba(255,215,150,${(1-ee)*.65})`;
        g.beginPath(); g.arc(CX+Math.cos(an)*v*ee,1185+Math.sin(an)*v*ee*.7-40*ee,4.4*(0.5+rr()*.8)*(1-ee*.6),0,C3.TAU); g.fill(); }
      g.restore(); }
    // التاج يسقط فوق «1» (أصل بألفا جاهزة)
    if(C3.A.crownA&&t>11.2){
      const k=sp(t,11.2,'card'), im=C3.A.crownA, cw=430, ch=cw*im.naturalHeight/im.naturalWidth;
      const y=lerp(-300,300,E.backOut(clamp(k*1.15)));
      g.save(); g.globalAlpha=clamp(k*1.5);
      g.drawImage(im,CX-cw/2,y-ch*.5,cw,ch); g.restore();
      if(t>11.2&&t<12.05){ const kk=(t-11.2)/.85, rr=C3.rng(606);
        g.save(); g.globalCompositeOperation='lighter';
        for(let i=0;i<26;i++){ const an=rr()*C3.TAU,v=300*(.4+rr()*.9),ee=E.cubicOut(kk);
          g.fillStyle=`rgba(255,230,160,${(1-ee)*.55})`;
          g.beginPath(); g.arc(CX+Math.cos(an)*v*ee,290+Math.sin(an)*v*ee*.6,3.4*(0.5+rr()*.8),0,C3.TAU); g.fill(); }
        g.restore(); } }
    // مدار شرارات حلقي حول الرقم
    if(t>11.05){
      const ra=E.backOut(clamp((t-11.05)/.7));
      const rr=C3.rng(7);
      g.save(); g.globalCompositeOperation='lighter'; g.lineCap='round';
      for(let i=0;i<44;i++){ const ph=rr()*C3.TAU, spO=.9+rr()*.8, sz=3.4*(.5+rr());
        const a=ph+t*spO*1.15, wob=Math.sin(t*1.7+i)*16;
        const x=CX+Math.cos(a)*(330*ra+wob), y=720+Math.sin(a)*(115*ra+wob*.35);
        const alpha=.8*(0.4+0.6*Math.abs(Math.sin(t*2+ph)))*ra;
        const da=.12, x2=CX+Math.cos(a-da)*(330*ra+wob), y2=720+Math.sin(a-da)*(115*ra+wob*.35);
        g.strokeStyle=`rgba(255,225,150,${alpha*.55})`; g.lineWidth=sz;
        g.beginPath(); g.moveTo(x2,y2); g.lineTo(x,y); g.stroke();
        g.fillStyle=`rgba(255,246,215,${alpha})`; g.beginPath(); g.arc(x,y,sz*.8,0,C3.TAU); g.fill(); }
      g.restore(); }
    KT.show(g,Wd.nal,t,{x:CX,y:1400,t0:12.2,in:'rise',dist:40,t1:14.2,out:'lift',outDur:.3});
    g.restore();
  }});

  /* ── S3 · 15.0–17.45 : العدّ — شحن الطاقة ثم الومضة ── */
  SHOTS.push({a:15.0,b:17.45,tin:'zoom',focus:[540,760],tdur:.35,draw:(t)=>{
    const g=window.__g;
    if(A().pedestal) C3.plate(g,W,H,A().pedestal,t,{s:[[15,1.13],[17.45,1.2]],fy:[[15,.56],[17.45,.6]]});
    O7.dust(g,t,{n:120,fall:20,maxA:.45,seed:47});
    // نبض الترقّب حول «1»
    const ticks=[15.22,15.77,16.32,16.87];
    for(const tk of ticks) KT.sparkle(g,t,tk,CX,760,{R:44,dur:.55,spin:2});
    // التوتّر: squash & charge
    const tension=tw(t,16.6,17.45,CURVE.accel);
    const sc=1+ .07*Math.sin(t*13)*tension;
    const shC=C3.shake(t,17.0,10*tension,55);
    g.save(); g.translate(shC,0);
    KT.show(g,Wd.one,t,{x:CX,y:718,t0:0,in:'rise',dist:0,sc,fade:1});
    g.restore();
    // عاصفة تجميع نحو الرقم
    const chg=clamp((t-15.0)/2.4), rr=C3.rng(88);
    g.save(); g.globalCompositeOperation='lighter';
    for(let i=0;i<80;i++){ const ph=rr()*C3.TAU,r0=(660+rr()*420)*(1-chg*.8),spP=2+rr()*2.4;
      const yy=718-((t*(150+rr()*130))%840);
      g.fillStyle=`rgba(255,225,155,${(.13+.4*chg)*(0.5+0.5*Math.sin(t*3+i))})`;
      g.beginPath(); g.arc(CX+Math.cos(ph+t*spP)*r0,yy,2.6*(0.5+rr()),0,C3.TAU); g.fill(); }
    g.restore();
    KT.show(g,Wd.qim,t,{x:CX,y:330,t0:15.15,in:'mask',durIn:.7});
  }});

  /* ── S4 · 17.45–20.5 : بطاقة معتز (قزحية الومضة تقودها) ── */
  SHOTS.push({a:17.45,b:20.5,tin:'flash',focus:[540,900],draw:(t)=>{
    const g=window.__g;
    if(A().skyhero) C3.plate(g,W,H,A().skyhero,t,{s:[[17.45,1.05],[20.4,1.1]],fy:[[17.45,.48],[20.4,.52]]});
    O7.rays(g,t,{n:3,int:.11});
    O7.dust(g,t,{n:100,fall:16,maxA:.45,seed:49});
    O7.studentCard(g,t,{t0:17.45,cutKey:'mutaz',pw:860,baseY:2000,cropT:.60,plateY:1656,plaqueW:Wd.pm,medalW:Wd.mm,plateScale:1});
  }});

  /* ── S5 · 20.5–23.0 : بطاقة مؤيد ثم هدوء ── */
  SHOTS.push({a:20.5,b:23.0,tin:'whip',whipDir:-1,draw:(t)=>{
    const g=window.__g;
    if(A().moon) C3.plate(g,W,H,A().moon,t,{s:[[20.5,1.04],[22.9,1.08]],fy:[[20.5,.42],[23,.46]]});
    O7.dust(g,t,{n:110,fall:5,maxA:.4,r:2.1,seed:53});
    O7.studentCard(g,t,{t0:20.5,cutKey:'moyed',pw:840,baseY:2000,cropT:.60,plateY:1656,plaqueW:Wd.pj,medalW:Wd.mj,plateScale:1});
    if(t>22.5){ g.save(); g.fillStyle=`rgba(4,6,15,${clamp((t-22.5)/.5)})`; g.fillRect(0,0,W,H); g.restore(); }
  }});

  // حقن g العام (رسم المشهد بلا تمرير متكرر)
  const origDraw=window.Core3.drawFrame;
  window.Core3.drawFrame=function(ctx,t){ window.__g=ctx; origDraw(ctx,t); };
})();
