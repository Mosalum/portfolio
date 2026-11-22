import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, "_site");
if (output !== path.join(root, "_site")) throw new Error("Refusing to build outside the portfolio's _site directory.");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ["index.html", "services.html", "work.html", "about.html", "contact.html", "web-design.html", "graphics.html", "it.html", "admin.html", "styles.css", "app.js", "contact.js", "nav.js", "works.json", "MohamedCv.pdf", "pass.png", ".nojekyll"]) {
  await cp(path.join(root, file), path.join(output, file));
}
const projects = JSON.parse(await readFile(path.join(root, "works.json"), "utf8"));
for (const project of projects) {
  const relativeImage = String(project.image || "").replaceAll("\\", "/");
  if (!relativeImage.startsWith("assets/works/")) throw new Error(`Project ${project.id} uses an unsupported image path.`);
  const sourceImage = path.resolve(root, relativeImage);
  if (!sourceImage.startsWith(path.join(root, "assets", "works") + path.sep)) throw new Error(`Project ${project.id} image path is outside assets/works.`);
  const targetImage = path.join(output, ...relativeImage.split("/"));
  await mkdir(path.dirname(targetImage), { recursive: true });
  await cp(sourceImage, targetImage);
  await cp(path.join(root, "projects", project.id), path.join(output, "projects", project.id), { recursive: true });
}
console.log(`Prepared GitHub Pages site in ${output}.`);
