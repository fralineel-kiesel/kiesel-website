// Prüft den Bauplan des 3D-Kiesels (src/lib/kiesel-3d/bauplan.js) gegen die 2D-Zeichnung.
// Kein Browser, kein three.js, darum bei jedem Lauf gleich:
//
//   npm run pruefe:bauplan
//
// Die Kette: bauplan() = was backSvg() zeichnet = lib.py (das prüft pruefe:zeichenmotor).
// Die SVG wird dafür wirklich gezeichnet und ausgelesen, nicht bloss dieselbe Formel
// nachgerechnet: Ändert sich die Zeichnung, fällt dieser Test auf.
import fs from 'node:fs';
import { bauplan } from '../src/lib/kiesel-3d/bauplan.js';
import { backSvg } from '../src/lib/kiesel-draw/phone.js';
import { palette } from '../src/lib/kiesel-draw/colors.js';
import { GERAETE, KIESEL_IDS } from '../src/data/geraete.js';

let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}
const gleich = (a, b, toleranz = 0.011) => Math.abs(a - b) <= toleranz; // SVG rundet auf 1/100 Einheit
const zahl = (x) => Math.round(x * 100) / 100;

// Kreise und Knöpfe aus der gezeichneten Rückseite (Einheit 1/10 mm, Ursprung links oben)
function ausSvg(id) {
  const svg = backSvg(id, palette('Himmelblau'), 'p');
  const attr = (tag, name) => Number(tag.match(new RegExp(` ${name}="([^"]+)"`))[1]);
  const kreise = [...svg.matchAll(/<circle [^>]*>/g)].map(([t]) => ({ t, cx: attr(t, 'cx'), cy: attr(t, 'cy'), r: attr(t, 'r') }));
  const metall = kreise.filter((k) => k.t.includes('url(#pbz)')); // Metallringe: Linsen und Blitz
  const mikro = kreise.filter((k) => k.r === 6);
  const knoepfe = [...svg.matchAll(/<rect [^>]*rx="5"[^>]*>/g)].map(([t]) => ({ x: attr(t, 'x'), y: attr(t, 'y'), h: attr(t, 'height') }));
  return { linsen: metall.slice(0, -1), blitz: metall.at(-1), mikro, knoepfe };
}

const plaene = Object.fromEntries(KIESEL_IDS.map((id) => [id, bauplan(id)]));

for (const id of KIESEL_IDS) {
  const p = plaene[id], g = GERAETE[id], s = ausSvg(id);
  const zuMm = ({ cx, cy, r }) => ({ x: -p.W / 2 + cx / 10, y: p.H / 2 - cy / 10, r: r / 10 });
  console.log(`\n${p.name}`);

  pruefe('Masse, Eckradius, Dicke = geraete.js', p.W === g.breite && p.H === g.hoehe && p.R === g.radius && p.D === g.dicke,
    `${p.W} × ${p.H} × ${p.D} mm, r ${p.R}`);
  pruefe(`Anzahl Kameras = geraete.js (${g.kameras})`, p.kameras.length === g.kameras && s.linsen.length === g.kameras);

  // Kameras: Position und Radius wie in der Zeichnung
  const linsenOk = p.kameras.every((k, i) => { const z = zuMm(s.linsen[i]); return gleich(k.x, z.x) && gleich(k.y, z.y) && gleich(k.r, z.r); });
  pruefe('Linsen an derselben Stelle wie in backSvg()', linsenOk, p.kameras.map((k) => `${k.art} ${zahl(k.x)}/${zahl(k.y)} r ${k.r}`).join(', '));
  const haupt = p.kameras[0];
  pruefe('Hauptkamera im Mittelpunkt der Gehäuseecke (R vom Rand)',
    gleich(haupt.x, -p.W / 2 + p.R) && gleich(haupt.y, p.H / 2 - p.R));
  if (p.kameras.length === 2) pruefe('Tele 16.4 mm neben der Hauptkamera, gleiche Höhe', gleich(p.kameras[1].x - haupt.x, 16.4) && p.kameras[1].y === haupt.y);

  // Mikrofon und Blitz in derselben Reihe, in der Reihenfolge Linsen → Mikrofon → Blitz
  const mz = zuMm(s.mikro[0]), bz = zuMm(s.blitz);
  pruefe('Mikrofon wie in backSvg()', s.mikro.length === 1 && gleich(p.mikrofon.x, mz.x) && gleich(p.mikrofon.y, mz.y) && gleich(p.mikrofon.r, mz.r));
  pruefe('Blitz wie in backSvg()', gleich(p.blitz.x, bz.x) && gleich(p.blitz.y, bz.y) && gleich(p.blitz.r, bz.r));
  const reihe = [...p.kameras, p.mikrofon, p.blitz];
  pruefe('Linsen, Mikrofon, Blitz in einer Reihe, von links nach rechts',
    reihe.every((t) => t.y === haupt.y) && reihe.every((t, i) => i === 0 || t.x > reihe[i - 1].x));
  pruefe('Blitz bleibt auf der Rückseite', p.blitz.x + p.blitz.r < p.W / 2 - 1);

  // Knöpfe: gleiche Höhe und Mitte wie die Rechtecke in backSvg() (Reihenfolge: links, dann rechts)
  const reihenfolge = [...p.knoepfe.filter((k) => k.seite === 'links'), ...p.knoepfe.filter((k) => k.seite === 'rechts')];
  const knoepfeOk = s.knoepfe.length === 5 && reihenfolge.every((k, i) => {
    const r = s.knoepfe[i];
    return gleich(k.hoehe, r.h / 10) && gleich(k.y, p.H / 2 - (r.y + r.h / 2) / 10) && (k.seite === 'links') === (r.x < 0);
  });
  pruefe('Knöpfe wie in backSvg() (Seite, Höhe, Lage)', knoepfeOk, p.knoepfe.map((k) => k.art).join(' '));

  // Unterkante: USB-C mittig, Lautsprecher-Löcher nur auf der geraden Kante, ohne Überlappung
  const u = p.unterkante, l = u.lautsprecher;
  pruefe('USB-C in der Mitte der Unterkante', u.usb.x === 0);
  pruefe('Lautsprecher: Löcher nur auf der geraden Kante', l.length > 0 && l.every((x) => x.x + x.r < u.flachBis),
    `${l.length} Löcher, bis ${zahl(l.at(-1).x + l.at(-1).r)} von ${zahl(u.flachBis)} mm`);
  pruefe('Lautsprecher: überlappen weder USB-C noch einander',
    l[0].x - l[0].r > u.usb.breite / 2 && l.every((x, i) => i === 0 || x.x - l[i - 1].x > 2 * x.r));
}

// Beide Pläne haben dieselbe Form: Der Unterschied zwischen Kiesel 1 und Pro ist nur Daten
console.log('\nKeine Kopie');
const form = (o) => JSON.stringify(Object.keys(o).sort()) + JSON.stringify(Object.keys(o.unterkante).sort());
pruefe('Kiesel 1 und Pro: gleicher Aufbau des Bauplans', form(plaene.k1) === form(plaene.pro));
pruefe('Pro ist grösser, Kiesel 1 hat nur eine Kamera', plaene.pro.H > plaene.k1.H && plaene.k1.kameras.length === 1 && plaene.pro.kameras.length === 2);
// Das 3D-Modell selbst darf kein Modell beim Namen kennen, sonst wäre es wieder eine versteckte Kopie
const modellJs = fs.readFileSync(new URL('../src/lib/kiesel-3d/modell.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
pruefe('modell.js unterscheidet nicht nach Modell (kein \'k1\', \'pro\', cams)', !/'k1'|'pro'|\bcams\b|camrow|MODELS/.test(modellJs));
let unbekannt = false;
try { bauplan('se'); } catch { unbekannt = true; }
pruefe('Unbekanntes Gerät ergibt einen Fehler statt eines halben Handys', unbekannt);

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Bauplan stimmt mit der 2D-Zeichnung überein');
process.exit(fehler ? 1 : 0);
