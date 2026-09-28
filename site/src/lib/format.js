// Preise im Kiesel-Format: CHF 1’200.–
// Das Tausender-Zeichen ist ein typografischer Apostroph (’), wie in der Schweiz üblich.
// Ganze Franken enden auf „.–“, Beträge mit Rappen zeigen zwei Stellen:
//   chf(1759)    → CHF 1’759.–
//   chf(131.8)   → CHF 131.80
//   chf(1234.5)  → CHF 1’234.50
// Wer in Rappen rechnet (Ganzzahlen, exakt), nimmt chfRappen(13180) → CHF 131.80.
export function chf(betrag) {
  return chfRappen(Math.round(betrag * 100));
}

export function chfRappen(rappen) {
  const minus = rappen < 0 ? '−' : '';
  const r = Math.abs(rappen);
  const franken = String(Math.floor(r / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  const rest = r % 100;
  return `CHF ${minus}${franken}.${rest === 0 ? '–' : String(rest).padStart(2, '0')}`;
}
