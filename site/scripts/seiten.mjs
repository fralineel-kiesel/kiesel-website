// Alle Seiten von Kiesel 2.0 für die Prüfskripte (pruefe-ganz, fotografiere-ganz, lighthouse …).
// Die Liste selbst steht in src/data/seiten.js (daraus entsteht auch sitemap.xml).
//   SEITEN / OEFFENTLICH:           nur die deutschen Seiten, [Adresse, Name, öffentlich, englische Adresse]
//   SEITEN_EN / OEFFENTLICH_EN:     nur die englischen, [en/…, „Name (en)“, öffentlich]
//   ALLE_SEITEN / ALLE_OEFFENTLICH: beide Sprachen, [Adresse, Name, öffentlich]
//   kennungVon('en/buy/') = 'kaufen/' (deutsche Adresse zu einer Adresse beider Sprachen)
export { SEITEN, OEFFENTLICH, SEITEN_EN, OEFFENTLICH_EN, ALLE_SEITEN, ALLE_OEFFENTLICH, kennungVon } from '../src/data/seiten.js';
