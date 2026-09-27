// Qualitätsschleife für den Zeichen-Motor.
//
//   npm run fotos:zeichenmotor
//
// 1. Fotografiert die Spielwiese (/designsystem/spielwiese/) in vielen Kombinationen aus
//    Modell, Farbe, Ansicht, Hülle und LED (über die Adresse, z.B. ?modell=k1&farbe=…)
//    und legt eine Übersicht an: scripts/ausgabe/spielwiese/
// 2. Zeichnet die Handys, die auf den Original-PNGs (bilder/original/) zu sehen sind, als
//    einzelne Bilder mit durchsichtigem Hintergrund und übergibt sie an
//    vorlagen-vergleich.py. Dieses legt sie deckungsgleich über die PNGs und misst die
//    Abweichung: scripts/ausgabe/vergleich/
//
// Braucht einen fertigen Build in dist/ (das npm-Skript baut vorher), Playwright
// mit Chromium (einmalig: npx playwright install chromium) und Python 3 mit Pillow.
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { backSvg, frontSvg, PAL, LED, MODELS } from '../src/lib/kiesel-draw/index.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(hier, '..');
const aus = path.join(hier, 'ausgabe');
const ausSw = path.join(aus, 'spielwiese');
const ausTeile = path.join(aus, 'vergleich', 'teile');
for (const d of [ausSw, ausTeile]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------- Mini-Server für dist/
// Liefert den fertigen Build unter demselben Pfad aus wie GitHub Pages (/kiesel-website/v2/).
// Eigener Server statt "astro preview": Davon läuft pro Rechner nur einer, und ein schon
// laufender würde sonst stören.
const BASISPFAD = '/kiesel-website/v2/';
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const dist = path.join(site, 'dist');
if (!fs.existsSync(dist)) throw new Error('Kein Build gefunden: zuerst npm run build');
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(BASISPFAD)) { res.writeHead(404).end(); return; }
  let datei = path.join(dist, p.slice(BASISPFAD.length));
  if (!datei.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(datei) && fs.statSync(datei).isDirectory()) datei = path.join(datei, 'index.html');
  if (!fs.existsSync(datei)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPEN[path.extname(datei)] ?? 'application/octet-stream' });
  fs.createReadStream(datei).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r)); // Port 0 = irgendein freier
const BASIS = `http://127.0.0.1:${server.address().port}${BASISPFAD}`;

const browser = await chromium.launch();
try {
  // -------------------------------------------------------------- 1. Spielwiese
  const FARBEN = Object.keys(PAL);
  const kombis = [];
  for (const modell of ['k1', 'pro']) for (const ansicht of ['vorne', 'hinten', 'seite']) for (const farbe of FARBEN) kombis.push({ modell, ansicht, farbe });
  for (const ansicht of ['vorne', 'hinten', 'seite']) for (const huelle of FARBEN) kombis.push({ modell: 'pro', ansicht, farbe: 'Titangrau', huelle });
  for (const led of Object.keys(LED)) kombis.push({ modell: 'k1', ansicht: 'hinten', farbe: 'Mattschwarz', led });
  kombis.push({ modell: 'pro', ansicht: 'hinten', farbe: '#C0392B', huelle: 'Mattweiss' }, { modell: 'k1', ansicht: 'vorne', farbe: '#2E7D32', drehung: 8 });

  const bilder = [];
  for (const thema of ['dark', 'light']) {
    const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: thema });
    // im hellen Thema nur eine Auswahl, das Handy selbst ändert sich nicht mit dem Thema
    const liste = thema === 'dark' ? kombis : kombis.filter((k, i) => i % 6 === 0);
    for (const k of liste) {
      const q = new URLSearchParams({ hoehe: '520', ...k });
      await seite.goto(`${BASIS}designsystem/spielwiese/?${q}`);
      await seite.waitForSelector('[data-handy] svg');
      const name = `${thema}-${Object.values(k).join('-').replace(/#/g, '')}.png`;
      await seite.locator('[data-buehne="handy"]').screenshot({ path: path.join(ausSw, name) });
      bilder.push({ name, titel: Object.values(k).join(' · '), thema });
    }
    await seite.close();
  }
  // Übersicht als ein Bild
  const html = `<body style="margin:0;padding:16px;background:#fff;font:12px sans-serif;display:grid;grid-template-columns:repeat(8,1fr);gap:8px">` +
    bilder.map((b) => `<figure style="margin:0"><img src="${pathToFileURL(path.join(ausSw, b.name))}" style="width:100%;display:block;border-radius:8px"><figcaption>${b.titel}${b.thema === 'light' ? ' (hell)' : ''}</figcaption></figure>`).join('') + '</body>';
  fs.writeFileSync(path.join(aus, 'uebersicht.html'), html);
  const ue = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
  await ue.goto(pathToFileURL(path.join(aus, 'uebersicht.html')).href);
  await ue.screenshot({ path: path.join(aus, 'uebersicht-spielwiese.png'), fullPage: true });
  await ue.close();
  console.log(`✓ ${bilder.length} Screenshots der Spielwiese → scripts/ausgabe/spielwiese/, Übersicht: scripts/ausgabe/uebersicht-spielwiese.png`);

  // -------------------------------------------------------------- 2. Teile für den Vorlagen-Vergleich
  // Jedes Teil: ein Handy aufrecht, 2 px pro Einheit, 60 Einheiten Rand, durchsichtig.
  // Die Schriften (Sperrbildschirm) kommen aus src/assets/fonts, wie auf der Seite.
  const PX = 2, RAND = 60;
  const fonts = ['unbounded', 'instrument-sans'].map((n) => pathToFileURL(path.join(site, 'src/assets/fonts', `${n}.woff2`)).href);
  const fontCss = `@font-face{font-family:'Unbounded';src:url(${fonts[0]}) format('woff2');font-weight:400 600}@font-face{font-family:'Instrument Sans';src:url(${fonts[1]}) format('woff2');font-weight:400 600}`;
  const teil = (name, mk, svgInnen) => ({ name, mk, svgInnen });
  const T = [];
  // Hero: Rückseite und Vorderseite in Himmelblau; Modell unbekannt → beide probieren
  for (const mk of ['pro', 'k1']) {
    T.push(teil(`hero-hinten-${mk}`, mk, backSvg(mk, PAL.Himmelblau, 'h')));
    T.push(teil(`hero-vorne-${mk}`, mk, frontSvg(mk, PAL.Himmelblau, 'v')));
  }
  // Farben: fünf Pro-Rückseiten
  for (const f of Object.keys(PAL)) T.push(teil(`farben-${f}`, 'pro', backSvg('pro', PAL[f], 'f')));
  // Kamera: Kieselbeige Pro mit blauem Blitz (Anruf) und zum Vergleich ohne
  T.push(teil('kamera-led-call', 'pro', backSvg('pro', PAL.Kieselbeige, 'k', LED.call)));
  T.push(teil('kamera-led-aus', 'pro', backSvg('pro', PAL.Kieselbeige, 'k')));
  // Hülle: Himmelblau mit Hülle; welche Hüllenfarbe, soll der Vergleich herausfinden
  for (const h of Object.keys(PAL)) {
    T.push(teil(`huelle-hinten-${h}`, 'pro', backSvg('pro', PAL.Himmelblau, 'c', null, PAL[h])));
    T.push(teil(`huelle-vorne-${h}`, 'pro', frontSvg('pro', PAL.Himmelblau, 'd', PAL[h])));
  }
  const seite = await browser.newPage();
  const meta = [];
  for (const t of T) {
    const { W, H } = MODELS[t.mk];
    const w = (W + 2 * RAND) * PX, h = (H + 2 * RAND) * PX;
    await seite.setViewportSize({ width: w, height: h });
    const datei = path.join(ausTeile, `${t.name}.html`);
    fs.writeFileSync(datei, `<!doctype html><style>${fontCss}html,body{margin:0;background:transparent}</style><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${-RAND} ${-RAND} ${W + 2 * RAND} ${H + 2 * RAND}">${t.svgInnen}</svg>`);
    await seite.goto(pathToFileURL(datei).href);
    await seite.evaluate(() => document.fonts.ready);
    await seite.screenshot({ path: path.join(ausTeile, `${t.name}.png`), omitBackground: true });
    fs.unlinkSync(datei);
    meta.push({ name: t.name, W, H, px: PX, rand: RAND });
  }
  fs.writeFileSync(path.join(ausTeile, 'teile.json'), JSON.stringify(meta, null, 1));
  console.log(`✓ ${T.length} Teile für den Vorlagen-Vergleich gezeichnet`);
} finally {
  await browser.close();
  server.close();
}

// ---------------------------------------------------------------- 3. Vergleich (Python)
for (const cmd of [process.env.PYTHON, 'python3', 'python'].filter(Boolean)) {
  const r = spawnSync(cmd, [path.join(hier, 'vorlagen-vergleich.py')], { stdio: 'inherit' });
  if (r.error?.code === 'ENOENT') continue;
  process.exit(r.status ?? 1);
}
console.error('Python nicht gefunden. Mit PYTHON=… den Pfad angeben.');
process.exit(2);
