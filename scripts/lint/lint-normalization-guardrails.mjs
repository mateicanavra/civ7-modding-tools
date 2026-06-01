#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Normalization guardrails for the completed architecture-cleanup slices.
 *
 * These checks intentionally encode categories from the normalization packet
 * instead of one isolated file path. They are limited to structure that this
 * stack has already made true; target architecture that still needs future
 * product work should stay in OpenSpec/docs, not in red CI.
 */

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const args = new Set(process.argv.slice(2));
const failures = [];

function repoPath(...parts) {
  return path.join(repoRoot, ...parts);
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function walkFiles(rootDir, predicate = () => true) {
  if (!existsSync(rootDir)) return [];
  const out = [];
  const entries = readdirSync(rootDir);
  for (const entry of entries) {
    const full = path.join(rootDir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkFiles(full, predicate));
      continue;
    }
    if (predicate(full)) out.push(full);
  }
  return out;
}

function addFailure(label, details) {
  failures.push({ label, details: Array.isArray(details) ? details : [details] });
}

function checkNoRegex({ id, label, roots, pattern, include, exclude = () => false }) {
  const hits = [];
  for (const root of roots) {
    for (const file of walkFiles(root, (candidate) => include(candidate) && !exclude(candidate))) {
      const text = readText(file);
      const match = text.match(pattern);
      if (match) hits.push(`${toRepoRelative(file)}: ${match[0]}`);
    }
  }
  if (hits.length > 0) addFailure(`${id}: ${label}`, hits);
}

function extractRecipeStages(recipeText) {
  const imports = new Map();
  for (const match of recipeText.matchAll(
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+"\.\/stages\/([^"]+)\/index\.js";/g
  )) {
    imports.set(match[1], match[2]);
  }

  const stagesMatch = recipeText.match(/const\s+stages\s*=\s*\[([\s\S]*?)\]\s+as\s+const;/);
  if (!stagesMatch) {
    throw new Error("Could not locate standard recipe stages array.");
  }

  return stagesMatch[1]
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const stage = imports.get(token);
      if (!stage) throw new Error(`Could not resolve recipe stage variable '${token}'.`);
      return stage;
    });
}

function extractDocStages(docText) {
  const section = docText.match(/## Stage order \(current\)([\s\S]*?)(?:\n## |\n# |$)/)?.[1] ?? "";
  return [...section.matchAll(/^\d+\.\s+`([^`]+)`/gm)].map((match) => match[1]);
}

function importSpecifiers(fileText) {
  return [...fileText.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
}

function stageNameForFile(filePath) {
  const normalized = toRepoRelative(filePath);
  return normalized.match(/src\/recipes\/standard\/stages\/([^/]+)\//)?.[1] ?? null;
}

function resolveImport(importer, specifier) {
  if (!specifier.startsWith(".")) return null;
  const resolved = path.resolve(path.dirname(importer), specifier);
  if (path.extname(resolved)) return resolved;
  return `${resolved}.ts`;
}

function checkSiblingStageStepImports() {
  const stageRoot = repoPath("mods/mod-swooper-maps/src/recipes/standard/stages");
  const hits = [];
  for (const file of walkFiles(stageRoot, (candidate) => candidate.endsWith(".ts"))) {
    const importerStage = stageNameForFile(file);
    if (!importerStage) continue;
    for (const specifier of importSpecifiers(readText(file))) {
      const resolved = resolveImport(file, specifier);
      if (!resolved) continue;
      const normalized = toRepoRelative(resolved);
      const importedStage = normalized.match(
        /src\/recipes\/standard\/stages\/([^/]+)\/steps\//
      )?.[1];
      if (importedStage && importedStage !== importerStage) {
        hits.push(`${toRepoRelative(file)} imports sibling stage steps via '${specifier}'`);
      }
    }
  }
  if (hits.length > 0) addFailure("G5: sibling stage step imports", hits);
}

function checkStandardRecipeDocs() {
  const recipeStages = extractRecipeStages(
    readText(repoPath("mods/mod-swooper-maps/src/recipes/standard/recipe.ts"))
  );
  const docStages = extractDocStages(
    readText(repoPath("docs/system/libs/mapgen/reference/STANDARD-RECIPE.md"))
  );
  if (recipeStages.join("\n") !== docStages.join("\n")) {
    addFailure("G6: standard recipe docs stage order", [
      `recipe: ${recipeStages.join(", ")}`,
      `docs:   ${docStages.join(", ")}`,
    ]);
  }
}

function checkPlacementOutcomeContract() {
  const contractText = readText(
    repoPath(
      "mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/contract.ts"
    )
  );
  const applyText = readText(
    repoPath("mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts")
  );
  const missing = [];
  for (const token of ["resourcePlacementOutcomes", "discoveryPlacementOutcomes"]) {
    if (!contractText.includes(token))
      missing.push(`placement contract does not reference ${token}`);
  }
  for (const token of ["generateOfficialResources(", "generateOfficialDiscoveries("]) {
    if (applyText.includes(token)) missing.push(`placement apply still calls ${token}`);
  }
  if (missing.length > 0) addFailure("G8: placement typed outcome boundary", missing);
}

function runSelfTest() {
  const recipe = `
import one from "./stages/one/index.js";
import two from "./stages/two/index.js";
const stages = [one, two] as const;
`;
  const docs = `
## Stage order (current)
1. \`one\`
2. \`two\`
`;
  if (extractRecipeStages(recipe).join(",") !== "one,two") {
    throw new Error("self-test failed: recipe stage extraction");
  }
  if (extractDocStages(docs).join(",") !== "one,two") {
    throw new Error("self-test failed: doc stage extraction");
  }
  const importHits = importSpecifiers(`import x from "../other/steps/foo.js";`);
  if (importHits[0] !== "../other/steps/foo.js") {
    throw new Error("self-test failed: import specifier extraction");
  }
  console.log("normalization guardrail self-test passed");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

checkNoRegex({
  id: "G1",
  label: "milestone-prefixed recipe identifiers",
  roots: [repoPath("mods/mod-swooper-maps/src/recipes/standard")],
  pattern: /\bM\d+_[A-Z0-9_]+\b/,
  include: (file) => file.endsWith(".ts"),
});

checkNoRegex({
  id: "G2",
  label: "domain-root tag/artifact catalogs",
  roots: [repoPath("mods/mod-swooper-maps/src/domain")],
  pattern: /./,
  include: (file) => /\/(tags|artifacts)\.ts$/.test(file.split(path.sep).join("/")),
});

checkNoRegex({
  id: "G3",
  label: "Civ7 value imports or runtime engine globals in mapgen-core runtime source",
  roots: [repoPath("packages/mapgen-core/src/core"), repoPath("packages/mapgen-core/src/engine")],
  pattern:
    /import\s+(?!type\b)[\s\S]*?from\s+["']@civ7\/adapter["']|\/base-standard\/|(?<![A-Za-z0-9_])(GameplayMap|TerrainBuilder|ResourceBuilder|FeatureBuilder|AreaBuilder|MapConstructibles|GameInfo)\s*\./,
  include: (file) => file.endsWith(".ts"),
});

checkSiblingStageStepImports();
checkStandardRecipeDocs();

checkNoRegex({
  id: "G7",
  label: "superseded stage ids in evergreen docs",
  roots: [repoPath("docs/system")],
  pattern:
    /\b(hydrology-pre|hydrology-core|hydrology-post|ecology-features-score|ecology-ice|ecology-reefs|ecology-wetlands|ecology-vegetation)\b/,
  include: (file) => file.endsWith(".md"),
  exclude: (file) => toRepoRelative(file).includes("/_archive/"),
});

checkPlacementOutcomeContract();

checkNoRegex({
  id: "G9",
  label: "wrapper-only advanced stage config surfaces",
  roots: [
    repoPath("mods/mod-swooper-maps/src/recipes/standard"),
    repoPath("mods/mod-swooper-maps/src/maps"),
  ],
  pattern: /(?<![A-Za-z0-9_])["']?advanced["']?\s*:/,
  include: (file) => file.endsWith(".ts") || file.endsWith(".json"),
});

if (failures.length > 0) {
  console.error("Normalization guardrails failed:");
  for (const failure of failures) {
    console.error(`\n${failure.label}`);
    for (const detail of failure.details) console.error(`  ${detail}`);
  }
  process.exit(1);
}

console.log("Normalization guardrails passed.");
