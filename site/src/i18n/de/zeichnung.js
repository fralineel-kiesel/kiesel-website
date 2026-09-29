// Deutsche Texte, Teil „zeichnung“: Texte in den Zeichnungen des Zeichen-Motors (Browser: überall, wo gezeichnet wird)
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── Texte in Zeichnungen des Zeichen-Motors (kiesel-draw: phone.js, scene.js, colors.js).
//    Alle Funktionen nehmen diesen Abschnitt als Parameter, Standard = Deutsch wie in lib.py/scene.py.
//    Datum und Uhrzeit des Sperrbildschirms: kiesel-draw/sperrbildschirm.js (über lib/format.js) ──
export const zeichnung = {
  // Bildbeschreibung von handy(), wenn kein label übergeben wird: „Kiesel 1 Pro, Rückseite“
  ansicht: { front: ', Vorderseite', back: ', Rückseite', side: (mm) => `, Seitenansicht, ${mm} mm dick` },
  panorama: 'Alpenpanorama',
  blume: 'Blume mit Tautropfen, Biene und Wiese',
  innenleben: (name) => `Innenleben ${name}`,
  mah: (wert) => `${wert} mAh`,
  mahCa: (wert) => `ca. ${wert} mAh`,
  // Legende des Innenlebens (phoneOpen)
  legende: {
    platineA9: 'Platine mit A9-Chip',
    kameraSe: (mp) => `Kamera (${mp} MP)`,
    akkuSe: 'Akku',
    sim: 'SIM-Schlitten',
    vibration: 'Vibrationsmotor',
    lautsprecher: 'Lautsprecher',
    home: 'Home-Button',
    klinke: 'Kopfhörerbuchse',
    lightning: 'Lightning',
    platineA20: 'Platine mit A20 Pro (abgespeckt)',
    privacy: 'Privacy-Schalter: Sensoren (Stufe 1) und Funk (Stufe 2)',
    vapor: 'Mini-Vapor-Chamber',
    kamera: (mp) => `Kamera 0.5x bis 1x (${mp} MP)`,
    tele: '3x-Tele mit OIS',
    blitz: 'RGB-Blitz',
    faceId: 'Face ID (Vorderseite)',
    akku: 'Akku, Silizium-Kohlenstoff',
    magsafe: 'MagSafe-Spule',
    usbc: 'USB-C',
  },
  // Namen der LED-Zustände (Spielwiese)
  led: {
    off: 'Aus', call: 'Anruf', msg: 'Nachricht', charge: 'Lädt', full: 'Voll geladen',
    low: 'Akku unter 10 %', privacy: 'Privacy-Modus', flash: 'Fotoblitz',
  },
};
