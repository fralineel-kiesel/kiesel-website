// Vite-Plugin für die Pseudo-Sprache (nur aktiv mit KIESEL_PSEUDO, siehe astro.config.mjs).
// Ersetzt beim Bauen jede Textdatei in src/i18n/de/ und src/i18n/en/ durch eine Hülle: gleiche
// Exporte, aber
// jeder Text durch pseudo() verwandelt. Die echte Datei wird als „…?roh“ darunter geladen.
// Beide Sprachen, weil auf jeder Seite auch Texte der anderen stehen (Sprachumschalter,
// Sprach-Hinweis). Sprachcodes (sprache.html/og/hreflang) sind keine Texte und bleiben, sonst
// stimmten lang und hreflang im Prüf-Build nicht mehr.
// Nichts in src/ weiss davon; ohne den Schalter ist das Plugin gar nicht eingebunden.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const ORDNER = ['de', 'en'].map((s) => path.resolve(hier, '..', '..', 'src', 'i18n', s));
const CODES = { sprache: ['html', 'og', 'hreflang'] };
const SPRACHE = path.join(hier, 'sprache.js');
export const MODI = ['klammern', 'lang'];

export function pseudoPlugin(modus) {
  if (!MODI.includes(modus)) throw new Error(`KIESEL_PSEUDO=${modus}: erlaubt sind ${MODI.join(', ')}`);
  return {
    name: 'kiesel-pseudo',
    enforce: 'pre',
    load(id) {
      const [datei, abfrage = ''] = id.split('?');
      const echt = path.resolve(datei);
      if (!ORDNER.includes(path.dirname(echt)) || !echt.endsWith('.js')) return null;
      if (abfrage.includes('roh')) return fs.readFileSync(echt, 'utf8');
      const namen = [...fs.readFileSync(echt, 'utf8').matchAll(/^export const (\w+)/gm)].map((m) => m[1]);
      return [
        `import * as roh from ${JSON.stringify(echt + '?roh')};`,
        `import { pseudo } from ${JSON.stringify(SPRACHE)};`,
        ...namen.map((n) => `export const ${n} = pseudo(roh.${n}, ${JSON.stringify(modus)});`
          + (CODES[n] ?? []).map((k) => `\n${n}.${k} = roh.${n}.${k};`).join('')),
      ].join('\n');
    },
  };
}
