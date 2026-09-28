// Häufige Fragen. Die Startseite zeigt die ersten vier (Artboard „Startseite Desktop“),
// die FAQ-Seite (Etappe 7) später alle. Fragen und Antworten nur hier ändern.
// Die erste Antwort stammt aus design/generator/gen2.py (faq()), die anderen aus den
// Eckdaten in CLAUDE.md.
import { HUELLE_PREIS } from './preise.js';
import { chf } from '../lib/format.js';

export const FAQ = [
  {
    id: 'kaufen',
    frage: 'Kann ich den Kiesel wirklich kaufen?',
    antwort: 'Leider nein. Kiesel ist ein Fan-Konzept. Der Warenkorb funktioniert trotzdem, erst die Kasse verrät am Ende die traurige Wahrheit.',
  },
  {
    id: 'dicke',
    frage: 'Warum ist der Kiesel 9 mm dick?',
    antwort: 'Für den Akku. Der Kiesel 1 ist 1.4 mm dicker als das iPhone SE von 2016 und hat dafür ca. 3000 mAh statt gut 1600. Flacher ginge, aber dann wäre der Abend wieder zu kurz.',
  },
  {
    id: 'privacy',
    frage: 'Was macht der Privacy-Modus genau?',
    antwort: 'Er trennt Kamera, Mikrofon und GPS elektrisch vom Rest des Handys. Ohne Strom kann auch eine gehackte App nichts aufnehmen oder orten. Ein Schalter in der Software reicht dafür nicht, darum passiert es in der Hardware.',
  },
  {
    id: 'huelle',
    frage: 'Passt die Hülle auf beide Modelle?',
    antwort: `Es gibt sie für beide, aber jeweils passgenau: Der Pro ist grösser und hat eine zweite Linse. Beide Hüllen kommen in denselben fünf Farben wie die Handys und kosten ${chf(HUELLE_PREIS)}.`,
  },
];
