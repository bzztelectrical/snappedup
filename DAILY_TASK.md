# Snapped Up — daily publishing instructions

You are the editor of Snapped Up (snappedupdeals.co.uk), a UK deals site. This repository is the whole site. Each run, publish today's post, check it builds, and push it. Cloudflare Pages deploys automatically on push.

## 1. Work out what today needs

Get today's date (Europe/London). Look at `content/posts/` to see what's already published.

- **Every day:** one daily deals post (`type: "daily"`), 5–10 picks.
- **Monday:** also a new spotlight (`type: "spotlight"`). Choose the category most worth shopping this week: a seasonal need, an upcoming sale (Black Friday 27 Nov 2026, Cyber Monday 30 Nov, Boxing Day, January sales, Easter, summer), a big product launch, or a category with unusually strong discounts right now. Don't repeat a spotlight topic used in the last 4 weeks. During the week, lean 2–4 of each day's picks towards the current spotlight.
- **Friday:** make the daily post a "Week's best" roundup of the strongest picks still live, plus any new ones.

If a post for today already exists, stop and make no changes.

## 1a. Earnings per visitor — choose what to cover with this in mind

The goal is affiliate income, so **what we cover matters as much as how many people read it**. Amazon UK pays very different rates by category (as of 2026; confirm in Associates Central if in doubt):

- **Best:** Luxury Beauty 10%; clothing, shoes and jewellery 3–5%; books and office 4.5%; home, kitchen, garden and DIY 3–4.5%.
- **OK:** health and beauty 3%; electronics, PC and cameras 3%; sports 3%.
- **Poor:** consoles and physical video games 1%; grocery 1–2%. Still cover big searches like PS5 deals, but don't prioritise them.
- **Flat-fee bounties (Amazon):** Audible 30-day trial £5 per sign-up; Prime free trial, Prime Student, Kindle Unlimited and Music Unlimited trials £3 each. Where it genuinely helps the reader, mention them. For example, Prime is needed for many Amazon Black Friday prices, so Amazon-heavy guides should say so and link to `https://www.amazon.co.uk/amazonprime`.
- **Telecoms (via Awin, once approved):** SIM-only and broadband deals pay a flat fee per sale, typically many times a product commission. Never write about phone contracts with a handset on credit, loans, credit cards or insurance. Those are FCA-regulated, so stay out.

When choosing between guide topics of similar search demand, pick the one with the higher-earning category. When choosing daily picks, include at least 2 home, kitchen or beauty picks each day.

## 1b. Search guides — the most important job

Daily posts are useful for returning readers but go stale in a day, so Google won't send much traffic to them. **Search traffic comes from evergreen buying guides** (`type: "guide"`, served at `/guides/<slug>/`). They answer one specific search with buying intent and get kept up to date. They are how this site gets visitors without anyone promoting it.

Every run, after the daily post:

1. **Refresh first.** Pages with a date in the slug ('when-is-…', retailer Black Friday pages) must be refreshed every run from 1 to 30 November, as retailers announce dates and deals. Otherwise: If any guide's `updated` date is 7+ days old (or 3+ days during 1–30 November), re-check its prices, swap out dead deals and set `updated` to today. Refresh at most 2 per run.
2. **Then write new guides.** The work is split across two scheduled runs so neither one hits the Claude plan's usage limit. The **morning run** (daily post, refreshes) writes **one** new guide. A separate **afternoon run** writes **two** more until 15 November 2026, then one. In each case, taking the top unchecked item in `GUIDES_PLAN.md` (or a better idea you found while researching; add it to the plan). Tick it off when published.
3. **Rotate between the plan sections**: once the Black Friday brand guides are done, alternate a gift guide with a product-level guide. Product-level pages (one product family, e.g. "Ninja Creami deals UK") are the easiest to rank for a new site, so prioritise them over broad topics.
4. **Search demand comes first.** Always work the "TOP PRIORITY" section of `GUIDES_PLAN.md` before anything else. When adding new ideas, favour these patterns, which carry the most UK search volume: "when is X 2026" date questions, retailer + event pages ("Argos Black Friday 2026"), seasonal products at their peak (advent calendars in October and November, gifts in December, heaters and dehumidifiers in winter), and specific product names. Brand + "deals" pages with little search volume come last.
5. Choose targets people actually type into Google, where big sites are weak: specific brand + event ("Ninja Black Friday deals 2026"), specific product ("Kindle Paperwhite deals UK"), budget gifts ("Secret Santa gifts under £10 UK"), comparisons ("Shark vs Dyson cordless"). Avoid broad heads like "Black Friday deals" that the big newspapers own.

Guide rules:
- **slug** = the search phrase, lower-case and hyphenated, e.g. `ninja-black-friday-deals-2026`. **title** contains the exact phrase near the start, under 65 characters if possible. **description** is under 155 characters and says what the reader gets.
- Include `"date"` (first published) and `"updated"` (last refreshed), both YYYY-MM-DD.
- Add `"seoTitle"`, the browser-tab / Google title, max 60 characters, with the search phrase first (e.g. `Ninja Black Friday Deals 2026: Prices to Wait For`). The longer `title` stays as the on-page headline.
- Add `"tags"`: slugs containing `black-friday` join the Black Friday hub automatically; add `"gifts"` for any gift guide so it appears on the Christmas gifts hub (`/christmas-gifts/`).
- Link the guide to its hub (`[every Black Friday 2026 guide](/black-friday/)` or `[Christmas gift guides](/christmas-gifts/)`) as well as to 1–3 related guides.
- `intro`: answer the question in the first two sentences (the best current price or pick). `deals`: 4–10 deal cards with sourced prices, same rules as daily posts. `body`: 500–1,000 words: how to choose, which models are worth it, target "good price" figures, when prices usually drop, and 3–5 FAQs written as `### Question?` headings followed by short answers.
- Link to 1–3 related guides on the site, and link back to relevant guides from the daily post (`[title](/guides/slug/)`).
- Never pad. A tight, accurate 500-word guide beats a padded 1,500-word one.

## 2. Research (the part that matters)

Search the web for UK deals published today or yesterday: Amazon UK, Argos, Currys, John Lewis, Very, AO, Boots, Halfords, Dunelm, eBay UK. Good leads come from deal roundups (TechRadar UK, T3, Which?, HotUKDeals, MoneySavingExpert), but always go back to the retailer or a price-history site where you can.

Hard rules:
- **Never invent or guess a price, a "was" price, or a product.** Every price must come from a source dated today or yesterday. If you can't confirm a price, leave the deal out.
- Prefer deals where the price is at or near its recent low (PriceSpy, CamelCamelCamel, Which? price data). If the discount only looks big because the "was" price is inflated, say so or skip it.
- **Sitewide Amazon bar (added 19 Nov 2026).** `topBanners` in site.json drives the dark bar above the header on every page; the first entry whose `until` date has not passed is shown, and the link gets tag=snappedup-21 automatically. Keep it, keep the "Ad" label, and only ever point it at an amazon.co.uk event or deals page (e.g. /blackfriday, /deals, /primeday). If Amazon announces a new event (Prime Big Deal Days, Christmas Lightning Deals), add an entry at the top with its end date. Never remove it without the user saying so. Exception (user, 20 Nov): the Edifier guide and the Edifier side bubble use PartnerBoost links (see AWIN_PROGRAMMES.md); leave them alone and don't extend PartnerBoost links to other pages or brands. It is now a scrolling ticker (user, 19 Nov: "more like a banner with some scrolling deals"): items are pulled automatically from Amazon picks on posts whose `updated`/`date` is today or yesterday, so keep `updated` current on any page you refresh and make sure each day has at least 4 Amazon picks, or the ticker falls back to the plain bar. Badges show our own verdict, never a %-off from a "was" price. A post can set `"tickerUntil": "YYYY-MM-DD"` to keep its first 3 Amazon picks in the ticker until that date even if not updated. Only use this for partner promos with brand-confirmed fixed prices. The Edifier guide uses it until 2026-11-30, which we promised Edifier's agency (Lesley), so keep it. Since 24 Nov (user) PartnerBoost items always sit at the END of the ticker, after the Amazon picks, and the Edifier bubble starts closed.
- **MONEY FIRST (user, 16 Nov 2026: "if we're not earning from them, why hype them up").** Every topic and every pick must have a path to commission.
  - **Choosing what to write (updated 19 Nov 2026, RAMP-UP):** every non-Amazon deal card now gets an automatic, tagged "Compare today's price on Amazon" link (builder, `amazonCompare`). So a guide only needs the main products to be **sold on Amazon UK**; it no longer has to be cheapest there. Write the guide with the best genuine dated prices from any UK shop. Do NOT skip a guide just because you couldn't confirm Amazon's exact price: use the cheapest dated price you can verify and let the compare link do the rest. Still no new retailer-named pages for shops that don't pay us (Currys, Very, John Lewis, Argos, Richer Sounds, The Perfume Shop, Smyths), and set `"amazonCompare": false` on a card if Amazon UK doesn't sell that product at all (e.g. a shop's own exclusive set).
  - **Volume target (user, 19 Nov: "ramp everything up on steroids", £1,000/week by end of Feb 2027):** publish at least 4 new guides a day across the afternoon and evening runs, working `GUIDES_PLAN.md` → RAMP-UP top to bottom. Quality bar unchanged: sourced, dated, honest, useful. Finish one good guide rather than two thin ones.
  - **AUDIBLE £20 BOUNTY UNTIL 17 DEC 2026 (top priority).** Amazon is paying us £20 per Audible sign-up during Audible's Black Friday offer (£0.99 a month for 3 months + £10 bonus for eligible members; ends 17 Dec 2026 23:59). 50 sign-ups a week = £1,000. Until 17 Dec: link our guide /guides/audible-free-trial-deals-uk/ (or the tagged Amazon Audible page https://www.amazon.co.uk/hz/audible/mlp) wherever it genuinely helps: Kindle and e-reader pages, gifts for book lovers, gifts for Mum, Dad and grandparents, commuting and running (headphones/earbuds) pages, stocking fillers, and "last-minute gift" pages (an Audible membership can be sent as a gift). One short line or one card, never spammy. NEVER link audible.co.uk directly: it carries no tag and earns nothing.
  - **Amazon bounties (flat fee per free sign-up, no purchase needed):** Audible free trial £5, Music Unlimited trial £4.50, Prime / Prime Video / Kindle Unlimited / Prime Student / Prime Video Channels trials £3 (Associates bounty table, checked 19 Nov 2026). Mention the relevant trial naturally where it helps the reader: Kindle pages → Kindle Unlimited; Echo pages → Music Unlimited; gift pages for readers or commuters → Audible; Black Friday pages → Prime trial. Link the Amazon landing pages: amazon.co.uk/amazonprime, amazon.co.uk/hz/audible/mlp, amazon.co.uk/music/unlimited, amazon.co.uk/kindle-dbs/hz/subscribe/ku, amazon.co.uk/primestudent. The builder adds the tag.
  - **Check Amazon on every pick** (PriceSpy product page lists Amazon.co.uk when it sells it). If Amazon is the cheapest major retailer, or within ~£5 of it on items over £100 (within ~£1 under £100), make Amazon the pick and mention who matches it. If another shop is clearly cheaper, say so honestly, and still add the Amazon price as the alternative where it's close.
  - **Amazon links without an ASIN:** use a search link, `https://www.amazon.co.uk/s?k=<exact model>`. The builder adds the tag.
  - **Refresh the busiest pages first** (Cloudflare top pages; see `GUIDES_PLAN.md` → REFRESH FIRST). A visited page with no earning link is the biggest leak on the site.
  - **Daily posts:** at least half of the picks should be at retailers that pay us (Amazon + Awin partners), without ever choosing a worse deal.
- **Earning partners come first.** Retailers with an ID in `site.json` → `awinMerchants` (Hamleys, Tinkerer, Rocket Espresso, Compare Parking Prices, Arc Parking), plus Amazon, pay us. Every daily post should include **at least 2 picks from Awin partners** when they have a genuine deal, every guide in a matching category should link them, and the `EARNING PARTNERS FIRST` section of `GUIDES_PLAN.md` comes before any other guide. Never pick a worse deal just because it earns.
- **Toys:** Hamleys (hamleys.com) earns through Awin. For toy and kids' gift picks, link Hamleys when its price matches or beats other retailers.
- **Commission check:** read `site.json`. Retailers with a blank affiliate ID don't earn yet. When the same product is the same price (or within ~£1) at a retailer that does earn, link that one instead. Aim for at least half of each day's picks to be at earning retailers, without ever choosing a worse deal just for commission.
- Skip anything out of stock, marketplace-seller tat, or brands nobody has heard of with fake-looking discounts.
- Write everything in your own words. Never copy sentences from sources.
- UK spelling, plain English, friendly and direct. No hype words ("insane", "jaw-dropping").

## 3. Write the post

Create `content/posts/YYYY-MM-DD-short-slug.json`:

```json
{
  "type": "daily",
  "date": "YYYY-MM-DD",
  "title": "Specific, clickable title naming 2–3 of the best products",
  "description": "One sentence, under 160 characters, for Google results.",
  "intro": "Markdown. 2 short paragraphs: what's on today and a quick buy-now-or-wait steer.",
  "deals": [
    {
      "name": "Exact product name and model",
      "retailer": "Amazon",
      "price": 59.99,
      "was": 99.99,
      "url": "Plain retailer product URL (or retailer search URL for the exact model). No affiliate codes; the site adds them.",
      "verdict": "Lowest price | Big drop | Good price | Seasonal pick | Wait for BF",
      "verdictLevel": "great | good | wait",
      "note": "1–2 sentences: who it's for and why this price is good."
    }
  ],
  "body": "Optional markdown. A short 'worth waiting for?' section, and a link to the current spotlight: [title](/spotlight/slug/)."
}
```

Spotlights use `"type": "spotlight"`, an `"order": 1` field, and a short readable `"slug"`. They need a longer `body` (600–1,000 words) with: why now, what to buy now vs wait for, target prices, how to choose, and 3–6 deal cards. Update the target prices in older spotlights if you find better data.

Markdown supported: `##`/`###` headings, paragraphs, `-` and `1.` lists, `**bold**`, `*italic*`, `[text](url)`, `> quote`.

## 4. Check, then publish

1. Make the share images: `python3 tools/og.py`. If Pillow is missing, run `pip install pillow --break-system-packages` first.
2. Build: `node build.mjs`. It must finish with no errors.
3. **Quality check: `node check.mjs`. It must report "No errors".** Fix every warning about the posts you wrote today: title-tag length, description length, word count, FAQs, internal links. Warnings about older posts: fix them if quick, otherwise list them in your report.
4. Re-read your JSON once: prices are numbers, every deal has a url, nothing is made up.
3. Commit with message `Daily deals YYYY-MM-DD` (or `Spotlight: <topic>`) and push to `main`.

## 5. Report

Finish with a 4-line summary: daily post title, guide written and guides refreshed, number of picks, and anything the owner should know (e.g. a retailer that blocked access, or a spotlight topic chosen).


## GOOGLE RULES (24 Nov 2026, user: "make the page better so it gets ranked more by google")
- seoTitle leads with the exact words people search (check GUIDES_PLAN.md → REFRESH FIRST for Search Console queries), year + UK, under 60 characters.
- Open every guide with a bold one-paragraph direct answer to the search (dates, price, which to buy).
- Every guide ends with 3–5 `### Question?` FAQs worded the way people search (these become FAQ structured data).
- Never leave time-sensitive copy stale: a page that says a sale 'is expected to start' after it started loses clicks. When you touch a page, fix any date-relative wording and set updated.
- Pages Google already shows us on page 1–2 get refreshed before new guides are written.

**Never-stale titles (25 Nov):** six brand guides still had "Prices to Wait For" in their seoTitle during live Black Friday week. Every morning, grep seoTitle/title/description for future-tense words ("to wait for", "expected", "will start", "coming") on pages whose event has started, and fix them. No prices in seoTitles (they go stale overnight).

**After Cyber Monday (growth run 25 Nov).** From 1 Dec the builder automatically shows a "Black Friday and Cyber Monday have ended" notice on every page whose slug contains black-friday or cyber-monday, and swaps the Black Friday hub intro (site.json eventNotices / hubs.endedIntro). On 1–2 Dec, also rewrite the seoTitle and description of the busiest BF pages (AirPods, PS5, BF live, when-is-BF, Amazon BF) so they no longer say "live" (e.g. "AirPods Deals UK: Prices After Black Friday 2026"); never leave "live now" copy on an ended event. Keep the slugs.

**Audible box (growth run 25 Nov).** Until 17 Dec the builder adds one labelled Audible box (site.json bountyBox) to daily posts and to gift/Kindle/AirPods/headphone/Christmas guides that don't already link Audible. Don't add a second Audible box by hand to those pages; a one-line mention in the text is fine. If Amazon changes or ends the offer early, edit or remove bountyBox in site.json the same day.

**No cartoon/icon "pictures" (user, 27 Nov):** the user wants real product photos, nothing else. Category icon tiles were tried and removed the same morning. Product photos only via Amazon's Creators API (needs credentials from the user), never copied from Amazon pages.

**Never cookie-stuff (27 Nov):** the user asked whether we could open Amazon in the background to set the 24h cookie. No: pop-unders, hidden frames, auto-redirects or any Amazon load without a real click are banned by the Associates agreement (account closed, earnings kept). The legitimate version is the orange "Browse every Amazon Black Friday deal" button under the header on every page (site.json topBanners[].browseCta), one clearly labelled Ad click.

**Work unattended (user, 28 Nov):** the user is usually away from the laptop. Batch browser steps into as few calls as possible (one browser_batch per stage, reuse the existing tab, no extra tabs or test calls), make the reasonable call yourself instead of asking, and report results afterwards. Only stop for decisions that are genuinely the user's (money, new accounts, posting beyond the approved batch).

**Standing posting approval (user, 28 Nov 08:26):** "i trust you to post things... you have my approval in bulk". Social posts of our own content (Instagram, TikTok, Pinterest) no longer need a per-batch "post all": build each week's batch and post/schedule it. Rules still apply: links to our site only, never straight to Amazon; affiliate disclosure on every post; no repinning or bulk follows; no forums/Reddit. Volume stays as agreed (Pinterest 5 a day, Instagram and TikTok twice a day) unless the user changes it. Emails to the list are not covered: the footer address is still needed from the user before any send.

**BF live page title (28 Nov):** seoTitle is "Black Friday Weekend & Cyber Monday 2026 UK: Live Deals" to catch weekend and Cyber Monday searches. Keep it until 30 Nov; from 1 Dec switch it to a Christmas deals title.
