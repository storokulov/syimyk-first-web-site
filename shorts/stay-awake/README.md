# Stay awake for $100,000 - production notes

Vertical 2D cut-out cartoon Short (1080x1920, 60 fps, 64.8 s) built with Remotion.

| What | Where |
|---|---|
| Script, sources | `script.md`, `voiceover.txt` |
| Beat plan | `beatsheet.md` |
| Voice + word times | `public/stay-awake/vo/` |
| Character cut-outs | `public/stay-awake/sprites/` (made in Higgsfield, keyed in `images/stay-awake/`) |
| Sound effects (synthesized) | `public/stay-awake/sfx/`, generator `images/stay-awake/sfx.py` |
| Animation code | `src/stay-awake/` (`timing.ts` = every beat on its word) |

Everything except the four characters and the voice is drawn in code: the studio, podiums, cameras with
eyes, the brain, pupils/lids/veins/eye bags, Zzz, snot bubbles, the 1964 and record-book shots.

Current cut: `renders/stay-awake-v1.mp4` - 1080x1920, 60 fps, 64.8 s, H.264 + AAC, mastered to -14 LUFS.

## Render

```bash
npm install
npx remotion studio src/index.ts                                      # preview in the browser
npx remotion render src/index.ts StayAwake out/stay-awake.mp4 --crf=18 # final 1080x1920 MP4
scripts/master.sh out/stay-awake.mp4 out/stay-awake-master.mp4          # loudness to -14 LUFS, video copied
scripts/verify.sh out/stay-awake-master.mp4                           # size, fps, frames, audio, end motion
```

`remotion.config.ts` points at the headless Chrome that exists in the cloud container; delete that line
on another machine and Remotion downloads its own.

## Checks

- `node scripts/stills.mjs out/stills 0 4.4 ...` + `python3 scripts/sheet.py out/stills out/sheet.png` -
  contact sheet of any moments.
- `python3 scripts/popscan.py out/preview.mp4` - flags frame jumps; every flag should be an intended cut.
