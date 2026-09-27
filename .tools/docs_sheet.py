from PIL import Image
import os
D = r"E:\code\Food\.tmp_preview"
raw = Image.open(os.path.join(D, "03-raw.png")).convert("RGB")
raw.crop((0, raw.height-1900, 800, raw.height-40)).save(os.path.join(D, "03-additive.png"))
order = ["01-home","02-pack-result","04-fresh-result","05-basket","06-recipe-list","07-recipe-detail","08-about","09-discover","03-additive"]
CROPS = {
 "01-home": (0,0,800,1540), "02-pack-result": (0,0,800,1590), "04-fresh-result": (0,0,800,1580),
 "05-basket": (0,0,800,1900), "06-recipe-list": (0,0,800,2100), "07-recipe-detail": (0,0,800,1600),
 "08-about": (0,0,800,1660), "09-discover": (0,0,800,1560), "03-additive": (0,0,800,1860),
}
cellW, cols = 400, 3
tiles = []
for n in order:
    im = Image.open(os.path.join(D, n+".png")).convert("RGB")
    c = CROPS.get(n)
    if c: im = im.crop(c)
    im.thumbnail((cellW-16, 10000), Image.LANCZOS)
    tiles.append(im)
rowH = max(t.height for t in tiles)
rows = (len(tiles)+cols-1)//cols
out = Image.new("RGB", (cols*cellW, rows*(rowH+14)), (233,238,231))
for i,t in enumerate(tiles):
    out.paste(t, ((i%cols)*cellW+8, (i//cols)*(rowH+14)+7))
out.save(r"E:\code\Food\docs\all-pages-preview.png")
print("总览:", out.size)
