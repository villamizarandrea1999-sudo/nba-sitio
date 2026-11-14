// Builds the NBA GRID 3x3 pages from assets/data/nba-3x3.json:
//   /nba-grid/                      playable game (today's board) + rules
//   /nba-grid/answers/              index of every past board's answers
//   /nba-grid/answers/YYYY-MM-DD/   answers for one day (only dates up to today, ET)
//   /grid/                          redirect to /nba-grid/
// Also keeps the answers URLs in sitemap.xml (between GRID-ANSWERS markers).
// Runs before every commit and every morning in the nightly workflow.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/nba-3x3.json'), 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const keys = Object.keys(D.z).sort();
const live = keys.filter(k => k <= today);
const no = k => keys.indexOf(k) + 1;
const long = k => new Date(k + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;

// ---------- shared shell from the immaculate-grid page ----------
const src = fs.readFileSync(path.join(ROOT, 'blog/nba-immaculate-grid/index.html'), 'utf8');
const gameBlock = src.slice(src.indexOf('<section id="play"'), src.indexOf('</section>', src.indexOf('<section id="play"')) + '</section>'.length);
const headBase = src.slice(0, src.indexOf('<script type="application/ld+json">'));
const afterLd = src.slice(src.indexOf('</head>'), src.indexOf('<main'));
const tail = src.slice(src.indexOf('</article>') + '</article>'.length);
function shell(url, title, desc, crumbs, inner, ld, extraHead = '') {
  const full = 'https://nba-grid.com' + url;
  const head = headBase
    .replace(/https:\/\/nba-grid\.com\/blog\/nba-immaculate-grid\//g, full)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(name="description" content=")[^"]*/, (m, x) => x + esc(desc))
    .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + esc(title))
    .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + esc(desc))
    .replace(/<meta property="og:image" content="[^"]*"\/>/, url === '/nba-grid/' ? '<meta property="og:image" content="https://nba-grid.com/assets/images/nba-grid-game.jpg"/>' : '') + extraHead;
  const lds = ld.map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
  return head + lds + '\n' + afterLd + `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a>${crumbs}
</div>
<article class="editorial-article">
${inner}
</article>` + tail;
}
const write = (rel, html) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); const prev = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''; if (prev !== html) { fs.writeFileSync(f, html); return 1; } return 0; };
const crumb = (...parts) => parts.map(([h, t], i) => `<span class="mx-1">/</span>${i === parts.length - 1 ? `<span class="text-primary">${t}</span>` : `<a href="${h}" class="hover:text-primary transition-colors">${t}</a>`}`).join('');
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com' };
let changed = 0;

// ---------- /nba-grid/ ----------
{
  const title = "NBA GRID: Play Today's NBA Grid Game (Free, Daily)";
  const desc = "Play today's NBA GRID 3x3: name an NBA player for every team, award, stat and teammate square. Free, a new board every day, with past grids and answers.";
  const inner = `<header class="mb-lg">
<span class="article-tag">Daily Game</span>
<h1>NBA GRID: Today's NBA Grid Game</h1>
<p class="article-dek">Nine squares, three strikes, one new board every day. Name an NBA player who fits each row and column.</p>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${gameBlock}
${H2('How to Play NBA GRID')}
<p>Every row and column of the 3x3 board is a category: an NBA franchise, an award, a single-season stat mark, a decade, or "teammate of" a star. Tap a square, start typing a player's name and pick him from the list. He has to fit both the row and the column, and you can only use each player once.</p>
<ul class="list-disc pl-lg space-y-2">
<li><strong>Three strikes:</strong> a wrong answer costs a strike. After three, the board is over.</li>
<li><strong>Deep Cut score:</strong> rarer correct answers score higher, based on career games compared with every other valid answer for that square.</li>
<li><strong>Franchise history counts:</strong> a SuperSonics player counts for the Thunder, a Bobcats player for the Hornets.</li>
<li><strong>A new board at midnight</strong> your local time, plus an archive of every past grid in the menu above the board.</li>
</ul>
${H2('Stuck? See the Answers')}
<p>Every day's full list of valid answers is on the ${int('/nba-grid/answers/', 'NBA GRID answers page')}, including ${int(`/nba-grid/answers/${live[live.length - 1]}/`, `today's answers (${long(live[live.length - 1])})`)}. Want to get better first? Read our ${int('/blog/nba-immaculate-grid/', 'NBA grid strategy guide')}, and when you're done, try the ${int('/#daily-grid', 'Daily Grid')} puzzle too.</p>
</div>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'NBA GRID 3x3', url: 'https://nba-grid.com/nba-grid/', applicationCategory: 'GameApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', description: desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: org },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'NBA Grid Game', item: 'https://nba-grid.com/nba-grid/' }] }];
  let html = shell('/nba-grid/', title, desc, crumb(['/nba-grid/', 'NBA GRID GAME']), inner, ld);
  html = html.replace('</body>', '<script src="/assets/js/nba-3x3.js?v=1" defer></script>\n</body>');
  changed += write('nba-grid/index.html', html);
}

// ---------- answers ----------
function cell(r, c, z) {
  const a = new Set(D.c[z[r]].ids);
  return D.c[z[3 + c]].ids.filter(i => a.has(i)).sort((x, y) => D.p[y][3] - D.p[x][3]);
}
const label = k => D.c[k].label + (D.c[k].note ? ` (${D.c[k].note})` : '');
for (const k of live) {
  const z = D.z[k], n = no(k);
  const title = `NBA Grid Answers Today: ${long(k)} (#${n})`;
  const desc = `Every valid answer for NBA GRID #${n} (${long(k)}): ${D.c[z[0]].label}, ${D.c[z[1]].label}, ${D.c[z[2]].label} × ${D.c[z[3]].label}, ${D.c[z[4]].label}, ${D.c[z[5]].label}.`;
  let squares = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const list = cell(r, c, z);
    const common = list.slice(0, 5).map(i => esc(D.p[i][0])).join(', ');
    const deep = list.length > 8 ? list.slice(-3).map(i => esc(D.p[i][0])).join(', ') : '';
    squares += `<h3 class="font-headline-md text-[20px] mt-md mb-xs">${esc(D.c[z[r]].label)} × ${esc(D.c[z[3 + c]].label)}</h3>
<p><strong>${list.length} valid answer${list.length === 1 ? '' : 's'}.</strong> Most common: ${common}.${deep ? ` Deep cuts: ${deep}.` : ''}</p>
<details class="mb-sm"><summary class="text-primary underline" style="cursor:pointer">Show all ${list.length}</summary><p class="text-on-surface-variant text-body-md">${list.map(i => `${esc(D.p[i][0])} (${D.p[i][1]}–${D.p[i][2]})`).join(', ')}</p></details>\n`;
  }
  const prev = live[live.indexOf(k) - 1], next = live[live.indexOf(k) + 1];
  const inner = `<header class="mb-lg">
<span class="article-tag">Answers</span>
<h1>NBA Grid Answers: ${long(k)} (#${n})</h1>
<p class="article-dek">Spoilers ahead: every valid answer for NBA GRID #${n}. Haven't played yet? ${int('/nba-grid/', 'Play today’s grid first')}.</p>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
${H2(`NBA GRID #${n} Categories`)}
<ul class="list-disc pl-lg space-y-2">
<li><strong>Rows:</strong> ${[0, 1, 2].map(i => esc(label(z[i]))).join(' · ')}</li>
<li><strong>Columns:</strong> ${[3, 4, 5].map(i => esc(label(z[i]))).join(' · ')}</li>
</ul>
${H2('Answers for Every Square')}
<p>"Most common" lists the players with the most career games, the obvious picks. "Deep cuts" are the valid answers with the fewest games, which score highest on our Deep Cut meter.</p>
${squares}
<p class="article-caption">Answers from NBA and BAA regular seasons on Basketball-Reference (data refreshed ${esc(D.built)}). Franchise history counts; ABA seasons don't.</p>
<p>${prev ? int(`/nba-grid/answers/${prev}/`, `← #${no(prev)} answers`) : ''}${prev && next ? ' · ' : ''}${next ? int(`/nba-grid/answers/${next}/`, `#${no(next)} answers →`) : ''} · ${int('/nba-grid/answers/', 'All answers')}</p>
</div>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: desc, datePublished: k, dateModified: k, mainEntityOfPage: `https://nba-grid.com/nba-grid/answers/${k}/`, author: { '@type': 'Organization', name: 'NBA GRID' }, publisher: org },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'NBA Grid Game', item: 'https://nba-grid.com/nba-grid/' }, { '@type': 'ListItem', position: 3, name: 'Answers', item: 'https://nba-grid.com/nba-grid/answers/' }, { '@type': 'ListItem', position: 4, name: `#${n}`, item: `https://nba-grid.com/nba-grid/answers/${k}/` }] }];
  changed += write(`nba-grid/answers/${k}/index.html`, shell(`/nba-grid/answers/${k}/`, title, desc, crumb(['/nba-grid/', 'NBA GRID GAME'], ['/nba-grid/answers/', 'ANSWERS'], ['', `#${n}`]), inner, ld));
}
{
  const title = 'NBA Grid Answers: Every Daily NBA GRID Board';
  const desc = `Answers for every NBA GRID 3x3 board, newest first. Today's grid is #${no(live[live.length - 1])} (${long(live[live.length - 1])}).`;
  const items = [...live].reverse().map(k => `<li>${int(`/nba-grid/answers/${k}/`, `NBA GRID #${no(k)}: ${long(k)}`)} <span class="text-on-surface-variant text-sm">· ${esc(D.c[D.z[k][0]].label)}, ${esc(D.c[D.z[k][3]].label)} and more</span></li>`).join('\n');
  const inner = `<header class="mb-lg">
<span class="article-tag">Answers</span>
<h1>NBA Grid Answers</h1>
<p class="article-dek">Every valid answer for every NBA GRID board. ${int('/nba-grid/', 'Play today’s grid')} first, then check your picks.</p>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">
<ul class="list-disc pl-lg space-y-2">
${items}
</ul>
</div>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: desc, url: 'https://nba-grid.com/nba-grid/answers/', publisher: org }];
  changed += write('nba-grid/answers/index.html', shell('/nba-grid/answers/', title, desc, crumb(['/nba-grid/', 'NBA GRID GAME'], ['', 'ANSWERS']), inner, ld));
}
// /grid/ -> /nba-grid/
changed += write('grid/index.html', `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta http-equiv="refresh" content="0; url=https://nba-grid.com/nba-grid/"/>
<link rel="canonical" href="https://nba-grid.com/nba-grid/"/>
<title>NBA GRID Game | NBA GRID</title>
</head>
<body>
<p>The NBA GRID game is at <a href="https://nba-grid.com/nba-grid/">https://nba-grid.com/nba-grid/</a>.</p>
</body></html>
`);

// sitemap block
const sp = path.join(ROOT, 'sitemap.xml');
const sm = fs.readFileSync(sp, 'utf8');
const nl = sm.includes('\r\n') ? '\r\n' : '\n';
const entry = (u, d, f, p) => `  <url>${nl}    <loc>https://nba-grid.com${u}</loc>${nl}    <lastmod>${d}</lastmod>${nl}    <changefreq>${f}</changefreq>${nl}    <priority>${p}</priority>${nl}  </url>${nl}`;
const block = `<!-- GRID-ANSWERS -->${nl}` + entry('/nba-grid/', today, 'daily', '0.9') + entry('/nba-grid/answers/', today, 'daily', '0.7') + [...live].reverse().map(k => entry(`/nba-grid/answers/${k}/`, k, 'never', '0.5')).join('') + `  <!-- /GRID-ANSWERS -->`;
let sm2 = /<!-- GRID-ANSWERS -->[\s\S]*?<!-- \/GRID-ANSWERS -->/.test(sm) ? sm.replace(/<!-- GRID-ANSWERS -->[\s\S]*?<!-- \/GRID-ANSWERS -->/, block) : sm.replace('</urlset>', '  ' + block + nl + '</urlset>');
if (sm2 !== sm) { fs.writeFileSync(sp, sm2); changed++; }
console.log(`NBA GRID pages: ${live.length} answer pages through ${today}${changed ? ' (updated)' : ''}.`);
