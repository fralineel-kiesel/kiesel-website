// Sind alle sichtbaren Texte in der Textdatei (src/i18n/de.js)? Etappe 9a.
//
//   npm run pruefe:texte                 alles (baut dist/ und dist-pseudo-klammern/)
//   node scripts/pruefe-texte.mjs --ohne-build --nur-pseudo    nur Teil 2, ohne neu zu bauen
//
// 1. Ausgeliefert wird nie Pseudo-Sprache: dist/ enthält keine ⟦…⟧, keinen Code aus
//    scripts/pseudo/ und keine dist-pseudo-Pfade; sitemap.xml kennt nur die normalen Seiten.
// 2. Pseudo-Sprache (KIESEL_PSEUDO=klammern): Jeder Text aus de.js steht dort als ⟦Text⟧. Jede
//    Seite wird im Browser geladen (mit Artikeln im Warenkorb, damit Schublade und Kasse gefüllt
//    sind). Gesammelt werden alle Textknoten (auch versteckte, auch SVG), die Attribute, die
//    Menschen lesen oder hören (aria-label, alt, title, placeholder, aria-valuetext …), <title>,
//    <meta content> und JSON-LD. Was nach dem Entfernen aller ⟦…⟧ noch an Wörtern übrig ist,
//    kommt nicht aus der Textdatei. Erlaubt sind nur Eigennamen und Einheiten (EIGENNAMEN unten).
// 3. Heuristik über den Quelltext (src/, ohne Kommentare, ohne i18n/, Designsystem und
//    Spielwiese): Zeichenketten und Markup-Text mit Umlauten oder häufigen deutschen Wörtern.
//    Was übrig bleibt, steht mit Grund in AUSNAHMEN, sonst ist es ein Fehler.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { SEITEN } from './seiten.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(hier, '..');
const hat = (n) => process.argv.includes(n);
let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info && !ok ? `\n    ${info}` : ''}`);
  if (!ok) fehler++;
}
const baue = (env = {}) => execFileSync(process.execPath, [path.join(site, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build'],
  { cwd: site, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, ...env } });

// Wörter, die nicht aus der Textdatei kommen müssen: Eigennamen (Geräte aus data/geraete.js,
// Speicherstufen aus data/preise.js), Einheiten und Abkürzungen, die in jeder Sprache gleich sind.
export const EIGENNAMEN = new Set([
  'Kiesel', 'Pro', 'iPhone', 'SE', 'mini', 'Max',      // Gerätenamen (geraete.js, preise.js)
  'GB', 'TB', 'mm', 'mAh', 'CHF', 'MP', 'Hz', 'cm', 'h', // Einheiten neben Zahlen aus den Daten
  'IP68', 'iOS',                                        // Werte aus technik.js WERTE
]);

// ────────────────────────────────────────────────────────────── 1. dist sauber
function distSauber() {
  console.log('\n── 1. Ausgelieferter Build ohne Pseudo-Sprache ──');
  const dist = path.join(site, 'dist');
  const treffer = [];
  for (const d of fs.readdirSync(dist, { recursive: true })) {
    const p = path.join(dist, d);
    if (!fs.statSync(p).isFile() || !/\.(html|js|css|xml|txt|json)$/.test(d)) continue;
    const t = fs.readFileSync(p, 'utf8');
    if (/[⟦⟧]/.test(t)) treffer.push(`${d}: ⟦ oder ⟧`);
    if (/kiesel-pseudo|pseudo\/sprache|KIESEL_PSEUDO|dist-pseudo/.test(t)) treffer.push(`${d}: Pseudo-Code oder -Pfad`);
  }
  pruefe(`dist/: keine ⟦…⟧, kein Pseudo-Code (${fs.readdirSync(dist, { recursive: true }).length} Dateien)`, treffer.length === 0, treffer.join('\n    '));
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  pruefe('sitemap.xml ohne Pseudo-Seiten', !/pseudo|⟦/.test(sitemap));
  pruefe('Pseudo-Build liegt nicht in dist/', !fs.readdirSync(dist).some((d) => /pseudo/.test(d)));
}

// ────────────────────────────────────────────────────────────── 2. Pseudo-Sprache im Browser
function sammleTexte() {
  const aus = [];
  const ATTR = ['aria-label', 'aria-valuetext', 'aria-roledescription', 'alt', 'title', 'placeholder', 'label'];
  const pfadVon = (el) => { const t = []; for (let e = el; e && e !== document.documentElement && t.length < 4; e = e.parentElement) t.unshift(e.tagName.toLowerCase() + (e.id ? `#${e.id}` : e.classList[0] ? `.${e.classList[0]}` : '')); return t.join(' › '); };
  const geh = (n) => {
    if (n.nodeType === 3) { const t = n.data.trim(); if (t) aus.push([t, pfadVon(n.parentElement)]); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase();
    if (tag === 'style' || tag === 'template') { if (tag === 'template') geh(n.content); return; }
    if (tag === 'script') {
      if (n.type === 'application/ld+json') {
        const zeige = (w, wo) => { if (typeof w === 'string') { if (!/^(https?:|@|\/)/.test(w) && !['FAQPage', 'Question', 'Answer', 'https://schema.org'].includes(w)) aus.push([w, `JSON-LD ${wo}`]); } else if (w && typeof w === 'object') Object.entries(w).forEach(([k, v]) => zeige(v, k)); };
        zeige(JSON.parse(n.textContent), '');
      }
      return;
    }
    for (const a of ATTR) if (n.hasAttribute(a) && n.getAttribute(a).trim()) aus.push([n.getAttribute(a), `${pfadVon(n)} [${a}]`]);
    if (tag === 'meta' && n.content && /description|title|og:|twitter:/.test(n.getAttribute('name') ?? n.getAttribute('property') ?? '')) aus.push([n.content, `meta ${n.getAttribute('name') ?? n.getAttribute('property')}`]);
    for (const k of n.childNodes) geh(k);
  };
  geh(document.documentElement);
  aus.push([document.title, '<title>']);
  return aus;
}

// Was bleibt übrig, wenn alle ⟦…⟧ weg sind (auch verschachtelte)?
export function rest(text) {
  let t = text, vorher;
  do { vorher = t; t = t.replace(/⟦[^⟦⟧]*⟧/g, ' '); } while (t !== vorher);
  return (t.match(/[\p{L}][\p{L}\d]*/gu) ?? []).filter((w) => !EIGENNAMEN.has(w) && !/^\d/.test(w) && !/^[xX]$/.test(w));
}

async function pseudoPruefen() {
  console.log('\n── 2. Pseudo-Sprache: jeder Text kommt aus der Textdatei ──');
  const ordner = path.join(site, 'dist-pseudo-klammern');
  const { basis, schliessen } = await starteServer({ ordner });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('kiesel-warenkorb', JSON.stringify([
    { art: 'phone', modell: 'pro', farbe: 'titanium-gray', speicher: '2tb', gravur: 'Linos Kiesel', anzahl: 2 },
    { art: 'case', modell: 'pro', farbe: 'matte-white', anzahl: 1 },
    { art: 'phone', modell: 'k1', farbe: 'sky-blue', speicher: '256gb', anzahl: 1 },
  ])); } catch { /* egal */ } });
  const alle = new Map(); // Wort-Rest → [Seite, Stelle, Text]
  for (const [adresse, , ] of SEITEN) {
    if (adresse.startsWith('designsystem')) continue; // bleibt deutsch (Werkbank)
    const seite = await ctx.newPage();
    await seite.goto(basis + adresse, { waitUntil: 'networkidle' });
    await seite.evaluate(() => new Promise((r) => requestIdleCallback(() => requestAnimationFrame(() => r()), { timeout: 2000 })));
    const texte = await seite.evaluate(sammleTexte);
    for (const [text, wo] of texte) {
      const r = rest(text);
      if (!r.length) continue;
      const schluessel = `${wo}|${text}`;
      if (!alle.has(schluessel)) alle.set(schluessel, { seiten: new Set(), wo, text, r });
      alle.get(schluessel).seiten.add('/' + adresse);
    }
    await seite.close();
  }
  await browser.close();
  await schliessen();
  const liste = [...alle.values()];
  pruefe(`Alle Texte kommen aus der Textdatei (${SEITEN.length - 2} Seiten, nach dem Skriptlauf)`, liste.length === 0,
    liste.slice(0, 400).map((e) => `${[...e.seiten].slice(0, 3).join(' ')}${e.seiten.size > 3 ? ` (+${e.seiten.size - 3})` : ''}  ${e.wo}\n      „${e.text.slice(0, 140)}“  → ${e.r.join(' ')}`).join('\n    '));
  return liste;
}

// ────────────────────────────────────────────────────────────── Ablauf
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!hat('--nur-pseudo')) {
    if (!hat('--ohne-build')) baue();
    distSauber();
  }
  if (!hat('--nur-quelltext')) {
    if (!hat('--ohne-build')) baue({ KIESEL_PSEUDO: 'klammern' });
    await pseudoPruefen();
  }
  console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
  process.exit(fehler ? 1 : 0);
}
