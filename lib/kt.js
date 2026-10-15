/* ═══ نجوم أكتوبر · kt.js — كتابة حركية: كلمة-كائن مرسومة مسبقًا + دخول/خروج معياري ═══
   دخول: rise/pop/zoom/mask/wipe/grow · خروج: lift/blur/push (أقصر دائمًا)
   gold3d: وجه ذهبي بإكستروجن كحلي (أسلوب المعاينات) · kashida = تباعد آمن بالتطويل */
'use strict';
window.KT=(function(){
  const C3=window.Core3, lerp=C3.lerp, clamp=C3.clamp, E=C3.E, CURVE=C3.CURVE;
  const SPRINGS={card:[150,19],snap:[320,28],pop:[260,15]};
  const spr=(t,t0,name='card')=>C3.spring(t-t0,...(SPRINGS[name]||SPRINGS.card));
  const eOut=C3.tw;
  // حروف لا تصل بما بعدها (لا يوضع تطويل بعدها)
  const NOJOIN=new Set(['ا','أ','إ','آ','ٱ','ء','د','ذ','ر','ز','و','ؤ','ة','ى','ْ']);
  function kashida(text,n=2){
    if(n<=0)return text;
    return [...text].map((c,i,arr)=>{
      const nx=arr[i+1];
      if(nx && !NOJOIN.has(c) && c!==' ' && nx!==' ') return c+'ـ'.repeat(n);
      return c;
    }).join('');
  }
  const kash=(text,k)=>{ // k: 0..n كسور → نوزع التوطيد
    if(k<=0)return text; const n=Math.round(k*3); if(n<=0)return text; return kashida(text,n);
  };

  // رسم كلمة على كانفس خاص (gold3d / flat / glow) — يعيد {img,w,h,size,style,text}
  function word(text,o={}){
    const size=o.size||96, weight=o.weight||900, font=o.font||'Cairo';
    const style=o.style||'flat', color=o.color||'#f6e9c8', gap=o.gap!=null?o.gap:size*0.34;
    const depth=o.depth!=null?o.depth:Math.max(5,size*0.075);
    const m=C3.mk(8,8).getContext('2d');
    m.font=`${weight} ${size}px ${font}, TajB, sans-serif`;
    const words=text.split(' ');
    const ws=words.map(w=>m.measureText(kash(w,o.kashida||0)).width);
    const total=ws.reduce((a,b)=>a+b,0)+gap*(words.length-1);
    const asc=size*0.78, desc=size*0.34;
    const pad=style==='gold3d'?size*0.6:size*0.34;
    const blurPad=40;
    const cw=total+depth*2+pad*2+blurPad*2, ch=asc+desc+depth+pad+blurPad*2;
    const c=C3.mk(cw,ch); const x=c.getContext('2d');
    x.font=m.font; x.textAlign='center'; x.textBaseline='middle';
    const cx=pad+blurPad+(total+depth*2)/2, cy=blurPad+pad*0.35+asc*0.62;
    const layout=()=>{ let cur=total/2; return words.map((w,i)=>{const p={w:kash(w,o.kashida||0),x:cur-ws[i]/2};cur-=(ws[i]+gap);return p;}); };
    const put=(dx,dy)=>{ for(const it of layout()) x.fillText(it.w, cx+it.x+dx, cy+dy); };
    if(style==='gold3d'){
      // ظل سقوط
      x.save(); x.shadowColor='rgba(0,0,10,.55)'; x.shadowBlur=size*.2; x.shadowOffsetY=size*.13; x.fillStyle='#05070f'; put(0,0); x.restore();
      // إكستروجن كحلي
      const steps=Math.max(3,Math.round(depth));
      for(let k=steps;k>=1;k--){ const q=k/steps;
        x.fillStyle=`rgb(${Math.round(20-10*q)},${Math.round(34-16*q)},${Math.round(70-34*q)})`;
        put(-0.5*depth*q,0.72*depth*q); }
      x.fillStyle='#7a5a22'; put(-0.9,1.3);
      // وجه ذهبي
      const gr=x.createLinearGradient(0,cy-asc*0.7,0,cy+desc*0.8);
      [[0,'#fff8dc'],[0.22,'#ffe9a8'],[0.5,'#e7c167'],[0.78,'#c9a86a'],[1,'#8a6b32']].forEach(s=>gr.addColorStop(s[0],s[1]));
      x.fillStyle=gr;
      if(o.glow){ x.shadowColor=`rgba(255,220,140,${o.glow})`; x.shadowBlur=size*.42; }
      put(0,0); x.shadowBlur=0; if(o.glow) put(0,0);
    } else if(style==='glow'){
      x.fillStyle=color; x.shadowColor=o.glowColor||'rgba(255,220,140,.55)'; x.shadowBlur=size*.3; put(0,0); x.shadowBlur=0; put(0,0);
    } else {
      x.fillStyle=color; if(o.shadow){ x.shadowColor='rgba(0,0,10,.45)'; x.shadowBlur=size*.12; x.shadowOffsetY=size*.06; } put(0,0);
    }
    return {img:c,text,w:total,h:asc+desc,size,style,color,font,weight,dy:cy-c.height/2};
  }

  // حالة كل كلمة: {dx,dy,sx,sy,rot,alpha,blur,clip:'none|line|wipe',wipeK}
  function state(){ return {dx:0,dy:0,sx:1,sy:1,rot:0,alpha:1,blur:0,clip:null,wipeK:1}; }
  const INS={
    rise:(k,S,o)=>{ S.dy+=(1-k)*(o.dist!=null?o.dist:60); S.alpha=clamp(k*2.2); },
    pop:(k,S)=>{ const s=lerp(.55,1,k); S.sx*=s; S.sy*=s; S.alpha=clamp(k*3); },
    zoom:(k,S,o)=>{ const s=lerp(o.from||2.3,1,k); S.sx*=s; S.sy*=s; S.blur+=(1-k)*10; S.alpha=clamp(k*3); },
    grow:(k,S)=>{ const s=Math.max(.02,k); S.sx*=s; S.sy*=s; S.blur+=(1-clamp(k))*9; },
    mask:(k,S,Wd)=>{ S.clip='line'; S.dy+=(1-clamp(k))*Wd.h*1.05; S.alpha=1; },
    wipe:(k,S)=>{ S.clip='wipe'; S.wipeK=clamp(k); S.alpha=1; },
    drop:(k,S,Wd)=>{ S.clip='line'; S.dy-=(1-clamp(k))*Wd.h*1.05; S.alpha=1; },
  };
  const OUTS={
    lift:(k,S,o)=>{ S.dy-=k*(o.outDist||52); S.alpha*=1-k; S.blur+=k*5; },
    blur:(k,S)=>{ S.blur+=k*16; S.alpha*=1-k; const s=1+k*.07; S.sx*=s; S.sy*=s; },
    push:(k,S,o)=>{ const d={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[o.outDir||'left']; S.dx+=d[0]*k*(o.outDist||300); S.dy+=d[1]*k*(o.outDist||300); S.alpha*=1-E.cubicIn(k); S.blur+=k*8; },
  };
  // الظهور: t0/durIn/spring/in · الاختفاء: t1/outDur/out
  function show(g,Wd,t,o){
    const t0=o.t0||0, durIn=o.durIn||.55, kind=o.spring||'card', inK=o.in==='wipe'||o.in==='mask'? eOut(t,t0,t0+(durIn*1.15),CURVE.signature) : spr(t,t0,kind);
    let exitK=0;
    if(o.t1!=null){ exitK=clamp((t-o.t1)/(o.outDur||.26)); if(exitK>=1)return; }
    if(inK<=0&&!exitK)return;
    const S=state();
    if(o.in&&inK<1&&INS[o.in]) INS[o.in](o.in==='pop'?spr(t,t0,'pop'):o.in==='zoom'?spr(t,t0,'pop'):clamp(inK),S,o,Wd);
    if(exitK>0&&o.out&&OUTS[o.out]) OUTS[o.out](exitK,S,o);
    const alphaMul=(o.alpha!=null?o.alpha:1)*(o.fade!=null?o.fade:1);
    if(S.alpha*alphaMul<=0.004)return;
    const drawX=o.x+(o.offX||0)+S.dx+(o.bob?Math.sin(t*1.6+(o.seed||1))*o.bob:0);
    const drawY=o.y+(o.offY||0)+S.dy+(o.bob?Math.cos(t*1.3+(o.seed||2))*o.bob*.7:0);
    const w=Wd.img.width*(o.sc||1)*S.sx, h=Wd.img.height*(o.sc||1)*S.sy;
    g.save();
    g.translate(drawX,drawY); if(S.rot)g.rotate(S.rot);
    g.globalAlpha*=S.alpha*alphaMul;
    if(S.blur>0.3) g.filter=`blur(${S.blur}px)`;
    if(S.clip==='line'){ g.beginPath(); g.rect(-w/2-h*0.06,-h/2-h*0.06,w+h*0.12,h*0.62*2); g.clip(); }
    if(S.clip!=='wipe') g.drawImage(Wd.img,-w/2,-h/2-Wd.dy*(o.sc||1)*S.sy,w,h);
    // كشف RTL: نرسم داخل قصّ من اليمين
    if(S.clip==='wipe'){
      g.restore(); g.save();
      g.translate(drawX,drawY); if(S.rot)g.rotate(S.rot);
      g.globalAlpha*=S.alpha*alphaMul; if(S.blur>0.3) g.filter=`blur(${S.blur}px)`;
      const wpx=w*(1-S.wipeK)+30;
      g.beginPath(); g.rect(w/2-wpx, -h/2-h*0.1, wpx+h*0.1, h*1.2); g.clip();
      g.drawImage(Wd.img,-w/2,-h/2-Wd.dy*(o.sc||1)*S.sy,w,h);
    }
    g.restore();
  }

  // جسيمات إرشادية: نقطة قائدة / مذنّب مداري / بريق
  function dot(g,t,t0,x,y,r=12,o={}){ const k=spr(t,t0,'pop'); if(k<=0)return 0;
    const kO=o.t1?clamp((t-o.t1)/.3):0; g.save(); g.globalAlpha=(1-kO)*(o.alpha||1);
    const col=o.color||'#F2D488';
    g.shadowColor=col; g.shadowBlur=r*2.2; g.fillStyle=col;
    g.beginPath(); g.arc(x,y,Math.max(.1,r*k*(1-kO*.6)),0,C3.TAU); g.fill(); g.restore(); return k; }
  function comet(g,t,t0,cx,cy,rx,ry,o={}){ const k=clamp((t-t0)/(o.dur||1.2)); if(k<=0||k>=1)return 0;
    const a0=o.a0||-Math.PI/2, a1=a0+(o.dir!=null?o.dir:1)*(o.arc||Math.PI)*E.cubicInOut(k);
    const x=cx+Math.cos(a1)*rx, y=cy+Math.sin(a1)*ry;
    g.save(); g.globalCompositeOperation='lighter';
    for(let i=0;i<10;i++){ const kk=i/10, aa=a1- .09*(10-i)*(o.dir!=null?o.dir:1);
      g.fillStyle=`rgba(255,224,150,${(1-kk)*.5*(1-k)})`;
      g.beginPath(); g.arc(cx+Math.cos(aa)*rx,cy+Math.sin(aa)*ry,(o.r||7)*(1-kk*.8),0,C3.TAU); g.fill(); }
    g.fillStyle='rgba(255,244,210,'+(1-k*.5)+')'; g.shadowColor='#ffe9a8'; g.shadowBlur=22;
    g.beginPath(); g.arc(x,y,o.r||7,0,C3.TAU); g.fill(); g.restore();
    return k; }
  function sparkle(g,t,t0,x,y,o={}){ const k=clamp((t-t0)/(o.dur||.8)); if(k<=0||k>=1)return 0;
    const R=(o.R||26)*Math.sin(k*Math.PI);
    g.save(); g.globalAlpha=(1-k)*(o.alpha||1); g.translate(x,y); g.rotate(t*(o.spin||1.6));
    g.fillStyle=o.color||'#FFEFA8';
    g.beginPath(); const ir=R*.28;
    g.moveTo(0,-R); g.quadraticCurveTo(ir,-ir,R,0); g.quadraticCurveTo(ir,ir,0,R); g.quadraticCurveTo(-ir,ir,-R,0); g.quadraticCurveTo(-ir,-ir,0,-R);
    g.fill(); g.restore(); return k; }

  return {spr,eOut,kashida,kash,word,show,dot,comet,sparkle,NOJOIN};
})();
