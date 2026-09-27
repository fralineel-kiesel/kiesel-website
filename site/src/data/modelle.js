// Eckdaten der beiden Modelle, soweit die Seiten sie schon in Etappe 1 brauchen
// (Menü, Unterleiste, Preise). Quelle: Tabelle in CLAUDE.md.
import { chf } from '../lib/format.js';

export const MODELLE = {
  k1: {
    name: 'Kiesel 1',
    pfad: 'kiesel-1/',
    kurz: 'SE-Grösse, Akku für den ganzen Tag',
    farbe: 'Himmelblau',          // Farbe im Menü
    speicher: [['256 GB', 1200], ['512 GB', 1400], ['1 TB', 1600]],
  },
  pro: {
    name: 'Kiesel 1 Pro',
    pfad: 'kiesel-1-pro/',
    kurz: '13-mini-Grösse mit 3x-Tele',
    farbe: 'Titangrau',
    speicher: [['256 GB', 1500], ['512 GB', 1700], ['1 TB', 1900], ['2 TB', 2300]],
  },
};

export const HUELLE_PREIS = 59;

// „ab CHF 1’200.–“: der kleinste Preis eines Modells
export function abPreis(modell) {
  return 'ab ' + chf(Math.min(...MODELLE[modell].speicher.map(([, preis]) => preis)));
}
