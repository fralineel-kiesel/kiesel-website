// Der Kiesel als 3D-Modell, zusammengesetzt aus einfachen Formen.
//
// EINE Funktion für beide Modelle: baueKiesel(bauplan('k1')) und baueKiesel(bauplan('pro')).
// Was die beiden unterscheidet (Masse, Eckradius, Kameras, Lage von Mikrofon, Blitz, Knöpfen
// und Lautsprecher-Löchern), steht im Bauplan (bauplan.js, Werte aus data/geraete.js).
// Hier steht nur, WIE ein Kiesel gebaut ist: Materialien und Formen.
//
// Einheit: 1 = 1 mm. Achsen: x nach rechts, y nach oben, z zur Kamera. Die Rückseite schaut zur Kamera (+z),
// wie im Artboard. Von hinten gesehen liegen die Linsen oben links.
//
// Aufbau (ca. 7000 Dreiecke, 6 verschiedene Shader-Programme):
//   Rahmen      abgerundetes Rechteck, 9 mm dick extrudiert, mit runder Fase an den Kanten
//   Rückseite   dünne Platte mit Textur (Farbe, MagSafe-Ring, Logo), mattes Glas
//   Vorderseite dünne Platte mit Sperrbildschirm, der selbst leuchtet, darüber Hochglanz
//   Knöpfe      abgerundete Quader an den Seiten (Positionen aus geo())
//   Linsen      Metallring, dunkle Fassung, farbig schimmerndes Linsenglas, Deckglas
//   Blitz, Mikrofon
//   Unterkante  USB-C-Buchse und Lautsprecher-Löcher (unterkante.js), nur aus Licht und
//               Schatten, ohne echte Löcher im Rahmen
import {
  Group, Mesh, Shape, ExtrudeGeometry, ShapeGeometry, LatheGeometry, CircleGeometry, SphereGeometry, PlaneGeometry,
  MeshPhysicalMaterial, MeshStandardMaterial, MeshBasicMaterial, CanvasTexture, SRGBColorSpace, NoColorSpace,
  AdditiveBlending, Vector2,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { palette } from '../kiesel-draw/colors.js';
import { leinwand, zeichneRuecken, zeichneRauheit, zeichneBildschirm, zeichneBodenschatten } from './texturen.js';
import { unterkante } from './unterkante.js';

// Rechteck mit runden Ecken, Mitte im Ursprung
function rundesRechteck(b, h, r) {
  const s = new Shape();
  const x = -b / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + b - r, y);
  s.absarc(x + b - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + b, y + h - r);
  s.absarc(x + b - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}

// Flache Platte in Handygrösse. Die Texturkoordinaten (uv) gehen über das ganze Handy
// (0…1 = linke bis rechte Kante), damit die Canvas-Zeichnungen genau passen.
function platte(W, H, R, rand) {
  const g = new ShapeGeometry(rundesRechteck(W - 2 * rand, H - 2 * rand, R - rand), 12);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / W + 0.5, pos.getY(i) / H + 0.5);
  return g;
}

// Ring um eine Linse, gedrechselt (LatheGeometry = Profil einmal um die Achse gedreht).
// r = Aussenradius, h = Höhe über dem Rücken. Profil: aussen unten → über die Kante →
// innen hinunter. Die Reihenfolge zählt: So zeigen die Flächen nach aussen und die
// Grafikkarte muss nur eine Seite zeichnen (FrontSide statt DoubleSide).
function linsenRing(r, h) {
  const profil = [[r, 0], [r, h * 0.45], [r - 0.08, h * 0.82], [r - 0.35, h], [r - 1.0, h], [r - 1.15, h * 0.55]]
    .map(([x, y]) => new Vector2(x, y));
  const g = new LatheGeometry(profil, 64);
  g.rotateX(Math.PI / 2); // Drehachse von y nach z: der Ring liegt flach auf dem Rücken
  return g;
}

// plan = bauplan('k1'|'pro'). Liefert { handy, boden, masse, plan, setzeFarbe(), dispose() }.
export async function baueKiesel(plan, { farbe = 'Himmelblau', maxAniso = 1 } = {}) {
  const { W, H, R, D, zeichnung: z } = plan;
  let col = palette(farbe);

  const handy = new Group();
  const wegwerfen = []; // alles, was beim Beenden freigegeben werden muss (Grafikspeicher)
  const merke = (x) => { wegwerfen.push(x); return x; };

  // ── Materialien ──────────────────────────────────────────────────────────
  // Titanrahmen: Metall (metalness 1) zeigt keine eigene Farbe, sondern färbt, was es
  // spiegelt. roughness 0.35 = gebürstet: glänzt, aber spiegelt nicht scharf.
  const rahmen = merke(new MeshPhysicalMaterial({ color: col.frame, metalness: 1, roughness: 0.35 }));
  // Linsenringe: dasselbe Metall, aber poliert (wie der Verlauf "bz" in der SVG).
  // Gleiche Materialart wie der Rahmen, nur andere Werte: three.js übersetzt dafür kein
  // eigenes Shader-Programm. Jedes Programm kostet beim Start Zeit (siehe buehne.js).
  const ringe = merke(new MeshPhysicalMaterial({ color: col.frame, metalness: 1, roughness: 0.18 }));

  // Rückseite: Textur aus Canvas. Die Farbe steckt in der Textur (map), darum color weiss.
  // roughnessMap macht das Logo glänzend, den Rest matt. Ein wenig clearcoat (zweite,
  // eigene Glanzschicht) gibt mattem Glas den typischen seidigen Schimmer.
  const rueckBild = leinwand(z.W, z.H);
  zeichneRuecken(rueckBild, z, col);
  const rueckTex = merke(new CanvasTexture(rueckBild));
  rueckTex.colorSpace = SRGBColorSpace;
  rueckTex.anisotropy = maxAniso;
  const rauBild = leinwand(z.W / 2, z.H / 2);
  zeichneRauheit(rauBild, z);
  const rauTex = merke(new CanvasTexture(rauBild));
  rauTex.colorSpace = NoColorSpace; // Messwerte, keine Farbe
  const ruecken = merke(new MeshPhysicalMaterial({
    map: rueckTex, roughnessMap: rauTex, roughness: 1, metalness: 0, specularIntensity: 0.35, clearcoat: 0.1, clearcoatRoughness: 0.55,
  }));

  // Vorderseite: schwarzes Glas. Der Bildschirm leuchtet selbst (emissiveMap), unabhängig
  // vom Licht. clearcoat 1 mit fast 0 Rauheit = Spiegelung auf dem Deckglas.
  const schirmBild = leinwand(z.W, z.H);
  await zeichneBildschirm(schirmBild, z);
  const schirmTex = merke(new CanvasTexture(schirmBild));
  schirmTex.colorSpace = SRGBColorSpace;
  schirmTex.anisotropy = maxAniso;
  const front = merke(new MeshPhysicalMaterial({
    color: 0x000000, emissive: 0xffffff, emissiveMap: schirmTex, emissiveIntensity: 0.9,
    roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03,
  }));

  // Kamera-Knopf: Saphirglas statt Metall. Einfaches Material (wie Fassung, Blitz,
  // Mikrofon), die teilen sich ein Shader-Programm.
  const saphir = merke(new MeshStandardMaterial({ color: '#1A2530', metalness: 0, roughness: 0.12 }));
  // Fassung: fast schwarz. Gedämpfter Umgebungsglanz, sonst wirkt sie grau statt tief
  const fassung = merke(new MeshStandardMaterial({ color: '#111316', roughness: 0.6, envMapIntensity: 0.25 }));
  // Linsenglas: dunkelblau (Hauptkamera) bzw. violett (Tele), wie die Verläufe gl/tl in
  // der SVG. iridescence = Schillern wie ein Ölfilm, das Gegenstück zu den farbigen
  // Vergütungs-Bögen in der Zeichnung.
  const linsenGlas = (farbe) => merke(new MeshPhysicalMaterial({
    color: farbe, metalness: 0, roughness: 0.1, clearcoat: 1,
    iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 520],
  }));
  // Deckglas: schwarz und additiv gemischt. Schwarz addiert nichts, sichtbar bleibt nur
  // die Spiegelung. So wirkt echtes Glas: man sieht es nur an seinen Reflexen.
  // (Echte Lichtbrechung, "transmission", bräuchte einen zweiten Renderdurchgang.)
  const deckglas = merke(new MeshPhysicalMaterial({
    color: 0x000000, metalness: 0, roughness: 0.02, envMapIntensity: 2.5,
    transparent: true, blending: AdditiveBlending, depthWrite: false,
  }));
  const blitzLed = merke(new MeshStandardMaterial({ color: '#F4EAD4', roughness: 0.35 }));
  const mikro = merke(new MeshStandardMaterial({ color: col.lo, roughness: 0.8 }));

  const teil = (geometrie, material, x = 0, y = 0, z = 0) => {
    merke(geometrie);
    const mesh = new Mesh(geometrie, material);
    mesh.position.set(x, y, z);
    handy.add(mesh);
    return mesh;
  };

  // ── Rahmen ───────────────────────────────────────────────────────────────
  // ExtrudeGeometry zieht die Form in die Tiefe. Die Fase (bevel) legt sich aussen um die
  // Form herum, darum ist die Form um bevelSize kleiner und die Tiefe um 2 × bevelThickness.
  // curveSegments 10 → 20 Punkte pro Ecke: rund genug, dass man keine Kanten sieht.
  const fase = 0.9, faseTiefe = 1.2;
  const koerper = new ExtrudeGeometry(rundesRechteck(W - 2 * fase, H - 2 * fase, R - fase), {
    depth: D - 2 * faseTiefe, bevelEnabled: true, bevelThickness: faseTiefe, bevelSize: fase,
    bevelSegments: 5, curveSegments: 10,
  });
  koerper.translate(0, 0, -(D - 2 * faseTiefe) / 2);
  teil(koerper, rahmen);

  // ── Rück- und Vorderseite ───────────────────────────────────────────────
  // Die Platten liegen 0.05 mm über dem Rahmen, sonst "flackern" zwei Flächen am selben
  // Ort (z-fighting: die Grafikkarte kann nicht entscheiden, welche vorne ist).
  teil(platte(W, H, R, 1.0), ruecken, 0, 0, D / 2 + 0.05);
  const vorne = teil(platte(W, H, R, 1.0), front, 0, 0, -D / 2 - 0.05);
  vorne.rotation.y = Math.PI; // zeigt nach hinten; dadurch ist die Textur richtig herum

  // ── Knöpfe ───────────────────────────────────────────────────────────────
  // Lage aus dem Bauplan. Der Kamera-Knopf ist aus Saphirglas, die anderen aus Rahmen-Metall.
  // In der SVG stehen sie 1 mm über und sind 1.2 mm breit, also Mitte 0.4 mm ausserhalb.
  for (const k of plan.knoepfe) {
    const x = k.seite === 'links' ? -W / 2 - 0.4 : W / 2 + 0.4;
    teil(new RoundedBoxGeometry(1.2, k.hoehe, 3.6, 2, 0.5), k.art === 'cc' ? saphir : rahmen, x, k.y, 0);
  }

  // ── Kameras ──────────────────────────────────────────────────────────────
  // So viele Linsen, wie der Bauplan hat, an seinen Positionen (camrow() aus lib.py)
  const hinten = D / 2 + 0.05;
  const linse = ({ x, y, r, art }) => {
    const tele = art === 'tele', hr = 1.6; // Ring steht 1.6 mm über dem Rücken
    teil(linsenRing(r, hr), ringe, x, y, hinten);
    teil(new CircleGeometry(r - 1.0, 48), fassung, x, y, hinten + hr * 0.55);
    // Linsenglas als flache Kuppel: Halbkugel, in der Tiefe auf 30 % gestaucht
    const kuppel = new SphereGeometry(r * 0.62, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    kuppel.rotateX(Math.PI / 2);
    kuppel.scale(1, 1, 0.3);
    teil(kuppel, linsenGlas(tele ? '#3B2F63' : '#2C4466'), x, y, hinten + hr * 0.55);
    teil(new CircleGeometry(r - 1.0, 48), deckglas, x, y, hinten + hr - 0.05);
  };
  plan.kameras.forEach(linse);
  // Blitz: kleiner Ring mit cremefarbener LED, in derselben Reihe wie die Linsen
  const { blitz: b, mikrofon: mi } = plan;
  teil(linsenRing(b.r, 1.0), ringe, b.x, b.y, hinten);
  teil(new CircleGeometry(b.r - 0.8, 32), blitzLed, b.x, b.y, hinten + 0.5);
  teil(new CircleGeometry(b.r - 1.0, 32), deckglas, b.x, b.y, hinten + 0.95);
  teil(new CircleGeometry(mi.r, 16), mikro, mi.x, mi.y, hinten + 0.01);

  // ── Unterkante: USB-C und Lautsprecher ──────────────────────────────────
  // Fase im polierten Metall der Linsenringe, Innenwand im dunklen Rahmenton (färbt beim
  // Farbwechsel mit), Grund fast schwarz ohne Umgebungsglanz, Zunge der USB-C-Buchse etwas
  // heller. Alles bekannte Materialarten, also kein zusätzliches Shader-Programm.
  const lochGrund = merke(new MeshStandardMaterial({ color: '#030405', roughness: 1, envMapIntensity: 0.1 }));
  const usbZunge = merke(new MeshStandardMaterial({ color: '#1E2328', roughness: 0.5, envMapIntensity: 0.6 }));
  const unten = unterkante({ H, plan: plan.unterkante });
  teil(unten.fase, ringe);
  teil(unten.wand, mikro);
  teil(unten.grund, lochGrund);
  teil(unten.zunge, usbZunge);

  // ── Bodenschatten ───────────────────────────────────────────────────────
  // Statt echter Schatten (Shadow Maps = die Szene ein zweites Mal zeichnen) ein weicher
  // Fleck auf einer Fläche, wie der Bodenschatten in der SVG. Gehört nicht zum Handy.
  const schattenBild = leinwand(256, 256);
  zeichneBodenschatten(schattenBild);
  const schattenTex = merke(new CanvasTexture(schattenBild));
  const boden = new Mesh(merke(new PlaneGeometry(W * 1.6, W * 1.6)),
    merke(new MeshBasicMaterial({ map: schattenTex, transparent: true, depthWrite: false })));
  boden.rotation.x = -Math.PI / 2;

  return {
    handy,
    boden,
    masse: { W, H, D },
    plan,
    // Farbe wechseln: Materialfarben setzen, Rückseite neu malen
    setzeFarbe(neu) {
      col = palette(neu);
      rahmen.color.set(col.frame);
      ringe.color.set(col.frame);
      mikro.color.set(col.lo);
      zeichneRuecken(rueckBild, z, col);
      rueckTex.needsUpdate = true;
    },
    dispose() {
      for (const x of wegwerfen) x.dispose();
    },
  };
}
