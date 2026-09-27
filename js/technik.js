/* technik.js – Explosionszeichnung. Scrollen (oder der Regler) zieht die
   Schichten auseinander; ein Klick auf eine Schicht zeigt ihre Beschreibung. */
(function(K){
"use strict";
const {$,$$,M}=K;

function layersFor(m){
  const L=[{k:"display",t:"Display",d:m.id==="pro"?"5.4″ OLED mit LTPO von 1 bis 90 Hz. Oben die Dynamic Island mit Face ID.":"4.7″ OLED mit LTPO von 1 bis 90 Hz. Oben die Dynamic Island mit Face ID."},
    {k:"frame",t:"Titanrahmen",d:"Trägt Tasten und Antennen. Matt gestrahlt, in fünf Farben."},
    {k:"board",t:"Platine",d:"Abgespeckter A20 Pro mit 1 Super- und 3 Effizienz-Kernen, max. 4 GHz, dazu ein Modem, das meistens auf 4G bleibt. Die Schalter für den Privacy-Modus sitzen hier."}];
  if(m.id==="pro") L.push({k:"vc",t:"Mini-Vapor-Chamber",d:"Etwa 3 × 4 cm gross. Verteilt die Wärme vom Chip gleichmässig auf die Rückseite, damit keine heisse Stelle entsteht."});
  L.push({k:"akku",t:"Akku",d:m.id==="pro"?"Silizium-Kohlenstoff-Zelle mit ca. 3600 mAh.":"Silizium-Kohlenstoff-Zelle mit ca. 3000 mAh."},
    {k:"coil",t:"MagSafe-Spule",d:"Ladespule und Magnetring für MagSafe und Qi."},
    {k:"back",t:"Rückseite",d:"Matt und gleichzeitig Kühlfläche. Kameras in der Ecke, Mikrofon und RGB-Blitz daneben."});
  return L;
}
function layerShape(k,m){
  const hw=m.W/10, hh=m.H/10;
  const R=`x="${-hw}" y="${-hh}" width="${2*hw}" height="${2*hh}" rx="${m.R/5}"`;
  const glow=`<rect class="xl-glow" ${R}/>`, ghost=`<rect ${R} fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 3"/>`;
  const cy=-hh+19.2, mx=hw-19.2, tx=mx-32.8, fx=m.cams===2?mx-60.4:mx-28;
  switch(k){
    case "display": return `<rect ${R} fill="#0A0F14" stroke="#2A3540" stroke-width="1.5"/><rect x="${-hw+3.5}" y="${-hh+3.5}" width="${2*hw-7}" height="${2*hh-7}" rx="${m.R/5-3}" fill="#15212B"/><ellipse cx="-20" cy="${hh*0.65}" rx="40" ry="24" fill="#2B4050"/><ellipse cx="22" cy="${hh*0.32}" rx="26" ry="16" fill="#3A5567"/><rect x="-16" y="${-hh+9}" width="32" height="9" rx="4.5" fill="#000"/>`+glow;
    case "frame": return `<rect ${R} fill="none" stroke="var(--k-frame)" stroke-width="6"/><rect x="${-hw-4}" y="${-hh*0.64}" width="3" height="16" fill="var(--k-dark)"/><rect x="${-hw-4}" y="${-hh*0.46}" width="3" height="24" fill="var(--k-dark)"/>`+glow;
    case "board": return ghost+`<rect x="${-hw+6}" y="${-hh+6}" width="${2*hw-12}" height="82" rx="10" fill="#1D2A34" stroke="#34444F"/><rect x="-26" y="${-hh+44}" width="30" height="30" rx="4" fill="var(--accent)"/><rect x="${-hw+14}" y="${-hh+48}" width="18" height="18" rx="3" fill="#5F7888"/><rect x="${-hw+14}" y="${-hh+14}" width="24" height="10" rx="3" fill="#FF9A2E" opacity=".85"/><circle cx="${mx}" cy="${cy}" r="12" fill="#0B1117" stroke="#3A4854" stroke-width="2"/>`+(m.cams===2?`<circle cx="${tx}" cy="${cy}" r="11" fill="#0B1117" stroke="#3A4854" stroke-width="2"/>`:"")+glow;
    case "vc": return ghost+`<rect x="-34" y="${-hh+34}" width="46" height="60" rx="8" fill="#CF8E5F" opacity=".92"/><rect x="-28" y="${-hh+42}" width="34" height="3" rx="1.5" fill="#F1C39E"/><rect x="-28" y="${-hh+52}" width="34" height="3" rx="1.5" fill="#F1C39E"/><rect x="-28" y="${-hh+62}" width="34" height="3" rx="1.5" fill="#F1C39E"/><rect x="-28" y="${-hh+72}" width="34" height="3" rx="1.5" fill="#F1C39E"/>`+glow;
    case "akku": return ghost+`<rect x="${-hw+6}" y="${-hh+100}" width="${2*hw-12}" height="${2*hh-106}" rx="10" fill="#3B4C5A" stroke="#4E6272"/><rect x="${-hw+18}" y="${-hh+112}" width="${2*hw-36}" height="6" rx="3" fill="var(--accent)" opacity=".75"/>`+glow;
    case "coil": return ghost+`<circle cx="0" cy="${hh*0.29}" r="48" fill="none" stroke="var(--k-dark)" stroke-width="3" stroke-dasharray="5 4"/><circle cx="0" cy="${hh*0.29}" r="38" fill="none" stroke="#C98A5B" stroke-width="7"/><circle cx="0" cy="${hh*0.29}" r="26" fill="none" stroke="#C98A5B" stroke-width="4"/>`+glow;
    default: return `<rect ${R} fill="var(--k-back)" stroke="var(--k-frame)" stroke-width="4"/><circle cx="${mx}" cy="${cy}" r="13.6" fill="var(--k-dark)"/><circle cx="${mx}" cy="${cy}" r="8" fill="#0A0E13"/>`+(m.cams===2?`<circle cx="${tx}" cy="${cy}" r="12.8" fill="var(--k-dark)"/><circle cx="${tx}" cy="${cy}" r="7.5" fill="#0A0E13"/>`:"")+`<circle cx="${fx}" cy="${cy}" r="5" fill="#F3EEDF"/>`+glow;
  }
}
let XL=[], selLayer=null, manual=false;
function buildExplode(){
  const m=M(), svg=$("#xpSvg"); XL=layersFor(m); selLayer=null;
  let h="";
  for(let i=XL.length-1;i>=0;i--) h+=`<g class="xl" data-i="${i}" tabindex="0" role="button" aria-label="${XL[i].t}"><g class="xl-pos"><g transform="scale(1 .52) rotate(-38)">${layerShape(XL[i].k,m)}</g></g></g>`;
  XL.forEach((l,j)=>{h+=`<g class="xp-lab" data-i="${j}" style="cursor:pointer"><line/><text x="472">${l.t}</text></g>`;});
  svg.innerHTML=h;
  svg.setAttribute("aria-label","Explosionszeichnung des "+m.name+" mit "+XL.length+" Schichten");
  $$(".xl",svg).forEach(g=>{
    const f=()=>selectLayer(+g.getAttribute("data-i"));
    g.addEventListener("click",f);
    g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}});
  });
  $$(".xp-lab",svg).forEach(g=>g.addEventListener("click",()=>selectLayer(+g.getAttribute("data-i"))));
  selectLayer(null);
}
function selectLayer(i){
  selLayer=(i===null||selLayer===i)?null:i;
  $$(".xl").forEach(g=>g.classList.toggle("on",+g.getAttribute("data-i")===selLayer));
  if(selLayer===null){ $("#xpTitle").textContent=XL.length+" Schichten"; $("#xpText").textContent=XL.map(l=>l.t).join(", ")+". Tipp auf eine Schicht für Details."; }
  else { $("#xpTitle").textContent=XL[selLayer].t; $("#xpText").textContent=XL[selLayer].d; }
}
function setExplode(p){
  const n=XL.length, gmax=n===7?66:78, gap=14+p*gmax, cx=250, base=n===7?96:108;
  $$(".xl").forEach(g=>{const i=+g.getAttribute("data-i"); $(".xl-pos",g).setAttribute("transform",`translate(${cx} ${base+i*gap})`);});
  $$(".xp-lab").forEach(g=>{
    const i=+g.getAttribute("data-i"), y=base+i*gap+(n===7?36:32), ln=$("line",g);
    ln.setAttribute("x1",cx+136); ln.setAttribute("y1",y); ln.setAttribute("x2",464); ln.setAttribute("y2",y);
    $("text",g).setAttribute("y",y+5);
    g.style.opacity=p>0.45?Math.min(1,(p-0.45)/0.25):0;
  });
}
/* Regler von Hand bewegt: Scrollen übernimmt erst wieder beim nächsten Scroll */
function setExplodeManual(p){ manual=true; setExplode(p); }
function onScroll(force){
  const t=$("#xpTrack"); if(!t||t.offsetParent===null) return;
  if(force===true) manual=false;
  const r=t.getBoundingClientRect(), total=t.offsetHeight-window.innerHeight;
  const p=Math.max(0,Math.min(1,(-r.top+40)/(total*0.75)));
  if(!manual){ setExplode(p); $("#xpRange").value=Math.round(p*100); }
}
window.addEventListener("scroll",()=>{manual=false;onScroll();},{passive:true});
window.addEventListener("resize",()=>onScroll());

Object.assign(K,{buildExplode,setExplodeManual,onScroll});
})(window.Kiesel);
