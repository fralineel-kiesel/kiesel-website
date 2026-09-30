"""Etappe 8: Privacy-Modus in zwei Stufen (Sensoren / Funkstille) mit Notruf-Ausnahme.
Baut auf gen2.py auf (gleiche Bausteine, gleiches Designsystem)."""
import json, os, sys
sys.path.insert(0, "/home/claude/kgen")
import gen2
from gen2 import (E, css, disp, body, nav, footer, section, T_JS, THEME_PROP, page, root, icon, f,
                  BG, SURF, RAI, INK, MUT, LINE, ACC, ACCI, HEAT, BODY, DISP)

ROOT = gen2.ROOT
NEW = []
def write(name, html):
    open(os.path.join(ROOT, name), "w").write(html); NEW.append(name)

# ---------------- Schema: 6 Bauteile in zwei Gruppen ----------------
ROWS = [("Kamera", 1), ("Mikrofon", 1), ("GPS", 1), ("WLAN und Bluetooth", 2), ("Mobilfunk", 2), ("NFC", 2)]
YS = [92, 164, 236, 380, 452, 524]
PX, PY, PW, PH = 560, 230, 180, 200   # Platine
PCY = PY + PH / 2

def row_svg(i, name, y):
    r = "r%d" % i
    return (
        E("rect", {"x": "20", "y": f(y - 28), "width": "210", "height": "56", "rx": "14", "style": f"fill: {SURF}; stroke: {LINE}; stroke-width: 1.2"}) +
        E("text", {"x": "40", "y": f(y - 4), "style": f"font-family: {BODY}; font-size: 15px; font-weight: 600; fill: {INK}"}, name) +
        E("text", {"x": "40", "y": f(y + 15), "style": f"font-family: {BODY}; font-size: 12.5px; font-weight: 500; fill: {{{{{r}.col}}}}"}, "{{%s.status}}" % r) +
        E("path", {"d": f"M230 {y} H282", "style": f"fill: none; stroke: {ACC}; stroke-width: 2.5"}) +
        E("circle", {"cx": "288", "cy": f(y), "r": "6", "style": f"fill: {BG}; stroke: {INK}; stroke-width: 2"}) +
        E("line", {"x1": "288", "y1": f(y), "x2": "342", "y2": f(y), "transform": "rotate({{%s.angle}} 288 %s)" % (r, f(y)), "style": f"stroke: {INK}; stroke-width: 3; stroke-linecap: round"}) +
        E("circle", {"cx": "348", "cy": f(y), "r": "6", "style": f"fill: {BG}; stroke: {INK}; stroke-width: 2"}) +
        E("path", {"d": f"M354 {y} H430 C500 {y} 500 {PCY} {PX} {PCY}", "style": "fill: none; stroke: {{%s.wire}}; stroke-width: 2.5; stroke-dasharray: {{%s.dash}}" % (r, r)}))

group_lab = lambda y, t, hole: (
    E("text", {"x": "20", "y": f(y), "style": f"font-family: {BODY}; font-size: 13px; font-weight: 600; fill: {MUT}; letter-spacing: 0.02em"}, t) +
    E("rect", {"x": "180", "y": f(y - 16), "width": "50", "height": "22", "rx": "11", "style": "fill: {{%s.bg}}" % hole}) +
    E("text", {"x": "205", "y": f(y - 1), "style": "font-family: %s; font-size: 12px; font-weight: 600; fill: {{%s.fg}}; text-anchor: middle" % (BODY, hole)}, "{{%s.txt}}" % hole))

schema = E("svg", {"width": "760", "height": "580", "viewBox": "0 0 760 580", "role": "img", "aria-label": "{{aria}}", "style": "display: block; max-width: 100%"},
    group_lab(40, "Stufe 1: Sensoren", "g1") + group_lab(328, "Stufe 2: Funk", "g2") +
    "".join(row_svg(i, n, YS[i]) for i, (n, _) in enumerate(ROWS)) +
    E("rect", {"x": f(PX), "y": f(PY), "width": f(PW), "height": f(PH), "rx": "18", "style": f"fill: {SURF}; stroke: {LINE}; stroke-width: 1.2"}) +
    E("text", {"x": f(PX + PW/2), "y": f(PY + 64), "style": f"font-family: {BODY}; font-size: 16px; font-weight: 600; fill: {INK}; text-anchor: middle"}, "Platine") +
    E("text", {"x": f(PX + PW/2), "y": f(PY + 88), "style": f"font-family: {BODY}; font-size: 12.5px; fill: {MUT}; text-anchor: middle"}, "{{mainTxt}}") +
    E("circle", {"cx": f(PX + PW/2), "cy": f(PY + 132), "r": "22", "style": "fill: none; stroke: {{ledRing}}; stroke-width: 2; stroke-dasharray: 4 4"}) +
    E("circle", {"cx": f(PX + PW/2), "cy": f(PY + 132), "r": "11", "style": "fill: {{ledCol}}"}) +
    E("text", {"x": f(PX + PW/2), "y": f(PY + 178), "style": f"font-family: {BODY}; font-size: 12px; fill: {MUT}; text-anchor: middle"}, "{{ledTxt}}"))

# ---------------- Bedienelemente ----------------
level_sel = E("div", {"role": "group", "aria-label": "Stufe wählen", "style": css(display="inline-flex", gap="4px", padding="4px", border_radius="999px", background=SURF, border=f"1px solid {LINE}", margin_top="28px")},
    E("sc-for", {"list": "{{levels}}", "as": "lv", "hint-placeholder-count": "3"},
      E("button", {"type": "button", "onClick": "{{lv.pick}}", "aria-pressed": "{{lv.pressed}}",
                   "style": css(min_height="44px", padding="0 18px", border_radius="999px", border="0", cursor="pointer", font_family=BODY, font_size="15px", font_weight="600", white_space="nowrap") + "; background: {{lv.bg}}; color: {{lv.fg}}"}, "{{lv.name}}")))

hold = E("div", {"style": css(margin_top="28px", display="flex", flex_direction="column", gap="10px")},
    E("span", {"style": body(14, w=600, col=MUT)}, "Action-Button halten") +
    E("div", {"style": css(position="relative", height="10px", border_radius="5px", background=RAI)},
      E("div", {"style": css(position="absolute", left="0", top="0", bottom="0", border_radius="5px") + "; width: {{holdW}}; background: " + ACC}, "") +
      "".join(E("span", {"style": css(position="absolute", top="-5px", width="2px", height="20px", background=INK) + f"; left: {p}"}, "") for p in ["50%", "calc(100% - 2px)"])) +
    E("div", {"style": css(display="grid", grid_template_columns="repeat(3, minmax(0, 1fr))", gap="8px")},
      E("span", {"style": body(13, col=MUT)}, "0 s") +
      E("span", {"style": body(13, w=600, col=INK) + "; text-align: center"}, "2 s: Sensoren aus") +
      E("span", {"style": body(13, w=600, col=INK) + "; text-align: right"}, "4 s: Funkstille")))

def list_col(title, hole, dot):
    return E("div", {"style": css(display="flex", flex_direction="column", gap="10px")},
        E("h3", {"style": body(14, w=600, col=MUT)}, title) +
        E("sc-for", {"list": "{{%s}}" % hole, "as": "it", "hint-placeholder-count": "4"},
          E("span", {"style": body(16, col=INK) + "; display: flex; align-items: center; gap: 10px"},
            E("span", {"style": css(width="8px", height="8px", border_radius="4px", display="block", flex_shrink="0") + f"; background: {dot}"}, "") + "{{it}}")))

notruf = E("div", {"style": css(margin_top="32px", padding="22px 24px", border_radius="22px", display="flex", flex_direction="column", gap="12px") + "; background: {{nr.bg}}; border: 1px solid {{nr.bd}}"},
    E("div", {"style": css(display="flex", justify_content="space-between", align_items="center", gap="16px")},
      E("h3", {"style": disp(20, lh="1.25", ls="-0.01em")}, "Im Notfall: 5x Seitentaste") +
      E("button", {"type": "button", "onClick": "{{toggleNotruf}}", "aria-pressed": "{{nr.pressed}}", "aria-disabled": "{{nr.adis}}",
                   "style": css(min_height="44px", padding="0 16px", border_radius="999px", cursor="pointer", font_family=BODY, font_size="14px", font_weight="600", white_space="nowrap") + "; background: {{nr.btnBg}}; color: {{nr.btnFg}}; border: 1px solid {{nr.btnBd}}; opacity: {{nr.btnOp}}"}, "{{nr.btnTxt}}")) +
    E("p", {"style": body(15, col=MUT)}, "{{nr.txt}}"))

right = E("div", {"style": css(display="flex", flex_direction="column")},
    E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Privacy-Modus") +
    E("p", {"style": body(19, col=MUT) + "; margin-top: 18px; max-width: 540px"}, "Zwei Stufen, beide in Hardware. Stromlose Bauteile können nichts aufnehmen und nichts senden, auch wenn eine App es versucht. In der Funkstille ist das Handy zusätzlich für das Mobilfunknetz unsichtbar.") +
    level_sel +
    E("p", {"style": body(16, col=INK) + "; margin-top: 18px; min-height: 52px; max-width: 540px", "aria-live": "polite"}, "{{levelTxt}}") +
    hold +
    E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="24px", margin_top="32px")},
      list_col("Funktioniert weiter", "works", ACC) + list_col("Pausiert", "paused", HEAT)) +
    notruf)

priv_html = root(1440, 1500,
    nav("Funktionen") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 7fr) minmax(0, 6fr)", gap="56px", align_items="start")},
          E("div", {"style": css(padding="28px", border_radius="32px", background=BG, border=f"1px solid {LINE}")}, schema) + right), pad="96px 120px 0")))

priv_js = T_JS + """
const s = this.state || {};
const level = s.level ?? 0;
const notruf = !!s.notruf && level > 0;
const ROWS = """ + json.dumps(ROWS, ensure_ascii=False) + """;
// Notruf-Ausnahme schaltet Mobilfunk, Mikrofon und GPS zurück
const NOTRUF = ['Mobilfunk', 'Mikrofon', 'GPS'];
const row = ([name, stufe]) => {
  const cut = level >= stufe && !(notruf && NOTRUF.includes(name));
  const back = level >= stufe && notruf && NOTRUF.includes(name);
  return { status: cut ? 'getrennt' : (back ? 'für Notruf verbunden' : 'verbunden'), col: cut ? t.heat : (back ? t.accent : t.muted),
           angle: cut ? '-32' : '0', wire: cut ? t.muted : t.accent, dash: cut ? '5 5' : 'none' };
};
const r = ROWS.map(row);
const badge = on => ({ txt: on ? 'aus' : 'an', bg: on ? t.heat : t.surface, fg: on ? '#FFFFFF' : t.muted });
const LV = [['Aus', 'Alles verbunden. Der Kiesel funktioniert normal.'],
            ['Sensoren aus', 'Kamera, Mikrofon und GPS sind stromlos. Du bleibst erreichbar für Nachrichten und Internet.'],
            ['Funkstille', 'Zusätzlich sind WLAN, Bluetooth, Mobilfunk und NFC stromlos. Der Kiesel ist offline und für das Netz unsichtbar.']];
const levels = LV.map(([name], i) => ({ name, pressed: i === level ? 'true' : 'false', bg: i === level ? t.ink : 'transparent', fg: i === level ? t.bg : t.ink, pick: () => this.setState({ level: i, notruf: i === 0 ? false : !!s.notruf }) }));
const W = [['Alles'],
           ['Nachrichten', 'Internet', 'Musik', 'Bluetooth-Kopfhörer', 'Bezahlen mit dem Handy'],
           ['Musik und Podcasts offline', 'Notizen und Lesen', 'Wecker und Timer', 'Offline-Spiele']];
const P = [[],
           ['Telefonieren', 'Fotos und Video', 'Navigation'],
           ['Telefonieren und Nachrichten', 'Internet', 'Bluetooth-Kopfhörer', 'Bezahlen mit dem Handy', 'Fotos und Navigation']];
const works = notruf ? [...W[level], 'Notruf und Rückruf'] : W[level];
const paused = P[level].length ? P[level] : ['Nichts'];
const nr = {
  pressed: notruf ? 'true' : 'false', adis: level === 0 ? 'true' : 'false', btnOp: level === 0 ? 0.45 : 1,
  btnTxt: notruf ? 'Notruf beenden' : 'Simulieren', btnBg: notruf ? t.heat : t.surface, btnFg: notruf ? '#FFFFFF' : t.ink, btnBd: notruf ? t.heat : t.line,
  bg: notruf ? t.raised : t.surface, bd: notruf ? t.heat : t.line,
  txt: notruf ? 'Mobilfunk, Mikrofon und GPS sind wieder verbunden. Du kannst 112, 117 oder 144 anrufen, und dein Standort kann mitgeschickt werden. Der Mobilfunk bleibt an, bis du den Privacy-Modus beendest, damit dich die Rettung zurückrufen kann.'
             : (level === 0 ? 'Diese Ausnahme gilt nur, wenn der Privacy-Modus aktiv ist.' : 'Fünfmal schnell die Seitentaste drücken schaltet Mobilfunk, Mikrofon und GPS sofort wieder ein. So ist der Notruf in beiden Stufen immer möglich.')
};
return { t, r0: r[0], r1: r[1], r2: r[2], r3: r[3], r4: r[4], r5: r[5],
  g1: badge(level >= 1), g2: badge(level >= 2), levels, levelTxt: LV[level][1], works, paused, nr,
  holdW: ['0%', '50%', '100%'][level],
  mainTxt: level === 0 ? 'alles verbunden' : 'läuft weiter',
  ledCol: level === 0 ? t.line : '#FF9A2E', ledRing: level === 2 ? '#FF9A2E' : 'transparent',
  ledTxt: ['RGB-Punkt aus', 'Orange, ruhig', 'Orange, blinkt kurz'][level],
  toggleNotruf: () => { if (level > 0) this.setState({ notruf: !notruf }); },
  aria: 'Schema: sechs Bauteile hängen über je einen Schalter an der Platine. Aktuelle Stufe: ' + LV[level][0] + (notruf ? ', Notruf aktiv' : '') };"""
write("Privacy.dc.html", page("Kiesel Privacy-Modus in zwei Stufen", 1440, 1500, priv_html, THEME_PROP, priv_js))

cv = json.load(open("/home/claude/kgen/canvas_current.json"))
bottom = max(b["y"] + b["h"] for b in cv["boards"].values())
R5 = bottom + 420
cv["boards"]["Privacy.dc.html"] = {"x": 0, "y": R5, "w": 1440, "h": 1500, "title": "Privacy-Modus in zwei Stufen (ersetzt den Abschnitt in Funktionen)", "is_interactive": True}
if "Privacy.dc.html" not in cv["order"]: cv["order"].append("Privacy.dc.html")
open(os.path.join(ROOT, "canvas.json"), "w").write(json.dumps(cv, ensure_ascii=False, indent=1))
for n in NEW + ["canvas.json"]:
    print(n, os.path.getsize(os.path.join(ROOT, n)))
print("R5", R5)
