#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CatalogSourceIndex } from "../../../../mods/mod-swooper-maps/src/maps/catalog/sourceIndex";
import {
  catalogConfigFileNameFromPath,
  parseCatalogSourceIndex,
} from "../../../../mods/mod-swooper-maps/src/maps/catalog/sources";
import { validateCanonicalMapConfig } from "../../../../mods/mod-swooper-maps/src/maps/configs/canonical";
import { STANDARD_STAGES } from "../../../../mods/mod-swooper-maps/src/recipes/standard/recipe";
import { deriveRecipeConfigSchema } from "../../../../packages/mapgen-core/src/authoring/index";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = join(repoRoot, "mods/mod-swooper-maps");
const failures: string[] = [];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function configHashFor(config: { config: unknown }): string {
  return stableHash(config.config);
}

function envelopeHashFor(
  config: {
    id: string;
    recipe: string;
    latitudeBounds?: unknown;
  },
  configHash: string
): string {
  return stableHash({
    id: config.id,
    recipe: config.recipe,
    latitudeBounds: config.latitudeBounds ?? null,
    configHash,
  });
}

function createMapConfigExpression(source: string): string | null {
  return source.match(/\n\s+config:\s*([^,\n]+),?\n\}\);/)?.[1]?.trim() ?? null;
}

const generatedDir = join(modRoot, "src/maps/generated");
const catalogEntries = [...parseCatalogSourceIndex(CatalogSourceIndex).entries];
const configIds = catalogEntries
  .map((entry) => catalogConfigFileNameFromPath(entry.configPath).replace(/\.config\.json$/, ""))
  .sort();
const generatedIds = readdirSync(generatedDir)
  .filter((entry) => entry.endsWith(".ts"))
  .map((entry) => entry.replace(/\.ts$/, ""))
  .sort();

if (JSON.stringify(generatedIds) !== JSON.stringify(configIds)) {
  failures.push(
    `generated map ids differ from catalog source ids: ${JSON.stringify(generatedIds)} !== ${JSON.stringify(configIds)}`
  );
}

for (const entry of catalogEntries) {
  const fileName = catalogConfigFileNameFromPath(entry.configPath);
  const id = fileName.replace(/\.config\.json$/, "");
  const rawConfig = JSON.parse(readFileSync(join(repoRoot, entry.configPath), "utf8"));
  const mapConfig = validateCanonicalMapConfig({
    fileName,
    raw: rawConfig,
    recipeSchema: deriveRecipeConfigSchema(STANDARD_STAGES),
    stages: STANDARD_STAGES,
  });
  const expectedConfigHash = configHashFor(mapConfig);
  const expectedEnvelopeHash = envelopeHashFor(mapConfig, expectedConfigHash);
  const source = readFileSync(join(generatedDir, `${id}.ts`), "utf8");
  const checks: Array<[boolean, string]> = [
    [source.includes(`../configs/${id}.config.json`), "imports canonical source config"],
    [
      source.includes("canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)"),
      "uses canonical public config envelope",
    ],
    [source.includes(`sourceConfigId: ${JSON.stringify(id)}`), "records sourceConfigId"],
    [source.includes(`configHash: ${JSON.stringify(expectedConfigHash)}`), "records configHash"],
    [
      source.includes(`envelopeHash: ${JSON.stringify(expectedEnvelopeHash)}`),
      "records envelopeHash",
    ],
    [
      createMapConfigExpression(source) ===
        "canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)",
      "createMap config property uses canonical public config envelope",
    ],
    [
      [...source.matchAll(/(?:^|[,{]\s*)config\s*:/gm)].length === 1,
      "has exactly one SDK createMap config property",
    ],
    [!source.includes("derive-placement-inputs"), "does not inline placement envelopes"],
    [!source.includes('"strategy"'), "does not inline raw strategy keys"],
    [!source.includes('"config"'), "does not inline raw config keys"],
    [!/(?:^|[,{]\s*)strategy\s*:/m.test(source), "does not inline strategy properties"],
  ];
  for (const [ok, message] of checks) {
    if (!ok) failures.push(`${id}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
