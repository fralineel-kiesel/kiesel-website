# Kiesel

Fan-Konzept-Website für zwei fiktive Handys, **Kiesel 1** und **Kiesel 1 Pro**. Hobbyprojekt, kein echtes Produkt; Footer sagt das auch. Der Nutzer lernt Informatik: Änderungen kurz begründen.

## Eckdaten (Quelle der Wahrheit: `js/daten.js` + Tabelle in `index.html`)

|                | Kiesel 1 | Kiesel 1 Pro |
|----------------|----------|--------------|
| Grösse wie     | iPhone SE (2016) | iPhone 13 mini |
| Masse          | 123.8 × 58.6 × 9 mm | 131.5 × 64.2 × 9 mm |
| Gewicht        | ca. 140 g | ca. 170 g |
| Display        | ca. 4.7″ OLED, LTPO 1–90 Hz | ca. 5.4″ OLED, LTPO 1–90 Hz |
| Akku           | ca. 3000 mAh | ca. 3600 mAh |
| Kameras        | 1: variabel 0.5x–1x, 50 MP, Makro | dazu 3x-Tele (78 mm), OIS, Nahfokus ab 20 cm |
| Zoom           | digital bis 5x | optisch 3x, digital bis 10x |
| Kühlung        | passiv | Mini-Vapor-Chamber |
| Speicher/Preis | 256 GB 1200 / 512 GB 1400 / 1 TB 1600 | 256 GB 1500 / 512 GB 1700 / 1 TB 1900 / 2 TB 2300 |

Beide gleich: abgespeckter A20 Pro (1 Super- + 3 Effizienz-Kerne, max. 4 GHz), RGB-Blitz mit Signalen, Zen- und Privacy-Modus (Hardware-Trennung von Kamera/Mikrofon/GPS), Action-Button, Kamera-Knopf, USB-C, MagSafe, nur eSIM, 4G standard, 5G nur bei Last.
Farben: Mattschwarz, Titangrau, Himmelblau, Mattweiss, Kieselbeige. Hülle: CHF 59.–. Preise im Format `CHF 1’200.–`.

## Dateien

- `index.html`: das ganze Markup, 8 Views (`<div class="view" data-view="…">`), Hash-Router (`#/design`)
- `css/`: `basis` → `handy` → `seiten` → `warenkorb`, Reihenfolge nicht ändern (Kaskade)
- `js/`: klassische `<script defer>`, gemeinsamer Namensraum `window.Kiesel` (K). Reihenfolge: `kern`, `daten`, `handy`, `auswahl`, `startseite`, `funktionen`, `technik`, `vergleich`, `akku`, `warenkorb`, `router`, `start`
  - Daten/Hilfen oben per Destrukturierung holen; Funktionen anderer Dateien nur im Rumpf als `K.name()` aufrufen
  - Neu zugewiesene Variablen (`CART`, `activePart`, `macroMode`, `manual`) bleiben in ihrer Datei, Zugriff nur über exportierte Funktionen
  - Handys: `front/back/side()` in `handy.js`, Platzhalter `data-phone` + `SLOTS`
- `bilder/original/`: Quell-PNGs (hero, farben, kamera, huelle, icon), werden nicht geladen
- `bilder/*-{640,1024,1600,2400}.{webp,jpg}`, Favicons und `vorschau.jpg` (1200×630, Link-Vorschau): erzeugt von `werkzeuge/bilder.py`
- `schriften/`: Unbounded und Instrument Sans als variable woff2 (nur Stärke 400–600, Zeichensatz latin) + OFL-Lizenzen, eingebunden per `@font-face` oben in `basis.css`
- `kiesel-familie.html`: alte Einzeldatei, nur Referenz

## Regeln

- **Interaktives bleibt SVG aus JS** (Farbwähler, Bauteile, Explosion, Simulator, Zoom, LED, Zen, Privacy, Makro, Vergleich, Hülle, Kaufen). **Statisches nutzt PNG-Grafiken** über `<picture>` (WebP + JPEG-Fallback, `srcset`/`sizes`, `width`/`height`, `loading="lazy"` ausser Hero mit `fetchpriority="high"`) in `<figure class="shot">`.
- **Ohne Server lauffähig** (Doppelklick, `file://`): keine ES-Module, kein `fetch()`, keine externen SVG-Sprites. Nichts wird extern geladen, auch die Schriften liegen lokal.
- **Design:** Schriften Unbounded (`--display`) und Instrument Sans (`--body`). Farben nur über CSS-Variablen auf `:root`; Handyfarben `--k-*`, Hüllenfarben `--c-*`. Hell- und Dunkelmodus müssen beide funktionieren (`prefers-color-scheme` + `data-theme`).
- **Sprache:** Schweizer Hochdeutsch, immer „ss“ statt „ß“ (Grösse, gross, schliessen).

## Werkzeuge

- Bilder neu erzeugen: `python werkzeuge/bilder.py` (Python 3.12 + Pillow; falls `python` nicht gefunden: `%LOCALAPPDATA%\Programs\Python\Python312\python.exe`)
- Git: Repo https://github.com/fralineel-kiesel/kiesel-website, Branch `main`. Online über GitHub Pages: https://fralineel-kiesel.github.io/kiesel-website/ (darum nur relative Pfade, nie mit `/` am Anfang; Gross-/Kleinschreibung muss exakt stimmen). Falls `git` nicht gefunden: `C:\Program Files\Git\cmd\git.exe`. Erzeugte Bilder werden bewusst mit versioniert (Seite muss ohne Build laufen).
- Testen unter `file://`: headless Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe --headless=new --dump-dom|--screenshot=…`), Unterseite per Hash in der URL. Headless ist mindestens ca. 504 px breit, also Handy-Breite im eingebauten Browser mit Viewport „mobile“ prüfen. Die Vorschau zeigt lokale Dateien nur als statischen Schnappschuss, für Klicktests einen temporären lokalen Server nutzen.
