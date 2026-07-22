// Placeholder birthday dataset — replace with a live NBA data feed later.
// month/day are 1-indexed real-world birthdates; used to check against today's date.
const nbaBirthdays = [
    { name: 'LeBron James', team: 'Lakers', month: 12, day: 30, year: 1984 },
    { name: 'Stephen Curry', team: 'Warriors', month: 3, day: 14, year: 1988 },
    { name: 'Kevin Durant', team: 'Suns', month: 9, day: 29, year: 1988 },
    { name: 'Giannis Antetokounmpo', team: 'Bucks', month: 12, day: 6, year: 1994 },
    { name: 'Nikola Jokic', team: 'Nuggets', month: 2, day: 19, year: 1995 },
    { name: 'Luka Doncic', team: 'Lakers', month: 2, day: 28, year: 1999 },
    { name: 'Joel Embiid', team: '76ers', month: 3, day: 16, year: 1994 },
    { name: 'Jayson Tatum', team: 'Celtics', month: 3, day: 3, year: 1998 },
    { name: 'Devin Booker', team: 'Suns', month: 10, day: 30, year: 1996 },
    { name: 'Damian Lillard', team: 'Bucks', month: 7, day: 15, year: 1990 },
    { name: 'Anthony Davis', team: 'Mavericks', month: 3, day: 11, year: 1993 },
    { name: 'Ja Morant', team: 'Grizzlies', month: 8, day: 10, year: 1999 },
    { name: 'Trae Young', team: 'Hawks', month: 9, day: 19, year: 1998 },
    { name: 'Zion Williamson', team: 'Pelicans', month: 7, day: 6, year: 2000 },
    { name: 'Shai Gilgeous-Alexander', team: 'Thunder', month: 7, day: 12, year: 1998 },
    { name: 'Donovan Mitchell', team: 'Cavaliers', month: 9, day: 7, year: 1996 },
    { name: 'Jaylen Brown', team: 'Celtics', month: 10, day: 24, year: 1996 },
    { name: 'Kawhi Leonard', team: 'Clippers', month: 6, day: 29, year: 1991 },
    { name: 'Paul George', team: 'Sixers', month: 5, day: 2, year: 1990 },
    { name: 'James Harden', team: 'Clippers', month: 8, day: 26, year: 1989 },
    { name: 'Kyrie Irving', team: 'Mavericks', month: 3, day: 23, year: 1992 },
    { name: 'Klay Thompson', team: 'Mavericks', month: 2, day: 8, year: 1990 },
    { name: 'Draymond Green', team: 'Warriors', month: 3, day: 4, year: 1990 },
    { name: 'Bam Adebayo', team: 'Heat', month: 7, day: 18, year: 1997 },
    { name: 'Jimmy Butler', team: 'Warriors', month: 9, day: 14, year: 1989 },
    { name: 'Karl-Anthony Towns', team: 'Knicks', month: 11, day: 15, year: 1995 },
    { name: 'Rudy Gobert', team: 'Timberwolves', month: 6, day: 26, year: 1992 },
    { name: 'De\'Aaron Fox', team: 'Spurs', month: 12, day: 20, year: 1997 },
    { name: 'Domantas Sabonis', team: 'Kings', month: 5, day: 3, year: 1996 },
    { name: 'Tyrese Haliburton', team: 'Pacers', month: 2, day: 29, year: 2000 },
    { name: 'Anthony Edwards', team: 'Timberwolves', month: 8, day: 5, year: 2001 },
    { name: 'Victor Wembanyama', team: 'Spurs', month: 1, day: 4, year: 2004 },
    { name: 'Paolo Banchero', team: 'Magic', month: 11, day: 12, year: 2002 },
    { name: 'Scottie Barnes', team: 'Raptors', month: 8, day: 1, year: 2001 },
    { name: 'Franz Wagner', team: 'Magic', month: 8, day: 27, year: 2001 },
    { name: 'Chet Holmgren', team: 'Thunder', month: 5, day: 1, year: 2002 },
    { name: 'Alperen Sengun', team: 'Rockets', month: 7, day: 25, year: 2002 },
    { name: 'Cade Cunningham', team: 'Pistons', month: 9, day: 25, year: 2001 },
    { name: 'Kristaps Porzingis', team: 'Celtics', month: 8, day: 2, year: 1995 },
    { name: 'Fred VanVleet', team: 'Rockets', month: 2, day: 25, year: 1994 },
];

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const today = new Date();
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

document.getElementById('birthday-date').textContent =
    `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${ordinal(today.getDate())}, ${today.getFullYear()}`;

const todaysBirthdays = nbaBirthdays.filter(
    p => p.month === today.getMonth() + 1 && p.day === today.getDate()
);

const listEl = document.getElementById('birthday-list');

function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

if (todaysBirthdays.length === 0) {
    listEl.innerHTML = `
        <div class="today-card md:col-span-2 lg:col-span-3">
            <div class="today-card-icon"><span class="material-symbols-outlined">event_busy</span></div>
            <h3 class="font-headline-md text-[22px] mb-sm uppercase">No Birthdays Found Today</h3>
            <p class="text-on-surface-variant text-body-md">Check back tomorrow — this section refreshes daily. Below is our current placeholder database sample.</p>
        </div>`;
} else {
    listEl.innerHTML = todaysBirthdays.map(p => {
        const turningAge = today.getFullYear() - p.year;
        return `
            <div class="birthday-card">
                <div class="birthday-avatar">${initials(p.name)}</div>
                <div>
                    <h3 class="font-headline-md text-[18px] uppercase leading-tight">${p.name}</h3>
                    <p class="font-label-caps text-xs text-primary mt-1">${p.team.toUpperCase()}</p>
                    <p class="text-on-surface-variant text-body-md mt-1">Turns ${turningAge} today</p>
                </div>
            </div>`;
    }).join('');
}
