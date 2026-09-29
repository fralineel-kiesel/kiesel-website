// Texte und Farben der Seite /funktionen/, 1:1 aus dem Artboard „Funktionen“
// (design/generator/gen3.py, funk_js und die Abschnitte rgb/zen/privacy).

export const KOPF = {
  titel: 'Funktionen',
  einleitung: 'Vier Dinge, die es so bei keinem aktuellen iPhone gibt. Alle zum Ausprobieren.',
  anker: [['RGB-Licht', 'rgb'], ['Zen-Modus', 'zen'], ['Privacy-Modus', 'privacy'], ['Kamera entdecken', 'kamera']],
};

// RGB-Licht: je Ereignis Name, LED-Farben (Schema von ledDefs in phone.js), Text der Karte
// und der Rhythmus der Animation (CSS in RgbLicht.astro).
//   rhythmus: 'schnell' | 'zweimal' | 'atmen' | 'langsam' | 'ruhig' | 'blinkt' | 'aus'
//   stufe:    nur beim Privacy-Modus; steht bei „weniger Bewegung“ auf der Bühne, weil das
//             Blinken der Funkstille dann wegfällt (Etappe 8b, Artboard aus gen5.py)
export const RGB = {
  titel: 'Ein Punkt, der Bescheid gibt.',
  text: 'Die Blitz-LED neben der Kamera ist RGB. Liegt das Handy mit dem Display nach unten, siehst du trotzdem, was los ist, ohne dass das Display aufwacht.',
  start: 'call',
  ereignisse: {
    call: { name: 'Anruf', color: '#3D8BFF', o1: '0.85', o2: '0.4', mid: '#6FA8FF', edge: '#2A64C9', rhythmus: 'schnell', titel: 'Anruf: pulsiert schnell blau', text: 'So merkst du es auch, wenn das Handy mit dem Display nach unten auf dem Tisch liegt.' },
    msg: { name: 'Nachricht', color: '#A77BFF', o1: '0.85', o2: '0.4', mid: '#C4A6FF', edge: '#7650D1', rhythmus: 'zweimal', titel: 'Nachricht: zweimal kurz violett', text: 'Danach eine Pause. Wiederholt sich, bis du nachschaust.' },
    charge: { name: 'Lädt', color: '#35D07F', o1: '0.6', o2: '0.3', mid: '#6EE3A5', edge: '#1F9A5C', rhythmus: 'atmen', titel: 'Lädt: atmet langsam grün', text: 'Der Punkt wird im Takt von etwa zwei Sekunden heller und dunkler.' },
    full: { name: 'Voll geladen', color: '#35D07F', o1: '0.8', o2: '0.38', mid: '#6EE3A5', edge: '#1F9A5C', rhythmus: 'ruhig', titel: 'Voll geladen: ruhig grün', text: 'Kein Pulsieren mehr, einfach ein stilles Grün.' },
    low: { name: 'Akku tief', color: '#FF4B4B', o1: '0.8', o2: '0.38', mid: '#FF8080', edge: '#C42A2A', rhythmus: 'langsam', titel: 'Akku unter 10 %: pulsiert langsam rot', text: 'Zeit für die Steckdose oder den MagSafe-Puck.' },
    privacy: { name: 'Privacy', color: '#FF9A2E', o1: '0.85', o2: '0.42', mid: '#FFB866', edge: '#D0701A', rhythmus: 'ruhig', stufe: 'Stufe 1: Sensoren aus', titel: 'Privacy-Modus: ruhig orange', text: 'Stufe 1, Sensoren aus: Kamera, Mikrofon und GPS sind stromlos. Der Punkt leuchtet, bis du den Modus beendest.' },
    funkstille: { name: 'Funkstille', color: '#FF9A2E', o1: '0.85', o2: '0.42', mid: '#FFB866', edge: '#D0701A', rhythmus: 'blinkt', stufe: 'Stufe 2: Funkstille', titel: 'Funkstille: orange, blinkt kurz', text: 'Stufe 2 des Privacy-Modus: Zusätzlich sind WLAN, Bluetooth, Mobilfunk und NFC stromlos. Alle drei Sekunden ein kurzes Blinken, so erkennst du sie von Stufe 1.' },
    flash: { name: 'Fotoblitz', color: '#FFFFFF', o1: '0.8', o2: '0.4', mid: '#FFFFFF', edge: '#E8E2D2', rhythmus: 'ruhig', titel: 'Fotoblitz: neutrales Weiss', text: 'Alle drei Farben voll an. Die Farbtemperatur passt sich dem Umgebungslicht an.' },
    off: { name: 'Aus', color: null, rhythmus: 'aus', titel: 'Aus', text: 'Der Punkt ist ein ganz normaler Blitz und fällt nicht auf.' },
  },
};

export const ZEN = {
  titel: 'Zen-Modus',
  text: 'Ein kurzer Druck auf den Action-Button, und das Handy ist still. Nochmal drücken, und alles ist wieder da.',
  schalter: ['Zen-Modus einschalten', 'Zen-Modus ausschalten'],
  stillTitel: 'Still wird:',
  still: ['Anrufe', 'Benachrichtigungen', 'Vibration', 'RGB-Licht'],
  hinweis: 'Reine Software, braucht also keinen Millimeter Platz. Wer den Action-Button hält statt drückt, startet den Privacy-Modus: 2 s Sensoren aus, 4 s Funkstille.',
};

// Privacy-Modus in zwei Stufen, Wort für Wort aus dem Artboard „Privacy-Modus in zwei Stufen“
// (design/generator/gen5.py, priv_js). Die Logik dazu steht in src/lib/privacy.js.
export const PRIVACY = {
  titel: 'Privacy-Modus',
  text: 'Zwei Stufen, beide in Hardware. Stromlose Bauteile können nichts aufnehmen und nichts senden, auch wenn eine App es versucht. In der Funkstille ist das Handy zusätzlich für das Mobilfunknetz unsichtbar.',
  // [Name, Stufe, ab der das Bauteil stromlos ist]
  teile: [['Kamera', 1], ['Mikrofon', 1], ['GPS', 1], ['WLAN und Bluetooth', 2], ['Mobilfunk', 2], ['NFC', 2]],
  gruppen: ['Stufe 1: Sensoren', 'Stufe 2: Funk'],
  plakette: ['an', 'aus'],
  // Diese drei schaltet der Notruf (5x Seitentaste) sofort wieder ein
  notrufTeile: ['Mobilfunk', 'Mikrofon', 'GPS'],
  status: { verbunden: 'verbunden', getrennt: 'getrennt', notruf: 'für Notruf verbunden' },
  platine: ['alles verbunden', 'läuft weiter'],
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

export const KAMERA = {
  titel: 'Such das Gipfelkreuz.',
  text: 'Im Panorama sind acht Details versteckt, die erst beim Reinzoomen auftauchen. Bei 3x wechselt der Pro auf die Tele-Linse, das siehst du am kurzen Schärfe-Sprung.',
};
