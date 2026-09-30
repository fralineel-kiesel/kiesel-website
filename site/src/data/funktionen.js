// Farben, Rhythmen und Logik-Daten der Seite /funktionen/ (Artboard „Funktionen“,
// design/generator/gen3.py, funk_js und die Abschnitte rgb/zen/privacy; Privacy-Modus aus gen5.py).
// Die Texte stehen in der Textdatei (funktionen, rgb, zen, privacy in src/i18n/de.js).
// …Fuer(T) baut sie in einer Sprache; KOPF, RGB, ZEN, PRIVACY und KAMERA sind die deutsche
// Fassung (/* @__PURE__ */: Browser-Skripte bekommen nur, was sie wirklich brauchen).
import { funktionen as DE_F, rgb as DE_RGB, zen as DE_ZEN, privacy as DE_P } from '../i18n/de.js';

// Kopf der Seite: Sprungmarken [Text, Anker]
export const kopfFuer = (T = DE_F) => ({
  titel: T.titel,
  einleitung: T.einleitung,
  anker: ['rgb', 'zen', 'privacy', 'kamera'].map((id) => [T.anker[id], id]),
});
export const KOPF = /* @__PURE__ */ kopfFuer();

// RGB-Licht: je Ereignis LED-Farben (Schema von ledDefs in phone.js) und der Rhythmus der
// Animation (CSS in RgbLicht.astro); Name, Titel und Text der Karte aus der Textdatei.
//   rhythmus: 'schnell' | 'zweimal' | 'atmen' | 'langsam' | 'ruhig' | 'blinkt' | 'aus'
//   stufe:    nur beim Privacy-Modus; steht bei „weniger Bewegung“ auf der Bühne, weil das
//             Blinken der Funkstille dann wegfällt (Etappe 8b, Artboard aus gen5.py)
const LED = {
  call: { color: '#3D8BFF', o1: '0.85', o2: '0.4', mid: '#6FA8FF', edge: '#2A64C9', rhythmus: 'schnell' },
  msg: { color: '#A77BFF', o1: '0.85', o2: '0.4', mid: '#C4A6FF', edge: '#7650D1', rhythmus: 'zweimal' },
  charge: { color: '#35D07F', o1: '0.6', o2: '0.3', mid: '#6EE3A5', edge: '#1F9A5C', rhythmus: 'atmen' },
  full: { color: '#35D07F', o1: '0.8', o2: '0.38', mid: '#6EE3A5', edge: '#1F9A5C', rhythmus: 'ruhig' },
  low: { color: '#FF4B4B', o1: '0.8', o2: '0.38', mid: '#FF8080', edge: '#C42A2A', rhythmus: 'langsam' },
  privacy: { color: '#FF9A2E', o1: '0.85', o2: '0.42', mid: '#FFB866', edge: '#D0701A', rhythmus: 'ruhig' },
  funkstille: { color: '#FF9A2E', o1: '0.85', o2: '0.42', mid: '#FFB866', edge: '#D0701A', rhythmus: 'blinkt' },
  flash: { color: '#FFFFFF', o1: '0.8', o2: '0.4', mid: '#FFFFFF', edge: '#E8E2D2', rhythmus: 'ruhig' },
  off: { color: null, rhythmus: 'aus' },
};
export const rgbFuer = (T = DE_RGB) => ({
  titel: T.titel,
  text: T.text,
  start: 'call',
  // Reihenfolge der Schlüssel wie bisher: name, Farben, rhythmus, stufe, titel, text
  ereignisse: Object.fromEntries(Object.entries(LED).map(([id, led]) => {
    const e = T.ereignisse[id];
    return [id, { name: e.name, ...led, ...(e.stufe ? { stufe: e.stufe } : {}), titel: e.titel, text: e.text }];
  })),
});
export const RGB = /* @__PURE__ */ rgbFuer();

export const zenFuer = (T = DE_ZEN) => ({ ...T });
export const ZEN = /* @__PURE__ */ zenFuer();

// Privacy-Modus in zwei Stufen, Wort für Wort aus dem Artboard „Privacy-Modus in zwei Stufen“
// (design/generator/gen5.py, priv_js). Die Logik dazu steht in src/lib/privacy.js.
// Bauteile: [Kennung, Stufe, ab der das Bauteil stromlos ist]; Namen aus der Textdatei.
export const PRIVACY_TEILE = [['camera', 1], ['mic', 1], ['gps', 1], ['wifi', 2], ['cellular', 2], ['nfc', 2]];
// Diese drei schaltet der Notruf (5x Seitentaste) sofort wieder ein
export const NOTRUF_TEILE = ['cellular', 'mic', 'gps'];
export const privacyFuer = (T = DE_P) => ({ ...T });
export const PRIVACY = /* @__PURE__ */ privacyFuer();

export const kameraFuer = (T = DE_F) => ({ ...T.kamera });
export const KAMERA = /* @__PURE__ */ kameraFuer();
