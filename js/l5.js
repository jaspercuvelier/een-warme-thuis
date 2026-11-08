'use strict';
/* ========== HOOFDSTUK 5: PESTEN OP SCHOOL / JEZELF ZIJN ========== */
LEVELS.push({
  title: 'Jezelf mogen zijn',
  place: 'De speelplaats van school De Linde · 10u25',
  quote: 'Moed is niet: geen angst hebben. Moed is: toch opstaan.',
  bounds: { x: 4, y: 104, w: 312, h: 100 },
  start: { x: 290, y: 150 },
  exit: { x: 292, y: 190 },
  warmAt: { x: 116, y: 120 },
  need: 2,
  cold: ['* Sam keek weg. De rest van de speelplaats ook.', '* Noor tekende die week geen draken meer.', '* Ook niet de week erna.'],
  init(L) {
    L.tries = 0;
    const noor = L.noor = makeNPC({ x: 106, y: 136, dir: 1, sit: true,
      look: { kid: true, hairStyle: 'long', hair: PAL.g2, coat: PAL.g8, stripes: '#b05048', pants: PAL.g4, expr: 'sad', arm: 'hold',
        hold: (hx, hy) => { R(hx - 2, hy - 3, 7, 6, PAL.g9); R(hx - 1, hy - 2, 3, 2, PAL.g5); } } });
    const sam = L.sam = makeNPC({ x: 236, y: 146, dir: -1, speed: 30,
      look: { kid: true, hairStyle: 'spiky', hair: PAL.g5, coat: '#6a7a6a', pants: PAL.g3, expr: 'worried' } });
    const b1 = L.b1 = makeNPC({ x: 146, y: 142, dir: -1, speed: 40, look: { kid: true, hairStyle: 'cap', capC: PAL.g3, coat: PAL.g4, pants: PAL.g3, expr: 'laugh' } });
    const b2 = L.b2 = makeNPC({ x: 128, y: 156, dir: -1, speed: 40, look: { kid: true, hairStyle: 'short', hair: PAL.g2, coat: PAL.g5, pants: PAL.g3, expr: 'happy' } });
    npcObj(L, noor, { id: 'noor', clue: 'noor',
      inspect: (L, o) => { if (L.solved) return; say(o.n === 1 ? ['* Noor houdt haar schetsboek tegen zich aan. Haar trui is zelfgebreid, met rode strepen.',
        '* In het schetsboek: draken. Prachtige draken, met vleugels van wel duizend schubben.',
        ['Noor', '(Niet huilen. Niet hier. Nog vier uur tot de bel.)']] :
        [['Noor', '(Misschien moet ik gewoon stoppen met tekenen. Dan is er niks meer om te pesten.)']]); } });
    const pest = (n, id) => npcObj(L, n, { id, clue: 'pesters',
      inspect: (L) => { if (L.solved) return; say([['Pester', 'Wat is dat voor een rare trui? Heeft je oma die gemaakt? Hahaha!'], ['Pester', 'En wie tekent er nu nog draken? Baby.']]); } });
    pest(b1, 'p1'); pest(b2, 'p2');
    npcObj(L, sam, { id: 'sam', clue: 'sam',
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Sam, een klasgenoot. Sam kijkt naar de bank. Balt de vuisten. Kijkt weg. Kijkt weer.', ['Sam', '(Als ik iets zeg, ben ik de volgende...)']]); return; }
        say(['* Sam wil iets doen. Je voelt het. Sam heeft alleen wat... moed nodig.',
          '* Geef Sam moed: druk [Z] wanneer het hartje precies in het midden staat.'], () => startAction(courageAction5()));
      } });
    L.objs.push({ id: 'bank', x: 92, y: 128, w: 52, h: 8, solid: true, sortY: 135, top: 104,
      draw: () => bench(92, 137, 52, '#6a5440'),
      inspect: (L, o) => { if (o.n >= 3) memory(L, 4, null); else say(['* Een houten bank. Er zijn initialen in gekrast. Heel veel initialen.', o.n === 2 ? '* Er staat ook iets kleiners... Kijk nog eens beter.' : '* Je kijkt nog eens. Er staat meer.']); } });
    L.objs.push({ id: 'boom', x: 66, y: 120, w: 10, h: 6, solid: true, top: 40, draw: () => bareTree(70, 126, 80, false),
      inspect: () => say(['* Een oude linde. Hij staat hier al langer dan de school.', '* In de schors: "N + draak". Klein. Bijna onzichtbaar.']) });
    L.objs.push({ id: 'draak', x: 192, y: 176, w: 12, h: 6, top: 164,
      draw: () => { R(192, 176, 12, 8, PAL.g9); R(194, 178, 6, 2, PAL.g5); R(199, 177, 2, 2, PAL.g5); R(195, 181, 2, 1, PAL.orange); },
      inspect: (L, o) => say(o.n === 1 ? [cu('drawing'), '* Een tekening, uit het schetsboek gescheurd en weggewaaid.', '* Een grote draak spreidt zijn vleugel over een klein, gloeiend figuurtje.', '* Het figuurtje lijkt een beetje op... jou?', cuOff] :
        ['* De tekening van de draak. Hij beschermt het kleine lichtje onder zijn vleugel.']) });
    L.objs.push({ id: 'paal', x: 270, y: 120, w: 6, h: 4, solid: true, top: 40,
      draw: () => { R(272, 46, 3, 78, PAL.g5); R(262, 36, 24, 14, PAL.g8); R(264, 38, 20, 10, PAL.g7); R(268, 50, 12, 2, PAL.orange); for (let i = 0; i < 4; i++) R(269 + i * 3, 52, 1, 6, PAL.g7); },
      inspect: () => say(['* Een basketbalring. Niemand mikt vandaag.']) });
    L.objs.push({ id: 'fietsen', x: 10, y: 120, w: 40, h: 6, solid: true, draw: () => { bike(20, 126); bike(42, 126); R(8, 116, 46, 1, PAL.g5); } });
    lookObj(L, 'ramen', 30, 104, 90, 3, 30, ['* Achter de ramen hangen tekeningen van de klas. Bloemen, huizen, voetballers.', '* Geen draken. Niemand durfde.']);
    lookObj(L, 'klok', 150, 104, 20, 3, 14, ['* De schoolklok. Nog zeven minuten speeltijd.', '* Zeven minuten kunnen heel lang duren.']);
  },
  update(L, dt) {
    L.kids = L.kids || [{ x: 300, d: -1 }, { x: 240, d: 1 }];
    if (!L.solved) L.kids.forEach(k => { k.x += k.d * 26 * dt; if (k.x < 200 || k.x > 306) k.d *= -1; });
  },
  drawBg(L, t) {
    R(0, 0, W, H, '#0e0e10');
    brickWall(0, 0, W, 98, '#2c2a28', '#22201e');
    R(0, 0, W, 4, PAL.g4);
    const art = ['#b05048', '#5a8ac0', '#d8b050', '#6fa05f'];
    for (let i = 0; i < 4; i++) {
      winFrame(18 + i * 30, 18, 20, 22, { sky: '#202830', frame: PAL.g6, sill: false });
      R(22 + i * 30, 22, 6, 5, art[i]); R(30 + i * 30, 30, 5, 6, art[(i + 1) % 4]);
      winFrame(210 + (i % 3) * 30, 18, 20, 22, { sky: '#202830', frame: PAL.g6, sill: false });
    }
    R(140, 6, 40, 10, PAL.g7); txt('DE LINDE', 160, 7, PAL.g2, 'center', 6);
    wallClock(160, 26, t * 40);
    R(140, 44, 40, 54, PAL.g5); R(142, 46, 17, 52, '#3a3a40'); R(161, 46, 17, 52, '#3a3a40'); R(156, 70, 2, 4, PAL.g8); R(162, 70, 2, 4, PAL.g8);
    R(144, 50, 13, 14, '#202830'); R(163, 50, 13, 14, '#202830');
    // speelplaats
    tiles(0, 98, W, 142, '#26262a', '#2e2e32', 16);
    R(0, 98, W, 3, PAL.g4);
    ctx.strokeStyle = '#4a4a50'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) ctx.strokeRect(30.5 + i * 13, 180.5, 12, 12);
    ctx.beginPath(); ctx.arc(220, 150, 22, 0, 7); ctx.stroke();
    txt('1  2  3  4  5', 35, 183, '#4a4a50', 'left', 6);
    // kinderen achteraan
    if (L.kids) L.kids.forEach((k, i) => drawPerson(k.x, 112 + i * 2, { kid: true, coat: i ? '#5a6a8a' : '#8a6a5a', pants: PAL.g3, hairStyle: i ? 'pony' : 'short', hair: PAL.g3, dir: k.d, moving: !L.solved, walk: Math.floor(t * 5 + i) % 2, expr: 'happy' }));
  },
  drawFg(L) {
    if (L.solved) glow(118, 116, 50, '255,190,110', 0.25 * L.warm);
  }
});

function courageAction5() {
  return {
    pos: 0, dir: 1, result: null, wait: 0, speed: 1.4,
    start(L) { this.speed = Math.max(0.9, 1.4 - Math.min(L.tries, 2) * 0.25); },
    update(L, dt) {
      if (this.result !== null) { this.wait += dt; if (this.wait > 0.9) this.finish(L); return; }
      this.pos += this.dir * dt * this.speed;
      if (this.pos > 1) { this.pos = 1; this.dir = -1; }
      if (this.pos < 0) { this.pos = 0; this.dir = 1; }
      if (Input.hit('ok')) {
        const d = Math.abs(this.pos - 0.5);
        this.result = d < 0.05 ? 3 : d < 0.12 ? 2 : d < 0.22 ? 1 : 0;
        if (this.result >= 2) Sfx.ok(); else Sfx.bad();
      }
    },
    finish(L) {
      L.tries++;
      const r = this.result;
      if (r < 2) {
        say([r === 1 ? '* Sam zet een stap... en blijft dan toch staan. Bijna!' : '* Sam aarzelt. De moed zakt weer weg.',
          '* Probeer het opnieuw. Mik op het midden: daar zit de meeste moed.'], () => startAction(courageAction5()));
        return;
      }
      const { sam, b1, b2, noor } = L;
      solve(L, [
        () => { sam.expr = 'determined'; sam.look.acc = PAL.yellow; },
        cu('sam'),
        r === 3 ? '* MOED: MAXIMAAL! Sams hart bonkt. Maar Sams benen bewegen.' : '* MOED: GENOEG. Sams benen trillen. Maar ze bewegen.',
        cuOff,
        () => { go(sam, [[170, 150]], 34); sam.endDir = -1; }, waitArrive(sam),
        ['Sam', 'Stop. Gewoon... stop.'],
        () => { b1.dir = 1; b2.dir = 1; b1.expr = 'surprised'; b2.expr = 'surprised'; },
        ['Pester', 'Huh? Wat wil jij nou?'],
        ['Sam', 'Ik vind haar draken cooler dan alles wat jij ooit gemaakt hebt.'],
        ['Sam', 'En die trui is van haar oma. Dat is net mooi. Daar is liefde in gebreid.'],
        () => { b1.expr = 'neutral'; b2.expr = 'neutral'; },
        ['Pester', '...Pff. Saai. Kom, we gaan.'],
        () => { go(b1, [[190, 124], [340, 120]], 44); go(b2, [[190, 176], [340, 182]], 44); },
        waitArrive(b1, b2),
        () => { b1.hidden = true; b2.hidden = true; },
        '* De pesters druipen af. Sam ademt uit. Heel lang.',
        () => { go(sam, [[134, 146], [130, 136]], 26); sam.endDir = -1; }, waitArrive(sam),
        () => { sam.sit = true; sam.expr = 'happy'; },
        ['Sam', 'Mag ik naast je zitten? ...Mag ik je draken eens zien?'],
        () => { noor.dir = 1; noor.expr = 'happy'; noor.look.blush = true; },
        cu('noor'),
        ['Noor', '...Vind je ze echt niet raar?'],
        cuOff,
        ['Sam', 'Ik vind ze magisch. Kun je mij er eentje leren tekenen?'],
        cu('dragon'),
        ['Noor', 'Ja. Ja! Begin met de vleugels. Die zijn het moeilijkst. Maar ook het mooist.'],
        cuOff,
        '* Op de bank zitten nu twee mensen. Eén schetsboek. En een draak die steeds groter wordt.'
      ]);
    },
    draw() {
      const x = 40, y = 196, w = 240, h = 22;
      box(x - 6, y - 16, w + 12, h + 26, PAL.white, PAL.black, 1);
      txt('MOED', x, y - 12, PAL.white, 'left', 7);
      txt('[Z] in het midden!', x + w, y - 12, PAL.g7, 'right', 7);
      R(x, y, w, h, PAL.g2); R(x + w * 0.28, y, w * 0.44, h, PAL.g3); R(x + w * 0.38, y, w * 0.24, h, PAL.g4);
      R(x + w * 0.45, y, w * 0.1, h, PAL.warm); R(x + w * 0.5, y, 1, h, PAL.white);
      const cx = x + this.pos * w;
      R(cx - 1, y - 3, 3, h + 6, this.result !== null && Math.floor(G.t * 10) % 2 ? PAL.yellow : PAL.white);
      heart(cx - 3, y - 10, PAL.red);
      if (this.result !== null) txt(['MIS', 'BIJNA', 'GOED!', 'PERFECT!'][this.result], W / 2, y - 30, this.result >= 2 ? PAL.yellow : PAL.red, 'center', 10);
    }
  };
}
