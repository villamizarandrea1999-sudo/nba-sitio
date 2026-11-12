# One-time edit: turns /blog/nba-immaculate-grid/ into a playable page (NBA GRID 3x3 game on top + guide below).
import io, json, re, sys
P = 'blog/nba-immaculate-grid/index.html'
raw = io.open(P, encoding='utf-8-sig', newline='').read()
crlf = '\r\n' in raw
s = raw.replace('\r\n', '\n')
MOD = '2026-11-11T20:00:00-05:00'
TITLE = "Immaculate Grid Basketball: Play Today's NBA Grid + Strategy"
DESC = "Play a free daily NBA 3x3 grid like Immaculate Grid Basketball: name a player for every team, award and stat square. Plus where to play the official grid and tips."
H1 = "Immaculate Grid Basketball: Play Today's NBA 3x3 Grid"
OLD_T = 'NBA Immaculate Grid Strategy: How to Go Immaculate'
OLD_D = 'The strategy pros use to solve NBA Immaculate Grid without a single wrong guess — plus a free daily NBA grid puzzle of our own to play right now.'

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count: sys.exit(f'expected {count} of: {a[:70]!r}, found {n}')
    s = s.replace(a, b)

rep(f'<title>{OLD_T}</title>', f'<title>{TITLE}</title>')
rep(f'<meta property="og:title" content="{OLD_T}"/>', f'<meta property="og:title" content="{TITLE}"/>')
rep(OLD_D, DESC, 3)  # meta description, og:description, JSON-LD description
rep(f'"headline": "{OLD_T}"', f'"headline": "{H1}"')
rep('"dateModified": "2026-10-31T12:41:28-05:00"', f'"dateModified": "{MOD}"')
rep(f'<h1>{OLD_T}</h1>', f'<h1>{H1}</h1>')
rep('<p class="article-dek">The exact strategy pros use to fill all nine squares correctly on the first try — plus our own free daily NBA grid puzzle you can play right now.</p>',
    '<p class="article-dek">Play our free daily NBA 3x3 grid right here: name a player for every team, award and stat square. Below it: how the official Immaculate Grid basketball game works, where to play it, and how to go immaculate.</p>')
rep('<span class="byline-updated">Updated <time datetime="2026-10-31T12:41:28-05:00">October 31, 2026</time></span>',
    f'<span class="byline-updated">Updated <time datetime="{MOD}">November 11, 2026</time></span>')
rep('<span>5 min read</span>', '<span>6 min read</span>')

GAME = '''<section id="play" class="g3-shell" aria-label="NBA GRID 3x3 daily game">
<div id="g3-root" data-src="/assets/data/nba-3x3.json">
<div class="g3-top">
<div><span id="g3-no" class="g3-kicker">LOADING TODAY'S GRID…</span><p class="g3-title">NBA GRID 3x3</p></div>
<select id="g3-archive" class="daily-grid-btn-ghost" aria-label="Choose a grid from the archive"></select>
</div>
<div class="g3-stats">
<div class="daily-grid-stat"><span class="daily-grid-stat-value" id="g3-filled">0/9</span><span class="daily-grid-stat-label">SOLVED</span></div>
<div class="daily-grid-stat"><span class="daily-grid-stat-value" id="g3-strikes">3</span><span class="daily-grid-stat-label">STRIKES LEFT</span></div>
<div class="daily-grid-stat"><span class="daily-grid-stat-value" id="g3-score">–</span><span class="daily-grid-stat-label">DEEP CUT</span></div>
<div class="daily-grid-stat"><span class="daily-grid-stat-value" id="g3-streak">0</span><span class="daily-grid-stat-label">STREAK 🔥</span></div>
</div>
<div id="g3-grid" class="g3-grid"></div>
<div class="g3-actions">
<button id="g3-giveup" type="button" class="daily-grid-btn-ghost">GIVE UP &amp; SHOW ANSWERS</button>
<button id="g3-share" type="button" class="daily-grid-btn-primary hidden">SHARE RESULT</button>
</div>
<p id="g3-status" class="g3-status" aria-live="polite"></p>
<p class="g3-rules">Pick a square and name an NBA player who fits both its row and its column. Each player can be used once. You get three strikes. Rarer correct answers earn a higher Deep Cut score. A new grid goes up every day at midnight your time.</p>
<div id="g3-search" class="g3-panel hidden" role="dialog" aria-label="Name a player">
<div class="g3-panel-top"><span id="g3-search-title" class="g3-panel-title"></span><button id="g3-close" type="button" class="g3-x" aria-label="Close">✕</button></div>
<input id="g3-input" class="g3-input" type="text" autocomplete="off" placeholder="Type a player's name…" aria-label="Player name"/>
<div id="g3-results" class="g3-results"></div>
</div>
<div id="g3-answers" class="g3-panel hidden" role="dialog" aria-label="Possible answers">
<div class="g3-panel-top"><span id="g3-answers-title" class="g3-panel-title"></span><button id="g3-answers-close" type="button" class="g3-x" aria-label="Close">✕</button></div>
<ul id="g3-answers-list" class="g3-answers-list"></ul>
</div>
</div>
</section>
'''
INTRO_END = 'and you can\'t use the same player twice anywhere on the board.</p>\n'
rep(INTRO_END, INTRO_END + GAME)

HOW = '''<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">How to Play Our NBA 3x3 Grid</h2>
<p>Our grid at the top of this page plays like the Immaculate Grid basketball game, with a few differences. Every day you get a new 3x3 board. The rows and columns are NBA franchises, awards, single-season stat marks, decades or "teammate of" a star. Click a square, start typing a name, and pick the player from the list.</p>
<ul class="list-disc pl-lg space-y-2">
<li><strong>Three strikes, not nine guesses.</strong> A wrong answer costs a strike. Three strikes and the grid is over, so you can keep guessing on a square until you run out.</li>
<li><strong>Deep Cut score.</strong> Every correct square shows how deep a cut your pick was, from 0% (the player with the most career games among all valid answers) to 100% (the one with the fewest). Your score is the average across all nine squares.</li>
<li><strong>Franchise history counts.</strong> A SuperSonics player counts for the Thunder, a Bobcats player counts for the Hornets, and a Washington Bullets player counts for the Wizards.</li>
<li><strong>NBA seasons only.</strong> Stats, awards and teams come from NBA (and BAA) seasons on Basketball-Reference. ABA seasons don't count. Season marks need at least 40 games played.</li>
<li><strong>"Teammate of"</strong> means the two players appeared for the same team in the same season.</li>
<li><strong>Archive.</strong> Missed a day? Pick any past grid from the menu above the board. Archive grids don't count toward your streak.</li>
</ul>
<p>When the grid ends, tap any square to see every player who fits it. The player data was last updated from Basketball-Reference on November 11, 2026, and we refresh it during the season.</p>

'''
rep('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">How Scoring Works</h2>',
    HOW + '<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">How Scoring Works in the Official Immaculate Grid</h2>')
rep('<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">Put the Strategy to Work: Play Our Daily Grid</h2>\n<p>Ready to try these tactics? Our <a href="/#daily-grid" class="text-primary underline">Daily Grid</a> uses',
    '<h2 class="font-headline-md text-headline-md uppercase italic mt-lg mb-sm">Put the Strategy to Work</h2>\n<p>The fastest way to practice is the <a href="#play" class="text-primary underline">NBA 3x3 grid at the top of this page</a>: same format, a new board every day. Want a different kind of puzzle? Our <a href="/#daily-grid" class="text-primary underline">Daily Grid</a> uses')

NEWFAQ = [
    ("Where can I play Immaculate Grid basketball?", "The official Immaculate Grid basketball game is free on Sports Reference. You can also play our own daily NBA 3x3 grid at the top of this page, with a new board every day and an archive of past grids."),
    ("Is there a new NBA grid every day?", "Yes. Both the official Immaculate Grid and our NBA 3x3 grid post a new puzzle every day. Ours switches over at midnight your local time."),
    ("How does the Deep Cut score work?", "In our grid, each correct answer is scored from 0% to 100% based on how many career games the player has compared with every other valid answer for that square. Fewer games means a deeper cut and a higher score."),
]
faq_html = ''.join(f'<div><h3 class="font-headline-md text-[18px] mb-1">{q}</h3><p class="text-on-surface-variant">{a}</p></div>\n' for q, a in NEWFAQ)
rep('<div class="space-y-md mt-sm">\n<div><h3 class="font-headline-md text-[18px] mb-1">What is NBA Immaculate Grid?</h3>',
    '<div class="space-y-md mt-sm">\n' + faq_html + '<div><h3 class="font-headline-md text-[18px] mb-1">What is NBA Immaculate Grid?</h3>')

# JSON-LD: add new FAQs + a WebApplication entry for the game
m = re.search(r'<script type="application/ld\+json">\s*(\{\s*"@context": "https://schema.org",\s*"@type": "FAQPage"[\s\S]*?)</script>', s)
faq = json.loads(m.group(1))
faq['mainEntity'] = [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in NEWFAQ] + faq['mainEntity']
app = {'@context': 'https://schema.org', '@type': 'WebApplication', 'name': 'NBA GRID 3x3', 'url': 'https://nba-grid.com/blog/nba-immaculate-grid/#play',
       'applicationCategory': 'GameApplication', 'operatingSystem': 'Any', 'browserRequirements': 'Requires JavaScript',
       'description': 'A free daily NBA trivia grid: name a player who fits each row and column of a 3x3 board.',
       'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}, 'publisher': {'@type': 'Organization', 'name': 'NBA GRID', 'url': 'https://nba-grid.com'}}
s = s[:m.start(1)] + json.dumps(faq, indent=2, ensure_ascii=False) + '\n' + s[m.end(1):]
s = s.replace('</head>', '<script type="application/ld+json">\n' + json.dumps(app, indent=2) + '\n</script>\n</head>', 1)
rep('<script src="../../script.js"></script>', '<script src="../../script.js"></script>\n<script src="/assets/js/nba-3x3.js" defer></script>')
if crlf: s = s.replace('\n', '\r\n')
io.open(P, 'w', encoding='utf-8-sig', newline='').write(s)
print('page updated')
