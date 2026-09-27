// Warenkorb im localStorage des Browsers.
// Lesen und Zählen (Kopfzeile) seit Etappe 1, Hinzufügen seit Etappe 5 (Hülle).
// Ändern und Entfernen kommen mit Warenkorb-Seite und Schublade in Etappe 6 dazu,
// mit demselben Speicherformat:
//   localStorage["kiesel-warenkorb"] = '[{"id":"…","anzahl":1, …}, …]'

const SCHLUESSEL = 'kiesel-warenkorb';
export const EREIGNIS = 'kiesel:warenkorb'; // wird ausgelöst, wenn sich der Inhalt ändert

export function lesen() {
  try {
    const liste = JSON.parse(localStorage.getItem(SCHLUESSEL) || '[]');
    return Array.isArray(liste) ? liste : [];
  } catch {
    // localStorage kann gesperrt sein (privates Fenster) oder Unsinn enthalten
    return [];
  }
}

export function anzahl() {
  return lesen().reduce((summe, artikel) => summe + (Number(artikel.anzahl) || 0), 0);
}

// Andere Teile der Seite (z.B. der Zähler) hören auf dieses Ereignis.
// "storage" kommt vom Browser, wenn ein anderer Tab den Warenkorb geändert hat.
export function beiAenderung(rueckruf) {
  window.addEventListener(EREIGNIS, rueckruf);
  window.addEventListener('storage', (e) => { if (e.key === SCHLUESSEL) rueckruf(); });
}

// Artikel hinzufügen. Gleiche id = gleicher Artikel, dann nur die Anzahl erhöhen.
//   artikel: { id, name, preis, … }  z.B. { id: 'huelle-pro-mattweiss', name: 'Kiesel-Hülle',
//            preis: 59, modell: 'pro', farbe: 'Mattweiss' }   anzahl: wie viele dazu
// Rückgabe: true = gespeichert, false = localStorage gesperrt (privates Fenster, voll)
export function hinzufuegen(artikel, anzahl = 1) {
  const liste = lesen();
  const vorhanden = liste.find((a) => a.id === artikel.id);
  if (vorhanden) vorhanden.anzahl = (Number(vorhanden.anzahl) || 0) + anzahl;
  else liste.push({ ...artikel, anzahl });
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(liste));
  } catch {
    return false;
  }
  window.dispatchEvent(new CustomEvent(EREIGNIS));
  return true;
}
