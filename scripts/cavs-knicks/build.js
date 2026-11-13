// Builds /blog/cavaliers-vs-knicks/ (live-updated matchup hub) and its chart.
// Facts checked 2026-11-13: box scores + schedules + series history from Basketball-Reference,
// recaps from AP via NBA.com, TV/radio from NBA.com scheduleLeagueV2.json.
// AFTER EACH GAME: add it to `games` (+ its box score to `boxes`), update `next`, records, UPDATED, rebuild.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-13', PUB_H = 'November 13, 2026';
const UPDATED = '2026-11-13', UPDATED_H = 'November 13, 2026';
const SLUG = 'cavaliers-vs-knicks', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/cavaliers-vs-knicks-last-6-meetings.jpg';

// last 6 meetings, oldest first (w = winner)
const meetings = [
  { short: 'ECF G1', w: 'NYK', a: 115, b: 104, note: 'OT' },
  { short: 'ECF G2', w: 'NYK', a: 109, b: 93 },
  { short: 'ECF G3', w: 'NYK', a: 121, b: 108 },
  { short: 'ECF G4', w: 'NYK', a: 130, b: 93 },
  { short: 'Nov 7', w: 'NYK', a: 109, b: 97 },
  { short: 'Nov 11', w: 'CLE', a: 115, b: 107 },
].map(g => ({ ...g, m: g.a - g.b }));

async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 70, R = 50, T = 200, cw = W - L - R;
  const mid = 470, scale = (mid - T - 40) / 37, slot = cw / meetings.length, bw = 110;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  const NYK = '#f28c28', CLE = '#c9c4bf';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="#fcfcfb">Cavaliers vs Knicks: the last 6 meetings</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="#c9c4bf">Margin of victory, 2026 East finals through Nov. 11, 2026 · NBA GRID</text>`;
  s += `<rect x="${L}" y="146" width="18" height="18" rx="3" fill="${NYK}"/><text x="${L + 28}" y="162" ${F} font-size="20" fill="#fcfcfb">Knicks win (above)</text>`;
  s += `<rect x="${L + 230}" y="146" width="18" height="18" rx="3" fill="${CLE}"/><text x="${L + 258}" y="162" ${F} font-size="20" fill="#fcfcfb">Cavaliers win (below)</text>`;
  meetings.forEach((g, i) => {
    const x = L + i * slot + (slot - bw) / 2, h = g.m * scale, up = g.w === 'NYK', r = 4;
    const top = up ? mid - h : mid, bot = up ? mid : mid + h;
    s += up
      ? `<path d="M${x},${bot} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${bot} Z" fill="${NYK}"/>`
      : `<path d="M${x},${top} V${bot - r} Q${x},${bot} ${x + r},${bot} H${x + bw - r} Q${x + bw},${bot} ${x + bw},${bot - r} V${top} Z" fill="${CLE}"/>`;
    s += `<text x="${x + bw / 2}" y="${up ? top - 12 : bot + 32}" text-anchor="middle" ${F} font-size="26" font-weight="700" fill="#fcfcfb">+${g.m}${g.note ? ' (OT)' : ''}</text>`;
    s += `<text x="${x + bw / 2}" y="${H - 108}" text-anchor="middle" ${F} font-size="22" font-weight="700" fill="#fcfcfb">${g.short}</text>`;
    s += `<text x="${x + bw / 2}" y="${H - 82}" text-anchor="middle" ${F} font-size="18" fill="#8a847e">${g.w === 'NYK' ? 'NYK' : 'CLE'} ${g.a}-${g.b}</text>`;
  });
  s += `<line x1="${L}" x2="${W - R}" y1="${mid}" y2="${mid}" stroke="#8a847e" stroke-width="1.5"/>`;
  s += `<text x="${L}" y="${H - 22}" ${F} font-size="17" fill="#8a847e">Source: Basketball-Reference. ECF = 2026 Eastern Conference finals (Knicks won 4-0).</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Cavaliers vs Knicks: Next Game, Results, Stats, How to Watch';
const desc = 'Cavaliers vs Knicks: Cleveland won 115-107 at MSG on Nov. 11. Next game Nov. 25 (NBA Cup). Player stats, how to watch, series results and history.';
const faqs = [
  ['When is the next Cavaliers vs Knicks game?', 'The next Cavaliers vs Knicks game is Wednesday, November 25, 2026, at 7:30 p.m. ET at Madison Square Garden in New York. It is an Emirates NBA Cup group-stage game (East Group B). After that, the teams meet on Monday, December 21, at 7:00 p.m. ET in Cleveland.'],
  ['What channel is Cavaliers vs Knicks on?', 'The November 25 game is not on national TV. It airs locally on MSG and DAZN in the New York market and on DAZN-CLE in Cleveland. The December 21 game is national on Peacock and NBC Sports Network.'],
  ['Who won the last Cavaliers vs Knicks game?', 'The Cleveland Cavaliers won the last game, 115-107 at Madison Square Garden on November 11, 2026. James Harden scored a season-high 32 points, including the go-ahead 3-pointer with 4:21 left.'],
  ['What is the Cavaliers vs Knicks season series?', 'The 2026-27 season series is tied 1-1. The Knicks won 109-97 in Cleveland on November 7, and the Cavaliers won 115-107 in New York on November 11. Two games remain: November 25 and December 21.'],
  ['Did the Knicks sweep the Cavaliers in the 2026 playoffs?', 'Yes. The Knicks swept the Cavaliers 4-0 in the 2026 Eastern Conference finals, starting with a comeback from 22 points down in the fourth quarter of Game 1, then beat the Spurs in the NBA Finals.'],
  ['Who leads the all-time Knicks vs Cavaliers series?', 'The Knicks lead the all-time series 124-111, according to Basketball-Reference, and have won all five playoff series between the teams (1978, 1995, 1996, 2023 and 2026).'],
  ['Where can I buy Cavaliers vs Knicks tickets?', 'Tickets are sold through the teams, Ticketmaster and resale sites like SeatGeek. Our NBA tickets guide explains where to find the best prices and how to avoid fees.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const H3 = t => `<h3 class="font-headline-md text-[20px] mt-md mb-xs">${t}</h3>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const nextRows = [
  ['<strong>Date</strong>', 'Wednesday, Nov. 25, 2026', 'Monday, Dec. 21, 2026'],
  ['<strong>Tip-off</strong>', '7:30 p.m. ET / 6:30 CT / 4:30 PT', '7:00 p.m. ET / 6:00 CT / 4:00 PT'],
  ['<strong>Venue</strong>', 'Madison Square Garden, New York', 'Rocket Arena, Cleveland'],
  ['<strong>Game type</strong>', 'Emirates NBA Cup, East Group B', 'Regular season'],
  ['<strong>TV</strong>', 'MSG (New York), DAZN-CLE (Cleveland); no national TV', 'Peacock / NBC Sports Network (national)'],
  ['<strong>Streaming</strong>', 'DAZN; NBA League Pass outside local markets', 'Peacock'],
  ['<strong>Radio</strong>', '880 ESPN New York; WTAM 1100 / 100.7 WMMS, La Mega 1300 (Spanish)', 'Same as Nov. 25'],
  ['<strong>Season series</strong>', 'Tied 1-1', '—'],
];
const seasonRows = [
  ['Nov. 11, 2026', 'Madison Square Garden', '<strong>Cavaliers 115, Knicks 107</strong>', 'Harden 32', 'Brunson 27'],
  ['Nov. 7, 2026', 'Rocket Arena', '<strong>Knicks 109, Cavaliers 97</strong>', 'Mitchell 37', 'Brunson 31'],
];
const quarters = [['Cavaliers', '33', '26', '23', '33', '<strong>115</strong>'], ['Knicks', '23', '30', '23', '31', '<strong>107</strong>']];
const box = (rows) => rows.map(([n, min, pts, reb, ast, fg, tp]) => [`<strong>${n}</strong>`, min, pts, reb, ast, fg, tp]);
const nov11CLE = box([
  ['James Harden', '33', '32', '2', '4', '9-14', '5-7'], ['Donovan Mitchell', '36', '23', '7', '6', '8-15', '2-7'], ['Tyrese Proctor', '23', '15', '3', '1', '6-12', '3-8'],
  ['Meleek Thomas', '22', '14', '4', '1', '6-11', '2-4'], ['Jarrett Allen', '32', '11', '14', '3', '4-7', '0-0'], ['Evan Mobley', '33', '10', '5', '3', '4-8', '0-2'],
  ['Peyton Watson', '30', '7', '5', '4', '2-12', '2-5'], ['Jaylon Tyson', '23', '3', '0', '1', '1-5', '1-5'],
]);
const nov11NYK = box([
  ['Jalen Brunson', '35', '27', '3', '5', '12-23', '3-8'], ['Karl-Anthony Towns', '34', '21', '11', '8', '7-11', '2-5'], ['Miles McBride', '27', '19', '2', '2', '7-13', '5-10'],
  ['OG Anunoby', '34', '14', '6', '2', '3-9', '2-6'], ['Landry Shamet', '29', '12', '2', '4', '5-8', '2-4'], ['Josh Hart', '26', '6', '4', '3', '3-8', '0-3'],
  ['Tyler Kolek', '13', '4', '1', '4', '2-3', '0-1'], ['Mikal Bridges', '17', '2', '1', '2', '1-3', '0-0'],
]);
const nov7NYK = box([
  ['Jalen Brunson', '34', '31', '6', '9', '12-25', '3-7'], ['Karl-Anthony Towns', '34', '29', '13', '3', '11-21', '2-4'], ['OG Anunoby', '34', '15', '6', '2', '4-13', '3-9'],
  ['Mikal Bridges', '31', '9', '6', '4', '4-13', '1-7'], ['Landry Shamet', '29', '9', '1', '1', '3-8', '3-8'], ['Jordan Clarkson', '15', '9', '2', '0', '4-5', '1-1'],
  ['Miles McBride', '16', '5', '0', '0', '2-4', '1-3'], ['Andre Drummond', '14', '0', '8', '0', '0-1', '0-0'],
]);
const nov7CLE = box([
  ['Donovan Mitchell', '37', '37', '4', '4', '13-22', '5-13'], ['Evan Mobley', '33', '12', '9', '5', '5-11', '1-5'], ['Peyton Watson', '29', '12', '6', '3', '5-11', '1-5'],
  ['Meleek Thomas', '24', '9', '4', '0', '3-10', '3-8'], ['Riley Minix', '10', '8', '3', '0', '3-4', '2-3'], ['James Harden', '34', '7', '2', '5', '2-9', '1-4'],
  ['Tyrese Proctor', '23', '7', '3', '3', '2-5', '2-4'], ['Thomas Bryant', '15', '5', '3', '1', '2-4', '1-3'],
]);
const BOXH = ['Player', 'MIN', 'PTS', 'REB', 'AST', 'FG', '3P'];
const playoffRows = [
  ['2026', 'East finals', '<strong>Knicks 4-0</strong>', 'Game 1: 115-104 (OT) after trailing by 22 in the 4th'],
  ['2023', 'East first round', '<strong>Knicks 4-1</strong>', 'Brunson’s first playoff run in New York'],
  ['1996', 'East first round', '<strong>Knicks 3-0</strong>', 'Best-of-5 sweep'],
  ['1995', 'East first round', '<strong>Knicks 3-1</strong>', 'Best-of-5'],
  ['1978', 'East first round', '<strong>Knicks 2-0</strong>', 'Best-of-3'],
];

const body = `
<div class="article-callout">
<span class="callout-label">QUICK ANSWER</span>
<p>The next <strong>Cavaliers vs Knicks</strong> game is <strong>Wednesday, Nov. 25, 2026, at 7:30 p.m. ET</strong> at Madison Square Garden, an NBA Cup group game on MSG and DAZN. The season series is <strong>tied 1-1</strong> after Cleveland won 115-107 in New York on Nov. 11, four days after the Knicks won 109-97 in Cleveland. They meet again Dec. 21 in Cleveland.</p>
</div>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Cavaliers vs Knicks chart: margin of victory in their last 6 meetings, with the Knicks winning 5 including the 2026 East finals sweep" loading="eager" fetchpriority="high"/>
<p class="article-caption">The Knicks won the last five Cavaliers vs Knicks games, including a sweep in the 2026 East finals, before Cleveland broke through on Nov. 11. Chart by NBA GRID.</p>

${H2('Cavaliers vs Knicks: Next Game Info')}
<p>Two Knicks vs Cavs games remain this season. Here's everything for both, from the NBA's official schedule.</p>
${table(['', 'Cavaliers at Knicks', 'Knicks at Cavaliers'], nextRows)}
<p class="article-caption">TV and radio from the NBA's official 2026-27 schedule, checked ${PUB_H}. Broadcast plans can change; we'll recheck them the morning of each game.</p>
<p>The Nov. 25 game counts twice: it's part of the regular-season standings and the Emirates NBA Cup group stage. Last season's Cup run ended with the Knicks lifting the trophy in Las Vegas, so expect New York to treat it like a big one.</p>

${H2('Cavaliers vs Knicks Result: Cavs Win 115-107 at MSG (Nov. 11)')}
<p>James Harden picked a good night to wake up. The 37-year-old came in averaging 15.3 points and shooting 36.4% from the field, then dropped a season-high 32 on 9-of-14 shooting at Madison Square Garden. He went 4-for-4 in the second quarter alone, with three 3-pointers, for 13 points as Cleveland built a 59-53 halftime lead.</p>
<p>The Knicks kept coming. Down 95-85 with 8:25 left, they ripped off a 14-4 run to tie it at 101. That's when Harden hit the go-ahead 3 with 4:21 to play. Evan Mobley scored, then Jarrett Allen took over the paint with four straight points, capped by a dunk that made it 110-103. Allen finished with 11 points and 14 rebounds.</p>
<p>Jalen Brunson scored 27 on 12-of-23 shooting but didn't attempt a single free throw. Karl-Anthony Towns had 21 points, 11 rebounds and 8 assists, his 11th straight double-double to open the season, which ties Willis Reed's franchise record. The loss snapped New York's four-game winning streak and ended Cleveland's two-game skid. Records after the game: Cavaliers 6-6, Knicks 6-5.</p>
${table(['Team', 'Q1', 'Q2', 'Q3', 'Q4', 'Final'], quarters)}

${H2('Cavaliers vs Knicks Player Stats')}
<p>Box scores for both games this season, most recent first. Starters and key bench players; minutes rounded.</p>
${H3('Nov. 11, 2026: Cavaliers 115, Knicks 107 (at New York)')}
<p><strong>Cavaliers</strong></p>
${table(BOXH, nov11CLE)}
<p><strong>Knicks</strong></p>
${table(BOXH, nov11NYK)}
${H3('Nov. 7, 2026: Knicks 109, Cavaliers 97 (at Cleveland)')}
<p><strong>Knicks</strong></p>
${table(BOXH, nov7NYK)}
<p><strong>Cavaliers</strong></p>
${table(BOXH, nov7CLE)}
<p class="article-caption">Box scores from Basketball-Reference. On Nov. 7, Cleveland played without Jarrett Allen (knee), Jaylon Tyson (ankle) and Sam Merrill (elbow); the Knicks were without Josh Hart (ankle).</p>
<p>The Nov. 7 game belonged to Brunson. With Cleveland up 39-37 in the second quarter, he hit a 3 and then scored 18 straight points in 4:24 to put the Knicks in front for good. Donovan Mitchell answered with 21 of his season-high 37 in the fourth quarter, but New York held on.</p>

${H2('Cavaliers vs Knicks 2026-27 Results')}
${table(['Date', 'Arena', 'Final', 'CLE top scorer', 'NYK top scorer'], seasonRows)}
<p class="article-caption">We update this table within an hour of every Cavaliers-Knicks game.</p>

${H2('Key Matchups to Watch')}
${H3('Brunson vs. Mitchell and Harden')}
<p>This rivalry runs through the backcourts. Brunson has scored 27 and 31 in the two games, and he torched Harden in the playoffs: in Game 1 of the East finals he kept attacking him to spark the 18-1 run that erased Cleveland's lead. Mitchell and Harden have split the big nights, 37 for Mitchell in the first game and 32 for Harden in the second. In Cleveland's one win, both scored 20-plus.</p>
${H3('Towns vs. Allen and Mobley')}
<p>Towns has been a problem for Cleveland's twin towers, with 29 and 13 in the first meeting and a near triple-double in the second. Allen missed the Nov. 7 game, and the Cavs' frontcourt looked completely different with him back on Nov. 11: 14 rebounds and the game-sealing dunk. Towns' double-double streak (11 straight to start the season, tied with Willis Reed's Knicks record) goes on the line next at Indiana on Nov. 13.</p>

${H2('How to Watch Cavaliers vs Knicks')}
<ul class="list-disc pl-lg space-y-2">
<li><strong>Nov. 25 (NBA Cup):</strong> 7:30 p.m. ET on MSG in New York and DAZN-CLE in Cleveland. No national TV, so fans outside both markets need NBA League Pass.</li>
<li><strong>Dec. 21:</strong> 7:00 p.m. ET, national on Peacock and NBC Sports Network.</li>
<li><strong>Radio:</strong> 880 ESPN New York for the Knicks; WTAM 1100 and 100.7 WMMS for the Cavs, with a Spanish call on La Mega 1300.</li>
</ul>
<p>Need help with services and blackouts? Our guide on ${int('/blog/how-to-watch-nba-games-live/', 'how to watch NBA games live')} covers every option, and the ${int('/nba-games/', 'NBA games grid')} shows tonight's full schedule.</p>

${H2('Cavaliers vs Knicks Timeline: From the 2026 East Finals to Now')}
<ul class="list-disc pl-lg space-y-2">
<li><strong>May 19, 2026, East finals Game 1:</strong> Cleveland leads 93-71 with 7:52 left. The Knicks close on an 18-1 run, Brunson ties it with 19 seconds left, and New York wins 115-104 in overtime. Per the AP, the only bigger fourth-quarter playoff comeback in the last 30 years was the Clippers' 24-point rally in 2012.</li>
<li><strong>May 21–25:</strong> The Knicks win the next three, 109-93, 121-108 and 130-93, the last two in Cleveland, to finish the sweep.</li>
<li><strong>June 2026:</strong> New York beats San Antonio 4-1 in the Finals for its first title since 1973. Brunson is Finals MVP. See our ${int('/blog/nba-playoffs-2026-recap/', '2026 playoffs recap')} and the ${int('/blog/spurs-vs-knicks/', 'Spurs vs Knicks rematch preview')}.</li>
<li><strong>Nov. 7, 2026:</strong> First meeting since the sweep. Knicks win 109-97 in Cleveland behind Brunson's 31.</li>
<li><strong>Nov. 11, 2026:</strong> Cleveland finally gets one, 115-107 at the Garden, behind Harden's 32.</li>
<li><strong>Next:</strong> Nov. 25 at New York (NBA Cup), then Dec. 21 at Cleveland.</li>
</ul>

${H2('Cavaliers vs Knicks Head-to-Head History')}
<p>The Knicks lead the all-time series <strong>124-111</strong>, according to Basketball-Reference, and they've owned the playoffs: New York is <strong>5-0 in playoff series</strong> against Cleveland and 16-2 in those games.</p>
${table(['Year', 'Round', 'Result', 'Note'], playoffRows)}
<p class="article-caption">Series results from Basketball-Reference.</p>
<p>For Cleveland, that history is the whole story of this rivalry. The Cavs have the stars and the size, and Donovan Mitchell is signed long term after his ${int('/blog/donovan-mitchell-extension-cavaliers/', '$273 million extension')}. But they've never beaten New York in a playoff series.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a).replace('Our NBA tickets guide', int('/blog/nba-tickets/', 'Our NBA tickets guide'))}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${ext('https://www.nba.com/schedule', 'NBA.com — official 2026-27 schedule')} (dates, times, TV and radio)</li>
<li>${ext('https://www.basketball-reference.com/boxscores/202611110NYK.html', 'Basketball-Reference — Cavaliers vs Knicks box score, Nov. 11, 2026')}</li>
<li>${ext('https://www.basketball-reference.com/boxscores/202611070CLE.html', 'Basketball-Reference — Knicks vs Cavaliers box score, Nov. 7, 2026')}</li>
<li>${ext('https://www.nba.com/game/cle-vs-nyk-0022600218', 'NBA.com / AP — Harden scores season-high 32 as Cavaliers beat Knicks')}</li>
<li>${ext('https://www.nba.com/game/nyk-vs-cle-0022600191', 'NBA.com / AP — Brunson scores 31 as Knicks beat Cavs 109-97')}</li>
<li>${ext('https://www.nba.com/game/cle-vs-nyk-0042500301', 'NBA.com / AP — Knicks rally from 22 down to win East finals Game 1 in OT')}</li>
<li>${ext('https://www.basketball-reference.com/playoffs/series.html', 'Basketball-Reference — all NBA playoff series')} and ${ext('https://www.basketball-reference.com/teams/NYK/head2head.html', 'Knicks head-to-head results')}</li>
</ul>

<div class="article-callout">
<span class="callout-label">PLAY TODAY'S GRID</span>
<p>Know your Knicks and Cavs? Test it on today's ${int('/blog/nba-immaculate-grid/#play', 'NBA GRID 3x3')}: name a player for every team, award and stat square.</p>
</div>`;

// ---------- assemble from the spurs-knicks page (same layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/spurs-vs-knicks/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/spurs-vs-knicks\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/spurs-vs-knicks-last-8-meetings\.jpg/g, IMG.split('/').pop());
if (/spurs/i.test(head)) throw new Error('template leftovers in head');
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] };
const ld = [
  { '@context': 'https://schema.org', '@type': 'NewsArticle', inLanguage: 'en-US', headline: 'Cavaliers vs Knicks: Next Game, Results, Player Stats & How to Watch', description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: UPDATED, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'SportsEvent', name: 'Cleveland Cavaliers at New York Knicks (Emirates NBA Cup)', sport: 'Basketball', startDate: '2026-11-25T19:30:00-05:00', eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: { '@type': 'Place', name: 'Madison Square Garden', address: { '@type': 'PostalAddress', streetAddress: '4 Pennsylvania Plaza', addressLocality: 'New York', addressRegion: 'NY', postalCode: '10001', addressCountry: 'US' } }, homeTeam: { '@type': 'SportsTeam', name: 'New York Knicks' }, awayTeam: { '@type': 'SportsTeam', name: 'Cleveland Cavaliers' }, competitor: [{ '@type': 'SportsTeam', name: 'New York Knicks' }, { '@type': 'SportsTeam', name: 'Cleveland Cavaliers' }], image: [`https://nba-grid.com${IMG}`], description: 'Emirates NBA Cup group-stage game. TV: MSG and DAZN (local).', organizer: { '@type': 'Organization', name: 'NBA', url: 'https://www.nba.com' } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://nba-grid.com/nba-games/' }, { '@type': 'ListItem', position: 3, name: 'Cavaliers vs Knicks', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const updatedSpan = UPDATED !== PUB ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${UPDATED}">${UPDATED_H}</time></span>` : '';
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">CAVALIERS VS KNICKS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Matchup Hub</span>
<h1>Cavaliers vs Knicks: Next Game, Results, Player Stats &amp; How to Watch</h1>
<p class="article-dek">The Knicks swept Cleveland out of the 2026 East finals. This season the series is tied 1-1. Here's when they play next, how to watch, full player stats from every game and the rivalry's history, updated after every game.</p>
<div class="article-meta">
<span>By <a href="/author/davis-vance/" rel="author" class="hover:text-primary underline">Davis Vance</a></span>
<span>•</span>
<span class="byline-published">Published <time datetime="${PUB}">${PUB_H}</time></span>${updatedSpan}
<span>•</span>
<span>${Math.max(1, Math.round(words / 230))} min read</span>
</div>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${body}
</div>
${authorBox}<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID</h2>
<div class="related-articles-grid grid grid-cols-1 md:grid-cols-3 gap-grid-gutter mb-lg">
<a href="../spurs-vs-knicks/">
<img width="1280" height="720" src="/assets/images/spurs-vs-knicks-last-8-meetings.jpg" alt="Spurs vs Knicks: last 8 meetings" loading="lazy"/>
<div class="related-title">Spurs vs Knicks: Christmas Day Finals Rematch</div>
</a>
<a href="../nba-playoffs-2026-recap/">
<img width="1280" height="960" src="/assets/images/msg-court-playoffs.jpg" alt="2026 NBA Playoffs Recap" loading="lazy"/>
<div class="related-title">2026 NBA Playoffs Recap: Bracket, Upsets &amp; Knicks' Title Run</div>
</a>
<a href="../donovan-mitchell-extension-cavaliers/">
<img width="640" height="427" src="/assets/images/donovan-mitchell-extension.jpg" alt="Donovan Mitchell's Cavaliers extension" loading="lazy"/>
<div class="related-title">Donovan Mitchell's $273M Cavaliers Extension, Explained</div>
</a>
</div>
<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
`;
const html = head + ld + '\n' + afterLd + main + footer;
(async () => {
  await chart();
  fs.mkdirSync(path.join(ROOT, 'blog', SLUG), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'blog', SLUG, 'index.html'), html);
  console.log('words', words, '| title', title.length, '| desc', desc.length);
})();
