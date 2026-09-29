// Deutsche Texte, Teil „akku“: Akku-Story, Akku-Fazit und Akku-Rechner
// Aufbau und Regeln: siehe src/i18n/de.js.

// ── Akku: Story und Fazit der Modellseiten, Erklärtexte des Akku-Rechners (data/akku.js) ──
export const akku = {
  story: {
    original: { titel: '2016: das Original', text: (mah) => `Das iPhone SE hatte ${mah} mAh. Der Akku teilte sich den Platz mit Kopfhörerbuchse, SIM-Schlitten und Home-Button.` },
    klinke: { titel: 'Klinke raus', text: 'Die Buchse unten links fällt weg, samt Elektronik dahinter. Wer Kabel will, nimmt USB-C.', plus: '+ Platz unten' },
    sim: { titel: 'SIM-Schlitten raus', text: 'Nur noch eSIM. Kein Schlitten, keine Feder, kein Auswurfloch an der Seite.', plus: '+ Platz an der Seite' },
    home: { titel: 'Home-Button raus', text: 'Face ID übernimmt. Die Mechanik unten verschwindet, das Display darf bis an den Rand.', plus: '+ Platz unten' },
    waechst: {
      titel: 'Der Akku wächst',
      k1: (mm) => `Die Platine wird kompakter, Motor und Lautsprecher rutschen nach unten. Dazu ${mm} mm mehr Dicke und Zellen aus Silizium-Kohlenstoff.`,
      pro: (mm) => `Das Gehäuse wächst auf die Grösse des 13 mini, die Platine wird kompakter. Dazu ${mm} mm mehr Dicke als das SE und Zellen aus Silizium-Kohlenstoff.`,
      plus: (mah) => `ca. ${mah} mAh`,
    },
    titel: ['Weniger drin.', 'Mehr Akku.'],   // zwei Zeilen
    einleitung: {
      k1: (seMah, name) => `Das SE von 2016 hatte ${seMah} mAh. Der ${name} hat dieselbe Grundfläche, aber fast doppelt so viel.`,
      pro: (seMah, name) => `Das SE von 2016 hatte ${seMah} mAh. Der ${name} hat etwas mehr Fläche und mehr als doppelt so viel.`,
    },
    scrollWeiter: 'Scroll weiter und schau, woher der Platz kommt.',
    nummer: (nr, alle) => `${nr}/${alle}`,
    // „Dicke <span>9</span> mm · grobe Schätzung“
    dickeVor: 'Dicke ',
    dickeNach: ' mm · grobe Schätzung',
    bild: (se, seMah, name, mah) => `Innenleben im selben Massstab: links das ${se} mit ${seMah} mAh, rechts der ${name} mit ca. ${mah} mAh. Klinke, SIM-Schlitten und Home-Button fallen weg, der Akku wird grösser.`,
    nebeneinander: {
      k1: { titel: 'Nebeneinander', text: 'Links das SE von 2016, rechts der Kiesel 1, im selben Massstab. Gleiche Grundfläche, fast doppelt so viel Akku.' },
      pro: { titel: 'Nebeneinander', text: 'Links das SE von 2016, rechts der Kiesel 1 Pro, im selben Massstab. Etwas grösser, mehr als doppelt so viel Akku.' },
    },
  },
  fazit: {
    k1: (mm, mah) => `Kein Klinkenstecker, kein SIM-Schlitten, kein Home-Button. Dazu eine Zelle aus Silizium-Kohlenstoff und ${mm} mm mehr Dicke. So passen rund ${mah} mAh in die Grundfläche des SE.`,
    pro: (mm, mah) => `Kein SIM-Schlitten, eine Zelle aus Silizium-Kohlenstoff und ${mm} mm mehr Dicke. So passen rund ${mah} mAh in die Grundfläche des 13 mini.`,
  },
  rechner: {
    verbrauch: (v) => `Verbrauch pro Stunde beim Kiesel 1: Surfen ${v.surf}, Video ${v.video}, Musik ${v.music}, Kamera und Navigation ${v.cam}, Spielen ${v.game}, Standby ${v.standby}. Die Stunden verteilen sich gleichmässig über den Tag.`,
    pro: (v) => `Der Pro hat ${v.mehr} mehr Akku. Sein grösseres Display kostet etwas, dafür arbeitet der Chip dank Vapor Chamber bei Kamera und Spielen kühler und effizienter. Unterm Strich braucht er ${v.surf} weniger pro Stunde, bei Kamera ${v.cam} und bei Spielen ${v.game} weniger.`,
    vorsprung: 'Je mehr du das Handy nutzt, desto grösser wird der Vorsprung des Pro. An einem ruhigen Tag liegen beide nah beieinander, an einem langen Ferientag zählt jedes Prozent.',
    se: (weniger, faktor) => `Das SE von 2016 dient als Vergleich. Es hat rund ${weniger} weniger Akku als der Kiesel 1, das Modell rechnet es deshalb mit ${faktor}-fachem Verbrauch.`,
  },
};

// ── /akku-rechner/ (Seite und Rechnung lib/akku-rechner.js, auch im Browser) ──
export const akkuRechner = {
  titel: 'Akku-Rechner',
  beschreibung: 'Wie viel Akku bleibt am Abend? Stell deinen typischen Tag ein und vergleiche Kiesel 1, Kiesel 1 Pro und das iPhone SE von 2016. Ein Fan-Konzept.',
  einleitung: 'Stell deinen typischen Tag ein. Der Rechner startet um 07:00 mit 100 % und rechnet bis 23:00. Die restliche Zeit liegt das Handy im Standby.',
  typischerTag: 'Typischer Tag',
  tage: { quiet: 'Ruhiger Tag', normal: 'Normal', busy: 'Viel unterwegs', holiday: 'Ferientag' },
  regler: { surf: 'Surfen und Social Media', video: 'Video', music: 'Musik und Podcasts', cam: 'Kamera und Navigation', game: 'Spielen' },
  stundenVorlesen: (stunden) => `${stunden} Stunden`,   // aria-valuetext der Regler: „3.0 Stunden“
  umTitel: (uhr) => `Um ${uhr}`,
  verlauf: 'Akkustand über den Tag',
  erklaerungen: 'Erklärungen zum Rechner',
  soWird: 'So wird gerechnet',
  gutZuWissen: 'Gut zu wissen',
  // Ergebnis (rechne())
  zuViel: (summe, von, bis, stunden) => `Zusammen ${summe} Stunden aktiv. Ein Tag von ${von} bis ${bis} hat nur ${stunden}, stell einen Regler tiefer.`,
  keineBerechnung: 'Keine Berechnung möglich',
  leerUm: (uhr) => `leer um ${uhr}`,
  reicht: (tage, einTag) => `Reicht bei diesem Alltag für ca. ${einTag ? '1 Tag' : `${tage} Tage`}`,
  schlapp: (name, uhr, proUhr, proRest) => `Der ${name} macht um ${uhr} schlapp, der Pro ${proUhr ? `um ${proUhr}` : `hat noch ${proRest}`}.`,
  mehrUebrig: (punkte) => `Der Pro hat ${punkte} Prozentpunkte mehr übrig.`,
  label: (uhr, geraete) => `Um ${uhr}: ${geraete.map(([name, text]) => `${name} ${text}`).join(', ')}`,
};
