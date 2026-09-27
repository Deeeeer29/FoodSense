# -*- coding: utf-8 -*-
"""把用户提供的 7 张真实照片放置到对应位置（按展示尺寸裁剪压缩）。"""
from PIL import Image, ImageDraw
import os

A = r"C:\Users\YH\.dsh\attachments\v1\objects"
DST = r"E:\code\Food\miniprogram\images"
S = 4

SRC = {
    "tomato":     os.path.join(A, "ac", "ac357badd543f69429acae340ce9d63c52f4191d61a6a261dc8d1756e1657318"),
    "egg":        os.path.join(A, "38", "3815427f9615484dabe82a0ca6666fcc3d8af8816c02461b10448b842f51c458"),
    "milk":       os.path.join(A, "db", "db9620895179034136177af89611f3135b1c59ccda2799505a0cc939c45498f4"),
    "potato_egg": os.path.join(A, "da", "da0fa54af78244f77376171ccf08b734193bd401a056318f0b88b19333d54f1b"),
    "custard":    os.path.join(A, "7f", "7f15a3c00d28de8c305ef5530a7de45ee3fbeeda3a5b6e6184785223a1ffb6d4"),
    "lettuce_soup": os.path.join(A, "00", "00bae2ae88ffa1bd3d7ff4456f89bd4dc1d7d4caa2e2801931159abdf544fa7f"),
    "tomato_egg": os.path.join(A, "a7", "a70789c37a152b4a195e252c0571995f579e65ca7e077030d69c35b819d88ea9"),
}
# 修正土豆鸡蛋饼路径（对象目录首两位）
SRC["potato_egg"] = os.path.join(A, "da", "da0fa54af78244f77376171ccf08a739193bd401a056318f0b88b19333d54f1b")


def load(key):
    im = Image.open(SRC[key])
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, (0, 0), im)
        return bg
    return im.convert("RGB")


def save_jpg(im, name, size, quality=88):
    out = im.resize(size, Image.LANCZOS)
    p = os.path.join(DST, name)
    out.save(p, "JPEG", quality=quality, optimize=True, progressive=True)
    print("%-30s %-11s %6.1f KB" % (name, "%dx%d" % size, os.path.getsize(p) / 1024))


def save_thumb(im, name, size=88):
    """圆形缩略图（保留透明背景）"""
    n = size * S
    src = im.resize((n, n), Image.LANCZOS)
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, n - 1, n - 1], fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    out = out.resize((size, size), Image.LANCZOS)
    p = os.path.join(DST, name)
    out.save(p, "PNG", optimize=True)
    print("%-30s %-11s %6.1f KB" % (name, "%dx%d" % (size, size), os.path.getsize(p) / 1024))


def center_band(im, ratio):
    """按目标宽高比从中心裁一条横带"""
    w, h = im.size
    band_h = int(w / ratio)
    if band_h > h:
        band_h = h
    top = (h - band_h) // 2
    return im.crop((0, top, w, top + band_h))


if __name__ == "__main__":
    # ---- 食材：菜篮子行缩略图 + 圆形小图 ----
    for key, base in (("tomato", "tomato"), ("egg", "egg"), ("milk", "milk")):
        im = load(key)
        save_jpg(im, "basket-%s.jpg" % base, (300, 300), quality=86)
        save_thumb(im, "thumb-%s.png" % base, 88)

    # ---- 菜谱列表图（正方形） ----
    save_jpg(load("tomato_egg"),  "recipe-tomato-egg.jpg",   (440, 440), quality=88)
    save_jpg(load("potato_egg"),  "recipe-potato-egg.jpg",   (440, 440), quality=88)
    save_jpg(load("custard"),     "recipe-milk-custard.jpg", (440, 440), quality=88)
    save_jpg(load("lettuce_soup"), "dish-lettuce-egg.jpg",   (440, 440), quality=88)

    # ---- 食谱详情大图（按 726:420 比例裁横带） ----
    im = load("tomato_egg")
    im = center_band(im, 726 / 420)
    save_jpg(im, "dish-tomato-egg-large.jpg", (760, 440), quality=86)
