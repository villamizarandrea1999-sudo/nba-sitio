// Builds /blog/luka-doncic-injury/ (live injury status + history) and its games-played chart.
// Facts checked 2026-11-21: ESPN game log + Lakers schedule, HEAVY/Yahoo + USA Today + Bleacher Report (Nov 11 ankle),
// Lakers injury report Nov 19 (via HEAVY), AP via NBA.com (2026 hamstring), Athlon via Yahoo (Spain treatment),
// ESPN (2024 calf), NBA.com (2022 calf), Basketball-Reference game logs (games missed / played).
// ON EVERY NEW UPDATE: edit STATUS_AS_OF, statusRows, seasonRows/logRows, set UPDATED/UPDATED_H, rebuild.
// Never present an unofficial timeline as official. Never guess a diagnosis the team hasn't given.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-21', PUB_H = 'November 21, 2026';
const UPDATED = '2026-11-21', UPDATED_H = 'November 21, 2026';
const STATUS_AS_OF = 'Nov. 21, 2026';
const SLUG = 'luka-doncic-injury', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/luka-doncic-games-played-by-season.jpg';

// regular-season games played (Basketball-Reference); sched = games on the team schedule that season
const seasons = [
  { s: '2018-19', gp: 72, sched: 82 }, { s: '2019-20', gp: 61, sched: 75, note: 'COVID-shortened' },
  { s: '2020-21', gp: 66, sched: 72, note: '72-game season' }, { s: '2021-22', gp: 65, sched: 82 },
  { s: '2022-23', gp: 66, sched: 82 }, { s: '2023-24', gp: 70, sched: 82 },
  { s: '2024-25', gp: 50, sched: 82, note: 'calf strain, trade' }, { s: '2025-26', gp: 64, sched: 82, note: 'hamstring' },
];

async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 80, R = 60, T = 222, B = 600;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  const HI = '#f28c28', G = '#c9c4bf', M = '#8a847e', TX = '#fcfcfb', BG = '#2c2a29';
  const slot = (W - L - R) / seasons.length, bw = 96, scale = (B - T) / 82;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="${TX}">Luka Doncic: games played by season</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="${G}">Regular season, out of the games on his team's schedule · NBA GRID</text>`;
  s += `<rect x="${L}" y="146" width="18" height="18" rx="3" fill="${G}"/><text x="${L + 28}" y="162" ${F} font-size="20" fill="${TX}">Games played</text>`;
  s += `<rect x="${L + 190}" y="146" width="18" height="18" rx="3" fill="${BG}" stroke="${M}"/><text x="${L + 218}" y="162" ${F} font-size="20" fill="${TX}">Games on schedule</text>`;
  s += `<rect x="${L + 430}" y="146" width="18" height="18" rx="3" fill="${HI}"/><text x="${L + 458}" y="162" ${F} font-size="20" fill="${TX}">Fewest games (calf strain + trade)</text>`;
  seasons.forEach((d, i) => {
    const x = L + i * slot + (slot - bw) / 2, hs = d.sched * scale, hg = d.gp * scale, r = 4;
    const bar = (h, fill) => `<path d="M${x},${B} V${B - h + r} Q${x},${B - h} ${x + r},${B - h} H${x + bw - r} Q${x + bw},${B - h} ${x + bw},${B - h + r} V${B} Z" fill="${fill}"/>`;
    s += bar(hs, BG);
    s += bar(hg, d.s === '2024-25' ? HI : G);
    s += `<text x="${x + bw / 2}" y="${B - hg + 32}" text-anchor="middle" ${F} font-size="26" font-weight="700" fill="#1c1b1b">${d.gp}</text>`;
    s += `<text x="${x + bw / 2}" y="${B - hs - 10}" text-anchor="middle" ${F} font-size="17" fill="${M}">of ${d.sched}</text>`;
    s += `<text x="${x + bw / 2}" y="${B + 30}" text-anchor="middle" ${F} font-size="20" font-weight="700" fill="${TX}">${d.s}</text>`;
    if (d.note) s += `<text x="${x + bw / 2}" y="${B + 54}" text-anchor="middle" ${F} font-size="15" fill="${M}">${d.note}</text>`;
  });
  s += `<line x1="${L}" x2="${W - R}" y1="${B}" y2="${B}" stroke="${M}" stroke-width="1.5"/>`;
  s += `<text x="${L}" y="${H - 20}" ${F} font-size="17" fill="${M}">Source: Basketball-Reference. 2024-25 split between Dallas (22) and the Lakers (28).</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Luka Doncic Injury Update: Status, Ankle, Back & Injury History';
const h1 = 'Luka Doncic Injury Update: Is He Playing? Latest Status and Injury History';
const desc = 'Is Luka Doncic injured? Latest status after his Nov. 11 ankle sprain and back tightness, games missed this season, and his full injury history with the Lakers and Mavs.';
const faqs = [
  ['Is Luka Doncic injured right now?', 'No. As of November 21, 2026, Luka Doncic is healthy and not on the Lakers\' injury report. He has played five straight games since spraining his right ankle on November 11, including 43 points at Phoenix on November 15.'],
  ['Is Luka Doncic playing tonight?', 'The Lakers\' next game is Monday, November 23, 2026, at home against the Utah Jazz. Doncic was not on the team\'s most recent injury report, so he is expected to play unless the Lakers list him before the game. We update this page whenever his status changes.'],
  ['What happened to Luka Doncic\'s ankle?', 'Doncic rolled his right ankle with just over four minutes left in the Lakers\' 123-112 win at Milwaukee on November 11, 2026, landing on Kyle Kuzma\'s foot after a step-back jumper. He stayed in to shoot his free throw, then left the game. He said it was "painful a little bit" but that he would be fine, and he did not miss a game.'],
  ['What is wrong with Luka Doncic\'s back?', 'Doncic has missed two games this season with low back tightness: October 28 at the LA Clippers and November 8 at Detroit. He returned the next game both times.'],
  ['How many games has Luka Doncic missed this season?', 'Two of the Lakers\' first 17 games, both with back tightness. He has played 15 games through November 20, 2026.'],
  ['Why did Luka Doncic miss the 2026 playoffs?', 'Doncic suffered a Grade 2 strain of his left hamstring on April 2, 2026, at Oklahoma City. He missed the Lakers\' final 15 games, including all 10 playoff games. The Lakers beat Houston in the first round and were swept by Oklahoma City in the second round.'],
  ['Is Luka Doncic injury-prone?', 'He has never played fewer than 50 regular-season games in a season. His two longest absences came from strains in his left leg: a calf strain in December 2024 (22 games) and a hamstring strain in April 2026 (15 games, including the playoffs). He also strained his left calf in April 2022 and his left hamstring in February 2026.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n${heads ? `<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n` : ''}<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const statusRows = [
  ['<strong>Status</strong>', 'Healthy, active'],
  ['<strong>Lakers injury report</strong>', 'Not listed (report of Nov. 19)'],
  ['<strong>Last game</strong>', 'Nov. 20 vs. Sacramento: 25 points in 36 minutes, Lakers won 106-104'],
  ['<strong>Next game</strong>', 'Mon., Nov. 23 vs. Utah'],
  ['<strong>Most recent injury</strong>', 'Right ankle sprain, Nov. 11 at Milwaukee (missed no games)'],
  ['<strong>Games missed in 2026-27</strong>', '2 of 17 (low back tightness)'],
];
const thisSeason = [
  ['Oct. 28', 'at LA Clippers', 'Low back tightness', '<strong>Missed</strong>'],
  ['Nov. 8', 'at Detroit', 'Low back tightness', '<strong>Missed</strong>'],
  ['Nov. 11', 'at Milwaukee', 'Right ankle sprain (late 4th quarter)', 'Played 32 min, 32 pts'],
  ['Nov. 15', 'at Phoenix', 'Back from ankle sprain', 'Played, 43 pts'],
];
const history = [
  ['Apr. 2022', 'Left calf strain (regular-season finale vs. San Antonio)', 'First 3 games of the first round vs. Utah'],
  ['Dec. 25, 2024', 'Left calf strain vs. Minnesota', '22 straight games; traded to the Lakers while out, debuted Feb. 10, 2025'],
  ['Feb. 2026', 'Left hamstring strain', '4 games before the All-Star break'],
  ['Apr. 2, 2026', 'Left hamstring strain (Grade 2) at Oklahoma City', 'Final 15 games, including all 10 playoff games'],
  ['Oct.-Nov. 2026', 'Low back tightness', '2 games'],
  ['Nov. 11, 2026', 'Right ankle sprain at Milwaukee', 'None'],
];
const gpRows = seasons.map(d => [d.s, `${d.gp}`, `${d.sched}`, d.note || '']).reverse();

const body = `
<div class="article-callout">
<span class="callout-label">LATEST UPDATE · ${STATUS_AS_OF.toUpperCase()}</span>
<p><strong>Luka Doncic is not injured right now.</strong> He is off the Lakers' injury report and has played five straight games since spraining his right ankle at Milwaukee on Nov. 11, including 43 points at Phoenix four days later. He has missed two games this season, both with low back tightness. The Lakers' next game is <strong>Monday, Nov. 23, vs. Utah</strong>.</p>
</div>
${table(null, statusRows)}
<p class="article-caption">Luka Doncic injury status as of ${STATUS_AS_OF}. We update this page whenever the Lakers list him on an injury report.</p>

${H2('Is Luka Doncic Playing Tonight?')}
<p>Unless something changes, yes. Doncic was not on the Lakers' latest injury report, and he played 36 minutes in Friday's 106-104 win over Sacramento. The Lakers are 14-3 and next play Utah at home on Monday, Nov. 23. If he shows up on the report as questionable or out, we'll update the status box above.</p>

${H2('The Right Ankle Sprain at Milwaukee (Nov. 11)')}
<p>With the Lakers up big and just over four minutes left at Milwaukee, Doncic hit a step-back jumper over Kyle Kuzma and landed on Kuzma's foot. His right ankle rolled. He was fouled on the play, stayed in to take the free throw, then went to the locker room. He finished with 32 points, five rebounds and five assists in 32 minutes of a 123-112 win.</p>
<p>"I'm good, obviously it's painful a little bit but I'll be fine," Doncic said after the game. JJ Redick called it "just a light tweak." The next day, ESPN's Shams Charania reported that Doncic woke up without pain in the ankle. He wasn't on the injury report for the Phoenix game, and he scored 43 in a 131-123 win.</p>

${H2('Back Tightness: The Two Games He Has Missed')}
<p>Doncic's only absences this season have come from his back. He sat out Oct. 28 at the Clippers and Nov. 8 at Detroit with low back tightness, and both times he was back in the lineup the next game. The Lakers won both games without him. He has played 15 of the team's 17 games.</p>
${table(['Date', 'Game', 'Issue', 'Result'], thisSeason)}

${H2('The Hamstring Injury That Cost Him the 2026 Playoffs')}
<p>The injury that still shapes how people talk about Doncic's health came last season. On April 2, 2026, at Oklahoma City, he strained his left hamstring in the first half, was cleared to return, and lasted about four more minutes. The diagnosis was a Grade 2 strain of the left hamstring, per the AP. It was his second left hamstring strain of the season; he had already missed four games before the All-Star break.</p>
<p>He missed the Lakers' final 15 games, including all 10 in the playoffs. Reporting from Athlon said further evaluation in Spain found a deeper injury than the first MRI showed, and that he had platelet-rich plasma and stem cell treatment there. The Lakers upset Houston in the first round without him, then were swept by Oklahoma City. Doncic said in May that he had not been close to returning.</p>

${H2('Luka Doncic Injury History')}
${table(['When', 'Injury', 'Games missed'], history)}
<p class="article-caption">Games missed from Basketball-Reference game logs. Injuries as announced by the team or reported by ESPN, the AP and NBA.com.</p>
<p>His two longest absences came from strains in his left leg: the December 2024 calf strain (22 games) and the April 2026 hamstring strain (15). This season's back and ankle issues have cost him two games combined. His conditioning has been a running storyline, too; our breakdown of ${int('/blog/luka-doncic-weight/', 'Luka Doncic\'s weight')} covers his listed and reported weights by season.</p>

${H2('Games Played by Season')}
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Luka Doncic games played by season chart, from 72 in 2018-19 to 50 in 2024-25 and 64 in 2025-26, compared with the games on his team's schedule" loading="eager" fetchpriority="high"/>
<p class="article-caption">Regular-season games played vs. games on the schedule. Chart by NBA GRID.</p>
${table(['Season', 'Games played', 'Team games', 'Note'], gpRows)}
<p>He has never played fewer than 50 regular-season games, and he has missed more than 20 in a season only once in a full 82-game year, in 2024-25. That season was split between the Mavericks (22 games) and the Lakers (28) after the trade.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${ext('https://sports.yahoo.com/articles/lakers-major-luka-doncic-injury-232912355.html', 'HEAVY via Yahoo Sports — Doncic ankle update, Redick and Charania quotes (Nov. 12, 2026)')}</li>
<li>${ext('https://sports.yahoo.com/articles/luka-doncic-injury-know-lakers-033737079.html', 'USA Today via Yahoo Sports — what we know after Doncic rolls his ankle (Nov. 11, 2026)')}</li>
<li>${ext('https://bleacherreport.com/articles/25530960-luka-doncic-injury-update-latest-lakers-star-after-getting-hurt-kyle-kuzma-foul', 'Bleacher Report — Doncic hurt on Kuzma foul; back tightness absences')}</li>
<li>${ext('https://sports.yahoo.com/articles/lakers-luka-doncic-injury-news-032532753.html', 'HEAVY via Yahoo Sports — Doncic not on the injury report before Phoenix')}</li>
<li>${ext('https://www.nba.com/news/luka-doncic-out-for-remainder-of-regular-season-with-left-hamstring-strain', 'AP via NBA.com — Doncic out for the regular season with a left hamstring strain (Apr. 3, 2026)')}</li>
<li>${ext('https://www.nba.com/news/luka-doncic-was-not-close-to-returning-from-injury-playoffs', 'AP via NBA.com — Doncic says he wasn\'t close to returning (May 12, 2026)')}</li>
<li>${ext('https://sports.yahoo.com/articles/luka-doncics-injury-worse-expected-030544886.html', 'Athlon via Yahoo Sports — further evaluation in Spain, treatment')}</li>
<li>${ext('https://global.espn.com/nba/story/_/id/43177124/mavs-star-luka-doncic-calf-least-month-sources-say', 'ESPN — Doncic out at least a month with left calf strain (Dec. 2024)')}</li>
<li>${ext('https://www.nba.com/news/luka-doncic-calf-strain-to-miss-game-1-vs-jazz', 'NBA.com — Doncic to miss Game 1 vs. Jazz with calf strain (Apr. 2022)')}</li>
<li>${ext('https://www.basketball-reference.com/players/d/doncilu01.html', 'Basketball-Reference — Luka Doncic stats and game logs')} and ${ext('https://www.espn.com/nba/team/schedule/_/name/lal/los-angeles-lakers', 'ESPN Lakers schedule')}</li>
</ul>

<div class="article-callout">
<span class="callout-label">PLAY TODAY'S GRID</span>
<p>Know your Lakers? Test it on today's ${int('/blog/nba-immaculate-grid/#play', 'NBA GRID 3x3')}: name a player for every team, award and stat square.</p>
</div>`;

// ---------- assemble from the harper injury page (same layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/dylan-harper-injury/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/dylan-harper-injury\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/dylan-harper-injury-spurs-schedule\.jpg/g, IMG.split('/').pop());
if (/harper|spurs/i.test(head)) throw new Error('template leftovers in head');
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] };
const ld = [
  { '@context': 'https://schema.org', '@type': 'NewsArticle', inLanguage: 'en-US', headline: h1, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: UPDATED, mainEntityOfPage: URL, about: { '@type': 'Person', name: 'Luka Doncic', sameAs: 'https://www.basketball-reference.com/players/d/doncilu01.html' }, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Injuries', item: 'https://nba-grid.com/blog/injuries/' }, { '@type': 'ListItem', position: 3, name: 'Luka Doncic Injury Update', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const updatedSpan = UPDATED !== PUB ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${UPDATED}">${UPDATED_H}</time></span>` : '';
const card = (slug, t) => `<a href="../${slug}/">\n<img width="1280" height="720" src="IMG" alt="${t}" loading="lazy"/>\n<div class="related-title">${t}</div>\n</a>`;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><a href="/blog/injuries/" class="hover:text-primary transition-colors">INJURIES</a><span class="mx-1">/</span><span class="text-primary">LUKA DONCIC</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Injury</span>
<h1>${h1}</h1>
<p class="article-dek">Luka Doncic is healthy and playing. Here's his current status, what happened with his ankle and back this season, the hamstring injury that cost him the 2026 playoffs, and his full injury history, updated whenever his status changes.</p>
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
${card('luka-doncic-weight', 'How Much Does Luka Doncic Weigh in 2026?')}
${card('stephen-curry-update-today-warriors-injury', 'Stephen Curry Injury Update')}
${card('dylan-harper-injury', 'Dylan Harper Injury Update')}
</div>
<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
`;
let html = head + ld + '\n' + afterLd + main + footer;
for (const slug of ['luka-doncic-weight', 'stephen-curry-update-today-warriors-injury', 'dylan-harper-injury']) {
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
