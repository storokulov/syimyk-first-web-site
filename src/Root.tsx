import {Composition} from 'remotion';
import {StayAwake} from './stay-awake/StayAwake';
import {DURATION, FPS} from './stay-awake/timing';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StayAwake"
    component={StayAwake}
    durationInFrames={Math.round(DURATION * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
