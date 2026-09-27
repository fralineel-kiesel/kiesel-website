"""Etappe 5: Artboards Funktionen, Zubehoer, Huelle.
Baut auf gen2.py auf (gleiche Bausteine, gleiches Designsystem)."""
import json, os, sys
sys.path.insert(0, "/home/claude/kgen")
import gen2
from gen2 import (E, V, css, disp, body, btn, pill, glass_chip, phone, stage, nav, footer, section, swatch_loop, SW_JS,
                  T_JS, THEME_PROP, page, root, icon, alpen, crop, holes, PAL, COLOPTS, ZOOM_TARGETS, f, zoom_pills,
                  BG, SURF, RAI, INK, MUT, LINE, ACC, ACCI, HEAT, OVL, STG, STGLO, BODY, DISP)
from lib import MODELS, front_svg, back_svg

ROOT = gen2.ROOT
C = holes("c"); K = holes("k")
NEW = []
def write(name, html):
    open(os.path.join(ROOT, name), "w").write(html); NEW.append(name)

def h2(t, size=56):
    return E("h2", {"style": disp(size, lh="1.02", ls="-0.04em")}, t)

def lead(t, mt="16px", mw="640px"):
    return E("p", {"style": body(19, col=MUT) + f"; margin-top: {mt}; max-width: {mw}"}, t)

def toggle_btn(on_hole, track_hole, knob_hole, handler, label_hole):
    return E("button", {"type": "button", "onClick": "{{%s}}" % handler, "aria-pressed": "{{%s}}" % on_hole,
                        "style": css(display="inline-flex", align_items="center", gap="14px", padding="6px 0", background="transparent", border="0", color=INK, cursor="pointer", font_family=BODY, font_size="17px", font_weight="600", min_height="44px")},
        E("span", {"style": css(width="54px", height="32px", border_radius="16px", position="relative", display="block", flex_shrink="0") + "; background: {{%s}}" % track_hole},
          E("span", {"style": css(position="absolute", top="4px", width="24px", height="24px", border_radius="12px", background="#FFFFFF", display="block") + "; left: {{%s}}" % knob_hole}, "")) +
        E("span", {}, "{{%s}}" % label_hole))

PN = [0]
def phone_overlay(mk, col, h, overlay):
    """Vorderseite mit zusaetzlicher Ebene im Handy-Koordinatensystem (fuer den Zen-Sperrbildschirm)."""
    PN[0] += 1; pid = f"zo{PN[0]}"
    m = MODELS[mk]; W, H = m["W"], m["H"]; pad = 200
    vbw, vbh = W + 2*pad, H + 2*pad
    fl = E("defs", {}, E("filter", {"id": pid + "fl", "x": "-50%", "y": "-200%", "width": "200%", "height": "500%"}, E("feGaussianBlur", {"stdDeviation": "26"}))) + \
         E("ellipse", {"cx": f(W/2), "cy": f(H + 80), "rx": f(W*0.44), "ry": "30", "style": "fill: #000000; opacity: 0.35", "filter": f"url(#{pid}fl)"})
    return E("svg", {"width": f(h*vbw/vbh), "height": f(h), "viewBox": f"{-pad} {-pad} {vbw} {vbh}", "role": "img", "aria-label": "Kiesel 1 Pro, Sperrbildschirm", "style": "display: block; overflow: visible"},
             fl + front_svg(mk, col, pid) + overlay)

def crop_phone(kind, mk, col, vb, w, h, case=None, label="Detail"):
    PN[0] += 1; pid = f"cp{PN[0]}"
    inner = back_svg(mk, col, pid, case=case) if kind == "back" else front_svg(mk, col, pid, case=case)
    return E("svg", {"width": f(w), "height": f(h), "viewBox": vb, "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": label, "style": "display: block"}, inner)

# =====================================================================
# 1. FUNKTIONEN
# =====================================================================
LEDH = {"color": "{{led.color}}", "o1": "{{led.o1}}", "o2": "{{led.o2}}", "mid": "{{led.mid}}", "edge": "{{led.edge}}"}

anchor = E("div", {"style": css(display="flex", gap="8px", margin_top="32px", flex_wrap="wrap")},
    "".join(E("a", {"href": h, "style": css(display="inline-flex", align_items="center", gap="8px", padding="10px 18px", border_radius="999px", border=f"1px solid {LINE}", background=SURF, color=INK, text_decoration="none", font_family=BODY, font_size="15px", font_weight="500", min_height="44px", box_sizing="border-box")}, t)
            for t, h in [("RGB-Licht", "#rgb"), ("Zen-Modus", "#zen"), ("Privacy-Modus", "#privacy"), ("Kamera entdecken", "#kamera")]))

ev_chips = E("div", {"role": "group", "aria-label": "Ereignis wählen", "style": css(display="flex", flex_wrap="wrap", gap="8px", margin_top="28px")},
    E("sc-for", {"list": "{{events}}", "as": "e", "hint-placeholder-count": "8"},
      E("button", {"type": "button", "onClick": "{{e.pick}}", "aria-pressed": "{{e.pressed}}",
                   "style": css(display="inline-flex", align_items="center", gap="8px", padding="0 16px", min_height="44px", border_radius="999px", cursor="pointer", font_family=BODY, font_size="15px", font_weight="500") + "; background: {{e.bg}}; color: {{e.fg}}; border: 1px solid {{e.bd}}"},
        E("span", {"style": css(width="10px", height="10px", border_radius="5px", display="block", box_shadow="inset 0 0 0 1px rgba(0,0,0,0.25)") + "; background: {{e.dot}}"}, "") + "{{e.name}}")))

rgb_sec = E("div", {"id": "rgb"}, section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 5fr) minmax(0, 6fr)", gap="64px", align_items="center")},
    stage(phone("back", "pro", C, 560, rot=-6, led=LEDH), 560, 680, 32) +
    E("div", {"style": css(display="flex", flex_direction="column")},
      h2("Ein Punkt, der Bescheid gibt.") +
      lead("Die Blitz-LED neben der Kamera ist RGB. Liegt das Handy mit dem Display nach unten, siehst du trotzdem, was los ist, ohne dass das Display aufwacht.", mw="560px") +
      ev_chips +
      E("div", {"style": css(margin_top="24px", padding="20px 22px", border_radius="20px", background=SURF, border=f"1px solid {LINE}", display="flex", flex_direction="column", gap="6px")},
        E("span", {"style": disp(20, lh="1.25", ls="-0.01em")}, "{{evTitle}}") +
        E("span", {"style": body(16, col=MUT)}, "{{evDesc}}"))))))

# Zen: Sperrbildschirm mit Benachrichtigungen (Pro-Koordinaten W=642)
W = MODELS["pro"]["W"]
notifs = ""
for i, (colr, t1, t2) in enumerate([("#3FB6D3", 0.38, 0.52), ("#35D07F", 0.30, 0.46), ("#F2A33A", 0.42, 0.34)]):
    y = 480 + i*150
    notifs += E("rect", {"x": "40", "y": f(y), "width": f(W-80), "height": "126", "rx": "36", "style": "fill: #FFFFFF; opacity: 0.16"})
    notifs += E("rect", {"x": "66", "y": f(y+31), "width": "64", "height": "64", "rx": "16", "style": f"fill: {colr}"})
    notifs += E("rect", {"x": "152", "y": f(y+38), "width": f(W*t1), "height": "16", "rx": "8", "style": "fill: #E9EEF3; opacity: 0.85"})
    notifs += E("rect", {"x": "152", "y": f(y+72), "width": f(W*t2), "height": "13", "rx": "6.5", "style": "fill: #E9EEF3; opacity: 0.45"})
zen_overlay = E("g", {"style": "opacity: {{zen.notifOp}}"}, notifs) + \
    E("g", {"style": "opacity: {{zen.pillOp}}"},
      E("rect", {"x": f(W/2-160), "y": "404", "width": "320", "height": "64", "rx": "32", "style": "fill: #FFFFFF; opacity: 0.16"}) +
      E("text", {"x": f(W/2), "y": "446", "style": "font-family: 'Instrument Sans', sans-serif; font-size: 30px; font-weight: 600; fill: #F3F6F8; text-anchor: middle"}, "Zen-Modus"))

quiet = "".join(E("li", {"style": css(display="flex", align_items="center", gap="12px", padding="12px 0", border_top=f"1px solid {LINE}")},
    E("span", {"style": css(width="28px", height="28px", border_radius="14px", display="flex", align_items="center", justify_content="center", background=RAI, color=INK, flex_shrink="0")}, icon("check", 16)) +
    E("span", {"style": body(16, col=INK)}, t)) for t in ["Anrufe", "Benachrichtigungen", "Vibration", "RGB-Licht"])

zen_sec = E("div", {"id": "zen"}, section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 6fr) minmax(0, 5fr)", gap="64px", align_items="center")},
    E("div", {"style": css(display="flex", flex_direction="column")},
      h2("Zen-Modus") +
      lead("Ein Druck auf den Action-Button, und das Handy ist still. Nochmal drücken, und alles ist wieder da.", mw="520px") +
      E("div", {"style": "margin-top: 28px"}, toggle_btn("zen.pressed", "zen.track", "zen.knob", "toggleZen", "zen.label")) +
      E("h3", {"style": body(14, w=600, col=MUT) + "; margin-top: 32px; margin-bottom: 4px"}, "Still wird:") +
      E("ul", {"style": css(list_style="none", margin="0", padding="0", max_width="420px")}, quiet) +
      E("p", {"style": body(14, col=MUT) + "; margin-top: 18px"}, "Reine Software, braucht also keinen Millimeter Platz.")) +
    stage(phone_overlay("pro", PAL["Titangrau"], 560, zen_overlay), 520, 680, 32))))

# Privacy-Schema (640 x 380)
rows = ""
for i, (name, y) in enumerate([("Kamera", 80), ("Mikrofon", 190), ("GPS", 300)]):
    rows += E("rect", {"x": "20", "y": f(y-34), "width": "150", "height": "68", "rx": "14", "style": f"fill: {SURF}; stroke: {LINE}; stroke-width: 1.2"})
    rows += E("text", {"x": "95", "y": f(y-4), "style": f"font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 600; fill: {INK}; text-anchor: middle"}, name)
    rows += E("text", {"x": "95", "y": f(y+17), "style": "font-family: 'Instrument Sans', sans-serif; font-size: 12.5px; fill: {{pv.statusCol}}; text-anchor: middle"}, "{{pv.status}}")
    rows += E("path", {"d": f"M170 {y} H222", "style": f"fill: none; stroke: {ACC}; stroke-width: 2.5"})
    rows += E("circle", {"cx": "228", "cy": f(y), "r": "6", "style": f"fill: {BG}; stroke: {INK}; stroke-width: 2"})
    rows += E("line", {"x1": "228", "y1": f(y), "x2": "282", "y2": f(y), "transform": "rotate({{pv.angle}} 228 %s)" % f(y), "style": f"stroke: {INK}; stroke-width: 3; stroke-linecap: round"})
    rows += E("circle", {"cx": "288", "cy": f(y), "r": "6", "style": f"fill: {BG}; stroke: {INK}; stroke-width: 2"})
    rows += E("path", {"d": f"M294 {y} H340 C380 {y} 390 190 440 190", "style": "fill: none; stroke: {{pv.wire}}; stroke-width: 2.5; stroke-dasharray: {{pv.dash}}"})
priv_svg = E("svg", {"width": "640", "height": "380", "viewBox": "0 0 640 380", "role": "img", "aria-label": "Schema: Kamera, Mikrofon und GPS hängen über je einen Schalter an der Platine", "style": "display: block; max-width: 100%"},
    rows +
    E("rect", {"x": "440", "y": "120", "width": "170", "height": "140", "rx": "16", "style": f"fill: {SURF}; stroke: {LINE}; stroke-width: 1.2"}) +
    E("text", {"x": "525", "y": "178", "style": f"font-family: 'Instrument Sans', sans-serif; font-size: 15px; font-weight: 600; fill: {INK}; text-anchor: middle"}, "Platine") +
    E("text", {"x": "525", "y": "200", "style": f"font-family: 'Instrument Sans', sans-serif; font-size: 12.5px; fill: {MUT}; text-anchor: middle"}, "{{pv.main}}") +
    E("circle", {"cx": "525", "cy": "232", "r": "9", "style": "fill: {{pv.ind}}"}))

def two_list(title, items, col):
    return E("div", {"style": css(display="flex", flex_direction="column", gap="8px")},
        E("h3", {"style": body(14, w=600, col=MUT)}, title) +
        "".join(E("span", {"style": body(16, col=INK) + "; display: flex; align-items: center; gap: 10px"}, E("span", {"style": css(width="8px", height="8px", border_radius="4px", display="block", flex_shrink="0") + f"; background: {col}"}, "") + t) for t in items))

priv_sec = E("div", {"id": "privacy"}, section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 6fr) minmax(0, 5fr)", gap="64px", align_items="center")},
    E("div", {"style": css(padding="32px", border_radius="32px", background=BG, border=f"1px solid {LINE}")}, priv_svg) +
    E("div", {"style": css(display="flex", flex_direction="column")},
      h2("Privacy-Modus") +
      lead("Halte den Action-Button zwei Sekunden. Drei Schalter trennen Kamera, Mikrofon und GPS vom Strom. Keine Software-Sperre: Ohne Strom kann auch eine gehackte App nichts aufnehmen.", mw="520px") +
      E("div", {"style": "margin-top: 28px"}, toggle_btn("pv.pressed", "pv.track", "pv.knob", "togglePriv", "pv.label")) +
      E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="24px", margin_top="32px")},
        two_list("Funktioniert weiter", ["Nachrichten", "Internet", "Musik"], ACC) +
        two_list("Pausiert", ["Telefonieren", "Fotos und Video", "Navigation"], HEAT)) +
      E("p", {"style": body(14, col=MUT) + "; margin-top: 20px"}, "Solange der Modus aktiv ist, leuchtet der RGB-Punkt dauerhaft orange.")))))

# Kamera entdecken: Zoom mit Linsenwechsel und "3 von 8 entdeckt"
FOUND = {"Gipfelkreuz", "Seilschaft auf dem Grat", "SAC-Hütte mit Fahne"}
gx, gy = ZOOM_TARGETS[0][1], ZOOM_TARGETS[0][2]
dots = "".join(E("span", {"style": css(width="8px", height="8px", border_radius="4px", display="block") + ("; background: #FFFFFF" if i < 3 else "; background: rgba(255,255,255,0.3)")}, "") for i in range(8))
ticks = ""
for v, lab in [(0.5, "0.5x"), (1, "1x"), (3, "3x"), (5, "5x"), (10, "10x")]:
    import math
    pos = (math.log(v) - math.log(0.5)) / (math.log(10) - math.log(0.5)) * 100
    ticks += E("span", {"style": css(position="absolute", top="18px", transform="translateX(-50%)", font_family=BODY, font_size="13px", font_weight="600", white_space="nowrap") + f"; left: {pos:.1f}%; color: {INK if v == 3 else MUT}"}, lab + (" · Tele" if v == 3 else ""))
knob_pos = (math.log(6) - math.log(0.5)) / (math.log(10) - math.log(0.5)) * 100
tele_pos = (math.log(3) - math.log(0.5)) / (math.log(10) - math.log(0.5)) * 100
slider = E("div", {"style": css(position="relative", height="44px", margin_top="24px")},
    E("div", {"style": css(position="absolute", left="0", right="0", top="6px", height="6px", border_radius="3px", background=LINE)}, "") +
    E("div", {"style": css(position="absolute", left="0", top="6px", height="6px", border_radius="3px") + f"; width: {knob_pos:.1f}%; background: {ACC}"}, "") +
    E("div", {"style": css(position="absolute", top="0", width="2px", height="18px", background=INK) + f"; left: {tele_pos:.1f}%"}, "") +
    E("div", {"role": "slider", "aria-label": "Zoomstufe", "aria-valuemin": "0.5", "aria-valuemax": "10", "aria-valuenow": "6", "tabindex": "0", "style": css(position="absolute", top="-6px", width="30px", height="30px", border_radius="15px", background="#FFFFFF", box_shadow="0 1px 4px rgba(0,0,0,0.35)", transform="translateX(-50%)") + f"; left: {knob_pos:.1f}%"}, "") + ticks)

lens_bar = E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.6fr)", gap="4px", margin_top="36px")},
    "".join(E("div", {"style": css(padding="12px 14px", border_radius="12px", display="flex", flex_direction="column", gap="2px") + (f"; background: {ACC}; color: {ACCI}" if on else f"; background: {SURF}; color: {INK}; border: 1px solid {LINE}")},
        E("span", {"style": body(14, w=600) + ("; color: inherit")}, a) + E("span", {"style": body(13) + "; color: inherit; opacity: 0.8"}, b))
        for a, b, on in [("0.5x bis 1x", "Hauptkamera, optisch", False), ("1x bis 3x", "Ausschnitt aus 50 MP", False), ("ab 3x", "Tele-Linse, danach Ausschnitt", True)]))

thumbs = ""
for i, (name, x, y) in enumerate(ZOOM_TARGETS):
    found = name in FOUND
    if found:
        img = E("svg", {"width": "136", "height": "85", "viewBox": crop(x, y, 8), "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": name, "style": "display: block"}, alpen(f"th{i}"))
    else:
        img = E("div", {"style": css(width="136px", height="85px", display="flex", align_items="center", justify_content="center", background=RAI, color=MUT, font_family=DISP, font_size="24px", font_weight="600")}, "?")
    thumbs += E("figure", {"style": css(margin="0", display="flex", flex_direction="column", gap="8px")},
        E("div", {"style": css(border_radius="12px", overflow="hidden") + (f"; border: 2px solid {ACC}" if found else f"; border: 1px solid {LINE}")}, img) +
        E("figcaption", {"style": body(13, w=600 if found else 400, col=INK if found else MUT)}, name if found else "Noch versteckt"))

kam_sec = E("div", {"id": "kamera"}, section(
    h2("Such das Gipfelkreuz.") +
    lead("Im Panorama sind acht Details versteckt, die erst beim Reinzoomen auftauchen. Bei 3x wechselt der Pro auf die Tele-Linse, das siehst du am kurzen Schärfe-Sprung.", mw="720px") +
    E("div", {"style": css(position="relative", height="560px", border_radius="28px", overflow="hidden", border=f"1px solid {LINE}", margin_top="40px")},
      E("svg", {"width": "1200", "height": "560", "viewBox": crop(gx, gy + 8, 6, 1200/560), "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": "Alpenpanorama bei 6x Zoom auf das Gipfelkreuz", "style": "display: block"}, alpen("kd")) +
      E("div", {"style": css(position="absolute", top="20px", left="20px", display="flex", gap="8px")}, glass_chip(icon("dot", 16) + "Tele · 6x")) +
      E("div", {"style": css(position="absolute", top="20px", right="20px")}, glass_chip(E("span", {"style": css(display="flex", gap="4px")}, dots) + "3 von 8 entdeckt")) +
      E("div", {"style": css(position="absolute", left="534px", top="200px", width="132px", height="132px", border_radius="66px", border="2px solid #FFFFFF", box_shadow="0 0 0 4px rgba(0,0,0,0.25)")}, "") +
      E("div", {"style": css(position="absolute", left="500px", top="344px")}, glass_chip(icon("check", 16) + "Gipfelkreuz entdeckt"))) +
    slider + lens_bar +
    E("div", {"style": css(display="flex", justify_content="space-between", gap="16px", margin_top="36px", overflow="hidden")}, thumbs)))

funk_html = root(1440, 4300,
    nav("Funktionen") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(E("h1", {"style": disp(112, lh="0.95", ls="-0.05em")}, "Funktionen") +
              lead("Vier Dinge, die es so bei keinem aktuellen iPhone gibt. Alle zum Ausprobieren.", mt="24px") + anchor, pad="72px 120px 0") +
      rgb_sec + zen_sec + priv_sec + kam_sec + footer()))

funk_js = T_JS + """
const s = this.state || {};
const ev = s.ev || 'call';
const L = {
  call: { name: 'Anruf', color: '#3D8BFF', o1: '0.85', o2: '0.4', mid: '#6FA8FF', edge: '#2A64C9', title: 'Anruf: pulsiert schnell blau', desc: 'So merkst du es auch, wenn das Handy mit dem Display nach unten auf dem Tisch liegt.' },
  msg: { name: 'Nachricht', color: '#A77BFF', o1: '0.85', o2: '0.4', mid: '#C4A6FF', edge: '#7650D1', title: 'Nachricht: zweimal kurz violett', desc: 'Danach eine Pause. Wiederholt sich, bis du nachschaust.' },
  charge: { name: 'Lädt', color: '#35D07F', o1: '0.6', o2: '0.3', mid: '#6EE3A5', edge: '#1F9A5C', title: 'Lädt: atmet langsam grün', desc: 'Der Punkt wird im Takt von etwa zwei Sekunden heller und dunkler.' },
  full: { name: 'Voll geladen', color: '#35D07F', o1: '0.8', o2: '0.38', mid: '#6EE3A5', edge: '#1F9A5C', title: 'Voll geladen: ruhig grün', desc: 'Kein Pulsieren mehr, einfach ein stilles Grün.' },
  low: { name: 'Akku tief', color: '#FF4B4B', o1: '0.8', o2: '0.38', mid: '#FF8080', edge: '#C42A2A', title: 'Akku unter 10 %: pulsiert langsam rot', desc: 'Zeit für die Steckdose oder den MagSafe-Puck.' },
  privacy: { name: 'Privacy', color: '#FF9A2E', o1: '0.85', o2: '0.42', mid: '#FFB866', edge: '#D0701A', title: 'Privacy-Modus: dauerhaft orange', desc: 'Solange Kamera, Mikrofon und GPS vom Strom getrennt sind.' },
  flash: { name: 'Fotoblitz', color: '#FFFFFF', o1: '0.8', o2: '0.4', mid: '#FFFFFF', edge: '#E8E2D2', title: 'Fotoblitz: neutrales Weiss', desc: 'Alle drei Farben voll an. Die Farbtemperatur passt sich dem Umgebungslicht an.' },
  off: { name: 'Aus', color: '#FFFFFF', o1: '0', o2: '0', mid: '#F6EDD8', edge: '#DCCBA6', title: 'Aus', desc: 'Der Punkt ist ein ganz normaler Blitz und fällt nicht auf.' }
};
const led = L[ev];
const events = Object.keys(L).map(k => ({ name: L[k].name, dot: k === 'off' ? t.line : L[k].color, pressed: k === ev ? 'true' : 'false', bg: k === ev ? t.ink : t.surface, fg: k === ev ? t.bg : t.ink, bd: k === ev ? t.ink : t.line, pick: () => this.setState({ ev: k }) }));
const zenOn = !!s.zen;
const zen = { pressed: zenOn ? 'true' : 'false', track: zenOn ? t.accent : t.line, knob: zenOn ? '26px' : '4px', label: zenOn ? 'Zen-Modus ausschalten' : 'Zen-Modus einschalten', notifOp: zenOn ? 0 : 1, pillOp: zenOn ? 1 : 0 };
const pOn = !!s.priv;
const pv = { pressed: pOn ? 'true' : 'false', track: pOn ? t.accent : t.line, knob: pOn ? '26px' : '4px', label: pOn ? 'Privacy-Modus ausschalten' : 'Privacy-Modus einschalten',
  angle: pOn ? '-32' : '0', wire: pOn ? t.muted : t.accent, dash: pOn ? '5 5' : 'none', status: pOn ? 'getrennt' : 'verbunden', statusCol: pOn ? t.heat : t.muted,
  main: pOn ? 'läuft weiter' : 'alles verbunden', ind: pOn ? '#FF9A2E' : t.line };
return { t, c: PAL.Titangrau, led, events, evTitle: led.title, evDesc: led.desc, zen, pv,
  toggleZen: () => this.setState({ zen: !zenOn }), togglePriv: () => this.setState({ priv: !pOn }) };"""
write("Funktionen.dc.html", page("Kiesel Funktionen", 1440, 4300, funk_html, THEME_PROP, funk_js))

# =====================================================================
# 2. ZUBEHOER (Shop-Uebersicht)
# =====================================================================
def product(mk, phone_col, case_col):
    pro = mk == "pro"
    sw = "".join(E("span", {"style": css(width="18px", height="18px", border_radius="9px", display="block", box_shadow="inset 0 0 0 1px rgba(0,0,0,0.2)") + f"; background: {PAL[n]['frame']}"}, "") for n in COLOPTS)
    return E("article", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="32px", display="flex", flex_direction="column", gap="0")},
        E("div", {"style": css(height="400px", display="flex", align_items="center", justify_content="center", border_radius="20px", margin_bottom="24px") + f"; background: linear-gradient(180deg, {STG}, {STGLO})"},
          phone("back", mk, PAL[phone_col], 340 if pro else 320, rot=-6, case=PAL[case_col])) +
        E("h3", {"style": disp(24, lh="1.2")}, "Kiesel-Hülle") +
        E("p", {"style": body(16, col=MUT) + "; margin-top: 4px"}, "für Kiesel 1 Pro" if pro else "für Kiesel 1") +
        E("div", {"style": css(display="flex", gap="6px", margin_top="16px")}, sw) +
        E("div", {"style": css(display="flex", justify_content="space-between", align_items="center", margin_top="24px", gap="12px")},
          E("span", {"style": body(18, w=600, col=INK)}, "CHF 59.–") +
          E("div", {"style": css(display="flex", gap="8px")}, btn("Ansehen", "Huelle.dc.html", "secondary", "s") + btn("In den Warenkorb", "Warenkorb.dc.html", "primary", "s"))))

soon = E("article", {"style": css(border=f"2px dashed {LINE}", border_radius="28px", padding="32px", display="flex", flex_direction="column", align_items="center", justify_content="center", gap="10px", text_align="center")},
    E("span", {"style": css(width="56px", height="56px", border_radius="28px", background=RAI, color=INK, display="flex", align_items="center", justify_content="center")}, icon("plus", 26)) +
    E("h3", {"style": disp(22, lh="1.2")}, "[Weiteres Zubehör]") +
    E("p", {"style": body(15, col=MUT) + "; max-width: 260px"}, "Platz für ein nächstes Produkt, zum Beispiel ein MagSafe-Ladegerät."))

chips = E("div", {"role": "group", "aria-label": "Filter", "style": css(display="flex", gap="8px", margin_top="32px")},
    pill("Alle", True) + pill("für Kiesel 1") + pill("für Kiesel 1 Pro"))

combi = E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 6fr) minmax(0, 5fr)", gap="64px", align_items="center")},
    stage(phone("back", "pro", C, 520, rot=-5, case=K), 640, 620, 32) +
    E("div", {"style": css(display="flex", flex_direction="column")},
      h2("Frei kombinieren.") +
      lead("Handy und Hülle wählst du unabhängig voneinander. Durch die milchige Rückseite schimmert die Handyfarbe immer ein bisschen durch.", mw="480px") +
      E("h3", {"style": body(15, w=600, col=INK) + "; margin-top: 32px; margin-bottom: 10px"}, "Handy: {{colName}}") +
      E("div", {"style": css(display="flex", gap="6px", flex_wrap="wrap")}, swatch_loop()) +
      E("h3", {"style": body(15, w=600, col=INK) + "; margin-top: 24px; margin-bottom: 10px"}, "Hülle: {{caseName}}") +
      E("div", {"style": css(display="flex", gap="6px", flex_wrap="wrap")}, swatch_loop("caseSwatches", "cs")) +
      E("div", {"style": "margin-top: 32px"}, btn("Diese Kombination kaufen", "Kaufen.dc.html", "primary", "l"))))

zub_html = root(1440, 2700,
    nav("Zubehör") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(E("h1", {"style": disp(112, lh="0.95", ls="-0.05em")}, "Zubehör") +
              lead("Alles, was zum Kiesel passt. Im Moment ist das vor allem eine Hülle, die man gern anfasst.", mt="24px") + chips, pad="72px 120px 0") +
      section(E("div", {"style": css(display="grid", grid_template_columns="repeat(3, minmax(0, 1fr))", gap="24px")},
          product("k1", "Kieselbeige", "Mattweiss") + product("pro", "Himmelblau", "Mattschwarz") + soon), pad="56px 120px 0") +
      section(combi) + footer()))

pair_js = T_JS + """
const s = this.state || {};
const col = s.col || 'Himmelblau';
const caseCol = s.caseCol || 'Mattweiss';
""" + SW_JS + """
const caseSwatches = Object.keys(PAL).map(k => ({ name: k, hex: PAL[k].frame, pressed: k === caseCol ? 'true' : 'false', ring: k === caseCol ? t.ink : 'transparent', pick: () => this.setState({ caseCol: k }) }));
"""
zub_js = pair_js + "return { t, c: PAL[col], k: PAL[caseCol], swatches, caseSwatches, colName: col, caseName: caseCol };"
write("Zubehoer.dc.html", page("Kiesel Zubehör", 1440, 2700, zub_html, THEME_PROP, zub_js))

# =====================================================================
# 3. HUELLE (Produktseite)
# =====================================================================
views = "".join([
    E("sc-if", {"value": "{{v.proBack}}", "hint-placeholder-val": "{{ true }}"}, phone("back", "pro", C, 580, rot=-4, case=K)),
    E("sc-if", {"value": "{{v.proFront}}", "hint-placeholder-val": "{{ false }}"}, phone("front", "pro", C, 580, rot=3, case=K)),
    E("sc-if", {"value": "{{v.k1Back}}", "hint-placeholder-val": "{{ false }}"}, phone("back", "k1", C, 546, rot=-4, case=K)),
    E("sc-if", {"value": "{{v.k1Front}}", "hint-placeholder-val": "{{ false }}"}, phone("front", "k1", C, 546, rot=3, case=K)),
])
view_tabs = E("div", {"role": "group", "aria-label": "Ansicht", "style": css(position="absolute", left="0", right="0", bottom="24px", display="flex", justify_content="center")},
    E("div", {"style": css(display="inline-flex", gap="4px", padding="4px", border_radius="999px", background="rgba(8, 13, 18, 0.66)")},
      E("sc-for", {"list": "{{viewTabs}}", "as": "vt", "hint-placeholder-count": "2"},
        E("button", {"type": "button", "onClick": "{{vt.pick}}", "aria-pressed": "{{vt.pressed}}", "style": css(height="40px", padding="0 18px", border_radius="999px", border="0", font_family=BODY, font_size="14px", font_weight="600", cursor="pointer") + "; background: {{vt.bg}}; color: {{vt.fg}}"}, "{{vt.name}}"))))

sel = lambda item, inner: E("button", {"type": "button", "onClick": "{{%s.pick}}" % item, "aria-pressed": "{{%s.pressed}}" % item,
    "style": css(text_align="left", padding="14px 18px", border_radius="16px", background=SURF, cursor="pointer", color=INK, display="flex", flex_direction="column", gap="2px", min_height="44px") + "; border: 1px solid {{%s.border}}; box-shadow: inset 0 0 0 1px {{%s.border2}}" % (item, item)}, inner)

PW, PH = MODELS["pro"]["W"], MODELS["pro"]["H"]
milky = crop_phone("back", "pro", PAL["Himmelblau"], f"{f(PW/2-260)} {f(PH*0.517-160)} 520 325", 400, 250, case=PAL["Mattweiss"], label="Nahaufnahme: milchige Rückseite mit durchschimmerndem Kiesel und MagSafe-Ring")
edge = crop_phone("back", "pro", PAL["Titangrau"], f"{f(PW-230)} 120 320 200", 400, 250, case=PAL["Kieselbeige"], label="Nahaufnahme: fester Rand mit Tastenabdeckungen")

# Profilschnitt: 1 mm = 18 px
mm = 18
prof = E("svg", {"width": "400", "height": "250", "viewBox": "0 0 400 250", "role": "img", "aria-label": "Schnitt: Hülle steht 0.8 mm über das Display und 0.6 mm über die Kamera", "style": "display: block"},
    E("rect", {"x": "0", "y": "0", "width": "400", "height": "250", "style": f"fill: {BG}"}) +
    E("line", {"x1": "20", "y1": "214", "x2": "380", "y2": "214", "style": f"stroke: {MUT}; stroke-width: 1.5; stroke-dasharray: 6 5"}) +
    E("text", {"x": "380", "y": "238", "style": f"font-family: 'Instrument Sans', sans-serif; font-size: 12px; fill: {MUT}; text-anchor: end"}, "Tisch") +
    # Huelle (U-Profil) + Handy
    E("path", {"d": f"M60 {214 - 0.6*mm - 1.4*mm} H90 V{214 - 0.6*mm} H330 V{214 - 0.6*mm - 1.4*mm} H350 V{214 - 0.6*mm - 1.4*mm - 9*mm - 0.8*mm} H336 V{214 - 0.6*mm - 1.4*mm - 9*mm + 4} H74 V{214 - 0.6*mm - 1.4*mm - 9*mm - 0.8*mm} H60 Z", "style": "fill: #DCDBD6; stroke: #A4A29B; stroke-width: 1"}) +
    E("rect", {"x": "74", "y": f(214 - 0.6*mm - 1.4*mm - 9*mm), "width": "262", "height": f(9*mm - 1.4*mm*0), "rx": "10", "style": "fill: #A7C4DE"}) +
    E("rect", {"x": "74", "y": f(214 - 0.6*mm - 1.4*mm - 9*mm), "width": "262", "height": "8", "rx": "4", "style": "fill: #0A0F14"}) +
    E("rect", {"x": "110", "y": f(214 - 0.6*mm - 1.4*mm), "width": "70", "height": f(1.4*mm), "rx": "6", "style": "fill: #55585D"}) +
    # Masse
    E("line", {"x1": "356", "y1": f(214 - 0.6*mm - 1.4*mm - 9*mm - 0.8*mm), "x2": "356", "y2": f(214 - 0.6*mm - 1.4*mm - 9*mm), "style": f"stroke: {ACC}; stroke-width: 2"}) +
    E("text", {"x": "364", "y": f(214 - 0.6*mm - 1.4*mm - 9*mm - 2), "style": f"font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 600; fill: {ACC}"}, "0.8 mm") +
    E("line", {"x1": "145", "y1": f(214 - 0.6*mm), "x2": "145", "y2": "214", "style": f"stroke: {ACC}; stroke-width: 2"}) +
    E("text", {"x": "190", "y": "240", "style": f"font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 600; fill: {ACC}"}, "0.6 mm Luft unter der Kamera") +
    E("text", {"x": "205", "y": f(214 - 0.6*mm - 1.4*mm - 4.5*mm), "style": "font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 600; fill: #0C1116; text-anchor: middle"}, "Kiesel 1 Pro"))

def prop_tile(vis, title, text):
    return E("article", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="20px 20px 28px", display="flex", flex_direction="column", gap="12px")},
        E("div", {"style": css(border_radius="18px", overflow="hidden", height="250px", display="flex", align_items="center", justify_content="center", margin_bottom="8px") + f"; background: {BG}"}, vis) +
        E("h3", {"style": disp(22, lh="1.2") + "; padding: 0 8px"}, title) + E("p", {"style": body(16, col=MUT) + "; padding: 0 8px"}, text))

details = [("Passt auf", "Kiesel 1 oder Kiesel 1 Pro, je eigene Grösse"), ("Farben", "Mattschwarz, Titangrau, Himmelblau, Mattweiss, Kieselbeige"), ("Rand", "trägt ca. 1.2 mm pro Seite auf"),
           ("Überstand", "ca. 0.8 mm über dem Display, ca. 0.6 mm über den Kameras"), ("MagSafe", "kompatibel, Magnetring sichtbar durch die Rückseite"), ("Material", "[Material]"), ("Preis", "CHF 59.–")]
det_html = "".join(E("div", {"style": css(display="grid", grid_template_columns="200px minmax(0, 1fr)", gap="24px", padding="16px 0", border_top=f"1px solid {LINE}")},
    E("span", {"style": body(16, w=600, col=INK)}, a) + E("span", {"style": body(16, col=MUT)}, b)) for a, b in details)

hue_html = root(1440, 3000,
    nav("Zubehör") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      E("nav", {"aria-label": "Brotkrumen", "style": css(padding="28px 120px 0", display="flex", gap="8px", align_items="center")},
        E("a", {"href": "Zubehoer.dc.html", "style": body(15, col=MUT) + "; text-decoration: none"}, "Zubehör") + E("span", {"style": body(15, col=MUT)}, "/") + E("span", {"style": body(15, w=600, col=INK), "aria-current": "page"}, "Kiesel-Hülle")) +
      E("section", {"style": css(padding="28px 120px 0", display="grid", grid_template_columns="minmax(0, 7fr) minmax(0, 5fr)", gap="64px", align_items="start")},
        stage(views + view_tabs, 680, 780, 32) +
        E("div", {"style": css(display="flex", flex_direction="column", padding_top="16px")},
          E("h1", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Kiesel-Hülle") +
          E("p", {"style": disp(28, lh="1.2", ls="-0.02em", w=500) + "; margin-top: 14px"}, "CHF 59.–") +
          E("p", {"style": body(17, col=MUT) + "; margin-top: 16px"}, "Hinten milchig, am Rand fest und griffig. Steht ein kleines bisschen über Display und Kamera, damit beides den Tisch nie berührt.") +
          E("h2", {"style": body(15, w=600, col=INK) + "; margin-top: 32px; margin-bottom: 10px"}, "Für welches Modell?") +
          E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="10px")},
            E("sc-for", {"list": "{{models}}", "as": "m", "hint-placeholder-count": "2"}, sel("m", E("span", {"style": disp(16, lh="1.2")}, "{{m.name}}") + E("span", {"style": body(13, col=MUT)}, "{{m.sub}}")))) +
          E("h2", {"style": body(15, w=600, col=INK) + "; margin-top: 28px; margin-bottom: 10px"}, "Farbe der Hülle: {{caseName}}") +
          E("div", {"style": css(display="flex", gap="6px", flex_wrap="wrap")}, swatch_loop("caseSwatches", "cs")) +
          E("h2", {"style": body(15, w=600, col=MUT) + "; margin-top: 24px; margin-bottom: 10px"}, "Vorschau mit Handyfarbe: {{colName}}") +
          E("div", {"style": css(display="flex", gap="4px", flex_wrap="wrap")}, swatch_loop(size=26)) +
          E("div", {"style": css(margin_top="32px", display="flex", flex_direction="column", gap="10px")},
            btn("In den Warenkorb", "Warenkorb.dc.html", "primary", "l", full=True) +
            E("p", {"style": body(14, col=MUT) + "; text-align: center"}, "Kostenloser Versand. Die Vorschau-Handyfarbe gehört nicht zur Bestellung.")))) +
      section(h2("Drei Dinge, die sie gut macht.") +
              E("div", {"style": css(display="grid", grid_template_columns="repeat(3, minmax(0, 1fr))", gap="24px", margin_top="44px")},
                prop_tile(milky, "Milchige Rückseite", "Halbtransparent wie Eis auf einem Bergsee. Handyfarbe, Kiesel und MagSafe-Ring schimmern durch.") +
                prop_tile(edge, "Fester Rand", "Griffig und dämpfend, in Farbe. Die Tasten sind abgedeckt und drücken sich trotzdem sauber.") +
                prop_tile(prof, "Erhöhter Rahmen", "Flach auf den Tisch gelegt, berührt nur die Hülle die Oberfläche. Display und Kamera bleiben in der Luft."))) +
      section(h2("Technische Details", 40) + E("div", {"style": css(display="flex", flex_direction="column", margin_top="28px", max_width="900px")}, det_html)) +
      footer()))

hue_js = pair_js + """
const model = s.model || 'pro';
const view = s.view || 'back';
const sel = on => ({ border: on ? t.ink : t.line, border2: on ? t.ink : 'transparent', pressed: on ? 'true' : 'false' });
const models = [['k1', 'Kiesel 1', 'SE-Grösse'], ['pro', 'Kiesel 1 Pro', '13-mini-Grösse']].map(x => ({ name: x[1], sub: x[2], pick: () => this.setState({ model: x[0] }), ...sel(x[0] === model) }));
const viewTabs = [['back', 'Rückseite'], ['front', 'Vorderseite']].map(x => ({ name: x[1], pressed: x[0] === view ? 'true' : 'false', bg: x[0] === view ? '#FFFFFF' : 'transparent', fg: x[0] === view ? '#0C1116' : '#FFFFFF', pick: () => this.setState({ view: x[0] }) }));
const v = { proBack: model === 'pro' && view === 'back', proFront: model === 'pro' && view === 'front', k1Back: model === 'k1' && view === 'back', k1Front: model === 'k1' && view === 'front' };
return { t, c: PAL[col], k: PAL[caseCol], swatches, caseSwatches, colName: col, caseName: caseCol, models, viewTabs, v };"""
write("Huelle.dc.html", page("Kiesel-Hülle Produktseite", 1440, 3000, hue_html, THEME_PROP, hue_js))

# =====================================================================
# canvas.json: aktuellen Stand nehmen, neue Reihe anhaengen
# =====================================================================
cv = json.load(open("/home/claude/kgen/canvas_current.json"))
bottom = max(b["y"] + b["h"] for b in cv["boards"].values())
R3 = bottom + 420
cv["boards"]["Funktionen.dc.html"] = {"x": 0, "y": R3, "w": 1440, "h": 4300, "title": "Funktionen", "is_interactive": True}
cv["boards"]["Zubehoer.dc.html"] = {"x": 1520, "y": R3, "w": 1440, "h": 2700, "title": "Zubehör", "is_interactive": True}
cv["boards"]["Huelle.dc.html"] = {"x": 3040, "y": R3, "w": 1440, "h": 3000, "title": "Kiesel-Hülle", "is_interactive": True}
for n in ["Funktionen.dc.html", "Zubehoer.dc.html", "Huelle.dc.html"]:
    if n not in cv["order"]: cv["order"].append(n)
cv["notes"]["etappe5"] = {"x": 0, "y": R3 - 300, "text": "Etappe 5: Funktionen und Zubehör", "kind": "title1", "maxW": 4480}
open(os.path.join(ROOT, "canvas.json"), "w").write(json.dumps(cv, ensure_ascii=False, indent=1))
for n in NEW + ["canvas.json"]:
    print(n, os.path.getsize(os.path.join(ROOT, n)))
print("R3", R3)
