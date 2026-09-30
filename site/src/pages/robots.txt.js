// robots.txt: alles darf gelesen werden, dazu der Weg zur Sitemap.
//
// Achtung: Suchmaschinen lesen robots.txt NUR im Wurzelverzeichnis einer Domain, also unter
// https://fralineel-kiesel.github.io/robots.txt. Diese Seite liegt aber in einem Unterordner
// (/kiesel-website/). Die Datei hier ist darum vor allem Vorrat für später (falls die Seite
// einmal an der Wurzel einer eigenen Domain liegt) und zum Nachschauen. Wirksam anmelden lässt
// sich die Sitemap heute direkt in der Google Search Console.
//
// Die noindex-Seiten (Designsystem, Spielwiese) sind bewusst NICHT gesperrt: Eine Suchmaschine
// muss sie lesen dürfen, um das noindex überhaupt zu sehen.
export function GET({ site }) {
  const basis = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site);
  const text = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', basis).href}\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
