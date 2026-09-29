// Prüft, ob der Zeichen-Motor (src/lib/kiesel-draw) Zeichen für Zeichen dieselben SVGs
// erzeugt wie die Python-Vorlage in design/generator.
//
//   npm run pruefe:zeichenmotor
//
// Warum so streng? Ein Screenshot-Vergleich sagt nur „sieht ähnlich aus“. Sind die
// SVG-Texte identisch, ist die Übersetzung bewiesen: gleiche Formen, Masse und Farben.
// Braucht Python 3 (python3, python oder die Umgebungsvariable PYTHON).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PAL, FARBNAMEN_PAL } from '../src/lib/kiesel-draw/colors.js';
import { backSvg, frontSvg, lens, place, handy } from '../src/lib/kiesel-draw/phone.js';
import { LED } from '../src/lib/kiesel-draw/colors.js';
import { alpen, blume, crop, phoneOpen, BLUME_FOKUS } from '../src/lib/kiesel-draw/scene.js';
import { farbId } from '../src/data/farben.js';
import { INNENLEBEN_ABWEICHUNG as IA, ohnePrivacyBlock } from './abweichungen.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));

// Jeder Fall: [Name, Aufruf für Python, Funktion für JavaScript]
const faelle = [];
// abweichung: bewusste Änderung gegenüber der Vorlage (scripts/abweichungen.mjs)
const fall = (name, fn, args, kwargs, js, abweichung = null) => faelle.push({ name, py: { fn, args, kwargs }, js, abweichung });

for (const mk of ['k1', 'pro']) {
  for (const farbe of FARBNAMEN_PAL) {
    const col = PAL[farbe];
    fall(`hinten ${mk} ${farbe}`, 'back_svg', [mk, col, 'p1'], {}, () => backSvg(mk, col, 'p1'));
    fall(`vorne ${mk} ${farbe}`, 'front_svg', [mk, col, 'p1'], {}, () => frontSvg(mk, col, 'p1'));
    for (const huelle of FARBNAMEN_PAL) {
      const k = PAL[huelle];
      fall(`hinten ${mk} ${farbe} Hülle ${huelle}`, 'back_svg', [mk, col, 'p2'], { case: k }, () => backSvg(mk, col, 'p2', null, k));
      fall(`vorne ${mk} ${farbe} Hülle ${huelle}`, 'front_svg', [mk, col, 'p2'], { case: k }, () => frontSvg(mk, col, 'p2', k));
    }
    // Alle LED-Zustände (Python bekommt dieselben LED-Objekte übergeben)
    for (const [zustand, led] of Object.entries(LED)) {
      fall(`hinten ${mk} ${farbe} LED ${zustand}`, 'back_svg', [mk, col, 'p3'], { led }, () => backSvg(mk, col, 'p3', led));
    }
  }
}
fall('Linse', 'lens', [100.5, 97.25, 64, 'x', true], {}, () => lens(100.5, 97.25, 64, 'x', true));
fall('place', 'place', ['pro', '<g></g>', 320.5, 410, -6.25, 0.37], {}, () => place('pro', '<g></g>', 320.5, 410, -6.25, 0.37));

// phone() aus gen2.py, wie es die Artboards benutzen. Die Farben heissen hier wie in gen2.py
// (deutsch); PAL ist nach Kennung sortiert, farbId() übersetzt. handy() bekommt den alten Namen
// und muss ihn selbst verstehen (Migration).
const P = new Proxy(PAL, { get: (pal, name) => pal[farbId(name)] });
let n = 0;
for (const [kind, mk, col, h, opt] of [
  ['back', 'pro', 'Himmelblau', 440, { rot: -6, case: 'Mattweiss' }],
  ['front', 'k1', 'Himmelblau', 170, { floor_: false }],
  ['back', 'pro', 'Himmelblau', 58, { floor_: false, case: 'Mattweiss' }],
  ['back', 'pro', 'Titangrau', 330, {}],
  ['front', 'pro', 'Himmelblau', 540, { rot: 5 }],
  ['back', 'k1', 'Kieselbeige', 527, { case: 'Kieselbeige' }],
]) {
  n++;
  const kwargs = { ...opt, ...(opt.case ? { case: P[opt.case] } : {}) };
  const nn = n;
  fall(`gen2 phone ${kind} ${mk} ${h}`, 'gen2_phone', [nn, kind, mk, P[col], h], kwargs,
    () => handy({ ansicht: kind, modell: mk, farbe: col, hoehe: h, drehung: opt.rot ?? 0, huelle: opt.case ?? null, boden: opt.floor_ ?? true, pid: `q${nn}` }));
}

// Szenen
fall('alpen', 'alpen', ['a0'], {}, () => alpen('a0'));
for (const [zx, zy, z, r] of [[740, 300, 3, 1.6], [740, 300, 3, 350 / 240], [756, 246, 5, 600 / 560], [262, 668, 8, 1.6], [1122, 770, 7.3, 1.25]]) {
  fall(`crop ${zx} ${zy} ${z}`, 'crop', [zx, zy, z, r], {}, () => crop(zx, zy, z, r));
}
for (const [name, fx] of Object.entries(BLUME_FOKUS)) {
  fall(`blume ${name}`, 'blume', ['bl', fx.bg, fx.fl, fx.fg, fx.bee], {}, () => blume('bl', fx.bg, fx.fl, fx.fg, fx.bee));
}
for (const [kind, ox, oy, s] of [['se', 60, 20, 3.1], ['k1', 90.38, 30, 3.4], ['pro', 60, 20, 3.1], ['pro', 80.86, 30, 3.4]]) {
  fall(`innenleben ${kind}`, 'phone_open', [kind, ox, oy, s], {}, () => JSON.stringify(phoneOpen(kind, ox, oy, s)), IA.modelle.includes(kind) ? IA : null);
}

// Python einmal mit allen Aufrufen starten
function starte(eingabe) {
  const kandidaten = [process.env.PYTHON, 'python3', 'python'].filter(Boolean);
  for (const cmd of kandidaten) {
    const r = spawnSync(cmd, [path.join(hier, 'zeichenmotor-referenz.py')], { input: eingabe, encoding: 'utf8', maxBuffer: 1 << 30 });
    if (r.error?.code === 'ENOENT') continue;
    if (r.status !== 0) { console.error(r.stderr); process.exit(2); }
    return JSON.parse(r.stdout);
  }
  console.error('Python nicht gefunden. Mit PYTHON=… den Pfad angeben.');
  process.exit(2);
}

const erwartet = starte(JSON.stringify(faelle.map((f) => f.py)));
let fehler = 0;
let abweichungen = 0;
faelle.forEach((fl, i) => {
  let ist = fl.js();
  let soll = erwartet[i];
  if (fl.abweichung) {
    // Privacy-Schalter: Vorlage alt, wir neu, der Rest muss gleich bleiben
    const a = fl.abweichung, v = ohnePrivacyBlock(soll), j = ohnePrivacyBlock(ist);
    if (v.name !== a.altName || v.schalter !== a.altSchalter || j.name !== a.neuName || j.schalter !== a.neuSchalter) {
      fehler++;
      console.log(`✗ ${fl.name}: Privacy-Schalter nicht wie in abweichungen.mjs (Vorlage ${v.schalter} × „${v.name}“, wir ${j.schalter} × „${j.name}“)`);
      return;
    }
    abweichungen++;
    soll = v.rest; ist = j.rest;
  }
  if (ist === soll) return;
  fehler++;
  // Erste abweichende Stelle mit etwas Umgebung zeigen
  let k = 0;
  while (k < ist.length && ist[k] === soll[k]) k++;
  console.log(`✗ ${fl.name}\n  Python: …${soll.slice(Math.max(0, k - 60), k + 60)}…\n  JS:     …${ist.slice(Math.max(0, k - 60), k + 60)}…`);
});
const zeichen = erwartet.reduce((a, s) => a + s.length, 0);
console.log(fehler
  ? `\n${fehler} von ${faelle.length} Fällen weichen ab.`
  : `✓ Alle ${faelle.length} Fälle identisch mit Python (${(zeichen / 1e6).toFixed(1)} Mio. Zeichen verglichen${abweichungen ? `; in ${abweichungen} davon die Privacy-Schalter bewusst neu, siehe abweichungen.mjs` : ''}).`);
process.exit(fehler ? 1 : 0);
