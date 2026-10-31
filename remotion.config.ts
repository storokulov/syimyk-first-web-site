import {Config} from '@remotion/cli/config';

// Pre-installed headless shell in this container; drop the line elsewhere and Remotion downloads its own.
Config.setBrowserExecutable(
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
