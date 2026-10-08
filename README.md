# Certificate Platform

Scan a QR code → enter name + phone → confirm name → certificate is generated → view → download PDF.
Built for older users first: 18px+ text, 56px+ buttons, high contrast, two steps, no accounts or passwords.

| Part | Folder | Stack |
|---|---|---|
| API | `backend/` | NestJS 11, MongoDB (Mongoose), Zod validation, JWT + bcrypt, Puppeteer (PDF), `qrcode` |
| Participant site (QR pages) | `web/` | Next.js (App Router) + TypeScript |
| Admin panel | `admin/` | Next.js + TypeScript, served under `/admin` |
| Mobile app | `mobile/` | React Native + Expo (scan QR, same API) |
| Scripts | `scripts/` | end-to-end + admin smoke tests, dev database |

```
Certificate data ──▶ Template (HTML or IMAGE) ──▶ Chromium ──▶ PDF + WebP preview ──▶ storage (local / S3 / B2)
```

## Participant flow

`/register/EVENTCODE` → name + phone → "Please check your name" → **Yes, continue** → `/certificate/<id>?new=1`
("Certificate Ready", preview, **Download**, **Share**). Anyone can scan the certificate's own QR → `/certificate/<id>` →
**✓ VALID CERTIFICATE** / Revoked / Expired / Not found. Public pages never show phone numbers.

* Duplicate phone for the same event → "We found an existing certificate…" + **View my certificate**
  (per-event option *Allow more than one certificate per phone* for admins). The same phone can still register for other events.
* Event QR (registration) and certificate QR (verification) are separate. Certificate URLs use an unguessable id;
  the human number `CERT-2026-000001` also works.

## Requirements

Node 22+, a MongoDB database (Atlas or local), Chrome/Chromium (Puppeteer downloads one: `npx puppeteer browsers install chrome`).

## Setup

```bash
npm install                     # installs backend, web, admin (npm workspaces)
cp .env.example backend/.env    # then fill in values (see below)
npm run seed                    # admin user, templates, sample events + sample certificate
npm run dev:backend             # http://localhost:4000   (API under /api)
npm run dev:web                 # http://localhost:3000
npm run dev:admin               # http://localhost:3001/admin
```

No Atlas yet? `npm run dev:db` starts a local MongoDB (needs a one-time mongod download) – use `DATABASE_URL=mongodb://127.0.0.1:27017/certificates`.
Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

### Environment variables (`backend/.env`, never commit it)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | ≥ 32 random chars (app refuses to start otherwise) |
| `APP_URL` | Public URL of the participant site. **QR codes and verification links are built from it** |
| `API_URL` | Public URL of the API |
| `TRUST_PROXY` | Number of reverse proxies in front of the API (`2` = Vercel + Render, `0` locally) |
| `RATE_LIMIT_REGISTER` etc. | Per-IP/minute limits (event venues share one IP, so defaults are generous) |
| `STORAGE_DRIVER` | `local` or `s3` |
| `STORAGE_URL / BUCKET / REGION / ACCESS_KEY / SECRET_KEY` | Any S3-compatible bucket (Backblaze B2: URL `https://s3.<region>.backblazeb2.com`, key id `003…`, application key `K003…`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used by `npm run seed` to create the first admin |
| `DNS_SERVERS` | Optional (`8.8.8.8,1.1.1.1`) if your network blocks Atlas SRV DNS lookups |
| `PUPPETEER_EXECUTABLE_PATH`, `PUPPETEER_NO_SANDBOX` | Use system Chromium / run as root in Docker |

`web` and `admin` only need `API_URL` (where `/api/*` is proxied to). `mobile` needs `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_APP_URL`.

## Using it

1. Open the admin panel, log in with the seeded admin. 2. **Events → Create event** → copy the registration link / download or print the QR.
3. Participants scan and get their certificate. 4. **Certificates**: search by name/phone/number/event, view, download, revoke/restore.
5. **Registrations** (phone numbers visible to admins only), **Templates**, **Dashboard** statistics.

Test the whole flow in a real phone-sized browser against running servers:

```bash
ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/e2e.mjs          # event → QR → register → confirm → PDF → certificate QR → verify
ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/admin-smoke.mjs  # admin login → dashboard → create event → search → logout
npm test                                                      # backend (20) + web (13) test suites
```

## Certificate templates (how to replace the design)

Design is separated from data. Templates live in the `templates` collection (admin → Templates) and each event picks one
(or the default). Two types:

* **IMAGE** – a PNG/JPG background plus a JSON spec: page size, embedded fonts, white `masks` to cover text baked into the artwork,
  and dynamic fields positioned in % of the page (`recipientName`, `eventName`, `issueDate`, `certificateNumber`, `qr`, free `text` with `{{placeholders}}`).
  See `backend/src/pdf/builtin-templates.ts` – the supplied *We The Leaders – Certificate of Participation* design is built this way
  (assets in `backend/templates/volunteer/`; background is mozjpeg-recompressed to keep files small).
* **HTML** – any HTML/CSS with `{{recipientName}}`, `{{eventName}}`, `{{issueDate}}`, `{{certificateNumber}}`, `{{organizationName}}`, `{{qrDataUrl}}`.
  See `backend/templates/placeholder.html`.

To use a new design: add it in admin → Templates → *Make default* (or choose it per event), or add a builder like `buildVolunteerTemplate()` and
run `npm run seed`. Preview locally: `cd backend && npx ts-node scripts/preview-template.ts ./out`.
Templates apply to newly issued certificates; `POST /api/admin/certificates/:id/regenerate` re-renders an old one.
To support another template type, add one function to `RENDERERS` in `backend/src/pdf/template-renderers.ts`.

Storage per certificate ≈ 160 KB (PDF ≈ 100 KB + WebP preview ≈ 60 KB). Files live in storage, only keys are in MongoDB;
missing files are re-rendered on demand, so nothing is lost if a disk is wiped.

## API

Public: `GET /api/events/:code`, `POST /api/events/:code/register`, `GET /api/certificates/:ref` (+ `/pdf`, `/preview`), `GET /api/health`.
Admin (httpOnly cookie, SameSite=Strict, or Bearer token): `POST /api/admin/auth/login|logout`, `GET /api/admin/auth/me`, `GET /api/admin/stats`,
`/api/admin/events` (CRUD), `/api/admin/certificates` (list/search, `:id`, `/pdf`, `/preview`, `/revoke`, `/restore`, `/regenerate`),
`/api/admin/registrations`, `/api/admin/templates`. Errors are `{ statusCode, code, message }`; the clients map `code` to plain-language text.

Security: bcrypt hashes, Zod validation on every body (unknown fields rejected), helmet, rate limiting, no phone numbers on public endpoints,
admin routes guarded, secrets only in environment variables.
Localization: `web/src/locales/en.json` (+ `ta.json` stub, missing keys fall back to English; same files in `mobile/src/i18n`).

## Deployment

### API → Render (Docker, because PDFs need Chromium)

1. Push the repo, create a **Blueprint** from `render.yaml` (or a Docker web service with `Dockerfile` at the repo root, health check `/api/health`).
2. Set `DATABASE_URL`, `APP_URL` (your Vercel domain), `API_URL` (the Render URL), `STORAGE_*` (use a bucket – Render disks are ephemeral), `TRUST_PROXY=2`.
3. In MongoDB Atlas → Network Access allow Render (or `0.0.0.0/0`). Use at least a plan with ~1 GB RAM for Chromium.
4. First run: open a Render shell and run `node dist/seed.js` (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` temporarily).

### Frontends → Vercel

`vercel.json` at the repo root defines two services on one domain: the participant site at `/` and the admin panel at `/admin`.
Set the project environment variable `API_URL` to the Render URL – both apps proxy `/api/*` to it (same origin = no CORS, cookies just work).
Set `APP_URL` on Render to the final Vercel domain so QR codes point at it. Everything must be served over HTTPS.

### Mobile

`cd mobile && cp ../.env.example .env` (set `EXPO_PUBLIC_*`), `npx expo start`, scan with Expo Go; build with EAS. The camera QR/https links also open the web page
if the app is not installed.

## Project layout

```
backend/src/{auth,events,certificates,registrations,templates,stats,pdf,qr,storage,database,common,config}
web/src/{app,components,lib,locales}     admin/src/{app,components,lib}     mobile/src/{screens,components,i18n}
```

## CI/CD (GitHub Actions)

`.github/workflows/ci-cd.yml` runs on every push and pull request:

| Job | What it checks |
|---|---|
| **backend** | typecheck, 21 tests against a real MongoDB service + real Chromium (events, registration, duplicates, certificates, PDF, revoke, verification, security), build |
| **web / admin** | typecheck, tests (web), production `next build` |
| **mobile** | typecheck + `expo-doctor` |
| **docker** | the API image builds |
| **security** | gitleaks secret scan + `npm audit` (fails on critical) |
| **deploy** | only on `main`, only if everything above passed: triggers the Render deploy hook for that exact commit |
| **smoke** | waits for the new version to be live, then checks production: DB up, `APP_URL` is public and matches the site (so QR codes never point at localhost), `/api` proxy works, pages load, admin API rejects anonymous requests |

Vercel deploys the web + admin from Git by itself (previews for pull requests, production for `main`).

### One-time setup

1. **Render** → service → Settings → *Auto-Deploy*: set to **Off** (GitHub Actions triggers the deploy after the tests pass).
   Settings → *Deploy Hook*: copy the URL.
2. **GitHub** → Settings → Secrets and variables → Actions:
   * Secret `RENDER_DEPLOY_HOOK_URL` = the Render deploy hook URL
   * Variables: `SITE_URL` (e.g. `https://certificategenerator-brown.vercel.app`), `API_URL` (the Render URL), optional `SMOKE_EVENT_CODE` (e.g. `CLEANUP2026`)
3. Optional: GitHub → Settings → Environments → **production** → add *required reviewers* for a manual approval before every deploy.
4. Optional: Settings → Branches → protect `main` and require the CI jobs to pass before merging.
5. Render env var `APP_URL` must be your public site URL (the API refuses to start in production if it is localhost).

Run the same checks locally: `npm run typecheck`, `npm test`, `npm run build` (or all: `npm run ci`).
Check production by hand: `SITE_URL=… API_URL=… npm run smoke`.
If certificates were ever issued with a wrong `APP_URL`: `APP_URL=https://your-site npm run fix-urls` re-renders them with the right QR code.
Dependabot (`.github/dependabot.yml`) opens weekly update PRs, which go through the same pipeline.
