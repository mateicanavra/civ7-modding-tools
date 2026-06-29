#!/usr/bin/env node
/**
 * lint:react-compiler — run the OFFICIAL React Compiler / Rules-of-React lint
 * rules (eslint-plugin-react-hooks v7) that Biome currently has no equivalent
 * for, on demand and ENTIRELY IN MEMORY.
 *
 * Why a script and not a standing ESLint config: Biome is this repo's single
 * standing linter; ESLint is quarantined to @nx/enforce-module-boundaries
 * (one-owner-per-layer). This command runs the React Compiler rules via the
 * ESLint Node API with `overrideConfigFile: true` + an inline config, so it adds
 * NO discoverable eslint.config to the tree and is intentionally NOT wired into
 * any CI/nx target. It is an opt-in developer convenience, advisory by default.
 *
 * rules-of-hooks + exhaustive-deps are intentionally dropped — Biome owns those
 * (correctness.useHookAtTopLevel / correctness.useExhaustiveDependencies). What
 * remains is the compiler-grade family Biome cannot express: purity,
 * set-state-in-render, ref stability, manual-memoization preservation,
 * immutability, static components, etc.
 *
 * Remove once Biome ships React Compiler rule support (biomejs/biome#10710).
 *
 * Usage (from anywhere):
 *   node .habitat/civ7/mapgen/studio/_blueprints/worker-bundle/ensure_studio_worker_bundle_is_browser_safe/lint-react-compiler.mjs            # lint studio src
 *   node .habitat/civ7/mapgen/studio/_blueprints/worker-bundle/ensure_studio_worker_bundle_is_browser_safe/lint-react-compiler.mjs <paths...> # lint specific paths
 *   node .habitat/civ7/mapgen/studio/_blueprints/worker-bundle/ensure_studio_worker_bundle_is_browser_safe/lint-react-compiler.mjs --strict   # exit 1 on errors
 */
import path from "node:path";
import process from "node:process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import reactHooks from "eslint-plugin-react-hooks";

// Resolve from this Habitat-owned location back to the repo root so the default
// target + cwd are invariant to where the command is invoked from.
function findRepoRoot(startDir) {
  let current = startDir;
  while (true) {
    if (existsSync(path.join(current, "apps/mapgen-studio/package.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Could not find repo root from ${startDir}`);
    }
    current = parent;
  }
}

const repoRoot = findRepoRoot(path.dirname(fileURLToPath(import.meta.url)));
const studioRoot = path.join(repoRoot, "apps/mapgen-studio");

const preset = reactHooks.configs?.["recommended-latest"] ?? reactHooks.configs?.recommended;
const presetConfig = Array.isArray(preset) ? preset.at(-1) : preset;
const rules = { ...(presetConfig?.rules ?? {}) };
// Biome already owns these two — don't double-report.
delete rules["react-hooks/rules-of-hooks"];
delete rules["react-hooks/exhaustive-deps"];

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const fileArgs = args.filter((arg) => !arg.startsWith("--"));
const targets = fileArgs.length > 0 ? fileArgs : ["src/**/*.{ts,tsx}"];

const eslint = new ESLint({
  cwd: studioRoot,
  errorOnUnmatchedPattern: false,
  overrideConfigFile: true, // ignore any eslint.config in the tree — fully in-memory
  overrideConfig: [
    {
      files: ["**/*.{ts,tsx}"],
      plugins: { "react-hooks": reactHooks },
      languageOptions: {
        parser: tsParser,
        parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
      },
      rules,
    },
  ],
});

const results = await eslint.lintFiles(targets);
const formatter = await eslint.loadFormatter("stylish");
const output = await formatter.format(results);
if (output.trim()) console.log(output);

const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);
console.log(
  `react-compiler lint (official rules Biome lacks): ${errorCount} error(s), ${warningCount} warning(s) across ${results.length} file(s).`
);

// Advisory by default so it can be run freely without blocking; --strict fails.
if (strict && errorCount > 0) process.exitCode = 1;
