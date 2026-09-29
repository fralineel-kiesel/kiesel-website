// Astro-Konfiguration für Kiesel 2.0
// Doku: https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import { pseudoPlugin } from './scripts/pseudo/plugin.mjs';

// Pseudo-Sprache (nur zum Prüfen, Etappe 9a): KIESEL_PSEUDO=klammern|lang verwandelt alle Texte
// aus src/i18n/de.js (⟦Kaufen⟧, bzw. 30 % länger) und baut nach dist-pseudo-<modus>/ statt dist/.
// Nie im Deployment: Der Workflow setzt den Schalter nicht, auf GitHub Actions bricht der Build
// mit Schalter sogar ab, und pruefe:texte prüft, dass in dist/ nichts davon steckt.
const PSEUDO = process.env.KIESEL_PSEUDO || null;
if (PSEUDO && process.env.GITHUB_ACTIONS) throw new Error('KIESEL_PSEUDO ist nur für lokale Prüf-Builds da, nie auf GitHub Actions.');

export default defineConfig({
  // Volle Adresse der Website. Astro braucht sie für absolute Links (z.B. Link-Vorschau).
  site: 'https://fralineel-kiesel.github.io',

  // Die neue Seite liegt vorerst in einem Unterordner neben der alten:
  // https://fralineel-kiesel.github.io/kiesel-website/v2/
  // Alle Links und Dateien bekommen diesen Vorsatz automatisch (siehe src/lib/pfad.js).
  base: '/kiesel-website/v2',

  // Jede Seite ist ein Ordner mit index.html, die Adresse endet immer mit "/".
  // Beispiel: src/pages/kaufen.astro  →  dist/kaufen/index.html  →  /kaufen/
  trailingSlash: 'always',
  build: { format: 'directory' },

  // Die Entwickler-Leiste von Astro unten im Browser brauchen wir nicht.
  devToolbar: { enabled: false },

  // three.js (3D-Bühne der Startseite) ist allein rund 600 KB gross (150 KB gepackt) und
  // liegt bewusst in einer eigenen Datei, die nur bei Bedarf nachgeladen wird. Vite warnt
  // ab 500 KB; die Grenze liegt darum etwas höher, damit echte Ausreisser auffallen.
  vite: { build: { chunkSizeWarningLimit: 700 }, plugins: PSEUDO ? [pseudoPlugin(PSEUDO)] : [] },
  ...(PSEUDO ? { outDir: `./dist-pseudo-${PSEUDO}` } : {}),
});
