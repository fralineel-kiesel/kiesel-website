// English texts, part “zubehoer”: /accessories/ and /accessories/case/
// Rules: see src/i18n/en.js.

// ── /accessories/ ──
export const zubehoer = {
  seitenTitel: 'Accessories',
  beschreibung: 'The Kiesel Case for Kiesel 1 and Kiesel 1 Pro, in five colors to mix and match as you like.',
  titel: 'Accessories',
  einleitung: 'Everything that goes with your Kiesel. Right now, that’s mostly a case you won’t want to put down.',
  filterLabel: 'Filter',
  filter: { alle: 'All', k1: 'for Kiesel 1', pro: 'for Kiesel 1 Pro' },
  produkte: 'Products',
  huelle: 'Kiesel Case',
  fuer: (modell) => `for ${modell}`,
  huelleFuer: (modell) => `Kiesel Case for ${modell}`,
  fuenfFarben: 'in five colors',
  ansehen: 'View',
  bildKarte: (huelle, modell, handy) => `Kiesel Case in ${huelle} on a ${modell} in ${handy}`,
  bildKombi: (handy, huelle) => `Kiesel 1 Pro in ${handy} with case in ${huelle}`,
  platzhalter: { titel: '[More accessories]', text: 'Room for the next product, a MagSafe charger for example.' },
  kombi: {
    titel: 'Mix and match.',
    text: 'Pick your phone and your case separately. The frosted back always lets a little of the phone’s color shine through.',
    knopf: 'Buy this combination',
    handy: 'Phone',
    huelle: 'Case',
  },
};

// ── /accessories/case/ (page text, drawings of the features, cross-section) ──
export const huelle = {
  titel: 'Kiesel Case',
  text: 'Frosted on the back, firm and grippy around the edges. Sits just a touch above the display and camera, so neither ever touches the table.',
  beschreibung: (text, preis) => `${text} For Kiesel 1 and Kiesel 1 Pro, ${preis}`,
  brotkrumen: 'Breadcrumb',
  zubehoer: 'Accessories',
  ansicht: 'View',
  modellFrage: 'Which model?',
  groesse: { k1: 'SE size', pro: '13 mini size' },
  ansichten: { hinten: 'Back', vorne: 'Front' },
  farbeLegende: 'Case color',
  vorschauLegende: 'Preview with phone color',
  knopf: 'Add to Bag',
  hinweis: 'Free shipping. The preview phone color isn’t part of the order.',
  bild: (modell, handy, huelle, ansicht) => `${modell} in ${handy} with case in ${huelle}, ${ansicht.toLowerCase()}`,
  eigenschaftenTitel: 'Three things it does well.',
  eigenschaften: {
    milchig: ['Frosted back', 'Translucent like ice on a mountain lake. The phone color, the Kiesel and the MagSafe ring shine through.'],
    rand: ['Firm edge', 'Grippy and shock-absorbing, in color. The buttons are covered and still press cleanly.'],
    rahmen: ['Raised lip', 'Lay it flat on the table, and only the case touches the surface. Display and camera stay in the air.'],
  },
  // drawings of the three tiles
  nahMilchig: 'Close-up: frosted back with the Kiesel and MagSafe ring shining through',
  nahRand: 'Close-up: firm edge with button covers',
  profil: {
    label: (display, kamera) => `Cross-section: the case sits ${display} mm above the display and ${kamera} mm above the camera`,
    tisch: 'Table',
    mm: (wert) => `${wert} mm`,
    luft: (wert) => `${wert} mm of clearance under the camera`,
  },
  detailsTitel: 'Tech details',
  details: {
    passt: 'Fits', passtWert: 'Kiesel 1 or Kiesel 1 Pro, each with its own size',
    farben: 'Colors',
    rand: 'Edge', randWert: (mm) => `adds approx. ${mm} mm per side`,
    ueberstand: 'Lip', ueberstandWert: (display, kamera) => `approx. ${display} mm above the display, approx. ${kamera} mm above the cameras`,
    magsafe: 'MagSafe', magsafeWert: 'compatible, magnet ring visible through the back',
    material: 'Material', materialWert: '[Material]',
    preis: 'Price',
  },
};
