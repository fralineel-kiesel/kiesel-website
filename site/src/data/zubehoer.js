// Daten der Seiten /zubehoer/ und /zubehoer/huelle/ (Artboards „Zubehör“ und „Kiesel-Hülle“,
// design/generator/gen3.py). Der Preis steht in preise.js (HUELLE_PREIS), die Texte in der
// Textdatei (zubehoer und huelle in src/i18n/de.js). …Fuer(T) baut sie in einer Sprache,
// ZUBEHOER und HUELLE sind die deutsche Fassung.
// Platzhalter in eckigen Klammern sind bewusst so: nichts erfinden, bis es feststeht.
import { FARBEN_TEXT } from './farben.js';
import { farben as FARBNAME, zubehoer as DE_Z, huelle as DE_H } from '../i18n/de.js';

export const zubehoerFuer = (T = DE_Z) => ({
  titel: T.titel,
  einleitung: T.einleitung,
  filter: ['alle', 'k1', 'pro'].map((id) => [id, T.filter[id]]),
  // Die zwei Hüllen-Karten: Modell, Handyfarbe der Abbildung, Hüllenfarbe (kommt in den Warenkorb)
  produkte: [
    { modell: 'k1', handy: 'pebble-beige', huelle: 'matte-white' },
    { modell: 'pro', handy: 'sky-blue', huelle: 'matte-black' },
  ],
  platzhalter: T.platzhalter,
  kombi: { titel: T.kombi.titel, text: T.kombi.text, handy: 'sky-blue', huelle: 'matte-white', knopf: T.kombi.knopf },
});
export const ZUBEHOER = /* @__PURE__ */ zubehoerFuer();

// Masse der Kiesel-Hülle in mm (gen3.py): Text der technischen Details und Profilschnitt
export const HUELLE_MASSE = {
  rand: 1.2,          // trägt pro Seite auf
  ueberDisplay: 0.8,  // erhöhter Rahmen vorne
  ueberKamera: 0.6,   // Luft unter der Kamera, wenn das Handy auf dem Rücken liegt
  boden: 1.4,         // Rückseite (nur im Profilschnitt)
};
const HM = HUELLE_MASSE;

export const huelleFuer = (T = DE_H, farbname = FARBNAME) => ({
  titel: T.titel,
  text: T.text,
  modellFrage: T.modellFrage,
  modelle: [['k1', 'Kiesel 1', T.groesse.k1], ['pro', 'Kiesel 1 Pro', T.groesse.pro]],
  ansichten: [['hinten', T.ansichten.hinten], ['vorne', T.ansichten.vorne]],
  farbeLegende: T.farbeLegende,
  vorschauLegende: T.vorschauLegende,
  start: { modell: 'pro', huelle: 'matte-white', handy: 'sky-blue' },
  knopf: T.knopf,
  hinweis: T.hinweis,
  eigenschaftenTitel: T.eigenschaftenTitel,
  eigenschaften: T.eigenschaften,
  detailsTitel: T.detailsTitel,
  details: [
    [T.details.passt, T.details.passtWert],
    [T.details.farben, FARBEN_TEXT.map((f) => farbname[f]).join(', ')],
    [T.details.rand, T.details.randWert(HM.rand)],
    [T.details.ueberstand, T.details.ueberstandWert(HM.ueberDisplay, HM.ueberKamera)],
    [T.details.magsafe, T.details.magsafeWert],
    [T.details.material, T.details.materialWert],
    [T.details.preis, null], // aus HUELLE_PREIS
  ],
});
export const HUELLE = /* @__PURE__ */ huelleFuer();

// Eintrag für den Warenkorb: nur Modell und Hüllenfarbe, nie die Vorschau-Handyfarbe.
// Den Preis rechnet der Warenkorb selbst aus data/preise.js.
export function huellenArtikel(modell, farbe) {
  return { art: 'case', modell, farbe };
}
