// Texte der Seiten /zubehoer/ und /zubehoer/huelle/, 1:1 aus den Artboards „Zubehör“ und
// „Kiesel-Hülle“ (design/generator/gen3.py). Der Preis steht in modelle.js (HUELLE_PREIS).
// Platzhalter in eckigen Klammern sind bewusst so: nichts erfinden, bis es feststeht.

export const ZUBEHOER = {
  titel: 'Zubehör',
  einleitung: 'Alles, was zum Kiesel passt. Im Moment ist das vor allem eine Hülle, die man gern anfasst.',
  filter: [['alle', 'Alle'], ['k1', 'für Kiesel 1'], ['pro', 'für Kiesel 1 Pro']],
  // Die zwei Hüllen-Karten: Modell, Handyfarbe der Abbildung, Hüllenfarbe (kommt in den Warenkorb)
  produkte: [
    { modell: 'k1', handy: 'Kieselbeige', huelle: 'Mattweiss' },
    { modell: 'pro', handy: 'Himmelblau', huelle: 'Mattschwarz' },
  ],
  platzhalter: { titel: '[Weiteres Zubehör]', text: 'Platz für ein nächstes Produkt, zum Beispiel ein MagSafe-Ladegerät.' },
  kombi: {
    titel: 'Frei kombinieren.',
    text: 'Handy und Hülle wählst du unabhängig voneinander. Durch die milchige Rückseite schimmert die Handyfarbe immer ein bisschen durch.',
    handy: 'Himmelblau',
    huelle: 'Mattweiss',
    knopf: 'Diese Kombination kaufen',
  },
};

export const HUELLE = {
  titel: 'Kiesel-Hülle',
  text: 'Hinten milchig, am Rand fest und griffig. Steht ein kleines bisschen über Display und Kamera, damit beides den Tisch nie berührt.',
  modellFrage: 'Für welches Modell?',
  modelle: [['k1', 'Kiesel 1', 'SE-Grösse'], ['pro', 'Kiesel 1 Pro', '13-mini-Grösse']],
  ansichten: [['hinten', 'Rückseite'], ['vorne', 'Vorderseite']],
  farbeLegende: 'Farbe der Hülle',
  vorschauLegende: 'Vorschau mit Handyfarbe',
  start: { modell: 'pro', huelle: 'Mattweiss', handy: 'Himmelblau' },
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
    ['Farben', 'Mattschwarz, Titangrau, Himmelblau, Mattweiss, Kieselbeige'],
    ['Rand', 'trägt ca. 1.2 mm pro Seite auf'],
    ['Überstand', 'ca. 0.8 mm über dem Display, ca. 0.6 mm über den Kameras'],
    ['MagSafe', 'kompatibel, Magnetring sichtbar durch die Rückseite'],
    ['Material', '[Material]'],
    ['Preis', null], // aus HUELLE_PREIS
  ],
};

// Eintrag für den Warenkorb: nur Modell und Hüllenfarbe, nie die Vorschau-Handyfarbe
export function huellenArtikel(modell, farbe, preis) {
  return { id: `huelle-${modell}-${farbe.toLowerCase()}`, art: 'huelle', name: 'Kiesel-Hülle', modell, farbe, preis };
}
