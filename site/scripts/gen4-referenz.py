"""Zieht die Referenz für Etappe 7 aus design/generator/gen4.py, ohne den Generator auszuführen
(der braucht gen2.py und schreibt Dateien): die Daten DEV, SPEC, FAQ und die JavaScript-Rechnung
der Artboards Vergleichen (cmp_js) und Akku-Rechner (akku_js). Ausgabe: JSON auf stdout.

Die Prüfskripte (pruefe-vergleichen.mjs, pruefe-akku-rechner.mjs, pruefe-faq.mjs) führen die
Original-Rechnung aus und vergleichen sie mit unserer. So bleibt die Seite exakt beim Artboard."""
import ast, json, os, re

hier = os.path.dirname(os.path.abspath(__file__))
quelle = open(os.path.join(hier, '..', '..', 'design', 'generator', 'gen4.py'), encoding='utf-8').read()
baum = ast.parse(quelle)

daten, js = {}, {}
for knoten in baum.body:
    if not isinstance(knoten, ast.Assign) or not isinstance(knoten.targets[0], ast.Name):
        continue
    name = knoten.targets[0].id
    if name in ('DEV', 'SPEC', 'FAQ'):
        daten[name] = ast.literal_eval(knoten.value)
    elif name == 'CHIP_JS':
        js['chip'] = ast.literal_eval(knoten.value)
    elif name in ('cmp_js', 'akku_js'):
        # T_JS + ... + """Rechnung""": der letzte Summand ist der Text der Rechnung
        teil = knoten.value
        while isinstance(teil, ast.BinOp):
            rechts = teil.right
            if isinstance(rechts, ast.Constant) and isinstance(rechts.value, str) and 'return' in rechts.value:
                js[name] = rechts.value
                break
            teil = teil.left

m = re.search(r'^SC, BASE, CX = ([\d.]+), (\d+), (\d+)$', quelle, re.M)
daten['SC'], daten['BASE'], daten['CX'] = float(m.group(1)), int(m.group(2)), int(m.group(3))
print(json.dumps({'daten': daten, 'js': js}, ensure_ascii=False))
