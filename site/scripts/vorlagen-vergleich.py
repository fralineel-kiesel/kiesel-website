"""Vergleicht den Zeichen-Motor mit den Original-PNGs in bilder/original/.

Wird von fotografiere-zeichenmotor.mjs gestartet, nachdem es die Teile (einzelne Handys,
aufrecht, durchsichtiger Hintergrund) nach scripts/ausgabe/vergleich/teile/ gezeichnet hat.

Die Handys auf den PNGs sind gedreht, verschoben und verkleinert. Für jedes Handy sucht
dieses Skript die Lage (Mitte x/y, Drehung, Massstab), in der die Zeichnung des Motors am
besten über dem PNG liegt, und misst dann die Abweichung Pixel für Pixel.
Stehen mehrere Teile zur Wahl (z.B. Kiesel 1 oder Pro, welche Hüllenfarbe), gewinnt das
Teil mit der kleinsten Abweichung. So prüft der Vergleich auch, WAS abgebildet ist.

Suchverfahren: Nelder-Mead (ein "Simplex" aus 5 Lagen tastet sich bergab zur besten Lage),
von Hand geschrieben, damit nur Pillow nötig ist. Gesucht wird auf verkleinerten Bildern
(schnell), mit drei Start-Massstäben, gemessen in voller Auflösung.

Überlappungen: Die Handys werden von vorne nach hinten eingepasst. Was ein vorderes Handy
samt Schatten verdeckt, zählt beim dahinterliegenden nicht. (Früher wurden stattdessen die
schlechtesten Pixel ausgelassen; dann konnte sich ein zu klein eingepasstes Handy auf einer
gleichmässigen Fläche "verstecken".)

Ausgabe in scripts/ausgabe/vergleich/:
  <vorlage>-nachbau.png   links das Original, rechts mit dem Motor nachgebaut
  <vorlage>-<handy>.png   Ausschnitt: Original | Motor | Abweichung (vierfach verstärkt)
"""
import json, math, os, sys
from PIL import Image, ImageChops, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
ORIGINAL = os.path.join(HIER, "..", "..", "bilder", "original")
AUS = os.path.join(HIER, "ausgabe", "vergleich")
TEILE = os.path.join(AUS, "teile")

# Startlage von Auge (in Pixeln des Original-PNGs): Mitte x, Mitte y, Drehung in Grad,
# Massstab in Pixel pro Einheit. Reihenfolge: das vorderste Handy zuerst.
# "trim" = Anteil der schlechtesten Pixel, die nicht zählen (nur Kantenglättung, 1 %).
FARBEN = ["Himmelblau", "Mattschwarz", "Titangrau", "Mattweiss", "Kieselbeige"]
VORLAGEN = [
    ("kiesel-hero.png", 0.01, [
        ("Vorderseite", ["hero-vorne-pro", "hero-vorne-k1"], (1742, 929, 5, 1.08)),
        ("Rückseite", ["hero-hinten-pro", "hero-hinten-k1"], (1103, 885, -6.7, 1.11)),  # aus Linsen und Blitz gemessen
    ]),
    ("kiesel-farben.png", 0.01, [
        ("Titangrau", ["farben-Titangrau"], (1440, 706, 0, 0.86)),
        ("Mattschwarz", ["farben-Mattschwarz"], (951, 733, -3, 0.86)),
        ("Mattweiss", ["farben-Mattweiss"], (1947, 721, 2, 0.86)),
        ("Himmelblau", ["farben-Himmelblau"], (465, 756, -7, 0.86)),
        ("Kieselbeige", ["farben-Kieselbeige"], (2417, 753, 7, 0.86)),
    ]),
    ("kiesel-kamera.png", 0.01, [
        ("Rückseite mit Blitz", ["kamera-led-call", "kamera-led-aus"], (1367, 2345, 0, 3.2)),
    ]),
    ("kiesel-huelle.png", 0.01, [
        ("Vorderseite", [f"huelle-vorne-{h}" for h in FARBEN], (1560, 918, 5, 1.12)),
        ("Rückseite", [f"huelle-hinten-{h}" for h in FARBEN], (830, 894, -6, 1.13)),
    ]),
]

meta = {m["name"]: m for m in json.load(open(os.path.join(TEILE, "teile.json"), encoding="utf-8"))}


def platziere(teil, m, lage, groesse, k, P):
    """Teil (P px pro Einheit) so verschieben/drehen/skalieren, dass es im Zielbild
    (Original / k) an der Lage (cx, cy, grad, s) liegt. Liefert ein RGBA-Bild in Zielgrösse."""
    cx, cy, grad, s = lage
    t = math.radians(grad)
    c, si = math.cos(t), math.sin(t)
    # Für jedes Zielpixel (x, y): woher im Teil? (Pillow will die Rückrichtung)
    a, b = P * k * c / s, P * k * si / s
    d, e = -P * k * si / s, P * k * c / s
    cc = P * ((-c * cx - si * cy) / s + m["W"] / 2 + m["rand"])
    ff = P * ((si * cx - c * cy) / s + m["H"] / 2 + m["rand"])
    return teil.transform(groesse, Image.AFFINE, (a, b, cc, d, e, ff), resample=Image.BICUBIC)


def abweichung(ziel, bild, trim, verdeckt=None):
    """Mittlere Abweichung (0–255) nur auf dem sichtbaren Handy (voll deckende Pixel, ohne
    das, was vordere Handys verdecken), die schlechtesten trim·100 % ausgelassen.
    Dazu Anteil der Pixel mit mehr als 24 Abweichung."""
    maske = bild.getchannel("A").point(lambda v: 255 if v >= 250 else 0)
    if verdeckt is not None:
        maske = ImageChops.subtract(maske, verdeckt)
    diff = ImageChops.difference(ziel, bild.convert("RGB")).convert("L")
    h = diff.histogram(mask=maske)
    n = sum(h)
    if n == 0:
        return 255.0, 1.0, 255.0
    rest, summe, gezaehlt = n * (1 - trim), 0, 0
    for wert, anzahl in enumerate(h):
        nimm = min(anzahl, rest - gezaehlt)
        if nimm <= 0:
            break
        summe += wert * nimm
        gezaehlt += nimm
    voll = sum(w * a for w, a in enumerate(h)) / n
    return summe / max(gezaehlt, 1), sum(h[25:]) / n, voll


def nelder_mead(f, x0, schritte, runden=160):
    pkt = [list(x0)] + [[x0[j] + (schritte[j] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
    werte = [f(p) for p in pkt]
    for _ in range(runden):
        ordnung = sorted(range(len(pkt)), key=lambda i: werte[i])
        pkt, werte = [pkt[i] for i in ordnung], [werte[i] for i in ordnung]
        mitte = [sum(p[j] for p in pkt[:-1]) / (len(pkt) - 1) for j in range(len(x0))]
        spiegel = [mitte[j] + (mitte[j] - pkt[-1][j]) for j in range(len(x0))]
        fs = f(spiegel)
        if fs < werte[0]:
            weit = [mitte[j] + 2 * (mitte[j] - pkt[-1][j]) for j in range(len(x0))]
            fw = f(weit)
            pkt[-1], werte[-1] = (weit, fw) if fw < fs else (spiegel, fs)
        elif fs < werte[-2]:
            pkt[-1], werte[-1] = spiegel, fs
        else:
            zieh = [mitte[j] + 0.5 * (pkt[-1][j] - mitte[j]) for j in range(len(x0))]
            fz = f(zieh)
            if fz < werte[-1]:
                pkt[-1], werte[-1] = zieh, fz
            else:  # alles zum besten Punkt hin zusammenziehen
                pkt = [pkt[0]] + [[pkt[0][j] + 0.5 * (p[j] - pkt[0][j]) for j in range(len(x0))] for p in pkt[1:]]
                werte = [werte[0]] + [f(p) for p in pkt[1:]]
    i = min(range(len(pkt)), key=lambda i: werte[i])
    return pkt[i], werte[i]


K = 6  # Suche auf einem Sechstel der Auflösung, dann nachschärfen auf einem Drittel
K2 = 3


def deckung(bild, rand):
    """Was dieses Handy samt Schatten verdeckt (für die Handys dahinter), etwas verbreitert."""
    return bild.getchannel("A").point(lambda v: 255 if v >= 12 else 0).filter(ImageFilter.MaxFilter(rand))


def suche(voll, m, start, original, K, verdeckt_voll, trim, schritte, runden):
    """Teil auf die Verkleinerung K bringen und die beste Lage ab start suchen."""
    ziel_bild = original.resize((original.width // K, original.height // K), Image.LANCZOS)
    verdeckt = verdeckt_voll.resize(ziel_bild.size) if verdeckt_voll else None
    P = start[3] / K
    teil = voll.resize((round(voll.width * P / m["px"]), round(voll.height * P / m["px"])), Image.LANCZOS)
    ziel = lambda p: abweichung(ziel_bild, platziere(teil, m, p, ziel_bild.size, K, P), trim, verdeckt)[0]
    return nelder_mead(ziel, start, schritte, runden)


# Optional nur eine Vorlage prüfen: python vorlagen-vergleich.py hero
nur = sys.argv[1] if len(sys.argv) > 1 else ""
bericht, alle_ok = [], True
for datei, trim, handys in VORLAGEN:
    if nur not in datei:
        continue
    original = Image.open(os.path.join(ORIGINAL, datei)).convert("RGB")
    verdeckt = None  # wächst mit jedem eingepassten Handy
    platziert = []   # für den Nachbau (von hinten nach vorne einfügen)
    print(f"\n{datei}")
    for name, kandidaten, start in handys:
        ergebnisse = []
        for tn in kandidaten:
            m = meta[tn]
            voll = Image.open(os.path.join(TEILE, tn + ".png")).convert("RGBA")
            # Drei Start-Massstäbe, der beste wird nachgeschärft
            laeufe = [suche(voll, m, (start[0], start[1], start[2], start[3] * f), original, K, verdeckt, trim,
                            (12, 12, 1.5, start[3] * 0.03), 70) for f in (0.94, 1.0, 1.06)]
            lage = min(laeufe, key=lambda l: l[1])[0]
            lage, _ = suche(voll, m, lage, original, K2, verdeckt, trim, (3, 3, 0.4, lage[3] * 0.008), 60)
            # In voller Auflösung messen (Teil vorher auf den gefundenen Massstab bringen)
            P2 = lage[3]
            teil_voll = voll.resize((round(voll.width * P2 / m["px"]), round(voll.height * P2 / m["px"])), Image.LANCZOS)
            bild = platziere(teil_voll, m, lage, original.size, 1, P2)
            getrimmt, anteil, mittel = abweichung(original, bild, trim, verdeckt)
            ergebnisse.append((getrimmt, tn, lage, bild, anteil, mittel))
        ergebnisse.sort(key=lambda e: e[0])
        getrimmt, tn, lage, bild, anteil, mittel = ergebnisse[0]
        ok = getrimmt < 4 and anteil < 0.05
        alle_ok &= ok
        andere = ", ".join(f"{e[1]} {e[0]:.1f}" for e in ergebnisse[1:])
        print(f"  {'✓' if ok else '✗'} {name:20} bestes Teil: {tn:22} Abweichung {getrimmt:4.1f}/255 "
              f"(ohne Auslassen {mittel:4.1f}), Pixel über 24: {anteil:5.1%}\n      "
              f"Lage: Mitte {lage[0]:.0f}/{lage[1]:.0f}, {lage[2]:+.1f}°, {lage[3]:.3f} px/Einheit"
              + (f"\n      zum Vergleich: {andere}" if andere else ""))
        bericht.append(dict(vorlage=datei, handy=name, teil=tn, abweichung=round(getrimmt, 2), ohne_auslassen=round(mittel, 2),
                            anteil_ueber_24=round(anteil, 4), lage=[round(v, 3) for v in lage], ok=ok,
                            andere={e[1]: round(e[0], 2) for e in ergebnisse[1:]}))
        # Ausschnitt: Original | Motor | Abweichung
        d = deckung(bild, 9)
        verdeckt = d if verdeckt is None else ImageChops.lighter(verdeckt, d)
        platziert.append(bild)
        box = bild.getchannel("A").point(lambda v: 255 if v >= 250 else 0).getbbox()
        box = (max(0, box[0] - 20), max(0, box[1] - 20), min(original.width, box[2] + 20), min(original.height, box[3] + 20))
        o = original.crop(box)
        mo = Image.alpha_composite(original.convert("RGBA"), bild).convert("RGB").crop(box)
        di = ImageChops.difference(o, mo).point(lambda v: min(255, v * 4))
        drei = Image.new("RGB", (o.width * 3 + 40, o.height), "white")
        for i, x in enumerate((o, mo, di)):
            drei.paste(x, (i * (o.width + 20), 0))
        drei.thumbnail((2400, 900))
        drei.save(os.path.join(AUS, f"{datei[:-4]}-{name.replace(' ', '_')}.png"))
    # Nachbau: links Original, rechts Motor (hinterstes Handy zuerst)
    nachbau = original.convert("RGBA")
    for bild in reversed(platziert):
        nachbau = Image.alpha_composite(nachbau, bild)
    beide = Image.new("RGB", (original.width * 2 + 40, original.height), "white")
    beide.paste(original, (0, 0))
    beide.paste(nachbau.convert("RGB"), (original.width + 40, 0))
    beide.thumbnail((2400, 1200))
    beide.save(os.path.join(AUS, f"{datei[:-4]}-nachbau.png"))

json.dump(bericht, open(os.path.join(AUS, f"bericht{'-' + nur if nur else ''}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("\n" + ("✓ Alle Handys stimmen mit den Vorlagen überein." if alle_ok else "✗ Mindestens ein Handy weicht ab, siehe oben."))
print("Bilder: scripts/ausgabe/vergleich/")
sys.exit(0 if alle_ok else 1)
