# -*- coding: utf-8 -*-
"""生成包装食品识别结果页改版所需图标（区块头图标、添加剂图标、风险等级图标、页脚按钮图标）。"""
from PIL import Image, ImageDraw
import math, os

OUT = r"E:\code\Food\miniprogram\images"
S = 4
WHITE = (255, 255, 255, 255)


def canvas(size):
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def grad_square(size, c1, c2, radius_ratio=0.28):
    """圆角渐变方块"""
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    g = Image.new("RGBA", (size * S, size * S))
    gd = ImageDraw.Draw(g)
    n = size * S
    for i in range(n):
        t = i / n
        gd.line([(0, i), (n, i)], fill=(
            int(c1[0] + (c2[0] - c1[0]) * t),
            int(c1[1] + (c2[1] - c1[1]) * t),
            int(c1[2] + (c2[2] - c1[2]) * t), 255))
    mask = Image.new("L", (size * S, size * S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, n - 1, n - 1], radius=int(size * S * radius_ratio), fill=255)
    im.paste(g, (0, 0), mask)
    return im, ImageDraw.Draw(im)


def grad_circle(size, c1, c2):
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    g = Image.new("RGBA", (size * S, size * S))
    gd = ImageDraw.Draw(g)
    n = size * S
    for i in range(n):
        t = i / n
        gd.line([(0, i), (n, i)], fill=(
            int(c1[0] + (c2[0] - c1[0]) * t),
            int(c1[1] + (c2[1] - c1[1]) * t),
            int(c1[2] + (c2[2] - c1[2]) * t), 255))
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, n - 1, n - 1], fill=255)
    im.paste(g, (0, 0), mask)
    return im, ImageDraw.Draw(im)


def finish(im, name):
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print("%-30s %dx%d" % (name, im.width, im.height))


# ---------- 区块头图标（88x88 圆角渐变方块 + 白色图形） ----------
def head_table():
    im, d = grad_square(88, (108, 199, 118), (58, 165, 78))
    w = int(4.5 * S)
    d.rounded_rectangle([31*S, 22*S, 57*S, 66*S], radius=6*S, outline=WHITE, width=w)
    for y in (34, 44, 54):
        d.line([(38*S, y*S), (50*S, y*S)], fill=WHITE, width=int(3.6*S))
    finish(im, "icon-sec-table.png")


def head_additive():
    im, d = grad_square(88, (255, 168, 96), (243, 106, 60))
    w = int(4.2 * S)
    # 锥形瓶
    d.line([(36*S, 26*S), (52*S, 26*S)], fill=WHITE, width=w)
    d.line([(40*S, 26*S), (40*S, 42*S)], fill=WHITE, width=w)
    d.line([(48*S, 26*S), (48*S, 42*S)], fill=WHITE, width=w)
    d.polygon([(40*S, 42*S), (48*S, 42*S), (60*S, 64*S), (28*S, 64*S)], outline=WHITE, width=w)
    finish(im, "icon-sec-additive.png")


def head_nutrition():
    im, d = grad_square(88, (126, 208, 110), (72, 180, 76))
    w = int(4.6 * S)
    for x, h in ((32, 20), (42, 32), (52, 26)):
        d.line([(x*S, 64*S), (x*S, (64-h)*S)], fill=WHITE, width=w)
    finish(im, "icon-sec-nutrition.png")


def head_risk():
    im, d = grad_square(88, (255, 170, 92), (240, 122, 52))
    w = int(4.2 * S)
    # 盾牌 + 上升折线
    d.polygon([(44*S, 22*S), (64*S, 30*S), (64*S, 46*S), (44*S, 66*S), (24*S, 46*S), (24*S, 30*S)],
              outline=WHITE, width=w)
    d.line([(33*S, 48*S), (40*S, 40*S), (46*S, 45*S), (56*S, 33*S)], fill=WHITE, width=int(3.6*S), joint="curve")
    finish(im, "icon-sec-risk.png")


# ---------- 添加剂小图标（56x56 圆形 + 白色图形） ----------
def add_leaf():
    """柠檬酸 -> 叶片：两片对称叶 + 中脉"""
    im, d = grad_circle(56, (120, 206, 116), (56, 168, 74))
    w = int(3.2 * S)
    # 左叶
    d.polygon([(27*S, 42*S), (27*S, 26*S), (15*S, 22*S), (14*S, 36*S)], outline=WHITE, width=w)
    # 右叶
    d.polygon([(29*S, 42*S), (29*S, 26*S), (41*S, 22*S), (42*S, 36*S)], outline=WHITE, width=w)
    # 茎
    d.line([(28*S, 42*S), (28*S, 24*S)], fill=WHITE, width=w)
    finish(im, "icon-add-leaf.png")


def add_shield():
    im, d = grad_circle(56, (120, 206, 116), (56, 168, 74))
    w = int(3.4 * S)
    d.polygon([(28*S, 15*S), (42*S, 21*S), (42*S, 32*S), (28*S, 43*S), (14*S, 32*S), (14*S, 21*S)],
              outline=WHITE, width=w)
    finish(im, "icon-add-shield.png")


def add_crown():
    """TBHQ -> 皇冠：三点 + 冠体 + 底座"""
    im, d = grad_circle(56, (255, 205, 92), (243, 168, 34))
    w = int(3.0 * S)
    # 冠体（三角齿）
    d.polygon([(15*S, 36*S), (20*S, 22*S), (28*S, 32*S), (36*S, 22*S), (41*S, 36*S)],
              outline=WHITE, width=w)
    # 底座横条
    d.rounded_rectangle([15*S, 38*S, 41*S, 44*S], radius=2*S, fill=WHITE)
    finish(im, "icon-add-crown.png")


# ---------- 风险等级卡片图标（72x72 圆形底 + 图形） ----------
def risk_low():
    im, d = grad_circle(72, (126, 210, 122), (52, 172, 72))
    w = int(4 * S)
    d.rounded_rectangle([28*S, 22*S, 44*S, 52*S], radius=5*S, outline=WHITE, width=w)
    d.line([(40*S, 32*S), (50*S, 32*S)], fill=WHITE, width=int(3*S))
    d.line([(40*S, 40*S), (46*S, 40*S)], fill=WHITE, width=int(3*S))
    d.line([(20*S, 30*S), (26*S, 36*S), (20*S, 42*S)], fill=WHITE, width=w, joint="curve")
    finish(im, "icon-risk-low.png")


def risk_medium():
    """中风险 -> 皇冠（与添加剂图标同形，尺寸放大）"""
    im, d = grad_circle(72, (255, 205, 92), (243, 168, 34))
    w = int(4.5 * S)
    d.polygon([(18*S, 46*S), (23*S, 24*S), (36*S, 40*S), (49*S, 24*S), (54*S, 46*S)],
              outline=WHITE, width=w)
    d.rounded_rectangle([18*S, 49*S, 54*S, 57*S], radius=3*S, fill=WHITE)
    finish(im, "icon-risk-medium.png")


def risk_high():
    im, d = grad_circle(72, (178, 186, 192), (132, 142, 150))
    w = int(4 * S)
    d.rounded_rectangle([22*S, 30*S, 50*S, 54*S], radius=5*S, outline=WHITE, width=w)
    d.line([(30*S, 30*S), (34*S, 22*S), (38*S, 30*S)], fill=WHITE, width=w, joint="curve")
    d.line([(36*S, 36*S), (36*S, 46*S)], fill=WHITE, width=w)
    d.line([(30*S, 41*S), (42*S, 41*S)], fill=WHITE, width=w)
    finish(im, "icon-risk-high.png")


# ---------- 页脚按钮前景图标（透明底描边） ----------
def fg_star(color):
    im, d = canvas(44)
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = 18 if i % 2 == 0 else 8
        pts.append(((22 + r * math.cos(ang)) * S, (23 + r * math.sin(ang)) * S))
    d.polygon(pts, outline=color, width=int(3 * S))
    finish(im, "icon-star-outline.png")


def fg_camera(color):
    im, d = canvas(44)
    w = int(3 * S)
    d.rounded_rectangle([8*S, 14*S, 36*S, 34*S], radius=5*S, outline=color, width=w)
    d.line([(16*S, 14*S), (18*S, 9*S), (26*S, 9*S), (28*S, 14*S)], fill=color, width=w, joint="curve")
    d.ellipse([17*S, 18*S, 27*S, 28*S], outline=color, width=w)
    finish(im, "icon-camera-outline-white.png")


def fg_chevron():
    im, d = canvas(28)
    d.line([(10*S, 6*S), (18*S, 14*S), (10*S, 22*S)], fill=(150, 160, 155, 255), width=int(2.6*S), joint="curve")
    finish(im, "icon-chevron.png")


if __name__ == "__main__":
    head_table(); head_additive(); head_nutrition(); head_risk()
    add_leaf(); add_shield(); add_crown()
    risk_low(); risk_medium(); risk_high()
    fg_star((31, 138, 61, 255)); fg_camera(WHITE); fg_chevron()
