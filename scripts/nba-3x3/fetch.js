// Downloads raw Basketball-Reference pages into a cache dir, paced to respect rate limits.
// Usage: node fetch.js <cacheDir> <listFile>   (listFile: one path per line, e.g. teams/BOS/players.html)
const fs = require('fs'), path = require('path');
const [cache, listFile] = process.argv.slice(2);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(cache, { recursive: true });
  const list = fs.readFileSync(listFile, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const p of list) {
    const out = path.join(cache, p.replace(/\//g, '__'));
    if (fs.existsSync(out) && fs.statSync(out).size > 1000) continue;
    const r = await fetch('https://www.basketball-reference.com/' + p, { headers: { 'User-Agent': UA } });
    if (r.status !== 200) { console.log('STOP', r.status, p); process.exit(1); }
    fs.writeFileSync(out, await r.text());
    console.log('ok', p);
    await sleep(5000);
  }
  console.log('DONE');
})();
