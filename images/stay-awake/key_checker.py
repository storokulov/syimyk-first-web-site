"""key_checker.py in.png out.png - remove a baked-in light checkerboard background.

Background = low-saturation light pixels connected to the image border; the thick black
outline stops the fill, so white areas inside the character (eyes, shoes) stay opaque.
"""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_COLOR).astype(np.int16)
h, w = im.shape[:2]
mx, mn = im.max(2), im.min(2)
light = (mn > 200) & (mx - mn < 22)  # checker squares are ~white and ~light grey

# flood fill from every light border pixel
seed = np.zeros((h, w), np.uint8)
seed[0, :] = seed[-1, :] = 1
seed[:, 0] = seed[:, -1] = 1
seed &= light.astype(np.uint8)
n, lab = cv2.connectedComponents(light.astype(np.uint8), connectivity=4)
bg_labels = np.unique(lab[seed.astype(bool)])
bg = np.isin(lab, bg_labels[bg_labels > 0])

# close pinholes in the background and soften the 1-2 px edge against the ink
bg = cv2.morphologyEx(bg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
fg = (~bg).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))  # drop stray specks
# keep only the largest component (the character)
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, connectivity=8)
keep = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
fg = (lab == keep).astype(np.uint8)
alpha = cv2.GaussianBlur(fg.astype(np.float32), (3, 3), 0.8)

out = np.dstack([im.astype(np.uint8), (alpha * 255).astype(np.uint8)])
cv2.imwrite(dst, out)
print(f"{src}: {w}x{h}, kept {fg.mean() * 100:.1f}% opaque")
