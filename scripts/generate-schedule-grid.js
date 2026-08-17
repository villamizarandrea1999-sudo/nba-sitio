#!/usr/bin/env node
/*
 * Regenerates the games-per-week table inside blog/nba-fantasy-schedule-grid/index.html.
 * Only replaces the HTML between the SCHEDULE_GRID_START / SCHEDULE_GRID_END markers
 * and the "sched-grid-updated" date span — the rest of the page (SEO copy, FAQ, schema)
 * is untouched. Run nightly by .github/workflows/update-schedule-grid.yml.
 *
 * Requires Node 18+ (built-in fetch) and a BALLDONTLIE_API_KEY env var.
 * Free key: https://www.balldontlie.io (sign up, no credit card).
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.BALLDONTLIE_API_KEY;
const BASE = 'https://api.balldontlie.io/nba/v1';
const SEASON = 2026; // represents the 2026-27 season
const SEASON_START = '2026-10-20';
const SEASON_END = '2027-04-11';
const TARGET_FILE = path.join(__dirname, '..', 'blog', 'nba-fantasy-schedule-grid', 'index.html');

if (!API_KEY) {
  console.error('Missing BALLDONTLIE_API_KEY env var. Add it as a GitHub Actions secret.');
  process.exit(1);
}

async function apiGet(endpoint, params = {}) {
  const url = new URL(BASE + endpoint);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach(v => url.searchParams.append(key, v));
    else url.searchParams.set(key, value);
  }
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(`${endpoint} failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchAllTeams() {
  const data = await apiGet('/teams');
  return (data.data || []).filter(t => t.conference); // drop non-NBA/all-star entries if present
}

async function fetchAllSeasonGames() {
  let games = [];
  let cursor;
  do {
    const params = { 'seasons[]': SEASON, per_page: 100 };
    if (cursor) params.cursor = cursor;
    const data = await apiGet('/games', params);
    games = games.concat(data.data || []);
    cursor = data.meta && data.meta.next_cursor;
  } while (cursor);
  return games;
}

function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function buildWeeks(startStr, endStr) {
  const weeks = [];
  let cursor = mondayOf(startStr);
  const end = new Date(endStr + 'T00:00:00Z');
  let i = 1;
  while (cursor <= end) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    weeks.push({ index: i, start: weekStart, end: weekEnd });
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 7);
    i++;
  }
  return weeks;
}

function fmtShort(d) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildTableHtml(teams, weeks, counts) {
  const theadWeeks = weeks
    .map(w => `<th scope="col">Wk ${w.index}<br><span class="sched-grid-date">${fmtShort(w.start)}</span></th>`)
    .join('');

  const sortedTeams = teams.slice().sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));

  const rows = sortedTeams
    .map(team => {
      const cells = weeks
        .map(w => {
          const n = (counts[team.id] && counts[team.id][w.index]) || 0;
          let cls = 'sched-grid-cell';
          if (n === 0) cls += ' sched-grid-0';
          else if (n === 1) cls += ' sched-grid-light';
          else if (n >= 4) cls += ' sched-grid-heavy';
          return `<td class="${cls}">${n}</td>`;
        })
        .join('');
      return `<tr><th scope="row">${escapeHtml(team.abbreviation)}</th>${cells}</tr>`;
    })
    .join('\n');

  return [
    '<table class="sched-grid-table">',
    '<caption class="sr-only">NBA games per team per week, 2026-27 season</caption>',
    '<thead>',
    `<tr><th scope="col">Team</th>${theadWeeks}</tr>`,
    '</thead>',
    '<tbody>',
    rows,
    '</tbody>',
    '</table>',
  ].join('\n');
}

async function main() {
  const [teams, games] = await Promise.all([fetchAllTeams(), fetchAllSeasonGames()]);
  const weeks = buildWeeks(SEASON_START, SEASON_END);

  const counts = {};
  teams.forEach(t => {
    counts[t.id] = {};
    weeks.forEach(w => (counts[t.id][w.index] = 0));
  });

  games.forEach(g => {
    if (!g.date) return;
    const gd = new Date(g.date + 'T00:00:00Z');
    const week = weeks.find(w => gd >= w.start && gd <= w.end);
    if (!week) return;
    if (g.home_team && counts[g.home_team.id]) counts[g.home_team.id][week.index]++;
    if (g.visitor_team && counts[g.visitor_team.id]) counts[g.visitor_team.id][week.index]++;
  });

  const tableHtml = buildTableHtml(teams, weeks, counts);
  const today = new Date().toISOString().slice(0, 10);

  let html = fs.readFileSync(TARGET_FILE, 'utf8');

  const startMarker = '<!-- SCHEDULE_GRID_START -->';
  const endMarker = '<!-- SCHEDULE_GRID_END -->';
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not find SCHEDULE_GRID markers in target file.');
  }
  html =
    html.slice(0, startIdx + startMarker.length) +
    '\n' + tableHtml + '\n' +
    html.slice(endIdx);

  html = html.replace(
    /<span id="sched-grid-updated">.*?<\/span>/,
    `<span id="sched-grid-updated">Updated ${today}</span>`
  );

  fs.writeFileSync(TARGET_FILE, html, 'utf8');
  console.log(`Schedule grid updated for ${teams.length} teams, ${weeks.length} weeks, ${games.length} games.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
