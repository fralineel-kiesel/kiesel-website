// Sicherheitsnetz für Umbauten, die nichts Sichtbares ändern sollen (Etappe 9a: Texte nach
// src/i18n/): Baut einen alten Stand und den jetzigen und vergleicht das Ergebnis.
//
//   npm run vergleiche:html                      alter Stand = Abzweigpunkt von origin/v2
//   npm run vergleiche:html -- --basis 103c06a   alter Stand = dieser Commit
//   … -- --ohne-build                            jetzigen Build (dist/) nicht neu bauen
//   … -- --nur-statisch                          ohne Browser-Teil
//   … -- --ohne-regeln                           Gegenprobe: gleicher Stand muss ohne Regeln gleich sein
//
// 1. Statisch: jede Datei in dist/ ausser _astro/ (HTML, sitemap.xml, robots.txt) Byte für Byte,
//    dazu pro Seite der Inhalt aller eingebundenen Stylesheets aus _astro/ (in Reihenfolge).
// 2. Nach dem Skriptlauf: Beide Stände laufen je auf einem Mini-Server. Jede öffentliche Seite
//    (dazu ein paar Adressen mit alten Parametern) wird im Browser geladen, mit einem Warenkorb
//    im ALTEN Format (deutsche Farbnamen, art 'handy'/'huelle'). Verglichen wird das fertige
//    DOM samt Zustand der Formularfelder und der Adresse. So fallen auch Texte auf, die erst
//    per JavaScript entstehen.
//
// Erlaubt sind nur Unterschiede, für die unten in REGELN eine Regel mit Begründung steht. Jede
// Regel verwandelt die ALTE Fassung in die erwartete neue (wie scripts/abweichungen.mjs); danach
// muss alles gleich sein. Nur die Dateinamen mit Hash werden auf beiden Seiten gleichgemacht.
// Das Skript meldet, wie oft jede Regel gegriffen hat.
//
// Der alte Stand wird per "git worktree" in einen Temp-Ordner geholt und dort gebaut
// (node_modules wird verlinkt). Sein Build bleibt in scripts/ausgabe/html-vergleich/ liegen,
// der nächste Lauf mit derselben Basis spart sich das Bauen.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { OEFFENTLICH } from './seiten.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(hier, '..');
const repo = path.join(site, '..');
const ausgabe = path.join(hier, 'ausgabe', 'html-vergleich');
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const hat = (name) => process.argv.includes(name);
const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' }).trim();

// ────────────────────────────────────────────────────────────── Regeln
// Alte deutsche Farbnamen → neue Kennungen (dieselbe Tabelle wie src/data/farben.js, hier
// absichtlich noch einmal ausgeschrieben: Der Test soll nicht dem Code glauben, den er prüft)
const FARBEN = { Mattschwarz: 'matte-black', Titangrau: 'titanium-gray', Himmelblau: 'sky-blue', Mattweiss: 'matte-white', Kieselbeige: 'pebble-beige' };
const FARB_RE = Object.keys(FARBEN).join('|');
const FAQ_THEMEN = { Alle: 'alle', Konzept: 'concept', Handys: 'phones', 'Akku und Laden': 'battery', Funktionen: 'features', Kaufen: 'buying' };
const DETAILS = {
  Gipfelkreuz: 'summit-cross', 'Seilschaft auf dem Grat': 'rope-team', Steinbock: 'ibex', 'SAC-Hütte mit Fahne': 'mountain-hut',
  Gondelbahn: 'gondola', Gleitschirm: 'paraglider', Segelboot: 'sailboat', 'Dorf mit Kirche': 'village',
};

export const REGELN = [
  {
    name: 'Farbkennung in Formularwerten und Datenattributen',
    grund: 'Farben heissen intern jetzt sprachneutral (sky-blue …), damit eine englische Seite dieselben Werte schickt. Sichtbar (Text, title, aria-label) bleibt der deutsche Name.',
    alt: new RegExp(`(\\bvalue|\\bdata-farbe|:wert)="(${FARB_RE})"`, 'g'),
    neu: (_, attr, f) => `${attr}="${FARBEN[f]}"`,
  },
  {
    name: 'Farbkennung in Links (?farbe=, ?huelle=)',
    grund: 'Links auf /kaufen/ und /zubehoer/huelle/ übergeben die neue Kennung. Alte Links mit deutschem Namen funktionieren weiter (Migration beim Laden).',
    alt: new RegExp(`([?&]|&amp;)(farbe|huelle)=(${FARB_RE})`, 'g'),
    neu: (_, vor, p, f) => `${vor}${p}=${FARBEN[f]}`,
  },
  {
    name: 'Farbkennung im Startzustand von /kaufen/ (data-start)',
    grund: 'Der Startzustand ist JSON mit Kennungen, dieselben wie im Formular.',
    alt: new RegExp(`((?:&quot;|\\\\")(?:farbe|huelleFarbe)(?:&quot;|\\\\"):(?:&quot;|\\\\"))(${FARB_RE})(&quot;|\\\\")`, 'g'),
    neu: (_, a, f, b) => `${a}${FARBEN[f]}${b}`,
  },
  {
    name: 'FAQ-Thema als Kennung (data-thema, data-thema-wahl)',
    grund: 'Der Filter vergleicht Kennungen statt Anzeigetext, sonst würde er auf Englisch nichts mehr finden. Die Chips zeigen weiter den deutschen Namen.',
    alt: new RegExp(`\\b(data-thema(?:-wahl)?)="(${Object.keys(FAQ_THEMEN).join('|')})"`, 'g'),
    neu: (_, attr, t) => `${attr}="${FAQ_THEMEN[t]}"`,
  },
  {
    name: 'Versteckte Details: Kennung statt Name (data-name → data-detail-id, Spielwiese data-ziel)',
    grund: 'Die acht Details im Panorama haben eine sprachneutrale Kennung; ihr Name kommt aus der Textdatei. data-name las kein Skript.',
    alt: new RegExp(`\\b(data-name|data-ziel)="(${Object.keys(DETAILS).join('|')})"`, 'g'),
    neu: (_, attr, n) => `${attr === 'data-name' ? 'data-detail-id' : attr}="${DETAILS[n]}"`,
  },
  {
    name: 'Startseite, Knopf „Kaufen ab …“: kein Zeilenumbruch mehr vor dem Text',
    grund: 'Der Text kommt jetzt als Ausdruck aus der Textdatei; vor einem Ausdruck lässt Astro den Leerraum weg. Der Knopf ist inline-flex, Leerraum am Anfang wird nie dargestellt, der Name für Screenreader wird getrimmt: unsichtbar.',
    alt: /(data-held-kaufen="(?:k1|pro)"[^>]*>)\n\s+(Kaufen ab )/g,
    neu: (_, a, b) => a + b,
  },
  {
    name: 'Akku-Rechner: typische Tage als Kennung (data-tag)',
    grund: 'Die Tage heissen intern quiet, normal, busy, holiday; die Chips zeigen weiter „Ruhiger Tag“, „Normal“ …',
    alt: /\bdata-tag="(Ruhiger Tag|Normal|Viel unterwegs|Ferientag)"/g,
    neu: (_, n) => `data-tag="${{ 'Ruhiger Tag': 'quiet', Normal: 'normal', 'Viel unterwegs': 'busy', Ferientag: 'holiday' }[n]}"`,
  },
  {
    name: 'Blumen-Vorgaben der Spielwiese: Kennung statt Name (data-vorgabe)',
    grund: 'BLUME_FOKUS hat Kennungen (tele, bee, macro, all), die Namen aus gen2.py stehen in der Textdatei.',
    alt: /\bdata-vorgabe="(Blume \(3x Tele\)|Biene|Makro \(alles nah\)|Alles scharf)"/g,
    neu: (_, n) => `data-vorgabe="${{ 'Blume (3x Tele)': 'tele', Biene: 'bee', 'Makro (alles nah)': 'macro', 'Alles scharf': 'all' }[n]}"`,
  },
  {
    name: 'Warenkorb-Zeilen: Kennungen in data-id und data-schluessel',
    grund: 'Die Artikel-ID entsteht aus der gespeicherten Wahl (Art|Modell|Farbe|…). Art und Farbe sind jetzt Kennungen: handy → phone, huelle → case, Titangrau → titanium-gray.',
    alt: new RegExp(`\\b(data-id|data-schluessel)="([^"]*)"`, 'g'),
    neu: (_, attr, wert) => `${attr}="${wert.split('|').map((teil) => ({ handy: 'phone', huelle: 'case' })[teil] ?? FARBEN[teil] ?? teil).join('|')}"`,
  },
];

// Nur im Browser-Teil: die Adresse nach dem Laden
const REGELN_ADRESSE = [
  {
    name: 'Adresse von /kaufen/: alte Farbnamen werden zu Kennungen',
    grund: '/kaufen/ schreibt die Adresse nach (replaceState), jetzt mit Kennungen: aus ?farbe=Titangrau wird ?farbe=titanium-gray. /zubehoer/huelle/ schreibt die Adresse wie bisher nicht nach.',
    alt: /^kaufen\/\?[^#]*/g,
    neu: (m) => m.replace(new RegExp(`([?&])(farbe|huelle)=(${FARB_RE})\\b`, 'gi'),
      (_, vor, p, f) => `${vor}${p}=${FARBEN[Object.keys(FARBEN).find((k) => k.toLowerCase() === f.toLowerCase())]}`),
  },
  {
    name: 'Adresse: ?ansicht=uebereinander → ?ansicht=overlay',
    grund: 'Neue Kennung für die Ansicht „Übereinander“ auf /vergleichen/.',
    alt: /([?&])ansicht=uebereinander\b/g,
    neu: (_, vor) => `${vor}ansicht=overlay`,
  },
];

// Dateinamen mit Hash (/_astro/kaufen.C8kEdgo3.css): Der Hash hängt am Inhalt, und der
// Code der Skripte ändert sich ja. Auf beiden Seiten gleichmachen.
const ohneHash = (s) => s.replace(/(\/_astro\/[\w.-]+?)\.[\w-]{8}\.(js|css|woff2|png|jpg|webp|svg)/g, '$1.[hash].$2');

// Modul-Skripte: Ihr Code wandert mit dem Umbau (neue Importe, anderer Hash, klein genug zum
// Einbetten oder nicht mehr). Was sie auf der Seite anrichten, prüft der Browser-Teil.
// Hier werden sie darum auf beiden Seiten entfernt und nur ihre Namen verglichen (Info).
const MODUL = /<script type="module"(?: src="([^"]*)")?>([\s\S]*?)<\/script>/g;
const ohneModule = (s) => s.replace(MODUL, '');
const modulNamen = (s) => [...s.matchAll(MODUL)].map((m) => (m[1] ? ohneHash(m[1]).replace(/.*\/_astro\//, '') : '(eingebettet)')).sort();

// Eingebettete <style>-Blöcke: Astro sammelt die CSS-Regeln der Bausteine in der Reihenfolge,
// in der Vite die Module fertig hat. Neue Importe (die Textdatei) können sie umstellen. Darum
// werden die obersten Blöcke eines <style> sortiert verglichen, und wo das nötig war, prüft
// Teil 2 im Browser, dass jedes Element dieselben berechneten Stile hat (siehe stileGleich).
function obersteBloecke(css) {
  const bloecke = [];
  let tiefe = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') tiefe++;
    else if (css[i] === '}' && --tiefe === 0) { bloecke.push(css.slice(start, i + 1).trim()); start = i + 1; }
  }
  if (css.slice(start).trim()) bloecke.push(css.slice(start).trim());
  return bloecke;
}
const stileSortiert = (html) => html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => `<style>${obersteBloecke(css).sort().join('\n')}</style>`);
export const CSS_REIHENFOLGE = {
  name: 'Reihenfolge der eingebetteten CSS-Regeln (nur Designsystem)',
  grund: 'Neue Importe ändern, in welcher Reihenfolge Astro die Stile der Bausteine einbettet. Gleiche Regeln, andere Reihenfolge; nachgewiesen im Browser: jedes Element hat dieselben berechneten Stile (hell und dunkel).',
};

function wendeAn(text, regeln, zaehler) {
  for (const r of regeln) {
    text = text.replace(r.alt, (...m) => { zaehler.set(r.name, (zaehler.get(r.name) ?? 0) + 1); return r.neu(...m); });
  }
  return text;
}

// Erste Stelle, an der sich a und b unterscheiden, mit etwas Umgebung
function zeigeUnterschied(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const von = Math.max(0, i - 120);
  return `      erwartet: …${a.slice(von, i + 160).replace(/\n/g, '⏎')}…\n      ist:      …${b.slice(von, i + 160).replace(/\n/g, '⏎')}…`;
}

// ────────────────────────────────────────────────────────────── Bauen
function baue(ordner) {
  execFileSync(process.execPath, [path.join(site, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build'], { cwd: ordner, stdio: ['ignore', 'ignore', 'inherit'] });
}

function basisBauen(ref) {
  const sha = git('rev-parse', '--short', ref);
  const ziel = path.join(ausgabe, `basis-${sha}`);
  if (fs.existsSync(path.join(ziel, 'index.html'))) { console.log(`Alter Stand ${sha}: Build von früher wird benutzt`); return { sha, dist: ziel }; }
  console.log(`Alter Stand ${sha}: wird gebaut …`);
  const baum = fs.mkdtempSync(path.join(os.tmpdir(), 'kiesel-basis-'));
  git('worktree', 'add', '--detach', baum, sha);
  try {
    fs.symlinkSync(path.join(site, 'node_modules'), path.join(baum, 'site', 'node_modules'), 'dir');
    baue(path.join(baum, 'site'));
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    fs.cpSync(path.join(baum, 'site', 'dist'), ziel, { recursive: true });
  } finally {
    git('worktree', 'remove', '--force', baum);
  }
  return { sha, dist: ziel };
}

const dateien = (wurzel) => fs.readdirSync(wurzel, { recursive: true })
  .filter((d) => !d.startsWith('_astro') && fs.statSync(path.join(wurzel, d)).isFile())
  .sort();

// ────────────────────────────────────────────────────────────── 1. statisch
const stilSeiten = []; // Seiten, deren CSS nur umgestellt ist: Teil 2 vergleicht dort berechnete Stile
function vergleicheStatisch(altDist, neuDist, regeln = REGELN) {
  console.log('\n── 1. Statisch: alle Dateien ausser _astro/ ──');
  const zaehler = new Map();
  let fehler = 0;
  const alt = dateien(altDist), neu = dateien(neuDist);
  for (const d of new Set([...alt, ...neu])) {
    if (!alt.includes(d) || !neu.includes(d)) { console.log(`✗ ${d}: nur im ${alt.includes(d) ? 'alten' : 'neuen'} Build`); fehler++; continue; }
    const a = fs.readFileSync(path.join(altDist, d)), b = fs.readFileSync(path.join(neuDist, d));
    if (!/\.(html|xml|txt|json|webmanifest)$/.test(d)) {
      if (!a.equals(b)) { console.log(`✗ ${d}: Datei anders`); fehler++; }
      continue;
    }
    const at = a.toString('utf8'), bt = b.toString('utf8');
    let erwartet = wendeAn(ohneModule(ohneHash(at)), regeln, zaehler);
    let ist = ohneModule(ohneHash(bt));
    if (erwartet !== ist && regeln.length && stileSortiert(erwartet) === stileSortiert(ist)) {
      erwartet = ist;
      zaehler.set(CSS_REIHENFOLGE.name, (zaehler.get(CSS_REIHENFOLGE.name) ?? 0) + 1);
      stilSeiten.push(d);
    }
    if (erwartet === ist) {
      const ma = modulNamen(at).join(' '), mb = modulNamen(bt).join(' ');
      console.log(`✓ ${d}${ma === mb ? '' : `  (Modul-Skripte: ${modulNamen(at).length} → ${modulNamen(bt).length})`}`);
    } else {
      console.log(`✗ ${d}\n${zeigeUnterschied(erwartet, ist)}`);
      fehler++;
    }
  }
  // CSS: Die Dateien unter _astro/ haben Hashes im Namen, darum pro Seite den Inhalt aller
  // eingebundenen Stylesheets (in Reihenfolge) vergleichen
  const css = (wurzel, html) => [...html.matchAll(/<link rel="stylesheet" href="\/kiesel-website\/v2\/([^"]+)"/g)]
    .map((m) => fs.readFileSync(path.join(wurzel, m[1]), 'utf8')).join('\n/* ── */\n');
  let cssFehler = 0;
  for (const d of alt.filter((d) => d.endsWith('.html') && neu.includes(d))) {
    const a = ohneHash(css(altDist, fs.readFileSync(path.join(altDist, d), 'utf8')));
    const b = ohneHash(css(neuDist, fs.readFileSync(path.join(neuDist, d), 'utf8')));
    if (a !== b) { console.log(`✗ ${d}: CSS anders\n${zeigeUnterschied(a, b)}`); cssFehler++; }
  }
  if (!cssFehler) console.log('✓ CSS aller Seiten gleich (eingebundene Stylesheets, in Reihenfolge)');
  return { fehler: fehler + cssFehler, zaehler };
}

// ────────────────────────────────────────────────────────────── 2. nach dem Skriptlauf
// Warenkorb im alten Format, wie er seit Etappe 6 in echten Browsern liegen kann
const ALTER_KORB = JSON.stringify([
  { art: 'handy', modell: 'pro', farbe: 'Titangrau', speicher: '2tb', gravur: 'Linos Kiesel', anzahl: 1 },
  { art: 'huelle', modell: 'pro', farbe: 'mattweiss', anzahl: 2 },
  { art: 'handy', modell: 'k1', farbe: 'Kieselbeige', speicher: '256gb', anzahl: 1 },
]);

const EXTRA = [
  'kaufen/?modell=pro&farbe=Titangrau&speicher=2tb&huelle=Mattweiss',
  'kaufen/?modell=k1&farbe=kieselbeige',
  'zubehoer/huelle/?modell=k1&farbe=Mattschwarz',
  'vergleichen/?kiesel=pro&gegen=mini&ansicht=uebereinander&karte=1',
];

// DOM als Text: Elemente mit sortierten Attributen, Zustand der Formularfelder, Text.
// Ohne <script> (ausser JSON-LD) und <style> (die prüft der statische Teil).
function domAlsText() {
  const zeilen = [];
  const geh = (n, tiefe) => {
    const ein = '  '.repeat(tiefe);
    if (n.nodeType === 3) { const t = n.data.replace(/\s+/g, ' ').trim(); if (t) zeilen.push(ein + JSON.stringify(t)); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase();
    if (tag === 'style' || (tag === 'script' && n.type !== 'application/ld+json')) return;
    // Reihenfolge wie im HTML (Astro schreibt sie wie im Quelltext, also in beiden Ständen gleich)
    const attr = [...n.attributes].map((a) => `${a.name}=${JSON.stringify(a.value)}`);
    if (tag === 'input' || tag === 'textarea' || tag === 'select') attr.push(`:wert=${JSON.stringify(n.value)}`, `:an=${n.checked ?? ''}`);
    if (tag === 'dialog') attr.push(`:offen=${n.open}`);
    zeilen.push(`${ein}<${tag} ${attr.join(' ')}>`);
    for (const k of (n.shadowRoot ?? n).childNodes) geh(k, tiefe + 1);
  };
  geh(document.documentElement, 0);
  return zeilen.join('\n');
}

async function schnappschuss(kontext, url) {
  const seite = await kontext.newPage();
  const fehler = [];
  seite.on('pageerror', (e) => fehler.push(e.message));
  await seite.goto(url, { waitUntil: 'networkidle' });
  // Leerlauf abwarten (Warenkorb-Vorschau, 2D-Entscheid der Bühne), dann zwei Bilder
  await seite.evaluate(() => new Promise((r) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(r)), { timeout: 2000 })));
  await seite.waitForTimeout(300);
  const dom = await seite.evaluate(domAlsText);
  const adresse = new URL(seite.url());
  await seite.close();
  return { dom, adresse: adresse.pathname.replace(/^\/kiesel-website\/v2\//, '') + adresse.search + adresse.hash, fehler };
}

// Im Browser: Server-Adresse (Port wechselt) weg, dazu die <link rel="modulepreload">, die Vite
// beim Nachladen einfügt (welche Teil-Dateien es gibt, hängt davon ab, wie der Code aufgeteilt ist)
// Erzeugte IDs (uid() im Browser: zufälliges Kürzel + laufende Nummer, siehe svg.js): Die
// Nummer hängt davon ab, in welcher Reihenfolge Leerlauf-Aufgaben zeichnen. Darum bekommt jede
// ID mit einer Ziffer eine neue Nummer nach Auftreten, samt aller Verweise (#id, url(#id)).
function browserGleich(dom) {
  let t = ohneHash(dom)
    .replace(/http:\/\/127\.0\.0\.1:\d+/g, '')
    .replace(/^ *<link [^\n]*rel="modulepreload"[^\n]*\n/gm, '');
  const neu = new Map();
  for (const [, id] of t.matchAll(/\bid="([^"]*\d[^"]*)"/g)) if (!neu.has(id)) neu.set(id, `id${neu.size + 1}`);
  if (!neu.size) return t;
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<=["#\\s(])(${[...neu.keys()].sort((a, b) => b.length - a.length).map(esc).join('|')})(?=["\\s)])`, 'g');
  return t.replace(re, (id) => neu.get(id));
}

async function stile(browser, url, schema) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: schema });
  const s = await ctx.newPage();
  await s.goto(url, { waitUntil: 'networkidle' });
  const r = await s.evaluate(() => [...document.querySelectorAll('*')].map((el) => { const c = getComputedStyle(el); return el.tagName + '|' + [...c].sort().map((p) => `${p}:${c.getPropertyValue(p)}`).join(';'); }));
  await ctx.close();
  return r;
}

async function vergleicheLaufzeit(altDist, neuDist, regeln = REGELN, regelnAdresse = REGELN_ADRESSE) {
  console.log('\n── 2. Nach dem Skriptlauf (1440 px, weniger Bewegung, alter Warenkorb) ──');
  const alt = await starteServer({ ordner: altDist });
  const neu = await starteServer({ ordner: neuDist });
  const browser = await chromium.launch();
  const kontext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: 'light' });
  await kontext.addInitScript((korb) => { try { localStorage.setItem('kiesel-warenkorb', korb); } catch { /* egal */ } }, ALTER_KORB);
  // Math.random mit festem Startwert: uid() im Browser hängt ein zufälliges Kürzel an die
  // SVG-IDs (svg.js). Auf beiden Seiten dieselbe Folge, sonst wäre jede Seite „anders“.
  await kontext.addInitScript(() => { let x = 12345; Math.random = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); });
  const zaehler = new Map();
  let fehler = 0;
  for (const adresse of [...OEFFENTLICH.map(([a]) => a), ...EXTRA]) {
    const a = await schnappschuss(kontext, alt.basis + adresse);
    const b = await schnappschuss(kontext, neu.basis + adresse);
    const erwartet = wendeAn(browserGleich(a.dom), regeln, zaehler);
    const ist = browserGleich(b.dom);
    const adrErwartet = wendeAn(a.adresse, regelnAdresse, zaehler);
    const probleme = [];
    if (erwartet !== ist) probleme.push(zeigeUnterschied(erwartet, ist));
    if (adrErwartet !== b.adresse) probleme.push(`      Adresse erwartet ${adrErwartet}, ist ${b.adresse}`);
    if (b.fehler.length) probleme.push(`      Skriptfehler: ${b.fehler.join(' | ')}`);
    console.log(`${probleme.length ? '✗' : '✓'} /${adresse}${probleme.length ? '\n' + probleme.join('\n') : ''}`);
    fehler += probleme.length ? 1 : 0;
  }
  // Seiten mit umgestelltem CSS: berechnete Stile aller Elemente, hell und dunkel
  for (const d of stilSeiten) {
    const adresse = d.replace(/index\.html$/, '');
    for (const schema of ['light', 'dark']) {
      const a = await stile(browser, alt.basis + adresse, schema), b = await stile(browser, neu.basis + adresse, schema);
      const anders = a.length !== b.length ? Infinity : a.filter((s, i) => s !== b[i]).length;
      console.log(`${anders ? '✗' : '✓'} /${adresse} (${schema}): ${a.length} Elemente, ${anders === Infinity ? 'andere Anzahl' : `${anders} mit anderen berechneten Stilen`}`);
      if (anders) fehler++;
    }
  }
  await browser.close();
  await alt.schliessen(); await neu.schliessen();
  return { fehler, zaehler };
}

// ────────────────────────────────────────────────────────────── Ablauf
if (import.meta.url === `file://${process.argv[1]}`) {
  const ref = arg('--basis') ?? git('merge-base', 'HEAD', 'origin/v2');
  const basis = basisBauen(ref);
  if (!hat('--ohne-build')) { console.log('Jetziger Stand wird gebaut …'); baue(site); }
  const neuDist = path.join(site, 'dist');
  if (!fs.existsSync(path.join(neuDist, 'index.html'))) { console.log('✗ Kein vollständiger Build in dist/ (Fehler beim Bauen?)'); process.exit(1); }

  const ohne = hat('--ohne-regeln');
  const statisch = vergleicheStatisch(basis.dist, neuDist, ohne ? [] : REGELN);
  const laufzeit = hat('--nur-statisch') ? { fehler: 0, zaehler: new Map() } : await vergleicheLaufzeit(basis.dist, neuDist, ohne ? [] : REGELN, ohne ? [] : REGELN_ADRESSE);

  console.log('\n── Angewendete Regeln (alt → erwartet neu) ──');
  for (const r of [...REGELN, CSS_REIHENFOLGE, ...REGELN_ADRESSE]) {
    const n = (statisch.zaehler.get(r.name) ?? 0) + (laufzeit.zaehler.get(r.name) ?? 0);
    console.log(`${String(n).padStart(5)} × ${r.name}\n        Grund: ${r.grund}`);
  }
  console.log('  immer: Hash in /_astro/-Dateinamen gleichgemacht, Modul-Skripte im statischen Teil ausgeblendet (Wirkung prüft Teil 2)');
  const summe = statisch.fehler + laufzeit.fehler;
  console.log(summe ? `\n✗ ${summe} Unterschied(e) ohne Regel` : `\n✓ Kein Unterschied ausser den Regeln oben (alter Stand ${basis.sha})`);
  process.exit(summe ? 1 : 0);
}
