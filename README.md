# Global Health Observatory

A full-stack dashboard for exploring WHO-style public health indicators —
life expectancy, child mortality, maternal health, and more — across
countries, without needing to know an API or write SQL. Pick a country,
pick an indicator, see the trend.

This is **Phase 2 of 3** of a Moringa School capstone. Phase 1 was a
React app that pulled live data from the public WHO Global Health
Observatory (GHO) API. Phase 2 (this repo, current state) replaces that
public API with our own **Flask + PostgreSQL** backend, so the app now
owns and curates its own data instead of mirroring a third party.

**Live app:** [groupsix.syknown.co.ke](https://groupsix.syknown.co.ke)
**Youtube Link:** [https://youtu.be/g1677qL8Nm0](https://youtu.be/g1677qL8Nm0)

---

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Run Instructions](#setup-and-run-instructions)
- [Core Functionality](#core-functionality)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [The Team](#the-team)

---

## Technologies Used

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router, Recharts, Axios, Vite |
| Backend | Flask, SQLAlchemy, Flask-Migrate, Flask-CORS, Marshmallow |
| Database | PostgreSQL |
| Auth | Signed-token admin gate (`itsdangerous` + `werkzeug` password hashing) |
| Deployment | Gunicorn + Nginx + Let's Encrypt |

---

## Project Structure

```
group-project/
├── backend/           
│   ├── app/
│   │   ├── models/    
│   │   ├── routes/ 
│   │   └── config.py
│   ├── migrations/
│   ├── seed.py
│   └── run.py
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       │   └── admin/
│       └── services/gho.js
└── docs/  
```

---

## Setup and Run Instructions

### Prerequisites

- Python 3.12+
- Node.js 18+ and npm
- PostgreSQL running locally

### 1. Clone the repository

```bash
git clone https://github.com/collins-moringa/group-6-fullstack-application-group-6.git
cd group-6-fullstack-application-group-6
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres connection string
# e.g. postgresql://postgres:password@localhost:5432/health_dashboard

flask db upgrade               
python seed.py                  # optional: seed demo countries/indicators/admin user

python run.py
```

The API runs at `http://localhost:5001`.

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install

cp .env.example .env
# .env should contain: VITE_API_BASE_URL=http://localhost:5001

npm run dev
```

The app runs at the local URL Vite prints (usually `http://localhost:5173`).

---

## Core Functionality

- **Dashboard** — pick a country, see a live grid of stat cards (life
  expectancy, mortality rates, and more) for the most recent year on record.
- **Trends** — pick a country and an indicator, see how it's changed over
  time on a line chart, with an auto-generated insight sentence.
- **Compare** — put 2–4 countries side by side on the same indicator.
- **Favorites** — bookmark a country with a note, and jump straight back
  into its Trends view later (full CRUD).
- **Admin** — a token-gated section where an administrator curates the
  dataset: add/edit/remove countries, indicators, and data points, plus a
  read-only view of registered users.

All reads (Dashboard, Trends, Compare, Favorites) are open; all writes to
Countries, Indicators, and Data Points requires an admin login.

---

## API Overview

| Resource | Endpoints |
| --- | --- |
| Countries | `GET/POST /countries`, `PUT/DELETE /countries/<id>` |
| Indicators | `GET/POST /indicators`, `PUT/DELETE /indicators/<id>` |
| Data Points | `GET/POST /data-points`, `PUT/DELETE /data-points/<id>` |
| Favorites | `GET/POST /favorites`, `PUT/DELETE /favorites/<id>` |
| Auth | `POST /auth/login` |
| Admin | `GET /admin/users` |

Full endpoint details live in [`backend/README.md`](backend/README.md).

---

## Deployment

The app is deployed at **[groupsix.syknown.co.ke](https://groupsix.syknown.co.ke)**:

- Backend: Flask + Gunicorn (systemd service), PostgreSQL, behind Nginx
- Frontend: static Vite build served by Nginx
- TLS: Let's Encrypt, auto-renewing

---

## The Team

| Name | Responsibility |
| --- | --- |
| Collins Kiptoo| Architecture, backend, database, integration, deployment |
| Shawn Ochieng | Backend API |
| Wasaa Abdalla | Frontend integration |
| Samuel Wanjau | Frontend features, CRUD UI |
| Rhoda Kinoti | UI/UX, design system, documentation |
