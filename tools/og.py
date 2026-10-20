#!/usr/bin/env python3
"""Generate a 1200x630 share image for every post that doesn't have one yet.

Usage:  python3 tools/og.py          (only missing images)
        python3 tools/og.py --force  (regenerate all)

Images go to static/og/<slug>.png and are picked up automatically by build.mjs.
Needs Pillow:  pip install pillow --break-system-packages
"""
import glob, json, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "static", "og")
os.makedirs(OUT, exist_ok=True)

def font(names, size):
    for n in names:
        for d in ("/usr/share/fonts/truetype/dejavu", "/usr/share/fonts/truetype/liberation", "/usr/share/fonts/truetype", "/Library/Fonts", "C:/Windows/Fonts"):
            p = os.path.join(d, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default(size)

SERIF_B = ["DejaVuSerif-Bold.ttf", "LiberationSerif-Bold.ttf", "georgiab.ttf"]
SANS = ["DejaVuSans.ttf", "LiberationSans-Regular.ttf", "arial.ttf"]
SANS_B = ["DejaVuSans-Bold.ttf", "LiberationSans-Bold.ttf", "arialbd.ttf"]
INK, PAPER, TAG, MUTED = "#1b1a17", "#fbf7f0", "#e2462b", "#6b645a"
LABEL = {"guide": "BUYING GUIDE", "spotlight": "THIS WEEK'S SPOTLIGHT", "daily": "TODAY'S DEALS"}

def wrap(draw, text, f, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines

def render(post, path):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    # brand
    d.polygon([(80, 70), (124, 70), (140, 92), (124, 114), (80, 114)], fill=TAG)
    d.ellipse((117, 87, 127, 97), fill=PAPER)
    d.text((158, 66), "Snapped Up", font=font(SERIF_B, 40), fill=INK)
    d.text((80, 160), LABEL.get(post.get("type"), "DEALS"), font=font(SANS_B, 26), fill=TAG)
    # title: shrink until it fits in 4 lines
    title = post["title"]
    for size in (68, 60, 54, 48, 42):
        f = font(SERIF_B, size)
        lines = wrap(d, title, f, W - 160)
        if len(lines) <= 4:
            break
    y = 205
    for ln in lines[:4]:
        d.text((80, y), ln, font=f, fill=INK)
        y += int(size * 1.22)
    d.text((80, H - 80), "snappedupdeals.co.uk", font=font(SANS, 28), fill=MUTED)
    d.rectangle((0, H - 14, W, H), fill=TAG)
    img.save(path, optimize=True)

force = "--force" in sys.argv
made = 0
for f in sorted(glob.glob(os.path.join(ROOT, "content", "posts", "*.json"))):
    post = json.load(open(f, encoding="utf-8"))
    slug = post.get("slug") or os.path.basename(f)[:-5]
    out = os.path.join(OUT, f"{slug}.png")
    if force or not os.path.exists(out):
        render(post, out); made += 1
print(f"og: {made} image(s) generated")
