// „In den Warenkorb“ für die Kiesel-Hülle (/zubehoer/, /zubehoer/huelle/ und Startseite).
// Legt nur Modell und Hüllenfarbe hinein (huellenArtikel), zeigt am Knopf kurz „Im Warenkorb“
// und sagt es dem Screenreader an. Der Zähler in der Kopfzeile hört auf das Warenkorb-Ereignis.
// Ist localStorage gesperrt, merkt sich der Warenkorb die Hülle trotzdem (siehe warenkorb.js).
import { hinzufuegen } from './warenkorb.js';
import { huellenArtikel } from '../data/zubehoer.js';
import { PREISE, MAX_ANZAHL } from '../data/preise.js';
import { farben as FARBNAME, warenkorb as W } from '../i18n/de.js';

export function huelleKaufen(knopf, modell, farbe, ansage) {
  const ergebnis = hinzufuegen(huellenArtikel(modell, farbe));
  if (!ergebnis) return false;
  if (ansage) {
    ansage.textContent = ergebnis.gekappt
      ? W.huelleVoll(PREISE[modell].name, FARBNAME[farbe], MAX_ANZAHL)
      : W.huelleDrin(PREISE[modell].name, FARBNAME[farbe]);
  }
  // Rückmeldung am Knopf: Text kurz tauschen, Breite bleibt (kein Springen)
  const text = knopf.querySelector('[data-knopftext]') ?? knopf;
  clearTimeout(knopf._zurueck);
  text.dataset.alt ??= text.textContent;
  text.textContent = W.imWarenkorb;
  knopf._zurueck = setTimeout(() => { text.textContent = text.dataset.alt; }, 2000);
  return true;
}
