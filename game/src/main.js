// Spot the Difference — boot, loop, input and screens.
//
// ?shot=start|play|end (with &seed=N) stages that scene instead of running
// the loop, paints it twice and sets window.__shotReady for a screenshot.
// ?level=N starts the game on that level (handy for testing).
import { BEST_KEY, CANVAS, CLICK_TOLERANCE, HINTS_TOTAL, HINT_SECONDS, LEVEL_SECONDS, PANEL, SCORE } from './config.js';
import { SCENES } from './scenes.js';
import { isMuted, setMuted, sfx, unlockAudio } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const startLevelParam = Math.min(Math.max(Number.parseInt(params.get('level') ?? '1', 10) || 1, 1), SCENES.length);

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const $ = (id) => document.getElementById(id);
const hud = {
  level: $('hud-level'), found: $('hud-found'), score: $('hud-score'),
  streak: $('hud-streak'), seconds: $('hud-seconds'), time: $('hud-time'),
  hints: $('hud-hints'), best: $('hud-best'),
};
const statusEl = $('status');
const srStatus = $('sr-status');
const banner = $('banner');
const overlays = {
  title: $('ov-title'), level: $('ov-level'), over: $('ov-over'),
  win: $('ov-win'), pause: $('ov-pause'),
};

const SCREEN = { TITLE: 'title', PLAY: 'play', PAUSED: 'paused', LEVEL: 'level', OVER: 'over', WIN: 'win' };

const state = {
  screen: SCREEN.TITLE,
  levelIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  hintsLeft: HINTS_TOTAL,
  timeLeft: LEVEL_SECONDS,
  found: new Set(),       // diff ids found on this level
  marks: [],              // {x, y, kind: 'found'|'wrong', born} in scene coords, per panel
  wrongMarks: [],
  hint: null,             // {diff, until} while a hint ring is pulsing
  pulses: [],             // {x, y, born} expanding rings for fresh finds
  floaters: [],           // {x, y, text, born} score popups that rise and fade
  wrong: 0,
  levelStartScore: 0,
  lastTick: 0,
  best: 0,
};

function scene() { return SCENES[state.levelIndex]; }

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveBest(value) {
  try { window.localStorage.setItem(BEST_KEY, String(value)); } catch { /* private mode: best lasts this visit */ }
}

// ---------------------------------------------------------------- rendering

function drawPanels() {
  const mods = new Set(scene().diffs.map((d) => d.id));
  scene().draw(ctx, new Set());
  ctx.save();
  ctx.translate(PANEL.width + PANEL.gap, 0);
  scene().draw(ctx, mods);
  ctx.restore();
  // Panel labels
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('A', 10, 22);
  ctx.fillText('B', PANEL.width + PANEL.gap + 10, 22);
}

function drawMarks(now) {
  for (const panel of [0, 1]) {
    const ox = panel * (PANEL.width + PANEL.gap);
    ctx.save();
    ctx.translate(ox, 0);
    for (const diff of scene().diffs) {
      if (!state.found.has(diff.id)) continue;
      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(diff.x, diff.y, diff.r + 4, (diff.r + 4) * 0.78, -0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(diff.x, diff.y, diff.r + 8, (diff.r + 8) * 0.78, -0.15, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const m of state.wrongMarks) {
      const age = (now - m.born) / 1000;
      if (age > 0.9) continue;
      ctx.strokeStyle = `rgba(248,113,113,${1 - age})`;
      ctx.lineWidth = 4;
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(m.x - s, m.y - s); ctx.lineTo(m.x + s, m.y + s);
      ctx.moveTo(m.x + s, m.y - s); ctx.lineTo(m.x - s, m.y + s);
      ctx.stroke();
    }
    // Expanding pulse rings for fresh finds
    for (const p of state.pulses) {
      const age = (now - p.born) / 1000;
      if (age > 0.7) continue;
      ctx.strokeStyle = `rgba(255,59,48,${0.9 * (1 - age / 0.7)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + age * 26, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Floating score popups
    for (const f of state.floaters) {
      const age = (now - f.born) / 1000;
      if (age > 1.1) continue;
      ctx.font = '800 22px system-ui, sans-serif';
      ctx.fillStyle = `rgba(255,255,255,${1 - age / 1.1})`;
      ctx.strokeStyle = `rgba(0,0,0,${0.6 * (1 - age / 1.1)})`;
      ctx.lineWidth = 4;
      const fy = f.y - age * 34;
      ctx.strokeText(f.text, f.x, fy);
      ctx.fillText(f.text, f.x, fy);
    }
    // Hint ring
    if (state.hint) {
      const age = (now - state.hint.born) / 1000;
      const d = state.hint.diff;
      const pulse = 1 + 0.12 * Math.sin(age * 10);
      ctx.strokeStyle = '#ffd23e';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, (d.r + 8) * pulse, (d.r + 8) * 0.78 * pulse, -0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
}

function render(now) {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
  drawPanels();
  drawMarks(now);
  state.pulses = state.pulses.filter((p) => now - p.born < 700);
  state.floaters = state.floaters.filter((f) => now - f.born < 1100);
  state.wrongMarks = state.wrongMarks.filter((m) => now - m.born < 900);
}

// ---------------------------------------------------------------- HUD + status

function updateHud() {
  const s = scene();
  hud.level.textContent = `${state.levelIndex + 1}/${SCENES.length}`;
  hud.found.textContent = `${state.found.size}/${s.diffs.length}`;
  hud.score.textContent = String(state.score);
  hud.streak.textContent = `×${state.streak}`;
  hud.seconds.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
  hud.time.classList.toggle('warn', state.timeLeft <= 15 && state.screen === SCREEN.PLAY);
  hud.hints.textContent = String(state.hintsLeft);
  hud.best.textContent = String(Math.max(state.best, state.score));
  $('hint-count').textContent = String(state.hintsLeft);
  $('btn-hint').disabled = state.hintsLeft <= 0 || state.screen !== SCREEN.PLAY;
}

function say(message, tone = '') {
  statusEl.textContent = message;
  statusEl.className = tone;
  srStatus.textContent = message;
}

function showOverlay(name) {
  for (const [key, el] of Object.entries(overlays)) el.hidden = key !== name;
}

function showBanner(text, sub = '', ms = 1400) {
  banner.innerHTML = sub ? `${text}<span class="tag">${sub}</span>` : text;
  banner.classList.add('show');
  window.setTimeout(() => banner.classList.remove('show'), ms);
}

// ---------------------------------------------------------------- flow

function startLevel(index) {
  state.levelIndex = index;
  state.found = new Set();
  state.marks = [];
  state.wrongMarks = [];
  state.pulses = [];
  state.floaters = [];
  state.hint = null;
  state.timeLeft = LEVEL_SECONDS;
  state.streak = 0;
  state.levelStartScore = state.score;
  state.screen = SCREEN.PLAY;
  state.lastTick = performance.now();
  showOverlay(null);
  showBanner(`${scene().name}`, scene().tagline, 1800);
  say(`${scene().name} — find ${scene().diffs.length} differences. ${scene().tagline}`);
  updateHud();
}

function startGame() {
  unlockAudio();
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.hintsLeft = HINTS_TOTAL;
  state.wrong = 0;
  startLevel(startLevelParam - 1);
}

function levelClear() {
  const bonus = Math.ceil(state.timeLeft) * SCORE.timeBonusPerSecond;
  state.score += bonus;
  sfx.levelClear();
  state.screen = SCREEN.LEVEL;
  $('ov-level-title').textContent = `${scene().name} — clear!`;
  $('ov-level-stats').innerHTML =
    `Found <b>${scene().diffs.length}/${scene().diffs.length}</b> · ` +
    `time bonus <b>+${bonus}</b> · score <b>${state.score}</b>`;
  $('btn-next').textContent = state.levelIndex + 1 >= SCENES.length
    ? '🏆 See your results'
    : 'Next level →';
  showOverlay('level');
  say(`Level clear! Time bonus +${bonus}. Score ${state.score}.`);
  updateHud();
}

function gameOver() {
  sfx.lose();
  state.screen = SCREEN.OVER;
  $('ov-over-title').textContent = `Time's up on ${scene().name}!`;
  $('ov-over-stats').innerHTML =
    `You found <b>${state.found.size}/${scene().diffs.length}</b> differences · score <b>${state.score}</b>`;
  showOverlay('over');
  say(`Time's up. You found ${state.found.size} of ${scene().diffs.length}.`);
  updateHud();
}

function winGame() {
  sfx.win();
  state.screen = SCREEN.WIN;
  const isBest = state.score > state.best;
  if (isBest) { state.best = state.score; saveBest(state.best); }
  $('ov-win-stats').innerHTML =
    `All <b>19 differences</b> found across 3 scenes · ` +
    `best streak <b>×${state.bestStreak}</b> · final score <b>${state.score}</b>`;
  $('ov-win-best').textContent = isBest
    ? '🎉 New best score!'
    : `Best score: ${state.best}`;
  showOverlay('win');
  say(`You found them all! Final score ${state.score}.`);
  updateHud();
}

function nextLevel() {
  if (state.levelIndex + 1 >= SCENES.length) winGame();
  else startLevel(state.levelIndex + 1);
}

// ---------------------------------------------------------------- input

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (CANVAS.width / rect.width),
    y: (event.clientY - rect.top) * (CANVAS.height / rect.height),
  };
}

function pickDiff(sceneX, sceneY) {
  let bestDiff = null;
  let bestDist = Infinity;
  for (const d of scene().diffs) {
    if (state.found.has(d.id)) continue;
    const dist = Math.hypot(d.x - sceneX, d.y - sceneY);
    if (dist < d.r + CLICK_TOLERANCE && dist < bestDist) { bestDiff = d; bestDist = dist; }
  }
  return bestDiff;
}

function handleClick(event) {
  if (state.screen !== SCREEN.PLAY) return;
  unlockAudio();
  const p = canvasPoint(event);
  const panel = p.x < PANEL.width ? 0 : (p.x >= PANEL.width + PANEL.gap ? 1 : -1);
  if (panel < 0) return; // clicked the gap between pictures
  const sceneX = p.x - panel * (PANEL.width + PANEL.gap);
  const now = performance.now();
  const diff = pickDiff(sceneX, p.y);
  if (diff) {
    state.found.add(diff.id);
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const gained = SCORE.find + SCORE.streakBonus * (state.streak - 1);
    state.score += gained;
    state.pulses.push({ x: sceneX, y: p.y, r: diff.r, born: now });
    state.floaters.push({ x: sceneX, y: p.y - 28, text: `+${gained}`, born: now });
    sfx.found();
    say(`Found it! ${diff.hint ? '' : ''}${state.found.size} of ${scene().diffs.length} — +${gained} points.`, 'good');
    if (state.found.size === scene().diffs.length) levelClear();
  } else {
    state.streak = 0;
    state.wrong += 1;
    state.score = Math.max(0, state.score + SCORE.wrongClick);
    state.wrongMarks.push({ x: sceneX, y: p.y, born: now });
    sfx.wrong();
    say('Not a difference — 25 points. Look closer!', 'bad');
  }
  updateHud();
}

function useHint() {
  if (state.screen !== SCREEN.PLAY || state.hintsLeft <= 0) return;
  const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hint = { diff, born: performance.now() };
  sfx.hint();
  say(`Hint: ${diff.hint} — ${state.hintsLeft} hint${state.hintsLeft === 1 ? '' : 's'} left.`);
  window.setTimeout(() => { state.hint = null; }, HINT_SECONDS * 1000);
  updateHud();
}

function togglePause() {
  if (state.screen === SCREEN.PLAY) {
    state.screen = SCREEN.PAUSED;
    showOverlay('pause');
    say('Paused.');
  } else if (state.screen === SCREEN.PAUSED) {
    state.screen = SCREEN.PLAY;
    state.lastTick = performance.now();
    showOverlay(null);
    say('Playing.');
  }
  updateHud();
}

function toggleSound() {
  setMuted(!isMuted());
  $('btn-sound').textContent = isMuted() ? '🔇 Sound off' : '🔊 Sound on';
}

canvas.addEventListener('click', handleClick);
$('btn-start').addEventListener('click', startGame);
$('btn-next').addEventListener('click', nextLevel);
$('btn-retry').addEventListener('click', () => startLevel(state.levelIndex));
$('btn-restart1').addEventListener('click', startGame);
$('btn-again').addEventListener('click', startGame);
$('btn-resume').addEventListener('click', togglePause);
$('btn-hint').addEventListener('click', useHint);
$('btn-pause').addEventListener('click', togglePause);
$('btn-sound').addEventListener('click', toggleSound);
$('btn-restart2').addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'enter' || key === ' ') {
    event.preventDefault();
    if (state.screen === SCREEN.TITLE || state.screen === SCREEN.WIN || state.screen === SCREEN.OVER) startGame();
    else if (state.screen === SCREEN.LEVEL) nextLevel();
    else if (state.screen === SCREEN.PAUSED) togglePause();
  } else if (key === 'h') useHint();
  else if (key === 'p' || key === 'escape') togglePause();
  else if (key === 'm') toggleSound();
  else if (key === 'r') startGame();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.screen === SCREEN.PLAY) togglePause();
});

// ---------------------------------------------------------------- main loop

function frame(now) {
  requestAnimationFrame(frame);
  if (state.screen === SCREEN.PLAY) {
    const dt = Math.min((now - state.lastTick) / 1000, 0.5);
    state.lastTick = now;
    state.timeLeft -= dt;
    if (state.hint && now - state.hint.born > HINT_SECONDS * 1000) state.hint = null;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      gameOver();
    } else {
      updateHud();
    }
  }
  render(now);
}

// ---------------------------------------------------------------- screenshots

function stageShot(name) {
  if (name === 'start') {
    state.screen = SCREEN.TITLE;
    showOverlay('title');
  } else if (name === 'play') {
    // Mid-level: 3 of 6 found, so markers and the counter both show.
    state.screen = SCREEN.PLAY;
    state.levelIndex = 0;
    state.score = 340;
    state.streak = 2;
    state.timeLeft = 87;
    for (const d of scene().diffs.slice(0, 3)) state.found.add(d.id);
    showOverlay(null);
  } else if (name === 'end') {
    state.screen = SCREEN.WIN;
    state.score = 2840;
    state.bestStreak = 5;
    state.best = 2840;
    $('ov-win-stats').innerHTML = 'All <b>19 differences</b> found across 3 scenes · best streak <b>×5</b> · final score <b>2840</b>';
    $('ov-win-best').textContent = '🎉 New best score!';
    showOverlay('win');
  }
  updateHud();
  let painted = 0;
  const paint = (now) => {
    render(now ?? performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  };
  requestAnimationFrame(paint);
}

state.best = readBest();
updateHud();
say('Spot the Difference. Press Enter or click Start to play.');

if (shot) stageShot(shot);
else requestAnimationFrame(frame);
