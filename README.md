# Global Health Observatory

> A clean dashboard that lets anyone explore WHO health indicators — life expectancy, immunization, disease burden — across 234 countries without needing to know the API.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

**🔗 Live Demo:** [moringa-project.syknown.co.ke](https://moringa-project.syknown.co.ke) &nbsp;·&nbsp; **🎥 Walkthrough:** [video link](https://)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [The API](#the-api)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [How It Works](#how-it-works)
- [Roadmap](#roadmap)
- [The Team](#the-team)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## About the Project

**The problem.** Global health data from the WHO is publicly available but buried in raw API responses that are hard for non-technical people to explore or compare.

**The user.** Students, researchers, and public health enthusiasts who want to understand how health outcomes differ across countries — without reading API documentation or writing SQL.

**The product.** Global Health Observatory lets users pick a country and immediately see summary health stats, explore how a single indicator has changed over time on a line chart, and compare that indicator across up to four countries side by side.

This is **Phase 1 of 3** of our capstone. Phase 1 is a fully client-side React app that pulls live data from the WHO GHO public API. In Phase 2 we replace that API with our own Flask backend and database, and in Phase 3 we add authentication and user-owned data. We chose this idea specifically because it has room to grow into a full-stack, multi-user product.

---

## Features

- 🔄 **Live data** — fetches up-to-date indicators from the WHO GHO API on demand.
- ⏳ **Loading states** — clear spinner feedback while data is being retrieved.
- ⚠️ **Graceful error handling** — friendly messages when a request fails or returns nothing.
- 📊 **Dashboard view** — animated stat cards showing key health indicators for a selected country.
- 📈 **Trends view** — one indicator plotted over time as a line chart.
- 🆚 **Compare view** — one indicator across 2–4 countries, side by side.
- 📱 **Responsive layout** — works on mobile and desktop.

---

## Screenshots

| Dashboard | Trends | Compare |
| :---: | :---: | :---: |
| ![Dashboard](screenshots/dashboard.png) | ![Trends](screenshots/trends.png) | ![Compare](screenshots/compare.png) |

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | State-based view switching (App.jsx) |
| Styling | Plain CSS with CSS custom properties |
| Data fetching | Fetch API |
| Deployment | — |

---

## The API

This app is built around the **WHO Global Health Observatory (GHO) OData API** — a free, public API exposing 3,000+ health indicators across 234 countries.

- **Docs:** [https://www.who.int/data/gho/info/gho-odata-api](https://www.who.int/data/gho/info/gho-odata-api)
- **Base URL:** `https://ghoapi.azureedge.net/api`
- **Endpoints used:** `GET /Indicator`, `GET /WHOSIS_000001`, `GET /{code}?$filter=SpatialDim eq '{ISO3}'`
- **Auth:** No key required

---

## Project Structure

```
group-project/
├── public/
├── src/
│   ├── components/        # ErrorMessage, Hero, Loading, Navbar, StatCard
│   ├── pages/             # Dashboard, Trends, Compare
│   ├── services/
│   │   └── gho.js         # all WHO API calls live here
│   ├── App.jsx            # view switching
│   ├── index.css          # design system + component styles
│   └── main.jsx           # entry point
├── index.html
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/collins-moringa/module-6-group-6-project.git
cd module-6-group-6-project

# 2. Install dependencies
npm install
```

### Run it

```bash
npm run dev
```

Then open the local URL shown in your terminal (usually `http://localhost:5173`).

> No API key required — the WHO GHO API is fully public.

---

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the local development server |
| `npm run build` | Builds the app for production |
| `npm run preview` | Serves the production build locally |

---

## How It Works

**Data fetching.** All WHO GHO calls are centralized in `src/services/gho.js` so components stay clean. Requests run inside `useEffect`, and responses are stored in component state.

**State management.** Every data view tracks three pieces of state:

- `loading` — true while the request is in flight, used to show a spinner.
- `error` — captures failed requests so we can show a friendly message instead of a blank screen.
- `data` — the fetched results that drive the UI.

**Components & views.** The app has three main views — **Dashboard** (stat cards for a country), **Trends** (single indicator over time), and **Compare** (one indicator across multiple countries) — composed of shared components like `StatCard`, `Navbar`, `Loading`, and `ErrorMessage`.

---

## Roadmap

- [x] **Phase 1 — React frontend** (this repo): live WHO API data, loading/error states, 3 views, responsive styling.
- [ ] **Phase 2 — Backend & database:** replace the public API with a Flask backend and a database we control.
- [ ] **Phase 3 — Auth & user data:** add authentication so each user can save favourite indicators and countries.

---

## The Team

| Name | Role | GitHub |
| --- | --- | --- |
| Collins Kiptoo | Lead — repo, API layer, integration, deployment | [@collins-moringa](https://github.com/collins-moringa) |
| Shawn Ochieng | Dashboard view — country selector, StatCard, latest-year data | [@username](https://github.com/) |
| Wasaa Abdalla | Trends view — indicator/country selectors, line chart | [@username](https://github.com/) |
| Samuel Wanjau | Compare view — multi-country picker, comparison chart | [@username](https://github.com/) |
| Rhoda Kinoti | UI/UX — design system, Navbar, Loading/Error components, styling | [@rhodaandrian-cell](https://github.com/rhodaandrian-cell) |

---

## Acknowledgements

- [WHO Global Health Observatory](https://www.who.int/data/gho/info/gho-odata-api) for the data
- Moringa School Capstone, Phase 1

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
