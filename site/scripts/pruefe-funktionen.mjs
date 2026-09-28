// Prüft /funktionen/, /zubehoer/ und /zubehoer/huelle/ (Etappe 5) im echten Browser:
//
//   npm run pruefe:funktionen
//
// 1. RGB-Licht: jeder Knopf zeichnet die LED in der Farbe aus data/funktionen.js, mit dem
//    richtigen Rhythmus (Animation), „Aus“ ohne Leuchthof; Tastatur; bei „weniger Bewegung“
//    keine Animation.
// 2. Zen-Modus: Schalter (Maus und Tastatur) blendet die drei Mitteilungen aus und die Pille ein.
// 3. Privacy-Modus: Schalter klappt die drei Hebel auf, Status „getrennt“, Platine orange.
// 4. Zubehör: Filter, Platzhalter-Kachel bleibt, „In den Warenkorb“ legt genau die gezeigte Hülle
//    hinein (Zähler oben zählt), „Frei kombinieren“ zeichnet neu und führt den Link nach.
// 5. Hülle: Vorwahl aus der Adresse, Modell, Ansicht, Farben; Warenkorb nur mit Modell und
//    Hüllenfarbe, nie mit der Vorschau-Handyfarbe; Platzhalter „[Material]“.
// Dazu: Sprungmarken, keine Skriptfehler, kein three.js, kein „Inhalt folgt“.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { RGB } from '../src/data/funktionen.js';

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
      const erwartetAnimation = { schnell: 'schnell', zweimal: 'zweimal', atmen: 'atmen', langsam: 'langsam', ruhig: 'none', aus: 'none' }[e.rhythmus];
      const ok = gedrueckt === 'true' && l.titel === e.titel && l.rhythmus === e.rhythmus
        && (e.color ? l.farbe?.toUpperCase() === e.color.toUpperCase() : l.farbe === null)
        && l.animation.includes(erwartetAnimation);
      pruefe(`${e.name}: LED ${e.color ?? 'aus'}, Rhythmus „${e.rhythmus}“, Karte „${e.titel}“`, ok, JSON.stringify(l));
    }
    // Tastatur: Tab auf den ersten Knopf, Enter
    await seite.locator('[data-ereignis="msg"]').focus();
    await seite.keyboard.press('Enter');
    pruefe('Tastatur: Enter wählt das Ereignis', (await led()).titel === RGB.ereignisse.msg.titel);
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

  console.log('\n── Privacy-Modus ──');
  {
    const { seite, ctx } = await oeffne('funktionen/', { reducedMotion: 'reduce' });
    const zustand = () => seite.evaluate(() => {
      const w = document.querySelector('[data-privacy-modus]');
      return {
        checked: w.querySelector('[data-privacy-schalter]').getAttribute('aria-checked'),
        label: w.querySelector('[data-privacy-label]').textContent,
        hebel: [...w.querySelectorAll('.hebel')].map((h) => getComputedStyle(h).transform),
        status: [...w.querySelectorAll('[data-status]')].map((t) => t.textContent),
        platine: w.querySelector('[data-platine]').textContent,
        anzeige: getComputedStyle(w.querySelector('.anzeige')).fill,
        leitung: getComputedStyle(w.querySelector('.leitung')).strokeDasharray,
      };
    });
    let z = await zustand();
    pruefe('Aus: Hebel zu, alles „verbunden“', z.checked === 'false' && z.hebel.every((t) => t === 'none') && z.status.every((t) => t === 'verbunden') && z.platine === 'alles verbunden', JSON.stringify(z));
    await seite.locator('[data-privacy-schalter]').click();
    z = await zustand();
    // rotate(-32deg) = matrix(cos, sin, …) mit sin(-32°) ≈ -0.53
    const offen = z.hebel.every((t) => /matrix\(0\.84\d*, -0\.52\d*/.test(t));
    pruefe('An: drei Hebel offen (−32°), „getrennt“, Leitungen gestrichelt, Platine läuft weiter', z.checked === 'true' && offen && z.status.length === 3 && z.status.every((t) => t === 'getrennt') && z.platine === 'läuft weiter' && z.leitung !== 'none' && z.label === 'Privacy-Modus ausschalten', JSON.stringify(z));
    pruefe('An: Punkt auf der Platine leuchtet orange wie die LED im Privacy-Modus', z.anzeige === 'rgb(255, 154, 46)', z.anzeige);
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
    pruefe('„In den Warenkorb“ (Pro-Karte): genau diese Hülle, ohne Preis im Speicher', korb.length === 1 && korb[0].art === 'huelle' && korb[0].modell === 'pro' && korb[0].farbe === 'Mattschwarz' && !('preis' in korb[0]) && korb[0].anzahl === 1, JSON.stringify(korb));
    pruefe('Knopf meldet „Im Warenkorb ✓“, Zähler oben zeigt 1', (await seite.locator('[data-kaufen][data-modell="pro"]').textContent()).includes('Im Warenkorb') && (await zaehlerOben(seite)) === '1', await zaehlerOben(seite));
    await seite.locator('input[name="kombi-huelle"][value="Kieselbeige"]').check({ force: true });
    await seite.locator('input[name="kombi-handy"][value="Mattschwarz"]').check({ force: true });
    const kombi = await seite.evaluate(() => ({ label: document.querySelector('[data-kombi-handy] svg').getAttribute('aria-label'), link: document.querySelector('[data-kombi-kaufen]').getAttribute('href') }));
    pruefe('Frei kombinieren: Handy neu gezeichnet, Link zum Kaufen nachgeführt', kombi.label.includes('Mattschwarz') && kombi.label.includes('Kieselbeige') && kombi.link.includes('farbe=Mattschwarz') && kombi.link.includes('huelle=Kieselbeige'), JSON.stringify(kombi));
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
    await seite.locator('input[name="huelle-farbe"][value="Himmelblau"]').check({ force: true });
    await seite.locator('input[name="huelle-vorschau"][value="Kieselbeige"]').check({ force: true });
    pruefe('Hüllenfarbe und Vorschau-Handyfarbe unabhängig', (await bild()).includes('Kiesel 1 Pro in Kieselbeige mit Hülle in Himmelblau'), await bild());
    await seite.locator('[data-huelle-kaufen]').click();
    const korb = await warenkorb(seite);
    const a = korb[0] ?? {};
    pruefe('Warenkorb: Pro-Hülle in Himmelblau, ohne Vorschau-Handyfarbe', korb.length === 1 && a.art === 'huelle' && a.modell === 'pro' && a.farbe === 'Himmelblau' && !JSON.stringify(a).includes('Kieselbeige'), JSON.stringify(korb));
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
