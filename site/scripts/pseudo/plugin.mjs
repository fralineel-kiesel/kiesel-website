// Vite-Plugin für die Pseudo-Sprache (nur aktiv mit KIESEL_PSEUDO, siehe astro.config.mjs).
// Ersetzt beim Bauen jede Textdatei in src/i18n/de/ durch eine Hülle: gleiche Exporte, aber
// jeder Text durch pseudo() verwandelt. Die echte Datei wird als „…?roh“ darunter geladen.
// Nichts in src/ weiss davon; ohne den Schalter ist das Plugin gar nicht eingebunden.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const DE_ORDNER = path.resolve(hier, '..', '..', 'src', 'i18n', 'de');
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
      if (path.dirname(echt) !== DE_ORDNER || !echt.endsWith('.js')) return null;
      if (abfrage.includes('roh')) return fs.readFileSync(echt, 'utf8');
      const namen = [...fs.readFileSync(echt, 'utf8').matchAll(/^export const (\w+)/gm)].map((m) => m[1]);
      return [
        `import * as roh from ${JSON.stringify(echt + '?roh')};`,
        `import { pseudo } from ${JSON.stringify(SPRACHE)};`,
        ...namen.map((n) => `export const ${n} = pseudo(roh.${n}, ${JSON.stringify(modus)});`),
      ].join('\n');
    },
  };
}
