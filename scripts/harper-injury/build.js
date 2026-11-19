// Builds /blog/dylan-harper-injury/ (live injury tracker) and its schedule timeline image.
// Facts checked 2026-11-18: ESPN story (Michael C. Wright) + ESPN scoreboard/AP note (left hip soreness, out vs LAC),
// DAZN (left groin, testing Wednesday), HEAVY via Yahoo (reporter timelines), ESPN Spurs schedule.
// ON EVERY NEW UPDATE: edit STATUS_AS_OF, statusRows, logRows (newest first), games, set UPDATED/UPDATED_H, rebuild.
// No official diagnosis yet: any recovery window is a reporter/analyst estimate and must be attributed.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-18', PUB_H = 'November 18, 2026';
const UPDATED = '2026-11-18', UPDATED_H = 'November 18, 2026';
const STATUS_AS_OF = 'Nov. 18, 2026';
const SLUG = 'dylan-harper-injury', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/dylan-harper-injury-spurs-schedule.jpg';

// Spurs games around the injury (ESPN schedule, ET). d = day counted from Nov 1 (Dec 1 = 31).
const games = [
  { d: 13, opp: 'vs GS', r: 'W 123-85' }, { d: 15, opp: '@ UTA', r: 'W 110-102' },
  { d: 17, opp: 'vs DET', r: 'L 93-105', hurt: true },
  { d: 19, opp: 'vs LAC', out: true }, { d: 21, opp: 'vs NO' }, { d: 23, opp: '@ SAC' }, { d: 25, opp: '@ POR' },
  { d: 27, opp: 'vs LAL' }, { d: 29, opp: 'vs BOS' }, { d: 30, opp: '@ MIL' }, { d: 33, opp: 'vs TOR' }, { d: 43, opp: 'vs LAC' },
];

async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 80, R = 70, x0 = 11.4, x1 = 44;
  const X = d => L + (d - x0) / (x1 - x0) * (W - L - R);
  const F = 'font-family="Arial, Helvetica, sans-serif"', axisY = 420;
  const HI = '#f28c28', G = '#c9c4bf', M = '#8a847e', T = '#fcfcfb';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="${T}">Dylan Harper injury: the Spurs' schedule</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="${G}">Hurt Nov. 17 vs. Detroit · ruled out Nov. 19 vs. the Clippers · NBA GRID</text>`;
  s += `<line x1="${L}" x2="${W - R}" y1="${axisY}" y2="${axisY}" stroke="${M}" stroke-width="1.5"/>`;
  // no-diagnosis note above the upcoming stretch
  s += `<text x="${X(21)}" y="230" ${F} font-size="22" font-weight="700" fill="${T}">No official diagnosis or return date yet</text>`;
  s += `<text x="${X(21)}" y="260" ${F} font-size="19" fill="${M}">Reported estimates range from a few days to six weeks</text>`;
  games.forEach((g, i) => {
    const x = X(g.d), up = i % 2 === 0, played = !!g.r, mark = g.hurt || g.out;
    s += `<circle cx="${x}" cy="${axisY}" r="${mark ? 11 : 9}" fill="${played ? (g.hurt ? HI : T) : '#1c1b1b'}" stroke="${mark ? HI : T}" stroke-width="${mark ? 3.5 : 2.5}"/>`;
    const y1 = up ? axisY - 34 : axisY + 44, y2 = up ? axisY - 60 : axisY + 70;
    s += `<text x="${x}" y="${up ? y2 : y1}" text-anchor="middle" ${F} font-size="19" font-weight="700" fill="${mark ? HI : T}">${g.opp}</text>`;
    const date = g.d > 30 ? `Dec ${g.d - 30}` : `Nov ${g.d}`;
    s += `<text x="${x}" y="${up ? y1 : y2}" text-anchor="middle" ${F} font-size="${g.r ? 15 : 17}" fill="${M}">${date}${g.r ? ' · ' + g.r : ''}</text>`;
    if (g.hurt) s += `<text x="${x}" y="${up ? axisY - 88 : axisY + 100}" text-anchor="middle" ${F} font-size="17" fill="${HI}">Harper hurt</text>`;
    if (g.out) s += `<text x="${x}" y="${up ? axisY - 88 : axisY + 100}" text-anchor="middle" ${F} font-size="17" fill="${HI}">Ruled out</text>`;
  });
  s += `<circle cx="${L + 6}" cy="${H - 70}" r="8" fill="${T}"/><text x="${L + 22}" y="${H - 63}" ${F} font-size="18" fill="${G}">Played</text>`;
  s += `<circle cx="${L + 116}" cy="${H - 70}" r="8" fill="#1c1b1b" stroke="${T}" stroke-width="2.5"/><text x="${L + 132}" y="${H - 63}" ${F} font-size="18" fill="${G}">Upcoming</text>`;
  s += `<text x="${L}" y="${H - 26}" ${F} font-size="17" fill="${M}">Sources: ESPN schedule and scoreboard, Spurs injury report (Nov. 18). No Spurs game Dec. 4-12.</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Dylan Harper Injury Update: Spurs Guard Out vs. Clippers After Slip';
const h1 = 'Dylan Harper Injury Update: Spurs Guard Ruled Out After Slipping vs. Pistons';
const desc = 'Dylan Harper slipped late in the Spurs\' loss to Detroit and is out Thursday vs. the Clippers with left hip soreness. Latest status, what happened and the timeline.';
const faqs = [
  ['What happened to Dylan Harper?', 'Harper slipped on what appeared to be a wet spot on the court with 53.6 seconds left in the Spurs\' 105-93 loss to the Detroit Pistons on November 17, 2026. He grabbed his left groin area and was helped to the locker room.'],
  ['What is Dylan Harper\'s injury?', 'The Spurs list it as left hip soreness. There is no official diagnosis yet. Early reports described a groin injury, and some analysts suspect an adductor (groin) strain, but the team has not confirmed that.'],
  ['Is Dylan Harper playing tonight?', 'Harper is ruled out for Thursday\'s game against the LA Clippers on November 19. His status for Saturday\'s home game against New Orleans has not been announced.'],
  ['How long will Dylan Harper be out?', 'The Spurs have not given a timeline. Spurs reporter Dusty Garza said a groin injury like this can mean anywhere from a few days to six weeks, depending on what an MRI shows. Treat any estimate as unofficial until the team updates his status.'],
  ['How good has Dylan Harper been this season?', 'Harper entered the Detroit game averaging 18.3 points, 5.5 rebounds and 4.7 assists in 14 games. He scored 20 points on 8-of-14 shooting before getting hurt, two days after a team-high 31 at Utah.'],
  ['Did the Spurs\' winning streak end?', 'Yes. The 105-93 loss to Detroit ended San Antonio\'s 12-game winning streak. The Spurs are 12-3.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n${heads ? `<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n` : ''}<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const statusRows = [
  ['<strong>Status</strong>', 'Out Thursday, Nov. 19, vs. LA Clippers'],
  ['<strong>Official injury</strong>', 'Left hip soreness'],
  ['<strong>Diagnosis</strong>', 'Not announced; further testing expected Wednesday, Nov. 18'],
  ['<strong>Injured</strong>', 'Nov. 17, 2026, vs. Detroit (slipped with 53.6 seconds left)'],
  ['<strong>Return date</strong>', 'None announced'],
  ['<strong>Next game</strong>', 'Sat., Nov. 21, vs. New Orleans (status not announced)'],
  ['<strong>Spurs record</strong>', '12-3'],
];
const logRows = [
  ['Nov. 18', 'Spurs rule Harper out for Thursday vs. the Clippers with left hip soreness. Further testing expected.'],
  ['Nov. 17', 'Harper slips with 53.6 seconds left in a 105-93 loss to Detroit and is helped to the locker room.'],
];
const schedRows = [
  ['Tue, Nov. 17', 'vs. Detroit', '<strong>L 93-105</strong> (Harper hurt)'],
  ['Thu, Nov. 19', 'vs. LA Clippers', '8:00 p.m. ET · <strong>Harper out</strong>'],
  ['Sat, Nov. 21', 'vs. New Orleans', '8:00 p.m. ET'],
  ['Mon, Nov. 23', 'at Sacramento', '10:00 p.m. ET'],
  ['Wed, Nov. 25', 'at Portland', '10:00 p.m. ET'],
  ['Fri, Nov. 27', 'vs. LA Lakers', '9:30 p.m. ET'],
  ['Sun, Nov. 29', 'vs. Boston', '4:00 p.m. ET'],
  ['Mon, Nov. 30', 'at Milwaukee', '8:00 p.m. ET'],
  ['Thu, Dec. 3', 'vs. Toronto', '8:00 p.m. ET'],
];

const body = `
<div class="article-callout">
<span class="callout-label">LATEST UPDATE · ${STATUS_AS_OF.toUpperCase()}</span>
<p><strong>Dylan Harper is out for Thursday's game against the Clippers</strong> with what the Spurs list as <strong>left hip soreness</strong>. He slipped with 53.6 seconds left in Tuesday's 105-93 loss to Detroit and was helped off the floor. There is <strong>no official diagnosis or return date</strong> yet, and further testing was expected Wednesday.</p>
</div>
${table(null, statusRows)}
<p class="article-caption">Dylan Harper injury status as of ${STATUS_AS_OF}. We update this page as soon as the Spurs announce test results or a new status.</p>

${H2('What Happened to Dylan Harper')}
<p>The game was all but over. With 53.6 seconds left and Detroit in control, Harper ran up the floor as Stephon Castle brought the ball up behind him. According to ESPN, Harper appeared to slip on a wet spot just as Castle threw a pass his way, and Ausar Thompson picked up the loose ball.</p>
<p>Harper's left foot went out from under him and he grabbed his left groin area right away. Keldon Johnson and David Jones Garcia helped him to the tunnel.</p>
<p>"It just looked like he slipped obviously," coach Mitch Johnson said after the game. "So, hoping for the best. But don't know anything yet." Victor Wembanyama called it "a terrible feeling, terrible sight."</p>

${H2('How Long Will Harper Be Out?')}
<p>Nobody outside the Spurs knows yet. The team's only official word is the hip soreness designation and the Thursday ruling. A diagnosis should come after the tests.</p>
<p>The estimates going around are just that. Spurs reporter Dusty Garza said a groin injury like this can cost anywhere from a few days to six weeks, depending on what the MRI shows. Others have floated a two-to-six-week range if it's a moderate adductor strain. None of those come from the team.</p>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Dylan Harper injury chart: the Spurs' schedule from his Nov. 17 slip against Detroit through Dec. 13, with the Nov. 19 game he was ruled out of highlighted" loading="eager" fetchpriority="high"/>
<p class="article-caption">The Spurs' schedule around Harper's injury. Thursday vs. the Clippers is the only game he has officially been ruled out of. Chart by NBA GRID.</p>

${H2('What It Means for the Spurs')}
<p>Harper has been one of San Antonio's main scorers next to Wembanyama. He entered Tuesday averaging 18.3 points, 5.5 rebounds and 4.7 assists in 14 games. He scored 20 on 8-of-14 shooting against Detroit, two nights after a team-high 31 at Utah.</p>
<p>Even before the slip, it was a rough night. Detroit ended the Spurs' 12-game winning streak, and Wembanyama's 25 points and 18 rebounds weren't enough. San Antonio is 12-3.</p>
<p>If Harper misses time, De'Aaron Fox and Castle take on more of the ball-handling, and HEAVY expects Julian Champagnie or Harrison Barnes to move into the starting lineup. For where the Spurs stood before the injury, see our ${int('/blog/nba-power-rankings-2026-27/', 'NBA power rankings')}.</p>

${H2('Harper Injury Timeline')}
${table(['Date', 'Update'], logRows)}

${H2('Spurs Schedule Without Harper')}
${table(['Date', 'Game', 'Result / Tip-off'], schedRows)}
<p class="article-caption">Schedule from ESPN. Times ET. After Dec. 3, the Spurs don't play again until Dec. 13 vs. the Clippers.</p>
<p>The biggest date on the calendar is Christmas Day, the Finals rematch at Madison Square Garden. Our ${int('/blog/spurs-vs-knicks/', 'Spurs vs Knicks preview')} has everything on that game. For another star on the mend, see our ${int('/blog/stephen-curry-update-today-warriors-injury/', 'Stephen Curry injury update')}.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${ext('https://www.espn.com/nba/story/_/id/50517203/spurs-dylan-harper-limps-pain-slip-court', 'ESPN — Spurs\' Dylan Harper limps off in pain after slip on court')} (Mitch Johnson and Wembanyama quotes)</li>
<li>${ext('https://www.espn.com/nba/scoreboard/_/date/20261117', 'ESPN — Pistons 105, Spurs 93 (Nov. 17)')}; AP game note: Harper out vs. the Clippers with left hip soreness</li>
<li>${ext('https://www.dazn.com/en-US/news/basketball/spurs-dylan-harper-groin-injury-update-pistons-loss/molt82v5dgiz16n0unh2965iy', 'DAZN — Spurs face anxious wait after Harper injury')} (testing Wednesday)</li>
<li>${ext('https://sports.yahoo.com/articles/spurs-dylan-harper-return-timeline-135649969.html', 'HEAVY via Yahoo Sports — reported return estimates and lineup options')}</li>
<li>${ext('https://www.espn.com/nba/team/schedule/_/name/sa/san-antonio-spurs', 'ESPN — San Antonio Spurs schedule')}</li>
</ul>

<div class="article-callout">
<span class="callout-label">PLAY TODAY'S GRID</span>
<p>Know your Spurs? Test it on today's ${int('/blog/nba-immaculate-grid/#play', 'NBA GRID 3x3')}: name a player for every team, award and stat square.</p>
</div>`;

// ---------- assemble from the curry injury page (same layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/stephen-curry-update-today-warriors-injury/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/stephen-curry-update-today-warriors-injury\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/stephen-curry-injury-timeline\.jpg/g, IMG.split('/').pop());
if (/curry|warriors/i.test(head)) throw new Error('template leftovers in head');
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] };
const ld = [
  { '@context': 'https://schema.org', '@type': 'NewsArticle', inLanguage: 'en-US', headline: h1, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: UPDATED, mainEntityOfPage: URL, about: { '@type': 'Person', name: 'Dylan Harper' }, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Injuries', item: 'https://nba-grid.com/blog/injuries/' }, { '@type': 'ListItem', position: 3, name: 'Dylan Harper Injury Update', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const updatedSpan = UPDATED !== PUB ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${UPDATED}">${UPDATED_H}</time></span>` : '';
const card = (slug, t) => `<a href="../${slug}/">\n<img width="1280" height="720" src="IMG" alt="${t}" loading="lazy"/>\n<div class="related-title">${t}</div>\n</a>`;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><a href="/blog/injuries/" class="hover:text-primary transition-colors">INJURIES</a><span class="mx-1">/</span><span class="text-primary">DYLAN HARPER</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Injury</span>
<h1>${h1}</h1>
<p class="article-dek">Harper slipped late in the loss that ended San Antonio's 12-game winning streak. Here's his current status, what the Spurs have said, the reported timelines and the games ahead, updated with every new report.</p>
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
${card('spurs-vs-knicks', 'Spurs vs Knicks: Christmas Day Finals Rematch')}
${card('stephen-curry-update-today-warriors-injury', 'Stephen Curry Injury Update')}
${card('nba-power-rankings-2026-27', 'NBA Power Rankings 2026-27')}
</div>
<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
`;
let html = head + ld + '\n' + afterLd + main + footer;
for (const slug of ['spurs-vs-knicks', 'stephen-curry-update-today-warriors-injury', 'nba-power-rankings-2026-27']) {
  const h = fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8');
  const m = h.match(/<img class="hero-image" src="([^"]+)" width="(\d+)" height="(\d+)"/);
  html = html.replace(new RegExp(`(<a href="\\.\\./${slug}/">\\n<img )width="\\d+" height="\\d+" src="IMG"`), `$1width="${m[2]}" height="${m[3]}" src="${m[1]}"`);
}
if (html.includes('src="IMG"')) throw new Error('related image not resolved');
(async () => {
  await chart();
  fs.mkdirSync(path.join(ROOT, 'blog', SLUG), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'blog', SLUG, 'index.html'), html);
  console.log('words', words, '| title', title.length, '| desc', desc.length);
})();
