// Builds /blog/stephen-curry-update-today-warriors-injury/ (live injury tracker) and its timeline image.
// Facts checked 2026-11-16: Warriors statement (via NBC Sports Bay Area / HEAVY), NBA.com injury report,
// ESPN scoreboard + Warriors schedule, Charania via HEAVY/Newsweek, Kerr via Viral Sports News.
// ON EVERY NEW UPDATE: edit STATUS + `log` (newest first) + `games`, set UPDATED/UPDATED_H, rebuild.
// Official timeline = re-evaluation date, never a return date. "About a month" is Charania's report.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-16', PUB_H = 'November 16, 2026';
const UPDATED = '2026-11-16', UPDATED_H = 'November 16, 2026';
const STATUS_AS_OF = 'Nov. 16, 2026, before Warriors at Pelicans';
const SLUG = 'stephen-curry-update-today-warriors-injury', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/stephen-curry-injury-timeline.jpg';

// Warriors games from the injury on (ESPN schedule, ET). r = result if played.
const games = [
  { d: 11, opp: '@ HOU', r: 'L 108-115', note: 'injured' },
  { d: 13, opp: '@ SA', r: 'L 85-123' },
  { d: 16, opp: '@ NO' }, { d: 18, opp: '@ DAL' }, { d: 19, opp: '@ MEM' },
  { d: 22, opp: 'vs BOS' }, { d: 25, opp: 'vs SAC' }, { d: 27, opp: '@ POR' },
  { d: 29, opp: 'vs LAC' }, { d: 31, opp: 'vs UTA' }, { d: 42, opp: '@ CLE' }, { d: 44, opp: '@ MEM' },
]; // d = day number counted from Nov 1 (Dec 1 = 31)

async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 80, R = 60, x0 = 10, x1 = 45;
  const X = d => L + (d - x0) / (x1 - x0) * (W - L - R);
  const F = 'font-family="Arial, Helvetica, sans-serif"', axisY = 430;
  const HI = '#f28c28', G = '#c9c4bf', M = '#8a847e', T = '#fcfcfb';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="${T}">Stephen Curry injury timeline</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="${G}">Warriors games since his oblique tear on Nov. 11, 2026 · NBA GRID</text>`;
  // reported "closer to one month" window: Nov 26 -> ~Dec 11
  s += `<rect x="${X(26)}" y="190" width="${X(41) - X(26)}" height="${axisY - 190}" fill="#2c2a29"/>`;
  s += `<text x="${X(26) + 14}" y="222" ${F} font-size="20" fill="${G}">Reported: out "closer to one month"</text>`;
  s += `<text x="${X(26) + 14}" y="248" ${F} font-size="18" fill="${M}">(ESPN's Shams Charania, not official)</text>`;
  s += `<line x1="${X(26)}" x2="${X(26)}" y1="190" y2="${axisY - 90}" stroke="${HI}" stroke-width="3"/><line x1="${X(26)}" x2="${X(26)}" y1="${axisY - 18}" y2="${axisY + 18}" stroke="${HI}" stroke-width="3"/>`;
  s += `<text x="${X(26) - 12}" y="222" text-anchor="end" ${F} font-size="22" font-weight="700" fill="${HI}">Official re-evaluation</text>`;
  s += `<text x="${X(26) - 12}" y="248" text-anchor="end" ${F} font-size="20" fill="${HI}">Nov. 26 (two weeks)</text>`;
  s += `<line x1="${L}" x2="${W - R}" y1="${axisY}" y2="${axisY}" stroke="${M}" stroke-width="1.5"/>`;
  games.forEach((g, i) => {
    const x = X(g.d), up = i % 2 === 0, played = !!g.r;
    s += `<circle cx="${x}" cy="${axisY}" r="9" fill="${played ? T : '#1c1b1b'}" stroke="${T}" stroke-width="2.5"/>`;
    const y1 = up ? axisY - 34 : axisY + 44, y2 = up ? axisY - 60 : axisY + 70;
    s += `<text x="${x}" y="${up ? y2 : y1}" text-anchor="middle" ${F} font-size="19" font-weight="700" fill="${T}">${g.opp}</text>`;
    const date = g.d > 30 ? `Dec ${g.d - 30}` : `Nov ${g.d}`;
    s += `<text x="${x}" y="${up ? y1 : y2}" text-anchor="middle" ${F} font-size="17" fill="${M}">${date}${g.r ? ' · ' + g.r : ''}</text>`;
  });
  s += `<circle cx="${L + 6}" cy="${H - 70}" r="8" fill="${T}"/><text x="${L + 22}" y="${H - 63}" ${F} font-size="18" fill="${G}">Played</text>`;
  s += `<circle cx="${L + 116}" cy="${H - 70}" r="8" fill="#1c1b1b" stroke="${T}" stroke-width="2.5"/><text x="${L + 132}" y="${H - 63}" ${F} font-size="18" fill="${G}">Upcoming</text>`;
  s += `<text x="${L}" y="${H - 26}" ${F} font-size="17" fill="${M}">Sources: Warriors statement (Nov. 12), ESPN schedule and scoreboard. No Warriors game Dec. 2-11.</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Stephen Curry Update Today: Warriors Star Out at Least 2 Weeks With Oblique Tear';
const h1 = 'Stephen Curry Update Today: Warriors Reveal Oblique Tear, Re-Evaluation Timeline';
const desc = 'Stephen Curry has an oblique abdominal tear and will be re-evaluated in two weeks. Here is the latest Warriors injury update and what it means for Golden State.';
const faqs = [
  ['What injury does Stephen Curry have?', 'Stephen Curry has an oblique abdominal tear, confirmed by an MRI on the night of November 11, 2026. The NBA injury report lists it as a right oblique tear.'],
  ['When did Stephen Curry get hurt?', 'Curry got hurt early in the first quarter of the Warriors\' 115-108 loss at Houston on November 11, 2026. He left the game with 6:25 remaining in the first quarter and did not return. He played six minutes and scored six points.'],
  ['How long will Stephen Curry be out?', 'Officially, the Warriors only said Curry will be re-evaluated in two weeks. ESPN\'s Shams Charania reported he is expected to be out closer to one month, and that the team is bracing for him to miss a double-digit number of games. Neither is an official return date.'],
  ['When will Stephen Curry be re-evaluated?', 'The two-week re-evaluation points to around November 26, 2026 (Thanksgiving). Steve Kerr said the team will not give interim updates before then.'],
  ['Is there an official return date for Stephen Curry?', 'No. The Warriors have not announced a return date. The re-evaluation in two weeks is a checkpoint, not a return.'],
  ['How many games will Stephen Curry miss?', 'By the schedule, at least six: the Nov. 13 game at San Antonio plus Nov. 16 at New Orleans, Nov. 18 at Dallas, Nov. 19 at Memphis, Nov. 22 vs. Boston and Nov. 25 vs. Sacramento, all before the re-evaluation. If he misses close to a month, that becomes nine games through Dec. 1, because the Warriors have no games from Dec. 2 to Dec. 11.'],
  ['How have the Warriors done without Stephen Curry?', 'In their first full game without him, the Warriors lost 123-85 at San Antonio in an NBA Cup game on November 13, falling to 8-5. Their eight-game winning streak had already ended in the Houston loss, the night Curry got hurt.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n${heads ? `<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n` : ''}<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const statusRows = [
  ['<strong>Status</strong>', 'Out'],
  ['<strong>Injury</strong>', 'Oblique abdominal tear (right side, per the NBA injury report)'],
  ['<strong>Injured</strong>', 'Nov. 11, 2026, at Houston (left with 6:25 left in the 1st quarter)'],
  ['<strong>Official timeline</strong>', 'Re-evaluated in two weeks (around Nov. 26)'],
  ['<strong>Reported timeline</strong>', 'Closer to one month, per ESPN\'s Shams Charania'],
  ['<strong>Return date</strong>', 'None announced'],
  ['<strong>Rehab</strong>', 'In San Francisco with Rick Celebrini, the Warriors\' director of sports medicine and performance'],
  ['<strong>Warriors record</strong>', '8-5 (0-1 in games he has missed)'],
];
const logRows = [
  ['Nov. 16', 'Listed out (right oblique tear) for tonight\'s game at New Orleans, 8 p.m. ET.'],
  ['Nov. 15', 'Steve Kerr: there will be no interim update before the two-week re-evaluation.'],
  ['Nov. 13', 'Curry flies back to San Francisco to start rehab. Warriors lose 123-85 at San Antonio.'],
  ['Nov. 12', 'Warriors announce the MRI result: oblique abdominal tear, re-evaluation in two weeks. Charania reports closer to a month.'],
  ['Nov. 11', 'Curry leaves the 115-108 loss at Houston in the first quarter and does not return.'],
];
const schedRows = [
  ['Fri, Nov. 13', 'at San Antonio (NBA Cup)', '<strong>L 85-123</strong>'],
  ['Mon, Nov. 16', 'at New Orleans', '8:00 p.m. ET'],
  ['Wed, Nov. 18', 'at Dallas', '8:00 p.m. ET'],
  ['Thu, Nov. 19', 'at Memphis', '8:00 p.m. ET'],
  ['Sun, Nov. 22', 'vs. Boston', '8:30 p.m. ET'],
  ['Wed, Nov. 25', 'vs. Sacramento', '10:00 p.m. ET'],
  ['<strong>Thu, Nov. 26</strong>', '<strong>Two-week re-evaluation</strong>', '—'],
  ['Fri, Nov. 27', 'at Portland', '9:30 p.m. ET'],
  ['Sun, Nov. 29', 'vs. LA Clippers', '8:30 p.m. ET'],
  ['Tue, Dec. 1', 'vs. Utah', '11:00 p.m. ET (NBC)'],
];

const body = `
<div class="article-callout">
<span class="callout-label">LATEST UPDATE · ${STATUS_AS_OF.toUpperCase()}</span>
<p><strong>Stephen Curry is out with an oblique abdominal tear</strong> he suffered in the first quarter at Houston on Nov. 11. An MRI confirmed the tear, and the Warriors say he will be <strong>re-evaluated in two weeks</strong>, around Nov. 26. There is <strong>no official return date</strong>. ESPN's Shams Charania reports Curry is expected to miss closer to a month.</p>
</div>
${table(null, statusRows)}
<p class="article-caption">Stephen Curry injury status as of ${STATUS_AS_OF}. We update this page after every Warriors injury report.</p>

${H2('What Happened to Stephen Curry')}
<p>Curry hit a 3-pointer early in the first quarter at Houston on Nov. 11, then grabbed at the right side of his abdomen. He went to the locker room at the Warriors' first timeout, with 6:25 left in the quarter, and never came back. He finished with six points in six minutes, and Golden State lost 115-108. That loss also ended the Warriors' eight-game winning streak.</p>
<p>The MRI came that night. On Nov. 12 the team announced the result: an oblique abdominal tear, with a re-evaluation in two weeks. Steve Kerr had said before the scan that his concern was "high." Afterward, he told 95.7 The Game it was "as good as we could've expected."</p>

${H2('How Long Will Curry Be Out?')}
<p>Read the official wording carefully. Two weeks is when the Warriors will <strong>re-evaluate</strong> Curry, not when he is due back. Kerr made that clear after practice on Nov. 15: "It means we have no idea right now. We'll tell you in two weeks."</p>
<p>The longer estimate comes from reporting, not the team. Charania said on ESPN that Curry is expected to be sidelined "closer to one month," and that the Warriors are bracing for him to miss a double-digit number of games.</p>
<p>The schedule puts those numbers in context. Curry will miss at least six games before the re-evaluation. If he's out about a month, the count is nine through Dec. 1, because Golden State has no games from Dec. 2 to Dec. 11. Double digits would mean he's still out at Cleveland on Dec. 12.</p>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Stephen Curry injury timeline: Warriors games from his Nov. 11 oblique tear through Dec. 14, with the official two-week re-evaluation on Nov. 26 and the reported one-month window" loading="eager" fetchpriority="high"/>
<p class="article-caption">The Warriors' schedule around Curry's injury. The re-evaluation is the only official date. Chart by NBA GRID.</p>

${H2('What It Means for the Warriors')}
<p>The first full game without Curry was ugly. San Antonio won 123-85 in an NBA Cup game on Nov. 13, with Stephon Castle scoring 32. LJ Cryer led Golden State with 20. Yaxel Lendeborg, who scored 25 with 10 rebounds the night Curry got hurt, went 1-of-13 for three points. The Warriors fell to 8-5.</p>
<p>Golden State is also without Jimmy Butler (ACL), Moses Moody, Kristaps Porzingis and Brandon Williams (hamstring), so there's little depth to lean on. Expect Lendeborg to keep the biggest scoring load. For more on where the team stood before the injury, see our ${int('/blog/nba-power-rankings-2026-27/', 'NBA power rankings')}.</p>

${H2('Curry Injury Timeline')}
${table(['Date', 'Update'], logRows)}

${H2('Warriors Games Until the Re-Evaluation and Beyond')}
${table(['Date', 'Game', 'Result / Tip-off'], schedRows)}
<p class="article-caption">Schedule from ESPN. Times ET.</p>
<p>Curry is signed through 2028-29 after his ${int('/blog/stephen-curry-warriors-extension/', '$116 million extension')} this fall, so Golden State has every reason to be patient. Fantasy managers can plan around the Warriors' light stretch with our ${int('/blog/nba-fantasy-schedule-grid/', 'fantasy schedule grid')}.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${ext('https://nbcsportsbayarea.com/nba/golden-state-warriors/steph-curry-oblique-abdominal-tear-injury-update/1979479', 'NBC Sports Bay Area — Warriors statement: oblique abdominal tear, re-evaluated in two weeks')}</li>
<li>${ext('https://sports.yahoo.com/articles/warriors-announce-official-stephen-curry-203906999.html', 'HEAVY via Yahoo Sports — full Warriors statement, Charania report, Kerr on 95.7 The Game')}</li>
<li>${ext('https://sports.yahoo.com/articles/warriors-stephen-curry-spurs-loss-141945987.html', 'HEAVY via Yahoo Sports — Curry returns to San Francisco to rehab with Rick Celebrini')}</li>
<li>${ext('https://www.newsweek.com/sports/nba/warriors-rocked-by-major-stephen-curry-injury-news-after-8-4-start-12707048', 'Newsweek — how the injury happened, Kerr\'s pre-MRI concern')}</li>
<li>${ext('https://www.yardbarker.com/nba/articles/warriors_share_extremely_blunt_stephen_curry_update/s1_17355_44566853', 'Viral Sports News via Yardbarker — Kerr after the Nov. 15 practice')}</li>
<li>${ext('https://www.nba.com/pelicans/news/pelicans-vs-warriors-injury-report-game-preview-11-16-2026', 'NBA.com — Warriors at Pelicans injury report, Nov. 16')}</li>
<li>${ext('https://www.espn.com/nba/scoreboard/_/date/20261113', 'ESPN — Spurs 123, Warriors 85 (Nov. 13)')} and ${ext('https://www.espn.com/nba/team/schedule/_/name/gs/golden-state-warriors', 'Warriors schedule')}</li>
</ul>

<div class="article-callout">
<span class="callout-label">PLAY TODAY'S GRID</span>
<p>Know your Warriors history? Test it on today's ${int('/blog/nba-immaculate-grid/#play', 'NBA GRID 3x3')}: name a player for every team, award and stat square.</p>
</div>`;

// ---------- assemble from the cavaliers-knicks page (same layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/cavaliers-vs-knicks/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/cavaliers-vs-knicks\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/cavaliers-vs-knicks-last-6-meetings\.jpg/g, IMG.split('/').pop());
if (/cavaliers|knicks/i.test(head)) throw new Error('template leftovers in head');
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] };
const ld = [
  { '@context': 'https://schema.org', '@type': 'NewsArticle', inLanguage: 'en-US', headline: h1, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: UPDATED, mainEntityOfPage: URL, about: { '@type': 'Person', name: 'Stephen Curry', sameAs: 'https://www.nba.com/player/201939/stephen-curry' }, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Injuries', item: 'https://nba-grid.com/blog/injuries/' }, { '@type': 'ListItem', position: 3, name: 'Stephen Curry Injury Update', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const updatedSpan = UPDATED !== PUB ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${UPDATED}">${UPDATED_H}</time></span>` : '';
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><a href="/blog/injuries/" class="hover:text-primary transition-colors">INJURIES</a><span class="mx-1">/</span><span class="text-primary">STEPHEN CURRY</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Injury</span>
<h1>${h1}</h1>
<p class="article-dek">Curry tore an abdominal oblique at Houston and will be re-evaluated in two weeks. Here's his current status, what the Warriors and reporters have said about a timeline, and the games he's set to miss, updated with every new report.</p>
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
<a href="../stephen-curry-warriors-extension/">
<img width="1280" height="853" src="/assets/images/curry-three-point-shot.jpg" alt="Stephen Curry's Warriors extension" loading="lazy"/>
<div class="related-title">Stephen Curry Signs 2-Year, $116M Extension With Warriors</div>
</a>
<a href="../nba-power-rankings-2026-27/">
<img width="1280" height="720" src="/assets/images/POWERIMG" alt="NBA power rankings 2026-27" loading="lazy"/>
<div class="related-title">NBA Power Rankings 2026-27</div>
</a>
<a href="../spurs-vs-knicks/">
<img width="1280" height="720" src="/assets/images/spurs-vs-knicks-last-8-meetings.jpg" alt="Spurs vs Knicks: last 8 meetings" loading="lazy"/>
<div class="related-title">Spurs vs Knicks: Christmas Day Finals Rematch</div>
</a>
</div>
<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
`;
// related-card images come from each target page's own hero
const heroOf = slug => { const h = fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8'); const m = h.match(/<img class="hero-image" src="([^"]+)" width="(\d+)" height="(\d+)"/); return m; };
let html = head + ld + '\n' + afterLd + main + footer;
for (const slug of ['stephen-curry-warriors-extension', 'nba-power-rankings-2026-27', 'spurs-vs-knicks']) {
  const m = heroOf(slug); if (!m) continue;
  html = html.replace(new RegExp(`(<a href="\\.\\./${slug}/">\\n<img )width="\\d+" height="\\d+" src="[^"]+"`), `$1width="${m[2]}" height="${m[3]}" src="${m[1]}"`);
}
(async () => {
  await chart();
  fs.mkdirSync(path.join(ROOT, 'blog', SLUG), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'blog', SLUG, 'index.html'), html);
  console.log('words', words, '| title', title.length, '| desc', desc.length);
})();
