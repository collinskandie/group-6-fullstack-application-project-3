# Team Instructions - Phase 2 (Full Stack)

Welcome to **Phase 2**!

In Phase 1 we built a frontend that consumed the WHO Global Health
Observatory API. In Phase 2 we will extend the project into a complete
**full-stack application** using React, Flask, and PostgreSQL.

------------------------------------------------------------------------

# Project Overview

## Objective

Replace the public WHO API with our own backend that stores and manages
user-created data while maintaining the existing application experience.

Our application must:

-   Build a Flask REST API
-   Use PostgreSQL for data persistence
-   Support CRUD operations across at least two related resources
-   Connect the React frontend to our own backend
-   Demonstrate clean architecture and collaborative development

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   React
-   React Router
-   Axios
-   CSS

## Backend

-   Flask
-   SQLAlchemy
-   Flask-Migrate
-   PostgreSQL
-   Flask-CORS

## Tools

-   Git
-   GitHub
-   Postman
-   VS Code

------------------------------------------------------------------------

# Project Structure

``` text
project/
│
├── frontend/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models/
│   ├── routes/
│   ├── migrations/
│   ├── seed.py
│   └── requirements.txt
│
└── README.md
```

------------------------------------------------------------------------

# Git Workflow

Never push directly to **main**.

``` bash
git checkout main
git pull origin main

git checkout -b feature/your-task
```

After completing your work:

``` bash
git add .
git commit -m "Meaningful commit message"
git push -u origin feature/your-task
```

Create a Pull Request and wait for at least one review before merging.

------------------------------------------------------------------------

# Branch Naming

    feature/database-models
    feature/api-endpoints
    feature/frontend-integration
    feature/dashboard-ui
    feature/documentation
    fix/error-handling

------------------------------------------------------------------------

# Commit Messages

Good examples:

-   Add Country model
-   Create Favorites CRUD endpoints
-   Connect frontend to Flask API
-   Fix loading state

Avoid:

-   update
-   done
-   fixed
-   changes

------------------------------------------------------------------------

# Coding Standards

## Backend

-   Return JSON responses only
-   Use proper HTTP status codes
-   Use SQLAlchemy ORM
-   Keep models, routes and configuration separated
-   Validate incoming data

## Frontend

-   Use Axios for all API communication
-   No hardcoded data
-   Handle Loading, Error and Success states
-   Build reusable components

------------------------------------------------------------------------

# Suggested Resources

Resource 1

-   Country

Resource 2

-   Favorite

Relationship

One Country → Many Favorites

------------------------------------------------------------------------

# Team Responsibilities

## Collins -- Project Lead

Responsibilities

-   Project architecture
-   Backend setup
-   PostgreSQL configuration
-   Database models
-   Integration
-   Code reviews
-   Deployment

Deliverables

-   Backend scaffold
-   Database relationships
-   Final integration
-   README updates

------------------------------------------------------------------------

## Shawn -- Backend API

Responsibilities

-   CRUD endpoints
-   Request validation
-   Error handling
-   API testing

Deliverables

-   REST API
-   Postman collection

------------------------------------------------------------------------

## Wasaa -- Frontend Integration

Responsibilities

-   Replace WHO API calls
-   Axios services
-   State management
-   API integration

Deliverables

-   Connected frontend
-   API service layer

------------------------------------------------------------------------

## Samuel -- Frontend Features

Responsibilities

-   CRUD interfaces
-   Forms
-   Dashboard improvements
-   Responsive functionality

Deliverables

-   User interaction
-   Complete CRUD experience

------------------------------------------------------------------------

## Rhoda -- UI/UX & Documentation

Responsibilities

-   Styling
-   Responsive design
-   ERD
-   README
-   Presentation slides
-   Demo video
-   Screenshots

Deliverables

-   Documentation
-   Final presentation materials

------------------------------------------------------------------------

# Definition of Done

Before opening a Pull Request:

Backend

-   Endpoint tested
-   Returns JSON
-   Proper HTTP status codes
-   Database migrations succeed
-   No server errors

Frontend

-   Connected to Flask API
-   CRUD fully functional
-   Loading state implemented
-   Error state implemented
-   Responsive layout

General

-   No merge conflicts
-   PR opened
-   Reviewed by another team member

------------------------------------------------------------------------

# Daily Communication

Every member should share:

-   Yesterday's progress
-   Today's plan
-   Current blockers

If blocked for more than one hour, notify the team immediately.
