'use strict';
/* =========================================================
   decor.js — kamers, deuren, meubels, gevels en straatdetails
   ========================================================= */

/* ---------- Basis-texturen ---------- */
function brickWall(x, y, w, h, c1, c2) {
  R(x, y, w, h, c1);
  for (let j = 0; j < h; j += 6) {
    R(x, y + j, w, 1, c2);
    const off = (j / 6) % 2 ? 0 : 6;
    for (let i = off; i < w; i += 12) R(x + i, y + j, 1, 6, c2);
  }
  // hier en daar een donkerdere steen
  for (let k = 0; k < w * h / 900; k++) {
    const bx = x + ((k * 53) % Math.max(1, w - 12)), by = y + 1 + ((k * 31) % Math.max(1, h - 6)) - (((k * 31) % Math.max(1, h - 6)) % 6);
    R(bx + 1, by, 10, 5, shade(c1, 8));
  }
}
function floorBoards(x, y, w, h, c1, c2) {
  R(x, y, w, h, c1);
  for (let j = 0; j < h; j += 7) R(x, y + j, w, 1, c2);
  for (let j = 0; j < h; j += 7) for (let i = ((j / 7) % 3) * 17; i < w; i += 52) R(x + i, y + j, 1, 7, c2);
  for (let k = 0; k < w * h / 700; k++) R(x + (k * 71) % w, y + 3 + (k * 23) % h, 2, 1, shade(c1, 6));
}
function tiles(x, y, w, h, c1, c2, s) {
  s = s || 10;
  R(x, y, w, h, c1);
  for (let j = 0; j < h; j += s) R(x, y + j, w, 1, c2);
  for (let i = 0; i < w; i += s) R(x + i, y, 1, h, c2);
}
function cobbles(x, y, w, h, c1, c2) {
  R(x, y, w, h, c1);
  for (let j = 0; j < h; j += 5) {
    const off = (j / 5) % 2 ? 0 : 4;
    for (let i = off; i < w; i += 8) R(x + i, y + j, 6, 3, c2);
  }
}

/* ---------- Kamer-schil (Undertale-achtig: kamer zweeft in het zwart) ---------- */
function roomShell(o) {
  const x0 = 8, x1 = 312, top = 8, base = o.base || 104, bottom = 208;
  R(0, 0, W, H, PAL.black);
  R(x0, top, x1 - x0, base - top, o.wall);
  const p = o.wall2 || shade(o.wall, 8);
  if (o.pattern === 'stripes') for (let i = x0 + 4; i < x1; i += 12) R(i, top, 4, base - top, p);
  if (o.pattern === 'dots') for (let j = top + 6; j < base - 8; j += 10) for (let i = x0 + ((j / 10) % 2 ? 4 : 9); i < x1; i += 10) { R(i, j, 1, 1, p); R(i - 1, j + 1, 3, 1, p); R(i, j + 2, 1, 1, p); }
  if (o.pattern === 'diamond') for (let j = top + 4; j < base - 6; j += 8) for (let i = x0 + ((j / 8) % 2 ? 0 : 6); i < x1; i += 12) R(i, j, 2, 2, p);
  if (o.pattern === 'panel') { R(x0, base - 34, x1 - x0, 30, p); R(x0, base - 35, x1 - x0, 1, shade(o.wall, -10)); }
  if (o.pattern === 'peel') {
    for (let i = x0 + 4; i < x1; i += 14) R(i, top, 1, base - top, p);
    R(52, 20, 12, 8, shade(o.wall, -14)); R(54, 28, 6, 3, shade(o.wall, -14));
    R(286, 14, 14, 10, '#202a20'); R(290, 24, 8, 4, '#202a20'); R(298, 12, 6, 6, '#1d241d');
  }
  // plafondlijst en plint
  R(x0, top, x1 - x0, 2, o.trim || PAL.g5);
  R(x0, top + 2, x1 - x0, 1, shade(o.wall, 14));
  R(x0, base - 4, x1 - x0, 4, o.trim || PAL.g5);
  R(x0, base - 4, x1 - x0, 1, shade(o.trim || PAL.g5, -16));
  // vloer
  const f = o.floorC || PAL.g3, fl = o.floorL || PAL.g2;
  if (o.floor === 'tiles') tiles(x0, base, x1 - x0, bottom - base, f, fl, 12);
  else if (o.floor === 'carpet') { R(x0, base, x1 - x0, bottom - base, f); for (let k = 0; k < 160; k++) R(x0 + (k * 37) % (x1 - x0), base + (k * 19) % (bottom - base), 1, 1, fl); }
  else floorBoards(x0, base, x1 - x0, bottom - base, f, fl);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x0, base, x1 - x0, 3);
  // zijmuren en voorrand
  R(x0 - 4, top, 4, bottom - top + 4, shade(o.wall, 14));
  R(x1, top, 4, bottom - top + 4, shade(o.wall, 14));
  R(x0 - 4, bottom, x1 - x0 + 8, 4, shade(o.trim || PAL.g5, 10));
}

/* ---------- Deur in de achterwand ---------- */
function wallDoor(d, t) {
  const { x, w, h } = d, base = d.base || 104, y = base - h;
  R(x - 3, y - 3, w + 6, h + 3, d.frame || PAL.g6);
  R(x - 3, y - 3, w + 6, 1, shade(d.frame || PAL.g6, -20));
  // opening: buiten
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  R(x, y, w, h, d.outside || '#0b0f16');
  if (d.drawOutside) d.drawOutside(x, y, w, h, t);
  else {
    R(x, y + h - 10, w, 10, PAL.g3);
    for (let i = 0; i < 6; i++) R(x + ((i * 7 + t * 3) % w), y + ((i * 11 + t * 14) % (h - 10)), 1, 1, PAL.g9);
  }
  if (d.lightIn && d.open > 0.05) glow(x + w / 2, y + h / 2, w * 1.2, '255,200,120', 0.3 * d.open);
  ctx.restore();
  // deurblad draait open (steeds smaller)
  const lw = Math.max(2, Math.round(w * (1 - 0.82 * d.open)));
  const c = d.color || PAL.g5, cd = shade(c, 16);
  const lx = d.hinge === 'right' ? x + w - lw : x;
  R(lx, y, lw, h, c);
  if (lw > 8) {
    R(lx + 3, y + 4, lw - 6, h * 0.38, cd); R(lx + 4, y + 5, lw - 8, h * 0.38 - 2, c);
    R(lx + 3, y + h * 0.5, lw - 6, h * 0.42, cd); R(lx + 4, y + h * 0.5 + 1, lw - 8, h * 0.42 - 2, c);
    const kx = d.hinge === 'right' ? lx + 2 : lx + lw - 4;
    R(kx, y + h * 0.5 - 2, 2, 3, PAL.g8);
    if (d.letterbox) R(lx + lw / 2 - 5, y + h * 0.62, 10, 3, d.lbOpen ? PAL.g1 : PAL.g7);
  } else R(lx, y, lw, h, shade(c, -10));
  if (d.number) txt(d.number, x + w / 2, y - 11, PAL.g8, 'center', 6);
  // deurmat
  R(x - 1, base + 1, w + 2, 5, d.mat || '#3a3028');
  R(x, base + 2, w, 3, shade(d.mat || '#3a3028', -8));
}
function doorUpdate(d, dt) {
  const prev = d.open;
  d.open += clamp(d.target - d.open, -dt * 1.4, dt * 1.4);
  if (prev === 0 && d.open > 0) Sfx.tone(180, 0.25, 'triangle', 0.04, 120);
}

/* ---------- Ramen ---------- */
function winFrame(x, y, w, h, o) {
  o = o || {};
  R(x - 3, y - 3, w + 6, h + 6, o.frame || PAL.g6);
  R(x - 2, y - 2, w + 4, h + 4, shade(o.frame || PAL.g6, 10));
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  R(x, y, w, h, o.lit ? PAL.warm : (o.sky || '#0b0f16'));
  if (o.lit) glow(x + w / 2, y + h / 2, Math.max(w, h), '255,200,110', 0.3);
  if (o.outside) o.outside(x, y, w, h);
  ctx.restore();
  R(x + Math.floor(w / 2), y, 1, h, o.frame || PAL.g6);
  if (h > 14) R(x, y + Math.floor(h / 2), w, 1, o.frame || PAL.g6);
  R(x + 2, y + 2, 1, 3, 'rgba(255,255,255,0.25)');
  if (o.sill !== false) { R(x - 5, y + h + 3, w + 10, 3, o.sillC || PAL.g7); R(x - 5, y + h + 6, w + 10, 1, PAL.g4); }
  if (o.snow) R(x - 4, y + h + 2, w + 8, 1, PAL.g9);
}
function curtain(x, y, w, h, c, flap) {
  flap = flap || 0;
  R(x - 2, y - 3, w + 4, 2, PAL.g6);
  for (let j = 0; j < h; j += 4) {
    const off = Math.round(flap * (j / h));
    R(x + off, y + j, w, 4, c);
    for (let i = 2; i < w; i += 4) R(x + off + i, y + j, 1, 4, shade(c, 14));
  }
}

/* ---------- Wanddecor ---------- */
function frameArt(x, y, w, h, inner, fc) {
  R(x, y, w, h, fc || '#5a4a3a'); R(x + 1, y + 1, w - 2, h - 2, shade(fc || '#5a4a3a', -12));
  R(x + 2, y + 2, w - 4, h - 4, PAL.g8);
  if (inner) { ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, w - 4, h - 4); ctx.clip(); inner(x + 2, y + 2, w - 4, h - 4); ctx.restore(); }
}
function wallClock(x, y, t) {
  R(x - 6, y - 6, 12, 12, PAL.g6); R(x - 5, y - 5, 10, 10, PAL.g9);
  R(x - 4, y - 7, 8, 1, PAL.g6); R(x - 4, y + 6, 8, 1, PAL.g6);
  const a = t * 0.05, b = t * 0.6;
  for (let i = 0; i < 4; i++) R(x + Math.round(Math.cos(a) * i), y + Math.round(Math.sin(a) * i), 1, 1, PAL.g2);
  for (let i = 0; i < 4; i++) R(x + Math.round(Math.cos(b) * i), y + Math.round(Math.sin(b) * i), 1, 1, PAL.red);
}
function pendulumClock(x, y, t) {
  R(x - 7, y, 14, 40, '#4a3a2c'); R(x - 6, y + 1, 12, 38, '#3a2c20');
  R(x - 5, y + 2, 10, 10, PAL.g9);
  const a = t * 0.08;
  for (let i = 0; i < 4; i++) R(x + Math.round(Math.cos(a) * i), y + 7 + Math.round(Math.sin(a) * i), 1, 1, PAL.g2);
  R(x - 4, y + 15, 8, 20, '#1e1610');
  const sw = Math.sin(t * 3) * 3;
  R(x + sw * 0.5, y + 15, 1, 14, PAL.warm); R(x - 1 + sw, y + 28, 3, 3, PAL.warm);
}
function shelf(x, y, w, items) {
  R(x, y, w, 2, '#5a4a3a'); R(x + 2, y + 2, 2, 3, PAL.g4); R(x + w - 4, y + 2, 2, 3, PAL.g4);
  let cx = x + 2;
  (items || []).forEach(it => {
    if (it === 'book') { R(cx, y - 8, 3, 8, PAL.g6); cx += 3; R(cx, y - 7, 2, 7, PAL.g5); cx += 3; }
    else if (it === 'vase') { R(cx, y - 6, 4, 6, PAL.g7); R(cx + 1, y - 9, 2, 3, '#7fb069'); cx += 6; }
    else if (it === 'cup') { R(cx, y - 4, 4, 4, PAL.g9); R(cx + 4, y - 3, 1, 2, PAL.g9); cx += 7; }
    else if (it === 'photo') { R(cx, y - 7, 6, 7, PAL.g6); R(cx + 1, y - 6, 4, 4, PAL.g8); cx += 8; }
    else if (it === 'candle') { R(cx, y - 5, 2, 5, PAL.g9); R(cx, y - 7, 2, 2, PAL.yellow); cx += 5; }
    else if (it === 'trophy') { R(cx, y - 7, 4, 3, PAL.yellow); R(cx + 1, y - 4, 2, 2, PAL.yellow); R(cx, y - 2, 4, 2, PAL.g5); cx += 6; }
    else if (it === 'radio') { R(cx, y - 6, 10, 6, PAL.g5); R(cx + 1, y - 5, 4, 4, PAL.g3); R(cx + 7, y - 4, 2, 2, PAL.g8); cx += 12; }
    else cx += 4;
  });
}
function radiator(x, y, w, h, warm) {
  R(x, y, w, h, warm ? '#8a6a5a' : PAL.g6);
  for (let i = 2; i < w - 1; i += 3) R(x + i, y + 1, 1, h - 2, warm ? '#6a4a3a' : PAL.g5);
  R(x - 1, y + h - 2, 2, 2, PAL.g5); R(x + w - 1, y + h - 2, 2, 2, PAL.g5);
  if (warm) glow(x + w / 2, y + h / 2, w, '255,150,70', 0.35);
}
function outlet(x, y) { R(x, y, 4, 5, PAL.g8); R(x + 1, y + 1, 1, 1, PAL.g4); R(x + 2, y + 3, 1, 1, PAL.g4); }
function lightSwitch(x, y) { R(x, y, 4, 6, PAL.g8); R(x + 1, y + 2, 2, 2, PAL.g6); }

/* ---------- Meubels (zijaanzicht, voeten op y) ---------- */
function rug(x, y, w, h, c1, c2) {
  R(x, y, w, h, c1); R(x + 2, y + 2, w - 4, h - 4, c2); R(x + 4, y + 4, w - 8, h - 8, c1);
  for (let i = x; i < x + w; i += 3) { R(i, y - 1, 1, 1, c2); R(i, y + h, 1, 1, c2); }
}
function table(x, y, w, c, cloth) {
  c = c || '#5a4a3a';
  R(x, y - 15, w, 3, c); R(x, y - 12, w, 1, shade(c));
  R(x + 2, y - 12, 2, 12, shade(c)); R(x + w - 4, y - 12, 2, 12, shade(c));
  if (cloth) { R(x - 1, y - 16, w + 2, 2, cloth); R(x - 1, y - 14, 3, 6, cloth); R(x + w - 2, y - 14, 3, 6, cloth); }
}
function chair(x, y, dir, c) {
  c = c || '#5a4a3a';
  R(x - 5, y - 9, 11, 2, c);
  R(x - 4, y - 7, 2, 7, shade(c)); R(x + 3, y - 7, 2, 7, shade(c));
  const bx = dir > 0 ? x - 6 : x + 4;
  R(bx, y - 22, 2, 15, c); R(bx, y - 22, 2, 2, shade(c, -12));
  R(dir > 0 ? bx : bx - 4, y - 20, 6, 2, c);
}
function armchairBack(x, y, c) {
  // leunstoel gezien van achteren (rug naar ons)
  R(x - 12, y - 28, 24, 22, c); R(x - 11, y - 28, 22, 1, shade(c, -16));
  R(x - 14, y - 16, 4, 14, shade(c)); R(x + 10, y - 16, 4, 14, shade(c));
  R(x - 12, y - 6, 24, 4, shade(c, 12));
  R(x - 11, y - 2, 2, 2, PAL.g2); R(x + 9, y - 2, 2, 2, PAL.g2);
  for (let i = -9; i < 10; i += 6) R(x + i, y - 24, 1, 16, shade(c, 10));
}
function sofa(x, y, w, c) {
  R(x, y - 22, w, 10, c); R(x, y - 22, w, 1, shade(c, -14));
  R(x, y - 12, w, 8, shade(c, -6));
  R(x - 4, y - 16, 5, 13, shade(c)); R(x + w - 1, y - 16, 5, 13, shade(c));
  R(x + w / 2, y - 12, 1, 7, shade(c, 12));
  R(x + 1, y - 3, 3, 3, PAL.g2); R(x + w - 4, y - 3, 3, 3, PAL.g2);
}
function bookcase(x, y, w, h, wood) {
  wood = wood || '#4a3a2c';
  R(x, y - h, w, h, wood); R(x + 2, y - h + 2, w - 4, h - 4, '#1e1812');
  const shelves = Math.floor((h - 4) / 13);
  const cols = [PAL.g6, PAL.g7, PAL.g5, PAL.g8, '#6a5a4a', '#5a6a7a', PAL.g4];
  for (let s = 0; s < shelves; s++) {
    const sy = y - h + 2 + s * 13;
    R(x + 2, sy + 11, w - 4, 2, wood);
    let bx = x + 3, k = s * 3;
    while (bx < x + w - 5) {
      const bw = 2 + (k % 3 === 0 ? 1 : 0), bh = 7 + (k % 4 === 1 ? 2 : k % 5 === 2 ? -1 : 0);
      R(bx, sy + 11 - bh, bw, bh, cols[k % cols.length]);
      bx += bw + (k % 6 === 5 ? 2 : 0); k++;
    }
  }
}
function plant(x, y, s, droop) {
  s = s || 1;
  R(x - 4, y - 7, 8, 7, '#6a4a3a'); R(x - 5, y - 8, 10, 2, '#7a5a4a');
  const g = droop ? '#5a6a4a' : '#6fa05f', g2 = droop ? '#4a5a3c' : '#4f8a4a';
  if (droop) {
    R(x - 1, y - 14, 2, 6, g2); R(x - 6, y - 13, 5, 2, g); R(x + 1, y - 12, 6, 2, g); R(x - 7, y - 11, 2, 3, g); R(x + 6, y - 10, 2, 3, g);
  } else {
    for (let i = 0; i < 5 * s; i++) {
      const a = -Math.PI / 2 + (i - 2 * s) * 0.45;
      for (let r = 2; r < 10 * s; r++) R(x + Math.cos(a) * r, y - 8 + Math.sin(a) * r, 2, 1, r % 3 ? g : g2);
    }
  }
}
function floorLamp(x, y, on) {
  R(x - 4, y - 2, 8, 2, PAL.g5); R(x, y - 36, 1, 34, PAL.g5);
  R(x - 6, y - 44, 13, 8, on ? PAL.yellow : PAL.g7); R(x - 5, y - 45, 11, 1, on ? PAL.yellow : PAL.g7);
  if (on) glow(x, y - 38, 44, '255,220,140', 0.3);
}
function coatRack(x, y, coats) {
  R(x - 4, y - 2, 9, 2, '#4a3a2c'); R(x, y - 44, 2, 42, '#4a3a2c'); R(x - 4, y - 44, 10, 2, '#4a3a2c');
  (coats || []).forEach((c, i) => {
    const cx = x - 6 + i * 7;
    R(cx, y - 42, 6, 16, c); R(cx + 1, y - 26, 4, 3, shade(c));
    if (c === 'hat') { }
  });
}
function hat(x, y, c) { R(x - 5, y, 11, 2, c); R(x - 3, y - 4, 7, 4, c); R(x - 3, y - 2, 7, 1, PAL.red); }
function box3(x, y, w, h, label) {
  R(x, y - h, w, h, '#8a7458'); R(x, y - h, w, 2, '#9a8468'); R(x + w / 2 - 1, y - h, 2, h, '#6a5640');
  R(x, y - h, 1, h, '#6a5640');
  if (label) txt(label, x + w / 2 + 3, y - h + 4, PAL.g2, 'left', 5);
}
function bin(x, y, c) {
  c = c || PAL.g5;
  R(x - 6, y - 16, 12, 16, c); R(x - 7, y - 18, 14, 3, shade(c, -10));
  for (let i = -4; i < 5; i += 3) R(x + i, y - 14, 1, 12, shade(c));
}
function bench(x, y, w, c) {
  c = c || '#5a4a3a';
  R(x, y - 9, w, 3, c); R(x, y - 6, w, 1, shade(c));
  R(x, y - 20, w, 2, c); R(x, y - 16, w, 2, c);
  R(x + 2, y - 20, 2, 20, PAL.g4); R(x + w - 4, y - 20, 2, 20, PAL.g4);
}
function bike(x, y) {
  ctx.strokeStyle = PAL.g6; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x - 8, y - 6, 5.5, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 9, y - 6, 5.5, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 8, y - 6); ctx.lineTo(x, y - 6); ctx.lineTo(x + 5, y - 13); ctx.lineTo(x - 3, y - 13); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 9, y - 6); ctx.lineTo(x + 5, y - 15); ctx.stroke();
  R(x - 4, y - 15, 4, 1, PAL.g4); R(x + 4, y - 16, 4, 1, PAL.g4);
}
function bareTree(x, y, h, snow) {
  R(x - 2, y - h, 5, h, '#3a2e24'); R(x - 3, y - 4, 7, 4, '#3a2e24');
  const br = [[-1, 0.45, -12], [1, 0.55, 14], [-1, 0.7, -9], [1, 0.8, 8], [-1, 0.9, -5]];
  br.forEach(b => {
    const by = y - h * b[1];
    for (let i = 0; i < Math.abs(b[2]); i++) R(x + Math.sign(b[2]) * i, by - i * 0.7, 2, 1, '#3a2e24');
    if (snow) R(x + b[2] - Math.sign(b[2]) * 3, by - Math.abs(b[2]) * 0.7 - 1, 4, 1, PAL.g9);
  });
  R(x, y - h - 6, 1, 6, '#3a2e24');
}
function fenceH(x0, x1, y, h, c) {
  c = c || PAL.g5;
  R(x0, y - h, x1 - x0, 1, c); R(x0, y - h / 2, x1 - x0, 1, c);
  for (let i = x0; i < x1; i += 4) R(i, y - h, 1, h, c);
}
function snowLedge(x, y, w) { R(x, y, w, 2, PAL.g9); for (let i = x; i < x + w; i += 5) R(i + 1, y + 2, 2, 1, PAL.g8); }
function drainpipe(x, y0, y1) { R(x, y0, 3, y1 - y0, PAL.g5); for (let j = y0 + 8; j < y1; j += 16) R(x - 1, j, 5, 2, PAL.g6); R(x - 2, y1 - 3, 7, 3, PAL.g5); }
function puddle(x, y, w, lit) { R(x, y, w, 3, '#1c222a'); R(x + 2, y + 1, w - 4, 1, lit ? '#6a5a3a' : '#2c3440'); }

/* ---------- Gevels / buitenkant ---------- */
function facade(x, y, w, h, o) {
  o = o || {};
  if (o.brick) brickWall(x, y, w, h, o.c || PAL.g2, o.c2 || PAL.g1); else R(x, y, w, h, o.c || PAL.g2);
  R(x, y, w, 3, shade(o.c || PAL.g2, -14));
  const cols = o.cols || Math.floor(w / 26), rows = o.rows || 2;
  const lit = o.lit || [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wx = x + 8 + i * (w - 16) / cols, wy = y + 10 + j * 30;
    const on = lit.indexOf(j * cols + i) >= 0;
    winFrame(Math.round(wx), wy, 14, 16, { lit: on, snow: o.snow, sky: '#0d0d10', frame: PAL.g5 });
    if (!on && o.curtains) { R(Math.round(wx), wy, 5, 16, PAL.g3); R(Math.round(wx) + 9, wy, 5, 16, PAL.g3); }
  }
}
function lampPost(x, y, on, t) {
  R(x - 2, y - 3, 6, 3, PAL.g4);
  R(x, y - 64, 2, 62, PAL.g5);
  R(x - 5, y - 70, 12, 3, PAL.g6); R(x - 3, y - 67, 8, 3, PAL.g5);
  if (on) {
    const f = on === 'flicker' ? (Math.sin(t * 13) > 0.7 ? 0.15 : 1) : (typeof on === 'number' ? on : 1);
    R(x - 3, y - 64, 8, 2, f > 0.5 ? PAL.yellow : PAL.g5);
    glow(x + 1, y - 60, 46, '255,220,140', 0.2 * f);
    ctx.fillStyle = 'rgba(255,220,140,' + (0.05 * f) + ')';
    ctx.beginPath(); ctx.moveTo(x - 3, y - 62); ctx.lineTo(x + 5, y - 62); ctx.lineTo(x + 26, y + 6); ctx.lineTo(x - 24, y + 6); ctx.fill();
  }
}
function house(x, y, w, h, lit, t) {
  R(x, y, w, h, PAL.g2);
  for (let i = 0; i < w / 2 + 1; i++) R(x + i, y - Math.min(i, w - i) * 0.6, 1, Math.min(i, w - i) * 0.6, PAL.g2);
  R(x + w * 0.65, y - h * 0.35, 4, h * 0.35, PAL.g2);
  let n = 0;
  for (let j = 0; j < 2; j++) for (let i = 0; i < Math.floor((w - 6) / 12); i++) {
    const on = n < lit;
    const wx = x + 6 + i * 12, wy = y + 6 + j * 14;
    R(wx, wy, 6, 7, on ? PAL.warm : PAL.g1);
    if (on) glow(wx + 3, wy + 3, 12, '255,200,110', 0.2);
    n++;
  }
}
function windowFrame(x, y, w, h, inside, lit) { winFrame(x, y, w, h, { lit, sky: inside, sill: false }); }
function tent(x, y, w, h, c, open, patch) {
  c = c || PAL.g5;
  for (let j = 0; j < h; j++) {
    const ww = Math.round(w * (j + 1) / h);
    R(x + (w - ww) / 2, y - h + j, ww, 1, j % 6 === 5 ? shade(c) : c);
  }
  R(x + w / 2 - 1, y - h - 3, 2, 3, PAL.g6);
  if (open) {
    const oh = Math.round(h * 0.65);
    for (let j = 0; j < oh; j++) { const ww = Math.round(w * 0.42 * (j + 1) / oh); R(x + (w - ww) / 2, y - oh + j, ww, 1, '#0c0c0c'); }
  }
  if (patch) R(x + w * 0.2, y - h * 0.4, 6, 5, shade(c, -18));
  R(x - 2, y - 1, 2, 2, PAL.g6); R(x + w, y - 1, 2, 2, PAL.g6);
  ctx.strokeStyle = PAL.g4; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x - 6, y); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w + 6, y); ctx.stroke();
}
function fireBasket(x, y, lit, t) {
  R(x - 9, y - 10, 18, 2, PAL.g6);
  R(x - 8, y - 8, 16, 6, PAL.g4);
  for (let i = -7; i < 8; i += 3) R(x + i, y - 8, 1, 6, PAL.g6);
  R(x - 6, y - 2, 2, 2, PAL.g5); R(x + 4, y - 2, 2, 2, PAL.g5);
  if (lit) {
    glow(x, y - 14, 70, '255,170,80', 0.28 + Math.sin(t * 9) * 0.03);
    for (let i = 0; i < 8; i++) {
      const fx = x - 7 + i * 2, fh = 5 + Math.abs(Math.sin(t * 8 + i * 1.7)) * 9;
      R(fx, y - 10 - fh, 2, fh, i % 2 ? PAL.orange : PAL.yellow);
    }
    R(x - 3, y - 18 - Math.abs(Math.sin(t * 6)) * 5, 6, 3, PAL.red);
    for (let i = 0; i < 3; i++) { const sp = (t * 0.7 + i * 0.33) % 1; R(x - 4 + i * 4 + Math.sin(t * 3 + i) * 3, y - 22 - sp * 26, 1, 1, sp < 0.5 ? PAL.yellow : PAL.orange); }
  } else {
    R(x - 6, y - 12, 12, 3, PAL.g3); R(x - 4, y - 14, 3, 2, PAL.g3);
  }
}
function log(x, y, w) { R(x, y - 5, w, 5, '#4a3a2c'); R(x, y - 5, w, 1, '#5a4a3a'); R(x + w - 3, y - 5, 3, 5, '#7a6a5a'); R(x + w - 2, y - 4, 1, 3, '#5a4a3a'); }
