# Instagram (@snappedupdeals)

Set up 19 Nov 2026 (user: "instagram is logged in set it up").
- Profile: username snappedupdeals, name "Snapped Up", logo = pinterest/snappedup-logo.png, category Shopping & retail (shown), public, Creator (professional) account so posts can be scheduled and insights seen. Not linked to Facebook yet (no Facebook Page exists; never link the user's personal Facebook).
- Bio: "UK deals actually worth having. Prices checked daily. / Black Friday + Christmas gift guides. / All deals: snappedupdeals.co.uk (affiliate links)".
- **Website link: NOT set, and Instagram won't allow it until 19 Dec 2026** (new-account limit; user, 19 Nov). Until then captions must NOT say "link in bio". Use "Type snappedupdeals.co.uk into your browser" or "Search Snapped Up Deals on Google" instead. After 19 Dec the user adds the link in the app and captions can go back to "link in bio".
- (Old note) Instagram only allows bio links in the mobile app. The user needs to add https://snappedupdeals.co.uk in the app (Edit profile → Links → Add external link).

## How it runs
- Part of the Monday weekly batch (same single "post all" approval as TikTok + Pinterest).
- Post the week's 7 TikTok carousel images as Instagram carousels (4:5 crop or 1080×1350 versions if the 9:16 crop cuts text), 19:00 each day, with Instagram's scheduler ("Advanced settings → Schedule" on professional accounts, or Meta Business Suite).
- Captions: hook line, 3–5 lines of value, "Prices + links: link in bio / snappedupdeals.co.uk", 5–10 hashtags (#ukdeals #blackfridayuk #christmasgiftsuk …). Instagram captions aren't clickable, so never paste Amazon links. Our own site is the only destination (Amazon rules).
- Same rules as TikTok: our own content only, no exact prices on images, no Amazon product images, no buying followers, no bulk follow/like.

## Posts
| Date | Post | Slides | Notes |
|---|---|---|---|
| 19 Nov 2026 | 3 Black Friday sales already live | 6 | Starter post (user: "yes post them") |
| 19 Nov 2026 | Which Kindle should you buy? | 6 | Starter |
| 19 Nov 2026 | Dyson Airwrap or Shark FlexStyle? | 6 | Starter; tip slide changed to "prices to wait for are in our guide" (no prices on images) |
| 19 Nov 2026 | Which AirPods to buy this Black Friday | 6 | Starter; AirPods 5 line corrected (WCC £119 deal ended 17 Nov) |
| 22 Nov 2026 | 3 gifts grandparents will actually use | 5 | Gap-filler after 3 quiet days (user: "last post on insta was 3 days ago"); from today's grandparents guide; spec tiktok/carousel/extra/grandparents.json |
| 23 Nov 2026 12:01 | 3 months of Audible for under £3 (01-mon-1230-audible) | 6 | Batch 23–29 Nov |
| 23 Nov 2026 19:02 | Which Ring doorbell should you buy? (02-mon-1930-ring) | 5 | Batch 23–29 Nov. Web layout at 1519×784: crop (474,688) → 4:5 (500,604) → Next (1034,86) → Next (1166,86) → caption (1040,180), check document.activeElement is the caption before typing → Share (1166,86). Don't click inside the filter grid. |
| 24 Nov 2026 12:02 | 3 gifts Dad will actually use (03-tue-1230-dad) | 5 | Batch 23–29 Nov |
| 24 Nov 2026 19:03 | 3 Ninja air fryers worth buying (04-tue-1930-airfryer) | 5 | Batch 23–29 Nov. Note: the first Next on the Edit screen often doesn't register; if the caption box doesn't take focus, click Original (1134,388) then Next (1168,86) again. |

How-to that works on web: Create → Post → upload all slides to the file input → crop icon bottom-left → **4:5** (default is 1:1, which cuts slides) → Next → Next → click the caption box via its ref (clicking by coordinates can miss, and typing outside the box fires Instagram's keyboard shortcuts) → click inside the caption to close hashtag suggestions → Share. Slides: TikTok 9:16 slides scaled into 1080×1350 with the slide's own background colour as padding (scratch script; see the 19 Nov session).

## 22 Nov 2026
Captions until 19 Dec: "Type snappedupdeals.co.uk/start into your browser". After the bio link unlocks, set the bio link to https://snappedupdeals.co.uk/start/.

## 23–29 Nov batch (approved 22 Nov, "post all")
Instagram web has NO scheduler (Advanced Settings only has like counts and comments; checked 22 Nov), and Meta Business Suite needs a Facebook Page we don't have. So each of the 14 carousels is posted live at its slot (12:00 and 19:00, 23–29 Nov) by a timed wake-up of the main Claude session, using the files on the laptop at Desktop\snapped-up\w1123\ig\<name>\ and the captions in tiktok/carousel/w1123/captions.json. If the laptop/Chrome is off at a slot, that post goes out at the next slot.

## Rule (22 Nov)
Never let Instagram go a day without a post. If a weekly batch hasn't started yet, post a gap-filler carousel built from that day's newest guide.

## Channel address (from 25 Nov)
Use **snappedupdeals.co.uk/ig** in every caption, slide and link for this channel (not /start). Same page as /start, but it shows up as its own path in Cloudflare Web Analytics, so we can finally see what this channel sends. 98% of visits arrive with no referrer, so this is the only attribution we have. (Already-scheduled 23 to 29 Nov posts and pin drafts still say /start; leave them.)
