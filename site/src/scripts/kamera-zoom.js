// Kamera-Zoom (Etappe 5): stufenloser Zoom, Linsenwechsel bei 3x, auf /funktionen/ dazu acht
// versteckte Details im Alpenpanorama. Gestartet wird der Motor nur von ZoomBild.astro, dem
// gemeinsamen Zoom-Bild aller vier Zoom-Stellen (Startseite, /kiesel-1/, /kiesel-1-pro/,
// /funktionen/). Die Einstellungen stehen als data-Attribute am Bild, die Rechnung
// (Zoom-Umrechnung, Unschärfe, Linsen-Label) in src/lib/kamera.js. Hier steckt nur das Verhalten.
//
// Begriffe
//   z      Kamera-Zoom, wie ihn die Kamera-App anzeigt (0.5x … 10x)
//   Z      Bild-Zoom im Panorama: 1 = ganzes Bild (1600 breit), 8 = 200 breit
//   blick  Punkt im 1600 × 1000-Bild, auf den die Kamera zielt
//   mix    0 = Hauptkamera, 1 = Tele-Linse (nur Pro). Dazwischen = mitten im Wechsel
//
// Ebenen (je ein <svg> mit <use> auf dieselbe Szene, gestapelt; das SVG zeichnet über seinen
// Rand hinaus, darum zeigt weder der Versatz noch die Unschärfe je einen leeren Rand):
//   haupt  Hauptkamera: 0.5x bis 1x optisch (variable Linse), darüber digital, wird weich
//   tele   nur Pro: ab 3x optisch scharf, darüber digital aus dem Tele-Bild
//   k1     nur im Vergleich: der Kiesel 1 (= Hauptkamera, aber nie Tele, max. 5x)
//
// Linsenwechsel (Pro, beim Überschreiten von 3x in beide Richtungen), 420 ms in zwei Phasen:
//   1. 0–210 ms Überblendung: Die Tele-Ebene liegt oben, ihre Deckkraft geht von 0 auf 1.
//      Versatz: Die Tele-Linse sitzt neben der Hauptkamera, darum liegen die zwei Bilder
//      nicht exakt übereinander. Das neue Bild gleitet dabei ein paar Pixel an seinen Platz.
//   2. 170–420 ms Fokus: Die neue Linse kommt noch unscharf herein (etwa so weich wie die
//      Hauptkamera kurz vor 3x), dann rastet die Schärfe sichtbar ein, mit einem Hauch
//      Vergrösserung wie beim echten Nachfokussieren. Das ist der „Aha“-Moment.
//   Dazu wechselt im Chip die leuchtende Linse (mit Ring-Puls) und der Text.
//
// Aufwärmen: Eine Ebene, die ganz versteckt war (visibility: hidden), zeichnet der Browser im
// ersten Bild nach dem Einblenden noch nicht, sie bleibt ein Bild lang leer (gemessen in
// pruefe:kamera). Darum zeichnet die Ebene, die als Nächstes kommt, in der Nähe von 3x
// schon unsichtbar mit (opacity 0), weit weg ist sie ganz aus (spart Arbeit). Springt der
// Zoom trotzdem direkt über 3x (Chip bei „weniger Bewegung“), wartet der Wechsel zwei Bilder.
//   Weil mix stetig läuft, kann ein Wechsel mittendrin umkehren (Regler hin und her um
//   3x), ohne dass etwas springt. Bei „weniger Bewegung“ wechselt die Linse sofort.
//
// Versteckte Details (nur mit data-details, also nur auf /funktionen/): gefunden, sobald
// eines ab Bild-Zoom 5 nicht nur am Rand im Bild ist (erst nach der ersten eigenen
// Bedienung) oder angeflogen wurde. Dann: Vorschaubild zeigt es, Zähler zählt, und solange
// es im Bild ist, liegt der Fokusring darum (von mehreren das zuletzt gefundene, sonst das
// mittigste).
// Zielen (gehört zu den Details, also auch nur auf /funktionen/): Tippen oder Klicken
// schwenkt dorthin, mit der Maus ziehen verschiebt, mit dem Finger waagrecht ziehen auch
// (senkrecht scrollt die Seite).
import { crop, begrenze, ZOOM_TARGETS } from '../lib/kiesel-draw/ausschnitt.js';
import { bildZoom, kameraZoom, rund, zahl, UNSCHAERFE, linseBei, linsenText, schaerfeText } from '../lib/kamera.js';
import { MAX_ZOOM } from '../data/kamera.js';

// Für bestehende Skripte, die die Rechnung von hier holen
export { bildZoom, kameraZoom, rund, zahl, UNSCHAERFE };

export const WECHSEL_MS = 420;      // Dauer des Linsenwechsels
const BLENDE_BIS = 0.5;             // Anteil davon für die Überblendung
const FOKUS_AB = 0.4;               // ab hier rastet die Schärfe ein
const VERSATZ = 0.006;              // Versatz der zwei Linsen: Anteil der Bildbreite
const FOKUS_PX = 1.4;               // Zusatz-Unschärfe der neuen Linse am Anfang (bei 600 px)
const FOKUS_GROESSER = 0.012;       // … und so viel grösser (rastet auf 1 ein)
const WARM = { tele: 2.2, haupt: 4.5 }; // Tele zeichnet ab 2.2x mit, die Hauptkamera bis 4.5x
const WARM_BILDER = 2;              // so viele Bilder muss eine Ebene gezeichnet sein vor dem Wechsel
const RING_AB = 3.5, FUND_AB = 5;   // Bild-Zoom: Fokusring sichtbar ab / Detail gilt als gefunden ab
const ZIEL_ZOOM = 8;                // Zoom beim Anfliegen eines Details

const glatt = (t) => t * t * (3 - 2 * t);
const ausrollen = (t) => 1 - (1 - t) ** 3;
const hinUndHer = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const ruhig = matchMedia('(prefers-reduced-motion: reduce)');

// fenster: das Zoom-Bild (ZoomBild.astro, [data-zoom-bild]). Seine data-Attribute:
//   data-modell   'pro' | 'k1' (bestimmt die Linsen und den grössten Zoom)
//   data-start    Zoom beim Laden   data-blick  "x,y" im 1600 × 1000-Bild
//   data-details  versteckte Details suchen, Bild verschieben (nur /funktionen/)
// Die Bedienung drumherum (Zoom-Skala oder Zoom-Leiste, Linsen-Leiste, Vorschaubilder) sucht
// der Motor im umgebenden Baustein, dem nächsten Element mit data-kamera.
// Nach jeder neuen Beschriftung meldet das Bild „kiesel:kamera“ mit { z, linse }: Bausteine
// mit eigenen Texten (der Zoom-Vergleich) hängen sich daran.
export function starteKamera(fenster) {
  const wurzel = fenster.closest('[data-kamera]') ?? fenster.parentElement;
  const modell = fenster.dataset.modell;
  const max = MAX_ZOOM[modell];
  const start = Number(fenster.dataset.start);
  const startBlick = fenster.dataset.blick.split(',').map(Number);
  const details = fenster.hasAttribute('data-details');
  const ebenen = [...fenster.querySelectorAll('[data-ebene]')].map((el) => ({ el, art: el.dataset.ebene, svg: el.querySelector('svg') }));
  const hatTele = ebenen.some((e) => e.art === 'tele');
  const skala = wurzel.querySelector('[data-zoom-skala]');
  const regler = wurzel.querySelector('[data-zoom-regler]');
  const stufen = [...wurzel.querySelectorAll('[data-stufe]')];
  const abschnitte = [...wurzel.querySelectorAll('[data-linsenabschnitt]')];
  const linsenFeld = fenster.querySelector('[data-linsen-text]');
  const bildtext = fenster.querySelector('[data-bildtext]');
  const ansage = wurzel.querySelector('[data-ansage]');
  // Nur mit Details
  const kacheln = details ? [...wurzel.querySelectorAll('[data-detail]')] : [];
  const zaehler = details ? wurzel.querySelector('[data-entdeckt]') : null;
  const fundpunkte = details ? [...wurzel.querySelectorAll('[data-fundpunkt]')] : [];
  const fokus = details ? fenster.querySelector('[data-fokusring]') : null;
  const fokustext = details ? fenster.querySelector('[data-fokustext]') : null;
  const unschaerfe = {}; // zuletzt gesetzte Unschärfe je Ebene, px bei 600 px Breite (für Tests)

  let z = start;
  let blick = [...startBlick];
  let linse = hatTele ? linseBei(modell, z) : 'haupt';
  let mix = linse === 'tele' ? 1 : 0;
  let wechsel = null;   // { von, nach, t0 }
  let fahrt = null;     // Zoomfahrt oder Flug zu einem Detail
  let geplant = 0;
  let bild = 0; // Bildzähler fürs Aufwärmen
  for (const e of ebenen) e.warmSeit = -WARM_BILDER; // beim Laden ist alles schon gezeichnet
  let letzteBeschriftung = '';
  const entdeckt = new Set();
  let neuster = null;   // zuletzt gefundenes Detail (bekommt den Fokusring, wenn im Bild)
  let ansicht = null;   // aktueller Ausschnitt: { vx, vy, vw, vh, W, H, s } (s = px pro Bild-Einheit)
  // Marken zeigen und zählen erst, wenn jemand selbst zoomt: Die zwei Details, die beim
  // Laden schon im Bild sind, wären sonst ohne Zutun „entdeckt“.
  let bedient = false;

  // ── Regler: logarithmisch, damit 0.5x–3x nicht zusammengequetscht sind ──
  const LOG = Math.log(max / 0.5);
  const alsWert = (zz) => Math.round((1000 * Math.log(zz / 0.5)) / LOG);
  const ausWert = (v) => 0.5 * Math.exp((v / 1000) * LOG);
  const klemme = (zz) => Math.min(max, Math.max(0.5, zz));

  function sage(text) {
    if (!ansage) return;
    // Gleicher Text zweimal hintereinander würde sonst nicht vorgelesen
    ansage.textContent = ansage.textContent === text ? text + ' ' : text;
  }

  // ── Zeichnen: ein Bild pro requestAnimationFrame, nur solange sich etwas bewegt ──
  function plane() {
    if (!geplant) geplant = requestAnimationFrame(zeichne);
  }

  function zeichne(jetzt) {
    geplant = 0;
    let weiter = false;

    // Laufende Fahrt (Zoomstufe oder Flug) bestimmt z und blick
    if (fahrt) {
      // t0 kommt aus performance.now(), jetzt vom Bildanfang und kann minimal früher sein
      const t = ruhig.matches ? 1 : Math.min(1, Math.max(0, (jetzt - fahrt.t0) / fahrt.dauer));
      fahrt.schritt(t);
      if (t < 1) weiter = true;
      else {
        const fertig = fahrt.fertig;
        fahrt = null;
        fertig?.();
      }
    }

    bild++;
    const zr = rund(z);
    // Linsenwechsel auslösen, sobald die angezeigte Zahl 3x erreicht oder unterschreitet.
    // Die neue Ebene muss aber schon WARM_BILDER Bilder lang gezeichnet sein (Aufwärmen).
    const soll = hatTele ? linseBei(modell, zr) : 'haupt';
    if (soll !== linse) {
      const neue = ebenen.find((e) => e.art === soll);
      neue.warmSeit ??= bild;
      if (bild - neue.warmSeit < WARM_BILDER) weiter = true; // erst noch zeichnen lassen
      else {
        linse = soll;
        wechsel = { von: mix, nach: soll === 'tele' ? 1 : 0, t0: jetzt };
        sage(soll === 'tele' ? 'Wechsel auf die Tele-Linse, 3-fach optisch' : 'Wechsel zurück auf die Hauptkamera');
      }
    }
    let fokus = 0; // 1 = neue Linse ganz unscharf, 0 = eingerastet
    if (wechsel) {
      const u = ruhig.matches ? 1 : Math.min(1, Math.max(0, (jetzt - wechsel.t0) / WECHSEL_MS));
      mix = wechsel.von + (wechsel.nach - wechsel.von) * hinUndHer(Math.min(1, u / BLENDE_BIS));
      fokus = u < FOKUS_AB ? 1 : (1 - (u - FOKUS_AB) / (1 - FOKUS_AB)) ** 2;
      if (u < 1) weiter = true;
      else wechsel = null;
    }
    // Aufwärmen und Abkühlen: Welche Ebenen müssen gezeichnet sein (sichtbar oder mit
    // Deckkraft 0 bereit)? Erst nach dem Wechsel entscheiden, sonst bliebe die alte Ebene
    // an, wenn danach kein Bild mehr kommt (bei „weniger Bewegung“).
    for (const e of ebenen) {
      const noetig = e.art === 'k1' || e.art === linse || e.art === soll || !!wechsel
        || (e.art === 'tele' ? zr >= WARM.tele : zr <= WARM.haupt);
      if (noetig) e.warmSeit ??= bild;
      else e.warmSeit = null;
    }

    // Ausschnitt
    const Z = bildZoom(z);
    const [cx, cy] = begrenze(blick[0], blick[1], Z);
    const vb = crop(cx, cy, Z);
    const W = fenster.clientWidth, H = fenster.clientHeight;
    const fak = Math.max(W, H * 1.6) / 600; // px bei 600 px Breite → echte px
    const neu = linse; // die Linse, die gerade hereinkommt
    for (const e of ebenen) {
      if (e.svg.getAttribute('viewBox') !== vb) e.svg.setAttribute('viewBox', vb);
      unschaerfe[e.art] = UNSCHAERFE[e.art](z);
      let blur = unschaerfe[e.art] * fak;
      let dx = 0, gross = 1, deck = 1;
      if (hatTele && e.art !== 'k1') {
        // Tele liegt oben und blendet über. Beide Bilder gleiten gegeneinander.
        if (e.art === 'tele') deck = mix;
        dx = (e.art === 'tele' ? -(1 - mix) : mix) * VERSATZ * W;
        if (e.art === neu && fokus > 0) {
          // Zurück auf die Hauptkamera nur halb so stark: Der sichtbare Moment ist das Tele
          const k = neu === 'tele' ? fokus : fokus / 2;
          blur += FOKUS_PX * fak * k;
          gross = 1 + FOKUS_GROESSER * k;
        }
      }
      e.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
      e.el.style.opacity = deck < 1 ? String(Math.max(0, deck).toFixed(3)) : '';
      e.el.style.transform = dx || gross !== 1 ? `translateX(${dx.toFixed(2)}px) scale(${gross.toFixed(4)})` : '';
      // Warm = wird gezeichnet (evtl. mit Deckkraft 0), kalt = ganz aus
      e.el.style.visibility = e.warmSeit === null ? 'hidden' : '';
    }
    wurzel.dataset.linse = fenster.dataset.linse = linse;
    wurzel.dataset.zoom = zahl(z);
    if (wechsel) wurzel.dataset.wechsel = ''; else delete wurzel.dataset.wechsel;

    const [vx, vy, vw, vh] = vb.split(' ').map(Number);
    ansicht = { vx, vy, vw, vh, W, H, s: Math.max(W / vw, H / vh) };
    if (details) setzeFunde(Z);
    setzeBedienung();
    if (weiter) plane();
  }

  // ── Regler, Stufen, Texte ──
  function setzeBedienung() {
    const r = rund(z);
    // Beim Ziehen steht hier derselbe Wert, den der Regler selbst geliefert hat: harmlos
    if (regler) regler.value = String(alsWert(z));
    skala?.style.setProperty('--wert', (Math.log(z / 0.5) / LOG).toFixed(4));
    // Während einer Fahrt zu einer Stufe ist deren Knopf schon gedrückt (sonst flackert er)
    const gewaehlt = fahrt?.ziel ?? r;
    const schluessel = `${r}|${linse}|${gewaehlt}`;
    if (schluessel === letzteBeschriftung) return;
    letzteBeschriftung = schluessel;
    stufen.forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.stufe) === gewaehlt ? 'true' : 'false'));
    // Linsen-Leiste: der letzte Abschnitt, dessen „ab“ erreicht ist
    const aktiv = abschnitte.filter((a) => r >= Number(a.dataset.ab)).pop();
    abschnitte.forEach((a) => a.toggleAttribute('data-aktiv', a === aktiv));
    if (linsenFeld) linsenFeld.textContent = linsenText(modell, r, linse);
    bildtext?.setAttribute('aria-label', `Alpenpanorama bei ${zahl(r)}x, ${linse === 'tele' ? 'Tele-Linse' : 'Hauptkamera'}, ${schaerfeText(UNSCHAERFE[linse](r))}`);
    regler?.setAttribute('aria-valuetext', ansagetext());
    fenster.dispatchEvent(new CustomEvent('kiesel:kamera', { bubbles: true, detail: { z: r, linse } }));
  }
  const ansagetext = () => `${zahl(z)}-fach, ${linse === 'tele' ? 'Tele-Linse' : 'Hauptkamera'}`;

  function setzeZoom(zz) {
    bedient = true;
    fahrt = null;
    z = klemme(zz);
    plane();
  }

  // Zoomfahrt zu einer Stufe (Chips): im Logarithmus, also gleichmässig „gefühlt“
  function fahreZu(ziel) {
    bedient = true;
    ziel = klemme(ziel);
    const von = z, abstand = Math.abs(Math.log(ziel / von));
    fahrt = {
      ziel,
      t0: performance.now(),
      dauer: 280 + 320 * Math.min(1, abstand / Math.log(20)),
      schritt: (t) => { z = von * (ziel / von) ** ausrollen(t); },
      fertig: () => sage(ansagetext()),
    };
    plane();
  }

  // Flug zu einem Detail: kurz rauszoomen, falls das Ziel weit weg ist, schwenken, rein
  function fliegeZu(i) {
    bedient = true;
    const [name, tx, ty] = ZOOM_TARGETS[i];
    const Z0 = bildZoom(z), Z1 = bildZoom(ZIEL_ZOOM);
    const [x0, y0] = begrenze(blick[0], blick[1], Z0);
    const abstand = Math.hypot(tx - x0, ty - y0);
    // Mitten im Flug sollen Start und Ziel beide ins Bild passen
    const Zmitte = Math.min(Z0, Z1, 1600 / Math.max(1, abstand * 1.5));
    const l0 = Math.log(Z0), l1 = Math.log(Z1);
    const delle = Math.max(0, (l0 + l1) / 2 - Math.log(Zmitte));
    fahrt = {
      t0: performance.now(),
      dauer: 800 + 600 * Math.min(1, delle / 1.5) + 200 * Math.min(1, abstand / 600),
      schritt: (t) => {
        const e = hinUndHer(t);
        z = kameraZoom(Math.exp(l0 + (l1 - l0) * e - delle * 4 * e * (1 - e)));
        blick = [x0 + (tx - x0) * e, y0 + (ty - y0) * e];
      },
      fertig: () => entdecke(i, true),
    };
    sage(`Fliege zu: ${name}`);
    plane();
  }

  // Schwenk auf einen Punkt im Bild (Zielen), Zoom bleibt
  function schwenkeZu([x, y]) {
    bedient = true;
    const Z = bildZoom(z);
    const [x0, y0] = begrenze(blick[0], blick[1], Z);
    const [x1, y1] = begrenze(x, y, Z);
    fahrt = {
      t0: performance.now(),
      dauer: 450,
      schritt: (t) => { const e = ausrollen(t); blick = [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e]; },
    };
    plane();
  }

  // ── Versteckte Details ──
  // Lage eines Punkts im Bild auf dem Bildschirm (px im Fenster)
  const aufSchirm = (x, y) => [(ansicht.W - ansicht.vw * ansicht.s) / 2 + (x - ansicht.vx) * ansicht.s, (ansicht.H - ansicht.vh * ansicht.s) / 2 + (y - ansicht.vy) * ansicht.s];
  const imBild = (x, y) => [ansicht.vx + (x - (ansicht.W - ansicht.vw * ansicht.s) / 2) / ansicht.s, ansicht.vy + (y - (ansicht.H - ansicht.vh * ansicht.s) / 2) / ansicht.s];

  function setzeFunde(Z) {
    const { W, H, s } = ansicht;
    let ring = null, bester = Infinity;
    ZOOM_TARGETS.forEach(([, tx, ty], i) => {
      const [px, py] = aufSchirm(tx, ty);
      // Gefunden: ganz aufgetaucht und nicht nur am Rand
      if (bedient && Z >= FUND_AB && px > W * 0.12 && px < W * 0.88 && py > H * 0.12 && py < H * 0.88) entdecke(i);
      // Fokusring: um ein gefundenes Detail im Bild, das neueste zuerst, sonst das mittigste
      if (!entdeckt.has(i) || Z < RING_AB || px < 0 || px > W || py < 0 || py > H) return;
      const abstand = i === neuster ? -1 : Math.hypot(px - W / 2, py - H / 2);
      if (abstand < bester) { bester = abstand; ring = { i, px, py }; }
    });
    if (!fokus) return;
    fokus.style.visibility = ring ? '' : 'hidden';
    if (!ring) return;
    // Wie im Artboard: 132 px bei 6x, also rund 30 Bild-Einheiten, aber nie winzig oder riesig
    const d = Math.min(150, Math.max(56, 30 * s));
    fokus.style.setProperty('--d', `${d.toFixed(0)}px`);
    fokus.style.transform = `translate(${ring.px.toFixed(1)}px, ${ring.py.toFixed(1)}px)`;
    fokus.style.opacity = Math.min(1, (Z - RING_AB) / (FUND_AB - RING_AB)).toFixed(3);
    if (fokus.dataset.detail !== String(ring.i)) {
      fokus.dataset.detail = String(ring.i);
      fokustext.textContent = `${ZOOM_TARGETS[ring.i][0]} entdeckt`;
    }
  }

  function entdecke(i, angeflogen = false) {
    if (entdeckt.has(i)) {
      if (angeflogen) sage(`${ZOOM_TARGETS[i][0]}, ${zahl(z)}-fach`);
      return;
    }
    entdeckt.add(i);
    neuster = i;
    const name = ZOOM_TARGETS[i][0];
    kacheln.filter((k) => k.dataset.detail === String(i)).forEach((k) => {
      k.setAttribute('data-gefunden', '');
      k.setAttribute('aria-label', `${name}: hinzoomen`);
      k.querySelector('[data-fundname]').textContent = name;
    });
    const n = entdeckt.size, alle = ZOOM_TARGETS.length;
    fundpunkte.forEach((p, j) => p.toggleAttribute('data-an', j < n));
    if (zaehler) zaehler.textContent = n === alle ? `Alle ${alle} entdeckt` : `${n} von ${alle} entdeckt`;
    if (fokus) {
      // Ring zieht sich einmal zusammen (Animation neu starten)
      fokus.removeAttribute('data-neu');
      void fokus.offsetWidth;
      fokus.setAttribute('data-neu', '');
    }
    sage(`${name} entdeckt. ${n} von ${alle}.`);
  }

  // ── Ereignisse ──
  if (regler) {
    regler.addEventListener('input', () => setzeZoom(ausWert(Number(regler.value))));
    // Tastatur selbst steuern: Pfeile in 0.1er-Schritten, Bild auf/ab = nächste Stufe
    const werte = stufen.map((b) => Number(b.dataset.stufe)).sort((a, b) => a - b);
    regler.addEventListener('keydown', (e) => {
      const r = rund(z);
      let ziel = null, gleiten = false;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') ziel = r + 0.1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ziel = r - 0.1;
      else if (e.key === 'PageUp') { ziel = werte.find((w) => w > r + 0.01) ?? max; gleiten = true; }
      else if (e.key === 'PageDown') { ziel = [...werte].reverse().find((w) => w < r - 0.01) ?? 0.5; gleiten = true; }
      else if (e.key === 'Home') { ziel = 0.5; gleiten = true; }
      else if (e.key === 'End') { ziel = max; gleiten = true; }
      if (ziel === null) return;
      e.preventDefault();
      ziel = Math.round(ziel * 10) / 10;
      if (gleiten) fahreZu(ziel); else setzeZoom(ziel);
    });
  }
  stufen.forEach((b) => b.addEventListener('click', () => fahreZu(Number(b.dataset.stufe))));
  if (details) {
    // Maus: ziehen verschiebt sofort, Klick ohne Bewegung schwenkt dorthin.
    // Finger: waagrecht ziehen verschiebt, senkrecht gehört dem Scrollen (touch-action: pan-y),
    // Tippen schwenkt dorthin.
    let zug = null;
    fenster.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      zug = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, aktiv: false, maus: e.pointerType === 'mouse' };
      if (zug.maus) e.preventDefault(); // kein Text markieren
    });
    fenster.addEventListener('pointermove', (e) => {
      if (!zug || e.pointerId !== zug.id) return;
      const dx = e.clientX - zug.x, dy = e.clientY - zug.y;
      if (!zug.aktiv) {
        if (zug.maus ? Math.hypot(dx, dy) > 4 : Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
          zug.aktiv = true;
          fenster.setPointerCapture(e.pointerId);
          fenster.setAttribute('data-zieht', '');
          // Ab dem sichtbaren Ausschnitt verschieben (der Blick kann ausserhalb liegen)
          blick = begrenze(blick[0], blick[1], bildZoom(z));
        } else if (!zug.maus && Math.abs(dy) > 6) {
          zug = null;
          return;
        } else return;
      }
      bedient = true;
      fahrt = null;
      const Z = bildZoom(z);
      blick = begrenze(blick[0] - (e.clientX - zug.lx) / ansicht.s, blick[1] - (zug.maus ? (e.clientY - zug.ly) / ansicht.s : 0), Z);
      zug.lx = e.clientX;
      zug.ly = e.clientY;
      plane();
    });
    const ende = (e) => {
      if (!zug || e.pointerId !== zug.id) return;
      if (!zug.aktiv && e.type === 'pointerup') {
        const r = fenster.getBoundingClientRect();
        schwenkeZu(imBild(e.clientX - r.left, e.clientY - r.top));
      }
      fenster.removeAttribute('data-zieht');
      zug = null;
    };
    fenster.addEventListener('pointerup', ende);
    fenster.addEventListener('pointercancel', ende);
  }
  kacheln.forEach((k) => k.addEventListener('click', () => {
    fliegeZu(Number(k.dataset.detail));
    // Auf dem Handy liegt die Demo über den Kacheln: hinscrollen, damit man den Flug sieht
    const r = fenster.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) fenster.scrollIntoView({ block: 'center', behavior: ruhig.matches ? 'auto' : 'smooth' });
  }));
  new ResizeObserver(plane).observe(fenster);
  ruhig.addEventListener('change', plane);

  // Anfangszustand ohne Animation
  if (regler) regler.value = String(alsWert(z));
  plane();

  // Für die Prüfskripte: wurzel.kamera.zustand() (auch am Bild selbst: fenster.kamera)
  const api = { setzeZoom, fahreZu, schwenkeZu, zustand: () => ({ z, blick: [...blick], linse, mix, wechsel: !!wechsel, unschaerfe: { ...unschaerfe }, details, entdeckt: [...entdeckt] }) };
  if (details) api.fliegeZu = fliegeZu;
  wurzel.kamera = fenster.kamera = api;
  return api;
}
