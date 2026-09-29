// Deutsche Texte, Teil „zubehoer“: /zubehoer/ und /zubehoer/huelle/
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── /zubehoer/ ──
export const zubehoer = {
  seitenTitel: 'Zubehör',
  beschreibung: 'Die Kiesel-Hülle für Kiesel 1 und Kiesel 1 Pro, in fünf Farben, frei kombinierbar.',
  titel: 'Zubehör',
  einleitung: 'Alles, was zum Kiesel passt. Im Moment ist das vor allem eine Hülle, die man gern anfasst.',
  filterLabel: 'Filter',
  filter: { alle: 'Alle', k1: 'für Kiesel 1', pro: 'für Kiesel 1 Pro' },
  produkte: 'Produkte',
  huelle: 'Kiesel-Hülle',
  fuer: (modell) => `für ${modell}`,
  huelleFuer: (modell) => `Kiesel-Hülle für ${modell}`,
  fuenfFarben: 'in fünf Farben',
  ansehen: 'Ansehen',
  bildKarte: (huelle, modell, handy) => `Kiesel-Hülle in ${huelle} auf einem ${modell} in ${handy}`,
  bildKombi: (handy, huelle) => `Kiesel 1 Pro in ${handy} mit Hülle in ${huelle}`,
  platzhalter: { titel: '[Weiteres Zubehör]', text: 'Platz für ein nächstes Produkt, zum Beispiel ein MagSafe-Ladegerät.' },
  kombi: {
    titel: 'Frei kombinieren.',
    text: 'Handy und Hülle wählst du unabhängig voneinander. Durch die milchige Rückseite schimmert die Handyfarbe immer ein bisschen durch.',
    knopf: 'Diese Kombination kaufen',
    handy: 'Handy',
    huelle: 'Hülle',
  },
};

// ── /zubehoer/huelle/ (Text der Seite, Zeichnungen der Eigenschaften, Profilschnitt) ──
export const huelle = {
  titel: 'Kiesel-Hülle',
  text: 'Hinten milchig, am Rand fest und griffig. Steht ein kleines bisschen über Display und Kamera, damit beides den Tisch nie berührt.',
  beschreibung: (text, preis) => `${text} Für Kiesel 1 und Kiesel 1 Pro, ${preis}`,
  brotkrumen: 'Brotkrumen',
  zubehoer: 'Zubehör',
  ansicht: 'Ansicht',
  modellFrage: 'Für welches Modell?',
  groesse: { k1: 'SE-Grösse', pro: '13-mini-Grösse' },
  ansichten: { hinten: 'Rückseite', vorne: 'Vorderseite' },
  farbeLegende: 'Farbe der Hülle',
  vorschauLegende: 'Vorschau mit Handyfarbe',
  knopf: 'In den Warenkorb',
  hinweis: 'Kostenloser Versand. Die Vorschau-Handyfarbe gehört nicht zur Bestellung.',
  bild: (modell, handy, huelle, ansicht) => `${modell} in ${handy} mit Hülle in ${huelle}, ${ansicht}`,
  eigenschaftenTitel: 'Drei Dinge, die sie gut macht.',
  eigenschaften: {
    milchig: ['Milchige Rückseite', 'Halbtransparent wie Eis auf einem Bergsee. Handyfarbe, Kiesel und MagSafe-Ring schimmern durch.'],
    rand: ['Fester Rand', 'Griffig und dämpfend, in Farbe. Die Tasten sind abgedeckt und drücken sich trotzdem sauber.'],
    rahmen: ['Erhöhter Rahmen', 'Flach auf den Tisch gelegt, berührt nur die Hülle die Oberfläche. Display und Kamera bleiben in der Luft.'],
  },
  // Zeichnungen der drei Kacheln
  nahMilchig: 'Nahaufnahme: milchige Rückseite mit durchschimmerndem Kiesel und MagSafe-Ring',
  nahRand: 'Nahaufnahme: fester Rand mit Tastenabdeckungen',
  profil: {
    label: (display, kamera) => `Schnitt: Hülle steht ${display} mm über das Display und ${kamera} mm über die Kamera`,
    tisch: 'Tisch',
    mm: (wert) => `${wert} mm`,
    luft: (wert) => `${wert} mm Luft unter der Kamera`,
  },
  detailsTitel: 'Technische Details',
  details: {
    passt: 'Passt auf', passtWert: 'Kiesel 1 oder Kiesel 1 Pro, je eigene Grösse',
    farben: 'Farben',
    rand: 'Rand', randWert: (mm) => `trägt ca. ${mm} mm pro Seite auf`,
    ueberstand: 'Überstand', ueberstandWert: (display, kamera) => `ca. ${display} mm über dem Display, ca. ${kamera} mm über den Kameras`,
    magsafe: 'MagSafe', magsafeWert: 'kompatibel, Magnetring sichtbar durch die Rückseite',
    material: 'Material', materialWert: '[Material]',
    preis: 'Preis',
  },
};
