'use strict';
/* ========== HOOFDSTUK 6: GEZIN IN ENERGIEARMOEDE ========== */
LEVELS.push({
  title: 'Een koude woonkamer',
  place: 'Een sociale woning aan de Vaartkaai · 18u30',
  quote: 'Warmte is geen luxe. Het is een recht.',
  bounds: { x: 12, y: 108, w: 296, h: 96 },
  start: { x: 150, y: 188 },
  exit: { x: 20, y: 190 },
  warmAt: { x: 200, y: 120 },
  need: 2,
  cold: ['* De wijkwerker liep voorbij. Hij had het druk.', '* Binnen trok mama nog een extra paar sokken aan bij Lien.', '* Het werd een lange, koude nacht.'],
  init(L) {
    L.wk = { x: -20, walk: 0, state: 'away' };
    L.draft = []; L.heat = 0;
    L.door = { x: 250, w: 28, h: 56, color: '#4a4e52', frame: PAL.g6, open: 0, target: 0, letterbox: true, number: '17',
      drawOutside: (x, y, w, h, t) => {
        R(x, y, w, h, '#10131a'); R(x, y + h - 10, w, 10, PAL.g4);
        for (let i = 0; i < 5; i++) R(x + ((i * 7 + t * 3) % w), y + ((i * 13 + t * 12) % (h - 10)), 1, 1, PAL.g9);
        if (L.wk.state === 'door') drawPerson(x + w / 2, y + h - 1, { coat: PAL.g8, vest: PAL.yellow, pants: PAL.g4, hairStyle: 'short', hair: PAL.g2, skin: '#a8846a', dir: -1, expr: 'happy' });
      } };
    L.doors = [L.door];
    const mama = L.mama = makeNPC({ x: 46, y: 146, dir: 1, sit: true, speed: 26,
      look: { hairStyle: 'bun', hair: PAL.g3, coat: '#5a5a62', longCoat: true, acc: PAL.g4, pants: PAL.g4, expr: 'worried', breath: true, armC: PAL.g3 } });
    const lien = L.lien = makeNPC({ x: 212, y: 134, dir: -1, sit: true, speed: 26,
      look: { kid: true, hairStyle: 'pony', hair: PAL.g4, coat: PAL.g7, pants: PAL.g5, expr: 'sad', breath: true } });
    lien.extra = (n) => { if (!L.flags.blanketOff) { R(n.x - 8, n.y - 20, 16, 14, '#6a6a7a'); R(n.x - 9, n.y - 8, 18, 4, '#6a6a7a'); for (let i = -6; i < 8; i += 4) R(n.x + i, n.y - 19, 1, 14, '#5a5a6a'); } };
    const karim = L.karim = makeNPC({ x: 264, y: 104, dir: -1, hidden: true, speed: 20,
      look: { coat: PAL.g8, vest: PAL.yellow, pants: PAL.g4, hairStyle: 'short', hair: PAL.g2, skin: '#a8846a', expr: 'happy' } });
    npcObj(L, mama, { id: 'mama', clue: 'mama',
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? ['* Mama zit aan tafel met een stapel rekeningen. Ze heeft haar handschoenen aan. Binnen.',
        '* Ze telt opnieuw. En nog eens. Het blijft te veel.',
        ['Mama', '(Huur, of verwarming. Verwarming, of eten. Ik kan niet kiezen tussen twee dingen die allebei moeten.)']] :
        [['Mama', '(Ik ga niemand om hulp vragen. Dan denken ze dat ik het niet kan.)']]); } });
    npcObj(L, lien, { id: 'lien', clue: 'lien',
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? ['* Lien zit onder een deken op de bank. Je ziet bijna alleen haar neus.',
        ['Lien', 'Mama, mag de verwarming aan?'], ['Mama', 'Straks, schatje.'], '* "Straks" duurt al drie dagen.'] :
        [['Lien', '(Als ik heel stil zit, lijkt het minder koud.)']]); } });
    npcObj(L, karim, { id: 'karim', solid: false });
    L.objs.push({ id: 'tafel', x: 56, y: 140, w: 46, h: 8, solid: true, sortY: 147, top: 118,
      draw: () => { table(56, 147, 46, '#4a4440'); for (let i = 0; i < 5; i++) R(60 + i * 8, 129, 7, 3, i === 2 ? PAL.red : PAL.g9); R(90, 127, 6, 5, PAL.g7); txt('€', 93, 127, PAL.g3, 'center', 5); },
      inspect: () => say(['* Rekeningen. Gas. Elektriciteit. Huur. Een aanmaning in het rood.', '* Op een briefje in mama\'s handschrift: "Lien: nieuwe schoenen?" Doorgestreept.']) });
    L.objs.push({ id: 'stoel', x: 40, y: 142, w: 12, h: 5, solid: true, sortY: 145, draw: () => chair(46, 146, 1, '#4a4440') });
    L.objs.push({ id: 'zetel', x: 186, y: 124, w: 52, h: 10, solid: true, sortY: 133, top: 100, draw: () => sofa(188, 135, 48, '#4a4a5a') });
    L.objs.push({ id: 'kachel', x: 126, y: 104, w: 38, h: 4, top: 80,
      inspect: (L, o) => {
        if (L.solved) { say(['* De verwarming tikt en kraakt. Ze wordt warm.']); return; }
        if (o.n === 1) say(['* De verwarming is koud.']);
        else if (o.n < 5) say(['* De verwarming is nog altijd koud.']);
        else say(['* Je blijft naar de koude verwarming staren.', '* Soms is kijken het enige wat je kan doen.', '* ...Maar niet vandaag.']);
      } });
    lookObj(L, 'thermo', 94, 104, 10, 3, 40, ['* Een thermometer aan de muur: 12 graden.', '* Binnen.'], { clue: 'thermo' });
    L.objs.push({ id: 'koelkast', x: 14, y: 104, w: 24, h: 6, solid: true, top: 44,
      draw: () => { R(14, 50, 24, 56, PAL.g8); R(14, 74, 24, 1, PAL.g6); R(34, 58, 2, 10, PAL.g6); R(34, 80, 2, 12, PAL.g6); R(17, 54, 12, 14, PAL.white); R(19, 60, 6, 6, PAL.yellow); R(22, 56, 2, 3, PAL.g5); } });
    memObj(L, 5, 16, 108, 20, 3, null, 30, 52);
    L.objs.push({ id: 'jassen', x: 288, y: 104, w: 18, h: 4, top: 40,
      draw: () => { R(288, 50, 18, 2, '#4a3a2c'); for (let i = 0; i < 4; i++) { R(289 + i * 5, 52, 1, 3, PAL.g6); R(290 + i * 5, 54, 1, 1, PAL.g6); } },
      inspect: () => say(['* De kapstok is leeg. Iedereen draagt zijn jas binnen.']) });
    L.objs.push({ id: 'raam', x: 118, y: 104, w: 50, h: 3, top: 14,
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Het raam. Dun enkel glas. De kou kruipt overal binnen.', '* Wat is hier aan de hand? Kijk eerst wat rond.']); return; }
        say(['* Buiten, achter het raam, stapt iemand in een fluohesje voorbij: de wijkwerker.',
          '* Als hij de kou zou VOELEN die hier binnen hangt...',
          '* Loop langs de twee gordijnen en de brievenbus in de voordeur. Laat ze wapperen, zodat de kou naar buiten waait!'],
          () => startAction(draftAction6()));
      } });
    L.spots = [
      { id: 'gordijn1', x: 100, y: 104, w: 20, h: 6, on: 0, ix: 110, iy: 6 },
      { id: 'gordijn2', x: 170, y: 104, w: 20, h: 6, on: 0, ix: 180, iy: 6 },
      { id: 'bus', x: 252, y: 104, w: 24, h: 8, on: 0, ix: 264, iy: 74 }
    ];
  },
  update(L, dt) {
    const wk = L.wk;
    if (wk.state === 'walk') { wk.x += 14 * dt; animWalk(wk, dt); if (wk.x > 182) wk.x = 112; }
    L.spots.forEach(s => { if (s.on > 0) s.on -= dt * 0.12; });
    L.draft = L.draft.filter(d => (d.life -= dt) > 0);
    L.draft.forEach(d => { d.x += d.vx * dt; d.y += d.vy * dt; });
    L.door.lbOpen = L.spots[2].on > 2.75 && Math.floor(L.t * 5) % 2 === 0;
    if (L.flags.heatOn) L.heat = Math.min(1, L.heat + dt * 0.25);
  },
  drawBg(L, t) {
    roomShell({ wall: '#2a2c2e', wall2: '#303234', pattern: 'peel', floorC: '#34322e', floorL: '#2a2824', trim: '#4a4c4e' });
    // raam met straat
    winFrame(124, 22, 40, 50, { frame: PAL.g6, sillC: PAL.g7, outside: (x, y, w, h) => {
      R(x, y, w, h, '#10131a'); facade(x - 6, y + 8, 52, 40, { c: '#1e1e22', cols: 2, rows: 1, lit: [0, 1] });
      R(x, y + h - 6, w, 6, PAL.g4);
      for (let i = 0; i < 6; i++) R(x + ((i * 11 + t * 4) % w), y + ((i * 17 + t * 12) % h), 1, 1, PAL.g9);
      if (L.wk.state === 'walk') drawPerson(L.wk.x, y + h - 1, { coat: PAL.g8, vest: PAL.yellow, pants: PAL.g4, hairStyle: 'short', hair: PAL.g2, skin: '#a8846a', dir: 1, moving: true, walk: L.wk.walk });
    } });
    const flap = (s) => s.on > 0 ? Math.sin(t * 25) * 4 * Math.min(1, s.on) : 0;
    curtain(108, 16, 14, 64, '#5a5a4a', flap(L.spots[0]));
    curtain(166, 16, 14, 64, '#5a5a4a', flap(L.spots[1]));
    radiator(128, 84, 32, 14, L.heat > 0.4);
    // thermometer
    R(96, 30, 6, 32, PAL.g8); R(98, 52 - L.heat * 12, 2, 8 + L.heat * 12, PAL.red); R(97, 60, 4, 4, PAL.red);
    txt(Math.round(12 + L.heat * 8) + '°', 99, 66, PAL.g7, 'center', 5);
    // foto en klok
    frameArt(60, 30, 20, 24, (x, y, w, h) => { R(x, y, w, h, '#7a8a9a'); R(x + 4, y + 6, 4, 4, PAL.g9); R(x + 10, y + 8, 3, 3, PAL.g9); R(x + 3, y + 10, 6, 10, '#6a5a5a'); R(x + 9, y + 11, 5, 9, '#5a6a5a'); });
    wallClock(214, 36, t * 30);
    outlet(232, 94); lightSwitch(240, 60);
    wallDoor(L.door, t);
    rug(70, 160, 90, 26, '#3a3434', '#423a3a');
    // speelgoed van Lien
    R(150, 190, 6, 6, '#b05048'); R(151, 188, 4, 2, '#b05048'); R(160, 192, 8, 3, PAL.g7);
    // droogrek
    R(270, 150, 30, 2, PAL.g6); R(272, 152, 1, 20, PAL.g6); R(297, 152, 1, 20, PAL.g6); R(276, 142, 6, 8, PAL.g7); R(286, 142, 6, 10, '#5a6a8a');
    if (G.mg && G.mg.draft) L.spots.forEach(s => { if (s.on <= 0) drawIndicator(s.ix, s.iy, t); });
  },
  drawFg(L, t) {
    L.draft.forEach(d => R(d.x, d.y, 3, 1, 'rgba(220,230,255,' + Math.min(0.8, d.life) + ')'));
    if (L.heat > 0) glow(144, 92, 70, '255,160,80', 0.25 * L.heat);
  }
});

function draftAction6() {
  return {
    draft: true, allowMove: true, t: 0, limit: 15,
    start(L) { L.wk.state = 'walk'; L.wk.x = 112; L.spots.forEach(s => s.on = 0); Toast.show('Laat alle drie de tochtplekken wapperen!', 3); },
    update(L, dt) {
      this.t += dt;
      const pr = { x: P.x - 4, y: P.y - 6, w: 8, h: 8 };
      L.spots.forEach(s => {
        if (s.on <= 0 && rectHit({ x: s.x, y: s.y, w: s.w, h: s.h + 8 }, pr)) {
          s.on = 3; Sfx.wind();
          for (let i = 0; i < 9; i++) L.draft.push(s.id === 'bus'
            ? { x: 264, y: 76 + rnd(-2, 2), vx: rnd(20, 50), vy: rnd(-8, 8), life: 1.2 }
            : { x: s.ix + rnd(-6, 6), y: 30 + i * 5, vx: (s.id === 'gordijn1' ? 1 : -1) * rnd(10, 30), vy: -rnd(4, 14), life: 1.2 });
        }
      });
      if (L.spots.every(s => s.on > 0)) { this.win(L); return; }
      if (this.t > this.limit) say(['* De tocht gaat liggen voor hij buiten iemand bereikt. De wijkwerker is al voorbij.', '* Probeer het nog eens, iets sneller: twee gordijnen en de brievenbus.'], () => startAction(draftAction6()));
    },
    win(L) {
      const { mama, lien, karim } = L;
      L.wk.state = 'gone';
      solve(L, [
        '* Een ijskoude tochtvlaag waait door de brievenbus naar buiten. Recht langs de benen van de wijkwerker.',
        ['Wijkwerker', 'Brrr! ...Wacht eens. Die kou komt van binnen?'],
        () => { L.wk.state = 'door'; },
        '* Hij aarzelt. Kijkt naar het huisnummer. Dan belt hij aan.',
        () => { Sfx.tone(988, 0.3, 'sine', 0.05); Sfx.tone(784, 0.4, 'sine', 0.05, null, 0.25); },
        '* Ding-dong.',
        () => { mama.sit = false; mama.expr = 'surprised'; go(mama, [[110, 160], [230, 150], [242, 118]], 28); mama.endDir = 1; },
        waitArrive(mama),
        () => { L.door.target = 1; },
        waitFor(() => L.door.open > 0.95),
        ['Wijkwerker', 'Goedenavond mevrouw. Ik ben Karim, van het buurtwerk. Sorry dat ik stoor, maar... het is hier kouder binnen dan buiten.'],
        () => { L.wk.state = 'in'; karim.hidden = false; karim.x = 264; karim.y = 106; go(karim, [[264, 124]], 18); karim.endDir = -1; mama.expr = 'sad'; },
        waitArrive(karim),
        () => { L.door.target = 0; mama.arm = 'face'; },
        ['Mama', '...Ik weet het. Ik schaam me. Ik wil niet bedelen.'],
        () => { mama.arm = null; },
        ['Karim', 'Hulp vragen is geen bedelen. Daar zijn wij net voor.'],
        ['Karim', 'Er is een noodfonds voor energie. Ik regel vanavond nog een tegoed. En morgen komt er iemand om die ramen te isoleren.'],
        cu('mama'),
        '* Mama zegt niets. Ze knikt alleen. Ze moet even haar ogen afvegen.',
        cuOff,
        () => { mama.expr = 'happy'; L.flags.blanketOff = true; lien.sit = false; go(lien, [[214, 146], [228, 124]], 26); lien.endDir = 1; },
        waitArrive(lien),
        ['Lien', 'Mama... wordt het warm?'],
        () => { L.flags.heatOn = true; Sfx.warm(); mama.look.breath = false; lien.look.breath = false; lien.expr = 'happy'; lien.arm = 'hug'; },
        cu('heater'),
        ['Mama', '...Ja, schatje. Het wordt warm.'],
        cuOff,
        ['Karim', 'En als de verwarming weer brandt: kom eens langs in het buurthuis. Er is altijd soep. En gezelschap.']
      ]);
    },
    draw(L) {
      const left = Math.max(0, this.limit - this.t);
      box(96, 214, 128, 18, PAL.white, PAL.black, 1);
      txt('TOCHT ' + L.spots.filter(s => s.on > 0).length + '/3', 104, 219, PAL.white, 'left', 7);
      R(160, 220, 56 * left / this.limit, 5, left < 4 ? PAL.red : PAL.g8);
    }
  };
}
