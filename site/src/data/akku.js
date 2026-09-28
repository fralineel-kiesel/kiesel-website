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

// ---------------------------------------------------------------------------------------------
// Akku-Rechner (/akku-rechner/, akku_js in design/generator/gen4.py, Werte 1:1 übernommen).
// Der Tag läuft von 07:00 (100 %) bis 23:00, das sind 16 Stunden. Was nicht eingestellt ist,
// ist Standby. Gerechnet wird in lib/akku-rechner.js.
export const RECHNER = {
  start: 7,
  ende: 23,
  // Verbrauch des Kiesel 1 in Prozent pro Stunde
  verbrauch: { surf: 10, video: 7, music: 2, cam: 16, game: 20 },
  standby: 0.6,
  // Kiesel 1 Pro: Faktor auf den Verbrauch des Kiesel 1 (Vapor Chamber: Kamera und Spiele sparsamer)
  proFaktor: { surf: 0.8, video: 0.8, music: 0.8, cam: 0.72, game: 0.75, idle: 0.8 },
  // iPhone SE (2016): rund 46 % weniger Akku, darum 1.85-facher Verbrauch
  seFaktor: 1.85,
  // Regler: [Schlüssel, Beschriftung, Maximum in Stunden], Schritt 0.5 h
  regler: [['surf', 'Surfen und Social Media', 10], ['video', 'Video', 6], ['music', 'Musik und Podcasts', 8], ['cam', 'Kamera und Navigation', 5], ['game', 'Spielen', 4]],
  schritt: 0.5,
  // Typische Tage (Stunden pro Tätigkeit). „Normal“ ist die Vorgabe.
  tage: {
    'Ruhiger Tag': { surf: 1.5, video: 0.5, music: 0.5, cam: 0, game: 0 },
    'Normal': { surf: 3, video: 1.5, music: 1, cam: 0.5, game: 0 },
    'Viel unterwegs': { surf: 5, video: 2.5, music: 1.5, cam: 1, game: 1 },
    'Ferientag': { surf: 2, video: 1, music: 1, cam: 3, game: 0 },
  },
  vorgabe: 'Normal',
};

// Texte unter dem Rechner (Artboard „Akku-Rechner“), aus den Zahlen oben zusammengesetzt
const R = RECHNER;
const prozent = (x) => `${x} %`;
const weniger = (f) => Math.round((1 - f) * 100);
export const RECHNER_TEXTE = {
  soWird: [
    `Verbrauch pro Stunde beim Kiesel 1: Surfen ${prozent(R.verbrauch.surf)}, Video ${prozent(R.verbrauch.video)}, Musik ${prozent(R.verbrauch.music)}, Kamera und Navigation ${prozent(R.verbrauch.cam)}, Spielen ${prozent(R.verbrauch.game)}, Standby ${prozent(R.standby)}. Die Stunden verteilen sich gleichmässig über den Tag.`,
    `Der Pro hat ${Math.round((GERAETE.pro.akku / GERAETE.k1.akku - 1) * 100)} % mehr Akku. Sein grösseres Display kostet etwas, dafür arbeitet der Chip dank Vapor Chamber bei Kamera und Spielen kühler und effizienter. Unterm Strich braucht er ${weniger(R.proFaktor.surf)} % weniger pro Stunde, bei Kamera ${weniger(R.proFaktor.cam)} % und bei Spielen ${weniger(R.proFaktor.game)} % weniger.`,
  ],
  gutZuWissen: [
    'Je mehr du das Handy nutzt, desto grösser wird der Vorsprung des Pro. An einem ruhigen Tag liegen beide nah beieinander, an einem langen Ferientag zählt jedes Prozent.',
    `Das SE von 2016 dient als Vergleich. Es hat rund ${Math.round((1 - SE_MAH / K1) * 100)} % weniger Akku als der Kiesel 1, das Modell rechnet es deshalb mit ${R.seFaktor}-fachem Verbrauch.`,
  ],
};
