import { describe, expect, it } from "bun:test";
import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import ProjectionStepContract from "../../../../../src/recipes/standard/stages/foundation-projection/steps/projection.contract.js";

describe("foundation projection contracts", () => {
  it("requires tectonic provenance before projection", () => {
    expect(ProjectionStepContract.artifacts?.requires).toContain(
      foundationArtifacts.tectonicProvenance
    );
  });
});
