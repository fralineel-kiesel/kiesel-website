// Zahlen, Preise, Prozent, Uhrzeit und Datum für die Anzeige, je nach Sprache.
// Jede Funktion nimmt die Sprache als letzten Parameter ('de' = Standard). Texte selbst stehen
// in src/i18n/, hier nur, WIE eine Zahl geschrieben wird.
//
// Deutsch (Schweiz), so wie die Seite es immer gemacht hat:
//   chf(1759)          → CHF 1’759.–      Tausender = typografischer Apostroph (’)
//   chf(131.8)         → CHF 131.80       ganze Franken enden auf „.–“
//   chfRappen(13180)   → CHF 131.80       wer in Rappen rechnet (Ganzzahlen, exakt)
//   zahl(3600)         → 3’600            zahl(123.8) → 123.8, zahl(9, 1) → 9.0
//   prozent(44)        → 44 %             mit Leerzeichen (Duden), im Akku-Rechner geschützt
//   uhrzeit(22.307)    → 22:18            Stunden als Kommazahl oder ein Date, 24-Stunden-Zeit
//   datum(new Date(…)) → Freitag, 25. September
//
// Englisch ist vorbereitet (Etappe 9b), aber noch nirgends benutzt. Die Werte in FORMATE.en
// sind ein Vorschlag, entschieden wird in 9b.
export const FORMATE = {
  de: {
    locale: 'de-CH',
    tausender: '’',
    ganzeFranken: '–',      // CHF 1’200.–
    prozent: ' %',          // 44 %
    uhr24: true,
  },
  en: {
    locale: 'en-US',
    tausender: ',',
    ganzeFranken: '00',     // CHF 1,200.00 (Vorschlag)
    prozent: '%',           // 44%
    uhr24: false,           // 10:18 PM (Vorschlag)
  },
};

const fmt = (sprache) => FORMATE[sprache] ?? FORMATE.de;

// Zahl mit Tausenderzeichen. stellen = feste Nachkommastellen; ohne: so viele wie nötig (max. 2).
// Der Dezimalpunkt ist in beiden Sprachen ein Punkt (die Schweiz schreibt 123.8).
export function zahl(wert, stellen, sprache = 'de') {
  const opt = stellen === undefined ? { maximumFractionDigits: 2 } : { minimumFractionDigits: stellen, maximumFractionDigits: stellen };
  const f = fmt(sprache);
  // de-CH liefert je nach Node/Browser ’ oder ', darum vereinheitlichen
  return wert.toLocaleString(f.locale, opt).replace(/[’',]/g, f.tausender);
}

export function chf(betrag, sprache = 'de') {
  return chfRappen(Math.round(betrag * 100), sprache);
}

export function chfRappen(rappen, sprache = 'de') {
  const f = fmt(sprache);
  const minus = rappen < 0 ? '−' : '';
  const r = Math.abs(rappen);
  const franken = String(Math.floor(r / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, f.tausender);
  const rest = r % 100;
  return `CHF ${minus}${franken}.${rest === 0 ? f.ganzeFranken : String(rest).padStart(2, '0')}`;
}

// Prozent: prozent(44) → „44 %“. Zahl wird wie bei zahl() geschrieben.
export const prozent = (wert, sprache = 'de') => zahl(wert, undefined, sprache) + fmt(sprache).prozent;

// Für die Anzeige: „15 %“ nie zwischen Zahl und Prozentzeichen umbrechen (geschütztes Leerzeichen).
// Nur wo der Text in einem schmalen Kasten steht (Akku-Rechner); im Englischen ohne Leerzeichen.
export const geschuetzt = (text) => text.replace(/ %/g, ' %');

// Uhrzeit aus Stunden (22.307 → 22:18) oder aus einem Date (Stunden/Minuten in UTC, damit
// Build und Browser in jeder Zeitzone dasselbe zeigen)
export function uhrzeit(zeit, sprache = 'de') {
  const min = zeit instanceof Date ? zeit.getUTCHours() * 60 + zeit.getUTCMinutes() : Math.round(zeit * 60);
  const H = Math.floor(min / 60) % 24, M = min % 60;
  const mm = String(M).padStart(2, '0');
  if (fmt(sprache).uhr24) return `${String(H).padStart(2, '0')}:${mm}`;
  return `${H % 12 || 12}:${mm} ${H < 12 ? 'AM' : 'PM'}`;
}

// Datum mit Wochentag und Monat ausgeschrieben, ohne Jahr: „Freitag, 25. September“ /
// „Friday, September 25“. Das Date als UTC gemeint (new Date(Date.UTC(2026, 8, 25))).
export const datum = (tag, sprache = 'de') =>
  tag.toLocaleDateString(fmt(sprache).locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
