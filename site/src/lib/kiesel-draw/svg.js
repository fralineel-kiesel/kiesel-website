// Grundwerkzeuge des Zeichen-Motors, übersetzt aus design/generator/lib.py.
// Alles baut SVG als Text (String). Warum Text und nicht DOM-Elemente?
//   - Text funktioniert überall: im Astro-Build auf dem Server (dort gibt es kein
//     `document`) genauso wie im Browser.
//   - Ein ganzes Handy als ein String ist mit einem einzigen innerHTML eingesetzt,
//     das ist schneller als hunderte createElement-Aufrufe.
// Wer doch ein Element braucht: alsElement() ganz unten.

// Zahl → Text mit höchstens 2 Nachkommastellen, genau wie Pythons f():
//   ("%.2f" % x).rstrip("0").rstrip(".")   12.5 → "12.5", 3.0 → "3", -0.001 → "-0"
// Stolperstein: Liegt eine Zahl exakt in der Mitte (z.B. 0.125), rundet Python auf die
// gerade Ziffer ab (0.12), JavaScripts toFixed() dagegen weg von der Null (0.13).
// Exakt in der Mitte können nur Vielfache von 1/8 liegen (0.125, 0.375, …), die
// behandeln wir darum von Hand. So entstehen Zeichen für Zeichen dieselben SVGs wie in Python.
export function f(x) {
  let s;
  const achtel = Math.abs(x) * 8; // exakt, weil 8 eine Zweierpotenz ist
  if (Number.isInteger(achtel) && achtel % 2 === 1) {
    // Genau in der Mitte zwischen zwei Hundertsteln: auf die gerade Ziffer runden
    let n = Math.floor(Math.abs(x) * 100);
    if (n % 2 === 1) n += 1;
    s = (x < 0 ? '-' : '') + (n / 100).toFixed(2);
  } else {
    s = x.toFixed(2);
    if (Object.is(x, -0)) s = '-' + s; // Python schreibt "-0.00", JavaScript "0.00"
  }
  return s.replace(/0+$/, '').replace(/\.$/, '');
}

// Wie Pythons str() für Kommazahlen: 820.0 → "820.0" (JavaScript würde "820" schreiben).
// Nur dort nötig, wo lib.py/scene.py eine Kommazahl ohne f() direkt in den Text schreibt.
export const py = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

// Ein SVG-Element als Text: E('circle', { r: 5 }) → <circle r="5"></circle>
// Die Reihenfolge der Attribute bleibt wie angegeben (wichtig für den Vergleich mit Python).
export function E(tag, attrs, inner = '') {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<${tag} ${a}>${inner}</${tag}>`;
}

// Eine Farbstelle in einem Verlauf, optional mit Deckkraft
export function stop(o, color, op = null) {
  const st = `stop-color: ${color}` + (op === null ? '' : `; stop-opacity: ${op}`);
  return E('stop', { offset: o, style: st });
}

// Abgerundetes Rechteck als Pfad. Warum nicht einfach <rect rx>? Weil man Pfade
// aneinanderhängen kann: "aussen innen" mit fill-rule evenodd ergibt einen Rahmen mit Loch
// (so entstehen die Hülle und ihr Kamera-Ausschnitt).
export function rr(x, y, w, h, r) {
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
}

// Punktliste für <polygon>/<polyline>: [[1,2],[3,4]] → "1,2 3,4"
export const pts = (lst) => lst.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

// Eindeutige Präfixe für IDs. SVG-IDs gelten für die ganze Seite: Hätten zwei Handys
// beide einen Verlauf "fr", würde das zweite die Farbe des ersten übernehmen.
// Darum bekommt jede Zeichnung ihr eigenes Präfix (k1, k2, …), wie PID in gen2.py.
let zaehler = 0;
export const uid = (vorsilbe = 'k') => `${vorsilbe}${++zaehler}`;

// SVG-Text → echtes DOM-Element (nur im Browser). Für Fälle, in denen man das Element
// weiterbearbeiten will, statt es per innerHTML einzusetzen.
export function alsElement(svgText) {
  const t = document.createElement('template');
  t.innerHTML = svgText.trim();
  return t.content.firstElementChild;
}
