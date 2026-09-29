// English texts, part “akku”: battery story, battery summary and Battery Calculator
// Rules: see src/i18n/en.js.

// ── Battery: story and summary on the model pages, explanations of the calculator (data/akku.js) ──
export const akku = {
  story: {
    original: { titel: '2016: the original', text: (mah) => `The iPhone SE had ${mah} mAh. Its battery shared the space with a headphone jack, a SIM tray and a Home button.` },
    klinke: { titel: 'Jack out', text: 'The jack at the bottom left goes, along with the electronics behind it. Want a cable? That’s what USB-C is for.', plus: '+ room at the bottom' },
    sim: { titel: 'SIM tray out', text: 'eSIM only. No tray, no spring, no eject hole on the side.', plus: '+ room on the side' },
    home: { titel: 'Home button out', text: 'Face ID takes over. The mechanics at the bottom disappear, and the display gets to go all the way to the edge.', plus: '+ room at the bottom' },
    waechst: {
      titel: 'The battery grows',
      k1: (mm) => `The logic board gets more compact, the motor and speaker move down. Add ${mm} mm of thickness and silicon-carbon cells.`,
      pro: (mm) => `The body grows to the size of the 13 mini, and the logic board gets more compact. Add ${mm} mm of thickness over the SE and silicon-carbon cells.`,
      plus: (mah) => `approx. ${mah} mAh`,
    },
    titel: ['Less inside.', 'More battery.'],   // two lines
    einleitung: {
      k1: (seMah, name) => `The 2016 SE had ${seMah} mAh. ${name} has the same footprint, but almost twice as much.`,
      pro: (seMah, name) => `The 2016 SE had ${seMah} mAh. ${name} is a little bigger and has more than twice as much.`,
    },
    scrollWeiter: 'Keep scrolling to see where the room comes from.',
    nummer: (nr, alle) => `${nr}/${alle}`,
    // “Thickness <span>9</span> mm · rough estimate”
    dickeVor: 'Thickness ',
    dickeNach: ' mm · rough estimate',
    bild: (se, seMah, name, mah) => `Inside, at the same scale: on the left the ${se} with ${seMah} mAh, on the right ${name} with approx. ${mah} mAh. Headphone jack, SIM tray and Home button are gone, and the battery grows.`,
    nebeneinander: {
      k1: { titel: 'Side by side', text: 'On the left the 2016 SE, on the right Kiesel 1, at the same scale. Same footprint, almost twice the battery.' },
      pro: { titel: 'Side by side', text: 'On the left the 2016 SE, on the right Kiesel 1 Pro, at the same scale. A little bigger, more than twice the battery.' },
    },
  },
  fazit: {
    k1: (mm, mah) => `No headphone jack, no SIM tray, no Home button. Plus a silicon-carbon cell and ${mm} mm of extra thickness. That’s how around ${mah} mAh fit into the footprint of the SE.`,
    pro: (mm, mah) => `No SIM tray, a silicon-carbon cell and ${mm} mm of extra thickness. That’s how around ${mah} mAh fit into the footprint of the 13 mini.`,
  },
  rechner: {
    verbrauch: (v) => `Battery used per hour on Kiesel 1: browsing ${v.surf}, video ${v.video}, music ${v.music}, camera and navigation ${v.cam}, gaming ${v.game}, standby ${v.standby}. The hours are spread evenly across the day.`,
    pro: (v) => `The Pro has ${v.mehr} more battery. Its bigger display costs a little, but thanks to the vapor chamber, the chip runs cooler and more efficiently for camera and gaming. All in all, it uses ${v.surf} less per hour, ${v.cam} less for camera and ${v.game} less for gaming.`,
    vorsprung: 'The more you use your phone, the bigger the Pro’s lead. On a quiet day, the two are close. On a long vacation day, every percent counts.',
    se: (weniger, faktor) => `The 2016 SE is there for comparison. It has around ${weniger} less battery than Kiesel 1, so the model gives it ${faktor} times the consumption.`,
  },
};

// ── /battery-calculator/ (page and calculation lib/akku-rechner.js, also in the browser) ──
export const akkuRechner = {
  titel: 'Battery Calculator',
  beschreibung: 'How much battery is left in the evening? Set up your typical day and compare Kiesel 1, Kiesel 1 Pro and the 2016 iPhone SE. A fan concept.',
  einleitung: (start, voll, ende) => `Set up your typical day. The calculator starts at ${start} with ${voll} and runs until ${ende}. The rest of the time, the phone sits in standby.`,
  typischerTag: 'Typical day',
  tage: { quiet: 'Quiet day', normal: 'Normal', busy: 'On the go', holiday: 'Vacation day' },
  regler: { surf: 'Browsing and social media', video: 'Video', music: 'Music and podcasts', cam: 'Camera and navigation', game: 'Gaming' },
  stundenVorlesen: (stunden) => `${stunden} hours`,   // aria-valuetext of the sliders: “3.0 hours”
  umTitel: (uhr) => `At ${uhr}`,
  verlauf: 'Battery level over the day',
  erklaerungen: 'About the calculator',
  soWird: 'How it’s calculated',
  gutZuWissen: 'Good to know',
  // result (rechne())
  zuViel: (summe, von, bis, stunden) => `That’s ${summe} active hours. A day from ${von} to ${bis} only has ${stunden}, so turn a slider down.`,
  keineBerechnung: 'Can’t calculate',
  leerUm: (uhr) => `empty at ${uhr}`,
  reicht: (tage, einTag) => `With this routine, lasts approx. ${einTag ? '1 day' : `${tage} days`}`,
  schlapp: (name, uhr, proUhr, proRest) => `${name} runs out at ${uhr}, the Pro ${proUhr ? `at ${proUhr}` : `still has ${proRest} left`}.`,
  mehrUebrig: (punkte) => `The Pro has ${punkte} percentage points more left.`,
  label: (uhr, geraete) => `At ${uhr}: ${geraete.map(([name, text]) => `${name} ${text}`).join(', ')}`,
};
