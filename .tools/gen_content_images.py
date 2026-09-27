# -*- coding: utf-8 -*-
"""生成内容占位插画（产品图 / 食材图 / 菜品图）。

说明：设计稿分辨率不足以裁切干净的内容图，这里用同色系扁平插画占位，
      所有图形均由脚本生成，后续接入真实素材时直接覆盖同名文件即可，
      页面代码无需改动。
"""
from PIL import Image, ImageDraw
import os

OUT = r"E:\code\Food\miniprogram\images"
os.makedirs(OUT, exist_ok=True)
S = 3

CREAM = (252, 244, 232)
CREAM2 = (247, 236, 219)
GREEN = (76, 175, 80)
GREEN_D = (46, 140, 62)
RED = (231, 76, 60)
RED_D = (198, 40, 40)
YELLOW = (248, 203, 71)
YELLOW_D = (232, 168, 30)
BROWN = (150, 100, 60)
WHITE = (255, 255, 255)


def c(size):
    im = Image.new("RGBA", (size * S, size * S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def finish(im, name, quality=92):
    im = im.resize((im.width // S, im.height // S), Image.LANCZOS)
    if name.endswith(".jpg"):
        if im.mode == "RGBA":
            bg = Image.new("RGB", im.size, CREAM)
            bg.paste(im, (0, 0), im)
            im = bg
        else:
            im = im.convert("RGB")
        im.save(os.path.join(OUT, name), "JPEG", quality=quality, optimize=True)
    else:
        im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print("%-26s %s" % (name, im.size))


# ---------- 包装食品：薯片袋 ----------
def chips():
    size = 200
    im, d = c(size)
    d.rounded_rectangle([34*S, 24*S, 166*S, 176*S], radius=14*S, fill=YELLOW, outline=YELLOW_D, width=3*S)
    d.rectangle([34*S, 30*S, 166*S, 44*S], fill=YELLOW_D)
    d.rounded_rectangle([52*S, 62*S, 148*S, 104*S], radius=10*S, fill=RED)
    d.ellipse([62*S, 74*S, 138*S, 96*S], fill=RED_D)
    d.ellipse([70*S, 118*S, 130*S, 156*S], fill=(240, 200, 120))
    d.ellipse([82*S, 128*S, 118*S, 150*S], fill=RED)
    d.line([(60*S, 162*S), (140*S, 162*S)], fill=YELLOW_D, width=4*S)
    finish(im, "product-chips.png")


# ---------- 生鲜：番茄 ----------
def tomato():
    size = 200
    im, d = c(size)
    d.ellipse([30*S, 44*S, 170*S, 178*S], fill=RED)
    d.ellipse([44*S, 56*S, 108*S, 108*S], fill=(244, 120, 100))
    for i in range(5):
        import math
        a = -math.pi/2 + i * 2*math.pi/5
        d.polygon([(100*S, 56*S),
                   ((100 + 44*math.cos(a - 0.35))*S, (56 + 44*math.sin(a - 0.35))*S),
                   ((100 + 44*math.cos(a + 0.35))*S, (56 + 44*math.sin(a + 0.35))*S)], fill=GREEN)
    d.ellipse([94*S, 30*S, 106*S, 48*S], fill=GREEN_D)
    finish(im, "ingredient-tomato.png")


# ---------- 菜品插画 ----------
def plate_bg(d, size=240):
    d.ellipse([10*S, 30*S, 230*S, 210*S], fill=WHITE)
    d.ellipse([18*S, 38*S, 222*S, 202*S], outline=(236, 228, 214), width=3*S)


def dish_tomato_egg():
    size = 240
    im, d = c(size)
    plate_bg(d)
    for pos, col in [((74, 96, 128, 150), YELLOW), ((112, 84, 170, 138), YELLOW),
                     ((78, 120, 130, 172), (250, 214, 96)), ((128, 116, 186, 170), YELLOW)]:
        d.rounded_rectangle([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], radius=14*S, fill=col)
    for pos in [(70, 100, 116, 146), (120, 92, 176, 148), (96, 132, 152, 182)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=RED)
    d.line([(150*S, 150*S), (172*S, 128*S)], fill=GREEN_D, width=5*S)
    finish(im, "dish-tomato-egg.jpg")


def dish_lettuce_egg():
    size = 240
    im, d = c(size)
    plate_bg(d)
    d.ellipse([46*S, 86*S, 194*S, 176*S], fill=(246, 224, 176))
    for pos in [(64, 96, 120, 132), (108, 104, 164, 140), (84, 126, 156, 162)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=YELLOW)
    for pos in [(72, 108, 104, 140), (124, 96, 158, 128), (132, 138, 166, 168), (60, 136, 94, 166)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=(120, 196, 96))
    finish(im, "dish-lettuce-egg.jpg")


def dish_beef_noodle():
    size = 240
    im, d = c(size)
    plate_bg(d)
    d.ellipse([40*S, 80*S, 200*S, 182*S], fill=(238, 178, 110))
    for i, y in enumerate((104, 124, 144)):
        d.arc([52*S, (y - 16)*S, 188*S, (y + 26)*S], start=0, end=180, fill=(250, 226, 178), width=7*S)
    for pos in [(70, 92, 112, 126), (120, 96, 164, 130), (96, 130, 140, 162)]:
        d.rounded_rectangle([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], radius=8*S, fill=BROWN)
    d.ellipse([140*S, 132*S, 164*S, 156*S], fill=RED)
    finish(im, "dish-beef-noodle.jpg")


def dish_stir_lettuce():
    size = 240
    im, d = c(size)
    plate_bg(d)
    for pos in [(56, 92, 112, 148), (104, 84, 156, 136), (128, 116, 184, 172),
                (66, 128, 120, 180), (100, 122, 152, 174)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=(96, 186, 92))
    for pos in [(72, 106, 96, 130), (120, 100, 144, 124), (104, 142, 128, 166)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=(66, 160, 74))
    d.ellipse([120*S, 96*S, 140*S, 116*S], fill=RED)
    finish(im, "dish-stir-lettuce.jpg")


# ---------- 食谱详情大图（横版） ----------
def dish_detail():
    w, h = 320, 200
    im = Image.new("RGB", (w * S, h * S), CREAM)
    d = ImageDraw.Draw(im)
    d.ellipse([14*S, 20*S, 306*S, 196*S], fill=WHITE)
    d.ellipse([26*S, 30*S, 294*S, 186*S], outline=(236, 228, 214), width=4*S)
    for pos in [(70, 70, 130, 130), (120, 56, 186, 120), (150, 100, 220, 168), (92, 110, 156, 172)]:
        d.rounded_rectangle([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], radius=16*S, fill=YELLOW)
    for pos in [(74, 74, 126, 126), (134, 62, 190, 118), (104, 118, 158, 172), (168, 108, 224, 166)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=RED)
    for pos in [(96, 88, 116, 108), (146, 84, 166, 104), (188, 128, 208, 148), (120, 140, 140, 160)]:
        d.ellipse([pos[0]*S, pos[1]*S, pos[2]*S, pos[3]*S], fill=GREEN_D)
    finish(im, "dish-tomato-egg-large.jpg")


if __name__ == "__main__":
    chips()
    tomato()
    dish_tomato_egg()
    dish_lettuce_egg()
    dish_beef_noodle()
    dish_stir_lettuce()
    dish_detail()
