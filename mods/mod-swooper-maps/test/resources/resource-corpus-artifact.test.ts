import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import {
  ResourceCorpusArtifactSchema,
  resourceCorpusArtifact,
} from "../../src/domain/resources/artifacts/contract/corpus.contract.js";
import { OFFICIAL_RESOURCE_CORPUS_ARTIFACT } from "../../src/domain/resources/index.js";

describe("resources corpus artifact", () => {
  it("declares the resource-owned corpus artifact id without creating a stage shell", () => {
    expect(resourceCorpusArtifact.id).toBe("artifact:resources.corpus");
    expect(resourceCorpusArtifact.name).toBe("resourceCorpus");
  });

  it("publishes a corpus artifact with explicit static/runtime identity boundaries", () => {
    const artifact = OFFICIAL_RESOURCE_CORPUS_ARTIFACT;

    expect(artifact.source.authority).toBe("civ7-official-resources");
    expect(artifact.source.order).toBe("base-standard.modinfo Resources row order");
    expect(artifact.source.runtimeIdStatus).toBe("unverified");
    expect(artifact.resources).toHaveLength(55);
    expect(artifact.resources.every((entry) => entry.runtimeId.status === "unverified")).toBe(true);
    expect(
      artifact.resources.every(
        (entry) =>
          entry.staticSource.table === "Resources" &&
          entry.placeability.status.length > 0 &&
          entry.strategyRequired.status.length > 0
      )
    ).toBe(true);
  });

  it("rejects runtime id overclaims at the artifact schema boundary", () => {
    const invalid = {
      ...OFFICIAL_RESOURCE_CORPUS_ARTIFACT,
      resources: [
        {
          ...OFFICIAL_RESOURCE_CORPUS_ARTIFACT.resources[0]!,
          runtimeId: {
            status: "verified",
            value: OFFICIAL_RESOURCE_CORPUS_ARTIFACT.resources[0]!.staticResourceRowSlot,
            evidence: [],
            verifiedResourceType: OFFICIAL_RESOURCE_CORPUS_ARTIFACT.resources[0]!.resourceType,
          },
        },
      ],
    };

    expect(Value.Check(ResourceCorpusArtifactSchema, OFFICIAL_RESOURCE_CORPUS_ARTIFACT)).toBe(true);
    expect(Value.Check(ResourceCorpusArtifactSchema, invalid)).toBe(false);
  });
});
