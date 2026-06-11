# Team Instructions

Welcome to the team! This document explains how to set up the project, how we work together on GitHub, and the conventions everyone follows so our code stays consistent. **Read this fully before writing any code.**

---

## What we're building

A **global health dashboard** powered by the **WHO Global Health Observatory (GHO) API**. Users pick a country and explore health indicators (life expectancy, immunization, disease burden) across three views:

1. **Dashboard** — summary stat cards for a selected country
2. **Trends** — one indicator over time, as a line chart
3. **Compare** — one indicator across 2–4 countries, side by side

This is **Phase 1 of 3**. In Phase 2 we add a backend, in Phase 3 user accounts — so build things cleanly, we'll extend them later.

---

## 1. Get it running locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (`node -v` to check)
- Git
- A code editor (VS Code recommended)

### Setup
```bash
# Clone the repo
git clone https://github.com/collins-moringa/module-6-group-6-project.git
cd [repo-name]

# Install dependencies
npm install

# Start the dev server
npm run dev          # [CHECK] use `npm start` if we used Create React App
```

Then open the local URL shown in your terminal (Vite defaults to `http://localhost:5173`).
---

## 2. Project structure

```
src/
├── services/      # API calls live here — gho.js  ([CHECK] match your filenames)
├── components/    # reusable UI: StatCard, Navbar, Loading, ErrorMessage
├── pages/         # the three views: Dashboard, Trends, Compare
├── App.jsx        # routing / view switching
└── main.jsx       # entry point
```

**Rule:** all data fetching goes through `services/gho.js`. Don't call the API directly from a component — import a service function instead. This keeps us consistent and makes Phase 2 easy.

---

## 3. How we work on GitHub

This is the most important section. Following it keeps our commit history clean (which is graded) and stops us overwriting each other's work.

### The golden rules
- **Never push directly to `main`.** All work goes through a branch + Pull Request.
- **One branch per task/issue.**
- **Always pull `main` before starting** so you're not building on stale code.

### Your workflow, every time
```bash
# 1. Start from an up-to-date main
git checkout main
git pull origin main

# 2. Create a branch for your task
git checkout -b feature/dashboard-stat-cards

# 3. Do your work, then commit in small, meaningful chunks
git add .
git commit -m "Add StatCard component for Dashboard"

# 4. Push your branch
git push -u origin feature/dashboard-stat-cards

# 5. Open a Pull Request on GitHub, request a review, and wait for approval before merging
```

### Branch names
`feature/short-description` — e.g. `feature/trends-line-chart`, `fix/error-state-compare`.

### Commit messages
Short, imperative, and specific:
- ✅ `Add country selector to Dashboard`
- ✅ `Fix loading spinner not clearing on error`
- ❌ `update`, `stuff`, `fixed it`, `asdf`

### Pull Requests
- Keep them small — easier to review.
- Write one line on what the PR does and link the issue (`Closes #12`).
- **At least one teammate reviews before merge.** Use **squash merge** to keep history tidy.
- Don't review your own PR.

---

## 4. How to fetch data (the API layer)

All GHO calls are wrapped in `services/gho.js`. Import what you need — don't reinvent fetch logic.

| Function | Returns | Use it for |
|---|---|---|
| `getIndicators()` | list of `{ IndicatorCode, IndicatorName }` | indicator dropdowns |
| `getCountries()` | list of `{ Code, Title }` | country selectors |
| `getIndicatorData(code, countryCode)` | rows of data for charts/cards | Dashboard, Trends, Compare |


**Useful indicator codes to start with:** `WHOSIS_000001` (life expectancy at birth), `WHOSIS_000015` (life expectancy at 60). Browse the full list at the `Indicator` endpoint.

**What a data row looks like:** each row has `SpatialDim` (country ISO3 code, e.g. `KEN`), `TimeDim` (year), `NumericValue` (the number), and `Dim1` (a breakdown like sex — `BTSX` = both sexes, `MLE`/`FMLE`). Filter to `BTSX` unless your view needs the breakdown.

**Raw endpoints** (paste into a browser to explore): base is `https://ghoapi.azureedge.net/api` — try `/Indicator`, `/WHOSIS_000001`, or `/WHOSIS_000001?$filter=SpatialDim eq 'KEN'`.

---

## 5. The state pattern every view must follow

Every view that loads data handles **three states**: loading, error, and data. This is a graded requirement, so don't skip it. Copy this template:

```jsx
import { useState, useEffect } from "react";
import { getIndicatorData } from "../services/gho";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function ExampleView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getIndicatorData("WHOSIS_000001", "KEN")
      .then((rows) => setData(rows))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* render your data here */}
    </div>
  );
}

export default ExampleView;
```

`Loading` and `ErrorMessage` are shared components — use them everywhere so the app feels consistent.

---

## 6. Definition of Done

Before you open a PR, your task should tick every box:

- [ ] Fetches **live data** through a `services/gho.js` function (no hardcoded data)
- [ ] Shows a **loading** state while fetching
- [ ] Shows a friendly **error** message if the request fails
- [ ] Renders correctly with real data
- [ ] Works on **mobile** widths (resize your browser to check)
- [ ] **No errors** in the browser console
- [ ] Branch is up to date with `main` and a PR is open with a review requested

---

## 7. Who owns what

| Member | Owns | Main tasks |
|---|---|---|
| **[Collins Kiptoo ] (Lead)** | Repo, API layer, integration | Scaffold, `gho.js`, shared state pattern, PR reviews, deployment |
| **[Shawn Ochieng]** | Dashboard view | Country selector, StatCard component, latest-year data |
| **[Wasaa Abdalla]** | Trends view | Indicator/country selectors, line chart over time |
| **[Samuel Wanjau]** | Compare view | Multi-country picker, comparison chart |
| **[Rhoda Kinoti]** | UI/UX + design system | Navbar, layout, shared Loading/Error components, styling, slide deck |

Everyone writes their own section of the **written reflection** and does their own **peer response**.

---

## 8. Communication

- **Daily async check-in** in [CHECK: our group chat — WhatsApp/Mattermost]: what you did, what's next, what's blocking you.
- **Blocked? Say so early.** Don't sit stuck for hours — tag the lead or whoever owns that area.
- Questions about the API or a shared component → ask before duplicating work.

---

## 9. Common issues

- **App won't start?** Delete `node_modules`, run `npm install` again.
- **"Nothing shows up"?** Open the browser console and Network tab — check the API call actually returned data. Test the raw endpoint URL in a browser.
- **Merge conflict?** Pull `main` into your branch (`git pull origin main`), resolve, commit. Ask for help if unsure — don't force-push over `main`.
- **CORS error in the console?** Flag it to the lead; for Phase 1 we may need a small proxy, and Phase 2's backend removes the issue entirely.

---

Let's build something clean. 