// Spot the Difference — every tuning number in one place.
// Each scene panel is a fixed 600x400 logical area; the page scales the
// canvas to the window, so no rule below depends on the screen size.

export const PANEL = { width: 600, height: 400, gap: 40 };
export const CANVAS = { width: PANEL.width * 2 + PANEL.gap, height: PANEL.height };

/** Seconds on the clock for each level. */
export const LEVEL_SECONDS = 120;
/** Hints the player gets for the whole game. */
export const HINTS_TOTAL = 3;
/** How long a hint ring pulses around a difference, in seconds. */
export const HINT_SECONDS = 3;

/** Points for finding a difference, plus a streak bonus per consecutive find. */
export const SCORE = { find: 100, streakBonus: 10, wrongClick: -25, timeBonusPerSecond: 5 };

/** The radius, in scene pixels, inside which a click counts as a find. */
export const CLICK_TOLERANCE = 14;

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'spot-the-difference.best';

export const PALETTE = {
  page: '#141a2e',
  panel: '#10142a',
  ink: '#f4f1e8',
  muted: '#9aa3c0',
  accent: '#ffb03a',
  accentInk: '#2a1c00',
  good: '#4ade80',
  bad: '#f87171',
  ring: '#ff3b30',
  hint: '#ffd23e',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
