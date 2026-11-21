# Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Ruiii-newbie/best-spot-the-difference-game-20261121-0451-entry/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Ruiii-newbie/best-spot-the-difference-game-20261121-0451-entry/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that runs in a desktop browser
from static files with no network request, played with keyboard and mouse.

## How to play

Two pictures sit side by side — almost the same. Click a difference on either
picture to circle it in red. Find them all before the clock runs out.

- **3 hand-drawn scenes** (all art is drawn in code, no image files):
  Sunny Park (6 differences), Cozy Kitchen (6), Space Adventure (7) — 19 in total.
- **120 seconds per level**, with a time bonus for finishing fast.
- **Score + streaks**: 100 points per find, +10 per consecutive find; a wrong
  click costs 25 points.
- **Hints**: 3 per game (button or `H`) — a pulsing gold ring shows one
  unfound difference for 3 seconds.
- **Keyboard**: `Enter` start / next level / restart, `H` hint, `P` pause,
  `M` sound on/off, `R` restart.
- **Sound**: WebAudio beeps only — no audio files are fetched.
- **Best score** is kept in the browser between visits.

## Play it

Serve the folder with any static server and open `game/index.html`:

```sh
node serve.ts   # http://localhost:8080
```

## Files

- `game/index.html` — page, layout and overlays
- `game/src/main.js` — boot, game loop, input, screens, screenshot staging
- `game/src/scenes.js` — the three scenes and their 19 differences
- `game/src/config.js` — tuning numbers
- `game/src/audio.js` — WebAudio sound effects
- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `screenshots/` — 3 renders of the game (title, mid-play, win screen)

## Note for the entrant

`vendor/makefun-game.ts` is the kit's unchanged copy of the make.fun game
library and is added before submitting (the entry program imports it to build
the dossier). The repository was created on GitHub after the competition
opened, which satisfies the repo-created-after-open check.
