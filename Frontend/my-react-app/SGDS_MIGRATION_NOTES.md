# SGDS Migration — corrected build

This is the ChatGPT SGDS migration, fixed so it actually builds and runs. The
migration *strategy* was kept (it was sound); the toolchain and a few SGDS
details were corrected.

## What was wrong in the original, and what I changed

### 1. Toolchain pinned to non-existent / unstable versions (build-breaking)
The original package.json set Vite 8, React 19.2.6, ESLint 10, plugin-react 6 —
versions that don't exist or aren't stable. Vite 8 pulled in a rolldown native
binary that failed to load, so the project did not build at all.

Fixed package.json back to known-good versions, keeping the ONE real new
dependency:
  - @govtechsg/sgds-web-component ^3.25.0   (the actual SGDS library)
  - vite ^6, @vitejs/plugin-react ^4, react ^19.1, react-router ^7,
    tailwindcss ^4, eslint ^9

### 2. SGDS "./react/*" subpath didn't resolve in production (build-breaking)
SGDS exports its React wrappers under "./react/*", which maps to a directory,
not a file. Vite's dev server tolerated it; the production build (Rollup) did
not — "Rollup failed to resolve import .../react/alert" etc.

Fixed with a small Vite plugin in vite.config.js (sgdsReactSubpathFix) that
rewrites `.../react/<name>` to `.../react/<name>/index.js`. One config change
fixes every SGDS import at once. Remove it if a future SGDS release ships
explicit per-component export entries.

### 3. Invented datepicker prop
The Input datepicker passed `dateFormat="DD/MM/YYYY"`, which is not a real SGDS
prop (verified against the package's custom-elements.json). Removed. Date
formatting is handled by the existing toDisplayDate/toIsoDate helpers.

### 4. Fragile spinner import
The route loading fallback imported `.../react/spinner` (flaky wildcard). Now
uses the <sgds-spinner> custom element, registered explicitly in main.jsx.

## What ChatGPT got RIGHT (kept as-is)
- The compatibility-wrapper strategy: your pages still use <Button variant=…>,
  <Input>, <Select> etc. The wrappers now render SGDS components underneath, so
  the ~40 pages barely changed.
- Button variant/tone mapping — verified valid against SGDS's ButtonVariant
  ("primary"|"outline"|"ghost"|"danger") and ButtonTone ("brand"|"danger"|
  "fixed-light"|"neutral").
- hasFeedback prop typing: string ("style"|"text"|"both") on sgds-input,
  boolean on select/textarea/datepicker — this subtlety was correct.
- Event-forwarding shim (onSgdsInput/onSgdsChange -> event.target.value) so
  existing form logic keeps working.
- Theme CSS imports (day/night/sgds/utility) and the government masthead/footer.

## BUILD STATUS
`npm install` then `npm run build` → succeeds (65 modules, clean dist).
All source passes esbuild syntax check; all imports resolve.

## MUST TEST IN BROWSER (build can't verify these)
A build proves it compiles, NOT that the UI behaves. Please verify:
- [ ] Text inputs: typing, cursor position, that value updates the form
- [ ] Date picker: pick a date, confirm the form gets YYYY-MM-DD
- [ ] Select dropdowns: selecting an option updates the form
- [ ] The verification code fields (VerifiedField) still work
- [ ] Modals/drawers open and close (interest form, detail drawers)
- [ ] Multi-select chips and radio cards (browse filters, signup)
- [ ] Full flow: submit interest form -> provider confirm -> roster updates
- [ ] Test mode banner shows when VITE_TEST_MODE=true
- [ ] The SGDS look is acceptable (blue gov theme replaces the old near-black)

## Run it
    npm install
    npm run dev      # test in browser — do the checklist above
    npm run build    # should succeed
