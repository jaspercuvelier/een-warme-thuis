'use strict';
/* =========================================================
   closeups.js — ingezoomde momenten (gezichten, details)
   Elk paneel is een rooster van 60 x 42 "grote pixels".
   ========================================================= */

const Closeup = {
  id: null, t: 0, opts: {},
  show(id, opts) { this.id = id; this.t = 0; this.opts = opts || {}; Sfx.tone(523, 0.12, 'triangle', 0.03); Sfx.tone(784, 0.18, 'triangle', 0.03, null, 0.08); },
  hide() { this.id = null; },
  update(dt) { if (this.id) this.t += dt; },
  draw() {
    if (!this.id || !CLOSEUPS[this.id]) return;
    const a = Math.min(1, this.t * 5);
    const px = 68, py = 8, s = 3;
    ctx.globalAlpha = a;
    box(px, py, 60 * s + 4, 42 * s + 4, PAL.white, PAL.black, 1);
    ctx.save();
    ctx.translate(px + 2, py + 2);
    ctx.scale(s, s);
    ctx.beginPath(); ctx.rect(0, 0, 60, 42); ctx.clip();
    try { CLOSEUPS[this.id](this.t, this.opts); } catch (e) { console.error(e); }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
};
function cu(id, opts) { return () => Closeup.show(id, opts); }
function cuOff() { Closeup.hide(); }

/* Uitdrukking op tijdstip t: expr mag een string zijn of [[tijd, expr], ...] */
function exprAt(e, t) {
  if (!Array.isArray(e)) return e || 'neutral';
  let cur = e[0][1];
  e.forEach(k => { if (t >= k[0]) cur = k[1]; });
  return cur;
}

/* Groot gezicht. cx = midden, cy = bovenkant hoofd */
function bigFace(cx, cy, t, o) {
  const skin = o.skin || '#dcc4ac', sd = shade(skin, 30), hair = o.hair || PAL.g3;
  const coat = o.coat || PAL.g5, expr = exprAt(o.expr, t);
  const dk = '#161616';
  // schouders
  R(cx - 22, cy + 27, 44, 20, coat);
  R(cx - 20, cy + 26, 40, 2, coat);
  R(cx - 22, cy + 30, 3, 14, shade(coat)); R(cx + 19, cy + 30, 3, 14, shade(coat));
  if (o.stripes) for (let j = cy + 31; j < 42; j += 4) R(cx - 22, j, 44, 2, o.stripes);
  if (o.scarf) { R(cx - 10, cy + 24, 20, 5, o.scarf); R(cx + 3, cy + 28, 5, 9, o.scarf); }
  if (o.vest) { R(cx - 22, cy + 32, 44, 3, o.vest); R(cx - 22, cy + 38, 44, 3, o.vest); }
  // achterhaar / kap
  if (o.style === 'hood') { R(cx - 15, cy - 4, 30, 32, coat); R(cx - 15, cy - 4, 30, 2, shade(coat, -12)); }
  if (o.style === 'hijab') { R(cx - 15, cy - 4, 30, 34, o.capC || PAL.g7); R(cx - 15, cy - 4, 30, 2, shade(o.capC || PAL.g7, -12)); }
  if (o.style === 'long' || o.style === 'curly-long') R(cx - 14, cy, 28, 28, hair);
  if (o.style === 'bun') R(cx - 5, cy - 6, 10, 6, hair);
  // nek (bij hoofddoek/kap bedekt)
  if (o.style !== 'hood' && o.style !== 'hijab') { R(cx - 4, cy + 20, 8, 8, skin); R(cx - 4, cy + 22, 8, 2, sd); R(cx - 5, cy + 26, 10, 1, shade(coat, 14)); }
  // hoofd
  R(cx - 10, cy + 1, 20, 21, skin); R(cx - 9, cy, 18, 23, skin); R(cx - 11, cy + 4, 22, 14, skin);
  R(cx - 12, cy + 9, 2, 5, skin); R(cx + 10, cy + 9, 2, 5, skin);
  R(cx - 12, cy + 10, 1, 3, sd); R(cx + 11, cy + 10, 1, 3, sd);
  // haar vooraan
  switch (o.style) {
    case 'bald': R(cx - 12, cy + 4, 3, 7, hair); R(cx + 9, cy + 4, 3, 7, hair); R(cx - 4, cy + 1, 8, 1, shade(skin, -10)); break;
    case 'hood': R(cx - 12, cy - 2, 24, 4, coat); R(cx - 13, cy, 3, 24, coat); R(cx + 10, cy, 3, 24, coat); break;
    case 'hijab': R(cx - 12, cy - 2, 24, 4, o.capC || PAL.g7); R(cx - 13, cy, 3, 26, o.capC || PAL.g7); R(cx + 10, cy, 3, 26, o.capC || PAL.g7); if (o.trim) R(cx - 12, cy + 1, 24, 1, o.trim); break;
    case 'beanie': R(cx - 12, cy - 4, 24, 8, o.capC || PAL.g4); R(cx - 12, cy + 2, 24, 2, shade(o.capC || PAL.g4)); R(cx - 2, cy - 7, 4, 3, o.capC || PAL.g4); for (let i = -11; i < 12; i += 3) R(cx + i, cy - 3, 1, 5, shade(o.capC || PAL.g4)); break;
    case 'curly': case 'curly-long': R(cx - 12, cy - 3, 24, 6, hair); for (let i = -12; i < 12; i += 3) { R(cx + i, cy - 4, 2, 2, hair); R(cx + i + 1, cy + 3, 2, 2, hair); } R(cx - 12, cy, 3, 10, hair); R(cx + 9, cy, 3, 10, hair); break;
    case 'spiky': R(cx - 11, cy - 2, 22, 5, hair); for (let i = -10; i < 11; i += 3) R(cx + i, cy - 4, 2, 2, hair); R(cx - 12, cy + 1, 2, 6, hair); R(cx + 10, cy + 1, 2, 6, hair); break;
    case 'long': R(cx - 11, cy - 2, 22, 5, hair); R(cx - 12, cy, 4, 14, hair); R(cx + 8, cy, 4, 14, hair); R(cx - 3, cy + 1, 7, 3, hair); break;
    case 'bun': R(cx - 11, cy - 2, 22, 5, hair); R(cx - 12, cy, 3, 9, hair); R(cx + 9, cy, 3, 9, hair); break;
    default: R(cx - 11, cy - 2, 22, 5, hair); R(cx - 12, cy, 3, 8, hair); R(cx + 9, cy, 3, 8, hair); R(cx - 5, cy + 2, 6, 2, hair);
  }
  if (o.wrinkles) { R(cx - 6, cy + 5, 12, 1, sd); R(cx - 4, cy + 7, 8, 1, sd); R(cx - 11, cy + 13, 1, 2, sd); R(cx + 10, cy + 13, 1, 2, sd); }
  // ogen
  const ey = cy + 10, exL = cx - 7, exR = cx + 4;
  const look = o.look || 0;
  const blink = (t % 3.3) < 0.1;
  const eye = (ex) => {
    if (expr === 'laugh' || expr === 'closed' || blink) {
      R(ex - 1, ey + 2, 1, 1, dk); R(ex, ey + 1, 3, 1, dk); R(ex + 3, ey + 2, 1, 1, dk);
    } else if (expr === 'surprised') {
      R(ex, ey - 1, 3, 4, PAL.white); R(ex + 1 + Math.max(0, look), ey, 1, 2, dk);
    } else {
      R(ex, ey, 3, 3, PAL.white); R(ex + 1 + look, ey, 2, 3, dk); R(ex + 1 + look, ey, 1, 1, PAL.white);
      if (expr === 'happy' || expr === 'tearsmile') R(ex, ey + 3, 3, 1, sd);
    }
  };
  eye(exL); eye(exR);
  // wenkbrauwen
  const bc = o.brow || shade(hair, -10);
  if (expr === 'sad' || expr === 'worried' || expr === 'tearsmile') { R(exL - 1, ey - 2, 2, 1, bc); R(exL + 1, ey - 3, 3, 1, bc); R(exR, ey - 3, 3, 1, bc); R(exR + 3, ey - 2, 2, 1, bc); }
  else if (expr === 'determined') { R(exL - 1, ey - 3, 2, 1, bc); R(exL + 1, ey - 2, 3, 1, bc); R(exR, ey - 2, 3, 1, bc); R(exR + 3, ey - 3, 2, 1, bc); }
  else if (expr === 'surprised') { R(exL, ey - 4, 3, 1, bc); R(exR, ey - 4, 3, 1, bc); }
  else { R(exL, ey - 3, 3, 1, bc); R(exR, ey - 3, 3, 1, bc); }
  if (o.glasses) {
    ctx.strokeStyle = PAL.g2; ctx.lineWidth = 1;
    ctx.strokeRect(exL - 1.5, ey - 1.5, 6, 6); ctx.strokeRect(exR - 1.5, ey - 1.5, 6, 6);
    R(exL + 4, ey, 4, 1, PAL.g2);
    R(exL - 1, ey - 1, 1, 1, 'rgba(255,255,255,0.4)'); R(exR - 1, ey - 1, 1, 1, 'rgba(255,255,255,0.4)');
  }
  // neus
  R(cx - 1, cy + 14, 2, 2, sd); R(cx - 2, cy + 15, 1, 1, sd);
  // baard
  if (o.beard) for (let j = cy + 16; j < cy + 23; j += 2) for (let i = cx - 9 + (j % 4 ? 1 : 0); i < cx + 9; i += 2) R(i, j, 1, 1, o.beard);
  // mond
  const my = cy + 18;
  switch (expr) {
    case 'happy': case 'tearsmile': R(cx - 3, my, 6, 1, MOUTH); R(cx - 4, my - 1, 1, 1, MOUTH); R(cx + 3, my - 1, 1, 1, MOUTH); break;
    case 'laugh': R(cx - 4, my - 1, 8, 4, MOUTH); R(cx - 3, my - 1, 6, 1, PAL.white); R(cx - 2, my + 2, 4, 1, '#c06060'); break;
    case 'sad': R(cx - 3, my, 6, 1, MOUTH); R(cx - 4, my + 1, 1, 1, MOUTH); R(cx + 3, my + 1, 1, 1, MOUTH); break;
    case 'surprised': R(cx - 1, my - 1, 3, 3, MOUTH); break;
    case 'worried': R(cx - 3, my + 1, 2, 1, MOUTH); R(cx - 1, my, 2, 1, MOUTH); R(cx + 1, my + 1, 2, 1, MOUTH); break;
    case 'determined': R(cx - 3, my, 7, 1, MOUTH); break;
    default: R(cx - 2, my, 5, 1, sd);
  }
  if (o.blush || expr === 'laugh' || expr === 'tearsmile') { ctx.fillStyle = 'rgba(232,87,76,0.45)'; ctx.fillRect(cx - 10, cy + 14, 3, 2); ctx.fillRect(cx + 7, cy + 14, 3, 2); }
  if (o.tear || expr === 'tearsmile') {
    const p = (t * 0.8) % 1;
    R(exL + 1, ey + 3 + Math.round(p * 9), 1, 2, '#bfe3ff');
    if (expr === 'tearsmile') R(exR + 1, ey + 3 + Math.round(((t * 0.8 + 0.5) % 1) * 9), 1, 2, '#bfe3ff');
  }
  if (o.earbud) { R(cx - 13, cy + 11, 2, 2, PAL.white); R(cx - 12, cy + 13, 1, 16, PAL.g8); }
}

function cuSnow(t, n, c) { for (let i = 0; i < (n || 14); i++) R((i * 17 + Math.sin(t + i) * 3) % 60, (i * 11 + t * (4 + i % 3)) % 42, 1, 1, c || PAL.g9); }
function cuRain(t) { for (let i = 0; i < 22; i++) R((i * 13 - t * 6) % 60 + (i * 13 - t * 6 < 0 ? 60 : 0), (i * 19 + t * 60) % 42, 1, 3, PAL.g5); }


/* ---------- Potloodtekening van de draak (H5) ----------
   Ontwerp in een vlak van 50 x 36. Onderdelen worden in volgorde getekend:
   eerst de vleugel (Noor: "Begin met de vleugels"), dan lijf, poten, staart, het lichtje. */
function qb(a, c, b, n) {
  n = n || 8; const p = [];
  for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; p.push([v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]); }
  return p;
}
function joinPts(...arrs) { return arrs.reduce((o, a) => o.concat(o.length ? a.slice(1) : a), []); }
function circlePts(cx, cy, r, n) { const p = []; for (let i = 0; i <= n; i++) p.push([cx + Math.cos(i / n * 6.283) * r, cy + Math.sin(i / n * 6.283) * r]); return p; }
const DRAGON = (() => {
  const wing = joinPts(qb([33, 18], [29, 9], [23, 6]), qb([23, 6], [14, 1], [5, 2]), qb([5, 2], [10, 7], [7, 12]), qb([7, 12], [13, 14], [12, 19]), qb([12, 19], [22, 18], [30, 23]));
  const body = joinPts([[18, 15], [22, 17.5], [26, 17.5]], qb([26, 17.5], [29, 20], [30, 24]), qb([30, 24], [31, 31.5], [37, 31.5]), [[41, 31.5]],
    qb([41, 31.5], [47.5, 30.5], [46, 24]), qb([46, 24], [44, 18], [37, 17]), qb([37, 17], [32, 15], [30, 11]), qb([30, 11], [24, 8.5], [18, 13]), [[18, 15]]);
  const parts = [
    { fill: wing, fc: '#d6cfc0', strokes: [wing, [[23, 6], [7, 12]], [[23, 6], [12, 19]],
      [[11, 5], [13, 8]], [[15, 6], [17, 9]], [[19, 8], [21, 11]], [[10, 11], [12, 14]], [[14, 12], [16, 15]], [[18, 13], [20, 16]], [[22, 14], [24, 17]]] },
    { fill: body, fc: '#ebe6dc', strokes: [body, [[29, 10.5], [32, 5.5]], [[27, 10], [27.5, 5]],
      [[38, 16.8], [39, 14.6], [40.4, 17.2], [41.6, 15.6], [42.8, 18.6], [44.4, 17.6], [45.2, 21]],
      qb([31, 24.5], [32.5, 25.5], [34.5, 24.5], 4), qb([31, 27], [33, 28], [35.5, 27], 4), qb([32, 29.5], [34, 30.5], [37, 29.5], 4),
      [[18.5, 15.2], [22, 15.8]], [[23.6, 12], [24.4, 12.2]], [[19.4, 13.4], [19.8, 13.4]]] },
    { strokes: [[[33.5, 29], [32.5, 34], [29.5, 34]], [[29.5, 34], [29, 34.8]], [[31, 34], [30.8, 34.9]], [[42, 30.5], [43.2, 34], [40, 34]], [[40, 34], [39.6, 34.9]]] },
    { strokes: [qb([45.5, 29], [52.5, 33.5], [49, 22]), [[49, 22], [46.8, 20.4], [49.8, 20.8], [51.6, 18.6], [51.2, 21.8], [49, 22]]] },
    { fig: [13, 29], strokes: [circlePts(13, 29, 2.6, 14), [[12, 28.5], [12, 29.3]], [[14, 28.5], [14, 29.3]]] },
    { strokes: [[[2, 35], [26, 35.2], [50, 34.8]], [[6, 35], [5.5, 33.6]], [[8, 35], [8.6, 33.8]], [[21, 35], [20.6, 33.6]], [[47, 35], [47.6, 33.8]]] }
  ];
  const len = st => { let l = 0; for (let i = 1; i < st.length; i++) l += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); return l; };
  let total = 0;
  parts.forEach(p => { p.len = p.strokes.reduce((a, st) => a + len(st), 0); total += p.len; });
  parts.total = total;
  return parts;
})();
/* prog 0..1 = hoeveel er al getekend is. Geeft de potloodpositie terug (of null). */
function drawDragon(ox, oy, s, prog, t) {
  ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  let budget = prog * DRAGON.total, pen = null;
  const pencil = (st, dx, dy, a) => {
    let b = budget; ctx.beginPath(); ctx.moveTo(st[0][0] + dx, st[0][1] + dy);
    for (let i = 1; i < st.length; i++) {
      const p0 = st[i - 1], p1 = st[i], seg = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      if (b >= seg) { ctx.lineTo(p1[0] + dx, p1[1] + dy); b -= seg; }
      else { const u = b / seg, q = [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]; ctx.lineTo(q[0] + dx, q[1] + dy); if (!dx) pen = q; b = 0; break; }
    }
    ctx.strokeStyle = 'rgba(52,52,64,' + a + ')'; ctx.stroke();
    return b;
  };
  for (const part of DRAGON) {
    if (budget <= 0) break;
    const complete = budget >= part.len - 0.01;
    if (complete && part.fill) {
      ctx.fillStyle = part.fc; ctx.beginPath(); ctx.moveTo(part.fill[0][0], part.fill[0][1]);
      part.fill.forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fill();
    }
    if (complete && part.fig) {
      glow(part.fig[0], part.fig[1], 9, '255,215,120', 0.55 + Math.sin(t * 3) * 0.12);
      ctx.fillStyle = '#ffe58a'; ctx.beginPath(); ctx.arc(part.fig[0], part.fig[1], 2.6, 0, 7); ctx.fill();
    }
    for (const st of part.strokes) {
      if (budget <= 0) break;
      ctx.lineWidth = 0.55; const before = budget;
      budget = pencil(st, 0, 0, 0.92);
      const keep = budget; budget = before; ctx.lineWidth = 0.35; pencil(st, 0.22, 0.18, 0.3); budget = keep;
    }
  }
  ctx.restore();
  return pen ? [ox + pen[0] * s, oy + pen[1] * s] : null;
}
function drawPencil(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.75);
  R(0, -0.5, 2, 1, '#e8c89a'); R(-0.6, -0.25, 0.8, 0.5, '#343440');
  R(2, -1, 12, 2, '#d8a840'); R(2, -1, 12, 0.6, '#f0c860'); R(14, -1, 2, 2, PAL.g7); R(16, -1, 2, 2, '#d88a8a');
  ctx.restore();
}

const CLOSEUPS = {
  /* H1 — het kind merkt iets op */
  kidNotice(t) {
    brickWall(0, 0, 60, 42, PAL.g2, PAL.g1);
    cuSnow(t, 10);
    bigFace(30, 8, t, { style: 'hood', coat: PAL.g5, earbud: true, expr: [[0, 'neutral'], [0.6, 'surprised'], [2.0, 'worried']], look: t > 0.6 ? -1 : 0 });
  },
  /* H1 — het katje kijkt over de schouder en knippert traag */
  catShoulder(t) {
    R(0, 0, 60, 42, '#0b0f16');
    glow(34, 22, 30, '255,190,110', 0.35);
    cuSnow(t, 12);
    // schouder en kraag van de jas
    R(0, 28, 60, 14, PAL.g5); R(0, 27, 60, 1, PAL.g6);
    R(4, 22, 18, 20, PAL.g5); R(4, 22, 18, 2, PAL.g6); // kap
    R(26, 28, 2, 14, PAL.g4); // rits
    R(30, 30, 30, 4, PAL.red); // sjaal
    // katje
    const c = PAL.g7, s = PAL.g6;
    R(28, 14, 20, 14, c); R(27, 16, 22, 11, c);
    R(28, 9, 5, 6, c); R(29, 7, 3, 2, c); R(43, 9, 5, 6, c); R(44, 7, 3, 2, c);
    R(30, 10, 2, 4, '#c89090'); R(44, 10, 2, 4, '#c89090');
    R(36, 14, 4, 2, s); R(37, 16, 2, 2, s);
    const closed = (t > 1.6 && t < 2.3) || (t > 4.2 && t < 4.8);
    if (closed) { R(31, 20, 5, 1, PAL.g4); R(40, 20, 5, 1, PAL.g4); }
    else {
      R(31, 18, 5, 4, PAL.yellow); R(40, 18, 5, 4, PAL.yellow);
      R(33, 18, 1, 4, '#141414'); R(42, 18, 1, 4, '#141414');
      R(32, 18, 1, 1, PAL.white); R(41, 18, 1, 1, PAL.white);
    }
    R(37, 23, 2, 1, '#e8a0a0'); R(36, 24, 1, 1, PAL.g4); R(39, 24, 1, 1, PAL.g4);
    R(21, 22, 7, 1, PAL.g9); R(22, 24, 6, 1, PAL.g9); R(48, 22, 7, 1, PAL.g9); R(48, 24, 6, 1, PAL.g9);
    // pootjes over de rand
    R(30, 27, 5, 3, c); R(41, 27, 5, 3, c); R(31, 29, 1, 1, PAL.g5); R(33, 29, 1, 1, PAL.g5); R(42, 29, 1, 1, PAL.g5); R(44, 29, 1, 1, PAL.g5);
  },
  /* H1 — het verloren wantje, netjes op een paaltje gezet */
  mitten(t) {
    brickWall(0, 0, 60, 42, PAL.g2, PAL.g1);
    glow(8, 6, 26, '255,210,140', 0.25);
    // paaltje met sneeuwkapje
    R(22, 27, 16, 15, '#6a6a70'); R(22, 27, 3, 15, '#7a7a80'); R(35, 27, 3, 15, '#5a5a60'); R(22, 33, 16, 3, PAL.red);
    R(20, 25, 20, 3, PAL.g9); R(21, 24, 18, 1, PAL.white);
    // het wantje
    const red = '#c8443a', dk = '#9a3028', lt = '#e0685a';
    R(23, 6, 14, 14, red); R(24, 4, 12, 2, red); R(26, 3, 8, 1, red);
    R(37, 10, 4, 7, red); R(38, 9, 3, 1, red); R(39, 8, 2, 1, red); R(37, 16, 2, 2, red); // duim
    for (let j = 6; j < 19; j += 3) for (let i = 24; i < 36; i += 3) { R(i, j, 1, 1, dk); R(i + 1, j + 1, 1, 1, dk); } // breisteek
    R(36, 5, 1, 15, dk); R(24, 5, 1, 13, lt); R(25, 4, 4, 1, lt);
    // sneeuwvlokje-motief
    const w = '#f4eee6';
    R(29, 9, 1, 7, w); R(26, 12, 7, 1, w); R(27, 10, 1, 1, w); R(31, 10, 1, 1, w); R(27, 14, 1, 1, w); R(31, 14, 1, 1, w);
    // boord met ribbels
    R(22, 19, 16, 6, '#ece4d8'); for (let i = 23; i < 38; i += 2) R(i, 19, 1, 6, '#c8bcae');
    R(22, 19, 16, 1, '#d8ccbe');
    // sneeuwlaagje bovenop
    R(26, 2, 8, 1, PAL.g9); R(28, 1, 4, 1, PAL.white);
    cuSnow(t, 12);
    if (t > 1.2) miniHeart(46, 10 - Math.min(4, (t - 1.2) * 2), PAL.red);
  },
  /* H2 — de foto van Mieke boven het dressoir */
  miekePhoto(t) {
    R(0, 0, 60, 42, '#2c2824');
    for (let i = 0; i < 60; i += 4) for (let j = (i / 4) % 2 ? 2 : 0; j < 42; j += 4) R(i + 1, j + 1, 1, 1, '#34302a');
    // lijst
    R(12, 1, 36, 40, '#5a4a3a'); R(13, 2, 34, 38, '#6e5a46'); R(15, 4, 30, 34, '#3e3024');
    ctx.save(); ctx.beginPath(); ctx.rect(16, 5, 28, 32); ctx.clip();
    R(16, 5, 28, 32, '#b8a68a'); glow(30, 16, 22, '240,225,190', 0.45);
    bigFace(30, 11, 1, { style: 'curly', hair: '#e4dccc', skin: '#d8c0a0', coat: '#8a6a5a', wrinkles: true, blush: true, expr: 'happy', brow: '#a89a88' });
    R(24, 21, 1, 1, '#b0987a'); R(35, 21, 1, 1, '#b0987a'); // lachrimpels
    R(20, 33, 20, 4, '#7a5a4a'); R(28, 34, 4, 2, '#d0b070');   // broche
    ctx.fillStyle = 'rgba(150,110,60,0.22)'; ctx.fillRect(16, 5, 28, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(16, 5); ctx.lineTo(26, 5); ctx.lineTo(16, 19); ctx.fill();
    ctx.restore();
    // kaartje onderaan de lijst
    R(20, 36, 20, 5, PAL.g9); R(20, 36, 20, 1, PAL.white);
    txt('Mieke', 30, 36.5, '#4a3a2c', 'center', 3);
    // gedroogd bloemetje in de hoek
    R(45, 3, 1, 8, '#6a7a4a'); R(44, 2, 3, 2, '#b07080'); R(46, 5, 2, 1, '#6a7a4a');
  },
  /* H2 — opa kijkt plots blij */
  opaFace(t, o) {
    R(0, 0, 60, 42, '#151820');
    glow(48, 10, 26, '255,226,150', 0.3 + (t > 0.3 && Math.floor(t * 4) % 2 ? 0.2 : 0));
    cuSnow(t, 8);
    R(0, 0, 60, 2, PAL.g6); R(29, 0, 2, 42, PAL.g6);
    bigFace(28, 9, t, { style: 'bald', hair: PAL.g9, skin: '#e0d6cc', coat: '#6a6058', vest: '#5a5048', glasses: true, wrinkles: true, brow: PAL.g8,
      expr: o.expr || [[0, 'sad'], [1.1, 'surprised'], [2.3, 'happy']], tear: t > 2.3 && o.tear });
  },
  /* H2 — Fatma zwaait met de koffiekan */
  fatmaWave(t) {
    R(0, 0, 60, 42, '#10131a');
    house(2, 18, 20, 24, 2, t); house(42, 14, 22, 28, 1, t);
    cuSnow(t, 12);
    bigFace(30, 9, t, { style: 'hijab', capC: '#a0645a', trim: PAL.orange, coat: PAL.g7, expr: 'happy' });
    const w = Math.floor(t * 4) % 2;
    R(48, 16 - w * 2, 6, 7, PAL.g9); R(49, 23 - w * 2, 4, 12, PAL.g7);
    // koffiekan
    R(6, 30, 9, 10, PAL.g8); R(5, 29, 11, 2, PAL.g6); R(15, 32, 2, 4, PAL.g8); R(4, 33, 2, 1, PAL.g8);
    for (let i = 0; i < 3; i++) R(8 + i * 2, 26 - ((t * 8 + i * 3) % 6), 1, 2, PAL.g8);
  },
  /* H3 — het fotoalbum */
  album(t) {
    R(0, 0, 60, 42, '#2a2420');
    R(3, 4, 54, 34, '#e8dcc6'); R(29, 4, 2, 34, '#c8bca6');
    // foto links: de boomhut
    R(6, 7, 21, 17, PAL.white); R(7, 8, 19, 13, '#8aa0b0');
    R(7, 17, 19, 4, '#6a8a5a');
    R(15, 9, 3, 12, '#5a4a3a'); R(10, 11, 13, 2, '#5a4a3a');
    R(11, 12, 10, 5, '#a08060'); R(10, 11, 12, 1, '#7a6050'); R(13, 13, 2, 3, '#5a4030');
    R(19, 13, 1, 1, PAL.g9); R(17, 13, 1, 1, PAL.g9);
    R(12, 15, 2, 2, '#e0c0a0'); R(18, 15, 2, 2, '#e0c0a0');
    R(6, 7, 2, 2, '#c0a080'); R(25, 22, 2, 2, '#c0a080');
    R(9, 26, 15, 1, PAL.g5); R(11, 28, 11, 1, PAL.g5);
    // foto rechts: twee jongetjes met ijsjes
    R(33, 9, 21, 15, PAL.white); R(34, 10, 19, 11, '#c0b090');
    R(38, 12, 4, 4, '#e0c0a0'); R(45, 12, 4, 4, '#e0c0a0'); R(37, 16, 6, 5, '#7a8aa0'); R(44, 16, 6, 5, '#a07a6a');
    R(42, 13, 2, 3, PAL.warm);
    R(35, 27, 16, 1, PAL.g5); R(37, 29, 10, 1, PAL.g5);
    glow(18, 16, 20, '255,220,150', 0.15 + Math.sin(t * 2) * 0.05);
  },
  /* H3 — de broers lachen samen */
  brothers(t) {
    R(0, 0, 60, 42, '#1e1e24');
    bigFace(16, 9, t, { style: 'spiky', hair: PAL.g2, coat: PAL.g6, expr: [[0, 'happy'], [0.5, 'laugh']] });
    bigFace(45, 10, t, { style: 'short', hair: PAL.g4, coat: PAL.g7, expr: [[0, 'surprised'], [0.8, 'laugh']] });
  },
  /* H4 — Marcel */
  marcel(t) {
    R(0, 0, 60, 42, '#0e1014');
    glow(52, 18, 30, '255,200,110', Math.min(0.4, t * 0.15));
    cuRain(t);
    const sx = t < 1.4 && Math.floor(t * 12) % 2 ? 1 : 0;
    bigFace(28 + sx, 10, t, { style: 'beanie', capC: PAL.g4, coat: '#4a4a4e', beard: PAL.g5, skin: '#cfc4b8', wrinkles: true,
      expr: [[0, 'sad'], [1.4, 'surprised'], [2.8, 'tearsmile']] });
    for (let i = 0; i < 4; i++) R(18 + i * 7, 12 + ((t * 10 + i * 5) % 14), 1, 1, '#9ab0c8');
  },
  /* H4 — soep in de bakkerij */
  soup(t) {
    R(0, 0, 60, 42, '#2a1e14');
    glow(30, 24, 36, '255,190,110', 0.4);
    R(0, 30, 60, 12, '#5a4030'); R(0, 30, 60, 1, '#7a5a40');
    R(16, 22, 28, 9, PAL.g9); R(18, 31, 24, 2, PAL.g8); R(17, 21, 26, 2, PAL.white);
    R(19, 22, 22, 3, PAL.orange); R(24, 22, 3, 1, PAL.yellow); R(33, 23, 2, 1, PAL.yellow);
    for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i * 0.25) % 1; R(22 + i * 5 + Math.sin(t * 2 + i) * 2, 18 - p * 16, 1, 3, 'rgba(255,255,255,' + (0.6 * (1 - p)) + ')'); }
    R(46, 26, 12, 5, '#c89a5a'); R(47, 25, 10, 1, '#d8aa6a'); R(49, 27, 1, 1, '#a07a40'); R(53, 27, 1, 1, '#a07a40');
    R(4, 27, 10, 2, PAL.g7);
  },
  /* H5 — Sam vat moed */
  sam(t) {
    R(0, 0, 60, 42, '#1c1c22');
    glow(30, 20, 30, '255,200,110', 0.1 + Math.min(0.3, t * 0.1));
    bigFace(30, 8, t, { style: 'spiky', hair: PAL.g5, coat: PAL.g7, scarf: t > 1.4 ? PAL.yellow : null, expr: [[0, 'worried'], [1.0, 'determined']] });
  },
  /* H5 — de weggewaaide tekening op de speelplaats */
  drawing(t) {
    R(0, 0, 60, 42, '#26262a');
    for (let i = 0; i < 60; i += 10) R(i, 0, 1, 42, '#2e2e32');
    for (let j = 0; j < 42; j += 10) R(0, j, 60, 1, '#2e2e32');
    ctx.save(); ctx.translate(30, 21); ctx.rotate(-0.04); ctx.translate(-30, -21);
    const lift = Math.max(0, Math.sin(t * 2.2)) * 1.5;
    const pg = [[6, 2], [55, 1.5], [56, 40 - lift], [7, 40.5], [5, 36], [7.2, 32], [4.5, 28], [6.5, 24], [4.4, 20], [7, 16], [5, 12], [7, 8], [5, 5]];
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); pg.forEach((p, i) => i ? ctx.lineTo(p[0] + 1, p[1] + 1) : ctx.moveTo(p[0] + 1, p[1] + 1)); ctx.fill();
    ctx.fillStyle = '#ebe6dc'; ctx.beginPath(); pg.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.fill();
    R(30, 2, 0.5, 38, 'rgba(0,0,0,0.06)'); R(6, 21, 50, 0.5, 'rgba(0,0,0,0.06)');
    drawDragon(6, 3.5, 1, 1, t);
    ctx.fillStyle = 'rgba(90,70,50,0.25)'; ctx.beginPath(); ctx.ellipse(50, 35, 4, 2.4, 0.4, 0, 7); ctx.fill();
    ctx.restore();
  },
  /* H5 — Noor leert Sam een draak tekenen: de lijnen verschijnen één voor één */
  dragon(t) {
    R(0, 0, 60, 42, '#4a3a2c');
    for (let j = 2; j < 42; j += 7) R(0, j, 60, 1, '#3a2c20');
    R(2, 1, 56, 40, '#d8d2c4'); R(3, 1, 55, 40, '#ebe6dc');
    for (let i = 3; i < 40; i += 3) R(1, i, 2, 1, PAL.g5);
    const prog = Math.min(1, t / 7);
    const pen = drawDragon(6, 3.5, 1, prog, t);
    if (pen) drawPencil(pen[0], pen[1]);
    if (prog >= 1) { glow(19, 32, 10, '255,220,140', 0.25); miniHeart(50, 4 - Math.min(2, (t - 7)), PAL.red); }
  },
  /* H5 — Noor lacht */
  noor(t) {
    R(0, 0, 60, 42, '#1c1c22');
    bigFace(30, 9, t, { style: 'long', hair: PAL.g2, coat: PAL.g8, stripes: PAL.red, expr: [[0, 'worried'], [1.0, 'happy']], blush: t > 1 });
  },
  /* H6 — mama */
  mama(t) {
    R(0, 0, 60, 42, '#1a1c1e');
    glow(52, 20, 30, '255,200,110', Math.min(0.35, t * 0.12));
    bigFace(28, 9, t, { style: 'bun', hair: PAL.g3, coat: PAL.g6, scarf: PAL.g4, expr: [[0, 'worried'], [1.6, 'tearsmile']] });
  },
  /* H6 — de verwarming slaat aan; Lien houdt haar handjes ertegen */
  heater(t) {
    const w = Math.min(1, t * 0.35);
    R(0, 0, 60, 42, '#2a2c2e');
    for (let i = 0; i < 60; i += 6) R(i, 0, 1, 30, '#26282a');
    R(0, 34, 60, 8, '#34322e');
    glow(30, 20, 40, '255,150,70', 0.4 * w);
    // radiator met ribben
    const rc = '#c4c4c0', rd = shade(rc, 30);
    R(6, 8, 48, 26, rd);
    for (let i = 7; i < 54; i += 5) { R(i, 8, 4, 26, rc); R(i, 8, 1, 26, shade(rc, -14)); R(i + 1, 9, 2, 1, shade(rc, -24)); }
    R(6, 7, 48, 2, shade(rc, -10)); R(6, 33, 48, 2, rd);
    R(8, 35, 3, 5, PAL.g5); R(49, 35, 3, 5, PAL.g5);
    // thermostaatknop
    R(54, 14, 5, 8, PAL.g7); R(55, 15, 3, 6, PAL.g8); R(56, 16, 1, 3, w > 0.5 ? PAL.red : PAL.g5);
    // warmte die opstijgt
    if (w > 0.4) for (let i = 0; i < 5; i++) { const p = (t * 0.5 + i * 0.2) % 1; ctx.fillStyle = 'rgba(255,220,180,' + (0.5 * (1 - p)) + ')'; ctx.fillRect(10 + i * 10 + Math.sin(t * 3 + i) * 1.5, 7 - p * 7, 1, 2); }
    // twee handjes: mouw, pols, handpalm met vier vingers en een duim
    const skin = '#dcc4ac', sd = shade(skin, 26), sleeve = PAL.g7;
    const up = Math.min(5, t * 2);
    const hand = (x, flip) => {
      const y = 25 - up;
      R(x - 1, y + 11, 10, 9, sleeve); R(x - 1, y + 11, 10, 1, shade(sleeve, 18));
      for (let i = 0; i < 9; i += 2) R(x + i, y + 13, 1, 6, shade(sleeve, 10));
      R(x + 1, y + 8, 6, 4, skin);                      // pols
      R(x, y + 3, 8, 6, skin); R(x, y + 8, 8, 1, sd);     // handpalm
      for (let i = 0; i < 4; i++) { R(x + i * 2, y - 1 + (i === 0 || i === 3 ? 1 : 0), 1, 4, skin); R(x + i * 2 + 1, y + 2, 1, 1, sd); } // vingers
      R(flip ? x + 8 : x - 2, y + 4, 2, 3, skin); R(flip ? x + 9 : x - 2, y + 3, 1, 2, skin); // duim
    };
    hand(15, true); hand(37, false);
    txt(Math.round(12 + w * 8) + '°C', 3, 1, w > 0.5 ? PAL.orange : PAL.g8, 'left', 4);
  },
  /* H7 — Yasmina durft te hopen */
  yasmina(t) {
    R(0, 0, 60, 42, '#1c1a20');
    glow(30, 20, 32, '255,210,130', Math.min(0.3, t * 0.12));
    bigFace(30, 9, t, { style: 'curly-long', hair: PAL.g1, coat: PAL.g7, skin: '#b89a80', expr: [[0, 'worried'], [1.8, 'happy']] });
  },
  /* H7 — het plantje */
  plantje(t) {
    R(0, 0, 60, 42, '#202428');
    R(0, 0, 60, 30, '#3a4a5a'); R(29, 0, 2, 30, PAL.g6); R(0, 14, 60, 1, PAL.g6);
    glow(40, 8, 30, '255,230,170', 0.35);
    R(0, 30, 60, 4, PAL.g7); R(0, 34, 60, 8, PAL.g4);
    R(22, 20, 16, 11, '#a0603a'); R(20, 19, 20, 3, '#b0704a');
    const g = '#6fa05f', g2 = '#4f8a4a';
    R(29, 8, 2, 12, g2); R(22, 10, 8, 3, g); R(31, 7, 8, 3, g); R(24, 4, 6, 3, g2); R(31, 13, 6, 3, g2);
    txt('Y.', 26, 23, PAL.g9, 'left', 4);
  },
  /* H8 — Amir lacht */
  amir(t) {
    R(0, 0, 60, 42, '#1a1c1a');
    bigFace(30, 8, t, { style: 'curly', hair: PAL.g1, skin: '#a8846a', coat: PAL.g6, scarf: t > 1.2 ? PAL.orange : null, expr: [[0, 'surprised'], [1.2, 'laugh']] });
  },
  /* H8 — de bal aan zijn voeten */
  ball(t) {
    R(0, 0, 60, 42, '#1b1b1b'); R(0, 30, 60, 1, PAL.g4);
    R(16, 4, 5, 20, PAL.g4); R(23, 4, 5, 18, PAL.g4); R(15, 2, 14, 4, PAL.g6);
    R(14, 22, 16, 8, PAL.g7); R(12, 26, 20, 4, PAL.g6); R(10, 28, 8, 2, PAL.g6); R(14, 25, 16, 1, PAL.white);
    const bx = Math.max(36, 60 - t * 30);
    R(bx - 6, 20, 12, 10, PAL.white); R(bx - 5, 19, 10, 12, PAL.white); R(bx - 7, 22, 14, 6, PAL.white);
    R(bx - 2, 22, 4, 4, PAL.g3); R(bx - 6, 25, 2, 2, PAL.g4); R(bx + 4, 21, 2, 2, PAL.g4);
  },
  /* H9 — de sleutel van Yusuf */
  key(t) {
    R(0, 0, 60, 42, '#140e0a');
    glow(30, 24, 36, '255,160,70', 0.35 + Math.sin(t * 9) * 0.05);
    R(10, 22, 40, 14, '#a8846a'); R(8, 24, 4, 10, '#a8846a'); R(12, 20, 30, 4, '#a8846a');
    for (let i = 14; i < 46; i += 6) R(i, 21, 1, 3, '#8a6a52');
    R(42, 16, 6, 8, '#a8846a'); R(44, 14, 4, 4, '#a8846a');
    R(16, 30, 26, 1, '#8a6a52'); R(20, 33, 18, 1, '#8a6a52');
    R(18, 24, 8, 6, PAL.yellow); R(20, 26, 4, 2, '#a8846a');
    R(26, 26, 16, 2, PAL.yellow); R(36, 28, 2, 3, PAL.yellow); R(40, 28, 2, 2, PAL.yellow);
    R(19, 25, 1, 1, PAL.white);
  },
  /* H9 — gezichten rond het vuur */
  fireFaces(t) {
    R(0, 0, 60, 42, '#0c0806');
    glow(30, 34, 44, '255,160,70', 0.5 + Math.sin(t * 8) * 0.05);
    bigFace(13, 12, t, { style: 'bald', hair: PAL.g8, skin: '#b89a80', coat: '#5a4a3a', beard: PAL.g7, wrinkles: true, expr: 'happy' });
    bigFace(47, 12, t, { style: 'hijab', capC: '#7a4a4a', skin: '#b89a80', coat: PAL.g5, expr: [[0, 'neutral'], [0.8, 'happy']] });
    for (let i = 0; i < 6; i++) { const fh = 4 + Math.abs(Math.sin(t * 8 + i)) * 6; R(24 + i * 2, 42 - fh, 2, fh, i % 2 ? PAL.orange : PAL.yellow); }
  },
  /* Einde — het katje en het lichtje */
  catFinal(t) {
    R(0, 0, 60, 42, '#0a0806');
    for (let i = 0; i < 10; i++) R((i * 23) % 60, (i * 7) % 16, 1, 1, PAL.g6);
    glow(24, 28, 30, '255,226,150', 0.35);
    glow(44, 30, 26, '255,170,80', 0.2);
    // lichtje groot
    const b = Math.sin(t * 2) > 0 ? -1 : 0;
    R(16, 22 + b, 14, 14, PAL.white); R(14, 28 + b, 18, 8, PAL.white); R(18, 12 + b, 10, 10, PAL.white); R(16, 14 + b, 14, 6, PAL.white);
    R(20, 16 + b, 1, 3, PAL.g4); R(25, 16 + b, 1, 3, PAL.g4); R(18, 19 + b, 2, 1, PAL.warm); R(26, 19 + b, 2, 1, PAL.warm);
    // katje zit ernaast
    const c = PAL.g7;
    R(36, 24, 12, 14, c); R(34, 32, 16, 6, c); R(36, 15, 12, 10, c);
    R(36, 12, 3, 3, c); R(45, 12, 3, 3, c);
    const closed = (t % 4) > 2.8 && (t % 4) < 3.6;
    if (closed) { R(38, 19, 3, 1, PAL.g4); R(43, 19, 3, 1, PAL.g4); }
    else { R(38, 18, 3, 3, PAL.yellow); R(43, 18, 3, 3, PAL.yellow); R(39, 18, 1, 3, '#141414'); R(44, 18, 1, 3, '#141414'); }
    R(41, 22, 2, 1, '#e8a0a0');
    R(48, 34, 8, 3, c); R(54, 30, 3, 4, c);
    R(37, 28, 2, 6, PAL.g6); R(44, 28, 2, 6, PAL.g6);
    if (t > 1) { miniHeart(31, 8 - Math.min(4, (t - 1) * 2), PAL.red); }
  }
};
