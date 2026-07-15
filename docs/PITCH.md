# Global Health Observatory — Phase 2 Pitch

*Extending our Phase 1 React app with a Flask + PostgreSQL backend.*

---
0718799847

## Step 1: Business Problem Scenario

### The problem

Public health data — life expectancy, child mortality, maternal health — is
published by organizations like the WHO, but it's locked inside raw API
responses and spreadsheets. A student, researcher, or health worker who
wants to answer a simple question like *"how has under-5 mortality changed
in Kenya over the last five years?"* has to know how to query an API,
parse JSON, and build their own chart before they can answer it. That's
time lost to tooling instead of analysis — the productivity problem we're
solving is **research friction**: minutes-to-hours of manual data wrangling
collapsed into a few clicks.

### Target users and their frustrations

| User | Daily frustration |
| --- | --- |
| Public health students | Re-collecting the same WHO indicators by hand for every assignment; no single place to compare countries |
| NGO / policy researchers | Need a quick, citable trend view without standing up their own data pipeline |
| Journalists / advocates | Want a defensible number ("maternal mortality in Kenya rose X%") fast, without misreading raw API JSON |
| Our own team (Phase 3) | Need a dataset we control — curated, versioned, not at the mercy of a third-party API's uptime or schema changes |

### Why our solution adds value

**Global Health Observatory** turns "how has X changed in Y?" into three
clicks: pick a country, pick an indicator, see the trend. In Phase 1 this
ran on live calls to the public WHO GHO API. In Phase 2 we are replacing
that dependency with our **own Flask + PostgreSQL backend** so the app:

- Never breaks or slows down because a third party's API rate-limits or
  changes shape.
- Owns an editorial, admin-curated dataset instead of mirroring whatever
  the WHO catalog happens to contain that day.
- Has a real data model (with relationships and migrations) that Phase 3
  can extend — per-user accounts, richer roles — instead of rewriting.

No external API or AI service is called at runtime after this migration;
the WHO API is used once, offline, as the source for our seed data.

### Primary goals

1. Replace every Phase 1 call to the public WHO API with our own Flask
   REST API backed by PostgreSQL.
2. Ship full CRUD on at least one custom resource (Favorites) and model
   at least two related resources (Country ↔ DataPoint ↔ Indicator).
3. Keep the existing Dashboard / Trends / Compare user experience working
   unchanged from the user's point of view — the migration should be
   invisible to them.

### User stories

- As a **student**, I want to pick a country and instantly see its latest
  key health stats, so I don't have to look them up one indicator at a time.
- As a **researcher**, I want to view an indicator's trend over time with
  an auto-generated summary sentence, so I can cite a number without
  eyeballing a chart.
- As a **frequent visitor**, I want to bookmark a country with a personal
  note, so I can jump straight back into my area of focus later.
- As an **admin**, I want to add, edit, and remove countries, indicators,
  and data points through a UI, so the dataset can grow without anyone
  touching the database directly.

---

## Step 2: Problem Solving Process

### Step-by-step build process

1. **Requirements & data modeling** — map the fields our Phase 1 frontend
   already consumed from the WHO API onto our own schema: `Country`,
   `Indicator`, `DataPoint`, `Favorite`, `User`.
2. **Backend scaffold** — Flask application factory, config, extensions
   (`SQLAlchemy`, `Flask-Migrate`, `Flask-CORS`), PostgreSQL connection.
3. **Core CRUD API** — blueprints and routes for countries, indicators,
   data-points, and favorites; `marshmallow` schemas for validation;
   centralized JSON error handlers for 400/404/500s.
4. **Admin auth gate** — lightweight signed-token auth (`itsdangerous` +
   `werkzeug` password hashing) so writes require an admin login; reads
   stay open.
5. **Frontend integration** — swap the WHO API calls in
   `frontend/src/services/gho.js` for our own endpoints; keep
   Dashboard/Trends/Compare working against the new data shape.
6. **Admin CRUD UI** — build `AdminCountries`, `AdminIndicators`,
   `AdminDataPoints`, and `AdminUsers` pages so the dataset can be
   curated entirely from the browser.
7. **Testing, error handling & deployment** — manual + Postman testing
   of every endpoint, loading/error states on every page, then deploy
   behind Gunicorn + Nginx + PostgreSQL.

### Data models and relationships

```
Country (1) ───< DataPoint >─── (1) Indicator
   │
   └──< Favorite   (Favorite.notes, belongs to one Country)

User (admin-only, gates writes — not yet linked to Favorite; Phase 3 work)
```

- `DataPoint` is the join between a `Country` and an `Indicator` for a
  given `year`, with a unique constraint on `(country_id, indicator_id,
  year)` so the same reading can't be entered twice.
- `Favorite` belongs to a `Country` and carries a free-text `notes` field
  — this is our full-CRUD custom resource.
- `User` is a flat admin-flag model for now; Phase 3 upgrades it to real
  per-user accounts tied to their own Favorites.

### React component breakdown

| Layer | Components |
| --- | --- |
| Shell | `App.jsx` (routes), `Navbar`, `Hero`, `TrendsHero` |
| Shared UI | `StatCard`, `Loading`, `ErrorMessage`, `RequireAdmin` (route guard) |
| Public pages | `Dashboard`, `Trends`, `Compare`, `Favorites` |
| Admin pages | `AdminLogin`, `AdminDashboard`, `AdminCountries`, `AdminIndicators`, `AdminDataPoints`, `AdminUsers` |
| Data layer | `services/gho.js` — single Axios service module all pages call through |

### Tools and technologies

| Layer | Choice |
| --- | --- |
| Frontend | React 19, React Router, Recharts, Axios |
| Backend | Flask, SQLAlchemy, Flask-Migrate, Flask-CORS, marshmallow |
| Database | PostgreSQL |
| Auth | Signed-token admin gate (`itsdangerous` + `werkzeug`) |
| Deployment | Gunicorn + Nginx + Let's Encrypt (see `docs/` deployment notes) |

### Rubric alignment

- **Full CRUD on a custom resource** — Favorites (create/read/update/delete
  a bookmark + note), plus full admin CRUD on Countries, Indicators, and
  Data Points.
- **2+ related resources** — `Country`, `Indicator`, and `DataPoint` form a
  proper relational model with foreign keys and a composite unique
  constraint, not flat/unrelated tables.
- **SQLAlchemy + migrations** — every schema change ships as a
  Flask-Migrate revision, not a hand-edited table.
- **Error handling** — every API route returns structured JSON errors;
  every frontend page has a loading and an error state (`Loading`,
  `ErrorMessage`).
- **Clean UI** — consistent design system (teal theme, sidebar nav)
  carried over from Phase 1 and extended to the admin section.
- **Documentation** — this pitch, backend/frontend READMEs, and team
  instructions (`INSTRUCTIONS2.md`) are kept in the repo.

---

## Step 3: Timeline and Scope

Phase 1 (React + public WHO API) ran June 10–18. Phase 2 (this pitch)
covers June 25 – July 2, a **six working-day build**, split across the
team by the responsibilities in `INSTRUCTIONS2.md`.

| Phase | Dates | Est. time | Focus |
| --- | --- | --- | --- |
| Planning & data modeling | Jun 25 | 0.5 day | Finalize schema (Country/Indicator/DataPoint/Favorite/User), map old WHO fields to new ones |
| Backend setup & modeling | Jun 25–26 | 1.5 days | Flask app factory, SQLAlchemy models, first Flask-Migrate migrations |
| Core CRUD API | Jun 27–29 | 2.5 days | Routes, schemas, validation, admin auth gate |
| Frontend structure & integration | Jun 27–29 | 2.5 days (parallel) | Replace WHO API calls, build admin CRUD forms and Favorites dashboard |
| Debugging & testing | Jul 1 | 1 day | Merge-conflict resolution across 5 branches, Postman pass on every endpoint |
| Deployment | Jul 2 | 0.5 day | Gunicorn + Nginx + PostgreSQL + TLS on production host |
| README, docs & reflection | Jul 1–2 | 0.5 day | Backend/frontend READMEs, this pitch |

### Risks and open questions

- **CORS between Vite dev server and Flask API** required real debugging
  time (see `bugs/cors-errors` branch) — budgeted for but still slower
  than expected.
- **Nginx reverse-proxy routing** for the production API needed research
  the first time we deployed — now documented so it isn't a repeat cost.
- **Coordinating 5 people across parallel feature branches** produced
  merge conflicts that ate into the debugging day; a stricter PR-review
  cadence (per `INSTRUCTIONS2.md`) is the mitigation going forward.
- **Admin token is stored in `localStorage`** — acceptable for Phase 2's
  single-admin scope, but flagged as a Phase 3 hardening item once real
  user accounts exist.

### What's next (Phase 3)

- Full user accounts — registered users with their own private
  Favorites, not a single shared admin login.
- Expand the curated dataset beyond the current 6 countries / 11
  indicators as admin usage grows.
- Role-based permissions beyond a single admin flag.

---

## Team

| Member | Focus |
| --- | --- |
| Collins Kiptoo (Lead) | Architecture, backend, database, integration, deployment |
| Shawn Ochieng | Backend API |
| Wasaa Abdalla | Frontend integration |
| Samuel Wanjau | Frontend features, CRUD UI |
| Rhoda Kinoti | UI/UX, design system, documentation |
