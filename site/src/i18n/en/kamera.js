// English texts, part “kamera”: camera demos, hidden details, flower presets (browser: zoom
// images, macro)
// Rules: see src/i18n/en.js.

// ── Camera demos: zoom image, scale, lens bar, comparison, hidden details, macro
//    (data/kamera.js, lib/kamera.js, scripts/kamera-zoom.js, also in the browser) ──
export const kamera = {
  zoom: 'Zoom',
  zoomstufen: 'Zoom levels',
  welcheKamera: 'Which camera is at work',
  stufe: (z) => `${z}x`,
  stufeTele: (z) => `${z}x · Tele`,
  // lens label on the image: “Main camera · 1x optical”, “Tele · 6x digital”
  linse: { haupt: 'Main camera', tele: 'Tele' },
  linseLang: { haupt: 'Main camera', tele: 'Telephoto lens' },
  linsenText: (linse, stufe) => `${linse} · ${stufe}`,
  stufenText: (stufe, optisch) => `${stufe} ${optisch ? 'optical' : 'digital'}`,
  maximal: (z) => `up to ${z}x`,
  schaerfe: { scharf: 'sharp', leicht: 'slightly soft', unscharf: 'blurry' },
  bild: (zoom, linse, schaerfe) => `Alpine panorama at ${zoom}x, ${linse}, ${schaerfe}`,
  fach: (zoom) => `${zoom}x`,
  ansage: (zoom, linse) => `${zoom}x, ${linse}`,
  wechselTele: (z) => `Switching to the telephoto lens, ${z}x optical`,
  wechselHaupt: 'Switching back to the main camera',
  leiste: {
    bereich: (von, bis) => `${von}x to ${bis}x`,
    ab: (z) => `from ${z}x`,
    haupt: 'Main camera, optical',
    ausschnitt: (mp) => `Cropped from ${mp} MP`,
    tele: 'Telephoto lens, then cropped',
  },
  // zoom comparison (Pro page)
  vergleich: {
    k1: (stufe) => `Kiesel 1 · ${stufe}`,
    pro: (stufe) => `Kiesel 1 Pro · ${stufe}`,
    proKurz: (tele, stufe) => `Pro · ${tele ? 'Tele · ' : ''}${stufe}`,
    bildAllein: (zoom, pro) => `Alpine panorama at ${zoom}x: Kiesel 1 Pro, ${pro}`,
    bild: (zoom, k1, pro) => `Alpine panorama at ${zoom}x: Kiesel 1 on the left, ${k1}; Kiesel 1 Pro on the right, ${pro}`,
    linseSchaerfe: (linse, schaerfe) => `${linse}, ${schaerfe}`,
    aktiveLinse: 'Active lens',
    trennlinie: 'Divider: Kiesel 1 on the left, Kiesel 1 Pro on the right',
    mitte: 'Center',
    anteil: (links, rechts) => `${links} Kiesel 1, ${rechts} Kiesel 1 Pro`,
    schalter: 'Compare with Kiesel 1',
  },
  // hidden details (/features/ only)
  details: {
    liste: 'Hidden details',
    versteckt: 'Still hidden',
    verstecktLabel: (nr, alle) => `Still hidden, detail ${nr} of ${alle}: zoom in`,
    hinzoomen: (name) => `${name}: zoom in`,
    zaehler: (n, alle) => (n === alle ? `All ${alle} found` : `${n} of ${alle} found`),
    entdeckt: (name) => `${name} found`,
    gefunden: (name, n, alle) => `${name} found. ${n} of ${alle}.`,
    angeflogen: (name, zoom) => `${name}, ${zoom}x`,
    fliegeZu: (name) => `Fly to: ${name}`,
  },
  // macro demo (“Get up close.”): knopf = button label, chip = label on the image
  makro: {
    linsen: {
      weit: { knopf: 'Macro', chip: 'Ultra wide, approx. 3 cm' },
      tele: { knopf: '3x Tele', chip: '3x Tele, approx. 25 cm' },
      normal: { knopf: '1x', chip: '1x, approx. 20 cm' },
    },
    erklaerung: {
      pro: 'The flower is the same size with both lenses, the background isn’t: with the telephoto, you stand farther back, so the meadow is relatively closer to the flower. That’s why it looks bigger and seems to move in. The long focal length also makes it much softer.',
      k1: 'At 1x, you see the whole flower in the meadow. In macro, the ultra-wide setting takes you as close as 3 cm: the blossom fills the frame, and the background stays small but recognizable.',
    },
    bild: 'Flower with a bee in a meadow. Tap the image to set the focus.',
    linse: 'Lens',
    scharfStellen: 'Focus on',
    scharf: 'Focus:',
    ebenen: { fg: 'Grass', bee: 'Bee', fl: 'Flower', bg: 'Meadow' },
  },
};

// ── The eight hidden details in the Alpine panorama (keys in kiesel-draw/ausschnitt.js) ──
export const panoramaDetails = {
  'summit-cross': 'Summit cross',
  'rope-team': 'Rope team on the ridge',
  ibex: 'Ibex',
  'mountain-hut': 'Mountain hut with flag',
  gondola: 'Gondola',
  paraglider: 'Paraglider',
  sailboat: 'Sailboat',
  village: 'Village with church',
};

// ── Flower presets (playground, keys in kiesel-draw/scene.js BLUME_FOKUS) ──
export const blumeFokus = {
  tele: 'Flower (3x Tele)',
  bee: 'Bee',
  macro: 'Macro (all close)',
  all: 'All in focus',
};
