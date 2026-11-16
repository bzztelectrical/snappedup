import math, sys, json, os, subprocess
import numpy as np
from base import *
BLUE=(110,180,255); PINK=(255,120,170); YEL=(255,214,0)
COL={"green":GREEN,"amber":AMBER,"blue":BLUE,"pink":PINK,"red":RED}
SP=json.load(open("specs.json"))[sys.argv[1]]; V2=json.load(open("v2.json"))[sys.argv[1]]
up=V2.get("count")=="up"
order=[0,1,2] if up else [2,1,0]
T=[("hook",0,1.4)]; t0=1.4
for k in range(3):
    d=2.4 if k==2 else 2.2; T.append((f"p{k}",t0,d)); t0+=d
T.append(("end",t0,1.4)); TOT=t0+1.4
def grad(c1,c2):
    a=np.linspace(0,1,H)[:,None,None]; g=(np.array(c1)*(1-a)+np.array(c2)*a).astype(np.uint8)
    return Image.fromarray(np.repeat(g,W,1))
def dark(c,k=0.35): return tuple(int(v*k) for v in c)
def progress(im,gt):
    d=ImageDraw.Draw(im); d.rectangle((0,0,W,14),fill=(0,0,0)); d.rectangle((0,0,int(W*min(1,gt/TOT)),14),fill=YEL)
def kicker(d,y,txt):
    fk=f("Inter-Black.otf",44); tw=d.textlength(txt,font=fk)
    d.rounded_rectangle(((W-tw)/2-28,y,(W+tw)/2+28,y+80),radius=40,fill=YEL); d.text(((W-tw)/2,y+15),txt,font=fk,fill=INK)
def shake(im,t,amp=14,dur=0.25):
    if t>dur: return im
    k=amp*(1-t/dur); dx=int(k*math.sin(t*90)); dy=int(k*math.cos(t*70))
    out=Image.new("RGB",(W,H),(0,0,0)); out.paste(im,(dx,dy)); return out
def hook(t,gt):
    im=grad(RED,(120,20,10)); d=ImageDraw.Draw(im)
    kicker(d,230,V2.get("kicker","BLACK FRIDAY 2026 UK"))
    fh=f("InterDisplay-Black.otf",132); y=420
    for i,ln in enumerate(V2["hook"]):
        k=1+0.12*(1-ease((t-0.08*i)/0.22))
        lay=text_layer(ln,fh,YEL if i==len(V2["hook"])-1 else PAPER)
        paste_scaled(im,lay,W/2,y+70,k); y+=150
    e=emoji(V2["emoji"],380); paste_scaled(im,e,W/2,y+290+12*math.sin(t*9),1+0.2*(1-ease(t/0.25)),rot=8*math.sin(t*6))
    if True: ctext(ImageDraw.Draw(im),1560,"Ranked, with the #1 last ↓" if not up else "All 3 are live now ↓",f("Inter-Black.otf",50),PAPER)
    im=shake(im,t); progress(im,gt); return im
def pick(k,t,gt,dur):
    p=SP["picks"][order[k]]; col=COL[p["col"]]; n=(k+1) if up else (3-k)
    im=grad(dark(col,0.55),INK); d=ImageDraw.Draw(im)
    sx=int(W*(1-ease(t/0.22)))  # slide in
    lay=Image.new("RGBA",(W,H),(0,0,0,0)); dl=ImageDraw.Draw(lay)
    fn=f("InterDisplay-Black.otf",300); dl.text((70,170),f"#{n}",font=fn,fill=col+(255,))
    fl=f("Inter-Black.otf",44); tw=dl.textlength(p["label"],font=fl)
    dl.rounded_rectangle((90,520,90+tw+60,600),radius=40,fill=PAPER+(255,)); dl.text((120,535),p["label"],font=fl,fill=INK+(255,))
    e=emoji(p["emoji"],360); s=back((t-0.1)/0.3)
    if s>0: paste_scaled(lay,e,W-290,340+10*math.sin(t*7),s)
    y=740; dl.text((90,y),p["shop"].upper(),font=f("Inter-Black.otf",46),fill=MUTED+(255,)); y+=75
    fnm=f("InterDisplay-Black.otf",108)
    for ln in wrap(dl,p["name"],fnm,900): dl.text((90,y),ln,font=fnm,fill=PAPER+(255,)); y+=120
    if t>0.35:
        y+=30; fl2=f("Inter-Black.otf",62)
        for ln in wrap(dl,p["line"],fl2,900): dl.text((90,y),ln,font=fl2,fill=col+(255,)); y+=78
    dl.text((90,1580),V2.get("foot","Today's price → snappedupdeals.co.uk"),font=f("Inter-Bold.otf",40),fill=PAPER+(200,))
    im.paste(lay,(sx,0),lay)
    if n==1 and not up and t<0.3: im=shake(im,t,18,0.3)
    progress(im,gt); return im
def end(t,gt):
    im=grad(RED,(120,20,10)); d=ImageDraw.Draw(im)
    y=ctext(d,470,V2["endq"],f("InterDisplay-Black.otf",120),PAPER,maxw=940)
    ctext(d,y+40,"Tell us in the comments ↓",f("Inter-Black.otf",54),YEL)
    lf=f("InterDisplay-Black.otf",80); tx="snappedupdeals.co.uk"; tw=d.textlength(tx,font=lf); yy=y+200
    s=back(t/0.3); lay=Image.new("RGBA",(int(tw)+80,140),(0,0,0,0)); ImageDraw.Draw(lay).rounded_rectangle((0,0,tw+80,140),radius=30,fill=PAPER); ImageDraw.Draw(lay).text((40,22),tx,font=lf,fill=INK)
    paste_scaled(im,lay,W/2,yy+70,max(0.01,s))
    ctext(d,yy+200,V2.get("endsub","Full ranking + today's prices"),f("Inter-Black.otf",46),PAPER)
    ctext(d,1620,"#ad · We may earn commission from links. Prices change.",f("Inter-Bold.otf",30),PAPER,maxw=900)
    progress(im,gt); return im
FN={"hook":lambda t,gt,d:hook(t,gt),"end":lambda t,gt,d:end(t,gt)}
for k in range(3): FN[f"p{k}"]=(lambda k:(lambda t,gt,d:pick(k,t,gt,d)))(k)
out=V2["out"]; os.makedirs(sys.argv[1],exist_ok=True); os.chdir(sys.argv[1])
if len(sys.argv)>2:
    for nm,st,du in T: FN[nm](du*0.8,st+du*0.8,du).save(f"v2_{nm}.jpg")
    FN["hook"](0.03,0.03,1.4).save("v2_hook0.jpg"); sys.exit()
for nm,st,du in T: render("v2"+nm,(lambda nm,st,du:(lambda t:FN[nm](t,st+t,du)))(nm,st,du),du)
open("list2.txt","w").write("".join(f"file 'seg/v2{n}.mp4'\n" for n,_,_ in T))
# audio
SR=44100; a=np.zeros(int(SR*(TOT+1)))
def add(tt,sig): i=int(tt*SR); a[i:i+len(sig)]+=sig[:len(a)-i]
def envl(n,at=0.003,r=0.1): tt=np.arange(n)/SR; return np.minimum(1,tt/at)*np.exp(-tt/r)
def kick(): n=int(SR*0.3); tt=np.arange(n)/SR; fq=120*np.exp(-tt*12)+42; return 0.8*np.sin(2*np.pi*np.cumsum(fq)/SR)*envl(n,0.002,0.1)
def hat(): n=int(SR*0.05); return 0.08*np.random.randn(n)*envl(n,0.001,0.012)
def whoosh(): n=int(SR*0.22); k=np.convolve(np.random.randn(n),np.ones(25)/25,'same'); return 0.4*k*np.sin(np.linspace(0,np.pi,n))**2
def ding(fq=1318.5): n=int(SR*0.5); tt=np.arange(n)/SR; return 0.25*(np.sin(2*np.pi*fq*tt)+0.6*np.sin(2*np.pi*fq*1.5*tt))*envl(n,0.002,0.18)
def riser(d): n=int(SR*d); tt=np.arange(n)/SR; fq=200+1200*(tt/d)**2; return 0.12*np.sin(2*np.pi*np.cumsum(fq)/SR)*(tt/d)
bt=0.0
while bt<TOT: add(bt,kick()); add(bt+0.25,hat()); bt+=0.5
add(0,whoosh()); add(0.02,ding(988))
for i,(nm,st,du) in enumerate(T[1:4]):
    add(st-0.05,whoosh()); add(st+0.15,ding(1318.5 if i<2 else 1760))
add(T[3][1]-0.6,riser(0.6)); add(T[4][1]-0.05,whoosh()); add(T[4][1]+0.1,ding(1568))
a=np.tanh(a[:int(SR*TOT)]*1.2)*0.85; st=np.stack([a,a],1); import wave
w=wave.open("sfx2.wav","wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i","list2.txt","-i","sfx2.wav","-c:v","copy","-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",out],check=True)
print("done",out,round(TOT,1))
