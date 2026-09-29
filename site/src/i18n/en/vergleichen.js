// English texts, part “vergleichen”: /compare/ (page and lib/vergleich.js in the browser)
// Rules: see src/i18n/en.js.

// ── /compare/ (page and calculation lib/vergleich.js, also in the browser) ──
// Devices come as { name, typ } (typ: 'kiesel' | 'home' | 'notch' | 'island'): in English
// “Kiesel 1” without an article, but “the iPhone 13 mini”.
const nenne = (g, gross) => (g.typ === 'kiesel' ? g.name : `${gross ? 'The' : 'the'} ${g.name}`);
export const vergleich = {
  titel: 'Compare',
  beschreibung: 'Kiesel 1 and Kiesel 1 Pro to scale next to the iPhone SE, 13 mini, 18 Pro and 18 Pro Max. A fan concept.',
  einleitung: 'Every device shown to scale. Put your Kiesel next to an iPhone 18 Pro Max, and you’ll see right away what “compact” really means.',
  deinKiesel: 'Your Kiesel',
  gegen: 'vs.',
  ansicht: 'View',
  nebeneinander: 'Side by side',
  uebereinander: 'Overlaid',
  karteEinblenden: 'Show a credit card',
  quellen: 'Kiesel values are estimates from the concept. iPhone values are from the manufacturer and press reports; for the iPhone 18 Pro Max, sources differ slightly on thickness and battery.',
  kreditkarte: 'Credit card',
  mitKarte: ', with a credit card for scale',
  caption: (k, o) => `${k} and ${o} in numbers`,
  legende: (k, o) => `Solid: ${k}, dashed: ${o}`,
  label: (k, o, ueber) => `${k} and ${o} to scale, ${ueber ? 'overlaid' : 'side by side'}`,
  zeilen: { hoehe: 'Height', breite: 'Width', dicke: 'Thickness', gewicht: 'Weight', akku: 'Battery', display: 'Display' },
  // comparison sentence (cmp_js in gen4.py)
  gleicheFlaeche: (o, k) => `${nenne(o, true)} and ${nenne(k, false)} have exactly the same footprint.`,
  duenner: (o, mm, mehrAkku) => `${nenne(o, true)} is ${mm} mm thinner, but the Kiesel has ${mehrAkku}% more battery.`,
  groesser: (o, k, hoeher, breiter, prozent) => `${nenne(o, true)} is ${hoeher} mm taller and ${breiter} mm wider than ${nenne(k, false)}. Its front is ${prozent}% bigger.`,
  kleiner: (k, o, hoeher, breiter) => `${nenne(k, true)} is ${hoeher} mm taller and ${breiter} mm wider than ${nenne(o, false)}.`,
};
