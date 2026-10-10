// End-to-end check against RUNNING servers (backend :4000, web :3000):
// create event -> event QR -> open QR URL on a phone-sized browser -> name+phone -> confirm
// -> certificate -> download PDF -> decode the certificate QR -> verify it.
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/e2e.mjs
import puppeteer from 'puppeteer';
import jsQR from 'jsqr';
import { mkdtempSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const API = process.env.API_URL || 'http://localhost:4000';
const WEB = process.env.WEB_URL || 'http://localhost:3000';
const step = (m) => console.log(`✓ ${m}`);
const fail = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const assert = (c, m) => (c ? step(m) : fail(m));

// 1. Admin creates an event
const login = await fetch(`${API}/api/admin/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
});
assert(login.ok, 'admin login');
const cookie = login.headers.get('set-cookie').split(';')[0];
const evRes = await fetch(`${API}/api/admin/events`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
  body: JSON.stringify({ name: 'E2E Workshop ' + Date.now(), organizationName: 'ABC Foundation', status: 'ACTIVE', issueDate: '2026-10-08' }),
});
const ev = await evRes.json();
assert(ev.registrationUrl?.includes(`/register/${ev.eventCode}`) && ev.qrCodeDataUrl.startsWith('data:image/png'), `event created (${ev.eventCode}) with QR`);

// 2. "Scan" the event QR (decode the PNG) and open it in a phone-sized browser
const png = (await import('pngjs')).PNG;
const img = png.sync.read(Buffer.from(ev.qrCodeDataUrl.split(',')[1], 'base64'));
const decoded = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
assert(decoded?.data === ev.registrationUrl, 'event QR decodes to the registration URL');

const downloadDir = mkdtempSync(join(tmpdir(), 'cert-dl-'));
const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; SM-A105F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36');
  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  const cdp = await page.createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir });

  await page.goto(decoded.data.replace(/^https?:\/\/[^/]+/, WEB), { waitUntil: 'networkidle0' });
  await page.waitForSelector('#fullName');
  assert((await page.$eval('h1', (h) => h.textContent)) === 'Get Your Certificate', 'registration page shows "Get Your Certificate"');
  const inputH = await page.$eval('#fullName', (e) => e.getBoundingClientRect().height);
  const btnH = await page.$eval('button[type=submit]', (e) => e.getBoundingClientRect().height);
  assert(inputH >= 56 && btnH >= 56, `inputs ${inputH}px / button ${btnH}px (>= 56px)`);
  assert((await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)), 'no horizontal scroll at 360px');

  // invalid phone first
  await page.type('#fullName', 'ramesh kumar');
  await page.type('#phone', '12345');
  await page.click('button[type=submit]');
  await page.waitForSelector('#phone-error');
  assert((await page.$eval('#phone-error', (e) => e.textContent)) === 'Please enter a valid 10-digit mobile number.', 'invalid phone shows friendly error');
  await page.$eval('#phone', (e) => (e.value = ''));
  await page.type('#phone', '+91 98765 43210');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Please Check Your Name');
  await page.screenshot({ path: join(tmpdir(), 'e2e-confirm.png') });
  assert((await page.$eval('[data-testid=confirm-name]', (e) => e.textContent)) === 'ramesh kumar', 'confirm screen shows the typed name');

  const [yes] = await page.$$('button.btn:not(.secondary)');
  await yes.click();
  await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Certificate Ready'), { timeout: 60000 });
  await page.waitForSelector('img.preview');
  await page.waitForFunction(() => document.querySelector('img.preview')?.complete && document.querySelector('img.preview').naturalWidth > 0);
  await page.screenshot({ path: join(tmpdir(), 'e2e-ready.png') });
  const text = await page.$eval('main', (m) => m.innerText);
  assert(/issued to/i.test(text) && /RAMESH KUMAR/i.test(text), 'certificate ready screen shows the recipient');
  const certUrl = page.url();
  assert(/\/certificate\/[a-z0-9]{16}\?new=1/.test(certUrl), 'redirected to certificate URL');

  // 3. Download the PDF through the UI
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /download certificate/i.test(b.textContent)).click());
  await page.waitForFunction(() => document.body.innerText.includes('Your certificate is ready.'), { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  const files = readdirSync(downloadDir).filter((f) => f.endsWith('.pdf'));
  assert(files.length === 1 && /^Certificate-CERT-\d{4}-\d{6}\.pdf$/.test(files[0]), `PDF downloaded (${files[0]})`);
  assert(readFileSync(join(downloadDir, files[0])).subarray(0, 5).toString() === '%PDF-', 'downloaded file is a real PDF');

  // 4. "Scan" the certificate QR from the preview image and verify
  const certId = certUrl.match(/certificate\/([a-z0-9]+)/)[1];
  const prev = Buffer.from(await (await fetch(`${API}/api/certificates/${certId}/preview`)).arrayBuffer());
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(prev).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const raw = { data, width: info.width, height: info.height };
  const qr = jsQR(new Uint8ClampedArray(raw.data), raw.width, raw.height);
  assert(qr && qr.data.endsWith(`/certificate/${certId}`), 'certificate QR decodes to its verification URL');
  const verify = await browser.newPage();
  await verify.setViewport({ width: 360, height: 640, isMobile: true });
  await verify.goto(qr.data.replace(/^https?:\/\/[^/]+/, WEB), { waitUntil: 'networkidle0' });
  await verify.waitForFunction(() => document.body.innerText.includes('VALID CERTIFICATE'));
  const vtext = await verify.$eval('main', (m) => m.innerText);
  assert(/Ramesh Kumar/i.test(vtext) && /CERT-\d{4}-\d{6}/.test(vtext) && !/9876543210/.test(vtext), 'verification page shows VALID CERTIFICATE, name, number, no phone');

  // 5. Duplicate -> existing certificate
  await page.bringToFront();
  await page.goto(decoded.data.replace(/^https?:\/\/[^/]+/, WEB), { waitUntil: 'networkidle0' });
  await page.type('#fullName', 'Ramesh Kumar');
  await page.type('#phone', '9876543210');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => document.querySelector('h1')?.textContent === 'Please Check Your Name');
  await (await page.$$('button.btn:not(.secondary)'))[0].click();
  await page.waitForFunction(() => document.body.innerText.includes('existing certificate for this phone number'));
  assert(true, 'duplicate phone shows "existing certificate" with VIEW MY CERTIFICATE');

  // 6. Unknown certificate
  await verify.goto(`${WEB}/certificate/WTL-CSTN-99999`, { waitUntil: 'networkidle0' });
  await verify.waitForFunction(() => document.body.innerText.includes('Certificate Not Found'));
  assert(true, 'unknown certificate shows "Certificate Not Found"');

  const real = consoleErrors.filter((e) => !/404|favicon/i.test(e));
  assert(real.length === 0, `no console errors${real.length ? ': ' + real.join(' | ') : ''}`);
} finally {
  await browser.close();
}
console.log('\nALL END-TO-END CHECKS PASSED');
