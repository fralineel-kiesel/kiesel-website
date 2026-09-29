// Technische Daten beider Kiesel: die komplette Tabelle SPEC aus design/generator/gen4.py
// (Artboard „Technische Daten“). Die Seiten /kiesel-1/technik/ und /kiesel-1-pro/technik/,
// die Modellseiten, die Startseite und die FAQ lesen von hier.
//
// Körperliche Werte (Masse, Gewicht, Akku, Display) kommen aus geraete.js, Speicher und Preise
// aus preise.js, Farbnamen aus farben.js. Was sonst an mehreren Stellen vorkommt (RAM, Watt,
// Updates …), steht einmal in WERTE. Alle Kiesel-Werte sind Konzept-Schätzungen.
//
// Die Texte (Gruppen, Merkmale, Werte in Worten) stehen in der Textdatei (technik in
// src/i18n/de.js). Jede Zeile hat eine Kennung (ram, kuehlung …), damit man sie unabhängig von
// der Sprache finden kann: technik('ram', 'pro'). technikTabelle(T) baut die Tabelle in einer
// anderen Sprache; TECHNIK ist die deutsche (so vergleicht pruefe:vergleichen mit SPEC).
import { masse, gewicht, akku, zoll } from './geraete.js';
import { PREISE } from './preise.js';
import { FARBEN_TEXT } from './farben.js';
import { farben as FARBNAME, technik as DE, geraete as GERAETE_T } from '../i18n/de.js';
import { chf } from '../lib/format.js';

export const WERTE = {
  ramGb: 12,             // Arbeitsspeicher, beide Modelle
  megapixel: 50,         // jede Kamera, auch das Tele des Pro
  brennweite: [13, 26],  // Hauptkamera, variable Linse 0.5x bis 1x (mm, ca.)
  nm: 2,                 // Chip: Fertigung
  ghz: 4,                // Chip: höchster Takt
  fps: { video: 120, zeitlupe: 240 },  // 4K bzw. 2K
  wattKabel: 45,         // Laden mit Kabel (ca.)
  wattKabellos: 25,      // MagSafe und Qi
  updateJahre: 7,        // mindestens
  schutz: 'IP68',
  hertz: [1, 90],        // Bildrate des Displays: von, bis (Text: technik.hertz in der Textdatei)
  tele: 3,               // Pro: optischer Zoom
  teleMm: 78,
  zoomDigital: { k1: 5, pro: 10 },
  nahfokusCm: 20,        // Pro: Tele-Nahfokus
  system: 'iOS 27',
};
const W = WERTE;

// „1 bis 90 Hz“ in der Sprache der Texte
export const hertzText = (T = DE) => T.hertz(...W.hertz);

// Gruppen: { id, titel, zeilen: [[kennung, Merkmal, Kiesel 1, Kiesel 1 Pro], …] }
function gruppen(T = DE, farbname = FARBNAME, G = GERAETE_T, sprache = 'de') {
  const V = T.werte;
  const stufen = (m) => PREISE[m].speicher;
  const speicher = (m) => stufen(m).map((s) => s.name).join(', ');
  const preisStufe = (s) => V.preisStufe(chf(s.preis, sprache), s.name);
  const farben = FARBEN_TEXT.map((f) => farbname[f]).join(', ');
  const hertz = hertzText(T);
  const beide = (text) => [text, text];
  const z = (id, ...werte) => [id, T.merkmale[id], ...werte];
  const g = (id, zeilen) => ({ id, titel: T.gruppen[id], zeilen });
  return [
    g('design', [
      z('masse', masse('k1', G, sprache), masse('pro', G, sprache)),
      z('gewicht', gewicht('k1', G), gewicht('pro', G)),
      z('rahmen', ...beide(V.rahmen)),
      z('farben', ...beide(farben)),
      z('wasser', ...beide(W.schutz)),
    ]),
    g('display', [
      z('groesse', V.display(zoll('k1', G, sprache)), V.display(zoll('pro', G, sprache))),
      z('bildrate', ...beide(V.bildrate(hertz))),
      z('entsperren', ...beide(V.entsperren)),
    ]),
    g('chip', [
      z('chip', ...beide(V.chip(W.nm))),
      z('cpu', ...beide(V.cpu(W.ghz))),
      z('gpu', ...beide(V.gpu)),
      z('ram', ...beide(V.ram(W.ramGb))),
      z('speicher', speicher('k1'), speicher('pro')),
      z('kuehlung', V.kuehlung.k1, V.kuehlung.pro),
    ]),
    g('kameras', [
      z('hauptkamera', ...beide(V.hauptkamera(W.megapixel, ...W.brennweite))),
      z('tele', V.keine, V.tele(W.megapixel, W.tele, W.teleMm)),
      z('zoom', V.zoomK1(W.zoomDigital.k1), V.zoomPro(W.tele, W.zoomDigital.pro)),
      z('nah', V.nahK1, V.nahPro(W.nahfokusCm)),
      z('blitz', ...beide(V.blitz)),
    ]),
    g('video', [
      z('maximal', ...beide(V.videoMaximal(W.fps.video))),
      z('zeitlupe', ...beide(V.zeitlupe(W.fps.zeitlupe))),
    ]),
    g('akku', [
      z('akku', V.akku(akku('k1', G)), V.akku(akku('pro', G))),
      z('kabel', ...beide(V.kabel(W.wattKabel))),
      z('kabellos', ...beide(V.kabellos(W.wattKabellos))),
    ]),
    g('verbindungen', [
      z('anschluss', ...beide(V.anschluss)),
      z('sim', ...beide(V.sim)),
      z('mobilfunk', ...beide(V.mobilfunk)),
    ]),
    g('software', [
      z('system', ...beide(V.system(W.system))),
      z('updates', ...beide(V.updates(W.updateJahre))),
      z('tasten', ...beide(V.tasten)),
      z('extras', ...beide(V.extras)),
    ]),
    g('preis', [
      z('ab', preisStufe(stufen('k1')[0]), preisStufe(stufen('pro')[0])),
      z('bis', preisStufe(stufen('k1').at(-1)), preisStufe(stufen('pro').at(-1))),
    ]),
  ];
}

// Tabelle wie SPEC in gen4.py: { titel, zeilen: [[Merkmal, Kiesel 1, Kiesel 1 Pro], …] }
// G = Abschnitt geraete der Textdatei („ca.“), sprache fürs Zahlen- und Preisformat
export const technikTabelle = (T = DE, farbname = FARBNAME, G = GERAETE_T, sprache = 'de') =>
  gruppen(T, farbname, G, sprache).map((g) => ({ titel: g.titel, zeilen: g.zeilen.map(([, ...rest]) => rest) }));
export const TECHNIK = technikTabelle();

// Vier Kennzahlen oben auf der Technik-Seite (key_nums in gen4.py)
export const technikKennzahlen = (T = DE) => [
  { zahl: `${W.ramGb} GB`, ...T.kennzahlen.ram },
  { zahl: `${W.megapixel} MP`, ...T.kennzahlen.kamera },
  { zahl: `${W.wattKabel} W`, titel: T.kennzahlen.laden.titel, text: T.kennzahlen.laden.text(W.wattKabellos) },
  { zahl: T.kennzahlen.jahre(W.updateJahre), ...T.kennzahlen.updates },
];
export const TECHNIK_KENNZAHLEN = technikKennzahlen();

// Wert einer Zeile für ein Modell: technik('ram', 'pro') → '12 GB RAM'
export function technik(kennung, modell, T = DE) {
  for (const g of gruppen(T)) {
    const z = g.zeilen.find((r) => r[0] === kennung);
    if (z) return z[modell === 'pro' ? 3 : 2];
  }
  throw new Error(`Technik: Merkmal „${kennung}“ gibt es nicht`);
}
