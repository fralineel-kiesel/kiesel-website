// Körperliche Daten aller sechs Geräte an EINEM Ort (DEV in design/generator/gen4.py).
// Vergleichen, Technik, Modellseiten, Akku-Story, Akku-Rechner und FAQ lesen von hier.
// Wer einen Wert ändert, ändert ihn nur hier.
//
//   hoehe, breite, dicke: mm      gewicht: g      akku: mAh      display: Zoll (Diagonale)
//   radius: Eckradius der Vorderseite in mm (für die Umrisse auf /vergleichen/)
//   typ: 'kiesel' | 'home' (Home-Button) | 'notch' | 'island' (Dynamic Island), bestimmt die Details
//   geschaetzt: true = Konzept-Schätzung, Anzeige mit „ca.“
//   kameras: Anzahl Kameras hinten (nur Kiesel). Daraus zeichnen der Zeichen-Motor (models.js)
//            und das 3D-Modell (kiesel-3d/bauplan.js) die Kamerareihe.
// iPhone-Werte laut Hersteller und Presseberichten. Beim iPhone 18 Pro Max weichen die Quellen
// bei Dicke und Akku leicht voneinander ab.
export const GERAETE = {
  k1: { name: 'Kiesel 1', hoehe: 123.8, breite: 58.6, dicke: 9.0, gewicht: 140, akku: 3000, display: 4.7, radius: 9.6, typ: 'kiesel', geschaetzt: true, kameras: 1 },
  pro: { name: 'Kiesel 1 Pro', hoehe: 131.5, breite: 64.2, dicke: 9.0, gewicht: 170, akku: 3600, display: 5.4, radius: 10.6, typ: 'kiesel', geschaetzt: true, kameras: 2 },
  se: { name: 'iPhone SE (2016)', hoehe: 123.8, breite: 58.6, dicke: 7.6, gewicht: 113, akku: 1624, display: 4.0, radius: 8.6, typ: 'home' },
  mini: { name: 'iPhone 13 mini', hoehe: 131.5, breite: 64.2, dicke: 7.65, gewicht: 140, akku: 2438, display: 5.4, radius: 10.5, typ: 'notch' },
  p18: { name: 'iPhone 18 Pro', hoehe: 150.0, breite: 71.9, dicke: 8.75, gewicht: 211, akku: 4056, display: 6.3, radius: 12, typ: 'island' },
  pmax: { name: 'iPhone 18 Pro Max', hoehe: 163.4, breite: 78.0, dicke: 8.75, gewicht: 249, akku: 5391, display: 6.9, radius: 13, typ: 'island' },
};

// Die beiden Kiesel und wem sie in der Grösse entsprechen
export const KIESEL_IDS = ['k1', 'pro'];
export const VORBILD = { k1: 'se', pro: 'mini' };

// Zahl im Schweizer Format (3’600, 123.8): steht jetzt in lib/format.js, hier weitergereicht,
// weil viele Dateien sie von hier holen.
import { zahl } from '../lib/format.js';
import { geraete as DE } from '../i18n/de.js';
export { zahl };

// Häufige Texte. T = Abschnitt geraete der Textdatei (Standard: Deutsch), sprache fürs Zahlenformat
const ca = (g, T) => (g.geschaetzt ? T.ca : '');
export const masse = (id, T = DE, sprache = 'de') => { const g = GERAETE[id]; return `${zahl(g.hoehe, undefined, sprache)} × ${zahl(g.breite, undefined, sprache)} × ${zahl(g.dicke, undefined, sprache)} mm`; };
export const gewicht = (id, T = DE) => `${ca(GERAETE[id], T)}${GERAETE[id].gewicht} g`;
// mAh ohne Tausenderzeichen (4-stellige Zahlen schreibt man zusammen: 3000 mAh)
export const akku = (id, T = DE) => `${ca(GERAETE[id], T)}${GERAETE[id].akku} mAh`;
export const zoll = (id, T = DE, sprache = 'de') => `${ca(GERAETE[id], T)}${zahl(GERAETE[id].display, undefined, sprache)}″`;

// Mehr Akku als das Vorbild, in Prozent (gerundet): Kiesel 1 gegen SE → 85
export const akkuPlus = (id, gegen = VORBILD[id]) => Math.round((GERAETE[id].akku / GERAETE[gegen].akku - 1) * 100);
// Mehr Dicke als das Vorbild in mm: Kiesel 1 gegen SE → „1.4“
export const dickePlus = (id, gegen = VORBILD[id]) => zahl(Math.round((GERAETE[id].dicke - GERAETE[gegen].dicke) * 100) / 100);
