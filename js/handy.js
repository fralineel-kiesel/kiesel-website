/* handy.js – zeichnet die Handys als SVG-Text.
   front/back/side geben einen <svg>-String zurück. Farben stehen als CSS-Variablen
   (var(--k-frame) …) drin, deshalb reicht zum Umfärben ein Wechsel der Variablen.
   render() füllt alle Platzhalter <div data-phone="…"> gemäss SLOTS. */
(function(K){
"use strict";
const {$,$$,esc,rr,S,KM,PARTS,M}=K;
let uid=0;

function hotWrap(hot,part,inner,glow){
  if(!hot) return inner;
  return `<g class="hot" data-part="${part}" tabindex="0" role="button" aria-label="${PARTS[part].t}">${inner}${glow}</g>`;
}
function btn(x,y,w,h,part,hot,fill){
  const r=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill||"var(--k-dark)"}"/>`;
  return hotWrap(hot,part,r,`<rect class="glow" x="${x-7}" y="${y-7}" width="${w+14}" height="${h+14}" rx="10"/><rect class="hit" x="${x-26}" y="${y-10}" width="${w+52}" height="${h+20}"/>`);
}
function geo(m){const s=m.H/1238;return {W:m.W,H:m.H,R:m.R,act:200*s,v1:310*s,v2:450*s,pw:330*s,cc:800*s};}
const VB=m=>`-44 -34 ${m.W+88} ${m.H+68}`;
const HF=m=>((m.H+68)/1306).toFixed(4);
function camRow(m){
  const c=m.R, xs=[c]; if(m.cams===2) xs.push(c+164);
  const last=xs[xs.length-1], lr=m.cams===2?64:68;
  return {c,xs,mic:last+lr+22,flash:last+lr+74};
}

function lockScreen(m,o){
  const W=m.W,H=m.H,sx=W/586,sy=H/1238;
  let h=`<rect x="14" y="14" width="${W-28}" height="${H-28}" fill="#15212B"/><g transform="scale(${sx} ${sy})">`+
  '<ellipse cx="110" cy="990" rx="200" ry="122" fill="#22323F" transform="rotate(-18 110 990)"/>'+
  '<ellipse cx="480" cy="1070" rx="220" ry="132" fill="#2B4050" transform="rotate(12 480 1070)"/>'+
  '<ellipse cx="300" cy="830" rx="156" ry="96" fill="#3A5567" transform="rotate(-6 300 830)"/>'+
  '<ellipse cx="520" cy="770" rx="92" ry="60" fill="#56768A" transform="rotate(20 520 770)"/>'+
  '<ellipse cx="80" cy="730" rx="72" ry="44" fill="#6F8FA0" transform="rotate(-25 80 730)"/>'+
  '<ellipse cx="370" cy="660" rx="46" ry="30" fill="#A9BFC8" transform="rotate(8 370 660)"/></g>'+
  `<text class="scr-date" x="${W/2}" y="196" text-anchor="middle">Freitag, 25. September</text>`+
  `<text class="scr-clock" x="${W/2}" y="350" text-anchor="middle">07:32</text>`;
  if(o&&o.notifs){
    h+=`<g class="zenpill"><rect x="${W/2-150}" y="400" width="300" height="60" rx="30" fill="#FFFFFF" fill-opacity=".16"/><text class="scr-pill" x="${W/2}" y="440" text-anchor="middle">Zen-Modus</text></g><g class="notifs">`+
    [0,1,2].map(i=>{const y=480+i*150,col=["#3FB6D3","#35D07F","#F2A33A"][i];
      return `<rect x="40" y="${y}" width="${W-80}" height="126" rx="36" fill="#FFFFFF" fill-opacity=".16"/><rect x="66" y="${y+31}" width="64" height="64" rx="16" fill="${col}"/><rect x="152" y="${y+38}" width="${W*0.38}" height="16" rx="8" fill="#E9EEF3" fill-opacity=".85"/><rect x="152" y="${y+72}" width="${W*0.52}" height="13" rx="6.5" fill="#E9EEF3" fill-opacity=".45"/>`;}).join("")+`</g>`;
  }
  const bx=[W*0.2,W*0.8],by=H-140;
  h+=`<circle cx="${bx[0]}" cy="${by}" r="50" fill="#FFFFFF" fill-opacity=".14"/><rect x="${bx[0]-10}" y="${by-28}" width="20" height="44" rx="6" fill="#E9EEF3"/><rect x="${bx[0]-14}" y="${by-30}" width="28" height="12" rx="4" fill="#E9EEF3"/>`+
     `<circle cx="${bx[1]}" cy="${by}" r="50" fill="#FFFFFF" fill-opacity=".14"/><rect x="${bx[1]-22}" y="${by-16}" width="44" height="32" rx="7" fill="none" stroke="#E9EEF3" stroke-width="4"/><circle cx="${bx[1]}" cy="${by}" r="8" fill="none" stroke="#E9EEF3" stroke-width="4"/>`+
     `<rect x="${W/2-90}" y="${H-54}" width="180" height="10" rx="5" fill="#FFFFFF" fill-opacity=".85"/>`;
  return h;
}
function simScreens(m){
  const sx=(m.W-28)/133, sy=(m.H-28)/289;
  return `<g class="sim" transform="translate(14 14) scale(${sx} ${sy}) translate(-28 -28)">`+
  '<g class="scr" data-s="lock"><rect x="28" y="28" width="133" height="289" fill="#15212B"/><text class="stxt" x="94.5" y="104" text-anchor="middle" style="font-size:34px">07:32</text><text class="stxt-s" x="94.5" y="118" text-anchor="middle">Freitag, 25. September</text><rect class="s2" x="42" y="244" width="105" height="30" rx="10"/><rect class="si" x="52" y="253" width="10" height="10" rx="3" opacity=".7"/><rect class="si" x="68" y="254" width="60" height="4" rx="2" opacity=".6"/><rect class="si" x="68" y="261" width="40" height="3" rx="1.5" opacity=".35"/><text class="stxt-s" x="94.5" y="300" text-anchor="middle">1 Hz</text></g>'+
  '<g class="scr" data-s="chat"><rect x="28" y="28" width="133" height="289" fill="#0B1117"/><rect class="s2" x="28" y="28" width="133" height="42"/><circle class="si" cx="48" cy="56" r="7" opacity=".6"/><rect class="si" x="60" y="53" width="44" height="5" rx="2.5" opacity=".7"/><rect class="s2" x="36" y="84" width="78" height="22" rx="10"/><rect class="sa" x="74" y="114" width="80" height="22" rx="10"/><rect class="s2" x="36" y="144" width="94" height="34" rx="10"/><rect class="sa" x="96" y="186" width="58" height="22" rx="10"/><rect class="s2" x="36" y="216" width="64" height="22" rx="10"/><rect class="s2" x="36" y="282" width="118" height="22" rx="11"/></g>'+
  '<g class="scr" data-s="scroll"><rect x="28" y="28" width="133" height="289" fill="#0B1117"/><g class="feed">'+
    [40,102,164,226,288,350].map((y,i)=>`<g><rect class="s2" x="36" y="${y}" width="117" height="54" rx="10"/><rect class="si" x="44" y="${y+40}" width="${[60,70,50,66,58,62][i]}" height="4" rx="2" opacity=".5"/></g>`).join("")+
  '</g></g>'+
  '<g class="scr" data-s="video"><rect x="28" y="28" width="133" height="289" fill="#05080B"/><rect class="s2" x="28" y="120" width="133" height="75"/><path d="M88 146 L104 157.5 L88 169 Z" class="si" opacity=".85"/><rect class="si" x="40" y="214" width="109" height="3" rx="1.5" opacity=".25"/><rect class="sa" x="40" y="214" width="46" height="3" rx="1.5"/><text class="stxt-s" x="94.5" y="240" text-anchor="middle">24 Hz, passend zum Film</text></g>'+
  '<g class="scr" data-s="download"><rect x="28" y="28" width="133" height="289" fill="#0B1117"/><rect class="sa" x="75" y="100" width="39" height="20" rx="10"/><text class="stxt" x="94.5" y="114" text-anchor="middle" style="font-size:10px;fill:#06222A">5G</text><text class="stxt" x="94.5" y="160" text-anchor="middle" style="font-size:13px">Update lädt</text><rect class="s2" x="42" y="178" width="105" height="8" rx="4"/><rect class="sa dl-bar" x="42" y="178" width="105" height="8" rx="4"/><text class="stxt-s" x="94.5" y="206" text-anchor="middle">Danach zurück auf 4G</text></g>'+
  '<g class="scr" data-s="photo"><rect x="28" y="28" width="133" height="289" fill="#05080B"/><rect x="28" y="60" width="133" height="190" fill="#24313F"/><path d="M28 60 L90 150 L118 120 L161 190 L161 250 L28 250 Z" fill="#2F4152"/><circle cx="130" cy="92" r="10" fill="#E9C77B" opacity=".7"/><line x1="72" y1="60" x2="72" y2="250" stroke="#E9EEF3" stroke-opacity=".18" stroke-width=".6"/><line x1="117" y1="60" x2="117" y2="250" stroke="#E9EEF3" stroke-opacity=".18" stroke-width=".6"/><line x1="28" y1="123" x2="161" y2="123" stroke="#E9EEF3" stroke-opacity=".18" stroke-width=".6"/><line x1="28" y1="187" x2="161" y2="187" stroke="#E9EEF3" stroke-opacity=".18" stroke-width=".6"/><rect class="s2" x="48" y="258" width="93" height="16" rx="8"/><text class="stxt" x="62" y="269" text-anchor="middle" style="font-size:7px">.5</text><text class="stxt" x="84" y="269" text-anchor="middle" style="font-size:7px;fill:#E9C77B">1x</text><text class="stxt" x="106" y="269" text-anchor="middle" style="font-size:7px">2</text><text class="stxt" x="127" y="269" text-anchor="middle" style="font-size:7px">5</text><circle cx="94.5" cy="294" r="12" fill="none" stroke="#E9EEF3" stroke-width="2"/><circle cx="94.5" cy="294" r="8.5" class="si"/></g>'+
  '</g>';
}

function caseFront(m){
  const {W,H,R}=m, g=geo(m);
  return `<path d="${rr(-22,-22,W+44,H+44,R+22)} ${rr(8,8,W-16,H-16,R-8)}" fill-rule="evenodd" fill="var(--c-frame)"/>`+
    `<path d="${rr(-22,-22,W+44,H+44,R+22)}" fill="none" stroke="var(--c-dark)" stroke-opacity=".5" stroke-width="2"/>`+
    [[-30,g.act,70],[-30,g.v1,120],[-30,g.v2,120],[W+22,g.pw,180],[W+22,g.cc,110]].map(b=>`<rect x="${b[0]}" y="${b[1]}" width="8" height="${b[2]}" rx="4" fill="var(--c-dark)"/>`).join("");
}
function caseBack(m){
  const {W,H,R}=m, g=geo(m), cr=camRow(m);
  const cut=rr(cr.c-86,cr.c-86,cr.flash+42-(cr.c-86),172,82);
  const inner=rr(10,10,W-20,H-20,R-10);
  return `<path d="${rr(-22,-22,W+44,H+44,R+22)} ${inner}" fill-rule="evenodd" fill="var(--c-frame)"/>`+
    `<path d="${inner} ${cut}" fill-rule="evenodd" fill="var(--c-back)" fill-opacity=".55"/>`+
    `<path d="${inner} ${cut}" fill-rule="evenodd" fill="#FFFFFF" fill-opacity=".36"/>`+
    `<path d="${cut}" fill="none" stroke="var(--c-frame)" stroke-width="12"/>`+
    `<circle cx="${W/2}" cy="${H*0.517}" r="182" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="5"/>`+
    `<path d="${rr(-22,-22,W+44,H+44,R+22)}" fill="none" stroke="var(--c-dark)" stroke-opacity=".5" stroke-width="2"/>`+
    [[W+22,g.act,70],[W+22,g.v1,120],[W+22,g.v2,120],[-30,g.pw,180],[-30,g.cc,110]].map(b=>`<rect x="${b[0]}" y="${b[1]}" width="8" height="${b[2]}" rx="4" fill="var(--c-dark)"/>`).join("");
}

function front(m,o){
  o=o||{}; const g=geo(m),W=g.W,H=g.H,R=g.R,id="scr"+(++uid),hot=!!o.hot;
  let h=`<svg class="ph" viewBox="${VB(m)}" style="height:calc(var(--ph-h,460px) * ${HF(m)})" role="img" aria-label="${m.name}, Vorderseite">`+
  `<defs><clipPath id="${id}"><rect x="14" y="14" width="${W-28}" height="${H-28}" rx="${R-14}"/></clipPath></defs>`+
  btn(-12,g.act,12,70,"action",hot)+btn(-12,g.v1,12,120,"volume",hot)+btn(-12,g.v2,12,120,"volume",hot)+
  btn(W,g.pw,12,180,"power",hot)+btn(W,g.cc,12,110,"camerabtn",hot)+
  `<rect width="${W}" height="${H}" rx="${R}" fill="var(--k-frame)"/>`+
  `<rect x="5" y="5" width="${W-10}" height="${H-10}" rx="${R-5}" fill="none" stroke="var(--k-dark)" stroke-opacity=".4" stroke-width="2"/>`+
  `<rect x="14" y="14" width="${W-28}" height="${H-28}" rx="${R-14}" fill="#070B0F"/>`+
  `<g clip-path="url(#${id})">${o.sim?simScreens(m):lockScreen(m,o)}</g>`+
  hotWrap(hot,"faceid",`<rect x="${W/2-80}" y="40" width="160" height="46" rx="23" fill="#000"/><circle cx="${W/2+57}" cy="63" r="9" fill="#16222D"/>`,`<rect class="glow" x="${W/2-89}" y="31" width="178" height="64" rx="32"/>`)+
  hotWrap(hot,"usbc",`<rect x="${W/2-45}" y="${H-5}" width="90" height="15" rx="7.5" fill="#0B0E12"/>`,`<rect class="glow" x="${W/2-53}" y="${H-12}" width="106" height="29" rx="14"/><rect class="hit" x="${W/2-63}" y="${H-23}" width="126" height="40"/>`)+
  (o.case?caseFront(m):"")+
  `</svg>`;
  return h;
}
function lens(cx,cy,r,tele){
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--k-dark)"/>`+
  `<circle cx="${cx}" cy="${cy}" r="${r-7}" fill="none" stroke="var(--k-frame)" stroke-opacity=".55" stroke-width="3"/>`+
  `<circle cx="${cx}" cy="${cy}" r="${r-12}" fill="#0A0E13"/>`+
  `<circle cx="${cx}" cy="${cy}" r="${r*0.58}" fill="#101A24" stroke="#2A3540" stroke-width="4"/>`+
  `<circle cx="${cx}" cy="${cy}" r="${r*(tele?0.25:0.31)}" fill="${tele?"#2B2248":"#1B3550"}"/>`+
  `<circle cx="${cx}" cy="${cy}" r="${r*0.12}" fill="#0B1520"/>`+
  `<circle cx="${cx-r*0.2}" cy="${cy-r*0.2}" r="${r*0.1}" fill="#FFFFFF" fill-opacity=".45"/>`;
}
function led(cx,cy){
  return `<g class="led"><circle class="lg2" cx="${cx}" cy="${cy}" r="96"/><circle class="lg1" cx="${cx}" cy="${cy}" r="58"/><circle cx="${cx}" cy="${cy}" r="25" fill="var(--k-dark)"/><circle class="lcore" cx="${cx}" cy="${cy}" r="19"/><circle cx="${cx-5}" cy="${cy-5}" r="7" fill="#FFFFFF" fill-opacity=".4"/></g>`;
}
function back(m,o){
  o=o||{}; const g=geo(m),W=g.W,H=g.H,R=g.R,hot=!!o.hot,cr=camRow(m);
  let cams=hotWrap(hot,"camera",lens(cr.xs[0],cr.c,68,false),`<circle class="glow" cx="${cr.xs[0]}" cy="${cr.c}" r="78"/>`);
  if(m.cams===2) cams+=hotWrap(hot,"tele",lens(cr.xs[1],cr.c,64,true),`<circle class="glow" cx="${cr.xs[1]}" cy="${cr.c}" r="74"/>`);
  return `<svg class="ph" viewBox="${VB(m)}" style="height:calc(var(--ph-h,460px) * ${HF(m)})" role="img" aria-label="${m.name}, Rückseite">`+
  btn(-12,g.pw,12,180,"power",false)+btn(-12,g.cc,12,110,"camerabtn",false)+
  btn(W,g.act,12,70,"action",false)+btn(W,g.v1,12,120,"volume",false)+btn(W,g.v2,12,120,"volume",false)+
  `<rect width="${W}" height="${H}" rx="${R}" fill="var(--k-frame)"/>`+
  `<rect x="8" y="8" width="${W-16}" height="${H-16}" rx="${R-8}" fill="var(--k-back)"/>`+
  hotWrap(hot,"magsafe",`<circle cx="${W/2}" cy="${H*0.517}" r="182" fill="none" stroke="var(--k-logo)" stroke-opacity=".45" stroke-width="3"/><rect x="${W/2-4}" y="${H*0.517+190}" width="8" height="46" rx="4" fill="var(--k-logo)" fill-opacity=".45"/>`,`<circle class="glow" cx="${W/2}" cy="${H*0.517}" r="194"/>`)+
  `<use href="#pebble" x="${W/2-60}" y="${H*0.517-60}" width="120" height="120" style="--pb:var(--k-logo);--pv:var(--k-back)"/>`+
  `<text class="engr" x="${W/2}" y="${H*0.816}" text-anchor="middle">${esc(S.engrave)}</text>`+
  (o.case?"":cams)+
  `<circle cx="${cr.mic}" cy="${cr.c}" r="6" fill="var(--k-dark)"/>`+
  hotWrap(hot,"flash",led(cr.flash,cr.c),`<circle class="glow" cx="${cr.flash}" cy="${cr.c}" r="34"/>`)+
  (o.case?caseBack(m)+cams:"")+
  `</svg>`;
}
function side(m,o){
  o=o||{}; const g=geo(m),H=g.H,hot=!!o.hot, bump=m.cams===2?20:16;
  let h=`<svg class="ph" viewBox="-40 -34 180 ${H+68}" style="height:calc(var(--ph-h,460px) * ${HF(m)})" role="img" aria-label="${m.name}, Seitenansicht, 9 mm dick">`+
  `<rect x="0" y="0" width="90" height="${H}" rx="40" fill="var(--k-frame)"/>`+
  `<rect x="0" y="150" width="90" height="8" fill="var(--k-dark)" opacity=".45"/><rect x="0" y="${H-158}" width="90" height="8" fill="var(--k-dark)" opacity=".45"/>`+
  hotWrap(hot,"camera",`<rect x="88" y="28" width="${bump}" height="136" rx="7" fill="var(--k-dark)"/>`,`<rect class="glow" x="81" y="21" width="${bump+14}" height="150" rx="12"/>`)+
  hotWrap(hot,"power",`<rect x="22" y="${g.pw}" width="46" height="180" rx="20" fill="var(--k-dark)"/>`,`<rect class="glow" x="15" y="${g.pw-7}" width="60" height="194" rx="26"/>`)+
  hotWrap(hot,"camerabtn",`<rect x="22" y="${g.cc}" width="46" height="110" rx="18" fill="var(--k-dark)"/><rect x="32" y="${g.cc+20}" width="26" height="70" rx="10" fill="#1A2530" opacity=".85"/>`,`<rect class="glow" x="15" y="${g.cc-7}" width="60" height="124" rx="24"/>`);
  if(o.case){
    h+=`<rect x="-14" y="-22" width="${90+14+16}" height="${H+44}" rx="50" fill="var(--c-frame)"/>`+
       `<rect x="-14" y="-22" width="${90+14+16}" height="${H+44}" rx="50" fill="none" stroke="var(--c-dark)" stroke-opacity=".5" stroke-width="2"/>`+
       `<rect x="${90+16}" y="10" width="${bump+2}" height="172" rx="6" fill="var(--c-frame)"/>`+
       `<rect x="${90+16}" y="10" width="${bump+2}" height="172" rx="6" fill="none" stroke="var(--c-dark)" stroke-opacity=".5" stroke-width="2"/>`+
       `<rect x="22" y="${g.pw}" width="46" height="180" rx="20" fill="var(--c-dark)" opacity=".75"/>`+
       `<rect x="22" y="${g.cc}" width="46" height="110" rx="18" fill="#1A2530" opacity=".55"/>`;
  }
  return h+`</svg>`;
}

/* Slots: welcher Platzhalter bekommt welche Zeichnung */
const SLOTS={
  "pick-k1":()=>front(KM.k1),
  "pick-pro":()=>front(KM.pro),
  "sim":()=>front(KM.k1,{sim:true}),
  "d-front":()=>front(M(),{hot:true}),
  "d-side":()=>side(M(),{hot:true}),
  "d-back":()=>back(M(),{hot:true}),
  "fx-led":()=>back(M()),
  "fx-zen":()=>front(M(),{notifs:true}),
  "acc-front":()=>front(M(),{case:S.caseOn}),
  "acc-side":()=>side(M(),{case:S.caseOn}),
  "acc-back":()=>back(M(),{case:S.caseOn}),
  "shop":()=>S.flip==="back"?back(M()):front(M()),
  "shop-case":()=>back(M(),{case:true})
};
function render(filter){
  $$("[data-phone]").forEach(el=>{
    const k=el.getAttribute("data-phone");
    if(filter&&!filter.includes(k)) return;
    el.innerHTML=SLOTS[k]();
  });
  bindHot();
  K.refreshScen();   // Simulator-Bildschirm wieder einblenden (startseite.js)
  if(activePart) $$(".hot").forEach(g=>g.classList.toggle("on",g.getAttribute("data-part")===activePart));
}

/* Hotspots: anklickbare Bauteile auf der Design-Seite */
let activePart=null;
function bindHot(){
  $$(".hot").forEach(g=>{
    if(g.dataset.bound) return; g.dataset.bound="1";
    const fire=()=>setPart(g.getAttribute("data-part"));
    g.addEventListener("click",fire);
    g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fire();}});
  });
}
function resetDetail(){
  const d=$("#dDetail"); d.innerHTML="<h3>Tipp auf ein Bauteil</h3><p>Die Kameras, den Blitz, die Tasten oder den MagSafe-Ring anklicken.</p>";
}
function setPart(p){
  activePart=(activePart===p)?null:p;
  $$(".hot").forEach(g=>g.classList.toggle("on",g.getAttribute("data-part")===activePart));
  const d=$("#dDetail");
  if(activePart){d.innerHTML="<h3></h3><p></p>";$("h3",d).textContent=PARTS[activePart].t;$("p",d).textContent=PARTS[activePart].d;}
  else resetDetail();
}
function clearPart(){activePart=null; resetDetail();}

Object.assign(K,{front,back,side,render,clearPart});
})(window.Kiesel);
