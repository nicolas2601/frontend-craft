#!/usr/bin/env python3
"""svg-craft text2path: turn a string into SVG path data (so delivered logos/labels never reflow).

Usage: text2path.py --font /path/Font.ttf --text "PENICILINA" --size 20 [--tracking 0.02]
Prints JSON: {"d": "...", "width": float, "ascent": float, "descent": float, "size": float}
Origin is the left end of the baseline; y grows downward (SVG). Kerning (GPOS) is not applied: pass --tracking to compensate.
Needs fontTools (pip install fonttools). Check the font licence allows embedding outlines.
"""
import argparse, json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ap = argparse.ArgumentParser()
ap.add_argument('--font', required=True)
ap.add_argument('--text', required=True)
ap.add_argument('--size', type=float, required=True)
ap.add_argument('--tracking', type=float, default=0.0, help='extra spacing in em')
a = ap.parse_args()

f = TTFont(a.font)
upm = f['head'].unitsPerEm
cmap = f.getBestCmap()
gs = f.getGlyphSet()
hmtx = f['hmtx']
s = a.size / upm
pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
x = 0.0
missing = []
for ch in a.text:
    gn = cmap.get(ord(ch))
    if gn is None:
        missing.append(ch)
        gn = '.notdef'
    gs[gn].draw(TransformPen(pen, (s, 0, 0, -s, x, 0)))
    x += hmtx[gn][0] * s + a.tracking * a.size
if missing:
    print('warning: missing glyphs ' + ''.join(missing), file=sys.stderr)
os2 = f['OS/2']
print(json.dumps({'d': pen.getCommands(), 'width': round(x - a.tracking * a.size, 2), 'ascent': round(getattr(os2, 'sTypoAscender', upm * .8) * s, 2), 'descent': round(abs(getattr(os2, 'sTypoDescender', -upm * .2)) * s, 2), 'size': a.size}))
