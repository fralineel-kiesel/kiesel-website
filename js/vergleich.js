/* vergleich.js – Umrisse im echten Massstab (1 mm = SC SVG-Einheiten) plus Balken. */
(function(K){
"use strict";
const {$,$$,S,CM}=K;

const CMP={vs:"se",mode:"side",card:false}, SC=2.6, BASE=452;
function outline(m){
  const s=SC,W=m.w*s,H=m.h*s,R=m.r*s; let inner="";
  if(m.type==="home"){
    inner=`<rect x="${4.2*s}" y="${17*s}" width="${W-8.4*s}" height="${H-34*s}" rx="${s}" class="o-scr"/><circle cx="${W/2}" cy="${H-8.6*s}" r="${5.4*s}" class="o-det" fill-opacity=".5"/><rect x="${W/2-5*s}" y="${7.6*s}" width="${10*s}" height="${1.3*s}" rx="${.65*s}" class="o-det"/>`;
  }else{
    const i=(m.type==="kiesel"?1.4:1.9)*s;
    inner=`<rect x="${i}" y="${i}" width="${W-2*i}" height="${H-2*i}" rx="${R-i}" class="o-scr"/>`;
    if(m.type==="notch") inner+=`<rect x="${W/2-13*s}" y="${i}" width="${26*s}" height="${5*s}" rx="${2*s}" class="o-det"/>`;
    else { const iw=(m.type==="kiesel"?16:20)*s; inner+=`<rect x="${W/2-iw/2}" y="${i+2*s}" width="${iw}" height="${4.4*s}" rx="${2.2*s}" class="o-det"/>`; }
  }
  return `<rect width="${W}" height="${H}" rx="${R}" class="o-body"/>`+inner;
}
function buildVs(){
  const opts=["k1","pro","se","mini","p18"].filter(k=>k!==S.model);
  if(!opts.includes(CMP.vs)) CMP.vs="se";
  const g=$("#vsGrp");
  g.innerHTML="<span>gegen</span>"+opts.map(k=>`<button class="chip-btn" data-vs="${k}" aria-pressed="${k===CMP.vs}">${CM[k].name}</button>`).join("");
  $$("[data-vs]",g).forEach(b=>b.addEventListener("click",()=>{CMP.vs=b.getAttribute("data-vs");$$("[data-vs]",g).forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));buildCmp();}));
}
function buildCmp(){
  const svg=$("#cmpSvg"), k=CM[S.model], o=CM[CMP.vs];
  const kW=k.w*SC,kH=k.h*SC,oW=o.w*SC,oH=o.h*SC, over=CMP.mode==="over";
  const kx=over?320-kW/2:320-24-kW, ox=over?320-oW/2:320+24;
  const oIsK=o.type==="kiesel";
  const cW=53.98*SC,cH=85.6*SC,cx=kx+kW/2-cW/2,cy=BASE-cH;
  const lab=(m,W,H)=>`<text class="o-lab" x="${W/2}" y="${H+24}" text-anchor="middle" style="opacity:${over?0:1}">${m.name}</text><text class="o-lab2" x="${W/2}" y="${H+42}" text-anchor="middle" style="opacity:${over?0:1}">${m.h} × ${m.w} mm</text>`;
  svg.innerHTML=`<line x1="20" y1="${BASE}" x2="620" y2="${BASE}" stroke="var(--line)" stroke-width="1"/>`+
    `<g class="ph-g ${over?"ghost":(oIsK?"kz":"")}" style="transform:translate(${ox}px,${BASE-oH}px)">${outline(o)}${lab(o,oW,oH)}</g>`+
    `<g class="ph-g kz" style="transform:translate(${kx}px,${BASE-kH}px)">${outline(k)}${lab(k,kW,kH)}</g>`+
    `<g style="opacity:${CMP.card?1:0};transition:opacity .3s"><rect class="card-ref" x="${cx}" y="${cy}" width="${cW}" height="${cH}" rx="${3.2*SC}"/><text class="card-lab" x="${cx+cW/2}" y="${cy-8}" text-anchor="middle">Kreditkarte</text></g>`+
    (over?`<text class="o-lab2" x="20" y="30">Gefüllt: ${k.name}, gestrichelt: ${o.name}</text>`:"");
  const rows=[["Höhe","h"," mm"],["Breite","w"," mm"],["Dicke","d"," mm"],["Gewicht","g"," g"],["Akku","bat"," mAh"],["Display","disp","″"]];
  const fmt=(m,key)=>{const v=m[key]; if(key==="bat") return (m.est?"ca. ":"")+v.toLocaleString("de-CH"); if(key==="g"&&m.est) return "ca. "+v; return v;};
  let h=`<div class="shead"><span></span><span>${k.name}</span><span>${o.name}</span></div>`;
  rows.forEach(r=>{const a=k[r[1]],b=o[r[1]],mx=Math.max(a,b);
    h+=`<div class="srow"><span class="sl">${r[0]}</span><div class="sval k">${fmt(k,r[1])}${r[2]}<div class="bar"><i style="width:${a/mx*100}%"></i></div></div><div class="sval">${fmt(o,r[1])}${r[2]}<div class="bar"><i style="width:${b/mx*100}%"></i></div></div></div>`;});
  $("#stats").innerHTML=h;
}

Object.assign(K,{CMP,buildVs,buildCmp});
})(window.Kiesel);
