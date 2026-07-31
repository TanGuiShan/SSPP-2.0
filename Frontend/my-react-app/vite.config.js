import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function sgdsReactSubpathFix() {
  const prefix = "@govtechsg/sgds-web-component/react/";

  return {
    name: "sgds-react-subpath-fix",
    enforce: "pre",

    async resolveId(source, importer) {
      if (
        source.startsWith(prefix) &&
        !source.endsWith(".js")
      ) {
        const componentName = source.slice(prefix.length);

        if (!componentName.includes("/")) {
          const resolved = await this.resolve(
            `${source}/index.js`,
            importer,
            {
              skipSelf: true,
            }
          );

          if (resolved) {
            return resolved;
          }
        }
      }

      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    sgdsReactSubpathFix(),
    react(),
    tailwindcss(),
  ],

  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react-router-dom",
      "@lit/react",
    ],
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
    ],

    exclude: [
      "@govtechsg/sgds-web-component",
      "@lit/react",
    ],
  },
});