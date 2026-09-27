# -*- coding: utf-8 -*-
"""生成「关于」页素材：用户头像、四个数据入口图标、八个菜单图标。"""
from PIL import Image, ImageDraw
import os, math

OUT = r"E:\code\Food\miniprogram\images"
S = 4


def canvas(size):
    im = Image.new("RGBA", (size*S, size*S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def finish(im, name):
    im = im.resize((im.width//S, im.height//S), Image.LANCZOS)
    im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print("%-30s %dx%d" % (name, im.width, im.height))


# ================= 用户头像：圆底 + 卡通女孩 =================
def avatar():
    size = 160
    im, d = canvas(size)
    cx = size / 2
    # 圆形浅灰底
    d.ellipse([0, 0, size*S-1, size*S-1], fill=(238, 238, 240, 255))
    # 头发（深棕，覆盖头顶与两侧）
    hair = (86, 54, 40, 255)
    d.ellipse([38*S, 34*S, 122*S, 128*S], fill=hair)
    # 脸
    face = (252, 222, 200, 255)
    d.ellipse([50*S, 46*S, 110*S, 116*S], fill=face)
    # 刘海
    d.chord([48*S, 40*S, 112*S, 88*S], start=180, end=360, fill=hair)
    # 眼睛
    for ex in (68, 92):
        d.ellipse([(ex-5)*S, 76*S, (ex+5)*S, 88*S], fill=(58, 40, 34, 255))
        d.ellipse([(ex-2)*S, 78*S, (ex+1)*S, 82*S], fill=(255, 255, 255, 255))
    # 腮红
    for ex in (62, 98):
        d.ellipse([(ex-7)*S, 92*S, (ex+7)*S, 100*S], fill=(250, 190, 180, 255))
    # 嘴
    d.arc([74*S, 92*S, 86*S, 104*S], start=20, end=160, fill=(198, 110, 96, 255), width=int(2.6*S))
    # 耳朵
    for ex in (50, 110):
        d.ellipse([(ex-5)*S, 80*S, (ex+5)*S, 94*S], fill=face)
    # 肩膀/衣服（浅绿）
    d.ellipse([30*S, 118*S, 130*S, 200*S], fill=(186, 222, 168, 255))
    # 领口
    d.chord([62*S, 116*S, 98*S, 142*S], start=0, end=180, fill=face)
    # 裁剪成圆形
    mask = Image.new("L", (size*S, size*S), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size*S-1, size*S-1], fill=255)
    im.putalpha(mask)
    finish(im, "avatar-user.png")


# ================= 四个数据入口图标（渐变圆角方块 + 白色图形） =================
def grad_square(size, c1, c2, radius_ratio=0.3):
    im = Image.new("RGBA", (size*S, size*S), (0, 0, 0, 0))
    g = Image.new("RGBA", (size*S, size*S))
    gd = ImageDraw.Draw(g)
    n = size * S
    for i in range(n):
        t = i / n
        gd.line([(0, i), (n, i)], fill=(int(c1[0]+(c2[0]-c1[0])*t),
                                      int(c1[1]+(c2[1]-c1[1])*t),
                                      int(c1[2]+(c2[2]-c1[2])*t), 255))
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, n-1, n-1], radius=int(n*radius_ratio), fill=255)
    im.paste(g, (0, 0), mask)
    return im, ImageDraw.Draw(im)


def stat_fav():
    im, d = grad_square(88, (255, 156, 152), (246, 106, 106))
    d.polygon([(44*S, 66*S), (24*S, 46*S), (24*S, 32*S), (36*S, 26*S), (44*S, 36*S),
               (52*S, 26*S), (64*S, 32*S), (64*S, 46*S)], fill=(255, 255, 255, 255))
    finish(im, "stat-favorite.png")


def stat_basket():
    im, d = grad_square(88, (140, 214, 130), (86, 186, 90))
    w = int(4.4*S)
    W = (255, 255, 255, 255)
    d.arc([32*S, 20*S, 56*S, 46*S], start=180, end=360, fill=W, width=w)
    d.polygon([(22*S, 38*S), (66*S, 38*S), (58*S, 68*S), (30*S, 68*S)], outline=W, width=w)
    finish(im, "stat-basket.png")


def stat_recipe():
    im, d = grad_square(88, (255, 196, 120), (247, 156, 62))
    w = int(4.4*S)
    W = (255, 255, 255, 255)
    d.arc([22*S, 34*S, 66*S, 74*S], start=0, end=180, fill=W, width=w)
    d.line([(22*S, 52*S), (22*S, 34*S)], fill=W, width=w)
    d.line([(66*S, 52*S), (66*S, 34*S)], fill=W, width=w)
    d.line([(30*S, 62*S), (58*S, 62*S)], fill=W, width=int(3*S))
    finish(im, "stat-recipe.png")


def stat_history():
    im, d = grad_square(88, (150, 190, 250), (110, 150, 240))
    w = int(4.4*S)
    W = (255, 255, 255, 255)
    d.ellipse([22*S, 22*S, 66*S, 66*S], outline=W, width=w)
    d.line([(44*S, 32*S), (44*S, 46*S)], fill=W, width=w)
    d.line([(44*S, 46*S), (56*S, 52*S)], fill=W, width=w)
    finish(im, "stat-history.png")


# ================= 八个菜单图标（深灰线性，40x40 画布） =================
C = (108, 116, 112, 255)
W8 = int(2.6*S)


def icon_account():
    im, d = canvas(40)
    d.ellipse([14*S, 5*S, 26*S, 17*S], outline=C, width=W8)
    d.arc([8*S, 20*S, 32*S, 40*S], start=180, end=360, fill=C, width=W8)
    finish(im, "menu-account.png")


def icon_standard():
    im, d = canvas(40)
    d.rounded_rectangle([7*S, 6*S, 33*S, 34*S], radius=4*S, outline=C, width=W8)
    d.line([(13*S, 14*S), (27*S, 14*S)], fill=C, width=int(2.2*S))
    d.line([(13*S, 20*S), (27*S, 20*S)], fill=C, width=int(2.2*S))
    d.line([(13*S, 26*S), (21*S, 26*S)], fill=C, width=int(2.2*S))
    finish(im, "menu-standard.png")


def icon_disclaimer():
    im, d = canvas(40)
    d.ellipse([6*S, 6*S, 34*S, 34*S], outline=C, width=W8)
    d.line([(20*S, 13*S), (20*S, 23*S)], fill=C, width=W8)
    d.ellipse([18*S, 26*S, 22*S, 30*S], fill=C)
    finish(im, "menu-disclaimer.png")


def icon_feedback():
    im, d = canvas(40)
    d.rounded_rectangle([6*S, 8*S, 34*S, 30*S], radius=4*S, outline=C, width=W8)
    d.line([(13*S, 36*S), (13*S, 30*S)], fill=C, width=W8)
    d.line([(24*S, 8*S), (32*S, 16*S)], fill=C, width=int(2.2*S))
    finish(im, "menu-feedback.png")


def icon_faq():
    im, d = canvas(40)
    d.ellipse([6*S, 6*S, 34*S, 34*S], outline=C, width=W8)
    d.arc([14*S, 12*S, 26*S, 24*S], start=180, end=20, fill=C, width=int(2.4*S))
    d.line([(20*S, 22*S), (20*S, 24*S)], fill=C, width=W8)
    d.ellipse([18*S, 27*S, 22*S, 31*S], fill=C)
    finish(im, "menu-faq.png")


def icon_privacy():
    im, d = canvas(40)
    d.ellipse([13*S, 5*S, 27*S, 19*S], outline=C, width=int(2.2*S))
    d.arc([7*S, 18*S, 33*S, 40*S], start=180, end=360, fill=C, width=int(2.2*S))
    d.polygon([(29*S, 22*S), (35*S, 25*S), (35*S, 31*S), (29*S, 34*S), (23*S, 31*S), (23*S, 25*S)],
              outline=C, width=int(2.0*S))
    finish(im, "menu-privacy.png")


def icon_agreement():
    im, d = canvas(40)
    d.rounded_rectangle([6*S, 5*S, 34*S, 35*S], radius=4*S, outline=C, width=W8)
    d.line([(13*S, 12*S), (27*S, 12*S)], fill=C, width=int(2.2*S))
    d.line([(13*S, 20*S), (27*S, 20*S)], fill=C, width=int(2.2*S))
    d.line([(13*S, 28*S), (21*S, 28*S)], fill=C, width=int(2.2*S))
    finish(im, "menu-agreement.png")


def icon_contact():
    im, d = canvas(40)
    d.arc([8*S, 8*S, 32*S, 32*S], start=140, end=40, fill=C, width=W8)
    d.rounded_rectangle([6*S, 18*S, 12*S, 28*S], radius=3*S, fill=C)
    d.rounded_rectangle([28*S, 18*S, 34*S, 28*S], radius=3*S, fill=C)
    d.arc([22*S, 28*S, 34*S, 38*S], start=180, end=300, fill=C, width=int(2.4*S))
    finish(im, "menu-contact.png")


if __name__ == "__main__":
    avatar()
    stat_fav(); stat_basket(); stat_recipe(); stat_history()
    icon_account(); icon_standard(); icon_disclaimer(); icon_feedback()
    icon_faq(); icon_privacy(); icon_agreement(); icon_contact()
