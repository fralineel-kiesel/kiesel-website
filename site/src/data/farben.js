// Die fünf Produktfarben, übernommen aus design/generator/lib.py (PAL).
// Jede Farbe hat sieben Töne, weil der Zeichen-Motor (Etappe 2) Rahmen und Rücken
// mit Licht und Schatten zeichnet:
//   frame = Rahmen, hi/lo = helle/dunkle Kante, back = Rücken,
//   backHi/backLo = Verlauf auf dem Rücken, logo = eingeprägter Kiesel
//
// Schlüssel = sprachneutrale Kennung (Etappe 9a). Sie steht in Adressen (?farbe=sky-blue),
// Formularen und im gespeicherten Warenkorb. Den Namen zum Anzeigen („Himmelblau“) liefert
// die Textdatei: farben in src/i18n/de.js.
export const FARBEN = {
  'sky-blue':      { frame: '#A7C4DE', hi: '#E3EEF8', lo: '#6E8BA8', back: '#B8D3EA', backHi: '#D5E6F5', backLo: '#9CB9D4', logo: '#A5C1DC' },
  'matte-black':   { frame: '#2F3134', hi: '#7A7F86', lo: '#111214', back: '#242529', backHi: '#36383D', backLo: '#17181B', logo: '#2E3035' },
  'titanium-gray': { frame: '#8D9197', hi: '#DADDE1', lo: '#53565B', back: '#7C8086', backHi: '#999DA3', backLo: '#62666B', logo: '#72767C' },
  'matte-white':   { frame: '#DAD9D4', hi: '#FBFAF8', lo: '#A4A29B', back: '#EDECE8', backHi: '#FAF9F7', backLo: '#D6D4CE', logo: '#E0DED9' },
  'pebble-beige':  { frame: '#C8BAA2', hi: '#F0E8DA', lo: '#978870', back: '#D8CCB8', backHi: '#E9E1D3', backLo: '#C0B29B', logo: '#CCBFA9' },
};

// Alle Kennungen, Reihenfolge wie im Designsystem (Farbwähler)
export const FARB_IDS = Object.keys(FARBEN);

// Reihenfolge in Aufzählungen (Texte, Technische Daten), wie in der Produktbeschreibung
export const FARBEN_TEXT = ['matte-black', 'titanium-gray', 'sky-blue', 'matte-white', 'pebble-beige'];

// Bis Etappe 8 hiessen die Farben überall wie ihr deutscher Name. So stehen sie in alten Links
// (/kaufen/?farbe=Himmelblau) und in Warenkörben, die schon im Browser liegen. Diese Tabelle
// bleibt für immer: Alte Links sterben nie ganz aus.
export const ALTE_FARBNAMEN = {
  Himmelblau: 'sky-blue',
  Mattschwarz: 'matte-black',
  Titangrau: 'titanium-gray',
  Mattweiss: 'matte-white',
  Kieselbeige: 'pebble-beige',
};

// Irgendein Wert (Adresse, Speicher, Formular) → gültige Kennung oder null.
// Nimmt die Kennung oder den alten deutschen Namen, Gross/Klein egal:
//   farbId('sky-blue') → 'sky-blue'   farbId('himmelblau') → 'sky-blue'   farbId('rot') → null
export function farbId(wert) {
  const w = String(wert ?? '').trim().toLowerCase();
  if (!w) return null;
  return FARB_IDS.find((id) => id === w)
    ?? Object.entries(ALTE_FARBNAMEN).find(([alt]) => alt.toLowerCase() === w)?.[1]
    ?? null;
}
