// Texte und Farben der Seite /funktionen/, 1:1 aus dem Artboard „Funktionen“
// (design/generator/gen3.py, funk_js und die Abschnitte rgb/zen/privacy).

export const KOPF = {
  titel: 'Funktionen',
  einleitung: 'Vier Dinge, die es so bei keinem aktuellen iPhone gibt. Alle zum Ausprobieren.',
  anker: [['RGB-Licht', 'rgb'], ['Zen-Modus', 'zen'], ['Privacy-Modus', 'privacy'], ['Kamera entdecken', 'kamera']],
};

// RGB-Licht: je Ereignis Name, LED-Farben (Schema von ledDefs in phone.js), Text der Karte
// und der Rhythmus der Animation (CSS in RgbLicht.astro).
//   rhythmus: 'schnell' | 'zweimal' | 'atmen' | 'langsam' | 'ruhig' | 'aus'
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
    privacy: { name: 'Privacy', color: '#FF9A2E', o1: '0.85', o2: '0.42', mid: '#FFB866', edge: '#D0701A', rhythmus: 'ruhig', titel: 'Privacy-Modus: dauerhaft orange', text: 'Solange Kamera, Mikrofon und GPS vom Strom getrennt sind.' },
    flash: { name: 'Fotoblitz', color: '#FFFFFF', o1: '0.8', o2: '0.4', mid: '#FFFFFF', edge: '#E8E2D2', rhythmus: 'ruhig', titel: 'Fotoblitz: neutrales Weiss', text: 'Alle drei Farben voll an. Die Farbtemperatur passt sich dem Umgebungslicht an.' },
    off: { name: 'Aus', color: null, rhythmus: 'aus', titel: 'Aus', text: 'Der Punkt ist ein ganz normaler Blitz und fällt nicht auf.' },
  },
};

export const ZEN = {
  titel: 'Zen-Modus',
  text: 'Ein Druck auf den Action-Button, und das Handy ist still. Nochmal drücken, und alles ist wieder da.',
  schalter: ['Zen-Modus einschalten', 'Zen-Modus ausschalten'],
  stillTitel: 'Still wird:',
  still: ['Anrufe', 'Benachrichtigungen', 'Vibration', 'RGB-Licht'],
  hinweis: 'Reine Software, braucht also keinen Millimeter Platz.',
};

export const PRIVACY = {
  titel: 'Privacy-Modus',
  text: 'Halte den Action-Button zwei Sekunden. Drei Schalter trennen Kamera, Mikrofon und GPS vom Strom. Keine Software-Sperre: Ohne Strom kann auch eine gehackte App nichts aufnehmen.',
  schalter: ['Privacy-Modus einschalten', 'Privacy-Modus ausschalten'],
  teile: ['Kamera', 'Mikrofon', 'GPS'],
  status: ['verbunden', 'getrennt'],
  platine: ['alles verbunden', 'läuft weiter'],
  weiterTitel: 'Funktioniert weiter',
  weiter: ['Nachrichten', 'Internet', 'Musik'],
  pausiertTitel: 'Pausiert',
  pausiert: ['Telefonieren', 'Fotos und Video', 'Navigation'],
  hinweis: 'Solange der Modus aktiv ist, leuchtet der RGB-Punkt dauerhaft orange.',
};

export const KAMERA = {
  titel: 'Such das Gipfelkreuz.',
  text: 'Im Panorama sind acht Details versteckt, die erst beim Reinzoomen auftauchen. Bei 3x wechselt der Pro auf die Tele-Linse, das siehst du am kurzen Schärfe-Sprung.',
};
