// Builds /blog/nba-power-rankings-2026-27/ (weekly). Data: week4-data.json (Basketball-Reference
// team ratings + results through Nov 11, 2026). Method: average of rank by win % and rank by
// adjusted net rating; ties broken by net rating. Blurbs only use verified facts.
// NEXT WEEK: refresh data (leagues/NBA_2027_ratings.html + games-<month>.html), update WEEK/DATES/NOTES/PREV.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const SLUG = 'nba-power-rankings-2026-27', URL = `https://nba-grid.com/blog/${SLUG}/`;
const PUB = '2026-09-12', PUB_H = 'September 12, 2026', MOD = '2026-11-13', MOD_H = 'November 13, 2026';
const WEEK = 4, THROUGH = 'Nov. 11';
const IMG = '/assets/images/nba-power-rankings-action.jpg';
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'week4-data.json'), 'utf8')).filter(t => t.team !== 'Team').map((t, i) => ({ ...t, rank: i + 1 }));
if (data.length !== 30) throw new Error('expected 30 teams');
const PRE = { 'New York Knicks': 1, 'San Antonio Spurs': 2, 'Philadelphia 76ers': 3, 'Oklahoma City Thunder': 4, 'Miami Heat': 5, 'Boston Celtics': 6, 'Cleveland Cavaliers': 7, 'Denver Nuggets': 8, 'Los Angeles Clippers': 9, 'Minnesota Timberwolves': 10 };
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const NOTES = {
  'San Antonio Spurs': `Ten straight wins after an 0-2 start, the only unbeaten last-10 in the league. Victor Wembanyama has been the story: 52 points, 24 rebounds and 8 blocks against Dallas on Nov. 4, then 40, 11 and 8 in just 25 minutes at Phoenix. Next up is the ${int('/blog/spurs-vs-knicks/', 'Christmas Day Finals rematch')} with the Knicks.`,
  'Houston Rockets': 'The best adjusted net rating in the NBA (+13.6 per 100 possessions). The 9-3 record undersells how thoroughly Houston has been beating people, and the formula rewards that.',
  'Los Angeles Lakers': 'The NBA’s best record at 11-2 and seven wins in a row, in their first season without LeBron James. The margin (+8.4 adjusted) is good, not dominant, which is why they sit third instead of first.',
  'Portland Trail Blazers': 'The surprise of the first month. An 8-3 record backed by a top-five net rating (+11.3), so this doesn’t look like a fluke built on close wins.',
  'Minnesota Timberwolves': `8-3 and four straight wins with Anthony Edwards sidelined after ${int('/blog/anthony-edwards-injury/', 'knee surgery')} that could cost him up to two months. Up five spots from our preseason No. 10.`,
  'Boston Celtics': 'The East’s best record (10-2) and 9-1 in the last 10. The schedule has helped: Boston’s adjusted net rating (+5.9) is well behind its raw margin, so it lands seventh here.',
  'Golden State Warriors': 'A +10.8 adjusted net rating, fourth best in the league, and 8-2 over the last 10 games.',
  'Oklahoma City Thunder': `Last season’s No. 1 seed is 8-4 without Jalen Williams, who had ${int('/blog/jalen-williams-injury/', 'surgery on a fractured fibula and ankle')} and will be re-evaluated before the end of the season. OKC still has the league’s best adjusted defensive rating.`,
  'Dallas Mavericks': '7-4 with three straight wins and a solid +6.7 adjusted net rating.',
  'Detroit Pistons': '7-3 and third in the East by record. The raw margin (+8.1) is strong, but much of it came against weak opponents: adjusted, it’s +4.1.',
};
const SHORT = {
  'Memphis Grizzlies': '7-4 with a positive margin (+4.9 adjusted).',
  'Philadelphia 76ers': `9-3, but the point margin doesn’t back it up (−2.8 adjusted). ${int('/blog/lebron-james-76ers-debut/', 'LeBron James’ new team')} is winning close games.`,
  'Denver Nuggets': '6-4 and +3.8 adjusted; steady, not spectacular.',
  'New York Knicks': `The champs opened 0-3, won four straight, then ${int('/blog/cavaliers-vs-knicks/', 'lost to Cleveland 115-107')} on Nov. 11. Down from No. 1 in the preseason.`,
  'Cleveland Cavaliers': `6-6 after splitting the first two games with the Knicks. Harden’s 32 on Nov. 11 was a season high.`,
  'Atlanta Hawks': '7-5, but a slightly negative adjusted net rating.',
  'Phoenix Suns': `4-6 with a positive adjusted margin (+1.6), playing without ${int('/blog/mark-williams-injury-suns/', 'injured center Mark Williams')}.`,
  'Toronto Raptors': '5-6 and almost exactly even on adjusted net rating.',
  'Miami Heat': `5-6 in year one of the ${int('/blog/giannis-antetokounmpo-heat-trade/', 'Giannis Antetokounmpo trade')}, with a −4.1 adjusted net rating.`,
  'Orlando Magic': '4-7 and 0-4 at home.',
  'Indiana Pacers': '4-8 with a −5.3 adjusted net rating.',
  'Los Angeles Clippers': '2-8 despite a margin (−3.3 adjusted) that’s better than the record.',
  'New Orleans Pelicans': '4-8 and four straight losses.',
  'Brooklyn Nets': '3-8 with a −7.6 adjusted net rating.',
  'Charlotte Hornets': '4-7, but the second-worst adjusted net rating in the league (−14.8).',
  'Washington Wizards': '4-8 and five straight losses.',
  'Utah Jazz': '1-11 and ten straight losses.',
  'Sacramento Kings': '1-10 with a −8.9 adjusted net rating.',
  'Chicago Bulls': '1-9 with the worst adjusted net rating in the NBA (−15.0).',
  'Milwaukee Bucks': '1-11 and eight straight losses in the first season after trading Giannis Antetokounmpo.',
};
for (const t of data) if (!NOTES[t.team] && !SHORT[t.team]) throw new Error('missing blurb ' + t.team);
const fmtN = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(1);
const move = t => PRE[t.team] ? (PRE[t.team] - t.rank > 0 ? `▲ ${PRE[t.team] - t.rank}` : PRE[t.team] - t.rank < 0 ? `▼ ${t.rank - PRE[t.team]}` : '—') + ` (pre: ${PRE[t.team]})` : '—';
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const rows = data.map((t, i) => `<tr${tr(i, 30)}><td class="py-2 pr-4"><strong>${t.rank}</strong></td><td class="py-2 pr-4"><strong>${t.team}</strong></td><td class="py-2 pr-4">${t.w}-${t.l}</td><td class="py-2 pr-4">${fmtN(t.nrtg)}</td><td class="py-2 pr-4">${t.l10}</td><td class="py-2 pr-4">${t.strk}</td><td class="py-2">${move(t)}</td></tr>`).join('\n');
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const top10 = data.slice(0, 10).map(t => `<h3 class="font-headline-md text-[20px] mt-md mb-xs">${t.rank}. ${t.team} (${t.w}-${t.l})</h3>\n<p>${NOTES[t.team]}</p>`).join('\n');
const rest = data.slice(10).map(t => `<li><strong>${t.rank}. ${t.team}:</strong> ${SHORT[t.team]}</li>`).join('\n');
const title = `NBA Power Rankings 2026-27: Week ${WEEK} (Nov. 13 Update)`;
const desc = `NBA power rankings, Week ${WEEK}: the Spurs take No. 1 on a 10-game win streak, the Rockets and Lakers follow, and the champion Knicks slide to 14th.`;
const faqs = [
  ['Who is No. 1 in the NBA power rankings this week?', `The San Antonio Spurs are No. 1 in our Week ${WEEK} power rankings. They are 10-2 with 10 straight wins and the league’s second-best adjusted net rating (+12.3).`],
  ['How are the NBA GRID power rankings calculated?', 'Each team gets two ranks: one by winning percentage and one by adjusted net rating (point margin per 100 possessions, adjusted for strength of schedule) from Basketball-Reference. We average the two ranks and break ties with net rating. The blurbs are our analysis.'],
  ['Why are the Knicks so low?', 'The defending champions are 6-5 with a modest adjusted net rating (+2.7), middle of the pack on both counts. They started 0-3, won four straight, then lost to Cleveland.'],
  ['How often are the power rankings updated?', 'Every week during the regular season, with the date of the update at the top of the page.'],
];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const body = `
<div class="article-callout">
<span class="callout-label">WEEK ${WEEK} · THROUGH ${THROUGH.toUpperCase()}</span>
<p><strong>San Antonio is No. 1</strong> after 10 straight wins. Houston (best adjusted net rating in the league) and the Lakers (best record) are next. The defending-champion <strong>Knicks fall from No. 1 in the preseason to No. 14</strong>, and Milwaukee is last at 1-11.</p>
</div>
<img class="hero-image" src="${IMG}" width="1280" height="914" alt="NBA power rankings 2026-27 Week ${WEEK}" loading="eager" fetchpriority="high"/>

${H2(`Week ${WEEK} NBA Power Rankings: All 30 Teams`)}
<div class="overflow-x-auto mt-md">
<table class="w-full text-left border-collapse">
<thead><tr class="border-b-2 border-on-surface">${['#', 'Team', 'Record', 'Adj. Net Rtg', 'L10', 'Streak', 'vs. Preseason'].map(th).join('')}</tr></thead>
<tbody class="text-on-surface-variant">
${rows}
</tbody>
</table>
</div>
<p class="article-caption">Records, streaks and adjusted net ratings through games of ${THROUGH}, 2026, from Basketball-Reference. "Pre" is the team's spot in our preseason top 10.</p>

${H2('The Top 10')}
${top10}

${H2('11 Through 30')}
<ul class="list-disc pl-lg space-y-2">
${rest}
</ul>

${H2('How We Rank')}
<p>A hot start against weak teams shouldn't be enough to reach No. 1, so we don't rank by record alone. Every team gets two ranks: one by winning percentage and one by <strong>adjusted net rating</strong>, Basketball-Reference's point margin per 100 possessions, adjusted for strength of schedule. We average the two and break ties with net rating. That's why Houston (9-3 but +13.6) ranks ahead of Boston (10-2 but +5.9), and why the 9-3 76ers sit 12th.</p>
<p>For every team's record and games behind, see the ${int('/nba-standings/', '2026-27 NBA standings')}, updated every morning.</p>

${H2('Preseason vs. Now')}
<p>Our preseason top 10, from September, looks very different a month in. Minnesota (No. 10 to No. 5) and San Antonio (No. 2 to No. 1) moved up. The Knicks (1 to 14), 76ers (3 to 12), Heat (5 to 19), Cavaliers (7 to 15) and Clippers (9 to 22) dropped. Boston (6 to 6) didn't move.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>`;

const tpl = fs.readFileSync(path.join(ROOT, `blog/${SLUG}/index.html`), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc));
const ld = [
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: `NBA Power Rankings 2026-27: Week ${WEEK}`, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: MOD, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 } } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'NBA Power Rankings', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('</article>'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">POWER RANKINGS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Power Rankings</span>
<h1>NBA Power Rankings: Week ${WEEK} of the 2026-27 Season</h1>
<p class="article-dek">All 30 teams ranked by record and adjusted net rating, one month into the season. Updated every week.</p>
<div class="article-meta">
<span>By <a href="/author/davis-vance/" rel="author" class="hover:text-primary underline">Davis Vance</a></span>
<span>•</span>
<span class="byline-published">Published <time datetime="${PUB}">${PUB_H}</time></span>
<span>•</span>
<span class="byline-updated">Updated <time datetime="${MOD}">${MOD_H}</time></span>
<span>•</span>
<span>${Math.max(1, Math.round(words / 230))} min read</span>
</div>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${body}
</div>
${authorBox}`;
fs.writeFileSync(path.join(ROOT, `blog/${SLUG}/index.html`), head + ld + '\n' + afterLd + main + footer);
console.log('words', words, '| title', title.length, '| desc', desc.length);
