// Builds assets/data/nba-3x3.json for the NBA GRID 3x3 game from cached Basketball-Reference pages.
// Usage: node build.js <cacheDir>
// NBA/BAA seasons only (no ABA). Team history follows the franchise (e.g. SuperSonics count as Thunder).
const fs = require('fs'), path = require('path');
const CACHE = process.argv[2];
const ROOT = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(CACHE, p.replace(/\//g, '__')), 'utf8').replace(/<!--|-->/g, '');
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').trim();
const table = (html, id) => { const i = html.indexOf(`id="${id}"`); if (i < 0) throw new Error('missing table ' + id); return html.slice(i, html.indexOf('</table>', i)); };
const rows = t => t.split(/<tr[ >]/).slice(1);
const cell = (r, stat) => { const m = r.match(new RegExp(`data-stat="${stat}"[^>]*>([\\s\\S]*?)</t[dh]>`)); return m ? m[1] : null; };
const ids = s => [...s.matchAll(/\/players\/[a-z]\/([a-z0-9.'-]+)\.html/g)].map(m => m[1]);

// ---------- franchises ----------
const FR = {
  ATL: ['Hawks', 'incl. St. Louis'], BOS: ['Celtics'], BRK: ['Nets', 'incl. New Jersey'], CHO: ['Hornets', 'incl. Bobcats'], CHI: ['Bulls'],
  CLE: ['Cavaliers'], DAL: ['Mavericks'], DEN: ['Nuggets'], DET: ['Pistons'], GSW: ['Warriors'], HOU: ['Rockets'], IND: ['Pacers'],
  LAC: ['Clippers'], LAL: ['Lakers'], MEM: ['Grizzlies', 'incl. Vancouver'], MIA: ['Heat'], MIL: ['Bucks'], MIN: ['Timberwolves'],
  NOP: ['Pelicans', 'incl. N.O. Hornets'], NYK: ['Knicks'], OKC: ['Thunder', 'incl. SuperSonics'], ORL: ['Magic'], PHI: ['76ers'],
  PHO: ['Suns'], POR: ['Trail Blazers'], SAC: ['Kings'], SAS: ['Spurs'], TOR: ['Raptors'], UTA: ['Jazz'], WAS: ['Wizards', 'incl. Bullets'],
};
const ABBR = {
  ATL: 'ATL', STL: 'ATL', MLH: 'ATL', TRI: 'ATL', BOS: 'BOS', NJN: 'BRK', NYN: 'BRK', BRK: 'BRK', CHH: 'CHO', CHA: 'CHO', CHO: 'CHO',
  CHI: 'CHI', CLE: 'CLE', DAL: 'DAL', DEN: 'DEN', DET: 'DET', FTW: 'DET', GSW: 'GSW', SFW: 'GSW', PHW: 'GSW', HOU: 'HOU', SDR: 'HOU',
  IND: 'IND', LAC: 'LAC', SDC: 'LAC', BUF: 'LAC', LAL: 'LAL', MNL: 'LAL', MEM: 'MEM', VAN: 'MEM', MIA: 'MIA', MIL: 'MIL', MIN: 'MIN',
  NOH: 'NOP', NOK: 'NOP', NOP: 'NOP', NYK: 'NYK', OKC: 'OKC', SEA: 'OKC', ORL: 'ORL', PHI: 'PHI', SYR: 'PHI', PHO: 'PHO', POR: 'POR',
  SAC: 'SAC', KCK: 'SAC', KCO: 'SAC', CIN: 'SAC', ROC: 'SAC', SAS: 'SAS', TOR: 'TOR', UTA: 'UTA', NOJ: 'UTA',
  WAS: 'WAS', WSB: 'WAS', CAP: 'WAS', BAL: 'WAS', CHZ: 'WAS', CHP: 'WAS',
};
// Defunct franchises with no current team (still count for decades, teammates, stats).
const DEFUNCT = new Set(['AND', 'BLB', 'CHS', 'CLR', 'DNN', 'INJ', 'INO', 'PIT', 'PRO', 'SHE', 'STB', 'TCB', 'WAT', 'WSC', 'DTF', 'BAA', 'TRH']);

// ---------- seasons (per-game pages) ----------
const P = new Map(); // id -> {name, seasons:Set, games, teams:Set(franchise), stat:{}}
const teamSeason = new Map(); // `${abbr}-${year}` -> Set(ids)
const unknown = new Set();
const years = [1947, 1948, 1949, ...Array.from({ length: 2027 - 1950 + 1 }, (_, i) => 1950 + i)];
for (const y of years) {
  const html = read(`leagues/${y < 1950 ? 'BAA' : 'NBA'}_${y}_per_game.html`);
  const seasonBest = new Map(); // id -> row with max games (TOT row when traded)
  for (const r of rows(table(html, 'per_game_stats'))) {
    const idm = r.match(/data-append-csv="([^"]+)"/); if (!idm) continue;
    const id = idm[1], abbr = decode(cell(r, 'team_name_abbr') || ''), g = +decode(cell(r, 'games') || '0');
    const num = s => { const m = r.match(new RegExp(`data-stat="${s}"(?: csk="([^"]*)")?[^>]*>([\\s\\S]*?)</td>`)); return m ? parseFloat(m[1] ?? decode(m[2])) || 0 : 0; };
    if (!P.has(id)) P.set(id, { name: decode(cell(r, 'name_display')).replace(/\*$/, ''), seasons: new Set(), games: 0, teams: new Set(), stat: {} });
    const p = P.get(id);
    p.seasons.add(y);
    if (!/^(TOT|\dTM)$/.test(abbr)) {
      const k = `${abbr}-${y}`; if (!teamSeason.has(k)) teamSeason.set(k, new Set()); teamSeason.get(k).add(id);
      if (ABBR[abbr]) p.teams.add(ABBR[abbr]); else if (!DEFUNCT.has(abbr)) unknown.add(abbr + ' ' + y);
    }
    const best = seasonBest.get(id);
    if (!best || g > best.g) seasonBest.set(id, { g, pts: num('pts_per_g'), trb: num('trb_per_g'), ast: num('ast_per_g'), blk: num('blk_per_g'), stl: num('stl_per_g') });
  }
  for (const [id, s] of seasonBest) {
    const p = P.get(id); p.games += s.g;
    if (s.g >= 40) {
      if (s.pts >= 25) p.stat.ppg25 = 1;
      if (s.trb >= 10) p.stat.rpg10 = 1;
      if (s.ast >= 8) p.stat.apg8 = 1;
      if (s.blk >= 2) p.stat.bpg2 = 1;
      if (s.stl >= 2) p.stat.spg2 = 1;
    }
  }
}
if (unknown.size) throw new Error('unmapped team abbreviations: ' + [...unknown].slice(0, 20).join(', '));

// ---------- categories ----------
const C = {}; // key -> {label, note, t, set:Set(ids)}
const add = (key, label, t, set, note) => { C[key] = { label, t, set: new Set([...set].filter(id => P.has(id))), ...(note ? { note } : {}) }; };
for (const [f, [label, note]] of Object.entries(FR)) add('t_' + f, label, 'team', [...P].filter(([, p]) => p.teams.has(f)).map(([id]) => id), note);

const awardIds = (page, tid) => ids(table(read(page), tid));
add('a_mvp', 'MVP', 'award', awardIds('awards/mvp.html', 'mvp_NBA'));
add('a_roy', 'Rookie of the Year', 'award', awardIds('awards/roy.html', 'roy_NBA'));
add('a_dpoy', 'Defensive Player of the Year', 'award', awardIds('awards/dpoy.html', 'dpoy_NBA'));
add('a_smoy', 'Sixth Man of the Year', 'award', awardIds('awards/smoy.html', 'smoy_NBA'));
add('a_mip', 'Most Improved Player', 'award', awardIds('awards/mip.html', 'mip_NBA'));
add('a_fmvp', 'Finals MVP', 'award', awardIds('awards/finals_mvp.html', 'finals_mvp_NBA'));
{
  const asg = new Set();
  for (const r of rows(table(read('awards/all_star_by_player.html'), 'all_star_by_player'))) {
    const id = ids(r)[0]; const nums = [...r.matchAll(/class="center">(\d+)</g)].map(m => +m[1]);
    if (id && nums[1] > 0) asg.add(id);
  }
  add('a_asg', 'All-Star', 'award', asg);
  const hof = new Set();
  for (const r of rows(table(read('awards/hof.html'), 'hof'))) if (/data-stat="category"[^>]*>Player/.test(r)) ids(r).forEach(i => hof.add(i));
  add('a_hof', 'Hall of Famer', 'award', hof, 'inducted as player');
  for (const [key, label, page, tid] of [['a_allnba', 'All-NBA Team', 'awards/all_league.html', 'awards_all_league'], ['a_alldef', 'All-Defensive Team', 'awards/all_defense.html', 'awards_all_defense']]) {
    const s = new Set();
    for (const r of rows(table(read(page), tid))) if (/data-stat="lg_id"[^>]*>(<a[^>]*>)?NBA/.test(r)) ids(r).forEach(i => s.add(i));
    add(key, label, 'award', s);
  }
  const champ = new Set();
  for (const r of rows(table(read('playoffs/'), 'champions_index'))) {
    if (!/data-stat="lg_id"[^>]*>(<a[^>]*>)?(NBA|BAA)/.test(r)) continue;
    const m = (cell(r, 'champion') || '').match(/\/teams\/([A-Z]+)\/(\d{4})\.html/); if (!m) continue;
    const ts = teamSeason.get(`${m[1]}-${m[2]}`); if (!ts) throw new Error('no roster for champion ' + m[1] + m[2]);
    ts.forEach(i => champ.add(i));
  }
  add('a_champ', 'NBA Champion', 'award', champ);
}
const statCat = (key, label, note) => add('s_' + key, label, 'stat', [...P].filter(([, p]) => p.stat[key]).map(([id]) => id), note);
statCat('ppg25', '25+ PPG Season', 'min. 40 games');
statCat('rpg10', '10+ RPG Season', 'min. 40 games');
statCat('apg8', '8+ APG Season', 'min. 40 games');
statCat('bpg2', '2+ BPG Season', 'min. 40 games');
statCat('spg2', '2+ SPG Season', 'min. 40 games');
add('s_15yr', '15+ NBA Seasons', 'stat', [...P].filter(([, p]) => p.seasons.size >= 15).map(([id]) => id));
add('s_1000g', '1,000+ Career Games', 'stat', [...P].filter(([, p]) => p.games >= 1000).map(([id]) => id));
for (let d = 1950; d <= 2020; d += 10) {
  // a season ending in year Y spans Y-1 and Y, so it counts for both decades at a boundary
  add('d_' + d, `Played in the ${d}s`, 'stat', [...P].filter(([, p]) => [...p.seasons].some(y => (y >= d && y < d + 10) || (y - 1 >= d && y - 1 < d + 10))).map(([id]) => id));
}
const STARS = { jamesle01: 'LeBron James', bryanko01: 'Kobe Bryant', duncati01: 'Tim Duncan', jordami01: 'Michael Jordan', onealsh01: "Shaquille O'Neal",
  curryst01: 'Stephen Curry', duranke01: 'Kevin Durant', nowitdi01: 'Dirk Nowitzki', garneke01: 'Kevin Garnett', wadedw01: 'Dwyane Wade',
  hardeja01: 'James Harden', paulch01: 'Chris Paul', antetgi01: 'Giannis Antetokounmpo', jokicni01: 'Nikola Jokić', leonaka01: 'Kawhi Leonard',
  westbru01: 'Russell Westbrook', iversal01: 'Allen Iverson', nashst01: 'Steve Nash', pippesc01: 'Scottie Pippen', olajuha01: 'Hakeem Olajuwon',
  malonka01: 'Karl Malone', stockjo01: 'John Stockton', birdla01: 'Larry Bird', johnsma02: 'Magic Johnson', cartevi01: 'Vince Carter',
  anthoca01: 'Carmelo Anthony', doncilu01: 'Luka Dončić', embiijo01: 'Joel Embiid', tatumja01: 'Jayson Tatum', irvinky01: 'Kyrie Irving',
  georgpa01: 'Paul George', butleji01: 'Jimmy Butler', lillada01: 'Damian Lillard', howardw01: 'Dwight Howard', piercpa01: 'Paul Pierce' };
for (const [sid, name] of Object.entries(STARS)) {
  if (!P.has(sid)) throw new Error('missing star ' + sid);
  const mates = new Set();
  for (const [, s] of teamSeason) if (s.has(sid)) s.forEach(i => i !== sid && mates.add(i));
  add('m_' + sid, `Teammate of ${name}`, 'stat', mates, 'same team, same season');
}

// ---------- players array ----------
const order = [...P.keys()].sort((a, b) => P.get(b).games - P.get(a).games);
const idx = new Map(order.map((id, i) => [id, i]));
const players = order.map(id => { const p = P.get(id), s = [...p.seasons].sort((a, b) => a - b); return [p.name, s[0] - 1, s[s.length - 1], p.games]; });
// display seasons as start-year–end-year of the season span (e.g. 2003–2027 for 2003-04 through 2026-27)
const cats = {};
for (const [k, c] of Object.entries(C)) cats[k] = { label: c.label, t: c.t, ...(c.note ? { note: c.note } : {}), ids: [...c.set].map(id => idx.get(id)).sort((a, b) => a - b) };

// ---------- daily puzzles ----------
let seed = 20261112;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const teams = Object.keys(cats).filter(k => k.startsWith('t_'));
const others = Object.keys(cats).filter(k => !k.startsWith('t_'));
const inter = (a, b) => { const s = new Set(cats[a].ids); return cats[b].ids.filter(i => s.has(i)).length; };
const famOf = k => k.slice(0, 2);
const puzzles = {};
const start = new Date('2026-11-11T12:00:00'), end = new Date('2027-12-31T12:00:00');
const recentTeams = [], usedSets = new Set();
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const key = d.toISOString().slice(0, 10);
  let grid = null;
  for (let tries = 0; tries < 20000 && !grid; tries++) {
    const pattern = pick(['A', 'B', 'C', 'C']);
    const nOtherRows = pattern === 'A' ? 0 : 1, nOtherCols = pattern === 'B' ? 0 : 1;
    const fresh = teams.filter(t => !recentTeams.slice(-8).includes(t));
    const tPool = [...fresh].sort(() => rnd() - 0.5);
    const rowsK = [...tPool.slice(0, 3 - nOtherRows)], colsK = [...tPool.slice(3, 6 - nOtherCols)];
    const o1 = pick(others), o2 = pick(others);
    if (nOtherRows) rowsK.push(o1);
    if (nOtherCols) colsK.push(o2);
    if (nOtherRows && nOtherCols && (o1 === o2 || famOf(o1) === famOf(o2))) continue;
    let ok = true;
    for (const r of rowsK) for (const c of colsK) { const n = inter(r, c); const min = r.startsWith('t_') && c.startsWith('t_') ? 4 : 3; if (n < min || (n > 120 && rnd() < 0.7)) ok = false; }
    if (!ok) continue;
    const sig = [...rowsK, ...colsK].sort().join(',');
    if (usedSets.has(sig)) continue;
    const sh = a => a.sort(() => rnd() - 0.5);
    grid = [...sh(rowsK), ...sh(colsK)];
    usedSets.add(sig);
  }
  if (!grid) throw new Error('could not build grid for ' + key);
  grid.filter(k => k.startsWith('t_')).forEach(t => recentTeams.push(t));
  puzzles[key] = grid;
}

const out = { v: 1, built: new Date().toISOString().slice(0, 10), p: players, c: cats, z: puzzles };
fs.mkdirSync(path.join(ROOT, 'assets/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets/data/nba-3x3.json'), JSON.stringify(out));
const size = fs.statSync(path.join(ROOT, 'assets/data/nba-3x3.json')).size;
console.log({ players: players.length, categories: Object.keys(cats).length, puzzles: Object.keys(puzzles).length, kb: Math.round(size / 1024) });
for (const k of ['a_mvp', 'a_fmvp', 'a_champ', 'a_asg', 'a_hof', 'a_allnba', 's_ppg25', 's_15yr', 'd_1950', 'd_2020', 'm_jamesle01', 't_OKC', 't_CHO', 't_NOP']) console.log(k, cats[k].ids.length);
