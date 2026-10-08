import puppeteer from 'puppeteer';
const [,, url, out] = process.argv;
const b = await puppeteer.launch({ headless: true });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 780, deviceScaleFactor: 1.5, isMobile: true });
await p.goto(url, { waitUntil: 'networkidle0' });
await p.screenshot({ path: out });
await b.close();
