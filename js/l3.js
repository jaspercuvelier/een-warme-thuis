'use strict';
/* ========== HOOFDSTUK 3: RUZIËNDE BROERS ========== */
LEVELS.push({
  title: 'Ruziënde broers',
  place: 'Een slaapkamer op de eerste verdieping · 19u05',
  quote: 'Ruzie bouwt muren. Herinneringen bouwen bruggen.',
  bounds: { x: 12, y: 108, w: 296, h: 96 },
  start: { x: 250, y: 186 },
  exit: { x: 290, y: 150 },
  warmAt: { x: 160, y: 130 },
  need: 2,
  cold: ['* Je liet hen mokken.', '* Ze zwegen die avond. En de avond erna.', '* Een stilte die lang genoeg duurt, wordt een muur.'],
  init(L) {
    L.book = null;
    const daan = L.daan = makeNPC({ x: 148, y: 148, dir: -1, speed: 24,
      look: { kid: true, hairStyle: 'spiky', hair: PAL.g2, coat: '#5a6a7a', pants: PAL.g3, expr: 'sad' } });
    const milan = L.milan = makeNPC({ x: 174, y: 148, dir: 1, speed: 24,
      look: { kid: true, hairStyle: 'short', hair: PAL.g4, coat: '#7a6a5a', pants: PAL.g4, expr: 'sad' } });
    npcObj(L, daan, { id: 'daan', clue: 'daan',
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? [['Daan', '(Hij heeft mijn controller kapotgegooid. Altijd hetzelfde met hem.)'], '* Daan staart naar de muur. Zijn kaak staat strak.'] :
        [['Daan', '(...Hij deed het waarschijnlijk niet expres. Maar ik ga zeker niet als eerste iets zeggen.)']]); } });
    npcObj(L, milan, { id: 'milan', clue: 'milan',
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? [['Milan', '(Het was een ongeluk. En hij luistert toch nooit.)'], ['Milan', '(Vroeger deden we alles samen. Wanneer is dat gestopt?)']] :
        [['Milan', '(Ik mis hem. Ook al staat hij een meter verder.)']]); } });

    L.objs.push({ id: 'controller', x: 154, y: 164, w: 14, h: 5, top: 152,
      draw: (L) => { if (L.flags.fixed) return; R(154, 164, 12, 5, PAL.g6); R(155, 165, 3, 3, PAL.g4); R(162, 165, 1, 1, PAL.red); R(163, 166, 1, 1, '#5a8ac0'); R(168, 166, 4, 2, PAL.g6); R(170, 162, 2, 1, PAL.g6); },
      inspect: () => say(['* Een kapotte controller. Het begin van deze ruzie.', '* ...Of misschien het einde van iets dat al langer kraakte.']) });
    L.objs.push({ id: 'kast', x: 70, y: 104, w: 32, h: 6, solid: true, top: 44,
      draw: () => { bookcase(70, 108, 32, 60, '#5a4a3a'); if (!L.flags.albumOut) { R(92, 80, 6, 9, PAL.orange); R(93, 81, 4, 1, PAL.yellow); } },
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Een volle boekenkast. Allemaal boeken die al lang niemand meer leest.', '* Wat is hier eigenlijk aan de hand? Kijk eerst wat rond.']); return; }
        choose('* Een volle boekenkast. Welk boek laat je zachtjes vallen?',
          ['Kookboek "Pasta voor beginners"', 'Woordenboek', 'Stripboek over ruimtepiraten', 'Oud fotoalbum (oranje rug)', 'Toch maar niets'], k => {
            if (k === 4) return;
            Sfx.knock();
            if (k < 3) {
              L.book = { k, x: 86, y: 112, landed: true };
              if (k === 0) say(['* PLOF. Het kookboek valt open op "Lasagne".', '* De broers kijken niet op. (Al ziet die lasagne er wel heel goed uit.)']);
              else if (k === 1) say(['* PLOF. Het woordenboek valt open. Je leest:', '* "sorry (tussenwerpsel): klein woord, moeilijk om uit te spreken, maar het opent deuren."', '* De broers horen het niet. Maar misschien heb je een beter idee...']);
              else say(['* PLOF. Een stripboek over ruimtepiraten.', '* Milan kijkt even op. Dan weer weg. Bijna...', '* Zoek iets dat van hen allebei is.']);
              return;
            }
            L.flags.albumOut = true;
            L.book = { k: 3, x: 95, y: 84, t: 0, landed: false };
            solve(L, [
              waitFor(() => L.book.landed, 3),
              () => Sfx.knock(),
              '* PLOF. Het oude fotoalbum glijdt over de vloer. Het stopt precies tussen hen in.',
              () => { daan.dir = 1; milan.dir = -1; daan.expr = 'surprised'; milan.expr = 'surprised'; },
              '* Het valt open op een foto van een scheve boomhut.',
              cu('album'),
              ['Milan', '...Is dat... onze boomhut?'],
              ['Daan', 'Met dat dak van de oude kelderdeur! Papa was woedend.'],
              cuOff,
              () => { go(daan, [[154, 156]], 18); daan.endDir = 1; go(milan, [[170, 156]], 18); milan.endDir = -1; },
              waitArrive(daan, milan),
              () => { daan.sit = true; daan.floor = true; milan.sit = true; milan.floor = true; daan.expr = 'happy'; milan.expr = 'happy'; },
              ['Milan', 'En jij viel eraf en je hebt drie dagen volgehouden dat je kon vliegen.'],
              ['Daan', 'Ik KON vliegen. Heel even.'],
              () => { daan.expr = 'laugh'; milan.expr = 'laugh'; },
              cu('brothers'),
              '* Ze lachen. Ze kijken elkaar voor het eerst vandaag aan.',
              cuOff,
              () => { daan.expr = 'sad'; },
              ['Daan', '...Sorry van je controller. Ik was eigenlijk niet boos op jou. Ik was gewoon... boos.'],
              () => { daan.expr = 'happy'; milan.expr = 'happy'; },
              ['Milan', 'Weet ik. Ik ook.'],
              ['Milan', 'Zullen we hem samen proberen te maken? Zoals de boomhut. Scheef, maar van ons.'],
              ['Daan', 'Deal. Maar ik doe het dak.']
            ]);
          }, 4);
      } });
    L.objs.push({ id: 'bed', x: 16, y: 118, w: 50, h: 12, solid: true, top: 58,
      draw: () => {
        R(16, 62, 3, 68, '#5a4a3a'); R(62, 62, 3, 68, '#5a4a3a');
        R(19, 74, 43, 10, '#3a4a5a'); R(19, 72, 43, 3, PAL.g8); R(21, 70, 10, 5, PAL.g9);
        for (let i = 34; i < 60; i += 5) R(i, 76, 1, 1, PAL.yellow);
        R(19, 84, 43, 3, '#5a4a3a');
        R(19, 112, 43, 12, '#5a3a3a'); R(19, 110, 43, 3, PAL.g8); R(21, 108, 10, 5, PAL.g9);
        R(19, 124, 43, 3, '#5a4a3a');
        R(64, 70, 2, 56, '#6a5a4a'); for (let j = 76; j < 124; j += 8) R(62, j, 6, 1, '#6a5a4a');
        R(30, 128, 10, 2, '#3a3a50');
      },
      inspect: (L, o) => say(o.n < 3 ? ['* Een stapelbed. Boven slaapt Daan, onder Milan.', '* Vroeger fluisterden ze tot middernacht. Nu draaien ze allebei naar de muur.'] :
        ['* Op de lattenbodem boven staat in kinderletters gekrast: "D + M".']) });
    L.objs.push({ id: 'bureau', x: 226, y: 118, w: 56, h: 8, solid: true, top: 66,
      draw: (L, t) => {
        R(226, 104, 56, 3, '#6a5a4a'); R(228, 107, 3, 19, '#5a4a3a'); R(277, 107, 3, 19, '#5a4a3a'); R(258, 107, 19, 14, '#5a4a3a');
        R(238, 82, 26, 18, PAL.g3); R(240, 84, 22, 14, '#101820'); R(249, 100, 4, 4, PAL.g4);
        if (Math.floor(t * 1.5) % 2) txt('GAME OVER', 251, 88, PAL.red, 'center', 4);
        R(232, 92, 2, 12, PAL.g5); R(229, 90, 8, 3, PAL.yellow); glow(233, 94, 16, '255,220,140', 0.2);
        chair(250, 132, -1, '#3a3a44');
      },
      inspect: () => say(['* Op het scherm knippert: GAME OVER.', '* Niemand drukt op "opnieuw".']) });
    lookObj(L, 'raam', 136, 106, 40, 3, 20, ['* Buiten staat een kale boom. Vroeger hing daar een schommel aan.']);
    lookObj(L, 'poster', 108, 106, 24, 3, 22, ['* Een poster van de maan. Daan wilde astronaut worden. Milan zou de raket bouwen.']);
    L.objs.push({ id: 'deur', x: 288, y: 104, w: 18, h: 4, solid: true, top: 40, draw: () => { }, inspect: () => say(['* Op de deur hangt een bordje: "PRIVÉ". Met twee handtekeningen.']) });
    memObj(L, 2, 36, 130, 10, 4, () => { R(36, 130, 10, 6, PAL.g9); R(38, 131, 5, 3, '#8a6a4a'); R(40, 129, 1, 2, '#5a8a4a'); }, 44, 128);
    L.objs.push({ id: 'bal', x: 204, y: 176, w: 8, h: 4, solid: false, draw: () => { R(204, 172, 7, 7, PAL.g9); R(206, 174, 3, 3, PAL.g4); } });
  },
  update(L, dt) {
    const b = L.book;
    if (b && !b.landed && b.k === 3) {
      b.t += dt;
      const p = Math.min(1, b.t / 0.9);
      b.x = lerp(95, 161, p); b.y = lerp(84, 160, p) - Math.sin(p * Math.PI) * 18;
      if (p >= 1) b.landed = true;
    }
  },
  drawBg(L, t) {
    roomShell({ wall: '#262a34', wall2: '#2a2e38', pattern: 'stripes', floorC: '#3a3430', floorL: '#2c2622', trim: '#4a4a56' });
    // sjaal boven het bed
    for (let i = 0; i < 40; i += 4) R(20 + i, 22, 4, 6, (i / 4) % 2 ? PAL.g8 : '#5a6a8a');
    R(18, 28, 2, 6, PAL.g8); R(60, 28, 2, 6, PAL.g8);
    // poster van de maan
    frameArt(108, 22, 24, 30, (x, y, w, h) => { R(x, y, w, h, '#101828'); R(x + 6, y + 6, 10, 10, PAL.g9); R(x + 8, y + 8, 2, 2, PAL.g7); R(x + 12, y + 12, 3, 2, PAL.g7); for (let i = 0; i < 5; i++) R(x + (i * 7) % w, y + 18 + (i * 3) % 6, 1, 1, PAL.white); }, PAL.g6);
    // raam met boom
    winFrame(140, 22, 32, 36, { frame: PAL.g6, snow: true, outside: (x, y, w, h) => {
      R(x, y, w, h, '#0e1420'); bareTree(x + 20, y + h + 4, 40, true);
      for (let i = 0; i < 6; i++) R(x + ((i * 7 + t * 3) % w), y + ((i * 11 + t * 9) % h), 1, 1, PAL.g9);
    } });
    curtain(132, 20, 8, 40, '#4a5a7a'); curtain(172, 20, 8, 40, '#4a5a7a');
    // plank boven bureau
    shelf(232, 60, 44, ['trophy', 'book', 'book', 'cup', 'photo']);
    // deur
    R(286, 46, 22, 58, '#5a4a3a'); R(288, 48, 18, 56, '#6a5a4a'); R(290, 60, 14, 8, PAL.g9); txt('PRIVÉ', 297, 61, PAL.red, 'center', 4); R(303, 76, 2, 3, PAL.g8);
    outlet(212, 94); lightSwitch(276, 60);
    // tapijt
    rug(110, 132, 104, 44, '#3a3a50', '#44445c');
    // lego en sokken
    R(120, 186, 4, 3, PAL.red); R(126, 188, 4, 3, '#5a8ac0'); R(124, 184, 4, 3, PAL.yellow); R(196, 190, 8, 3, PAL.g8);
    // vallend boek
    const b = L.book;
    if (b) {
      const c = [PAL.g6, PAL.g7, '#5a6a8a', PAL.orange][b.k];
      if (b.k === 3 && b.landed) {
        R(150, 156, 24, 12, PAL.g9); R(161, 156, 2, 12, PAL.g6);
        R(152, 158, 8, 7, '#8aa0b0'); R(154, 161, 4, 3, '#a08060'); R(165, 158, 7, 6, '#c0b090');
        if (L.solved) glow(162, 162, 28, '255,200,120', 0.4 * L.warm);
      } else R(b.x - 4, b.y - 3, 8, 5, c);
    }
  }
});
