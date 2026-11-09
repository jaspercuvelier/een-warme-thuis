'use strict';
/* =========================================================
   common.js — hulpjes voor levels: lopende personages, deuren
   ========================================================= */

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function moveTo(o, tx, ty, sp, dt) {
  const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
  if (d < 0.8) { o.x = tx; o.y = ty; return true; }
  const s = Math.min(d, sp * dt);
  o.x += dx / d * s; o.y += dy / d * s;
  if (Math.abs(dx) > 0.4) o.dir = dx > 0 ? 1 : -1;
  return false;
}
function animWalk(o, dt) { o.ft = (o.ft || 0) + dt; if (o.ft > 0.2) { o.ft = 0; o.walk = o.walk ? 0 : 1; } }

/* ---------- Personages (NPC's) ---------- */
function makeNPC(o) {
  return Object.assign({ x: 0, y: 0, dir: 1, walk: 0, ft: 0, path: [], speed: 32, moving: false, sit: false, floor: false, hidden: false, look: {} }, o);
}
/* stuur een personage langs punten: go(n, [[x,y],[x,y]], snelheid) */
function go(n, pts, speed) {
  n.path = pts.map(p => ({ x: p[0], y: p[1] }));
  if (speed) n.speed = speed;
  n.sit = false; n.floor = false;
}
function arrived(n) { return !n.path.length; }
function npcUpdate(n, dt) {
  if (n.path.length) {
    const t = n.path[0];
    if (moveTo(n, t.x, t.y, n.speed, dt)) {
      n.path.shift();
      if (!n.path.length) {
        if (n.endDir) { n.dir = n.endDir; n.endDir = 0; }
        if (n.onArrive) { const f = n.onArrive; n.onArrive = null; f(); }
      }
    }
    n.moving = true; animWalk(n, dt);
  } else n.moving = false;
}
function drawNPC(n) {
  if (n.hidden) return;
  if (n.alpha !== undefined && n.alpha < 1) ctx.globalAlpha = Math.max(0, n.alpha);
  drawPerson(n.x, n.y, Object.assign({}, n.look, {
    dir: n.dir, moving: n.moving, walk: n.walk, sit: n.sit, floor: n.floor, back: n.back,
    expr: n.expr || n.look.expr, arm: n.arm !== undefined ? n.arm : n.look.arm
  }));
  ctx.globalAlpha = 1;
  if (n.extra) n.extra(n);
}
/* koppel een personage aan een onderzoekbaar object in het level */
function npcObj(L, n, o) {
  const ob = Object.assign({ w: 12, h: 5, solid: true }, o);
  ob.npc = n;
  ob.draw = o.draw || (() => drawNPC(n));
  ob.sync = () => {
    ob.x = n.x - 6; ob.y = n.y - 4;
    ob.top = n.y - personHeight(Object.assign({}, n.look, { sit: n.sit, floor: n.floor })) - 7;
    ob.hidden = n.hidden || !!ob.off;
    ob.sortY = n.y + (n.sortBias || 0);
  };
  ob.sync();
  L.objs.push(ob);
  (L.npcs || (L.npcs = [])).push(ob);
  return ob;
}
/* wacht-stap voor in een dialoog: { wait: () => klaar? } */
function waitArrive(...ns) { return { wait: () => ns.every(arrived), max: 14 }; }
function waitFor(fn, max) { return { wait: fn, max: max || 10 }; }
function pause(s) { return { wait: s }; }

/* ---------- Herinnering (glinsterend) ---------- */
function memObj(L, idx, x, y, w, h, drawFn, gx, gy) {
  const o = {
    id: 'mem', x, y, w, h, top: (gy || y) - 14,
    draw: (L, t, o) => { if (drawFn) drawFn(t); if (!o.hidden) drawGlint(gx || x + w / 2, gy || y - 6, t); },
    inspect: (L, o) => memory(L, idx, o)
  };
  L.objs.push(o);
  return o;
}
/* Eenvoudig object (alleen tekst) */
function lookObj(L, id, x, y, w, h, top, lines, extra) {
  const o = Object.assign({ id, x, y, w, h, top, inspect: (L, ob) => say(typeof lines === 'function' ? lines(L, ob) : lines) }, extra || {});
  L.objs.push(o);
  return o;
}
