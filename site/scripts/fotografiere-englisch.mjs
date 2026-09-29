// Fotos der englischen Fassung (Etappe 9b):
//
//   npm run fotos:englisch            baut dist/ und fotografiert
//   … -- --ohne-build                 vorhandenen Build benutzen
//
// 1. Jede englische Seite ganz (fullPage) bei 1440 und 390 px, dunkel und hell, als Bogen mit den
//    vier Fotos nebeneinander → scripts/ausgabe/englisch/<seite>.png (Einzelfotos in roh/).
//    Mit „weniger Bewegung“ (Endzustand) und gefülltem Warenkorb (Zähler, Schublade).
// 2. Dazu, was sich erst beim Bedienen zeigt: Burger-Menü mit Sprachumschalter (390), offene
//    Schublade und Kasse, Sprach-Hinweis auf Deutsch und auf Englisch (1440 und 390).
// 3. bericht.md: wo Text überläuft oder abgeschnitten wird (ueberlauf.mjs, wie fotos:pseudo),
//    je Seite und Breite. Kein Prüftest: endet immer mit Code 0, die Fotos schaut man an.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { SEITEN_EN } from './seiten.mjs';
import { miss } from './ueberlauf.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(hier, '..');
const ziel = path.join(hier, 'ausgabe', 'englisch');
const roh = path.join(ziel, 'roh');
fs.mkdirSync(roh, { recursive: true });
const THEMEN = { dark: 'dunkel', light: 'hell' };
const name = (adresse) => adresse.replace(/^en\//, '').replace(/\/$/, '').replace(/\//g, '-') || 'startseite';
const alsDaten = (datei) => 'data:image/png;base64,' + fs.readFileSync(datei).toString('base64');
const WARENKORB = JSON.stringify([
  { art: 'phone', modell: 'pro', farbe: 'titanium-gray', speicher: '2tb', gravur: 'Lino’s Kiesel', anzahl: 2 },
  { art: 'case', modell: 'pro', farbe: 'matte-white', anzahl: 1 },
  { art: 'phone', modell: 'k1', farbe: 'pebble-beige', speicher: '256gb', anzahl: 1 },
]);

if (!process.argv.includes('--ohne-build')) {
  console.log('Build …');
  execFileSync(process.execPath, [path.join(site, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build'], { cwd: site, stdio: ['ignore', 'ignore', 'inherit'] });
}

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer({ fehlerseite: true });

async function kontext(breite, thema, sprache = 'en-US') {
  const ctx = await browser.newContext({ viewport: { width: breite, height: breite > 900 ? 900 : 844 }, colorScheme: thema, reducedMotion: 'reduce', locale: sprache,
    ...(breite < 900 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : {}) });
  await ctx.addInitScript((w) => { try { localStorage.setItem('kiesel-warenkorb', w); } catch { /* */ } }, WARENKORB);
  return ctx;
}
async function bogen(datei, bilder, titel) {
  const seite = await browser.newPage({ viewport: { width: 1800, height: 600 } });
  await seite.setContent(`<body style="margin:0;background:#888;font:600 18px sans-serif;color:#111">
    <p style="margin:16px 20px 0">${titel}</p>
    <div style="display:flex;gap:20px;padding:20px;align-items:flex-start;flex-wrap:wrap">
      ${bilder.map(([text, d, b]) => `<figure style="margin:0;width:${b}px"><figcaption style="margin-bottom:6px">${text}</figcaption><img src="${alsDaten(d)}" style="display:block;width:${b}px"></figure>`).join('')}
    </div></body>`);
  await seite.screenshot({ path: datei, fullPage: true });
  await seite.close();
}
const bereit = async (seite) => { await seite.evaluate(() => document.fonts.ready); await seite.waitForTimeout(400); };

const bericht = ['# Englische Fassung: Überläufe', '', 'Gemessen mit `npm run fotos:englisch` (Fotos im selben Ordner). Hell und dunkel haben dasselbe Layout, gemessen wird hell.', ''];
let stellen = 0;
try {
  // ------------------------------------------------------------- 1. alle englischen Seiten
  for (const [adresse, titel] of SEITEN_EN) {
    const bilder = [];
    const funde = [];
    for (const breite of [1440, 390]) {
      for (const thema of Object.keys(THEMEN)) {
        const ctx = await kontext(breite, thema);
        const seite = await ctx.newPage();
        await seite.goto(basis + adresse, { waitUntil: 'load' });
        await bereit(seite);
        const datei = path.join(roh, `${name(adresse)}-${breite}-${THEMEN[thema]}.png`);
        await seite.screenshot({ path: datei, fullPage: true });
        bilder.push([`${breite} px, ${THEMEN[thema]}`, datei, breite > 900 ? 560 : 280]);
        if (thema === 'light') funde.push(...(await seite.evaluate(miss)).map((p) => `${breite} px: ${p}`));
        await ctx.close();
      }
    }
    await bogen(path.join(ziel, `${name(adresse)}.png`), bilder, `${titel} (/${adresse})`);
    bericht.push(`## /${adresse}`, '', ...(funde.length ? funde.map((p) => `- ${p}`) : ['- nichts gefunden']), '');
    stellen += funde.length;
    console.log(`${funde.length ? '⚠' : '✓'} /${adresse}${funde.length ? `: ${funde.length} Stelle(n)` : ''}`);
  }

  // ------------------------------------------------------------- 2. Bedienzustände
  const zustaende = [];
  for (const thema of Object.keys(THEMEN)) {
    // Burger-Menü mit Sprachumschalter
    let ctx = await kontext(390, thema);
    let seite = await ctx.newPage();
    await seite.goto(basis + 'en/buy/', { waitUntil: 'load' });
    await seite.locator('[data-burger]').click();
    await bereit(seite);
    let d = path.join(roh, `zustand-burger-${THEMEN[thema]}.png`);
    await seite.screenshot({ path: d });
    zustaende.push([`Burger-Menü, ${THEMEN[thema]}`, d, 280]);
    await ctx.close();
    // Schublade und Kasse
    for (const breite of [1440, 390]) {
      ctx = await kontext(breite, thema);
      seite = await ctx.newPage();
      await seite.goto(basis + 'en/features/', { waitUntil: 'load' });
      await seite.locator('[data-warenkorb-knopf]').first().click();
      await seite.waitForFunction(() => document.querySelector('[data-schublade]')?.open);
      await bereit(seite);
      d = path.join(roh, `zustand-schublade-${breite}-${THEMEN[thema]}.png`);
      await seite.screenshot({ path: d });
      zustaende.push([`Bag, ${breite} px, ${THEMEN[thema]}`, d, breite > 900 ? 560 : 280]);
      if (thema === 'light') { const f = await seite.evaluate(miss); bericht.push(`## Schublade (${breite} px)`, '', ...(f.length ? f.map((p) => `- ${p}`) : ['- nichts gefunden']), ''); stellen += f.length; }
      await seite.locator('[data-schublade] [data-zur-kasse]').click();
      await seite.waitForFunction(() => document.querySelector('[data-kasse]')?.open);
      await bereit(seite);
      d = path.join(roh, `zustand-kasse-${breite}-${THEMEN[thema]}.png`);
      await seite.screenshot({ path: d });
      zustaende.push([`Checkout, ${breite} px, ${THEMEN[thema]}`, d, breite > 900 ? 560 : 280]);
      await ctx.close();
    }
    // Sprach-Hinweis: englischer Browser auf Deutsch, deutscher Browser auf Englisch
    for (const [sprache, adresse, text] of [['en-US', 'kaufen/', 'Hinweis englisch auf /kaufen/'], ['de-CH', 'en/buy/', 'Hinweis deutsch auf /en/buy/']]) {
      for (const breite of [1440, 390]) {
        ctx = await kontext(breite, thema, sprache);
        seite = await ctx.newPage();
        await seite.goto(basis + adresse, { waitUntil: 'load' });
        await bereit(seite);
        d = path.join(roh, `zustand-hinweis-${sprache}-${breite}-${THEMEN[thema]}.png`);
        await seite.screenshot({ path: d });
        zustaende.push([`${text}, ${breite} px, ${THEMEN[thema]}`, d, breite > 900 ? 560 : 280]);
        if (thema === 'light') { const f = await seite.evaluate(miss); bericht.push(`## ${text} (${breite} px)`, '', ...(f.length ? f.map((p) => `- ${p}`) : ['- nichts gefunden']), ''); stellen += f.length; }
        await ctx.close();
      }
    }
    // 404 unter /en/
    ctx = await kontext(1440, thema);
    seite = await ctx.newPage();
    await seite.goto(basis + 'en/does-not-exist/', { waitUntil: 'networkidle' });
    await bereit(seite);
    d = path.join(roh, `zustand-404-${THEMEN[thema]}.png`);
    await seite.screenshot({ path: d });
    zustaende.push([`404 unter /en/, ${THEMEN[thema]}`, d, 560]);
    await ctx.close();
  }
  await bogen(path.join(ziel, 'zustaende.png'), zustaende, 'Bedienzustände: Burger-Menü, Bag, Checkout, Sprach-Hinweis, 404');
  console.log('✓ Bedienzustände');
} finally {
  await browser.close();
  await schliessen();
}
fs.writeFileSync(path.join(ziel, 'bericht.md'), bericht.join('\n'));
console.log(`\n${stellen ? `⚠ ${stellen} Stelle(n)` : '✓ nichts übergelaufen'} · Bericht: ${path.relative(site, path.join(ziel, 'bericht.md'))}`);
