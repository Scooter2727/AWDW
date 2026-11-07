const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    workers: 3,
    reporter: [["list"], ["html", { open: "never" }]],
    use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
    projects: [
        { name: "chrome", use: { channel: "chrome" } },
        { name: "edge", use: { channel: "msedge" } }
    ],
    webServer: { command: "npm start", url: "http://127.0.0.1:4173", reuseExistingServer: !process.env.CI }
});
