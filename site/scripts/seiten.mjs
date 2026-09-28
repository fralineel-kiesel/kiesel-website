// Alle Seiten von Kiesel 2.0 für die Schlussprüfung (pruefe-ganz, fotografiere-ganz, lighthouse).
// [Adresse relativ zu /kiesel-website/v2/, Name, öffentlich]
// Nicht öffentlich: /designsystem/ und /spielwiese/ (noindex, Werkbank) und die 404-Seite.
// pruefe-ganz.mjs meldet, wenn im Build eine Seite dazukommt, die hier fehlt.
export const SEITEN = [
  ['', 'Startseite', true],
  ['kiesel-1/', 'Kiesel 1', true],
  ['kiesel-1/technik/', 'Kiesel 1 · Technik', true],
  ['kiesel-1-pro/', 'Kiesel 1 Pro', true],
  ['kiesel-1-pro/technik/', 'Kiesel 1 Pro · Technik', true],
  ['vergleichen/', 'Vergleichen', true],
  ['akku-rechner/', 'Akku-Rechner', true],
  ['funktionen/', 'Funktionen', true],
  ['zubehoer/', 'Zubehör', true],
  ['zubehoer/huelle/', 'Kiesel-Hülle', true],
  ['kaufen/', 'Kaufen', true],
  ['warenkorb/', 'Warenkorb', true],
  ['faq/', 'FAQ', true],
  ['404.html', '404', false],
  ['designsystem/', 'Designsystem', false],
  ['designsystem/spielwiese/', 'Spielwiese', false],
];

export const OEFFENTLICH = SEITEN.filter(([, , o]) => o);
