// Deutsche Texte, Teil „kamera“: Kamera-Demos, versteckte Details, Blumen-Vorgaben (Browser: Zoom-Bilder, Makro)
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── Kamera-Demos: Zoom-Bild, Skala, Linsen-Leiste, Vergleich, versteckte Details, Makro
//    (data/kamera.js, lib/kamera.js, scripts/kamera-zoom.js, auch im Browser) ──
export const kamera = {
  zoom: 'Zoom',
  zoomstufen: 'Zoomstufen',
  welcheKamera: 'Welche Kamera arbeitet',
  stufe: (z) => `${z}x`,
  stufeTele: (z) => `${z}x · Tele`,
  // Linsen-Label auf dem Bild: „Hauptkamera · 1x optisch“, „Tele · 6x digital“
  linse: { haupt: 'Hauptkamera', tele: 'Tele' },
  linseLang: { haupt: 'Hauptkamera', tele: 'Tele-Linse' },
  linsenText: (linse, stufe) => `${linse} · ${stufe}`,
  stufenText: (stufe, optisch) => `${stufe} ${optisch ? 'optisch' : 'digital'}`,
  maximal: (z) => `max. ${z}x`,
  schaerfe: { scharf: 'scharf', leicht: 'leicht weich', unscharf: 'unscharf' },
  bild: (zoom, linse, schaerfe) => `Alpenpanorama bei ${zoom}x, ${linse}, ${schaerfe}`,
  fach: (zoom) => `${zoom}-fach`,
  ansage: (zoom, linse) => `${zoom}-fach, ${linse}`,
  wechselTele: (z) => `Wechsel auf die Tele-Linse, ${z}-fach optisch`,
  wechselHaupt: 'Wechsel zurück auf die Hauptkamera',
  leiste: {
    bereich: (von, bis) => `${von}x bis ${bis}x`,
    ab: (z) => `ab ${z}x`,
    haupt: 'Hauptkamera, optisch',
    ausschnitt: 'Ausschnitt aus 50 MP',
    tele: 'Tele-Linse, danach Ausschnitt',
  },
  // Zoom-Vergleich (Pro-Seite)
  vergleich: {
    k1: (stufe) => `Kiesel 1 · ${stufe}`,
    pro: (stufe) => `Kiesel 1 Pro · ${stufe}`,
    proKurz: (tele, stufe) => `Pro · ${tele ? 'Tele · ' : ''}${stufe}`,
    bildAllein: (zoom, pro) => `Alpenpanorama bei ${zoom}x: Kiesel 1 Pro, ${pro}`,
    bild: (zoom, k1, pro) => `Alpenpanorama bei ${zoom}x: links Kiesel 1, ${k1}; rechts Kiesel 1 Pro, ${pro}`,
    linseSchaerfe: (linse, schaerfe) => `${linse}, ${schaerfe}`,
    aktiveLinse: 'Aktive Linse',
    trennlinie: 'Trennlinie: links Kiesel 1, rechts Kiesel 1 Pro',
    mitte: 'Mitte',
    anteil: (links, rechts) => `${links} Kiesel 1, ${rechts} Kiesel 1 Pro`,
    schalter: 'Mit Kiesel 1 vergleichen',
  },
  // Versteckte Details (nur /funktionen/)
  details: {
    liste: 'Versteckte Details',
    versteckt: 'Noch versteckt',
    verstecktLabel: (nr, alle) => `Noch versteckt, Detail ${nr} von ${alle}: hinzoomen`,
    hinzoomen: (name) => `${name}: hinzoomen`,
    zaehler: (n, alle) => (n === alle ? `Alle ${alle} entdeckt` : `${n} von ${alle} entdeckt`),
    entdeckt: (name) => `${name} entdeckt`,
    gefunden: (name, n, alle) => `${name} entdeckt. ${n} von ${alle}.`,
    angeflogen: (name, zoom) => `${name}, ${zoom}-fach`,
    fliegeZu: (name) => `Fliege zu: ${name}`,
  },
  // Makro-Demo („Ganz nah dran.“): knopf = Beschriftung des Knopfs, chip = Label auf dem Bild
  makro: {
    linsen: {
      weit: { knopf: 'Makro', chip: 'Ultraweit, ca. 3 cm' },
      tele: { knopf: '3x Tele', chip: '3x Tele, ca. 25 cm' },
      normal: { knopf: '1x', chip: '1x, ca. 20 cm' },
    },
    erklaerung: {
      pro: 'Die Blume ist in beiden Linsen gleich gross, der Hintergrund nicht: Mit der Tele stehst du weiter weg, die Wiese ist im Verhältnis näher an der Blume. Darum wirkt sie grösser und rückt scheinbar heran. Die lange Brennweite macht sie dazu viel weicher.',
      k1: 'Mit 1x siehst du die ganze Blume in der Wiese. Im Makro gehst du mit der Ultraweit-Einstellung bis 3 cm heran: Die Blüte füllt das Bild, der Hintergrund bleibt klein und erkennbar.',
    },
    bild: 'Blume mit Biene und Wiese. Tippe aufs Bild, um den Fokus zu setzen.',
    linse: 'Linse',
    scharfStellen: 'Scharf stellen auf',
    scharf: 'Scharf:',
    ebenen: { fg: 'Gras', bee: 'Biene', fl: 'Blume', bg: 'Wiese' },
  },
};

// ── Die acht versteckten Details im Alpenpanorama (Kennungen in kiesel-draw/ausschnitt.js) ──
export const panoramaDetails = {
  'summit-cross': 'Gipfelkreuz',
  'rope-team': 'Seilschaft auf dem Grat',
  ibex: 'Steinbock',
  'mountain-hut': 'SAC-Hütte mit Fahne',
  gondola: 'Gondelbahn',
  paraglider: 'Gleitschirm',
  sailboat: 'Segelboot',
  village: 'Dorf mit Kirche',
};

// ── Vorgaben der Blume (Spielwiese, Kennungen in kiesel-draw/scene.js BLUME_FOKUS) ──
export const blumeFokus = {
  tele: 'Blume (3x Tele)',
  bee: 'Biene',
  macro: 'Makro (alles nah)',
  all: 'Alles scharf',
};
