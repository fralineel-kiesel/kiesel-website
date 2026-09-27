// Die 3D-Bühne: Renderer, Licht, Steuerung, Zeichenschleife und Notausgänge.
//
// Wird NUR per import() geladen, wenn pruefen.js "ja" sagt. Vite legt diese Datei samt
// three.js dann in eine eigene JS-Datei, die ausser der Startseite niemand anfordert.
//
//   const b = await starte3D({ ziel, modell, farbe, label, beiAbbruch, waechter })
//   b.setzeFarbe('Mattschwarz')   b.beenden()
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
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, DirectionalLight, Group, Matrix4,
  NeutralToneMapping, MathUtils, Vector3,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { baueKiesel } from './modell.js';

const NEIGUNG = 10;           // Grad, das Handy lehnt leicht nach links (wie drehung -10 in 2D)
const BLICK_VON_OBEN = 84;    // Grad von der Senkrechten: 90 = genau von vorne, kleiner = von oben
const SEKUNDEN_PRO_RUNDE = 40;
const PAUSE_NACH_ANFASSEN = 6000; // ms, danach dreht es sich wieder von selbst
const MAX_FPS = 60;
const ZU_LANGSAM_MS = 40;     // typische Zeit pro Bild, ab der wir auf 2D wechseln (= unter 25 fps)
const NOTBREMSE_MS = 100;     // so lange Bilder, 3 × hintereinander: sofort 2D

// Hauptthread kurz freigeben, damit Klicks und Scrollen zwischendurch drankommen.
// Sonst wäre der ganze Start (Modell bauen, Licht vorberechnen, Shader übersetzen) eine
// einzige lange Aufgabe, während der die Seite nicht reagiert.
const luftholen = () => new Promise((r) => setTimeout(r, 0));

export async function starte3D({ ziel, modell = 'pro', farbe = 'Himmelblau', label = '', beiAbbruch = () => {}, waechter: mitWaechter = true }) {
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
  await luftholen();
  if (beendet) return null;
  const kiesel = await baueKiesel({ modell, farbe, maxAniso: Math.min(4, renderer.capabilities.getMaxAnisotropy()) });
  aufraeumen.push(() => kiesel.dispose());
  if (beendet) return null;
  const { H, W } = kiesel.masse;
  // drehteller (Drehung aus der Steuerkamera) → neigung (lehnt nach links) → Handy
  const neigung = new Group();
  neigung.rotation.z = MathUtils.degToRad(NEIGUNG);
  neigung.add(kiesel.handy);
  const drehteller = new Group();
  drehteller.matrixAutoUpdate = false;
  drehteller.add(neigung);
  szene.add(drehteller);
  // Boden knapp unter der tiefsten Ecke des geneigten Handys
  const neig = MathUtils.degToRad(NEIGUNG);
  kiesel.boden.position.set(0, -(H / 2 * Math.cos(neig) + W / 2 * Math.sin(neig)) - 3, 0);
  szene.add(kiesel.boden);

  // ── Kamera ───────────────────────────────────────────────────────────────
  // fov 30°: eher Teleobjektiv, wie Produktfotos (wenig Verzerrung). Abstand so, dass das
  // Handy etwa 65 % der Bühnenhöhe füllt.
  const kamera = new PerspectiveCamera(30, 1, 50, 2000);
  const abstand = (H / 0.65) / (2 * Math.tan(MathUtils.degToRad(15)));
  const ziel3d = new Vector3(0, -4, 0);
  const startPos = new Vector3().setFromSphericalCoords(abstand, MathUtils.degToRad(BLICK_VON_OBEN), 0).add(ziel3d);
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
  steuerung.maxPolarAngle = MathUtils.degToRad(120);
  steuerung.autoRotate = true;
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
    pause = setTimeout(() => { steuerung.autoRotate = true; wecken(); }, PAUSE_NACH_ANFASSEN);
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
  const drehung = new Matrix4();
  function wecken() {
    if (!rafId && !beendet && sichtbar && !document.hidden) rafId = requestAnimationFrame(bild);
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
    if (steuerung.autoRotate || bewegt) {
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
  //   Bilder 1–3:  Aufwärmen, zählen nicht (Texturen werden hochgeladen)
  //   Bilder 4–15: Liegt der Median über 40 ms (unter 25 fps) → 2D.
  //                Median = die mittlere Dauer, wenn man alle der Grösse nach ordnet. Ein
  //                einzelner Hänger (z.B. Speicherbereinigung) verschiebt ihn kaum.
  //   Notbremse:   3 Bilder hintereinander über 100 ms → sofort 2D.
  // Gezählt werden nur Bilder, die direkt aufeinander folgen (Schleife lief durch).
  const zeiten = [];
  let gezaehlt = 0, zaeh = 0;
  function waechter(dauer) {
    if (!mitWaechter || gezaehlt >= 15) return;
    gezaehlt++;
    if (gezaehlt <= 3) return;
    zeiten.push(dauer);
    zaeh = dauer > NOTBREMSE_MS ? zaeh + 1 : 0;
    if (zaeh >= 3) { abbrechen('zu-langsam'); return; }
    if (gezaehlt === 15) {
      const median = zeiten.sort((x, y) => x - y)[Math.floor(zeiten.length / 2)];
      leinwand.dataset.msProBild = median.toFixed(1);
      if (median > ZU_LANGSAM_MS) abbrechen('zu-langsam');
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
    setzeFarbe(neu) {
      kiesel.setzeFarbe(neu);
      neuZeichnen = true;
      wecken();
    },
    setzeLabel(text) { leinwand.setAttribute('aria-label', text); },
    beenden(grund = 'beendet') { abbrechen(grund); },
  };
}
