'use strict';
/* ========== HOOFDSTUK 1: ZWERFKATJE IN DE VRIESKOU ========== */
LEVELS.push({
  title: 'Zwerfkatje in de vrieskou',
  place: 'Een steegje achter de Kerkstraat · 22u14',
  quote: 'Soms begint warmte met iets kleins dat rammelt.',
  weather: 'snow',
  bounds: { x: 8, y: 108, w: 304, h: 96 },
  start: { x: 30, y: 140 },
  exit: { x: 288, y: 192 },
  warmAt: { x: 100, y: 130 },
  need: 2,
  cold: ['* Je liep door.', '* Het kind ook. Het had haast.', '* Het karton werd zwaarder van de sneeuw.'],
  init(L) {
    L.cat = { x: 81, y: 122, pose: 'curled', hidden: false, moving: false, dir: 1 };
    L.can = { x: 150, y: 128 };
    L.kidWait = 0;
    const kid = L.kid = makeNPC({ x: 250, y: 160, dir: -1, speed: 26,
      look: { kid: true, hairStyle: 'hood', coat: '#5a5a62', pants: PAL.g3, shoes: PAL.g2, expr: 'neutral' } });
    go(kid, [[-24, 160]], 26);
    kid.extra = (n) => {
      if (!L.flags.catTaken) return;
      const cx = n.x + (n.dir > 0 ? 1 : -2), cy = n.y - 20;
      R(cx - 3, cy - 3, 7, 5, PAL.g7); R(cx - 3, cy - 5, 2, 2, PAL.g7); R(cx + 2, cy - 5, 2, 2, PAL.g7);
      R(cx - 2, cy - 2, 1, 1, PAL.yellow); R(cx + 2, cy - 2, 1, 1, PAL.yellow);
      glow(cx, cy, 16, '255,190,110', 0.3);
    };
    npcObj(L, kid, { id: 'kind', clue: 'kind', solid: false,
      inspect: (L) => {
        if (L.solved) return;
        say(['* Een kind met een capuchon. Oortjes in, ogen op de grond.',
          ['Kind', '(Nog tien minuten tot thuis. Gewoon doorstappen. Niet kijken.)'],
          '* Het heeft haast. Het merkt niets op. Zelfs het katje niet.']);
      } });

    // container
    L.objs.push({ id: 'container', x: 16, y: 106, w: 46, h: 10, solid: true, top: 76,
      draw: () => {
        R(16, 84, 46, 32, '#3c4440'); R(16, 84, 46, 2, '#4c5650');
        for (let i = 20; i < 60; i += 6) R(i, 88, 2, 26, '#323a36');
        R(14, 80, 50, 5, '#2c3430'); R(14, 79, 50, 1, PAL.g9); R(18, 78, 20, 1, PAL.g9);
        R(18, 116, 4, 2, PAL.g2); R(56, 116, 4, 2, PAL.g2);
        R(10, 110, 8, 6, '#1e1e20'); R(9, 108, 6, 4, '#262628');
      },
      inspect: (L, o) => say(o.n < 3 ? ['* Een grote container. Bovenop ligt een deken. Iemand heeft hem weggegooid.', '* Hij is bijna nieuw.'] :
        ['* Wat de ene mens weggooit, zou voor een ander een thuis kunnen zijn.']) });

    // kartonnen doos met katje
    L.objs.push({ id: 'kat', x: 64, y: 114, w: 34, h: 10, solid: true, top: 92, clue: 'kat',
      draw: (L, t) => {
        R(64, 102, 34, 22, '#7a6448'); R(66, 105, 30, 18, '#21190f');
        R(62, 100, 38, 3, '#8a7458'); R(64, 99, 34, 1, PAL.g9);
        R(80, 100, 2, 3, '#a89a80'); R(64, 102, 1, 22, '#6a5438'); R(97, 102, 1, 22, '#6a5438');
        txt('↑↑', 68, 112, '#5a4428', 'left', 5);
        R(66, 120, 30, 3, '#4a4038');
        if (!L.cat.hidden) drawCat(L.cat.x, L.cat.y, t, { pose: L.cat.pose, shiver: !L.solved, dir: 1, eyesTo: P });
      },
      inspect: (L, o) => {
        if (L.flags.catTaken) return;
        if (o.n === 1) say(['* In een kartonnen doos zit een katje te bibberen.',
          '* Het is mager. De sneeuw blijft op zijn vachtje liggen.',
          '* ...Het kijkt naar jou. Recht naar jou.',
          '* Het lijkt wel de enige hier die je kan zien.']);
        else if (o.n < 5) { Sfx.purr(); say([o.n === 2 ? '* Je aait het katje met je licht. Prrrr... Het bibbert iets minder.' : '* Prrrrrrr.']); }
        else if (o.n === 5) { Sfx.purr(); Save.data.catFriend = true; Save.store(); say(['* Het katje duwt zijn kopje tegen je licht.', '* Even zijn jullie allebei een beetje minder alleen.']); }
        else { Sfx.purr(); say(['* Het katje spint. Het weet wie je bent.']); }
      } });

    // blikje
    L.objs.push({ id: 'blik', x: 146, y: 124, w: 9, h: 6, top: 112,
      draw: (L, t) => {
        const c = L.can;
        if (L.flags.canRolling && Math.floor(t * 12) % 2) { R(c.x - 3, c.y - 4, 7, 4, PAL.g8); R(c.x - 3, c.y - 4, 1, 4, PAL.red); }
        else { R(c.x - 2, c.y - 6, 5, 6, PAL.g8); R(c.x - 2, c.y - 6, 5, 1, PAL.white); R(c.x - 2, c.y - 3, 5, 1, PAL.red); }
      },
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Een leeg blikje in de sneeuw. Als je het een duwtje gaf, zou het flink rammelen...', '* Maar waarom zou je? Kijk eerst wat er hier aan de hand is.']); return; }
        choose('* Als het blikje rammelend voor de voeten van het kind rolt... Nu een duwtje geven?',
          ['Ja, nu!', 'Nog even wachten op het juiste moment.'], k => { if (k === 0) startAction(canAction1()); }, 1);
      } });

    // paaltje met wantje (herinnering)
    L.objs.push({ id: 'paal', x: 232, y: 134, w: 6, h: 4, solid: true, top: 110,
      draw: () => { R(233, 118, 4, 20, PAL.g5); R(232, 117, 6, 2, PAL.g9); R(233, 124, 4, 2, PAL.red); } });
    memObj(L, 0, 228, 134, 4, 4, (t) => {
      const red = '#c8443a';
      R(232, 107, 7, 8, red); R(233, 106, 5, 1, red); R(239, 109, 2, 3, red); R(240, 108, 1, 1, red); // want + duim
      R(238, 107, 1, 8, '#9a3028'); R(233, 108, 1, 4, '#f08070');
      R(235, 109, 1, 1, PAL.white); R(234, 110, 3, 1, PAL.white); R(235, 111, 1, 1, PAL.white); // sneeuwvlokje
      R(232, 115, 7, 3, '#ece4d8'); R(233, 115, 1, 3, '#c8bcae'); R(235, 115, 1, 3, '#c8bcae'); R(237, 115, 1, 3, '#c8bcae'); // boord
      R(233, 105, 4, 1, PAL.g9);
    }, 236, 98);

    lookObj(L, 'affiche', 208, 106, 30, 3, 44, ['* Een affiche, half losgewaaid: "IEDEREEN VERDIENT EEN WARME THUIS."', '* Iemand heeft er met balpen een klein hartje bij getekend.']);
    lookObj(L, 'raam', 98, 106, 36, 3, 26, (L, o) => o.n < 3 ? ['* Achter het raam: een gezin aan tafel. Ze lachen. Ze zien de steeg niet.'] :
      ['* Je blijft naar het verlichte raam kijken.', '* Iedereen verdient een raam als dit. Ook een katje.']);
    lookObj(L, 'deur', 170, 106, 28, 3, 50, ['* Een achterdeur. Achter elke deur woont iemand met een verhaal.']);
    L.objs.push({ id: 'lamp', x: 266, y: 106, w: 6, h: 4, solid: true, top: 36, draw: (L, t) => lampPost(268, 110, 'flicker', t),
      inspect: () => say(['* Een straatlantaarn die flikkert. Zelfs het licht lijkt het hier koud te hebben.']) });
  },
  update(L, dt) {
    const k = L.kid;
    if (!L.solved && !L.flags.kidStop) {
      if (arrived(k) && !k.hidden) { k.hidden = true; L.kidWait = 2.5; }
      if (k.hidden) { L.kidWait -= dt; if (L.kidWait <= 0) { k.hidden = false; k.x = 340; k.y = 160; go(k, [[-24, 160]], 26); } }
    }
    const c = L.cat;
    if (c.moving) { c.x = Math.min(98, c.x + 12 * dt); if (c.x >= 98) c.moving = false; }
  },
  drawBg(L, t) {
    R(0, 0, W, H, PAL.black);
    brickWall(0, 0, W, 104, '#262222', '#1a1616');
    winFrame(30, 14, 18, 22, { sky: '#0d0d10', snow: true, frame: PAL.g5 });
    winFrame(254, 14, 18, 22, { sky: '#0d0d10', snow: true, frame: PAL.g5 });
    winFrame(98, 30, 36, 26, { lit: true, snow: true, frame: PAL.g5, outside: (x, y, w, h) => {
      R(x, y + h - 7, w, 7, '#b07838');
      R(x + 5, y + 7, 6, 6, '#8a5a30'); R(x + 4, y + 13, 8, 7, '#8a5a30');
      R(x + 24, y + 5, 6, 6, '#8a5a30'); R(x + 23, y + 11, 8, 9, '#8a5a30');
      R(x + 15, y + 11, 5, 5, '#8a5a30'); R(x + 14, y + 15, 7, 5, '#8a5a30');
      R(x + 12, y + h - 9, 4, 2, PAL.white);
    } });
    // achterdeur met lampje
    R(168, 54, 32, 50, PAL.g5); R(170, 56, 28, 48, '#34343a');
    R(173, 60, 22, 18, '#2c2c32'); R(173, 82, 22, 18, '#2c2c32'); R(193, 80, 2, 3, PAL.g8);
    R(164, 102, 40, 3, PAL.g6);
    R(181, 46, 6, 4, PAL.g6); R(182, 50, 4, 2, PAL.yellow); glow(184, 52, 24, '255,220,140', 0.2);
    drainpipe(154, 0, 104);
    // affiche
    R(210, 46, 26, 32, PAL.g8); R(213, 50, 20, 2, PAL.g4); R(213, 55, 14, 2, PAL.g4); R(213, 60, 18, 2, PAL.g4);
    heart(219, 66, PAL.red); R(233, 46, 3, 8, PAL.g6);
    // airco
    R(254, 58, 28, 18, PAL.g5); for (let j = 61; j < 74; j += 3) R(257, j, 22, 1, PAL.g4); R(266, 76, 1, 2 + (Math.floor(t * 2) % 3), '#8ab0d0');
    // sneeuw tegen de muur
    R(0, 100, W, 5, PAL.g9); for (let i = 0; i < W; i += 13) R(i, 98 - (i % 3), 8, 3, PAL.g9);
    // grond
    cobbles(0, 104, W, 46, '#18181a', '#222226');
    R(0, 149, W, 2, PAL.g5);
    tiles(0, 151, W, 28, '#202024', '#2a2a2e', 12);
    R(0, 179, W, 2, PAL.g4);
    R(0, 181, W, 60, '#141416');
    for (let i = 10; i < W; i += 40) R(i, 196, 20, 2, PAL.g3);
    for (let i = 0; i < 9; i++) R((i * 47) % W, 110 + (i * 13) % 36, 6, 2, PAL.g8);
    puddle(120, 140, 20, true);
  },
  drawFg(L) {
    if (L.solved && !L.kid.hidden) glow(L.kid.x, L.kid.y - 16, 40, '255,190,110', 0.25 * L.warm);
  }
});

function canAction1() {
  return {
    t: 0, checked: false,
    start(L) { L.flags.canRolling = true; Sfx.rattle(); },
    update(L, dt) {
      this.t += dt;
      const p = Math.min(1, this.t / 0.8);
      L.can.y = lerp(128, 158, easeOut(p));
      L.can.x = 150 + Math.sin(this.t * 20) * (1 - p) * 2;
      if (p < 1 || this.checked) return;
      this.checked = true;
      L.flags.canRolling = false;
      const k = L.kid;
      if (!k.hidden && k.path.length && k.x > 140 && k.x < 210) {
        L.flags.kidStop = true; k.path = []; k.dir = -1;
        Sfx.rattle();
        const cat = L.cat;
        solve(L, [
          '* KLINK - KLONK - KLINKKLINK!',
          () => { k.expr = 'surprised'; },
          cu('kidNotice'),
          ['Kind', 'Wa- wat was dat?'],
          cuOff,
          '* Het kind haalt een oortje uit. Kijkt naar het blikje. Kijkt verder... naar de doos.',
          () => { go(k, [[112, 134]], 30); k.endDir = -1; }, waitArrive(k),
          () => { k.arm = 'crouch'; k.expr = 'sad'; },
          pause(0.5),
          ['Kind', 'Oh... Hé, kleintje. Zit jij hier helemaal alleen?'],
          ['Kind', 'Je bent ijskoud. En zo mager...'],
          () => { cat.pose = 'walk'; cat.moving = true; }, waitFor(() => !cat.moving),
          () => { cat.pose = 'stand'; },
          '* Het katje aarzelt. Dan stapt het voorzichtig naar voren. Het snuffelt aan de mouw.',
          () => { cat.hidden = true; L.flags.catTaken = true; k.arm = 'hug'; k.expr = 'happy'; k.look.acc = PAL.red; Sfx.purr(); },
          ['Kind', 'Kom maar. Onder mijn jas. Daar is het warm.'],
          cu('catShoulder'),
          '* Het katje kruipt tegen het kind aan. Alleen zijn kopje komt nog boven de kraag uit.',
          cuOff,
          ['Kind', 'Mama gaat zeggen dat we geen kat kunnen houden. ...Maar zij zegt ook altijd: niemand hoort alleen buiten te zitten.'],
          ['Kind', 'Kom. We gaan naar huis.'],
          () => { go(k, [[60, 156], [-30, 156]], 22); },
          pause(1.4),
          cu('catShoulder'),
          '* Net voor de hoek kijkt het katje nog één keer over de schouder. Recht naar jou.',
          '* Het knippert traag met zijn ogen. Bij katten betekent dat: dank je.',
          cuOff,
          waitArrive(k)
        ]);
      } else {
        say(!k.hidden && k.x >= 210 ?
          ['* Klink-klonk... Te vroeg! Het kind is nog te ver weg en hoort het niet door de oortjes.', '* Het blikje rolt terug naar zijn plekje. Probeer het nog eens.'] :
          ['* Klink-klonk... Het blikje rolt over een leeg voetpad.', '* Wacht tot het kind er bijna is. Het komt zo weer langs.'],
          () => { L.can.x = 150; L.can.y = 128; endAction(); });
      }
    },
    draw() { }
  };
}
