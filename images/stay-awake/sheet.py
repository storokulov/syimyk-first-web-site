"""sheet.py out.png in1.png [in2.png ...] - cut-outs on blue / pink / dark, one row each."""
import sys
from PIL import Image
import numpy as np

out, srcs = sys.argv[1], sys.argv[2:]
H = 520
rows = []
for s in srcs:
    im = Image.open(s).convert("RGBA")
    a = np.array(im)[..., 3]
    print(s, "touches edge:", dict(top=bool(a[0].max() > 8), left=bool(a[:, 0].max() > 8),
          right=bool(a[:, -1].max() > 8), bottom=bool(a[-1].max() > 8)))
    W = int(im.width * H / im.height)
    row = Image.new("RGB", (W * 3, H))
    for i, c in enumerate([(155, 207, 253), (255, 80, 180), (40, 40, 40)]):
        bg = Image.new("RGBA", im.size, c + (255,))
        bg.alpha_composite(im)
        row.paste(bg.convert("RGB").resize((W, H)), (i * W, 0))
    rows.append(row)
sheet = Image.new("RGB", (max(r.width for r in rows), H * len(rows)), "white")
for i, r in enumerate(rows):
    sheet.paste(r, (0, i * H))
sheet.save(out)
