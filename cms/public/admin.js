const categories = ["Software & Web", "Networking & Infrastructure", "CCTV & Security Systems", "IT Support & Field Operations", "Documentation, Reports & Training", "Graphic Design"];
const loginPanel = document.getElementById("login-panel"), dashboard = document.getElementById("dashboard"), projectForm = document.getElementById("project-form"), projectSelect = document.getElementById("project-select"), imageInput = document.getElementById("image-file");
let projects = [];
const field = name => projectForm.elements.namedItem(name);
const message = (element, text, error = false) => { element.textContent = text; element.classList.toggle("is-error", error); };
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: "same-origin", cache: "no-store", headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `Ombi limefeli (${response.status}).`); return data;
}
function setSignedIn(user) { loginPanel.hidden = true; dashboard.hidden = false; document.getElementById("account-name").textContent = user; }
function setupCategories() {
  for (const category of categories) {
    const option = document.createElement("option"); option.value = category; option.textContent = category; field("category").append(option);
    const label = document.createElement("label"); label.className = "category-check"; const input = document.createElement("input"); input.type = "checkbox"; input.name = "categories"; input.value = category; const span = document.createElement("span"); span.textContent = category; label.append(input, span); document.getElementById("category-options").append(label);
  }
}
function refreshPicker(selectedId = "") {
  projectSelect.replaceChildren(); const first = document.createElement("option"); first.value = ""; first.textContent = "Ongeza kazi mpya…"; projectSelect.append(first);
  for (const project of projects) { const option = document.createElement("option"); option.value = project.id; option.textContent = `${project.title} · ${project.status}`; projectSelect.append(option); }
  document.getElementById("project-count").textContent = String(projects.length); projectSelect.value = selectedId;
}
function showImage(image, alt = "", label = "") {
  const wrap = document.getElementById("image-preview-wrap"), preview = document.getElementById("image-preview");
  if (!image) { preview.removeAttribute("src"); wrap.hidden = true; return; }
  preview.src = /^(?:https?:|data:|blob:)/.test(image) ? image : `/${image}`; preview.alt = alt || "Picha ya mfano wa kazi"; document.getElementById("image-name").textContent = label || image.split("/").at(-1); wrap.hidden = false;
}
function clearForm() {
  projectForm.reset(); delete projectForm.dataset.projectId; document.getElementById("form-mode").textContent = "Kazi mpya"; document.getElementById("form-title").textContent = "Ongeza kazi"; document.getElementById("save-button").textContent = "Hifadhi na chapisha ↗"; document.getElementById("delete-project").hidden = true; field("status").value = "Completed"; field("category").value = "Graphic Design"; imageInput.required = true; showImage(); message(document.getElementById("save-message"), "");
}
function loadProject(project) {
  clearForm(); if (!project) { refreshPicker(); return; }
  projectForm.dataset.projectId = project.id; for (const name of ["title", "status", "category", "overview", "imageAlt", "objective", "role", "approach", "result", "source"]) field(name).value = project[name] || "";
  field("tools").value = (project.tools || []).join(", "); field("featured").checked = Boolean(project.featured); projectForm.querySelectorAll('input[name="categories"]').forEach(input => { input.checked = (project.categories || [project.category]).includes(input.value); });
  imageInput.required = false; document.getElementById("form-mode").textContent = "Hariri kazi"; document.getElementById("form-title").textContent = project.title; document.getElementById("save-button").textContent = "Hifadhi na chapisha ↗"; document.getElementById("delete-project").hidden = false; showImage(project.image, project.imageAlt, project.image); refreshPicker(project.id);
}
async function loadProjects(selectedId = "") { const data = await api("/api/projects"); projects = data.projects; refreshPicker(selectedId); loadProject(projects.find(project => project.id === selectedId) || null); }
function dataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("Picha haikuweza kusomwa.")); reader.readAsDataURL(file); }); }
async function bootstrap() {
  setupCategories(); clearForm();
  try { const session = await api("/api/session"); setSignedIn(`${session.user} · branch ${session.branch || "haijachaguliwa"}`); await loadProjects(); }
  catch (error) { message(document.getElementById("login-message"), error.message, true); }
}
projectSelect.addEventListener("change", () => { const selected = projects.find(project => project.id === projectSelect.value) || null; if (projectForm.dataset.projectId && projectForm.dataset.projectId !== selected?.id && !confirm("Ondoa mabadiliko ambayo hayajahifadhiwa na ubadilishe kazi?")) { projectSelect.value = projectForm.dataset.projectId; return; } loadProject(selected); });
document.getElementById("new-project").addEventListener("click", () => { if (projectForm.dataset.projectId && !confirm("Ondoa mabadiliko ambayo hayajahifadhiwa na kuanza kazi mpya?")) return; loadProject(null); field("title").focus(); });
document.getElementById("cancel-edit").addEventListener("click", () => loadProject(projects.find(project => project.id === projectSelect.value) || null));
imageInput.addEventListener("change", () => { const file = imageInput.files[0]; if (!file) return; if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) || file.size > 5 * 1024 * 1024) { imageInput.value = ""; message(document.getElementById("save-message"), "Chagua picha ya JPG, PNG au WebP isiyozidi MB 5.", true); return; } showImage(URL.createObjectURL(file), file.name, file.name); });
projectForm.addEventListener("submit", async event => {
  event.preventDefault(); if (!projectForm.reportValidity()) return; const status = document.getElementById("save-message"), button = document.getElementById("save-button"); button.disabled = true; message(status, "Inajenga tovuti, inatengeneza commit na kusukuma GitHub…");
  try {
    const file = imageInput.files[0]; const body = { title: field("title").value, status: field("status").value, category: field("category").value, categories: [...projectForm.querySelectorAll('input[name="categories"]:checked')].map(input => input.value), overview: field("overview").value, imageAlt: field("imageAlt").value, objective: field("objective").value, role: field("role").value, approach: field("approach").value, result: field("result").value, tools: field("tools").value.split(",").map(item => item.trim()).filter(Boolean), source: field("source").value, featured: field("featured").checked, ...(file ? { imageData: await dataUrl(file) } : {}) };
    const id = projectForm.dataset.projectId, endpoint = id ? `/api/projects/${encodeURIComponent(id)}` : "/api/projects"; const data = await api(endpoint, { method: id ? "PUT" : "POST", body: JSON.stringify(body) }); projects = data.projects; document.getElementById("retry-push").hidden = true; refreshPicker(data.project.id); loadProject(data.project); message(status, data.message);
  } catch (error) { message(status, error.message, true); document.getElementById("retry-push").hidden = false; } finally { button.disabled = false; }
});
document.getElementById("delete-project").addEventListener("click", async () => {
  const id = projectForm.dataset.projectId; if (!id || !confirm(`Futa “${field("title").value}” kwenye tovuti ya umma? Mabadiliko yatasukumwa GitHub.`)) return; const status = document.getElementById("save-message");
  try { message(status, "Inatengeneza commit na kusukuma GitHub…"); const data = await api(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" }); projects = data.projects; document.getElementById("retry-push").hidden = true; refreshPicker(); clearForm(); message(status, data.message); } catch (error) { message(status, error.message, true); document.getElementById("retry-push").hidden = false; }
});
document.getElementById("retry-push").addEventListener("click", async event => {
  const button = event.currentTarget, status = document.getElementById("save-message"); button.disabled = true;
  try { const data = await api("/api/publish", { method: "POST", body: "{}" }); message(status, data.message); button.hidden = true; }
  catch (error) { message(status, error.message, true); }
  finally { button.disabled = false; }
});
bootstrap();

