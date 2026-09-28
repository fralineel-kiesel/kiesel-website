// Die Rechnungen der Artboards aus design/generator/gen4.py als JavaScript-Funktionen,
// damit die Prüfskripte unsere Seiten gegen das Original vergleichen können.
//   const ref = referenz();
//   ref.daten.DEV / .SPEC / .FAQ
//   ref.vergleich({ k: 'k1', vs: 'pmax', mode: 'side' })  → Rückgabe von cmp_js
//   ref.akku({ v: { surf: 3, … } })                       → Rückgabe von akku_js
// Braucht Python 3 (PYTHON=… setzt einen anderen Befehl).
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));

// Platzhalter für die Themenfarben: Die Rechnung setzt sie nur in Stile ein
const T = { bg: 'BG', surface: 'SURF', raised: 'RAI', ink: 'INK', muted: 'MUT', line: 'LINE', accent: 'ACC', heat: 'HEAT' };

export function referenz() {
  const python = process.env.PYTHON || 'python3';
  const { daten, js } = JSON.parse(execFileSync(python, [path.join(hier, 'gen4-referenz.py')], { encoding: 'utf8' }));
  const kopf = `const t = ${JSON.stringify(T)};\n${js.chip}`;
  const cmp = new Function(`${kopf}\nconst DEV = ${JSON.stringify(daten.DEV)};\nconst SC = ${daten.SC}, BASE = ${daten.BASE}, CX = ${daten.CX};\n${js.cmp_js}`);
  const akku = new Function(`${kopf}\n${js.akku_js}`);
  const lauf = (fn) => (state) => fn.call({ state, setState() {} });
  return { daten, vergleich: lauf(cmp), akku: lauf(akku) };
}
