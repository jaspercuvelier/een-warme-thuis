'use strict';
/* =========================================================
   sprites.js — personages, katje, lichtje (alles met blokjes getekend)
   ========================================================= */

function shade(c, amt) {
  amt = amt === undefined ? 26 : amt;
  if (!c || c[0] !== '#' || c.length !== 7) return c;
  const n = parseInt(c.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, v - amt));
  return '#' + ((1 << 24) + (f(n >> 16) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
}

/* ---------- Mensen ----------
   (x,y) = tussen de voeten.  Belangrijkste opties:
   kid, elder, dir(1/-1), moving, walk(0/1), sit, floor(op de grond zitten), back(rug naar ons)
   coat, pants, skin, hair, shoes, acc(sjaal), hairStyle: short|long|bun|pony|curly|bald|spiky|cap|beanie|hood|hijab
   capC (pet/muts/hoofddoek kleur), longCoat, apron, glasses, beard, expr: neutral|happy|sad|laugh|surprised|worried|determined
   arm: wave|up|hug|hold|reach|face|crouch, hold(fn), blush, tear, breath */
function personDims(o) {
  return o && o.kid ? { sh: 2, leg: 7, tor: 10, hw: 8, hh: 8, tw: 10, arm: 8 }
    : { sh: 2, leg: 10, tor: 13, hw: 9, hh: 9, tw: 12, arm: 10 };
}
function personHeight(o) {
  const d = personDims(o);
  return (o && o.sit) ? d.tor + d.hh + (o.floor ? 4 : 10) : d.sh + d.leg + d.tor + d.hh + 2;
}
const MOUTH = '#4a3434';

function drawPerson(x, y, o) {
  o = o || {};
  const d = personDims(o);
  x = Math.round(x); y = Math.round(y);
  const dir = o.dir || 1;
  const coat = o.coat || o.body || PAL.g6, pants = o.pants || o.legs || PAL.g4;
  const skin = o.skin || '#dcc4ac', hair = o.hair || PAL.g3, shoes = o.shoes || PAL.g2;
  const coatD = shade(coat), skinD = shade(skin, 34);
  const t = (typeof G !== 'undefined') ? G.t : 0;
  let bob = o.bob || 0;
  // rillen: korte schokjes van 1 pixel, telkens een seconde, dan even stil
  if (o.shiver && !o.moving) { const ph = (t + x * 0.37) % 2.4; if (ph < 1.2) x += Math.floor(t * 12) % 2 ? 1 : 0; }
  if (o.moving && o.walk) bob -= 1;

  // schaduw
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x - d.tw / 2 - 1, y - 1, d.tw + 2, 2);

  // ---- benen ----
  let hip;
  if (o.sit) {
    const seat = o.floor ? 2 : (o.kid ? 6 : 8);
    hip = y - seat - 1 + bob;
    const th = o.kid ? 6 : 8;
    const tx = dir > 0 ? x - 3 : x + 3 - th;
    R(tx, hip - 3, th, 4, pants);
    if (!o.floor) {
      const sx = dir > 0 ? tx + th - 3 : tx;
      R(sx, hip + 1, 3, y - hip - 3, pants);
      R(dir > 0 ? sx : sx - 1, y - 2, 4, 2, shoes);
    } else {
      R(dir > 0 ? tx + th : tx - 3, hip - 1, 3, 3, shoes);
    }
  } else if (o.arm === 'crouch') {
    hip = y - 6 + bob;
    R(x - 4, hip, 3, 4, pants); R(x + 1, hip - 1, 3, 5, pants);
    R(x - 5, y - 2, 4, 2, shoes); R(x + 1, y - 2, 4, 2, shoes);
  } else {
    hip = y - d.sh - d.leg + bob;
    const l1 = x - Math.floor(d.tw / 2) + 2, l2 = x + Math.floor(d.tw / 2) - 5;
    if (o.moving) {
      const f = o.walk ? 1 : 0;
      R(l1 + (f ? -1 : 1), hip, 3, d.leg - (f ? 0 : 1), pants);
      R(l2 + (f ? 1 : -1), hip, 3, d.leg - (f ? 1 : 0), pants);
      R(l1 + (f ? -2 : 1), y - d.sh - (f ? 0 : 1), 4, d.sh, shoes);
      R(l2 + (f ? 1 : -2), y - d.sh - (f ? 1 : 0), 4, d.sh, shoes);
    } else {
      R(l1, hip, 3, d.leg, pants); R(l2, hip, 3, d.leg, pants);
      R(l1 + (dir > 0 ? 0 : -1), y - d.sh, 4, d.sh, shoes);
      R(l2 + (dir > 0 ? 0 : -1), y - d.sh, 4, d.sh, shoes);
    }
  }

  // ---- romp ----
  const top = hip - d.tor;
  const tl = x - Math.floor(d.tw / 2);
  R(tl, top + 1, d.tw, d.tor - 1, coat);
  R(tl + 1, top, d.tw - 2, 1, coat);
  if (o.longCoat && !o.sit && o.arm !== 'crouch') R(tl - 1, hip - 1, d.tw + 2, Math.min(6, d.leg - 2), coat);
  R(dir > 0 ? tl : tl + d.tw - 2, top + 2, 2, d.tor - 2, coatD);
  if (!o.back) R(x + (dir > 0 ? 1 : -2), top + 3, 1, d.tor - 4, coatD);
  if (o.apron) R(tl + 2, top + 4, d.tw - 4, d.tor - 3 + (o.sit ? 0 : 3), o.apron);
  if (o.stripes) for (let j = top + 3; j < hip; j += 3) R(tl, j, d.tw, 1, o.stripes);
  if (o.vest) { R(tl, top + 1, d.tw, 2, o.vest); R(tl, top + 6, d.tw, 2, o.vest); }
  if (o.acc) { R(tl + 1, top, d.tw - 2, 3, o.acc); if (!o.back) R(x + (dir > 0 ? -3 : 1), top + 3, 2, 5, o.acc); }

  // ---- armen ----
  const armC = o.armC || coatD;
  const front = dir > 0 ? tl + d.tw - 1 : tl - 2;
  const backA = dir > 0 ? tl - 2 : tl + d.tw - 1;
  const swing = o.moving ? (o.walk ? 1 : -1) : 0;
  const down = (ax, sw) => { R(ax, top + 1 + sw, 3, d.arm, armC); R(ax, top + 1 + sw + d.arm, 3, 2, skin); };
  let hand = null;
  switch (o.arm) {
    case 'wave': {
      down(backA, 0);
      const w = Math.floor(t * 5) % 2;
      R(front, top - 6 + w, 3, 8, armC); R(front + (w ? dir : 0), top - 9 + w, 3, 3, skin);
      break;
    }
    case 'up':
      R(front, top - 7, 3, 9, armC); R(front, top - 9, 3, 2, skin);
      R(backA, top - 7, 3, 9, armC); R(backA, top - 9, 3, 2, skin);
      break;
    case 'hug':
      down(backA, 0);
      R(tl + 1, top + 5, d.tw - 2, 3, armC); R(dir > 0 ? tl + 1 : tl + d.tw - 3, top + 5, 2, 3, skin);
      break;
    case 'face':
      R(front, top + 1, 3, 4, armC); R(backA, top + 1, 3, 4, armC);
      hand = 'face';
      break;
    case 'reach':
      down(backA, 0);
      R(dir > 0 ? front : front - 6, top + 2, 9, 3, armC);
      R(dir > 0 ? front + 9 : front - 8, top + 2, 2, 3, skin);
      if (o.hold) o.hold(dir > 0 ? front + 10 : front - 9, top + 3);
      break;
    case 'hold':
    case 'crouch':
      down(backA, 0);
      R(front, top + 1, 3, 5, armC);
      R(dir > 0 ? front : front - 4, top + 5, 7, 3, armC);
      R(dir > 0 ? front + 6 : front - 5, top + 5, 2, 3, skin);
      if (o.hold) o.hold(dir > 0 ? front + 7 : front - 5, top + 5);
      break;
    default:
      down(backA, -swing);
      down(front, swing);
      if (o.hold) o.hold(front + 1, top + d.arm + 1);
  }

  // ---- wandelstok ----
  if (o.cane) {
    const cc = '#7a5634', ch = '#9a7048';
    if (o.sit) { const sx = x + (o.back ? 9 : dir * 9); R(sx, y - 15, 1, 15, cc); R(sx - 1, y - 16, 3, 1, ch); }
    else if (!o.arm) {
      const hy = top + 1 + (o.moving ? (o.walk ? 1 : -1) : 0) + d.arm;
      const sx = dir > 0 ? front + 3 : front - 1;
      R(sx, hy, 1, y - hy, cc); R(dir > 0 ? front + 1 : front - 1, hy - 1, 3, 1, ch); R(sx, y - 1, 1, 1, PAL.g2);
    }
  }
  // ---- hoofd ----
  const hw = d.hw, hh = d.hh;
  const hx = x - Math.floor(hw / 2) + (o.elder ? dir : 0);
  const hy = top - hh + (o.elder ? 1 : 0);
  R(x - 1, top - 1, 3, 2, skinD);
  R(hx + 1, hy, hw - 2, hh, skin);
  R(hx, hy + 1, hw, hh - 2, skin);
  const style = o.hairStyle || (o.hood ? 'hood' : o.cap ? 'cap' : o.longHair ? 'long' : 'short');
  const capC = o.capC || o.cap || PAL.g4;
  const backSide = dir > 0 ? hx : hx + hw - 2;
  if (o.back) {
    if (style === 'hood' || style === 'hijab') R(hx - 1, hy - 1, hw + 2, hh + 1, style === 'hood' ? coat : capC);
    else if (style === 'bald') { R(hx, hy + 3, hw, 4, hair); }
    else {
      R(hx, hy - 1, hw, hh, hair);
      if (style === 'long' || style === 'pony' || style === 'curlylong') R(hx, hy + hh - 1, hw, style === 'curlylong' ? 7 : 4, hair);
      if (style === 'curlylong') for (let i = 0; i < hw; i += 2) R(hx + i - 1, hy - 2 + (i % 4 ? 1 : 0), 2, 1, hair);
      if (style === 'bun') R(x - 2, hy - 3, 4, 3, hair);
      if (style === 'cap' || style === 'beanie') R(hx - 1, hy - 2, hw + 2, 4, capC);
    }
  } else {
    // haar achter/rond het gezicht
    if (style === 'hood') {
      R(hx - 1, hy - 2, hw + 2, hh + 2, coat);
      R(hx - 1, hy - 2, hw + 2, 1, coatD);
      R(dir > 0 ? hx + 2 : hx, hy + 1, hw - 2, hh - 1, skin);
    } else if (style === 'hijab') {
      R(hx - 1, hy - 2, hw + 2, hh + 4, capC);
      R(tl, top, d.tw, 3, capC);
      R(dir > 0 ? hx + 2 : hx + 1, hy + 1, hw - 3, hh - 2, skin);
    } else if (style === 'bald') {
      R(backSide, hy + 2, 2, 4, hair);
      R(dir > 0 ? hx + hw - 1 : hx, hy + 3, 1, 2, hair);
    } else {
      R(hx, hy - 1, hw, 3, hair);
      R(backSide, hy, 2, 5, hair);
      if (style === 'long') { R(backSide - (dir > 0 ? 1 : 0), hy + 2, 3, hh + 3, hair); R(dir > 0 ? hx + hw - 1 : hx, hy + 1, 1, 3, hair); }
      if (style === 'pony') { R(dir > 0 ? hx - 2 : hx + hw, hy + 2, 2, 7, hair); }
      if (style === 'bun') { R(dir > 0 ? hx - 1 : hx + hw - 3, hy - 3, 4, 4, hair); }
      if (style === 'curlylong') { // lang, krullend haar tot op de schouders
        R(hx - 1, hy - 2, hw + 2, 4, hair); for (let i = 0; i < hw; i += 2) R(hx + i, hy - 3, 1, 1, hair);
        R(backSide - 2, hy, 5, hh + 6, hair); R(dir > 0 ? backSide - 3 : backSide + 4, hy + 3, 1, hh + 1, hair);
        for (let j = 0; j < hh + 5; j += 3) R(dir > 0 ? backSide - 3 : backSide + 4, hy + j, 1, 1, shade(hair, -18));
        R(dir > 0 ? hx + hw - 1 : hx, hy + 1, 1, 6, hair); R(dir > 0 ? hx + hw : hx - 1, hy + 3, 1, 4, hair); }
      if (style === 'curly') { R(hx - 1, hy - 2, hw + 2, 4, hair); R(backSide - 1, hy + 1, 3, 5, hair); for (let i = 0; i < hw; i += 2) R(hx + i, hy - 3, 1, 1, hair); }
      if (style === 'spiky') { for (let i = 0; i < hw; i += 2) R(hx + i, hy - 2, 1, 1, hair); }
      if (style === 'cap') { R(hx - 1, hy - 2, hw + 2, 3, capC); R(dir > 0 ? hx + hw - 1 : hx - 3, hy, 4, 1, capC); }
      if (style === 'beanie') { R(hx - 1, hy - 3, hw + 2, 4, capC); R(hx - 1, hy, hw + 2, 1, shade(capC)); R(x - 1, hy - 5, 2, 2, o.pom || capC); }
    }
    // gezicht
    const expr = o.expr || (o.happy ? 'happy' : o.sad ? 'sad' : 'neutral');
    const ey = hy + Math.floor(hh * 0.45);
    const e1 = dir > 0 ? hx + hw - 3 : hx + 2;
    const e2 = dir > 0 ? hx + hw - 6 : hx + 5;
    const blink = Math.floor(t * 10 + x * 0.37) % 41 === 0;
    const eyeC = '#141414';
    if (expr === 'laugh' || blink) {
      R(e1, ey + 1, 1, 1, eyeC); R(e2, ey + 1, 1, 1, eyeC);
    } else {
      R(e1, ey, 1, 2, eyeC); R(e2, ey, 1, 2, eyeC);
    }
    if (expr === 'sad' || expr === 'worried') { R(dir > 0 ? e2 + 1 : e2 - 1, ey - 2, 1, 1, skinD); R(dir > 0 ? e1 - 1 : e1 + 1, ey - 2, 1, 1, skinD); }
    if (expr === 'determined') { R(e1 - (dir > 0 ? 1 : 0), ey - 1, 2, 1, PAL.g3); R(e2 - (dir > 0 ? 0 : 1), ey - 1, 2, 1, PAL.g3); }
    if (o.glasses) { // montuur: brug boven de ogen + pootje naar het oor (geen lijn onder de ogen: dat leek een snor)
      const gc = o.glassC || '#9a9aa4';
      R(Math.min(e1, e2) - 1, ey - 1, 6, 1, gc);
      R(dir > 0 ? Math.min(e1, e2) - 3 : Math.max(e1, e2) + 2, ey - 1, 2, 1, gc);
      R(e1 + (dir > 0 ? 1 : -1), ey, 1, 1, 'rgba(200,220,255,0.55)'); R(e2 + (dir > 0 ? 1 : -1), ey, 1, 1, 'rgba(200,220,255,0.55)'); }
    const mx = dir > 0 ? hx + hw - 5 : hx + 2, my = hy + hh - 2;
    if (o.beard) R(hx + 1, hy + hh - 3, hw - 2, 3, o.beard);
    switch (expr) {
      case 'happy': R(mx, my, 3, 1, MOUTH); R(mx - 1, my - 1, 1, 1, MOUTH); R(mx + 3, my - 1, 1, 1, MOUTH); break;
      case 'laugh': R(mx - 1, my - 1, 4, 2, MOUTH); R(mx, my - 1, 2, 1, PAL.white); break;
      case 'sad': R(mx, my - 1, 3, 1, MOUTH); R(mx - 1, my, 1, 1, MOUTH); R(mx + 3, my, 1, 1, MOUTH); break;
      case 'surprised': R(mx + 1, my - 1, 2, 2, MOUTH); break;
      case 'worried': R(mx, my, 1, 1, MOUTH); R(mx + 1, my - 1, 1, 1, MOUTH); R(mx + 2, my, 1, 1, MOUTH); break;
      default: R(mx, my, 3, 1, skinD);
    }
    if (o.blush) { R(e1 - (dir > 0 ? 0 : 1), ey + 2, 2, 1, 'rgba(232,87,76,0.75)'); }
    if (o.tear) { const ty = Math.floor(t * 6) % 4; R(e1, ey + 2 + ty, 1, 1, '#bfe3ff'); }
    if (hand === 'face') { R(e2 - 1, ey, 3, 3, skin); R(e1 - 1, ey, 3, 3, skin); }
    if (o.breath && Math.floor(t * 0.9 + x * 0.1) % 3 === 0) {
      const p = (t * 0.9 + x * 0.1) % 1;
      ctx.fillStyle = 'rgba(235,240,255,' + (0.55 * (1 - p)) + ')';
      ctx.fillRect(Math.round(mx + dir * (4 + p * 4)), Math.round(my - 1 - p * 3), 2 + Math.round(p * 2), 2);
    }
  }
  return hy - 3;
}

/* ---------- Katje ----------
   o: { pose: 'walk'|'stand'|'curled'|'sit', dir, shiver, blink, eyesTo:{x,y}, sleep } */
function drawCat(x, y, t, o) {
  o = o || {};
  x = Math.round(x); y = Math.round(y);
  const dir = o.dir || 1, pose = o.pose || (o.curled ? 'curled' : 'stand');
  const sh = o.shiver ? (Math.floor(t * 18) % 2) : 0;
  const c = o.color || PAL.g7, s = PAL.g6, dk = PAL.g5;
  const X = v => x + (dir > 0 ? v : -v);   // spiegelen
  const RR = (a, b, w, h, col) => R(dir > 0 ? x + a + sh : x - a - w + sh, y + b, w, h, col);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x - 8, y - 1, 16, 2);
  const eyeOpen = !o.sleep && !o.blink && Math.floor(t * 4 + x) % 29 !== 0;
  if (pose === 'curled') {
    RR(-8, -6, 15, 6, c); RR(-7, -7, 12, 1, c);
    RR(-6, -5, 2, 4, s); RR(-1, -6, 2, 5, s);
    RR(-8, -2, 13, 2, dk);
    RR(3, -10, 7, 6, c); RR(3, -12, 2, 2, c); RR(8, -12, 2, 2, c);
    if (eyeOpen) { RR(5, -8, 1, 1, PAL.yellow); RR(8, -8, 1, 1, PAL.yellow); }
    else { RR(4, -8, 2, 1, dk); RR(7, -8, 2, 1, dk); }
    RR(7, -6, 1, 1, '#e8a0a0');
    return;
  }
  if (pose === 'sit') {
    RR(-4, -12, 9, 11, c); RR(-5, -6, 11, 5, c);
    RR(-3, -9, 2, 6, s); RR(2, -9, 2, 6, s);
    RR(-4, -1, 3, 1, dk); RR(2, -1, 3, 1, dk);
    RR(4, -3, 7, 2, c); RR(9, -6, 2, 3, c);  // staart
    RR(-4, -19, 9, 7, c); RR(-4, -21, 2, 2, c); RR(3, -21, 2, 2, c);
    if (eyeOpen) { RR(-2, -17, 2, 2, PAL.yellow); RR(2, -17, 2, 2, PAL.yellow); RR(-1, -17, 1, 2, '#222'); RR(3, -17, 1, 2, '#222'); }
    else { RR(-2, -16, 2, 1, dk); RR(2, -16, 2, 1, dk); }
    RR(0, -14, 1, 1, '#e8a0a0');
    R(dir > 0 ? x - 7 + sh : x + 6 + sh, y - 15, 3, 1, PAL.g8); R(dir > 0 ? x + 6 + sh : x - 9 + sh, y - 15, 3, 1, PAL.g8);
    return;
  }
  // staand / lopend
  const w = pose === 'walk' ? Math.floor(t * 8) % 2 : 0;
  RR(-7, -10, 14, 6, c);
  RR(-5, -10, 2, 5, s); RR(-1, -10, 2, 5, s);
  RR(-6, -4, 2, 4 - w, c); RR(-3, -4, 2, 4 - (1 - w), c); RR(3, -4, 2, 4 - w, c); RR(5, -4, 2, 4 - (1 - w), c);
  const tw = Math.sin(t * 3) > 0 ? 1 : 0;
  RR(-9, -13 - tw, 2, 5, c); RR(-10, -15 - tw, 2, 2, c);
  RR(5, -15, 8, 7, c); RR(5, -17, 2, 2, c); RR(11, -17, 2, 2, c);
  let ex = 0;
  if (o.eyesTo && Math.abs(o.eyesTo.x - x) > 4) ex = ((o.eyesTo.x > x) === (dir > 0)) ? 1 : -1;
  if (eyeOpen) { RR(7 + ex, -13, 1, 2, PAL.yellow); RR(10 + ex, -13, 1, 2, PAL.yellow); }
  else { RR(7, -12, 2, 1, dk); RR(10, -12, 2, 1, dk); }
  RR(10, -10, 1, 1, '#e8a0a0');
}

/* ---------- Het lichtje (jij) ---------- */
function drawSpirit(x, y, t, p) {
  x = Math.round(x); y = Math.round(y);
  const moving = p && p.moving, frame = p && p.frame, sit = p && p.sit, dir = (p && p.dir) || 1;
  glow(x, y - 8, 26 + Math.sin(t * 2) * 2, '255,226,150', 0.2);
  glow(x, y - 8, 10, '255,240,200', 0.35);
  let bob = moving ? (frame ? -2 : 0) : (Math.sin(t * 3) > 0 ? -1 : 0);
  if (sit) bob = 2;
  const c = PAL.white, c2 = PAL.soft;
  if (!sit) {
    if (moving) { R(x - 3, y - 1 - (frame ? 1 : 0), 2, 1, c2); R(x + 1, y - 1 - (frame ? 0 : 1), 2, 1, c2); }
    else { R(x - 3, y - 1, 2, 1, c2); R(x + 1, y - 1, 2, 1, c2); }
  }
  const b = y + bob;
  R(x - 3, b - 8, 7, 6, c);
  R(x - 4, b - 5, 9, 3, c);
  R(x - 5, b - 3, 2, 1, c); R(x - 1, b - 2, 3, 1, c); R(x + 4, b - 3, 2, 1, c);
  R(x - 2, b - 13, 5, 5, c);
  R(x - 3, b - 12, 7, 3, c);
  const ox = dir > 0 ? 1 : 0;
  if (sit && Math.floor(t * 0.7) % 2 === 0) {
    R(x - 2 + ox, b - 11, 2, 1, PAL.g5); R(x + 1 + ox, b - 11, 2, 1, PAL.g5);
  } else {
    const blink = Math.floor(t * 10) % 37 === 0;
    R(x - 2 + ox, b - 11, 1, blink ? 1 : 2, PAL.g4);
    R(x + 1 + ox, b - 11, 1, blink ? 1 : 2, PAL.g4);
  }
  R(x - 3 + ox, b - 9, 1, 1, PAL.warm); R(x + 2 + ox, b - 9, 1, 1, PAL.warm);
  if (Math.floor(t * 2) % 5 === 0) R(x + 5, b - 16, 1, 1, PAL.yellow);
  if (sit) { const z = (t * 0.8) % 2; txt('z', x + 5 + z * 3, b - 18 - z * 6, PAL.g7, 'left', 6); }
}

/* ---------- Kleine UI-dingen ---------- */
function drawGlint(x, y, t) {
  const p = (Math.sin(t * 4 + x) + 1) / 2;
  glow(x, y, 7, '255,230,150', 0.25 + p * 0.2);
  const c = p > 0.5 ? PAL.white : PAL.yellow;
  R(x, y - 2, 1, 5, c); R(x - 2, y, 5, 1, c);
  if (p > 0.7) { R(x - 1, y - 1, 1, 1, c); R(x + 1, y + 1, 1, 1, c); R(x + 1, y - 1, 1, 1, c); R(x - 1, y + 1, 1, 1, c); }
}
function drawExitSign(x, y, t) {
  R(x + 6, y - 18, 2, 18, PAL.g4);
  R(x, y - 26, 16, 10, PAL.g5);
  R(x + 1, y - 25, 14, 8, PAL.g2);
  txt('→', x + 8, y - 26, PAL.g7, 'center', 8);
}
function drawIndicator(x, y, t) {
  const b = Math.floor(t * 3) % 2;
  y = Math.round(y - b);
  R(x - 2, y, 5, 1, PAL.yellow);
  R(x - 1, y + 1, 3, 1, PAL.yellow);
  R(x, y + 2, 1, 1, PAL.yellow);
}
