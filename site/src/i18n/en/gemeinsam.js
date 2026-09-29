// English texts, part “gemeinsam”: language, titles, layout, menus, color names, bag, checkout,
// prices, engraving. Same keys as src/i18n/de/gemeinsam.js (pruefe:englisch checks that).
// Rules: see src/i18n/en.js.

// ── Language of the page (<html lang>, link preview) and language switch ──
export const sprache = {
  html: 'en-US',
  og: 'en_US',
  hreflang: 'en',
  name: 'English',
  kurz: 'EN',
  wahl: 'Language',
};

// ── Language hint: shown on the German pages when the browser prefers English, so it is written
//    in English (lang="en") ──
export const sprachhinweis = {
  label: 'Language note',
  text: 'Also available in English.',
  link: 'Switch to English',
  schliessen: 'Dismiss',
};

// ── Title and description (BaseLayout: <title>, <meta description>, og:*) ──
export const meta = {
  marke: 'Kiesel',
  startTitel: 'Kiesel · Fits every hand.',
  titel: (seite) => `${seite} · Kiesel`,
  beschreibung: 'Kiesel 1 and Kiesel 1 Pro: two compact phones with a battery that lasts well into the night. A fan concept.',
};

// ── Layout: header, menus, sub-navigation, footer ──
export const geruest = {
  zumInhalt: 'Skip to content',
  zurStartseite: 'Kiesel, home',
  wortmarke: 'kiesel',
  hauptnavigation: 'Main navigation',
  kaufen: 'Buy',
  kaufenAb: (preis) => `Buy ${preis}`,
  handys: 'Phones',
  mehrErfahren: 'Learn more',
  menue: 'Menu',
  menueOeffnen: 'Open menu',
  menueSchliessen: 'Close menu',
  warenkorb: 'Bag',
  unterleiste: { uebersicht: 'Overview', technik: 'Tech Specs', vergleichen: 'Compare' },
  footerSatz: 'Two compact phones that only exist as an idea.',
  hinweisKonzept: 'Kiesel 1 and Kiesel 1 Pro are fan concepts, not real products. Prices and specs are estimates.',
  hinweisMarke: 'iPhone is a trademark of Apple Inc.',
  thema: { legende: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark' },
};

// ── Small building blocks (default labels) ──
export const bausteine = {
  zoomstufe: 'Zoom level',
  fach: 'x',               // screen readers only: “3x” (the visible x is aria-hidden)
  modell: 'Model',
  neuerTab: ' (opens in a new tab)', // screen readers only, right after the link text
};

// ── Counter on the bag button (WarenkorbKnopf.astro, also in the browser) ──
export const warenkorbKnopf = {
  leer: 'Bag, empty',
  artikel: (n) => `Bag, ${n} ${n === 1 ? 'item' : 'items'}`,
};

// ── Menu items (data/navigation.js: key → name) ──
export const navigation = {
  handys: 'Phones',
  funktionen: 'Features',
  zubehoer: 'Accessories',
  vergleichen: 'Compare',
  faq: 'FAQ',
  technik: 'Tech Specs',
  akkuRechner: 'Battery Calculator',
  farben: 'Colors',
  huelle: 'Kiesel Case',
  funktionenAusprobieren: 'Try the features',
  kaufen: 'Buy',
  warenkorb: 'Bag',
  entdecken: 'Explore',
  shop: 'Shop',
  hilfe: 'Help',
  konzept: 'About the concept',
  mehrZuDenHandys: 'More about the phones',
  beliebt: 'Popular',
};

// ── Colors: key (data/farben.js) → name ──
export const farben = {
  'sky-blue': 'Sky Blue',
  'matte-black': 'Matte Black',
  'titanium-gray': 'Titanium Gray',
  'matte-white': 'Matte White',
  'pebble-beige': 'Pebble Beige',
};

// ── Bag: drawer and /bag/ (WarenkorbInhalt.astro, also in the browser) ──
export const warenkorb = {
  titel: 'Bag',
  schliessen: 'Close bag',
  liste: 'Items in your bag',
  leerTitel: 'Your bag is empty.',
  leerText: 'Two small phones are waiting to be put together.',
  zusammenstellen: 'Build your Kiesel',
  vorschlagTitel: 'Add a matching case?',
  // sentence with the model name as a <span> in between: before + model + after
  vorschlagVor: 'Kiesel Case for ',
  vorschlagNach: (preis) => `, ${preis}. Frosted on the back, grippy on the sides.`,
  huellenFarbe: 'Case color',
  dazulegen: 'Add',
  weiter: 'Continue shopping',
  zwischensumme: 'Subtotal',
  versand: 'Shipping',
  kostenlos: 'free',
  mwst: (prozent) => `incl. ${prozent} VAT`,
  total: 'Total',
  zurKasse: 'Check out',
  einsWeniger: 'One less',
  einsMehr: 'One more',
  entfernen: 'Remove',
  anzahl: (wer) => `Quantity: ${wer}`,
  stueckPreis: (n, preis) => `${n} × ${preis}`,
  huelleFuer: (modell, farbe) => `Kiesel Case for ${modell} in ${farbe}`,
  huelleDrin: (modell, farbe) => `Kiesel Case for ${modell} in ${farbe} is in your bag.`,
  huelleVoll: (modell, farbe, max) => `You already have ${max} Kiesel Cases for ${modell} in ${farbe} in your bag. That’s the limit.`,
  nichtMehr: (max) => `The limit is ${max} per item.`,
  nichtWeniger: 'You need at least 1. To take it out, choose “Remove”.',
  neueAnzahl: (name, n, total) => `${name}: ${n}. Total ${total}.`,
  entfernt: (name) => `${name} removed.`,
  imWarenkorb: 'In your bag ✓',
};

// ── Checkout (KasseDialog.astro, also in the browser) ──
export const kasse = {
  kicker: 'Checkout',
  titel: 'Kiesel only exists in our heads.',
  bezahlen: 'So there’s nothing to pay for.',
  // depending on where the bag is stored (speicherOrt() in scripts/warenkorb.js)
  speicher: {
    dauerhaft: 'But your bag stays saved, just in case Cupertino changes its mind.',
    sitzung: 'But your bag stays here as long as this tab is open, just in case Cupertino changes its mind.',
    seite: 'But your bag stays here until you leave this page, just in case Cupertino changes its mind.',
  },
  bestellung: 'Your order',
  weitertraeumen: 'Keep dreaming',
  leeren: 'Empty bag',
};

// ── Bag: name and description of an item (scripts/warenkorb.js, artikelInfo) ──
export const warenkorbArtikel = {
  huelle: 'Kiesel Case',
  huelleDetails: (modell, farbe) => `for ${modell}, ${farbe}`,
  // engraving already has non-breaking spaces; one before it too, so “engraved “…”” stays together
  handyDetails: (farbe, speicher, gravur) => `${farbe}, ${speicher}` + (gravur ? `, engraved “${gravur}”` : ''),
};

// ── 404 ──
export const fehler404 = {
  titel: 'Page not found',
  beschreibung: 'This page doesn’t exist (anymore). From here you can get back to Kiesel 1 and Kiesel 1 Pro.',
  ueberschrift: 'This Kiesel rolled away.',
  text: 'This page doesn’t exist (anymore). One of these might get you back on track.',
  zurStartseite: 'Go to the home page',
  proAnsehen: 'See Kiesel 1 Pro',
};

// ── /bag/ ──
export const warenkorbSeite = {
  titel: 'Bag',
  beschreibung: 'Everything you picked, ready for a checkout that is sadly just a concept.',
  einleitung: 'Everything you picked, ready for checkout. Which, sadly, is just a concept.',
};

// ── Prices: labels around the numbers (data/preise.js) ──
export const preise = {
  ab: (preis) => `from ${preis}`,
  bereich: (von, bis) => `${von} to ${bis}`,
  unterzeile: { k1: 'SE size', pro: '13 mini size, 3x telephoto' },
};

// ── Engraving: validation messages (lib/gravur.js, also in the browser) ──
export const gravur = {
  erlaubt: "letters, numbers, spaces and . , ' ’ & ! ? + -",
  tabulator: 'Tab',
  sonderLeerzeichen: 'Special space',
  zeichen: (z) => `“${z}”`,
  nichtErlaubt: (liste, anzahl) => `${liste} can’t be engraved. Allowed: ${gravur.erlaubt}`,
  zuLang: (max, zuviel) => `${max} characters max. That’s ${zuviel === 1 ? '1 character' : `${zuviel} characters`} too many.`,
};

// ── Physical values (data/geraete.js, also in the browser): “approx. ” before estimates ──
export const geraete = {
  ca: 'approx. ',
};
