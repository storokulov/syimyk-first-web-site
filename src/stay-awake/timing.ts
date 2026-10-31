// Beat times in seconds on the composition timeline. The voice starts at VO_START;
// every beat = word onset in public/stay-awake/vo/take1.mp3 (pause-aligned, +-0.15 s) + VO_START.
export const FPS = 60;
export const VO_START = 0.1;
export const DURATION = 64.8; // voice ends at 64.28 s, + 0.5 s tail

export const T = {
  win: 4.15, // "...and you WIN"
  money: 4.6, // "$100,000"
  brain: 6.62, // "but your BRAIN will lose"
  three: 9.2, // "THREE people"
  no1: 10.42, // "NO phones"
  phones: 10.76, // "no PHONES"
  no2: 11.44, // "NO naps"
  naps: 11.78, // "no NAPS"
  camera: 12.54, // "a CAMERA on every face"
  face: 13.8, // "every FACE"
  day1: 14.88, // "DAY one is easy"
  snacks: 16.3, // "SNACKS, jokes"
  jokes: 16.76, // "snacks, JOKES"
  coffee: 18.6, // "way too much COFFEE"
  day2: 19.86, // "DAY two gets weird"
  weird: 21.05, // "gets WEIRD"
  max: 22.08, // "MAX is staring"
  eyesOpen: 24.58, // "EYES wide open"
  asleep: 27.06, // "and he's ASLEEP"
  thats: 28.32, // "THAT'S a microsleep"
  microsleep: 28.86, // "that's a MICROSLEEP"
  shuts: 30.62, // "your brain SHUTS off"
  eyes2: 32.48, // "SOMETIMES with your eyes open"
  notice: 34.26, // "AND you might not even notice"
  the: 36.26, // "THE cameras catch all three"
  catch: 37.25, // "the cameras CATCH"
  three2: 37.74, // "all THREE"
  it: 38.23, // "doing IT"
  again: 38.9, // "AGAIN and again"
  again2: 39.73, // "again and AGAIN"
  in1964: 40.88, // "IN 1964"
  y1964: 41.07, // "in 1964"
  student: 42.59, // "a STUDENT named Randy Gardner"
  stayed: 44.39, // "STAYED awake"
  n264: 45.52, // "for 264 hours"
  hours: 46.87, // "264 HOURS"
  eleven: 47.58, // "ELEVEN days"
  its: 49.36, // "IT'S so harmful"
  harmful: 49.76, // "so HARMFUL"
  stopped: 50.75, // "STOPPED tracking"
  y1996: 52.33, // "in 1996"
  so: 54.3, // "SO who gets the $100,000"
  who: 54.51, // "so WHO gets"
  nobody: 57.32, // "NOBODY" (pause before it: 56.66-57.32)
  noOne: 58.32, // "NO ONE stayed awake the whole time"
  including: 60.62, // "INCLUDING the guy"
  moneyEnd: 62.01, // "holding the MONEY" - payoff
  would: 62.96, // "WOULD you make it through day one?"
} as const;

// Hard cuts between shots
export const CUT = {
  brain: 28.3, // into the brain
  back: 34.7, // back to Max
  feeds: 36.22, // the three camera feeds
  history: 40.82, // 1964
  book: 49.22, // the record book
  room: 54.18, // back in the studio
} as const;
