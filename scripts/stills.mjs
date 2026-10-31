// node scripts/stills.mjs out/stills 0.5 1.0 4.2 ...  -> out/stills/t-<time>.png (scale 0.5)
// Bundles once to build/ and reuses one browser for every still.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...times] = process.argv.slice(2);
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const scale = Number(process.env.SCALE ?? 0.5);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('build'), publicDir: path.resolve('public')});
const browser = await openBrowser('chrome', {browserExecutable: BROWSER});
const composition = await selectComposition({serveUrl, id: 'StayAwake', puppeteerInstance: browser, browserExecutable: BROWSER});
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(t) * composition.fps));
  await renderStill({
    composition,
    serveUrl,
    frame,
    output: path.join(outDir, `t-${Number(t).toFixed(2)}.png`),
    scale,
    puppeteerInstance: browser,
    browserExecutable: BROWSER,
  });
  process.stdout.write(`${t} `);
}
await browser.close({silent: true});
console.log('done');
