'use strict';
/* =========================================================
   main.js — spelstatus, gameloop, titelscherm, overgangen
   Statussen: TITLE -> STORY -> TRANSITION -> EXPLORE -> ACTION -> DIALOGUE -> ... -> END
   ========================================================= */

const MEMORIES = [
  { cu: 'mitten', title: 'Een verloren wantje', text: 'Een klein rood wantje, netjes op een paaltje gehangen. Iemand verloor het. Iemand anders nam de moeite om het zichtbaar op te hangen. Niemand zal ooit weten wie.' },
  { title: 'Een boodschappenlijstje', text: "In bibberig handschrift: 'koffie, melk, koekjes (voor als er iemand komt)'. Het lijstje is drie weken oud. De koekjes zijn nooit opengegaan." },
  { title: 'Een tekening van een boomhut', text: "Twee poppetjes in een boomhut. Eronder, in kindergeschrift: 'DAAN + MILAN = VOOR ALTIJD'. Het woord 'altijd' is twee keer onderstreept." },
  { title: 'Een bonnetje van de bakker', text: "Op een bonnetje aan de deur: '2x soep - al betaald, voor wie het nodig heeft.' Een uitgestelde soep. Iemand dacht aan een vreemde." },
  { title: 'Gekrast in een bank', text: "In het hout van de bank, heel klein: 'Jij bent goed zoals je bent.' Iemand schreef het hier jaren geleden. Misschien voor zichzelf." },
  { title: 'Een tekening op de koelkast', text: 'Lien tekende haar huis. Er komt rook uit de schoorsteen, en er staat een grote gele zon boven. In de tekening is het altijd warm.' },
  { title: 'Een knuffel met één oog', text: "Een versleten knuffelkonijn met één oog. Op het label: 'Yasmina, 4 jaar'. Hij verhuisde zeven keer mee. Hij is gebleven." },
  { title: 'Een sticker op het hek', text: "Een sticker met 'Welkom' in twaalf talen. Welcome. Bienvenue. Ahlan wa sahlan. Hoş geldin. Witaj. De letters zijn half weggekrast, maar het staat er nog." },
  { title: 'Een tekening in de modder', text: 'Een kind tekende een huis in de modder. Met een boom en een zon. De boom staat er niet meer. Het huis ook niet. De zon wel.' }
];

const G = {
  state: 'TITLE', t: 0, li: 0, L: null, mg: null, single: false,
  scores: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  hearts: !!Save.data.konami, fade: 0, trans: null, stuck: 0, errors: 0, restShown: false,
  titleIdx: 0
};
const P = { x: 0, y: 0, dir: 1, moving: false, frame: 0, ft: 0, idle: 0, sit: false };

function warmteScore() { return G.scores.reduce((a, b) => a + b, 0); }
function memCount() { let n = 0; for (let i = 0; i < 9; i++) if (Save.data.mem[i]) n++; return n; }

/* ---------- API voor de levels ---------- */
function say(lines, cb) { Dialog.open(lines, cb); }
function choose(title, opts, cb, cancel) { Menu.open(title, opts, cb, cancel); }
function clue(L, id) {
  if (L.clues.has(id)) return;
  L.clues.add(id);
  Sfx.clue();
  if (L.clues.size === L.need) Toast.show('Je begrijpt wat hier scheelt.', 3);
}
function understood(L) { return L.clues.size >= L.need; }
function notYet() {
  say(['* Je voelt dat je hier iets kunt doen... maar je begrijpt de situatie nog niet goed. Kijk en luister eerst wat rond. (Verder: ' + OK_KEYS + '.)']);
}
function startAction(mg) {
  G.mg = mg; G.state = 'ACTION';
  try { if (mg.start) mg.start(G.L); } catch (e) { console.error(e); }
}
function endAction() { G.mg = null; if (G.state === 'ACTION') G.state = 'EXPLORE'; }
function solve(L, lines) {
  G.mg = null; G.state = 'DIALOGUE';
  L.solved = true; L.warmTarget = 1;
  Sfx.warm();
  say(lines, () => finishLevel(1));
}
function fail(L, lines) {
  G.mg = null; G.state = 'DIALOGUE';
  L.coldEnd = true; L.coldTarget = 1;
  Sfx.cold();
  say(lines, () => finishLevel(0));
}
function memory(L, i, o) {
  const m = MEMORIES[i];
  const isNew = !Save.data.mem[i];
  if (isNew) {
    Save.data.mem[i] = true; Save.store();
    Sfx.clue();
    Toast.show('Herinnering gevonden (' + memCount() + '/9)', 3);
  }
  if (o) o.hidden = true;
  say(m.cu ? [cu(m.cu), '* ' + m.title.toUpperCase() + '.', '* ' + m.text, cuOff] : ['* ' + m.title.toUpperCase() + '.', '* ' + m.text]);
}

/* ---------- Level opbouwen ---------- */
function buildLevel(i) {
  const def = LEVELS[i];
  const L = {
    def, i, objs: [], clues: new Set(), need: def.need || 2, flags: {}, t: 0,
    warm: 0, warmTarget: 0, cold: 0, coldTarget: 0, solved: false, coldEnd: false, stay: 0,
    weather: def.weather ? makeWeather(def.weather, def.weather === 'rain' ? 90 : 70) : null
  };
  def.init(L);
  if (def.exit) {
    L.objs.push({
      id: 'exit', x: def.exit.x, y: def.exit.y - 3, w: 14, h: 4, solid: true, top: def.exit.y - 26,
      draw: (L, t, o) => drawExitSign(o.x, o.y + 3, t),
      inspect: (L) => {
        choose('* Een bordje: DOORLOPEN. Wil je wegkijken en verder gaan? Niemand zal het merken.',
          ['Nee. Ik blijf.', 'Ja. Doorlopen.'], k => {
            if (k === 1) fail(L, def.cold || ['* Je liep door.']);
            else {
              L.stay++;
              if (L.stay === 3) say(['* Je blijft. Natuurlijk blijf je.']);
            }
          }, 0);
      }
    });
  }
  return L;
}
function loadLevel(i) {
  Dialog.close(); Menu.active = false; Closeup.hide();
  G.li = i; G.mg = null;
  G.L = buildLevel(i);
  P.x = G.L.def.start.x; P.y = G.L.def.start.y; P.dir = 1; P.sit = false; P.idle = 0; P.moving = false;
  G.state = 'EXPLORE'; G.fade = 1; G.stuck = 0;
  Music.stop();
  if (G.L.def.onEnter) G.L.def.onEnter(G.L);
}
function restartLevel() {
  if (!G.L) return;
  G.scores[G.li] = 0;
  Toast.show('Hoofdstuk opnieuw gestart', 2);
  loadLevel(G.li);
}
function finishLevel(points) {
  G.scores[G.li] = points;
  if (G.single) {
    G.single = false;
    goTitle();
    Toast.show(points ? 'Hoofdstuk voltooid - warm!' : 'Hoofdstuk voltooid - koud...', 3);
    return;
  }
  if (G.li < LEVELS.length - 1) startTransition(G.li + 1);
  else Ending.start(warmteScore());
}
function startTransition(i) {
  Dialog.close(); Menu.active = false; Closeup.hide();
  G.state = 'TRANSITION'; G.trans = { i, t: 0 }; G.L = null;
  Music.stop();
}
function goTitle() {
  Dialog.close(); Menu.active = false;
  G.state = 'TITLE'; G.L = null; G.mg = null; G.titleIdx = 0;
  Music.play(SONGS.title);
}
function newGame() {
  G.scores = [0, 0, 0, 0, 0, 0, 0, 0, 0]; G.single = false;
  Save.data.plays = (Save.data.plays || 0) + 1; Save.store();
  G.state = 'STORY';
  Music.play(SONGS.title);
  const again = Save.data.plays > 1;
  say([
    '* Het is december. Het is koud.',
    '* Ergens tussen de huizen dwaalt een klein vlammetje.',
    '* Niemand kan het zien. Niemand kan het horen.',
    '* Het kan geen wonderen doen. Het kan de sneeuw niet laten smelten. Het kan geen oorlog stoppen.',
    '* Maar het kan iets anders. Iets kleins.',
    '* Het kan mensen helpen om naar elkaar om te kijken.',
    again ? '* (Welkom terug, vlammetje. Ze hebben je nog steeds nodig.)' : '* (Lopen: pijltjes of WASD. Onderzoeken en verder: Z, spatie of enter. Tekst versnellen: X of SHIFT. Hoofdstuk herstarten: R of ESC. Geluid: M. Feedback geven: F.)'
  ], () => startTransition(0));
}

/* ---------- Speler bewegen ---------- */
function blocked(L, x, y) {
  const b = L.def.bounds;
  const r = { x: x - 3, y: y - 3, w: 7, h: 4 };
  if (r.x < b.x || r.y < b.y || r.x + r.w > b.x + b.w || r.y + r.h > b.y + b.h) return true;
  for (const o of L.objs) if (o.solid && !o.hidden && rectHit(r, o)) return true;
  if (L.walls) for (const w of L.walls) if (rectHit(r, w)) return true;
  return false;
}
function movePlayer(L, dt) {
  let dx = 0, dy = 0;
  if (Input.held('left')) dx -= 1;
  if (Input.held('right')) dx += 1;
  if (Input.held('up')) dy -= 1;
  if (Input.held('down')) dy += 1;
  const sp = 62 * dt;
  if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
  P.moving = !!(dx || dy);
  if (dx) P.dir = dx > 0 ? 1 : -1;
  // wie al vastzit mag altijd bewegen (nooit vastlopen)
  const wasStuck = blocked(L, P.x, P.y);
  if (dx && (wasStuck || !blocked(L, P.x + dx * sp, P.y))) P.x += dx * sp;
  if (dy && (wasStuck || !blocked(L, P.x, P.y + dy * sp))) P.y += dy * sp;
  const b = L.def.bounds;
  P.x = clamp(P.x, b.x + 3, b.x + b.w - 4);
  P.y = clamp(P.y, b.y + 3, b.y + b.h - 1);
  if (P.moving) {
    P.idle = 0; P.sit = false;
    P.ft += dt;
    if (P.ft > 0.17) { P.ft = 0; P.frame ^= 1; Sfx.step(); }
  } else {
    P.idle += dt;
    if (P.idle > 25 && !P.sit) {
      P.sit = true;
      if (!G.restShown) { G.restShown = true; Toast.show('Ook een vlammetje mag even rusten.', 4); }
    }
  }
}
function nearest(L) {
  let best = null, bd = 11;
  const px = P.x, py = P.y - 2;
  for (const o of L.objs) {
    if (!o.inspect || o.hidden) continue;
    const dx = Math.max(o.x - px, 0, px - (o.x + o.w));
    const dy = Math.max(o.y - py, 0, py - (o.y + o.h));
    const d = Math.hypot(dx, dy);
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
function interact(L) {
  const o = nearest(L);
  if (!o) { pokeEgg(L); return; }
  P.sit = false; P.idle = 0;
  o.n = (o.n || 0) + 1;
  if (o.clue) clue(L, o.clue);
  o.inspect(L, o);
  eggFromObj(L, o);
}

/* ---------- Update ---------- */
function updateLevel(dt) {
  const L = G.L;
  if (!L) return;
  L.t += dt;
  L.warm += (L.warmTarget - L.warm) * Math.min(1, dt * 1.2);
  L.cold += (L.coldTarget - L.cold) * Math.min(1, dt * 1.2);
  updateWeather(L.weather, dt, G.t);
  if (L.def.update) L.def.update(L, dt);
  eggsUpdate(L, dt);
  if (L.npcs) L.npcs.forEach(ob => { npcUpdate(ob.npc, dt); ob.sync(); });
  if (L.doors) L.doors.forEach(d => doorUpdate(d, dt));
  if (G.fade > 0) G.fade = Math.max(0, G.fade - dt * 1.5);

  if (Input.hit('restart') && !Menu.active) { restartLevel(); return; }
  if (Menu.active) { Menu.update(); return; }
  if (Dialog.active) { Dialog.update(dt); P.moving = false; return; }

  if (G.state === 'ACTION' && G.mg) {
    const mg = G.mg;
    mg.update(L, dt);
    if (G.mg === mg && mg.allowMove) movePlayer(L, dt); else P.moving = false;
    if (G.mg === mg && mg.allowInteract && Input.hit('ok')) interact(L);
    return;
  }
  if (G.state === 'ACTION' && !G.mg) G.state = 'EXPLORE';
  if (G.state === 'EXPLORE') {
    movePlayer(L, dt);
    if (Input.hit('ok')) interact(L);
    return;
  }
  if (G.state === 'DIALOGUE') {
    // vangnet: nooit vastzitten in een leeg dialoogscherm
    G.stuck += dt;
    if (G.stuck > 1.5) {
      G.stuck = 0;
      if (L.solved) finishLevel(1);
      else if (L.coldEnd) finishLevel(0);
      else G.state = 'EXPLORE';
    }
  }
}

function update(dt) {
  G.t += dt;
  Toast.update(dt);
  Closeup.update(dt);
  if (Input.hit('mute')) {
    Sfx.muted = !Sfx.muted;
    if (Sfx.muted) Music.stop();
    Toast.show(Sfx.muted ? 'Geluid uit' : 'Geluid aan', 1.5);
  }
  if (G.state !== 'DIALOGUE') G.stuck = 0;
  if (Menu.active && G.state !== 'TITLE' && !G.L && G.state !== 'STORY') { Menu.update(); return; }
  switch (G.state) {
    case 'TITLE': Title.update(dt); break;
    case 'MEMS': Mems.update(dt); break;
    case 'ABOUT': About.update(dt); break;
    case 'EGGS': Eggs.update(dt); break;
    case 'STORY':
      if (Menu.active) Menu.update(); else if (Dialog.active) Dialog.update(dt); else startTransition(0);
      break;
    case 'TRANSITION': {
      const tr = G.trans;
      tr.t += dt;
      if (tr.t > 0.8 && Input.hit('ok')) loadLevel(tr.i);
      break;
    }
    case 'END': Ending.update(dt); break;
    default: updateLevel(dt);
  }
}

/* ---------- Tekenen ---------- */
function drawLevel() {
  const L = G.L, def = L.def, t = L.t;
  R(0, 0, W, H, PAL.black);
  def.drawBg(L, t);
  const list = [];
  L.objs.forEach(o => { if (o.draw && !o.gone) list.push({ y: o.sortY !== undefined ? o.sortY : o.y + o.h, f: () => o.draw(L, t, o) }); });
  list.push({ y: P.y + 0.5, f: () => drawSpirit(P.x, P.y - (P.hop > 0 ? Math.round(Math.sin(P.hop / 0.5 * Math.PI) * 6) : 0), G.t, P) });
  list.sort((a, b) => a.y - b.y);
  list.forEach(d => d.f());
  eggsDraw(L, t);
  if (def.drawFg) def.drawFg(L, t);
  drawWeather(L.weather, G.hearts);
  // warmte en kou over de scène
  if (L.warm > 0.01) {
    const c = def.warmAt || { x: W / 2, y: 130 };
    glow(c.x, c.y, 170, '255,180,90', 0.22 * L.warm);
  }
  if (L.cold > 0.01) { ctx.globalAlpha = 0.45 * L.cold; R(0, 0, W, H, '#05070a'); ctx.globalAlpha = 1; }
  // HUD
  if (!Dialog.active && !Menu.active) {
    txt((L.i + 1) + ' · ' + def.title, 6, 5, PAL.g6, 'left', 7);
    if (!L.solved && !L.coldEnd) {
      const n = L.need, have = Math.min(L.clues.size, n);
      txt('BEGRIP', W - 14 - n * 7, 5, PAL.g6, 'right', 7);
      for (let i = 0; i < n; i++) {
        const on = i < have;
        R(W - 10 - (n - i) * 7 + 2, 7, 5, 5, on ? (have >= n ? PAL.yellow : PAL.g8) : PAL.g4);
        if (!on) R(W - 10 - (n - i) * 7 + 3, 8, 3, 3, PAL.black);
      }
    }
  }
  // interactie-pijltje
  const canInteract = (G.state === 'EXPLORE' || (G.state === 'ACTION' && G.mg && G.mg.allowInteract));
  if (canInteract && !Dialog.active && !Menu.active) {
    const o = nearest(L);
    if (o) drawIndicator(o.x + o.w / 2, o.top !== undefined ? o.top : o.y - 24, G.t);
  }
  if (G.state === 'ACTION' && G.mg && G.mg.draw) G.mg.draw(L, t);
  Dev.draw();
  Closeup.draw();
  Dialog.top = !Closeup.id && (L.dlgTop !== undefined ? L.dlgTop : P.y > 150);
  Menu.draw();
  Dialog.draw();
  if (G.fade > 0) { ctx.globalAlpha = G.fade; R(0, 0, W, H, PAL.black); ctx.globalAlpha = 1; }
}

function drawTransition() {
  const tr = G.trans, def = LEVELS[tr.i];
  R(0, 0, W, H, PAL.black);
  const a = Math.min(1, tr.t * 1.2);
  ctx.globalAlpha = a;
  txt('HOOFDSTUK ' + (tr.i + 1), W / 2, 62, PAL.g6, 'center', 8);
  txt(def.title, W / 2, 80, PAL.white, 'center', 12);
  txt(def.place, W / 2, 100, PAL.g7, 'center', 7);
  wrap(def.quote || '', 250, 7).forEach((l, i) => txt(l, W / 2, 132 + i * 10, PAL.warm, 'center', 7));
  // kleine warmteteller als lichtjes
  for (let i = 0; i < 9; i++) {
    const done = i < tr.i;
    const x = W / 2 - 44 + i * 11, y = 186;
    if (done && G.scores[i]) { glow(x + 2, y + 2, 7, '255,200,110', 0.5); R(x, y, 5, 5, PAL.yellow); }
    else if (done) R(x, y, 5, 5, PAL.g4);
    else { R(x, y, 5, 5, PAL.g3); R(x + 1, y + 1, 3, 3, PAL.black); }
  }
  if (tr.t > 0.8 && Math.floor(G.t * 2) % 2 === 0) txt('[' + OK_KEYS + ']', W / 2, 212, PAL.g7, 'center', 7);
  ctx.globalAlpha = 1;
}

/* ---------- Titelscherm ---------- */
const titleSnow = makeWeather('snow', 60);
const Title = {
  opts() {
    const o = ['Nieuw spel'];
    if (Object.keys(Save.data.endings || {}).length) o.push('Hoofdstuk kiezen');
    o.push('Herinneringen (' + memCount() + '/9)');
    o.push('Over ons');
    o.push(Sfx.muted ? 'Geluid: uit' : 'Geluid: aan');
    return o;
  },
  update(dt) {
    updateWeather(titleSnow, dt, G.t);
    if (Menu.active) { Menu.update(); return; }
    const o = this.opts();
    G.titleIdx = Math.min(G.titleIdx, o.length - 1);
    // verborgen: boven 'Nieuw spel' kun je nog één keer omhoog, naar het vlammetje zelf (-1)
    if (Input.hit('up')) { G.titleIdx = G.titleIdx === 0 ? -1 : G.titleIdx === -1 ? o.length - 1 : G.titleIdx - 1; Sfx.select(); }
    if (Input.hit('down')) { G.titleIdx = (G.titleIdx + 1) % o.length; Sfx.select(); }
    if (Input.hit('ok') && G.titleIdx === -1) { Sfx.unlock(); Sfx.ok(); Eggs.open(); return; }
    if (Input.hit('ok')) {
      Sfx.unlock(); Sfx.ok();
      Music.play(SONGS.title);
      const s = o[G.titleIdx];
      if (s === 'Nieuw spel') newGame();
      else if (s === 'Hoofdstuk kiezen') {
        Menu.open('Welk hoofdstuk wil je (opnieuw) spelen?', LEVELS.map((l, i) => (i + 1) + '. ' + l.title).concat(['Terug']), k => {
          if (k >= LEVELS.length) return;
          G.single = true; G.scores = [0, 0, 0, 0, 0, 0, 0, 0, 0];
          startTransition(k);
        }, LEVELS.length);
      }
      else if (s.indexOf('Herinneringen') === 0) { G.state = 'MEMS'; Mems.idx = 0; }
      else if (s === 'Over ons') { G.state = 'ABOUT'; About.scroll = 0; }
      else { Sfx.muted = !Sfx.muted; if (Sfx.muted) Music.stop(); else Music.play(SONGS.title); }
    }
  },
  draw() {
    R(0, 0, W, H, PAL.black);
    // dorpje onderaan
    R(0, 196, W, 44, PAL.g1);
    const lit = Save.data.endings && Save.data.endings.warm ? 9 : 2;
    house(20, 168, 46, 28, lit > 2 ? 4 : 1, G.t);
    house(250, 164, 52, 32, lit > 2 ? 4 : 1, G.t);
    house(80, 176, 30, 20, 0, G.t);
    house(206, 174, 34, 22, lit > 2 ? 2 : 0, G.t);
    drawWeather(titleSnow, G.hearts);
    // titel
    glow(W / 2, 40, 90, '255,200,120', 0.12 + Math.sin(G.t) * 0.03);
    drawLogo(W / 2 - 24, 4, 48);
    txt('EEN WARME THUIS', W / 2 + 1, 58, PAL.g4, 'center', 20);
    txt('EEN WARME THUIS', W / 2, 57, PAL.white, 'center', 20);
    txt('een klein verhaal over omkijken naar elkaar', W / 2, 80, PAL.g8, 'center', 7);
    if (G.titleIdx === -1) glow(W / 2, 108, 26, '255,200,110', 0.35 + Math.sin(G.t * 4) * 0.08);
    drawSpirit(W / 2, 120, G.t, { moving: false, dir: 1 });
    if (G.titleIdx === -1) {
      heart(W / 2 - 22, 106, PAL.red);
      txt('verrassingen (' + eggCount() + '/' + (EGG_TOTAL + 1) + ')', W / 2 + 12, 107, PAL.yellow, 'left', 7);
    }
    // menu
    const o = this.opts();
    o.forEach((s, i) => {
      const y = 130 + i * 12, sel = i === G.titleIdx;
      if (sel) heart(W / 2 - textW(s, 8) / 2 - 12, y + 1, PAL.red);
      txt(s, W / 2, y, sel ? PAL.yellow : PAL.white, 'center', 8);
    });
    // behaalde eindes
    const e = Save.data.endings || {};
    const ends = [['koud', e.cold, PAL.g7], ['lauw', e.neutral, PAL.warm], ['warm', e.warm, PAL.orange]];
    ends.forEach((en, i) => {
      const x = 8 + i * 22;
      if (en[1]) { R(x, 228, 5, 5, en[2]); } else { R(x, 228, 5, 5, PAL.g4); R(x + 1, 229, 3, 3, PAL.black); }
    });
    txt('Z/spatie/enter = kiezen   M = geluid', W - 6, 228, PAL.g5, 'right', 6);
    Menu.draw();
  }
};

/* ---------- Het logo van De Warmste Week (img/dww-logo.png) ---------- */
const LOGO = new Image();
LOGO.src = 'img/dww-logo.png';
function drawLogo(x, y, size) {
  if (!LOGO.complete || !LOGO.naturalWidth) return;
  const h = size * LOGO.naturalHeight / LOGO.naturalWidth;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(LOGO, x, y, size, h);
  ctx.imageSmoothingEnabled = false;
}

/* ---------- Over ons (de tekst staat in js/about.js) ---------- */
const About = {
  scroll: 0,
  lines() {
    const out = [];
    OVER_ONS.alineas.forEach(a => { if (!a) out.push(''); else wrap(a, 268, 8).forEach(l => out.push(l)); });
    return out;
  },
  update() {
    const max = Math.max(0, this.lines().length - 11);
    if (Input.hit('up') && this.scroll > 0) { this.scroll--; Sfx.select(); }
    if (Input.hit('down') && this.scroll < max) { this.scroll++; Sfx.select(); }
    if (Input.hit('ok') || Input.hit('skip') || Input.hit('restart')) { Sfx.ok(); G.state = 'TITLE'; G.titleIdx = Title.opts().indexOf('Over ons'); }
  },
  draw() {
    R(0, 0, W, H, PAL.black);
    glow(W / 2, 30, 60, '255,200,120', 0.12);
    drawLogo(W / 2 - 24, 6, 48);
    txt(OVER_ONS.titel, W / 2, 58, PAL.white, 'center', 10);
    const ls = this.lines();
    ls.slice(this.scroll, this.scroll + 11).forEach((l, i) => txt(l, 26, 78 + i * 12, PAL.g9, 'left', 8));
    if (this.scroll > 0) txt('▲', W - 16, 76, PAL.g6, 'center', 7);
    if (this.scroll + 11 < ls.length) txt('▼', W - 16, 202, PAL.g6, 'center', 7);
    txt(OK_KEYS + ' = terug', W / 2, 224, PAL.g5, 'center', 6);
  }
};

/* ---------- Verborgen: overzicht van de verrassingen (easter eggs) ---------- */
function eggCount() { return Object.keys(Save.data.eggs || {}).length + (Save.data.konamiFound ? 1 : 0); }
const Eggs = {
  idx: 0,
  list() {
    const out = [];
    Object.keys(EGGS).forEach(k => EGGS[k].forEach(e => out.push({ key: 'h' + (+k + 1) + '_' + e.id, name: e.name, h: +k + 1 })));
    out.push({ key: 'lichtje', name: SPIRIT_EGG.name, h: 0 });
    out.push({ key: 'konami', name: 'Het sneeuwt hartjes', h: -1 });
    return out;
  },
  found(e) { return e.key === 'konami' ? !!Save.data.konamiFound : !!(Save.data.eggs || {})[e.key]; },
  open() { G.state = 'EGGS'; this.idx = 0; },
  update() {
    if (Dialog.active) { Dialog.update(1 / 60); return; }
    const l = this.list(), n = l.length + 1;
    if (Input.hit('up')) { this.idx = (this.idx + n - 1) % n; Sfx.select(); }
    if (Input.hit('down')) { this.idx = (this.idx + 1) % n; Sfx.select(); }
    if (Input.hit('skip') || Input.hit('restart') || (Input.hit('ok') && this.idx === l.length)) { Sfx.ok(); goTitle(); G.titleIdx = -1; return; }
    if (Input.hit('ok')) {
      const e = l[this.idx];
      if (this.found(e)) say(['* ' + e.name + (e.h > 0 ? ' (hoofdstuk ' + e.h + ')' : '') + '. Goed gezocht!']);
      else if (e.h > 0) say(['* Ergens in hoofdstuk ' + e.h + ' gebeurt iets kleins. Klik eens op de achtergrond, of bekijk iets een tweede keer...']);
      else if (e.h === 0) say(['* Heb je al eens op jezelf geklikt?']);
      else say(['* Een heel oude geheime code uit de spelletjeswereld. Acht pijltjes... en twee letters.']);
    }
  },
  draw() {
    R(0, 0, W, H, PAL.black);
    txt('VERRASSINGEN', W / 2, 8, PAL.yellow, 'center', 10);
    txt('psst... dit menu is geheim (' + eggCount() + '/' + (EGG_TOTAL + 1) + ' gevonden)', W / 2, 22, PAL.g7, 'center', 6);
    const l = this.list();
    for (let i = 0; i <= l.length; i++) {
      const y = 36 + i * 12, sel = i === this.idx;
      const e = l[i];
      const s = !e ? 'Terug' : (e.h > 0 ? 'H' + e.h : e.h === 0 ? '  ' : '  ') + '  ' + (this.found(e) ? e.name : '? ? ?');
      if (sel) heart(30, y + 1, PAL.red);
      txt(s, 44, y, sel ? PAL.yellow : (!e || this.found(e) ? PAL.white : PAL.g5), 'left', 8);
      if (e && this.found(e)) drawGlint(24, y + 4, G.t + i);
    }
    Dialog.draw();
  }
};

/* ---------- Herinneringenscherm ---------- */
const Mems = {
  idx: 0,
  update() {
    if (Dialog.active) { Dialog.update(1 / 60); return; }
    if (Input.hit('up')) { this.idx = (this.idx + 9) % 10; Sfx.select(); }
    if (Input.hit('down')) { this.idx = (this.idx + 1) % 10; Sfx.select(); }
    if (Input.hit('skip') || (Input.hit('ok') && this.idx === 9)) { Sfx.ok(); goTitle(); return; }
    if (Input.hit('ok')) {
      const m = MEMORIES[this.idx];
      if (Save.data.mem[this.idx]) say(['* ' + m.text]);
      else say(['* Deze herinnering heb je nog niet gevonden. Ergens in hoofdstuk ' + (this.idx + 1) + ' glinstert iets...']);
    }
  },
  draw() {
    R(0, 0, W, H, PAL.black);
    txt('HERINNERINGEN', W / 2, 12, PAL.white, 'center', 10);
    txt('kleine dingen die niemand zag', W / 2, 26, PAL.g7, 'center', 7);
    for (let i = 0; i < 10; i++) {
      const y = 44 + i * 12, sel = i === this.idx;
      const s = i === 9 ? 'Terug' : (i + 1) + '. ' + (Save.data.mem[i] ? MEMORIES[i].title : '? ? ?');
      if (sel) heart(40, y + 1, PAL.red);
      txt(s, 54, y, sel ? PAL.yellow : (Save.data.mem[i] || i === 9 ? PAL.white : PAL.g5));
      if (i < 9 && Save.data.mem[i]) drawGlint(28, y + 4, G.t + i);
    }
    Dialog.draw();
  }
};

function drawStory() {
  R(0, 0, W, H, PAL.black);
  drawSpirit(W / 2, 100, G.t, { moving: false, dir: 1 });
  Dialog.draw();
}

function draw() {
  resetTransform();
  Dialog.top = false;
  switch (G.state) {
    case 'TITLE': Title.draw(); break;
    case 'MEMS': Mems.draw(); break;
    case 'ABOUT': About.draw(); break;
    case 'EGGS': Eggs.draw(); break;
    case 'STORY': drawStory(); break;
    case 'TRANSITION': drawTransition(); break;
    case 'END': Ending.draw(); break;
    default: if (G.L) drawLevel();
  }
  if (Menu.active && !G.L && G.state !== 'TITLE' && G.state !== 'STORY') Menu.draw();
  Toast.draw();
}

/* ---------- Dev-systeem: ` (backtick) of URL #h1..#h9 / #warm / #lauw / #koud ---------- */
const Dev = {
  boxes: false,
  menu() {
    if (Menu.active || Feedback.open) return;
    Dialog.close();
    const opts = ['Ga naar hoofdstuk...', 'Alle aanwijzingen geven (begrip vol)', 'Hoofdstuk meteen oplossen (warm)', 'Botsingsvakken: ' + (this.boxes ? 'aan' : 'uit'),
      'Einde: warm', 'Einde: lauw', 'Einde: koud', 'Alle herinneringen vrijspelen', 'Titelscherm', 'Sluiten'];
    Menu.open('DEV-MENU', opts, k => {
      if (k === 0) Menu.open('Naar welk hoofdstuk?', LEVELS.map((l, i) => (i + 1) + '. ' + l.title), i => this.go(i), -1);
      else if (k === 1 && G.L) { Object.values(G.L.objs).forEach(o => { if (o.clue) G.L.clues.add(o.clue); }); Toast.show('Begrip vol', 2); }
      else if (k === 2 && G.L) { finishLevel(1); }
      else if (k === 3) { this.boxes = !this.boxes; }
      else if (k >= 4 && k <= 6) this.ending([9, 6, 1][k - 4]);
      else if (k === 7) { for (let i = 0; i < 9; i++) Save.data.mem[i] = true; Save.store(); Toast.show('Alle herinneringen', 2); }
      else if (k === 8) goTitle();
    }, 9);
  },
  go(i) { G.single = false; G.scores = G.scores.map((s, j) => j < i ? 1 : 0); Music.stop(); loadLevel(i); Toast.show('DEV: hoofdstuk ' + (i + 1), 2); },
  ending(s) { G.scores = [0, 0, 0, 0, 0, 0, 0, 0, 0].map((x, i) => i < s ? 1 : 0); Dialog.close(); Ending.start(s); },
  fromHash() {
    const h = (location.hash || '').slice(1).toLowerCase();
    const m = h.match(/^h([1-9])$/);
    if (m) this.go(+m[1] - 1);
    else if (h === 'warm') this.ending(9);
    else if (h === 'lauw') this.ending(6);
    else if (h === 'koud') this.ending(1);
  },
  draw() {
    if (!this.boxes || !G.L) return;
    const L = G.L, b = L.def.bounds;
    ctx.strokeStyle = 'rgba(0,255,255,0.7)'; ctx.lineWidth = 0.5; ctx.strokeRect(b.x, b.y, b.w, b.h);
    L.objs.forEach(o => {
      if (o.hidden) return;
      ctx.strokeStyle = o.solid ? 'rgba(255,60,60,0.9)' : 'rgba(80,255,80,0.8)';
      ctx.strokeRect(o.x + 0.5, o.y + 0.5, o.w, o.h);
      txt(o.id || '?', o.x, o.y + o.h + 1, o.solid ? '#ff8080' : '#80ff80', 'left', 4);
    });
    ctx.strokeStyle = '#ffff00'; ctx.strokeRect(P.x - 3, P.y - 3, 7, 4);
    txt(Math.round(P.x) + ',' + Math.round(P.y), P.x + 6, P.y - 4, '#ffff00', 'left', 4);
  }
};
window.addEventListener('keydown', e => {
  if (Feedback.open) return;
  if (e.code === 'Backquote' && !e.repeat) { e.preventDefault(); Dev.menu(); }
});
window.addEventListener('hashchange', () => Dev.fromHash());

/* ---------- Easter egg: Konami-code ---------- */
Input.onSeq = function (seq) {
  const k = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  const s = seq.slice(-10);
  if (s.length === 10 && s.every((c, i) => c === k[i])) {
    G.hearts = !G.hearts;
    Save.data.konami = G.hearts; Save.data.konamiFound = true; Save.store();
    Toast.show(G.hearts ? '♥ Het sneeuwt hartjes ♥' : 'Gewone sneeuw', 3);
    Sfx.warm();
  }
};

/* ---------- Aanraakbediening (gsm/tablet) ---------- */
(function setupTouch() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
  if (isTouch) document.body.classList.add('touch');
  document.querySelectorAll('#touch button[data-act]').forEach(b => {
    const a = b.dataset.act;
    const on = e => { e.preventDefault(); Sfx.unlock(); Input.press(a); b.classList.add('on'); };
    const off = e => { e.preventDefault(); Input.release(a); b.classList.remove('on'); };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('pointerleave', off);
  });
  cv.addEventListener('pointerdown', e => {
    Sfx.unlock();
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const lx = (e.clientX - r.left) / r.width * W, ly = (e.clientY - r.top) / r.height * H;
    // verborgen: op het titelscherm op het vlammetje klikken opent de verrassingen
    if (G.state === 'TITLE' && !Menu.active && Math.abs(lx - W / 2) < 9 && ly > 96 && ly < 122) { Sfx.ok(); Eggs.open(); return; }
    clickEgg(lx, ly);
  });
  const fb = document.getElementById('fbtn');
  if (fb) fb.addEventListener('pointerdown', e => { e.preventDefault(); Feedback.show(); });
})();

/* ---------- Gameloop ---------- */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  try {
    if (!Feedback.open) update(dt);
    draw();
    if (Feedback.open) { ctx.globalAlpha = 0.5; R(0, 0, W, H, PAL.black); ctx.globalAlpha = 1; txt('PAUZE', W / 2, 8, PAL.yellow, 'center', 10); }
  } catch (e) {
    console.error(e);
    G.errors++;
    Dialog.close(); Menu.active = false; G.mg = null;
    if (G.L) G.state = 'EXPLORE'; else G.state = 'TITLE';
    Toast.show('Oeps! Druk R om het hoofdstuk te herstarten.', 4);
  }
  Input.endFrame();
  requestAnimationFrame(loop);
}
goTitle();
Dev.fromHash();
requestAnimationFrame(loop);
