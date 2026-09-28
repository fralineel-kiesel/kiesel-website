// Lighthouse für jede öffentliche Seite: Leistung und Barrierefreiheit, Handy und Desktop.
//
//   npm run lighthouse            (LAEUFE=1 npm run lighthouse für einen schnellen Durchgang)
//
// Handy = Lighthouse-Standard: simuliert ein Mittelklasse-Handy mit langsamem 4G und 4-fach
// gebremster CPU. Desktop = Lighthouse-Desktop-Einstellung (schnelle Leitung, kaum gebremst).
// Leistungswerte schwanken von Lauf zu Lauf, darum pro Seite LAEUFE Läufe und davon der Median.
// Gemessen wird der fertige Build (dist/) über den Mini-Server mit gzip, wie auf GitHub Pages.
// Ausgabe: scripts/ausgabe/lighthouse/bericht.md (Tabelle), ergebnisse.json, <seite>-<gerät>.html
//
// Achtung: Zahlen aus einem Rechner ohne Grafikkarte (z.B. Cloud-Container) sind Richtwerte.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { OEFFENTLICH } from './seiten.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const ziel = path.join(hier, 'ausgabe', 'lighthouse');
fs.mkdirSync(ziel, { recursive: true });
const LAEUFE = Number(process.env.LAEUFE || 3);
const KATEGORIEN = ['performance', 'accessibility'];
const name = (adresse) => adresse.replace(/\/$/, '').replace(/\//g, '-') || 'startseite';
const median = (liste, f) => [...liste].sort((a, b) => f(a) - f(b))[Math.floor(liste.length / 2)];

const { basis, schliessen } = await starteServer();
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'] });
const ergebnisse = [];
try {
  for (const [adresse, titel] of OEFFENTLICH) {
    const zeile = { adresse, titel };
    for (const [geraet, config] of [['handy', undefined], ['desktop', desktopConfig]]) {
      const laeufe = [];
      for (let i = 0; i < LAEUFE; i++) {
        const r = await lighthouse(basis + adresse, { port: chrome.port, output: 'html', onlyCategories: KATEGORIEN, logLevel: 'error' }, config);
        laeufe.push(r);
      }
      const r = median(laeufe, (x) => x.lhr.categories.performance.score);
      const lhr = r.lhr;
      fs.writeFileSync(path.join(ziel, `${name(adresse)}-${geraet}.html`), r.report);
      const a = lhr.audits;
      zeile[geraet] = {
        leistung: Math.round(lhr.categories.performance.score * 100),
        barrierefreiheit: Math.round(lhr.categories.accessibility.score * 100),
        alleLeistung: laeufe.map((x) => Math.round(x.lhr.categories.performance.score * 100)),
        fcp: a['first-contentful-paint'].numericValue, lcp: a['largest-contentful-paint'].numericValue,
        tbt: a['total-blocking-time'].numericValue, cls: a['cumulative-layout-shift'].numericValue,
        // Barrierefreiheit: was nicht bestanden ist
        a11yFehler: Object.values(lhr.categories.accessibility.auditRefs)
          .map((ref) => a[ref.id]).filter((x) => x && x.score !== null && x.score < 1 && x.scoreDisplayMode === 'binary').map((x) => x.id),
      };
      console.log(`${titel.padEnd(24)} ${geraet.padEnd(8)} Leistung ${String(zeile[geraet].leistung).padStart(3)} (${zeile[geraet].alleLeistung.join('/')})  Barrierefreiheit ${zeile[geraet].barrierefreiheit}${zeile[geraet].a11yFehler.length ? '  ✗ ' + zeile[geraet].a11yFehler.join(', ') : ''}`);
    }
    ergebnisse.push(zeile);
  }
} finally {
  await chrome.kill();
  await schliessen();
}

// Bericht als Markdown-Tabelle
const s = (ms) => (ms / 1000).toFixed(1) + ' s';
const tabelle = [
  '| Seite | Leistung Handy | Barrierefreiheit Handy | Leistung Desktop | Barrierefreiheit Desktop | LCP Handy | TBT Handy | CLS Handy |',
  '|---|---:|---:|---:|---:|---:|---:|---:|',
  ...ergebnisse.map((e) => `| ${e.titel} | ${e.handy.leistung} | ${e.handy.barrierefreiheit} | ${e.desktop.leistung} | ${e.desktop.barrierefreiheit} | ${s(e.handy.lcp)} | ${Math.round(e.handy.tbt)} ms | ${e.handy.cls.toFixed(3)} |`),
];
const fehlerListe = ergebnisse.flatMap((e) => ['handy', 'desktop'].flatMap((g) => e[g].a11yFehler.map((f) => `- ${e.titel} (${g}): ${f}`)));
const bericht = `# Lighthouse, ${new Date().toISOString().slice(0, 10)}\n\nMedian aus ${LAEUFE} Läufen pro Seite und Gerät (Leistung). Handy: simuliertes Mittelklasse-Handy mit langsamem 4G.\n\n${tabelle.join('\n')}\n\n## Nicht bestandene Barrierefreiheits-Prüfungen\n\n${fehlerListe.join('\n') || 'keine'}\n`;
fs.writeFileSync(path.join(ziel, 'bericht.md'), bericht);
fs.writeFileSync(path.join(ziel, 'ergebnisse.json'), JSON.stringify(ergebnisse, null, 1));
console.log('\n' + bericht);
