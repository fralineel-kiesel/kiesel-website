"""Erzeugt aus bilder/original/*.png die Bilder, die die Website lädt.

Pro Produktbild entstehen mehrere Breiten, jeweils als WebP (klein, moderne
Browser) und als JPEG (Fallback für alle anderen). Der Browser sucht sich über
srcset/sizes selbst die passende Datei aus. Aus dem Icon werden die Favicons.

Nur beim Entwickeln nötig – die fertige Seite braucht kein Python.
Aufruf im Ordner C:\\Kiesel:

    python werkzeuge/bilder.py
"""
from pathlib import Path

from PIL import Image

WURZEL = Path(__file__).resolve().parent.parent
QUELLE = WURZEL / "bilder" / "original"
ZIEL = WURZEL / "bilder"

BILDER = ["hero", "farben", "kamera", "huelle", "poster"]
BREITEN = [640, 1024, 1600, 2400]
WEBP_QUALITAET = 80
JPEG_QUALITAET = 82

# Ausschnitt um den Kiesel im Icon (in Pixeln des 2048er-Originals),
# damit er im winzigen Favicon nicht zu klein wirkt.
ICON_AUSSCHNITT = (273, 271, 1707, 1705)
ICONS = {"favicon-32.png": 32, "favicon-192.png": 192, "apple-touch-icon.png": 180}


def kb(pfad):
    return pfad.stat().st_size / 1024


def produktbild(name):
    original = Image.open(QUELLE / f"kiesel-{name}.png").convert("RGB")
    zeilen = []
    for breite in BREITEN:
        if breite > original.width:
            continue  # nie hochskalieren, das würde nur unscharf und grösser
        hoehe = round(original.height * breite / original.width)
        klein = original.resize((breite, hoehe), Image.LANCZOS)
        webp = ZIEL / f"{name}-{breite}.webp"
        jpg = ZIEL / f"{name}-{breite}.jpg"
        klein.save(webp, "WEBP", quality=WEBP_QUALITAET, method=6)
        klein.save(jpg, "JPEG", quality=JPEG_QUALITAET, optimize=True, progressive=True)
        zeilen.append((f"{name}-{breite}", breite, hoehe, kb(webp), kb(jpg)))
    return original.size, zeilen


def icons():
    original = Image.open(QUELLE / "kiesel-icon.png").convert("RGB").crop(ICON_AUSSCHNITT)
    for datei, groesse in ICONS.items():
        original.resize((groesse, groesse), Image.LANCZOS).save(ZIEL / datei, "PNG", optimize=True)
        print(f"  {datei:<22} {groesse:>4} px  {kb(ZIEL / datei):6.1f} KB")


def main():
    print(f"{'Datei':<16}{'Grösse':>12}{'WebP':>10}{'JPEG':>10}")
    summe_webp = summe_jpg = 0
    for name in BILDER:
        (w, h), zeilen = produktbild(name)
        print(f"{name} (Original {w}x{h}, {kb(QUELLE / f'kiesel-{name}.png'):.0f} KB)")
        for datei, bw, bh, kw, kj in zeilen:
            print(f"  {datei:<14}{f'{bw}x{bh}':>12}{kw:8.0f} KB{kj:8.0f} KB")
            summe_webp += kw
            summe_jpg += kj
    print(f"Summe aller Varianten: WebP {summe_webp:.0f} KB, JPEG {summe_jpg:.0f} KB")
    print("Icons:")
    icons()


if __name__ == "__main__":
    main()
