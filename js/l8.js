'use strict';
/* ========== HOOFDSTUK 8: ASIELOPVANG & INTEGRATIE ========== */
LEVELS.push({
  title: 'Speel je mee?',
  place: 'Het pleintje achter de sporthal · woensdagnamiddag',
  quote: 'Een bal spreekt alle talen.',
  bounds: { x: 22, y: 104, w: 290, h: 100 },
  start: { x: 160, y: 190 },
  exit: { x: 150, y: 194 },
  warmAt: { x: 120, y: 140 },
  need: 2,
  cold: ['* Het spel ging verder. Twee tegen één.', '* Amir bleef nog even aan het hek staan.', '* Toen ging hij naar huis, zijn handen diep in zijn zakken.'],
  init(L) {
    L.ball = { x: 150, y: 150, vx: 0, vy: 0, tx: null };
    const amir = L.amir = makeNPC({ x: 18, y: 140, dir: 1, speed: 30,
      look: { kid: true, hairStyle: 'curly', hair: PAL.g1, skin: '#a8846a', coat: PAL.g6, pants: PAL.g3, expr: 'worried' } });
    L.kids = [
      makeNPC({ x: 212, y: 128, dir: -1, speed: 34, look: { kid: true, hairStyle: 'pony', hair: PAL.g6, coat: PAL.g8, pants: '#4a4a5a', expr: 'neutral' } }),
      makeNPC({ x: 240, y: 164, dir: -1, speed: 34, look: { kid: true, hairStyle: 'short', hair: PAL.g2, coat: '#5a6a8a', pants: PAL.g3, expr: 'neutral' } }),
      makeNPC({ x: 266, y: 126, dir: -1, speed: 34, look: { kid: true, hairStyle: 'cap', capC: '#7a3a34', coat: PAL.g6, pants: PAL.g3, expr: 'neutral' } })
    ];
    npcObj(L, amir, { id: 'amir', clue: 'amir', solid: false,
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? ['* Een jongen staat al een kwartier aan het hek te kijken.',
        '* Hij kent de regels van het spel. Niet de taal. Nog niet.',
        ['Amir', '(Thuis speelde ik elke dag. Op straat, met mijn neven. Met een bal van plastic zakken.)']] :
        [['Amir', '(Misschien vragen ze het. Misschien niet. Ik durf niet te vragen.)']]); } });
    L.kids.forEach((k, i) => npcObj(L, k, { id: 'kid' + i, clue: 'jongeren',
      inspect: (L) => { if (L.solved) return; say(i === 0 ? [['Lotte', 'Waar is die bal nu weer naartoe?'], ['Lotte', 'We zijn maar met drie. Twee tegen één is geen match... We hebben eigenlijk nog iemand nodig.']] : [['Jongere', 'Zeg, iemand moet verdedigen! Ik sta niet in doel.']]); } }));
    L.objs.push({ id: 'bal', x: 0, y: 0, w: 8, h: 6, top: 0,
      draw: (L, t, o) => {
        const b = L.ball; o.x = b.x - 4; o.y = b.y - 4; o.top = b.y - 16;
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(b.x - 3, b.y, 7, 1);
        R(b.x - 2, b.y - 5, 5, 5, PAL.white); R(b.x - 1, b.y - 6, 3, 7, PAL.white); R(b.x - 3, b.y - 4, 7, 3, PAL.white);
        R(b.x, b.y - 4, 2, 2, PAL.g3); R(b.x - 3, b.y - 3, 1, 1, PAL.g4); R(b.x + 3, b.y - 2, 1, 1, PAL.g4);
      },
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Een voetbal. Hij is uit het spel gerold en ligt hier stil.', '* Wie hoort er eigenlijk bij dit spel? Kijk eerst wat rond.']); return; }
        say(['* De bal ligt hier. Amir staat daar. De groep zoekt een speler.',
          '* Richt met de pijltjes en bevestig met ' + OK_KEYS + '. Kies daarna op dezelfde manier de kracht.',
          '* Laat de bal precies tot aan Amirs voeten rollen.'], () => startAction(kickAction8()));
      } });
    L.objs.push({ id: 'bank', x: 36, y: 182, w: 44, h: 6, solid: true, draw: () => { bench(36, 190, 44, '#5a4a3a'); R(42, 176, 10, 6, '#7a3a34'); R(56, 177, 8, 5, '#3a4a6a'); },
      inspect: () => say(['* Op de bank liggen jassen en een rugzak. Ze dienen als doelpaal.']) });
    lookObj(L, 'muur', 120, 104, 70, 3, 40, ['* Een muurschildering, gemaakt door de buurt: "WELKOM".', '* Iemand heeft er in een andere taal iets onder geschreven. Hetzelfde woord, waarschijnlijk.']);
    memObj(L, 7, 4, 112, 12, 6, null, 10, 104);
    L.objs.push({ id: 'goal', x: 300, y: 122, w: 12, h: 30, solid: true, sortY: 152, draw: () => {
      R(298, 118, 2, 34, PAL.white); R(298, 118, 14, 2, PAL.white); R(298, 150, 14, 2, PAL.white);
      for (let j = 121; j < 150; j += 4) R(300, j, 12, 1, PAL.g4); for (let i = 302; i < 312; i += 4) R(i, 120, 1, 30, PAL.g4);
    } });
    L.objs.push({ id: 'lamp', x: 286, y: 100, w: 6, h: 4, solid: false, draw: (L, t) => lampPost(290, 104, true, t) });
  },
  update(L, dt) {
    if (L.ball.tx && !L.flags.play) moveTo(L.ball, L.ball.tx.x, L.ball.tx.y, 90, dt);
    if (!L.flags.play) return;
    // na de oplossing: samen spelen
    const all = L.kids.concat([L.amir]);
    all.forEach((k, i) => {
      if (arrived(k)) { k.waitP = (k.waitP || 0) - dt; if (k.waitP <= 0) { go(k, [[rnd(80, 280), rnd(118, 180)]], 34); k.waitP = rnd(0.4, 1.5); } }
    });
    const b = L.ball;
    L.passT = (L.passT || 0) - dt;
    if (L.passT <= 0) { const k = all[Math.floor(Math.random() * all.length)]; b.tx = k; L.passT = rnd(0.9, 1.6); Sfx.click(); }
    if (b.tx) moveTo(b, b.tx.x + 5, b.tx.y, 110, dt);
  },
  drawBg(L, t) {
    R(0, 0, W, H, '#0c0c0e');
    // sporthal en huizen
    R(0, 14, 110, 88, '#262628'); R(0, 14, 110, 3, PAL.g4); txt('SPORTHAL', 55, 20, PAL.g7, 'center', 7);
    for (let i = 0; i < 5; i++) R(8 + i * 20, 32, 14, 10, '#1c2a34');
    house(200, 46, 50, 54, 3, t); house(254, 40, 60, 60, 4, t);
    // muurschildering
    R(112, 40, 86, 60, '#2c2a2a'); R(112, 40, 86, 2, PAL.g4);
    const col = ['#b05048', '#d8b050', '#5a8ac0', '#6fa05f', PAL.orange, '#a070b0'];
    'WELKOM'.split('').forEach((c, i) => { R(118 + i * 13, 48, 11, 18, col[i]); txt(c, 123 + i * 13, 52, PAL.white, 'center', 9); });
    for (let i = 0; i < 6; i++) { R(120 + i * 13, 76, 6, 6, col[(i + 2) % 6]); R(121 + i * 13, 72, 4, 4, '#c8a888'); }
    txt('أهلا · Bienvenue · Hoş geldin', 155, 88, PAL.g7, 'center', 5);
    // veld
    R(0, 100, W, H - 100, '#1a1e1a');
    for (let k = 0; k < 120; k++) R((k * 37) % W, 104 + (k * 23) % 100, 2, 1, '#202620');
    ctx.strokeStyle = '#4a524a'; ctx.lineWidth = 1;
    ctx.strokeRect(22.5, 104.5, 288, 98);
    ctx.beginPath(); ctx.arc(166, 153, 20, 0, 7); ctx.stroke();
    R(166, 104, 1, 98, '#4a524a');
    // hek met open poortje
    for (let j = 96; j < 206; j += 4) { if (j > 126 && j < 150) continue; R(10, j, 10, 1, PAL.g5); }
    for (let i = 10; i < 21; i += 3) { R(i, 94, 1, 34, PAL.g5); R(i, 150, 1, 56, PAL.g5); }
    R(10, 126, 10, 2, PAL.g6); R(10, 150, 10, 2, PAL.g6);
    R(2, 108, 8, 6, PAL.g8); R(3, 109, 6, 1, PAL.red); R(3, 111, 4, 1, PAL.g5);
    R(0, 96, 10, 110, '#141414');
    if (L.solved) glow(L.amir.x, L.amir.y - 14, 40, '255,190,110', 0.25 * L.warm);
  }
});

function kickAction8() {
  return {
    phase: 'aim', ang: Math.PI, pow: 0, pdir: 1, goal: false,
    start(L) { const b = L.ball; b.x = 150; b.y = 150; b.vx = 0; b.vy = 0; },
    target(L) { return { x: L.amir.x + 10, y: L.amir.y }; },
    update(L, dt) {
      const b = L.ball;
      if (this.phase === 'aim') {
        if (Input.held('left') || Input.held('up')) this.ang -= 1.4 * dt;
        if (Input.held('right') || Input.held('down')) this.ang += 1.4 * dt;
        if (Input.hit('ok')) { this.phase = 'power'; Sfx.select(); }
      } else if (this.phase === 'power') {
        this.pow += this.pdir * dt * 0.7;
        if (this.pow > 1) { this.pow = 1; this.pdir = -1; }
        if (this.pow < 0) { this.pow = 0; this.pdir = 1; }
        if (Input.hit('ok')) { const v = 30 + this.pow * 150; b.vx = Math.cos(this.ang) * v; b.vy = Math.sin(this.ang) * v; this.phase = 'roll'; Sfx.knock(); }
      } else if (this.phase === 'roll') {
        const sp = Math.hypot(b.vx, b.vy), dec = 60 * dt;
        if (sp <= dec) { b.vx = 0; b.vy = 0; } else { b.vx *= (sp - dec) / sp; b.vy *= (sp - dec) / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y < 108) { b.y = 108; b.vy = -b.vy * 0.5; Sfx.click(); }
        if (b.y > 200) { b.y = 200; b.vy = -b.vy * 0.5; Sfx.click(); }
        if (b.x < 24 && !(b.y > 128 && b.y < 150)) { b.x = 24; b.vx = -b.vx * 0.5; Sfx.click(); }
        if (b.x < 6) { b.x = 6; b.vx = 0; b.vy = 0; }
        if (b.x > 298) {
          if (b.y > 122 && b.y < 150) { this.goal = true; b.x = 305; b.vx = 0; b.vy = 0; }
          else { b.x = 298; b.vx = -b.vx * 0.5; Sfx.click(); }
        }
        if (b.vx === 0 && b.vy === 0) this.phase = 'check';
      } else if (this.phase === 'check') {
        this.phase = 'done';
        const tg = this.target(L);
        const d = Math.hypot(b.x - tg.x, b.y - tg.y);
        if (this.goal) { Sfx.warm(); say(['* GOAL!!! Het publiek (jij) gaat uit zijn dak.', '* ...Niemand anders heeft het gezien.', '* Mooi schot, maar dit spel draait niet om scoren. Probeer het nog eens: naar Amir.'], () => startAction(kickAction8())); }
        else if (d < 18) this.win(L);
        else say([d < 40 ? '* Bijna! De bal stopt net niet bij Amir.' : '* De bal rolt de verkeerde kant op.', '* De bal rolt terug naar het midden. Probeer het opnieuw.'], () => startAction(kickAction8()));
      }
    },
    win(L) {
      const { amir, kids, ball } = L, lotte = kids[0];
      solve(L, [
        () => { amir.expr = 'surprised'; },
        '* De bal rolt precies tot aan Amirs voeten. Hij stopt hem. Zachtjes. Perfect.',
        cu('ball'),
        '* Zonder na te denken tikt hij hem met één aanraking terug naar het veld.',
        cuOff,
        () => { ball.tx = { x: 170, y: 146 }; },
        () => { go(lotte, [[150, 140]], 34); lotte.endDir = -1; lotte.expr = 'happy'; }, waitArrive(lotte),
        ['Lotte', 'Mooie aanname! Speel je mee? We hebben een verdediger nodig!'],
        () => { amir.expr = 'laugh'; amir.look.acc = PAL.orange; },
        cu('amir'),
        ['Amir', 'Ik... ja? Ik speel. Thuis ik was... verdediger. En keeper.'],
        cuOff,
        () => { go(amir, [[40, 140], [128, 142]], 30); amir.endDir = 1; }, waitArrive(amir),
        ['Lotte', 'Top! Hoe heet je?'],
        ['Amir', 'Amir.'],
        ['Lotte', 'Welkom, Amir! Ik ben Lotte. Jij speelt bij ons. Wij verliezen altijd, dus je past er perfect bij.'],
        () => { L.flags.play = true; kids.forEach(k => { k.look.acc = PAL.yellow; k.expr = 'happy'; }); },
        '* Iedereen lacht. Amir ook.',
        pause(3),
        '* Voetbal heeft geen tolk nodig.'
      ]);
    },
    draw(L) {
      const b = L.ball;
      if (this.phase === 'aim' || this.phase === 'power') {
        for (let i = 1; i < 14; i += 2) R(b.x + Math.cos(this.ang) * i * 5, b.y - 3 + Math.sin(this.ang) * i * 5, 2, 2, PAL.yellow);
        const tg = this.target(L);
        ctx.strokeStyle = 'rgba(255,229,138,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(tg.x, tg.y, 14, 0, 7); ctx.stroke();
      }
      box(40, 210, 240, 24, PAL.white, PAL.black, 1);
      if (this.phase === 'aim') txt('Richten: pijltjes  ·  Z/spatie/enter = vast', 160, 216, PAL.white, 'center', 7);
      else if (this.phase === 'power') { txt('KRACHT', 80, 216, PAL.white, 'left', 7); R(120, 216, 120, 8, PAL.g3); R(120, 216, 120 * this.pow, 8, this.pow > 0.8 ? PAL.red : PAL.warm); }
      else txt('...', 160, 216, PAL.white, 'center', 7);
    }
  };
}
