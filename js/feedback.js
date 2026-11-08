'use strict';
/* =========================================================
   feedback.js — druk F: spel pauzeert, typ feedback.
   Elke notitie krijgt automatisch metadata (wat er op dat moment gebeurde).
   Alles kan als één prompt gekopieerd worden.
   ========================================================= */

const Feedback = {
  open: false, snap: null, notes: [], KEY: 'eenwarmethuis_feedback',
  load() { try { this.notes = JSON.parse(localStorage.getItem(this.KEY) || '[]') || []; } catch (e) { this.notes = []; } },
  store() { try { localStorage.setItem(this.KEY, JSON.stringify(this.notes)); } catch (e) { } },

  /* ---------- momentopname van de spelstatus ---------- */
  snapshot() {
    const r = n => Math.round(n);
    const s = { tijd: new Date().toLocaleString('nl-BE'), status: G.state };
    try {
      s.warmteScore = warmteScore() + '/9';
      s.scorePerHoofdstuk = G.scores.join('');
      s.herinneringen = memCount() + '/9';
      if (G.state === 'TRANSITION' && G.trans) s.overgangNaar = 'H' + (G.trans.i + 1) + ' ' + LEVELS[G.trans.i].title;
      if (G.state === 'END') s.einde = Ending.kind + (Ending.card ? ' (kaart: ' + Ending.card.title + ')' : '');
      const L = G.L;
      if (L) {
        s.hoofdstuk = 'H' + (L.i + 1) + ' — ' + L.def.title + ' (bestand js/l' + (L.i + 1) + '.js)';
        s.fase = L.solved ? 'opgelost (warme afloop)' : L.coldEnd ? 'koude afloop' : G.state === 'ACTION' ? 'actie/minigame' : understood(L) ? 'verkennen — situatie begrepen' : 'verkennen';
        s.levelTijd = L.t.toFixed(1) + 's';
        s.begrip = L.clues.size + '/' + L.need + ' [' + Array.from(L.clues).join(', ') + ']';
        s.speler = 'x=' + r(P.x) + ' y=' + r(P.y) + ' kijkt ' + (P.dir > 0 ? 'rechts' : 'links') + (P.sit ? ' (zit/rust)' : '') + (P.moving ? ' (loopt)' : '');
        const nb = nearest(L);
        s.dichtstbijzijndObject = nb ? nb.id + ' (x=' + r(nb.x) + ' y=' + r(nb.y) + ')' : 'geen';
        s.personages = (L.npcs || []).map(ob => {
          const n = ob.npc;
          return ob.id + ': x=' + r(n.x) + ' y=' + r(n.y) + ' ' + (n.dir > 0 ? '→' : '←') +
            (n.hidden ? ' VERBORGEN' : '') + (n.sit ? (n.floor ? ' zit-op-grond' : ' zit') : '') + (n.back ? ' rug-naar-ons' : '') +
            (n.moving ? ' loopt' : '') + (n.path.length ? ' doel=(' + r(n.path[n.path.length - 1].x) + ',' + r(n.path[n.path.length - 1].y) + ')' : '') +
            ' expr=' + (n.expr || n.look.expr || '-') + (n.arm ? ' arm=' + n.arm : '');
        });
        if (L.doors) s.deuren = L.doors.map(d => 'deur x=' + d.x + ' open=' + d.open.toFixed(2));
        const fl = Object.keys(L.flags).filter(k => L.flags[k] !== undefined && L.flags[k] !== false);
        if (fl.length) s.flags = fl.map(k => k + '=' + JSON.stringify(L.flags[k])).join(', ');
        if (G.mg) {
          const m = G.mg, info = {};
          ['phase', 't', 'pos', 'pow', 'caught', 'hit', 'result'].forEach(k => { if (m[k] !== undefined && m[k] !== null) info[k] = typeof m[k] === 'number' ? +m[k].toFixed(2) : m[k]; });
          s.minigame = (m.lamp ? 'ritme-lamp' : m.draft ? 'tocht' : m.items ? 'hartje/vertrouwen' : m.ang !== undefined ? 'bal-richten' : m.speed !== undefined ? 'moed-balk' : m.checked !== undefined ? 'blikje' : 'onbekend') + ' ' + JSON.stringify(info);
        }
      }
      if (Dialog.active) {
        if (Dialog.waiting) s.dialoog = '(tussenscène wacht op beweging, ' + Dialog.waitT.toFixed(1) + 's)';
        else if (Dialog.cur) s.dialoog = (Dialog.cur.n ? Dialog.cur.n + ': ' : '') + '"' + Dialog.cur.t + '"';
        s.dialoogNogTeGaan = Dialog.q.filter(e => typeof e === 'string' || Array.isArray(e)).length + ' regels';
        s.dialoogvak = Dialog.top ? 'boven' : 'onder';
      }
      if (Menu.active) s.menu = '"' + Menu.title + '" opties: ' + Menu.opts.map((o, i) => (i === Menu.idx ? '>' : '') + o).join(' | ');
      if (Closeup.id) s.closeup = Closeup.id + ' (t=' + Closeup.t.toFixed(1) + 's)';
      s.scherm = window.innerWidth + 'x' + window.innerHeight + (document.body.classList.contains('touch') ? ' (aanraak)' : '');
    } catch (e) { s.fout = String(e); }
    return s;
  },

  /* ---------- venster ---------- */
  build() {
    const d = document.createElement('div');
    d.id = 'fb';
    d.innerHTML = '<div class="fb-box">' +
      '<div class="fb-title">FEEDBACK <span id="fb-count"></span></div>' +
      '<div class="fb-ctx" id="fb-ctx"></div>' +
      '<textarea id="fb-text" placeholder="Wat moet er anders? Bv: de opa loopt door de tafel, de tekst gaat te snel, de kamer is te leeg..."></textarea>' +
      '<div class="fb-row">' +
      '<button id="fb-save">Opslaan [Ctrl+Enter]</button>' +
      '<button id="fb-cancel">Terug naar spel [Esc]</button>' +
      '</div><div class="fb-row">' +
      '<button id="fb-copy">Kopieer alles als prompt</button>' +
      '<button id="fb-show">Toon notities</button>' +
      '<button id="fb-clear">Wis alles</button>' +
      '</div>' +
      '<textarea id="fb-out" readonly></textarea>' +
      '<div class="fb-msg" id="fb-msg"></div></div>';
    document.body.appendChild(d);
    const $ = id => document.getElementById(id);
    $('fb-save').onclick = () => this.save();
    $('fb-cancel').onclick = () => this.close();
    $('fb-copy').onclick = () => this.copy();
    $('fb-show').onclick = () => { const o = $('fb-out'); o.value = this.prompt(); o.style.display = 'block'; };
    $('fb-clear').onclick = () => {
      if (!this.notes.length) return;
      if (confirm('Alle ' + this.notes.length + ' notities wissen?')) { this.notes = []; this.store(); this.refresh(); this.msg('Alles gewist.'); }
    };
    $('fb-text').addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); this.close(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); this.save(); }
    });
    d.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') this.close(); });
    this.el = d;
  },
  refresh() {
    document.getElementById('fb-count').textContent = this.notes.length ? '(' + this.notes.length + ' bewaard)' : '';
  },
  msg(m) { const e = document.getElementById('fb-msg'); e.textContent = m; clearTimeout(this._mt); this._mt = setTimeout(() => e.textContent = '', 3500); },
  show() {
    if (this.open) return;
    if (!this.el) this.build();
    this.snap = this.snapshot();
    this.open = true;
    Input.down = {}; Input.pressed = {};
    const c = this.snap;
    document.getElementById('fb-ctx').textContent = '⏸ Gepauzeerd · ' + (c.hoofdstuk || c.status) + (c.fase ? ' · ' + c.fase : '') + (c.dialoog ? ' · ' + c.dialoog.slice(0, 70) : '');
    document.getElementById('fb-out').style.display = 'none';
    this.refresh();
    this.el.style.display = 'flex';
    setTimeout(() => document.getElementById('fb-text').focus(), 30);
  },
  close() {
    this.open = false;
    if (this.el) this.el.style.display = 'none';
    Input.down = {}; Input.pressed = {};
    last = performance.now();
    cv.focus && cv.focus();
  },
  save() {
    const ta = document.getElementById('fb-text');
    const txtv = ta.value.trim();
    if (!txtv) { this.msg('Typ eerst iets.'); return; }
    this.notes.push({ text: txtv, meta: this.snap });
    this.store();
    ta.value = '';
    Toast.show('Feedback bewaard (' + this.notes.length + ')', 2);
    this.close();
  },
  prompt() {
    if (!this.notes.length) return '(nog geen feedback bewaard)';
    let p = 'Feedback op mijn game "Een Warme Thuis" (' + this.notes.length + ' notities, verzameld tijdens het spelen met de F-toets).\n' +
      'Pas het spel aan op basis van deze feedback. Bij elke notitie staat wat er op dat moment in het spel gebeurde ' +
      '(coördinaten in het logische 320x240-raster; het dialoogvak bedekt y=166-234).\n';
    this.notes.forEach((n, i) => {
      const m = n.meta || {};
      p += '\n### Notitie ' + (i + 1) + (m.hoofdstuk ? ' — ' + m.hoofdstuk : ' — ' + (m.status || '')) + '\n';
      p += '**Feedback:** ' + n.text + '\n**Context:**\n';
      Object.keys(m).forEach(k => {
        const v = m[k];
        if (Array.isArray(v)) { p += '- ' + k + ':\n'; v.forEach(x => p += '  - ' + x + '\n'); }
        else p += '- ' + k + ': ' + v + '\n';
      });
    });
    return p;
  },
  copy() {
    const text = this.prompt();
    const out = document.getElementById('fb-out');
    out.value = text; out.style.display = 'block';
    const done = () => this.msg('Gekopieerd! Plak het nu in je gesprek met Claude.');
    const fallback = () => { out.focus(); out.select(); try { document.execCommand('copy') ? done() : this.msg('Selecteer de tekst hieronder en kopieer met Ctrl+C.'); } catch (e) { this.msg('Selecteer de tekst hieronder en kopieer met Ctrl+C.'); } };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
};
Feedback.load();

window.addEventListener('keydown', e => {
  if (Feedback.open) return;
  if (e.code === 'KeyF' && !e.repeat && !e.ctrlKey && !e.metaKey) { e.preventDefault(); Feedback.show(); }
}, true);
