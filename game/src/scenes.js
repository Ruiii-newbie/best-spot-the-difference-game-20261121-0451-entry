// Spot the Difference — the three scenes.
//
// Every scene is drawn twice: once plain (left panel) and once with a set of
// `mods` applied (right panel). A difference is a small, deliberate change to
// one drawing step, so the two pictures stay near-identical and every
// difference has an exact centre and radius for hit-testing.
//
// Scene space is 600x400. `mods` is a Set of difference ids.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rr(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------------------------------------------------------- scene 1: park

function drawPark(ctx, mods) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#6ec1f5');
  sky.addColorStop(0.65, '#bfe6fb');
  sky.addColorStop(1, '#dff3fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 400);

  // Sun, top-left. Difference "sun-glasses": the right sun wears shades.
  circle(ctx, 82, 72, 36, '#ffd93b');
  ctx.strokeStyle = '#f5b90d';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 82 + Math.cos(a) * 44, 72 + Math.sin(a) * 44, 82 + Math.cos(a) * 54, 72 + Math.sin(a) * 54, '#f5b90d', 4);
  }
  circle(ctx, 72, 68, 4, '#7a5b00');
  circle(ctx, 92, 68, 4, '#7a5b00');
  ctx.strokeStyle = '#7a5b00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(82, 80, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (mods.has('sun-glasses')) {
    rr(ctx, 58, 60, 20, 13, 6, '#22283b');
    rr(ctx, 86, 60, 20, 13, 6, '#22283b');
    line(ctx, 78, 66, 86, 66, '#22283b', 3);
    line(ctx, 58, 64, 48, 58, '#22283b', 3);
  }

  // Clouds. Difference "cloud": the middle cloud is gone on the right.
  const cloud = (x, y, s) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 20 * s, 0, Math.PI * 2);
    ctx.arc(x + 22 * s, y + 4 * s, 16 * s, 0, Math.PI * 2);
    ctx.arc(x - 22 * s, y + 5 * s, 15 * s, 0, Math.PI * 2);
    ctx.fill();
  };
  cloud(180, 52, 1);
  if (!mods.has('cloud')) cloud(300, 58, 0.9);
  cloud(500, 130, 0.8);

  // Bird. Difference "bird": it only flies on the left.
  if (!mods.has('bird')) {
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 52, 9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(528, 52, 9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // Kite. Difference "kite-tail": the tail bows are missing on the right.
  const kx = 428, ky = 108;
  ctx.fillStyle = '#ff5d8f';
  ctx.beginPath();
  ctx.moveTo(kx, ky - 26); ctx.lineTo(kx + 22, ky); ctx.lineTo(kx, ky + 26); ctx.lineTo(kx - 22, ky);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ff5d8f';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(kx, ky - 26); ctx.lineTo(kx, ky + 26); ctx.moveTo(kx - 22, ky); ctx.lineTo(kx + 22, ky); ctx.stroke();
  line(ctx, kx, ky + 26, kx - 14, ky + 96, '#7a5b00', 2);
  if (!mods.has('kite-tail')) {
    for (const [bx, by] of [[kx - 4, ky + 48], [kx - 9, ky + 70], [kx - 13, ky + 90]]) {
      ctx.fillStyle = '#ffd93b';
      ctx.beginPath();
      ctx.moveTo(bx - 8, by); ctx.lineTo(bx + 8, by); ctx.lineTo(bx, by + 7); ctx.lineTo(bx, by - 7);
      ctx.closePath(); ctx.fill();
    }
  }

  // Grass
  const grass = ctx.createLinearGradient(0, 270, 0, 400);
  grass.addColorStop(0, '#7ed957');
  grass.addColorStop(1, '#4da637');
  ctx.fillStyle = grass;
  ctx.fillRect(0, 270, 600, 130);
  // Path
  ctx.fillStyle = '#f2dfae';
  ctx.beginPath();
  ctx.ellipse(300, 400, 130, 46, 0, Math.PI, 0);
  ctx.fill();

  // Tree, right side
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(492, 210, 18, 82);
  circle(ctx, 500, 190, 46, '#3f9e4d');
  circle(ctx, 462, 210, 32, '#4db45e');
  circle(ctx, 538, 208, 34, '#57bd63');
  circle(ctx, 500, 158, 30, '#5cc467');

  // Bench, left
  ctx.fillStyle = '#a4713a';
  rr(ctx, 130, 296, 110, 12, 4, '#a4713a');
  rr(ctx, 130, 314, 110, 12, 4, '#a4713a');
  ctx.fillStyle = '#7c4f22';
  ctx.fillRect(138, 326, 10, 26);
  ctx.fillRect(222, 326, 10, 26);

  // Flowers along the bottom. Difference "flower": one tulip is blue, not red.
  const tulip = (x, y, petal) => {
    line(ctx, x, y, x, y + 26, '#2e7d32', 3);
    ctx.fillStyle = petal;
    ctx.beginPath();
    ctx.arc(x - 7, y, 7, 0, Math.PI * 2);
    ctx.arc(x + 7, y, 7, 0, Math.PI * 2);
    ctx.arc(x, y - 4, 8, 0, Math.PI * 2);
    ctx.fill();
  };
  tulip(96, 352, '#ff5d5d');
  tulip(150, 330, mods.has('flower') ? '#5d8bff' : '#ff5d5d');
  tulip(204, 356, '#ff9f1c');
  tulip(556, 360, '#ff5d5d');
  circle(ctx, 250, 372, 6, '#ffffff');
  circle(ctx, 268, 376, 6, '#ffd93b');
  circle(ctx, 420, 374, 6, '#ffffff');

  // Dog, centre-right. Difference "dog-tail": tail up on the left, down on the right.
  ellipse(ctx, 462, 318, 34, 20, '#d99a55');
  circle(ctx, 492, 302, 16, '#d99a55');
  ctx.fillStyle = '#b5773a';
  ctx.beginPath(); ctx.arc(492, 302, 16, -0.6, 1.2); ctx.fill();
  circle(ctx, 500, 290, 5, '#b5773a'); // ear
  circle(ctx, 486, 297, 2.5, '#222');
  circle(ctx, 498, 297, 2.5, '#222');
  circle(ctx, 506, 304, 3.5, '#222');
  if (mods.has('dog-tail')) line(ctx, 430, 312, 420, 332, '#b5773a', 6);
  else line(ctx, 430, 312, 418, 292, '#b5773a', 6);
  line(ctx, 440, 334, 440, 348, '#b5773a', 5);
  line(ctx, 484, 334, 484, 348, '#b5773a', 5);

  // Butterflies
  circle(ctx, 330, 250, 4, '#ff9f1c');
  circle(ctx, 338, 250, 4, '#ff5d8f');
}

// ---------------------------------------------------------------- scene 2: kitchen

function drawKitchen(ctx, mods) {
  // Wall + floor
  ctx.fillStyle = '#ffe7c2';
  ctx.fillRect(0, 0, 600, 310);
  ctx.fillStyle = '#c98f4e';
  ctx.fillRect(0, 310, 600, 90);
  ctx.strokeStyle = '#a96f33';
  ctx.lineWidth = 2;
  for (let y = 330; y < 400; y += 22) { line(ctx, 0, y, 600, y, '#a96f33', 2); }

  // Window with curtains. Difference "curtain": the tie-back bow is missing.
  ctx.fillStyle = '#bfe6fb';
  ctx.fillRect(56, 56, 150, 140);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(56, 56, 150, 140);
  const winSky = ctx.createLinearGradient(0, 56, 0, 196);
  winSky.addColorStop(0, '#7ec8f7');
  winSky.addColorStop(1, '#dff3fd');
  ctx.fillStyle = winSky;
  ctx.fillRect(64, 64, 134, 124);
  circle(ctx, 92, 92, 16, '#ffd93b');
  cloudSmall(ctx, 150, 96);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(126, 56, 8, 140);
  ctx.fillRect(56, 120, 150, 8);
  // Curtains
  ctx.fillStyle = '#ff8fab';
  ctx.beginPath();
  ctx.moveTo(48, 48); ctx.lineTo(76, 48); ctx.lineTo(66, 204); ctx.lineTo(40, 204); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(214, 48); ctx.lineTo(186, 48); ctx.lineTo(196, 204); ctx.lineTo(222, 204); ctx.closePath(); ctx.fill();
  if (!mods.has('curtain')) {
    circle(ctx, 62, 130, 7, '#ffd93b');
    circle(ctx, 200, 130, 7, '#ffd93b');
  }

  // Wall clock. Difference "clock": 3 o'clock on the left, 5 o'clock on the right.
  circle(ctx, 300, 74, 32, '#ffffff');
  ctx.strokeStyle = '#5b4636';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(300, 74, 32, 0, Math.PI * 2); ctx.stroke();
  const hand = (angle, len) => line(ctx, 300, 74, 300 + Math.cos(angle) * len, 74 + Math.sin(angle) * len, '#333', 3);
  hand(-Math.PI / 2, 18); // 12
  hand(mods.has('clock') ? (5 / 12) * Math.PI * 2 - Math.PI / 2 : 0, 24); // 3 vs 5
  circle(ctx, 300, 74, 4, '#333');

  // Framed picture
  rr(ctx, 440, 44, 90, 64, 6, '#5b4636');
  rr(ctx, 448, 52, 74, 48, 4, '#bfe6fb');
  circle(ctx, 470, 72, 10, '#ffd93b');
  ctx.fillStyle = '#4da637';
  ctx.beginPath(); ctx.moveTo(448, 100); ctx.lineTo(485, 76); ctx.lineTo(522, 100); ctx.closePath(); ctx.fill();

  // Rug
  ellipse(ctx, 300, 372, 150, 22, '#e2574c');
  ellipse(ctx, 300, 372, 110, 15, '#f2a541');

  // Table
  rr(ctx, 90, 250, 420, 16, 6, '#8a5a2b');
  ctx.fillStyle = '#6e451f';
  ctx.fillRect(110, 266, 12, 84);
  ctx.fillRect(478, 266, 12, 84);
  // Tablecloth stripe
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(90, 250, 420, 6);

  // Fruit bowl. Difference "fruit": the middle apple is green on the right.
  ellipse(ctx, 180, 262, 46, 14, '#3f6fb5');
  circle(ctx, 156, 250, 12, '#ff5d5d');
  circle(ctx, 180, 244, 12, mods.has('fruit') ? '#7ed957' : '#ff5d5d');
  circle(ctx, 204, 250, 12, '#ff9f1c');
  line(ctx, 180, 234, 180, 226, '#2e7d32', 2);

  // Teapot with steam. Difference "steam": no steam on the right.
  ctx.fillStyle = '#7ec8f7';
  ctx.beginPath(); ctx.ellipse(285, 232, 34, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(318, 226); ctx.quadraticCurveTo(344, 222, 336, 244); ctx.quadraticCurveTo(328, 252, 318, 246); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7ec8f7';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(256, 230, 12, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  rr(ctx, 276, 202, 20, 8, 4, '#5aa9e6');
  circle(ctx, 286, 200, 5, '#ffd93b');
  if (!mods.has('steam')) {
    ctx.strokeStyle = 'rgba(120,120,120,0.65)';
    ctx.lineWidth = 3;
    for (const [sx, sy] of [[272, 196], [286, 190], [300, 196]]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx - 5, sy - 10, sx + 3, sy - 18);
      ctx.stroke();
    }
  }

  // Mug. Difference "mug": the handle is missing on the right.
  rr(ctx, 348, 228, 34, 30, 5, '#ff5d8f');
  if (!mods.has('mug')) {
    ctx.strokeStyle = '#ff5d8f';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(386, 243, 10, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  }
  // Second mug
  rr(ctx, 410, 232, 30, 26, 5, '#7ed957');

  // Cat on a chair, right. Difference "cat-ear": one ear flops on the right.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(452, 300, 8, 50);
  ctx.fillRect(522, 300, 8, 50);
  rr(ctx, 444, 292, 94, 12, 4, '#a4713a');
  // Cat body
  ctx.fillStyle = '#f2a541';
  ctx.beginPath(); ctx.ellipse(490, 272, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
  circle(ctx, 516, 250, 17, '#f2a541');
  // Ears
  ctx.beginPath(); ctx.moveTo(502, 238); ctx.lineTo(508, 222); ctx.lineTo(516, 236); ctx.closePath(); ctx.fill();
  if (mods.has('cat-ear')) {
    ctx.beginPath(); ctx.moveTo(522, 236); ctx.lineTo(534, 228); ctx.lineTo(538, 242); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(524, 236); ctx.lineTo(530, 220); ctx.lineTo(538, 236); ctx.closePath(); ctx.fill();
  }
  circle(ctx, 510, 248, 2.5, '#222');
  circle(ctx, 522, 248, 2.5, '#222');
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(516, 254, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Tail curled up
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(458, 268, 14, Math.PI * 0.6, Math.PI * 1.7); ctx.stroke();
}

function cloudSmall(ctx, x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.arc(x + 13, y + 3, 9, 0, Math.PI * 2);
  ctx.arc(x - 13, y + 3, 9, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- scene 3: space

function drawSpace(ctx, mods) {
  // Deep space
  const bg = ctx.createLinearGradient(0, 0, 0, 400);
  bg.addColorStop(0, '#0a0e2a');
  bg.addColorStop(1, '#1d2a5e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 400);

  // Stars (fixed positions so both panels match)
  const stars = [[40, 40], [120, 90], [200, 36], [260, 120], [340, 48], [420, 96], [560, 40], [580, 150], [60, 180], [240, 200], [380, 320], [540, 200], [90, 250], [300, 350], [460, 350], [560, 320]];
  ctx.fillStyle = '#ffffff';
  for (const [sx, sy] of stars) {
    circle(ctx, sx, sy, 2, '#ffffff');
    line(ctx, sx - 5, sy, sx + 5, sy, 'rgba(255,255,255,0.5)', 1);
    line(ctx, sx, sy - 5, sx, sy + 5, 'rgba(255,255,255,0.5)', 1);
  }
  // Difference "star": the bright star top-right only shines on the left.
  if (!mods.has('star')) {
    circle(ctx, 480, 60, 7, '#fff7ae');
    line(ctx, 480 - 14, 60, 480 + 14, 60, 'rgba(255,247,174,0.8)', 2);
    line(ctx, 480, 60 - 14, 480, 60 + 14, 'rgba(255,247,174,0.8)', 2);
  }

  // Planet with ring. Difference "ring": the ring is gone on the right.
  circle(ctx, 150, 150, 62, '#ff9f1c');
  ctx.fillStyle = '#e07b00';
  ctx.beginPath(); ctx.ellipse(150, 132, 52, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(150, 168, 48, 9, 0, 0, Math.PI * 2); ctx.fill();
  if (!mods.has('ring')) {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(150, 150, 92, 22, -0.25, 0, Math.PI * 2); ctx.stroke();
  }

  // Moon with craters. Difference "crater": one crater is missing on the right.
  circle(ctx, 92, 306, 40, '#d7dbe2');
  circle(ctx, 80, 296, 8, '#aab0bd');
  if (!mods.has('crater')) circle(ctx, 104, 316, 10, '#aab0bd');
  circle(ctx, 92, 330, 5, '#aab0bd');

  // Rocket, centre. Differences: "window" (round vs square) and "flame" (orange vs blue).
  ctx.fillStyle = '#e8ecf4';
  ctx.beginPath();
  ctx.moveTo(330, 108);
  ctx.quadraticCurveTo(362, 150, 358, 210);
  ctx.lineTo(302, 210);
  ctx.quadraticCurveTo(298, 150, 330, 108);
  ctx.fill();
  ctx.fillStyle = '#ff5d5d';
  ctx.beginPath(); ctx.moveTo(330, 108); ctx.quadraticCurveTo(348, 132, 346, 152); ctx.lineTo(314, 152); ctx.quadraticCurveTo(312, 132, 330, 108); ctx.fill();
  ctx.fillStyle = '#ff5d5d';
  ctx.beginPath(); ctx.moveTo(302, 196); ctx.lineTo(282, 232); ctx.lineTo(304, 226); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(358, 196); ctx.lineTo(378, 232); ctx.lineTo(356, 226); ctx.closePath(); ctx.fill();
  // Window
  if (mods.has('window')) {
    ctx.fillStyle = '#7ec8f7';
    ctx.fillRect(318, 168, 24, 24);
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 3;
    ctx.strokeRect(318, 168, 24, 24);
  } else {
    circle(ctx, 330, 180, 13, '#7ec8f7');
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(330, 180, 13, 0, Math.PI * 2); ctx.stroke();
  }
  // Flame
  ctx.fillStyle = mods.has('flame') ? '#5d8bff' : '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(312, 210); ctx.lineTo(330, 252); ctx.lineTo(348, 210); ctx.closePath(); ctx.fill();
  ctx.fillStyle = mods.has('flame') ? '#9db8ff' : '#ffd93b';
  ctx.beginPath();
  ctx.moveTo(320, 210); ctx.lineTo(330, 238); ctx.lineTo(340, 210); ctx.closePath(); ctx.fill();

  // Astronaut, right. Difference "flag": the flag is yellow on the right.
  circle(ctx, 448, 200, 22, '#ffffff'); // helmet
  circle(ctx, 448, 200, 15, '#1d2a5e');
  circle(ctx, 452, 196, 4, '#ffffff');
  rr(ctx, 432, 220, 32, 40, 10, '#ffffff'); // suit
  rr(ctx, 436, 226, 12, 12, 3, '#7ec8f7');
  line(ctx, 432, 236, 416, 252, '#ffffff', 7); // arm
  line(ctx, 464, 236, 480, 222, '#ffffff', 7);
  line(ctx, 440, 260, 434, 284, '#ffffff', 8); // legs
  line(ctx, 456, 260, 462, 284, '#ffffff', 8);
  // Flag pole + flag in the raised hand
  line(ctx, 480, 222, 480, 168, '#c9a227', 3);
  ctx.fillStyle = mods.has('flag') ? '#ffd93b' : '#ff5d5d';
  ctx.beginPath(); ctx.moveTo(480, 168); ctx.lineTo(512, 176); ctx.lineTo(480, 186); ctx.closePath(); ctx.fill();

  // Alien, bottom-right. Difference "antenna": the antenna ball is missing.
  ellipse(ctx, 528, 316, 26, 22, '#7ed957');
  circle(ctx, 528, 286, 18, '#7ed957');
  circle(ctx, 521, 282, 5, '#222');
  circle(ctx, 535, 282, 5, '#222');
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(528, 294, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  line(ctx, 528, 268, 528, 252, '#7ed957', 4);
  if (!mods.has('antenna')) circle(ctx, 528, 248, 6, '#ff5d8f');
  line(ctx, 506, 330, 496, 346, '#7ed957', 5);
  line(ctx, 550, 330, 560, 346, '#7ed957', 5);

  // Ground shadow
  ellipse(ctx, 330, 372, 90, 10, 'rgba(0,0,0,0.3)');
}

// ---------------------------------------------------------------- catalogue

export const SCENES = [
  {
    id: 'park',
    name: 'Sunny Park',
    tagline: 'A lazy afternoon in the park — 6 differences hide in the sunshine.',
    draw: drawPark,
    diffs: [
      { id: 'sun-glasses', x: 82, y: 68, r: 42, hint: 'Look at the sun' },
      { id: 'cloud', x: 300, y: 58, r: 40, hint: 'Count the clouds' },
      { id: 'bird', x: 520, y: 52, r: 26, hint: 'Something flies top-right' },
      { id: 'kite-tail', x: 420, y: 82, r: 32, hint: 'Follow the kite string' },
      { id: 'flower', x: 150, y: 330, r: 26, hint: 'Check the flowers' },
      { id: 'dog-tail', x: 424, y: 306, r: 30, hint: 'Watch the dog' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Cozy Kitchen',
    tagline: 'Tea is brewing and the cat is napping — 6 differences hide in the kitchen.',
    draw: drawKitchen,
    diffs: [
      { id: 'clock', x: 300, y: 74, r: 36, hint: 'What time is it?' },
      { id: 'curtain', x: 62, y: 130, r: 30, hint: 'Look at the window curtains' },
      { id: 'steam', x: 286, y: 186, r: 32, hint: 'Is the tea still hot?' },
      { id: 'fruit', x: 180, y: 244, r: 26, hint: 'Check the fruit bowl' },
      { id: 'mug', x: 384, y: 243, r: 26, hint: 'Look at the pink mug' },
      { id: 'cat-ear', x: 530, y: 228, r: 28, hint: 'The cat is listening…' },
    ],
  },
  {
    id: 'space',
    name: 'Space Adventure',
    tagline: 'A rocket, a planet and a friendly alien — 7 differences hide among the stars.',
    draw: drawSpace,
    diffs: [
      { id: 'ring', x: 150, y: 150, r: 56, hint: 'Look at the big planet' },
      { id: 'star', x: 480, y: 60, r: 26, hint: 'A bright star is missing' },
      { id: 'window', x: 330, y: 180, r: 26, hint: 'Look at the rocket window' },
      { id: 'flag', x: 496, y: 177, r: 28, hint: 'The astronaut waves a flag' },
      { id: 'flame', x: 330, y: 228, r: 32, hint: 'Check the rocket flame' },
      { id: 'antenna', x: 528, y: 250, r: 26, hint: 'The alien lost something' },
      { id: 'crater', x: 104, y: 316, r: 30, hint: 'Look closely at the moon' },
    ],
  },
];
