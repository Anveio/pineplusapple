/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const baseConfig = defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    setupFiles: ["./test/setup-test-env.ts"],
    include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchExclude: [".*\\/node_modules\\/.*", ".*\\/build\\/.*"],
  },
});

export const reactConfig = mergeConfig(baseConfig, {
  plugins: [tsconfigPaths(), react()],
  environment: "happy-dom",
});
