// „In den Warenkorb“ für die Kiesel-Hülle (/zubehoer/, /zubehoer/huelle/ und Startseite).
// Legt nur Modell und Hüllenfarbe hinein (huellenArtikel), zeigt am Knopf kurz „Im Warenkorb“
// und sagt es dem Screenreader an. Der Zähler in der Kopfzeile hört auf das Warenkorb-Ereignis.
// Ist localStorage gesperrt, merkt sich der Warenkorb die Hülle trotzdem (siehe warenkorb.js).
import { hinzufuegen } from './warenkorb.js';
import { huellenArtikel } from '../data/zubehoer.js';
import { PREISE, MAX_ANZAHL } from '../data/preise.js';

export function huelleKaufen(knopf, modell, farbe, ansage) {
  const ergebnis = hinzufuegen(huellenArtikel(modell, farbe));
  if (!ergebnis) return false;
  if (ansage) {
    ansage.textContent = ergebnis.gekappt
      ? `Von der Kiesel-Hülle für ${PREISE[modell].name} in ${farbe} liegen schon ${MAX_ANZAHL} im Warenkorb, mehr geht nicht.`
      : `Kiesel-Hülle für ${PREISE[modell].name} in ${farbe} liegt im Warenkorb.`;
  }
  // Rückmeldung am Knopf: Text kurz tauschen, Breite bleibt (kein Springen)
  const text = knopf.querySelector('[data-knopftext]') ?? knopf;
  clearTimeout(knopf._zurueck);
  text.dataset.alt ??= text.textContent;
  text.textContent = 'Im Warenkorb ✓';
  knopf._zurueck = setTimeout(() => { text.textContent = text.dataset.alt; }, 2000);
  return true;
}
