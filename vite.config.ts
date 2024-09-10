import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/participatory-planning" : "/",
  optimizeDeps: {
    exclude: [
      "@esri/calcite-components",
      "@esri/calcite-components-react",
      "@arcgis/core",
    ],
  },
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy"],
        },
      },
    }),
  ],
}));
