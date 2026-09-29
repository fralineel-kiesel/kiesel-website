// sitemap.xml: alle öffentlichen Seiten in beiden Sprachen für Suchmaschinen (Adressbuch in
// data/seiten.js). Designsystem, Spielwiese und die 404-Seiten stehen nicht drin (noindex).
// Die Adressen sind absolut und kommen aus site + base in astro.config.mjs, also dieselben wie
// der canonical-Link jeder Seite (BaseLayout). Jeder Eintrag nennt dazu seine Gegenseite in der
// anderen Sprache (xhtml:link, wie die hreflang-Verweise im <head>), x-default = Deutsch.
import { OEFFENTLICH } from '../data/seiten.js';
import { pfad, gibtEs } from '../lib/pfad.js';
import { texte, SPRACHEN } from '../i18n/index.js';

export function GET({ site }) {
  const absolut = (adresse) => new URL(adresse, site).href;
  const eintraege = [];
  for (const sprache of SPRACHEN) {
    for (const [kennung] of OEFFENTLICH) {
      if (!gibtEs(kennung, sprache)) continue;
      const paare = SPRACHEN.filter((s) => gibtEs(kennung, s)).map((s) => [texte(s).sprache.hreflang, absolut(pfad(kennung, s))]);
      if (paare.length > 1) paare.push(['x-default', absolut(pfad(kennung, 'de'))]);
      const links = paare.map(([h, href]) => `\n    <xhtml:link rel="alternate" hreflang="${h}" href="${href}"/>`).join('');
      eintraege.push(`  <url>\n    <loc>${absolut(pfad(kennung, sprache))}</loc>${links}\n  </url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${eintraege.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
