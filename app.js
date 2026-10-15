/* V.C. Tips app: setup steps, tips and venues. Content in Firestore (vct_steps, vct_tips, vct_venues);
   everyone signed in reads it, Check Mate administrators edit it (see README for the database rules). */
(async () => {
  await claude.use("db");   // waits on the sign-in screen until signed in
  document.getElementById("root").replaceChildren(document.getElementById("tpl-app").content.cloneNode(true));
  (function(){

const $ = id => document.getElementById(id);
const esc = s => String(s??"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/\s+/g," ").trim();
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.setAttribute("role","status"); t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2600); }
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const fmtDate = s => s ? s.split("-").reverse().join("/") : "";

/* first content an admin can load with one tap (edit or delete it afterwards) */
const START_STEPS = [
  {title:"Συνολική διάταξη", text:"• Μαύρες (1–8, C, D): κάμερες γραμμών\n• Πορτοκαλί (Y, T, R και L, K, J): κάμερες block\n• Κίτρινες (A, B): κάμερες φιλέ\n• Μπλε (S): κάμερα σκηνής\n• Server 1 και Server 2 στις δύο πλευρές, Server Main στη μέση, ο καθένας με UPS και πρίζα σούκο\n• Κόκκινο/μπλε: θωρακισμένο καλώδιο Cat6 · Καφέ: καλώδιο USB 3.0", diagram:true},
  {title:"Έλεγχος εξοπλισμού πριν φύγεις", text:"• Κάμερες και φορτισμένες μπαταρίες (+1 εφεδρική)\n• Κάρτες μνήμης, άδειες\n• Σφιγκτήρες / βάσεις, ιμάντες velcro, δεματικά (tie-wraps)\n• Καλώδια, πολύπριζο, router, tablet ελέγχου\n• Ψαλίδι ή κόφτης για τα δεματικά"},
  {title:"Δέσιμο κάμερας στο φιλέ", text:"Στερέωσε την κάμερα σε σταθερό σημείο του ορθοστάτη ή στο πάνω συρματόσχοινο, όχι πάνω στη λευκή ταινία που κουνιέται όταν χτυπάει η μπάλα.\nΧρησιμοποίησε δύο σημεία στήριξης (πάνω και κάτω) ώστε να μη γυρίζει.\nΤράβα ελαφρά την κάμερα με το χέρι: αν κουνιέται, σφίξε ξανά."},
  {title:"Ύψος και γωνία λήψης", text:"Γράψε εδώ το ύψος που ορίζει το πρωτόκολλο (π.χ. πόσα εκ. πάνω από την άνω ταινία).\nΤο κάδρο πρέπει να δείχνει ολόκληρη την ταινία του φιλέ και την αντένα από την πλευρά της κάμερας."},
  {title:"Καλώδια και σύνδεση", text:"Πέρασε τα καλώδια κατά μήκος του ορθοστάτη και κόλλησέ τα στο δάπεδο έξω από τον αγωνιστικό χώρο.\nΈλεγξε ότι κάθε κάμερα εμφανίζεται στο tablet ελέγχου."},
  {title:"Δοκιμαστική λήψη", text:"Κάνε μια σύντομη δοκιμαστική εγγραφή με μπάλα που ακουμπά την ταινία και την αντένα.\nΔες την επανάληψη σε αργή κίνηση πριν δώσεις το ΟΚ στους διαιτητές."}
];
const START_TIPS = [
  {cat:"Στερέωση", title:"Δεματικά διπλά", text:"Βάλε πάντα δύο δεματικά σε κάθε σημείο στήριξης. Αν σπάσει το ένα στη διάρκεια του σετ, η κάμερα μένει στη θέση της."},
  {cat:"Στερέωση", title:"Μακριά από την ταινία", text:"Η λευκή ταινία του φιλέ δονείται σε κάθε επαφή. Στερέωση πάνω της σημαίνει κουνημένη εικόνα στο replay."},
  {cat:"Κάδρο", title:"Αντένα ολόκληρη στο κάδρο", text:"Έλεγξε ότι φαίνεται όλη η αντένα, από την ταινία ως την κορυφή."},
  {cat:"Ασφάλεια", title:"Τίποτα μέσα στον αγωνιστικό χώρο", text:"Καλώδια και βάσεις μένουν έξω από την ελεύθερη ζώνη. Ζήτα από τον 1ο διαιτητή να ελέγξει το στήσιμο πριν το ζέσταμα."},
  {cat:"Πριν τον αγώνα", title:"Έλα νωρίς", text:"Υπολόγισε χρόνο για στήσιμο, δοκιμή και διορθώσεις πριν ανοίξει το γήπεδο για ζέσταμα."}
];

const ICON = {
  setup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-3v8l-5-3"/></svg>',
  tips:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
  venues:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
};
const TABS = [["setup","Στήσιμο"],["tips","Tips"],["venues","Γήπεδα"]];

let db=null, me=null, isAdmin=false, edit=false;
let steps=[], tips=[], venues=[], ready={steps:false,tips:false,venues:false};
let tab = (location.hash||"").slice(1); if(!TABS.some(t=>t[0]===tab)) tab = "setup";
let tipCat = "Όλα", venueId = null, filter = "", sheet = null, zoom = null;   // zoom: {src, alt} of the photo shown full screen
try{ venueId = localStorage.getItem("vct-venue"); }catch{}

/* the official VideoCheck layout (img/videocheck-layout.jpg); tap opens it full size for zooming */
const LAYOUT = "img/videocheck-layout.jpg";
const LAYOUT_ALT = "Διάταξη VideoCheck: κάμερες γραμμών 1–8, C, D, κάμερες block Y, T, R, L, K, J, κάμερες φιλέ A, B, E, W, κάμερες U, I, κάμερα σκηνής S, Server 1, Server 2 και Server Main με UPS και πρίζα σούκο";
/* step 1 shows its picture large; tap opens it full screen */
function diagram(){
  return `<button class="g-layout" data-act="zoom" data-k="steps" data-i="0" aria-label="Μεγέθυνση της διάταξης">
    <img src="${LAYOUT}" width="1386" height="916" alt="${esc(LAYOUT_ALT)}"><span>Πάτα για μεγέθυνση</span></button>`;
}
/* every other photo is a small thumbnail that opens full screen */
const imgOf = it => it.img || (it.diagram ? LAYOUT : "");
function thumb(it, k, i){
  const src = imgOf(it); if(!src) return "";
  return `<button class="g-thumb" data-act="zoom" data-k="${k}" data-i="${i}" aria-label="Μεγέθυνση φωτογραφίας: ${esc(it.title||"")}"><img src="${src}" alt="" loading="lazy"></button>`;
}
function viewZoom(){
  if(!zoom) return "";
  return `<div class="g-zoom" role="dialog" aria-modal="true" aria-label="${esc(zoom.alt)}" data-act="unzoom">
    <button class="g-zoom-x" data-act="unzoom">Κλείσιμο ✕</button>
    <div class="g-zoom-in"><img src="${zoom.src}" alt="${esc(zoom.alt)}" data-act="zoomfull"></div>
    <p class="g-zoom-hint">Πάτα την εικόνα για πλήρες μέγεθος</p></div>`;
}

/* V.C. Tips venues (own list, collection vct_venues): code (acronym), name, city, address, map (Google Maps link or "lat,lng"), notes */
const COORD = /^\s*-?\d{1,2}\.\d+\s*,\s*-?\d{1,3}\.\d+\s*$/;
function mapsUrl(v){
  if(/^https?:\/\//i.test(v.map||"")) return v.map;
  const q = COORD.test(v.map||"") ? v.map.replace(/\s/g,"") : (v.address ? [v.name, v.address].filter(Boolean).join(", ") : [v.name, v.city].filter(Boolean).join(", "));
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
}
const venueKey = v => norm(v.code || v.name);

function tools(kind, i, len){
  if(!edit) return "";
  const mv = kind==="venues" ? "" : `<button class="g-tb" data-act="up" data-k="${kind}" data-i="${i}" ${i===0?"disabled":""} aria-label="Μετακίνηση πάνω">↑</button>
    <button class="g-tb" data-act="down" data-k="${kind}" data-i="${i}" ${i===len-1?"disabled":""} aria-label="Μετακίνηση κάτω">↓</button>`;
  return `<div class="g-tools"><button class="g-tb" data-act="edit" data-k="${kind}" data-i="${i}">✎ Επεξεργασία</button>${mv}
    <button class="g-tb del" data-act="del" data-k="${kind}" data-i="${i}">Διαγραφή</button></div>`;
}
function emptyBox(title, sub, extra=""){ return `<div class="g-empty"><strong>${title}</strong><div>${sub}</div>${extra}</div>`; }

function viewSetup(){
  if(!ready.steps) return `<h1 class="g-h1">Στήσιμο video check</h1><p class="g-lede">Φόρτωση…</p>`;
  const n = steps.length;
  const empty = isAdmin
    ? emptyBox("Δεν υπάρχουν βήματα ακόμα", "Πρόσθεσε το πρώτο βήμα ή φόρτωσε ένα αρχικό πρόχειρο που αλλάζεις μετά.", `<button class="g-btn" data-act="seed" data-k="steps">Φόρτωση αρχικού προχείρου</button>`)
    : emptyBox("Δεν υπάρχουν βήματα ακόμα", "Θα προστεθούν σύντομα.");
  return `<h1 class="g-h1">Στήσιμο video check</h1><p class="g-lede">Τα βήματα με τη σειρά, από τον εξοπλισμό ως τη δοκιμαστική λήψη.</p>
  <div class="g-list">${n ? steps.map((s,i)=>`<article class="g-step">
    ${i===0 ? (s.img?`<div class="g-media"><button class="g-layout" data-act="zoom" data-k="steps" data-i="0" aria-label="Μεγέθυνση φωτογραφίας"><img src="${s.img}" alt="${esc(s.title)}" loading="lazy"><span>Πάτα για μεγέθυνση</span></button></div>`:s.diagram?`<div class="g-media layout">${diagram()}</div>`:"") : ""}
    <div class="g-body"><div class="g-head"><div><span class="g-num">ΒΗΜΑ ${i+1} / ${n}</span><h2>${esc(s.title)}</h2></div>${i>0?thumb(s,"steps",i):""}</div><p class="g-txt">${esc(s.text)}</p>${tools("steps",i,n)}</div></article>`).join("") : empty}
  ${edit?`<button class="g-add" data-act="new" data-k="steps">+ Νέο βήμα</button>`:""}</div>`;
}

function viewTips(){
  if(!ready.tips) return `<h1 class="g-h1">Tips</h1><p class="g-lede">Φόρτωση…</p>`;
  const cats = ["Όλα", ...new Set(tips.map(t=>t.cat).filter(Boolean))];
  if(!cats.includes(tipCat)) tipCat = "Όλα";
  const list = tips.map((t,i)=>[t,i]).filter(([t])=>tipCat==="Όλα"||t.cat===tipCat);
  const empty = !tips.length
    ? (isAdmin ? emptyBox("Δεν υπάρχουν tips ακόμα", "Πρόσθεσε το πρώτο ή φόρτωσε ένα αρχικό πρόχειρο.", `<button class="g-btn" data-act="seed" data-k="tips">Φόρτωση αρχικού προχείρου</button>`)
               : emptyBox("Δεν υπάρχουν tips ακόμα", "Θα προστεθούν σύντομα."))
    : emptyBox("Κανένα tip σε αυτή την κατηγορία", "");
  return `<h1 class="g-h1">Tips</h1><p class="g-lede">Μικρές λεπτομέρειες που γλιτώνουν προβλήματα στον αγώνα.</p>
  ${tips.length?`<div class="g-chips" role="toolbar" aria-label="Κατηγορίες">${cats.map(c=>`<button class="g-chip" data-act="cat" data-c="${esc(c)}" aria-pressed="${c===tipCat}">${esc(c)}</button>`).join("")}</div>`:""}
  <div class="g-list">${list.length ? list.map(([t,i])=>`<article class="g-tip">${t.cat?`<span><span class="g-tag">${esc(t.cat)}</span></span>`:""}<div class="g-head"><h3>${esc(t.title)}</h3>${thumb(t,"tips",i)}</div><p class="g-txt">${esc(t.text)}</p>${tools("tips",i,tips.length)}</article>`).join("") : empty}
  ${edit?`<button class="g-add" data-act="new" data-k="tips">+ Νέο tip</button>`:""}</div>`;
}

function viewVenues(){
  if(!ready.venues) return `<h1 class="g-h1">Γήπεδα</h1><p class="g-lede">Φόρτωση…</p>`;
  const sorted = venues.slice().sort((a,b)=>(a.code||"~").localeCompare(b.code||"~","el") || (a.name||"").localeCompare(b.name||"","el"));
  const f = norm(filter);
  const shown = f ? sorted.filter(v=>norm([v.code,v.name,v.city,v.address].join(" ")).includes(f)) : sorted;
  const cur = venues.find(v=>v.id===venueId);
  const ci = cur ? venues.indexOf(cur) : -1;
  const emptyAll = isAdmin
    ? emptyBox("Δεν υπάρχουν γήπεδα ακόμα", "Πάτα ✎ Επεξεργασία για να τα προσθέσεις ένα-ένα ή όλα μαζί.", edit?`<button class="g-btn" data-act="copycm">Αντιγραφή λίστας από το Check Mate (μία φορά)</button>`:"")
    : emptyBox("Δεν υπάρχουν γήπεδα ακόμα", "Θα προστεθούν σύντομα.");
  return `<h1 class="g-h1">Γήπεδα</h1><p class="g-lede">Διάλεξε γήπεδο για να δεις το αρκτικόλεξό του και να ανοίξεις οδηγίες στο Google Maps.</p>
  ${venues.length?`<div class="g-picker">
    <div class="g-field"><label for="gq">Αναζήτηση</label><input class="g-in" id="gq" type="search" placeholder="Αρκτικόλεξο, όνομα ή πόλη" value="${esc(filter)}" autocomplete="off"></div>
    <div class="g-field"><label for="gsel">Γήπεδο (${shown.length})</label><select class="g-in" id="gsel"><option value="">— Επίλεξε γήπεδο —</option>
      ${shown.map(v=>`<option value="${v.id}" ${v.id===venueId?"selected":""}>${v.code?esc(v.code)+" — ":""}${esc(v.name)}</option>`).join("")}</select></div>
  </div>`:""}
  ${cur?`<article class="g-court"><div class="hd">${cur.code && norm(cur.code)!==norm(cur.name)?`<span class="g-code">${esc(cur.code)}</span>`:""}<div><h2>${esc(cur.name)}</h2>${cur.city?`<p>${esc(cur.city)}</p>`:""}</div></div>
    <div class="bd">${cur.address||cur.notes?`<dl class="g-kv">${cur.address?`<dt>Διεύθυνση</dt><dd>${esc(cur.address)}</dd>`:""}${cur.notes?`<dt>Σημειώσεις</dt><dd class="g-txt">${esc(cur.notes)}</dd>`:""}</dl>`:""}
    <div class="g-row"><a class="g-btn" href="${esc(mapsUrl(cur))}" target="_blank" rel="noopener">${ICON.venues} Οδηγίες Google Maps</a>${cur.address?`<button class="g-btn ghost" data-act="copy">Αντιγραφή διεύθυνσης</button>`:""}</div>
    ${tools("venues",ci,venues.length)}</div></article>`
   : venues.length ? emptyBox("Επίλεξε γήπεδο από τη λίστα","") : emptyAll}
  ${venues.length?`<div class="g-mini">${shown.map(v=>`<button data-act="pick" data-id="${v.id}" aria-current="${v.id===venueId}"><span class="c ${v.code?"":"none"}">${esc(v.code||"—")}</span><span class="n">${esc(v.name)}</span></button>`).join("")}</div>`:""}
  ${edit?`<div class="g-list" style="margin-top:14px"><button class="g-add" data-act="new" data-k="venues">+ Νέο γήπεδο</button><button class="g-add" data-act="import">Εισαγωγή λίστας γηπέδων</button></div>`:""}`;
}

const FORMS = {
  steps:[["title","Τίτλος βήματος","input"],["text","Οδηγίες","textarea"],["img","Φωτογραφία","image"]],
  tips:[["cat","Κατηγορία","input"],["title","Τίτλος","input"],["text","Κείμενο","textarea"],["img","Φωτογραφία (προαιρετική)","image"]],
  venues:[["code","Αρκτικόλεξο","input"],["name","Όνομα γηπέδου","input"],["city","Πόλη / περιοχή","input"],["address","Διεύθυνση (για το Google Maps)","input"],["map","Σύνδεσμος Google Maps ή συντεταγμένες (προαιρετικό)","input"],["notes","Σημειώσεις (πρόσβαση, πάρκινγκ, υπεύθυνος γηπέδου)","textarea"]],
};
const NAMES = {steps:"βήμα", tips:"tip", venues:"γήπεδο"};
const LIST = k => k==="steps"?steps:k==="tips"?tips:venues;
const COL = k => k==="steps"?"vct_steps":k==="tips"?"vct_tips":"vct_venues";

function viewSheet(){
  if(!sheet) return "";
  if(sheet.kind==="import") return `<div class="g-sheet" data-act="closebg"><div class="g-pane" role="dialog" aria-modal="true" aria-labelledby="gsh">
    <h2 id="gsh">Εισαγωγή λίστας γηπέδων</h2>
    <p class="g-lede" style="margin:0">Ένα γήπεδο ανά γραμμή: <b>Αρκτικόλεξο ; Όνομα ; Πόλη ; Διεύθυνση</b>. Μπορείς να επικολλήσεις στήλες από Excel. Αν το αρκτικόλεξο υπάρχει ήδη, το γήπεδο ενημερώνεται· αλλιώς προστίθεται.</p>
    <textarea class="g-in" id="gimp" style="min-height:200px" placeholder="ΣΕΦ ; Στάδιο Ειρήνης και Φιλίας ; Νέο Φάληρο ; Εθνάρχου Μακαρίου"></textarea>
    <div class="g-row"><button class="g-btn" data-act="doimport">Αποθήκευση</button><button class="g-btn ghost" data-act="close">Άκυρο</button></div></div></div>`;
  const it = sheet.item;
  return `<div class="g-sheet" data-act="closebg"><div class="g-pane" role="dialog" aria-modal="true" aria-labelledby="gsh">
    <h2 id="gsh">${sheet.id?"Επεξεργασία: ":"Νέο "}${NAMES[sheet.kind]}</h2>
    ${FORMS[sheet.kind].map(([k,l,t])=>t==="image"
      ? `<div class="g-field"><label for="gf-${k}">${l}</label><div class="g-imgprev">${it.img?`<img src="${it.img}" alt="">`:""}<input type="file" id="gf-${k}" accept="image/*">${it.img?`<button class="g-tb del" data-act="rmimg" type="button">Αφαίρεση φωτογραφίας</button>`:""}</div></div>`
      : `<div class="g-field"><label for="gf-${k}">${l}</label>${t==="textarea"?`<textarea class="g-in" id="gf-${k}">${esc(it[k])}</textarea>`:`<input class="g-in" id="gf-${k}" value="${esc(it[k])}" ${k==="cat"?'list="gcats"':""}>`}</div>`).join("")}
    <datalist id="gcats">${[...new Set(tips.map(t=>t.cat).filter(Boolean))].map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
    <div class="g-row"><button class="g-btn" data-act="saveitem">Αποθήκευση</button><button class="g-btn ghost" data-act="close">Άκυρο</button></div></div></div>`;
}

function render(){
  const sy = window.scrollY, gq = document.activeElement && document.activeElement.id==="gq" ? document.activeElement.selectionStart : null;
  $("gapp").innerHTML = `<header class="g-top"><div class="g-wrap">
      <div class="g-brand"><div><b>V.C. <span>Tips</span></b><small>Οδηγός στησίματος</small></div></div><span class="g-sp"></span>
      ${isAdmin?`<button class="g-pill" data-act="toggle" aria-pressed="${edit}">${edit?"Τέλος":"✎ Επεξεργασία"}</button>`:""}
</div></header>
    <main class="g-main g-wrap">${tab==="setup"?viewSetup():tab==="tips"?viewTips():viewVenues()}</main>
    <nav class="g-tabs" aria-label="Ενότητες"><div class="in">${TABS.map(([k,l])=>`<a href="#${k}" data-act="tab" data-t="${k}" ${tab===k?'aria-current="page"':""}>${ICON[k]}${l}</a>`).join("")}</div></nav>
    ${viewSheet()}${viewZoom()}`;
  window.scrollTo(0, sy);
  if(gq!==null){ const q=$("gq"); if(q){ q.focus(); try{ q.setSelectionRange(gq,gq); }catch{} } }
}

function resizeImage(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{
  const max=1200, s=Math.min(1,max/Math.max(im.width,im.height)); const c=document.createElement("canvas"); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height); let q=.8, out=c.toDataURL("image/jpeg",q); while(out.length>700000 && q>.35){ q-=.1; out=c.toDataURL("image/jpeg",q); } res(out); };
  im.onerror=rej; im.src=r.result; }; r.onerror=rej; r.readAsDataURL(file); }); }

function readSheet(){ if(!sheet||!FORMS[sheet.kind]) return; for(const [k,,t] of FORMS[sheet.kind]){ if(t==="image") continue; const f=$("gf-"+k); if(f) sheet.item[k]=f.value.trim(); } }
const fail = () => toast("Η αποθήκευση απέτυχε. Έλεγξε τη σύνδεση και δοκίμασε ξανά.");
function pickVenue(id){ venueId=id||null; try{ localStorage.setItem("vct-venue", venueId||""); }catch{} render(); }

async function onClick(ev){
  const el = ev.target.closest("[data-act]"); if(!el) return;
  const a = el.dataset.act, k = el.dataset.k, i = +el.dataset.i;
  if(a==="closebg" && ev.target!==el) return;
  switch(a){
    case "tab": ev.preventDefault(); tab=el.dataset.t; history.replaceState(null,"",location.pathname+"#"+tab); render(); window.scrollTo(0,0); break;
    case "toggle": edit=!edit; render(); break;
    case "cat": tipCat=el.dataset.c; render(); break;
    case "zoom": { const it=LIST(k)[i]; const src = it ? imgOf(it) : LAYOUT; zoom={src: src||LAYOUT, alt: (it&&it.diagram&&!it.img) ? LAYOUT_ALT : (it&&it.title)||""}; render(); break; }
    case "zoomfull": el.closest(".g-zoom-in").classList.toggle("full"); break;
    case "unzoom": if(ev.target===el || ev.target.classList.contains("g-zoom-in") || el.classList.contains("g-zoom-x")){ zoom=null; render(); } break;
    case "pick": pickVenue(el.dataset.id); window.scrollTo({top:0,behavior:"smooth"}); break;
    case "copy": { const v=venues.find(x=>x.id===venueId); const txt=v.address||v.name; try{ await navigator.clipboard.writeText(txt); toast("Η διεύθυνση αντιγράφηκε"); }catch{ toast(txt); } break; }
    case "up": case "down": { const arr=LIST(k), j=a==="up"?i-1:i+1; if(j<0||j>=arr.length) break;
      try{ const b=db.batch(); b.update(db.doc(`${COL(k)}/${arr[i].id}`),{order:j}); b.update(db.doc(`${COL(k)}/${arr[j].id}`),{order:i});
        arr.forEach((x,n)=>{ if(n!==i&&n!==j&&x.order!==n) b.update(db.doc(`${COL(k)}/${x.id}`),{order:n}); }); await b.commit(); }catch{ fail(); } break; }
    case "del":
      if(!el.classList.contains("armed")){ el.classList.add("armed"); el.textContent="Σίγουρα; Πάτα ξανά"; setTimeout(()=>{ if(el.isConnected){ el.classList.remove("armed"); el.textContent="Διαγραφή"; } },3000); }
      else { const it=LIST(k)[i]; try{ await db.doc(`${COL(k)}/${it.id}`).delete(); toast("Διαγράφηκε"); }catch{ fail(); } }
      break;
    case "new": sheet={kind:k, id:null, item:{}}; render(); break;
    case "edit": { const it=LIST(k)[i]; sheet={kind:k, id:it.id, item:{...it}}; render(); break; }
    case "close": case "closebg": sheet=null; render(); break;
    case "rmimg": readSheet(); sheet.item.img=""; sheet.item.diagram=false; render(); break;
    case "saveitem": {
      readSheet(); const it=sheet.item, kind=sheet.kind;
      if(!(it.title||it.name)){ toast(kind==="venues"?"Συμπλήρωσε το όνομα του γηπέδου":"Συμπλήρωσε τίτλο"); break; }
      const data={...it}; delete data.id;
      el.disabled=true;
      try{
        if(sheet.id) await db.doc(`${COL(kind)}/${sheet.id}`).set(data);
        else { if(kind!=="venues") data.order=LIST(kind).length; const ref=await db.collection(COL(kind)).add(data); if(kind==="venues"){ venueId=ref.id; try{ localStorage.setItem("vct-venue", venueId); }catch{} } }
        sheet=null; toast("Αποθηκεύτηκε"); render();
      }catch(e){ el.disabled=false; toast(/size|large|exceed/i.test(e?.message||"")?"Η φωτογραφία είναι πολύ μεγάλη. Δοκίμασε μικρότερη.":"Η αποθήκευση απέτυχε. Δοκίμασε ξανά."); }
      break; }
    case "import": sheet={kind:"import"}; render(); break;
    case "doimport": {
      const rows=$("gimp").value.split("\n").map(l=>l.trim()).filter(Boolean).map(l=>l.split(/\t|;/).map(x=>x.trim())).filter(p=>p[0]||p[1]);
      if(!rows.length){ toast("Η λίστα είναι κενή"); break; }
      el.disabled=true; let added=0, updated=0;
      try{
        for(let a=0; a<rows.length; a+=400){
          const b=db.batch();
          for(const p of rows.slice(a,a+400)){
            const d={}; if(p[0]) d.code=p[0]; if(p[1]) d.name=p[1]; if(p[2]) d.city=p[2]; if(p[3]) d.address=p[3];
            const ex=venues.find(v=>venueKey(v)===norm(p[0]||p[1]));
            if(ex){ b.set(db.doc(`vct_venues/${ex.id}`), d, {merge:true}); updated++; }
            else { if(!d.name) d.name=d.code; b.set(db.collection("vct_venues").doc(), d); added++; }
          }
          await b.commit();
        }
        sheet=null; toast(`Ενημερώθηκαν ${updated}, προστέθηκαν ${added}`); render();
      }catch{ el.disabled=false; fail(); }
      break; }
    /* one-off copy of Check Mate's venue list (owner is a Check Mate admin); afterwards the two lists are independent */
    case "copycm": {
      el.disabled=true;
      try{
        const snap=await db.collection("venues").get();
        const b=db.batch(); let n=0;
        snap.docs.forEach(d=>{ const v=d.data(); if(!v.name) return;
          const o={code:v.name, name:v.full||v.name}; if(v.address) o.address=v.address; if(v.map) o.map=v.map;
          b.set(db.collection("vct_venues").doc(), o); n++; });
        if(!n){ el.disabled=false; toast("Η λίστα του Check Mate είναι κενή"); break; }
        await b.commit(); toast(`Αντιγράφηκαν ${n} γήπεδα. Από εδώ και πέρα αλλάζουν μόνο στο V.C. Tips.`);
      }catch{ el.disabled=false; toast("Η αντιγραφή απέτυχε. Χρειάζεται λογαριασμός διαχειριστή του Check Mate."); }
      break; }
    case "seed": {
      const src=k==="steps"?START_STEPS:START_TIPS; el.disabled=true;
      try{ const b=db.batch(); src.forEach((x,n)=>b.set(db.collection(COL(k)).doc(), {...x, order:n})); await b.commit(); toast("Φορτώθηκε. Άλλαξέ το από το ✎ Επεξεργασία."); }
      catch{ el.disabled=false; fail(); }
      break; }
  }
}

(async () => {
  db = await claude.use("db");
  const u = await claude.use("user");
  me = u ? await u.me() : null;
  isAdmin = u ? !!(await u.canEdit()) : false;   // Check Mate administrators edit V.C. Tips
  const g = $("gapp");
  g.addEventListener("click", onClick);
  g.addEventListener("change", async ev => {
    const t = ev.target;
    if(t.id==="gsel") pickVenue(t.value);
    else if(t.id==="gf-img" && t.files[0]){ readSheet(); try{ sheet.item.img = await resizeImage(t.files[0]); sheet.item.diagram=false; }catch{ toast("Δεν άνοιξε η εικόνα. Δοκίμασε JPG ή PNG."); } render(); }
  });
  g.addEventListener("input", ev => { if(ev.target.id==="gq"){ filter=ev.target.value; render(); } });
  addEventListener("keydown", e => { if(e.key==="Escape" && zoom){ zoom=null; render(); } });
  addEventListener("hashchange", () => { const h=location.hash.slice(1); if(TABS.some(x=>x[0]===h) && h!==tab){ tab=h; render(); } });
  render();
  const byOrder = s => s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??1e9)-(b.order??1e9));
  const denied = name => () => { ready[name]=true; render(); };
  db.collection("vct_steps").onSnapshot(s=>{ steps=byOrder(s); ready.steps=true; render(); }, denied("steps"));
  db.collection("vct_tips").onSnapshot(s=>{ tips=byOrder(s); ready.tips=true; render(); }, denied("tips"));
  db.collection("vct_venues").limit(2000).onSnapshot(s=>{ venues=s.docs.map(d=>({id:d.id,...d.data()})); ready.venues=true; render(); }, denied("venues"));
})();

  })();
})();
