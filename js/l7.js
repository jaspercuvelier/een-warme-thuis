'use strict';
/* ========== HOOFDSTUK 7: JONGERE UIT JEUGDZORG ========== */
LEVELS.push({
  title: 'Achttien worden',
  place: 'Een kamer in een leefgroep · de avond voor haar verjaardag',
  quote: 'Niemand wordt volwassen in zijn eentje.',
  bounds: { x: 12, y: 108, w: 296, h: 96 },
  start: { x: 40, y: 186 },
  exit: { x: 290, y: 190 },
  warmAt: { x: 160, y: 120 },
  need: 2,
  cold: ['* Je liet de twijfels winnen.', '* Yasmina plakte de laatste doos dicht.', '* Er stond geen adres op.'],
  init(L) {
    const yas = L.yas = makeNPC({ x: 146, y: 150, dir: 1, sit: true,
      look: { hairStyle: 'curlylong', hair: PAL.g1, skin: '#b89a80', coat: PAL.g7, pants: '#4a4a5a', expr: 'worried' } });
    const els = L.els = makeNPC({ x: 262, y: 140, dir: -1, sit: true, speed: 24,
      look: { hairStyle: 'bun', hair: '#6a5040', coat: '#5a6a5a', pants: PAL.g3, glasses: true, expr: 'worried' } });
    npcObj(L, yas, { id: 'yasmina', clue: 'yasmina',
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? ['* Yasmina zit op een verhuisdoos. Morgen wordt ze achttien.',
        ['Yasmina', '(Morgen moet ik hier weg. Wie gaat er nu verhuren aan iemand zonder vast loon? Zonder ouders die garant staan?)'],
        ['Yasmina', '(Misschien moet ik gewoon niet te veel hopen. Dan valt het ook niet tegen.)']] :
        [['Yasmina', '(Ik heb nog nooit een plek gehad die echt van mij was.)']]); } });
    npcObj(L, els, { id: 'els', clue: 'els',
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Els, de mentor, scrolt door huuradvertenties.', '* "Geen OCMW." "Garantie: drie maanden huur." "Enkel werkenden." Haar kaak spant zich.', ['Els', '(Ze verdient zoveel beter dan dit. Maar wat kan ik nog doen?)']]); return; }
        say(['* De twijfels zweven als donkere wolkjes door de kamer. Ook in het hoofd van Els.',
          '* Help haar vertrouwen terug te vinden: vang 3 lichtjes van ZELFVERTROUWEN en KANSEN binnen 10 seconden.',
          '* Ontwijk de TWIJFELS. (Bewegen met de pijltjes.)'], () => startAction(soulAction7()));
      } });
    L.objs.push({ id: 'dozenblok', x: 136, y: 140, w: 40, h: 12, solid: true, sortY: 149 });
    L.objs.push({ id: 'dozen', x: 100, y: 140, w: 34, h: 12, solid: true, sortY: 149, top: 112,
      draw: () => { box3(100, 152, 18, 16, 'Y.'); box3(102, 136, 14, 10); box3(120, 152, 14, 12); box3(138, 152, 16, 9); box3(158, 152, 16, 9); },
      inspect: (L, o) => say(o.n === 1 ? ['* Verhuisdozen. Op elke doos staat in viltstift: "Spullen Yasmina".', '* Alles wat ze heeft, past in drie dozen.'] :
        ['* Op de zijkant van de onderste doos staan oude adressen, doorstreept. Eén, twee, drie... zeven.']) });
    L.objs.push({ id: 'bureau', x: 222, y: 124, w: 36, h: 8, solid: true, sortY: 139, top: 100,
      draw: (L) => { table(222, 140, 34, '#5a5a5e'); R(228, 118, 18, 7, PAL.g4); R(230, 119, 14, 5, L.solved ? PAL.warm : '#a0b0c0'); R(226, 124, 22, 2, PAL.g5); chair(262, 141, -1, '#3a3a44'); } });
    L.objs.push({ id: 'bed', x: 16, y: 118, w: 52, h: 12, solid: true, top: 84,
      draw: () => { R(16, 104, 4, 26, '#4a4a50'); R(64, 112, 4, 18, '#4a4a50'); R(18, 112, 48, 10, PAL.g7); R(18, 112, 48, 2, PAL.g8); for (let i = 22; i < 64; i += 6) R(i, 116, 1, 1, PAL.g6); R(18, 122, 48, 3, '#4a4a50'); },
      inspect: () => say(['* Het bed is al afgehaald. Alleen de matras ligt er nog.', '* Op de matras: een kuiltje in de vorm van iemand die veel heeft gepiekerd.']) });
    L.objs.push({ id: 'kast', x: 76, y: 104, w: 30, h: 5, solid: true, top: 34,
      draw: () => { R(76, 40, 30, 66, '#4a3e34'); R(78, 42, 26, 62, '#18140f'); R(78, 46, 26, 1, PAL.g6); R(84, 47, 1, 4, PAL.g6); R(84, 51, 5, 1, PAL.g6); R(95, 47, 1, 4, PAL.g6); R(95, 51, 5, 1, PAL.g6); R(104, 42, 6, 62, '#5a4e44'); },
      inspect: () => say(['* Een lege kleerkast. Twee kleerhangers.', '* Een van die twee tikt zachtjes tegen de wand als het waait.']) });
    lookObj(L, 'muur', 196, 104, 60, 3, 30, ['* Lichte vlekken op de muur, met stukjes plakband in de hoeken.', '* Hier hingen posters. Een concert. Een stad die ze ooit wil zien. Ze zitten al in een doos.']);
    lookObj(L, 'kalender', 116, 104, 18, 3, 30, ['* Op de kalender is morgen omcirkeld. Er staat niets bij.', '* Geen feestje. Geen "Hiep hiep". Gewoon een cirkel.']);
    memObj(L, 6, 70, 140, 10, 5, () => { R(70, 132, 8, 10, PAL.g7); R(70, 126, 2, 7, PAL.g7); R(76, 126, 2, 7, PAL.g7); R(72, 135, 1, 1, PAL.black); R(72, 138, 4, 1, PAL.g5); R(75, 135, 1, 1, PAL.g5); }, 82, 126);
  },
  update(L, dt) { },
  drawBg(L, t) {
    roomShell({ wall: '#2a2830', wall2: '#2e2c34', pattern: 'panel', floor: 'carpet', floorC: '#2e2c30', floorL: '#38363a', trim: '#4a4850' });
    winFrame(140, 22, 40, 36, { frame: PAL.g6, outside: (x, y, w, h) => { R(x, y, w, h, '#0e1420'); facade(x - 4, y + 6, 50, 34, { c: '#1c1c22', cols: 3, rows: 1, lit: [1] }); for (let i = 0; i < 6; i++) R(x + ((i * 11 + t * 3) % w), y + ((i * 17 + t * 9) % h), 1, 1, PAL.g8); } });
    if (L.flags.plant) plant(160, 66, 0.7, false);
    // plakbandsporen
    R(198, 26, 22, 28, '#302e36'); R(232, 32, 16, 20, '#302e36'); R(254, 24, 18, 24, '#302e36');
    [[198, 26], [218, 26], [198, 52], [218, 52], [232, 32], [246, 50], [254, 24], [270, 46]].forEach(p => R(p[0], p[1], 2, 2, '#c8c0a0'));
    // kalender
    R(116, 28, 18, 22, PAL.g8); R(116, 28, 18, 4, PAL.g5);
    ctx.strokeStyle = PAL.red; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(127, 42, 3, 0, 7); ctx.stroke();
    // peertje aan het plafond
    const sw = L.swing ? Math.round(Math.sin(L.t * 5) * L.swing * 5) : 0;
    ctx.strokeStyle = PAL.g5; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(160.5, 8); ctx.lineTo(160.5 + sw, 18); ctx.stroke();
    const fl = L.swing > 0.3 && Math.random() < 0.15;
    R(158 + sw, 18, 5, 5, fl ? PAL.g6 : L.solved ? PAL.yellow : PAL.g8); glow(160 + sw, 20, 30, '255,230,170', fl ? 0.05 : L.solved ? 0.35 : 0.15);
    outlet(204, 94);
  }
});

function soulAction7() {
  const GOOD = ['ZELFVERTROUWEN', 'KANSEN'];
  const BAD = ['TWIJFEL', 'TE JONG', 'GEEN LOON', 'NIEMAND'];
  return {
    t: 0, limit: 10, caught: 0, items: [], spawnG: 0.4, spawnB: 0.2, inv: 0, done: false,
    A: { x: 90, y: 34, w: 140, h: 110 }, h: { x: 160, y: 89 },
    update(L, dt) {
      if (this.done) return;
      const A = this.A, h = this.h;
      this.t += dt;
      let dx = 0, dy = 0;
      if (Input.held('left')) dx--; if (Input.held('right')) dx++;
      if (Input.held('up')) dy--; if (Input.held('down')) dy++;
      h.x = clamp(h.x + dx * 80 * dt, A.x + 5, A.x + A.w - 5);
      h.y = clamp(h.y + dy * 80 * dt, A.y + 5, A.y + A.h - 5);
      this.spawnG -= dt; this.spawnB -= dt;
      const spawn = (good) => {
        const side = Math.floor(Math.random() * 4), sp = good ? rnd(22, 34) : rnd(30, 48);
        let x, y, vx, vy;
        if (side === 0) { x = A.x - 8; y = rnd(A.y + 8, A.y + A.h - 8); vx = sp; vy = rnd(-10, 10); }
        else if (side === 1) { x = A.x + A.w + 8; y = rnd(A.y + 8, A.y + A.h - 8); vx = -sp; vy = rnd(-10, 10); }
        else if (side === 2) { y = A.y - 8; x = rnd(A.x + 8, A.x + A.w - 8); vy = sp; vx = rnd(-10, 10); }
        else { y = A.y + A.h + 8; x = rnd(A.x + 8, A.x + A.w - 8); vy = -sp; vx = rnd(-10, 10); }
        const list = good ? GOOD : BAD;
        this.items.push({ x, y, vx, vy, good, label: list[Math.floor(Math.random() * list.length)], life: 8 });
      };
      if (this.spawnG <= 0) { spawn(true); this.spawnG = 1.3; }
      if (this.spawnB <= 0) { spawn(false); this.spawnB = 0.75; }
      if (this.inv > 0) this.inv -= dt;
      this.items.forEach(it => {
        it.x += it.vx * dt; it.y += it.vy * dt; it.life -= dt;
        if (Math.hypot(it.x - h.x, it.y - h.y) < 7) {
          if (it.good) { this.caught++; it.life = 0; Sfx.ok(); }
          else if (this.inv <= 0) { this.caught = Math.max(0, this.caught - 1); this.inv = 1; it.life = 0; Sfx.bad(); }
        }
      });
      this.items = this.items.filter(it => it.life > 0);
      if (this.caught >= 3) { this.done = true; this.win(L); return; }
      if (this.t >= this.limit) { this.done = true; say(['* De twijfels zijn nog te sterk. Els zucht en klapt de laptop bijna dicht...', '* Probeer het nog eens!'], () => startAction(soulAction7())); }
    },
    win(L) {
      const { yas, els } = L;
      solve(L, [
        '* Er gaat een lichtje aan in het hoofd van Els. En dan nog een. En nog een.',
        () => { els.sit = false; els.expr = 'happy'; go(els, [[230, 160], [166, 160], [166, 150]], 24); els.endDir = -1; },
        waitArrive(els),
        () => { els.sit = true; },
        ['Els', 'Yasmina... weet je wat? Ik doe dit werk al vijftien jaar. En ik ben nog nooit zo zeker geweest van iemand.'],
        ['Yasmina', 'Je hoeft niet te liegen om mij te troosten.'],
        ['Els', 'Ik lieg niet. Je hebt je diploma gehaald terwijl je zeven keer bent verhuisd. Wie doet dat?'],
        ['Els', 'Ik ken een studio boven de bakkerij in de Kerkstraat. Betaalbaar. Youssef, de bakker, is een goeie mens.'],
        ['Els', 'Wat als ik samen met jou garant sta? Jij en ik. Samen.'],
        () => { yas.expr = 'happy'; },
        cu('yasmina'),
        ['Yasmina', '...Samen?'],
        cuOff,
        ['Els', 'Samen. Je hoeft dit niet alleen te doen. Niemand zou dat moeten.'],
        ['Yasmina', 'Dan... wil ik er een plant zetten.'],
        ['Yasmina', 'Ik heb nog nooit een plant gehad. Ik wist nooit hoe lang ik ergens zou blijven.'],
        ['Els', 'Dan kopen we morgen een plant. Voor je verjaardag.'],
        () => { L.flags.plant = true; },
        cu('plantje'),
        '* Morgen wordt ze achttien. Voor het eerst in lang kijkt ze ernaar uit.',
        cuOff
      ]);
    },
    draw() {
      const A = this.A;
      ctx.globalAlpha = 0.85; R(0, 0, W, H, PAL.black); ctx.globalAlpha = 1;
      box(A.x - 2, A.y - 2, A.w + 4, A.h + 4, PAL.white, PAL.black, 1);
      ctx.save(); ctx.beginPath(); ctx.rect(A.x, A.y, A.w, A.h); ctx.clip();
      this.items.forEach(it => {
        if (it.good) { glow(it.x, it.y, 10, '255,220,120', 0.5); R(it.x - 1, it.y - 3, 3, 7, PAL.yellow); R(it.x - 3, it.y - 1, 7, 3, PAL.yellow); txt(it.label, it.x, it.y + 5, PAL.warm, 'center', 5); }
        else { R(it.x - 4, it.y - 2, 9, 4, PAL.g5); R(it.x - 2, it.y - 4, 5, 2, PAL.g5); txt(it.label, it.x, it.y + 3, PAL.g7, 'center', 5); }
      });
      ctx.restore();
      if (!(this.inv > 0 && Math.floor(G.t * 12) % 2)) heart(this.h.x - 3, this.h.y - 3, PAL.red);
      txt('VERTROUWEN ' + this.caught + '/3', A.x, A.y + A.h + 8, PAL.yellow, 'left', 7);
      txt('TIJD ' + Math.max(0, this.limit - this.t).toFixed(1), A.x + A.w, A.y + A.h + 8, PAL.white, 'right', 7);
      txt('Vang de lichtjes. Ontwijk de twijfels.', W / 2, 14, PAL.g8, 'center', 7);
    }
  };
}
