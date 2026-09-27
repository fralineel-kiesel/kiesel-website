// Eckdaten der beiden Modelle: Menü, Unterleiste, Preise, Modellkarte und Modellseite.
// Quelle: Tabelle in CLAUDE.md. Die vollständige Datentabelle steht in technik.js.
import { chf } from '../lib/format.js';

export const MODELLE = {
  k1: {
    name: 'Kiesel 1',
    pfad: 'kiesel-1/',
    kurz: 'SE-Grösse, Akku für den ganzen Tag',
    farbe: 'Himmelblau',          // Farbe im Menü
    speicher: [['256 GB', 1200], ['512 GB', 1400], ['1 TB', 1600]],
    // Modellkarte auf der Startseite (Artboard „Startseite Desktop“, model_card() in gen2.py)
    karte: {
      farbe: 'Kieselbeige',
      unter: 'So gross wie das iPhone SE von 2016.',
      eckdaten: ['ca. 4.7″ OLED, 1 bis 90 Hz', 'Eine Kamera, 0.5x bis 1x, digital bis 5x', 'ca. 3000 mAh', '256 GB bis 1 TB'],
    },
    // Modellseite /kiesel-1/ (sinngemäss nach Artboard „Modellseite Kiesel 1 Pro“)
    seite: {
      unterzeile: 'Die Grösse von 2016. Der Akku von heute.',
      farbe: 'Kieselbeige',
      speicherText: '256 GB bis 1 TB',
      // Kennzahlen: Text als [lang, kurz fürs Handy] oder nur ein Text
      kennzahlen: [
        { zahl: '4.7″', titel: ['OLED-Display'], text: ['LTPO von 1 bis 90 Hz', '1 bis 90 Hz'] },
        { zahl: '3000', titel: ['mAh'], text: ['fast doppelt so viel wie das SE'] },
        { zahl: '50 MP', titel: ['eine Kamera', 'Kamera'], text: ['0.5x bis 1x, mit Makro', '0.5x bis 1x, Makro'] },
        { zahl: '9 mm', titel: ['flach genug'], text: ['1.4 mm mehr als das SE, für mehr Akku', 'für mehr Akku'] },
      ],
      // „Das Wichtigste auf einen Blick“ (spec_rows in gen2.py)
      eckdaten: [
        ['Display', 'ca. 4.7″ OLED, LTPO 1 bis 90 Hz'],
        ['Chip', 'A20 Pro abgespeckt, 1+3 Kerne, max. 4 GHz'],
        ['Kamera', '0.5x bis 1x (50 MP), Makro, digital bis 5x'],
        ['Akku', 'ca. 3000 mAh, Silizium-Kohlenstoff'],
        ['Masse', '123.8 × 58.6 × 9 mm, ca. 140 g'],
        ['Kühlung', 'passiv über die Rückseite'],
        ['Speicher', '256 GB bis 1 TB'],
        ['Extras', 'RGB-Blitz, Zen- und Privacy-Modus'],
      ],
    },
  },
  pro: {
    name: 'Kiesel 1 Pro',
    pfad: 'kiesel-1-pro/',
    kurz: '13-mini-Grösse mit 3x-Tele',
    farbe: 'Titangrau',
    speicher: [['256 GB', 1500], ['512 GB', 1700], ['1 TB', 1900], ['2 TB', 2300]],
    karte: {
      farbe: 'Himmelblau',
      unter: 'So gross wie das iPhone 13 mini.',
      eckdaten: ['ca. 5.4″ OLED, 1 bis 90 Hz', '0.5x bis 1x plus 3x-Tele mit OIS', 'ca. 3600 mAh, Mini-Vapor-Chamber', '256 GB bis 2 TB'],
    },
    // Modellseite /kiesel-1-pro/ (Artboard „Modellseite Kiesel 1 Pro“, gen2.py Abschnitt 4)
    seite: {
      unterzeile: 'Zwei Kameras. Eine Hand.',
      farbe: 'Himmelblau',
      speicherText: '256 GB bis 2 TB',
      kennzahlen: [
        { zahl: '5.4″', titel: ['OLED-Display'], text: ['LTPO von 1 bis 90 Hz', '1 bis 90 Hz'] },
        { zahl: '3x', titel: ['Tele, echt optisch'], text: ['mit Bildstabilisator'] },
        { zahl: '3600', titel: ['mAh'], text: ['rund 50 % mehr als das 13 mini', '50 % mehr als das 13 mini'] },
        { zahl: '9 mm', titel: ['flach genug'], text: ['für Tele, Akku und MagSafe'] },
      ],
      eckdaten: [
        ['Display', 'ca. 5.4″ OLED, LTPO 1 bis 90 Hz'],
        ['Chip', 'A20 Pro abgespeckt, 1+3 Kerne, max. 4 GHz'],
        ['Kameras', '0.5x bis 1x (50 MP) und 3x-Tele mit OIS'],
        ['Akku', 'ca. 3600 mAh, Silizium-Kohlenstoff'],
        ['Masse', '131.5 × 64.2 × 9 mm, ca. 170 g'],
        ['Kühlung', 'Mini-Vapor-Chamber'],
        ['Speicher', '256 GB bis 2 TB'],
        ['Extras', 'RGB-Blitz, Zen- und Privacy-Modus'],
      ],
    },
  },
};

export const HUELLE_PREIS = 59;

// „ab CHF 1’200.–“: der kleinste Preis eines Modells
export function abPreis(modell) {
  return 'ab ' + chf(Math.min(...MODELLE[modell].speicher.map(([, preis]) => preis)));
}
