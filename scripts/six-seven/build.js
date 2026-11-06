// Builds /blog/6-7-nba-players/ and its chart from roster-6-7.txt (Basketball-Reference, pulled 2026-11-04).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-05', PUB_H = 'November 5, 2026', ASOF = new Date('2026-11-05T12:00:00');
const SLUG = '6-7-nba-players', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/6-7-nba-players-height-chart.jpg';
const TEAMS = {ATL:'Atlanta Hawks',BOS:'Boston Celtics',BRK:'Brooklyn Nets',CHO:'Charlotte Hornets',CHI:'Chicago Bulls',CLE:'Cleveland Cavaliers',DAL:'Dallas Mavericks',DEN:'Denver Nuggets',DET:'Detroit Pistons',GSW:'Golden State Warriors',HOU:'Houston Rockets',IND:'Indiana Pacers',LAC:'LA Clippers',LAL:'Los Angeles Lakers',MEM:'Memphis Grizzlies',MIA:'Miami Heat',MIL:'Milwaukee Bucks',MIN:'Minnesota Timberwolves',NOP:'New Orleans Pelicans',NYK:'New York Knicks',OKC:'Oklahoma City Thunder',ORL:'Orlando Magic',PHI:'Philadelphia 76ers',PHO:'Phoenix Suns',POR:'Portland Trail Blazers',SAC:'Sacramento Kings',SAS:'San Antonio Spurs',TOR:'Toronto Raptors',UTA:'Utah Jazz',WAS:'Washington Wizards'};
const lines = fs.readFileSync(path.join(__dirname, 'roster-6-7.txt'), 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#'));
const age = b => { const d = new Date(b); let a = ASOF.getFullYear() - d.getFullYear(); if (ASOF < new Date(ASOF.getFullYear(), d.getMonth(), d.getDate())) a--; return a; };
const P = lines.map(l => { const [name, team, pos, wt, birth, exp, id] = l.split('|'); return { name: name.replace('*', ''), tw: name.endsWith('*'), team, pos, wt, birth, exp, id, age: age(birth) }; });
if (P.length !== 61) throw new Error('expected 61 players, got ' + P.length);
const N = P.length, TOTAL = 526, TW = P.filter(p => p.tw).length;
const byTeam = {}; P.forEach(p => (byTeam[p.team] ||= []).push(p));
const zero = Object.keys(TEAMS).filter(t => !byTeam[t]).map(t => TEAMS[t]);
const maxTeam = Math.max(...Object.values(byTeam).map(a => a.length));
const topTeams = Object.keys(byTeam).filter(t => byTeam[t].length === maxTeam).map(t => TEAMS[t]);
const oldest = [...P].sort((a, b) => new Date(a.birth) - new Date(b.birth))[0];
const youngest = [...P].sort((a, b) => new Date(b.birth) - new Date(a.birth))[0];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const bref = (id, txt) => `<a href="https://www.basketball-reference.com/players/${id[0]}/${id}.html" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const list = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
const nameOf = n => { const p = P.find(x => x.name === n); if (!p) throw new Error('missing ' + n); return p; };
const pgs = P.filter(p => p.pos === 'PG'), sgs = P.filter(p => p.pos === 'SG');
console.log({ N, TW, maxTeam, topTeams, zero, oldest: oldest.name + ' ' + oldest.age, youngest: youngest.name + ' ' + youngest.age, pg: pgs.map(g => g.name), sg: sgs.map(g => g.name) });

// ---------- chart ----------
const dist = {71:2,72:9,73:16,74:28,75:26,76:52,77:57,78:56,79:61,80:53,81:52,82:35,83:37,84:22,85:12,86:4,87:2,88:1,89:0,90:1};
if (Object.values(dist).reduce((a, b) => a + b, 0) !== TOTAL || dist[79] !== N) throw new Error('distribution mismatch');
async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 90, R = 40, T = 170, B = 110, cw = W - L - R, ch = H - T - B;
  const ks = Object.keys(dist).map(Number), bw = cw / ks.length, ymax = 70;
  const y = v => T + ch - (v / ymax) * ch;
  const ft = k => `${Math.floor(k / 12)}'${k % 12}&quot;`;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="#fcfcfb">6'7&quot; is the NBA's most common height</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="#c9c4bf">Players by listed height on 2026-27 rosters (${TOTAL} players) · NBA GRID</text>`;
  for (const g of [20, 40, 60]) s += `<line x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}" stroke="#3a3836" stroke-width="1"/><text x="${L - 14}" y="${y(g) + 7}" text-anchor="end" ${F} font-size="20" fill="#8a847e">${g}</text>`;
  ks.forEach((k, i) => {
    const v = dist[k], x = L + i * bw + 2, w = bw - 4, top = y(v), hl = k === 79, r = Math.min(4, (T + ch - top) / 2);
    if (v > 0) s += `<path d="M${x},${T + ch} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${T + ch} Z" fill="${hl ? '#f28c28' : '#8a847e'}"/>`;
    if (hl) s += `<text x="${x + w / 2}" y="${top - 14}" text-anchor="middle" ${F} font-size="30" font-weight="700" fill="#fcfcfb">61</text>`;
    if (i % 2 === 0 || hl) s += `<text x="${x + w / 2}" y="${T + ch + 34}" text-anchor="middle" ${F} font-size="${hl ? 24 : 19}" font-weight="${hl ? 700 : 400}" fill="${hl ? '#fcfcfb' : '#8a847e'}">${ft(k)}</text>`;
  });
  s += `<line x1="${L}" x2="${W - R}" y1="${T + ch}" y2="${T + ch}" stroke="#8a847e" stroke-width="1.5"/>`;
  s += `<text x="${L}" y="${H - 28}" ${F} font-size="18" fill="#8a847e">Source: team rosters via Basketball-Reference, November 4, 2026. Includes two-way contracts.</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = "6'7 NBA Players: Every Active Player Listed at 6-7 (2026-27)";
const desc = `${N} NBA players are listed at 6'7" this season, more than any other height. See every one by team, the best 6'7" players ever, and where the 6-7 meme began.`;
const faqs = [
  [`Which NBA players are 6'7"?`, `${N} players on 2026-27 NBA rosters are listed at 6'7", including LaMelo Ball, OG Anunoby, Khris Middleton, Amen and Ausar Thompson, Dyson Daniels and Brandon Miller. ${TW} of the ${N} are on two-way contracts.`],
  [`Is 6'7" tall for an NBA player?`, `No. 6'7" is almost exactly average. It is the league's median height and its most common one this season: of ${TOTAL} rostered players, 246 are shorter and 219 are taller. The average listed height is about 6'6.8".`],
  [`Who is the best 6'7" NBA player of all time?`, `Julius Erving has the strongest case. Dr. J was an 11-time NBA All-Star, the 1981 NBA MVP, a three-time ABA MVP and won three titles (two ABA, one NBA). Rick Barry, Clyde Drexler and Paul Pierce are also Hall of Famers listed at 6'7".`],
  [`Are Kawhi Leonard and Jimmy Butler 6'7"?`, `Not on their current listings. Both have often been described as 6'7", but their 2026-27 roster listings show 6'6" (Leonard with Toronto, Butler with Golden State), so they are not in our list.`],
  [`What does "6-7" mean, and what does LaMelo Ball have to do with it?`, `"6-7" comes from the song "Doot Doot (6 7)" by Philadelphia rapper Skrilla. TikTok edits paired the song with highlights of LaMelo Ball, who is listed at 6'7", and the phrase spread from there. Dictionary.com named "67" its 2025 Word of the Year.`],
  [`What NBA player is 7'6"?`, `Tacko Fall, who is on a two-way contract with the Philadelphia 76ers, is listed at 7'6" on 2026-27 rosters, the tallest listing of any player attached to an NBA team this season.`],
];
const lastName = n => n.split(' ').slice(-1)[0];
const sorted = [...P].sort((a, b) => TEAMS[a.team].localeCompare(TEAMS[b.team]) || lastName(a.name).localeCompare(lastName(b.name)));
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const rows = sorted.map((p, i) => `<tr${tr(i, sorted.length)}><td class="py-2 pr-4"><strong>${esc(p.name)}</strong>${p.tw ? ' <span class="text-xs">(two-way)</span>' : ''}</td><td class="py-2 pr-4">${TEAMS[p.team]}</td><td class="py-2 pr-4">${p.pos}</td><td class="py-2 pr-4">${p.age}</td><td class="py-2">${p.exp === 'R' ? 'Rookie' : p.exp}</td></tr>`).join('\n');
const best = [
  ['Khris Middleton', '3× All-Star, 2021 NBA champion, 2020 Olympic gold'],
  ['LaMelo Ball', 'All-Star, 2020-21 Rookie of the Year'],
  ['OG Anunoby', '2× NBA champion, 2× All-Defensive, 2022-23 steals leader'],
  ['Dyson Daniels', '2024-25 Most Improved Player, 2× All-Defensive, 2024-25 steals leader'],
  ['Amen Thompson', '2024-25 All-Defensive, 2023-24 All-Rookie'],
  ['Ausar Thompson', '2025-26 All-Defensive, 2025-26 steals leader'],
  ['Harrison Barnes', '2015 NBA champion, 2016 Olympic gold'],
  ['Herbert Jones', '2023-24 All-Defensive, 2021-22 All-Rookie'],
  ['Jerami Grant', '2020 Olympic gold, 12 NBA seasons'],
  ['Dillon Brooks', '2022-23 All-Defensive'],
];
const bestRows = best.map(([n, h], i) => { const p = nameOf(n); return `<tr${tr(i, best.length)}><td class="py-2 pr-4">${i + 1}</td><td class="py-2 pr-4"><strong>${n}</strong></td><td class="py-2 pr-4">${TEAMS[p.team]}</td><td class="py-2">${h}</td></tr>`; }).join('\n');
const legends = [
  ['Julius Erving', '1971–1987', 'Hall of Fame (1993), 1981 NBA MVP, 3× ABA MVP, 11× NBA All-Star, 1983 NBA title'],
  ['Rick Barry', '1965–1980', 'Hall of Fame (1987), 1975 NBA champion and Finals MVP, 8× NBA All-Star, 1967 scoring title'],
  ['Clyde Drexler', '1983–1998', 'Hall of Fame (2004), 1995 NBA champion, 10× All-Star, 1992 Olympic gold'],
  ['Paul Pierce', '1998–2017', 'Hall of Fame (2021), 2008 NBA champion and Finals MVP, 10× All-Star'],
  ['Bernard King', '1977–1993', 'Hall of Fame (2013), 1985 scoring title, 4× All-Star, 2× All-NBA First Team'],
  ['Shawn Marion', '1999–2015', '2011 NBA champion, 4× All-Star, 2× All-NBA Third Team'],
];
const legRows = legends.map(([n, y, h], i) => `<tr${tr(i, legends.length)}><td class="py-2 pr-4"><strong>${n}</strong></td><td class="py-2 pr-4">${y}</td><td class="py-2">${h}</td></tr>`).join('\n');
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, body) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n<tbody class="text-on-surface-variant">\n${body}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const who = arr => list(arr.map(g => `<strong>${g.name}</strong> (${TEAMS[g.team]})`));
const teamSentence = topTeams.length === 1 ? `The ${topTeams[0]} have the most 6'7" players, with ${maxTeam}.` : `${list(topTeams)} lead the league with ${maxTeam} each.`;
const zeroSentence = zero.length ? ` ${list(zero)} ${zero.length === 1 ? 'is the only team' : 'are the only teams'} without a player listed at 6'7".` : ` All 30 teams have at least one.`;

const body = `
<div class="article-callout">
<span class="callout-label">QUICK ANSWER</span>
<p><strong>${N} players</strong> on 2026-27 NBA rosters are listed at <strong>6'7"</strong>, more than at any other height. The best known include <strong>LaMelo Ball</strong>, <strong>OG Anunoby</strong>, <strong>Khris Middleton</strong> and the <strong>Thompson twins</strong>. The greatest 6'7" player ever is <strong>Julius Erving</strong>.</p>
</div>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Bar chart of NBA players by listed height in 2026-27, with 6 foot 7 the tallest bar at 61 players" loading="eager" fetchpriority="high"/>
<p class="article-caption">6'7" is the peak of the league's height curve: ${N} of ${TOTAL} rostered players. Chart by NBA GRID from team rosters on Basketball-Reference.</p>

${H2(`6'7" Is the NBA's Most Common Height`)}
<p>We went through all 30 team rosters for the 2026-27 season (${TOTAL} players, two-way contracts included) and counted every listed height. No height shows up more often than 6'7": ${N} players, about ${Math.round(N / TOTAL * 100)}% of the league. The next most crowded spots are 6'5" (57 players) and 6'6" (56).</p>
<p>6'7" is also the league's median height. Line every rostered player up from shortest to tallest and the middle of the line is 6'7": 246 players are shorter and 219 are taller. The average works out to about 6'6.8". So if you are wondering whether 6'7" is tall for an NBA player, the honest answer is that it is the most typical size in the league. For the extremes, see our guides to the <a href="/blog/tallest-nba-player-right-now/" class="text-primary underline">tallest NBA player right now</a> and the <a href="/blog/shortest-nba-player/" class="text-primary underline">shortest NBA player</a>, or find out <a href="/blog/how-many-nba-players-are-there/" class="text-primary underline">how many NBA players there are</a> in total.</p>

${H2(`Every 6'7" NBA Player in 2026-27`)}
<p>Here is the full list, sorted by team. ${TW} of the ${N} players are on two-way contracts, which split time between the NBA team and its G League affiliate. ${teamSentence}${zeroSentence} The oldest is ${oldest.name} (${oldest.age}); the youngest is ${youngest.name} (${youngest.age}).</p>
${table(['Player', 'Team', 'Pos.', 'Age', 'NBA Seasons'], rows)}
<p class="article-caption">Heights as listed on 2026-27 team rosters via Basketball-Reference, checked November 4, 2026. Ages as of ${PUB_H}. "NBA Seasons" counts prior seasons of experience. Rosters change with trades and signings, so we will refresh this list during the season.</p>

${H2(`The Best 6'7" Players in the NBA Right Now`)}
<p>Ranking players is always partly opinion, so we kept this one to the record: the table orders the most decorated active 6'7" players by All-Star selections first, then championships and major awards. Every honor comes from the player's career page on Basketball-Reference or Wikipedia.</p>
${table(['#', 'Player', 'Team', 'Career Highlights'], bestRows)}
<p><strong>LaMelo Ball</strong> is the most famous name on the list, and not only because of the meme. He was the 2020-21 Rookie of the Year, has made an All-Star team and now plays for the Minnesota Timberwolves. <strong>Khris Middleton</strong>, now with the Washington Wizards, has the deepest résumé: three All-Star selections and a starring role on Milwaukee's 2021 championship team. The 6'7" group is also loaded with defenders. <strong>Dyson Daniels</strong>, <strong>OG Anunoby</strong> and <strong>Ausar Thompson</strong> have each led the league in steals, and Daniels won Most Improved Player in 2024-25. You can check any of these careers on Basketball-Reference, for example ${bref('ballla01', 'LaMelo Ball')} or ${bref('daniedy01', 'Dyson Daniels')}.</p>

${H2(`6'7" Point Guards and Shooting Guards`)}
<p>Most 6'7" players are wings and forwards, but a few run the backcourt. Listed as point guards: ${who(pgs)}. Listed as shooting guards: ${who(sgs)}. A 6'7" point guard can see over most defenses, which helps explain why Ball and Josh Giddey pass so well.</p>

${H2(`The Best 6'7" NBA Players of All Time`)}
<p>For the all-time list we used each player's listed height. That rules out some names you often see on these lists: Scottie Pippen, Tracy McGrady, Paul George and Grant Hill are all listed at 6'8". Kawhi Leonard and Jimmy Butler show up at 6'6" on their current rosters.</p>
${table(['Player', 'Career', 'Highlights'], legRows)}
<p class="article-caption">Listed heights and honors from each player's Wikipedia profile.</p>
<p><strong>Julius Erving</strong> sits at the top. Dr. J won three MVP awards in the ABA and the 1981 MVP in the NBA, made 11 NBA All-Star teams and won the 1983 title with Philadelphia. <strong>Rick Barry</strong> was the 1975 Finals MVP, and <strong>Paul Pierce</strong> earned the same award with Boston in 2008. <strong>Clyde Drexler</strong> won a ring with Houston in 1995 and gold with the 1992 Dream Team.</p>

${H2(`Why 6'7" Is a Meme Now: LaMelo Ball and "6-7"`)}
<p>If you have heard kids yelling "six-seven," this is why. The phrase comes from <strong>"Doot Doot (6 7)"</strong>, a song by Philadelphia rapper <strong>Skrilla</strong>, first released in December 2024 and officially released on February 7, 2025. TikTok users began setting the song's beat drop to highlight clips of <strong>LaMelo Ball</strong>, who is listed at 6'7", and the edits took off in 2025.</p>
<p>From there it became an all-purpose joke on TikTok and Instagram with no fixed meaning, and Skrilla himself has said the meaning is open. In October 2025, Dictionary.com named "67" its Word of the Year. For basketball fans the link is simple: 6'7" is LaMelo's height, and it is the most common height in the league.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li><a href="https://www.basketball-reference.com/leagues/NBA_2027.html" class="text-primary underline" rel="noopener" target="_blank">Basketball-Reference — 2026-27 NBA season and team rosters</a></li>
<li><a href="https://en.wikipedia.org/wiki/Julius_Erving" class="text-primary underline" rel="noopener" target="_blank">Wikipedia — Julius Erving</a> (plus the profiles of Barry, Drexler, Pierce, King, Marion, Middleton, Barnes and Grant)</li>
<li><a href="https://en.wikipedia.org/wiki/6-7" class="text-primary underline" rel="noopener" target="_blank">Wikipedia — 6-7 (meme)</a></li>
<li><a href="https://whyy.org/articles/meaning-6-7-skrilla-philadelphia/" class="text-primary underline" rel="noopener" target="_blank">WHYY — What "6-7" means and its Philadelphia roots</a></li>
<li><a href="https://bleacherreport.com/articles/25240758-how-nba-star-lamelo-ball-accidentally-sparked-tiktok-6-7-meme" class="text-primary underline" rel="noopener" target="_blank">Bleacher Report — How LaMelo Ball sparked the 6-7 meme</a></li>
</ul>`;

// ---------- assemble from the shortest-player template ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/shortest-nba-player/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/shortest-nba-player\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, a) => a + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, a) => a + title)
  .replace(/(property="og:description" content=")[^"]*/, (m, a) => a + q(desc))
  .replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="https://nba-grid.com${IMG}"/>\n<meta property="og:image:width" content="1280"/>\n<meta property="og:image:height" content="720"/>`);
if (head.includes('shortest')) throw new Error('template leftovers in head');
const ld = [
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: `Every 6'7" NBA Player in 2026-27`, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: PUB, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://nba-grid.com/nba-games/' }, { '@type': 'ListItem', position: 3, name: `6'7" NBA Players`, item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">6'7" NBA PLAYERS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Explainer</span>
<h1>Every 6'7" NBA Player in 2026-27</h1>
<p class="article-dek">6'7" is the most common height in the NBA this season. Here are all ${N} players listed at 6'7", the best of them now and ever, and how LaMelo Ball turned the number into a meme.</p>
<div class="article-meta">
<span>By <a href="/author/davis-vance/" rel="author" class="hover:text-primary underline">Davis Vance</a></span>
<span>•</span>
<span class="byline-published">Published <time datetime="${PUB}">${PUB_H}</time></span>
<span>•</span>
<span>${Math.max(1, Math.round(words / 230))} min read</span>
</div>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${body}
</div>
${authorBox}<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID</h2>
<div class="related-articles-grid grid grid-cols-1 md:grid-cols-3 gap-grid-gutter mb-lg">
<a href="../tallest-nba-player-right-now/">
<img width="1280" height="2096" src="/assets/images/tallest-player-hoop-closeup.jpg" alt="Tallest NBA Player Right Now" loading="lazy"/>
<div class="related-title">Tallest NBA Player Right Now</div>
</a>
<a href="../shortest-nba-player/">
<img width="1280" height="1600" src="/assets/images/outdoor-basketball-game.jpg" alt="Shortest NBA Player Right Now" loading="lazy"/>
<div class="related-title">Shortest NBA Player Right Now</div>
</a>
<a href="../how-many-nba-players-are-there/">
<img width="1280" height="853" src="/assets/images/nba-players-count.jpg" alt="How Many NBA Players Are There" loading="lazy"/>
<div class="related-title">How Many NBA Players Are There?</div>
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
