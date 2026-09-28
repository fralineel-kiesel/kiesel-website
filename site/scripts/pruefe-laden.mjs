// Prüft das Ladeverhalten aller öffentlichen Seiten im echten Browser:
//
//   npm run pruefe:laden
//
// 1. Layoutsprünge (CLS): Jede Seite bei 1440 und 390 px, einmal normal und einmal mit
//    gebremster Leitung (Schriften kommen dann sicher erst nach dem ersten Bild, der
//    ungünstigste Fall für font-display: swap). Gezählt wird alles bis 2 s nach dem Laden
//    und danach beim Durchscrollen (ohne Eingabe, also nur Sprünge, die niemand ausgelöst hat).
//    Grenze: 0.02 (Google nennt unter 0.1 „gut“, wir wollen praktisch keine).
// 2. Nur laden, was gebraucht wird: der Zeichen-Motor nur auf Seiten, die im Browser neu
//    zeichnen, three.js nie ohne Grafikkarte (dass es nur die Startseite lädt, prüft pruefe:startseite).
// 3. Warenkorb: Zeichen-Motor bei leerem Warenkorb nicht geladen, bei Artikeln im Leerlauf,
//    beim Öffnen der Schublade sofort. Der Zähler in der Kopfzeile stimmt sofort, auch wenn
//    der Zeichen-Motor gar nicht kommt (Anfrage blockiert).
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { OEFFENTLICH } from './seiten.mjs';

const CLS_MAX = 0.02;
const MOTOR = /\/phone\.[\w-]+\.js$/;   // Zeichen-Motor (src/lib/kiesel-draw/phone.js)
const DREI_D = /\/buehne\.[\w-]+\.js$/; // three.js
// Seiten, die den Zeichen-Motor beim Laden selbst brauchen: Sie zeichnen Handys bei jeder
// Wahl im Browser neu (Farbwähler, LED, Hülle, Konfigurator). Alle anderen zeichnen nur im Build.
// (Die Menü-Handys holen ihn erst beim Öffnen, das prüft pruefe:ganz.)
const MIT_MOTOR = ['', 'funktionen/', 'zubehoer/', 'zubehoer/huelle/', 'kaufen/'];

// --font-render-hinting=none: Chrome unter Linux rastet Schriftgrössen sonst auf ganze Pixel ein
// (size-adjust 100.7 % und 102 % ergeben dieselbe Breite wie 100 %, 105 % springt um 8 %).
// macOS, iOS, Android und Windows setzen Schrift stufenlos, so misst der Test wie dort.
const browser = await chromium.launch({ args: ['--font-render-hinting=none'] });
const { basis, schliessen } = await starteServer();
let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

// Merkt sich alle Layoutsprünge ohne vorherige Eingabe, von Anfang an
const SPRUENGE = () => {
  window.__spruenge = [];
  new PerformanceObserver((liste) => {
    for (const e of liste.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__spruenge.push({ wert: e.value, zeit: Math.round(e.startTime), quellen: (e.sources ?? []).map((q) => q.node?.nodeName + (q.node?.className ? '.' + String(q.node.className).split(' ')[0] : '')).join(' ') });
    }
  }).observe({ type: 'layout-shift', buffered: true });
};

async function oeffne(adresse, { breite = 1440, langsam = false, vorher } = {}) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: breite > 900 ? 900 : 844 }, reducedMotion: 'no-preference' });
  const seite = await ctx.newPage();
  const anfragen = [];
  seite.on('request', (r) => anfragen.push(new URL(r.url()).pathname));
  await seite.addInitScript(SPRUENGE);
  if (vorher) await seite.addInitScript(vorher);
  if (langsam) {
    const cdp = await ctx.newCDPSession(seite);
    await cdp.send('Network.enable');
    // etwa langsames 4G: 150 ms Wartezeit, 1.6 Mbit/s
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200 * 1024, uploadThroughput: 90 * 1024 });
  }
  await seite.goto(basis + adresse, { waitUntil: 'load', timeout: 60000 });
  return { seite, ctx, anfragen };
}

const summe = (s) => s.reduce((a, x) => a + x.wert, 0);

try {
  console.log('── Layoutsprünge (CLS) ──');
  for (const [adresse, name] of OEFFENTLICH) {
    for (const breite of [1440, 390]) {
      const werte = [];
      let details = [];
      for (const langsam of [false, true]) {
        const { seite, ctx } = await oeffne(adresse, { breite, langsam });
        await seite.evaluate(() => document.fonts.ready);
        await seite.waitForTimeout(2000);
        const beimLaden = await seite.evaluate(() => window.__spruenge);
        // Durchscrollen in Bildschirmhöhen, wie jemand, der die Seite liest
        await seite.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
        });
        await seite.waitForTimeout(500);
        const alle = await seite.evaluate(() => window.__spruenge);
        werte.push(summe(beimLaden), summe(alle) - summe(beimLaden));
        if (summe(alle) > CLS_MAX) details = details.concat(alle.map((s) => `${s.wert.toFixed(3)}@${s.zeit}ms ${s.quellen}`));
        await ctx.close();
      }
      const [laden, scrollen, ladenLangsam, scrollenLangsam] = werte;
      pruefe(`${name} ${breite} px: keine Layoutsprünge (≤ ${CLS_MAX})`, werte.every((w) => w <= CLS_MAX),
        `Laden ${laden.toFixed(3)}, langsame Leitung ${ladenLangsam.toFixed(3)}, Scrollen ${scrollen.toFixed(3)}/${scrollenLangsam.toFixed(3)}${details.length ? ' | ' + details.slice(0, 4).join('; ') : ''}`);
    }
  }

  console.log('\n── Nur laden, was gebraucht wird ──');
  for (const [adresse, name] of OEFFENTLICH) {
    const { seite, ctx, anfragen } = await oeffne(adresse);
    await seite.waitForTimeout(2500); // Leerlauf abwarten (3D, Warenkorb laden dort nach)
    const motor = anfragen.some((p) => MOTOR.test(p));
    const dreiD = anfragen.some((p) => DREI_D.test(p));
    const motorSoll = MIT_MOTOR.includes(adresse);
    pruefe(`${name}: Zeichen-Motor ${motorSoll ? 'geladen (die Seite zeichnet selbst)' : 'nicht geladen'}, three.js nie (headless = kein 3D)`,
      motor === motorSoll && !dreiD, `Motor ${motor}, three.js ${dreiD}`);
    await ctx.close();
  }

  console.log('\n── Warenkorb und Zeichen-Motor ──');
  const MIT_ARTIKEL = () => { try { localStorage.setItem('kiesel-warenkorb', JSON.stringify([{ art: 'handy', modell: 'pro', farbe: 'Himmelblau', speicher: '512gb', anzahl: 2 }])); } catch {} };
  {
    // Leer: Motor kommt erst beim Öffnen der Schublade, dann ist die Schublade leer (kein Bild nötig)
    const { seite, ctx, anfragen } = await oeffne('faq/');
    await seite.waitForTimeout(2500);
    pruefe('Leerer Warenkorb: Zeichen-Motor nicht geladen', !anfragen.some((p) => MOTOR.test(p)));
    const zahl = await seite.locator('[data-warenkorb-knopf]').first().getAttribute('aria-label');
    pruefe('Leerer Warenkorb: Zähler sagt „leer“', zahl === 'Warenkorb, leer', zahl);
    await seite.locator('button[data-warenkorb-knopf]').first().click();
    await seite.waitForFunction(() => performance.getEntriesByType('resource').some((e) => /\/phone\.[\w-]+\.js$/.test(e.name)), null, { timeout: 5000 }).catch(() => {});
    pruefe('Leerer Warenkorb: erstes Öffnen der Schublade holt den Zeichen-Motor', anfragen.some((p) => MOTOR.test(p)));
    await ctx.close();
  }
  {
    // Maus auf den Warenkorb-Knopf: schon vorab laden
    const { seite, ctx, anfragen } = await oeffne('faq/');
    await seite.waitForTimeout(1000);
    await seite.locator('button[data-warenkorb-knopf]').first().hover();
    await seite.waitForTimeout(500);
    pruefe('Maus auf dem Warenkorb-Knopf: Zeichen-Motor wird vorab geholt', anfragen.some((p) => MOTOR.test(p)));
    await ctx.close();
  }
  {
    // Mit Artikeln: Motor im Leerlauf, Bilder in der Schublade gezeichnet
    const { seite, ctx, anfragen } = await oeffne('faq/', { vorher: MIT_ARTIKEL });
    const sofort = await seite.locator('[data-warenkorb-knopf]').first().getAttribute('aria-label');
    await seite.waitForFunction(() => document.querySelector('[data-schublade] [data-bild] svg'), null, { timeout: 8000 }).catch(() => {});
    pruefe('Mit Artikeln: Zähler sofort richtig', sofort === 'Warenkorb, 2 Artikel', sofort);
    pruefe('Mit Artikeln: Zeichen-Motor im Leerlauf geladen, Vorschaubild in der Schublade gezeichnet',
      anfragen.some((p) => MOTOR.test(p)) && await seite.locator('[data-schublade] [data-bild] svg').count() === 1);
    await ctx.close();
  }
  {
    // Motor kommt nie (Anfrage blockiert): Zähler stimmt trotzdem, Schublade zeigt die Zeile
    // ohne Bild, ohne Fehler, und das Bildfeld behält seine Grösse
    const { seite, ctx } = await (async () => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const seite = await ctx.newPage();
      await seite.route(MOTOR, (r) => r.abort());
      await seite.addInitScript(MIT_ARTIKEL);
      await seite.goto(basis + 'faq/', { waitUntil: 'load' });
      return { seite, ctx };
    })();
    const fehlerListe = [];
    seite.on('pageerror', (e) => fehlerListe.push(e.message));
    await seite.waitForTimeout(1500);
    const zahl = await seite.locator('[data-warenkorb-knopf]').first().getAttribute('aria-label');
    await seite.locator('button[data-warenkorb-knopf]').first().click();
    await seite.waitForTimeout(500);
    const zeile = await seite.evaluate(() => {
      const li = document.querySelector('[data-schublade] li[data-id]');
      const bild = li?.querySelector('[data-bild]').getBoundingClientRect();
      return { name: li?.querySelector('[data-name]').textContent, preis: li?.querySelector('[data-preis]').textContent, bild: bild ? `${bild.width}×${bild.height}` : null };
    });
    pruefe('Ohne Zeichen-Motor: Zähler richtig, Zeile mit Name und Preis, leeres Bildfeld 64×64, keine Fehler',
      zahl === 'Warenkorb, 2 Artikel' && zeile.name === 'Kiesel 1 Pro' && /CHF/.test(zeile.preis) && zeile.bild === '64×64' && fehlerListe.length === 0,
      `${zahl}; ${JSON.stringify(zeile)}; ${fehlerListe.join(' | ')}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
