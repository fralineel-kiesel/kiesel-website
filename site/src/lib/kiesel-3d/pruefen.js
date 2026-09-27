// Darf dieses Gerät das 3D-Modell zeigen? Antwort: null = ja, sonst der Grund dagegen.
//
// Diese Datei importiert bewusst NICHTS von three.js. Sie läuft auf jeder Startseite sofort,
// three.js (rund 150 KB) wird erst geladen, wenn hier null herauskommt.
//
// Die Gründe, in dieser Reihenfolge:
//   'reduced-motion'  Das System wünscht weniger Bewegung. Nicht verhandelbar.
//   'schwaches-geraet' Weniger als 4 Prozessorkerne. Grobe Schätzung, aber billig zu haben.
//                     Achtung, Browser schummeln hier zum Schutz vor Fingerabdrücken:
//                     Safari auf iOS meldet heute immer 4 (ältere Versionen höchstens 2).
//                     Die Grenze darum nie über 4 setzen, sonst fällt jedes iPhone raus.
//                     Der eigentliche Schutz ist der Wächter in buehne.js, der echt misst.
//   'datensparen'     Der Browser ist im Datensparmodus (Android/Chrome).
//   'kein-webgl'      Kein WebGL 2 (braucht three.js), oder der Browser meldet selbst, dass
//                     er nur per Software rechnen könnte (failIfMajorPerformanceCaveat).
//                     Software heisst: Die CPU rechnet jedes Pixel selbst. Genau das
//                     macht Handys heiss und die Seite zäh.
//   'software-grafik' Der Browser gibt einen Kontext, aber der Renderer heisst SwiftShader,
//                     llvmpipe o.ä., also doch Software. Kommt vor, wenn Chrome SwiftShader
//                     als "richtige" Grafik behandelt (z.B. Lighthouse, Linux ohne Treiber).
//
// Zum Testen (headless Chrome hat keine Grafikkarte), steht in der Adresse:
//   ?3d=software  lässt Software-Rendering zu. Alle anderen Gründe gelten trotzdem.
//   ?3d=foto      dazu ohne Wächter (buehne.js), nur fürs Foto-Skript: Headless Chrome liefert
//                 dort so stockend Bilder, dass der Wächter sonst zu Recht auf 2D schaltet.
export const TESTMODUS = new URLSearchParams(location.search).get('3d');

export function grundGegen3D() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const kerne = navigator.hardwareConcurrency;
  if (kerne && kerne < 4) return 'schwaches-geraet';
  if (navigator.connection?.saveData) return 'datensparen';

  const software = TESTMODUS === 'software' || TESTMODUS === 'foto';
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: !software });
    if (!gl) return 'kein-webgl';
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    // Den Probe-Kontext sofort wieder freigeben: Browser erlauben nur ~16 gleichzeitig
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (!software && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return 'software-grafik';
  } catch {
    return 'kein-webgl';
  }
  return null;
}
