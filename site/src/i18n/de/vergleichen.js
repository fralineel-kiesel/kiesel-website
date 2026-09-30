// Deutsche Texte, Teil „vergleichen“: /vergleichen/ (Seite und lib/vergleich.js im Browser)
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── /vergleichen/ (Seite und Rechnung lib/vergleich.js, auch im Browser) ──
// Geräte kommen als { name, typ } (typ: 'kiesel' | 'home' | 'notch' | 'island'): im Deutschen
// „der Kiesel“, aber „das iPhone“.
const artikel = (g, gross) => (g.typ === 'kiesel' ? (gross ? 'Der' : 'der') : (gross ? 'Das' : 'das'));
export const vergleich = {
  titel: 'Vergleichen',
  beschreibung: 'Kiesel 1 und Kiesel 1 Pro im echten Massstab neben iPhone SE, 13 mini, 18 Pro und 18 Pro Max. Ein Fan-Konzept.',
  einleitung: 'Alle Geräte im echten Massstab zueinander. Stell deinen Kiesel neben ein iPhone 18 Pro Max, und du siehst sofort, was «kompakt» wirklich heisst.',
  deinKiesel: 'Dein Kiesel',
  gegen: 'gegen',
  ansicht: 'Ansicht',
  nebeneinander: 'Nebeneinander',
  uebereinander: 'Übereinander',
  karteEinblenden: 'Kreditkarte einblenden',
  quellen: 'Kiesel-Werte sind Schätzungen aus dem Konzept. iPhone-Werte laut Hersteller und Presseberichten, beim iPhone 18 Pro Max weichen die Quellen bei Dicke und Akku leicht voneinander ab.',
  kreditkarte: 'Kreditkarte',
  mitKarte: ', mit Kreditkarte zum Grössenvergleich',
  caption: (k, o) => `${k} und ${o} in Zahlen`,
  legende: (k, o) => `Gefüllt: ${k}, gestrichelt: ${o}`,
  label: (k, o, ueber) => `${k} und ${o} im Massstab ${ueber ? 'übereinander' : 'nebeneinander'}`,
  zeilen: { hoehe: 'Höhe', breite: 'Breite', dicke: 'Dicke', gewicht: 'Gewicht', akku: 'Akku', display: 'Display' },
  // Vergleichssatz (cmp_js in gen4.py)
  gleicheFlaeche: (o, k) => `${o.name} und ${k.name} haben genau dieselbe Grundfläche.`,
  duenner: (o, mm, mehrAkku) => `${artikel(o, true)} ${o.name} ist ${mm} mm dünner, dafür hat der Kiesel ${mehrAkku} % mehr Akku.`,
  groesser: (o, k, hoeher, breiter, prozent) => `${artikel(o, true)} ${o.name} ist ${hoeher} mm höher und ${breiter} mm breiter als ${artikel(k, false)} ${k.name}. Seine Vorderseite ist ${prozent} % grösser.`,
  kleiner: (k, o, hoeher, breiter) => `${artikel(k, true)} ${k.name} ist ${hoeher} mm höher und ${breiter} mm breiter als ${artikel(o, false)} ${o.name}.`,
};
