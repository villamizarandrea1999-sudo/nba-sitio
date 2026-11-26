// Builds /blog/wilson-nba-forge-basketball/ (Forge vs Forge Plus vs Forge Pro guide) and its price chart.
// Specs/prices checked 2026-11-25 in a browser: wilson.com/en-us (Forge Pro WZ20166, NBA Authentic I/O WZ20165,
// NBA Official Game Ball WZ10025), Dick's (Forge Plus, Forge Pro), Academy (Forge).
// We have NOT play-tested these balls: never write first-hand claims. Prices move (Black Friday), so refresh PRICE_AS_OF.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PUB = '2026-11-25', PUB_H = 'November 25, 2026';
const UPDATED = '2026-11-25', UPDATED_H = 'November 25, 2026';
const PRICE_AS_OF = 'Nov. 25, 2026';
const SLUG = 'wilson-nba-forge-basketball', URL = `https://nba-grid.com/blog/${SLUG}/`;
const IMG = '/assets/images/wilson-nba-forge-basketball-prices.jpg';
const U = {
  pro: 'https://www.wilson.com/en-us/products/nba-forge-pro-indooroutdoor-basketball-wz20166',
  auth: 'https://www.wilson.com/en-us/products/nba-authentic-indooroutdoor-basketball-wz20165',
  game: 'https://www.wilson.com/en-us/products/nba-official-game-basketball-wz10025',
  plus: 'https://www.dickssportinggoods.com/p/wilson-nba-forge-plus-indoor-outdoor-basketball-24wilunbfrgpls295bkb/24wilunbfrgpls295bkb',
  proDks: 'https://www.dickssportinggoods.com/p/wilson-nba-forge-pro-official-basketball-21wilmnbfrgprffxxbkb/21wilmnbfrgprffxxbkb',
  forge: 'https://www.academy.com/p/wilson-nba-forge-basketball',
};
// regular (non-sale) prices seen on PRICE_AS_OF
const prices = [
  { name: 'NBA Forge', p: 34.99, where: 'Academy', forge: true },
  { name: 'NBA Forge Plus', p: 43.99, where: "Dick's", forge: true },
  { name: 'NBA Authentic Indoor/Outdoor', p: 49.95, where: 'Wilson' },
  { name: 'NBA Forge Pro', p: 54.95, where: 'Wilson', forge: true },
  { name: 'NBA Official Game Ball', p: 179.95, where: 'Wilson' },
];

async function chart() {
  const sharp = require('sharp');
  const W = 1280, H = 720, L = 400, R = 130, T = 230, rowH = 74, bh = 40, max = 180;
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  const HI = '#f28c28', G = '#c9c4bf', M = '#8a847e', TX = '#fcfcfb';
  const sx = v => (W - L - R) * v / max;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="60" y="76" ${F} font-size="42" font-weight="700" fill="${TX}">Wilson NBA basketballs: regular price</text>`;
  s += `<text x="60" y="118" ${F} font-size="23" fill="${G}">US dollars, before sales, as listed ${PRICE_AS_OF} · NBA GRID</text>`;
  s += `<rect x="60" y="146" width="18" height="18" rx="3" fill="${HI}"/><text x="88" y="162" ${F} font-size="20" fill="${TX}">Forge line</text>`;
  s += `<rect x="220" y="146" width="18" height="18" rx="3" fill="${G}"/><text x="248" y="162" ${F} font-size="20" fill="${TX}">Other Wilson NBA balls</text>`;
  prices.forEach((d, i) => {
    const y = T + i * rowH, w = sx(d.p), r = 4;
    s += `<text x="${L - 18}" y="${y + 27}" text-anchor="end" ${F} font-size="23" ${d.forge ? 'font-weight="700" ' : ''}fill="${TX}">${d.name.replace('/', ' / ')}</text>`;
    s += `<path d="M${L},${y} H${L + w - r} Q${L + w},${y} ${L + w},${y + r} V${y + bh - r} Q${L + w},${y + bh} ${L + w - r},${y + bh} H${L} Z" fill="${d.forge ? HI : G}"/>`;
    s += `<text x="${L + w + 14}" y="${y + 28}" ${F} font-size="23" font-weight="700" fill="${TX}">$${d.p.toFixed(2)}</text>`;
  });
  s += `<line x1="${L}" x2="${L}" y1="${T - 10}" y2="${T + prices.length * rowH - 24}" stroke="${M}" stroke-width="1.5"/>`;
  s += `<text x="60" y="${H - 22}" ${F} font-size="17" fill="${M}">Sources: wilson.com (Forge Pro, Authentic, Game Ball), Dick's (Forge Plus), Academy (Forge). Size 7. Sale prices vary.</text></svg>`;
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

// ---------- content ----------
const title = 'Wilson NBA Forge Basketball: Forge vs Forge Plus vs Forge Pro';
const h1 = 'Wilson NBA Forge Basketball: Forge vs. Forge Plus vs. Forge Pro';
const desc = 'Wilson NBA Forge basketball guide: specs, prices and the real differences between the Forge, Forge Plus and Forge Pro, plus which one to buy for outdoor courts.';
const faqs = [
  ['What is the Wilson NBA Forge basketball?', 'The NBA Forge is a line of Wilson basketballs with official NBA branding, built for both indoor and outdoor courts. It comes in three main models: the Forge, the Forge Plus and the Forge Pro. All three use Wilson\'s Pure Feel cover rather than leather.'],
  ['What is the difference between the Wilson Forge and Forge Plus?', 'The Forge Plus adds Wilson\'s Dual Depth channels, which create a deeper pocket for grip, and Ever Bounce construction. Its cover backing is made with 42% post-consumer recycled plastic. The standard Forge has the Pure Feel cover, NBA Pro seams, a Pressure Lock bladder and an inflation retention lining.'],
  ['What is the difference between the Forge Plus and the Forge Pro?', 'The Forge Pro adds a Real Grip coating on top of the Pure Feel cover, which Wilson says improves ball control. It is the top model in the line and costs more: $54.95 regular price at Wilson, compared with $43.99 for the Forge Plus at Dick\'s.'],
  ['Is the Wilson NBA Forge good for outdoor courts?', 'Yes. Every Forge model is rated for indoor and outdoor play. Wilson describes the Forge Pro as having "durability suitable for outdoor and indoor courts," and its polyurethane cover is made to handle asphalt in a way a leather ball isn\'t.'],
  ['Is the Wilson NBA Forge the official NBA game ball?', 'No. The ball used in NBA games is the Wilson NBA Official Game Ball, made of genuine Horween leather, with a regular price of $179.95. The Forge is a synthetic indoor/outdoor ball with NBA branding.'],
  ['What size is the Wilson NBA Forge?', 'Size 7 (29.5 inches) is the standard men\'s size, for players 12 and older. Size 6 (28.5 inches) is for women and for kids about 9 to 12, and size 5 (27.5 inches) is for kids 9 and under. Available sizes vary by model and retailer.'],
  ['Is the Wilson NBA Forge discontinued?', 'Wilson has not announced that the line is discontinued. On November 25, 2026, Wilson\'s US site listed the Forge Pro (sold out) but not the Forge or Forge Plus, which were still sold at retailers like Academy and Dick\'s.'],
];
const tr = (i, len) => i < len - 1 ? ' class="border-b border-on-surface-variant/20"' : '';
const th = c => `<th class="py-2 pr-4 font-headline-md text-sm uppercase">${c}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto mt-md">\n<table class="w-full text-left border-collapse">\n${heads ? `<thead><tr class="border-b-2 border-on-surface">${heads.map(th).join('')}</tr></thead>\n` : ''}<tbody class="text-on-surface-variant">\n${rows.map((r, i) => `<tr${tr(i, rows.length)}>${r.map((c, j) => `<td class="py-2${j < r.length - 1 ? ' pr-4' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}\n</tbody>\n</table>\n</div>`;
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const ext = (href, txt) => `<a href="${href}" class="text-primary underline" rel="noopener" target="_blank">${txt}</a>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const specs = [
  ['<strong>Cover</strong>', 'Pure Feel cover', 'Pure Feel cover, partly recycled backing (42% post-consumer plastic)', 'Pure Feel cover + Real Grip coating'],
  ['<strong>Extra grip tech</strong>', 'None listed', 'Dual Depth channels (deeper pocket)', 'Real Grip coating'],
  ['<strong>Bounce</strong>', 'Inflation retention lining', 'Ever Bounce + air retention lining', 'Ever Bounce + Inflation Retention Lining'],
  ['<strong>Bladder</strong>', 'Pressure Lock', 'Not listed', 'Pressure Lock'],
  ['<strong>Seams</strong>', 'NBA Pro seams', 'NBA Pro Seams', 'NBA Pro Seams'],
  ['<strong>Material</strong>', 'Not listed', 'Not listed', '100% PU (polyurethane)'],
  ['<strong>Courts</strong>', 'Indoor / outdoor', 'Indoor / outdoor', 'Indoor / outdoor'],
  ['<strong>Regular price</strong>', '$34.99 (Academy)', '$43.99 (Dick\'s)', '$54.95 (Wilson)'],
  ['<strong>Shopper rating</strong>', '4.7/5, 71 reviews (Academy)', '4.7/5, 31 reviews (Dick\'s)', '4.8/5, 10 reviews (Wilson)'],
];
const sizes = [
  ['Size 7', '29.5 in.', 'Men and boys 12 and older; the NBA size'],
  ['Size 6', '28.5 in.', 'Women and girls 9 and older, boys about 9 to 12'],
  ['Size 5', '27.5 in.', 'Kids 9 and under'],
];

const body = `
<div class="article-callout">
<span class="callout-label">QUICK ANSWER</span>
<p>The <strong>Wilson NBA Forge</strong> is Wilson's NBA-branded indoor/outdoor ball line, in three models. The <strong>Forge</strong> ($34.99) is the basic version. The <strong>Forge Plus</strong> ($43.99) adds deeper Dual Depth channels for grip and Ever Bounce construction. The <strong>Forge Pro</strong> ($54.95) adds a Real Grip coating and is the best of the three. None of them is the leather ball used in NBA games.</p>
</div>
<p>All three Forge balls share the same base: a Pure Feel cover, NBA Pro seams, official NBA branding and a lining that keeps the ball holding air. The differences are in grip and bounce technology, and in price. Below are the specs side by side, what each model adds, and which one makes sense for the way you play.</p>
<p class="article-caption">How we built this guide: specs and regular prices come from Wilson's US site and the product pages at Dick's Sporting Goods and Academy Sports, checked ${PRICE_AS_OF}. We have not play-tested these balls, and NBA GRID does not earn a commission on any sale.</p>

${H2('Wilson NBA Forge vs. Forge Plus vs. Forge Pro: Specs Compared')}
${table(['', 'NBA Forge', 'NBA Forge Plus', 'NBA Forge Pro'], specs)}
<p class="article-caption">Specs as listed by Wilson and retailers on ${PRICE_AS_OF}. "Not listed" means the product page doesn't say.</p>

${H2('Wilson NBA Forge: The Base Model')}
<p>The standard NBA Forge is the cheapest way into the line. Academy lists a high-performance Pure Feel cover "for indoor and outdoor use," NBA Pro seams, a Pressure Lock bladder for air retention and an inflation retention lining for a reliable bounce. It comes with a one-year limited manufacturer warranty.</p>
<p>It has no extra grip technology, which is the main thing you give up compared with the Plus and the Pro. At a $34.99 regular price, it's aimed at players who want an NBA-branded ball for the driveway or the park without paying for features they won't notice. Academy shoppers rate it 4.7 out of 5 across 71 reviews.</p>

${H2('Wilson NBA Forge Plus: Better Grip, Recycled Cover')}
<p>The Forge Plus is the middle option, and it adds two things. The first is Dual Depth Technology, which Dick's describes as a re-engineered channel that "creates a deeper pocket to improve grip." The second is Ever Bounce construction, which combines an internal sponge layer, performance windings and a balance patch for a consistent bounce.</p>
<p>Its Pure Feel cover has a backing made from 42% post-consumer recycled plastics, and it keeps the NBA Pro Seams and air retention lining. Dick's lists it in sizes 7, 6 and 5 (29.5, 28.5 and 27.5 inches) at a $43.99 regular price; it was on sale for $32.99 on ${PRICE_AS_OF}. Dick's shoppers rate it 4.7 out of 5 across 31 reviews.</p>

${H2('Wilson NBA Forge Pro: The Top of the Line')}
<p>The Forge Pro is the model Wilson itself sells on its US site, where it calls it "a high-performance basketball for league play, gym games or Sunday pickup." It pairs the Pure Feel cover with a Real Grip coating, which Wilson says combine "for enhanced ball control and responsiveness." Ever Bounce construction and an inflation retention lining handle the bounce, and Wilson rates it for both indoor and outdoor courts.</p>
<p>Wilson's spec sheet lists a 100% polyurethane (PU) composition, a Pressure Lock bladder and NBA Pro Seams, in sizes 5, 6 and 7. The regular price is $54.95. On ${PRICE_AS_OF} it was marked down to $41.25 on Wilson's site but sold out, and it was also out of stock at Dick's. Wilson shoppers rate it 4.8 out of 5 across 10 reviews.</p>

${H2('Which Wilson NBA Forge Should You Buy?')}
<ul class="list-disc pl-lg space-y-2 text-on-surface-variant">
<li><strong>Mostly outdoor, on a budget:</strong> the <strong>Forge</strong>. Asphalt wears down any cover, so paying more for grip technology on a ball that lives outside matters less.</li>
<li><strong>Indoor and outdoor, want more grip:</strong> the <strong>Forge Plus</strong>. The Dual Depth channels are the main upgrade, and on ${PRICE_AS_OF} it was on sale for $32.99, below the base Forge's regular price.</li>
<li><strong>League games, gym runs, serious pickup:</strong> the <strong>Forge Pro</strong>. The Real Grip coating is the most grip-focused feature in the line.</li>
<li><strong>Indoor only:</strong> look beyond the Forge line. A ball built only for the hardwood, like Wilson's leather NBA Official Game Ball, is designed for that surface.</li>
</ul>

${H2('Wilson NBA Basketball Prices Compared')}
<img class="hero-image" src="${IMG}" width="1280" height="720" alt="Bar chart of Wilson NBA basketball regular prices: NBA Forge $34.99, Forge Plus $43.99, NBA Authentic Indoor/Outdoor $49.95, Forge Pro $54.95 and NBA Official Game Ball $179.95" loading="eager" fetchpriority="high"/>
<p class="article-caption">Regular size-7 prices before sales, ${PRICE_AS_OF}. Chart by NBA GRID.</p>
<p>The whole Forge line costs less than a third of the official game ball. Wilson's own site also features the NBA Authentic Indoor/Outdoor at a $49.95 regular price, between the Forge Plus and the Forge Pro. Wilson says it combines Ever Bounce construction and an inflation retention lining with a Pure Feel Moisture Management cover. If the Forge Pro is sold out, it's the closest alternative on Wilson's site.</p>
<p>Looking for something cheaper? Our guide to the ${int('/blog/wilson-nba-drv-basketball/', 'Wilson NBA DRV basketball')} covers Wilson's recreational line, built for everyday outdoor play.</p>

${H2('Is the Forge the Official NBA Game Ball?')}
<p>No. Wilson has made the NBA's official ball since the 2021-22 season, but the ball used in games is the <strong>NBA Official Game Ball</strong>. Wilson says it is made of genuine Horween leather "built to the exact specifications used on the court by every team and every player," and it sells for $179.95. The Forge line carries the same NBA logo and Wilson script, but it is a synthetic ball made to handle outdoor courts too, which a leather game ball isn't.</p>

${H2('Wilson NBA Forge Sizes')}
${table(['Size', 'Circumference', 'Who it\'s for'], sizes)}
<p class="article-caption">Sizing from Dick's Sporting Goods. Leagues set their own rules, so check with yours.</p>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, a]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(a)}</p></div>`).join('\n')}
</div>

${H2('Sources')}
<ul class="list-disc pl-lg space-y-2">
<li>${ext(U.pro, 'Wilson — NBA Forge Pro Indoor/Outdoor Basketball (WZ20166): description, specs, price')}</li>
<li>${ext(U.plus, 'Dick\'s Sporting Goods — Wilson NBA Forge Plus Indoor/Outdoor Basketball: technologies, sizes, price')}</li>
<li>${ext(U.forge, 'Academy Sports + Outdoors — Wilson NBA Forge Basketball: features, warranty, price')}</li>
<li>${ext(U.proDks, 'Dick\'s Sporting Goods — Wilson NBA Forge Pro: features and sizing chart')}</li>
<li>${ext(U.auth, 'Wilson — NBA Authentic Indoor/Outdoor Basketball (WZ20165)')}</li>
<li>${ext(U.game, 'Wilson — NBA Official Game Ball (WZ10025)')}</li>
</ul>

<div class="article-callout">
<span class="callout-label">PLAY TODAY'S GRID</span>
<p>Got your ball? Now test your NBA knowledge on today's ${int('/blog/nba-immaculate-grid/#play', 'NBA GRID 3x3')}.</p>
</div>`;

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
  { '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: h1, description: desc, image: [`https://nba-grid.com${IMG}`], datePublished: PUB, dateModified: UPDATED, mainEntityOfPage: URL, about: { '@type': 'Thing', name: 'Wilson NBA Forge basketball' }, author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://nba-grid.com/nba-games/' }, { '@type': 'ListItem', position: 3, name: 'Wilson NBA Forge Basketball', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID'));
const footer = tpl.slice(tpl.indexOf('</article>'));
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const updatedSpan = UPDATED !== PUB ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${UPDATED}">${UPDATED_H}</time></span>` : '';
const related = [['wilson-nba-drv-basketball', 'Wilson NBA DRV Basketball: Specs & Price'], ['nba-immaculate-grid', null], ['top-5-shooting-guards-of-all-time', 'Top 5 Shooting Guards of All Time in NBA History']];
for (const r of related) if (!r[1]) r[1] = fs.readFileSync(path.join(ROOT, 'blog', r[0], 'index.html'), 'utf8').match(/<h1[^>]*>([^<]*)/)[1].trim();
const rcard = (slug, t) => `<a href="../${slug}/">\n<img width="1280" height="720" src="IMG" alt="${q(t)}" loading="lazy"/>\n<div class="related-title">${esc(t)}</div>\n</a>`;
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">WILSON NBA FORGE</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Gear</span>
<h1>${h1}</h1>
<p class="article-dek">Wilson's NBA Forge line comes in three models that look almost the same. Here's what separates the Forge, Forge Plus and Forge Pro, what each one costs, and which one fits your game.</p>
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
  const m = h.match(/<img class="hero-image" src="([^"]+)" width="(\d+)" height="(\d+)"/) || h.match(/<img class="hero-image"[^>]*?src="([^"]+)"[^>]*?width="(\d+)" height="(\d+)"/) || h.match(/<meta property="og:image" content="https:\/\/nba-grid\.com([^"]+)"/);
  if (!m) throw new Error('no hero image in ' + slug);
  html = html.replace(new RegExp(`(<a href="\\.\\./${slug}/">\\n<img )width="\\d+" height="\\d+" src="IMG"`), m[2] ? `$1width="${m[2]}" height="${m[3]}" src="${m[1]}"` : `$1width="1280" height="720" src="${m[1]}"`);
}
if (html.includes('src="IMG"')) throw new Error('related image not resolved');
(async () => {
  await chart();
  fs.mkdirSync(path.join(ROOT, 'blog', SLUG), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'blog', SLUG, 'index.html'), html);
  console.log('words', words, '| title', title.length, '| desc', desc.length);
})();
