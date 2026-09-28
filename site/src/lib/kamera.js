// Rechnung und Beschriftung der Kamera-Demos, ohne Browser: läuft im Build (Startzustand im
// HTML) und im Browser (kamera-zoom.js). Gebraucht von ZoomBild, also von allen vier
// Zoom-Stellen (Startseite, /kiesel-1/, /kiesel-1-pro/, /funktionen/). Nur hier ändern,
// dann können die Stellen nicht mehr auseinanderlaufen.
//
// Begriffe
//   z      Kamera-Zoom, wie ihn die Kamera-App anzeigt (0.5x … 10x)
//   Z      Bild-Zoom im Panorama: 1 = ganzes Bild (1600 breit), 8 = 200 breit
//   linse  'haupt' (Hauptkamera, auch Kiesel 1) oder 'tele' (nur Pro, ab 3x)
import { LINSEN_NAME, TELE_AB, MAX_ZOOM } from '../data/kamera.js';

// ── Zoom-Umrechnung ──
// Stützpunkte Kamera-Zoom → Bild-Zoom, dazwischen gleichmässig im Logarithmus.
// 0.5x = ganzes Bild, 1x = 1.5, ab 3x gleich.
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

// Unschärfe in px bei 600 px Bildbreite (kamera-zoom.js rechnet auf die echte Breite um)
//   Hauptkamera (auch Kiesel 1): bis 1x optisch scharf, darüber digital immer weicher.
//     Über 5x kann der Kiesel 1 nicht, im Vergleich wird sein Bild dort nur noch breiiger.
//   Tele: bei 3x optisch scharf, darüber digital, aber aus einem viel schärferen Bild.
export const UNSCHAERFE = {
  haupt: (z) => (z <= 1 ? 0 : 0.75 * (Math.min(z, 5) - 1) + 0.45 * Math.max(0, z - 5)),
  tele: (z) => (z <= TELE_AB ? 0 : 0.3 * (z - TELE_AB)),
};
UNSCHAERFE.k1 = UNSCHAERFE.haupt;

// Welche Linse arbeitet bei der angezeigten Zahl z? Der Kiesel 1 hat keine Tele.
export const linseBei = (modell, z) => (modell === 'pro' && rund(z) >= TELE_AB ? 'tele' : 'haupt');

// Optisch heisst: ohne Ausschnitt aus dem Sensor (variable Linse bis 1x, Tele genau bei 3x)
export const optisch = (z, linse) => rund(z) <= 1 || (linse === 'tele' && rund(z) === TELE_AB);

// Stufe mit Art: „1x optisch“, „6x digital“. Über dem Maximum des Modells (nur im Vergleich:
// Kiesel 1 bei 10x) „max. 5x digital“.
export function stufenText(modell, z, linse = linseBei(modell, z)) {
  const max = MAX_ZOOM[modell];
  const stufe = rund(z) > max ? `max. ${max}x` : `${zahl(z)}x`;
  return `${stufe} ${optisch(Math.min(z, max), linse) ? 'optisch' : 'digital'}`;
}

// Linsen-Label auf dem Bild: „Hauptkamera · 1x optisch“, „Tele · 6x digital“
export const linsenText = (modell, z, linse = linseBei(modell, z)) => `${LINSEN_NAME[linse]} · ${stufenText(modell, z, linse)}`;

// Für Screenreader: wie scharf ist das Bild (Unschärfe bei 600 px Breite)?
export const schaerfeText = (px) => (px < 0.05 ? 'scharf' : px < 1.6 ? 'leicht weich' : 'unscharf');

// Texte des Zoom-Vergleichs (Pro-Seite): zwei Chips, lang (Desktop) und kurz (Handy), und
// die Bildbeschreibung. Links der Kiesel 1 (immer Hauptkamera, max. 5x), rechts der Pro.
// Den Linsennamen lässt der Vergleich weg: Welche Linse arbeitet, zeigen die zwei Punkte im
// Pro-Chip. Ein Namenswechsel mitten im Linsenwechsel wäre zudem ein harter Textsprung
// genau dort, wo das Bild weich überblenden soll (pruefe:kamera misst das mit).
//   allein: Vergleich ausgeschaltet, nur noch der Pro im Bild
export function vergleichTexte(z, linse = linseBei('pro', z), allein = false) {
  const stufe = (m) => (rund(z) > MAX_ZOOM[m] ? `max. ${MAX_ZOOM[m]}x` : `${zahl(z)}x`);
  const pro = `${linse === 'tele' ? 'Tele-Linse' : 'Hauptkamera'}, ${schaerfeText(UNSCHAERFE[linse](z))}`;
  return {
    lang: { k1: `Kiesel 1 · ${stufenText('k1', z)}`, pro: `Kiesel 1 Pro · ${stufenText('pro', z, linse)}` },
    kurz: { k1: `Kiesel 1 · ${stufe('k1')}`, pro: `Pro · ${linse === 'tele' ? 'Tele · ' : ''}${stufe('pro')}` },
    bild: allein
      ? `Alpenpanorama bei ${zahl(z)}x: Kiesel 1 Pro, ${pro}`
      : `Alpenpanorama bei ${zahl(z)}x: links Kiesel 1, ${schaerfeText(UNSCHAERFE.k1(z))}; rechts Kiesel 1 Pro, ${pro}`,
  };
}

