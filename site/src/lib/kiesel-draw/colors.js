// Farben des Zeichen-Motors.
//
// PAL = die fünf Produktfarben aus design/generator/lib.py, 1:1. Die Werte stehen
// bereits in src/data/farben.js (seit Etappe 1). Wir importieren sie von dort, statt sie
// ein zweites Mal abzutippen: So gibt es genau eine Stelle, an der man eine Farbe ändert.
//
// Jede Farbe hat sieben Töne:
//   frame = Rahmen, hi/lo = helle/dunkle Kante, back = Rücken,
//   backHi/backLo = Verlauf auf dem Rücken, logo = eingeprägter Kiesel
import { FARBEN, FARB_IDS, farbId } from '../../data/farben.js';
import { zeichnung as DE_Z } from '../../i18n/de.js';

// Schlüssel = Farbkennung ('sky-blue' …). Die Python-Vorlagen kennen die deutschen Namen,
// palette() nimmt darum auch die an (farbId).
export const PAL = FARBEN;
export const FARBNAMEN_PAL = FARB_IDS;
export const TOENE = ['frame', 'hi', 'lo', 'back', 'backHi', 'backLo', 'logo'];

// ---------------------------------------------------------------------------
// Beliebige Farbe → sieben Töne
// ---------------------------------------------------------------------------
// Die fünf PAL-Farben zeigen, wie die Töne zur Grundfarbe stehen: Himmelblau hat z.B.
// eine Glanzkante, die viel heller ist als der Rahmen, und einen Schatten, der dunkler ist.
// Diese Abstände messen wir in OKLCH (L = Helligkeit so, wie das Auge sie empfindet,
// C = Buntheit, h = Farbton). Eine neue Farbe übernimmt die Abstände der PAL-Farben,
// die ihr am ähnlichsten sind (gewichteter Mittelwert, nahe Farben zählen mehr).
// Ist die Farbe genau ein PAL-Rahmen, kommt die PAL-Farbe unverändert zurück.

// sRGB-Hex ↔ OKLab (Formeln von Björn Ottosson, der OKLab erfunden hat)
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexZuLab(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => lin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function labZuRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(gam);
}

const zuLch = ([L, a, b]) => [L, Math.hypot(a, b), Math.atan2(b, a)];
const ausLch = ([L, C, h]) => [L, C * Math.cos(h), C * Math.sin(h)];

// OKLCH → Hex. Liegt die Farbe ausserhalb dessen, was ein Bildschirm zeigen kann,
// nehmen wir Buntheit weg, bis sie passt (Helligkeit und Farbton bleiben).
function lchZuHex([L, C, h]) {
  L = Math.min(1, Math.max(0, L));
  let rgb;
  for (let c = Math.max(0, C); ; c *= 0.95) {
    rgb = labZuRgb(ausLch([L, c, h]));
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005) || c < 1e-4) break;
  }
  return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Einmal ausrechnen: Abstände jedes Tons zum Rahmen, pro PAL-Farbe
const VORLAGEN = FARB_IDS.map((name) => {
  const p = PAL[name];
  const lab = hexZuLab(p.frame);
  const [L, C] = zuLch(lab);
  const abstand = {};
  for (const t of TOENE) {
    const [Lt, Ct] = zuLch(hexZuLab(p[t]));
    abstand[t] = [Lt - L, Ct - C];
  }
  return { lab, abstand };
});

export function palette(farbe) {
  // Name einer Produktfarbe oder schon eine fertige Palette? Dann direkt zurück.
  if (typeof farbe === 'object') return farbe;
  const id = farbId(farbe);
  if (id) return PAL[id];
  const hex = normHex(farbe);
  const genau = FARB_IDS.find((n) => PAL[n].frame.toUpperCase() === hex);
  if (genau) return { ...PAL[genau] };

  const lab = hexZuLab(hex);
  const [L, C, h] = zuLch(lab);
  // Gewichte: 1 / Abstand² im OKLab-Raum
  const gew = VORLAGEN.map((v) => 1 / (Math.hypot(v.lab[0] - lab[0], v.lab[1] - lab[1], v.lab[2] - lab[2]) ** 2 + 1e-9));
  const summe = gew.reduce((a, b) => a + b, 0);
  const aus = {};
  for (const t of TOENE) {
    let dL = 0, dC = 0;
    VORLAGEN.forEach((v, i) => { dL += v.abstand[t][0] * gew[i] / summe; dC += v.abstand[t][1] * gew[i] / summe; });
    aus[t] = t === 'frame' ? hex : lchZuHex([L + dL, C + dC, h]);
  }
  return aus;
}

// "#abc", "abc", "#AABBCC" → "#AABBCC"
function normHex(s) {
  let h = String(s).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Keine gültige Farbe: ${s}`);
  return '#' + h.toUpperCase();
}

// ---------------------------------------------------------------------------
// LED-Zustände des RGB-Blitzes
// ---------------------------------------------------------------------------
// lib.py kennt nur das Schema { color, o1, o2, mid, edge } (siehe ledDefs in phone.js),
// aber keine fertigen Zustände. Die Signalfarben stammen aus der alten Seite
// (css/handy.css), die Texte dazu aus js/daten.js (LEDTXT).
//   mid/edge: die LED selbst ist innen heller, am Rand dunkler: Signalfarbe mit 25 % Weiss
//             bzw. 25 % Schwarz gemischt.
//   o1/o2:    Deckkraft des Leuchthofs in der Mitte und bei 30 % des Radius: 0.8 und 0.4.
// Beides ist an bilder/original/kiesel-kamera.png ausgemessen (blauer Blitz = Anruf): Die
// Zeichnung deckungsgleich über das PNG gelegt, weicht die LED im Schnitt 2.3 von 255 ab,
// der Leuchthof 1.2. (Dieselben 0.8/0.4 hatte die alte Seite beim Fotoblitz.)
export const LED_FARBEN = {
  call: '#3D8BFF', msg: '#A77BFF', charge: '#35D07F', full: '#35D07F',
  low: '#FF4B4B', privacy: '#FF9A2E', flash: '#FFFFFF',
};
// Namen der Zustände (Spielwiese): Abschnitt zeichnung.led der Textdatei
export const LED_NAMEN = DE_Z.led;

// Zwei Farben mischen: t = 0 → a, t = 1 → b
export function mische(a, b, t) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  return '#' + [16, 8, 0].map((s) => {
    const v = Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
    return v.toString(16).padStart(2, '0');
  }).join('').toUpperCase();
}

// Aus einer Signalfarbe ein LED-Objekt machen (auch für eigene Farben nutzbar)
export function ledAus(color, o1 = '0.8', o2 = '0.4') {
  return { color, o1, o2, mid: mische(color, '#FFFFFF', 0.25), edge: mische(color, '#000000', 0.25) };
}

// Alle Zustände als fertige LED-Objekte. "off" = null: dann zeichnet lib.py die
// cremefarbene Blitz-LED ohne Leuchthof.
export const LED = Object.fromEntries(Object.entries(LED_FARBEN).map(([k, c]) => [k, ledAus(c)]));

// 'call' → LED-Objekt, 'off'/null → null, eigenes Objekt bleibt, Hex → ledAus(hex)
export function led(zustand) {
  if (!zustand || zustand === 'off') return null;
  if (typeof zustand === 'object') return zustand;
  if (LED[zustand]) return LED[zustand];
  if (/^#[0-9a-f]{6}$/i.test(zustand)) return ledAus(zustand.toUpperCase());
  throw new Error(`Unbekannter LED-Zustand: ${zustand}`);
}
