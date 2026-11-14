// Builds /blog/spurs-vs-knicks/ and its chart. Facts checked 2026-11-11:
// schedule/TV from NBA.com scheduleLeagueV2.json; results, records and game logs from Basketball-Reference.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-11', PUB_H = 'November 11, 2026';
const SLUG = 'spurs-vs-knicks', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/spurs-vs-knicks-last-8-meetings.jpg';

// last 8 meetings (oldest first). w = winner, m = margin
const meetings = [
  { date: 'Dec 16, 2025', short: 'Dec 16', note: 'NBA Cup final (Las Vegas)', w: 'NYK', score: 'Knicks 124, Spurs 113' },
  { date: 'Dec 31, 2025', short: 'Dec 31', note: 'Regular season, San Antonio', w: 'SAS', score: 'Spurs 134, Knicks 132' },
  { date: 'Mar 1, 2026', short: 'Mar 1', note: 'Regular season, New York', w: 'NYK', score: 'Knicks 114, Spurs 89' },
  { date: 'Jun 3, 2026', short: 'G1', note: 'Finals Game 1, San Antonio', w: 'NYK', score: 'Knicks 105, Spurs 95' },
  { date: 'Jun 5, 2026', short: 'G2', note: 'Finals Game 2, San Antonio', w: 'NYK', score: 'Knicks 105, Spurs 104' },
  { date: 'Jun 8, 2026', short: 'G3', note: 'Finals Game 3, New York', w: 'SAS', score: 'Spurs 115, Knicks 111' },
  { date: 'Jun 10, 2026', short: 'G4', note: 'Finals Game 4, New York', w: 'NYK', score: 'Knicks 107, Spurs 106' },
  { date: 'Jun 13, 2026', short: 'G5', note: 'Finals Game 5, San Antonio', w: 'NYK', score: 'Knicks 94, Spurs 90' },
].map(g => { const [a, b] = g.score.match(/\d+/g).map(Number); return { ...g, m: a - b }; });
const nykWins = meetings.filter(g => g.w === 'NYK').length;
if (nykWins !== 6) throw new Error('expected 6 Knicks wins');

async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 70, R = 50, T = 200, B = 120, cw = W - L - R, ch = H - T - B;
  const mid = 500, scale = (mid - T - 40) / 25, slot = cw / meetings.length, bw = 92;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  const NYK = '#f28c28', SAS = '#c9c4bf';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="#fcfcfb">Spurs vs Knicks: New York won ${nykWins} of the last 8</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="#c9c4bf">Margin of victory in each meeting, Dec. 2025 to the 2026 NBA Finals · NBA GRID</text>`;
  s += `<rect x="${L}" y="146" width="18" height="18" rx="3" fill="${NYK}"/><text x="${L + 28}" y="162" ${F} font-size="20" fill="#fcfcfb">Knicks win (above)</text>`;
  s += `<rect x="${L + 230}" y="146" width="18" height="18" rx="3" fill="${SAS}"/><text x="${L + 258}" y="162" ${F} font-size="20" fill="#fcfcfb">Spurs win (below)</text>`;
  meetings.forEach((g, i) => {
    const x = L + i * slot + (slot - bw) / 2, h = g.m * scale, up = g.w === 'NYK', r = Math.min(4, h / 2);
    const top = up ? mid - h : mid, bot = up ? mid : mid + h;
    s += up
      ? `<path d="M${x},${bot} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${bot} Z" fill="${NYK}"/>`
      : `<path d="M${x},${top} V${bot - r} Q${x},${bot} ${x + r},${bot} H${x + bw - r} Q${x + bw},${bot} ${x + bw},${bot - r} V${top} Z" fill="${SAS}"/>`;
    const ly = up ? top - 12 : bot + 32;
    s += `<text x="${x + bw / 2}" y="${ly}" text-anchor="middle" ${F} font-size="26" font-weight="700" fill="#fcfcfb">+${g.m}</text>`;
    s += `<text x="${x + bw / 2}" y="612" text-anchor="middle" ${F} font-size="22" font-weight="700" fill="#fcfcfb">${g.short}</text>`;
  });
  s += `<line x1="${L}" x2="${W - R}" y1="${mid}" y2="${mid}" stroke="#8a847e" stroke-width="1.5"/>`;
  const f0 = L + 3 * slot + 8, f1 = W - R - 8;
  s += `<line x1="${f0}" x2="${f1}" y1="632" y2="632" stroke="#8a847e" stroke-width="1.5"/><text x="${(f0 + f1) / 2}" y="656" text-anchor="middle" ${F} font-size="18" fill="#8a847e">2026 NBA Finals</text>`;
  s += `<text x="${L}" y="${H - 18}" ${F} font-size="17" fill="#8a847e">Source: Basketball-Reference and NBA.com. Dec 16 was the NBA Cup final in Las Vegas.</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Spurs vs Knicks: Christmas Day Preview, TV Channel & Results';
const desc = 'Spurs vs Knicks is back on Christmas Day at Madison Square Garden (12 p.m. ET, ABC/ESPN). Finals rematch preview, how to watch and every recent result.';
const faqs = [
  ['When is the next Spurs vs Knicks game?', 'The next Spurs vs Knicks game is Friday, December 25, 2026, at 12:00 p.m. ET at Madison Square Garden in New York. It is the first game of the NBA\'s Christmas Day slate. The teams meet again on Sunday, March 7, 2027, at 7:30 p.m. ET at Frost Bank Center in San Antonio.'],
  ['What channel is Spurs vs Knicks on?', 'The Christmas Day game airs nationally on ABC and ESPN, with ESPN2, Disney+ and Disney Channel also listed by the NBA. The March 7 game is on NBC and Peacock, with a Spanish-language broadcast on Telemundo.'],
  ['Who won the last Spurs vs Knicks game?', 'The Knicks won the last meeting, 94-90 in Game 5 of the 2026 NBA Finals on June 13, 2026, in San Antonio. That win clinched the series 4-1 and gave New York its first NBA title since 1973.'],
  ['Who won the 2026 NBA Finals, Spurs or Knicks?', 'The New York Knicks beat the San Antonio Spurs four games to one. Jalen Brunson was named Finals MVP after averaging 32.6 points per game in the series.'],
  ['How many times do the Spurs and Knicks play this season?', 'Twice in the 2026-27 regular season: December 25 in New York and March 7 in San Antonio.'],
  ['Is Spurs vs Knicks a Finals rematch?', 'Yes. The Christmas Day game is the first meeting between the Spurs and Knicks since New York beat San Antonio in the 2026 NBA Finals.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const gameRows = [
  ['<strong>Date</strong>', 'Friday, Dec. 25, 2026 (Christmas Day)', 'Sunday, March 7, 2027'],
  ['<strong>Tip-off</strong>', '12:00 p.m. ET / 11:00 a.m. CT', '7:30 p.m. ET / 6:30 p.m. CT'],
  ['<strong>Venue</strong>', 'Madison Square Garden, New York', 'Frost Bank Center, San Antonio'],
  ['<strong>TV</strong>', 'ABC, ESPN, ESPN2, Disney Channel', 'NBC, Telemundo (Spanish)'],
  ['<strong>Streaming</strong>', 'Disney+ (ESPN)', 'Peacock'],
  ['<strong>Radio</strong>', '880 ESPN New York; WOAI/KXTN San Antonio', 'WOAI/KXTN San Antonio; 880 ESPN New York'],
];
const resultRows = [...meetings].reverse().map(g => [g.date, g.note, `<strong>${g.score}</strong>`]);
const formRows = [
  ['<strong>San Antonio Spurs</strong>', '10-2', 'Won 10', 'Lost first two, then beat DAL, SAC, UTA, MIN, UTA, DAL, SAC, POR, PHX, CHI'],
  ['<strong>New York Knicks</strong>', '6-5', 'Lost 1', 'Started 0-3, won four straight, then lost 115-107 to Cleveland'],
];
const playerRows = [
  ['<strong>Victor Wembanyama</strong>', 'SAS', '30.1', '11.9', '4.4 blocks', '26.0 pts, 11.2 reb, 3.6 blk'],
  ['<strong>Jalen Brunson</strong>', 'NYK', '25.9', '3.1', '5.2 assists', '32.6 pts, 4.6 ast (Finals MVP)'],
  ['<strong>Karl-Anthony Towns</strong>', 'NYK', '20.9', '13.8', '3.1 assists', '13.0 pts, 10.6 reb'],
];

const body = `
<div class="article-callout">
<span class="callout-label">QUICK ANSWER</span>
<p>The next <strong>Spurs vs Knicks</strong> game is on <strong>Friday, December 25, 2026, at 12:00 p.m. ET</strong> at Madison Square Garden. It's on <strong>ABC and ESPN</strong>, and it's the first meeting since the Knicks beat the Spurs 4-1 in the 2026 NBA Finals. They play once more this season, on March 7 in San Antonio.</p>
</div>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Spurs vs Knicks chart: margin of victory in their last 8 meetings, with the Knicks winning 6 including the 2026 NBA Finals" loading="eager" fetchpriority="high"/>
<p class="article-caption">The Knicks have won ${nykWins} of the last 8 Spurs-Knicks games, but five of the 8 were decided by 4 points or fewer. Chart by NBA GRID.</p>

${H2('Spurs vs Knicks Game Info')}
<p>Christmas Day opens with the Finals rematch everyone wanted. Here's everything you need for both Spurs-Knicks games this season, straight from the NBA's official schedule.</p>
${table(['', 'Spurs at Knicks', 'Knicks at Spurs'], gameRows)}
<p class="article-caption">Times and broadcasters from the NBA's official 2026-27 schedule, checked ${PUB_H}. National TV assignments can change, so we'll recheck them the week of the game.</p>
<p>Heads-up if you searched this game on Google: some AI summaries list the Christmas game at 9:00 a.m. ET and the March game at 4:30 p.m. ET. Neither matches the NBA's schedule. It's noon ET on Christmas and 7:30 p.m. ET in March.</p>

${H2('Spurs vs Knicks Latest: Where Both Teams Stand')}
<p>Both teams stumbled out of the gate. Since then, San Antonio hasn't lost and New York has mostly recovered. Here's where they stand after the games of November 11.</p>
${table(['Team', 'Record', 'Streak', 'How they got here'], formRows)}
<p class="article-caption">Records and results from Basketball-Reference and ESPN, through games of November 11, 2026.</p>
<p><strong>San Antonio</strong> hasn't lost since October 23. Wembanyama has been ridiculous during the streak: <strong>52 points, 24 rebounds and 8 blocks</strong> in a one-point win over Dallas on November 4, then <strong>40 points, 11 rebounds and 8 blocks</strong> in just 25 minutes at Phoenix on November 9.</p>
<p>The streak hit 10 on November 11 with a 124-119 win in Chicago.</p>
<p><strong>New York</strong> started 0-3, which is a strange look for a defending champion. Then the Knicks won four straight, capped by a 117-85 blowout of Milwaukee on November 10 in which Brunson scored 23 and Towns put up 21 points and 16 rebounds. Cleveland ended that run the next night, ${int('/blog/cavaliers-vs-knicks/', '115-107 at the Garden')}.</p>
<p><strong>Injury report:</strong> As of November 11, ESPN lists three Spurs as out: Devin Vassell (groin), Tobias Harris (calf) and Jayden Quaintance (knee). All three have estimated return dates well before Christmas. We'll post the official NBA injury report here the day before the game.</p>

${H2('Spurs vs Knicks Results: The Last 8 Meetings')}
<p>These two teams have seen a lot of each other over the past year. The Knicks have won ${nykWins} of the last 8, but don't let that fool you. Five of those games were decided by four points or fewer, and two Finals games came down to a single point.</p>
${table(['Date', 'Game', 'Final score'], resultRows)}
<p class="article-caption">Results from Basketball-Reference and NBA.com. The NBA Cup final doesn't count in the regular-season standings.</p>
<p>The rivalry really started in Las Vegas on December 16, 2025, when the Knicks beat the Spurs 124-113 to win the NBA Cup and Brunson was named tournament MVP. San Antonio got one back on New Year's Eve, 134-132. Then the Knicks won by 25 at the Garden in March, a preview nobody took seriously until June.</p>

${H2('How the Knicks Beat the Spurs in the 2026 NBA Finals')}
<p>The Spurs had home-court advantage as the No. 2 seed, and the Knicks took it away right away. In Game 1, New York erased a 14-point second-half deficit, closed on an 11-0 run and won 105-95. According to the AP, that made the Knicks the first team ever to beat San Antonio in Game 1 of a Finals (the Spurs had been 6-0). Two nights later they won again, 105-104, stretching their playoff winning streak to 13. The Spurs finally ended that streak at the Garden in Game 3, 115-111.</p>
<p>Game 4 was the one that broke them. The Spurs led by as many as 29 points, and the Knicks still came back to win 107-106 for a 3-1 series lead, which ESPN called a record rally. Back in San Antonio for Game 5, Jalen Brunson dropped <strong>45 points</strong> in a 94-90 win that clinched New York's first championship since 1973.</p>
<p>Brunson was the obvious Finals MVP at 32.6 points per game. OG Anunoby was the quiet difference-maker: 21.2 points a game on 50% from three. Wembanyama averaged 26.0 points, 11.2 rebounds and 3.6 blocks, but the Knicks made him work for everything. For the full game-by-game breakdown, see our ${int('/blog/nba-finals-schedule-2026/', '2026 NBA Finals results')} and the ${int('/blog/nba-playoffs-2026-recap/', '2026 playoffs recap')}.</p>

${H2('Key Matchup: Wembanyama vs. Brunson and Towns')}
${table(['Player', 'Team', 'PPG', 'RPG', 'Also', '2026 Finals'], playerRows)}
<p class="article-caption">2026-27 per-game averages through November 10, 2026 (Wembanyama 11 games, Brunson and Towns 10), from Basketball-Reference.</p>
<p>It always comes back to <strong>Wembanyama</strong>. He's averaging over 30 points and over 4 blocks a game, and he can wreck a game on either end. In June he shot just 27% from three (9 of 33), and New York will happily give him those looks again.</p>
<p><strong>Brunson</strong> is the guy San Antonio has to solve. He scored 30, 36 and 45 in three of the Knicks' four Finals wins. Expect the Spurs to throw length at him and force him to beat them as a passer. <strong>Towns</strong> is the swing piece: if he's pulling Wembanyama out to the three-point line, the paint opens up for Brunson. And don't sleep on <strong>Dylan Harper</strong>. San Antonio's second-year guard averaged 18 points a game off the bench in the Finals.</p>

${H2('Spurs vs Knicks Prediction')}
<p>This is an early lean, not a pick against the spread. We'll update it once injury reports and lines are out the week of the game.</p>
<p><strong>Early lean: Spurs.</strong> The Knicks have owned this matchup, and Christmas at the Garden is about as tough a road game as there is. But this San Antonio team is playing better than the one that lost in June. The Spurs carry a 10-game win streak and a Wembanyama who's playing at an MVP level, and ESPN's matchup predictor agrees, giving San Antonio a 53.9% chance to win as of November 11. New York's best path is the Finals formula: slow the game down, keep Wembanyama off the glass, and let Brunson take over late in close games. If it's within five points with three minutes left, flip this lean.</p>

${H2('Spurs vs Knicks Odds')}
<p>We'll add the spread, moneyline and total here once sportsbooks post lines for the Christmas Day game. Lines from other games aren't a useful guide for this one, so we won't guess. If you bet, set a limit and stick to it. Help is available at 1-800-GAMBLER.</p>

${H2('How to Watch Spurs vs Knicks')}
<ul class="list-disc pl-lg space-y-2">
<li><strong>Christmas Day (Dec. 25):</strong> ABC and ESPN at 12:00 p.m. ET, also on ESPN2 and Disney Channel. Stream it on Disney+ or with the ESPN app.</li>
<li><strong>March 7, 2027:</strong> NBC at 7:30 p.m. ET, streaming on Peacock. Telemundo has the Spanish-language call.</li>
<li><strong>Radio:</strong> 880 ESPN New York for the Knicks; WOAI and KXTN in San Antonio for the Spurs.</li>
<li><strong>Outside the U.S.:</strong> NBA League Pass, subject to local broadcast deals.</li>
</ul>
<p><strong>Tickets:</strong> As of November 11, resale tickets for the Christmas game at Madison Square Garden started at about $560 on Vivid Seats and $582 on SeatGeek. The March 7 game in San Antonio was much cheaper, starting at $179 on SeatGeek. Prices change daily.</p>
<p>Planning your holiday viewing? Our ${int('/blog/nba-2026-27-schedule/', '2026-27 NBA schedule guide')} has the full Christmas Day slate, and the ${int('/nba-games/', 'NBA games grid')} shows every game on any night.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${ext('https://www.nba.com/schedule', 'NBA.com — official 2026-27 schedule')} (dates, times, venues, TV and radio)</li>
<li>${ext('https://www.basketball-reference.com/playoffs/2026-nba-finals-knicks-vs-spurs.html', 'Basketball-Reference — 2026 NBA Finals, Knicks vs. Spurs')}</li>
<li>${ext('https://www.basketball-reference.com/teams/SAS/2027_games.html', 'Basketball-Reference — Spurs 2026-27 schedule and results')} and ${ext('https://www.basketball-reference.com/teams/NYK/2027_games.html', 'Knicks 2026-27 schedule and results')}</li>
<li>${ext('https://www.basketball-reference.com/players/w/wembavi01/gamelog/2027', 'Basketball-Reference — Victor Wembanyama 2026-27 game log')}</li>
<li>${ext('https://www.espn.com/nba/game/_/gameId/401909097/spurs-knicks', 'ESPN — Spurs vs. Knicks (Dec 25, 2026) game page')} (injuries, matchup predictor, ticket prices)</li>
<li>${ext('https://www.nba.com/game/nyk-vs-sas-0042500401', 'NBA.com / AP — Knicks steal Game 1 from Spurs, 105-95')}</li>
<li>${ext('https://seatgeek.com/knicks-spurs-tickets', 'SeatGeek — Knicks vs. Spurs tickets')}</li>
<li>${ext('https://www.nbcnews.com/sports/nba/knicks-win-nba-cup-rallying-beat-spurs-124-113-rcna249637', 'NBC News — Knicks win NBA Cup, beat Spurs 124-113')}</li>
</ul>`;

// ---------- assemble from the luka page (same layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/luka-doncic-weight/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/luka-doncic-weight\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/luka-doncic-weight-chart\.jpg/g, IMG.split('/').pop());
if (/luka/i.test(head)) throw new Error('template leftovers in head');
const ld = [
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: 'Spurs vs Knicks: Christmas Day Finals Rematch Preview, How to Watch & Results', description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: PUB, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] } },
  { '@context': 'https://schema.org', '@type': 'SportsEvent', name: 'San Antonio Spurs at New York Knicks', sport: 'Basketball', startDate: '2026-12-25T12:00:00-05:00', eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: { '@type': 'Place', name: 'Madison Square Garden', address: { '@type': 'PostalAddress', streetAddress: '4 Pennsylvania Plaza', addressLocality: 'New York', addressRegion: 'NY', postalCode: '10001', addressCountry: 'US' } }, homeTeam: { '@type': 'SportsTeam', name: 'New York Knicks' }, awayTeam: { '@type': 'SportsTeam', name: 'San Antonio Spurs' }, competitor: [{ '@type': 'SportsTeam', name: 'New York Knicks' }, { '@type': 'SportsTeam', name: 'San Antonio Spurs' }], image: [`https://nba-grid.com${IMG}`], description: 'Christmas Day rematch of the 2026 NBA Finals. National TV: ABC and ESPN.', organizer: { '@type': 'Organization', name: 'NBA', url: 'https://www.nba.com' } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://nba-grid.com/nba-games/' }, { '@type': 'ListItem', position: 3, name: 'Spurs vs Knicks', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">SPURS VS KNICKS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Game Preview</span>
<h1>Spurs vs Knicks: Christmas Day Finals Rematch Preview, How to Watch &amp; Results</h1>
<p class="article-dek">Six months after the Knicks beat the Spurs for the title, Wembanyama and Brunson meet again on Christmas at Madison Square Garden. Here's the time, the TV channel, both teams' form and every recent result.</p>
<div class="article-meta">
<span>By <a href="/author/davis-vance/" rel="author" class="hover:text-primary underline">Davis Vance</a></span>
<span>•</span>
<span class="byline-published">Published <time datetime="${PUB}">${PUB_H}</time></span>
<span>•</span>
<span class="byline-updated">Updated <time datetime="${PUB}">${PUB_H}</time></span>
<span>•</span>
<span>${Math.max(1, Math.round(words / 230))} min read</span>
</div>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${body}
</div>
${authorBox}<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID</h2>
<div class="related-articles-grid grid grid-cols-1 md:grid-cols-3 gap-grid-gutter mb-lg">
<a href="../nba-finals-schedule-2026/">
<img width="1280" height="720" src="/assets/images/nba-finals-schedule-court.jpg" alt="2026 NBA Finals Schedule and Results" loading="lazy"/>
<div class="related-title">2026 NBA Finals: Full Game-by-Game Results</div>
</a>
<a href="../nba-2026-27-schedule/">
<img width="1000" height="750" src="/assets/images/nba-schedule-aerial-court.jpg" alt="NBA 2026-27 Schedule" loading="lazy"/>
<div class="related-title">NBA 2026-27 Schedule: Opening Night, Christmas &amp; Key Dates</div>
</a>
<a href="../tallest-nba-player-right-now/">
<img width="1280" height="2096" src="/assets/images/tallest-player-hoop-closeup.jpg" alt="Tallest NBA Player Right Now" loading="lazy"/>
<div class="related-title">Tallest NBA Player Right Now</div>
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
