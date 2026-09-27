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
- **Verboten, bis das ganze Projekt fertig ist und der Nutzer es ausdrücklich verlangt:** jeder Pull Request mit Basis `main`, auch `v2` → `main`, und jeder Push auf `main`. Beim Erstellen eines PR die Basis **immer ausdrücklich** auf `v2` setzen (`base: v2`) und vorher prüfen: GitHub und das PR-Werkzeug nehmen sonst den Standard-Branch. Der war bis 27.9.2026 `main`, so ist PR #5 passiert (v2 → main gemergt, danach `main` per Reset auf `950cbb1` zurückgesetzt). Seither ist der Standard-Branch auf GitHub `v2`; die ausdrückliche Basis bleibt trotzdem Pflicht.
- Etappen-Branches starten von `origin/v2`, nicht von `main`. Neue Sitzungen bekommen ihren Branch vom Standard-Branch (jetzt `v2`). Startet einer trotzdem auf `main`: zuerst `git fetch origin v2 && git reset --hard origin/v2` (nur solange der Branch noch keine eigenen Commits hat) und mit `git log --oneline origin/v2..HEAD` prüfen, dass nur eigene Commits im PR landen.
- Veröffentlicht wird über `.github/workflows/pages.yml`. Die Datei liegt nur auf `v2`, darum lösen nur Pushes auf `v2` (oder ein manueller Start unter Actions) ein Deployment aus. Eine Änderung an der alten Seite auf `main` geht erst damit online.
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
  - Bausteine: `Knopf`, `Chip`, `GlasChip`, `ZoomLeiste`, `Farbwaehler` (`zeile` = Name rechts, Farben über `--fw-ink`), `Schalter`, `Zaehler`, `Feld`, `Icon`, `Logo`, `Akkordeon` (Button mit `aria-expanded` in Überschrift), `Buehne` (Verlaufskasten), `Buehne3D` (siehe unten), `HandyPlatzhalter` (alt, nur noch auf `/designsystem/`)
  - `startseite/`: Abschnitte der Startseite (`ModellKarte`, `Kennzahlen` (Prop `zahlen` für eigene Kennzahlen), `ZoomTeaser`, `FunktionsKacheln`, `HuelleTeaser`)
  - `modell/`: Modellseiten (Etappe 4). `ModellSeite` (ganze Seite, `modell="k1|pro"`), `TechnikSeite` (`/technik/`), `ModellKopf` (Doppelansicht), `ZoomVergleich` (Pro: Kiesel 1 vs. Pro, Regler = echtes `<input type="range">` + Pointer Events, `touch-action: pan-y`), `ZoomDemo` (Kiesel 1 bis 5x), `MakroDemo` (Klick aufs Bild = Schärfeebene), `AkkuStory` + `AkkuFazit`, `FarbReihe`, `Eckdaten` (Tabelle mit `role`-Attributen, weil per CSS ein Raster), `KaufBox`
- `src/styles/tokens.css`: **alle** Designwerte als CSS-Variablen. `global.css`: Schriften, Grundlagen, Schriftklassen `.t-display/.t-1/.t-2/.t-3/.t-4/.t-zahl/.t-lead/.t-text/.t-small`
- `src/data/`: `farben.js` (5 Produktfarben à 7 Töne), `modelle.js` (Namen, Preise, Texte der Modellkarten und Modellseiten: `seite.unterzeile/kennzahlen/eckdaten`), `technik.js` (volle Datentabelle beider Modelle), `akku.js` (Texte und Schrittgrenzen der Akku-Story, Balken), `navigation.js` (alle Menüs, Etappen), `faq.js` (Fragen und Antworten). Menüs, Preise und Texte nur hier ändern.
- `src/lib/kiesel-draw/`: **Zeichen-Motor** (Etappe 2), Übersetzung von `lib.py`/`scene.py`. Reine Funktionen, liefern SVG als Text, laufen im Build (Frontmatter) und im Browser (`<script>`). Einstieg `index.js`:
  - `handy({ ansicht: 'vorne'|'hinten'|'seite', modell: 'k1'|'pro', farbe, huelle, led, hoehe, drehung, boden })` → fertiges `<svg>`. `farbe`/`huelle`: PAL-Name, Hex (`palette()` leitet die 7 Töne ab) oder Palette. `led`: `off|call|msg|charge|full|low|privacy|flash` oder Hex. `hoehe: null` = Grösse per CSS
  - `panorama({ zoom, cx, cy, breite, hoehe, punkte })`, `crop()`, `begrenze()`, `ZOOM_TARGETS`; `blumeBild({ fokus: 'Blume (3x Tele)'|…|0…1, staerke })`, `BLUME_FOKUS`, `blumeUnschaerfe()`; `innenleben({ modell: 'se'|'k1'|'pro' })` → `{ svg, legende }`
  - Low-Level wie in Python: `backSvg/frontSvg/sideSvg(mk, col, pid, …)`, `lens`, `ledSvg`, `alpen(pid)`, `blume(pid, bg, fl, fg, bee)`, `phoneOpen(kind, ox, oy, s)`
  - `PAL` = `FARBEN` aus `data/farben.js` (nur dort ändern), `MODELS`/`geo`/`camrow` 1:1 aus `lib.py`. LED-Farben aus der alten `css/handy.css`, mid/edge/o1/o2 an `kiesel-kamera.png` geeicht. Seitenansicht aus `side()` der alten Seite (lib.py hat keine)
  - Jede Zeichnung braucht ein eigenes ID-Präfix (`pid`), sonst übernehmen Handys gegenseitig ihre Verläufe. `uid()` macht das automatisch, getrennt für Build und Browser
  - `zufall.js`: Pythons `random.Random` bitgenau, damit Bäume/Blumen wie in der Vorlage stehen
  - `ausschnitt.js`: `crop()`/`begrenze()` einzeln, damit Seiten den Panorama-Ausschnitt im Browser ändern können, ohne `scene.js` zu laden
  - `innenteile.js`: `innenteile(kind, ox, oy, s)` = Innenleben als Einzelteile (je ein kleines `<svg>` mit Lage `x/y/w/h`) für die Akku-Story. Zeichnet Zeichen für Zeichen wie `phoneOpen()` (prüft `pruefe:modellseiten`), nur Klinke/SIM-Schlitten/Home-Button sind neu als echte Teile gezeichnet (`phoneOpen` hat dort nur gestrichelte Umrisse, hier `luecke-*`). `phoneOpen()` selbst bleibt unverändert
- `src/lib/kiesel-3d/`: **3D-Kiesel** (Etappe 3, three.js). `pruefen.js` (ohne three.js!) sagt, ob 3D erlaubt ist: nicht bei `prefers-reduced-motion`, unter 4 Kernen, Datensparmodus, ohne WebGL 2 oder nur mit Software-Grafik (`failIfMajorPerformanceCaveat`). `buehne.js` (Renderer, Licht, Steuerung, Schleife, Wächter), `modell.js` (Formen und Materialien, Masse aus `models.js`, Farben aus `PAL`), `texturen.js` (Rückseite, Sperrbildschirm per Canvas 2D), `unterkante.js` (USB-C-Buchse und Lautsprecher-Löcher, Lage nach `phone_open()` in `scene.py`; keine echten Löcher, sondern Fase mit gekippten Normalen, Innenwand und dunkler Grund)
  - `Buehne3D.astro` zeigt immer zuerst die 2D-Grafik und lädt `buehne.js` (samt three.js, eigene Datei) nur per `import()`, wenn `pruefen.js` ja sagt. Zustand steht auf dem Element: `data-modus="2d|laedt|3d"`, `data-grund`
  - Notausgänge zur Laufzeit: WebGL-Kontextverlust und Wächter (nach 3 Aufwärmbildern Median der Bilder 4–15 über 40 ms, Notbremse bei 3 Bildern hintereinander über 100 ms) → zurück auf 2D. Rendert nur bei Bewegung, max. 60 fps, Pause ausser Sicht/im Hintergrund, Pixeldichte max. 1.5 (Touch) bzw. 2
  - Drehteller statt Kamerafahrt: OrbitControls steuert eine unsichtbare Kamera, gedreht wird das Handy, Licht bleibt fest
  - Testschalter in der Adresse: `?3d=software` (Software-Grafik erlaubt, für Tests), `?3d=foto` (dazu Wächter aus, nur fürs Foto-Skript)
- `src/pages/designsystem/spielwiese.astro`: versteckte Werkbank (noindex) für alle Zeichenfunktionen; Einstellungen stehen in der Adresse (`?modell=k1&farbe=Mattschwarz&ansicht=hinten&huelle=Mattweiss&led=call`, `&zoom=8&cx=846&cy=331&punkte=1`, `&fokus=0.3&blende=24`)
- `scripts/`: Prüfwerkzeuge (siehe Werkzeuge), Ausgabe in `scripts/ausgabe/` (nicht im Repo). `dist-server.mjs`: Mini-Server für `dist/` unter `/kiesel-website/v2/`, mit gzip
- `src/lib/pfad.js`: `pfad('kaufen/')` für jeden internen Link (setzt den base-Pfad davor). `format.js`: `chf(1200)` → `CHF 1’200.–`
- `src/scripts/warenkorb.js`: Warenkorb in `localStorage["kiesel-warenkorb"]`
- `src/scripts/akku-story.js`: Scroll-Kopplung der Akku-Story. Abschnitt mit hoher `.spur` (CSS `--strecke`), darin klebt `.klebt` (`position: sticky`). Fortschritt `p` 0…1 = wie weit die Spur am oberen Rand vorbeigezogen ist; `zeige(p)` setzt nur `transform`/`opacity` der Ebenen (ein Lesen pro Bild, `requestAnimationFrame`, passiver Scroll-Listener, ausserhalb des Bildschirms still). Drehbuch = `DREHBUCH` (Anteile von p), Texte/Schrittgrenzen in `data/akku.js`. Schrägansicht per CSS 3D (`preserve-3d` auf `.geraet`, Bauteile mit `translateZ`, Gehäusewand = 10 Scheiben). **Nie `opacity`, `overflow`, `filter` oder `will-change: opacity` auf `.geraet`**: das drückt die 3D-Ebenen flach. Das HTML zeigt den Endzustand; erst das Skript setzt `data-scroll="an"`. Bei `prefers-reduced-motion` (auch bei Wechsel zur Laufzeit) bleibt der Endzustand ohne Kopplung
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
- Zeichen-Motor prüfen (nach jeder Änderung in `src/lib/kiesel-draw/`):
  - `npm run pruefe:zeichenmotor`: vergleicht 212 Fälle Zeichen für Zeichen mit den Python-Originalen in `design/generator/` (braucht Python 3; sonst `PYTHON=…`). Muss immer ✓ sein
  - `npm run fotos:zeichenmotor`: Screenshots der Spielwiese + deckungsgleicher Vergleich mit den PNGs in `bilder/original/` (braucht Python 3 mit Pillow und einmalig `npx playwright install chromium`; dauert ca. 4 Min.). Nur eine Vorlage: `python scripts/vorlagen-vergleich.py hero` nach einem Lauf
- Modellseiten prüfen (nach Änderungen an `components/modell/`, `innenteile.js`, `akku-story.js`):
  - `npm run pruefe:modellseiten`: Einzelteile = `phoneOpen()`; Akku-Story in 200 Scroll-Schritten (Desktop + Handy): p steigt stetig, kein Teil springt (Schritt > 2.5× seine Nachbarn), Tempo max. 6 % der Bildhöhe pro 0.5 % Scroll, rückwärts = vorwärts, echtes Mausrad; reduced motion = Endzustand; Zoom-Regler mit Pfeiltasten, Maus, Finger (CDP-Touch); Makro-Klick; Technik-Tabellen. Muss immer ✓ sein
  - `npm run fotos:modellseiten`: Artboard | Pro | Kiesel 1 nebeneinander (1440/390, hell/dunkel) und Kontaktbögen der Akku-Story an 12 Scroll-Positionen → `scripts/ausgabe/modellseiten/`
- Startseite prüfen (nach Änderungen an Startseite oder `src/lib/kiesel-3d/`):
  - `npm run pruefe:startseite`: Playwright-Tests, u.a. greift die 2D-Ausweichlösung (reduced motion, 2 Kerne, Datensparen, Software-Grafik, Kontextverlust, Wächter) und lädt dann kein three.js, FAQ mit Tastatur, keine andere Seite lädt three.js. Muss immer ✓ sein
  - `npm run fotos:startseite`: Artboards und Seite (1440/390, hell/dunkel) nebeneinander plus 3D-Bühne in allen Farben → `scripts/ausgabe/startseite/`
  - Headless Chrome hat keine Grafikkarte: `--use-angle=swiftshader --enable-unsafe-swiftshader` erzwingt Software-WebGL. Damit bleibt `requestAnimationFrame` nach ein paar Bildern stehen; `--disable-gpu-vsync --disable-frame-rate-limit` löst das, aber dann hängen Screenshots (darum misst `pruefe:startseite` Pixel direkt aus der Leinwand)
