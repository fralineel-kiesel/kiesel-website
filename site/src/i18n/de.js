// Alle sichtbaren Texte von Kiesel 2.0 auf Deutsch (Schweizer Hochdeutsch, „ss“ statt „ß“).
// Einziger Ort für Texte. Etappe 9b legt daneben en.js mit denselben Schlüsseln an.
//
// Aufbau
//   - Ein benannter Export pro Bereich: Gerüst (kopf, footer …), Seite (kaufen, faq …),
//     Datenbestand (technik, faqFragen …) oder Zeichnung (zeichnung). Warum einzeln? Ein
//     Browser-Skript importiert nur seinen Bereich, der Bundler lässt den Rest weg (Tree-Shaking).
//   - Schlüssel auf Deutsch in camelCase, nach Rolle benannt (huelleDazu), nicht nach Wortlaut.
//   - Keine Zahlen: Texte mit Werten sind Funktionen und bekommen die Werte fertig formatiert
//     (lib/format.js). Preise stehen nur in data/preise.js, Gerätewerte nur in data/geraete.js.
//   - Plural und Grammatik stecken ebenfalls in Funktionen, weil jede Sprache das anders löst.

// ── Sprache der Seite (<html lang>, Link-Vorschau) ──
export const sprache = {
  html: 'de-CH',
  og: 'de_CH',
};

// ── Titel und Beschreibung (BaseLayout: <title>, <meta description>, og:*) ──
export const meta = {
  marke: 'Kiesel',
  startTitel: 'Kiesel · Passt in jede Hand.',
  titel: (seite) => `${seite} · Kiesel`,
  beschreibung: 'Kiesel 1 und Kiesel 1 Pro: zwei kompakte Handys mit Akku bis in die Nacht. Ein Fan-Konzept.',
};

// ── Gerüst: Kopfzeile, Menüs, Unterleiste, Footer ──
export const geruest = {
  zumInhalt: 'Zum Inhalt',
  zurStartseite: 'Kiesel, zur Startseite',
  wortmarke: 'kiesel',
  hauptnavigation: 'Hauptnavigation',
  kaufen: 'Kaufen',
  kaufenAb: (preis) => `Kaufen ${preis}`,
  handys: 'Handys',
  mehrErfahren: 'Mehr erfahren',
  menue: 'Menü',
  menueOeffnen: 'Menü öffnen',
  menueSchliessen: 'Menü schliessen',
  warenkorb: 'Warenkorb',
  unterleiste: { uebersicht: 'Übersicht', technik: 'Technische Daten', vergleichen: 'Vergleichen' },
  footerSatz: 'Zwei kompakte Handys, die es nur als Idee gibt.',
  hinweisKonzept: 'Kiesel 1 und Kiesel 1 Pro sind Fan-Konzepte, keine echten Produkte. Preise und Werte sind Schätzungen.',
  hinweisMarke: 'iPhone ist eine Marke von Apple Inc.',
  thema: { legende: 'Thema', auto: 'Auto', light: 'Hell', dark: 'Dunkel' },
};

// ── Kleine Bausteine (Standard-Beschriftungen) ──
export const bausteine = {
  zoomstufe: 'Zoomstufe',
  fach: '-fach',           // nur für Screenreader: „3-fach“ statt „3x“
  modell: 'Modell',
};

// ── Zähler am Warenkorb-Knopf (WarenkorbKnopf.astro, auch im Browser) ──
export const warenkorbKnopf = {
  leer: 'Warenkorb, leer',
  artikel: (n) => `Warenkorb, ${n} Artikel`,
};

// ── Menüpunkte (data/navigation.js: Kennung → Name) ──
export const navigation = {
  handys: 'Handys',
  funktionen: 'Funktionen',
  zubehoer: 'Zubehör',
  vergleichen: 'Vergleichen',
  faq: 'FAQ',
  technik: 'Technische Daten',
  akkuRechner: 'Akku-Rechner',
  farben: 'Farben',
  huelle: 'Kiesel-Hülle',
  funktionenAusprobieren: 'Funktionen ausprobieren',
  kaufen: 'Kaufen',
  warenkorb: 'Warenkorb',
  entdecken: 'Entdecken',
  shop: 'Shop',
  hilfe: 'Hilfe',
  konzept: 'Über das Konzept',
  mehrZuDenHandys: 'Mehr zu den Handys',
  beliebt: 'Beliebt',
};

// ── Farben: Kennung (data/farben.js) → Name ──
export const farben = {
  'sky-blue': 'Himmelblau',
  'matte-black': 'Mattschwarz',
  'titanium-gray': 'Titangrau',
  'matte-white': 'Mattweiss',
  'pebble-beige': 'Kieselbeige',
};

// ── Warenkorb: Schublade und /warenkorb/ (WarenkorbInhalt.astro, auch im Browser) ──
export const warenkorb = {
  titel: 'Warenkorb',
  schliessen: 'Warenkorb schliessen',
  liste: 'Artikel im Warenkorb',
  leerTitel: 'Dein Warenkorb ist noch leer.',
  leerText: 'Zwei kleine Handys warten darauf, zusammengestellt zu werden.',
  zusammenstellen: 'Kiesel zusammenstellen',
  vorschlagTitel: 'Passende Hülle dazu?',
  // Satz mit dem Modellnamen als <span> dazwischen: vor + Modell + nach
  vorschlagVor: 'Kiesel-Hülle für ',
  vorschlagNach: (preis) => `, ${preis}. Hinten milchig, am Rand griffig.`,
  huellenFarbe: 'Farbe der Hülle',
  dazulegen: 'Dazulegen',
  weiter: 'Weiter einkaufen',
  zwischensumme: 'Zwischensumme',
  versand: 'Versand',
  kostenlos: 'kostenlos',
  mwst: (prozent) => `davon MwSt. ${prozent}`,
  total: 'Total',
  zurKasse: 'Zur Kasse',
  einsWeniger: 'Eins weniger',
  einsMehr: 'Eins mehr',
  entfernen: 'Entfernen',
  anzahl: (wer) => `Anzahl: ${wer}`,
  stueckPreis: (n, preis) => `${n} × ${preis}`,
  huelleFuer: (modell, farbe) => `Kiesel-Hülle für ${modell} in ${farbe}`,
  huelleDrin: (modell, farbe) => `Kiesel-Hülle für ${modell} in ${farbe} liegt im Warenkorb.`,
  huelleVoll: (modell, farbe, max) => `Von der Kiesel-Hülle für ${modell} in ${farbe} liegen schon ${max} im Warenkorb, mehr geht nicht.`,
  nichtMehr: (max) => `Mehr als ${max} Stück gehen nicht.`,
  nichtWeniger: 'Weniger als 1 geht nicht. Zum Wegnehmen „Entfernen“ wählen.',
  neueAnzahl: (name, n, total) => `${name}: ${n} Stück. Total ${total}.`,
  entfernt: (name) => `${name} entfernt.`,
  imWarenkorb: 'Im Warenkorb ✓',
};

// ── Kasse (KasseDialog.astro, auch im Browser) ──
export const kasse = {
  kicker: 'Kasse',
  titel: 'Kiesel gibt es nur in unseren Köpfen.',
  bezahlen: 'Bezahlen kannst du darum nichts.',
  // je nachdem, wo der Warenkorb gespeichert ist (speicherOrt() in scripts/warenkorb.js)
  speicher: {
    dauerhaft: 'Dein Warenkorb bleibt aber gespeichert, falls Cupertino es sich doch noch anders überlegt.',
    sitzung: 'Dein Warenkorb bleibt aber da, solange dieser Tab offen ist, falls Cupertino es sich doch noch anders überlegt.',
    seite: 'Dein Warenkorb bleibt aber da, bis du diese Seite verlässt, falls Cupertino es sich doch noch anders überlegt.',
  },
  bestellung: 'Deine Bestellung',
  weitertraeumen: 'Weiterträumen',
  leeren: 'Warenkorb leeren',
};

// ── Warenkorb: Name und Beschreibung eines Artikels (scripts/warenkorb.js, artikelInfo) ──
export const warenkorbArtikel = {
  huelle: 'Kiesel-Hülle',
  huelleDetails: (modell, farbe) => `für ${modell}, ${farbe}`,
  // gravur schon mit geschützten Leerzeichen; davor ebenfalls eines, damit „Gravur «…»“ zusammenbleibt
  handyDetails: (farbe, speicher, gravur) => `${farbe}, ${speicher}` + (gravur ? `, Gravur «${gravur}»` : ''),
};

// ── FAQ: Namen der Themen (Kennungen in data/faq.js THEMEN) ──
export const faqThemen = {
  alle: 'Alle',
  concept: 'Konzept',
  phones: 'Handys',
  battery: 'Akku und Laden',
  features: 'Funktionen',
  buying: 'Kaufen',
};

// ── Die acht versteckten Details im Alpenpanorama (Kennungen in kiesel-draw/ausschnitt.js) ──
export const panoramaDetails = {
  'summit-cross': 'Gipfelkreuz',
  'rope-team': 'Seilschaft auf dem Grat',
  ibex: 'Steinbock',
  'mountain-hut': 'SAC-Hütte mit Fahne',
  gondola: 'Gondelbahn',
  paraglider: 'Gleitschirm',
  sailboat: 'Segelboot',
  village: 'Dorf mit Kirche',
};

// ── Vorgaben der Blume (Spielwiese, Kennungen in kiesel-draw/scene.js BLUME_FOKUS) ──
export const blumeFokus = {
  tele: 'Blume (3x Tele)',
  bee: 'Biene',
  macro: 'Makro (alles nah)',
  all: 'Alles scharf',
};

// ── 404 ──
export const fehler404 = {
  titel: 'Seite nicht gefunden',
  beschreibung: 'Diese Seite gibt es nicht (mehr). Von hier geht es zurück zu Kiesel 1 und Kiesel 1 Pro.',
  ueberschrift: 'Dieser Kiesel ist weggerollt.',
  text: 'Die Seite gibt es nicht (mehr). Vielleicht hilft einer dieser Wege weiter.',
  zurStartseite: 'Zur Startseite',
  proAnsehen: 'Kiesel 1 Pro ansehen',
};

// ── /warenkorb/ ──
export const warenkorbSeite = {
  titel: 'Warenkorb',
  beschreibung: 'Deine Auswahl, bereit für die Kasse, die leider nur ein Konzept ist.',
  einleitung: 'Deine Auswahl, bereit für die Kasse. Die ist leider nur ein Konzept.',
};

// ── Preise: Beschriftungen um die Zahlen herum (data/preise.js) ──
export const preise = {
  ab: (preis) => `ab ${preis}`,
  bereich: (von, bis) => `${von} bis ${bis}`,
  unterzeile: { k1: 'SE-Grösse', pro: '13-mini-Grösse, 3x-Tele' },
};

// ── Gravur: Meldungen der Prüfung (lib/gravur.js, auch im Browser) ──
export const gravur = {
  erlaubt: "Buchstaben, Zahlen, Leerzeichen und . , ' ’ & ! ? + -",
  tabulator: 'Tabulator',
  sonderLeerzeichen: 'Sonder-Leerzeichen',
  zeichen: (z) => `«${z}»`,
  nichtErlaubt: (liste, anzahl) => `${liste} ${anzahl === 1 ? 'geht' : 'gehen'} nicht auf die Gravur. Erlaubt sind ${gravur.erlaubt}`,
  zuLang: (max, zuviel) => `Höchstens ${max} Zeichen, das ${zuviel === 1 ? 'ist 1' : `sind ${zuviel}`} zu viel.`,
};

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
