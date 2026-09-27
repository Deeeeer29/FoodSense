# -*- coding: utf-8 -*-
"""为场景图标补白色圆形底，并生成详情页「安全性评估」盾牌图标。"""
from PIL import Image, ImageDraw
import os
IMG = r"E:\code\Food\miniprogram\images"
S = 4

for n in ("scene-chips.png", "scene-cookie.png", "scene-oil.png", "scene-nut.png"):
    p = os.path.join(IMG, n)
    src = Image.open(p).convert("RGBA")
    size = src.width
    base = Image.new("RGBA", (size*S, size*S), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    d.ellipse([0, 0, size*S-1, size*S-1], fill=(255, 255, 255, 255))
    big = src.resize((size*S, size*S), Image.LANCZOS)
    base.alpha_composite(big)
    base = base.resize((size, size), Image.LANCZOS)
    base.save(p, "PNG", optimize=True)
    print("圈底:", n)

# 安全性评估图标：白圆底 + 橙色盾牌（内部白色勾）
def shield(risk_color, name):
    size = 96
    n = size*S
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([0, 0, n-1, n-1], fill=(255, 255, 255, 255))
    c1 = risk_color
    c2 = tuple(max(0, v-28) for v in risk_color[:3]) + (255,)
    # 渐变盾牌
    for i in range(22*S, 74*S):
        t = (i - 22*S) / (52*S)
        col = (int(c1[0]+(c2[0]-c1[0])*t), int(c1[1]+(c2[1]-c1[1])*t), int(c1[2]+(c2[2]-c1[2])*t), 255)
        d.line([(26*S, i), (70*S, i)], fill=col)
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).polygon([(48*S, 22*S), (72*S, 32*S), (72*S, 50*S), (48*S, 72*S), (24*S, 50*S), (24*S, 32*S)], fill=255)
    solid = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    solid.paste(im, (0, 0), mask)
    d2 = ImageDraw.Draw(solid)
    d2.line([(36*S, 48*S), (45*S, 57*S), (61*S, 39*S)], fill=(255, 255, 255, 255), width=int(5*S), joint="curve")
    solid = solid.resize((size, size), Image.LANCZOS)
    solid.save(os.path.join(IMG, name), "PNG", optimize=True)
    print("盾牌:", name)

shield((240, 160, 60, 255), "icon-shield-amber.png")
shield((246, 170, 70, 255), "icon-shield-orange.png")
