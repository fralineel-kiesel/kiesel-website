// „In den Warenkorb“ für die Kiesel-Hülle (/zubehoer/ und /zubehoer/huelle/).
// Legt nur Modell und Hüllenfarbe hinein (huellenArtikel), zeigt am Knopf kurz „Im Warenkorb“
// und sagt es dem Screenreader an. Der Zähler in der Kopfzeile hört auf das Warenkorb-Ereignis.
import { hinzufuegen } from './warenkorb.js';
import { huellenArtikel } from '../data/zubehoer.js';
import { HUELLE_PREIS } from '../data/modelle.js';

const MODELLNAME = { k1: 'Kiesel 1', pro: 'Kiesel 1 Pro' };

export function huelleKaufen(knopf, modell, farbe, ansage) {
  const ok = hinzufuegen(huellenArtikel(modell, farbe, HUELLE_PREIS));
  if (ansage) {
    ansage.textContent = ok
      ? `Kiesel-Hülle für ${MODELLNAME[modell]} in ${farbe} liegt im Warenkorb.`
      : 'Der Warenkorb liess sich nicht speichern. Ist das ein privates Fenster?';
  }
  if (!ok) return false;
  // Rückmeldung am Knopf: Text kurz tauschen, Breite bleibt (kein Springen)
  const text = knopf.querySelector('[data-knopftext]') ?? knopf;
  clearTimeout(knopf._zurueck);
  text.dataset.alt ??= text.textContent;
  text.textContent = 'Im Warenkorb ✓';
  knopf._zurueck = setTimeout(() => { text.textContent = text.dataset.alt; }, 2000);
  return true;
}
