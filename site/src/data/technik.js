// Technische Daten beider Kiesel: die komplette Tabelle SPEC aus design/generator/gen4.py
// (Artboard „Technische Daten“). Die Seiten /kiesel-1/technik/ und /kiesel-1-pro/technik/,
// die Modellseiten, die Startseite und die FAQ lesen von hier.
//
// Körperliche Werte (Masse, Gewicht, Akku, Display) kommen aus geraete.js, Speicher und Preise
// aus preise.js, Farbnamen aus farben.js. Was sonst an mehreren Stellen vorkommt (RAM, Watt,
// Updates …), steht einmal in WERTE. Alle Kiesel-Werte sind Konzept-Schätzungen.
import { masse, gewicht, akku, zoll } from './geraete.js';
import { PREISE } from './preise.js';
import { FARBEN_TEXT } from './farben.js';
import { chf } from '../lib/format.js';

export const WERTE = {
  ramGb: 12,             // Arbeitsspeicher, beide Modelle
  megapixel: 50,         // jede Kamera, auch das Tele des Pro
  wattKabel: 45,         // Laden mit Kabel (ca.)
  wattKabellos: 25,      // MagSafe und Qi
  updateJahre: 7,        // mindestens
  schutz: 'IP68',
  hertz: '1 bis 90 Hz',
  tele: 3,               // Pro: optischer Zoom
  teleMm: 78,
  zoomDigital: { k1: 5, pro: 10 },
  nahfokusCm: 20,        // Pro: Tele-Nahfokus
  system: 'iOS 27',
};
const W = WERTE;

// Speicher und Preis aus preise.js
const stufen = (m) => PREISE[m].speicher;
const speicher = (m) => stufen(m).map((s) => s.name).join(', ');
const ab = (m) => { const s = stufen(m)[0]; return `${chf(s.preis)} (${s.name})`; };
const bis = (m) => { const s = stufen(m).at(-1); return `${chf(s.preis)} (${s.name})`; };
const farben = FARBEN_TEXT.join(', ');
const beide = (text) => [text, text];

// Gruppen: { titel, zeilen: [[Merkmal, Kiesel 1, Kiesel 1 Pro], …] }
export const TECHNIK = [
  { titel: 'Design und Masse', zeilen: [
    ['Masse', masse('k1'), masse('pro')],
    ['Gewicht', gewicht('k1'), gewicht('pro')],
    ['Rahmen', ...beide('Titan, matt')],
    ['Farben', ...beide(farben)],
    ['Wasser und Staub', ...beide(W.schutz)],
  ] },
  { titel: 'Display', zeilen: [
    ['Grösse', `${zoll('k1')} OLED, randlos`, `${zoll('pro')} OLED, randlos`],
    ['Bildrate', ...beide(`LTPO, ${W.hertz}`)],
    ['Entsperren', ...beide('Face ID in der Dynamic Island')],
  ] },
  { titel: 'Chip und Speicher', zeilen: [
    ['Chip', ...beide('A20 Pro abgespeckt, 2 nm')],
    ['CPU', ...beide('1 Super-Kern + 3 Effizienz-Kerne, max. 4 GHz')],
    ['GPU', ...beide('ca. 4 Kerne')],
    ['Arbeitsspeicher', ...beide(`${W.ramGb} GB RAM`)],
    ['Speicher', speicher('k1'), speicher('pro')],
    ['Kühlung', 'passiv über die Rückseite', 'Mini-Vapor-Chamber plus Rückseite'],
  ] },
  { titel: 'Kameras', zeilen: [
    ['Hauptkamera', ...beide(`${W.megapixel} MP, variable Linse 0.5x bis 1x (ca. 13 bis 26 mm)`)],
    ['Tele', '–', `${W.megapixel} MP, ${W.tele}x (ca. ${W.teleMm} mm), optischer Bildstabilisator`],
    ['Zoom', `digital bis ${W.zoomDigital.k1}x`, `optisch ${W.tele}x, digital bis ${W.zoomDigital.pro}x`],
    ['Nahaufnahmen', 'Makro über 0.5x', `Makro über 0.5x, Tele-Nahfokus ab ca. ${W.nahfokusCm} cm`],
    ['Blitz', ...beide('RGB-LED mit Benachrichtigungen')],
  ] },
  { titel: 'Video', zeilen: [
    ['Maximal', ...beide('4K mit 120 fps')],
    ['Zeitlupe', ...beide('2K mit 240 fps')],
  ] },
  { titel: 'Akku und Laden', zeilen: [
    ['Akku', `${akku('k1')}, Silizium-Kohlenstoff`, `${akku('pro')}, Silizium-Kohlenstoff`],
    ['Mit Kabel', ...beide(`ca. ${W.wattKabel} W über USB-C`)],
    ['Kabellos', ...beide(`${W.wattKabellos} W über MagSafe und Qi`)],
  ] },
  { titel: 'Verbindungen', zeilen: [
    ['Anschluss', ...beide('USB-C')],
    ['SIM', ...beide('nur eSIM')],
    ['Mobilfunk', ...beide('4G als Standard, 5G nur bei hoher Datenlast')],
  ] },
  { titel: 'Software und Funktionen', zeilen: [
    ['System', ...beide(`${W.system} mit schlankem Look`)],
    ['Updates', ...beide(`mindestens ${W.updateJahre} Jahre System- und Sicherheitsupdates`)],
    ['Tasten', ...beide('Action-Button, Kamera-Knopf, Lautstärke, Seitentaste')],
    ['Extras', ...beide('Zen-Modus, Privacy-Modus mit Hardware-Trennung')],
  ] },
  { titel: 'Preis', zeilen: [
    ['Ab', ab('k1'), ab('pro')],
    ['Bis', bis('k1'), bis('pro')],
  ] },
];

// Vier Kennzahlen oben auf der Technik-Seite (key_nums in gen4.py)
export const TECHNIK_KENNZAHLEN = [
  { zahl: `${W.ramGb} GB`, titel: 'Arbeitsspeicher', text: 'in beiden Modellen' },
  { zahl: `${W.megapixel} MP`, titel: 'bei jeder Kamera', text: 'auch beim Tele des Pro' },
  { zahl: `${W.wattKabel} W`, titel: 'mit Kabel', text: `${W.wattKabellos} W kabellos über MagSafe` },
  { zahl: `${W.updateJahre} Jahre`, titel: 'Updates', text: 'mindestens, für System und Sicherheit' },
];

// Wert einer Zeile für ein Modell: technik('Arbeitsspeicher', 'pro') → '12 GB RAM'
export function technik(merkmal, modell) {
  for (const g of TECHNIK) {
    const z = g.zeilen.find((r) => r[0] === merkmal);
    if (z) return z[modell === 'pro' ? 2 : 1];
  }
  throw new Error(`Technik: Merkmal „${merkmal}“ gibt es nicht`);
}
