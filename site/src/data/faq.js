// Häufige Fragen: die 13 Fragen aus design/generator/gen4.py (Artboard „FAQ“). Die FAQ-Seite
// zeigt alle, die Startseite die mit startseite: true. Fragen und Antworten nur hier ändern.
//
// Zahlen kommen aus den Datendateien (Preis aus preise.js, Werte aus technik.js/geraete.js),
// damit eine Änderung dort auch hier ankommt.
//   id:     Anker auf der FAQ-Seite (faq/#privacy öffnet diese Frage)
//   thema:  eines der THEMEN (Filter-Chips)
//   link:   Verweis auf eine andere Seite. Kommt link.text in der Antwort vor, wird genau diese
//           Stelle zum Link, sonst steht der Link nach der Antwort.
import { HUELLE_PREIS, PREISE } from './preise.js';
import { FARBNAMEN } from './farben.js';
import { GERAETE, zahl, dickePlus } from './geraete.js';
import { WERTE } from './technik.js';
import { chf } from '../lib/format.js';

const W = WERTE;
const ZAHLWORT = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
const wort = (n) => ZAHLWORT[n] ?? String(n);
const groessterSpeicher = PREISE.pro.speicher.at(-1).name;

export const THEMEN = ['Konzept', 'Handys', 'Akku und Laden', 'Funktionen', 'Kaufen'];

export const FAQ = [
  {
    id: 'kaufen', thema: 'Konzept', startseite: true,
    frage: 'Kann ich den Kiesel wirklich kaufen?',
    antwort: 'Leider nein. Kiesel ist ein Fan-Konzept. Der Warenkorb funktioniert trotzdem, erst die Kasse verrät die traurige Wahrheit.',
  },
  {
    id: 'konzept', thema: 'Konzept',
    frage: 'Wie ist die Idee zum Kiesel entstanden?',
    antwort: 'Aus einem Gedankenexperiment: Wie sähe ein Handy in der Grösse vom iPhone SE aus, wenn man es mit heutiger Technik neu baut und alles weglässt, was man im Alltag nicht braucht?',
  },
  {
    id: 'unterschied', thema: 'Handys',
    frage: 'Was ist der Unterschied zwischen Kiesel 1 und Kiesel 1 Pro?',
    antwort: `Der Kiesel 1 ist so gross wie das iPhone SE von 2016 und hat eine Kamera. Der Pro ist so gross wie das iPhone 13 mini, hat zusätzlich eine ${W.tele}x-Tele, mehr Akku, eine Mini-Vapor-Chamber und bis ${groessterSpeicher} Speicher.`,
    link: { text: 'Beide vergleichen', pfad: 'vergleichen/?kiesel=pro&gegen=k1' },
  },
  {
    id: 'dicke', thema: 'Handys', startseite: true,
    frage: `Warum ist der Kiesel ${zahl(GERAETE.k1.dicke)} mm dick?`,
    antwort: `Die zusätzlichen ${dickePlus('k1')} mm gegenüber dem SE gehen fast komplett in den Akku und die MagSafe-Spule. In der Hand fällt das kaum auf, beim Akku macht es viel aus.`,
  },
  {
    id: 'klinke', thema: 'Handys',
    frage: 'Warum gibt es keine Kopfhörerbuchse und keinen SIM-Schlitten?',
    antwort: 'Beides braucht Platz, den der Akku besser nutzen kann. Kopfhörer gehen über USB-C oder Bluetooth, die SIM ist eine eSIM.',
  },
  {
    id: 'wasser', thema: 'Handys',
    frage: 'Ist der Kiesel wasserdicht?',
    antwort: `Beide Modelle sind nach ${W.schutz} gegen Wasser und Staub geschützt.`,
  },
  {
    id: 'updates', thema: 'Handys',
    frage: 'Wie lange bekommt der Kiesel Updates?',
    antwort: `Mindestens ${wort(W.updateJahre)} Jahre System- und Sicherheitsupdates.`,
  },
  {
    id: 'akku', thema: 'Akku und Laden',
    frage: 'Wie lange hält der Akku?',
    antwort: 'Das hängt stark von deinem Alltag ab. Im Akku-Rechner kannst du deinen typischen Tag einstellen und siehst, wie viel am Abend übrig bleibt.',
    link: { text: 'Akku-Rechner', pfad: 'akku-rechner/' },
  },
  {
    id: 'laden', thema: 'Akku und Laden',
    frage: 'Wie schnell lädt der Kiesel?',
    antwort: `Mit Kabel über USB-C mit rund ${W.wattKabel} W, kabellos über MagSafe und Qi mit ${W.wattKabellos} W.`,
  },
  {
    id: 'privacy', thema: 'Funktionen', startseite: true,
    frage: 'Was macht der Privacy-Modus genau?',
    antwort: 'Halte den Action-Button zwei Sekunden. Drei Schalter trennen Kamera, Mikrofon und GPS vom Strom. Solange der Modus aktiv ist, leuchtet der RGB-Punkt orange.',
    link: { text: 'Privacy-Modus ausprobieren', pfad: 'funktionen/#privacy' },
  },
  {
    id: 'rgb', thema: 'Funktionen',
    frage: 'Was bedeuten die Farben des RGB-Lichts?',
    antwort: 'Blau für Anrufe, Violett für Nachrichten, Grün beim Laden, Rot bei tiefem Akku und Orange im Privacy-Modus. Beim Fotografieren leuchtet die LED neutral weiss.',
    link: { text: 'RGB-Licht ausprobieren', pfad: 'funktionen/#rgb' },
  },
  {
    id: 'huelle', thema: 'Kaufen', startseite: true,
    frage: 'Passt die Hülle auf beide Modelle?',
    antwort: `Nein, es gibt je eine eigene Hülle für den Kiesel 1 und den Kiesel 1 Pro. Beide kosten ${chf(HUELLE_PREIS)} und gibt es in allen ${wort(FARBNAMEN.length)} Farben.`,
    link: { text: 'Zur Kiesel-Hülle', pfad: 'zubehoer/huelle/' },
  },
  {
    id: 'warenkorb', thema: 'Kaufen',
    frage: 'Was passiert mit meinem Warenkorb?',
    antwort: 'Er bleibt in deinem Browser gespeichert, auch wenn du die Seite schliesst. Für den Fall, dass Cupertino es sich doch noch anders überlegt.',
  },
];

// Knopf unter der Liste: Fragen gehen als Issue ins Repo (öffnet in neuem Tab)
export const FRAGE_STELLEN = {
  titel: 'Deine Frage ist nicht dabei?',
  text: 'Schreib sie uns, dann kommt sie vielleicht in die nächste Version.',
  knopf: 'Frage auf GitHub stellen',
  adresse: 'https://github.com/fralineel-kiesel/kiesel-website/issues/new',
};
