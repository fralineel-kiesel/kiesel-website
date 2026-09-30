// Datum und Uhrzeit auf dem Sperrbildschirm, für die 2D-Zeichnung (frontSvg in phone.js) und die
// 3D-Textur (zeichneBildschirm in kiesel-3d/texturen.js). Eigene kleine Datei, damit 3D nicht
// den ganzen Zeichen-Motor laden muss.
// Der Moment ist fest: Freitag, 25. September 2026, 07:32 (wie in lib.py). Geschrieben wird er
// in der Sprache der Seite (lib/format.js), Deutsch: „Freitag, 25. September“ und „07:32“,
// Englisch: „Friday, September 25“ und „7:32“ (ohne AM/PM, wie auf jedem Sperrbildschirm).
import { datum, uhrzeit } from '../format.js';

export const SPERRZEIT = new Date(Date.UTC(2026, 8, 25, 7, 32));

export const sperrbildschirm = (sprache = 'de') => ({ datum: datum(SPERRZEIT, sprache), uhrzeit: uhrzeit(SPERRZEIT, sprache, true) });
