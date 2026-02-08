import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";

import { standardConfig } from "../support/standard-config.js";

type CompatLedgerV1 = Readonly<{
  version: 1;
  stageIds: Readonly<{ truth: string; projection: string }>;
  stepIds: Readonly<{ ecology: readonly string[]; mapEcology: readonly string[] }>;
  artifactIds: Readonly<{ ecology: readonly string[] }>;
  vizKeysFixture: Readonly<{ version: 1; path: string }>;
  determinismLabels: readonly string[];
}>;

function readLines(text: string): string[] {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

describe("M2 contract freeze: ecology compatibility ledger (v1)", () => {
  it("pins step ids, artifact ids, viz inventory fixture, and determinism labels", () => {
    const ledger = JSON.parse(
      readFileSync(new URL("../fixtures/ecology-compat/ecology-compat-ledger.v1.json", import.meta.url), "utf8")
    ) as CompatLedgerV1;

    expect(ledger.version).toBe(1);
    expect(ledger.stageIds).toEqual({ truth: "ecology", projection: "map-ecology" });

    const env = {
      seed: 1337,
      dimensions: { width: 32, height: 20 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    } as const;

    const plan = standardRecipe.compile(env, standardConfig);
    const allStepIds = plan.nodes.map((node: any) => String(node.stepId));

    const ecologyStepIds = allStepIds.filter((id) => id.startsWith("mod-swooper-maps.standard.ecology."));
    const mapEcologyStepIds = allStepIds.filter((id) => id.startsWith("mod-swooper-maps.standard.map-ecology."));

    expect(ecologyStepIds).toEqual([...ledger.stepIds.ecology]);
    expect(mapEcologyStepIds).toEqual([...ledger.stepIds.mapEcology]);

    const actualArtifactIds = [
      ecologyArtifacts.pedology.id,
      ecologyArtifacts.resourceBasins.id,
      ecologyArtifacts.biomeClassification.id,
      ecologyArtifacts.featureIntents.id,
    ];
    expect(actualArtifactIds).toEqual([...ledger.artifactIds.ecology]);

    // The ledger stores paths relative to the package root (mods/mod-swooper-maps/).
    const vizKeysText = readFileSync(new URL(`../../${ledger.vizKeysFixture.path}`, import.meta.url), "utf8");
    const vizKeys = readLines(vizKeysText);
    expect(vizKeys.length).toBeGreaterThan(0);

    const featuresPlanText = readFileSync(
      new URL("../../src/recipes/standard/stages/ecology/steps/features-plan/index.ts", import.meta.url),
      "utf8"
    );
    const plotEffectsInputsText = readFileSync(
      new URL("../../src/recipes/standard/stages/map-ecology/steps/plot-effects/inputs.ts", import.meta.url),
      "utf8"
    );

    for (const label of ledger.determinismLabels) {
      const present = featuresPlanText.includes(label) || plotEffectsInputsText.includes(label);
      expect(present).toBe(true);
    }
  });
});
