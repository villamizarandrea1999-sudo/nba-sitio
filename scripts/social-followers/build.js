#!/usr/bin/env node
/*
 * Builds /most-followed-nba-players-social-media/index.html (and its chart image)
 * from scripts/social-followers/data.json.
 *
 *   node scripts/social-followers/build.js          -> build (refuses if any data is missing)
 *   node scripts/social-followers/build.js --check  -> only list what is still missing
 *
 * Monthly refresh: update every count + "pulled_on" in data.json, run the build, commit.
 */
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..', '..');
// SF_DATA / SF_OUT_ROOT let you test the build against sample data without touching the site.
const ROOT = process.env.SF_OUT_ROOT ? path.resolve(process.env.SF_OUT_ROOT) : SITE;
const DATA = process.env.SF_DATA ? path.resolve(process.env.SF_DATA) : path.join(__dirname, 'data.json');
const SLUG = 'most-followed-nba-players-social-media';
const URL = `https://nba-grid.com/${SLUG}/`;
const OUT = path.join(ROOT, SLUG, 'index.html');
const TEMPLATE = path.join(SITE, 'blog','lebron-james-76ers-debut', 'index.html');
const PLATFORMS = ['instagram', 'x', 'tiktok'];
const PLATFORM_NAME = { instagram: 'Instagram', x: 'X', tiktok: 'TikTok', facebook: 'Facebook' };
const PROFILE_URL = {
  instagram: h => `https://www.instagram.com/${h}/`,
  x: h => `https://x.com/${h}`,
  tiktok: h => `https://www.tiktok.com/@${h}`,
  facebook: h => `https://www.facebook.com/${h}`,
};

const d = JSON.parse(fs.readFileSync(DATA, 'utf8'));

/* ---------- validation: never publish a half-filled page ---------- */
const missing = [];
const okCount = c => c === 'none' || (Number.isInteger(c) && c >= 0);
if (!/^\d{4}-\d{2}-\d{2}$/.test(d.pulled_on || '')) missing.push('pulled_on (date the counts were pulled, YYYY-MM-DD)');
for (const p of d.players) {
  if (p.status === 'active' && (!p.team_checked || p.team === 'VERIFY')) missing.push(`${p.name}: confirm current team`);
  for (const k of PLATFORMS) {
    const a = p.accounts[k];
    if (!okCount(a.count)) missing.push(`${p.name}: ${PLATFORM_NAME[k]} count`);
    else if (a.count !== 'none' && !a.handle) missing.push(`${p.name}: ${PLATFORM_NAME[k]} handle`);
  }
}
for (const t of d.teams) if (!okCount(t.instagram.count) || t.instagram.count === 'none') missing.push(`Team ${t.name}: Instagram count`);
for (const a of d.athletes) if (!okCount(a.instagram.count) || a.instagram.count === 'none') missing.push(`${a.name}: Instagram count`);

if (missing.length) {
  console.error(`Not building: ${missing.length} item(s) still missing in data.json:\n- ` + missing.join('\n- '));
  process.exit(1);
}
if (process.argv.includes('--check')) { console.log('data.json is complete.'); process.exit(0); }

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = c => (c === 'none' ? 0 : c);
const fmt = c => (c === 'none' ? '—' : c < 100000 ? '&lt;0.1M' : (c / 1e6).toFixed(1) + 'M');
const fmtPlain = c => (c === 'none' ? 'no account' : c < 100000 ? 'under 0.1 million' : (c / 1e6).toFixed(1) + ' million');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = iso => { const [y, m, dd] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${dd}, ${y}`; };
const monthYear = iso => { const [y, m] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const year = d.pulled_on.slice(0, 4);
const ageOn = (born, on) => {
  const [by, bm, bd] = born.split('-').map(Number); const [y, m, dd] = on.split('-').map(Number);
  return y - by - (m < bm || (m === bm && dd < bd) ? 1 : 0);
};
const handleLink = (k, a) => (a.count === 'none' || !a.handle ? '' :
  `<a href="${PROFILE_URL[k](a.handle)}" class="text-primary underline" rel="noopener" target="_blank">@${esc(a.handle)}</a>`);

for (const p of d.players) {
  p.total = PLATFORMS.reduce((s, k) => s + num(p.accounts[k].count), 0);
  p.ig = num(p.accounts.instagram.count);
  p.age = ageOn(p.born, d.pulled_on);
}
const active = d.players.filter(p => p.status === 'active');
const retired = d.players.filter(p => p.status === 'retired').sort((a, b) => b.total - a.total);
const top10 = [...active].sort((a, b) => b.total - a.total).slice(0, 10);
const igTop10 = [...active].sort((a, b) => b.ig - a.ig).slice(0, 10);
const young = active.filter(p => p.age <= 25).sort((a, b) => b.total - a.total).slice(0, 8);
if (young.length < 5) { console.error('Need at least 5 players aged 25 or under for the young-players section.'); process.exit(1); }
const everyone = [...d.players].sort((a, b) => b.total - a.total);
const lebron = d.players.find(p => p.name === 'LeBron James');
const curry = d.players.find(p => p.name === 'Stephen Curry');
const no1 = top10[0], no2 = top10[1];
const igNo1 = igTop10[0];
const teams = [...d.teams].sort((a, b) => b.instagram.count - a.instagram.count);
const top10Sum = top10.reduce((s, p) => s + p.total, 0);
const lebronRank = top10.indexOf(lebron) + 1;

/* ---------- tables ---------- */
const TH = t => `<th class="text-left py-sm pr-sm">${t}</th>`;
const table = (heads, rows) => `<div class="overflow-x-auto my-md">
<table class="w-full border-collapse text-sm">
<thead>
<tr class="font-label-caps text-xs text-on-surface-variant border-b border-on-surface-variant/20">
${heads.map(TH).join('\n')}
</tr>
</thead>
<tbody class="font-stats-number text-sm">
${rows.map(r => `<tr class="border-b border-on-surface-variant/5">${r.map((c, i) => `<td class="py-sm pr-sm${i === 1 ? ' font-headline-md' : ''}">${c}</td>`).join('')}</tr>`).join('\n')}
</tbody>
</table>
</div>`;

const allTable = table(['#', 'Player', 'Team', 'Instagram', 'X', 'TikTok', 'Total'],
  top10.map((p, i) => [i + 1, esc(p.name), esc(p.team), ...PLATFORMS.map(k => fmt(p.accounts[k].count)), `<strong>${fmt(p.total)}</strong>`]));
const igTable = table(['#', 'Player', 'Team', 'Instagram handle', 'Instagram followers'],
  igTop10.map((p, i) => [i + 1, esc(p.name), esc(p.team), handleLink('instagram', p.accounts.instagram), `<strong>${fmt(p.ig)}</strong>`]));
const lebronTable = table(['Platform', 'Account', 'Followers'],
  [...PLATFORMS.map(k => [PLATFORM_NAME[k], handleLink(k, lebron.accounts[k]) || '—', fmt(lebron.accounts[k].count)]),
   ['<strong>Total</strong>', '', `<strong>${fmt(lebron.total)}</strong>`]]);
const youngTable = table(['Player', 'Team', 'Age', 'Instagram', 'Total'],
  young.map(p => [esc(p.name), esc(p.team), p.age, fmt(p.ig), `<strong>${fmt(p.total)}</strong>`]));

/* ---------- copy ---------- */
const H2 = t => `<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">${t}</h2>`;
const H3 = t => `<h3 class="font-headline-md text-xl mt-md mb-xs">${t}</h3>`;
const ratio = (a, b) => (a / b >= 1.95 ? `about ${(a / b).toFixed(1)} times` : `${Math.round((a / b - 1) * 100)}% more than`);

const intro = `<p>${esc(no1.name)} is the most followed NBA player on social media, with ${fmtPlain(no1.total)} followers across Instagram, X and TikTok combined${no1 === igNo1 ? `, and he is also the most followed NBA player on Instagram with ${fmtPlain(no1.ig)}` : `, while ${esc(igNo1.name)} leads on Instagram with ${fmtPlain(igNo1.ig)}`}. Below you'll find the full top 10 across all platforms, a separate Instagram ranking, a LeBron James breakdown, profiles of every player, and the young players worth following.</p>
<p class="font-label-caps text-xs text-on-surface-variant"><strong>Last updated: ${longDate(d.pulled_on)}.</strong> Every number was read from the player's official profile on that date and rounded to one decimal in millions. "Total" adds Instagram, X and TikTok; "—" means we found no verified official account. The ranking covers active players only.</p>`;

const allSection = `${H2(`Top 10 most followed NBA players (all platforms)`)}
<p>Instagram is where NBA stars build the biggest audiences, so it drives most of this ranking, but X still adds tens of millions for the league's veterans. ${esc(no1.name)} has ${ratio(no1.total, no2.total)} the combined following of ${esc(no2.name)} in second place, and the top 10 together add up to ${fmtPlain(top10Sum)} followers.</p>
${allTable}
<p><strong>Platform by platform:</strong> ${PLATFORMS.map(k => { const top = [...active].sort((a, b) => num(b.accounts[k].count) - num(a.accounts[k].count))[0]; return `${PLATFORM_NAME[k]} is led by ${esc(top.name)} (${fmtPlain(top.accounts[k].count)})`; }).join('; ')}. ${active.filter(p => p.accounts.tiktok.count === 'none').length} of the ${active.length} active players we track have no verified TikTok account we could find, which is why that column is the thinnest.</p>`;

const igSection = `${H2(`Most followed NBA players on Instagram`)}
<p>If you only care about Instagram, here are the NBA players with the most Instagram followers right now. ${esc(igNo1.name)} sits at No. 1 with ${fmtPlain(igNo1.ig)}, followed by ${esc(igTop10[1].name)} (${fmtPlain(igTop10[1].ig)}) and ${esc(igTop10[2].name)} (${fmtPlain(igTop10[2].ig)}). To crack this Instagram top 10 you currently need ${fmtPlain(igTop10[9].ig)} followers, the number held by ${esc(igTop10[9].name)} at No. 10. Handles link to the official, verified accounts.</p>
${igTable}`;

const athletesAbove = d.athletes.filter(a => a.instagram.count > lebron.ig);
const athletesBelow = d.athletes.filter(a => a.instagram.count <= lebron.ig);
const athleteLine = d.athletes.map(a => `${esc(a.name)} (${a.sport}) has ${fmtPlain(a.instagram.count)}`).join(', ').replace(/, ([^,]*)$/, ' and $1');
const lebronSection = `${H2(`How many followers does LeBron James have?`)}
<p>LeBron James has ${fmtPlain(lebron.total)} social media followers across Instagram, X and TikTok, including ${fmtPlain(lebron.ig)} Instagram followers on <a href="${PROFILE_URL.instagram(lebron.accounts.instagram.handle)}" class="text-primary underline" rel="noopener" target="_blank">@${esc(lebron.accounts.instagram.handle)}</a>. That makes "King James" ${lebronRank === 1 ? 'the most followed NBA player' : `No. ${lebronRank} among NBA players`} by a wide margin${curry ? `, with ${ratio(lebron.total, curry.total)} Stephen Curry's total` : ''}.</p>
${lebronTable}
<p>How does that compare outside basketball? Among the global athletes we checked on the same day, ${athleteLine} on Instagram. ${athletesAbove.length ? `That puts LeBron behind ${athletesAbove.map(a => esc(a.name)).join(', ').replace(/, ([^,]*)$/, ' and $1')}` : 'LeBron is ahead of all of them'}${athletesBelow.length && athletesAbove.length ? `, but ahead of ${athletesBelow.map(a => esc(a.name)).join(', ').replace(/, ([^,]*)$/, ' and $1')}` : ''}, and far ahead of every other NBA player.</p>
<p>His audience has followed him through four franchises, and his move to Philadelphia this season (more on that in our <a href="/blog/lebron-james-76ers-debut/" class="text-primary underline">LeBron James 76ers debut</a> story) means his posts now reach Sixers fans too. With up to 450 NBA roster spots (see <a href="/blog/how-many-nba-players-are-there/" class="text-primary underline">how many NBA players there are</a>), no one else comes close to his reach.</p>`;

const profiles = `${H2(`Player profiles: the top 10`)}
${top10.map((p, i) => {
  const acc = PLATFORMS.filter(k => p.accounts[k].count !== 'none').map(k => `${PLATFORM_NAME[k]} ${handleLink(k, p.accounts[k])} (${fmt(p.accounts[k].count)})`).join(', ');
  const share = Math.round((p.total / top10Sum) * 100);
  return `${H3(`${i + 1}. ${esc(p.name)}, ${esc(p.team)}`)}
<p><strong>Accounts:</strong> ${acc}. <strong>Total:</strong> ${fmt(p.total)}, or ${share}% of all followers in this top 10.</p>
<p>${esc(p.fact)}</p>`;
}).join('\n')}`;

const youngSection = `${H2(`Young NBA players to follow on social media`)}
<p>The next wave of NBA stars is already building big audiences. These are the most followed players aged 25 or under (ages as of ${longDate(d.pulled_on)}), ranked by combined followers. ${esc(young[0].name)} leads the group with ${fmtPlain(young[0].total)}. Their numbers are still a fraction of LeBron's, but these are the accounts most likely to define the next generation of NBA social media.</p>
${youngTable}
<ul class="list-disc pl-lg space-y-2">
${young.map(p => `<li><strong>${esc(p.name)}</strong> (${handleLink('instagram', p.accounts.instagram) || 'no Instagram'}): ${esc(p.fact)}</li>`).join('\n')}
</ul>`;

const g = d.growth && d.growth.players && d.growth.players.length ? [...d.growth.players].sort((a, b) => b.instagram_gain - a.instagram_gain) : null;
const growthSection = `${H2(`Fastest-growing NBA accounts`)}
${g ? `<p>Over the last 12 months, ${esc(g[0].name)} added the most Instagram followers among the players we track (${fmtPlain(g[0].instagram_gain)}), according to <a href="${esc(d.growth.source_url)}" class="text-primary underline" rel="noopener" target="_blank">${esc(d.growth.source_name)}</a>.</p>
<ul class="list-disc pl-lg space-y-2">${g.slice(0, 5).map(x => `<li><strong>${esc(x.name)}</strong>: +${fmt(x.instagram_gain)} on Instagram</li>`).join('')}</ul>`
  : `<p>This is the first edition of this ranking, so ${longDate(d.pulled_on)} is our baseline. Each monthly update will compare every account against the previous month, and this section will show who gained the most followers.</p>`}`;

const retiredNote = retired.length ? `<p class="text-sm text-on-surface-variant"><strong>Retired players (not ranked):</strong> ${retired.map(p => `${esc(p.name)} has ${fmt(p.total)} combined followers (${fmt(p.ig)} on Instagram)`).join('; ')}.</p>` : '';

const faqs = [
  ['Who is the most followed NBA player?', `${everyone[0].name} is the most followed NBA player${everyone[0].status === 'retired' ? ' (retired)' : ''}, with ${fmtPlain(everyone[0].total)} followers across Instagram, X and TikTok as of ${longDate(d.pulled_on)}.`],
  ['Who is the most followed active NBA player on Instagram?', `${igNo1.name} has the most Instagram followers of any active NBA player, with ${fmtPlain(igNo1.ig)}. ${igTop10[1].name} is second with ${fmtPlain(igTop10[1].ig)}.`],
  ['What is the most followed NBA team on Instagram?', `The ${teams[0].name} are the most followed NBA team on Instagram, with ${fmtPlain(teams[0].instagram.count)} followers, ahead of the ${teams[1].name} (${fmtPlain(teams[1].instagram.count)}).`],
  ['Does LeBron James have more followers than Stephen Curry?', curry ? (lebron.total > curry.total
    ? `Yes. LeBron James has ${fmtPlain(lebron.total)} combined followers, compared with ${fmtPlain(curry.total)} for Stephen Curry. On Instagram alone it's ${fmtPlain(lebron.ig)} to ${fmtPlain(curry.ig)}.`
    : `No. Stephen Curry has ${fmtPlain(curry.total)} combined followers, compared with ${fmtPlain(lebron.total)} for LeBron James.`) : ''],
  ['How many Instagram followers does LeBron James have?', `LeBron James has ${fmtPlain(lebron.ig)} Instagram followers on @${lebron.accounts.instagram.handle}, as of ${longDate(d.pulled_on)}.`],
].filter(f => f[1]);
const teamSection = `${H2('Most followed NBA teams on Instagram')}
<p>Teams build audiences differently from players: their accounts post every highlight, every game day and every behind-the-scenes clip, so the biggest franchises outdraw most individual players. Of the teams we checked, the ${esc(teams[0].name)} lead with ${fmtPlain(teams[0].instagram.count)} Instagram followers. For comparison, LeBron James alone has ${ratio(lebron.ig, teams[0].instagram.count)} the following of the most followed team.</p>
${table(['#', 'Team', 'Instagram handle', 'Followers'], teams.map((t, i) => [i + 1, esc(t.name), handleLink('instagram', t.instagram), `<strong>${fmt(t.instagram.count)}</strong>`]))}`;
const faqSection = `${H2('FAQ')}
${faqs.map(([q, a]) => `${H3(esc(q))}\n<p>${esc(a)}</p>`).join('\n')}`;

const methodSection = `${H2('How we update this list')}
<p>Every follower count on this page is read directly from each player's official Instagram, X and TikTok profile, never copied from other articles, and the date pulled is shown at the top. Instagram counts are exact; X and TikTok display follower counts rounded to one decimal, which is the precision we use. Facebook is not included because public pages only show large follower counts rounded to the nearest million, too coarse for a ranking like this. We refresh the numbers monthly; if you spot a change in team or a new official account, email <a href="mailto:davis.vance@nba-grid.com" class="text-primary underline">davis.vance@nba-grid.com</a>.</p>`;

const body = [intro, allSection, igSection, lebronSection, profiles, youngSection, growthSection, retiredNote, teamSection, faqSection, methodSection].join('\n\n');
const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

/* ---------- meta ---------- */
const title = `Most Followed NBA Players on Instagram & Social Media (${year})`;
const h1 = `Most Followed NBA Players on Social Media in ${year}`;
const desc = `${no1.name} is the most followed NBA player with ${fmtPlain(no1.total)} followers. Full NBA top 10 ranked across Instagram, X and TikTok, updated ${monthYear(d.pulled_on)}.`;
const IMG = `/assets/images/most-followed-nba-players-${year}.jpg`;
const imgAlt = `Chart of the most followed NBA players on Instagram and social media in ${year}`;
const updatedByline = d.pulled_on !== d.published
  ? `\n<span>•</span>\n<span class="byline-updated">Updated <time datetime="${d.pulled_on}">${longDate(d.pulled_on)}</time></span>` : '';

/* ---------- page shell, reused from an existing article so nav/footer stay identical ---------- */
const tpl = fs.readFileSync(TEMPLATE, 'utf8');
const analytics = tpl.slice(tpl.indexOf('<script>'), tpl.indexOf('</script>') + 9);
const fontsAndCss = tpl.slice(tpl.indexOf('<link rel="stylesheet"'), tpl.indexOf('<script type="application/ld+json">')).replace(/\.\.\/\.\.\//g, '/');
const header = tpl.slice(tpl.indexOf('<body'), tpl.indexOf('<main'));
const authorBox = tpl.slice(tpl.indexOf('<div class="article-author-box">'), tpl.indexOf('<h2', tpl.indexOf('<div class="article-author-box">')));
const footer = tpl.slice(tpl.indexOf('</main>')).replace(/\.\.\/\.\.\//g, '/');

const ld = obj => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
const schema = [
  ld({ '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'en-US', headline: h1, description: desc,
    image: [`https://nba-grid.com${IMG}`], datePublished: d.published, dateModified: d.pulled_on, mainEntityOfPage: URL,
    author: { '@type': 'Person', name: 'Davis Vance', url: 'https://nba-grid.com/author/davis-vance/', jobTitle: 'Sports Journalist' },
    publisher: { '@type': 'Organization', name: 'NBA GRID', url: 'https://nba-grid.com', logo: { '@type': 'ImageObject', url: 'https://nba-grid.com/assets/nba-grid-logo.png' } } }),
  ld({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }),
  ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'NBA GRID', item: 'https://nba-grid.com' },
    { '@type': 'ListItem', position: 2, name: 'Most Followed NBA Players', item: URL }] }),
].join('\n');

const html = `<!DOCTYPE html>
<html class="light" lang="en"><head>
${analytics}

<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>
<link rel="alternate" hreflang="en-us" href="${URL}"/>
<link rel="alternate" hreflang="x-default" href="${URL}"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${URL}"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${esc(h1)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="https://nba-grid.com${IMG}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="${URL}"/>
<meta name="twitter:card" content="summary_large_image"/>
${fontsAndCss.trim()}
${schema}
</head>
${header}<main class="max-w-container-max mx-auto px-grid-margin py-md">
<div class="mb-md font-label-caps text-xs text-on-surface-variant">
<a href="/" class="hover:text-primary transition-colors">HOME</a><span class="mx-1">/</span><span class="text-primary">MOST FOLLOWED NBA PLAYERS</span>
</div>
<article class="editorial-article">
<header class="mb-lg">
<span class="article-tag">Rankings</span>
<h1>${esc(h1)}</h1>
<p class="article-dek">Who has the biggest following on Instagram, X and TikTok, from LeBron James to the young stars catching up. Counted from official profiles and updated monthly.</p>
<div class="article-meta">
<span>By <a href="/author/davis-vance/" rel="author" class="hover:text-primary underline">Davis Vance</a></span>
<span>•</span>
<span class="byline-published">Published <time datetime="${d.published}">${longDate(d.published)}</time></span>${updatedByline}
<span>•</span>
<span>${Math.max(1, Math.round(words / 230))} min read</span>
</div>
</header>
<div class="prose-article text-body-lg text-on-surface space-y-md">

<img class="hero-image" src="${IMG}" width="1200" height="630" alt="${esc(imgAlt)}" loading="eager" fetchpriority="high"/>
<p class="article-caption">Combined followers on Instagram, X and TikTok, active players, ${longDate(d.pulled_on)}.</p>

${body}

</div>
${authorBox}<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-md">More From NBA GRID</h2>
<div class="related-articles-grid grid grid-cols-1 md:grid-cols-3 gap-grid-gutter mb-lg">
<a href="/blog/lebron-james-76ers-debut/">
<img width="1280" height="764" src="/assets/images/lebron-embiid-76ers.jpg" alt="LeBron James Makes 76ers Debut" loading="lazy"/>
<div class="related-title">LeBron James' 76ers Debut</div>
</a>
<a href="/blog/how-many-nba-players-are-there/">
<img width="1280" height="853" src="/assets/images/nba-players-count.jpg" alt="How Many NBA Players Are There" loading="lazy"/>
<div class="related-title">How Many NBA Players Are There?</div>
</a>
<a href="/blog/tallest-nba-player-right-now/">
<img width="1280" height="2096" src="/assets/images/tallest-player-hoop-closeup.jpg" alt="Tallest NBA Player Right Now" loading="lazy"/>
<div class="related-title">Tallest NBA Player Right Now</div>
</a>
</div>
<div class="flex flex-wrap gap-sm mt-xl pt-lg border-t border-on-surface-variant/10">
<a href="/" class="border border-on-surface font-label-caps text-xs px-sm py-xs hover:bg-on-surface hover:text-surface transition-colors">BACK TO HOME</a>
</div>
</article>
${footer}`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);

/* ---------- chart image (unique to this page) ---------- */
const max = top10[0].total;
const bars = top10.map((p, i) => {
  const y = 150 + i * 44, w = Math.max(4, Math.round((p.total / max) * 640));
  return `<text x="300" y="${y + 22}" text-anchor="end" font-family="Arial, sans-serif" font-size="22" fill="#ffffff">${esc(p.name)}</text>
<rect x="320" y="${y}" width="${w}" height="30" rx="4" fill="${i === 0 ? '#F2762E' : '#8a8a8a'}"/>
<text x="${330 + w}" y="${y + 22}" font-family="Consolas, monospace" font-size="20" fill="#ffffff">${(p.total / 1e6).toFixed(1)}M</text>`;
}).join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#1a1c1c"/>
<text x="60" y="78" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#ffffff">MOST FOLLOWED NBA PLAYERS ${year}</text>
<text x="60" y="116" font-family="Arial, sans-serif" font-size="22" fill="#bdbdbd">Instagram + X + TikTok, ${longDate(d.pulled_on)} · nba-grid.com</text>
${bars}
<rect y="610" width="1200" height="20" fill="#F2762E"/></svg>`;
let sharp = null;
try { sharp = require('sharp'); } catch (e) { /* optional */ }
const finish = () => console.log(`Built ${path.relative(ROOT, OUT)}: ${words} words, title ${title.length} chars, description ${desc.length} chars.`
  + (desc.length < 150 || desc.length > 160 ? '  WARNING: description outside 150-160.' : '')
  + (words < 1800 || words > 2200 ? '  NOTE: word count outside 1,800-2,200 target.' : ''));
if (sharp) sharp(Buffer.from(svg)).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(ROOT, IMG)).then(finish);
else { fs.writeFileSync(path.join(ROOT, IMG.replace('.jpg', '.svg')), svg); console.warn('sharp not installed: wrote the chart as SVG; convert it to JPG before publishing.'); finish(); }
