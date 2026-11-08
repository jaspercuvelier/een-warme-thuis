'use strict';
/* ========== HOOFDSTUK 2: EENZAME OPA ACHTER HET RAAM ========== */
LEVELS.push({
  title: 'Eenzame opa achter het raam',
  place: 'Een rijhuis in de Lindestraat · 16u40',
  quote: 'Eenzaamheid is een huis waar niemand aanbelt.',
  bounds: { x: 12, y: 108, w: 296, h: 96 },
  start: { x: 150, y: 186 },
  exit: { x: 20, y: 190 },
  warmAt: { x: 90, y: 130 },
  need: 2,
  cold: ['* Je liet het licht uit.', '* Buiten liep de buurvrouw voorbij, haar hoofd diep in haar sjaal.', '* Binnen werd de koffie nog wat kouder.'],
  init(L) {
    L.nb = { x: 96, walk: 0, stop: false, wave: false, gone: false };
    L.lampFlash = 0;
    L.door = { x: 262, w: 26, h: 56, hinge: 'right', color: '#5a4a3a', frame: '#6a5a4a', open: 0, target: 0, lightIn: false,
      drawOutside: (x, y, w, h, t) => {
        R(x, y, w, h, '#10131a'); R(x, y + h - 12, w, 12, PAL.g4); R(x, y + h - 13, w, 1, PAL.g9);
        for (let i = 0; i < 5; i++) R(x + ((i * 7 + t * 3) % w), y + ((i * 13 + t * 12) % (h - 12)), 1, 1, PAL.g9);
      } };
    L.doors = [L.door];

    const opa = L.opa = makeNPC({ x: 160, y: 127, dir: 1, sit: true, back: true, speed: 18,
      look: { elder: true, hairStyle: 'bald', hair: PAL.g9, skin: '#e0d6cc', coat: '#6a6058', vest: '#5a5048', pants: PAL.g4, glasses: true, expr: 'sad' } });
    opa.extra = (n) => { if (L.flags.opaWave && n.sit) { const w = Math.floor(G.t * 5) % 2; R(n.x + 9, n.y - 34 - w, 3, 10, '#5a5048'); R(n.x + 9, n.y - 37 - w, 3, 3, '#e0d6cc'); } };
    npcObj(L, opa, { id: 'opa', clue: 'opa',
      inspect: (L, o) => {
        if (L.solved) return;
        if (o.n === 1) say(['* Opa Jef zit in zijn leunstoel. Hij kijkt al uren naar buiten.',
          '* Naast hem staat een kop koffie. Koud. Hij heeft het niet gemerkt.',
          ['Opa Jef', '(Weer een dag. Niemand belt. Ik zou ook niet weten wie ik zou bellen.)']]);
        else say([['Opa Jef', '(Mieke zou zeggen: "Jef, je moet onder de mensen komen." ...Maar welke mensen?)']]);
      } });
    const fat = L.fat = makeNPC({ x: 275, y: 104, dir: -1, hidden: true, speed: 30,
      look: { hairStyle: 'hijab', capC: '#a0645a', coat: PAL.g7, longCoat: true, pants: PAL.g4, acc: PAL.orange, expr: 'happy',
        hold: (hx, hy) => { R(hx - 1, hy, 4, 6, PAL.g8); R(hx - 1, hy - 1, 4, 1, PAL.g6); R(hx + 3, hy + 1, 1, 3, PAL.g8); } } });
    npcObj(L, fat, { id: 'fatma', solid: false, inspect: () => { } });

    // zetel (rug naar ons) — voor opa getekend
    L.objs.push({ id: 'zetel', x: 146, y: 126, w: 28, h: 8, solid: true, sortY: 133,
      draw: (L) => { if (L.opa.sit) armchairBack(160, 133, '#6a4a3a'); else armchairBack(160, 133, '#6a4a3a'); } });
    // bijzettafeltje met koude koffie
    L.objs.push({ id: 'koffie', x: 182, y: 124, w: 12, h: 6, solid: true, top: 100,
      draw: (L, t) => {
        R(181, 113, 14, 2, '#5a4a3a'); R(187, 115, 2, 15, '#4a3a2c'); R(183, 129, 10, 1, '#4a3a2c');
        R(185, 109, 5, 4, PAL.g9); R(190, 110, 1, 2, PAL.g9);
        if (L.solved) for (let i = 0; i < 2; i++) R(186 + i * 2, 104 - ((t * 6 + i * 3) % 5), 1, 2, PAL.g8);
      },
      inspect: (L, o) => say(L.solved ? ['* De koffie is nu warm. Er ligt een koekje naast.'] : ['* Een kop koffie. Ijskoud.', '* Er drijft een velletje op.']) });
    // eettafel met twee stoelen
    L.objs.push({ id: 'stoel1', x: 44, y: 146, w: 12, h: 5, solid: true, sortY: 149, draw: () => chair(50, 150, 1, '#5a4a3a') });
    L.objs.push({ id: 'stoel2', x: 98, y: 146, w: 12, h: 5, solid: true, sortY: 149, top: 118, draw: () => chair(104, 150, -1, '#5a4a3a'),
      inspect: (L) => say(L.solved ? ['* Op de tweede stoel zit vandaag iemand.'] : ['* Twee stoelen aan tafel. Eén ervan wordt al drie jaar niet meer gebruikt.', '* Opa schuift hem soms toch een beetje recht.']) });
    L.objs.push({ id: 'tafel', x: 58, y: 144, w: 38, h: 6, solid: true, sortY: 151, top: 124,
      draw: (L, t) => {
        table(58, 150, 38, '#5a4a3a', '#d8d0c0');
        if (L.flags.tableSet) { R(64, 131, 5, 4, PAL.g9); R(86, 131, 5, 4, PAL.g9); R(74, 130, 8, 5, PAL.g8); R(75, 129, 6, 1, PAL.warm);
          for (let i = 0; i < 2; i++) R(66 + i * 22, 126 - ((t * 6 + i * 3) % 5), 1, 2, PAL.g8); }
        else R(70, 132, 12, 2, PAL.g7);
      },
      inspect: () => say(['* Een tafel voor twee, gedekt voor één.']) });
    // dressoir met foto's
    L.objs.push({ id: 'dressoir', x: 36, y: 104, w: 50, h: 6, solid: true, top: 34, clue: 'foto',
      draw: () => {
        R(36, 80, 50, 26, '#4a3a2c'); R(36, 80, 50, 2, '#5a4a3a');
        R(39, 84, 21, 18, '#3e3024'); R(62, 84, 21, 18, '#3e3024'); R(58, 92, 2, 3, PAL.g8); R(63, 92, 2, 3, PAL.g8);
        shelf(36, 80, 50, ['photo', 'candle', 'vase', 'photo', 'cup']);
      },
      inspect: (L, o) => say(o.n < 2 ? [cu('miekePhoto'), '* Boven het dressoir hangt een foto van een vrouw met lachrimpels.', '* Op het lijstje staat: "Mieke. 52 jaar samen."', cuOff] :
        ['* Soms zegt opa nog "goedemorgen" tegen de foto.', '* Dan is het heel lang stil in huis.']) });
    lookObj(L, 'kalender', 90, 106, 20, 3, 32, ['* Een kalender. Hij hangt nog op oktober.', '* Alle vakjes zijn leeg. Behalve één: "Mieke - 3 jaar." Met een klein hartje.'], { clue: 'kalender' });
    L.objs.push({ id: 'klok', x: 14, y: 104, w: 16, h: 4, solid: true, top: 50, draw: (L, t) => pendulumClock(22, 64, t),
      inspect: (L, o) => { Sfx.click(); say(o.n < 4 ? ['* Tik. Tak. Tik. Tak.', '* In een stil huis is een klok het luidste geluid.'] : ['* Tik. Tak.', '* Opa heeft hem al 40 jaar. Mieke wond hem elke zondag op. Nu doet hij het.']); } });
    L.objs.push({ id: 'telefoon', x: 228, y: 122, w: 14, h: 6, solid: true, top: 98, clue: 'telefoon',
      draw: () => { R(226, 112, 18, 2, '#5a4a3a'); R(228, 114, 2, 14, '#4a3a2c'); R(240, 114, 2, 14, '#4a3a2c'); R(229, 107, 12, 5, PAL.g8); R(230, 105, 10, 2, PAL.g9); R(233, 108, 4, 2, PAL.g6); },
      inspect: () => say(['* De telefoon. Het laatste gesprek was 23 dagen geleden.', '* Een verkeerd nummer. Opa heeft toch tien minuten met de beller gepraat.']) });
    L.objs.push({ id: 'kapstok', x: 244, y: 104, w: 10, h: 6, solid: true, top: 50,
      draw: () => { coatRack(248, 106, ['#5a5048']); hat(252, 60, '#6a5a6a'); },
      inspect: () => say(['* Aan de kapstok: de jas van opa. En een hoedje met een rood lint.', '* Het hoedje is niet van opa. Hij krijgt het niet over zijn hart om het weg te leggen.']) });
    L.objs.push({ id: 'plant', x: 292, y: 126, w: 10, h: 4, solid: true, top: 104, draw: () => plant(297, 130, 1, true),
      inspect: () => say(['* Een kamerplant. Een beetje verlept. Net als de rest van het huis.']) });
    L.objs.push({ id: 'lamp', x: 182, y: 106, w: 20, h: 3, top: 50,
      inspect: (L) => {
        if (L.solved) return;
        if (!understood(L)) { say(['* Een oude schemerlamp op de vensterbank. Ze staat uit.', '* Je weet nog niet goed waarom je hier bent. Kijk eerst wat rond.']); return; }
        say(['* De schemerlamp staat vlak bij het raam. Buiten loopt iemand voorbij...',
          '* Als het licht op het juiste ritme knippert, valt het misschien op.',
          '* (Druk [Z] telkens wanneer de ring het lampje raakt.)'], () => startAction(lampAction2()));
      } });
    memObj(L, 1, 272, 136, 8, 5, () => { R(272, 136, 9, 6, PAL.g9); R(273, 138, 6, 1, PAL.g5); R(273, 140, 5, 1, PAL.g5); }, 277, 132);
  },
  update(L, dt) {
    const nb = L.nb;
    if (!nb.stop) {
      nb.x += 14 * dt; animWalk(nb, dt);
      if (G.mg && G.mg.lamp && nb.x > 160) nb.x = 160;
      if (nb.x > 230) nb.x = 96;
    } else if (nb.leave && nb.x < 214) { nb.x += 22 * dt; animWalk(nb, dt); }
    if (L.lampFlash > 0) L.lampFlash -= dt;
  },
  drawBg(L, t) {
    roomShell({ wall: '#2c2824', wall2: '#34302a', pattern: 'dots', floorC: '#3a3028', floorL: '#2c241c', trim: '#5a4a3a' });
    // raam met straat
    winFrame(122, 20, 76, 52, { frame: '#6a5a4a', sillC: '#7a6a5a', outside: (x, y, w, h) => {
      R(x, y, w, h, '#10131a');
      facade(x - 4, y + 8, 46, 40, { c: '#1e1e22', cols: 2, rows: 1, lit: [1], snow: true });
      facade(x + 44, y + 4, 40, 44, { c: '#222226', cols: 2, rows: 1, lit: L.solved ? [0, 1] : [0], snow: true });
      R(x, y + h - 6, w, 6, PAL.g4); R(x, y + h - 7, w, 1, PAL.g9);
      for (let i = 0; i < 7; i++) R(x + ((i * 11 + t * 4) % w), y + ((i * 17 + t * 12) % h), 1, 1, PAL.g9);
      const nb = L.nb;
      if (!nb.gone) drawPerson(x + (nb.x - 122), y + h - 2, { hairStyle: 'hijab', capC: '#a0645a', coat: PAL.g7, longCoat: true, pants: PAL.g4, acc: PAL.orange,
        dir: nb.stop && !nb.leave ? -1 : 1, moving: !nb.stop || nb.leave, walk: nb.walk, expr: nb.stop ? 'happy' : 'neutral', arm: L.flags.nbWave && !nb.leave ? 'wave' : 'hold',
        hold: (hx, hy) => { R(hx - 1, hy, 4, 6, PAL.g8); R(hx + 3, hy + 1, 1, 3, PAL.g8); } });
    } });
    curtain(112, 18, 10, 58, '#5a3a34'); curtain(198, 18, 10, 58, '#5a3a34');
    // schemerlamp op de vensterbank
    const on = L.lampFlash > 0 || L.solved;
    R(190, 70, 4, 6, PAL.g5); R(187, 75, 10, 2, PAL.g5);
    R(184, 60, 16, 10, on ? PAL.yellow : '#b0a080'); R(185, 59, 14, 1, on ? PAL.yellow : '#b0a080');
    if (on) glow(192, 64, 38, '255,220,140', 0.55);
    // foto van Mieke
    frameArt(48, 34, 22, 28, (x, y, w, h) => { R(x, y, w, h, '#b8a68a'); R(x + 3, y + 15, 12, 9, '#8a6a5a'); R(x + 7, y + 12, 4, 3, '#c8b090'); R(x + 5, y + 4, 8, 9, '#d8c0a0'); R(x + 4, y + 2, 10, 4, '#e4dccc'); R(x + 4, y + 5, 2, 4, '#e4dccc'); R(x + 12, y + 5, 2, 4, '#e4dccc'); R(x + 6, y + 8, 1, 1, '#4a3a2c'); R(x + 11, y + 8, 1, 1, '#4a3a2c'); R(x + 7, y + 11, 4, 1, '#8a4a40'); R(x + 6, y + 10, 1, 1, '#8a4a40'); R(x + 11, y + 10, 1, 1, '#8a4a40'); });
    // kalender
    R(92, 30, 18, 24, PAL.g9); R(92, 30, 18, 5, PAL.red);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) R(94 + i * 4, 37 + j * 4, 3, 3, PAL.g7);
    heart(98, 46, PAL.red);
    lightSwitch(234, 58); outlet(214, 94);
    wallDoor(L.door, t);
    // tapijt
    rug(110, 118, 100, 38, '#4a3030', '#5a3c38');
  },
  drawFg(L) {
    if (L.solved) glow(80, 130, 70, '255,200,120', 0.18 * L.warm);
  }
});

function lampAction2() {
  return {
    lamp: true, t: 0, beats: [1.2, 2.0, 2.8], hit: [null, null, null], done: false,
    update(L, dt) {
      this.t += dt;
      if (Input.hit('ok')) {
        let bi = -1, bd = 9;
        this.beats.forEach((b, i) => { if (this.hit[i] === null && Math.abs(this.t - b) < bd) { bd = Math.abs(this.t - b); bi = i; } });
        if (bi >= 0 && bd < 0.17) { this.hit[bi] = true; L.lampFlash = 0.25; Sfx.click(); Sfx.tone(880, 0.1, 'triangle', 0.05); }
        else if (bi >= 0 && bd < 0.5) { this.hit[bi] = false; Sfx.bad(); }
      }
      this.beats.forEach((b, i) => { if (this.hit[i] === null && this.t > b + 0.2) { this.hit[i] = false; Sfx.bad(); } });
      if (this.done || this.t <= 3.4) return;
      this.done = true;
      if (!this.hit.every(h => h)) {
        say(['* Het licht flikkert wat onregelmatig. De buurvrouw kijkt niet op.', '* Probeer het nog eens: drie keer, mooi op het ritme van de ringen.'],
          () => { L.nb.x = 100; startAction(lampAction2()); });
        return;
      }
      const opa = L.opa, fat = L.fat, nb = L.nb;
      nb.stop = true;
      solve(L, [
        '* Knip. Knip. Knip.',
        ['Buurvrouw', 'Hé... geeft daar iemand een teken?'],
        '* De buurvrouw blijft staan. Ze ziet opa achter het raam zitten.',
        cu('opaFace'),
        '* Opa schrikt op. Kijkt. En dan... gebeurt er iets met zijn gezicht.',
        cuOff,
        () => { L.flags.opaWave = true; },
        '* Opa heft aarzelend zijn hand.',
        () => { L.flags.nbWave = true; },
        cu('fatmaWave'),
        '* Ze zwaait terug. Breed. Met haar hele arm.',
        ['Buurvrouw Fatma', 'Meneer Jef! Ik woon hier al twee jaar naast u en ik heb u nog nooit goedendag gezegd. Schandalig!'],
        ['Buurvrouw Fatma', 'Ik heb net verse koffie gezet. Mag ik binnenkomen?'],
        cuOff,
        () => { L.flags.opaWave = false; },
        ['Opa Jef', 'Koffie? ...Ja. Ja, graag!'],
        () => { nb.leave = true; L.flags.nbWave = false; },
        pause(1.0),
        () => { nb.gone = true; Sfx.tone(988, 0.3, 'sine', 0.05); Sfx.tone(784, 0.4, 'sine', 0.05, null, 0.25); },
        '* Ding-dong.',
        '* Voor het eerst in drie weken gaat de deurbel.',
        () => { opa.sit = false; opa.back = false; opa.expr = 'happy'; opa.y = 136; go(opa, [[190, 140], [262, 118]], 20); opa.endDir = 1; },
        waitArrive(opa),
        () => { L.door.target = 1; },
        waitFor(() => L.door.open > 0.95),
        () => { fat.hidden = false; fat.x = 275; fat.y = 104; go(fat, [[275, 114], [238, 128]], 26); fat.endDir = -1; },
        waitArrive(fat),
        () => { opa.dir = -1; L.door.target = 0; },
        ['Buurvrouw Fatma', 'Dag meneer Jef. Ik ben Fatma. Van nummer 14.'],
        ['Opa Jef', 'Fatma. Kom binnen, kom binnen. Wacht, ik heb nog koekjes. Ze waren voor als er eens iemand langskwam.'],
        () => { go(opa, [[200, 150], [44, 156], [50, 150]], 22); opa.endDir = 1; go(fat, [[200, 164], [110, 160], [104, 150]], 26); fat.endDir = -1; },
        waitArrive(opa, fat),
        () => { opa.sit = true; fat.sit = true; fat.look.hold = null; L.flags.tableSet = true; },
        pause(0.6),
        ['Buurvrouw Fatma', 'Mag ik hier zitten?'],
        '* Opa kijkt naar de tweede stoel. Drie jaar lang zat daar niemand.',
        ['Opa Jef', '...Ja. Ja, ga daar maar zitten. Dat is een goeie stoel.'],
        cu('opaFace', { expr: 'happy', tear: true }),
        '* Tik. Tak. De klok tikt nog altijd. Maar je hoort hem niet meer.',
        cuOff
      ]);
    },
    draw(L) {
      const cx = 192, cy = 64;
      this.beats.forEach((b, i) => {
        const d = b - this.t;
        if (d > -0.05 && d < 1.0 && this.hit[i] === null) {
          ctx.strokeStyle = PAL.yellow; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(cx, cy, 5 + d * 34, 0, Math.PI * 2); ctx.stroke();
        }
      });
      box(70, 210, 180, 24, PAL.white, PAL.black, 1);
      txt('[Z] wanneer de ring het licht raakt', 160, 214, PAL.white, 'center', 7);
      this.hit.forEach((h, i) => R(148 + i * 10, 224, 6, 6, h === true ? PAL.yellow : h === false ? PAL.red : PAL.g4));
    }
  };
}
