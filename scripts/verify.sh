#!/usr/bin/env bash
# scripts/verify.sh out/stay-awake.mp4 - size, fps, frame count, audio length/levels, motion at the end
set -euo pipefail
f="$1"
ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames,codec_name,pix_fmt -of default=nw=1 "$f"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels:stream=duration -of default=nw=1 "$f"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$f"
echo "--- audio levels"
ffmpeg -v info -i "$f" -map 0:a -af "volumedetect,ebur128=peak=true" -f null - 2>&1 | grep -E "max_volume|mean_volume|I:|True peak|Peak:" | tail -6
echo "--- motion in the last second (mean abs diff between frames, 270x480 grey)"
ffmpeg -v error -sseof -1 -i "$f" -vf "scale=270:480,format=gray" -f rawvideo - | python3 -c "
import sys, numpy as np
a = np.frombuffer(sys.stdin.buffer.read(), np.uint8).reshape(-1, 480, 270).astype(float)
d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
print(f'{len(a)} frames, diffs: min {d.min():.3f} mean {d.mean():.3f} max {d.max():.3f}')
"
