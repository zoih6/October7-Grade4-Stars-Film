/* cinema.js — طبقة «الأسلوب السينمائي» فوق Core: نص ذهبي 3D، لوحات أسماء، ميداليات، كشف ضوئي حرفًا حرفًا، Whip-Pan، أعمدة نور، غبار حجمي */
(function(){
  const C = window.Core; const E = C.E;
  const TAU = Math.PI*2;
  const easeInQuint = t => t*t*t*t*t;

  /* نجمة لمعان رباعية */
  function star4(ctx,x,y,R,inner,rot){ ctx.save(); ctx.translate(x,y); ctx.rotate(rot||0); ctx.beginPath();
    for(let i=0;i<4;i++){ const a=i*(TAU/4); ctx.quadraticCurveTo(Math.cos(a)*inner,Math.sin(a)*inner, Math.cos(a+TAU/8)*0,Math.sin(a+TAU/8)*0); }
    ctx.beginPath();
    ctx.moveTo(0,-R); ctx.quadraticCurveTo(inner,-inner,R,0); ctx.quadraticCurveTo(inner,inner,0,R); ctx.quadraticCurveTo(-inner,inner,-R,0); ctx.quadraticCurveTo(-inner,-inner,0,-R);
    ctx.closePath(); ctx.fill(); ctx.restore(); }

  /* رسم سطر RTL بفجوات كلمات (ممنوع تتبع الحروف لتفادي كسر الوصل) — يعيد المواضع */
  function layoutWords(ctx, words, gap){
    const ws = words.map(w=>ctx.measureText(w).width);
    const total = ws.reduce((a,b)=>a+b,0)+gap*(words.length-1);
    let cursor = total/2; const out=[];
    for(let i=0;i<words.length;i++){ const w=ws[i]; out.push({word:words[i],x:cursor-w/2,w}); cursor-=(w+gap); }
    return {items:out,total,ws};
  }
  function fillWords(ctx, words, cx, cy, gap, dx=0, dy=0){
    const L=layoutWords(ctx,words,gap);
    for(const it of L.items) ctx.fillText(it.word, cx+it.x+dx, cy+dy);
    return L;
  }

  /* ---------- نص ذهبي 3D بإكستروجن (ظل كحلي عميق) ---------- */
  function text3D(ctx, text, cx, cy, o={}){
    const words = text.split(' ');
    const size=o.size||120, weight=o.weight||900, family=o.family||'Cairo';
    const depth=o.depth!=null?o.depth:Math.max(6,size*0.09);
    const dx=o.dx!=null?o.dx:-0.55, dy=o.dy!=null?o.dy:0.80;
    const gap=(o.gap!=null?o.gap:size*0.30), rotY=o.rotY||0, maxW=o.maxW||0;
    ctx.save(); ctx.translate(cx,cy);
    ctx.font=`${weight} ${size}px ${family}, TajB, sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    let L=layoutWords(ctx,words,gap);
    let fit=1; if(maxW && L.total>maxW) fit=maxW/L.total;
    if(rotY){ const c=Math.cos(rotY); ctx.transform(Math.max(0.16,Math.abs(c))*(c<0?-1:1),0,0,1,0,0); }
    ctx.scale(fit,fit);
    /* ظل سقوط */
    if(o.dropShadow!==false){
      ctx.save(); ctx.shadowColor=`rgba(0,0,8,${o.shadowA||.6})`; ctx.shadowBlur=size*.24; ctx.shadowOffsetY=size*.18;
      ctx.fillStyle='#05070f'; fillWords(ctx,words,0,0,gap); ctx.restore();
    }
    /* طبقات العمق الكحلية */
    const steps=Math.max(3,Math.round(depth));
    for(let k=steps;k>=1;k--){
      const q=k/steps;
      ctx.fillStyle=`rgb(${Math.round(20-10*q)},${Math.round(34-16*q)},${Math.round(66-32*q)})`;
      fillWords(ctx,words,0,0,gap,dx*depth*q,dy*depth*q);
    }
    /* حافة bevel علوية */
    ctx.fillStyle='#7a5a22'; fillWords(ctx,words,0,0,gap,dx*1.6,dy*1.6);
    /* الوجه الذهبي */
    const asc=size*0.62, desc=size*0.55;
    const g=ctx.createLinearGradient(0,-asc,0,desc);
    (o.face||[[0,'#fff8dc'],[0.22,'#ffe9a8'],[0.5,'#e7c167'],[0.78,'#c9a86a'],[1,'#8a6b32']]).forEach(s=>g.addColorStop(s[0],s[1]));
    ctx.fillStyle=g;
    if(o.glow){ ctx.shadowColor=`rgba(255,220,140,${o.glow})`; ctx.shadowBlur=size*.5; }
    fillWords(ctx,words,0,0,gap);
    ctx.shadowBlur=0;
    if(o.glow){ fillWords(ctx,words,0,0,gap); }
    /* لمعة علوية رفيعة */
    ctx.save(); ctx.globalAlpha=.55; ctx.fillStyle='rgba(255,253,238,.9)';
    ctx.translate(0,-1.4); ctx.globalCompositeOperation='source-atop';
    ctx.restore();
    /* كنس ضوئي */
    if(o.sweep!=null && o.sweep>0){
      ctx.save();
      const W=L.total*fit;
      ctx.translate(-W/2,0); ctx.beginPath();
      for(const it of L.items) ctx.rect(it.x* (1/ (fit||1))*fit -2, -asc*1.3, it.w*fit*1, asc+desc+asc*0.6);
      ctx.clip();
      const sx=-W*0.8+(W*2.6)*o.sweep;
      const sg=ctx.createLinearGradient(sx-size*.7,0,sx+size*.7,0);
      sg.addColorStop(0,'rgba(255,255,255,0)'); sg.addColorStop(.5,'rgba(255,255,240,.85)'); sg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.globalCompositeOperation='lighter'; ctx.fillStyle=sg;
      ctx.fillRect(-W*1.2,-asc*1.5,W*3.4,(asc+desc)*1.8);
      ctx.restore();
    }
    ctx.restore();
    return {total:L.total*fit};
  }

  /* ---------- لوحة اسم (درع فاخر بإطار ذهبي مزدوج) ---------- */
  function namePlate(ctx, cx, cy, o={}){
    const name=o.name||'', sub=o.sub||'';
    const size=o.size||76, subSize=o.subSize||34;
    const nw=o.width||640, nh=o.height||190;
    const x=cx-nw/2, y=cy-nh/2, cut=44;
    const ap=o.appear!=null?o.appear:1;
    ctx.save(); ctx.globalAlpha=ap;
    const shape=(inset)=>{
      ctx.beginPath();
      ctx.moveTo(x+cut+inset, y+inset);
      ctx.lineTo(x+nw-cut-inset, y+inset);
      ctx.lineTo(x+nw-cut/2-inset, cy);
      ctx.lineTo(x+nw-cut-inset, y+nh-inset);
      ctx.lineTo(x+cut+inset, y+nh-inset);
      ctx.lineTo(x+cut/2+inset, cy);
      ctx.closePath();
    };
    ctx.save(); ctx.shadowColor='rgba(0,0,10,.75)'; ctx.shadowBlur=36; ctx.shadowOffsetY=16;
    shape(0); ctx.fillStyle='#0a142e'; ctx.fill(); ctx.restore();
    const pg=ctx.createLinearGradient(0,y,0,y+nh);
    pg.addColorStop(0,'rgba(16,30,64,.96)'); pg.addColorStop(.5,'rgba(8,15,34,.97)'); pg.addColorStop(1,'rgba(18,33,70,.96)');
    shape(0); ctx.fillStyle=pg; ctx.fill();
    const gb=ctx.createLinearGradient(x,y,x+nw,y+nh);
    gb.addColorStop(0,'#8a6b32'); gb.addColorStop(.3,'#ffe9a8'); gb.addColorStop(.55,'#c9a86a'); gb.addColorStop(.8,'#f6d98c'); gb.addColorStop(1,'#8a6b32');
    shape(0); ctx.lineWidth=5; ctx.strokeStyle=gb; ctx.stroke();
    shape(8); ctx.lineWidth=1.6; ctx.strokeStyle='rgba(244,217,140,.8)'; ctx.stroke();
    /* زخارف جانبية */
    for(const sx of [-1,1]){
      const ox=cx+sx*(nw/2-cut*0.98);
      ctx.save(); ctx.fillStyle='#f4d98c'; star4(ctx,ox,cy,15,5,o.spin||0); ctx.restore();
      ctx.save(); ctx.strokeStyle=gb; ctx.lineWidth=2; ctx.beginPath();
      ctx.moveTo(ox-sx*14,cy); ctx.lineTo(cx+sx*(nw*.30),cy); ctx.stroke(); ctx.restore();
    }
    if(name) text3D(ctx,name,cx+(o.textOffX||0),cy-(sub? subSize*.38:2),{size,depth:Math.max(4,size*.08),family:'TajB',weight:900,glow:.20,shadowA:.5,sweep:o.sweep,maxW:o.maxTextW||nw-cut*2.4});
    if(sub){
      ctx.font=`600 ${subSize}px Cairo, sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle='#f6e3b0'; ctx.shadowColor='rgba(255,225,150,.4)'; ctx.shadowBlur=10;
      ctx.fillText(sub,cx,cy+size*.56); ctx.shadowBlur=0;
    }
    ctx.restore();
  }

  /* ---------- ميدالية ترتيب (قرص ذهبي + أكليل + رقم 3D) ---------- */
  function rankMedal(ctx, cx, cy, o={}){
    const n=o.n||1, r=o.r||84, ap=o.appear!=null?o.appear:1, spin=o.spin||0;
    ctx.save(); ctx.globalAlpha=ap; ctx.translate(cx,cy);
    if(o.laurel && o.laurel.complete && o.laurel.naturalWidth){
      ctx.save(); ctx.rotate(spin*.10); ctx.globalAlpha=.92*ap; ctx.globalCompositeOperation='screen';
      ctx.drawImage(o.laurel,-r*1.7,-r*1.7,r*3.4,r*3.4); ctx.restore();
    }
    const g=ctx.createRadialGradient(0,-r*.35,r*.1,0,0,r*1.3);
    g.addColorStop(0,'#fff3c4'); g.addColorStop(.35,'#f0cd6d'); g.addColorStop(.7,'#c9a86a'); g.addColorStop(1,'#6d5020');
    ctx.save(); ctx.shadowColor=`rgba(255,215,130,${.75*ap})`; ctx.shadowBlur=r*.85;
    ctx.beginPath(); ctx.arc(0,0,r*.72,0,TAU); ctx.fillStyle=g; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0,0,r*.72,0,TAU); ctx.strokeStyle='#8a6b32'; ctx.lineWidth=3; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,r*.58,0,TAU); ctx.strokeStyle='rgba(255,246,214,.9)'; ctx.lineWidth=1.6; ctx.stroke();
    text3D(ctx,String(n),0,3,{size:r*.8,depth:6,glow:.28,shadowA:.45});
    if(o.crown && o.crown.complete && o.crown.naturalWidth && o.crownTop!==false){
      const cw=r*1.6, ch=cw*(o.crown.naturalHeight/o.crown.naturalWidth);
      ctx.save(); ctx.globalCompositeOperation='screen';
      ctx.drawImage(o.crown,-cw/2,-r*1.02-ch*.82,cw,ch); ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- إطار بطاقة ذهبي مزدوج + زوايا نجمية ---------- */
  function cardFrame(ctx, W, H, o={}){
    const m=o.margin||54, ap=o.appear!=null?o.appear:1;
    ctx.save(); ctx.globalAlpha=ap;
    const gb=ctx.createLinearGradient(0,0,W,H);
    gb.addColorStop(0,'rgba(201,168,106,.95)'); gb.addColorStop(.5,'rgba(255,233,168,.95)'); gb.addColorStop(1,'rgba(138,107,50,.95)');
    ctx.lineWidth=o.w1||6; ctx.strokeStyle=gb; ctx.strokeRect(m,m,W-2*m,H-2*m);
    ctx.lineWidth=o.w2||1.6; ctx.strokeStyle='rgba(244,217,140,.8)';
    const m2=m+14; ctx.strokeRect(m2,m2,W-2*m2,H-2*m2);
    ctx.fillStyle=`rgba(255,236,170,${.95*ap})`;
    for(const [vx,vy] of [[m,m],[W-m,m],[m,H-m],[W-m,H-m]]) star4(ctx,vx,vy,17,6,o.spin||0);
    ctx.restore();
  }

  /* ---------- كشف ضوئي حرفًا حرفًا (نافذة كشف RTL + رأس ضوء) ---------- */
  function traceText(ctx, text, cx, cy, o={}){
    const prog=C.clamp01(o.prog!=null?o.prog:0);
    const size=o.size||84, gap=o.gap!=null?o.gap:size*0.34;
    ctx.save();
    ctx.font=`${o.weight||600} ${size}px ${o.family||'Rakkas'}, serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const L=layoutWords(ctx,text.split(' '),gap);
    const W=L.total;
    const reveal = W*C.E.outCubic(prog);            // مقدار المكشوف من اليمين
    const cutX = cx + W/2 - reveal;                  // موضع حد الكشف
    ctx.save(); ctx.beginPath(); ctx.rect(cutX, cy-size*1.6, W*1.2+40, size*3.2); ctx.clip();
    ctx.fillStyle=o.color||'#f6e3b0';
    if(o.glow!==false){ ctx.shadowColor='rgba(255,220,140,.6)'; ctx.shadowBlur=size*.3; }
    fillWords(ctx,text.split(' '),cx,cy,gap);
    ctx.shadowBlur=0;
    if(o.glow!==false) fillWords(ctx,text.split(' '),cx,cy,gap);
    ctx.restore();
    if(prog>0 && prog<1){
      const hg=ctx.createLinearGradient(cutX-2,0,cutX+30,0);
      hg.addColorStop(0,'rgba(255,252,230,.95)'); hg.addColorStop(.3,'rgba(255,225,140,.55)'); hg.addColorStop(1,'rgba(255,225,140,0)');
      ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=hg;
      ctx.fillRect(cutX-2,cy-size*1.0,32,size*2.0);
      ctx.fillStyle='rgba(255,250,225,.95)';
      star4(ctx,cutX+2,cy-size*.85,11,4,prog*7); star4(ctx,cutX+4,cy+size*.88,8,3,-prog*5);
      ctx.restore();
    }
    ctx.restore();
    return {cutX,width:W};
  }

  /* ---------- غبار ذهبي حجمي (طبقات عمق) ---------- */
  function goldDust(ctx,W,H,seed,n,t,o={}){
    const R=C.mulberry32(seed); const pts=[];
    for(let i=0;i<n;i++) pts.push({z:.35+R()*.65, bx:R()*W, by:R()*H, ph:R()*7, ph2:R()*5, tw:R()*12, r:(o.r||2.4)*(0.6+R()*0.8), sp:.2+R()*.4, spark:R()>.92, spd:.13+R()*.3});
    ctx.save(); ctx.globalCompositeOperation='lighter';
    for(const p of pts){
      const drift=(o.drift||16)*(1-p.z);
      const x=p.bx+Math.sin(t*p.sp+p.ph)*drift+(o.windX||0)*t*(1-p.z);
      const y=((p.by+Math.sin(t*p.spd+p.ph2)*drift*.8 + H + (o.fall||-8)*t*p.z) % (H+80))-40;
      const r=p.r*p.z;
      const tw=.35+.65*Math.abs(Math.sin(t*(o.twSpeed||1.4)+p.tw));
      const a=(o.maxA||.5)*tw*p.z*(o.alpha!=null?o.alpha:1);
      if(a<0.02) continue;
      ctx.fillStyle=`rgba(255,${218},${150},${a})`;
      ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill();
      if(p.spark){ ctx.fillStyle=`rgba(255,248,225,${a*.85})`; star4(ctx,x-3,y-2,r*2.8,r,t*.5+p.ph); }
    }
    ctx.restore();
  }

  /* ---------- أعمدة نور حجمية ---------- */
  function godRays(ctx,W,H,t,o={}){
    ctx.save(); ctx.globalCompositeOperation='screen';
    const n=o.n||4;
    for(let i=0;i<n;i++){
      const p=i/n;
      const sway=Math.sin(t*.1+p*9)*(o.sway||.10);
      const cx=W*(o.cx!=null?o.cx:.5)+Math.sin(t*.07+i*3)*W*.05+(i-n/2)*W*(o.spread||.12);
      const topW=W*(o.topW||.02), botW=W*(o.botW||.13);
      ctx.save(); ctx.translate(cx,-H*.05); ctx.rotate((o.ang||0)+sway);
      const g=ctx.createLinearGradient(0,0,0,H*1.2);
      const a=(o.a||.14)*(0.6+0.4*Math.sin(t*.25+i*1.7))*(o.alpha!=null?o.alpha:1);
      g.addColorStop(0,`rgba(255,230,160,${a})`);
      g.addColorStop(1,'rgba(255,220,140,0)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.moveTo(-topW,0); ctx.lineTo(topW,0); ctx.lineTo(botW+p*30,H*1.2); ctx.lineTo(-botW-p*30,H*1.2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- Whip-Pan ---------- */
  function whipPan(u){
    const p=C.clamp01(u);
    const e = p<.22 ? (p/.22)*.10 : p<.78 ? .10+easeInQuint((p-.22)/.56)*.78 : .88+C.E.outCubic((p-.78)/.22)*.12;
    return { pan:e, blur:Math.sin(p*Math.PI) };
  }
  /* رسم صورة مع إزاحة أفقية + ضبابية حركة */
  function whipDraw(ctx, img, W, H, xOff, blur, zoom=1){
    ctx.save();
    const streaks = blur>.25? 4:1;
    for(let s=0;s<streaks;s++){
      ctx.globalAlpha = streaks===1?1:(s===0? .5 : .5/streaks);
      const so = (s/streaks)*xOff*.55;
      ctx.translate(W/2 + xOff - so, H/2);
      ctx.scale(zoom,zoom);
      C.cover(ctx,img,-W/2,-H/2,W,H);
      ctx.setTransform(ctx.getTransform().a,0,0,ctx.getTransform().d,0,0); // أمن
      ctx.restore(); ctx.save();
    }
    ctx.restore();
  }

  /* خلفية بكاميرا دوللي/بان خفيفة */
  function bgCamera(ctx,img,W,H,o={}){
    const scale=(o.scale||1)*(o.zoom!=null?o.zoom:1);
    const ox=o.ox||0, oy=o.oy||0, rot=o.rot||0;
    ctx.save();
    ctx.translate(W/2+ox,H/2+oy);
    if(rot) ctx.rotate(rot*Math.PI/180);
    ctx.scale(scale,scale);
    C.cover(ctx,img,-W/2,-H/2,W,H);
    ctx.restore();
  }

  window.Cinema={text3D,namePlate,rankMedal,cardFrame,traceText,goldDust,godRays,whipPan,whipDraw,bgCamera,star4,fillWords,layoutWords,easeInQuint};
})();
