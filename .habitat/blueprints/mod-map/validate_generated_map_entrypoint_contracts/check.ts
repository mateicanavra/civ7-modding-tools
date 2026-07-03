#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = join(repoRoot, "mods/mod-swooper-maps");
const TRANSIENT_STUDIO_CONFIGS = new Set(["studio-current.config.json"]);
const failures: string[] = [];

const { STANDARD_STAGES } = await import(
  pathToFileURL(join(modRoot, "src/recipes/standard/recipe.ts")).href
);
const { deriveRecipeConfigSchema } = await import(
  pathToFileURL(join(repoRoot, "packages/mapgen-core/src/authoring/index.ts")).href
);
const { validateCanonicalMapConfig } = await import(
  pathToFileURL(join(modRoot, "src/maps/configs/canonical.ts")).href
);

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

const configsDir = join(modRoot, "src/maps/configs");
const generatedDir = join(modRoot, "src/maps/generated");
const configIds = readdirSync(configsDir)
  .filter((entry) => entry.endsWith(".config.json"))
  .filter((entry) => !TRANSIENT_STUDIO_CONFIGS.has(entry))
  .map((entry) => entry.replace(/\.config\.json$/, ""))
  .sort();
const generatedIds = readdirSync(generatedDir)
  .filter((entry) => entry.endsWith(".ts"))
  .filter((entry) => !TRANSIENT_STUDIO_CONFIGS.has(entry.replace(/\.ts$/, ".config.json")))
  .map((entry) => entry.replace(/\.ts$/, ""))
  .sort();

if (JSON.stringify(generatedIds) !== JSON.stringify(configIds)) {
  failures.push(
    `generated map ids differ from config ids: ${JSON.stringify(generatedIds)} !== ${JSON.stringify(configIds)}`
  );
}

for (const id of configIds) {
  const rawConfig = JSON.parse(readFileSync(join(configsDir, `${id}.config.json`), "utf8"));
  const mapConfig = validateCanonicalMapConfig({
    fileName: `${id}.config.json`,
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
