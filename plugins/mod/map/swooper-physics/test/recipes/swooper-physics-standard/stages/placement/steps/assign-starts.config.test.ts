import { describe, expect, it } from "bun:test";
import { admitMapSetup } from "@swooper/mapgen-core";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";
import stage from "../../../../../../src/recipes/standard/stages/placement/index.js";
import { AssignStartsStep } from "../../../../../../src/recipes/standard/stages/placement/steps/assign-starts/step.js";
import { standardMapConfig } from "../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: 1337,
  dimensions: { width: 84, height: 54 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
});

describe("shared start-resource requirements", () => {
  it("forwards the support owner's actual values without adding another author-facing knob", () => {
    const authored = structuredClone(standardMapConfig.config.placement);
    authored["adjust-resources"].support.config.supportFloor = 3;
    authored["adjust-resources"].support.config.supportRadiusTiles = 6;
    authored["adjust-resources"].support.config.equityTolerance = 1;
    const admitted = validateSchemaValueForTest(stage.surfaceSchema, authored, "/placement");
    const { rawSteps } = stage.toInternal({ setup, stageConfig: admitted });
    const starts = validateSchemaValueForTest(
      AssignStartsStep.contract.schema,
      rawSteps["assign-starts"],
      "/assign-starts"
    );

    expect(starts.supportRequirements).toEqual({
      supportFloor: 3,
      supportRadiusTiles: 6,
      equityTolerance: 1,
    });
    expect(starts.starts).toEqual(authored["assign-starts"].starts);
    expect(rawSteps["adjust-resources"]).toEqual(authored["adjust-resources"]);
    expect(
      Value.Check(stage.surfaceSchema, {
        ...authored,
        "assign-starts": {
          ...authored["assign-starts"],
          supportRequirements: starts.supportRequirements,
        },
      })
    ).toBe(false);
  });
});
