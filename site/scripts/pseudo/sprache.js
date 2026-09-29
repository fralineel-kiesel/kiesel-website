// Pseudo-Sprache: verwandelt alle Texte aus src/i18n/de.js, damit man sieht, was NICHT aus der
// Textdatei kommt (und was bei längeren Texten überläuft). Nur für Prüf-Builds, siehe plugin.mjs.
//
//   klammern: „Kaufen“ → „⟦Kaufen⟧“. Jeder Text, der im fertigen Build ohne ⟦…⟧ dasteht, ist
//             noch fest im Code (npm run pruefe:texte sucht danach).
//   lang:     dazu jedes Wort um rund 30 % länger („Kaufen“ → „⟦Kaufenka⟧“), wie es eine andere
//             Sprache gern ist. Die Wörter bleiben am Stück, damit Überläufe sichtbar werden.
//
// Funktionen (Texte mit Werten) werden umwickelt: Ihr Ergebnis wird verwandelt, die übergebenen
// Werte (Zahlen, Namen) nicht. HTML-Tags und Entitäten in Texten bleiben unangetastet.
export const AUF = '⟦';
export const ZU = '⟧';

function laenger(text) {
  // Nur Text ausserhalb von <…> und &…; verlängern
  return text.replace(/(<[^>]*>|&[#\w]+;)|([\p{L}]+)/gu, (m, tag, wort) => {
    if (tag) return tag;
    const mehr = Math.ceil(wort.length * 0.3);
    return wort + wort.slice(0, mehr).toLowerCase();
  });
}

export function pseudo(wert, modus) {
  if (typeof wert === 'string') return AUF + (modus === 'lang' ? laenger(wert) : wert) + ZU;
  if (typeof wert === 'function') return (...args) => pseudo(wert(...args), modus);
  if (Array.isArray(wert)) return wert.map((w) => pseudo(w, modus));
  if (wert && typeof wert === 'object') return Object.fromEntries(Object.entries(wert).map(([k, w]) => [k, pseudo(w, modus)]));
  return wert; // Zahlen, null, true …
}
