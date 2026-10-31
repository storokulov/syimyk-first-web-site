// Voice + one cue list of sound effects (file, start time, level in dB). Effects sit well under the
// voice; the one big hit (boom) lands in the pause before "Nobody".
import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {FLIPS} from './HistoryScene';
import {FPS, VO_START} from './timing';

type Cue = [file: string, at: number, db: number];

const CUES: Cue[] = [
  ['cash', 4.15, -19],
  ['sparkle', 4.6, -23],
  ['whoosh', 5.6, -28],
  ['pop', 6.62, -22],
  ['whoop', 7.1, -24],
  ['swish', 8.22, -31],
  ['whoosh', 8.35, -29],
  ['tick', 9.2, -21],
  ['tick', 9.32, -21],
  ['tick', 9.44, -21],
  ['pop', 10.22, -25],
  ['swish', 10.62, -30],
  ['swish', 10.71, -30],
  ['swish', 10.8, -30],
  ['thud', 11.24, -21],
  ['thud', 11.33, -22],
  ['thud', 11.42, -21],
  ['pop', 11.44, -23],
  ['whoosh', 11.78, -25],
  ['swish', 11.85, -30],
  ['boing', 12.54, -26],
  ['boing', 12.64, -27],
  ['boing', 12.74, -27],
  ['click', 12.98, -21],
  ['click', 13.12, -21],
  ['click', 13.26, -21],
  ['swish', 14.8, -24],
  ['swish', 16.0, -28],
  ['pop', 16.3, -24],
  ['pop', 16.42, -24],
  ['pop', 16.76, -25],
  ['pop', 16.95, -25],
  ['pop', 17.12, -25],
  ['pop', 18.0, -26],
  ['pop', 18.12, -26],
  ['pop', 18.24, -26],
  ['pop', 18.36, -26],
  ['pop', 18.48, -26],
  ['boing', 18.6, -28],
  ['swish', 19.8, -24],
  ['buzz', 19.86, -27],
  ['pop', 19.95, -30],
  ['pop', 20.05, -30],
  ['pop', 20.26, -29],
  ['pop', 20.4, -29],
  ['pop', 20.55, -29],
  ['swish', 21.0, -29],
  ['bubble', 21.05, -27],
  ['whoosh', 21.35, -28],
  ['boing', 24.58, -26],
  ['snore', 27.1, -20],
  ['swish', 28.28, -25],
  ['sparkle', 28.86, -24],
  ['switch', 30.62, -17],
  ['beep', 32.48, -25],
  ['switch', 34.26, -17],
  ['bubble', 34.75, -15],
  ['boing', 34.76, -27],
  ['pop', 35.25, -26],
  ['swish', 36.22, -24],
  ['beep', 37.25, -22],
  ['beep', 37.74, -22],
  ['beep', 38.23, -22],
  ['bubble', 38.9, -22],
  ['bubble', 39.73, -22],
  ['swish', 40.82, -25],
  ['pop', 41.07, -22],
  ['thud', 42.68, -24],
  ...FLIPS.map((f): Cue => ['page', f, -23]),
  ['sparkle', 46.87, -24],
  ['boing', 47.58, -24],
  ['swish', 49.22, -25],
  ['pop', 49.76, -22],
  ['slam', 50.95, -13],
  ['stamp', 52.33, -13],
  ['swish', 54.18, -25],
  ['pop', 54.55, -26],
  ['pop', 54.7, -26],
  ['pop', 54.85, -26],
  ['boom', 56.92, -13],
  ['flip', 57.2, -20],
  ['whoosh', 58.35, -30],
  ['snore', 60.8, -20],
  ['snore', 61.95, -22],
  ['page', 61.1, -30],
  ['page', 61.45, -30],
  ['page', 61.8, -30],
  ['page', 62.15, -30],
  ['page', 62.5, -30],
  ['bubble', 62.96, -15],
  ['rewind', 63.1, -22],
  ['pop', 63.3, -29],
  ['pop', 63.38, -29],
  ['pop', 63.46, -29],
  ['swish', 63.4, -30],
  ['flip', 63.5, -21],
  ['cash', 63.62, -22],
];

export const Sound: React.FC = () => (
  <>
    <Sequence from={Math.round(VO_START * FPS)} layout="none" name="voice">
      <Html5Audio src={staticFile('stay-awake/vo/take1.mp3')} />
    </Sequence>
    {CUES.map(([f, at, db], i) => (
      <Sequence key={i} from={Math.round(at * FPS)} layout="none" name={`sfx ${f}`}>
        <Html5Audio src={staticFile(`stay-awake/sfx/${f}.wav`)} volume={10 ** (db / 20)} />
      </Sequence>
    ))}
  </>
);
