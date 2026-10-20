// Snapped Up — zero-dependency static site builder.
// Run: node build.mjs   → outputs to ./dist
// Content lives in ./content (posts as JSON, pages as JSON). See README.md.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, "dist");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));

// ---------- helpers ----------
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const gbp = (n) =>
  n == null || n === "" ? "" : "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 });

const fmtDate = (iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });

const shortDate = (iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

// Turn a plain retailer URL into an affiliate URL using IDs from site.json.
// Blank IDs = link left untouched, so the site works before accounts are approved.
function affiliate(raw) {
  let u;
  try { u = new URL(raw); } catch { return raw; }
  const host = u.hostname.replace(/^www\./, "");
  const a = site.affiliate || {};
  if (host.endsWith("amazon.co.uk") && a.amazonTag) {
    u.searchParams.set("tag", a.amazonTag);
    return u.toString();
  }
  if (host.endsWith("ebay.co.uk") && a.ebayCampaignId) {
    const p = { mkcid: "1", mkrid: "710-53481-19255-0", siteid: "3", campid: a.ebayCampaignId, toolid: "10001", mkevt: "1" };
    for (const [k, v] of Object.entries(p)) u.searchParams.set(k, v);
    return u.toString();
  }
  const mid = a.awinMerchants && Object.entries(a.awinMerchants).find(([d]) => host.endsWith(d));
  if (mid && mid[1] && a.awinPublisherId) {
    return `https://www.awin1.com/cread.php?awinmid=${mid[1]}&awinaffid=${a.awinPublisherId}&ued=${encodeURIComponent(raw)}`;
  }
  return raw;
}

const isExternal = (href) => /^https?:\/\//.test(href) && !href.startsWith(site.url);

// Minimal markdown: ## / ### headings, paragraphs, - lists, 1. lists, **bold**, *italic*, [text](url), > quote
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, t, h) => {
      const href = h.replace(/&amp;/g, "&");
      if (isExternal(href)) return `<a href="${esc(affiliate(href))}" rel="sponsored nofollow noopener" target="_blank">${t}</a>`;
      return `<a href="${esc(href)}">${t}</a>`;
    });
}
function md(src = "") {
  const lines = src.replace(/\r/g, "").split("\n");
  let html = "", para = [], list = null;
  const flushP = () => { if (para.length) { html += `<p>${inline(para.join(" "))}</p>\n`; para = []; } };
  const flushL = () => { if (list) { html += `<${list.t}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.t}>\n`; list = null; } };
  for (const line of lines) {
    let m;
    if (!line.trim()) { flushP(); flushL(); continue; }
    if ((m = line.match(/^(#{2,3})\s+(.*)/))) { flushP(); flushL(); const lv = m[1].length; const id = m[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); html += `<h${lv} id="${id}">${inline(m[2])}</h${lv}>\n`; continue; }
    if ((m = line.match(/^>\s?(.*)/))) { flushP(); flushL(); html += `<blockquote>${inline(m[1])}</blockquote>\n`; continue; }
    if ((m = line.match(/^[-*]\s+(.*)/))) { flushP(); if (!list || list.t !== "ul") { flushL(); list = { t: "ul", items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^\d+\.\s+(.*)/))) { flushP(); if (!list || list.t !== "ol") { flushL(); list = { t: "ol", items: [] }; } list.items.push(m[1]); continue; }
    flushL(); para.push(line.trim());
  }
  flushP(); flushL();
  return html;
}

// FAQ extraction: "### Question?" headings followed by answer text
function faqs(src = "") {
  const out = []; let q = null, a = [];
  const flush = () => { if (q && a.length) out.push({ q, a: a.join(" ").replace(/\*\*|\*|\[([^\]]+)\]\([^)]+\)/g, (m, t) => t || "").trim() }); q = null; a = []; };
  for (const line of src.split("\n")) {
    const m = line.match(/^###\s+(.+\?)\s*$/);
    if (m) { flush(); q = m[1].trim(); continue; }
    if (/^#{1,3}\s/.test(line)) { flush(); continue; }
    if (q && line.trim()) a.push(line.trim());
  }
  flush();
  return out;
}

// ---------- components ----------
function dealCard(d) {
  const off = d.was && d.price && Number(d.was) > Number(d.price) ? Math.round((1 - d.price / d.was) * 100) : null;
  const href = affiliate(d.url);
  return `<article class="deal">
  <div class="deal-top">
    <span class="retailer">${esc(d.retailer || "")}</span>
    ${d.verdict ? `<span class="verdict v-${esc((d.verdictLevel || "good").toLowerCase())}">${esc(d.verdict)}</span>` : ""}
  </div>
  <h3 class="deal-name">${esc(d.name)}</h3>
  ${d.note ? `<p class="deal-note">${inline(d.note)}</p>` : ""}
  <div class="deal-bottom">
    <div class="tag" aria-label="Price">
      <span class="price">${gbp(d.price)}</span>
      ${d.was ? `<span class="was">was <s>${gbp(d.was)}</s></span>` : ""}
    </div>
    ${off ? `<span class="off">−${off}%</span>` : ""}
    <a class="btn" href="${esc(href)}" rel="sponsored nofollow noopener" target="_blank">See deal<span aria-hidden="true"> →</span></a>
  </div>
</article>`;
}

const deals = (list = []) => (list.length ? `<div class="deals">${list.map(dealCard).join("\n")}</div>` : "");

const disclosureNote = `<aside class="disclosure">Prices were correct when we published and can change at any time. If you buy through our links we may earn a small commission, at no extra cost to you. It never decides what we pick. <a href="/disclosure/">How we make money</a>.</aside>`;

function layout({ title, seoTitle, description, pathname, body, type = "website", jsonld, image }) {
  const fullTitle = seoTitle ? seoTitle : title ? (title.length > 48 ? title : `${title} | ${site.name}`) : `${site.name} | ${site.tagline}`;
  const ogImage = image || `${site.url}/og.png`;
  const canonical = site.url + pathname;
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title || site.name)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ogImage}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="/feed.xml">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body>
<header class="site-head">
  <div class="wrap head-inner">
    <a class="logo" href="/"><span class="logo-mark" aria-hidden="true"></span>Snapped&nbsp;Up</a>
    <nav>
      <a href="/deals/">Daily deals</a>
${(site.hubs || []).filter((h) => h.nav).map((h) => `      <a href="/${h.slug}/">${esc(h.navLabel || h.title)}</a>`).join("\n")}
      <a href="/guides/">Guides</a>
      <a href="/spotlight/">Spotlights</a>
      <a href="/about/">About</a>
    </nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer class="site-foot">
  <div class="wrap">
    <p class="foot-brand">Snapped Up</p>
    <p>${esc(site.tagline)}</p>
    <p class="foot-links"><a href="/disclosure/">Affiliate disclosure</a> · <a href="/privacy/">Privacy</a> · <a href="/about/">About</a> · <a href="/feed.xml">RSS</a></p>
    <p class="small">As an Amazon Associate, Snapped Up earns from qualifying purchases. Prices and availability change quickly, so always check the retailer's page before you buy.</p>
  </div>
</footer>
</body>
</html>`;
}

// ---------- load content ----------
const readJsonDir = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
        try { return { file: f, ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }; }
        catch (e) { throw new Error(`Bad JSON in ${dir}/${f}: ${e.message}`); }
      })
    : [];

const posts = readJsonDir(path.join(ROOT, "content/posts"))
  .filter((p) => !p.draft)
  .map((p) => ({ ...p, slug: p.slug || p.file.replace(/\.json$/, ""), type: p.type || "daily" }))
  .sort((a, b) => (b.date + (b.order || 0)).localeCompare(a.date + (a.order || 0)));

for (const p of posts) {
  for (const k of ["title", "date", "description"]) if (!p[k]) throw new Error(`${p.file}: missing "${k}"`);
  for (const d of p.deals || []) {
    if (!d.name || !d.url || d.price == null) throw new Error(`${p.file}: every deal needs name, url, price`);
  }
}

const pages = readJsonDir(path.join(ROOT, "content/pages"));
const SECTION = { spotlight: "spotlight", guide: "guides", daily: "deals" };
const LABEL = { spotlight: "Spotlight", guide: "Buying guide", daily: "Daily deals" };
const postUrl = (p) => `/${SECTION[p.type] || "deals"}/${p.slug}/`;

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (rel, content) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};
fs.cpSync(path.join(ROOT, "static"), OUT, { recursive: true });

function postTeaser(p) {
  const n = (p.deals || []).length;
  return `<a class="teaser ${p.type}" href="${postUrl(p)}">
  <span class="teaser-meta">${LABEL[p.type] || "Daily deals"} · ${p.type === "guide" ? "Updated " + shortDate(p.updated || p.date) : shortDate(p.date)}${n ? ` · ${n} picks` : ""}</span>
  <span class="teaser-title">${esc(p.title)}</span>
  <span class="teaser-desc">${esc(p.description)}</span>
</a>`;
}

// Related guides: score by shared title words, newest-updated first
const STOP = new Set("the and for with what deals deal best black friday 2026 uk to of a in is it you your now wait buy worth".split(" "));
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
function relatedFor(p) {
  const w = words(p.title + " " + (p.description || ""));
  return posts.filter((q) => q !== p && q.type === "guide")
    .map((q) => ({ q, s: [...words(q.title + " " + q.description)].filter((x) => w.has(x)).length }))
    .sort((a, b) => b.s - a.s || (b.q.updated || b.q.date).localeCompare(a.q.updated || a.q.date))
    .slice(0, 4).map((x) => x.q);
}

// Posts
for (const p of posts) {
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/${SECTION[p.type] || "deals"}/">${p.type === "guide" ? "Buying guides" : p.type === "spotlight" ? "Spotlights" : "Daily deals"}</a></nav>
<article class="post">
  <p class="kicker">${p.type === "spotlight" ? "This week's spotlight" : p.type === "guide" ? "Buying guide · Updated" : "Daily deals"} · <time datetime="${p.updated || p.date}">${fmtDate(p.updated || p.date)}</time></p>
  <h1>${esc(p.title)}</h1>
  <div class="prose lede">${md(p.intro || "")}</div>
  ${deals(p.deals)}
  ${p.body ? `<div class="prose">${md(p.body)}</div>` : ""}
  ${disclosureNote}
</article>
<section class="more">
  <h2>${p.type === "guide" ? "More buying guides" : "Buying guides"}</h2>
  <div class="teasers">${relatedFor(p).map(postTeaser).join("")}</div>
</section>
<section class="more">
  <h2>Latest deals</h2>
  <div class="teasers">${posts.filter((q) => q !== p && q.type !== "guide").slice(0, 2).map(postTeaser).join("")}</div>
</section>`;
  const img = fs.existsSync(path.join(ROOT, "static", "og", `${p.slug}.png`)) ? `${site.url}/og/${p.slug}.png` : undefined;
  write(path.join(postUrl(p), "index.html"), layout({
    image: img, seoTitle: p.seoTitle || (p.type === "daily" ? `UK deals today, ${fmtDate(p.date)} | ${site.name}` : undefined),
    title: p.title, description: p.description, pathname: postUrl(p), body, type: "article",
    jsonld: { "@context": "https://schema.org", "@graph": [
      { "@type": "Article", headline: p.title, datePublished: p.date, dateModified: p.updated || p.date, description: p.description, image: img || `${site.url}/og.png`, mainEntityOfPage: site.url + postUrl(p), author: { "@type": "Organization", name: site.name, url: site.url }, publisher: { "@type": "Organization", name: site.name, url: site.url, logo: { "@type": "ImageObject", url: `${site.url}/og.png` } } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url + "/" },
        { "@type": "ListItem", position: 2, name: LABEL[p.type] === "Buying guide" ? "Buying guides" : LABEL[p.type] === "Spotlight" ? "Spotlights" : "Daily deals", item: `${site.url}/${SECTION[p.type] || "deals"}/` },
        { "@type": "ListItem", position: 3, name: p.title, item: site.url + postUrl(p) } ] },
      ...(faqs(p.body).length ? [{ "@type": "FAQPage", mainEntity: faqs(p.body).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
    ] },
  }));
}

// Home
const latestDaily = posts.find((p) => p.type === "daily");
const latestSpot = posts.find((p) => p.type === "spotlight");
write("index.html", layout({
  pathname: "/",
  seoTitle: site.homeTitle,
  jsonld: { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", name: site.name, url: site.url + "/", description: site.description, inLanguage: "en-GB" },
    { "@type": "Organization", name: site.name, url: site.url + "/", logo: `${site.url}/og.png`, email: site.contactEmail } ] },
  body: `<section class="hero">
  <h1>The UK deals actually <span class="hl">worth having.</span></h1>
  <p>Every day we sift the sales for genuine price drops, check the "was" price isn't made up, and post only the ones worth your money.</p>
</section>
${latestSpot ? `<a class="spot-banner" href="${postUrl(latestSpot)}">
  <span class="spot-label">This week's spotlight</span>
  <span class="spot-title">${esc(latestSpot.title)}</span>
  <span class="spot-cta">Read the guide →</span>
</a>` : ""}
${posts.some((p) => p.type === "guide") ? `<section class="more">
  <div class="section-head"><h2>Buying guides</h2><a href="/guides/">All guides →</a></div>
  <div class="teasers">${posts.filter((p) => p.type === "guide").sort((x, y) => (y.updated || y.date).localeCompare(x.updated || x.date)).slice(0, 4).map(postTeaser).join("")}</div>
</section>` : ""}
${latestDaily ? `<section class="today">
  <div class="section-head"><h2>Today's picks</h2><a href="${postUrl(latestDaily)}">${esc(shortDate(latestDaily.date))} · full post →</a></div>
  ${deals((latestDaily.deals || []).slice(0, 6))}
</section>` : ""}
<section class="more">
  <div class="section-head"><h2>Latest</h2><a href="/deals/">All daily deals →</a></div>
  <div class="teasers">${posts.slice(0, 8).map(postTeaser).join("")}</div>
</section>`,
}));

// Archives
const archive = (title, intro, list, pathname) =>
  write(path.join(pathname, "index.html"), layout({ title, description: intro, pathname,
    body: `<section class="page-head"><h1>${esc(title)}</h1><p>${esc(intro)}</p></section><div class="teasers">${list.map(postTeaser).join("") || "<p>Nothing here yet.</p>"}</div>` }));
archive("Daily deals", "Every day's hand-picked UK deals, newest first.", posts.filter((p) => p.type === "daily"), "/deals/");
archive("Buying guides", "Kept-up-to-date guides to the best prices on the things people actually shop for.", [...posts.filter((p) => p.type === "guide")].sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date)), "/guides/");
archive("Spotlights", "Our weekly deep-dives on the category most worth shopping right now.", posts.filter((p) => p.type === "spotlight"), "/spotlight/");

// Topic hubs (configured in site.json "hubs"): list every post whose slug or tags match
const hubPosts = (h) => posts.filter((p) => (p.tags || []).includes(h.match) || p.slug.includes(h.match))
  .sort((a, b) => (a.type === "guide" ? 0 : 1) - (b.type === "guide" ? 0 : 1) || (b.updated || b.date).localeCompare(a.updated || a.date));
for (const h of site.hubs || []) {
  const list = hubPosts(h);
  const g = list.filter((p) => p.type === "guide"), other = list.filter((p) => p.type !== "guide").slice(0, 6);
  write(path.join(h.slug, "index.html"), layout({ title: h.title, seoTitle: h.seoTitle, description: h.description, pathname: `/${h.slug}/`,
    jsonld: { "@context": "https://schema.org", "@type": "CollectionPage", name: h.title, description: h.description, url: `${site.url}/${h.slug}/`,
      mainEntity: { "@type": "ItemList", itemListElement: g.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: site.url + postUrl(p), name: p.title })) } },
    body: `<section class="page-head"><h1>${esc(h.title)}</h1><div class="prose">${md(h.intro || "")}</div></section>
${g.length ? `<section class="more"><h2>Buying guides</h2><div class="teasers">${g.map(postTeaser).join("")}</div></section>` : ""}
${other.length ? `<section class="more"><h2>Latest posts</h2><div class="teasers">${other.map(postTeaser).join("")}</div></section>` : ""}` }));
}

// Static pages
for (const pg of pages) {
  const slug = pg.slug || pg.file.replace(/\.json$/, "");
  write(path.join(slug, "index.html"), layout({ title: pg.title, description: pg.description, pathname: `/${slug}/`,
    body: `<article class="post page"><h1>${esc(pg.title)}</h1><div class="prose">${md(pg.body)}</div></article>` }));
}

// 404
write("404.html", layout({ title: "Page not found", pathname: "/404.html",
  body: `<section class="page-head"><h1>That deal's gone.</h1><p>The page you wanted isn't here. <a href="/">Head back to today's picks</a>.</p></section>` }));

// Sitemap, robots, RSS
const urls = ["/", ...(site.hubs || []).map((h) => `/${h.slug}/`), "/deals/", "/guides/", "/spotlight/", ...pages.map((p) => `/${p.slug || p.file.replace(/\.json$/, "")}/`), ...posts.map(postUrl)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => { const p = posts.find((q) => postUrl(q) === u); return `<url><loc>${site.url}${u}</loc>${p ? `<lastmod>${p.updated || p.date}</lastmod>` : ""}</url>`; }).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
write("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site.name)}</title><link>${site.url}</link><description>${esc(site.description)}</description><language>en-gb</language>
${posts.slice(0, 30).map((p) => `<item><title>${esc(p.title)}</title><link>${site.url}${postUrl(p)}</link><guid>${site.url}${postUrl(p)}</guid><pubDate>${new Date(p.date + "T07:00:00Z").toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join("\n")}
</channel></rss>\n`);

console.log(`Built ${posts.length} posts, ${pages.length} pages → dist/`);
