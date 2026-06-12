import { describe, expect, it } from "vitest";

import { formatArtifactGroupLabel, formatArtifactLabel } from "../../src/features/recipeDag/artifactPresentation";

describe("recipe DAG artifact presentation", () => {
  it("removes the artifact tag prefix from visible labels without changing grouping counts", () => {
    expect(formatArtifactLabel("artifact:hydrology.hydrography")).toBe("hydrology.hydrography");
    expect(formatArtifactLabel("seed-grid")).toBe("seed-grid");
    expect(formatArtifactGroupLabel(["artifact:hydrology.hydrography", "artifact:hydrology.lakePlan"])).toBe("hydrology.hydrography +1");
  });
});
