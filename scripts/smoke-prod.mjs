// Post-deploy smoke test. Read-only: it never creates data.
//   SITE_URL          public site (Vercel), e.g. https://certificategenerator-brown.vercel.app   (required)
//   API_URL           API (Render) - optional; checked directly in addition to through the site
//   EXPECT_COMMIT     wait until the API reports this git commit (optional)
//   SMOKE_EVENT_CODE  an ACTIVE event to check the participant page + public API for (optional)
//   SMOKE_TIMEOUT_MIN how long to wait for the new version (default 15)
const SITE = (process.env.SITE_URL || '').replace(/\/+$/, '');
const API = (process.env.API_URL || '').replace(/\/+$/, '');
const COMMIT = process.env.EXPECT_COMMIT || '';
const EVENT = process.env.SMOKE_EVENT_CODE || '';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MIN || 15) * 60_000;

if (!SITE) {
  console.error('::error::SITE_URL is not set (GitHub: Settings -> Secrets and variables -> Actions -> Variables).');
  process.exit(1);
}

const failures = [];
const ok = (m) => console.log(`✓ ${m}`);
const bad = (m) => { failures.push(m); console.error(`✗ ${m}`); };
const check = (cond, pass, fail) => (cond ? ok(pass) : bad(fail));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, init) {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(90_000) }); // free hosts can take ~60s to wake
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { /* not JSON */ }
    return { status: res.status, text, json };
  } catch (e) {
    return { status: 0, text: String(e), json: undefined };
  }
}

const healthUrl = `${API || SITE}/api/health`;

// 1. wait for the new version to be live
const started = Date.now();
let health;
for (;;) {
  const r = await get(healthUrl);
  health = r.json;
  const live = r.status === 200 && health?.ok;
  const current = !COMMIT || (health?.commit && COMMIT.startsWith(health.commit.slice(0, 7)));
  if (live && current) break;
  if (Date.now() - started > TIMEOUT_MS) {
    console.error(`::error::Timed out waiting for ${healthUrl} (status ${r.status}, commit ${health?.commit ?? 'unknown'}, expected ${COMMIT.slice(0, 7) || 'any'})`);
    process.exit(1);
  }
  console.log(`… waiting for deploy (status ${r.status}, commit ${health?.commit?.slice(0, 7) ?? 'n/a'}, want ${COMMIT.slice(0, 7) || 'any'})`);
  await sleep(15_000);
}
ok(`API is live${health.commit ? ` on commit ${health.commit.slice(0, 7)}` : ''}`);

// 2. configuration sanity - the QR codes on certificates are built from the API's APP_URL
check(health.database === 'up', 'database connection is up', `database is ${health.database}`);
const appUrl = health.appUrl ?? '';
check(!!appUrl, 'API reports its APP_URL', 'API /api/health does not report appUrl (older backend version still running?)');
check(appUrl !== '' && !/localhost|127.0.0.1/.test(appUrl), `APP_URL is public (${appUrl})`, `APP_URL is '${appUrl}' - QR codes on certificates would point at localhost!`);
check(appUrl.replace(/\/+$/, '') === SITE, 'APP_URL matches the site URL', `APP_URL (${appUrl || 'unknown'}) does not match SITE_URL (${SITE})`);

// 3. the site proxies /api to the API (Vercel -> Render wiring)
const viaSite = await get(`${SITE}/api/health`);
check(viaSite.status === 200 && viaSite.json?.ok === true, 'site proxies /api to the backend', `site /api/health returned ${viaSite.status}`);

// 4. participant pages
const home = await get(`${SITE}/`);
check(home.status === 200 && /Certificates/.test(home.text), 'participant site home loads', `home returned ${home.status}`);
if (EVENT) {
  const ev = await get(`${SITE}/api/events/${EVENT}`);
  check(ev.status === 200 && ev.json?.eventCode === EVENT.toUpperCase(), `event ${EVENT} is available via the site`, `event ${EVENT} returned ${ev.status}`);
  const page = await get(`${SITE}/register/${EVENT}`);
  check(page.status === 200, 'registration page loads', `registration page returned ${page.status}`);
}
const missing = await get(`${SITE}/api/certificates/WTL-ZZZZ-00000`);
check(missing.status === 404 && missing.json?.code === 'CERTIFICATE_NOT_FOUND', 'unknown certificate gives a clean 404', `unknown certificate returned ${missing.status}`);

// 5. admin panel is up and protected
const login = await get(`${SITE}/admin/login`);
check(login.status === 200, 'admin login page loads', `admin login returned ${login.status}`);
const anon = await get(`${SITE}/api/admin/stats`);
check(anon.status === 401, 'admin API rejects anonymous requests', `anonymous admin API returned ${anon.status} (expected 401)`);

if (failures.length) {
  console.error(`\n${failures.length} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nPRODUCTION SMOKE TEST PASSED');
