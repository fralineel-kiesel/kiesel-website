// Masse der Handys wie in design/generator/lib.py (MODELS, geo, camrow).
//
// Einheit: 1/10 mm. W = 586 heisst 58.6 mm breit, genau wie in der Tabelle in CLAUDE.md.
// Darum passen alle Zeichnungen im selben Massstab zueinander (Kiesel 1 neben Pro).
//   W, H = Breite, Höhe   R = Eckradius   cams = Anzahl Kameras hinten
// Die Zahlen selbst stehen nur in data/geraete.js (in mm), hier werden sie bloss umgerechnet.
// Früher standen sie hier ein zweites Mal: zwei Quellen, die zufällig übereinstimmten.
// pruefe:zeichenmotor zeigt, dass die Zeichnungen Zeichen für Zeichen wie in Python bleiben.
import { GERAETE, KIESEL_IDS } from '../../data/geraete.js';

const zehntel = (mm) => Math.round(mm * 10);
export const MODELS = Object.fromEntries(KIESEL_IDS.map((id) => {
  const g = GERAETE[id];
  return [id, { W: zehntel(g.breite), H: zehntel(g.hoehe), R: zehntel(g.radius), cams: g.kameras }];
}));

// Dicke beider Modelle: 9 mm = 90 Einheiten (für die Seitenansicht)
export const DICKE = zehntel(GERAETE.k1.dicke);

// Oberkante der Knöpfe. Gemessen am Kiesel 1 (H = 1238) und fürs Pro mit s hochgerechnet.
//   act = Action-Button, v1/v2 = lauter/leiser, pw = Power, cc = Kamera-Knopf
export function geo(m) {
  const { W, H, R } = m;
  const s = H / 1238;
  return [W, H, R, { act: 200 * s, v1: 310 * s, v2: 450 * s, pw: 330 * s, cc: 800 * s }];
}

// Kamerareihe hinten. Die Mitte der ersten Linse liegt genau im Eckradius (c = R),
// darum wirkt sie in die Ecke "eingebettet". Die Tele-Linse sitzt 164 Einheiten daneben.
// Rückgabe: [Mitte (x und y), x der Linsen, x des Mikrofons, x des Blitzes]
export function camrow(m) {
  const c = m.R;
  const xs = [c].concat(m.cams === 2 ? [c + 164] : []);
  const lr = m.cams === 2 ? 64 : 68;
  return [c, xs, xs[xs.length - 1] + lr + 22, xs[xs.length - 1] + lr + 74];
}
