/* router.js – zeigt je nach #/hash genau eine der <div class="view">.
   Hash-Änderungen laden die Seite nicht neu; der Browser feuert nur "hashchange".
   Darum funktioniert das auch ohne Server, direkt per Doppelklick. */
(function(K){
"use strict";
const {$,$$,TITLES}=K;

const views=$$(".view");
function route(){
  let k=(location.hash||"").replace(/^#\/?/,"")||"uebersicht";
  if(!views.some(v=>v.getAttribute("data-view")===k)) k="uebersicht";
  views.forEach(v=>v.hidden=v.getAttribute("data-view")!==k);
  $$(".links a, .buy").forEach(a=>{ if(a.getAttribute("href")==="#/"+k) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  const cur=$('.links a[aria-current="page"]'); if(cur) cur.scrollIntoView({block:"nearest",inline:"center"});
  const dl=$("#orderDlg"); if(dl.open) dl.close();
  K.closeCart(true);
  window.scrollTo(0,0);
  document.title=(k==="uebersicht"?"":TITLES[k]+" – ")+"Kiesel";
  if(k==="technik") K.onScroll(true);
}
window.addEventListener("hashchange",route);

Object.assign(K,{route});
})(window.Kiesel);
