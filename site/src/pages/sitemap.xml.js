// sitemap.xml: alle öffentlichen Seiten für Suchmaschinen (Liste in data/seiten.js).
// Designsystem, Spielwiese und 404 stehen nicht drin (noindex).
// Die Adressen sind absolut und kommen aus site + base in astro.config.mjs, also dieselben
// wie der canonical-Link jeder Seite (BaseLayout).
import { OEFFENTLICH } from '../data/seiten.js';

export function GET({ site }) {
  const basis = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site);
  const eintraege = OEFFENTLICH.map(([adresse]) => `  <url><loc>${new URL(adresse, basis).href}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
