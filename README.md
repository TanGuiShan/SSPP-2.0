<div align="center">

# SSPP — School-SAF Partnership Programme

**A matching platform connecting schools with SAF units and ambassadors for student engagement programmes.**

Built on the Singapore Government Design System (SGDS)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2F%20Firestore-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](#roadmap)

</div>

---

This document covers both the product (for stakeholders) and the implementation (for engineers). [Overview](#overview), [Domain Rules](#domain-rules), [Features](#features), and [Roadmap](#roadmap) describe what the platform does; [Tech Stack](#tech-stack) onward describes how it's built.

## Table of Contents

- [Overview](#overview)
- [Domain Rules](#domain-rules)
- [Features](#features)
- [Roadmap](#roadmap)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Contributing](#contributing)

---

## Overview

SSPP is a web platform that matches **schools** with **SAF units** and **ambassadors** for student engagement programmes. It replaces manual coordination with a structured browse-and-match flow, automated tier eligibility, roster confirmation, and inventory tracking — presented through an official Singapore Government look via SGDS.

**Stakeholder roles:**

| Role | Description |
|---|---|
| **Schools** | Browse providers and request engagements |
| **Army Units** | Deliver hands-on programmes (Tier 1) |
| **Army Ambassadors** | Deliver sharing sessions and booths, solo or in teams |
| **Admin** | Monitors platform health and approves volunteer signups — does not participate in matching |

---

## Domain Rules

### Tier Definitions

Tiers classify what kind of engagement a provider can deliver — they are **definitions**, not rules:

| Tier | Definition |
|---|---|
| **Tier 1** | Hands-on units only |
| **Tier 2** | Sharing + booth |
| **Tier 3** | Sharing only |

### Rules

These govern eligibility and matching logic across the platform:

| Rule | Description |
|---|---|
| **Rule B** *(ambassador booth rule)* | A team of 4+ ambassadors unlocks Tier 2 regardless of individual member mobility. Tier 1 always stays units-only. |
| **Admin role** | Monitor-only; excluded from the matching loop. Approves out-of-domain volunteer signups separately. |
| **Provider flow** | Providers cannot decline engagements — confirmation is two-sided provider-confirm only. |
| **Roster confirmation** | Ambassador teams confirm attendance per-member (Confirmed / Awaiting). |
| **Login access tiers** | `*.gov.sg` and `*.edu.sg` emails → direct access. All other domains → volunteer, pending admin approval. |
| **Inventory** | Stock reservation is automated and derived from confirmed matches — never manually assigned. |

---

## Features

| Feature | Functionality |
|---|---|
| **Role-based signup** | School, army-unit, and army-ambassador onboarding with verified email/mobile fields |
| **Browse & match** | Filterable tabs, multi-select ambassador team-forming with a sticky team bar |
| **Engagement state** | Shared state via a `useEngagements` hook, synced to Firestore (`engagementsFirestore.js`) |
| **Roster tracking** | `EngagementRoster` component with per-member confirmation badges |
| **Admin dashboard** | Coverage bars by school level, reach/completion metrics, stale-school flagging (7-day threshold), upcoming engagements, interactive drill-down cards |
| **Inventory monitoring** | Automated stock reservation derived from live matches |
| **Three-tier login** | Domain-based access control with a `UserManagementPage` volunteer approval queue |

---

## Roadmap

- [ ] Ambassador equipment-selection UI at confirm-time (activates `deriveStockFromMatches`)
- [ ] MockPass/Singpass integration — not yet started; current auth is Firebase email/password only
- [ ] Retire the legacy Express `/auth` routes and in-memory mock DB in `Backend/`, or repurpose the server for MockPass/Singpass token exchange
- [ ] Resolve remaining `TODO(real-flow)` / `TODO(real-auth)` markers left over from the pre-Firestore demo path

**Deferred / out of scope:**
- Isomer (static site builder) — not suitable for this application's needs

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom |
| Design system | [`@govtechsg/sgds-web-component`](https://www.designsystem.tech.gov.sg/) |
| Typography | DM Serif Display (headings) |
| Backend / Data | Firebase Auth + Firestore *(see [Architecture Notes](#architecture-notes))* |
| Dev server | Express (`server.js`) hosting Vite middleware |
| Deployment | [Vercel](https://vercel.com) — static SPA build |

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Quickstart

```bash
git clone <repo-url>
cd sspp
npm install
npm run dev
```

### Build for production

```bash
npm run build
```

> [!NOTE]
> Update these commands if your `package.json` scripts differ from the Vite defaults.

### Demo / Test Mode

To bypass verification and domain checks for demos, add this to `.env.local`:

```env
VITE_TEST_MODE=true
```

---

## Project Structure

```
server.js                        # Express entry point, hosts Vite middleware (root `npm run dev`)
Backend/                         # Legacy Express /auth routes + in-memory mock DB (unused by the frontend)
firestore.rules                  # Claim-on-signup Firestore security rules

Frontend/my-react-app/
src
    ├───api                      # engagementsFirestore.js, verifyApi.js
    ├───assets
    │   ├───icons
    │   └───images
    ├───components
    │   ├───common
    │   ├───formation
    │   ├───layout
    │   └───match
    ├───config
    ├───data
    │   └───demo
    ├───hooks                    # useEngagements, useAuth, useTiers, useCollection, ...
    ├───layouts
    ├───pages
    │   ├───admin
    │   ├───army
    │   ├───auth
    │   ├───public
    │   └───school
    ├───routes
    ├───services
    │   └───firebase             # client.js, auth.service.js, profile.service.js, catalog.service.js,
    │                            # tiers.service.js, inventory.service.js, feedback.service.js, demo.service.js
    ├───styles
    └───utils
```

---

## Architecture Notes

**Data & auth**
- The backend is Firestore. All application data (engagements, rosters, tiers, inventory, catalog, feedback, profiles) is read and written through `src/services/firebase/*` — `client.js` is the only file that touches the Firebase SDK directly, everything else imports from there.
- Firebase Auth handles sign-in/sign-up/verification/password reset (`auth.service.js`). Security is enforced with a **claim-on-signup** model in `firestore.rules`: schools own docs stamped with their `uid` at submit time, and providers (units/ambassadors) claim a catalog identity at signup.

**Deployment**
- Production deploys go to Vercel as a static SPA built from `Frontend/my-react-app` (`vercel.json` handles the rewrite). Express/`server.js` is **not** part of that deployment — it's local-dev tooling only.

> [!WARNING]
> A separate Express server (`server.js` + `Backend/`) still exists with its own `/auth` routes and an in-memory mock DB. This predates the Firebase migration and is no longer called by the frontend — it's kept around only as the Vite dev-server host (`npm run dev` at the repo root boots it). The `/auth` routes themselves are dead code.

> [!IMPORTANT]
> MockPass/Singpass is **not yet integrated** — current auth is Firebase email/password only.

**Known gaps**
- `deriveStockFromMatches` is implemented but dormant, pending the ambassador equipment-selection stock options list.
- Some code paths are still marked `── REAL`, `TODO(real-flow)`, `TODO(real-auth)` alongside an active demo path — these predate the Firestore integration and are worth revisiting to confirm whether they're still needed.

---

## Contributing

Developed and maintained by Tan Gui Shan — full-stack, covering both the React/SGDS frontend and the Firebase/Firestore backend integration.

---

<div align="center">
<sub>Built for the School-SAF Partnership Programme (SSPP)</sub>
</div>
