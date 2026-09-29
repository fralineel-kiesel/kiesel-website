// Sprach-Hinweis (Etappe 9b): Wer „weg“ geklickt oder die Sprache selbst gewählt hat, bekommt
// ihn nicht mehr. Gespeichert in localStorage["kiesel-sprachhinweis"] = "weg"; ist localStorage
// gesperrt, in sessionStorage, sonst gar nicht (dann gilt es nur für diese Seite). Nie ein Fehler.
const SCHLUESSEL = 'kiesel-sprachhinweis';
const speicher = [() => localStorage, () => sessionStorage];

export function sprachEntscheidGemerkt() {
  for (const s of speicher) {
    try { if (s().getItem(SCHLUESSEL) === 'weg') return true; } catch { /* gesperrt */ }
  }
  return false;
}

export function merkeSprachEntscheid() {
  for (const s of speicher) {
    try { s().setItem(SCHLUESSEL, 'weg'); return; } catch { /* gesperrt: nächster Speicher */ }
  }
}

// Bevorzugte Sprache des Browsers (erste in navigator.languages): 'de', 'en' oder null
export function browserSprache() {
  const erste = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase();
  return erste.startsWith('en') ? 'en' : erste.startsWith('de') ? 'de' : null;
}
