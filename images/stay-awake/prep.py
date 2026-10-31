"""prep.py - measure the cast sprites for the animation code.

For every public/stay-awake/sprites/<name>-hero.png:
  head  = largest inscribed disc of the hole-filled silhouette (big-head cartoon -> the head)
  feet  = middle of the opaque pixels in the bottom 3.5 % of rows
  eyes  = the two biggest near-white blobs in the upper head; interior = convex hull (pupil included),
          eroded 2 px so a redraw never covers the black outline, stored as a polygon that the eye
          redraws are clipped to; pupil = blob holding the largest dark disc in that hull (box centre, disc radius, half-box)
Writes src/stay-awake/sprites.json and qa/measure-<name>.png overlays to check the numbers by eye.
"""
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SPR = os.path.join(ROOT, "public", "stay-awake", "sprites")
QA = os.path.join(os.path.dirname(__file__), "qa")
NAMES = sys.argv[1:] or ["max", "lily", "bob", "host"]


def measure(name):
    im = cv2.imread(os.path.join(SPR, f"{name}-hero.png"), cv2.IMREAD_UNCHANGED)
    h, w = im.shape[:2]
    rgb = im[..., :3].astype(np.int16)
    alpha = im[..., 3]
    a8 = (alpha > 128).astype(np.uint8)

    ff = np.pad(a8, 1).copy()
    cv2.floodFill(ff, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 2)
    solid = np.where(ff[1:-1, 1:-1] == 2, 0, 1).astype(np.uint8)
    dt = cv2.distanceTransform(solid, cv2.DIST_L2, 5)
    hy, hx = np.unravel_index(dt.argmax(), dt.shape)
    hr = float(dt[hy, hx])

    rows = np.where(a8.any(1))[0]
    y_bot = rows.max()
    band = a8[int(y_bot - 0.035 * (rows.max() - rows.min())):y_bot + 1]
    xs = np.where(band.any(0))[0]
    feet = (float((xs.min() + xs.max()) / 2), float(y_bot))

    mx, mn = rgb.max(2), rgb.min(2)
    white = (mn > 200) & (mx - mn < 40) & (alpha > 200)
    yy, xx = np.mgrid[0:h, 0:w]
    in_head = (xx - hx) ** 2 + (yy - hy) ** 2 < (1.08 * hr) ** 2
    n, lab, stats, cent = cv2.connectedComponentsWithStats((white & in_head).astype(np.uint8), connectivity=4)
    # eyes sit in the upper head; teeth (host) sit lower, so filter on the blob centre
    cands = [i for i in range(1, n)
             if stats[i, cv2.CC_STAT_AREA] > 0.004 * np.pi * hr * hr and cent[i][1] < hy + 0.35 * hr]
    cands = sorted(cands, key=lambda i: -stats[i, cv2.CC_STAT_AREA])[:2]
    cands = sorted(cands, key=lambda i: cent[i][0])

    dark = (mx < 80) & (alpha > 200)
    mask = np.zeros((h, w), np.uint8)
    eyes = []
    for i in cands:
        comp = (lab == i).astype(np.uint8)
        pts = cv2.findNonZero(comp)
        hull = cv2.convexHull(pts)
        m = np.zeros((h, w), np.uint8)
        cv2.fillConvexPoly(m, hull, 1)
        m = cv2.erode(m, np.ones((5, 5), np.uint8))
        pup = dark & m.astype(bool)
        x, y, bw, bh = cv2.boundingRect(hull)
        e = {
            "box": [int(x), int(y), int(bw), int(bh)],
            "white": [int(v) for v in np.median(rgb[comp.astype(bool)], 0)[::-1]],
        }
        cnt, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        poly = cv2.approxPolyDP(max(cnt, key=cv2.contourArea), 1.0, True)[:, 0]
        e["poly"] = [[int(a), int(b)] for a, b in poly]
        if pup.sum() > 20:
            # largest inscribed dark disc = the pupil (brow ink leaking in at the rim is thin)
            pdt = cv2.distanceTransform(pup.astype(np.uint8), cv2.DIST_L2, 5)
            py, px = np.unravel_index(pdt.argmax(), pdt.shape)
            pr = float(pdt[py, px])
            _, plab = cv2.connectedComponents(pup.astype(np.uint8))
            cy, cx = np.where(plab == plab[py, px])
            rx = min((cx.max() - cx.min() + 1) / 2, 1.5 * pr)
            ry = min((cy.max() - cy.min() + 1) / 2, 1.5 * pr)
            bx = (cx.max() + cx.min()) / 2 if rx < 1.5 * pr else px
            by = (cy.max() + cy.min()) / 2 if ry < 1.5 * pr else py
            e["pupil"] = [float(bx), float(by), pr, float(rx), float(ry)]
        # cheek colour just below the eye, for eyelids
        cy0, cy1 = y + bh + int(0.15 * bh), y + bh + int(0.45 * bh)
        cheek = rgb[cy0:cy1, x + bw // 4:x + 3 * bw // 4].reshape(-1, 3)
        cheek = cheek[(cheek.max(1) > 120)]
        if len(cheek):
            e["skin"] = [int(v) for v in np.median(cheek, 0)[::-1]]
        eyes.append(e)
        mask |= m

    vis = rgb.astype(np.uint8).copy()
    vis[alpha < 128] = (90, 60, 40)
    cv2.circle(vis, (int(hx), int(hy)), int(hr), (0, 255, 0), 4)
    cv2.circle(vis, (int(feet[0]), int(feet[1])), 14, (0, 0, 255), -1)
    vis[mask.astype(bool)] = (vis[mask.astype(bool)] * 0.4 + np.array([255, 0, 255]) * 0.6).astype(np.uint8)
    for e in eyes:
        if "pupil" in e:
            px, py, pr = e["pupil"][:3]
            cv2.circle(vis, (int(px), int(py)), max(3, int(pr)), (0, 255, 255), 3)
    cv2.imwrite(os.path.join(QA, f"measure-{name}.png"), cv2.resize(vis, (w // 3, h // 3)))
    return {"w": w, "h": h, "head": [float(hx), float(hy), hr], "feet": list(feet), "eyes": eyes}


if __name__ == "__main__":
    os.makedirs(QA, exist_ok=True)
    path = os.path.join(ROOT, "src", "stay-awake", "sprites.json")
    data = json.load(open(path)) if os.path.exists(path) else {}
    for n in NAMES:
        data[n] = measure(n)
        print(n, json.dumps(data[n]))
    json.dump(data, open(path, "w"), indent=1)
