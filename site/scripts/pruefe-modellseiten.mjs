// Prüft die Modellseiten /kiesel-1/ und /kiesel-1-pro/ im echten Browser (Playwright + Chromium):
//
//   npm run pruefe:modellseiten
//
// 1. Zeichen-Motor: Die Einzelteile der Akku-Story (innenteile.js) zeichnen genau dasselbe
//    wie phoneOpen() aus scene.js.
// 2. Akku-Story: Läuft die Animation wirklich mit der Scroll-Position mit? In 200 kleinen
//    Schritten durchscrollen und nach jedem Schritt Lage, Grösse und Deckkraft der wichtigsten
//    Teile messen: Der Fortschritt muss stetig steigen, und kein Teil darf zwischen zwei
//    Nachbarschritten springen. Rückwärts muss dasselbe Bild entstehen wie vorwärts.
//    Dazu echtes Mausrad-Scrollen mit Messung der Bildabstände (headless Chrome ohne
//    Grafikkarte: nur Richtwerte). Bei „weniger Bewegung“ steht der Endzustand still da.
// 3. Zoom-Vergleich: Trennlinie mit Pfeiltasten, Maus und Finger (Zoom selbst: pruefe:kamera).
//    Makro: Klick auf die Biene.
// 4. Technische Daten, keine Skriptfehler, kein three.js.
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { innenteile, phoneOpen } from '../src/lib/kiesel-draw/index.js';
import { TECHNIK } from '../src/data/technik.js';

const DREI_D = /\/buehne\.[\w-]+\.js$/;
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
let fehler = 0;

function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

async function oeffne(adresse, kontext = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { dreiD: false, fehler: [] };
  seite.on('request', (r) => { if (DREI_D.test(new URL(r.url()).pathname)) status.dreiD = true; });
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  await seite.evaluate(() => document.fonts.ready);
  return { seite, ctx, status };
}

// Scroll-Position (y) für einen Fortschritt p der Akku-Story
const spurMasse = (seite) => seite.evaluate(() => {
  const spur = document.querySelector('[data-spur]');
  const klebt = spur.querySelector('.klebt');
  return {
    anfang: spur.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(klebt).top),
    strecke: spur.offsetHeight - klebt.offsetHeight,
    hoehe: spur.offsetHeight,
  };
});
// Hinscrollen und warten, bis zwei Bilder gezeichnet sind (das Skript rechnet im nächsten Bild)
const scrolle = (seite, y) => seite.evaluate((y) => new Promise((ok) => {
  scrollTo(0, y);
  requestAnimationFrame(() => requestAnimationFrame(ok));
}), y);
// Lage, Grösse, Deckkraft der wichtigsten Teile
const TEILE = ['klinke', 'sim', 'home', 'akku', 'gehaeuse', 'platine', 'magsafe'];
const messe = (seite) => seite.evaluate((teile) => {
  const w = document.querySelector('[data-akku-story]');
  const aus = { p: Number(w.dataset.fortschritt), schritt: Number(w.dataset.schritt), teile: {} };
  const eintrag = (name, el) => {
    const r = el.getBoundingClientRect();
    aus.teile[name] = { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, o: Number(getComputedStyle(el).opacity) };
  };
  for (const t of teile) {
    const el = w.querySelector(`.ebene[data-teil="${t}"][data-rolle="${t === 'klinke' || t === 'sim' || t === 'home' ? 'weg' : t === 'akku' || t === 'platine' ? 'ziel' : t === 'gehaeuse' ? 'ziel' : 'neu'}"]`);
    if (el) eintrag(t, el);
  }
  eintrag('geraet', w.querySelector('[data-geraet]'));
  eintrag('se-vergleich', w.querySelector('[data-se-vergleich]'));
  aus.transforms = [...w.querySelectorAll('[data-geraet], .ebene, .wand')].map((e) => e.style.transform + '|' + e.style.opacity).join(';');
  return aus;
}, TEILE);

try {
  console.log('\n── Zeichen-Motor: Einzelteile = phoneOpen() ──');
  for (const kind of ['se', 'k1', 'pro']) {
    const [voll] = phoneOpen(kind, 12.3, 40, 3.4);
    const teile = innenteile(kind, 12.3, 40, 3.4).filter((t) => !['sim', 'home', 'klinke'].includes(t.id));
    const fehlend = teile.filter((t) => !voll.includes(t.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')));
    pruefe(`${kind}: ${teile.length} Teile zeichnen Zeichen für Zeichen wie phoneOpen()`, fehlend.length === 0, fehlend.map((t) => t.id).join(', '));
  }

  for (const [modell, adresse] of [['k1', 'kiesel-1/'], ['pro', 'kiesel-1-pro/']]) {
    for (const [geraet, kontext] of [['Desktop', {}], ['Handy', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
      console.log(`\n── Akku-Story ${modell}, ${geraet} ──`);
      const { seite, ctx, status } = await oeffne(adresse, kontext);
      const an = await seite.evaluate(() => document.querySelector('[data-akku-story]').dataset.scroll);
      pruefe('Scroll-Kopplung ist eingeschaltet', an === 'an');
      const m = await spurMasse(seite);
      const vh = kontext.viewport?.height ?? 900;
      pruefe('Scroll-Strecke ist mehrere Bildschirme lang', m.strecke > 3 * vh, `${Math.round(m.strecke)} px`);

      // Vorwärts in 200 Schritten
      const N = 200;
      const reihe = [];
      for (let i = 0; i <= N; i++) {
        await scrolle(seite, m.anfang + (i / N) * m.strecke);
        reihe.push(await messe(seite));
      }
      const ps = reihe.map((r) => r.p);
      const stetig = ps.every((p, i) => i === 0 || p >= ps[i - 1]);
      const linear = Math.max(...ps.map((p, i) => Math.abs(p - i / N)));
      pruefe('Fortschritt steigt stetig mit der Scroll-Position', stetig && linear < 0.01, `grösste Abweichung ${linear.toFixed(4)}`);
      pruefe('Anfang p = 0, Ende p = 1', ps[0] < 0.001 && ps[N] > 0.999, `${ps[0]} … ${ps[N]}`); // Handys scrollen in ganzen Pixeln
      const schritte = [...new Set(reihe.map((r) => r.schritt))];
      pruefe('Alle sechs Erklärschritte kommen der Reihe nach dran', schritte.join(',') === '0,1,2,3,4,5', schritte.join(','));

      // Sprünge: Veränderung jedes Teils zwischen zwei Nachbarschritten (0.5 % der Strecke).
      // „Springen“ heisst: ein Schritt ist viel grösser als die Schritte davor und danach.
      // „Tempo“: selbst gleichmässige Bewegungen dürfen nicht zu schnell sein.
      const wege = {};
      for (let i = 1; i <= N; i++) {
        for (const [name, t] of Object.entries(reihe[i].teile)) {
          const v = reihe[i - 1].teile[name];
          if (!v) continue;
          // Unsichtbare Teile dürfen sich bewegen, wie sie wollen
          const d = Math.max(t.o, v.o) > 0.05 ? Math.hypot(t.x - v.x, t.y - v.y) + Math.abs(t.w - v.w) + Math.abs(t.h - v.h) : 0;
          (wege[name] ??= { d: [], o: 0 }).d.push(d);
          wege[name].o = Math.max(wege[name].o, Math.abs(t.o - v.o));
        }
      }
      const spruenge = [];
      for (const [name, { d }] of Object.entries(wege)) {
        d.forEach((x, i) => {
          const nachbar = Math.max(d[i - 1] ?? 0, d[i + 1] ?? 0);
          if (x > 8 && x > 2.5 * nachbar) spruenge.push(`${name} bei p=${((i + 1) / N).toFixed(3)}: ${x.toFixed(0)} px, Nachbarn ${nachbar.toFixed(0)} px`);
        });
      }
      pruefe('Kein Teil springt (kein Schritt 2.5-mal grösser als seine Nachbarn)', spruenge.length === 0, spruenge.slice(0, 3).join(' | '));
      const tempo = Object.entries(wege).map(([n, w]) => [n, Math.max(...w.d)]).sort((a, b) => b[1] - a[1]);
      const grenze = 0.06 * vh; // 6 % der Bildschirmhöhe pro 0.5 % Scroll-Strecke
      pruefe(`Ruhiges Tempo (max. ${grenze.toFixed(0)} px pro 0.5 % Scroll)`, tempo[0][1] < grenze, tempo.map(([n, x]) => `${n} ${x.toFixed(0)}`).join(', '));
      const o = Math.max(...Object.values(wege).map((w) => w.o));
      pruefe('Keine harten Überblendungen (max. 0.25 Deckkraft pro Schritt)', o <= 0.25, `max. ${o.toFixed(2)}`);

      // Die Teile tun wirklich etwas
      const bei = (p) => reihe[Math.round(p * N)].teile;
      pruefe('Klinke fliegt weg (sichtbar bei 0.15, weg bei 0.3)', bei(0.15).klinke.o > 0.9 && bei(0.3).klinke.o < 0.05);
      pruefe('SIM-Schlitten fliegt weg', bei(0.3).sim.o > 0.9 && bei(0.46).sim.o < 0.05);
      pruefe('Home-Button fliegt weg', bei(0.46).home.o > 0.9 && bei(0.6).home.o < 0.05);
      const akkuVorher = bei(0.6).akku, akkuNachher = bei(0.84).akku;
      pruefe('Akku wächst (Fläche mindestens × 1.4)', akkuNachher.w * akkuNachher.h > 1.4 * akkuVorher.w * akkuVorher.h,
        `${Math.round(akkuVorher.w * akkuVorher.h)} → ${Math.round(akkuNachher.w * akkuNachher.h)} px²`);
      const gVorher = bei(0.02).geraet, gSchraeg = bei(0.4).geraet;
      pruefe('Gerät dreht in die Schrägansicht (Umriss wird breiter und flacher)', gSchraeg.w > gVorher.w * 1.2 && gSchraeg.h < gVorher.h, `${Math.round(gVorher.w)}×${Math.round(gVorher.h)} → ${Math.round(gSchraeg.w)}×${Math.round(gSchraeg.h)}`);
      pruefe('Am Schluss steht das SE daneben', bei(0.5)['se-vergleich'].o < 0.05 && bei(1)['se-vergleich'].o > 0.95 && bei(1)['se-vergleich'].x < bei(1).geraet.x);
      const zahl = await seite.evaluate(() => document.querySelector('[data-mah-zahl]').textContent);
      pruefe('mAh-Zähler steht am Ende auf dem Kiesel-Wert', zahl === (modell === 'pro' ? '3600' : '3000'), zahl);

      // Rückwärts: bei 50 % muss exakt dasselbe Bild entstehen
      await scrolle(seite, m.anfang + 0.5 * m.strecke);
      const rueck = await messe(seite);
      pruefe('Rückwärts scrollen ergibt dasselbe Bild wie vorwärts', rueck.transforms === reihe[N / 2].transforms);

      // Echtes Mausrad (nur Desktop): Bildabstände und lange Bilder messen
      if (geraet === 'Desktop') {
        await scrolle(seite, m.anfang - 200);
        await seite.mouse.move(700, 400);
        await seite.evaluate(() => {
          window.__bilder = [];
          window.__lang = [];
          window.__p = [];
          const loop = (t) => { window.__bilder.push(t); window.__p.push(Number(document.querySelector('[data-akku-story]').dataset.fortschritt)); if (window.__bilder.length < 5000) requestAnimationFrame(loop); };
          requestAnimationFrame(loop);
          try {
            new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lang.push(e.duration))).observe({ type: 'long-animation-frame', buffered: false });
          } catch {}
        });
        const radSchritte = Math.ceil((m.strecke + 400) / 100);
        for (let i = 0; i < radSchritte; i++) {
          await seite.mouse.wheel(0, 100);
          await seite.waitForTimeout(16);
        }
        await seite.waitForTimeout(300);
        const w = await seite.evaluate(() => {
          const b = window.__bilder, d = b.slice(1).map((t, i) => t - b[i]).sort((x, y) => x - y);
          const p = window.__p, dp = p.slice(1).map((x, i) => Math.abs(x - p[i]));
          return { bilder: b.length, p95: d[Math.floor(d.length * 0.95)], max: d[d.length - 1], lang: window.__lang, dpMax: Math.max(...dp), ende: p[p.length - 1] };
        });
        pruefe('Mausrad: Story läuft bis zum Ende mit', w.ende > 0.999, `p am Ende ${w.ende}`);
        pruefe('Mausrad: p macht pro Bild höchstens einen Radschritt (keine Sprünge)', w.dpMax <= 100 / m.strecke + 0.005, `max. ${w.dpMax.toFixed(4)} pro Bild, 1 Radschritt = ${(100 / m.strecke).toFixed(4)}`);
        const lange = w.lang.filter((d) => d > 50);
        console.log(`  ℹ Bilder: ${w.bilder}, Abstand p95 ${w.p95.toFixed(1)} ms, max. ${w.max.toFixed(1)} ms, Bilder über 50 ms: ${lange.length} (headless ohne Grafikkarte, nur Richtwert)`);
        pruefe('Mausrad: kein Bild braucht über 200 ms', w.max < 200, `max. ${w.max.toFixed(1)} ms`);
      }

      pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
      pruefe('Lädt kein three.js', !status.dreiD);
      await ctx.close();
    }

    console.log(`\n── Akku-Story ${modell}, weniger Bewegung ──`);
    {
      const { seite, ctx } = await oeffne(adresse, { reducedMotion: 'reduce' });
      const z = await seite.evaluate(() => {
        const w = document.querySelector('[data-akku-story]');
        const sichtbar = (sel) => [...w.querySelectorAll(sel)].map((e) => Number(getComputedStyle(e).opacity));
        return {
          scroll: w.dataset.scroll ?? null, hoehe: w.querySelector('[data-spur]').offsetHeight,
          se: sichtbar('.ebene[data-rolle="se"], .ebene[data-rolle="weg"]'), ziel: sichtbar('.ebene[data-rolle="ziel"], .ebene[data-rolle="neu"]'),
          nummern: sichtbar('[data-teil="nummern"]')[0], vergleich: Number(getComputedStyle(w.querySelector('[data-se-vergleich]')).opacity),
          schritte: [...w.querySelectorAll('[data-schritt]')].map((e) => Number(getComputedStyle(e).opacity)),
        };
      });
      pruefe('Keine Scroll-Kopplung, Abschnitt ist nicht künstlich hoch', z.scroll === null && z.hoehe < 1500, `${z.hoehe} px`);
      pruefe('Endzustand: nur Kiesel-Teile, Nummern und SE-Vergleich sichtbar', z.se.every((o) => o === 0) && z.ziel.every((o) => o === 1) && z.nummern === 1 && z.vergleich === 1);
      pruefe('Alle sechs Schritte stehen lesbar als Liste da', z.schritte.length === 6 && z.schritte.every((o) => o === 1));
      const m = await spurMasse(seite);
      await scrolle(seite, m.anfang + 300);
      const p = await seite.evaluate(() => document.querySelector('[data-akku-story]').dataset.fortschritt);
      pruefe('Scrollen ändert nichts', p === '1', `p=${p}`);
      await ctx.close();
    }
  }

  console.log('\n── Zoom-Vergleich (Pro) ──');
  {
    const { seite, ctx, status } = await oeffne('kiesel-1-pro/');
    const regler = seite.locator('[data-regler]');
    const lage = () => seite.evaluate(() => ({ wert: document.querySelector('[data-regler]').value, pos: document.querySelector('[data-fenster]').style.getPropertyValue('--pos') }));
    await regler.focus();
    for (let i = 0; i < 5; i++) await seite.keyboard.press('ArrowLeft');
    let l = await lage();
    pruefe('Pfeiltaste links × 5: Linie auf 45 %', l.wert === '45' && l.pos === '45%', JSON.stringify(l));
    await seite.keyboard.press('End');
    l = await lage();
    pruefe('Ende: Linie ganz rechts', l.wert === '100' && l.pos === '100%');
    await seite.keyboard.press('Home');
    l = await lage();
    pruefe('Pos1: Linie ganz links', l.wert === '0' && l.pos === '0%');
    const fokusRing = await seite.evaluate(() => getComputedStyle(document.querySelector('.griff')).outlineStyle);
    pruefe('Fokussierter Regler zeigt einen Fokusring am Griff', fokusRing === 'solid', fokusRing);

    const f = await seite.locator('[data-fenster]').boundingBox();
    await seite.mouse.move(f.x + f.width * 0.25, f.y + f.height / 2);
    await seite.mouse.down();
    await seite.mouse.move(f.x + f.width * 0.5, f.y + f.height / 2, { steps: 5 });
    await seite.mouse.move(f.x + f.width * 0.75, f.y + f.height / 2, { steps: 5 });
    await seite.mouse.up();
    l = await lage();
    pruefe('Maus ziehen: Linie folgt bis 75 %', Math.abs(Number(l.wert) - 75) <= 1, l.pos);

    // Zoom und Linsenwechsel prüft pruefe:kamera ausführlich, hier nur das Zusammenspiel
    await seite.locator('[data-zoom-vergleich] [data-stufe="10"]').click();
    await seite.waitForTimeout(900);
    const z = await seite.evaluate(() => ({
      breite: Number(document.querySelector('[data-ebene="tele"] svg').getAttribute('viewBox').split(' ')[2]),
      k1: document.querySelector('[data-text="k1"]').textContent,
      blur: Number(/blur\(([\d.]+)px\)/.exec(document.querySelector('[data-ebene="k1"]').style.filter)?.[1] ?? 0),
    }));
    pruefe('10x: enger Ausschnitt, Kiesel 1 „max. 5x“ und stark unscharf', z.breite === 160 && z.k1.includes('max. 5x') && z.blur > 8, JSON.stringify(z));
    l = await lage();
    pruefe('Zoomen verschiebt die Trennlinie nicht', Math.abs(Number(l.wert) - 75) <= 1, l.pos);

    await seite.locator('[data-vergleich-schalter]').click();
    const allein = await seite.evaluate(() => ({ allein: document.querySelector('[data-fenster]').hasAttribute('data-allein'), aus: document.querySelector('[data-regler]').disabled }));
    pruefe('Schalter aus: nur noch der Pro, Regler deaktiviert', allein.allein && allein.aus);
    pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    // Finger: echte Touch-Ereignisse über das Chrome-Protokoll
    const { seite, ctx } = await oeffne('kiesel-1-pro/', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const fenster = seite.locator('[data-fenster]');
    await fenster.scrollIntoViewIfNeeded();
    const f = await fenster.boundingBox();
    const cdp = await ctx.newCDPSession(seite);
    const wisch = async (von, bis, schritte = 8) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: von[0], y: von[1] }] });
      for (let i = 1; i <= schritte; i++) {
        const t = i / schritte;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: von[0] + (bis[0] - von[0]) * t, y: von[1] + (bis[1] - von[1]) * t }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await seite.waitForTimeout(100);
    };
    const wert = () => seite.evaluate(() => Number(document.querySelector('[data-regler]').value));
    const mitte = f.y + f.height * 0.6;
    await wisch([f.x + f.width * 0.5, mitte], [f.x + f.width * 0.2, mitte]);
    let w = await wert();
    pruefe('Finger waagrecht wischen: Linie folgt bis 20 %', Math.abs(w - 20) <= 2, `${w} %`);
    const y0 = await seite.evaluate(() => scrollY);
    await wisch([f.x + f.width * 0.7, mitte], [f.x + f.width * 0.72, mitte - 200]);
    const y1 = await seite.evaluate(() => scrollY);
    w = await wert();
    pruefe('Finger senkrecht wischen: Seite scrollt, Linie bleibt', Math.abs(w - 20) <= 2 && y1 > y0, `Linie ${w} %, gescrollt ${y1 - y0} px`);
    await fenster.scrollIntoViewIfNeeded();
    const f2 = await fenster.boundingBox();
    await seite.touchscreen.tap(f2.x + f2.width * 0.8, f2.y + f2.height * 0.6);
    await seite.waitForTimeout(100);
    w = await wert();
    pruefe('Antippen: Linie springt an die Stelle', Math.abs(w - 80) <= 2, `${w} %`);
    await ctx.close();
  }

  console.log('\n── Makro ──');
  for (const [modell, adresse] of [['pro', 'kiesel-1-pro/'], ['k1', 'kiesel-1/']]) {
    const { seite, ctx } = await oeffne(adresse);
    const biene = seite.locator('[data-makro] g[filter*="c-bee"]');
    await biene.scrollIntoViewIfNeeded();
    const b = await biene.boundingBox();
    await seite.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await seite.waitForTimeout(600);
    const z = await seite.evaluate(() => {
      const sd = (e) => Number(document.querySelector(`[data-makro] filter[id$="c-${e}"] feGaussianBlur`).getAttribute('stdDeviation'));
      return { bee: sd('bee'), fl: sd('fl'), knopf: document.querySelector('[data-makro] [data-fokus-ebene][aria-pressed="true"]').textContent };
    });
    pruefe(`${modell}: Klick auf die Biene stellt sie scharf, die Blume wird weicher`, z.bee < 0.1 && z.fl > 1 && z.knopf === 'Biene', JSON.stringify(z));
    // Linse per Tastatur (Perspektive und Übergang prüft pruefe:kamera-stellen)
    const knopf = seite.locator('[data-makro] .modi button').first();
    await knopf.focus();
    await seite.keyboard.press('Enter');
    await seite.waitForTimeout(600);
    pruefe(`${modell}: erster Linsen-Knopf („${await knopf.textContent()}“) per Tastatur`, await knopf.getAttribute('aria-pressed') === 'true');
    const wiese = seite.locator('[data-makro] [data-fokus-ebene="bg"]');
    await wiese.focus();
    await seite.keyboard.press('Enter');
    await seite.waitForTimeout(600);
    const bg = await seite.evaluate(() => Number(document.querySelector('[data-makro] filter[id$="c-bg"] feGaussianBlur').getAttribute('stdDeviation')));
    pruefe(`${modell}: Knopf „Wiese“ per Tastatur stellt den Hintergrund scharf`, bg < 0.1 && await wiese.getAttribute('aria-pressed') === 'true', String(bg));
    await ctx.close();
  }

  console.log('\n── Technische Daten ──');
  const alleZeilen = TECHNIK.flatMap((g) => g.zeilen);
  const soll = alleZeilen.length;
  const unterschiede = alleZeilen.filter((z) => z[1] !== z[2]).length;
  for (const [adresse, erstes, zweites] of [['kiesel-1/technik/', 'Kiesel 1', 'Kiesel 1 Pro'], ['kiesel-1-pro/technik/', 'Kiesel 1 Pro', 'Kiesel 1']]) {
    const { seite, ctx, status } = await oeffne(adresse);
    const zeilen = await seite.locator('[data-technik] tbody tr').count();
    const kopf = await seite.locator('[data-technik] th[scope="row"]').count();
    pruefe(`${adresse}: ${TECHNIK.length} Tabellen mit zusammen ${soll} Zeilen und Zeilenköpfen`, zeilen === soll && kopf === zeilen && await seite.locator('[data-technik] table').count() === TECHNIK.length, `${zeilen} Zeilen`);
    const reihe = await seite.evaluate(() => [...document.querySelectorAll('[data-technik] .kopf .name')].map((n) => n.textContent));
    const spalten = await seite.locator('[data-technik] thead').first().locator('th').allTextContents();
    pruefe(`${adresse}: ${erstes} steht in der ersten Spalte`, reihe[0] === erstes && reihe[1] === zweites && spalten[1] === erstes && spalten[2] === zweites, reihe.join(' | '));
    const aktiv = await seite.locator('.unterleiste a[aria-current="page"]').allTextContents();
    pruefe(`${adresse}: Unterleiste markiert „Technische Daten“`, aktiv.length === 1 && aktiv[0] === 'Technische Daten', aktiv.join(', '));
    const blau = await seite.locator('[data-technik] td.anders').count();
    pruefe(`${adresse}: ${unterschiede} Unterschiede blau markiert`, blau === unterschiede, String(blau));
    // Schalter per Tastatur: Fokus drauf, Leertaste
    const schalter = seite.locator('[data-nur-unterschiede]');
    await schalter.focus();
    await seite.keyboard.press('Space');
    const an = { checked: await schalter.getAttribute('aria-checked'), sichtbar: await seite.locator('[data-technik] tbody tr:visible').count(), gruppen: await seite.locator('[data-gruppe]:visible').count() };
    const gruppenMitUnterschied = TECHNIK.filter((g) => g.zeilen.some((z) => z[1] !== z[2])).length;
    pruefe(`${adresse}: „Nur Unterschiede“ per Leertaste zeigt ${unterschiede} Zeilen in ${gruppenMitUnterschied} Gruppen`, an.checked === 'true' && an.sichtbar === unterschiede && an.gruppen === gruppenMitUnterschied, JSON.stringify(an));
    await seite.keyboard.press('Enter');
    const aus = await seite.locator('[data-technik] tbody tr:visible').count();
    pruefe(`${adresse}: wieder aus per Enter zeigt alle ${soll} Zeilen`, aus === soll && await schalter.getAttribute('aria-checked') === 'false', String(aus));
    pruefe(`${adresse}: kein Platzhalter mehr, kein three.js, keine Fehler`, !(await seite.content()).includes('Inhalt folgt') && !status.dreiD && status.fehler.length === 0);
    await ctx.close();
  }
  for (const adresse of ['kiesel-1/', 'kiesel-1-pro/']) {
    const { seite, ctx } = await oeffne(adresse);
    pruefe(`${adresse}: kein Platzhalter mehr`, !(await seite.content()).includes('Inhalt folgt'));
    const anker = await seite.evaluate(() => ['kamera', 'akku', 'farben'].filter((id) => !document.getElementById(id)));
    pruefe(`${adresse}: Sprungziele #kamera, #akku, #farben vorhanden`, anker.length === 0, anker.join(', '));
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
