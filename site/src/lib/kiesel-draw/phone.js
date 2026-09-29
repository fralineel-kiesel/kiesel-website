// Handys als SVG, übersetzt aus design/generator/lib.py (+ phone() aus gen2.py).
//
// Aufbau (Details in der Erklärung im PR):
//   backSvg()  Rückseite: Rahmen, Rücken, Logo, optional Hülle, Linsen (lens), Blitz (ledSvg)
//   frontSvg() Vorderseite: Rahmen, Sperrbildschirm, Dynamic Island, optional Hülle
//   handy()    bequemer Einstieg für die Seiten: fertiges <svg> mit Rand, Schatten, Drehung
//
// Wichtig: lens() und ledSvg() verweisen per url(#…) auf Verläufe, die backSvg() vorher in
// <defs> anlegt. Sie funktionieren darum nur innerhalb einer Rückseite mit demselben pid.
// Die Reihenfolge der Zeilen ist Absicht: In SVG liegt später Gezeichnetes oben.
import { E, esc, stop, f, rr, uid } from './svg.js';
import { MODELS, DICKE, geo, camrow, KNOPF_HOEHE, LINSE_R, MIKRO_R, BLITZ_R } from './models.js';
import { palette, led as ledZustand } from './colors.js';
import { sperrbildschirm } from './sperrbildschirm.js';
import { zeichnung as DE_Z } from '../../i18n/de.js';

// Kiesel-Logo: die Kieselform und zwei "Adern"
export const PEB = 'M54 18C79 17 96 31 95 52C94 72 76 84 50 84C24 84 5 73 5 53C5 33 27 19 54 18Z';
export const V1 = 'M-4 70C26 62 56 50 104 34';
export const V2 = 'M-4 80C30 72 64 60 104 46';

// Verläufe und Filter, die Vorder- und Rückseite beide brauchen
//   fr = Rahmen (dunkel-hell-Farbe-hell-dunkel, wirkt rund)   bz = Metallring der Linsen
//   sh = weicher Schatten   ls = kleiner Schatten   gr = feines Korn (matte Oberfläche)
export function commonDefs(pid, col) {
  const d = [];
  d.push(E('linearGradient', { id: pid + 'fr', x1: '0', y1: '0', x2: '1', y2: '0' },
    stop('0', col.lo) + stop('0.05', col.hi) + stop('0.18', col.frame) + stop('0.82', col.frame) + stop('0.95', col.hi) + stop('1', col.lo)));
  d.push(E('linearGradient', { id: pid + 'bz', x1: '0', y1: '0', x2: '1', y2: '1' },
    stop('0', col.hi) + stop('0.45', col.frame) + stop('1', col.lo)));
  d.push(E('filter', { id: pid + 'sh', x: '-30%', y: '-30%', width: '160%', height: '160%' }, E('feGaussianBlur', { stdDeviation: '30' })));
  d.push(E('filter', { id: pid + 'ls', x: '-40%', y: '-40%', width: '180%', height: '180%' }, E('feGaussianBlur', { stdDeviation: '5' })));
  d.push(E('filter', { id: pid + 'gr', x: '0', y: '0', width: '100%', height: '100%' },
    E('feTurbulence', { type: 'fractalNoise', baseFrequency: '1.1', numOctaves: '2', stitchTiles: 'stitch' }) +
    E('feColorMatrix', { type: 'saturate', values: '0' }) +
    E('feComponentTransfer', {}, E('feFuncA', { type: 'table', tableValues: '0 0.09' }))));
  return d;
}

// Seitenknöpfe. Von vorne gesehen sind Action + Lautstärke links, Power + Kamera-Knopf
// rechts; von hinten ist es gespiegelt.
export function buttons(W, g, side, fill, dx = -10, w = 12) {
  let L, Rr;
  const K = KNOPF_HOEHE;
  if (side === 'front') { L = [['act', K.act], ['v1', K.v1], ['v2', K.v2]]; Rr = [['pw', K.pw], ['cc', K.cc]]; }
  else { L = [['pw', K.pw], ['cc', K.cc]]; Rr = [['act', K.act], ['v1', K.v1], ['v2', K.v2]]; }
  let out = '';
  for (const [k, h] of L) out += E('rect', { x: f(dx), y: f(g[k]), width: String(w), height: String(h), rx: '5', style: `fill: ${fill}` });
  for (const [k, h] of Rr) out += E('rect', { x: f(W - 12 - dx), y: f(g[k]), width: String(w), height: String(h), rx: '5', style: `fill: ${fill}` });
  return out;
}

// Eine Linse aus 12 Kreisen, von aussen nach innen: Schatten, Metallring, heller Rand,
// Fassung, Glas, zwei farbige Vergütungs-Bögen (gestrichelte Kreise!), Blende, Reflexe.
// tele = true nimmt das violette Glas der Tele-Linse.
export function lens(cx, cy, r, pid, tele) {
  const C = 2 * Math.PI * r * 0.47; // Umfang des Vergütungs-Kreises, für die Strichlänge
  const gl = pid + (tele ? 'tl' : 'gl');
  let s = '';
  s += E('circle', { cx: f(cx), cy: f(cy + 4), r: f(r + 3), style: 'fill: #000000; opacity: 0.3', filter: `url(#${pid}ls)` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r), style: `fill: url(#${pid}bz)` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r - 4), style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.4; stroke-width: 1.5' });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r - 9), style: 'fill: #111316' });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r - 14), style: 'fill: #05070A' });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r * 0.6), style: `fill: url(#${gl})` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r * 0.47), transform: `rotate(200 ${f(cx)} ${f(cy)})`,
    style: `fill: none; stroke: #8A6BD6; stroke-opacity: 0.5; stroke-width: ${f(r * 0.05)}; stroke-dasharray: ${f(C * 0.28)} ${f(C)}` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r * 0.47), transform: `rotate(25 ${f(cx)} ${f(cy)})`,
    style: `fill: none; stroke: #43B894; stroke-opacity: 0.32; stroke-width: ${f(r * 0.04)}; stroke-dasharray: ${f(C * 0.16)} ${f(C)}` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: f(r * 0.2), style: 'fill: #020304' });
  s += E('ellipse', { cx: f(cx - r * 0.27), cy: f(cy - r * 0.29), rx: f(r * 0.15), ry: f(r * 0.08), transform: `rotate(-38 ${f(cx - r * 0.27)} ${f(cy - r * 0.29)})`, style: 'fill: #FFFFFF; opacity: 0.82' });
  s += E('circle', { cx: f(cx + r * 0.25), cy: f(cy + r * 0.26), r: f(r * 0.045), style: 'fill: #FFFFFF; opacity: 0.35' });
  return s;
}

// Der RGB-Blitz. Ist led gesetzt, liegt darunter ein grosser Leuchthof (r = 120).
export function ledSvg(cx, cy, pid, led) {
  let s = '';
  if (led) s += E('circle', { cx: f(cx), cy: f(cy), r: '120', style: `fill: url(#${pid}lg)` });
  s += E('circle', { cx: f(cx), cy: f(cy + 3), r: '27', style: 'fill: #000000; opacity: 0.25', filter: `url(#${pid}ls)` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: String(BLITZ_R), style: `fill: url(#${pid}bz)` });
  s += E('circle', { cx: f(cx), cy: f(cy), r: '20', style: 'fill: #15171B' });
  s += E('circle', { cx: f(cx), cy: f(cy), r: '17', style: `fill: url(#${pid}ld)` });
  s += E('circle', { cx: f(cx - 5), cy: f(cy - 6), r: '4', style: 'fill: #FFFFFF; opacity: 0.7' });
  return s;
}

// Verläufe des Blitzes.
//   led = null: aus, cremefarben wie eine normale Blitz-LED
//   led = { color, o1, o2, mid, edge }: leuchtet. ld = die LED selbst (weiss → mid → edge),
//         lg = Leuchthof in color, innen mit Deckkraft o1, bei 30 % mit o2, aussen 0
export function ledDefs(pid, led) {
  if (led === null || led === undefined) {
    return [E('radialGradient', { id: pid + 'ld', cx: '0.4', cy: '0.35', r: '0.75' }, stop('0', '#FFFCF3') + stop('0.55', '#F4EAD4') + stop('1', '#DCCBA6'))];
  }
  const ld = E('radialGradient', { id: pid + 'ld', cx: '0.4', cy: '0.35', r: '0.75' }, stop('0', '#FFFFFF') + stop('0.4', led.mid) + stop('1', led.edge));
  const lg = E('radialGradient', { id: pid + 'lg', cx: '0.5', cy: '0.5', r: '0.5' }, stop('0', led.color, led.o1) + stop('0.3', led.color, led.o2) + stop('1', led.color, '0'));
  return [ld, lg];
}

// Verläufe der Hülle: cr = Hüllenrand (wie fr, mit zweitem Glanz), ch = milchiger Glanz,
// cm = Ausschnitt der milchigen Rückwand (innen minus Kamera-Loch)
export function caseDefs(pid, k, cutpath, milkypath) {
  const d = [];
  d.push(E('linearGradient', { id: pid + 'cr', x1: '0', y1: '0', x2: '1', y2: '0' },
    stop('0', k.lo) + stop('0.04', k.frame) + stop('0.1', k.hi) + stop('0.2', k.frame) + stop('0.8', k.frame) + stop('0.9', k.hi) + stop('0.96', k.frame) + stop('1', k.lo)));
  d.push(E('radialGradient', { id: pid + 'ch', cx: '0.25', cy: '0.12', r: '0.8' }, stop('0', '#FFFFFF', '0.45') + stop('1', '#FFFFFF', '0')));
  d.push(E('clipPath', { id: pid + 'cm' }, E('path', { d: milkypath, style: 'clip-rule: evenodd' })));
  return d;
}

// Rückseite. mk = 'k1' | 'pro', col = Palette (7 Töne), pid = ID-Präfix,
// led = null oder LED-Objekt (siehe ledDefs), huelle = null oder Palette der Hülle
export function backSvg(mk, col, pid, led = null, huelle = null, gravur = null) {
  const m = MODELS[mk];
  const [W, H, R, g] = geo(m);
  const [c, xs, mic, fl] = camrow(m);
  const defs = commonDefs(pid, col);
  defs.push(E('linearGradient', { id: pid + 'bk', x1: '0', y1: '0', x2: '0.35', y2: '1' }, stop('0', col.backHi) + stop('0.5', col.back) + stop('1', col.backLo)));
  defs.push(E('radialGradient', { id: pid + 'hl', cx: '0.18', cy: '0.08', r: '0.75' }, stop('0', '#FFFFFF', '0.34') + stop('1', '#FFFFFF', '0')));
  defs.push(E('radialGradient', { id: pid + 'gl', cx: '0.38', cy: '0.34', r: '0.75' }, stop('0', '#2C4466') + stop('0.45', '#121C2B') + stop('1', '#040609')));
  defs.push(E('radialGradient', { id: pid + 'tl', cx: '0.38', cy: '0.34', r: '0.75' }, stop('0', '#3B2F63') + stop('0.45', '#171328') + stop('1', '#040609')));
  defs.push(E('clipPath', { id: pid + 'cb' }, E('rect', { x: '8', y: '8', width: f(W - 16), height: f(H - 16), rx: f(R - 8) })));
  defs.push(E('clipPath', { id: pid + 'pb' }, E('path', { d: PEB })));
  defs.push(...ledDefs(pid, led));
  // Kamera-Ausschnitt der Hülle (von der ersten Linse bis hinter den Blitz) und Innenkante
  const cut = rr(c - 88, c - 88, fl + 44 - (c - 88), 176, 84);
  const inner = rr(10, 10, W - 20, H - 20, R - 10);
  if (huelle) defs.push(...caseDefs(pid, huelle, cut, inner + ' ' + cut));
  let s = '<defs>' + defs.join('') + '</defs>';
  s += E('rect', { x: '18', y: '40', width: f(W), height: f(H), rx: f(R), style: 'fill: #0B1016; opacity: 0.3', filter: `url(#${pid}sh)` });
  s += buttons(W, g, 'back', `url(#${pid}fr)`);
  s += E('rect', { x: '0', y: '0', width: f(W), height: f(H), rx: f(R), style: `fill: url(#${pid}fr)` });
  s += E('rect', { x: '2', y: '2', width: f(W - 4), height: f(H - 4), rx: f(R - 2), style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2' });
  s += E('rect', { x: '8', y: '8', width: f(W - 16), height: f(H - 16), rx: f(R - 8), style: `fill: url(#${pid}bk)` });
  s += E('g', { style: `clip-path: url(#${pid}cb)` }, E('rect', { x: '8', y: '8', width: f(W - 16), height: f(H - 16), style: 'fill: #808080', filter: `url(#${pid}gr)` }));
  s += E('rect', { x: '8', y: '8', width: f(W - 16), height: f(H - 16), rx: f(R - 8), style: `fill: url(#${pid}hl)` });
  s += E('rect', { x: '8', y: '8', width: f(W - 16), height: f(H - 16), rx: f(R - 8), style: 'fill: none; stroke: #000000; stroke-opacity: 0.12; stroke-width: 2' });
  // MagSafe-Ring und Logo knapp unter der Mitte
  const my = H * 0.517;
  s += E('circle', { cx: f(W / 2), cy: f(my), r: '182', style: `fill: none; stroke: ${col.logo}; stroke-opacity: 0.5; stroke-width: 3` });
  s += E('rect', { x: f(W / 2 - 4), y: f(my + 192), width: '8', height: '44', rx: '4', style: `fill: ${col.logo}; opacity: 0.5` });
  const lg = `translate(${f(W / 2 - 60)} ${f(my - 64)}) scale(1.2)`;
  s += E('g', { transform: lg },
    E('path', { d: PEB, transform: 'translate(0 0.9)', style: 'fill: #FFFFFF; opacity: 0.35' }) +
    E('path', { d: PEB, style: `fill: ${col.logo}` }) +
    E('g', { style: `clip-path: url(#${pid}pb)` },
      E('path', { d: V1, style: `fill: none; stroke: ${col.backHi}; stroke-width: 7; stroke-linecap: round` }) +
      E('path', { d: V2, style: `fill: none; stroke: ${col.backHi}; stroke-width: 2.2; stroke-linecap: round; opacity: 0.7` })));
  // Hülle über dem Rücken, aber unter den Linsen: die schauen durch den Ausschnitt
  if (huelle) s += caseBack(mk, huelle, pid, cut, inner);
  // Gravur (neu, nicht aus lib.py) unter der MagSafe-Markierung. Ohne Gravur kommt nichts
  // dazu, darum bleiben alle Vergleiche mit Python gleich.
  if (gravur) s += gravurSvg(W, my + 320, col, gravur, !!huelle);
  s += lens(xs[0], c, LINSE_R.haupt, pid, false);
  if (m.cams === 2) s += lens(xs[1], c, LINSE_R.tele, pid, true);
  s += E('circle', { cx: f(mic), cy: f(c), r: String(MIKRO_R), style: `fill: ${col.lo}` });
  s += ledSvg(fl, c, pid, led);
  return s;
}

// Gravur auf der Rückseite (neu, nicht aus lib.py). Gelasert wie beim echten Vorbild: auf hellen
// Farben dunkler als der Rücken, auf dunklen heller, dazu eine feine Kante wie beim Logo.
// Schriftgrösse 48 (= 4.8 mm), lange Texte kleiner, damit auch 18 breite Zeichen mit Rand
// passen. Mit Hülle wird sie NACH der Hülle gezeichnet, als blasser dunkler Schatten: Sie
// schimmert durch die milchige Rückwand. (Ganz unter der Hülle gezeichnet sähe man sie nicht.)
const hell = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
};
export function gravurSvg(W, y, col, text, unterHuelle = false) {
  const breite = [...text].length * 0.6; // grobe Breite pro Zeichen in Schriftgrössen
  const fs = Math.min(48, (W - 160) / Math.max(breite, 1));
  const stil = `font-family: 'Instrument Sans', 'Segoe UI', sans-serif; font-size: ${f(fs)}px; font-weight: 500; letter-spacing: 1px; text-anchor: middle`;
  const t = esc(text);
  // Die milchige Hülle ist immer hell-grau: darunter wirkt jede Gravur als dunkler Schatten
  const [farbe, kante, deck] = unterHuelle ? ['#0B1016', '#FFFFFF', 0.42]
    : hell(col.back) ? [col.lo, col.hi, 0.9] : [col.hi, col.lo, 0.9];
  return E('g', { 'data-gravur': '' },
    E('text', { x: f(W / 2), y: f(y + 1.5), style: `${stil}; fill: ${kante}; opacity: ${f(deck * 0.6)}` }, t) +
    E('text', { x: f(W / 2), y: f(y), style: `${stil}; fill: ${farbe}; opacity: ${f(deck)}` }, t));
}

// Hülle von hinten: Rand (22 Einheiten = 2.2 mm), milchige Rückwand mit Loch für die
// Kameras, MagSafe-Ring, Knopf-Abdeckungen
export function caseBack(mk, k, pid, cut, inner) {
  const m = MODELS[mk];
  const [W, H, R, g] = geo(m);
  const outer = rr(-22, -22, W + 44, H + 44, R + 22);
  let s = '';
  s += E('path', { d: outer + ' ' + inner, style: `fill: url(#${pid}cr); fill-rule: evenodd` });
  s += E('path', { d: inner + ' ' + cut, style: `fill: ${k.back}; fill-rule: evenodd; opacity: 0.55` });
  s += E('path', { d: inner + ' ' + cut, style: 'fill: #FFFFFF; fill-rule: evenodd; opacity: 0.4' });
  s += E('g', { style: `clip-path: url(#${pid}cm)` }, E('rect', { x: '10', y: '10', width: f(W - 20), height: f(H - 20), style: 'fill: #808080', filter: `url(#${pid}gr)` }));
  s += E('path', { d: inner + ' ' + cut, style: `fill: url(#${pid}ch); fill-rule: evenodd` });
  s += E('circle', { cx: f(W / 2), cy: f(H * 0.517), r: '182', style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.8; stroke-width: 6' });
  s += E('circle', { cx: f(W / 2), cy: f(H * 0.517), r: '168', style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2' });
  s += E('path', { d: cut, style: `fill: none; stroke: ${k.frame}; stroke-width: 14` });
  s += E('path', { d: cut, style: 'fill: none; stroke: #000000; stroke-opacity: 0.18; stroke-width: 3' });
  s += E('path', { d: inner, style: 'fill: none; stroke: #000000; stroke-opacity: 0.12; stroke-width: 3' });
  s += E('path', { d: outer, style: 'fill: none; stroke: #000000; stroke-opacity: 0.2; stroke-width: 2' });
  for (const [key, h] of [['act', 70], ['v1', 120], ['v2', 120]]) {
    s += E('rect', { x: f(W + 19), y: f(g[key] - 4), width: '10', height: f(h + 8), rx: '5', style: `fill: ${k.lo}` });
  }
  for (const [key, h] of [['pw', 180], ['cc', 110]]) {
    s += E('rect', { x: '-29', y: f(g[key] - 4), width: '10', height: f(h + 8), rx: '5', style: `fill: ${k.lo}` });
  }
  return s;
}

// Kiesel-Hintergrundbild des Sperrbildschirms: [x, y, rx, ry, Drehung, Verlauf]
export const WALL = [[110, 990, 200, 122, -18, 'p3'], [480, 1070, 220, 132, 12, 'p3'], [300, 830, 156, 96, -6, 'p1'], [520, 770, 92, 60, 20, 'p1'], [80, 730, 72, 44, -25, 'p2'], [370, 660, 46, 30, 8, 'p2']];

// Vorderseite mit Sperrbildschirm (Freitag, 25. September, 07:32).
// sperr = { datum, uhrzeit }: Texte auf dem Sperrbildschirm (Standard: Deutsch, sperrbildschirm.js)
export function frontSvg(mk, col, pid, huelle = null, sperr = sperrbildschirm()) {
  const m = MODELS[mk];
  const [W, H, R, g] = geo(m);
  const defs = commonDefs(pid, col);
  defs.push(E('clipPath', { id: pid + 'sc' }, E('rect', { x: '16', y: '16', width: f(W - 32), height: f(H - 32), rx: f(R - 16) })));
  defs.push(E('radialGradient', { id: pid + 'wb', cx: '0.3', cy: '0.25', r: '1' }, stop('0', '#223A4E') + stop('0.6', '#111D28') + stop('1', '#090F15')));
  for (const [n, [a, b]] of Object.entries({ p1: ['#7C9BAE', '#2E4556'], p2: ['#C2D3DA', '#5A7384'], p3: ['#3F5B70', '#141F29'] })) {
    defs.push(E('radialGradient', { id: pid + n, cx: '0.35', cy: '0.28', r: '0.85' }, stop('0', a) + stop('1', b)));
  }
  defs.push(E('linearGradient', { id: pid + 'rf', x1: '0', y1: '0', x2: '1', y2: '1' }, stop('0', '#FFFFFF', '0.16') + stop('0.5', '#FFFFFF', '0.03') + stop('1', '#FFFFFF', '0')));
  if (huelle) {
    defs.push(E('linearGradient', { id: pid + 'cr', x1: '0', y1: '0', x2: '1', y2: '0' },
      stop('0', huelle.lo) + stop('0.04', huelle.frame) + stop('0.1', huelle.hi) + stop('0.2', huelle.frame) + stop('0.8', huelle.frame) + stop('0.9', huelle.hi) + stop('0.96', huelle.frame) + stop('1', huelle.lo)));
  }
  const sx = W / 586, sy = H / 1238;
  let s = '<defs>' + defs.join('') + '</defs>';
  s += E('rect', { x: '18', y: '40', width: f(W), height: f(H), rx: f(R), style: 'fill: #0B1016; opacity: 0.3', filter: `url(#${pid}sh)` });
  s += buttons(W, g, 'front', `url(#${pid}fr)`);
  s += E('rect', { x: '0', y: '0', width: f(W), height: f(H), rx: f(R), style: `fill: url(#${pid}fr)` });
  s += E('rect', { x: '2', y: '2', width: f(W - 4), height: f(H - 4), rx: f(R - 2), style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2' });
  s += E('rect', { x: '9', y: '9', width: f(W - 18), height: f(H - 18), rx: f(R - 9), style: 'fill: #04060A' });
  let wall = E('rect', { x: '16', y: '16', width: f(W - 32), height: f(H - 32), style: `fill: url(#${pid}wb)` });
  const peb = WALL.map(([x, y, rx, ry, a, gid]) => E('ellipse', { cx: f(x), cy: f(y), rx: f(rx), ry: f(ry), transform: `rotate(${a} ${x} ${y})`, style: `fill: url(#${pid}${gid})` })).join('');
  wall += E('g', { transform: `scale(${f(sx)} ${f(sy)})` }, peb);
  wall += E('text', { x: f(W / 2), y: '204', style: "font-family: 'Instrument Sans', 'Segoe UI', sans-serif; font-size: 34px; font-weight: 500; fill: #C7D3DA; text-anchor: middle" }, esc(sperr.datum));
  wall += E('text', { x: f(W / 2), y: '356', style: "font-family: 'Unbounded', 'Arial Black', sans-serif; font-size: 150px; font-weight: 400; letter-spacing: -4px; fill: #F3F6F8; text-anchor: middle" }, esc(sperr.uhrzeit));
  // Taschenlampe links, Kamera rechts, Home-Balken unten
  for (const bx of [W * 0.2, W * 0.8]) {
    wall += E('circle', { cx: f(bx), cy: f(H - 140), r: '50', style: 'fill: #FFFFFF; opacity: 0.14' });
  }
  wall += E('rect', { x: f(W * 0.2 - 10), y: f(H - 168), width: '20', height: '44', rx: '6', style: 'fill: #E9EEF3' });
  wall += E('rect', { x: f(W * 0.2 - 14), y: f(H - 170), width: '28', height: '12', rx: '4', style: 'fill: #E9EEF3' });
  wall += E('rect', { x: f(W * 0.8 - 22), y: f(H - 156), width: '44', height: '32', rx: '7', style: 'fill: none; stroke: #E9EEF3; stroke-width: 4' });
  wall += E('circle', { cx: f(W * 0.8), cy: f(H - 140), r: '8', style: 'fill: none; stroke: #E9EEF3; stroke-width: 4' });
  wall += E('rect', { x: f(W / 2 - 90), y: f(H - 56), width: '180', height: '10', rx: '5', style: 'fill: #FFFFFF; opacity: 0.85' });
  wall += E('path', { d: `M16 16H${f(W * 0.78)}L16 ${f(H * 0.5)}Z`, style: `fill: url(#${pid}rf)` });
  s += E('g', { style: `clip-path: url(#${pid}sc)` }, wall);
  // Dynamic Island mit Frontkamera
  s += E('rect', { x: f(W / 2 - 80), y: '42', width: '160', height: '46', rx: '23', style: 'fill: #000000' });
  s += E('circle', { cx: f(W / 2 + 57), cy: '65', r: '9', style: 'fill: #0D1824' });
  s += E('circle', { cx: f(W / 2 + 54), cy: '62', r: '2.5', style: 'fill: #FFFFFF; opacity: 0.45' });
  if (huelle) {
    const outer = rr(-22, -22, W + 44, H + 44, R + 22), inn = rr(8, 8, W - 16, H - 16, R - 8);
    s += E('path', { d: outer + ' ' + inn, style: `fill: url(#${pid}cr); fill-rule: evenodd` });
    s += E('path', { d: inn, style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2' });
    s += E('path', { d: outer, style: 'fill: none; stroke: #000000; stroke-opacity: 0.2; stroke-width: 2' });
    for (const [key, h] of [['act', 70], ['v1', 120], ['v2', 120]]) {
      s += E('rect', { x: '-29', y: f(g[key] - 4), width: '10', height: f(h + 8), rx: '5', style: `fill: ${huelle.lo}` });
    }
    for (const [key, h] of [['pw', 180], ['cc', 110]]) {
      s += E('rect', { x: f(W + 19), y: f(g[key] - 4), width: '10', height: f(h + 8), rx: '5', style: `fill: ${huelle.lo}` });
    }
  }
  return s;
}

// Seitenansicht (rechte Kante): lib.py hat keine, darum aus side() der alten Seite
// (js/handy.js) übernommen, mit denselben Massen. Links liegt das Display, rechts der
// Rücken mit dem Kamerabuckel. Gefärbt wie Vorder- und Rückseite: Rahmen mit dem Verlauf
// fr, Buckel mit dem Metallverlauf bz der Linsenringe, darunter der weiche Schatten sh.
//   Breite = DICKE = 90 Einheiten (9 mm), Höhe = H des Modells
export function sideSvg(mk, col, pid, huelle = null) {
  const m = MODELS[mk];
  const [, H, , g] = geo(m);
  const D = DICKE;
  const bump = m.cams === 2 ? 20 : 16; // Pro: grössere Tele-Linse, Buckel steht weiter vor
  const defs = commonDefs(pid, col);
  if (huelle) {
    defs.push(E('linearGradient', { id: pid + 'cr', x1: '0', y1: '0', x2: '1', y2: '0' },
      stop('0', huelle.lo) + stop('0.04', huelle.frame) + stop('0.1', huelle.hi) + stop('0.2', huelle.frame) + stop('0.8', huelle.frame) + stop('0.9', huelle.hi) + stop('0.96', huelle.frame) + stop('1', huelle.lo)));
  }
  let s = '<defs>' + defs.join('') + '</defs>';
  s += E('rect', { x: '18', y: '40', width: f(D), height: f(H), rx: '40', style: 'fill: #0B1016; opacity: 0.3', filter: `url(#${pid}sh)` });
  s += E('rect', { x: f(D - 2), y: '28', width: f(bump), height: '136', rx: '7', style: `fill: url(#${pid}bz)` });
  s += E('rect', { x: '0', y: '0', width: f(D), height: f(H), rx: '40', style: `fill: url(#${pid}fr)` });
  s += E('rect', { x: '2', y: '2', width: f(D - 4), height: f(H - 4), rx: '38', style: 'fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2' });
  // Antennenfugen oben und unten
  s += E('rect', { x: '0', y: '150', width: f(D), height: '8', style: `fill: ${col.lo}; opacity: 0.45` });
  s += E('rect', { x: '0', y: f(H - 158), width: f(D), height: '8', style: `fill: ${col.lo}; opacity: 0.45` });
  // Power-Taste und Kamera-Knopf (mit Saphirglas-Fläche)
  s += E('rect', { x: '22', y: f(g.pw), width: '46', height: '180', rx: '20', style: `fill: ${col.lo}` });
  s += E('rect', { x: '22', y: f(g.cc), width: '46', height: '110', rx: '18', style: `fill: ${col.lo}` });
  s += E('rect', { x: '32', y: f(g.cc + 20), width: '26', height: '70', rx: '10', style: 'fill: #1A2530; opacity: 0.85' });
  if (huelle) {
    // Hülle: 1.4 mm vor dem Display, 1.6 mm hinter dem Rücken, Knöpfe abgedeckt
    s += E('rect', { x: '-14', y: '-22', width: f(D + 30), height: f(H + 44), rx: '50', style: `fill: url(#${pid}cr)` });
    s += E('rect', { x: '-14', y: '-22', width: f(D + 30), height: f(H + 44), rx: '50', style: `fill: none; stroke: ${huelle.lo}; stroke-opacity: 0.5; stroke-width: 2` });
    s += E('rect', { x: f(D + 16), y: '10', width: f(bump + 2), height: '172', rx: '6', style: `fill: ${huelle.frame}` });
    s += E('rect', { x: f(D + 16), y: '10', width: f(bump + 2), height: '172', rx: '6', style: `fill: none; stroke: ${huelle.lo}; stroke-opacity: 0.5; stroke-width: 2` });
    s += E('rect', { x: '22', y: f(g.pw), width: '46', height: '180', rx: '20', style: `fill: ${huelle.lo}; opacity: 0.75` });
    s += E('rect', { x: '22', y: f(g.cc), width: '46', height: '110', rx: '18', style: 'fill: #1A2530; opacity: 0.55' });
  }
  return s;
}

// Ein Handy in einer grösseren Szene platzieren: um die Mitte drehen und skalieren
export function place(mk, inner, cx, cy, a, sc) {
  const m = MODELS[mk];
  return E('g', { transform: `translate(${f(cx)} ${f(cy)}) rotate(${f(a)}) scale(${f(sc)}) translate(${f(-m.W / 2)} ${f(-m.H / 2)})` }, inner);
}

// Weicher Bodenschatten als Ellipse
export function floor(cx, cy, rx, ry, fid, op = '0.35') {
  return E('ellipse', { cx: f(cx), cy: f(cy), rx: f(rx), ry: f(ry), style: `fill: #0B1016; opacity: ${op}`, filter: `url(#${fid})` });
}

// ---------------------------------------------------------------------------
// handy(): der bequeme Einstieg für die Seiten (nach phone() aus gen2.py)
// ---------------------------------------------------------------------------
// Liefert ein fertiges <svg> mit 200 Einheiten Rand rundherum (Platz für Schatten,
// Drehung und Hülle), optionalem Bodenschatten und einem aria-label.
//   ansicht: 'vorne' | 'hinten' | 'seite' modell: 'k1' | 'pro'
//   farbe:   Kennung ('sky-blue', auch alter Name 'Himmelblau'), Hex ('#C0392B') oder fertige Palette
//   hoehe:   Höhe in px inkl. Rand (wie in gen2.py); null = ohne width/height, dann
//            bestimmt CSS die Grösse (z.B. width: 100%)
//   drehung: Grad um die Mitte     huelle: null oder Farbe der Hülle
//   led:     'off' | 'call' | 'msg' | … (siehe LED in colors.js), Hex oder LED-Objekt
//   boden:   Bodenschatten ja/nein
//   label:   eigener Text für Screenreader   pid: ID-Präfix (sonst automatisch)
//   gravur:  Text auf der Rückseite (nur ansicht 'hinten'), wird escaped
const ANSICHT = { vorne: 'front', hinten: 'back', seite: 'side', front: 'front', back: 'back', side: 'side' };

export function handy({ ansicht = 'hinten', modell = 'pro', farbe = 'sky-blue', hoehe = 400, drehung = 0,
  huelle = null, led = null, boden = true, label = null, pid = null, gravur = null, texte = DE_Z, sprache = 'de' } = {}) {
  const kind = ANSICHT[ansicht];
  if (!kind) throw new Error(`Unbekannte Ansicht: ${ansicht}`);
  pid = pid ?? uid('q');
  const col = palette(farbe);
  const k = huelle ? palette(huelle) : null;
  const m = MODELS[modell];
  const W = kind === 'side' ? DICKE : m.W, H = m.H; // Seitenansicht: nur 9 mm breit
  const pad = 200;
  const vbw = W + 2 * pad, vbh = H + 2 * pad;
  const inner = kind === 'back' ? backSvg(modell, col, pid, ledZustand(led), k, gravur)
    : kind === 'side' ? sideSvg(modell, col, pid, k) : frontSvg(modell, col, pid, k, sperrbildschirm(sprache));
  let fl = '';
  if (boden) {
    fl = E('defs', {}, E('filter', { id: pid + 'fl', x: '-50%', y: '-200%', width: '200%', height: '500%' }, E('feGaussianBlur', { stdDeviation: '26' }))) +
      E('ellipse', { cx: f(W / 2), cy: f(H + 80), rx: f(kind === 'side' ? W * 0.8 : W * 0.44), ry: '30', style: 'fill: #000000; opacity: 0.35', filter: `url(#${pid}fl)` });
  }
  const g = drehung ? E('g', { transform: `rotate(${f(drehung)} ${f(W / 2)} ${f(H / 2)})` }, inner) : inner;
  const lab = label || (modell === 'pro' ? 'Kiesel 1 Pro' : 'Kiesel 1') + texte.ansicht[kind];
  const groesse = hoehe === null ? {} : { width: f(hoehe * vbw / vbh), height: f(hoehe) };
  return E('svg', { ...groesse, viewBox: `${-pad} ${-pad} ${vbw} ${vbh}`, role: 'img', 'aria-label': esc(lab), style: 'display: block; overflow: visible' }, fl + g);
}
