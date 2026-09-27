// Bilder, die auf das 3D-Modell geklebt werden (Texturen), gezeichnet mit Canvas 2D.
//
// Warum Canvas und nicht einfach die SVGs aus dem Zeichen-Motor?
//   Die SVGs haben Licht und Schatten schon aufgemalt (Verläufe, Glanzfleck). Im 3D rechnet
//   three.js das Licht selbst aus, sonst wäre es doppelt. Darum zeichnen wir hier nur die
//   "flachen" Teile: Farbe, MagSafe-Ring, Logo, Sperrbildschirm. Masse und Farben kommen
//   aus denselben Quellen wie backSvg()/frontSvg() in kiesel-draw/phone.js.
//
// Koordinaten: 1 Pixel = 1 Zeichen-Einheit = 0.1 mm, (0, 0) = linke obere Ecke der
// Rückseite (von hinten gesehen) bzw. der Vorderseite (von vorne gesehen).
import { PEB, V1, V2, WALL } from '../kiesel-draw/phone.js';
import { MODELS } from '../kiesel-draw/models.js';

function leinwand(b, h) {
  const c = document.createElement('canvas');
  c.width = Math.round(b);
  c.height = Math.round(h);
  return c;
}

// Rückseite: Farbe (col.back), MagSafe-Ring und das eingeprägte Kiesel-Logo.
// Zeichnet in eine bestehende Leinwand (beim Farbwechsel wird sie nur übermalt).
export function zeichneRuecken(c, mk, col) {
  const { W, H } = MODELS[mk];
  const g = c.getContext('2d');
  g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
  g.fillStyle = col.back;
  g.fillRect(0, 0, W, H);

  // MagSafe-Ring knapp unter der Mitte, wie in backSvg()
  const my = H * 0.517;
  g.globalAlpha = 0.5;
  g.strokeStyle = col.logo;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(W / 2, my, 182, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = col.logo;
  g.beginPath();
  g.roundRect(W / 2 - 4, my + 192, 8, 44, 4);
  g.fill();
  g.globalAlpha = 1;

  // Logo: Kiesel mit heller Kante unten, darin die zwei Adern
  g.save();
  g.translate(W / 2 - 60, my - 64);
  g.scale(1.2, 1.2);
  const kiesel = new Path2D(PEB);
  g.save();
  g.translate(0, 0.9);
  g.globalAlpha = 0.35;
  g.fillStyle = '#FFFFFF';
  g.fill(kiesel);
  g.restore();
  g.fillStyle = col.logo;
  g.fill(kiesel);
  g.clip(kiesel);
  g.lineCap = 'round';
  g.strokeStyle = col.backHi;
  g.lineWidth = 7;
  g.stroke(new Path2D(V1));
  g.globalAlpha = 0.7;
  g.lineWidth = 2.2;
  g.stroke(new Path2D(V2));
  g.restore();
}

// Rauheit der Rückseite als Graustufen (hell = matt, dunkel = glänzend).
// Das Logo glänzt, der Rest ist mattes Glas. Farbunabhängig, wird nur einmal gezeichnet.
export function zeichneRauheit(c, mk) {
  const { W, H } = MODELS[mk];
  const g = c.getContext('2d');
  g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
  g.fillStyle = 'rgb(190, 190, 190)'; // ≈ 0.75
  g.fillRect(0, 0, W, H);
  g.translate(W / 2 - 60, H * 0.517 - 64);
  g.scale(1.2, 1.2);
  g.fillStyle = 'rgb(80, 80, 80)'; // ≈ 0.3
  g.fill(new Path2D(PEB));
}

// Sperrbildschirm wie in frontSvg(): Hintergrund mit Kieseln, Datum, Uhrzeit, Knöpfe,
// Dynamic Island. Die Schriften sind dieselben wie auf der Seite (per @font-face geladen).
export async function zeichneBildschirm(c, mk) {
  const { W, H, R } = MODELS[mk];
  try {
    await Promise.all([document.fonts.load("400 150px 'Unbounded'"), document.fonts.load("500 34px 'Instrument Sans'")]);
  } catch { /* dann eben mit Ersatzschrift */ }
  const g = c.getContext('2d');
  g.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
  g.fillStyle = '#04060A';
  g.fillRect(0, 0, W, H);

  g.save();
  g.beginPath();
  g.roundRect(16, 16, W - 32, H - 32, R - 16);
  g.clip();

  // Hintergrund: radialer Verlauf "wb" (in SVG relativ zur Fläche, darum skalieren)
  g.save();
  g.translate(16, 16);
  g.scale(W - 32, H - 32);
  let v = g.createRadialGradient(0.3, 0.25, 0, 0.3, 0.25, 1);
  v.addColorStop(0, '#223A4E');
  v.addColorStop(0.6, '#111D28');
  v.addColorStop(1, '#090F15');
  g.fillStyle = v;
  g.fillRect(0, 0, 1, 1);
  g.restore();

  // Kiesel im Hintergrund (WALL), jeder mit eigenem Verlauf p1/p2/p3
  const VERLAUF = { p1: ['#7C9BAE', '#2E4556'], p2: ['#C2D3DA', '#5A7384'], p3: ['#3F5B70', '#141F29'] };
  for (const [x, y, rx, ry, a, id] of WALL) {
    g.save();
    g.scale(W / 586, H / 1238);
    g.translate(x, y);
    g.rotate((a * Math.PI) / 180);
    g.translate(-rx, -ry);
    g.scale(2 * rx, 2 * ry);
    v = g.createRadialGradient(0.35, 0.28, 0, 0.35, 0.28, 0.85);
    v.addColorStop(0, VERLAUF[id][0]);
    v.addColorStop(1, VERLAUF[id][1]);
    g.fillStyle = v;
    g.beginPath();
    g.ellipse(0.5, 0.5, 0.5, 0.5, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  g.textAlign = 'center';
  g.fillStyle = '#C7D3DA';
  g.font = "500 34px 'Instrument Sans', 'Segoe UI', sans-serif";
  g.fillText('Freitag, 25. September', W / 2, 204);
  g.fillStyle = '#F3F6F8';
  g.font = "400 150px 'Unbounded', 'Arial Black', sans-serif";
  if ('letterSpacing' in g) g.letterSpacing = '-4px';
  g.fillText('07:32', W / 2, 356);
  if ('letterSpacing' in g) g.letterSpacing = '0px';

  // Taschenlampe links, Kamera rechts, Home-Balken unten
  g.fillStyle = 'rgba(255, 255, 255, 0.14)';
  for (const bx of [W * 0.2, W * 0.8]) {
    g.beginPath();
    g.arc(bx, H - 140, 50, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#E9EEF3';
  g.beginPath();
  g.roundRect(W * 0.2 - 10, H - 168, 20, 44, 6);
  g.roundRect(W * 0.2 - 14, H - 170, 28, 12, 4);
  g.fill();
  g.strokeStyle = '#E9EEF3';
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(W * 0.8 - 22, H - 156, 44, 32, 7);
  g.stroke();
  g.beginPath();
  g.arc(W * 0.8, H - 140, 8, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = 'rgba(255, 255, 255, 0.85)';
  g.beginPath();
  g.roundRect(W / 2 - 90, H - 56, 180, 10, 5);
  g.fill();
  g.restore();

  // Dynamic Island mit Frontkamera
  g.fillStyle = '#000000';
  g.beginPath();
  g.roundRect(W / 2 - 80, 42, 160, 46, 23);
  g.fill();
  g.fillStyle = '#0D1824';
  g.beginPath();
  g.arc(W / 2 + 57, 65, 9, 0, Math.PI * 2);
  g.fill();
}

// Weicher Schatten am Boden: schwarzer Fleck, nach aussen durchsichtig
export function zeichneBodenschatten(c) {
  const g = c.getContext('2d');
  const v = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
  v.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  v.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  v.addColorStop(1, 'rgba(0, 0, 0, 0)');
  g.fillStyle = v;
  g.fillRect(0, 0, c.width, c.height);
}

export { leinwand };
