# -*- coding: utf-8 -*-
"""生成食谱推荐页图标：菜篮子插图、时长/难度/热量图标、刷新图标。"""
from PIL import Image, ImageDraw
import math, os

OUT = r"E:\code\Food\miniprogram\images"
S = 4
W = (255, 255, 255, 255)


def canvas(size):
    im = Image.new("RGBA", (size*S, size*S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def finish(im, name):
    im = im.resize((im.width//S, im.height//S), Image.LANCZOS)
    im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print("%-28s %dx%d" % (name, im.width, im.height))


# ---------- 横幅：装蔬菜的菜篮子 ----------
def hero_basket():
    size = 140
    im, d = canvas(size)
    G1 = (126, 200, 96, 255)
    G2 = (86, 172, 72, 255)
    G3 = (150, 214, 120, 255)
    # 篮子（浅绿梯形）
    d.polygon([(24*S, 86*S), (116*S, 86*S), (102*S, 130*S), (38*S, 130*S)], fill=G3)
    d.line([(24*S, 86*S), (116*S, 86*S)], fill=G1, width=int(4*S))
    for x in (56, 70, 84):
        d.line([(x*S, 94*S), ((x-3)*S, 124*S)], fill=G1, width=int(3*S))
    # 篮内蔬菜：几片叶子 + 圆果
    for cx, cy, rx, ry, col in ((50, 70, 20, 16, G1), (78, 64, 22, 18, G2),
                                (104, 74, 18, 15, G1), (64, 84, 16, 12, G2)):
        d.ellipse([(cx-rx)*S, (cy-ry)*S, (cx+rx)*S, (cy+ry)*S], fill=col)
    # 果柄
    d.line([(70*S, 46*S), (74*S, 34*S)], fill=G2, width=int(3.4*S))
    d.ellipse([70*S, 52*S, 88*S, 70*S], fill=G2)
    # 闪光星
    for cx, cy, r in ((28, 34, 7), (110, 30, 5)):
        d.polygon([((cx)*S, (cy-r)*S), ((cx+r*0.32)*S, (cy-r*0.32)*S), ((cx+r)*S, (cy)*S),
                   ((cx+r*0.32)*S, (cy+r*0.32)*S), ((cx)*S, (cy+r)*S),
                   ((cx-r*0.32)*S, (cy+r*0.32)*S), ((cx-r)*S, (cy)*S),
                   ((cx-r*0.32)*S, (cy-r*0.32)*S)], fill=(178, 224, 140, 255))
    finish(im, "recipe-basket.png")


# ---------- 元信息图标（灰色线性） ----------
def meta_clock():
    im, d = canvas(40)
    w = int(2.6*S)
    c = (140, 150, 145, 255)
    d.ellipse([6*S, 6*S, 34*S, 34*S], outline=c, width=w)
    d.line([(20*S, 12*S), (20*S, 21*S)], fill=c, width=w)
    d.line([(20*S, 21*S), (27*S, 25*S)], fill=c, width=w)
    finish(im, "icon-meta-clock.png")


def meta_chef():
    im, d = canvas(40)
    w = int(2.6*S)
    c = (140, 150, 145, 255)
    # 厨师帽：三个圆 + 帽檐
    d.ellipse([6*S, 12*S, 20*S, 26*S], outline=c, width=w)
    d.ellipse([20*S, 12*S, 34*S, 26*S], outline=c, width=w)
    d.ellipse([13*S, 6*S, 27*S, 20*S], outline=c, width=w)
    d.line([(12*S, 26*S), (28*S, 26*S)], fill=c, width=w)
    d.line([(13*S, 31*S), (27*S, 31*S)], fill=c, width=w)
    d.line([(12*S, 26*S), (13*S, 31*S)], fill=c, width=w)
    d.line([(28*S, 26*S), (27*S, 31*S)], fill=c, width=w)
    finish(im, "icon-meta-chef.png")


def meta_kcal():
    im, d = canvas(40)
    w = int(2.6*S)
    c = (140, 150, 145, 255)
    # 火焰
    d.polygon([(20*S, 4*S), (30*S, 18*S), (30*S, 28*S), (10*S, 28*S), (10*S, 18*S)], outline=c, width=w)
    d.arc([15*S, 20*S, 25*S, 34*S], start=180, end=360, fill=c, width=w)
    d.arc([15*S, 26*S, 25*S, 38*S], start=0, end=180, fill=c, width=w)
    finish(im, "icon-meta-kcal.png")


# ---------- 「可直接做」叶片（白色） ----------
def leaf_small():
    im, d = canvas(28)
    w = int(2.4*S)
    def bez(p0, p1, p2, n=20):
        pts = []
        for i in range(n+1):
            t = i/n
            pts.append((((1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0])*S,
                        ((1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1])*S))
        return pts
    tip, base = (7, 5), (20, 22)
    d.line(bez(tip, (5, 16), base), fill=W, width=w, joint="curve")
    d.line(bez(tip, (22, 10), base), fill=W, width=w, joint="curve")
    d.line([(tip[0]*S, tip[1]*S), (base[0]*S, base[1]*S)], fill=W, width=w)
    finish(im, "icon-leaf-mini.png")


# ---------- 「换一批」刷新图标（绿色） ----------
def refresh():
    im, d = canvas(40)
    w = int(3.0*S)
    c = (46, 174, 85, 255)
    d.arc([8*S, 8*S, 32*S, 32*S], start=40, end=320, fill=c, width=w)
    d.polygon([(31*S, 5*S), (33*S, 16*S), (22*S, 13*S)], fill=c)
    finish(im, "icon-refresh.png")


# ---------- 食材圆图（菜篮子食材速览用） ----------
def round_thumb(src_name, out_name, size=56):
    p = os.path.join(OUT, src_name)
    if not os.path.exists(p):
        print("跳过（缺源图）:", src_name)
        return
    src = Image.open(p).convert("RGB")
    side = min(src.size)
    left = (src.width - side)//2
    top = (src.height - side)//2
    src = src.crop((left, top, left+side, top+side)).resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size*S, size*S), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size*S-1, size*S-1], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    out.save(os.path.join(OUT, out_name), "PNG", optimize=True)
    print("%-28s %dx%d" % (out_name, size, size))


if __name__ == "__main__":
    hero_basket()
    meta_clock(); meta_chef(); meta_kcal()
    leaf_small(); refresh()
    for src_name, out_name in (("basket-tomato.png", "thumb-tomato.png"),
                               ("basket-egg.png", "thumb-egg.png"),
                               ("basket-lettuce.png", "thumb-lettuce.png"),
                               ("basket-potato.png", "thumb-potato.png"),
                               ("basket-strawberry.png", "thumb-strawberry.png"),
                               ("basket-milk.png", "thumb-milk.png")):
        round_thumb(src_name, out_name)
