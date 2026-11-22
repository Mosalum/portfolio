import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projects = JSON.parse(await readFile(path.join(root, "works.json"), "utf8"));
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const validCategories = new Set(["Software & Web", "Networking & Infrastructure", "CCTV & Security Systems", "IT Support & Field Operations", "Documentation, Reports & Training", "Graphic Design"]);
const validStatuses = new Set(["Completed", "In Progress", "Concept"]);
if (!Array.isArray(projects)) throw new Error("works.json must contain an array of projects.");
const ids = new Set();
for (const project of projects) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) throw new Error(`Project id is invalid or duplicated: ${project.id}`);
  ids.add(project.id);
  if (!project.title || !validStatuses.has(project.status)) throw new Error(`Project ${project.id} needs a title and a valid status.`);
  const categories = project.categories?.length ? project.categories : [project.category];
  if (!categories.length || categories.some(category => !validCategories.has(category))) throw new Error(`Project ${project.id} has an invalid category.`);
  if (project.source && !/^https:\/\/github\.com\//.test(project.source)) throw new Error(`Project ${project.id} source must be a GitHub HTTPS link.`);
  const image = path.resolve(root, project.image || "");
  if (!image.startsWith(path.join(root, "assets", "works") + path.sep)) throw new Error(`Project ${project.id} image must be inside assets/works.`);
  await access(image);
}

for (const [index, project] of projects.entries()) {
  const dir = path.join(root, "projects", project.id);
  await mkdir(dir, { recursive: true });
  const previous = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const tags = (project.tools || []).map(tool => `<span>${escape(tool)}</span>`).join("");
  const title = `${project.title} | Mosalum Digital`;
  const description = project.overview;
  const sections = [
    ["The objective", project.objective],
    ["My role", project.role],
    ["Approach", project.approach],
    ["Result", project.result]
  ].filter(([, text]) => text).map(([heading, text]) => `<section class="case-block"><h2>${heading}</h2><p>${escape(text)}</p></section>`).join("");
  const sourceEvidence = project.source ? `<a href="${escape(project.source)}" target="_blank" rel="noopener noreferrer">Review the application source ↗</a>` : "";
  const categoryFacts = (project.categories?.length ? project.categories : [project.category]).map(category => `<span>${escape(category)}</span>`).join("");
  const shareImage = `https://raw.githubusercontent.com/Mosalum/portfolio/main/${project.image}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#10110f"><meta name="description" content="${escape(description)}"><meta property="og:type" content="article"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${escape(shareImage)}"><title>${escape(title)}</title><link rel="icon" href="../../pass.png"><link rel="stylesheet" href="../../styles.css"></head>
<body><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container nav-wrap"><a class="brand" href="../../index.html"><span class="brand-mark" aria-hidden="true">M</span><span>Mosalum Digital<span class="brand-dot">.</span></span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation">Menu</button><nav class="nav-links" id="site-nav" aria-label="Main navigation"><details class="nav-services"><summary>Services</summary><div class="nav-service-menu"><a href="../../services.html">Service overview<small>Scope, process and quotes</small></a><a href="../../services.html#it-support">IT support<small>Computers and daily operations</small></a><a href="../../services.html#networks">Networking<small>Connectivity and infrastructure</small></a><a href="../../services.html#web">Web &amp; software<small>Websites and digital products</small></a><a href="../../services.html#design">Design &amp; documents<small>Visual and technical materials</small></a></div></details><a href="../../work.html">Work</a><a href="../../about.html">About</a><a href="../../cv.html">CV</a><a href="../../contact.html">Contact</a></nav></div></header>
<main id="main" class="container case-page"><a class="back-link" href="../../work.html">← All work</a><header class="case-head"><div><p class="eyebrow">${escape(project.category)} · Case study</p><h1>${escape(project.title)}</h1><p class="case-overview">${escape(project.overview)}</p></div><div class="case-facts"><span class="case-status">${escape(project.status)}</span>${categoryFacts}</div></header>
<figure class="case-visual"><img src="../../${escape(project.image)}" alt="${escape(project.imageAlt)}"><figcaption class="visually-hidden">${escape(project.imageAlt)}</figcaption></figure>
<div class="case-content"><div class="case-story">${sections}</div><aside class="case-aside"><h2>Tools &amp; focus</h2><div class="tag-list">${tags}</div><h2>Evidence</h2>${project.source ? `<p class="muted">Public code repository and supplied application dashboard screenshot.</p>${sourceEvidence}` : `<p class="muted">Visual evidence supplied for this project.</p><a href="../../${escape(project.image)}">View original image ↗</a>`}</aside></div>
<nav class="case-nav" aria-label="More case studies"><a href="../${escape(previous.id)}/">← ${escape(previous.title)}</a><a href="../${escape(next.id)}/">${escape(next.title)} →</a></nav></main>
<footer class="site-footer"><div class="container footer-inner"><a class="brand" href="../../index.html"><span class="brand-mark" aria-hidden="true">M</span><span>Mosalum Digital<span class="brand-dot">.</span></span></a><p>Independent IT &amp; Digital Services · Dar es Salaam, Tanzania</p><a href="../../contact.html">Start an enquiry ↗</a></div></footer><script src="../../nav.js" defer></script><a class="whatsapp-float" href="https://wa.me/255678635302" target="_blank" rel="noopener noreferrer" aria-label="Start a WhatsApp conversation with Mohamed"><span class="wa-mark" aria-hidden="true">W</span><span>WhatsApp</span></a></body></html>`;
  await writeFile(path.join(dir, "index.html"), html, "utf8");
}

console.log(`Built ${projects.length} project case-study pages.`);

