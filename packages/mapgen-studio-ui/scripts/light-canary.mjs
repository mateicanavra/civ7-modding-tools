// Forced-.light render canary — the FRAME §2 both-modes fidelity gate.
//
// Compares the reference storybook forced light (?globals=theme:light; the
// preview decorator writes both classes) against the converter preview cards
// forced light (toggling .light on documentElement). One screenshot pair per
// pick plus a programmatic cross-check of the core theme tokens on both
// sides; any token mismatch lands in `drift` (non-empty drift = FAIL).
//
// Run from the package root AFTER a design-sync:check run has produced
// `.design-sync/sb-reference/` and `ds-bundle/` (the two servers below):
//
//   node scripts/light-canary.mjs <outdir>
//
// DS_CHROMIUM_PATH is respected (same convention as the resync driver). The
// durable record of the latest run lives at
// `.design-sync/light-canary-tokens.json` (screenshots are ephemeral —
// re-run to regenerate). First run: 2026-07-02, 7/7 picks zero drift.

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(resolve(".ds-sync/package.json"));
const pw = require("playwright");
const { serveDir } = await import(resolve(".ds-sync/storybook/http-serve.mjs"));
const OUTDIR = process.argv[2];
mkdirSync(OUTDIR, { recursive: true });
const picks = [
  // [name, story id, preview rel, story export label, w, h]
  [
    "Button",
    "primitives-button--variants",
    "components/primitives/Button/Button.html",
    "Variants",
    900,
    400,
  ],
  [
    "Tabs",
    "primitives-tabs--recipe-panel",
    "components/primitives/Tabs/Tabs.html",
    "RecipePanel",
    900,
    400,
  ],
  [
    "ErrorBanner",
    "composites-errorbanner--generation-failed",
    "components/composites/ErrorBanner/ErrorBanner.html",
    "GenerationFailed",
    900,
    400,
  ],
  [
    "AppFooter",
    "composites-appfooter--ready",
    "components/composites/AppFooter/AppFooter.html",
    "Ready",
    1000,
    300,
  ],
  [
    "GameConsole",
    "panels-gameconsole--live-ready",
    "components/panels/GameConsole/GameConsole.html",
    "LiveReady",
    1000,
    300,
  ],
  [
    "WaterStatsSection",
    "composites-waterstatssection--expanded",
    "components/composites/WaterStatsSection/WaterStatsSection.html",
    "Expanded",
    900,
    500,
  ],
  [
    "PipelineStage",
    "panels-pipelinestage--pipeline-graph",
    "components/panels/PipelineStage/PipelineStage.html",
    "PipelineGraph",
    1080,
    620,
  ],
];
const TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--primary",
  "--muted-foreground",
  "--border",
  "--destructive",
];
const SB = resolve(".design-sync/sb-reference");
const OUT = resolve("ds-bundle");
const { srv: s1, port: p1 } = await serveDir(SB);
const { srv: s2, port: p2 } = await serveDir(OUT);
const browser = await pw.chromium.launch(
  process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
await page.emulateMedia({ reducedMotion: "reduce" }).catch(() => {});
const sample = () =>
  page.evaluate((tokens) => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(tokens.map((t) => [t, cs.getPropertyValue(t).trim()]));
  }, TOKENS);
const result = {};
for (const [name, id, rel, label, w, h] of picks) {
  await page.setViewportSize({ width: w, height: h });
  // reference, forced light
  try {
    await page.goto(
      `http://127.0.0.1:${p1}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:light`,
      { waitUntil: "networkidle", timeout: 20000 }
    );
  } catch {}
  await page.waitForTimeout(700);
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  const sbLight = await page.evaluate(() => document.documentElement.className);
  const sbTokens = await sample();
  writeFileSync(
    join(OUTDIR, `${name}__light-sb.png`),
    await page.screenshot({ animations: "disabled" })
  );
  // preview card, forced light
  try {
    await page.goto(`http://127.0.0.1:${p2}/${rel}?story=${encodeURIComponent(label)}`, {
      waitUntil: "networkidle",
      timeout: 20000,
    });
  } catch {}
  await page.evaluate(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  const dsTokens = await sample();
  writeFileSync(
    join(OUTDIR, `${name}__light-ds.png`),
    await page.screenshot({ animations: "disabled" })
  );
  const drift = TOKENS.filter((t) => sbTokens[t] !== dsTokens[t]);
  result[name] = { sbClass: sbLight, sbTokens, dsTokens, drift };
  console.error(
    `${name}: html class="${sbLight}" tokenDrift=${drift.length ? drift.join(",") : "NONE"}`
  );
}
writeFileSync(join(OUTDIR, "light-canary-tokens.json"), JSON.stringify(result, null, 2));
await browser.close();
s1.close();
s2.close();
