// Modale Dialoge (Warenkorb-Schublade, Kasse) mit sauberer Fokus-Verwaltung.
//
// Grundlage ist <dialog> mit showModal(). Das bringt der Browser schon mit:
//   • die ganze Seite dahinter wird „inert“: nicht klickbar, nicht fokussierbar und für
//     Screenreader unsichtbar, solange der Dialog offen ist
//   • Escape schliesst (Ereignis „cancel“, dann „close“)
//   • ::backdrop ist der Schleier dahinter
// Dazu kommt hier:
//   1. Fokus hinein: auf das Element mit [autofocus] oder das erste bedienbare Element.
//      Sonst sitzt der Tastatur-Cursor noch auf dem Knopf hinter dem Schleier.
//   2. Tab-Kreisel: Tab auf dem letzten Element springt zum ersten, Umschalt+Tab umgekehrt.
//      Ohne das liesse der Browser Tab kurz in die Adresszeile entwischen.
//   3. Fokus zurück: beim Schliessen auf den Knopf, der den Dialog geöffnet hat. Sonst landet
//      er auf <body>, also ganz oben auf der Seite, und man muss den Weg neu suchen.
//      Gibt es den Knopf nicht mehr (z.B. nach „Warenkorb leeren“), fragt modal() nach einem Ersatz.
//   4. Klick auf den Schleier schliesst, die Seite dahinter scrollt nicht mit.
//
//   const m = modal(dialog, { ersatz: () => element, beiOeffnen, beiSchliessen })
//   m.oeffnen(ausloeser)   m.schliessen()   m.offen
const offen = new Set(); // mehrere Dialoge können übereinander liegen (Kasse über Schublade)

// Alle Elemente, die Tab im Dialog erreicht, in Tab-Reihenfolge (= HTML-Reihenfolge,
// wir setzen nirgends tabindex > 0)
export function tabbar(wurzel) {
  return [...wurzel.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter((el) => {
    if (el.disabled || el.tabIndex < 0) return false;
    if (el.closest('[hidden], [inert]')) return false;
    if (!el.getClientRects().length) return false; // display: none
    // Von einer Radio-Gruppe ist nur der gewählte Knopf per Tab erreichbar (Pfeiltasten wechseln)
    if (el.type === 'radio' && !el.checked) {
      const gruppe = wurzel.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
      if ([...gruppe].some((r) => r.checked)) return false;
    }
    return true;
  });
}

export function modal(dialog, { ersatz = () => null, beiOeffnen = () => {}, beiSchliessen = () => {} } = {}) {
  let ausloeser = null;

  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const liste = tabbar(dialog);
    if (!liste.length) return;
    const erstes = liste[0];
    const letztes = liste[liste.length - 1];
    const hier = document.activeElement;
    if (e.shiftKey && (hier === erstes || !dialog.contains(hier))) {
      e.preventDefault();
      letztes.focus();
    } else if (!e.shiftKey && (hier === letztes || !dialog.contains(hier))) {
      e.preventDefault();
      erstes.focus();
    }
  });

  // Klick auf den Schleier: Der gehört zum <dialog>, liegt aber ausserhalb seines Rechtecks
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const draussen = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (draussen) dialog.close();
  });

  dialog.addEventListener('close', () => {
    offen.delete(dialog);
    if (!offen.size) document.documentElement.style.overflow = '';
    ausloeser?.setAttribute?.('aria-expanded', 'false');
    beiSchliessen();
    // Fokus zurück, falls der Auslöser noch da und sichtbar ist, sonst auf den Ersatz
    const ziel = ausloeser?.isConnected && ausloeser.getClientRects().length && !ausloeser.closest('[inert]') ? ausloeser : ersatz();
    ausloeser = null;
    ziel?.focus();
  });

  return {
    get offen() { return dialog.open; },
    oeffnen(von = document.activeElement) {
      if (dialog.open) return;
      ausloeser = von instanceof HTMLElement ? von : null;
      if (ausloeser?.hasAttribute('aria-expanded')) ausloeser.setAttribute('aria-expanded', 'true');
      beiOeffnen();
      offen.add(dialog);
      document.documentElement.style.overflow = 'hidden'; // Seite dahinter scrollt nicht mit
      dialog.showModal();
      // showModal() fokussiert selbst das erste Element; wir wählen ausdrücklich
      const start = dialog.querySelector('[autofocus]') ?? tabbar(dialog)[0];
      start?.focus();
    },
    schliessen() { if (dialog.open) dialog.close(); },
  };
}
