// Placeholder birthday dataset — replace with a live NBA data feed later.
// month/day are 1-indexed real-world birthdates. nbaId is the official NBA.com
// stats player ID, used to load the headshot from the public NBA CDN.
const nbaBirthdays = [
    { name: 'LeBron James', team: 'Lakers', month: 12, day: 30, year: 1984, nbaId: 2544 },
    { name: 'Stephen Curry', team: 'Warriors', month: 3, day: 14, year: 1988, nbaId: 201939 },
    { name: 'Kevin Durant', team: 'Suns', month: 9, day: 29, year: 1988, nbaId: 201142 },
    { name: 'Giannis Antetokounmpo', team: 'Bucks', month: 12, day: 6, year: 1994, nbaId: 203507 },
    { name: 'Nikola Jokic', team: 'Nuggets', month: 2, day: 19, year: 1995, nbaId: 203999 },
    { name: 'Luka Doncic', team: 'Lakers', month: 2, day: 28, year: 1999, nbaId: 1629029 },
    { name: 'Joel Embiid', team: '76ers', month: 3, day: 16, year: 1994, nbaId: 203954 },
    { name: 'Jayson Tatum', team: 'Celtics', month: 3, day: 3, year: 1998, nbaId: 1628369 },
    { name: 'Devin Booker', team: 'Suns', month: 10, day: 30, year: 1996, nbaId: 1626164 },
    { name: 'Damian Lillard', team: 'Bucks', month: 7, day: 15, year: 1990, nbaId: 203081 },
    { name: 'Anthony Davis', team: 'Mavericks', month: 3, day: 11, year: 1993, nbaId: 203076 },
    { name: 'Ja Morant', team: 'Grizzlies', month: 8, day: 10, year: 1999, nbaId: 1629630 },
    { name: 'Trae Young', team: 'Hawks', month: 9, day: 19, year: 1998, nbaId: 1629027 },
    { name: 'Zion Williamson', team: 'Pelicans', month: 7, day: 6, year: 2000, nbaId: 1629627 },
    { name: 'Shai Gilgeous-Alexander', team: 'Thunder', month: 7, day: 12, year: 1998, nbaId: 1628983 },
    { name: 'Donovan Mitchell', team: 'Cavaliers', month: 9, day: 7, year: 1996, nbaId: 1628378 },
    { name: 'Jaylen Brown', team: 'Celtics', month: 10, day: 24, year: 1996, nbaId: 1627759 },
    { name: 'Kawhi Leonard', team: 'Clippers', month: 6, day: 29, year: 1991, nbaId: 202695 },
    { name: 'Paul George', team: 'Sixers', month: 5, day: 2, year: 1990, nbaId: 202331 },
    { name: 'James Harden', team: 'Clippers', month: 8, day: 26, year: 1989, nbaId: 201935 },
    { name: 'Kyrie Irving', team: 'Mavericks', month: 3, day: 23, year: 1992, nbaId: 202681 },
    { name: 'Klay Thompson', team: 'Mavericks', month: 2, day: 8, year: 1990, nbaId: 202691 },
    { name: 'Draymond Green', team: 'Warriors', month: 3, day: 4, year: 1990, nbaId: 203110 },
    { name: 'Bam Adebayo', team: 'Heat', month: 7, day: 18, year: 1997, nbaId: 1628389 },
    { name: 'Jimmy Butler', team: 'Warriors', month: 9, day: 14, year: 1989, nbaId: 202710 },
    { name: 'Karl-Anthony Towns', team: 'Knicks', month: 11, day: 15, year: 1995, nbaId: 1626157 },
    { name: 'Rudy Gobert', team: 'Timberwolves', month: 6, day: 26, year: 1992, nbaId: 203497 },
    { name: 'De\'Aaron Fox', team: 'Spurs', month: 12, day: 20, year: 1997, nbaId: 1628368 },
    { name: 'Domantas Sabonis', team: 'Kings', month: 5, day: 3, year: 1996, nbaId: 1627734 },
    { name: 'Tyrese Haliburton', team: 'Pacers', month: 2, day: 29, year: 2000, nbaId: 1630169 },
    { name: 'Anthony Edwards', team: 'Timberwolves', month: 8, day: 5, year: 2001, nbaId: 1630162 },
    { name: 'Victor Wembanyama', team: 'Spurs', month: 1, day: 4, year: 2004, nbaId: 1641705 },
    { name: 'Paolo Banchero', team: 'Magic', month: 11, day: 12, year: 2002, nbaId: 1631094 },
    { name: 'Scottie Barnes', team: 'Raptors', month: 8, day: 1, year: 2001, nbaId: 1630567 },
    { name: 'Franz Wagner', team: 'Magic', month: 8, day: 27, year: 2001, nbaId: 1630532 },
    { name: 'Chet Holmgren', team: 'Thunder', month: 5, day: 1, year: 2002, nbaId: 1631096 },
    { name: 'Alperen Sengun', team: 'Rockets', month: 7, day: 25, year: 2002, nbaId: 1630578 },
    { name: 'Cade Cunningham', team: 'Pistons', month: 9, day: 25, year: 2001, nbaId: 1630595 },
    { name: 'Kristaps Porzingis', team: 'Celtics', month: 8, day: 2, year: 1995, nbaId: 204001 },
    { name: 'Fred VanVleet', team: 'Rockets', month: 2, day: 25, year: 1994, nbaId: 1627832 },
];

const zodiacSigns = [
    { sign: 'Capricorn', emoji: '♑', endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', emoji: '♒', endMonth: 2, endDay: 18 },
    { sign: 'Pisces', emoji: '♓', endMonth: 3, endDay: 20 },
    { sign: 'Aries', emoji: '♈', endMonth: 4, endDay: 19 },
    { sign: 'Taurus', emoji: '♉', endMonth: 5, endDay: 20 },
    { sign: 'Gemini', emoji: '♊', endMonth: 6, endDay: 20 },
    { sign: 'Cancer', emoji: '♋', endMonth: 7, endDay: 22 },
    { sign: 'Leo', emoji: '♌', endMonth: 8, endDay: 22 },
    { sign: 'Virgo', emoji: '♍', endMonth: 9, endDay: 22 },
    { sign: 'Libra', emoji: '♎', endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', emoji: '♏', endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', emoji: '♐', endMonth: 12, endDay: 21 },
    { sign: 'Capricorn', emoji: '♑', endMonth: 12, endDay: 31 },
];

function getZodiacSign(month, day) {
    return zodiacSigns.find(z => month === z.endMonth && day <= z.endDay)
        || zodiacSigns.find(z => month < z.endMonth)
        || zodiacSigns[zodiacSigns.length - 1];
}

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

function headshotUrl(nbaId) {
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
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
        const zodiac = getZodiacSign(p.month, p.day);
        return `
            <div class="birthday-card">
                <img
                    class="birthday-photo"
                    src="${headshotUrl(p.nbaId)}"
                    alt="${p.name}"
                    loading="lazy"
                    onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'birthday-avatar', textContent: '${initials(p.name)}' }))"
                />
                <div>
                    <h3 class="font-headline-md text-[18px] uppercase leading-tight">${p.name}</h3>
                    <p class="font-label-caps text-xs text-primary mt-1">${p.team.toUpperCase()}</p>
                    <p class="text-on-surface-variant text-body-md mt-1">Turns ${turningAge} today · ${zodiac.emoji} ${zodiac.sign}</p>
                </div>
            </div>`;
    }).join('');
}
