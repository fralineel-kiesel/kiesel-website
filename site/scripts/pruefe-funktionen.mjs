// Prüft /funktionen/, /zubehoer/ und /zubehoer/huelle/ (Etappe 5) im echten Browser:
//
//   npm run pruefe:funktionen
//
// 1. RGB-Licht: jeder Knopf zeichnet die LED in der Farbe aus data/funktionen.js, mit dem
//    richtigen Rhythmus (Animation), „Aus“ ohne Leuchthof; Tastatur; bei „weniger Bewegung“
//    keine Animation.
// 2. Zen-Modus: Schalter (Maus und Tastatur) blendet die drei Mitteilungen aus und die Pille ein.
// 3. Privacy-Modus in zwei Stufen (Etappe 8b): alle Zustände (Stufe 0/1/2, mit und ohne Notruf)
//    gegen das Artboard aus gen5.py, Notruf in Stufe Aus ohne Wirkung, nur Tastatur, 390 px.
// 4. Zubehör: Filter, Platzhalter-Kachel bleibt, „In den Warenkorb“ legt genau die gezeigte Hülle
//    hinein (Zähler oben zählt), „Frei kombinieren“ zeichnet neu und führt den Link nach.
// 5. Hülle: Vorwahl aus der Adresse, Modell, Ansicht, Farben; Warenkorb nur mit Modell und
//    Hüllenfarbe, nie mit der Vorschau-Handyfarbe; Platzhalter „[Material]“.
// Dazu: Sprungmarken, keine Skriptfehler, kein three.js, kein „Inhalt folgt“.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { RGB } from '../src/data/funktionen.js';
import { referenzPrivacy } from './gen5-referenz.mjs';

const REF_PRIVACY = referenzPrivacy();

const DREI_D = /\/buehne\.[\w-]+\.js$/;
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
let fehler = 0;

function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

async function oeffne(adresse, kontext = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { dreiD: false, fehler: [] };
  seite.on('request', (r) => { if (DREI_D.test(new URL(r.url()).pathname)) status.dreiD = true; });
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  await seite.evaluate(() => document.fonts.ready);
  return { seite, ctx, status };
}
const warenkorb = (seite) => seite.evaluate(() => JSON.parse(localStorage.getItem('kiesel-warenkorb') || '[]'));
const zaehlerOben = (seite) => seite.evaluate(() => document.querySelector('[data-warenkorb-zahl]')?.textContent.trim() ?? '');

try {
  console.log('\n── RGB-Licht ──');
  {
    const { seite, ctx, status } = await oeffne('funktionen/');
    const led = () => seite.evaluate(() => {
      const w = document.querySelector('[data-rgb]');
      const svg = w.querySelector('[data-rgb-handy] svg');
      const hof = svg.querySelector('circle.hof');
      const stopp = hof ? svg.querySelector(`${hof.style.fill.match(/#[\w-]+/)[0]} stop`) : null;
      return {
        farbe: stopp ? stopp.getAttribute('style').match(/stop-color: ([^;]+)/)[1] : null,
        rhythmus: w.querySelector('[data-rhythmus]').dataset.rhythmus,
        animation: hof ? getComputedStyle(hof).animationName : 'none',
        titel: w.querySelector('[data-rgb-titel]').textContent,
      };
    });
    for (const [k, e] of Object.entries(RGB.ereignisse)) {
      await seite.locator(`[data-ereignis="${k}"]`).click();
      const l = await led();
      const gedrueckt = await seite.locator(`[data-ereignis="${k}"]`).getAttribute('aria-pressed');
      const erwartetAnimation = { schnell: 'schnell', zweimal: 'zweimal', atmen: 'atmen', langsam: 'langsam', blinkt: 'blinkt', ruhig: 'none', aus: 'none' }[e.rhythmus];
      const ok = gedrueckt === 'true' && l.titel === e.titel && l.rhythmus === e.rhythmus
        && (e.color ? l.farbe?.toUpperCase() === e.color.toUpperCase() : l.farbe === null)
        && l.animation.includes(erwartetAnimation);
      pruefe(`${e.name}: LED ${e.color ?? 'aus'}, Rhythmus „${e.rhythmus}“, Karte „${e.titel}“`, ok, JSON.stringify(l));
    }
    // Tastatur: Tab auf den ersten Knopf, Enter
    await seite.locator('[data-ereignis="msg"]').focus();
    await seite.keyboard.press('Enter');
    pruefe('Tastatur: Enter wählt das Ereignis', (await led()).titel === RGB.ereignisse.msg.titel);
    await seite.locator('[data-ereignis="funkstille"]').click();
    const stufeSichtbar = await seite.evaluate(() => getComputedStyle(document.querySelector('[data-rgb-stufe]')).display);
    pruefe('Mit Bewegung: kein Stufen-Text auf der Bühne (das Blinken zeigt die Stufe)', stufeSichtbar === 'none', stufeSichtbar);
    const anker = await seite.evaluate(() => ['rgb', 'zen', 'privacy', 'kamera'].filter((id) => !document.getElementById(id)));
    pruefe('Sprungmarken #rgb, #zen, #privacy, #kamera vorhanden', anker.length === 0, anker.join(', '));
    pruefe('Keine Skriptfehler, kein three.js, kein Platzhalter', status.fehler.length === 0 && !status.dreiD && !(await seite.content()).includes('Inhalt folgt'), status.fehler.join(' | '));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('funktionen/', { reducedMotion: 'reduce' });
    await seite.locator('[data-ereignis="call"]').click();
    const animation = await seite.evaluate(() => getComputedStyle(document.querySelector('[data-rgb] circle.hof')).animationName);
    pruefe('Weniger Bewegung: LED leuchtet ruhig (keine Animation)', animation === 'none', animation);
    // Funkstille ohne Blinken: dafür steht die Stufe als Text auf der Bühne
    const stufe = () => seite.evaluate(() => { const s = document.querySelector('[data-rgb-stufe]'); return getComputedStyle(s).display === 'none' ? '' : s.textContent.trim(); });
    const ohne = await stufe();
    await seite.locator('[data-ereignis="funkstille"]').click();
    const f = await stufe();
    const fAnim = await seite.evaluate(() => getComputedStyle(document.querySelector('[data-rgb] circle.hof')).animationName);
    await seite.locator('[data-ereignis="privacy"]').click();
    const p = await stufe();
    pruefe('Weniger Bewegung: Funkstille blinkt nicht, Bühne zeigt „Stufe 2: Funkstille“ bzw. „Stufe 1: Sensoren aus“, bei Anruf nichts', ohne === '' && f === 'Stufe 2: Funkstille' && fAnim === 'none' && p === 'Stufe 1: Sensoren aus', `${ohne} | ${f} (${fAnim}) | ${p}`);
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('');
    const links = await seite.evaluate(() => [...document.querySelectorAll('a[href*="funktionen/#"]')].map((a) => a.getAttribute('href').split('#')[1]));
    pruefe('Startseite: „Ausprobieren“ verlinkt auf #rgb, #zen, #privacy', ['rgb', 'zen', 'privacy'].every((a) => links.includes(a)), links.join(', '));
    await ctx.close();
  }

  console.log('\n── Zen-Modus ──');
  {
    const { seite, ctx } = await oeffne('funktionen/', { reducedMotion: 'reduce' });
    const zustand = () => seite.evaluate(() => {
      const w = document.querySelector('[data-zen-modus]');
      return {
        zen: w.dataset.zen,
        checked: w.querySelector('[data-zen-schalter]').getAttribute('aria-checked'),
        label: w.querySelector('[data-zen-label]').textContent,
        mitteilungen: [...w.querySelectorAll('.mitteilung')].map((m) => Number(getComputedStyle(m).opacity)),
        pille: Number(getComputedStyle(w.querySelector('.zen-pille')).opacity),
      };
    });
    let z = await zustand();
    pruefe('Aus: drei Mitteilungen sichtbar, keine Pille', z.zen === 'aus' && z.checked === 'false' && z.mitteilungen.length === 3 && z.mitteilungen.every((o) => o === 1) && z.pille === 0, JSON.stringify(z));
    await seite.locator('[data-zen-schalter]').click();
    z = await zustand();
    pruefe('Klick: Mitteilungen weg, Pille „Zen-Modus“ da, Schalter an, Text „ausschalten“', z.zen === 'an' && z.checked === 'true' && z.mitteilungen.every((o) => o === 0) && z.pille === 1 && z.label === 'Zen-Modus ausschalten', JSON.stringify(z));
    await seite.locator('[data-zen-schalter]').focus();
    await seite.keyboard.press('Space');
    z = await zustand();
    pruefe('Leertaste: wieder aus, Mitteilungen zurück', z.zen === 'aus' && z.mitteilungen.every((o) => o === 1), JSON.stringify(z));
    await ctx.close();
  }
  {
    // Mit Animation: die Mitteilungen verschwinden nacheinander (nicht alle im selben Moment)
    const { seite, ctx } = await oeffne('funktionen/');
    await seite.locator('[data-zen-schalter]').click();
    await seite.waitForTimeout(120);
    const mitte = await seite.evaluate(() => [...document.querySelectorAll('.mitteilung')].map((m) => Number(getComputedStyle(m).opacity)));
    await seite.waitForTimeout(800);
    const ende = await seite.evaluate(() => [...document.querySelectorAll('.mitteilung')].map((m) => Number(getComputedStyle(m).opacity)));
    pruefe('Mit Animation: Mitteilungen gleiten nacheinander weg', new Set(mitte.map((o) => o.toFixed(2))).size > 1 && ende.every((o) => o === 0), `nach 120 ms ${mitte.map((o) => o.toFixed(2))}, danach ${ende}`);
    await ctx.close();
  }

  console.log('\n── Privacy-Modus in zwei Stufen ──');
  // Soll = das Artboard selbst: gen5-referenz.mjs führt priv_js aus gen5.py aus und bedient es
  // mit den Original-Handlern (pick, toggleNotruf). Die Seite wird parallel geklickt, nach
  // jedem Schritt muss jeder Wert des Artboards auf der Seite stimmen (Texte, Listen, Farben
  // als Token, Hebel, Leitungen, Plaketten, LED, Leiste, Notruf-Knopf).
  for (const [thema, breite] of [['dark', 1440], ['light', 1440], ['dark', 390]]) {
    const { seite, ctx, status } = await oeffne('funktionen/', { reducedMotion: 'reduce', colorScheme: thema, viewport: { width: breite, height: 900 } });
    const ab = REF_PRIVACY.artboard(thema);
    const T = REF_PRIVACY.werte({ thema }).t;
    // Farbe im Artboard → Token auf der Seite. Weiss auf Warnung ist bei uns --heat-ink (Kontrast)
    const token = (c) => ({ [T.heat]: 'heat', [T.accent]: 'accent', [T.muted]: 'muted', [T.surface]: 'surface', [T.line]: 'line', [T.raised]: 'raised', [T.ink]: 'ink', [T.bg]: 'bg', '#FFFFFF': 'heat-ink', '#FF9A2E': 'orange', transparent: 'transparent' })[c] ?? `?${c}`;
    // Zwei Bilder warten: global.css lässt bei „weniger Bewegung“ Übergänge von 0.01 ms stehen,
    // direkt nach dem Klick liefert getComputedStyle sonst noch die alte Farbe
    const lese = () => seite.evaluate(async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const w = document.querySelector('[data-privacy-modus]');
      const svgs = [...w.querySelectorAll('[data-privacy-schema]')];
      const svg = svgs.find((x) => getComputedStyle(x).display !== 'none');
      const cs = (el) => getComputedStyle(el);
      const farbe = (v) => { const d = document.createElement('div'); d.style.color = v; w.append(d); const c = cs(d).color; d.remove(); return c; };
      const tokens = Object.fromEntries(['heat', 'accent', 'muted', 'surface', 'line', 'raised', 'ink', 'bg', 'heat-ink'].map((v) => [v, farbe(`var(--${v})`)]));
      tokens.orange = farbe('#FF9A2E'); tokens.transparent = 'rgba(0, 0, 0, 0)';
      const knopf = w.querySelector('[data-notruf-knopf]');
      return {
        tokens,
        sichtbar: svg.classList.contains('breit') ? 'breit' : 'hoch',
        // beide Fassungen des Schemas müssen denselben Zustand tragen
        gleich: svgs.every((x) => x.getAttribute('aria-label') === svg.getAttribute('aria-label')
          && [...x.querySelectorAll('[data-teil]')].map((g) => g.dataset.zustand).join() === [...svg.querySelectorAll('[data-teil]')].map((g) => g.dataset.zustand).join()),
        aria: svg.getAttribute('aria-label'),
        teile: [...svg.querySelectorAll('[data-teil]')].map((g) => ({
          name: g.querySelector('.name').textContent,
          status: g.querySelector('[data-status]').textContent,
          col: cs(g.querySelector('[data-status]')).fill,
          hebel: cs(g.querySelector('.hebel')).transform,
          wire: cs(g.querySelector('.leitung')).stroke,
          dash: cs(g.querySelector('.leitung')).strokeDasharray,
        })),
        gruppen: [...svg.querySelectorAll('[data-gruppe]')].map((g) => ({ txt: g.querySelector('[data-plakette]').textContent, bg: cs(g.querySelector('.plakette')).fill, fg: cs(g.querySelector('[data-plakette]')).fill })),
        mainTxt: svg.querySelector('[data-platine]').textContent,
        ledTxt: svg.querySelector('[data-led-text]').textContent,
        ledCol: cs(svg.querySelector('.led')).fill,
        ledRing: cs(svg.querySelector('.led-ring')).stroke,
        levels: [...w.querySelectorAll('[data-stufe-knopf]')].map((k) => ({ name: k.textContent, pressed: k.getAttribute('aria-pressed'), bg: cs(k).backgroundColor, fg: cs(k).color })),
        levelTxt: w.querySelector('[data-stufe-text]').textContent,
        holdW: w.querySelector('.fuellung').style.width,
        leisteWert: w.querySelector('[data-leiste]').getAttribute('aria-valuenow'),
        works: [...w.querySelectorAll('[data-liste="weiter"] li')].map((li) => li.textContent),
        paused: [...w.querySelectorAll('[data-liste="pausiert"] li')].map((li) => li.textContent),
        nr: {
          pressed: knopf.getAttribute('aria-pressed'), adis: knopf.getAttribute('aria-disabled'), btnTxt: knopf.textContent,
          btnOp: Number(cs(knopf).opacity), btnBg: cs(knopf).backgroundColor, btnFg: cs(knopf).color, btnBd: cs(knopf).borderTopColor,
          bg: cs(w.querySelector('.notruf')).backgroundColor, bd: cs(w.querySelector('.notruf')).borderTopColor,
          txt: w.querySelector('[data-notruf-text]').textContent,
        },
        ansage: w.querySelector('[data-privacy-ansage]').textContent,
      };
    });
    // Vergleich Seite ↔ Artboard, liefert die Liste der Unterschiede
    const vergleiche = (ist, soll) => {
      const d = [];
      const eq = (was, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) d.push(`${was}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
      const farbeEq = (was, a, c) => eq(was, a, ist.tokens[token(c)] ?? `Token ${token(c)}`);
      const offen = (t) => /^matrix\(0\.84\d*, -0\.52\d*/.test(t);
      eq('aria', ist.aria, soll.aria);
      eq('beide Schemas gleich', ist.gleich, true);
      REF_PRIVACY.zeilen.forEach(([name], i) => {
        const a = ist.teile[i], r = soll[`r${i}`];
        eq(`Zeile ${i} Name`, a.name, name);
        eq(`${name} Status`, a.status, r.status);
        farbeEq(`${name} Statusfarbe`, a.col, r.col);
        eq(`${name} Hebel offen`, offen(a.hebel), r.angle === '-32');
        eq(`${name} Hebel zu`, a.hebel === 'none', r.angle === '0');
        farbeEq(`${name} Leitung`, a.wire, r.wire);
        eq(`${name} gestrichelt`, a.dash === 'none' ? 'none' : a.dash.replace(/px/g, '').replace(',', ''), r.dash);
      });
      ['g1', 'g2'].forEach((g, i) => {
        eq(`${g} Plakette`, ist.gruppen[i].txt, soll[g].txt);
        farbeEq(`${g} Plakette Grund`, ist.gruppen[i].bg, soll[g].bg);
        farbeEq(`${g} Plakette Schrift`, ist.gruppen[i].fg, soll[g].fg);
      });
      eq('Platine', ist.mainTxt, soll.mainTxt);
      eq('LED-Text', ist.ledTxt, soll.ledTxt);
      farbeEq('LED', ist.ledCol, soll.ledCol);
      farbeEq('LED-Ring', ist.ledRing, soll.ledRing);
      soll.levels.forEach((lv, i) => {
        eq(`Stufenknopf ${i}`, [ist.levels[i].name, ist.levels[i].pressed], [lv.name, lv.pressed]);
        farbeEq(`Stufenknopf ${i} Grund`, ist.levels[i].bg, lv.bg);
        farbeEq(`Stufenknopf ${i} Schrift`, ist.levels[i].fg, lv.fg);
      });
      eq('Stufentext', ist.levelTxt, soll.levelTxt);
      eq('Halte-Leiste', ist.holdW, soll.holdW);
      eq('Halte-Leiste aria-valuenow', ist.leisteWert, String(['0%', '50%', '100%'].indexOf(soll.holdW) * 2));
      eq('Funktioniert weiter', ist.works, soll.works);
      eq('Pausiert', ist.paused, soll.paused);
      for (const k of ['pressed', 'adis', 'btnTxt', 'btnOp', 'txt']) eq(`Notruf ${k}`, ist.nr[k], soll.nr[k]);
      for (const k of ['btnBg', 'btnFg', 'btnBd', 'bg', 'bd']) farbeEq(`Notruf ${k}`, ist.nr[k], soll.nr[k]);
      return d;
    };
    const stufe = (i) => seite.locator(`[data-stufe-knopf="${i}"]`).click();
    const notruf = () => seite.locator('[data-notruf-knopf]').click({ force: true }); // aria-disabled: force (Stolperstein)
    const beschreibe = (w) => `Stufe ${['0 Aus', '1 Sensoren aus', '2 Funkstille'][w.levels.findIndex((l) => l.pressed === 'true')]}${w.nr.pressed === 'true' ? ' + Notruf' : ''}`;
    const gesehen = new Set();
    // [Schritt, Seite, Artboard]
    const SCHRITTE = [
      ['Laden', async () => {}, () => {}],
      ['Notruf in Stufe Aus', notruf, () => ab.notruf()],
      ['→ Sensoren aus', () => stufe(1), () => ab.pick(1)],
      ['Notruf', notruf, () => ab.notruf()],
      ['→ Funkstille (Notruf bleibt)', () => stufe(2), () => ab.pick(2)],
      ['Notruf beenden', notruf, () => ab.notruf()],
      ['Notruf', notruf, () => ab.notruf()],
      ['→ Sensoren aus (Notruf bleibt)', () => stufe(1), () => ab.pick(1)],
      ['→ Aus (beendet den Notruf)', () => stufe(0), () => ab.pick(0)],
      ['→ Funkstille (ohne Notruf)', () => stufe(2), () => ab.pick(2)],
      ['→ Aus', () => stufe(0), () => ab.pick(0)],
    ];
    const titel = `${breite} px ${thema === 'dark' ? 'dunkel' : 'hell'}`;
    for (const [name, aufSeite, imArtboard] of SCHRITTE) {
      await aufSeite(); imArtboard();
      const soll = ab.werte(), ist = await lese();
      const d = vergleiche(ist, soll);
      gesehen.add(beschreibe(ist));
      if (breite === 1440 && thema === 'dark' || d.length) pruefe(`${titel}, ${name}: ${beschreibe(ist)} = Artboard`, d.length === 0, d.slice(0, 4).join(' | '));
    }
    pruefe(`${titel}: alle Zustände = Artboard: Stufe Aus (auch mit gedrücktem Notruf), Sensoren aus und Funkstille je mit/ohne Notruf`, gesehen.size === 5 && [...gesehen].filter((g) => g.includes('Notruf')).length === 2, [...gesehen].join(', '));
    const ist = await lese();
    pruefe(`${titel}: sichtbar ist das Schema „${breite < 900 ? 'hoch' : 'breit'}“`, ist.sichtbar === (breite < 900 ? 'hoch' : 'breit'));
    if (breite === 390) {
      const seitlich = await seite.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const klein = await seite.evaluate(() => [...document.querySelectorAll('#privacy button')].filter((b) => b.getBoundingClientRect().height < 44).length);
      pruefe('390 px: kein seitliches Scrollen, alle Knöpfe mind. 44 px hoch', seitlich <= 0 && klein === 0, `seitlich ${seitlich}, zu klein ${klein}`);
    }
    pruefe(`${titel}: keine Skriptfehler`, status.fehler.length === 0, status.fehler.join(' | '));
    await ctx.close();
  }
  {
    // Notruf in Stufe „Aus“: markiert, fokussierbar, ohne Wirkung (auch per Tastatur)
    const { seite, ctx } = await oeffne('funktionen/', { reducedMotion: 'reduce' });
    const k = seite.locator('[data-notruf-knopf]');
    const vorher = await seite.locator('[data-privacy-modus]').innerHTML();
    await k.click({ force: true });
    await k.focus();
    await seite.keyboard.press('Enter');
    await seite.keyboard.press('Space');
    const nachher = await seite.locator('[data-privacy-modus]').innerHTML();
    pruefe('Notruf in Stufe Aus: aria-disabled="true", aria-pressed="false", Klick/Enter/Leertaste ändern nichts, keine Ansage',
      (await k.getAttribute('aria-disabled')) === 'true' && (await k.getAttribute('aria-pressed')) === 'false' && vorher === nachher && (await k.evaluate((e) => e === document.activeElement)));
    await ctx.close();
  }
  {
    // Nur Tastatur: Tab-Reihenfolge = HTML-Reihenfolge, Enter und Leertaste
    const { seite, ctx } = await oeffne('funktionen/', { reducedMotion: 'reduce' });
    const fokus = () => seite.evaluate(() => {
      const a = document.activeElement;
      return a.dataset.stufeKnopf !== undefined ? `stufe${a.dataset.stufeKnopf}` : a.hasAttribute('data-notruf-knopf') ? 'notruf' : a.tagName;
    });
    const zustand = () => seite.evaluate(() => { const w = document.querySelector('[data-privacy-modus]'); return `${w.dataset.stufe}/${w.dataset.notruf}`; });
    const ansage = () => seite.locator('[data-privacy-ansage]').textContent();
    // Start auf dem ersten Knopf (ein Klick auf die Überschrift träfe die klebende Kopfzeile)
    await seite.locator('[data-stufe-knopf="0"]').focus();
    const weg = [await fokus()];
    await seite.keyboard.press('Tab'); weg.push(await fokus());
    await seite.keyboard.press('Enter'); weg.push(await zustand());
    const a1 = await ansage();
    await seite.keyboard.press('Tab'); weg.push(await fokus());
    await seite.keyboard.press('Space'); weg.push(await zustand());
    await seite.keyboard.press('Tab'); weg.push(await fokus());
    await seite.keyboard.press('Enter'); weg.push(await zustand());
    const a2 = await ansage();
    await seite.keyboard.press('Space'); weg.push(await zustand());
    await seite.keyboard.press('Shift+Tab'); await seite.keyboard.press('Shift+Tab'); await seite.keyboard.press('Shift+Tab'); weg.push(await fokus());
    await seite.keyboard.press('Enter'); weg.push(await zustand());
    const soll = ['stufe0', 'stufe1', '1/false', 'stufe2', '2/false', 'notruf', '2/true', '2/false', 'stufe0', '0/false'];
    pruefe('Nur Tastatur: Tab → Aus → Sensoren aus (Enter) → Funkstille (Leertaste) → Notruf (Enter an, Leertaste aus) → zurück auf Aus', JSON.stringify(weg) === JSON.stringify(soll), weg.join(' '));
    pruefe('Ansagen (aria-live): Stufe und Notruf werden vorgelesen', a1.startsWith('Sensoren aus.') && a2.startsWith('Mobilfunk, Mikrofon und GPS sind wieder verbunden'), `${a1.slice(0, 40)} | ${a2.slice(0, 40)}`);
    const halten = await seite.locator('[data-leiste]').evaluate((e) => [e.getAttribute('role'), e.getAttribute('aria-valuetext'), document.getElementById(e.getAttribute('aria-labelledby'))?.textContent]);
    pruefe('Halte-Leiste: progressbar „Action-Button halten“ mit Klartext', halten[0] === 'progressbar' && halten[1] === '0 s' && halten[2] === 'Action-Button halten', halten.join(' | '));
    await ctx.close();
  }
  {
    // Mit Bewegung blinkt der Punkt der Platine in Stufe 2, ohne nicht
    const { seite, ctx } = await oeffne('funktionen/');
    await seite.locator('[data-stufe-knopf="2"]').click();
    const led = () => seite.evaluate(() => getComputedStyle([...document.querySelectorAll('[data-privacy-schema]')].find((s) => getComputedStyle(s).display !== 'none').querySelector('.led')).animationName);
    const blinkt = await led();
    await seite.locator('[data-stufe-knopf="1"]').click();
    const ruhig = await led();
    pruefe('Platine: Stufe 2 blinkt kurz, Stufe 1 ruhig', blinkt.includes('privacy-blinkt') && ruhig === 'none', `${blinkt} / ${ruhig}`);
    await ctx.close();
  }

  console.log('\n── Zubehör ──');
  {
    const { seite, ctx, status } = await oeffne('zubehoer/');
    const sichtbar = () => seite.evaluate(() => [...document.querySelectorAll('[data-produkte] .karte')].filter((k) => !k.hidden).map((k) => k.dataset.modell ?? 'platzhalter'));
    pruefe('Alle: zwei Hüllen und die Platzhalter-Kachel „[Weiteres Zubehör]“', JSON.stringify(await sichtbar()) === '["k1","pro","platzhalter"]' && (await seite.locator('.platzhalter h2').textContent()) === '[Weiteres Zubehör]');
    await seite.locator('[data-filter="k1"]').click();
    pruefe('Filter „für Kiesel 1“: nur Kiesel-1-Hülle und Platzhalter', JSON.stringify(await sichtbar()) === '["k1","platzhalter"]', JSON.stringify(await sichtbar()));
    await seite.locator('[data-filter="alle"]').click();
    await seite.locator('[data-kaufen][data-modell="pro"]').click();
    const korb = await warenkorb(seite);
    // Seit Etappe 6 steht im Speicher nur die Wahl, kein Preis (der kommt aus data/preise.js)
    pruefe('„In den Warenkorb“ (Pro-Karte): genau diese Hülle, ohne Preis im Speicher', korb.length === 1 && korb[0].art === 'case' && korb[0].modell === 'pro' && korb[0].farbe === 'matte-black' && !('preis' in korb[0]) && korb[0].anzahl === 1, JSON.stringify(korb));
    pruefe('Knopf meldet „Im Warenkorb ✓“, Zähler oben zeigt 1', (await seite.locator('[data-kaufen][data-modell="pro"]').textContent()).includes('Im Warenkorb') && (await zaehlerOben(seite)) === '1', await zaehlerOben(seite));
    await seite.locator('input[name="kombi-huelle"][value="pebble-beige"]').check({ force: true });
    await seite.locator('input[name="kombi-handy"][value="matte-black"]').check({ force: true });
    const kombi = await seite.evaluate(() => ({ label: document.querySelector('[data-kombi-handy] svg').getAttribute('aria-label'), link: document.querySelector('[data-kombi-kaufen]').getAttribute('href') }));
    pruefe('Frei kombinieren: Handy neu gezeichnet, Link zum Kaufen nachgeführt', kombi.label.includes('Mattschwarz') && kombi.label.includes('Kieselbeige') && kombi.link.includes('farbe=matte-black') && kombi.link.includes('huelle=pebble-beige'), JSON.stringify(kombi));
    pruefe('Keine Skriptfehler, kein three.js, kein Platzhalter', status.fehler.length === 0 && !status.dreiD && !(await seite.content()).includes('Inhalt folgt'), status.fehler.join(' | '));
    await ctx.close();
  }

  console.log('\n── Kiesel-Hülle ──');
  {
    const { seite, ctx, status } = await oeffne('zubehoer/huelle/?modell=k1&farbe=Mattschwarz');
    const bild = () => seite.evaluate(() => document.querySelector('[data-huelle-handy] svg').getAttribute('aria-label'));
    const gedrueckt = (sel) => seite.evaluate((sel) => [...document.querySelectorAll(sel)].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent.trim()), sel);
    pruefe('Vorwahl aus der Adresse: Kiesel 1, Hülle Mattschwarz', (await bild()).startsWith('Kiesel 1 in') && (await bild()).includes('Hülle in Mattschwarz') && (await gedrueckt('[data-modell-wahl]'))[0].startsWith('Kiesel 1'), await bild());
    await seite.locator('[data-modell-wahl="pro"]').click();
    await seite.locator('[data-ansicht="vorne"]').click();
    pruefe('Modell Pro und Vorderseite', (await bild()).startsWith('Kiesel 1 Pro') && (await bild()).endsWith('Vorderseite') && (await gedrueckt('[data-ansicht]'))[0] === 'Vorderseite', await bild());
    await seite.locator('input[name="huelle-farbe"][value="sky-blue"]').check({ force: true });
    await seite.locator('input[name="huelle-vorschau"][value="pebble-beige"]').check({ force: true });
    pruefe('Hüllenfarbe und Vorschau-Handyfarbe unabhängig', (await bild()).includes('Kiesel 1 Pro in Kieselbeige mit Hülle in Himmelblau'), await bild());
    await seite.locator('[data-huelle-kaufen]').click();
    const korb = await warenkorb(seite);
    const a = korb[0] ?? {};
    pruefe('Warenkorb: Pro-Hülle in Himmelblau, ohne Vorschau-Handyfarbe', korb.length === 1 && a.art === 'case' && a.modell === 'pro' && a.farbe === 'sky-blue' && !JSON.stringify(a).includes('pebble-beige'), JSON.stringify(korb));
    await seite.locator('[data-huelle-kaufen]').click();
    pruefe('Zweimal: gleiche Hülle, Anzahl 2', (await warenkorb(seite))[0]?.anzahl === 2 && (await zaehlerOben(seite)) === '2');
    const details = await seite.evaluate(() => Object.fromEntries([...document.querySelectorAll('.details div')].map((d) => [d.querySelector('dt').textContent, d.querySelector('dd').textContent])));
    pruefe('Technische Details: „[Material]“ als Platzhalter, Preis CHF 59.–', details.Material === '[Material]' && details.Preis === 'CHF 59.–' && Object.keys(details).length === 7, JSON.stringify(details));
    pruefe('Drei Eigenschafts-Kacheln', (await seite.locator('main article.kachel').count()) === 3);
    pruefe('Keine Skriptfehler, kein three.js, kein Platzhalter', status.fehler.length === 0 && !status.dreiD && !(await seite.content()).includes('Inhalt folgt'), status.fehler.join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
