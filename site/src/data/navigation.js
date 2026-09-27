// Alle Menüs an einem Ort. Pfade sind relativ zur Startseite, pfad() setzt den base-Pfad davor.
// Wer eine Seite umbenennt, muss nur hier nachziehen.

// Hauptmenü in der Kopfzeile. „Handys“ ist kein Link, sondern öffnet das Aufklappmenü.
export const HAUPTMENUE = [
  { name: 'Handys', menue: true, bereich: ['kiesel-1/', 'kiesel-1-pro/'] },
  { name: 'Funktionen', pfad: 'funktionen/' },
  { name: 'Zubehör', pfad: 'zubehoer/' },
  { name: 'Vergleichen', pfad: 'vergleichen/' },
  { name: 'FAQ', pfad: 'faq/' },
];

// Die zwei Linkspalten im aufgeklappten Menü „Handys“
export const HANDYS_SPALTEN = [
  {
    titel: 'Mehr zu den Handys',
    links: [
      { name: 'Vergleichen', pfad: 'vergleichen/' },
      { name: 'Technische Daten', pfad: 'kiesel-1-pro/technik/' },
      { name: 'Akku-Rechner', pfad: 'kiesel-1/#akku' },
      { name: 'Farben', pfad: 'kaufen/' },
    ],
  },
  {
    titel: 'Beliebt',
    links: [
      { name: 'Kiesel-Hülle', pfad: 'zubehoer/huelle/' },
      { name: 'Funktionen ausprobieren', pfad: 'funktionen/' },
      { name: 'Kaufen', pfad: 'kaufen/' },
    ],
  },
];

// Seitenübersicht im Footer
export const FOOTER_SPALTEN = [
  {
    titel: 'Handys',
    links: [
      { name: 'Kiesel 1', pfad: 'kiesel-1/' },
      { name: 'Kiesel 1 Pro', pfad: 'kiesel-1-pro/' },
      { name: 'Vergleichen', pfad: 'vergleichen/' },
    ],
  },
  {
    titel: 'Entdecken',
    links: [
      { name: 'Funktionen', pfad: 'funktionen/' },
      { name: 'Technische Daten', pfad: 'kiesel-1-pro/technik/' },
      { name: 'Akku-Rechner', pfad: 'kiesel-1/#akku' },
    ],
  },
  {
    titel: 'Shop',
    links: [
      { name: 'Kaufen', pfad: 'kaufen/' },
      { name: 'Zubehör', pfad: 'zubehoer/' },
      { name: 'Warenkorb', pfad: 'warenkorb/' },
    ],
  },
  {
    titel: 'Hilfe',
    links: [
      { name: 'FAQ', pfad: 'faq/' },
      { name: 'Über das Konzept', pfad: 'faq/#konzept' },
    ],
  },
];

// Die Etappen von Kiesel 2.0 (für die Platzhalter „Inhalt folgt in Etappe X“)
export const ETAPPEN = {
  1: 'Fundament',
  2: 'Zeichen-Motor',
  3: 'Startseite mit 3D',
  4: 'Modellseiten mit Akku-Story',
  5: 'Kamera-Demos',
  6: 'Funktionen, Zubehör, Kaufen, Warenkorb',
  7: 'Vergleichen, FAQ, Feinschliff',
};
