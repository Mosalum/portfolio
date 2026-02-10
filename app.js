const CATEGORY_ALL = "All";
const state = { allWorks: [], activeCategory: CATEGORY_ALL, search: "" };

function el(id){ return document.getElementById(id); }
function normalize(str){ return (str || "").toLowerCase().trim(); }
function escapeHtml(str){
  return (str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function loadWorks(){
  const res = await fetch("works.json", { cache: "no-store" });
  const data = await res.json();
  state.allWorks = Array.isArray(data) ? data : [];
}

function buildCategories(works){
  const cats = new Set();
  works.forEach(w => cats.add(w.category || "Other"));
  return [CATEGORY_ALL, ...Array.from(cats).sort()];
}

function renderTabs(categories){
  const wrap = el("categoryTabs");
  if(!wrap) return;
  wrap.innerHTML = "";
  categories.forEach(cat => {
    const b = document.createElement("button");
    b.className = "tab" + (cat === state.activeCategory ? " active" : "");
    b.textContent = cat;
    b.type = "button";
    b.onclick = () => { state.activeCategory = cat; renderAll(); };
    wrap.appendChild(b);
  });
}

function matchesFilters(work){
  const categoryPage = document.querySelector('[data-category-page="1"]');
  const lockedCategory = categoryPage ? categoryPage.getAttribute("data-category") : null;
  const activeCat = lockedCategory || state.activeCategory;

  const inCat = activeCat === CATEGORY_ALL ? true : (work.category || "Other") === activeCat;
  if(!inCat) return false;

  const s = normalize(state.search);
  if(!s) return true;

  const hay = [work.title, work.description, (work.tags||[]).join(" "), work.category]
    .map(normalize).join(" ");

  return hay.includes(s);
}

function openModal(w){
  const modal = el("modal");
  el("modalImg").src = w.thumb;
  el("modalImg").alt = w.title || "";
  el("modalTitle").textContent = w.title || "";
  el("modalDesc").textContent = w.description || "";
  el("modalTags").innerHTML = (w.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const link = el("modalLink");
  if(w.link && String(w.link).trim()){
    link.style.display = "inline-flex";
    link.href = w.link;
  } else {
    link.style.display = "none";
    link.href = "#";
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}

function closeModal(){
  const modal = el("modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}

function setupModal(){
  const modal = el("modal");
  if(!modal) return;
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if(t && t.dataset && t.dataset.close === "1") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeModal();
  });
}

function renderGrid(){
  const grid = el("workGrid");
  if(!grid) return;
  grid.innerHTML = "";

  const filtered = state.allWorks.filter(matchesFilters);

  if(filtered.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>No works found</h3><p class="muted">Try changing search keywords.</p>`;
    grid.appendChild(empty);
    return;
  }

  filtered.forEach(w => {
    const item = document.createElement("div");
    item.className = "work-item";
    item.innerHTML = `
      <img class="work-thumb" src="${w.thumb}" alt="${escapeHtml(w.title)}" loading="lazy" />
      <div class="work-info">
        <p class="work-title">${escapeHtml(w.title)}</p>
        <p class="work-sub">${escapeHtml(w.category || "Other")}</p>
        <div class="tag-row">
          ${(w.tags || []).slice(0,3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>
    `;
    item.onclick = () => openModal(w);
    grid.appendChild(item);
  });
}

function renderAll(){
  const categories = buildCategories(state.allWorks);
  if(!categories.includes(state.activeCategory)) state.activeCategory = CATEGORY_ALL;
  renderTabs(categories);
  renderGrid();
}

async function init(){
  const yearEl = el("year");
  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  const search = el("searchInput");
  if(search){
    search.addEventListener("input", () => {
      state.search = search.value;
      renderGrid();
    });
  }

  setupModal();
  await loadWorks();

  const categoryPage = document.querySelector('[data-category-page="1"]');
  if(categoryPage){
    renderGrid();
    return;
  }
  renderAll();
}
init();
