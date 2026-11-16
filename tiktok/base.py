import math, subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1080,1920,30
INK=(22,21,19); PAPER=(251,247,240); RED=(226,70,43); MUTED=(167,159,146)
GREEN=(46,204,113); AMBER=(255,176,32)
F="/usr/share/fonts/opentype/inter/"
_fc={}
def f(n,s):
    k=(n,s)
    if k not in _fc: _fc[k]=ImageFont.truetype(F+n,s)
    return _fc[k]
EMO=ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",109)
_ec={}
def emoji(ch,size):
    k=(ch,size)
    if k not in _ec:
        im=Image.new("RGBA",(170,170),(0,0,0,0)); ImageDraw.Draw(im).text((10,10),ch,font=EMO,embedded_color=True)
        im=im.crop(im.getbbox()); r=size/max(im.size); _ec[k]=im.resize((max(1,int(im.width*r)),max(1,int(im.height*r))),Image.LANCZOS)
    return _ec[k]
def wrap(d,text,font,maxw):
    out=[];cur=""
    for w in text.split():
        t=(cur+" "+w).strip()
        if d.textlength(t,font=font)<=maxw: cur=t
        else: out.append(cur); cur=w
    out.append(cur); return out
def ctext(d,y,text,font,fill,maxw=920,gap=1.1,cx=W/2):
    for ln in wrap(d,text,font,maxw):
        w=d.textlength(ln,font=font); d.text((cx-w/2,y),ln,font=font,fill=fill); y+=int(font.size*gap)
    return y
def ease(x): x=max(0,min(1,x)); return 1-(1-x)**3
def back(x):
    x=max(0,min(1,x)); c1=1.9; c3=c1+1; return 1+c3*(x-1)**3+c1*(x-1)**2
def banner(d,im):
    bf=f("Inter-Black.otf",46); t="Visit snappedupdeals.co.uk"; tw=d.textlength(t,font=bf)
    e=emoji("🔗",48); total=tw+e.width+18; x0=(W-total)/2
    d.rounded_rectangle((x0-36,225,x0+total+36,315),radius=45,fill=RED)
    im.paste(e,(int(x0),246),e); d.text((x0+e.width+18,240),t,font=bf,fill=PAPER)
def paste_scaled(im,layer,cx,cy,s,rot=0):
    if s<=0.01: return
    L=layer.rotate(rot,expand=True,resample=Image.BICUBIC) if rot else layer
    L=L.resize((max(1,int(L.width*s)),max(1,int(L.height*s))),Image.BILINEAR)
    im.paste(L,(int(cx-L.width/2),int(cy-L.height/2)),L)
def text_layer(txt,font,fill,pad=10):
    tmp=ImageDraw.Draw(Image.new("RGBA",(1,1))); b=tmp.textbbox((0,0),txt,font=font)
    L=Image.new("RGBA",(b[2]-b[0]+2*pad,b[3]-b[1]+2*pad),(0,0,0,0)); ImageDraw.Draw(L).text((pad-b[0],pad-b[1]),txt,font=font,fill=fill); return L
def stamp_layer(word,col):
    font=f("InterDisplay-Black.otf",150); tl=text_layer(word,font,col,0)
    w,h=tl.width+90,tl.height+70; L=Image.new("RGBA",(w,h),(0,0,0,0)); d=ImageDraw.Draw(L)
    d.rounded_rectangle((6,6,w-6,h-6),radius=26,outline=col,width=12,fill=(22,21,19,235)); L.paste(tl,(45,35),tl); return L
def price_layer(price,was):
    L=Image.new("RGBA",(760,230),(0,0,0,0)); d=ImageDraw.Draw(L)
    d.polygon([(60,10),(750,10),(750,220),(60,220),(0,115)],fill=RED); d.ellipse((30,100,60,130),fill=INK)
    txt=f"£{price}"; wf=f("Inter-Bold.otf",42); wt=f"was £{was}" if was else ""; ww=d.textlength(wt,font=wf) if was else 0
    size=124
    while True:
        pf=f("InterDisplay-Black.otf",size); tw=d.textlength(txt,font=pf)
        if tw+(ww+26 if was else 0)<=640 or size<=80: break
        size-=4
    bb=pf.getbbox(txt); py=115-(bb[3]-bb[1])/2-bb[1]
    if was:
        d.text((95,py),txt,font=pf,fill=PAPER); wx=95+tw+26
        d.text((wx,92),wt,font=wf,fill=(255,220,210)); d.line((wx-4,118,wx+ww+4,118),fill=PAPER,width=5)
    else: d.text((95+(640-tw)/2,py),txt,font=pf,fill=PAPER)
    return L

def render(name,fn,dur):
    os.makedirs("seg",exist_ok=True); n=int(round(dur*FPS)); tmp=f"seg/_{name}.mp4"
    p=subprocess.Popen(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
        "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p","-profile:v","high","-r",str(FPS),tmp],stdin=subprocess.PIPE)
    for k in range(n): p.stdin.write(fn(k/FPS).tobytes())
    p.stdin.close(); assert p.wait()==0; os.replace(tmp,f"seg/{name}.mp4")
