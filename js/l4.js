'use strict';
/* ========== HOOFDSTUK 4: VOLLE NACHTOPVANG ========== */
LEVELS.push({
  title: 'Volle nachtopvang',
  place: 'De Kerkstraat, voor de nachtopvang · 23u02',
  quote: '"Ik was een vreemdeling en jullie hebben Mij opgenomen." (Matteüs 25,35)',
  weather: 'rain',
  bounds: { x: 4, y: 108, w: 312, h: 96 },
  start: { x: 140, y: 140 },
  exit: { x: 150, y: 192 },
  warmAt: { x: 210, y: 100 },
  need: 2,
  cold: ['* Je liep door. De bakker ook.', '* De regen bleef vallen. Op Marcel. De hele nacht.'],
  init(L) {
    L.vanX = 214;
    L.door = { x: 196, w: 26, h: 52, color: '#4a3a30', frame: '#6a5a4a', open: 0, target: 0, lightIn: true,
      drawOutside: (x, y, w, h) => { R(x, y, w, h, '#5a3a20'); R(x, y, w, h, 'rgba(255,190,110,0.6)'); R(x + 4, y + 10, 18, 3, '#c89a5a'); R(x + 4, y + 22, 18, 3, '#c89a5a'); } };
    L.doors = [L.door];
    const m = L.man = makeNPC({ x: 70, y: 124, dir: 1, speed: 22,
      look: { hairStyle: 'beanie', capC: PAL.g4, coat: '#4a4a4e', longCoat: true, pants: PAL.g3, beard: PAL.g5, skin: '#cfc4b8', expr: 'sad', breath: true, shiver: true, arm: 'hug' } });
    const y = L.bak = makeNPC({ x: 209, y: 112, dir: 1, back: true, speed: 30,
      look: { hairStyle: 'short', hair: PAL.g2, coat: PAL.g8, apron: PAL.white, pants: PAL.g5, skin: '#b89a80', breath: true } });
    npcObj(L, m, { id: 'man', clue: 'man',
      inspect: (L, o) => { if (L.solved || L.coldEnd) return; say(o.n === 1 ? [
        '* Een man staat met zijn rug tegen de muur. Zijn jas is doorweekt.',
        '* Hij slaat zijn armen om zich heen en rilt. Hij kijkt naar de gesloten deur.',
        ['Man', '(Morgen opnieuw proberen... Morgen is ook nog ver.)']] :
        [['Man', '(Als het nu maar zou stoppen met regenen.)'], '* Het stopt niet met regenen.']); } });
    npcObj(L, y, { id: 'bakker', clue: 'bakker',
      inspect: (L) => {
        if (L.solved || L.coldEnd) return;
        if (!understood(L)) { say(['* De buurtbakker sluit zijn winkel af. Hij heeft een lange dag achter de rug.', ['Bakker', '(Nog snel naar huis. Wat een weer...)']]); return; }
        say(['* Je gaat vlak naast de bakker staan. Hij kan je niet zien.', '* Maar misschien kan hij je wel... voelen. Wat fluister je?'], () => {
          choose('Wat fluister je in het oor van de bakker?', ['"Laat maar. De stad zorgt er wel voor."', '"Kijk eens naar zijn doorweekte jas. En zijn hongerige blik."'], k => {
            if (k === 0) {
              fail(L, [
                '* De bakker knikt bij zichzelf.',
                ['Bakker', '(Ja. Daar zijn diensten voor. Het is mijn zaak niet.)'],
                () => { y.back = false; go(y, [[226, 150], [286, 176]], 34); },
                waitArrive(y),
                () => { y.hidden = true; L.flags.vanGo = true; Sfx.noise(0.8, 0.04); },
                '* Hij stapt in zijn bestelwagen en rijdt weg.',
                pause(1.5),
                '* De regen bleef vallen. Op Marcel. De hele nacht.',
                '* Kou ontstaat niet alleen door het weer.'
              ]);
              return;
            }
            solve(L, [
              () => { y.back = false; y.dir = -1; },
              '* De bakker blijft staan. De sleutel nog in het slot.',
              '* Hij draait zich om. Hij kijkt naar de overkant van de straat.',
              ['Bakker', 'Meneer? ...Meneer! U staat daar al de hele avond.'],
              () => { go(y, [[170, 130], [90, 130]], 34); y.endDir = -1; }, waitArrive(y),
              () => { m.expr = 'surprised'; },
              cu('marcel'),
              ['Man', 'Ze zitten vol. Ik ga wel... ergens.'],
              cuOff,
              ['Bakker', '"Ergens" is geen adres. Kom binnen. Ik heb nog soep van de middag, en brood dat anders weg moet.'],
              ['Bakker', 'Achteraan staat een bank naast de oven. Die blijft warm tot de ochtend.'],
              ['Man', 'Waarom zou u dat doen? U kent mij niet.'],
              ['Bakker', 'Mijn vader sliep ook ooit buiten, toen hij hier pas aankwam. Iemand deed toen de deur open voor hem.'],
              ['Bakker', 'Ik ben Youssef.'],
              () => { m.expr = 'happy'; m.look.acc = PAL.orange; m.look.shiver = false; m.look.arm = null; },
              ['Man', '...Marcel. Ik heet Marcel.'],
              ['Youssef', 'Kom, Marcel. De soep wordt koud.'],
              () => { go(y, [[170, 122], [209, 116]], 30); y.endDir = 1; go(m, [[120, 132], [190, 124]], 22); },
              waitArrive(y),
              () => { L.door.target = 1; L.flags.shopLit = true; },
              waitFor(() => L.door.open > 0.9),
              '* De deur van de bakkerij gaat open. Een gele streep licht valt op de natte stoep.',
              () => { go(y, [[209, 104]], 24); }, waitArrive(y), () => { y.hidden = true; },
              () => { go(m, [[209, 116], [209, 104]], 20); }, waitArrive(m), () => { m.hidden = true; },
              () => { L.door.target = 0; },
              pause(1.2),
              cu('soup'),
              '* Binnen ruikt het naar brood en soep.',
              '* Marcel houdt de kom met twee handen vast. Zijn vingers worden langzaam weer warm.',
              cuOff
            ]);
          });
        });
      } });
    lookObj(L, 'bord', 28, 106, 32, 3, 44, ['* Een bordje op de deur: "VOL. Excuses. Probeer morgen opnieuw."', '* Het is drie minuten over elf.'], { clue: 'bord' });
    lookObj(L, 'bel', 62, 106, 8, 3, 66, ['* De bel van de nachtopvang. Je zou willen aanbellen.', '* Maar niemand hoort jou.']);
    lookObj(L, 'etalage', 230, 106, 76, 3, 50, (L) => L.flags.shopLit ? ['* De etalage gloeit warm. Binnen zitten twee mensen aan een klein tafeltje.'] : ['* In de etalage liggen nog broden van vandaag.', '* Morgen zijn ze "van gisteren". Dan gaan ze weg.']);
    L.objs.push({ id: 'fiets', x: 112, y: 124, w: 28, h: 4, solid: true, top: 100, draw: () => { R(112, 112, 1, 14, PAL.g5); R(138, 112, 1, 14, PAL.g5); R(112, 112, 27, 1, PAL.g5); bike(126, 128); },
      inspect: () => say(['* Een fiets met een lekke band. Niemand heeft hem in weken bewogen.']) });
    L.objs.push({ id: 'vuilbak', x: 96, y: 118, w: 12, h: 4, solid: true, draw: () => bin(102, 122, '#3a4a3a') });
    L.objs.push({ id: 'lamp', x: 150, y: 116, w: 6, h: 4, solid: true, draw: (L, t) => lampPost(152, 120, true, t) });
    L.objs.push({ id: 'busje', x: 213, y: 182, w: 98, h: 12, solid: true, sortY: 196,
      draw: (L, t) => drawVan(Math.round(L.vanX), 194, t, L.flags.vanGo) });
    memObj(L, 3, 196, 106, 26, 3, null, 216, 64);
  },
  update(L, dt) {
    if (L.flags.vanGo) L.vanX += 70 * dt;
    if (L.vanX > 400) L.objs.forEach(o => { if (o.id === 'busje') o.solid = false; });
  },
  drawBg(L, t) {
    R(0, 0, W, H, '#07080a');
    // nachtopvang
    brickWall(0, 0, 122, 104, '#2a2622', '#1e1a18');
    R(10, 14, 100, 12, PAL.g4); txt('NACHTOPVANG', 60, 16, PAL.g9, 'center', 7);
    winFrame(16, 34, 16, 14, { lit: true, frame: PAL.g5 }); winFrame(86, 34, 16, 14, { lit: true, frame: PAL.g5 });
    R(22, 38, 4, 6, '#8a5a30'); R(90, 39, 5, 5, '#8a5a30');
    R(22, 50, 44, 4, PAL.g5); R(20, 54, 48, 2, PAL.g4);
    R(26, 56, 36, 48, PAL.g5); R(28, 58, 32, 46, '#2e2c30'); R(30, 62, 28, 18, '#28262a');
    R(32, 66, 24, 10, PAL.g9); txt('VOL', 44, 67, PAL.red, 'center', 8);
    R(54, 86, 2, 4, PAL.g8);
    R(63, 66, 4, 6, PAL.g7); R(64, 68, 2, 2, PAL.yellow);
    winFrame(80, 62, 26, 20, { lit: true, frame: PAL.g5 }); R(84, 70, 5, 5, '#8a5a30'); R(94, 68, 5, 7, '#8a5a30');
    // steegje
    R(122, 0, 50, 104, '#0c0c0e'); R(122, 0, 2, 104, PAL.g2); R(170, 0, 2, 104, PAL.g2);
    R(140, 60, 10, 44, '#141416'); glow(145, 50, 10, '255,220,140', 0.1);
    // bakkerij
    brickWall(172, 0, 148, 104, '#2c2826', '#201c1a');
    R(186, 20, 126, 12, '#3a2a24'); txt('BAKKERIJ', 249, 22, PAL.warm, 'center', 8);
    for (let i = 0; i < 126; i += 8) R(186 + i, 36, 8, 8, (i / 8) % 2 ? PAL.g8 : '#7a3a34');
    for (let i = 0; i < 126; i += 8) R(186 + i, 44, 8, 2, (i / 8) % 2 ? PAL.g7 : '#6a2a24');
    const lit = L.flags.shopLit;
    R(228, 52, 80, 48, PAL.g6);
    R(230, 54, 76, 44, lit ? '#c08848' : '#2a2420');
    if (lit) { glow(268, 76, 60, '255,200,110', 0.45); R(250, 82, 10, 8, '#5a3a20'); R(270, 82, 10, 8, '#5a3a20'); R(258, 78, 16, 2, '#7a5a3a'); }
    for (let s = 0; s < 3; s++) { R(232, 64 + s * 12, 72, 2, lit ? '#8a6a4a' : PAL.g4); for (let i = 0; i < 7; i++) R(235 + i * 10, 59 + s * 12, 7, 5, lit ? '#d8aa6a' : '#5a4a3a'); }
    R(228, 100, 80, 4, PAL.g5);
    wallDoor(L.door, t);
    R(201, 64, 16, 10, lit ? '#e8d0a0' : PAL.g8); R(203, 66, 10, 1, PAL.g5); R(203, 69, 8, 1, PAL.g5);
    // stoep, goot, straat
    tiles(0, 104, W, 46, '#1e1e22', '#28282c', 12);
    R(0, 104, W, 2, '#2c2c30');
    R(0, 150, W, 3, PAL.g5);
    R(0, 153, W, 90, '#121214');
    for (let i = 0; i < W; i += 50) R(i + 10, 194, 26, 2, PAL.g4);
    puddle(70, 168, 30, true); puddle(150, 158, 22, true); puddle(200, 210, 40, false);
    if (lit) { ctx.fillStyle = 'rgba(255,200,110,0.12)'; ctx.fillRect(196, 104, 26, 46); ctx.fillRect(230, 104, 76, 46); }
  }
});

/* Bestelwagen van de bakkerij (zijaanzicht, rijdt naar rechts). y = de grond onder de wielen */
function drawVan(x0, y0, t, driving) {
  // 4/3 groter: 1 wagenpixel = precies 4 schermpixels, dus blijft alles scherp
  ctx.save(); ctx.translate(x0, y0); ctx.scale(4 / 3, 4 / 3);
  const x = 0, y = 0;
  const body = '#d8d2c6', bd = '#a8a296', red = '#8a3a30';
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x + 1, y - 1, 72, 3);
  // laadruimte met afgeronde hoek
  R(x + 1, y - 37, 48, 1, body); R(x, y - 36, 50, 28, body); R(x + 1, y - 36, 48, 1, PAL.white);
  // cabine met schuine voorruit en motorkap
  ctx.fillStyle = body; ctx.beginPath();
  ctx.moveTo(x + 49, y - 35); ctx.lineTo(x + 59, y - 35); ctx.lineTo(x + 67, y - 22); ctx.lineTo(x + 72, y - 20); ctx.lineTo(x + 73, y - 8); ctx.lineTo(x + 49, y - 8); ctx.closePath(); ctx.fill();
  // ramen
  ctx.fillStyle = '#1c2430'; ctx.beginPath();
  ctx.moveTo(x + 52, y - 33); ctx.lineTo(x + 58, y - 33); ctx.lineTo(x + 65, y - 22); ctx.lineTo(x + 52, y - 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(x + 55, y - 33); ctx.lineTo(x + 57, y - 33); ctx.lineTo(x + 54, y - 23); ctx.lineTo(x + 52, y - 23); ctx.fill();
  if (!driving) { R(x + 56, y - 28, 3, 3, '#3a3a40'); }
  // naden, handgreep, spiegel
  R(x + 50, y - 35, 1, 27, bd); R(x + 66, y - 21, 1, 13, bd); R(x + 53, y - 19, 4, 1, PAL.g5);
  R(x + 28, y - 34, 1, 26, bd); R(x + 30, y - 22, 1, 4, PAL.g5);
  R(x + 63, y - 28, 2, 4, PAL.g4);
  // rode streep en opschrift
  R(x, y - 16, 73, 3, red); R(x, y - 13, 73, 1, shade(red, 20));
  txt('BAKKERIJ', x + 14, y - 32, red, 'center', 5);
  R(x + 34, y - 30, 11, 5, '#c89a5a'); R(x + 35, y - 31, 9, 1, '#d8aa6a'); R(x + 36, y - 29, 1, 2, '#a07a40'); R(x + 39, y - 29, 1, 2, '#a07a40'); R(x + 42, y - 29, 1, 2, '#a07a40');
  txt('vers brood', x + 14, y - 25, PAL.g4, 'center', 4);
  // bumpers en lichten
  R(x - 1, y - 11, 3, 4, PAL.g4); R(x + 71, y - 11, 3, 4, PAL.g4); R(x + 2, y - 9, 68, 1, bd);
  R(x, y - 31, 2, 6, driving ? '#ff5a4a' : PAL.red);
  R(x + 70, y - 19, 3, 3, PAL.yellow);
  if (driving) glow(x + 80, y - 17, 18, '255,230,150', 0.35);
  // wielkasten + wielen
  [x + 13, x + 58].forEach(wx => {
    ctx.fillStyle = '#121214'; ctx.beginPath(); ctx.arc(wx, y - 6, 8, Math.PI, 0); ctx.fill();
    ctx.fillStyle = PAL.g1; ctx.beginPath(); ctx.arc(wx, y - 6, 6, 0, 7); ctx.fill();
    ctx.fillStyle = PAL.g6; ctx.beginPath(); ctx.arc(wx, y - 6, 3, 0, 7); ctx.fill();
    const a = x0 * 0.2;
    R(wx - 0.5 + Math.cos(a) * 2, y - 6.5 + Math.sin(a) * 2, 1, 1, PAL.g3);
    R(wx - 0.5, y - 6.5, 1, 1, PAL.g4);
  });
  // regendruppels op het dak
  for (let i = 0; i < 4; i++) R(x + 6 + i * 12, y - 38, 1, 1, '#9ab0c8');
  ctx.restore();
}
