import numpy as np, wave
SR=44100; dur=2.6+3*3.3+3.0+2.6; out=np.zeros(int(SR*dur)+SR)
def add(t,sig):
    i=int(t*SR); out[i:i+len(sig)]+=sig[:len(out)-i]
def env(n,a=0.005,r=None):
    t=np.arange(n)/SR; e=np.minimum(1,t/a); return e*np.exp(-t/(r or 0.08))
def tone(f,d,vol=0.4,r=0.08):
    n=int(SR*d); t=np.arange(n)/SR; return vol*np.sin(2*np.pi*f*t)*env(n,r=r)
def pop(): n=int(SR*0.12); t=np.arange(n)/SR; f=600*np.exp(-t*25)+180; return 0.5*np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,r=0.04)
def tick(): return tone(1800,0.03,0.25,0.01)
def whoosh():
    n=int(SR*0.25); noise=np.random.randn(n); k=np.convolve(noise,np.ones(30)/30,'same'); e=np.sin(np.linspace(0,np.pi,n))**2; return 0.35*k*e
def thump():
    n=int(SR*0.35); t=np.arange(n)/SR; f=110*np.exp(-t*8)+45; return 0.9*np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.12)+0.15*np.random.randn(n)*env(n,0.001,0.02)
def ding(): return tone(1318.5,0.6,0.28,0.25)+tone(1975.5,0.6,0.18,0.2)
def buzz():
    n=int(SR*0.35); t=np.arange(n)/SR; s=np.sign(np.sin(2*np.pi*140*t)); return 0.18*s*env(n,0.005,0.15)
add(0,pop()); add(0.1,thump())
t=2.6
for i in range(3):
    add(t,whoosh()); add(t+0.3,thump()); add(t+0.32,ding()); t+=3.3
add(t,whoosh()); add(t+0.2,pop()); t+=3.0
add(t,whoosh()); add(t+0.1,pop())
out=out[:int(SR*dur)]; out=np.tanh(out*1.1)*0.8
st=np.stack([out,out],1); pcm=(st*32767).astype(np.int16)
w=wave.open("sfx.wav","wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
