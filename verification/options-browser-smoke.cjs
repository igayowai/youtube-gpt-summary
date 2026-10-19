const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// Pass an already available Playwright module path. No downloads, real profile or extension storage.
async function main() {
  const { chromium } = require(process.argv[2] || "playwright");
  const browser = await chromium.launch({ headless: true, channel: process.argv[3] || undefined });
  try {
    const context = await browser.newContext();
    await context.route(/^https?:/, route => route.abort());
    const data = { chatgptModel: "pro-extended", chatgptModelFamily: "gpt-5.5" };
    await context.exposeBinding("fixtureStorageGet", (_, keys) => {
      const result = {};
      for (const key of keys) if (Object.hasOwn(data, key)) result[key] = data[key];
      return result;
    });
    await context.exposeBinding("fixtureStorageSet", (_, values) => { Object.assign(data, values); });
    await context.addInitScript(() => {
      globalThis.chrome = { storage: { local: { get: globalThis.fixtureStorageGet, set: globalThis.fixtureStorageSet } } };
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, "../src/options/options.html")).href;
    await page.goto(url);
    await page.locator("#chatgptReasoningEffort option").first().waitFor({ state: "attached" });
    assert.equal(await page.locator("#chatgptModelFamily").count(), 0);
    assert.equal(await page.locator("#chatgptReasoningEffort").inputValue(), "pro");
    assert.equal(await page.locator("#chatgptReasoningEffort option").count(), 6);
    await page.locator("#chatgptReasoningEffort").selectOption("extra-high");
    await page.locator("#saveButton").click();
    await page.getByText("Saved.", { exact: true }).waitFor();
    await page.reload();
    await page.locator("#chatgptReasoningEffort option").first().waitFor({ state: "attached" });
    assert.equal(await page.locator("#chatgptModelFamily").count(), 0);
    assert.equal(data.chatgptModelFamily, "gpt-5.5");
    assert.equal(await page.locator("#chatgptReasoningEffort").inputValue(), "extra-high");
    assert.equal(data.chatgptModel, "pro-extended");
    const output = path.resolve(__dirname, "../output/playwright");
    fs.mkdirSync(output, { recursive: true });
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 960 });
      const bounds = await page.locator("#chatgptReasoningEffort, #geminiModel").evaluateAll(elements => elements.map(el => {
        const box = el.getBoundingClientRect();
        const label = document.querySelector(`label[for='${el.id}']`).getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, labelBottom: label.bottom };
      }));
      assert.equal(bounds.length, 2);
      for (const box of bounds) {
        assert.ok(box.left >= 0 && box.right <= width);
        assert.ok(box.labelBottom <= box.top);
      }
      assert.ok(bounds[0].bottom < bounds[1].top);
      await page.screenshot({ path: path.join(output, `options-latest-only-${width}.png`), fullPage: true });
    }
    assert.deepEqual(errors, []);
    console.log("PASS: isolated Options save/reopen, legacy preservation, desktop/mobile bounds, no page errors. Not a loaded-extension or ChatGPT live test.");
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
