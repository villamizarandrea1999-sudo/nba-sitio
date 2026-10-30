// Micro-interactions for hover effects
document.querySelectorAll('article').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Simple ticker stop/start on hover
const ticker = document.querySelector('.animate-ticker');
if (ticker) {
    ticker.addEventListener('mouseenter', () => {
        ticker.style.animationPlayState = 'paused';
    });
    ticker.addEventListener('mouseleave', () => {
        ticker.style.animationPlayState = 'running';
    });
}

// NBA Daily Grid (Connections-style puzzle)
// Puzzle bank: one puzzle per day, rotating by the player's local date.
// Rules for new puzzles: stable historical facts only (no "current roster" facts),
// 16 unique tiles, and every tile must fit exactly one of its puzzle's four groups.
const gridPuzzles = [
    [['2023-24 ALL-NBA FIRST TEAM', ['JOKIC', 'DONCIC', 'GIANNIS', 'SHAI']],
     ['2020s CHAMPIONS', ['LAKERS', 'BUCKS', 'WARRIORS', 'NUGGETS']],
     ['HALL OF FAME CENTERS', ['KAREEM', 'SHAQ', 'OLAJUWON', 'RUSSELL']],
     ['WORE NUMBER 23', ['JORDAN', 'LEBRON', 'DRAYMOND', 'DAVIS']]],
    [['TEAM NAMES NOT ENDING IN S', ['HEAT', 'MAGIC', 'JAZZ', 'THUNDER']],
     ['OLD FRANCHISE NAMES', ['BULLETS', 'SUPERSONICS', 'BOBCATS', 'BRAVES']],
     ['NO. 1 OVERALL PICKS', ['DUNCAN', 'WEMBANYAMA', 'EDWARDS', 'GRIFFIN']],
     ['PLAYED AT GEORGETOWN', ['MOURNING', 'MUTOMBO', 'IVERSON', 'PORTER']]],
    [['CALIFORNIA TEAMS', ['LAKERS', 'CLIPPERS', 'WARRIORS', 'KINGS']],
     ['THREE-POINT CONTEST WINNERS', ['BIRD', 'CURRY', 'LILLARD', 'BOOKER']],
     ['DUNK CONTEST WINNERS', ['CARTER', 'WILKINS', 'LAVINE', 'GRIFFIN']],
     ['DEFENSIVE PLAYER OF THE YEAR', ['MUTOMBO', 'GOBERT', 'RODMAN', 'SMART']]],
    [['PLAYED AT KENTUCKY', ['TOWNS', 'BOOKER', 'FOX', 'ADEBAYO']],
     ['PLAYED AT DUKE', ['IRVING', 'TATUM', 'WILLIAMSON', 'BANCHERO']],
     ['PLAYED AT NORTH CAROLINA', ['JORDAN', 'CARTER', 'WORTHY', 'JAMISON']],
     ['PLAYED AT UCLA', ['KAREEM', 'WALTON', 'WESTBROOK', 'LOVE']]],
    [['DRAFTED STRAIGHT FROM HIGH SCHOOL', ['GARNETT', 'STOUDEMIRE', 'MCGRADY', 'HOWARD']],
     ['TWO-TIME FINALS MVPS', ['DURANT', 'LEONARD', 'BIRD', 'OLAJUWON']],
     ['HALL OF FAME NICKNAMES', ['THE MAILMAN', 'THE ADMIRAL', 'THE GLOVE', 'THE ANSWER']],
     ['SIXTH MAN OF THE YEAR', ['GINOBILI', 'CRAWFORD', 'HARDEN', 'MCHALE']]],
    [['ROOKIE OF THE YEAR', ['ROSE', 'LILLARD', 'MORANT', 'WEMBANYAMA']],
     ['TEAMS NAMED AFTER ANIMALS', ['BULLS', 'RAPTORS', 'GRIZZLIES', 'PELICANS']],
     ['CANADIAN PLAYERS', ['MURRAY', 'OLYNYK', 'BARRETT', 'NASH']],
     ['COACHED 5+ TITLE TEAMS', ['JACKSON', 'AUERBACH', 'POPOVICH', 'RILEY']]],
    [['SPANISH PLAYERS', ['GASOL', 'RUBIO', 'CALDERON', 'HERNANGOMEZ']],
     ['FRENCH PLAYERS', ['WEMBANYAMA', 'GOBERT', 'PARKER', 'BATUM']],
     ['AUSTRALIAN PLAYERS', ['GIDDEY', 'MILLS', 'BOGUT', 'INGLES']],
     ['GERMAN PLAYERS', ['NOWITZKI', 'SCHRODER', 'WAGNER', 'THEIS']]],
    [['WORE NUMBER 33', ['BIRD', 'EWING', 'PIPPEN', 'MOURNING']],
     ['WORE NUMBER 32', ['MAGIC', 'MALONE', 'MCHALE', 'GRIFFIN']],
     ['WORE NUMBER 34', ['OLAJUWON', 'BARKLEY', 'GIANNIS', 'PIERCE']],
     ['WORE NUMBER 0', ['WESTBROOK', 'TATUM', 'LILLARD', 'ARENAS']]],
    [['MVP WINNERS', ['ROSE', 'NOWITZKI', 'EMBIID', 'WESTBROOK']],
     ['DEFENSIVE PLAYER OF THE YEAR', ['WALLACE', 'HOWARD', 'MUTOMBO', 'JACKSON']],
     ['1996 DRAFT CLASS', ['ALLEN', 'STOJAKOVIC', 'MARBURY', 'WALKER']],
     ['FRANCHISES THAT RELOCATED', ['GRIZZLIES', 'THUNDER', 'NETS', 'JAZZ']]],
    [['NO. 1 OVERALL PICKS', ['YAO', 'ODEN', 'FULTZ', 'AYTON']],
     ['2008 CELTICS CHAMPIONS', ['PIERCE', 'GARNETT', 'ALLEN', 'RONDO']],
     ['2016 CAVALIERS CHAMPIONS', ['LOVE', 'THOMPSON', 'SMITH', 'SHUMPERT']],
     ['2014 SPURS CHAMPIONS', ['PARKER', 'GINOBILI', 'LEONARD', 'DIAW']]],
    [['WON 2+ SCORING TITLES', ['GERVIN', 'MCGRADY', 'HARDEN', 'DURANT']],
     ['PLAYED AT KANSAS', ['PIERCE', 'WIGGINS', 'MANNING', 'CHALMERS']],
     ['DUNK CONTEST WINNERS', ['HOWARD', 'WEBB', 'ROBINSON', 'MCCLUNG']],
     ['CENTRAL DIVISION TEAMS', ['BULLS', 'CAVALIERS', 'PISTONS', 'PACERS']]],
    [['5-FOOT-9 OR SHORTER', ['BOGUES', 'WEBB', 'ROBINSON', 'THOMAS']],
     ['7-FOOT-4 OR TALLER', ['MURESAN', 'BOL', 'YAO', 'EDEY']],
     ['THREE-POINT CONTEST WINNERS', ['ALLEN', 'NOWITZKI', 'IRVING', 'THOMPSON']],
     ['SIXTH MAN OF THE YEAR', ['WILLIAMS', 'HERRO', 'CLARKSON', 'KUKOC']]],
    [['FINALS MVPS', ['DUNCAN', 'PARKER', 'IGUODALA', 'BILLUPS']],
     ['1995-96 BULLS', ['PIPPEN', 'RODMAN', 'KUKOC', 'KERR']],
     ['PLAYED AT GONZAGA', ['STOCKTON', 'HACHIMURA', 'SABONIS', 'MORRISON']],
     ['PLAYED AT MICHIGAN STATE', ['JOHNSON', 'GREEN', 'RICHARDSON', 'BRIDGES']]],
    [['ATLANTIC DIVISION', ['CELTICS', 'NETS', '76ERS', 'RAPTORS']],
     ['NORTHWEST DIVISION', ['NUGGETS', 'TIMBERWOLVES', 'BLAZERS', 'JAZZ']],
     ['SOUTHWEST DIVISION', ['MAVERICKS', 'ROCKETS', 'PELICANS', 'SPURS']],
     ['PACIFIC DIVISION', ['WARRIORS', 'LAKERS', 'SUNS', 'KINGS']]],
    [['NICKNAMES', ['THE DREAM', 'THE BEARD', 'THE TRUTH', 'THE MAILMAN']],
     ['HAD A BROTHER IN THE NBA', ['LOPEZ', 'MORRIS', 'HOLIDAY', 'BALL']],
     ['SON OF AN NBA PLAYER', ['BRYANT', 'RIVERS', 'SABONIS', 'JAMES']],
     ['SERBIAN PLAYERS', ['JOKIC', 'BOGDANOVIC', 'DIVAC', 'KRSTIC']]],
    [['BACK-TO-BACK MVPS', ['NASH', 'CURRY', 'DUNCAN', 'JOKIC']],
     ['BORN IN AFRICA', ['OLAJUWON', 'IBAKA', 'SIAKAM', 'DENG']],
     ['PLAYED FOR THE 76ERS', ['IVERSON', 'ERVING', 'BARKLEY', 'SIMMONS']],
     ['FORMER ABA TEAMS', ['NETS', 'PACERS', 'SPURS', 'NUGGETS']]],
    [['TITLES WITH 3 DIFFERENT TEAMS', ['HORRY', 'GREEN', 'SALLEY', 'LEBRON']],
     ['WON TITLES AS PLAYER AND COACH', ['KERR', 'JACKSON', 'RILEY', 'LUE']],
     ['ONE-FRANCHISE CAREERS', ['NOWITZKI', 'DUNCAN', 'STOCKTON', 'MILLER']],
     ['PLAYED AT VILLANOVA', ['BRUNSON', 'BRIDGES', 'DIVINCENZO', 'HART']]],
    [['TEAM MASCOTS', ['BENNY', 'ROCKY', 'CLUTCH', 'BURNIE']],
     ['HALL OF FAME POINT GUARDS', ['NASH', 'STOCKTON', 'PAYTON', 'THOMAS']],
     ['MULTIPLE-TIME DPOY', ['MUTOMBO', 'WALLACE', 'GOBERT', 'HOWARD']],
     ['ROOKIE OF THE YEAR', ['ROBINSON', 'DUNCAN', 'PAUL', 'ROY']]],
    [['NBA AWARD NAMESAKES', ['HAVLICEK', 'MIKAN', 'AUERBACH', 'WEST']],
     ['1992 DREAM TEAM', ['LAETTNER', 'MULLIN', 'DREXLER', 'PIPPEN']],
     ['KNICKS LEGENDS', ['EWING', 'FRAZIER', 'REED', 'KING']],
     ['SPURS LEGENDS', ['GERVIN', 'DUNCAN', 'GINOBILI', 'PARKER']]],
    [['PLAYED FOR THE SUPERSONICS', ['PAYTON', 'KEMP', 'ALLEN', 'DURANT']],
     ['PLAYED FOR VANCOUVER', ['ABDUR-RAHIM', 'BIBBY', 'REEVES', 'SWIFT']],
     ['PLAYED FOR NEW JERSEY', ['KIDD', 'CARTER', 'MARTIN', 'PETROVIC']],
     ['PLAYED FOR THE BOBCATS', ['WALKER', 'OKAFOR', 'WALLACE', 'FELTON']]],
    [['SCORED 70+ IN A GAME', ['BOOKER', 'EMBIID', 'MITCHELL', 'ROBINSON']],
     ['CELTICS LEGENDS', ['RUSSELL', 'COUSY', 'HAVLICEK', 'MCHALE']],
     ['BULLS LEGENDS', ['PIPPEN', 'ROSE', 'GILMORE', 'NOAH']],
     ['LAKERS LEGENDS', ['WEST', 'WORTHY', 'MIKAN', 'FISHER']]],
    [['COACHED A TITLE TEAM', ['SPOELSTRA', 'CARLISLE', 'NURSE', 'VOGEL']],
     ['MOST IMPROVED PLAYER', ['SIAKAM', 'RANDLE', 'MORANT', 'MAXEY']],
     ['WARRIORS DYNASTY CORE', ['CURRY', 'THOMPSON', 'GREEN', 'IGUODALA']],
     ['2024 CELTICS CHAMPIONS', ['TATUM', 'BROWN', 'HOLIDAY', 'WHITE']]],
    [['UNDRAFTED', ['VANVLEET', 'CARUSO', 'REID', 'HASLEM']],
     ['SECOND-ROUND PICKS', ['JOKIC', 'GREEN', 'ARENAS', 'GINOBILI']],
     ['TOP-5 PICKS IN 2003 (NOT LEBRON)', ['MILICIC', 'ANTHONY', 'BOSH', 'WADE']],
     ['2004 PISTONS CHAMPIONS', ['BILLUPS', 'HAMILTON', 'PRINCE', 'WALLACE']]],
    [['ROOKIE OF THE YEAR', ['BANCHERO', 'BARNES', 'BALL', 'CASTLE']],
     ['LAST NAMES THAT ARE COLORS', ['GREEN', 'WHITE', 'BROWN', 'BLACK']],
     ['2025 THUNDER CHAMPIONS', ['SHAI', 'WILLIAMS', 'HOLMGREN', 'DORT']],
     ['WORE NUMBER 1', ['MCGRADY', 'HARDAWAY', 'ROBERTSON', 'ROSE']]],
];

// Day number counted from 2026-01-01 using the player's local calendar date
function gridLocalDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const gridNow = new Date();
const gridDayNo = Math.max(1, Math.round((Date.UTC(gridNow.getFullYear(), gridNow.getMonth(), gridNow.getDate()) - Date.UTC(2026, 0, 1)) / 86400000) + 1);
const gridCategories = gridPuzzles[(gridDayNo - 1) % gridPuzzles.length].map(([name, items], i) => (
    { id: i + 1, name, className: `grid-cat-${i + 1}`, items }
));

const gridEl = document.getElementById('nba-grid');
const solvedEl = document.getElementById('grid-solved');
const statusEl = document.getElementById('grid-status');
const mistakesEl = document.getElementById('grid-mistakes');
const shuffleBtn = document.getElementById('grid-shuffle');
const deselectBtn = document.getElementById('grid-deselect');
const submitBtn = document.getElementById('grid-submit');
const shareBtn = document.getElementById('grid-share');
const guessesLeftEl = document.getElementById('grid-guesses-left');
const correctCountEl = document.getElementById('grid-correct-count');
const streakCountEl = document.getElementById('grid-streak-count');
const puzzleNoEl = document.getElementById('grid-puzzle-no');

if (gridEl) {
    let selected = [];
    let mistakesLeft = 4;
    let correctCount = 0;
    let guessLog = [];
    let remainingCategories = JSON.parse(JSON.stringify(gridCategories));

    // Puzzle number follows the same local date that picked today's puzzle
    const todayKey = gridLocalDateKey(gridNow);
    const puzzleNo = gridDayNo;
    if (puzzleNoEl) puzzleNoEl.textContent = `GRID #${String(puzzleNo).padStart(3, '0')}`;

    // Daily streak tracking (localStorage)
    function updateStreak(won) {
        const data = JSON.parse(localStorage.getItem('nbagrid-streak') || '{}');
        if (data.lastPlayed === todayKey) {
            if (streakCountEl) streakCountEl.textContent = data.current || 0;
            return;
        }
        const yesterday = gridLocalDateKey(new Date(gridNow.getFullYear(), gridNow.getMonth(), gridNow.getDate() - 1));
        let current = won ? (data.lastPlayed === yesterday ? (data.current || 0) + 1 : 1) : 0;
        const best = Math.max(current, data.best || 0);
        localStorage.setItem('nbagrid-streak', JSON.stringify({ current, best, lastPlayed: todayKey }));
        if (streakCountEl) streakCountEl.textContent = current;
    }

    (function initStreakDisplay() {
        const data = JSON.parse(localStorage.getItem('nbagrid-streak') || '{}');
        if (streakCountEl) streakCountEl.textContent = data.current || 0;
    })();

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderGrid() {
        gridEl.innerHTML = '';
        const cells = shuffle(
            remainingCategories.flatMap(cat =>
                cat.items.map(item => ({ item, catId: cat.id }))
            )
        );
        cells.forEach(({ item, catId }) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = item;
            cell.dataset.item = item;
            cell.dataset.catId = catId;
            if (selected.includes(item)) cell.classList.add('selected');
            cell.addEventListener('click', () => toggleSelect(item, cell));
            gridEl.appendChild(cell);
        });
    }

    function toggleSelect(item, cell) {
        if (selected.includes(item)) {
            selected = selected.filter(i => i !== item);
            cell.classList.remove('selected');
            return;
        }
        if (selected.length >= 4) return;
        selected.push(item);
        cell.classList.add('selected');
    }

    function updateMistakesDisplay() {
        [...mistakesEl.children].forEach((dot, i) => {
            dot.style.opacity = i < mistakesLeft ? '1' : '0.15';
        });
        if (guessesLeftEl) guessesLeftEl.textContent = mistakesLeft;
        if (correctCountEl) correctCountEl.textContent = `${correctCount}/4`;
    }

    function buildShareText(won) {
        const emojiRows = guessLog.map(row => row.map(ok => (ok ? '🟩' : '🟥')).join('')).join('\n');
        return `NBA GRID #${String(puzzleNo).padStart(3, '0')} ${won ? correctCount + '/4' : 'X/4'}\n${emojiRows}\nnba-grid.com`;
    }

    function endGame(message, won) {
        statusEl.textContent = message;
        submitBtn.disabled = true;
        shuffleBtn.disabled = true;
        submitBtn.classList.add('opacity-50');
        shuffleBtn.classList.add('opacity-50');
        updateStreak(won);
        if (shareBtn) {
            shareBtn.classList.remove('hidden');
            shareBtn.onclick = () => {
                const text = buildShareText(won);
                if (navigator.clipboard) navigator.clipboard.writeText(text);
                statusEl.textContent = 'RESULT COPIED TO CLIPBOARD';
            };
        }
    }

    submitBtn.addEventListener('click', () => {
        if (selected.length !== 4) {
            statusEl.textContent = 'SELECT 4 ITEMS FIRST';
            return;
        }
        const catId = gridEl.querySelector(`[data-item="${selected[0]}"]`).dataset.catId;
        const allMatch = selected.every(
            item => gridEl.querySelector(`[data-item="${item}"]`).dataset.catId === catId
        );

        if (allMatch) {
            const cat = remainingCategories.find(c => String(c.id) === catId);
            const row = document.createElement('div');
            row.className = `grid-solved-row ${cat.className}`;
            row.innerHTML = `<span class="cat-name">${cat.name}</span><span class="cat-items">${cat.items.join(', ')}</span>`;
            solvedEl.appendChild(row);
            remainingCategories = remainingCategories.filter(c => c.id !== cat.id);
            selected = [];
            correctCount += 1;
            guessLog.push([true]);
            statusEl.textContent = 'CORRECT!';
            renderGrid();
            updateMistakesDisplay();
            if (remainingCategories.length === 0) {
                endGame('YOU SOLVED THE GRID!', true);
            }
        } else {
            mistakesLeft -= 1;
            guessLog.push([false]);
            updateMistakesDisplay();
            selected.forEach(item => {
                const cell = gridEl.querySelector(`[data-item="${item}"]`);
                cell.classList.add('shake');
                setTimeout(() => cell.classList.remove('shake'), 400);
            });
            statusEl.textContent = 'NOT QUITE, TRY AGAIN';
            if (mistakesLeft <= 0) {
                selected = [];
                renderGrid();
                endGame('OUT OF GUESSES — NICE TRY!', false);
            }
        }
    });

    shuffleBtn.addEventListener('click', renderGrid);

    deselectBtn.addEventListener('click', () => {
        selected = [];
        renderGrid();
        statusEl.textContent = '';
    });

    updateMistakesDisplay();
    renderGrid();
}

// Site search
(function () {
    const trigger = document.getElementById('search-trigger');
    const overlay = document.getElementById('search-overlay');
    if (!trigger || !overlay) return;

    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    const closeBtn = document.getElementById('search-close');

    let indexData = null;
    let indexPromise = null;

    function loadIndex() {
        if (!indexPromise) {
            indexPromise = fetch('/search-index.json')
                .then((r) => r.json())
                .then((data) => {
                    indexData = data;
                    return data;
                })
                .catch(() => {
                    resultsEl.innerHTML = '<p class="search-empty">Search is unavailable right now.</p>';
                    return [];
                });
        }
        return indexPromise;
    }

    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function render(results, query) {
        if (!query) {
            resultsEl.innerHTML = '';
            return;
        }
        if (results.length === 0) {
            resultsEl.innerHTML = '<p class="search-empty">No results for "' + escapeHtml(query) + '"</p>';
            return;
        }
        resultsEl.innerHTML = results
            .slice(0, 8)
            .map(
                (r) =>
                    '<a class="search-result" href="' + r.url + '">' +
                    '<span class="search-result-title">' + escapeHtml(r.title) + '</span>' +
                    '<span class="search-result-desc">' + escapeHtml(r.description) + '</span>' +
                    '</a>'
            )
            .join('');
    }

    function openSearch() {
        overlay.classList.add('is-open');
        loadIndex();
        setTimeout(() => input.focus(), 10);
    }

    function closeSearch() {
        overlay.classList.remove('is-open');
        input.value = '';
        resultsEl.innerHTML = '';
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (overlay.classList.contains('is-open')) {
            closeSearch();
        } else {
            openSearch();
        }
    });
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    document.addEventListener('click', (e) => {
        if (overlay.classList.contains('is-open') && !overlay.contains(e.target) && e.target !== trigger) {
            closeSearch();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeSearch();
    });

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
            resultsEl.innerHTML = '';
            return;
        }
        loadIndex().then((data) => {
            const results = data.filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q)
            );
            render(results, q);
        });
    });
})();

// Back to top button
(function () {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    function toggleVisibility() {
        if (window.scrollY > 500) {
            btn.classList.add('is-visible');
        } else {
            btn.classList.remove('is-visible');
        }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
