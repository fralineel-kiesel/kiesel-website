// Der Warenkorb: speichern, lesen, ändern, rechnen. Kein HTML, das macht warenkorb-ansicht.js.
//
// Gespeichert wird nur, WAS jemand gewählt hat, nie ein Preis:
//   [{ "art": "phone", "modell": "pro", "farbe": "matte-black", "speicher": "2tb", "gravur": "Linos Kiesel", "anzahl": 1 },
//    { "art": "case", "modell": "pro", "farbe": "titanium-gray", "anzahl": 2 }]
// Preis und Name kommen beim Anzeigen immer frisch aus data/preise.js. So kann ein alter oder
// von Hand verbogener Eintrag nie einen falschen Preis zeigen.
//
// Alle gespeicherten Werte sind sprachneutrale Kennungen (Etappe 9a). Bis Etappe 8 standen dort
// deutsche Wörter (art 'handy'/'huelle', farbe 'Mattschwarz'). bereinige() nimmt beides an und
// liefert immer das neue Format; beim nächsten Speichern steht dann nur noch das neue im Speicher.
//
// Wo gespeichert wird (jeder Zugriff in try/catch, nie eine Fehlermeldung):
//   1. localStorage   bleibt auch nach dem Schliessen des Browsers
//   2. sessionStorage wenn localStorage gesperrt ist: bleibt, solange der Tab offen ist
//   3. Variable       wenn beides gesperrt ist: bleibt nur auf dieser Seite
// speicherOrt() sagt, welche Ebene gerade gilt ('dauerhaft' | 'sitzung' | 'seite').
import { PREISE, HUELLE_PREIS, VERSAND, MWST_PROZENT, MAX_ANZAHL, speicherStufe } from '../data/preise.js';
import { farbId } from '../data/farben.js';
import { saubereGravur } from '../lib/gravur.js';
import { farben as FARBNAME, warenkorbArtikel as T } from '../i18n/de.js';

const SCHLUESSEL = 'kiesel-warenkorb';
export const EREIGNIS = 'kiesel:warenkorb'; // wird ausgelöst, wenn sich der Inhalt ändert

// ---------------------------------------------------------------- Speicher-Ebenen
const EBENEN = [
  ['dauerhaft', () => window.localStorage],
  ['sitzung', () => window.sessionStorage],
];
let ebene = null;       // Index in EBENEN, EBENEN.length = nur Variable
let fluechtig = '[]';   // Inhalt der Ebene „Variable“

// Die erste Ebene finden, die wirklich schreiben kann. Nur lesen zu können reicht nicht:
// Safari im privaten Modus liess früher lesen, aber jedes setItem warf einen Fehler.
function findeEbene(ab = 0) {
  for (let i = ab; i < EBENEN.length; i++) {
    try {
      const s = EBENEN[i][1]();
      s.setItem('kiesel-test', '1');
      s.removeItem('kiesel-test');
      return i;
    } catch { /* gesperrt, nächste Ebene */ }
  }
  return EBENEN.length;
}

function rohLesen() {
  ebene ??= findeEbene();
  if (ebene === EBENEN.length) return fluechtig;
  try {
    return EBENEN[ebene][1]().getItem(SCHLUESSEL) ?? '[]';
  } catch {
    ebene = findeEbene(ebene + 1);
    return rohLesen();
  }
}

function rohSchreiben(text) {
  ebene ??= findeEbene();
  while (ebene < EBENEN.length) {
    try {
      EBENEN[ebene][1]().setItem(SCHLUESSEL, text);
      return;
    } catch {
      // z.B. Speicher voll oder mitten in der Sitzung gesperrt: eine Ebene tiefer
      ebene = findeEbene(ebene + 1);
    }
  }
  fluechtig = text;
}

export function speicherOrt() {
  ebene ??= findeEbene();
  return ebene === EBENEN.length ? 'seite' : EBENEN[ebene][0];
}

// ---------------------------------------------------------------- Einträge prüfen
// Art des Artikels: Kennung, dazu die alten deutschen Wörter bis Etappe 8.
// Object.hasOwn statt ARTEN[x]: sonst gäbe z.B. art "constructor" eine Funktion zurück.
const ARTEN = { phone: 'phone', case: 'case', handy: 'phone', huelle: 'case' };
export const artId = (art) => { const a = String(art ?? '').toLowerCase(); return Object.hasOwn(ARTEN, a) ? ARTEN[a] : null; };

// Gleicher Artikel = gleiche id. Die id entsteht aus der Wahl, darum fassen sich z.B. zwei
// gleiche Handys mit gleicher Gravur automatisch zu einer Zeile zusammen.
export function artikelId(a) {
  return a.art === 'case'
    ? ['case', a.modell, a.farbe].join('|')
    : ['phone', a.modell, a.farbe, a.speicher, a.gravur ?? ''].join('|');
}

// Einen Eintrag prüfen und aufräumen. Unbrauchbares → null (fällt weg).
// Nimmt auch die alten Formate an: Etappe 5 ({ id, art: 'huelle', name, preis, … }, die Felder
// id, name und preis werden einfach ignoriert) und Etappe 6 bis 8 (deutsche Art und Farbe).
export function bereinige(roh) {
  if (!roh || typeof roh !== 'object') return null;
  const modell = PREISE[roh.modell] ? roh.modell : null;
  const farbe = farbId(roh.farbe);
  const art = artId(roh.art);
  if (!modell || !farbe) return null;
  const n = Math.floor(Number(roh.anzahl));
  const anzahl = Number.isFinite(n) ? Math.min(MAX_ANZAHL, Math.max(1, n)) : 1;
  let a;
  if (art === 'case') {
    a = { art: 'case', modell, farbe, anzahl };
  } else if (art === 'phone') {
    if (!speicherStufe(modell, roh.speicher)) return null;
    const gravur = roh.gravur ? saubereGravur(roh.gravur) : '';
    if (gravur === null) return null; // ungültige Gravur: lieber weg als falsch graviert
    a = { art: 'phone', modell, farbe, speicher: roh.speicher, anzahl };
    if (gravur) a.gravur = gravur;
  } else {
    return null;
  }
  a.id = artikelId(a);
  return a;
}

// Liste prüfen und gleiche Artikel zusammenfassen (Anzahl addieren, höchstens MAX_ANZAHL)
function bereinigeListe(liste) {
  const neu = [];
  for (const roh of Array.isArray(liste) ? liste : []) {
    const a = bereinige(roh);
    if (!a) continue;
    const gleich = neu.find((b) => b.id === a.id);
    if (gleich) gleich.anzahl = Math.min(MAX_ANZAHL, gleich.anzahl + a.anzahl);
    else neu.push(a);
  }
  return neu;
}

// ---------------------------------------------------------------- Lesen und Ändern
// Beim ersten Lesen auf einer Seite: Liegt noch ein alter Warenkorb im Speicher (deutsche
// Kennungen, aufgeräumte Einträge), wird er einmal im neuen Format zurückgeschrieben. Still:
// kein Ereignis, denn für die Seite ändert sich nichts. Kaputtes JSON bleibt unangetastet.
let migriert = false;
function migriere(roh, liste) {
  migriert = true;
  const neu = JSON.stringify(liste.map(({ id, ...rest }) => rest));
  if (neu !== roh) {
    try { rohSchreiben(neu); } catch { /* egal, beim nächsten Speichern klappt es */ }
  }
}

export function lesen() {
  try {
    const roh = rohLesen();
    const liste = bereinigeListe(JSON.parse(roh));
    if (!migriert) migriere(roh, liste);
    return liste;
  } catch {
    return []; // kein gültiges JSON: leer (beim nächsten Speichern wird es überschrieben)
  }
}

export function anzahl() {
  return lesen().reduce((summe, a) => summe + a.anzahl, 0);
}

function speichern(liste) {
  // Ohne id speichern: die entsteht beim Lesen neu
  rohSchreiben(JSON.stringify(liste.map(({ id, ...rest }) => rest)));
  window.dispatchEvent(new CustomEvent(EREIGNIS));
}

// Artikel hinzufügen, z.B. hinzufuegen({ art: 'phone', modell: 'pro', farbe: 'sky-blue', speicher: '512gb' })
// Gleicher Artikel schon drin: Anzahl erhöhen, höchstens MAX_ANZAHL.
// Rückgabe: { id, anzahl, gekappt } oder null, wenn der Artikel ungültig ist.
//   gekappt = true, wenn nicht alles dazukam (schon 9 Stück)
export function hinzufuegen(artikel, dazu = 1) {
  const a = bereinige({ ...artikel, anzahl: 1 });
  if (!a) return null;
  const liste = lesen();
  const gleich = liste.find((b) => b.id === a.id);
  const vorher = gleich ? gleich.anzahl : 0;
  const nachher = Math.min(MAX_ANZAHL, vorher + dazu);
  if (gleich) gleich.anzahl = nachher;
  else liste.push({ ...a, anzahl: nachher });
  speichern(liste);
  return { id: a.id, anzahl: nachher, gekappt: vorher + dazu > MAX_ANZAHL };
}

// Anzahl setzen (1 bis MAX_ANZAHL). Rückgabe: die neue Anzahl (oder null, wenn es den Artikel nicht gibt)
export function setzeAnzahl(id, n) {
  const liste = lesen();
  const a = liste.find((b) => b.id === id);
  if (!a) return null;
  a.anzahl = Math.min(MAX_ANZAHL, Math.max(1, Math.floor(n) || 1));
  speichern(liste);
  return a.anzahl;
}

export function entfernen(id) {
  speichern(lesen().filter((a) => a.id !== id));
}

export function leeren() {
  speichern([]);
}

// Andere Teile der Seite (z.B. der Zähler) hören auf Änderungen:
//   EREIGNIS  Änderung auf dieser Seite
//   storage   ein anderer Tab hat den Warenkorb geändert (kommt vom Browser)
//   pageshow  die Seite kommt mit „Zurück“ aus dem Zwischenspeicher des Browsers (bfcache),
//             dort stünde sonst noch der alte Stand
export function beiAenderung(rueckruf) {
  window.addEventListener(EREIGNIS, rueckruf);
  window.addEventListener('storage', (e) => { if (e.key === SCHLUESSEL || e.key === null) rueckruf(); });
  window.addEventListener('pageshow', (e) => { if (e.persisted) rueckruf(); });
}

// ---------------------------------------------------------------- Anzeigen und Rechnen
// Name, Beschreibung und Stückpreis (in Rappen) eines Eintrags
// Texte (T, FARBNAME) als Parameter: Standard Deutsch, Etappe 9b übergibt die englischen.
export function artikelInfo(a, texte = { T, FARBNAME }) {
  const modellName = PREISE[a.modell].name;
  const farbe = texte.FARBNAME[a.farbe];
  if (a.art === 'case') {
    return { name: texte.T.huelle, details: texte.T.huelleDetails(modellName, farbe), stueck: HUELLE_PREIS * 100 };
  }
  const s = speicherStufe(a.modell, a.speicher);
  return {
    name: modellName,
    // Geschützte Leerzeichen (\u00A0) in der Gravur: „Linos Kiesel“ bricht nicht mitten im Namen um
    details: texte.T.handyDetails(farbe, s.name, a.gravur ? a.gravur.replace(/ /g, '\u00A0') : null),
    stueck: s.preis * 100,
  };
}

// Alle Summen in Rappen (Ganzzahlen, darum exakt).
// Die Preise sind inklusive MwSt. Der MwSt.-Anteil steckt also schon im Total:
//   Total = Netto × 1.081   →   MwSt. = Total − Netto = Total × 8.1 / 108.1
// Gerechnet als Total × 81 / 1081 (nur Ganzzahlen), dann auf den Rappen gerundet.
// Ein „genau halber Rappen“ kann dabei nie entstehen: Total × 162 ist gerade, 1081 × ungerade nicht.
export function summen(liste = lesen()) {
  const zwischensumme = liste.reduce((s, a) => s + artikelInfo(a).stueck * a.anzahl, 0);
  const versand = VERSAND * 100;
  const total = zwischensumme + versand;
  const z = Math.round(MWST_PROZENT * 10); // 81
  const mwst = Math.round((total * z) / (1000 + z));
  return { zwischensumme, versand, mwst, total, stueck: liste.reduce((s, a) => s + a.anzahl, 0) };
}
