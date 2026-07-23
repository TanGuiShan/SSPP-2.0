/**
 * Tailwind v4 normally auto-detects source files, but that scanning can fail
 * depending on how the CSS entry is imported. This explicit content config is
 * the robust fallback: it tells Tailwind exactly which files to scan for class
 * names, so utilities are always generated.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
};
