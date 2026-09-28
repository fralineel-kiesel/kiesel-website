// Regeln für die Gravur (Kaufen-Seite und Warenkorb).
//
//   pruefeGravur('Linos Kiesel') → { text: 'Linos Kiesel', laenge: 12, fehler: null }
//   pruefeGravur('Hallo @Welt')  → { …, fehler: '«@» geht nicht auf die Gravur. Erlaubt sind …' }
//
// Erlaubt: Buchstaben der lateinischen Schrift (auch Umlaute und Akzente: ä, é, ñ, ł, ß),
// Ziffern, Leerzeichen und . , ' ’ & ! ? + -
// Warum nur lateinisch? Unsere Schrift enthält nur den Zeichensatz „latin“. Kyrillisch oder
// Emojis würde der Browser in einer fremden Ersatzschrift zeichnen.
//
// normalize('NFC'): Ein „é“ kann als ein Zeichen (U+00E9) oder als „e“ + Akzent (U+0065 U+0301)
// ankommen, z.B. aus macOS. NFC fasst beides zum einen Zeichen zusammen, dann zählt es als 1.

export const GRAVUR_MAX = 18;
export const GRAVUR_ERLAUBT = "Buchstaben, Zahlen, Leerzeichen und . , ' ’ & ! ? + -";

// \p{Script=Latin} = alle lateinischen Buchstaben, \p{M} = Akzente, die übrig bleiben
// (z.B. ein Akzent, den es nicht als fertiges Zeichen gibt), \p{Nd} = Ziffern 0–9
const ZEICHEN = /[\p{Script=Latin}\p{M}\p{Nd} .,'’&!?+\-]/u;

// Unsichtbares oder Verwechselbares für die Fehlermeldung lesbar machen
function zeige(z) {
  if (z === '\t') return 'Tabulator';
  if (/\s/u.test(z)) return 'Sonder-Leerzeichen';
  return `«${z}»`;
}

export function pruefeGravur(eingabe = '') {
  const text = String(eingabe).normalize('NFC');
  const zeichen = [...text]; // [...] zählt Zeichen, nicht UTF-16-Hälften (wichtig bei Emojis)
  const falsch = [...new Set(zeichen.filter((z) => !ZEICHEN.test(z)))];
  let fehler = null;
  if (falsch.length) {
    const liste = falsch.slice(0, 3).map(zeige).join(', ') + (falsch.length > 3 ? ' …' : '');
    fehler = `${liste} ${falsch.length === 1 ? 'geht' : 'gehen'} nicht auf die Gravur. Erlaubt sind ${GRAVUR_ERLAUBT}`;
  } else if (zeichen.length > GRAVUR_MAX) {
    const zuviel = zeichen.length - GRAVUR_MAX;
    fehler = `Höchstens ${GRAVUR_MAX} Zeichen, das ${zuviel === 1 ? 'ist 1' : `sind ${zuviel}`} zu viel.`;
  }
  return { text, laenge: zeichen.length, fehler };
}

// Gravur, wie sie in den Warenkorb kommt: geprüft, ohne Leerzeichen am Rand, mehrere
// Leerzeichen hintereinander als eines. Ungültig → null.
export function saubereGravur(eingabe) {
  const { text, fehler } = pruefeGravur(eingabe ?? '');
  if (fehler) return null;
  return text.trim().replace(/ {2,}/g, ' ');
}
