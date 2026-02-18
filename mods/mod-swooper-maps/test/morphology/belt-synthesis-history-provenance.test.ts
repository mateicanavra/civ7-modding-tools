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

    // Declare a boundary corridor, but shape intensity so we get stable, deterministic seed peaks.
    for (let i = 4; i <= 11; i++) {
      era.boundaryType[i] = 1;
      historyTiles.rollups.lastActiveEra[i] = 2;
    }
    era.upliftPotential[6] = 180;
    era.upliftPotential[8] = 220;
    era.upliftPotential[10] = 190;

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });

    // Belts are seeded from a sparse spine, but proximity influence should still reach
    // corridor-adjacent tiles. Ensure we're not collapsing into "no belts" behavior.
    expect(sumMask(drivers.beltMask)).toBeGreaterThan(0);
    expect(drivers.boundaryCloseness[8]).toBeGreaterThan(200);
    expect(drivers.boundaryCloseness[7]).toBeGreaterThan(0);
    expect(drivers.boundaryCloseness[0]).toBe(0);
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
      historyTiles.rollups.lastActiveEra[i] = 2;
      historyTiles.rollups.upliftRecentFraction[i] = 255;
    }
    for (let i = 16; i <= 21; i++) {
      era.boundaryType[i] = 1;
      historyTiles.rollups.lastActiveEra[i] = 2;
      historyTiles.rollups.upliftRecentFraction[i] = 0;
    }
    // Two peaked sources so both segments seed deterministically.
    era.upliftPotential[4] = 220;
    era.upliftPotential[18] = 220;

    const drivers = deriveBeltDriversFromHistory({
      width,
      height,
      historyTiles,
      provenanceTiles,
    });

    // Newer belts should diffuse over fewer tiles than older belts.
    const newSeed = 4;
    const oldSeed = 18;
    let newInfluence = 0;
    let oldInfluence = 0;
    for (let i = 0; i < width; i++) {
      if ((drivers.boundaryCloseness[i] ?? 0) <= 0) continue;
      if ((drivers.beltNearestSeed[i] ?? -1) === newSeed) newInfluence++;
      if ((drivers.beltNearestSeed[i] ?? -1) === oldSeed) oldInfluence++;
    }
    expect(newInfluence).toBeGreaterThan(0);
    expect(oldInfluence).toBeGreaterThan(0);
    expect(oldInfluence).toBeGreaterThan(newInfluence);
  });
});
