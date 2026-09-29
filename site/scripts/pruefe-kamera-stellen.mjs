// Prüft, dass die Kamera-Stellen nicht wieder auseinanderlaufen (Playwright + Chromium):
//
//   npm run pruefe:kamera-stellen
//
// 1. Ein Zoom-Bild für alle: Teaser (Startseite), /funktionen/, /kiesel-1/ und /kiesel-1-pro/
//    rechnen mit derselben Unschärfe-Kurve, derselben Linsenlogik und denselben Labels.
//    Kern: Der Teaser bei 10x hat dieselbe berechnete Unschärfe wie /funktionen/ bei 10x.
// 2. Versteckte Details nur auf /funktionen/: sonst keine Vorschaubilder, kein Zähler, kein
//    Fokusring, kein Hinweis im Text, und Ziehen im Bild verschiebt nichts. Auf /funktionen/
//    klappt das Verschieben mit der Maus und mit dem Finger (Handy).
// 3. Sprungziele: „Zoom ausprobieren“ landet auf /funktionen/#kamera, Titel und Kamera-Bild
//    ganz sichtbar. Alle anderen Links auf einen Abschnitt landen knapp unter der klebenden Leiste.
// 4. Makro: Wechsel Ultraweit ↔ Tele skaliert den Hintergrund deutlich, die Blume bleibt
//    innerhalb ±15 % gleich breit; Übergang ca. 450 ms, bei „weniger Bewegung“ sofort; der
//    Fokuspunkt wirkt in beiden Linsen. Kiesel 1: 1x ↔ Makro, keine Tele.
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { UNSCHAERFE, linsenText, stufenText } from '../src/lib/kamera.js';
import { TELE_AB, MAX_ZOOM, MEGAPIXEL, MAKRO } from '../src/data/kamera.js';
import { WERTE } from '../src/data/technik.js';

const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
let fehler = 0;

function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

const DESKTOP = { viewport: { width: 1440, height: 900 } };
const HANDY = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

async function oeffne(adresse, kontext = DESKTOP) {
  const ctx = await browser.newContext(kontext);
  const seite = await ctx.newPage();
  const status = { fehler: [] };
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  await seite.evaluate(() => document.fonts.ready);
  return { seite, ctx, status };
}

// Zustand des Zoom-Bilds: Motor, Label und die wirklich gesetzte CSS-Unschärfe, zurückgerechnet
// auf 600 px Bildbreite (so rechnet kamera-zoom.js: px = Wert × max(B, H × 1.6) / 600)
const bildZustand = (seite, sel = '[data-zoom-bild]') => seite.evaluate((sel) => {
  const b = document.querySelector(sel);
  const fak = Math.max(b.clientWidth, b.clientHeight * 1.6) / 600;
  const css = Object.fromEntries([...b.querySelectorAll('[data-ebene]')].map((e) => [e.dataset.ebene, Number(/blur\(([\d.]+)px\)/.exec(e.style.filter)?.[1] ?? 0) / fak]));
  return { ...b.kamera.zustand(), css, label: b.querySelector('[data-linsen-text]')?.textContent ?? null };
}, sel);

// Zoomstufe über die echte Bedienung wählen und die Fahrt abwarten
async function waehle(seite, stufe) {
  await seite.locator(`[data-kamera] [data-stufe="${stufe}"]`).first().click();
  await seite.waitForTimeout(1100);
}

try {
  console.log('\n── Daten ──');
  pruefe('TELE_AB, MAX_ZOOM und MEGAPIXEL (kamera.js) = WERTE.tele, WERTE.zoomDigital und WERTE.megapixel (technik.js)',
    TELE_AB === WERTE.tele && MAX_ZOOM.k1 === WERTE.zoomDigital.k1 && MAX_ZOOM.pro === WERTE.zoomDigital.pro && MEGAPIXEL === WERTE.megapixel);

  console.log('\n── 1. Ein Zoom-Bild für alle ──');
  for (const [name, kontext] of [['Desktop', DESKTOP], ['Handy', HANDY]]) {
    const start = await oeffne('', kontext);
    const funk = await oeffne('funktionen/', kontext);
    await start.seite.locator('[data-zoom-bild]').scrollIntoViewIfNeeded();
    await funk.seite.locator('[data-zoom-bild]').scrollIntoViewIfNeeded();
    for (const z of [0.5, 1, 3, 10]) {
      await waehle(start.seite, z);
      await waehle(funk.seite, z);
      const a = await bildZustand(start.seite), b = await bildZustand(funk.seite);
      const soll = UNSCHAERFE[a.linse](z);
      const gleich = (x, y) => Math.abs(x - y) < 0.02;
      pruefe(`${name} ${z}x: Teaser = /funktionen/ (Linse ${a.linse}, Label „${a.label}“, Unschärfe ${soll.toFixed(2)} px @600)`,
        a.z === z && b.z === z && a.linse === b.linse && a.label === b.label && a.label === linsenText('pro', z, a.linse)
        && gleich(a.unschaerfe[a.linse], b.unschaerfe[b.linse]) && gleich(a.css[a.linse], soll) && gleich(b.css[b.linse], soll),
        `Teaser ${a.linse} ${a.css[a.linse].toFixed(3)} „${a.label}“ | /funktionen/ ${b.linse} ${b.css[b.linse].toFixed(3)} „${b.label}“`);
    }
    const zehn = await bildZustand(start.seite);
    pruefe(`${name}: Teaser bei 10x ist sichtbar weich (nicht mehr gestochen scharf)`, zehn.linse === 'tele' && zehn.css.tele > 2, `${zehn.css.tele.toFixed(2)} px @600`);
    await start.ctx.close();
    await funk.ctx.close();
  }
  {
    // Kiesel 1 (eigene Demo) und die Kiesel-1-Hälfte im Vergleich: gleiche Kurve, gleiches Label
    const k1 = await oeffne('kiesel-1/');
    const pro = await oeffne('kiesel-1-pro/');
    await waehle(k1.seite, 5);
    await waehle(pro.seite, 5);
    const a = await bildZustand(k1.seite), b = await bildZustand(pro.seite);
    const chip = await pro.seite.locator('[data-text="k1"]').textContent();
    pruefe('Kiesel 1 bei 5x: Demo auf /kiesel-1/ = linke Hälfte im Vergleich (Unschärfe und Label)',
      Math.abs(a.css.haupt - UNSCHAERFE.k1(5)) < 0.02 && Math.abs(b.css.k1 - UNSCHAERFE.k1(5)) < 0.02 && a.label === linsenText('k1', 5) && chip === `Kiesel 1 · ${stufenText('k1', 5)}` && a.label.endsWith(stufenText('k1', 5)),
      `/kiesel-1/ ${a.css.haupt.toFixed(2)} „${a.label}“, Vergleich ${b.css.k1.toFixed(2)} „${chip}“`);
    pruefe('/kiesel-1/: keine Tele-Ebene, höchstens 5x', (await k1.seite.locator('[data-ebene="tele"]').count()) === 0 && !(await k1.seite.locator('[data-stufe="10"]').count()));
    await waehle(pro.seite, 10);
    const c = await bildZustand(pro.seite);
    const proChip = await pro.seite.locator('[data-text="pro"]').textContent();
    pruefe('Pro bei 10x im Vergleich: Tele mit derselben Unschärfe wie überall', c.linse === 'tele' && Math.abs(c.css.tele - UNSCHAERFE.tele(10)) < 0.02 && proChip === `Kiesel 1 Pro · ${stufenText('pro', 10)}`, `${c.css.tele.toFixed(2)} „${proChip}“`);
    pruefe('Keine Skriptfehler', k1.status.fehler.length + pro.status.fehler.length === 0, [...k1.status.fehler, ...pro.status.fehler].join(' | '));
    await k1.ctx.close();
    await pro.ctx.close();
  }

  console.log('\n── 2. Versteckte Details nur auf /funktionen/ ──');
  const DETAIL = '[data-detail], [data-entdeckt], [data-fundpunkt], [data-fokusring], [data-fundname], [data-details]';
  for (const adresse of ['', 'kiesel-1/', 'kiesel-1-pro/']) {
    const { seite, ctx, status } = await oeffne(adresse);
    const anzahl = await seite.locator(DETAIL).count();
    const text = await seite.locator('main').innerText();
    const hinweis = /entdeckt|Noch versteckt|Seilschaft/.test(text);
    const api = await seite.evaluate(() => { const k = document.querySelector('[data-zoom-bild]').kamera; return { fliegen: 'fliegeZu' in k, details: k.zustand().details }; });
    pruefe(`${adresse || 'Startseite'}: keine Elemente der Detail-Suche, kein Hinweis im Text`, anzahl === 0 && !hinweis && !api.fliegen && !api.details, `${anzahl} Elemente, Hinweis ${hinweis}, ${JSON.stringify(api)}`);
    // Ziehen im Bild verschiebt nichts (auf der Pro-Seite gehört Ziehen der Trennlinie)
    const bild = seite.locator('[data-zoom-bild]');
    await bild.scrollIntoViewIfNeeded();
    const vorher = (await bildZustand(seite)).blick;
    const r = await bild.boundingBox();
    await seite.mouse.move(r.x + r.width * 0.6, r.y + r.height / 2);
    await seite.mouse.down();
    await seite.mouse.move(r.x + r.width * 0.3, r.y + r.height * 0.3, { steps: 8 });
    await seite.mouse.up();
    await seite.waitForTimeout(600);
    const nachher = (await bildZustand(seite)).blick;
    pruefe(`${adresse || 'Startseite'}: Ziehen im Bild verschiebt den Ausschnitt nicht`, nachher[0] === vorher[0] && nachher[1] === vorher[1], `${vorher} → ${nachher}`);
    pruefe(`${adresse || 'Startseite'}: keine Skriptfehler`, status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('funktionen/');
    const n = {
      vorschau: await seite.locator('[data-kamera-suche] [data-detail]').count(),
      zaehler: await seite.locator('[data-kamera-suche] [data-entdeckt]').count(),
      ring: await seite.locator('[data-kamera-suche] [data-fokusring]').count(),
    };
    pruefe('/funktionen/: 8 Vorschaubilder, Zähler, Fokusring', n.vorschau === 8 && n.zaehler === 1 && n.ring === 1, JSON.stringify(n));
    const bild = seite.locator('[data-zoom-bild]');
    await bild.scrollIntoViewIfNeeded();
    await seite.evaluate(() => document.querySelector('[data-zoom-bild]').kamera.setzeZoom(5));
    await seite.waitForTimeout(300);
    const vorher = (await bildZustand(seite)).blick;
    const r = await bild.boundingBox();
    await seite.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await seite.mouse.down();
    await seite.mouse.move(r.x + r.width / 2 - 200, r.y + r.height / 2 - 100, { steps: 8 });
    await seite.mouse.up();
    await seite.waitForTimeout(300);
    const nachher = (await bildZustand(seite)).blick;
    pruefe('/funktionen/ Desktop: mit der Maus ziehen verschiebt das Bild', nachher[0] > vorher[0] + 10 && nachher[1] > vorher[1] + 5, `${vorher.map((v) => v.toFixed(0))} → ${nachher.map((v) => v.toFixed(0))}`);
    pruefe('/funktionen/: keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('funktionen/', HANDY);
    const bild = seite.locator('[data-zoom-bild]');
    await bild.scrollIntoViewIfNeeded();
    await seite.evaluate(() => document.querySelector('[data-zoom-bild]').kamera.setzeZoom(5));
    await seite.waitForTimeout(300);
    const f = await bild.boundingBox();
    const cdp = await ctx.newCDPSession(seite);
    const wisch = async (von, bis) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: von[0], y: von[1] }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: von[0] + (bis[0] - von[0]) * i / 8, y: von[1] + (bis[1] - von[1]) * i / 8 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await seite.waitForTimeout(200);
    };
    const b0 = (await bildZustand(seite)).blick;
    await wisch([f.x + f.width * 0.7, f.y + f.height / 2], [f.x + f.width * 0.3, f.y + f.height / 2]);
    const b1 = (await bildZustand(seite)).blick;
    pruefe('/funktionen/ Handy: Finger waagrecht verschiebt das Bild', b1[0] > b0[0] + 10, `${b0[0].toFixed(1)} → ${b1[0].toFixed(1)}`);
    await ctx.close();
  }

  console.log('\n── 3. Sprungziele ──');
  // Oberkante des Inhalts nach dem Sprung, gemessen an der klebenden Leiste
  const landung = (seite) => seite.evaluate(() => {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const leisten = [...document.querySelectorAll('.kopfzeile, .unterleiste')].filter((k) => getComputedStyle(k).position === 'sticky').map((k) => k.getBoundingClientRect().bottom);
    const kante = Math.max(0, ...leisten);
    // Inhalt = erstes Kind mit Höhe (die Abschnitte haben oben ein Polster)
    const inhalt = [...el.children].find((c) => c.getBoundingClientRect().height > 0) ?? el;
    return { pfad: location.pathname.replace(/^\/kiesel-website\/v2/, '') + location.hash, kante, oben: inhalt.getBoundingClientRect().top };
  });
  for (const [name, kontext] of [['Desktop', DESKTOP], ['Handy', HANDY]]) {
    const { seite, ctx } = await oeffne('', kontext);
    await seite.locator('[data-zoom-teaser] a', { hasText: 'Zoom ausprobieren' }).click();
    await seite.waitForURL(/\/funktionen\/#kamera$/);
    await seite.waitForTimeout(800);
    const l = await landung(seite);
    const sicht = await seite.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      return { titel: r('#kamera-titel').top, bildOben: r('#kamera [data-zoom-bild]').top, bildUnten: r('#kamera [data-zoom-bild]').bottom, hoehe: innerHeight };
    });
    pruefe(`${name}: „Zoom ausprobieren“ → /funktionen/#kamera, Titel unter der Kopfzeile, Kamera-Bild ganz sichtbar`,
      l.pfad === '/funktionen/#kamera' && sicht.titel >= l.kante && sicht.titel <= l.kante + 48 && sicht.bildOben >= l.kante && sicht.bildUnten <= sicht.hoehe,
      `Kopfzeile bis ${l.kante}, Titel ${sicht.titel.toFixed(0)}, Bild ${sicht.bildOben.toFixed(0)}–${sicht.bildUnten.toFixed(0)} von ${sicht.hoehe}`);
    await ctx.close();
  }
  const ANKER = [
    ['', '[data-zoom-teaser] a', 'Zoom ausprobieren', '/funktionen/#kamera'],
    ['', '.kacheln a', 'RGB-Licht', '/funktionen/#rgb'],
    ['', '.kacheln a', 'Zen-Modus', '/funktionen/#zen'],
    ['', '.kacheln a', 'Privacy-Modus', '/funktionen/#privacy'],
    ['faq/', 'a', 'Privacy-Modus ausprobieren', '/funktionen/#privacy'],
    ['faq/', 'a', 'RGB-Licht ausprobieren', '/funktionen/#rgb'],
    ['funktionen/', '.anker a', 'Kamera entdecken', '/funktionen/#kamera'],
    ['kiesel-1/', 'a', 'in fünf Farben ansehen', '/kiesel-1/#farben'],
    ['kiesel-1-pro/', 'a', 'in fünf Farben ansehen', '/kiesel-1-pro/#farben'],
    ['faq/', 'footer a', 'Über das Konzept', '/faq/#konzept'],
  ];
  for (const [name, kontext] of [['Desktop', DESKTOP], ['Handy', HANDY]]) {
    for (const [von, sel, text, ziel] of ANKER) {
      const { seite, ctx } = await oeffne(von, kontext);
      const link = seite.locator(sel, { hasText: text }).first();
      // Links in zugeklappten FAQ-Antworten und im Footer-Akkordeon des Handys: direkt folgen
      if (await link.isVisible()) await link.click();
      else await seite.goto(await link.evaluate((a) => a.href));
      await seite.waitForTimeout(800);
      const l = await landung(seite);
      pruefe(`${name} ${von || '/'} „${text}“ → ${ziel}: Inhalt knapp unter der klebenden Leiste`, l.pfad === ziel && l.oben >= l.kante && l.oben <= l.kante + 48, `${l.pfad}, Leiste bis ${l.kante.toFixed(0)}, Inhalt ab ${l.oben.toFixed(0)}`);
      await ctx.close();
    }
  }

  console.log('\n── 4. Makro: Perspektive je Linse ──');
  // Lage der Ebenen: Breite (getBoundingClientRect, ohne Filterrand) und Skalierung aus dem transform
  const ebenen = (seite) => seite.evaluate(() => Object.fromEntries(['bg', 'fl', 'bee', 'fg'].map((e) => {
    const g = document.querySelector(`[data-makro] g[filter$="c-${e})"]`);
    const sd = Number(document.querySelector(`[data-makro] filter[id$="c-${e}"] feGaussianBlur`).getAttribute('stdDeviation'));
    return [e, { breite: g.getBoundingClientRect().width, skala: Number(/matrix\(([\d.]+)/.exec(g.getAttribute('transform'))?.[1] ?? 1), unschaerfe: sd }];
  })));
  for (const [name, kontext] of [['Desktop', DESKTOP], ['Handy', HANDY]]) {
    const ctx = await browser.newContext(kontext);
    const seite = await ctx.newPage();
    await seite.clock.install({ time: new Date('2026-09-28T10:00:00') });
    await seite.goto(basis + 'kiesel-1-pro/', { waitUntil: 'load' });
    await seite.clock.pauseAt(new Date('2026-09-28T10:00:02'));
    const makro = seite.locator('[data-makro]');
    await makro.scrollIntoViewIfNeeded();
    const tele = await ebenen(seite);
    const chipTele = await seite.locator('[data-makro-text]').textContent();
    await seite.locator('[data-linse-knopf="weit"]').click();
    await seite.clock.runFor(225);
    const mitte = await ebenen(seite);
    await seite.clock.runFor(400);
    const weit = await ebenen(seite);
    const chipWeit = await seite.locator('[data-makro-text]').textContent();
    const faktor = tele.bg.skala / weit.bg.skala, blume = weit.fl.breite / tele.fl.breite;
    pruefe(`${name}: Tele → Ultraweit: Hintergrund deutlich kleiner (${tele.bg.skala} → ${weit.bg.skala}), Blume ±15 %`,
      faktor > 1.5 && blume >= 0.85 && blume <= 1.15, `Faktor ${faktor.toFixed(2)}, Blume ${(blume * 100).toFixed(1)} %`);
    pruefe(`${name}: Hintergrund in der Tele viel weicher (auch nach Skalierung)`, tele.bg.unschaerfe * tele.bg.skala > 3 * weit.bg.unschaerfe * weit.bg.skala, `${(tele.bg.unschaerfe * tele.bg.skala).toFixed(1)} vs ${(weit.bg.unschaerfe * weit.bg.skala).toFixed(1)}`);
    pruefe(`${name}: weicher Übergang (nach 225 ms mittendrin, nach 625 ms fertig)`, mitte.bg.skala < tele.bg.skala - 0.1 && mitte.bg.skala > weit.bg.skala + 0.05, `${mitte.bg.skala}`);
    pruefe(`${name}: Labels „${MAKRO.pro.linsen.tele.chip}“ und „${MAKRO.pro.linsen.weit.chip}“`, chipTele === MAKRO.pro.linsen.tele.chip && chipWeit === MAKRO.pro.linsen.weit.chip, `${chipTele} / ${chipWeit}`);
    // Fokuspunkt in beiden Linsen: Biene antippen
    for (const linse of ['weit', 'tele']) {
      await seite.locator(`[data-linse-knopf="${linse}"]`).click();
      await seite.clock.runFor(600);
      const b = await seite.locator('[data-makro] g[filter$="c-bee)"]').boundingBox();
      await seite.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await seite.clock.runFor(600);
      const e = await ebenen(seite);
      const gedrueckt = await seite.locator('[data-fokus-ebene][aria-pressed="true"]').textContent();
      pruefe(`${name} ${linse}: Tipp auf die Biene stellt sie scharf, die Blume wird weich`, e.bee.unschaerfe < 0.1 && e.fl.unschaerfe > 1 && gedrueckt === 'Biene', `Biene ${e.bee.unschaerfe}, Blume ${e.fl.unschaerfe}`);
      await seite.locator('[data-fokus-ebene="fl"]').click();
      await seite.clock.runFor(600);
    }
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('kiesel-1-pro/', { ...DESKTOP, reducedMotion: 'reduce' });
    await seite.locator('[data-makro]').scrollIntoViewIfNeeded();
    await seite.locator('[data-linse-knopf="weit"]').click();
    await seite.waitForTimeout(50);
    const e = await ebenen(seite);
    pruefe('Weniger Bewegung: Linsenwechsel ohne Animation', e.bg.skala === MAKRO.pro.linsen.weit.skala.bg, String(e.bg.skala));
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('kiesel-1/');
    await seite.locator('[data-makro]').scrollIntoViewIfNeeded();
    const knoepfe = await seite.locator('[data-linse-knopf]').allTextContents();
    const makro = await ebenen(seite);
    await seite.locator('[data-linse-knopf="normal"]').click();
    await seite.waitForTimeout(800);
    const normal = await ebenen(seite);
    const chip = await seite.locator('[data-makro-text]').textContent();
    pruefe('Kiesel 1: nur „1x“ und „Makro“ (keine Tele), 1x zeigt die Blume kleiner', knoepfe.join('|') === '1x|Makro' && normal.fl.breite < 0.7 * makro.fl.breite && chip === MAKRO.k1.linsen.normal.chip, `${knoepfe.join(', ')}; Blume ${(normal.fl.breite / makro.fl.breite * 100).toFixed(0)} %; „${chip}“`);
    pruefe('Kiesel 1: keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
