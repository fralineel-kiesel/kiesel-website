// Eckwerte der Kamera-Demos (Artboard „Funktionen“, gen3.py: Zoom-Skala und
// Linsen-Leiste). Gebraucht vom Zoom-Bild (ZoomBild.astro, alle vier Zoom-Stellen) und von
// der Makro-Demo der Modellseiten. Die Rechnung dazu steht in src/lib/kamera.js, die Texte in
// der Textdatei (kamera in src/i18n/de.js). …Fuer(T) baut sie in einer Sprache, STUFEN, LINSEN
// und MAKRO sind die deutsche Fassung.

import { kamera as DE } from '../i18n/de.js';

// Ab diesem Zoom arbeitet die Tele-Linse (nur Pro); grösster Zoom je Modell.
// Gleich wie WERTE.tele und WERTE.zoomDigital in technik.js (prüft pruefe:kamera-stellen).
// Hier als Zahl, damit das Browser-Skript der Kamera nicht alle Gerätedaten mitlädt.
export const TELE_AB = 3;
export const MAX_ZOOM = { pro: 10, k1: 5 };
// Auflösung der Hauptkamera, gleich wie WERTE.megapixel (prüft pruefe:kamera-stellen)
export const MEGAPIXEL = 50;
// Zoomstufen unter der Skala: [Wert, Text, betont]
export const stufenFuer = (T = DE) => ({
  pro: [['0.5', T.stufe('0.5')], ['1', T.stufe('1')], ['3', T.stufeTele('3'), true], ['5', T.stufe('5')], ['10', T.stufe('10')]],
  k1: [['0.5', T.stufe('0.5')], ['1', T.stufe('1')], ['2', T.stufe('2')], ['5', T.stufe('5')]],
});
export const STUFEN = /* @__PURE__ */ stufenFuer();

// Linsen-Leiste: [ab, Titel, Text, Breite] (Breiten wie im Artboard 1 : 1.2 : 1.6).
// ab = kleinster angezeigter Zoom (eine Nachkommastelle), ab dem der Abschnitt gilt. 1x ist
// noch optisch, der Ausschnitt beginnt darum bei 1.1x; die Tele-Linse genau bei 3x.
export const linsenFuer = (T = DE) => {
  const L = T.leiste;
  return {
    pro: [
      [0.5, L.bereich('0.5', '1'), L.haupt, 1],
      [1.1, L.bereich('1', '3'), L.ausschnitt(MEGAPIXEL), 1.2],
      [3, L.ab('3'), L.tele, 1.6],
    ],
    k1: [
      [0.5, L.bereich('0.5', '1'), L.haupt, 1],
      [1.1, L.bereich('1', '5'), L.ausschnitt(MEGAPIXEL), 1.6],
    ],
  };
};
export const LINSEN = /* @__PURE__ */ linsenFuer();

// ── Makro-Demo („Ganz nah dran.“) ──
// Die Blume besteht aus vier Ebenen: fg = Gras ganz vorne, bee = Biene, fl = Blume,
// bg = Wiese und Hügel dahinter. Je Linse hat jede Ebene eine eigene Grösse (skala) und
// Unschärfe (staerke × Abstand zur Schärfeebene, blumeUnschaerfe() im Zeichen-Motor).
//
// Warum sich die Grössen ändern: Mit Ultraweit ist man 3 cm vor der Blüte, die Wiese ist
// vielleicht 1 m weg, also über 30-mal weiter als die Blume: Sie wirkt klein. Mit der Tele
// steht man 25 cm weg, die Wiese ist nur noch 5-mal weiter weg als die Blume. Die Blume
// füllt dank 3x-Zoom trotzdem das Bild, aber der Hintergrund erscheint im Verhältnis viel
// grösser (in echt rund 6-mal, hier gemildert auf 1.9 wie auf der alten Seite). Die lange
// Brennweite hat dazu weniger Tiefenschärfe: Der Hintergrund verschwimmt stärker.
// Umgekehrt wirken Biene und Gras, die vor der Blume liegen, mit Ultraweit grösser.
//
//   knopf: Beschriftung des Knopfs   chip: Label auf dem Bild   staerke: Unschärfe pro
//   Tiefe (grosse Zahl = wenig Tiefenschärfe)   skala: Grösse je Ebene (1 = wie gezeichnet)
export const makroFuer = (T = DE) => {
  const M = T.makro;
  return {
    pro: {
      start: 'tele',
      linsen: {
        weit: { ...M.linsen.weit, staerke: 9, skala: { bg: 1.05, fl: 1.06, bee: 1.15, fg: 1.25 } },
        tele: { ...M.linsen.tele, staerke: 24, skala: { bg: 1.9, fl: 1, bee: 1, fg: 1 } },
      },
      erklaerung: M.erklaerung.pro,
    },
    k1: {
      start: 'weit',
      linsen: {
        normal: { ...M.linsen.normal, staerke: 4, skala: { bg: 1, fl: 0.55, bee: 0.55, fg: 0.8 } },
        weit: { ...M.linsen.weit, staerke: 9, skala: { bg: 1.05, fl: 1, bee: 1, fg: 1 } },
      },
      erklaerung: M.erklaerung.k1,
    },
  };
};
export const MAKRO = /* @__PURE__ */ makroFuer();

// Mittelpunkt der Skalierung je Ebene im 1200 × 800-Bild. Blume und Biene wachsen vom
// Stielende aus (sonst schwebt die Blume beim Kiesel 1 in der Luft), das Gras vom unteren
// Rand, der Hintergrund von der Horizontlinie hinter der Blume.
export const MAKRO_MITTE = { bg: [600, 430], fl: [600, 800], bee: [600, 800], fg: [600, 800] };

// Welche Ebene an welcher Stelle scharf gestellt wurde (Knöpfe unter dem Bild, für Tastatur).
// Namen: kamera.makro.ebenen in der Textdatei
export const MAKRO_FOKUS = ['fg', 'bee', 'fl', 'bg'];
