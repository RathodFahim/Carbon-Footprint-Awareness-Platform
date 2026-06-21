# 🌱 Carbon Footprint Tracker

A production-ready **Carbon Footprint Awareness Platform** that tracks individual
environmental impact using rigorous greenhouse-gas math and delivers dynamic,
quantified, behaviorally-designed recommendations.

Built with **React + TypeScript + Tailwind CSS v4**, powered entirely on the
client (no backend required). All emission factors are hardcoded from recognized
regional databases (CEA India, IPCC AR5, India GHG Program).

---

## ✨ Features

- **Unified Dashboard** — live daily / monthly / annualized footprint in kg CO₂e,
  with a comparison gauge against the regional baseline.
- **Progressive Trackers** — sliders pre-filled with regional averages, plus exact
  numeric overrides for energy (kWh from your bill), transport (real mileage),
  diet, and waste.
- **Interactive Charts** — category distribution donut and a "You vs. Baseline"
  grouped bar chart showing percentage breakdowns.
- **Dynamic Recommendation Engine** — conditional, deduplicated tips that quantify
  the exact CO₂e saved, organized into an **Effort-to-Impact Matrix**:
  - 🟢 **Quick Wins** (low effort / high impact)
  - 🟡 **Habit Shifts** (medium effort)
  - 🔴 **Major Moves** (high effort)
- **Accessibility** — `aria-live` regions announce real-time calculation changes.
- **Robust math** — every calculation is NaN-safe, handles zeros, outliers, and
  null values without crashing.

---

## 🧮 The Calculation Engine

All emissions roll up into the standard GHG Protocol equation:

```
CO₂e = Activity Data × Emission Factor × GWP
```

Key guarantees implemented in `src/utils/emissionsMath.ts`:

- **No double counting** — selecting *100% solar* strictly multiplies the grid
  emission factor by `0`. Recycling earns an avoided-emissions credit.
- **GWP-weighted** — methane-heavy sources (e.g. landfill waste) apply their
  IPCC AR5 GWP (CH₄ = 28) explicitly.
- **Edge-case safe** — `sanitize()` coerces every input to a finite, clamped
  number, so the engine never returns `NaN` or divides by zero.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx                     # Root component & layout
│   ├── context/
│   │   └── FootprintContext.tsx    # Global state + memoized selectors
│   └── components/
│       ├── dashboard/              # Metrics, gauge, charts
│       ├── trackers/               # Energy / Transport / Diet / Waste inputs
│       ├── recommendations/        # Effort-to-impact matrix UI
│       ├── shared/                 # Reusable LabeledSlider, EnumSelect
│       └── ui/                     # Design-system primitives (shadcn-style)
├── utils/
│   ├── types.ts                    # Strict TypeScript interfaces
│   ├── emissionFactors.ts          # Hardcoded regional factors + sources
│   ├── emissionsMath.ts            # Pure calculation engine
│   ├── emissionsMath.test.ts       # Vitest suite (21 tests)
│   ├── baseline.ts                 # Regional average profile
│   └── recommendations.ts          # Conditional recommendation rules
└── styles/                         # Tailwind v4 + theme tokens
```

---

## 🚀 Running the App

> **Note:** This project uses **pnpm** and **Tailwind CSS v4**.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the dev server

```bash
pnpm dev
```

Then open the local URL printed in the terminal (typically
`http://localhost:5173`).

### 3. Build for production

```bash
pnpm build
```

---

## 🧪 Running Tests

The calculation engine is covered by an aggressive Vitest suite that verifies
standard inputs, limits, zero-values, and the no-double-counting override.

```bash
pnpm exec vitest run        # run once
pnpm exec vitest            # watch mode
```

Expected: **21 tests passing.**

---

## ☁️ Deploying to Vercel

This project runs inside Figma Make using an auto-generated entrypoint, so it
has **no `index.html`** (Figma blocks creating one). After exporting the code to
your own GitHub repo, add the single file below to make it a standard,
Vercel-deployable Vite app. Everything else (`src/main.tsx`, `vite.config.ts`,
`react`/`react-dom` in dependencies, build scripts) is already set up.

**1. Create `index.html` in the repo root:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Carbon Footprint Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**2. Verify the build locally (optional):**

```bash
pnpm install
pnpm build        # outputs to dist/
pnpm preview      # serves the production build
```

**3. Deploy on Vercel:**

1. Push the repo to GitHub.
2. Vercel → **Add New Project** → import the repo.
3. Settings (Vercel auto-detects most of these):
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
4. Click **Deploy**. Done — Vercel gives you a live `*.vercel.app` URL.

---

## 🛠️ Tech Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Framework      | React 18 + TypeScript           |
| Styling        | Tailwind CSS v4                 |
| Build tool     | Vite                            |
| State          | React Context + custom hooks    |
| Charts         | Recharts (donut) + custom CSS/SVG |
| Icons          | lucide-react                    |
| Testing        | Vitest                          |

---

## 📊 Data Sources

| Category     | Source                                            |
| ------------ | ------------------------------------------------- |
| Electricity  | CEA India CO₂ Baseline Database (~0.716 kg/kWh)   |
| Fuels        | IPCC 2006 Guidelines / India GHG Program          |
| Diet         | Scarborough et al. 2014 (adapted)                 |
| Waste        | IPCC Waste Model (CH₄, GWP 28)                     |
| Aviation     | DEFRA / ICAO with radiative-forcing uplift        |

> ⚠️ Figures are **indicative estimates**, not a certified carbon audit.

---

## 📄 License

Provided as-is for educational and awareness purposes.
