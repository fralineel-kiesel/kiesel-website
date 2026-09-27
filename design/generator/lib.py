import math, json, os

MODELS={"k1":dict(W=586,H=1238,R=96,cams=1),"pro":dict(W=642,H=1315,R=106,cams=2)}
PAL={
 "Himmelblau":dict(frame="#A7C4DE",hi="#E3EEF8",lo="#6E8BA8",back="#B8D3EA",backHi="#D5E6F5",backLo="#9CB9D4",logo="#A5C1DC"),
 "Mattschwarz":dict(frame="#2F3134",hi="#7A7F86",lo="#111214",back="#242529",backHi="#36383D",backLo="#17181B",logo="#2E3035"),
 "Titangrau":dict(frame="#8D9197",hi="#DADDE1",lo="#53565B",back="#7C8086",backHi="#999DA3",backLo="#62666B",logo="#72767C"),
 "Mattweiss":dict(frame="#DAD9D4",hi="#FBFAF8",lo="#A4A29B",back="#EDECE8",backHi="#FAF9F7",backLo="#D6D4CE",logo="#E0DED9"),
 "Kieselbeige":dict(frame="#C8BAA2",hi="#F0E8DA",lo="#978870",back="#D8CCB8",backHi="#E9E1D3",backLo="#C0B29B",logo="#CCBFA9"),
}
KEYS=["frame","hi","lo","back","backHi","backLo","logo"]
def holes(p): return {k:"{{%s.%s}}"%(p,k) for k in KEYS}

def f(x): 
    return ("%.2f"%x).rstrip("0").rstrip(".")
def rr(x,y,w,h,r):
    return (f"M{f(x+r)} {f(y)}H{f(x+w-r)}A{f(r)} {f(r)} 0 0 1 {f(x+w)} {f(y+r)}V{f(y+h-r)}"
            f"A{f(r)} {f(r)} 0 0 1 {f(x+w-r)} {f(y+h)}H{f(x+r)}A{f(r)} {f(r)} 0 0 1 {f(x)} {f(y+h-r)}V{f(y+r)}"
            f"A{f(r)} {f(r)} 0 0 1 {f(x+r)} {f(y)}Z")
def E(tag, attrs, inner=""):
    a=" ".join(f'{k}="{v}"' for k,v in attrs.items())
    return f"<{tag} {a}>{inner}</{tag}>"
def stop(o,color,op=None):
    st=f"stop-color: {color}"+("" if op is None else f"; stop-opacity: {op}")
    return E("stop",{"offset":o,"style":st})
def geo(m):
    W,H,R=m["W"],m["H"],m["R"]; s=H/1238
    return W,H,R,dict(act=200*s,v1=310*s,v2=450*s,pw=330*s,cc=800*s)
def camrow(m):
    c=m["R"]; xs=[c]+([c+164] if m["cams"]==2 else [])
    lr=64 if m["cams"]==2 else 68
    return c,xs,xs[-1]+lr+22,xs[-1]+lr+74

PEB="M54 18C79 17 96 31 95 52C94 72 76 84 50 84C24 84 5 73 5 53C5 33 27 19 54 18Z"
V1="M-4 70C26 62 56 50 104 34"; V2="M-4 80C30 72 64 60 104 46"

def common_defs(pid,col):
    d=[]
    d.append(E("linearGradient",{"id":pid+"fr","x1":"0","y1":"0","x2":"1","y2":"0"},
        stop("0",col["lo"])+stop("0.05",col["hi"])+stop("0.18",col["frame"])+stop("0.82",col["frame"])+stop("0.95",col["hi"])+stop("1",col["lo"])))
    d.append(E("linearGradient",{"id":pid+"bz","x1":"0","y1":"0","x2":"1","y2":"1"},
        stop("0",col["hi"])+stop("0.45",col["frame"])+stop("1",col["lo"])))
    d.append(E("filter",{"id":pid+"sh","x":"-30%","y":"-30%","width":"160%","height":"160%"},E("feGaussianBlur",{"stdDeviation":"30"})))
    d.append(E("filter",{"id":pid+"ls","x":"-40%","y":"-40%","width":"180%","height":"180%"},E("feGaussianBlur",{"stdDeviation":"5"})))
    d.append(E("filter",{"id":pid+"gr","x":"0","y":"0","width":"100%","height":"100%"},
        E("feTurbulence",{"type":"fractalNoise","baseFrequency":"1.1","numOctaves":"2","stitchTiles":"stitch"})+
        E("feColorMatrix",{"type":"saturate","values":"0"})+
        E("feComponentTransfer",{},E("feFuncA",{"type":"table","tableValues":"0 0.09"}))))
    return d

def buttons(W,g,side,fill,dx=-10,w=12):
    if side=="front": L=[("act",70),("v1",120),("v2",120)]; Rr=[("pw",180),("cc",110)]
    else: L=[("pw",180),("cc",110)]; Rr=[("act",70),("v1",120),("v2",120)]
    out=""
    for k,h in L: out+=E("rect",{"x":f(dx),"y":f(g[k]),"width":str(w),"height":str(h),"rx":"5","style":f"fill: {fill}"})
    for k,h in Rr: out+=E("rect",{"x":f(W-12-dx),"y":f(g[k]),"width":str(w),"height":str(h),"rx":"5","style":f"fill: {fill}"})
    return out

def lens(cx,cy,r,pid,tele):
    C=2*math.pi*r*0.47
    gl=pid+("tl" if tele else "gl")
    s=""
    s+=E("circle",{"cx":f(cx),"cy":f(cy+4),"r":f(r+3),"style":"fill: #000000; opacity: 0.3","filter":f"url(#{pid}ls)"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r),"style":f"fill: url(#{pid}bz)"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r-4),"style":"fill: none; stroke: #FFFFFF; stroke-opacity: 0.4; stroke-width: 1.5"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r-9),"style":"fill: #111316"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r-14),"style":"fill: #05070A"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r*0.6),"style":f"fill: url(#{gl})"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r*0.47),"transform":f"rotate(200 {f(cx)} {f(cy)})",
        "style":f"fill: none; stroke: #8A6BD6; stroke-opacity: 0.5; stroke-width: {f(r*0.05)}; stroke-dasharray: {f(C*0.28)} {f(C)}"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r*0.47),"transform":f"rotate(25 {f(cx)} {f(cy)})",
        "style":f"fill: none; stroke: #43B894; stroke-opacity: 0.32; stroke-width: {f(r*0.04)}; stroke-dasharray: {f(C*0.16)} {f(C)}"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":f(r*0.2),"style":"fill: #020304"})
    s+=E("ellipse",{"cx":f(cx-r*0.27),"cy":f(cy-r*0.29),"rx":f(r*0.15),"ry":f(r*0.08),"transform":f"rotate(-38 {f(cx-r*0.27)} {f(cy-r*0.29)})","style":"fill: #FFFFFF; opacity: 0.82"})
    s+=E("circle",{"cx":f(cx+r*0.25),"cy":f(cy+r*0.26),"r":f(r*0.045),"style":"fill: #FFFFFF; opacity: 0.35"})
    return s

def led_svg(cx,cy,pid,led):
    s=""
    if led: s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":"120","style":f"fill: url(#{pid}lg)"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy+3),"r":"27","style":"fill: #000000; opacity: 0.25","filter":f"url(#{pid}ls)"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":"25","style":f"fill: url(#{pid}bz)"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":"20","style":"fill: #15171B"})
    s+=E("circle",{"cx":f(cx),"cy":f(cy),"r":"17","style":f"fill: url(#{pid}ld)"})
    s+=E("circle",{"cx":f(cx-5),"cy":f(cy-6),"r":"4","style":"fill: #FFFFFF; opacity: 0.7"})
    return s

def led_defs(pid,led):
    # led: None (off, static) or dict with holes/colors: color, o1, o2, mid, edge
    if led is None:
        ld=E("radialGradient",{"id":pid+"ld","cx":"0.4","cy":"0.35","r":"0.75"},stop("0","#FFFCF3")+stop("0.55","#F4EAD4")+stop("1","#DCCBA6"))
        return [ld]
    ld=E("radialGradient",{"id":pid+"ld","cx":"0.4","cy":"0.35","r":"0.75"},stop("0","#FFFFFF")+stop("0.4",led["mid"])+stop("1",led["edge"]))
    lg=E("radialGradient",{"id":pid+"lg","cx":"0.5","cy":"0.5","r":"0.5"},stop("0",led["color"],led["o1"])+stop("0.3",led["color"],led["o2"])+stop("1",led["color"],"0"))
    return [ld,lg]

def case_defs(pid,k,cutpath,milkypath):
    d=[]
    d.append(E("linearGradient",{"id":pid+"cr","x1":"0","y1":"0","x2":"1","y2":"0"},
        stop("0",k["lo"])+stop("0.04",k["frame"])+stop("0.1",k["hi"])+stop("0.2",k["frame"])+stop("0.8",k["frame"])+stop("0.9",k["hi"])+stop("0.96",k["frame"])+stop("1",k["lo"])))
    d.append(E("radialGradient",{"id":pid+"ch","cx":"0.25","cy":"0.12","r":"0.8"},stop("0","#FFFFFF","0.45")+stop("1","#FFFFFF","0")))
    d.append(E("clipPath",{"id":pid+"cm"},E("path",{"d":milkypath,"style":"clip-rule: evenodd"})))
    return d

def back_svg(mk,col,pid,led=None,case=None,extra_defs=True):
    m=MODELS[mk]; W,H,R,g=geo(m); c,xs,mic,fl=camrow(m)
    defs=common_defs(pid,col)
    defs.append(E("linearGradient",{"id":pid+"bk","x1":"0","y1":"0","x2":"0.35","y2":"1"},stop("0",col["backHi"])+stop("0.5",col["back"])+stop("1",col["backLo"])))
    defs.append(E("radialGradient",{"id":pid+"hl","cx":"0.18","cy":"0.08","r":"0.75"},stop("0","#FFFFFF","0.34")+stop("1","#FFFFFF","0")))
    defs.append(E("radialGradient",{"id":pid+"gl","cx":"0.38","cy":"0.34","r":"0.75"},stop("0","#2C4466")+stop("0.45","#121C2B")+stop("1","#040609")))
    defs.append(E("radialGradient",{"id":pid+"tl","cx":"0.38","cy":"0.34","r":"0.75"},stop("0","#3B2F63")+stop("0.45","#171328")+stop("1","#040609")))
    defs.append(E("clipPath",{"id":pid+"cb"},E("rect",{"x":"8","y":"8","width":f(W-16),"height":f(H-16),"rx":f(R-8)})))
    defs.append(E("clipPath",{"id":pid+"pb"},E("path",{"d":PEB})))
    defs+=led_defs(pid,led)
    cut=rr(c-88,c-88,fl+44-(c-88),176,84)
    inner=rr(10,10,W-20,H-20,R-10)
    if case: defs+=case_defs(pid,case,cut,inner+" "+cut)
    s="<defs>"+"".join(defs)+"</defs>"
    s+=E("rect",{"x":"18","y":"40","width":f(W),"height":f(H),"rx":f(R),"style":"fill: #0B1016; opacity: 0.3","filter":f"url(#{pid}sh)"})
    s+=buttons(W,g,"back",f"url(#{pid}fr)")
    s+=E("rect",{"x":"0","y":"0","width":f(W),"height":f(H),"rx":f(R),"style":f"fill: url(#{pid}fr)"})
    s+=E("rect",{"x":"2","y":"2","width":f(W-4),"height":f(H-4),"rx":f(R-2),"style":"fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2"})
    s+=E("rect",{"x":"8","y":"8","width":f(W-16),"height":f(H-16),"rx":f(R-8),"style":f"fill: url(#{pid}bk)"})
    s+=E("g",{"style":f"clip-path: url(#{pid}cb)"},E("rect",{"x":"8","y":"8","width":f(W-16),"height":f(H-16),"style":"fill: #808080","filter":f"url(#{pid}gr)"}))
    s+=E("rect",{"x":"8","y":"8","width":f(W-16),"height":f(H-16),"rx":f(R-8),"style":f"fill: url(#{pid}hl)"})
    s+=E("rect",{"x":"8","y":"8","width":f(W-16),"height":f(H-16),"rx":f(R-8),"style":"fill: none; stroke: #000000; stroke-opacity: 0.12; stroke-width: 2"})
    my=H*0.517
    s+=E("circle",{"cx":f(W/2),"cy":f(my),"r":"182","style":f"fill: none; stroke: {col['logo']}; stroke-opacity: 0.5; stroke-width: 3"})
    s+=E("rect",{"x":f(W/2-4),"y":f(my+192),"width":"8","height":"44","rx":"4","style":f"fill: {col['logo']}; opacity: 0.5"})
    lg=f"translate({f(W/2-60)} {f(my-64)}) scale(1.2)"
    s+=E("g",{"transform":lg},
        E("path",{"d":PEB,"transform":"translate(0 0.9)","style":"fill: #FFFFFF; opacity: 0.35"})+
        E("path",{"d":PEB,"style":f"fill: {col['logo']}"})+
        E("g",{"style":f"clip-path: url(#{pid}pb)"},
          E("path",{"d":V1,"style":f"fill: none; stroke: {col['backHi']}; stroke-width: 7; stroke-linecap: round"})+
          E("path",{"d":V2,"style":f"fill: none; stroke: {col['backHi']}; stroke-width: 2.2; stroke-linecap: round; opacity: 0.7"})))
    if case:
        s+=case_back(mk,case,pid,cut,inner)
    s+=lens(xs[0],c,68,pid,False)
    if m["cams"]==2: s+=lens(xs[1],c,64,pid,True)
    s+=E("circle",{"cx":f(mic),"cy":f(c),"r":"6","style":f"fill: {col['lo']}"})
    s+=led_svg(fl,c,pid,led)
    return s

def case_back(mk,k,pid,cut,inner):
    m=MODELS[mk]; W,H,R,g=geo(m)
    outer=rr(-22,-22,W+44,H+44,R+22)
    s=""
    s+=E("path",{"d":outer+" "+inner,"style":f"fill: url(#{pid}cr); fill-rule: evenodd"})
    s+=E("path",{"d":inner+" "+cut,"style":f"fill: {k['back']}; fill-rule: evenodd; opacity: 0.55"})
    s+=E("path",{"d":inner+" "+cut,"style":"fill: #FFFFFF; fill-rule: evenodd; opacity: 0.4"})
    s+=E("g",{"style":f"clip-path: url(#{pid}cm)"},E("rect",{"x":"10","y":"10","width":f(W-20),"height":f(H-20),"style":"fill: #808080","filter":f"url(#{pid}gr)"}))
    s+=E("path",{"d":inner+" "+cut,"style":f"fill: url(#{pid}ch); fill-rule: evenodd"})
    s+=E("circle",{"cx":f(W/2),"cy":f(H*0.517),"r":"182","style":"fill: none; stroke: #FFFFFF; stroke-opacity: 0.8; stroke-width: 6"})
    s+=E("circle",{"cx":f(W/2),"cy":f(H*0.517),"r":"168","style":"fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2"})
    s+=E("path",{"d":cut,"style":f"fill: none; stroke: {k['frame']}; stroke-width: 14"})
    s+=E("path",{"d":cut,"style":"fill: none; stroke: #000000; stroke-opacity: 0.18; stroke-width: 3"})
    s+=E("path",{"d":inner,"style":"fill: none; stroke: #000000; stroke-opacity: 0.12; stroke-width: 3"})
    s+=E("path",{"d":outer,"style":"fill: none; stroke: #000000; stroke-opacity: 0.2; stroke-width: 2"})
    for key,h in [("act",70),("v1",120),("v2",120)]:
        s+=E("rect",{"x":f(W+19),"y":f(g[key]-4),"width":"10","height":f(h+8),"rx":"5","style":f"fill: {k['lo']}"})
    for key,h in [("pw",180),("cc",110)]:
        s+=E("rect",{"x":"-29","y":f(g[key]-4),"width":"10","height":f(h+8),"rx":"5","style":f"fill: {k['lo']}"})
    return s

WALL=[(110,990,200,122,-18,"p3"),(480,1070,220,132,12,"p3"),(300,830,156,96,-6,"p1"),(520,770,92,60,20,"p1"),(80,730,72,44,-25,"p2"),(370,660,46,30,8,"p2")]
def front_svg(mk,col,pid,case=None):
    m=MODELS[mk]; W,H,R,g=geo(m)
    defs=common_defs(pid,col)
    defs.append(E("clipPath",{"id":pid+"sc"},E("rect",{"x":"16","y":"16","width":f(W-32),"height":f(H-32),"rx":f(R-16)})))
    defs.append(E("radialGradient",{"id":pid+"wb","cx":"0.3","cy":"0.25","r":"1"},stop("0","#223A4E")+stop("0.6","#111D28")+stop("1","#090F15")))
    for n,(a,b) in {"p1":("#7C9BAE","#2E4556"),"p2":("#C2D3DA","#5A7384"),"p3":("#3F5B70","#141F29")}.items():
        defs.append(E("radialGradient",{"id":pid+n,"cx":"0.35","cy":"0.28","r":"0.85"},stop("0",a)+stop("1",b)))
    defs.append(E("linearGradient",{"id":pid+"rf","x1":"0","y1":"0","x2":"1","y2":"1"},stop("0","#FFFFFF","0.16")+stop("0.5","#FFFFFF","0.03")+stop("1","#FFFFFF","0")))
    if case:
        defs.append(E("linearGradient",{"id":pid+"cr","x1":"0","y1":"0","x2":"1","y2":"0"},
          stop("0",case["lo"])+stop("0.04",case["frame"])+stop("0.1",case["hi"])+stop("0.2",case["frame"])+stop("0.8",case["frame"])+stop("0.9",case["hi"])+stop("0.96",case["frame"])+stop("1",case["lo"])))
    sx,sy=W/586,H/1238
    s="<defs>"+"".join(defs)+"</defs>"
    s+=E("rect",{"x":"18","y":"40","width":f(W),"height":f(H),"rx":f(R),"style":"fill: #0B1016; opacity: 0.3","filter":f"url(#{pid}sh)"})
    s+=buttons(W,g,"front",f"url(#{pid}fr)")
    s+=E("rect",{"x":"0","y":"0","width":f(W),"height":f(H),"rx":f(R),"style":f"fill: url(#{pid}fr)"})
    s+=E("rect",{"x":"2","y":"2","width":f(W-4),"height":f(H-4),"rx":f(R-2),"style":"fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2"})
    s+=E("rect",{"x":"9","y":"9","width":f(W-18),"height":f(H-18),"rx":f(R-9),"style":"fill: #04060A"})
    wall=E("rect",{"x":"16","y":"16","width":f(W-32),"height":f(H-32),"style":f"fill: url(#{pid}wb)"})
    peb="".join(E("ellipse",{"cx":f(x),"cy":f(y),"rx":f(rx),"ry":f(ry),"transform":f"rotate({a} {x} {y})","style":f"fill: url(#{pid}{gid})"}) for x,y,rx,ry,a,gid in WALL)
    wall+=E("g",{"transform":f"scale({f(sx)} {f(sy)})"},peb)
    wall+=E("text",{"x":f(W/2),"y":"204","style":"font-family: 'Instrument Sans', 'Segoe UI', sans-serif; font-size: 34px; font-weight: 500; fill: #C7D3DA; text-anchor: middle"},"Freitag, 25. September")
    wall+=E("text",{"x":f(W/2),"y":"356","style":"font-family: 'Unbounded', 'Arial Black', sans-serif; font-size: 150px; font-weight: 400; letter-spacing: -4px; fill: #F3F6F8; text-anchor: middle"},"07:32")
    for bx in (W*0.2,W*0.8):
        wall+=E("circle",{"cx":f(bx),"cy":f(H-140),"r":"50","style":"fill: #FFFFFF; opacity: 0.14"})
    wall+=E("rect",{"x":f(W*0.2-10),"y":f(H-168),"width":"20","height":"44","rx":"6","style":"fill: #E9EEF3"})
    wall+=E("rect",{"x":f(W*0.2-14),"y":f(H-170),"width":"28","height":"12","rx":"4","style":"fill: #E9EEF3"})
    wall+=E("rect",{"x":f(W*0.8-22),"y":f(H-156),"width":"44","height":"32","rx":"7","style":"fill: none; stroke: #E9EEF3; stroke-width: 4"})
    wall+=E("circle",{"cx":f(W*0.8),"cy":f(H-140),"r":"8","style":"fill: none; stroke: #E9EEF3; stroke-width: 4"})
    wall+=E("rect",{"x":f(W/2-90),"y":f(H-56),"width":"180","height":"10","rx":"5","style":"fill: #FFFFFF; opacity: 0.85"})
    wall+=E("path",{"d":f"M16 16H{f(W*0.78)}L16 {f(H*0.5)}Z","style":f"fill: url(#{pid}rf)"})
    s+=E("g",{"style":f"clip-path: url(#{pid}sc)"},wall)
    s+=E("rect",{"x":f(W/2-80),"y":"42","width":"160","height":"46","rx":"23","style":"fill: #000000"})
    s+=E("circle",{"cx":f(W/2+57),"cy":"65","r":"9","style":"fill: #0D1824"})
    s+=E("circle",{"cx":f(W/2+54),"cy":"62","r":"2.5","style":"fill: #FFFFFF; opacity: 0.45"})
    if case:
        outer=rr(-22,-22,W+44,H+44,R+22); inn=rr(8,8,W-16,H-16,R-8)
        s+=E("path",{"d":outer+" "+inn,"style":f"fill: url(#{pid}cr); fill-rule: evenodd"})
        s+=E("path",{"d":inn,"style":"fill: none; stroke: #FFFFFF; stroke-opacity: 0.35; stroke-width: 2"})
        s+=E("path",{"d":outer,"style":"fill: none; stroke: #000000; stroke-opacity: 0.2; stroke-width: 2"})
        for key,h in [("act",70),("v1",120),("v2",120)]:
            s+=E("rect",{"x":"-29","y":f(g[key]-4),"width":"10","height":f(h+8),"rx":"5","style":f"fill: {case['lo']}"})
        for key,h in [("pw",180),("cc",110)]:
            s+=E("rect",{"x":f(W+19),"y":f(g[key]-4),"width":"10","height":f(h+8),"rx":"5","style":f"fill: {case['lo']}"})
    return s

def place(mk,inner,cx,cy,a,sc):
    m=MODELS[mk]
    return E("g",{"transform":f"translate({f(cx)} {f(cy)}) rotate({f(a)}) scale({f(sc)}) translate({f(-m['W']/2)} {f(-m['H']/2)})"},inner)

def floor(cx,cy,rx,ry,fid,op="0.35"):
    return E("ellipse",{"cx":f(cx),"cy":f(cy),"rx":f(rx),"ry":f(ry),"style":f"fill: #0B1016; opacity: {op}","filter":f"url(#{fid})"})

FONTS='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600&amp;family=Instrument+Sans:wght@400;500;600&amp;display=swap">'
PALJS="const PAL="+json.dumps(PAL)+";"

def page(title,w,h,body,props,js,lang="de"):
    props["$preview"]={"width":w,"height":h}
    pj=json.dumps(props,ensure_ascii=False).replace("'","&#39;")
    return f"""<!doctype html>
<html lang="{lang}">
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
body{{margin:0;background:#EEF0F1}}
</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{pj}'>
{PALJS}
class Component extends DCLogic {{
renderVals() {{
{js}
}}
}}
</script>
</body>
</html>
"""
COLOPTS=list(PAL.keys())

