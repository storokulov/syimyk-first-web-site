"""clean_can.py in.png out.png - paint over the garbled lettering on Max's can (flat green)."""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
x0, y0, x1, y1 = 1000, 840, 1320, 1240  # can region in the hero picture
c = im[y0:y1, x0:x1, :3].copy()
hsv = cv2.cvtColor(c, cv2.COLOR_BGR2HSV)
green = (hsv[..., 0] > 40) & (hsv[..., 0] < 85) & (hsv[..., 1] > 90) & (hsv[..., 2] > 60)
body = cv2.morphologyEx(green.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((31, 31), np.uint8))
body = cv2.erode(body, np.ones((9, 9), np.uint8)).astype(bool)  # stay off the outline
skin = (hsv[..., 0] < 25) & (hsv[..., 1] > 40) & (hsv[..., 2] > 150)
# keep the fingers and their outlines: everything within a few px of skin is left alone
near_skin = cv2.dilate(skin.astype(np.uint8), np.ones((19, 19), np.uint8)).astype(bool)
paint = body & ~near_skin
# stray white / yellow lettering bits left next to the fingers
top = np.argmax(body.any(1)) + 25
zone = cv2.dilate(body.astype(np.uint8), np.ones((25, 25), np.uint8)).astype(bool)
zone[:top] = False
light = (c.min(2) > 170) | ((hsv[..., 0] > 20) & (hsv[..., 0] < 40) & (hsv[..., 1] > 80))
paint |= zone & light & ~skin
fill = np.median(c[green], axis=0).astype(np.uint8)
c[paint] = fill
im[y0:y1, x0:x1, :3] = c
cv2.imwrite(dst, im)
print("painted", int(paint.sum()), "px with", fill.tolist())
