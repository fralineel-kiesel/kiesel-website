// Häufige Fragen: die 13 Fragen aus design/generator/gen4.py (Artboard „FAQ“), seit Etappe 8b
// mit Privacy-Modus in zwei Stufen und der neuen Frage zum Notruf (Abweichungen von gen4.py
// stehen in scripts/abweichungen.mjs). Die FAQ-Seite zeigt alle, die Startseite die mit
// startseite: true. Fragen und Antworten stehen in der Textdatei (faqFragen in src/i18n/de.js),
// hier nur Kennung, Thema, Link-Ziel und die Werte, die in die Texte eingesetzt werden.
//
// Zahlen kommen aus den Datendateien (Preis aus preise.js, Werte aus technik.js/geraete.js),
// damit eine Änderung dort auch hier ankommt.
//   id:     Anker auf der FAQ-Seite (faq/#privacy öffnet diese Frage)
//   thema:  Kennung eines der THEMEN (Filter-Chips)
//   link:   Verweis auf eine andere Seite. Kommt link.text in der Antwort vor, wird genau diese
//           Stelle zum Link, sonst steht der Link nach der Antwort.
import { HUELLE_PREIS, PREISE } from './preise.js';
import { FARB_IDS } from './farben.js';
import { GERAETE, zahl, dickePlus } from './geraete.js';
import { WERTE } from './technik.js';
import { chf } from '../lib/format.js';
import { faqFragen as DE } from '../i18n/de.js';

const W = WERTE;

// Kennungen der Themen (Filter-Chips, data-thema), Reihenfolge wie im Artboard.
// Die Namen stehen in der Textdatei (faqThemen in src/i18n/de.js).
export const THEMEN = ['concept', 'phones', 'battery', 'features', 'buying'];

// Reihenfolge, Thema, Startseite und Link-Ziel; Frage, Antwort und Linktext kommen aus T[id]
const FRAGEN = [
  { id: 'kaufen', thema: 'concept', startseite: true },
  { id: 'konzept', thema: 'concept' },
  { id: 'unterschied', thema: 'phones', link: 'vergleichen/?kiesel=pro&gegen=k1' },
  { id: 'dicke', thema: 'phones', startseite: true },
  { id: 'klinke', thema: 'phones' },
  { id: 'wasser', thema: 'phones' },
  { id: 'updates', thema: 'phones' },
  { id: 'akku', thema: 'battery', link: 'akku-rechner/' },
  { id: 'laden', thema: 'battery' },
  { id: 'privacy', thema: 'features', startseite: true, link: 'funktionen/#privacy' },
  { id: 'notruf', thema: 'features', link: 'funktionen/#privacy' },
  { id: 'rgb', thema: 'features', link: 'funktionen/#rgb' },
  { id: 'huelle', thema: 'buying', startseite: true, link: 'zubehoer/huelle/' },
  { id: 'warenkorb', thema: 'buying' },
];

// Werte, die in die Texte eingesetzt werden (Texte mit Werten sind Funktionen: (werte) => …)
const werte = (sprache) => ({
  tele: W.tele,
  groessterSpeicher: PREISE.pro.speicher.at(-1).name,
  dicke: zahl(GERAETE.k1.dicke, undefined, sprache),
  dickePlus: dickePlus('k1'),
  schutz: W.schutz,
  updateJahre: W.updateJahre,
  wattKabel: W.wattKabel,
  wattKabellos: W.wattKabellos,
  huellePreis: chf(HUELLE_PREIS, sprache),
  farben: FARB_IDS.length,
});

// Fragen in einer Sprache: [{ id, thema, startseite?, frage, antwort, link?: { text, pfad } }]
export function faqFuer(T = DE, sprache = 'de') {
  const v = werte(sprache);
  const text = (x) => (typeof x === 'function' ? x(v) : x);
  return FRAGEN.map(({ id, link, ...rest }) => ({
    id, ...rest,
    frage: text(T[id].frage),
    antwort: text(T[id].antwort),
    ...(link ? { link: { text: T[id].link, pfad: link } } : {}),
  }));
}
export const FAQ = faqFuer();

// Knopf unter der Liste: Fragen gehen als Issue ins Repo (öffnet in neuem Tab). Texte: faqSeite.
export const FRAGE_STELLEN_ADRESSE = 'https://github.com/fralineel-kiesel/kiesel-website/issues/new';
