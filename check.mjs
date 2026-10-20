// Snapped Up — SEO & quality checks. Run after `node build.mjs`:
//   node check.mjs
// Exits 1 on ERRORS (must fix before pushing). WARNINGS should be fixed when reasonable.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, "dist");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
const errors = [], warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

if (!fs.existsSync(DIST)) { console.error("Run node build.mjs first."); process.exit(1); }

// ---- content checks ----
const dir = path.join(ROOT, "content/posts");
const posts = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({ f, ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }));
const slugs = new Map();
const today = new Date().toISOString().slice(0, 10);
const words = (s = "") => s.split(/\s+/).filter(Boolean).length;

for (const p of posts) {
  const slug = p.slug || p.f.replace(/\.json$/, "");
  if (slugs.has(slug)) err(p.f, `duplicate slug "${slug}" (also in ${slugs.get(slug)})`);
  slugs.set(slug, p.f);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || "")) err(p.f, "date must be YYYY-MM-DD");
  if (p.date > today) warn(p.f, `date ${p.date} is in the future`);
  const tag = p.seoTitle || (p.title.length > 48 ? p.title : `${p.title} | ${site.name}`);
  if (p.type !== "daily" && tag.length > 70) warn(p.f, `title tag is ${tag.length} chars (aim ≤ 65); add a shorter "seoTitle"`);
  const dl = (p.description || "").length;
  if (dl < 70 || dl > 160) warn(p.f, `description is ${dl} chars (aim 70–155)`);
  for (const [i, d] of (p.deals || []).entries()) {
    if (typeof d.price !== "number") err(p.f, `deal ${i + 1} price must be a number`);
    if (d.was != null && typeof d.was !== "number") err(p.f, `deal ${i + 1} "was" must be a number`);
    if (d.was != null && d.was <= d.price) warn(p.f, `deal ${i + 1} "was" (${d.was}) isn't higher than price (${d.price})`);
    if (!/^https:\/\//.test(d.url || "")) err(p.f, `deal ${i + 1} url must start with https://`);
    if (/[?&](tag|campid|awinaffid)=/.test(d.url || "")) err(p.f, `deal ${i + 1} url already has an affiliate code; use the plain URL`);
  }
  const text = `${p.intro || ""}\n${p.body || ""}`;
  if (p.type === "guide") {
    if (!p.updated) err(p.f, 'guides need an "updated" date');
    if (!p.slug) err(p.f, 'guides need an explicit "slug"');
    if (words(text) < 450) warn(p.f, `guide is ${words(text)} words (aim 500–1,000)`);
    const faqs = (p.body || "").match(/^###\s+.+\?\s*$/gm) || [];
    if (faqs.length < 3) warn(p.f, `guide has ${faqs.length} FAQ questions (aim 3–5 "### Question?" headings)`);
    if (!/\]\(\/guides\//.test(text) && !(site.hubs || []).map((h) => h.slug).some((s) => text.includes(`](/${s}/`))) warn(p.f, "guide doesn't link to any other guide or hub");
    if (!/black.friday|christmas|gift|\b20\d\d\b|uk/i.test(p.title)) warn(p.f, "guide title has no search hook (year, 'UK', event, gift…)");
    if ((p.updated || p.date) < new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10)) warn(p.f, `not refreshed since ${p.updated || p.date}`);
  }
  if (p.type === "daily") {
    if ((p.deals || []).length < 4) warn(p.f, `daily post has only ${(p.deals || []).length} deals`);
    if (!/\]\(\/guides\//.test(text) && !/\]\(\/spotlight\//.test(text)) warn(p.f, "daily post doesn't link to a guide or spotlight");
  }
  if (!fs.existsSync(path.join(ROOT, "static/og", `${slug}.png`))) warn(p.f, "no share image; run python3 tools/og.py");
}

// ---- built-site checks: internal links, titles, h1s ----
const htmlFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : e.name.endsWith(".html") && htmlFiles.push(p); } })(DIST);
const exists = (href) => {
  const clean = href.split("#")[0].split("?")[0];
  const p = path.join(DIST, clean);
  return fs.existsSync(p) && fs.statSync(p).isFile() || fs.existsSync(path.join(p, "index.html"));
};
const titles = new Map();
for (const f of htmlFiles) {
  const rel = "/" + path.relative(DIST, f).replace(/index\.html$/, "");
  if (rel === "/404.html") continue;
  const h = fs.readFileSync(f, "utf8");
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) if (!exists(m[1])) err(rel, `broken internal link ${m[1]}`);
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(rel, `${h1} <h1> tags (should be 1)`);
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (t) { if (titles.has(t)) err(rel, `duplicate <title> with ${titles.get(t)}`); titles.set(t, rel); }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { err(rel, "invalid JSON-LD"); } }
}
const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
for (const m of sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)) { const u = m[1].replace(site.url, "") || "/"; if (!exists(u)) err("sitemap.xml", `lists missing page ${u}`); }

console.log(`Checked ${posts.length} posts, ${htmlFiles.length} pages.`);
if (warnings.length) console.log(`\nWARNINGS (${warnings.length}):\n- ` + warnings.join("\n- "));
if (errors.length) { console.log(`\nERRORS (${errors.length}):\n- ` + errors.join("\n- ")); process.exit(1); }
console.log("\nNo errors.");
