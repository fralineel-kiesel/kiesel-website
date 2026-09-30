// Alle Menüs an einem Ort. Pfade sind relativ zur Startseite, pfad() setzt den base-Pfad davor.
// Wer eine Seite umbenennt, muss nur hier nachziehen.
// text = Schlüssel in navigation (src/i18n/de.js); Gerätenamen (name) sind Eigennamen.

// Hauptmenü in der Kopfzeile. „Handys“ ist kein Link, sondern öffnet das Aufklappmenü.
export const HAUPTMENUE = [
  { text: 'handys', menue: true, bereich: ['kiesel-1/', 'kiesel-1-pro/', 'akku-rechner/'] },
  { text: 'funktionen', pfad: 'funktionen/' },
  { text: 'zubehoer', pfad: 'zubehoer/' },
  { text: 'vergleichen', pfad: 'vergleichen/' },
  { text: 'faq', pfad: 'faq/' },
];

// Die zwei Linkspalten im aufgeklappten Menü „Handys“
export const HANDYS_SPALTEN = [
  {
    titel: 'mehrZuDenHandys',
    links: [
      { text: 'vergleichen', pfad: 'vergleichen/' },
      { text: 'technik', pfad: 'kiesel-1-pro/technik/' },
      { text: 'akkuRechner', pfad: 'akku-rechner/' },
      { text: 'farben', pfad: 'kaufen/' },
    ],
  },
  {
    titel: 'beliebt',
    links: [
      { text: 'huelle', pfad: 'zubehoer/huelle/' },
      { text: 'funktionenAusprobieren', pfad: 'funktionen/' },
      { text: 'kaufen', pfad: 'kaufen/' },
    ],
  },
];

// Seitenübersicht im Footer
export const FOOTER_SPALTEN = [
  {
    titel: 'handys',
    links: [
      { name: 'Kiesel 1', pfad: 'kiesel-1/' },
      { name: 'Kiesel 1 Pro', pfad: 'kiesel-1-pro/' },
      { text: 'vergleichen', pfad: 'vergleichen/' },
    ],
  },
  {
    titel: 'entdecken',
    links: [
      { text: 'funktionen', pfad: 'funktionen/' },
      { text: 'technik', pfad: 'kiesel-1-pro/technik/' },
      { text: 'akkuRechner', pfad: 'akku-rechner/' },
    ],
  },
  {
    titel: 'shop',
    links: [
      { text: 'kaufen', pfad: 'kaufen/' },
      { text: 'zubehoer', pfad: 'zubehoer/' },
      { text: 'warenkorb', pfad: 'warenkorb/' },
    ],
  },
  {
    titel: 'hilfe',
    links: [
      { text: 'faq', pfad: 'faq/' },
      { text: 'konzept', pfad: 'faq/#konzept' },
    ],
  },
];

// Anzeigename eines Menüpunkts: Eigenname oder Text aus der Textdatei (t = texte(sprache))
export const linkName = (eintrag, t) => eintrag.name ?? t.navigation[eintrag.text];
