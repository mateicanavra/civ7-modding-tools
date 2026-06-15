import { describe, expect, it } from "bun:test";

import { standardStageContractManifest } from "../../src/recipes/standard/contract-manifest.js";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe.js";

function stageStepIds(stage: { steps: readonly { contract: { id: string } }[] }): string[] {
  return stage.steps.map((step) => step.contract.id);
}

describe("Standard recipe contract manifest", () => {
  it("is the single contract-order source for runtime stages and Studio recipe-DAG metadata", () => {
    expect(STANDARD_STAGES.map((stage) => stage.id)).toEqual(
      standardStageContractManifest.map((stage) => stage.id)
    );

    for (const stage of STANDARD_STAGES) {
      const manifestStage = standardStageContractManifest.find(
        (candidate) => candidate.id === stage.id
      );
      expect(manifestStage).toBeDefined();
      expect(stageStepIds(stage)).toEqual(stageStepIds(manifestStage!));
    }
  });
});
