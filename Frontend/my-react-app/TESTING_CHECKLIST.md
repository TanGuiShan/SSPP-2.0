# SSPP Frontend — Testing Checklist

Work top to bottom. Each item is one thing to click and one thing to see.
`[ ]` = not tested, `[x]` = passed, `[!]` = failed (note what happened).

---

## 0. Setup

- [/] `npm run dev` starts with no errors in the terminal
- [/] Browser console (F12) is clean on first load
- [/] Page redirects `/` → `/login`

**Test mode** (skips verification + domain checks):
- [/] Create `.env.local` at project root with `VITE_TEST_MODE=true`, restart dev server
- [/] Console shows the orange "TEST MODE ON" warning
- [ ] Remove it / set `false` and restart to test the real gates

---

## 1. Auth & sign-up

### Role chooser
- [/] `/register` shows three cards: School, Army Unit, Army Ambassador
- [/] Each routes to its own form
- [/] "Change account type" returns to the chooser

### School sign-up (`/register/school`)
- [/] All sections render: engagement type, POC, school details, formations, password
- [/] **Test mode ON:** email/mobile show as verified immediately
- [/] **Test mode OFF:** "Send code" → code field → `123456` verifies (demo code)
- [ ] Editing a verified email/mobile drops the tick (test mode OFF)
- [ ] Submitting with no formation selected shows an error
- [ ] Password mismatch shows an error
- [ ] Valid submit → redirected to `/login`

### Unit sign-up (`/register/unit`)
- [ ] Rank dropdown starts at **3WO** (no PTE/CPL/SGT), includes **ME3–ME8**
- [ ] Picking "Sharing only" → panel shows Tier 3 only
- [ ] Picking "Sharing + booth" → panel shows Tier 1, 2, 3
- [ ] Topics and school levels are multi-select

### Ambassador sign-up (`/register/ambassador`)
- [ ] Rank dropdown same as unit (3WO lowest, ME3–ME8)
- [ ] Tier panel explains: solo = Tier 3, team of 4+ = Tier 2, Tier 1 units-only
- [ ] Panel does NOT claim mobility unlocks tiers (rule B — team size does)

### Login
- [ ] Demo role picker has 4 buttons: School, Unit, Ambassador, Admin
- [ ] Each lands on the right dashboard
- [ ] Forgot password → reset screen → back to sign-in

---

## 2. Tier rules (the important ones)

### As a school, Browse → I'm Interested

**Unit that offers sharing + booth:**
- [ ] Tier dropdown shows all three tiers
- [ ] Tier 1 reads "Hands-on", Tier 2 "Sharing + booth", Tier 3 "Sharing only"

**Unit that offers sharing only:**
- [ ] Tier dropdown shows Tier 3 only

**Single ambassador (I'm Interested on one card):**
- [ ] Tier dropdown shows Tier 3 only
- [ ] Note explains booth needs a team of 4

**Ambassador team of 2–3 (tick 2–3, submit):**
- [ ] Orange note: booth needs 4+, only Tier 3 available
- [ ] Tier dropdown shows Tier 3 only

**Ambassador team of 4+ (tick 4+, submit):**
- [ ] Note confirms booth (Tier 2) available
- [ ] Tier dropdown shows Tier 2 and Tier 3 — but NOT Tier 1
- [ ] No configuration ever offers Tier 1 for ambassadors

---

## 3. Browse & filters (School)

- [ ] Units tab shows unit cards; Ambassadors tab shows people cards
- [ ] Tab counts match the number of cards
- [ ] Each tab keeps its own filters when you switch away and back
- [ ] Formation / engagement type / topics / school level filters narrow results
- [ ] Date range filter: a unit free 1–31 Jul shows for a 15 Jul–15 Aug search
- [ ] "Clear all" resets every filter
- [ ] Filtering to zero results shows the empty-state message
- [ ] Unit card images load (no broken-image icons)

---

## 4. Engagement flow (end to end)

- [ ] **School:** submit an interest form → lands on Interest Forms, new row **Pending**
- [ ] Form ID is sequential (IF003, IF004…), not `IF2026…`
- [ ] Team submission shows "Ambassador team (N)" with the roster in the drawer
- [ ] **Admin:** Match Results → the form appears, Pending count correct
- [ ] Approve → form flips to Approved, match ID like `AWEE-2026-002`
- [ ] Reject with a reason → school sees the reason in the form drawer
- [ ] **School:** My Matches → approved match is there with correct code
- [ ] **School:** Dashboard counts (Engaged / Pending) reflect the above
- [ ] **Admin:** Dashboard counts move too
- [ ] Refresh the page — all of the above survives (localStorage)
- [ ] Admin "Reset demo data" returns everything to seed

---

## 5. Profiles

### School profile
- [ ] Fields mirror sign-up: school details, POC, engagement preferences
- [ ] Email/mobile show verified; editing drops the tick (test mode OFF)
- [ ] Save shows the green confirmation
- [ ] Delete account opens a centered confirm modal (not a right drawer)

### Unit profile
- [ ] Tier list reads T1 Hands-on / T2 Sharing+booth / T3 Sharing only
- [ ] Booth badge shows on T1 and T2, not T3
- [ ] Add / remove custom equipment per tier works

### Ambassador profile
- [ ] Rank dropdown correct (3WO lowest, ME3–ME8)
- [ ] Tier panel explains solo vs team-of-4, Tier 1 units-only
- [ ] Topics and levels multi-select

---

## 6. Army views

- [ ] Unit role: sidebar says "My Unit Profile"
- [ ] Ambassador role: sidebar says "My Profile", opens the individual profile
- [ ] Availability: multi-select timing works, needs a date + a slot to save
- [ ] My Engagements: rows open a details drawer

---

## 7. Cross-cutting

- [ ] No console errors clicking through every page in all four roles
- [ ] Logout returns to `/login` and clears the session
- [ ] Refresh keeps you logged in (until logout)
- [ ] Nothing shows `[object Object]` or `undefined` anywhere

---

## Known not-yet-wired (don't file these as bugs)

- Army "My Engagements" still reads seed data, not the shared engagement state
- Admin school-monitoring dashboard and stock/logistics page — not built yet
- Three-tier gov-domain login logic — not built yet
- SGDS component migration — not started
- All verification / MockPass — backend, mocked here
