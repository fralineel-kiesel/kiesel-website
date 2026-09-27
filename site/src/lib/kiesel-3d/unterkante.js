// Unterkante des Kiesels: USB-C-Buchse und Lautsprecher-Löcher.
//
// Positionen nach phone_open() in design/generator/scene.py (Innenleben): USB-C mittig,
// der Lautsprecher daneben (von hinten gesehen rechts, also +x).
//
// ── Wie ein Loch entsteht, ohne zu bohren ──
// Echte Löcher in den Rahmen zu schneiden (CSG, „Boolesche Operationen“) wäre aufwendig.
// Stattdessen liegen knapp vor der Unterkante drei flache Schichten, die auf Licht so
// reagieren wie ein Loch:
//   1. Fase:      schmaler Metallring. Seine Normalen (die Richtung, in die eine Fläche für
//                 die Lichtberechnung "schaut") kippen zur Lochmitte. Er ist flach, glänzt
//                 aber wie eine abgeschrägte Kante, die ins Loch hinabführt.
//   2. Innenwand: dunkler Ring, Normalen fast ganz nach innen: wirkt wie die Wand in die Tiefe.
//   3. Grund:     fast schwarz, ohne Umgebungsglanz. Bei USB-C dazu die Zunge in der Mitte.
// Das ist das Prinzip einer Normal-Map, nur direkt in die Geometrie geschrieben.
//
// Koordinaten: Die Unterkante liegt bei y = -H/2 und schaut nach unten (-y). Auf ihr zählt
// u entlang der Breite (= x) und v entlang der Dicke (= z).
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Umriss einer Kapsel (Rechteck mit Halbkreisen links und rechts), gegen den Uhrzeigersinn.
// Liefert Punkte [u, v] und die Richtung zur Mitte [nu, nv] (Einheitsvektor) pro Punkt.
function kapsel(breite, hoehe, schritte = 14) {
  const r = hoehe / 2, a = breite / 2 - r;
  const punkte = [];
  for (const [mx, start] of [[a, -Math.PI / 2], [-a, Math.PI / 2]]) {
    for (let i = 0; i <= schritte; i++) {
      const w = start + (Math.PI * i) / schritte;
      const [cu, cv] = [Math.cos(w), Math.sin(w)];
      punkte.push({ p: [mx + r * cu, r * cv], n: [-cu, -cv] });
    }
  }
  return punkte;
}

function kreis(r, schritte = 20) {
  const punkte = [];
  for (let i = 0; i < schritte; i++) {
    const w = (2 * Math.PI * i) / schritte;
    punkte.push({ p: [r * Math.cos(w), r * Math.sin(w)], n: [-Math.cos(w), -Math.sin(w)] });
  }
  return punkte;
}

// Punkte eines Umrisses um "abstand" zur Mitte hin verschieben
const nachInnen = (umriss, abstand) =>
  umriss.map(({ p, n }) => ({ p: [p[0] + n[0] * abstand, p[1] + n[1] * abstand], n }));

// Aus Dreiecken eine Geometrie machen. Jedes Dreieck wird so gewendet, dass seine
// Vorderseite nach unten (-y) zeigt: Die Grafikkarte zeichnet nur Vorderseiten.
function geometrie(dreiecke) {
  const pos = [], nor = [];
  const a = new Vector3(), b = new Vector3(), c = new Vector3();
  for (const d of dreiecke) {
    a.fromArray(d[0].pos); b.fromArray(d[1].pos); c.fromArray(d[2].pos);
    const flaeche = b.clone().sub(a).cross(c.clone().sub(a));
    const reihe = flaeche.y < 0 ? d : [d[0], d[2], d[1]];
    for (const ecke of reihe) { pos.push(...ecke.pos); nor.push(...ecke.nor); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

// Ring zwischen zwei gleich langen Umrissen. kippAussen/kippInnen: wie stark die Normale am
// äusseren/inneren Rand zur Lochmitte kippt (0 = gerade nach unten, 1 = ganz zur Mitte).
function ring(aussen, innen, zuOrt, kippAussen, kippInnen) {
  const ecke = ({ p, n }, kipp) => ({
    pos: zuOrt(p),
    nor: new Vector3(n[0] * kipp, -(1 - kipp), n[1] * kipp).normalize().toArray(),
  });
  const d = [];
  for (let i = 0; i < aussen.length; i++) {
    const j = (i + 1) % aussen.length;
    const [a1, a2, i1, i2] = [ecke(aussen[i], kippAussen), ecke(aussen[j], kippAussen), ecke(innen[i], kippInnen), ecke(innen[j], kippInnen)];
    d.push([a1, i1, a2], [i1, i2, a2]);
  }
  return geometrie(d);
}

// Fläche innerhalb eines (konvexen) Umrisses, als Fächer von der Mitte aus
function flaeche(umriss, zuOrt) {
  const mitte = { pos: zuOrt([0, 0]), nor: [0, -1, 0] };
  const d = [];
  for (let i = 0; i < umriss.length; i++) {
    const j = (i + 1) % umriss.length;
    d.push([mitte, { pos: zuOrt(umriss[i].p), nor: [0, -1, 0] }, { pos: zuOrt(umriss[j].p), nor: [0, -1, 0] }]);
  }
  return geometrie(d);
}

// Ein Loch: Fase, Innenwand, Grund. Liefert drei Geometrien (für drei Materialien).
function loch(umriss, zuOrt, fase, wand) {
  const nachFase = nachInnen(umriss, fase);
  const nachWand = nachInnen(nachFase, wand);
  return {
    fase: ring(umriss, nachFase, zuOrt, 0.05, 0.7),
    wand: ring(nachFase, nachWand, zuOrt, 0.85, 0.95),
    grund: flaeche(nachWand, zuOrt),
  };
}

// W, H: Breite und Höhe des Handys (mm). flachBis: bis zu welchem |x| die Unterkante gerade
// ist (danach beginnt die Rundung der Ecke, dort gehören keine Löcher hin).
// Liefert Geometrien für { fase, wand, grund, zunge }, alle zusammengefasst: So braucht die
// ganze Unterkante nur vier Zeichenaufrufe, egal wie viele Löcher.
export function unterkante({ H, flachBis }) {
  const y = -H / 2 - 0.02; // 0.02 mm vor der Kante, gegen z-fighting
  const bei = (cx, cz = 0) => ([u, v]) => [cx + u, y, cz + v];
  const teile = { fase: [], wand: [], grund: [], zunge: [] };
  const dazu = (l) => { for (const k of ['fase', 'wand', 'grund']) teile[k].push(l[k]); };

  // USB-C: Öffnung 8.4 × 2.6 mm (wie die echte Buchse), 0.35 mm Fase, 0.2 mm Innenwand
  const usb = kapsel(8.4 + 0.7, 2.6 + 0.7);
  dazu(loch(usb, bei(0), 0.35, 0.2));
  // Die Zunge in der Mitte: 6.6 × 0.7 mm, etwas heller als der Grund
  const zunge = kapsel(6.6, 0.7, 6);
  teile.zunge.push(flaeche(zunge, ([u, v]) => [u, y - 0.01, v]));

  // Lautsprecher: eine Reihe runder Löcher (Ø 1.2 mm), neben USB-C bis kurz vor die Rundung
  const start = 4.55 + 2.6, abstand = 2.2, ende = flachBis - 1.2;
  for (let x = start; x <= ende + 1e-6; x += abstand) dazu(loch(kreis(0.6 + 0.2), bei(x), 0.2, 0.12));

  return Object.fromEntries(Object.entries(teile).map(([k, g]) => [k, mergeGeometries(g)]));
}
