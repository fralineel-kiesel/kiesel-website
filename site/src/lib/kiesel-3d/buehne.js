// Die 3D-Bühne: Renderer, Licht, Steuerung, Zeichenschleife und Notausgänge.
//
// Wird NUR per import() geladen, wenn pruefen.js "ja" sagt. Vite legt diese Datei samt
// three.js dann in eine eigene JS-Datei, die ausser der Startseite niemand anfordert.
//
//   const b = await starte3D({ ziel, modell, farbe, label, beiAbbruch, waechter, gerade })
//   gerade: nur für Tests (?3d=gerade), Handy still und genau von hinten, ohne Neigung
//   freiOben(): wie viele Pixel oben auf der Bühne belegt sind (Umschalter). Das Bild rückt um
//   die Hälfte nach unten, damit das Handy in der Mitte des freien Teils steht.
//   b.setzeFarbe('Mattschwarz')   await b.setzeModell('k1')   b.beenden()
//   beiAbbruch(grund) wird aufgerufen, wenn 3D unterwegs aufgibt ('kontextverlust',
//   'zu-langsam', 'beendet'). Dann ist die Leinwand schon entfernt und aufgeräumt.
//
// ── Wie das Drehen funktioniert (Drehteller statt Kamerafahrt) ──
// OrbitControls bewegt normalerweise die Kamera um das Objekt herum. Dann wandert man aber
// auch um die Lampen herum, und die Vorderseite stünde plötzlich im Gegenlicht. Im Fotostudio
// macht man es umgekehrt: Kamera und Licht bleiben stehen, das Produkt dreht sich auf einem
// Drehteller. Genau so hier: OrbitControls steuert eine unsichtbare "Steuerkamera". Daraus
// rechnen wir jedes Bild aus, wie sich das Handy drehen müsste, damit die echte, feste
// Kamera dasselbe sieht. Das Licht kommt dadurch immer von vorne oben links, wie in der SVG.
//
// ── Modellwechsel im echten Massstab ──
// Beide Kiesel entstehen aus derselben Funktion (baueKiesel + bauplan). Gebaut wird zuerst nur
// das angezeigte Modell, das andere beim ersten Umschalten, danach bleiben beide im Speicher.
// Die Kamera steht fest (Abstand nach dem grössten Kiesel), darum ist der Kiesel 1 im Bild
// wirklich kleiner. Übergang: Das letzte Bild des alten Modells liegt als Schnappschuss
// darüber und blendet aus, darunter wächst oder schrumpft das neue von der alten Grösse auf
// seine echte. (Die Modelle selbst halb durchsichtig zu machen, gäbe Sortierfehler bei Glas
// und Metall.)
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, DirectionalLight, Group, Matrix4,
  NeutralToneMapping, MathUtils, Vector3,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { baueKiesel } from './modell.js';
import { bauplan } from './bauplan.js';
import { neuerWaechter } from './waechter.js';
import { GERAETE, KIESEL_IDS } from '../../data/geraete.js';

const NEIGUNG = 10;           // Grad, das Handy lehnt leicht nach links (wie drehung -10 in 2D)
const BLICK_VON_OBEN = 84;    // Grad von der Senkrechten: 90 = genau von vorne, kleiner = von oben
const SEKUNDEN_PRO_RUNDE = 40;
const PAUSE_NACH_ANFASSEN = 6000; // ms, danach dreht es sich wieder von selbst
const MAX_FPS = 60;
const WECHSEL_MS = 350;       // Modellwechsel: Grösse und Überblenden
const ABSTAND_NACH_H = Math.max(...KIESEL_IDS.map((id) => GERAETE[id].hoehe)); // mm, grösster Kiesel

// Hauptthread kurz freigeben, damit Klicks und Scrollen zwischendurch drankommen.
// Sonst wäre der ganze Start (Modell bauen, Licht vorberechnen, Shader übersetzen) eine
// einzige lange Aufgabe, während der die Seite nicht reagiert.
const luftholen = () => new Promise((r) => setTimeout(r, 0));

export async function starte3D({ ziel, modell = 'pro', farbe = 'sky-blue', label = '', beiAbbruch = () => {}, waechter: mitWaechter = true, gerade = false, freiOben = () => 0 }) {
  const leinwand = document.createElement('canvas');
  leinwand.className = 'leinwand-3d';
  leinwand.setAttribute('role', 'img');
  leinwand.setAttribute('aria-label', label);
  leinwand.tabIndex = 0; // mit Tab erreichbar, dann drehen die Pfeiltasten

  let beendet = false;
  const aufraeumen = [];

  function abbrechen(grund) {
    if (beendet) return;
    beendet = true;
    cancelAnimationFrame(rafId);
    for (const f of aufraeumen) f();
    leinwand.remove();
    beiAbbruch(grund);
  }

  // Grafikkarte weg (Treiber-Neustart, zu viele Tabs, Energiesparen): sofort zurück auf 2D.
  leinwand.addEventListener('webglcontextlost', () => abbrechen('kontextverlust'));

  // ── Renderer ─────────────────────────────────────────────────────────────
  // antialias: glatte Kanten. alpha: durchsichtiger Hintergrund, die Bühne dahinter (CSS)
  // bleibt sichtbar und wechselt mit dem Thema. powerPreference 'low-power': auf Laptops
  // mit zwei Grafikchips den sparsamen nehmen.
  const renderer = new WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true, powerPreference: 'low-power' });
  aufraeumen.push(() => renderer.dispose());
  // Pixeldichte begrenzen: Ein Handy-Bildschirm mit 3 Pixeln pro CSS-Pixel hätte 9 × so viele
  // Pixel zu berechnen wie einer mit 1. Ab 1.5 sieht man bei einem drehenden Objekt kaum mehr.
  const handyBildschirm = matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, handyBildschirm ? 1.5 : 2));
  // Tone Mapping: bringt die Helligkeiten der Lichtberechnung auf den Bildschirm.
  // "Neutral" (Khronos PBR Neutral) verfälscht Grundfarben am wenigsten: Himmelblau
  // soll Himmelblau bleiben, damit 3D und 2D zusammenpassen.
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const szene = new Scene();

  // ── Licht ────────────────────────────────────────────────────────────────
  // 1. Umgebung: RoomEnvironment ist ein kleines Fotostudio (Wände, Leuchtflächen), das
  //    three.js im Code baut, also keine Bilddatei, die man laden müsste. PMREM rechnet es
  //    einmal in eine Umgebungs-Textur um, in der sich Metall und Glas spiegeln.
  //    Ohne Umgebung sähe Metall schwarz aus: es hätte nichts zu spiegeln.
  await luftholen();
  if (beendet) return null;
  const pmrem = new PMREMGenerator(renderer);
  const raum = new RoomEnvironment();
  const umgebung = pmrem.fromScene(raum, 0.04);
  raum.dispose?.();
  pmrem.dispose();
  szene.environment = umgebung.texture;
  szene.environmentIntensity = 0.7;
  aufraeumen.push(() => umgebung.dispose());
  // 2. Hauptlicht von oben links vorne, wie der Glanzfleck (hl) in der SVG-Rückseite.
  //    Keine Schatten-Berechnung (castShadow bleibt aus), das spart einen ganzen Durchgang.
  const hauptlicht = new DirectionalLight(0xffffff, 1.0);
  hauptlicht.position.set(-60, 120, 140);
  szene.add(hauptlicht);

  // ── Modell ───────────────────────────────────────────────────────────────
  // wurzel (Grösse beim Wechsel) → drehteller (Drehung aus der Steuerkamera) → neigung (lehnt
  // nach links) → Handys. Die Bodenschatten hängen an der wurzel: Sie drehen nicht mit.
  const wurzel = new Group();
  const drehteller = new Group();
  drehteller.matrixAutoUpdate = false;
  const neigung = new Group();
  const neigungGrad = gerade ? 0 : NEIGUNG;
  neigung.rotation.z = MathUtils.degToRad(neigungGrad);
  drehteller.add(neigung);
  wurzel.add(drehteller);
  szene.add(wurzel);
  const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const modelle = new Map(); // id → gebautes Modell, bleibt bis zum Beenden
  let farbeJetzt = farbe;
  const farbeVon = new Map(); // id → Farbe, in der das Modell zuletzt gemalt wurde

  // Ein Modell bauen und (unsichtbar) in die Szene hängen
  async function baue(id) {
    // Farbe vorher festhalten: Wählt jemand während des Bauens eine andere, holt zeige() das nach
    const farbeBeimBau = farbeJetzt;
    const k = await baueKiesel(bauplan(id), { farbe: farbeBeimBau, maxAniso });
    if (beendet) { k.dispose(); return null; }
    aufraeumen.push(() => k.dispose());
    farbeVon.set(id, farbeBeimBau);
    // Boden knapp unter der tiefsten Ecke des geneigten Handys
    const { H, W } = k.masse, neig = MathUtils.degToRad(neigungGrad);
    k.boden.position.set(0, -(H / 2 * Math.cos(neig) + W / 2 * Math.sin(neig)) - 3, 0);
    // Shader vorab übersetzen (compileAsync überspringt Unsichtbares, darum vor dem Verstecken).
    // Beim zweiten Modell sind es dieselben Materialarten: meist schon fertig im Zwischenspeicher.
    if (kamera) {
      await renderer.compileAsync(k.handy, kamera, szene);
      if (beendet) return null;
    }
    k.handy.visible = k.boden.visible = false;
    neigung.add(k.handy);
    wurzel.add(k.boden);
    modelle.set(id, k);
    leinwand.dataset.gebaut = [...modelle.keys()].join(' '); // zum Nachschauen (Tests)
    return k;
  }
  function zeige(id) {
    for (const [i, k] of modelle) k.handy.visible = k.boden.visible = i === id;
    if (farbeVon.get(id) !== farbeJetzt) { modelle.get(id).setzeFarbe(farbeJetzt); farbeVon.set(id, farbeJetzt); }
    leinwand.dataset.modell = id;
  }

  let kamera = null;
  await luftholen();
  if (beendet) return null;
  if (!(await baue(modell))) return null;
  let aktiv = modell;
  zeige(aktiv);

  // ── Kamera ───────────────────────────────────────────────────────────────
  // fov 30°: eher Teleobjektiv, wie Produktfotos (wenig Verzerrung). Abstand so, dass der
  // grösste Kiesel (Pro) etwa 65 % der Bühnenhöhe füllt. Der Abstand ändert sich beim
  // Modellwechsel nicht: echter Massstab.
  kamera = new PerspectiveCamera(30, 1, 50, 2000);
  const abstand = (ABSTAND_NACH_H / 0.65) / (2 * Math.tan(MathUtils.degToRad(15)));
  const ziel3d = new Vector3(0, -4, 0);
  const startPos = new Vector3().setFromSphericalCoords(abstand, MathUtils.degToRad(gerade ? 90 : BLICK_VON_OBEN), 0).add(ziel3d);
  kamera.position.copy(startPos);
  kamera.lookAt(ziel3d);
  kamera.updateMatrixWorld();
  const steuerkamera = kamera.clone();

  // ── Steuerung ────────────────────────────────────────────────────────────
  const steuerung = new OrbitControls(steuerkamera, leinwand);
  steuerung.target.copy(ziel3d);
  steuerung.enableZoom = false;
  steuerung.enablePan = false;
  steuerung.enableDamping = true;      // sanftes Auslaufen nach dem Loslassen
  steuerung.dampingFactor = 0.08;
  steuerung.rotateSpeed = 0.8;
  steuerung.minPolarAngle = MathUtils.degToRad(50); // nicht kopfüber drehen
  steuerung.maxPolarAngle = MathUtils.degToRad(135); // weit genug, um die Unterkante zu sehen
  steuerung.autoRotate = !gerade;
  steuerung.autoRotateSpeed = 60 / SEKUNDEN_PRO_RUNDE; // 1 = eine Runde pro Minute
  steuerung.update();
  aufraeumen.push(() => steuerung.dispose());
  // OrbitControls sperrt sonst jedes Wischen auf der Leinwand. pan-y heisst: senkrecht
  // wischen scrollt die Seite (der Browser übernimmt), waagrecht wischen dreht das Handy.
  leinwand.style.touchAction = 'pan-y';

  let pause = 0;
  steuerung.addEventListener('start', () => {
    steuerung.autoRotate = false;
    clearTimeout(pause);
  });
  steuerung.addEventListener('end', () => {
    clearTimeout(pause);
    pause = setTimeout(() => { steuerung.autoRotate = !gerade; wecken(); }, PAUSE_NACH_ANFASSEN);
  });
  aufraeumen.push(() => clearTimeout(pause));
  steuerung.addEventListener('change', () => wecken());

  // Tastatur: Pfeil links/rechts drehen um 15°, hoch/runter kippen
  leinwand.addEventListener('keydown', (e) => {
    const schritt = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (!schritt) return;
    e.preventDefault();
    const versatz = steuerkamera.position.clone().sub(steuerung.target);
    const r = versatz.length();
    const theta = Math.atan2(versatz.x, versatz.z) + MathUtils.degToRad(schritt[0]);
    let phi = Math.acos(MathUtils.clamp(versatz.y / r, -1, 1)) + MathUtils.degToRad(schritt[1]);
    phi = MathUtils.clamp(phi, steuerung.minPolarAngle, steuerung.maxPolarAngle);
    steuerkamera.position.setFromSphericalCoords(r, phi, theta).add(steuerung.target);
    steuerung.autoRotate = false;
    clearTimeout(pause);
    pause = setTimeout(() => { steuerung.autoRotate = true; wecken(); }, PAUSE_NACH_ANFASSEN);
    wecken();
  });

  // ── Grösse ───────────────────────────────────────────────────────────────
  let neuZeichnen = true;
  function anpassen() {
    const b = ziel.clientWidth, h = ziel.clientHeight;
    if (!b || !h) return;
    renderer.setSize(b, h, false); // false: CSS-Grösse nicht anfassen (100 % per CSS)
    kamera.aspect = steuerkamera.aspect = b / h;
    // Bildausschnitt verschieben statt Kamera bewegen: gleiche Perspektive, gleiche Grösse
    kamera.setViewOffset(b, h, 0, -Math.round(freiOben() / 2), b, h);
    kamera.updateProjectionMatrix();
    steuerkamera.updateProjectionMatrix();
    neuZeichnen = true;
    wecken();
  }
  const groesse = new ResizeObserver(anpassen);
  groesse.observe(ziel);
  aufraeumen.push(() => groesse.disconnect());

  // ── Nur zeichnen, wenn man es sieht ─────────────────────────────────────
  let sichtbar = true;
  const beobachter = new IntersectionObserver(([e]) => {
    sichtbar = e.isIntersecting;
    if (sichtbar) wecken(); else schlafen();
  });
  beobachter.observe(ziel);
  aufraeumen.push(() => beobachter.disconnect());
  const tabWechsel = () => (document.hidden ? schlafen() : wecken());
  document.addEventListener('visibilitychange', tabWechsel);
  aufraeumen.push(() => document.removeEventListener('visibilitychange', tabWechsel));

  // ── Zeichenschleife ─────────────────────────────────────────────────────
  // Gerendert wird nur, wenn sich etwas bewegt (automatische Drehung, Finger, Auslaufen)
  // oder etwas neu ist (Farbe, Grösse). Steht alles still, schläft die Schleife ganz.
  let bilder = 0;
  let rafId = 0, letzte = 0; // letzte = Zeit des letzten Bilds, 0 = Schleife schläft
  let amBauen = false;        // zweites Modell entsteht gerade: Schleife bleibt still
  const drehung = new Matrix4();
  function wecken() {
    if (!rafId && !beendet && !amBauen && sichtbar && !document.hidden) rafId = requestAnimationFrame(bild);
  }
  function schlafen() {
    cancelAnimationFrame(rafId);
    rafId = 0;
    letzte = 0; // die Pause zählt nicht als langsames Bild
  }
  function bild(jetzt) {
    rafId = 0;
    // Höchstens 60 Bilder pro Sekunde, auch auf 120-Hz-Bildschirmen (halbe Arbeit)
    if (letzte && jetzt - letzte < 1000 / MAX_FPS - 4) { rafId = requestAnimationFrame(bild); return; }
    const dauer = letzte ? jetzt - letzte : 0; // 0 = erstes Bild nach einer Pause
    const bewegt = steuerung.update(dauer ? Math.min(0.1, dauer / 1000) : 1 / MAX_FPS);
    if (uebergang) wechselSchritt(jetzt);
    if (bewegt || neuZeichnen) {
      // Drehteller = feste Kamera × Kehrwert der Steuerkamera (siehe oben)
      steuerkamera.updateMatrixWorld();
      drehung.multiplyMatrices(kamera.matrixWorld, steuerkamera.matrixWorldInverse);
      drehteller.matrix.copy(drehung);
      drehteller.matrixWorldNeedsUpdate = true;
      renderer.render(szene, kamera);
      neuZeichnen = false;
      leinwand.dataset.bilder = ++bilder; // zum Nachschauen: läuft die Schleife noch?
      if (dauer) waechter(dauer);
    }
    if (steuerung.autoRotate || bewegt || uebergang) {
      letzte = jetzt;
      wecken();
      if (!rafId) letzte = 0; // wecken() hat abgelehnt (unsichtbar): Schleife schläft
    } else {
      letzte = 0;
    }
  }

  // ── Wächter ──────────────────────────────────────────────────────────────
  // Die Kernzahl war nur eine Schätzung. Hier messen wir echt, und zwar schnell: Ein
  // überfordertes Gerät soll nicht lange heiss laufen. Mit Grafikkarte braucht dieses
  // Modell nur wenige Millisekunden pro Bild, die Grenzen lassen also viel Luft.
  // Die Regeln (Aufwärmen, Median über 40 ms, Notbremse) stehen in waechter.js.
  // Gezählt werden nur Bilder, die direkt aufeinander folgen (Schleife lief durch).
  const pruefung = neuerWaechter();
  function waechter(dauer) {
    if (!mitWaechter) return;
    const urteil = pruefung.bild(dauer);
    if (pruefung.median !== null) leinwand.dataset.msProBild = pruefung.median.toFixed(1);
    if (urteil) abbrechen(urteil);
  }

  // ── Modellwechsel ───────────────────────────────────────────────────────
  // uebergang = { start, von, bild }: start = Zeit des ersten Bilds (aus requestAnimationFrame,
  // nicht performance.now(): so stimmt es auch mit den künstlichen Bildzeiten der Tests),
  // von = Anfangsgrösse relativ zur echten, bild = Schnappschuss des alten Modells.
  let uebergang = null;
  const WENIGER_BEWEGUNG = matchMedia('(prefers-reduced-motion: reduce)');
  function wechselSchritt(jetzt) {
    uebergang.start ??= jetzt;
    const t = Math.min(1, (jetzt - uebergang.start) / WECHSEL_MS);
    const weich = 1 - (1 - t) ** 3; // schnell los, sanft ankommen
    wurzel.scale.setScalar(uebergang.von + (1 - uebergang.von) * weich);
    uebergang.bild.style.opacity = String(Math.max(0, 1 - t / 0.6)); // Überblenden in den ersten 60 %
    neuZeichnen = true;
    if (t >= 1) wechselEnde();
  }
  function wechselEnde() {
    if (!uebergang) return;
    uebergang.bild.remove();
    uebergang = null;
    wurzel.scale.setScalar(1);
    neuZeichnen = true;
  }
  aufraeumen.push(wechselEnde);
  // Das Bild, das gerade zu sehen ist, als 2D-Leinwand über die 3D-Leinwand legen.
  // render() und drawImage() im selben Durchgang: Danach verwirft WebGL den Bildpuffer.
  function schnappschuss() {
    renderer.render(szene, kamera);
    const bild = document.createElement('canvas');
    bild.width = leinwand.width;
    bild.height = leinwand.height;
    bild.className = 'leinwand-3d-bild';
    bild.setAttribute('aria-hidden', 'true');
    bild.getContext('2d').drawImage(leinwand, 0, 0);
    leinwand.after(bild);
    return bild;
  }
  function wechsle(id) {
    const alt = modelle.get(aktiv), neu = modelle.get(id);
    const sanft = !WENIGER_BEWEGUNG.matches;
    // Mitten in einem Wechsel: von der Grösse aus weiter, die gerade zu sehen ist
    const jetzigeGroesse = wurzel.scale.x;
    wechselEnde();
    const bild = sanft ? schnappschuss() : null;
    zeige(id);
    aktiv = id;
    if (sanft) {
      uebergang = { start: null, von: (jetzigeGroesse * alt.masse.H) / neu.masse.H, bild };
      wurzel.scale.setScalar(uebergang.von);
    }
    neuZeichnen = true;
    wecken();
  }
  // Wünsche, die während des Bauens kommen (schnell hin und her klicken), zählen: Am Ende
  // gilt der letzte. Beim Bauen schläft die Schleife, sonst würde das eine lange Bild den
  // Wächter auslösen (es sagt nichts über die Grafikkarte aus).
  let wunsch = modell;
  async function setzeModell(id) {
    if (!KIESEL_IDS.includes(id)) return;
    wunsch = id;
    if (amBauen) return;
    while (wunsch !== aktiv && !beendet) {
      const ziel = wunsch;
      if (!modelle.has(ziel)) {
        amBauen = true;
        schlafen();
        try {
          await luftholen();
          if (!beendet) await baue(ziel);
        } finally {
          amBauen = false;
        }
        if (beendet) return;
      }
      wechsle(ziel);
    }
  }

  // ── Los ──────────────────────────────────────────────────────────────────
  ziel.appendChild(leinwand);
  anpassen();
  // Shader vorab übersetzen, ohne die Seite zu blockieren (sonst ruckelt das erste Bild)
  await renderer.compileAsync(szene, kamera);
  await luftholen();
  if (beendet) return null;
  drehteller.matrix.identity();
  renderer.render(szene, kamera);
  wecken();

  return {
    leinwand,
    // Nur das sichtbare Modell wird umgemalt, das andere beim nächsten Zeigen (zeige())
    setzeFarbe(neu) {
      farbeJetzt = neu;
      if (farbeVon.get(aktiv) !== neu) { modelle.get(aktiv).setzeFarbe(neu); farbeVon.set(aktiv, neu); }
      neuZeichnen = true;
      wecken();
    },
    setzeModell,
    setzeLabel(text) { leinwand.setAttribute('aria-label', text); },
    beenden(grund = 'beendet') { abbrechen(grund); },
  };
}
