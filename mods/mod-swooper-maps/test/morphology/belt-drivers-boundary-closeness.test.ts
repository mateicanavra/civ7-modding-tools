import { describe, expect, it } from "bun:test";

import { deriveBeltDriversFromHistory } from "../../src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.js";

function buildHistoryTiles(width: number, height: number, eraCount: number) {
  const size = width * height;
  const perEra = Array.from({ length: eraCount }, () => ({
    boundaryType: new Uint8Array(size),
    upliftPotential: new Uint8Array(size),
    riftPotential: new Uint8Array(size),
    shearStress: new Uint8Array(size),
    volcanism: new Uint8Array(size),
    fracture: new Uint8Array(size),
  }));
  const rollups = {
    upliftTotal: new Uint8Array(size),
    fractureTotal: new Uint8Array(size),
    volcanismTotal: new Uint8Array(size),
    upliftRecentFraction: new Uint8Array(size),
    lastActiveEra: new Uint8Array(size),
  };
  rollups.lastActiveEra.fill(255);
  return { version: 1, eraCount, perEra, rollups };
}

function buildProvenanceTiles(width: number, height: number) {
  const size = width * height;
  const provenance = {
    version: 1,
    originEra: new Uint8Array(size),
    originPlateId: new Int16Array(size),
    driftDistance: new Uint8Array(size),
    lastBoundaryEra: new Uint8Array(size),
    lastBoundaryType: new Uint8Array(size),
  };
  provenance.lastBoundaryEra.fill(255);
  provenance.lastBoundaryType.fill(255);
  provenance.originPlateId.fill(-1);
  return provenance;
}

describe("belt drivers: boundaryCloseness semantics", () => {
  it("boundaryCloseness is pure proximity (seed tile is near-255 even when intensity is low)", () => {
    const width = 12;
    const height = 1;
    const historyTiles = buildHistoryTiles(width, height, 3);
    const provenanceTiles = buildProvenanceTiles(width, height);

    const era = historyTiles.perEra[2]!;
    // Make a small convergent corridor that survives MIN_BELT_LENGTH.
    for (let i = 3; i <= 8; i++) {
      era.boundaryType[i] = 1;
      historyTiles.rollups.lastActiveEra[i] = 2;
      // Ensure boundary type is recoverable even when intensity is localized and the "best era"
      // chooser would otherwise pick an all-zero era for boundaryType.
      provenanceTiles.lastBoundaryType[i] = 1;
      provenanceTiles.lastBoundaryEra[i] = 2;
    }

    // Give intensity only at a single seed tile (not max).
    const seedIdx = 5;
    era.upliftPotential[seedIdx] = 64;
    historyTiles.rollups.upliftTotal[seedIdx] = 64;

    const drivers = deriveBeltDriversFromHistory({ width, height, historyTiles, provenanceTiles });

    expect(drivers.beltMask[seedIdx]).toBe(1);
    expect(drivers.boundaryCloseness[seedIdx]).toBeGreaterThanOrEqual(240);
    // Ensure we're not accidentally scaling closeness by intensity.
    expect(drivers.boundaryCloseness[seedIdx]).toBeGreaterThan(64);
  });
});
