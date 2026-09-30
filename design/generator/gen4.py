"""Etappe 7: Artboards Vergleichen, Technische Daten, Akku-Rechner, FAQ.
Baut auf gen2.py auf (gleiche Bausteine, gleiches Designsystem)."""
import json, os, sys
sys.path.insert(0, "/home/claude/kgen")
import gen2
from gen2 import (E, V, css, disp, body, btn, pill, glass_chip, phone, stage, nav, footer, section,
                  T_JS, THEME_PROP, page, root, icon, holes, PAL, COLOPTS, f, ICONS,
                  BG, SURF, RAI, INK, MUT, LINE, ACC, ACCI, HEAT, STG, STGLO, BODY, DISP)
from lib import MODELS, front_svg

ROOT = gen2.ROOT
NEW = []
def write(name, html):
    open(os.path.join(ROOT, name), "w").write(html); NEW.append(name)

def h1(t):
    return E("h1", {"style": disp(112, lh="0.95", ls="-0.05em")}, t)
def h2(t, size=56):
    return E("h2", {"style": disp(size, lh="1.02", ls="-0.04em")}, t)
def lead(t, mt="20px", mw="680px"):
    return E("p", {"style": body(19, col=MUT) + f"; margin-top: {mt}; max-width: {mw}"}, t)

def chip_loop(list_name, item, count, label_hole="name"):
    return E("sc-for", {"list": "{{%s}}" % list_name, "as": item, "hint-placeholder-count": str(count)},
        E("button", {"type": "button", "onClick": "{{%s.pick}}" % item, "aria-pressed": "{{%s.pressed}}" % item,
                     "style": css(display="inline-flex", align_items="center", gap="8px", padding="0 16px", min_height="44px", border_radius="999px", cursor="pointer", font_family=BODY, font_size="15px", font_weight="500", white_space="nowrap") +
                              "; background: {{%s.bg}}; color: {{%s.fg}}; border: 1px solid {{%s.bd}}" % (item, item, item)},
          "{{%s.%s}}" % (item, label_hole)))

CHIP_JS = "const chip = (on) => ({ pressed: on ? 'true' : 'false', bg: on ? t.ink : t.surface, fg: on ? t.bg : t.ink, bd: on ? t.ink : t.line });\n"

# =====================================================================
# 1. VERGLEICHEN
# =====================================================================
DEV = {
    "k1": {"name": "Kiesel 1", "h": 123.8, "w": 58.6, "d": 9.0, "g": 140, "bat": 3000, "disp": 4.7, "r": 9.6, "type": "kiesel", "est": True},
    "pro": {"name": "Kiesel 1 Pro", "h": 131.5, "w": 64.2, "d": 9.0, "g": 170, "bat": 3600, "disp": 5.4, "r": 10.6, "type": "kiesel", "est": True},
    "se": {"name": "iPhone SE (2016)", "h": 123.8, "w": 58.6, "d": 7.6, "g": 113, "bat": 1624, "disp": 4.0, "r": 8.6, "type": "home"},
    "mini": {"name": "iPhone 13 mini", "h": 131.5, "w": 64.2, "d": 7.65, "g": 140, "bat": 2438, "disp": 5.4, "r": 10.5, "type": "notch"},
    "p18": {"name": "iPhone 18 Pro", "h": 150.0, "w": 71.9, "d": 8.75, "g": 211, "bat": 4056, "disp": 6.3, "r": 12, "type": "island"},
    "pmax": {"name": "iPhone 18 Pro Max", "h": 163.4, "w": 78.0, "d": 8.75, "g": 249, "bat": 5391, "disp": 6.9, "r": 13, "type": "island"},
}
SC, BASE, CX = 3.0, 572, 600

def kiesel_group(mk):
    m = MODELS[mk]
    return E("g", {"transform": "translate({{kz.x}} {{kz.y}}) scale({{kz.s}})", "style": "opacity: {{kz.%sOp}}" % mk},
             front_svg(mk, PAL["Himmelblau"], "cmp" + mk))

opp = (E("rect", {"x": "{{o.x}}", "y": "{{o.y}}", "width": "{{o.w}}", "height": "{{o.h}}", "rx": "{{o.r}}", "style": "fill: {{o.fill}}; stroke: {{t.ink}}; stroke-width: 1.8; stroke-dasharray: {{o.dash}}"}) +
       E("rect", {"x": "{{o.sx}}", "y": "{{o.sy}}", "width": "{{o.sw}}", "height": "{{o.sh}}", "rx": "{{o.sr}}", "style": "fill: {{t.line}}; opacity: {{o.scrOp}}"}) +
       E("circle", {"cx": "{{o.hx}}", "cy": "{{o.hy}}", "r": "{{o.hr}}", "style": "fill: none; stroke: {{t.muted}}; stroke-width: 2; opacity: {{o.homeOp}}"}) +
       E("rect", {"x": "{{o.nx}}", "y": "{{o.ny}}", "width": "{{o.nw}}", "height": "{{o.nh}}", "rx": "{{o.nr}}", "style": "fill: {{t.muted}}; opacity: {{o.notchOp}}"}) +
       E("text", {"x": "{{o.cx}}", "y": "598", "style": f"font-family: {BODY}; font-size: 16px; font-weight: 600; fill: {INK}; text-anchor: middle; opacity: {{{{labOp}}}}"}, "{{o.name}}") +
       E("text", {"x": "{{o.cx}}", "y": "620", "style": f"font-family: {BODY}; font-size: 13px; fill: {MUT}; text-anchor: middle; opacity: {{{{labOp}}}}"}, "{{o.dims}}"))
kiesel_lab = (E("text", {"x": "{{kz.cx}}", "y": "598", "style": f"font-family: {BODY}; font-size: 16px; font-weight: 600; fill: {INK}; text-anchor: middle; opacity: {{{{labOp}}}}"}, "{{kz.name}}") +
              E("text", {"x": "{{kz.cx}}", "y": "620", "style": f"font-family: {BODY}; font-size: 13px; fill: {MUT}; text-anchor: middle; opacity: {{{{labOp}}}}"}, "{{kz.dims}}"))
card = E("g", {"style": "opacity: {{cardOp}}"},
    E("rect", {"x": "{{cd.x}}", "y": "{{cd.y}}", "width": "{{cd.w}}", "height": "{{cd.h}}", "rx": "10", "style": f"fill: none; stroke: {HEAT}; stroke-width: 2; stroke-dasharray: 7 5"}) +
    E("text", {"x": "{{cd.cx}}", "y": "{{cd.ty}}", "style": f"font-family: {BODY}; font-size: 13px; font-weight: 600; fill: {HEAT}; text-anchor: middle"}, "Kreditkarte"))

cmp_svg = E("svg", {"width": "1200", "height": "640", "viewBox": "0 0 1200 640", "role": "img", "aria-label": "{{ariaCmp}}", "style": "display: block"},
    E("line", {"x1": "40", "y1": f(BASE), "x2": "1160", "y2": f(BASE), "style": f"stroke: {LINE}; stroke-width: 1.5"}) +
    opp + kiesel_group("k1") + kiesel_group("pro") + kiesel_lab + card +
    E("text", {"x": "40", "y": "36", "style": f"font-family: {BODY}; font-size: 14px; fill: {MUT}; opacity: {{{{overOp}}}}"}, "{{overLegend}}"))

stat_rows = E("sc-for", {"list": "{{rows}}", "as": "r", "hint-placeholder-count": "6"},
    E("div", {"style": css(display="grid", grid_template_columns="160px minmax(0, 1fr) minmax(0, 1fr)", gap="24px", align_items="center", padding="16px 0", border_top=f"1px solid {LINE}")},
      E("span", {"style": body(16, w=600, col=INK)}, "{{r.label}}") +
      E("div", {"style": css(display="flex", flex_direction="column", gap="8px")},
        E("span", {"style": body(16, col=INK)}, "{{r.a}}") +
        E("div", {"style": css(height="8px", border_radius="4px", background=RAI, overflow="hidden")}, E("div", {"style": css(height="100%", border_radius="4px") + f"; background: {ACC}; width: {{{{r.aw}}}}%"}, ""))) +
      E("div", {"style": css(display="flex", flex_direction="column", gap="8px")},
        E("span", {"style": body(16, col=INK)}, "{{r.b}}") +
        E("div", {"style": css(height="8px", border_radius="4px", background=RAI, overflow="hidden")}, E("div", {"style": css(height="100%", border_radius="4px") + f"; background: {MUT}; width: {{{{r.bw}}}}%"}, "")))))

cmp_html = root(1440, 2600,
    nav("Vergleichen") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(h1("Vergleichen") + lead("Alle Geräte im echten Massstab zueinander. Stell deinen Kiesel neben ein iPhone 18 Pro Max, und du siehst sofort, was «kompakt» wirklich heisst."), pad="72px 120px 0") +
      section(
        E("div", {"style": css(display="flex", flex_wrap="wrap", gap="20px 32px", align_items="center")},
          E("div", {"role": "group", "aria-label": "Dein Kiesel", "style": css(display="flex", gap="8px", align_items="center")},
            E("span", {"style": body(15, col=MUT) + "; margin-right: 4px"}, "Dein Kiesel") + chip_loop("kOpts", "ko", 2)) +
          E("div", {"role": "group", "aria-label": "Vergleichsgerät", "style": css(display="flex", gap="8px", align_items="center", flex_wrap="wrap")},
            E("span", {"style": body(15, col=MUT) + "; margin-right: 4px"}, "gegen") + chip_loop("vsOpts", "vo", 5))) +
        E("div", {"style": css(display="flex", flex_wrap="wrap", gap="20px 32px", align_items="center", margin_top="16px")},
          E("div", {"role": "group", "aria-label": "Darstellung", "style": css(display="flex", gap="8px", align_items="center")},
            E("span", {"style": body(15, col=MUT) + "; margin-right: 4px"}, "Ansicht") + chip_loop("modeOpts", "mo", 2)) +
          E("button", {"type": "button", "onClick": "{{toggleCard}}", "aria-pressed": "{{cardPressed}}", "style": css(display="inline-flex", align_items="center", padding="0 16px", min_height="44px", border_radius="999px", cursor="pointer", font_family=BODY, font_size="15px", font_weight="500") + "; background: {{cardBg}}; color: {{cardFg}}; border: 1px solid {{cardBd}}"}, "Kreditkarte einblenden")) +
        E("div", {"style": css(margin_top="28px", border_radius="32px", border=f"1px solid {LINE}", overflow="hidden") + f"; background: linear-gradient(180deg, {STG}, {STGLO})"}, cmp_svg) +
        E("p", {"style": disp(28, lh="1.3", ls="-0.02em", w=500) + "; margin-top: 32px; max-width: 980px"}, "{{sentence}}"), pad="48px 120px 0") +
      section(E("div", {"style": css(display="grid", grid_template_columns="160px minmax(0, 1fr) minmax(0, 1fr)", gap="24px", padding_bottom="12px")},
                E("span", {}, "") + E("span", {"style": body(15, w=600, col=ACC)}, "{{kz.name}}") + E("span", {"style": body(15, w=600, col=MUT)}, "{{o.name}}")) +
              stat_rows +
              E("p", {"style": body(14, col=MUT) + "; margin-top: 20px"}, "Kiesel-Werte sind Schätzungen aus dem Konzept. iPhone-Werte laut Hersteller und Presseberichten, beim iPhone 18 Pro Max weichen die Quellen bei Dicke und Akku leicht voneinander ab."), pad="80px 120px 0") +
      footer()))

cmp_js = T_JS + "\nconst DEV = " + json.dumps(DEV, ensure_ascii=False) + ";\n" + CHIP_JS + f"const SC = {SC}, BASE = {BASE}, CX = {CX};\n" + """
const s = this.state || {};
const kid = s.k || 'k1';
let vs = s.vs || 'pmax';
if (vs === kid) vs = kid === 'k1' ? 'pro' : 'k1';
const mode = s.mode || 'side';
const card = !!s.card;
const over = mode === 'over';
const k = DEV[kid], o = DEV[vs];
const kW = k.w * SC, kH = k.h * SC, oW = o.w * SC, oH = o.h * SC;
const kx = over ? CX - kW / 2 : CX - 36 - kW;
const ox = over ? CX - oW / 2 : CX + 36;
const U = kid === 'pro' ? 642 : 586, UH = kid === 'pro' ? 1315 : 1238;
const fmt = (v, d = 1) => v.toLocaleString('de-CH', { minimumFractionDigits: d, maximumFractionDigits: d });
const kz = { x: kx.toFixed(1), y: (BASE - kH).toFixed(1), s: (kW / U).toFixed(4), k1Op: kid === 'k1' ? 1 : 0, proOp: kid === 'pro' ? 1 : 0, cx: (kx + kW / 2).toFixed(1), name: k.name, dims: fmt(k.h) + ' × ' + fmt(k.w) + ' mm' };
// Gegner: Kiesel wird als Umriss gezeichnet, iPhones mit Details
const oy = BASE - oH, R = o.r * SC;
const ins = (o.type === 'home' ? 4.2 : 1.9) * SC;
const top = o.type === 'home' ? 17 * SC : ins, bot = o.type === 'home' ? 17 * SC : ins;
const isW = (o.type === 'kiesel' ? 16 : o.type === 'notch' ? 26 : 20) * SC;
const oo = {
  x: ox.toFixed(1), y: oy.toFixed(1), w: oW.toFixed(1), h: oH.toFixed(1), r: R.toFixed(1),
  fill: over ? 'none' : t.surface, dash: over ? '8 6' : 'none',
  sx: (ox + ins).toFixed(1), sy: (oy + top).toFixed(1), sw: (oW - 2 * ins).toFixed(1), sh: (oH - top - bot).toFixed(1), sr: (o.type === 'home' ? SC : R - ins).toFixed(1), scrOp: over ? 0 : 1,
  hx: (ox + oW / 2).toFixed(1), hy: (oy + oH - 8.6 * SC).toFixed(1), hr: (5.4 * SC).toFixed(1), homeOp: (!over && o.type === 'home') ? 1 : 0,
  nx: (ox + oW / 2 - isW / 2).toFixed(1), ny: (oy + (o.type === 'notch' ? ins : o.type === 'home' ? 7.6 * SC : ins + 2 * SC)).toFixed(1), nw: (o.type === 'home' ? 10 * SC : isW).toFixed(1), nh: ((o.type === 'notch' ? 5 : o.type === 'home' ? 1.3 : 4.4) * SC).toFixed(1), nr: (2.2 * SC).toFixed(1), notchOp: over ? 0 : 1,
  cx: (ox + oW / 2).toFixed(1), name: o.name, dims: fmt(o.h) + ' × ' + fmt(o.w) + ' mm'
};
const cW = 53.98 * SC, cH = 85.6 * SC;
const cd = { x: (kx + kW / 2 - cW / 2).toFixed(1), y: (BASE - cH).toFixed(1), w: cW.toFixed(1), h: cH.toFixed(1), cx: (kx + kW / 2).toFixed(1), ty: (BASE - cH - 10).toFixed(1) };
const dh = o.h - k.h, dw = o.w - k.w, area = (o.h * o.w) / (k.h * k.w) - 1;
let sentence;
if (Math.abs(area) < 0.01) sentence = o.name + ' und ' + k.name + ' haben genau dieselbe Grundfläche. ' + (o.d < k.d ? 'Das ' + o.name + ' ist ' + fmt(k.d - o.d, 2) + ' mm dünner, dafür hat der Kiesel ' + Math.round((k.bat / o.bat - 1) * 100) + ' % mehr Akku.' : '');
else if (area > 0) sentence = (o.type === 'kiesel' ? 'Der ' : 'Das ') + o.name + ' ist ' + fmt(dh) + ' mm höher und ' + fmt(dw) + ' mm breiter als der ' + k.name + '. Seine Vorderseite ist ' + Math.round(area * 100) + ' % grösser.';
else sentence = 'Der ' + k.name + ' ist ' + fmt(-dh) + ' mm höher und ' + fmt(-dw) + ' mm breiter als ' + (o.type === 'kiesel' ? 'der ' : 'das ') + o.name + '.';
const ROWS = [['Höhe', 'h', ' mm', 1], ['Breite', 'w', ' mm', 1], ['Dicke', 'd', ' mm', 2], ['Gewicht', 'g', ' g', 0], ['Akku', 'bat', ' mAh', 0], ['Display', 'disp', '″', 1]];
const val = (m, key, u, d) => (m.est && (key === 'g' || key === 'bat') ? 'ca. ' : '') + (d ? fmt(m[key], d) : m[key].toLocaleString('de-CH')) + u;
const rows = ROWS.map(([label, key, u, d]) => { const mx = Math.max(k[key], o[key]); return { label, a: val(k, key, u, d), b: val(o, key, u, d), aw: (k[key] / mx * 100).toFixed(1), bw: (o[key] / mx * 100).toFixed(1) }; });
const kOpts = [['k1', 'Kiesel 1'], ['pro', 'Kiesel 1 Pro']].map(([id, name]) => ({ name, pick: () => this.setState({ k: id }), ...chip(id === kid) }));
const vsOpts = ['pmax', 'p18', 'mini', 'se', kid === 'k1' ? 'pro' : 'k1'].map(id => ({ name: DEV[id].name, pick: () => this.setState({ vs: id }), ...chip(id === vs) }));
const modeOpts = [['side', 'Nebeneinander'], ['over', 'Übereinander']].map(([id, name]) => ({ name, pick: () => this.setState({ mode: id }), ...chip(id === mode) }));
return { t, kz, o: oo, cd, rows, sentence, kOpts, vsOpts, modeOpts, labOp: over ? 0 : 1, overOp: over ? 1 : 0,
  overLegend: 'Gefüllt: ' + k.name + ', gestrichelt: ' + o.name, cardOp: card ? 1 : 0,
  toggleCard: () => this.setState({ card: !card }), cardPressed: card ? 'true' : 'false', cardBg: card ? t.ink : t.surface, cardFg: card ? t.bg : t.ink, cardBd: card ? t.ink : t.line,
  ariaCmp: k.name + ' und ' + o.name + ' im Massstab nebeneinander' };"""
write("Vergleichen.dc.html", page("Kiesel Vergleichen", 1440, 2600, cmp_html, THEME_PROP, cmp_js))

# =====================================================================
# 2. TECHNISCHE DATEN
# =====================================================================
SPEC = [
    ("Design und Masse", [
        ("Masse", "123.8 × 58.6 × 9 mm", "131.5 × 64.2 × 9 mm"),
        ("Gewicht", "ca. 140 g", "ca. 170 g"),
        ("Rahmen", "Titan, matt", "Titan, matt"),
        ("Farben", "Mattschwarz, Titangrau, Himmelblau, Mattweiss, Kieselbeige", "Mattschwarz, Titangrau, Himmelblau, Mattweiss, Kieselbeige"),
        ("Wasser und Staub", "IP68", "IP68")]),
    ("Display", [
        ("Grösse", "ca. 4.7″ OLED, randlos", "ca. 5.4″ OLED, randlos"),
        ("Bildrate", "LTPO, 1 bis 90 Hz", "LTPO, 1 bis 90 Hz"),
        ("Entsperren", "Face ID in der Dynamic Island", "Face ID in der Dynamic Island")]),
    ("Chip und Speicher", [
        ("Chip", "A20 Pro abgespeckt, 2 nm", "A20 Pro abgespeckt, 2 nm"),
        ("CPU", "1 Super-Kern + 3 Effizienz-Kerne, max. 4 GHz", "1 Super-Kern + 3 Effizienz-Kerne, max. 4 GHz"),
        ("GPU", "ca. 4 Kerne", "ca. 4 Kerne"),
        ("Arbeitsspeicher", "12 GB RAM", "12 GB RAM"),
        ("Speicher", "256 GB, 512 GB, 1 TB", "256 GB, 512 GB, 1 TB, 2 TB"),
        ("Kühlung", "passiv über die Rückseite", "Mini-Vapor-Chamber plus Rückseite")]),
    ("Kameras", [
        ("Hauptkamera", "50 MP, variable Linse 0.5x bis 1x (ca. 13 bis 26 mm)", "50 MP, variable Linse 0.5x bis 1x (ca. 13 bis 26 mm)"),
        ("Tele", "–", "50 MP, 3x (ca. 78 mm), optischer Bildstabilisator"),
        ("Zoom", "digital bis 5x", "optisch 3x, digital bis 10x"),
        ("Nahaufnahmen", "Makro über 0.5x", "Makro über 0.5x, Tele-Nahfokus ab ca. 20 cm"),
        ("Blitz", "RGB-LED mit Benachrichtigungen", "RGB-LED mit Benachrichtigungen")]),
    ("Video", [
        ("Maximal", "4K mit 120 fps", "4K mit 120 fps"),
        ("Zeitlupe", "2K mit 240 fps", "2K mit 240 fps")]),
    ("Akku und Laden", [
        ("Akku", "ca. 3000 mAh, Silizium-Kohlenstoff", "ca. 3600 mAh, Silizium-Kohlenstoff"),
        ("Mit Kabel", "ca. 45 W über USB-C", "ca. 45 W über USB-C"),
        ("Kabellos", "25 W über MagSafe und Qi", "25 W über MagSafe und Qi")]),
    ("Verbindungen", [
        ("Anschluss", "USB-C", "USB-C"),
        ("SIM", "nur eSIM", "nur eSIM"),
        ("Mobilfunk", "4G als Standard, 5G nur bei hoher Datenlast", "4G als Standard, 5G nur bei hoher Datenlast")]),
    ("Software und Funktionen", [
        ("System", "iOS 27 mit schlankem Look", "iOS 27 mit schlankem Look"),
        ("Updates", "mindestens 7 Jahre System- und Sicherheitsupdates", "mindestens 7 Jahre System- und Sicherheitsupdates"),
        ("Tasten", "Action-Button, Kamera-Knopf, Lautstärke, Seitentaste", "Action-Button, Kamera-Knopf, Lautstärke, Seitentaste"),
        ("Extras", "Zen-Modus, Privacy-Modus mit Hardware-Trennung", "Zen-Modus, Privacy-Modus mit Hardware-Trennung")]),
    ("Preis", [
        ("Ab", "CHF 1’200.– (256 GB)", "CHF 1’500.– (256 GB)"),
        ("Bis", "CHF 1’600.– (1 TB)", "CHF 2’300.– (2 TB)")]),
]

head = E("div", {"style": css(display="grid", grid_template_columns="260px minmax(0, 1fr) minmax(0, 1fr)", gap="32px", align_items="end", padding="24px 0", border_bottom=f"2px solid {INK}")},
    E("span", {}, "") +
    "".join(E("div", {"style": css(display="flex", align_items="flex-end", gap="20px")},
        E("div", {"style": css(width="90px", height="180px", display="flex", align_items="flex-end", justify_content="center", flex_shrink="0")}, phone("front", mk, PAL[c], 170 if mk == "pro" else 160, floor_=False)) +
        E("div", {"style": css(display="flex", flex_direction="column", gap="6px")},
          E("span", {"style": disp(26, lh="1.15")}, n) + E("span", {"style": body(15, col=MUT)}, p) +
          E("div", {"style": "margin-top: 8px"}, btn("Kaufen", "Kaufen.dc.html", "primary", "s"))))
        for mk, c, n, p in [("k1", "Kieselbeige", "Kiesel 1", "ab CHF 1’200.–"), ("pro", "Himmelblau", "Kiesel 1 Pro", "ab CHF 1’500.–")]))

key_nums = E("div", {"style": css(display="grid", grid_template_columns="repeat(4, minmax(0, 1fr))", gap="32px")},
    "".join(E("div", {"style": css(display="flex", flex_direction="column", gap="8px", padding_top="24px", border_top=f"2px solid {INK}")},
        E("span", {"style": disp(56, lh="1", ls="-0.04em")}, a) + E("span", {"style": body(17, w=600, col=INK)}, b) + E("span", {"style": body(15, col=MUT)}, c_))
        for a, b, c_ in [("12 GB", "Arbeitsspeicher", "in beiden Modellen"), ("50 MP", "bei jeder Kamera", "auch beim Tele des Pro"), ("45 W", "mit Kabel", "25 W kabellos über MagSafe"), ("7 Jahre", "Updates", "mindestens, für System und Sicherheit")]))

groups = E("sc-for", {"list": "{{groups}}", "as": "g", "hint-placeholder-count": "3"},
    E("section", {"style": css(display="flex", flex_direction="column", padding_top="48px")},
      E("h2", {"style": disp(28, lh="1.2", ls="-0.02em") + "; margin-bottom: 12px"}, "{{g.title}}") +
      E("sc-for", {"list": "{{g.rows}}", "as": "r", "hint-placeholder-count": "4"},
        E("div", {"style": css(display="grid", grid_template_columns="260px minmax(0, 1fr) minmax(0, 1fr)", gap="32px", padding="16px 0", border_top=f"1px solid {LINE}")},
          E("span", {"style": body(16, w=600, col=INK)}, "{{r.label}}") +
          E("span", {"style": body(16) + "; color: {{r.aCol}}"}, "{{r.a}}") +
          E("span", {"style": body(16) + "; color: {{r.bCol}}"}, "{{r.b}}")))))

tech_html = root(1440, 3900,
    nav("Handys") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(h1("Technische Daten") + lead("Kiesel 1 und Kiesel 1 Pro nebeneinander. Blau markiert, was beim Pro anders ist."), pad="72px 120px 0") +
      section(key_nums, pad="64px 120px 0") +
      section(
        E("div", {"style": css(display="flex", justify_content="flex-end")},
          E("button", {"type": "button", "onClick": "{{toggleDiff}}", "aria-pressed": "{{diffPressed}}",
                       "style": css(display="inline-flex", align_items="center", gap="14px", padding="6px 0", background="transparent", border="0", color=INK, cursor="pointer", font_family=BODY, font_size="16px", font_weight="600", min_height="44px")},
            E("span", {"style": css(width="54px", height="32px", border_radius="16px", position="relative", display="block", flex_shrink="0") + "; background: {{diffTrack}}"},
              E("span", {"style": css(position="absolute", top="4px", width="24px", height="24px", border_radius="12px", background="#FFFFFF", display="block") + "; left: {{diffKnob}}"}, "")) +
            "Nur Unterschiede zeigen")) +
        head + groups +
        E("p", {"style": body(14, col=MUT) + "; margin-top: 32px"}, "Alle Werte sind Konzept-Angaben und teilweise geschätzt. Kiesel ist kein echtes Produkt."), pad="64px 120px 0") +
      footer()))

tech_js = T_JS + "\nconst SPEC = " + json.dumps(SPEC, ensure_ascii=False) + ";\n" + """
const diff = !!(this.state && this.state.diff);
const groups = SPEC.map(([title, rows]) => ({ title, rows: rows.filter(r => !diff || r[1] !== r[2]).map(([label, a, b]) => ({ label, a, b, aCol: t.ink, bCol: a !== b ? t.accent : t.ink })) })).filter(g => g.rows.length);
return { t, groups, toggleDiff: () => this.setState({ diff: !diff }), diffPressed: diff ? 'true' : 'false', diffTrack: diff ? t.accent : t.line, diffKnob: diff ? '26px' : '4px' };"""
write("Technik.dc.html", page("Kiesel Technische Daten", 1440, 3900, tech_html, THEME_PROP, tech_js))

# =====================================================================
# 3. AKKU-RECHNER
# =====================================================================
sliders = E("sc-for", {"list": "{{sliders}}", "as": "sl", "hint-placeholder-count": "5"},
    E("div", {"style": css(display="flex", flex_direction="column", gap="10px", padding="18px 0", border_top=f"1px solid {LINE}")},
      E("div", {"style": css(display="flex", justify_content="space-between", gap="12px")},
        E("label", {"for": "{{sl.id}}", "style": body(16, w=600, col=INK)}, "{{sl.label}}") +
        E("span", {"style": body(16, col=MUT) + "; font-variant-numeric: tabular-nums"}, "{{sl.out}}")) +
      V("input", {"id": "{{sl.id}}", "type": "range", "min": "0", "max": "{{sl.max}}", "step": "0.5", "value": "{{sl.val}}", "onChange": "{{sl.set}}", "style": css(width="100%", height="28px") + f"; accent-color: {ACC}"})))

presets = E("div", {"role": "group", "aria-label": "Typischer Tag", "style": css(display="flex", gap="8px", flex_wrap="wrap", margin_bottom="12px")}, chip_loop("presets", "pr", 4))

batt = E("sc-for", {"list": "{{results}}", "as": "b", "hint-placeholder-count": "3"},
    E("div", {"style": css(display="flex", flex_direction="column", gap="8px", padding="16px 0", border_top=f"1px solid {LINE}")},
      E("div", {"style": css(display="flex", justify_content="space-between", gap="12px", align_items="baseline")},
        E("span", {"style": body(17, w=600, col=INK)}, "{{b.name}}") +
        E("span", {"style": disp(22, lh="1.2", ls="-0.02em") + "; color: {{b.col}}"}, "{{b.result}}")) +
      E("div", {"style": css(height="30px", border=f"2px solid {INK}", border_radius="9px", padding="3px", box_sizing="border-box", position="relative", margin_right="8px")},
        E("div", {"style": css(height="100%", border_radius="5px") + "; width: {{b.pct}}%; background: {{b.fill}}"}, "") +
        E("span", {"style": css(position="absolute", right="-8px", top="8px", width="4px", height="10px", border_radius="0 3px 3px 0", background=INK)}, "")) +
      E("span", {"style": body(14, col=MUT)}, "{{b.days}}")))

chart = E("svg", {"width": "620", "height": "300", "viewBox": "0 0 620 300", "role": "img", "aria-label": "{{chartAria}}", "style": "display: block; max-width: 100%"},
    "".join(E("line", {"x1": "50", "y1": f(20 + i*60), "x2": "590", "y2": f(20 + i*60), "style": f"stroke: {LINE}; stroke-width: 1"}) +
            E("text", {"x": "40", "y": f(24 + i*60), "style": f"font-family: {BODY}; font-size: 12px; fill: {MUT}; text-anchor: end"}, f"{100 - i*25} %") for i in range(5)) +
    "".join(E("text", {"x": f(50 + (hh - 7) * 540/16), "y": "286", "style": f"font-family: {BODY}; font-size: 12px; fill: {MUT}; text-anchor: middle"}, f"{hh:02d}:00") for hh in [7, 11, 15, 19, 23]) +
    E("path", {"d": "{{lineS}}", "style": f"fill: none; stroke: {MUT}; stroke-width: 2.5; stroke-dasharray: 6 5"}) +
    E("path", {"d": "{{lineK}}", "style": f"fill: none; stroke: {INK}; stroke-width: 3"}) +
    E("path", {"d": "{{lineP}}", "style": f"fill: none; stroke: {ACC}; stroke-width: 3.5"}))

legend = E("div", {"style": css(display="flex", gap="20px", flex_wrap="wrap", margin_top="12px")},
    "".join(E("span", {"style": body(14, col=INK) + "; display: inline-flex; align-items: center; gap: 8px"},
        E("span", {"style": css(width="22px", height="4px", border_radius="2px", display="block") + f"; background: {c_}"}, "") + n) for n, c_ in [("Kiesel 1 Pro", ACC), ("Kiesel 1", INK), ("iPhone SE (2016)", MUT)]))

akku_html = root(1440, 2300,
    nav("Handys") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(h1("Akku-Rechner") + lead("Stell deinen typischen Tag ein. Der Rechner startet um 07:00 mit 100 % und rechnet bis 23:00. Die restliche Zeit liegt das Handy im Standby."), pad="72px 120px 0") +
      section(E("div", {"style": css(display="grid", grid_template_columns="minmax(0, 5fr) minmax(0, 6fr)", gap="64px", align_items="start")},
          E("div", {"style": css(display="flex", flex_direction="column")},
            presets + sliders +
            E("p", {"role": "alert", "style": body(15, w=600) + f"; color: {HEAT}; min-height: 24px; margin-top: 12px"}, "{{err}}")) +
          E("div", {"style": css(display="flex", flex_direction="column", gap="24px")},
            E("div", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="28px 28px 12px")},
              E("span", {"style": body(15, col=MUT)}, "Um 23:00") +
              E("p", {"style": disp(36, lh="1.15", ls="-0.03em") + "; margin-top: 4px; margin-bottom: 12px"}, "{{headline}}") + batt) +
            E("div", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="24px 20px 20px")},
              E("h2", {"style": body(15, w=600, col=INK) + "; margin-bottom: 12px"}, "Akkustand über den Tag") + chart + legend))), pad="56px 120px 0") +
      section(E("div", {"style": css(background=SURF, border=f"1px solid {LINE}", border_radius="28px", padding="32px", display="grid", grid_template_columns="minmax(0, 1fr) minmax(0, 1fr)", gap="40px")},
          E("div", {"style": css(display="flex", flex_direction="column", gap="10px")},
            E("h2", {"style": disp(24, lh="1.2")}, "So wird gerechnet") +
            E("p", {"style": body(15, col=MUT)}, "Verbrauch pro Stunde beim Kiesel 1: Surfen 10 %, Video 7 %, Musik 2 %, Kamera und Navigation 16 %, Spielen 20 %, Standby 0.6 %. Die Stunden verteilen sich gleichmässig über den Tag.") +
            E("p", {"style": body(15, col=MUT)}, "Der Pro hat 20 % mehr Akku. Sein grösseres Display kostet etwas, dafür arbeitet der Chip dank Vapor Chamber bei Kamera und Spielen kühler und effizienter. Unterm Strich braucht er 20 % weniger pro Stunde, bei Kamera 28 % und bei Spielen 25 % weniger.")) +
          E("div", {"style": css(display="flex", flex_direction="column", gap="10px")},
            E("h2", {"style": disp(24, lh="1.2")}, "Gut zu wissen") +
            E("p", {"style": body(15, col=MUT)}, "Je mehr du das Handy nutzt, desto grösser wird der Vorsprung des Pro. An einem ruhigen Tag liegen beide nah beieinander, an einem langen Ferientag zählt jedes Prozent.") +
            E("p", {"style": body(15, col=MUT)}, "Das SE von 2016 dient als Vergleich. Es hat rund 46 % weniger Akku als der Kiesel 1, das Modell rechnet es deshalb mit 1.85-fachem Verbrauch."))), pad="80px 120px 0") +
      footer()))

akku_js = T_JS + "\n" + CHIP_JS + """
const s = this.state || {};
const DEF = { surf: 3, video: 1.5, music: 1, cam: 0.5, game: 0 };
const v = { ...DEF, ...(s.v || {}) };
const RATE = { surf: 10, video: 7, music: 2, cam: 16, game: 20 };
const IDLE = 0.6;
const PRO = { surf: 0.8, video: 0.8, music: 0.8, cam: 0.72, game: 0.75, idle: 0.8 };
const SE = 1.85;
const SL = [['surf', 'Surfen und Social Media', 10], ['video', 'Video', 6], ['music', 'Musik und Podcasts', 8], ['cam', 'Kamera und Navigation', 5], ['game', 'Spielen', 4]];
const fmtH = x => x.toLocaleString('de-CH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' h';
const sliders = SL.map(([key, label, max]) => ({ id: 'sl-' + key, label, max: String(max), val: String(v[key]), out: fmtH(v[key]), set: e => this.setState({ v: { ...v, [key]: parseFloat(e.target.value) } }) }));
const PRESETS = { 'Ruhiger Tag': { surf: 1.5, video: 0.5, music: 0.5, cam: 0, game: 0 }, 'Normal': DEF, 'Viel unterwegs': { surf: 5, video: 2.5, music: 1.5, cam: 1, game: 1 }, 'Ferientag': { surf: 2, video: 1, music: 1, cam: 3, game: 0 } };
const same = (a, b) => Object.keys(a).every(k => a[k] === b[k]);
const presets = Object.keys(PRESETS).map(name => ({ name, pick: () => this.setState({ v: { ...PRESETS[name] } }), ...chip(same(PRESETS[name], v)) }));
const A = Object.values(v).reduce((a, b) => a + b, 0);
const hm = h => { const m = Math.round(h * 60); const H = Math.floor(m / 60) % 24, M = m % 60; return (H < 10 ? '0' : '') + H + ':' + (M < 10 ? '0' : '') + M; };
if (A > 16) {
  const empty = { name: '', result: '–', pct: 0, fill: t.line, col: t.muted, days: '' };
  return { t, sliders, presets, err: 'Zusammen ' + A.toLocaleString('de-CH') + ' Stunden aktiv. Ein Tag von 07:00 bis 23:00 hat nur 16, stell einen Regler tiefer.',
    headline: '–', results: [{ ...empty, name: 'Kiesel 1 Pro' }, { ...empty, name: 'Kiesel 1' }, { ...empty, name: 'iPhone SE (2016)' }], lineK: 'M0 0', lineP: 'M0 0', lineS: 'M0 0', chartAria: 'Keine Berechnung möglich' };
}
const drainK = Object.keys(RATE).reduce((a, k) => a + v[k] * RATE[k], 0) + (16 - A) * IDLE;
const drainP = Object.keys(RATE).reduce((a, k) => a + v[k] * RATE[k] * PRO[k], 0) + (16 - A) * IDLE * PRO.idle;
const drainS = drainK * SE;
const res = (drain, nightIdle) => ({ left: Math.max(0, 100 - drain), empty: drain >= 100 ? 7 + 16 * 100 / drain : null, days: 100 / (drain + 8 * nightIdle) });
const rK = res(drainK, IDLE), rP = res(drainP, IDLE * PRO.idle), rS = res(drainS, IDLE * SE);
const X = h => 50 + (h - 7) * 540 / 16, Y = p => 20 + (100 - p) * 2.4;
const line = r => r.empty ? `M${X(7)} ${Y(100)} L${X(r.empty).toFixed(1)} ${Y(0)} L${X(23)} ${Y(0)}` : `M${X(7)} ${Y(100)} L${X(23)} ${Y(r.left).toFixed(1)}`;
const txt = r => r.empty ? 'leer um ' + hm(r.empty) : Math.round(r.left) + ' %';
const dayTxt = r => { const d = r.days.toFixed(1); return 'Reicht bei diesem Alltag für ca. ' + (d === '1.0' ? '1 Tag' : d.replace(/\.0$/, '') + ' Tage'); };
const bar = (name, r, fill) => ({ name, result: txt(r), pct: r.left.toFixed(1), fill: r.left < 20 ? t.heat : fill, col: r.empty ? t.heat : t.ink, days: dayTxt(r) });
const diff = Math.round(rP.left) - Math.round(rK.left);
const headline = rK.empty ? 'Der Kiesel 1 macht um ' + hm(rK.empty) + ' schlapp, der Pro ' + (rP.empty ? 'um ' + hm(rP.empty) : 'hat noch ' + Math.round(rP.left) + ' %') + '.'
  : 'Der Pro hat ' + diff + ' Prozentpunkte mehr übrig.';
return { t, sliders, presets, err: '', headline,
  results: [bar('Kiesel 1 Pro', rP, t.accent), bar('Kiesel 1', rK, t.ink), bar('iPhone SE (2016)', rS, t.muted)],
  lineK: line(rK), lineP: line(rP), lineS: line(rS),
  chartAria: 'Um 23:00: Kiesel 1 Pro ' + txt(rP) + ', Kiesel 1 ' + txt(rK) + ', iPhone SE ' + txt(rS) };"""
write("Akku.dc.html", page("Kiesel Akku-Rechner", 1440, 2300, akku_html, THEME_PROP, akku_js))

# =====================================================================
# 4. FAQ
# =====================================================================
FAQ = [
    ("Konzept", "Kann ich den Kiesel wirklich kaufen?", "Leider nein. Kiesel ist ein Fan-Konzept. Der Warenkorb funktioniert trotzdem, erst die Kasse verrät die traurige Wahrheit."),
    ("Konzept", "Wie ist die Idee zum Kiesel entstanden?", "Aus einem Gedankenexperiment: Wie sähe ein Handy in der Grösse vom iPhone SE aus, wenn man es mit heutiger Technik neu baut und alles weglässt, was man im Alltag nicht braucht?"),
    ("Handys", "Was ist der Unterschied zwischen Kiesel 1 und Kiesel 1 Pro?", "Der Kiesel 1 ist so gross wie das iPhone SE von 2016 und hat eine Kamera. Der Pro ist so gross wie das iPhone 13 mini, hat zusätzlich eine 3x-Tele, mehr Akku, eine Mini-Vapor-Chamber und bis 2 TB Speicher."),
    ("Handys", "Warum ist der Kiesel 9 mm dick?", "Die zusätzlichen 1.4 mm gegenüber dem SE gehen fast komplett in den Akku und die MagSafe-Spule. In der Hand fällt das kaum auf, beim Akku macht es viel aus."),
    ("Handys", "Warum gibt es keine Kopfhörerbuchse und keinen SIM-Schlitten?", "Beides braucht Platz, den der Akku besser nutzen kann. Kopfhörer gehen über USB-C oder Bluetooth, die SIM ist eine eSIM."),
    ("Handys", "Ist der Kiesel wasserdicht?", "Beide Modelle sind nach IP68 gegen Wasser und Staub geschützt."),
    ("Handys", "Wie lange bekommt der Kiesel Updates?", "Mindestens sieben Jahre System- und Sicherheitsupdates."),
    ("Akku und Laden", "Wie lange hält der Akku?", "Das hängt stark von deinem Alltag ab. Im Akku-Rechner kannst du deinen typischen Tag einstellen und siehst, wie viel am Abend übrig bleibt."),
    ("Akku und Laden", "Wie schnell lädt der Kiesel?", "Mit Kabel über USB-C mit rund 45 W, kabellos über MagSafe und Qi mit 25 W."),
    ("Funktionen", "Was macht der Privacy-Modus genau?", "Halte den Action-Button zwei Sekunden. Drei Schalter trennen Kamera, Mikrofon und GPS vom Strom. Solange der Modus aktiv ist, leuchtet der RGB-Punkt orange."),
    ("Funktionen", "Was bedeuten die Farben des RGB-Lichts?", "Blau für Anrufe, Violett für Nachrichten, Grün beim Laden, Rot bei tiefem Akku und Orange im Privacy-Modus. Beim Fotografieren leuchtet die LED neutral weiss."),
    ("Kaufen", "Passt die Hülle auf beide Modelle?", "Nein, es gibt je eine eigene Hülle für den Kiesel 1 und den Kiesel 1 Pro. Beide kosten CHF 59.– und gibt es in allen fünf Farben."),
    ("Kaufen", "Was passiert mit meinem Warenkorb?", "Er bleibt in deinem Browser gespeichert, auch wenn du die Seite schliesst. Für den Fall, dass Cupertino es sich doch noch anders überlegt."),
]
PLUS, MINUS = ICONS["plus"], ICONS["minus"]

faq_list = E("sc-for", {"list": "{{faqs}}", "as": "q", "hint-placeholder-count": "5"},
    E("div", {"style": css(border_top=f"1px solid {LINE}", padding="22px 0", display="flex", flex_direction="column", gap="12px")},
      E("button", {"type": "button", "onClick": "{{q.toggle}}", "aria-expanded": "{{q.expanded}}", "aria-controls": "{{q.aid}}",
                   "style": css(display="flex", justify_content="space-between", align_items="center", gap="24px", background="transparent", border="0", padding="0", color=INK, cursor="pointer", text_align="left", min_height="44px")},
        E("span", {"style": css(display="flex", flex_direction="column", gap="4px")},
          E("span", {"style": body(13, w=600, col=MUT)}, "{{q.cat}}") +
          E("span", {"style": disp(20, lh="1.3", ls="-0.01em", w=500)}, "{{q.q}}")) +
        E("svg", {"width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; flex-shrink: 0"}, E("path", {"d": "{{q.icon}}"}))) +
      E("sc-if", {"value": "{{q.open}}", "hint-placeholder-val": "{{ false }}"},
        E("p", {"id": "{{q.aid}}", "style": body(17, col=MUT) + "; max-width: 760px"}, "{{q.a}}"))))

faq_html = root(1440, 2700,
    nav("FAQ") +
    E("main", {"style": css(display="flex", flex_direction="column")},
      section(h1("Häufige Fragen") + lead("Alles, was man über den Kiesel wissen will. Und die eine Frage, die alle zuerst stellen."), pad="72px 120px 0") +
      section(
        E("div", {"style": css(display="flex", flex_direction="column", gap="8px", max_width="560px")},
          E("label", {"for": "faqsuche", "style": body(15, w=600, col=INK)}, "Suchen") +
          V("input", {"id": "faqsuche", "type": "search", "placeholder": "z.B. Akku, Hülle, Updates", "value": "{{query}}", "onChange": "{{setQuery}}",
                      "style": css(padding="14px 18px", border_radius="14px", border=f"1px solid {LINE}", background=SURF, color=INK, font_family=BODY, font_size="17px", min_height="48px", box_sizing="border-box")})) +
        E("div", {"role": "group", "aria-label": "Themen", "style": css(display="flex", gap="8px", flex_wrap="wrap", margin_top="24px")}, chip_loop("cats", "c", 6)) +
        E("div", {"style": css(display="flex", flex_direction="column", margin_top="32px", max_width="960px")},
          faq_list +
          E("sc-if", {"value": "{{none}}", "hint-placeholder-val": "{{ false }}"},
            E("p", {"style": body(17, col=MUT) + f"; padding: 24px 0; border-top: 1px solid {LINE}"}, "Nichts gefunden. Probier ein anderes Wort oder wähl «Alle»."))) +
        E("div", {"style": css(margin_top="56px", padding="32px", border_radius="28px", background=SURF, border=f"1px solid {LINE}", display="flex", justify_content="space-between", align_items="center", gap="24px", max_width="960px", box_sizing="border-box")},
          E("div", {"style": css(display="flex", flex_direction="column", gap="6px")},
            E("h2", {"style": disp(24, lh="1.2")}, "Deine Frage ist nicht dabei?") +
            E("p", {"style": body(16, col=MUT)}, "Schreib sie uns, dann kommt sie vielleicht in die nächste Version.")) +
          btn("Frage stellen", "#", "secondary")), pad="48px 120px 0") +
      footer()))

faq_js = T_JS + "\nconst FAQ = " + json.dumps(FAQ, ensure_ascii=False) + ";\n" + CHIP_JS + f"const PLUS = '{PLUS}', MINUS = '{MINUS}';\n" + """
const s = this.state || {};
const cat = s.cat || 'Alle';
const query = s.q || '';
const openSet = s.open || { 0: true };
const ql = query.trim().toLowerCase();
const faqs = FAQ.map((x, i) => ({ i, cat: x[0], q: x[1], a: x[2] }))
  .filter(x => (cat === 'Alle' || x.cat === cat) && (!ql || (x.q + ' ' + x.a).toLowerCase().includes(ql)))
  .map(x => { const open = !!openSet[x.i]; return { ...x, open, expanded: open ? 'true' : 'false', aid: 'faq-a-' + x.i, icon: open ? MINUS : PLUS, toggle: () => this.setState({ open: { ...openSet, [x.i]: !open } }) }; });
const cats = ['Alle', 'Konzept', 'Handys', 'Akku und Laden', 'Funktionen', 'Kaufen'].map(name => ({ name, pick: () => this.setState({ cat: name }), ...chip(name === cat) }));
return { t, faqs, cats, query, none: faqs.length === 0, setQuery: e => this.setState({ q: e.target.value }) };"""
write("FAQ.dc.html", page("Kiesel FAQ", 1440, 2700, faq_html, THEME_PROP, faq_js))

# =====================================================================
# canvas.json: aktuellen Stand nehmen, neue Reihe anhaengen
# =====================================================================
cv = json.load(open("/home/claude/kgen/canvas_current.json"))
bottom = max(b["y"] + b["h"] for b in cv["boards"].values())
R4 = bottom + 420
xs = 0
for n, w, h, title in [("Vergleichen.dc.html", 1440, 2600, "Vergleichen"), ("Technik.dc.html", 1440, 3900, "Technische Daten"), ("Akku.dc.html", 1440, 2300, "Akku-Rechner"), ("FAQ.dc.html", 1440, 2700, "FAQ")]:
    cv["boards"][n] = {"x": xs, "y": R4, "w": w, "h": h, "title": title, "is_interactive": True}
    if n not in cv["order"]: cv["order"].append(n)
    xs += w + 80
cv["notes"]["etappe7"] = {"x": 0, "y": R4 - 300, "text": "Etappe 7: Vergleichen, Technik, Akku, FAQ", "kind": "title1", "maxW": xs - 80}
open(os.path.join(ROOT, "canvas.json"), "w").write(json.dumps(cv, ensure_ascii=False, indent=1))
for n in NEW + ["canvas.json"]:
    print(n, os.path.getsize(os.path.join(ROOT, n)))
print("R4", R4)
