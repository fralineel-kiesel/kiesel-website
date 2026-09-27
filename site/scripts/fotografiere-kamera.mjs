// Qualitätsschleife für die Kamera-Demos (Etappe 5).
//
//   npm run fotos:kamera
//
// 1. Linsenwechsel als Filmstreifen: Die Uhr der Seite steht still (Playwright page.clock)
//    und wird in 40-ms-Schritten weitergeschaltet. Standbilder bei 2.8x, 3.0x und 3.2x,
//    dazu jedes Bild des Wechsels 2.8x → 3.0x (hoch) und 3.2x → 2.8x (runter).
//    Einmal das ganze Bild, einmal ein 100-%-Ausschnitt rechts der Trennlinie (Pro), wo man
//    Überblendung, Versatz und das Einrasten der Schärfe wirklich sieht.
//    1440 und 390 px, dunkel und hell → wechsel-<breite>-<thema>.png, wechsel-nah-….png
// 2. Flug zu einem Detail (Kachel „Segelboot“), alle 150 ms ein Bild, Pro und Kiesel 1
//    → flug-<modell>-<breite>.png
// (Die Bausteine nach dem Artboard „Funktionen“ vergleicht npm run fotos:funktionen.)
//
// Ausgabe in scripts/ausgabe/kamera/. Braucht einen fertigen Build (das npm-Skript baut
// vorher) und Playwright mit Chromium.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const aus = path.join(hier, 'ausgabe', 'kamera');
const roh = path.join(aus, 'einzelbilder');
fs.mkdirSync(roh, { recursive: true });

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
const THEMEN = { dark: 'dunkel', light: 'hell' };
const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');

// Mehrere Bilder als Raster auf eine Seite legen und fotografieren (wie fotos:modellseiten)
async function bogen(ziel, bilder, { spalten, breite, titel }) {
  const seite = await browser.newPage({ viewport: { width: spalten * (breite + 20) + 20, height: 600 } });
  await seite.setContent(`<body style="margin:0;background:#888;font:600 18px sans-serif;color:#111">
    ${titel ? `<p style="margin:16px 20px 0">${titel}</p>` : ''}
    <div style="display:grid;grid-template-columns:repeat(${spalten},${breite}px);gap:20px;padding:20px;align-items:start">
      ${bilder.map(([text, datei]) => `<figure style="margin:0"><figcaption style="margin-bottom:6px">${text}</figcaption><img src="${alsDaten(datei)}" style="display:block;width:${breite}px"></figure>`).join('')}
    </div></body>`);
  await seite.screenshot({ path: ziel, fullPage: true });
  await seite.close();
}

// Seite mit angehaltener Uhr öffnen: Zeit läuft nur mit runFor() weiter
async function oeffne(adresse, b, h, thema) {
  const ctx = await browser.newContext({ viewport: { width: b, height: h }, colorScheme: thema, ...(b < 900 ? { isMobile: true, hasTouch: true } : {}) });
  const seite = await ctx.newPage();
  await seite.clock.install({ time: new Date('2026-09-27T10:00:00') });
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  await seite.clock.pauseAt(new Date('2026-09-27T10:00:02'));
  await seite.evaluate(() => document.fonts.ready);
  await seite.clock.runFor(500);
  const fenster = seite.locator('[data-fenster]').first();
  await fenster.scrollIntoViewIfNeeded();
  return { ctx, seite, fenster };
}
const zoome = (seite, z) => seite.evaluate((z) => document.querySelector('[data-fenster]').parentElement.kamera.setzeZoom(z), z);

try {
  // ------------------------------------------------------------- 1. Linsenwechsel
  const SCHRITTE = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 480];
  for (const thema of Object.keys(THEMEN)) {
    for (const [b, h] of [[1440, 900], [390, 844]]) {
      const { ctx, seite, fenster } = await oeffne('kiesel-1-pro/', b, h, thema);
      const box = await fenster.boundingBox();
      // Ausschnitt rechts der Trennlinie, 100 %: rund ums Gipfelkreuz und den Grat
      const nah = { x: box.x + box.width / 2 + 4, y: box.y + box.height * 0.08, width: Math.min(480, box.width / 2 - 8), height: Math.min(300, box.height * 0.6) };
      const ganz = [], naeher = [];
      const foto = async (name, text) => {
        const d1 = path.join(roh, `${b}-${thema}-${name}.png`), d2 = path.join(roh, `${b}-${thema}-${name}-nah.png`);
        await fenster.screenshot({ path: d1 });
        await seite.screenshot({ path: d2, clip: nah });
        ganz.push([text, d1]);
        naeher.push([text, d2]);
      };
      const stand = async (z) => { await zoome(seite, z); await seite.clock.runFor(1000); await foto(`stand-${z}`, `${z}x, Ruhe`); };
      const film = async (von, nach, wort) => {
        await zoome(seite, von);
        await seite.clock.runFor(1000);
        await zoome(seite, nach);
        let bisher = 0;
        for (const t of SCHRITTE) {
          await seite.clock.runFor(Math.max(17, t - bisher));
          bisher = Math.max(17, t);
          await foto(`${wort}-${String(t).padStart(3, '0')}`, `${von}x → ${nach}x, +${t} ms`);
        }
      };
      await stand(2.8);
      await stand(3);
      await stand(3.2);
      await film(2.8, 3, 'hoch');
      await film(3.2, 2.8, 'runter');
      const titel = `Linsenwechsel Kiesel 1 Pro, ${b} px, ${THEMEN[thema]}`;
      await bogen(path.join(aus, `wechsel-${b}-${THEMEN[thema]}.png`), ganz, { spalten: b > 900 ? 5 : 6, breite: b > 900 ? 420 : 240, titel });
      await bogen(path.join(aus, `wechsel-nah-${b}-${THEMEN[thema]}.png`), naeher, { spalten: 6, breite: Math.round(nah.width), titel: titel + ', Ausschnitt 100 %' });
      await ctx.close();
    }
  }

  // ------------------------------------------------------------- 2. Flug zu einem Detail
  for (const [modell, adresse] of [['pro', 'kiesel-1-pro/'], ['k1', 'kiesel-1/']]) {
    for (const [b, h, thema] of [[1440, 900, 'dark'], [390, 844, 'light']]) {
      const { ctx, seite, fenster } = await oeffne(adresse, b, h, thema);
      await seite.locator('[data-detail="6"]').click(); // Segelboot
      await fenster.scrollIntoViewIfNeeded();
      const bilder = [];
      for (let t = 0; t <= 2100; t += 150) {
        await seite.clock.runFor(t ? 150 : 17);
        const datei = path.join(roh, `flug-${modell}-${b}-${t}.png`);
        await fenster.screenshot({ path: datei });
        bilder.push([`+${t} ms`, datei]);
      }
      await bogen(path.join(aus, `flug-${modell}-${b}.png`), bilder,
        { spalten: 5, breite: b > 900 ? 420 : 240, titel: `Flug zum Segelboot, ${modell === 'pro' ? 'Kiesel 1 Pro' : 'Kiesel 1'}, ${b} px` });
      await ctx.close();
    }
  }

  console.log(`✓ Bilder in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
