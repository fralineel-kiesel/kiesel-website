// Zahlen der Akku-Story auf den Modellseiten (AkkuStory.astro) und des Akku-Rechners.
// Beide Seiten erzählen vom iPhone SE (2016) aus: Nur dort gab es Klinke, SIM-Schlitten
// und Home-Button, die beim Kiesel wegfallen.
//
// Die Schritte laufen beim Scrollen nacheinander ab. von/bis = Anteil der Scroll-Strecke
// (0 = Anfang, 1 = Ende), muss zum Drehbuch in src/scripts/akku-story.js passen.
//
// Die Texte stehen in der Textdatei (akku in src/i18n/de.js). akkuFuer(T) und rechnerTexte(T)
// bauen sie mit den Zahlen von hier zusammen; AKKU und RECHNER_TEXTE sind die deutsche Fassung.
// /* @__PURE__ */ sagt dem Bundler: Wer nur RECHNER braucht (Akku-Rechner im Browser), bekommt
// die Texte nicht mitgeliefert.

import { GERAETE, dickePlus } from './geraete.js';
import { akku as DE } from '../i18n/de.js';
import { prozent } from '../lib/format.js';

// mAh aus geraete.js (dort und nur dort stehen die Werte)
export const SE_MAH = GERAETE.se.akku;
const K1 = GERAETE.k1.akku, PRO = GERAETE.pro.akku, MINI = GERAETE.mini.akku;

// Schrittgrenzen der Story: vier gemeinsame, dann zwei je Modell
const GRENZEN = [[0, 0.145], [0.145, 0.3], [0.3, 0.46], [0.46, 0.6], [0.6, 0.84], [0.84, 1]];

export function akkuFuer(T = DE) {
  const S = T.story;
  const schritt = (i, text) => ({ von: GRENZEN[i][0], bis: GRENZEN[i][1], ...text });
  const gemeinsam = [
    schritt(0, { titel: S.original.titel, text: S.original.text(SE_MAH) }),
    schritt(1, S.klinke),
    schritt(2, S.sim),
    schritt(3, S.home),
  ];
  return {
    k1: {
      mah: K1,
      schritte: [
        ...gemeinsam,
        schritt(4, { titel: S.waechst.titel, text: S.waechst.k1(dickePlus('k1')), plus: S.waechst.plus(K1) }),
        schritt(5, S.nebeneinander.k1),
      ],
      // Abschnitt nach der Story (Artboard: „Mehr Akku. Gleiche Hand.“)
      fazit: T.fazit.k1(dickePlus('k1'), K1),
      balken: [[GERAETE.se.name, SE_MAH], [GERAETE.k1.name, K1]],
    },
    pro: {
      mah: PRO,
      schritte: [
        ...gemeinsam,
        schritt(4, { titel: S.waechst.titel, text: S.waechst.pro(dickePlus('pro', 'se')), plus: S.waechst.plus(PRO) }),
        schritt(5, S.nebeneinander.pro),
      ],
      fazit: T.fazit.pro(dickePlus('pro'), PRO),
      balken: [[GERAETE.se.name, SE_MAH], [GERAETE.mini.name, MINI], [GERAETE.pro.name, PRO]],
    },
  };
}
export const AKKU = /* @__PURE__ */ akkuFuer();

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
  // Regler: [Schlüssel, Maximum in Stunden], Schritt 0.5 h. Beschriftung: akkuRechner.regler
  regler: [['surf', 10], ['video', 6], ['music', 8], ['cam', 5], ['game', 4]],
  schritt: 0.5,
  // Typische Tage (Stunden pro Tätigkeit), Kennung → Werte. „normal“ ist die Vorgabe.
  // Namen („Ruhiger Tag“ …): akkuRechner.tage in der Textdatei
  tage: {
    quiet: { surf: 1.5, video: 0.5, music: 0.5, cam: 0, game: 0 },
    normal: { surf: 3, video: 1.5, music: 1, cam: 0.5, game: 0 },
    busy: { surf: 5, video: 2.5, music: 1.5, cam: 1, game: 1 },
    holiday: { surf: 2, video: 1, music: 1, cam: 3, game: 0 },
  },
  vorgabe: 'normal',
};

// Texte unter dem Rechner (Artboard „Akku-Rechner“), aus den Zahlen oben zusammengesetzt
export function rechnerTexte(T = DE, sprache = 'de') {
  const R = RECHNER;
  const p = (x) => prozent(x, sprache);
  const weniger = (f) => Math.round((1 - f) * 100);
  return {
    soWird: [
      T.rechner.verbrauch({ surf: p(R.verbrauch.surf), video: p(R.verbrauch.video), music: p(R.verbrauch.music), cam: p(R.verbrauch.cam), game: p(R.verbrauch.game), standby: p(R.standby) }),
      T.rechner.pro({ mehr: p(Math.round((GERAETE.pro.akku / GERAETE.k1.akku - 1) * 100)), surf: p(weniger(R.proFaktor.surf)), cam: p(weniger(R.proFaktor.cam)), game: p(weniger(R.proFaktor.game)) }),
    ],
    gutZuWissen: [
      T.rechner.vorsprung,
      T.rechner.se(p(Math.round((1 - SE_MAH / K1) * 100)), R.seFaktor),
    ],
  };
}
export const RECHNER_TEXTE = /* @__PURE__ */ rechnerTexte();
