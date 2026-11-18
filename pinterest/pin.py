import json, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1000,1500
INK=(22,21,19); PAPER=(255,255,255); RED=(226,70,43); YEL=(255,214,0)
FD="/usr/share/fonts/opentype/inter/"
def f(n,s): return ImageFont.truetype(FD+n,s)
def wrap(d,t,font,mw):
    out=[];line=""
    for w in t.split():
        tt=(line+" "+w).strip()
        if d.textlength(tt,font=font)<=mw: line=tt
        else: out.append(line); line=w
    if line: out.append(line)
    return out
def ctext(d,y,t,font,fill,mw=900,lh=1.08):
    for ln in wrap(d,t,font,mw):
        w=d.textlength(ln,font=font); d.text(((W-w)/2,y),ln,font=font,fill=fill); y+=int(font.size*lh)
    return y
def prod(path,box):
    im=Image.open(path).convert("RGB"); a=np.array(im).astype(int); a[a.min(axis=2)>=236]=255; im=Image.fromarray(a.astype("uint8"))
    s=min(box[0]/im.width,box[1]/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=2))
P=json.load(open(sys.argv[1]))
for p in P:
    im=Image.new("RGB",(W,H),RED); d=ImageDraw.Draw(im)
    k=p.get("kicker","BLACK FRIDAY 2026 UK"); fk=f("Inter-Black.otf",40); tw=d.textlength(k,font=fk)
    d.rounded_rectangle(((W-tw)/2-28,60,(W+tw)/2+28,132),radius=36,fill=YEL); d.text(((W-tw)/2,74),k,font=fk,fill=INK)
    y=ctext(d,170,p["title"],f("InterDisplay-Black.otf",p.get("size",104)),PAPER)
    if p.get("sub"): y=ctext(d,y+10,p["sub"],f("Inter-Black.otf",46),YEL)
    top=y+40; bot=1330
    d.rounded_rectangle((50,top,W-50,bot),radius=44,fill=PAPER)
    imgs=p.get("imgs",[])
    if imgs:
        n=len(imgs); ih=bot-top-80
        if n==1:
            pi=prod(imgs[0],(800,ih)); im.paste(pi,((W-pi.width)//2,top+40+(ih-pi.height)//2))
        else:
            hero=prod(imgs[0],(820,int(ih*0.58))); im.paste(hero,((W-hero.width)//2,top+30+(int(ih*0.58)-hero.height)//2))
            rest=imgs[1:]; bw=(W-140)//len(rest)
            for j,r in enumerate(rest):
                pi=prod(r,(bw-30,int(ih*0.38))); im.paste(pi,(70+j*bw+(bw-pi.width)//2,top+50+int(ih*0.6)+(int(ih*0.38)-pi.height)//2))
    else:
        yy=top+(bot-top)//2-150
        for ln in p.get("big",[]): yy=ctext(d,yy,ln,f("InterDisplay-Black.otf",140),RED)
    d.rectangle((0,1360,W,H),fill=INK)
    ctext(d,1385,p.get("foot","Ranked + today's prices"),f("Inter-Black.otf",40),YEL)
    ctext(d,1440,"snappedupdeals.co.uk",f("InterDisplay-Black.otf",46),PAPER)
    im.save(p["out"],quality=92)
print("ok")
