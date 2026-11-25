// Builds /blog/top-5-shooting-guards-of-all-time/ and its All-NBA First Team chart.
// Facts checked 2026-11-24 on Basketball-Reference player pages (awards banner, career rows, All-NBA by season).
// Harden is active: his career line is "through Nov. 23, 2026" - refresh HARDEN + AS_OF a few times a season.
// SERP checked 2026-11-24 (US): Basketball-Reference blog (top 10, Oct 2025), Sportsdunia (top 5, Mar 2025), Sportskeeda (paginated).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-24', PUB_H = 'November 24, 2026';
const UPDATED = '2026-11-24', UPDATED_H = 'November 24, 2026';
const AS_OF = 'Nov. 23, 2026';
const SLUG = 'top-5-shooting-guards-of-all-time', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/shooting-guards-all-nba-first-team-chart.jpg';
const BR = id => `https://www.basketball-reference.com/players/${id[0]}/${id}.html`;

// Basketball-Reference career regular season + awards. f = All-NBA First Team, nba = All-NBA total
const P = [
  { r: 1, name: 'Michael Jordan', id: 'jordami01', yrs: '1984-2003', teams: 'Bulls, Wizards', g: 1072, ppg: 30.1, rpg: 6.2, apg: 5.3, ws: 214.0, rings: 6, mvp: 5, fmvp: 6, f: 10, nba: 11, as: 14 },
  { r: 2, name: 'Kobe Bryant', id: 'bryanko01', yrs: '1996-2016', teams: 'Lakers', g: 1346, ppg: 25.0, rpg: 5.2, apg: 4.7, ws: 172.7, rings: 5, mvp: 1, fmvp: 2, f: 11, nba: 15, as: 18 },
  { r: 3, name: 'Jerry West', id: 'westje01', yrs: '1960-1974', teams: 'Lakers', g: 932, ppg: 27.0, rpg: 5.8, apg: 6.7, ws: 162.6, rings: 1, mvp: 0, fmvp: 1, f: 10, nba: 12, as: 14 },
  { r: 4, name: 'Dwyane Wade', id: 'wadedw01', yrs: '2003-2019', teams: 'Heat, Bulls, Cavaliers', g: 1054, ppg: 22.0, rpg: 4.7, apg: 5.4, ws: 120.7, rings: 3, mvp: 0, fmvp: 1, f: 2, nba: 8, as: 13 },
  { r: 5, name: 'James Harden', id: 'hardeja01', yrs: '2009-present', teams: 'Thunder, Rockets, Nets, 76ers, Clippers, Cavaliers', g: 1238, ppg: 24.0, rpg: 5.6, apg: 7.3, ws: 183.7, rings: 0, mvp: 1, fmvp: 0, f: 6, nba: 8, as: 11 },
];
const HM = [
  { name: 'Allen Iverson', id: 'iversal01', g: 914, ppg: 26.7, rings: 0, mvp: 1, f: 3, nba: 7, as: 11 },
  { name: 'Clyde Drexler', id: 'drexlcl01', g: 1086, ppg: 20.4, rings: 1, mvp: 0, f: 1, nba: 5, as: 10 },
  { name: 'George Gervin', id: 'gervige01', g: 1060, ppg: 25.1, rings: 0, mvp: 0, f: 5, nba: 7, as: 12 },
  { name: 'Ray Allen', id: 'allenra02', g: 1300, ppg: 18.9, rings: 2, mvp: 0, f: 0, nba: 2, as: 10 },
  { name: 'Reggie Miller', id: 'millere01', g: 1389, ppg: 18.2, rings: 0, mvp: 0, f: 0, nba: 3, as: 5 },
];

async function chart() {
  const sharp = require('sharp');
  const all = [...P, ...HM].sort((a, b) => b.f - a.f || (a.r || 9) - (b.r || 9));
  const W = 1280, H = 720, L = 250, R = 90, T = 196, rowH = 44, bh = 28, max = 12;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  const HI = '#f28c28', G = '#c9c4bf', M = '#8a847e', TX = '#fcfcfb';
  const sx = v => (W - L - R) * v / max;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="60" y="72" ${F} font-size="38" font-weight="700" fill="${TX}">All-NBA First Team selections: the greatest shooting guards</text>`;
  s += `<text x="60" y="112" ${F} font-size="23" fill="${G}">NBA career totals · NBA GRID</text>`;
  s += `<rect x="60" y="136" width="18" height="18" rx="3" fill="${HI}"/><text x="88" y="152" ${F} font-size="20" fill="${TX}">Our top 5</text>`;
  s += `<rect x="210" y="136" width="18" height="18" rx="3" fill="${G}"/><text x="238" y="152" ${F} font-size="20" fill="${TX}">Honorable mentions</text>`;
  all.forEach((p, i) => {
    const y = T + i * rowH, w = Math.max(sx(p.f), 0), r = 4;
    s += `<text x="${L - 16}" y="${y + 21}" text-anchor="end" ${F} font-size="21" ${p.r ? 'font-weight="700" ' : ''}fill="${TX}">${p.r ? p.r + '. ' : ''}${p.name}</text>`;
    if (w > 0) s += `<path d="M${L},${y} H${L + w - r} Q${L + w},${y} ${L + w},${y + r} V${y + bh - r} Q${L + w},${y + bh} ${L + w - r},${y + bh} H${L} Z" fill="${p.r ? HI : G}"/>`;
    s += `<text x="${L + w + 12}" y="${y + 21}" ${F} font-size="21" font-weight="700" fill="${TX}">${p.f}</text>`;
  });
  s += `<line x1="${L}" x2="${L}" y1="${T - 8}" y2="${T + all.length * rowH - 8}" stroke="${M}" stroke-width="1.5"/>`;
  s += `<text x="60" y="${H - 22}" ${F} font-size="17" fill="${M}">Source: Basketball-Reference. NBA selections only (Gervin's ABA honors not counted). Harden through ${AS_OF}.</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Top 5 Shooting Guards of All Time: The NBA\'s Best SGs Ranked';
const h1 = 'Top 5 Shooting Guards of All Time in NBA History';
const desc = 'The top 5 shooting guards of all time: Michael Jordan, Kobe Bryant, Jerry West, Dwyane Wade and James Harden, ranked with career stats, titles, MVPs and All-NBA picks.';
const faqs = [
  ['Who are the top 5 shooting guards of all time?', 'Our ranking is Michael Jordan, Kobe Bryant, Jerry West, Dwyane Wade and James Harden. Allen Iverson, Clyde Drexler, George Gervin, Ray Allen and Reggie Miller round out the top 10.'],
  ['Who is the greatest shooting guard of all time?', 'Michael Jordan. He won six championships, six Finals MVPs, five regular-season MVPs and 10 scoring titles, and his 30.1 points per game is the highest career scoring average in NBA history.'],
  ['Is Kobe Bryant the second-best shooting guard ever?', 'Yes, in our ranking and in most others. Bryant won five titles, two Finals MVPs and the 2008 MVP, and made 15 All-NBA teams, 11 of them First Team. That is the most All-NBA First Team selections of any shooting guard.'],
  ['Is James Harden a shooting guard?', 'Basketball-Reference lists Harden as a point guard and shooting guard. He played shooting guard for most of his Houston years, when he won the 2018 MVP and three scoring titles, so we rank him here. If you count him as a point guard, Allen Iverson moves into the top 5.'],
  ['Who is the best shooting guard without a championship?', 'James Harden and Allen Iverson are the two MVPs on this list without a ring. Harden has more All-NBA First Team selections (six to three); Iverson has more scoring titles (four to three) and reached the 2001 Finals as the league MVP.'],
  ['Which shooting guard scored the most points?', 'Kobe Bryant, with 33,643 regular-season points, followed by Michael Jordan with 32,292. Bryant played 20 seasons; Jordan played 15.'],
  ['Why is Jerry West ranked above Dwyane Wade?', 'West made 10 All-NBA First Teams to Wade\'s two and averaged 27.0 points per game to Wade\'s 22.0. He won only one title in nine trips to the Finals, but he is still the only player to win Finals MVP on a losing team (1969). Wade has the edge in championships, three to one.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n${heads ? `<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n` : ''}<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const p = n => P.find(x => x.name === n);
const card = x => `<ul class="list-disc pl-lg space-y-1 text-on-surface-variant">
<li><strong>Career:</strong> ${x.yrs} · ${x.teams}</li>
<li><strong>Stats:</strong> ${x.ppg.toFixed(1)} points, ${x.rpg.toFixed(1)} rebounds, ${x.apg.toFixed(1)} assists per game in ${x.g.toLocaleString('en-US')} games</li>
<li><strong>Honors:</strong> ${x.rings ? `${x.rings}x champion` : 'no championship'}${x.fmvp ? `, ${x.fmvp}x Finals MVP` : ''}${x.mvp ? `, ${x.mvp}x MVP` : ''}, ${x.nba}x All-NBA (${x.f}x First Team), ${x.as}x All-Star</li>
</ul>`;

const quick = P.map(x => `<li><strong>${x.name}</strong> — ${x.rings ? `${x.rings} title${x.rings > 1 ? 's' : ''}` : 'MVP, 3 scoring titles'}${x.mvp > 1 ? `, ${x.mvp} MVPs` : x.mvp && x.rings ? ', 1 MVP' : ''}, ${x.f} All-NBA First Teams</li>`).join('\n');
const compare = P.map(x => [`<strong>${x.r}. ${x.name}</strong>`, x.ppg.toFixed(1), `${x.rings}`, `${x.mvp}`, `${x.fmvp}`, `${x.nba} (${x.f})`, `${x.as}`, x.ws.toFixed(1)]);
const hmRows = HM.map((x, i) => [`<strong>${i + 6}. ${x.name}</strong>`, x.ppg.toFixed(1), `${x.rings}`, `${x.mvp}`, `${x.nba} (${x.f})`, `${x.as}`]);

const body = `
<div class="article-callout">
<span class="callout-label">THE TOP 5 AT A GLANCE</span>
<ol class="list-decimal pl-lg space-y-1">
${quick}
</ol>
</div>
<p>Shooting guard is the NBA's most crowded position at the top. Michael Jordan is the clear No. 1, Kobe Bryant is the clear No. 2, and after that every list starts an argument. We ranked the greatest shooting guards of all time on four things you can check: peak (MVPs and All-NBA First Team selections), winning (championships and Finals MVPs), longevity (All-Star and All-NBA selections over a career) and production (scoring and Win Shares). Every number below comes from Basketball-Reference.</p>

${H2('Top 5 Shooting Guards of All Time: Career Comparison')}
${table(['Player', 'PPG', 'Titles', 'MVP', 'Finals MVP', 'All-NBA (1st)', 'All-Star', 'Win Shares'], compare)}
<p class="article-caption">Regular-season career stats from Basketball-Reference. James Harden is active; his numbers are through ${AS_OF}.</p>

${H2('1. Michael Jordan')}
${card(p('Michael Jordan'))}
<p>Jordan is the standard every guard is measured against. He won six championships with the Bulls in two three-peats (1991-93 and 1996-98) and was Finals MVP all six times. He won five regular-season MVPs and 10 scoring titles, and his 30.1 points per game is the highest career average in NBA history. In the playoffs he was even better, at 33.4 points per game over 179 games.</p>
<p>He was just as good on the other end. Jordan was the 1988 Defensive Player of the Year, made nine All-Defensive First Teams and led the league in steals three times. No other shooting guard has an MVP and a Defensive Player of the Year award, let alone in the same season.</p>

${H2('2. Kobe Bryant')}
${card(p('Kobe Bryant'))}
<p>Bryant has the longest résumé of any shooting guard. He spent all 20 seasons with the Lakers, won five championships (three with Shaquille O'Neal from 2000 to 2002, then two as the lead star in 2009 and 2010, with Finals MVP both times) and won the 2008 MVP. He made 18 All-Star teams and 15 All-NBA teams, and his 11 All-NBA First Team selections are the most of any shooting guard, one more than Jordan.</p>
<p>He also scored more than anyone at the position: 33,643 regular-season points, including his 81-point game against Toronto in January 2006. He made 12 All-Defensive teams, nine of them First Team. He was drafted 13th overall in the ${int('/blog/1996-nba-draft/', '1996 NBA Draft')} by Charlotte and traded to the Lakers for Vlade Divac.</p>

${H2('3. Jerry West')}
${card(p('Jerry West'))}
<p>West played before the three-point line and still averaged 27.0 points per game, along with 6.7 assists. He made 10 All-NBA First Teams, as many as Jordan, and 14 All-Star teams in 14 seasons. He led the league in scoring in 1970 and in assists in 1972, and Basketball-Reference lists him as both a point guard and a shooting guard.</p>
<p>His one weakness is the one that hurt him most: the Boston Celtics. West reached the Finals nine times with the Lakers and won only once, in 1972. In 1969 he was named Finals MVP even though the Lakers lost Game 7 to Boston, and he is still the only player to win the award on a losing team. He is also widely recognized as the player in the silhouette of the NBA logo.</p>

${H2('4. Dwyane Wade')}
${card(p('Dwyane Wade'))}
<p>Wade is the best winner on this list after Jordan and Bryant. He won the 2006 title in his third season, leading Miami back from 0-2 down against Dallas and winning Finals MVP. He added two more championships alongside LeBron James and Chris Bosh in 2012 and 2013. He won the 2009 scoring title, finished third in MVP voting that year and made 13 All-Star teams.</p>
<p>His case against Harden at No. 5 comes down to rings and playoff impact. Harden has more All-NBA First Team selections (six to two), a regular-season MVP and more career Win Shares, but Wade was the best player on a title team, and Harden has never won a championship. We think the 2006 run is worth more than the regular-season edge.</p>

${H2('5. James Harden')}
${card(p('James Harden'))}
<p>Harden's peak in Houston was one of the best offensive stretches by any guard. He won the 2018 MVP, three straight scoring titles from 2018 to 2020 and made six All-NBA First Teams. He has also won two assist titles, plus the 2012 Sixth Man of the Year award with Oklahoma City, and in November 2024 he passed Ray Allen for second place on the all-time three-pointers list, behind only Stephen Curry.</p>
<p>Two things keep him from ranking higher. He has no championship, and his best playoff runs ended short of the Finals after 2012. And his position is debatable: Basketball-Reference lists him as a point guard and shooting guard, and he has played mostly at the point since leaving Houston. He is still active, now with the Cleveland Cavaliers, so his career totals keep growing.</p>

${H2('All-NBA First Team Selections Compared')}
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Bar chart of All-NBA First Team selections for the greatest shooting guards: Kobe Bryant 11, Michael Jordan 10, Jerry West 10, James Harden 6, George Gervin 5, Allen Iverson 3, Dwyane Wade 2, Clyde Drexler 1, Ray Allen 0, Reggie Miller 0" loading="eager" fetchpriority="high"/>
<p class="article-caption">All-NBA First Team selections, NBA only. Chart by NBA GRID with Basketball-Reference data.</p>
<p>First Team selections are the best single measure of how long a player was among the league's very best. Bryant, Jordan and West are in a tier of their own with 10 or more. Wade's two are the fewest in our top 5, which is why his ranking rests on his championships and his 2006 Finals.</p>

${H2('Honorable Mentions: Shooting Guards 6-10')}
${table(['Player', 'PPG', 'Titles', 'MVP', 'All-NBA (1st)', 'All-Star'], hmRows)}
<p><strong>6. Allen Iverson</strong> won the 2001 MVP, four scoring titles and Rookie of the Year, and averaged 29.7 points per game in the playoffs. He carried the 76ers to the 2001 Finals. He was the first pick in the ${int('/blog/1996-nba-draft/', '1996 draft')}, the same class as Kobe Bryant and Ray Allen.</p>
<p><strong>7. Clyde Drexler</strong> finished second in MVP voting in 1992, reached two Finals with Portland and won the 1995 title with Houston. He made 10 All-Star teams.</p>
<p><strong>8. George Gervin</strong> won four NBA scoring titles and made five straight All-NBA First Teams from 1978 to 1982, plus two All-ABA teams. He never reached the Finals.</p>
<p><strong>9. Ray Allen</strong> was a 10-time All-Star and two-time champion who retired as the NBA's career leader in made threes. His corner three late in Game 6 of the 2013 Finals saved Miami's season.</p>
<p><strong>10. Reggie Miller</strong> spent all 18 seasons with Indiana, scored 25,279 points and averaged more in the playoffs (20.6) than in the regular season (18.2).</p>

${H2('How We Ranked Them')}
<p>We counted a player as a shooting guard if Basketball-Reference lists the position for him and he spent most of his peak there. That includes Jerry West and James Harden, who are also listed at point guard. Vince Carter and Tracy McGrady, who split their careers between guard and forward, just miss our top 10. Then we weighed peak, winning, longevity and production. No formula decides the order, but every claim in this ranking is a number you can look up. Want to test how well you know these players? Try today's ${int('/blog/nba-immaculate-grid/#play', 'NBA GRID 3x3')}.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
${[...P, ...HM].map(x => `<li>${ext(BR(x.id), `Basketball-Reference — ${x.name} stats, awards and All-NBA selections`)}</li>`).join('\n')}
<li>${ext('https://www.nba.com/news/james-harden-passes-ray-allen-made-3-pointers-list', 'NBA.com — Harden passes Ray Allen for No. 2 on the career 3-pointers list (Nov. 2024)')}</li>
<li>${ext('https://www.basketball-reference.com/leaders/pts_per_g_career.html', 'Basketball-Reference — career leaders, points per game')}</li>
</ul>`;

// ---------- assemble from the luka weight page (same Article layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/luka-doncic-weight/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/luka-doncic-weight\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(name="twitter:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(name="twitter:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/luka-doncic-weight-chart\.jpg/g, IMG.split('/').pop());
if (/luka|doncic|weigh/i.test(head)) throw new Error('template leftovers in head: ' + head.match(/.*(luka|doncic|weigh).*/i)[0]);
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] };
const ld = [
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: h1, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: UPDATED, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Top 5 shooting guards of all time', itemListOrder: 'https://schema.org/ItemListOrderAscending', numberOfItems: P.length, itemListElement: P.map(x => ({ '@type': 'ListItem', position: x.r, item: { '@type': 'Person', name: x.name, sameAs: BR(x.id) } })) },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://nba-grid.com/nba-games/' }, { '@type': 'ListItem', position: 3, name: 'Top 5 Shooting Guards of All Time', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const updatedSpan = UPDATED !== PUB ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${UPDATED}">${UPDATED_H}</time></span>` : '';
const related = [['1996-nba-draft', '1996 NBA Draft: The Greatest Class In League History'], ['kobe-nba-logo', 'Kobe NBA Logo Campaign: What It Is & Its Status'], ['6-7-nba-players', 'Every 6\'7" NBA Player in 2026-27']];
const rcard = (slug, t) => `<a href="../${slug}/">\n<img width="1280" height="720" src="IMG" alt="${q(t)}" loading="lazy"/>\n<div class="related-title">${esc(t)}</div>\n</a>`;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">TOP 5 SHOOTING GUARDS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Rankings</span>
<h1>${h1}</h1>
<p class="article-dek">Jordan and Kobe are the easy part. Here's our full top 5, from Jerry West to James Harden, with the stats, titles and All-NBA selections behind every spot, plus five honorable mentions.</p>
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
${related.map(([s, t]) => rcard(s, t)).join('\n')}
</div>
<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
`;
let html = head + ld + '\n' + afterLd + main + footer;
for (const [slug] of related) {
  const h = fs.readFileSync(path.join(ROOT, 'blog', slug, 'index.html'), 'utf8');
  const m = h.match(/<img class="hero-image" src="([^"]+)" width="(\d+)" height="(\d+)"/) || h.match(/<img class="hero-image"[^>]*?src="([^"]+)"[^>]*?width="(\d+)" height="(\d+)"/);
  if (!m) throw new Error('no hero image in ' + slug);
  html = html.replace(new RegExp(`(<a href="\\.\\./${slug}/">\\n<img )width="\\d+" height="\\d+" src="IMG"`), `$1width="${m[2]}" height="${m[3]}" src="${m[1]}"`);
}
if (html.includes('src="IMG"')) throw new Error('related image not resolved');
(async () => {
  await chart();
  fs.mkdirSync(path.join(ROOT, 'blog', SLUG), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'blog', SLUG, 'index.html'), html);
  console.log('words', words, '| title', title.length, '| desc', desc.length);
})();
