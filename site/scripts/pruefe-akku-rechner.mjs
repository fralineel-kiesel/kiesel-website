// Prüft den Akku-Rechner (/akku-rechner/) mit Node und im echten Browser (Playwright + Chromium):
//
//   npm run pruefe:akku-rechner
//
// 1. Erwartete Werte (von Hand gerechnet, siehe Aufgabe Etappe 7):
//      Normal:          Kiesel 1 44 %, Kiesel 1 Pro 55 %, SE leer um 22:18
//      Viel unterwegs:  Kiesel 1 leer um 21:37, Kiesel 1 Pro 15 %
//      Ruhiger Tag:     Kiesel 1 72 %, Kiesel 1 Pro 78 %
// 2. rechne() gegen die Original-Rechnung des Artboards (akku_js in gen4.py): alle vier typischen
//    Tage plus 400 zufällige Einstellungen (auch über 16 h): Schlagzeile, Balken, Tage, Farben,
//    Linien im Diagramm, Fehlermeldung, gedrückter Chip.
// 3. Seite: Anfangszustand im HTML (auch ohne Skript), Chips, Regler nur mit Tastatur
//    (Pfeiltasten, Pos1, Ende, Bild auf), aria-valuetext, Fehler über 16 h (role="alert"),
//    Menü- und Footer-Links, 390 px, keine Skriptfehler.
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { referenz } from './gen4-referenz.mjs';
import { rechne, linie, TAETIGKEITEN } from '../src/lib/akku-rechner.js';
import { RECHNER } from '../src/data/akku.js';
import { akkuRechner } from '../src/i18n/de.js';
// Tage haben Kennungen (normal, busy …); die Chips zeigen die Namen aus der Textdatei
const TAG_ID = Object.fromEntries(Object.entries(akkuRechner.tage).map(([id, name]) => [name, id]));
import { HANDYS_SPALTEN, FOOTER_SPALTEN } from '../src/data/navigation.js';

let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}
const text = (erg, id) => erg.balken.find((b) => b.id === id).text;

// ------------------------------------------------------------------ 1. Erwartete Werte
console.log('── Erwartete Werte ──');
const tag = (name) => rechne(RECHNER.tage[name]);
const ERWARTET = [
  ['normal', 'k1', '44 %'], ['normal', 'pro', '55 %'], ['normal', 'se', 'leer um 22:18'],
  ['busy', 'k1', 'leer um 21:37'], ['busy', 'pro', '15 %'],
  ['quiet', 'k1', '72 %'], ['quiet', 'pro', '78 %'],
];
const NAME = { k1: 'Kiesel 1', pro: 'Kiesel 1 Pro', se: 'SE' };
for (const [t, id, soll] of ERWARTET) pruefe(`${t}: ${NAME[id]} ${soll}`, text(tag(t), id) === soll, text(tag(t), id));

// ------------------------------------------------------------------ 2. Gegen das Artboard
console.log('\n── Rechnung gegen das Artboard ──');
const ref = referenz();
const FARBE = { accent: 'ACC', ink: 'INK', muted: 'MUT', heat: 'HEAT', line: 'LINE' };
function vergleiche(v) {
  const r = ref.akku({ v });
  const u = rechne(v);
  const d = [];
  if (r.err !== u.fehler) d.push(`Fehler „${r.err}“ ≠ „${u.fehler}“`);
  if (r.headline !== u.schlagzeile) d.push(`Schlagzeile „${r.headline}“ ≠ „${u.schlagzeile}“`);
  r.results.forEach((b, i) => {
    const m = u.balken[i];
    const pct = u.ergebnisse ? m.prozent.toFixed(1) : 0;
    if (b.name !== m.name || b.result !== m.text || String(b.pct) !== String(pct) || b.fill !== FARBE[m.farbe] || b.days !== m.tage || (b.col === 'HEAT') !== m.leer) d.push(`Balken ${b.name}: ${JSON.stringify(b)} ≠ ${JSON.stringify(m)}`);
  });
  const linien = u.ergebnisse ? ['k1', 'pro', 'se'].map((id) => linie(u.ergebnisse[id])) : ['M0 0', 'M0 0', 'M0 0'];
  if (r.lineK !== linien[0] || r.lineP !== linien[1] || r.lineS !== linien[2]) d.push(`Linien ${r.lineK} | ${linien[0]}`);
  if (r.chartAria !== u.label) d.push(`Diagramm-Text „${r.chartAria}“ ≠ „${u.label}“`);
  const gedrueckt = r.presets.find((p) => p.pressed === 'true')?.name ?? null;
  // Das Artboard kennt den Namen des Tages, rechne() die Kennung
  if (gedrueckt !== (u.tag && akkuRechner.tage[u.tag])) d.push(`Chip ${gedrueckt} ≠ ${u.tag}`);
  return d;
}
const abw = [];
for (const name of Object.keys(RECHNER.tage)) abw.push(...vergleiche(RECHNER.tage[name]).map((x) => `${name}: ${x}`));
pruefe('Vier typische Tage wie im Artboard', abw.length === 0, abw.slice(0, 2).join(' | '));
// Zufällige Einstellungen im 0.5-h-Raster (feste Saat, damit jeder Lauf dieselben prüft)
let saat = 7;
const zufall = () => (saat = (saat * 16807) % 2147483647) / 2147483647;
const abw2 = [];
let ueber16 = 0, leer = 0;
for (let i = 0; i < 400; i++) {
  const v = Object.fromEntries(RECHNER.regler.map(([k, max]) => [k, Math.round(zufall() * max * 2) / 2]));
  const s = Object.values(v).reduce((a, b) => a + b, 0);
  if (s > 16) ueber16++;
  if (s <= 16 && rechne(v).ergebnisse.k1.leer) leer++;
  abw2.push(...vergleiche(v).map((x) => `${JSON.stringify(v)}: ${x}`));
}
pruefe(`400 zufällige Tage wie im Artboard (${ueber16} davon über 16 h, ${leer} mit leerem Kiesel 1)`, abw2.length === 0 && ueber16 > 20 && leer > 20, abw2.slice(0, 2).join(' | '));
pruefe('Unsinn wird aufgeräumt (negativ, zu gross, kein Raster, Text)', JSON.stringify(rechne({ surf: -3, video: 99, music: 1.3, cam: 'x', game: 2 }).werte) === JSON.stringify({ surf: 0, video: 6, music: 1.5, cam: RECHNER.tage.normal.cam, game: 2 }));

// ------------------------------------------------------------------ 3. Seite
console.log('\n── Seite /akku-rechner/ ──');
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
const nb = (s) => s.replace(/ /g, ' ');

async function oeffne(adresse, kontext = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { fehler: [] };
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  return { seite, ctx, status };
}
const anzeige = (seite) => seite.evaluate(() => ({
  schlagzeile: document.querySelector('[data-schlagzeile]').textContent,
  texte: Object.fromEntries([...document.querySelectorAll('[data-akku]')].map((li) => [li.dataset.akku, li.querySelector('[data-text]').textContent])),
  werte: Object.fromEntries([...document.querySelectorAll('[data-regler]')].map((r) => [r.dataset.regler, parseFloat(r.value)])),
  tag: document.querySelector('[data-tag][aria-pressed="true"]')?.dataset.tag ?? null,
  fehler: document.querySelector('[data-fehler]').textContent,
}));
// Stimmt die Anzeige mit rechne() für die Reglerwerte überein?
const stimmt = (a) => {
  const e = rechne(a.werte);
  return nb(a.schlagzeile) === e.schlagzeile && e.balken.every((b) => nb(a.texte[b.id]) === b.text) && a.tag === e.tag && a.fehler === e.fehler;
};

try {
  // Ohne JavaScript: Das HTML zeigt schon „Normal“
  {
    const { seite, ctx } = await oeffne('akku-rechner/', { javaScriptEnabled: false });
    const a = await anzeige(seite);
    pruefe('Ohne Skript: HTML zeigt „Normal“ (Kiesel 1 44 %, Pro 55 %, SE leer um 22:18)', nb(a.texte.k1) === '44 %' && nb(a.texte.pro) === '55 %' && a.texte.se === 'leer um 22:18' && a.tag === 'normal', JSON.stringify(a.texte));
    await ctx.close();
  }

  const { seite, ctx, status } = await oeffne('akku-rechner/');
  for (const [name, erwartet] of [['Viel unterwegs', { k1: 'leer um 21:37', pro: '15 %' }], ['Ruhiger Tag', { k1: '72 %', pro: '78 %' }], ['Normal', { k1: '44 %', pro: '55 %', se: 'leer um 22:18' }]]) {
    await seite.getByRole('button', { name, exact: true }).click();
    const a = await anzeige(seite);
    const ok = Object.entries(erwartet).every(([id, t]) => nb(a.texte[id]) === t);
    pruefe(`Chip „${name}“: ${Object.entries(erwartet).map(([id, t]) => `${NAME[id]} ${t}`).join(', ')}`, ok && a.tag === TAG_ID[name] && stimmt(a), JSON.stringify(a.texte));
  }

  // Tastatur: Tab von „Ferientag“ auf den ersten Regler, Pfeiltasten
  await seite.getByRole('button', { name: 'Ferientag' }).focus();
  await seite.keyboard.press('Tab');
  const fokus = await seite.evaluate(() => document.activeElement.id);
  await seite.keyboard.press('ArrowRight');
  await seite.keyboard.press('ArrowRight');
  let a = await anzeige(seite);
  const surf = seite.locator('#sl-surf');
  pruefe('Tab auf „Surfen“, 2 × Pfeil rechts: 4.0 h, neu gerechnet, Chip „Normal“ nicht mehr gedrückt', fokus === 'sl-surf' && a.werte.surf === 4 && a.tag === null && stimmt(a), `${fokus}, ${a.werte.surf} h`);
  pruefe('aria-valuetext und Anzeige: „4.0 Stunden“, „4.0 h“', (await surf.getAttribute('aria-valuetext')) === '4.0 Stunden' && (await seite.locator('[data-aus="surf"]').textContent()) === '4.0 h');
  await seite.keyboard.press('ArrowLeft');
  await seite.keyboard.press('ArrowLeft');
  a = await anzeige(seite);
  pruefe('2 × Pfeil links: zurück auf 3.0 h, Chip „Normal“ wieder gedrückt', a.werte.surf === 3 && a.tag === 'normal' && stimmt(a));
  await seite.keyboard.press('End');
  a = await anzeige(seite);
  pruefe('Ende: Surfen 10 h, Rechnung stimmt', a.werte.surf === 10 && stimmt(a), nb(a.schlagzeile));
  await seite.keyboard.press('Tab'); // Video
  await seite.keyboard.press('End'); // 10 + 6 + 1 + 0.5 = 17.5 h > 16
  a = await anzeige(seite);
  pruefe('Zusammen 17.5 h: Fehlermeldung (role="alert"), Ergebnisse „–“', a.fehler.startsWith('Zusammen 17.5 Stunden aktiv') && a.texte.k1 === '–' && a.schlagzeile === '–' && (await seite.locator('[data-fehler]').getAttribute('role')) === 'alert', a.fehler);
  const leerDiagramm = await seite.locator('[data-diagramm] path').count();
  pruefe('Diagramm ohne Linien und mit Hinweis „Keine Berechnung möglich“', leerDiagramm === 0 && (await seite.locator('[data-diagramm]').getAttribute('aria-label')) === 'Keine Berechnung möglich');
  await seite.keyboard.press('Home');
  a = await anzeige(seite);
  pruefe('Pos1: Video 0 h, Fehler weg, Rechnung stimmt', a.werte.video === 0 && a.fehler === '' && stimmt(a));
  await seite.keyboard.press('PageUp');
  a = await anzeige(seite);
  pruefe('Bild auf: eine ganze Stunde nach oben', a.werte.video === 1 && stimmt(a), `${a.werte.video} h`);
  await seite.keyboard.press('PageDown');
  pruefe('Bild ab: eine Stunde zurück', (await anzeige(seite)).werte.video === 0);
  pruefe('Regler haben sichtbare Beschriftung (label for)', await seite.locator('label[for^="sl-"]').count() === TAETIGKEITEN.length);
  const diagramm = await seite.evaluate(() => ({ vb: document.querySelector('[data-diagramm]').getAttribute('viewBox'), linien: document.querySelectorAll('[data-diagramm] path').length }));
  pruefe('Diagramm: 620 × 300 mit drei Linien', diagramm.vb === '0 0 620 300' && diagramm.linien === 3, JSON.stringify(diagramm));
  pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));

  // Menü und Footer
  const alle = [...HANDYS_SPALTEN, ...FOOTER_SPALTEN].flatMap((s) => s.links).filter((l) => l.text === 'akkuRechner');
  pruefe('navigation.js: „Akku-Rechner“ zeigt überall auf akku-rechner/', alle.length === 2 && alle.every((l) => l.pfad === 'akku-rechner/'));
  const links = await seite.evaluate(() => [...document.querySelectorAll('a')].filter((x) => x.textContent.trim() === 'Akku-Rechner').map((x) => x.getAttribute('href')));
  pruefe('Auf der Seite: alle Links „Akku-Rechner“ zeigen auf /akku-rechner/', links.length >= 2 && links.every((h) => h.endsWith('/akku-rechner/')), links.join(', '));
  pruefe('Kopfzeile: „Handys“ ist als Bereich markiert', await seite.locator('.ausloeser.aktiv').count() >= 1);
  await ctx.close();

  // Von der Modellseite
  {
    const { seite, ctx } = await oeffne('kiesel-1/');
    const href = await seite.getByRole('link', { name: 'Rechne deinen Tag durch' }).getAttribute('href');
    pruefe('Modellseite verlinkt nach der Akku-Story auf den Rechner', href.endsWith('/akku-rechner/'), href);
    await ctx.close();
  }

  // Handy
  {
    const { seite, ctx, status } = await oeffne('akku-rechner/', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const r = await seite.evaluate(() => ({ breit: document.documentElement.scrollWidth, vb: document.querySelector('[data-diagramm]').getAttribute('viewBox'), regler: document.querySelector('#sl-surf').getBoundingClientRect().height }));
    pruefe('390 px: kein seitliches Scrollen, Diagramm schmal gerechnet, Regler 44 px hoch', r.breit <= 390 && r.vb === '0 0 360 300' && r.regler >= 44, JSON.stringify(r));
    await seite.getByRole('button', { name: 'Viel unterwegs' }).tap();
    const a = await anzeige(seite);
    pruefe('390 px: Antippen „Viel unterwegs“ rechnet neu', a.texte.k1 === 'leer um 21:37' && status.fehler.length === 0);
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
