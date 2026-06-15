import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  deriveRecipeConfigSchema,
  deriveStageAuthoringModel,
} from "@swooper/mapgen-core/authoring";
import {
  type ValidatedMapConfig,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical.js";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

const TRANSIENT_STUDIO_CONFIGS = new Set(["studio-current.config.json"]);

const STANDARD_PUBLIC_KEYS: Record<string, readonly string[]> = {
  foundation: [
    "knobs",
    "meshResolution",
    "mantleSources",
    "mantleForcing",
    "lithosphere",
    "platePartition",
    "plateMotion",
    "tectonicSegmentation",
    "tectonicEras",
    "tectonicFields",
    "tectonicRollups",
  ],
  "morphology-coasts": [
    "knobs",
    "substrate",
    "relief",
    "waterCoverage",
    "continents",
    "coastlineShape",
    "shelf",
  ],
  "morphology-routing": ["knobs"],
  "morphology-erosion": ["knobs", "geomorphicCycle"],
  "morphology-features": ["knobs", "islandChains", "mountainRanges", "volcanoes"],
  "hydrology-climate-baseline": [
    "knobs",
    "seasonalCycle",
    "solarForcing",
    "thermalState",
    "atmosphericCirculation",
    "oceanCurrents",
    "oceanGeometry",
    "oceanThermalState",
    "evaporation",
    "moistureTransport",
    "precipitation",
  ],
  "hydrology-hydrography": ["knobs", "drainageRouting", "runoff", "riverNetwork", "lakes"],
  "hydrology-climate-refine": [
    "knobs",
    "precipitationRefinement",
    "solarForcing",
    "thermalState",
    "albedoFeedback",
    "cryosphereState",
    "landWaterBudget",
    "diagnostics",
  ],
  "ecology-pedology": [
    "knobs",
    "soilClassification",
    "resourceBasinPlanning",
    "resourceBasinScoring",
  ],
  "ecology-biomes": ["knobs", "biomeClassification"],
  "map-morphology": ["knobs"],
  "map-hydrology": ["knobs"],
  "map-elevation": ["knobs"],
  "map-rivers": ["knobs"],
  "ecology-features": [
    "knobs",
    "substrateScoring",
    "wetlandScoring",
    "reefScoring",
    "iceScoring",
    "icePlanning",
    "reefPlanning",
    "wetlandPlanning",
    "floodplainPlanning",
    "vegetationPlanning",
    "plotEffectScoring",
    "plotEffectCoverage",
  ],
  "map-ecology": ["knobs", "biomeBindings"],
  placement: ["knobs", "naturalWonders", "discoveries", "resources", "starts", "support"],
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function schemaProperties(schema: unknown): Record<string, unknown> {
  return isObject(schema) && isObject(schema.properties) ? schema.properties : {};
}

function getAtSchemaPath(schema: unknown, path: readonly string[]): unknown {
  let current = schema;
  for (const segment of path) {
    const props = schemaProperties(current);
    if (!Object.prototype.hasOwnProperty.call(props, segment)) {
      throw new Error(`Schema missing path ${path.join(".")}`);
    }
    current = props[segment];
  }
  return current;
}

function collectRawEnvelopePaths(value: unknown, path: string[] = []): string[] {
  if (!isObject(value)) {
    if (Array.isArray(value)) {
      return value.flatMap((item, index) =>
        collectRawEnvelopePaths(item, [...path, String(index)])
      );
    }
    return [];
  }

  const paths: string[] = [];
  if (
    Object.prototype.hasOwnProperty.call(value, "strategy") &&
    Object.prototype.hasOwnProperty.call(value, "config")
  ) {
    paths.push(path.join("."));
  }

  for (const [key, child] of Object.entries(value)) {
    paths.push(...collectRawEnvelopePaths(child, [...path, key]));
  }
  return paths;
}

function collectOpenObjectSchemaPaths(value: unknown, path: string[] = []): string[] {
  if (!isObject(value)) {
    if (Array.isArray(value)) {
      return value.flatMap((item, index) =>
        collectOpenObjectSchemaPaths(item, [...path, String(index)])
      );
    }
    return [];
  }

  const paths: string[] = [];
  const isObjectSchema = value.type === "object" || isObject(value.properties);
  if (isObjectSchema && value.additionalProperties !== false) {
    paths.push(path.join(".") || "<root>");
  }

  for (const [key, child] of Object.entries(value)) {
    paths.push(...collectOpenObjectSchemaPaths(child, [...path, key]));
  }
  return paths;
}

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

function configHashFor(config: ValidatedMapConfig): string {
  return stableHash(config.config);
}

function envelopeHashFor(config: ValidatedMapConfig, configHash: string): string {
  return stableHash({
    id: config.id,
    recipe: config.recipe,
    latitudeBounds: config.latitudeBounds ?? null,
    configHash,
  });
}

function createMapConfigExpression(source: string, id: string): string {
  const match = source.match(/\n\s+config:\s*([^,\n]+),?\n\}\);/);
  if (!match?.[1]) {
    throw new Error(`${id} generated map is missing a terminal createMap config property`);
  }
  return match[1].trim();
}

describe("standard authoring surface guardrails", () => {
  it("keeps every standard source stage on an explicit semantic public authoring surface", () => {
    expect(STANDARD_STAGES.map((stage) => stage.id)).toEqual(Object.keys(STANDARD_PUBLIC_KEYS));

    for (const stage of STANDARD_STAGES) {
      const expectedKeys = STANDARD_PUBLIC_KEYS[stage.id];
      expect(expectedKeys, `${stage.id} expected public keys`).toBeDefined();

      const authoring = deriveStageAuthoringModel(stage);
      expect(authoring.config.layer, `${stage.id} layer`).toBe("semantic-public-config");
      expect(
        (authoring.config.schema as any).additionalProperties,
        `${stage.id} strict schema`
      ).toBe(false);
      expect(
        Object.keys(schemaProperties(authoring.config.schema)).sort(),
        `${stage.id} public keys`
      ).toEqual([...expectedKeys].sort());
      expect(
        collectOpenObjectSchemaPaths(authoring.config.schema),
        `${stage.id} public object strictness`
      ).toEqual([]);
      expect(
        collectRawEnvelopePaths(authoring.config.schema),
        `${stage.id} public schema raw envelopes`
      ).toEqual([]);

      for (const step of authoring.runtime.steps) {
        const focusPath = authoring.config.focusPathsByStepId[step.stepId] ?? [];
        expect(focusPath, `${stage.id}.${step.stepId} focus path`).not.toContain("strategy");
        expect(focusPath, `${stage.id}.${step.stepId} focus path`).not.toContain("config");
        if (focusPath.length > 0) {
          getAtSchemaPath(authoring.config.schema, focusPath);
        }
      }
    }
  });

  it("keeps generated SDK map entrypoints on canonical public config envelopes", () => {
    const configsDir = join(import.meta.dir, "../../src/maps/configs");
    const generatedDir = join(import.meta.dir, "../../src/maps/generated");
    const configIds = readdirSync(configsDir)
      .filter((entry) => entry.endsWith(".config.json"))
      .filter((entry) => !TRANSIENT_STUDIO_CONFIGS.has(entry))
      .map((entry) => entry.replace(/\.config\.json$/, ""))
      .sort();
    const generatedIds = readdirSync(generatedDir)
      .filter((entry) => entry.endsWith(".ts"))
      // Transient studio deploys are excluded on BOTH sides: the studio writes
      // `studio-current.config.json` + its generated entrypoint during runs,
      // and the guard must not depend on whether a run happened recently.
      .filter((entry) => !TRANSIENT_STUDIO_CONFIGS.has(entry.replace(/\.ts$/, ".config.json")))
      .map((entry) => entry.replace(/\.ts$/, ""))
      .sort();

    expect(generatedIds).toEqual(configIds);

    for (const id of configIds) {
      const rawConfig = JSON.parse(
        readFileSync(join(configsDir, `${id}.config.json`), "utf8")
      ) as unknown;
      const mapConfig = validateCanonicalMapConfig({
        fileName: `${id}.config.json`,
        raw: rawConfig,
        recipeSchema: deriveRecipeConfigSchema(STANDARD_STAGES),
        stages: STANDARD_STAGES,
      });
      const expectedConfigHash = configHashFor(mapConfig);
      const expectedEnvelopeHash = envelopeHashFor(mapConfig, expectedConfigHash);
      const source = readFileSync(join(generatedDir, `${id}.ts`), "utf8");
      expect(source, `${id} imports canonical source config`).toContain(
        `../configs/${id}.config.json`
      );
      expect(source, `${id} uses canonical public config envelope`).toContain(
        "canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)"
      );
      expect(source, `${id} records sourceConfigId`).toContain(
        `sourceConfigId: ${JSON.stringify(id)}`
      );
      expect(source, `${id} records configHash`).toContain(
        `configHash: ${JSON.stringify(expectedConfigHash)}`
      );
      expect(source, `${id} records envelopeHash`).toContain(
        `envelopeHash: ${JSON.stringify(expectedEnvelopeHash)}`
      );
      expect(createMapConfigExpression(source, id), `${id} createMap config source`).toBe(
        "canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)"
      );
      expect(
        [...source.matchAll(/(?:^|[,{]\s*)config\s*:/gm)],
        `${id} has only the SDK createMap config property`
      ).toHaveLength(1);
      expect(source, `${id} does not inline raw placement envelopes`).not.toContain(
        "derive-placement-inputs"
      );
      expect(source, `${id} does not inline raw op envelopes`).not.toContain('"strategy"');
      expect(source, `${id} does not inline raw op envelopes`).not.toContain('"config"');
      expect(source, `${id} does not inline raw op envelopes`).not.toMatch(
        /(?:^|[,{]\s*)strategy\s*:/m
      );
    }
  });

  it("keeps transient studio-current out of shipped map catalog artifacts", () => {
    const artifactPaths = [
      "../../mod/config/config.xml",
      "../../mod/swooper-maps.modinfo",
      "../../mod/text/en_us/MapText.xml",
    ];

    for (const artifactPath of artifactPaths) {
      const source = readFileSync(join(import.meta.dir, artifactPath), "utf8");
      expect(source, artifactPath).not.toContain("studio-current");
      expect(source, artifactPath).not.toContain("STUDIO_CURRENT");
    }
  });
});
