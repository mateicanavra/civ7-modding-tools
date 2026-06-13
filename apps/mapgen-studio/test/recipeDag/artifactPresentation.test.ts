import { describe, expect, it } from "vitest";

import {
  formatArtifactGroupLabel,
  formatArtifactLabel,
  parseArtifactPresentation,
  resolveArtifactGroupDomainId,
} from "../../src/features/recipeDag/artifactPresentation";
import { createRecipeDagService } from "../../src/server/recipeDag/service";

describe("recipe DAG artifact presentation", () => {
  it("uses artifact domains as icon metadata and keeps visible labels local", () => {
    expect(parseArtifactPresentation("artifact:hydrology.hydrography")).toEqual({
      id: "artifact:hydrology.hydrography",
      domainId: "hydrology",
      label: "hydrography",
    });
    expect(parseArtifactPresentation("artifact:map.hydrology.engineProjectionLakes")).toEqual({
      id: "artifact:map.hydrology.engineProjectionLakes",
      domainId: "hydrology",
      label: "engineProjectionLakes",
    });
    expect(parseArtifactPresentation("artifact:map.riversEngineTerrainSnapshot")).toEqual({
      id: "artifact:map.riversEngineTerrainSnapshot",
      domainId: "hydrology",
      label: "riversEngineTerrainSnapshot",
    });
    expect(parseArtifactPresentation("artifact:map.placementEngineTerrainSnapshot")).toEqual({
      id: "artifact:map.placementEngineTerrainSnapshot",
      domainId: "placement",
      label: "EngineTerrainSnapshot",
    });
    expect(parseArtifactPresentation("artifact:map.foundationPlates")).toEqual({
      id: "artifact:map.foundationPlates",
      domainId: "foundation",
      label: "Plates",
    });
    expect(parseArtifactPresentation("artifact:placementInputs")).toEqual({
      id: "artifact:placementInputs",
      domainId: "placement",
      label: "Inputs",
    });
    expect(parseArtifactPresentation("artifact:climateField")).toEqual({
      id: "artifact:climateField",
      domainId: "climate",
      label: "Field",
    });
    expect(parseArtifactPresentation("artifact:hydrology._internal.windField")).toEqual({
      id: "artifact:hydrology._internal.windField",
      domainId: "hydrology",
      label: "windField",
    });
    expect(formatArtifactLabel("artifact:hydrology.hydrography")).toBe("hydrography");
    expect(formatArtifactLabel("seed-grid")).toBe("seed-grid");
    expect(
      formatArtifactGroupLabel(["artifact:hydrology.hydrography", "artifact:hydrology.lakePlan"])
    ).toBe("hydrography +1");
    expect(
      resolveArtifactGroupDomainId([
        "artifact:hydrology.hydrography",
        "artifact:hydrology.lakePlan",
      ])
    ).toBe("hydrology");
    expect(
      resolveArtifactGroupDomainId([
        "artifact:map.hydrology.engineProjectionLakes",
        "artifact:map.riversEngineTerrainSnapshot",
      ])
    ).toBe("hydrology");
    expect(
      resolveArtifactGroupDomainId(["artifact:hydrology.hydrography", "artifact:ecology.biomes"])
    ).toBeNull();
  });

  it("classifies every bundled standard recipe artifact into a semantic icon domain", async () => {
    const dag = await createRecipeDagService().getRecipeDag("mod-swooper-maps/standard");
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
