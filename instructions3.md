# Team Instructions - Phase 3 (Final Stretch)

Welcome to **Phase 3** — the final phase.

In Phase 1 we built the React frontend, and in Phase 2 we replaced the WHO API with our own Flask + PostgreSQL backend and admin CRUD. In Phase 3 we add the last layer: **secure user authentication, protected routes, and user-owned data.**

This is **not a new project.** We are extending the existing codebase. The goal: normal users can create an account and save their own **favorites**, while admins keep managing countries and indicators.

---

# Project Overview

## Objective

Add a complete authentication and authorisation system so that:

- Anyone can **register and log in** through a single, unified flow.
- **Normal users** (`role: user`) can save their own **favorites** (indicator + country pairs).
- **Admins** (`role: admin`) keep the existing power to create/edit **countries and indicators**.
- Access control is enforced on the **backend**, so no user can see or touch another user's data.

> Together, admin-managed countries/indicators + user-owned favorites satisfy the Phase 3 requirement of "two resources, one owned by the logged-in user."

---

# What's New in Phase 3

## One auth system, driven by a role

We are **not** building "user auth" as a second system next to "admin auth." We fold the Phase 2 admin into a single `users` table and let a `role` column decide permissions. Same login flow for everyone; what you can *do* depends on your role.

## Favorites become user-owned

In Phase 2, `Favorite` linked to a `Country`. In Phase 3 it also links to a `User`, so every favorite belongs to exactly one account.

---

# Tech Stack (additions)

## Backend

- [**flask-jwt-extended (JWT)** OR **Flask-Login (sessions)**, matching what Phase 2 admin auth already uses]
- `werkzeug.security` or `bcrypt` for password hashing
- (existing) Flask, SQLAlchemy, Flask-Migrate, PostgreSQL, Flask-CORS

## Frontend

- React Context for auth state (`AuthContext`)
- Axios interceptor to attach the token/credentials to requests
- (existing) React, React Router, Axios, CSS

---

# Data Model (additions)

``` text
User
  - id
  - email (unique)
  - password_hash        # never store plaintext
  - role  ('user' | 'admin')
  - created_at

Favorite   (now user-owned)
  - id
  - user_id     -> FK User
  - country_id  -> FK Country
  - created_at
```

Relationships: **User 1 → * Favorite** and **Country 1 → * Favorite.**

---

# Project Structure (new/changed files)

``` text
backend/
├── models/
│   ├── user.py          # NEW
│   └── favorite.py      # + user_id
├── routes/
│   ├── auth.py          # NEW: register / login / logout / me
│   └── favorites.py     # ownership-checked CRUD
└── utils/decorators.py  # NEW: @login_required, @admin_required

frontend/
├── context/AuthContext.jsx        # NEW
├── components/ProtectedRoute.jsx  # NEW
└── pages/  (Login, Register, MyFavorites)  # NEW
```

---

# Team Responsibilities

## Collins — Project Lead / Auth & Architecture

**Responsibilities**

- Unify the `User` model with a `role` field (fold the Phase 2 admin into the users table)
- Set up the auth mechanism [CHECK: JWT or session] and password hashing
- Write the `@login_required` and `@admin_required` decorators
- Own access-control correctness, final integration, deployment, and code reviews

**Deliverables**

- `User` model + roles
- Auth decorators
- Deployed app + final integration

---

## Shawn — Backend API

**Responsibilities**

- Build the auth route handlers: `register`, `login`, `logout`, `me`
- Make **Favorites CRUD user-owned** with ownership checks on every query
- Request validation and error handling
- Update the Postman collection to cover auth + favorites

**Deliverables**

- Auth + favorites REST endpoints
- Updated Postman collection

---

## Rhoda — Auth Frontend

**Responsibilities**

- Build the **Register / Login / Logout** forms
- Build `AuthContext` (holds the token + current user)
- Build the `ProtectedRoute` wrapper (redirect to login when not authed)
- Add the Axios interceptor to attach the token/credentials to every request

**Deliverables**

- Complete auth flow on the frontend
- Protected routing wired to the backend

---

## Samuel — Frontend Features & UI

**Responsibilities**

- "Save to favorites" button on indicators
- The "My Favorites" personal dashboard view
- Admin CRUD interfaces / forms for countries & indicators
- Styling, responsive design, and overall UI polish

**Deliverables**

- Complete favorites experience in the UI
- Polished, responsive layout

---

## Wasaa — Documentation & Presentation

**Responsibilities**

- Write the **Project Brief** (business problem, solution, data model, auth choice)
- Update the **ERD** to include `User` and user-owned `Favorite`
- README updates, presentation slides, screenshots
- Plan and record the **demo video**

**Deliverables**

- Project Brief + updated ERD
- Final presentation materials + demo

---

# Build Order (the critical path)

Auth is the dependency for everything else, so it goes first.

1. **Collins:** `User` model + roles + auth setup + decorators (day 1–3). Unblocks the team.
2. **Shawn:** auth routes + user-owned favorites — starts once the `User` model exists.
3. **Rhoda:** `AuthContext` + interceptor + `ProtectedRoute` + login/register forms — can start on mocks, integrate when Shawn's endpoints are live.
4. **Samuel:** save button + My Favorites + styling — needs Rhoda's `AuthContext` and Shawn's endpoints.
5. **Wasaa:** update the ERD early (once the model is agreed), write the Project Brief throughout, record the demo at the end.
6. **Collins:** deploy an empty skeleton **early**, then run the security pass + final integration near the end.

---

# Access Control — the three rules (this is where the marks are)

Enforce all three on the **backend**. Hiding a button in the UI is not security.

1. **Auth required:** every favorites endpoint requires a logged-in user.
2. **Ownership:** a user can only read/delete their **own** favorites — filter every query by `user_id == current_user.id`. User A must not reach User B's favorites *even by guessing the ID*.
3. **Admin-only writes:** creating/editing countries & indicators requires `role == 'admin'` via `@admin_required`.

---

# Security Checklist (all must be true before we demo)

- Passwords are **hashed** — never stored or logged in plaintext
- Secrets (auth secret, DB URL) live in **env vars**; `.env` is gitignored
- Ownership is enforced on **every** favorites query
- Protected routes exist on **both** backend (real security) and frontend (UX)
- CORS configured for the deployed frontend origin [CHECK: + credentials if we use sessions]
- Tokens/passwords never appear in logs or error responses

---

# Definition of Done

Before opening a Pull Request:

**Backend**

- Endpoint tested (Postman) and returns JSON with proper status codes
- Auth **and** ownership enforced where relevant — tested, not assumed
- Migrations succeed, no server errors

**Frontend**

- Connected to the real auth system
- Loading, error, and success states handled
- Responsive layout

**General**

- Tested with **two different user accounts** for anything user-owned
- No secrets committed
- No merge conflicts; PR opened and reviewed by another member

---

# Git Workflow

Unchanged from previous phases. Never push to **main**.

``` bash
git checkout main
git pull origin main
git checkout -b feature/your-task
# ...work...
git add .
git commit -m "Meaningful commit message"
git push -u origin feature/your-task
```

Open a Pull Request and wait for at least one review before merging.

**Branch names:** `feature/auth-jwt`, `feature/favorites-ownership`, `feature/auth-forms`, `feature/auth-context`, `feature/favorites-ui`, `feature/docs-erd`, `fix/...`

---

# Deliverables

- **Project Brief** — the business problem, our solution, the data model, and our auth choice with justification. **Wasaa leads, Collins reviews.**
  - Problem framing: *researchers, students, and public-health workers repeatedly look up the same indicators for the same countries, with no way to save them.* Solution: a personalised health dashboard where each user keeps their own watchlist of indicator–country pairs.
- **Recorded demo** — register → login → save a favorite → view "My Favorites" → (admin) add an indicator. **Whole team; Wasaa coordinates.**
- **Written reflection** — **each member writes their own.**

---

# Daily Communication

Every member shares:

- Yesterday's progress
- Today's plan
- Current blockers

If blocked for more than one hour, notify the team immediately.

---

Last phase. Let's ship something clean and portfolio-worthy.
