// English texts, part “funktionen”: /features/: header, RGB light, Zen Mode, Privacy Mode
// (browser: one script each)
// Rules: see src/i18n/en.js.

// ── /features/: header and camera section ──
export const funktionen = {
  seitenTitel: 'Features',
  beschreibung: 'RGB light, Zen Mode, Privacy Mode and eight details hidden in the camera zoom: all of it ready to try.',
  titel: 'Features',
  einleitung: 'Four things you won’t find on any current iPhone. All of them ready to try.',
  anker: { rgb: 'RGB light', zen: 'Zen Mode', privacy: 'Privacy Mode', kamera: 'Explore the camera' },
  sprungmarken: 'On this page',
  kamera: {
    titel: 'Find the summit cross.',
    text: 'Eight details are hidden in the panorama, and they only show up when you zoom in. At 3x, the Pro switches to its telephoto lens. You’ll spot it by the quick jump in sharpness.',
  },
};

// ── RGB light (RgbLicht.astro, also in the browser). stufe: Privacy only, shown on the stage
//    with “reduce motion” ──
export const rgb = {
  titel: 'A dot that keeps you posted.',
  text: 'The flash LED next to the camera is RGB. Even when your phone is lying face down, you can see what’s going on without waking the display.',
  ereignisse: {
    call: { name: 'Call', titel: 'Call: fast blue pulse', text: 'So you notice, even when your phone is lying face down on the table.' },
    msg: { name: 'Message', titel: 'Message: two short purple blinks', text: 'Then a pause. It repeats until you check.' },
    charge: { name: 'Charging', titel: 'Charging: slow green breathing', text: 'The dot brightens and dims about every two seconds.' },
    full: { name: 'Fully charged', titel: 'Fully charged: steady green', text: 'No more pulsing, just a calm green.' },
    low: { name: 'Low battery', titel: 'Battery below 10%: slow red pulse', text: 'Time for an outlet or the MagSafe puck.' },
    privacy: { name: 'Privacy', stufe: 'Level 1: Sensors Off', titel: 'Privacy Mode: steady orange', text: 'Level 1, Sensors Off: camera, microphone and GPS have no power. The dot stays lit until you end the mode.' },
    funkstille: { name: 'Radio Silence', stufe: 'Level 2: Radio Silence', titel: 'Radio Silence: orange, short blink', text: 'Level 2 of Privacy Mode: Wi-Fi, Bluetooth, cellular and NFC lose power too. A short blink every three seconds tells it apart from Level 1.' },
    flash: { name: 'Photo flash', titel: 'Photo flash: neutral white', text: 'All three colors at full power. The color temperature adapts to the light around you.' },
    off: { name: 'Off', titel: 'Off', text: 'The dot is just a regular flash and blends right in.' },
  },
  bild: (name) => `Kiesel 1 Pro from the back, RGB light: ${name}`,
  ereignis: 'Choose an event',
};

// ── Zen Mode (ZenModus.astro, also in the browser) ──
export const zen = {
  titel: 'Zen Mode',
  text: 'One quick press of the Action button and your phone goes quiet. Press it again and everything’s back.',
  schalter: ['Turn on Zen Mode', 'Turn off Zen Mode'],
  stillTitel: 'Goes quiet:',
  still: ['Calls', 'Notifications', 'Vibration', 'RGB light'],
  hinweis: 'Pure software, so it doesn’t take up a single millimeter. Hold the Action button instead of pressing it, and you start Privacy Mode: 2 s for Sensors Off, 4 s for Radio Silence.',
  pille: 'Zen Mode',   // pill on the lock screen (drawing)
  bild: {
    aus: 'Kiesel 1 Pro, lock screen with three notifications',
    an: 'Kiesel 1 Pro, lock screen in Zen Mode, no notifications',
  },
  ansage: {
    an: 'Zen Mode on. The three notifications will wait until you turn it off.',
    aus: 'Zen Mode off. Your notifications are back.',
  },
};

// ── Privacy Mode in two levels (PrivacyModus.astro, lib/privacy.js, also in the browser),
//    translated from gen5.py ──
export const privacy = {
  titel: 'Privacy Mode',
  text: 'Two levels, both in hardware. Components without power can’t record or send anything, even if an app tries. In Radio Silence, your phone is also invisible to the cellular network.',
  // components (keys in data/funktionen.js PRIVACY_TEILE)
  teile: { camera: 'Camera', mic: 'Microphone', gps: 'GPS', wifi: 'Wi-Fi and Bluetooth', cellular: 'Cellular', nfc: 'NFC' },
  gruppen: ['Level 1: Sensors', 'Level 2: Radios'],
  plakette: ['on', 'off'],
  status: { verbunden: 'connected', getrennt: 'cut off', notruf: 'on for emergency call' },
  platine: ['all connected', 'keeps running'],
  platineName: 'Logic board',
  ansage: (stufe, text) => `${stufe}. ${text}`, // screen readers, after choosing a level
  // [name, description] for level 0, 1, 2
  stufen: [
    ['Off', 'Everything connected. Your Kiesel works as usual.'],
    ['Sensors Off', 'Camera, microphone and GPS have no power. You can still get messages and use the internet.'],
    ['Radio Silence', 'Wi-Fi, Bluetooth, cellular and NFC lose power too. Your Kiesel is offline and invisible to the network.'],
  ],
  stufeWaehlen: 'Choose a level',
  halten: 'Hold the Action button',
  marken: ['0 s', '2 s: Sensors Off', '4 s: Radio Silence'],
  weiterTitel: 'Still works',
  weiter: [
    ['Everything'],
    ['Messages', 'Internet', 'Music', 'Bluetooth headphones', 'Mobile payments'],
    ['Offline music and podcasts', 'Notes and reading', 'Alarms and timers', 'Offline games'],
  ],
  weiterNotruf: 'Emergency calls and callbacks',
  pausiertTitel: 'Paused',
  pausiert: [
    [],
    ['Phone calls', 'Photos and video', 'Navigation'],
    ['Calls and messages', 'Internet', 'Bluetooth headphones', 'Mobile payments', 'Photos and navigation'],
  ],
  nichts: 'Nothing',
  notruf: {
    titel: 'Emergency: 5x side button',
    knopf: ['Simulate', 'End emergency call'],
    // text in level 0, in level 1/2 without and with emergency call
    text: [
      'This exception only applies while Privacy Mode is on.',
      'Press the side button five times quickly to turn cellular, microphone and GPS right back on. That way, an emergency call is always possible, in both levels.',
      'Cellular, microphone and GPS are reconnected. You can call 112, 117 or 144 (the Swiss emergency numbers), and your location can be sent along. Cellular stays on until you end Privacy Mode, so emergency services can call you back.',
    ],
  },
  // RGB dot on the logic board per level
  led: ['RGB dot off', 'Orange, steady', 'Orange, short blink'],
  schema: 'Diagram: six components, each connected to the logic board through its own switch. Current level: ',
  schemaNotruf: ', emergency call active',
};
