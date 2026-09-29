// Preise und Produktdaten an EINEM Ort. Konfigurator, Warenkorb, Zubehör, Menüs, Modellseiten
// und FAQ lesen alle von hier. Nirgends sonst im Code darf eine Preiszahl stehen
// (npm run pruefe:kaufen sucht danach).
//
// Preise in ganzen Franken. Gerechnet wird im Warenkorb in Rappen (siehe summen() in
// scripts/warenkorb.js), weil Kommazahlen im Computer nicht exakt sind: 0.1 + 0.2 = 0.30000000000000004.
import { chf } from '../lib/format.js';
import { preise as T } from '../i18n/de.js';

// Speicherstufen: id (für Adresse und Warenkorb), Anzeigename, Preis.
// name = Eigenname, name der Speicherstufe = Einheit (in jeder Sprache gleich). Die Unterzeile
// der Modelle („SE-Grösse“) steht in der Textdatei (preise.unterzeile in src/i18n/de.js).
export const PREISE = {
  k1: {
    name: 'Kiesel 1',
    speicher: [
      { id: '256gb', name: '256 GB', preis: 1200 },
      { id: '512gb', name: '512 GB', preis: 1400 },
      { id: '1tb', name: '1 TB', preis: 1600 },
    ],
  },
  pro: {
    name: 'Kiesel 1 Pro',
    speicher: [
      { id: '256gb', name: '256 GB', preis: 1500 },
      { id: '512gb', name: '512 GB', preis: 1700 },
      { id: '1tb', name: '1 TB', preis: 1900 },
      { id: '2tb', name: '2 TB', preis: 2300 },
    ],
  },
};

export const MODELL_IDS = Object.keys(PREISE);

// Die Kiesel-Hülle: ein Preis für beide Modelle
export const HUELLE_PREIS = 59;

// Versand und Mehrwertsteuer (Schweiz, Normalsatz seit 2024). Die Preise sind inkl. MwSt.
export const VERSAND = 0;
export const MWST_PROZENT = 8.1;

// Höchstens so viele Stück pro Artikel im Warenkorb
export const MAX_ANZAHL = 9;

// Speicherstufe eines Modells nach id (oder undefined)
export const speicherStufe = (modell, id) => PREISE[modell]?.speicher.find((s) => s.id === id);

// Kleinster und grösster Preis eines Modells
export const minPreis = (modell) => Math.min(...PREISE[modell].speicher.map((s) => s.preis));

// „ab CHF 1’200.–“. Texte als Parameter (Standard: Deutsch), sprache für das Zahlenformat.
export const abPreis = (modell, texte = T, sprache = 'de') => texte.ab(chf(minPreis(modell), sprache));

// Speicherbereich als Text: „256 GB bis 2 TB“
export function speicherBereich(modell, texte = T) {
  const s = PREISE[modell].speicher;
  return texte.bereich(s[0].name, s[s.length - 1].name);
}
