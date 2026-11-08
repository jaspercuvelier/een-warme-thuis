'use strict';
/* =========================================================
   eggs.js — verborgen verrassingen (easter eggs)
   Achtergronddingen waar iets kleins gebeurt als je erop KLIKT/TIKT,
   of als je ervoor staat en [Z] drukt waar verder niets te doen is.
   Ze hebben bewust geen pijltje: ontdekken is de pret.
   ========================================================= */

/* --- klein effect-systeem: L.fx = [{ update(dt) -> false = klaar, draw(t) }] --- */
function addFx(L, f) { f.t = 0; (L.fx || (L.fx = [])).push(f); return f; }
function sparkle(L, x, y, n, col) {
  for (let i = 0; i < (n || 6); i++) {
    const a = Math.random() * 6.28, v = rnd(10, 26);
    addFx(L, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10,
      update(dt) { this.t += dt; this.x += this.vx * dt; this.y += this.vy * dt; this.vy += 30 * dt; return this.t < 0.8; },
      draw() { ctx.globalAlpha = Math.max(0, 1 - this.t / 0.8); R(this.x, this.y, 1, 1, col || PAL.yellow); ctx.globalAlpha = 1; } });
  }
}
function floatText(L, x, y, s, col) {
  addFx(L, { update(dt) { this.t += dt; return this.t < 1.6; },
    draw() { ctx.globalAlpha = Math.min(1, (1.6 - this.t) * 2); txt(s, x, y - this.t * 10, col || PAL.white, 'center', 6); ctx.globalAlpha = 1; } });
}

/* --- kleine diertjes --- */
function drawMouse(x, y, dir, t, toy) {
  x = Math.round(x); y = Math.round(y);
  const c = toy ? PAL.g7 : '#8a8078', f = (a, b, w, h, col) => R(dir > 0 ? x + a : x - a - w, y + b, w, h, col);
  f(-3, -3, 6, 3, c); f(-2, -4, 4, 1, c); f(3, -3, 2, 2, c); f(5, -2, 1, 1, '#e8a0a0');
  f(1, -5, 2, 2, toy ? PAL.g8 : '#b0a098'); f(3, -3, 1, 1, PAL.black);
  const tail = Math.floor(t * 10) % 2;
  f(-6, -2 - tail, 3, 1, '#c8a0a0'); f(-7, -3 + tail, 1, 1, '#c8a0a0');
  const leg = Math.floor(t * 16) % 2;
  f(-2 + leg, 0, 1, 1, c); f(1 - leg, 0, 1, 1, c);
  if (toy) { const k = Math.floor(t * 8) % 2; f(-1, -7, 1, 3, PAL.yellow); f(-2 + k * 2, -7, 1, 1, PAL.yellow); }
}
function drawBird(x, y, t, c) {
  x = Math.round(x); y = Math.round(y);
  const up = Math.floor(t * 10) % 2;
  R(x - 2, y, 5, 2, c || PAL.g7); R(x + 2, y - 1, 2, 2, c || PAL.g7); R(x + 4, y, 1, 1, PAL.orange);
  if (up) { R(x - 4, y - 3, 3, 1, c || PAL.g6); R(x - 2, y - 2, 2, 2, c || PAL.g6); }
  else { R(x - 4, y + 2, 3, 1, c || PAL.g6); R(x - 2, y + 1, 2, 2, c || PAL.g6); }
}

/* --- de eggs per hoofdstuk ---
   area = klikvlak [x, y, w, h];  foot = waar je met [Z] moet staan [x, y, w, h] (optioneel) */
const EGGS = {
  0: [
    { id: 'muis', obj: 'container', name: 'Een muisje!', area: [14, 78, 50, 40], foot: [14, 112, 50, 8],
      poke(L) {
        Sfx.tone(1800, 0.05, 'square', 0.03); Sfx.tone(2100, 0.05, 'square', 0.03, null, 0.08);
        addFx(L, { x: 40, y: 117, update(dt) { this.t += dt; this.x += 70 * dt; if (Math.floor(this.t * 12) % 4 === 0) this.y = 117 + (Math.random() < 0.5 ? -1 : 0); return this.x < 158; },
          draw(t) { drawMouse(this.x, this.y, 1, t); } });
        floatText(L, 40, 100, 'piep!', PAL.g9);
      } }
  ],
  1: [
    { id: 'mot', obj: 'kapstok', name: 'Een motje uit het hoedje', area: [242, 50, 20, 22],
      poke(L) {
        addFx(L, { update(dt) { this.t += dt; return this.t < 8; },
          draw(t) {
            const k = this.t;
            let x, y;
            if (k < 1.5) { x = lerp(252, 192, k / 1.5); y = 58 + Math.sin(k * 9) * 4 + (64 - 58) * (k / 1.5); }
            else if (k < 6.5) { x = 192 + Math.cos(k * 5) * 8; y = 62 + Math.sin(k * 7) * 5; }
            else { x = 192 + (k - 6.5) * 50; y = 62 - (k - 6.5) * 40; }
            const w = Math.floor(t * 20) % 2;
            R(x, y, 2, 1, '#d8ccb0'); R(x - 1 + w, y - 1 - w, 1, 1, '#c8bca0'); R(x + 2 - w, y - 1 - w, 1, 1, '#c8bca0');
          } });
        L.lampFlash = Math.max(L.lampFlash || 0, 0.4);
      } }
  ],
  2: [
    { id: 'continue', obj: 'bureau', name: 'CONTINUE?', area: [236, 80, 30, 22], foot: [226, 126, 56, 6],
      poke(L) {
        Sfx.blip();
        addFx(L, { update(dt) { const s = Math.floor(this.t); this.t += dt; if (Math.floor(this.t) !== s && this.t < 4) Sfx.blip(); if (Math.floor(this.t) === 4 && s === 3) Sfx.ok(); return this.t < 6.5; },
          draw(t) {
            R(240, 84, 22, 14, '#101820');
            if (this.t < 4) { txt('CONTINUE?', 251, 86, PAL.yellow, 'center', 4); txt(String(3 - Math.floor(this.t)), 251, 91, PAL.white, 'center', 5); }
            else { txt('2 PLAYERS', 251, 86, PAL.yellow, 'center', 4); miniHeart(246, 92, PAL.red); miniHeart(253, 92, PAL.red); }
          } });
      } }
  ],
  3: [
    { id: 'duif', name: 'Een verdwaalde duif', area: [94, 106, 16, 18], foot: [82, 114, 12, 12],
      poke(L) {
        Sfx.tone(420, 0.12, 'sine', 0.04); Sfx.tone(380, 0.16, 'sine', 0.04, null, 0.15);
        addFx(L, { update(dt) { this.t += dt; return this.t < 3; },
          draw(t) { drawBird(102 - this.t * 30, 110 - this.t * 40 + Math.sin(this.t * 8) * 2, t, PAL.g6); } });
        floatText(L, 102, 104, 'roekoe', PAL.g8);
      } },
    { id: 'bel', obj: 'fiets', name: 'Tring tring!', area: [110, 112, 30, 16], foot: [110, 128, 30, 4],
      poke(L) {
        Sfx.tone(2600, 0.08, 'triangle', 0.05); Sfx.tone(2600, 0.1, 'triangle', 0.05, null, 0.14);
        floatText(L, 126, 108, '♪ tring tring', PAL.yellow);
      } }
  ],
  4: [
    { id: 'eekhoorn', obj: 'boom', name: 'Een eekhoorntje in de linde', area: [60, 40, 22, 86], foot: [60, 126, 20, 6],
      poke(L) {
        Sfx.tone(1400, 0.04, 'square', 0.02); Sfx.tone(1700, 0.04, 'square', 0.02, null, 0.06);
        addFx(L, { update(dt) { this.t += dt; return this.t < 5; },
          draw(t) {
            const k = this.t;
            const y = k < 1.6 ? 124 - k * 40 : k < 3.6 ? 60 : 60 - (k - 3.6) * 50;
            const x = k < 3.6 ? 73 : 73 + (k - 3.6) * 25;
            const c = '#a0603a';
            R(x, y - 6, 3, 6, c); R(x - 1, y - 8, 3, 3, c); R(x - 2, y - 7, 1, 1, PAL.black);
            const sw = Math.floor(t * 6) % 2;
            R(x + 3, y - 9 + sw, 3, 7, '#b8704a'); R(x + 4, y - 10 + sw, 2, 1, '#b8704a');
            if (k > 1.6 && k < 3.6) R(x - 2, y - 4, 2, 2, '#7a5a3a'); // nootje
          } });
      } },
    { id: 'hinkel', name: 'Hinkelkampioen', area: null, foot: null, tick: true }
  ],
  5: [
    { id: 'opwind', name: 'Het opwindmuisje van Lien', area: [146, 184, 26, 14], foot: [144, 186, 28, 8],
      poke(L) {
        Sfx.noise(0.5, 0.02);
        addFx(L, { x: 160, dir: 1, update(dt) {
            this.t += dt; const sp = Math.max(0, 80 - this.t * 14);
            this.x += this.dir * sp * dt;
            if (this.x > 262) { this.dir = -1; Sfx.click(); } if (this.x < 40) { this.dir = 1; Sfx.click(); }
            return this.t < 7; },
          draw(t) { drawMouse(this.x, 194, this.dir, this.t < 5.7 ? t : 0, true); } });
        if (L.lien && !L.lien.hidden) { const e = L.lien.expr; L.lien.expr = 'laugh'; setTimeout(() => { if (L.lien.expr === 'laugh') L.lien.expr = e; }, 2500); }
      } }
  ],
  6: [
    { id: 'peertje', name: 'Het peertje wiebelt', area: [152, 6, 16, 20], foot: [146, 104, 28, 6],
      poke(L) { L.swing = 1; Sfx.click(); } }
  ],
  7: [
    { id: 'welkom', obj: 'muur', name: 'Welkom in alle talen', area: [112, 40, 86, 30], foot: [120, 104, 70, 6],
      poke(L) {
        const words = ['WELCOME', 'BIENVENUE', 'HOŞ GELDİN', 'WITAJ', 'BEM-VINDO', 'KARIBU', 'WELKOM'];
        const col = ['#b05048', '#d8b050', '#5a8ac0', '#6fa05f', PAL.orange, '#a070b0', PAL.white];
        addFx(L, { update(dt) { const a = Math.floor(this.t / 0.9); this.t += dt; if (Math.floor(this.t / 0.9) !== a) Sfx.blip(); return this.t < words.length * 0.9; },
          draw() { const i = Math.min(words.length - 1, Math.floor(this.t / 0.9)); R(114, 46, 82, 22, '#2c2a2a'); txt(words[i], 155, 52, col[i], 'center', 9); } });
      } }
  ],
  8: [
    { id: 'ster', name: 'Een vallende ster', area: [0, 0, 320, 48], foot: [6, 104, 308, 4],
      poke(L) {
        Sfx.tone(1568, 0.3, 'sine', 0.03); Sfx.tone(2093, 0.4, 'sine', 0.03, null, 0.12);
        const x0 = rnd(40, 200);
        addFx(L, { update(dt) { this.t += dt; return this.t < 1.2; },
          draw() {
            const k = this.t / 1.2, x = x0 + k * 90, y = 6 + k * 30;
            ctx.globalAlpha = 1 - k;
            for (let i = 0; i < 10; i++) R(x - i * 2, y - i * 0.66, 1, 1, i < 2 ? PAL.white : PAL.g8);
            ctx.globalAlpha = 1;
          } });
        if (L.fireLit) floatText(L, 160, 112, 'iedereen doet dezelfde wens', PAL.yellow);
      } }
  ]
};
/* het lichtje zelf (alle hoofdstukken) */
const SPIRIT_EGG = { id: 'lichtje', name: 'Het lichtje giechelt' };
const EGG_TOTAL = Object.keys(EGGS).reduce((n, k) => n + EGGS[k].length, 0) + 1;

function eggFound(L, e) {
  const key = e === SPIRIT_EGG ? 'lichtje' : 'h' + (L ? L.i + 1 : 0) + '_' + e.id;
  Save.data.eggs = Save.data.eggs || {};
  if (!Save.data.eggs[key]) {
    Save.data.eggs[key] = true; Save.store();
    const n = Object.keys(Save.data.eggs).length;
    Toast.show('Verrassing! ' + e.name + ' (' + n + '/' + EGG_TOTAL + ')', 3);
  }
}
function triggerEgg(L, e) {
  L.eggLast = L.eggLast || {};
  if (L.eggLast[e.id] !== undefined && L.t - L.eggLast[e.id] < 1.2) return;
  L.eggLast[e.id] = L.t;
  e.poke(L);
  eggFound(L, e);
}
function eggsOf(L) { return L ? (EGGS[L.i] || []) : []; }
function eggsActive() { return G.L && (G.state === 'EXPLORE' || (G.state === 'ACTION' && G.mg && G.mg.allowMove)) && !Dialog.active && !Menu.active; }

/* [Z] waar verder niets is: is er een verrassing vlakbij? */
function pokeEgg(L) {
  for (const e of eggsOf(L)) {
    if (!e.foot || !e.poke) continue;
    const [x, y, w, h] = e.foot;
    if (P.x > x - 6 && P.x < x + w + 6 && P.y > y - 6 && P.y < y + h + 8) { triggerEgg(L, e); return true; }
  }
  return false;
}
/* wie een object een tweede keer bekijkt, ontdekt de verrassing die eraan vastzit */
function eggFromObj(L, o) {
  if ((o.n || 0) < 2) return;
  const e = eggsOf(L).find(e => e.obj === o.id);
  if (e) triggerEgg(L, e);
}
/* klik/tik op het canvas (logische coördinaten) */
function clickEgg(lx, ly) {
  if (!eggsActive()) return;
  const L = G.L;
  if (Math.abs(lx - P.x) < 7 && ly > P.y - 16 && ly < P.y + 2) { spiritGiggle(L); return; }
  for (const e of eggsOf(L)) {
    if (!e.area || !e.poke) continue;
    const [x, y, w, h] = e.area;
    if (lx >= x && lx <= x + w && ly >= y && ly <= y + h) { triggerEgg(L, e); return; }
  }
}
function spiritGiggle(L) {
  P.hop = 0.5;
  Sfx.tone(880, 0.06, 'triangle', 0.04); Sfx.tone(1175, 0.06, 'triangle', 0.04, null, 0.07); Sfx.tone(1568, 0.08, 'triangle', 0.04, null, 0.14);
  for (let i = 0; i < 3; i++) addFx(L, { x: P.x - 4 + i * 4, update(dt) { this.t += dt; return this.t < 1.2; },
    draw() { ctx.globalAlpha = 1 - this.t / 1.2; miniHeart(this.x, P.y - 18 - this.t * 14 - i * 2, PAL.red); ctx.globalAlpha = 1; } });
  eggFound(L, SPIRIT_EGG);
}

/* elke frame: effecten, hinkelen, wiebelend peertje */
function eggsUpdate(L, dt) {
  if (L.fx) L.fx = L.fx.filter(f => f.update(dt) !== false);
  if (P.hop > 0) P.hop = Math.max(0, P.hop - dt);
  if (L.swing > 0) L.swing = Math.max(0, L.swing - dt * 0.25);
  if (L.i === 4 && G.state === 'EXPLORE') {
    // hinkelpad: vakjes 1 t/m 5 op de speelplaats, in volgorde
    const box = Math.floor((P.x - 30) / 13);
    const inBox = P.y > 180 && P.y < 194 && box >= 0 && box < 5 && (P.x - 30) % 13 < 12 ? box : -1;
    if (inBox !== L.hopLast) {
      L.hopLast = inBox;
      if (inBox >= 0) {
        if (inBox === (L.hop || 0)) { L.hop = (L.hop || 0) + 1; Sfx.tone(523 + inBox * 110, 0.08, 'square', 0.03); }
        else L.hop = inBox === 0 ? 1 : 0;
        if (L.hop === 5) { L.hop = 0; sparkle(L, 62, 184, 14); floatText(L, 62, 172, 'HINKELKAMPIOEN!', PAL.yellow); Sfx.warm(); eggFound(L, EGGS[4][1]); }
      }
    }
  }
}
function eggsDraw(L, t) { if (L.fx) L.fx.forEach(f => f.draw(t)); }
