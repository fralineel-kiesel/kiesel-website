// English texts, part “kaufen”: /buy/ (page and browser script)
// Rules: see src/i18n/en.js.

// ── /buy/ (page and browser script) ──
export const kaufen = {
  seitenTitel: 'Buy',
  beschreibung: 'Build your Kiesel 1 or Kiesel 1 Pro: color, storage, case and engraving. A fan concept.',
  titel: 'Buy Kiesel',
  lieferumfang: 'In the box: your Kiesel and a USB-C cable.',
  modell: 'Model',
  farbe: 'Color',
  speicher: 'Storage',
  huelle: 'Kiesel Case',
  huelleDazu: (preis) => `Add a case for ${preis}`,
  huellenFarbe: 'Case color',
  gravurTitel: 'Engraving, free',
  gravurVh: 'Engraving. ',   // screen readers only, before the hint
  gravurHinweis: (max) => `Up to ${max} characters, engraved on the back below the pebble logo.`,
  gravurBeispiel: 'e.g. Lino’s Kiesel',
  zeichen: (n, max) => `${n} of ${max} characters`,
  inWarenkorb: 'Add to Bag',
  // description of the phone on the stage
  bild: ({ name, farbe, huelle, gravur }) => `${name} in ${farbe}` + (huelle ? ` with a case in ${huelle}` : '') + ', back' + (gravur ? `, engraved “${gravur}”` : ''),
  zusammenfassung: ({ name, farbe, speicher, huelle, gravur }) => [name, farbe, speicher].concat(huelle ? ['with a case'] : []).concat(gravur ? ['engraved'] : []).join(', '),
  speicherNurBeim: (wunsch, modell, jetzt) => `${wunsch} is only available on ${modell}, so it’s ${jetzt} for now.`,
  speicherWieder: (stufe) => `Back to ${stufe}, as you picked before.`,
  gravurPasstNicht: (fehler) => `Check your engraving: ${fehler}`,
  schonVoll: (max) => `You already have ${max} of these in your bag. That’s the limit.`,
};
