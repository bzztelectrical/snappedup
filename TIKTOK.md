# TikTok (@snappeddeals): what we've learned

## Results so far (checked 6 Nov 2026)
| Video | Posted | Views | Likes | Comments |
|---|---|---|---|---|
| Winter essentials at their lowest price (v1 and v2) | 1 Nov | 712 / 708 | 3 / 2 | 1 / 0 |
| Buy now or wait? (25 days to Black Friday) | 2 Nov | 744 | 3 | 0 |
| Real deal or fake discount? | 5 Nov | 712 | 4 | 0 |
| Guess the price (old slow opening) | 6 Nov 19:30 | 750 | 1 | 0 |
| Real or fake? (new instant-start format) | 8 Nov 09:23 | 236 | 2 | 0 |

Analytics for "Buy now or wait?": average watch time **2.2 seconds**, only **0.7%** watched to the end, and **most viewers left at 0:01**. Traffic was 92% For You and 6% search ("black friday sales 2026", "black friday 2026 uk").

## Why every video stops at ~700 views
TikTok shows each new video to a test audience of a few hundred people. Almost all of them swipe away in the first second, so it never gets shown more widely. The first second of our videos is the problem:
- The opening frame is mostly an empty black screen while the text animates in.
- The red "Visit snappedupdeals.co.uk" banner at the top makes it look like an advert straight away.
- There's no product or price visible in the first second.

## Rules for the next videos
1. **Frame one must already be full.** Show the most striking product and price, plus the question, from the very first frame. No fade-in from a blank screen.
2. **Lead with the best item**, the biggest price surprise, as the hook (e.g. "£35 for an Oral-B iO?").
3. **No ad banner during the game.** Put the web address only on the end card, plus a small watermark in a corner.
4. **Shorter:** aim for 12–15 seconds, 3–4 items, quicker reveals (about 1 second to guess).
5. **Something moving all the time**, e.g. a slow zoom, so it never looks like a still slide.
6. Keep the caption search-friendly: TikTok search sends traffic for "black friday 2026 uk" and "black friday sales 2026".

## Test of the instant-start format (checked 9 Nov 2026)
The 8 Nov "Real or fake?" video opened on a full frame (product, was-price and timer from 0:00, no banner, 15 seconds). After 24 hours:
- Views **236** (older videos ~740), average watch time **1.8s** (was 2.2s), watched full **1.6%** (was 0.7%), most viewers still left at 0:01, and 98% of views came from For You.
- It was posted at 09:23 on a Sunday rather than in the evening, which probably cost views. But watch time didn't improve, so **the opening frame wasn't the main problem.**

Conclusion: faceless text-and-emoji slides lose people in the first second whatever the layout. Successful UK deal accounts use real product shots or footage, a voiceover, and often a person on camera. Next options to test: real product images (only from sources we're allowed to use, e.g. Awin product feeds), an in-app TikTok text-to-speech voiceover, and a trending sound. Or keep TikTok as low-effort and put the effort into Google, which is where the site's buyers come from.

## FORMAT NOW: PHOTO CAROUSELS (18 Nov 2026, user approved; overrides the video sections below)
Why: every faceless text video lost viewers at 0:01 (avg watch 1.4–2.3s; v2 Hamleys 239 views, v2 Rocket 224 views at 19:30), so the format is the problem, not the posting time. Carousels are judged on swipe-through, not watch time. The user wants it hands-off (no filming).
- **Engine:** `tiktok/carousel/car.py <spec.json> <outdir>` → 1080×1920 JPGs: cover (hook + product collage), #3 → #2 → #1 slides (real product photo, label, shop, one line), an optional "before you buy" tip slide, and an end slide (comment question + URL + #ad line). Specs from 18 Nov are in `tiktok/carousel/*.json`. `"countup": true` for non-ranked lists; `"big"` instead of `"img"` for text-only cards.
- **Product photos:** capture them with Claude in Chrome: `computer zoom` with `save_to_disk: true` and **scale 1** (a lower scale saves a lower-res file). Move the mouse to a corner first so the cursor isn't in the shot. Good sources: Apple Store buy pages (apple.com/uk/shop/buy-airpods/...), dyson.co.uk product pages, and PriceSpy product-image modals (click the main image; 400×300 originals, fine for slides). Don't use amazon.co.uk images (Associates rules; also blocked in the extension). sharkclean.co.uk is blocked in the extension. `car.py` whitens near-white backgrounds.
- **Posting:** TikTok Studio → Upload → **Photos** tab → select the slides in order. Add a title (≤90 chars, keyword-first), a description with the URL and 5 hashtags including #ad, and **Add sound** → pick an upbeat track from the list, a different one each post. Then Schedule → date/time (same picker as video) → Show more → Disclose post content → Branded content → Schedule.
- **Branded posts can't be edited or deleted on web** ("Videos with commercial content can only be edited on the TikTok app"). Get the carousel right before scheduling. If one needs removing, the user has to do it in the app.
- Week of 16 Nov: carousels scheduled for AirPods 19th, Airwrap 20th, Kindle 21st and BF sales 22nd, all at 19:30. The user was asked to delete the 4 old scheduled videos for those days in the app.
- **Judge on 24 Nov:** carousel views and swipe-through vs ~230 for the v2 videos.

## Music (user, 16 Nov 2026: "play popular music, the music on the vids is really bad")
- **Don't bake music into the video any more.** `gen2.py` now renders only quiet transition sounds (set `BEAT=1` to bring back the old synth beat; don't).
- **Add the music in TikTok Studio at upload:** click **Sounds** (right of the preview), pick a popular track from what TikTok offers there (trending/most-used first, upbeat, fits a countdown), then turn the original sound down to ~10–20% so the whoosh hits sit under the track. Check the track is still attached in the preview before scheduling.
- **Licensing:** our posts have Branded content on (they're ads), so TikTok only allows tracks from its **Commercial Music Library** on them. That's what the Sounds panel offers for these posts, and it includes plenty of popular and trending tracks, but not every chart hit. Never add a song from outside TikTok's library to the file: it would be muted or taken down, and it isn't licensed for ads.
- **Vary the track across the week**, and prefer sounds that are trending that week.

## Why views dropped (analysis 16 Nov 2026, TikTok Studio per-post analytics)
| Posted | Format | Length | Views | Avg watch | Full % | Search traffic |
|---|---|---|---|---|---|---|
| 1 Nov | winter lows | 22s | 736 | 2.02s | 0.5% | 7.2% |
| 1 Nov | winter lows | 22s | 736 | 1.66s | 0.7% | 7.9% |
| 2 Nov | buy or wait | 21s | 760 | 2.09s | 0.6% | 7.4% |
| 5 Nov | real or fake | 19s | 735 | 1.94s | 0.9% | 4.1% |
| 6 Nov | guess the price | 22s | 777 | 2.32s | 0.5% | 6.1% |
| 8 Nov | real or fake (instant) | 15s | 244 | 1.9s | 1.6% | 0.4% |
| 12 Nov | real or fake | 15s | 256 | 3.14s | 1.5% | 0.4% |
| 16 Nov 22:13 | v2 Hamleys countdown | 9.6s | 239 (10h) | 1.41s | 0.8% | 2.0% |

Week of 16 Nov (v2): Hamleys posted 16 Nov 22:13 (late, because approval came at 22:11). Rocket, gifts for him, AirPods, Airwrap, Kindle and BF-week are scheduled 17–22 Nov at 19:30, all with Branded content on. **Compare their views with the ~750 baseline on 24 Nov.**
- **Every video loses most viewers at 0:01**, and that's been true from the start. The ~740 views were TikTok's standard test push for a new account. After 5 posts in a row where almost nobody watched past a second or followed (2 followers in total), TikTok cut the test push to ~250. The drop is the algorithm reacting to weak retention across the account, not to one bad video.
- **What else changed on 8 and 12 Nov:** (1) captions with 11 hashtags, several unrelated to the video (#bluey #legobluey #garmin), so TikTok was less sure who to show it to; (2) **search traffic fell from 4–8% to 0.4%** because the first line stopped leading with "Black Friday 2026 UK", the phrase people actually search; (3) gaps of 2–4 days between posts.
- **Fixes in the v2 engine (`tiktok/gen2.py`, from the 16 Nov batch):**
  - ~9.6s total instead of 15–22s, so the completion rate goes up.
  - The first frame is already full: a bright red background, big hook text and the keyword pill "BLACK FRIDAY 2026 UK" at frame 0, with no build-up from a dark screen.
  - A countdown format (#3 → #2 → #1, best last) gives viewers a reason to stay.
  - A progress bar runs across the top, fast slide transitions, and a beat track with hits on each reveal.
  - The end card asks a comment question, then the URL.
- **Captions:** the first line leads with the searched phrase (e.g. "Which AirPods to buy this Black Friday 2026 UK"), with **5 hashtags max**: #ad + 4 relevant ones.
- **Post every day at 19:30** (the weekly batch makes this possible).
- **Next lever if v2 doesn't beat ~750:** real visuals (photos or clips of the product, or a screen-recording of our own guide page) and a voiceover. Retention on faceless text slides has a ceiling.

## How TikTok runs now (16 Nov 2026, user: "i cant reply every day")
**Weekly batch, one approval.** Replaces the daily video + daily approval and the "pause after 3 days" rule.
- Every **Monday 07:30** (send_later reminder, renewed each week): make **7 buying-guide videos** for Mon–Sun with the engine in scratchpad `tt8/gen2.py` + `specs.json` + `v2.json` (repo copies in tiktok/) (one spec per day: hook, 3 picks, tip, end question, caption). Keep the specs in this repo too (`tiktok/specs-YYYY-MM-DD.json`) because the scratchpad can be wiped.
- **No exact prices in the videos.** They post up to 7 days after they're made. Every pick says "Today's price: snappedupdeals.co.uk". Target prices ("don't pay more than") from a guide are fine.
- Claims only as the site's guides support. Awin partners first (Hamleys, Rocket, parking once that guide exists).
- Send the user all 7 videos + captions + times in **one message**. They reply "post all" (or "all except N"). Then upload and schedule each in TikTok Studio at 19:30 on its day (TikTok allows up to 10 days ahead). Branded content on, #ad in caption.
- If they don't reply, **no daily nagging.** Leave the batch waiting; drop any day whose date has passed when they do reply.

## Paused again (16 Nov 2026), superseded by the weekly batch above
Paused again after 3 days with no reply (13–15 Nov). The 13 Nov air fryer buying-guide video was uploaded but never approved, and its 19:30 slot has passed; it's still unscheduled in TikTok Studio. The 14 Nov Hamleys video wasn't made. No reminders are set. Restart only when the user asks, starting with the Hamleys topic and prices checked that day.

## Paused (12 Nov 2026)
Daily TikTok videos are paused. The 8 Nov and 10 Nov uploads were never approved, and the 9 Nov question about the approach went unanswered. No more videos are scheduled or reminders set until the user asks to restart. The 10 Nov video is still waiting, unscheduled, in TikTok Studio on the laptop, and the files are in Desktop\\snapped-up\\tiktok.

## Restarted 12 Nov 2026: rotate formats, never the same two days running
The user finds "Real or fake?" repetitive. Go through this list in order, one per day:
1. **Top 5 countdown:** "This week's 5 biggest price drops" from #5 to #1, with the best saving last (Fridays, from the "Week's best" post).
2. **Guess the price:** product on screen, "£???" tag, reveal.
3. **Higher or lower:** two shops' prices for the same product side by side. Is it cheaper at A or B? Reveal the cheapest.
4. **Gift under £X challenge:** "3 gifts under £20 that don't look cheap", one per scene, ending on a price total.
5. **This or that:** two deals side by side ("Ninja or Shark?"). Comment which you'd pick, with no right answer, which drives comments.
6. **Buy now or wait?:** verdict stamps.
7. **Real or fake?:** only occasionally, and only when the post has a clearly inflated 'was' price.
8. **Black Friday countdown:** "X days to go" with the top 3 deals already live.

Every format keeps the same rules: full first frame, about 15 seconds, prices from today or yesterday only, claims only as far as the post's notes support, caption without spoilers, #ad, and Branded content switched on.

## Style change (12 Nov 2026, user): buying-guide suggestions, not games
The user wants the videos to work more like a **buying guide**: helpful recommendations rather than quizzes. Each video takes **one buying question** that a site guide answers, gives the **2–3 picks** we'd recommend, and sends viewers to the full guide.

Structure (about 15–20 seconds, full first frame):
1. **Hook (0–1s):** the question as a headline, with the best pick already visible, e.g. "Which air fryer should you buy this Black Friday?" over the top pick and its price.
2. **Picks (one scene each):** a label (BEST OVERALL / BEST BUDGET / BEST FOR FAMILIES / BEST GIFT), the product, price and shop, and one line on who it's for. Each line must come from the guide or post notes.
3. **Tip:** one buying tip from the guide, such as "Don't pay more than £X" or "Wait for Black Friday on the Dyson".
4. **End card:** "Full guide: snappedupdeals.co.uk" plus the guide's topic.

Rotate the topic every day, preferring guides that earn (Awin partners first, then high-commission Amazon categories): air fryers, Hamleys and kids' toys, perfume gift sets, Dyson vs Shark, Christmas gifts for him or her under £50, airport parking for Christmas, coffee machines (Rocket), STEM gifts (Tinkerer), advent calendars, TVs and AirPods. Vary the angle as well: "3 picks", "budget vs premium", "don't buy X, buy Y", "the one I'd actually buy". Captions ask a question to get comments, e.g. "Which would you go for?"

## 17 Nov check
- The v2 Hamleys countdown got 239 views and 1.41s average watch. Most viewers still swipe at 0:01, so the new edit didn't fix the first second. It was also posted late (22:13).
- **TikTok has sent ~0 visits to the site:** Cloudflare referrers for 7 days show no tiktok.com, and nearly all traffic is direct/search. The site is growing without it (107 visits in 24h on 17 Nov, +45%).
- **Verdict on text-on-colour slides:** they don't hold viewers past a second. Judge the scheduled 17–22 Nov posts on 24 Nov. If they're still around 250, change format to **real product visuals** (official affiliate creatives/product images from Awin partners such as Hamleys and Rocket, which are provided for promotion; never Amazon images, which the Associates rules don't allow outside its API) or stop spending effort on TikTok and put it into the site.

## 22 Nov 2026: one address on every post
End slides and captions say **snappedupdeals.co.uk/start** (no clickable links on TikTok). /start/ lists today's best picks plus shortcuts and shows as its own path in Cloudflare Web Analytics: that's how we measure what TikTok/Instagram send. Volume: 2 carousels a day (12:30 and 19:30) from the 23 Nov batch, because Google sends ~0 visitors (Search Console, 22 Nov) and social is the engine.
