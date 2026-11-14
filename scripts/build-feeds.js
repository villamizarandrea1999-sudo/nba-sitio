// Builds /feed.xml (RSS 2.0, 20 newest articles) and /news-sitemap.xml (Google News sitemap:
// only articles published in the last 2 days, as Google News requires). Runs before every commit.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://nba-grid.com';
const SKIP = /^\/(about|privacy|terms|author|nba-games|nba-today|nba-grid|grid|editorial-policy)\b/;
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/nba-grid\.com(\/[^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u !== '/' && !SKIP.test(u));
const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const arts = [];
for (const u of urls) {
  const h = fs.readFileSync(path.join(ROOT, u, 'index.html'), 'utf8');
  let date = null, modified = null;
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const o = JSON.parse(m[1]); if (/Article/.test(o['@type'])) { date = o.datePublished; modified = o.dateModified; } } catch (e) {}
  }
  if (!date) continue;
  const title = unesc(((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '').trim());
  const desc = unesc((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const img = (h.match(/<img class="hero-image" src="([^"]+)"/) || [])[1];
  arts.push({ u, date, modified, title, desc, img });
}
const ts = d => new Date(d.length === 10 ? d + 'T12:00:00-05:00' : d);
arts.sort((a, b) => ts(b.date) - ts(a.date) || a.u.localeCompare(b.u));

const items = arts.slice(0, 20).map(a => `    <item>
      <title>${x(a.title)}</title>
      <link>${SITE}${a.u}</link>
      <guid isPermaLink="true">${SITE}${a.u}</guid>
      <pubDate>${ts(a.date).toUTCString()}</pubDate>
      <description>${x(a.desc)}</description>${a.img ? `\n      <enclosure url="${SITE}${a.img.startsWith('/') ? a.img : '/' + a.img}" type="image/jpeg" length="0"/>` : ''}
    </item>`).join('\n');
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NBA GRID</title>
    <link>${SITE}/</link>
    <description>NBA news, injuries, trades, matchup hubs, guides and daily NBA puzzles.</description>
    <language>en-us</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${ts(arts[0].date).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

const cutoff = Date.now() - 2 * 24 * 3600 * 1000;
const recent = arts.filter(a => ts(a.date).getTime() >= cutoff);
const news = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent.map(a => `  <url>
    <loc>${SITE}${a.u}</loc>
    <news:news>
      <news:publication><news:name>NBA GRID</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${a.date}</news:publication_date>
      <news:title>${x(a.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>
`;
const write = (f, s) => { const p = path.join(ROOT, f); if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== s) { fs.writeFileSync(p, s); return true; } return false; };
const c1 = write('feed.xml', rss), c2 = write('news-sitemap.xml', news);
console.log(`Feeds ${c1 || c2 ? 'updated' : 'already up to date'}: RSS ${Math.min(20, arts.length)} items, news sitemap ${recent.length} recent.`);
