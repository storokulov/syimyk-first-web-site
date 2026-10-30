"""key_flat.py in.png out.png - key out a flat (or gently graded) solid background colour.

Background = pixels close to the border colour that touch the border, plus enclosed pockets of the
same colour (gaps between legs / arms). The black outline stops the fill, so a similar colour inside
the character (Bob's blue slippers) survives. The 2-3 px anti-aliased rim is un-blended toward ink.
"""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_COLOR).astype(np.float32)
h, w = im.shape[:2]
# local background estimate: blur a border-only colour field, tolerates soft gradients
border = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]])
bgc = np.median(border, 0)
dist = np.sqrt(((im - bgc) ** 2).sum(2))
near = (dist < 45).astype(np.uint8)

n, lab, stats, _ = cv2.connectedComponentsWithStats(near, connectivity=4)
edge_labels = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge_labels))
# enclosed pockets: big and very close to the background colour
for i in range(1, n):
    if i in edge_labels:
        continue
    m = lab == i
    if stats[i, cv2.CC_STAT_AREA] > 600 and np.median(dist[m]) < 18:
        bg |= m

fg = (~bg).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, connectivity=8)
fg = (lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8)

# soft rim: alpha from colour distance in a 3 px band, colour pushed to ink
rim = cv2.dilate(fg, np.ones((7, 7), np.uint8)).astype(bool) & ~cv2.erode(fg, np.ones((3, 3), np.uint8)).astype(bool)
ink_d = np.sqrt(((np.array([20, 20, 20], np.float32) - bgc) ** 2).sum())
alpha = fg.astype(np.float32)
alpha[rim] = np.clip(dist[rim] / ink_d * 1.3, 0, 1)
alpha[bg & ~rim] = 0
out_rgb = im.copy()
a = alpha[rim][:, None]
out_rgb[rim] = np.clip((im[rim] - (1 - a) * bgc) / np.maximum(a, 1e-3), 0, 255)
out = np.dstack([out_rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)])
cv2.imwrite(dst, out)
print(f"{src}: {w}x{h}, bg {bgc.round().tolist()}, opaque {(alpha > 0.5).mean() * 100:.1f}%")
