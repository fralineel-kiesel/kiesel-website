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

---

# Kiesel 2.0 (Neuaufbau in `site/`)

Alles oben beschreibt die **alte Seite** im Repo-Root. Sie bleibt unverändert online, bis Kiesel 2.0 fertig ist. Kiesel 2.0 ist ein Astro-Projekt in `site/` und läuft unter https://fralineel-kiesel.github.io/kiesel-website/v2/.

## Branches und Etappen

- `main` = alte Seite (nicht anfassen). `v2` = Sammelbranch für Kiesel 2.0.
- Jede Etappe auf eigenem Branch, **Pull Request immer nach `v2`**, nie nach `main`. Erst wenn alles fertig ist, geht `v2` nach `main`.
- Etappen:
  1. Fundament (Astro, Designsystem, Bausteine, Seitengerüst, Deployment)
  2. Zeichen-Motor (Handys als SVG aus JS, nach `design/generator/lib.py`)
  3. Startseite mit 3D
  4. Modellseiten mit Akku-Story
  5. Kamera-Demos (Zoom, Makro, nach `design/generator/scene.py`)
  6. Funktionen, Zubehör, Kaufen, Warenkorb
  7. Vergleichen, FAQ, Feinschliff

## Vorlagen

- `design/kiesel-2.0/Kiesel 2.0.html`: Export der Design-Leinwand (Designsystem, Startseite Desktop/Handy, Menü aufgeklappt, Modellseite Pro, Kaufen, Warenkorb-Schublade, Illustrationen). Öffnet nur im Browser mit JavaScript.
- `design/generator/`: Python-Skripte, die diese Vorlagen erzeugt haben. **Exakte Masse, Farben und Texte dort nachlesen** statt aus Screenshots messen: `gen2.py` (Seiten, Bausteine, `THEMES`), `lib.py` (Handys, `PAL`, Logo), `scene.py` (Alpenpanorama, Blume, Innenleben).

## Dateien in `site/`

- `astro.config.mjs`: `base: '/kiesel-website/v2'`, `trailingSlash: 'always'` (jede Seite = Ordner mit index.html)
- `src/pages/`: jede Datei = eine Adresse (`kiesel-1/technik.astro` → `/kiesel-1/technik/`). `404.astro`, `designsystem.astro` (versteckt, noindex: alle Tokens und Bausteine)
- `src/layouts/BaseLayout.astro`: `<head>`, Thema-Skript, Header, optional Unterleiste (`unterleiste="k1|pro"`), Footer
- `src/components/`: Bausteine als `.astro`, Namen deutsch ohne Umlaute
  - Gerüst: `Header`, `HandysMenue` (Aufklappmenü), `MobilMenue` (Burger, `<dialog>`), `Unterleiste`, `Footer`, `ThemaUmschalter`, `WarenkorbKnopf`, `Platzhalter`
  - Bausteine: `Knopf`, `Chip`, `GlasChip`, `ZoomLeiste`, `Farbwaehler`, `Schalter`, `Zaehler`, `Feld`, `Icon`, `Logo`, `HandyPlatzhalter` (bis Etappe 2)
- `src/styles/tokens.css`: **alle** Designwerte als CSS-Variablen. `global.css`: Schriften, Grundlagen, Schriftklassen `.t-display/.t-1/.t-2/.t-3/.t-lead/.t-text/.t-small`
- `src/data/`: `farben.js` (5 Produktfarben à 7 Töne), `modelle.js` (Namen, Preise), `navigation.js` (alle Menüs, Etappen). Menüs und Preise nur hier ändern.
- `src/lib/pfad.js`: `pfad('kaufen/')` für jeden internen Link (setzt den base-Pfad davor). `format.js`: `chf(1200)` → `CHF 1’200.–`
- `src/scripts/warenkorb.js`: Warenkorb in `localStorage["kiesel-warenkorb"]`
- `src/assets/fonts/`: Unbounded + Instrument Sans (variable woff2, 400–600, latin) + OFL
- `.github/workflows/pages.yml` (im Repo-Root): baut `main` + `v2` zu einem Pages-Deployment

## Regeln für Kiesel 2.0

- **Designsystem:** Farben, Schriftgrössen, Abstände und Radien nur über die Variablen aus `tokens.css` (`--bg`, `--surface`, `--raised`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--heat`, `--stage`, `--stage-lo`, `--overlay`, `--glass*`, `--fs-*`, `--space-1…10` = 4/8/12/16/24/32/48/64/96/140, `--radius-s/m/l/xl/full` = 8/16/24/32/rund). Neue Werte zuerst in `tokens.css` und auf `/designsystem/` ergänzen.
- **Themen:** Jede Farbe als `light-dark(hell, dunkel)`. Ohne Wahl folgt die Seite `prefers-color-scheme`; `data-theme="light|dark"` auf `<html>` (Umschalter im Footer, `localStorage["kiesel-thema"]`) übersteuert. Immer beide Themen prüfen.
- **Breakpoint:** 900 px (darunter Burger-Menü, Footer-Akkordeon). Vorlagen: Desktop 1440 px (Inhalt 1200 px), Handy 390 px (Rand 20 px).
- **Links:** nie `/…` fest schreiben, immer `pfad()`. Bilder/Schriften über `src/assets/` importieren, damit Astro den base-Pfad setzt.
- **Zugänglichkeit:** echte `<button>`/`<a>`/Radio-Knöpfe statt `div`s, `aria-expanded`/`aria-pressed`/`aria-checked` nachführen, Escape schliesst Menüs, Tab-Reihenfolge = HTML-Reihenfolge, Tippflächen mind. 44 px.
- **Skripte** in Komponenten laufen pro Seite nur einmal, auch wenn die Komponente mehrfach vorkommt: immer alle Instanzen per `querySelectorAll('[data-…]')` suchen.
- Die alte Regel „ohne Server lauffähig (`file://`)“ gilt für v2 **nicht**: Astro braucht einen Build. Nichts extern laden (keine CDNs, kein Google Fonts) gilt weiterhin.
- Sprache wie oben: Schweizer Hochdeutsch, „ss“ statt „ß“.

## Werkzeuge Kiesel 2.0

- Einmalig: `cd site && npm install` (Node 22.12 oder neuer)
- Entwickeln: `npm run dev` → http://localhost:4321/kiesel-website/v2/ (lädt bei jeder Änderung neu)
- Bauen: `npm run build` → `site/dist/`; ansehen mit `npm run preview`
- Prüfen: Playwright-Screenshots bei 1440 und 390 px, jeweils mit `colorScheme: 'dark'` und `'light'`, neben die Artboards legen
