// Sicherheitsnetz für Umbauten, die nichts Sichtbares ändern sollen: Baut einen alten Stand
// (die Basis) und den jetzigen und vergleicht das Ergebnis.
//
//   npm run vergleiche:html                      Basis = Abzweigpunkt von origin/main (= was live ist)
//   npm run vergleiche:html -- --basis d3d404e   Basis = dieser Commit
//   … -- --ohne-build                            jetzigen Build (dist/) nicht neu bauen
//   … -- --nur-statisch                          ohne Browser-Teil
//   … -- --ohne-regeln                           Gegenprobe: gleicher Stand muss ohne Regeln gleich sein
//
// Die Basis erneuert sich selbst: Jeder Branch vergleicht gegen den Stand von main, von dem er
// abzweigt. Ihr Build wird in scripts/ausgabe/html-vergleich/basis-<commit>/ gespeichert, der
// nächste Lauf mit derselben Basis spart sich das Bauen. Neu bauen = den Ordner löschen.
//
// 1. Statisch: jede Datei in dist/ ausser _astro/ (HTML beider Sprachen, sitemap.xml,
//    robots.txt …) Byte für Byte, dazu pro Seite der Inhalt aller eingebundenen Stylesheets aus
//    _astro/ (in Reihenfolge).
// 2. Nach dem Skriptlauf: Beide Stände laufen je auf einem Mini-Server wie GitHub Pages. Jede
//    öffentliche Seite beider Sprachen (dazu ein paar Adressen mit alten Parametern und zwei
//    fehlende Adressen = 404) wird im Browser geladen, mit einem Warenkorb im alten Format
//    (deutsche Farbnamen, art 'handy'/'huelle'). Verglichen wird das fertige DOM samt Zustand
//    der Formularfelder und der Adresse. So fallen auch Texte auf, die erst per JavaScript entstehen.
//
// Immer gleichgemacht (auf beiden Seiten): Hash in /_astro/-Dateinamen, Namen der CSS-Pakete,
// erzeugte IDs (neu nummeriert), Modul-Skripte (statisch ausgeblendet, ihre Wirkung prüft Teil 2),
// Reihenfolge eingebetteter CSS-Regeln (nur mit Nachweis: berechnete Stile aller Elemente gleich).
//
// Erlaubt sind sonst nur Unterschiede, für die in REGELN eine Regel mit Begründung steht. Jede
// Regel verwandelt die ALTE Fassung in die erwartete neue (wie scripts/abweichungen.mjs); danach
// muss alles gleich sein. Das Skript meldet, wie oft jede Regel gegriffen hat. Eine Regel gehört
// zu genau einem Umbau: nach dem Merge wieder löschen (die neue Basis enthält sie ja schon).
// Die Regeln früherer Umbauten (9a Kennungen, 9b Englisch) stehen in der Git-Geschichte.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { ALLE_OEFFENTLICH } from './seiten.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(hier, '..');
const repo = path.join(site, '..');
const ausgabe = path.join(hier, 'ausgabe', 'html-vergleich');
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const hat = (name) => process.argv.includes(name);
const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' }).trim();

// ────────────────────────────────────────────────────────────── Regeln
// Bewusste sichtbare Unterschiede des laufenden Umbaus: { name, grund, alt: RegExp (mit g), neu: Funktion }.
// Leer = der Umbau darf nichts ändern. Nach dem Merge wieder leeren.
export const REGELN = [];

// Basispfad eines Builds (base aus astro.config.mjs), abgelesen am Favicon der Startseite
const basispfad = (dist) => fs.readFileSync(path.join(dist, 'index.html'), 'utf8').match(/<link rel="icon" href="([^"]*)favicon\.svg"/)[1];

// Dazu kommt eine Regel von selbst, wenn die zwei Builds verschiedene base haben
// (Etappe 10: /kiesel-website/v2/ → /kiesel-website/). Sie ersetzt den alten Basispfad überall,
// auch in absoluten Adressen (canonical, og:url, hreflang, Sitemap, robots.txt).
function basisRegel(altBasis, neuBasis) {
  if (altBasis === neuBasis) return [];
  const esc = altBasis.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [{
    name: `Basispfad ${altBasis} → ${neuBasis}`,
    grund: 'Die Seite ist umgezogen (base in astro.config.mjs). Links, Dateien und absolute Adressen haben einen anderen Vorsatz, sonst nichts.',
    alt: new RegExp(esc, 'g'),
    neu: () => neuBasis,
  }];
}

// Dateinamen mit Hash (/_astro/kaufen.C8kEdgo3.css): Der Hash hängt am Inhalt, und der
// Code der Skripte ändert sich ja. Auf beiden Seiten gleichmachen.
const ohneHash = (s) => s.replace(/(\/_astro\/[\w.-]+?)\.[\w-]{8}\.(js|css|woff2|png|jpg|webp|svg)/g, '$1.[hash].$2');
// Namen der CSS-Pakete (/_astro/index.css → pages.css): Vite teilt die Pakete je nach Importen
// anders auf. Der Inhalt aller eingebundenen Stylesheets wird je Seite ohnehin verglichen.
const ohneCssNamen = (s) => s.replace(/(\/_astro\/)[\w.-]+?(\.\[hash\]\.css)/g, '$1[paket]$2');
// Erzeugte IDs (kiesel-logo-14, qs49fl): Logo.astro und uid() im Zeichen-Motor zählen über den
// ganzen Build bzw. in der Reihenfolge der Leerlauf-Aufgaben. Je Datei neu nummeriert, samt Verweisen.
function idsNeu(t) {
  const neu = new Map();
  for (const [, id] of t.matchAll(/\bid="([^"]*\d[^"]*)"/g)) if (!neu.has(id)) neu.set(id, `id${neu.size + 1}`);
  if (!neu.size) return t;
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<=["#\\s(])(${[...neu.keys()].sort((a, b) => b.length - a.length).map(esc).join('|')})(?=["\\s)])`, 'g');
  return t.replace(re, (id) => neu.get(id));
}
const gleichmachen = (s) => idsNeu(ohneCssNamen(ohneHash(s)));

// Modul-Skripte: Ihr Code wandert mit jedem Umbau (neue Importe, anderer Hash, klein genug zum
// Einbetten oder nicht mehr). Was sie auf der Seite anrichten, prüft der Browser-Teil.
const MODUL = /<script type="module"(?: src="([^"]*)")?>([\s\S]*?)<\/script>/g;
const ohneModule = (s) => s.replace(MODUL, '');
const modulNamen = (s) => [...s.matchAll(MODUL)].map((m) => (m[1] ? ohneHash(m[1]).replace(/.*\/_astro\//, '') : '(eingebettet)')).sort();

// Eingebettete <style>-Blöcke: Astro sammelt die CSS-Regeln der Bausteine in der Reihenfolge,
// in der Vite die Module fertig hat. Neue Importe können sie umstellen. Darum werden die
// obersten Blöcke eines <style> sortiert verglichen, und wo das nötig war, prüft Teil 2 im
// Browser, dass jedes Element dieselben berechneten Stile hat (siehe stile()).
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
const CSS_REIHENFOLGE = 'Reihenfolge der eingebetteten CSS-Regeln (Nachweis im Browser: gleiche berechnete Stile)';

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
  if (fs.existsSync(path.join(ziel, 'index.html'))) { console.log(`Basis ${sha}: gespeicherter Build wird benutzt`); return { sha, dist: ziel }; }
  console.log(`Basis ${sha}: wird gebaut …`);
  const baum = fs.mkdtempSync(path.join(os.tmpdir(), 'kiesel-basis-'));
  git('worktree', 'add', '--detach', baum, sha);
  try {
    if (!fs.existsSync(path.join(baum, 'site', 'astro.config.mjs'))) throw new Error(`Basis ${sha} hat kein site/ (zu alt?), mit --basis einen anderen Commit wählen`);
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
function vergleicheStatisch(altDist, neuDist, regeln) {
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
    let erwartet = ohneModule(gleichmachen(wendeAn(at, regeln, zaehler)));
    const ist = ohneModule(gleichmachen(bt));
    if (erwartet !== ist && !hat('--ohne-regeln') && stileSortiert(erwartet) === stileSortiert(ist)) {
      erwartet = ist;
      zaehler.set(CSS_REIHENFOLGE, (zaehler.get(CSS_REIHENFOLGE) ?? 0) + 1);
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
  const css = (wurzel, html) => {
    const esc = basispfad(wurzel).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return [...html.matchAll(new RegExp(`<link rel="stylesheet" href="${esc}([^"]+)"`, 'g'))]
      .map((m) => fs.readFileSync(path.join(wurzel, m[1]), 'utf8')).join('\n/* ── */\n');
  };
  let cssFehler = 0;
  for (const d of alt.filter((d) => d.endsWith('.html') && neu.includes(d))) {
    const a = ohneHash(wendeAn(css(altDist, fs.readFileSync(path.join(altDist, d), 'utf8')), regeln, zaehler));
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

// Adressen mit Parametern (auch alten), dazu je Sprache eine fehlende Adresse (404, auf /en/ englisch)
const EXTRA = [
  'kaufen/?modell=pro&farbe=Titangrau&speicher=2tb&huelle=Mattweiss',
  'kaufen/?modell=k1&farbe=kieselbeige',
  'zubehoer/huelle/?modell=k1&farbe=Mattschwarz',
  'vergleichen/?kiesel=pro&gegen=mini&ansicht=uebereinander&karte=1',
  'en/buy/?model=k1&color=pebble-beige&storage=1tb',
  'en/buy/?modell=pro&farbe=Himmelblau',
  'en/compare/?phone=pro&vs=mini&view=overlay',
  'gibt-es-nicht/',
  'en/gibt-es-nicht/',
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

async function schnappschuss(kontext, server, adresse) {
  const seite = await kontext.newPage();
  const fehler = [];
  seite.on('pageerror', (e) => fehler.push(e.message));
  await seite.goto(server.basis + adresse, { waitUntil: 'networkidle' });
  // Leerlauf abwarten (Warenkorb-Vorschau, 2D-Entscheid der Bühne), dann zwei Bilder
  await seite.evaluate(() => new Promise((r) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(r)), { timeout: 2000 })));
  await seite.waitForTimeout(300);
  const dom = await seite.evaluate(domAlsText);
  const url = new URL(seite.url());
  await seite.close();
  // Adresse ohne Server und Basispfad, dieselbe Form in beiden Ständen
  return { dom, adresse: url.pathname.slice(server.basispfad.length) + url.search + url.hash, fehler };
}

// Im Browser: Server-Adresse (Port wechselt) weg, dazu die <link rel="modulepreload">, die Vite
// beim Nachladen einfügt (welche Teil-Dateien es gibt, hängt davon ab, wie der Code aufgeteilt ist)
function browserGleich(dom) {
  return idsNeu(ohneCssNamen(ohneHash(dom))
    .replace(/http:\/\/127\.0\.0\.1:\d+/g, '')
    .replace(/^ *<link [^\n]*rel="modulepreload"[^\n]*\n/gm, ''));
}

async function stile(browser, url, schema) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: schema, locale: 'de-CH' });
  const s = await ctx.newPage();
  await s.goto(url, { waitUntil: 'networkidle' });
  // <script> und <link> haben keinen sichtbaren Stil; ihre Anzahl hängt davon ab, wie Vite den
  // Code aufteilt (modulepreload), darum nicht mitzählen
  const r = await s.evaluate(() => [...document.querySelectorAll('*')].filter((el) => el.tagName !== 'SCRIPT' && el.tagName !== 'LINK').map((el) => { const c = getComputedStyle(el); return el.tagName + '|' + [...c].sort().map((p) => `${p}:${c.getPropertyValue(p)}`).join(';'); }));
  await ctx.close();
  // Verweise auf erzeugte IDs (fill: url("#qs55fr")) nach Auftreten neu nummerieren, wie idsNeu()
  const nr = new Map();
  return r.map((z) => z.replace(/url\("#([^"]+)"\)/g, (_, id) => { if (!nr.has(id)) nr.set(id, nr.size + 1); return `url("#id${nr.get(id)}")`; }));
}

async function vergleicheLaufzeit(altDist, neuDist, regeln) {
  console.log('\n── 2. Nach dem Skriptlauf (1440 px, weniger Bewegung, alter Warenkorb, beide Sprachen) ──');
  // fehlerseite: fehlende Adressen bekommen wie bei GitHub Pages die 404.html
  const starte = async (ordner) => { const b = basispfad(ordner); return { ...(await starteServer({ ordner, basispfad: b, fehlerseite: true })), basispfad: b }; };
  const alt = await starte(altDist), neu = await starte(neuDist);
  const browser = await chromium.launch();
  // locale de-CH: ein deutscher Browser (Playwright ist sonst en-US, dann erschiene auf den
  // deutschen Seiten der Sprach-Hinweis; auf den englischen Seiten erscheint er so, in beiden Ständen)
  const kontext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: 'light', locale: 'de-CH' });
  await kontext.addInitScript((korb) => { try { localStorage.setItem('kiesel-warenkorb', korb); } catch { /* egal */ } }, ALTER_KORB);
  // Math.random mit festem Startwert: uid() im Browser hängt ein zufälliges Kürzel an die
  // SVG-IDs (svg.js). Auf beiden Seiten dieselbe Folge, sonst wäre jede Seite „anders“.
  await kontext.addInitScript(() => { let x = 12345; Math.random = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); });
  const zaehler = new Map();
  let fehler = 0;
  for (const adresse of [...ALLE_OEFFENTLICH.map(([a]) => a), ...EXTRA]) {
    const a = await schnappschuss(kontext, alt, adresse);
    const b = await schnappschuss(kontext, neu, adresse);
    const erwartet = browserGleich(wendeAn(a.dom, regeln, zaehler));
    const ist = browserGleich(b.dom);
    const probleme = [];
    if (erwartet !== ist) probleme.push(zeigeUnterschied(erwartet, ist));
    if (a.adresse !== b.adresse) probleme.push(`      Adresse erwartet ${a.adresse}, ist ${b.adresse}`);
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
  const ref = arg('--basis') ?? git('merge-base', 'HEAD', 'origin/main');
  const basis = basisBauen(ref);
  if (!hat('--ohne-build')) { console.log('Jetziger Stand wird gebaut …'); baue(site); }
  const neuDist = path.join(site, 'dist');
  if (!fs.existsSync(path.join(neuDist, 'index.html'))) { console.log('✗ Kein vollständiger Build in dist/ (Fehler beim Bauen?)'); process.exit(1); }

  const regeln = hat('--ohne-regeln') ? [] : [...basisRegel(basispfad(basis.dist), basispfad(neuDist)), ...REGELN];
  const statisch = vergleicheStatisch(basis.dist, neuDist, regeln);
  const laufzeit = hat('--nur-statisch') ? { fehler: 0, zaehler: new Map() } : await vergleicheLaufzeit(basis.dist, neuDist, regeln);

  console.log('\n── Angewendete Regeln (alt → erwartet neu) ──');
  if (!regeln.length) console.log('  keine');
  for (const r of regeln) {
    const n = (statisch.zaehler.get(r.name) ?? 0) + (laufzeit.zaehler.get(r.name) ?? 0);
    console.log(`${String(n).padStart(5)} × ${r.name}\n        Grund: ${r.grund}`);
  }
  const umgestellt = statisch.zaehler.get(CSS_REIHENFOLGE);
  if (umgestellt) console.log(`${String(umgestellt).padStart(5)} × ${CSS_REIHENFOLGE}`);
  console.log('  immer: Hash und CSS-Paketnamen in /_astro/, erzeugte IDs neu nummeriert, Modul-Skripte im statischen Teil ausgeblendet (Wirkung prüft Teil 2)');
  const summe = statisch.fehler + laufzeit.fehler;
  console.log(summe ? `\n✗ ${summe} Unterschied(e) ohne Regel` : `\n✓ Kein Unterschied ausser den Regeln oben (Basis ${basis.sha})`);
  process.exit(summe ? 1 : 0);
}
