// Prüft die Startseite im echten Browser (Playwright + Chromium):
//
//   npm run pruefe:startseite
//
// Vor allem: Greift die 2D-Ausweichlösung der 3D-Bühne wirklich, und lädt sie dann auch
// kein three.js? Dazu FAQ mit Tastatur, Zoom-Leiste, Farbwähler und: Andere Seiten laden
// nie three.js. Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
//
// Headless Chrome hat keine Grafikkarte. Ohne ?3d=software sagt die Seite darum zu Recht
// "kein-webgl" (Software-Grafik = heisses Handy). Mit ?3d=software dürfen wir 3D trotzdem
// testen. Die vsync-Schalter braucht headless Chrome mit Software-Grafik, sonst bleibt
// requestAnimationFrame nach ein paar Bildern stehen.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';

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
async function oeffne(adresse = '', { kontext = {}, vorher, mit = browser } = {}) {
  const ctx = await mit.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { dreiD: false, fehler: [] };
  seite.on('request', (r) => { if (DREI_D.test(new URL(r.url()).pathname)) status.dreiD = true; });
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  if (vorher) await seite.addInitScript(vorher);
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  return { seite, ctx, status };
}

const buehne = (seite) => seite.evaluate(() => {
  const e = document.querySelector('[data-buehne3d]');
  const svg = e.querySelector('[data-bild2d] svg');
  const leinwand = e.querySelector('canvas');
  const chip = e.querySelector('[data-nur3d]');
  return {
    modus: e.dataset.modus, grund: e.dataset.grund ?? null,
    leinwand: !!leinwand, bilder: Number(leinwand?.dataset.bilder ?? 0),
    svgSichtbar: !!svg && svg.getBoundingClientRect().height > 100 && getComputedStyle(svg.parentElement).opacity === '1',
    svgHtml: svg?.outerHTML ?? '', chipSichtbar: chip ? !chip.hidden : false,
  };
});
const warteAufModus = (seite, modus, ms = 20000) => seite.waitForFunction(
  (m) => document.querySelector('[data-buehne3d]').dataset.modus === m, modus, { timeout: ms }).catch(() => {});
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
  const quelle = document.querySelector('[data-buehne3d] canvas');
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
    await seite.waitForTimeout(1500);
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
    await seite.waitForTimeout(1500);
    const b = await buehne(seite);
    pruefe('2 Prozessorkerne: 2D statt 3D', b.modus === '2d' && b.grund === 'schwaches-geraet' && !b.leinwand, `grund=${b.grund}`);
    pruefe('2 Prozessorkerne: three.js wird nicht geladen', !status.dreiD);
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('?3d=software', { vorher: () => Object.defineProperty(Navigator.prototype, 'connection', { get: () => ({ saveData: true }) }) });
    await seite.waitForTimeout(1500);
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
    await seite.waitForTimeout(1500);
    const b = await buehne(seite);
    pruefe('Nur Software-Grafik: 2D statt 3D', b.modus === '2d' && b.grund === 'kein-webgl' && !status.dreiD, `grund=${b.grund}`);
    await ohneSchalter.close();
  }
  {
    // Chrome mit erzwungener Software-Grafik (wie Lighthouse): Der Kontext klappt, aber der
    // Renderer heisst SwiftShader → trotzdem 2D
    const { seite, ctx, status } = await oeffne('');
    await seite.waitForTimeout(1500);
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
    pruefe('3D: 2D-Grafik für Screenreader ausgeblendet (nicht doppelt)', await seite.locator('[data-bild2d]').getAttribute('aria-hidden') === 'true');
    const l = seite.locator('[data-buehne3d] canvas');
    pruefe('3D: Leinwand hat Beschriftung und ist per Tab erreichbar',
      (await l.getAttribute('aria-label'))?.includes('Kiesel 1 Pro in Himmelblau') && (await l.getAttribute('tabindex')) === '0');
    const b1 = (await buehne(seite)).bilder; await seite.waitForTimeout(1000); const b2 = (await buehne(seite)).bilder;
    pruefe('3D: dreht sich von selbst (neue Bilder)', b2 > b1 + 10, `${b2 - b1} Bilder in 1 s`);

    const hellBlau = await helligkeit(seite);
    await seite.locator('[data-buehne3d] label[title="Mattschwarz"]').click();
    await seite.waitForTimeout(400);
    const hellSchwarz = await helligkeit(seite);
    pruefe('3D: Farbwähler ändert die Materialfarbe', hellBlau - hellSchwarz > 30, `Helligkeit ${hellBlau.toFixed(1)} → ${hellSchwarz.toFixed(1)}`);
    pruefe('3D: Beschriftung folgt der Farbe', (await l.getAttribute('aria-label'))?.includes('Mattschwarz'));

    // Aus dem Bild gescrollt → Schleife schläft
    await seite.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await seite.waitForTimeout(300);
    const s1 = (await buehne(seite)).bilder; await seite.waitForTimeout(1000); const s2 = (await buehne(seite)).bilder;
    pruefe('3D: zeichnet nicht, wenn die Bühne nicht zu sehen ist', s2 === s1, `${s2 - s1} Bilder in 1 s`);
    await seite.evaluate(() => window.scrollTo(0, 0));
    await seite.waitForTimeout(500);
    const w1 = (await buehne(seite)).bilder; await seite.waitForTimeout(500); const w2 = (await buehne(seite)).bilder;
    pruefe('3D: zeichnet wieder, wenn die Bühne zurück ist', w2 > w1);

    // Kontextverlust erzwingen: WEBGL_lose_context simuliert, dass die Grafikkarte weg ist
    await seite.evaluate(() => document.querySelector('[data-buehne3d] canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await warteAufModus(seite, '2d', 5000);
    await seite.waitForTimeout(800); // die 2D-Grafik blendet in 0.6 s ein
    const k = await buehne(seite);
    pruefe('Kontextverlust: zurück auf 2D', k.modus === '2d' && k.grund === 'kontextverlust' && !k.leinwand, `grund=${k.grund}`);
    pruefe('Kontextverlust: 2D-Grafik sichtbar, in der gewählten Farbe', k.svgSichtbar && k.svgHtml.includes('#2F3134'));
    pruefe('Kontextverlust: keine 3D-Chips mehr', !k.chipSichtbar);
    pruefe('Kontextverlust: 2D-Grafik für Screenreader wieder da', await seite.locator('[data-bild2d]').getAttribute('aria-hidden') === null);
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
  {
    // Wächter: jedes Bild künstlich 60 ms blockieren (wie ein überfordertes Gerät)
    const { seite, ctx } = await oeffne('?3d=software', {
      vorher: () => {
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (f) => raf((t) => { const ende = performance.now() + 60; while (performance.now() < ende); f(t); });
      },
    });
    await warteAufModus(seite, '2d', 30000);
    const b = await buehne(seite);
    pruefe('Zu langsam (unter 25 fps): Wächter schaltet auf 2D', b.modus === '2d' && b.grund === 'zu-langsam' && !b.leinwand, `grund=${b.grund}`);
    await ctx.close();
  }
  {
    // Notbremse: jedes Bild 200 ms blockieren → nach 3 Aufwärm- und 3 zähen Bildern 2D,
    // also nach etwa 1.5 s statt nach 15 Bildern (3 s)
    const { seite, ctx } = await oeffne('?3d=software', {
      vorher: () => {
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (f) => raf((t) => { const ende = performance.now() + 200; while (performance.now() < ende); f(t); });
      },
    });
    await warteAufModus(seite, '3d', 30000);
    const t0 = Date.now();
    await warteAufModus(seite, '2d', 30000);
    const sekunden = (Date.now() - t0) / 1000;
    const b = await buehne(seite);
    pruefe('Notbremse (sehr langsam): nach wenigen Bildern 2D', b.grund === 'zu-langsam' && sekunden < 2.5, `${sekunden.toFixed(1)} s nach dem Start`);
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
    await seite.waitForTimeout(300); // der Ausschnitt wechselt im nächsten Animationsbild
    const zoom = await seite.evaluate(() => {
      const f = document.querySelector('[data-zoom-teaser]');
      return { text: f.querySelector('[data-zoom-text]').textContent, breite: Number(f.querySelector('svg').getAttribute('viewBox').split(' ')[2]) };
    });
    pruefe('10x zeigt den engen Ausschnitt (160 breit) und den passenden Text', zoom.breite === 160 && zoom.text.startsWith('10x'), `${zoom.breite}, „${zoom.text}“`);
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
