import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// SGDS v3 exposes its React wrappers under "./react/*", but that export maps to
// a directory rather than a file. Vite's dev server (esbuild) resolves this,
// but the production build (Rollup) does not, failing with "Rollup failed to
// resolve import @govtechsg/sgds-web-component/react/<name>".
//
// This plugin rewrites those bare subpath imports to their concrete entry file
// (react/<name>/index.js) so both dev and build resolve identically. Remove it
// if a future SGDS release ships explicit per-component export entries.
function sgdsReactSubpathFix() {
  const prefix = "@govtechsg/sgds-web-component/react/";
  return {
    name: "sgds-react-subpath-fix",
    enforce: "pre",
    async resolveId(source, importer) {
      if (source.startsWith(prefix) && !source.endsWith(".js")) {
        const name = source.slice(prefix.length);
        if (!name.includes("/")) {
          const resolved = await this.resolve(`${source}/index.js`, importer, { skipSelf: true });
          if (resolved) return resolved;
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [sgdsReactSubpathFix(), react(), tailwindcss()],
});
