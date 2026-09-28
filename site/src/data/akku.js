// Texte und Zahlen der Akku-Story auf den Modellseiten (AkkuStory.astro).
// Beide Seiten erzählen vom iPhone SE (2016) aus: Nur dort gab es Klinke, SIM-Schlitten
// und Home-Button, die beim Kiesel wegfallen.
//
// Die Schritte laufen beim Scrollen nacheinander ab. von/bis = Anteil der Scroll-Strecke
// (0 = Anfang, 1 = Ende), muss zum Drehbuch in src/scripts/akku-story.js passen.

import { GERAETE, dickePlus } from './geraete.js';

// mAh aus geraete.js (dort und nur dort stehen die Werte)
export const SE_MAH = GERAETE.se.akku;
const K1 = GERAETE.k1.akku, PRO = GERAETE.pro.akku, MINI = GERAETE.mini.akku;

const gemeinsam = [
  { von: 0, bis: 0.145, titel: '2016: das Original', text: `Das iPhone SE hatte ${SE_MAH} mAh. Der Akku teilte sich den Platz mit Kopfhörerbuchse, SIM-Schlitten und Home-Button.` },
  { von: 0.145, bis: 0.3, titel: 'Klinke raus', text: 'Die Buchse unten links fällt weg, samt Elektronik dahinter. Wer Kabel will, nimmt USB-C.', plus: '+ Platz unten' },
  { von: 0.3, bis: 0.46, titel: 'SIM-Schlitten raus', text: 'Nur noch eSIM. Kein Schlitten, keine Feder, kein Auswurfloch an der Seite.', plus: '+ Platz an der Seite' },
  { von: 0.46, bis: 0.6, titel: 'Home-Button raus', text: 'Face ID übernimmt. Die Mechanik unten verschwindet, das Display darf bis an den Rand.', plus: '+ Platz unten' },
];

export const AKKU = {
  k1: {
    mah: K1,
    schritte: [
      ...gemeinsam,
      { von: 0.6, bis: 0.84, titel: 'Der Akku wächst', text: `Die Platine wird kompakter, Motor und Lautsprecher rutschen nach unten. Dazu ${dickePlus('k1')} mm mehr Dicke und Zellen aus Silizium-Kohlenstoff.`, plus: `ca. ${K1} mAh` },
      { von: 0.84, bis: 1, titel: 'Nebeneinander', text: 'Links das SE von 2016, rechts der Kiesel 1, im selben Massstab. Gleiche Grundfläche, fast doppelt so viel Akku.' },
    ],
    // Abschnitt nach der Story (Artboard: „Mehr Akku. Gleiche Hand.“)
    fazit: `Kein Klinkenstecker, kein SIM-Schlitten, kein Home-Button. Dazu eine Zelle aus Silizium-Kohlenstoff und ${dickePlus('k1')} mm mehr Dicke. So passen rund ${K1} mAh in die Grundfläche des SE.`,
    balken: [[GERAETE.se.name, SE_MAH], [GERAETE.k1.name, K1]],
  },
  pro: {
    mah: PRO,
    schritte: [
      ...gemeinsam,
      { von: 0.6, bis: 0.84, titel: 'Der Akku wächst', text: `Das Gehäuse wächst auf die Grösse des 13 mini, die Platine wird kompakter. Dazu ${dickePlus('pro', 'se')} mm mehr Dicke als das SE und Zellen aus Silizium-Kohlenstoff.`, plus: `ca. ${PRO} mAh` },
      { von: 0.84, bis: 1, titel: 'Nebeneinander', text: 'Links das SE von 2016, rechts der Kiesel 1 Pro, im selben Massstab. Etwas grösser, mehr als doppelt so viel Akku.' },
    ],
    fazit: `Kein SIM-Schlitten, eine Zelle aus Silizium-Kohlenstoff und ${dickePlus('pro')} mm mehr Dicke. So passen rund ${PRO} mAh in die Grundfläche des 13 mini.`,
    balken: [[GERAETE.se.name, SE_MAH], [GERAETE.mini.name, MINI], [GERAETE.pro.name, PRO]],
  },
};
