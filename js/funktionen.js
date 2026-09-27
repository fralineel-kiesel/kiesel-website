/* funktionen.js – die vier Demos der Funktionen-Seite:
   RGB-LED, Zen-Modus, Privacy-Schema, Makro-Blume. */
(function(K){
"use strict";
const {$,$$,S,LEDTXT,PV}=K;

/* RGB */
function setLed(k){
  const st=$("#ledStage"); if(k==="off") st.removeAttribute("data-led"); else st.setAttribute("data-led",k);
  $$("[data-led-btn]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-led-btn")===k?"true":"false"));
  $("#ledDesc").textContent=LEDTXT[k];
}

/* Zen */
function setZen(on){
  $("#zenBtn").setAttribute("aria-pressed",on?"true":"false");
  $("#zenLbl").textContent=on?"Zen-Modus ausschalten":"Zen-Modus einschalten";
  $("#zenStage").classList.toggle("zen-on",on);
}

/* Privacy */
function buildPriv(){
  $("#pvRows").innerHTML=PV.map((p,i)=>`
    <rect class="pv-box" x="20" y="${p.y-34}" width="150" height="68" rx="14"/>
    <text class="pv-t" x="95" y="${p.y-4}" text-anchor="middle">${p.t}</text>
    <text class="pv-s" x="95" y="${p.y+17}" text-anchor="middle" data-pvs="${i}">verbunden</text>
    <path class="pv-wire" d="M170 ${p.y} H222"/>
    <circle class="pv-term" cx="228" cy="${p.y}" r="6"/>
    <line class="pv-lever" data-lever x1="228" y1="${p.y}" x2="282" y2="${p.y}" style="transform-origin:228px ${p.y}px"/>
    <circle class="pv-term" cx="288" cy="${p.y}" r="6"/>
    <path class="pv-wire" data-live d="M294 ${p.y} H340 C380 ${p.y} 390 190 440 190"/>`).join("");
}
function setPriv(on){
  $("#privBtn").setAttribute("aria-pressed",on?"true":"false");
  $("#privLbl").textContent=on?"Privacy-Modus ausschalten":"Privacy-Modus einschalten";
  $$("[data-lever]").forEach(l=>l.style.transform=on?"rotate(-32deg)":"none");
  $$("[data-live]").forEach(w=>w.classList.toggle("dead",on));
  $$("[data-pvs]").forEach(t=>{t.textContent=on?"getrennt":"verbunden";t.classList.toggle("cut",on);});
  $("#pvMain").textContent=on?"läuft weiter":"alles verbunden";
  $("#pvInd").setAttribute("fill",on?"#FF9A2E":"var(--line)");
}

/* Makro */
let macroMode="main";
function setMacro(k){
  if(k==="tele"&&S.model!=="pro") k="main";
  macroMode=k;
  const f=$("#flower"), bg=$("#mBg");
  const cfg={main:{f:"translate(0px,90px) scale(.55)",b:"none",bs:"scale(1)",l:"Hauptkamera 1x"},
             macro:{f:"translate(0px,30px) scale(1.9)",b:"blur(3px)",bs:"scale(1.05)",l:"Makro, ca. 3 cm Abstand"},
             tele:{f:"translate(0px,40px) scale(1.25)",b:"blur(11px)",bs:"scale(1.9)",l:"3x Tele, ca. 25 cm Abstand"}}[k];
  f.style.transform=cfg.f; bg.style.filter=cfg.b; bg.style.transform=cfg.bs;
  $("#macroLbl").textContent=cfg.l;
  $$("[data-macro]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-macro")===k?"true":"false"));
  const tb=$('[data-macro="tele"]'); tb.disabled=S.model!=="pro";
  $("#macroNote").textContent=S.model==="pro"
    ?"Beim Makro bleibt der Hintergrund erkennbar. Mit der Tele wird er weich und rückt scheinbar näher, weil lange Brennweiten die Perspektive stauchen."
    :"Der 3x-Tele-Nahfokus gibt es nur beim Kiesel 1 Pro. Stell oben auf den Pro um, um ihn auszuprobieren.";
}
/* Nach einem Modellwechsel: aktuellen Modus neu anwenden (Tele gibt es nur beim Pro) */
function refreshMacro(){ setMacro(macroMode); }

Object.assign(K,{setLed,setZen,buildPriv,setPriv,setMacro,refreshMacro});
})(window.Kiesel);
