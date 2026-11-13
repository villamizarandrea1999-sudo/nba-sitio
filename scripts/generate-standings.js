#!/usr/bin/env node
/*
 * Rebuilds the standings tables on /nba-standings/ from the games that
 * generate-schedule-grid.js saved to scripts/.games-cache.json (balldontlie data).
 * Runs nightly right after the schedule grid in .github/workflows/update-schedule-grid.yml.
 * Only the HTML between STANDINGS_START / STANDINGS_END, the "as of" date and
 * dateModified change; the rest of the page is untouched.
 *
 * Counted: regular-season games with a final score. NBA Cup group, quarterfinal and
 * semifinal games count in the standings; the Cup championship (CUP_FINAL_DATE) does not.
 * Ties are ordered by win %, then wins; official NBA tiebreakers are NOT applied (the page says so).
 */
const fs = require('fs');
const path = require('path');

const CACHE = path.join(__dirname, '.games-cache.json');
const TARGET = path.join(__dirname, '..', 'nba-standings', 'index.html');
const CUP_FINAL_DATE = '2026-12-11';

const { teams, games } = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
const byAbbr = {};
for (const t of teams) if (!byAbbr[t.abbreviation]) byAbbr[t.abbreviation] = { abbr: t.abbreviation, name: t.full_name, conf: t.conference, results: [] };
const idToAbbr = Object.fromEntries(teams.map(t => [t.id, t.abbreviation]));

const isFinal = g => /final/i.test(g.status || '') && g.home_team_score != null && g.visitor_team_score != null && (g.home_team_score + g.visitor_team_score) > 0;
const finals = games.filter(g => !g.postseason && isFinal(g));
const cupFinal = finals.filter(g => (g.date || '').slice(0, 10) === CUP_FINAL_DATE);
if (cupFinal.length > 1) throw new Error(`expected at most 1 game on the Cup final date, found ${cupFinal.length}`);
const counted = finals.filter(g => (g.date || '').slice(0, 10) !== CUP_FINAL_DATE)
  .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id - b.id);

for (const g of counted) {
  const h = idToAbbr[g.home_team.id], v = idToAbbr[g.visitor_team.id];
  if (!byAbbr[h] || !byAbbr[v]) continue;
  const homeWon = g.home_team_score > g.visitor_team_score;
  byAbbr[h].results.push({ w: homeWon, home: true });
  byAbbr[v].results.push({ w: !homeWon, home: false });
}

const rows = Object.values(byAbbr).map(t => {
  const r = t.results, W = r.filter(x => x.w).length, L = r.length - W;
  const hw = r.filter(x => x.home && x.w).length, hl = r.filter(x => x.home && !x.w).length;
  const last10 = r.slice(-10), l10w = last10.filter(x => x.w).length;
  let streak = '—';
  if (r.length) { const last = r[r.length - 1].w; let n = 0; for (let i = r.length - 1; i >= 0 && r[i].w === last; i--) n++; streak = (last ? 'W' : 'L') + n; }
  return { ...t, W, L, pct: W + L ? W / (W + L) : 0, home: `${hw}-${hl}`, road: `${W - hw}-${L - hl}`, l10: `${l10w}-${last10.length - l10w}`, streak };
});

const fmtPct = p => p.toFixed(3).replace(/^0/, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function confTable(conf, label) {
  const list = rows.filter(r => r.conf === conf).sort((a, b) => b.pct - a.pct || b.W - a.W || a.name.localeCompare(b.name));
  if (list.length !== 15) throw new Error(`${conf}: expected 15 teams, got ${list.length}`);
  const lead = list[0];
  const body = list.map((t, i) => {
    const gb = ((lead.W - t.W) + (t.L - lead.L)) / 2;
    const zone = i < 6 ? 'st-playoff' : i < 10 ? 'st-playin' : 'st-out';
    const line = i === 5 || i === 9 ? ' st-cut' : '';
    return `<tr class="${zone}${line}"><td class="st-rank">${i + 1}</td><th scope="row">${esc(t.name)}</th><td>${t.W}</td><td>${t.L}</td><td>${fmtPct(t.pct)}</td><td>${gb === 0 ? '—' : gb.toFixed(1).replace('.0', '')}</td><td>${t.home}</td><td>${t.road}</td><td>${t.l10}</td><td>${t.streak}</td></tr>`;
  }).join('\n');
  return `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${label} Standings</h2>
<div class="overflow-x-auto mt-md">
<table class="st-table">
<caption class="sr-only">${label} standings, 2026-27 NBA season</caption>
<thead><tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Pct</th><th>GB</th><th>Home</th><th>Road</th><th>L10</th><th>Strk</th></tr></thead>
<tbody>
${body}
</tbody>
</table>
</div>`;
}

const html = [confTable('East', 'Eastern Conference'), confTable('West', 'Western Conference')].join('\n\n');
const lastGame = counted.length ? counted[counted.length - 1].date.slice(0, 10) : null;
const asOf = lastGame || new Date().toISOString().slice(0, 10);
const asOfH = new Date(asOf + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

let page = fs.readFileSync(TARGET, 'utf8');
const before = page;
page = page.replace(/(<!-- STANDINGS_START -->)[\s\S]*?(<!-- STANDINGS_END -->)/, `$1\n${html}\n$2`);
page = page.replace(/(<span class="st-asof">)[^<]*(<\/span>)/g, `$1${asOfH}$2`);
if (page !== before) {
  page = page.replace(/"dateModified": "[^"]*"/, `"dateModified": "${asOf}"`)
    .replace(/(<span class="byline-updated">Updated <time datetime=")[^"]*(">)[^<]*(<\/time>)/, `$1${asOf}$2${asOfH}$3`);
}
fs.writeFileSync(TARGET, page);
console.log(`Standings through ${asOf}: ${counted.length} games counted${cupFinal.length ? ' (Cup final excluded)' : ''}.`);
