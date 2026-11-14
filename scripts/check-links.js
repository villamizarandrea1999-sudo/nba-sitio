// Fails if any article is "orphaned": every page in sitemap.xml must be linked from the homepage
// AND from at least one other content page (author page and the page itself don't count).
// Run: node scripts/check-links.js   (also runs automatically before every commit via .githooks/pre-commit)
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/nba-grid\.com(\/[^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u !== '/');

// collect every html page and the internal links it contains
const pages = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'scripts', 'assets'].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'index.html') pages.push(p);
  }
})(ROOT);
const urlOf = p => '/' + path.relative(ROOT, path.dirname(p)).replace(/\\/g, '/') + (path.dirname(p) === ROOT ? '' : '/');
const norm = (href, from) => {
  href = href.split('#')[0].split('?')[0];
  if (!href || /^(https?:|mailto:|tel:)/.test(href) && !href.startsWith('https://nba-grid.com')) return null;
  href = href.replace('https://nba-grid.com', '');
  const abs = href.startsWith('/') ? href : path.posix.normalize(path.posix.join(from, href));
  return abs.endsWith('/') || abs.includes('.') ? abs.replace(/index\.html$/, '') : abs + '/';
};
const inbound = new Map(urls.map(u => [u, new Set()]));
for (const p of pages) {
  const from = urlOf(p).replace(/^\/\//, '/');
  const html = fs.readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const to = norm(m[1], from);
    if (to && inbound.has(to) && to !== from) inbound.get(to).add(from);
  }
}
const problems = [];
// every article folder must be in the sitemap, otherwise the check above can't see it
for (const p of pages) {
  const u = urlOf(p);
  const redirect = /http-equiv="refresh"/i.test(fs.readFileSync(p, 'utf8').slice(0, 3000));
  if (u.startsWith('/blog/') && !redirect && !inbound.has(u)) problems.push(`${u}  ← missing from sitemap.xml`);
}
for (const [u, from] of inbound) {
  const content = [...from].filter(f => f !== '/' && !f.startsWith('/author/'));
  const missing = [];
  if (!from.has('/')) missing.push('homepage');
  if (!content.length) missing.push('any other article');
  if (missing.length) problems.push(`${u}  ← not linked from ${missing.join(' or ')}`);
}
if (problems.length) {
  console.error('\nORPHAN PAGES (readers can\'t find these on the site):\n  ' + problems.join('\n  ') + '\n\nAdd a homepage card and a link from a related article, then commit again.\n');
  process.exit(1);
}
console.log(`Link check passed: all ${urls.length} sitemap pages are linked from the homepage and another article.`);
