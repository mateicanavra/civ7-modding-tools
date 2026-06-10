import { describe, expect, it } from "vitest";

import {
  formatArtifactGroupLabel,
  formatArtifactLabel,
  parseArtifactPresentation,
  resolveArtifactGroupDomainId,
} from "../../src/features/recipeDag/artifactPresentation";

describe("recipe DAG artifact presentation", () => {
  it("uses artifact domains as icon metadata and keeps visible labels local", () => {
    expect(parseArtifactPresentation("artifact:hydrology.hydrography")).toEqual({
      id: "artifact:hydrology.hydrography",
      domainId: "hydrology",
      label: "hydrography",
    });
    expect(parseArtifactPresentation("artifact:map.hydrology.engineProjectionLakes")).toEqual({
      id: "artifact:map.hydrology.engineProjectionLakes",
      domainId: "map",
      label: "engineProjectionLakes",
    });
    expect(parseArtifactPresentation("artifact:hydrology._internal.windField")).toEqual({
      id: "artifact:hydrology._internal.windField",
      domainId: "hydrology",
      label: "windField",
    });
    expect(formatArtifactLabel("artifact:hydrology.hydrography")).toBe("hydrography");
    expect(formatArtifactLabel("seed-grid")).toBe("seed-grid");
    expect(formatArtifactGroupLabel(["artifact:hydrology.hydrography", "artifact:hydrology.lakePlan"])).toBe("hydrography +1");
    expect(resolveArtifactGroupDomainId(["artifact:hydrology.hydrography", "artifact:hydrology.lakePlan"])).toBe("hydrology");
    expect(resolveArtifactGroupDomainId(["artifact:hydrology.hydrography", "artifact:ecology.biomes"])).toBeNull();
  });
});
