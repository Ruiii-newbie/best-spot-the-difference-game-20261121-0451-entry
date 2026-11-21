// Tiny WebAudio sound effects: oscillators only, no audio files are fetched.
// Everything is created lazily on the first user gesture so browsers allow it.

let ctx = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function tone(freq, startIn, duration, type = 'sine', volume = 0.12) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startIn;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sfx = {
  click() { tone(660, 0, 0.07, 'triangle', 0.06); },
  found() { tone(523.25, 0, 0.12, 'sine', 0.14); tone(783.99, 0.09, 0.18, 'sine', 0.14); },
  wrong() { tone(160, 0, 0.18, 'sawtooth', 0.07); },
  hint() { tone(880, 0, 0.1, 'sine', 0.1); tone(1174.66, 0.08, 0.14, 'sine', 0.1); },
  levelClear() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.22, 'sine', 0.13));
  },
  win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.12));
  },
  lose() { tone(392, 0, 0.25, 'sine', 0.1); tone(311.13, 0.2, 0.4, 'sine', 0.1); },
};

export function isMuted() { return muted; }
export function setMuted(value) { muted = !!value; }
export function unlockAudio() { ensureCtx(); }
