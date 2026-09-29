// English texts, part “modelle”: home page, models, model pages, tech specs (mostly build time;
// buehne3d also in the browser on the home page)
// Rules: see src/i18n/en.js.

// ── Home page ──
export const startseite = {
  titel: 'Fits every hand.',
  einleitung: 'Kiesel 1 and Kiesel 1 Pro: two compact phones, built around a battery that lasts well into the night.',
  einleitungKurz: 'Kiesel 1 and Kiesel 1 Pro: two compact phones with a battery that lasts into the night.',
  entdecken: (name) => `Explore ${name}`,
  modelleTitel: 'Which Kiesel fits you?',
  modelleText: 'Both shown to scale. Same colors, same chip. The Pro gets a bigger screen, a bigger battery and a telephoto camera.',
  kennzahlen: 'Key specs',
  funktionenTitel: 'Small ideas, big difference.',
  fragenTitel: 'Frequently asked questions',
  karte: {
    bild: (name, farbe) => `${name} in ${farbe}, front`,
    ueber: (name) => ` about ${name}`, // screen readers only, after “Learn more”
  },
  zoom: {
    titel: 'Zoom that goes the distance.',
    text: 'At 3x, the Pro switches to a real telephoto lens. Even at 10x, you can still make out the summit cross. Eight details are hidden in the panorama: go find them on the Features page.',
    textKurz: 'At 3x, the Pro switches to its telephoto lens. Eight hidden details are waiting in the panorama on the Features page.',
    knopf: 'Try the zoom',
    leiste: 'Zoom level of the sample image',
  },
  kacheln: {
    rgb: { titel: 'RGB light', text: 'The flash next to the camera glows in color for calls, messages and charging. The display stays dark.' },
    zen: { titel: 'Zen Mode', text: 'One quick press of the Action button and your phone goes quiet. Press it again and everything’s back.' },
    privacy: { titel: 'Privacy Mode', text: 'Two levels, both in hardware: first camera, microphone and GPS, then Wi-Fi, Bluetooth, cellular and NFC too. No power means even a hacked app can’t record or send a thing.' },
    zenAn: 'Zen on',
    privacyZeilen: [['Sensors', 'Level 1'], ['Radios', 'Level 2']],
    getrennt: 'cut off',
    ausprobieren: 'Try it',
  },
  huelle: {
    bild: (handy, farbe, huelle) => `${handy} in ${farbe} with the Kiesel Case in ${huelle}, back`,
    titel: 'The Kiesel Case',
    text: 'Frosted on the back, so the color and the pebble logo shine through. Firm and grippy around the edges. In the same five colors as the phones, for both models.',
    zumZubehoer: 'See accessories',
  },
};

// ── Models: menu, model cards, model pages (data/modelle.js) ──
export const modelle = {
  laden: (kabel, kabellos) => `${kabel} W wired, ${kabellos} W wireless`,
  extras: (schutz) => `${schutz}, RGB flash, Zen Mode, Privacy Mode`,
  chip: (ram) => `A20 Pro, trimmed down, 1+3 cores, ${ram} GB RAM`,
  karte: { display: (zoll, hertz) => `${zoll} OLED, ${hertz}` },
  eckdatenDisplay: (zoll, hertz) => `${zoll} OLED, LTPO ${hertz}`,
  eckdaten: { display: 'Display', chip: 'Chip', kamera: 'Camera', kameras: 'Cameras', akku: 'Battery', masse: 'Dimensions', kuehlung: 'Cooling', speicher: 'Storage', extras: 'Extras' },
  kennzahlen: {
    display: 'OLED display',
    ltpo: (hertz) => `LTPO from ${hertz}`,
    mah: 'mAh',
    mehrAkku: (prozent, vorbild) => `${prozent}% more than the ${vorbild}`,
    ram: 'RAM',
    laden: (watt) => `${watt} W wired charging`,
    ladenKurz: (watt) => `${watt} W charging`,
  },
  k1: {
    kurz: 'SE size, all-day battery',
    karteUnter: 'The size of the 2016 iPhone SE.',
    karteKamera: (digital) => `One camera, 0.5x to 1x, digital up to ${digital}x`,
    unterzeile: 'The size of 2016. The battery of today.',
    kennzahlKamera: { titel: ['one camera', 'camera'], text: ['0.5x to 1x, with macro', '0.5x to 1x, macro'] },
    eckdatenKamera: (mp, digital) => `0.5x to 1x (${mp} MP), macro, digital up to ${digital}x`,
  },
  pro: {
    kurz: '13 mini size with 3x telephoto',
    karteUnter: 'The size of the iPhone 13 mini.',
    karteKamera: (tele) => `0.5x to 1x plus ${tele}x telephoto with OIS`,
    karteAkku: (akku) => `${akku}, mini vapor chamber`,
    unterzeile: 'Two cameras. One hand.',
    kennzahlTele: { titel: 'Telephoto, truly optical', text: (mp) => `${mp} MP, with image stabilization` },
    eckdatenKameras: (tele, mp) => `0.5x to 1x and ${tele}x telephoto with OIS, both ${mp} MP`,
  },
  // key specs on the home page
  startseite: {
    akku: { titel: 'mAh in Kiesel 1', text: 'almost twice as much as the SE' },
    tele: { titel: 'Telephoto, truly optical', text: 'on Kiesel 1 Pro' },
    dicke: { titel: 'thin enough', text: (mm) => `${mm} mm more than the SE, for a bigger battery`, kurz: 'for a bigger battery' },
    hertz: { titel: ['Hertz that think ahead', 'Hertz'], text: ['the display only runs as fast as it needs to', 'only as fast as needed'] },
  },
};

// ── Model pages /kiesel-1/ and /kiesel-1-pro/ ──
export const modellseite = {
  beschreibung: {
    k1: (akku) => `Kiesel 1: the size of the 2016 iPhone SE, with ${akku} to get you through the day. A fan concept.`,
    pro: (tele, akku) => `Kiesel 1 Pro: the size of the iPhone 13 mini, with a real ${tele}x telephoto and ${akku}. A fan concept.`,
  },
  bildHinten: (name, farbe) => `${name}, back in ${farbe}`,
  bildVorne: (name, farbe) => `${name}, front in ${farbe}`,
  bildFarbe: (name, farbe) => `${name} in ${farbe}, back`,
  // “from CHF 1,200 or <a>see all five colors</a>”
  preisOder: (preis) => `${preis} or `,
  farbenAnsehen: 'see all five colors',
  kamera: {
    pro: {
      titel: (tele) => `${tele}x telephoto. Truly optical.`,
      text: (k1Max, tele) => `On the left, Kiesel 1 at ${k1Max}x, purely digital. On the right, the Pro, which switches to its telephoto lens at ${tele}x and is still cropping from a sharp image at ${k1Max}x. Drag the slider and see for yourself.`,
    },
    k1: {
      titel: 'One camera. All in.',
      text: (mp, max) => `The variable lens glides seamlessly from 0.5x to 1x, always at the full ${mp} MP. Beyond that, Kiesel 1 zooms digitally up to ${max}x, and things get softer. Want a real telephoto? Go Pro.`,
    },
  },
  makro: {
    titel: 'Get up close.',
    pro: (cm) => `Two ways to get close: macro with the ultra-wide lens from just a few centimeters, or the telephoto lens, which can focus from around ${cm} cm. Switch lenses and watch the background. Tap the image to move the focus.`,
    k1: 'The main camera does macro: blossom, bee and dewdrops, all up close. Tap the image to move the focus.',
  },
  akkuVergleich: 'Battery compared',
  farbenTitel: 'Five colors.',
  fuenfFarben: 'The five colors',
  eckdatenTitel: 'The essentials at a glance',
  alleDaten: 'All tech specs',
  kaufen: (name) => `Buy ${name}`,
  kaufbox: (abPreis, speicher) => `${abPreis} in five colors, ${speicher}`,
  // battery summary
  fazitTitel: ['More battery.', 'Same hand.'],   // two lines
  rechnen: 'Run the numbers on your day',
  wasSteckt: (name) => `What’s inside ${name}`,
  mah: (ca, wert) => `${ca}${wert} mAh`,
};

// ── Tech specs (data/technik.js: table like SPEC in gen4.py) ──
export const technik = {
  hertz: (von, bis) => `${von} to ${bis} Hz`,
  gruppen: {
    design: 'Design and dimensions', display: 'Display', chip: 'Chip and storage', kameras: 'Cameras', video: 'Video',
    akku: 'Battery and charging', verbindungen: 'Connectivity', software: 'Software and features', preis: 'Price',
  },
  merkmale: {
    masse: 'Dimensions', gewicht: 'Weight', rahmen: 'Frame', farben: 'Colors', wasser: 'Water and dust',
    groesse: 'Size', bildrate: 'Refresh rate', entsperren: 'Unlocking',
    chip: 'Chip', cpu: 'CPU', gpu: 'GPU', ram: 'RAM', speicher: 'Storage', kuehlung: 'Cooling',
    hauptkamera: 'Main camera', tele: 'Telephoto', zoom: 'Zoom', nah: 'Close-ups', blitz: 'Flash',
    maximal: 'Maximum', zeitlupe: 'Slow motion',
    akku: 'Battery', kabel: 'Wired', kabellos: 'Wireless',
    anschluss: 'Port', sim: 'SIM', mobilfunk: 'Cellular',
    system: 'System', updates: 'Updates', tasten: 'Buttons', extras: 'Extras',
    ab: 'From', bis: 'Up to',
  },
  werte: {
    rahmen: 'Titanium, matte',
    display: (zoll) => `${zoll} OLED, edge to edge`,
    bildrate: (hertz) => `LTPO, ${hertz}`,
    entsperren: 'Face ID in the Dynamic Island',
    chip: (nm) => `A20 Pro, trimmed down, ${nm} nm`,
    cpu: (ghz) => `1 super core + 3 efficiency cores, up to ${ghz} GHz`,
    gpu: 'approx. 4 cores',
    ram: (gb) => `${gb} GB RAM`,
    kuehlung: { k1: 'passive, through the back', pro: 'mini vapor chamber plus the back' },
    hauptkamera: (mp, von, bis) => `${mp} MP, variable lens 0.5x to 1x (approx. ${von} to ${bis} mm)`,
    keine: '–',
    tele: (mp, x, mm) => `${mp} MP, ${x}x (approx. ${mm} mm), optical image stabilization`,
    zoomK1: (digital) => `digital up to ${digital}x`,
    zoomPro: (tele, digital) => `${tele}x optical, digital up to ${digital}x`,
    nahK1: 'Macro via 0.5x',
    nahPro: (cm) => `Macro via 0.5x, telephoto close focus from approx. ${cm} cm`,
    blitz: 'RGB LED with notifications',
    videoMaximal: (fps) => `4K at ${fps} fps`,
    zeitlupe: (fps) => `2K at ${fps} fps`,
    akku: (akku) => `${akku}, silicon-carbon`,
    kabel: (watt) => `approx. ${watt} W via USB-C`,
    kabellos: (watt) => `${watt} W via MagSafe and Qi`,
    anschluss: 'USB-C',
    sim: 'eSIM only',
    mobilfunk: '4G by default, 5G only under heavy data load',
    system: (system) => `${system} with a streamlined look`,
    updates: (jahre) => `at least ${jahre} years of system and security updates`,
    tasten: 'Action button, Camera button, volume, side button',
    extras: 'Zen Mode, Privacy Mode with a two-level hardware disconnect (Sensors Off, Radio Silence)',
    preisStufe: (preis, stufe) => `${preis} (${stufe})`,
  },
  // four key specs at the top of the tech specs page
  kennzahlen: {
    ram: { titel: 'RAM', text: 'in both models' },
    kamera: { titel: 'on every camera', text: 'including the Pro’s telephoto' },
    laden: { titel: 'wired', text: (kabellos) => `${kabellos} W wireless via MagSafe` },
    jahre: (n) => `${n} years`,
    updates: { titel: 'of updates', text: 'at least, for system and security' },
  },
};

// ── /kiesel-1/specs/ and /kiesel-1-pro/specs/ (TechnikSeite.astro) ──
export const technikSeite = {
  seitenTitel: (name) => `${name} · Tech Specs`,
  beschreibung: (name, anderes) => `All tech specs for ${name}, compared with ${anderes}. A fan concept, so all values are estimates.`,
  titel: 'Tech Specs',
  einleitung: (name, anderes) => `${name} and ${anderes} side by side. Anything that’s different on ${anderes} is marked in blue.`,
  nurUnterschiede: 'Show differences only',
  merkmal: 'Feature',
  anders: ' (different)',   // screen readers only, after the value
  keineUnterschiede: 'No differences in this view.',
  hinweis: 'All values are concept figures, and some are estimates. Kiesel is not a real product.',
};

// ── 3D stage on the home page (Buehne3D.astro, also in the browser) ──
export const buehne3d = {
  name: (modell, farbe) => `${modell} in ${farbe}`,
  bild2d: (name) => `${name}, back`,
  bild3d: (name) => `${name}, 3D model. Rotate with your mouse, finger or the arrow keys.`,
  farbeDes: (modell) => `${modell} color`,
  modellWaehlen: 'Choose a model',
  ziehen: 'Drag to rotate',
  drehen: 'Rotate',
};
