'use strict';
/* =========================================================
   endings.js — de drie eindes (koud, lauw, warm) + extraatjes
   ========================================================= */

const COLD_ECHO = [
  'Ergens bibbert een katje nog onder een stuk karton.',
  'Opa Jef kijkt nog altijd naar buiten. Niemand belt aan.',
  'Daan en Milan slapen in hetzelfde stapelbed. En zwijgen.',
  'Marcel staat nog in de regen.',
  'Noor heeft haar schetsboek weggegooid.',
  'Lien slaapt met haar jas aan.',
  'Yasmina zoekt nog altijd een adres.',
  'Amir kijkt nog altijd door het hek.',
  'In het kamp brandt geen vuur.'
];

const Ending = {
  kind: 'cold', t: 0, steps: [], card: null, cardT: 0, weather: null, cat: null,
  start(score) {
    this.kind = score >= 8 ? 'warm' : score >= 4 ? 'neutral' : 'cold';
    Save.data.endings = Save.data.endings || {};
    Save.data.endings[this.kind] = true; Save.store();
    G.state = 'END'; G.L = null; G.mg = null;
    this.t = 0; this.card = null; this.cat = null;
    this.weather = makeWeather(this.kind === 'cold' ? 'rain' : 'snow', this.kind === 'cold' ? 110 : 60);
    Music.play(this.kind === 'cold' ? SONGS.cold : this.kind === 'warm' ? SONGS.warm : SONGS.title);
    const echoes = G.scores.map((s, i) => s ? null : '* ' + COLD_ECHO[i]).filter(Boolean);
    const allMem = memCount() === 9;
    const steps = [];
    if (this.kind === 'cold') {
      steps.push({ say: ['* Het is stil in de stad.', '* De gordijnen zijn dicht. Eén voor één doven de straatlantaarns.',
        '* Je koos ervoor om niet in te grijpen.',
        '* Kou ontstaat niet door de winter, maar door onverschilligheid.',
        '* Zonder omzien naar elkaar heeft niemand een thuis.'] });
      steps.push({ card: { title: 'KIJK NIET WEG', lines: ['Ook in het echte leven begint een warme thuis bij jou.', '', 'Je mag het altijd opnieuw proberen.', 'In dit spel. En daarbuiten.'], color: PAL.g8 } });
    } else if (this.kind === 'neutral') {
      steps.push({ say: ['* Hier en daar brandt een zacht geel licht achter de ramen.', '* Maar grote delen van de stad blijven donker.'].concat(echoes).concat([
        '* Je hielp waar het eenvoudig was, maar liep door waar het moeilijk werd.',
        '* Een beetje warmte is een begin. Maar een echte thuis vraagt dat we niemand aan zijn lot overlaten.']) });
      steps.push({ card: { title: 'DURF EEN STAP VERDER', lines: ['Durf een stap verder te zetten', 'voor De Warmste Week.', '', 'Wie is er in jouw straat, jouw klas,', 'jouw familie die vandaag de kou voelt?'], color: PAL.warm } });
    } else {
      steps.push({ say: ['* Op het dorpsplein brandt een groot vuur. Iedereen is er.',
        '* Opa Jef praat met Youssef de bakker. Fatma deelt koffie uit.',
        '* Daan en Milan helpen Karim met de lichtjes. Noor tekent een draak voor Lien.',
        '* Amir speelt voetbal met Lotte. Yasmina heeft een plantje mee.',
        '* En vlak bij het vuur ligt een katje te slapen.',
        '* Jij bracht hen samen.',
        '* Niet met magische tovenarij, maar door mensen naar elkaar te laten omkijken.',
        '* Een warme thuis bouw je nooit alleen.'] });
      steps.push({ card: { title: 'DE WARMSTE WEEK', lines: [
        'Overal zijn mensen die vandaag een warme thuis missen.',
        'Een opa die niemand meer hoort. Een gezin in de kou.',
        'Een jongere zonder vangnet. Een vluchteling zonder dak.',
        '',
        'Steun een actie van De Warmste Week.',
        'Organiseer er zelf één, met je klas of je vrienden.',
        'Of begin vandaag nog: kijk om naar iemand.',
        '',
        'Wees solidair. Wees warm.'], color: PAL.orange } });
      steps.push({ fn: () => { this.cat = { x: 160, y: 190, state: 'walk' }; } });
      steps.push({ say: ['* ...', '* Het katje uit de steeg wordt wakker. Het rekt zich uit.', '* Dan stapt het recht naar jou toe. En gaat naast je zitten.',
        () => { if (this.cat) this.cat.state = 'sit'; Sfx.purr(); Closeup.show('catFinal'); },
        '* Het kijkt naar je. Het heeft je de hele tijd gezien.',
        '* Jij keek om naar iedereen.',
        '* Vergeet niet: er kijkt ook iemand om naar jou.'].concat(Save.data.catFriend ? ['* Prrrrrrrr.'] : []).concat([cuOff]) });
    }
    if (allMem) {
      steps.push({ say: ['* Negen kleine dingen die niemand zag.',
        '* Een wantje. Een boodschappenlijstje. Een tekening. Een bonnetje. Een kras in een bank. Een zon op de koelkast. Een knuffel. Een sticker. Een huis in de modder.',
        '* Zo werkt warmte. Klein. Onopvallend. En toch overal.',
        ['het lichtje', 'Dank je om ze te zien.']] });
    }
    steps.push({ card: { title: 'BEDANKT OM TE SPELEN', lines: [
      'Warmte: ' + score + ' / 9',
      'Herinneringen: ' + memCount() + ' / 9',
      '',
      'Een warme thuis is niet vanzelfsprekend.',
      'Ze ontstaat telkens opnieuw,',
      'als iemand omkijkt.',
      '',
      'Gemaakt voor de les godsdienst - De Warmste Week'], color: PAL.yellow, last: true } });
    this.steps = steps;
    this.next();
  },
  next() {
    const s = this.steps.shift();
    if (!s) { goTitle(); return; }
    this.card = null;
    if (s.fn) { s.fn(); this.next(); return; }
    if (s.say) say(s.say, () => this.next());
    if (s.card) { this.card = s.card; this.cardT = 0; Sfx.warm(); }
  },
  update(dt) {
    this.t += dt;
    if (this.cat && this.cat.state === 'walk' && this.cat.x >= 176) this.cat.state = 'sit';
    updateWeather(this.weather, dt, G.t);
    if (this.cat && this.cat.state === 'walk') { this.cat.x = Math.min(176, this.cat.x + 8 * dt); }
    if (Dialog.active) { Dialog.update(dt); return; }
    if (this.card) {
      this.cardT += dt;
      if (this.cardT > 1.2 && Input.hit('ok')) { Sfx.ok(); this.next(); }
    }
  },
  draw() {
    const t = this.t;
    if (this.kind === 'cold') this.drawCold(t);
    else if (this.kind === 'neutral') this.drawNeutral(t);
    else this.drawWarm(t);
    drawWeather(this.weather, G.hearts && this.kind !== 'cold');
    if (this.card) this.drawCard();
    Closeup.draw();
    Dialog.top = false;
    Dialog.draw();
  },
  street(litCount, t, lampsOn) {
    R(0, 0, W, H, '#050505');
    for (let i = 0; i < 25; i++) R((i * 61) % W, (i * 17) % 60, 1, 1, PAL.g4);
    const hs = [[6, 96, 50, 40], [62, 88, 44, 48], [112, 100, 40, 36], [158, 90, 52, 46], [216, 98, 42, 38], [264, 86, 50, 50]];
    let n = 0;
    hs.forEach((h, i) => {
      const lit = Math.max(0, Math.min(4, litCount - n));
      house(h[0], h[1], h[2], h[3], lit, t);
      n += 2;
    });
    R(0, 136, W, H - 136, PAL.g1);
    R(0, 136, W, 2, PAL.g4);
    for (let i = 0; i < 4; i++) lampPost(36 + i * 80, 150, lampsOn(i), t);
  },
  drawCold(t) {
    this.street(0, t, i => t < 3 + i * 2.2);
    // gesloten gordijnen
    if (Math.floor(t * 0.5) % 7 === 0) glow(W / 2, 200, 30, '255,226,150', 0.05);
    drawSpirit(W / 2, 156, G.t, { moving: false, dir: 1, sit: t > 14 });
  },
  drawNeutral(t) {
    const score = G.scores.reduce((a, b) => a + b, 0);
    this.street(score + 2, t, i => i % 2 === 0);
    drawSpirit(W / 2, 156, G.t, { moving: false, dir: 1 });
  },
  drawWarm(t) {
    // verlicht dorpsplein (iets hoger, zodat het tekstvak niets verbergt)
    R(0, 0, W, H, '#0a0806');
    ctx.save(); ctx.translate(0, -26);
    const hs = [[4, 70, 50, 44], [58, 62, 46, 52], [108, 74, 40, 40], [172, 64, 52, 50], [228, 72, 42, 42], [274, 60, 46, 54]];
    hs.forEach(h => house(h[0], h[1], h[2], h[3], 6, t));
    R(0, 114, W, H + 30 - 114, '#161210');
    // slingers met lichtjes
    for (let i = 0; i < W; i += 8) {
      const y = 40 + Math.sin(i / W * Math.PI) * 14;
      R(i, y, 1, 1, PAL.g5);
      if (i % 16 === 0) { const c = [PAL.yellow, PAL.orange, PAL.red, PAL.warm][(i / 16) % 4]; R(i, y + 1, 2, 2, c); glow(i + 1, y + 2, 6, '255,200,110', 0.3 + 0.2 * Math.sin(t * 3 + i)); }
    }
    // boomstammen rond het vuur
    log(100, 172, 40); log(180, 172, 40);
    fireBasket(160, 158, true, t);
    const P_ = (x, y, o) => [x, y, o];
    const back = [
      P_(30, 140, { elder: true, hairStyle: 'bald', hair: PAL.g9, coat: '#6a6058', vest: '#5a5048', glasses: true, acc: PAL.warm, dir: 1 }),        // opa Jef
      P_(52, 140, { hairStyle: 'short', hair: PAL.g2, coat: PAL.g8, apron: PAL.white, skin: '#b89a80', acc: PAL.warm, dir: -1 }),                   // Youssef
      P_(76, 142, { hairStyle: 'hijab', capC: '#a0645a', coat: PAL.g7, longCoat: true, acc: PAL.orange, dir: 1, arm: 'hold', hold: (x, y) => R(x - 1, y, 4, 6, PAL.g8) }), // Fatma
      P_(104, 138, { hairStyle: 'short', hair: PAL.g2, coat: PAL.g8, vest: PAL.yellow, skin: '#a8846a', dir: 1 }),                                  // Karim
      P_(214, 138, { hairStyle: 'bun', hair: PAL.g6, coat: '#5a6a5a', glasses: true, acc: PAL.yellow, dir: -1 }),                                   // Els
      P_(236, 140, { hairStyle: 'curly', hair: PAL.g1, skin: '#b89a80', coat: PAL.g7, acc: PAL.orange, dir: -1, arm: 'hold', hold: (x, y) => { R(x - 1, y - 6, 2, 6, '#6fa05f'); R(x - 2, y, 5, 4, '#a0603a'); } }), // Yasmina
      P_(260, 142, { hairStyle: 'short', hair: PAL.g6, coat: '#3a4a5a', vest: PAL.orange, dir: -1 }),                                               // Pieter
      P_(284, 140, { hairStyle: 'long', hair: PAL.g2, coat: PAL.g7, acc: PAL.yellow, skin: '#c8aa90', dir: -1 }),                                   // Rania
      P_(128, 146, { hairStyle: 'bun', hair: PAL.g3, coat: '#5a5a62', acc: PAL.orange, dir: 1 }),                                                   // mama
      P_(192, 146, { hairStyle: 'beanie', capC: PAL.g4, coat: '#4a4a4e', beard: PAL.g5, acc: PAL.orange, dir: -1 })                                 // Marcel
    ];
    const front = [
      P_(106, 172, { kid: true, hairStyle: 'spiky', hair: PAL.g2, coat: '#5a6a7a', acc: PAL.orange, dir: 1, sit: true }),      // Daan
      P_(120, 172, { kid: true, hairStyle: 'short', hair: PAL.g4, coat: '#7a6a5a', acc: PAL.yellow, dir: 1, sit: true }),      // Milan
      P_(134, 172, { kid: true, hairStyle: 'pony', hair: PAL.g4, coat: PAL.g7, acc: PAL.warm, dir: 1, sit: true }),            // Lien
      P_(186, 172, { kid: true, hairStyle: 'long', hair: PAL.g2, coat: PAL.g8, stripes: '#b05048', dir: -1, sit: true }),      // Noor
      P_(200, 172, { kid: true, hairStyle: 'spiky', hair: PAL.g5, coat: '#6a7a6a', acc: PAL.yellow, dir: -1, sit: true }),     // Sam
      P_(214, 172, { kid: true, hairStyle: 'curly', hair: PAL.g1, coat: '#5a6a5a', skin: '#a8846a', acc: PAL.orange, dir: -1, sit: true }) // Omar
    ];
    const seated2 = [
      P_(70, 176, { hairStyle: 'hijab', capC: '#6a3a3a', coat: PAL.g5, skin: '#b89a80', acc: PAL.red, dir: 1, sit: true, arm: 'hug' }),   // Nadia
      P_(250, 176, { elder: true, hairStyle: 'beanie', capC: PAL.g4, coat: '#4a4038', beard: PAL.g8, skin: '#b89a80', acc: PAL.warm, dir: -1, sit: true }) // Yusuf
    ];
    back.concat(seated2).concat(front).sort((a, b) => a[1] - b[1]).forEach(p => drawPerson(p[0], p[1], Object.assign({ pants: PAL.g4, expr: 'happy' }, p[2])));
    // voetballers vooraan
    const bx = 40 + Math.abs(((t * 30) % 120) - 60);
    drawPerson(24, 200, { kid: true, hairStyle: 'curly', hair: PAL.g1, skin: '#a8846a', coat: PAL.g6, acc: PAL.orange, dir: 1, expr: 'laugh', moving: true, walk: Math.floor(t * 5) % 2 }); // Amir
    drawPerson(116, 200, { kid: true, hairStyle: 'pony', hair: PAL.g6, coat: PAL.g8, acc: PAL.yellow, dir: -1, expr: 'laugh', moving: true, walk: Math.floor(t * 5 + 1) % 2 }); // Lotte
    R(bx - 2, 196, 5, 5, PAL.white);
    // het kind met het katje onder de jas
    drawPerson(276, 196, { kid: true, hairStyle: 'short', hair: PAL.g3, coat: '#5a5a62', acc: PAL.red, dir: -1, arm: 'hug', expr: 'happy' });
    // katje bij het vuur (of bij jou)
    if (this.cat) drawCat(this.cat.x, this.cat.y, t, { pose: this.cat.state === 'sit' ? 'sit' : 'walk', dir: 1, eyesTo: { x: 200 } });
    else drawCat(160, 186, t, { pose: 'curled', sleep: true });
    glow(160, 150, 150, '255,170,80', 0.18);
    drawSpirit(186, 192, G.t, { moving: false, dir: -1 });
    ctx.restore();
  },
  drawCard() {
    const c = this.card;
    const a = Math.min(1, this.cardT * 1.5);
    ctx.globalAlpha = a * 0.88; R(0, 0, W, H, PAL.black); ctx.globalAlpha = a;
    const h = 46 + c.lines.length * 11;
    const y = Math.max(8, (H - h) / 2);
    box(20, y, 280, h, c.color, PAL.black, 1);
    txt(c.title, W / 2, y + 10, c.color, 'center', 12);
    c.lines.forEach((l, i) => txt(l, W / 2, y + 32 + i * 11, PAL.white, 'center', 7));
    if (this.cardT > 1.2 && Math.floor(G.t * 2) % 2 === 0) txt('[Z]', W / 2, y + h - 11, PAL.g7, 'center', 7);
    ctx.globalAlpha = 1;
  }
};
