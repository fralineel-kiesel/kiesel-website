import json, os, sys
sys.path.insert(0, "/home/claude/kgen")
from lib import E, PAL, PALJS, FONTS, MODELS, back_svg, front_svg, holes, f, PEB, V1, V2, COLOPTS
from scene import alpen, crop, blume, phone_open, ZOOM_TARGETS

ROOT = "/mnt/user-data/outputs/artifacts/a73b6591-07ca-47cd-ac3c-01c82bfe231c/project"
os.makedirs(ROOT, exist_ok=True)

DISP = "'Unbounded', 'Arial Black', sans-serif"
BODY = "'Instrument Sans', 'Segoe UI', sans-serif"
TK = ["bg", "surface", "raised", "ink", "muted", "line", "accent", "accentInk", "heat", "overlay", "stage", "stageLo"]
T = {k: "{{t.%s}}" % k for k in TK}
BG, SURF, RAI, INK, MUT, LINE, ACC, ACCI, HEAT, OVL, STG, STGLO = [T[k] for k in TK]
THEMES = {
    "Dunkel": {"bg": "#0C1116", "surface": "#141B22", "raised": "#1C252E", "ink": "#EEF2F5", "muted": "#9AA7B3", "line": "#27313B", "accent": "#5CC3DB", "accentInk": "#05232B", "heat": "#FF8A5E", "overlay": "rgba(4, 8, 12, 0.66)", "stage": "#17202A", "stageLo": "#0A0F14"},
    "Hell": {"bg": "#EEF0F1", "surface": "#F8F9FA", "raised": "#FFFFFF", "ink": "#141A21", "muted": "#56616C", "line": "#D4DADF", "accent": "#0E7490", "accentInk": "#FFFFFF", "heat": "#C4502B", "overlay": "rgba(20, 26, 33, 0.45)", "stage": "#E6EBEE", "stageLo": "#D2D9DE"},
}
JSHEAD = "const THEMES=" + json.dumps(THEMES) + ";\n" + PALJS + "\nconst chf = n => 'CHF ' + n.toLocaleString('de-CH') + '.–';\n"
THEME_PROP = {"thema": {"editor": "enum", "options": ["Dunkel", "Hell"], "default": "Dunkel"}}

def css(**kw):
    return "; ".join(f"{k.replace('_', '-')}: {v}" for k, v in kw.items())

def V(tag, attrs):
    a = " ".join(f'{k}="{v}"' for k, v in attrs.items())
    return f"<{tag} {a}>"

def disp(size, lh="1.0", ls="-0.03em", w=600):
    return f"font-family: {DISP}; font-weight: {w}; font-size: {size}px; line-height: {lh}; letter-spacing: {ls}; margin: 0"

def body(size=17, lh="1.6", w=400, col=None):
    s = f"font-family: {BODY}; font-size: {size}px; line-height: {lh}; font-weight: {w}; margin: 0"
    return s + (f"; color: {col}" if col else "")

ICONS = {
    "bag": "M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z M9 8V6.5a3 3 0 0 1 6 0V8",
    "down": "M6 9l6 6 6-6", "up": "M6 15l6-6 6 6",
    "arrow": "M5 12h14 M13 6l6 6-6 6",
    "rotate": "M3.5 12a8.5 8.5 0 0 1 14.8-5.7 M18.6 2.8v3.8h-3.8 M20.5 12a8.5 8.5 0 0 1-14.8 5.7 M5.4 21.2v-3.8h3.8",
    "menu": "M4 7h16 M4 12h16 M4 17h16", "close": "M6 6l12 12 M18 6L6 18",
    "plus": "M12 5v14 M5 12h14", "minus": "M5 12h14", "check": "M5 12.5l4.5 4.5L19 7.5",
    "moon": "M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10Z",
    "shield": "M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z M9 12l2 2 4-4",
    "dot": "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
    "swap": "M8 7l-4 5 4 5 M16 7l4 5-4 5",
}
def icon(name, size=20):
    return E("svg", {"width": str(size), "height": str(size), "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0"},
             E("path", {"d": ICONS[name]}))

LOGO_N = [0]
def logo(size=30, ink=INK, vein=ACC):
    LOGO_N[0] += 1; cid = f"lg{LOGO_N[0]}"
    return E("svg", {"width": str(size), "height": str(size), "viewBox": "0 0 100 100", "aria-hidden": "true", "style": "flex-shrink: 0"},
             E("defs", {}, E("clipPath", {"id": cid}, E("path", {"d": PEB}))) +
             E("path", {"d": PEB, "style": f"fill: {ink}"}) +
             E("g", {"style": f"clip-path: url(#{cid})"},
               E("path", {"d": V1, "style": f"fill: none; stroke: {vein}; stroke-width: 7; stroke-linecap: round"}) +
               E("path", {"d": V2, "style": f"fill: none; stroke: {vein}; stroke-width: 2.2; stroke-linecap: round; opacity: 0.7"})))

def btn(text, href, kind="primary", size="m", ico=None, full=False):
    pad = {"s": "10px 18px", "m": "14px 24px", "l": "17px 30px"}[size]
    fs = {"s": 15, "m": 16, "l": 17}[size]
    base = css(display="inline-flex", align_items="center", justify_content="center", gap="8px", padding=pad, border_radius="999px",
               font_family=BODY, font_size=f"{fs}px", font_weight="600", text_decoration="none", white_space="nowrap", box_sizing="border-box")
    if full: base += "; width: 100%"
    if kind == "primary": base += f"; background: {ACC}; color: {ACCI}"
    elif kind == "secondary": base += f"; background: {SURF}; color: {INK}; border: 1px solid {LINE}"
    elif kind == "ink": base += f"; background: {INK}; color: {BG}"
    elif kind == "ghost": base += f"; background: transparent; color: {ACC}; padding: 0"
    return E("a", {"href": href, "style": base}, text + (icon(ico, 18) if ico else ""))

def pill(text, active=False, size=14):
    st = css(display="inline-flex", align_items="center", gap="6px", padding="8px 14px", border_radius="999px", font_family=BODY, font_size=f"{size}px", font_weight="500", cursor="pointer", white_space="nowrap")
    st += f"; background: {INK}; color: {BG}; border: 1px solid {INK}" if active else f"; background: {SURF}; color: {INK}; border: 1px solid {LINE}"
    return E("button", {"type": "button", "aria-pressed": "true" if active else "false", "style": st}, text)

def glass_chip(inner):
    return E("div", {"style": css(display="inline-flex", align_items="center", gap="8px", padding="8px 14px", border_radius="999px", background="rgba(8, 13, 18, 0.66)", color="#FFFFFF", font_family=BODY, font_size="14px", font_weight="500")}, inner)

# ---------------- Phones ----------------
PID = [0]
def phone(kind, mk, col, h, rot=0, case=None, led=None, floor_=True, label=None):
    PID[0] += 1; pid = f"q{PID[0]}"
    m = MODELS[mk]; W, H = m["W"], m["H"]; pad = 200
    vbw, vbh = W + 2*pad, H + 2*pad
    w = h * vbw / vbh
    inner = back_svg(mk, col, pid, led=led, case=case) if kind == "back" else front_svg(mk, col, pid, case=case)
    fl = ""
    if floor_:
        fl = E("defs", {}, E("filter", {"id": pid + "fl", "x": "-50%", "y": "-200%", "width": "200%", "height": "500%"}, E("feGaussianBlur", {"stdDeviation": "26"}))) + \
             E("ellipse", {"cx": f(W/2), "cy": f(H + 80), "rx": f(W*0.44), "ry": "30", "style": "fill: #000000; opacity: 0.35", "filter": f"url(#{pid}fl)"})
    g = E("g", {"transform": f"rotate({f(rot)} {f(W/2)} {f(H/2)})"}, inner) if rot else inner
    lab = label or (m and ("Kiesel 1 Pro" if mk == "pro" else "Kiesel 1") + (", Rückseite" if kind == "back" else ", Vorderseite"))
    return E("svg", {"width": f(w), "height": f(h), "viewBox": f"{-pad} {-pad} {vbw} {vbh}", "role": "img", "aria-label": lab, "style": "display: block; overflow: visible"}, fl + g)

def scene(p, vb, w, h, filt=None, label="Alpenpanorama"):
    body_ = alpen(p)
    if filt: body_ = E("g", {"filter": f"url(#{filt})"}, body_)
    return E("svg", {"width": f(w), "height": f(h), "viewBox": vb, "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": label, "style": "display: block"}, body_)

# ---------------- Layout pieces ----------------
def nav(active=None, menu_open=False):
    links = [("Handys", "Menue.dc.html", True), ("Funktionen", "#", False), ("Zubehör", "#", False), ("Vergleichen", "#", False), ("FAQ", "#", False)]
    ls = ""
    for name, href, dd in links:
        on = name == active
        st = css(display="inline-flex", align_items="center", gap="4px", padding="8px 14px", border_radius="999px", font_family=BODY, font_size="15px", font_weight="500", text_decoration="none")
        st += f"; color: {INK}; background: {RAI}" if on else f"; color: {MUT}"
        ls += E("a", {"href": href, "style": st, **({"aria-expanded": "true" if (menu_open and dd) else "false"} if dd else {})}, name + (icon("up" if (menu_open and dd) else "down", 16) if dd else ""))
    return E("header", {"style": css(height="64px", display="flex", align_items="center", gap="24px", padding="0 120px", box_sizing="border-box", border_bottom=f"1px solid {LINE}", background=BG, flex_shrink="0")},
        E("a", {"href": "Main.dc.html", "aria-label": "Kiesel, zur Startseite", "style": css(display="flex", align_items="center", gap="10px", text_decoration="none", color=INK)},
          logo(30) + E("span", {"style": disp(20, ls="-0.02em")}, "kiesel")) +
        E("nav", {"aria-label": "Hauptnavigation", "style": css(display="flex", gap="2px", flex_grow="1", justify_content="center")}, ls) +
        E("a", {"href": "Warenkorb.dc.html", "aria-label": "Warenkorb, 2 Artikel", "style": css(position="relative", width="44px", height="44px", border_radius="999px", border=f"1px solid {LINE}", background=SURF, display="flex", align_items="center", justify_content="center", color=INK, text_decoration="none")},
          icon("bag", 20) + E("span", {"style": css(position="absolute", top="-4px", right="-4px", min_width="20px", height="20px", border_radius="10px", background=ACC, color=ACCI, font_family=BODY, font_size="12px", font_weight="600", display="flex", align_items="center", justify_content="center")}, "2")) +
        btn("Kaufen", "Kaufen.dc.html", "ink", "s"))

def section(inner, pad="140px 120px 0", extra=""):
    return E("section", {"style": css(padding=pad, box_sizing="border-box", display="flex", flex_direction="column", gap="0") + extra}, inner)

def footer(pad="0 120px"):
    cols = [("Handys", ["Kiesel 1", "Kiesel 1 Pro", "Vergleichen"]), ("Entdecken", ["Funktionen", "Technische Daten", "Akku-Rechner"]), ("Shop", ["Kaufen", "Zubehör", "Warenkorb"]), ("Hilfe", ["FAQ", "Über das Konzept"])]
    cc = ""
    for h, items in cols:
        cc += E("div", {"style": css(display="flex", flex_direction="column", gap="12px")},
                E("h3", {"style": body(14, w=600, col=INK)}, h) +
                "".join(E("a", {"href": "#", "style": body(15, col=MUT) + "; text-decoration: none"}, i) for i in items))
    return E("footer", {"style": css(margin_top="140px", border_top=f"1px solid {LINE}", padding=pad.replace("0 ", "64px ", 1) if pad.startswith("0 ") else pad, box_sizing="border-box", display="flex", flex_direction="column", gap="48px")},
        E("div", {"style": css(display="grid", grid_template_columns="repeat(5, minmax(0, 1fr))", gap="32px")},
          E("div", {"style": css(display="flex", flex_direction="column", gap="12px")},
            E("div", {"style": css(display="flex", align_items="center", gap="10px", color=INK)}, logo(28) + E("span", {"style": disp(18)}, "kiesel")) +
            E("p", {"style": body(15, col=MUT)}, "Zwei kompakte Handys, die es nur als Idee gibt.")) + cc) +
        E("div", {"style": css(display="flex", justify_content="space-between", gap="24px", border_top=f"1px solid {LINE}", padding_top="24px", padding_bottom="48px")},
          E("p", {"style": body(13, col=MUT)}, "Kiesel 1 und Kiesel 1 Pro sind Fan-Konzepte, keine echten Produkte. Preise und Werte sind Schätzungen.") +
          E("p", {"style": body(13, col=MUT)}, "iPhone ist eine Marke von Apple Inc.")))

def swatch_loop(list_name="swatches", item="sw", size=34):
    return E("sc-for", {"list": "{{%s}}" % list_name, "as": item, "hint-placeholder-count": "5"},
        E("button", {"type": "button", "onClick": "{{%s.pick}}" % item, "aria-label": "{{%s.name}}" % item, "aria-pressed": "{{%s.pressed}}" % item,
                     "style": css(width=f"{size+10}px", height=f"{size+10}px", border_radius="999px", padding="3px", box_sizing="border-box", cursor="pointer", background="transparent") + "; border: 2px solid {{%s.ring}}" % item},
          E("span", {"style": css(display="block", width="100%", height="100%", border_radius="999px", box_shadow="inset 0 0 0 1px rgba(0,0,0,0.18)") + "; background: {{%s.hex}}" % item}, "")))

SW_JS = """const swatches = Object.keys(PAL).map(k => ({ name: k, hex: PAL[k].frame, pressed: k === col ? 'true' : 'false', ring: k === col ? t.ink : 'transparent', pick: () => this.setState({ col: k }) }));"""

def stage(inner, w, h, radius=32, extra=""):
    return E("div", {"style": css(position="relative", width=f"{w}px", height=f"{h}px", border_radius=f"{radius}px", overflow="hidden", display="flex", align_items="center", justify_content="center", border=f"1px solid {LINE}", box_sizing="border-box") + f"; background: linear-gradient(180deg, {STG}, {STGLO})" + extra}, inner)

C = holes("c")

def page(title, w, h, body_html, props, js, fonts=True):
    props = dict(props); props["$preview"] = {"width": w, "height": h}
    pj = json.dumps(props, ensure_ascii=False).replace("'", "&#39;")
    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
body{{margin:0;background:#0C1116}}
a{{color:inherit}}a:hover{{opacity:0.85}}
</style>
</helmet>
{body_html}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{pj}'>
{JSHEAD}
class Component extends DCLogic {{
renderVals() {{
{js}
}}
}}
</script>
</body>
</html>
"""

def root(w, h, inner, bg=BG):
    return E("div", {"style": css(width=f"{w}px", height=f"{h}px", overflow="hidden", box_sizing="border-box", display="flex", flex_direction="column", background=bg, color=INK, font_family=BODY)}, inner)

FILES = {}
def write(name, html):
    open(os.path.join(ROOT, name), "w").write(html); FILES[name] = True

T_JS = "const t = THEMES[this.props.thema] || THEMES.Dunkel;"

# =====================================================================
# 1. STARTSEITE DESKTOP
# =====================================================================
def feature_tiles(cols=3, gap="24px"):
    rgb = E("svg", {"width": "140", "height": "140", "viewBox": "0 0 140 140", "aria-hidden": "true"},
        E("defs", {}, E("radialGradient", {"id": "rgbg", "cx": "0.5", "cy": "0.5", "r": "0.5"}, E("stop", {"offset": "0", "style": "stop-color: #3D8BFF; stop-opacity: 0.9"}, "") + E("stop", {"offset": "0.35", "style": "stop-color: #3D8BFF; stop-opacity: 0.4"}, "") + E("stop", {"offset": "1", "style": "stop-color: #3D8BFF; stop-opacity: 0"}, ""))) +
        E("circle", {"cx": "70", "cy": "70", "r": "66", "style": "fill: url(#rgbg)"}) + E("circle", {"cx": "70", "cy": "70", "r": "18", "style": "fill: #B9CBD8"}) + E("circle", {"cx": "70", "cy": "70", "r": "13", "style": "fill: #6FA8FF"}) + E("circle", {"cx": "66", "cy": "66", "r": "4", "style": "fill: #FFFFFF; opacity: 0.8"}))
    zen = E("div", {"style": css(display="flex", flex_direction="column", align_items="center", gap="14px", color=INK)},
        E("div", {"style": css(width="84px", height="84px", border_radius="999px", background=RAI, border=f"1px solid {LINE}", display="flex", align_items="center", justify_content="center")}, icon("moon", 38)) +
        E("div", {"style": css(display="flex", align_items="center", gap="10px")},
          E("span", {"style": css(width="46px", height="28px", border_radius="14px", background=ACC, position="relative", display="block")}, E("span", {"style": css(position="absolute", top="3px", left="21px", width="22px", height="22px", border_radius="11px", background="#FFFFFF", display="block")}, "")) +
          E("span", {"style": body(15, w=600, col=INK)}, "Zen an")))
    rows = ""
    for n in ["Kamera", "Mikrofon", "GPS"]:
        rows += E("div", {"style": css(display="flex", align_items="center", gap="10px")},
            E("span", {"style": body(14, w=600, col=INK) + "; width: 78px"}, n) +
            E("svg", {"width": "84", "height": "20", "viewBox": "0 0 84 20", "aria-hidden": "true"},
              E("line", {"x1": "0", "y1": "10", "x2": "24", "y2": "10", "style": f"stroke: {MUT}; stroke-width: 2"}) +
              E("circle", {"cx": "28", "cy": "10", "r": "4", "style": f"fill: none; stroke: {INK}; stroke-width: 2"}) +
              E("line", {"x1": "31", "y1": "8", "x2": "52", "y2": "-2", "style": f"stroke: {INK}; stroke-width: 2.5; stroke-linecap: round"}) +
              E("circle", {"cx": "56", "cy": "10", "r": "4", "style": f"fill: none; stroke: {INK}; stroke-width: 2"}) +
              E("line", {"x1": "60", "y1": "10", "x2": "84", "y2": "10", "style": f"stroke: {MUT}; stroke-width: 2; stroke-dasharray: 3 3"})) +
            E("span", {"style": body(13, w=600, col=HEAT)}, "getrennt"))
    priv = E("div", {"style": css(display="flex", flex_direction="column", gap="12px")}, rows)
    data = [(rgb, "RGB-Licht", "Der Blitz neben der Kamera leuchtet farbig bei Anrufen, Nachrichten und beim Laden. Das Display bleibt aus."),
            (zen, "Zen-Modus", "Ein Druck auf den Action-Button, und das Handy ist still. Nochmal drücken, und alles ist wieder da."),
            (priv, "Privacy-Modus", "Kamera, Mikrofon und GPS werden elektrisch getrennt. Ohne Strom kann auch eine gehackte App nichts aufnehmen.")]
    out = ""
    for vis, h3, p in data:
        out += E("article", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="32px", display="flex", flex_direction="column", gap="14px")},
            E("div", {"style": css(height="190px", display="flex", align_items="center", justify_content="center", border_radius="20px", background=BG, margin_bottom="10px")}, vis) +
            E("h3", {"style": disp(22, lh="1.2")}, h3) + E("p", {"style": body(16, col=MUT)}, p) +
            btn("Ausprobieren", "#", "ghost", ico="arrow"))
    return E("div", {"style": css(display="grid", grid_template_columns=f"repeat({cols}, minmax(0, 1fr))", gap=gap, margin_top="48px")}, out)

def faq(items_open=0, width=None):
    qa = [("Kann ich den Kiesel wirklich kaufen?", "Leider nein. Kiesel ist ein Fan-Konzept. Der Warenkorb funktioniert trotzdem, erst die Kasse verrät am Ende die traurige Wahrheit."),
          ("Warum ist der Kiesel 9 mm dick?", ""), ("Was macht der Privacy-Modus genau?", ""), ("Passt die Hülle auf beide Modelle?", "")]
    out = ""
    for i, (q, a) in enumerate(qa):
        op = i == items_open
        out += E("div", {"style": css(border_top=f"1px solid {LINE}", padding="22px 0", display="flex", flex_direction="column", gap="10px")},
            E("button", {"type": "button", "aria-expanded": "true" if op else "false", "style": css(display="flex", justify_content="space-between", align_items="center", gap="16px", background="transparent", border="0", padding="0", color=INK, cursor="pointer", text_align="left")},
              E("span", {"style": disp(19, lh="1.3", ls="-0.01em", w=500)}, q) + icon("minus" if op else "plus", 22)) +
            (E("p", {"style": body(16, col=MUT) + "; max-width: 720px"}, a) if op else ""))
    return E("div", {"style": css(display="flex", flex_direction="column", margin_top="40px")}, out)

def model_card(mk, h_img, mobile=False):
    pro = mk == "pro"
    name = "Kiesel 1 Pro" if pro else "Kiesel 1"
    sub = "So gross wie das iPhone 13 mini." if pro else "So gross wie das iPhone SE von 2016."
    specs = (["ca. 5.4″ OLED, 1 bis 90 Hz", "0.5x bis 1x plus 3x-Tele mit OIS", "ca. 3600 mAh, Mini-Vapor-Chamber", "256 GB bis 2 TB"] if pro
             else ["ca. 4.7″ OLED, 1 bis 90 Hz", "Eine Kamera, 0.5x bis 1x, digital bis 5x", "ca. 3000 mAh", "256 GB bis 1 TB"])
    price = "ab CHF 1’500.–" if pro else "ab CHF 1’200.–"
    col = PAL["Himmelblau"] if pro else PAL["Kieselbeige"]
    img_h = h_img if pro else h_img * 1238 / 1315
    return E("article", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="24px 20px 24px" if mobile else "40px", display="flex", flex_direction="column", gap="0")},
        E("div", {"style": css(height=f"{h_img*1.1:.0f}px", display="flex", align_items="flex-end", justify_content="center", margin_bottom="28px")}, phone("front", mk, col, img_h, floor_=True)) +
        E("h3", {"style": disp(26 if mobile else 32, lh="1.1")}, name) +
        E("p", {"style": body(16, col=MUT) + "; margin-top: 6px; margin-bottom: 20px"}, sub) +
        E("ul", {"style": css(list_style="none", margin="0 0 24px", padding="0")}, "".join(E("li", {"style": body(16, col=INK) + f"; padding: 11px 0; border-top: 1px solid {LINE}"}, s) for s in specs)) +
        E("p", {"style": body(17, w=600, col=INK) + "; margin-bottom: 18px"}, price) +
        E("div", {"style": css(display="flex", gap="10px", flex_wrap="wrap")}, btn("Mehr erfahren", "ModellPro.dc.html" if pro else "#", "primary") + btn("Kaufen", "Kaufen.dc.html", "secondary")))

def stats(items, cols=4, big=56):
    out = ""
    for num, lab, sub in items:
        out += E("div", {"style": css(display="flex", flex_direction="column", gap="8px", padding_top="24px", border_top=f"2px solid {INK}")},
            E("span", {"style": disp(big, lh="1", ls="-0.04em")}, num) + E("span", {"style": body(17, w=600, col=INK)}, lab) + E("span", {"style": body(15, col=MUT)}, sub))
    return E("div", {"style": css(display="grid", grid_template_columns=f"repeat({cols}, minmax(0, 1fr))", gap="32px")}, out)

def zoom_pills(active="3x", opts=("0.5", "1", "3", "10")):
    out = ""
    for o in opts:
        on = (o + "x") == active
        out += E("button", {"type": "button", "aria-pressed": "true" if on else "false", "style": css(min_width="44px", height="44px", padding="0 10px", border_radius="999px", border="0", cursor="pointer", font_family=BODY, font_size="14px", font_weight="600") + ("; background: #FFFFFF; color: #0C1116" if on else "; background: transparent; color: #FFFFFF")}, o + "x" if on else o)
    return E("div", {"style": css(display="inline-flex", gap="4px", padding="4px", border_radius="999px", background="rgba(8, 13, 18, 0.66)")}, out)

hero_stage = stage(
    phone("back", "pro", C, 560, rot=-10, floor_=True) +
    E("div", {"style": css(position="absolute", left="24px", right="24px", bottom="24px", display="flex", justify_content="space-between", align_items="center")},
      glass_chip(icon("rotate", 18) + "Ziehen zum Drehen") +
      E("div", {"style": css(display="flex", align_items="center", gap="6px", padding="6px 16px 6px 6px", border_radius="999px", background="rgba(8, 13, 18, 0.66)")},
        swatch_loop() + E("span", {"style": body(14, w=600, col="#FFFFFF") + "; margin-left: 8px; min-width: 96px"}, "{{colName}}")) +
      glass_chip("3D")), 1200, 660)

main_html = root(1440, 5800,
    nav() +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(
        E("h1", {"style": disp(112, lh="0.95", ls="-0.05em") + "; text-align: center"}, "Passt in jede Hand.") +
        E("p", {"style": body(21, col=MUT) + "; text-align: center; max-width: 640px; margin: 24px auto 0"}, "Kiesel 1 und Kiesel 1 Pro: zwei kompakte Handys, gebaut um einen Akku, der bis in die Nacht hält.") +
        E("div", {"style": css(display="flex", gap="12px", justify_content="center", margin_top="32px")}, btn("Kiesel 1 Pro entdecken", "ModellPro.dc.html", "primary", "l") + btn("Kaufen ab CHF 1’200.–", "Kaufen.dc.html", "secondary", "l")) +
        E("div", {"style": "margin-top: 56px"}, hero_stage), pad="72px 120px 0") +
      section(
        E("h2", {"style": disp(64, lh="1.02", ls="-0.04em")}, "Welcher Kiesel passt zu dir?") +
        E("p", {"style": body(19, col=MUT) + "; margin-top: 16px; max-width: 620px"}, "Beide im echten Massstab zueinander. Gleiche Farben, gleicher Chip. Der Pro hat mehr Fläche, mehr Akku und eine Tele-Kamera.") +
        E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="24px", margin_top="48px")}, model_card("k1", 440) + model_card("pro", 440))) +
      section(stats([("3000", "mAh im Kiesel 1", "fast doppelt so viel wie das SE"), ("3x", "Tele, echt optisch", "beim Kiesel 1 Pro"), ("9 mm", "flach genug", "1.4 mm mehr als das SE, für mehr Akku"), ("1–90", "Hertz, die mitdenken", "das Display läuft nur so schnell wie nötig")])) +
      section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 5fr) minmax(0, 7fr)", gap="64px", align_items="center")},
          E("div", {"style": css(display="flex", flex_direction="column", gap="18px")},
            E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Zoom, der nicht aufgibt.") +
            E("p", {"style": body(18, col=MUT)}, "Der Pro wechselt bei 3x auf eine echte Tele-Linse. Selbst bei 10x siehst du noch das Gipfelkreuz, und wer genau hinschaut, entdeckt die Seilschaft auf dem Grat.") +
            btn("Zoom ausprobieren", "ModellPro.dc.html", "ghost", ico="arrow")) +
          E("div", {"style": css(position="relative", border_radius="28px", overflow="hidden", height="440px", border=f"1px solid {LINE}")},
            scene("hz", crop(740, 300, 3), 700, 440, label="Alpenpanorama bei 3x Zoom") +
            E("div", {"style": css(position="absolute", top="20px", left="20px")}, glass_chip("3x · optisch, Tele-Linse")) +
            E("div", {"style": css(position="absolute", bottom="20px", left="0", right="0", display="flex", justify_content="center")}, zoom_pills("3x"))))) +
      section(E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Kleine Ideen, grosse Wirkung.") + feature_tiles()) +
      section(E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="64px", align_items="center")},
          stage(phone("back", "pro", PAL["Himmelblau"], 440, rot=-6, case=PAL["Mattweiss"]), 568, 520, 28) +
          E("div", {"style": css(display="flex", flex_direction="column", gap="18px")},
            E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Die Kiesel-Hülle") +
            E("p", {"style": body(18, col=MUT)}, "Hinten milchig, damit Farbe und Kiesel durchschimmern. Am Rand fest und griffig. In denselben fünf Farben wie die Handys, für beide Modelle.") +
            E("p", {"style": body(20, w=600, col=INK)}, "CHF 59.–") +
            E("div", {"style": css(display="flex", gap="10px")}, btn("Zum Zubehör", "#", "secondary") + btn("In den Warenkorb", "Warenkorb.dc.html", "primary"))))) +
      section(E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Häufige Fragen") + faq()) +
      footer()))

main_js = T_JS + """
const col = (this.state && this.state.col) || 'Himmelblau';
const c = PAL[col];
""" + SW_JS + """
return { t, c, swatches, colName: col };"""
write("Main.dc.html", page("Kiesel Startseite", 1440, 5800, main_html, THEME_PROP, main_js))

# =====================================================================
# 2. STARTSEITE HANDY
# =====================================================================
def mnav():
    return E("header", {"style": css(height="56px", display="flex", align_items="center", gap="8px", padding="0 12px 0 20px", box_sizing="border-box", border_bottom=f"1px solid {LINE}", background=BG, flex_shrink="0")},
        E("a", {"href": "Main.dc.html", "aria-label": "Kiesel, zur Startseite", "style": css(display="flex", align_items="center", gap="8px", text_decoration="none", color=INK, flex_grow="1")}, logo(26) + E("span", {"style": disp(18)}, "kiesel")) +
        E("a", {"href": "Warenkorb.dc.html", "aria-label": "Warenkorb, 2 Artikel", "style": css(width="44px", height="44px", display="flex", align_items="center", justify_content="center", color=INK, position="relative")},
          icon("bag", 22) + E("span", {"style": css(position="absolute", top="6px", right="4px", min_width="18px", height="18px", border_radius="9px", background=ACC, color=ACCI, font_family=BODY, font_size="11px", font_weight="600", display="flex", align_items="center", justify_content="center")}, "2")) +
        E("button", {"type": "button", "aria-label": "Menü öffnen", "style": css(width="44px", height="44px", display="flex", align_items="center", justify_content="center", color=INK, background="transparent", border="0")}, icon("menu", 24)))

mob_stage = E("div", {"style": css(display="flex", flex_direction="column", gap="14px", align_items="center")},
    stage(phone("back", "pro", C, 330, rot=-8) + E("div", {"style": css(position="absolute", left="14px", bottom="14px")}, glass_chip(icon("rotate", 16) + "Drehen")), 350, 420, 24) +
    E("div", {"style": css(display="flex", align_items="center", gap="2px")}, swatch_loop(size=28)) +
    E("span", {"style": body(15, w=600, col=INK)}, "{{colName}}"))

mob_html = root(390, 5000,
    mnav() +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(E("h1", {"style": disp(46, lh="1", ls="-0.045em")}, "Passt in jede Hand.") +
              E("p", {"style": body(17, col=MUT) + "; margin-top: 14px"}, "Kiesel 1 und Kiesel 1 Pro: zwei kompakte Handys mit Akku bis in die Nacht.") +
              E("div", {"style": css(display="flex", flex_direction="column", gap="10px", margin_top="24px")}, btn("Kiesel 1 Pro entdecken", "ModellPro.dc.html", "primary", "m", full=True) + btn("Kaufen ab CHF 1’200.–", "Kaufen.dc.html", "secondary", "m", full=True)) +
              E("div", {"style": "margin-top: 32px"}, mob_stage), pad="32px 20px 0") +
      section(E("h2", {"style": disp(32, lh="1.05", ls="-0.035em")}, "Welcher Kiesel passt zu dir?") +
              E("div", {"style": css(display="flex", flex_direction="column", gap="16px", margin_top="24px")}, model_card("k1", 300, True) + model_card("pro", 300, True)), pad="80px 20px 0") +
      section(stats([("3000", "mAh im Kiesel 1", "fast doppelt so viel wie das SE"), ("3x", "Tele, echt optisch", "beim Kiesel 1 Pro"), ("9 mm", "flach genug", "für mehr Akku"), ("1–90", "Hertz", "nur so schnell wie nötig")], cols=2, big=40), pad="80px 20px 0") +
      section(E("h2", {"style": disp(32, lh="1.05", ls="-0.035em")}, "Zoom, der nicht aufgibt.") +
              E("p", {"style": body(16, col=MUT) + "; margin-top: 12px"}, "Bei 3x wechselt der Pro auf die Tele-Linse. Selbst bei 10x bleibt das Gipfelkreuz erkennbar.") +
              E("div", {"style": css(position="relative", border_radius="20px", overflow="hidden", height="240px", margin_top="20px", border=f"1px solid {LINE}")},
                scene("mz", crop(740, 300, 3, 350/240), 350, 240, label="Alpenpanorama bei 3x Zoom") +
                E("div", {"style": css(position="absolute", bottom="12px", left="0", right="0", display="flex", justify_content="center")}, zoom_pills("3x"))), pad="80px 20px 0") +
      section(E("h2", {"style": disp(32, lh="1.05", ls="-0.035em")}, "Kleine Ideen, grosse Wirkung.") + feature_tiles(1, "16px"), pad="80px 20px 0") +
      section(E("h2", {"style": disp(32, lh="1.05", ls="-0.035em")}, "Häufige Fragen") + faq(), pad="80px 20px 0") +
      E("footer", {"style": css(margin_top="80px", border_top=f"1px solid {LINE}", padding="32px 20px 48px", display="flex", flex_direction="column", gap="4px")},
        "".join(E("button", {"type": "button", "aria-expanded": "false", "style": css(display="flex", justify_content="space-between", align_items="center", padding="16px 0", border="0", border_bottom=f"1px solid {LINE}", background="transparent", color=INK, font_family=BODY, font_size="16px", font_weight="600")}, n + icon("down", 18)) for n in ["Handys", "Entdecken", "Shop", "Hilfe"]) +
        E("p", {"style": body(13, col=MUT) + "; margin-top: 20px"}, "Kiesel 1 und Kiesel 1 Pro sind Fan-Konzepte, keine echten Produkte. iPhone ist eine Marke von Apple Inc."))))
write("StartMobil.dc.html", page("Kiesel Startseite Handy", 390, 5000, mob_html, THEME_PROP, main_js))

# =====================================================================
# 3. MENUE AUFGEKLAPPT
# =====================================================================
def menu_tile(mk):
    pro = mk == "pro"
    return E("a", {"href": "ModellPro.dc.html" if pro else "#", "style": css(display="flex", gap="20px", align_items="center", padding="20px", border_radius="24px", background=BG, border=f"1px solid {LINE}", text_decoration="none", color=INK)},
        E("div", {"style": css(width="110px", height="190px", display="flex", align_items="flex-end", justify_content="center", flex_shrink="0")}, phone("front", mk, PAL["Titangrau"] if pro else PAL["Himmelblau"], 180 if pro else 170, floor_=False)) +
        E("div", {"style": css(display="flex", flex_direction="column", gap="6px")},
          E("span", {"style": disp(22, lh="1.15")}, "Kiesel 1 Pro" if pro else "Kiesel 1") +
          E("span", {"style": body(15, col=MUT)}, "13-mini-Grösse mit 3x-Tele" if pro else "SE-Grösse, Akku für den ganzen Tag") +
          E("span", {"style": body(15, w=600, col=INK) + "; margin-top: 6px"}, "ab CHF 1’500.–" if pro else "ab CHF 1’200.–") +
          E("span", {"style": body(15, w=600, col=ACC) + "; display: inline-flex; align-items: center; gap: 6px; margin-top: 4px"}, "Mehr erfahren" + icon("arrow", 16))))

def link_col(title, items):
    return E("div", {"style": css(display="flex", flex_direction="column", gap="14px")},
        E("h3", {"style": body(13, w=600, col=MUT) + "; letter-spacing: 0.02em"}, title) +
        "".join(E("a", {"href": h, "style": body(17, w=500, col=INK) + "; text-decoration: none"}, n) for n, h in items))

menu_html = root(1440, 900,
    nav("Handys", True) +
    E("div", {"style": css(background=SURF, border_bottom=f"1px solid {LINE}", padding="36px 120px 44px", display="grid", grid_template_columns="minmax(0, 1fr) minmax(0, 1fr) 220px 220px", gap="24px", flex_shrink="0")},
      menu_tile("k1") + menu_tile("pro") +
      link_col("Mehr zu den Handys", [("Vergleichen", "#"), ("Technische Daten", "#"), ("Akku-Rechner", "#"), ("Farben", "#")]) +
      link_col("Beliebt", [("Kiesel-Hülle", "#"), ("Funktionen ausprobieren", "#"), ("Kaufen", "Kaufen.dc.html")])) +
    E("div", {"style": css(position="relative", flex_grow="1", overflow="hidden", padding="56px 120px 0", display="flex", flex_direction="column", align_items="center")},
      E("h1", {"style": disp(112, lh="0.95", ls="-0.05em") + "; text-align: center"}, "Passt in jede Hand.") +
      E("div", {"style": css(position="absolute", top="0", left="0", right="0", bottom="0") + f"; background: {OVL}"}, "")))
write("Menue.dc.html", page("Kiesel Menü aufgeklappt", 1440, 900, menu_html, THEME_PROP, T_JS + "\nreturn { t };"))

# =====================================================================
# 4. MODELLSEITE PRO
# =====================================================================
subnav = E("div", {"style": css(height="56px", display="flex", align_items="center", gap="28px", padding="0 120px", box_sizing="border-box", background=SURF, border_bottom=f"1px solid {LINE}", flex_shrink="0")},
    E("span", {"style": disp(18, lh="1") + "; flex-grow: 1"}, "Kiesel 1 Pro") +
    E("a", {"href": "#", "aria-current": "page", "style": body(15, w=600, col=INK) + f"; text-decoration: none; padding: 17px 0; border-bottom: 2px solid {ACC}"}, "Übersicht") +
    E("a", {"href": "#", "style": body(15, w=500, col=MUT) + "; text-decoration: none"}, "Technische Daten") +
    E("a", {"href": "#", "style": body(15, w=500, col=MUT) + "; text-decoration: none"}, "Vergleichen") +
    btn("Kaufen", "Kaufen.dc.html", "primary", "s"))

cmp_vb = crop(756, 246, 5, 600/560)
compare = E("div", {"style": css(position="relative", height="560px", border_radius="28px", overflow="hidden", border=f"1px solid {LINE}", display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))")},
    E("div", {"style": css(position="relative", overflow="hidden")},
      E("svg", {"width": "600", "height": "560", "viewBox": cmp_vb, "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": "Kiesel 1 bei 5x: digital und unscharf", "style": "display: block"},
        E("defs", {}, E("filter", {"id": "dig", "x": "0", "y": "0", "width": "100%", "height": "100%"}, E("feGaussianBlur", {"stdDeviation": "1.6"}))) +
        E("g", {"filter": "url(#dig)"}, alpen("cl"))) +
      E("div", {"style": css(position="absolute", top="20px", left="20px")}, glass_chip("Kiesel 1 · 5x digital"))) +
    E("div", {"style": css(position="relative", overflow="hidden")},
      E("svg", {"width": "600", "height": "560", "viewBox": cmp_vb, "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": "Kiesel 1 Pro bei 5x: scharf dank Tele", "style": "display: block"}, alpen("cr")) +
      E("div", {"style": css(position="absolute", top="20px", right="20px")}, glass_chip("Kiesel 1 Pro · 5x mit Tele"))) +
    E("div", {"style": css(position="absolute", top="0", bottom="0", left="599px", width="2px", background="#FFFFFF")}, "") +
    E("button", {"type": "button", "aria-label": "Vergleich verschieben", "style": css(position="absolute", top="252px", left="576px", width="48px", height="48px", border_radius="999px", border="0", background="#FFFFFF", color="#0C1116", display="flex", align_items="center", justify_content="center", cursor="ew-resize")}, icon("swap", 22)))

macro = E("div", {"style": css(position="relative", border_radius="28px", overflow="hidden", height="480px", border=f"1px solid {LINE}")},
    E("svg", {"width": "720", "height": "480", "viewBox": "0 0 1200 800", "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": "Blume mit weichem Hintergrund, 3x Tele-Nahfokus", "style": "display: block"}, blume("mp", "b3", "b0", "b4", "b2")) +
    E("div", {"style": css(position="absolute", top="20px", left="20px")}, glass_chip("3x Tele · ca. 25 cm")) +
    E("div", {"style": css(position="absolute", bottom="20px", left="20px", display="flex", gap="4px", padding="4px", border_radius="999px", background="rgba(8, 13, 18, 0.66)")},
      "".join(E("button", {"type": "button", "aria-pressed": "true" if on else "false", "style": css(height="40px", padding="0 16px", border_radius="999px", border="0", font_family=BODY, font_size="14px", font_weight="600", cursor="pointer") + ("; background: #FFFFFF; color: #0C1116" if on else "; background: transparent; color: #FFFFFF")}, n) for n, on in [("Makro", False), ("3x Nahfokus", True), ("Fokus auf Biene", False)])))

akku_vis, akku_leg = phone_open("pro", 60, 20, 3.1)
bars = ""
for name, val, colr in [("iPhone 13 mini", 2438, MUT), ("Kiesel 1 Pro", 3600, ACC)]:
    bars += E("div", {"style": css(display="flex", flex_direction="column", gap="8px")},
        E("div", {"style": css(display="flex", justify_content="space-between")}, E("span", {"style": body(16, w=600, col=INK)}, name) + E("span", {"style": body(16, col=MUT)}, f"{'ca. ' if val == 3600 else ''}{val:,} mAh".replace(",", "’"))) +
        E("div", {"style": css(height="14px", border_radius="7px", background=RAI, overflow="hidden")}, E("div", {"style": css(height="100%", width=f"{val/3600*100:.1f}%", border_radius="7px") + f"; background: {colr}"}, "")))

colors_row = ""
for n in COLOPTS:
    colors_row += E("div", {"style": css(display="flex", flex_direction="column", align_items="center", gap="10px")},
        phone("back", "pro", PAL[n], 330, floor_=True) + E("span", {"style": body(16, w=500, col=INK)}, n))

spec_rows = [("Display", "ca. 5.4″ OLED, LTPO 1 bis 90 Hz"), ("Chip", "A20 Pro abgespeckt, 1+3 Kerne, max. 4 GHz"), ("Kameras", "0.5x bis 1x (50 MP) und 3x-Tele mit OIS"), ("Akku", "ca. 3600 mAh, Silizium-Kohlenstoff"),
             ("Masse", "131.5 × 64.2 × 9 mm, ca. 170 g"), ("Kühlung", "Mini-Vapor-Chamber"), ("Speicher", "256 GB bis 2 TB"), ("Extras", "RGB-Blitz, Zen- und Privacy-Modus")]
spec_html = "".join(E("div", {"style": css(display="flex", flex_direction="column", gap="4px", padding="18px 0", border_top=f"1px solid {LINE}")},
                    E("span", {"style": body(14, w=600, col=MUT)}, a) + E("span", {"style": body(18, w=500, col=INK)}, b)) for a, b in spec_rows)

pro_html = root(1440, 5750,
    nav("Handys") + subnav +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(E("h1", {"style": disp(128, lh="0.92", ls="-0.055em") + "; text-align: center"}, "Kiesel 1 Pro") +
              E("p", {"style": disp(32, lh="1.2", ls="-0.02em", w=500) + f"; text-align: center; color: {ACC}; margin-top: 18px"}, "Zwei Kameras. Eine Hand.") +
              E("p", {"style": body(18, col=MUT) + "; text-align: center; margin-top: 12px"}, "ab CHF 1’500.– oder in fünf Farben ansehen") +
              E("div", {"style": "margin-top: 48px"}, stage(E("div", {"style": css(display="flex", align_items="center", gap="0")},
                  phone("back", "pro", PAL["Himmelblau"], 540, rot=-8) + E("div", {"style": "margin-left: -120px; margin-top: 40px"}, phone("front", "pro", PAL["Himmelblau"], 540, rot=5))), 1200, 660)), pad="88px 120px 0") +
      section(stats([("5.4″", "OLED-Display", "LTPO von 1 bis 90 Hz"), ("3x", "Tele, echt optisch", "mit Bildstabilisator"), ("3600", "mAh", "rund 50 % mehr als das 13 mini"), ("9 mm", "flach genug", "für Tele, Akku und MagSafe")])) +
      section(E("h2", {"style": disp(64, lh="1.02", ls="-0.04em")}, "3x Tele. Echt optisch.") +
              E("p", {"style": body(19, col=MUT) + "; margin-top: 16px; max-width: 680px"}, "Links der Kiesel 1 bei 5x, rein digital. Rechts der Pro, der bei 3x auf die Tele-Linse wechselt und bei 5x noch aus einem scharfen Bild schneidet. Zieh den Regler und schau selbst.") +
              E("div", {"style": "margin-top: 40px"}, compare) +
              E("div", {"style": css(display="flex", justify_content="space-between", align_items="center", margin_top="20px")},
                E("div", {"style": css(display="flex", gap="8px")}, "".join(pill(z, z == "5x") for z in ["0.5x", "1x", "3x", "5x", "10x"])) +
                E("button", {"type": "button", "aria-pressed": "true", "style": css(display="inline-flex", align_items="center", gap="12px", background="transparent", border="0", color=INK, font_family=BODY, font_size="16px", font_weight="600", cursor="pointer")},
                  E("span", {"style": css(width="46px", height="28px", border_radius="14px", background=ACC, position="relative", display="block")}, E("span", {"style": css(position="absolute", top="3px", left="21px", width="22px", height="22px", border_radius="11px", background="#FFFFFF", display="block")}, "")) + "Mit Kiesel 1 vergleichen"))) +
      section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 5fr) minmax(0, 7fr)", gap="64px", align_items="center")},
          E("div", {"style": css(display="flex", flex_direction="column", gap="18px")},
            E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Ganz nah dran.") +
            E("p", {"style": body(18, col=MUT)}, "Die Tele-Linse stellt schon ab rund 20 cm scharf. Die Blume bleibt gross, der Hintergrund verschwimmt weich. Tipp aufs Bild, um den Fokus zu verschieben.")) + macro)) +
      section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 6fr) minmax(0, 5fr)", gap="64px", align_items="center")},
          E("div", {"style": css(display="flex", gap="24px", align_items="flex-start")},
            E("svg", {"width": "340", "height": "460", "viewBox": "0 0 340 460", "role": "img", "aria-label": "Innenleben des Kiesel 1 Pro"}, E("rect", {"x": "0", "y": "0", "width": "340", "height": "460", "rx": "24", "style": "fill: #0C1116"}) + akku_vis) +
            E("ol", {"style": css(list_style="none", margin="0", padding="0", display="flex", flex_direction="column", gap="9px")},
              "".join(E("li", {"style": css(display="flex", gap="10px", align_items="center")},
                E("span", {"style": css(width="22px", height="22px", border_radius="11px", background=ACC, color=ACCI, font_family=BODY, font_size="12px", font_weight="600", display="flex", align_items="center", justify_content="center", flex_shrink="0")}, str(nn)) +
                E("span", {"style": body(14, col=INK, lh="1.3")}, nm)) for nn, nm, ht in akku_leg))) +
          E("div", {"style": css(display="flex", flex_direction="column", gap="20px")},
            E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Mehr Akku. Gleiche Hand.") +
            E("p", {"style": body(18, col=MUT)}, "Kein SIM-Schlitten, eine Zelle aus Silizium-Kohlenstoff und 1.35 mm mehr Dicke. So passen rund 3600 mAh in die Grundfläche des 13 mini.") + bars))) +
      section(E("h2", {"style": disp(64, lh="1.02", ls="-0.04em")}, "Fünf Farben.") +
              E("div", {"style": css(display="flex", justify_content="space-between", margin_top="48px")}, colors_row)) +
      section(E("div", {"style": css(display="flex", justify_content="space-between", align_items="flex-end")},
                E("h2", {"style": disp(56, lh="1.02", ls="-0.04em")}, "Das Wichtigste auf einen Blick") + btn("Alle technischen Daten", "#", "ghost", ico="arrow")) +
              E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", column_gap="48px", margin_top="36px")}, spec_html)) +
      section(E("div", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="32px", padding="56px", display="flex", justify_content="space-between", align_items="center", gap="32px")},
          E("div", {"style": css(display="flex", flex_direction="column", gap="10px")},
            E("h2", {"style": disp(48, lh="1.05", ls="-0.04em")}, "Kiesel 1 Pro") + E("p", {"style": body(19, col=MUT)}, "ab CHF 1’500.– in fünf Farben, 256 GB bis 2 TB")) +
          E("div", {"style": css(display="flex", gap="12px")}, btn("Vergleichen", "#", "secondary", "l") + btn("Kaufen", "Kaufen.dc.html", "primary", "l")))) +
      footer()))
write("ModellPro.dc.html", page("Kiesel 1 Pro Modellseite", 1440, 5750, pro_html, THEME_PROP, T_JS + "\nreturn { t };"))

# =====================================================================
# 5. KAUFEN (interaktiv)
# =====================================================================
K = holes("k")
def opt_block(title, inner, first=False):
    return E("div", {"style": css(padding="28px 0", border_top="0" if first else f"1px solid {LINE}", display="flex", flex_direction="column", gap="16px")},
        E("h2", {"style": disp(20, lh="1.2", ls="-0.01em")}, title) + inner)

sel_btn = lambda item, inner: E("button", {"type": "button", "onClick": "{{%s.pick}}" % item, "aria-pressed": "{{%s.pressed}}" % item,
    "style": css(text_align="left", padding="16px 18px", border_radius="18px", background=SURF, cursor="pointer", color=INK, display="flex", flex_direction="column", gap="4px") + "; border: 1px solid {{%s.border}}; box-shadow: inset 0 0 0 1px {{%s.border2}}" % (item, item)}, inner)

buy_render = "".join([
    E("sc-if", {"value": "{{isProBare}}", "hint-placeholder-val": "{{ true }}"}, phone("back", "pro", C, 560)),
    E("sc-if", {"value": "{{isProCase}}", "hint-placeholder-val": "{{ false }}"}, phone("back", "pro", C, 560, case=K)),
    E("sc-if", {"value": "{{isK1Bare}}", "hint-placeholder-val": "{{ false }}"}, phone("back", "k1", C, 527)),
    E("sc-if", {"value": "{{isK1Case}}", "hint-placeholder-val": "{{ false }}"}, phone("back", "k1", C, 527, case=K)),
])

kaufen_html = root(1440, 1400,
    nav() +
    E("main", {"style": css(padding="56px 120px 0", display="flex", flex_direction="column", gap="36px")},
      E("h1", {"style": disp(64, lh="1", ls="-0.045em")}, "Kiesel kaufen") +
      E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 5fr) minmax(0, 6fr)", gap="64px", align_items="start")},
        E("div", {"style": css(display="flex", flex_direction="column", gap="14px")},
          stage(buy_render, 540, 720, 32) +
          E("p", {"style": body(14, col=MUT) + "; text-align: center"}, "Lieferumfang: dein Kiesel und ein USB-C-Kabel.")) +
        E("div", {"style": css(display="flex", flex_direction="column")},
          opt_block("Modell", E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="12px")},
              E("sc-for", {"list": "{{models}}", "as": "m", "hint-placeholder-count": "2"}, sel_btn("m", E("span", {"style": disp(18, lh="1.2")}, "{{m.name}}") + E("span", {"style": body(14, col=MUT)}, "{{m.sub}}") + E("span", {"style": body(15, w=600, col=INK) + "; margin-top: 6px"}, "{{m.from}}")))), first=True) +
          opt_block("Farbe: {{colName}}", E("div", {"style": css(display="flex", gap="6px", flex_wrap="wrap")}, swatch_loop())) +
          opt_block("Speicher", E("div", {"style": css(display="grid", grid_template_columns="repeat(4, minmax(0, 1fr))", gap="10px")},
              E("sc-for", {"list": "{{stores}}", "as": "s", "hint-placeholder-count": "4"}, sel_btn("s", E("span", {"style": disp(17, lh="1.2")}, "{{s.name}}") + E("span", {"style": body(14, col=MUT)}, "{{s.price}}"))))) +
          opt_block("Kiesel-Hülle",
              E("button", {"type": "button", "onClick": "{{toggleCase}}", "aria-pressed": "{{casePressed}}", "style": css(display="flex", align_items="center", gap="14px", padding="0", background="transparent", border="0", color=INK, cursor="pointer", text_align="left")},
                E("span", {"style": css(width="50px", height="30px", border_radius="15px", position="relative", display="block", flex_shrink="0") + "; background: {{caseTrack}}"},
                  E("span", {"style": css(position="absolute", top="3px", width="24px", height="24px", border_radius="12px", background="#FFFFFF", display="block") + "; left: {{caseKnob}}"}, "")) +
                E("span", {"style": body(16, w=600, col=INK)}, "Hülle für CHF 59.– dazu")) +
              E("sc-if", {"value": "{{withCase}}", "hint-placeholder-val": "{{ true }}"},
                E("div", {"style": css(display="flex", align_items="center", gap="10px", flex_wrap="wrap")},
                  E("span", {"style": body(15, col=MUT)}, "Farbe der Hülle: {{caseName}}") +
                  E("sc-for", {"list": "{{caseSwatches}}", "as": "cs", "hint-placeholder-count": "5"},
                    E("button", {"type": "button", "onClick": "{{cs.pick}}", "aria-label": "Hülle in {{cs.name}}", "aria-pressed": "{{cs.pressed}}", "style": css(width="40px", height="40px", border_radius="999px", padding="3px", box_sizing="border-box", background="transparent", cursor="pointer") + "; border: 2px solid {{cs.ring}}"},
                      E("span", {"style": css(display="block", width="100%", height="100%", border_radius="999px", box_shadow="inset 0 0 0 1px rgba(0,0,0,0.18)") + "; background: {{cs.hex}}"}, "")))))) +
          opt_block("Gravur, kostenlos",
              E("label", {"for": "engr", "style": body(14, col=MUT)}, "Bis 18 Zeichen, erscheint auf der Rückseite unter dem Kiesel.") +
              V("input", {"id": "engr", "type": "text", "maxlength": "18", "placeholder": "z.B. Linos Kiesel", "style": css(padding="14px 16px", border_radius="14px", border=f"1px solid {LINE}", background=SURF, color=INK, font_family=BODY, font_size="16px")})) +
          E("div", {"style": css(padding_top="28px", border_top=f"1px solid {LINE}", display="flex", justify_content="space-between", align_items="flex-end", gap="20px")},
            E("div", {"style": css(display="flex", flex_direction="column", gap="4px")},
              E("span", {"style": body(15, col=MUT)}, "{{summary}}") + E("span", {"style": disp(40, lh="1.05", ls="-0.035em")}, "{{total}}")) +
            btn("In den Warenkorb", "Warenkorb.dc.html", "primary", "l"))))))

kaufen_js = T_JS + """
const s = this.state || {};
const MODELS = { k1: { name: 'Kiesel 1', sub: 'SE-Grösse', stores: [['256 GB', 1200], ['512 GB', 1400], ['1 TB', 1600]] }, pro: { name: 'Kiesel 1 Pro', sub: '13-mini-Grösse, 3x-Tele', stores: [['256 GB', 1500], ['512 GB', 1700], ['1 TB', 1900], ['2 TB', 2300]] } };
const model = s.model || 'pro';
const col = s.col || 'Himmelblau';
const caseCol = s.caseCol || 'Mattweiss';
const withCase = s.withCase ?? true;
const M = MODELS[model];
const si = Math.min(s.store ?? 1, M.stores.length - 1);
const sel = on => ({ border: on ? t.ink : t.line, border2: on ? t.ink : 'transparent', pressed: on ? 'true' : 'false' });
const models = Object.keys(MODELS).map(k => ({ name: MODELS[k].name, sub: MODELS[k].sub, from: 'ab ' + chf(MODELS[k].stores[0][1]), pick: () => this.setState({ model: k }), ...sel(k === model) }));
const stores = M.stores.map((x, i) => ({ name: x[0], price: chf(x[1]), pick: () => this.setState({ store: i }), ...sel(i === si) }));
""" + SW_JS + """
const caseSwatches = Object.keys(PAL).map(k => ({ name: k, hex: PAL[k].frame, pressed: k === caseCol ? 'true' : 'false', ring: k === caseCol ? t.ink : 'transparent', pick: () => this.setState({ caseCol: k }) }));
const total = M.stores[si][1] + (withCase ? 59 : 0);
return {
  t, c: PAL[col], k: PAL[caseCol], swatches, caseSwatches, models, stores, colName: col, caseName: caseCol, withCase,
  isProBare: model === 'pro' && !withCase, isProCase: model === 'pro' && withCase, isK1Bare: model === 'k1' && !withCase, isK1Case: model === 'k1' && withCase,
  toggleCase: () => this.setState({ withCase: !withCase }), casePressed: withCase ? 'true' : 'false', caseTrack: withCase ? t.accent : t.line, caseKnob: withCase ? '23px' : '3px',
  summary: M.name + ', ' + col + ', ' + M.stores[si][0] + (withCase ? ', mit Hülle' : ''), total: chf(total)
};"""
write("Kaufen.dc.html", page("Kiesel kaufen", 1440, 1400, kaufen_html, THEME_PROP, kaufen_js))

# =====================================================================
# 6. WARENKORB-SCHUBLADE
# =====================================================================
def cart_item(thumb, title, meta, price):
    return E("div", {"style": css(display="grid", grid_template_columns="64px minmax(0, 1fr) auto", gap="16px", padding="20px 0", border_bottom=f"1px solid {LINE}", align_items="start")},
        E("div", {"style": css(width="64px", height="64px", border_radius="16px", background=BG, border=f"1px solid {LINE}", display="flex", align_items="center", justify_content="center", overflow="hidden")}, thumb) +
        E("div", {"style": css(display="flex", flex_direction="column", gap="4px")},
          E("h3", {"style": body(16, w=600, col=INK)}, title) + E("p", {"style": body(14, col=MUT)}, meta) +
          E("div", {"style": css(display="flex", align_items="center", gap="10px", margin_top="8px")},
            E("button", {"type": "button", "aria-label": "Eins weniger", "style": css(width="44px", height="44px", border_radius="999px", border=f"1px solid {LINE}", background=BG, color=INK, display="flex", align_items="center", justify_content="center")}, icon("minus", 16)) +
            E("span", {"style": body(16, w=600, col=INK)}, "1") +
            E("button", {"type": "button", "aria-label": "Eins mehr", "style": css(width="44px", height="44px", border_radius="999px", border=f"1px solid {LINE}", background=BG, color=INK, display="flex", align_items="center", justify_content="center")}, icon("plus", 16)) +
            E("button", {"type": "button", "style": body(14, col=MUT) + "; background: transparent; border: 0; text-decoration: underline; margin-left: 6px; min-height: 44px"}, "Entfernen"))) +
        E("span", {"style": body(16, w=600, col=INK) + "; white-space: nowrap"}, price))

def row(a, b, strong=False):
    return E("div", {"style": css(display="flex", justify_content="space-between", padding="4px 0")},
        E("span", {"style": (disp(22, lh="1.3") if strong else body(15, col=MUT))}, a) + E("span", {"style": (disp(22, lh="1.3") if strong else body(15, col=MUT))}, b))

drawer = E("aside", {"role": "dialog", "aria-label": "Warenkorb", "style": css(position="absolute", top="0", right="0", bottom="0", width="460px", background=SURF, border_left=f"1px solid {LINE}", display="flex", flex_direction="column", box_sizing="border-box")},
    E("div", {"style": css(display="flex", justify_content="space-between", align_items="center", padding="22px 28px", border_bottom=f"1px solid {LINE}")},
      E("h2", {"style": disp(24, lh="1.2")}, "Warenkorb") +
      E("button", {"type": "button", "aria-label": "Warenkorb schliessen", "style": css(width="44px", height="44px", border_radius="999px", border=f"1px solid {LINE}", background=BG, color=INK, display="flex", align_items="center", justify_content="center")}, icon("close", 18))) +
    E("div", {"style": css(flex_grow="1", padding="4px 28px", display="flex", flex_direction="column")},
      cart_item(phone("back", "pro", PAL["Himmelblau"], 58, floor_=False), "Kiesel 1 Pro", "Himmelblau, 512 GB, Gravur «Linos Kiesel»", "CHF 1’700.–") +
      cart_item(phone("back", "pro", PAL["Himmelblau"], 58, floor_=False, case=PAL["Mattweiss"]), "Kiesel-Hülle", "für Kiesel 1 Pro, Mattweiss", "CHF 59.–") +
      E("a", {"href": "Kaufen.dc.html", "style": body(15, w=600, col=ACC) + "; text-decoration: none; margin-top: 18px; display: inline-flex; align-items: center; gap: 6px"}, "Weiter einkaufen" + icon("arrow", 16))) +
    E("div", {"style": css(border_top=f"1px solid {LINE}", padding="20px 28px 28px", display="flex", flex_direction="column", gap="2px")},
      row("Zwischensumme", "CHF 1’759.–") + row("Versand", "kostenlos") + row("davon MwSt. 8.1 %", "CHF 131.80") +
      E("div", {"style": "height: 8px"}, "") + row("Total", "CHF 1’759.–", True) +
      E("div", {"style": "margin-top: 16px"}, btn("Zur Kasse", "#", "primary", "l", full=True))))

cart_html = root(1440, 900,
    nav() +
    E("div", {"style": css(position="relative", flex_grow="1", overflow="hidden")},
      E("div", {"style": css(padding="56px 120px 0")}, E("h1", {"style": disp(64, lh="1", ls="-0.045em")}, "Kiesel kaufen")) +
      E("div", {"style": css(position="absolute", top="0", left="0", right="0", bottom="0") + f"; background: {OVL}"}, "") + drawer))
write("Warenkorb.dc.html", page("Kiesel Warenkorb", 1440, 900, cart_html, THEME_PROP, T_JS + "\nreturn { t };"))

# =====================================================================
# 7. DESIGNSYSTEM
# =====================================================================
def swatch_row(name, hexv, use, dark_bg):
    return E("div", {"style": css(display="grid", grid_template_columns="48px 150px 110px minmax(0, 1fr)", gap="16px", align_items="center", padding="10px 0", border_top=f"1px solid {LINE}")},
        E("span", {"style": css(width="48px", height="48px", border_radius="14px", border="1px solid rgba(128,128,128,0.35)") + f"; background: {hexv}"}, "") +
        E("span", {"style": body(15, w=600, col=INK)}, name) + E("span", {"style": body(14, col=MUT) + "; font-variant-numeric: tabular-nums"}, hexv) + E("span", {"style": body(14, col=MUT)}, use))

USE = {"bg": "Seitenhintergrund", "surface": "Karten, Leisten", "raised": "Aktive Menüpunkte", "ink": "Text, Kaufen-Knopf", "muted": "Nebentext", "line": "Linien, Rahmen", "accent": "Akzent, Hauptknöpfe", "accentInk": "Text auf Akzent", "heat": "Warnung, «fällt weg»", "stage": "Bühne oben", "stageLo": "Bühne unten"}
def theme_col(name):
    th = THEMES[name]
    return E("div", {"style": css(display="flex", flex_direction="column")},
        E("h3", {"style": disp(22, lh="1.2") + "; margin-bottom: 14px"}, f"Thema {name}") +
        "".join(swatch_row(k, th[k], USE[k], name == "Dunkel") for k in ["bg", "surface", "raised", "ink", "muted", "line", "accent", "accentInk", "heat", "stage", "stageLo"]))

prod = ""
for n in COLOPTS:
    p_ = PAL[n]
    prod += E("div", {"style": css(display="flex", flex_direction="column", gap="10px")},
        E("div", {"style": css(height="120px", border_radius="20px", display="flex", align_items="flex-end", padding="12px", gap="8px", border=f"1px solid {LINE}") + f"; background: linear-gradient(135deg, {p_['backHi']}, {p_['back']} 55%, {p_['backLo']})"},
          E("span", {"style": css(width="28px", height="28px", border_radius="999px", border="2px solid rgba(255,255,255,0.6)") + f"; background: {p_['frame']}"}, "")) +
        E("span", {"style": body(16, w=600, col=INK)}, n) +
        E("span", {"style": body(13, col=MUT)}, f"Rahmen {p_['frame']} · Rücken {p_['back']}"))

type_rows = [("Display", disp(120, lh="1", ls="-0.055em"), "Kiesel", "Unbounded 600 · 112–128 px · -0.05em"),
             ("Titel 1", disp(64, lh="1.02", ls="-0.04em"), "Welcher Kiesel?", "Unbounded 600 · 56–64 px · -0.04em"),
             ("Titel 2", disp(32, lh="1.1", ls="-0.02em"), "Zwei Kameras. Eine Hand.", "Unbounded 600 · 32 px"),
             ("Titel 3", disp(22, lh="1.2", ls="-0.01em"), "Privacy-Modus", "Unbounded 600 · 20–22 px"),
             ("Einleitung", body(21, col=INK), "Zwei kompakte Handys mit Akku bis in die Nacht.", "Instrument Sans 400 · 19–21 px · 1.6"),
             ("Text", body(17, col=INK), "Die Tele-Linse stellt schon ab rund 20 cm scharf.", "Instrument Sans 400 · 16–17 px · 1.6"),
             ("Klein", body(14, col=MUT), "Preise inklusive MwSt.", "Instrument Sans 400 · 13–14 px")]
type_html = "".join(E("div", {"style": css(display="grid", grid_template_columns="140px minmax(0, 1fr) 320px", gap="24px", align_items="center", padding="18px 0", border_top=f"1px solid {LINE}")},
    E("span", {"style": body(14, w=600, col=MUT)}, a) + E("span", {"style": b}, c_) + E("span", {"style": body(13, col=MUT)}, d)) for a, b, c_, d in type_rows)

space = "".join(E("div", {"style": css(display="flex", flex_direction="column", gap="8px", align_items="flex-start")},
    E("span", {"style": css(width=f"{v}px", height="24px", border_radius="4px", background=ACC)}, "") + E("span", {"style": body(13, col=MUT)}, f"{v}")) for v in [4, 8, 12, 16, 24, 32, 48, 64, 96, 140])
radii = "".join(E("div", {"style": css(display="flex", flex_direction="column", gap="8px", align_items="center")},
    E("span", {"style": css(width="84px", height="84px", border_radius=f"{v}px", background=SURF, border=f"2px solid {INK}")}, "") + E("span", {"style": body(13, col=MUT)}, lab)) for v, lab in [(8, "8 · klein"), (16, "16 · Felder"), (24, "24 · Karten"), (32, "32 · Bühnen"), (999, "rund · Knöpfe")])

toggle_on = E("span", {"style": css(width="50px", height="30px", border_radius="15px", background=ACC, position="relative", display="block")}, E("span", {"style": css(position="absolute", top="3px", left="23px", width="24px", height="24px", border_radius="12px", background="#FFFFFF", display="block")}, ""))
toggle_off = E("span", {"style": css(width="50px", height="30px", border_radius="15px", background=LINE, position="relative", display="block")}, E("span", {"style": css(position="absolute", top="3px", left="3px", width="24px", height="24px", border_radius="12px", background="#FFFFFF", display="block")}, ""))
comps = E("div", {"style": css(display="flex", flex_direction="column", gap="28px")},
    E("div", {"style": css(display="flex", gap="14px", align_items="center", flex_wrap="wrap")},
      btn("Hauptknopf", "#", "primary", "l") + btn("Zweitknopf", "#", "secondary", "l") + btn("Kaufen", "#", "ink", "s") + btn("Textlink", "#", "ghost", ico="arrow")) +
    E("div", {"style": css(display="flex", gap="10px", align_items="center", flex_wrap="wrap")},
      pill("Ausgewählt", True) + pill("Normal") + pill("256 GB") + E("div", {"style": css(background="#2B3440", padding="10px", border_radius="999px")}, zoom_pills("3x")) + glass_chip(icon("rotate", 18) + "Glas-Chip")) +
    E("div", {"style": css(display="flex", gap="28px", align_items="center", flex_wrap="wrap")},
      E("div", {"style": css(display="flex", gap="6px")}, "".join(E("span", {"style": css(width="44px", height="44px", border_radius="999px", padding="3px", box_sizing="border-box", display="block") + (f"; border: 2px solid {INK}" if i == 0 else "; border: 2px solid transparent")}, E("span", {"style": css(display="block", width="100%", height="100%", border_radius="999px", box_shadow="inset 0 0 0 1px rgba(0,0,0,0.18)") + f"; background: {PAL[n]['frame']}"}, "")) for i, n in enumerate(COLOPTS))) +
      E("div", {"style": css(display="flex", align_items="center", gap="12px")}, toggle_on + E("span", {"style": body(15, w=600, col=INK)}, "An")) +
      E("div", {"style": css(display="flex", align_items="center", gap="12px")}, toggle_off + E("span", {"style": body(15, w=600, col=INK)}, "Aus")) +
      E("span", {"style": css(min_width="22px", height="22px", border_radius="11px", background=ACC, color=ACCI, font_family=BODY, font_size="12px", font_weight="600", display="inline-flex", align_items="center", justify_content="center")}, "2")) +
    E("div", {"style": css(display="flex", flex_direction="column", gap="8px", width="420px")},
      E("label", {"for": "dsin", "style": body(14, w=600, col=INK)}, "Gravur") +
      V("input", {"id": "dsin", "type": "text", "placeholder": "z.B. Linos Kiesel", "style": css(padding="14px 16px", border_radius="14px", border=f"1px solid {LINE}", background=SURF, color=INK, font_family=BODY, font_size="16px")})))

def ds_sec(title, inner):
    return E("section", {"style": css(display="flex", flex_direction="column", gap="24px", padding_top="64px")}, E("h2", {"style": disp(40, lh="1.05", ls="-0.035em")}, title) + inner)

ds_html = root(1440, 3400,
    E("div", {"style": css(padding="80px 120px 80px", display="flex", flex_direction="column")},
      E("div", {"style": css(display="flex", align_items="center", gap="16px")}, logo(56) + E("h1", {"style": disp(64, lh="1", ls="-0.045em")}, "Kiesel Designsystem")) +
      E("p", {"style": body(19, col=MUT) + "; margin-top: 16px; max-width: 760px"}, "Alle Farben, Schriften, Abstände und Bausteine der Kiesel-Website an einem Ort. Beide Themen verwenden dieselben Namen, damit der Code nur ein Set Variablen braucht.") +
      ds_sec("Farben", E("div", {"style": css(display="grid", grid_template_columns="repeat(2, minmax(0, 1fr))", gap="48px")}, theme_col("Dunkel") + theme_col("Hell"))) +
      ds_sec("Produktfarben", E("div", {"style": css(display="grid", grid_template_columns="repeat(5, minmax(0, 1fr))", gap="20px")}, prod)) +
      ds_sec("Schrift", E("div", {"style": css(display="flex", flex_direction="column")}, type_html)) +
      ds_sec("Abstände", E("div", {"style": css(display="flex", gap="28px", align_items="flex-end", flex_wrap="wrap")}, space)) +
      ds_sec("Radien", E("div", {"style": css(display="flex", gap="36px")}, radii)) +
      ds_sec("Bausteine", comps)))
write("Designsystem.dc.html", page("Kiesel Designsystem", 1440, 3400, ds_html, THEME_PROP, T_JS + "\nreturn { t };"))

# =====================================================================
# 8. ILLUSTRATIONEN
# =====================================================================
marks = ""
for name, x, y in ZOOM_TARGETS:
    marks += E("circle", {"cx": f(x), "cy": f(y), "r": "22", "style": "fill: none; stroke: #FF8A5E; stroke-width: 2.5"})
    marks += E("text", {"x": f(x + 28), "y": f(y + 5), "style": "font-family: 'Instrument Sans', sans-serif; font-size: 16px; font-weight: 600; fill: #FFFFFF; paint-order: stroke; stroke: #0C1116; stroke-width: 4"}, name)
alpen_html = E("div", {"style": css(width="1600px", height="1000px", overflow="hidden")},
    E("svg", {"width": "1600", "height": "1000", "viewBox": "0 0 1600 1000", "role": "img", "aria-label": "Alpenpanorama mit Bergsee, Dorf und versteckten Details", "style": "display: block"},
      alpen("a0") + E("g", {"style": "opacity: {{markOp}}"}, marks)))
write("Alpen.dc.html", page("Alpenpanorama für den Zoom", 1600, 1000, alpen_html, {"zoompunkte": {"editor": "boolean", "default": False}}, "return { markOp: (this.props.zoompunkte ?? false) ? 1 : 0 };"))

tiles = ""
for i, (name, x, y) in enumerate(ZOOM_TARGETS):
    tiles += E("figure", {"style": css(margin="0", display="flex", flex_direction="column", gap="10px")},
        E("div", {"style": css(border_radius="16px", overflow="hidden", height="219px", border="1px solid #27313B")},
          E("svg", {"width": "350", "height": "219", "viewBox": crop(x, y, 8), "preserveAspectRatio": "xMidYMid slice", "role": "img", "aria-label": f"{name} bei 8x", "style": "display: block"}, alpen(f"z{i}"))) +
        E("figcaption", {"style": css(display="flex", justify_content="space-between", gap="8px")},
          E("span", {"style": body(15, w=600, col="#EEF2F5")}, name) + E("span", {"style": body(13, col="#9AA7B3") + "; font-variant-numeric: tabular-nums"}, f"8x · {x}, {y}")))
zoom_html = E("div", {"style": css(width="1620px", height="840px", overflow="hidden", box_sizing="border-box", background="#0C1116", padding="56px 60px", display="flex", flex_direction="column", gap="32px")},
    E("div", {"style": css(display="flex", flex_direction="column", gap="8px")},
      E("h1", {"style": disp(40, lh="1.05", ls="-0.035em") + "; color: #EEF2F5"}, "Versteckte Details bei 8x") +
      E("p", {"style": body(16, col="#9AA7B3")}, "Acht Stellen im Panorama, die erst beim Reinzoomen auftauchen. Die Zahlen sind die Mittelpunkte im 1600 × 1000-Bild.")) +
    E("div", {"style": css(display="grid", grid_template_columns="repeat(4, minmax(0, 1fr))", gap="32px")}, tiles))
write("AlpenZoom.dc.html", page("Zoom-Details im Alpenpanorama", 1620, 840, zoom_html, {}, "return {};"))

blume_html = E("div", {"style": css(width="1200px", height="800px", overflow="hidden")},
    E("svg", {"width": "1200", "height": "800", "viewBox": "0 0 1200 800", "role": "img", "aria-label": "Blume mit Tautropfen, Biene und Wiese", "style": "display: block"},
      blume("bl", "{{fx.bg}}", "{{fx.fl}}", "{{fx.fg}}", "{{fx.bee}}")))
blume_js = """const F = {
  'Blume (3x Tele)': { bg: 'b3', fl: 'b0', fg: 'b4', bee: 'b2' },
  'Biene': { bg: 'b4', fl: 'b2', fg: 'b4', bee: 'b0' },
  'Makro (alles nah)': { bg: 'b1', fl: 'b0', fg: 'b2', bee: 'b1' },
  'Alles scharf': { bg: 'b0', fl: 'b0', fg: 'b0', bee: 'b0' }
};
return { fx: F[this.props.fokus] || F['Blume (3x Tele)'] };"""
write("Blume.dc.html", page("Blume für die Makro-Demo", 1200, 800, blume_html, {"fokus": {"editor": "enum", "options": ["Blume (3x Tele)", "Biene", "Makro (alles nah)", "Alles scharf"], "default": "Blume (3x Tele)"}}, blume_js))

cols_html = ""
for kind, title, sub in [("se", "iPhone SE (2016)", "1624 mAh"), ("k1", "Kiesel 1", "ca. 3000 mAh"), ("pro", "Kiesel 1 Pro", "ca. 3600 mAh")]:
    sc = 3.4
    Wm = 64.2 if kind == "pro" else 58.6
    vis, leg = phone_open(kind, (380 - Wm*sc)/2, 30, sc)
    legend = "".join(E("li", {"style": css(display="flex", gap="10px", align_items="center")},
        E("span", {"style": css(width="22px", height="22px", border_radius="11px", font_family=BODY, font_size="12px", font_weight="600", display="flex", align_items="center", justify_content="center", flex_shrink="0", color="#06222A") + f"; background: {'#FF8A5E' if ht else '#5CC3DB'}"}, str(nn)) +
        E("span", {"style": body(14, col="#EEF2F5", lh="1.3")}, nm + (E("span", {"style": body(12, w=600, col="#FF8A5E") + "; margin-left: 8px"}, "fällt weg") if ht else ""))) for nn, nm, ht in leg)
    cols_html += E("div", {"style": css(display="flex", flex_direction="column", gap="16px", align_items="center")},
        E("div", {"style": css(display="flex", flex_direction="column", align_items="center", gap="4px")},
          E("h2", {"style": disp(26, lh="1.2") + "; color: #EEF2F5"}, title) + E("span", {"style": body(16, col="#9AA7B3")}, sub)) +
        E("svg", {"width": "380", "height": "520", "viewBox": "0 0 380 520", "role": "img", "aria-label": f"Innenleben {title}"}, vis) +
        E("ol", {"style": css(list_style="none", margin="0", padding="0", display="flex", flex_direction="column", gap="8px", width="340px")}, legend))
innen_html = E("div", {"style": css(width="1800px", height="1240px", overflow="hidden", box_sizing="border-box", background="#0C1116", padding="56px 60px", display="flex", flex_direction="column", gap="40px")},
    E("div", {"style": css(display="flex", flex_direction="column", gap="8px")},
      E("h1", {"style": disp(40, lh="1.05", ls="-0.035em") + "; color: #EEF2F5"}, "Innenleben im Vergleich") +
      E("p", {"style": body(16, col="#9AA7B3")}, "Alle drei im selben Massstab, von hinten geöffnet. Orange markiert, was beim Kiesel wegfällt.")) +
    E("div", {"style": css(display="grid", grid_template_columns="repeat(3, minmax(0, 1fr))", gap="40px")}, cols_html))
write("Innenleben.dc.html", page("Innenleben SE, Kiesel 1, Kiesel 1 Pro", 1800, 1240, innen_html, {}, "return {};"))

# =====================================================================
# canvas.json
# =====================================================================
R1 = 3400 + 420; R2 = R1 + 5800 + 420
boards = {
    "Main.dc.html": {"x": 0, "y": R1, "w": 1440, "h": 5800, "title": "Startseite Desktop", "is_interactive": True},
    "StartMobil.dc.html": {"x": 1520, "y": R1, "w": 390, "h": 5000, "title": "Startseite Handy", "is_interactive": True},
    "Menue.dc.html": {"x": 1990, "y": R1, "w": 1440, "h": 900, "title": "Menü «Handys» aufgeklappt", "is_interactive": True},
    "Warenkorb.dc.html": {"x": 1990, "y": R1 + 1020, "w": 1440, "h": 900, "title": "Warenkorb-Schublade", "is_interactive": True},
    "ModellPro.dc.html": {"x": 3510, "y": R1, "w": 1440, "h": 5750, "title": "Modellseite Kiesel 1 Pro", "is_interactive": True},
    "Kaufen.dc.html": {"x": 5030, "y": R1, "w": 1440, "h": 1400, "title": "Kaufen", "is_interactive": True},
    "Designsystem.dc.html": {"x": 0, "y": 0, "w": 1440, "h": 3400, "title": "Designsystem"},
    "Alpen.dc.html": {"x": 0, "y": R2, "w": 1600, "h": 1000, "title": "Alpenpanorama (Zoom-Demo)"},
    "AlpenZoom.dc.html": {"x": 1680, "y": R2, "w": 1620, "h": 840, "title": "Versteckte Zoom-Details"},
    "Blume.dc.html": {"x": 3380, "y": R2, "w": 1200, "h": 800, "title": "Blume (Makro-Demo)"},
    "Innenleben.dc.html": {"x": 4660, "y": R2, "w": 1800, "h": 1240, "title": "Innenleben (Akku-Story)"},
}
canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-09-27T12:00:00Z"}, "title": "Kiesel 2.0", "launch": {"view": "canvas"}, "pages": [],
          "boards": boards,
          "order": ["Main.dc.html", "StartMobil.dc.html", "Menue.dc.html", "Warenkorb.dc.html", "ModellPro.dc.html", "Kaufen.dc.html", "Designsystem.dc.html", "Alpen.dc.html", "AlpenZoom.dc.html", "Blume.dc.html", "Innenleben.dc.html"],
          "notes": {"seiten": {"x": 0, "y": R1 - 300, "text": "Seiten", "kind": "title1", "maxW": 6470},
                    "illu": {"x": 0, "y": R2 - 300, "text": "Illustrationen für die Demos", "kind": "title1", "maxW": 6460}},
          "designSystems": []}
open(os.path.join(ROOT, "canvas.json"), "w").write(json.dumps(canvas, ensure_ascii=False, indent=1))
for n in sorted(os.listdir(ROOT)):
    print(n, os.path.getsize(os.path.join(ROOT, n)))
