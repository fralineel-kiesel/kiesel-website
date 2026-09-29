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

// ── Farben: Kennung (data/farben.js) → Name ──
export const farben = {
  'sky-blue': 'Himmelblau',
  'matte-black': 'Mattschwarz',
  'titanium-gray': 'Titangrau',
  'matte-white': 'Mattweiss',
  'pebble-beige': 'Kieselbeige',
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
