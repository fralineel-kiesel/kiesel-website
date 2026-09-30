// Zeichnet die Handys in den Menüs (MenueHandy.astro) beim ersten Öffnen.
//
// Der Zeichen-Motor wird erst dann per import() geholt: Der Browser lädt ihn als eigene Datei
// nach, beim Seitenaufruf ist er nicht dabei. vorwaermen() startet nur das Laden (z.B. wenn die
// Maus auf „Handys“ zeigt), damit das Öffnen danach ohne Wartezeit geht.
//
// Jede Zeichnung bekommt von handy() über uid() ein eigenes ID-Präfix für ihre Verläufe und
// Filter. Sonst würde ein Menü-Handy die Farben eines anderen Handys auf der Seite übernehmen.
import { zeichnung as Z_DE } from '../i18n/de.js';
import { zeichnung as Z_EN } from '../i18n/en.js';
import { waehle, SPRACHE } from './seitensprache.js';

const ZEICHNUNG = waehle(Z_DE, Z_EN);
let motor = null;
const lade = () => (motor ??= import('../lib/kiesel-draw/phone.js'));

export function vorwaermen() {
  lade().catch(() => { motor = null; }); // offline: beim Öffnen noch einmal versuchen
}

export async function zeichneMenueHandys(wurzel) {
  const leer = [...wurzel.querySelectorAll('[data-menue-handy]:not([data-gezeichnet])')];
  if (!leer.length) return;
  leer.forEach((el) => { el.dataset.gezeichnet = ''; });
  try {
    const { handy } = await lade();
    for (const el of leer) {
      el.innerHTML = handy({ texte: ZEICHNUNG, sprache: SPRACHE, ansicht: 'vorne', modell: el.dataset.menueHandy, farbe: el.dataset.farbe, hoehe: Number(el.dataset.hoehe), boden: false });
    }
  } catch {
    // Laden fehlgeschlagen (z.B. offline): Platz bleibt leer, beim nächsten Öffnen neuer Versuch
    motor = null;
    leer.forEach((el) => { delete el.dataset.gezeichnet; });
  }
}
