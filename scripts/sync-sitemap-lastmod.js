// Sets every <lastmod> in sitemap.xml to the page's real last update: JSON-LD dateModified
// (falls back to datePublished). Pages without dates keep their current lastmod.
// Runs before every commit and in the nightly workflow (standings / NBA Today change daily).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const p = path.join(ROOT, 'sitemap.xml');
const raw = fs.readFileSync(p, 'utf8');
let changed = 0;
const dateOf = u => {
  const f = path.join(ROOT, u, 'index.html');
  if (!fs.existsSync(f)) return null;
  const h = fs.readFileSync(f, 'utf8');
  let mod = null, pub = null;
  for (const s of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const o = JSON.parse(s[1]); if (o.dateModified) mod = o.dateModified; if (o.datePublished) pub = o.datePublished; } catch (e) {}
  }
  return { mod, pub };
};
// the homepage has no dates of its own; its content changes when a new article is published,
// so its lastmod is the newest datePublished among the sitemap's articles
const newestPub = [...raw.matchAll(/<loc>https:\/\/nba-grid\.com(\/[^<]*)<\/loc>/g)]
  .map(m => m[1]).filter(u => u !== '/').map(u => ((dateOf(u) || {}).pub || '').slice(0, 10))
  .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop();
const out = raw.replace(/<loc>https:\/\/nba-grid\.com(\/[^<]*)<\/loc>(\s*)<lastmod>([^<]*)<\/lastmod>/g, (m, u, ws, cur) => {
  const dd = dateOf(u);
  if (!dd) return m;
  const { mod, pub } = dd;
  const d = u === '/' ? (newestPub || '') : (mod || pub || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d === cur) return m;
  changed++;
  return `<loc>https://nba-grid.com${u}</loc>${ws}<lastmod>${d}</lastmod>`;
});
if (changed) fs.writeFileSync(p, out);
console.log(`Sitemap lastmod: ${changed} updated.`);
