/* kern.js – lädt als erstes Skript.
   Legt den gemeinsamen Namensraum window.Kiesel an. Alle anderen Dateien
   holen sich daraus, was sie brauchen, und hängen ihre eigenen Funktionen an. */
(function(){
"use strict";
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const chf=n=>"CHF "+n.toLocaleString("de-CH")+".–";
function rr(x,y,w,h,r){return `M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 1 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`;}

/* Aktuelle Auswahl. Wird nur verändert, nie ersetzt – so teilen alle Dateien dieselbe Referenz. */
const S={model:"k1",color:"himmel",caseColor:"weiss",store:"512",engrave:"",flip:"back",caseOn:true};

const SKEY="kiesel-state-v2";
function saveState(){try{localStorage.setItem(SKEY,JSON.stringify({model:S.model,color:S.color,caseColor:S.caseColor,store:S.store}));}catch(e){}}
function loadState(){
  const {KM,COLORS}=window.Kiesel; // erst beim Aufruf holen: daten.js lädt nach dieser Datei
  try{const s=JSON.parse(localStorage.getItem(SKEY)||"null"); if(s){ if(KM[s.model]) S.model=s.model; if(COLORS[s.color]) S.color=s.color; if(COLORS[s.caseColor]) S.caseColor=s.caseColor; if(KM[S.model].stores[s.store]) S.store=s.store; }}catch(e){}
}

window.Kiesel={$,$$,reduce,esc,chf,rr,S,saveState,loadState};
})();
