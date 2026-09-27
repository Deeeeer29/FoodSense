# -*- coding: utf-8 -*-
"""生成添加剂详情页「常见使用场景」的四个分类图标（绿色描边/填充风格）。"""
from PIL import Image, ImageDraw
import math, os

OUT = r"E:\code\Food\miniprogram\images"
S = 4
G1 = (108, 196, 110, 255)
G2 = (58, 160, 74, 255)


def canvas(size):
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def finish(im, name):
    """统一加淡绿底，保证在页面卡片上也是一致的圆形底'''
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print("%-28s %dx%d" % (name, im.width, im.height))


def chips():
    """薯片：波浪形薯片条 + 小圆点"""
    im, d = canvas(64)
    w = int(3.2 * S)
    d.arc([10*S, 20*S, 54*S, 52*S], start=200, end=340, fill=G1, width=w)
    d.arc([14*S, 26*S, 50*S, 50*S], start=200, end=340, fill=G2, width=int(2.2*S))
    d.line([(14*S, 40*S), (50*S, 40*S)], fill=G1, width=w)
    for x in (24, 32, 40):
        d.ellipse([(x-2)*S, (34)*S, (x+2)*S, (38)*S], fill=G2)
    finish(im, "scene-chips.png")


def cookie():
    """饼干糕点：圆形饼干 + 巧克力豆"""
    im, d = canvas(64)
    w = int(3.2 * S)
    d.ellipse([10*S, 12*S, 52*S, 54*S], outline=G1, width=w)
    for cx, cy, r in ((24, 26, 3.4), (38, 24, 3.0), (44, 38, 3.4), (26, 42, 3.0), (34, 33, 2.6)):
        d.ellipse([(cx-r)*S, (cy-r)*S, (cx+r)*S, (cy+r)*S], fill=G2)
    finish(im, "scene-cookie.png")


def oil():
    """食用油脂：油滴（水滴形）"""
    im, d = canvas(64)
    w = int(3.2 * S)
    d.polygon([(32*S, 10*S), (46*S, 32*S)], fill=G1)
    d.polygon([(32*S, 10*S), (18*S, 32*S)], fill=G1)
    d.ellipse([18*S, 26*S, 46*S, 54*S], fill=G1)
    d.ellipse([24*S, 34*S, 40*S, 50*S], fill=G2)
    finish(im, "scene-oil.png")


def nut():
    """坚果炒货：坚果轮廓 + 纹理线"""
    im, d = canvas(64)
    w = int(3.2 * S)
    d.ellipse([12*S, 12*S, 52*S, 52*S], outline=G1, width=w)
    d.arc([18*S, 18*S, 46*S, 46*S], start=210, end=30, fill=G2, width=int(2.4*S))
    d.line([(24*S, 24*S), (40*S, 40*S)], fill=G2, width=int(2.2*S))
    finish(im, "scene-nut.png")


if __name__ == "__main__":
    chips(); cookie(); oil(); nut()
