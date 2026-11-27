# Growth log (critical weekly review; user 22 Nov: "be super critical every week")

## 22 Nov 2026: baseline review (from Cloudflare Web Analytics + Google Search Console, checked in Chrome)

### What's not working
- **Google is sending almost nothing.** Search Console: 9 clicks in 3 months (3 clicks / 579 impressions in the last 7 days), average position ~35–43. Discover: 0. 83 pages indexed, 19 not (14 "discovered, not indexed"). The domain is ~5 weeks old with no backlinks, so head terms ("black friday 2026", "black friday deals") are owned by big publishers and we sit on page 4+. Writing more head-term pages will not move revenue before Christmas.
- **We can't see which channel works.** 1,229 of 1,240 visits have no referrer (in-app browsers / typed URL). The likely driver is TikTok/Instagram viewers typing snappedupdeals.co.uk (iOS Safari = 45% of visits), but it's unproven. Pinterest/TikTok/Instagram's own stats are the only attribution we have, so read them every Monday.
- 456 visits have Unknown browser/OS, likely bots that slip past the filter, so real humans ≈ 800/week.
- www and apex were both serving the site (557/687 split). FIXED 22 Nov with a 301 (functions/_middleware.js).
- Audible £20 bounty: our Audible page linked to audible.co.uk (untagged). FIXED 22 Nov.

### What is working
- Amazon clicks went from ~2–10/day to ~55–60/day after the ticker, Compare-on-Amazon links and top-picks boxes (19–20 Nov). Conversion is 21.6%. On-page changes convert the traffic we do get.
- Real visits more than doubled week on week (~500 → 1,240), while Google stayed flat, so the growth came from social/direct.

### Decisions
1. **Social is the engine until Google matures.** Raise output (2 TikTok/Instagram carousels a day, 35 pins a week), still one Monday approval.
2. **SEO: go long-tail only.** Specific product pages ("is the Ninja Crispi worth it", "Kindle Paperwhite vs Colorsoft", "best air fryer under £100") and gift-by-person pages, not head terms dominated by big publishers. GUIDES_PLAN updated.
3. Keep converting harder on-site (it works): top picks, ticker, compare links, bounties.

### Ideas for next week
- A "Snapped Up" link-in-bio style landing page (/start/) listing this week's top 5 deals, used as the one URL we say on TikTok/Instagram, so typed visits land on a high-converting page and show up as a path in Web Analytics (attribution).
- Make every carousel's end slide say "snappedupdeals.co.uk/start", so it's measurable.
- Internal links from the AirPods page (our #1 page) to the gift guides and the Audible page.

## 23 Nov 2026: critical review after user push ("clicks are going down... we should be seeing a massive climb")
- Facts: ~180 real visits/day, flat all week (Cloudflare WA, bots excluded). ~26% of visitors click to Amazon (good). Amazon clicks/day fell ~60 → ~47 while earnings rose to £15–17/day purely on Black Friday basket size. Run-rate ≈ £110/week.
- Diagnosis: the site converts; it has no volume channel. Google ~0 (new domain), TikTok/Instagram have no clickable links (~150 views/post), Pinterest only 5 pins/day.
- Shipped today: IndexNow (static/<key>.txt + .github/workflows/indexnow.yml). All 138 URLs submitted to Bing/Yandex (HTTP 202); every push and a nightly run re-submit new/updated pages. Bing/DDG/Yahoo index in days, not months.
- Ramp plan, in order of expected clicks: (1) Pinterest 5 → 20 pins/day, a fresh pin for every guide (needs free business account for scheduling/bulk CSV); (2) TikTok business account → website link in bio; (3) email capture on /start + guides with a daily top-5 email (needs MailerLite account); (4) Facebook Page (biggest UK deals audience; also unlocks Instagram scheduling via Meta Business Suite).
- Judge on Sun 29 Nov: target 400+ visits/day and 100+ Amazon clicks/day. Anything that hasn't moved the numbers gets cut.

## 25 Nov: why clicks fell (diagnosis)
- Cloudflare 14 days, bots excluded: 98% of visits have NO referrer (1,770 of 1,800). Google 10, Bing 10.
- Sun 22 "spike" (~480) was ~360 German visits with an Unknown browser: bots, not people. Ignore it.
- Real UK visits: Thu 19 ~190, Fri 20 ~150, Sat 21 ~180, then ~100/day Sun 22 to Tue 24. That's the drop.
- The drop is one page: the AirPods BF guide went from 60 visits/day (19 and 20 Nov) to ~0 by 23 Nov. Source unknown (no referrer, UK iPhones).
- Google is NOT the source: GSC 8 clicks in 28 days, 0 on 19 to 22 Nov; Discover 0. SEO isn't producing visits yet.
- Fixes: per-channel addresses /tt /ig /pin /fb so the Path view finally attributes traffic; six BF brand-guide titles said "Prices to Wait For" during live BF week, now say live deals.
- The real lever is clickable links: Pinterest (links work today), TikTok Business bio link, Instagram bio link. Asked the user about more pins and the TikTok Business switch again.

## 25 Nov 2026 (Wednesday growth run)

### What's not working (blunt)
- **We are at ~10% of target and the trend is the wrong way.** November to date: £66.97 from 372 Amazon clicks and 79 items. Best days were ~£15–17 (BF baskets); run-rate ≈ £80–110/week against £1,000. Amazon clicks/day went 60 → 47 → 33 in a week; real UK visits fell from ~170/day to ~100/day. To hit £1,000/week by end of Feb we need ~10x the traffic, and earnings per click will fall after Cyber Monday.
- **No volume channel.** 98% of visits have no referrer; Google sent ~0 clicks (GSC 8 in 28 days); TikTok/Instagram views don't turn into visits without a clickable link. Our #1 page (AirPods, 60 visits/day) lost its unknown source and nothing replaced it. Writing 4 guides a day has not produced search traffic yet; it's a bet on December/January, not this week.
- **Can't measure:** the per-channel addresses (/tt /ig /pin /fb) only went live 25 Nov; Audible bounty sign-ups since the 22 Nov fix aren't in the scorecard yet (no bounty line in Amazon's figures on 23–25 Nov); PartnerBoost (Edifier) is logged out, so 117 Edifier clicks with 0 known orders is still unexplained.
- **Cliff on 1 Dec:** ~37 Black Friday/Cyber Monday pages (most of our traffic) go stale overnight and would have kept saying "live deals".

### Leak audit (content/posts + dist)
- No audible.co.uk links (the one mention is plain cancel instructions). Good.
- **Top-picks boxes on 47 guides pointed their 3 most prominent buttons at shops that don't pay us** (Very, Currys, Argos, John Lewis…), because ranking only preferred "Amazon" by name. FIXED in the builder: earning links (Amazon, eBay, Awin partners, PartnerBoost) rank first within a verdict level, and any non-earning top pick now carries a tagged "compare on Amazon" link.
- **Expired promo:** Very guide still said code EXTRA "takes another 10% off" (ended 18 Nov) and called 14 Nov prices "today". FIXED: past tense, prices clearly dated 14 Nov.
- **Stale page with zero earning links:** Pokémon ETB guide still called Delta Reign (6 Nov) "the next release" and had no Amazon link. FIXED: past tense, next set (Flowing Fists, 5 Feb 2027), tagged Amazon ETB search with a "sold by Amazon" warning.
- Still leaking (needs dated prices, so left for the daily runs, listed in GUIDES_PLAN/REFRESH): 22 guides have no earning cards at all (only the compare links): Argos/Boots/Currys/Very retailer pages, broadband/SIM (Awin not approved), heaters, dehumidifier, hampers, Christmas gifts for her/kids under £X, secret Santa, stocking fillers under £5, STEM, Ninja Creami/Slushi, Shark vs Dyson, mattress, Smeg. Boxing Day guide (0 earning cards, updated 30 Oct) added to the plan with a 5 Dec deadline. Treadmill (GSC page 1–2) still not refreshed since 3 Nov: 4th run in a row it was skipped.
- Kindle Unlimited (GSC #2) and Audible pages have only 1 and 3 cards, so no top-picks box; acceptable as their first card sits right under the intro.

### Experiments shipped
1. **Audible £20 bounty box** (site.json `bountyBox`, until 17 Dec). One labelled "Ad" box under the deal cards on every daily post and on 22 gift/AirPods/headphone/Kindle/Christmas/BF-live guides that didn't link Audible (kids/toy pages excluded). Why: one Audible sign-up = £20 = roughly 60 product clicks at our current EPC; it was linked from only 26 pages and not from our biggest page (AirPods). Judge: Audible bounties in Associates' Bounty report by Wed 2 Dec. ≥10 sign-ups (£200) = keep and extend to more pages; 0–2 = the offer isn't converting our audience, drop the box on 17 Dec anyway.
2. **Post-Black-Friday auto-transition** (site.json `eventNotices` + hub `endedIntro`). From 1 Dec, all 37 BF/Cyber Monday pages show an "ended" notice with the date prices were checked and three next steps (tagged Amazon deals today, Christmas gift guides, today's deals); the BF hub intro switches to "ended, here's what's next" and points to the Boxing Day guide. Tested by simulating 2 Dec. Why: keeps the visitors we do have on pages that can still earn in December instead of bouncing off stale "live" prices, and keeps the pages honest so they can rank for Boxing Day/January. Judge: Amazon clicks/day in 1–7 Dec vs 24–30 Nov, and bounce/second-page views on the AirPods and PS5 pages in Web Analytics.
3. (Leak fix with measurable effect) Top-picks earning-first ranking + Amazon compare links on 47 guides. Judge: Amazon clicks per 100 visits on Very/Currys/Argos/gift-under-£X pages next week.

### Ideas for next week
- Write the Boxing Day refresh (Amazon-first) and a "when is the Amazon Boxing Day sale 2026" section before 5 Dec; add a "Gifts by person" homepage module that replaces the Black Friday guides on 1 Dec.
- `audible-vs-kindle-unlimited-uk` and `audible-gift-membership-uk`: two bounty pages while Audible pays £20 (until 17 Dec).
- Add simple outbound-click counting (Cloudflare Web Analytics can't see clicks; a tiny first-party beacon to a Pages Function logging to KV/Analytics Engine) so we can see which modules (ticker, top picks, bounty box, compare links) earn and cut the rest.

## 26 Nov: user decisions
- Pinterest: keep 5 pins a day (user declined 15/day). Don't propose again this week.
- Facebook: user didn't share and doesn't want Facebook. The 6 facebook.com visits on 25 Nov came from someone else's share; nothing to do.
- TikTok: user will switch to a Business account today. Once done: bio link = https://snappedupdeals.co.uk/tt, and every new TikTok caption says "link in bio" instead of "type the address".
- 25 Nov numbers: ~36 clicks, 13 ordered, +£19.38 (best day, BF basket size + dispatch of earlier orders). Visits 114/24h, ~32% click through. /ig sent 6 visits from 2 posts.
- 26 Nov 12:21: TikTok won't accept a link (account already Business). No clickable link on TikTok or Instagram (IG unlocks 19 Dec). Only clickable channels: Pinterest (5/day, user's choice) and Google. TikTok/IG must work through the typed short addresses /tt and /ig.

## 27 Nov: email list live (Kit)
- User created a Kit account (on a 14-day trial, then the free plan, up to 10,000 subscribers). Never upgrade without the user.
- Form "Snapped Up daily deals (site)", ID 10250018, plain HTML POST from our sign-up box (guides + /start). Double opt-in ON. Sign-up → /thanks/ (check inbox), confirm → /confirmed/ (today's deals). Both noindex.
- Before the first email: the user must choose the postal address for the email footer (Kit/anti-spam rule) and the sender should be hello@snappedupdeals.co.uk. Every send needs the user's OK. Emails link only to our site, never to Amazon.
