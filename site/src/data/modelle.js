// Eckdaten der beiden Modelle: Menü, Unterleiste, Modellkarte und Modellseite.
// Die Werte kommen aus geraete.js (Masse, Akku, Display) und technik.js (WERTE: RAM, Kamera,
// Laden …), Preise und Speicherstufen nur aus preise.js. Die Texte stehen in der Textdatei
// (modelle in src/i18n/de.js). modelleFuer(t, sprache) baut alles in einer Sprache (t = texte(sprache)),
// MODELLE und STARTSEITE_KENNZAHLEN sind die deutsche Fassung. Nur im Build gebraucht.
import { speicherBereich } from './preise.js';
import { GERAETE, masse, gewicht, akku, zoll, zahl, akkuPlus, dickePlus } from './geraete.js';
import { WERTE, technik, hertzText } from './technik.js';
import { texte } from '../i18n/index.js';

const W = WERTE;
const g = GERAETE;

// Kennzahlen der Startseite (stats() in gen2.py)
export function startseiteKennzahlen(t = texte(), sprache = 'de') {
  const K = t.modelle.startseite;
  return [
    { zahl: String(g.k1.akku), titel: [K.akku.titel], text: [K.akku.text] },
    { zahl: `${W.tele}x`, titel: [K.tele.titel], text: [K.tele.text] },
    { zahl: `${zahl(g.k1.dicke, undefined, sprache)} mm`, titel: [K.dicke.titel], text: [K.dicke.text(dickePlus('k1')), K.dicke.kurz] },
    { zahl: `${W.hertz[0]}–${W.hertz[1]}`, titel: K.hertz.titel, text: K.hertz.text },
  ];
}

export function modelleFuer(t = texte(), sprache = 'de') {
  const M = t.modelle;
  const G = t.geraete;
  const hertz = hertzText(t.technik);
  const laden = M.laden(W.wattKabel, W.wattKabellos);
  const extras = M.extras(W.schutz);
  const chip = M.chip(W.ramGb);
  const speicher = (id) => speicherBereich(id, t.preise);
  const Z = (x) => zahl(x, undefined, sprache);
  const kennzahlenOled = (id) => ({ zahl: `${Z(g[id].display)}″`, titel: [M.kennzahlen.display], text: [M.kennzahlen.ltpo(hertz), hertz] });
  const kennzahlenRam = { zahl: `${W.ramGb} GB`, titel: [M.kennzahlen.ram], text: [M.kennzahlen.laden(W.wattKabel), M.kennzahlen.ladenKurz(W.wattKabel)] };
  const E = M.eckdaten;
  return {
    k1: {
      name: 'Kiesel 1',
      pfad: 'kiesel-1/',
      kurz: M.k1.kurz,
      farbe: 'sky-blue',            // Farbe im Menü
      // Modellkarte auf der Startseite (Artboard „Startseite Desktop“, model_card() in gen2.py)
      karte: {
        farbe: 'pebble-beige',
        unter: M.k1.karteUnter,
        eckdaten: [M.karte.display(zoll('k1', G, sprache), hertz), M.k1.karteKamera(W.zoomDigital.k1), akku('k1', G), speicher('k1')],
      },
      // Modellseite /kiesel-1/ (sinngemäss nach Artboard „Modellseite Kiesel 1 Pro“)
      seite: {
        unterzeile: M.k1.unterzeile,
        farbe: 'pebble-beige',
        speicherText: speicher('k1'),
        // Kennzahlen: Text als [lang, kurz fürs Handy] oder nur ein Text
        kennzahlen: [
          kennzahlenOled('k1'),
          { zahl: String(g.k1.akku), titel: [M.kennzahlen.mah], text: [M.kennzahlen.mehrAkku(akkuPlus('k1'), 'SE')] },
          { zahl: `${W.megapixel} MP`, titel: M.k1.kennzahlKamera.titel, text: M.k1.kennzahlKamera.text },
          kennzahlenRam,
        ],
        // „Das Wichtigste auf einen Blick“ (spec_rows in gen2.py)
        eckdaten: [
          [E.display, M.eckdatenDisplay(zoll('k1', G, sprache), hertz)],
          [E.chip, chip],
          [E.kamera, M.k1.eckdatenKamera(W.megapixel, W.zoomDigital.k1)],
          [E.akku, `${akku('k1', G)}, ${laden}`],
          [E.masse, `${masse('k1', G, sprache)}, ${gewicht('k1', G)}`],
          [E.kuehlung, technik('kuehlung', 'k1', t.technik)],
          [E.speicher, speicher('k1')],
          [E.extras, extras],
        ],
      },
    },
    pro: {
      name: 'Kiesel 1 Pro',
      pfad: 'kiesel-1-pro/',
      kurz: M.pro.kurz,
      farbe: 'titanium-gray',
      karte: {
        farbe: 'sky-blue',
        unter: M.pro.karteUnter,
        eckdaten: [M.karte.display(zoll('pro', G, sprache), hertz), M.pro.karteKamera(W.tele), M.pro.karteAkku(akku('pro', G)), speicher('pro')],
      },
      // Modellseite /kiesel-1-pro/ (Artboard „Modellseite Kiesel 1 Pro“, gen2.py Abschnitt 4)
      seite: {
        unterzeile: M.pro.unterzeile,
        farbe: 'sky-blue',
        speicherText: speicher('pro'),
        kennzahlen: [
          kennzahlenOled('pro'),
          { zahl: `${W.tele}x`, titel: [M.pro.kennzahlTele.titel], text: [M.pro.kennzahlTele.text(W.megapixel)] },
          { zahl: String(g.pro.akku), titel: [M.kennzahlen.mah], text: [M.kennzahlen.mehrAkku(akkuPlus('pro'), '13 mini')] },
          kennzahlenRam,
        ],
        eckdaten: [
          [E.display, M.eckdatenDisplay(zoll('pro', G, sprache), hertz)],
          [E.chip, chip],
          [E.kameras, M.pro.eckdatenKameras(W.tele, W.megapixel)],
          [E.akku, `${akku('pro', G)}, ${laden}`],
          [E.masse, `${masse('pro', G, sprache)}, ${gewicht('pro', G)}`],
          [E.kuehlung, technik('kuehlung', 'pro', t.technik)],
          [E.speicher, speicher('pro')],
          [E.extras, extras],
        ],
      },
    },
  };
}

export const MODELLE = modelleFuer();
export const STARTSEITE_KENNZAHLEN = startseiteKennzahlen();
