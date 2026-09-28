// Prüft Gerätedaten und /vergleichen/ (Playwright + Chromium):
//
//   npm run pruefe:vergleichen
//
// 1. Daten: geraete.js = DEV und technik.js = SPEC aus design/generator/gen4.py (Zeichen für Zeichen).
// 2. Rechnung: vergleich() aus lib/vergleich.js gegen die Original-Rechnung des Artboards
//    (cmp_js in gen4.py) für alle 10 Kombinationen × 2 Ansichten: Satz, Tabelle, Lagen.
// 3. Seite: Chips per Maus und Tastatur, aria-pressed, Satz, Tabelle, Übereinander, Kreditkarte,
//    Vorwahl und Nachführen der Adresse, Kiesel im selben Massstab wie die Umrisse, Handy-Ausschnitt,
//    keine Skriptfehler, kein three.js.
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { referenz } from './gen4-referenz.mjs';
import { GERAETE } from '../src/data/geraete.js';
import { TECHNIK } from '../src/data/technik.js';
import { vergleich, SC, BUEHNE_SCHMAL } from '../src/lib/vergleich.js';

let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

// ------------------------------------------------------------------ 1. Daten
console.log('── Daten ──');
const ref = referenz();
const SCHLUESSEL = { h: 'hoehe', w: 'breite', d: 'dicke', g: 'gewicht', bat: 'akku', disp: 'display', r: 'radius', name: 'name', type: 'typ' };
const falsch = [];
for (const [id, d] of Object.entries(ref.daten.DEV)) {
  for (const [a, b] of Object.entries(SCHLUESSEL)) if (GERAETE[id]?.[b] !== d[a]) falsch.push(`${id}.${b}`);
  if (!!d.est !== !!GERAETE[id].geschaetzt) falsch.push(`${id}.geschaetzt`);
}
pruefe('geraete.js = DEV aus gen4.py (6 Geräte)', falsch.length === 0 && Object.keys(GERAETE).length === 6, falsch.join(', '));
const spec = JSON.stringify(ref.daten.SPEC), unsere = JSON.stringify(TECHNIK.map((g) => [g.titel, g.zeilen]));
pruefe('technik.js = SPEC aus gen4.py (Zeichen für Zeichen)', spec === unsere);

// ------------------------------------------------------------------ 2. Rechnung
console.log('\n── Rechnung gegen das Artboard ──');
const zahlGleich = (a, b) => Math.abs(Number(a) - Number(b)) < 0.051;
let faelle = 0;
const abweichungen = [];
for (const k of ['k1', 'pro']) {
  for (const vs of ['pmax', 'p18', 'mini', 'se', k === 'k1' ? 'pro' : 'k1']) {
    for (const mode of ['side', 'over']) {
      faelle++;
      const r = ref.vergleich({ k, vs, mode });
      const v = vergleich({ kiesel: k, gegen: vs, modus: mode });
      const fall = `${k}/${vs}/${mode}`;
      if (r.sentence.trim() !== v.satz) abweichungen.push(`${fall} Satz: „${r.sentence}“ ≠ „${v.satz}“`);
      r.rows.forEach((z, i) => {
        const u = v.zeilen[i];
        // gen4.py schreibt ohne Tausenderzeichen-Ersatz; beide nutzen de-CH
        const norm = (s) => s.replace(/[’']/g, '’');
        if (z.label !== u.titel || norm(z.a) !== u.a || norm(z.b) !== u.b || !zahlGleich(z.aw, u.aw) || !zahlGleich(z.bw, u.bw)) abweichungen.push(`${fall} Zeile ${z.label}: ${JSON.stringify(z)} ≠ ${JSON.stringify(u)}`);
      });
      for (const key of ['x', 'y', 's', 'cx']) if (!zahlGleich(r.kz[key], v.kz[key])) abweichungen.push(`${fall} kz.${key}: ${r.kz[key]} ≠ ${v.kz[key]}`);
      if (r.kz.name !== v.kz.name || r.kz.dims !== v.kz.masse) abweichungen.push(`${fall} kz.name/masse`);
      // Hörer-Schlitz des SE bewusst mittig (siehe lib/vergleich.js), darum nx beim SE auslassen
      const oKeys = ['x', 'y', 'w', 'h', 'r', 'sx', 'sy', 'sw', 'sh', 'sr', 'hx', 'hy', 'hr', 'ny', 'nw', 'nh', 'nr', 'cx', ...(vs === 'se' ? [] : ['nx'])];
      for (const key of oKeys) if (!zahlGleich(r.o[key], v.o[key])) abweichungen.push(`${fall} o.${key}: ${r.o[key]} ≠ ${v.o[key]}`);
      if (Boolean(r.o.homeOp) !== v.o.homeSichtbar) abweichungen.push(`${fall} Home-Button`);
      for (const key of ['x', 'y', 'w', 'h', 'cx', 'ty']) if (!zahlGleich(r.cd[key], v.karte[key])) abweichungen.push(`${fall} karte.${key}`);
      if (r.overLegend !== v.legende) abweichungen.push(`${fall} Legende`);
    }
  }
}
pruefe(`${faelle} Kombinationen: Satz, Tabelle, Lage von Kiesel, Gegner und Kreditkarte wie im Artboard`, abweichungen.length === 0, abweichungen.slice(0, 3).join(' | '));
pruefe('Kiesel 1 gegen SE: dieselbe Grundfläche, SE dünner', vergleich({ kiesel: 'k1', gegen: 'se' }).satz === 'iPhone SE (2016) und Kiesel 1 haben genau dieselbe Grundfläche. Das iPhone SE (2016) ist 1.40 mm dünner, dafür hat der Kiesel 85 % mehr Akku.');
pruefe('Kiesel 1 Pro gegen Kiesel 1: „Der Kiesel 1 Pro ist … als der Kiesel 1.“', vergleich({ kiesel: 'pro', gegen: 'k1' }).satz === 'Der Kiesel 1 Pro ist 7.7 mm höher und 5.6 mm breiter als der Kiesel 1.');

// ------------------------------------------------------------------ 3. Seite
console.log('\n── Seite /vergleichen/ ──');
const DREI_D = /\/buehne\.[\w-]+\.js$/;
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();

async function oeffne(adresse, kontext = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { dreiD: false, fehler: [] };
  seite.on('request', (r) => { if (DREI_D.test(new URL(r.url()).pathname)) status.dreiD = true; });
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  return { seite, ctx, status };
}
const gedrueckt = (seite) => seite.evaluate(() => [...document.querySelectorAll('[data-vergleichen] .chip[aria-pressed="true"]')].map((c) => c.textContent.trim()));
const satz = (seite) => seite.locator('[data-satz]').textContent();
const suche = (seite) => seite.evaluate(() => location.search);

try {
  const { seite, ctx, status } = await oeffne('vergleichen/');
  pruefe('Anfang: Kiesel 1 gegen iPhone 18 Pro Max, nebeneinander', JSON.stringify(await gedrueckt(seite)) === JSON.stringify(['Kiesel 1', 'iPhone 18 Pro Max', 'Nebeneinander']), (await gedrueckt(seite)).join(', '));
  pruefe('Anfang: Satz wie im Artboard', (await satz(seite)) === vergleich({}).satz);

  // Maus
  await seite.getByRole('button', { name: 'iPhone 13 mini' }).click();
  pruefe('Klick „iPhone 13 mini“: gedrückt, Satz und Tabelle nachgeführt', (await gedrueckt(seite)).includes('iPhone 13 mini') && (await satz(seite)) === vergleich({ kiesel: 'k1', gegen: 'mini' }).satz && (await seite.locator('.gegner-kopf').textContent()) === 'iPhone 13 mini', await satz(seite));
  pruefe('Adresse nachgeführt', (await suche(seite)) === '?kiesel=k1&gegen=mini', await suche(seite));

  // Tastatur: Tab bis „Kiesel 1 Pro“ (erste Gruppe), Enter
  await seite.locator('[data-kiesel="k1"]').focus();
  await seite.keyboard.press('Tab');
  const fokus = await seite.evaluate(() => document.activeElement.textContent.trim());
  await seite.keyboard.press('Enter');
  const g = await gedrueckt(seite);
  pruefe('Tastatur: Tab auf „Kiesel 1 Pro“, Enter wählt ihn', fokus === 'Kiesel 1 Pro' && g[0] === 'Kiesel 1 Pro', `${fokus} → ${g.join(', ')}`);
  const anderer = await seite.locator('[data-gegen="anderer"]').textContent();
  pruefe('Letzter Gegner-Chip heisst jetzt „Kiesel 1“', anderer.trim() === 'Kiesel 1', anderer);
  await seite.locator('[data-gegen="anderer"]').focus();
  await seite.keyboard.press('Space');
  pruefe('Leertaste auf „Kiesel 1“: Pro gegen Kiesel 1', (await satz(seite)) === vergleich({ kiesel: 'pro', gegen: 'k1' }).satz, await satz(seite));
  await seite.locator('[data-kiesel="k1"]').click();
  const nachWechsel = await gedrueckt(seite);
  pruefe('Wechsel auf Kiesel 1: der Gegner wird zum Kiesel 1 Pro (nie gegen sich selbst)', nachWechsel[0] === 'Kiesel 1' && nachWechsel[1] === 'Kiesel 1 Pro', nachWechsel.join(', '));

  // Kiesel im selben Massstab: Höhe der gezeichneten Front = Höhe × 3 SVG-Einheiten
  await seite.locator('[data-gegen="se"]').click();
  const masse = await seite.evaluate(() => {
    const svg = document.querySelector('[data-svg]');
    const faktor = svg.viewBox.baseVal.width / svg.getBoundingClientRect().width;
    // Das Gehäuse (Rechteck ab 0/0 in voller Breite), ohne Schatten und Knöpfe
    const k = document.querySelector('[data-kiesel-bild="k1"] rect[x="0"][y="0"]').getBoundingClientRect();
    const o = document.querySelector('[data-o="rahmen"]');
    return { kH: k.height * faktor, kW: k.width * faktor, oH: o.height.baseVal.value, oW: o.width.baseVal.value };
  });
  pruefe('Kiesel 1 und SE gleich gross gezeichnet (123.8 × 58.6 mm, 3 Einheiten pro mm)', [masse.kH, masse.oH].every((h) => Math.abs(h - 123.8 * SC) < 0.5) && [masse.kW, masse.oW].every((w) => Math.abs(w - 58.6 * SC) < 0.5), JSON.stringify(masse));
  pruefe('SE mit Home-Button', (await seite.locator('[data-o="home"]').getAttribute('visibility')) === 'visible');

  // Übereinander und Kreditkarte
  await seite.getByRole('button', { name: 'Übereinander' }).click();
  const ueber = await seite.evaluate(() => ({
    legende: getComputedStyle(document.querySelector('[data-legende]')).display,
    namen: getComputedStyle(document.querySelector('.namen')).visibility,
    strich: getComputedStyle(document.querySelector('[data-o="rahmen"]')).strokeDasharray,
  }));
  pruefe('Übereinander: Legende sichtbar, Namen weg, Gegner gestrichelt', ueber.legende === 'block' && ueber.namen === 'hidden' && ueber.strich !== 'none', JSON.stringify(ueber));
  const karte = seite.getByRole('button', { name: 'Kreditkarte einblenden' });
  await karte.click();
  const k1 = { pressed: await karte.getAttribute('aria-pressed'), sichtbar: await seite.evaluate(() => getComputedStyle(document.querySelector('[data-kreditkarte]')).visibility) };
  await karte.click();
  const k2 = { pressed: await karte.getAttribute('aria-pressed'), sichtbar: await seite.evaluate(() => getComputedStyle(document.querySelector('[data-kreditkarte]')).visibility) };
  pruefe('Kreditkarte ein/aus mit aria-pressed', k1.pressed === 'true' && k1.sichtbar === 'visible' && k2.pressed === 'false' && k2.sichtbar === 'hidden', JSON.stringify([k1, k2]));
  pruefe('Satz wird vorgelesen (aria-live)', (await seite.locator('[data-satz]').getAttribute('aria-live')) === 'polite');
  pruefe('Tabelle: 6 Zeilen mit Zeilenköpfen', await seite.locator('.tabelle tbody th[scope="row"]').count() === 6);
  pruefe('Keine Skriptfehler, kein three.js', status.fehler.length === 0 && !status.dreiD, status.fehler.join(' | '));
  await ctx.close();

  // Vorwahl per Adresse (auch aus der Unterleiste)
  {
    const { seite, ctx } = await oeffne('vergleichen/?kiesel=PRO&gegen=p18&ansicht=uebereinander&karte=1');
    const g = await gedrueckt(seite);
    pruefe('Adresse ?kiesel=PRO&gegen=p18&ansicht=uebereinander&karte=1 wird übernommen', JSON.stringify(g) === JSON.stringify(['Kiesel 1 Pro', 'iPhone 18 Pro', 'Übereinander', 'Kreditkarte einblenden']), g.join(', '));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('vergleichen/?kiesel=gibtsnicht&gegen=nokia');
    const g = await gedrueckt(seite);
    pruefe('Unsinn in der Adresse wird ignoriert', g[0] === 'Kiesel 1' && g[1] === 'iPhone 18 Pro Max', g.join(', '));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('kiesel-1-pro/');
    await seite.locator('.unterleiste').getByRole('link', { name: 'Vergleichen' }).click();
    await seite.waitForURL(/vergleichen/);
    pruefe('Unterleiste der Pro-Seite: „Vergleichen“ wählt den Pro vor', (await gedrueckt(seite))[0] === 'Kiesel 1 Pro');
    await ctx.close();
  }

  // Handy: fester Ausschnitt, nichts ragt hinaus
  {
    const { seite, ctx, status } = await oeffne('vergleichen/?kiesel=pro&gegen=pmax', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const r = await seite.evaluate(() => {
      const svg = document.querySelector('[data-svg]');
      const box = svg.viewBox.baseVal;
      const o = document.querySelector('[data-o="rahmen"]');
      const x2 = o.x.baseVal.value + o.width.baseVal.value;
      return { vb: `${box.x} ${box.y} ${box.width} ${box.height}`, drin: x2 + 2 <= box.x + box.width && o.y.baseVal.value >= box.y, breit: document.documentElement.scrollWidth };
    });
    pruefe('390 px: Ausschnitt der Bühne, Pro Max passt ganz hinein, kein seitliches Scrollen', r.vb === BUEHNE_SCHMAL && r.drin && r.breit <= 390, JSON.stringify(r));
    await seite.getByRole('button', { name: 'iPhone SE (2016)' }).tap();
    pruefe('390 px: Antippen wählt den Gegner', (await gedrueckt(seite)).includes('iPhone SE (2016)') && status.fehler.length === 0);
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
