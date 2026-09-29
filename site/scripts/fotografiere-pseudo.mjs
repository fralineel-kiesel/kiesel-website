// Pseudo-Sprache „lang“: jeder Text aus src/i18n/de.js ist rund 30 % länger (⟦Kaufenka⟧), wie es
// eine andere Sprache gern ist. Zeigt, wo die Seite dann überläuft (Vorbereitung Etappe 9b).
//
//   npm run fotos:pseudo            baut dist-pseudo-lang/ und fotografiert
//   … -- --ohne-build               vorhandenen Pseudo-Build benutzen
//
// Je Seite bei 1440 und 390 px: ganzseitiges Foto nach scripts/ausgabe/pseudo/ und ein Bericht
// (bericht.md) mit dem, was sich messen lässt:
//   - die Seite scrollt seitlich (breiter als das Fenster)
//   - ein Element mit Text ist breiter als sein Kasten und schneidet ab (overflow ≠ visible)
//     oder ragt über den Rand seines Elternelements hinaus
// Kein Prüftest: endet immer mit Code 0. Die Liste ist ein Arbeitsvorrat für 9b.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from './dist-server.mjs';
import { OEFFENTLICH } from './seiten.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(hier, '..');
const aus = path.join(hier, 'ausgabe', 'pseudo');
fs.mkdirSync(aus, { recursive: true });

if (!process.argv.includes('--ohne-build')) {
  console.log('Pseudo-Build „lang“ …');
  execFileSync(process.execPath, [path.join(site, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build'],
    { cwd: site, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, KIESEL_PSEUDO: 'lang' } });
}

function miss() {
  const probleme = [];
  const b = document.documentElement.scrollWidth, w = innerWidth;
  if (b > w + 1) probleme.push(`Seite scrollt seitlich: ${b} px breit bei ${w} px Fenster`);
  const name = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {
    // Nur für Screenreader (.vh: absichtlich 1 px gross) zählt nicht, SVG-Text auch nicht
    if (!el.checkVisibility?.() || !el.textContent.trim() || el.closest('svg, .vh')) continue;
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
    if (!eigenerText) continue;
    const s = getComputedStyle(el);
    const text = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (el.scrollWidth > el.clientWidth + 1 && s.overflowX !== 'visible') probleme.push(`abgeschnitten: ${name(el)} „${text}“ (${el.scrollWidth} statt ${el.clientWidth} px)`);
    const e = el.getBoundingClientRect(), p = el.parentElement?.getBoundingClientRect();
    if (p && p.width > 0 && e.right > p.right + 2 && getComputedStyle(el.parentElement).overflowX === 'visible' && e.width < w) {
      probleme.push(`ragt heraus: ${name(el)} „${text}“ (${Math.round(e.right - p.right)} px über ${name(el.parentElement)})`);
    }
  }
  return [...new Set(probleme)];
}

const { basis, schliessen } = await starteServer({ ordner: path.join(site, 'dist-pseudo-lang') });
const browser = await chromium.launch();
const bericht = ['# Pseudo-Sprache „lang“ (+30 %): Überläufe', '', 'Gemessen mit `npm run fotos:pseudo`. Fotos im selben Ordner.', ''];
for (const breite of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 }, reducedMotion: 'reduce', ...(breite < 900 ? { isMobile: true, hasTouch: true } : {}) });
  bericht.push(`## ${breite} px`, '');
  for (const [adresse, titel] of OEFFENTLICH) {
    const seite = await ctx.newPage();
    await seite.goto(basis + adresse, { waitUntil: 'networkidle' });
    await seite.evaluate(() => document.fonts.ready);
    const datei = `${(adresse || 'startseite').replace(/\/$/, '').replace(/\//g, '-')}-${breite}.png`;
    await seite.screenshot({ path: path.join(aus, datei), fullPage: true });
    const probleme = await seite.evaluate(miss);
    bericht.push(`### /${adresse} (${titel})`, '', ...(probleme.length ? probleme.map((p) => `- ${p}`) : ['- nichts gefunden']), '');
    console.log(`${probleme.length ? '⚠' : '✓'} ${breite} px /${adresse}: ${probleme.length} Stelle(n)`);
    await seite.close();
  }
  await ctx.close();
}
await browser.close();
await schliessen();
fs.writeFileSync(path.join(aus, 'bericht.md'), bericht.join('\n'));
console.log(`\nBericht: ${path.relative(site, path.join(aus, 'bericht.md'))}`);
