<div align="center">

# SSPP — School-SAF Partnership Programme

**A matching platform connecting schools with SAF units and ambassadors for student engagement programmes.**

Built on the Singapore Government Design System (SGDS)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SGDS](https://img.shields.io/badge/Design%20System-SGDS-8B0000)](https://www.designsystem.tech.gov.sg/)
[![Status](https://img.shields.io/badge/status-in%20development-yellow)](#roadmap)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Domain Rules](#domain-rules)
- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Known Gotchas](#known-gotchas)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SSPP is a web platform that matches **schools** with **SAF units** and **ambassadors** for student engagement programmes. It replaces manual coordination with a structured browse-and-match flow, automated tier eligibility, roster confirmation, and inventory tracking — all wrapped in an official Singapore Government look via SGDS.

**Three stakeholder types:**

| Role | Description |
|---|---|
| 🏫 **Schools** | Browse providers and request engagements |
| 🎖️ **Army Units** | Deliver hands-on programmes (Tier 1) |
| 🧑‍🤝‍🧑 **Army Ambassadors** | Deliver sharing sessions and booths, solo or in teams |
| 🛠️ **Admin** | Monitors platform health and approves volunteer signups — does not participate in matching |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom |
| Design system | [`@govtechsg/sgds-web-component`](https://www.designsystem.tech.gov.sg/) |
| Typography | DM Serif Display (headings) |
| State | `localStorage` (prototype stage — no backend yet) |

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
git clone <repo-url>
cd sspp
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

> Update these commands if your `package.json` scripts differ from Vite defaults.

### Demo / Test Mode

To bypass verification and domain checks for demos, add this to `.env.local`:

```env
VITE_TEST_MODE=true
```

---

## Domain Rules

These rules govern eligibility and matching logic across the platform:

| Rule | Description |
|---|---|
| **Tier 1** | Hands-on units only |
| **Tier 2** | Sharing + booth |
| **Tier 3** | Sharing only |
| **Rule B** *(ambassador booth rule)* | A team of 4+ ambassadors unlocks Tier 2 regardless of individual member mobility. Tier 1 always stays units-only. |
| **Admin role** | Monitor-only; excluded from the matching loop. Approves out-of-domain volunteer signups separately. |
| **Provider flow** | Providers cannot decline engagements — confirmation is two-sided provider-confirm only. |
| **Roster confirmation** | Ambassador teams confirm attendance per-member (Confirmed / Awaiting). |
| **Login access tiers** | `*.gov.sg` and `*.edu.sg` emails → direct access. All other domains → volunteer, pending admin approval. |
| **Inventory** | Stock reservation is automated and derived from confirmed matches — never manually assigned. |

---

## Features

- ✅ **Role-based signup** — school, army-unit, and army-ambassador onboarding with verified email/mobile fields
- ✅ **Browse & match** — filterable tabs, multi-select ambassador team-forming with a sticky team bar
- ✅ **Engagement state** — shared state via a `useEngagements` hook, persisted to `localStorage` (`sspp.engagements.v2`)
- ✅ **Roster tracking** — `EngagementRoster` component with per-member confirmation badges
- ✅ **Admin dashboard** — coverage bars by school level, reach/completion metrics, stale-school flagging (7-day threshold), upcoming engagements, interactive drill-down cards
- ✅ **Inventory monitoring** — automated stock reservation derived from live matches
- ✅ **Three-tier login** — domain-based access control with a `UserManagementPage` volunteer approval queue

---

## Project Structure

```
src/
├── components/
│   └── EngagementRoster.jsx
├── hooks/
│   └── useEngagements.js
├── pages/
│   ├── UserManagementPage.jsx
│   └── ...
├── data/
│   └── seed data (engagements, rosters, statuses)
└── ...
```

> Placeholder — replace with the actual tree (e.g. `tree src -I node_modules` output) once finalised.

---

## Architecture Notes

- Real backend calls exist in code but are inactive by default. They're marked with `── REAL`, `TODO(real-flow)`, and `TODO(real-auth)` comments alongside the active demo/localStorage path, so they're easy to find and wire up later.
- `deriveStockFromMatches` is implemented but dormant, pending the ambassador equipment-selection stock options list.
- No backend exists yet — all persistence is client-side (`localStorage`) for demo purposes.

---

## Known Gotchas

> Lessons learned during SGDS migration — worth keeping visible for future contributors.

- ⚠️ **Never import** `@govtechsg/sgds-web-component/css/utility.css` — it silently zeroes out all Tailwind v4 utility class generation. This took a bisection to diagnose.
- ⚠️ SGDS dialogs/drawers in React 19 require **imperative** `ref.show()` / `ref.hide()` calls — prop-based `open` state does not work.
- ⚠️ Verify SGDS API details (version numbers, prop names) against the [official docs](https://www.designsystem.tech.gov.sg/) before trusting AI-assisted migration code — plausible-but-fabricated specifics have crept in before.

---

## Roadmap

- [ ] Ambassador equipment-selection UI at confirm-time (activates `deriveStockFromMatches`)
- [ ] Real provider identity wiring (`TODO(real-auth)`) — pending backend identity tokens
- [ ] Backend specification — schema, endpoints, auth design
- [ ] MockPass/Singpass integration (backend-side)

**Deferred / out of scope:**
- Isomer (static site builder) — not suitable for this application's needs

---

## Contributing

_Add contribution guidelines here — branch naming, PR process, code style, etc._

## License

_Add license information here._

---

<div align="center">
<sub>Built for the School-SAF Partnership Programme (SSPP)</sub>
</div>
