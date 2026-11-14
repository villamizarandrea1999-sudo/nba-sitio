// Builds /blog/ (every article, newest first) and the category pages
// /blog/injuries/, /blog/trades/, /blog/contracts/, /blog/matchups/.
// Runs before every commit (.githooks/pre-commit). An article lands in a category through
// CATEGORY_OF (explicit) or its .article-tag (fallback), so new articles file themselves.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CATS = {
  injuries: { name: 'Injuries', title: 'NBA Injury News & Updates', dek: 'Every NBA injury update we have covered: surgeries, timelines and what each absence means for the team.', tags: ['INJURY'] },
  trades: { name: 'Trades', title: 'NBA Trade News & Analysis', dek: 'NBA trades, from blockbusters to deadline deals: who moved, what each team got and why it matters.', tags: ['TRADE', 'TRANSACTIONS'] },
  contracts: { name: 'Contracts', title: 'NBA Contracts, Extensions & Free Agency', dek: 'Extensions, signings and free-agency moves: the numbers on every deal and what they mean for the cap.', tags: ['CONTRACTS', 'FREE AGENCY', 'RUMORS'] },
  matchups: { name: 'Matchups', title: 'NBA Matchups: Previews, Results & Stats', dek: 'Matchup hubs for the NBA\'s biggest rivalries: next game, how to watch, player stats and head-to-head history, updated after every game.', tags: ['MATCHUP HUB', 'GAME PREVIEW'] },
};
const CATEGORY_OF = {
  '/blog/donovan-mitchell-extension-cavaliers/': 'contracts', '/blog/dillon-brooks-extension-suns/': 'contracts',
  '/blog/anthony-davis-wizards-extension/': 'contracts', '/blog/mario-hezonja-cavaliers/': 'contracts',
  '/blog/nba-six-team-trade-russell-middleton/': 'trades', '/blog/nba-trade-deadline-2026/': 'trades',
};
const SKIP = /^\/(about|privacy|terms|author|nba-games|nba-today)\b/;
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const catUrls = new Set(['/blog/', ...Object.keys(CATS).map(k => `/blog/${k}/`)]);
const urls = [...sitemap.matchAll(/<loc>https:\/\/nba-grid\.com(\/[^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u !== '/' && !SKIP.test(u) && !catUrls.has(u));
const esc = s => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#\d+;)/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const unesc = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const arts = [];
for (const u of urls) {
  const h = fs.readFileSync(path.join(ROOT, u, 'index.html'), 'utf8');
  let date = null;
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { const o = JSON.parse(m[1]); if (/Article/.test(o['@type'])) date = o.datePublished; } catch (e) {} }
  if (!date) continue;
  const title = unesc(((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '').trim());
  const desc = unesc((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const img = (h.match(/<img class="hero-image" src="([^"]+)"/) || [])[1] || null;
  const alt = unesc((h.match(/<img class="hero-image"[^>]*alt="([^"]*)"/) || [])[1] || '');
  const tag = ((h.match(/<span class="article-tag">([^<]*)<\/span>/) || [])[1] || 'NEWS').toUpperCase();
  const cat = CATEGORY_OF[u] || Object.keys(CATS).find(k => CATS[k].tags.includes(tag)) || null;
  arts.push({ u, date: date.slice(0, 10), title, desc, img, alt, tag, cat });
}
arts.sort((a, b) => b.date.localeCompare(a.date) || a.u.localeCompare(b.u));
const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const tpl = fs.readFileSync(path.join(ROOT, 'nba-standings', 'index.html'), 'utf8');
const headBase = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'));
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const footer = tpl.slice(tpl.indexOf('</article>') + '</article>'.length);

function page(url, name, title, dek, list) {
  const full = 'https://nba-grid.com' + url;
  const head = headBase
    .replace(/https:\/\/nba-grid\.com\/nba-standings\//g, full)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)} | NBA GRID</title>`)
    .replace(/(name="description" content=")[^"]*/, (m, x) => x + esc(dek))
    .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + esc(title))
    .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + esc(dek))
    .replace(/<meta property="og:image"[^>]*>\s*(<meta property="og:image:width"[^>]*>\s*<meta property="og:image:height"[^>]*>\s*)?/, '');
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: dek, url: full, mainEntity: { '@type': 'ItemList', itemListElement: list.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: 'https://nba-grid.com' + a.u })) } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, ...(url === '/blog/' ? [{ '@type': 'ListItem', position: 2, name: 'News & Guides', item: full }] : [{ '@type': 'ListItem', position: 2, name: 'News & Guides', item: 'https://nba-grid.com/blog/' }, { '@type': 'ListItem', position: 3, name, item: full }])] },
  ].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
  const nav = [['/blog/', 'All'], ...Object.entries(CATS).map(([k, c]) => [`/blog/${k}/`, c.name])]
    .map(([h, n]) => `<a href="${h}" class="cat-pill${h === url ? ' is-active' : ''}">${n}</a>`).join('\n');
  const cards = list.map(a => `<a href="${a.u}" class="cat-card">
${a.img ? `<img src="${a.img}" alt="${esc(a.alt)}" loading="lazy"/>` : '<div class="cat-card-noimg"></div>'}
<div class="cat-card-body"><span class="cat-card-meta">${esc(a.tag)} · ${fmt(a.date).toUpperCase()}</span>
<h2 class="cat-card-title">${esc(a.title)}</h2>
<p class="cat-card-desc">${esc(a.desc)}</p></div>
</a>`).join('\n');
  const crumbs = url === '/blog/' ? '<span class="text-primary">NEWS &amp; GUIDES</span>' : `<a href="/blog/" class="hover:text-primary transition-colors">NEWS &amp; GUIDES</a><span class="mx-1">/</span><span class="text-primary">${name.toUpperCase()}</span>`;
  const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span>${crumbs}
</div>
<header class="mb-lg">
<h1 class="font-display-lg text-headline-lg uppercase italic tracking-tighter">${esc(title)}</h1>
<p class="text-on-surface-variant text-body-lg mt-sm" style="max-width:62ch">${esc(dek)}</p>
<nav class="cat-pills" aria-label="Categories">
${nav}
</nav>
</header>
<p class="font-label-caps text-xs text-on-surface-variant mb-md">${list.length} ${list.length === 1 ? 'STORY' : 'STORIES'} · NEWEST FIRST</p>
<div class="cat-grid">
${cards}
</div>
`;
  const out = path.join(ROOT, url, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = head + ld + '\n' + afterLd + main + footer;
  const prev = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (prev !== html) fs.writeFileSync(out, html);
  return prev !== html;
}

let changed = page('/blog/', 'News & Guides', 'NBA News & Guides', 'Every story on NBA GRID, newest first: breaking news, injuries, trades, contracts, matchup hubs and evergreen guides.', arts);
for (const [k, c] of Object.entries(CATS)) changed = page(`/blog/${k}/`, c.name, c.title, c.dek, arts.filter(a => a.cat === k)) || changed;
const uncategorized = arts.filter(a => !a.cat).length;
console.log(`Category pages ${changed ? 'updated' : 'already up to date'}: ${arts.length} stories, ${Object.keys(CATS).map(k => `${k} ${arts.filter(a => a.cat === k).length}`).join(', ')}, ${uncategorized} in All only.`);
