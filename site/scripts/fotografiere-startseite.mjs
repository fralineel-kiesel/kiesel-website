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
//    Chrome keine Grafikkarte hat): beide Modelle in allen fünf Farben, 1440 und 390 px, beide
//    Themen (3d-<breite>-<thema>-<modell>-<farbe>.png, 40 Bilder) und je Breite und Thema ein
//    Bogen mit allen zehn (3d-bogen-<breite>-<thema>.png)
// 5. 3D gegen 2D: beide Modelle gerade von hinten (?3d=gerade), daneben die Rückseite aus dem
//    Zeichen-Motor im selben Massstab, dazu übereinandergelegt (3d-gegen-2d.png). Die Zahlen
//    dazu misst pruefe:startseite.
//
// Braucht einen fertigen Build in dist/ (das npm-Skript baut vorher) und Playwright
// mit Chromium (einmalig: npx playwright install chromium).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { FARBNAMEN } from '../src/data/farben.js';
import { KIESEL_IDS } from '../src/data/geraete.js';
import { MODELLE } from '../src/data/modelle.js';
import { handy } from '../src/lib/kiesel-draw/phone.js';
import { MODELS } from '../src/lib/kiesel-draw/models.js';

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
  const bogen = (titel, bilder, spalten, breite) => `<body style="margin:0;background:#888;font:600 16px sans-serif">
    <h1 style="font-size:20px;margin:16px 20px 0">${titel}</h1>
    <div style="display:grid;grid-template-columns:repeat(${spalten},${breite}px);gap:12px;padding:16px 20px">
      ${bilder.map(([text, datei]) => `<figure style="margin:0"><figcaption style="margin-bottom:4px">${text}</figcaption><img src="${alsDaten(datei)}" style="display:block;width:${breite}px"></figure>`).join('')}
    </div></body>`;
  for (const thema of Object.keys(THEMEN)) {
    for (const b of Object.keys(BREITEN)) {
      const bilder = [];
      for (const modell of KIESEL_IDS) {
        const ctx = await browser.newContext({ viewport: { width: +b, height: 900 }, colorScheme: thema });
        // Modell per gespeicherter Wahl vorgeben: so steht es von Anfang an da, ohne Übergang
        await ctx.addInitScript((m) => localStorage.setItem('kiesel-startmodell', m), modell);
        const seite = await ctx.newPage();
        await seite.goto(basis + '?3d=foto', { waitUntil: 'load' });
        const buehne = seite.locator('[data-buehne3d]');
        await seite.waitForFunction(() => document.querySelector('[data-buehne3d]').dataset.modus === '3d', null, { timeout: 60000 });
        await buehne.scrollIntoViewIfNeeded();
        for (const farbe of FARBNAMEN) {
          await seite.locator(`[data-buehne3d] label[title="${farbe}"]`).click();
          await seite.waitForTimeout(700);
          const datei = path.join(aus, `3d-${b}-${THEMEN[thema]}-${modell}-${farbe}.png`);
          await buehne.screenshot({ path: datei });
          bilder.push([`${MODELLE[modell].name}, ${farbe}`, datei]);
          const modus = await buehne.getAttribute('data-modus');
          if (modus !== '3d') throw new Error(`3D-Foto ${modell} ${farbe}: Bühne ist auf ${modus} (${await buehne.getAttribute('data-grund')})`);
        }
        await ctx.close();
      }
      const breiteBild = +b > 900 ? 440 : 300;
      const seite = await browser.newPage({ viewport: { width: 5 * (breiteBild + 12) + 40, height: 800 } });
      await seite.setContent(bogen(`3D-Bühne ${b} px, ${THEMEN[thema]}`, bilder, 5, breiteBild));
      await seite.screenshot({ path: path.join(aus, `3d-bogen-${b}-${THEMEN[thema]}.png`), fullPage: true });
      await seite.close();
    }
  }

  // ------------------------------------------------------------- 5. 3D gegen 2D
  // Aus der 3D-Leinwand nur das Handy ausschneiden (deckende Pixel, ohne Bodenschatten).
  // preserveDrawingBuffer, damit die Pixel nach dem Zeichnen lesbar bleiben.
  const LESBAR = () => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (typ, opt) {
      return orig.call(this, typ, typ === 'webgl2' ? { ...opt, preserveDrawingBuffer: true } : opt);
    };
  };
  const zeilen = [];
  for (const modell of KIESEL_IDS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', deviceScaleFactor: 2 });
    await ctx.addInitScript(LESBAR);
    await ctx.addInitScript((m) => localStorage.setItem('kiesel-startmodell', m), modell);
    const seite = await ctx.newPage();
    await seite.goto(basis + '?3d=gerade', { waitUntil: 'load' });
    await seite.waitForFunction(() => document.querySelector('[data-buehne3d]').dataset.modus === '3d', null, { timeout: 60000 });
    await seite.waitForTimeout(700);
    const ausschnitt = await seite.evaluate(() => {
      const q = document.querySelector('[data-buehne3d] canvas.leinwand-3d');
      const c = document.createElement('canvas');
      c.width = q.width; c.height = q.height;
      const g = c.getContext('2d');
      g.drawImage(q, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        if (d[(y * c.width + x) * 4 + 3] > 230) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
      const k = document.createElement('canvas');
      k.width = x1 - x0 + 1; k.height = y1 - y0 + 1;
      k.getContext('2d').drawImage(c, x0, y0, k.width, k.height, 0, 0, k.width, k.height);
      return { bild: k.toDataURL('image/png'), breite: k.width, hoehe: k.height };
    });
    await ctx.close();
    // 2D: Rückseite ohne Drehung, viewBox genau ums Gehäuse, so hoch wie das Handy im 3D-Bild
    const svg = handy({ ansicht: 'hinten', modell, farbe: 'Himmelblau', drehung: 0, hoehe: null, label: '' });
    zeilen.push({ modell, ...ausschnitt, svg });
  }
  const massstab = 0.5; // Bildpunkte → CSS-Pixel (deviceScaleFactor 2)
  const html = `<body style="margin:0;background:#fff;font:600 16px sans-serif;color:#111">
    <h1 style="font-size:20px;margin:16px 20px">3D (gerade von hinten) gegen 2D (Zeichen-Motor), gleicher Massstab</h1>
    <div style="display:flex;gap:48px;padding:0 20px 20px;align-items:flex-end">
    ${zeilen.map((z) => {
      const h = z.hoehe * massstab, w = z.breite * massstab;
      const bild3d = `<img src="${z.bild}" style="display:block;height:${h}px">`;
      const svg2d = (breite) => `<div style="width:${breite}px;height:${h}px;display:flex;justify-content:center">${z.svg
        .replace(/viewBox="[^"]*"/, `viewBox="0 0 ${MODELS[z.modell].W} ${MODELS[z.modell].H}"`)
        .replace('<svg ', `<svg height="${h}" `)}</div>`;
      return `<figure style="margin:0"><figcaption>${MODELLE[z.modell].name}: 3D | 2D | übereinander</figcaption>
        <div style="display:flex;gap:16px;align-items:flex-end">
          ${bild3d}${svg2d(w)}
          <div style="position:relative;width:${w}px;height:${h}px">${svg2d(w)}<div style="position:absolute;inset:0;opacity:0.55;display:flex;justify-content:center">${bild3d}</div></div>
        </div></figure>`;
    }).join('')}
    </div></body>`;
  const seite = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await seite.setContent(html);
  await seite.screenshot({ path: path.join(aus, '3d-gegen-2d.png'), fullPage: true });
  await seite.close();
  console.log(`✓ Bilder in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
