import { describe, expect, it } from "vitest";

import {
  formatArtifactGroupLabel,
  formatArtifactLabel,
  parseArtifactPresentation,
  resolveArtifactGroupDomainId,
} from "../src/components/panels/recipe-dag/artifactPresentation.js";

// The bundled-recipe corpus classification test (every artifact id the app's
// DAG service serves classifies into a semantic icon domain) STAYS app-side —
// apps/mapgen-studio/test/recipeDag/artifactDomainCoverage.test.ts — because
// it pairs `createRecipeDagService` (app server code) with the package's
// public `parseArtifactPresentation`.

describe("recipe DAG artifact presentation", () => {
  it("uses artifact domains as icon metadata and keeps visible labels local", () => {
    expect(parseArtifactPresentation("artifact:hydrology.hydrography")).toEqual({
      id: "artifact:hydrology.hydrography",
      domainId: "hydrology",
      label: "hydrography",
    });
    expect(parseArtifactPresentation("artifact:hydrology.lakePlan")).toEqual({
      id: "artifact:hydrology.lakePlan",
      domainId: "hydrology",
      label: "lakePlan",
    });
    expect(parseArtifactPresentation("artifact:map.rivers.projectedNavigableRivers")).toEqual({
      id: "artifact:map.rivers.projectedNavigableRivers",
      domainId: "hydrology",
      label: "projectedNavigableRivers",
    });
    expect(parseArtifactPresentation("artifact:foundation.plates")).toEqual({
      id: "artifact:foundation.plates",
      domainId: "foundation",
      label: "plates",
    });
    expect(parseArtifactPresentation("artifact:placement.naturalWonderPlan")).toEqual({
      id: "artifact:placement.naturalWonderPlan",
      domainId: "placement",
      label: "naturalWonderPlan",
    });
    expect(parseArtifactPresentation("artifact:hydrology.climateField")).toEqual({
      id: "artifact:hydrology.climateField",
      domainId: "hydrology",
      label: "climateField",
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
        "artifact:hydrology.lakePlan",
        "artifact:map.rivers.projectedNavigableRivers",
      ])
    ).toBe("hydrology");
    expect(
      resolveArtifactGroupDomainId([
        "artifact:hydrology.hydrography",
        "artifact:ecology.biomeClassification",
      ])
    ).toBeNull();
  });
});
