const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto('file://' + path.resolve(__dirname,'../index.html') + '?scene=opening&rs=0.5');
  await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const info = await p.evaluate(() => {
    const c = window.__ctx, I = window.__IMGS;
    c.font = '800 118px Changa';
    const totalPhrase = c.measureText('معتز أحمد حمود قائد').width;
    const words = 'معتز أحمد حمود قائد'.split(' ').map(w => c.measureText(w).width);
    return {
      canvas: [c.canvas.width, c.canvas.height], rs: window.__RS,
      sky: I.sky ? [I.sky.width, I.sky.height] : null,
      burst: I.burst ? [I.burst.width, I.burst.height] : null,
      logo: I.logo ? [I.logo.width, I.logo.height] : null,
      totalPhrase, words, dir: c.direction, align: c.textAlign,
      fontsLoaded: document.fonts.check('800 118px Changa')
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await b.close();
})();
