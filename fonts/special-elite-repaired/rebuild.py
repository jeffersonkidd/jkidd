from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
import statistics, sys

SRC='an/handdrawn/fonts/SpecialElite-Regular.ttf'

def bounds(t, gn):
    gs=t.getGlyphSet(); bp=BoundsPen(gs)
    gs[gn].draw(bp); return bp.bounds

def cap_lsbs(t):
    cm=t.getBestCmap(); out=[]
    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789":
        gn=cm.get(ord(ch))
        if not gn: continue
        b=bounds(t,gn)
        if b: out.append(b[0])
    return out

def build(mode, target_sb, outname, family, style_suffix):
    t=TTFont(SRC)
    glyf=t['glyf']; hmtx=t['hmtx']; upm=t['head'].unitsPerEm

    # ---- 1. horizontal normalisation (outlines translated, shapes untouched)
    simple, composite = [], []
    for gn in t.getGlyphOrder():
        g=glyf[gn]
        if g.numberOfContours==0: continue
        (composite if g.isComposite() else simple).append(gn)

    advances={}
    for gn in simple:
        g=glyf[gn]
        g.recalcBounds(glyf)
        w=g.xMax-g.xMin
        delta=target_sb-g.xMin
        if delta: 
            for p in range(len(g.coordinates)):
                x,y=g.coordinates[p]; g.coordinates[p]=(x+delta,y)
            g.recalcBounds(glyf)
        if mode=='mono':
            advances[gn]=None   # filled after we know the uniform width
        else:
            advances[gn]=g.xMax+target_sb

    if mode=='mono':
        # uniform advance = widest cap ink + 2x sidebearing, then centre each glyph
        cm2=t.getBestCmap()
        letters=set()
        for ch in ("ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                   "abcdefghijklmnopqrstuvwxyz0123456789"):
            gn2=cm2.get(ord(ch))
            if gn2: letters.add(gn2)
        inkw=[glyf[gn].xMax-glyf[gn].xMin for gn in simple if gn in letters]
        # widest letter plus a little air -- ignore em-dash/underscore outliers
        uni=int(max(inkw)+2*24)
        for gn in simple:
            g=glyf[gn]
            w=g.xMax-g.xMin
            shift=int(round((uni-w)/2 - g.xMin))
            if shift:
                for p in range(len(g.coordinates)):
                    x,y=g.coordinates[p]; g.coordinates[p]=(x+shift,y)
                g.recalcBounds(glyf)
            advances[gn]=uni

    for gn,adv in advances.items():
        old_adv, old_lsb = hmtx[gn]
        hmtx[gn]=(int(adv), int(glyf[gn].xMin))

    for gn in composite:
        glyf[gn].recalcBounds(glyf)
        g=glyf[gn]
        adv = uni if mode=='mono' else int(g.xMax+target_sb)
        hmtx[gn]=(int(adv), int(g.xMin))

    # space + zero-contour glyphs
    for gn in t.getGlyphOrder():
        if glyf[gn].numberOfContours==0:
            a,l=hmtx[gn]
            hmtx[gn]=(uni if mode=='mono' else a, 0)

    # ---- 2. kerning: meaningless once monospaced
    if mode=='mono':
        for tag in ('kern','GPOS'):
            if tag in t: del t[tag]

    # ---- 3. repair the metric tables
    t['head'].recalcBBoxes=True
    os2=t['OS/2']; hh=t['hhea']
    # real cap height from H
    capH=int(bounds(t, t.getBestCmap()[ord('H')])[3])
    os2.sCapHeight=capH
    xh=bounds(t, t.getBestCmap()[ord('x')])
    if xh: os2.sxHeight=int(xh[3])

    # give line-height:normal real air -> target 1.25 em
    t.save('/tmp/_tmp_probe.ttf'); probe=TTFont('/tmp/_tmp_probe.ttf')
    ymax=probe['head'].yMax; ymin=probe['head'].yMin
    total=int(upm*1.25)
    slack=total-(ymax-ymin)
    asc=int(ymax+slack*0.55); desc=int(ymin-slack*0.45)
    hh.ascender=asc; hh.descender=desc; hh.lineGap=0
    os2.sTypoAscender=asc; os2.sTypoDescender=desc; os2.sTypoLineGap=0
    os2.usWinAscent=max(asc,ymax); os2.usWinDescent=max(-desc,-ymin)
    os2.fsSelection |= (1<<7)          # USE_TYPO_METRICS
    os2.version=max(os2.version,4)

    # ---- 4. rename so it can live beside the original
    full=f"{family} {style_suffix}".strip()
    for rec in t['name'].names:
        try: v=rec.toUnicode()
        except Exception: continue
        if rec.nameID==1: rec.string=family
        elif rec.nameID==2: rec.string="Regular"
        elif rec.nameID==4: rec.string=full
        elif rec.nameID==6: rec.string=family.replace(' ','')+"-Regular"
        elif rec.nameID==3: rec.string="1.002;MOD;"+family.replace(' ','')
        elif rec.nameID==5: rec.string="Version 1.002; sidebearings normalised, metrics repaired"
        elif rec.nameID==16: rec.string=family
        elif rec.nameID==10: rec.string="Apache-2.0 derivative of Special Elite by Astigmatic. Outlines unmodified."
    if mode=='mono':
        t['post'].isFixedPitch=1

    t.save(outname+'.ttf')
    t.flavor='woff2'; t.save(outname+'.woff2')
    return outname, capH, asc, desc, (asc-desc)/upm, (uni if mode=='mono' else None)

orig=TTFont(SRC)
lsbs=cap_lsbs(orig)
med=int(statistics.median(lsbs))
print(f"original cap/digit LSB: median {med}, stdev {statistics.stdev(lsbs):.1f}, range {min(lsbs)}..{max(lsbs)}")
print(f"using target sidebearing = {med}\n")

for mode,out,fam,suf in [('even','SpecialEliteEven','Special Elite Even',''),
                         ('mono','SpecialEliteMono','Special Elite Mono','')]:
    name,capH,asc,desc,lead,uni = build(mode, med, out, fam, suf)
    extra = f", uniform advance {uni}" if uni else ""
    print(f"built {name}.woff2  sCapHeight={capH}  asc={asc} desc={desc}  lead/em={lead:.3f}{extra}")
