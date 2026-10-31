#!/usr/bin/env bash
# scripts/master.sh in.mp4 out.mp4 - two-pass loudnorm to -14 LUFS / -1.5 dBTP (YouTube level),
# video stream copied untouched.
set -euo pipefail
in="$1"; out="$2"
stats=$(ffmpeg -hide_banner -i "$in" -map 0:a -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import sys, json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$in" -map 0:v -map 0:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$out"
ffmpeg -hide_banner -i "$out" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+I:|Peak:" | tail -2
