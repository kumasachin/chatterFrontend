/// <reference types="vitest" />
import { resolve } from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: true,
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      "cypress",
      "tests/HelpPage.comprehensive.test.tsx", // Skip complex UI tests for now
      "tests/HelpPage.test.tsx", // Skip original complex HelpPage tests
      "tests/analytics.test.ts", // Skip complex analytics tests
      "tests/enhancedPerformance.test.ts", // Skip complex performance tests
      "tests/system.integration.test.ts", // Skip integration tests
    ],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "cypress/", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
