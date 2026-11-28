// GET /api/amz?asin=B0XXXX  or  /api/amz?q=keywords
// Official Amazon product photo + product-page link via Amazon's Creators API (the only way the Associates
// rules allow Amazon images on our site). Credentials live in Cloudflare Pages secrets AMAZON_CREDENTIAL_ID /
// AMAZON_CREDENTIAL_SECRET (added by the user, 27 Nov 2026). Never log or return them.
// Answers are cached at the edge for 24 hours (Amazon content must be refreshed at least daily); errors for 1 hour.

const TOKEN_URLS = ["https://api.amazon.co.uk/auth/o2/token", "https://api.amazon.com/auth/o2/token"];
const API = "https://creatorsapi.amazon/catalog/v1";
const MARKET = "www.amazon.co.uk";
const TAG = "snappedup-21";
const RESOURCES = ["images.primary.large", "itemInfo.title"];

let cachedToken = null;
let tokenExpires = 0;
// Circuit breaker (28 Nov): after Amazon says "rate limit" or "not eligible", stop calling it from this
// isolate for a while instead of hammering it once per card per page view.
let pausedUntil = 0;
let pausedReason = "";

async function getToken(env) {
  if (cachedToken && Date.now() < tokenExpires - 60_000) return cachedToken;
  const creds = { grant_type: "client_credentials", client_id: env.AMAZON_CREDENTIAL_ID, client_secret: env.AMAZON_CREDENTIAL_SECRET, scope: "creatorsapi::default" };
  let last = "";
  for (const url of TOKEN_URLS) {
    for (const asForm of [false, true]) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": asForm ? "application/x-www-form-urlencoded" : "application/json" },
        body: asForm ? new URLSearchParams(creds).toString() : JSON.stringify(creds),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.access_token) {
          cachedToken = j.access_token;
          tokenExpires = Date.now() + (j.expires_in || 3600) * 1000;
          return cachedToken;
        }
      }
      last = `token ${new URL(url).hostname} ${asForm ? "form" : "json"} ${r.status}`;
    }
  }
  throw new Error(last);
}

const words = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9.+ ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !["the", "and", "with", "for", "uk", "deal", "deals", "black", "friday"].includes(w));

// Pick the search result whose title shares the most words with the query; refuse weak matches so we never
// show (or link to) the wrong product.
function bestMatch(items, q) {
  const qw = [...new Set(words(q))];
  let best = null, bestScore = 0;
  for (const it of items || []) {
    const tw = new Set(words(it?.itemInfo?.title?.displayValue));
    const hit = qw.filter((w) => tw.has(w)).length;
    const score = qw.length ? hit / qw.length : 0;
    if (score > bestScore) { best = it; bestScore = score; }
  }
  return bestScore >= 0.6 ? best : null;
}

async function callApi(env, op, body) {
  const token = await getToken(env);
  const r = await fetch(`${API}/${op}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "x-marketplace": MARKET },
    body: JSON.stringify({ partnerTag: TAG, partnerType: "Associates", marketplace: MARKET, resources: RESOURCES, ...body }),
  });
  const text = await r.text();
  if (!r.ok) {
    let code = "";
    try { const j = JSON.parse(text); code = j?.errors?.[0]?.code || j?.code || j?.message || ""; } catch {}
    throw new Error(`${op} ${r.status} ${String(code).slice(0, 80)}`);
  }
  return JSON.parse(text);
}

function shape(it) {
  if (!it) return { ok: false, error: "no confident match" };
  const img = it?.images?.primary?.large?.url;
  let url = it?.detailPageURL || `https://www.amazon.co.uk/dp/${it.asin}`;
  if (!/[?&]tag=/.test(url)) url += (url.includes("?") ? "&" : "?") + `tag=${TAG}`;
  if (!img) return { ok: false, error: "no image" };
  return { ok: true, asin: it.asin, img, url, title: it?.itemInfo?.title?.displayValue || "" };
}

export async function onRequestGet({ request, env, waitUntil }) {
  const u = new URL(request.url);
  const asin = (u.searchParams.get("asin") || "").trim().toUpperCase();
  const q = (u.searchParams.get("q") || "").trim().slice(0, 120);
  const json = (obj, ttl) => new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${ttl}`, "X-Robots-Tag": "noindex" },
  });
  if (!/^[A-Z0-9]{10}$/.test(asin) && q.length < 3) return json({ ok: false, error: "bad request" }, 3600);
  if (!env.AMAZON_CREDENTIAL_ID || !env.AMAZON_CREDENTIAL_SECRET) return json({ ok: false, error: "not configured" }, 300);

  if (Date.now() < pausedUntil) return json({ ok: false, error: "paused: " + pausedReason }, 300);

  const cache = caches.default;
  const key = new Request(`https://cache.snappedup/amz?${asin ? "asin=" + asin : "q=" + encodeURIComponent(q.toLowerCase())}`);
  const hit = await cache.match(key);
  if (hit) return hit;

  let out, ttl;
  try {
    if (asin) {
      const j = await callApi(env, "getItems", { itemIds: [asin], itemIdType: "ASIN" });
      out = shape(j?.itemsResult?.items?.[0]);
    } else {
      const j = await callApi(env, "searchItems", { keywords: q, searchIndex: "All", itemCount: 5 });
      out = shape(bestMatch(j?.searchResult?.items, q));
    }
    ttl = out.ok ? 86400 : 21600;
  } catch (e) {
    const msg = String(e.message || e).slice(0, 120);
    out = { ok: false, error: msg };
    if (/ 429 /.test(msg)) { pausedUntil = Date.now() + 10 * 60_000; pausedReason = "rate limit"; ttl = 1800; }
    else if (/ 403 /.test(msg)) { pausedUntil = Date.now() + 60 * 60_000; pausedReason = "not eligible"; ttl = 21600; }
    else ttl = 3600;
  }
  const res = json(out, ttl);
  waitUntil(cache.put(key, res.clone()));
  return res;
}
