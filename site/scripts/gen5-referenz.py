"""Referenz für Etappe 8b: das Artboard „Privacy-Modus in zwei Stufen“ aus design/generator/gen5.py.

gen5.py baut auf gen2.py auf, und beide schreiben beim Import sofort Dateien in Ordner, die es
nur auf dem Rechner der Designerin gibt. Darum leiten wir hier jedes Schreiben ins Leere um
(und geben für canvas_current.json eine leere Leinwand) und führen gen5.py dann normal aus.

Ausgabe (JSON auf stdout):
  html:   Markup des Artboards mit {{Löchern}} und <sc-for>, wie es gen5.py erzeugt
  js:     Rechnung (priv_js) = Rumpf von renderVals()
  kopf:   JSHEAD aus gen2.py (THEMES, PAL, …)
  zeilen: ROWS aus gen5.py

gen5-referenz.mjs füllt die Löcher für einen Zustand aus (stufe, notruf, thema)."""
import builtins, io, json, os, sys

HIER = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HIER, "..", "..", "design", "generator")
sys.path.insert(0, GEN)

echt_open, echt_groesse = builtins.open, os.path.getsize

def still_open(pfad, modus="r", *a, **k):
    pfad = str(pfad)
    if pfad.endswith("canvas_current.json"):
        return io.StringIO(json.dumps({"boards": {"x": {"x": 0, "y": 0, "w": 1, "h": 1}}, "order": []}))
    if "w" in modus or "a" in modus:
        return io.StringIO()  # Schreiben verschwindet
    return echt_open(pfad, modus, *a, **k)

builtins.open = still_open
os.path.getsize = lambda p: 0
alt_stdout, sys.stdout = sys.stdout, io.StringIO()  # gen5.py druckt Dateigrössen
try:
    import gen2, gen5  # noqa: E402
finally:
    sys.stdout = alt_stdout
    builtins.open, os.path.getsize = echt_open, echt_groesse

print(json.dumps({"html": gen5.priv_html, "js": gen5.priv_js, "kopf": gen2.JSHEAD, "zeilen": gen5.ROWS}, ensure_ascii=False))
