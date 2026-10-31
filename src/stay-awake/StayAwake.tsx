// "Stay awake for $100,000" - picks the shot for the current time and lays the sound under it.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {BookScene} from './BookScene';
import {BrainScene} from './BrainScene';
import {FeedsScene} from './FeedsScene';
import {HistoryScene} from './HistoryScene';
import {RoomScene} from './RoomScene';
import {Sound} from './Sound';
import {CUT, FPS} from './timing';

const fontReady = delayRender('Luckiest Guy font');
const font = new FontFace('Luckiest Guy', `url(${staticFile('stay-awake/fonts/LuckiestGuy.woff2')}) format('woff2')`);
font
  .load()
  .then(() => {
    document.fonts.add(font);
    continueRender(fontReady);
  })
  .catch((err) => {
    console.error(err);
    continueRender(fontReady);
  });

const Shot: React.FC<{t: number}> = ({t}) => {
  if (t < CUT.brain) return <RoomScene t={t} />;
  if (t < CUT.back) return <BrainScene t={t} />;
  if (t < CUT.feeds) return <RoomScene t={t} />;
  if (t < CUT.history) return <FeedsScene t={t} />;
  if (t < CUT.book) return <HistoryScene t={t} />;
  if (t < CUT.room) return <BookScene t={t} />;
  return <RoomScene t={t} />;
};

export const StayAwake: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{backgroundColor: '#000000'}}>
      <Shot t={t} />
      <Sound />
    </AbsoluteFill>
  );
};
