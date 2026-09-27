// Die fünf Produktfarben, übernommen aus design/generator/lib.py (PAL).
// Jede Farbe hat sieben Töne, weil der Zeichen-Motor (Etappe 2) Rahmen und Rücken
// mit Licht und Schatten zeichnet:
//   frame = Rahmen, hi/lo = helle/dunkle Kante, back = Rücken,
//   backHi/backLo = Verlauf auf dem Rücken, logo = eingeprägter Kiesel
export const FARBEN = {
  Himmelblau:  { frame: '#A7C4DE', hi: '#E3EEF8', lo: '#6E8BA8', back: '#B8D3EA', backHi: '#D5E6F5', backLo: '#9CB9D4', logo: '#A5C1DC' },
  Mattschwarz: { frame: '#2F3134', hi: '#7A7F86', lo: '#111214', back: '#242529', backHi: '#36383D', backLo: '#17181B', logo: '#2E3035' },
  Titangrau:   { frame: '#8D9197', hi: '#DADDE1', lo: '#53565B', back: '#7C8086', backHi: '#999DA3', backLo: '#62666B', logo: '#72767C' },
  Mattweiss:   { frame: '#DAD9D4', hi: '#FBFAF8', lo: '#A4A29B', back: '#EDECE8', backHi: '#FAF9F7', backLo: '#D6D4CE', logo: '#E0DED9' },
  Kieselbeige: { frame: '#C8BAA2', hi: '#F0E8DA', lo: '#978870', back: '#D8CCB8', backHi: '#E9E1D3', backLo: '#C0B29B', logo: '#CCBFA9' },
};

// Reihenfolge wie im Designsystem
export const FARBNAMEN = Object.keys(FARBEN);
