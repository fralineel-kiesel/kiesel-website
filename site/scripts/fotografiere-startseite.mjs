// Qualitätsschleife für die Startseite (Etappe 3).
//
//   npm run fotos:startseite
//
// 1. Fotografiert die Artboards „Startseite Desktop“ und „Startseite Handy“ aus
//    design/kiesel-2.0/Kiesel 2.0.html, dunkel und hell.
// 2. Fotografiert die gebaute Startseite bei 1440 und 390 px, dunkel und hell. Dabei
//    läuft die 2D-Ausweichlösung (reducedMotion), damit das Bild mit dem Artboard
//    vergleichbar ist (das 3D-Modell dreht sich ja).
// 3. Legt je Artboard und Seite nebeneinander: scripts/ausgabe/startseite/vergleich-*.png
// 4. Fotografiert die 3D-Bühne (?3d=foto: Software-Grafik erlaubt, Wächter aus, weil headless
//    Chrome keine Grafikkarte hat) in allen fünf Farben und beiden Themen: 3d-*.png
//
// Braucht einen fertigen Build in dist/ (das npm-Skript baut vorher) und Playwright
// mit Chromium (einmalig: npx playwright install chromium).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { FARBNAMEN } from '../src/data/farben.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
const aus = path.join(hier, 'ausgabe', 'startseite');
fs.mkdirSync(aus, { recursive: true });
const vorlage = pathToFileURL(path.join(hier, '..', '..', 'design', 'kiesel-2.0', 'Kiesel 2.0.html')).href;

// Headless Chrome rechnet WebGL in Software (SwiftShader); das muss man erlauben.
// Achtung: Mit Software-Grafik bleibt requestAnimationFrame hier nach ein paar Bildern
// stehen (die Drehung friert ein), gezeichnet wird trotzdem bei jedem Screenshot und
// Farbwechsel. Für Fotos reicht das. Mit --disable-frame-rate-limit würde es drehen, dafür
// hängen dann die Screenshots (siehe pruefe-startseite.mjs).
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const { basis, schliessen } = await starteServer();
const THEMEN = { dark: 'dunkel', light: 'hell' };
const BREITEN = { 1440: 'Startseite Desktop', 390: 'Startseite Handy' };

try {
  // ------------------------------------------------------------- 1. Artboards
  for (const thema of Object.keys(THEMEN)) {
    const seite = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    // Die Leinwand baut ihre Artboards zur Laufzeit aus Blobs. Für „Hell“ tauschen wir
    // die Voreinstellung (THEMES.Dunkel) aus, bevor der Blob entsteht.
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
    // Die Leinwand zeichnet ein Artboard erst, wenn es im Bild ist. Darum: Fenster so hoch
    // wie das Artboard, hinscrollen und warten, bis der Titel samt Schrift dasteht.
    await seite.setViewportSize({ width: 1600, height: 6000 });
    for (const [b, titel] of Object.entries(BREITEN)) {
      const rahmen = seite.locator(`iframe[title="${titel}"]`);
      await rahmen.waitFor({ timeout: 60000 });
      await rahmen.scrollIntoViewIfNeeded();
      const inhalt = await (await rahmen.elementHandle()).contentFrame();
      await inhalt.waitForFunction(() => document.body?.innerText.includes('Passt in jede Hand'), null, { timeout: 60000 });
      await inhalt.evaluate(() => document.fonts.ready);
      await seite.waitForTimeout(500);
      await rahmen.screenshot({ path: path.join(aus, `artboard-${b}-${THEMEN[thema]}.png`) });
    }
    await seite.close();
  }

  // ------------------------------------------------------------- 2. Seite (2D)
  for (const thema of Object.keys(THEMEN)) {
    for (const b of Object.keys(BREITEN)) {
      const ctx = await browser.newContext({ viewport: { width: +b, height: 900 }, colorScheme: thema, reducedMotion: 'reduce' });
      const seite = await ctx.newPage();
      await seite.goto(basis, { waitUntil: 'load' });
      await seite.evaluate(() => document.fonts.ready);
      await seite.screenshot({ path: path.join(aus, `seite-${b}-${THEMEN[thema]}.png`), fullPage: true });
      await ctx.close();
    }
  }

  // ------------------------------------------------------------- 3. Nebeneinander
  const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');
  for (const thema of Object.values(THEMEN)) {
    for (const b of Object.keys(BREITEN)) {
      const links = path.join(aus, `artboard-${b}-${thema}.png`), rechts = path.join(aus, `seite-${b}-${thema}.png`);
      const seite = await browser.newPage({ viewport: { width: 2 * +b + 60, height: 800 } });
      await seite.setContent(`<body style="margin:0;background:#888;font:600 20px sans-serif">
        <div style="display:flex;gap:20px;padding:20px;align-items:flex-start">
          <figure style="margin:0"><figcaption>Artboard</figcaption><img src="${alsDaten(links)}" style="display:block;width:${b}px"></figure>
          <figure style="margin:0"><figcaption>Seite</figcaption><img src="${alsDaten(rechts)}" style="display:block;width:${b}px"></figure>
        </div></body>`);
      await seite.screenshot({ path: path.join(aus, `vergleich-${b}-${thema}.png`), fullPage: true });
      await seite.close();
    }
  }

  // ------------------------------------------------------------- 4. 3D-Bühne
  for (const thema of Object.keys(THEMEN)) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: thema });
    const seite = await ctx.newPage();
    await seite.goto(basis + '?3d=foto', { waitUntil: 'load' });
    const buehne = seite.locator('[data-buehne3d]');
    await seite.waitForFunction(() => document.querySelector('[data-buehne3d]').dataset.modus === '3d', null, { timeout: 60000 });
    await buehne.scrollIntoViewIfNeeded();
    for (const farbe of FARBNAMEN) {
      await seite.locator(`[data-buehne3d] label[title="${farbe}"]`).click();
      await seite.waitForTimeout(700);
      await buehne.screenshot({ path: path.join(aus, `3d-${THEMEN[thema]}-${farbe}.png`) });
      const modus = await buehne.getAttribute('data-modus');
      if (modus !== '3d') throw new Error(`3D-Foto ${farbe}: Bühne ist auf ${modus} (${await buehne.getAttribute('data-grund')})`);
    }
    await ctx.close();
  }
  console.log(`✓ Bilder in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
