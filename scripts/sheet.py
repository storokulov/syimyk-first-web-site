"""python3 scripts/sheet.py out/stills out/sheet.png [cols] - grid of stills labelled with their time."""
import glob
import os
import sys

from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
files = sorted(glob.glob(os.path.join(src, "t-*.png")), key=lambda f: float(os.path.basename(f)[2:-4]))
ims = [Image.open(f).convert("RGB") for f in files]
w = 270
h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 22)
    sheet.paste(im.resize((w, h)), (x, y + 22))
    d.text((x + 4, y + 4), os.path.basename(f)[2:-4] + " s", fill="black")
sheet.save(out)
print(out, sheet.size)
