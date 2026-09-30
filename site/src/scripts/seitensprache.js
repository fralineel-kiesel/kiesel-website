// Sprache der Seite im Browser, aus <html lang> (BaseLayout setzt de-CH bzw. en-US).
// Browser-Skripte holen ihren Textabschnitt in beiden Sprachen und wählen hier:
//   import { warenkorb as W_DE } from '../i18n/de.js';
//   import { warenkorb as W_EN } from '../i18n/en.js';
//   const W = waehle(W_DE, W_EN);
// Warum beide statt nachladen? Die Abschnitte sind klein (ein Skript braucht meist 1–2 KB),
// und so steht der Text sofort da, ohne zweite Anfrage und ohne Flackern.
// Ohne document (Prüfskripte mit node, die z.B. warenkorb.js laden): Deutsch.
export const SPRACHE = typeof document !== 'undefined' && document.documentElement.lang.startsWith('en') ? 'en' : 'de';
export const waehle = (de, en) => (SPRACHE === 'en' ? en : de);
