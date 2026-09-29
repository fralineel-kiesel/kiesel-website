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
import { sperrbildschirm } from '../src/lib/kiesel-draw/sperrbildschirm.js';

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
  'GB', 'TB', 'mm', 'mAh', 'CHF', 'MP', 'Hz', 'cm', 'h', 'g', 'W', // Einheiten neben Zahlen aus den Daten
  'IP68', 'iOS',                                        // Werte aus technik.js WERTE
  'A9', 'A20',                                          // Chip-Aufdruck in der Innenleben-Zeichnung
]);

// Ganze Texte, die bewusst nicht aus der Textdatei kommen, mit Grund
export const AUSNAHMEN_TEXT = new Map([
  [sperrbildschirm().datum, 'Datum auf dem Sperrbildschirm: kommt aus Intl.DateTimeFormat (lib/format.js datum()), die Sprache wird übergeben'],
  ['Linos Kiesel', 'Gravur, die der Test selbst eintippt: Eingabe der Person, kein Seitentext'],
]);

// ────────────────────────────────────────────────────────────── 3. Heuristik über den Quelltext
// Verdächtig: Zeichenkette oder Markup-Text mit Umlaut oder einem typisch deutschen Wort.
const DEUTSCH = /[äöüÄÖÜ]|\b(der|die|das|und|mit|für|nicht|ein|eine|einen|ist|sind|auf|von|zum|zur|bis|den|dem|des|ohne|oder|nur|noch|mehr|alle|alles|dein|deine|wird|hat|kein|keine|auch|schon|über|unter|wir|du|dich|dir|sie|beim|im|am|vom|zu|nach|aus|hier|jetzt|gibt|geht|kann|wie|was|wer)\b/i;
// Was übrig bleibt und warum es bleiben darf: [Datei (Anfang des Pfads), Muster, Grund]
export const AUSNAHMEN_QUELLTEXT = [
  ['src/data/farben.js', /Himmelblau|Mattschwarz|Titangrau|Mattweiss|Kieselbeige/, 'ALTE_FARBNAMEN: alte deutsche Farbnamen für die Migration alter Links und Warenkörbe (bleibt für immer)'],
  ['src/scripts/warenkorb.js', /handy|huelle/, 'Migration: alte Warenkorb-Art handy/huelle → phone/case'],
  ['src/pages/vergleichen.astro', /uebereinander/, 'Migration: alte Adresse ?ansicht=uebereinander → overlay'],
  ['src/', /^(Keine gültige Farbe|Unbekannte Fokus-Vorgabe|Icon ".*" gibt es nicht|Technik: Merkmal|3D nicht verfügbar|Unbekannte Ansicht)/, 'Meldung für Entwickler (throw new Error, console.warn), nie auf der Seite'],
  ['src/data/seiten.js', /./, 'Seitenliste: die Namen beschriften nur Prüfskripte und Fotos, auf der Seite erscheinen sie nie (Titel kommen aus meta der Textdatei)'],
];

// Wortschatz der Textdatei: jedes grossgeschriebene Wort und jedes Wort mit Umlaut aus de.js.
// Nomen schreibt man im Deutschen gross, Code-Kennungen fast nie: Ein solches Wort in einer
// Zeichenkette ausserhalb von src/i18n/ ist sehr wahrscheinlich ein vergessener Text.
async function wortschatz() {
  const de = await import('../src/i18n/de.js');
  const woerter = new Set();
  const geh = (w) => {
    if (typeof w === 'string') for (const x of w.match(/[\p{L}]{3,}/gu) ?? []) { if (/^\p{Lu}/u.test(x) || /[äöü]/i.test(x)) woerter.add(x); }
    else if (typeof w === 'function') { try { geh(w('X', 'X', 'X', 'X')); } catch { /* braucht Objekte */ } }
    else if (w && typeof w === 'object') Object.values(w).forEach(geh);
  };
  geh(de);
  for (const n of EIGENNAMEN) woerter.delete(n);
  // Englische Fachwörter und Namen, die auch im Code als Kennung vorkommen
  for (const n of ['USB', 'OLED', 'LTPO', 'RGB', 'LED', 'GPS', 'NFC', 'WLAN', 'SIM', 'MagSafe', 'Face', 'Dynamic', 'Island', 'Action', 'Button', 'Bluetooth', 'Apple', 'Inc', 'GitHub', 'Cupertino', 'Qi', 'CPU', 'GPU', 'RAM', 'OIS', 'Zen', 'Privacy', 'Tele', 'Makro', 'Lightning', 'Mini', 'Vapor', 'Chamber', 'Instrument', 'Sans', 'Unbounded', 'Segoe', 'Home', 'Tab', 'End']) woerter.delete(n);   // auch Tastennamen (e.key)
  return woerter;
}

function kommentareWeg(code, astro) {
  let c = code;
  if (astro) {
    c = c.replace(/<style[\s\S]*?<\/style>/g, (m) => m.replace(/[^\n]/g, ' '));       // CSS: keine Texte
    c = c.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
    c = c.replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '));
  }
  c = c.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  // Zeilenkommentare: // am Zeilenanfang oder nach Leerraum/Code, nicht in https://
  return c.split('\n').map((z) => z.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');
}

function kandidaten(code, astro) {
  const aus = [];
  const zeile = (i) => code.slice(0, i).split('\n').length;
  // Zeichenketten '…', "…" und `…` (bei Vorlagen nur die festen Teile ausserhalb von ${…})
  for (const m of code.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const text = (m[1] ?? m[2] ?? m[3].replace(/\$\{[^}]*\}/g, ' ')).trim();
    if (text) aus.push([text, zeile(m.index)]);
  }
  // Markup-Text zwischen > und < (nur .astro, nach dem Frontmatter)
  if (astro) {
    const ende = code.indexOf('---', 3) + 3;
    for (const m of code.slice(ende).matchAll(/>([^<>{}]*[\p{L}][^<>{}]*)</gu)) aus.push([m[1].trim(), zeile(ende + m.index)]);
  }
  return aus;
}

async function quelltextPruefen() {
  const WORTSCHATZ = await wortschatz();
  const ausWortschatz = (text) => (text.match(/[\p{L}]{3,}/gu) ?? []).find((w) => WORTSCHATZ.has(w));
  console.log('\n── 3. Quelltext: kein sichtbarer deutscher Text ausserhalb der Textdatei (Heuristik) ──');
  const dateien = [];
  (function sammle(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!['i18n', 'assets', 'designsystem'].includes(e.name)) sammle(p); } else if (/\.(astro|js)$/.test(e.name) && e.name !== 'designsystem.astro') dateien.push(p);
    }
  })(path.join(site, 'src'));
  const treffer = [], ausnahmen = new Map();
  for (const datei of dateien) {
    const rel = path.relative(site, datei);
    const astro = datei.endsWith('.astro');
    for (const [text, nr] of kandidaten(kommentareWeg(fs.readFileSync(datei, 'utf8'), astro), astro)) {
      if (!DEUTSCH.test(text) && !ausWortschatz(text)) continue;
      // Importpfade (../Knopf.astro) und nur Markup (ein Tag mit Attributen), kein Text
      if (/^\.{1,2}\/|\.(astro|js|mjs|css|woff2)(\?url)?$/.test(text)) continue;
      if (/^<[^<>]*>$/.test(text)) continue;
      // Code, der wie ein Satz aussieht, aber keiner ist (Selektoren, CSS, Pfade, Regex)
      if (/^[\w.#\[\]="':>*\-\s()/,|^$\\?+]*$/.test(text) && !/\s[a-zäöü]+\s[a-zäöü]+\s/i.test(text) && !ausWortschatz(text)) continue;
      const a = AUSNAHMEN_QUELLTEXT.find(([pfad, muster]) => rel.startsWith(pfad) && muster.test(text));
      if (a) { ausnahmen.set(a[2], [...(ausnahmen.get(a[2]) ?? []), `${rel}:${nr}`]); continue; }
      treffer.push(`${rel}:${nr}  „${text.slice(0, 110)}“`);
    }
  }
  pruefe(`Keine deutschen Texte ausserhalb von src/i18n/ (${dateien.length} Dateien)`, treffer.length === 0, treffer.join('\n    '));
  for (const [grund, wo] of ausnahmen) console.log(`  erlaubt (${wo.length}×): ${grund}\n      ${wo.slice(0, 6).join(', ')}${wo.length > 6 ? ' …' : ''}`);
}

// Bedienschritte je Seite: Texte, die erst durch JavaScript entstehen (Ansagen, Fehlermeldungen,
// Kasse, Vergleichssatz …). Nach jedem Schritt wird erneut gesammelt. Alles mit „weniger
// Bewegung“, also ohne Wartezeiten für Animationen.
const klick = (sel) => async (s) => { await s.locator(sel).first().click({ force: true }); };
const tippe = (sel, text) => async (s) => { await s.locator(sel).first().fill(text); };
const taste = (sel, key) => async (s) => { await s.locator(sel).first().focus(); await s.keyboard.press(key); };
const BEDIENUNG = {
  '': [klick('[data-modell-wahl="k1"]'), klick('[data-buehne3d] label[title] >> nth=1'), klick('[data-teaser-huelle]'),
    klick('[data-warenkorb-knopf]'), klick('[data-schublade] [data-plus]'), klick('[data-schublade] [data-zur-kasse]')],
  'kaufen/': [klick('input[name="modell"][value="k1"]'), klick('[data-huelle-schalter]'), tippe('#gravur', 'Hallo @Welt'),
    klick('[data-in-warenkorb]'), tippe('#gravur', 'x'.repeat(20)), tippe('#gravur', 'Linos Kiesel'), klick('[data-in-warenkorb]')],
  'warenkorb/': [klick('[data-art="seite"] [data-plus]'), klick('[data-art="seite"] [data-minus]'), klick('[data-art="seite"] [data-minus]'),
    klick('[data-art="seite"] [data-entfernen]'), klick('[data-art="seite"] [data-zur-kasse]')],
  'vergleichen/': [klick('[data-gegen="se"]'), klick('[data-modus="over"]'), klick('[data-karte]'), klick('[data-gegen="anderer"]'), klick('[data-kiesel="pro"]'), klick('[data-gegen="mini"]')],
  'akku-rechner/': [klick('[data-tag="busy"]'), taste('#sl-surf', 'End'), taste('#sl-video', 'End'), taste('#sl-game', 'End')],
  'funktionen/': [...['msg', 'charge', 'full', 'low', 'privacy', 'funkstille', 'flash', 'off'].map((e) => klick(`[data-ereignis="${e}"]`)),
    klick('[data-zen-schalter]'), klick('[data-stufe-knopf="1"]'), klick('[data-notruf-knopf]'), klick('[data-stufe-knopf="2"]'),
    taste('[data-zoom-regler]', 'End'), klick('[data-detail="0"]'), klick('[data-detail="6"]')],
  'faq/': [tippe('[data-suche]', 'Akku'), tippe('[data-suche]', 'xyzxyz'), klick('[data-thema-wahl="phones"]')],
  'zubehoer/': [klick('[data-filter="k1"]'), klick('[data-kaufen][data-modell="k1"]'), klick('input[name="kombi-huelle"][value="matte-black"]')],
  'zubehoer/huelle/': [klick('[data-modell-wahl="k1"]'), klick('[data-ansicht="vorne"]'), klick('input[name="huelle-farbe"][value="sky-blue"]'), klick('[data-huelle-kaufen]')],
  'kiesel-1-pro/': [taste('[data-zoom-regler]', 'Home'), taste('[data-zoom-regler]', 'End'), klick('[data-vergleich-schalter]'),
    taste('[data-trennlinie], .zoom-vergleich input.trenn, [data-zoom-vergleich] input[type="range"]:not([data-zoom-regler])', 'ArrowLeft'), klick('[data-linse-knopf="weit"]'), klick('[data-fokus-ebene="bee"]')],
  'kiesel-1/': [taste('[data-zoom-regler]', 'End'), klick('[data-linse-knopf="normal"]'), klick('[data-fokus-ebene="bg"]')],
  'kiesel-1/technik/': [klick('[data-nur-unterschiede]')],
};

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
    // <meta>: nur Texte (Beschreibung, Titel), nicht og:url (Adresse) oder og:type (technischer Wert)
    const mname = n.getAttribute('name') ?? n.getAttribute('property') ?? '';
    if (tag === 'meta' && n.content && /description|title|site_name/.test(mname)) aus.push([n.content, `meta ${mname}`]);
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
  // Wörter = Folgen aus Buchstaben und Ziffern mit mindestens einem Buchstaben; was mit einer
  // Ziffer beginnt (3D, 4K, 0.5x), ist eine Zahl mit Einheit
  return (t.match(/[\p{L}\d]+/gu) ?? []).filter((w) => /\p{L}/u.test(w) && !/^\d/.test(w) && !EIGENNAMEN.has(w) && !/^[xX]$/.test(w));
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
  // Skriptfehler: Fehlt einem Skript beim Umbau sein Text (ReferenceError), bleibt der alte Text
  // einfach stehen und fiele sonst nicht auf (so war es beim Zen-Schalter)
  const fehler = [];
  for (const [adresse, , ] of SEITEN) {
    if (adresse.startsWith('designsystem')) continue; // bleibt deutsch (Werkbank)
    const seite = await ctx.newPage();
    seite.on('pageerror', (e) => fehler.push(`/${adresse}: ${e.message.split('\n')[0]}`));
    await seite.goto(basis + adresse, { waitUntil: 'networkidle' });
    await seite.evaluate(() => new Promise((r) => requestIdleCallback(() => requestAnimationFrame(() => r()), { timeout: 2000 })));
    const texte = await seite.evaluate(sammleTexte);
    for (const schritt of BEDIENUNG[adresse] ?? []) {
      try { await schritt(seite); } catch (e) { console.log(`  (Bedienschritt auf /${adresse} ging nicht: ${e.message.split('\n')[0]})`); }
      await seite.waitForTimeout(80);
      texte.push(...(await seite.evaluate(sammleTexte)).map(([t, wo]) => [t, `${wo} (nach Bedienung)`]));
    }
    for (const [text, wo] of texte) {
      if (AUSNAHMEN_TEXT.has(text)) continue;
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
  pruefe('Keine Skriptfehler beim Laden und Bedienen', fehler.length === 0, fehler.join('\n    '));
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
  if (!hat('--nur-pseudo')) await quelltextPruefen();
  if (!hat('--nur-quelltext')) {
    if (!hat('--ohne-build')) baue({ KIESEL_PSEUDO: 'klammern' });
    await pseudoPruefen();
  }
  console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
  process.exit(fehler ? 1 : 0);
}
