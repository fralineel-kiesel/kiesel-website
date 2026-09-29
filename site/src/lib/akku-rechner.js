// Rechnung des Akku-Rechners (akku_js in design/generator/gen4.py, Schritt für Schritt übernommen).
// Reine Funktionen, laufen im Build (Anfangszustand „Normal“ im HTML) und im Browser.
//
//   rechne({ surf: 3, video: 1.5, music: 1, cam: 0.5, game: 0 })
//   → { fehler, summe, schlagzeile, balken: [Pro, Kiesel 1, SE], linien, label, … }
//
// Das Modell:
//   Verbrauch Kiesel 1 = Σ Stunden × Verbrauch pro Stunde + übrige Stunden × Standby
//   Pro = dasselbe mit den Pro-Faktoren, SE = Kiesel 1 × 1.85
//   Über 100 % Verbrauch: leer um 07:00 + 16 h × 100 / Verbrauch (gleichmässig verteilt)
//   Tage = 100 / (Tagesverbrauch + 8 Nachtstunden Standby)
import { RECHNER } from '../data/akku.js';
import { GERAETE } from '../data/geraete.js';
import { zahl, uhrzeit, geschuetzt, prozent } from './format.js';
import { akkuRechner as DE } from '../i18n/de.js';

export { uhrzeit, geschuetzt };

const R = RECHNER;
export const STUNDEN = R.ende - R.start; // 16
export const TAETIGKEITEN = Object.keys(R.verbrauch);

// „3.0 h“ (immer eine Nachkommastelle). uhrzeit() und geschuetzt() stehen in lib/format.js.
export const stunden = (x, sprache = 'de') => zahl(x, 1, sprache) + ' h';

// Welcher typische Tag (Kennung) passt genau zu diesen Werten? (sonst null)
export const welcherTag = (v) => Object.keys(R.tage).find((name) => TAETIGKEITEN.every((k) => R.tage[name][k] === v[k])) ?? null;

// Werte aufräumen: Zahl, im Raster von 0.5, zwischen 0 und Maximum des Reglers
export function saubere(v = {}) {
  const aus = {};
  for (const [k, max] of R.regler) {
    const x = Number(v[k]);
    aus[k] = Number.isFinite(x) ? Math.min(max, Math.max(0, Math.round(x / R.schritt) * R.schritt)) : R.tage[R.vorgabe][k];
  }
  return aus;
}

function ergebnis(verbrauch, nachtStandby) {
  return {
    rest: Math.max(0, 100 - verbrauch),
    leer: verbrauch >= 100 ? R.start + STUNDEN * 100 / verbrauch : null,
    tage: 100 / (verbrauch + 8 * nachtStandby),
  };
}

// Diagramm (Artboard: 620 × 300). Breite anpassbar fürs Handy; bei 620 entstehen genau die
// Pfade des Artboards.
export const diagrammMasse = (breite = 620) => ({
  breite, hoehe: 300,
  X: (h) => 50 + (h - R.start) * (breite - 80) / STUNDEN,
  Y: (p) => 20 + (100 - p) * 2.4,
});
export function linie(r, breite = 620) {
  const { X, Y } = diagrammMasse(breite);
  return r.leer ? `M${X(R.start)} ${Y(100)} L${X(r.leer).toFixed(1)} ${Y(0)} L${X(R.ende)} ${Y(0)}` : `M${X(R.start)} ${Y(100)} L${X(R.ende)} ${Y(r.rest).toFixed(1)}`;
}

// T = Texte (Abschnitt akkuRechner der Textdatei), sprache = Zahlen- und Uhrzeitformat
export function rechne(werte, T = DE, sprache = 'de') {
  const v = saubere(werte);
  const summe = TAETIGKEITEN.reduce((a, k) => a + v[k], 0);
  const tag = welcherTag(v);
  const namen = { pro: GERAETE.pro.name, k1: GERAETE.k1.name, se: GERAETE.se.name };
  if (summe > STUNDEN) {
    return {
      werte: v, summe, tag, fehler: T.zuViel(zahl(summe, undefined, sprache), uhrzeit(R.start, sprache), uhrzeit(R.ende, sprache), STUNDEN),
      schlagzeile: '–',
      balken: ['pro', 'k1', 'se'].map((id) => ({ id, name: namen[id], text: '–', prozent: 0, farbe: 'line', leer: false, tage: '' })),
      ergebnisse: null, label: T.keineBerechnung,
    };
  }
  const frei = STUNDEN - summe;
  const vK = TAETIGKEITEN.reduce((a, k) => a + v[k] * R.verbrauch[k], 0) + frei * R.standby;
  const vP = TAETIGKEITEN.reduce((a, k) => a + v[k] * R.verbrauch[k] * R.proFaktor[k], 0) + frei * R.standby * R.proFaktor.idle;
  const vS = vK * R.seFaktor;
  const e = {
    k1: ergebnis(vK, R.standby),
    pro: ergebnis(vP, R.standby * R.proFaktor.idle),
    se: ergebnis(vS, R.standby * R.seFaktor),
  };
  const text = (r) => (r.leer ? T.leerUm(uhrzeit(r.leer, sprache)) : prozent(Math.round(r.rest), sprache));
  // Tage auf eine Stelle, ohne „.0“ (1.8, 2); 1.0 heisst „1 Tag“
  const tageText = (r) => { const d = Number(r.tage.toFixed(1)); return T.reicht(zahl(d, undefined, sprache), d === 1); };
  // farbe: Name einer CSS-Variable (unter 20 % immer --heat)
  const balken = (id, farbe) => ({ id, name: namen[id], text: text(e[id]), prozent: Number(e[id].rest.toFixed(1)), farbe: e[id].rest < 20 ? 'heat' : farbe, leer: !!e[id].leer, tage: tageText(e[id]) });
  const diff = Math.round(e.pro.rest) - Math.round(e.k1.rest);
  const schlagzeile = e.k1.leer
    ? T.schlapp(namen.k1, uhrzeit(e.k1.leer, sprache), e.pro.leer ? uhrzeit(e.pro.leer, sprache) : null, prozent(Math.round(e.pro.rest), sprache))
    : T.mehrUebrig(diff);
  return {
    werte: v, summe, tag, fehler: '', schlagzeile, ergebnisse: e, verbrauch: { k1: vK, pro: vP, se: vS },
    balken: [balken('pro', 'accent'), balken('k1', 'ink'), balken('se', 'muted')],
    label: T.label(uhrzeit(R.ende, sprache), [[namen.pro, text(e.pro)], [namen.k1, text(e.k1)], ['iPhone SE', text(e.se)]]),
  };
}

// Das ganze Diagramm als SVG-Text (Gitter, Achsen, drei Linien). breite: 620 (Desktop) oder schmaler.
export function diagramm(erg, breite = 620, sprache = 'de') {
  const { X, hoehe } = diagrammMasse(breite);
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += `<line class="gitter" x1="50" y1="${20 + i * 60}" x2="${breite - 30}" y2="${20 + i * 60}"></line>`;
    s += `<text class="achse" x="40" y="${24 + i * 60}" text-anchor="end">${prozent(100 - i * 25, sprache)}</text>`;
  }
  for (const h of [7, 11, 15, 19, 23]) s += `<text class="achse" x="${X(h)}" y="286" text-anchor="middle">${uhrzeit(h, sprache)}</text>`;
  if (erg.ergebnisse) {
    s += `<path class="linie se" d="${linie(erg.ergebnisse.se, breite)}"></path>`;
    s += `<path class="linie k1" d="${linie(erg.ergebnisse.k1, breite)}"></path>`;
    s += `<path class="linie pro" d="${linie(erg.ergebnisse.pro, breite)}"></path>`;
  }
  return { viewBox: `0 0 ${breite} ${hoehe}`, inhalt: s };
}
