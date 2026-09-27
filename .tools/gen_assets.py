# -*- coding: utf-8 -*-
"""生成首页所需图标素材（tabBar 图标 + 相机按钮 + 快捷入口图标 + Logo）。"""
from PIL import Image, ImageDraw
import math, os

IMG = r"E:\code\Food\miniprogram\images"

GREEN = (34, 150, 60, 255)
GREY = (150, 156, 160, 255)
ORANGE = (244, 106, 60, 255)
S = 4


def canvas(size):
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def finish(im, path):
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    im.save(path, "PNG", optimize=True)
    print("%-58s %dx%d" % (os.path.basename(path), im.width, im.height))


def icon_home(color):
    im, d = canvas(81)
    w = 7 * S
    # 屋顶
    d.line([(7 * S, 40 * S), (40 * S, 11 * S), (73 * S, 40 * S)], fill=color, width=w, joint="curve")
    # 墙体（左右立柱 + 底边，形成完整闭合轮廓）
    d.line([(16 * S, 33 * S), (16 * S, 69 * S), (64 * S, 69 * S), (64 * S, 33 * S)],
           fill=color, width=w, joint="curve")
    return im


def icon_basket(color):
    im, d = canvas(81)
    w = 7 * S
    d.arc([23 * S, 6 * S, 58 * S, 42 * S], start=180, end=360, fill=color, width=w)
    d.polygon([(9 * S, 28 * S), (72 * S, 28 * S), (62 * S, 72 * S), (19 * S, 72 * S)], outline=color, width=w)
    for x in (29, 40, 51):
        d.line([(x * S, 40 * S), ((x - 2) * S, 64 * S)], fill=color, width=int(5 * S))
    return im


def icon_discover(color):
    im, d = canvas(81)
    w = 7 * S
    d.ellipse([9 * S, 9 * S, 71 * S, 71 * S], outline=color, width=w)
    d.polygon([(55 * S, 26 * S), (45 * S, 45 * S), (26 * S, 55 * S), (36 * S, 36 * S)], fill=color)
    return im


def icon_user(color):
    im, d = canvas(81)
    w = 7 * S
    d.ellipse([26 * S, 12 * S, 54 * S, 40 * S], outline=color, width=w)
    d.arc([13 * S, 45 * S, 67 * S, 95 * S], start=180, end=360, fill=color, width=w)
    return im


def icon_camera(color, path):
    size = 120
    im, d = canvas(size)
    d.ellipse([0, 0, size * S, size * S], fill=(255, 255, 255, 255))
    w = int(6.5 * S)
    d.rounded_rectangle([28 * S, 38 * S, 92 * S, 84 * S], radius=10 * S, outline=color, width=w)
    d.line([(46 * S, 38 * S), (50 * S, 28 * S), (70 * S, 28 * S), (74 * S, 38 * S)], fill=color, width=w, joint="curve")
    d.ellipse([48 * S, 49 * S, 72 * S, 73 * S], outline=color, width=w)
    finish(im, path)


def q_basket(color):
    im, d = canvas(64)
    w = int(5.6 * S)
    d.arc([20 * S, 4 * S, 46 * S, 34 * S], start=180, end=360, fill=color, width=w)
    d.polygon([(7 * S, 22 * S), (58 * S, 22 * S), (50 * S, 57 * S), (15 * S, 57 * S)], outline=color, width=w)
    for x in (24, 32, 40):
        d.line([(x * S, 32 * S), ((x - 1.5) * S, 51 * S)], fill=color, width=int(4.4 * S))
    return im


def q_star(color):
    im, d = canvas(64)
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = 26 if i % 2 == 0 else 11
        pts.append(((32 + r * math.cos(ang)) * S, (32 + r * math.sin(ang)) * S))
    d.polygon(pts, outline=color, width=int(4.6 * S))
    return im


def q_guide(color):
    im, d = canvas(64)
    w = int(5.2 * S)
    d.rounded_rectangle([10 * S, 8 * S, 54 * S, 56 * S], radius=9 * S, outline=color, width=w)
    for i, y in enumerate((21, 31, 41)):
        d.line([(20 * S, y * S), ((44 - i * 10) * S, y * S)], fill=color, width=int(4.6 * S))
    return im


def q_user(color):
    im, d = canvas(64)
    w = int(5.2 * S)
    d.rounded_rectangle([7 * S, 7 * S, 57 * S, 57 * S], radius=15 * S, outline=color, width=int(4.4 * S))
    d.ellipse([21 * S, 15 * S, 43 * S, 37 * S], outline=color, width=w)
    d.arc([16 * S, 34 * S, 48 * S, 66 * S], start=180, end=360, fill=color, width=int(w))
    return im


def make_logo(path):
    size = 108
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i in range(size * S):
        t = i / (size * S)
        d.line([(0, i), (size * S, i)], fill=(int(154 - 96 * t), int(222 - 60 * t), int(74 - 20 * t), 255))
    mask = Image.new("L", (size * S, size * S), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size * S - 1, size * S - 1], fill=255)
    im.putalpha(mask)
    d = ImageDraw.Draw(im)
    d.ellipse([28 * S, 28 * S, 80 * S, 80 * S], outline=(255, 255, 255, 255), width=int(4.5 * S))
    d.line([(38 * S, 56 * S), (70 * S, 40 * S)], fill=(255, 255, 255, 255), width=int(4.5 * S))
    d.line([(38 * S, 56 * S), (44 * S, 34 * S)], fill=(255, 255, 255, 255), width=int(3.6 * S))
    finish(im, path)


if __name__ == "__main__":
    os.makedirs(IMG, exist_ok=True)
    icons_dir = os.path.join(IMG, "icons")
    os.makedirs(icons_dir, exist_ok=True)

    for name, fn in (("home", icon_home), ("basket", icon_basket), ("discover", icon_discover), ("user", icon_user)):
        finish(fn(GREY), os.path.join(IMG, "tab-%s.png" % name))
        finish(fn(GREEN), os.path.join(IMG, "tab-%s-active.png" % name))

    icon_camera(ORANGE, os.path.join(IMG, "camera-orange.png"))
    icon_camera((26, 160, 70, 255), os.path.join(IMG, "camera-green.png"))

    finish(q_basket((24, 160, 78, 255)), os.path.join(icons_dir, "q-basket.png"))
    finish(q_star((226, 138, 32, 255)), os.path.join(icons_dir, "q-star.png"))
    finish(q_guide((92, 110, 200, 255)), os.path.join(icons_dir, "q-guide.png"))
    finish(q_user((150, 108, 205, 255)), os.path.join(icons_dir, "q-user.png"))
    make_logo(os.path.join(IMG, "logo-shichaju.png"))


