// Deutsche Texte, Teil „funktionen“: /funktionen/: Kopf, RGB-Licht, Zen-Modus, Privacy-Modus (Browser: je ein Skript)
// Aufbau und Regeln: siehe src/i18n/de.js.

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
