// Deutsche Texte, Teil „modelle“: Startseite, Modelle, Modellseiten, Technische Daten (fast nur im Build; buehne3d im Browser der Startseite)
// Aufbau und Regeln: siehe src/i18n/de.js.

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

// ── 3D-Bühne der Startseite (Buehne3D.astro, auch im Browser) ──
export const buehne3d = {
  name: (modell, farbe) => `${modell} in ${farbe}`,
  bild2d: (name) => `${name}, Rückseite`,
  bild3d: (name) => `${name}, 3D-Modell. Mit Maus, Finger oder Pfeiltasten drehen.`,
  farbeDes: (modell) => `Farbe des ${modell}`,
  modellWaehlen: 'Modell wählen',
  ziehen: 'Ziehen zum Drehen',
  drehen: 'Drehen',
};
