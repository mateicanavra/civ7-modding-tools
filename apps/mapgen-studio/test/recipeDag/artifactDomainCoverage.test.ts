import { parseArtifactPresentation } from "@swooper/mapgen-studio-ui";
import { describe, expect, it } from "vitest";
import { getRecipeDagId } from "../../src/recipes/catalog";
import { createRecipeDagService } from "../../src/server/recipeDag/service";

// APP-SIDE half of the recipe DAG artifact-presentation coverage (B5 split):
// the pure parser/formatter unit tests moved to the package with the module
// (packages/mapgen-studio-ui/test/artifactPresentation.test.ts); this corpus
// contract test stays here because it pairs the APP's DAG service (the live
// bundled standard recipe) with the package's public parser — a new artifact
// added to the recipe without a semantic domain mapping fails HERE.

describe("recipe DAG artifact domain coverage", () => {
  it("classifies every bundled standard recipe artifact into a semantic icon domain", async () => {
    const recipeDagId = getRecipeDagId("standard");
    expect(recipeDagId).toBe("mod-swooper-maps/standard");
    const dag = await createRecipeDagService().getRecipeDag(recipeDagId);
    const artifactIds = new Set<string>();
    for (const stage of dag.stages) {
      for (const artifact of stage.artifactRequires) artifactIds.add(artifact.id);
      for (const artifact of stage.artifactProvides) artifactIds.add(artifact.id);
    }

    expect(artifactIds.size).toBeGreaterThan(60);
    const generic = Array.from(artifactIds)
      .map((id) => parseArtifactPresentation(id))
      .filter((artifact) => !artifact.domainId || artifact.domainId === "artifact");

    expect(generic).toEqual([]);
  }, 15_000);
});
