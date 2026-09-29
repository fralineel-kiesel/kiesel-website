// Zahlen, Preise, Prozent, Uhrzeit und Datum für die Anzeige, je nach Sprache.
// Jede Funktion nimmt die Sprache als letzten Parameter ('de' = Standard). Texte selbst stehen
// in src/i18n/, hier nur, WIE eine Zahl geschrieben wird.
//
//                        Deutsch (Schweiz)          Englisch (USA, Preise in Franken)
//   chf(1759)          → CHF 1’759.–                CHF 1,759
//   chf(131.8)         → CHF 131.80                 CHF 131.80
//   chfRappen(13180)   → CHF 131.80                 CHF 131.80   (wer in Rappen rechnet)
//   zahl(3600)         → 3’600                      3,600        zahl(123.8) → 123.8 in beiden
//   prozent(44)        → 44 %                       44%
//   uhrzeit(22.307)    → 22:18                      10:18 PM     (Stunden als Kommazahl oder Date)
//   uhrzeit(d, s, true)→ 07:32                      7:32         (Sperrbildschirm, ohne AM/PM)
//   stunde(7)          → 07:00                      7 AM         (Achse des Akku-Rechners)
//   datum(new Date(…)) → Freitag, 25. September     Friday, September 25
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
    ganzeFranken: '',       // CHF 1,200 (ganze Franken ohne Nachkommastellen)
    prozent: '%',           // 44%
    uhr24: false,           // 10:18 PM
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
  const nachkomma = rest !== 0 ? `.${String(rest).padStart(2, '0')}` : f.ganzeFranken ? `.${f.ganzeFranken}` : '';
  return `CHF ${minus}${franken}${nachkomma}`;
}

// Prozent: prozent(44) → „44 %“. Zahl wird wie bei zahl() geschrieben.
export const prozent = (wert, sprache = 'de') => zahl(wert, undefined, sprache) + fmt(sprache).prozent;

// Für die Anzeige: „15 %“ nie zwischen Zahl und Prozentzeichen umbrechen (geschütztes Leerzeichen).
// Nur wo der Text in einem schmalen Kasten steht (Akku-Rechner). Im Englischen steht kein
// Leerzeichen vor „%“; dort schützt es das AM/PM der Uhrzeit (10:18 PM).
export const geschuetzt = (text) => text.replace(/ (%|AM\b|PM\b)/g, '\u00a0$1');

// Uhrzeit aus Stunden (22.307 → 22:18) oder aus einem Date (Stunden/Minuten in UTC, damit
// Build und Browser in jeder Zeitzone dasselbe zeigen). ohneTageszeit: 12-Stunden-Zeit ohne
// AM/PM, wie auf dem Sperrbildschirm eines Handys (7:32); im Deutschen ohne Wirkung.
export function uhrzeit(zeit, sprache = 'de', ohneTageszeit = false) {
  const min = zeit instanceof Date ? zeit.getUTCHours() * 60 + zeit.getUTCMinutes() : Math.round(zeit * 60);
  const H = Math.floor(min / 60) % 24, M = min % 60;
  const mm = String(M).padStart(2, '0');
  if (fmt(sprache).uhr24) return `${String(H).padStart(2, '0')}:${mm}`;
  return `${H % 12 || 12}:${mm}` + (ohneTageszeit ? '' : ` ${H < 12 ? 'AM' : 'PM'}`);
}

// Volle Stunde für eine Achse: Deutsch wie uhrzeit() (07:00), Englisch kurz (7 AM, 11 PM)
export function stunde(h, sprache = 'de') {
  if (fmt(sprache).uhr24) return uhrzeit(h, sprache);
  const H = Math.round(h) % 24;
  return `${H % 12 || 12} ${H < 12 ? 'AM' : 'PM'}`;
}

// Datum mit Wochentag und Monat ausgeschrieben, ohne Jahr: „Freitag, 25. September“ /
// „Friday, September 25“. Das Date als UTC gemeint (new Date(Date.UTC(2026, 8, 25))).
export const datum = (tag, sprache = 'de') =>
  tag.toLocaleDateString(fmt(sprache).locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
