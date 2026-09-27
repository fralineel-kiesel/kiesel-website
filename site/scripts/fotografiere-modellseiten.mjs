// Qualitätsschleife für die Modellseiten (Etappe 4).
//
//   npm run fotos:modellseiten
//
// 1. Fotografiert das Artboard „Modellseite Kiesel 1 Pro“ aus design/kiesel-2.0/, dunkel und hell.
// 2. Fotografiert /kiesel-1-pro/ und /kiesel-1/ bei 1440 und 390 px, dunkel und hell. Mit
//    „weniger Bewegung“, damit die Akku-Story still im Endzustand steht (wie im Artboard).
// 3. Legt nebeneinander: Artboard | Pro-Seite | Kiesel-1-Seite  → vergleich-*.png
//    (Für den Kiesel 1 und für die Handy-Breite gibt es kein Artboard.)
// 4. Akku-Story mit Scroll-Kopplung: an 12 Scroll-Positionen fotografiert und zu einem
//    Kontaktbogen zusammengesetzt → story-<modell>-<breite>-<thema>.png
//
// Ausgabe in scripts/ausgabe/modellseiten/. Braucht einen fertigen Build (das npm-Skript
// baut vorher) und Playwright mit Chromium.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starteServer } from './dist-server.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const aus = path.join(hier, 'ausgabe', 'modellseiten');
fs.mkdirSync(aus, { recursive: true });
const vorlage = pathToFileURL(path.join(hier, '..', '..', 'design', 'kiesel-2.0', 'Kiesel 2.0.html')).href;

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
const THEMEN = { dark: 'dunkel', light: 'hell' };
const SEITEN = { pro: 'kiesel-1-pro/', k1: 'kiesel-1/' };
const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');

// Mehrere Bilder als Raster auf eine Seite legen und fotografieren
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
  // ------------------------------------------------------------- 1. Artboard
  for (const thema of Object.keys(THEMEN)) {
    const seite = await browser.newPage({ viewport: { width: 1600, height: 6000 } });
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
    const rahmen = seite.locator('iframe[title="Modellseite Kiesel 1 Pro"]');
    await rahmen.waitFor({ timeout: 60000 });
    await rahmen.scrollIntoViewIfNeeded();
    const inhalt = await (await rahmen.elementHandle()).contentFrame();
    await inhalt.waitForFunction(() => document.body?.innerText.includes('Gleiche Hand'), null, { timeout: 60000 });
    await inhalt.evaluate(() => document.fonts.ready);
    await seite.waitForTimeout(500);
    await rahmen.screenshot({ path: path.join(aus, `artboard-1440-${THEMEN[thema]}.png`) });
    await seite.close();
  }

  // ------------------------------------------------------------- 2. Seiten (Endzustand)
  for (const thema of Object.keys(THEMEN)) {
    for (const b of [1440, 390]) {
      for (const [modell, adresse] of Object.entries(SEITEN)) {
        const ctx = await browser.newContext({ viewport: { width: b, height: 900 }, colorScheme: thema, reducedMotion: 'reduce' });
        const seite = await ctx.newPage();
        await seite.goto(basis + adresse, { waitUntil: 'load' });
        await seite.evaluate(() => document.fonts.ready);
        await seite.screenshot({ path: path.join(aus, `seite-${modell}-${b}-${THEMEN[thema]}.png`), fullPage: true });
        await ctx.close();
      }
    }
  }

  // ------------------------------------------------------------- 3. Nebeneinander
  for (const thema of Object.values(THEMEN)) {
    await bogen(path.join(aus, `vergleich-1440-${thema}.png`), [
      ['Artboard Kiesel 1 Pro', path.join(aus, `artboard-1440-${thema}.png`)],
      ['Seite Kiesel 1 Pro', path.join(aus, `seite-pro-1440-${thema}.png`)],
      ['Seite Kiesel 1', path.join(aus, `seite-k1-1440-${thema}.png`)],
    ], { spalten: 3, breite: 720 });
    await bogen(path.join(aus, `vergleich-390-${thema}.png`), [
      ['Kiesel 1 Pro', path.join(aus, `seite-pro-390-${thema}.png`)],
      ['Kiesel 1', path.join(aus, `seite-k1-390-${thema}.png`)],
    ], { spalten: 2, breite: 390 });
  }

  // ------------------------------------------------------------- 4. Akku-Story beim Scrollen
  const POSITIONEN = [0, 0.07, 0.14, 0.22, 0.27, 0.38, 0.53, 0.66, 0.74, 0.82, 0.9, 1];
  for (const [modell, adresse] of Object.entries(SEITEN)) {
    for (const [b, h, thema] of [[1440, 900, 'dark'], [390, 844, 'light']]) {
      const ctx = await browser.newContext({ viewport: { width: b, height: h }, colorScheme: thema, ...(b < 900 ? { isMobile: true, hasTouch: true } : {}) });
      const seite = await ctx.newPage();
      await seite.goto(basis + adresse, { waitUntil: 'load' });
      await seite.evaluate(() => document.fonts.ready);
      const m = await seite.evaluate(() => {
        const spur = document.querySelector('[data-spur]'), klebt = spur.querySelector('.klebt');
        return { anfang: spur.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(klebt).top), strecke: spur.offsetHeight - klebt.offsetHeight };
      });
      const bilder = [];
      for (const p of POSITIONEN) {
        await seite.evaluate((y) => new Promise((ok) => { scrollTo(0, y); requestAnimationFrame(() => requestAnimationFrame(ok)); }), m.anfang + p * m.strecke);
        await seite.waitForTimeout(100);
        const datei = path.join(aus, `story-${modell}-${b}-${String(Math.round(p * 100)).padStart(3, '0')}.png`);
        await seite.screenshot({ path: datei });
        const echt = await seite.evaluate(() => document.querySelector('[data-akku-story]').dataset.fortschritt);
        bilder.push([`p = ${echt}`, datei]);
      }
      await bogen(path.join(aus, `story-${modell}-${b}-${THEMEN[thema]}.png`), bilder,
        { spalten: b > 900 ? 4 : 6, breite: b > 900 ? 480 : 260, titel: `Akku-Story ${modell === 'pro' ? 'Kiesel 1 Pro' : 'Kiesel 1'}, ${b} px, ${THEMEN[thema]}` });
      await ctx.close();
    }
  }
  console.log(`✓ Bilder in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
