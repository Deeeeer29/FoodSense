# -*- coding: utf-8 -*-
"""生成白色菜篮子图标（用于「加入菜篮子」按钮）。"""
from PIL import Image, ImageDraw
import os
OUT = r"E:\code\Food\miniprogram\images"
S = 4
W = (255, 255, 255, 255)

im = Image.new("RGBA", (44*S, 44*S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
w = int(2.8*S)
# 提手
d.arc([13*S, 6*S, 31*S, 26*S], start=180, end=360, fill=W, width=w)
# 篮身
d.polygon([(5*S, 16*S), (39*S, 16*S), (33*S, 38*S), (11*S, 38*S)], outline=W, width=w)
# 篮身竖纹
for x in (16, 22, 28):
    d.line([(x*S, 21*S), ((x-1)*S, 34*S)], fill=W, width=int(2.0*S))
im = im.resize((44, 44), Image.LANCZOS)
im.save(os.path.join(OUT, "icon-basket-white.png"), "PNG", optimize=True)
print("icon-basket-white.png 44x44")
