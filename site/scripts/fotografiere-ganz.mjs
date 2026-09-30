// Fotos aller Seiten für die Schlussprüfung (Etappe 7):
//
//   npm run fotos:ganz
//
// 1. Jede Seite aus scripts/seiten.mjs ganz (fullPage) bei 1440 und 390 px, dunkel und hell.
//    Pro Seite ein Bogen mit den vier Fotos nebeneinander → scripts/ausgabe/ganz/<seite>.png
//    Mit „weniger Bewegung“, damit alles im Endzustand steht (die 3D-Bühne zeigt dann ihre
//    2D-Grafik; 3D selbst fotografiert fotos:startseite).
// 2. Die vier Artboards von Etappe 7 neben ihren Seiten (1440, dunkel und hell)
//    → scripts/ausgabe/ganz/vergleich-<seite>-<thema>.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { SEITEN } from './seiten.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const ziel = path.join(hier, 'ausgabe', 'ganz');
const roh = path.join(ziel, 'roh');
fs.mkdirSync(roh, { recursive: true });
const vorlage = pathToFileURL(path.join(hier, '..', '..', 'design', 'kiesel-2.0', 'Kiesel 2.0.html')).href;
const THEMEN = { dark: 'dunkel', light: 'hell' };
const name = (adresse) => (adresse.replace(/\.html$/, '').replace(/\/$/, '').replace(/\//g, '-') || 'startseite');
const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();

async function bogen(datei, bilder, titel) {
  const seite = await browser.newPage({ viewport: { width: 1800, height: 600 } });
  await seite.setContent(`<body style="margin:0;background:#888;font:600 18px sans-serif;color:#111">
    <p style="margin:16px 20px 0">${titel}</p>
    <div style="display:flex;gap:20px;padding:20px;align-items:flex-start">
      ${bilder.map(([text, d, b]) => `<figure style="margin:0;width:${b}px"><figcaption style="margin-bottom:6px">${text}</figcaption><img src="${alsDaten(d)}" style="display:block;width:${b}px"></figure>`).join('')}
    </div></body>`);
  await seite.screenshot({ path: datei, fullPage: true });
  await seite.close();
}

try {
  // ------------------------------------------------------------- 1. Alle Seiten
  for (const [adresse, titel] of SEITEN) {
    const bilder = [];
    for (const breite of [1440, 390]) {
      for (const thema of Object.keys(THEMEN)) {
        const ctx = await browser.newContext({ viewport: { width: breite, height: breite > 900 ? 900 : 844 }, colorScheme: thema, reducedMotion: 'reduce', ...(breite < 900 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : {}) });
        const seite = await ctx.newPage();
        await seite.goto(basis + adresse, { waitUntil: 'load' });
        await seite.evaluate(() => document.fonts.ready);
        await seite.waitForTimeout(400);
        const datei = path.join(roh, `${name(adresse)}-${breite}-${THEMEN[thema]}.png`);
        await seite.screenshot({ path: datei, fullPage: true });
        bilder.push([`${breite} px, ${THEMEN[thema]}`, datei, breite > 900 ? 560 : 280]);
        await ctx.close();
      }
    }
    await bogen(path.join(ziel, `${name(adresse)}.png`), bilder, `${titel} (/${adresse})`);
    console.log(`✓ ${titel}`);
  }

  // ------------------------------------------------------------- 2. Artboards von Etappe 7
  const NEU = [['vergleichen', 'Vergleichen', 'Kreditkarte', 'vergleichen/'], ['technik', 'Technische Daten', 'Nur Unterschiede', 'kiesel-1/technik/'], ['akku-rechner', 'Akku-Rechner', 'So wird gerechnet', 'akku-rechner/'], ['faq', 'FAQ', 'Deine Frage', 'faq/']];
  for (const thema of Object.keys(THEMEN)) {
    const seite = await browser.newPage({ viewport: { width: 1600, height: 5000 } });
    // Wie in fotografiere-funktionen.mjs: Für „Hell“ die Voreinstellung im Blob austauschen
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
    for (const [datei, titel, text] of NEU) {
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
    for (const [datei, titel, , adresse] of NEU) {
      await bogen(path.join(ziel, `vergleich-${datei}-${THEMEN[thema]}.png`), [
        [`Artboard „${titel}“`, path.join(roh, `artboard-${datei}-${THEMEN[thema]}.png`), 720],
        [`/${adresse}`, path.join(roh, `${name(adresse)}-1440-${THEMEN[thema]}.png`), 720],
      ], `${titel}, ${THEMEN[thema]}: Artboard | Seite`);
      console.log(`✓ Artboard ${titel} (${THEMEN[thema]})`);
    }
  }
} finally {
  await browser.close();
  await schliessen();
}
console.log(`\nFotos in ${path.relative(process.cwd(), ziel)}/`);
