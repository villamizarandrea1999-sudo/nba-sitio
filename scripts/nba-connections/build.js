// Builds /nba-connections/ : the playable NBA Connections daily puzzle on its own URL + its og image.
// The game markup is copied from the homepage block (index.html, "NBA Connections-style Daily Grid") so both stay
// identical; the game logic lives in /script.js (puzzle bank, ?day=N past puzzles, streak, share).
// /blog/nba-connections/ redirects here (meta refresh + canonical; GitHub Pages has no server 301s).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'https://nba-grid.com/nba-connections/';
const IMG = '/assets/images/nba-connections-daily-puzzle.jpg';

async function image() {
  const sharp = require('sharp');
  const W = 1280, H = 720, F = 'font-family="Arial, Helvetica, sans-serif"';
  const cols = ['#f0d24a', '#6fcf64', '#6f97ec', '#a875f0'];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#1c1b1b"/>`;
  s += `<text x="80" y="120" ${F} font-size="64" font-weight="700" font-style="italic" fill="#fcfcfb">NBA CONNECTIONS</text>`;
  s += `<text x="80" y="172" ${F} font-size="28" fill="#c9c4bf">Find four groups of four · New puzzle daily · NBA GRID</text>`;
  const x0 = 80, y0 = 220, tw = 268, th = 98, gap = 16;
  for (let r = 0; r < 4; r++) {
    if (r < 2) {
      s += `<rect x="${x0}" y="${y0 + r * (th + gap)}" width="${tw * 4 + gap * 3}" height="${th}" rx="14" fill="${cols[r]}"/>`;
      s += `<text x="${x0 + (tw * 4 + gap * 3) / 2}" y="${y0 + r * (th + gap) + 60}" text-anchor="middle" ${F} font-size="30" font-weight="700" fill="#1a1c1c">GROUP SOLVED</text>`;
    } else for (let c = 0; c < 4; c++) {
      const x = x0 + c * (tw + gap), y = y0 + r * (th + gap);
      s += `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="14" fill="#2c2a29" stroke="#8a847e" stroke-width="2"/>`;
      s += `<text x="${x + tw / 2}" y="${y + 62}" text-anchor="middle" ${F} font-size="40" font-weight="700" fill="#f28c28">?</text>`;
    }
  }
  s += '</svg>';
  await sharp(Buffer.from(s)).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, IMG.slice(1)));
}

const title = 'NBA Connections: Free Daily NBA Puzzle (Group 16 Names) | NBA GRID';
const h1 = 'NBA Connections: Today\'s Daily Puzzle';
const desc = 'Play today\'s NBA Connections puzzle free. Find four groups of four in 16 NBA names, keep your streak alive and share your score. New puzzle every day.';
const faqs = [
  ['Is NBA Connections free?', 'Yes. NBA Connections on NBA GRID is free to play in your browser, with no account, no app and no sign-up.'],
  ['What time does the new NBA Connections puzzle come out?', 'A new puzzle unlocks at midnight in your own time zone. The game follows the date on your device, so it changes over at local midnight wherever you are.'],
  ['Is NBA Connections like NYT Connections?', 'It uses the same format as The New York Times\' Connections: 16 tiles that hide four groups of four. The difference is that every category is about basketball, like awards, colleges, teams and jersey numbers. NBA GRID is an independent fan site and isn\'t affiliated with The New York Times or the NBA.'],
  ['How many mistakes do you get in NBA Connections?', 'Four. Each wrong guess costs one, and the puzzle ends after your fourth mistake.'],
  ['Can I play past NBA Connections puzzles?', 'Yes. The Past Puzzles list on this page links to the last seven days. Past puzzles don\'t count toward your streak.'],
  ['How does the NBA Connections streak work?', 'Your streak goes up by one each day you solve the puzzle and resets if you miss a day or run out of mistakes. It is saved in your browser, so it stays on the device you play on, and clearing your browser data resets it.'],
  ['Is there an official NBA Connections game?', 'The New York Times doesn\'t publish an NBA-only edition, though The Athletic has a general sports version of Connections. NBA versions like this one are made by fans and use the same format with basketball-only categories.'],
];
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const int = (href, txt) => `<a href="${href}" class="text-primary underline">${txt}</a>`;

// ---------- game markup from the homepage ----------
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const a = home.indexOf('<!-- NBA Connections-style Daily Grid -->'), b = home.indexOf('<!-- Últimas Noticias -->');
if (a < 0 || b < a) throw new Error('game block not found on homepage');
let game = home.slice(a, b).trim()
  .replace(/<!-- NBA Connections-style Daily Grid -->\s*<section class="mb-xl">/, '<section id="play" class="mb-lg">')
  .replace(/<!-- AUTO:PLAY-LINKS -->[\s\S]*?<!-- \/AUTO:PLAY-LINKS -->\s*/, '')
  .replace(/(<h2 id="daily-grid"[^>]*>)[^<]*(<\/h2>)/, '$1TODAY\'S PUZZLE$2');
if (!game.includes('id="nba-grid"') || !game.includes('id="play"')) throw new Error('game markup changed');

const body = `
${H2('How to Play NBA Connections').replace('<h2 ', '<h2 id="how-to-play" ')}
<ul class="list-disc pl-lg space-y-2 text-on-surface-variant">
<li><strong>Find four groups of four.</strong> The 16 tiles are NBA names, mostly players and sometimes teams, and they hide four categories.</li>
<li><strong>Select four tiles and hit Submit.</strong> If all four share a category, the group locks in and its name is revealed.</li>
<li><strong>Each solved group gets its own color:</strong> yellow, green, blue or purple, with the category name on top.</li>
<li><strong>You get four mistakes.</strong> A wrong guess costs one, and the fourth ends the puzzle.</li>
<li><strong>Share your result</strong> when you finish: one line per guess, 🟩 for a correct group and 🟥 for a miss, with no spoilers.</li>
</ul>

${H2('NBA Connections Tips & Strategy')}
<p>Every NBA Connections puzzle is built from a few kinds of categories: awards (MVP, Defensive Player of the Year, dunk and three-point contest winners), colleges, draft history like No. 1 overall picks, jersey numbers, champions, and franchise trivia like old team names. A good first step is to read all 16 tiles and ask which of those kinds each name could belong to.</p>
<p><strong>Start with the group you're surest about.</strong> Locking in an easy category shrinks the board and makes the rest clearer. If you can see two possible groups, submit the one with no doubtful names first.</p>
<p><strong>Watch for names that fit two categories.</strong> This is where most mistakes happen. Blake Griffin was a No. 1 overall pick and a Slam Dunk Contest winner. Devin Booker played at Kentucky and won the Three-Point Contest. Dikembe Mutombo played at Georgetown and won Defensive Player of the Year four times. When a name could go in two places, hold it until one of the groups is solved.</p>
<p><strong>Look for the wordplay group.</strong> Not every category is about basketball résumés. Some are about the names themselves, like last names that are colors (Green, White, Brown, Black) or team names that don't end in S (Heat, Magic, Jazz, Thunder). If four tiles look unrelated on the court, check the spelling.</p>
<p><strong>Count before you submit.</strong> With only four mistakes, a guess you're 50/50 on is expensive. Use Shuffle to break up the layout, since tiles sitting next to each other can trick you into seeing a group that isn't there.</p>
<p><strong>Save the hardest group for last.</strong> After three groups are solved, the last four tiles solve themselves. Many players never need to figure out the toughest category; they get it by elimination.</p>

${H2('Past NBA Connections Puzzles')}
<p>Missed a day? Replay any of the last seven puzzles. Past puzzles don't count toward your streak.</p>
<ul id="grid-past" class="list-disc pl-lg space-y-1 text-on-surface-variant"></ul>
<noscript><p>Turn on JavaScript to play today's puzzle and past puzzles.</p></noscript>

${H2('Frequently Asked Questions')}
<div class="space-y-md mt-sm">
${faqs.map(([q, ans]) => `<div><h3 class="font-headline-md text-[18px] mb-1">${esc(q)}</h3><p class="text-on-surface-variant">${esc(ans)}</p></div>`).join('\n')}
</div>

${H2('More NBA Games')}
<ul class="list-disc pl-lg space-y-2 text-on-surface-variant">
<li>${int('/blog/nba-immaculate-grid/#play', 'NBA 3x3 Grid (Immaculate Grid basketball)')}: name a player for every team, award and stat square.</li>
<li>${int('/', 'NBA GRID homepage')}: today's puzzle plus the latest NBA news, trades and injury updates.</li>
</ul>`;

// ---------- assemble from the luka weight page ----------
const tpl = fs.readFileSync(path.join(ROOT, 'blog/luka-doncic-weight/index.html'), 'utf8').replace(/\.\.\/\.\.\//g, '../');
const q = s => s.replace(/"/g, '&quot;');
let head = tpl.slice(0, tpl.indexOf('<script type="application/ld+json">'))
  .replace(/blog\/luka-doncic-weight\//g, 'nba-connections/')
  .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/(name="description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(property="og:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(property="og:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace(/(name="twitter:title" content=")[^"]*/, (m, x) => x + q(title))
  .replace(/(name="twitter:description" content=")[^"]*/, (m, x) => x + q(desc))
  .replace('property="og:type" content="article"', 'property="og:type" content="website"')
  .replace(/assets\/images\/luka-doncic-weight-chart\.jpg/g, IMG.slice(1));
if (/luka|doncic|weigh/i.test(head)) throw new Error('template leftovers in head: ' + head.match(/.*(luka|doncic|weigh).*/i)[0]);
const org = { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png', width: 512, height: 512 } };
const ld = [
  { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'NBA Connections', alternateName: 'NBA GRID Daily Grid', url: URL, description: desc, image: `https://nba-grid.com${IMG}`, inLanguage: 'en-US', applicationCategory: 'GameApplication', genre: 'Puzzle', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: org },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([qq, ans]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: ans } })) },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' }, { '@type': 'ListItem', position: 2, name: 'NBA Connections', item: URL }] },
].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`).join('\n');
const afterLd = tpl.slice(tpl.indexOf('</head>'), tpl.indexOf('<main'));
const footer = tpl.slice(tpl.indexOf('</article>') + '</article>'.length);
const main = `<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">NBA CONNECTIONS</span>
</div>
<header class="mb-md">
<h1 class="font-display-lg text-headline-lg-mobile md:text-headline-lg uppercase italic tracking-tighter">${h1}</h1>
<p class="text-on-surface-variant text-body-md mt-xs">Sort 16 NBA names into four groups of four. Free, no sign-up, and a new puzzle every day at midnight your time.</p>
</header>
${game}
<article class="editorial-article">
<div class="prose-article text-body-lg text-on-surface space-y-md">
${body}
</div>
</article>
`;
const html = head + ld + '\n' + afterLd + main + footer;
(async () => {
  await image();
  fs.mkdirSync(path.join(ROOT, 'nba-connections'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'nba-connections', 'index.html'), html);
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log('words', words, '| title', title.length, '| desc', desc.length);
})();
