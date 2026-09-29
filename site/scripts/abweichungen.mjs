// Bewusste Abweichungen von den Python-Vorlagen in design/generator/.
//
// Die Prüfskripte vergleichen Texte und Zeichnungen Zeichen für Zeichen mit den Vorlagen
// (pruefe:zeichenmotor, pruefe:faq, pruefe:vergleichen). Wenn eine spätere Etappe etwas
// absichtlich ändert, steht es hier: alter Text (muss genau so in der Vorlage stehen),
// neuer Text, Grund. Die Tests wenden das auf die Vorlage an und vergleichen erst dann.
// So bleibt alles andere weiter streng geprüft, und keine Abweichung passiert still.
// Ändert sich die Vorlage selbst, passt „alt“ nicht mehr und der Test schlägt Alarm.

const PRIVACY_GRUND = 'Etappe 8b: Privacy-Modus in zwei Stufen (Artboard aus gen5.py)';

// ── FAQ (gen4.py, FAQ = [[Thema, Frage, Antwort], …]) ──
export const FAQ_ABWEICHUNGEN = [
  {
    grund: PRIVACY_GRUND,
    frage: 'Was macht der Privacy-Modus genau?',
    alt: 'Halte den Action-Button zwei Sekunden. Drei Schalter trennen Kamera, Mikrofon und GPS vom Strom. Solange der Modus aktiv ist, leuchtet der RGB-Punkt orange.',
    neu: 'Er hat zwei Stufen, beide in Hardware. Hältst du den Action-Button zwei Sekunden, sind Kamera, Mikrofon und GPS stromlos (Sensoren aus). Hältst du weiter bis vier Sekunden, sind zusätzlich WLAN, Bluetooth, Mobilfunk und NFC stromlos (Funkstille). Der RGB-Punkt leuchtet in Stufe 1 ruhig orange und blinkt in Stufe 2 alle paar Sekunden kurz.',
  },
  {
    grund: PRIVACY_GRUND,
    neueFrageNach: 'Was macht der Privacy-Modus genau?',
    eintrag: ['Funktionen', 'Kann ich im Privacy-Modus den Notruf wählen?', 'Ja, in beiden Stufen. Drückst du fünfmal schnell die Seitentaste, sind Mobilfunk, Mikrofon und GPS sofort wieder verbunden. So kannst du 112, 117 oder 144 anrufen, und dein Standort kann mitgeschickt werden. Der Mobilfunk bleibt danach an, bis du den Privacy-Modus beendest, damit dich die Rettung zurückrufen kann.'],
  },
  {
    grund: `${PRIVACY_GRUND}, neues RGB-Ereignis „Funkstille“`,
    frage: 'Was bedeuten die Farben des RGB-Lichts?',
    alt: 'Blau für Anrufe, Violett für Nachrichten, Grün beim Laden, Rot bei tiefem Akku und Orange im Privacy-Modus. Beim Fotografieren leuchtet die LED neutral weiss.',
    neu: 'Blau für Anrufe, Violett für Nachrichten, Grün beim Laden, Rot bei tiefem Akku und Orange im Privacy-Modus, in der Funkstille mit kurzem Blinken. Beim Fotografieren leuchtet die LED neutral weiss.',
  },
];

export function faqMitAbweichungen(faq) {
  const liste = faq.map((f) => [...f]);
  for (const a of FAQ_ABWEICHUNGEN) {
    if (a.eintrag) {
      const i = liste.findIndex((f) => f[1] === a.neueFrageNach);
      if (i < 0) throw new Error(`Abweichung FAQ: Frage „${a.neueFrageNach}“ fehlt in der Vorlage`);
      liste.splice(i + 1, 0, [...a.eintrag]);
      continue;
    }
    const f = liste.find((x) => x[1] === a.frage);
    if (!f || f[2] !== a.alt) throw new Error(`Abweichung FAQ: „${a.frage}“ hat in der Vorlage nicht den erwarteten alten Text`);
    f[2] = a.neu;
  }
  return liste;
}

// ── Technische Daten (gen4.py, SPEC = [[Gruppe, [[Merkmal, Kiesel 1, Pro], …]], …]) ──
export const SPEC_ABWEICHUNGEN = [
  {
    grund: PRIVACY_GRUND,
    merkmal: 'Extras',
    alt: 'Zen-Modus, Privacy-Modus mit Hardware-Trennung',
    neu: 'Zen-Modus, Privacy-Modus mit Hardware-Trennung in zwei Stufen (Sensoren, Funkstille)',
  },
];

export function specMitAbweichungen(spec) {
  const kopie = JSON.parse(JSON.stringify(spec));
  for (const a of SPEC_ABWEICHUNGEN) {
    const zeile = kopie.flatMap(([, zeilen]) => zeilen).find((z) => z[0] === a.merkmal);
    if (!zeile || zeile[1] !== a.alt || zeile[2] !== a.alt) throw new Error(`Abweichung SPEC: „${a.merkmal}“ hat in der Vorlage nicht den erwarteten alten Text`);
    zeile[1] = zeile[2] = a.neu;
  }
  return kopie;
}

// ── Innenleben (scene.py, phone_open() für Kiesel 1 und Pro) ──
// Die Privacy-Schalter auf der Platine: in der Vorlage drei orange Rechtecke und die Nummer
// darüber, bei uns sechs in zwei Reihen und die Nummer links daneben. Verglichen wird
// alles ohne diesen Block; der Block selbst muss genau so aussehen, wie hier beschrieben.
export const INNENLEBEN_ABWEICHUNG = {
  grund: PRIVACY_GRUND,
  modelle: ['k1', 'pro'],
  altName: 'Privacy-Schalter: Kamera, Mikrofon, GPS',
  neuName: 'Privacy-Schalter: Sensoren (Stufe 1) und Funk (Stufe 2)',
  altSchalter: 3,
  neuSchalter: 6,
};

const ORANGE_SCHALTER = /<rect [^>]*style="fill: #FF9A2E"><\/rect>/g;

// Nimmt JSON von phone_open()/phoneOpen() = [svg, [[nr, name, fälltWeg], …]] und liefert
// { rest, name, schalter }: rest = alles ohne Privacy-Block (vergleichbar), dazu Name und Anzahl
export function ohnePrivacyBlock(json) {
  const [svg, legende] = JSON.parse(json);
  const eintrag = legende.find(([, name]) => name.startsWith('Privacy-Schalter'));
  if (!eintrag) return { rest: json, name: null, schalter: 0 };
  const [nr] = eintrag;
  const schalter = (svg.match(ORANGE_SCHALTER) ?? []).length;
  const nummer = new RegExp(`<circle [^>]*r="11" style="fill: #5CC3DB"></circle><text [^>]*>${nr}</text>`, 'g');
  if ((svg.match(nummer) ?? []).length !== 1) throw new Error('Abweichung Innenleben: Nummer der Privacy-Schalter nicht eindeutig gefunden');
  const rest = svg.replace(ORANGE_SCHALTER, '').replace(nummer, '[Privacy-Nummer]');
  return { rest: JSON.stringify([rest, legende.map((l) => (l === eintrag ? [nr, '[Privacy-Schalter]', l[2]] : l))]), name: eintrag[1], schalter };
}
