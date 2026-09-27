/* startseite.js – die drei interaktiven Teile der Übersicht:
   Akku-Story (Röntgenbild beim Scrollen), Energie-Simulator, Kamera-Zoom. */
(function(K){
"use strict";
const {$,$$,reduce,S,MAH,SCEN,HEATTXT}=K;

/* Story */
let curMah=1624, mahAnim=null;
function setStep(i){
  $$("#steps .step").forEach(s=>s.classList.toggle("on",+s.getAttribute("data-step")===i));
  const to=MAH[i], el=$("#mahNum"), from=curMah; curMah=to;
  if(mahAnim) cancelAnimationFrame(mahAnim);
  if(reduce) el.textContent=to; else { let t0=null; const st=ts=>{ if(!t0) t0=ts; const k=Math.min(1,(ts-t0)/650),e=1-Math.pow(1-k,3); el.textContent=Math.round(from+(to-from)*e); if(k<1) mahAnim=requestAnimationFrame(st); }; mahAnim=requestAnimationFrame(st); }
  $("#xrBat").style.transform=`scaleY(${to/3000})`;
  const gone=[i>=1,i>=2,i>=3];
  ["#xrJack","#xrSim","#xrHome"].forEach((id,j)=>{$(".xr-part",$(id)).classList.toggle("gone",gone[j]);$(".xr-strike",$(id)).classList.toggle("on",gone[j]);});
  $("#xrSide").style.transform=`scaleX(${i>=4?1:7.6/9})`;
  $("#xrThick").textContent=i>=4?"9 mm":"7.6 mm";
}
if("IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) setStep(+e.target.getAttribute("data-step")); }),{rootMargin:"-45% 0px -45% 0px"});
  $$("#steps .step").forEach(s=>io.observe(s));
}

/* Simulator */
let curHz=60, hzAnim=null, curScen=null;
function setScen(k,silent){
  const s=SCEN[k]; curScen=k;
  $$("[data-scen]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-scen")===k?"true":"false"));
  $$(".sim .scr").forEach(g=>g.classList.toggle("show",g.getAttribute("data-s")===k));
  if(silent) return;
  const el=$("#mHz"), from=curHz, to=s.hz; curHz=to;
  if(hzAnim) cancelAnimationFrame(hzAnim);
  if(reduce) el.textContent=to+" Hz"; else { let t0=null; const st=ts=>{ if(!t0) t0=ts; const q=Math.min(1,(ts-t0)/450),e=1-Math.pow(1-q,3); el.textContent=Math.round(from+(to-from)*e)+" Hz"; if(q<1) hzAnim=requestAnimationFrame(st); }; hzAnim=requestAnimationFrame(st); }
  $$("#mCores i").forEach((c,i)=>c.classList.toggle("on",!!s.cores[i]));
  const n=s.cores.reduce((a,b)=>a+b,0);
  $("#mClock").textContent=s.cores[0]?"Super-Kern aktiv, bis 4 GHz":(n===1?"1 Effizienz-Kern":n+" Effizienz-Kerne");
  $("#mNet").textContent=s.net; $("#mNet").classList.toggle("g5",s.net==="5G");
  $("#mNetSub").textContent=s.net==="5G"?"kurz hochgeschaltet":"5G schläft";
  $$("#mHeat i").forEach((h,i)=>h.classList.toggle("on",i<s.heat));
  $("#mHeatSub").textContent=HEATTXT[s.heat];
  $("#mNote").textContent=s.note;
}
/* Nach render() ist das Simulator-SVG neu – den aktuellen Bildschirm wieder zeigen */
function refreshScen(){ if(curScen) setScen(curScen,true); }

/* Zoom */
function zcfg(){return S.model==="pro"?{max:10,pre:[0.5,1,3,10]}:{max:5,pre:[0.5,1,2,5]};}
function setupZoom(){
  const c=zcfg(), z=$("#zoom"); z.max=c.max;
  $("#zoomPre").innerHTML=c.pre.map(v=>`<button class="chip-btn" data-z="${v}" aria-pressed="false">${v}x</button>`).join("");
  $$("[data-z]").forEach(b=>b.addEventListener("click",()=>setZoom(+b.getAttribute("data-z"))));
  $("#camLead").textContent=S.model==="pro"
    ?"Der Pro hat zwei Linsen: die variable 0.5x bis 1x und eine echte 3x-Tele. Bis 3x bleibt alles scharf, bis 6x holt der Sensor noch viel raus, darüber wird es digital."
    :"Statt drei Modulen gibt es eines mit variabler Linse. Von 0.5x bis 1x optisch, bis 2x fast verlustfrei dank 50 MP, darüber digital. Für Gipfelkreuze gibts den Pro oder die Kompaktkamera.";
  setZoom(Math.min(+z.value,c.max));
}
function setZoom(z){
  z=Math.round(z*10)/10; const pro=S.model==="pro";
  $("#zoom").value=z;
  $("#scene").style.transform=`scale(${z/0.5})`;
  let blur=0, mode;
  if(z<=1) mode="optisch, variable Linse";
  else if(!pro){ if(z<=2) mode="Sensor-Ausschnitt, fast verlustfrei"; else {mode="digital, wird weicher";blur=(z-2)*0.9;} }
  else { if(z<=2) mode="Sensor-Ausschnitt, fast verlustfrei"; else if(z<3) {mode="Ausschnitt, gleich kommt die Tele";blur=(z-2)*0.5;} else if(z<=3.05) mode="optisch, 3x-Tele"; else if(z<=6) mode="Ausschnitt aus der Tele"; else {mode="digital, wird weicher";blur=(z-6)*0.8;} }
  $("#camSvg").style.filter=blur?`blur(${blur.toFixed(2)}px)`:"none";
  $("#zVal").textContent=z.toFixed(1)+"x";
  $("#zMode").textContent=mode;
  $$("[data-z]").forEach(b=>b.setAttribute("aria-pressed",Math.abs(+b.getAttribute("data-z")-z)<0.05?"true":"false"));
}

Object.assign(K,{setStep,setScen,refreshScen,setupZoom,setZoom});
})(window.Kiesel);
