import math, sys, json, os, subprocess, shutil
from base import *
BLUE=(110,180,255); PINK=(255,120,170)
COL={"green":GREEN,"amber":AMBER,"blue":BLUE,"pink":PINK,"red":RED}
S=json.load(open("specs.json"))[sys.argv[1]]
def zoom(im,t,dur):
    s=1+0.03*(t/dur); w,h=int(W*s),int(H*s); z=im.resize((w,h),Image.BILINEAR); x=(w-W)//2; y=(h-H)//2; return z.crop((x,y,x+W,y+H))
def pill(d,y,txt,col,size=46):
    f0=f("Inter-Black.otf",size); tw=d.textlength(txt,font=f0)
    d.rounded_rectangle(((W-tw)/2-30,y,(W+tw)/2+30,y+size+30),radius=(size+30)//2,fill=col); d.text(((W-tw)/2,y+13),txt,font=f0,fill=INK)
def hook(t):
    im=Image.new("RGB",(W,H),INK); d=ImageDraw.Draw(im); y=260
    for i,ln in enumerate(S["hook"]):
        y=ctext(d,y,ln,f("InterDisplay-Black.otf",S.get("hooksize",104)),RED if i==len(S["hook"])-1 else PAPER)
    ctext(d,y+24,S["sub"],f("Inter-Black.otf",48),MUTED)
    e=emoji(S["hookemoji"],340); k=back(t/0.45)
    paste_scaled(im,e,W/2,y+520+10*math.sin(t*6),max(0.01,k))
    return zoom(im,t,2.6)
def pick(i,t):
    p=S["picks"][i]; col=COL[p["col"]]
    im=Image.new("RGB",(W,H),INK); d=ImageDraw.Draw(im)
    pill(d,260,p["label"],col)
    e=emoji(p["emoji"],260); paste_scaled(im,e,W/2,560+8*math.sin(t*6),back(t/0.35))
    y=ctext(d,760,p["shop"].upper(),f("Inter-Black.otf",44),MUTED)
    y=ctext(d,y+8,p["name"],f("InterDisplay-Black.otf",84),PAPER)
    if t>0.45: y=ctext(ImageDraw.Draw(im),y+50,p["line"],f("Inter-Black.otf",52),col,maxw=880)
    ctext(d,1560,"Today's price: snappedupdeals.co.uk",f("Inter-Bold.otf",36),MUTED)
    ctext(d,1620,f"{i+1}/3",f("Inter-Black.otf",40),(90,86,80))
    return zoom(im,t,3.3)
def tip(t):
    T=S["tip"]; im=Image.new("RGB",(W,H),INK); d=ImageDraw.Draw(im)
    pill(d,400,T.get("label","BUYING TIP"),AMBER)
    e=emoji(T.get("emoji","💡"),150); im.paste(e,(int(W/2-e.width/2),510),e)
    y=ctext(d,710,T["title"],f("InterDisplay-Black.otf",88),PAPER); y+=40
    fl=f("Inter-Black.otf",50)
    for k,r in enumerate(T["rows"]):
        if t<0.3+0.35*k: break
        if isinstance(r,list):
            a,b=r; d.rounded_rectangle((90,y,W-90,y+110),radius=24,fill=(40,38,34))
            d.text((130,y+28),a,font=fl,fill=PAPER); bw=d.textlength(b,font=fl); d.text((W-130-bw,y+28),b,font=fl,fill=GREEN); y+=135
        else:
            lines=wrap(d,r,fl,800); hh=len(lines)*58+52
            d.rounded_rectangle((90,y,W-90,y+hh),radius=24,fill=(40,38,34)); yy=y+26
            d.text((125,yy),"✓",font=f("Inter-Black.otf",50),fill=GREEN)
            for ln in lines: d.text((185,yy),ln,font=fl,fill=PAPER); yy+=58
            y+=hh+25
    if T.get("source"): ctext(d,y+20,T["source"],f("Inter-Bold.otf",36),MUTED)
    return zoom(im,t,3.0)
def end(t):
    im=Image.new("RGB",(W,H),INK); d=ImageDraw.Draw(im); y=560
    for ln in S["endq"]: y=ctext(d,y,ln,f("InterDisplay-Black.otf",112),PAPER)
    e=emoji("👇",90); im.paste(e,(int(W/2-45),y+20+int(10*math.sin(t*8))),e)
    yl=ctext(d,y+170,S["endline"],f("Inter-Black.otf",46),PAPER,maxw=900)
    lf=f("InterDisplay-Black.otf",76); tx="snappedupdeals.co.uk"; tw=d.textlength(tx,font=lf); yy=yl+40
    d.rounded_rectangle(((W-tw)/2-40,yy,(W+tw)/2+40,yy+130),radius=26,fill=RED); d.text(((W-tw)/2,yy+22),tx,font=lf,fill=PAPER)
    ctext(d,yy+200,"#ad · We may earn commission from links. Prices change, so check the site.",f("Inter-Bold.otf",30),MUTED,maxw=860)
    return zoom(im,t,2.6)
SC=[("hook",hook,2.6)]+[(f"p{i}",(lambda i:(lambda t:pick(i,t)))(i),3.3) for i in range(3)]+[("tip",tip,3.0),("end",end,2.6)]
os.chdir(sys.argv[1]) if os.path.isdir(sys.argv[1]) else (os.mkdir(sys.argv[1]), os.chdir(sys.argv[1]))
if len(sys.argv)>2 and sys.argv[2]=="stills":
    hook(1.5).save("s_hook.jpg"); pick(0,2).save("s_p0.jpg"); tip(2.9).save("s_tip.jpg"); end(1).save("s_end.jpg")
else:
    for nm,fn,du in SC: render(nm,fn,du)
    open("list.txt","w").write("".join(f"file 'seg/{n}.mp4'\n" for n,_,_ in SC))
    subprocess.run(["python3","../sfx7.py"],check=True)
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i","list.txt","-i","sfx.wav","-c:v","copy","-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",S["out"]],check=True)
    print("done",S["out"])
