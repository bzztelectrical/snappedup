# Snapped Up: setup guide

Your deals site is ready. Here's what you need to do once (about an hour), then the daily posting runs itself.

## How it fits together

- **This folder** is the whole website. Posts are small JSON files in `content/posts/`.
- **GitHub** stores it. **Cloudflare Pages** turns it into the live site, free, and redeploys every time a new post is pushed.
- **Claude** runs a scheduled task every morning that researches deals, writes the post and pushes it (see `DAILY_TASK.md`).
- **Affiliate IDs** live in `site.json`. Fill them in once and every link on the site, old and new, earns commission.

## Step 1: Buy the domain (5 min, ~£10/year)

Done: `snappedupdeals.co.uk`, registered on Cloudflare.

## Step 2: Put the site on GitHub (10 min)

1. Create a free account at github.com.
2. Create a new **private** repository called `snapped-up`.
3. Upload everything in this folder (drag and drop works) **except** the `dist` folder.
4. Tell Claude the repository name (e.g. `yourname/snapped-up`) so the daily task can be set up.

## Step 3: Go live on Cloudflare Pages (10 min)

1. Create a free account at cloudflare.com.
2. Go to **Workers & Pages → Create → Pages → Connect to Git** and pick `snapped-up`.
3. Build settings:
   - Framework preset: **None**
   - Build command: `node build.mjs`
   - Build output directory: `dist`
4. Deploy. You'll get a `*.pages.dev` address straight away.
5. Under **Custom domains**, add `snappedupdeals.co.uk`.
6. Optional: turn on **Web Analytics** (free, no cookies) to see visitor numbers.

## Step 4: Apply to affiliate programmes (20–30 min)

Apply once the site has a few days of posts on it. Programmes approve faster when there's real content.

| Programme | Covers | Put this in `site.json` |
|---|---|---|
| Amazon Associates UK (affiliate-program.amazon.co.uk) | Amazon | `amazonTag`, e.g. `snappedup-21` |
| eBay Partner Network (partnernetwork.ebay.com) | eBay UK | `ebayCampaignId` |
| Awin (awin.com, small one-off deposit) | Argos, Currys, John Lewis, Very, AO, Boots, Halfords, Dunelm and many more | `awinPublisherId`, plus each retailer's merchant ID under `awinMerchants` once they accept you |

Notes:
- Amazon closes your account if you don't make **3 qualifying sales within 180 days**, so share posts early (see step 5).
- Awin retailers approve you one by one. Leave a merchant ID blank until approved; those links just go direct.
- Send Claude the IDs and it will update `site.json` for you.

## Step 5: Get the first visitors (ongoing, 10 min a day)

Google takes weeks to months to start sending traffic to a new site. Until then:
- Share the daily post in a couple of places you already use: a Facebook page, X, or local community groups. Check each group's rules on links first.
- Ask Claude for ready-to-paste social posts each day.
- Add the site to **Google Search Console** and submit `https://snappedupdeals.co.uk/sitemap.xml`.

## Legal bits (already handled on the site)

- Affiliate disclosure on every post and a full disclosure page, as UK advertising rules (ASA/CMA) require.
- Amazon's required associate statement in the footer.
- A simple privacy page. If you add analytics with cookies or a newsletter later, update it.
- Earnings are self-employment income: register with HMRC once you go over the £1,000 trading allowance.

## Editing by hand

Change any post by editing its JSON file in GitHub. To preview locally, install Node.js and run `node build.mjs`, then open `dist/index.html`.
