// Akku-Story: koppelt die Animation im Baustein AkkuStory.astro an die Scroll-Position.
//
// Grundidee
// ---------
// Der Abschnitt ist viel höher als der Bildschirm (CSS: --strecke), die Bühne darin klebt
// (position: sticky). Aus der Lage des Abschnitts ergibt sich eine einzige Zahl, der
// Fortschritt p von 0 (Anfang) bis 1 (Ende). zeige(p) rechnet daraus für jede Ebene aus,
// wo sie gerade steht. p hängt NUR von der Scroll-Position ab: Scrollt man zurück, läuft
// alles rückwärts, springt man irgendwohin, stimmt das Bild sofort.
//
// Warum flüssig?
// - Pro Bildschirmbild höchstens EIN Durchgang: Der scroll-Listener merkt sich nur, dass
//   etwas zu tun ist, und bestellt requestAnimationFrame. Dort wird einmal gelesen
//   (getBoundingClientRect) und danach nur noch geschrieben. Abwechselnd lesen und
//   schreiben würde den Browser zwingen, das Layout mehrmals pro Bild neu zu berechnen.
// - Geschrieben werden nur transform und opacity. Die Bauteile sind fertig gemalte Ebenen,
//   die Grafikkarte schiebt sie nur herum. Neu gezeichnet wird pro Bild höchstens die
//   kleine Akku-Beschriftung, wenn sich die Zahl ändert.
// - Ausserhalb des Bildschirms hört das Skript gar nicht erst zu (IntersectionObserver).
//
// Bei „weniger Bewegung“ (prefers-reduced-motion) schaltet das Skript die Kopplung nicht
// ein: Das HTML zeigt schon den Endzustand, fertig.

// ── kleine Helfer ──
const klemme = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
// Anteil von p im Bereich [a, b] als 0…1
const ab = (p, a, b) => klemme((p - a) / (b - a));
// sanft anfahren und abbremsen (Sinus-Kurve). Ihre steilste Stelle ist nur 1.57-mal so
// steil wie eine Gerade, bei der kubischen Kurve wäre es 3-mal: so ruckt nichts.
const weich = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const mix = (a, b, t) => a + (b - a) * t;
const zahlen = (s) => (s ? s.split(' ').map(Number) : null);
const r2 = (x) => Math.round(x * 100) / 100;

// ── Drehbuch: wann passiert was (Anteile der Scroll-Strecke) ──
// Die Schrittgrenzen der Texte stehen in src/data/akku.js und passen hierzu.
export const DREHBUCH = {
  kippen: [0.01, 0.14],     // flach → Schrägansicht
  klinke: [0.155, 0.29],
  sim: [0.31, 0.45],
  home: [0.47, 0.59],
  umbau: [0.62, 0.8],       // Akku wächst, Teile rücken nach
  neu: [0.7, 0.82],         // neue Teile setzen sich ein
  zurueck: [0.845, 0.97],   // zurück in die Draufsicht, zur Seite
  vergleich: [0.88, 0.98],  // SE gleitet daneben
  nummern: [0.95, 1],
};
// solo: Solange das Gerät allein mittig steht, ist es grösser (die Welt ist für zwei Handys gebaut)
const SCHRAEG = { x: 52, z: -30, drift: -8, zoom: 0.08, solo: 0.22, soloSchmal: 0.06 };
const TIEFE = { gehaeuse: 0, luecke: 1, platine: 2, akku: 2, akkutext: 3, magsafe: 4, standard: 3 };
const PX_PRO_MM = 3.4;

export function starteAkkuStory(wurzel) {
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)');
  const buehne = wurzel.querySelector('[data-buehne]');
  const geraet = wurzel.querySelector('[data-geraet]');
  const [weltB, weltH] = zahlen(wurzel.dataset.welt);
  const [mitteX, mitteY] = zahlen(wurzel.dataset.mitte);
  const mahSe = Number(wurzel.dataset.mahSe), mah = Number(wurzel.dataset.mah);
  // Dicke SE → Kiesel in mm (aus data/geraete.js, über data-dicke-se/data-dicke)
  const WAND_MM = [Number(wurzel.dataset.dickeSe), Number(wurzel.dataset.dicke)];
  const zahl = wurzel.querySelector('[data-mah-zahl]');
  const anzeige = wurzel.querySelector('.anzeige');
  const dicke = wurzel.querySelector('[data-dicke]');
  const akkutext = wurzel.querySelector('[data-akkutext]');
  const balken = wurzel.querySelector('[data-fortschritt-balken]');
  const seVergleich = wurzel.querySelector('[data-se-vergleich]');
  const zielName = wurzel.querySelector('[data-ziel-name]');
  const schritte = [...wurzel.querySelectorAll('[data-schritt]')].map((el) => ({ el, von: +el.dataset.von, bis: +el.dataset.bis }));
  const endText = akkutext.textContent;

  // Ebenen einmal einlesen: eigene Lage (box), Lage im SE (von) bzw. im Kiesel (nach)
  const ebenen = [...geraet.querySelectorAll('.ebene')].map((el) => ({
    el, id: el.dataset.teil, rolle: el.dataset.rolle,
    box: zahlen(el.dataset.box), von: zahlen(el.dataset.von), nach: zahlen(el.dataset.nach),
  }));
  const waende = [...geraet.querySelectorAll('[data-wand]')];
  const seGehaeuse = zahlen(waende[0]?.dataset.box);
  const zielGehaeuse = ebenen.find((e) => e.id === 'gehaeuse').box;
  const neue = ebenen.filter((e) => e.rolle === 'neu');

  // Transform, der das Rechteck `eigen` auf das Rechteck `jetzt` abbildet (transform-origin 0 0)
  const passe = (eigen, jetzt, z = 0) =>
    `translate3d(${r2(jetzt[0] - eigen[0])}px, ${r2(jetzt[1] - eigen[1])}px, ${r2(z)}px) scale(${r2(jetzt[2] / eigen[2] * 1000) / 1000}, ${r2(jetzt[3] / eigen[3] * 1000) / 1000})`;
  const zwischen = (a, b, t) => a.map((v, i) => mix(v, b[i], t));

  let letzteZahl = null;
  function zeige(p) {
    const D = DREHBUCH;
    // Schräglage: kommt am Anfang, geht am Schluss wieder
    const rein = weich(ab(p, ...D.kippen)), raus = weich(ab(p, ...D.zurueck));
    const kipp = rein * (1 - raus);
    const drift = ab(p, D.kippen[1], D.zurueck[0]);
    const umbau = weich(ab(p, ...D.umbau));
    const blende = ab(p, D.umbau[0] + 0.02, D.umbau[1] - 0.04);

    // Das ganze Gerät: erst mittig, am Schluss an seinen Platz neben dem SE
    geraet.style.transform =
      `translate(${r2(mitteX * (1 - raus))}px, ${r2(mitteY * (1 - raus))}px) ` +
      `rotateX(${r2(SCHRAEG.x * kipp)}deg) rotateZ(${r2((SCHRAEG.z + SCHRAEG.drift * drift) * kipp)}deg) scale(${r2((1 + solo * (1 - raus)) * (1 + SCHRAEG.zoom * kipp))})`;

    // Gehäusewand: 10 Scheiben untereinander, in der Schräglage sieht das aus wie ein Block
    const wandPx = mix(WAND_MM[0], WAND_MM[1], umbau) * PX_PRO_MM * kipp;
    const gh = zwischen(seGehaeuse, zielGehaeuse, umbau);
    waende.forEach((w, i) => {
      const z = -wandPx * (i + 1) / waende.length;
      w.style.transform = passe(zielGehaeuse, gh, z);
      w.style.opacity = kipp > 0.01 ? 1 : 0;
    });

    for (const e of ebenen) {
      let t = 'none', o = 1;
      const tiefe = (TIEFE[e.id] ?? TIEFE.standard) * kipp;
      switch (e.rolle) {
        case 'ziel': // Kiesel-Teil: kommt aus der Lage des SE-Teils und blendet ein
          t = passe(e.box, zwischen(e.von, e.box, umbau), tiefe);
          o = e.id === 'gehaeuse' ? 1 : blende;
          break;
        case 'se': // SE-Teil: wandert zur Kiesel-Lage und blendet aus
          t = passe(e.box, zwischen(e.box, e.nach, umbau), tiefe);
          o = 1 - blende;
          break;
        case 'text':
          t = passe(e.box, zwischen(e.von, e.box, umbau), TIEFE.akkutext * kipp);
          break;
        case 'luecke': { // orange Umrisse: erscheinen, wenn ihr Teil geht, verschwinden beim Umbau
          const [a] = D[e.id.slice(7)];
          o = ab(p, a + 0.02, a + 0.06) * (1 - ab(p, D.umbau[0], D.umbau[0] + 0.05));
          t = `translate3d(0, 0, ${r2(TIEFE.luecke * kipp)}px)`;
          break;
        }
        case 'weg':
          ({ t, o } = fliege(e.id, ab(p, ...D[e.id])));
          break;
        case 'neu': { // setzt sich von oben ein, eins nach dem anderen
          const i = neue.indexOf(e);
          const n = weich(ab(p, D.neu[0] + i * 0.012, D.neu[0] + 0.06 + i * 0.012));
          o = n;
          t = `translate3d(0, 0, ${r2(tiefe + 70 * (1 - n) * kipp)}px)`;
          break;
        }
        case 'nummern':
          o = ab(p, ...D.nummern);
          break;
      }
      e.el.style.transform = t;
      e.el.style.opacity = r2(o);
    }

    // Zahlen: mAh und Dicke zählen mit dem Umbau hoch
    const jetzt = Math.round(mix(mahSe, mah, umbau));
    if (jetzt !== letzteZahl) {
      letzteZahl = jetzt;
      zahl.textContent = jetzt;
      akkutext.textContent = umbau >= 1 ? endText : `${jetzt} mAh`;
    }
    // Text nur ändern, wenn er sich ändert (jedes Setzen würde das Layout neu anstossen)
    const d = mix(WAND_MM[0], WAND_MM[1], umbau).toFixed(1).replace('.0', '');
    if (dicke.textContent !== d) dicke.textContent = d;

    // SE-Vergleich und Namen: gleiten am Schluss herein
    const v = weich(ab(p, ...D.vergleich));
    seVergleich.style.opacity = r2(v);
    seVergleich.style.transform = `translateX(${r2(-60 * (1 - v))}px)`;
    zielName.style.opacity = r2(v);
    anzeige.style.opacity = r2(1 - v); // am Schluss stehen die mAh bei den Namen

    // Texte: der aktive Schritt ist sichtbar. An der Grenze blendet der alte Text erst aus,
    // dann der neue ein (nacheinander, sonst liegen zwei Texte halb durchsichtig übereinander).
    const RAND = 0.015;
    let aktiv = 0;
    schritte.forEach((s, i) => {
      const rein = i === 0 ? 1 : ab(p, s.von, s.von + RAND);
      const raus = i === schritte.length - 1 ? 1 : 1 - ab(p, s.bis - RAND, s.bis);
      const o = Math.min(rein, raus);
      if (p >= s.von) aktiv = i;
      s.el.style.opacity = r2(o);
      s.el.style.transform = `translateY(${r2((1 - o) * (rein < 1 ? 12 : -12))}px)`;
    });
    schritte.forEach((s, i) => s.el.toggleAttribute('data-aktiv', i === aktiv));
    balken.style.transform = `scaleX(${r2(p)})`;
    wurzel.dataset.fortschritt = p.toFixed(4);
    wurzel.dataset.schritt = aktiv;
  }

  // Flugbahnen der drei Teile, die wegfallen (Koordinaten in der Ebene des Handys)
  function fliege(id, t) {
    let x = 0, y = 0, z = 0, dreh = 0, o = 1;
    if (t > 0) {
      if (id === 'sim') {
        // Schlitten gleitet seitlich heraus, dann hoch und weg
        x = 140 * weich(ab(t, 0, 0.55));
        z = 80 * weich(ab(t, 0.45, 1));
        y = -40 * weich(ab(t, 0.5, 1));
        dreh = 25 * weich(ab(t, 0.5, 1));
      } else {
        // Klinke und Home-Button: abheben, dann wegfliegen
        const hoch = weich(ab(t, 0, 0.4)), weg = weich(ab(t, 0.3, 1));
        z = (id === 'home' ? 100 : 90) * hoch;
        x = (id === 'home' ? 40 : -170) * weg;
        y = (id === 'home' ? 170 : 60) * weg;
        dreh = (id === 'home' ? 50 : -40) * weg;
      }
      o = 1 - ab(t, 0.6, 1);
    }
    return { t: `translate3d(${r2(x)}px, ${r2(y)}px, ${r2(z + TIEFE.standard)}px) rotateZ(${r2(dreh)}deg)`, o };
  }

  // Welt in die Bühne einpassen (600 × 560 → Bühnengrösse)
  // Auf schmalen Bühnen (Handy) begrenzt die Breite: dort das Gerät kaum vergrössern,
  // sonst ragt es in der Schrägansicht seitlich hinaus
  let solo = SCHRAEG.solo;
  function einpassen() {
    const r = buehne.getBoundingClientRect();
    solo = r.width < 500 ? SCHRAEG.soloSchmal : SCHRAEG.solo;
    const rand = r.width < 500 ? 0.96 : 0.92;
    const fit = Math.min(r.width / weltB, r.height / weltH) * rand;
    buehne.style.setProperty('--fit', r2(fit * 100) / 100 || 1);
  }

  // ── Scroll-Kopplung ──
  // Die Spur ist so hoch wie Strecke + Klebhöhe. .klebt klebt, sobald die Spur oben am
  // Rand (unter der Unterleiste) ankommt, und löst sich, wenn ihr Ende erreicht ist.
  // p = wie weit die Spur schon am Rand vorbeigezogen ist, geteilt durch die Strecke.
  const spur = wurzel.querySelector('[data-spur]');
  const klebt = wurzel.querySelector('.klebt');
  let oben = 0, strecke = 1;
  function messen() {
    oben = parseFloat(getComputedStyle(klebt).top) || 0;
    strecke = Math.max(1, spur.offsetHeight - klebt.offsetHeight);
  }
  const fortschritt = () => klemme((oben - spur.getBoundingClientRect().top) / strecke);
  let wartet = false, sichtbar = false;
  function bild() {
    wartet = false;
    zeige(fortschritt());
  }
  function bestelle() {
    if (!wartet && sichtbar) { wartet = true; requestAnimationFrame(bild); }
  }

  let beobachter = null, groesse = null;
  const neuMessen = () => { messen(); bestelle(); };
  function an() {
    wurzel.dataset.scroll = 'an';
    einpassen();
    messen();
    groesse = new ResizeObserver(() => { einpassen(); messen(); bestelle(); });
    groesse.observe(buehne);
    beobachter = new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; bestelle(); }, { rootMargin: '50% 0px' });
    beobachter.observe(wurzel);
    addEventListener('scroll', bestelle, { passive: true });
    addEventListener('resize', neuMessen);
    sichtbar = true;
    bild();
  }
  function aus() {
    delete wurzel.dataset.scroll;
    removeEventListener('scroll', bestelle);
    removeEventListener('resize', neuMessen);
    beobachter?.disconnect();
    groesse?.disconnect();
    // alle Inline-Stile weg: zurück zum Endzustand aus dem HTML
    wurzel.querySelectorAll('[style]').forEach((el) => {
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
    });
    akkutext.textContent = endText;
    zahl.textContent = mah;
    dicke.textContent = '9';
    letzteZahl = null;
    wurzel.dataset.fortschritt = '1';
    einpassenStill();
  }
  // Ohne Kopplung die Welt trotzdem einpassen (Bühne hat feste Höhe)
  let stillBeobachter = null;
  function einpassenStill() {
    einpassen();
    stillBeobachter ??= new ResizeObserver(() => { if (!wurzel.dataset.scroll) einpassen(); });
    stillBeobachter.observe(buehne);
  }

  if (ruhig.matches) aus(); else an();
  ruhig.addEventListener('change', () => (ruhig.matches ? aus() : an()));
}
