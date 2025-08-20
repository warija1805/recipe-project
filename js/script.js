/* Aurora Gourmet — Extravagant Recipe Finder (HTML/CSS/JS only)
   Features:
   - Mock data (offline) + clean mapping for a future API swap
   - Search + autosuggest + keyboard shortcuts
   - Cuisine chips, healthy/veggie toggles
   - Magazine-style glass cards with flags
   - Full-screen modal: ingredients (checkboxes), instructions, fun fact
   - Favorites with localStorage + favorites-only filter
   - Surprise Me
   - Voice Search (Web Speech API, if available)
   - Shopping List drawer (persisted)
   - Skeletons, staggered animations, toasts, print
*/

const STORAGE = {
  favs: "aurora_favorites",
  list: "aurora_list"
};

const RECIPES = [
  { id:"r1", name:"Truffle Tagliatelle", country:"Italy", code:"IT", cuisine:"Italian", healthy:false, veg:true,
    img:"https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop",
    ingredients:["Fresh tagliatelle 250g","Truffle butter 2 tbsp","Parmesan 40g","Garlic 1 clove","Salt","Pepper"],
    steps:[
      "Boil pasta until al dente.",
      "Melt truffle butter with garlic.",
      "Toss pasta with butter and parmesan.",
      "Finish with pepper and serve."
    ],
    fact:"Northern Italian luxury — simple, rich, unforgettable." },

  { id:"r2", name:"Chicken Biryani", country:"India", code:"IN", cuisine:"Indian", healthy:false, veg:false,
    img:"https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1200&auto=format&fit=crop",
    ingredients:["Basmati rice 2 cups","Chicken 500g","Yogurt 1/2 cup","Garam masala 2 tsp","Onions 2","Saffron"],
    steps:["Marinate chicken in yogurt + spices.","Fry onions until golden.","Layer rice & chicken; cook on dum.","Garnish with fried onions & saffron."],
    fact:"A royal dish blending Persian technique and Indian spices." },

  { id:"r3", name:"Sushi Platter", country:"Japan", code:"JP", cuisine:"Japanese", healthy:true, veg:false,
    img:"https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
    ingredients:["Sushi rice","Nori","Fresh fish","Wasabi","Soy sauce","Pickled ginger"],
    steps:["Cook seasoned sushi rice.","Prepare fillings.","Roll & slice neatly.","Serve with wasabi & soy."],
    fact:"Edomae sushi began as fast street food in Tokyo." },

  { id:"r4", name:"French Crème Brûlée", country:"France", code:"FR", cuisine:"French", healthy:false, veg:true,
    img:"https://images.unsplash.com/photo-1532635042-6b9f9b0f1c86?q=80&w=1200&auto=format&fit=crop",
    ingredients:["Cream 500ml","Egg yolks 4","Sugar 80g","Vanilla","Caster sugar (top)"],
    steps:["Heat cream & vanilla.","Temper yolks with warm cream.","Bake in bain-marie until set.","Chill, then torch sugar top."],
    fact:"‘Burnt cream’ crackle is the hallmark of this classic." },

  { id:"r5", name:"Mexican Street Tacos", country:"Mexico", code:"MX", cuisine:"Mexican", healthy:true, veg:false,
    img:"https://images.unsplash.com/photo-1601924994987-69e26d0d000d?q=80&w=1200&auto=format&fit=crop",
    ingredients:["Corn tortillas","Grilled meat","Onion","Cilantro","Salsa","Lime"],
    steps:["Warm tortillas.","Fill with grilled meat, onion, cilantro.","Top with salsa & lime.","Serve immediately."],
    fact:"Small, bold, handheld flavor bombs — the street food icon." },

  { id:"r6", name:"Shakshuka", country:"Tunisia", code:"TN", cuisine:"Middle Eastern", healthy:true, veg:true,
    img:"https://images.unsplash.com/photo-1551183053-8c5f8f3b6c37?q=80&w=1200&auto=format&fit=crop",
    ingredients:["Tomatoes","Eggs","Onion","Peppers","Cumin","Olive oil","Salt"],
    steps:["Simmer tomatoes & spices.","Make wells; crack eggs.","Cover & cook till set.","Serve with bread."],
    fact:"Beloved across North Africa and the Middle East." }
];

const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* ---------- State ---------- */
let state = {
  recipes: RECIPES,
  query: "",
  favs: loadFavs(),
  onlyFavs: false,
  cuisine: "all",
  healthy: false,
  veggie: false,
  list: loadList()
};

/* ---------- Init ---------- */
const grid = qs("#cards-grid");
const search = qs("#search");
const suggestions = qs("#suggestions");
const randomBtn = qs("#random-btn");
const favToggle = qs("#favorites-toggle");
const heroTitle = qs("#hero-title");
const dailyFeature = qs("#daily-feature");
const cuisineChips = qs("#cuisine-chips");
const healthyToggle = qs("#healthy-toggle");
const veggieToggle = qs("#veggie-toggle");
const voiceBtn = qs("#voice-btn");

const modal = qs("#modal");
const modalBackdrop = qs("#modal-backdrop");
const modalClose = qs("#modal-close");
const modalHero = qs("#modal-hero");
const modalTitle = qs("#modal-title");
const modalFlag = qs("#modal-flag");
const modalCountry = qs("#modal-country");
const modalCuisine = qs("#modal-cuisine");
const modalIngredients = qs("#modal-ingredients");
const modalInstructions = qs("#modal-instructions");
const modalFav = qs("#modal-fav");
const modalPrint = qs("#modal-print");
const modalAddAll = qs("#modal-add-all");
const modalFact = qs("#modal-fact");

const drawer = qs("#drawer");
const drawerClose = qs("#drawer-close");
const drawerClear = qs("#drawer-clear");
const drawerExport = qs("#drawer-export");
const drawerList = qs("#drawer-list");
const drawerAdd = qs("#drawer-add");
const drawerInput = qs("#drawer-input");
const shoppingBtn = qs("#shopping-btn");

const help = qs("#help");
const helpBackdrop = qs("#help-backdrop");
const helpClose = qs("#help-close");
const toasts = qs("#toasts");

/* ---------- Boot ---------- */
init();
function init(){
  // cuisine chips
  const cuisines = ["all", ...new Set(state.recipes.map(r => r.cuisine))];
  cuisines.forEach(c => {
    const el = document.createElement("button");
    el.className = "chip" + (c==="all" ? " active":"");
    el.dataset.cuisine = c;
    el.textContent = c;
    cuisineChips.appendChild(el);
  });

  // daily feature
  const pick = state.recipes[Math.floor(Math.random()*state.recipes.length)];
  dailyFeature.textContent = `Feature of the Day • ${pick.country}`;
  heroTitle.textContent = `${pick.name} — ${pick.country}`;

  // render
  setTimeout(()=>renderCards(), 650); // show skeleton briefly

  // listeners
  bindEvents();

  // drawer initial
  renderList();
}

/* ---------- Render Cards ---------- */
function renderCards(){
  const items = filtered();
  grid.innerHTML = "";
  if(items.length === 0){
    grid.innerHTML = `<div style="opacity:.8;padding:20px">No recipes match your filters.</div>`;
    return;
  }
  items.forEach((r, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = r.id;
    setTimeout(()=>card.classList.add("show"), 60*i);

    card.innerHTML = `
      <div class="card-thumb" style="background-image:url('${r.img}')"></div>
      <div class="card-gradient"></div>
      <div class="flag-badge"><span>${flag(r.code)}</span> <small>${r.country}</small></div>
      <div class="card-meta">
        <div>
          <div class="card-title">${r.name}</div>
          <div class="card-sub">${r.cuisine} • ${r.healthy ? "Healthy" : "Indulgent"}${r.veg ? " • Veg" : ""}</div>
        </div>
        <button class="fav-btn" data-fav="${r.id}">${state.favs.includes(r.id) ? "♥ Saved" : "♡ Save"}</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------- Filters ---------- */
function filtered(){
  let arr = state.recipes.slice();

  // favorites
  if(state.onlyFavs) arr = arr.filter(r => state.favs.includes(r.id));

  // cuisine
  if(state.cuisine !== "all") arr = arr.filter(r => r.cuisine === state.cuisine);

  // toggles
  if(state.healthy) arr = arr.filter(r => r.healthy);
  if(state.veggie) arr = arr.filter(r => r.veg);

  // query
  const q = state.query.trim().toLowerCase();
  if(q){
    arr = arr.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.ingredients.join(" ").toLowerCase().includes(q)
    );
  }
  return arr;
}

/* ---------- Events ---------- */
function bindEvents(){
  // grid delegation
  grid.addEventListener("click", (e)=>{
    const fav = e.target.closest(".fav-btn");
    if(fav?.dataset?.fav){
      toggleFav(fav.dataset.fav);
      renderCards();
      return;
    }
    const card = e.target.closest(".card");
    if(card) openModal(card.dataset.id);
  });

  // search + suggestions
  search.addEventListener("input", onSearch);
  search.addEventListener("keydown", e=>{
    if(e.key==="Enter"){ closeSuggest(); state.query = search.value; renderCards(); }
  });
  suggestions.addEventListener("click", e=>{
    const li = e.target.closest("li"); if(!li) return;
    search.value = li.dataset.val; state.query = li.dataset.val; closeSuggest(); renderCards();
  });

  // chips
  cuisineChips.addEventListener("click", e=>{
    const chip = e.target.closest(".chip"); if(!chip) return;
    qsa(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    state.cuisine = chip.dataset.cuisine;
    renderCards();
  });

  // toggles
  healthyToggle.addEventListener("change", e=>{ state.healthy = e.target.checked; renderCards(); });
  veggieToggle.addEventListener("change", e=>{ state.veggie = e.target.checked; renderCards(); });

  // favorites only
  favToggle.addEventListener("click", ()=>{
    state.onlyFavs = !state.onlyFavs;
    favToggle.setAttribute("aria-pressed", String(state.onlyFavs));
    favToggle.textContent = state.onlyFavs ? "All Recipes" : "Favorites";
    renderCards();
  });

  // random
  randomBtn.addEventListener("click", ()=>{
    const list = filtered();
    if(!list.length) return;
    const pick = list[Math.floor(Math.random()*list.length)];
    openModal(pick.id);
  });

  // modal
  modalBackdrop.addEventListener("click", closeModal);
  modalClose.addEventListener("click", closeModal);
  modalFav.addEventListener("click", ()=>{
    const id = modal.dataset.id;
    toggleFav(id); updateModalFav(); renderCards();
  });
  modalPrint.addEventListener("click", ()=>window.print());
  modalAddAll.addEventListener("click", ()=>addAllToList());

  // ingredients checkbox -> add single item
  modalIngredients.addEventListener("change", e=>{
    if(e.target.matches("input[type='checkbox']")){
      const item = e.target.dataset.item;
      if(e.target.checked){ addToList(item); toast(`Added “${item}”`); }
    }
  });

  // drawer
  shoppingBtn.addEventListener("click", toggleDrawer);
  drawerClose.addEventListener("click", toggleDrawer);
  drawerClear.addEventListener("click", ()=>{ state.list = []; saveList(); renderList(); toast("List cleared","bad"); });
  drawerExport.addEventListener("click", ()=>{
    const txt = state.list.map(x=>`• ${x}`).join("\n");
    navigator.clipboard.writeText(txt).then(()=>toast("Copied list"));
  });
  drawerAdd.addEventListener("click", ()=>{
    const val = drawerInput.value.trim(); if(!val) return;
    addToList(val); drawerInput.value=""; renderList(); toast("Added");
  });
  drawerInput.addEventListener("keydown", e=>{
    if(e.key==="Enter"){ drawerAdd.click(); }
  });
  drawerList.addEventListener("click", e=>{
    const rm = e.target.closest("[data-remove]");
    if(rm){ removeFromList(rm.dataset.remove); renderList(); }
  });

  // keyboard shortcuts
  window.addEventListener("keydown", e=>{
    if(e.key === "/"){ e.preventDefault(); search.focus(); }
    if(e.key.toLowerCase() === "f"){ state.onlyFavs = !state.onlyFavs; favToggle.click(); }
    if(e.key.toLowerCase() === "g"){ randomBtn.click(); }
    if(e.key === "?"){ openHelp(); }
    // Ctrl+M voice
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="m"){ voiceBtn.click(); }
  });

  // help
  helpBackdrop.addEventListener("click", closeHelp);
  helpClose.addEventListener("click", closeHelp);

  // voice search
  voiceBtn.addEventListener("click", startVoice);
}

/* ---------- Search ---------- */
function onSearch(e){
  state.query = e.target.value;
  const q = state.query.trim().toLowerCase();
  if(!q){ closeSuggest(); renderCards(); return; }
  const matches = state.recipes.filter(r =>
    r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
  ).slice(0,7);
  suggestions.innerHTML = matches.map(m=>`<li role="option" data-val="${escapeHtml(m.name)}">${escapeHtml(m.name)} — <small>${m.country}</small></li>`).join("");
  suggestions.style.display = matches.length ? "block" : "none";
  renderCards();
}
function closeSuggest(){ suggestions.style.display="none"; }
function escapeHtml(s){ return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

/* ---------- Modal ---------- */
function openModal(id){
  const r = state.recipes.find(x=>x.id===id); if(!r) return;
  modal.dataset.id = r.id;
  modalHero.style.backgroundImage = `linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.25)), url('${r.img}')`;
  modalTitle.textContent = r.name;
  modalFlag.textContent = flag(r.code);
  modalCountry.textContent = r.country;
  modalCuisine.textContent = r.cuisine;
  modalIngredients.innerHTML = r.ingredients.map(i=>(
    `<li><input type="checkbox" data-item="${escapeHtml(i)}" /> <span>${i}</span></li>`
  )).join("");
  modalInstructions.innerHTML = r.steps.map(s=>`<li>${s}</li>`).join("");
  modalFact.textContent = r.fact||"";
  updateModalFav();
  modal.classList.remove("hidden"); document.body.style.overflow="hidden";
}
function closeModal(){ modal.classList.add("hidden"); document.body.style.overflow=""; }
function updateModalFav(){
  const id = modal.dataset.id;
  const saved = state.favs.includes(id);
  modalFav.textContent = saved ? "♥ Saved" : "♡ Save";
  modalFav.classList.toggle("saved", saved);
}

/* ---------- Favorites ---------- */
function toggleFav(id){
  const i = state.favs.indexOf(id);
  if(i===-1){ state.favs.push(id); toast("Added to favorites"); }
  else{ state.favs.splice(i,1); toast("Removed from favorites","bad"); }
  localStorage.setItem(STORAGE.favs, JSON.stringify(state.favs));
}
function loadFavs(){
  try{ return JSON.parse(localStorage.getItem(STORAGE.favs)) || []; }catch{ return []; }
}

/* ---------- Flags ---------- */
function flag(code){
  if(!code) return "🌍";
  const A = 0x1F1E6;
  return code.toUpperCase().split("").map(c => String.fromCodePoint(A + c.charCodeAt(0) - 65)).join("");
}

/* ---------- Voice Search ---------- */
let recognition;
function startVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ toast("Voice not supported in this browser","bad"); return; }
  if(!recognition){
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e)=>{
      const text = e.results[0][0].transcript;
      search.value = text; state.query = text; renderCards(); toast(`You said: “${text}”`);
    };
    recognition.onerror = ()=>toast("Voice error","bad");
  }
  recognition.start();
}

/* ---------- Shopping List ---------- */
function loadList(){ try{ return JSON.parse(localStorage.getItem(STORAGE.list)) || []; }catch{ return []; } }
function saveList(){ localStorage.setItem(STORAGE.list, JSON.stringify(state.list)); }
function renderList(){
  drawerList.innerHTML = state.list.map(item => `
    <li class="drawer-item">
      <span>${item}</span>
      <button class="icon-btn" data-remove="${escapeHtml(item)}" title="Remove">✕</button>
    </li>
  `).join("");
}
function toggleDrawer(){ drawer.classList.toggle("open"); }
function addToList(item){
  if(!state.list.includes(item)){ state.list.push(item); saveList(); renderList(); }
}
function addAllToList(){
  const id = modal.dataset.id;
  const r = state.recipes.find(x=>x.id===id); if(!r) return;
  let added = 0;
  r.ingredients.forEach(i=>{ if(!state.list.includes(i)){ state.list.push(i); added++; } });
  saveList(); renderList();
  toast(added ? `Added ${added} items to list` : "All ingredients already added");
}
function removeFromList(item){
  state.list = state.list.filter(x => x !== item); saveList(); toast("Removed");
}

/* ---------- Help ---------- */
function openHelp(){ help.classList.remove("hidden"); }
function closeHelp(){ help.classList.add("hidden"); }

/* ---------- Toast ---------- */
function toast(msg, type="good"){
  const el = document.createElement("div");
  el.className = `toast ${type==="bad"?"bad":"good"}`;
  el.textContent = msg;
  toasts.appendChild(el);
  setTimeout(()=>{ el.style.opacity=".2"; }, 2200);
  setTimeout(()=>{ el.remove(); }, 2800);
}

/* ---------- Helpers for API swap later ----------
Example (TheMealDB):
fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(state.query)}`)
  .then(r=>r.json()).then(d=>{
    state.recipes = (d.meals||[]).map(m=>({
      id: m.idMeal,
      name: m.strMeal,
      country: m.strArea || "Global",
      code: guessCode(m.strArea),
      cuisine: m.strCategory || "Unknown",
      healthy: /salad|grill|fish/i.test(m.strCategory||""),
      veg: /vegetarian|vegan/i.test(m.strCategory||""),
      img: m.strMealThumb,
      ingredients: collectIngredients(m),
      steps: (m.strInstructions||"").split(/\.\s+/).filter(Boolean),
      fact: "Chef’s tip: taste as you go!"
    }));
    renderCards();
  });

function collectIngredients(m){
  const list=[];
  for(let i=1;i<=20;i++){
    const ing = m[`strIngredient${i}`]; const meas = m[`strMeasure${i}`];
    if(ing && ing.trim()) list.push(`${ing}${meas?" — "+meas:""}`);
  }
  return list;
}
function guessCode(area){ const map={Italy:"IT",India:"IN",Japan:"JP",France:"FR",Mexico:"MX"}; return map[area]||""; }
-------------------------------------------------- */

/* ---------- Close on ESC ---------- */
window.addEventListener("keydown", e=>{
  if(e.key==="Escape"){
    if(!modal.classList.contains("hidden")) closeModal();
    if(drawer.classList.contains("open")) toggleDrawer();
    if(!help.classList.contains("hidden")) closeHelp();
  }
});
