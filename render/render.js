/* مُصيّر الإطارات — تشغيل: node render/render.js --scene opening --dur 20 --fps 12 --rs 0.5 */
'use strict';
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');

function arg(k, d){ const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i+1] : d; }
const SCENE = arg('scene', 'hall');
const DUR = parseFloat(arg('dur', '20'));
const FPS = parseInt(arg('fps', '12'));
const RS = parseFloat(arg('rs', '0.5'));
const FROM = parseInt(arg('from', '0'));
const TO = parseInt(arg('to', String(Math.round(DUR*FPS))));

const DIR = path.resolve(__dirname, `frames_${SCENE}`);
fs.mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Math.round(1080*RS), height: Math.round(1920*RS) } });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  page.on('console', m => { const s = m.text(); if (!/Download the React/i.test(s)) console.log('[page]', s); });
  const url = 'file://' + path.resolve(__dirname, '../index.html') + `?scene=${SCENE}&rs=${RS}`;
  await page.goto(url);
  await page.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const cues = await page.evaluate(() => window.CUES || []);
  fs.writeFileSync(path.resolve(__dirname, `cues_${SCENE}.json`), JSON.stringify(cues));
  if (cues.length) console.log(`cues: ${cues.length} events dumped`);
  console.log(`READY scene=${SCENE} rs=${RS} viewport=${Math.round(1080*RS)}x${Math.round(1920*RS)} frames[${FROM}..${TO})`);
  let skipped = 0;
  for (let f = FROM; f < TO; f++){
    const fp = path.join(DIR, `f${String(f).padStart(5,'0')}.jpg`);
    if (fs.existsSync(fp) && fs.statSync(fp).size > 2000){ skipped++; continue; }
    const t = f / FPS;
    await page.evaluate(tt => window.seek(tt), t);
    await page.screenshot({ path: fp, type: 'jpeg', quality: 92 });
    if (f % 24 === 0) console.log(`frame ${f}/${TO} t=${t.toFixed(2)}s`);
  }
  console.log(`RENDER-DONE frames=${TO-FROM} skipped=${skipped}`);
  await browser.close();
})();
