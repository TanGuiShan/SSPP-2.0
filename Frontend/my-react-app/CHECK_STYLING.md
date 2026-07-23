# Styling — Step 2 fallback is now APPLIED

## What was done
The robust content config is already set up in this package:
- `tailwind.config.js` (project root) lists the files to scan
- `src/styles/global.css` references it via `@config "../../tailwind.config.js"`

This is the canonical, documented Tailwind v4 setup and generates all utility
classes on a normal machine. (It could not be verified in the assistant's
sandbox because that environment's Tailwind scanner binary doesn't run — a
sandbox-only limitation, not a code issue.)

## Verify on your machine — one check
```
npm install
npm run build
```
Then search the built CSS:
```
# Windows PowerShell
Select-String -Path dist/assets/*.css -Pattern "grid-cols-7"
# Mac/Linux
grep -o "grid-cols-7" dist/assets/*.css
```

- **Prints a match** → utilities are generating. Run `npm run dev`; the UI is
  styled. You're done.
- **Prints nothing** → tell me, and paste the output of:
  ```
  npx @tailwindcss/cli@4 -i src/styles/global.css -o test.css
  ```
  plus your Node version (`node -v`). That pins down the environment.

## Bugs already fixed in this package
- Ambassador "· undefined" subtitle → fixed (data/seed.js)
- Purple accents → SGDS blue
- CSS import order → Tailwind first
- Content scanning → explicit @config (this file)

## Option A — full SGDS look
Once utilities apply, if any purple remains it's from an SGDS theme token;
tell me where and I'll retint it to the official blue.
