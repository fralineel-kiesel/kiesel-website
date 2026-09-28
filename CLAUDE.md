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
  5. Kamera-Demos (Zoom, Makro, nach `design/generator/scene.py`), Funktionen und Zubehör (vorgezogen aus 6, Artboards aus `gen3.py`)
  6. Kaufen, Warenkorb
  7. Vergleichen, Technische Daten, Akku-Rechner, FAQ, Schlussprüfung

## Vorlagen

- `design/kiesel-2.0/Kiesel 2.0.html`: Export der Design-Leinwand (Designsystem, Startseite Desktop/Handy, Menü aufgeklappt, Modellseite Pro, Kaufen, Warenkorb-Schublade, Illustrationen, seit Etappe 5 auch Funktionen, Zubehör, Kiesel-Hülle, seit Etappe 7 Vergleichen, Technische Daten, Akku-Rechner, FAQ). Öffnet nur im Browser mit JavaScript.
- `design/generator/`: Python-Skripte, die diese Vorlagen erzeugt haben. **Exakte Masse, Farben und Texte dort nachlesen** statt aus Screenshots messen: `gen2.py` (Seiten, Bausteine, `THEMES`), `gen3.py` (Etappe 5: Funktionen, Zubehör, Kiesel-Hülle; baut auf gen2.py auf), `gen4.py` (Etappe 7: Vergleichen, Technische Daten, Akku-Rechner, FAQ; Daten `DEV`, `SPEC`, `FAQ` und die Rechnungen `cmp_js`/`akku_js`), `lib.py` (Handys, `PAL`, Logo), `scene.py` (Alpenpanorama, Blume, Innenleben).

## Dateien in `site/`

- `astro.config.mjs`: `base: '/kiesel-website/v2'`, `trailingSlash: 'always'` (jede Seite = Ordner mit index.html)
- `src/pages/`: jede Datei = eine Adresse (`kiesel-1/technik.astro` → `/kiesel-1/technik/`). `404.astro`, `designsystem.astro` (versteckt, noindex: alle Tokens und Bausteine)
- `src/layouts/BaseLayout.astro`: `<head>`, Thema-Skript, Header, optional Unterleiste (`unterleiste="k1|pro"`), Footer. Zusätzliches im `<head>` per `slot="kopf"` (JSON-LD der FAQ)
- `src/components/`: Bausteine als `.astro`, Namen deutsch ohne Umlaute
  - Gerüst: `Header`, `HandysMenue` (Aufklappmenü), `MobilMenue` (Burger, `<dialog>`), `Unterleiste`, `Footer`, `ThemaUmschalter`, `WarenkorbKnopf`, `MenueHandy` (leerer Platz in Menügrösse; `scripts/menue-handys.js` zeichnet beim ersten Öffnen per `import()` des Zeichen-Motors, Maus/Fokus lädt ihn vor)
  - Bausteine: `Knopf`, `Chip`, `GlasChip`, `ZoomLeiste`, `Farbwaehler` (`zeile` = Name rechts, Farben über `--fw-ink`), `Schalter`, `Zaehler`, `Feld`, `Icon`, `Logo`, `Akkordeon` (Button mit `aria-expanded` in Überschrift; optional `thema`, `anker`, Einträge mit `link` = Link im Satz oder danach; Linie unten an der Liste, damit Filtern sie nicht verschluckt), `Buehne` (Verlaufskasten), `Buehne3D` (siehe unten)
  - `warenkorb/` (Etappe 6): `WarenkorbInhalt` (`art="schublade|seite"`: Zeilen aus `<template>`, nur geänderte Zeilen werden nachgeführt, damit der Fokus nicht verloren geht; Hüllen-Vorschlag, Summen, „Zur Kasse“), `WarenkorbSchublade` (`<dialog>` von rechts, im BaseLayout, öffnet per Kopfzeilen-Knopf oder Ereignis `kiesel:schublade` mit `detail.ausloeser`), `KasseDialog` (öffnet über jedem `[data-zur-kasse]`, „Weiterträumen“ / „Warenkorb leeren“)
  - `funktionen/`: Abschnitte von `/funktionen/` (Etappe 5): `RgbLicht` (2D-Handy wird bei jedem Ereignis im Browser neu gezeichnet, Rhythmus per CSS auf `.hof` = Kreis r=120 und `.kern` = r=17, `data-rhythmus`), `ZenModus` (Mitteilungen als Ebene im Handy-SVG wie `phone_overlay()`), `PrivacyModus` (Schaltbild, ein Schalter trennt alle drei), `KameraSuche` (Pro allein, Start 1x, Zielen per Tippen/Ziehen)
  - `startseite/`: Abschnitte der Startseite (`ModellKarte`, `Kennzahlen` (Prop `zahlen` für eigene Kennzahlen), `ZoomTeaser`, `FunktionsKacheln`, `HuelleTeaser`)
  - `modell/`: Modellseiten (Etappe 4). `ModellSeite` (ganze Seite, `modell="k1|pro"`), `TechnikSeite` (`/technik/`, Artboard „Technische Daten“: Kennzahlen, Kopf mit beiden Handys, Schalter „Nur Unterschiede zeigen“, je Gruppe eine `<table>`; Modell der Seite in der ersten Spalte, Abweichungen der zweiten blau), `ModellKopf` (Doppelansicht), `ZoomVergleich` (Pro: Kiesel 1 vs. Pro, Trennlinie = echtes `<input type="range">` + Pointer Events, `touch-action: pan-y`), `ZoomDemo` (Kiesel 1 bis 5x), Kamera-Bausteine nach Artboard „Funktionen“ („Such das Gipfelkreuz“), auch auf `/funktionen/`: `ZoomSkala` (gezeichnete Spur mit Füllung, Tele-Strich, Griff; darüber unsichtbares `<input type="range">`, einen halben Griff breiter; die Beschriftungen darunter sind die Zoomstufen-Knöpfe), `LinsenLeiste` (aktiver Abschnitt in Akzent), `FundZaehler` (Glas-Chip mit 8 Punkten), `FokusRing` (weisser Ring + „✓ … entdeckt“), `KameraFunde` (8 Vorschaubilder, versteckt „?“; auch versteckte sind Knöpfe = Tipp, hinfliegen), `MakroDemo` (Klick aufs Bild = Schärfeebene), `AkkuStory` + `AkkuFazit` (Link zum Akku-Rechner), `FarbReihe`, `Eckdaten` (Tabelle mit `role`-Attributen, weil per CSS ein Raster), `KaufBox`
- `src/styles/tokens.css`: **alle** Designwerte als CSS-Variablen. `global.css`: Schriften, Grundlagen, Schriftklassen `.t-display/.t-1/.t-2/.t-3/.t-4/.t-zahl/.t-lead/.t-text/.t-small`
- `src/data/`: `farben.js` (5 Produktfarben à 7 Töne), `preise.js` (**einziger Ort für Preiszahlen**: `PREISE` mit Speicherstufen `{ id: '256gb'|'512gb'|'1tb'|'2tb', name, preis }`, `HUELLE_PREIS`, `VERSAND`, `MWST_PROZENT`, `MAX_ANZAHL` = 9, `abPreis()`, `speicherBereich()`; `pruefe:kaufen` sucht Preiszahlen im restlichen Code), `geraete.js` (**einziger Ort für Gerätewerte**: die sechs Geräte aus `gen4.py` mit Massen, Gewicht, Akku, Display, Eckradius, Typ; Hilfen `masse()`, `akku()`, `zoll()`, `zahl()`, `akkuPlus()`, `dickePlus()`), `modelle.js` (nur Texte der Modellkarten und Modellseiten: `seite.unterzeile/kennzahlen/eckdaten`, `seite.farbe` = Farbe für Kaufen-Links, `STARTSEITE_KENNZAHLEN`; Werte aus geraete/technik), `technik.js` (`TECHNIK` = `SPEC` aus gen4.py in 9 Gruppen, Zeichen für Zeichen gleich; `WERTE` = RAM, MP, Watt, Updates, IP68, Zoom …; `TECHNIK_KENNZAHLEN`, `technik(merkmal, modell)`), `akku.js` (Texte und Schrittgrenzen der Akku-Story, Balken; `RECHNER` = Rechenmodell des Akku-Rechners, `RECHNER_TEXTE`), `navigation.js` (alle Menüs), `faq.js` (13 Fragen aus gen4.py mit `thema`, `startseite`, `link`; `THEMEN`, `FRAGE_STELLEN` = GitHub-Issues), `kamera.js` (Zoomstufen, Linsen-Leiste), `funktionen.js` (Texte und LED-Farben von /funktionen/), `zubehoer.js` (Texte von /zubehoer/ und der Hülle, `HUELLE_MASSE`, `huellenArtikel()` = Warenkorb-Eintrag ohne Handyfarbe). `farben.js` hat zusätzlich `FARBEN_TEXT` (Reihenfolge in Aufzählungen). Menüs, Preise und Texte nur hier ändern (Preise nur in `preise.js`). Platzhalter in eckigen Klammern („[Material]“, „[Weiteres Zubehör]“) stehen bewusst so: nichts erfinden
- `src/lib/kiesel-draw/`: **Zeichen-Motor** (Etappe 2), Übersetzung von `lib.py`/`scene.py`. Reine Funktionen, liefern SVG als Text, laufen im Build (Frontmatter) und im Browser (`<script>`). Einstieg `index.js`:
  - `handy({ ansicht: 'vorne'|'hinten'|'seite', modell: 'k1'|'pro', farbe, huelle, led, hoehe, drehung, boden })` → fertiges `<svg>`. `farbe`/`huelle`: PAL-Name, Hex (`palette()` leitet die 7 Töne ab) oder Palette. `led`: `off|call|msg|charge|full|low|privacy|flash` oder Hex. `hoehe: null` = Grösse per CSS. `gravur`: Text auf der Rückseite (Etappe 6, `gravurSvg()`, escaped; ohne Gravur bleibt das SVG Zeichen für Zeichen wie in Python)
  - `panorama({ zoom, cx, cy, breite, hoehe, punkte })`, `crop()`, `begrenze()`, `ZOOM_TARGETS`; `blumeBild({ fokus: 'Blume (3x Tele)'|…|0…1, staerke })`, `BLUME_FOKUS`, `blumeUnschaerfe()`; `innenleben({ modell: 'se'|'k1'|'pro' })` → `{ svg, legende }`
  - Low-Level wie in Python: `backSvg/frontSvg/sideSvg(mk, col, pid, …)`, `lens`, `ledSvg`, `alpen(pid)`, `blume(pid, bg, fl, fg, bee)`, `phoneOpen(kind, ox, oy, s)`
  - `PAL` = `FARBEN` aus `data/farben.js` (nur dort ändern), `MODELS`/`geo`/`camrow` 1:1 aus `lib.py`. LED-Farben aus der alten `css/handy.css`, mid/edge/o1/o2 an `kiesel-kamera.png` geeicht. Seitenansicht aus `side()` der alten Seite (lib.py hat keine)
  - Jede Zeichnung braucht ein eigenes ID-Präfix (`pid`), sonst übernehmen Handys gegenseitig ihre Verläufe. `uid()` macht das automatisch, getrennt für Build und Browser
  - `zufall.js`: Pythons `random.Random` bitgenau, damit Bäume/Blumen wie in der Vorlage stehen
  - `ausschnitt.js`: `crop()`/`begrenze()` und `ZOOM_TARGETS` einzeln, damit Seiten den Panorama-Ausschnitt im Browser ändern können, ohne `scene.js` zu laden (`scene.js` reicht `ZOOM_TARGETS` weiter)
  - `panoramaQuelle()` + `panoramaAnsicht(id, { zoom, cx, cy })` (in `scene.js`): Szene einmal unsichtbar ablegen (`<g id>` in 0×0-SVG, nicht `display: none`), beliebig oft per `<use>` zeigen (Ebenen und Vorschaubilder der Kamera-Demos)
  - `innenteile.js`: `innenteile(kind, ox, oy, s)` = Innenleben als Einzelteile (je ein kleines `<svg>` mit Lage `x/y/w/h`) für die Akku-Story. Zeichnet Zeichen für Zeichen wie `phoneOpen()` (prüft `pruefe:modellseiten`), nur Klinke/SIM-Schlitten/Home-Button sind neu als echte Teile gezeichnet (`phoneOpen` hat dort nur gestrichelte Umrisse, hier `luecke-*`). `phoneOpen()` selbst bleibt unverändert
- `src/lib/kiesel-3d/`: **3D-Kiesel** (Etappe 3, three.js). `pruefen.js` (ohne three.js!) sagt, ob 3D erlaubt ist: nicht bei `prefers-reduced-motion`, unter 4 Kernen, Datensparmodus, ohne WebGL 2 oder nur mit Software-Grafik (`failIfMajorPerformanceCaveat`). `buehne.js` (Renderer, Licht, Steuerung, Schleife, Wächter), `modell.js` (Formen und Materialien, Masse aus `models.js`, Farben aus `PAL`), `texturen.js` (Rückseite, Sperrbildschirm per Canvas 2D), `unterkante.js` (USB-C-Buchse und Lautsprecher-Löcher, Lage nach `phone_open()` in `scene.py`; keine echten Löcher, sondern Fase mit gekippten Normalen, Innenwand und dunkler Grund)
  - `Buehne3D.astro` zeigt immer zuerst die 2D-Grafik und lädt `buehne.js` (samt three.js, eigene Datei) nur per `import()`, wenn `pruefen.js` ja sagt. Zustand steht auf dem Element: `data-modus="2d|laedt|3d"`, `data-grund`
  - Notausgänge zur Laufzeit: WebGL-Kontextverlust und Wächter (nach 3 Aufwärmbildern Median der Bilder 4–15 über 40 ms, Notbremse bei 3 Bildern hintereinander über 100 ms) → zurück auf 2D. Rendert nur bei Bewegung, max. 60 fps, Pause ausser Sicht/im Hintergrund, Pixeldichte max. 1.5 (Touch) bzw. 2
  - Drehteller statt Kamerafahrt: OrbitControls steuert eine unsichtbare Kamera, gedreht wird das Handy, Licht bleibt fest
  - Testschalter in der Adresse: `?3d=software` (Software-Grafik erlaubt, für Tests), `?3d=foto` (dazu Wächter aus, nur fürs Foto-Skript)
- `src/pages/designsystem/spielwiese.astro`: versteckte Werkbank (noindex) für alle Zeichenfunktionen; Einstellungen stehen in der Adresse (`?modell=k1&farbe=Mattschwarz&ansicht=hinten&huelle=Mattweiss&led=call`, `&zoom=8&cx=846&cy=331&punkte=1`, `&fokus=0.3&blende=24`)
- `scripts/`: Prüfwerkzeuge (siehe Werkzeuge), Ausgabe in `scripts/ausgabe/` (nicht im Repo). `dist-server.mjs`: Mini-Server für `dist/` unter `/kiesel-website/v2/`, mit gzip
- Etappe 7: `src/lib/vergleich.js` (Rechnung von /vergleichen/ = `cmp_js`, 3 Einheiten pro mm, Bühne 1200 × 640, Handy-Ausschnitt `BUEHNE_SCHMAL`; SE-Hörer bewusst mittig), `src/lib/akku-rechner.js` (`rechne()` = `akku_js`, `diagramm(erg, breite)` 620 bzw. 360, `geschuetzt()` = geschütztes Leerzeichen vor „%“ nur für die Anzeige). Beide laufen im Build und im Browser. Seiten: `vergleichen.astro` (Vorwahl `?kiesel=&gegen=&ansicht=uebereinander&karte=1`, Adresse wird nachgeführt; die Unterleiste übergibt `?kiesel=`), `akku-rechner.astro` (Regler = `<input type="range">`, Bild auf/ab ±1 h per Skript), `faq.astro` (Suche ohne Akzente, Themen-Chips, `#id` öffnet die Frage, JSON-LD `FAQPage`)
- `src/lib/pfad.js`: `pfad('kaufen/')` für jeden internen Link (setzt den base-Pfad davor). `format.js`: `chf(1200)` → `CHF 1’200.–`, `chf(131.8)` → `CHF 131.80`, `chfRappen(13180)` → `CHF 131.80`. `gravur.js`: `pruefeGravur(text)` → `{ text, laenge, fehler }` (max. 18 Zeichen nach NFC, erlaubt: lateinische Buchstaben inkl. Akzente, Ziffern, Leerzeichen und `. , ' ’ & ! ? + -`), `saubereGravur()`
- `src/scripts/warenkorb.js`: Warenkorb in `localStorage["kiesel-warenkorb"]`, gespeichert wird nur die Wahl, **nie ein Preis**: `{ art: 'handy', modell, farbe, speicher, gravur?, anzahl }` bzw. `{ art: 'huelle', modell, farbe, anzahl }`. Ist localStorage gesperrt: sessionStorage, sonst eine Variable (`speicherOrt()` = `dauerhaft|sitzung|seite`), alles in try/catch, keine Fehlermeldung. `bereinige()` räumt jeden Eintrag auf (unbekannt → weg, Anzahl 1–9, altes Format aus Etappe 5 mit `preis` wird übernommen, Preis ignoriert). `artikelId()` aus der Wahl = gleiche Artikel fassen sich zusammen. `lesen()`, `anzahl()`, `hinzufuegen(artikel, n)` → `{ id, anzahl, gekappt }`, `setzeAnzahl()`, `entfernen()`, `leeren()`, `beiAenderung()` (eigenes Ereignis `kiesel:warenkorb`, `storage` aus anderen Tabs, `pageshow` aus dem bfcache), `artikelInfo()` (Name, Details, Stückpreis in Rappen), `summen()` in Rappen: MwSt. „davon“ = `round(Total × 81 / 1081)`
- `src/scripts/modal.js`: `modal(dialog, { ersatz, beiOeffnen, beiSchliessen })` für Schublade und Kasse: `showModal()` (Hintergrund inert, Escape), Fokus hinein (`[autofocus]` oder erstes Element), Tab-Kreisel, Klick auf den Schleier schliesst, Seite scrollt nicht mit, Fokus zurück auf den Auslöser (sonst `ersatz()`). Achtung: `close` kommt erst im nächsten Task, Tests müssen auf den Fokus warten
- `src/scripts/kamera-zoom.js`: Verhalten der Kamera-Demos (`starteKamera(wurzel, { max, start, blick, zielZoom, zielen, beschrifte })`, hängt `wurzel.kamera` an für Tests). Kamera-Zoom `z` (0.5…10) ↔ Bild-Zoom `Z` per `bildZoom()`/`kameraZoom()` (log. Stützpunkte). Ebenen `haupt`/`tele`/`k1` = je ein SVG mit `<use>`, Unschärfe per CSS `blur()` (`UNSCHAERFE`, px bei 600 px Breite). Ebenen sind `--rand` (40 px) grösser als das Fenster und das SVG hat `overflow: visible`, sonst franst die Unschärfe am Bildrand aus. **Linsenwechsel** (Pro, sobald die angezeigte Zahl 3x erreicht/unterschreitet): 420 ms, 0–210 ms Überblendung mit Versatz der zwei Linsen (`mix` 0…1, umkehrbar), ab 170 ms rastet die Schärfe der neuen Linse ein (zurück nur halb so stark); Chip zeigt die aktive Linse mit Ring-Puls. **Aufwärmen:** eine Ebene, die `visibility: hidden` war, ist im ersten Bild nach dem Einblenden leer. Darum zeichnet Tele ab 2.2x, Hauptkamera bis 4.5x unsichtbar mit (`opacity: 0`), weiter weg sind sie aus; bei einem Sprung über 3x wartet der Wechsel 2 Bilder. Details: gefunden ab Bild-Zoom 5, nicht nur am Rand, erst nach der ersten Bedienung (oder angeflogen); dann Vorschaubild, Zähler und Fokusring (ab 3.5, um das neueste, sonst das mittigste gefundene). Flug = rauszoomen, schwenken, rein. `zielen` (nur ohne Trennlinie): Klick/Tippen schwenkt, Maus ziehen verschiebt, Finger waagrecht verschiebt, senkrecht scrollt. `prefers-reduced-motion`: alles sofort
- `src/pages/kaufen.astro`: Konfigurator nach Artboard „Kaufen“. Vorwahl per Adresse `?modell=k1|pro&farbe=…&speicher=256gb|512gb|1tb|2tb&huelle=<Farbe>` (Gross/Klein egal, Ungültiges ignoriert), jede Wahl schreibt die Adresse per `replaceState` nach (ohne Gravur). Ohne Adresse: Pro, Himmelblau, 512 GB, **ohne Hülle**. Speicher merkt sich den Wunsch (Pro 2 TB → Kiesel 1 = 1 TB mit Hinweis → Pro = wieder 2 TB). Gravur ohne `maxlength` (würde still abschneiden), Fehler am Feld mit `aria-invalid` + `aria-describedby`. „In den Warenkorb“ legt Handy und ggf. Hülle als eigene Zeilen hinein und öffnet die Schublade
- `src/pages/warenkorb.astro`: `WarenkorbInhalt art="seite"`, ohne Schublade (`BaseLayout schublade={false}`, der Kopfzeilen-Knopf ist dort ein Link mit `aria-current`)
- Kaufen-Links übergeben Modell und Farbe: Modellkarten (`karte.farbe`), Unterleiste, KaufBox und Technik (`seite.farbe`), Zubehör „Diese Kombination kaufen“ (mit Hülle). Hüllen-Knöpfe (Zubehör, Hülle, Startseite) legen direkt in den Warenkorb
- `src/scripts/huelle-kaufen.js`: `huelleKaufen(knopf, modell, farbe, ansage)` = Hülle in den Warenkorb (nur Modell + Hüllenfarbe), Knopf zeigt kurz „Im Warenkorb ✓“
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
  - `npm run pruefe:modellseiten`: Einzelteile = `phoneOpen()`; Akku-Story in 200 Scroll-Schritten (Desktop + Handy): p steigt stetig, kein Teil springt (Schritt > 2.5× seine Nachbarn), Tempo max. 6 % der Bildhöhe pro 0.5 % Scroll, rückwärts = vorwärts, echtes Mausrad; reduced motion = Endzustand; Trennlinie des Zoom-Vergleichs mit Pfeiltasten, Maus, Finger (CDP-Touch); Makro-Klick; Technik-Tabellen. Muss immer ✓ sein
  - `npm run fotos:modellseiten`: Artboard | Pro | Kiesel 1 nebeneinander (1440/390, hell/dunkel) und Kontaktbögen der Akku-Story an 12 Scroll-Positionen → `scripts/ausgabe/modellseiten/`
- Kamera-Demos prüfen (nach Änderungen an `kamera-zoom.js`, den Kamera-Bausteinen in `components/modell/`, `KameraSuche`, `ausschnitt.js`):
  - `npm run pruefe:kamera`: Zoom-Regler (Tastatur, Chips, Finger), Zustände bei 2.8/3.0/3.2x, Linsenwechsel Bild für Bild mit angehaltener Uhr (`page.clock`: Deckkraft/Versatz/Unschärfe stetig; Pixel: beim Ziehen über 3x springt kein Bild mehr als 1.25× so stark wie beim Ziehen ohne Wechsel; Gegenprobe: ein harter Schnitt ohne Animation fällt durch), Umkehr mitten im Wechsel, Aufwärmen, reduced motion, Details auf allen drei Seiten (beim Laden alles „?“, gefunden ab 5x, Fokusring, Zähler-Punkte, Linsen-Leiste, Vorschaubild fliegt hin, Ziel danach in der Bildmitte), Zielen auf `/funktionen/` (Klick, Maus, Finger). Muss immer ✓ sein
  - `npm run fotos:kamera`: Filmstreifen des Linsenwechsels (ganz und 100 %-Ausschnitt, 40-ms-Schritte, 1440/390, hell/dunkel), Flug zum Segelboot → `scripts/ausgabe/kamera/`
- Funktionen und Zubehör prüfen (nach Änderungen an `components/funktionen/`, `pages/zubehoer/`, `data/funktionen.js`, `data/zubehoer.js`, `huelle-kaufen.js`):
  - `npm run pruefe:funktionen`: RGB (Farbe, Rhythmus, Karte je Ereignis, Tastatur, reduced motion), Zen und Privacy (Schalter per Maus und Tastatur, Zustände), Zubehör (Filter, Platzhalter, Warenkorb, Kombination), Hülle (Vorwahl `?modell=&farbe=`, Ansicht, Farben, Warenkorb ohne Handyfarbe, „[Material]“). Muss immer ✓ sein
  - `npm run fotos:funktionen`: Artboards „Funktionen“, „Zubehör“, „Kiesel-Hülle“ neben den Seiten (1440, hell/dunkel; /funktionen/ im Artboard-Zustand: 6x auf dem Gipfel, 3 gefunden) und die Handy-Ansichten → `scripts/ausgabe/funktionen/`
  - Stolperstein `page.clock`: `install()` lässt die Zeit weiterlaufen, erst `pauseAt()` hält sie an. `runFor()` lässt Animationsbilder ohne echtes Zeichnen laufen, erst ein Screenshot zeichnet: Wer Pixel misst, macht nach einem Sprung erst ein Wegwerf-Foto
- Etappe 7 prüfen (Referenz = Original-Rechnungen aus `gen4.py`, gezogen von `scripts/gen4-referenz.py`/`.mjs`, braucht Python 3):
  - `npm run pruefe:vergleichen`: geraete.js = `DEV`, technik.js = `SPEC`, 20 Kombinationen gegen `cmp_js`, Maus, Tastatur, Adresse, Massstab, 390 px
  - `npm run pruefe:akku-rechner`: die Erwartungswerte (Normal 44 %/55 %/SE leer 22:18, Viel unterwegs leer 21:37/15 %, Ruhiger Tag 72 %/78 %), 4 Tage + 400 zufällige Einstellungen gegen `akku_js`, Tastatur, Links, 390 px
  - `npm run pruefe:faq`: faq.js = `FAQ`, Akkordeon mit Tastatur, Suche, Themen, Anker, Links, JSON-LD
- Schlussprüfung über alle Seiten (`scripts/seiten.mjs` = Liste aller Seiten):
  - `npm run pruefe:ganz`: interne Links und #Sprungziele (HTML, CSS und nach dem Skriptlauf), kein „Inhalt folgt“/`href="#"`, keine Preise oder Gerätewerte fest im Code ausserhalb `src/data/` (Ausnahmen mit Grund in `ERLAUBT`), je Seite lang/Titel/Beschreibung/ein h1/keine doppelten IDs, Menü-Handys erst beim Öffnen. Muss immer ✓ sein
  - `npm run fotos:ganz`: alle Seiten 1440/390 × dunkel/hell (reduced motion) als Bogen je Seite, die vier Artboards von Etappe 7 neben ihren Seiten → `scripts/ausgabe/ganz/`
  - `npm run lighthouse`: Leistung und Barrierefreiheit jeder öffentlichen Seite, Handy und Desktop, Median aus 3 Läufen (`LAEUFE=1` schneller, `NUR=warenkorb/,faq/` nur diese Seiten → `bericht-teil.md`) → `scripts/ausgabe/lighthouse/bericht.md`. Aus einem Container ohne Grafikkarte nur Richtwerte
- Kaufen und Warenkorb prüfen (nach Änderungen an `data/preise.js`, `pages/kaufen.astro`, `pages/warenkorb.astro`, `components/warenkorb/`, `warenkorb.js`, `modal.js`, `gravur.js`, `format.js`):
  - `npm run pruefe:kaufen`: Summen von 6 Warenkörben gegen Handrechnung, Preisformat, Gravur-Regeln, Aufräumen, keine Preiszahl ausserhalb `preise.js`; Kaufweg mit Maus und nur mit Tastatur (Fokus hinein, Tab-Kreisel, inert, Escape, Fokus zurück); localStorage gesperrt (auch sessionStorage), kaputt, mit Unsinn; Adresse, Speicher-Rücksprung, Gravur-Fehler am Feld, Zusammenfassen, Obergrenze 9, Hüllen-Vorschlag, Zähler über Tabs/Seiten/Zurück, Links, 390 px, Bewegung. Muss immer ✓ sein
  - `npm run fotos:kaufen`: Artboards „Kaufen“ und „Warenkorb-Schublade“ neben den Seiten (1440, hell/dunkel), /warenkorb/, Kasse, leerer Warenkorb, Gravur-Fehler, Handy-Ansichten → `scripts/ausgabe/kaufen/`
  - Stolperstein Playwright: Auf `aria-disabled="true"` klickt `click()` nicht (gilt als deaktiviert), für den Test `click({ force: true })`
- Startseite prüfen (nach Änderungen an Startseite oder `src/lib/kiesel-3d/`):
  - `npm run pruefe:startseite`: Playwright-Tests, u.a. greift die 2D-Ausweichlösung (reduced motion, 2 Kerne, Datensparen, Software-Grafik, Kontextverlust, Wächter) und lädt dann kein three.js, FAQ mit Tastatur, keine andere Seite lädt three.js. Muss immer ✓ sein
  - `npm run fotos:startseite`: Artboards und Seite (1440/390, hell/dunkel) nebeneinander plus 3D-Bühne in allen Farben → `scripts/ausgabe/startseite/`
  - Headless Chrome hat keine Grafikkarte: `--use-angle=swiftshader --enable-unsafe-swiftshader` erzwingt Software-WebGL. Damit bleibt `requestAnimationFrame` nach ein paar Bildern stehen; `--disable-gpu-vsync --disable-frame-rate-limit` löst das, aber dann hängen Screenshots (darum misst `pruefe:startseite` Pixel direkt aus der Leinwand)
