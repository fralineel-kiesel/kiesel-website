// Rechnung hinter /vergleichen/ (cmp_js in design/generator/gen4.py, Zeile für Zeile übernommen).
// Reine Funktion: läuft im Build (Anfangszustand im HTML) und im Browser (bei jeder Wahl).
//
//   vergleich({ kiesel: 'k1'|'pro', gegen: 'pmax'|'p18'|'mini'|'se'|'k1'|'pro', modus: 'side'|'over' })
//   → { kz, o, karte, zeilen, satz, gegen, … } mit Lagen in SVG-Einheiten (Bühne 1200 × 640)
//
// Massstab: 3 SVG-Einheiten pro Millimeter (SC). Alles steht auf der Grundlinie y = 572.
import { GERAETE, zahl } from '../data/geraete.js';
import { MODELS } from './kiesel-draw/models.js';

export const SC = 3, BASIS = 572, MITTE = 600;
export const BUEHNE = { breite: 1200, hoehe: 640 };
// Handy (schmal): fester Ausschnitt, in den jede Kombination passt (breiteste: Pro neben Pro Max)
export const BUEHNE_SCHMAL = '322 66 556 574';
export const KREDITKARTE = { breite: 53.98, hoehe: 85.6 }; // ISO/IEC 7810 ID-1, in mm
export const GEGNER = ['pmax', 'p18', 'mini', 'se'];      // dazu immer der andere Kiesel

// Zahl mit fester Stellenzahl im Schweizer Format (wie fmt() in gen4.py)
const fmt = (v, d = 1) => zahl(v, d);
const r1 = (v) => Number(v.toFixed(1));

export function vergleich({ kiesel = 'k1', gegen = 'pmax', modus = 'side' } = {}) {
  const kid = kiesel === 'pro' ? 'pro' : 'k1';
  let vs = GERAETE[gegen] ? gegen : 'pmax';
  if (vs === kid) vs = kid === 'k1' ? 'pro' : 'k1';
  const ueber = modus === 'over';
  const k = GERAETE[kid], o = GERAETE[vs];

  const kW = k.breite * SC, kH = k.hoehe * SC, oW = o.breite * SC, oH = o.hoehe * SC;
  const kx = ueber ? MITTE - kW / 2 : MITTE - 36 - kW;
  const ox = ueber ? MITTE - oW / 2 : MITTE + 36;
  const U = MODELS[kid].W; // Breite der Zeichnung in Einheiten des Zeichen-Motors
  const kz = {
    x: r1(kx), y: r1(BASIS - kH), s: Number((kW / U).toFixed(4)),
    cx: r1(kx + kW / 2), name: k.name, masse: `${fmt(k.hoehe)} × ${fmt(k.breite)} mm`,
  };

  // Gegner: iPhones mit Bildschirm, Home-Button bzw. Notch/Island; ein Kiesel als Umriss
  const oy = BASIS - oH, R = o.radius * SC;
  const home = o.typ === 'home';
  const ins = (home ? 4.2 : 1.9) * SC;
  const oben = home ? 17 * SC : ins, unten = home ? 17 * SC : ins;
  const isW = (o.typ === 'kiesel' ? 16 : o.typ === 'notch' ? 26 : 20) * SC;
  const ob = {
    x: r1(ox), y: r1(oy), w: r1(oW), h: r1(oH), r: r1(R),
    sx: r1(ox + ins), sy: r1(oy + oben), sw: r1(oW - 2 * ins), sh: r1(oH - oben - unten), sr: r1(home ? SC : R - ins),
    hx: r1(ox + oW / 2), hy: r1(oy + oH - 8.6 * SC), hr: r1(5.4 * SC), homeSichtbar: !ueber && home,
    nx: r1(ox + oW / 2 - (home ? 10 * SC : isW) / 2),
    ny: r1(oy + (o.typ === 'notch' ? ins : home ? 7.6 * SC : ins + 2 * SC)),
    nw: r1(home ? 10 * SC : isW), nh: r1((o.typ === 'notch' ? 5 : home ? 1.3 : 4.4) * SC), nr: r1(2.2 * SC),
    cx: r1(ox + oW / 2), name: o.name, masse: `${fmt(o.hoehe)} × ${fmt(o.breite)} mm`,
  };
  // Bewusste Abweichung von gen4.py: Dort steht der Hörer-Schlitz des SE (10 mm breit) links
  // neben der Mitte, weil seine Lage mit der Island-Breite (20 mm) gerechnet wird. Hier mittig.

  const cW = KREDITKARTE.breite * SC, cH = KREDITKARTE.hoehe * SC;
  const karte = { x: r1(kx + kW / 2 - cW / 2), y: r1(BASIS - cH), w: r1(cW), h: r1(cH), cx: r1(kx + kW / 2), ty: r1(BASIS - cH - 10) };

  // Vergleichssatz
  const dh = o.hoehe - k.hoehe, dw = o.breite - k.breite, flaeche = (o.hoehe * o.breite) / (k.hoehe * k.breite) - 1;
  const art = (g, gross) => (g.typ === 'kiesel' ? (gross ? 'Der ' : 'der ') : (gross ? 'Das ' : 'das '));
  let satz;
  if (Math.abs(flaeche) < 0.01) {
    satz = `${o.name} und ${k.name} haben genau dieselbe Grundfläche. ` +
      (o.dicke < k.dicke ? `Das ${o.name} ist ${fmt(k.dicke - o.dicke, 2)} mm dünner, dafür hat der Kiesel ${Math.round((k.akku / o.akku - 1) * 100)} % mehr Akku.` : '');
  } else if (flaeche > 0) {
    satz = `${art(o, true)}${o.name} ist ${fmt(dh)} mm höher und ${fmt(dw)} mm breiter als der ${k.name}. Seine Vorderseite ist ${Math.round(flaeche * 100)} % grösser.`;
  } else {
    satz = `Der ${k.name} ist ${fmt(-dh)} mm höher und ${fmt(-dw)} mm breiter als ${art(o, false)}${o.name}.`;
  }
  satz = satz.trim();

  // Tabelle mit Balken: Balkenlänge relativ zum grösseren der beiden Werte
  const ZEILEN = [['Höhe', 'hoehe', ' mm', 1], ['Breite', 'breite', ' mm', 1], ['Dicke', 'dicke', ' mm', 2], ['Gewicht', 'gewicht', ' g', 0], ['Akku', 'akku', ' mAh', 0], ['Display', 'display', '″', 1]];
  const wert = (g, key, einheit, d) => (g.geschaetzt && (key === 'gewicht' || key === 'akku') ? 'ca. ' : '') + (d ? fmt(g[key], d) : zahl(g[key])) + einheit;
  const zeilen = ZEILEN.map(([titel, key, einheit, d]) => {
    const mx = Math.max(k[key], o[key]);
    return { titel, a: wert(k, key, einheit, d), b: wert(o, key, einheit, d), aw: r1(k[key] / mx * 100), bw: r1(o[key] / mx * 100) };
  });

  return {
    kiesel: kid, gegen: vs, anderer: kid === 'k1' ? 'pro' : 'k1', ueber,
    kz, o: ob, karte, zeilen, satz,
    legende: `Gefüllt: ${k.name}, gestrichelt: ${o.name}`,
    label: `${k.name} und ${o.name} im Massstab ${ueber ? 'übereinander' : 'nebeneinander'}`,
  };
}
