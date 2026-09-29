// Erkennt deutsche Wörter in Texten englischer Seiten (Etappe 9b). Wird von pruefe-englisch.mjs
// benutzt, läuft aber auch allein über dist/en/ (statisches HTML):
//   node scripts/deutsch-erkennen.mjs
//
// Deutsch ist ein Wort, wenn es
//   - ein Umlaut oder ß enthält, oder
//   - ein häufiges deutsches Funktionswort ist (der, und, mit …), oder
//   - im Wortschatz der deutschen Textdatei steht, aber nicht in dem der englischen
//     (so fallen „Akku“, „Hülle“, „Warenkorb“ auf, „Kiesel“ oder „Zoom“ nicht).
// Erlaubt sind AUSNAHMEN_EN mit Grund.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as de from '../src/i18n/de.js';
import * as en from '../src/i18n/en.js';

// Alle Wörter einer Textdatei, auch aus den Funktionen (mit Platzhaltern aufgerufen)
function woerter(texte) {
  const set = new Set();
  const geh = (w) => {
    if (typeof w === 'string') for (const x of w.match(/\p{L}{2,}/gu) ?? []) set.add(x.toLowerCase());
    else if (typeof w === 'function') {
      for (const args of [['X', 'X', 'X', 'X'], [1, 2, 3, 4], [{ name: 'X', typ: 'kiesel' }, { name: 'X', typ: 'home' }, 1, 2, 3]]) {
        try { geh(w(...args)); } catch { /* andere Parameter */ }
      }
      try { geh(w({ name: 'X', farbe: 'X', speicher: 'X', huelle: 'X', gravur: 'X', surf: 1, video: 1, music: 1, cam: 1, game: 1, standby: 1, mehr: 1 })); } catch { /* */ }
    } else if (Array.isArray(w)) w.forEach(geh);
    else if (w && typeof w === 'object') Object.values(w).forEach(geh);
  };
  geh(texte);
  return set;
}

const WORTE_DE = woerter(de);
const WORTE_EN = woerter(en);

// Häufige deutsche Funktionswörter (klein), die im Englischen nicht vorkommen
const FUNKTIONSWOERTER = new Set(['der', 'die', 'das', 'und', 'mit', 'für', 'nicht', 'ein', 'eine', 'einen', 'ist', 'sind', 'auf', 'von', 'zum', 'zur', 'bis', 'den', 'dem', 'des', 'ohne', 'oder', 'nur', 'noch', 'mehr', 'alle', 'alles', 'dein', 'deine', 'wird', 'hat', 'kein', 'keine', 'auch', 'schon', 'über', 'unter', 'wir', 'du', 'dich', 'dir', 'sie', 'beim', 'im', 'am', 'vom', 'zu', 'nach', 'aus', 'hier', 'jetzt', 'gibt', 'geht', 'kann', 'wie', 'wer', 'ab', 'ca', 'bei', 'weiter', 'zurück']);

// Wörter, die in beiden Sprachen vorkommen dürfen, obwohl sie nur im deutschen Wortschatz stehen
// oder wie deutsche Funktionswörter aussehen: [Wort (klein), Grund]
export const AUSNAHMEN_EN = new Map([
  ['kiesel', 'Produktname, bleibt nach Glossar „Kiesel“ (steht auch im englischen Wortschatz, nur zur Sicherheit)'],
  ['am', 'Uhrzeit „7 AM“: klein geschrieben sieht es aus wie das deutsche „am“'],
]);
// Texte in Elementen mit lang="de…" (Sprachumschalter „Deutsch“, Sprach-Hinweis auf Deutsch)
// sind gewollt deutsch; pruefe-englisch.mjs lässt sie beim Sammeln weg.

export function deutscheWoerter(text) {
  const funde = [];
  for (const roh of text.match(/[\p{L}ß]{2,}/gu) ?? []) {
    const w = roh.toLowerCase();
    if (AUSNAHMEN_EN.has(w)) continue;
    if (/[äöüß]/.test(w) || FUNKTIONSWOERTER.has(w) || (WORTE_DE.has(w) && !WORTE_EN.has(w))) funde.push(roh);
  }
  return funde;
}

// Allein aufgerufen: statisches HTML unter dist/en/ grob prüfen (Text und lesbare Attribute)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'en');
  const dateien = [];
  (function sammle(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) sammle(p); else if (e.name.endsWith('.html')) dateien.push(p); } })(dist);
  for (const datei of dateien) {
    const html = fs.readFileSync(datei, 'utf8').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
    const attr = [...html.matchAll(/(?:aria-label|alt|title|placeholder|aria-valuetext|content)="([^"]*)"/g)].map((m) => m[1]).join(' ');
    const text = html.replace(/<[^>]+>/g, ' ') + ' ' + attr;
    const f = [...new Set(deutscheWoerter(text))];
    if (f.length) console.log(path.relative(dist, datei), '→', f.slice(0, 40).join(', '));
  }
}
