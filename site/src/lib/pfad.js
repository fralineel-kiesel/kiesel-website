// pfad() baut interne Links mit dem base-Pfad aus astro.config.mjs.
// Warum: Die Seite liegt (vorerst) unter /kiesel-website/v2/. Ein fester Link wie
// "/kaufen/" würde auf github.io/kaufen/ zeigen, also ins Leere.
//
//   pfad('kaufen/')        →  /kiesel-website/v2/kaufen/
//   pfad('kiesel-1/#akku') →  /kiesel-website/v2/kiesel-1/#akku
//   pfad()                 →  /kiesel-website/v2/   (Startseite)
//
// import.meta.env.BASE_URL setzt Astro selbst, dank trailingSlash:'always' mit "/" am Ende.
export function pfad(ziel = '') {
  return import.meta.env.BASE_URL + ziel.replace(/^\//, '');
}

// Ist ziel die aktuelle Seite (genau) oder ein Teil davon (Bereich)?
// aktuell ist Astro.url.pathname, z.B. "/kiesel-website/v2/kiesel-1-pro/technik/".
export function istAktiv(aktuell, ziel, genau = true) {
  const voll = pfad(ziel).split('#')[0];
  return genau ? aktuell === voll : aktuell.startsWith(voll);
}
