# Beat sheet - Stay awake for $100,000

Voice: ElevenLabs "James - Natural, Conversational, Warm", eleven_v4 -> `public/stay-awake/vo/take1.mp3`
(64.4 s, peak -3.1 dBFS). Word times: `public/stay-awake/vo/words.json`. Beat constants and cuts:
`src/stay-awake/timing.ts` (voice placed at 0.1 s, comp 64.8 s @ 60 fps). The animation itself is the
Remotion project at the repo root (`src/stay-awake/`); this table was the plan it was built from.

Cast: MAX (energy-drink guy), LILY (confident), BOB (sleepy, chill), HOST (holds the cash case),
3 CAMERAS on tripods that come alive (eye on the lens).

| Time | Words | On screen | Pictures | Sound |
|---|---|---|---|---|
| 0.0 | Stay awake longer than everyone in this room | Frame 0 = thumbnail: three contestants on chairs, HOST centre with the open cash case, "$100,000" sign | room-wide, max-sit, lily-sit, bob-sit, host-case-open, sign | room tone |
| 4.15 | and you WIN $100,000 | HOST snaps the case shut, cash pops, slow push-in | host-case-shut | case clack, coin tinkle |
| 6.62 | But your BRAIN will lose before you do | Max's head lid pops, a little brain peeks out and yawns | brain-yawn (code face on brain sprite) | pop, yawn |
| 9.2 | THREE people | dolly to the three, each squash-bounces on "three" | - | three ticks |
| 10.42 / 11.3 | No PHONES, no NAPS | phones fly in an arc into a bin; a pillow is flung off screen | phone, bin, pillow | whoosh x2, thud |
| 12.54 | a CAMERA on every face | three tripod cameras swing in, each lens opens an eye (code) | camera-tripod | click, servo |
| 14.88 | DAY one is easy | "DAY 1" card slides; snack pile | card, chips | swish |
| 16.3 / 18.6 | Snacks, jokes, way too much COFFEE | coffee mugs multiply in pops, Bob's eye twitches | mug, bob-twitch | pops, sip |
| 19.86 | DAY two gets weird | "DAY 2" card, light flickers dimmer, sweat drop on Lily | max-stare, lily-tired, bob-tired | swish, buzz |
| 22.08 / 24.58 | MAX is staring right at the camera, EYES wide open | camera push-in on Max, eyes huge, zero blinks; DOF blur behind | max-stare-close | low hum |
| 27.06 | And he's ASLEEP | "Zzz" floats out of Max while eyes stay open; camera-eye gasps | - (Zzz in code) | soft snore |
| 28.86 / 30.62 | That's a MICROSLEEP. Your brain SHUTS off | cutaway: brain flips a wall switch OFF, room inside goes dark | brain-switch | switch click |
| 32.48 / 34.26 | sometimes with your EYES open, and you might not even NOTICE | switch back ON, Max jerks, gives a thumbs-up like nothing happened | max-thumbs | click, boing |
| 36.51 / 38.9 | The CAMERAS catch all three doing it. AGAIN and again | split screen of 3 camera feeds, Zzz on each in turn; cameras glance at each other | lily-zzz, bob-zzz | snore x3, rec beep |
| 40.88 - 47.58 | In 1964, a student named Randy Gardner stayed awake for 264 HOURS. ELEVEN days. | old-photo frame (sepia): generic student silhouette (not a likeness), calendar flips 11 pages, counter to 264 h | student-silhouette, calendar | page flips, counter ticks |
| 50.35 / 52.33 | It's so harmful that GUINNESS stopped tracking this record in 1996 | a plain record book (no logo) slams shut, "1996" stamp | book | slam, stamp |
| 54.51 | So WHO gets the $100,000? | back in the room; HOST reviews footage on a monitor, three exchange looks | host-monitor | tape rewind |
| 57.32 | NOBODY | big "$0" pops in the pause before the word | - | boom (in pause 56.66-57.32) |
| 60.62 / 62.01 | INCLUDING the guy holding the MONEY | camera pulls back: HOST standing, eyes open, snoring; case slips | host-asleep-open | snore, slide |
| 62.96 - 64.8 | Would you make it through day one? | case lands on the table exactly as in frame 0 -> loop | host-case-open | thud |

Notes
- Randy Gardner is a real person: show a generic silhouette, not a likeness. No Guinness logo.
- Runtime 64.4 s (over 60 s). Fine for Shorts (limit is 3 min); to get under 60 s, re-generate at
  speed ~1.08 or trim "Snacks, jokes,".
