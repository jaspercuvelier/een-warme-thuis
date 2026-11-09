'use strict';
/* ========== HOOFDSTUK 9: HET VLUCHTELINGENKAMP ========== */
LEVELS.push({
  title: 'Het vluchtelingenkamp',
  place: 'Een tentenkamp, ver van huis · een koude nacht',
  quote: '"Waar twee of drie samen zijn in mijn naam, daar ben Ik in hun midden." (Matteüs 18,20)',
  bounds: { x: 6, y: 106, w: 308, h: 98 },
  start: { x: 160, y: 194 },
  exit: { x: 296, y: 196 },
  warmAt: { x: 160, y: 140 },
  need: 2,
  cold: ['* Je liet hen in hun tenten.', '* Het hout bleef nat. De dekens bleven in hun kisten.', '* Iedereen had het koud. Alleen.'],
  onEnter(L) {
    say(['* Modder. Regen die bijna sneeuw is. Tenten zover je kijken kan.',
      '* Je zou willen dat je de oorlog kon laten verdwijnen. Met één knip.',
      '* Maar je bent geen tovenaar.',
      '* ...Wat je wel kan: zorgen dat niemand hier alleen blijft in de kou.']);
  },
  init(L) {
    L.fireLit = false; L.blankets = false; L.trail = [];
    const FX = 160, FY = 150;
    L.seats = [
      { x: 128, y: 146, dir: 1 }, { x: 192, y: 146, dir: -1 },
      { x: 134, y: 162, dir: 1 }, { x: 186, y: 162, dir: -1 },
      { x: 160, y: 170, dir: 1, back: true }
    ];
    L.people = [];
    const add = (id, name, x, y, look, lines1, needFire) => {
      const n = makeNPC({ x, y, dir: 1, speed: 60, look: Object.assign({ expr: 'sad', breath: true }, look) });
      n.id = id; n.name = name; n.state = 'idle'; n.needFire = needFire;
      L.people.push(n);
      npcObj(L, n, { id, clue: 'p_' + id, solid: false,
        inspect: (L) => {
          if (n.state !== 'idle') return;
          if (!understood(L)) { say(lines1); return; }
          if (n.needFire && !L.fireLit) { say(lines1.concat(['* ' + name + ' kijkt niet op. Er is nog niets om naartoe te gaan.', '* (Er moet eerst warmte zijn waar mensen samen kunnen komen. Wie kan het vuur aansteken?)'])); return; }
          say(['* Je gaat vlak bij ' + name + ' staan. Je zegt niets. Dat kan je ook niet.',
            '* Maar ' + name + ' voelt iets. Iets warms. Alsof iemand zegt: kom maar.'], () => { n.state = 'follow'; n.expr = 'neutral'; Sfx.clue(); });
        } });
    };
    add('pieter', 'Pieter', 44, 172, { hairStyle: 'short', hair: PAL.g6, coat: '#3a4a5a', vest: PAL.orange, pants: PAL.g4, arm: 'hold',
      hold: (hx, hy) => { R(hx - 2, hy, 8, 2, '#5a4a3a'); R(hx - 2, hy + 2, 8, 2, '#4a3a2c'); } },
      ['* Pieter, een hulpverlener, staat bij een stapel brandhout.', ['Pieter', 'Hout genoeg. Maar ik kan het niet tegelijk hakken, aansteken én uitdelen. Ik heb handen tekort.']], false);
    add('rania', 'Rania', 270, 170, { hairStyle: 'long', hair: PAL.g2, coat: PAL.g7, acc: PAL.yellow, pants: PAL.g4, skin: '#c8aa90' },
      ['* Rania, een tolk, staat bij kisten vol dekens.', ['Rania', 'Ik spreek vier talen. Maar iedereen zit in zijn eigen tent. Met wie moet ik dan praten?']], true);
    add('nadia', 'Nadia', 62, 128, { hairStyle: 'hijab', capC: '#6a3a3a', coat: PAL.g5, longCoat: true, pants: PAL.g3, skin: '#b89a80', arm: 'hug',
      hold: null }, ['* Nadia wiegt haar baby in de opening van haar tent.', '* Ze zingt zachtjes, in een taal die niemand hier spreekt.'], true);
    add('yusuf', 'Yusuf', 238, 124, { elder: true, hairStyle: 'beanie', capC: PAL.g4, coat: '#4a4038', beard: PAL.g8, pants: PAL.g3, skin: '#b89a80' },
      ['* Een oude man, Yusuf, zit voor zijn tent. Hij draait een sleutel rond tussen zijn vingers.', '* Een huissleutel. Van een huis dat er niet meer is.'], true);
    add('omar', 'Omar', 110, 124, { kid: true, hairStyle: 'curly', hair: PAL.g1, coat: '#5a6a5a', pants: PAL.g3, skin: '#a8846a' },
      ['* Een jongen, Omar, gooit steentjes in een plas.', ['Omar', '(Hier is niemand van mijn leeftijd. Of misschien wel. Ze zitten allemaal binnen.)']], true);
    L.people.find(p => p.id === 'nadia').extra = (n) => { if (!n.hidden) { R(n.x - 3 + n.dir, n.y - 24, 6, 4, PAL.g9); R(n.x - 2 + n.dir, n.y - 26, 3, 3, '#e0d0c0'); } };

    L.objs.push({ id: 'vuur', x: 150, y: 146, w: 20, h: 6, solid: true, top: 124, sortY: 150,
      draw: (L, t) => fireBasket(FX, FY, L.fireLit, t),
      inspect: (L) => say(L.fireLit ? ['* Het vuur brandt. Mensen kunnen zich hier nu warmen.'] :
        ['* Een lege vuurkorf in het midden van het kamp.', '* Hier zou iedereen samen kunnen komen. Als er maar iemand was om hem aan te steken.']) });
    L.objs.push({ id: 'stammen', x: 0, y: 0, w: 0, h: 0, sortY: 140, draw: () => { log(118, 148, 18); log(184, 148, 18); log(124, 164, 18); log(178, 164, 18); log(150, 172, 20); } });
    L.objs.push({ id: 'kisten', x: 282, y: 160, w: 26, h: 10, solid: true, top: 136,
      draw: (L) => { R(282, 150, 26, 18, '#5a5040'); R(284, 152, 22, 2, '#6a6050'); R(288, 136, 18, 14, '#4a4030'); if (!L.blankets) { R(286, 144, 7, 6, PAL.red); R(295, 144, 7, 6, PAL.warm); } txt('HULP', 295, 157, PAL.g8, 'center', 5); },
      inspect: () => say(['* Kisten vol warme dekens. Geschonken door mensen die hier nooit zullen komen.']) });
    L.objs.push({ id: 'hout', x: 14, y: 164, w: 18, h: 8, solid: true, top: 148,
      draw: () => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4 - j; i++) { R(14 + i * 5 + j * 2, 168 - j * 4, 5, 4, '#4a3a2c'); R(17 + i * 5 + j * 2, 169 - j * 4, 1, 2, '#7a6a5a'); } },
      inspect: () => say(['* Brandhout. Nat aan de buitenkant, droog vanbinnen. Net als de mensen hier.']) });
    L.objs.push({ id: 'tank', x: 210, y: 176, w: 22, h: 8, solid: true, top: 146,
      draw: () => { R(210, 154, 22, 30, '#3a4a5a'); R(210, 154, 22, 2, '#4a5a6a'); R(214, 184, 2, 4, PAL.g5); R(226, 184, 2, 4, PAL.g5); R(232, 174, 4, 2, PAL.g6); R(234, 176 + (Math.floor(G.t * 3) % 4), 1, 1, '#8ab0d0'); },
      inspect: () => say(['* Een watertank. "Drinkwater". Iemand heeft er met krijt een zonnetje op getekend.']) });
    // de tekening ligt plat in de modder: altijd onder de personages tekenen
    memObj(L, 8, 86, 178, 32, 9, () => mudHouse(), 92, 166).sortY = 0;
  },
  update(L, dt) {
    const last = L.trail[L.trail.length - 1];
    if (!last || Math.hypot(last.x - P.x, last.y - P.y) > 2) { L.trail.push({ x: P.x, y: P.y }); if (L.trail.length > 300) L.trail.shift(); }
    const followers = L.people.filter(p => p.state === 'follow');
    followers.forEach((p, i) => {
      const tp = L.trail[Math.max(0, L.trail.length - 1 - (i + 1) * 8)];
      if (tp && Math.hypot(tp.x - p.x, tp.y - p.y) > 2) go(p, [[tp.x, tp.y + 1]], 60);
      if (Math.hypot(p.x - 160, p.y - 152) < 44) {
        const free = L.seats.find(s => !s.taken);
        if (free) { free.taken = true; p.seat = free; p.state = 'going'; go(p, [[free.x, free.y]], 30); }
      }
    });
    L.people.forEach(p => {
      if (p.state === 'going' && arrived(p)) {
        p.state = 'seated'; p.sit = true; p.dir = p.seat.dir; p.back = !!p.seat.back; p.expr = 'neutral';
        if (p.id === 'pieter' && !L.fireLit) {
          L.fireLit = true; Sfx.warm(); p.look.hold = null; p.look.arm = null;
          say(['* Pieter knielt bij de vuurkorf. Hij stapelt hout. Een lucifer. Nog een.', '* FWOESJ. Het vuur slaat aan.', ['Pieter', 'Zo. Nu nog mensen om het mee te delen.']]);
        } else if (p.id === 'rania' && !L.blankets) {
          L.blankets = true; Sfx.clue();
          L.people.forEach(q => { if (q.state === 'seated') q.look.acc = q.look.acc || PAL.red; });
          say(['* Rania zet de kisten open en begint dekens uit te delen.', ['Rania', 'Dekens! Wie wil er een? ...In welke taal zal ik het vragen? In alle vier!']]);
        } else Sfx.clue();
        if (L.blankets) p.look.acc = p.look.acc || PAL.red;
      }
    });
    if (!L.solved && L.people.every(p => p.state === 'seated') && !Dialog.active) {
      L.people.forEach(p => { p.expr = 'happy'; p.look.breath = false; });
      solve(L, [
        '* Het vuur knettert. Iemand stapelt hout bij. Iemand anders roert in een grote pot soep.',
        ['Rania', 'Hij vraagt of er zout is. ...En zij zegt dat ze kokkin was. Thuis.'],
        ['Pieter', 'Een kokkin! Dan is deze pot vanaf nu van u.'],
        '* Er wordt gelachen. Voorzichtig eerst. Dan luider.',
        ['Nadia', 'Ik ken een lied. Mijn moeder zong het. Het gaat over een huis met een blauwe deur.'],
        ['Rania', 'Ze vraagt of ze het mag zingen.'],
        ['Pieter', 'Graag.'],
        () => Music.play(SONGS.warm),
        cu('fireFaces'),
        '* Ze zingt. Niemand verstaat de woorden. Iedereen verstaat het lied.',
        cuOff,
        '* Omar leunt tegen Yusuf. Yusuf legt een deken over hem heen. Ze kenden elkaar een uur geleden nog niet.',
        cu('key'),
        ['Yusuf', 'De oorlog heeft ons huis afgepakt.'],
        ['Yusuf', 'Maar zolang we voor elkaar zorgen, hebben we hier vannacht een warme thuis.'],
        cuOff
      ]);
    }
  },
  drawBg(L, t) {
    R(0, 0, W, 60, '#08090c');
    for (let i = 0; i < 40; i++) R((i * 47) % W, (i * 31) % 50, 1, 1, i % 3 ? PAL.g5 : PAL.g8);
    R(262, 10, 10, 10, PAL.g8); R(266, 10, 6, 10, '#08090c');
    // heuvels en omheining
    for (let i = 0; i < W; i++) { const h = 14 + Math.sin(i * 0.03) * 6 + Math.sin(i * 0.11) * 2; R(i, 62 - h, 1, h, '#121418'); }
    R(0, 60, W, 46, '#141414');
    for (let i = 0; i < W; i += 12) R(i, 52, 1, 18, PAL.g4);
    R(0, 54, W, 1, PAL.g4); R(0, 60, W, 1, PAL.g4);
    for (let i = 20; i < W; i += 70) { R(i, 30, 2, 40, PAL.g5); R(i - 3, 28, 8, 3, PAL.g6); glow(i + 1, 32, 20, '255,230,170', 0.12); }
    // tenten achteraan
    tent(4, 92, 48, 30, PAL.g5, false, true); tent(58, 88, 40, 26, PAL.g4); tent(212, 88, 44, 26, PAL.g4, false, true); tent(262, 92, 52, 32, PAL.g5);
    tent(118, 86, 36, 22, PAL.g4); tent(170, 84, 34, 20, PAL.g5);
    // waslijn
    ctx.strokeStyle = PAL.g6; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(100, 70); ctx.quadraticCurveTo(150, 80, 200, 70); ctx.stroke();
    [[118, '#6a5a7a'], [134, PAL.g7], [158, '#7a5a4a'], [176, '#5a6a7a']].forEach(c => R(c[0], 74 + Math.sin(t + c[0]) * 0.5, 7, 9, c[1]));
    // modder
    R(0, 104, W, H - 104, '#1a1714');
    for (let i = 0; i < 50; i++) R((i * 53) % W, 108 + (i * 37) % 100, 6 + (i % 4) * 3, 1, '#221e1a');
    puddle(80, 140, 26, L.fireLit); puddle(220, 196, 30, false); puddle(250, 136, 18, L.fireLit);
    // pallets als pad
    for (let i = 0; i < 4; i++) { R(140 + (i % 2) * 2, 178 + i * 7, 40, 5, '#4a3e30'); for (let j = 0; j < 5; j++) R(142 + j * 8, 178 + i * 7, 1, 5, '#3a2e22'); }
    // tenten met mensen (open)
    tent(40, 132, 46, 30, PAL.g6, true, true); tent(90, 128, 40, 26, PAL.g6, true); tent(218, 128, 44, 28, PAL.g6, true, true);
    if (L.solved) { R(150, 128, 20, 9, PAL.g4); R(152, 126, 16, 2, PAL.orange); for (let i = 0; i < 3; i++) R(155 + i * 5, 118 - ((t * 10 + i * 4) % 8), 1, 3, PAL.g7); }
  },
  drawFg(L, t) {
    if (L.fireLit) glow(160, 140, 120, '255,170,80', 0.12 + 0.05 * Math.sin(t * 7));
  }
});

/* Een huisje met een stok in de modder getekend: dak, schoorsteen met rook, deur, raam, zon en een half weggespoelde boom */
function mudHouse() {
  const L = '#6a5c4c', S = '#0c0a08';
  const px = (x, y, c) => { R(x, y + 1, 1, 1, S); R(x, y, 1, 1, c || L); };
  const line = (x, y, w, h, c) => { R(x, y + 1, w, h, S); R(x, y, w, h, c || L); };
  // dak
  for (let i = 0; i <= 8; i++) { px(90 + i, 178 - i); px(106 - i, 178 - i); }
  // muren en grond
  line(92, 178, 1, 9); line(104, 178, 1, 9); line(88, 187, 24, 1);
  // deur met klinkje
  line(97, 182, 1, 5); line(100, 182, 1, 5); line(97, 181, 4, 1); px(99, 184, '#8a7a66');
  // raam met kruis
  line(94, 180, 3, 1); line(94, 183, 3, 1); line(94, 180, 1, 4); line(96, 180, 1, 4); px(95, 181);
  // schoorsteen + rook
  line(101, 171, 1, 2); line(103, 171, 1, 4); line(101, 171, 3, 1);
  px(102, 169); px(103, 168); px(102, 167); px(103, 166);
  // zon
  const sc = '#8a7656';
  line(112, 171, 3, 1, sc); line(112, 175, 3, 1, sc); line(111, 172, 1, 3, sc); line(115, 172, 1, 3, sc);
  px(113, 169, sc); px(113, 177, sc); px(109, 173, sc); px(117, 173, sc); px(110, 170, sc); px(116, 170, sc); px(110, 176, sc); px(116, 176, sc);
  // boom (half weggespoeld)
  const tc = '#3e362c';
  line(88, 181, 1, 6, tc); px(86, 179, tc); px(87, 178, tc); px(89, 178, tc); px(90, 179, tc); px(86, 180, tc);
}
