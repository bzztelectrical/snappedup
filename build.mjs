// Snapped Up — zero-dependency static site builder.
// Run: node build.mjs   → outputs to ./dist
// Content lives in ./content (posts as JSON, pages as JSON). See README.md.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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
  ${amazonCompare(d)}
</article>`;
}

// Secondary "compare on Amazon" link on every non-Amazon card (tagged search; opt out with "amazonCompare": false).
function amazonCompare(d) {
  if (d.amazonCompare === false) return "";
  if (/amazon/i.test(d.retailer || "") || /amazon\.co\.uk/.test(d.url || "")) return "";
  const q = String(d.name || "").replace(/\([^)]*\)/g, " ").replace(/[+–—|]/g, " ").replace(/\s+/g, " ").trim();
  if (!q) return "";
  const url = affiliate(`https://www.amazon.co.uk/s?k=${encodeURIComponent(q).replace(/%20/g, "+")}`);
  return `<a class="amz-compare" href="${esc(url)}" rel="sponsored nofollow noopener" target="_blank">Compare today's price on Amazon<span aria-hidden="true"> →</span></a>`;
}

// "Our top picks" box at the top of guides: 3 direct product links (great verdicts first, then Amazon), above the intro.
function quickPicks(list = []) {
  if (!list || list.length < 4) return "";
  const rank = (d) => (d.verdictLevel === "great" ? 0 : d.verdictLevel === "good" ? 1 : 2) * 2 + (/amazon/i.test(d.retailer || "") ? 0 : 1);
  const pick = [...list].map((d, i) => [d, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).slice(0, 3).map((x) => x[0]);
  const row = (d) => `<li><span class="qp-name">${esc(d.name)}</span><span class="qp-meta"><strong>${gbp(d.price)}</strong> at ${esc(d.retailer || "")}</span><a class="qp-btn" href="${esc(affiliate(d.url))}" rel="sponsored nofollow noopener" target="_blank">See deal<span aria-hidden="true"> →</span></a></li>`;
  return `<aside class="quick-picks" aria-label="Our top picks"><p class="qp-title">Our top picks right now</p><ol>${pick.map(row).join("")}</ol><p class="qp-note">Prices as checked on the date above. <a href="#deals">See all ${list.length} picks ↓</a></p></aside>`;
}

const deals = (list = []) => (list.length ? `<div class="deals" id="deals">${list.map(dealCard).join("\n")}</div>` : "");

// Sitewide Amazon bar: filled in once posts are loaded (see "sitewide Amazon ticker" below).
let topBanner = "";
// Cache-buster: changes whenever style.css changes, so browsers never pair new HTML with an old stylesheet.
const cssVersion = crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, "static/style.css"))).digest("hex").slice(0, 8);


// Edifier (PartnerBoost) side bubble, sitewide until site.edifierBubble.until (user, 20 Nov 2026). Hidden on the Edifier guide itself; closable per session.
const partnerBubble = (() => {
  const b = site.edifierBubble;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  if (!b || b.until < today) return "";
  const rows = b.picks.map((d) => `<li><a href="${esc(d.url)}" rel="sponsored nofollow noopener" target="_blank"><span class="pb-name">${esc(d.name)}</span><span class="pb-price">${gbp(d.price)}${d.was ? ` <s>${gbp(d.was)}</s>` : ""}</span></a></li>`).join("");
  return `<aside class="partner-bubble" id="pb" data-guide="${esc(b.guide)}" aria-label="Edifier Black Friday deals (ad)">
  <button class="pb-toggle" type="button" aria-expanded="false" aria-controls="pb-panel"><span class="pb-dot" aria-hidden="true"></span>Edifier Black Friday <span class="pb-chev" aria-hidden="true">▴</span></button>
  <div class="pb-panel" id="pb-panel">
    <div class="pb-head"><span class="pb-ad">Ad</span><strong>Edifier on Amazon</strong><button class="pb-close" type="button" aria-label="Close">×</button></div>
    <p class="pb-sub">Black Friday prices until 30 Nov</p>
    <ul>${rows}</ul>
    <a class="pb-all" href="${esc(b.guide)}">All 15 Edifier deals →</a>
  </div>
</aside>
<script>(()=>{const el=document.getElementById("pb");if(!el)return;if(location.pathname===el.dataset.guide){el.remove();return;}
let st=null;try{st=sessionStorage.getItem("pb")}catch(e){}
if(st==="closed"){el.remove();return;}
const t=el.querySelector(".pb-toggle");const set=o=>{el.classList.toggle("open",o);t.setAttribute("aria-expanded",o);try{sessionStorage.setItem("pb",o?"open":"min")}catch(e){}};
if(st==="open")el.classList.add("open"),t.setAttribute("aria-expanded","true");
t.addEventListener("click",()=>set(!el.classList.contains("open")));
el.querySelector(".pb-close").addEventListener("click",()=>{el.remove();try{sessionStorage.setItem("pb","closed")}catch(e){}});})();</script>`;
})();

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
<meta name="partnerboostverifycode" content="32dc01246faccb7f5b3cad5016dd5033" />
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
<link rel="stylesheet" href="/style.css?v=${cssVersion}">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body>
${topBanner}
<header class="site-head">
  <div class="wrap head-inner">
    <a class="logo" href="/"><span class="logo-mark" aria-hidden="true"></span>Snapped&nbsp;Up</a>
    <nav>
      <a href="/deals/">Daily deals</a>
${(site.hubs || []).filter((h) => h.nav && (!h.navUntil || h.navUntil >= todayUK)).map((h) => `      <a href="/${h.slug}/">${esc(h.navLabel || h.title)}</a>`).join("\n")}
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
    <p class="foot-links"><a href="/disclosure/">Affiliate disclosure</a> · <a href="/privacy/">Privacy</a> · <a href="/about/">About</a> · <a href="/contact/">Contact</a> · <a href="/feed.xml">RSS</a></p>
    <p class="small">As an Amazon Associate, Snapped Up earns from qualifying purchases. Prices and availability change quickly, so always check the retailer's page before you buy.</p>
  </div>
</footer>
${partnerBubble}
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

// ---------- sitewide Amazon ticker ----------
// Banner text/link: first topBanners entry whose "until" (UK date) hasn't passed.
// Ticker items: Amazon picks from posts updated today or yesterday only (never stale prices).
const todayUK = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const yesterdayUK = new Date(Date.now() - 864e5).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
topBanner = (() => {
  const b = (site.topBanners || []).find((x) => x.until >= todayUK);
  if (!b) return "";
  const seen = new Set();
  const items = [];
  for (const p of [...posts].sort((x, y) => (y.updated || y.date).localeCompare(x.updated || x.date))) {
    // fresh = updated today/yesterday, or a partner promo with fixed prices until p.tickerUntil
    if ((p.updated || p.date) < yesterdayUK && !(p.tickerUntil && p.tickerUntil >= todayUK)) continue;
    let fromThis = 0;
    for (const d of p.deals || []) {
      if (fromThis >= 3) break; // variety: max 3 ticker items per page
      const pinned = !!(p.tickerUntil && p.tickerUntil >= todayUK); // partner promo we promised to feature
      if (d.ticker === false) continue;
      if (d.retailer !== "Amazon" || !(/amazon\.co\.uk/.test(d.url) || (pinned && /pboost\.me/.test(d.url)))) continue;
      const key = d.name.toLowerCase().replace(/^(amazon|apple)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, 4).join(" "); // one per product family
      const key2 = key.split(" ").slice(0, 2).join(" ") + "@" + d.price; // same brand, same price = same product
      if (seen.has(key) || seen.has(key2)) continue;
      seen.add(key);
      seen.add(key2);
      items.push({ ...d, pinned });
      fromThis++;
    }
  }
  // Rank by our own verdict, not by "was" prices (many are inflated RRPs we tell readers to ignore).
  const rank = { great: 0, good: 1 };
  items.sort((x, y) => (y.pinned ? 1 : 0) - (x.pinned ? 1 : 0) || (rank[x.verdictLevel] ?? 2) - (rank[y.verdictLevel] ?? 2));
  // Partner (PartnerBoost/Edifier) items go LAST (user, 24 Nov): in 7 days they took 117 clicks with 0 orders
  // while Amazon clicks fell ~13/day. Amazon picks (incl. the pinned Audible bounty) lead the ticker.
  const isPartner = (d) => /pboost\.me/.test(d.url);
  const amzItems = items.filter((d) => !isPartner(d)), partnerItems = items.filter(isPartner);
  const pick = [...amzItems.slice(0, 14 - Math.min(3, partnerItems.length)), ...partnerItems.slice(0, 3)];
  const cta = `<a class="tb-cta" href="${esc(affiliate(b.url))}" rel="sponsored nofollow noopener" target="_blank"><span class="tb-cta-long">${esc(b.cta)}</span><span class="tb-cta-short">All deals</span><span aria-hidden="true"> →</span></a>`;
  const tbScript = `<script>(()=>{const b=document.querySelector(".top-banner");if(!b)return;const f=()=>document.documentElement.style.setProperty("--tb-h",b.offsetHeight+"px");f();if(window.ResizeObserver)new ResizeObserver(f).observe(b);})();</script>`;
  const label = `<span class="tb-label"><span class="tb-ad">Ad</span><strong>${esc(b.text)}</strong></span>`;
  if (pick.length < 4) {
    return `<div class="top-banner"><div class="tb-inner tb-static">${label}${cta}</div></div>
${tbScript}`;
  }
  const li = (d, hidden) => {
    const badge = d.verdictLevel === "great" && d.verdict && d.verdict.length <= 16 ? ` <span class="tb-off">${esc(d.verdict)}</span>` : "";
    return `<li><a href="${esc(affiliate(d.url))}" rel="sponsored nofollow noopener" target="_blank"${hidden ? ' tabindex="-1"' : ""}><span class="tb-name">${esc(d.name)}</span> <span class="tb-price">${gbp(d.price)}</span>${badge}</a></li>`;
  };
  const list = (hidden) => `<ul class="tb-list"${hidden ? ' aria-hidden="true"' : ""}>${pick.map((d) => li(d, hidden)).join("")}</ul>`;
  const secs = Math.max(30, pick.length * 5);
  const checked = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
  return `<div class="top-banner" role="region" aria-label="Amazon deals (affiliate links)">
  <div class="tb-inner">
    ${label}
    <div class="tb-ticker"><div class="tb-track" style="--tb-secs:${secs}s">${list(false)}${list(true)}</div></div>
    ${cta}
  </div>
  <p class="tb-note">Amazon prices checked ${esc(checked)} · prices change fast · we may earn commission</p>
</div>
${tbScript}`;
})();

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
  ${p.type === "guide" ? quickPicks(p.deals) : ""}
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

// /start/: the one address we say on TikTok/Instagram (no clickable links there). Today's best picks plus shortcuts.
// Shows up as its own path in Web Analytics, which gives us social attribution. noindex: it's a landing page, not an SEO page.
{
  const fresh = [...posts].filter((p) => (p.updated || p.date) >= yesterdayUK || (p.tickerUntil && p.tickerUntil >= todayUK))
    .sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date));
  const seen = new Set(); const top = [];
  for (const p of fresh) for (const d of p.deals || []) {
    if (top.length >= 8 || d.verdictLevel !== "great" || d.ticker === false) continue;
    const k = d.name.toLowerCase().split(" ").slice(0, 3).join(" ");
    if (seen.has(k)) continue; seen.add(k); top.push(d);
  }
  const links = [
    ["Black Friday live deals", "/guides/black-friday-2026-live-deals-uk/", todayUK <= "2026-11-30"],
    ["Christmas gift guides", "/christmas-gifts/", todayUK <= "2026-12-25"],
    ["Audible: £0.99 a month for 3 months", "/guides/audible-free-trial-deals-uk/", todayUK <= "2026-12-17"],
    ["Edifier headphones & speakers sale", "/guides/edifier-black-friday-deals-2026-uk/", todayUK <= "2026-11-30"],
    ["Today's daily deals", "/deals/", true],
  ].filter((x) => x[2]);
  const body = `<section class="page-head"><h1>Today's best deals</h1><p>Picked and price-checked by Snapped Up. Tap any deal to see it at the shop.</p>
<p class="start-links">${links.map(([t, u]) => `<a class="btn start-btn" href="${u}">${esc(t)} →</a>`).join(" ")}</p></section>
${deals(top)}
${disclosureNote}`;
  const html = layout({ title: "Today's best deals", description: "Snapped Up's best UK deals today, price-checked.", pathname: "/start/", body })
    .replace('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">', '<meta name="robots" content="noindex, follow">');
  write(path.join("start", "index.html"), html);
  // Per-channel copies (25 Nov): 98% of visits arrive with no referrer, so we can't tell TikTok from Instagram from
  // Pinterest from WhatsApp. Each channel gets its own short address; Web Analytics' Path view is then the attribution.
  // /tt = TikTok, /ig = Instagram, /pin = Pinterest, /fb = Facebook. Same page, canonical /start/, noindex.
  for (const ch of ["tt", "ig", "pin", "fb"]) write(path.join(ch, "index.html"), html);
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
