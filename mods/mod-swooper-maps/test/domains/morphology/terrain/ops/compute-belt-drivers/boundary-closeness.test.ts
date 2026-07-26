import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/router";
import { createBeltDriverEvidence } from "./fixtures/belt-driver-evidence.js";

const { computeBeltDrivers } = morphologyDomain.terrain.ops;

describe("belt drivers: boundaryCloseness semantics", () => {
  it("boundaryCloseness is pure proximity (seed tile is near-255 even when intensity is low)", () => {
    const syntheticDimensions = { width: 12, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const { historyTiles, provenanceTiles } = createBeltDriverEvidence(width, height, 3);

    const era = historyTiles.perEra[2]!;
    // Make a small convergent corridor that survives MIN_BELT_LENGTH.
    for (let i = 3; i <= 8; i++) {
      era.boundaryType[i] = 1;
      historyTiles.rollups.lastActiveEra[i] = 2;
      // Ensure boundary type is recoverable even when intensity is localized and the "best era"
      // chooser would otherwise pick an all-zero era for boundaryType.
      provenanceTiles.lastBoundaryType[i] = 1;
    }

    // Give intensity only at a single seed tile (not max).
    const seedIdx = 5;
    era.upliftPotential[seedIdx] = 64;
    historyTiles.rollups.upliftTotal[seedIdx] = 64;

    const drivers = computeBeltDrivers.run(
      { width, height, historyTiles, provenanceTiles },
      computeBeltDrivers.defaultConfig
    );

    expect(drivers.beltMask[seedIdx]).toBe(1);
    expect(drivers.boundaryCloseness[seedIdx]).toBeGreaterThanOrEqual(240);
    // Ensure we're not accidentally scaling closeness by intensity.
    expect(drivers.boundaryCloseness[seedIdx]).toBeGreaterThan(64);
  });
});
