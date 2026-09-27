// Qualitätsschleife für /funktionen/, /zubehoer/ und /zubehoer/huelle/ (Etappe 5).
//
//   npm run fotos:funktionen
//
// 1. Fotografiert die Artboards „Funktionen“, „Zubehör“ und „Kiesel-Hülle“ aus
//    design/kiesel-2.0/, dunkel und hell.
// 2. Fotografiert die Seiten bei 1440 und 390 px, dunkel und hell, mit „weniger Bewegung“
//    (alles steht still im Endzustand). /funktionen/ zusätzlich im Zustand des Artboards:
//    Kamera bei 6x auf dem Gipfel, Gipfelkreuz, Seilschaft und SAC-Hütte gefunden.
// 3. Legt nebeneinander: Artboard | Seite (1440) → vergleich-<seite>-<thema>.png,
//    und die Handy-Ansichten → handy-<thema>.png
//
// Ausgabe in scripts/ausgabe/funktionen/. Braucht einen fertigen Build (das npm-Skript baut
// vorher) und Playwright mit Chromium.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starteServer } from './dist-server.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const aus = path.join(hier, 'ausgabe', 'funktionen');
const roh = path.join(aus, 'einzelbilder');
fs.mkdirSync(roh, { recursive: true });
const vorlage = pathToFileURL(path.join(hier, '..', '..', 'design', 'kiesel-2.0', 'Kiesel 2.0.html')).href;

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
const THEMEN = { dark: 'dunkel', light: 'hell' };
// [Datei, Titel des Artboards, Text zum Warten, Adresse]
const SEITEN = [
  ['funktionen', 'Funktionen', 'Privacy-Modus', 'funktionen/'],
  ['zubehoer', 'Zubehör', 'Frei kombinieren', 'zubehoer/'],
  ['huelle', 'Kiesel-Hülle', 'Technische Details', 'zubehoer/huelle/'],
];
const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');

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

try {
  // ------------------------------------------------------------- 1. Artboards
  for (const thema of Object.keys(THEMEN)) {
    const seite = await browser.newPage({ viewport: { width: 1600, height: 5000 } });
    // Wie in fotografiere-startseite.mjs: Für „Hell“ die Voreinstellung im Blob austauschen
    if (thema === 'light') {
      await seite.addInitScript(() => {
        const B = window.Blob, dec = new TextDecoder();
        window.Blob = class extends B {
          constructor(teile = [], opt) {
            super(teile.map((t) => {
              const s = typeof t === 'string' ? t : (t instanceof Uint8Array || t instanceof ArrayBuffer) ? dec.decode(t) : null;
              if (s === null || !s.includes('THEMES.Dunkel')) return t;
              return s.split('THEMES[this.props.thema] || THEMES.Dunkel').join('THEMES.Hell').split('background:#0C1116').join('background:#EEF0F1');
            }), opt);
          }
        };
      });
    }
    await seite.goto(vorlage);
    for (const [datei, titel, text] of SEITEN) {
      const rahmen = seite.locator(`iframe[title="${titel}"]`);
      await rahmen.waitFor({ timeout: 60000 });
      await rahmen.scrollIntoViewIfNeeded();
      const inhalt = await (await rahmen.elementHandle()).contentFrame();
      await inhalt.waitForFunction((t) => document.body?.innerText.includes(t), text, { timeout: 60000 });
      await inhalt.evaluate(() => document.fonts.ready);
      await seite.waitForTimeout(500);
      await rahmen.screenshot({ path: path.join(roh, `artboard-${datei}-${THEMEN[thema]}.png`) });
    }
    await seite.close();
  }

  // ------------------------------------------------------------- 2. Seiten
  for (const thema of Object.keys(THEMEN)) {
    for (const b of [1440, 390]) {
      for (const [datei, , , adresse] of SEITEN) {
        const ctx = await browser.newContext({ viewport: { width: b, height: 900 }, colorScheme: thema, reducedMotion: 'reduce', ...(b < 900 ? { isMobile: true, hasTouch: true } : {}) });
        const seite = await ctx.newPage();
        await seite.goto(basis + adresse, { waitUntil: 'load' });
        await seite.evaluate(() => document.fonts.ready);
        if (datei === 'funktionen') {
          // Zustand wie im Artboard: SAC-Hütte, Seilschaft, Gipfelkreuz gefunden, 6x auf dem Gipfel
          await seite.evaluate(async () => {
            const k = document.querySelector('[data-kamera-suche]').kamera;
            const bild = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
            for (const i of [3, 1, 0]) { k.fliegeZu(i); await bild(); }
            k.schwenkeZu([760, 222]); await bild();
            k.setzeZoom(6); await bild(); await bild();
          });
          await seite.waitForTimeout(300);
        }
        await seite.screenshot({ path: path.join(roh, `seite-${datei}-${b}-${THEMEN[thema]}.png`), fullPage: true });
        await ctx.close();
      }
    }
  }

  // ------------------------------------------------------------- 3. Nebeneinander
  for (const thema of Object.values(THEMEN)) {
    for (const [datei, titel] of SEITEN) {
      await bogen(path.join(aus, `vergleich-${datei}-${thema}.png`), [
        [`Artboard „${titel}“`, path.join(roh, `artboard-${datei}-${thema}.png`)],
        [`Seite, ${thema}`, path.join(roh, `seite-${datei}-1440-${thema}.png`)],
      ], { spalten: 2, breite: 720 });
    }
    await bogen(path.join(aus, `handy-${thema}.png`), SEITEN.map(([datei, titel]) => [titel, path.join(roh, `seite-${datei}-390-${thema}.png`)]),
      { spalten: 3, breite: 390, titel: `Handy (390 px), ${thema} (für diese Breite gibt es kein Artboard)` });
  }
  console.log(`✓ Bilder in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
