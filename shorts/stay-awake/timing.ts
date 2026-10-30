// Beat times in seconds on the composition timeline. The voice starts at VO_START;
// every beat = word onset in vo/take1.mp3 (pause-aligned, +-0.15 s) + VO_START.
export const FPS = 60;
export const VO_START = 0.1;
export const DURATION = 64.8; // voice ends at 64.28 s, + 0.5 s tail

export const T = {
  win: 4.15, // "...and you WIN"
  money: 4.6, // "$100,000"
  brain: 6.62, // "but your BRAIN will lose"
  three: 9.2, // "THREE people"
  phones: 10.42, // "no PHONES"
  naps: 11.3, // "no NAPS"
  camera: 12.54, // "a CAMERA on every face"
  day1: 14.88, // "DAY one is easy"
  snacks: 16.3, // "SNACKS, jokes"
  coffee: 18.6, // "way too much COFFEE"
  day2: 19.86, // "DAY two gets weird"
  max: 22.08, // "MAX is staring"
  eyesOpen: 24.58, // "EYES wide open"
  asleep: 27.06, // "and he's ASLEEP"
  microsleep: 28.86, // "that's a MICROSLEEP"
  shuts: 30.62, // "your brain SHUTS off"
  eyes2: 32.48, // "sometimes with your EYES open"
  notice: 34.26, // "and you might not even NOTICE"
  cameras: 36.51, // "the CAMERAS catch all three"
  again: 38.9, // "AGAIN and again"
  y1964: 40.88, // "in 1964"
  hours: 46.87, // "264 HOURS"
  eleven: 47.58, // "ELEVEN days"
  guinness: 50.35, // "GUINNESS stopped tracking"
  y1996: 52.33, // "in 1996"
  who: 54.51, // "so WHO gets the $100,000"
  nobody: 57.32, // "NOBODY" (pause before it: 56.66-57.32)
  wholeTime: 58.32, // "no one stayed awake the whole time"
  including: 60.62, // "INCLUDING the guy"
  moneyEnd: 62.01, // "holding the MONEY" - payoff
  would: 62.96, // "WOULD you make it through day one?"
} as const;
