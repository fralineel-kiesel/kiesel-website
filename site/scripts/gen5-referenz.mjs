// Das Artboard „Privacy-Modus in zwei Stufen“ (design/generator/gen5.py) als Referenz für
// Tests und Fotos, ohne die Laufzeit der Design-Leinwand:
//   const ref = referenzPrivacy();
//   ref.werte({ stufe, notruf, thema })  → Rückgabe von priv_js (Original-Rechnung)
//   ref.html({ stufe, notruf, thema })   → fertiges Markup des Artboards (1440 × 1500)
// Die Leinwand füllt {{Löcher}} und wiederholt <sc-for>. Mehr braucht dieses Artboard nicht.
// Klicks gibt es nicht: Zustände setzen wir direkt über state (wie setState im Artboard).
// Braucht Python 3 (PYTHON=… setzt einen anderen Befehl).
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hole = (werte, pfad) => pfad.split('.').reduce((o, k) => o?.[k], werte);

function fuelle(html, werte) {
  // onClick-Löcher sind Funktionen: im Standbild weglassen
  html = html.replace(/ onClick="\{\{[^}]+\}\}"/g, '');
  html = html.replace(/<sc-for list="\{\{([^}]+)\}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, liste, als, innen) =>
    (hole(werte, liste) ?? []).map((eintrag) => fuelle(innen, { ...werte, [als]: eintrag })).join(''));
  return html.replace(/\{\{([^}]+)\}\}/g, (_, pfad) => escape(hole(werte, pfad) ?? ''));
}

export function referenzPrivacy() {
  const python = process.env.PYTHON || 'python3';
  const ref = JSON.parse(execFileSync(python, [path.join(hier, 'gen5-referenz.py')], { encoding: 'utf8' }));
  const rechnung = new Function(`${ref.kopf}\nclass K { renderVals() {\n${ref.js}\n} }\nreturn K;`)();
  const werte = ({ stufe = 0, notruf = false, thema = 'dark' } = {}) => {
    const k = new rechnung();
    k.state = { level: stufe, notruf };
    k.props = { thema: thema === 'light' ? 'Hell' : 'Dunkel' };
    k.setState = () => {};
    return k.renderVals();
  };
  // Das Artboard als bedienbares Gegenstück: pick(i) und notruf() sind die Original-Handler
  // (lv.pick, toggleNotruf), setState führt den Zustand wie die Leinwand nach
  const artboard = (thema = 'dark') => {
    const k = new rechnung();
    k.state = {};
    k.props = { thema: thema === 'light' ? 'Hell' : 'Dunkel' };
    k.setState = (neu) => { k.state = { ...k.state, ...neu }; };
    return {
      werte: () => k.renderVals(),
      pick: (i) => k.renderVals().levels[i].pick(),
      notruf: () => k.renderVals().toggleNotruf(),
    };
  };
  return { ...ref, werte, artboard, html: (zustand) => fuelle(ref.html, werte(zustand)) };
}
