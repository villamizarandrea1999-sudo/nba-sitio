// One-time builder for /nba-standings/ (page shell + hero image). The tables inside
// STANDINGS_START/END are filled nightly by scripts/generate-standings.js.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-13', PUB_H = 'November 13, 2026';
const URL = 'https://nba-grid.com/nba-standings/';
const IMG = '/assets/images/nba-standings-2026-27.jpg';

async function image() {
  const sharp = require('sharp');
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="90" y="250" ${F} font-size="34" font-weight="700" fill="#f28c28" letter-spacing="6">NBA GRID</text>`;
  s += `<text x="90" y="350" ${F} font-size="92" font-weight="700" fill="#fcfcfb">NBA Standings</text>`;
  s += `<text x="90" y="450" ${F} font-size="92" font-weight="700" fill="#fcfcfb">2026-27</text>`;
  s += `<text x="90" y="530" ${F} font-size="30" fill="#c9c4bf">East and West, updated every day</text>`;
  const rowsY = [200, 260, 320, 380, 440, 500, 560];
  rowsY.forEach((y, i) => { s += `<rect x="860" y="${y}" width="${330 - i * 30}" height="34" rx="4" fill="${i < 6 ? '#8a847e' : '#3a3836'}"/>`; });
  s += `<rect x="860" y="${rowsY[0]}" width="330" height="34" rx="4" fill="#f28c28"/></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

const title = 'NBA Standings 2026-27: East & West Table, Updated Daily';
const desc = 'The 2026-27 NBA standings for the East and West: wins, losses, games behind, home and road records, last 10 and streaks, updated every morning.';
const faqs = [
  ['How many teams make the NBA playoffs?', 'Sixteen. The top six teams in each conference qualify directly. Teams seeded 7 through 10 go to the play-in tournament, which decides the last two playoff spots in each conference.'],
  ['How does the NBA play-in tournament work?', 'The No. 7 seed hosts No. 8, and the winner earns the 7th seed. No. 9 hosts No. 10, and the loser is eliminated. The loser of the 7-8 game then hosts the winner of the 9-10 game for the 8th seed.'],
  ['Do NBA Cup games count in the standings?', 'Yes, except one. NBA Cup group-stage games, quarterfinals and semifinals all count in the regular-season standings. The Cup championship game does not.'],
  ['When does the 2026-27 NBA regular season end?', 'The regular season ends on April 11, 2027, after each team plays 82 games.'],
  ['How are ties broken in the NBA standings?', 'The NBA uses tiebreakers such as head-to-head record, division record and conference record. Our table orders tied teams by winning percentage and then total wins, so the official seed can differ when two teams have the same record.'],
];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const body = `
<div class="article-callout">
<span class="callout-label">STANDINGS THROUGH <span class="st-asof">—</span></span>
<p>The tables below show every team's record in the <strong>2026-27 NBA season</strong>, ordered by winning percentage. They update automatically every morning with the previous night's results. Seeds 1–6 go straight to the playoffs; 7–10 go to the play-in tournament.</p>
</div>
<p class="st-legend"><span class="st-key st-key-playoff"></span> Playoff spot (1–6) <span class="st-key st-key-playin"></span> Play-in (7–10) <span class="st-key st-key-out"></span> Outside (11–15)</p>

<!-- STANDINGS_START -->
<!-- STANDINGS_END -->
<p class="article-caption">W = wins, L = losses, Pct = winning percentage, GB = games behind the conference leader, L10 = record in the last 10 games, Strk = current streak. Results from the balldontlie NBA data API. Tied teams are ordered by winning percentage and then wins; official NBA tiebreakers can change the order.</p>

${H2('How the 2026-27 NBA Standings Work')}
<p>Each team plays 82 regular-season games, from opening night on October 20, 2026, to the final day on April 11, 2027. The standings are split by conference, and that's what decides the playoff field: 15 teams in the East, 15 in the West.</p>
<ul class="list-disc pl-lg space-y-2">
<li><strong>Seeds 1–6</strong> clinch a playoff spot outright.</li>
<li><strong>Seeds 7–10</strong> play in the play-in tournament for the final two spots in each conference.</li>
<li><strong>Seeds 11–15</strong> are eliminated and head to the draft lottery.</li>
<li><strong>NBA Cup games count</strong>, including the group stage, quarterfinals and semifinals. Only the Cup championship game is left out.</li>
</ul>
<p>Want to know who's actually playing well, not just who's winning? Check our ${int('/blog/nba-power-rankings-2026-27/', '2026-27 power rankings')}. For tonight's games, see the ${int('/nba-games/', 'NBA games grid')}, and for the full calendar, the ${int('/blog/nba-2026-27-schedule/', '2026-27 schedule guide')}.</p>

${H2('Last Season: 2025-26 Final Standings')}
<p>The Knicks finished as the No. 3 seed in the East last season and still won the title, beating the Spurs in the Finals. For how every team finished, see the ${int('/blog/nba-standings-2025-26/', 'final 2025-26 NBA standings')} and our ${int('/blog/nba-playoffs-2026-recap/', '2026 playoffs recap')}.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>`;

const tpl = fs.readFileSync(path.join(ROOT, 'blog/luka-doncic-weight/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/https:\/\/nba-grid\.com\/blog\/luka-doncic-weight\//g, URL)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/\/assets\/images\/luka-doncic-weight-chart\.jpg/g, IMG)
  .replace(/property="og:type" content="article"/, 'property="og:type" content="website"');
if (/luka/i.test(head)) throw new Error('template leftovers in head');
const ld = [
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: 'NBA Standings 2026-27', description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: PUB, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 } } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'NBA Standings', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">NBA STANDINGS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Standings</span>
<h1>NBA Standings 2026-27</h1>
<p class="article-dek">Every team's record in the Eastern and Western Conferences, with games behind, home and road splits, last 10 and streaks. Updated every morning.</p>
<div class="article-meta">
<span>By <a href="/author/davis-vance/" rel="author" class="hover:text-primary underline">Davis Vance</a></span>
<span>•</span>
<span class="byline-published">Published <time datetime="${PUB}">${PUB_H}</time></span>
<span>•</span>
<span class="byline-updated">Updated <time datetime="${PUB}">${PUB_H}</time></span>
</div>
</header>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="NBA standings 2026-27 title graphic" loading="eager" fetchpriority="high"/>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${body}
</div>
${authorBox}<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
`;
(async () => {
  await image();
  fs.mkdirSync(path.join(ROOT, 'nba-standings'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'nba-standings', 'index.html'), head + ld + '\n' + afterLd + main + footer);
  console.log('page shell written');
})();
