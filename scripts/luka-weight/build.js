// Builds /blog/luka-doncic-weight/ and its chart. Facts checked 2026-11-07 (see Sources section).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-08', PUB_H = 'November 8, 2026';
const SLUG = 'luka-doncic-weight', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/luka-doncic-weight-chart.jpg';
const kg = lb => (lb * 0.45359237).toFixed(1);

// ---------- chart ----------
const bars = [
  { lab: '2018', sub: 'rookie listing', v: 218 },
  { lab: '2020', sub: 'camp (reported)', v: 260, plus: true },
  { lab: '2021', sub: 'camp (reported)', v: 260, plus: true },
  { lab: '2025', sub: 'Lakers camp', v: 244 },
  { lab: '2026', sub: 'Lakers camp', v: 242, hl: true },
];
async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 90, R = 60, T = 190, B = 130, cw = W - L - R, ch = H - T - B;
  const ymax = 300, y = v => T + ch - (v / ymax) * ch, slot = cw / bars.length, bw = 120;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="${L}" y="78" ${F} font-size="46" font-weight="700" fill="#fcfcfb">Luka Doncic's weight, 2018 to 2026</text>`;
  s += `<text x="${L}" y="122" ${F} font-size="24" fill="#c9c4bf">Pounds · dashed line = official NBA listing (230) · NBA GRID</text>`;
  for (const g of [100, 200]) s += `<line x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}" stroke="#3a3836" stroke-width="1"/><text x="${L - 14}" y="${y(g) + 7}" text-anchor="end" ${F} font-size="20" fill="#8a847e">${g}</text>`;
  bars.forEach((b, i) => {
    const x = L + i * slot + (slot - bw) / 2, top = y(b.v), r = 4;
    s += `<path d="M${x},${T + ch} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${T + ch} Z" fill="${b.hl ? '#f28c28' : '#8a847e'}"${b.plus ? ' fill-opacity="0.55"' : ''}/>`;
    const inside = b.v < 230 && Math.abs(top - 14 - y(230)) < 36;
    s += `<text x="${x + bw / 2}" y="${inside ? top + 44 : top - 14}" text-anchor="middle" ${F} font-size="30" font-weight="700" fill="${inside ? '#1c1b1b' : '#fcfcfb'}">${b.v}${b.plus ? '+' : ''}</text>`;
    s += `<text x="${x + bw / 2}" y="${T + ch + 34}" text-anchor="middle" ${F} font-size="24" font-weight="700" fill="${b.hl ? '#fcfcfb' : '#c9c4bf'}">${b.lab}</text>`;
    s += `<text x="${x + bw / 2}" y="${T + ch + 62}" text-anchor="middle" ${F} font-size="18" fill="#8a847e">${b.sub}</text>`;
  });
  // official listing reference line
  s += `<line x1="${L}" x2="${W - R}" y1="${y(230)}" y2="${y(230)}" stroke="#fcfcfb" stroke-width="2" stroke-dasharray="8 6"/>`;
  s += `<text x="${L - 14}" y="${y(230) + 7}" text-anchor="end" ${F} font-size="20" font-weight="700" fill="#fcfcfb">230</text>`;
  s += `<line x1="${L}" x2="${W - R}" y1="${T + ch}" y2="${T + ch}" stroke="#8a847e" stroke-width="1.5"/>`;
  s += `<text x="${L}" y="${H - 26}" ${F} font-size="18" fill="#8a847e">Sources: Dallas Mavericks (2018), ESPN (2020-21 camps, "more than 260"), The Athletic via Larry Brown Sports (2025-26 camps).</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Luka Doncic Weight: Official 230 lbs vs. 242 at Lakers Camp';
const desc = 'Luka Doncic is listed at 230 pounds, but the Lakers had him at 242 in camp. His weight every year since 2018, his heaviest, and how he slimmed down.';
const faqs = [
  ['How much does Luka Doncic weigh?', `Luka Doncic is officially listed at 230 pounds (104 kg) on NBA.com for the 2026-27 season. The Lakers' training-camp listing in October 2026 was heavier: 242 pounds (${kg(242)} kg), according to Jovan Buha of The Athletic.`],
  ["What was Luka Doncic's heaviest weight?", 'The heaviest figure on record is "more than 260 pounds." ESPN reported in December 2021 that Doncic showed up to Dallas Mavericks training camp above 260 pounds in both 2020 and 2021, while his listed weight was 230.'],
  ['How much weight did Luka Doncic lose?', "There's no official number. The Lakers never published one and neither did Doncic. What we do know: his camp weight went from a reported 260-plus in 2020 and 2021 to 244 in 2025 and 242 in 2026. Viral claims of a 30- or 40-pound loss compare that old 260 report with his 230 listing, which isn't a real measurement."],
  ['How did Luka Doncic lose weight?', 'In the 2025 offseason he took about a month off from basketball, worked in the weight room first, and followed a gluten-free, low-sugar diet with at least 250 grams of protein a day, according to his Men\'s Health cover story. ESPN\'s write-up also mentions intermittent fasting.'],
  ['Is Luka Doncic 6\'6" or 6\'8"?', 'It depends on which listing you look at. The Mavericks had him at 6\'7" as a rookie, and most outlets used 6\'6" in 2025. NBA.com and Basketball-Reference currently list him at 6\'8" (2.03 m).'],
  ['How much did Luka Doncic weigh as a rookie?', `The Dallas Mavericks listed him at 6'7" and 218 pounds (${kg(218)} kg) when he signed in July 2018, and kept that listing through his Rookie of the Year season.`],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const timeline = [
  ['July 2018', '218 lb (98.9 kg)', 'Mavericks listing when he signed his rookie deal (6\'7")'],
  ['2020 training camp', 'More than 260 lb', 'Reported by ESPN, citing sources'],
  ['2021 training camp', 'More than 260 lb', 'Reported by ESPN ("for the second consecutive year")'],
  ['2021–2025', '230 lb (104 kg)', 'Official listed weight with Dallas'],
  ['2025 training camp', `244 lb (${kg(244)} kg)`, 'Lakers training-camp listing'],
  ['2026 training camp', `242 lb (${kg(242)} kg)`, 'Lakers training-camp listing, per The Athletic'],
  ['Now (2026-27)', '230 lb (104 kg)', 'NBA.com and Basketball-Reference'],
];
const tlRows = timeline.map(([a, b, c], i) => `<tr${tr(i, timeline.length)}><td class="py-2 pr-4"><strong>${a}</strong></td><td class="py-2 pr-4">${b}</td><td class="py-2">${c}</td></tr>`).join('\n');
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, body) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n<tbody class="text-on-surface-variant">\n${body}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const a = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const body = `
<div class="article-callout">
<span class="callout-label">QUICK ANSWER</span>
<p>Luka Doncic's official weight is <strong>230 pounds (104 kg)</strong>, per NBA.com. When the Lakers opened training camp in October 2026, though, he was listed at <strong>242 pounds</strong>, two less than the 244 he came in at in 2025. His heaviest reported weight was <strong>more than 260 pounds</strong>, at Dallas Mavericks camps in 2020 and 2021.</p>
</div>
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Bar chart of Luka Doncic's weight from 2018 to 2026: 218 as a rookie, over 260 at 2020 and 2021 camps, 244 in 2025 and 242 in 2026" loading="eager" fetchpriority="high"/>
<p class="article-caption">The dashed line is his official 230-pound listing. The 2020 and 2021 bars are reported minimums ("more than 260"), not exact weigh-ins. Chart by NBA GRID.</p>

${H2('Why Does Luka Have Two Different Weights?')}
<p>Search for Luka's weight and you'll see 230 in one place and 242 in another. Both are real. They just come from different lists.</p>
<p><strong>230 pounds</strong> is the number on his ${a('https://www.nba.com/player/1629029/luka-doncic', 'NBA.com player page')} and on ${a('https://www.basketball-reference.com/players/d/doncilu01.html', 'Basketball-Reference')}. It's the same figure he was listed at for most of his Dallas years, and it barely moves from season to season.</p>
<p><strong>242 pounds</strong> is what the Lakers put on their training-camp roster this fall, as Jovan Buha of The Athletic reported in mid-October 2026. A year earlier, the camp roster said 244. Camp listings get updated each preseason, so they're the closer thing to a current weigh-in. If you want to know what Luka actually weighs right now, 242 is the better answer.</p>

${H2('Luka Doncic Weight by Year')}
<p>Here's every weight I could tie to a named source, from the day he signed with Dallas to this season.</p>
${table(['When', 'Weight', 'Source'], tlRows)}
<p class="article-caption">Kilograms converted from pounds. "More than 260" figures were reported by ESPN from team sources; the Mavericks never published them.</p>
<p>The rookie number is the one people forget. When Dallas signed him in July 2018, the team listed him at 6'7" and 218 pounds. That's 12 pounds lighter than the 230 he'd carry on paper for years afterward, and 24 lighter than his 2026 camp weight. Part of that is just a 19-year-old filling out. He'll turn 28 in February.</p>

${H2("Luka's Heaviest Weight: More Than 260 Pounds")}
<p>In December 2021, ESPN's Tim MacMahon reported that Doncic had come into training camp weighing more than 260 pounds, and that it was the second year in a row. His listed weight at the time was 230. That gap of 30-plus pounds is where most of the "Luka is out of shape" talk started.</p>
<p>Luka didn't really dodge it. After a loss to Brooklyn that month, he admitted his conditioning wasn't where it needed to be. "I know I've got to do better," he said. He also blamed a long summer: he had played for Slovenia at the Tokyo Olympics right after the 2021 playoffs.</p>
<p>The weight question followed him for the rest of his time in Dallas. When the Mavericks traded him to the Lakers in February 2025, reports said the team pointed to his conditioning and work habits as part of the reason. A calf injury had also limited him to 50 games that season.</p>

${H2('How Luka Doncic Lost Weight')}
<p>The turnaround came in the 2025 offseason, his first full summer as a Laker. In July 2025 he was on the cover of <em>Men's Health</em>, and the photos showed a much leaner player. Here's what the magazine and the follow-up reporting said he changed:</p>
<ul class="list-disc pl-lg space-y-2">
<li><strong>A month with no basketball.</strong> His physiotherapist, Javier Barrio, said Luka didn't go back to shooting work until June. He spent the early weeks in the weight room instead.</li>
<li><strong>A gluten-free, low-sugar diet.</strong> He cut back on gluten and sugar and aimed for at least 250 grams of protein a day.</li>
<li><strong>Intermittent fasting.</strong> ESPN's summary of the story lists it as part of the plan.</li>
<li><strong>The same small team.</strong> According to The Athletic, trainer Anže Maček and Barrio had been working with him since 2023.</li>
</ul>
<p>One thing to be careful with: nobody ever published how many pounds he lost. You'll see "30 pounds" and "40 pounds" all over Instagram and TikTok. Those numbers come from comparing the old "260-plus" report with his 230 listing. That's not a before-and-after weigh-in. The only like-for-like comparison is camp to camp: 244 in 2025, 242 in 2026. Two pounds doesn't sound like much. The big drop happened between those 2021 reports and the 2025 camp.</p>

${H2('Did the Weight Loss Help?')}
<p>On the court, the numbers say yes. In 2025-26 he led the NBA at <strong>33.5 points per game</strong> and played 64 games, more than the year before. The season didn't end well, though. A serious hamstring strain in early April knocked him out of the entire postseason.</p>
<p>This season has started even hotter. Through his first nine games of 2026-27 he's averaging <strong>40.1 points</strong>, per Basketball-Reference (as of November 7, 2026). With LeBron James gone to Philadelphia, the Lakers are fully Luka's team now. If you're curious how that team got so valuable off the court too, see how the ${'<a href="/blog/lakers-sold-12-5-billion/" class="text-primary underline">Lakers sold for $12.5 billion</a>'}.</p>

${H2('Luka Doncic Height: 6\'6", 6\'7" or 6\'8"?')}
<p>His height is almost as confusing as his weight. Dallas listed him at 6'7" when he was drafted, which happens to be the <a href="/blog/6-7-nba-players/" class="text-primary underline">most common height in the NBA</a>. In 2025, most outlets had him at 6'6". Today NBA.com and Basketball-Reference both say <strong>6'8" (2.03 m)</strong>. The man didn't grow two inches at 26. Listings just change, and teams don't always explain why.</p>
<p>At 6'8" and 230 pounds, Luka is built more like a forward than a point guard, and NBA.com now lists him as a forward-guard. Want to see how he compares with the extremes? Check out the <a href="/blog/tallest-nba-player-right-now/" class="text-primary underline">tallest NBA player right now</a>.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, ans]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(ans)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${a('https://www.nba.com/player/1629029/luka-doncic', 'NBA.com — Luka Dončić player profile')} (height, weight, 2026-27 stats)</li>
<li>${a('https://www.basketball-reference.com/players/d/doncilu01.html', 'Basketball-Reference — Luka Dončić')} (listing, games and points per game by season)</li>
<li>${a('https://www.nba.com/mavs/luka-doncic-named-kia-nba-rookie-of-the-year', 'Dallas Mavericks — Dončić named Rookie of the Year')} (6-7, 218 listing)</li>
<li>${a('https://africa.espn.com/nba/story/_/id/32818403/dallas-mavericks-luka-doncic-admits-having-issue-weight-conditioning', 'ESPN — Doncic admits having issue with weight, conditioning (Dec. 2021)')}</li>
<li>${a('https://www.espn.com/nba/story/_/id/45841881', 'ESPN — Doncic: "My whole body looks better" (July 2025)')}</li>
<li>${a('https://www.hoopsrumors.com/2025/07/latest-on-luka-doncic-2.html', 'Hoops Rumors — Latest on Luka Doncic (July 2025)')}</li>
<li>${a('https://www.yardbarker.com/nba/articles/luka_doncics_official_new_weight_has_been_revealed/s1_127_44433767', 'Larry Brown Sports via Yardbarker — Luka Doncic\'s official new weight revealed (Oct. 2026)')}</li>
</ul>`;

// ---------- assemble from the 6'7" page (same layout) ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/6-7-nba-players/index.html'), 'utf8');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/6-7-nba-players\//g, `blog/${SLUG}/`)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/6-7-nba-players-height-chart\.jpg/g, IMG.split('/').pop());
if (/6-7-nba|6'7/.test(head)) throw new Error('template leftovers in head');
const ld = [
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: 'How Much Does Luka Doncic Weigh in 2026?', description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: PUB, mainEntityOfPage: URL, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 }, sameAs: ['https://www.facebook.com/nbagrid/', 'https://www.youtube.com/@nbagrid'] } },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, ans]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: ans } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://nba-grid.com/nba-games/' }, { '@type': 'ListItem', position: 3, name: 'Luka Doncic Weight', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">LUKA DONCIC WEIGHT</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Explainer</span>
<h1>How Much Does Luka Doncic Weigh in 2026?</h1>
<p class="article-dek">Luka's official weight and his training-camp weight don't match. Here's what he weighs now, how it's changed every year since 2018, and what he did to slim down.</p>
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
<a href="../6-7-nba-players/">
<img width="1280" height="720" src="/assets/images/6-7-nba-players-height-chart.jpg" alt="Every 6'7&quot; NBA Player in 2026-27" loading="lazy"/>
<div class="related-title">Every 6'7" NBA Player in 2026-27</div>
</a>
<a href="../lakers-sold-12-5-billion/">
<img width="1280" height="854" src="/assets/images/lakers-sale-handshake.jpg" alt="Lakers Sold for $12.5 Billion" loading="lazy"/>
<div class="related-title">Lakers Sold for Record $12.5 Billion</div>
</a>
<a href="/most-followed-nba-players-social-media/">
<img width="1200" height="630" src="/assets/images/most-followed-nba-players-2026.jpg" alt="Most Followed NBA Players on Social Media" loading="lazy"/>
<div class="related-title">Most Followed NBA Players on Social Media</div>
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
