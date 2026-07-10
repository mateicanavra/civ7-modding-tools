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

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectDesignSyncObservation,
  collectStorybookObservation,
  evaluateLightCanary,
  finalizeLightCanary,
  writeLightCanaryResultAtomically,
} from "./light-canary-result.mjs";
import { cleanupLightCanaryRuntime, serveLightCanaryDirectory } from "./light-canary-server.mjs";

const require = createRequire(resolve(".ds-sync/package.json"));
const pw = require("playwright");
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
// The core theme tokens sampled on both sides. Named explicitly (a curated,
// token-heavy subset — not every color), then validated against the verified
// authored-token fixture at startup: each MUST be a kind=color entry in
// test/fixtures/authored-tokens.json, which test/designTokens.test.ts keeps in
// lockstep with src/styles/theme.css. So a token renamed or dropped in
// theme.css falls out of the fixture and trips this assertion LOUDLY — instead
// of the canary silently sampling "" on both sides and reporting zero drift (a
// false pass). To retire or rename a sampled token, edit theme.css, the
// fixture, and this list together.
const CORE_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--primary",
  "--muted-foreground",
  "--border",
  "--destructive",
];
const authoredTokens = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../test/fixtures/authored-tokens.json", import.meta.url)),
    "utf8"
  )
).tokens;
const staleTokens = CORE_TOKENS.filter((t) => authoredTokens[t] !== "color");
if (staleTokens.length) {
  throw new Error(
    `light-canary: ${staleTokens.join(", ")} not a kind=color entry in ` +
      "test/fixtures/authored-tokens.json — renamed or removed in src/styles/theme.css? " +
      "Update CORE_TOKENS + the fixture together so the canary samples real tokens."
  );
}
const TOKENS = CORE_TOKENS;
const SB = resolve(".design-sync/sb-reference");
const OUT = resolve("ds-bundle");
const collectionFailures = [];
let s1;
let s2;
let p1;
let p2;
let browser;
let page;
async function cleanupRuntime() {
  await cleanupLightCanaryRuntime({ browser, servers: [s1, s2] });
}

try {
  ({ server: s1, port: p1 } = await serveLightCanaryDirectory(SB));
  ({ server: s2, port: p2 } = await serveLightCanaryDirectory(OUT));
  browser = await pw.chromium.launch(
    process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {}
  );
  page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.emulateMedia({ reducedMotion: "reduce" }).catch(() => {});
} catch (error) {
  collectionFailures.push(error instanceof Error ? error.message : String(error));
}
const navigate = async (url, label) => {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} navigation failed: ${detail}`, { cause: error });
  }
};
// The two sides serialize the SAME sRGB color differently: the reference
// storybook (Vite/Lightning CSS) may minify an authored `oklch()` custom-prop
// value to `#rrggbb`/`rgb(...)`, while the ds-bundle (Tailwind CLI) preserves
// the raw `oklch()` text. A byte compare therefore reports drift on
// numerically-equal colors. Normalize each color to a resolved 8-bit `r,g,b`
// tuple before comparing — hex, rgb(), oklch() (the current authored form), and
// hsl() (the pre-migration form, kept for robustness) all resolve via the same
// CSS Color 4 math; a value that parses as none of those is returned unchanged,
// so non-color tokens keep the original raw-string comparison.
const clamp01 = (c) => Math.min(1, Math.max(0, c));
const to8 = (c) => Math.round(255 * clamp01(c));
const gammaEncode = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
// oklch(L C H) -> "r,g,b" (8-bit sRGB) via CSS Color 4 / Ottosson matrices.
// This checker owns the durable serialization-normalization path exercised by
// `.design-sync/light-canary-tokens.json`; conversion fidelity is recorded in
// the archived `studio-ui-token-oklch` change.
const oklchToRgb8 = (L, C, H) => {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [lr, lg, lb].map((c) => to8(gammaEncode(c))).join(",");
};
const normColor = (v) => {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v);
  if (rgb) return [1, 2, 3].map((i) => Math.round(+rgb[i])).join(",");
  // oklch(L C H): the two builds serialize the SAME color differently —
  // Lightning CSS writes L as a percentage ("oklch(97.347% .00405 286.324)"),
  // Tailwind CLI writes it as a 0..1 number ("oklch(0.97347 0.00405 286.324)").
  // Accept both: a trailing `%` on L (÷100) or C (÷100×0.4, the CSS Color 4
  // chroma reference); H tolerates a `deg` suffix or `none` (→ 0, irrelevant at
  // C=0). Missing leading zero (.00405) is handled by parseFloat.
  const oklch = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([a-z\d.]+)\s*\)$/i.exec(v);
  if (oklch) {
    const L = oklch[1].endsWith("%") ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1]);
    const C = oklch[2].endsWith("%") ? (parseFloat(oklch[2]) / 100) * 0.4 : parseFloat(oklch[2]);
    let H = parseFloat(oklch[3]);
    if (!Number.isFinite(H)) H = 0;
    return oklchToRgb8(L, C, H);
  }
  const hsl = /^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/i.exec(v);
  if (hsl) {
    const H = +hsl[1];
    const L = +hsl[3] / 100;
    const a = (+hsl[2] / 100) * Math.min(L, 1 - L);
    const f = (n) => {
      const k = (n + H / 30) % 12;
      return Math.round(255 * (L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    };
    return [f(0), f(8), f(4)].join(",");
  }
  return v;
};
const result = {};
if (page) {
  try {
    for (const [name, id, rel, label, w, h] of picks) {
      await page.setViewportSize({ width: w, height: h });
      // reference, forced light
      await navigate(
        `http://127.0.0.1:${p1}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:light`,
        `${name} Storybook`
      );
      await page.waitForTimeout(700);
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      const sbObservation = await collectStorybookObservation(page, {
        expectedStoryId: id,
        expectedTokens: TOKENS,
      });
      writeFileSync(
        join(OUTDIR, `${name}__light-sb.png`),
        await page.screenshot({ animations: "disabled" })
      );
      // preview card, forced light
      await navigate(
        `http://127.0.0.1:${p2}/${rel}?story=${encodeURIComponent(label)}`,
        `${name} design-sync preview`
      );
      await page.evaluate(() => {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      const dsObservation = await collectDesignSyncObservation(page, {
        expectedExport: label,
        expectedTokens: TOKENS,
      });
      writeFileSync(
        join(OUTDIR, `${name}__light-ds.png`),
        await page.screenshot({ animations: "disabled" })
      );
      result[name] = {
        storyMarker: sbObservation.storyMarker,
        exportMarker: dsObservation.exportMarker,
        sbClass: sbObservation.sbClass,
        sbTokens: sbObservation.tokens,
        dsTokens: dsObservation.tokens,
      };
    }
  } catch (error) {
    collectionFailures.push(error instanceof Error ? error.message : String(error));
  }
}
const outcome = evaluateLightCanary(result, {
  expectedPicks: picks.map(([name, storyId, , exportName]) => ({
    name,
    storyId,
    exportName,
  })),
  expectedTokens: TOKENS,
  normalize: normColor,
  collectionFailures,
});
await finalizeLightCanary(outcome, cleanupRuntime, {
  persist: async () => {
    writeLightCanaryResultAtomically(join(OUTDIR, "light-canary-tokens.json"), outcome.result);
    for (const [name, value] of Object.entries(outcome.result)) {
      console.error(
        `${name}: story="${value.storyMarker}" export="${value.exportMarker}" ` +
          `html class="${value.sbClass}" tokenDrift=${value.drift.length ? value.drift.join(",") : "NONE"}`
      );
    }
  },
});
