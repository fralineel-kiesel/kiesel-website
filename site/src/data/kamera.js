// Texte der Kamera-Demos (Artboard „Funktionen“, gen3.py: Zoom-Skala und Linsen-Leiste).
// Gebraucht auf /funktionen/ („Such das Gipfelkreuz“) und auf beiden Modellseiten.

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
