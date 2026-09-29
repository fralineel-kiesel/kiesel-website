// Prüft die Startseite im echten Browser (Playwright + Chromium):
//
//   npm run pruefe:startseite
//
// Vor allem: Greift die 2D-Ausweichlösung der 3D-Bühne wirklich, und lädt sie dann auch
// kein three.js? Dazu die Modellwahl (Etappe 8a: Maus, Finger, Tastatur, Farbe, Speicher,
// echter Massstab, Übergang, Proportionen gegen die 2D-Zeichnung), FAQ mit Tastatur,
// Zoom-Leiste, Farbwähler und: Andere Seiten laden nie three.js. Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
//
// Headless Chrome hat keine Grafikkarte. Ohne ?3d=software sagt die Seite darum zu Recht
// "kein-webgl" (Software-Grafik = heisses Handy). Mit ?3d=software dürfen wir 3D trotzdem
// testen. Die vsync-Schalter braucht headless Chrome mit Software-Grafik, sonst bleibt
// requestAnimationFrame nach ein paar Bildern stehen.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { MODELLE } from '../src/data/modelle.js';
import { abPreis } from '../src/data/preise.js';
import { bauplan } from '../src/lib/kiesel-3d/bauplan.js';

const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-vsync', '--disable-frame-rate-limit'];
const DREI_D = /\/buehne\.[\w-]+\.js$/; // die Datei mit three.js (aus src/lib/kiesel-3d/buehne.js)

const browser = await chromium.launch({ args: ARGS });
const { basis, schliessen } = await starteServer();
let fehler = 0;

function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

// Neue Seite; merkt sich, ob three.js angefordert wurde
async function oeffne(adresse = '', { kontext = {}, vorher, vorherArg, mit = browser } = {}) {
  const ctx = await mit.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { dreiD: false, dreiDAnzahl: 0, fehler: [] };
  seite.on('request', (r) => { if (DREI_D.test(new URL(r.url()).pathname)) { status.dreiD = true; status.dreiDAnzahl++; } });
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  if (vorher) await seite.addInitScript(vorher, vorherArg);
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  return { seite, ctx, status };
}

// Die 2D-Grafik des gewählten Modells (beide stehen im HTML, CSS zeigt die passende)
const buehne = (seite) => seite.evaluate(() => {
  const e = document.querySelector('[data-buehne3d]');
  const svg = e.querySelector(`[data-bild2d="${document.documentElement.dataset.heldModell}"] svg`);
  const leinwand = e.querySelector('canvas.leinwand-3d');
  const chip = e.querySelector('[data-nur3d]');
  return {
    modus: e.dataset.modus, grund: e.dataset.grund ?? null,
    leinwand: !!leinwand, bilder: Number(leinwand?.dataset.bilder ?? 0),
    svgSichtbar: !!svg && svg.getBoundingClientRect().height > 100 && getComputedStyle(svg.parentElement).opacity === '1',
    svgHtml: svg?.outerHTML ?? '', chipSichtbar: chip ? !chip.hidden : false,
  };
});
// Achtung: Das HTML startet mit data-modus="2d" (die 2D-Grafik ist sofort da), 3D wird erst
// danach im Leerlauf geladen. "2d" allein heisst also noch nichts. Entschieden ist 2D erst,
// wenn auch data-grund gesetzt ist. (Ohne diese Bedingung war der Wächter-Test wackelig:
// Er war fertig, bevor 3D überhaupt startete, je nachdem, wie beschäftigt der Rechner war.)
const warteAufModus = (seite, modus, ms = 20000) => seite.waitForFunction(
  (m) => {
    const e = document.querySelector('[data-buehne3d]');
    return e.dataset.modus === m && (m !== '2d' || !!e.dataset.grund);
  }, modus, { timeout: ms }).catch(() => {});
// Wartet, bis die 3D-Leinwand mindestens n weitere Bilder gezeichnet hat (statt fester Zeit,
// die auf einem beschäftigten Rechner nicht reicht)
const warteAufBilder = (seite, n, ms = 10000) => seite.waitForFunction(
  (ziel) => Number(document.querySelector('[data-buehne3d] canvas.leinwand-3d')?.dataset.bilder ?? 0) >= ziel, n, { timeout: ms }).catch(() => {});
// Künstliche Bildzeiten: requestAnimationFrame bekommt statt der echten Zeit eine erfundene,
// die pro echtem Bild um genau `ms` weiterläuft. Der Wächter sieht dann exakt diese Dauer,
// egal wie schnell oder beschäftigt der Testrechner ist. Alle Rückrufe desselben Bilds
// bekommen dieselbe Zeit (wie im echten Browser). Nebenbei merkt es sich, wie viele Bilder
// die 3D-Leinwand gezeichnet hat, auch nachdem der Wächter sie entfernt hat.
const KUNSTZEIT = (ms) => {
  const raf = window.requestAnimationFrame.bind(window);
  let echt = null, kunst = 0;
  window.__bilder3d = 0;
  window.requestAnimationFrame = (f) => raf((t) => {
    if (t !== echt) { kunst = echt === null ? t : kunst + ms; echt = t; }
    // Leinwand vorher festhalten: Entscheidet der Wächter, entfernt er sie noch in f()
    const leinwand = document.querySelector('[data-buehne3d] canvas.leinwand-3d');
    f(kunst);
    const n = Number(leinwand?.dataset.bilder ?? 0);
    if (n > window.__bilder3d) window.__bilder3d = n;
  });
};
// Durchschnittliche Helligkeit (0–255) der 3D-Leinwand, direkt aus ihren Pixeln.
// Normalerweise löscht WebGL das Bild, sobald es auf dem Bildschirm ist. Das Init-Skript
// LESBAR schaltet für den Test preserveDrawingBuffer ein, dann bleibt es lesbar.
// (Screenshots gehen hier nicht: headless Chrome hängt damit, sobald die Bildrate frei ist.)
const LESBAR = () => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (typ, opt) {
    return orig.call(this, typ, typ === 'webgl2' ? { ...opt, preserveDrawingBuffer: true } : opt);
  };
};
const helligkeit = (seite) => seite.evaluate(() => {
  const quelle = document.querySelector('[data-buehne3d] canvas.leinwand-3d');
  const c = document.createElement('canvas');
  c.width = quelle.width; c.height = quelle.height;
  const g = c.getContext('2d');
  g.drawImage(quelle, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let summe = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; // nur das Handy, nicht den durchsichtigen Hintergrund
    summe += (d[i] + d[i + 1] + d[i + 2]) / 3; n++;
  }
  return n ? summe / n : 0;
});

try {
  console.log('\n── 2D-Ausweichlösung ──');
  {
    const { seite, ctx, status } = await oeffne('?3d=software', { kontext: { reducedMotion: 'reduce' } });
    await warteAufModus(seite, '2d');
    const b = await buehne(seite);
    pruefe('prefers-reduced-motion: 2D statt 3D', b.modus === '2d' && b.grund === 'reduced-motion' && !b.leinwand, `modus=${b.modus}, grund=${b.grund}`);
    pruefe('prefers-reduced-motion: 2D-Grafik sichtbar', b.svgSichtbar);
    pruefe('prefers-reduced-motion: three.js wird nicht geladen', !status.dreiD);
    pruefe('prefers-reduced-motion: keine 3D-Chips', !b.chipSichtbar);
    // Farbwähler zeichnet auch in 2D neu
    await seite.locator('[data-buehne3d] label[title="Mattschwarz"]').click();
    const nach = await buehne(seite);
    pruefe('Farbwähler färbt die 2D-Grafik um', nach.svgHtml.includes('#2F3134') && nach.svgHtml.includes('Mattschwarz'));
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('?3d=software', { vorher: () => Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => 2 }) });
    await warteAufModus(seite, '2d');
    const b = await buehne(seite);
    pruefe('2 Prozessorkerne: 2D statt 3D', b.modus === '2d' && b.grund === 'schwaches-geraet' && !b.leinwand, `grund=${b.grund}`);
    pruefe('2 Prozessorkerne: three.js wird nicht geladen', !status.dreiD);
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('?3d=software', { vorher: () => Object.defineProperty(Navigator.prototype, 'connection', { get: () => ({ saveData: true }) }) });
    await warteAufModus(seite, '2d');
    const b = await buehne(seite);
    pruefe('Datensparmodus: 2D statt 3D', b.modus === '2d' && b.grund === 'datensparen' && !status.dreiD, `grund=${b.grund}`);
    await ctx.close();
  }
  {
    // Chrome ohne Schalter, wie auf einem Gerät ohne brauchbare Grafikkarte: Chrome fällt von
    // selbst auf Software-Grafik zurück, und failIfMajorPerformanceCaveat lehnt das ab.
    // (Mit --use-angle=swiftshader erzwungen gilt Software nicht als Notlösung, darum
    // hier ein eigener Browser.)
    const ohneSchalter = await chromium.launch();
    const { seite, status } = await oeffne('', { mit: ohneSchalter });
    await warteAufModus(seite, '2d');
    const b = await buehne(seite);
    pruefe('Nur Software-Grafik: 2D statt 3D', b.modus === '2d' && b.grund === 'kein-webgl' && !status.dreiD, `grund=${b.grund}`);
    await ohneSchalter.close();
  }
  {
    // Chrome mit erzwungener Software-Grafik (wie Lighthouse): Der Kontext klappt, aber der
    // Renderer heisst SwiftShader → trotzdem 2D
    const { seite, ctx, status } = await oeffne('');
    await warteAufModus(seite, '2d');
    const b = await buehne(seite);
    pruefe('Renderer „SwiftShader“: 2D statt 3D', b.modus === '2d' && b.grund === 'software-grafik' && !status.dreiD, `grund=${b.grund}`);
    await ctx.close();
  }

  console.log('\n── 3D ──');
  {
    const { seite, ctx, status } = await oeffne('?3d=software', { vorher: LESBAR });
    await warteAufModus(seite, '3d');
    const b = await buehne(seite);
    pruefe('3D startet, wenn alles passt', b.modus === '3d' && b.leinwand && status.dreiD, `modus=${b.modus}, grund=${b.grund}`);
    pruefe('3D: Chips „Ziehen zum Drehen“ und „3D“ sichtbar', b.chipSichtbar);
    pruefe('3D: 2D-Grafik für Screenreader ausgeblendet (nicht doppelt)', await seite.locator('[data-bild2d="pro"]').getAttribute('aria-hidden') === 'true');
    const l = seite.locator('[data-buehne3d] canvas.leinwand-3d');
    pruefe('3D: Leinwand hat Beschriftung und ist per Tab erreichbar',
      (await l.getAttribute('aria-label'))?.includes('Kiesel 1 Pro in Himmelblau') && (await l.getAttribute('tabindex')) === '0');
    const b1 = (await buehne(seite)).bilder; await warteAufBilder(seite, b1 + 5); const b2 = (await buehne(seite)).bilder;
    pruefe('3D: dreht sich von selbst (neue Bilder)', b2 >= b1 + 5, `${b2 - b1} neue Bilder`);

    const hellBlau = await helligkeit(seite);
    await seite.locator('[data-buehne3d] label[title="Mattschwarz"]').click();
    await warteAufBilder(seite, (await buehne(seite)).bilder + 2);
    const hellSchwarz = await helligkeit(seite);
    pruefe('3D: Farbwähler ändert die Materialfarbe', hellBlau - hellSchwarz > 30, `Helligkeit ${hellBlau.toFixed(1)} → ${hellSchwarz.toFixed(1)}`);
    pruefe('3D: Beschriftung folgt der Farbe', (await l.getAttribute('aria-label'))?.includes('Mattschwarz'));

    // Aus dem Bild gescrollt → Schleife schläft
    await seite.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await seite.waitForTimeout(300);
    const s1 = (await buehne(seite)).bilder; await seite.waitForTimeout(1000); const s2 = (await buehne(seite)).bilder;
    pruefe('3D: zeichnet nicht, wenn die Bühne nicht zu sehen ist', s2 === s1, `${s2 - s1} Bilder in 1 s`);
    await seite.evaluate(() => window.scrollTo(0, 0));
    const w1 = (await buehne(seite)).bilder; await warteAufBilder(seite, w1 + 2); const w2 = (await buehne(seite)).bilder;
    pruefe('3D: zeichnet wieder, wenn die Bühne zurück ist', w2 > w1);

    // Kontextverlust erzwingen: WEBGL_lose_context simuliert, dass die Grafikkarte weg ist
    await seite.evaluate(() => document.querySelector('[data-buehne3d] canvas.leinwand-3d').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await warteAufModus(seite, '2d', 5000);
    await seite.waitForTimeout(800); // die 2D-Grafik blendet in 0.6 s ein
    const k = await buehne(seite);
    pruefe('Kontextverlust: zurück auf 2D', k.modus === '2d' && k.grund === 'kontextverlust' && !k.leinwand, `grund=${k.grund}`);
    pruefe('Kontextverlust: 2D-Grafik sichtbar, in der gewählten Farbe', k.svgSichtbar && k.svgHtml.includes('#2F3134'));
    pruefe('Kontextverlust: keine 3D-Chips mehr', !k.chipSichtbar);
    pruefe('Kontextverlust: 2D-Grafik für Screenreader wieder da', await seite.locator('[data-bild2d="pro"]').getAttribute('aria-hidden') === null);
    pruefe('3D: keine JavaScript-Fehler', status.fehler.length === 0, status.fehler.join('; '));
    await ctx.close();
  }
  {
    // Jemand schaltet "weniger Bewegung" ein, während 3D läuft
    const { seite, ctx } = await oeffne('?3d=software');
    await warteAufModus(seite, '3d');
    await seite.emulateMedia({ reducedMotion: 'reduce' });
    await warteAufModus(seite, '2d', 5000);
    const b = await buehne(seite);
    pruefe('Weniger Bewegung während 3D: sofort 2D', b.modus === '2d' && b.grund === 'reduced-motion' && !b.leinwand, `grund=${b.grund}`);
    await ctx.close();
  }
  // Wächter mit künstlichen Bildzeiten (KUNSTZEIT): prüft, ob der Wächter richtig an der
  // Zeichenschleife hängt. Die Regeln selbst prüft pruefe:waechter ohne Browser, die echte
  // Geschwindigkeit misst leistung:startseite (blockiert nichts).
  const wachtLauf = async (ms, warteAuf) => {
    const { seite, ctx, status } = await oeffne('?3d=software', { vorher: KUNSTZEIT, vorherArg: ms });
    await warteAufModus(seite, warteAuf, 30000);
    const r = { ...(await buehne(seite)), bilder3d: await seite.evaluate(() => window.__bilder3d), fehler: status.fehler };
    await ctx.close();
    return r;
  };
  {
    // Schnelles Gerät: 16 ms pro Bild. Nach 30 Bildern muss 3D noch laufen.
    const { seite, ctx } = await oeffne('?3d=software', { vorher: KUNSTZEIT, vorherArg: 16 });
    await warteAufModus(seite, '3d');
    await warteAufBilder(seite, 30);
    const b = await buehne(seite);
    const ms = await seite.evaluate(() => document.querySelector('[data-buehne3d] canvas.leinwand-3d')?.dataset.msProBild);
    pruefe('Wächter bei 16 ms pro Bild: 3D bleibt', b.modus === '3d' && b.bilder >= 30, `modus=${b.modus}, ${b.bilder} Bilder`);
    pruefe('Wächter hält den Median fest (16.0 ms)', ms === '16.0', `data-ms-pro-bild=${ms}`);
    await ctx.close();
  }
  {
    // Überfordertes Gerät: 60 ms pro Bild (unter 25 fps) → 2D nach den 15 Wächter-Bildern
    const r = await wachtLauf(60, '2d');
    pruefe('Zu langsam (60 ms pro Bild): Wächter schaltet auf 2D', r.modus === '2d' && r.grund === 'zu-langsam' && !r.leinwand, `grund=${r.grund}`);
    // 1. Bild nach dem Start hat keine Dauer, dann 15 Wächter-Bilder
    pruefe('Zu langsam: entschieden nach den 15 Wächter-Bildern', r.bilder3d === 16, `${r.bilder3d} Bilder gezeichnet`);
    pruefe('Zu langsam: keine JavaScript-Fehler', r.fehler.length === 0, r.fehler.join('; '));
  }
  {
    // Notbremse: 200 ms pro Bild → nach 3 Aufwärm- und 3 zähen Bildern 2D, ohne auf 15 zu warten
    const r = await wachtLauf(200, '2d');
    pruefe('Notbremse (200 ms pro Bild): 2D', r.modus === '2d' && r.grund === 'zu-langsam' && !r.leinwand, `grund=${r.grund}`);
    pruefe('Notbremse: entschieden nach 6 Wächter-Bildern', r.bilder3d === 7, `${r.bilder3d} Bilder gezeichnet`);
  }

  console.log('\n── Modellwahl: 2D ──');
  // Was auf der Seite zum gewählten Modell passen muss
  const pfadBasis = new URL(basis).pathname;
  const wahl = (seite) => seite.evaluate(() => {
    const e = document.querySelector('[data-buehne3d]');
    const sichtbar = (x) => !!x && x.getClientRects().length > 0;
    const knoepfe = [...document.querySelectorAll('.held .knoepfe a')].filter(sichtbar);
    const bilder = [...e.querySelectorAll('[data-bild2d]')].filter(sichtbar);
    const svg = bilder[0]?.querySelector('svg');
    const leinwand = e.querySelector('canvas.leinwand-3d');
    const text = (a) => a.textContent.replace(/\s+/g, ' ').trim();
    let gespeichert = null;
    try { gespeichert = localStorage.getItem('kiesel-startmodell'); } catch { gespeichert = 'gesperrt'; }
    return {
      html: document.documentElement.dataset.heldModell,
      gedrueckt: [...e.querySelectorAll('[data-modell-wahl]')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.modellWahl).join(),
      bilder: bilder.map((b) => b.dataset.bild2d).join(),
      svgLabel: svg?.getAttribute('aria-label') ?? '', svgHtml: svg?.outerHTML ?? '',
      svgHoehe: svg?.getBoundingClientRect().height ?? 0, animation: svg ? getComputedStyle(svg).animationName : '',
      knoepfe: knoepfe.map((a) => [text(a), a.getAttribute('href')]),
      legende: e.querySelector('legend').textContent, farbe: e.querySelector('input[type="radio"]:checked')?.value, gespeichert,
      modell3d: leinwand?.dataset.modell ?? null, gebaut: leinwand?.dataset.gebaut ?? null,
      uebergang: !!e.querySelector('.leinwand-3d-bild'), modus: e.dataset.modus, grund: e.dataset.grund ?? null,
    };
  });
  // Liste der Abweichungen (leer = alles passt zu Modell id in Farbe farbe)
  function abweichungen(z, id, farbe = 'Himmelblau') {
    const name = MODELLE[id].name, f = [];
    if (z.html !== id) f.push(`html=${z.html}`);
    if (z.gedrueckt !== id) f.push(`gedrückt=${z.gedrueckt}`);
    if (z.bilder !== id) f.push(`2D=${z.bilder}`);
    if (!z.svgLabel.startsWith(`${name} in ${farbe},`)) f.push(`Grafik „${z.svgLabel}“`);
    const soll = [[`${name} entdecken`, pfadBasis + MODELLE[id].pfad], [`Kaufen ${abPreis(id)}: ${name}`, `${pfadBasis}kaufen/?modell=${id}&farbe=${farbe}`]];
    if (JSON.stringify(z.knoepfe) !== JSON.stringify(soll)) f.push(`Knöpfe ${JSON.stringify(z.knoepfe)}`);
    if (z.legende !== `Farbe des ${name}`) f.push(`Legende „${z.legende}“`);
    if (z.farbe !== farbe) f.push(`Farbe=${z.farbe}`);
    return f;
  }
  const passt = (name, z, id, farbe) => { const f = abweichungen(z, id, farbe); pruefe(name, f.length === 0, f.join(', ') || `${MODELLE[id].name}, ${farbe ?? 'Himmelblau'}`); };
  const knopf = (seite, id) => seite.locator(`[data-modell-wahl="${id}"]`);
  const SPEICHER_SETZEN = (wert) => { try { localStorage.setItem('kiesel-startmodell', wert); } catch { /* egal */ } };
  const SPEICHER_GESPERRT = () => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('gesperrt', 'SecurityError'); } });
  // Merkt sich den Zustand beim allerersten Bild (vor dem ersten Zeichnen)
  const ERSTES_BILD = () => requestAnimationFrame(() => {
    window.__erstesBild = { html: document.documentElement.dataset.heldModell ?? null };
  });
  {
    const { seite, ctx, status } = await oeffne('', { kontext: { reducedMotion: 'reduce' } });
    await warteAufModus(seite, '2d');
    let z = await wahl(seite);
    passt('Erster Besuch: Kiesel 1 Pro (Knöpfe, Grafik, Umschalter, Legende)', z, 'pro');
    const hoehePro = z.svgHoehe;
    const tipp = await knopf(seite, 'k1').boundingBox();
    pruefe('Umschalter: Tippflächen mindestens 44 px hoch', tipp.height >= 44, `${tipp.height} px`);

    await knopf(seite, 'k1').click();
    z = await wahl(seite);
    passt('Maus: Kiesel 1 gewählt, alles zieht mit', z, 'k1');
    pruefe('Maus: Wahl gespeichert', z.gespeichert === 'k1', z.gespeichert);
    pruefe('Weniger Bewegung: Wechsel ohne Animation', z.animation === 'none', z.animation);
    // Echter Massstab: Beide Grafiken sind im selben Massstab gezeichnet (1/10 mm). Stimmt die
    // Höhe der SVG im Verhältnis ihrer viewBox, stimmt auch das Handy.
    const soll = 1638 / 1715; // viewBox-Höhen Kiesel 1 / Pro (je 400 Einheiten Rand)
    pruefe('2D im echten Massstab (SVG-Höhe Kiesel 1 / Pro)', Math.abs(z.svgHoehe / hoehePro - soll) < 0.005, `${(z.svgHoehe / hoehePro).toFixed(4)}, soll ${soll.toFixed(4)}`);

    await seite.locator('[data-buehne3d] label[title="Mattschwarz"]').click();
    z = await wahl(seite);
    passt('Farbe wählen: Kiesel 1 in Mattschwarz, Kaufen-Link mit Farbe', z, 'k1', 'Mattschwarz');
    await knopf(seite, 'pro').click();
    z = await wahl(seite);
    passt('Farbe bleibt beim Wechsel: Pro in Mattschwarz', z, 'pro', 'Mattschwarz');
    pruefe('Farbe bleibt: Pro-Grafik wirklich schwarz gezeichnet', z.svgHtml.includes('#2F3134'));

    // Tastatur: Tab-Reihenfolge Kiesel 1 → Kiesel 1 Pro, Enter und Leertaste schalten
    await knopf(seite, 'k1').focus();
    await seite.keyboard.press('Enter');
    z = await wahl(seite);
    passt('Tastatur: Enter wählt Kiesel 1', z, 'k1', 'Mattschwarz');
    await seite.keyboard.press('Tab');
    pruefe('Tastatur: Tab springt zu „Kiesel 1 Pro“', await knopf(seite, 'pro').evaluate((b) => b === document.activeElement));
    await seite.keyboard.press(' ');
    z = await wahl(seite);
    passt('Tastatur: Leertaste wählt Kiesel 1 Pro', z, 'pro', 'Mattschwarz');
    pruefe('Tastatur: Fokus bleibt auf dem Knopf', await knopf(seite, 'pro').evaluate((b) => b === document.activeElement));
    await knopf(seite, 'k1').click();

    // Neuladen: Wahl bleibt, und zwar schon im allerersten Bild (kein Aufblitzen des Pro)
    await seite.addInitScript(ERSTES_BILD);
    await seite.reload({ waitUntil: 'load' });
    z = await wahl(seite);
    passt('Neuladen: Kiesel 1 bleibt gewählt', z, 'k1');
    const erstes = await seite.evaluate(() => window.__erstesBild);
    pruefe('Neuladen: schon das erste Bild zeigt den Kiesel 1', erstes?.html === 'k1', JSON.stringify(erstes));
    pruefe('Modellwahl 2D: keine JavaScript-Fehler', status.fehler.length === 0, status.fehler.join('; '));
    await ctx.close();
  }
  {
    // Mit Animation (2D, weil nur 2 Kerne): Das neue Modell wächst/schrumpft kurz
    const { seite, ctx } = await oeffne('', { vorher: () => Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => 2 }) });
    await warteAufModus(seite, '2d');
    await knopf(seite, 'k1').click();
    const z = await wahl(seite);
    pruefe('2D mit Bewegung: kurze Grössen-Animation beim Wechsel', z.animation === 'wechsel' && abweichungen(z, 'k1').length === 0, z.animation);
    await ctx.close();
  }
  {
    // localStorage gesperrt (z.B. strenge Datenschutz-Einstellung): Pro, Umschalten geht trotzdem
    const { seite, ctx, status } = await oeffne('', { kontext: { reducedMotion: 'reduce' }, vorher: SPEICHER_GESPERRT });
    await warteAufModus(seite, '2d');
    passt('localStorage gesperrt: Kiesel 1 Pro', await wahl(seite), 'pro');
    await knopf(seite, 'k1').click();
    passt('localStorage gesperrt: Umschalten geht trotzdem', await wahl(seite), 'k1');
    pruefe('localStorage gesperrt: keine JavaScript-Fehler', status.fehler.length === 0, status.fehler.join('; '));
    await ctx.close();
  }
  for (const wert of ['xl', 'K1', '"k1"', '', 'null', 'se']) {
    const { seite, ctx } = await oeffne('', { kontext: { reducedMotion: 'reduce' }, vorher: SPEICHER_SETZEN, vorherArg: wert });
    await warteAufModus(seite, '2d');
    passt(`Ungültiger gespeicherter Wert ${JSON.stringify(wert)}: Kiesel 1 Pro`, await wahl(seite), 'pro');
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('', { kontext: { reducedMotion: 'reduce' }, vorher: SPEICHER_SETZEN, vorherArg: 'k1' });
    await warteAufModus(seite, '2d');
    passt('Gültiger gespeicherter Wert "k1": Kiesel 1', await wahl(seite), 'k1');
    await ctx.close();
  }
  {
    // Finger: echtes Tippen (Touch-Ereignisse) auf dem Handy-Bildschirm
    const { seite, ctx } = await oeffne('', { kontext: { reducedMotion: 'reduce', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } });
    await warteAufModus(seite, '2d');
    await knopf(seite, 'k1').tap();
    passt('Finger (390 px): Tippen wählt Kiesel 1', await wahl(seite), 'k1');
    await knopf(seite, 'pro').tap();
    passt('Finger (390 px): Tippen wählt wieder Kiesel 1 Pro', await wahl(seite), 'pro');
    await ctx.close();
  }

  console.log('\n── Modellwahl: 3D ──');
  const warteAufWechsel = (seite, id, ms = 30000) => seite.waitForFunction((m) => {
    const l = document.querySelector('[data-buehne3d] canvas.leinwand-3d');
    return l?.dataset.modell === m && !document.querySelector('.leinwand-3d-bild');
  }, id, { timeout: ms }).then(() => true).catch(() => false);
  {
    const { seite, ctx, status } = await oeffne('?3d=software', { vorher: LESBAR });
    await warteAufModus(seite, '3d');
    let z = await wahl(seite);
    pruefe('3D: zuerst nur das angezeigte Modell gebaut', z.gebaut === 'pro' && z.modell3d === 'pro', `gebaut=${z.gebaut}`);
    await seite.locator('[data-buehne3d] label[title="Mattschwarz"]').click();
    await knopf(seite, 'k1').click();
    const ok = await warteAufWechsel(seite, 'k1');
    z = await wahl(seite);
    pruefe('3D Maus: Kiesel 1 gebaut und angezeigt', ok && z.modell3d === 'k1' && z.gebaut === 'pro k1', `modell=${z.modell3d}, gebaut=${z.gebaut}`);
    passt('3D: Seite zieht mit (Knöpfe, Legende, Farbe)', z, 'k1', 'Mattschwarz');
    await warteAufBilder(seite, (await buehne(seite)).bilder + 2);
    const hell = await helligkeit(seite);
    pruefe('3D: Farbe bleibt beim Wechsel (Kiesel 1 in Mattschwarz)', hell < 80, `Helligkeit ${hell.toFixed(1)}`);
    const l = seite.locator('[data-buehne3d] canvas.leinwand-3d');
    pruefe('3D: Beschriftung der Leinwand folgt dem Modell', (await l.getAttribute('aria-label'))?.startsWith('Kiesel 1 in Mattschwarz, 3D-Modell'));

    // Tastatur, zurück zum Pro: jetzt schon gebaut, es darf nichts neu entstehen
    await knopf(seite, 'pro').focus();
    await seite.keyboard.press('Enter');
    const ok2 = await warteAufWechsel(seite, 'pro');
    z = await wahl(seite);
    pruefe('3D Tastatur: zurück zum Pro, nichts neu gebaut', ok2 && z.gebaut === 'pro k1', `gebaut=${z.gebaut}`);
    pruefe('3D: three.js nur einmal geladen', status.dreiDAnzahl === 1, `${status.dreiDAnzahl}×`);

    // Schnell hin und her: am Ende gilt der letzte Klick
    for (const id of ['k1', 'pro', 'k1', 'pro', 'k1']) await knopf(seite, id).click();
    const ok3 = await warteAufWechsel(seite, 'k1');
    z = await wahl(seite);
    pruefe('3D: schnell hin und her, am Ende der letzte Klick', ok3 && z.modell3d === 'k1' && abweichungen(z, 'k1', 'Mattschwarz').length === 0, `modell=${z.modell3d}`);
    pruefe('3D: Wechsel löst den Wächter nicht aus (läuft weiter in 3D)', z.modus === '3d', `modus=${z.modus}, grund=${z.grund}`);

    // Grafikkarte weg: 2D zeigt das gewählte Modell in der gewählten Farbe
    await l.evaluate((c) => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await warteAufModus(seite, '2d', 5000);
    z = await wahl(seite);
    passt('Kontextverlust nach Wechsel: 2D zeigt Kiesel 1 in Mattschwarz', z, 'k1', 'Mattschwarz');
    pruefe('Kontextverlust nach Wechsel: Grafik schwarz gezeichnet', z.svgHtml.includes('#2F3134'));
    await knopf(seite, 'pro').click();
    passt('Kontextverlust: Umschalter geht in 2D weiter', await wahl(seite), 'pro', 'Mattschwarz');
    pruefe('Modellwahl 3D: keine JavaScript-Fehler', status.fehler.length === 0, status.fehler.join('; '));
    await ctx.close();
  }
  {
    // Gespeicherter Kiesel 1: 3D baut nur ihn, der Pro entsteht erst beim Umschalten
    // Schriften kommen 400 ms später (wie auf einer langsamen Leitung). baueKiesel() wartet beim
    // Sperrbildschirm darauf, so bleibt ein sicheres Zeitfenster, um mitten ins Bauen zu klicken.
    const LANGSAME_SCHRIFT = () => {
      const laden = document.fonts.load.bind(document.fonts);
      document.fonts.load = (...a) => new Promise((r) => setTimeout(r, 400)).then(() => laden(...a));
    };
    const { seite, ctx } = await oeffne('?3d=software', { vorher: `(${LESBAR})(); (${SPEICHER_SETZEN})('k1'); (${LANGSAME_SCHRIFT})();` });
    await warteAufModus(seite, '3d');
    const z = await wahl(seite);
    pruefe('3D mit gespeichertem Kiesel 1: nur er ist gebaut', z.gebaut === 'k1' && z.modell3d === 'k1', `gebaut=${z.gebaut}`);
    // Farbe wählen, während der Pro noch gebaut wird: Er muss trotzdem in der neuen Farbe kommen
    await knopf(seite, 'pro').click();
    await seite.waitForTimeout(150);
    const nochAmBauen = await seite.evaluate(() => document.querySelector('.leinwand-3d').dataset.gebaut === 'k1');
    await seite.locator('[data-buehne3d] label[title="Mattschwarz"]').click();
    await warteAufWechsel(seite, 'pro');
    pruefe('3D: Farbklick fiel wirklich ins Bauen (Testaufbau)', nochAmBauen);
    await warteAufBilder(seite, (await buehne(seite)).bilder + 2);
    const hell = await helligkeit(seite);
    pruefe('3D: Farbe während des Bauens gewählt, Pro kommt trotzdem in Mattschwarz', hell < 80, `Helligkeit ${hell.toFixed(1)}`);
    await ctx.close();
  }
  {
    // Finger in 3D auf dem Handy-Bildschirm
    const { seite, ctx } = await oeffne('?3d=software', { kontext: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } });
    await warteAufModus(seite, '3d');
    await knopf(seite, 'k1').scrollIntoViewIfNeeded();
    await knopf(seite, 'k1').tap();
    const ok = await warteAufWechsel(seite, 'k1');
    passt('3D Finger (390 px): Tippen wählt Kiesel 1', await wahl(seite), 'k1');
    pruefe('3D Finger: Modell gewechselt', ok);
    await ctx.close();
  }
  {
    // Echter Massstab und Proportionen: Handy gerade von hinten (?3d=gerade), aus den Pixeln
    // der Leinwand gemessen und mit dem Bauplan verglichen (= 2D-Zeichnung, pruefe:bauplan)
    const vermesse = (seite, MM_BREITE) => seite.evaluate((MM_BREITE) => {
      const q = document.querySelector('[data-buehne3d] canvas.leinwand-3d');
      const c = document.createElement('canvas');
      c.width = q.width; c.height = q.height;
      const g = c.getContext('2d');
      g.drawImage(q, 0, 0);
      const { data: d, width: B, height: H } = g.getImageData(0, 0, c.width, c.height);
      const px = (x, y) => (y * B + x) * 4;
      // Handy = deckende Pixel (der Bodenschatten ist höchstens halb deckend)
      let oben = -1, unten = -1;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < B; x++) if (d[px(x, y) + 3] > 230) { if (oben < 0) oben = y; unten = y; break; }
      }
      const hoehe = unten - oben + 1;
      // Breite weit unten messen, wo keine Knöpfe seitlich vorstehen
      const zeile = Math.round(oben + 0.9 * hoehe);
      let links = -1, rechts = -1;
      for (let x = 0; x < B; x++) if (d[px(x, zeile) + 3] > 230) { if (links < 0) links = x; rechts = x; }
      const breite = rechts - links + 1;
      // Hauptkamera: Rechteck um alle Pixel oben links, die nicht die Farbe des Rückens haben
      // (Metallring, Fassung, Glas), davon die Mitte. Der Metallring hat eine scharfe Aussenkante,
      // Glanzflecken im Glas verschieben die Mitte darum nicht (einen Schwerpunkt schon).
      // Der gemessene Radius zeigt, ob wirklich der ganze Ring erfasst wurde.
      const ruecken = px(Math.round(links + 0.5 * breite), Math.round(oben + 0.3 * hoehe));
      const anders = (i) => Math.abs(d[i] - d[ruecken]) + Math.abs(d[i + 1] - d[ruecken + 1]) + Math.abs(d[i + 2] - d[ruecken + 2]) > 45;
      // Die Ecke ist rund: Ein Streifen von 2 mm entlang des Umrisses (Rahmen, Fase) zählt nicht.
      // Der Ring liegt 2.8 mm vom Rand (konzentrisch zur Ecke), passt also ganz hinein. Ein
      // verschobener Ring würde abgeschnitten, das fiele beim Radius auf.
      const streifen = 2.0 * breite / MM_BREITE;
      const randLinks = (y) => { for (let x = 0; x < B; x++) if (d[px(x, y) + 3] > 230) return x; return B; };
      const randOben = (x) => { for (let y = 0; y < H; y++) if (d[px(x, y) + 3] > 230) return y; return H; };
      const obenBei = {};
      let x0 = B, x1 = -1, y0 = H, y1 = -1;
      for (let y = oben; y < oben + 0.2 * hoehe; y++) {
        const rl = randLinks(y);
        for (let x = links; x < links + 0.3 * breite; x++) {
          const i = px(x, y);
          if (x - rl <= streifen || y - (obenBei[x] ??= randOben(x)) <= streifen) continue;
          if (d[i + 3] > 230 && anders(i)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        }
      }
      return {
        hoehe, breite, linseX: ((x0 + x1) / 2 - links) / breite, linseY: ((y0 + y1) / 2 - oben) / hoehe,
        linseR: (x1 - x0 + 1 + y1 - y0 + 1) / 4 / breite, // Anteil der Breite
      };
    }, MM_BREITE);
    const mass = {};
    for (const id of ['pro', 'k1']) {
      const { seite, ctx } = await oeffne('?3d=gerade', { vorher: `(${LESBAR})(); localStorage.setItem('kiesel-startmodell', ${JSON.stringify(id)});` });
      await warteAufModus(seite, '3d');
      await warteAufBilder(seite, 1);
      mass[id] = await vermesse(seite, bauplan(id).W);
      await ctx.close();
    }
    for (const id of ['k1', 'pro']) {
      const p = bauplan(id), m = mass[id], k = p.kameras[0];
      const soll = { seite: p.W / p.H, x: (k.x + p.W / 2) / p.W, y: (p.H / 2 - k.y) / p.H };
      const ist = { seite: m.breite / m.hoehe, x: m.linseX, y: m.linseY };
      const zahl = (v) => v.toFixed(3);
      pruefe(`${MODELLE[id].name} 3D: Seitenverhältnis wie 2D`, Math.abs(ist.seite / soll.seite - 1) < 0.02, `3D ${zahl(ist.seite)}, 2D ${zahl(soll.seite)}`);
      const mm = (anteil, strecke) => (anteil * strecke).toFixed(1);
      // Toleranz 0.6 mm / 0.75 mm: Der Ring steht 1.6 mm über dem Rücken, also näher an der
      // Kamera, und die Perspektive rückt ihn darum ein paar Zehntel nach aussen (oben links).
      pruefe(`${MODELLE[id].name} 3D: Hauptkamera an derselben Stelle wie 2D`, Math.abs(ist.x - soll.x) < 0.01 && Math.abs(ist.y - soll.y) < 0.006,
        `3D ${mm(ist.x, p.W)}/${mm(ist.y, p.H)} mm, 2D ${mm(soll.x, p.W)}/${mm(soll.y, p.H)} mm vom Rand links/oben`);
      // Bestätigt, dass die Messung den ganzen Metallring erfasst hat (Radius wie im Bauplan)
      pruefe(`${MODELLE[id].name} 3D: Messung erfasst den ganzen Linsenring (Radius)`, Math.abs(m.linseR * p.W - k.r) < 0.4, `${mm(m.linseR, p.W)} mm, soll ${k.r} mm`);
    }
    const soll = bauplan('k1').H / bauplan('pro').H;
    pruefe('3D im echten Massstab: Höhe Kiesel 1 / Pro im Bild', Math.abs(mass.k1.hoehe / mass.pro.hoehe / soll - 1) < 0.01,
      `${(mass.k1.hoehe / mass.pro.hoehe).toFixed(4)}, soll ${soll.toFixed(4)} (${mass.k1.hoehe} / ${mass.pro.hoehe} px)`);
  }
  {
    // Übergang Bild für Bild (künstliche Uhr, 16 ms pro Bild): Grösse wandert stetig von der
    // Pro-Höhe zur Kiesel-1-Höhe, der Schnappschuss blendet aus, Dauer ca. 350 ms
    const { seite, ctx } = await oeffne('?3d=gerade', { vorher: `(${LESBAR})(); (${KUNSTZEIT})(16);`, kontext: { viewport: { width: 900, height: 700 } } });
    await warteAufModus(seite, '3d');
    await warteAufBilder(seite, 1);
    const verlauf = await seite.evaluate(() => new Promise((fertig) => {
      const q = document.querySelector('[data-buehne3d] canvas.leinwand-3d');
      const c = document.createElement('canvas');
      const g = c.getContext('2d', { willReadFrequently: true });
      const hoehe = () => {
        c.width = q.width; c.height = q.height;
        g.drawImage(q, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let oben = -1, unten = -1;
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x += 2) if (d[(y * c.width + x) * 4 + 3] > 230) { if (oben < 0) oben = y; unten = y; break; }
        return unten - oben + 1;
      };
      const start = hoehe(), schritte = [], bis = performance.now() + 30000;
      let gesehen = false;
      function schritt() {
        const bild = document.querySelector('.leinwand-3d-bild');
        if (bild) { gesehen = true; schritte.push({ h: hoehe(), deck: Number(bild.style.opacity || 1) }); }
        if ((gesehen && !bild) || performance.now() > bis) { fertig({ start, schritte, ende: hoehe(), gesehen }); return; }
        requestAnimationFrame(schritt);
      }
      document.querySelector('[data-modell-wahl="k1"]').click();
      requestAnimationFrame(schritt);
    }));
    const h = verlauf.schritte.map((x) => x.h);
    const stetig = h.every((x, i) => i === 0 || x <= h[i - 1] + 1);
    const deck = verlauf.schritte.map((x) => x.deck);
    pruefe('Übergang: Schnappschuss des alten Modells blendet über', verlauf.gesehen && deck.every((x, i) => i === 0 || x <= deck[i - 1]) && deck.at(-1) === 0,
      `Deckkraft ${deck.map((x) => x.toFixed(2)).join(' ')}`);
    pruefe('Übergang: Grösse wandert stetig vom Pro zum Kiesel 1', stetig && Math.abs(h[0] - verlauf.start) <= 2 && verlauf.ende < verlauf.start,
      `${verlauf.start} → ${h.join(' ')} → ${verlauf.ende} px`);
    // 350 ms bei 16 ms pro Bild = 22 Bilder, dazu das Bild, in dem der Wechsel beginnt
    pruefe('Übergang: dauert ca. 350 ms', h.length >= 20 && h.length <= 25, `${h.length} Bilder à 16 ms`);
    await ctx.close();
  }

  console.log('\n── FAQ mit Tastatur ──');
  {
    const { seite, ctx } = await oeffne('', { kontext: { reducedMotion: 'reduce' } });
    const knoepfe = seite.locator('[data-akkordeon] button');
    const zustand = (i) => knoepfe.nth(i).evaluate((k) => ({ offen: k.getAttribute('aria-expanded'), sichtbar: !document.getElementById(k.getAttribute('aria-controls')).hidden }));
    let z = await zustand(0);
    pruefe('Erste Frage ist anfangs offen', z.offen === 'true' && z.sichtbar);
    z = await zustand(1);
    pruefe('Zweite Frage ist anfangs zu', z.offen === 'false' && !z.sichtbar);
    await knoepfe.nth(0).focus();
    await seite.keyboard.press('Tab');
    pruefe('Tab springt zur nächsten Frage', await knoepfe.nth(1).evaluate((k) => k === document.activeElement));
    await seite.keyboard.press('Enter');
    z = await zustand(1);
    pruefe('Enter öffnet (aria-expanded="true", Antwort sichtbar)', z.offen === 'true' && z.sichtbar);
    await seite.keyboard.press(' ');
    z = await zustand(1);
    pruefe('Leertaste schliesst (aria-expanded="false", Antwort versteckt)', z.offen === 'false' && !z.sichtbar);
    await seite.keyboard.press(' ');
    z = await zustand(1);
    pruefe('Leertaste öffnet wieder', z.offen === 'true' && z.sichtbar);

    console.log('\n── Zoom-Leiste ──');
    await seite.locator('.zoom-leiste button[data-stufe="10"]').click();
    await seite.waitForTimeout(900); // die Zoomfahrt dauert gut eine halbe Sekunde
    const zoom = await seite.evaluate(() => {
      const f = document.querySelector('[data-zoom-teaser]');
      return { text: f.querySelector('[data-linsen-text]').textContent, breite: Number(f.querySelector('[data-ebene="tele"] svg').getAttribute('viewBox').split(' ')[2]) };
    });
    // Gleiche Unschärfe wie die anderen Kamera-Demos prüft pruefe:kamera-stellen
    pruefe('10x zeigt den engen Ausschnitt (160 breit) und den passenden Text', zoom.breite === 160 && zoom.text === 'Tele · 10x digital', `${zoom.breite}, „${zoom.text}“`);
    await ctx.close();
  }

  console.log('\n── Andere Seiten ──');
  for (const adresse of ['kaufen/', 'kiesel-1-pro/', 'designsystem/', 'designsystem/spielwiese/', 'faq/']) {
    const { ctx, status } = await oeffne(adresse);
    pruefe(`${adresse} lädt kein three.js`, !status.dreiD);
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
