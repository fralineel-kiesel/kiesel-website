// Qualitätsschleife für /kaufen/, Schublade, /warenkorb/ und Kasse (Etappe 6).
//
//   npm run fotos:kaufen
//
// 1. Fotografiert die Artboards „Kaufen“ und „Warenkorb-Schublade“ aus design/kiesel-2.0/,
//    dunkel und hell.
// 2. Fotografiert die Seiten im Zustand der Artboards (Pro, Himmelblau, 512 GB, Hülle Mattweiss;
//    im Warenkorb dazu die Gravur „Linos Kiesel“) bei 1440 und 390 px, dunkel und hell:
//    /kaufen/, /kaufen/ mit offener Schublade, /warenkorb/ und den Kassen-Dialog.
// 3. Legt nebeneinander: Artboard | Seite → vergleich-<kaufen|schublade>-<thema>.png,
//    /warenkorb/ und Kasse (kein Artboard) → warenkorb-<thema>.png, Handy → handy-<thema>.png
//
// Ausgabe in scripts/ausgabe/kaufen/. Braucht einen fertigen Build (das npm-Skript baut vorher).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starteServer } from './dist-server.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const aus = path.join(hier, 'ausgabe', 'kaufen');
const roh = path.join(aus, 'einzelbilder');
fs.mkdirSync(roh, { recursive: true });
const vorlage = pathToFileURL(path.join(hier, '..', '..', 'design', 'kiesel-2.0', 'Kiesel 2.0.html')).href;

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
const THEMEN = { dark: 'dunkel', light: 'hell' };
const ARTBOARDS = [['kaufen', 'Kaufen', 'Gravur'], ['schublade', 'Warenkorb-Schublade', 'Zwischensumme']];
// Warenkorb wie im Artboard „Warenkorb-Schublade“
const KORB = JSON.stringify([
  { art: 'handy', modell: 'pro', farbe: 'Himmelblau', speicher: '512gb', gravur: 'Linos Kiesel', anzahl: 1 },
  { art: 'huelle', modell: 'pro', farbe: 'Mattweiss', anzahl: 1 },
]);
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
    for (const [datei, titel, text] of ARTBOARDS) {
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
      const hoehe = b < 900 ? 844 : 900;
      const ctx = await browser.newContext({ viewport: { width: b, height: hoehe }, colorScheme: thema, reducedMotion: 'reduce', ...(b < 900 ? { isMobile: true, hasTouch: true } : {}) });
      const t = THEMEN[thema];
      const seite = await ctx.newPage();
      const laden = async (adresse) => {
        await seite.goto(basis + adresse, { waitUntil: 'load' });
        await seite.evaluate(() => document.fonts.ready);
        await seite.evaluate(() => window.scrollTo(0, 0));
      };
      // Kaufen im Zustand des Artboards (leerer Warenkorb, damit der Zähler wie dort „2“ zeigt: danach füllen)
      await laden('kaufen/?modell=pro&farbe=Himmelblau&speicher=512gb&huelle=Mattweiss');
      await seite.evaluate((k) => localStorage.setItem('kiesel-warenkorb', k), KORB);
      await laden('kaufen/?modell=pro&farbe=Himmelblau&speicher=512gb&huelle=Mattweiss');
      await seite.screenshot({ path: path.join(roh, `seite-kaufen-${b}-${t}.png`), fullPage: true });

      // Schublade offen (Bildschirmfoto wie das Artboard: 1440 × 900)
      await seite.locator('button[data-warenkorb-knopf]').click();
      await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
      await seite.waitForTimeout(200);
      await seite.screenshot({ path: path.join(roh, `seite-schublade-${b}-${t}.png`) });

      // Kasse über der Schublade
      await seite.locator('[data-schublade] [data-zur-kasse]').click();
      await seite.waitForTimeout(200);
      await seite.screenshot({ path: path.join(roh, `seite-kasse-${b}-${t}.png`) });

      // /warenkorb/, ganze Seite
      await laden('warenkorb/');
      await seite.screenshot({ path: path.join(roh, `seite-warenkorb-${b}-${t}.png`), fullPage: true });

      // Leerer Warenkorb in der Schublade (mit Tastatur-Fokus, um den Fokusring zu zeigen)
      await seite.evaluate(() => localStorage.removeItem('kiesel-warenkorb'));
      await laden('kaufen/');
      await seite.locator('button[data-warenkorb-knopf]').focus();
      await seite.keyboard.press('Enter');
      await seite.waitForTimeout(200);
      await seite.screenshot({ path: path.join(roh, `seite-leer-${b}-${t}.png`) });

      // Gravur mit Fehler (nur Desktop, Ausschnitt der Wahl)
      if (b === 1440) {
        await seite.keyboard.press('Escape');
        await seite.locator('#gravur').fill('Linos @Kiesel');
        await seite.locator('.block:has(#gravur)').screenshot({ path: path.join(roh, `seite-gravurfehler-${t}.png`) });
      }
      await ctx.close();
    }
  }

  // ------------------------------------------------------------- 3. Nebeneinander
  for (const t of Object.values(THEMEN)) {
    for (const [datei, titel] of ARTBOARDS) {
      await bogen(path.join(aus, `vergleich-${datei}-${t}.png`), [
        [`Artboard „${titel}“`, path.join(roh, `artboard-${datei}-${t}.png`)],
        [`Seite, ${t}`, path.join(roh, `seite-${datei}-1440-${t}.png`)],
      ], { spalten: 2, breite: 720 });
    }
    await bogen(path.join(aus, `warenkorb-${t}.png`), [
      ['/warenkorb/', path.join(roh, `seite-warenkorb-1440-${t}.png`)],
      ['Kasse (über der Schublade)', path.join(roh, `seite-kasse-1440-${t}.png`)],
      ['Leer, Fokus mit Tastatur', path.join(roh, `seite-leer-1440-${t}.png`)],
      ['Gravur mit Fehler', path.join(roh, `seite-gravurfehler-${t}.png`)],
    ], { spalten: 2, breite: 720, titel: `/warenkorb/ und Kasse, ${t} (dafür gibt es kein Artboard)` });
    await bogen(path.join(aus, `handy-${t}.png`), ['kaufen', 'schublade', 'kasse', 'warenkorb', 'leer'].map((d) => [d, path.join(roh, `seite-${d}-390-${t}.png`)]),
      { spalten: 5, breite: 390, titel: `Handy (390 px), ${t} (für diese Breite gibt es kein Artboard)` });
  }
  console.log(`✓ Bilder in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
