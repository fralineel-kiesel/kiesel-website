// Der Wächter der 3D-Bühne: entscheidet aus den gemessenen Bildzeiten, ob 3D aufgeben soll.
//
// Eigene Datei ohne three.js und ohne Browser, damit man die Regeln mit vorgegebenen,
// künstlichen Bildzeiten prüfen kann (scripts/pruefe-waechter.mjs), statt echt zu messen.
// Echte Messungen hängen an der Last des Testrechners und wären darum wackelig.
//
//   const w = neuerWaechter();
//   w.bild(dauer)  → null (weiter) oder 'zu-langsam' (auf 2D wechseln)
//   w.median       → Median der gezählten Bilder, sobald entschieden (sonst null)
//
// Regeln (Grenzen siehe unten):
//   Bilder 1–3:  Aufwärmen, zählen nicht (Texturen werden hochgeladen)
//   Bilder 4–15: Liegt der Median über 40 ms (unter 25 fps) → 2D.
//                Median = die mittlere Dauer, wenn man alle der Grösse nach ordnet. Ein
//                einzelner Hänger (z.B. Speicherbereinigung) verschiebt ihn kaum.
//   Notbremse:   3 Bilder hintereinander über 100 ms → sofort 2D.
//   Danach:      Der Wächter schweigt (einmal entschieden ist entschieden).
export const AUFWAERMEN = 3;
export const BILDER = 15;
export const ZU_LANGSAM_MS = 40;  // typische Zeit pro Bild, ab der wir auf 2D wechseln (= unter 25 fps)
export const NOTBREMSE_MS = 100;  // so lange Bilder, 3 × hintereinander: sofort 2D
export const NOTBREMSE_BILDER = 3;

export function neuerWaechter() {
  const zeiten = [];
  let gezaehlt = 0, zaeh = 0, fertig = false;
  const w = {
    median: null,
    bild(dauer) {
      if (fertig) return null;
      gezaehlt++;
      if (gezaehlt <= AUFWAERMEN) return null;
      zeiten.push(dauer);
      zaeh = dauer > NOTBREMSE_MS ? zaeh + 1 : 0;
      if (zaeh >= NOTBREMSE_BILDER) { fertig = true; return 'zu-langsam'; }
      if (gezaehlt === BILDER) {
        fertig = true;
        w.median = zeiten.sort((x, y) => x - y)[Math.floor(zeiten.length / 2)];
        if (w.median > ZU_LANGSAM_MS) return 'zu-langsam';
      }
      return null;
    },
  };
  return w;
}
