'use strict';
/* =========================================================
   EEN WARME THUIS — engine.js
   Basis: canvas, tekenhulpjes, invoer, geluid, dialogen, menu's
   ========================================================= */

const W = 320, H = 240, SCALE = 3;
const cv = document.getElementById('game');
cv.width = W * SCALE;
cv.height = H * SCALE;
const ctx = cv.getContext('2d');

function resetTransform() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

const PAL = {
  black: '#000', white: '#fff',
  g1: '#111', g2: '#1e1e1e', g3: '#2e2e2e', g4: '#444', g5: '#5e5e5e',
  g6: '#7c7c7c', g7: '#9a9a9a', g8: '#bcbcbc', g9: '#dcdcdc',
  yellow: '#ffe58a', soft: '#fff4c9', orange: '#ff9a3c', red: '#e8574c', warm: '#ffc56b'
};

/* ---------- Tekenhulpjes ---------- */
function R(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function box(x, y, w, h, border, bg, t) {
  t = t || 1;
  R(x, y, w, h, border || PAL.white);
  R(x + t, y + t, w - 2 * t, h - 2 * t, bg || PAL.black);
}
const FONT = '"Courier New", Courier, monospace';
function setFont(size) { ctx.font = 'bold ' + (size || 8) + 'px ' + FONT; }
function txt(s, x, y, c, align, size) {
  setFont(size);
  ctx.fillStyle = c || PAL.white;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(s, x, y);
}
function textW(s, size) { setFont(size); return ctx.measureText(s).width; }
function wrap(s, maxW, size) {
  setFont(size);
  const out = [];
  String(s).split('\n').forEach(par => {
    const words = par.split(' ');
    let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = w; }
      else cur = test;
    });
    out.push(cur);
  });
  return out;
}
function glow(x, y, r, rgb, a) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
  g.addColorStop(1, 'rgba(' + rgb + ',0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function heart(x, y, c) {
  // 7x6 pixelhartje
  const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row[i] === 'X') R(x + i, y + j, 1, 1, c || PAL.red);
  });
}
function miniHeart(x, y, c) {
  R(x, y, 1, 1, c); R(x + 2, y, 1, 1, c); R(x, y + 1, 3, 1, c); R(x + 1, y + 2, 1, 1, c);
}
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rnd(a, b) { return a + Math.random() * (b - a); }
function rectHit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

/* ---------- Invoer ---------- */
const Input = {
  down: {}, pressed: {}, seq: [],
  map: {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyQ: 'left', KeyZ: 'ok', Enter: 'ok', NumpadEnter: 'ok', Space: 'ok',
    KeyX: 'skip', ShiftLeft: 'skip', ShiftRight: 'skip',
    Escape: 'restart', KeyR: 'restart', KeyM: 'mute'
  },
  press(a) { if (!this.down[a]) this.pressed[a] = true; this.down[a] = true; },
  release(a) { this.down[a] = false; },
  hit(a) { return !!this.pressed[a]; },
  held(a) { return !!this.down[a]; },
  endFrame() { this.pressed = {}; },
  onSeq: null
};
/* Letters volgen wat er óp de toets staat (AZERTY én QWERTY): de Z-toets is altijd 'ok'. */
function keyName(e) {
  if (e.key && /^[a-z]$/i.test(e.key)) return 'Key' + e.key.toUpperCase();
  return e.code;
}
/* Hoe je bevestigt, zoals het in de speltekst staat */
const OK_KEYS = 'Z, spatie of enter';
window.addEventListener('keydown', e => {
  if (typeof Feedback !== 'undefined' && Feedback.open) return;
  Sfx.unlock();
  if (!e.repeat) {
    Input.seq.push(keyName(e));
    if (Input.seq.length > 12) Input.seq.shift();
    if (Input.onSeq) Input.onSeq(Input.seq);
  }
  const a = Input.map[keyName(e)];
  if (a) {
    e.preventDefault();
    if (!e.repeat) Input.press(a);
  }
});
window.addEventListener('keyup', e => {
  const a = Input.map[keyName(e)];
  if (a) Input.release(a);
});
window.addEventListener('blur', () => { Input.down = {}; });

/* ---------- Geluid (WebAudio, geen bestanden nodig) ---------- */
const Sfx = {
  ac: null, muted: false, master: null,
  unlock() {
    try {
      if (!this.ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ac = new AC();
        this.master = this.ac.createGain();
        this.master.gain.value = 0.8;
        this.master.connect(this.ac.destination);
      }
      if (this.ac.state === 'suspended') this.ac.resume();
    } catch (e) { /* geen geluid, geen probleem */ }
  },
  tone(f, d, type, v, f2, delay) {
    if (this.muted || !this.ac) return;
    try {
      const t = this.ac.currentTime + (delay || 0);
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v || 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + d + 0.03);
    } catch (e) { }
  },
  noise(d, v, delay) {
    if (this.muted || !this.ac) return;
    try {
      const t = this.ac.currentTime + (delay || 0);
      const len = Math.max(1, Math.floor(this.ac.sampleRate * d));
      const buf = this.ac.createBuffer(1, len, this.ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = this.ac.createBufferSource(), g = this.ac.createGain();
      s.buffer = buf; g.gain.value = v || 0.05;
      s.connect(g); g.connect(this.master); s.start(t);
    } catch (e) { }
  },
  blip(f) { this.tone(f || 440, 0.035, 'square', 0.02); },
  select() { this.tone(660, 0.05, 'square', 0.03); },
  ok() { this.tone(880, 0.05, 'square', 0.03); this.tone(1320, 0.07, 'square', 0.025, null, 0.05); },
  bad() { this.tone(220, 0.2, 'sawtooth', 0.03, 110); },
  clue() { this.tone(988, 0.08, 'triangle', 0.05); this.tone(1319, 0.12, 'triangle', 0.05, null, 0.08); },
  warm() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.05, null, i * 0.09)); },
  cold() { [392, 311, 262, 196].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.045, null, i * 0.16)); },
  rattle() { for (let i = 0; i < 7; i++) { this.noise(0.03, 0.05, i * 0.07); this.tone(1800 + Math.random() * 600, 0.02, 'square', 0.015, null, i * 0.07); } },
  purr() { for (let i = 0; i < 10; i++) this.tone(48 + (i % 2) * 7, 0.08, 'sawtooth', 0.035, null, i * 0.075); },
  knock() { this.noise(0.05, 0.1); this.noise(0.05, 0.1, 0.18); },
  click() { this.tone(1200, 0.02, 'square', 0.03); },
  step() { this.noise(0.015, 0.008); },
  wind() { this.noise(0.6, 0.03); }
};

/* ---------- Muziek (eigen, eenvoudige melodietjes) ---------- */
const NOTE = (() => {
  const names = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  return function (n) {
    if (!n || n === '-') return 0;
    const m = n.match(/^([A-G])(#|b)?(\d)$/);
    if (!m) return 0;
    let s = names[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) - 4) * 12;
    return 440 * Math.pow(2, s / 12);
  };
})();
const Music = {
  timer: null, cur: null,
  play(song) {
    if (this.cur === song) return;
    this.stop();
    if (!song) return;
    this.cur = song;
    let i = 0;
    const notes = song.notes.split(' ').map(NOTE);
    const bass = song.bass ? song.bass.split(' ').map(NOTE) : null;
    this.timer = setInterval(() => {
      if (Sfx.muted || !Sfx.ac) { i++; return; }
      const n = notes[i % notes.length];
      if (n) Sfx.tone(n, song.len * 1.6, 'triangle', song.vol || 0.03);
      if (bass && i % 2 === 0) {
        const b = bass[(i / 2) % bass.length];
        if (b) Sfx.tone(b, song.len * 2.4, 'sine', 0.035);
      }
      i++;
    }, song.len * 1000);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.cur = null; }
};
const SONGS = {
  title: { len: 0.32, vol: 0.022,
    notes: 'E4 - G4 - A4 - G4 E4 D4 - E4 - - - - - C4 - D4 - E4 - G4 - E4 D4 C4 - D4 - - - - - E4 - G4 - A4 - C5 - B4 A4 G4 - A4 - - - E4 - G4 - E4 D4 C4 - D4 - C4 - - - - -',
    bass: 'C3 - A2 - F2 - G2 - C3 - A2 - F2 - G2 C3 - - -' },
  warm: { len: 0.28, vol: 0.026,
    notes: 'C5 - E5 G5 - E5 C5 - D5 - F5 A5 - G5 F5 - E5 - G5 C6 - B5 A5 G5 A5 - - - G5 - - - C5 - E5 G5 - E5 C5 - D5 - F5 A5 - B5 - C6 - G5 E5 D5 C5 - - - - - - -',
    bass: 'C3 - F3 - A2 - G2 - C3 - F3 - G2 - C3 -' },
  cold: { len: 0.6, vol: 0.02,
    notes: 'A3 - - - E4 - - - D4 - C4 - - - - - A3 - - - G3 - - - E3 - - - - - - -',
    bass: 'A2 - - - F2 - - - E2 - - -' }
};

/* ---------- Dialoogvenster (typmachine) ---------- */
const VOICES = {};
function voiceFor(name) {
  if (!name) return 330;
  if (VOICES[name]) return VOICES[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return (VOICES[name] = 260 + (h % 9) * 45);
}
const Dialog = {
  active: false, q: [], cur: null, lines: [], shown: 0, total: 0, acc: 0, onDone: null, done: false,
  waiting: null, waitT: 0, top: false,
  BOX: { x: 6, y: 166, w: 308, h: 68 },
  open(list, onDone) {
    this.q = (list || []).slice();
    this.onDone = onDone || null;
    this.active = true;
    this.waiting = null;
    this.advance();
  },
  close() {
    this.active = false; this.q = []; this.cur = null; this.onDone = null; this.waiting = null;
    if (typeof Closeup !== 'undefined') Closeup.hide();
  },
  advance() {
    // functies direct uitvoeren; {wait: ...} pauzeert de tekst tot iets klaar is
    while (this.q.length) {
      const e = this.q[0];
      if (typeof e === 'function') {
        this.q.shift();
        try { e(); } catch (err) { console.error(err); }
        continue;
      }
      if (e && typeof e === 'object' && !Array.isArray(e) && e.wait !== undefined) {
        this.q.shift();
        this.waiting = e; this.waitT = 0; this.cur = null;
        return;
      }
      break;
    }
    if (!this.q.length) {
      this.active = false; this.cur = null;
      if (typeof Closeup !== 'undefined') Closeup.hide();
      const cb = this.onDone; this.onDone = null;
      if (cb) cb();
      return;
    }
    let e = this.q.shift();
    if (typeof e === 'string') e = { n: null, t: e };
    else if (Array.isArray(e)) e = { n: e[0], t: e[1] };
    const maxLines = e.n ? 4 : 5;
    const lines = wrap(e.t, this.BOX.w - 18, 8);
    if (lines.length > maxLines) {
      const rest = lines.slice(maxLines).join(' ');
      this.q.unshift({ n: e.n, t: rest });
      lines.length = maxLines;
    }
    this.cur = e;
    this.lines = lines;
    this.total = lines.reduce((s, l) => s + l.length, 0);
    this.shown = 0; this.acc = 0; this.done = false;
    this.voice = voiceFor(e.n);
  },
  update(dt) {
    if (!this.active) return;
    if (this.waiting) {
      const w = this.waiting;
      this.waitT += dt;
      let ok = false;
      try { ok = typeof w.wait === 'number' ? this.waitT >= w.wait : !!w.wait(); } catch (err) { ok = true; }
      if (ok || this.waitT > (w.max || 12)) { this.waiting = null; this.advance(); }
      return;
    }
    if (!this.cur) return;
    if (!this.done) {
      if (Input.held('skip') || Input.hit('ok')) {
        this.shown = this.total;
      } else {
        this.acc += dt;
        const speed = 0.032;
        while (this.acc > speed && this.shown < this.total) {
          this.acc -= speed;
          this.shown++;
          const ch = this.charAt(this.shown - 1);
          if (ch === '.' || ch === ',' || ch === '?' || ch === '!' || ch === '…') this.acc -= 0.12;
          if (ch !== ' ' && this.shown % 2 === 0) Sfx.blip(this.voice);
        }
      }
      if (this.shown >= this.total) this.done = true;
    } else if (Input.hit('ok')) {
      Sfx.click();
      this.advance();
    }
  },
  charAt(i) {
    for (const l of this.lines) { if (i < l.length) return l[i]; i -= l.length; }
    return '';
  },
  draw() {
    if (!this.active || !this.cur) return;
    const b = this.BOX;
    const by = this.top ? 6 : b.y;
    box(b.x, by, b.w, b.h, PAL.white, PAL.black, 1);
    let y = by + 6;
    if (this.cur.n) {
      txt(this.cur.n, b.x + 9, y, PAL.yellow);
      y += 11;
    }
    let left = this.shown;
    for (const l of this.lines) {
      if (left <= 0) break;
      txt(l.substring(0, left), b.x + 9, y, PAL.white);
      left -= l.length;
      y += 11;
    }
    if (this.done && Math.floor(performance.now() / 350) % 2 === 0) {
      R(b.x + b.w - 12, by + b.h - 8, 5, 1, PAL.white);
      R(b.x + b.w - 11, by + b.h - 7, 3, 1, PAL.white);
      R(b.x + b.w - 10, by + b.h - 6, 1, 1, PAL.white);
    }
  }
};

/* ---------- Keuzemenu (met hartje als cursor) ---------- */
const Menu = {
  active: false, title: '', opts: [], idx: 0, cb: null, cancel: -1, layout: null,
  open(title, opts, cb, cancel) {
    this.active = true; this.title = title || ''; this.opts = opts; this.idx = 0;
    this.cb = cb; this.cancel = (cancel === undefined) ? -1 : cancel;
    const tw = 280;
    const tl = this.title ? wrap(this.title, tw, 8) : [];
    const ol = opts.map(o => wrap(o, tw - 14, 8));
    const lines = tl.length + ol.reduce((s, l) => s + l.length, 0);
    const h = Math.min(220, 12 + lines * 11 + (tl.length ? 4 : 0) + ol.length * 2);
    this.layout = { tl, ol, h, y: H - 6 - h };
  },
  update() {
    if (!this.active) return;
    const n = this.opts.length;
    if (Input.hit('up')) { this.idx = (this.idx + n - 1) % n; Sfx.select(); }
    if (Input.hit('down')) { this.idx = (this.idx + 1) % n; Sfx.select(); }
    if (Input.hit('ok')) { this.pick(this.idx); return; }
    if (Input.hit('skip') && this.cancel >= 0) this.pick(this.cancel);
  },
  pick(i) {
    this.active = false;
    Sfx.ok();
    const cb = this.cb; this.cb = null;
    if (cb) cb(i);
  },
  draw() {
    if (!this.active) return;
    const L = this.layout;
    box(6, L.y, 308, L.h, PAL.white, PAL.black, 1);
    let y = L.y + 6;
    L.tl.forEach(l => { txt(l, 15, y, PAL.g8); y += 11; });
    if (L.tl.length) y += 4;
    L.ol.forEach((ls, i) => {
      const sel = i === this.idx;
      if (sel) heart(15, y + 2, PAL.red);
      ls.forEach(l => { txt(l, 28, y, sel ? PAL.yellow : PAL.white); y += 11; });
      y += 2;
    });
  }
};

/* ---------- Korte meldingen bovenaan ---------- */
const Toast = {
  msg: '', t: 0,
  show(m, dur) { this.msg = m; this.t = dur || 3; },
  update(dt) { if (this.t > 0) this.t -= dt; },
  draw() {
    if (this.t <= 0 || !this.msg) return;
    const a = Math.min(1, this.t * 2);
    ctx.globalAlpha = a;
    const w = textW(this.msg, 8) + 16;
    box(W / 2 - w / 2, 18, w, 15, PAL.yellow, PAL.black, 1);
    txt(this.msg, W / 2, 22, PAL.yellow, 'center');
    ctx.globalAlpha = 1;
  }
};

/* ---------- Weer: sneeuw en regen ---------- */
function makeWeather(type, n) {
  const p = [];
  for (let i = 0; i < n; i++) p.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() });
  return { type, p };
}
function updateWeather(w, dt, t) {
  if (!w) return;
  w.p.forEach(p => {
    if (w.type === 'snow') {
      p.y += (8 + p.s * 14) * dt;
      p.x += Math.sin(t * 0.8 + p.s * 12) * 6 * dt;
    } else {
      p.y += (170 + p.s * 90) * dt;
      p.x -= 35 * dt;
    }
    if (p.y > H) { p.y = -4; p.x = Math.random() * (W + 40); }
    if (p.x < -4) p.x += W + 8;
    if (p.x > W + 4) p.x -= W + 8;
  });
}
function drawWeather(w, hearts) {
  if (!w) return;
  w.p.forEach(p => {
    if (w.type === 'snow') {
      if (hearts) miniHeart(p.x, p.y, p.s > 0.5 ? PAL.red : PAL.warm);
      else R(p.x, p.y, p.s > 0.7 ? 2 : 1, p.s > 0.7 ? 2 : 1, p.s > 0.4 ? PAL.g9 : PAL.g7);
    } else {
      R(p.x, p.y, 1, 4 + p.s * 3, p.s > 0.5 ? PAL.g6 : PAL.g4);
    }
  });
}

/* ---------- Opslag (veilig, werkt ook zonder) ---------- */
const Save = {
  KEY: 'eenwarmethuis_v1',
  data: { endings: {}, mem: [], konami: false, plays: 0, eggs: {} },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { }
    if (!Array.isArray(this.data.mem)) this.data.mem = [];
  },
  store() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { }
  }
};
Save.load();

/* Lijst met hoofdstukken — wordt gevuld door levels1/2/3.js */
const LEVELS = [];
