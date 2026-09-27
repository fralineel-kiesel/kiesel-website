/* daten.js – reine Daten: Farben, Modelle, Texte, Messwerte.
   Keine Logik ausser M(). Wer einen Text oder Preis ändern will, ist hier richtig. */
(function(K){
"use strict";

const COLORS={
  schwarz:{name:"Mattschwarz",frame:"#2B2D30",back:"#232428",dark:"#141517",logo:"#4B4E54",note:"Tief und matt wie nasser Schiefer."},
  titan:{name:"Titangrau",frame:"#8B8F95",back:"#7B7F85",dark:"#55585D",logo:"#62666C",note:"Gebürstetes Titan, der Klassiker unter den Kieseln."},
  himmel:{name:"Himmelblau",frame:"#A7C4DE",back:"#B8D3EA",dark:"#7E9FBE",logo:"#8CAACA",note:"Die Farbe eines Bergsees an einem klaren Morgen."},
  weiss:{name:"Mattweiss",frame:"#DCDBD6",back:"#EEEDE9",dark:"#B9B7B1",logo:"#C9C7C1",note:"Hell wie ein Kalkstein aus dem Bachbett."},
  sand:{name:"Kieselbeige",frame:"#C9BBA3",back:"#D8CCB8",dark:"#A5957B",logo:"#B3A48A",note:"Warmer Sandstein, ruhig und zeitlos."}
};
/* Masse in Zehntel-Millimetern: W Breite, H Höhe, R Eckradius */
const KM={
  k1:{id:"k1",name:"Kiesel 1",W:586,H:1238,R:96,cams:1,stores:{"256":1200,"512":1400,"1024":1600}},
  pro:{id:"pro",name:"Kiesel 1 Pro",W:642,H:1315,R:106,cams:2,stores:{"256":1500,"512":1700,"1024":1900,"2048":2300}}
};
const STORE_LABEL={"256":"256 GB","512":"512 GB","1024":"1 TB","2048":"2 TB"};
const CASE_PRICE=59;
const M=()=>KM[K.S.model];

const PARTS={
  faceid:{t:"Dynamic Island mit Face ID",d:"Ersetzt den Home-Button. Frontkamera und Face-ID-Sensoren sitzen in der kleinen Pille."},
  action:{t:"Action-Button",d:"Frei belegbar. Kurz drücken startet zum Beispiel den Zen-Modus, zwei Sekunden halten schaltet den Privacy-Modus."},
  volume:{t:"Lautstärke",d:"Zwei klassische Tasten, genau wie beim SE."},
  power:{t:"Seitentaste",d:"Ein und aus, Sprachassistent und Zahlungen bestätigen."},
  camerabtn:{t:"Kamera-Knopf",d:"Ein einfacher Taster: einmal drücken öffnet die Kamera, nochmal drücken löst aus. Keine Wischgesten, das spart Platz."},
  usbc:{t:"USB-C",d:"Laden und Daten. Daneben keine Klinke und kein SIM-Schlitten."},
  camera:{t:"Hauptkamera",d:"Variable Linse von 0.5x bis 1x mit 50-MP-Sensor, inklusive Makro. Sitzt genau im Mittelpunkt der Gehäuseecke."},
  tele:{t:"3x-Tele (nur Pro)",d:"Gerade eingebaute Linse mit ca. 78 mm, optischem Bildstabilisator und Nahfokus ab ca. 20 cm. Passt dank 9 mm Dicke ohne Periskop."},
  flash:{t:"RGB-Blitz",d:"Neutral weiss beim Fotografieren, sonst ein farbiges Signal für Anrufe, Nachrichten, Akku und Privacy-Modus."},
  magsafe:{t:"MagSafe und Qi",d:"Magnetring und Ladespule hinter der matten Rückseite."}
};

const TITLES={uebersicht:"Kiesel 1 und Kiesel 1 Pro",design:"Design",funktionen:"Funktionen",technik:"Technik",vergleich:"Vergleich",akku:"Akku",zubehoer:"Zubehör",kaufen:"Kaufen"};

/* Akku-Story */
const MAH=[1624,1700,1760,1860,2250,3000];

/* Simulator */
const SCEN={
  lock:{hz:1,cores:[0,1,0,0],net:"4G",heat:1,note:"Das Display friert fast ein, ein einziger Effizienz-Kern hält Wache."},
  chat:{hz:60,cores:[0,1,1,0],net:"4G",heat:1,note:"Tippen braucht wenig: zwei Effizienz-Kerne und 60 Hz reichen locker."},
  scroll:{hz:90,cores:[0,1,1,1],net:"4G",heat:2,note:"Beim Scrollen geht das Display auf die vollen 90 Hz, danach sofort wieder runter."},
  video:{hz:24,cores:[0,1,0,0],net:"4G",heat:1,note:"Das Display läuft im Takt des Films, den Rest macht die Medien-Einheit im Chip."},
  download:{hz:10,cores:[0,1,1,0],net:"5G",heat:2,note:"Erst jetzt wacht 5G auf. Ist der Download fertig, geht das Modem zurück auf 4G."},
  photo:{hz:90,cores:[1,1,1,1],net:"4G",heat:3,note:"Der Super-Kern springt für die Bildverarbeitung ein, maximal mit 4 GHz."}
};
const HEATTXT=["","kaum spürbar","leicht warm","spürbar warm"];

/* RGB-Licht */
const LEDTXT={
  call:"Anruf: pulsiert schnell blau. So merkst du es auch, wenn das Handy auf dem Tisch liegt.",
  msg:"Nachricht: zweimal kurz violett, dann Pause. Wiederholt sich, bis du nachschaust.",
  charge:"Lädt: atmet langsam grün.",
  full:"Voll geladen: leuchtet ruhig grün.",
  low:"Akku unter 10 %: pulsiert langsam rot.",
  privacy:"Privacy-Modus aktiv: leuchtet dauerhaft orange, solange Kamera, Mikrofon und GPS getrennt sind.",
  flash:"Fotoblitz: alle drei Farben voll an, ergibt neutrales Weiss. Die Farbtemperatur passt sich dem Umgebungslicht an.",
  off:"Aus: der Punkt ist ein ganz normaler Blitz und fällt nicht auf."
};

/* Privacy-Schema */
const PV=[{t:"Kamera",y:80},{t:"Mikrofon",y:190},{t:"GPS",y:300}];

/* Vergleich, Masse in Millimetern */
const CM={
  k1:{name:"Kiesel 1",h:123.8,w:58.6,d:9.0,g:140,bat:3000,disp:4.7,r:9.6,type:"kiesel",est:true},
  pro:{name:"Kiesel 1 Pro",h:131.5,w:64.2,d:9.0,g:170,bat:3600,disp:5.4,r:10.6,type:"kiesel",est:true},
  se:{name:"iPhone SE (2016)",h:123.8,w:58.6,d:7.6,g:113,bat:1624,disp:4.0,r:8.6,type:"home"},
  mini:{name:"iPhone 13 mini",h:131.5,w:64.2,d:7.65,g:140,bat:2438,disp:5.4,r:10.5,type:"notch"},
  p18:{name:"iPhone 18 Pro",h:150,w:71.9,d:8.75,g:211,bat:4056,disp:6.3,r:12,type:"island"}
};

/* Akku-Rechner: Prozent pro Stunde beim SE, und Faktor je Modell */
const RATE={surf:100/13,video:100/13,music:100/50,cam:100/5,idle:100/240};
const DIV={k:3000/1624,p:(3000/1624)*(3600/3000)*0.9,s:1};

/* Erlaubte Zeichen für die Gravur */
const ENGR_OK=/^[A-Za-z0-9ÄÖÜäöüÉÈÀéèàçÇ .,'’&!?+\-]*$/;

Object.assign(K,{COLORS,KM,STORE_LABEL,CASE_PRICE,M,PARTS,TITLES,MAH,SCEN,HEATTXT,LEDTXT,PV,CM,RATE,DIV,ENGR_OK});
})(window.Kiesel);
