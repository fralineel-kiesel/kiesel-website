// English texts, part “zeichnung”: texts inside the drawings of the drawing engine (browser:
// wherever something is drawn)
// Rules: see src/i18n/en.js.

// ── Texts in drawings of the drawing engine (kiesel-draw: phone.js, scene.js, colors.js).
//    Date and time on the lock screen: kiesel-draw/sperrbildschirm.js (via lib/format.js) ──
export const zeichnung = {
  // description from handy() when no label is passed: “Kiesel 1 Pro, back”
  ansicht: { front: ', front', back: ', back', side: (mm) => `, side view, ${mm} mm thick` },
  panorama: 'Alpine panorama',
  blume: 'Flower with dewdrops, a bee and a meadow',
  innenleben: (name) => `Inside ${name}`,
  mah: (wert) => `${wert} mAh`,
  mahCa: (wert) => `~${wert} mAh`,   // in the drawing: “approx.” would be wider than the battery
  // legend of the teardown (phoneOpen)
  legende: {
    platineA9: 'Logic board with A9 chip',
    kameraSe: (mp) => `Camera (${mp} MP)`,
    akkuSe: 'Battery',
    sim: 'SIM tray',
    vibration: 'Vibration motor',
    lautsprecher: 'Speaker',
    home: 'Home button',
    klinke: 'Headphone jack',
    lightning: 'Lightning',
    platineA20: 'Logic board with A20 Pro (trimmed down)',
    privacy: 'Privacy switches: sensors (Level 1) and radios (Level 2)',
    vapor: 'Mini vapor chamber',
    kamera: (mp) => `Camera 0.5x to 1x (${mp} MP)`,
    tele: '3x telephoto with OIS',
    blitz: 'RGB flash',
    faceId: 'Face ID (front)',
    akku: 'Battery, silicon-carbon',
    magsafe: 'MagSafe coil',
    usbc: 'USB-C',
  },
  // names of the LED states (playground)
  led: {
    off: 'Off', call: 'Call', msg: 'Message', charge: 'Charging', full: 'Fully charged',
    low: 'Battery below 10%', privacy: 'Privacy Mode', flash: 'Photo flash',
  },
};
