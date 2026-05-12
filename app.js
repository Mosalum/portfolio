const CATEGORY_ALL = "All";
const THEME_KEY = "ms_theme";
const state = { allWorks: [], activeCategory: CATEGORY_ALL, search: "", loadError: "" };

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

function applyTheme(theme){
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  const toggle = el("themeToggle");
  if(toggle){
    toggle.textContent = isLight ? "☀️" : "🌙";
    toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  }
}

function setupTheme(){
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme);

  const toggle = el("themeToggle");
  if(!toggle) return;

  toggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

function setupMobileMenu(){
  const menuToggle = el("menuToggle");
  const siteNav = el("siteNav");
  if(!menuToggle || !siteNav) return;

  const resetMenu = () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.textContent = "☰";
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  siteNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if(window.innerWidth > 640) return;
      resetMenu();
    });
  });

  window.addEventListener("resize", () => {
    if(window.innerWidth > 640) resetMenu();
  });
}

async function loadWorks(){
  const works = Array.isArray(window.WORKS) ? window.WORKS : [];
  state.allWorks = works;
  state.loadError = works.length ? "" : "Unable to load projects right now. Please try again later.";
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
    const button = document.createElement("button");
    button.className = "tab" + (cat === state.activeCategory ? " active" : "");
    button.textContent = cat;
    button.type = "button";
    button.onclick = () => {
      state.activeCategory = cat;
      renderAll();
    };
    wrap.appendChild(button);
  });
}

function matchesFilters(work){
  const categoryPage = document.querySelector('[data-category-page="1"]');
  const lockedCategory = categoryPage ? categoryPage.getAttribute("data-category") : null;
  const activeCat = lockedCategory || state.activeCategory;

  const inCat = activeCat === CATEGORY_ALL ? true : (work.category || "Other") === activeCat;
  if(!inCat) return false;

  const searchTerm = normalize(state.search);
  if(!searchTerm) return true;

  const haystack = [work.title, work.description, (work.tags || []).join(" "), work.category]
    .map(normalize)
    .join(" ");

  return haystack.includes(searchTerm);
}

function openModal(work){
  const modal = el("modal");
  const modalImg = el("modalImg");
  const modalTitle = el("modalTitle");
  const modalDesc = el("modalDesc");
  const modalTags = el("modalTags");
  const link = el("modalLink");

  if(!modal || !modalImg || !modalTitle || !modalDesc || !modalTags || !link) return;

  modalImg.src = work.thumb;
  modalImg.alt = work.title || "";
  modalTitle.textContent = work.title || "";
  modalDesc.textContent = work.description || "";
  modalTags.innerHTML = (work.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  if(work.link && String(work.link).trim()){
    link.style.display = "inline-flex";
    link.href = work.link;
    link.textContent = "Open Project";
  } else {
    link.style.display = "inline-flex";
    link.href = work.thumb;
    link.textContent = "Open Image";
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}

function closeModal(){
  const modal = el("modal");
  if(!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}

function setupModal(){
  const modal = el("modal");
  if(!modal) return;

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if(target && target.dataset && target.dataset.close === "1") closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") closeModal();
  });
}

function renderMessage(title, text){
  const grid = el("workGrid");
  if(!grid) return;

  grid.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h3>${escapeHtml(title)}</h3><p class="muted">${escapeHtml(text)}</p>`;
  grid.appendChild(card);
}

function getHomepageWorks(works){
  const preferredCategories = ["Web Design", "Graphics Design", "IT Specialist"];
  const selected = [];

  preferredCategories.forEach(category => {
    const match = works.find(work => (work.category || "Other") === category);
    if(match && !selected.includes(match)) selected.push(match);
  });

  if(selected.length < 3){
    works.forEach(work => {
      if(selected.length >= 3) return;
      if(!selected.includes(work)) selected.push(work);
    });
  }

  return selected.slice(0, 3);
}

function renderGrid(){
  const grid = el("workGrid");
  if(!grid) return;
  grid.innerHTML = "";

  if(state.loadError){
    renderMessage("Projects unavailable", state.loadError);
    return;
  }

  const filtered = state.allWorks.filter(matchesFilters);
  const categoryPage = document.querySelector('[data-category-page="1"]');
  const worksToRender = categoryPage ? filtered : getHomepageWorks(filtered);
  if(worksToRender.length === 0){
    renderMessage("No projects found", "Try a different keyword or browse another category.");
    return;
  }

  worksToRender.forEach(work => {
    const item = document.createElement("button");
    item.className = "work-item";
    item.type = "button";
    item.innerHTML = `
      <img class="work-thumb" src="${work.thumb}" alt="${escapeHtml(work.title)}" loading="lazy" />
      <div class="work-info">
        <p class="work-title">${escapeHtml(work.title)}</p>
        <p class="work-sub">${escapeHtml(work.category || "Other")}</p>
        <div class="tag-row">
          ${(work.tags || []).slice(0,3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    `;
    item.onclick = () => openModal(work);
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
  setupTheme();
  setupMobileMenu();

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
