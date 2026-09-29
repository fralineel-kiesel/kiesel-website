// Prüft die sprachneutralen Kennungen (Etappe 9a) und die Migration alter Werte:
//
//   npm run pruefe:kennungen
//
// Bis Etappe 8 hiessen Farben überall wie ihr deutscher Name („Himmelblau“), der Warenkorb
// speicherte art 'handy'/'huelle', /vergleichen/ kannte ?ansicht=uebereinander. Jetzt gelten
// Kennungen (sky-blue, phone/case, overlay). Alte Links und alte Warenkörbe, die schon in
// Browsern liegen, müssen weiter funktionieren und werden beim Laden umgestellt.
//
// 1. Ohne Browser: farbId() mit allen alten Namen (Gross/Klein, Leerzeichen) und Unsinn,
//    artId(), bereinige() mit den Formaten aus Etappe 5, 6–8 und dem neuen, palette() mit altem
//    Namen = Kennung, zu jeder Kennung ein Name in der Textdatei.
// 2. Im Browser: alter Warenkorb (beide alten Formate gemischt mit neuem) wird richtig angezeigt,
//    gleiche Artikel fassen sich zusammen, der Speicher steht danach im neuen Format; kaputtes
//    JSON bleibt stehen; gesperrter Speicher gibt keinen Fehler; alte Adressen auf /kaufen/,
//    /zubehoer/huelle/ und /vergleichen/ wählen richtig vor und werden (wo die Seite die Adresse
//    nachführt) auf Kennungen umgeschrieben.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { FARB_IDS, ALTE_FARBNAMEN, farbId, FARBEN } from '../src/data/farben.js';
import { bereinige, artId, summen } from '../src/scripts/warenkorb.js';
import { palette } from '../src/lib/kiesel-draw/colors.js';
import { THEMEN } from '../src/data/faq.js';
import { ZOOM_TARGETS } from '../src/lib/kiesel-draw/ausschnitt.js';
import { BLUME_FOKUS } from '../src/lib/kiesel-draw/scene.js';
import * as de from '../src/i18n/de.js';

let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info && !ok ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ====================================================================== 1. ohne Browser
console.log('\n── Farben ──');
// Erwartung ausgeschrieben, nicht aus ALTE_FARBNAMEN abgeleitet
const SOLL = { Mattschwarz: 'matte-black', Titangrau: 'titanium-gray', Himmelblau: 'sky-blue', Mattweiss: 'matte-white', Kieselbeige: 'pebble-beige' };
pruefe('Fünf Kennungen, sprachneutral (klein, nur a–z und -)', FARB_IDS.length === 5 && FARB_IDS.every((id) => /^[a-z]+(-[a-z]+)*$/.test(id)), FARB_IDS.join(', '));
pruefe('Titangrau heisst titanium-gray (amerikanisch)', farbId('Titangrau') === 'titanium-gray');
pruefe('Jeder alte Name hat genau seine Kennung', gleich(Object.entries(ALTE_FARBNAMEN).sort(), Object.entries(SOLL).sort()) && Object.values(SOLL).every((id) => FARB_IDS.includes(id)));
pruefe('Kennung → sich selbst', FARB_IDS.every((id) => farbId(id) === id));
pruefe('Alte Namen in jeder Schreibweise (klein, GROSS, mit Leerzeichen)', Object.entries(SOLL).every(([alt, id]) =>
  farbId(alt) === id && farbId(alt.toLowerCase()) === id && farbId(alt.toUpperCase()) === id && farbId(` ${alt} `) === id));
pruefe('Kennung in Grossbuchstaben geht auch', farbId('SKY-BLUE') === 'sky-blue');
const unsinn = ['Lila', '', null, undefined, 'sky blue', 'skyblue', '#A7C4DE', '<script>', 'Himmel', 'constructor', '__proto__', 42];
pruefe(`Unsinn → null (${unsinn.length} Fälle, auch „constructor“ und „__proto__“)`, unsinn.every((u) => farbId(u) === null), unsinn.filter((u) => farbId(u) !== null).join(', '));
pruefe('palette(alter Name) = palette(Kennung) = PAL', Object.entries(SOLL).every(([alt, id]) => palette(alt) === FARBEN[id] && palette(id) === FARBEN[id]));
pruefe('Jede Farbe hat einen Namen in der Textdatei, alte Namen = Anzeige', Object.entries(SOLL).every(([alt, id]) => de.farben[id] === alt));

console.log('\n── Warenkorb-Einträge ──');
pruefe('artId: phone/case und die alten handy/huelle', artId('phone') === 'phone' && artId('case') === 'case' && artId('handy') === 'phone' && artId('huelle') === 'case' && artId('HUELLE') === 'case');
pruefe('artId: Unsinn → null', [null, '', 'rakete', 'toString', 'constructor', '__proto__'].every((a) => artId(a) === null));
const alt6 = bereinige({ art: 'handy', modell: 'pro', farbe: 'Titangrau', speicher: '2tb', gravur: 'Linos Kiesel', anzahl: 1 });
pruefe('Etappe 6–8: Handy mit deutscher Art und Farbe → phone/titanium-gray',
  gleich(alt6, { art: 'phone', modell: 'pro', farbe: 'titanium-gray', speicher: '2tb', anzahl: 1, gravur: 'Linos Kiesel', id: 'phone|pro|titanium-gray|2tb|Linos Kiesel' }), JSON.stringify(alt6));
const alt6h = bereinige({ art: 'huelle', modell: 'k1', farbe: 'kieselbeige', anzahl: 3 });
pruefe('Etappe 6–8: Hülle, Farbe klein geschrieben → case/pebble-beige', gleich(alt6h, { art: 'case', modell: 'k1', farbe: 'pebble-beige', anzahl: 3, id: 'case|k1|pebble-beige' }), JSON.stringify(alt6h));
const alt5 = bereinige({ id: 'huelle-k1-mattweiss', art: 'huelle', name: 'Kiesel-Hülle', modell: 'k1', farbe: 'Mattweiss', preis: 1, anzahl: 1 });
pruefe('Etappe 5: Hülle mit Preis → case/matte-white, Preis ignoriert', alt5?.art === 'case' && alt5.farbe === 'matte-white' && !('preis' in alt5) && summen([alt5]).total === 5900, JSON.stringify(alt5));
const neu = bereinige({ art: 'phone', modell: 'k1', farbe: 'sky-blue', speicher: '512gb', anzahl: 2 });
pruefe('Neues Format bleibt, wie es ist', gleich(neu, { art: 'phone', modell: 'k1', farbe: 'sky-blue', speicher: '512gb', anzahl: 2, id: 'phone|k1|sky-blue|512gb|' }), JSON.stringify(neu));
pruefe('Alt und neu ergeben dieselbe Artikel-ID (fassen sich zusammen)',
  bereinige({ art: 'huelle', modell: 'pro', farbe: 'Mattweiss', anzahl: 1 }).id === bereinige({ art: 'case', modell: 'pro', farbe: 'matte-white', anzahl: 1 }).id);
pruefe('Unbekannte Art oder Farbe fällt weg', bereinige({ art: 'rakete', modell: 'pro', farbe: 'sky-blue' }) === null && bereinige({ art: 'phone', modell: 'pro', farbe: 'Lila', speicher: '2tb' }) === null);

console.log('\n── Weitere Kennungen ──');
pruefe('FAQ-Themen: Kennungen mit Namen, dazu „alle“', THEMEN.length === 5 && [...THEMEN, 'alle'].every((id) => /^[a-z]+$/.test(id) && de.faqThemen[id]));
pruefe('Panorama-Details: 8 Kennungen mit Namen', ZOOM_TARGETS.length === 8 && ZOOM_TARGETS.every(([id]) => /^[a-z-]+$/.test(id) && de.panoramaDetails[id]));
pruefe('Blumen-Vorgaben: Kennungen mit Namen', Object.keys(BLUME_FOKUS).every((id) => /^[a-z]+$/.test(id) && de.blumeFokus[id]));

// ====================================================================== 2. im Browser
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();

async function oeffne(adresse, { initSkript } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  if (initSkript) await ctx.addInitScript(initSkript);
  const seite = await ctx.newPage();
  const status = { fehler: [] };
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  seite.on('console', (m) => { if (m.type() === 'error') status.fehler.push(m.text()); });
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  return { seite, ctx, status };
}
const roh = (seite) => seite.evaluate(() => localStorage.getItem('kiesel-warenkorb'));
const zeilen = (seite) => seite.evaluate(() => [...document.querySelectorAll('[data-warenkorb-inhalt][data-art="seite"] [data-wk-liste] li')].map((li) => ({
  name: li.querySelector('[data-name]').textContent, details: li.querySelector('[data-details]').textContent, anzahl: li.querySelector('[data-zahl]').textContent,
})));
// Nur beim ersten Laden setzen (sonst setzt das Init-Skript es bei jedem Neuladen wieder)
const einmal = (wert) => `try { if (!sessionStorage.getItem('gesetzt')) { sessionStorage.setItem('gesetzt', '1'); localStorage.setItem('kiesel-warenkorb', ${JSON.stringify(wert)}); } } catch {}`;

console.log('\n── Alter Warenkorb im Browser ──');
{
  const ALT = JSON.stringify([
    { art: 'handy', modell: 'pro', farbe: 'Titangrau', speicher: '2tb', gravur: 'Linos Kiesel', anzahl: 1 },            // Etappe 6–8
    { id: 'huelle-k1-mattweiss', art: 'huelle', name: 'Kiesel-Hülle', modell: 'k1', farbe: 'Mattweiss', preis: 1, anzahl: 1 }, // Etappe 5
    { art: 'case', modell: 'k1', farbe: 'matte-white', anzahl: 2 },                                                       // neu, gleiche Hülle
    { art: 'handy', modell: 'k1', farbe: 'Lila', speicher: '256gb' },                                                     // Unsinn
  ]);
  const { seite, ctx, status } = await oeffne('warenkorb/', { initSkript: einmal(ALT) });
  await seite.waitForFunction(() => document.querySelectorAll('[data-warenkorb-inhalt][data-art="seite"] [data-wk-liste] li').length > 0);
  const z = await zeilen(seite);
  pruefe('Anzeige: deutsche Farbnamen, alte und neue Hülle zu einer Zeile (1 + 2 = 3)',
    gleich(z, [
      { name: 'Kiesel 1 Pro', details: 'Titangrau, 2 TB, Gravur «Linos Kiesel»', anzahl: '1' },
      { name: 'Kiesel-Hülle', details: 'für Kiesel 1, Mattweiss', anzahl: '3' },
    ]), JSON.stringify(z));
  const gespeichert = JSON.parse(await roh(seite));
  pruefe('Speicher danach im neuen Format (phone/case, Kennungen, ohne Preis und Unsinn)', gleich(gespeichert, [
    { art: 'phone', modell: 'pro', farbe: 'titanium-gray', speicher: '2tb', anzahl: 1, gravur: 'Linos Kiesel' },
    { art: 'case', modell: 'k1', farbe: 'matte-white', anzahl: 3 },
  ]), JSON.stringify(gespeichert));
  await seite.reload({ waitUntil: 'load' });
  await seite.waitForFunction(() => document.querySelectorAll('[data-warenkorb-inhalt][data-art="seite"] [data-wk-liste] li').length > 0);
  pruefe('Neu geladen: gleiche Anzeige, Speicher unverändert', gleich(await zeilen(seite), z) && gleich(JSON.parse(await roh(seite)), gespeichert));
  pruefe('Zähler oben: 4 Stück', (await seite.locator('[data-warenkorb-zahl]').textContent()).trim() === '4');
  pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
  await ctx.close();
}
{
  const { seite, ctx, status } = await oeffne('warenkorb/', { initSkript: einmal('[{"art":"handy", kaputt') });
  await seite.waitForTimeout(300);
  pruefe('Kaputtes JSON: leerer Warenkorb, Speicher bleibt unangetastet, kein Fehler',
    (await roh(seite)) === '[{"art":"handy", kaputt' && (await zeilen(seite)).length === 0 && status.fehler.length === 0, `${await roh(seite)} | ${status.fehler.join(' | ')}`);
  await ctx.close();
}
{
  const gesperrt = `(() => { const f = () => { throw new DOMException('gesperrt', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { configurable: true, get: f });
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: f }); })()`;
  const { seite, ctx, status } = await oeffne('kaufen/?modell=pro&farbe=Himmelblau', { initSkript: gesperrt });
  await seite.locator('[data-in-warenkorb]').click();
  await seite.waitForFunction(() => document.querySelector('[data-schublade]').open);
  const z = await seite.evaluate(() => [...document.querySelectorAll('[data-schublade] [data-wk-liste] li [data-details]')].map((d) => d.textContent));
  pruefe('Speicher gesperrt, alte Adresse: kein Fehler, Handy in Himmelblau im Warenkorb', status.fehler.length === 0 && gleich(z, ['Himmelblau, 512 GB']), `${JSON.stringify(z)} ${status.fehler.join(' | ')}`);
  await ctx.close();
}

console.log('\n── Alte Adressen ──');
const gewaehlt = (seite, name) => seite.locator(`input[name="${name}"]:checked`).getAttribute('value');
for (const [adresse, farbe, huelle, suche] of [
  ['kaufen/?modell=pro&farbe=Himmelblau', 'sky-blue', null, '?modell=pro&farbe=sky-blue&speicher=512gb'],
  ['kaufen/?modell=k1&farbe=TITANGRAU&speicher=256gb&huelle=kieselbeige', 'titanium-gray', 'pebble-beige', '?modell=k1&farbe=titanium-gray&speicher=256gb&huelle=pebble-beige'],
  ['kaufen/?modell=pro&farbe=matte-black&huelle=Mattweiss', 'matte-black', 'matte-white', '?modell=pro&farbe=matte-black&speicher=512gb&huelle=matte-white'],
  ['kaufen/?farbe=Lila&huelle=rot', 'sky-blue', null, '?modell=pro&farbe=sky-blue&speicher=512gb'],
]) {
  const { seite, ctx, status } = await oeffne(adresse);
  const ist = [await gewaehlt(seite, 'farbe'), (await seite.locator('[data-huelle-schalter]').getAttribute('aria-checked')) === 'true' ? await gewaehlt(seite, 'huelle-farbe') : null, new URL(seite.url()).search];
  pruefe(`/${adresse} → ${farbe}${huelle ? ` + Hülle ${huelle}` : ''}, Adresse ${suche}`, gleich(ist, [farbe, huelle, suche]) && status.fehler.length === 0, JSON.stringify(ist));
  await ctx.close();
}
{
  const { seite, ctx } = await oeffne('kaufen/?modell=pro&farbe=Kieselbeige');
  const text = await seite.locator('[data-zusammenfassung]').textContent();
  const legende = await seite.locator('.farbe [data-farbname]').first().textContent();
  pruefe('/kaufen/ zeigt weiter den deutschen Namen (Zusammenfassung, Farbwähler)', text === 'Kiesel 1 Pro, Kieselbeige, 512 GB' && legende === 'Kieselbeige', `${text} | ${legende}`);
  await ctx.close();
}
for (const [adresse, soll] of [['zubehoer/huelle/?modell=k1&farbe=Mattweiss', 'matte-white'], ['zubehoer/huelle/?modell=k1&farbe=mattschwarz', 'matte-black'], ['zubehoer/huelle/?farbe=titanium-gray', 'titanium-gray']]) {
  const { seite, ctx } = await oeffne(adresse);
  const label = await seite.evaluate(() => document.querySelector('[data-huelle-handy] svg').getAttribute('aria-label'));
  pruefe(`/${adresse} → Hülle ${soll}`, (await gewaehlt(seite, 'huelle-farbe')) === soll && label.includes(`Hülle in ${de.farben[soll]}`), label);
  await ctx.close();
}
for (const [adresse, ueber, suche] of [
  ['vergleichen/?kiesel=pro&gegen=mini&ansicht=uebereinander', true, '?kiesel=pro&gegen=mini&ansicht=overlay'],
  ['vergleichen/?kiesel=pro&gegen=mini&ansicht=overlay', true, '?kiesel=pro&gegen=mini&ansicht=overlay'],
  ['vergleichen/?kiesel=pro&gegen=mini&ansicht=Uebereinander', true, '?kiesel=pro&gegen=mini&ansicht=overlay'],
  ['vergleichen/?kiesel=pro&gegen=mini&ansicht=quer', false, '?kiesel=pro&gegen=mini'],
]) {
  const { seite, ctx } = await oeffne(adresse);
  const ist = [await seite.evaluate(() => document.querySelector('[data-vergleichen] .buehne').dataset.ueber === 'true'), new URL(seite.url()).search];
  pruefe(`/${adresse} → ${ueber ? 'übereinander' : 'nebeneinander'}, Adresse ${suche}`, gleich(ist, [ueber, suche]), JSON.stringify(ist));
  await ctx.close();
}

await browser.close();
await schliessen();
console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
