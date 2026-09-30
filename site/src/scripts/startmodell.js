// Welches Modell zeigt die Startseite (3D-Bühne, Knöpfe)? Letzte Wahl in localStorage.
//
// KOPF_SKRIPT kommt als Inline-Skript in den <head> der Startseite (slot="kopf") und setzt
// <html data-held-modell="k1|pro">, bevor irgendetwas gezeichnet wird. CSS (global.css) zeigt
// damit nur die passenden Knöpfe und die passende 2D-Grafik. Stünde das Skript erst bei der
// Bühne, könnte der Browser auf einer langsamen Leitung die Knöpfe darüber schon zeichnen,
// dann würden sie sichtbar umspringen.
// Erster Besuch, gesperrter Speicher, ungültiger Wert: STANDARD. Alles in try/catch.
import { KIESEL_IDS } from '../data/geraete.js';

export const SPEICHER = 'kiesel-startmodell';
export const STANDARD = 'pro';

export const KOPF_SKRIPT = `(function () {
  var m = ${JSON.stringify(STANDARD)};
  try {
    var w = localStorage.getItem(${JSON.stringify(SPEICHER)});
    if (${JSON.stringify(KIESEL_IDS)}.indexOf(w) >= 0) m = w;
  } catch (e) {}
  document.documentElement.dataset.heldModell = m;
})();`;

// Wahl merken. Gesperrter Speicher: gilt dann nur für diesen Besuch, ohne Fehlermeldung.
export function merkeStartmodell(id) {
  try { localStorage.setItem(SPEICHER, id); } catch { /* gesperrt */ }
}
