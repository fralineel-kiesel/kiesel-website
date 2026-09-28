// Texte und Eckwerte der Kamera-Demos (Artboard „Funktionen“, gen3.py: Zoom-Skala und
// Linsen-Leiste). Gebraucht vom Zoom-Bild (ZoomBild.astro, alle vier Zoom-Stellen) und von
// der Makro-Demo der Modellseiten. Die Rechnung dazu steht in src/lib/kamera.js.

// Ab diesem Zoom arbeitet die Tele-Linse (nur Pro); grösster Zoom je Modell.
// Gleich wie WERTE.tele und WERTE.zoomDigital in technik.js (prüft pruefe:kamera-stellen).
// Hier als Zahl, damit das Browser-Skript der Kamera nicht alle Gerätedaten mitlädt.
export const TELE_AB = 3;
export const MAX_ZOOM = { pro: 10, k1: 5 };
export const LINSEN_NAME = { haupt: 'Hauptkamera', tele: 'Tele' };

// Zoomstufen unter der Skala: [Wert, Text, betont]
export const STUFEN = {
  pro: [['0.5', '0.5x'], ['1', '1x'], ['3', '3x · Tele', true], ['5', '5x'], ['10', '10x']],
  k1: [['0.5', '0.5x'], ['1', '1x'], ['2', '2x'], ['5', '5x']],
};

// Linsen-Leiste: [ab, Titel, Text, Breite] (Breiten wie im Artboard 1 : 1.2 : 1.6).
// ab = kleinster angezeigter Zoom (eine Nachkommastelle), ab dem der Abschnitt gilt. 1x ist
// noch optisch, der Ausschnitt beginnt darum bei 1.1x; die Tele-Linse genau bei 3x.
export const LINSEN = {
  pro: [
    [0.5, '0.5x bis 1x', 'Hauptkamera, optisch', 1],
    [1.1, '1x bis 3x', 'Ausschnitt aus 50 MP', 1.2],
    [3, 'ab 3x', 'Tele-Linse, danach Ausschnitt', 1.6],
  ],
  k1: [
    [0.5, '0.5x bis 1x', 'Hauptkamera, optisch', 1],
    [1.1, '1x bis 5x', 'Ausschnitt aus 50 MP', 1.6],
  ],
};

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
export const MAKRO = {
  pro: {
    start: 'tele',
    linsen: {
      weit: { knopf: 'Makro', chip: 'Ultraweit, ca. 3 cm', staerke: 9, skala: { bg: 1.05, fl: 1.06, bee: 1.15, fg: 1.25 } },
      tele: { knopf: '3x Tele', chip: '3x Tele, ca. 25 cm', staerke: 24, skala: { bg: 1.9, fl: 1, bee: 1, fg: 1 } },
    },
    erklaerung: 'Die Blume ist in beiden Linsen gleich gross, der Hintergrund nicht: Mit der Tele stehst du weiter weg, die Wiese ist im Verhältnis näher an der Blume. Darum wirkt sie grösser und rückt scheinbar heran. Die lange Brennweite macht sie dazu viel weicher.',
  },
  k1: {
    start: 'weit',
    linsen: {
      normal: { knopf: '1x', chip: '1x, ca. 20 cm', staerke: 4, skala: { bg: 1, fl: 0.55, bee: 0.55, fg: 0.8 } },
      weit: { knopf: 'Makro', chip: 'Ultraweit, ca. 3 cm', staerke: 9, skala: { bg: 1.05, fl: 1, bee: 1, fg: 1 } },
    },
    erklaerung: 'Mit 1x siehst du die ganze Blume in der Wiese. Im Makro gehst du mit der Ultraweit-Einstellung bis 3 cm heran: Die Blüte füllt das Bild, der Hintergrund bleibt klein und erkennbar.',
  },
};

// Mittelpunkt der Skalierung je Ebene im 1200 × 800-Bild. Blume und Biene wachsen vom
// Stielende aus (sonst schwebt die Blume beim Kiesel 1 in der Luft), das Gras vom unteren
// Rand, der Hintergrund von der Horizontlinie hinter der Blume.
export const MAKRO_MITTE = { bg: [600, 430], fl: [600, 800], bee: [600, 800], fg: [600, 800] };

// Welche Ebene an welcher Stelle scharf gestellt wurde (Knöpfe unter dem Bild, für Tastatur)
export const MAKRO_FOKUS = [['fg', 'Gras'], ['bee', 'Biene'], ['fl', 'Blume'], ['bg', 'Wiese']];
