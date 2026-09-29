// Alle Seiten von Kiesel 2.0 und ihre Adressen in beiden Sprachen: das Adressbuch.
// Einziger Ort für diese Zuordnung. Daraus entstehen sitemap.xml (nur öffentliche Seiten, siehe
// pages/sitemap.xml.js), hreflang-Verweise und Sprachumschalter (BaseLayout), jeder interne Link
// (lib/pfad.js) und die Seitenlisten der Prüfskripte (scripts/seiten.mjs).
//
// Die deutsche Adresse ist die Kennung einer Seite. Im Code steht immer sie:
//   pfad('kaufen/?modell=pro#farben', 'en')  →  …/en/buy/?model=pro#colors
// pruefe-ganz.mjs meldet, wenn im Build eine Seite dazukommt, die hier fehlt, und prüft,
// dass genau die öffentlichen Seiten in der Sitemap stehen.

// Vorsatz der englischen Seiten (relativ zum base-Pfad)
export const EN_PRAEFIX = 'en/';

// [deutsche Adresse, Name, öffentlich, englische Adresse ohne en/ (null = nur Deutsch)]
// Adressen relativ zu /kiesel-website/v2/ bzw. /kiesel-website/v2/en/.
// Nicht öffentlich: /designsystem/ und /spielwiese/ (noindex, Werkbank, nur Deutsch) und die
// 404-Seite (eine pro Sprache; GitHub Pages liefert nur die deutsche aus, sie tauscht selbst).
export const SEITEN = [
  ['', 'Startseite', true, ''],
  ['kiesel-1/', 'Kiesel 1', true, 'kiesel-1/'],
  ['kiesel-1/technik/', 'Kiesel 1 · Technik', true, 'kiesel-1/specs/'],
  ['kiesel-1-pro/', 'Kiesel 1 Pro', true, 'kiesel-1-pro/'],
  ['kiesel-1-pro/technik/', 'Kiesel 1 Pro · Technik', true, 'kiesel-1-pro/specs/'],
  ['vergleichen/', 'Vergleichen', true, 'compare/'],
  ['akku-rechner/', 'Akku-Rechner', true, 'battery-calculator/'],
  ['funktionen/', 'Funktionen', true, 'features/'],
  ['zubehoer/', 'Zubehör', true, 'accessories/'],
  ['zubehoer/huelle/', 'Kiesel-Hülle', true, 'accessories/case/'],
  ['kaufen/', 'Kaufen', true, 'buy/'],
  ['warenkorb/', 'Warenkorb', true, 'bag/'],
  ['faq/', 'FAQ', true, 'faq/'],
  ['404.html', '404', false, '404.html'],
  ['designsystem/', 'Designsystem', false, null],
  ['designsystem/spielwiese/', 'Spielwiese', false, null],
];

// Dieselben Seiten als Liste je Sprache, gleicher Aufbau wie SEITEN: [Adresse, Name, öffentlich].
// Die englischen Adressen tragen den Vorsatz en/, die Namen ein „(en)“ (nur für Prüfskripte).
export const SEITEN_EN = SEITEN.filter(([, , , en]) => en !== null)
  .map(([, name, oeffentlich, en]) => [EN_PRAEFIX + en, `${name} (en)`, oeffentlich]);
export const ALLE_SEITEN = [...SEITEN.map(([de, name, o]) => [de, name, o]), ...SEITEN_EN];

export const OEFFENTLICH = SEITEN.filter(([, , o]) => o);
export const OEFFENTLICH_EN = SEITEN_EN.filter(([, , o]) => o);
export const ALLE_OEFFENTLICH = [...OEFFENTLICH.map(([de, name, o]) => [de, name, o]), ...OEFFENTLICH_EN];

// Sprungziele (id="…" und #… in Links): Kennung = deutscher Name → englischer Name.
// Die Kennungen der FAQ-Fragen (data/faq.js) sind ebenfalls Sprungziele (/faq/#konzept).
export const ANKER = {
  inhalt: 'content',        // „Zum Inhalt“-Link, <main>
  farben: 'colors',         // Modellseiten
  kamera: 'camera',         // /funktionen/, Modellseiten
  akku: 'battery',          // Modellseiten, FAQ
  makro: 'macro',
  modelle: 'models',        // Startseite
  funktionen: 'features',
  fragen: 'questions',
  rgb: 'rgb',
  zen: 'zen',
  privacy: 'privacy',
  // FAQ-Fragen
  kaufen: 'buy',
  konzept: 'concept',
  unterschied: 'differences',
  dicke: 'thickness',
  klinke: 'headphone-jack',
  wasser: 'water',
  updates: 'updates',
  laden: 'charging',
  notruf: 'emergency',
  huelle: 'case',
  warenkorb: 'bag',
  pebble: 'pebble',         // nur Englisch: „Why Kiesel?“
};

// Namen der URL-Parameter: deutsch → englisch. Die Werte sind Kennungen (pro, sky-blue, 2tb …)
// und bleiben gleich. Englische Seiten verstehen beide Namen, schreiben aber die englischen.
export const PARAMETER = {
  modell: 'model',      // /kaufen/, /zubehoer/huelle/
  farbe: 'color',       // /kaufen/, /zubehoer/huelle/
  speicher: 'storage',  // /kaufen/
  huelle: 'case',       // /kaufen/ (Farbe der Hülle)
  kiesel: 'phone',      // /vergleichen/
  gegen: 'vs',          // /vergleichen/
  ansicht: 'view',      // /vergleichen/
  karte: 'card',        // /vergleichen/
};
