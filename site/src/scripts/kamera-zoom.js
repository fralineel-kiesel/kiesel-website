// Kamera-Zoom für die Modellseiten (Etappe 5): stufenloser Zoom, Linsenwechsel bei 3x,
// versteckte Details im Alpenpanorama. Gebraucht von ZoomVergleich (Pro) und ZoomDemo
// (Kiesel 1). Die Komponenten liefern das HTML, hier steckt das ganze Verhalten.
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
import { crop, begrenze, ZOOM_TARGETS } from '../lib/kiesel-draw/ausschnitt.js';

// ── Zoom-Umrechnung ──
// Stützpunkte Kamera-Zoom → Bild-Zoom, dazwischen gleichmässig im Logarithmus.
// Wie die bisherigen Stufen: 0.5x = ganzes Bild, 1x = 1.5, ab 3x gleich.
const STUETZ = [[0.5, 1], [1, 1.5], [3, 3], [5, 5], [10, 10]];
function zwischen(wert, von, nach) {
  const v = Math.min(STUETZ[STUETZ.length - 1][von], Math.max(STUETZ[0][von], wert));
  for (let i = 1; i < STUETZ.length; i++) {
    const a = STUETZ[i - 1], b = STUETZ[i];
    if (v <= b[von]) return a[nach] * (b[nach] / a[nach]) ** (Math.log(v / a[von]) / Math.log(b[von] / a[von]));
  }
  return STUETZ[STUETZ.length - 1][nach];
}
export const bildZoom = (z) => zwischen(z, 0, 1);
export const kameraZoom = (Z) => zwischen(Z, 1, 0);

// Anzeige wie in der Kamera-App: eine Nachkommastelle, ohne „.0“ (2.8x, 3x)
export const rund = (z) => Math.round(z * 10) / 10;
export const zahl = (z) => String(rund(z));

// Unschärfe in px bei 600 px Bildbreite (wird auf die echte Breite umgerechnet)
//   Hauptkamera (auch Kiesel 1): bis 1x optisch scharf, darüber digital immer weicher.
//     Über 5x kann der Kiesel 1 nicht, im Vergleich wird sein Bild dort nur noch breiiger.
//   Tele: bei 3x optisch scharf, darüber digital, aber aus einem viel schärferen Bild.
export const UNSCHAERFE = {
  haupt: (z) => (z <= 1 ? 0 : 0.75 * (Math.min(z, 5) - 1) + 0.45 * Math.max(0, z - 5)),
  tele: (z) => (z <= 3 ? 0 : 0.3 * (z - 3)),
};
UNSCHAERFE.k1 = UNSCHAERFE.haupt;

export const WECHSEL_MS = 420;      // Dauer des Linsenwechsels
const BLENDE_BIS = 0.5;             // Anteil davon für die Überblendung
const FOKUS_AB = 0.4;               // ab hier rastet die Schärfe ein
const VERSATZ = 0.006;              // Versatz der zwei Linsen: Anteil der Bildbreite
const FOKUS_PX = 1.4;               // Zusatz-Unschärfe der neuen Linse am Anfang (bei 600 px)
const FOKUS_GROESSER = 0.012;       // … und so viel grösser (rastet auf 1 ein)
const WARM = { tele: 2.2, haupt: 4.5 }; // Tele zeichnet ab 2.2x mit, die Hauptkamera bis 4.5x
const WARM_BILDER = 2;              // so viele Bilder muss eine Ebene gezeichnet sein vor dem Wechsel
const DETAIL_AB = 3.5, DETAIL_VOLL = 5; // Bild-Zoom, ab dem die Details auftauchen / ganz da sind

const glatt = (t) => t * t * (3 - 2 * t);
const ausrollen = (t) => 1 - (1 - t) ** 3;
const hinUndHer = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const ruhig = matchMedia('(prefers-reduced-motion: reduce)');

// wurzel: Element mit allem darin. Optionen:
//   max: grösster Zoom (Pro 10, Kiesel 1 5)   start: Zoom beim Laden   blick: [x, y]
//   zielZoom: Zoom beim Anvisieren eines Details
//   beschrifte(zustand): Texte der Komponente nachführen, zustand = { z (gerundet), linse, max },
//     Rückgabe = aria-valuetext des Reglers
export function starteKamera(wurzel, { max, start, blick: startBlick, zielZoom, beschrifte }) {
  const fenster = wurzel.querySelector('[data-fenster]');
  const ebenen = [...wurzel.querySelectorAll('[data-ebene]')].map((el) => ({ el, art: el.dataset.ebene, svg: el.querySelector('svg') }));
  const hatTele = ebenen.some((e) => e.art === 'tele');
  const regler = wurzel.querySelector('[data-zoom-regler]');
  const stufen = [...wurzel.querySelectorAll('[data-stufe]')];
  const marken = [...wurzel.querySelectorAll('[data-marke]')];
  const kacheln = [...wurzel.querySelectorAll('[data-detail]')];
  const zaehler = wurzel.querySelector('[data-entdeckt]');
  const ansage = wurzel.querySelector('[data-ansage]');

  let z = start;
  let blick = [...startBlick];
  let linse = hatTele && rund(z) >= 3 ? 'tele' : 'haupt';
  let mix = linse === 'tele' ? 1 : 0;
  let wechsel = null;   // { von, nach, t0 }
  let fahrt = null;     // Zoomfahrt oder Flug zu einem Detail
  let geplant = 0;
  let bild = 0; // Bildzähler fürs Aufwärmen
  for (const e of ebenen) e.warmSeit = -WARM_BILDER; // beim Laden ist alles schon gezeichnet
  let letzteBeschriftung = '';
  const entdeckt = new Set();
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
    const soll = hatTele && zr >= 3 ? 'tele' : 'haupt';
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
      let blur = UNSCHAERFE[e.art](z) * fak;
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
    wurzel.dataset.linse = linse;
    wurzel.dataset.zoom = zahl(z);
    if (wechsel) wurzel.dataset.wechsel = ''; else delete wurzel.dataset.wechsel;

    setzeMarken(vb.split(' ').map(Number), W, H, Z);
    setzeBedienung();
    if (weiter) plane();
  }

  // ── Regler, Stufen, Texte ──
  function setzeBedienung() {
    const r = rund(z);
    // Beim Ziehen steht hier derselbe Wert, den der Regler selbst geliefert hat: harmlos
    if (regler) regler.value = String(alsWert(z));
    const zustand = { z: r, linse, max };
    const schluessel = `${r}|${linse}`;
    if (schluessel === letzteBeschriftung) return;
    letzteBeschriftung = schluessel;
    stufen.forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.stufe) === r ? 'true' : 'false'));
    const text = beschrifte(zustand);
    regler?.setAttribute('aria-valuetext', text);
  }

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
      t0: performance.now(),
      dauer: 280 + 320 * Math.min(1, abstand / Math.log(20)),
      schritt: (t) => { z = von * (ziel / von) ** ausrollen(t); },
      fertig: () => sage(beschrifte({ z: rund(z), linse, max })),
    };
    plane();
  }

  // Flug zu einem Detail: kurz rauszoomen, falls das Ziel weit weg ist, schwenken, rein
  function fliegeZu(i) {
    bedient = true;
    const [name, tx, ty] = ZOOM_TARGETS[i];
    const Z0 = bildZoom(z), Z1 = bildZoom(zielZoom);
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

  // ── Versteckte Details ──
  function setzeMarken([vx, vy, vw, vh], W, H, Z) {
    if (!marken.length) return;
    const s = Math.max(W / vw, H / vh);
    const ox = (W - vw * s) / 2, oy = (H - vh * s) / 2;
    const staerke = Math.min(1, Math.max(0, (Z - DETAIL_AB) / (DETAIL_VOLL - DETAIL_AB)));
    marken.forEach((m) => {
      const i = Number(m.dataset.marke);
      const [, tx, ty] = ZOOM_TARGETS[i];
      const px = ox + (tx - vx) * s, py = oy + (ty - vy) * s;
      const drin = px > 12 && px < W - 12 && py > 12 && py < H - 12;
      // Erst nach der ersten eigenen Bedienung: Beim Laden sieht das Bild aus wie im Artboard
      const an = bedient && drin && staerke > 0;
      m.style.visibility = an ? '' : 'hidden';
      if (!an) return;
      m.style.opacity = glatt(staerke).toFixed(3);
      m.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      // Ring mit 40 Bild-Einheiten Durchmesser (Artboard: r = 22), aber tippbar und nicht riesig
      const d = Math.min(120, Math.max(44, 40 * s));
      m.style.setProperty('--d', `${d.toFixed(0)}px`);
      m.dataset.seite = px + d / 2 > W - 200 ? 'links' : 'rechts';
      // Entdeckt, sobald es ganz aufgetaucht ist und nicht nur am Rand klebt
      if (bedient && staerke >= 1 && px > W * 0.12 && px < W * 0.88 && py > H * 0.12 && py < H * 0.88) entdecke(i);
    });
  }

  function entdecke(i, angeflogen = false) {
    if (entdeckt.has(i)) {
      if (angeflogen) sage(`${ZOOM_TARGETS[i][0]}, ${zahl(z)}-fach`);
      return;
    }
    entdeckt.add(i);
    wurzel.querySelectorAll(`[data-detail="${i}"], [data-marke="${i}"]`).forEach((el) => el.setAttribute('data-gefunden', ''));
    const n = entdeckt.size, alle = ZOOM_TARGETS.length;
    if (zaehler) zaehler.textContent = n === alle ? `Alle ${alle} entdeckt. Adleraugen!` : `${n} von ${alle} entdeckt`;
    sage(`${ZOOM_TARGETS[i][0]} entdeckt. ${n} von ${alle}.`);
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
  marken.forEach((m) => {
    // Nicht die Trennlinie des Vergleichs mitziehen
    m.addEventListener('pointerdown', (e) => e.stopPropagation());
    m.addEventListener('click', () => fliegeZu(Number(m.dataset.marke)));
  });
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

  // Für die Prüfskripte: wurzel.kamera.zustand()
  const api = { setzeZoom, fahreZu, fliegeZu, zustand: () => ({ z, blick: [...blick], linse, mix, wechsel: !!wechsel, entdeckt: [...entdeckt] }) };
  wurzel.kamera = api;
  return api;
}
