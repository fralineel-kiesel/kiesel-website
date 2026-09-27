// Prüft die Kamera-Demos der Modellseiten (Etappe 5) im echten Browser (Playwright + Chromium):
//
//   npm run pruefe:kamera
//
// 1. Zoom-Regler: Tastatur (Pfeile 0.1er-Schritte, Bild auf/ab = Stufen, Pos1/Ende), Chips,
//    Finger (waagrecht zoomen, senkrecht scrollt die Seite), aria-valuetext.
// 2. Linsenwechsel bei 3x (Pro): Zustand bei 2.8x, 3.0x und 3.2x. Dann der Übergang Bild für
//    Bild mit angehaltener Uhr (page.clock, 16-ms-Schritte): Deckkraft, Versatz und
//    Unschärfe ändern sich stetig, und kein Bild unterscheidet sich vom vorherigen stärker
//    als ein gewöhnlicher Zoomschritt (Pixelvergleich). Rückwärts gleich, Umkehr mitten im
//    Wechsel ohne Sprung. Bei „weniger Bewegung“ wechselt die Linse sofort.
// 3. Versteckte Details (Pro, Kiesel 1, /funktionen/): beim Laden alles „?“, gefunden erst ab
//    5x nach eigener Bedienung, Fokusring um das gefundene Detail, Zähler mit Punkten,
//    Linsen-Leiste, Klick aufs Vorschaubild fliegt hin (Detail danach genau in der Bildmitte).
// 4. Zielen auf /funktionen/: Klick schwenkt, Maus und Finger (waagrecht) verschieben, Finger
//    senkrecht scrollt. Kiesel 1: max. 5x, keine Tele-Ebene. Keine Fehler, kein three.js.
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { ZOOM_TARGETS, crop, begrenze } from '../src/lib/kiesel-draw/ausschnitt.js';

const DREI_D = /\/buehne\.[\w-]+\.js$/;
// So viel stärker als beim gewöhnlichen Ziehen darf ein Bild beim Linsenwechsel springen.
// Ein harter Schnitt ohne Animation liegt bei rund 1.5 (siehe Gegenprobe), die Animation bei 1.
const SPRUNG_MAX = 1.25;
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
let fehler = 0;

function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

// Seite mit angehaltener Uhr: Animationen laufen nur mit uhr(ms) weiter
async function oeffne(adresse, kontext = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { dreiD: false, fehler: [] };
  seite.on('request', (r) => { if (DREI_D.test(new URL(r.url()).pathname)) status.dreiD = true; });
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.clock.install({ time: new Date('2026-09-27T10:00:00') });
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  await seite.clock.pauseAt(new Date('2026-09-27T10:00:02'));
  await seite.evaluate(() => document.fonts.ready);
  await seite.clock.runFor(300);
  const fenster = seite.locator('[data-fenster]').first();
  await fenster.scrollIntoViewIfNeeded();
  const uhr = (ms) => seite.clock.runFor(ms);
  const k = (fn, arg) => seite.evaluate(([fn, arg]) => {
    const kamera = document.querySelector('[data-fenster]').parentElement.kamera;
    return fn === 'zustand' ? kamera.zustand() : kamera[fn](arg);
  }, [fn, arg]);
  return { seite, ctx, status, fenster, uhr, k };
}

// Stil der Ebenen auslesen: Deckkraft, Unschärfe (px), Versatz (px), sichtbar
const ebenen = (seite) => seite.evaluate(() => Object.fromEntries([...document.querySelector('[data-fenster]').querySelectorAll('[data-ebene]')].map((e) => {
  const blur = /blur\(([\d.]+)px\)/.exec(e.style.filter);
  const dx = /translateX\((-?[\d.]+)px\)/.exec(e.style.transform);
  return [e.dataset.ebene, { deck: e.style.opacity === '' ? 1 : Number(e.style.opacity), blur: blur ? Number(blur[1]) : 0, dx: dx ? Number(dx[1]) : 0, sichtbar: e.style.visibility !== 'hidden' }];
})));

// Pixelvergleich zweier Bildschirmfotos: mittlere Abweichung pro Kanal (0…255)
const rechner = await browser.newPage();
async function abstand(a, b) {
  return rechner.evaluate(async ([a, b]) => {
    const lade = (d) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + d; });
    const [ia, ib] = await Promise.all([lade(a), lade(b)]);
    const c = new OffscreenCanvas(ia.width, ia.height), g = c.getContext('2d');
    g.drawImage(ia, 0, 0);
    const da = g.getImageData(0, 0, c.width, c.height).data;
    g.drawImage(ib, 0, 0);
    const db = g.getImageData(0, 0, c.width, c.height).data;
    let s = 0;
    for (let i = 0; i < da.length; i += 4) s += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
    return s / (da.length / 4) / 3;
  }, [a.toString('base64'), b.toString('base64')]);
}

// Den Zoom-Regler so ziehen wie ein Mensch: in 20 Bildern von „von“ nach „nach“, danach
// 30 Bilder ausklingen lassen. Rückgabe: grösster Pixelsprung zwischen zwei Bildern in der
// rechten Hälfte des Fensters (= Pro).
function zieheMesser(seite, fenster, uhr, k) {
  return async (von, nach) => {
    const nah = await fenster.boundingBox();
    const foto = () => seite.screenshot({ clip: { x: nah.x + nah.width / 2 + 4, y: nah.y, width: nah.width / 2 - 8, height: nah.height } });
    // Die angehaltene Uhr lässt Animationsbilder ohne echtes Zeichnen laufen, erst ein Foto
    // zeichnet. Darum einmal wegwerfen, sonst misst der Test seinen eigenen Sprung.
    await k('setzeZoom', von); await uhr(1000); await foto(); await uhr(50);
    let bild = await foto();
    const sprung = [];
    for (let i = 1; i <= 50; i++) {
      if (i <= 20) await k('setzeZoom', von * (nach / von) ** (i / 20));
      await uhr(16);
      const neu = await foto();
      sprung.push(await abstand(bild, neu));
      bild = neu;
    }
    return Math.max(...sprung);
  };
}

try {
  console.log('\n── Zoom-Regler (Pro) ──');
  {
    const { seite, ctx, status, uhr, k } = await oeffne('kiesel-1-pro/');
    const regler = seite.locator('[data-zoom-vergleich] [data-zoom-regler]');
    let z = await k('zustand');
    pruefe('Start: 5x mit Tele-Linse', Math.abs(z.z - 5) < 0.01 && z.linse === 'tele', JSON.stringify(z));
    await regler.focus();
    await seite.keyboard.press('PageDown');
    await uhr(1000);
    z = await k('zustand');
    pruefe('Bild ab: gleitet zur nächsten Stufe 3x', Math.abs(z.z - 3) < 0.01, z.z.toFixed(2));
    await seite.keyboard.press('ArrowLeft');
    await uhr(600);
    z = await k('zustand');
    const text = await regler.getAttribute('aria-valuetext');
    pruefe('Pfeil links: 2.9x, Hauptkamera, aria-valuetext nachgeführt', Math.abs(z.z - 2.9) < 0.01 && z.linse === 'haupt' && text === '2.9-fach, Hauptkamera', `${z.z.toFixed(2)} ${z.linse} „${text}“`);
    await seite.keyboard.press('ArrowRight');
    await uhr(600);
    z = await k('zustand');
    pruefe('Pfeil rechts: 3x, Tele-Linse', Math.abs(z.z - 3) < 0.01 && z.linse === 'tele' && (await regler.getAttribute('aria-valuetext')) === '3-fach, Tele-Linse');
    await seite.keyboard.press('End');
    await uhr(1000);
    pruefe('Ende: 10x', Math.abs((await k('zustand')).z - 10) < 0.01);
    await seite.keyboard.press('Home');
    await uhr(1000);
    pruefe('Pos1: 0.5x', Math.abs((await k('zustand')).z - 0.5) < 0.01);
    // Der Fokusring sitzt auf dem Pseudo-Element des Griffs, das getComputedStyle nicht
    // auslesen kann. Darum: Griff fotografieren, einmal ohne, einmal mit Tastatur-Fokus.
    const griff = await regler.boundingBox();
    await seite.evaluate(() => document.activeElement.blur());
    const ohne = await seite.screenshot({ clip: griff });
    await seite.keyboard.press('Shift+Tab');
    await seite.keyboard.press('Tab');
    const mit = await seite.screenshot({ clip: griff });
    const fokusAbstand = await abstand(ohne, mit);
    pruefe('Fokussierter Regler zeigt einen Fokusring am Griff', fokusAbstand > 0.5 && (await seite.evaluate(() => document.activeElement.matches('[data-zoom-regler]'))), `Pixelabstand ${fokusAbstand.toFixed(2)}`);

    await seite.locator('[data-zoom-vergleich] [data-stufe="10"]').click();
    await uhr(1000);
    const zehn = await seite.evaluate(() => ({
      breite: Number(document.querySelector('[data-ebene="tele"] svg').getAttribute('viewBox').split(' ')[2]),
      k1: document.querySelector('[data-text="k1"]').textContent,
      gedrueckt: document.querySelector('[data-zoom-vergleich] [data-stufe="10"]').getAttribute('aria-pressed'),
    }));
    const e10 = await ebenen(seite);
    pruefe('Chip 10x: 160 Einheiten breit, Chip gedrückt, Kiesel 1 „max. 5x“ und mehr als doppelt so weich wie der Pro',
      zehn.breite === 160 && zehn.gedrueckt === 'true' && zehn.k1.includes('max. 5x') && e10.k1.blur > 2 * e10.tele.blur && e10.k1.blur > 8, `${JSON.stringify(zehn)} Unschärfe k1 ${e10.k1.blur}, Pro ${e10.tele.blur}`);
    pruefe('Keine Skriptfehler, kein three.js', status.fehler.length === 0 && !status.dreiD, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    // Finger auf dem Zoom-Regler: echte Touch-Ereignisse über das Chrome-Protokoll
    const { seite, ctx, k } = await oeffne('kiesel-1-pro/', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await seite.clock.resume();
    const regler = seite.locator('[data-zoom-vergleich] [data-zoom-regler]');
    await regler.scrollIntoViewIfNeeded();
    const r = await regler.boundingBox();
    const cdp = await ctx.newCDPSession(seite);
    const wisch = async (von, bis, schritte = 10) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: von[0], y: von[1] }] });
      for (let i = 1; i <= schritte; i++) {
        const t = i / schritte;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: von[0] + (bis[0] - von[0]) * t, y: von[1] + (bis[1] - von[1]) * t }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await seite.waitForTimeout(200);
    };
    const y = r.y + r.height / 2;
    const vorher = (await k('zustand')).z;
    await wisch([r.x + r.width * 0.77, y], [r.x + r.width * 0.3, y]);
    const nachher = (await k('zustand')).z;
    pruefe('Finger waagrecht auf dem Regler: zoomt raus', nachher < vorher - 1, `${vorher.toFixed(2)} → ${nachher.toFixed(2)}`);
    const y0 = await seite.evaluate(() => scrollY);
    await wisch([r.x + r.width * 0.5, y], [r.x + r.width * 0.52, y - 200]);
    const y1 = await seite.evaluate(() => scrollY);
    pruefe('Finger senkrecht auf dem Regler: Seite scrollt', y1 > y0, `${y1 - y0} px`);
    await ctx.close();
  }

  console.log('\n── Linsenwechsel bei 3x (Pro) ──');
  for (const [b, h] of [[1440, 900], [390, 844]]) {
    const { seite, ctx, fenster, uhr, k } = await oeffne('kiesel-1-pro/', { viewport: { width: b, height: h } });
    const stand = async (z) => { await k('setzeZoom', z); await uhr(1000); return { z: await k('zustand'), e: await ebenen(seite) }; };
    const s28 = await stand(2.8), s30 = await stand(3), s32 = await stand(3.2);
    // Unsichtbar heisst: versteckt oder (aufgewärmt) mit Deckkraft 0 bzw. ganz zugedeckt
    pruefe(`${b} px: 2.8x = Hauptkamera allein, sichtbar weich, Tele unsichtbar bereit`, s28.z.linse === 'haupt' && s28.e.tele.sichtbar && s28.e.tele.deck === 0 && s28.e.haupt.blur > 0.8 * (b / 600), JSON.stringify(s28.e));
    pruefe(`${b} px: 3.0x = Tele scharf und deckend`, s30.z.linse === 'tele' && s30.e.tele.deck === 1 && s30.e.tele.blur === 0 && s30.e.tele.dx === 0, JSON.stringify(s30.e.tele));
    pruefe(`${b} px: 3.2x = Tele, nur ein Hauch digital`, s32.z.linse === 'tele' && s32.e.tele.blur > 0 && s32.e.tele.blur < s28.e.haupt.blur / 4, `${s32.e.tele.blur} px`);

    // Parameter Bild für Bild: Zoom springt auf einen Schlag über 3x, dann läuft nur noch der Wechsel
    for (const [von, nach, wort] of [[2.8, 3, 'hoch'], [3.2, 2.8, 'runter']]) {
      await k('setzeZoom', von); await uhr(1000);
      await k('setzeZoom', nach);
      const verlauf = [];
      for (let t = 0; t < 560; t += 16) { await uhr(16); verlauf.push(await ebenen(seite)); }
      const z = await k('zustand');
      const schritte = verlauf.slice(1).map((e, i) => ({
        deck: Math.abs(e.tele.deck - verlauf[i].tele.deck),
        dx: Math.max(Math.abs(e.tele.dx - verlauf[i].tele.dx), Math.abs(e.haupt.dx - verlauf[i].haupt.dx)),
        blur: Math.max(Math.abs(e.tele.blur - verlauf[i].tele.blur), Math.abs(e.haupt.blur - verlauf[i].haupt.blur)),
      }));
      const max = (feld) => Math.max(...schritte.map((s) => s[feld]));
      // Überblendung ca. 210 ms ≈ 13 Bilder, im steilsten Stück der S-Kurve gut 0.2 pro Bild
      pruefe(`${b} px ${wort}: Deckkraft, Versatz und Unschärfe ändern sich stetig`,
        max('deck') <= 0.25 && max('dx') <= 0.02 * b && max('blur') <= 0.35 * (b / 600) && !z.wechsel,
        `grösster Schritt: Deckkraft ${max('deck').toFixed(3)}, Versatz ${max('dx').toFixed(2)} px, Unschärfe ${max('blur').toFixed(2)} px`);
      pruefe(`${b} px ${wort}: nach 420 ms fertig`, verlauf.slice(28).every((e) => JSON.stringify(e) === JSON.stringify(verlauf[verlauf.length - 1])));
    }

    // Pixel: So zieht ein Mensch den Regler, in 20 Bildern von 2.8x auf 3.2x (bzw. zurück).
    // Massstab ist dieselbe Ziehbewegung ohne Linsenwechsel (3.5x → 4x, gleiches Verhältnis).
    // Rechte Hälfte fotografieren (= Pro). Abrupt hiesse: ein Bild mit einem viel grösseren
    // Sprung als beim gewöhnlichen Ziehen.
    const ziehe = zieheMesser(seite, fenster, uhr, k);
    const normal = Math.max(await ziehe(3.5, 4), await ziehe(4, 3.5));
    for (const [von, nach, wort] of [[2.8, 3.2, 'hoch'], [3.2, 2.8, 'runter']]) {
      const wechsel = await ziehe(von, nach);
      pruefe(`${b} px ${wort} ziehen: kein Bild springt mehr als ${SPRUNG_MAX}× so stark wie beim Ziehen ohne Wechsel (Pixel)`,
        wechsel <= SPRUNG_MAX * normal, `grösster Sprung ${wechsel.toFixed(2)}, ohne Wechsel ${normal.toFixed(2)}`);
    }

    // Umkehr mitten im Wechsel: 2.8 → 3.0, nach 100 ms zurück auf 2.9
    await k('setzeZoom', 2.8); await uhr(1000);
    await k('setzeZoom', 3); await uhr(96);
    const mitte = (await k('zustand')).mix;
    await k('setzeZoom', 2.9); await uhr(16);
    const danach = (await k('zustand')).mix;
    await uhr(1000);
    const ende = await k('zustand');
    pruefe(`${b} px: Umkehr mitten im Wechsel läuft ohne Sprung zurück`, mitte > 0 && mitte < 1 && Math.abs(danach - mitte) < 0.1 && ende.mix === 0 && ende.linse === 'haupt', `mix ${mitte.toFixed(3)} → ${danach.toFixed(3)} → ${ende.mix}`);
    const chip = await seite.evaluate(() => document.querySelector('[data-zoom-vergleich]').dataset.linse);
    pruefe(`${b} px: Chip zeigt die aktive Linse`, chip === 'haupt');
    await ctx.close();
  }
  {
    const { seite, ctx, uhr, k } = await oeffne('kiesel-1-pro/', { reducedMotion: 'reduce' });
    await k('setzeZoom', 2.8); await uhr(100);
    await k('setzeZoom', 3); await uhr(16);
    const z = await k('zustand'), e = await ebenen(seite);
    pruefe('Weniger Bewegung: Linse wechselt sofort, ohne Versatz und Fokus-Effekt', z.mix === 1 && !z.wechsel && e.tele.dx === 0 && e.tele.blur === 0 && e.tele.deck === 1, JSON.stringify(e.tele));
    // Gegenprobe: Ohne Animation ist der Wechsel ein harter Schnitt. Den muss derselbe
    // Pixeltest wie oben erkennen (gleiche Stelle, gleiches Kriterium), sonst misst er nichts.
    const ziehe = zieheMesser(seite, seite.locator('[data-fenster]').first(), uhr, k);
    const normal = Math.max(await ziehe(3.5, 4), await ziehe(4, 3.5));
    const hart = { hoch: await ziehe(2.8, 3.2), runter: await ziehe(3.2, 2.8) };
    pruefe(`Gegenprobe: ohne Animation fällt der Wechsel durch den Pixeltest (> ${SPRUNG_MAX}× normal)`,
      hart.hoch > SPRUNG_MAX * normal && hart.runter > SPRUNG_MAX * normal,
      `hart ${hart.hoch.toFixed(2)} / ${hart.runter.toFixed(2)}, ohne Wechsel ${normal.toFixed(2)}`);
    // Ein leeres Bild (Ebene eingeblendet, aber noch nicht gezeichnet) wäre ein Sprung von
    // rund 45. Ein harter Linsenwechsel ohne Animation liegt bei wenigen Einheiten.
    pruefe('Weniger Bewegung: kein leeres Bild beim Wechsel (die neue Ebene ist vorgezeichnet)', hart.hoch < 15 && hart.runter < 15, `${hart.hoch.toFixed(2)} / ${hart.runter.toFixed(2)}`);
    // Sprung direkt über 3x: Die Hauptkamera war aus (8x). Im ersten Bild wird sie nur
    // gezeichnet, die Linse wechselt erst, wenn sie zwei Bilder lang da war (sonst wäre
    // für ein Bild gar nichts zu sehen).
    await k('setzeZoom', 8); await uhr(100);
    const kalt = await ebenen(seite);
    await k('setzeZoom', 2.8); await uhr(16);
    const erst = { z: await k('zustand'), e: await ebenen(seite) };
    await uhr(48);
    const dann = await k('zustand');
    pruefe('Sprung von 8x auf 2.8x: Hauptkamera wird erst vorgezeichnet, dann gewechselt',
      !kalt.haupt.sichtbar && erst.z.linse === 'tele' && erst.e.haupt.sichtbar && dann.linse === 'haupt' && dann.mix === 0,
      `8x: Hauptkamera ${kalt.haupt.sichtbar ? 'an' : 'aus'}; 1. Bild: ${erst.z.linse}, Hauptkamera ${erst.e.haupt.sichtbar ? 'an' : 'aus'}; danach: ${dann.linse}`);
    await seite.locator('[data-detail="2"]').click();
    await uhr(16);
    const f = await k('zustand');
    pruefe('Weniger Bewegung: Flug zum Detail ist sofort da', Math.abs(f.z - 8) < 0.01 && f.blick[0] === ZOOM_TARGETS[2][1]);
    await ctx.close();
  }

  console.log('\n── Versteckte Details, Fokusring, Linsen-Leiste ──');
  for (const [modell, adresse, zielZoom] of [['pro', 'kiesel-1-pro/', 8], ['k1', 'kiesel-1/', 5], ['suche', 'funktionen/', 8]]) {
    const { seite, ctx, status, fenster, uhr, k } = await oeffne(adresse);
    const wurzel = modell === 'pro' ? '[data-zoom-vergleich]' : modell === 'k1' ? '[data-zoom-demo]' : '[data-kamera-suche]';
    const w = (sel) => `${wurzel} ${sel}`;
    const gefunden = () => seite.evaluate((sel) => [...document.querySelectorAll(sel)].filter((b) => b.hasAttribute('data-gefunden')).map((b) => Number(b.dataset.detail)), w('[data-detail]'));
    const ring = () => seite.evaluate((sel) => { const r = document.querySelector(sel); return { an: r.style.visibility !== 'hidden', text: r.textContent.trim(), detail: r.dataset.detail }; }, w('[data-fokusring]'));
    const zaehler = () => seite.locator(w('[data-entdeckt]')).textContent();
    const aktiv = () => seite.evaluate((sel) => [...document.querySelectorAll(sel)].findIndex((a) => a.hasAttribute('data-aktiv')), w('[data-linsenabschnitt]'));

    const namen = await seite.locator(w('[data-fundname]')).allTextContents();
    pruefe(`${modell}: beim Laden alles versteckt („?“), kein Fokusring, Zähler 0 (wie im Artboard)`,
      (await gefunden()).length === 0 && namen.every((n) => n === 'Noch versteckt') && !(await ring()).an && (await zaehler()) === '0 von 8 entdeckt', await zaehler());
    for (const [z, erwartet] of [[1, 0], [2.8, 1], [modell === 'k1' ? 4 : 3, modell === 'k1' ? 1 : 2]]) {
      await k('setzeZoom', z); await uhr(100);
      pruefe(`${modell}: Linsen-Leiste bei ${z}x markiert Abschnitt ${erwartet + 1}`, (await aktiv()) === erwartet, String(await aktiv()));
    }
    await k('setzeZoom', 3); await uhr(100);
    // Zurück zum Gipfel (die Suche startet woanders)
    if (modell === 'suche') { await k('schwenkeZu', [756, 246]); await uhr(600); }
    await k('setzeZoom', 3); await uhr(100);
    pruefe(`${modell}: bei 3x noch nichts gefunden`, (await gefunden()).length === 0);
    await k('setzeZoom', 5); await uhr(100);
    const bei5 = await gefunden();
    pruefe(`${modell}: bei 5x selbst gefunden: Gipfelkreuz und Seilschaft`, bei5.includes(0) && bei5.includes(1) && (await zaehler()) === '2 von 8 entdeckt', `${bei5.join(', ')}; ${await zaehler()}`);
    const r = await ring();
    const namen5 = await seite.locator(w('[data-fundname]')).allTextContents();
    pruefe(`${modell}: Fokusring um das gefundene Detail, Vorschaubild mit Namen`, r.an && r.text.endsWith('entdeckt') && namen5[0] === 'Gipfelkreuz' && namen5[2] === 'Noch versteckt', JSON.stringify(r));
    const punkte = await seite.locator(w('[data-fundpunkt][data-an]')).count();
    pruefe(`${modell}: Zähler-Punkte: 2 von 8 weiss`, punkte === 2, String(punkte));

    // Klick auf ein verstecktes Vorschaubild (Tipp): Dorf. Danach genau in der Bildmitte.
    await seite.locator(w('[data-detail="7"]')).click();
    const zwischen = [];
    for (let t = 0; t < 2600; t += 100) { await uhr(100); zwischen.push((await k('zustand')).z); }
    const box = await fenster.boundingBox();
    const [, tx, ty] = ZOOM_TARGETS[7];
    const [vx, vy, vw, vh] = crop(...begrenze(tx, ty, zielZoom), zielZoom).split(' ').map(Number);
    const s = Math.max(box.width / vw, box.height / vh);
    const px = (box.width - vw * s) / 2 + (tx - vx) * s, py = (box.height - vh * s) / 2 + (ty - vy) * s;
    pruefe(`${modell}: verstecktes Vorschaubild fliegt hin (${zielZoom}x), Dorf in der Bildmitte`, Math.abs((await k('zustand')).z - zielZoom) < 0.01 && Math.abs(px - box.width / 2) < 2 && Math.abs(py - box.height / 2) < 2, `${px.toFixed(1)}, ${py.toFixed(1)}`);
    pruefe(`${modell}: Flug zoomt unterwegs raus (Gipfel → Dorf ist weit)`, Math.min(...zwischen) < 2.5, `kleinster Zoom ${Math.min(...zwischen).toFixed(2)}`);
    const rd = await ring();
    pruefe(`${modell}: 3 von 8, Fokusring jetzt um das Dorf`, (await zaehler()) === '3 von 8 entdeckt' && rd.an && rd.detail === '7' && rd.text === 'Dorf mit Kirche entdeckt', `${await zaehler()} ${JSON.stringify(rd)}`);
    if (modell === 'pro') {
      const linie = await seite.evaluate(() => document.querySelector('[data-regler]').value);
      pruefe('pro: Vorschaubild und Zoomstufen verschieben die Trennlinie nicht', linie === '50', linie);
    }
    for (let i = 0; i < ZOOM_TARGETS.length; i++) { await seite.locator(w(`[data-detail="${i}"]`)).click(); await uhr(3000); }
    pruefe(`${modell}: alle acht entdeckt`, (await zaehler()) === 'Alle 8 entdeckt', await zaehler());
    if (modell === 'k1') {
      pruefe('k1: keine Tele-Ebene, max. 5x', (await seite.locator('[data-ebene="tele"]').count()) === 0 && (await k('zustand')).z <= 5);
    }
    pruefe(`${modell}: keine Skriptfehler, kein three.js`, status.fehler.length === 0 && !status.dreiD, status.fehler.join(' | '));
    await ctx.close();
  }

  console.log('\n── Zielen auf /funktionen/ ──');
  {
    const { seite, ctx, fenster, uhr, k } = await oeffne('funktionen/');
    await fenster.scrollIntoViewIfNeeded();
    await k('setzeZoom', 5); await uhr(100);
    let box = await fenster.boundingBox();
    const vorher = (await k('zustand')).blick;
    // Klick rechts unten ins Bild: der Blick schwenkt dorthin
    await seite.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.7);
    await uhr(700);
    const nachKlick = (await k('zustand')).blick;
    const s = box.width / (1600 / 5); // px pro Bild-Einheit bei 5x (Fenster breiter als 1.6)
    const erwartet = [vorher[0] + (0.3 * box.width) / s, vorher[1] + (0.2 * box.height) / s];
    pruefe('Klick ins Bild schwenkt genau dorthin', Math.abs(nachKlick[0] - erwartet[0]) < 2 && Math.abs(nachKlick[1] - erwartet[1]) < 2, `${nachKlick.map((v) => v.toFixed(1))} statt ${erwartet.map((v) => v.toFixed(1))}`);
    // Maus ziehen: Bild folgt der Maus (nach links ziehen = Blick nach rechts)
    box = await fenster.boundingBox();
    await seite.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await seite.mouse.down();
    await seite.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2 - 100, { steps: 8 });
    await seite.mouse.up();
    await uhr(50);
    const nachZug = (await k('zustand')).blick;
    pruefe('Maus ziehen verschiebt das Bild um genau die Strecke', Math.abs(nachZug[0] - nachKlick[0] - 200 / s) < 1.5 && Math.abs(nachZug[1] - nachKlick[1] - 100 / s) < 1.5, `${(nachZug[0] - nachKlick[0]).toFixed(1)}, ${(nachZug[1] - nachKlick[1]).toFixed(1)} statt ${(200 / s).toFixed(1)}, ${(100 / s).toFixed(1)}`);
    await ctx.close();
  }
  {
    const { seite, ctx, fenster, k } = await oeffne('funktionen/', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await seite.clock.resume();
    await k('setzeZoom', 5); await seite.waitForTimeout(100);
    await fenster.scrollIntoViewIfNeeded();
    const f = await fenster.boundingBox();
    const cdp = await ctx.newCDPSession(seite);
    const wisch = async (von, bis) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: von[0], y: von[1] }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: von[0] + (bis[0] - von[0]) * i / 8, y: von[1] + (bis[1] - von[1]) * i / 8 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await seite.waitForTimeout(150);
    };
    const b0 = (await k('zustand')).blick, y0 = await seite.evaluate(() => scrollY);
    await wisch([f.x + f.width * 0.7, f.y + f.height / 2], [f.x + f.width * 0.3, f.y + f.height / 2]);
    const b1 = (await k('zustand')).blick;
    pruefe('Finger waagrecht: verschiebt das Bild', b1[0] > b0[0] + 10, `${b0[0].toFixed(1)} → ${b1[0].toFixed(1)}`);
    await wisch([f.x + f.width * 0.5, f.y + f.height * 0.7], [f.x + f.width * 0.52, f.y + f.height * 0.7 - 200]);
    const y1 = await seite.evaluate(() => scrollY), b2 = (await k('zustand')).blick;
    pruefe('Finger senkrecht: Seite scrollt, Bild bleibt', y1 > y0 && Math.abs(b2[0] - b1[0]) < 0.5, `gescrollt ${y1 - y0} px`);
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
