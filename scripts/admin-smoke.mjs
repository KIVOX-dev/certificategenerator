// Drives the admin panel in a real browser: login -> dashboard -> events -> certificates -> logout.
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/admin-smoke.mjs
import puppeteer from 'puppeteer';

const ADMIN = process.env.ADMIN_URL || 'http://localhost:3001/admin';
const ok = (m) => console.log(`✓ ${m}`);
const fail = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/401/.test(m.text()) && errors.push(m.text()));
  page.on('response', (r) => r.status() === 404 && errors.push('404 ' + r.url()));

  await page.goto(`${ADMIN}`, { waitUntil: 'networkidle0' });
  if (!page.url().endsWith('/admin/login')) fail(`unauthenticated visit should redirect to login, got ${page.url()}`);
  ok('unauthenticated visit redirects to /admin/login');
  const logo = await page.$eval('img.login-logo', (i) => i.complete && i.naturalWidth > 0);
  logo ? ok('logo loads on the login page') : fail('logo did not load');

  await page.type('#email', process.env.ADMIN_EMAIL);
  await page.type('#password', 'wrong-password');
  await page.click('button[type=submit]');
  await page.waitForSelector('[role=alert]');
  ok('wrong password shows an error');

  await page.$eval('#password', (e) => (e.value = ''));
  await page.type('#password', process.env.ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForFunction(() => document.body.innerText.includes('Total Certificates'), { timeout: 20000 });
  await page.waitForFunction(() => ![...document.querySelectorAll('.stat b')].some((e) => e.textContent === '…'), { timeout: 20000 }).catch(() => undefined);
  const stats = await page.$$eval('.stat b', (els) => els.map((e) => e.textContent));
  if (stats.some((s) => s === '…')) fail('dashboard stats did not load');
  ok(`dashboard stats: ${stats.join(' / ')}`);

  await page.goto(`${ADMIN}/events`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('CLEANUP2026'));
  ok('events list shows sample event');
  await page.click('a[href$="/events/new"]');
  await page.waitForSelector('#name');
  await page.type('#name', 'Admin Smoke Test');
  await page.type('#organizationName', 'ABC Foundation');
  await page.click('button:not([type=button])');
  await page.waitForFunction(() => document.body.innerText.includes('COPY REGISTRATION LINK'), { timeout: 20000 });
  const qr = await page.$eval('img.qr', (i) => i.complete && i.naturalWidth > 0);
  qr ? ok('event created; registration link + QR shown') : fail('QR missing');

  await page.goto(`${ADMIN}/certificates`, { waitUntil: 'networkidle0' });
  await page.type('input[aria-label="Search certificates"]', 'Ramesh');
  await page.waitForFunction(() => document.body.innerText.includes('WTL-FAID-00001'));
  ok('certificate search by name works');
  await page.goto(`${ADMIN}/registrations`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => /\+91\d{10}/.test(document.body.innerText));
  ok('registrations show phone numbers to the admin');

  await page.goto(`${ADMIN}/settings`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Log out').click());
  await page.waitForFunction(() => location.pathname.endsWith('/login'));
  ok('logout returns to login');
  await page.goto(`${ADMIN}/certificates`, { waitUntil: 'networkidle0' });
  page.url().endsWith('/login') ? ok('session is really gone after logout') : fail('still logged in after logout');

  errors.length ? fail('console errors: ' + errors.join(' | ')) : ok('no console errors');
} finally {
  await browser.close();
}
console.log('\nADMIN SMOKE TEST PASSED');
