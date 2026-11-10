import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./test/browser",
  workers: 1,
  timeout: 90000,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: process.env.TEST_UI_URL || "http://127.0.0.1:5178",
    channel: process.env.PW_BROWSER_CHANNEL || undefined,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "off",
  },
});
