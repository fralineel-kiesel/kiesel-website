/* warenkorb.js – Warenkorb-Array CART, Speichern in localStorage,
   Schublade (öffnen/schliessen/zeichnen) und Bestell-Dialog.
   CART wird neu zugewiesen (CART=CART.filter…), darum bleibt es in dieser
   Datei. Andere Dateien benutzen nur die exportierten Funktionen. */
(function(K){
"use strict";
const {$,$$,esc,chf,COLORS,KM,STORE_LABEL,CASE_PRICE}=K;

let CART=[];
const KEY="kiesel-cart-v2";
function saveCart(){try{localStorage.setItem(KEY,JSON.stringify(CART));}catch(e){}}
function loadCart(){
  try{const c=JSON.parse(localStorage.getItem(KEY)||"[]"); if(Array.isArray(c)) CART=c.filter(i=>i&&KM[i.model]&&COLORS[i.color]);}catch(e){CART=[];}
}
const priceOf=i=>i.type==="case"?CASE_PRICE:KM[i.model].stores[i.store];
function addItem(item){
  const same=CART.find(i=>i.type===item.type&&i.model===item.model&&i.color===item.color&&(i.store||"")===(item.store||"")&&(i.engrave||"")===(item.engrave||""));
  if(same) same.qty=Math.min(9,same.qty+1); else CART.push(Object.assign({qty:1,id:Date.now()+Math.random()},item));
  saveCart(); renderCart();
}
function clearCart(){ CART=[]; saveCart(); renderCart(); }
function renderCart(){
  const n=CART.reduce((a,i)=>a+i.qty,0);
  $("#cartCount").textContent=n?String(n):"";
  $("#cartBtn").setAttribute("aria-label",n?`Warenkorb öffnen, ${n} Artikel`:"Warenkorb öffnen, leer");
  const body=$("#drBody"), foot=$("#drFoot");
  if(!CART.length){
    body.innerHTML=`<div class="empty"><p>Dein Warenkorb ist noch leer.</p><a class="btn btn-primary" href="#/kaufen">Kiesel aussuchen</a></div>`;
    foot.innerHTML=""; return;
  }
  body.innerHTML=CART.map(i=>{
    const c=COLORS[i.color], isCase=i.type==="case";
    const title=isCase?`Kiesel-Hülle`:KM[i.model].name;
    const meta=isCase?`für ${KM[i.model].name}, ${c.name}`:`${c.name}, ${STORE_LABEL[i.store]}${i.engrave?`, Gravur «${esc(i.engrave)}»`:""}`;
    return `<div class="item" data-id="${i.id}">
      <span class="sw-dot${isCase?" case":""}" style="background:${isCase?c.back:c.frame};--cc:${c.frame}"></span>
      <div><h4>${title}</h4><div class="meta">${meta}</div>
        <div class="qty"><button data-q="-1" aria-label="Eins weniger">−</button><span aria-label="Anzahl">${i.qty}</span><button data-q="1" aria-label="Eins mehr">+</button><button class="rm" data-rm>Entfernen</button></div></div>
      <div class="pr">${chf(priceOf(i)*i.qty)}</div></div>`;
  }).join("");
  const phoneModels=[...new Set(CART.filter(i=>i.type==="phone").map(i=>i.model))];
  const missing=phoneModels.find(m=>!CART.some(i=>i.type==="case"&&i.model===m));
  if(missing){
    const ph=CART.find(i=>i.type==="phone"&&i.model===missing);
    body.innerHTML+=`<div class="dr-up"><p>Passende Hülle für deinen ${KM[missing].name} in ${COLORS[ph.color].name}? ${chf(CASE_PRICE)}</p><button class="btn btn-primary" style="padding:9px 16px" data-up="${missing}" data-upc="${ph.color}">Dazu</button></div>`;
  }
  const total=CART.reduce((a,i)=>a+priceOf(i)*i.qty,0), vat=total*8.1/108.1;
  foot.innerHTML=`<div class="row"><span>Zwischensumme</span><span>${chf(total)}</span></div><div class="row"><span>Versand</span><span>kostenlos</span></div><div class="row"><span>davon MwSt. 8.1 %</span><span>CHF ${vat.toLocaleString("de-CH",{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div><div class="row total"><span>Total</span><span>${chf(total)}</span></div><button class="btn btn-primary" id="checkout">Zur Kasse</button>`;
  $$(".item",body).forEach(row=>{
    const it=CART.find(i=>String(i.id)===row.getAttribute("data-id"));
    $$("[data-q]",row).forEach(b=>b.addEventListener("click",()=>{it.qty+=+b.getAttribute("data-q"); if(it.qty<1) CART=CART.filter(x=>x!==it); if(it.qty>9) it.qty=9; saveCart(); renderCart();}));
    $("[data-rm]",row).addEventListener("click",()=>{CART=CART.filter(x=>x!==it); saveCart(); renderCart(); $("#drClose").focus();});
  });
  const up=$("[data-up]",body); if(up) up.addEventListener("click",()=>addItem({type:"case",model:up.getAttribute("data-up"),color:up.getAttribute("data-upc")}));
  $("#checkout").addEventListener("click",checkout);
}
let lastFocus=null;
function openCart(){
  lastFocus=document.activeElement; renderCart();
  $("#drawer").classList.add("open"); $("#drawerBg").classList.add("open"); $("#drawer").setAttribute("aria-hidden","false");
  document.body.classList.add("lock");
  setTimeout(()=>$("#drClose").focus(),50);
}
function closeCart(silent){
  if(!$("#drawer").classList.contains("open")) return;
  $("#drawer").classList.remove("open"); $("#drawerBg").classList.remove("open"); $("#drawer").setAttribute("aria-hidden","true");
  document.body.classList.remove("lock");
  if(!silent&&lastFocus&&lastFocus.focus) lastFocus.focus();
}
function checkout(){
  const total=CART.reduce((a,i)=>a+priceOf(i)*i.qty,0);
  $("#dlgList").innerHTML=CART.map(i=>`<li>${i.qty}× ${i.type==="case"?"Kiesel-Hülle für "+KM[i.model].name:KM[i.model].name+", "+STORE_LABEL[i.store]} in ${COLORS[i.color].name}${i.engrave?", «"+esc(i.engrave)+"»":""}</li>`).join("");
  $("#dlgP").textContent=`Total ${chf(total)}. Und jetzt die traurige Wahrheit: Kiesel gibt es nur in unseren Köpfen. Dein Warenkorb bleibt aber gespeichert, falls Cupertino es sich doch noch anders überlegt.`;
  closeCart(true);
  const d=$("#orderDlg"); if(d.showModal) d.showModal(); else alert($("#dlgP").textContent);
}

Object.assign(K,{loadCart,addItem,clearCart,renderCart,openCart,closeCart});
})(window.Kiesel);
