# Global Health Dashboard API

A RESTful backend powering the **Global Health Dashboard** application.
This API provides data persistence, CRUD operations, and business logic
for managing health data using **Flask** and **PostgreSQL**.

------------------------------------------------------------------------

# About the Project

The Global Health Dashboard API is the backend service for the Global
Health Dashboard application.

In Phase 1, the frontend consumed the WHO Global Health Observatory
public API directly.

For Phase 2, we extended the application into a full-stack solution by
introducing our own backend and PostgreSQL database. The backend stores
and manages user-created data while exposing RESTful API endpoints that
the React frontend consumes.

For Phase 3, the backend gained full user accounts: registration/login
for everyone, signed-token session auth, role-based access control
(`user` vs `admin`), self-service profile/password management, and an
admin API for managing user accounts.

------------------------------------------------------------------------

# Features

-   RESTful API built with Flask
-   PostgreSQL relational database
-   SQLAlchemy ORM
-   Database migrations with Flask-Migrate
-   Full CRUD operations
-   Token-based authentication (`itsdangerous` signed tokens) with
    `user`/`admin` roles
-   Self-service profile and password management
-   Admin user management (add/edit/delete, with last-admin protection)
-   JSON API responses
-   Modular project architecture
-   CORS enabled
-   Environment-based configuration
-   Seed database support

------------------------------------------------------------------------

# Tech Stack

  Layer           Technology
  --------------- ---------------
  Language        Python 3
  Framework       Flask
  ORM             SQLAlchemy
  Database        PostgreSQL
  Migration       Flask-Migrate
  Serialization   Marshmallow
  Environment     python-dotenv

------------------------------------------------------------------------

# Project Structure

``` text
backend/
│
├── app/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── config.py
│   ├── extensions.py
│   └── __init__.py
│
├── migrations/
├── seed.py
├── run.py
├── requirements.txt
├── .env
└── README.md
```

------------------------------------------------------------------------

# Installation

## Clone the repository

``` bash
git clone <repository-url>
cd backend
```

## Create a virtual environment

### macOS / Linux

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

### Windows

``` bash
python -m venv .venv
.venv\Scripts\activate
```

## Install dependencies

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

# Environment Variables

Create a `.env` file.

``` env
FLASK_APP=run.py
FLASK_ENV=development

SECRET_KEY=your-secret-key

DATABASE_URL=postgresql://postgres:password@localhost:5432/health_dashboard

# Optional — used by seed.py to create/update the default admin account
ADMIN_EMAIL=admin@ghdashboard.local
ADMIN_PASSWORD=admin123
```

------------------------------------------------------------------------

# Database Setup

``` bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

(Optional)

``` bash
python seed.py
```

------------------------------------------------------------------------

# Running the Server

``` bash
python run.py
```

API URL

    http://localhost:5001

------------------------------------------------------------------------

# API Endpoints

## Auth

  Method   Endpoint             Auth           Notes
  -------- -------------------- -------------- --------------------------------------------
  POST     /auth/register       —              `{ email, password }`
  POST     /auth/login          —              `{ email, password }`
  POST     /auth/logout         —              stateless no-op, kept for symmetry
  GET      /auth/me             login required current user's profile
  PUT      /auth/me             login required update own `name`/`email`/`phone`/`address`
  PUT      /auth/me/password    login required `{ current_password, new_password }`

## Countries

  Method   Endpoint            Auth
  -------- ------------------- --------------
  GET      /countries          —
  POST     /countries          admin
  PUT      /countries/`<id>`   admin
  DELETE   /countries/`<id>`   admin

## Indicators

  Method   Endpoint            Auth
  -------- ------------------- --------------
  GET      /indicators         —
  POST     /indicators         admin
  PUT      /indicators/`<id>`  admin
  DELETE   /indicators/`<id>`  admin

## Data Points

  Method   Endpoint             Auth           Notes
  -------- -------------------- -------------- --------------------------------------
  GET      /data-points         —              optional `?country_code=&indicator_code=`
  POST     /data-points         admin
  PUT      /data-points/`<id>`  admin
  DELETE   /data-points/`<id>`  admin

## Favorites

  Method   Endpoint            Auth           Notes
  -------- ------------------- -------------- --------------------------------------
  GET      /favorites          login required scoped to the logged-in user
  POST     /favorites          login required
  PUT      /favorites/`<id>`   login required
  DELETE   /favorites/`<id>`   login required

## Admin — Users

  Method   Endpoint            Auth   Notes
  -------- ------------------- ------ --------------------------------------------------
  GET      /admin/users        admin  list all users
  POST     /admin/users        admin  `{ email, password, role?, name?, phone?, address? }`
  PUT      /admin/users/`<id>` admin  update any subset of fields, including `role`
  DELETE   /admin/users/`<id>` admin  blocked for self-delete or the last remaining admin

------------------------------------------------------------------------

# Future Improvements

-   Password reset via email
-   Refresh tokens / server-side session revocation
-   Search & Filtering
-   Swagger/OpenAPI Documentation
-   Docker Support
-   Automated Testing
-   CI/CD Pipeline

------------------------------------------------------------------------

# Team

  Name             Responsibility
  ---------------- -------------------------------------
  Collins Kiptoo   Project Lead & Backend Architecture
  Shawn Ochieng    Backend API
  Wasaa Abdalla    Frontend Integration
  Samuel Wanjau    Frontend Features
  Rhoda Kinoti     UI/UX & Documentation

------------------------------------------------------------------------
