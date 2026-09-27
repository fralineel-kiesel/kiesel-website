// Warenkorb im localStorage des Browsers.
// Etappe 1 braucht nur den Zähler in der Kopfzeile. Hinzufügen, Ändern und
// Entfernen kommen in Etappe 6 dazu, dann mit demselben Speicherformat:
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
