// Logik des Privacy-Modus in zwei Stufen, 1:1 aus priv_js in design/generator/gen5.py.
// Läuft im Build (Startzustand im HTML) und im Browser (PrivacyModus.astro), die Tests
// rufen sie direkt auf. Liefert nur Zustände und Texte, die Farben setzt das CSS.
//
//   privacyZustand(stufe, notruf) → {
//     stufe, notruf,                         notruf gilt nur, wenn eine Stufe an ist
//     teile: [{ id, name, stufe, zustand }], zustand: 'verbunden' | 'getrennt' | 'notruf'
//     gruppen: [boolean, boolean],           Stufe 1/2 stromlos (Plakette „aus“)
//     name, text, weiter, pausiert, notrufText, knopf, leiste, platine, led, ledText, aria
//   }
// Texte: Abschnitt privacy der Textdatei (letzter Parameter T, Standard Deutsch).
import { PRIVACY_TEILE, NOTRUF_TEILE } from '../data/funktionen.js';
import { privacy as DE } from '../i18n/de.js';

export const STUFEN = 3; // Aus, Sensoren aus, Funkstille

// Ungültiges (Text aus der Adresse, NaN …) wird Stufe 0
export const saubereStufe = (s) => {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n < STUFEN ? n : 0;
};

export function privacyZustand(stufe = 0, notrufGewuenscht = false, T = DE) {
  const PRIVACY = T;
  stufe = saubereStufe(stufe);
  const notruf = Boolean(notrufGewuenscht) && stufe > 0;
  const teile = PRIVACY_TEILE.map(([id, ab]) => {
    const aus = stufe >= ab;
    const zurueck = aus && notruf && NOTRUF_TEILE.includes(id);
    return { id, name: T.teile[id], stufe: ab, zustand: zurueck ? 'notruf' : aus ? 'getrennt' : 'verbunden' };
  });
  const pausiert = PRIVACY.pausiert[stufe];
  return {
    stufe,
    notruf,
    teile,
    gruppen: [stufe >= 1, stufe >= 2],
    name: PRIVACY.stufen[stufe][0],
    text: PRIVACY.stufen[stufe][1],
    weiter: notruf ? [...PRIVACY.weiter[stufe], PRIVACY.weiterNotruf] : PRIVACY.weiter[stufe],
    pausiert: pausiert.length ? pausiert : [PRIVACY.nichts],
    notrufText: PRIVACY.notruf.text[notruf ? 2 : stufe === 0 ? 0 : 1],
    knopf: PRIVACY.notruf.knopf[notruf ? 1 : 0],
    leiste: ['0%', '50%', '100%'][stufe],
    platine: PRIVACY.platine[stufe === 0 ? 0 : 1],
    led: ['aus', 'ruhig', 'blinkt'][stufe],
    ledText: PRIVACY.led[stufe],
    aria: PRIVACY.schema + PRIVACY.stufen[stufe][0] + (notruf ? PRIVACY.schemaNotruf : ''),
  };
}

// Stufenwahl wie pick() im Artboard: Stufe 0 beendet den Notruf, 1 ↔ 2 behält ihn
export const waehleStufe = (z, stufe, T = DE) => privacyZustand(stufe, stufe === 0 ? false : z.notruf, T);

// Notruf-Knopf wie toggleNotruf(): in Stufe 0 ohne Wirkung
export const schalteNotruf = (z, T = DE) => (z.stufe > 0 ? privacyZustand(z.stufe, !z.notruf, T) : z);
