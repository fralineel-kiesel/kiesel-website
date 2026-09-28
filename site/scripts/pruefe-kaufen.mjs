// Prüft Kaufen, Warenkorb, Schublade und Kasse (Etappe 6) im echten Browser:
//
//   npm run pruefe:kaufen
//
// 0. Ohne Browser: Summen von sechs Warenkörben gegen von Hand gerechnete Werte, Preisformat,
//    Gravur-Regeln, Aufräumen kaputter Einträge, keine Preiszahl ausserhalb von data/preise.js.
// 1. Kaufweg mit der Maus: Pro, Mattschwarz, 2 TB, Gravur, Hülle, Schublade, Menge +1, Hülle
//    entfernen, neu laden (Warenkorb bleibt), Kasse, „Weiterträumen“, „Warenkorb leeren“.
// 2. Derselbe Weg nur mit der Tastatur, dazu die Fokus-Regeln der Schublade: Fokus hinein,
//    Tab bleibt drin (vorwärts und rückwärts), Hintergrund inert, Escape, Fokus zurück.
// 3. localStorage gesperrt (einmal nur localStorage, einmal auch sessionStorage), kaputt
//    und mit Unsinn gefüllt: kein Fehler, Warenkorb funktioniert, Kassen-Text passt.
// 4. Randfälle: Adresse (gültig, ungültig, gemischt), Speicher-Rücksprung 2 TB → Kiesel 1 → Pro,
//    Gravur-Fehler am Feld, Zusammenfassen, Obergrenze 9, Hüllen-Vorschlag, Zähler über Tabs
//    und Seitenwechsel, Links mit Modell und Farbe, /warenkorb/, Handy-Breite, weniger Bewegung.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { summen, bereinige } from '../src/scripts/warenkorb.js';
import { chf, chfRappen } from '../src/lib/format.js';
import { pruefeGravur, saubereGravur } from '../src/lib/gravur.js';
import { PREISE, HUELLE_PREIS } from '../src/data/preise.js';

const hier = path.dirname(fileURLToPath(import.meta.url));
let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info && !ok ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

// ====================================================================== 0. ohne Browser
console.log('\n── Summen, von Hand nachgerechnet ──');
// Jede Zeile: Warenkorb, erwartetes Total und MwSt. Die Erwartung ist NICHT mit dem Code
// gerechnet, sondern von Hand (und mit Pythons Decimal gegengeprüft):
//   MwSt. = Total × 8.1 / 108.1, auf den Rappen gerundet
const H = (modell, farbe, speicher, anzahl = 1, gravur) => ({ art: 'handy', modell, farbe, speicher, anzahl, ...(gravur ? { gravur } : {}) });
const U = (modell, farbe, anzahl = 1) => ({ art: 'huelle', modell, farbe, anzahl });
export const HANDRECHNUNG = [
  { name: 'A: Artboard (Pro 512 GB + Hülle)', korb: [H('pro', 'Himmelblau', '512gb', 1, 'Linos Kiesel'), U('pro', 'Mattweiss')],
    total: 'CHF 1’759.–', mwst: 'CHF 131.80', rechnung: '1’700 + 59 = 1’759;  1’759 × 8.1 / 108.1 = 131.8029… → 131.80' },
  { name: 'B: Kaufweg (Pro 2 TB + Hülle)', korb: [H('pro', 'Mattschwarz', '2tb', 1, 'Linos Kiesel'), U('pro', 'Titangrau')],
    total: 'CHF 2’359.–', mwst: 'CHF 176.76', rechnung: '2’300 + 59 = 2’359;  2’359 × 8.1 / 108.1 = 176.7613… → 176.76' },
  { name: 'C: 2 × Pro 2 TB', korb: [H('pro', 'Mattschwarz', '2tb', 2, 'Linos Kiesel')],
    total: 'CHF 4’600.–', mwst: 'CHF 344.68', rechnung: '2 × 2’300 = 4’600;  4’600 × 8.1 / 108.1 = 344.6808… → 344.68' },
  { name: 'D: gemischt', korb: [H('k1', 'Kieselbeige', '256gb', 3), H('k1', 'Mattweiss', '1tb', 1, 'Für Mama'), U('k1', 'Kieselbeige', 2), H('pro', 'Titangrau', '512gb')],
    total: 'CHF 7’018.–', mwst: 'CHF 525.86', rechnung: '3 × 1’200 + 1’600 + 2 × 59 + 1’700 = 3’600 + 1’600 + 118 + 1’700 = 7’018;  7’018 × 8.1 / 108.1 = 525.8630… → 525.86' },
  { name: 'E: je 9 (Obergrenze)', korb: [H('pro', 'Himmelblau', '2tb', 9), U('pro', 'Himmelblau', 9)],
    total: 'CHF 21’231.–', mwst: 'CHF 1’590.85', rechnung: '9 × 2’300 + 9 × 59 = 20’700 + 531 = 21’231;  21’231 × 8.1 / 108.1 = 1’590.8519… → 1’590.85' },
  { name: 'F: nur eine Hülle', korb: [U('k1', 'Mattschwarz')],
    total: 'CHF 59.–', mwst: 'CHF 4.42', rechnung: '59;  59 × 8.1 / 108.1 = 4.4209… → 4.42' },
];
for (const f of HANDRECHNUNG) {
  const s = summen(f.korb.map(bereinige));
  const ok = chfRappen(s.total) === f.total && chfRappen(s.zwischensumme) === f.total && chfRappen(s.mwst) === f.mwst && s.versand === 0;
  pruefe(`${f.name}: ${f.total}, davon MwSt. ${f.mwst}`, ok, `${chfRappen(s.total)} / ${chfRappen(s.mwst)}`);
}

console.log('\n── Preisformat ──');
for (const [ein, aus] of [[1759, 'CHF 1’759.–'], [59, 'CHF 59.–'], [131.8, 'CHF 131.80'], [1234.5, 'CHF 1’234.50'], [0.05, 'CHF 0.05'], [21231, 'CHF 21’231.–'], [1234567, 'CHF 1’234’567.–'], [0.1 + 0.2, 'CHF 0.30']]) {
  pruefe(`chf(${ein}) = ${aus}`, chf(ein) === aus, chf(ein));
}

console.log('\n── Gravur-Regeln ──');
for (const [text, gut] of [['Linos Kiesel', true], ['Ça va, Zoë & Élo!', true], ["Rock'n’Roll +1 ?", true], ['Łódź Straße', true], ['été', true], ['123456789012345678', true],
  ['Hallo @Welt', false], ['Herz ❤', false], ['Smiley 😀', false], ['1234567890123456789', false], ['Привет', false], ['a<b>', false], ['Tab\tTab', false]]) {
  const r = pruefeGravur(text);
  pruefe(`„${text.replace('\t', '\\t')}“ ${gut ? 'geht' : 'geht nicht'}`, !r.fehler === gut, r.fehler ?? `${r.laenge} Zeichen`);
}
pruefe('„é“ als e + Akzent zählt als 1 Zeichen', pruefeGravur('é').laenge === 1);
pruefe('Fehlertext nennt das Zeichen: «@»', pruefeGravur('a@b').fehler.startsWith('«@» geht nicht'), pruefeGravur('a@b').fehler);
pruefe('19 Zeichen: „1 zu viel“', pruefeGravur('x'.repeat(19)).fehler.includes('das ist 1 zu viel'), pruefeGravur('x'.repeat(19)).fehler);
pruefe('Aufräumen: Rand-Leerzeichen weg, doppelte zu einem', saubereGravur('  Linos   Kiesel ') === 'Linos Kiesel');

console.log('\n── Einträge aufräumen ──');
pruefe('Unbekannte Farbe fällt weg', bereinige(H('pro', 'Lila', '2tb')) === null);
pruefe('Kiesel 1 mit 2 TB fällt weg', bereinige(H('k1', 'Mattweiss', '2tb')) === null);
pruefe('Farbe in Kleinbuchstaben wird korrigiert', bereinige(H('pro', 'mattschwarz', '2tb'))?.farbe === 'Mattschwarz');
pruefe('Anzahl 42 → 9, 0 → 1, „abc“ → 1', bereinige(U('pro', 'Titangrau', 42)).anzahl === 9 && bereinige(U('pro', 'Titangrau', 0)).anzahl === 1 && bereinige(U('pro', 'Titangrau', 'abc')).anzahl === 1);
pruefe('Gravur mit <img …> fällt weg (nie als HTML)', bereinige(H('pro', 'Himmelblau', '512gb', 1, '<img src=x onerror=alert(1)>')) === null);
const alt = bereinige({ id: 'huelle-k1-mattweiss', art: 'huelle', name: 'Kiesel-Hülle', modell: 'k1', farbe: 'Mattweiss', preis: 1, anzahl: 1 });
pruefe('Altes Format aus Etappe 5 wird übernommen, sein Preis ignoriert', alt?.art === 'huelle' && summen([alt]).total === HUELLE_PREIS * 100);

console.log('\n── Preise nur in data/preise.js ──');
{
  // Preiszahlen aus preise.js, als Zahl (in einer Zeile mit „preis“/„chf“) oder formatiert
  const zahlen = [...new Set([...Object.values(PREISE).flatMap((m) => m.speicher.map((s) => s.preis)), HUELLE_PREIS])];
  const formatiert = zahlen.map((n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '[’\']?'));
  const muster = [
    new RegExp(`CHF\\s*(${formatiert.join('|')})\\b`),
    new RegExp(`\\b(${formatiert.join('|')})\\.[–-]`),
  ];
  const zeileMitPreis = /preis|price|chf|franken|kosten/i;
  const treffer = [];
  const dateien = [];
  (function sammle(ordner) {
    for (const e of fs.readdirSync(ordner, { withFileTypes: true })) {
      const p = path.join(ordner, e.name);
      if (e.isDirectory()) sammle(p);
      else if (/\.(js|mjs|astro|css)$/.test(e.name)) dateien.push(p);
    }
  })(path.join(hier, '..', 'src'));
  for (const datei of dateien) {
    if (datei.endsWith(path.join('data', 'preise.js'))) continue;
    fs.readFileSync(datei, 'utf8').split('\n').forEach((zeile, i) => {
      const code = zeile.replace(/\/\/.*$/, ''); // Kommentare dürfen Beispiele zeigen
      const roh = zahlen.some((n) => new RegExp(`\\b${n}\\b`).test(code)) && zeileMitPreis.test(code);
      if (roh || muster.some((m) => m.test(code))) treffer.push(`${path.relative(path.join(hier, '..'), datei)}:${i + 1}: ${zeile.trim().slice(0, 90)}`);
    });
  }
  pruefe(`Keine Preiszahl ausserhalb von data/preise.js (${dateien.length} Dateien durchsucht)`, treffer.length === 0, treffer.join('\n    '));
}

// ====================================================================== Browser
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();

async function oeffne(adresse, kontext = {}, { initSkript } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ...kontext });
  if (initSkript) await ctx.addInitScript(initSkript);
  const seite = await ctx.newPage();
  const status = { fehler: [] };
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  seite.on('console', (m) => { if (m.type() === 'error') status.fehler.push(m.text()); });
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  await seite.evaluate(() => document.fonts.ready);
  return { seite, ctx, status };
}
const speicher = (seite) => seite.evaluate(() => JSON.parse(localStorage.getItem('kiesel-warenkorb') || '[]'));
const zaehler = (seite) => seite.evaluate(() => { const z = document.querySelector('[data-warenkorb-zahl]'); return z.hidden ? '' : z.textContent.trim(); });
const total = (seite) => seite.locator('[data-kaufen] [data-total]').textContent();
const fokus = (seite) => seite.evaluate(() => {
  const a = document.activeElement;
  return { tag: a.tagName, text: (a.getAttribute('aria-label') || a.textContent || a.value || '').trim().replace(/\s+/g, ' ').slice(0, 60), zeile: a.closest('li')?.dataset.id ?? '', inSchublade: !!a.closest('[data-schublade]'), inKasse: !!a.closest('[data-kasse]'), daten: Object.keys(a.dataset).join(',') };
});
// Das Ereignis „close“ eines <dialog> kommt erst im nächsten Task (so will es die HTML-Spezifikation),
// der Fokus springt also einen Moment später. Darum kurz warten, bis er angekommen ist.
async function fokusNach(seite, text) {
  await seite.waitForFunction((t) => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent || '').trim() === t, text, { timeout: 2000 }).catch(() => {});
  return fokus(seite);
}
const schubladeOffen = (seite) => seite.evaluate(() => document.querySelector('[data-schublade]').open);
const kasseOffen = (seite) => seite.evaluate(() => document.querySelector('[data-kasse]').open);
const zeilen = (seite, wo = '[data-schublade]') => seite.evaluate((wo) => [...document.querySelectorAll(`${wo} [data-wk-liste] li`)].map((li) => ({
  name: li.querySelector('[data-name]').textContent, details: li.querySelector('[data-details]').textContent, anzahl: li.querySelector('[data-zahl]').textContent, preis: li.querySelector('[data-preis]').textContent,
})), wo);
const summenText = (seite, wo = '[data-schublade]') => seite.evaluate((wo) => Object.fromEntries([...document.querySelectorAll(`${wo} [data-summe]`)].map((d) => [d.dataset.summe, d.textContent])), wo);
const handySvg = (seite) => seite.evaluate(() => {
  const svg = document.querySelector('[data-kaufen-handy] svg');
  return { label: svg.getAttribute('aria-label'), gravur: svg.querySelector('[data-gravur] text:last-child')?.textContent ?? null, modell: svg.closest('[data-modell]').dataset.modell };
});

try {
  // ==================================================================== 1. Maus
  console.log('\n── Kaufweg mit der Maus ──');
  {
    const { seite, ctx, status } = await oeffne('kaufen/');
    const gewaehlt = (name) => seite.locator(`input[name="${name}"]:checked`).getAttribute('value');
    pruefe('Start: Pro, Himmelblau, 512 GB, ohne Hülle, CHF 1’700.–',
      (await gewaehlt('modell')) === 'pro' && (await gewaehlt('farbe')) === 'Himmelblau' && (await gewaehlt('speicher')) === '512gb'
      && (await seite.locator('[data-huelle-schalter]').getAttribute('aria-checked')) === 'false' && (await total(seite)) === 'CHF 1’700.–', await total(seite));

    await seite.locator('label[title="Mattschwarz"]').first().click();
    await seite.locator('label.karte:has(input[value="2tb"])').click();
    pruefe('Mattschwarz + 2 TB: CHF 2’300.–, Handy in Mattschwarz', (await total(seite)) === 'CHF 2’300.–' && (await handySvg(seite)).label.includes('Mattschwarz'), await total(seite));

    await seite.locator('#gravur').fill('Linos Kiesel');
    pruefe('Gravur erscheint auf der Rückseite (SVG)', (await handySvg(seite)).gravur === 'Linos Kiesel', JSON.stringify(await handySvg(seite)));
    pruefe('Zähler „12 von 18 Zeichen“', (await seite.locator('[data-gravur-zaehler]').textContent()) === '12 von 18 Zeichen');

    await seite.locator('[data-huelle-schalter]').click();
    await seite.locator('[data-huelle-farben] label[title="Titangrau"]').click();
    const bild = await handySvg(seite);
    pruefe('Hülle an, Titangrau: CHF 2’359.–, Handy mit Hülle', (await total(seite)) === 'CHF 2’359.–' && bild.label.includes('mit Hülle in Titangrau'), `${await total(seite)} ${bild.label}`);
    pruefe('Zusammenfassung', (await seite.locator('[data-zusammenfassung]').textContent()) === 'Kiesel 1 Pro, Mattschwarz, 2 TB, mit Hülle, mit Gravur');
    pruefe('Adresse nachgeführt (ohne Gravur)', new URL(seite.url()).search === '?modell=pro&farbe=Mattschwarz&speicher=2tb&huelle=Titangrau', seite.url());

    await seite.locator('[data-in-warenkorb]').click();
    await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
    let z = await zeilen(seite);
    pruefe('Schublade offen, Fokus in der Schublade', (await fokus(seite)).inSchublade, JSON.stringify(await fokus(seite)));
    pruefe('Zwei Zeilen: Pro mit Gravur, Hülle Titangrau', z.length === 2 && z[0].details === 'Mattschwarz, 2 TB, Gravur «Linos Kiesel»' && z[1].details === 'für Kiesel 1 Pro, Titangrau', JSON.stringify(z));
    pruefe('Zähler oben: 2', (await zaehler(seite)) === '2');
    let s = await summenText(seite);
    pruefe('Summen (Warenkorb B): 2’359.–, kostenlos, MwSt. 176.76', s.zwischensumme === 'CHF 2’359.–' && s.versand === 'kostenlos' && s.mwst === 'CHF 176.76' && s.total === 'CHF 2’359.–', JSON.stringify(s));
    pruefe('Kein Hüllen-Vorschlag (Hülle liegt drin)', await seite.locator('[data-schublade] [data-wk-vorschlag]').isHidden());

    await seite.locator('[data-schublade] li').first().locator('[data-plus]').click();
    z = await zeilen(seite);
    s = await summenText(seite);
    pruefe('Menge +1: 2 × Pro = CHF 4’600.–, Total 4’659.–, MwSt. 349.10', z[0].anzahl === '2' && z[0].preis === 'CHF 4’600.–' && s.total === 'CHF 4’659.–' && s.mwst === 'CHF 349.10' && (await zaehler(seite)) === '3', JSON.stringify([z[0], s]));

    await seite.locator('[data-schublade] li').nth(1).locator('[data-entfernen]').click();
    z = await zeilen(seite);
    s = await summenText(seite);
    pruefe('Hülle entfernt: 1 Zeile, Summen C (4’600.– / 344.68)', z.length === 1 && s.total === 'CHF 4’600.–' && s.mwst === 'CHF 344.68', JSON.stringify(s));
    pruefe('Fokus nach „Entfernen“: auf der verbleibenden Zeile', (await fokus(seite)).text === 'Kiesel 1 Pro', JSON.stringify(await fokus(seite)));
    pruefe('Hüllen-Vorschlag erscheint (Handy ohne Hülle)', await seite.locator('[data-schublade] [data-wk-vorschlag]').isVisible());

    await seite.reload({ waitUntil: 'load' });
    pruefe('Neu geladen: Zähler 2, Speicher unverändert', (await zaehler(seite)) === '2' && (await speicher(seite)).length === 1);
    pruefe('Neu geladen: Auswahl aus der Adresse wieder da', (await gewaehlt('speicher')) === '2tb' && (await gewaehlt('farbe')) === 'Mattschwarz' && (await total(seite)) === 'CHF 2’359.–', await total(seite));

    await seite.locator('button[data-warenkorb-knopf]').click();
    await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
    await seite.locator('[data-schublade] [data-zur-kasse]').click();
    await seite.waitForFunction(() => document.querySelector('[data-kasse]').open);
    const kasse = await seite.evaluate(() => {
      const d = document.querySelector('[data-kasse]');
      return { text: d.innerText, fokus: document.activeElement.textContent.trim(), total: d.querySelector('[data-kasse-total]').textContent, zeilen: d.querySelectorAll('[data-kasse-liste] li').length };
    });
    pruefe('Kasse: Übersicht (1 Zeile, CHF 4’600.–), Cupertino-Satz, Fokus auf „Weiterträumen“',
      kasse.zeilen === 1 && kasse.total === 'CHF 4’600.–' && kasse.text.includes('Kiesel gibt es nur in unseren Köpfen') && kasse.text.includes('bleibt aber gespeichert, falls Cupertino') && kasse.fokus === 'Weiterträumen', JSON.stringify(kasse));
    pruefe('Kasse über der Schublade (beide offen)', (await schubladeOffen(seite)) && (await kasseOffen(seite)));
    await seite.getByRole('button', { name: 'Weiterträumen' }).click();
    await fokusNach(seite, 'Zur Kasse');
    pruefe('„Weiterträumen“: Kasse zu, Warenkorb bleibt, Fokus zurück auf „Zur Kasse“', !(await kasseOffen(seite)) && (await speicher(seite)).length === 1 && (await fokus(seite)).daten.includes('zurKasse'), JSON.stringify(await fokus(seite)));
    await seite.locator('[data-schublade] [data-zur-kasse]').click();
    await seite.getByRole('button', { name: 'Warenkorb leeren' }).click();
    const fl = await fokusNach(seite, 'Kiesel zusammenstellen');
    pruefe('„Warenkorb leeren“: leer, Zähler weg, Fokus auf „Kiesel zusammenstellen“', (await speicher(seite)).length === 0 && (await zaehler(seite)) === '' && fl.text === 'Kiesel zusammenstellen', JSON.stringify(fl));
    pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }

  // ==================================================================== 2. Tastatur
  console.log('\n── Kaufweg nur mit der Tastatur ──');
  {
    const { seite, ctx, status } = await oeffne('kaufen/');
    const k = seite.keyboard;
    // Tab drücken, bis das fokussierte Element passt (höchstens 80×). So prüfen wir auch,
    // dass alles in einer sinnvollen Reihenfolge erreichbar ist.
    async function tabBis(pruefer, rueckwaerts = false) {
      for (let i = 0; i < 80; i++) {
        await k.press(rueckwaerts ? 'Shift+Tab' : 'Tab');
        if (await seite.evaluate(pruefer)) return true;
      }
      return false;
    }
    pruefe('Tab erreicht die Modellwahl', await tabBis(() => document.activeElement.name === 'modell'));
    await k.press('ArrowLeft');
    await k.press('ArrowRight');
    pruefe('Pfeiltasten: Kiesel 1 und zurück zum Pro', (await seite.locator('input[name="modell"]:checked').getAttribute('value')) === 'pro');
    pruefe('Tab → Farbe (Himmelblau), → rechts = Mattschwarz', await tabBis(() => document.activeElement.name === 'farbe'));
    await k.press('ArrowRight');
    pruefe('Farbe Mattschwarz', (await seite.locator('input[name="farbe"]:checked').getAttribute('value')) === 'Mattschwarz');
    await tabBis(() => document.activeElement.name === 'speicher');
    await k.press('ArrowRight');
    await k.press('ArrowRight');
    pruefe('Speicher per Pfeiltasten: 2 TB', (await seite.locator('input[name="speicher"]:checked').getAttribute('value')) === '2tb');
    await tabBis(() => document.activeElement.matches('[data-huelle-schalter]'));
    await k.press('Space');
    await tabBis(() => document.activeElement.name === 'huelle-farbe');
    await k.press('ArrowLeft');
    pruefe('Hülle per Leertaste an, Farbe per Pfeiltaste: Titangrau', (await seite.locator('[data-huelle-schalter]').getAttribute('aria-checked')) === 'true' && (await seite.locator('input[name="huelle-farbe"]:checked').getAttribute('value')) === 'Titangrau');
    await tabBis(() => document.activeElement.id === 'gravur');
    await k.type('Linos Kiesel');
    pruefe('Gravur getippt, Preis CHF 2’359.–', (await handySvg(seite)).gravur === 'Linos Kiesel' && (await total(seite)) === 'CHF 2’359.–');
    await k.press('Enter'); // Enter im Textfeld schickt das Formular ab = „In den Warenkorb“
    await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
    const f0 = await fokus(seite);
    pruefe('Enter: in den Warenkorb, Schublade offen, Fokus auf „Warenkorb schliessen“', f0.inSchublade && f0.text === 'Warenkorb schliessen', JSON.stringify(f0));
    const rolle = await seite.evaluate(() => { const d = document.querySelector('[data-schublade]'); return [d.getAttribute('role'), d.getAttribute('aria-modal'), document.getElementById(d.getAttribute('aria-labelledby')).textContent]; });
    pruefe('role="dialog", aria-modal="true", Name „Warenkorb“', rolle.join('|') === 'dialog|true|Warenkorb', rolle.join('|'));
    pruefe('Screenreader sieht genau einen modalen Dialog „Warenkorb“', (await seite.getByRole('dialog', { name: 'Warenkorb' }).count()) === 1);

    // Tab-Kreisel: 40 × vorwärts, 40 × rückwärts, nie ausserhalb
    let draussen = 0;
    const gesehen = new Set();
    for (let i = 0; i < 40; i++) { await k.press('Tab'); const f = await fokus(seite); if (!f.inSchublade) draussen++; gesehen.add(f.text + f.zeile); }
    for (let i = 0; i < 40; i++) { await k.press('Shift+Tab'); if (!(await fokus(seite)).inSchublade) draussen++; }
    // 9 Ziele: Schliessen, je Zeile −/+/Entfernen, Weiter einkaufen, Zur Kasse
    pruefe(`Tab bleibt in der Schublade (80 Schritte, ${gesehen.size} verschiedene Ziele)`, draussen === 0 && gesehen.size === 9, `${draussen} draussen, ${[...gesehen].join(' / ')}`);
    const inert = await seite.evaluate(() => {
      const ziel = document.querySelector('header a');
      ziel.focus();
      return { fokusGeht: document.activeElement === ziel, bodyInert: !document.querySelector('main').checkVisibility || document.querySelector('[data-schublade]').matches(':modal') };
    });
    pruefe('Hintergrund inert: Link in der Kopfzeile lässt sich nicht fokussieren', !inert.fokusGeht && inert.bodyInert, JSON.stringify(inert));
    const klickDurch = await seite.evaluate(() => document.elementFromPoint(200, 400)?.closest('dialog') !== null);
    pruefe('Klick in die Seite trifft den Schleier, nicht die Seite', klickDurch);

    await seite.locator('[data-schublade] li').first().locator('[data-plus]').focus();
    await k.press('Enter');
    let f = await fokus(seite);
    pruefe('„Eins mehr“ mit Enter: Menge 2, Fokus bleibt auf dem Knopf', (await zeilen(seite))[0].anzahl === '2' && f.daten.includes('plus'), JSON.stringify(f));
    // von „+“ der ersten Zeile per Tab zu „Entfernen“ der zweiten (Hülle)
    await tabBis(() => document.activeElement.matches('[data-entfernen]') && document.activeElement.closest('li').dataset.id.startsWith('huelle'));
    await k.press('Enter');
    f = await fokus(seite);
    pruefe('Hülle mit Enter entfernt, Fokus auf der verbleibenden Zeile', (await zeilen(seite)).length === 1 && f.text === 'Kiesel 1 Pro', JSON.stringify(f));
    await k.press('Escape');
    f = await fokusNach(seite, 'In den Warenkorb');
    pruefe('Escape schliesst, Fokus zurück auf „In den Warenkorb“', !(await schubladeOffen(seite)) && f.daten.includes('inWarenkorb'), JSON.stringify(f));
    pruefe('Seite dahinter nicht mehr gesperrt', await seite.evaluate(() => document.documentElement.style.overflow === ''));

    await seite.reload({ waitUntil: 'load' });
    pruefe('Neu geladen: Warenkorb noch da (2 Stück)', (await zaehler(seite)) === '2');
    await seite.evaluate(() => document.activeElement.blur());
    pruefe('Tab von oben erreicht den Warenkorb-Knopf', await tabBis(() => document.activeElement.matches('[data-warenkorb-knopf]')));
    await k.press('Enter');
    await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
    pruefe('aria-expanded am Warenkorb-Knopf = true', (await seite.locator('button[data-warenkorb-knopf]').getAttribute('aria-expanded')) === 'true');
    await tabBis(() => document.activeElement.matches('[data-zur-kasse]'));
    await k.press('Enter');
    await seite.waitForFunction(() => document.querySelector('[data-kasse]').open);
    f = await fokus(seite);
    pruefe('Kasse mit Enter: Fokus auf „Weiterträumen“', f.inKasse && f.text === 'Weiterträumen', JSON.stringify(f));
    let raus = 0;
    for (let i = 0; i < 6; i++) { await k.press('Tab'); if (!(await fokus(seite)).inKasse) raus++; }
    pruefe('Tab bleibt in der Kasse', raus === 0);
    await k.press('Escape');
    f = await fokusNach(seite, 'Zur Kasse');
    pruefe('Escape schliesst nur die Kasse, Fokus zurück auf „Zur Kasse“', !(await kasseOffen(seite)) && (await schubladeOffen(seite)) && f.daten.includes('zurKasse'), JSON.stringify(f));
    await k.press('Enter');
    await seite.waitForFunction(() => document.querySelector('[data-kasse]').open);
    await tabBis(() => document.activeElement.matches('[data-kasse-leeren]'));
    await k.press('Enter');
    f = await fokusNach(seite, 'Kiesel zusammenstellen');
    pruefe('„Warenkorb leeren“ mit Enter: leer, Fokus auf „Kiesel zusammenstellen“', (await zaehler(seite)) === '' && f.text === 'Kiesel zusammenstellen' && f.inSchublade, JSON.stringify(f));
    await k.press('Escape');
    await seite.waitForFunction(() => document.activeElement.matches('[data-warenkorb-knopf]') && document.activeElement.getAttribute('aria-expanded') === 'false', null, { timeout: 2000 }).catch(() => {});
    f = await fokus(seite);
    pruefe('Escape: Schublade zu, Fokus zurück auf den Warenkorb-Knopf, aria-expanded = false',
      !(await schubladeOffen(seite)) && f.daten.includes('warenkorbKnopf') && (await seite.locator('button[data-warenkorb-knopf]').getAttribute('aria-expanded')) === 'false', JSON.stringify(f));
    pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }

  // ==================================================================== 3. gesperrt/kaputt
  console.log('\n── localStorage gesperrt oder kaputt ──');
  const sperre = (auchSession) => `(() => {
    const fehler = () => { throw new DOMException('Der Zugriff ist gesperrt.', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { configurable: true, get: fehler });
    ${auchSession ? "Object.defineProperty(window, 'sessionStorage', { configurable: true, get: fehler });" : ''}
  })()`;
  for (const [titel, auchSession, erwartet] of [['nur localStorage gesperrt', false, 'solange dieser Tab offen ist'], ['localStorage und sessionStorage gesperrt', true, 'bis du diese Seite verlässt']]) {
    const { seite, ctx, status } = await oeffne('kaufen/?modell=pro&farbe=Mattschwarz&speicher=2tb&huelle=Titangrau', {}, { initSkript: sperre(auchSession) });
    pruefe(`${titel}: Seite lädt ohne Fehler`, status.fehler.length === 0, status.fehler.join(' | '));
    await seite.locator('#gravur').fill('Linos Kiesel');
    await seite.locator('[data-in-warenkorb]').click();
    await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
    await seite.locator('[data-schublade] li').first().locator('[data-plus]').click();
    const s = await summenText(seite);
    pruefe(`${titel}: Warenkorb funktioniert (2 × Pro + Hülle = CHF 4’659.–, Zähler 3)`, s.total === 'CHF 4’659.–' && (await zaehler(seite)) === '3', JSON.stringify(s));
    await seite.locator('[data-schublade] [data-zur-kasse]').click();
    const text = await seite.locator('[data-kasse-speicher]').textContent();
    pruefe(`${titel}: Kassen-Text ehrlich („${erwartet}“), keine Fehlermeldung`, text.includes(erwartet) && !/fehler|nicht speichern/i.test(await seite.locator('body').innerText()), text);
    await seite.getByRole('button', { name: 'Weiterträumen' }).click();
    await seite.reload({ waitUntil: 'load' });
    pruefe(auchSession ? `${titel}: nach Neuladen leer (nur für diese Seite gemerkt, wie beschrieben)` : `${titel}: nach Neuladen noch da (sessionStorage)`,
      (await zaehler(seite)) === (auchSession ? '' : '3'), await zaehler(seite));
    // Seitenwechsel im selben Tab
    await seite.goto(basis + 'faq/', { waitUntil: 'load' });
    pruefe(`${titel}: Zähler nach Seitenwechsel`, (await zaehler(seite)) === (auchSession ? '' : '3'), await zaehler(seite));
    pruefe(`${titel}: nie ein Skriptfehler`, status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('warenkorb/', {}, { initSkript: "try { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('kiesel-warenkorb', '{kaputt'); } } catch {}" });
    pruefe('Kaputtes JSON: leerer Warenkorb, kein Fehler', (await zaehler(seite)) === '' && (await seite.locator('main [data-wk-leer]').isVisible()) && status.fehler.length === 0, status.fehler.join(' | '));
    await seite.evaluate(() => localStorage.setItem('kiesel-warenkorb', JSON.stringify([
      { art: 'handy', modell: 'pro', farbe: 'Lila', speicher: '2tb' },
      { art: 'handy', modell: 'k1', farbe: 'Mattweiss', speicher: '2tb' },
      { art: 'huelle', modell: 'pro', farbe: 'Titangrau', anzahl: 42 },
      { art: 'huelle', modell: 'pro', farbe: 'titangrau', anzahl: 3 },
      { art: 'handy', modell: 'pro', farbe: 'Himmelblau', speicher: '512gb', gravur: '<img src=x onerror="window.boese=1">' },
      'Unsinn', null, 17, { art: 'rakete' },
      { id: 'huelle-k1-mattweiss', art: 'huelle', name: 'Kiesel-Hülle', modell: 'k1', farbe: 'Mattweiss', preis: 1, anzahl: 1 },
    ])));
    await seite.reload({ waitUntil: 'load' });
    const z = await zeilen(seite, 'main');
    const s = await summenText(seite, 'main');
    pruefe('Unsinn aufgeräumt: 9 × Pro-Hülle Titangrau (42 → 9), alte k1-Hülle zu CHF 59.– statt 1.–', z.length === 2 && z[0].anzahl === '9' && z[1].preis === 'CHF 59.–' && s.total === 'CHF 590.–' && (await zaehler(seite)) === '10', JSON.stringify([z, s]));
    pruefe('Keine Gravur wird zu HTML', !(await seite.evaluate(() => window.boese)) && status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }

  // ==================================================================== 4. Randfälle
  console.log('\n── Adresse ──');
  for (const [adresse, erwartung, titel] of [
    ['kaufen/?modell=k1&farbe=KIESELBEIGE&speicher=1TB&huelle=mattschwarz', ['k1', 'Kieselbeige', '1tb', 'true', 'CHF 1’659.–'], 'gültig (Gross/Klein egal, „1TB“)'],
    ['kaufen/?modell=k1&farbe=Himmelblau&speicher=2tb&huelle=Lila', ['k1', 'Himmelblau', '512gb', 'false', 'CHF 1’400.–'], 'Kiesel 1 mit 2 TB, Hülle „Lila“ → ignoriert'],
    ['kaufen/?modell=xyz&farbe=%3Cscript%3Ealert(1)%3C/script%3E&speicher=-5&huelle=', ['pro', 'Himmelblau', '512gb', 'false', 'CHF 1’700.–'], 'Unsinn → Vorgabe'],
    ['kaufen/?speicher=256', ['pro', 'Himmelblau', '256gb', 'false', 'CHF 1’500.–'], 'nur Speicher „256“'],
  ]) {
    const { seite, ctx, status } = await oeffne(adresse);
    const ist = [
      await seite.locator('input[name="modell"]:checked').getAttribute('value'),
      await seite.locator('input[name="farbe"]:checked').getAttribute('value'),
      await seite.locator('input[name="speicher"]:checked').getAttribute('value'),
      await seite.locator('[data-huelle-schalter]').getAttribute('aria-checked'),
      await total(seite),
    ];
    pruefe(`Adresse ${titel}`, ist.join('|') === erwartung.join('|') && status.fehler.length === 0, `${ist.join('|')} ${status.fehler.join(' | ')}`);
    await ctx.close();
  }

  console.log('\n── Speicher-Rücksprung ──');
  {
    const { seite, ctx } = await oeffne('kaufen/?modell=pro&speicher=2tb');
    await seite.locator('label.karte:has(input[value="k1"])').click();
    const nachK1 = [await seite.locator('input[name="speicher"]:checked').getAttribute('value'), await seite.locator('input[name="speicher"]').count(), await seite.locator('[data-speicher-hinweis]').textContent(), await total(seite)];
    pruefe('Pro 2 TB → Kiesel 1: 1 TB gewählt, 3 Stufen, Hinweis, CHF 1’600.–', nachK1[0] === '1tb' && nachK1[1] === 3 && nachK1[2].includes('2 TB gibt es nur beim Kiesel 1 Pro') && nachK1[3] === 'CHF 1’600.–', nachK1.join(' | '));
    await seite.locator('label.karte:has(input[value="pro"])').click();
    pruefe('Zurück zum Pro: wieder 2 TB (gemerkter Wunsch)', (await seite.locator('input[name="speicher"]:checked').getAttribute('value')) === '2tb' && (await total(seite)) === 'CHF 2’300.–');
    await seite.locator('label.karte:has(input[value="k1"])').click();
    await seite.locator('label.karte:has(input[value="512gb"])').click();
    await seite.locator('label.karte:has(input[value="pro"])').click();
    pruefe('Selbst 512 GB gewählt, dann Pro: bleibt 512 GB', (await seite.locator('input[name="speicher"]:checked').getAttribute('value')) === '512gb' && (await seite.locator('[data-speicher-hinweis]').textContent()) === '');
    await ctx.close();
  }

  console.log('\n── Gravur am Feld ──');
  {
    const { seite, ctx } = await oeffne('kaufen/');
    const feld = seite.locator('#gravur');
    const zustand = () => seite.evaluate(() => {
      const f = document.getElementById('gravur');
      return { invalid: f.getAttribute('aria-invalid'), beschrieben: f.getAttribute('aria-describedby'), fehler: document.getElementById('gravur-fehler').textContent, wert: f.value, live: document.getElementById('gravur-fehler').getAttribute('aria-live') };
    });
    await feld.fill('Hallo @Welt');
    let z = await zustand();
    pruefe('„@“: aria-invalid, aria-describedby zeigt auf den Fehler, Text nennt «@», nichts verschluckt',
      z.invalid === 'true' && z.beschrieben.split(' ').includes('gravur-fehler') && z.fehler.startsWith('«@» geht nicht') && z.wert === 'Hallo @Welt' && z.live === 'polite', JSON.stringify(z));
    pruefe('Handy zeigt keine ungültige Gravur', (await handySvg(seite)).gravur === null);
    await feld.fill('Smiley 😀');
    pruefe('Emoji: Fehler', (await zustand()).fehler.startsWith('«😀»'));
    await feld.fill('Das ist viel zu lang!!');
    z = await zustand();
    pruefe('22 Zeichen eingefügt: nicht abgeschnitten, Fehler „4 zu viel“', z.wert.length === 22 && z.fehler.includes('4 zu viel') && z.invalid === 'true', JSON.stringify(z));
    const vorher = (await speicher(seite)).length;
    await seite.locator('[data-in-warenkorb]').click();
    pruefe('Mit Fehler „In den Warenkorb“: nichts dazu, Fokus ins Feld', (await speicher(seite)).length === vorher && (await seite.evaluate(() => document.activeElement.id)) === 'gravur' && !(await schubladeOffen(seite)));
    await feld.fill('Ça va, Zoë & Élo!');
    z = await zustand();
    pruefe('„Ça va, Zoë & Élo!“ geht: aria-invalid=false, kein Fehler, auf dem Handy', z.invalid === 'false' && z.fehler === '' && z.beschrieben === 'gravur-zaehler' && (await handySvg(seite)).gravur === 'Ça va, Zoë & Élo!', JSON.stringify(z));
    await ctx.close();
  }

  console.log('\n── Zusammenfassen, Obergrenze, Vorschlag ──');
  {
    const { seite, ctx } = await oeffne('kaufen/?modell=k1&farbe=Mattweiss&speicher=256gb');
    const rein = async () => { await seite.locator('[data-in-warenkorb]').click(); await seite.waitForFunction(() => document.querySelector('[data-schublade]').open); await seite.keyboard.press('Escape'); };
    await rein();
    await rein();
    pruefe('Zweimal gleich: eine Zeile, Anzahl 2', (await zeilen(seite)).length === 1 && (await zeilen(seite))[0].anzahl === '2');
    await seite.locator('#gravur').fill('Nr. 2');
    await rein();
    pruefe('Andere Gravur: eigene Zeile', (await zeilen(seite)).length === 2);
    await seite.locator('button[data-warenkorb-knopf]').click();
    await seite.waitForFunction(() => { const d = document.querySelector('[data-schublade]'); return d.open && getComputedStyle(d).transform === 'none'; });
    const plus = seite.locator('[data-schublade] li').first().locator('[data-plus]');
    // force: Playwright klickt sonst nicht auf aria-disabled (das ist ja der Sinn davon)
    for (let i = 0; i < 10; i++) await plus.click({ force: true });
    pruefe('„+“ bis 9, dann aria-disabled, bleibt 9', (await zeilen(seite))[0].anzahl === '9' && (await plus.getAttribute('aria-disabled')) === 'true');
    pruefe('„−“ bei 1 ist aria-disabled', (await seite.locator('[data-schublade] li').nth(1).locator('[data-minus]').getAttribute('aria-disabled')) === 'true');
    const vorschlag = seite.locator('[data-schublade] [data-wk-vorschlag]');
    pruefe('Hüllen-Vorschlag für Kiesel 1', (await vorschlag.isVisible()) && (await vorschlag.locator('[data-vorschlag-modell]').textContent()) === 'Kiesel 1');
    await vorschlag.locator('label[title="Kieselbeige"]').click();
    await vorschlag.locator('[data-vorschlag-dazu]').click();
    const z = await zeilen(seite);
    pruefe('„Dazulegen“: Hülle für Kiesel 1 in Kieselbeige, Vorschlag weg, Fokus auf der neuen Zeile',
      z.some((a) => a.details === 'für Kiesel 1, Kieselbeige') && (await vorschlag.isHidden()) && (await fokus(seite)).text === 'Kiesel-Hülle', JSON.stringify(await fokus(seite)));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('kaufen/?modell=pro&speicher=2tb');
    for (let i = 0; i < 10; i++) await seite.evaluate(() => document.querySelector('[data-kaufen-form]').requestSubmit());
    const korb = await speicher(seite);
    pruefe('10 × „In den Warenkorb“: höchstens 9, Hinweis angesagt', korb[0].anzahl === 9 && (await seite.locator('[data-kaufen-ansage]').textContent()).includes('mehr geht nicht'));
    await ctx.close();
  }

  console.log('\n── Zähler über Tabs und Seiten ──');
  {
    const { seite, ctx } = await oeffne('funktionen/');
    const zweite = await ctx.newPage();
    await zweite.goto(basis + 'kaufen/', { waitUntil: 'load' });
    await zweite.locator('[data-in-warenkorb]').click();
    await seite.waitForFunction(() => !document.querySelector('[data-warenkorb-zahl]').hidden, null, { timeout: 3000 }).catch(() => {});
    pruefe('Anderer Tab legt etwas hinein: Zähler hier springt auf 1', (await zaehler(seite)) === '1', await zaehler(seite));
    await seite.goto(basis + 'faq/', { waitUntil: 'load' });
    pruefe('Seitenwechsel: Zähler 1', (await zaehler(seite)) === '1');
    await seite.goto(basis + 'warenkorb/', { waitUntil: 'load' });
    await seite.locator('main [data-entfernen]').first().click();
    await seite.goBack({ waitUntil: 'load' });
    pruefe('Auf /warenkorb/ entfernt, „Zurück“: Zähler aktuell (leer)', (await zaehler(seite)) === '', await zaehler(seite));
    await ctx.close();
  }

  console.log('\n── Links, /warenkorb/, Startseite ──');
  {
    const { seite, ctx } = await oeffne('');
    const links = await seite.evaluate(() => [...document.querySelectorAll('a[href*="kaufen/?"]')].map((a) => a.getAttribute('href').split('kaufen/')[1]));
    pruefe('Startseite: Modellkarten übergeben Modell und Farbe', links.includes('?modell=k1&farbe=Kieselbeige') && links.includes('?modell=pro&farbe=Himmelblau'), links.join(', '));
    await seite.locator('[data-teaser-huelle]').click();
    pruefe('Startseite: Hülle kommt wirklich in den Warenkorb (Pro, Mattweiss)', JSON.stringify(await speicher(seite)) === JSON.stringify([{ art: 'huelle', modell: 'pro', farbe: 'Mattweiss', anzahl: 1 }]), JSON.stringify(await speicher(seite)));
    const K1 = '?modell=k1&farbe=Kieselbeige', PRO = '?modell=pro&farbe=Himmelblau';
    for (const [adresse, erwartet, anderes] of [['kiesel-1/', K1], ['kiesel-1-pro/', PRO], ['kiesel-1/technik/', K1, PRO], ['kiesel-1-pro/technik/', PRO, K1]]) {
      await seite.goto(basis + adresse, { waitUntil: 'load' });
      const hrefs = await seite.evaluate(() => [...document.querySelectorAll('main a[href*="kaufen/"], .unterleiste a[href*="kaufen/"]')].map((a) => a.getAttribute('href').split('kaufen/')[1]));
      // Technik (Etappe 7): Der Kopf zeigt beide Modelle mit je eigenem Kaufen-Knopf
      const eigene = hrefs.filter((h) => h === erwartet).length, fremde = hrefs.filter((h) => h !== erwartet);
      pruefe(`/${adresse}: alle Kaufen-Links mit ${erwartet}${anderes ? `, ausser genau einem mit ${anderes} (Technik-Kopf)` : ''}`, eigene >= 2 && (anderes ? fremde.length === 1 && fremde[0] === anderes : fremde.length === 0), hrefs.join(', '));
    }
    await seite.goto(basis + 'zubehoer/', { waitUntil: 'load' });
    await seite.locator('[data-kombi-kaufen]').click();
    await seite.waitForURL(/kaufen/);
    await seite.waitForLoadState('load');
    pruefe('Zubehör „Diese Kombination kaufen“: Pro, Himmelblau, Hülle Mattweiss vorgewählt',
      (await seite.locator('input[name="farbe"]:checked').getAttribute('value')) === 'Himmelblau' && (await seite.locator('[data-huelle-schalter]').getAttribute('aria-checked')) === 'true'
      && (await seite.locator('input[name="huelle-farbe"]:checked').getAttribute('value')) === 'Mattweiss' && (await total(seite)) === 'CHF 1’759.–', await total(seite));
    await seite.goto(basis + 'warenkorb/', { waitUntil: 'load' });
    const w = await seite.evaluate(() => ({ schublade: !!document.querySelector('[data-schublade]'), link: document.querySelector('[data-warenkorb-knopf]').tagName + ':' + document.querySelector('[data-warenkorb-knopf]').getAttribute('aria-current'), platzhalter: document.body.innerText.includes('Inhalt folgt') }));
    pruefe('/warenkorb/: keine Schublade, Knopf oben ist Link mit aria-current, kein Platzhalter', !w.schublade && w.link === 'A:page' && !w.platzhalter, JSON.stringify(w));
    const s = await summenText(seite, 'main');
    pruefe('/warenkorb/: Hülle aus der Startseite, CHF 59.–, MwSt. 4.42 (Warenkorb F)', s.total === 'CHF 59.–' && s.mwst === 'CHF 4.42', JSON.stringify(s));
    await seite.locator('main [data-zur-kasse]').click();
    await seite.getByRole('button', { name: 'Warenkorb leeren' }).click();
    const fw = await fokusNach(seite, 'Kiesel zusammenstellen');
    pruefe('/warenkorb/: Kasse leeren, Fokus auf „Kiesel zusammenstellen“', fw.text === 'Kiesel zusammenstellen', JSON.stringify(fw));
    await ctx.close();
  }

  console.log('\n── Handy-Breite, Bewegung ──');
  {
    const { seite, ctx, status } = await oeffne('kaufen/?huelle=Mattweiss', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const breit = () => seite.evaluate(() => document.documentElement.scrollWidth);
    pruefe('390 px: /kaufen/ ohne waagrechtes Scrollen', (await breit()) <= 390, String(await breit()));
    await seite.locator('[data-in-warenkorb]').tap();
    await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
    const b = await seite.evaluate(() => document.querySelector('[data-schublade]').getBoundingClientRect().width);
    pruefe('390 px: Schublade volle Breite', Math.round(b) === 390, String(b));
    const ziele = await seite.evaluate(() => [...document.querySelectorAll('[data-schublade] button, [data-schublade] a')].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return [e.textContent.trim() || e.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => h < 44 || w < 44));
    pruefe('Tippflächen in der Schublade mind. 44 px', ziele.length === 0, JSON.stringify(ziele));
    await seite.goto(basis + 'warenkorb/', { waitUntil: 'load' });
    pruefe('390 px: /warenkorb/ ohne waagrechtes Scrollen', (await breit()) <= 390, String(await breit()));
    pruefe('Keine Skriptfehler (Handy)', status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('kaufen/', { reducedMotion: 'no-preference' });
    await seite.locator('[data-in-warenkorb]').click();
    await seite.waitForTimeout(60);
    const mitte = await seite.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-schublade]')).transform).m41);
    await seite.waitForTimeout(500);
    const ende = await seite.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-schublade]')).transform).m41);
    pruefe('Schublade fährt von rechts herein (unterwegs verschoben, am Ende an Ort)', mitte > 5 && ende === 0, `${mitte} → ${ende}`);
    await ctx.close();
  }
  {
    // Bild für Bild messen statt nach fester Zeit: Wann das erste Bild nach dem Klick kommt,
    // hängt von der Rechnerlast ab (nach 30 ms war die Schublade mal schon da, mal noch nicht).
    // „Sofort“ heisst: keine Zwischenlage (keine Fahrt), nach wenigen Bildern an Ort.
    const { seite, ctx } = await oeffne('kaufen/', { reducedMotion: 'reduce' });
    await seite.evaluate(() => {
      window.__lagen = [];
      const d = document.querySelector('[data-schublade]');
      const bild = () => { window.__lagen.push(new DOMMatrix(getComputedStyle(d).transform).m41); if (window.__lagen.length < 15) requestAnimationFrame(bild); };
      document.querySelector('[data-in-warenkorb]').addEventListener('click', () => requestAnimationFrame(bild));
    });
    await seite.locator('[data-in-warenkorb]').click();
    await seite.waitForFunction(() => window.__lagen.length >= 15);
    const lagen = await seite.evaluate(() => window.__lagen);
    const start = Math.max(...lagen);
    pruefe('Weniger Bewegung: Schublade sofort da (keine Zwischenlage, nach wenigen Bildern an Ort)', lagen.every((x) => x === 0 || x === start) && lagen.indexOf(0) >= 0 && lagen.indexOf(0) <= 8 && lagen.at(-1) === 0, lagen.join(' '));
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
