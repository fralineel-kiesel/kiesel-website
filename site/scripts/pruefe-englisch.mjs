// Prüft die englische Fassung (Etappe 9b):
//
//   npm run pruefe:englisch
//
// 1. Ohne Browser
//    - de.js und en.js haben exakt dieselben Schlüssel (auch in Listen und verschachtelt), Texte
//      mit Werten sind in beiden Funktionen, kein Wert ist leer. Einzige Ausnahme: die Frage
//      faqFragen.pebble („Why is it called Kiesel?“) gibt es nur auf Englisch.
//    - Adressbuch: englische Adressen, Anker und Parameter eindeutig; pfad() und gegenadresse()
//      führen jede Seite (mit Parametern und Sprungziel) hin und wieder genau zurück.
//    - Formate: CHF 1,200 / CHF 131.80, 10:18 PM, 7 AM, Sperrbildschirm 7:32 und „Friday, September 25“.
//    - Akku-Rechner: die 4 typischen Tage und 400 zufällige Einstellungen rechnen auf Deutsch und
//      Englisch dieselben Zahlen (Prozent, Uhrzeit, Tage), nur anders geschrieben.
// 2. Im Build (dist/)
//    - lang, og:locale, canonical je Sprache; hreflang-Paare gegenseitig, auf existierende Seiten,
//      x-default = Deutsch; noindex-Seiten ohne; sitemap.xml mit beiden Sprachen.
//    - Englisches FAQ-JSON-LD (15 Fragen, englisch).
// 3. Im Browser
//    - Keine deutschen Texte auf englischen Seiten, nach dem Laden und nach denselben Bedienschritten
//      wie pruefe:texte (Heuristik aus deutsch-erkennen.mjs; Texte in lang="de" sind gewollt).
//    - Alle Links auf englischen Seiten bleiben unter /en/ (ausser bewusst sprachunabhängigen:
//      GitHub, der Weg zurück auf Deutsch im Umschalter bzw. im Sprach-Hinweis), auch nach dem Skriptlauf.
//    - Umschalter: von jeder Seite zur richtigen Gegenseite und zurück, mit Parametern und Sprungziel.
//    - Warenkorb: auf Deutsch befüllt, auf Englisch richtig übersetzt, und umgekehrt.
//    - Englische Parameter auf /en/buy/, /en/accessories/case/, /en/compare/ (deutsche gehen auch).
//    - Sprach-Hinweis: erscheint bei englischem Browser auf Deutsch (und umgekehrt), nicht bei
//      anderen Sprachen, bleibt nach dem Wegklicken (Knopf, Escape) weg, gesperrter Speicher geht,
//      kein Layoutsprung.
//    - 404: unter /en/ englisch, sonst deutsch (Server liefert wie GitHub Pages nur eine 404.html).
//    - Keine Skriptfehler.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { SEITEN, OEFFENTLICH, ANKER, PARAMETER, EN_PRAEFIX } from '../src/data/seiten.js';
import { pfad, gegenadresse, seitenKennung } from '../src/lib/pfad.js';
import { chf, chfRappen, uhrzeit, stunde, datum, prozent } from '../src/lib/format.js';
import { sperrbildschirm } from '../src/lib/kiesel-draw/sperrbildschirm.js';
import { rechne } from '../src/lib/akku-rechner.js';
import { RECHNER } from '../src/data/akku.js';
import { deutscheWoerter } from './deutsch-erkennen.mjs';
import { BEDIENUNG, sammleTexte } from './pruefe-texte.mjs';
import * as de from '../src/i18n/de.js';
import * as en from '../src/i18n/en.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(hier, '..', 'dist');
const BASE = '/kiesel-website/v2/';
const SITE = 'https://fralineel-kiesel.github.io';
let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info && !ok ? `\n    ${String(info).slice(0, 3000)}` : ''}`);
  if (!ok) fehler++;
}
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const EN_SEITEN = SEITEN.filter(([, , , e]) => e !== null);

// ====================================================================== 1. ohne Browser
console.log('\n── Textdateien ──');
// Schlüssel, die es bewusst nur in einer Sprache gibt: [Pfad, Sprache, Grund]
const NUR_EINE_SPRACHE = [['faqFragen.pebble', 'en', 'Frage „Why is it called Kiesel?“ erklärt nur Englischsprachigen den Namen (data/faq.js: nur)']];
{
  const abweichungen = [], leer = [];
  const art = (w) => (Array.isArray(w) ? 'Liste' : w === null ? 'null' : typeof w);
  function vergleiche(a, b, p) {
    if (art(a) !== art(b)) return abweichungen.push(`${p}: ${art(a)} (de) ≠ ${art(b)} (en)`);
    if (Array.isArray(a)) {
      if (a.length !== b.length) abweichungen.push(`${p}: ${a.length} Einträge (de) ≠ ${b.length} (en)`);
      a.forEach((x, i) => i < b.length && vergleiche(x, b[i], `${p}[${i}]`));
    } else if (a && typeof a === 'object') {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const q = p ? `${p}.${k}` : k;
        if (!(k in a) || !(k in b)) {
          const nur = !(k in a) ? 'en' : 'de';
          if (!NUR_EINE_SPRACHE.some(([pp, s]) => pp === q && s === nur)) abweichungen.push(`${q}: nur ${nur}`);
          continue;
        }
        vergleiche(a[k], b[k], q);
      }
    } else if (typeof a === 'string') {
      if (!a.trim() && a !== ' ') leer.push(`${p} (de)`);
      if (!b.trim() && b !== ' ') leer.push(`${p} (en)`);
    }
  }
  vergleiche({ ...de }, { ...en }, '');
  pruefe(`de.js und en.js: dieselben Schlüssel (${Object.keys(de).length} Bereiche; Ausnahme: ${NUR_EINE_SPRACHE.map(([p]) => p).join(', ')})`, abweichungen.length === 0, abweichungen.join('\n    '));
  pruefe('Kein Wert ist leer', leer.length === 0, leer.join(', '));
  pruefe('Ausnahme pebble: gibt es wirklich nur auf Englisch', !('pebble' in de.faqFragen) && !!en.faqFragen.pebble?.frage);
  // Glossar: feste Begriffe, wie der Auftrag sie vorgibt
  const alles = JSON.stringify(en, (k, v) => (typeof v === 'function' ? (() => { try { return v('X', 'X', 'X', 'X'); } catch { return ''; } })() : v));
  const GLOSSAR = ['Fits every hand.', 'Zen Mode', 'Privacy Mode', 'Sensors Off', 'Radio Silence', 'RGB light', 'Action button', 'side button', 'Kiesel Case', 'Battery Calculator', 'Bag', 'Checkout', 'VAT', 'Matte Black', 'Titanium Gray', 'Sky Blue', 'Matte White', 'Pebble Beige'];
  const fehlt = GLOSSAR.filter((g) => !alles.includes(g));
  pruefe('Glossar: alle Begriffe kommen vor', fehlt.length === 0, fehlt.join(', '));
  const falsch = [/\bcolour/i, /\bgrey\b/i, /Zen mode/, /Privacy mode/, /\bshopping cart\b/i, /\bKiesel case\b/, /\bbattery calculator\b/, /ß/];
  const treffer = falsch.filter((r) => r.test(alles)).map(String);
  pruefe('Kein britisches Englisch, keine Glossar-Varianten (colour, grey, Zen mode …)', treffer.length === 0, treffer.join(', '));
  pruefe('Notrufnummern bleiben und sind als Schweizer Nummern erklärt', /112, 117 or 144 \(the Swiss emergency numbers\)/.test(en.privacy.notruf.text[2]) && /Swiss emergency numbers/.test(en.faqFragen.notruf.antwort));
}

console.log('\n── Adressbuch ──');
{
  const enAdressen = EN_SEITEN.map(([, , , e]) => e);
  pruefe('Englische Adressen eindeutig, klein, ohne Umlaute', new Set(enAdressen).size === enAdressen.length && enAdressen.every((a) => /^[a-z0-9\-/.]*$/.test(a)));
  const SOLL = { '': '', 'kiesel-1/': 'kiesel-1/', 'kiesel-1/technik/': 'kiesel-1/specs/', 'kiesel-1-pro/': 'kiesel-1-pro/', 'kiesel-1-pro/technik/': 'kiesel-1-pro/specs/',
    'vergleichen/': 'compare/', 'funktionen/': 'features/', 'zubehoer/': 'accessories/', 'zubehoer/huelle/': 'accessories/case/', 'kaufen/': 'buy/', 'warenkorb/': 'bag/',
    'akku-rechner/': 'battery-calculator/', 'faq/': 'faq/' };
  const ab = Object.entries(SOLL).filter(([d, e]) => pfad(d, 'en') !== BASE + EN_PRAEFIX + e);
  pruefe('Adressen wie vorgegeben (/en/buy/, /en/kiesel-1/specs/ …)', ab.length === 0, ab.map(([d]) => `${d} → ${pfad(d, 'en')}`).join(', '));
  pruefe('Anker und Parameter: englische Namen eindeutig', new Set(Object.values(ANKER)).size === Object.values(ANKER).length && new Set(Object.values(PARAMETER)).size === Object.values(PARAMETER).length);
  pruefe('Kaufen-Parameter englisch: ?model=&color=', pfad('kaufen/?modell=pro&farbe=sky-blue&speicher=2tb&huelle=matte-white', 'en') === `${BASE}en/buy/?model=pro&color=sky-blue&storage=2tb&case=matte-white`);
  const faelle = [
    ['kaufen/?modell=k1&farbe=matte-black&speicher=1tb', 'en/buy/?model=k1&color=matte-black&storage=1tb'],
    ['funktionen/#privacy', 'en/features/#privacy'], ['funktionen/#kamera', 'en/features/#camera'],
    ['kiesel-1/#akku', 'en/kiesel-1/#battery'], ['faq/#konzept', 'en/faq/#concept'], ['faq/#notruf', 'en/faq/#emergency'],
    ['vergleichen/?kiesel=pro&gegen=mini&ansicht=overlay&karte=1', 'en/compare/?phone=pro&vs=mini&view=overlay&card=1'],
    ['zubehoer/huelle/?modell=k1&farbe=pebble-beige', 'en/accessories/case/?model=k1&color=pebble-beige'],
    ['kaufen/?utm=x&modell=pro', 'en/buy/?utm=x&model=pro'],   // unbekannte Parameter bleiben
  ];
  const kaputt = [];
  for (const [d, e] of faelle) {
    const hin = gegenadresse(BASE + d, 'en'), zurueck = gegenadresse(BASE + e, 'de');
    if (hin !== BASE + e || zurueck !== BASE + d) kaputt.push(`${d} → ${hin} → ${zurueck}`);
  }
  for (const [d] of EN_SEITEN) {
    const hin = gegenadresse(BASE + d, 'en');
    if (gegenadresse(hin, 'de') !== BASE + d || seitenKennung(hin) !== d) kaputt.push(`${d} ↔ ${hin}`);
  }
  pruefe(`gegenadresse(): ${faelle.length} Fälle und ${EN_SEITEN.length} Seiten hin und genau zurück`, kaputt.length === 0, kaputt.join('\n    '));
  pruefe('Nur deutsche Seiten (Designsystem, Spielwiese) haben keine Gegenseite', gegenadresse(`${BASE}designsystem/`, 'en') === null && gegenadresse(`${BASE}designsystem/spielwiese/?x=1`, 'en') === null);
}

console.log('\n── Formate ──');
pruefe('Preise: CHF 1,200 und CHF 131.80 (Deutsch: CHF 1’200.– / CHF 131.80)', chf(1200, 'en') === 'CHF 1,200' && chf(131.8, 'en') === 'CHF 131.80' && chfRappen(230000, 'en') === 'CHF 2,300' && chf(1200) === 'CHF 1’200.–');
pruefe('Uhrzeit 12 Stunden: 10:18 PM, 7:00 AM, 12:00 PM, 12:30 AM', uhrzeit(22.3, 'en') === '10:18 PM' && uhrzeit(7, 'en') === '7:00 AM' && uhrzeit(12, 'en') === '12:00 PM' && uhrzeit(0.5, 'en') === '12:30 AM');
pruefe('Achse: 7 AM … 11 PM (Deutsch 07:00 … 23:00)', [7, 11, 15, 19, 23].map((h) => stunde(h, 'en')).join(' ') === '7 AM 11 AM 3 PM 7 PM 11 PM' && stunde(23) === '23:00');
pruefe('Sperrbildschirm: „Friday, September 25“ und „7:32“', gleich(sperrbildschirm('en'), { datum: 'Friday, September 25', uhrzeit: '7:32' }) && gleich(sperrbildschirm(), { datum: 'Freitag, 25. September', uhrzeit: '07:32' }));
pruefe('Prozent ohne Leerzeichen: 44%', prozent(44, 'en') === '44%' && datum(new Date(Date.UTC(2026, 8, 25)), 'en') === 'Friday, September 25');

console.log('\n── Akku-Rechner: gleiche Zahlen ──');
// Englischen Text auf die Zahlen zurückführen: 10:18 PM → 22:18, 1,234 → 1234, 44% → 44
const zahlenDe = (t) => (t.replace(/’/g, '').match(/\d+(?:[.:]\d+)?/g) ?? []);
const zahlenEn = (t) => t.replace(/,(?=\d{3})/g, '').replace(/(\d{1,2}):(\d\d)\s?(AM|PM)/g, (m, h, mi, ap) => `${String((Number(h) % 12) + (ap === 'PM' ? 12 : 0)).padStart(2, '0')}:${mi}`).match(/\d+(?:[.:]\d+)?/g) ?? [];
{
  const unterschiede = [];
  const zufall = (() => { let s = 42; return () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31); })();
  const faelle = [...Object.values(RECHNER.tage), ...Array.from({ length: 400 }, () => Object.fromEntries(RECHNER.regler.map(([k, max]) => [k, Math.round(zufall() * max * 2) / 2])))];
  for (const w of faelle) {
    const d = rechne(w, de.akkuRechner, 'de'), e = rechne(w, en.akkuRechner, 'en');
    const zd = [d.schlagzeile, d.fehler, ...d.balken.flatMap((b) => [b.text, b.tage, b.prozent])].map(String).flatMap(zahlenDe);
    const ze = [e.schlagzeile, e.fehler, ...e.balken.flatMap((b) => [b.text, b.tage, b.prozent])].map(String).flatMap(zahlenEn);
    if (!gleich(zd, ze)) unterschiede.push(`${JSON.stringify(w)}: ${zd.join(' ')} ≠ ${ze.join(' ')}`);
  }
  pruefe(`Rechnung: ${faelle.length} Einstellungen, auf Deutsch und Englisch dieselben Zahlen`, unterschiede.length === 0, unterschiede.slice(0, 5).join('\n    '));
  const normal = rechne(RECHNER.tage.normal, en.akkuRechner, 'en');
  pruefe('Englisch geschrieben: „44%“, „The Pro has 11 percentage points more left.“', normal.balken[1].text === '44%' && normal.schlagzeile === 'The Pro has 11 percentage points more left.', `${normal.balken[1].text} | ${normal.schlagzeile}`);
  const busy = rechne(RECHNER.tage.busy, en.akkuRechner, 'en');
  pruefe('„Viel unterwegs“ auf Englisch: Kiesel 1 leer um „9:37 PM“, Pro „15%“', busy.balken[1].text === 'empty at 9:37 PM' && busy.balken[0].text === '15%', `${busy.balken[1].text} | ${busy.balken[0].text}`);
}

// ====================================================================== 2. im Build
console.log('\n── Suchmaschinen (dist/) ──');
const html = (adresse) => fs.readFileSync(path.join(dist, adresse.endsWith('.html') ? adresse : path.join(adresse, 'index.html')), 'utf8');
const abs = (adresse) => SITE + BASE + adresse;
{
  const probleme = [];
  const alle = [...SEITEN.map(([d, , o]) => [d, 'de', o]), ...EN_SEITEN.map(([, , o, e]) => [EN_PRAEFIX + e, 'en', o])];
  const vorhanden = new Set(alle.map(([a]) => abs(a)));
  const hreflang = new Map();
  for (const [a, sprache, oeffentlich] of alle) {
    const h = html(a);
    const lang = h.match(/<html lang="([^"]+)"/)?.[1];
    if (lang !== (sprache === 'en' ? 'en-US' : 'de-CH')) probleme.push(`${a}: lang="${lang}"`);
    const og = h.match(/property="og:locale" content="([^"]+)"/)?.[1];
    if (og !== (sprache === 'en' ? 'en_US' : 'de_CH')) probleme.push(`${a}: og:locale ${og}`);
    const kan = h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const paare = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
    if (!oeffentlich) {
      if (kan || paare.length) probleme.push(`${a}: noindex-Seite mit canonical/hreflang`);
      continue;
    }
    if (kan !== abs(a)) probleme.push(`${a}: canonical ${kan}`);
    hreflang.set(abs(a), paare);
    if (!gleich(paare.map(([l]) => l), ['de', 'en', 'x-default'])) probleme.push(`${a}: hreflang ${paare.map(([l]) => l)}`);
    if (!paare.some(([, u]) => u === abs(a))) probleme.push(`${a}: nennt sich nicht selbst`);
    for (const [, u] of paare) if (!vorhanden.has(u)) probleme.push(`${a}: hreflang auf fehlende Seite ${u}`);
    const xd = paare.find(([l]) => l === 'x-default')?.[1];
    if (xd !== paare.find(([l]) => l === 'de')?.[1]) probleme.push(`${a}: x-default ≠ Deutsch`);
    if (!h.includes(`property="og:locale:alternate" content="${sprache === 'en' ? 'de_CH' : 'en_US'}"`)) probleme.push(`${a}: og:locale:alternate fehlt`);
  }
  // gegenseitig: A nennt B für Sprache x ⇒ B nennt A für A's Sprache
  for (const [u, paare] of hreflang) {
    for (const [l, v] of paare) {
      if (l === 'x-default' || v === u) continue;
      const zurueck = hreflang.get(v) ?? [];
      if (!zurueck.some(([, w]) => w === u)) probleme.push(`${u} → ${v} (${l}) nicht gegenseitig`);
    }
  }
  pruefe(`lang, og:locale, canonical, hreflang: ${alle.length} Seiten, ${hreflang.size} Paare gegenseitig und existierend`, probleme.length === 0, probleme.join('\n    '));
  // Titel und Beschreibung je Sprache einmalig (über die Sprachen hinweg dürfen Eigennamen wie
  // „Kiesel 1 · Kiesel“ gleich sein, hreflang verbindet die Paare); Beschreibungen immer übersetzt
  const doppelt = [];
  for (const sp of ['de', 'en']) {
    const gesehen = new Map();
    for (const [a, s2, o] of alle) {
      if (!o || s2 !== sp) continue;
      const h = html(a);
      for (const k of [h.match(/<title>([^<]*)<\/title>/)[1], h.match(/<meta name="description" content="([^"]*)"/)[1]]) {
        if (gesehen.has(k)) doppelt.push(`${sp}: „${k}“ auf ${gesehen.get(k)} und ${a}`);
        gesehen.set(k, a);
      }
    }
  }
  const gleicheBeschreibung = EN_SEITEN.filter(([d, , o, e]) => o && html(d).match(/<meta name="description" content="([^"]*)"/)[1] === html(EN_PRAEFIX + e).match(/<meta name="description" content="([^"]*)"/)[1]).map(([d]) => d);
  pruefe('Titel und Beschreibungen je Sprache einmalig, Beschreibungen übersetzt', doppelt.length === 0 && gleicheBeschreibung.length === 0, [...doppelt, ...gleicheBeschreibung.map((d) => `gleiche Beschreibung: ${d}`)].join('\n    '));
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const soll = [...OEFFENTLICH.map(([d]) => abs(d)), ...OEFFENTLICH.map(([d]) => SITE + pfad(d, 'en'))];
  pruefe(`sitemap.xml: beide Sprachen (${soll.length} Adressen) mit xhtml:link-Paaren`, gleich([...locs].sort(), [...soll].sort()) && (sitemap.match(/hreflang="x-default"/g) ?? []).length === soll.length, `${locs.length} statt ${soll.length}`);
  const ld = JSON.parse(html('en/faq/').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const fragen = ld.mainEntity.map((q) => q.name);
  pruefe('Englisches FAQ-JSON-LD: 15 Fragen, englisch, mit „Why is it called Kiesel?“', ld['@type'] === 'FAQPage' && fragen.length === 15 && fragen.includes('Why is it called Kiesel?')
    && fragen.every((f) => deutscheWoerter(f).length === 0) && ld.mainEntity.every((q) => deutscheWoerter(q.acceptedAnswer.text).length === 0), fragen.join(' | '));
  const ldDe = JSON.parse(html('faq/').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  pruefe('Deutsches FAQ-JSON-LD unverändert: 14 Fragen', ldDe.mainEntity.length === 14);
}

// ====================================================================== 3. im Browser
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer({ fehlerseite: true });
const WARENKORB = [
  { art: 'phone', modell: 'pro', farbe: 'titanium-gray', speicher: '2tb', gravur: 'Linos Kiesel', anzahl: 2 },
  { art: 'case', modell: 'pro', farbe: 'matte-white', anzahl: 1 },
  { art: 'phone', modell: 'k1', farbe: 'sky-blue', speicher: '256gb', anzahl: 1 },
];
async function kontext({ sprache = 'de-CH', speicher = null, init = [] } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: sprache });
  if (speicher) await ctx.addInitScript((w) => { try { if (!sessionStorage.getItem('gesetzt')) { sessionStorage.setItem('gesetzt', '1'); localStorage.setItem('kiesel-warenkorb', w); } } catch { /* */ } }, JSON.stringify(speicher));
  for (const s of init) await ctx.addInitScript(s);
  return ctx;
}
const skriptfehler = [];
async function neueSeite(ctx) {
  const s = await ctx.newPage();
  s.on('pageerror', (e) => skriptfehler.push(`${s.url()}: ${e.message.split('\n')[0]}`));
  return s;
}
const ruhig = (s) => s.evaluate(() => new Promise((r) => requestIdleCallback(() => requestAnimationFrame(() => r()), { timeout: 2000 })));
const enAdresse = (d) => pfad(d, 'en').slice(BASE.length);

console.log('\n── Keine deutschen Texte auf englischen Seiten ──');
{
  const ctx = await kontext({ sprache: 'en-US', speicher: WARENKORB });
  const funde = new Map();
  for (const [d] of EN_SEITEN) {
    const adresse = enAdresse(d);
    const seite = await neueSeite(ctx);
    await seite.goto(basis + adresse, { waitUntil: 'networkidle' });
    await ruhig(seite);
    const sammle = async (wann) => {
      // Texte in lang="de…" (Umschalter „Deutsch“, Sprach-Hinweis auf Deutsch) sind gewollt
      // deutsch: kurz aus dem Dokument nehmen, sammeln, wieder einsetzen
      const texte = await seite.evaluate(`(() => {
        const weg = [...document.querySelectorAll('[lang^="de"]')].map((e) => [e, e.parentNode, e.nextSibling]);
        weg.forEach(([e]) => e.remove());
        const t = (${sammleTexte.toString()})();
        weg.reverse().forEach(([e, p, n]) => p.insertBefore(e, n));
        return t;
      })()`);
      for (const [text, wo] of texte) {
        if (/Linos\s+Kiesel/u.test(text)) continue; // Gravur, die der Test eintippt
        const w = deutscheWoerter(text);
        if (w.length) funde.set(`${wo}|${text}`, `/${adresse}${wann}  ${wo}\n      „${text.slice(0, 120)}“ → ${w.join(', ')}`);
      }
    };
    await sammle('');
    for (const schritt of BEDIENUNG[d] ?? []) {
      try { await schritt(seite); } catch { /* Schritt passt hier nicht, egal */ }
      await seite.waitForTimeout(80);
      await sammle(' (nach Bedienung)');
    }
    await seite.close();
  }
  await ctx.close();
  pruefe(`${EN_SEITEN.length} englische Seiten: keine deutschen Wörter (Text, aria-*, alt, title, Meta, JSON-LD, nach Bedienung)`, funde.size === 0, [...funde.values()].slice(0, 60).join('\n    '));
}

console.log('\n── Links bleiben unter /en/ ──');
{
  const ctx = await kontext({ sprache: 'en-US', speicher: WARENKORB });
  const raus = [];
  for (const [d] of EN_SEITEN) {
    const seite = await neueSeite(ctx);
    await seite.goto(basis + enAdresse(d), { waitUntil: 'networkidle' });
    await ruhig(seite);
    for (const schritt of BEDIENUNG[d] ?? []) { try { await schritt(seite); } catch { /* */ } }
    const links = await seite.evaluate(() => [...document.querySelectorAll('a[href], form[action]')].map((a) => ({
      href: a.href || a.action, gewollt: a.hasAttribute('data-gegenseite') || a.hasAttribute('data-sprachhinweis-link'), text: a.textContent.trim().slice(0, 40),
    })));
    for (const l of links) {
      const u = new URL(l.href);
      if (u.origin !== new URL(basis).origin) { if (!/^https:\/\/github\.com\/fralineel-kiesel\//.test(l.href)) raus.push(`/${enAdresse(d)}: extern ${l.href}`); continue; }
      if (l.gewollt) { if (!u.pathname.startsWith(BASE) || u.pathname.startsWith(BASE + 'en/')) raus.push(`/${enAdresse(d)}: Weg zurück auf Deutsch zeigt auf ${u.pathname}`); continue; }
      if (!u.pathname.startsWith(BASE + 'en/')) raus.push(`/${enAdresse(d)}: „${l.text}“ → ${u.pathname}${u.search}${u.hash}`);
    }
    await seite.close();
  }
  await ctx.close();
  pruefe(`Alle Links auf ${EN_SEITEN.length} englischen Seiten bleiben unter /en/ (auch nach Bedienung; erlaubt: GitHub, Umschalter/Hinweis zurück auf Deutsch)`, raus.length === 0, [...new Set(raus)].slice(0, 40).join('\n    '));
}

console.log('\n── Sprachumschalter ──');
{
  const ctx = await kontext({ sprache: 'de-CH' });
  const kaputt = [];
  for (const [d] of EN_SEITEN) {
    if (d === '404.html') continue;
    const seite = await neueSeite(ctx);
    await seite.goto(basis + d, { waitUntil: 'load' });
    const umschalter = seite.locator('footer [data-sprachwahl] a[data-gegenseite="en"]');
    await umschalter.click();
    await seite.waitForURL((u) => u.pathname.startsWith(BASE + 'en/'));
    const ziel = new URL(seite.url()).pathname;
    if (ziel !== pfad(d, 'en')) kaputt.push(`/${d} → ${ziel} (soll ${pfad(d, 'en')})`);
    if ((await seite.locator('html').getAttribute('lang')) !== 'en-US') kaputt.push(`${ziel}: nicht englisch`);
    await seite.locator('footer [data-sprachwahl] a[data-gegenseite="de"]').click();
    await seite.waitForURL((u) => !u.pathname.startsWith(BASE + 'en/'));
    if (new URL(seite.url()).pathname !== BASE + d) kaputt.push(`zurück von ${ziel} → ${new URL(seite.url()).pathname}`);
    await seite.close();
  }
  pruefe(`Footer: ${EN_SEITEN.length - 1} Seiten → Gegenseite → zurück`, kaputt.length === 0, kaputt.join('\n    '));

  // Burger-Menü (390 px), Parameter und Sprungziel
  const handy = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', locale: 'de-CH', hasTouch: true, isMobile: true });
  const s = await neueSeite(handy);
  await s.goto(basis + 'kaufen/?modell=k1&farbe=matte-black', { waitUntil: 'load' });
  await s.locator('input[name="speicher"][value="1tb"]').check({ force: true });
  await s.locator('[data-mobil-menue-knopf], .burger').first().click();
  await s.locator('[data-mobil-menue] [data-sprachwahl] a[data-gegenseite="en"]').click();
  await s.waitForURL(/\/en\/buy\//);
  const u = new URL(s.url());
  pruefe('Burger-Menü: /kaufen/ mit Wahl → /en/buy/?model=k1&color=matte-black&storage=1tb, Wahl bleibt',
    u.search === '?model=k1&color=matte-black&storage=1tb' && await s.locator('input[name="modell"][value="k1"]').isChecked() && await s.locator('input[name="farbe"][value="matte-black"]').isChecked() && await s.locator('input[name="speicher"][value="1tb"]').isChecked(), u.href);
  await handy.close();
  const f = await neueSeite(ctx);
  await f.goto(basis + 'faq/#notruf', { waitUntil: 'load' });
  await f.locator('footer [data-sprachwahl] a[data-gegenseite="en"]').click();
  await f.waitForURL(/\/en\/faq\//);
  await f.waitForTimeout(200);
  pruefe('Sprungziel: /faq/#notruf → /en/faq/#emergency, die Frage ist offen', new URL(f.url()).hash === '#emergency'
    && (await f.locator('#emergency button[aria-expanded]').getAttribute('aria-expanded')) === 'true', f.url());
  await f.goto(basis + 'en/compare/?phone=pro&vs=mini&view=overlay', { waitUntil: 'load' });
  await f.locator('footer [data-sprachwahl] a[data-gegenseite="de"]').click();
  await f.waitForURL(/\/vergleichen\//);
  pruefe('Parameter zurück: /en/compare/?phone=pro&vs=mini&view=overlay → /vergleichen/?kiesel=pro&gegen=mini&ansicht=overlay', new URL(f.url()).search === '?kiesel=pro&gegen=mini&ansicht=overlay', f.url());
  const nurDe = await neueSeite(ctx);
  await nurDe.goto(basis + 'designsystem/', { waitUntil: 'load' });
  pruefe('Designsystem (nur Deutsch): kein Umschalter', (await nurDe.locator('[data-sprachwahl]').count()) === 0);
  await ctx.close();
}

console.log('\n── Englische Parameter ──');
{
  const ctx = await kontext({ sprache: 'en-US' });
  const s = await neueSeite(ctx);
  await s.goto(basis + 'en/buy/?model=k1&color=pebble-beige&storage=512gb&case=matte-black', { waitUntil: 'load' });
  pruefe('/en/buy/?model=k1&color=pebble-beige&storage=512gb&case=matte-black wählt vor',
    await s.locator('input[name="modell"][value="k1"]').isChecked() && await s.locator('input[name="farbe"][value="pebble-beige"]').isChecked()
    && await s.locator('input[name="speicher"][value="512gb"]').isChecked() && (await s.locator('[data-huelle-schalter]').getAttribute('aria-checked')) === 'true'
    && await s.locator('input[name="huelle-farbe"][value="matte-black"]').isChecked());
  await s.locator('input[name="farbe"][value="sky-blue"]').check({ force: true });
  pruefe('… und schreibt die Adresse mit englischen Namen nach', new URL(s.url()).search === '?model=k1&color=sky-blue&storage=512gb&case=matte-black', s.url());
  pruefe('Preise englisch: CHF 1,200 … CHF 1,459', (await s.locator('[data-total]').textContent()) === 'CHF 1,459' && (await s.locator('.karte-preis').first().textContent()) === 'from CHF 1,200', await s.locator('[data-total]').textContent());
  await s.goto(basis + 'en/buy/?modell=pro&farbe=Himmelblau', { waitUntil: 'load' });
  pruefe('Deutsche Parameter (und alter Farbname) gehen auf Englisch auch; Adresse danach englisch',
    await s.locator('input[name="farbe"][value="sky-blue"]').isChecked() && new URL(s.url()).search.startsWith('?model=pro&color=sky-blue'), s.url());
  await s.goto(basis + 'kaufen/?model=k1&color=matte-white', { waitUntil: 'load' });
  pruefe('Englische Parameter gehen auch auf Deutsch, Adresse danach deutsch', await s.locator('input[name="modell"][value="k1"]').isChecked() && new URL(s.url()).search.startsWith('?modell=k1&farbe=matte-white'), s.url());
  await s.goto(basis + 'en/accessories/case/?model=k1&color=pebble-beige', { waitUntil: 'load' });
  pruefe('/en/accessories/case/?model=k1&color=pebble-beige', (await s.locator('[data-modell-wahl="k1"]').getAttribute('aria-pressed')) === 'true' && await s.locator('input[name="huelle-farbe"][value="pebble-beige"]').isChecked());
  await s.goto(basis + 'en/compare/?phone=pro&vs=mini&card=1', { waitUntil: 'load' });
  pruefe('/en/compare/?phone=pro&vs=mini&card=1', (await s.locator('[data-kiesel="pro"]').getAttribute('aria-pressed')) === 'true' && (await s.locator('[data-gegen="mini"]').getAttribute('aria-pressed')) === 'true' && (await s.locator('[data-karte]').getAttribute('aria-pressed')) === 'true', s.url());
  await ctx.close();
}

console.log('\n── Warenkorb in beiden Sprachen ──');
{
  // geschützte Leerzeichen (Gravur) als normale lesen
  const zeilen = (s) => s.evaluate(() => [...document.querySelectorAll('[data-warenkorb-inhalt][data-art="seite"] [data-wk-liste] li')].map((li) => ['[data-name]', '[data-details]', '[data-preis]'].map((q) => li.querySelector(q).textContent.replace(/\u00a0/g, ' '))));
  const summe = (s) => s.evaluate(() => [...document.querySelectorAll('[data-warenkorb-inhalt][data-art="seite"] dl dt, [data-warenkorb-inhalt][data-art="seite"] dl dd')].map((e) => e.textContent.trim()));
  const ctx = await kontext({ sprache: 'de-CH' });
  const s = await neueSeite(ctx);
  // Auf Deutsch befüllen: über /kaufen/ (Handy + Hülle) und die Hülle auf /zubehoer/huelle/
  await s.goto(basis + 'kaufen/?modell=pro&farbe=titanium-gray&speicher=2tb&huelle=matte-white', { waitUntil: 'load' });
  await s.locator('#gravur').fill('Linos Kiesel');
  await s.locator('[data-in-warenkorb]').click();
  await s.waitForFunction(() => document.querySelector('[data-schublade]')?.open);
  await s.goto(basis + 'zubehoer/huelle/?modell=k1&farbe=pebble-beige', { waitUntil: 'load' });
  await s.locator('[data-huelle-kaufen]').click();
  await s.goto(basis + 'warenkorb/', { waitUntil: 'load' });
  await s.waitForFunction(() => document.querySelectorAll('[data-art="seite"] [data-wk-liste] li').length === 3);
  const zDe = await zeilen(s);
  pruefe('Deutsch befüllt', gleich(zDe, [['Kiesel 1 Pro', 'Titangrau, 2 TB, Gravur «Linos Kiesel»', 'CHF 2’300.–'], ['Kiesel-Hülle', 'für Kiesel 1 Pro, Mattweiss', 'CHF 59.–'], ['Kiesel-Hülle', 'für Kiesel 1, Kieselbeige', 'CHF 59.–']]), JSON.stringify(zDe));
  await s.goto(basis + 'en/bag/', { waitUntil: 'load' });
  await s.waitForFunction(() => document.querySelectorAll('[data-art="seite"] [data-wk-liste] li').length === 3);
  const zEn = await zeilen(s);
  pruefe('… auf Englisch übersetzt: Farben, Hülle, Gravur, Preise', gleich(zEn, [['Kiesel 1 Pro', 'Titanium Gray, 2 TB, engraved “Linos Kiesel”', 'CHF 2,300'], ['Kiesel Case', 'for Kiesel 1 Pro, Matte White', 'CHF 59'], ['Kiesel Case', 'for Kiesel 1, Pebble Beige', 'CHF 59']]), JSON.stringify(zEn));
  const sEn = await summe(s);
  pruefe('… Summen englisch: Subtotal, Shipping free, incl. 8.1% VAT CHF 181.18, Total CHF 2,418', gleich(sEn, ['Subtotal', 'CHF 2,418', 'Shipping', 'free', 'incl. 8.1% VAT', 'CHF 181.18', 'Total', 'CHF 2,418']), JSON.stringify(sEn));
  pruefe('… Zähler oben englisch: „Bag, 3 items“', (await s.locator('[data-warenkorb-knopf]').getAttribute('aria-label')) === 'Bag, 3 items', await s.locator('[data-warenkorb-knopf]').getAttribute('aria-label'));
  // Umgekehrt: auf Englisch dazulegen, auf Deutsch anschauen
  await s.goto(basis + 'en/buy/?model=k1&color=sky-blue&storage=256gb', { waitUntil: 'load' });
  await s.locator('[data-in-warenkorb]').click();
  await s.waitForFunction(() => document.querySelector('[data-schublade]')?.open);
  const schublade = await s.evaluate(() => [...document.querySelectorAll('[data-schublade] [data-wk-liste] li [data-details]')].map((d) => d.textContent));
  pruefe('Englisch dazugelegt, Schublade englisch', schublade.includes('Sky Blue, 256 GB'), JSON.stringify(schublade));
  await s.goto(basis + 'warenkorb/', { waitUntil: 'load' });
  await s.waitForFunction(() => document.querySelectorAll('[data-art="seite"] [data-wk-liste] li').length === 4);
  const zDe2 = await zeilen(s);
  pruefe('… und auf Deutsch übersetzt: „Himmelblau, 256 GB“, CHF 1’200.–', gleich(zDe2.at(-1), ['Kiesel 1', 'Himmelblau, 256 GB', 'CHF 1’200.–']), JSON.stringify(zDe2));
  const gespeichert = await s.evaluate(() => localStorage.getItem('kiesel-warenkorb'));
  pruefe('Gespeichert werden nur Kennungen (keine Farbnamen, keine Preise)', !/Himmelblau|Sky Blue|Titangrau|Titanium Gray|preis/i.test(gespeichert), gespeichert);
  // Kasse auf Englisch
  await s.goto(basis + 'en/bag/', { waitUntil: 'load' });
  await s.locator('[data-art="seite"] [data-zur-kasse]').click();
  await s.waitForFunction(() => document.querySelector('[data-kasse]')?.open);
  const kasse = (await s.locator('[data-kasse]').textContent()).replace(/Linos\s+Kiesel/gu, '');
  pruefe('Kasse englisch (Checkout, Keep dreaming, CHF-Format)', /Checkout/.test(kasse) && /Keep dreaming/.test(kasse) && /CHF 3,618/.test(kasse) && deutscheWoerter(kasse).length === 0, kasse.replace(/\s+/g, ' ').slice(0, 300));
  await ctx.close();
}

console.log('\n── Akku-Rechner im Browser ──');
{
  const ctx = await kontext();
  const s = await neueSeite(ctx);
  const lies = () => s.evaluate(() => [document.querySelector('[data-schlagzeile]').textContent, ...[...document.querySelectorAll('[data-akku]')].flatMap((li) => [li.querySelector('[data-text]').textContent, li.querySelector('[data-tage]').textContent])]);
  const achse = () => s.evaluate(() => [...document.querySelectorAll('[data-diagramm] text.achse')].map((t) => t.textContent));
  const ab = [];
  for (const tag of Object.keys(RECHNER.tage)) {
    await s.goto(basis + 'akku-rechner/', { waitUntil: 'load' });
    await s.locator(`[data-tag="${tag}"]`).click();
    const d = await lies();
    await s.goto(basis + 'en/battery-calculator/', { waitUntil: 'load' });
    await s.locator(`[data-tag="${tag}"]`).click();
    const e = await lies();
    if (!gleich(d.flatMap(zahlenDe), e.flatMap(zahlenEn))) ab.push(`${tag}: ${d.join(' | ')} ≠ ${e.join(' | ')}`);
  }
  pruefe('4 typische Tage: dieselben Zahlen, nur anders geschrieben', ab.length === 0, ab.join('\n    '));
  const a = await achse();
  pruefe('Achse englisch: 100% … 0%, 7 AM … 11 PM', gleich(a, ['100%', '75%', '50%', '25%', '0%', '7 AM', '11 AM', '3 PM', '7 PM', '11 PM']), JSON.stringify(a));
  await s.locator('#sl-surf').focus();
  await s.keyboard.press('End');
  const wert = await s.locator('#sl-surf').getAttribute('aria-valuetext');
  pruefe('Regler sagt englisch „… hours“', /^\d+\.\d hours$/.test(wert), wert);
  await ctx.close();
}

console.log('\n── Sprach-Hinweis ──');
{
  const sichtbar = (s) => s.locator('[data-sprachhinweis]').isVisible();
  // Englischer Browser auf Deutsch
  let ctx = await kontext({ sprache: 'en-US' });
  let s = await neueSeite(ctx);
  await s.goto(basis + 'kaufen/?modell=k1', { waitUntil: 'load' });
  await s.waitForTimeout(100);
  const h = s.locator('[data-sprachhinweis]');
  pruefe('Englischer Browser, deutsche Seite: „Also available in English“ erscheint', await sichtbar(s) && /Also available in English/.test(await h.textContent()));
  pruefe('… mit aria-label, lang="en-US" und Link auf dieselbe Seite (mit Parametern)', (await h.getAttribute('aria-label')) === 'Language note' && (await h.getAttribute('lang')) === 'en-US'
    && await s.locator('[data-sprachhinweis-link]').evaluate((a) => { a.dispatchEvent(new Event('focus')); return new URL(a.href).pathname + new URL(a.href).search; }) === `${BASE}en/buy/?model=k1&color=sky-blue&storage=512gb`);
  // Tastatur: Tab erreicht den Hinweis gleich nach „Zum Inhalt“, Escape schliesst
  await s.keyboard.press('Tab'); await s.keyboard.press('Tab');
  const fokusImHinweis = await s.evaluate(() => !!document.activeElement.closest('[data-sprachhinweis]'));
  await s.keyboard.press('Escape');
  pruefe('Tastatur: Tab erreicht den Hinweis früh, Escape schliesst, Fokus geht zum Inhalt', fokusImHinweis && !(await sichtbar(s)) && await s.evaluate(() => document.activeElement.tagName === 'MAIN'));
  await s.goto(basis + 'faq/', { waitUntil: 'load' });
  await s.waitForTimeout(100);
  pruefe('Nach dem Wegklicken: bleibt weg (auch auf anderen Seiten)', !(await sichtbar(s)) && (await s.evaluate(() => localStorage.getItem('kiesel-sprachhinweis'))) === 'weg');
  await ctx.close();
  // Englischer Browser auf Englisch: kein Hinweis; Knopf schliesst
  ctx = await kontext({ sprache: 'en-GB' });
  s = await neueSeite(ctx);
  await s.goto(basis + 'en/faq/', { waitUntil: 'load' });
  pruefe('Englischer Browser, englische Seite: kein Hinweis', !(await sichtbar(s)));
  await s.goto(basis + 'faq/', { waitUntil: 'load' });
  const breite = await s.locator('[data-sprachhinweis-zu]').evaluate((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height));
  await s.locator('[data-sprachhinweis-zu]').click();
  pruefe('en-GB zählt auch als Englisch; Schliessen-Knopf (mind. 44 × 44 px) schliesst', breite >= 44 && !(await sichtbar(s)), `${breite} px`);
  await ctx.close();
  // Deutscher Browser auf Englisch
  ctx = await kontext({ sprache: 'de-CH' });
  s = await neueSeite(ctx);
  await s.goto(basis + 'en/features/#zen', { waitUntil: 'load' });
  await s.waitForTimeout(100);
  pruefe('Deutscher Browser, englische Seite: „Diese Seite gibt es auch auf Deutsch“, lang="de-CH"', await sichtbar(s) && /Diese Seite gibt es auch auf Deutsch/.test(await s.locator('[data-sprachhinweis]').textContent()) && (await s.locator('[data-sprachhinweis]').getAttribute('lang')) === 'de-CH');
  const link = await s.locator('[data-sprachhinweis-link]').evaluate((a) => { a.dispatchEvent(new Event('focus')); return new URL(a.href).pathname + new URL(a.href).hash; });
  pruefe('… Link auf /funktionen/#zen', link === `${BASE}funktionen/#zen`, link);
  await s.goto(basis + 'faq/', { waitUntil: 'load' });
  pruefe('Deutscher Browser, deutsche Seite: kein Hinweis', !(await sichtbar(s)));
  await ctx.close();
  // Wer die Sprache selbst wählt, bekommt keinen Hinweis mehr
  ctx = await kontext({ sprache: 'en-US' });
  s = await neueSeite(ctx);
  await s.goto(basis + 'en/', { waitUntil: 'load' });
  await s.locator('footer [data-sprachwahl] a[data-gegenseite="de"]').click();
  await s.waitForURL((u) => u.pathname === BASE);
  await s.waitForTimeout(100);
  pruefe('Englischer Browser wählt selbst Deutsch: kein Hinweis (die Wahl zählt, erzwungen wird nichts)', !(await sichtbar(s)) && (await s.locator('html').getAttribute('lang')) === 'de-CH');
  await ctx.close();
  // Andere Sprache: kein Hinweis
  ctx = await kontext({ sprache: 'fr-CH' });
  s = await neueSeite(ctx);
  await s.goto(basis + 'kaufen/', { waitUntil: 'load' });
  await s.goto(basis + 'en/buy/', { waitUntil: 'load' });
  pruefe('Französischer Browser: auf keiner der beiden Sprachen ein Hinweis', !(await sichtbar(s)));
  await ctx.close();
  // Gesperrter Speicher
  const gesperrt = `(() => { const f = () => { throw new DOMException('gesperrt', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { configurable: true, get: f });
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: f }); })()`;
  ctx = await kontext({ sprache: 'en-US', init: [gesperrt] });
  s = await neueSeite(ctx);
  const vorher = skriptfehler.length;
  await s.goto(basis + 'vergleichen/', { waitUntil: 'load' });
  await s.waitForTimeout(100);
  const da = await sichtbar(s);
  await s.locator('[data-sprachhinweis-zu]').click();
  pruefe('localStorage und sessionStorage gesperrt: Hinweis erscheint, lässt sich schliessen, kein Fehler', da && !(await sichtbar(s)) && skriptfehler.length === vorher, skriptfehler.slice(vorher).join(' | '));
  await ctx.close();
  // Kein Layoutsprung: CLS beim Erscheinen
  ctx = await kontext({ sprache: 'en-US' });
  s = await neueSeite(ctx);
  await s.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await s.goto(basis + 'faq/', { waitUntil: 'networkidle' });
  await s.waitForTimeout(300);
  const cls = await s.evaluate(() => window.__cls);
  const fixiert = await s.locator('[data-sprachhinweis]').evaluate((e) => getComputedStyle(e).position);
  pruefe('Kein Layoutsprung: position fixed, CLS beim Laden mit Hinweis ≤ 0.001', fixiert === 'fixed' && cls <= 0.001, `${fixiert}, CLS ${cls}`);
  await ctx.close();
}

console.log('\n── 404 ──');
{
  const ctx = await kontext({ sprache: 'de-CH' });
  const s = await neueSeite(ctx);
  const antwortDe = await s.goto(basis + 'gibt-es-nicht/', { waitUntil: 'networkidle' });
  const h1De = await s.locator('h1').textContent();
  await s.goto(basis + 'en/does-not-exist/', { waitUntil: 'networkidle' });
  await s.waitForFunction(() => document.documentElement.lang === 'en-US', null, { timeout: 5000 }).catch(() => {});
  const h1En = await s.locator('h1').textContent();
  pruefe('Server wie GitHub Pages: fehlende Adresse → 404.html mit Status 404', antwortDe.status() === 404 && h1De === de.fehler404.ueberschrift, `${antwortDe.status()} ${h1De}`);
  pruefe('Unter /en/: dieselbe 404.html erscheint englisch, Adresse bleibt', h1En === en.fehler404.ueberschrift && new URL(s.url()).pathname === `${BASE}en/does-not-exist/`
    && (await s.locator('html').getAttribute('lang')) === 'en-US' && await s.evaluate(() => getComputedStyle(document.documentElement).visibility === 'visible'), `${h1En} ${s.url()}`);
  const links = await s.evaluate(() => [...document.querySelectorAll('main a')].map((a) => new URL(a.href).pathname));
  pruefe('… mit englischen Links (Home, Kiesel 1 Pro)', gleich(links, [`${BASE}en/`, `${BASE}en/kiesel-1-pro/`]), JSON.stringify(links));
  await ctx.close();
}

pruefe('Keine Skriptfehler in allen Browser-Tests', skriptfehler.length === 0, [...new Set(skriptfehler)].join('\n    '));
await browser.close();
await schliessen();
console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Englische Fassung in Ordnung');
process.exit(fehler ? 1 : 0);
