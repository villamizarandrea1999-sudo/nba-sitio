#!/usr/bin/env node
/*
 * Fills /nba-today/ (between NBA_TODAY_START / NBA_TODAY_END) with today's games, last night's
 * results and the conference leaders, from the games generate-schedule-grid.js saved to
 * scripts/.games-cache.json. Runs nightly (~3:37 a.m. ET) in update-schedule-grid.yml, so
 * "today" and "last night" are Eastern-time dates.
 */
const fs = require('fs');
const path = require('path');
const CACHE = path.join(__dirname, '.games-cache.json');
const TARGET = path.join(__dirname, '..', 'nba-today', 'index.html');
const { teams, games } = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
const team = {}; for (const t of teams) if (!team[t.id]) team[t.id] = t;
const etDate = d => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);
const now = new Date();
const today = etDate(now);
const yest = etDate(new Date(now.getTime() - 24 * 3600 * 1000));
const isFinal = g => /final/i.test(g.status || '') && (g.home_team_score + g.visitor_team_score) > 0;
const startOf = g => { const s = g.datetime || (/^\d{4}-\d{2}-\d{2}T/.test(g.status || '') ? g.status : null); return s ? new Date(s) : null; };
const fmtTime = d => d ? d.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) + ' ET' : 'TBD';
const long = s => new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const name = id => esc((team[id] || {}).full_name || '?');

const tonight = games.filter(g => (g.date || '').slice(0, 10) === today && !g.postseason)
  .sort((a, b) => (startOf(a) || 0) - (startOf(b) || 0));
const lastNight = games.filter(g => (g.date || '').slice(0, 10) === yest && isFinal(g));

const row = cells => `<tr class="border-b border-on-surface-variant/20">${cells.map((c, i) => `<td class="py-2${i < cells.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`;
const table = (head, rows) => `<div class="overflow-x-auto mt-md"><table class="w-full text-left border-collapse"><thead><tr class="border-b-2 border-on-surface">${head.map(h => `<th class="py-2 pr-4 font-label-caps text-xs">${h}</th>`).join('')}</tr></thead><tbody class="text-on-surface-variant">${rows.join('')}</tbody></table></div>`;

let html = `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">Tonight's NBA Games: ${long(today)}</h2>\n`;
html += tonight.length
  ? `<p>${tonight.length} game${tonight.length === 1 ? '' : 's'} on the schedule tonight.</p>\n` + table(['Tip-off', 'Away', '', 'Home'], tonight.map(g => row([fmtTime(startOf(g)), name(g.visitor_team.id), '@', `<strong>${name(g.home_team.id)}</strong>`])))
  : `<p>No NBA games are scheduled today.</p>`;
html += `\n<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">Last Night's NBA Scores: ${long(yest)}</h2>\n`;
html += lastNight.length
  ? table(['Away', '', 'Home', ''], lastNight.map(g => {
      const hw = g.home_team_score > g.visitor_team_score;
      const a = `${name(g.visitor_team.id)} ${g.visitor_team_score}`, h = `${name(g.home_team.id)} ${g.home_team_score}`;
      return row([hw ? a : `<strong>${a}</strong>`, '@', hw ? `<strong>${h}</strong>` : h, g.period > 4 ? 'OT' : 'Final']);
    }))
  : `<p>No NBA games were played last night.</p>`;

// conference leaders (same counting rules as /nba-standings/)
const rec = {};
for (const g of games) {
  if (g.postseason || !isFinal(g) || (g.date || '').slice(0, 10) === '2026-12-11') continue;
  const hw = g.home_team_score > g.visitor_team_score;
  for (const [id, w] of [[g.home_team.id, hw], [g.visitor_team.id, !hw]]) { const ab = (team[id] || {}).abbreviation; if (!ab) continue; rec[ab] = rec[ab] || { w: 0, l: 0, t: team[id] }; w ? rec[ab].w++ : rec[ab].l++; }
}
const leaders = conf => Object.values(rec).filter(r => r.t.conference === conf).sort((a, b) => b.w / (b.w + b.l) - a.w / (a.w + a.l) || b.w - a.w).slice(0, 3);
html += `\n<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">Conference Leaders</h2>\n`;
html += table(['', 'East', 'West'], [0, 1, 2].map(i => { const e = leaders('East')[i], w = leaders('West')[i]; return row([`<strong>${i + 1}</strong>`, e ? `${esc(e.t.full_name)} (${e.w}-${e.l})` : '', w ? `${esc(w.t.full_name)} (${w.w}-${w.l})` : '']); }));
html += `\n<p>Full table: <a href="/nba-standings/" class="text-primary underline">2026-27 NBA standings</a>.</p>`;

let page = fs.readFileSync(TARGET, 'utf8');
const before = page;
page = page.replace(/(<!-- NBA_TODAY_START -->)[\s\S]*?(<!-- NBA_TODAY_END -->)/, `$1\n${html}\n$2`);
page = page.replace(/(<span class="nt-date">)[^<]*(<\/span>)/, `$1${long(today)}$2`);
if (page !== before) page = page.replace(/"dateModified": "[^"]*"/, `"dateModified": "${today}"`);
fs.writeFileSync(TARGET, page);
console.log(`NBA Today for ${today}: ${tonight.length} games tonight, ${lastNight.length} results from ${yest}.`);
