# SnapClass

**Attendance from a class photo or a voice sample, with a review step before anything is saved.**

SnapClass is a working full-stack web application. Teachers create subjects and share a join link or QR code. Students register, enroll their face and voice once, and join subjects. Teachers then take attendance from class photos (face recognition) or by having each student say "I am present" (voice matching), review the generated report, override anything that looks wrong, and confirm it. Every confirmed session is stored and can be exported as CSV.

## CONTENTS

- [What works](#what-works)
- [How the biometrics work (and their limits)](#how-the-biometrics-work-and-their-limits)
- [Privacy and data](#privacy-and-data)
- [Tech stack](#tech-stack)
- [Run it locally](#run-it-locally)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [API overview](#api-overview)
- [Testing](#testing)
- [Security notes](#security-notes)
- [Known limitations](#known-limitations)
- [Third-party software](#third-party-software)
- [Future scope](#future-scope)
- [Author](#author)

## What works

**Accounts**
- Teacher and student registration and sign-in (username and password, hashed with bcrypt, sessions in signed `HttpOnly` cookies).
- Role-based access: a teacher can only see their own subjects; a student can only see their own enrollments.

**Teachers**
- Create subjects (code, name, section). Each gets a join link and a real, scannable QR code.
- See the roster, including which students have enrolled a face and a voice.
- **Photo attendance:** add one or more class photos; every face is detected in the browser and matched against enrolled students.
- **Voice attendance:** hand the device to each student in turn; their recording is compared with their enrolled voice.
- Review every result, toggle any row to present or absent, then confirm and save (or discard).
- Attendance records per subject, and a CSV export.

**Students**
- Register, join a subject with its code, or by opening the link / scanning the QR code.
- Enroll a face (webcam) and a voice (microphone). Either can be redone at any time.
- A dashboard showing each subject with classes held and classes attended.

## HOW THE BIOMETERICS WORK  (and their limits)

**Face.** Detection and recognition use [face-api.js](https://github.com/vladmandic/face-api) (`@vladmandic/face-api`) running **in the browser**. Each detected face becomes a 128-number descriptor. The server compares descriptors by Euclidean distance; a distance of **0.6 or less** counts as the same person, which is the cutoff documented for this model family. Class photos use the more accurate SSD MobileNet detector; the enrollment webcam uses the faster tiny detector. The model files are bundled in `public/models`, so no CDN is needed.

**Voice.** The server decodes the recording with FFmpeg, computes MFCC features with [Meyda](https://meyda.js.org/), and averages them into a 13-value "voiceprint". Two voiceprints are compared by cosine similarity; **0.82 or higher** counts as a match. This is a deliberately lightweight, dependency-free method, chosen because heavier deep-learning speaker models need native runtimes that are hard to install reliably. **It is meaningfully less accurate than face matching**, particularly with background noise or a different microphone. Treat voice results as a helpful suggestion and use the per-row override.

**Both thresholds are constants in `server/src/matching.js`.** They have not been tuned on a real class. Tune them on your own data before relying on them.

Every result is shown to the teacher before saving, with its score, and can be overridden. That review step is a core part of the design.

## DATA PRIVACY

- **Face photos are never uploaded.** Detection runs in the browser; only the 128-number descriptor is sent.
- **Voice audio is not stored.** The recording is sent to the server, converted into a short numeric voiceprint, and discarded (uploads are held in memory only).
- Stored: accounts (username, bcrypt password hash, display name), subjects, enrollments, face descriptors, voiceprints, and attendance records.
- Face descriptors and voiceprints are **biometric data**, which many jurisdictions regulate strictly. Before using SnapClass with real students, follow your institution's policy and any consent or data-protection rules that apply (for example, parental consent for minors). This software does not provide a consent workflow, data-deletion tooling, or a privacy policy; you must add what your situation requires.

## Tech stack

| Area | Choice |
| --- | --- |
| Server | Node.js 22, Express 5 |
| Database | SQLite via Node's built-in `node:sqlite` (file on disk, WAL mode, versioned migrations, no native build step) |
| Auth | `bcryptjs` password hashes, `jsonwebtoken` session cookies, `zod` input validation |
| Face | `@vladmandic/face-api` in the browser |
| Voice | FFmpeg (`ffmpeg-static`) + Meyda MFCCs on the server |
| QR codes | `qrcode` |
| Frontend | React 19, TypeScript (strict), React Router 7, Tailwind CSS 4, Motion, Vite 8 |
| Quality | ESLint (with jsx-a11y), Vitest |

## A note on `node:sqlite`

The database layer uses Node's own built-in SQLite module rather than a third-party native
binding. It is marked **experimental** by Node (you will see a one-line warning in the server
log; it is informational, not an error) but has been stable since Node 22.5 and needs no
compiler, build tools, or prebuilt-binary download - `npm install` never needs to build
anything for the database. If you would rather depend on the more established
`better-sqlite3` package instead, its API is close 

## LOCALLY RUN IT

Requirements: **Node.js 22 or newer** and npm.

```bash
npm ci
cp .env.example .env        
```

RUN THE API AND THE FRONTEND IN TWO TERMINALS USING SPLITS : 


Open http://localhost:5173.

> Camera and microphone access require a **secure context**: `https://` or `http://localhost`. On other addresses the browser will block them.

### Run the production build locally

```bash
npm run build
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))") npm start
```

Open http://localhost:8787. In production the server serves the built site and the API from one process.

### COMPLETE SCRIPTS

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server for the frontend |
| `npm run dev:server` | API server with auto-restart |
| `npm run build` | Typecheck, build the client and server-render bundle, prerender the marketing page into `dist/` |
| `npm start` | Start the production server (serves `dist/` and the API) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (frontend and server) |
| `npm run notices` | Regenerate `public/third-party-notices.txt` after changing dependencies |

## VARIABLES OF ENVIRONMENT

| Variable | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | **Yes, in production** | Signs session cookies. The server refuses to start in production without it. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `DATA_DIR` | Recommended | Directory for the SQLite file. Must be persistent. Default `./server/data`. |
| `PORT` | No | Port to listen on. Hosts usually set this. Default `8787`. |
| `SITE_URL` | Recommended | Public origin, e.g. `https://snapclass.yourdomain.com` (no trailing slash). Used for QR-code join links and, at build time, the canonical URL, social image, `robots.txt` and `sitemap.xml`. |
| `VITE_REPO_URL` | No | Adds a "Source code" link to the footer (build-time). |
| `VITE_AUTHOR_GITHUB`, `VITE_AUTHOR_LINKEDIN` | No | Author links in the About section (build-time). |

`.env` is read automatically by `npm start` and `npm run dev:server`. **Never commit a real `.env`.** Variables starting with `VITE_` are embedded in the public site; never put secrets in them.

## Deployment

SnapClass needs **a persistent Node.js process and a persistent disk** (for the SQLite file). That rules out hosts that only serve static files or run short-lived serverless functions.

**Works:** Render (web service + disk), Railway or Fly.io (with a volume), any VPS, or any Docker host.
**Does not work as-is:** Vercel, Netlify, Cloudflare Pages and GitHub Pages. They cannot run this server or keep the database.

> **Serve it over HTTPS.** Browsers only allow camera and microphone access on secure origins, and the session cookie is marked `Secure` in production. Render, Railway and Fly provide HTTPS automatically.

> **Never use an ephemeral filesystem for `DATA_DIR`.** Free tiers without a persistent disk erase the database on every restart or deploy.

### Render

1. Push the project to GitHub.
2. In Render, create a **Blueprint** from the repository. `render.yaml` defines a web service, a 1 GB persistent disk mounted at `/var/data`, and a generated `SESSION_SECRET`.
3. Set `SITE_URL` to your service URL.
4. Deploy. The health check is `/api/health`.

Persistent disks require a paid Render instance type; check Render's current pricing.

### Docker (any host)

```bash
docker build -t snapclass .
docker run -d --name snapclass -p 8787:8787 \
  -e SESSION_SECRET="<a long random string>" \
  -e SITE_URL="https://snapclass.yourdomain.com" \
  -v snapclass-data:/data \
  snapclass
```

Put a reverse proxy that terminates HTTPS (Caddy, nginx, a cloud load balancer) in front of it. The `-v` volume is what keeps your data.

### A plain VPS

```bash
npm ci && npm run build
SESSION_SECRET=... DATA_DIR=/var/lib/snapclass SITE_URL=https://... npm start
```

RUN IT UNDER A PROCESS MANAGER (systemd, pm2) behind an HTTPS reverse proxy, and back up `DATA_DIR`.

### BACKUPS

THE COMPLETE WHOLE DATABASE IS ONE  SQLite file (`snapclass.sqlite3`, plus `-wal`/`-shm` while running) inside `DATA_DIR`. Back it up on a schedule, for example with `sqlite3 snapclass.sqlite3 ".backup backup.sqlite3"`.

## PROJECT STRUCTURE 

```
server/src/
  index.js, app.js          Entry point; Express wiring, static serving, error handling
  env.js, db.js             Configuration; SQLite schema and migrations
  auth.js                   Password hashing, session cookies, role middleware
  matching.js               Face distance and voice similarity math, and thresholds
  voice.js                  FFmpeg decode + MFCC voiceprint extraction
  routes/                   auth, subjects, enroll, attendance
  lib/                      validation, async handler, security headers, rate limiter
src/
  AppRoutes.tsx, App.tsx    Route table (signed-in pages are code-split); app root
  pages/                    Marketing, login, register, join, and app/ (teacher + student screens)
  features/
    auth/                   Session context, auth form, role guard
    biometrics/             face-api.js wrapper, webcam and microphone hooks and capture widgets
    app-shell/              Signed-in layout
    register-demo/          The interactive sample on the marketing page
    mockups/                Illustrated screens used by the walkthrough
  sections/, components/    Marketing sections; shared UI
  lib/api.ts                Typed fetch client
public/models/              face-api.js model files (bundled, no CDN)
scripts/                    Prerender, license-notice generator, social image source
```

## API overview

All endpoints are under `/api` and use cookie sessions. Teacher-only and student-only routes return `401` otherwise, and a subject owned by another teacher returns `404`.

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /auth/{teacher,student}/{register,login}` | anyone | Create an account / sign in |
| `POST /auth/logout`, `GET /auth/me` | any | Sign out / current user |
| `POST /subjects`, `GET /subjects/mine`, `GET /subjects/:id` | teacher | Create, list, and view a subject with its roster |
| `GET /subjects/:id/qrcode.png` | teacher | Join-link QR code |
| `POST /subjects/join`, `GET /subjects/mine/student`, `POST /subjects/:id/unenroll` | student | Join, list with stats, leave |
| `POST /enroll/face`, `POST /enroll/voice`, `GET /enroll/status` | student | Save a face descriptor / voice sample; enrollment status |
| `POST /subjects/:id/attendance/photo/preview` | teacher | Match face descriptors against the roster (nothing is saved) |
| `POST /subjects/:id/attendance/voice/check` | teacher | Compare one recording with one student's voiceprint (nothing is saved) |
| `POST /subjects/:id/attendance/confirm` | teacher | Save a reviewed report as a session |
| `GET /subjects/:id/attendance/records[.csv]` | teacher | Session list / CSV export |
| `GET /health` | anyone | Health check |

## Testing

```bash
npm run typecheck && npm run lint && npm test
```

The Vitest suite covers the demo state machine, URL validation, the matching math and thresholds, request validation and the rate limiter.

Beyond unit tests, the application was exercised end to end in a real browser against the production build: registering a teacher and two students, creating a subject, joining it, enrolling a face, running photo attendance by uploading a multi-person photo (real in-browser face detection and matching), saving a voice session, and checking the records page, CSV export and both students' dashboards. The server API (including voice enrollment and matching with real audio decoding) was also tested directly.

**What was not verified with a live device:** the webcam and microphone capture widgets could not be driven in the automated test environment, because it had no working media-capture backend. They were tested only for graceful failure (a clear message instead of a crash). **Please test enrollment and voice attendance on your own device before relying on them.**

## NOTES OF SEQURITY

- Passwords are hashed with bcrypt; sessions are signed, `HttpOnly`, `SameSite=Lax` cookies, `Secure` in production.
- Failed sign-ins are rate-limited per IP and username (8 per 15 minutes) and per IP overall, so a shared school network is not locked out. Account creation is limited per IP. The limiter is in-memory and per-process; use a shared store or platform-level limiting if you run several instances.
- Every request body is validated with zod. All SQL uses parameterized statements.
- Security headers (CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS on HTTPS) are set by the server itself. Camera and microphone are permitted for this origin only.
- Uploads are limited to 15 MB and held in memory only.
- There is no email verification, password reset, or account deletion yet.

## Known limitations

- Voice matching is lightweight and noticeably less reliable than face matching (see above). Thresholds are untuned.
- Face matching depends on photo quality: small, blurry, badly lit or turned-away faces may be missed, and the teacher should review the report.
- Photo and voice results are matched against the roster only; a face in a photo that belongs to no enrolled student is ignored.
- Sign-in is by username and password only. Face is used for attendance, not for signing in, because a photo alone is too easy to spoof to protect an account.
- Single-instance design (SQLite, in-memory rate limiter).
- The Dockerfile and `render.yaml` are provided but were not executed in the environment where this was built.

## Third-party software

This project is built on open-source software, each package under its own licence and each remaining the work of its authors. The complete list with full licence texts is in [`public/third-party-notices.txt`](public/third-party-notices.txt), published at `/third-party-notices.txt` and linked from the site footer. Keep that file with any redistribution.

Two things worth knowing:

- **FFmpeg.** `ffmpeg-static` downloads an FFmpeg binary at install time. The npm wrapper is licensed GPL-3.0-or-later, and FFmpeg builds carry their own licence terms depending on how they were compiled. SnapClass runs FFmpeg as a separate command-line process rather than linking to it. If you plan to distribute SnapClass commercially, review FFmpeg's licensing for your situation, or replace it with a system-installed FFmpeg you are comfortable with.
- **Face models.** The face-api.js model weights in `public/models` come from the `@vladmandic/face-api` package (MIT).

This repository does not yet include a `LICENSE` file for the project's own code. Choose one that suits you and add it before publishing.

## Future scope

Ideas that are implemented:

- Per-student and per-subject attendance analytics.
- A deep-learning speaker-embedding model for stronger voice matching.
- Email verification, password reset, account and data deletion, and an in-app consent flow.
- Editing or deleting saved sessions, and CSV export per student.
- Shared rate limiting and PostgreSQL for multi-instance deployments.

## Author

Built by
**SHREEKANTH A GUTTEDAR**

Design, front-end and back-end engineering, and documentation.
