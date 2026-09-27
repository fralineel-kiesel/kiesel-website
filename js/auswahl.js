/* auswahl.js – Modell, Farbe, Hüllenfarbe und Speicher.
   setModel() ist die zentrale Stelle: Wechselt das Modell, muss fast jede
   Unterseite neu zeichnen. Diese Funktionen liegen in anderen Dateien und
   werden deshalb erst beim Aufruf über K.… geholt. */
(function(K){
"use strict";
const {$,$$,chf,S,COLORS,KM,STORE_LABEL,M,saveState}=K;

/* Farben */
function swatchHTML(attr,cur){
  return Object.keys(COLORS).map(k=>`<button class="sw" ${attr}="${k}" aria-pressed="${k===cur}"><i style="background:${COLORS[k].frame}"></i>${COLORS[k].name}</button>`).join("");
}
function renderSwatches(){
  $$("[data-swatches]").forEach(b=>b.innerHTML=swatchHTML("data-color",S.color));
  $$("[data-case-swatches]").forEach(b=>b.innerHTML=swatchHTML("data-case-color",S.caseColor));
  $$("[data-color]").forEach(b=>b.addEventListener("click",()=>setColor(b.getAttribute("data-color"))));
  $$("[data-case-color]").forEach(b=>b.addEventListener("click",()=>setCaseColor(b.getAttribute("data-case-color"))));
}
function setColor(k){
  S.color=k; const c=COLORS[k], r=document.documentElement.style;
  r.setProperty("--k-frame",c.frame); r.setProperty("--k-back",c.back); r.setProperty("--k-dark",c.dark); r.setProperty("--k-logo",c.logo);
  $$("[data-color]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-color")===k?"true":"false"));
  $$("[data-color-name]").forEach(e=>e.textContent=c.name);
  $$("[data-color-note]").forEach(e=>e.textContent=c.note);
  updateSummary(); saveState();
}
function setCaseColor(k){
  S.caseColor=k; const c=COLORS[k], r=document.documentElement.style;
  r.setProperty("--c-frame",c.frame); r.setProperty("--c-back",c.back); r.setProperty("--c-dark",c.dark);
  $$("[data-case-color]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-case-color")===k?"true":"false"));
  updateAcc(); saveState();
}

/* Modell */
function renderMSwitch(){
  $$("[data-mswitch]").forEach(box=>{
    box.innerHTML=`<button data-model="k1" aria-pressed="${S.model==="k1"}">Kiesel 1</button><button data-model="pro" aria-pressed="${S.model==="pro"}">Kiesel 1 Pro</button>`;
  });
  $$("[data-model]").forEach(b=>b.addEventListener("click",()=>setModel(b.getAttribute("data-model"))));
}
function setModel(k){
  if(!KM[k]) return;
  S.model=k;
  if(!KM[k].stores[S.store]) S.store="512";
  $$("[data-model]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-model")===k?"true":"false"));
  $$("[data-model-card]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-model-card")===k?"true":"false"));
  K.clearPart();
  K.render(["d-front","d-side","d-back","fx-led","fx-zen","acc-front","acc-side","acc-back","shop","shop-case"]);
  K.buildExplode(); K.onScroll(true);
  K.buildVs(); K.buildCmp();
  K.setupZoom();
  renderStore(); updateSummary(); updateAcc(); K.refreshMacro();
  saveState();
}

/* Zubehör */
function updateAcc(){
  const w=`Kiesel-Hülle für ${M().name}, ${COLORS[S.caseColor].name}`;
  if($("#accWhat")) $("#accWhat").textContent=w;
  if($("#upModel")) $("#upModel").textContent=M().name;
}

/* Kaufen */
function renderStore(){
  const st=M().stores;
  $("#storeGrp").innerHTML=Object.keys(st).map(k=>`<button data-store="${k}" aria-pressed="${k===S.store}"><b>${STORE_LABEL[k]}</b><span>${chf(st[k])}</span></button>`).join("");
  $$("[data-store]").forEach(b=>b.addEventListener("click",()=>{S.store=b.getAttribute("data-store");$$("[data-store]").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));updateSummary();saveState();}));
}
function updateSummary(){
  if(!$("#sumWhat")) return;
  $("#sumWhat").textContent=`${M().name}, ${COLORS[S.color].name}, ${STORE_LABEL[S.store]}${S.engrave?", Gravur":""}`;
  $("#sumTotal").textContent=chf(M().stores[S.store]);
}

Object.assign(K,{renderSwatches,setColor,setCaseColor,renderMSwitch,setModel,updateAcc,updateSummary});
})(window.Kiesel);
