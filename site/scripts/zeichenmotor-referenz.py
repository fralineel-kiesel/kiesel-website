"""Referenz für den Zeichen-Motor: ruft die ORIGINAL-Funktionen aus design/generator auf.

Wird von pruefe-zeichenmotor.mjs gestartet. Liest eine Liste von Aufrufen als JSON von
stdin, zum Beispiel
    [{"fn": "back_svg", "args": ["pro", {...Farbe...}, "q1"], "kwargs": {"case": {...}}}]
und schreibt die erzeugten SVG-Texte als JSON-Liste nach stdout.

phone() steht in gen2.py, das beim Import sofort alle Artboards schreiben würde. Darum
lesen wir nur diese eine Funktion aus dem Quelltext (mit ast) und führen sie aus.
"""
import ast, json, os, sys

HIER = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HIER, "..", "..", "design", "generator")
sys.path.insert(0, GEN)

import lib, scene  # noqa: E402

def gen2_funktion(name, namensraum):
    quelle = open(os.path.join(GEN, "gen2.py"), encoding="utf-8").read()
    for knoten in ast.parse(quelle).body:
        if isinstance(knoten, ast.FunctionDef) and knoten.name == name:
            exec(compile(ast.Module(body=[knoten], type_ignores=[]), "gen2.py", "exec"), namensraum)
            return namensraum[name]
    raise KeyError(name)

NS = {"E": lib.E, "f": lib.f, "MODELS": lib.MODELS, "back_svg": lib.back_svg, "front_svg": lib.front_svg, "PID": [0]}
phone = gen2_funktion("phone", NS)

def gen2_phone(n, *args, **kwargs):
    NS["PID"][0] = n - 1  # phone() zählt selbst hoch, so wird pid = "q<n>"
    return phone(*args, **kwargs)

def phone_open(*args):
    g, legende = scene.phone_open(*args)
    return json.dumps([g, legende], ensure_ascii=False, separators=(",", ":"))  # wie JSON.stringify

FN = {
    "back_svg": lib.back_svg, "front_svg": lib.front_svg, "lens": lib.lens, "place": lib.place,
    "alpen": scene.alpen, "blume": scene.blume, "crop": scene.crop, "phone_open": phone_open,
    "gen2_phone": gen2_phone,
}

aufrufe = json.load(sys.stdin)
aus = [FN[a["fn"]](*a.get("args", []), **a.get("kwargs", {})) for a in aufrufe]
sys.stdout.write(json.dumps(aus, ensure_ascii=False))
