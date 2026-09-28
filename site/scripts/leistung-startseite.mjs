// LEISTUNGSTEST, kein Prüftest: misst echt, wie schnell die 3D-Bühne auf DIESEM Rechner läuft.
//
//   npm run leistung:startseite
//
// Das Ergebnis hängt an der Last des Rechners (andere Programme, Hitze, Energiesparen) und
// am Software-Rendering von headless Chrome. Darum endet dieses Skript IMMER mit Code 0 und
// schreibt bei Überraschungen nur ⚠. Es blockiert weder Build noch Deployment.
// Die Wächter-Regeln prüfen deterministisch: pruefe:waechter (ohne Browser) und
// pruefe:startseite (im Browser mit künstlichen Bildzeiten).
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';

const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-vsync', '--disable-frame-rate-limit'];
const browser = await chromium.launch({ args: ARGS });
const { basis, schliessen } = await starteServer();

const melde = (name, ok, info) => console.log(`${ok ? '✓' : '⚠'} ${name}  (${info})`);
const zustand = (seite) => seite.evaluate(() => {
  const e = document.querySelector('[data-buehne3d]');
  return { modus: e.dataset.modus, grund: e.dataset.grund ?? null, ms: e.querySelector('canvas')?.dataset.msProBild ?? null };
});
const warte = (seite, f, ms = 30000) => seite.waitForFunction(f, null, { timeout: ms }).then(() => true).catch(() => false);
// Blockiert jeden requestAnimationFrame-Rückruf echt (Rechenschleife), wie ein überfordertes Gerät
const BREMSE = (ms) => {
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (f) => raf((t) => { const ende = performance.now() + ms; while (performance.now() < ende); f(t); });
};

async function lauf(bremse) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const seite = await ctx.newPage();
  if (bremse) await seite.addInitScript(BREMSE, bremse);
  await seite.goto(basis + '?3d=software', { waitUntil: 'load' });
  // Stoppuhr ab dem Moment, in dem 3D läuft (Laden von three.js zählt nicht)
  await warte(seite, () => {
    const e = document.querySelector('[data-buehne3d]');
    return e.dataset.modus === '3d' || !!e.dataset.grund; // 3D läuft, oder schon 2D entschieden
  });
  const t0 = Date.now();
  // Entschieden: 3D mit festgehaltenem Median, oder 2D mit Grund
  await warte(seite, () => {
    const e = document.querySelector('[data-buehne3d]');
    return (e.dataset.modus === '2d' && e.dataset.grund) || e.querySelector('canvas')?.dataset.msProBild;
  });
  const r = { ...(await zustand(seite)), sekunden: (Date.now() - t0) / 1000 };
  await ctx.close();
  return r;
}

console.log('\n── Leistung 3D-Bühne (echte Messung, Software-Grafik, blockiert nichts) ──');
try {
  const frei = await lauf(0);
  melde('ohne Bremse: Median pro Bild', frei.modus === '3d', frei.ms ? `${frei.ms} ms, modus=${frei.modus}` : `modus=${frei.modus}, grund=${frei.grund}`);
  const zaeh = await lauf(60);
  melde('60 ms Bremse pro Bild: Wächter schaltet auf 2D', zaeh.grund === 'zu-langsam', `grund=${zaeh.grund}, nach ${zaeh.sekunden.toFixed(1)} s`);
  const sehrZaeh = await lauf(200);
  melde('200 ms Bremse pro Bild: Notbremse schnell', sehrZaeh.grund === 'zu-langsam' && sehrZaeh.sekunden < 2.5, `grund=${sehrZaeh.grund}, nach ${sehrZaeh.sekunden.toFixed(1)} s`);
} catch (e) {
  console.log(`⚠ Leistungstest abgebrochen: ${e.message}`);
} finally {
  await browser.close();
  await schliessen();
}
console.log('\nNur zur Information. Deterministische Prüfung: npm run pruefe:waechter, npm run pruefe:startseite');
process.exit(0);
