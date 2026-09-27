# -*- coding: utf-8 -*-
"""从设计稿裁切出首页插画素材，落盘到小程序 images 目录。"""
from PIL import Image
import os

SRC = r"C:\Users\YH\.dsh\attachments\v1\objects\8e\8e496fcd6781b68111a6d21cab76add1fc8535bc63ce91d06d4d56d2aef813ff"
IMG = r"E:\code\Food\miniprogram\images"
im = Image.open(SRC).convert("RGB")
print("source:", im.size)

# (名称, 左, 上, 右, 下) —— 坐标由像素扫描确定
CROPS = [
    ("hero-veg",   432, 290,  889, 672),   # 首页头图右侧果蔬插画（避开左侧标题文字）
    ("card-pack",  565, 690,  870, 903),   # 拍包装食品卡片：包装袋插画
    ("card-fresh", 520, 926,  712, 1140),  # 拍生鲜果蔬卡片：苹果蔬菜插画
]

for name, l, t, r, b in CROPS:
    c = im.crop((l, t, r, b))
    out = os.path.join(IMG, "%s.jpg" % name)
    c.save(out, "JPEG", quality=92, optimize=True, progressive=True)
    print("%-12s %4dx%-4d %8.1f KB" % (name, c.width, c.height, os.path.getsize(out) / 1024))

# 拼一张检查图
sheet = Image.new("RGB", (900, 700), (250, 250, 250))
y = 10
for name, l, t, r, b in CROPS:
    c = Image.open(os.path.join(IMG, "%s.jpg" % name))
    if c.width > 880:
        c = c.resize((880, int(c.height * 880 / c.width)), Image.LANCZOS)
    sheet.paste(c, (10, y)); y += c.height + 10
sheet.save(r"E:\code\Food\.tmp_tools\out\sheet_crops.png")
print("sheet:", sheet.size)
