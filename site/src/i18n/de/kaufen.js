// Deutsche Texte, Teil „kaufen“: /kaufen/ (Seite und Browser-Skript)
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── /kaufen/ (Seite und Browser-Skript) ──
export const kaufen = {
  seitenTitel: 'Kaufen',
  beschreibung: 'Kiesel 1 oder Kiesel 1 Pro zusammenstellen: Farbe, Speicher, Hülle und Gravur. Ein Fan-Konzept.',
  titel: 'Kiesel kaufen',
  lieferumfang: 'Lieferumfang: dein Kiesel und ein USB-C-Kabel.',
  modell: 'Modell',
  farbe: 'Farbe',
  speicher: 'Speicher',
  huelle: 'Kiesel-Hülle',
  huelleDazu: (preis) => `Hülle für ${preis} dazu`,
  huellenFarbe: 'Farbe der Hülle',
  gravurTitel: 'Gravur, kostenlos',
  gravurVh: 'Gravur. ',   // nur für Screenreader, vor dem Hinweis
  gravurHinweis: (max) => `Bis ${max} Zeichen, erscheint auf der Rückseite unter dem Kiesel.`,
  gravurBeispiel: 'z.B. Linos Kiesel',
  zeichen: (n, max) => `${n} von ${max} Zeichen`,
  inWarenkorb: 'In den Warenkorb',
  // Bildbeschreibung des Handys auf der Bühne
  bild: ({ name, farbe, huelle, gravur }) => `${name} in ${farbe}` + (huelle ? ` mit Hülle in ${huelle}` : '') + ', Rückseite' + (gravur ? `, Gravur «${gravur}»` : ''),
  zusammenfassung: ({ name, farbe, speicher, huelle, gravur }) => [name, farbe, speicher].concat(huelle ? ['mit Hülle'] : []).concat(gravur ? ['mit Gravur'] : []).join(', '),
  speicherNurBeim: (wunsch, modell, jetzt) => `${wunsch} gibt es nur beim ${modell}, darum jetzt ${jetzt}.`,
  speicherWieder: (stufe) => `Wieder ${stufe}, wie vorher gewählt.`,
  gravurPasstNicht: (fehler) => `Die Gravur passt noch nicht: ${fehler}`,
  schonVoll: (max) => `Von diesem Kiesel liegen schon ${max} im Warenkorb, mehr geht nicht.`,
};
