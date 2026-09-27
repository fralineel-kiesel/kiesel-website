// Preise im Kiesel-Format: CHF 1’200.–
// Das Tausender-Zeichen ist ein typografischer Apostroph (’), wie in der Schweiz üblich.
export function chf(betrag) {
  const zahl = String(betrag).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return `CHF ${zahl}.–`;
}
