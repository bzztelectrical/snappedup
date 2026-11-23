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
