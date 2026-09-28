// Bauplan eines Kiesels: alles, was das 3D-Modell über ein Gerät wissen muss, als reine Zahlen.
//
// Warum ein Bauplan und keine zwei Modelle?
//   Kiesel 1 und Pro unterscheiden sich nur in Daten: 5.6 mm breiter, 7.7 mm höher, 1 mm mehr
//   Eckradius, eine Kamera mehr. Alles andere (Rahmen, Glas, Knöpfe, Buchse, Licht) ist gleich.
//   Also beschreibt bauplan() das Gerät, und modell.js baut aus JEDEM Bauplan ein Handy.
//   Ein Fix am Modell wirkt so immer für beide, und die Zahlen lassen sich ohne Browser gegen
//   die 2D-Zeichnung prüfen (npm run pruefe:bauplan).
//
// Datei ohne three.js: läuft in Node (Test) und im Browser.
//
// Quellen:
//   Masse, Eckradius, Dicke, Anzahl Kameras    data/geraete.js (über MODELS in models.js)
//   Kamerareihe                                 camrow() = camrow() in design/generator/lib.py
//   Knöpfe                                      geo() und KNOPF_HOEHE (wie buttons() in 2D)
//   USB-C und Lautsprecher                      phone_open() in design/generator/scene.py
//
// Einheit: mm. Ursprung = Mitte des Handys. Von hinten gesehen: x nach rechts, y nach oben.
// Die Zeichnung zählt von der linken oberen Ecke in 1/10 mm, px()/py() rechnen um.
import { GERAETE } from '../../data/geraete.js';
import { MODELS, geo, camrow, KNOPF_HOEHE, LINSE_R, MIKRO_R, BLITZ_R } from '../kiesel-draw/models.js';

// Zeichen-Einheit (1/10 mm) → mm. Geteilt statt mal 0.1: 68 / 10 = 6.8, 68 * 0.1 = 6.800000000000001
const mm = (u) => u / 10;

// Knöpfe von hinten gesehen: Power und Kamera-Knopf links, Action und Lautstärke rechts
const KNOEPFE = [['pw', 'links'], ['cc', 'links'], ['act', 'rechts'], ['v1', 'rechts'], ['v2', 'rechts']];

// USB-C: Öffnung wie die echte Buchse. Lautsprecher: runde Löcher neben USB-C (von hinten
// gesehen rechts), bis kurz vor die Rundung der Ecke.
export const USB = { breite: 8.4, hoehe: 2.6 };
const LOCH = { r: 0.6, abstand: 2.2, start: USB.breite / 2 + 0.35 + 2.6, randAbstand: 1.2 };

export function bauplan(id) {
  const g = GERAETE[id], m = MODELS[id];
  if (!g || !m) throw new Error(`Unbekannter Kiesel: ${id}`);
  const [, , , hoehen] = geo(m);
  const [c, xs, mic, fl] = camrow(m);
  const W = g.breite, H = g.hoehe, R = g.radius, D = g.dicke;
  const px = (u) => -W / 2 + mm(u);
  const py = (u) => H / 2 - mm(u);

  // Gerade Unterkante: bis |x| = W/2 - R, danach beginnt die Rundung
  const flachBis = W / 2 - R;
  const lautsprecher = [];
  for (let x = LOCH.start; x <= flachBis - LOCH.randAbstand + 1e-6; x += LOCH.abstand) lautsprecher.push(x);

  return {
    id,
    name: g.name,
    W, H, R, D,
    // Masse in Zeichen-Einheiten (1/10 mm), für die Texturen (gleiche Koordinaten wie die SVG)
    zeichnung: { W: m.W, H: m.H, R: m.R },
    // y = Mitte des Knopfs, hoehe in mm
    knoepfe: KNOEPFE.map(([k, seite]) => ({
      art: k, seite, hoehe: mm(KNOPF_HOEHE[k]), y: py(hoehen[k] + KNOPF_HOEHE[k] / 2),
    })),
    // Hauptkamera im Mittelpunkt der Gehäuseecke (c = R), beim Pro die Tele 16.4 mm daneben
    kameras: xs.map((u, i) => ({
      art: i === 0 ? 'haupt' : 'tele', x: px(u), y: py(c), r: mm(i === 0 ? LINSE_R.haupt : LINSE_R.tele),
    })),
    mikrofon: { x: px(mic), y: py(c), r: mm(MIKRO_R) },
    blitz: { x: px(fl), y: py(c), r: mm(BLITZ_R) },
    unterkante: { usb: { x: 0, ...USB }, lautsprecher: lautsprecher.map((x) => ({ x, r: LOCH.r })), flachBis },
  };
}
