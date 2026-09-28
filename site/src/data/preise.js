// Preise und Produktdaten an EINEM Ort. Konfigurator, Warenkorb, Zubehör, Menüs, Modellseiten
// und FAQ lesen alle von hier. Nirgends sonst im Code darf eine Preiszahl stehen
// (npm run pruefe:kaufen sucht danach).
//
// Preise in ganzen Franken. Gerechnet wird im Warenkorb in Rappen (siehe summen() in
// scripts/warenkorb.js), weil Kommazahlen im Computer nicht exakt sind: 0.1 + 0.2 = 0.30000000000000004.
import { FARBNAMEN } from './farben.js';
import { chf } from '../lib/format.js';

export { FARBNAMEN };

// Speicherstufen: id (für Adresse und Warenkorb), Anzeigename, Preis
export const PREISE = {
  k1: {
    name: 'Kiesel 1',
    sub: 'SE-Grösse',
    speicher: [
      { id: '256gb', name: '256 GB', preis: 1200 },
      { id: '512gb', name: '512 GB', preis: 1400 },
      { id: '1tb', name: '1 TB', preis: 1600 },
    ],
  },
  pro: {
    name: 'Kiesel 1 Pro',
    sub: '13-mini-Grösse, 3x-Tele',
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

// „ab CHF 1’200.–“
export const abPreis = (modell) => 'ab ' + chf(minPreis(modell));

// Speicherbereich als Text: „256 GB bis 2 TB“
export function speicherBereich(modell) {
  const s = PREISE[modell].speicher;
  return `${s[0].name} bis ${s[s.length - 1].name}`;
}
