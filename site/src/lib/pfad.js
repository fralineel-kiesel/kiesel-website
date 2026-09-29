// pfad() baut interne Links mit dem base-Pfad aus astro.config.mjs und in der richtigen Sprache.
// Warum base: Die Seite liegt (vorerst) unter /kiesel-website/v2/. Ein fester Link wie
// "/kaufen/" würde auf github.io/kaufen/ zeigen, also ins Leere.
// Warum Sprache: Im Code steht immer die deutsche Adresse (Kennung der Seite). pfad() übersetzt
// sie samt Parametern und Sprungziel über das Adressbuch (data/seiten.js).
//
//   pfad('kaufen/')                         →  /kiesel-website/v2/kaufen/
//   pfad('kiesel-1/#akku')                  →  /kiesel-website/v2/kiesel-1/#akku
//   pfad('kiesel-1/#akku', 'en')            →  /kiesel-website/v2/en/kiesel-1/#battery
//   pfad('kaufen/?modell=pro&farbe=x', 'en') →  /kiesel-website/v2/en/buy/?model=pro&color=x
//   pfad()                                  →  /kiesel-website/v2/   (Startseite)
//
// import.meta.env.BASE_URL setzt Astro selbst, dank trailingSlash:'always' mit "/" am Ende.
// Läuft im Build und im Browser.
import { SEITEN, EN_PRAEFIX, ANKER, PARAMETER } from '../data/seiten.js';

// Ausserhalb von Astro/Vite (Prüfskripte mit node) gibt es import.meta.env nicht: dann derselbe
// Wert wie base in astro.config.mjs.
const BASE = import.meta.env?.BASE_URL ?? '/kiesel-website/v2/';

// Nachschlagen in beide Richtungen: deutsch → englisch und englisch → deutsch
const umkehren = (tabelle) => Object.fromEntries(Object.entries(tabelle).map(([de, en]) => [en, de]));
const SEITE_EN = Object.fromEntries(SEITEN.filter(([, , , en]) => en !== null).map(([de, , , en]) => [de, en]));
const SEITE_DE = umkehren(SEITE_EN);
const ANKER_DE = umkehren(ANKER);
const PARAMETER_DE = umkehren(PARAMETER);
const has = (objekt, schluessel) => Object.prototype.hasOwnProperty.call(objekt, schluessel);

// Adresse in ihre Teile zerlegen: 'kaufen/?a=1#b' → ['kaufen/', 'a=1', 'b']
function teile(ziel) {
  const [ohneAnker, anker = null] = ziel.split(/#(.*)/s);
  const [weg, suche = ''] = ohneAnker.split(/\?(.*)/s);
  return [weg, suche, anker];
}

// Parameter-Namen übersetzen (Werte bleiben), unbekannte Namen bleiben stehen
function uebersetzeSuche(suche, tabelle) {
  if (!suche) return '';
  const q = new URLSearchParams(suche);
  const neu = new URLSearchParams();
  for (const [name, wert] of q) neu.append(has(tabelle, name) ? tabelle[name] : name, wert);
  return neu.toString();
}

// Sprungziel in einer Sprache: anker('kamera', 'en') → 'camera'. Unbekannte bleiben, wie sie sind.
export const anker = (kennung, sprache = 'de') => (sprache === 'en' && has(ANKER, kennung) ? ANKER[kennung] : kennung);

// Name eines URL-Parameters in einer Sprache: parameterName('farbe', 'en') → 'color'
export const parameterName = (kennung, sprache = 'de') => (sprache === 'en' && has(PARAMETER, kennung) ? PARAMETER[kennung] : kennung);

// Wert eines Parameters lesen, egal in welcher Sprache er in der Adresse steht:
// parameter(q, 'farbe') liest ?farbe= oder ?color= (die Sprache der Seite zuerst).
export function parameter(q, kennung, sprache = 'de') {
  const namen = [parameterName(kennung, sprache), kennung, PARAMETER[kennung]].filter(Boolean);
  for (const n of namen) if (q.has(n)) return q.get(n);
  return null;
}

// Parameter in der Sprache der Seite: suche({ modell: 'pro' }, 'en') → URLSearchParams model=pro
export function suche(werte, sprache = 'de') {
  return new URLSearchParams(Object.entries(werte).map(([k, v]) => [parameterName(k, sprache), v]));
}

export function pfad(ziel = '', sprache = 'de') {
  const [weg, q, a] = teile(ziel.replace(/^\//, ''));
  if (sprache !== 'en' || !has(SEITE_EN, weg)) return BASE + ziel.replace(/^\//, '');
  const suchteil = uebersetzeSuche(q, PARAMETER);
  return BASE + EN_PRAEFIX + SEITE_EN[weg] + (suchteil ? `?${suchteil}` : '') + (a !== null ? `#${anker(a, 'en')}` : '');
}

// Sprache einer Adresse (pathname mit base-Pfad): …/v2/en/… → 'en', sonst 'de'
export const spracheDerAdresse = (pathname) => (pathname.startsWith(BASE + EN_PRAEFIX) ? 'en' : 'de');

// Deutsche Adresse (Kennung) einer Seite aus ihrem pathname, oder null (Seite nur in einer Sprache
// bzw. unbekannt). '/kiesel-website/v2/en/buy/' → 'kaufen/'
export function seitenKennung(pathname) {
  if (!pathname.startsWith(BASE)) return null;
  const rest = pathname.slice(BASE.length);
  if (rest.startsWith(EN_PRAEFIX)) {
    const en = rest.slice(EN_PRAEFIX.length);
    return has(SEITE_DE, en) ? SEITE_DE[en] : null;
  }
  // Die 404-Seite kennt Astro beim Bauen als …/404/ (ausgeliefert wird sie als 404.html)
  if (rest === '404' || rest === '404/') return '404.html';
  return SEITEN.some(([de]) => de === rest) ? rest : null;
}

// Gibt es die Seite in dieser Sprache? (Designsystem und Spielwiese nur auf Deutsch)
export const gibtEs = (kennung, sprache) => kennung !== null && (sprache === 'de' || has(SEITE_EN, kennung));

// Dieselbe Seite in der anderen Sprache, samt übersetzten Parametern und Sprungziel.
// Für Sprachumschalter und Sprach-Hinweis. adresse = pathname + search + hash (wie location).
//   gegenadresse('/kiesel-website/v2/kaufen/?modell=pro#x', 'en') → '/kiesel-website/v2/en/buy/?model=pro#x'
// null, wenn es keine Gegenseite gibt.
export function gegenadresse(adresse, zielSprache) {
  const [weg, q, a] = teile(adresse);
  const kennung = seitenKennung(weg);
  if (!gibtEs(kennung, zielSprache)) return null;
  const von = spracheDerAdresse(weg);
  if (von === zielSprache) return adresse;
  // Alles erst auf Deutsch zurückführen, dann mit pfad() in die Zielsprache
  const suchteil = von === 'en' ? uebersetzeSuche(q, PARAMETER_DE) : q;
  const sprung = a === null ? null : von === 'en' && has(ANKER_DE, a) ? ANKER_DE[a] : a;
  return pfad(kennung + (suchteil ? `?${suchteil}` : '') + (sprung !== null ? `#${sprung}` : ''), zielSprache);
}

// Ist ziel die aktuelle Seite (genau) oder ein Teil davon (Bereich)?
// aktuell ist Astro.url.pathname, z.B. "/kiesel-website/v2/kiesel-1-pro/technik/".
export function istAktiv(aktuell, ziel, genau = true, sprache = 'de') {
  const voll = pfad(ziel, sprache).split('#')[0];
  return genau ? aktuell === voll : aktuell.startsWith(voll);
}
