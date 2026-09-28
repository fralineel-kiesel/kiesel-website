// Prüft die Regeln des 3D-Wächters (src/lib/kiesel-3d/waechter.js) mit vorgegebenen,
// künstlichen Bildzeiten. Kein Browser, keine echte Messung, darum bei jedem Lauf gleich:
//
//   npm run pruefe:waechter
//
// Ob der Wächter in der echten Seite richtig angeschlossen ist, prüft pruefe:startseite
// (ebenfalls mit künstlichen Bildzeiten). Wie schnell 3D auf diesem Rechner wirklich läuft,
// misst nur leistung:startseite, und das blockiert nichts.
import { neuerWaechter, AUFWAERMEN, BILDER, ZU_LANGSAM_MS, NOTBREMSE_MS } from '../src/lib/kiesel-3d/waechter.js';

let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

// Spielt eine Folge von Bildzeiten ab. Ergebnis: bei welchem Bild (1-basiert) der Wächter
// 'zu-langsam' meldet (null = nie) und welchen Median er festgehalten hat.
function spiele(zeiten) {
  const w = neuerWaechter();
  let abbruch = null;
  zeiten.forEach((ms, i) => {
    const urteil = w.bild(ms);
    if (urteil) {
      if (abbruch !== null) throw new Error('Wächter hat zweimal entschieden');
      abbruch = i + 1;
    }
  });
  return { abbruch, median: w.median };
}
const mal = (n, ms) => Array(n).fill(ms);
const auf = mal(AUFWAERMEN, 16.7); // Aufwärmbilder, unauffällig

console.log('\n── Grenzen ──');
pruefe('Grenzen wie dokumentiert (3 Aufwärmbilder, 15 Bilder, 40 ms, 100 ms)',
  AUFWAERMEN === 3 && BILDER === 15 && ZU_LANGSAM_MS === 40 && NOTBREMSE_MS === 100);

console.log('\n── Median ──');
{
  const r = spiele(mal(30, 16.7));
  pruefe('60 fps: bleibt 3D, Median 16.7 ms', r.abbruch === null && r.median === 16.7, `abbruch=${r.abbruch}, median=${r.median}`);
}
{
  const r = spiele([...auf, ...mal(12, 60)]);
  pruefe('60 ms pro Bild: 2D genau beim 15. Bild', r.abbruch === 15 && r.median === 60, `abbruch=${r.abbruch}, median=${r.median}`);
}
{
  const r = spiele([...auf, ...mal(12, 40)]);
  pruefe('genau 40 ms: bleibt 3D (erst „über 40“ ist zu langsam)', r.abbruch === null, `abbruch=${r.abbruch}`);
}
{
  const r = spiele([...auf, ...mal(12, 40.1)]);
  pruefe('40.1 ms: 2D', r.abbruch === 15, `abbruch=${r.abbruch}`);
}
{
  const r = spiele([...mal(3, 900), ...mal(12, 16.7)]);
  pruefe('langsames Aufwärmen (3 × 900 ms) zählt nicht', r.abbruch === null && r.median === 16.7, `abbruch=${r.abbruch}`);
}
{
  const r = spiele([...auf, 16.7, 16.7, 500, ...mal(9, 16.7)]);
  pruefe('ein einzelner Hänger (500 ms) verschiebt den Median nicht', r.abbruch === null && r.median === 16.7, `median=${r.median}`);
}
{
  // 12 gezählte Bilder, Median = das 7. der Grösse nach (Index 6)
  const r1 = spiele([...auf, ...mal(6, 50), ...mal(6, 20)]);
  const r2 = spiele([...auf, ...mal(5, 50), ...mal(7, 20)]);
  pruefe('Hälfte langsam (6 von 12): 2D', r1.abbruch === 15 && r1.median === 50, `median=${r1.median}`);
  pruefe('knapp weniger als die Hälfte (5 von 12): bleibt 3D', r2.abbruch === null && r2.median === 20, `median=${r2.median}`);
}
{
  const r = spiele([...auf, ...mal(11, 16.7), 16.7, ...mal(20, 300)]);
  pruefe('nach dem Urteil schweigt der Wächter (auch bei später langsamen Bildern)', r.abbruch === null, `abbruch=${r.abbruch}`);
}

console.log('\n── Notbremse ──');
{
  const r = spiele([...auf, ...mal(3, 200)]);
  pruefe('3 × 200 ms nach dem Aufwärmen: 2D beim 6. Bild, ohne auf 15 zu warten', r.abbruch === 6 && r.median === null, `abbruch=${r.abbruch}`);
}
{
  const r = spiele([...auf, ...mal(3, 100)]);
  pruefe('genau 100 ms zählt nicht als zäh', r.abbruch === null, `abbruch=${r.abbruch}`);
}
{
  const r = spiele([...auf, 150, 150, 20, 150, 150, 20, ...mal(6, 16.7)]);
  pruefe('zähe Bilder mit Pause dazwischen: keine Notbremse, Median entscheidet', r.abbruch === null, `abbruch=${r.abbruch}, median=${r.median}`);
}
{
  const r = spiele([...mal(3, 500), 16.7, 16.7]);
  pruefe('zähe Aufwärmbilder lösen die Notbremse nicht aus', r.abbruch === null, `abbruch=${r.abbruch}`);
}
{
  const r = spiele([...auf, ...mal(8, 16.7), ...mal(3, 250)]);
  pruefe('Notbremse greift auch spät (Bild 12–14)', r.abbruch === 14, `abbruch=${r.abbruch}`);
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
