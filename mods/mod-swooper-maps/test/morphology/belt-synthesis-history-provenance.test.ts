import { describe, it, expect } from "bun:test";

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
  return {
    version: 1,
    eraCount,
    perEra,
    rollups,
  };
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

function sumMask(mask: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] === 1) count++;
  return count;
}

describe("morphology belt synthesis (history + provenance)", () => {
  it("noise-only inputs cannot create belts", () => {
    const width = 12;
    const height = 1;
    const historyTiles = buildHistoryTiles(width, height, 3);
    const provenanceTiles = buildProvenanceTiles(width, height);

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });

    expect(sumMask(drivers.beltMask)).toBe(0);
    expect(Array.from(drivers.boundaryCloseness)).toEqual(Array(width * height).fill(0));
    expect(Array.from(drivers.upliftPotential)).toEqual(Array(width * height).fill(0));
  });

  it("belt corridors remain contiguous under gap filling", () => {
    const width = 20;
    const height = 1;
    const historyTiles = buildHistoryTiles(width, height, 3);
    const provenanceTiles = buildProvenanceTiles(width, height);
    const era = historyTiles.perEra[2]!;

    for (let i = 4; i <= 11; i++) {
      era.boundaryType[i] = 1;
      era.upliftPotential[i] = 220;
      historyTiles.rollups.lastActiveEra[i] = 2;
    }

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });

    let longestRun = 0;
    let current = 0;
    for (let i = 0; i < width; i++) {
      if (drivers.beltMask[i] === 1) {
        current += 1;
        longestRun = Math.max(longestRun, current);
      } else {
        current = 0;
      }
    }

    expect(longestRun).toBeGreaterThanOrEqual(8);
  });

  it("diffusion seeds only from positive-intensity sources (zero-intensity belt tiles do not suppress seeding)", () => {
    const width = 20;
    const height = 1;
    const historyTiles = buildHistoryTiles(width, height, 3);
    const provenanceTiles = buildProvenanceTiles(width, height);
    const era = historyTiles.perEra[2]!;

    // Declare a long convergent boundary corridor with intensity only on an interior segment.
    // Gap-fill produces a beltMask corridor that includes some boundaryType tiles with zero intensity.
    // Those zero-intensity belt tiles must not become diffusion "seeds" (otherwise they can suppress
    // influence by becoming the nearest seed with intensity=0).
    for (let i = 4; i <= 14; i++) {
      era.boundaryType[i] = 1;
      historyTiles.rollups.lastActiveEra[i] = 2;
    }
    for (let i = 6; i <= 12; i++) {
      era.upliftPotential[i] = 220;
    }

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });

    // Belt exists (component length >= MIN_BELT_LENGTH), so tiles near the corridor should receive influence.
    expect(sumMask(drivers.beltMask)).toBeGreaterThan(0);
    expect(drivers.beltMask[4]).toBe(1);
    expect(drivers.boundaryCloseness[4]).toBeGreaterThan(0);
    expect(drivers.boundaryCloseness[0]).toBe(0);
  });

  it("older belts diffuse wider than newer belts", () => {
    const width = 24;
    const height = 1;
    const historyTiles = buildHistoryTiles(width, height, 3);
    const provenanceTiles = buildProvenanceTiles(width, height);
    const era = historyTiles.perEra[2]!;

    for (let i = 2; i <= 7; i++) {
      era.boundaryType[i] = 1;
      era.upliftPotential[i] = 220;
      historyTiles.rollups.lastActiveEra[i] = 2;
      historyTiles.rollups.upliftRecentFraction[i] = 255;
    }
    for (let i = 16; i <= 21; i++) {
      era.boundaryType[i] = 1;
      era.upliftPotential[i] = 220;
      historyTiles.rollups.lastActiveEra[i] = 2;
      historyTiles.rollups.upliftRecentFraction[i] = 0;
    }

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });

    const nearNew = 9;
    const nearOld = 14;
    expect(drivers.beltNearestSeed[nearNew]).not.toBe(-1);
    expect(drivers.beltNearestSeed[nearOld]).not.toBe(-1);
    expect(drivers.boundaryCloseness[nearOld]).toBeGreaterThan(drivers.boundaryCloseness[nearNew]);
    expect(drivers.boundaryCloseness[nearOld]).toBeGreaterThan(0);
    expect(drivers.boundaryCloseness[nearNew]).toBeGreaterThan(0);
  });
});
