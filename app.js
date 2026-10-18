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
let steps=[], tips=[], venues=[], CATORDER=[], IMGS={steps:{}, tips:{}}, denied={}, ready={steps:false,tips:false,venues:false};
let tab = (location.hash||"").slice(1); if(!TABS.some(t=>t[0]===tab)) tab = "setup";
let tipCat = "Όλα", venueId = null, filter = "", sheet = null, zoom = null;   // zoom: {k, i, idx} — which item's photos are full screen, and which one
try{ venueId = localStorage.getItem("vct-venue"); }catch{}

/* Photos: up to MAXPH per step or tip. Each photo is its own document in the same collection ({imgOf: parentId, data}),
   so a step never reaches Firestore's 1 MB document limit; the parent keeps their order in `imgs`.
   Older items may still have a single `img` field, and `diagram: true` shows the official VideoCheck layout. */
const MAXPH = 4;
const LAYOUT = "img/videocheck-layout.jpg";
const LAYOUT_ALT = "Διάταξη VideoCheck: κάμερες γραμμών 1–8, C, D, κάμερες block Y, T, R, L, K, J, κάμερες φιλέ A, B, E, W, κάμερες U, I, κάμερα σκηνής S, Server 1, Server 2 και Server Main με UPS και πρίζα σούκο";
function photos(it, k){
  const out = [];
  if(it.diagram) out.push({src:LAYOUT, alt:LAYOUT_ALT, diagram:true});
  if(it.img) out.push({src:it.img, alt:it.title||"", legacy:true});
  (it.imgs||[]).forEach(id => { const d = IMGS[k] && IMGS[k][id]; if(d) out.push({src:d, alt:it.title||"", id}); });
  return out;
}
/* "big": first picture shown large (chosen per step/tip in the form; step 1 is large unless switched off) */
const isBig = (it, k, i) => !!photos(it,k).length && (it.big ?? (k==="steps" && i===0));
/* large picture; tap opens it full screen */
function bigPhoto(it, k, i){
  const ph = photos(it, k)[0]; if(!ph) return "";
  return `<div class="g-media${ph.diagram?" layout":""}"><button class="g-layout" data-act="zoom" data-k="${k}" data-i="${i}" data-n="0" aria-label="Μεγέθυνση φωτογραφίας">
    <img src="${ph.src}" ${ph.diagram?'width="1386" height="916"':""} alt="${esc(ph.alt)}" loading="lazy"><span>Πάτα για μεγέθυνση</span></button></div>`;
}
/* everything else: small thumbnails in a row */
function thumbs(it, k, i, from=0){
  const ph = photos(it, k); if(ph.length<=from) return "";
  return `<div class="g-thumbs">${ph.slice(from).map((p,n)=>`<button class="g-thumb" data-act="zoom" data-k="${k}" data-i="${i}" data-n="${n+from}" aria-label="Μεγέθυνση φωτογραφίας ${n+from+1} από ${ph.length}"><img src="${p.src}" alt="" loading="lazy"></button>`).join("")}</div>`;
}
function viewZoom(){
  if(!zoom) return "";
  const it = LIST(zoom.k)[zoom.i]; const ph = it ? photos(it, zoom.k) : [];
  if(!ph.length){ zoom=null; return ""; }
  const n = Math.min(zoom.idx, ph.length-1), p = ph[n], many = ph.length>1;
  return `<div class="g-zoom" role="dialog" aria-modal="true" aria-label="${esc(p.alt)}" data-act="unzoom">
    <button class="g-zoom-x" data-act="unzoom">Κλείσιμο ✕</button>
    ${many?`<span class="g-zoom-n">${n+1} / ${ph.length}</span>`:""}
    <div class="g-zoom-in" id="gzoomin"><img src="${p.src}" alt="${esc(p.alt)}" data-act="zoomfull"></div>
    ${many?`<button class="g-zoom-nav prev" data-act="zoomnav" data-d="-1" aria-label="Προηγούμενη" ${n===0?"disabled":""}>‹</button><button class="g-zoom-nav next" data-act="zoomnav" data-d="1" aria-label="Επόμενη" ${n===ph.length-1?"disabled":""}>›</button>`:""}
    <p class="g-zoom-hint">Πάτα την εικόνα για πλήρες μέγεθος${many?" · σύρε για την επόμενη":""}</p></div>`;
}
function zoomStep(d){
  if(!zoom) return; const it = LIST(zoom.k)[zoom.i]; const len = it ? photos(it, zoom.k).length : 0;
  const nx = zoom.idx + d; if(nx<0 || nx>=len) return; zoom.idx = nx; render();
}

/* V.C. Tips venues (own list, collection vct_venues): code (acronym), name, city, address, map (Google Maps link or "lat,lng"), notes */
const COORD = /^\s*-?\d{1,2}\.\d+\s*,\s*-?\d{1,3}\.\d+\s*$/;
function mapsUrl(v){
  if(/^https?:\/\//i.test(v.map||"")) return v.map;
  const q = COORD.test(v.map||"") ? v.map.replace(/\s/g,"") : (v.address ? [v.name, v.address].filter(Boolean).join(", ") : [v.name, v.city].filter(Boolean).join(", "));
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
}
const venueKey = v => norm(v.code || v.name);

function tools(kind, i, len, jUp=i-1, jDown=i+1){
  if(!edit) return "";
  const mv = kind==="venues" ? "" : `<button class="g-tb" data-act="up" data-k="${kind}" data-i="${i}" data-j="${jUp}" ${jUp<0?"disabled":""} aria-label="Μετακίνηση πάνω">↑</button>
    <button class="g-tb" data-act="down" data-k="${kind}" data-i="${i}" data-j="${jDown}" ${jDown<0||jDown>=len?"disabled":""} aria-label="Μετακίνηση κάτω">↓</button>`;
  return `<div class="g-tools"><button class="g-tb" data-act="edit" data-k="${kind}" data-i="${i}">✎ Επεξεργασία</button>${mv}
    <button class="g-tb del" data-act="del" data-k="${kind}" data-i="${i}">Διαγραφή</button></div>`;
}
/* shown instead of "nothing yet" when the database refused to read (rules not set, or not a Check Mate account) */
const deniedBox = () => emptyBox("Δεν υπάρχει πρόσβαση στο περιεχόμενο",
  `Ο λογαριασμός ${esc(me&&me.email||"")} δεν έχει δικαίωμα ανάγνωσης. ${isAdmin?"Πρόσθεσε τις τρεις γραμμές για τα vct_steps, vct_tips και vct_venues στους κανόνες του Firebase (βλ. README).":"Μίλησε με τον διαχειριστή."}`);
/* Text formatting for steps, tips and venue notes: a small, safe markup (the text is escaped first, then only these marks become HTML).
   **bold**  *italic*  ==highlight==  !!red!!  {πορτοκαλί:text} coloured label  lines "- " or "• " = bullets, "1. " = numbered, "## " = subheading, https:// links clickable */
/* colour tags, e.g. {πορτοκαλί:Y, T, R} → a coloured label, matching the camera colours of the layout */
const COLORS = {"μαύρο":"black","πορτοκαλί":"orange","κίτρινο":"yellow","μπλε":"blue","κόκκινο":"red","πράσινο":"green"};
function fmtInline(t){
  return t
    .replace(/\{(μαύρο|πορτοκαλί|κίτρινο|μπλε|κόκκινο|πράσινο):([^{}]+?)\}/g, (m,c,x)=>`<span class="g-chipc ${COLORS[c]}">${x}</span>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/!!(.+?)!!/g, '<span class="g-red">$1</span>')
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)»])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}
function fmt(text){
  const lines = esc(text||"").split("\n"); let out="", list=null, para=[];
  const flushPara = () => { if(para.length){ out += `<p>${para.map(fmtInline).join("<br>")}</p>`; para=[]; } };
  const flushList = () => { if(list){ out += `<${list.tag}>${list.items.map(x=>`<li>${fmtInline(x)}</li>`).join("")}</${list.tag}>`; list=null; } };
  for(const raw of lines){
    const ln = raw.trimEnd(); let m;
    if((m = ln.match(/^\s*(?:[-•·]|\*(?!\*))\s+(.*)$/))){ flushPara(); if(!list||list.tag!=="ul"){ flushList(); list={tag:"ul",items:[]}; } list.items.push(m[1]); }
    else if((m = ln.match(/^\s*\d+[.)]\s+(.*)$/))){ flushPara(); if(!list||list.tag!=="ol"){ flushList(); list={tag:"ol",items:[]}; } list.items.push(m[1]); }
    else if((m = ln.match(/^##\s+(.*)$/))){ flushPara(); flushList(); out += `<h4>${fmtInline(m[1])}</h4>`; }
    else if(!ln.trim()){ flushPara(); flushList(); }
    else { flushList(); para.push(ln); }
  }
  flushPara(); flushList(); return out;
}
/* toolbar above a text box: wraps the selection, or prefixes the selected lines */
function fmtBar(k){
  const b = (act, label, title) => `<button type="button" class="g-fb" data-act="fmt" data-f="${act}" data-t="${k}" title="${title}" aria-label="${title}">${label}</button>`;
  return `<div class="g-fbar" role="toolbar" aria-label="Μορφοποίηση">${b("b","<b>B</b>","Έντονα")}${b("i","<i>I</i>","Πλάγια")}${b("mark",'<mark>A</mark>',"Επισήμανση")}${b("red",'<span class="g-red">A</span>',"Κόκκινα")}<span class="g-fsep"></span>${Object.entries(COLORS).map(([gr,en])=>b("c:"+gr,`<span class="g-sw ${en}"></span>`,"Ετικέτα: "+gr)).join("")}<span class="g-fsep"></span>${b("ul","•","Κουκκίδες")}${b("ol","1.","Αρίθμηση")}${b("h","Τ","Υπότιτλος")}</div>`;
}
function applyFmt(f, id){
  const ta = $("gf-"+id); if(!ta) return;
  const v = ta.value, a = ta.selectionStart, z = ta.selectionEnd, sel = v.slice(a,z);
  const wrap = f.startsWith("c:") ? ["{"+f.slice(2)+":","}"] : {b:["**","**"], i:["*","*"], mark:["==","=="], red:["!!","!!"]}[f];
  let nv, na, nz;
  if(wrap){
    const inner = sel || "κείμενο";
    nv = v.slice(0,a) + wrap[0] + inner + wrap[1] + v.slice(z); na = a + wrap[0].length; nz = na + inner.length;
  } else {
    const ls = v.lastIndexOf("\n", a-1) + 1, le = z > a && v[z-1]==="\n" ? z-1 : (v.indexOf("\n", z) < 0 ? v.length : v.indexOf("\n", z));
    const block = v.slice(ls, le).split("\n").map((l,n) => {
      const bare = l.replace(/^\s*(?:[-•·]\s+|\d+[.)]\s+|##\s+)/, "");
      return f==="ul" ? "- "+bare : f==="ol" ? `${n+1}. `+bare : "## "+bare; }).join("\n");
    nv = v.slice(0,ls) + block + v.slice(le); na = ls; nz = ls + block.length;
  }
  ta.value = nv; ta.focus(); ta.setSelectionRange(na, nz);
  const pv = $("gp-"+id); if(pv) pv.innerHTML = fmt(nv);
}

function emptyBox(title, sub, extra=""){ return `<div class="g-empty"><strong>${title}</strong><div>${sub}</div>${extra}</div>`; }

function viewSetup(){
  if(!ready.steps) return `<h1 class="g-h1">Στήσιμο video check</h1><p class="g-lede">Φόρτωση…</p>`;
  const n = steps.length;
  const empty = denied.steps && !n ? deniedBox() : isAdmin
    ? emptyBox("Δεν υπάρχουν βήματα ακόμα", "Πρόσθεσε το πρώτο βήμα ή φόρτωσε ένα αρχικό πρόχειρο που αλλάζεις μετά.", `<button class="g-btn" data-act="seed" data-k="steps">Φόρτωση αρχικού προχείρου</button>`)
    : emptyBox("Δεν υπάρχουν βήματα ακόμα", "Θα προστεθούν σύντομα.");
  return `<h1 class="g-h1">Στήσιμο video check</h1><p class="g-lede">Τα βήματα με τη σειρά, από τη στιγμή της ανάθεσης μέχρι την αποχώρηση από το γήπεδο.</p>
  <div class="g-list">${n ? steps.map((s,i)=>`<article class="g-step">
    ${isBig(s,"steps",i) ? bigPhoto(s,"steps",i) : ""}
    <div class="g-body"><span class="g-num">ΒΗΜΑ ${i+1} / ${n}</span><h2>${esc(s.title)}</h2><div class="g-rich">${fmt(s.text)}</div>${thumbs(s,"steps",i,isBig(s,"steps",i)?1:0)}${tools("steps",i,n)}</div></article>`).join("") : empty}
  ${edit?`<button class="g-add" data-act="new" data-k="steps">+ Νέο βήμα</button>`:""}</div>`;
}

/* category order: chosen by the admins, stored in vct_tips/_cats {order:[names]}; categories not in it follow alphabetically */
const catRank = c => { const n=CATORDER.indexOf(c); return n<0 ? 1e6 : n; };
const tipCats = () => [...new Set(tips.map(t=>t.cat).filter(Boolean))].sort((a,b)=>catRank(a)-catRank(b) || a.localeCompare(b,"el"));
async function saveCatOrder(order){ await db.doc("vct_tips/_cats").set({order}); }
/* tip form: pick an existing category, none, or type a new one */
function catField(cur){
  const cats = tipCats(), isNew = sheet.newCat || (cur && !cats.includes(cur));
  return `<div class="g-field"><label for="gf-cat">Κατηγορία</label>
    <select class="g-in" id="gf-cat"><option value="" ${!cur&&!isNew?"selected":""}>— Χωρίς κατηγορία —</option>
      ${cats.map(c=>`<option value="${esc(c)}" ${c===cur&&!isNew?"selected":""}>${esc(c)}</option>`).join("")}
      <option value="__new" ${isNew?"selected":""}>+ Νέα κατηγορία…</option></select>
    ${isNew?`<input class="g-in" id="gf-catnew" placeholder="Όνομα νέας κατηγορίας" value="${esc(cats.includes(cur)?"":cur||"")}" autocomplete="off">`:""}</div>`;
}
/* edit mode on the Tips tab: rename or remove a category for every tip that has it */
function viewCats(){
  const cats = tipCats(); if(!cats.length) return "";
  return `<section class="g-tip g-cats" style="border-left-color:var(--blue)"><h3>Κατηγορίες</h3>
    <p class="g-txt" style="color:var(--muted)">Νέα κατηγορία προσθέτεις από ένα tip: «+ Νέο tip» ή ✎ → Κατηγορία → «+ Νέα κατηγορία…». Εδώ αλλάζεις σειρά (↑ ↓), όνομα (✓) ή αφαιρείς μια κατηγορία από όλα τα tips της (✕). Ο αριθμός δείχνει πόσα tips έχει.</p>
    ${cats.map((c,n)=>`<div class="g-catrow"><span class="g-catmv"><button class="g-tb" data-act="catmv" data-n="${n}" data-d="-1" ${n===0?"disabled":""} aria-label="Μετακίνηση πάνω">↑</button><button class="g-tb" data-act="catmv" data-n="${n}" data-d="1" ${n===cats.length-1?"disabled":""} aria-label="Μετακίνηση κάτω">↓</button></span><input class="g-in" id="gcat-${n}" value="${esc(c)}" aria-label="Όνομα κατηγορίας ${esc(c)}"><span class="g-catn">${tips.filter(t=>t.cat===c).length}</span>
      <button class="g-tb" data-act="catren" data-n="${n}" aria-label="Αποθήκευση ονόματος" title="Αποθήκευση ονόματος">✓</button><button class="g-tb del" data-act="catdel" data-n="${n}" aria-label="Αφαίρεση κατηγορίας" title="Αφαίρεση κατηγορίας">✕</button></div>`).join("")}
  </section>`;
}
async function renameCat(from, to){
  const b=db.batch(); tips.filter(t=>t.cat===from).forEach(t=>b.update(db.doc(`vct_tips/${t.id}`), {cat:to}));
  const order=tipCats().map(c=>c===from?to:c).filter((c,n,a)=>c && a.indexOf(c)===n); b.set(db.doc("vct_tips/_cats"), {order});
  await b.commit();
  if(tipCat===from) tipCat = to || "Όλα";
}

function viewTips(){
  if(!ready.tips) return `<h1 class="g-h1">Tips</h1><p class="g-lede">Φόρτωση…</p>`;
  const cats = ["Όλα", ...tipCats()];
  if(!cats.includes(tipCat)) tipCat = "Όλα";
  const list = tips.map((t,i)=>[t,i]).filter(([t])=>tipCat==="Όλα"||t.cat===tipCat)
    .sort((a,b)=>(a[0].cat?catRank(a[0].cat):2e6)-(b[0].cat?catRank(b[0].cat):2e6) || (a[0].cat||"").localeCompare(b[0].cat||"","el") || a[1]-b[1]);
  /* ↑ ↓ on a tip swap it with the neighbouring tip of the same category */
  const nb = (n, d) => { for(let m=n+d; m>=0 && m<list.length; m+=d) if((list[m][0].cat||"")===(list[n][0].cat||"")) return list[m][1]; return -1; };
  const empty = denied.tips && !tips.length ? deniedBox() : !tips.length
    ? (isAdmin ? emptyBox("Δεν υπάρχουν tips ακόμα", "Πρόσθεσε το πρώτο ή φόρτωσε ένα αρχικό πρόχειρο.", `<button class="g-btn" data-act="seed" data-k="tips">Φόρτωση αρχικού προχείρου</button>`)
               : emptyBox("Δεν υπάρχουν tips ακόμα", "Θα προστεθούν σύντομα."))
    : emptyBox("Κανένα tip σε αυτή την κατηγορία", "");
  return `<h1 class="g-h1">Tips</h1><p class="g-lede">Μικρές λεπτομέρειες που γλιτώνουν προβλήματα στον αγώνα.</p>
  ${edit?viewCats():""}
  ${tips.length?`<div class="g-chips" role="toolbar" aria-label="Κατηγορίες">${cats.map(c=>`<button class="g-chip" data-act="cat" data-c="${esc(c)}" aria-pressed="${c===tipCat}">${esc(c)}</button>`).join("")}</div>`:""}
  <div class="g-list">${list.length ? list.map(([t,i],pos)=>`<article class="g-tip">${t.cat?`<span><span class="g-tag">${esc(t.cat)}</span></span>`:""}<h3>${esc(t.title)}</h3>${isBig(t,"tips",i) ? bigPhoto(t,"tips",i) : ""}<div class="g-rich">${fmt(t.text)}</div>${thumbs(t,"tips",i,isBig(t,"tips",i)?1:0)}${tools("tips",i,tips.length,nb(pos,-1),nb(pos,1))}</article>`).join("") : empty}
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
    <div class="bd">${cur.address||cur.notes?`<dl class="g-kv">${cur.address?`<dt>Διεύθυνση</dt><dd>${esc(cur.address)}</dd>`:""}${cur.notes?`<dt>Σημειώσεις</dt><dd class="g-rich">${fmt(cur.notes)}</dd>`:""}</dl>`:""}
    <div class="g-row"><a class="g-btn" href="${esc(mapsUrl(cur))}" target="_blank" rel="noopener">${ICON.venues} Οδηγίες Google Maps</a>${cur.address?`<button class="g-btn ghost" data-act="copy">Αντιγραφή διεύθυνσης</button>`:""}</div>
    ${tools("venues",ci,venues.length)}</div></article>`
   : venues.length ? emptyBox("Επίλεξε γήπεδο από τη λίστα","") : denied.venues ? deniedBox() : emptyAll}
  ${venues.length?`<div class="g-mini">${shown.map(v=>`<button data-act="pick" data-id="${v.id}" aria-current="${v.id===venueId}"><span class="c ${v.code?"":"none"}">${esc(v.code||"—")}</span><span class="n">${esc(v.name)}</span></button>`).join("")}</div>`:""}
  ${edit?`<div class="g-list" style="margin-top:14px"><button class="g-add" data-act="new" data-k="venues">+ Νέο γήπεδο</button><button class="g-add" data-act="import">Εισαγωγή λίστας γηπέδων</button></div>`:""}`;
}

const FORMS = {
  steps:[["title","Τίτλος βήματος","input"],["text","Οδηγίες","textarea"],["img","Φωτογραφίες (έως 4)","image"],["big","Η πρώτη φωτογραφία ανοιχτή σε μεγάλο μέγεθος","check"]],
  tips:[["cat","Κατηγορία","cat"],["title","Τίτλος","input"],["text","Κείμενο","textarea"],["img","Φωτογραφίες (προαιρετικές, έως 4)","image"],["big","Η πρώτη φωτογραφία ανοιχτή σε μεγάλο μέγεθος","check"]],
  venues:[["code","Αρκτικόλεξο","input"],["name","Όνομα γηπέδου","input"],["city","Πόλη / περιοχή","input"],["address","Διεύθυνση (για το Google Maps)","input"],["map","Σύνδεσμος Google Maps ή συντεταγμένες (προαιρετικό)","input"],["notes","Σημειώσεις (πρόσβαση, πάρκινγκ, υπεύθυνος γηπέδου)","textarea"]],
};
const NAMES = {steps:"βήμα", tips:"tip", venues:"γήπεδο"};
const LIST = k => k==="steps"?steps:k==="tips"?tips:venues;
const COL = k => k==="steps"?"vct_steps":k==="tips"?"vct_tips":"vct_venues";

function viewSheet(){
  if(!sheet) return "";
  if(sheet.kind==="export") return `<div class="g-sheet" data-act="closebg"><div class="g-pane" role="dialog" aria-modal="true" aria-labelledby="gsh">
    <h2 id="gsh">Όλα τα κείμενα</h2><p class="g-lede" style="margin:0">Κράτα πατημένο μέσα στο κουτί → Επιλογή όλων → Αντιγραφή.</p>
    <textarea class="g-in" style="min-height:320px" readonly>${esc(sheet.txt)}</textarea>
    <div class="g-row"><button class="g-btn ghost" data-act="close">Κλείσιμο</button></div></div></div>`;
  if(sheet.kind==="import") return `<div class="g-sheet" data-act="closebg"><div class="g-pane" role="dialog" aria-modal="true" aria-labelledby="gsh">
    <h2 id="gsh">Εισαγωγή λίστας γηπέδων</h2>
    <p class="g-lede" style="margin:0">Ένα γήπεδο ανά γραμμή: <b>Αρκτικόλεξο ; Όνομα ; Πόλη ; Διεύθυνση</b>. Μπορείς να επικολλήσεις στήλες από Excel. Αν το αρκτικόλεξο υπάρχει ήδη, το γήπεδο ενημερώνεται· αλλιώς προστίθεται.</p>
    <textarea class="g-in" id="gimp" style="min-height:200px" placeholder="ΣΕΦ ; Στάδιο Ειρήνης και Φιλίας ; Νέο Φάληρο ; Εθνάρχου Μακαρίου"></textarea>
    <div class="g-row"><button class="g-btn" data-act="doimport">Αποθήκευση</button><button class="g-btn ghost" data-act="close">Άκυρο</button></div></div></div>`;
  const it = sheet.item;
  return `<div class="g-sheet" data-act="closebg"><div class="g-pane" role="dialog" aria-modal="true" aria-labelledby="gsh">
    <h2 id="gsh">${sheet.id?"Επεξεργασία: ":"Νέο "}${NAMES[sheet.kind]}</h2>
    ${FORMS[sheet.kind].map(([k,l,t])=>t==="check" ? `<label class="g-check"><input type="checkbox" id="gf-${k}" ${(it.big ?? (sheet.kind==="steps" && sheet.id && LIST("steps")[0]?.id===sheet.id))?"checked":""}> ${l}</label>`
      : t==="cat" ? catField(it[k])
      : t==="image"
      ? `<div class="g-field"><label for="gf-${k}">${l}</label>
          ${sheet.photos.length?`<div class="g-phedit">${sheet.photos.map((p,n)=>`<div class="ph"><img src="${p.src}" alt="">
            <div class="phb">${n>0?`<button class="g-tb" type="button" data-act="phmove" data-n="${n}" data-d="-1" aria-label="Μετακίνηση αριστερά">‹</button>`:""}<button class="g-tb del" type="button" data-act="phdel" data-n="${n}" aria-label="Αφαίρεση φωτογραφίας">✕</button></div></div>`).join("")}</div>`:""}
          ${sheet.photos.filter(p=>!p.diagram).length<MAXPH?`<label class="g-addph"><input type="file" id="gf-${k}" accept="image/*" multiple>${sheet.photos.filter(p=>!p.diagram).length?`+ Προσθήκη κι άλλης φωτογραφίας (${sheet.photos.filter(p=>!p.diagram).length}/${MAXPH})`:"+ Προσθήκη φωτογραφιών"}</label>
            <p class="g-lede" style="margin:0;font-size:13px">Αν το κινητό σου δεν αφήνει να διαλέξεις πολλές μαζί, πρόσθεσέ τες μία-μία.</p>`:`<p class="g-lede" style="margin:0">Έφτασες τις ${MAXPH} φωτογραφίες. Αφαίρεσε μία για να βάλεις άλλη.</p>`}</div>`
      : `<div class="g-field"><label for="gf-${k}">${l}</label>${t==="textarea"?`${fmtBar(k)}<textarea class="g-in" id="gf-${k}">${esc(it[k])}</textarea>
          <details class="g-fmthelp"><summary>Προεπισκόπηση και οδηγίες μορφοποίησης</summary><div class="g-rich g-prev" id="gp-${k}">${fmt(it[k])}</div>
          <p>**έντονα** · *πλάγια* · ==επισήμανση== · !!κόκκινα!! · {πορτοκαλί:Y, T, R} = χρωματιστή ετικέτα (μαύρο, πορτοκαλί, κίτρινο, μπλε, κόκκινο, πράσινο) · γραμμή που αρχίζει με «- » = κουκκίδα, «1. » = αρίθμηση, «## » = υπότιτλος. Οι σύνδεσμοι (https://…) γίνονται αυτόματα κλικ.</p></details>`:`<input class="g-in" id="gf-${k}" value="${esc(it[k])}" ${k==="cat"?'list="gcats"':""}>`}</div>`).join("")}
    <div class="g-row"><button class="g-btn" data-act="saveitem">Αποθήκευση</button><button class="g-btn ghost" data-act="close">Άκυρο</button></div></div></div>`;
}

function render(){
  const sy = window.scrollY, gq = document.activeElement && document.activeElement.id==="gq" ? document.activeElement.selectionStart : null;
  $("gapp").innerHTML = `<header class="g-top"><div class="g-wrap">
      <div class="g-brand"><div><b>V.C. <span>Tips</span></b><small>Οδηγός στησίματος</small></div></div><span class="g-sp"></span>
      ${isAdmin?`<button class="g-pill" data-act="toggle" aria-pressed="${edit}">${edit?"Τέλος":"✎ Επεξεργασία"}</button>`:""}
</div></header>
    ${navigator.onLine===false?`<div class="g-offline" role="status">Χωρίς σύνδεση · βλέπεις ό,τι είχε φορτωθεί την τελευταία φορά${edit?". Οι αλλαγές θα αποθηκευτούν μόλις επανέλθει η σύνδεση.":""}</div>`:""}
    <main class="g-main g-wrap">${tab==="setup"?viewSetup():tab==="tips"?viewTips():viewVenues()}
      ${edit?`<div class="g-export"><button class="g-btn ghost" data-act="exporttext">Αντιγραφή όλων των κειμένων</button><p class="g-lede" style="margin:0;font-size:13px">Βήματα, tips και σημειώσεις γηπέδων σε απλό κείμενο, π.χ. για έλεγχο διατύπωσης.</p></div>`:""}
      ${me&&me.email?`<p class="g-who">Συνδεδεμένος: ${esc(me.email)}${isAdmin?" · διαχειριστής":""}</p>`:""}</main>
    <nav class="g-tabs" aria-label="Ενότητες"><div class="in">${TABS.map(([k,l])=>`<a href="#${k}" data-act="tab" data-t="${k}" ${tab===k?'aria-current="page"':""}>${ICON[k]}${l}</a>`).join("")}</div></nav>
    ${viewSheet()}${viewZoom()}`;
  window.scrollTo(0, sy);
  if(gq!==null){ const q=$("gq"); if(q){ q.focus(); try{ q.setSelectionRange(gq,gq); }catch{} } }
}

function resizeImage(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{
  const max=1600, s=Math.min(1,max/Math.max(im.width,im.height)); const c=document.createElement("canvas"); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s);
  c.getContext("2d").drawImage(im,0,0,c.width,c.height); let q=.8, out=c.toDataURL("image/jpeg",q); while(out.length>850000 && q>.35){ q-=.1; out=c.toDataURL("image/jpeg",q); } res(out); };
  im.onerror=rej; im.src=r.result; }; r.onerror=rej; r.readAsDataURL(file); }); }

function readSheet(){ if(!sheet||!FORMS[sheet.kind]) return; for(const [k,,t] of FORMS[sheet.kind]){ if(t==="image") continue;
  if(t==="check"){ const c=$("gf-"+k); if(c) sheet.item[k]=c.checked; continue; }
  if(t==="cat"){ const sel=$("gf-cat"), nw=$("gf-catnew"); if(sel) sheet.item.cat = sel.value==="__new" ? (nw?nw.value.trim():"") : sel.value; continue; }
  const f=$("gf-"+k); if(f) sheet.item[k]=f.value.trim(); } }
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
    case "fmt": applyFmt(el.dataset.f, el.dataset.t); break;
    case "exporttext": {
      const parts = ["ΣΤΗΣΙΜΟ"];
      steps.forEach((x,n)=>parts.push(`\n[Βήμα ${n+1}] ${x.title||""}\n${x.text||""}`));
      parts.push("\n\nTIPS");
      tips.forEach((x,n)=>parts.push(`\n[Tip ${n+1}${x.cat?" · "+x.cat:""}] ${x.title||""}\n${x.text||""}`));
      const vn = venues.filter(v=>v.notes);
      if(vn.length){ parts.push("\n\nΣΗΜΕΙΩΣΕΙΣ ΓΗΠΕΔΩΝ"); vn.forEach(v=>parts.push(`\n[${v.code||v.name}] ${v.notes}`)); }
      const txt = parts.join("\n");
      try{ await navigator.clipboard.writeText(txt); toast("Αντιγράφηκαν. Επικόλλησέ τα όπου θέλεις."); }
      catch{ sheet={kind:"export", txt}; render(); }
      break; }
    case "catmv": { const cs=tipCats(), n=+el.dataset.n, m=n+(+el.dataset.d); if(m<0||m>=cs.length) break;
      [cs[n],cs[m]]=[cs[m],cs[n]]; CATORDER=cs; render(); try{ await saveCatOrder(cs); }catch{ fail(); } break; }
    case "catren": { const from=tipCats()[+el.dataset.n], to=($("gcat-"+el.dataset.n).value||"").trim();
      if(!to){ toast("Γράψε όνομα, ή πάτα Αφαίρεση"); break; } if(to===from) break;
      try{ await renameCat(from, to); toast("Η κατηγορία μετονομάστηκε"); }catch{ fail(); } break; }
    case "catdel":
      if(!el.classList.contains("armed")){ el.classList.add("armed"); el.textContent="Σίγουρα;"; setTimeout(()=>{ if(el.isConnected){ el.classList.remove("armed"); el.textContent="✕"; } },3000); }
      else { const from=tipCats()[+el.dataset.n]; try{ await renameCat(from, ""); toast("Τα tips της έμειναν χωρίς κατηγορία"); }catch{ fail(); } }
      break;
    case "zoom": zoom={k, i, idx:+el.dataset.n||0}; render(); break;
    case "zoomnav": zoomStep(+el.dataset.d); break;
    case "zoomfull": el.closest(".g-zoom-in").classList.toggle("full"); break;
    case "unzoom": if(ev.target===el || ev.target.classList.contains("g-zoom-in") || el.classList.contains("g-zoom-x")){ zoom=null; render(); } break;
    case "pick": pickVenue(el.dataset.id); window.scrollTo({top:0,behavior:"smooth"}); break;
    case "copy": { const v=venues.find(x=>x.id===venueId); const txt=v.address||v.name; try{ await navigator.clipboard.writeText(txt); toast("Η διεύθυνση αντιγράφηκε"); }catch{ toast(txt); } break; }
    case "up": case "down": { const arr=LIST(k), j=+el.dataset.j; if(!(j>=0&&j<arr.length)) break;
      try{ const b=db.batch(); b.update(db.doc(`${COL(k)}/${arr[i].id}`),{order:j}); b.update(db.doc(`${COL(k)}/${arr[j].id}`),{order:i});
        arr.forEach((x,n)=>{ if(n!==i&&n!==j&&x.order!==n) b.update(db.doc(`${COL(k)}/${x.id}`),{order:n}); }); await b.commit(); }catch{ fail(); } break; }
    case "del":
      if(!el.classList.contains("armed")){ el.classList.add("armed"); el.textContent="Σίγουρα; Πάτα ξανά"; setTimeout(()=>{ if(el.isConnected){ el.classList.remove("armed"); el.textContent="Διαγραφή"; } },3000); }
      else { const it=LIST(k)[i]; try{ const b=db.batch(); b.delete(db.doc(`${COL(k)}/${it.id}`)); (it.imgs||[]).forEach(id=>b.delete(db.doc(`${COL(k)}/${id}`))); await b.commit(); toast("Διαγράφηκε"); }catch{ fail(); } }
      break;
    case "new": sheet={kind:k, id:null, item: k==="tips"&&tipCat!=="Όλα" ? {cat:tipCat} : {}, photos:[]}; render(); break;
    case "edit": { const it=LIST(k)[i]; sheet={kind:k, id:it.id, item:{...it}, photos: k==="venues"?[]:photos(it,k)}; render(); break; }
    case "close": case "closebg": sheet=null; render(); break;
    case "phdel": readSheet(); sheet.photos.splice(+el.dataset.n,1); render(); break;
    case "phmove": { readSheet(); const n=+el.dataset.n, ph=sheet.photos; [ph[n-1],ph[n]]=[ph[n],ph[n-1]]; render(); break; }
    case "saveitem": {
      readSheet(); const it=sheet.item, kind=sheet.kind;
      if(kind==="tips" && sheet.newCat && !it.cat){ toast("Γράψε το όνομα της νέας κατηγορίας"); break; }
      if(!(it.title||it.name)){ toast(kind==="venues"?"Συμπλήρωσε το όνομα του γηπέδου":"Συμπλήρωσε τίτλο"); break; }
      const data={...it}; delete data.id;
      el.disabled=true; el.textContent="Αποθήκευση…";
      try{
        const col=db.collection(COL(kind)), ref = sheet.id ? col.doc(sheet.id) : col.doc();
        if(!sheet.id && kind!=="venues") data.order=LIST(kind).length;
        const b=db.batch();
        if(kind!=="venues"){
          /* every photo becomes its own document; photos removed in the form are deleted */
          delete data.img; data.imgs=[]; data.diagram=false;
          for(const p of sheet.photos){
            if(p.diagram){ data.diagram=true; continue; }
            if(p.id){ data.imgs.push(p.id); continue; }
            const pr=col.doc(); b.set(pr, {imgOf:ref.id, data:p.src}); data.imgs.push(pr.id);
          }
          (it.imgs||[]).filter(id=>!data.imgs.includes(id)).forEach(id=>b.delete(col.doc(id)));
        }
        b.set(ref, data);
        await b.commit();
        if(kind==="venues" && !sheet.id){ venueId=ref.id; try{ localStorage.setItem("vct-venue", venueId); }catch{} }
        sheet=null; toast("Αποθηκεύτηκε"); render();
      }catch(e){ el.disabled=false; el.textContent="Αποθήκευση"; toast(/size|large|exceed/i.test(e?.message||"")?"Η φωτογραφία είναι πολύ μεγάλη. Δοκίμασε μικρότερη.":"Η αποθήκευση απέτυχε. Δοκίμασε ξανά."); }
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
    else if(t.id==="gf-cat"){ readSheet(); sheet.newCat = t.value==="__new"; if(!sheet.newCat) sheet.item.cat=t.value; render(); if(sheet.newCat){ const n=$("gf-catnew"); if(n) n.focus(); } }
    else if(t.id==="gf-img" && t.files.length){
      readSheet();
      const room = MAXPH - sheet.photos.filter(p=>!p.diagram).length, files=[...t.files].slice(0, Math.max(0,room));
      if(t.files.length>room) toast(`Μπαίνουν έως ${MAXPH} φωτογραφίες· κράτησα τις πρώτες ${files.length}.`);
      for(const f of files){ try{ sheet.photos.push({src: await resizeImage(f)}); }catch{ toast("Δεν άνοιξε μία εικόνα. Δοκίμασε JPG ή PNG."); } }
      render();
    }
  });
  g.addEventListener("input", ev => { if(ev.target.id==="gq"){ filter=ev.target.value; render(); }
    else if(/^gf-(text|notes)$/.test(ev.target.id)){ const pv=$("gp-"+ev.target.id.slice(3)); if(pv) pv.innerHTML=fmt(ev.target.value); } });
  addEventListener("online", render); addEventListener("offline", render);
  addEventListener("keydown", e => { if(!zoom) return; if(e.key==="Escape"){ zoom=null; render(); } else if(e.key==="ArrowRight") zoomStep(1); else if(e.key==="ArrowLeft") zoomStep(-1); });
  /* swipe left/right in the full-screen viewer (not while viewing at actual size) */
  let sx=null, sy0=null;
  g.addEventListener("touchstart", e => { if(zoom && !e.target.closest(".g-zoom-in.full")){ sx=e.touches[0].clientX; sy0=e.touches[0].clientY; } }, {passive:true});
  g.addEventListener("touchend", e => { if(sx===null) return; const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy0; sx=null;
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5) zoomStep(dx<0?1:-1); }, {passive:true});
  addEventListener("hashchange", () => { const h=location.hash.slice(1); if(TABS.some(x=>x[0]===h) && h!==tab){ tab=h; render(); } });
  render();
  /* photo documents ({imgOf}) live next to the items; split them out */
  const split = (k, s) => { const items=[], im={}; s.docs.forEach(d=>{ const x=d.data(); if(d.id==="_cats"){ CATORDER=x.order||[]; return; } if(x.imgOf) im[d.id]=x.data; else items.push({id:d.id,...x}); });
    IMGS[k]=im; return items.sort((a,b)=>(a.order??1e9)-(b.order??1e9)); };
  const onDenied = name => err => { console.warn(name, err && err.code); denied[name]=true; ready[name]=true; render(); };
  db.collection("vct_steps").onSnapshot(s=>{ steps=split("steps",s); ready.steps=true; render(); }, onDenied("steps"));
  db.collection("vct_tips").onSnapshot(s=>{ tips=split("tips",s); ready.tips=true; render(); }, onDenied("tips"));
  db.collection("vct_venues").limit(2000).onSnapshot(s=>{ venues=s.docs.map(d=>({id:d.id,...d.data()})); ready.venues=true; render(); }, onDenied("venues"));
})();

  })();
})();
