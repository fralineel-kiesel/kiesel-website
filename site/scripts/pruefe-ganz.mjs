// Schlussprüfung über die ganze Seite (Etappe 7):
//
//   npm run pruefe:ganz
//
// 1. Seitenliste: Jede gebaute Seite steht in scripts/seiten.mjs (und umgekehrt).
// 2. Links: Jeder interne Link und jede eingebundene Datei im fertigen dist/ zeigt auf etwas,
//    das es gibt, inklusive #Sprungziel. Zusätzlich im Browser: auch Links, die erst ein Skript
//    einsetzt. Externe Links werden nur aufgelistet (kein Netz nötig).
// 3. Platzhalter: kein „Inhalt folgt“, kein leerer Link (href="#"), keine Etappen-Hinweise.
//    Bewusste Platzhalter in eckigen Klammern („[Material]“) werden aufgelistet, nicht bemängelt.
// 4. Feste Werte: Preiszahlen nur in data/preise.js, Gerätewerte (mAh, mm, g, GB, MP, W, Zoll …)
//    nur in src/data/. Durchsucht wird src/ ohne Kommentare. Zeichen-Motor und 3D rechnen in
//    eigenen Einheiten (Zeichnungsmasse aus lib.py) und sind ausgenommen.
// 5. Jede Seite: lang, <title>, Beschreibung, genau ein <h1>, keine doppelten IDs (auch nach dem
//    Öffnen der Menüs), keine Skriptfehler.
// 6. Menü-Handys: vor dem Öffnen nicht gezeichnet, danach aus dem Zeichen-Motor.
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { SEITEN } from './seiten.mjs';
import { PREISE, HUELLE_PREIS } from '../src/data/preise.js';
import { GERAETE } from '../src/data/geraete.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(hier, '..', 'dist');
const src = path.join(hier, '..', 'src');
const BASIS = '/kiesel-website/v2/';
let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}
function dateienIn(ordner, muster) {
  const aus = [];
  (function sammle(o) {
    for (const e of fs.readdirSync(o, { withFileTypes: true })) {
      const p = path.join(o, e.name);
      if (e.isDirectory()) sammle(p);
      else if (muster.test(e.name)) aus.push(p);
    }
  })(ordner);
  return aus;
}
const rel = (p, von = path.join(hier, '..')) => path.relative(von, p).split(path.sep).join('/');

// ------------------------------------------------------------------ 1. Seitenliste
console.log('── Seiten ──');
const gebaut = dateienIn(dist, /\.html$/).map((d) => rel(d, dist).replace(/(^|\/)index\.html$/, '$1'));
const gelistet = SEITEN.map(([a]) => a);
const fehlt = gebaut.filter((g) => !gelistet.includes(g));
const zuviel = gelistet.filter((g) => !gebaut.includes(g));
pruefe(`${gebaut.length} gebaute Seiten = scripts/seiten.mjs`, !fehlt.length && !zuviel.length, [...fehlt.map((f) => `fehlt in seiten.mjs: ${f}`), ...zuviel.map((z) => `nicht gebaut: ${z}`)].join(', '));

// ------------------------------------------------------------------ 2. Links (statisch)
console.log('\n── Links ──');
const htmlVon = new Map(); // Datei → Inhalt
const idsVon = new Map();  // Datei → Set der IDs
const lies = (datei) => {
  if (!htmlVon.has(datei)) {
    const html = fs.readFileSync(datei, 'utf8');
    htmlVon.set(datei, html);
    idsVon.set(datei, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return htmlVon.get(datei);
};
// Pfad unter /kiesel-website/v2/ → Datei in dist (oder null)
function zielDatei(pfad) {
  if (!pfad.startsWith(BASIS)) return null;
  let d = path.join(dist, decodeURIComponent(pfad.slice(BASIS.length)));
  if (fs.existsSync(d) && fs.statSync(d).isDirectory()) d = path.join(d, 'index.html');
  return fs.existsSync(d) ? d : null;
}
const extern = new Set();
const kaputt = [];
let intern = 0;
function pruefeLink(roh, seitenUrl, quelle) {
  if (!roh || /^(mailto:|tel:|javascript:|data:|blob:)/.test(roh)) return;
  const url = new URL(roh.replace(/&amp;/g, '&'), seitenUrl);
  if (url.origin !== 'http://kiesel.test') { extern.add(url.origin + url.pathname); return; }
  intern++;
  const datei = zielDatei(url.pathname);
  if (!datei) { kaputt.push(`${quelle}: ${roh} (gibt es nicht)`); return; }
  if (url.hash && url.hash !== '#' && datei.endsWith('.html')) {
    lies(datei);
    const id = decodeURIComponent(url.hash.slice(1));
    if (!idsVon.get(datei).has(id)) kaputt.push(`${quelle}: ${roh} (Sprungziel #${id} fehlt)`);
  }
}
for (const [adresse] of SEITEN) {
  const datei = zielDatei(BASIS + adresse);
  const html = lies(datei);
  const seitenUrl = `http://kiesel.test${BASIS}${adresse}`;
  for (const m of html.matchAll(/\s(?:href|src|action|poster)="([^"]*)"/g)) pruefeLink(m[1], seitenUrl, adresse || '/');
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) m[1].split(',').forEach((t) => pruefeLink(t.trim().split(/\s+/)[0], seitenUrl, adresse || '/'));
  // Links mit / am Anfang, die NICHT unter dem base-Pfad liegen (pfad() vergessen)
  for (const m of html.matchAll(/\shref="(\/[^"]*)"/g)) if (!m[1].startsWith(BASIS)) kaputt.push(`${adresse || '/'}: ${m[1]} (ohne base-Pfad, pfad() vergessen?)`);
}
// CSS: url(...) auf Schriften und Bilder
for (const css of dateienIn(path.join(dist, '_astro'), /\.css$/)) {
  for (const m of fs.readFileSync(css, 'utf8').matchAll(/url\(([^)]+)\)/g)) {
    const u = m[1].replace(/["']/g, '');
    if (!u.startsWith('data:')) pruefeLink(u, `http://kiesel.test${BASIS}_astro/x.css`, rel(css, dist));
  }
}
pruefe(`Alle ${intern} internen Verweise im HTML/CSS zeigen auf etwas, das es gibt (inkl. #Sprungziel)`, kaputt.length === 0, kaputt.slice(0, 10).join('\n    '));

// ------------------------------------------------------------------ 3. Platzhalter
console.log('\n── Platzhalter ──');
const platzhalter = [];
const bewusst = new Set();
for (const [adresse] of SEITEN) {
  const html = lies(zielDatei(BASIS + adresse));
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  for (const [muster, was] of [[/Inhalt folgt/i, '„Inhalt folgt“'], [/folgt in Etappe|\bEtappe \d/i, 'Etappen-Hinweis'], [/Lorem ipsum|TODO|FIXME/i, 'Blindtext/TODO']]) {
    if (muster.test(text) && !adresse.startsWith('designsystem')) platzhalter.push(`${adresse || '/'}: ${was}`);
  }
  if (/\shref="#"/.test(html)) platzhalter.push(`${adresse || '/'}: Link ins Leere (href="#")`);
  for (const m of text.matchAll(/\[([A-ZÄÖÜ][^\]\n]{1,40})\]/g)) bewusst.add(`${m[0]} (${adresse || '/'})`);
}
pruefe('Kein „Inhalt folgt“, kein Etappen-Hinweis, kein href="#" auf öffentlichen Seiten', platzhalter.length === 0, platzhalter.join(', '));
const benutzt = dateienIn(src, /\.astro$/).filter((d) => /<Platzhalter\b/.test(fs.readFileSync(d, 'utf8')));
pruefe('Keine Platzhalter-Komponente mehr (entfernt in Etappe 7)', benutzt.length === 0 && !fs.existsSync(path.join(src, 'components', 'Platzhalter.astro')), benutzt.map((d) => rel(d)).join(', '));
console.log(`  bewusst stehen gelassen: ${[...bewusst].join(', ') || 'keine'}`);

// ------------------------------------------------------------------ 4. Feste Werte
console.log('\n── Feste Werte im Code ──');
// Kommentare entfernen, Zeilen behalten (für Zeilennummern)
const ohneKommentare = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
const AUSGENOMMEN = [/^src\/data\//, /^src\/lib\/kiesel-draw\//, /^src\/lib\/kiesel-3d\//, /^src\/assets\//];
const quellen = dateienIn(src, /\.(js|mjs|astro|css)$/).filter((d) => !AUSGENOMMEN.some((a) => a.test(rel(d))));
// Preise (wie pruefe:kaufen, hier nochmals über alles)
const preise = [...new Set([...Object.values(PREISE).flatMap((m) => m.speicher.map((s) => s.preis)), HUELLE_PREIS])];
const preisMuster = [new RegExp(`CHF\\s*(${preise.map((n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '[’\']?')).join('|')})\\b`), /\b\d[\d’']*\.[–-]/];
// Gerätewerte: Zahl mit Einheit, oder eine der Zahlen aus geraete.js mit Nachkommastelle/4 Stellen
const einheit = /\b\d+(?:\.\d+)?\s?(?:mAh|mm|GB|TB|MP|GHz|Hz|nm|fps|W|g|Jahre)\b|\b\d+(?:\.\d+)?″/;
const geraeteZahlen = [...new Set(Object.values(GERAETE).flatMap((g) => [g.hoehe, g.breite, g.dicke, g.akku, g.gewicht]))].filter((n) => !Number.isInteger(n) || n >= 1000);
const geraeteMuster = new RegExp(`(?<![\\d.#-])(${geraeteZahlen.map((n) => String(n).replace('.', '\\.')).join('|')})(?![\\d])`);
// Bewusste Ausnahmen, jede mit Grund: [Datei, Zeilenmuster, Grund]
const ERLAUBT = [
  ['src/components/Icon.astro', /d="|: '[MmLlHhVvCcZz]/, 'Koordinaten in Icon-Pfaden, keine Gerätewerte'],
  ['src/lib/vergleich.js', /7\.6 \* SC/, 'Lage des Hörer-Schlitzes im SE-Umriss, Zeichnungsmass aus gen4.py'],
  ['src/pages/designsystem.astro', /'t-zahl', '3000'|<Chip gruppe="ds">/, 'Beispieltexte für Schrift und Chips im Designsystem'],
];
const erlaubt = (datei, zeile) => ERLAUBT.some(([d, m]) => rel(datei) === d && m.test(zeile));
// Nur Hinweis: Zoomfaktoren in Texten der Kamera-Demos („bei 3x“). Sie hängen an kamera.js
// und den Demos (Etappe 5) und sind dort mit pruefe:kamera abgesichert.
const zoomHinweise = [];
const feste = [];
for (const datei of quellen) {
  ohneKommentare(fs.readFileSync(datei, 'utf8')).split('\n').forEach((zeile, i) => {
    const wo = `${rel(datei)}:${i + 1}`;
    if (/[>'"`\s]\d+x[\s·<'"`-]/.test(zeile) && /[A-Za-zäöü]{4}/.test(zeile.replace(/<[^>]+>/g, ''))) zoomHinweise.push(wo);
    if (erlaubt(datei, zeile)) return;
    if (preisMuster.some((m) => m.test(zeile))) feste.push(`${wo} Preis: ${zeile.trim().slice(0, 80)}`);
    const e = zeile.match(einheit);
    if (e) feste.push(`${wo} Wert „${e[0]}“: ${zeile.trim().slice(0, 80)}`);
    const g = zeile.match(geraeteMuster);
    if (g) feste.push(`${wo} Gerätezahl ${g[1]}: ${zeile.trim().slice(0, 80)}`);
  });
}
pruefe(`Keine Preise oder Gerätewerte fest im Code (${quellen.length} Dateien ausserhalb src/data/ durchsucht)`, feste.length === 0, feste.join('\n    '));
console.log(`  bewusste Ausnahmen: ${ERLAUBT.map(([d, , g]) => `${d} (${g})`).join('; ')}`);
console.log(`  Hinweis, Zoomfaktoren in Texten (${zoomHinweise.length} Zeilen): ${[...new Set(zoomHinweise.map((w) => w.split(':')[0]))].join(', ')}`);

// ------------------------------------------------------------------ 5./6. Im Browser
console.log('\n── Jede Seite im Browser ──');
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
const laufzeitKaputt = [];
try {
  for (const [adresse, name] of SEITEN) {
    for (const breite of [1440, 390]) {
      const ctx = await browser.newContext({ viewport: { width: breite, height: 900 }, ...(breite < 900 ? { isMobile: true, hasTouch: true } : {}) });
      const seite = await ctx.newPage();
      const fehlerListe = [];
      seite.on('pageerror', (e) => fehlerListe.push(e.message));
      await seite.goto(basis + adresse, { waitUntil: 'load' });
      await seite.waitForTimeout(150);
      const vorher = await seite.locator('[data-menue-handy] svg').count();
      // Menü öffnen (Desktop: Aufklappmenü, Handy: Burger), damit auch die Menü-Handys zählen
      if (breite >= 900) await seite.locator('[data-ausloeser]').click();
      else await seite.locator('[data-burger]').click();
      await seite.waitForFunction(() => document.querySelectorAll('[data-menue-handy] svg').length >= 2, null, { timeout: 5000 }).catch(() => {});
      const info = await seite.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
        const svgIds = [...document.querySelectorAll('svg [id]')].map((e) => e.id);
        return {
          lang: document.documentElement.lang,
          titel: document.title,
          beschreibung: document.querySelector('meta[name="description"]')?.content ?? '',
          h1: document.querySelectorAll('h1').length,
          doppelt: [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))],
          svgIds: svgIds.length,
          menueHandys: document.querySelectorAll('[data-menue-handy] svg').length,
          links: [...document.links].map((a) => a.getAttribute('href')),
        };
      });
      const ok = info.lang === 'de-CH' && (info.titel.endsWith('· Kiesel') || info.titel.startsWith('Kiesel'));
      const probleme = [];
      if (!ok) probleme.push(`lang/titel: ${info.lang} ${info.titel}`);
      if (info.beschreibung.length < 50) probleme.push('Beschreibung fehlt/zu kurz');
      if (info.h1 !== 1) probleme.push(`${info.h1} × h1`);
      if (info.doppelt.length) probleme.push(`doppelte IDs: ${info.doppelt.slice(0, 5).join(', ')}`);
      if (vorher !== 0 || info.menueHandys !== 2) probleme.push(`Menü-Handys vorher ${vorher}, nachher ${info.menueHandys}`);
      if (fehlerListe.length) probleme.push(`Skriptfehler: ${fehlerListe.join(' | ')}`);
      pruefe(`${name} (${breite}): lang, Titel, Beschreibung, ein h1, keine doppelten IDs (${info.svgIds} IDs in SVGs), Menü-Handys erst beim Öffnen, keine Fehler`, probleme.length === 0, probleme.join('; '));
      // Links, die erst ein Skript einsetzt
      for (const h of info.links) {
        const vorherKaputt = kaputt.length;
        pruefeLink(h, `http://kiesel.test${BASIS}${adresse}`, `${adresse || '/'} (Laufzeit)`);
        if (kaputt.length > vorherKaputt) laufzeitKaputt.push(kaputt.pop());
      }
      await ctx.close();
    }
  }
  pruefe('Auch die Links nach dem Skriptlauf (inkl. offener Menüs) zeigen auf etwas, das es gibt', laufzeitKaputt.length === 0, [...new Set(laufzeitKaputt)].slice(0, 10).join('\n    '));
} finally {
  await browser.close();
  await schliessen();
}
console.log(`\n  externe Links (nur aufgelistet): ${[...extern].sort().join(', ') || 'keine'}`);

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
