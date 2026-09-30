// Prüft die FAQ (/faq/ und die vier Fragen auf der Startseite) im echten Browser:
//
//   npm run pruefe:faq
//
// 1. Daten: Fragen, Antworten und Themen = FAQ aus design/generator/gen4.py (Zeichen für Zeichen).
// 2. Akkordeon: aria-expanded, aria-controls → vorhandene Antwort, Maus und Tastatur (Tab, Enter,
//    Leertaste), Sprungziele (#privacy, #konzept) öffnen ihre Frage.
// 3. Suche (auch ohne Umlaute) und Themen-Chips, „Nichts gefunden“, Anzahl für Screenreader.
// 4. Links in Antworten (Akku-Rechner, Privacy-Modus …), „Frage auf GitHub stellen“ (neuer Tab,
//    rel="noopener"), strukturierte Daten (JSON-LD FAQPage = die Fragen auf der Seite).
// Jeder Fall druckt ✓ oder ✗, bei einem ✗ endet das Skript mit Fehlercode 1.
import { chromium } from 'playwright';
import { starteServer } from './dist-server.mjs';
import { referenz } from './gen4-referenz.mjs';
import { FAQ, THEMEN } from '../src/data/faq.js';
import { faqThemen } from '../src/i18n/de.js';
import { faqMitAbweichungen, FAQ_ABWEICHUNGEN } from './abweichungen.mjs';

let fehler = 0;
function pruefe(name, ok, info = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${info ? `  (${info})` : ''}`);
  if (!ok) fehler++;
}

console.log('── Daten ──');
// Vorlage plus die bewussten Änderungen aus abweichungen.mjs (Etappe 8b: Privacy, Notruf)
const ref = faqMitAbweichungen(referenz().daten.FAQ);
// Themen sind Kennungen (Etappe 9a), das Artboard kennt nur die deutschen Namen
const unsere = FAQ.map((f) => [faqThemen[f.thema], f.frage, f.antwort]);
const abw = ref.map((r, i) => (JSON.stringify(r) === JSON.stringify(unsere[i]) ? null : `${i}: ${JSON.stringify(r)} ≠ ${JSON.stringify(unsere[i])}`)).filter(Boolean);
pruefe(`faq.js = FAQ aus gen4.py + ${FAQ_ABWEICHUNGEN.length} Abweichungen (${ref.length} Fragen, Zeichen für Zeichen)`, abw.length === 0 && ref.length === FAQ.length, abw[0] ?? '');
pruefe('Themen wie im Artboard', JSON.stringify(THEMEN.map((id) => faqThemen[id])) === JSON.stringify([...new Set(ref.map((r) => r[0]))]));
pruefe('IDs eindeutig', new Set(FAQ.map((f) => f.id)).size === FAQ.length);

console.log('\n── Seite /faq/ ──');
const browser = await chromium.launch();
const { basis, schliessen } = await starteServer();
async function oeffne(adresse, kontext = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...kontext });
  const seite = await ctx.newPage();
  const status = { fehler: [] };
  seite.on('pageerror', (e) => status.fehler.push(e.message));
  await seite.goto(basis + adresse, { waitUntil: 'load' });
  return { seite, ctx, status };
}
const sichtbar = (seite) => seite.evaluate(() => [...document.querySelectorAll('[data-eintrag]')].filter((e) => !e.hidden).map((e) => e.dataset.eintrag));
const offen = (seite) => seite.evaluate(() => [...document.querySelectorAll('[data-eintrag] button[aria-expanded="true"]')].map((b) => b.closest('[data-eintrag]').dataset.eintrag));
const suche = async (seite, text) => { await seite.locator('[data-suche]').fill(text); };

try {
  const { seite, ctx, status } = await oeffne('faq/');
  pruefe(`${FAQ.length} Fragen als Überschrift mit Knopf, die erste offen`, await seite.locator('[data-faq] h2.frage button').count() === FAQ.length && JSON.stringify(await offen(seite)) === '["kaufen"]');
  const verbunden = await seite.evaluate(() => [...document.querySelectorAll('[data-faq] button[aria-controls]')].every((b) => {
    const a = document.getElementById(b.getAttribute('aria-controls'));
    return a && a.getAttribute('role') === 'region' && a.getAttribute('aria-labelledby') === b.id && a.hidden === (b.getAttribute('aria-expanded') !== 'true');
  }));
  pruefe('aria-controls zeigt auf die Antwort, hidden passt zu aria-expanded', verbunden);

  // Maus
  await seite.getByRole('button', { name: /Wie lange hält der Akku/ }).click();
  pruefe('Klick öffnet „Wie lange hält der Akku?“', (await offen(seite)).includes('akku'));
  const akkuLink = await seite.locator('#akku .antwort a').first();
  pruefe('Antwort verlinkt „Akku-Rechner“ im Satz auf /akku-rechner/', (await akkuLink.textContent()) === 'Akku-Rechner' && (await akkuLink.getAttribute('href')).endsWith('/akku-rechner/'));

  // Tastatur
  await seite.locator('#faq-dicke-knopf').focus();
  await seite.keyboard.press('Tab');
  const fokus = await seite.evaluate(() => document.activeElement.id);
  await seite.keyboard.press('Enter');
  const nachEnter = await offen(seite);
  await seite.keyboard.press('Space');
  const nachSpace = await offen(seite);
  pruefe('Tastatur: Tab zur nächsten Frage, Enter öffnet, Leertaste schliesst', fokus === 'faq-klinke-knopf' && nachEnter.includes('klinke') && !nachSpace.includes('klinke'), fokus);

  // Suche und Themen
  await suche(seite, 'Hülle');
  const s1 = await sichtbar(seite);
  await suche(seite, 'hulle');
  const s2 = await sichtbar(seite);
  pruefe('Suche „Hülle“ und „hulle“ finden dieselbe Frage', JSON.stringify(s1) === '["huelle"]' && JSON.stringify(s2) === '["huelle"]', `${s1} / ${s2}`);
  pruefe('Anzahl wird vorgelesen („1 Frage“, aria-live)', (await seite.locator('[data-anzahl]').textContent()) === '1 Frage' && (await seite.locator('[data-anzahl]').getAttribute('aria-live')) === 'polite');
  await suche(seite, 'Zeitmaschine');
  pruefe('Kein Treffer: „Nichts gefunden“ sichtbar', (await sichtbar(seite)).length === 0 && await seite.locator('[data-nichts]').isVisible());
  await suche(seite, '');
  await seite.getByRole('button', { name: 'Handys', exact: true }).last().click();
  const handys = await sichtbar(seite);
  const soll = FAQ.filter((f) => f.thema === 'phones').map((f) => f.id);
  pruefe(`Chip „Handys“: ${soll.length} Fragen, Chip gedrückt`, JSON.stringify(handys) === JSON.stringify(soll) && (await seite.locator('[data-thema-wahl="phones"]').getAttribute('aria-pressed')) === 'true', handys.join(', '));
  await suche(seite, 'akku');
  const kombi = await sichtbar(seite);
  pruefe('Thema und Suche zusammen: „Handys“ + „akku“', kombi.length > 0 && kombi.every((id) => soll.includes(id)), kombi.join(', '));
  await seite.locator('[data-thema-wahl="alle"]').click();
  await suche(seite, '');
  pruefe('„Alle“ zeigt wieder alles, keine Ansage', (await sichtbar(seite)).length === FAQ.length && (await seite.locator('[data-anzahl]').textContent()) === '');

  // Links
  await seite.locator('#faq-privacy-knopf').click();
  const pl = seite.locator('#privacy .antwort a');
  pruefe('Privacy-Modus: Link „Privacy-Modus ausprobieren“ auf /funktionen/#privacy', (await pl.textContent()).includes('Privacy-Modus ausprobieren') && (await pl.getAttribute('href')).endsWith('/funktionen/#privacy'));
  const gh = seite.getByRole('link', { name: /Frage auf GitHub stellen/ });
  pruefe('„Frage auf GitHub stellen“: issues/new, neuer Tab, rel="noopener", sagt „öffnet in neuem Tab“',
    (await gh.getAttribute('href')) === 'https://github.com/fralineel-kiesel/kiesel-website/issues/new' && (await gh.getAttribute('target')) === '_blank' && (await gh.getAttribute('rel')) === 'noopener' && (await gh.textContent()).includes('öffnet in neuem Tab'));

  // JSON-LD
  const ld = await seite.evaluate(() => [...document.querySelectorAll('head script[type="application/ld+json"]')].map((s) => s.textContent));
  let daten = null;
  try { daten = JSON.parse(ld[0]); } catch {}
  const gleich = daten && daten['@type'] === 'FAQPage' && daten['@context'] === 'https://schema.org' && daten.mainEntity.length === FAQ.length &&
    daten.mainEntity.every((q, i) => q['@type'] === 'Question' && q.name === FAQ[i].frage && q.acceptedAnswer['@type'] === 'Answer' && q.acceptedAnswer.text === FAQ[i].antwort);
  pruefe('JSON-LD im <head>: FAQPage mit allen Fragen und Antworten wie auf der Seite', ld.length === 1 && gleich);
  const sichtbarerText = await seite.locator('[data-faq]').innerText();
  pruefe('Jede Frage im JSON-LD steht auch sichtbar auf der Seite', daten.mainEntity.every((q) => sichtbarerText.includes(q.name)));
  // Gegen das DOM, nicht gegen faq.js: gleiche Fragen in gleicher Reihenfolge, jede Antwort
  // steht so im Akkordeon (dort evtl. mit einem Link danach). Fällt z.B. durch, wenn eine
  // neue Frage nur im JSON-LD oder nur auf der Seite landet.
  const dom = await seite.evaluate(() => [...document.querySelectorAll('[data-faq] [data-eintrag]')].map((e) => ({
    frage: e.querySelector('.frage button .f').textContent.replace(/\s+/g, ' ').trim(),
    antwort: e.querySelector('.antwort').textContent.replace(/\s+/g, ' ').trim(),
  })));
  const ldFragen = daten.mainEntity.map((q) => q.name);
  pruefe(`JSON-LD = sichtbare Fragen (${dom.length}), gleiche Reihenfolge, auch die Notruf-Frage`,
    JSON.stringify(ldFragen) === JSON.stringify(dom.map((d) => d.frage)) && ldFragen.includes('Kann ich im Privacy-Modus den Notruf wählen?'), `${ldFragen.length} im JSON-LD`);
  const falsch = daten.mainEntity.filter((q, i) => !dom[i]?.antwort.startsWith(q.acceptedAnswer.text)).map((q) => q.name);
  pruefe('JSON-LD-Antworten = sichtbare Antworten', falsch.length === 0, falsch.join(' | '));
  pruefe('Keine Skriptfehler', status.fehler.length === 0, status.fehler.join(' | '));
  await ctx.close();

  // Sprungziele
  for (const [anker, id] of [['privacy', 'privacy'], ['konzept', 'konzept']]) {
    const { seite, ctx } = await oeffne(`faq/#${anker}`);
    pruefe(`faq/#${anker} öffnet „${FAQ.find((f) => f.id === id).frage}“`, (await offen(seite)).includes(id));
    await ctx.close();
  }
  {
    const { seite, ctx } = await oeffne('');
    const ueber = await seite.locator('footer a', { hasText: 'Über das Konzept' }).getAttribute('href');
    const start = await seite.evaluate(() => [...document.querySelectorAll('[data-eintrag]')].map((e) => e.dataset.eintrag));
    pruefe('Startseite: die vier ausgewählten Fragen', JSON.stringify(start) === JSON.stringify(FAQ.filter((f) => f.startseite).map((f) => f.id)), start.join(', '));
    pruefe('Footer „Über das Konzept“ → faq/#konzept', ueber.endsWith('/faq/#konzept'));
    await ctx.close();
  }
  {
    const { seite, ctx, status } = await oeffne('faq/', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await seite.getByRole('button', { name: /Wie schnell lädt/ }).tap();
    pruefe('390 px: kein seitliches Scrollen, Antippen öffnet', (await seite.evaluate(() => document.documentElement.scrollWidth)) <= 390 && (await offen(seite)).includes('laden') && status.fehler.length === 0);
    await ctx.close();
  }
} finally {
  await browser.close();
  await schliessen();
}

console.log(fehler ? `\n✗ ${fehler} Prüfung(en) fehlgeschlagen` : '\n✓ Alles bestanden');
process.exit(fehler ? 1 : 0);
