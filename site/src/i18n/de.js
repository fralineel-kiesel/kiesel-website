// Alle sichtbaren Texte von Kiesel 2.0 auf Deutsch (Schweizer Hochdeutsch, „ss“ statt „ß“).
// Einziger Ort für Texte. Etappe 9b legt daneben en.js mit denselben Schlüsseln an.
//
// Aufbau
//   - Ein benannter Export pro Bereich: Gerüst (kopf, footer …), Seite (kaufen, faq …),
//     Datenbestand (technik, faqFragen …) oder Zeichnung (zeichnung). Warum einzeln? Ein
//     Browser-Skript importiert nur seinen Bereich, der Bundler lässt den Rest weg (Tree-Shaking).
//   - Schlüssel auf Deutsch in camelCase, nach Rolle benannt (huelleDazu), nicht nach Wortlaut.
//   - Keine Zahlen: Texte mit Werten sind Funktionen und bekommen die Werte fertig formatiert
//     (lib/format.js). Preise stehen nur in data/preise.js, Gerätewerte nur in data/geraete.js.
//   - Plural und Grammatik stecken ebenfalls in Funktionen, weil jede Sprache das anders löst.

// ── Sprache der Seite (<html lang>, Link-Vorschau) ──
export const sprache = {
  html: 'de-CH',
  og: 'de_CH',
};

// ── Titel und Beschreibung (BaseLayout: <title>, <meta description>, og:*) ──
export const meta = {
  marke: 'Kiesel',
  startTitel: 'Kiesel · Passt in jede Hand.',
  titel: (seite) => `${seite} · Kiesel`,
  beschreibung: 'Kiesel 1 und Kiesel 1 Pro: zwei kompakte Handys mit Akku bis in die Nacht. Ein Fan-Konzept.',
};

// ── Gerüst: Kopfzeile, Menüs, Unterleiste, Footer ──
export const geruest = {
  zumInhalt: 'Zum Inhalt',
  zurStartseite: 'Kiesel, zur Startseite',
  wortmarke: 'kiesel',
  hauptnavigation: 'Hauptnavigation',
  kaufen: 'Kaufen',
  kaufenAb: (preis) => `Kaufen ${preis}`,
  handys: 'Handys',
  mehrErfahren: 'Mehr erfahren',
  menue: 'Menü',
  menueOeffnen: 'Menü öffnen',
  menueSchliessen: 'Menü schliessen',
  warenkorb: 'Warenkorb',
  unterleiste: { uebersicht: 'Übersicht', technik: 'Technische Daten', vergleichen: 'Vergleichen' },
  footerSatz: 'Zwei kompakte Handys, die es nur als Idee gibt.',
  hinweisKonzept: 'Kiesel 1 und Kiesel 1 Pro sind Fan-Konzepte, keine echten Produkte. Preise und Werte sind Schätzungen.',
  hinweisMarke: 'iPhone ist eine Marke von Apple Inc.',
  thema: { legende: 'Thema', auto: 'Auto', light: 'Hell', dark: 'Dunkel' },
};

// ── Kleine Bausteine (Standard-Beschriftungen) ──
export const bausteine = {
  zoomstufe: 'Zoomstufe',
  fach: '-fach',           // nur für Screenreader: „3-fach“ statt „3x“
  modell: 'Modell',
  neuerTab: ' (öffnet in neuem Tab)', // nur für Screenreader, direkt nach dem Linktext
};

// ── Zähler am Warenkorb-Knopf (WarenkorbKnopf.astro, auch im Browser) ──
export const warenkorbKnopf = {
  leer: 'Warenkorb, leer',
  artikel: (n) => `Warenkorb, ${n} Artikel`,
};

// ── Menüpunkte (data/navigation.js: Kennung → Name) ──
export const navigation = {
  handys: 'Handys',
  funktionen: 'Funktionen',
  zubehoer: 'Zubehör',
  vergleichen: 'Vergleichen',
  faq: 'FAQ',
  technik: 'Technische Daten',
  akkuRechner: 'Akku-Rechner',
  farben: 'Farben',
  huelle: 'Kiesel-Hülle',
  funktionenAusprobieren: 'Funktionen ausprobieren',
  kaufen: 'Kaufen',
  warenkorb: 'Warenkorb',
  entdecken: 'Entdecken',
  shop: 'Shop',
  hilfe: 'Hilfe',
  konzept: 'Über das Konzept',
  mehrZuDenHandys: 'Mehr zu den Handys',
  beliebt: 'Beliebt',
};

// ── Farben: Kennung (data/farben.js) → Name ──
export const farben = {
  'sky-blue': 'Himmelblau',
  'matte-black': 'Mattschwarz',
  'titanium-gray': 'Titangrau',
  'matte-white': 'Mattweiss',
  'pebble-beige': 'Kieselbeige',
};

// ── Warenkorb: Schublade und /warenkorb/ (WarenkorbInhalt.astro, auch im Browser) ──
export const warenkorb = {
  titel: 'Warenkorb',
  schliessen: 'Warenkorb schliessen',
  liste: 'Artikel im Warenkorb',
  leerTitel: 'Dein Warenkorb ist noch leer.',
  leerText: 'Zwei kleine Handys warten darauf, zusammengestellt zu werden.',
  zusammenstellen: 'Kiesel zusammenstellen',
  vorschlagTitel: 'Passende Hülle dazu?',
  // Satz mit dem Modellnamen als <span> dazwischen: vor + Modell + nach
  vorschlagVor: 'Kiesel-Hülle für ',
  vorschlagNach: (preis) => `, ${preis}. Hinten milchig, am Rand griffig.`,
  huellenFarbe: 'Farbe der Hülle',
  dazulegen: 'Dazulegen',
  weiter: 'Weiter einkaufen',
  zwischensumme: 'Zwischensumme',
  versand: 'Versand',
  kostenlos: 'kostenlos',
  mwst: (prozent) => `davon MwSt. ${prozent}`,
  total: 'Total',
  zurKasse: 'Zur Kasse',
  einsWeniger: 'Eins weniger',
  einsMehr: 'Eins mehr',
  entfernen: 'Entfernen',
  anzahl: (wer) => `Anzahl: ${wer}`,
  stueckPreis: (n, preis) => `${n} × ${preis}`,
  huelleFuer: (modell, farbe) => `Kiesel-Hülle für ${modell} in ${farbe}`,
  huelleDrin: (modell, farbe) => `Kiesel-Hülle für ${modell} in ${farbe} liegt im Warenkorb.`,
  huelleVoll: (modell, farbe, max) => `Von der Kiesel-Hülle für ${modell} in ${farbe} liegen schon ${max} im Warenkorb, mehr geht nicht.`,
  nichtMehr: (max) => `Mehr als ${max} Stück gehen nicht.`,
  nichtWeniger: 'Weniger als 1 geht nicht. Zum Wegnehmen „Entfernen“ wählen.',
  neueAnzahl: (name, n, total) => `${name}: ${n} Stück. Total ${total}.`,
  entfernt: (name) => `${name} entfernt.`,
  imWarenkorb: 'Im Warenkorb ✓',
};

// ── Kasse (KasseDialog.astro, auch im Browser) ──
export const kasse = {
  kicker: 'Kasse',
  titel: 'Kiesel gibt es nur in unseren Köpfen.',
  bezahlen: 'Bezahlen kannst du darum nichts.',
  // je nachdem, wo der Warenkorb gespeichert ist (speicherOrt() in scripts/warenkorb.js)
  speicher: {
    dauerhaft: 'Dein Warenkorb bleibt aber gespeichert, falls Cupertino es sich doch noch anders überlegt.',
    sitzung: 'Dein Warenkorb bleibt aber da, solange dieser Tab offen ist, falls Cupertino es sich doch noch anders überlegt.',
    seite: 'Dein Warenkorb bleibt aber da, bis du diese Seite verlässt, falls Cupertino es sich doch noch anders überlegt.',
  },
  bestellung: 'Deine Bestellung',
  weitertraeumen: 'Weiterträumen',
  leeren: 'Warenkorb leeren',
};

// ── Warenkorb: Name und Beschreibung eines Artikels (scripts/warenkorb.js, artikelInfo) ──
export const warenkorbArtikel = {
  huelle: 'Kiesel-Hülle',
  huelleDetails: (modell, farbe) => `für ${modell}, ${farbe}`,
  // gravur schon mit geschützten Leerzeichen; davor ebenfalls eines, damit „Gravur «…»“ zusammenbleibt
  handyDetails: (farbe, speicher, gravur) => `${farbe}, ${speicher}` + (gravur ? `, Gravur «${gravur}»` : ''),
};

// ── FAQ: Namen der Themen (Kennungen in data/faq.js THEMEN) ──
export const faqThemen = {
  alle: 'Alle',
  concept: 'Konzept',
  phones: 'Handys',
  battery: 'Akku und Laden',
  features: 'Funktionen',
  buying: 'Kaufen',
};

// ── Die acht versteckten Details im Alpenpanorama (Kennungen in kiesel-draw/ausschnitt.js) ──
export const panoramaDetails = {
  'summit-cross': 'Gipfelkreuz',
  'rope-team': 'Seilschaft auf dem Grat',
  ibex: 'Steinbock',
  'mountain-hut': 'SAC-Hütte mit Fahne',
  gondola: 'Gondelbahn',
  paraglider: 'Gleitschirm',
  sailboat: 'Segelboot',
  village: 'Dorf mit Kirche',
};

// ── Vorgaben der Blume (Spielwiese, Kennungen in kiesel-draw/scene.js BLUME_FOKUS) ──
export const blumeFokus = {
  tele: 'Blume (3x Tele)',
  bee: 'Biene',
  macro: 'Makro (alles nah)',
  all: 'Alles scharf',
};

// ── 404 ──
export const fehler404 = {
  titel: 'Seite nicht gefunden',
  beschreibung: 'Diese Seite gibt es nicht (mehr). Von hier geht es zurück zu Kiesel 1 und Kiesel 1 Pro.',
  ueberschrift: 'Dieser Kiesel ist weggerollt.',
  text: 'Die Seite gibt es nicht (mehr). Vielleicht hilft einer dieser Wege weiter.',
  zurStartseite: 'Zur Startseite',
  proAnsehen: 'Kiesel 1 Pro ansehen',
};

// ── /warenkorb/ ──
export const warenkorbSeite = {
  titel: 'Warenkorb',
  beschreibung: 'Deine Auswahl, bereit für die Kasse, die leider nur ein Konzept ist.',
  einleitung: 'Deine Auswahl, bereit für die Kasse. Die ist leider nur ein Konzept.',
};

// ── Preise: Beschriftungen um die Zahlen herum (data/preise.js) ──
export const preise = {
  ab: (preis) => `ab ${preis}`,
  bereich: (von, bis) => `${von} bis ${bis}`,
  unterzeile: { k1: 'SE-Grösse', pro: '13-mini-Grösse, 3x-Tele' },
};

// ── Gravur: Meldungen der Prüfung (lib/gravur.js, auch im Browser) ──
export const gravur = {
  erlaubt: "Buchstaben, Zahlen, Leerzeichen und . , ' ’ & ! ? + -",
  tabulator: 'Tabulator',
  sonderLeerzeichen: 'Sonder-Leerzeichen',
  zeichen: (z) => `«${z}»`,
  nichtErlaubt: (liste, anzahl) => `${liste} ${anzahl === 1 ? 'geht' : 'gehen'} nicht auf die Gravur. Erlaubt sind ${gravur.erlaubt}`,
  zuLang: (max, zuviel) => `Höchstens ${max} Zeichen, das ${zuviel === 1 ? 'ist 1' : `sind ${zuviel}`} zu viel.`,
};

// ── /kaufen/ (Seite und Browser-Skript) ──
export const kaufen = {
  seitenTitel: 'Kaufen',
  beschreibung: 'Kiesel 1 oder Kiesel 1 Pro zusammenstellen: Farbe, Speicher, Hülle und Gravur. Ein Fan-Konzept.',
  titel: 'Kiesel kaufen',
  lieferumfang: 'Lieferumfang: dein Kiesel und ein USB-C-Kabel.',
  modell: 'Modell',
  farbe: 'Farbe',
  speicher: 'Speicher',
  huelle: 'Kiesel-Hülle',
  huelleDazu: (preis) => `Hülle für ${preis} dazu`,
  huellenFarbe: 'Farbe der Hülle',
  gravurTitel: 'Gravur, kostenlos',
  gravurVh: 'Gravur. ',   // nur für Screenreader, vor dem Hinweis
  gravurHinweis: (max) => `Bis ${max} Zeichen, erscheint auf der Rückseite unter dem Kiesel.`,
  gravurBeispiel: 'z.B. Linos Kiesel',
  zeichen: (n, max) => `${n} von ${max} Zeichen`,
  inWarenkorb: 'In den Warenkorb',
  // Bildbeschreibung des Handys auf der Bühne
  bild: ({ name, farbe, huelle, gravur }) => `${name} in ${farbe}` + (huelle ? ` mit Hülle in ${huelle}` : '') + ', Rückseite' + (gravur ? `, Gravur «${gravur}»` : ''),
  zusammenfassung: ({ name, farbe, speicher, huelle, gravur }) => [name, farbe, speicher].concat(huelle ? ['mit Hülle'] : []).concat(gravur ? ['mit Gravur'] : []).join(', '),
  speicherNurBeim: (wunsch, modell, jetzt) => `${wunsch} gibt es nur beim ${modell}, darum jetzt ${jetzt}.`,
  speicherWieder: (stufe) => `Wieder ${stufe}, wie vorher gewählt.`,
  gravurPasstNicht: (fehler) => `Die Gravur passt noch nicht: ${fehler}`,
  schonVoll: (max) => `Von diesem Kiesel liegen schon ${max} im Warenkorb, mehr geht nicht.`,
};

// ── Technische Daten (data/technik.js: Tabelle wie SPEC in gen4.py) ──
export const technik = {
  hertz: (von, bis) => `${von} bis ${bis} Hz`,
  gruppen: {
    design: 'Design und Masse', display: 'Display', chip: 'Chip und Speicher', kameras: 'Kameras', video: 'Video',
    akku: 'Akku und Laden', verbindungen: 'Verbindungen', software: 'Software und Funktionen', preis: 'Preis',
  },
  merkmale: {
    masse: 'Masse', gewicht: 'Gewicht', rahmen: 'Rahmen', farben: 'Farben', wasser: 'Wasser und Staub',
    groesse: 'Grösse', bildrate: 'Bildrate', entsperren: 'Entsperren',
    chip: 'Chip', cpu: 'CPU', gpu: 'GPU', ram: 'Arbeitsspeicher', speicher: 'Speicher', kuehlung: 'Kühlung',
    hauptkamera: 'Hauptkamera', tele: 'Tele', zoom: 'Zoom', nah: 'Nahaufnahmen', blitz: 'Blitz',
    maximal: 'Maximal', zeitlupe: 'Zeitlupe',
    akku: 'Akku', kabel: 'Mit Kabel', kabellos: 'Kabellos',
    anschluss: 'Anschluss', sim: 'SIM', mobilfunk: 'Mobilfunk',
    system: 'System', updates: 'Updates', tasten: 'Tasten', extras: 'Extras',
    ab: 'Ab', bis: 'Bis',
  },
  werte: {
    rahmen: 'Titan, matt',
    display: (zoll) => `${zoll} OLED, randlos`,
    bildrate: (hertz) => `LTPO, ${hertz}`,
    entsperren: 'Face ID in der Dynamic Island',
    chip: 'A20 Pro abgespeckt, 2 nm',
    cpu: '1 Super-Kern + 3 Effizienz-Kerne, max. 4 GHz',
    gpu: 'ca. 4 Kerne',
    ram: (gb) => `${gb} GB RAM`,
    kuehlung: { k1: 'passiv über die Rückseite', pro: 'Mini-Vapor-Chamber plus Rückseite' },
    hauptkamera: (mp) => `${mp} MP, variable Linse 0.5x bis 1x (ca. 13 bis 26 mm)`,
    keine: '–',
    tele: (mp, x, mm) => `${mp} MP, ${x}x (ca. ${mm} mm), optischer Bildstabilisator`,
    zoomK1: (digital) => `digital bis ${digital}x`,
    zoomPro: (tele, digital) => `optisch ${tele}x, digital bis ${digital}x`,
    nahK1: 'Makro über 0.5x',
    nahPro: (cm) => `Makro über 0.5x, Tele-Nahfokus ab ca. ${cm} cm`,
    blitz: 'RGB-LED mit Benachrichtigungen',
    videoMaximal: '4K mit 120 fps',
    zeitlupe: '2K mit 240 fps',
    akku: (akku) => `${akku}, Silizium-Kohlenstoff`,
    kabel: (watt) => `ca. ${watt} W über USB-C`,
    kabellos: (watt) => `${watt} W über MagSafe und Qi`,
    anschluss: 'USB-C',
    sim: 'nur eSIM',
    mobilfunk: '4G als Standard, 5G nur bei hoher Datenlast',
    system: (system) => `${system} mit schlankem Look`,
    updates: (jahre) => `mindestens ${jahre} Jahre System- und Sicherheitsupdates`,
    tasten: 'Action-Button, Kamera-Knopf, Lautstärke, Seitentaste',
    extras: 'Zen-Modus, Privacy-Modus mit Hardware-Trennung in zwei Stufen (Sensoren, Funkstille)',
    preisStufe: (preis, stufe) => `${preis} (${stufe})`,
  },
  // Vier Kennzahlen oben auf der Technik-Seite
  kennzahlen: {
    ram: { titel: 'Arbeitsspeicher', text: 'in beiden Modellen' },
    kamera: { titel: 'bei jeder Kamera', text: 'auch beim Tele des Pro' },
    laden: { titel: 'mit Kabel', text: (kabellos) => `${kabellos} W kabellos über MagSafe` },
    jahre: (n) => `${n} Jahre`,
    updates: { titel: 'Updates', text: 'mindestens, für System und Sicherheit' },
  },
};

// ── Körperliche Werte (data/geraete.js, auch im Browser): „ca. “ vor Schätzungen ──
export const geraete = {
  ca: 'ca. ',
};

// ── Modelle: Menü, Modellkarten, Modellseiten (data/modelle.js) ──
export const modelle = {
  laden: (kabel, kabellos) => `${kabel} W mit Kabel, ${kabellos} W kabellos`,
  extras: (schutz) => `${schutz}, RGB-Blitz, Zen- und Privacy-Modus`,
  chip: (ram) => `A20 Pro abgespeckt, 1+3 Kerne, ${ram} GB RAM`,
  karte: { display: (zoll, hertz) => `${zoll} OLED, ${hertz}` },
  eckdatenDisplay: (zoll, hertz) => `${zoll} OLED, LTPO ${hertz}`,
  eckdaten: { display: 'Display', chip: 'Chip', kamera: 'Kamera', kameras: 'Kameras', akku: 'Akku', masse: 'Masse', kuehlung: 'Kühlung', speicher: 'Speicher', extras: 'Extras' },
  kennzahlen: {
    display: 'OLED-Display',
    ltpo: (hertz) => `LTPO von ${hertz}`,
    mah: 'mAh',
    mehrAkku: (prozent, vorbild) => `${prozent} % mehr als das ${vorbild}`,
    ram: 'Arbeitsspeicher',
    laden: (watt) => `${watt} W Laden mit Kabel`,
    ladenKurz: (watt) => `${watt} W Laden`,
  },
  k1: {
    kurz: 'SE-Grösse, Akku für den ganzen Tag',
    karteUnter: 'So gross wie das iPhone SE von 2016.',
    karteKamera: (digital) => `Eine Kamera, 0.5x bis 1x, digital bis ${digital}x`,
    unterzeile: 'Die Grösse von 2016. Der Akku von heute.',
    kennzahlKamera: { titel: ['eine Kamera', 'Kamera'], text: ['0.5x bis 1x, mit Makro', '0.5x bis 1x, Makro'] },
    eckdatenKamera: (mp, digital) => `0.5x bis 1x (${mp} MP), Makro, digital bis ${digital}x`,
  },
  pro: {
    kurz: '13-mini-Grösse mit 3x-Tele',
    karteUnter: 'So gross wie das iPhone 13 mini.',
    karteKamera: (tele) => `0.5x bis 1x plus ${tele}x-Tele mit OIS`,
    karteAkku: (akku) => `${akku}, Mini-Vapor-Chamber`,
    unterzeile: 'Zwei Kameras. Eine Hand.',
    kennzahlTele: { titel: 'Tele, echt optisch', text: (mp) => `${mp} MP, mit Bildstabilisator` },
    eckdatenKameras: (tele, mp) => `0.5x bis 1x und ${tele}x-Tele mit OIS, beide ${mp} MP`,
  },
  // Kennzahlen der Startseite
  startseite: {
    akku: { titel: 'mAh im Kiesel 1', text: 'fast doppelt so viel wie das SE' },
    tele: { titel: 'Tele, echt optisch', text: 'beim Kiesel 1 Pro' },
    dicke: { titel: 'flach genug', text: (mm) => `${mm} mm mehr als das SE, für mehr Akku`, kurz: 'für mehr Akku' },
    hertz: { titel: ['Hertz, die mitdenken', 'Hertz'], text: ['das Display läuft nur so schnell wie nötig', 'nur so schnell wie nötig'] },
  },
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

// ── Startseite ──
export const startseite = {
  titel: 'Passt in jede Hand.',
  einleitung: 'Kiesel 1 und Kiesel 1 Pro: zwei kompakte Handys, gebaut um einen Akku, der bis in die Nacht hält.',
  einleitungKurz: 'Kiesel 1 und Kiesel 1 Pro: zwei kompakte Handys mit Akku bis in die Nacht.',
  entdecken: (name) => `${name} entdecken`,
  modelleTitel: 'Welcher Kiesel passt zu dir?',
  modelleText: 'Beide im echten Massstab zueinander. Gleiche Farben, gleicher Chip. Der Pro hat mehr Fläche, mehr Akku und eine Tele-Kamera.',
  kennzahlen: 'Kennzahlen',
  funktionenTitel: 'Kleine Ideen, grosse Wirkung.',
  fragenTitel: 'Häufige Fragen',
  karte: {
    bild: (name, farbe) => `${name} in ${farbe}, Vorderseite`,
    ueber: (name) => ` über den ${name}`, // nur für Screenreader, nach „Mehr erfahren“
  },
  zoom: {
    titel: 'Zoom, der nicht aufgibt.',
    text: 'Der Pro wechselt bei 3x auf eine echte Tele-Linse. Selbst bei 10x siehst du noch das Gipfelkreuz. Im Panorama sind acht Details versteckt: Such sie auf der Funktionen-Seite.',
    textKurz: 'Bei 3x wechselt der Pro auf die Tele-Linse. Acht versteckte Details im Panorama findest du auf der Funktionen-Seite.',
    knopf: 'Zoom ausprobieren',
    leiste: 'Zoomstufe im Beispielbild',
  },
  kacheln: {
    rgb: { titel: 'RGB-Licht', text: 'Der Blitz neben der Kamera leuchtet farbig bei Anrufen, Nachrichten und beim Laden. Das Display bleibt aus.' },
    zen: { titel: 'Zen-Modus', text: 'Ein kurzer Druck auf den Action-Button, und das Handy ist still. Nochmal drücken, und alles ist wieder da.' },
    privacy: { titel: 'Privacy-Modus', text: 'Zwei Stufen in Hardware: erst Kamera, Mikrofon und GPS, dann auch WLAN, Bluetooth, Mobilfunk und NFC. Ohne Strom kann auch eine gehackte App nichts aufnehmen oder senden.' },
    zenAn: 'Zen an',
    privacyZeilen: [['Sensoren', 'Stufe 1'], ['Funk', 'Stufe 2']],
    getrennt: 'getrennt',
    ausprobieren: 'Ausprobieren',
  },
  huelle: {
    bild: (handy, farbe, huelle) => `${handy} in ${farbe} mit der Kiesel-Hülle in ${huelle}, Rückseite`,
    titel: 'Die Kiesel-Hülle',
    text: 'Hinten milchig, damit Farbe und Kiesel durchschimmern. Am Rand fest und griffig. In denselben fünf Farben wie die Handys, für beide Modelle.',
    zumZubehoer: 'Zum Zubehör',
  },
};

// ── Modellseiten /kiesel-1/ und /kiesel-1-pro/ ──
export const modellseite = {
  beschreibung: {
    k1: (akku) => `Kiesel 1: so gross wie das iPhone SE von 2016, mit ${akku} für den ganzen Tag. Ein Fan-Konzept.`,
    pro: (tele, akku) => `Kiesel 1 Pro: so gross wie das iPhone 13 mini, mit echtem ${tele}x-Tele und ${akku}. Ein Fan-Konzept.`,
  },
  bildHinten: (name, farbe) => `${name}, Rückseite in ${farbe}`,
  bildVorne: (name, farbe) => `${name}, Vorderseite in ${farbe}`,
  bildFarbe: (name, farbe) => `${name} in ${farbe}, Rückseite`,
  // „ab CHF 1’200.– oder <a>in fünf Farben ansehen</a>“
  preisOder: (preis) => `${preis} oder `,
  farbenAnsehen: 'in fünf Farben ansehen',
  kamera: {
    pro: {
      titel: (tele) => `${tele}x Tele. Echt optisch.`,
      text: (k1Max, tele) => `Links der Kiesel 1 bei ${k1Max}x, rein digital. Rechts der Pro, der bei ${tele}x auf die Tele-Linse wechselt und bei ${k1Max}x noch aus einem scharfen Bild schneidet. Zieh den Regler und schau selbst.`,
    },
    k1: {
      titel: 'Eine Kamera. Alles drin.',
      text: (mp, max) => `Die variable Linse fährt stufenlos von 0.5x bis 1x, jeweils mit vollen ${mp} MP. Darüber zoomt der Kiesel 1 digital bis ${max}x, dann wird es weicher. Wer echtes Tele will, nimmt den Pro.`,
    },
  },
  makro: {
    titel: 'Ganz nah dran.',
    pro: (cm) => `Zwei Wege zur Nahaufnahme: Makro mit Ultraweit aus wenigen Zentimetern, oder die Tele-Linse, die schon ab rund ${cm} cm scharf stellt. Wechsle die Linse und schau auf den Hintergrund. Tipp aufs Bild, um den Fokus zu verschieben.`,
    k1: 'Die Hauptkamera kann Makro: Blüte, Biene und Tautropfen ganz aus der Nähe. Tipp aufs Bild, um den Fokus zu verschieben.',
  },
  akkuVergleich: 'Akku im Vergleich',
  farbenTitel: 'Fünf Farben.',
  fuenfFarben: 'Die fünf Farben',
  eckdatenTitel: 'Das Wichtigste auf einen Blick',
  alleDaten: 'Alle technischen Daten',
  kaufen: (name) => `${name} kaufen`,
  kaufbox: (abPreis, speicher) => `${abPreis} in fünf Farben, ${speicher}`,
  // Akku-Fazit
  fazitTitel: ['Mehr Akku.', 'Gleiche Hand.'],   // zwei Zeilen
  rechnen: 'Rechne deinen Tag durch',
  wasSteckt: (name) => `Was im ${name} steckt`,
  mah: (ca, wert) => `${ca}${wert} mAh`,
};

// ── Akku: Story und Fazit der Modellseiten, Erklärtexte des Akku-Rechners (data/akku.js) ──
export const akku = {
  story: {
    original: { titel: '2016: das Original', text: (mah) => `Das iPhone SE hatte ${mah} mAh. Der Akku teilte sich den Platz mit Kopfhörerbuchse, SIM-Schlitten und Home-Button.` },
    klinke: { titel: 'Klinke raus', text: 'Die Buchse unten links fällt weg, samt Elektronik dahinter. Wer Kabel will, nimmt USB-C.', plus: '+ Platz unten' },
    sim: { titel: 'SIM-Schlitten raus', text: 'Nur noch eSIM. Kein Schlitten, keine Feder, kein Auswurfloch an der Seite.', plus: '+ Platz an der Seite' },
    home: { titel: 'Home-Button raus', text: 'Face ID übernimmt. Die Mechanik unten verschwindet, das Display darf bis an den Rand.', plus: '+ Platz unten' },
    waechst: {
      titel: 'Der Akku wächst',
      k1: (mm) => `Die Platine wird kompakter, Motor und Lautsprecher rutschen nach unten. Dazu ${mm} mm mehr Dicke und Zellen aus Silizium-Kohlenstoff.`,
      pro: (mm) => `Das Gehäuse wächst auf die Grösse des 13 mini, die Platine wird kompakter. Dazu ${mm} mm mehr Dicke als das SE und Zellen aus Silizium-Kohlenstoff.`,
      plus: (mah) => `ca. ${mah} mAh`,
    },
    titel: ['Weniger drin.', 'Mehr Akku.'],   // zwei Zeilen
    einleitung: {
      k1: (seMah, name) => `Das SE von 2016 hatte ${seMah} mAh. Der ${name} hat dieselbe Grundfläche, aber fast doppelt so viel.`,
      pro: (seMah, name) => `Das SE von 2016 hatte ${seMah} mAh. Der ${name} hat etwas mehr Fläche und mehr als doppelt so viel.`,
    },
    scrollWeiter: 'Scroll weiter und schau, woher der Platz kommt.',
    nummer: (nr, alle) => `${nr}/${alle}`,
    // „Dicke <span>9</span> mm · grobe Schätzung“
    dickeVor: 'Dicke ',
    dickeNach: ' mm · grobe Schätzung',
    bild: (se, seMah, name, mah) => `Innenleben im selben Massstab: links das ${se} mit ${seMah} mAh, rechts der ${name} mit ca. ${mah} mAh. Klinke, SIM-Schlitten und Home-Button fallen weg, der Akku wird grösser.`,
    nebeneinander: {
      k1: { titel: 'Nebeneinander', text: 'Links das SE von 2016, rechts der Kiesel 1, im selben Massstab. Gleiche Grundfläche, fast doppelt so viel Akku.' },
      pro: { titel: 'Nebeneinander', text: 'Links das SE von 2016, rechts der Kiesel 1 Pro, im selben Massstab. Etwas grösser, mehr als doppelt so viel Akku.' },
    },
  },
  fazit: {
    k1: (mm, mah) => `Kein Klinkenstecker, kein SIM-Schlitten, kein Home-Button. Dazu eine Zelle aus Silizium-Kohlenstoff und ${mm} mm mehr Dicke. So passen rund ${mah} mAh in die Grundfläche des SE.`,
    pro: (mm, mah) => `Kein SIM-Schlitten, eine Zelle aus Silizium-Kohlenstoff und ${mm} mm mehr Dicke. So passen rund ${mah} mAh in die Grundfläche des 13 mini.`,
  },
  rechner: {
    verbrauch: (v) => `Verbrauch pro Stunde beim Kiesel 1: Surfen ${v.surf}, Video ${v.video}, Musik ${v.music}, Kamera und Navigation ${v.cam}, Spielen ${v.game}, Standby ${v.standby}. Die Stunden verteilen sich gleichmässig über den Tag.`,
    pro: (v) => `Der Pro hat ${v.mehr} mehr Akku. Sein grösseres Display kostet etwas, dafür arbeitet der Chip dank Vapor Chamber bei Kamera und Spielen kühler und effizienter. Unterm Strich braucht er ${v.surf} weniger pro Stunde, bei Kamera ${v.cam} und bei Spielen ${v.game} weniger.`,
    vorsprung: 'Je mehr du das Handy nutzt, desto grösser wird der Vorsprung des Pro. An einem ruhigen Tag liegen beide nah beieinander, an einem langen Ferientag zählt jedes Prozent.',
    se: (weniger, faktor) => `Das SE von 2016 dient als Vergleich. Es hat rund ${weniger} weniger Akku als der Kiesel 1, das Modell rechnet es deshalb mit ${faktor}-fachem Verbrauch.`,
  },
};

// ── /akku-rechner/ (Seite und Rechnung lib/akku-rechner.js, auch im Browser) ──
export const akkuRechner = {
  titel: 'Akku-Rechner',
  beschreibung: 'Wie viel Akku bleibt am Abend? Stell deinen typischen Tag ein und vergleiche Kiesel 1, Kiesel 1 Pro und das iPhone SE von 2016. Ein Fan-Konzept.',
  einleitung: 'Stell deinen typischen Tag ein. Der Rechner startet um 07:00 mit 100 % und rechnet bis 23:00. Die restliche Zeit liegt das Handy im Standby.',
  typischerTag: 'Typischer Tag',
  tage: { quiet: 'Ruhiger Tag', normal: 'Normal', busy: 'Viel unterwegs', holiday: 'Ferientag' },
  regler: { surf: 'Surfen und Social Media', video: 'Video', music: 'Musik und Podcasts', cam: 'Kamera und Navigation', game: 'Spielen' },
  stundenVorlesen: (stunden) => `${stunden} Stunden`,   // aria-valuetext der Regler: „3.0 Stunden“
  umTitel: (uhr) => `Um ${uhr}`,
  verlauf: 'Akkustand über den Tag',
  erklaerungen: 'Erklärungen zum Rechner',
  soWird: 'So wird gerechnet',
  gutZuWissen: 'Gut zu wissen',
  // Ergebnis (rechne())
  zuViel: (summe, von, bis, stunden) => `Zusammen ${summe} Stunden aktiv. Ein Tag von ${von} bis ${bis} hat nur ${stunden}, stell einen Regler tiefer.`,
  keineBerechnung: 'Keine Berechnung möglich',
  leerUm: (uhr) => `leer um ${uhr}`,
  reicht: (tage, einTag) => `Reicht bei diesem Alltag für ca. ${einTag ? '1 Tag' : `${tage} Tage`}`,
  schlapp: (name, uhr, proUhr, proRest) => `Der ${name} macht um ${uhr} schlapp, der Pro ${proUhr ? `um ${proUhr}` : `hat noch ${proRest}`}.`,
  mehrUebrig: (punkte) => `Der Pro hat ${punkte} Prozentpunkte mehr übrig.`,
  label: (uhr, geraete) => `Um ${uhr}: ${geraete.map(([name, text]) => `${name} ${text}`).join(', ')}`,
};

// ── Kamera-Demos: Zoom-Bild, Skala, Linsen-Leiste, Vergleich, versteckte Details, Makro
//    (data/kamera.js, lib/kamera.js, scripts/kamera-zoom.js, auch im Browser) ──
export const kamera = {
  zoom: 'Zoom',
  zoomstufen: 'Zoomstufen',
  welcheKamera: 'Welche Kamera arbeitet',
  stufe: (z) => `${z}x`,
  stufeTele: (z) => `${z}x · Tele`,
  // Linsen-Label auf dem Bild: „Hauptkamera · 1x optisch“, „Tele · 6x digital“
  linse: { haupt: 'Hauptkamera', tele: 'Tele' },
  linseLang: { haupt: 'Hauptkamera', tele: 'Tele-Linse' },
  linsenText: (linse, stufe) => `${linse} · ${stufe}`,
  stufenText: (stufe, optisch) => `${stufe} ${optisch ? 'optisch' : 'digital'}`,
  maximal: (z) => `max. ${z}x`,
  schaerfe: { scharf: 'scharf', leicht: 'leicht weich', unscharf: 'unscharf' },
  bild: (zoom, linse, schaerfe) => `Alpenpanorama bei ${zoom}x, ${linse}, ${schaerfe}`,
  fach: (zoom) => `${zoom}-fach`,
  ansage: (zoom, linse) => `${zoom}-fach, ${linse}`,
  wechselTele: (z) => `Wechsel auf die Tele-Linse, ${z}-fach optisch`,
  wechselHaupt: 'Wechsel zurück auf die Hauptkamera',
  leiste: {
    bereich: (von, bis) => `${von}x bis ${bis}x`,
    ab: (z) => `ab ${z}x`,
    haupt: 'Hauptkamera, optisch',
    ausschnitt: 'Ausschnitt aus 50 MP',
    tele: 'Tele-Linse, danach Ausschnitt',
  },
  // Zoom-Vergleich (Pro-Seite)
  vergleich: {
    k1: (stufe) => `Kiesel 1 · ${stufe}`,
    pro: (stufe) => `Kiesel 1 Pro · ${stufe}`,
    proKurz: (tele, stufe) => `Pro · ${tele ? 'Tele · ' : ''}${stufe}`,
    bildAllein: (zoom, pro) => `Alpenpanorama bei ${zoom}x: Kiesel 1 Pro, ${pro}`,
    bild: (zoom, k1, pro) => `Alpenpanorama bei ${zoom}x: links Kiesel 1, ${k1}; rechts Kiesel 1 Pro, ${pro}`,
    linseSchaerfe: (linse, schaerfe) => `${linse}, ${schaerfe}`,
    aktiveLinse: 'Aktive Linse',
    trennlinie: 'Trennlinie: links Kiesel 1, rechts Kiesel 1 Pro',
    mitte: 'Mitte',
    anteil: (links, rechts) => `${links} Kiesel 1, ${rechts} Kiesel 1 Pro`,
    schalter: 'Mit Kiesel 1 vergleichen',
  },
  // Versteckte Details (nur /funktionen/)
  details: {
    liste: 'Versteckte Details',
    versteckt: 'Noch versteckt',
    verstecktLabel: (nr, alle) => `Noch versteckt, Detail ${nr} von ${alle}: hinzoomen`,
    hinzoomen: (name) => `${name}: hinzoomen`,
    zaehler: (n, alle) => (n === alle ? `Alle ${alle} entdeckt` : `${n} von ${alle} entdeckt`),
    entdeckt: (name) => `${name} entdeckt`,
    gefunden: (name, n, alle) => `${name} entdeckt. ${n} von ${alle}.`,
    angeflogen: (name, zoom) => `${name}, ${zoom}-fach`,
    fliegeZu: (name) => `Fliege zu: ${name}`,
  },
  // Makro-Demo („Ganz nah dran.“): knopf = Beschriftung des Knopfs, chip = Label auf dem Bild
  makro: {
    linsen: {
      weit: { knopf: 'Makro', chip: 'Ultraweit, ca. 3 cm' },
      tele: { knopf: '3x Tele', chip: '3x Tele, ca. 25 cm' },
      normal: { knopf: '1x', chip: '1x, ca. 20 cm' },
    },
    erklaerung: {
      pro: 'Die Blume ist in beiden Linsen gleich gross, der Hintergrund nicht: Mit der Tele stehst du weiter weg, die Wiese ist im Verhältnis näher an der Blume. Darum wirkt sie grösser und rückt scheinbar heran. Die lange Brennweite macht sie dazu viel weicher.',
      k1: 'Mit 1x siehst du die ganze Blume in der Wiese. Im Makro gehst du mit der Ultraweit-Einstellung bis 3 cm heran: Die Blüte füllt das Bild, der Hintergrund bleibt klein und erkennbar.',
    },
    bild: 'Blume mit Biene und Wiese. Tippe aufs Bild, um den Fokus zu setzen.',
    linse: 'Linse',
    scharfStellen: 'Scharf stellen auf',
    scharf: 'Scharf:',
    ebenen: { fg: 'Gras', bee: 'Biene', fl: 'Blume', bg: 'Wiese' },
  },
};

// ── /kiesel-1/technik/ und /kiesel-1-pro/technik/ (TechnikSeite.astro) ──
export const technikSeite = {
  seitenTitel: (name) => `${name} · Technische Daten`,
  beschreibung: (name, anderes) => `Alle technischen Daten des ${name} im Vergleich zum ${anderes}. Ein Fan-Konzept, alle Werte sind Schätzungen.`,
  titel: 'Technische Daten',
  einleitung: (name, anderes) => `${name} und ${anderes} nebeneinander. Blau markiert, was beim ${anderes} anders ist.`,
  nurUnterschiede: 'Nur Unterschiede zeigen',
  merkmal: 'Merkmal',
  anders: ' (anders)',   // nur für Screenreader, nach dem Wert
  keineUnterschiede: 'Keine Unterschiede in dieser Ansicht.',
  hinweis: 'Alle Werte sind Konzept-Angaben und teilweise geschätzt. Kiesel ist kein echtes Produkt.',
};

// ── /vergleichen/ (Seite und Rechnung lib/vergleich.js, auch im Browser) ──
// Geräte kommen als { name, typ } (typ: 'kiesel' | 'home' | 'notch' | 'island'): im Deutschen
// „der Kiesel“, aber „das iPhone“.
const artikel = (g, gross) => (g.typ === 'kiesel' ? (gross ? 'Der' : 'der') : (gross ? 'Das' : 'das'));
export const vergleich = {
  titel: 'Vergleichen',
  beschreibung: 'Kiesel 1 und Kiesel 1 Pro im echten Massstab neben iPhone SE, 13 mini, 18 Pro und 18 Pro Max. Ein Fan-Konzept.',
  einleitung: 'Alle Geräte im echten Massstab zueinander. Stell deinen Kiesel neben ein iPhone 18 Pro Max, und du siehst sofort, was «kompakt» wirklich heisst.',
  deinKiesel: 'Dein Kiesel',
  gegen: 'gegen',
  ansicht: 'Ansicht',
  nebeneinander: 'Nebeneinander',
  uebereinander: 'Übereinander',
  karteEinblenden: 'Kreditkarte einblenden',
  kreditkarte: 'Kreditkarte',
  mitKarte: ', mit Kreditkarte zum Grössenvergleich',
  caption: (k, o) => `${k} und ${o} in Zahlen`,
  legende: (k, o) => `Gefüllt: ${k}, gestrichelt: ${o}`,
  label: (k, o, ueber) => `${k} und ${o} im Massstab ${ueber ? 'übereinander' : 'nebeneinander'}`,
  zeilen: { hoehe: 'Höhe', breite: 'Breite', dicke: 'Dicke', gewicht: 'Gewicht', akku: 'Akku', display: 'Display' },
  // Vergleichssatz (cmp_js in gen4.py)
  gleicheFlaeche: (o, k) => `${o.name} und ${k.name} haben genau dieselbe Grundfläche.`,
  duenner: (o, mm, mehrAkku) => `${artikel(o, true)} ${o.name} ist ${mm} mm dünner, dafür hat der Kiesel ${mehrAkku} % mehr Akku.`,
  groesser: (o, k, hoeher, breiter, prozent) => `${artikel(o, true)} ${o.name} ist ${hoeher} mm höher und ${breiter} mm breiter als ${artikel(k, false)} ${k.name}. Seine Vorderseite ist ${prozent} % grösser.`,
  kleiner: (k, o, hoeher, breiter) => `${artikel(k, true)} ${k.name} ist ${hoeher} mm höher und ${breiter} mm breiter als ${artikel(o, false)} ${o.name}.`,
};

// ── /funktionen/: Kopf und Kamera-Abschnitt ──
export const funktionen = {
  seitenTitel: 'Funktionen',
  beschreibung: 'RGB-Licht, Zen-Modus, Privacy-Modus und acht versteckte Details im Kamera-Zoom: alles zum Ausprobieren.',
  titel: 'Funktionen',
  einleitung: 'Vier Dinge, die es so bei keinem aktuellen iPhone gibt. Alle zum Ausprobieren.',
  anker: { rgb: 'RGB-Licht', zen: 'Zen-Modus', privacy: 'Privacy-Modus', kamera: 'Kamera entdecken' },
  sprungmarken: 'Auf dieser Seite',
  kamera: {
    titel: 'Such das Gipfelkreuz.',
    text: 'Im Panorama sind acht Details versteckt, die erst beim Reinzoomen auftauchen. Bei 3x wechselt der Pro auf die Tele-Linse, das siehst du am kurzen Schärfe-Sprung.',
  },
};

// ── RGB-Licht (RgbLicht.astro, auch im Browser). stufe: nur Privacy, steht bei „weniger
//    Bewegung“ auf der Bühne ──
export const rgb = {
  titel: 'Ein Punkt, der Bescheid gibt.',
  text: 'Die Blitz-LED neben der Kamera ist RGB. Liegt das Handy mit dem Display nach unten, siehst du trotzdem, was los ist, ohne dass das Display aufwacht.',
  ereignisse: {
    call: { name: 'Anruf', titel: 'Anruf: pulsiert schnell blau', text: 'So merkst du es auch, wenn das Handy mit dem Display nach unten auf dem Tisch liegt.' },
    msg: { name: 'Nachricht', titel: 'Nachricht: zweimal kurz violett', text: 'Danach eine Pause. Wiederholt sich, bis du nachschaust.' },
    charge: { name: 'Lädt', titel: 'Lädt: atmet langsam grün', text: 'Der Punkt wird im Takt von etwa zwei Sekunden heller und dunkler.' },
    full: { name: 'Voll geladen', titel: 'Voll geladen: ruhig grün', text: 'Kein Pulsieren mehr, einfach ein stilles Grün.' },
    low: { name: 'Akku tief', titel: 'Akku unter 10 %: pulsiert langsam rot', text: 'Zeit für die Steckdose oder den MagSafe-Puck.' },
    privacy: { name: 'Privacy', stufe: 'Stufe 1: Sensoren aus', titel: 'Privacy-Modus: ruhig orange', text: 'Stufe 1, Sensoren aus: Kamera, Mikrofon und GPS sind stromlos. Der Punkt leuchtet, bis du den Modus beendest.' },
    funkstille: { name: 'Funkstille', stufe: 'Stufe 2: Funkstille', titel: 'Funkstille: orange, blinkt kurz', text: 'Stufe 2 des Privacy-Modus: Zusätzlich sind WLAN, Bluetooth, Mobilfunk und NFC stromlos. Alle drei Sekunden ein kurzes Blinken, so erkennst du sie von Stufe 1.' },
    flash: { name: 'Fotoblitz', titel: 'Fotoblitz: neutrales Weiss', text: 'Alle drei Farben voll an. Die Farbtemperatur passt sich dem Umgebungslicht an.' },
    off: { name: 'Aus', titel: 'Aus', text: 'Der Punkt ist ein ganz normaler Blitz und fällt nicht auf.' },
  },
  bild: (name) => `Kiesel 1 Pro von hinten, RGB-Licht: ${name}`,
  ereignis: 'Ereignis wählen',
};

// ── Zen-Modus (ZenModus.astro, auch im Browser) ──
export const zen = {
  titel: 'Zen-Modus',
  text: 'Ein kurzer Druck auf den Action-Button, und das Handy ist still. Nochmal drücken, und alles ist wieder da.',
  schalter: ['Zen-Modus einschalten', 'Zen-Modus ausschalten'],
  stillTitel: 'Still wird:',
  still: ['Anrufe', 'Benachrichtigungen', 'Vibration', 'RGB-Licht'],
  hinweis: 'Reine Software, braucht also keinen Millimeter Platz. Wer den Action-Button hält statt drückt, startet den Privacy-Modus: 2 s Sensoren aus, 4 s Funkstille.',
  pille: 'Zen-Modus',   // Pille auf dem Sperrbildschirm (Zeichnung)
  bild: {
    aus: 'Kiesel 1 Pro, Sperrbildschirm mit drei Mitteilungen',
    an: 'Kiesel 1 Pro, Sperrbildschirm im Zen-Modus, keine Mitteilungen',
  },
  ansage: {
    an: 'Zen-Modus an. Die drei Mitteilungen warten, bis du ihn ausschaltest.',
    aus: 'Zen-Modus aus. Die Mitteilungen sind wieder da.',
  },
};

// ── Privacy-Modus in zwei Stufen (PrivacyModus.astro, lib/privacy.js, auch im Browser),
//    Wort für Wort aus gen5.py ──
export const privacy = {
  titel: 'Privacy-Modus',
  text: 'Zwei Stufen, beide in Hardware. Stromlose Bauteile können nichts aufnehmen und nichts senden, auch wenn eine App es versucht. In der Funkstille ist das Handy zusätzlich für das Mobilfunknetz unsichtbar.',
  // Bauteile (Kennungen in data/funktionen.js PRIVACY_TEILE)
  teile: { camera: 'Kamera', mic: 'Mikrofon', gps: 'GPS', wifi: 'WLAN und Bluetooth', cellular: 'Mobilfunk', nfc: 'NFC' },
  gruppen: ['Stufe 1: Sensoren', 'Stufe 2: Funk'],
  plakette: ['an', 'aus'],
  status: { verbunden: 'verbunden', getrennt: 'getrennt', notruf: 'für Notruf verbunden' },
  platine: ['alles verbunden', 'läuft weiter'],
  platineName: 'Platine',
  ansage: (stufe, text) => `${stufe}. ${text}`, // Screenreader nach der Stufenwahl
  // [Name, Beschreibung] je Stufe 0, 1, 2
  stufen: [
    ['Aus', 'Alles verbunden. Der Kiesel funktioniert normal.'],
    ['Sensoren aus', 'Kamera, Mikrofon und GPS sind stromlos. Du bleibst erreichbar für Nachrichten und Internet.'],
    ['Funkstille', 'Zusätzlich sind WLAN, Bluetooth, Mobilfunk und NFC stromlos. Der Kiesel ist offline und für das Netz unsichtbar.'],
  ],
  stufeWaehlen: 'Stufe wählen',
  halten: 'Action-Button halten',
  marken: ['0 s', '2 s: Sensoren aus', '4 s: Funkstille'],
  weiterTitel: 'Funktioniert weiter',
  weiter: [
    ['Alles'],
    ['Nachrichten', 'Internet', 'Musik', 'Bluetooth-Kopfhörer', 'Bezahlen mit dem Handy'],
    ['Musik und Podcasts offline', 'Notizen und Lesen', 'Wecker und Timer', 'Offline-Spiele'],
  ],
  weiterNotruf: 'Notruf und Rückruf',
  pausiertTitel: 'Pausiert',
  pausiert: [
    [],
    ['Telefonieren', 'Fotos und Video', 'Navigation'],
    ['Telefonieren und Nachrichten', 'Internet', 'Bluetooth-Kopfhörer', 'Bezahlen mit dem Handy', 'Fotos und Navigation'],
  ],
  nichts: 'Nichts',
  notruf: {
    titel: 'Im Notfall: 5x Seitentaste',
    knopf: ['Simulieren', 'Notruf beenden'],
    // Text in Stufe 0, in Stufe 1/2 ohne Notruf, mit Notruf
    text: [
      'Diese Ausnahme gilt nur, wenn der Privacy-Modus aktiv ist.',
      'Fünfmal schnell die Seitentaste drücken schaltet Mobilfunk, Mikrofon und GPS sofort wieder ein. So ist der Notruf in beiden Stufen immer möglich.',
      'Mobilfunk, Mikrofon und GPS sind wieder verbunden. Du kannst 112, 117 oder 144 anrufen, und dein Standort kann mitgeschickt werden. Der Mobilfunk bleibt an, bis du den Privacy-Modus beendest, damit dich die Rettung zurückrufen kann.',
    ],
  },
  // RGB-Punkt auf der Platine je Stufe
  led: ['RGB-Punkt aus', 'Orange, ruhig', 'Orange, blinkt kurz'],
  schema: 'Schema: sechs Bauteile hängen über je einen Schalter an der Platine. Aktuelle Stufe: ',
  schemaNotruf: ', Notruf aktiv',
};

// ── /zubehoer/ ──
export const zubehoer = {
  seitenTitel: 'Zubehör',
  beschreibung: 'Die Kiesel-Hülle für Kiesel 1 und Kiesel 1 Pro, in fünf Farben, frei kombinierbar.',
  titel: 'Zubehör',
  einleitung: 'Alles, was zum Kiesel passt. Im Moment ist das vor allem eine Hülle, die man gern anfasst.',
  filterLabel: 'Filter',
  filter: { alle: 'Alle', k1: 'für Kiesel 1', pro: 'für Kiesel 1 Pro' },
  produkte: 'Produkte',
  huelle: 'Kiesel-Hülle',
  fuer: (modell) => `für ${modell}`,
  huelleFuer: (modell) => `Kiesel-Hülle für ${modell}`,
  fuenfFarben: 'in fünf Farben',
  ansehen: 'Ansehen',
  bildKarte: (huelle, modell, handy) => `Kiesel-Hülle in ${huelle} auf einem ${modell} in ${handy}`,
  bildKombi: (handy, huelle) => `Kiesel 1 Pro in ${handy} mit Hülle in ${huelle}`,
  platzhalter: { titel: '[Weiteres Zubehör]', text: 'Platz für ein nächstes Produkt, zum Beispiel ein MagSafe-Ladegerät.' },
  kombi: {
    titel: 'Frei kombinieren.',
    text: 'Handy und Hülle wählst du unabhängig voneinander. Durch die milchige Rückseite schimmert die Handyfarbe immer ein bisschen durch.',
    knopf: 'Diese Kombination kaufen',
    handy: 'Handy',
    huelle: 'Hülle',
  },
};

// ── /zubehoer/huelle/ (Text der Seite, Zeichnungen der Eigenschaften, Profilschnitt) ──
export const huelle = {
  titel: 'Kiesel-Hülle',
  text: 'Hinten milchig, am Rand fest und griffig. Steht ein kleines bisschen über Display und Kamera, damit beides den Tisch nie berührt.',
  beschreibung: (text, preis) => `${text} Für Kiesel 1 und Kiesel 1 Pro, ${preis}`,
  brotkrumen: 'Brotkrumen',
  zubehoer: 'Zubehör',
  ansicht: 'Ansicht',
  modellFrage: 'Für welches Modell?',
  groesse: { k1: 'SE-Grösse', pro: '13-mini-Grösse' },
  ansichten: { hinten: 'Rückseite', vorne: 'Vorderseite' },
  farbeLegende: 'Farbe der Hülle',
  vorschauLegende: 'Vorschau mit Handyfarbe',
  knopf: 'In den Warenkorb',
  hinweis: 'Kostenloser Versand. Die Vorschau-Handyfarbe gehört nicht zur Bestellung.',
  bild: (modell, handy, huelle, ansicht) => `${modell} in ${handy} mit Hülle in ${huelle}, ${ansicht}`,
  eigenschaftenTitel: 'Drei Dinge, die sie gut macht.',
  eigenschaften: {
    milchig: ['Milchige Rückseite', 'Halbtransparent wie Eis auf einem Bergsee. Handyfarbe, Kiesel und MagSafe-Ring schimmern durch.'],
    rand: ['Fester Rand', 'Griffig und dämpfend, in Farbe. Die Tasten sind abgedeckt und drücken sich trotzdem sauber.'],
    rahmen: ['Erhöhter Rahmen', 'Flach auf den Tisch gelegt, berührt nur die Hülle die Oberfläche. Display und Kamera bleiben in der Luft.'],
  },
  // Zeichnungen der drei Kacheln
  nahMilchig: 'Nahaufnahme: milchige Rückseite mit durchschimmerndem Kiesel und MagSafe-Ring',
  nahRand: 'Nahaufnahme: fester Rand mit Tastenabdeckungen',
  profil: {
    label: (display, kamera) => `Schnitt: Hülle steht ${display} mm über das Display und ${kamera} mm über die Kamera`,
    tisch: 'Tisch',
    mm: (wert) => `${wert} mm`,
    luft: (wert) => `${wert} mm Luft unter der Kamera`,
  },
  detailsTitel: 'Technische Details',
  details: {
    passt: 'Passt auf', passtWert: 'Kiesel 1 oder Kiesel 1 Pro, je eigene Grösse',
    farben: 'Farben',
    rand: 'Rand', randWert: (mm) => `trägt ca. ${mm} mm pro Seite auf`,
    ueberstand: 'Überstand', ueberstandWert: (display, kamera) => `ca. ${display} mm über dem Display, ca. ${kamera} mm über den Kameras`,
    magsafe: 'MagSafe', magsafeWert: 'kompatibel, Magnetring sichtbar durch die Rückseite',
    material: 'Material', materialWert: '[Material]',
    preis: 'Preis',
  },
};
