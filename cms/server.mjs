import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 4178);
const sessionToken = randomBytes(32).toString("base64url");
const categories = new Set(["Software & Web", "Networking & Infrastructure", "CCTV & Security Systems", "IT Support & Field Operations", "Documentation, Reports & Training", "Graphic Design"]);
const statuses = new Set(["Completed", "In Progress", "Concept"]);
const mime = new Map([[".html", "text/html; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".webp", "image/webp"], [".svg", "image/svg+xml"], [".pdf", "application/pdf"]]);

function send(res, status, data, headers = {}) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers }); res.end(JSON.stringify(data)); }
function safeToken(value) { const input = Buffer.from(value || ""); const expected = Buffer.from(sessionToken); return input.length === expected.length && timingSafeEqual(input, expected); }
function localRequest(req, url, mutating = false) {
  const address = req.socket.remoteAddress;
  if (!new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]).has(address)) return false;
  if (url.hostname !== host && url.hostname !== "localhost") return false;
  if (mutating && req.headers.origin !== url.origin) return false;
  const token = (req.headers.cookie || "").split(";").map(item => item.trim()).find(item => item.startsWith("portfolio_local_session="))?.split("=")[1];
  return safeToken(token);
}
async function bodyJson(req) {
  let body = "";
  for await (const chunk of req) { body += chunk; if (body.length > 8_000_000) throw new Error("Ombi ni kubwa sana."); }
  return JSON.parse(body || "{}");
}
const clean = (value, max = 1600) => String(value ?? "").trim().slice(0, max);
const slug = value => clean(value, 100).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "project";
function validate(input, old, projects) {
  const title = clean(input.title, 100), category = clean(input.category, 80), status = clean(input.status, 30);
  if (!title || !categories.has(category) || !statuses.has(status)) throw new Error("Jaza jina, kundi na hali sahihi ya kazi.");
  let id = old?.id || slug(title), base = id, n = 2; while (!old && projects.some(item => item.id === id)) id = base + "-" + n++;
  const source = clean(input.source, 300);
  if (source && !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[^\s]*)?$/.test(source)) throw new Error("Tumia kiungo cha GitHub HTTPS au acha tupu.");
  return { id, title, category, categories: [...new Set([category, ...(Array.isArray(input.categories) ? input.categories.filter(c => categories.has(c)) : [])])], status, featured: input.featured === true, image: old?.image || "", imageAlt: clean(input.imageAlt, 220), overview: clean(input.overview, 420), objective: clean(input.objective), role: clean(input.role), approach: clean(input.approach, 1800), result: clean(input.result), tools: [...new Set((Array.isArray(input.tools) ? input.tools : []).map(t => clean(t, 50)).filter(Boolean))].slice(0, 20), ...(source ? { source } : {}) };
}
async function saveImage(dataUrl, id) {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl || "");
  if (!match) throw new Error("Chagua picha ya JPG, PNG au WebP.");
  const bytes = Buffer.from(match[2], "base64"); if (bytes.length > 5 * 1024 * 1024) throw new Error("Picha izidi MB 5.");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const valid = ext === "png" ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : ext === "jpg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) throw new Error("Aina ya maudhui ya picha haijathibitishwa.");
  const dir = path.join(root, "assets", "works"); await mkdir(dir, { recursive: true });
  const name = id + "-" + Date.now() + "-" + randomBytes(3).toString("hex") + "." + ext; await writeFile(path.join(dir, name), bytes, { flag: "wx" }); return "assets/works/" + name;
}
async function git(args, env = process.env) { const { stdout } = await exec("git", args, { cwd: root, env, windowsHide: true, timeout: 120_000, maxBuffer: 2_000_000 }); return stdout.trim(); }
async function publish(message) {
  const branch = await git(["branch", "--show-current"]); if (!branch) throw new Error("Tumia branch ya Git kwanza, kisha jaribu tena.");
  const staged = await git(["diff", "--cached", "--name-only"]); if (staged) throw new Error("Kuna mabadiliko mengine tayari yamewekwa stage. Fanya commit au safisha stage kabla ya kuchapisha kazi.");
  await git(["fetch", "origin", branch]);
  const upstream = await git(["rev-parse", "--verify", "refs/remotes/origin/" + branch]);
  const aheadFiles = await git(["diff", "--name-only", upstream + "..HEAD"]);
  const unrelated = aheadFiles.split(/\r?\n/).filter(Boolean).filter(file => file !== "works.json" && !file.startsWith("projects/") && !file.startsWith("assets/works/"));
  if (unrelated.length) throw new Error("Branch ina commit za mabadiliko mengine ambayo hayajapushwa. Sukuma au tenganisha hizo commit kwanza.");
  await exec(process.execPath, [path.join(root, "build.mjs")], { cwd: root, windowsHide: true, timeout: 120_000, maxBuffer: 2_000_000 });
  await git(["add", "--", "works.json", "projects", "assets/works"]);
  const changed = await git(["diff", "--cached", "--name-only"]);
  const commitMessage = "Publish portfolio work: " + (clean(message, 100) || "update project");
  if (changed) {
    try {
      const identity = { ...process.env, GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || "Mosalum Mohamed", GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || "119632267+Mosalum@users.noreply.github.com", GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || "Mosalum Mohamed", GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || "119632267+Mosalum@users.noreply.github.com" };
      await git(["commit", "-m", commitMessage], identity);
    } catch (error) {
      await git(["reset", "--", "works.json", "projects", "assets/works"]).catch(() => {});
      throw error;
    }
  }
  await git(["push", "origin", "HEAD:refs/heads/" + branch]);
  return { branch, message: (changed ? "Kazi imecommit-iwa na kusukumwa" : "Commit ya kazi imesukumwa") + " GitHub kwenye tawi " + branch + "." + (branch === "main" ? " GitHub Pages itasasisha portfolio ya mtandaoni baada ya deployment kukamilika. Unaweza kufuatilia kwenye GitHub Actions." : " Unganisha branch hii na main ili portfolio ya mtandaoni isasishwe.") };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || (host + ":" + port)));
  try {
    const adminPage = url.pathname === "/admin.html" || url.pathname === "/admin";
    if (url.pathname.startsWith("/api/")) {
      const needsAuth = !(req.method === "GET" && url.pathname === "/api/session");
      if ((needsAuth && !localRequest(req, url, req.method !== "GET")) || !new Set([host, "localhost"]).has(url.hostname)) return send(res, 403, { error: "Fungua paneli kupitia anuani hii ya localhost pekee." });
      if (req.method === "GET" && url.pathname === "/api/session") return send(res, 200, { user: "Workspace ya kompyuta hii", branch: await git(["branch", "--show-current"]) });
      const projects = JSON.parse(await readFile(path.join(root, "works.json"), "utf8"));
      if (req.method === "GET" && url.pathname === "/api/projects") return send(res, 200, { projects, branch: await git(["branch", "--show-current"]) });
      if (req.method === "POST" && url.pathname === "/api/publish") { const result = await publish("retry pending work"); return send(res, 200, result); }
      if (req.method === "POST" && url.pathname === "/api/projects") {
        const input = await bodyJson(req), project = validate(input, null, projects); if (!input.imageData) throw new Error("Chagua picha ya mradi."); project.image = await saveImage(input.imageData, project.id); projects.push(project); await writeFile(path.join(root, "works.json"), JSON.stringify(projects, null, 2) + "\n"); const result = await publish(project.title); return send(res, 201, { project, projects, ...result });
      }
      const match = /^\/api\/projects\/([a-z0-9-]+)$/.exec(url.pathname);
      if (match && req.method === "PUT") {
        const input = await bodyJson(req), index = projects.findIndex(p => p.id === match[1]); if (index < 0) return send(res, 404, { error: "Kazi haijapatikana." }); const project = validate(input, projects[index], projects); if (input.imageData) project.image = await saveImage(input.imageData, project.id); else project.image = projects[index].image; if (!project.image) throw new Error("Chagua picha ya mradi."); projects[index] = project; await writeFile(path.join(root, "works.json"), JSON.stringify(projects, null, 2) + "\n"); const result = await publish(project.title); return send(res, 200, { project, projects, ...result });
      }
      if (match && req.method === "DELETE") {
        const index = projects.findIndex(p => p.id === match[1]); if (index < 0) return send(res, 404, { error: "Kazi haijapatikana." }); const [deleted] = projects.splice(index, 1); await writeFile(path.join(root, "works.json"), JSON.stringify(projects, null, 2) + "\n"); const result = await publish("remove " + deleted.title); return send(res, 200, { projects, ...result });
      }
      return send(res, 404, { error: "Njia hii haipo." });
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Method haikubaliki." });
    let relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    if (relative === "/admin.html" || relative === "/admin") relative = "/cms/public/index.html";
    if (relative === "/admin.js") relative = "/cms/public/admin.js";
    if (relative === "/admin.css") relative = "/cms/public/admin.css";
    let file = path.resolve(root, "." + relative); if (!file.startsWith(root + path.sep)) return send(res, 404, { error: "Haijapatikana." });
    let info;
    try {
      info = await stat(file);
      if (info.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          res.writeHead(301, { Location: url.pathname + "/" + url.search });
          return res.end();
        }
        file = path.join(file, "index.html");
        info = await stat(file);
      }
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return send(res, 404, { error: "Haijapatikana." });
      throw error;
    }
    if (!info.isFile()) return send(res, 404, { error: "Haijapatikana." });
    const headers = { "Content-Type": mime.get(path.extname(file).toLowerCase()) || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" };
    if (adminPage || relative.startsWith("/cms/public/")) { headers["Set-Cookie"] = "portfolio_local_session=" + sessionToken + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800"; headers["Cache-Control"] = "no-store"; }
    res.writeHead(200, headers); if (req.method === "HEAD") return res.end(); res.end(await readFile(file));
  } catch (error) { send(res, 400, { error: error.message || "Hitilafu imetokea." }); }
});
server.listen(port, host, () => { console.log("Msimamizi: http://" + host + ":" + port + "/admin.html"); console.log("Server inasikiliza localhost pekee. Ingia GitHub kwa Git Credential Manager."); });
server.on("error", error => { console.error(error.message); process.exitCode = 1; });
