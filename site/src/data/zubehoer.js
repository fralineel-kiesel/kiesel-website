// Texte der Seiten /zubehoer/ und /zubehoer/huelle/, 1:1 aus den Artboards „Zubehör“ und
// „Kiesel-Hülle“ (design/generator/gen3.py). Der Preis steht in preise.js (HUELLE_PREIS).
// Platzhalter in eckigen Klammern sind bewusst so: nichts erfinden, bis es feststeht.
import { FARBEN_TEXT } from './farben.js';
import { farben as FARBNAME } from '../i18n/de.js';

export const ZUBEHOER = {
  titel: 'Zubehör',
  einleitung: 'Alles, was zum Kiesel passt. Im Moment ist das vor allem eine Hülle, die man gern anfasst.',
  filter: [['alle', 'Alle'], ['k1', 'für Kiesel 1'], ['pro', 'für Kiesel 1 Pro']],
  // Die zwei Hüllen-Karten: Modell, Handyfarbe der Abbildung, Hüllenfarbe (kommt in den Warenkorb)
  produkte: [
    { modell: 'k1', handy: 'pebble-beige', huelle: 'matte-white' },
    { modell: 'pro', handy: 'sky-blue', huelle: 'matte-black' },
  ],
  platzhalter: { titel: '[Weiteres Zubehör]', text: 'Platz für ein nächstes Produkt, zum Beispiel ein MagSafe-Ladegerät.' },
  kombi: {
    titel: 'Frei kombinieren.',
    text: 'Handy und Hülle wählst du unabhängig voneinander. Durch die milchige Rückseite schimmert die Handyfarbe immer ein bisschen durch.',
    handy: 'sky-blue',
    huelle: 'matte-white',
    knopf: 'Diese Kombination kaufen',
  },
};

// Masse der Kiesel-Hülle in mm (gen3.py): Text der technischen Details und Profilschnitt
export const HUELLE_MASSE = {
  rand: 1.2,          // trägt pro Seite auf
  ueberDisplay: 0.8,  // erhöhter Rahmen vorne
  ueberKamera: 0.6,   // Luft unter der Kamera, wenn das Handy auf dem Rücken liegt
  boden: 1.4,         // Rückseite (nur im Profilschnitt)
};
const HM = HUELLE_MASSE;

export const HUELLE = {
  titel: 'Kiesel-Hülle',
  text: 'Hinten milchig, am Rand fest und griffig. Steht ein kleines bisschen über Display und Kamera, damit beides den Tisch nie berührt.',
  modellFrage: 'Für welches Modell?',
  modelle: [['k1', 'Kiesel 1', 'SE-Grösse'], ['pro', 'Kiesel 1 Pro', '13-mini-Grösse']],
  ansichten: [['hinten', 'Rückseite'], ['vorne', 'Vorderseite']],
  farbeLegende: 'Farbe der Hülle',
  vorschauLegende: 'Vorschau mit Handyfarbe',
  start: { modell: 'pro', huelle: 'matte-white', handy: 'sky-blue' },
  knopf: 'In den Warenkorb',
  hinweis: 'Kostenloser Versand. Die Vorschau-Handyfarbe gehört nicht zur Bestellung.',
  eigenschaftenTitel: 'Drei Dinge, die sie gut macht.',
  eigenschaften: {
    milchig: ['Milchige Rückseite', 'Halbtransparent wie Eis auf einem Bergsee. Handyfarbe, Kiesel und MagSafe-Ring schimmern durch.'],
    rand: ['Fester Rand', 'Griffig und dämpfend, in Farbe. Die Tasten sind abgedeckt und drücken sich trotzdem sauber.'],
    rahmen: ['Erhöhter Rahmen', 'Flach auf den Tisch gelegt, berührt nur die Hülle die Oberfläche. Display und Kamera bleiben in der Luft.'],
  },
  detailsTitel: 'Technische Details',
  details: [
    ['Passt auf', 'Kiesel 1 oder Kiesel 1 Pro, je eigene Grösse'],
    ['Farben', FARBEN_TEXT.map((f) => FARBNAME[f]).join(', ')],
    ['Rand', `trägt ca. ${HM.rand} mm pro Seite auf`],
    ['Überstand', `ca. ${HM.ueberDisplay} mm über dem Display, ca. ${HM.ueberKamera} mm über den Kameras`],
    ['MagSafe', 'kompatibel, Magnetring sichtbar durch die Rückseite'],
    ['Material', '[Material]'],
    ['Preis', null], // aus HUELLE_PREIS
  ],
};

// Eintrag für den Warenkorb: nur Modell und Hüllenfarbe, nie die Vorschau-Handyfarbe.
// Den Preis rechnet der Warenkorb selbst aus data/preise.js.
export function huellenArtikel(modell, farbe) {
  return { art: 'case', modell, farbe };
}
