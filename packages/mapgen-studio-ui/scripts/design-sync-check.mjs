#!/usr/bin/env node
// design-sync:check — the CI-runnable local half of the design-sync ritual
// (FRAME §2 DoD: "the sync is CI-runnable from the package build").
//
// What it does, in order (cwd = the package root, wherever it was invoked):
//   1. ensures the vendored converter's deps are installed (npm ci from the
//      committed .ds-sync/package-lock.json — one-time per clone),
//   2. rebuilds the reference Storybook into .design-sync/sb-reference
//      (the buildCmd/reference PAIRING rule: a stale reference makes the
//      compare grade against the OLD design — [REFERENCE_STALE?]),
//   3. runs the resync driver (.ds-sync/resync.mjs): converter build → remote
//      diff → validate (chromium render check) → scoped capture, and exits
//      with the driver's own verdict code.
//
// The PACKAGE build itself (config.json's declarative `buildCmd`,
// `bunx nx run mapgen-studio-ui:build`) is NOT re-run here — it is the Nx
// target's `dependsOn: ["build"]` edge, so `bunx nx run
// mapgen-studio-ui:design-sync:check` always builds dist first ("one command
// truth per task": this script never duplicates the build command).
//
// Anchor: uses .design-sync/.cache/remote-sync.json when present (fetch it
// via DesignSync get_file "_ds_sync.json" for an anchored diff); without it
// the driver reports full first-sync scope — still a valid mechanical check.
//
// Verdict semantics (resync.mjs): exit 0 = every mechanical stage green
// (pendingGrade is the agent's job, not a failure). A factual capture
// failure — including the four portal dialogs' known reference-capture limit
// on a run where their sourceKeys moved — exits non-zero until they are
// graded via the recorded manual path; steady-state (sources unchanged,
// grades carried) runs green end to end.
//
// Chromium: DS_CHROMIUM_PATH is respected; on macOS, Google Chrome is
// auto-detected as a fallback (the Homebrew `chromium` wrapper is stale —
// NOTES.md). Without a browser the validate stage fails loudly.
//
// Both-modes gate (FRAME §2): this check renders dark (the storybook
// default). The forced-.light leg is scripts/light-canary.mjs — run it from
// the package root after this check has produced sb-reference + ds-bundle;
// its durable record lives at .design-sync/light-canary-tokens.json.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, opts = {}) => {
  console.error(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: PKG, stdio: "inherit", ...opts });
  return r.status ?? 1;
};

// 0. Preflight: dist must exist (the Nx dependsOn edge builds it; a direct
// `bun run design-sync:check` without a build gets a named fix, not a
// confusing converter error).
if (!existsSync(join(PKG, "dist", "index.js"))) {
  console.error(
    "✗ dist/index.js missing — run the package build first: bunx nx run mapgen-studio-ui:design-sync:check (the Nx edge builds it) or bunx nx run mapgen-studio-ui:build"
  );
  process.exit(1);
}

// 1. Converter deps (committed lockfile; playwright JS only, no browser download).
if (!existsSync(join(PKG, ".ds-sync", "node_modules"))) {
  const code = run("npm", ["ci", "--prefix", ".ds-sync"], {
    env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1" },
  });
  if (code !== 0) process.exit(code);
}

// 2. Reference Storybook — always rebuilt, paired with the (already-run) buildCmd.
{
  const sb = join(PKG, "node_modules", ".bin", "storybook");
  const code = run(sb, ["build", "-c", ".storybook", "-o", ".design-sync/sb-reference"]);
  if (code !== 0) process.exit(code);
  if (!existsSync(join(PKG, ".design-sync", "sb-reference", "iframe.html"))) {
    console.error("✗ .design-sync/sb-reference/iframe.html missing after the storybook build");
    process.exit(1);
  }
}

// 3. Chromium for the render check.
const env = { ...process.env };
if (!env.DS_CHROMIUM_PATH) {
  const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(macChrome)) env.DS_CHROMIUM_PATH = macChrome;
}

// 4. The driver. --remote only when an anchor has been fetched.
const args = [
  ".ds-sync/resync.mjs",
  "--config",
  ".design-sync/config.json",
  "--node-modules",
  "./node_modules",
  "--entry",
  "dist/index.js",
  "--out",
  "./ds-bundle",
];
const anchor = join(PKG, ".design-sync", ".cache", "remote-sync.json");
if (existsSync(anchor)) args.push("--remote", anchor);
else
  console.error(
    "(no .design-sync/.cache/remote-sync.json — running unanchored: full first-sync scope)"
  );
process.exit(run("node", args, { env }));
