// Innenleben als Einzelteile, für die Akku-Story der Modellseiten (Etappe 4).
//
// phoneOpen() in scene.js zeichnet das geöffnete Handy als EIN Stück SVG-Text. Damit
// kann nichts einzeln herausfliegen. innenteile() liefert darum jedes Bauteil als eigenes
// kleines <svg>, das die Seite frei verschieben, drehen und ausblenden kann.
//
// Wichtig: Die Teile zeichnen Zeichen für Zeichen dasselbe wie phoneOpen() (gleiche
// Koordinaten, gleiche Helfer chip/speaker). Legt man alle Teile übereinander, sieht es
// also genau aus wie die Vorlage. Das prüft `npm run pruefe:modellseiten`.
// Neu gezeichnet sind nur die drei Teile, die beim Kiesel wegfallen: Klinke, SIM-Schlitten
// und Home-Button. In phoneOpen() sind sie bloss gestrichelte Umrisse ("hier wird Platz
// frei"). Diese Umrisse gibt es hier auch, als eigene Teile luecke-klinke usw.
//
// Koordinaten: wie phoneOpen(kind, ox, oy, s) in Pixeln, s = Pixel pro Millimeter.
// Jedes Teil: { id, x, y, w, h, svg }. x/y/w/h ist das Rechteck, in dem es liegt
// (mit 3 px Rand für Striche), svg ist ein <svg> genau dieser Grösse. Seine viewBox
// schneidet dieses Rechteck aus der ganzen Zeichnung aus, darum stimmen die Zahlen
// darin mit phoneOpen() überein.
import { E, f } from './svg.js';
import { chip, speaker } from './scene.js';

// Aussenmasse in mm wie in phoneOpen(): Breite, Höhe, Eckradius
export const INNEN_MASSE = { se: [58.6, 123.8, 8.6], k1: [58.6, 123.8, 8.6], pro: [64.2, 131.5, 10.6] };

// Gehäusewand für die Schrägansicht der Akku-Story (dunkler als der Boden, Rand wie der Rahmen)
export const INNEN_WAND = { fuellung: '#262F38', rand: '#56626E' };

const RAND = 3;
function teil(id, x, y, w, h, inhalt) {
  const bx = x - RAND, by = y - RAND, bw = w + 2 * RAND, bh = h + 2 * RAND;
  const svg = E('svg', { width: f(bw), height: f(bh), viewBox: `${f(bx)} ${f(by)} ${f(bw)} ${f(bh)}`, 'aria-hidden': 'true' }, inhalt);
  return { id, x: bx, y: by, w: bw, h: bh, svg };
}

// kind: 'se' | 'k1' | 'pro'; ox, oy = Ecke oben links; s = px pro mm
export function innenteile(kind, ox, oy, s) {
  const [W, H, R] = INNEN_MASSE[kind];
  const X = (mm) => ox + mm * s;
  const Y = (mm) => oy + mm * s;
  const T = [];

  T.push(teil('gehaeuse', ox, oy, W * s, H * s,
    E('rect', { x: f(ox), y: f(oy), width: f(W * s), height: f(H * s), rx: f(R * s), style: 'fill: #1A2129; stroke: #56626E; stroke-width: 2' }) +
    E('rect', { x: f(ox + 1.2 * s), y: f(oy + 1.2 * s), width: f((W - 2.4) * s), height: f((H - 2.4) * s), rx: f((R - 1.2) * s), style: 'fill: none; stroke: #2E3843; stroke-width: 1' })));

  if (kind === 'se') {
    T.push(teil('platine', X(4), Y(5), 50 * s, 42 * s,
      E('rect', { x: f(X(4)), y: f(Y(5)), width: f(50 * s), height: f(42 * s), rx: '6', style: 'fill: #1E3A2F; stroke: #2F5646; stroke-width: 1' }) +
      chip(X(18), Y(14), 14 * s, 14 * s, '#2B3138', 'A9') + chip(X(35), Y(14), 9 * s, 9 * s, '#3A424B') + chip(X(35), Y(27), 12 * s, 7 * s, '#3A424B')));
    T.push(teil('kamera', X(8.5) - 3.6 * s, Y(9) - 3.6 * s, 7.2 * s, 7.2 * s,
      E('circle', { cx: f(X(8.5)), cy: f(Y(9)), r: f(3.6 * s), style: 'fill: #0A0E13; stroke: #56626E; stroke-width: 1.5' })));
    T.push(teil('akku', X(6), Y(50), 46 * s, 47 * s,
      E('rect', { x: f(X(6)), y: f(Y(50)), width: f(46 * s), height: f(47 * s), rx: '6', style: 'fill: #3B4C5A; stroke: #4E6272' })));
    // Die Lücken (gestrichelt, orange) liegen unter den Teilen und werden sichtbar, wenn das Teil geht
    T.push(teil('luecke-sim', X(52.5), Y(58), 4.8 * s, 22 * s,
      E('rect', { x: f(X(52.5)), y: f(Y(58)), width: f(4.8 * s), height: f(22 * s), rx: '3', style: 'fill: none; stroke: #FF8A5E; stroke-width: 2; stroke-dasharray: 5 4' })));
    T.push(teil('luecke-home', X(29.3) - 5.4 * s, Y(112) - 5.4 * s, 10.8 * s, 10.8 * s,
      E('circle', { cx: f(X(29.3)), cy: f(Y(112)), r: f(5.4 * s), style: 'fill: none; stroke: #FF8A5E; stroke-width: 2; stroke-dasharray: 5 4' })));
    T.push(teil('luecke-klinke', X(7), Y(112), 8 * s, 8 * s,
      E('rect', { x: f(X(7)), y: f(Y(112)), width: f(8 * s), height: f(8 * s), rx: '3', style: 'fill: none; stroke: #FF8A5E; stroke-width: 2; stroke-dasharray: 5 4' })));
    T.push(teil('motor', X(6), Y(101), 14 * s, 8 * s,
      E('rect', { x: f(X(6)), y: f(Y(101)), width: f(14 * s), height: f(8 * s), rx: '3', style: 'fill: #5A6570' })));
    T.push(teil('lautsprecher', X(37), Y(103), 15 * s, 12 * s, speaker(X(37), Y(103), 15 * s, 12 * s, s)));
    T.push(teil('anschluss', X(25), Y(120), 8.6 * s, 2.6 * s,
      E('rect', { x: f(X(25)), y: f(Y(120)), width: f(8.6 * s), height: f(2.6 * s), rx: '3', style: 'fill: #9AA3AD' })));

    // ── Neu: die drei Teile, die wegfallen, als echte Bauteile ──
    // SIM-Schlitten: silberner Schlitten mit goldener Nano-SIM
    T.push(teil('sim', X(52.5), Y(58), 4.8 * s, 22 * s,
      E('rect', { x: f(X(52.5)), y: f(Y(58)), width: f(4.8 * s), height: f(22 * s), rx: '3', style: 'fill: #9AA3AD; stroke: #C4CBD2; stroke-width: 1' }) +
      E('rect', { x: f(X(53.3)), y: f(Y(62)), width: f(3.2 * s), height: f(12.3 * s), rx: '2', style: 'fill: #C9A45C; stroke: #8E7440; stroke-width: 1' }) +
      E('circle', { cx: f(X(54.9)), cy: f(Y(77.6)), r: f(0.7 * s), style: 'fill: #56626E' })));
    // Home-Button: Metallring mit Touch-ID-Sensor
    T.push(teil('home', X(29.3) - 5.4 * s, Y(112) - 5.4 * s, 10.8 * s, 10.8 * s,
      E('circle', { cx: f(X(29.3)), cy: f(Y(112)), r: f(5.4 * s), style: 'fill: #20262D; stroke: #9AA3AD; stroke-width: 2.5' }) +
      E('circle', { cx: f(X(29.3)), cy: f(Y(112)), r: f(3.6 * s), style: 'fill: none; stroke: #45505A; stroke-width: 1.5' }) +
      E('circle', { cx: f(X(29.3)), cy: f(Y(112)), r: f(2 * s), style: 'fill: none; stroke: #45505A; stroke-width: 1' })));
    // Klinke: Metallblock mit Buchse
    T.push(teil('klinke', X(7), Y(112), 8 * s, 8 * s,
      E('rect', { x: f(X(7)), y: f(Y(112)), width: f(8 * s), height: f(8 * s), rx: '3', style: 'fill: #5A6570; stroke: #7C8894; stroke-width: 1' }) +
      E('circle', { cx: f(X(11)), cy: f(Y(116)), r: f(2.2 * s), style: 'fill: #9AA3AD' }) +
      E('circle', { cx: f(X(11)), cy: f(Y(116)), r: f(1.4 * s), style: 'fill: #0A0E13' })));
  } else {
    const pro = kind === 'pro';
    T.push(teil('platine', X(4), Y(4.5), (W - 8) * s, 34 * s,
      E('rect', { x: f(X(4)), y: f(Y(4.5)), width: f((W - 8) * s), height: f(34 * s), rx: '6', style: 'fill: #1E3A2F; stroke: #2F5646; stroke-width: 1' }) +
      chip(X(W / 2 - 7), Y(12), 14 * s, 14 * s, '#0E7490', 'A20') + chip(X(W / 2 + 9), Y(12), 9 * s, 9 * s, '#3A424B') + chip(X(6.5), Y(27), 10 * s, 7 * s, '#3A424B')));
    let schalter = '';
    for (let i = 0; i < 3; i++) {
      schalter += E('rect', { x: f(X(W - 16 + i * 3.4)), y: f(Y(30)), width: f(2.4 * s), height: f(4 * s), rx: '1.5', style: 'fill: #FF9A2E' });
    }
    T.push(teil('privacy', X(W - 16), Y(30), (2 * 3.4 + 2.4) * s, 4 * s, schalter));
    if (pro) {
      T.push(teil('vapor', X(W / 2 - 12), Y(8), 24 * s, 24 * s,
        E('rect', { x: f(X(W / 2 - 12)), y: f(Y(8)), width: f(24 * s), height: f(24 * s), rx: '8', style: 'fill: #CF8E5F; opacity: 0.35; stroke: #CF8E5F; stroke-width: 2; stroke-dasharray: 6 4' })));
    }
    const camR = 6.4;
    const cm = !pro ? 9.6 : 10.6;
    T.push(teil('kamera', X(cm) - camR * s, Y(cm) - camR * s, 2 * camR * s, 2 * camR * s,
      E('circle', { cx: f(X(cm)), cy: f(Y(cm)), r: f(camR * s), style: 'fill: #0A0E13; stroke: #56626E; stroke-width: 1.5' })));
    if (pro) {
      T.push(teil('tele', X(27) - 6 * s, Y(10.6) - 6 * s, 12 * s, 12 * s,
        E('circle', { cx: f(X(27)), cy: f(Y(10.6)), r: f(6 * s), style: 'fill: #0A0E13; stroke: #56626E; stroke-width: 1.5' })));
    }
    const fx = X(!pro ? 23.6 : 40.8);
    T.push(teil('blitz', fx - 2.4 * s, Y(cm) - 2.4 * s, 4.8 * s, 4.8 * s,
      E('circle', { cx: f(fx), cy: f(Y(cm)), r: f(2.4 * s), style: 'fill: #F3EEDF; stroke: #56626E; stroke-width: 1' })));
    T.push(teil('faceid', X(W / 2 - 9), Y(1.6), 18 * s, 4.4 * s,
      E('rect', { x: f(X(W / 2 - 9)), y: f(Y(1.6)), width: f(18 * s), height: f(4.4 * s), rx: f(2.2 * s), style: 'fill: none; stroke: #97A4B0; stroke-width: 1.5; stroke-dasharray: 4 3' })));
    const top = 41, bot = H - 16;
    T.push(teil('akku', X(5), Y(top), (W - 10) * s, (bot - top) * s,
      E('rect', { x: f(X(5)), y: f(Y(top)), width: f((W - 10) * s), height: f((bot - top) * s), rx: '8', style: 'fill: #3B4C5A; stroke: #4E6272' })));
    const my = Y(top + (bot - top) * 0.42);
    T.push(teil('magsafe', X(W / 2) - 18 * s - 2.5, my - 18 * s - 2.5, 36 * s + 5, 36 * s + 5,
      E('circle', { cx: f(X(W / 2)), cy: f(my), r: f(18 * s), style: 'fill: none; stroke: #C98A5B; stroke-width: 5' }) +
      E('circle', { cx: f(X(W / 2)), cy: f(my), r: f(13 * s), style: 'fill: none; stroke: #C98A5B; stroke-width: 3' })));
    T.push(teil('motor', X(6), Y(H - 13), 15 * s, 7 * s,
      E('rect', { x: f(X(6)), y: f(Y(H - 13)), width: f(15 * s), height: f(7 * s), rx: '3', style: 'fill: #5A6570' })));
    T.push(teil('lautsprecher', X(W - 21), Y(H - 13.5), 15 * s, 9 * s, speaker(X(W - 21), Y(H - 13.5), 15 * s, 9 * s, s)));
    T.push(teil('anschluss', X(W / 2 - 4.5), Y(H - 3.4), 9 * s, 2.8 * s,
      E('rect', { x: f(X(W / 2 - 4.5)), y: f(Y(H - 3.4)), width: f(9 * s), height: f(2.8 * s), rx: '3', style: 'fill: #9AA3AD' })));
  }
  return T;
}

// Wo steht die Akku-Beschriftung ("1624 mAh" bzw. "ca. 3000 mAh")? Mitte der Schrift in px.
export function akkuText(kind, ox, oy, s) {
  const [W, H] = INNEN_MASSE[kind];
  if (kind === 'se') return { x: ox + 29 * s, y: oy + 75 * s };
  return { x: ox + (W / 2) * s, y: oy + (H - 16 - 9) * s };
}
