// Qualitätsschleife für den Privacy-Modus in zwei Stufen (Etappe 8b).
//
//   npm run fotos:privacy
//
// Sechs Zustände (Stufe 0/1/2, je ohne und mit Notruf; Notruf in Stufe 0 = wirkungslos),
// dunkel und hell:
// 1. Artboard aus design/generator/gen5.py (über gen5-referenz.mjs, 1440 × 1500)
// 2. Abschnitt #privacy auf /funktionen/ bei 1440 und 390 px, mit „weniger Bewegung“
// 3. Bogen je Thema: Zeile = Zustand, Spalten = Artboard | Seite 1440 | Seite 390
//    → scripts/ausgabe/privacy/bogen-<thema>.png
// Dazu das RGB-Licht mit „Privacy“ und „Funkstille“ (normal und mit weniger Bewegung).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { referenzPrivacy } from './gen5-referenz.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const aus = path.join(hier, 'ausgabe', 'privacy');
const roh = path.join(aus, 'einzelbilder');
fs.mkdirSync(roh, { recursive: true });
const schriften = pathToFileURL(path.join(hier, '..', 'src', 'assets', 'fonts')).href;

const ZUSTAENDE = [[0, false], [0, true], [1, false], [1, true], [2, false], [2, true]];
const THEMEN = { dark: 'dunkel', light: 'hell' };
// Klebende Kopfzeile würde beim Element-Foto über dem Abschnitt liegen
const KEINE_LEISTE = '.kopfzeile, .unterleiste { opacity: 0 !important; }';
const name = (s, n) => `stufe${s}${n ? '-notruf' : ''}`;
const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');

const ref = referenzPrivacy();
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();

// Zustand auf der Seite herstellen: Stufe wählen, Notruf so oft drücken, bis er stimmt
// (in Stufe 0 bleibt er aus, genau das soll das Foto zeigen)
async function stelleEin(seite, stufe, notruf) {
  const w = seite.locator('[data-privacy-modus]');
  await w.locator(`[data-stufe-knopf="${stufe}"]`).click();
  if (notruf && (await w.getAttribute('data-notruf')) !== 'true') await w.locator('[data-notruf-knopf]').click({ force: true });
  if (!notruf && (await w.getAttribute('data-notruf')) === 'true') await w.locator('[data-notruf-knopf]').click({ force: true });
}

async function bogen(ziel, zeilen, titel) {
  const seite = await browser.newPage({ viewport: { width: 1900, height: 600 } });
  await seite.setContent(`<body style="margin:0;background:#888;font:600 18px sans-serif;color:#111">
    <p style="margin:16px 20px 0">${titel}</p>
    <div style="display:grid;grid-template-columns:900px 700px 240px;gap:20px;padding:20px;align-items:start">
      ${zeilen.map(([text, bilder]) => bilder.map((b, i) => `<figure style="margin:0"><figcaption style="margin-bottom:6px">${i === 0 ? text : ''}&nbsp;</figcaption><img src="${alsDaten(b)}" style="display:block;width:100%"></figure>`).join('')).join('')}
    </div></body>`);
  await seite.screenshot({ path: ziel, fullPage: true });
  await seite.close();
}

try {
  for (const [thema, themaName] of Object.entries(THEMEN)) {
    const zeilen = [];
    // Artboard
    const vorlage = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
    // Seiten
    const seiten = {};
    for (const breite of [1440, 390]) {
      const kontext = await browser.newContext({ viewport: { width: breite, height: 900 }, colorScheme: thema, reducedMotion: 'reduce', deviceScaleFactor: breite === 390 ? 2 : 1 });
      const s = await kontext.newPage();
      await s.goto(basis + 'funktionen/');
      await s.evaluate(() => document.fonts.ready);
      seiten[breite] = s;
    }
    for (const [stufe, notruf] of ZUSTAENDE) {
      const n = name(stufe, notruf);
      const datei = path.join(roh, `artboard-${n}-${themaName}.html`);
      fs.writeFileSync(datei, `<!doctype html><meta charset="utf-8"><style>
        @font-face { font-family: 'Instrument Sans'; src: url('${schriften}/instrument-sans.woff2') format('woff2'); font-weight: 400 600; }
        @font-face { font-family: 'Unbounded'; src: url('${schriften}/unbounded.woff2') format('woff2'); font-weight: 400 600; }
        body { margin: 0 } a { color: inherit }</style>${ref.html({ stufe, notruf, thema })}`);
      await vorlage.goto(pathToFileURL(datei).href);
      await vorlage.evaluate(() => document.fonts.ready);
      const bilder = [path.join(roh, `artboard-${n}-${themaName}.png`)];
      await vorlage.screenshot({ path: bilder[0], clip: { x: 0, y: 64, width: 1440, height: 1100 } });
      for (const breite of [1440, 390]) {
        const s = seiten[breite];
        await stelleEin(s, stufe, notruf);
        const b = path.join(roh, `seite-${breite}-${n}-${themaName}.png`);
        await s.locator('#privacy').screenshot({ path: b, style: KEINE_LEISTE });
        bilder.push(b);
      }
      zeilen.push([`Stufe ${stufe}${notruf ? ' + Notruf gedrückt' : ''}`, bilder]);
    }
    await bogen(path.join(aus, `bogen-${themaName}.png`), zeilen, `Privacy-Modus, ${themaName}: Artboard | Seite 1440 | Seite 390`);
    await vorlage.close();
    for (const s of Object.values(seiten)) await s.context().close();

    // RGB-Licht: Privacy und Funkstille, normal und mit weniger Bewegung
    for (const bewegung of ['no-preference', 'reduce']) {
      const kontext = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: thema, reducedMotion: bewegung });
      const s = await kontext.newPage();
      await s.goto(basis + 'funktionen/');
      for (const k of ['privacy', 'funkstille']) {
        await s.locator(`[data-ereignis="${k}"]`).click();
        await s.locator('#rgb').screenshot({ style: KEINE_LEISTE, path: path.join(aus, `rgb-${k}-${bewegung === 'reduce' ? 'still' : 'bewegt'}-${themaName}.png`) });
      }
      await kontext.close();
    }
  }
  console.log(`✓ Fotos in ${path.relative(process.cwd(), aus)}/`);
} finally {
  await browser.close();
  await schliessen();
}
