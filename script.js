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
const gridCategories = [
    { id: 1, name: 'CURRENT MVP CANDIDATES', className: 'grid-cat-1', items: ['JOKIC', 'DONCIC', 'GIANNIS', 'SHAI'] },
    { id: 2, name: '2020s CHAMPIONS', className: 'grid-cat-2', items: ['LAKERS', 'BUCKS', 'WARRIORS', 'NUGGETS'] },
    { id: 3, name: 'HALL OF FAME CENTERS', className: 'grid-cat-3', items: ['KAREEM', 'SHAQ', 'OLAJUWON', 'RUSSELL'] },
    { id: 4, name: 'WORE NUMBER 23', className: 'grid-cat-4', items: ['JORDAN', 'LEBRON', 'DRAYMOND', 'ANTETOKOUNMPO'] },
];

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

    // Puzzle number derived from today's date so it changes daily
    const EPOCH = new Date('2026-01-01T00:00:00Z');
    const todayKey = new Date().toISOString().slice(0, 10);
    const puzzleNo = Math.max(1, Math.floor((new Date(todayKey) - EPOCH) / 86400000) + 1);
    if (puzzleNoEl) puzzleNoEl.textContent = `GRID #${String(puzzleNo).padStart(3, '0')}`;

    // Daily streak tracking (localStorage)
    function updateStreak(won) {
        const data = JSON.parse(localStorage.getItem('nbagrid-streak') || '{}');
        if (data.lastPlayed === todayKey) {
            if (streakCountEl) streakCountEl.textContent = data.current || 0;
            return;
        }
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
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
        document.body.style.overflow = 'hidden';
        loadIndex();
        setTimeout(() => input.focus(), 10);
    }

    function closeSearch() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        input.value = '';
        resultsEl.innerHTML = '';
    }

    trigger.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSearch();
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
