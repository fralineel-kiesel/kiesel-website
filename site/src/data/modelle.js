// Eckdaten der beiden Modelle: Menü, Unterleiste, Modellkarte und Modellseite.
// Hier stehen nur Texte. Die Werte kommen aus geraete.js (Masse, Akku, Display) und
// technik.js (WERTE: RAM, Kamera, Laden …), Preise und Speicherstufen nur aus preise.js.
import { speicherBereich } from './preise.js';
import { GERAETE, masse, gewicht, akku, zoll, zahl, akkuPlus, dickePlus } from './geraete.js';
import { WERTE, technik } from './technik.js';

const W = WERTE;
const g = GERAETE;
const laden = `${W.wattKabel} W mit Kabel, ${W.wattKabellos} W kabellos`;
const extras = `${W.schutz}, RGB-Blitz, Zen- und Privacy-Modus`;
const chip = `A20 Pro abgespeckt, 1+3 Kerne, ${W.ramGb} GB RAM`;

// Kennzahlen der Startseite (stats() in gen2.py)
export const STARTSEITE_KENNZAHLEN = [
  { zahl: String(g.k1.akku), titel: ['mAh im Kiesel 1'], text: ['fast doppelt so viel wie das SE'] },
  { zahl: `${W.tele}x`, titel: ['Tele, echt optisch'], text: ['beim Kiesel 1 Pro'] },
  { zahl: `${zahl(g.k1.dicke)} mm`, titel: ['flach genug'], text: [`${dickePlus('k1')} mm mehr als das SE, für mehr Akku`, 'für mehr Akku'] },
  { zahl: W.hertz.replace(' bis ', '–').replace(' Hz', ''), titel: ['Hertz, die mitdenken', 'Hertz'], text: ['das Display läuft nur so schnell wie nötig', 'nur so schnell wie nötig'] },
];

export const MODELLE = {
  k1: {
    name: 'Kiesel 1',
    pfad: 'kiesel-1/',
    kurz: 'SE-Grösse, Akku für den ganzen Tag',
    farbe: 'sky-blue',            // Farbe im Menü
    // Modellkarte auf der Startseite (Artboard „Startseite Desktop“, model_card() in gen2.py)
    karte: {
      farbe: 'pebble-beige',
      unter: 'So gross wie das iPhone SE von 2016.',
      eckdaten: [`${zoll('k1')} OLED, ${W.hertz}`, `Eine Kamera, 0.5x bis 1x, digital bis ${W.zoomDigital.k1}x`, akku('k1'), speicherBereich('k1')],
    },
    // Modellseite /kiesel-1/ (sinngemäss nach Artboard „Modellseite Kiesel 1 Pro“)
    seite: {
      unterzeile: 'Die Grösse von 2016. Der Akku von heute.',
      farbe: 'pebble-beige',
      speicherText: speicherBereich('k1'),
      // Kennzahlen: Text als [lang, kurz fürs Handy] oder nur ein Text
      kennzahlen: [
        { zahl: `${zahl(g.k1.display)}″`, titel: ['OLED-Display'], text: [`LTPO von ${W.hertz}`, W.hertz] },
        { zahl: String(g.k1.akku), titel: ['mAh'], text: [`${akkuPlus('k1')} % mehr als das SE`] },
        { zahl: `${W.megapixel} MP`, titel: ['eine Kamera', 'Kamera'], text: ['0.5x bis 1x, mit Makro', '0.5x bis 1x, Makro'] },
        { zahl: `${W.ramGb} GB`, titel: ['Arbeitsspeicher'], text: [`${W.wattKabel} W Laden mit Kabel`, `${W.wattKabel} W Laden`] },
      ],
      // „Das Wichtigste auf einen Blick“ (spec_rows in gen2.py)
      eckdaten: [
        ['Display', `${zoll('k1')} OLED, LTPO ${W.hertz}`],
        ['Chip', chip],
        ['Kamera', `0.5x bis 1x (${W.megapixel} MP), Makro, digital bis ${W.zoomDigital.k1}x`],
        ['Akku', `${akku('k1')}, ${laden}`],
        ['Masse', `${masse('k1')}, ${gewicht('k1')}`],
        ['Kühlung', technik('Kühlung', 'k1')],
        ['Speicher', speicherBereich('k1')],
        ['Extras', extras],
      ],
    },
  },
  pro: {
    name: 'Kiesel 1 Pro',
    pfad: 'kiesel-1-pro/',
    kurz: '13-mini-Grösse mit 3x-Tele',
    farbe: 'titanium-gray',
    karte: {
      farbe: 'sky-blue',
      unter: 'So gross wie das iPhone 13 mini.',
      eckdaten: [`${zoll('pro')} OLED, ${W.hertz}`, `0.5x bis 1x plus ${W.tele}x-Tele mit OIS`, `${akku('pro')}, Mini-Vapor-Chamber`, speicherBereich('pro')],
    },
    // Modellseite /kiesel-1-pro/ (Artboard „Modellseite Kiesel 1 Pro“, gen2.py Abschnitt 4)
    seite: {
      unterzeile: 'Zwei Kameras. Eine Hand.',
      farbe: 'sky-blue',
      speicherText: speicherBereich('pro'),
      kennzahlen: [
        { zahl: `${zahl(g.pro.display)}″`, titel: ['OLED-Display'], text: [`LTPO von ${W.hertz}`, W.hertz] },
        { zahl: `${W.tele}x`, titel: ['Tele, echt optisch'], text: [`${W.megapixel} MP, mit Bildstabilisator`] },
        { zahl: String(g.pro.akku), titel: ['mAh'], text: [`${akkuPlus('pro')} % mehr als das 13 mini`] },
        { zahl: `${W.ramGb} GB`, titel: ['Arbeitsspeicher'], text: [`${W.wattKabel} W Laden mit Kabel`, `${W.wattKabel} W Laden`] },
      ],
      eckdaten: [
        ['Display', `${zoll('pro')} OLED, LTPO ${W.hertz}`],
        ['Chip', chip],
        ['Kameras', `0.5x bis 1x und ${W.tele}x-Tele mit OIS, beide ${W.megapixel} MP`],
        ['Akku', `${akku('pro')}, ${laden}`],
        ['Masse', `${masse('pro')}, ${gewicht('pro')}`],
        ['Kühlung', technik('Kühlung', 'pro')],
        ['Speicher', speicherBereich('pro')],
        ['Extras', extras],
      ],
    },
  },
};
