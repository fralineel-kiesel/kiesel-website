// English texts, part “faq”: frequently asked questions: topics, questions, page
// Rules: see src/i18n/en.js.

// ── FAQ: names of the topics (keys in data/faq.js THEMEN) ──
export const faqThemen = {
  alle: 'All',
  concept: 'Concept',
  phones: 'Phones',
  battery: 'Battery and charging',
  features: 'Features',
  buying: 'Buying',
};

// ── Number words (“seven years”, “in all five colors”) ──
const ZAHLWORT = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const wort = (n) => ZAHLWORT[n] ?? String(n);

// ── FAQ: the questions (order, topics, links in data/faq.js). Texts with values: (v) => …,
//    v = values from data/faq.js. link = link text (if it appears in the answer, exactly that
//    part becomes the link). pebble only exists in English (data/faq.js: sprachen). ──
export const faqFragen = {
  kaufen: {
    frage: 'Can I actually buy a Kiesel?',
    antwort: 'Sadly, no. Kiesel is a fan concept. The bag works anyway. Only the checkout breaks the sad news.',
  },
  konzept: {
    frage: 'How did the idea for Kiesel come about?',
    antwort: 'From a thought experiment: what would a phone the size of the iPhone SE look like if you rebuilt it with today’s tech and left out everything you don’t need day to day?',
  },
  pebble: {
    frage: 'Why is it called Kiesel?',
    antwort: 'Kiesel is the German word for pebble: small, smooth and a natural fit for your hand. The concept was dreamed up in Switzerland, so the name stayed German. Say it like “KEE-zel.”',
  },
  unterschied: {
    frage: 'What’s the difference between Kiesel 1 and Kiesel 1 Pro?',
    antwort: (v) => `Kiesel 1 is the size of the 2016 iPhone SE and has one camera. The Pro is the size of the iPhone 13 mini and adds a ${v.tele}x telephoto, a bigger battery, a mini vapor chamber and up to ${v.groessterSpeicher} of storage.`,
    link: 'Compare them',
  },
  dicke: {
    frage: (v) => `Why is Kiesel ${v.dicke} mm thick?`,
    antwort: (v) => `The extra ${v.dickePlus} mm over the SE goes almost entirely into the battery and the MagSafe coil. You barely notice it in your hand. Your battery definitely does.`,
  },
  klinke: {
    frage: 'Why is there no headphone jack and no SIM tray?',
    antwort: 'Both take up room the battery can put to better use. Headphones connect via USB-C or Bluetooth, and the SIM is an eSIM.',
  },
  wasser: {
    frage: 'Is Kiesel waterproof?',
    antwort: (v) => `Both models are rated ${v.schutz} for water and dust resistance.`,
  },
  updates: {
    frage: 'How long will Kiesel get updates?',
    antwort: (v) => `At least ${wort(v.updateJahre)} years of system and security updates.`,
  },
  akku: {
    frage: 'How long does the battery last?',
    antwort: 'That depends a lot on your day. In the Battery Calculator, you can set up your typical day and see how much is left in the evening.',
    link: 'Battery Calculator',
  },
  laden: {
    frage: 'How fast does Kiesel charge?',
    antwort: (v) => `Around ${v.wattKabel} W wired via USB-C, and ${v.wattKabellos} W wireless via MagSafe and Qi.`,
  },
  privacy: {
    frage: 'What exactly does Privacy Mode do?',
    antwort: 'It has two levels, both in hardware. Hold the Action button for two seconds, and the camera, microphone and GPS lose power (Sensors Off). Keep holding until the four-second mark, and Wi-Fi, Bluetooth, cellular and NFC lose power too (Radio Silence). The RGB dot glows a steady orange in Level 1 and gives a short blink every few seconds in Level 2.',
    link: 'Try Privacy Mode',
  },
  notruf: {
    frage: 'Can I make an emergency call in Privacy Mode?',
    antwort: 'Yes, in both levels. Press the side button five times quickly, and cellular, microphone and GPS reconnect instantly. That way you can call 112, 117 or 144 (the Swiss emergency numbers), and your location can be sent along. Cellular then stays on until you end Privacy Mode, so emergency services can call you back.',
    link: 'Try the emergency call',
  },
  rgb: {
    frage: 'What do the colors of the RGB light mean?',
    antwort: 'Blue for calls, purple for messages, green while charging, red when the battery is low and orange in Privacy Mode, with a short blink in Radio Silence. When you take a photo, the LED glows a neutral white.',
    link: 'Try the RGB light',
  },
  huelle: {
    frage: 'Does the case fit both models?',
    antwort: (v) => `No, Kiesel 1 and Kiesel 1 Pro each get their own case. Both cost ${v.huellePreis} and come in all ${wort(v.farben)} colors.`,
    link: 'See the Kiesel Case',
  },
  warenkorb: {
    frage: 'What happens to my bag?',
    antwort: 'It stays saved in your browser, even if you close the page. Just in case Cupertino changes its mind.',
  },
};

// ── /faq/ (page and filter in the browser) ──
export const faqSeite = {
  titel: 'Frequently asked questions',
  beschreibung: 'Answers about Kiesel 1 and Kiesel 1 Pro: the concept, size, battery, charging, features and buying. A fan concept.',
  einleitung: 'Everything you want to know about Kiesel. Plus the one question everybody asks first.',
  suchen: 'Search',
  suchBeispiel: 'e.g. battery, case, updates',
  themen: 'Topics',
  nichts: 'Nothing found. Try another word or choose “All.”',
  anzahl: (n) => (n === 1 ? '1 question' : `${n} questions`),
  frageTitel: 'Your question isn’t here?',
  frageText: 'Send it our way, and it might make it into the next version.',
  frageKnopf: 'Ask on GitHub',
};
