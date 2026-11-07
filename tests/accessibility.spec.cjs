const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs/promises");

const originalParagraphs = [
    "lorem ipsum dolor sit amet consectetur adipiscing elit proident sunt placeat est quos incididunt amet blanditiis et est deserunt ut laboris qui eum cum nam fugiat placeat sunt quo consequat dolore nisi ullamco et sunt deserunt veniam reprehenderit et imperdiet cillum eum possimus quas at fugiat eiusmod cumque voluptas dolor",
    '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."'
];
const originalNavigation = [
    ["Home", "#home"], ["About Us", "#about"], ["Apply Now", "#apply"],
    ["Event Schedule", "#schedule"], ["Contact", "#contact"]
];
const normalize = text => text.replace(/\s+/g, " ").trim();

async function audit(page, testInfo, label) {
    const results = await new AxeBuilder({ page }).analyze();
    await fs.mkdir("accessibility-results", { recursive: true });
    await fs.writeFile(`accessibility-results/axe-${testInfo.project.name}-${label}.json`, JSON.stringify({
        timestamp: results.timestamp,
        engine: results.testEngine,
        violations: results.violations,
        passedRuleCount: results.passes.length,
        manualReview: results.incomplete.map(rule => ({ id: rule.id, help: rule.help, targets: rule.nodes.map(node => node.target) }))
    }, null, 2));
    await testInfo.attach(`${label}-axe`, { body: JSON.stringify(results, null, 2), contentType: "application/json" });
    expect(results.violations.map(rule => ({ id: rule.id, nodes: rule.nodes.map(node => node.target) }))).toEqual([]);
}

async function expectOriginalCopy(page) {
    const copy = await page.locator("body").evaluate(body => {
        const clone = body.cloneNode(true);
        clone.querySelectorAll(".skip-link, #search-status, .mock-panel, script").forEach(node => node.remove());
        return clone.textContent.replace(/\s+/g, " ").trim();
    });
    expect(copy).toBe([
        "HackTrent @ Trent University Search: Go",
        originalNavigation.map(([label]) => label).join(" "),
        "Main content", ...originalParagraphs,
        "this is the right content HackTrent2025 Recap November 15, 2025",
        "© 2026 HackTrent. All rights reserved. Privacy Policy Terms of Use Accessibility"
    ].join(" "));
    await expect(page.locator(".original-copy p")).toHaveCount(2);
    expect((await page.locator(".original-copy p").allTextContents()).map(normalize)).toEqual(originalParagraphs);
    await expect(page.locator("#application-form, table, details, .hero, .policy-grid")).toHaveCount(0);
}

test("content: preserve original copy alongside the explicitly requested mock form", async ({ page }) => {
    await page.goto("/");
    await expectOriginalCopy(page);
    for (const [label, destination] of originalNavigation) {
        await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: label, exact: true })).toHaveAttribute("href", destination);
    }
    await expect(page.getByRole("link", { name: "HackTrent2025 Recap" })).toHaveAttribute("href", "#image");
    const missing = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
    expect(missing).toEqual(["#about", "#schedule", "#contact", "#image", "#privacy", "#terms", "#accessibility"]);
});

test("desktop: semantics, image descriptions, assets, labels, and axe", async ({ page }, testInfo) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "HackTrent" })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("complementary", { name: "this is the right content" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search:" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("HackTrent | Accessibility Challenge");
    expect(await page.locator("img").evaluateAll(images => images.length === 2 && images.every(img => img.alt.trim() && img.complete && img.naturalWidth > 0))).toBe(true);
    await audit(page, testInfo, "desktop");
    expect(errors).toEqual([]);
    await page.screenshot({ path: `accessibility-results/${testInfo.project.name}-desktop.png`, fullPage: true });
    await page.screenshot({ path: `accessibility-results/${testInfo.project.name}-preview.png` });
});

test("keyboard: skip link bypasses header and navigation", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox", { name: "Full name (required)", exact: true })).toBeFocused();
});

test("keyboard: all existing controls are reachable, focus stays visible, and reverse Tab works", async ({ page }) => {
    await page.goto("/");
    const visited = [];
    for (let i = 0; i < 30; i++) {
        await page.keyboard.press("Tab");
        const item = await page.evaluate(() => {
            const element = document.activeElement;
            const bounds = element.getBoundingClientRect();
            return {
                tag: element.tagName, id: element.id, text: element.textContent.trim(),
                outline: parseFloat(getComputedStyle(element).outlineWidth),
                visible: bounds.bottom > 0 && bounds.top < innerHeight && bounds.left >= 0 && bounds.right <= innerWidth + 1
            };
        });
        if (item.tag === "BODY") break;
        expect(item.visible, item.text || item.id).toBe(true);
        expect(item.outline, item.text || item.id).toBeGreaterThanOrEqual(3);
        visited.push(item);
    }
    expect(visited.map(item => item.id || item.text)).toEqual([
        "Skip to main content", "search-query", "Go", ...originalNavigation.map(([label]) => label),
        "mock-name", "mock-email", "mock-solo", "mock-acknowledgement", "Submit mock form", "Clear form",
        "HackTrent2025 Recap", "Privacy Policy", "Terms of Use", "Accessibility"
    ]);
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Accessibility", exact: true })).toBeFocused();
    expect(await page.locator("[tabindex]").evaluateAll(nodes => nodes.every(node => node.tabIndex <= 0))).toBe(true);
});

test("keyboard: Home is a native link to the existing header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Home", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#home$/);
    await expect(page.locator("#home")).toBeInViewport();
});

test("search: empty input exposes an error, preserves focus, and passes axe", async ({ page }, testInfo) => {
    await page.goto("/");
    const input = page.getByRole("searchbox", { name: "Search:" });
    await input.fill("   ");
    await input.press("Enter");
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#search-status")).toHaveText("Enter a search term.");
    await expect(input).toHaveAccessibleDescription("Enter a search term.");
    await audit(page, testInfo, "search-error");
    await input.fill("lorem");
    await expect(input).not.toHaveAttribute("aria-invalid", "true");
});

test("search: highlight original text, announce repeats, clear safely, and preserve copy", async ({ page }, testInfo) => {
    await page.goto("/");
    const input = page.getByRole("searchbox", { name: "Search:" });
    await input.fill("lorem");
    await input.press("Enter");
    await expect(input).toBeFocused();
    await expect(page.locator("mark")).toHaveCount(2);
    await expect(page.locator("#search-status")).toContainText("2 matches found");
    await expectOriginalCopy(page);
    await input.press("Enter");
    await expect(page.locator("#search-status")).toContainText("2 matches found");
    await audit(page, testInfo, "search-matches");
    await input.fill("<img src=x onerror=alert(1)>");
    await input.press("Enter");
    await expect(page.locator("#search-status")).toHaveText("No matches found.");
    await expect(page.locator("img")).toHaveCount(2);
    await expect(page.locator("mark")).toHaveCount(0);
    await input.fill("");
    await expect(page.locator("#search-status")).toBeEmpty();
    await expectOriginalCopy(page);
});

test("search: literal regex punctuation and wrapped phrases are handled", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("searchbox", { name: "Search:" });
    await input.fill("amet blanditiis");
    await input.press("Enter");
    await expect(page.locator("mark")).toHaveCount(1);
    await input.fill("[.*]");
    await input.press("Enter");
    await expect(page.locator("#search-status")).toHaveText("No matches found.");
    await expectOriginalCopy(page);
});

test("search: Go works with Space without moving focus or uploading the query", async ({ page }) => {
    await page.goto("/");
    const requests = [];
    page.on("request", request => requests.push(request.url()));
    await page.getByRole("searchbox", { name: "Search:" }).fill("Recap");
    await page.getByRole("button", { name: "Go", exact: true }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Go", exact: true })).toBeFocused();
    await expect(page.locator("#search-status")).toContainText("1 match found");
    expect(requests).toEqual([]);
    await expect(page).toHaveURL("http://127.0.0.1:4173/");
});

for (const width of [320, 375, 768, 1024, 1440]) {
    test(`responsive: ${width}px has no horizontal page overflow`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 320) {
            await audit(page, testInfo, "mobile-320");
            await page.screenshot({ path: `accessibility-results/${testInfo.project.name}-mobile.png`, fullPage: true });
        }
    });
}

for (const [width, textSize] of [[1280, "200%"], [320, "100%"]]) {
    test(`visual: ${textSize} text and custom spacing at ${width}px preserve content and search`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await page.addStyleTag({ content: `html { font-size: ${textSize} !important; } * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }` });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const input = page.getByRole("searchbox", { name: "Search:" });
        await input.fill("lorem");
        await input.press("Enter");
        await expect(page.locator("#search-status")).toContainText("2 matches found");
        await expectOriginalCopy(page);
    });
}

test("touch targets: existing links, buttons, and search input are at least 44px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");
    const sizes = await page.locator('.site-nav a, .site-footer a, .news a, button, input:not([type="radio"]):not([type="checkbox"]), .mock-choice').evaluateAll(elements => elements.map(element => {
        const { width, height } = element.getBoundingClientRect();
        return { text: element.textContent || element.id, width, height };
    }));
    for (const size of sizes) {
        expect(size.width, size.text).toBeGreaterThanOrEqual(44);
        expect(size.height, size.text).toBeGreaterThanOrEqual(44);
    }
});

test("visual: forced colors, highlighted search, and reduced motion", async ({ page }, testInfo) => {
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
    await page.getByRole("searchbox", { name: "Search:" }).fill("Recap");
    await page.getByRole("button", { name: "Go", exact: true }).click();
    await expect(page.locator("mark")).toHaveCount(1);
    await audit(page, testInfo, "forced-colors");
    await page.screenshot({ path: `accessibility-results/${testInfo.project.name}-forced-colors.png`, fullPage: true });
});

test("progressive enhancement: original content and native navigation remain without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/");
    await expectOriginalCopy(page);
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/#home$/);
    await expect(page.getByRole("heading", { name: "Main content", exact: true })).toBeVisible();
    await context.close();
});

test("static files: original assets, styles, and search work from a file URL", async ({ page }) => {
    const { pathToFileURL } = require("node:url");
    const path = require("node:path");
    await page.goto(pathToFileURL(path.resolve("index.html")).href);
    expect(await page.locator(".content img").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await page.locator("h1").evaluate(heading => parseFloat(getComputedStyle(heading).fontSize))).toBeGreaterThan(30);
    const input = page.getByRole("searchbox", { name: "Search:" });
    await input.fill("lorem");
    await input.press("Enter");
    await expect(page.locator("#search-status")).toContainText("2 matches found");
});

test("semantics: named landmarks, article, heading hierarchy, fieldsets, and input purposes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main", { name: "Main content", exact: true })).toHaveCount(1);
    await expect(page.getByRole("search", { name: "Site search", exact: true })).toHaveCount(1);
    await expect(page.getByRole("form", { name: "Mock application form", exact: true })).toBeVisible();
    await expect(page.getByRole("article", { name: "HackTrent2025 Recap", exact: true })).toHaveCount(1);
    await expect(page.getByRole("group", { name: "Contact details", exact: true })).toBeVisible();
    await expect(page.getByRole("group", { name: "Participation (optional)", exact: true })).toBeVisible();
    expect(await page.getByRole("heading").allTextContents()).toEqual(["HackTrent", "Main content", "Mock application form", "this is the right content", "HackTrent2025 Recap"]);
    await expect(page.locator("#mock-name")).toHaveAttribute("autocomplete", "name");
    await expect(page.locator("#mock-name")).toHaveAttribute("required", "");
    await expect(page.locator("#mock-email")).toHaveAttribute("autocomplete", "email");
    await expect(page.locator("#mock-email")).toHaveAccessibleDescription("For example, alex@example.com.");
    await expect(page.getByRole("radio", { name: "On my own", exact: true })).toHaveAccessibleDescription("Use the arrow keys to move between these options.");
});

test("mock form: Apply Now links to the labeled demonstration and keyboard input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Apply Now", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#apply$/);
    await expect(page.getByRole("region", { name: "Mock application form", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#mock-name")).toBeFocused();
});

test("mock form: errors have focus, linked corrections, invalid states, and descriptions", async ({ page }, testInfo) => {
    await page.goto("/#apply");
    await page.getByRole("button", { name: "Submit mock form", exact: true }).click();
    await expect(page.getByRole("group", { name: "Check the mock form", exact: true })).toBeFocused();
    await expect(page.locator("#mock-errors a")).toHaveCount(3);
    await expect(page.locator("#mock-name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#mock-name")).toHaveAccessibleDescription("Enter a full name for the demo.");
    await expect(page.locator("#mock-acknowledgement")).toHaveAccessibleDescription("Confirm that you understand this is a demonstration.");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Enter a full name for the demo.", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mock-name")).toBeFocused();
    await audit(page, testInfo, "mock-errors");
    await page.screenshot({ path: `accessibility-results/${testInfo.project.name}-mock-errors.png`, fullPage: true });
});

test("mock form: invalid email and whitespace names keep entered values during correction", async ({ page }) => {
    await page.goto("/#apply");
    await page.locator("#mock-name").fill("   ");
    await page.locator("#mock-email").fill("invalid-email");
    await page.locator("#mock-acknowledgement").check();
    await page.getByRole("button", { name: "Submit mock form", exact: true }).click();
    await expect(page.locator("#mock-errors a")).toHaveCount(2);
    await expect(page.locator("#mock-email-error")).toHaveText("Enter an email address like alex@example.com.");
    await page.locator("#mock-name").fill("Alex Demo");
    await expect(page.locator("#mock-errors a")).toHaveCount(1);
    await page.getByRole("link", { name: "Enter an email address like alex@example.com.", exact: true }).click();
    await expect(page.locator("#mock-email")).toBeFocused();
    await page.locator("#mock-email").fill("alex@example.com");
    await expect(page.locator("#mock-name")).toHaveValue("Alex Demo");
    await expect(page.locator("#mock-acknowledgement")).toBeChecked();
    await expect(page.locator("#mock-errors")).toBeHidden();
    await expect(page.locator("#mock-email")).not.toHaveAttribute("aria-invalid", "true");
});

test("mock form: keyboard radio, checkbox, submit, status, and local-only review", async ({ page }, testInfo) => {
    await page.goto("/#apply");
    const requests = [];
    page.on("request", request => requests.push(request.url()));
    await page.locator("#mock-name").focus();
    await page.keyboard.type("Alex Demo");
    await page.keyboard.press("Tab");
    await page.keyboard.type("alex@example.com");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("radio", { name: "On my own", exact: true })).toBeFocused();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "With a team", exact: true })).toBeChecked();
    await page.keyboard.press("Tab");
    await expect(page.locator("#mock-acknowledgement")).toBeFocused();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Submit mock form", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status", { name: "Mock form feedback", exact: true })).toContainText("Mock submission complete. No information was sent or saved.");
    await expect(page.getByRole("button", { name: "Submit mock form", exact: true })).toBeFocused();
    await expect(page.locator("#mock-review-name")).toHaveText("Alex Demo");
    await expect(page.locator("#mock-review-email")).toHaveText("alex@example.com");
    await expect(page.locator("#mock-review-participation")).toHaveText("With a team");
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
    await audit(page, testInfo, "mock-success");
    await page.screenshot({ path: `accessibility-results/${testInfo.project.name}-mock-success.png`, fullPage: true });
});

test("mock form: optional radio selection, stale review removal, and keyboard reset", async ({ page }) => {
    await page.goto("/#apply");
    await page.locator("#mock-name").fill("<img src=x onerror=alert(1)>");
    await page.locator("#mock-email").fill("alex@example.com");
    await page.locator("#mock-acknowledgement").check();
    await page.getByRole("button", { name: "Submit mock form", exact: true }).click();
    await expect(page.locator("#mock-review-name")).toHaveText("<img src=x onerror=alert(1)>");
    await expect(page.locator("#mock-success img")).toHaveCount(0);
    await expect(page.locator("#mock-review-participation")).toHaveText("Not selected");
    await page.locator("#mock-name").fill("Changed demo name");
    await expect(page.locator("#mock-success")).toBeHidden();
    await expect(page.locator("#mock-status")).toBeEmpty();
    await page.getByRole("button", { name: "Clear form", exact: true }).focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#mock-name")).toBeFocused();
    await expect(page.locator("#mock-name")).toBeEmpty();
    await expect(page.locator("#mock-email")).toBeEmpty();
    await expect(page.locator("#mock-acknowledgement")).not.toBeChecked();
    await expect(page.locator("#mock-status")).toHaveText("Mock form cleared.");
    await page.reload();
    await expect(page.locator("#mock-name")).toBeEmpty();
    await expect(page.locator("#mock-name")).not.toBeFocused();
});

test("mock form: user-entered details are excluded from page search", async ({ page }) => {
    await page.goto("/");
    await page.locator("#mock-name").fill("PrivateDemoPhrase");
    await page.locator("#mock-email").fill("private@example.com");
    await page.locator("#mock-acknowledgement").check();
    await page.getByRole("button", { name: "Submit mock form", exact: true }).click();
    await page.getByRole("searchbox", { name: "Search:" }).fill("PrivateDemoPhrase");
    await page.getByRole("button", { name: "Go", exact: true }).click();
    await expect(page.locator("#search-status")).toHaveText("No matches found.");
    await expect(page.locator("#mock-success mark")).toHaveCount(0);
});

test("mock form: at 320px error and success states reflow; forced colors preserve valid contrast", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/#apply");
    await page.getByRole("button", { name: "Submit mock form", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#mock-name").fill("Alex Demo");
    await page.locator("#mock-email").fill("alex@example.com");
    await page.locator("#mock-acknowledgement").check();
    await page.getByRole("button", { name: "Submit mock form", exact: true }).click();
    await expect(page.locator("#mock-success")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await audit(page, testInfo, "mock-forced-colors");
});
