// Illustrationen, übersetzt aus design/generator/scene.py:
//   alpen()     Bergpanorama 1600 × 1000 mit versteckten Details für die Zoom-Demo
//   crop()      Bildausschnitt für eine Zoomstufe (nur eine viewBox, darum bei 10x noch scharf)
//   blume()     Makro-Motiv 1200 × 800 in vier Ebenen für die Tiefenschärfe
//   phoneOpen() Innenleben von iPhone SE, Kiesel 1 und Pro im selben Massstab
// Dazu bequeme Einstiege für die Seiten: panorama(), blumeBild(), innenleben().
//
// Alles, was Python mit random.Random(7) bzw. (11) verteilt (Bäume, Blumen, Gras), zieht
// hier dieselben Zahlen in derselben Reihenfolge (siehe zufall.js). Darum stehen die
// Bäume genau dort, wo sie in der Vorlage stehen.
import { E, stop, f, py, pts, uid } from './svg.js';
import { PyRandom } from './zufall.js';
import { crop, begrenze } from './ausschnitt.js';

// ------------------------------------------------------------------
// ALPENPANORAMA 1600 × 1000
// ------------------------------------------------------------------
// Die acht versteckten Details: [Name, x, y] im 1600 × 1000-Bild, 1:1 aus scene.py
export const ZOOM_TARGETS = [
  ['Gipfelkreuz', 760, 214],
  ['Seilschaft auf dem Grat', 716, 242],
  ['Steinbock', 846, 331],
  ['SAC-Hütte mit Fahne', 616, 369],
  ['Gondelbahn', 452, 500],
  ['Gleitschirm', 1060, 306],
  ['Segelboot', 1122, 770],
  ['Dorf mit Kirche', 262, 668],
];

// Ein Mensch, nur etwa 5 Einheiten gross: bei 1x unsichtbar, bei 8x deutlich
function person(x, y, col, s = 1.0) {
  return E('circle', { cx: f(x), cy: f(y - 3.6 * s), r: f(1.05 * s), style: 'fill: #E9C4A4' }) +
    E('rect', { x: f(x - 0.8 * s), y: f(y - 2.6 * s), width: f(1.6 * s), height: f(2.8 * s), rx: f(0.5 * s), style: `fill: ${col}` }) +
    E('rect', { x: f(x - 0.7 * s), y: f(y + 0.1 * s), width: f(0.55 * s), height: f(1.8 * s), style: 'fill: #2B3440' }) +
    E('rect', { x: f(x + 0.15 * s), y: f(y + 0.1 * s), width: f(0.55 * s), height: f(1.8 * s), style: 'fill: #2B3440' });
}

function tree(x, y, h, col) {
  const w = h * 0.55;
  return E('polygon', { points: pts([[x, y - h], [x - w / 2, y], [x + w / 2, y]]), style: `fill: ${col}` });
}

export function alpen(p) {
  const rng = new PyRandom(7);
  const d = [];
  d.push(E('linearGradient', { id: p + 'sky', x1: '0', y1: '0', x2: '0', y2: '1' },
    stop('0', '#8DB8DA') + stop('0.55', '#C9DDEB') + stop('1', '#E9F1F5')));
  d.push(E('radialGradient', { id: p + 'sun', cx: '0.5', cy: '0.5', r: '0.5' },
    stop('0', '#FFF6DE', '1') + stop('0.35', '#FFF1CC', '0.8') + stop('1', '#FFF1CC', '0')));
  d.push(E('linearGradient', { id: p + 'far', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#AFC1D1') + stop('1', '#98AEC1')));
  d.push(E('linearGradient', { id: p + 'lit', x1: '0', y1: '0', x2: '0.4', y2: '1' }, stop('0', '#C9D4DD') + stop('1', '#95A5B4')));
  d.push(E('linearGradient', { id: p + 'shd', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#8193A5') + stop('1', '#667A8D')));
  d.push(E('linearGradient', { id: p + 'hill1', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#7FA57C') + stop('1', '#5E8A62')));
  d.push(E('linearGradient', { id: p + 'hill2', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#6A9467') + stop('1', '#4C7A52')));
  d.push(E('linearGradient', { id: p + 'lake', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#6FA5C6') + stop('1', '#4E88AE')));
  d.push(E('linearGradient', { id: p + 'mead', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#7AA565') + stop('1', '#5E8C4F')));
  d.push(E('filter', { id: p + 'soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, E('feGaussianBlur', { stdDeviation: '6' })));
  d.push(E('filter', { id: p + 'mist', x: '-20%', y: '-50%', width: '140%', height: '200%' }, E('feGaussianBlur', { stdDeviation: '14' })));
  let s = '<defs>' + d.join('') + '</defs>';
  s += E('rect', { x: '0', y: '0', width: '1600', height: '1000', style: `fill: url(#${p}sky)` });
  s += E('circle', { cx: '1290', cy: '150', r: '170', style: `fill: url(#${p}sun)` });
  s += E('circle', { cx: '1290', cy: '150', r: '46', style: 'fill: #FFF8E6' });
  // Wolken
  for (const [cx, cy, sc] of [[300, 150, 1.0], [960, 110, 0.8], [1460, 250, 0.7], [620, 90, 0.55]]) {
    let g = '';
    for (const [dx, dy, rx, ry] of [[0, 0, 70, 22], [-50, 8, 44, 16], [52, 6, 50, 18], [18, -12, 40, 20]]) {
      g += E('ellipse', { cx: f(cx + dx * sc), cy: f(cy + dy * sc), rx: f(rx * sc), ry: f(ry * sc), style: 'fill: #FFFFFF; opacity: 0.78' });
    }
    s += E('g', { filter: `url(#${p}soft)` }, g);
  }
  // Vögel (by - 1.5 ist in Python eine Kommazahl ohne f(), darum py())
  for (const [bx, by] of [[520, 172], [540, 162], [506, 186], [556, 178]]) {
    s += E('path', { d: `M${bx - 4} ${py(by - 1.5)}Q${bx - 2} ${by - 3} ${bx} ${by}Q${bx + 2} ${by - 3} ${bx + 4} ${py(by - 1.5)}`, style: 'fill: none; stroke: #33404C; stroke-width: 0.8; stroke-linecap: round' });
  }
  // Ferne Kette mit Schneekappen
  const far = [[0, 470], [70, 420], [150, 395], [230, 430], [300, 380], [380, 410], [470, 360], [520, 400], [1080, 380], [1160, 330], [1230, 370], [1300, 320], [1380, 360], [1450, 340], [1530, 390], [1600, 360], [1600, 600], [0, 600]];
  s += E('polygon', { points: pts(far), style: `fill: url(#${p}far)` });
  for (const [x1, y1] of [[150, 395], [300, 380], [470, 360], [1160, 330], [1300, 320], [1450, 340]]) {
    s += E('polygon', { points: pts([[x1, y1], [x1 - 16, y1 + 16], [x1 - 6, y1 + 13], [x1, y1 + 22], [x1 + 8, y1 + 12], [x1 + 18, y1 + 18]]), style: 'fill: #F4F8FB; opacity: 0.9' });
  }
  // Hauptmassiv: Sonnen- und Schattenseite
  const lit = [[420, 580], [520, 430], [560, 382], [600, 300], [640, 282], [680, 262], [760, 210], [786, 300], [760, 420], [720, 580]];
  const shd = [[760, 210], [800, 232], [840, 250], [930, 282], [980, 318], [1040, 360], [1100, 440], [1170, 580], [720, 580], [760, 420], [786, 300]];
  s += E('polygon', { points: pts(lit), style: `fill: url(#${p}lit)` });
  s += E('polygon', { points: pts(shd), style: `fill: url(#${p}shd)` });
  // Felsbänder
  for (const poly of [[[540, 420], [600, 400], [650, 405], [700, 380]], [[600, 330], [650, 318], [700, 300]], [[820, 360], [880, 350], [950, 370], [1010, 400]], [[800, 420], [870, 440], [940, 430], [1040, 470]], [[560, 480], [620, 470], [690, 490]]]) {
    s += E('polyline', { points: pts(poly), style: 'fill: none; stroke: #5E7082; stroke-width: 2; stroke-opacity: 0.45; stroke-linecap: round' });
  }
  // Schnee auf Gipfel und Firnfeldern
  s += E('polygon', { points: pts([[760, 210], [728, 238], [742, 236], [730, 262], [752, 252], [764, 274], [778, 262], [786, 300], [800, 270], [812, 262], [840, 250], [800, 232]]), style: 'fill: #F7FAFC' });
  s += E('polygon', { points: pts([[786, 300], [800, 270], [812, 262], [840, 250], [880, 262], [860, 286], [826, 296], [806, 318]]), style: 'fill: #D3DEE8' });
  s += E('polygon', { points: pts([[600, 300], [640, 282], [680, 262], [700, 280], [672, 300], [650, 322], [618, 318]]), style: 'fill: #EEF3F7' });
  s += E('polygon', { points: pts([[930, 282], [960, 300], [940, 312], [912, 300]]), style: 'fill: #D3DEE8' });
  // Gletscherzunge mit Spalten
  s += E('path', { d: 'M826 296 C850 330 858 380 872 430 C878 452 860 460 846 440 C836 400 822 350 806 318 Z', style: 'fill: #DCE9F2' });
  for (const yy of [330, 352, 374, 396, 418]) {
    s += E('path', { d: `M${py(820 + (yy - 330) * 0.28)} ${yy} q10 3 22 0`, style: 'fill: none; stroke: #9DB8CC; stroke-width: 1.2' });
  }
  // --- Versteckte Details: Gipfelkreuz + zwei Wanderer
  s += E('rect', { x: '759.2', y: '193', width: '1.6', height: '16', style: 'fill: #3B2A20' });
  s += E('rect', { x: '755.5', y: '197.5', width: '9', height: '1.6', style: 'fill: #3B2A20' });
  s += person(768, 212.5, '#D6423A', 1.0) + person(772.5, 213.2, '#E8B43A', 1.0);
  // Seilschaft auf dem linken Grat
  s += E('polyline', { points: pts([[704, 249], [715.5, 241.5], [727, 234]]), style: 'fill: none; stroke: #E8B43A; stroke-width: 0.35' });
  s += person(704, 250, '#2F6FD6', 0.95) + person(715.5, 242.5, '#D6423A', 0.95) + person(727, 235, '#3E9A5A', 0.95);
  // Steinbock auf Felsband
  s += E('polygon', { points: pts([[832, 336], [860, 334], [866, 340], [828, 342]]), style: 'fill: #A5B3C0' });
  const ib = '#5B4A3A';
  s += E('ellipse', { cx: '846', cy: '330', rx: '4.2', ry: '2.2', style: `fill: ${ib}` });
  for (const lx of [843, 844.6, 847.4, 849]) {
    s += E('rect', { x: f(lx), y: '331.5', width: '0.7', height: '3.6', style: `fill: ${ib}` });
  }
  s += E('path', { d: 'M849.4 329 L851.5 326.2 L853.4 326.6 L852.6 328.8 Z', style: `fill: ${ib}` });
  s += E('path', { d: 'M851.8 326.4 C850.8 323.2 848.6 321.8 846.4 322.8', style: 'fill: none; stroke: #3A2E24; stroke-width: 0.8; stroke-linecap: round' });
  // SAC-Hütte mit Schweizer Fahne
  s += E('polygon', { points: pts([[600, 374], [634, 372], [638, 378], [596, 380]]), style: 'fill: #B9C4CE' });
  s += E('rect', { x: '609', y: '366', width: '14', height: '8', style: 'fill: #8C7B6A' });
  s += E('polygon', { points: pts([[607, 366.5], [616, 360.5], [625, 366.5]]), style: 'fill: #5A4033' });
  s += E('rect', { x: '611.5', y: '368.5', width: '2.2', height: '2', style: 'fill: #F3D38A' });
  s += E('rect', { x: '618.3', y: '368.5', width: '2.2', height: '2', style: 'fill: #F3D38A' });
  s += E('rect', { x: '627.5', y: '359', width: '0.5', height: '15', style: 'fill: #4A4A4A' });
  s += E('rect', { x: '628', y: '359', width: '4.4', height: '4.4', style: 'fill: #D52B1E' });
  s += E('rect', { x: '629.9', y: '359.8', width: '0.8', height: '2.8', style: 'fill: #FFFFFF' });
  s += E('rect', { x: '628.8', y: '360.8', width: '2.8', height: '0.8', style: 'fill: #FFFFFF' });
  // Wasserfall
  s += E('path', { d: 'M1226 500 L1236 500 L1242 610 L1228 610 Z', style: 'fill: #EAF3F8; opacity: 0.75' });
  for (const xx of [1229, 1233, 1237]) {
    s += E('rect', { x: f(xx), y: '504', width: '1', height: '100', style: 'fill: #FFFFFF; opacity: 0.9' });
  }
  s += E('ellipse', { cx: '1236', cy: '612', rx: '22', ry: '8', style: 'fill: #FFFFFF; opacity: 0.6', filter: `url(#${p}soft)` });
  // Talnebel
  s += E('ellipse', { cx: '800', cy: '580', rx: '620', ry: '26', style: 'fill: #FFFFFF; opacity: 0.35', filter: `url(#${p}mist)` });
  // Hügel hinten mit Wald (260 Bäume, zufällig, aber immer gleich)
  s += E('path', { d: 'M0 600 C200 560 360 590 520 572 C700 552 880 600 1060 578 C1240 556 1420 590 1600 566 L1600 760 L0 760 Z', style: `fill: url(#${p}hill1)` });
  let tg = '';
  for (let i = 0; i < 260; i++) {
    const x = rng.uniform(0, 1600);
    const base = 600 - 30 * Math.sin(x / 260) + rng.uniform(4, 60);
    if (x > 700 && x < 760 && base < 610) continue; // Lücke für die Gondel-Talstation
    tg += tree(x, base, rng.uniform(7, 13), rng.choice(['#3E6647', '#46704F', '#365D40']));
  }
  s += tg;
  // Gondelbahn
  s += E('rect', { x: '324', y: '626', width: '20', height: '12', style: 'fill: #9A8E82' });
  s += E('polygon', { points: pts([[322, 627], [334, 619], [346, 627]]), style: 'fill: #5A5048' });
  s += E('rect', { x: '550', y: '384', width: '16', height: '10', style: 'fill: #9A8E82' });
  for (const off of [0, 2.2]) {
    // off = 0 ist in Python eine ganze Zahl ("336"), off = 2.2 eine Kommazahl
    const t = (v) => (off === 0 ? String(v) : py(v));
    s += E('path', { d: `M${t(336 + off)} 624 Q${t(440 + off)} 520 ${t(556 + off)} 388`, style: 'fill: none; stroke: #2E3338; stroke-width: 0.7' });
  }
  for (const [px, pyy] of [[398, 566], [470, 486]]) {
    s += E('polyline', { points: pts([[px - 4, pyy + 40], [px, pyy], [px + 4, pyy + 40]]), style: 'fill: none; stroke: #4A5056; stroke-width: 1' });
    s += E('rect', { x: f(px - 5), y: f(pyy - 1), width: '10', height: '1.4', style: 'fill: #4A5056' });
  }
  s += E('rect', { x: '452.4', y: '492', width: '0.5', height: '5', style: 'fill: #2E3338' });
  s += E('rect', { x: '448.6', y: '496.6', width: '8.4', height: '6.4', rx: '1.2', style: 'fill: #D6423A' });
  s += E('rect', { x: '449.6', y: '497.6', width: '6.4', height: '2.4', style: 'fill: #CFE3F0' });
  // Gleitschirm
  s += E('path', { d: 'M1048 300 Q1060 290 1072 300 L1070 302 Q1060 294 1050 302 Z', style: 'fill: #F07A2B' });
  s += E('path', { d: 'M1054 297 Q1060 293 1066 297', style: 'fill: none; stroke: #FFFFFF; stroke-width: 0.8' });
  for (const lx of [1050, 1056, 1064, 1070]) {
    s += E('line', { x1: f(lx), y1: '302', x2: '1060', y2: '313', style: 'stroke: #3A3F44; stroke-width: 0.25' });
  }
  s += person(1060, 316.5, '#2F6FD6', 0.9);
  // Dorf mit Kirche (Ufer links)
  s += E('path', { d: 'M0 700 C120 660 260 650 420 672 C520 686 600 700 640 712 L0 712 Z', style: `fill: url(#${p}hill2)` });
  for (const [hx, hy, w] of [[160, 684, 16], [186, 690, 14], [214, 682, 18], [296, 684, 16], [322, 690, 14], [350, 686, 18], [380, 694, 14]]) {
    s += E('rect', { x: f(hx), y: f(hy - 10), width: f(w), height: '10', style: 'fill: #B08560' });
    s += E('polygon', { points: pts([[hx - 2, hy - 9.5], [hx + w / 2, hy - 16], [hx + w + 2, hy - 9.5]]), style: 'fill: #5B3A28' });
    s += E('rect', { x: f(hx + 3), y: f(hy - 7), width: '2.6', height: '2.4', style: 'fill: #F3D38A' });
    s += E('rect', { x: f(hx + w - 5.6), y: f(hy - 7), width: '2.6', height: '2.4', style: 'fill: #F3D38A' });
  }
  s += E('rect', { x: '244', y: '660', width: '30', height: '18', style: 'fill: #EDE6DA' });
  s += E('polygon', { points: pts([[242, 661], [259, 650], [276, 661]]), style: 'fill: #6B4A36' });
  s += E('rect', { x: '274', y: '640', width: '9', height: '38', style: 'fill: #EDE6DA' });
  s += E('polygon', { points: pts([[273, 641], [278.5, 622], [284, 641]]), style: 'fill: #3F5A4A' });
  s += E('circle', { cx: '278.5', cy: '648', r: '2', style: 'fill: #C9A34A' });
  // See mit Spiegelung
  s += E('path', { d: 'M0 712 L1600 700 L1600 900 L0 900 Z', style: `fill: url(#${p}lake)` });
  s += E('g', { filter: `url(#${p}soft)`, style: 'opacity: 0.22' },
    E('polygon', { points: pts([[420, 704], [760, 862], [1170, 704]]), style: 'fill: #E6EEF4' }));
  for (const [lx, ly, lw] of [[120, 760, 160], [520, 790, 240], [900, 820, 180], [1320, 760, 200], [700, 860, 300], [1180, 850, 160]]) {
    s += E('rect', { x: f(lx), y: f(ly), width: f(lw), height: '2', rx: '1', style: 'fill: #FFFFFF; opacity: 0.45' });
  }
  // Segelboot
  s += E('path', { d: 'M1104 772 L1140 772 L1134 780 L1110 780 Z', style: 'fill: #7A4F36' });
  s += E('rect', { x: '1121.6', y: '740', width: '0.9', height: '32', style: 'fill: #3B2A20' });
  s += E('polygon', { points: pts([[1123, 742], [1123, 770], [1140, 770]]), style: 'fill: #F4F1E6' });
  s += E('polygon', { points: pts([[1121, 746], [1121, 770], [1108, 770]]), style: 'fill: #E7E2D4' });
  s += person(1112, 772, '#D6423A', 0.85) + person(1130, 772, '#2F6FD6', 0.85);
  s += E('path', { d: 'M1098 783 q12 3 24 0 q12 -3 24 0', style: 'fill: none; stroke: #FFFFFF; stroke-width: 1; opacity: 0.6' });
  // Wiese vorne mit 140 Blumen
  s += E('path', { d: 'M0 880 C300 860 600 890 900 872 C1200 856 1420 880 1600 866 L1600 1000 L0 1000 Z', style: `fill: url(#${p}mead)` });
  let fg = '';
  for (let i = 0; i < 140; i++) {
    const x = rng.uniform(0, 1600), y = rng.uniform(900, 995);
    fg += E('circle', { cx: f(x), cy: f(y), r: f(rng.uniform(1.2, 2.6)), style: `fill: ${rng.choice(['#F4D35E', '#FFFFFF', '#E98AA8', '#B79AE0'])}` });
  }
  s += fg;
  return s;
}

// crop() und begrenze() (Bildausschnitt als viewBox) stehen in ausschnitt.js, damit Seiten
// sie ohne das ganze Panorama laden können. Hier nur weitergereicht.
export { crop, begrenze };

// Die Markierungen der Zoom-Ziele (Kreis + Name), wie im Artboard „Alpenpanorama“.
// massstab verkleinert sie beim Reinzoomen (1 = wie in gen2.py).
export function zoomPunkte(massstab = 1) {
  let s = '';
  for (const [name, x, y] of ZOOM_TARGETS) {
    s += E('circle', { cx: f(x), cy: f(y), r: f(22 * massstab), style: `fill: none; stroke: #FF8A5E; stroke-width: ${f(2.5 * massstab)}` });
    s += E('text', { x: f(x + 28 * massstab), y: f(y + 5 * massstab), style: `font-family: 'Instrument Sans', sans-serif; font-size: ${f(16 * massstab)}px; font-weight: 600; fill: #FFFFFF; paint-order: stroke; stroke: #0C1116; stroke-width: ${f(4 * massstab)}` }, name);
  }
  return s;
}


// Fertiges <svg> des Panoramas für die Seiten.
//   zoom: 1…10   cx, cy: Mittelpunkt im 1600 × 1000-Bild   breite/hoehe: px (null = CSS)
//   punkte: Zoom-Ziele markieren   begrenzen: Ausschnitt im Bild halten
export function panorama({ zoom = 1, cx = 800, cy = 500, breite = 800, hoehe = 500, punkte = false,
  begrenzen = true, label = 'Alpenpanorama', pid = null } = {}) {
  pid = pid ?? uid('al');
  const ratio = breite && hoehe ? breite / hoehe : 1.6;
  if (begrenzen) [cx, cy] = begrenze(cx, cy, zoom, ratio);
  const groesse = breite && hoehe ? { width: f(breite), height: f(hoehe) } : {};
  const inhalt = alpen(pid) + (punkte ? E('g', { 'data-zoompunkte': '' }, zoomPunkte(1 / Math.sqrt(zoom))) : '');
  return E('svg', { ...groesse, viewBox: crop(cx, cy, zoom, ratio), preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': label, style: 'display: block' }, inhalt);
}

// ------------------------------------------------------------------
// BLUME 1200 × 800 in vier Ebenen
// ------------------------------------------------------------------
// Jede Ebene bekommt einen eigenen Unschärfe-Filter: bgf = Hintergrund, flf = Blume,
// fgf = Gras im Vordergrund, bef = Biene. Mögliche Werte: 'b0' (scharf) … 'b4' (sehr unscharf).
// Tiefenschärfe heisst: Nur was in der Schärfeebene liegt, bleibt scharf.
export const BLUR = { b0: 0.01, b1: 2, b2: 5, b3: 10, b4: 18 };

// Die vier Vorgaben aus dem Artboard „Blume“ (gen2.py)
export const BLUME_FOKUS = {
  'Blume (3x Tele)': { bg: 'b3', fl: 'b0', fg: 'b4', bee: 'b2' },
  'Biene': { bg: 'b4', fl: 'b2', fg: 'b4', bee: 'b0' },
  'Makro (alles nah)': { bg: 'b1', fl: 'b0', fg: 'b2', bee: 'b1' },
  'Alles scharf': { bg: 'b0', fl: 'b0', fg: 'b0', bee: 'b0' },
};

export function blume(p, bgf, flf, fgf, bef) {
  const rng = new PyRandom(11);
  const d = [];
  d.push(E('linearGradient', { id: p + 'sky', x1: '0', y1: '0', x2: '0', y2: '1' }, stop('0', '#BFDDEE') + stop('1', '#E6F1EC')));
  d.push(E('radialGradient', { id: p + 'pet', cx: '0.5', cy: '0.9', r: '0.95' }, stop('0', '#FFE6F0') + stop('0.45', '#F6A9C6') + stop('1', '#D9678F')));
  d.push(E('radialGradient', { id: p + 'disc', cx: '0.4', cy: '0.35', r: '0.7' }, stop('0', '#FFE27A') + stop('0.6', '#EDB631') + stop('1', '#B77D12')));
  d.push(E('radialGradient', { id: p + 'drop', cx: '0.35', cy: '0.3', r: '0.75' }, stop('0', '#FFFFFF', '0.95') + stop('0.5', '#E4F2FA', '0.55') + stop('1', '#9CC3DA', '0.35')));
  d.push(E('linearGradient', { id: p + 'leaf', x1: '0', y1: '0', x2: '1', y2: '1' }, stop('0', '#7FB36F') + stop('1', '#3F7A45')));
  for (const [n, sd] of [['b0', '0.01'], ['b1', '2'], ['b2', '5'], ['b3', '10'], ['b4', '18']]) {
    d.push(E('filter', { id: p + n, x: '-20%', y: '-20%', width: '140%', height: '140%' }, E('feGaussianBlur', { stdDeviation: sd })));
  }
  let s = '<defs>' + d.join('') + '</defs>';
  // Hintergrund: Himmel, Hügel, Büsche, Wiese mit 70 Blumen
  let bg = E('rect', { x: '0', y: '0', width: '1200', height: '800', style: `fill: url(#${p}sky)` });
  bg += E('ellipse', { cx: '260', cy: '470', rx: '520', ry: '150', style: 'fill: #9CC49A' });
  bg += E('ellipse', { cx: '980', cy: '460', rx: '480', ry: '140', style: 'fill: #8DB88C' });
  for (const [cx, cy, r, c] of [[150, 380, 70, '#5E8C5E'], [230, 360, 56, '#6A9A69'], [1000, 370, 80, '#5E8C5E'], [920, 396, 50, '#6A9A69'], [620, 410, 40, '#6E9E6C']]) {
    bg += E('circle', { cx: f(cx), cy: f(cy), r: f(r), style: `fill: ${c}` });
  }
  bg += E('rect', { x: '0', y: '520', width: '1200', height: '280', style: 'fill: #7FB07A' });
  for (let i = 0; i < 70; i++) {
    bg += E('circle', { cx: f(rng.uniform(0, 1200)), cy: f(rng.uniform(540, 790)), r: f(rng.uniform(5, 12)), style: `fill: ${rng.choice(['#F4D35E', '#FFFFFF', '#E98AA8', '#C7A6F0'])}` });
  }
  s += E('g', { filter: `url(#${p}${bgf})` }, bg);
  // Blume: Stiel, zwei Blätter, 14 Blütenblätter, Körbchen, Tautropfen
  let fl = E('path', { d: 'M600 420 C606 520 594 620 604 820', style: 'fill: none; stroke: #3E7A46; stroke-width: 14; stroke-linecap: round' });
  fl += E('path', { d: 'M604 640 C660 600 730 600 780 620 C730 650 660 660 604 640 Z', style: `fill: url(#${p}leaf)` });
  fl += E('path', { d: 'M604 640 C680 626 730 624 780 620', style: 'fill: none; stroke: #CFE6C4; stroke-width: 2; opacity: 0.7' });
  fl += E('path', { d: 'M600 700 C540 660 470 668 430 690 C480 716 548 718 600 700 Z', style: `fill: url(#${p}leaf)` });
  let petals = '';
  for (let i = 0; i < 14; i++) {
    const a = i * 360 / 14;
    petals += E('g', { transform: `rotate(${f(a)} 600 400)` },
      E('path', { d: 'M600 400 C574 360 566 262 600 196 C634 262 626 360 600 400 Z', style: `fill: url(#${p}pet)` }) +
      E('path', { d: 'M600 392 C596 330 596 270 600 214', style: 'fill: none; stroke: #FFFFFF; stroke-width: 1.4; stroke-opacity: 0.55' }) +
      E('path', { d: 'M594 380 C586 330 586 290 590 246', style: 'fill: none; stroke: #C95A83; stroke-width: 0.9; stroke-opacity: 0.45' }) +
      E('path', { d: 'M606 380 C614 330 614 290 610 246', style: 'fill: none; stroke: #C95A83; stroke-width: 0.9; stroke-opacity: 0.45' }));
  }
  fl += petals;
  fl += E('circle', { cx: '600', cy: '400', r: '62', style: `fill: url(#${p}disc)` });
  // Samen im Körbchen, angeordnet nach dem goldenen Winkel (wie bei einer Sonnenblume)
  const ga = Math.PI * (3 - Math.sqrt(5));
  let flo = '';
  for (let i = 0; i < 170; i++) {
    const r = 4.4 * Math.sqrt(i), th = i * ga;
    if (r > 58) break;
    flo += E('circle', { cx: f(600 + r * Math.cos(th)), cy: f(400 + r * Math.sin(th)), r: f(1.6 + r * 0.02), style: 'fill: #9C6A0E; opacity: 0.55' });
  }
  fl += flo;
  const rad = (g) => g * (Math.PI / 180); // wie Pythons math.radians
  for (const [dx, dy, r] of [[600 + 120 * Math.cos(rad(-60)), 400 + 120 * Math.sin(rad(-60)), 9], [600 + 150 * Math.cos(rad(160)), 400 + 150 * Math.sin(rad(160)), 12], [600 + 95 * Math.cos(rad(40)), 400 + 95 * Math.sin(rad(40)), 7], [612, 312, 5]]) {
    fl += E('circle', { cx: f(dx), cy: f(dy + 2), r: f(r), style: 'fill: #B04C74; opacity: 0.25' });
    fl += E('circle', { cx: f(dx), cy: f(dy), r: f(r), style: `fill: url(#${p}drop)` });
    fl += E('circle', { cx: f(dx - r * 0.35), cy: f(dy - r * 0.4), r: f(r * 0.25), style: 'fill: #FFFFFF' });
  }
  s += E('g', { filter: `url(#${p}${flf})` }, fl);
  // Biene
  let bee = '';
  const bx = 330, by = 250;
  bee += E('ellipse', { cx: f(bx - 6), cy: f(by - 22), rx: '20', ry: '11', transform: `rotate(-30 ${bx - 6} ${by - 22})`, style: 'fill: #EAF4FB; opacity: 0.7' });
  bee += E('ellipse', { cx: f(bx + 10), cy: f(by - 24), rx: '18', ry: '10', transform: `rotate(20 ${bx + 10} ${by - 24})`, style: 'fill: #EAF4FB; opacity: 0.6' });
  bee += E('ellipse', { cx: f(bx), cy: f(by), rx: '26', ry: '16', style: 'fill: #E8B43A' });
  for (const sx of [-10, 0, 10]) {
    bee += E('rect', { x: f(bx + sx - 2.5), y: f(by - 15), width: '5', height: '30', rx: '2', style: 'fill: #2A2320' });
  }
  bee += E('circle', { cx: f(bx + 26), cy: f(by - 2), r: '10', style: 'fill: #2A2320' });
  bee += E('circle', { cx: f(bx + 30), cy: f(by - 5), r: '2.4', style: 'fill: #FFFFFF; opacity: 0.8' });
  bee += E('path', { d: `M${bx + 30} ${by - 11} q4 -8 10 -10 M${bx + 26} ${by - 12} q2 -9 6 -12`, style: 'fill: none; stroke: #2A2320; stroke-width: 1.6; stroke-linecap: round' });
  s += E('g', { filter: `url(#${p}${bef})` }, bee);
  // Gras ganz vorne (22 Halme)
  let fg = '';
  for (let i = 0; i < 22; i++) {
    const x = rng.uniform(-40, 1240), h = rng.uniform(160, 300), lean = rng.uniform(-60, 60);
    fg += E('path', { d: `M${f(x)} 820 Q${f(x + lean * 0.4)} ${f(820 - h * 0.6)} ${f(x + lean)} ${f(820 - h)} Q${f(x + lean * 0.4 + 8)} ${f(820 - h * 0.55)} ${f(x + 14)} 820 Z`, style: `fill: ${rng.choice(['#4E8A4A', '#5E9A56', '#3F7A40'])}` });
  }
  s += E('g', { filter: `url(#${p}${fgf})` }, fg);
  return s;
}

// Stufenloser Fokus (Erweiterung für Spielwiese und Makro-Demo, nicht in scene.py):
// Jede Ebene liegt in einer Tiefe von 0 (ganz vorne) bis 1 (ganz hinten). Die Unschärfe
// wächst mit dem Abstand zur Schärfeebene. Bei fokus = 0.5 (auf der Blume) ergibt das
// ungefähr die Vorgabe „Blume (3x Tele)“.
export const BLUME_TIEFE = { fg: 0, bee: 0.3, fl: 0.5, bg: 1 };
export function blumeUnschaerfe(fokus, staerke = 24) {
  const aus = {};
  for (const [ebene, tiefe] of Object.entries(BLUME_TIEFE)) {
    aus[ebene] = Math.max(0.01, Math.min(18, staerke * Math.abs(tiefe - fokus)));
  }
  return aus;
}

// Fertiges <svg> der Blume.
//   fokus: Name einer Vorgabe (BLUME_FOKUS) oder Zahl 0…1 (stufenlos, siehe oben)
//   staerke: nur bei Zahl: wie schnell die Unschärfe zunimmt (grosse Blende = viel)
export function blumeBild({ fokus = 'Blume (3x Tele)', staerke = 24, breite = 600, hoehe = 400,
  label = 'Blume mit Tautropfen, Biene und Wiese', pid = null } = {}) {
  pid = pid ?? uid('bl');
  const groesse = breite && hoehe ? { width: f(breite), height: f(hoehe) } : {};
  let inhalt;
  if (typeof fokus === 'number') {
    // Eigene Filter c-bg, c-fl, … mit den berechneten Werten; die Seite kann deren
    // stdDeviation später direkt ändern, ohne alles neu zu zeichnen. Der Filterbereich ist
    // grösser als bei b0–b4: Bei starker Unschärfe an der kleinen Biene würde der Rand
    // sonst sichtbar abgeschnitten (ein unscharfes Rechteck).
    const u = blumeUnschaerfe(fokus, staerke);
    const defs = Object.entries(u).map(([ebene, sd]) =>
      E('filter', { id: `${pid}c-${ebene}`, x: '-60%', y: '-60%', width: '220%', height: '220%' }, E('feGaussianBlur', { stdDeviation: f(sd) }))).join('');
    inhalt = E('defs', {}, defs) + blume(pid, 'c-bg', 'c-fl', 'c-fg', 'c-bee');
  } else {
    const fx = BLUME_FOKUS[fokus];
    if (!fx) throw new Error(`Unbekannte Fokus-Vorgabe: ${fokus}`);
    inhalt = blume(pid, fx.bg, fx.fl, fx.fg, fx.bee);
  }
  return E('svg', { ...groesse, viewBox: '0 0 1200 800', preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': label, style: 'display: block' }, inhalt);
}

// ------------------------------------------------------------------
// INNENLEBEN: SE (2016), Kiesel 1, Kiesel 1 Pro im selben Massstab
// ------------------------------------------------------------------
// Nummer-Punkt eines Bauteils (orange = fällt beim Kiesel weg)
function comp(labelNo, shape, cx, cy, heat = false) {
  const col = heat ? '#FF8A5E' : '#5CC3DB';
  return shape + E('circle', { cx: f(cx), cy: f(cy), r: '11', style: `fill: ${col}` }) +
    E('text', { x: f(cx), y: f(cy + 4.5), style: "font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 600; fill: #06222A; text-anchor: middle" }, String(labelNo));
}

function speaker(x, y, w, h, s) {
  let g = E('rect', { x: f(x), y: f(y), width: f(w), height: f(h), rx: f(1.2 * s), style: 'fill: #2A3036; stroke: #45505A; stroke-width: 1' });
  for (let i = 0; i < Math.trunc(w / (2.2 * s)); i++) {
    for (let j = 0; j < Math.trunc(h / (2.2 * s)); j++) {
      g += E('circle', { cx: f(x + 1.4 * s + i * 2.2 * s), cy: f(y + 1.4 * s + j * 2.2 * s), r: f(0.45 * s), style: 'fill: #11161A' });
    }
  }
  return g;
}

function chip(x, y, w, h, fill, label = null) {
  let g = E('rect', { x: f(x), y: f(y), width: f(w), height: f(h), rx: '3', style: `fill: ${fill}; stroke: #0E1318; stroke-width: 1` });
  if (label) {
    g += E('text', { x: f(x + w / 2), y: f(y + h / 2 + 4), style: "font-family: 'Instrument Sans', sans-serif; font-size: 11px; font-weight: 600; fill: #E7ECF0; text-anchor: middle" }, label);
  }
  return g;
}

// kind: 'se' | 'k1' | 'pro'; ox, oy = Ecke oben links; s = px pro mm.
// Rückgabe wie in Python: [SVG-Text, Legende als [[Nummer, Name, fälltWeg], …]]
export function phoneOpen(kind, ox, oy, s) {
  const [W, H, R] = kind !== 'pro' ? [58.6, 123.8, 8.6] : [64.2, 131.5, 10.6];
  const X = (mm) => ox + mm * s;
  const Y = (mm) => oy + mm * s;
  let g = E('rect', { x: f(ox), y: f(oy), width: f(W * s), height: f(H * s), rx: f(R * s), style: 'fill: #1A2129; stroke: #56626E; stroke-width: 2' });
  g += E('rect', { x: f(ox + 1.2 * s), y: f(oy + 1.2 * s), width: f((W - 2.4) * s), height: f((H - 2.4) * s), rx: f((R - 1.2) * s), style: 'fill: none; stroke: #2E3843; stroke-width: 1' });
  const legend = [];
  let n = 0;
  const L = (name, heat = false) => { n += 1; legend.push([n, name, heat]); return n; };
  if (kind === 'se') {
    g += E('rect', { x: f(X(4)), y: f(Y(5)), width: f(50 * s), height: f(42 * s), rx: '6', style: 'fill: #1E3A2F; stroke: #2F5646; stroke-width: 1' });
    g += chip(X(18), Y(14), 14 * s, 14 * s, '#2B3138', 'A9') + chip(X(35), Y(14), 9 * s, 9 * s, '#3A424B') + chip(X(35), Y(27), 12 * s, 7 * s, '#3A424B');
    g += comp(L('Platine mit A9-Chip'), '', X(10), Y(38));
    g += E('circle', { cx: f(X(8.5)), cy: f(Y(9)), r: f(3.6 * s), style: 'fill: #0A0E13; stroke: #56626E; stroke-width: 1.5' });
    g += comp(L('Kamera (12 MP)'), '', X(8.5), Y(9) - 26);
    g += E('rect', { x: f(X(6)), y: f(Y(50)), width: f(46 * s), height: f(47 * s), rx: '6', style: 'fill: #3B4C5A; stroke: #4E6272' });
    g += E('text', { x: f(X(29)), y: f(Y(75)), style: "font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 600; fill: #E7ECF0; text-anchor: middle" }, '1624 mAh');
    g += comp(L('Akku'), '', X(10), Y(55));
    g += E('rect', { x: f(X(52.5)), y: f(Y(58)), width: f(4.8 * s), height: f(22 * s), rx: '3', style: 'fill: none; stroke: #FF8A5E; stroke-width: 2; stroke-dasharray: 5 4' });
    g += comp(L('SIM-Schlitten', true), '', X(55), Y(84) + 14);
    g += E('rect', { x: f(X(6)), y: f(Y(101)), width: f(14 * s), height: f(8 * s), rx: '3', style: 'fill: #5A6570' });
    g += comp(L('Vibrationsmotor'), '', X(13), Y(105));
    g += speaker(X(37), Y(103), 15 * s, 12 * s, s);
    g += comp(L('Lautsprecher'), '', X(44.5), Y(109));
    g += E('circle', { cx: f(X(29.3)), cy: f(Y(112)), r: f(5.4 * s), style: 'fill: none; stroke: #FF8A5E; stroke-width: 2; stroke-dasharray: 5 4' });
    g += comp(L('Home-Button', true), '', X(29.3), Y(112));
    g += E('rect', { x: f(X(7)), y: f(Y(112)), width: f(8 * s), height: f(8 * s), rx: '3', style: 'fill: none; stroke: #FF8A5E; stroke-width: 2; stroke-dasharray: 5 4' });
    g += comp(L('Kopfhörerbuchse', true), '', X(11), Y(116));
    g += E('rect', { x: f(X(25)), y: f(Y(120)), width: f(8.6 * s), height: f(2.6 * s), rx: '3', style: 'fill: #9AA3AD' });
    g += comp(L('Lightning'), '', X(40), Y(121.5));
  } else {
    const pro = kind === 'pro';
    g += E('rect', { x: f(X(4)), y: f(Y(4.5)), width: f((W - 8) * s), height: f(34 * s), rx: '6', style: 'fill: #1E3A2F; stroke: #2F5646; stroke-width: 1' });
    g += chip(X(W / 2 - 7), Y(12), 14 * s, 14 * s, '#0E7490', 'A20') + chip(X(W / 2 + 9), Y(12), 9 * s, 9 * s, '#3A424B') + chip(X(6.5), Y(27), 10 * s, 7 * s, '#3A424B');
    for (let i = 0; i < 3; i++) {
      g += E('rect', { x: f(X(W - 16 + i * 3.4)), y: f(Y(30)), width: f(2.4 * s), height: f(4 * s), rx: '1.5', style: 'fill: #FF9A2E' });
    }
    g += comp(L('Platine mit A20 Pro (abgespeckt)'), '', X(W / 2), Y(31));
    g += comp(L('Privacy-Schalter: Kamera, Mikrofon, GPS'), '', X(W - 12), Y(30) - 18);
    if (pro) {
      g += E('rect', { x: f(X(W / 2 - 12)), y: f(Y(8)), width: f(24 * s), height: f(24 * s), rx: '8', style: 'fill: #CF8E5F; opacity: 0.35; stroke: #CF8E5F; stroke-width: 2; stroke-dasharray: 6 4' });
      g += comp(L('Mini-Vapor-Chamber'), '', X(W / 2 - 12), Y(8));
    }
    const camR = 6.4;
    const cm = !pro ? 9.6 : 10.6;
    g += E('circle', { cx: f(X(cm)), cy: f(Y(cm)), r: f(camR * s), style: 'fill: #0A0E13; stroke: #56626E; stroke-width: 1.5' });
    g += comp(L('Kamera 0.5x bis 1x (50 MP)'), '', X(cm), Y(cm));
    if (pro) {
      g += E('circle', { cx: f(X(27)), cy: f(Y(10.6)), r: f(6 * s), style: 'fill: #0A0E13; stroke: #56626E; stroke-width: 1.5' });
      g += comp(L('3x-Tele mit OIS'), '', X(27), Y(10.6));
    }
    const fx = X(!pro ? 23.6 : 40.8);
    g += E('circle', { cx: f(fx), cy: f(Y(cm)), r: f(2.4 * s), style: 'fill: #F3EEDF; stroke: #56626E; stroke-width: 1' });
    g += comp(L('RGB-Blitz'), '', fx + 22, Y(cm));
    g += E('rect', { x: f(X(W / 2 - 9)), y: f(Y(1.6)), width: f(18 * s), height: f(4.4 * s), rx: f(2.2 * s), style: 'fill: none; stroke: #97A4B0; stroke-width: 1.5; stroke-dasharray: 4 3' });
    g += comp(L('Face ID (Vorderseite)'), '', X(W / 2 + 13), Y(3.8));
    const top = 41, bot = H - 16;
    g += E('rect', { x: f(X(5)), y: f(Y(top)), width: f((W - 10) * s), height: f((bot - top) * s), rx: '8', style: 'fill: #3B4C5A; stroke: #4E6272' });
    g += E('circle', { cx: f(X(W / 2)), cy: f(Y(top + (bot - top) * 0.42)), r: f(18 * s), style: 'fill: none; stroke: #C98A5B; stroke-width: 5' });
    g += E('circle', { cx: f(X(W / 2)), cy: f(Y(top + (bot - top) * 0.42)), r: f(13 * s), style: 'fill: none; stroke: #C98A5B; stroke-width: 3' });
    g += E('text', { x: f(X(W / 2)), y: f(Y(bot - 9)), style: "font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 600; fill: #E7ECF0; text-anchor: middle" }, pro ? 'ca. 3600 mAh' : 'ca. 3000 mAh');
    g += comp(L('Akku, Silizium-Kohlenstoff'), '', X(10), Y(top + 5));
    g += comp(L('MagSafe-Spule'), '', X(W / 2 + 18) + 8, Y(top + (bot - top) * 0.42));
    g += E('rect', { x: f(X(6)), y: f(Y(H - 13)), width: f(15 * s), height: f(7 * s), rx: '3', style: 'fill: #5A6570' });
    g += comp(L('Vibrationsmotor'), '', X(13.5), Y(H - 9.5));
    g += speaker(X(W - 21), Y(H - 13.5), 15 * s, 9 * s, s);
    g += comp(L('Lautsprecher'), '', X(W - 13.5), Y(H - 9));
    g += E('rect', { x: f(X(W / 2 - 4.5)), y: f(Y(H - 3.4)), width: f(9 * s), height: f(2.8 * s), rx: '3', style: 'fill: #9AA3AD' });
    g += comp(L('USB-C'), '', X(W / 2 + 10), Y(H - 2));
  }
  return [g, legend];
}

// Fertiges <svg> fürs Innenleben, wie im Artboard (380 × 520, Massstab 3.4 px pro mm).
// Rückgabe: { svg, legende: [{ nr, name, faelltWeg }] }
export function innenleben({ modell = 'pro', massstab = 3.4, breite = 380, hoehe = 520, label = null } = {}) {
  const W = modell === 'pro' ? 64.2 : 58.6;
  const [g, leg] = phoneOpen(modell, (breite - W * massstab) / 2, 30, massstab);
  const name = { se: 'iPhone SE (2016)', k1: 'Kiesel 1', pro: 'Kiesel 1 Pro' }[modell];
  const svg = E('svg', { width: f(breite), height: f(hoehe), viewBox: `0 0 ${f(breite)} ${f(hoehe)}`, role: 'img', 'aria-label': label ?? `Innenleben ${name}`, style: 'display: block' }, g);
  return { svg, legende: leg.map(([nr, n, heat]) => ({ nr, name: n, faelltWeg: heat })) };
}
