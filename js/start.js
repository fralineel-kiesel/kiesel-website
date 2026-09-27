/* start.js – lädt als letztes Skript. Jetzt existieren alle Funktionen,
   also werden hier Zustand geladen, Event-Handler verbunden und alles
   einmal gezeichnet. */
(function(K){
"use strict";
const {$,$$,S,M,ENGR_OK}=K;

function init(){
  K.loadState(); K.loadCart();
  K.renderMSwitch(); K.renderSwatches();
  K.setColor(S.color); K.setCaseColor(S.caseColor);
  $$("[data-model-card]").forEach(b=>b.addEventListener("click",()=>K.setModel(b.getAttribute("data-model-card"))));
  document.addEventListener("click",e=>{
    const a=e.target.closest("[data-go-model]"); if(a) K.setModel(a.getAttribute("data-go-model"));
  });
  K.render();
  K.setStep(0);
  $$("[data-scen]").forEach(b=>b.addEventListener("click",()=>K.setScen(b.getAttribute("data-scen"))));
  K.setScen("chat");
  $("#zoom").addEventListener("input",function(){K.setZoom(+this.value);});
  $$("[data-led-btn]").forEach(b=>b.addEventListener("click",()=>K.setLed(b.getAttribute("data-led-btn"))));
  K.setLed("call");
  $("#zenBtn").addEventListener("click",function(){K.setZen(this.getAttribute("aria-pressed")!=="true");});
  K.buildPriv(); K.setPriv(false);
  $("#privBtn").addEventListener("click",function(){K.setPriv(this.getAttribute("aria-pressed")!=="true");});
  $$("[data-macro]").forEach(b=>b.addEventListener("click",()=>K.setMacro(b.getAttribute("data-macro"))));
  $("#xpRange").addEventListener("input",function(){K.setExplodeManual(this.value/100);});
  $$("[data-mode]").forEach(b=>b.addEventListener("click",()=>{K.CMP.mode=b.getAttribute("data-mode");$$("[data-mode]").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));K.buildCmp();}));
  $("#cardBtn").addEventListener("click",function(){K.CMP.card=!K.CMP.card;this.setAttribute("aria-pressed",K.CMP.card?"true":"false");K.buildCmp();});
  ["#hSurf","#hVideo","#hMusic","#hCam"].forEach(id=>$(id).addEventListener("input",K.calc));
  K.calc();
  $("#caseTgl").addEventListener("click",function(){S.caseOn=this.getAttribute("aria-pressed")!=="true";this.setAttribute("aria-pressed",S.caseOn?"true":"false");K.render(["acc-front","acc-side","acc-back"]);});
  $("#accAdd").addEventListener("click",()=>{K.addItem({type:"case",model:S.model,color:S.caseColor});$("#accAdded").textContent="Hülle liegt im Warenkorb.";});
  $$("[data-flip]").forEach(b=>b.addEventListener("click",()=>{S.flip=b.getAttribute("data-flip");$$("[data-flip]").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));K.render(["shop"]);}));
  $("#engr").addEventListener("input",function(){
    const val=this.value;
    if(!ENGR_OK.test(val)){ this.setAttribute("aria-invalid","true"); $("#engrErr").textContent="Nur Buchstaben, Zahlen, Leerzeichen und . , ' & ! ? + - sind möglich."; return; }
    this.removeAttribute("aria-invalid"); $("#engrErr").textContent="";
    S.engrave=val.trim(); $$(".engr").forEach(t=>t.textContent=S.engrave);
    if(S.flip!=="back"){ S.flip="back"; $$("[data-flip]").forEach(o=>o.setAttribute("aria-pressed",o.getAttribute("data-flip")==="back"?"true":"false")); K.render(["shop"]); }
    K.updateSummary();
  });
  $("#addPhone").addEventListener("click",()=>{
    if($("#engr").getAttribute("aria-invalid")==="true"){ $("#engr").focus(); return; }
    K.addItem({type:"phone",model:S.model,color:S.color,store:S.store,engrave:S.engrave});
    $("#phoneAdded").textContent=`${M().name} liegt im Warenkorb.`;
    K.openCart();
  });
  $("#upAdd").addEventListener("click",()=>{K.addItem({type:"case",model:S.model,color:S.caseColor});$("#caseAdded").textContent="Hülle liegt im Warenkorb.";});
  $("#cartBtn").addEventListener("click",K.openCart);
  $("#drClose").addEventListener("click",()=>K.closeCart());
  $("#drawerBg").addEventListener("click",()=>K.closeCart());
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&$("#drawer").classList.contains("open")) K.closeCart(); });
  $("#drawer").addEventListener("click",e=>{ if(e.target.closest("a[href^='#/']")) K.closeCart(true); });
  $("#dlgClose").addEventListener("click",()=>$("#orderDlg").close());
  $("#dlgEmpty").addEventListener("click",()=>{K.clearCart();$("#orderDlg").close();});
  K.setModel(S.model);
  K.renderCart();
  K.route();
}
init();
})(window.Kiesel);
