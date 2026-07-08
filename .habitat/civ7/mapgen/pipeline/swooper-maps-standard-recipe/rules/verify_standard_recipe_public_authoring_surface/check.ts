#!/usr/bin/env bun
import { STANDARD_STAGES } from "../../../../../../../mods/mod-swooper-maps/src/recipes/standard/recipe";
import { deriveStageAuthoringModel } from "../../../../../../../packages/mapgen-core/src/authoring/index";

const STANDARD_PUBLIC_KEYS: Record<string, readonly string[]> = {
  "foundation-mantle": ["knobs", "mantleForcing", "mantleSources", "meshResolution"],
  "foundation-lithosphere": ["knobs", "lithosphere", "platePartition"],
  "foundation-tectonics": [
    "knobs",
    "plateMotion",
    "tectonicEras",
    "tectonicFields",
    "tectonicRollups",
    "tectonicSegmentation",
  ],
  "foundation-orogeny": ["knobs", "crustCharacter"],
  "foundation-projection": ["knobs"],
  "morphology-coasts": [
    "knobs",
    "substrate",
    "relief",
    "continentalMargin",
    "waterCoverage",
    "continents",
    "coastlineShape",
  ],
  "morphology-routing": ["knobs"],
  "morphology-erosion": ["knobs", "geomorphicCycle"],
  "morphology-features": ["knobs", "islandChains", "mountainRanges", "volcanoes"],
  "morphology-shelf": ["knobs", "shelf"],
  "hydrology-climate-baseline": [
    "atmosphericCirculation",
    "evaporation",
    "knobs",
    "moistureTransport",
    "oceanCurrents",
    "oceanGeometry",
    "oceanThermalState",
    "precipitation",
    "seasonalCycle",
    "solarForcing",
    "thermalState",
  ],
  "hydrology-hydrography": ["drainageRouting", "knobs", "lakes", "riverNetwork", "runoff"],
  "hydrology-climate-refine": [
    "albedoFeedback",
    "cryosphereState",
    "diagnostics",
    "knobs",
    "landWaterBudget",
    "precipitationRefinement",
    "solarForcing",
    "thermalState",
  ],
  "ecology-pedology": [
    "knobs",
    "resourceBasinPlanning",
    "resourceBasinScoring",
    "soilClassification",
  ],
  "ecology-biomes": ["biomeClassification", "knobs"],
  "map-morphology": ["knobs"],
  "map-hydrology": ["knobs"],
  "map-elevation": ["knobs"],
  "map-rivers": ["knobs"],
  "ecology-features": [
    "floodplainPlanning",
    "icePlanning",
    "iceScoring",
    "knobs",
    "plotEffectCoverage",
    "plotEffectScoring",
    "reefPlanning",
    "reefScoring",
    "substrateScoring",
    "vegetationPlanning",
    "wetlandPlanning",
    "wetlandScoring",
  ],
  "map-ecology": ["biomeBindings", "knobs"],
  placement: ["knobs", "naturalWonders", "resources", "starts", "support"],
};

const failures: string[] = [];

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
    return Array.isArray(value)
      ? value.flatMap((item, index) => collectRawEnvelopePaths(item, [...path, String(index)]))
      : [];
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
    return Array.isArray(value)
      ? value.flatMap((item, index) => collectOpenObjectSchemaPaths(item, [...path, String(index)]))
      : [];
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

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

const stageIds = STANDARD_STAGES.map((stage: { id: string }) => stage.id);
const expectedStageIds = Object.keys(STANDARD_PUBLIC_KEYS);
if (!sameSet(stageIds, expectedStageIds)) {
  failures.push(
    `standard stage ids differ: ${JSON.stringify(stageIds)} !== ${JSON.stringify(expectedStageIds)}`
  );
}

for (const stage of STANDARD_STAGES) {
  const expectedKeys = STANDARD_PUBLIC_KEYS[stage.id];
  if (!expectedKeys) {
    failures.push(`${stage.id}: missing expected public key list`);
    continue;
  }

  const authoring = deriveStageAuthoringModel(stage);
  const hasPublic = Boolean((stage as { public?: unknown }).public);
  const expectedLayer = hasPublic ? "semantic-public-config" : "internal-step-config";
  if (authoring.config.layer !== expectedLayer) {
    failures.push(`${stage.id}: expected ${expectedLayer}, got ${authoring.config.layer}`);
  }
  if (
    (authoring.config.schema as { additionalProperties?: unknown }).additionalProperties !== false
  ) {
    failures.push(`${stage.id}: public config schema must be strict`);
  }

  const actualKeys = Object.keys(schemaProperties(authoring.config.schema)).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  if (!sameSet(actualKeys, sortedExpectedKeys)) {
    failures.push(
      `${stage.id}: public keys ${JSON.stringify(actualKeys)} !== ${JSON.stringify(sortedExpectedKeys)}`
    );
  }

  const openObjects = collectOpenObjectSchemaPaths(authoring.config.schema);
  if (openObjects.length > 0) {
    failures.push(`${stage.id}: open object schema paths: ${openObjects.join(", ")}`);
  }

  const rawEnvelopes = hasPublic ? collectRawEnvelopePaths(authoring.config.schema) : [];
  if (rawEnvelopes.length > 0) {
    failures.push(`${stage.id}: raw op envelopes surfaced at: ${rawEnvelopes.join(", ")}`);
  }

  for (const step of authoring.runtime.steps) {
    const focusPath = authoring.config.focusPathsByStepId[step.stepId] ?? [];
    if (focusPath.includes("strategy") || focusPath.includes("config")) {
      failures.push(
        `${stage.id}.${step.stepId}: focus path bypasses public config (${focusPath.join(".")})`
      );
    }
    if (focusPath.length > 0) {
      try {
        getAtSchemaPath(authoring.config.schema, focusPath);
      } catch (error) {
        failures.push(`${stage.id}.${step.stepId}: ${(error as Error).message}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
