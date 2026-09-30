// Deutsche Texte, Teil „faq“: Häufige Fragen: Themen, Fragen, Seite
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── FAQ: Namen der Themen (Kennungen in data/faq.js THEMEN) ──
export const faqThemen = {
  alle: 'Alle',
  concept: 'Konzept',
  phones: 'Handys',
  battery: 'Akku und Laden',
  features: 'Funktionen',
  buying: 'Kaufen',
};

// ── Zahlwörter („sieben Jahre“, „in allen fünf Farben“) ──
const ZAHLWORT = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
const wort = (n) => ZAHLWORT[n] ?? String(n);

// ── FAQ: 14 Fragen (Reihenfolge, Themen, Links in data/faq.js). Texte mit Werten: (v) => …,
//    v = Werte aus data/faq.js (tele, groessterSpeicher, dicke, dickePlus, schutz, updateJahre,
//    wattKabel, wattKabellos, huellePreis, farben). link = Linktext (steht er in der Antwort, wird
//    genau diese Stelle zum Link). ──
export const faqFragen = {
  kaufen: {
    frage: 'Kann ich den Kiesel wirklich kaufen?',
    antwort: 'Leider nein. Kiesel ist ein Fan-Konzept. Der Warenkorb funktioniert trotzdem, erst die Kasse verrät die traurige Wahrheit.',
  },
  konzept: {
    frage: 'Wie ist die Idee zum Kiesel entstanden?',
    antwort: 'Aus einem Gedankenexperiment: Wie sähe ein Handy in der Grösse vom iPhone SE aus, wenn man es mit heutiger Technik neu baut und alles weglässt, was man im Alltag nicht braucht?',
  },
  unterschied: {
    frage: 'Was ist der Unterschied zwischen Kiesel 1 und Kiesel 1 Pro?',
    antwort: (v) => `Der Kiesel 1 ist so gross wie das iPhone SE von 2016 und hat eine Kamera. Der Pro ist so gross wie das iPhone 13 mini, hat zusätzlich eine ${v.tele}x-Tele, mehr Akku, eine Mini-Vapor-Chamber und bis ${v.groessterSpeicher} Speicher.`,
    link: 'Beide vergleichen',
  },
  dicke: {
    frage: (v) => `Warum ist der Kiesel ${v.dicke} mm dick?`,
    antwort: (v) => `Die zusätzlichen ${v.dickePlus} mm gegenüber dem SE gehen fast komplett in den Akku und die MagSafe-Spule. In der Hand fällt das kaum auf, beim Akku macht es viel aus.`,
  },
  klinke: {
    frage: 'Warum gibt es keine Kopfhörerbuchse und keinen SIM-Schlitten?',
    antwort: 'Beides braucht Platz, den der Akku besser nutzen kann. Kopfhörer gehen über USB-C oder Bluetooth, die SIM ist eine eSIM.',
  },
  wasser: {
    frage: 'Ist der Kiesel wasserdicht?',
    antwort: (v) => `Beide Modelle sind nach ${v.schutz} gegen Wasser und Staub geschützt.`,
  },
  updates: {
    frage: 'Wie lange bekommt der Kiesel Updates?',
    antwort: (v) => `Mindestens ${wort(v.updateJahre)} Jahre System- und Sicherheitsupdates.`,
  },
  akku: {
    frage: 'Wie lange hält der Akku?',
    antwort: 'Das hängt stark von deinem Alltag ab. Im Akku-Rechner kannst du deinen typischen Tag einstellen und siehst, wie viel am Abend übrig bleibt.',
    link: 'Akku-Rechner',
  },
  laden: {
    frage: 'Wie schnell lädt der Kiesel?',
    antwort: (v) => `Mit Kabel über USB-C mit rund ${v.wattKabel} W, kabellos über MagSafe und Qi mit ${v.wattKabellos} W.`,
  },
  privacy: {
    frage: 'Was macht der Privacy-Modus genau?',
    antwort: 'Er hat zwei Stufen, beide in Hardware. Hältst du den Action-Button zwei Sekunden, sind Kamera, Mikrofon und GPS stromlos (Sensoren aus). Hältst du weiter bis vier Sekunden, sind zusätzlich WLAN, Bluetooth, Mobilfunk und NFC stromlos (Funkstille). Der RGB-Punkt leuchtet in Stufe 1 ruhig orange und blinkt in Stufe 2 alle paar Sekunden kurz.',
    link: 'Privacy-Modus ausprobieren',
  },
  notruf: {
    frage: 'Kann ich im Privacy-Modus den Notruf wählen?',
    antwort: 'Ja, in beiden Stufen. Drückst du fünfmal schnell die Seitentaste, sind Mobilfunk, Mikrofon und GPS sofort wieder verbunden. So kannst du 112, 117 oder 144 anrufen, und dein Standort kann mitgeschickt werden. Der Mobilfunk bleibt danach an, bis du den Privacy-Modus beendest, damit dich die Rettung zurückrufen kann.',
    link: 'Notruf ausprobieren',
  },
  rgb: {
    frage: 'Was bedeuten die Farben des RGB-Lichts?',
    antwort: 'Blau für Anrufe, Violett für Nachrichten, Grün beim Laden, Rot bei tiefem Akku und Orange im Privacy-Modus, in der Funkstille mit kurzem Blinken. Beim Fotografieren leuchtet die LED neutral weiss.',
    link: 'RGB-Licht ausprobieren',
  },
  huelle: {
    frage: 'Passt die Hülle auf beide Modelle?',
    antwort: (v) => `Nein, es gibt je eine eigene Hülle für den Kiesel 1 und den Kiesel 1 Pro. Beide kosten ${v.huellePreis} und gibt es in allen ${wort(v.farben)} Farben.`,
    link: 'Zur Kiesel-Hülle',
  },
  warenkorb: {
    frage: 'Was passiert mit meinem Warenkorb?',
    antwort: 'Er bleibt in deinem Browser gespeichert, auch wenn du die Seite schliesst. Für den Fall, dass Cupertino es sich doch noch anders überlegt.',
  },
};

// ── /faq/ (Seite und Filter im Browser) ──
export const faqSeite = {
  titel: 'Häufige Fragen',
  beschreibung: 'Antworten rund um Kiesel 1 und Kiesel 1 Pro: Konzept, Grösse, Akku, Laden, Funktionen und Kaufen. Ein Fan-Konzept.',
  einleitung: 'Alles, was man über den Kiesel wissen will. Und die eine Frage, die alle zuerst stellen.',
  suchen: 'Suchen',
  suchBeispiel: 'z.B. Akku, Hülle, Updates',
  themen: 'Themen',
  nichts: 'Nichts gefunden. Probier ein anderes Wort oder wähl «Alle».',
  anzahl: (n) => (n === 1 ? '1 Frage' : `${n} Fragen`),
  frageTitel: 'Deine Frage ist nicht dabei?',
  frageText: 'Schreib sie uns, dann kommt sie vielleicht in die nächste Version.',
  frageKnopf: 'Frage auf GitHub stellen',
};
