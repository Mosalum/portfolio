const categoryNames = [
  "Software & Web",
  "Networking & Infrastructure",
  "CCTV & Security Systems",
  "IT Support & Field Operations",
  "Documentation, Reports & Training",
  "Graphic Design"
];
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const normalized = value => String(value ?? "").toLocaleLowerCase().trim();

async function getProjects() {
  const response = await fetch("works.json");
  if (!response.ok) throw new Error("Project data could not be loaded.");
  return response.json();
}

function projectCard(project, index = 0) {
  return `<a class="project-card" href="projects/${encodeURIComponent(project.id)}/" aria-label="Read the ${escapeHtml(project.title)} case study">
    <div class="project-image"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt)}" loading="lazy"><span class="project-index">${String(index + 1).padStart(2, "0")}</span></div>
    <div class="project-card-copy"><div class="card-meta"><span>${escapeHtml(project.category)}</span><span class="status-pill">${escapeHtml(project.status)}</span></div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.overview)}</p><span class="card-link">View case study <span aria-hidden="true">↗</span></span></div>
  </a>`;
}

function renderFeatured(projects) {
  const target = document.getElementById("featured-work");
  if (!target) return;
  const selected = projects.filter(project => project.featured).slice(0, 3);
  target.innerHTML = selected.length ? selected.map(projectCard).join("") : `<p class="muted">Selected projects will appear here as they are added.</p>`;
}

function setupGallery(projects) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  const search = document.getElementById("project-search");
  const filters = document.getElementById("category-filters");
  const count = document.getElementById("result-count");
  const empty = document.getElementById("empty-state");
  const projectCategories = project => project.categories?.length ? project.categories : [project.category];
  const presentCategories = categoryNames.filter(category => projects.some(project => projectCategories(project).includes(category)));
  const queryCategory = new URLSearchParams(location.search).get("category");
  let activeCategory = presentCategories.includes(queryCategory) ? queryCategory : "All work";
  filters.innerHTML = ["All work", ...presentCategories].map(category => `<button type="button" class="filter-chip${category === activeCategory ? " is-active" : ""}" aria-pressed="${category === activeCategory}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");

  function render() {
    const query = normalized(search.value);
    const visible = projects.filter(project => {
      const categoryMatches = activeCategory === "All work" || projectCategories(project).includes(activeCategory);
      const text = [project.title, project.category, ...projectCategories(project), project.overview, ...(project.tools || [])].join(" ");
      return categoryMatches && normalized(text).includes(query);
    });
    grid.innerHTML = visible.map(projectCard).join("");
    count.textContent = `${visible.length} ${visible.length === 1 ? "project" : "projects"}`;
    empty.hidden = visible.length > 0;
    grid.hidden = visible.length === 0;
  }

  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll("button").forEach(chip => {
      const active = chip === button;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    render();
  });
  search.addEventListener("input", render);
  render();
}

async function initialize() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  try {
    const projects = await getProjects();
    renderFeatured(projects);
    setupGallery(projects);
  } catch (error) {
    document.querySelectorAll("#featured-work, #project-grid").forEach(target => {
      target.innerHTML = `<p class="muted">Project information is temporarily unavailable. Please try again later.</p>`;
    });
  }
}

initialize();
