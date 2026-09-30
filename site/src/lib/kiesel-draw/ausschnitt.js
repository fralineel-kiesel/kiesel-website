// Bildausschnitte im Alpenpanorama (1600 × 1000), aus scene.py.
// Eigene kleine Datei, damit z.B. der Zoom-Teaser auf der Startseite den Ausschnitt im
// Browser ändern kann, ohne den ganzen Panorama-Zeichner (scene.js) mitzuladen.
import { f } from './svg.js';

// Die acht versteckten Details: [Kennung, x, y] im 1600 × 1000-Bild, Lage 1:1 aus scene.py.
// Steht hier (und nicht in scene.js), damit die Kamera-Demos sie im Browser kennen, ohne
// den ganzen Panorama-Zeichner zu laden. scene.js reicht sie weiter.
// Die Namen („Gipfelkreuz“ …) stehen in der Textdatei: panoramaDetails in src/i18n/de.js.
export const ZOOM_TARGETS = [
  ['summit-cross', 760, 214],
  ['rope-team', 716, 242],
  ['ibex', 846, 331],
  ['mountain-hut', 616, 369],
  ['gondola', 452, 500],
  ['paraglider', 1060, 306],
  ['sailboat', 1122, 770],
  ['village', 262, 668],
];

// Bildausschnitt als viewBox: zoom 1 = ganzes Bild (1600 breit), zoom 8 = 200 breit.
// ratio = Breite / Höhe des Ausschnitts
export function crop(cx, cy, zoom, ratio = 1.6) {
  const w = 1600 / zoom, h = w / ratio;
  return `${f(cx - w / 2)} ${f(cy - h / 2)} ${f(w)} ${f(h)}`;
}

// Mittelpunkt so verschieben, dass der Ausschnitt im Bild bleibt (sonst sähe man bei
// Zoom 2 am Rand plötzlich Leere)
export function begrenze(cx, cy, zoom, ratio = 1.6) {
  const w = 1600 / zoom, h = w / ratio;
  const klemme = (v, halb, max) => (halb * 2 >= max ? max / 2 : Math.min(max - halb, Math.max(halb, v)));
  return [klemme(cx, w / 2, 1600), klemme(cy, h / 2, 1000)];
}
