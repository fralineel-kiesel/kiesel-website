// All visible texts of Kiesel 2.0 in English (American English: color, gray).
// Same keys as de.js, one file per area in src/i18n/en/, same split as src/i18n/de/ (the
// browser scripts import just their part). pruefe:englisch checks that both have exactly the
// same keys and no empty values. Only exception: faqFragen.pebble (“Why is it called Kiesel?”)
// exists only in English.
//
// Glossary (binding): Kiesel stays “Kiesel” · Passt in jede Hand = Fits every hand ·
// Zen-Modus = Zen Mode · Privacy-Modus = Privacy Mode · Sensoren aus = Sensors Off ·
// Funkstille = Radio Silence · RGB-Licht = RGB light · Action-Button = Action button ·
// Kamera-Knopf = Camera button · Seitentaste = side button · Hülle = case ·
// Kiesel-Hülle = Kiesel Case · Akku-Rechner = Battery Calculator · Warenkorb = Bag ·
// Kasse = Checkout · MwSt. = VAT · Mattschwarz = Matte Black · Titangrau = Titanium Gray ·
// Himmelblau = Sky Blue · Mattweiss = Matte White · Kieselbeige = Pebble Beige
//
// Rules as in de.js: no numbers (values come in as parameters, formatted by lib/format.js),
// grammar and plurals in functions.

export * from './en/gemeinsam.js';
export * from './en/kaufen.js';
export * from './en/modelle.js';
export * from './en/akku.js';
export * from './en/kamera.js';
export * from './en/zeichnung.js';
export * from './en/vergleichen.js';
export * from './en/faq.js';
export * from './en/funktionen.js';
export * from './en/zubehoer.js';
