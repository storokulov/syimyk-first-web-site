"""python3 scripts/popscan.py out/preview.mp4 [fps] - flag frames that jump much more than their neighbours.

Decodes at 270x480 grey, blurs, takes the mean absolute frame-to-frame difference and flags frames above
2.2x the local median (+-0.5 s) and above a small floor. Every flag must be an intended cut or swap.
"""
import subprocess
import sys

import numpy as np

src = sys.argv[1]
fps = float(sys.argv[2]) if len(sys.argv) > 2 else 60.0
W, H = 270, 480
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={W}:{H},gblur=sigma=1.5,format=gray", "-f", "rawvideo", "-"],
    capture_output=True,
    check=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))
win = int(fps * 0.5)
flags = []
for i, v in enumerate(d):
    lo, hi = max(0, i - win), min(len(d), i + win + 1)
    med = np.median(d[lo:hi])
    if v > 2.2 * max(med, 0.15) and v > 1.0:
        flags.append((i + 1, (i + 1) / fps, v, med))
print(f"{len(frames)} frames, mean diff {d.mean():.2f}, max {d.max():.2f}")
for f, t, v, med in flags:
    print(f"frame {f:5d}  t={t:6.2f}s  diff {v:6.2f}  local median {med:5.2f}")
