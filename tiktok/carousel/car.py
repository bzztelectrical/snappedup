import json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1080,1920
INK=(22,21,19); PAPER=(255,255,255); RED=(226,70,43); YEL=(255,214,0); MUTED=(120,114,106); CREAM=(246,241,233)
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
def ctext(d,y,t,font,fill,mw=940,lh=1.12):
    for ln in wrap(d,t,font,mw):
        w=d.textlength(ln,font=font); d.text(((W-w)/2,y),ln,font=font,fill=fill); y+=int(font.size*lh)
    return y
def ltext(d,x,y,t,font,fill,mw=920,lh=1.12):
    for ln in wrap(d,t,font,mw): d.text((x,y),ln,font=font,fill=fill); y+=int(font.size*lh)
    return y
def prod(path,box):
    im=Image.open(path).convert("RGB")
    import numpy as np
    a=np.array(im).astype(int); m=(a.min(axis=2)>=236); a[m]=255; im=Image.fromarray(a.astype("uint8"))
    bw,bh=box
    s=min(bw/im.width,bh/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=2))
def pill(d,x,y,t,bg,fg,size=44,center=False):
    fo=f("Inter-Black.otf",size); tw=d.textlength(t,font=fo)
    if center: x=(W-tw)/2-30
    d.rounded_rectangle((x,y,x+tw+60,y+size+34),radius=(size+34)//2,fill=bg); d.text((x+30,y+15),t,font=fo,fill=fg)
S=json.load(open(sys.argv[1])); out=sys.argv[2]; os.makedirs(out,exist_ok=True)
picks=S["picks"]; n=len(picks)
# cover
im=Image.new("RGB",(W,H),RED); d=ImageDraw.Draw(im)
pill(d,0,150,S.get("kicker","BLACK FRIDAY 2026 UK"),YEL,INK,center=True)
y=ctext(d,280,S["hook"],f("InterDisplay-Black.otf",128),PAPER,mw=980,lh=1.05)
ctext(d,y+20,S["sub"],f("Inter-Black.otf",54),YEL)
card=(70,y+150,W-70,1700); d.rounded_rectangle(card,radius=48,fill=PAPER)
imgs=[p for p in picks if p.get("img")]
if not imgs:
    yy=card[1]+90
    for p in picks:
        yy=ctext(d,yy,p.get("big",p["name"]),f("InterDisplay-Black.otf",120),INK)+10
        yy=ctext(d,yy,"✓ "+p["label"].capitalize().replace(" dec"," Dec").replace(" nov"," Nov"),f("Inter-Black.otf",46),(46,170,90))+60
if imgs:
    ch=card[3]-card[1]; cwid=card[2]-card[0]
    top=prod(imgs[0]["img"],(cwid-120,int(ch*0.55))); im.paste(top,(card[0]+(cwid-top.width)//2,card[1]+40+(int(ch*0.55)-top.height)//2))
    rest=imgs[1:]
    for j,p in enumerate(rest):
        bw=(cwid-80)//max(1,len(rest)); pi=prod(p["img"],(bw-30,int(ch*0.36)))
        im.paste(pi,(card[0]+40+j*bw+(bw-pi.width)//2,card[1]+int(ch*0.6)+(int(ch*0.36)-pi.height)//2))
ctext(d,1760,S.get("swipe","Swipe for the ranking →"),f("Inter-Black.otf",50),PAPER)
im.save(f"{out}/01.jpg",quality=92)
# picks, countdown
order=list(range(n))[::-1] if not S.get("countup") else list(range(n))
for k,i in enumerate(order):
    p=picks[i]; num=(i+1)
    im=Image.new("RGB",(W,H),PAPER); d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,330),fill=INK)
    d.text((70,40),f"#{num}",font=f("InterDisplay-Black.otf",230),fill=RED if num==1 else YEL)
    pill(d,420,70,p["label"],PAPER,INK,size=46 if len(p["label"])<=18 else 36)
    d.text((440,190),p["shop"].upper()+(" · OUR TOP PICK" if num==1 and not S.get("countup") else ""),font=f("Inter-Black.otf",40),fill=(200,194,186))
    if p.get("img"):
        pi=prod(p["img"],(900,820)); im.paste(pi,((W-pi.width)//2,380+(820-pi.height)//2))
        y=1250
    else:
        e=p.get("big","");y=ctext(d,560,e,f("InterDisplay-Black.otf",150),RED) ; y=max(y+60,1000)
    y=ltext(d,70,y,p["name"],f("InterDisplay-Black.otf",96),INK,mw=940)
    y=ltext(d,70,y+20,p["line"],f("Inter-Bold.otf",54),MUTED,mw=940,lh=1.2)
    d.rectangle((0,1780,W,H),fill=CREAM); ctext(d,1815,S.get("foot","Today's price → snappedupdeals.co.uk/start"),f("Inter-Black.otf",44),INK)
    im.save(f"{out}/{k+2:02d}.jpg",quality=92)
# tip (optional)
k=n+2
if S.get("tip"):
    im=Image.new("RGB",(W,H),INK); d=ImageDraw.Draw(im)
    pill(d,0,330,S["tip"].get("label","BEFORE YOU BUY"),YEL,INK,center=True)
    y=ctext(d,480,S["tip"]["title"],f("InterDisplay-Black.otf",112),PAPER)
    y+=60
    for r in S["tip"]["rows"]:
        lines=wrap(d,r,f("Inter-Black.otf",56),820); hh=len(lines)*68+60
        d.rounded_rectangle((70,y,W-70,y+hh),radius=30,fill=(45,43,40)); yy=y+30
        d.text((110,yy),"✓",font=f("Inter-Black.otf",56),fill=(46,204,113))
        for ln in lines: d.text((185,yy),ln,font=f("Inter-Black.otf",56),fill=PAPER); yy+=68
        y+=hh+30
    im.save(f"{out}/{k:02d}.jpg",quality=92); k+=1
# end
im=Image.new("RGB",(W,H),RED); d=ImageDraw.Draw(im)
y=ctext(d,520,S["endq"],f("InterDisplay-Black.otf",130),PAPER,lh=1.05)
ctext(d,y+40,"Tell us in the comments ↓",f("Inter-Black.otf",56),YEL)
t=S.get("url","snappedupdeals.co.uk/start"); fs=84
while True:
    fo=f("InterDisplay-Black.otf",fs); tw=d.textlength(t,font=fo)
    if tw<=W-200 or fs<=40: break
    fs-=4
yy=y+220
d.rounded_rectangle(((W-tw)/2-44,yy,(W+tw)/2+44,yy+150),radius=34,fill=PAPER); d.text(((W-tw)/2,yy+26),t,font=fo,fill=INK)
ctext(d,yy+200,S.get("endsub","Full ranking + today's prices"),f("Inter-Black.otf",52),PAPER)
ctext(d,1700,"#ad · We may earn commission from links. Prices change.",f("Inter-Bold.otf",34),PAPER)
im.save(f"{out}/{k:02d}.jpg",quality=92)
print("slides",k)
