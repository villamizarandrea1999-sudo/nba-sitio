// NBA GRID 3x3 — a daily NBA trivia grid. Data: /assets/data/nba-3x3.json (built by scripts/nba-3x3/build.js).
(function () {
  const root = document.getElementById('g3-root');
  if (!root) return;
  const MAX_STRIKES = 3;
  const $ = (sel, el = document) => el.querySelector(sel);
  // panels live on <body> so ancestor transforms can't push the fixed overlay off-screen
  document.body.append(document.getElementById('g3-search'), document.getElementById('g3-answers'));
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  let D, puzzle, cats, answers, state, active = null, searchIdx = [], shakeIdx = null;

  fetch(root.dataset.src).then(r => r.json()).then(init).catch(() => { $('#g3-status').textContent = 'Could not load today\'s grid. Please refresh the page.'; });

  function init(data) {
    D = data;
    const keys = Object.keys(D.z).sort().filter(k => k <= todayKey);
    if (!keys.length) keys.push(Object.keys(D.z).sort()[0]);
    const sel = $('#g3-archive');
    sel.innerHTML = keys.slice().reverse().map((k, i) => `<option value="${k}">${i === 0 ? 'Today · ' : ''}#${keys.indexOf(k) + 1} · ${new Date(k + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</option>`).join('');
    sel.onchange = () => load(sel.value, keys);
    searchIdx = D.p.map((p, i) => ({ i, n: norm(p[0]) }));
    load(keys[keys.length - 1], keys);
  }

  function load(key, keys) {
    closeSearch();
    $('#g3-answers').classList.add('hidden');
    puzzle = D.z[key];
    const no = keys.indexOf(key) + 1;
    cats = puzzle.map(k => D.c[k]);
    const sets = cats.map(c => new Set(c.ids));
    answers = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      answers.push(cats[r].ids.filter(id => sets[3 + c].has(id)).sort((a, b) => D.p[b][3] - D.p[a][3]));
    }
    const all = JSON.parse(localStorage.getItem('g3-states') || '{}');
    state = all[key] || { key, no, cells: Array(9).fill(null), strikes: 0, done: false, gaveUp: false };
    state.isToday = key === keys[keys.length - 1];
    $('#g3-status').textContent = state.isToday ? 'Tap a square to name a player.' : 'Archive grid: this one does not count toward your streak.';
    $('#g3-no').textContent = `GRID #${String(no).padStart(3, '0')} · ${new Date(key + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    render();
    updateStreakView();
  }

  function save() { const all = JSON.parse(localStorage.getItem('g3-states') || '{}'); all[state.key] = state; localStorage.setItem('g3-states', JSON.stringify(all)); }
  const filled = () => state.cells.filter(Boolean).length;
  const deepCut = (cell, pid) => { const a = answers[cell]; const rank = a.indexOf(pid); return a.length > 1 ? Math.round(100 * rank / (a.length - 1)) : 100; };
  const score = () => { const s = state.cells.map((pid, i) => pid == null ? null : deepCut(i, pid)).filter(v => v != null); return s.length ? Math.round(s.reduce((x, y) => x + y, 0) / s.length) : 0; };

  function render() {
    const g = $('#g3-grid');
    g.innerHTML = '';
    g.appendChild(el('div', 'g3-corner', ''));
    for (let c = 0; c < 3; c++) g.appendChild(header(cats[3 + c]));
    for (let r = 0; r < 3; r++) {
      g.appendChild(header(cats[r]));
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c, pid = state.cells[i];
        const b = el('button', 'g3-cell' + (pid != null ? ' is-correct' : '') + (state.done && pid == null ? ' is-missed' : ''));
        b.type = 'button';
        b.setAttribute('aria-label', `${cats[r].label} and ${cats[3 + c].label}` + (pid != null ? `: ${D.p[pid][0]}` : ''));
        if (pid != null) b.innerHTML = `<span class="g3-cell-name">${esc(D.p[pid][0])}</span><span class="g3-cell-meta">Deep cut ${deepCut(i, pid)}%</span>`;
        else if (state.done) b.innerHTML = `<span class="g3-cell-meta">${answers[i].length} answers</span>`;
        else b.innerHTML = '<span class="g3-cell-plus">+</span>';
        if (state.done) b.addEventListener('click', () => showAnswers(i));
        else if (pid == null) b.addEventListener('click', () => openSearch(i));
        else b.disabled = true;
        g.appendChild(b);
      }
    }
    $('#g3-filled').textContent = `${filled()}/9`;
    $('#g3-strikes').textContent = `${MAX_STRIKES - state.strikes}`;
    $('#g3-score').textContent = filled() ? score() : '–';
    $('#g3-giveup').classList.toggle('hidden', state.done);
    $('#g3-share').classList.toggle('hidden', !state.done);
    if (state.done) $('#g3-status').textContent = state.gaveUp ? 'You gave up. Tap any square to see every possible answer.' : filled() === 9 ? (state.strikes === 0 ? 'Perfect grid: 9 for 9 with zero strikes!' : `Grid complete with ${state.strikes} strike${state.strikes > 1 ? 's' : ''}. Tap any square to see every answer.`) : 'Three strikes. Tap any square to see every possible answer.';
  }

  function header(cat) {
    const h = el('div', 'g3-head g3-head-' + cat.t);
    h.innerHTML = `<span class="g3-head-label">${esc(cat.label)}</span>${cat.note ? `<span class="g3-head-note">${esc(cat.note)}</span>` : ''}`;
    return h;
  }

  function openSearch(i) {
    active = i;
    const r = Math.floor(i / 3), c = i % 3;
    $('#g3-search-title').textContent = `${cats[r].label} × ${cats[3 + c].label}`;
    $('#g3-search').classList.remove('hidden');
    const inp = $('#g3-input');
    inp.value = '';
    $('#g3-results').innerHTML = '';
    inp.focus();
  }
  function closeSearch() { active = null; $('#g3-search').classList.add('hidden'); }

  function suggest(q) {
    const nq = norm(q), list = $('#g3-results');
    list.innerHTML = '';
    if (nq.length < 3) return;
    const words = nq.split(' ');
    const hits = searchIdx.filter(s => words.every(w => s.n.includes(w)))
      .sort((a, b) => (b.n.startsWith(nq) - a.n.startsWith(nq)) || D.p[b.i][3] - D.p[a.i][3]).slice(0, 8);
    for (const h of hits) {
      const p = D.p[h.i], used = state.cells.includes(h.i);
      const li = el('button', 'g3-result');
      li.type = 'button';
      li.disabled = used;
      li.innerHTML = `<span>${esc(p[0])}</span><span class="g3-result-years">${p[1]}–${p[2]}${used ? ' · used' : ''}</span>`;
      li.addEventListener('click', () => guess(h.i));
      list.appendChild(li);
    }
    if (!hits.length) list.appendChild(el('div', 'g3-result-empty', 'No NBA player found with that name.'));
  }

  function guess(pid) {
    if (active == null || state.done) return;
    const i = active;
    closeSearch();
    if (answers[i].includes(pid)) {
      state.cells[i] = pid;
      flash(`${D.p[pid][0]} fits. Deep cut ${deepCut(i, pid)}%.`);
    } else {
      state.strikes++;
      flash(`${D.p[pid][0]} doesn't fit that square. ${MAX_STRIKES - state.strikes} strike${MAX_STRIKES - state.strikes === 1 ? '' : 's'} left.`);
      shakeIdx = i;
    }
    if (filled() === 9 || state.strikes >= MAX_STRIKES) finish();
    save();
    render();
    if (shakeIdx != null) { root.querySelectorAll('.g3-cell')[shakeIdx].classList.add('g3-shake'); shakeIdx = null; }
  }

  function finish() {
    state.done = true;
    const s = JSON.parse(localStorage.getItem('g3-streak') || '{}');
    if (state.isToday && s.last !== state.key) {
      const y = new Date(state.key + 'T12:00:00'); y.setDate(y.getDate() - 1);
      const yKey = `${y.getFullYear()}-${pad(y.getMonth() + 1)}-${pad(y.getDate())}`;
      const won = filled() === 9;
      s.current = won ? (s.last === yKey && s.won ? (s.current || 0) + 1 : 1) : 0;
      s.best = Math.max(s.best || 0, s.current);
      s.last = state.key; s.won = won;
      localStorage.setItem('g3-streak', JSON.stringify(s));
    }
    updateStreakView();
  }
  function updateStreakView() { const s = JSON.parse(localStorage.getItem('g3-streak') || '{}'); $('#g3-streak').textContent = s.current || 0; }

  function showAnswers(i) {
    const r = Math.floor(i / 3), c = i % 3, a = answers[i];
    $('#g3-answers-title').textContent = `${cats[r].label} × ${cats[3 + c].label}: ${a.length} possible answers`;
    $('#g3-answers-list').innerHTML = a.slice(0, 40).map(pid => `<li>${esc(D.p[pid][0])} <span class="g3-result-years">${D.p[pid][1]}–${D.p[pid][2]}</span></li>`).join('') + (a.length > 40 ? `<li class="g3-result-years">…and ${a.length - 40} more</li>` : '');
    $('#g3-answers').classList.remove('hidden');
  }

  function share() {
    const rows = [0, 1, 2].map(r => [0, 1, 2].map(c => state.cells[r * 3 + c] != null ? '🟧' : '⬛').join('')).join('\n');
    const text = `NBA GRID 3x3 #${state.no}: ${filled()}/9 · Deep cut ${score()}\n${rows}\n${location.origin}${location.pathname}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => flash('Result copied. Paste it anywhere.'));
  }

  let flashT;
  function flash(msg) { const s = $('#g3-status'); s.textContent = msg; clearTimeout(flashT); }
  function el(tag, cls, html) { const e = document.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  $('#g3-input').addEventListener('input', e => suggest(e.target.value));
  $('#g3-input').addEventListener('keydown', e => { if (e.key === 'Enter') { const f = $('#g3-results .g3-result:not([disabled])'); if (f) f.click(); } if (e.key === 'Escape') closeSearch(); });
  $('#g3-close').addEventListener('click', closeSearch);
  $('#g3-answers-close').addEventListener('click', () => $('#g3-answers').classList.add('hidden'));
  $('#g3-giveup').addEventListener('click', () => { if (state.done) return; state.gaveUp = true; finish(); save(); render(); });
  $('#g3-share').addEventListener('click', share);
})();
