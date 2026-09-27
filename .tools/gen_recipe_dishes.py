# -*- coding: utf-8 -*-
"""为食谱推荐页生成菜品图（复用已有素材换色，保证风格统一）。"""
from PIL import Image, ImageEnhance, ImageDraw
import os

IMG = r"E:\code\Food\miniprogram\images"

def tint(src_name, out_name, warm=1.0, pink=0.0):
    """warm: 暖色增益；pink: 向粉色偏移强度 0~1"""
    src = Image.open(os.path.join(IMG, src_name)).convert("RGB")
    if warm != 1.0:
        src = ImageEnhance.Color(src).enhance(warm)
    if pink > 0:
        px = src.load()
        w, h = src.size
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]
                px[x, y] = (min(255, int(r + (255 - r) * pink * 0.35)),
                            int(g * (1 - pink * 0.25)),
                            min(255, int(b + (255 - b) * pink * 0.15)))
    src = src.resize((360, 360), Image.LANCZOS)
    src.save(os.path.join(IMG, out_name), "JPEG", quality=92, optimize=True)
    print("%-30s 360x360 %6.1f KB" % (out_name, os.path.getsize(os.path.join(IMG, out_name)) / 1024))

if __name__ == "__main__":
    # 番茄炒蛋（已有专用大图，转成方图版本）
    tint("dish-tomato-egg-large.jpg", "recipe-tomato-egg.jpg", warm=1.06)
    # 土豆鸡蛋饼：在番茄炒蛋基础上偏金黄
    tint("dish-tomato-egg.jpg", "recipe-potato-egg.jpg", warm=0.72)
    # 草莓牛奶昔：偏粉
    tint("dish-lettuce-egg.jpg", "recipe-strawberry-milk.jpg", warm=0.55, pink=0.85)
