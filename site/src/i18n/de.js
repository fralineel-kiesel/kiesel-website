// Alle sichtbaren Texte von Kiesel 2.0 auf Deutsch (Schweizer Hochdeutsch, „ss“ statt „ß“).
// Einziger Ort für Texte. Etappe 9b legt daneben en.js mit denselben Schlüsseln an.
//
// Aufbau
//   - Ein benannter Export pro Bereich: Gerüst (geruest, navigation …), Seite (kaufen, faq …),
//     Datenbestand (technik, faqFragen …) oder Zeichnung (zeichnung). Browser-Skripte importieren
//     nur ihren Bereich: import { warenkorb as W } from '../i18n/de.js'.
//   - Die Texte selbst stehen in src/i18n/de/, eine Datei pro Themenbereich; diese Datei reicht
//     sie nur weiter. Warum aufgeteilt? Der Bundler packt Code pro Datei in Pakete. Als eine
//     grosse Datei landete das ganze Wörterbuch (17 KB, 7 KB gepackt) auf jeder Seite, weil der
//     Warenkorb überall läuft. Aufgeteilt nach den Browser-Skripten, die sie brauchen, lädt jede
//     Seite nur ihre Teile. Neue Texte kommen in die passende Datei in src/i18n/de/.
//   - Schlüssel auf Deutsch in camelCase, nach Rolle benannt (huelleDazu), nicht nach Wortlaut.
//   - Keine Zahlen: Texte mit Werten sind Funktionen und bekommen die Werte fertig formatiert
//     (lib/format.js). Preise stehen nur in data/preise.js, Gerätewerte nur in data/geraete.js.
//   - Plural und Grammatik stecken ebenfalls in Funktionen, weil jede Sprache das anders löst.

export * from './de/gemeinsam.js';
export * from './de/kaufen.js';
export * from './de/modelle.js';
export * from './de/akku.js';
export * from './de/kamera.js';
export * from './de/zeichnung.js';
export * from './de/vergleichen.js';
export * from './de/faq.js';
export * from './de/funktionen.js';
export * from './de/zubehoer.js';
