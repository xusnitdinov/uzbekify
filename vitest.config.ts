import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["skills/uzbekify/tests/**/*.test.ts"],
    environment: "node",
    reporters: ["default"],
  },
});
