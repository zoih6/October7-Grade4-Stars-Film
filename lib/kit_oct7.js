/* ═══ نجوم أكتوبر · kit_oct7 — حُلّة الفيلم: لوحة مقفلة + خامات الأكاديمية + بطاقة الطالب ═══ */
'use strict';
window.O7=(function(){
  const C3=window.Core3, KT=window.KT, clamp=C3.clamp, lerp=C3.lerp, E=C3.E, CURVE=C3.CURVE, kf=C3.kf, TAU=C3.TAU;
  const PAL=window.PAL={
    bg:'#0A1931', bg2:'#051022', navy:'#122041', gold:'#C9A86A', goldL:'#F2D488', goldD:'#8a6b32',
    pearl:'#F6E9C8', white:'#FFFFFF', shadow:'rgba(2,4,14,.65)' };
  const A=()=>C3.A;
  let bgC=null;
  const INITS=C3.INITS;
  INITS.push(async()=>{
    bgC=C3.mk(1080,1920); { const x=bgC.getContext('2d'),gr=x.createRadialGradient(540,760,90,540,960,1500);
      gr.addColorStop(0,'#12234A'); gr.addColorStop(.5, PAL.bg); gr.addColorStop(1,'#040814');
      x.fillStyle=gr; x.fillRect(0,0,1080,1920); }
  });
  const stage=(g)=>{ g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(bgC,0,0); g.restore(); };
  // أصول الألفا الجاهزة (معالجة بايثون مسبقًا — لا تلويث للكانفس)
  const lauA=()=>C3.A.laurelA, crownA=()=>C3.A.crownA;

  // غبار ذهبي حجمي (بذور ثابتة، عمق z)
  function dust(g,t,{seed=41,n=100,fall=-8,maxA=.5,windX=0,r=2.4,alpha=1}={}){
    const R=C3.rng(seed),pts=[];
    for(let i=0;i<n;i++)pts.push({z:.35+R()*.65,bx:R()*1080,by:R()*1920,ph:R()*7,ph2:R()*5,tw:R()*12,rr:r*(0.6+R()*.8),sp:.2+R()*.4,spd:.13+R()*.3,big:R()>.92});
    g.save(); g.globalCompositeOperation='lighter'; g.globalAlpha=alpha;
    for(const p of pts){
      const drift=16*(1-p.z);
      const x=p.bx+Math.sin(t*p.sp+p.ph)*drift+windX*t*(1-p.z);
      const y=((p.by+Math.sin(t*p.spd+p.ph2)*drift*.8+1920+fall*t*p.z)%(1920+80))-40;
      const rad=p.rr*p.z, tw=.35+.65*Math.abs(Math.sin(t*1.4+p.tw)), a=maxA*tw*p.z;
      if(a<.02)continue;
      g.fillStyle=`rgba(255,220,150,${a})`;
      g.beginPath(); g.arc(x,y,rad,0,TAU); g.fill();
      if(p.big){ g.fillStyle=`rgba(255,248,225,${a*.85})`;
        g.save(); g.translate(x,y); g.rotate(t*.6+p.ph);
        g.beginPath(); const R4=rad*2.8,ir=R4*.28;
        g.moveTo(0,-R4); g.quadraticCurveTo(ir,-ir,R4,0); g.quadraticCurveTo(ir,ir,0,R4); g.quadraticCurveTo(-ir,ir,-R4,0); g.quadraticCurveTo(-ir,-ir,0,-R4);
        g.fill(); g.restore(); }
    }
    g.restore();
  }
  // أعمدة نور
  function rays(g,t,{x=540,y=-140,ang=.35,n=5,int=.15,spread=.6}={}){
    g.save(); g.globalCompositeOperation='screen';
    for(let i=0;i<n;i++){ const a=ang+(i-n/2)*spread/n+Math.sin(t*.22+i*1.7)*.03;
      const wdt=90+120*C3.hash(i,77), L=2600;
      g.save(); g.translate(x,y); g.rotate(a);
      const gr=g.createLinearGradient(0,-wdt,0,wdt);
      const al=int*(.5+.5*Math.sin(t*.55+i*2.1));
      gr.addColorStop(0,'rgba(255,224,160,0)'); gr.addColorStop(.5,`rgba(255,224,160,${al})`); gr.addColorStop(1,'rgba(255,224,160,0)');
      g.fillStyle=gr; g.fillRect(0,-wdt,L,wdt*2); g.restore(); }
    g.restore();
  }
  // إطار بطاقة ذهبي مزدوج + نجوم الزوايا
  function frame(g,k,{margin=54}={}){ if(k<=0)return;
    g.save(); g.globalAlpha=clamp(k*1.6);
    const gr=g.createLinearGradient(0,0,1080,1920);
    gr.addColorStop(0,'rgba(201,168,106,.95)'); gr.addColorStop(.5,'rgba(255,233,168,.95)'); gr.addColorStop(1,'rgba(138,107,50,.95)');
    g.lineWidth=5; g.strokeStyle=gr; g.strokeRect(margin,margin,1080-2*margin,1920-2*margin);
    g.lineWidth=1.5; g.strokeStyle='rgba(244,217,140,.8)';
    g.strokeRect(margin+13,margin+13,1080-2*(margin+13),1920-2*(margin+13));
    g.fillStyle='rgba(255,236,170,.95)';
    for(const [vx,vy] of [[margin,margin],[1080-margin,margin],[margin,1920-margin],[1080-margin,1920-margin]]){
      g.save(); g.translate(vx,vy); g.rotate(Math.PI/4);
      g.beginPath(); g.moveTo(0,-15); g.quadraticCurveTo(4,-4,15,0); g.quadraticCurveTo(4,4,0,15); g.quadraticCurveTo(-4,4,-15,0); g.quadraticCurveTo(-4,-4,0,-15);
      g.fill(); g.restore(); }
    g.restore();
  }
  // لوحة اسم مدمّجة مسبقًا (درع كحلي + ذهب) — تعاد كأصل word للعرض المعياري
  function plaque(name,sub,o={}){
    const size=o.size||64, subSize=o.subSize||34;
    const Wd=KT.word(name,{size,font:'TajB',weight:900,style:'gold3d',glow:.22,depth:Math.max(5,size*.075)});
    const Sd=sub?KT.word(sub,{size:subSize,font:'Cairo',weight:600,style:'glow',color:'#F6E3B0',glowColor:'rgba(255,225,150,.4)'}):null;
    const nw=Math.max(o.minW||880, Wd.w+170), nh=o.h||200, cut=44;
    const c=C3.mk(nw+120,nh+120), x=c.getContext('2d');
    const shape=(X,Y,W2,H2,c2)=>{ x.beginPath();
      x.moveTo(X+c2,Y); x.lineTo(X+W2-c2,Y); x.lineTo(X+W2-c2/2,Y+H2/2); x.lineTo(X+W2-c2,Y+H2); x.lineTo(X+c2,Y+H2); x.lineTo(X+c2/2,Y+H2/2); x.closePath(); };
    x.save(); x.shadowColor='rgba(0,0,10,.75)'; x.shadowBlur=36; x.shadowOffsetY=16;
    shape(60,60,nw,nh,cut); x.fillStyle='#0a142e'; x.fill(); x.restore();
    let gr=x.createLinearGradient(0,60,0,60+nh);
    gr.addColorStop(0,'rgba(16,30,64,.96)'); gr.addColorStop(.5,'rgba(8,15,34,.97)'); gr.addColorStop(1,'rgba(18,33,70,.96)');
    shape(60,60,nw,nh,cut); x.fillStyle=gr; x.fill();
    const gb=x.createLinearGradient(60,60,60+nw,60+nh);
    gb.addColorStop(0,'#8a6b32'); gb.addColorStop(.3,'#ffe9a8'); gb.addColorStop(.55,'#c9a86a'); gb.addColorStop(.8,'#f6d98c'); gb.addColorStop(1,'#8a6b32');
    shape(60,60,nw,nh,cut); x.lineWidth=5; x.strokeStyle=gb; x.stroke();
    shape(68,68,nw-16,nh-16,cut-8); x.lineWidth=1.6; x.strokeStyle='rgba(244,217,140,.8)'; x.stroke();
    // نجمتان جانبيتان
    for(const sx of [-1,1]){ const ox=60+nw/2+sx*(nw/2-cut*0.98), oy=60+nh/2;
      x.save(); x.translate(ox,oy); x.fillStyle='#f4d98c';
      x.beginPath(); x.moveTo(0,-13); x.quadraticCurveTo(3.5,-3.5,13,0); x.quadraticCurveTo(3.5,3.5,0,13); x.quadraticCurveTo(-3.5,3.5,-13,0); x.quadraticCurveTo(-3.5,-3.5,0,-13);
      x.fill(); x.restore();
      x.save(); x.strokeStyle=gb; x.lineWidth=2; x.beginPath();
      x.moveTo(ox-sx*15,oy); x.lineTo(60+nw/2+sx*(nw*.28),oy); x.stroke(); x.restore(); }
    // الاسم + السطر الثانوي
    x.drawImage(Wd.img, 60+nw/2-Wd.img.width/2, 60+nh/2 - (sub? nh*0.12:0) - Wd.img.height/2 + Wd.dy);
    if(Sd) x.drawImage(Sd.img, 60+nw/2-Sd.img.width/2, 60+nh/2+size*0.42 - Sd.img.height/2 + Sd.dy);
    return {img:c,w:nw,h:nh,size,dy:0,text:name};
  }
  // ميدالية ترتيب (قرص ذهبي + أكليل صورة + رقم gold3d + تاج اختياري) — مبنية مسبقًا
  function medalimg(n,{crown=false,r=92}={}){
    const S=r*3.6, c=C3.mk(S,S), x=c.getContext('2d'), cx=S/2, cy=S/2;
    if(lauA()&&lauA().naturalWidth){ x.save(); x.globalAlpha=.95;
      x.drawImage(lauA(),cx-r*1.75,cy-r*1.75,r*3.5,r*3.5); x.restore(); }
    let gr=x.createRadialGradient(cx,cy-r*.35,r*.1,cx,cy,r*1.3);
    gr.addColorStop(0,'#fff3c4'); gr.addColorStop(.35,'#f0cd6d'); gr.addColorStop(.7,'#c9a86a'); gr.addColorStop(1,'#6d5020');
    x.save(); x.shadowColor='rgba(255,215,130,.8)'; x.shadowBlur=r*.7;
    x.beginPath(); x.arc(cx,cy,r*.72,0,TAU); x.fillStyle=gr; x.fill(); x.restore();
    x.beginPath(); x.arc(cx,cy,r*.72,0,TAU); x.strokeStyle='#8a6b32'; x.lineWidth=3; x.stroke();
    x.beginPath(); x.arc(cx,cy,r*.58,0,TAU); x.strokeStyle='rgba(255,246,214,.9)'; x.lineWidth=1.6; x.stroke();
    const Nd=KT.word(String(n),{size:r*.82,font:'Cairo',weight:1000,style:'gold3d',glow:.3,depth:6});
    x.drawImage(Nd.img,cx-Nd.img.width/2,cy-Nd.img.height/2+Nd.dy);
    if(crown&&crownA()&&crownA().naturalWidth){ const cwid=r*1.7,ch2=cwid*crownA().naturalHeight/crownA().naturalWidth;
      x.drawImage(crownA(),cx-cwid/2,cy-r*1.04-ch2*.8,cwid,ch2); }
    return {img:c,w:S,h:S,size:r,dy:0};
  }
  // بطاقة الطالب الموحّدة (الخلفية تُرسم خارجها عبر plate)
  function studentCard(g,t,o){
    // o: {t0, cutKey, plaque, medalW, crown, cam:'dolly|panL|panR|orbit', portrait:{w,pw,baseY,cropT}}
    const t0=o.t0;
    frame(g,clamp((t-t0-.1)/.5));
    const im=A()[o.cutKey];
    if(im&&im.naturalWidth){
      const p=E.backOut(clamp((t-t0-.25)/.9));
      const cropT=o.cropT!=null?o.cropT:.60;
      const sw=im.naturalWidth, sh=im.naturalHeight*cropT;
      const pw=o.pw||800, ph=pw*(sh/sw);
      const baseY=o.baseY!=null?o.baseY:1995;
      const yoff=(1-p)*430;
      // توهج أرضية + ظل اتصال
      g.save(); g.globalCompositeOperation='lighter';
      let fg=g.createRadialGradient(540,baseY-60,20,540,baseY-60,620);
      fg.addColorStop(0,'rgba(255,220,150,.30)'); fg.addColorStop(1,'rgba(255,220,150,0)');
      g.fillStyle=fg; g.fillRect(0,baseY-560,1080,660); g.restore();
      g.save(); g.globalAlpha=clamp(p*1.5);
      g.drawImage(im,0,0,sw,sh,540-pw/2,baseY-ph+yoff,pw,ph); g.restore();
    }
    // اللوحة تنبثق (pop) + الميدالية تهبط (hero spring snap)
    const py=o.plateY!=null?o.plateY:1656;
    if(o.plaqueW){ const s=(o.plateScale!=null?o.plateScale:1)*(o.plaqueW.w/ (o.plaqueW.w));
      KT.show(g,o.plaqueW,t,{x:540,y:py,t0:t0+.7,in:'pop',spring:'pop',sc:o.plateScale||1,seed:4});
    }
    if(o.medalW) KT.show(g,o.medalW,t,{x:894,y:py-112,t0:t0+1.05,in:'zoom',from:2.2,spring:'pop',sc:o.plateScale||1,seed:7});
  }
  return {PAL,stage,dust,rays,frame,plaque,medalimg,studentCard};
})();
