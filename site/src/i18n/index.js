// Sprachen von Kiesel 2.0. Vorerst nur Deutsch; Etappe 9b ergänzt 'en'.
//
// Im Build (Astro-Frontmatter):
//   const t = texte(spracheVon(Astro.url));   t.kaufen.titel, t.farben['sky-blue']
// Im Browser dagegen nie texte() aufrufen, sondern den eigenen Bereich direkt importieren:
//   import { warenkorb as T } from '../i18n/de.js';
// texte() gibt das ganze Wörterbuch zurück, der Bundler könnte dann nichts mehr weglassen.
import * as de from './de.js';

export const STANDARD = 'de';
const WOERTERBUECHER = { de };
export const SPRACHEN = Object.keys(WOERTERBUECHER);

export const texte = (sprache = STANDARD) => WOERTERBUECHER[sprache] ?? WOERTERBUECHER[STANDARD];

// Sprache einer Seite aus ihrer Adresse. Vorerst immer Deutsch; in 9b: /en/… → 'en'.
export const spracheVon = (/* url */) => STANDARD;
