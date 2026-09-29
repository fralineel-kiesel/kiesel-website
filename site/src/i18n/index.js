// Sprachen von Kiesel 2.0: Deutsch (Standard, Adressen ohne Vorsatz) und Englisch (/en/…).
//
// Im Build (Astro-Frontmatter):
//   const sprache = spracheVon(Astro.url);   'de' | 'en'
//   const t = texte(sprache);                t.kaufen.titel, t.farben['sky-blue']
// Im Browser dagegen nie texte() aufrufen, sondern den eigenen Bereich in beiden Sprachen
// importieren und nach der Sprache der Seite wählen (scripts/seitensprache.js):
//   import { warenkorb as DE } from '../i18n/de.js';
//   import { warenkorb as EN } from '../i18n/en.js';
//   const T = waehle(DE, EN);
// texte() gibt das ganze Wörterbuch zurück, der Bundler könnte dann nichts mehr weglassen.
import * as de from './de.js';
import * as en from './en.js';
import { spracheDerAdresse } from '../lib/pfad.js';

export const STANDARD = 'de';
const WOERTERBUECHER = { de, en };
export const SPRACHEN = Object.keys(WOERTERBUECHER);

export const texte = (sprache = STANDARD) => WOERTERBUECHER[sprache] ?? WOERTERBUECHER[STANDARD];

// Sprache einer Seite aus ihrer Adresse: …/v2/en/… → 'en', sonst 'de'
export const spracheVon = (url) => (url ? spracheDerAdresse(url.pathname) : STANDARD);

// Die jeweils andere Sprache (Sprachumschalter, Sprach-Hinweis)
export const andereSprache = (sprache) => (sprache === 'en' ? 'de' : 'en');
