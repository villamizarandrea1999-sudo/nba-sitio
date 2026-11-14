// Rebuilds the homepage's "fresh" blocks from the articles themselves, newest first:
//   <!-- AUTO:TICKER -->   top ticker (both copies)        — 8 newest
//   <!-- AUTO:HERO-SIDE --> two cards beside the hero       — 2 newest
//   <!-- AUTO:RECENT -->   "Just published" list         — 3rd-5th newest
//   <!-- AUTO:LATEST -->   "Latest News" grid               — 12 newest
// Data comes from each page in sitemap.xml: JSON-LD datePublished + headline, og:image, .article-tag.
// Runs automatically before every commit (.githooks/pre-commit). Manual: node scripts/update-homepage.js [--list]
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP = /^\/(about|privacy|terms|author|nba-games|nba-today|nba-grid|grid|editorial-policy)\b/;
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/nba-grid\.com(\/[^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u !== '/' && !SKIP.test(u));
const esc = s => s.replace(/&(?!amp;|lt;|gt;|quot;|#\d+;)/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const unesc = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const arts = [];
for (const u of urls) {
  const f = path.join(ROOT, u, 'index.html');
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, 'utf8');
  let date = null, headline = null;
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const o = JSON.parse(m[1]); if (/Article/.test(o['@type'])) { date = o.datePublished; headline = o.headline; } } catch (e) {}
  }
  if (!date) continue;
  const h1 = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
  const img = (h.match(/<img class="hero-image" src="([^"]+)"/) || [])[1] || null;
  const alt = (h.match(/<img class="hero-image"[^>]*alt="([^"]*)"/) || [])[1] || '';
  const tag = ((h.match(/<span class="article-tag">([^<]*)<\/span>/) || [])[1] || 'NEWS').toUpperCase();
  const title = unesc((h1 ? h1.replace(/<[^>]+>/g, '') : headline || '').trim());
  arts.push({ u, href: u.slice(1), date: date.slice(0, 10), title, img: img && img.replace(/^\//, ''), alt: unesc(alt), tag });
}
arts.sort((a, b) => b.date.localeCompare(a.date) || a.u.localeCompare(b.u));
if (process.argv.includes('--list')) { arts.forEach(a => console.log(a.date, a.u, '|', a.tag, '|', a.title.slice(0, 70), a.img ? '' : '(no image)')); process.exit(0); }

const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const ticker = arts.slice(0, 8).map(a => `<a href="${a.href}" class="font-label-caps hover:text-primary transition-colors">${esc(a.title)}</a>\n<span class="text-surface-variant/30 px-xs">|</span>\n`).join('');
const side = arts.slice(0, 2).map(a => `<a href="${a.href}" style="position:relative;display:block;border-radius:6px;overflow:hidden;background:#111827;height:212px;color:#fff">
${a.img ? `<img src="${a.img}" alt="${esc(a.alt)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 70%"/>\n` : ''}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,16,.72) 0%,rgba(8,12,16,.97) 100%)"></div>
<div style="position:relative;padding:18px;height:100%;display:flex;flex-direction:column;justify-content:flex-end">
<div style="align-self:flex-start;background:#c2410c;color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;padding:5px 9px;border-radius:3px;margin-bottom:12px">${esc(a.tag)}</div>
<h3 style="margin:0;font-size:20px;line-height:1.2;font-weight:800;font-family:'Bricolage Grotesque',sans-serif">${esc(a.title)}</h3>
<div style="display:flex;gap:20px;margin-top:12px;font-size:13px;color:#cbd5e1">
<span style="display:flex;align-items:center;gap:7px;white-space:nowrap"><span class="material-symbols-outlined" style="font-size:14px">calendar_today</span>${fmt(a.date)}</span>
</div>
</div>
</a>
`).join('');
const recent = arts.slice(2, 5).map((a, i) => `<a href="${a.href}" style="display:flex;gap:14px;padding:${i < 2 ? '18px 0' : '18px 0 4px'}${i < 2 ? ';border-bottom:1px solid rgba(255,255,255,.1)' : ''}">
<span style="width:28px;height:28px;flex:none;border-radius:50%;background:#f3f4f6;color:#0d1418;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800">${i + 1}</span>
${a.img ? `<img src="${a.img}" alt="${esc(a.alt)}" loading="lazy" style="width:80px;height:58px;flex:none;object-fit:cover;border-radius:4px"/>
` : ''}<div>
<div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;color:#ef7f1a;margin-bottom:6px">${esc(a.tag)}</div>
<div style="color:#fff;font-size:15px;font-weight:700;line-height:1.3">${esc(a.title)}</div>
</div>
</a>
`).join('');
const latest = arts.slice(0, 12).map(a => `<a href="${a.href}" class="today-card">
${a.img ? `<img src="${a.img}" alt="${esc(a.alt)}" class="w-full h-32 object-cover rounded-xl mb-sm" loading="lazy"/>\n` : ''}<span class="font-label-caps text-xs text-primary mb-xs block">${esc(a.tag)} · ${fmt(a.date).toUpperCase()}</span>
<h3 class="font-headline-md text-[16px] uppercase leading-tight">${esc(a.title)}</h3>
</a>
`).join('');

const p = path.join(ROOT, 'index.html');
const raw = fs.readFileSync(p, 'utf8');
const crlf = raw.includes('\r\n');
let s = raw.replace(/\r\n/g, '\n');
const fill = (name, content, expect) => {
  const re = new RegExp(`(<!-- AUTO:${name} -->\\n)[\\s\\S]*?(<!-- /AUTO:${name} -->)`, 'g');
  const n = (s.match(re) || []).length;
  if (n !== expect) throw new Error(`index.html: expected ${expect} AUTO:${name} block(s), found ${n}`);
  s = s.replace(re, (m, a, b) => a + content + b);
};
fill('TICKER', ticker, 2);
fill('HERO-SIDE', side, 1);
fill('RECENT', recent, 1);
fill('LATEST', latest, 1);
if (crlf) s = s.replace(/\n/g, '\r\n');
if (s !== raw) { fs.writeFileSync(p, s); console.log('Homepage updated: newest is', arts[0].u, `(${arts[0].date})`); }
else console.log('Homepage already up to date: newest is', arts[0].u);
