/* akku.js – Laufzeit-Rechner. Tag von 07:00 bis 23:00 (16 h), Rest ist Standby. */
(function(K){
"use strict";
const {$,RATE,DIV}=K;

const hm=h=>{const t=Math.round(h*60),H=Math.floor(t/60)%24,Mi=t%60;return (H<10?"0":"")+H+":"+(Mi<10?"0":"")+Mi;};
function calc(){
  const v={surf:+$("#hSurf").value,video:+$("#hVideo").value,music:+$("#hMusic").value,cam:+$("#hCam").value};
  $("#oSurf").textContent=v.surf+" h";$("#oVideo").textContent=v.video+" h";$("#oMusic").textContent=v.music+" h";$("#oCam").textContent=v.cam+" h";
  const A=v.surf+v.video+v.music+v.cam;
  if(A>16){
    $("#calcErr").textContent=`Zusammen ${A} Stunden aktiv. Ein Tag von 07:00 bis 23:00 hat nur 16, stell einen Regler tiefer.`;
    ["#rBig","#rK","#rP","#rS","#pK","#pP","#pS"].forEach(id=>$(id).textContent="–");
    ["#fK","#fP","#fS"].forEach(id=>$(id).style.width="0"); return;
  }
  $("#calcErr").textContent="";
  const res=d=>{const dw=(v.surf*RATE.surf+v.video*RATE.video+v.music*RATE.music+v.cam*RATE.cam+(16-A)*RATE.idle)/d, night=8*RATE.idle/d;
    return {left:Math.max(0,100-dw),empty:dw>=100?7+16*(100/dw):null,days:100/(dw+night)};};
  const put=(r,f,t,p)=>{
    $(f).style.width=r.left+"%"; $(f).classList.toggle("low",r.left<20);
    $(t).textContent=r.empty?"leer um "+hm(r.empty):Math.round(r.left)+" % um 23:00";
    const dv=r.days.toFixed(1); $(p).textContent="Reicht bei diesem Alltag für ca. "+(dv==="1.0"?"1 Tag":dv.replace(".0","")+" Tage")+".";
  };
  const k=res(DIV.k),p=res(DIV.p),s=res(DIV.s);
  put(k,"#fK","#rK","#pK"); put(p,"#fP","#rP","#pP"); put(s,"#fS","#rS","#pS");
  const t=r=>r.empty?"leer um "+hm(r.empty):"noch "+Math.round(r.left)+" %";
  $("#rBig").textContent=`Um 23:00: Kiesel 1 ${t(k)}, Pro ${t(p)}`;
}

Object.assign(K,{calc});
})(window.Kiesel);
