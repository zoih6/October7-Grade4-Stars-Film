/* ═══ نجوم أكتوبر · core3 — محرك اللقطات والانتقالات (فلسفة motion-doc) ═══
   - سجل لقطات مركزي SHOTS: {a,b,draw(t),tin,focus,whipDir,accent}
   - الانتقالات على مستوى المحرك: اللقطة السابقة تُرسم في بفر وتُكشف عبر TRANS[tin]
   - 3 نوابض فقط + منحنيات مسماة + kf() مفاتيح — لا ارتجال
   - post موحّد لكل إطار: grain بنبض 12 + vignette + grade دافئ
   - كل شيء دالة خالصة من t (بذور ثابتة، لا مؤقتات) */
'use strict';
window.Core3 = {};
(function(){
  const C3 = window.Core3;
  // ── رياضيات ──
  const clamp = C3.clamp = (x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const lerp  = C3.lerp  = (a,b,k)=>a+(b-a)*k;
  const TAU = C3.TAU = Math.PI*2;
  function rng(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  C3.rng=rng; C3.hash=(a,b=0)=>rng((a*73856093)^(b*19349663))();
  // منحنيات Penner + صناعية
  const P=Math.PI,c1=1.70158,c2=c1*1.525,c3=c1+1,c4=2*P/3;
  function bezier(x1,y1,x2,y2){ const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
    const X=s=>((ax*s+bx)*s+cx)*s,Y=s=>((ay*s+by)*s+cy)*s,dX=s=>(3*ax*s+2*bx)*s+cx;
    return x=>{ if(x<=0)return 0; if(x>=1)return 1; let s=x;
      for(let i=0;i<8;i++){const e=X(s)-x;if(Math.abs(e)<1e-6)return Y(s);const d=dX(s);if(Math.abs(d)<1e-6)break;s-=e/d;}
      let lo=0,hi=1;s=x;for(let i=0;i<30;i++){const v=X(s);if(Math.abs(v-x)<1e-6)break;if(x>v)lo=s;else hi=s;s=(lo+hi)/2;}return Y(s); }; }
  const E = C3.E = {
    linear:x=>x, cubicIn:x=>x**3, cubicOut:x=>1-Math.pow(1-x,3), cubicInOut:x=>x<.5?4*x**3:1-Math.pow(-2*x+2,3)/2,
    quartOut:x=>1-Math.pow(1-x,4), sineInOut:x=>-(Math.cos(P*x)-1)/2, expoOut:x=>x===1?1:1-Math.pow(2,-10*x),
    backOut:x=>1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2), backIn:x=>c3*x**3-c1*x*x,
    elasticOut:x=>x===0||x===1?x:Math.pow(2,-10*x)*Math.sin((x*10-.75)*c4)+1,
  };
  const CURVE = C3.CURVE = {
    signature:bezier(.22,1,.36,1), camera:bezier(.65,0,.35,1), overshoot:bezier(.34,1.56,.64,1),
    premium:bezier(.4,0,.2,1), accel:bezier(.3,0,1,1), whip:bezier(.7,0,.2,1), emph:bezier(.05,.7,.1,1),
  };
  const tw = C3.tw = (t,a,b,fn=CURVE.signature)=>fn(clamp((t-a)/(b-a)));
  // kf: مفاتيح زمنية [[t,v],[t,v,ease?],…]
  function kf(t,keys){
    if(t<=keys[0][0])return keys[0][1]; const L=keys[keys.length-1]; if(t>=L[0])return L[1];
    for(let i=1;i<keys.length;i++)if(t<keys[i][0]){const [ta,va]=keys[i-1],[tb,vb,fn]=keys[i],k=(fn||CURVE.camera)((t-ta)/(tb-ta));
      return Array.isArray(va)?va.map((v,j)=>lerp(v,vb[j],k)):lerp(va,vb,k);}
  }
  C3.kf=kf;
  // نوابض فيزيائية (كتلة=1) — ثلاثة بيتية فقط للاتساق
  function spring(t,k,d){ if(t<=0)return 0; const w0=Math.sqrt(k),z=d/(2*w0);
    if(z<1){const wd=w0*Math.sqrt(1-z*z);return 1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+(z*w0/wd)*Math.sin(wd*t));}
    return 1-Math.exp(-w0*t)*(1+w0*t); }
  C3.spring=spring;
  const SPR=C3.SPR={card:[150,19],snap:[320,28],pop:[260,15]};
  const sp=C3.sp=(t,t0,kind='card')=>spring(t-t0,...(SPR[kind]||SPR.card));
  const shake=C3.shake=(t,t0,amp,f=60)=>t<t0?0:amp*Math.exp(-(t-t0)*9)*Math.sin((t-t0)*f);
  const breathe=C3.breathe=(id,t,amp=1)=>[Math.sin(t*.9+id)*1.6*amp,Math.cos(t*.7+id*1.7)*1.2*amp,Math.sin(t*.5+id*.3)*.0025*amp];

  // ── الأصول ──
  const A = C3.A = {};
  C3.loadImg=(k,src)=>new Promise(r=>{const i=new Image();i.onload=()=>{A[k]=i;r();};i.onerror=()=>{console.log('MISSING '+src);A[k]=null;r();};i.src=src;});
  const mk = C3.mk = (w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;};
  // قصّ ناعم مع ظل مخبوز (للصور المقصوصة)
  function cutout(img,blur=16){ const c=mk(img.width+blur*6,img.height+blur*6),x=c.getContext('2d');
    x.filter=`blur(${blur}px) brightness(0)`; x.drawImage(img,blur*3,blur*3); return {img,sh:c,blur}; }
  C3.cutout=cutout;
  function drawCut(g,o,x,y,w,{alpha=1,ax=.5,ay=.5,rot=0,lift=0,shA=.5}={}){
    if(!o||!o.img||alpha<=0)return; const k=w/o.img.width,h=o.img.height*k,pad=o.blur*3*k;
    g.save(); g.translate(x,y); g.rotate(rot);
    g.globalAlpha=alpha*shA; g.drawImage(o.sh,-w*ax-pad+10+lift*34,-h*ay-pad+16+lift*44,o.sh.width*k,o.sh.height*k);
    g.globalAlpha=alpha; g.drawImage(o.img,-w*ax,-h*ay,w,h); g.restore(); }
  C3.drawCut=drawCut;

  // cover مع كاميرا (تركيز fx,fy + زوم) — أساس كل الخلفيات
  function cover(g,img,x,y,w,h,{s=1,fx=.5,fy=.5,alpha=1}={}){
    const base=Math.max(w/img.width,h/img.height)*s, ww=img.width*base, hh=img.height*base;
    const xx=clamp(x+w/2-fx*ww,x+w-ww,x), yy=clamp(y+h/2-fy*hh,y+h-hh,y);
    g.save(); g.globalAlpha*=alpha; g.drawImage(img,xx,yy,ww,hh); g.restore(); }
  C3.cover=cover;

  // plate: خلفية ملء-كادر مع كاميرا سردية عبر kf
  function plate(g,W,H,img,t,keys,{dim=0}={}){
    const s=kf(t,keys.s||[[0,1]]), fx=kf(t,keys.fx||[[0,.5]]), fy=kf(t,keys.fy||[[0,.5]]), rot=keys.rot?kf(t,keys.rot):0;
    g.save(); g.translate(W/2,H/2); g.rotate(rot*Math.PI/180); g.translate(-W/2,-H/2);
    cover(g,img,0,0,W,H,{s,fx,fy}); g.restore();
    if(dim){g.fillStyle=`rgba(4,6,15,${dim})`;g.fillRect(0,0,W,H);}
  }
  C3.plate=plate;

  // ── سجل اللقطات + TRANS ──
  const SHOTS=C3.SHOTS=[], INITS=C3.INITS=[];
  let buf=null, bufCtx=null, inBuf=null, inCtx=null, W=1080, H=1920;
  function renderOut(g,draw){ g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,W,H); draw(); return buf; }
  const TRANS = {
    // whip أفقي بضبابية حركة حقيقية (5 طبقات مخففة)
    whip:{dur:.38, draw(k,g,IN,OUT,o){ const dir=(o.shot.whipDir!=null?o.shot.whipDir:-1), e=CURVE.whip(k), v=Math.sin(k*Math.PI)*260;
      g.save(); g.setTransform(1,0,0,1,0,0);
      const ox=dir*-e*W, ix=dir*(1-e)*W;
      for(let s=0;s<5;s++){ g.globalAlpha=.16; g.drawImage(OUT, ox+dir*(s*v*.18), 0); }
      for(let s=0;s<5;s++){ g.globalAlpha=.16; g.drawImage(IN, ix-dir*(s*v*.18), 0); }
      g.globalAlpha=1; g.drawImage(OUT, ox, 0); g.drawImage(IN, ix, 0);
      // حزام ضوئي ذهبي عند خط الفصل
      const fx=ix* (e<.92?1:0) + dir*0, bx=(dir<0? IN.width+ix-60 : ix+60);
      const gg=g.createLinearGradient(bx-160,0,bx+160,0);
      gg.addColorStop(0,'rgba(255,225,150,0)'); gg.addColorStop(.5,`rgba(255,225,150,${.5*Math.sin(k*Math.PI)})`); gg.addColorStop(1,'rgba(255,225,150,0)');
      g.fillStyle=gg; g.fillRect(bx-160,0,320,H);
      g.restore(); }},
    // قزحية دائرية بحافة ذهبية قائدة (الصورة تتبع) — انتقال العلامة
    iris:{dur:.6, draw(k,g,IN,OUT,o){ const [fx,fy]=o.shot.focus||[W/2,H*0.44], e=E.cubicInOut(k), R=e*Math.hypot(W,H)*.62;
      g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(OUT,0,0);
      const rimC=o.shot.accent||'#C9A86A';
      g.fillStyle=rimC; g.beginPath(); g.arc(fx,fy,R+14*Math.min(1,R/100),0,TAU); g.fill();
      g.save(); g.beginPath(); g.arc(fx,fy,Math.max(0,R),0,TAU); g.clip(); g.drawImage(IN,0,0); g.restore();
      g.restore(); }},
    // كشف بحزام ذهبي مائل (للدفعات/الكورس) — دوران خفيف فخم
    band:{dur:.5, draw(k,g,IN,OUT,o){ const e=CURVE.camera(k), col=o.shot.accent||'#C9A86A', sk=320, x=lerp(W+sk+300,-sk-300,e);
      g.save(); g.setTransform(1,0,0,1,0,0); g.drawImage(OUT,0,0); g.restore();
      g.save(); g.setTransform(1,0,0,1,0,0); g.translate(W/2,H/2); g.rotate(-.10); g.translate(-W/2,-H/2);
      g.save(); g.beginPath(); g.rect(x+90,-300,W*1.8,H+600); g.clip(); g.drawImage(IN,0,0); g.restore();
      const gg=g.createLinearGradient(x-50,0,x+140,0);
      gg.addColorStop(0,'rgba(201,168,106,0)'); gg.addColorStop(.55,col); gg.addColorStop(1,'#FFF3C4');
      g.fillStyle=gg; g.fillRect(x-50,-300,190,H+600); g.restore(); }},
    // غمر بومضة (للأبطال): OUT يظهر، ومضة بنفسجية-ذهبية قصوى، ثم IN
    flash:{dur:.3, draw(k,g,IN,OUT,o){ g.save(); g.setTransform(1,0,0,1,0,0);
      if(k<.35){g.drawImage(OUT,0,0); const a=Math.min(1,E.cubicIn(k/.35)*1.5);
        const gr=g.createRadialGradient(W/2,H*.42,10,W/2,H*.42,W*1.1);
        gr.addColorStop(0,`rgba(255,246,220,${a})`); gr.addColorStop(.6,`rgba(255,232,160,${a*.9})`); gr.addColorStop(1,`rgba(201,168,106,${a*.8})`);
        g.fillStyle=gr; g.fillRect(0,0,W,H); }
      else {g.drawImage(IN,0,0); g.fillStyle=`rgba(255,244,210,${1-E.cubicOut((k-.35)/.65)})`; g.fillRect(0,0,W,H);} g.restore(); }},
    // زوم عبر المركز (بطل من بطاقة إلى عالم)
    zoom:{dur:.4, draw(k,g,IN,OUT,o){ const [fx,fy]=o.shot.focus||[W/2,H*.42], e=CURVE.camera(k);
      g.save(); g.setTransform(1,0,0,1,0,0);
      g.globalAlpha=1-e*.8; const so=1+e*1.6; g.translate(W/2+(fx-W/2)*(1-so),H/2+(fy-H/2)*(1-so)); g.scale(so,so); g.drawImage(OUT,-W/2,-H/2); g.restore();
      g.save(); g.setTransform(1,0,0,1,0,0); g.globalAlpha=E.cubicOut(k); const si=1.28-e*.28; g.translate(W/2,H/2); g.scale(si,si); g.filter=`blur(${8*(1-e)}px)`; g.drawImage(IN,-W/2,-H/2); g.restore(); }},
  };
  C3.TRANS=TRANS;
  // المعالجة الموحّدة (grain + vignette + grade) — تُطبق على كل إطار
  let grainF=[], vign=null;
  function post(g,t){
    g.setTransform(1,0,0,1,0,0);
    g.save(); g.globalCompositeOperation='soft-light'; g.fillStyle='rgba(201,168,106,.16)'; g.fillRect(0,0,W,H); g.restore();
    if(grainF.length){ g.save(); g.globalCompositeOperation='overlay'; g.globalAlpha=.075;
      g.drawImage(grainF[Math.floor(t*12)%grainF.length],0,0,W,H); g.restore(); }
    if(vign) g.drawImage(vign,0,0);
  }
  function render(g,t){
    g.setTransform(1,0,0,1,0,0); g.fillStyle='#04060F'; g.fillRect(0,0,W,H);
    let i=SHOTS.findIndex(s=>t>=s.a&&t<s.b); if(i<0) i=t<(SHOTS[0]?SHOTS[0].a:0)?0:SHOTS.length-1;
    const s=SHOTS[i];
    window.__g=g;
    if(s) s.draw(t);
    g.setTransform(1,0,0,1,0,0);
    if(i>0&&s){
      const tin=s.tin||'whip', T=TRANS[tin], d=(s.tdur||(T?T.dur:0));
      if(T&&t<s.a+d){
        window.__g=bufCtx;
        renderOut(bufCtx,()=>SHOTS[i-1].draw(t));
        window.__g=g;
        inCtx.setTransform(1,0,0,1,0,0); inCtx.clearRect(0,0,W,H); inCtx.drawImage(g.canvas,0,0);
        T.draw(clamp((t-s.a)/d),g,inBuf,buf,{shot:s,i});
        g.setTransform(1,0,0,1,0,0);
      }
    }
    post(g,t);
  }
  C3.render=render;
  C3.init=async (Wv,Hv,extra=[])=>{
    W=Wv; H=Hv;
    buf=mk(W,H); bufCtx=buf.getContext('2d'); inBuf=mk(W,H); inCtx=inBuf.getContext('2d');
    for(let k=0;k<4;k++){ const c=mk(360,640),x=c.getContext('2d'),d=x.createImageData(360,640),r=rng(900+k*17);
      for(let i=0;i<d.data.length;i+=4){const v=r()*255; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255;} x.putImageData(d,0,0); grainF.push(c); }
    vign=mk(W,H); { const x=vign.getContext('2d'),gr=x.createRadialGradient(W/2,H*.46,H*.32,W/2,H/2,H*.95);
      gr.addColorStop(0,'rgba(2,4,12,0)'); gr.addColorStop(1,'rgba(2,4,12,.55)'); x.fillStyle=gr; x.fillRect(0,0,W,H); }
    for(const f of INITS) await f(); for(const f of extra) await f();
    SHOTS.sort((a,b)=>a.a-b.a);
    window.ready=true;
  };
  window.seek=(ctx,rs,t)=>{ return true; }; // تحددها index
  C3.drawFrame=(g,t)=>render(g,t);
})();
