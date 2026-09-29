// Überlauf messen (läuft im Browser per seite.evaluate(miss)). Gemeinsam für fotos:pseudo und
// fotos:englisch. Meldet
//   - die Seite scrollt seitlich (breiter als das Fenster)
//   - ein Element mit Text ist breiter als sein Kasten und schneidet ab (overflow ≠ visible)
//     oder ragt über den Rand seines Elternelements hinaus
// Text in SVG und nur für Screenreader (.vh) zählt nicht.
export function miss() {
  const probleme = [];
  const b = document.documentElement.scrollWidth, w = innerWidth;
  if (b > w + 1) probleme.push(`Seite scrollt seitlich: ${b} px breit bei ${w} px Fenster`);
  const name = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {
    // Nur für Screenreader (.vh: absichtlich 1 px gross) zählt nicht, SVG-Text auch nicht
    if (!el.checkVisibility?.() || !el.textContent.trim() || el.closest('svg, .vh')) continue;
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
    if (!eigenerText) continue;
    const s = getComputedStyle(el);
    const text = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (el.scrollWidth > el.clientWidth + 1 && s.overflowX !== 'visible') probleme.push(`abgeschnitten: ${name(el)} „${text}“ (${el.scrollWidth} statt ${el.clientWidth} px)`);
    const e = el.getBoundingClientRect(), p = el.parentElement?.getBoundingClientRect();
    if (p && p.width > 0 && e.right > p.right + 2 && getComputedStyle(el.parentElement).overflowX === 'visible' && e.width < w) {
      probleme.push(`ragt heraus: ${name(el)} „${text}“ (${Math.round(e.right - p.right)} px über ${name(el.parentElement)})`);
    }
  }
  return [...new Set(probleme)];
}
