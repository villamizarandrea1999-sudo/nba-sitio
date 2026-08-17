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

const sleep = ms => new Promise(r => setTimeout(r, ms));
// Free tier allows 5 requests/minute — wait ~13s between calls to stay under that.
const RATE_LIMIT_DELAY_MS = 13000;

async function apiGet(endpoint, params = {}) {
  const url = new URL(BASE + endpoint);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach(v => url.searchParams.append(key, v));
    else url.searchParams.set(key, value);
  }

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { Authorization: API_KEY } });
    if (res.status === 429) {
      const wait = RATE_LIMIT_DELAY_MS * attempt;
      console.log(`Rate limited on ${endpoint}, waiting ${wait}ms (attempt ${attempt})...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${endpoint} failed: ${res.status} ${res.statusText}`);
    return res.json();
  }
  throw new Error(`${endpoint} failed after repeated 429s`);
}

// The 30 real NBA franchises. The /teams endpoint can return extra non-NBA
// entries (e.g. international preseason opponents) that show up as 0-game
// rows in the grid, so we filter down to this known-good list.
const NBA_ABBREVIATIONS = new Set([
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
  'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
  'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS',
]);

async function fetchAllTeams() {
  const data = await apiGet('/teams');
  // Keep every row matching a real NBA abbreviation, even duplicates — some
  // franchises have more than one team id in the API. Games get aggregated
  // by abbreviation later so no games are lost regardless of which id they
  // reference.
  return (data.data || []).filter(t => NBA_ABBREVIATIONS.has(t.abbreviation));
}

async function fetchAllSeasonGames() {
  let games = [];
  let cursor;
  let first = true;
  do {
    if (!first) await sleep(RATE_LIMIT_DELAY_MS);
    first = false;
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

  const seenAbbr = new Set();
  const dedupedTeams = teams.filter(t => {
    if (seenAbbr.has(t.abbreviation)) return false;
    seenAbbr.add(t.abbreviation);
    return true;
  });
  const sortedTeams = dedupedTeams.slice().sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));

  const rows = sortedTeams
    .map(team => {
      const cells = weeks
        .map(w => {
          const n = (counts[team.abbreviation] && counts[team.abbreviation][w.index]) || 0;
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
  const teams = await fetchAllTeams();
  await sleep(RATE_LIMIT_DELAY_MS);
  const games = await fetchAllSeasonGames();
  const weeks = buildWeeks(SEASON_START, SEASON_END);

  // Keyed by abbreviation (not team id) so duplicate team ids for the same
  // franchise still get aggregated into one row.
  const idToAbbr = {};
  const counts = {};
  teams.forEach(t => {
    idToAbbr[t.id] = t.abbreviation;
    if (!counts[t.abbreviation]) {
      counts[t.abbreviation] = {};
      weeks.forEach(w => (counts[t.abbreviation][w.index] = 0));
    }
  });

  games.forEach(g => {
    if (!g.date) return;
    const gd = new Date(g.date + 'T00:00:00Z');
    const week = weeks.find(w => gd >= w.start && gd <= w.end);
    if (!week) return;
    const homeAbbr = g.home_team && idToAbbr[g.home_team.id];
    const visitorAbbr = g.visitor_team && idToAbbr[g.visitor_team.id];
    if (homeAbbr) counts[homeAbbr][week.index]++;
    if (visitorAbbr) counts[visitorAbbr][week.index]++;
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
