// Astro-Konfiguration für Kiesel 2.0
// Doku: https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';

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
  vite: { build: { chunkSizeWarningLimit: 700 } },
});
