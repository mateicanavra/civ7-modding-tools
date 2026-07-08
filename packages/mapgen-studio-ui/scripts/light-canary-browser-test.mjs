import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectDesignSyncObservation,
  collectStorybookObservation,
} from "./light-canary-result.mjs";
import { cleanupLightCanaryRuntime, serveLightCanaryDirectory } from "./light-canary-server.mjs";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const storybookRoot = join(packageRoot, ".design-sync", "sb-reference");
const bundleRoot = join(packageRoot, "ds-bundle");
const buttonPreview = "components/primitives/Button/Button.html";
const storyId = "primitives-button--variants";
const exportName = "Variants";
const expectedTokens = ["--background"];

for (const file of [join(storybookRoot, "iframe.html"), join(bundleRoot, buttonPreview)]) {
  if (!existsSync(file)) {
    throw new Error(
      `light-canary browser test requires generated fixture ${file}; ` +
        "run nx run mapgen-studio-ui:design-sync:check first"
    );
  }
}

const require = createRequire(resolve(packageRoot, ".ds-sync", "package.json"));
const { chromium } = require("playwright");
let storybook;
let designSync;
let browser;
let page;

async function cleanupRuntime() {
  await cleanupLightCanaryRuntime({
    browser,
    servers: [storybook?.server, designSync?.server],
  });
}

async function gotoStorybook() {
  await page.goto(
    `http://127.0.0.1:${storybook.port}/iframe.html?id=${storyId}&viewMode=story&globals=theme:light`,
    { waitUntil: "networkidle", timeout: 20_000 }
  );
  await page.locator("#storybook-root > *").first().waitFor({ state: "attached", timeout: 10_000 });
}

async function gotoDesignSync(story = exportName) {
  await page.goto(
    `http://127.0.0.1:${designSync.port}/${buttonPreview}?story=${encodeURIComponent(story)}`,
    { waitUntil: "networkidle", timeout: 20_000 }
  );
  if (story === exportName) {
    await page.locator("#r0 > *").first().waitFor({ state: "attached", timeout: 10_000 });
  }
}

async function appendDuplicateRoot(id) {
  await page.evaluate((rootId) => {
    const duplicate = document.createElement("div");
    duplicate.id = rootId;
    document.body.append(duplicate);
  }, id);
}

let primaryFailure;
try {
  storybook = await serveLightCanaryDirectory(storybookRoot);
  designSync = await serveLightCanaryDirectory(bundleRoot);
  browser = await chromium.launch(
    process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {}
  );
  page = await browser.newPage({ viewport: { width: 900, height: 700 } });

  await gotoStorybook();
  await assert.doesNotReject(() =>
    collectStorybookObservation(page, { expectedStoryId: storyId, expectedTokens })
  );

  await gotoDesignSync("Missing");
  await assert.rejects(
    () => collectDesignSyncObservation(page, { expectedExport: "Missing", expectedTokens }),
    /requested runtime selection did not complete \(available: .+\)/
  );

  await gotoDesignSync("variants");
  await page.locator("#r0 > *").first().waitFor({ state: "attached", timeout: 10_000 });
  await assert.rejects(
    () => collectDesignSyncObservation(page, { expectedExport: exportName, expectedTokens }),
    /requested runtime selection did not complete \(available: .+\)/
  );

  await gotoDesignSync();
  await page.locator("#r0").evaluate((root) => root.replaceChildren());
  await assert.rejects(
    () => collectDesignSyncObservation(page, { expectedExport: exportName, expectedTokens }),
    /render root "#r0" is empty/
  );

  await gotoDesignSync();
  await page.locator("#r0").evaluate((root) => root.remove());
  await assert.rejects(
    () => collectDesignSyncObservation(page, { expectedExport: exportName, expectedTokens }),
    /render root "#r0" is absent/
  );

  await gotoStorybook();
  await page.locator("#storybook-root").evaluate((root) => {
    root.style.visibility = "hidden";
  });
  await assert.rejects(
    () => collectStorybookObservation(page, { expectedStoryId: storyId, expectedTokens }),
    /render root "#storybook-root" is hidden/
  );

  await gotoDesignSync();
  await page.locator("#r0").evaluate((root) => {
    root.style.cssText = "width: 0; height: 0; overflow: hidden";
  });
  await assert.rejects(
    () => collectDesignSyncObservation(page, { expectedExport: exportName, expectedTokens }),
    /has zero rendered geometry/
  );

  await gotoStorybook();
  await appendDuplicateRoot("storybook-root");
  await assert.rejects(
    () => collectStorybookObservation(page, { expectedStoryId: storyId, expectedTokens }),
    /render root "#storybook-root" matched 2 elements instead of one root/
  );

  await gotoDesignSync();
  await appendDuplicateRoot("r0");
  await assert.rejects(
    () => collectDesignSyncObservation(page, { expectedExport: exportName, expectedTokens }),
    /render root "#r0" matched 2 elements instead of one root/
  );
} catch (error) {
  primaryFailure = error;
}

let cleanupFailure;
try {
  await cleanupRuntime();
} catch (error) {
  cleanupFailure = error;
}
if (primaryFailure && cleanupFailure) {
  throw new AggregateError(
    [primaryFailure, cleanupFailure],
    "light-canary browser run and cleanup both failed"
  );
}
if (primaryFailure) throw primaryFailure;
if (cleanupFailure) throw cleanupFailure;
console.log(
  "light-canary browser collector contract: PASS " +
    "(missing/case-mismatched export, empty/absent/duplicate root, hidden root, zero geometry)"
);
